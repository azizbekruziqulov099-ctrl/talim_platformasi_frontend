// REV686: «Kabu oroli» holati — tanga, binolar, hamrohlar, kunlik sandiq va kunlar olovi.
// Sof funksiyalar (test qilinadi); saqlash — qurilmada (localStorage), profil bo'yicha.
export const BINOLAR = [
  { id: "uy", nom: "Uy", x: 23.5, y: 35 },
  { id: "maktab", nom: "Maktab", x: 55, y: 38 },
  { id: "kutubxona", nom: "Kutubxona", x: 27.8, y: 18.5 },
  { id: "minora", nom: "Rasadxona", x: 63, y: 19 },
  { id: "laboratoriya", nom: "Laboratoriya", x: 28, y: 53.5 },
  { id: "stadion", nom: "Stadion", x: 68.5, y: 52 },
  { id: "bozor", nom: "Bozor", x: 36, y: 68.5 },
  { id: "port", nom: "Port", x: 68.5, y: 70 },
];
export const BINO_NARXI = [60, 180, 450];          // 1-, 2-, 3-daraja
export const HAMROHLAR = [
  { id: "mushuk", nom: "Mushukcha" }, { id: "kuchukcha", nom: "Kuchukcha" }, { id: "toti", nom: "To'ti" },
  { id: "robotcha", nom: "Robotcha" }, { id: "tulki", nom: "Tulkicha" }, { id: "ajdarcha", nom: "Ajdarcha" },
];
export const HAMROH_NARXI = 250;
export const SANDIQ_ASOS = 30;

export function boshHolat() {
  return { v: 1, tanga: 0, jami: 0, binolar: {}, hamrohlar: [], hamroh: "", sessiyalar: [], sandiqKun: "", olov: 0, olovKun: "" };
}

export function kunKaliti(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function kechagi(kun) {
  const [y, m, d] = kun.split("-").map(Number);
  return kunKaliti(new Date(y, m - 1, d - 1));
}

/** O'yin tangasi: bir sessiya faqat bir marta hisoblanadi. */
export function tangaQosh(holat, sessiyaId, miqdor) {
  const n = Math.max(0, Math.round(Number(miqdor) || 0));
  const id = String(sessiyaId || "");
  if (!n || (id && holat.sessiyalar.includes(id))) return { holat, qoshildi: 0 };
  const sessiyalar = id ? [...holat.sessiyalar, id].slice(-60) : holat.sessiyalar;
  return { holat: { ...holat, tanga: holat.tanga + n, jami: holat.jami + n, sessiyalar }, qoshildi: n };
}

export function binoDarajasi(holat, id) { return Math.max(0, Math.min(3, Number(holat.binolar?.[id]) || 0)); }
export function binoNarxi(holat, id) { const d = binoDarajasi(holat, id); return d >= 3 ? null : BINO_NARXI[d]; }

export function binoQur(holat, id) {
  if (!BINOLAR.some((b) => b.id === id)) return { holat, ok: false, sabab: "yoq" };
  const narx = binoNarxi(holat, id);
  if (narx === null) return { holat, ok: false, sabab: "tola" };
  if (holat.tanga < narx) return { holat, ok: false, sabab: "tanga", yetmaydi: narx - holat.tanga };
  return { holat: { ...holat, tanga: holat.tanga - narx, binolar: { ...holat.binolar, [id]: binoDarajasi(holat, id) + 1 } }, ok: true };
}

export function hamrohOch(holat, id) {
  if (!HAMROHLAR.some((h) => h.id === id)) return { holat, ok: false, sabab: "yoq" };
  if (holat.hamrohlar.includes(id)) return { holat: { ...holat, hamroh: id }, ok: true, tanlandi: true };
  if (holat.tanga < HAMROH_NARXI) return { holat, ok: false, sabab: "tanga", yetmaydi: HAMROH_NARXI - holat.tanga };
  return { holat: { ...holat, tanga: holat.tanga - HAMROH_NARXI, hamrohlar: [...holat.hamrohlar, id], hamroh: id }, ok: true };
}

/** Kunlik sandiq: kuniga bir marta. Ketma-ket kunlar (olov) sovg'ani oshiradi (ko'pi bilan +50). */
export function sandiqOch(holat, bugun = kunKaliti()) {
  if (holat.sandiqKun === bugun) return { holat, ok: false, sabab: "bugun" };
  const olov = holat.olovKun === kechagi(bugun) ? holat.olov + 1 : 1;
  const sovga = SANDIQ_ASOS + Math.min(50, (olov - 1) * 5);
  return { holat: { ...holat, tanga: holat.tanga + sovga, jami: holat.jami + sovga, sandiqKun: bugun, olov, olovKun: bugun }, ok: true, sovga, olov };
}
export function sandiqTayyor(holat, bugun = kunKaliti()) { return holat.sandiqKun !== bugun; }
export function orolFoizi(holat) {
  const jami = BINOLAR.reduce((s, b) => s + binoDarajasi(holat, b.id), 0);
  return Math.round((jami / (BINOLAR.length * 3)) * 100);
}

const kalit = (profil) => `kb_orol_v1_${profil || "men"}`;
export function yukla(profil) {
  try { const x = JSON.parse(localStorage.getItem(kalit(profil)) || "null"); return x && x.v === 1 ? { ...boshHolat(), ...x } : boshHolat(); } catch { return boshHolat(); }
}
export function saqla(profil, holat) { try { localStorage.setItem(kalit(profil), JSON.stringify(holat)); } catch { /* xotira yo'q */ } }

/** Oxirgi o'ynagan profil — «O'yinlar» bo'limidan orol shu profil bilan ochiladi. */
export function joriyProfil() { try { return localStorage.getItem("kb_orol_profil") || "men"; } catch { return "men"; } }
export function profilniEsla(profil) { try { localStorage.setItem("kb_orol_profil", String(profil || "men")); } catch { /* xotira yo'q */ } }
