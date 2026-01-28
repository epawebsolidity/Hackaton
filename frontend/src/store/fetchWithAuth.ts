export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token: string | null,
  sendRefreshToken: () => Promise<string | null>
) {
  const authToken = token;
  // Tentukan headers tanpa memaksa content-type
  const headers: Record<string, string> = {
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers,
  };

  // Hanya set JSON jika body bukan FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Retry jika 401
  if (res.status === 401) {
    const newToken = await sendRefreshToken();
    if (!newToken) throw new Error("Unauthorized, refresh failed");

    const retryHeaders = {
      ...(headers),
      Authorization: `Bearer ${newToken}`,
    };

    res = await fetch(url, {
      ...options,
      headers: retryHeaders,
      credentials: "include",
    });
  }

  // Jangan langsung `res.json()` kalau bukan JSON
  const contentType = res.headers.get("content-type");
  let data: any;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text(); // fallback, misal untuk FormData response plain text
  }

  return data;
}
