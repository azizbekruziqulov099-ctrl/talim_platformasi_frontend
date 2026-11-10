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

/** REV431: hajm — Kabuning qatlamlari orqaga qarab bir necha marta takrorlanadi (har biri biroz chuqurroqda va to'qroq),
 *  eng orqadagisi — orqa tomon (yuzi yo'q, orqa paneli bilan). Burilganda tekis qog'oz emas, qalin tanali robot ko'rinadi. */
function hajmQosh(kbot) {
  const asl = [...kbot.children].filter((c) => !c.classList.contains("kbot-qatlam"));
  const eni = kbot.getBoundingClientRect().width || 120;
  // REV476: haqiqiy robot qobig'i — yon tomoni TEKIS emas, DUMALOQ: o'rtadagi qatlamlar biroz kattaroq (bo'rtiq), old va orqa
  // qirralari kichikroq (yumaloq qirra); yorug'lik silindrdek — o'rtasi yorug', qirralari to'q; metall tusi (kam rang, ko'p kontrast)
  const chuqur = Math.max(12, eni * 0.16), N = 32;
  const html = asl.map((c) => c.outerHTML).join("");
  const qatlamlar = [];
  for (let i = 1; i <= N; i += 1) {
    const q = document.createElement("div");
    const orqa = i === N;
    q.className = `kbot-qatlam${orqa ? " kbot is-orqa" : ""}`;
    q.setAttribute("aria-hidden", "true");
    Object.assign(q.style, { position: "absolute", inset: "0", width: "100%", height: "100%", padding: "0", margin: "0", pointerEvents: "none",
      transform: `translateZ(${(-chuqur * i) / N}px) scale(${(1 + 0.045 * Math.sin((Math.PI * i) / N) - 0.03 * (i / N) ** 2).toFixed(4)})${orqa ? " rotateY(180deg)" : ""}`,
      backfaceVisibility: orqa ? "hidden" : "visible",
      filter: orqa ? "brightness(.97)" : `brightness(${(0.42 + 0.34 * Math.sin((Math.PI * i) / N)).toFixed(3)}) saturate(.45) contrast(1.15)` });
    q.innerHTML = html;
    kbot.insertBefore(q, kbot.firstChild);
    qatlamlar.push(q);
  }
  asl.forEach((c) => { c.dataset.kbBf = c.style.backfaceVisibility || ""; c.style.backfaceVisibility = "hidden"; });
  kbot.style.transformStyle = "preserve-3d";
  return () => {
    qatlamlar.forEach((q) => q.remove());
    asl.forEach((c) => { c.style.backfaceVisibility = c.dataset.kbBf || ""; delete c.dataset.kbBf; });
    kbot.style.transformStyle = "";
  };
}

/** Aylantiradi. gradus: 360 — to'liq; 180 — yarim aylanib qaytadi; 90 — yonga burilib qaytadi. Qaytaradi: to'xtatish funksiyasi. */
export function kabuAylan(kbot, { gradus = 360, ms = 1600 } = {}) {
  if (!kbot || typeof window === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  orqaQism(kbot);
  const qaytadi = gradus < 360;   // yarim/yon burilish — borib, qaytib keladi
  let tozala = () => {};
  try { tozala = hajmQosh(kbot); } catch { /* eski brauzer — hajmsiz aylanadi */ }
  let id = 0; const t0 = performance.now();
  const asl = [...kbot.children].filter((c) => !c.classList.contains("kbot-qatlam"));
  const tugat = () => { kbot.style.transform = ""; kbot.style.filter = ""; asl.forEach((c) => { c.style.filter = ""; }); kbot.classList.remove("is-orqa"); tozala(); tozala = () => {}; };
  const qadam = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const g = qaytadi ? gradus * Math.sin(Math.PI * silliq(k)) : gradus * silliq(k);
    // REV426/REV431: haqiqiy 3D — perspektiva, qatlamlar chuqurlikda turadi (filter bu yerda emas: u 3D ni tekislab qo'yadi)
    kbot.style.transformOrigin = "50% 55%";
    kbot.style.transform = `perspective(1000px) rotateY(${g}deg) translateY(${-6 * Math.sin(Math.PI * k)}%)`;   // REV469: yumshoqroq perspektiva
    const nur = Math.cos(((g - 25) * Math.PI) / 180);   // REV476: chapdan tushgan yorug'lik — burilganda yuzi yaltirab, so'ng soyalanadi
    asl.forEach((c) => { c.style.filter = `brightness(${(0.88 + 0.22 * Math.max(0, nur)).toFixed(3)})`; });
    if (k < 1) id = requestAnimationFrame(qadam); else tugat();
  };
  id = requestAnimationFrame(qadam);
  return () => { cancelAnimationFrame(id); tugat(); };
}
