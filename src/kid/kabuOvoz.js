// REV362: Kabu ovozi — darsdagidek serverning ovozi (/api/ovoz, Kabu ohangi), brauzerning (Google) ovozi emas.
// Izoh qismi bir Kabu ovozida, o'rganilayotgan til qismi ([en]…[/en]) — o'sha til ovozida. Qaytaradi: to'xtatish funksiyasi.
import { ikkiOvozOqi } from "../speech/ikkiOvoz.js";
import { izohTeg } from "./izohTil.js";
import { speakableText } from "../lesson/darsXonasiRules.js";

const KABU_TV = { iz: "+28Hz", til: "+22Hz", tezlik: "+4%" };
let joriy = null;

export function kabuAyt(apiBase, text, { izoh = "uz", til = "", tugadi, yosh = "" } = {}) {
  // REV532: tezlik yoshga mos — 2–3 yosh: sekin (−10%), 3–5: biroz sekin (−3%), 6–7 va boshqalar: odatdagidek (+4%)
  const tezlik = /2-3|3-4/.test(String(yosh)) ? "-10%" : /4-5/.test(String(yosh)) ? "-3%" : KABU_TV.tezlik;
  try { joriy?.stop?.(); } catch { /* */ }
  let t = String(text || "");
  if (izoh !== "uz") t = izohTeg(t, izoh);
  const clean = speakableText(t);
  if (!clean.replace(/⏸/g, "").trim()) { tugadi?.(); return () => {}; }
  const base = String(apiBase || "").replace(/\/+$/, "");
  let bitdi = false;
  const tamom = () => { if (!bitdi) { bitdi = true; tugadi?.(); } };
  const qorovul = setTimeout(tamom, Math.min(30000, 5000 + clean.length * 110));   // ovoz kelmasa ham o'yin to'xtamaydi
  const izL = izoh === "uz" ? "uz" : izoh;
  const o = ikkiOvozOqi(clean, { til: til || "", nomzodlar: [...new Set([izL, til, "uz"].filter(Boolean))],
    url: (m, kim) => `${base}/api/ovoz?k=133&${new URLSearchParams({ matn: m.slice(0, 1500), jins: kim === "til" ? "qiz" : "ogil", ohang: kim === "til" ? KABU_TV.til : KABU_TV.iz,
      ...(["ru", "en"].includes(izoh) ? { asosiy_til: izoh } : {}), tezlik })}`,
    onEnd: () => { clearTimeout(qorovul); tamom(); } });
  joriy = o;
  return () => { clearTimeout(qorovul); try { o?.stop?.(); } catch { /* */ } };
}
export function kabuJimm() { try { joriy?.stop?.(); } catch { /* */ } joriy = null; }
