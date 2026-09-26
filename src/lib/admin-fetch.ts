/**
 * adminFetch: A resilient fetch wrapper for admin portal API interactions.
 * - Enforces credentials: "include" so cookies are transmitted across all fetch calls
 * - Enforces cache: "no-store" to avoid 304 or stale cache bugs
 * - Attaches Bearer authorization token from sessionStorage as a redundant safety layer
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-cache");
  }

  if (typeof window !== "undefined") {
    try {
      const storedToken = sessionStorage.getItem("rajhans_admin_token");
      if (storedToken && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${storedToken}`);
      }
    } catch {}
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}
