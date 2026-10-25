// REV172: umumiy ovoz o'qituvchi — matn (tegli bo'laklari bilan: «Bu so'z — [en]apple[/en]») serverdagi /api/ovoz orqali
// o'qiladi (Azure → OpenAI → edge). Repetitor va yakshanba takrori ishlatadi. Har yangi o'qish oldingisini to'xtatadi.
import { aralashKerak, aralashOqi } from "../speech/aralashOvoz.js";

/** Ustoz jinsi bo'yicha server ovozi: erkak ustoz — «ogil», ayol ustoz — «qiz». */
export const jinsOf = (ustoz, USTOZLAR = {}) => (USTOZLAR?.[ustoz]?.lab === "erkak" ? "ogil" : "qiz");

/** Bir manba — bir vaqtda bitta ovoz. ovoz.oqi(matn, {jins, sekin, tezlik, done}); ovoz.stop() */
export function ovozManbai(apiBase = "") {
  let joriy = null;
  let raqam = 0;
  const base = String(apiBase || "").replace(/\/+$/, "");
  const stop = () => { raqam++; try { joriy?.pause(); } catch { /* */ } joriy = null; };
  const oqi = (matn, { jins = "qiz", sekin = false, tezlik = "-10%", done } = {}) => {
    stop();
    const my = raqam;
    let fin = false;
    const end = () => { if (fin) return; fin = true; if (my === raqam) done?.(); };
    const t = String(matn || "").slice(0, 1500);
    if (!t.trim()) { setTimeout(end, 0); return; }
    const tz = sekin ? "-30%" : tezlik;
    const url = (m) => `${base}/api/ovoz?k=133&${new URLSearchParams({ matn: m, jins, tezlik: tz })}`;
    if (aralashKerak(t)) {
      const ctl = aralashOqi(t, url, { rate: sekin ? 0.65 : 0.9, onEnd: end });
      joriy = { pause: () => ctl.stop() };
      setTimeout(end, Math.min(25000, 6000 + t.length * 170));
      return;
    }
    try {
      const a = new Audio(url(t));
      joriy = a; a.onended = end; a.onerror = end;
      a.play().catch(() => setTimeout(end, 1200));
      setTimeout(end, Math.min(25000, 5000 + t.length * 150));
    } catch { setTimeout(end, 800); }
  };
  return { oqi, stop };
}
