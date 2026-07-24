-- 정니의 건축사 공부 플래너 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 한 번 실행해주세요.

create extension if not exists "pgcrypto";

-- 1) 내가 해야할 공부들 리스트 (마스터 목록)
-- subject: 과목 태그 ('구조' | '단면' | null=미지정)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  subject text,
  created_at timestamptz not null default now()
);
alter table tasks add column if not exists subject text;

-- 2) 캘린더에 배정된 항목
-- kind='study': 공부 리스트에서 고르거나 드래그해서 넣은 할일 (체크박스로 완료 표시)
-- kind='event': 날짜 칸의 +에서 직접 입력한 일정 (체크박스 없음, 날짜 칸을 회색으로 표시)
create table if not exists calendar_tasks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  text text not null,
  done boolean not null default false,
  kind text not null default 'study' check (kind in ('study', 'event')),
  created_at timestamptz not null default now()
);
create index if not exists calendar_tasks_date_idx on calendar_tasks (date);

-- 이미 calendar_tasks를 만든 적이 있다면 이 블록만 다시 실행해도 안전합니다.
alter table calendar_tasks add column if not exists kind text not null default 'study';
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'calendar_tasks_kind_check'
  ) then
    alter table calendar_tasks add constraint calendar_tasks_kind_check check (kind in ('study', 'event'));
  end if;
end $$;

-- restore_on_delete: 드래그로 리스트에서 옮겨온 항목인지 표시.
-- true인 항목을 캘린더에서 지우면 "내가 해야할 공부들 리스트"로 다시 돌아간다.
alter table calendar_tasks add column if not exists restore_on_delete boolean not null default false;

-- subject: 과목 태그 ('구조' | '단면' | null), 리스트에서 넘어온 값을 그대로 들고 있는다.
alter table calendar_tasks add column if not exists subject text;

-- 3) 오답노트 (날짜 단위)
create table if not exists wrong_notes (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  created_at timestamptz not null default now()
);
create index if not exists wrong_notes_date_idx on wrong_notes (date);

-- 4) 오답노트에 첨부된 이미지 (문제 / 내 답안 / 모범 답안, 각각 여러 장 가능)
create table if not exists wrong_note_images (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references wrong_notes (id) on delete cascade,
  kind text not null check (kind in ('problem', 'mine', 'model')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists wrong_note_images_note_idx on wrong_note_images (note_id);

-- 이미 wrong_note_images를 만든 적이 있다면 (kind에 'problem'이 없다면) 이 블록만 다시 실행해도 안전합니다.
alter table wrong_note_images drop constraint if exists wrong_note_images_kind_check;
alter table wrong_note_images add constraint wrong_note_images_kind_check check (kind in ('problem', 'mine', 'model'));

-- 개인용 단일 사용자 도구이므로 로그인 없이 anon key로 바로 읽고 쓸 수 있도록 RLS를 끕니다.
-- 나중에 로그인 기능을 추가하거나 URL을 공개적으로 공유할 계획이 있다면
-- RLS를 다시 켜고 사용자별 정책을 추가하는 것을 권장합니다.
alter table tasks disable row level security;
alter table calendar_tasks disable row level security;
alter table wrong_notes disable row level security;
alter table wrong_note_images disable row level security;

-- 오답노트 이미지를 저장할 스토리지 버킷 (공개 버킷)
insert into storage.buckets (id, name, public)
values ('wrong-note-images', 'wrong-note-images', true)
on conflict (id) do nothing;

-- 스토리지 정책: anon key로 업로드/조회/삭제를 허용합니다 (개인용 도구 기준).
-- 이미 같은 이름의 정책이 있으면 오류가 날 수 있으니, 이 블록은 처음 한 번만 실행하세요.
create policy "public read wrong-note-images"
on storage.objects for select
using (bucket_id = 'wrong-note-images');

create policy "anon insert wrong-note-images"
on storage.objects for insert
with check (bucket_id = 'wrong-note-images');

create policy "anon delete wrong-note-images"
on storage.objects for delete
using (bucket_id = 'wrong-note-images');

-- 5) 기출문제 난이도 체크 (연도/회차별로 다시 풀어야 할지 O·세모·X 로 표시)
-- 26년은 1회차만, 25~20년은 1·2회차, 19·18년은 1회차만 존재
create table if not exists exam_reviews (
  id uuid primary key default gen_random_uuid(),
  subject text not null default '단면과 구조',
  year int not null,
  round int not null,
  status text check (status in ('circle', 'triangle', 'cross')),
  updated_at timestamptz not null default now(),
  unique (subject, year, round)
);
alter table exam_reviews disable row level security;
