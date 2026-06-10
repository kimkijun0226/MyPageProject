const STORAGE_KEY = "visitor_key";

async function fetchPublicIp(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

function createFallbackKey(): string {
  const random = crypto.randomUUID();
  return `local:${random}`;
}

/** IP 기반 방문자 키 (IP 조회 실패 시 localStorage UUID fallback) */
export async function getVisitorKey(): Promise<string> {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) return cached;

  const ip = await fetchPublicIp();
  const key = ip ? `ip:${ip}` : createFallbackKey();
  localStorage.setItem(STORAGE_KEY, key);
  return key;
}
