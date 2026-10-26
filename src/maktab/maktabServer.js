// REV173: maktab til natijalari serverga (ota-ona ko'radi, sinfdoshlar orasida o'rin). Ixtiyoriy: server javob bermasa — jim.
import { kunBelgila } from "./kunReja.js";
import { kundalikYoz } from "./kundalikRules.js";

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

// REV174: o'quvchi faolligi (ota-ona «Bugun / shu hafta»da ko'radi) va ota-ona bergan topshiriqlar
export const TIL_NOMI = { en: "Ingliz tili", ru: "Rus tili", de: "Nemis tili", fr: "Fransuz tili", es: "Ispan tili", ar: "Arab tili", tr: "Turk tili", zh: "Xitoy tili", ja: "Yapon tili", ko: "Koreys tili" };
async function post(apiBase, token, path, body) {
  if (!token) return null;
  try {
    const res = await fetch(`${base(apiBase)}${path}`, {
      method: "POST", keepalive: true, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ token, ...body }),
    });
    return res.ok ? await res.json().catch(() => ({})) : null;
  } catch { return null; }
}
/** turi: "dars" | "til" | "repetitor" | "topshiriq"; kod — shu faoliyatning kaliti (bir kunda bir xil kod — bitta yozuv yangilanadi). */
export function faollikYoz(apiBase, token, { turi, kod, fan = "", til = "", mavzu = "", togri = 0, jami = 0, yozdi = 0, soniya = 0, sozlar = [] }) {
  kunBelgila(turi, String(kod || ""), undefined, undefined, String(fan || ""));   // REV177: kun rejasi uchun (internet bo'lmasa ham)
  kundalikYoz({ turi, kod: String(kod || ""), fan, til, mavzu, togri, jami, yozdi, soniya });   // REV180: fan kundaligi
  const n = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  const j = n(jami, 500);
  return post(apiBase, token, "/api/maktab/faollik", {
    turi, kod: String(kod || "").slice(0, 120), fan: String(fan || "").slice(0, 120), til, mavzu: String(mavzu || "").slice(0, 200),
    togri: Math.min(n(togri, 500), j), jami: j, yozdi: n(yozdi, 2000), soniya: n(soniya, 4 * 3600), sozlar: [...new Set(sozlar)].slice(0, 60),
  });
}
export async function topshiriqlarOl(apiBase, token, til = "") {
  if (!token) return [];
  try {
    const res = await fetch(`${base(apiBase)}/api/maktab/topshiriqlar?${new URLSearchParams({ til })}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = res.ok ? await res.json().catch(() => null) : null;
    return Array.isArray(d?.topshiriqlar) ? d.topshiriqlar : [];
  } catch { return []; }
}
export const topshiriqBajardi = (apiBase, token, id, { togri = 0, jami = 0, yozdi = 0 } = {}) => post(apiBase, token, "/api/maktab/topshiriq/bajardi", { id, togri, jami, yozdi });

// REV177: kun rejasi — o'quvchi o'zinikini oladi, ota-ona o'zgartiradi
export async function rejaOl(apiBase, token) {
  if (!token) return null;
  try {
    const res = await fetch(`${base(apiBase)}/api/maktab/reja`, { headers: { Authorization: `Bearer ${token}` } });
    return res.ok ? await res.json().catch(() => null) : null;
  } catch { return null; }
}
export const rejaSaqla = (apiBase, token, bolaId, reja) => post(apiBase, token, "/api/ota/maktab/reja", { bola_id: bolaId, ...reja });

// REV180: o'quvchining o'z kundaligi (serverdan — boshqa qurilmada qilinganlari ham)
export async function kundalikOlServer(apiBase, token, fan = "") {
  if (!token) return [];
  try {
    const res = await fetch(`${base(apiBase)}/api/maktab/kundalik?${new URLSearchParams({ fan, kun: "90" })}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = res.ok ? await res.json().catch(() => null) : null;
    return Array.isArray(d?.kundalik) ? d.kundalik : [];
  } catch { return []; }
}
