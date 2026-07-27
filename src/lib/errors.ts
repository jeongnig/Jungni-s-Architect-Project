// Supabase가 던지는 PostgrestError/StorageError는 항상 Error의 인스턴스가 아닐 수 있어서
// (`err instanceof Error`가 false), message 필드를 직접 꺼내지 않으면 "[object Object]"로 보인다.
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
    try {
      return JSON.stringify(err);
    } catch {
      // fall through
    }
  }
  return String(err);
}
