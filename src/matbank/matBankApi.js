// REV559: matematika banki — server so'rovlari (Authorization sarlavhasi bilan).
export async function matFetch(apiBase, token, path, { method = "GET", body, params } = {}) {
  const base = String(apiBase || "").replace(/\/+$/, ""); const q = params && Object.keys(params).length ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(`${base}${path}${q}`, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(typeof data.detail === "string" ? data.detail : "Server xatosi"); e.status = res.status; throw e; }
  return data;
}
export const SONLAR = [10, 15, 20, 30];
