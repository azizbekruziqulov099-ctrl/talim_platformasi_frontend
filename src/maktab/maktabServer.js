// REV173: maktab til natijalari serverga (ota-ona ko'radi, sinfdoshlar orasida o'rin). Ixtiyoriy: server javob bermasa — jim.
const base = (apiBase) => String(apiBase || "").replace(/\/+$/, "");

export async function natijaYubor(apiBase, token, body) {
  if (!token) return null;
  try {
    const res = await fetch(`${base(apiBase)}/api/maktab/natija`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ token, ...body }),
    });
    return res.ok ? await res.json().catch(() => null) : null;
  } catch { return null; }
}

/** Shu til va sinf bo'yicha o'rin: {orin, jami} (ismlar ko'rsatilmaydi) yoki null. */
export async function reytingOl(apiBase, token, til, sinf) {
  if (!token) return null;
  try {
    const q = new URLSearchParams({ til, sinf: String(sinf) });
    const res = await fetch(`${base(apiBase)}/api/maktab/reyting?${q}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = res.ok ? await res.json().catch(() => null) : null;
    return d && d.orin ? d : null;
  } catch { return null; }
}
