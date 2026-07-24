import { createClient, SupabaseClient } from "@supabase/supabase-js";

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았어요. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 채워주세요."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

let cached: SupabaseClient | null = null;

// 실제 값이 채워지기 전에는 이 클라이언트를 생성만 해도 오류가 나므로,
// 브라우저에서 실제로 호출하는 시점까지 생성을 미룹니다 (빌드/서버 렌더링 단계에서 크래시 방지).
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!cached) cached = createSupabaseClient();
    return Reflect.get(cached as object, prop, receiver);
  },
});
