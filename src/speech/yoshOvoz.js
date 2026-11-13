// REV532: yoshga mos ovoz — bitta joyda. Server ovozi (/api/ovoz) uchun: jins, ohang (Hz), tezlik (%).
//  bog'cha 2–3: Kabu, sekin va mehribon; 4–5: Kabu, biroz sekin; 6–7: Kabu odatdagidek;
//  1–4-sinf: yumshoq, shoshmasdan; 5–8-sinf: oddiy, ravon; 9–11-sinf: jiddiyroq va tezroq.
export function yoshProfil({ sinf = "", yosh = "" } = {}) {
  const y = String(yosh || "");
  if (/2-3/.test(y)) return { kim: "kabu", jins: "ogil", ohang: "+30Hz", tezlik: "-10%" };
  if (/4-5/.test(y)) return { kim: "kabu", jins: "ogil", ohang: "+28Hz", tezlik: "-3%" };
  if (/6-7/.test(y)) return { kim: "kabu", jins: "ogil", ohang: "+28Hz", tezlik: "+4%" };
  const s = Number((/\d{1,2}/.exec(String(sinf)) || [0])[0]);
  if (s >= 1 && s <= 4) return { kim: "ustoz", jins: "qiz", ohang: "+8Hz", tezlik: "-5%" };
  if (s >= 9) return { kim: "ustoz", jins: "qiz", ohang: "-4Hz", tezlik: "+8%" };
  return { kim: "ustoz", jins: "qiz", ohang: "+0Hz", tezlik: "+0%" };
}

/** O'qib beriladigan matnni tozalash: belgi va bezaklarsiz, amallar so'z bilan (o'zbekcha izoh uchun). */
export function oqishMatni(matn) {
  return String(matn || "").replace(/[🎉✅❌💡⭐🔊▶↻←→]/gu, " ").replace(/\s*=\s*\?/g, " nechaga teng").replace(/×|·/g, " ko‘paytirish ").replace(/÷/g, " bo‘lish ")
    .replace(/(\d)\s*\+\s*(\d)/g, "$1 qo‘shuv $2").replace(/(\d)\s*[−–-]\s*(\d)/g, "$1 ayiruv $2").replace(/\s+/g, " ").trim();
}

let joriy = null;
/** Fan o'yinlari uchun: matnni yoshga mos ovozda o'qish. Qaytaradi: to'xtatish funksiyasi. */
export async function yoshAyt(apiBase, matn, { sinf = "", yosh = "", til = "", tugadi } = {}) {
  try { joriy?.stop?.(); } catch { /* */ }
  const toza = oqishMatni(matn); if (!toza) { tugadi?.(); return () => {}; }
  const [{ ikkiOvozOqi }, { speakableText }] = await Promise.all([import("./ikkiOvoz.js"), import("../lesson/darsXonasiRules.js")]);
  const p = yoshProfil({ sinf, yosh }); const base = String(apiBase || "").replace(/\/+$/, "");
  const o = ikkiOvozOqi(speakableText(toza), { til: til && til !== "uz" ? til : "", nomzodlar: [...new Set(["uz", til].filter(Boolean))],
    url: (m) => `${base}/api/ovoz?k=133&${new URLSearchParams({ matn: m.slice(0, 1500), jins: p.jins, ohang: p.ohang, tezlik: p.tezlik })}`, onEnd: () => tugadi?.() });
  joriy = o; return () => { try { o?.stop?.(); } catch { /* */ } };
}
export function yoshJim() { try { joriy?.stop?.(); } catch { /* */ } joriy = null; }
