export async function kindergartenApi(path, options = {}) {
  const requestUrl = new URL(
    `${options.apiBase}/api/bogcha-v2${path}`,
    window.location.origin,
  );
  const queryToken = requestUrl.searchParams.get("token");
  if (queryToken) requestUrl.searchParams.delete("token");
  const authToken = queryToken || options.body?.token || options.token;

  const response = await fetch(requestUrl.toString(), {
    method: options.method || "GET",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
    credentials: "omit",
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : detail?.message ||
          (Array.isArray(detail?.errors) ? detail.errors.join("\n") : null) ||
          "So'rovni bajarib bo'lmadi";
    const error = new Error(message);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }
  return data;
}

export function queryString(values) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}
