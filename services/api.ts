
export async function fetchJSON<T,>(url: string, options: { timeoutMs?: number; cache?: RequestCache } = {}): Promise<T> {
  const { timeoutMs = 12000, cache = 'no-store' } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal, cache });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
