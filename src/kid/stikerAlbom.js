// REV333: stiker albomi — har tugagan dars uchun stiker; har 5-darsda oltin medal, 10-da kubok, 20-da toj.
// Shu qurilmada saqlanadi (bola profili bo'yicha). Sof funksiyalar — brauzersiz sinaladi.
export const STIKERLAR = ["stiker_quyon", "stiker_fil", "stiker_dinozavr", "stiker_kaptar", "stiker_raketa", "stiker_gul"];
export const MUKOFOTLAR = [["toj", 20], ["kubok", 10], ["medal_oltin", 5]];
export const ALBOM_TURLARI = [...STIKERLAR, "medal_oltin", "kubok", "toj"];
const KALIT = "kabutar:albom:";
const ls = () => { try { return globalThis.localStorage || null; } catch { return null; } };
const bosh = () => ({ jami: 0, sanoq: {}, berildi: {}, oxirgi: [] });

export function albomOl(egasi = "bola", s = ls()) {
  try { return { ...bosh(), ...(JSON.parse(s?.getItem(KALIT + egasi) || "null") || {}) }; } catch { return bosh(); }
}

/** Dars tugadi — stiker (bir dars bir kunda bir marta). Qaytaradi: { stiker, mukofot } yoki null (bugun berilgan). */
export function stikerBer(darsKod, { egasi = "bola", sana = new Date(), s = ls() } = {}) {
  const a = albomOl(egasi, s);
  const kun = sana.toISOString().slice(0, 10), k = `${darsKod}|${kun}`;
  if (!darsKod || a.berildi[k]) return null;
  a.jami += 1;
  const stiker = STIKERLAR[(a.jami - 1) % STIKERLAR.length];
  const mukofot = (MUKOFOTLAR.find(([, n]) => a.jami % n === 0) || [null])[0];
  for (const id of [stiker, mukofot].filter(Boolean)) a.sanoq[id] = (a.sanoq[id] || 0) + 1;
  a.berildi[k] = 1;
  const eski = Object.keys(a.berildi).filter((x) => x.split("|")[1] < new Date(sana.getTime() - 60 * 864e5).toISOString().slice(0, 10));
  for (const x of eski) delete a.berildi[x];
  a.oxirgi = [{ id: stiker, mukofot, sana: kun }, ...a.oxirgi].slice(0, 30);
  try { s?.setItem(KALIT + egasi, JSON.stringify(a)); } catch { /* joy yo'q */ }
  return { stiker, mukofot, jami: a.jami };
}

/** Keyingi mukofotgacha nechta dars qoldi. */
export function keyingiMukofot(jami) {
  const n = 5 - (jami % 5);
  return { qoldi: n, id: (jami + n) % 20 === 0 ? "toj" : (jami + n) % 10 === 0 ? "kubok" : "medal_oltin" };
}
