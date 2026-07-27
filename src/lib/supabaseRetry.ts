// Supabase 무료 플랜 프로젝트는 한동안 쉬고 있다가 깨어날 때
// PostgREST의 스키마 캐시가 아직 안 실린 상태로 "테이블/컬럼을 찾을 수 없다"는
// 오류(PGRST204/PGRST205)를 순간적으로 낼 때가 있다. 이런 경우 잠깐 기다렸다가
// 자동으로 한두 번 재시도해서 사용자가 매번 직접 다시 시도하지 않도록 한다.
type ErrorLike = { code?: string; message?: string } | null;

function isSchemaCacheError(error: ErrorLike): boolean {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "PGRST204") return true;
  return (error.message ?? "").toLowerCase().includes("schema cache");
}

export async function withRetry<T extends { error: ErrorLike }>(
  operation: () => PromiseLike<T>,
  attempts = 3,
  delayMs = 900
): Promise<T> {
  let result = await operation();
  let tries = 1;
  while (isSchemaCacheError(result.error) && tries < attempts) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await operation();
    tries++;
  }
  return result;
}
