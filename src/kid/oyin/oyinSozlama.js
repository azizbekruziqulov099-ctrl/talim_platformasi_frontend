// REV364: admin o'yin sozlamasi (server): { id: { holat: "ok" | "tuzat" | "yopiq", izoh } }. «yopiq» o'yin bolalarga chiqmaydi.
let kesh = null, vada = null;
export function oyinSozlamaYukla(apiBase = "") {
  if (kesh) return Promise.resolve(kesh);
  if (!vada) vada = fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/oyin_sozlama`).then((r) => (r.ok ? r.json() : { oyinlar: {} }))
    .then((d) => (kesh = d.oyinlar || {})).catch(() => (kesh = {}));
  return vada;
}
export const oyinYopiqmi = (id) => Boolean(kesh && kesh[String(id)]?.holat === "yopiq");
export function oyinSozlamaYangila(id, qiymat) { kesh = { ...(kesh || {}), [String(id)]: { ...(kesh?.[String(id)] || {}), ...qiymat } }; }
export async function oyinSozlamaYoz(apiBase, token, id, holat, izoh = "") {
  const r = await fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/admin/oyin_sozlama`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, oyin_id: Number(id), holat, izoh }) });
  if (!r.ok) throw new Error(`Saqlanmadi (${r.status})`);
  oyinSozlamaYangila(id, { holat, izoh });
  return true;
}
