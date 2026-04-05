interface FetchTextWithTimeoutOptions {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  headers?: HeadersInit;
}

export async function fetchTextWithTimeout(
  url: string,
  options: FetchTextWithTimeoutOptions = {},
) {
  const timeoutMs = options.timeoutMs ?? 8000;
  const fetchImpl = options.fetchImpl ?? fetch;

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetchImpl(url, {
        headers: options.headers,
        cache: 'no-store',
      }),
      timeoutPromise,
    ]);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return await response.text();
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
