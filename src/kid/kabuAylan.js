// REV331: Kabu aylanadi — 360° (to'liq), 180° (yarim, orqasini ko'rsatib qaytadi), 90° (yonga burilish).
// Jonli SVG Kabu tekis qatlamlardan iborat: aylanish kengligini cos(θ) bo'yicha siqish bilan beriladi, orqa tomonga
// o'tganda yuz (ko'z, tabassum, displey) yashirinib, orqa panel ko'rinadi.
const NS = "http://www.w3.org/2000/svg";
const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };

/** Orqa panellarni bir marta qo'shadi (bosh va ko'krak SVG'lariga, o'sha koordinatalarda). */
export function orqaQism(kbot) {
  if (!kbot || kbot.querySelector(".k-orqa")) return;
  const bosh = kbot.querySelector("svg.k-headbase");
  if (bosh) {
    const g = el("g", { class: "k-orqa" });
    g.appendChild(el("rect", { x: 82, y: 74, width: 156, height: 102, rx: 44, fill: "#F1F5FB", stroke: "#C5D3E8", "stroke-width": 2.5 }));
    for (let i = 0; i < 3; i++) g.appendChild(el("rect", { x: 128, y: 104 + i * 14, width: 64, height: 6, rx: 3, fill: "#2EC4B6", opacity: 0.75 }));
    g.appendChild(el("circle", { cx: 160, cy: 156, r: 7, fill: "#FFB703", stroke: "#E39A00", "stroke-width": 2 }));
    bosh.appendChild(g);
  }
  const tana = kbot.querySelector("svg.k-body");
  if (tana) {
    const g = el("g", { class: "k-orqa" });
    g.appendChild(el("circle", { cx: 160, cy: 262, r: 31, fill: "#F1F5FB", stroke: "#C5D3E8", "stroke-width": 2.5 }));
    for (let i = 0; i < 3; i++) g.appendChild(el("rect", { x: 144, y: 250 + i * 9, width: 32, height: 4, rx: 2, fill: "#AFC2DA" }));
    tana.appendChild(g);
  }
}

/** θ (gradus) → ko'rinish: siqilish (scaleX), orqa tomonmi. Yon ko'rinishda ham ingichka tana ko'rinib turadi. */
export function aylanishHolati(gradus) {
  const c = Math.cos((gradus * Math.PI) / 180);
  const sx = Math.sign(c || 1) * Math.max(0.16, Math.abs(c));
  return { sx: Math.round(sx * 1000) / 1000, orqa: c < -0.02 };
}

const silliq = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

/** Aylantiradi. gradus: 360 — to'liq; 180 — yarim aylanib qaytadi; 90 — yonga burilib qaytadi. Qaytaradi: to'xtatish funksiyasi. */
export function kabuAylan(kbot, { gradus = 360, ms = 1500 } = {}) {
  if (!kbot || typeof window === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  orqaQism(kbot);
  const qaytadi = gradus < 360;   // yarim/yon burilish — borib, qaytib keladi
  let id = 0; const t0 = performance.now();
  const qadam = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const g = qaytadi ? gradus * Math.sin(Math.PI * silliq(k)) : gradus * silliq(k);
    const h = aylanishHolati(g);
    kbot.style.transform = `scaleX(${h.sx}) translateY(${-6 * Math.sin(Math.PI * k)}%)`;
    kbot.classList.toggle("is-orqa", h.orqa);
    if (k < 1) id = requestAnimationFrame(qadam);
    else { kbot.style.transform = ""; kbot.classList.remove("is-orqa"); }
  };
  id = requestAnimationFrame(qadam);
  return () => { cancelAnimationFrame(id); kbot.style.transform = ""; kbot.classList.remove("is-orqa"); };
}
