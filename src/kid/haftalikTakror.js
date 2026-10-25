// REV172: Yakshanba takrori (bog'cha) — o'tgan hafta va shu haftada barcha fanlardan o'rganilgan so'zlar (kundalikdan).
// Sof funksiyalar (brauzersiz sinaladi).

/** Kundalik haftalaridan takror so'zlari: [{soz, emoji, kalit, til, aytmagan}] — avval bola aytolmagan so'zlar, keyin shu hafta, keyin o'tgan hafta. */
export function takrorSozlari(haftalar = [], kurs = {}, max = 10) {
  const out = [];
  const bor = new Set();
  const tartib = [...(haftalar || [])].sort((a, b) => (a?.hafta === "shu" ? 0 : 1) - (b?.hafta === "shu" ? 0 : 1));
  for (const h of tartib) {
    for (const k of h?.kunlar || []) {
      for (const d of k?.darslar || []) {
        for (const w of d?.sozlar || []) {
          const soz = String(w?.soz || "").trim();
          const key = `${d.kalit}:${soz.toLowerCase()}`;
          if (!soz || bor.has(key)) continue;
          bor.add(key);
          out.push({ soz, emoji: w.emoji || "", kalit: d.kalit || "", til: kurs?.[d.kalit]?.til || "", aytmagan: w.aytdi === false, hafta: h.hafta });
        }
      }
    }
  }
  // aytolmaganlar birinchi; fanlar aralash bo'lsin (bir fandan ketma-ket ko'p emas)
  const birinchi = out.filter((x) => x.aytmagan);
  const qolgan = out.filter((x) => !x.aytmagan);
  const fanlar = [...new Set(qolgan.map((x) => x.kalit))];
  const navbat = [];
  for (let i = 0; navbat.length < qolgan.length; i++) for (const f of fanlar) { const x = qolgan.filter((y) => y.kalit === f)[i]; if (x) navbat.push(x); }
  return [...birinchi, ...navbat].slice(0, max);
}

/** «Rasmini top» savollari: har so'zga 3 ta rasm (to'g'risi + 2 ta boshqa so'z). */
export function topSavollari(sozlar = [], n = 6, rng = Math.random) {
  const ar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  if (sozlar.length < 3) return [];
  return ar(sozlar).slice(0, n).map((w) => ({ w, variantlar: ar([w, ...ar(sozlar.filter((x) => x !== w)).slice(0, 2)]) }));
}

/** Yulduz: hammasi to'g'ri — 3, ko'pi — 2, aks holda 1. */
export const takrorYulduz = (togri, jami) => (!jami ? 1 : togri >= jami ? 3 : togri >= Math.ceil(jami * 0.6) ? 2 : 1);
