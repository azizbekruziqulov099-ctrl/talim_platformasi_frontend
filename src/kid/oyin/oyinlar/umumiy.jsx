// REV324: o'yinlarning umumiy bo'laklari — rasm, so'z, son, katta tugma, surish (drag) va taymerlar.
import React, { useCallback, useEffect, useRef, useState } from "react";

/** Ishlatiladigan rasm: tashqaridan berilgan rasm(el) → el.image → emoji. korinish: "emoji" | "rasm" | null. */
export function Rasm({ el, rasm, korinish = null, kichik = false, className = "" }) {
  const [buzuq, setBuzuq] = useState(false);
  const src = korinish === "emoji" ? "" : ((typeof rasm === "function" ? rasm(el) : "") || el?.image || "");
  const emoji = el?.emoji || "⭐";
  return (
    <span className={`oy-rasm ${kichik ? "is-kichik" : ""} ${className}`} aria-hidden="true">
      {src && !buzuq
        ? <img src={src} alt="" draggable="false" loading="lazy" onError={() => setBuzuq(true)} />
        : <span className="oy-emoji">{emoji}</span>}
    </span>
  );
}

/** So'z va uning o'qilishi (faqat 6-7 yosh — o'qiy boshlagan bolalar uchun). */
export function Soz({ el }) {
  if (!el?.say && !el?.uz) return null;
  return <span className="oy-soz" dir="auto">{el.say || el.uz}{el.rom ? <small>{el.rom}</small> : null}</span>;
}

/** n ta nuqta (son matnsiz ko'rinishi). */
export function Nuqtalar({ n }) {
  const k = Math.max(0, Math.min(20, Number(n) || 0));
  return <span className="oy-nuqta" style={{ "--ust": k <= 3 ? Math.max(1, k) : k <= 4 ? 2 : k <= 6 ? 3 : 5 }} aria-hidden="true">
    {Array.from({ length: k }, (_, i) => <i key={i} />)}
  </span>;
}

/** Son: 2-3 yoshda faqat nuqtalar (matn yo'q), 4-5 da raqam + nuqtalar, 6-7 da raqam. */
export function Son({ son, yosh, kichik = false }) {
  if (yosh === "2-3") return <span className="oy-son is-faqat-nuqta"><Nuqtalar n={son} /></span>;
  return <span className={`oy-son ${kichik ? "is-kichik" : ""}`}>
    <b>{son}</b>
    {yosh === "4-5" && son <= 10 ? <Nuqtalar n={son} /> : null}
  </span>;
}

/** Katta tugma (kamida 88px). holat: "togri" | "xato" | null; ishora — yordam (yonib-o'chadi); olingan — xato bosilgan. */
export function Tugma({ holat = null, ishora = false, olingan = false, className = "", label, children, ...rest }) {
  const cls = ["oy-tugma", className, holat ? `is-${holat}` : "", ishora && !holat ? "is-ishora" : "", olingan && holat !== "xato" ? "is-olingan" : ""]
    .filter(Boolean).join(" ");
  return <button type="button" className={cls} aria-label={label} {...rest}>{children}</button>;
}

/** Variantlar to'ri: n ga qarab ustunlar (4 tasi telefonda 2×2, keng ekranda bir qator). */
export function Variantlar({ n, keng = false, children }) {
  const ust = n <= 2 ? 2 : n === 4 ? 2 : 3;
  return <div className={`oy-variantlar is-${n} ${keng ? "is-keng" : ""}`} style={{ "--ust": ust }}>{children}</div>;
}

/** Javob kaliti (fb.j dan): satr, { k }, { joy, k }, { qoy } … */
export const javobKaliti = (j) => (j && typeof j === "object" && !Array.isArray(j) ? (j.k ?? j.qoy ?? null) : j);

/** Variant tugmasining holati: tugagan raundda to'g'risi yashil; oxirgi bosilgani — yashil yoki qizil. */
export function tugmaHolati({ fb, kadr, raund }, k) {
  if (kadr && k === raund?.togri) return "togri";
  if (fb && javobKaliti(fb.j) === k && fb.togri !== null) return fb.togri ? "togri" : "xato";
  return null;
}

/** Komponent yo'qolganda o'chadigan taymerlar. */
export function useTaymer() {
  const ids = useRef(new Set());
  useEffect(() => () => { ids.current.forEach(clearTimeout); ids.current.clear(); }, []);
  return useCallback((fn, ms) => {
    const id = setTimeout(() => { ids.current.delete(id); fn(); }, ms);
    ids.current.add(id);
    return id;
  }, []);
}

/** «Harakatni kamaytirish» yoqilganmi (animatsiyasiz ko'rinish uchun). */
export function harakatKam() {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
}

/** Gap aytilishiga taxminiy vaqt (ms) — mikrofonni ustoz gapirib bo'lgach ochish uchun. */
export const gapVaqti = (text) => Math.min(9000, 900 + 62 * String(text || "").replace(/\[\/?[a-z]{2}\]/g, "").length);

/**
 * Suriladigan (drag) katta tugma. Barmoq/sichqoncha bilan suriladi; qo'yib yuborilganda ostidagi [data-tushadi]
 * joyi topiladi → onTashla(data, joy). Surmasdan bosilsa (yoki klaviaturada Enter) → onBos(data) — kichkintoylar
 * uchun ham qulay: bosilgan narsa o'zi kerakli joyga boradi.
 */
export function Surilma({ data, onTashla, onBos, disabled = false, holat = null, ishora = false, className = "", label, children }) {
  const ref = useRef(null);
  const st = useRef(null);
  const bosmaYoq = useRef(false);
  const tozala = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("is-surilmoqda");
    el.classList.add("is-qaytmoqda");
    el.style.transform = "";
    setTimeout(() => el.classList.remove("is-qaytmoqda"), 260);
  };
  const down = (e) => {
    if (disabled || (e.button !== undefined && e.button !== 0)) return;
    st.current = { id: e.pointerId, x: e.clientX, y: e.clientY, surildi: false };
    try { ref.current?.setPointerCapture?.(e.pointerId); } catch { /* */ }
  };
  const move = (e) => {
    const s = st.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.surildi && Math.hypot(dx, dy) > 10) { s.surildi = true; ref.current?.classList.add("is-surilmoqda"); }
    if (s.surildi && ref.current) ref.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;
  };
  const up = (e) => {
    const s = st.current;
    st.current = null;
    if (!s || s.id !== e.pointerId || !s.surildi) return;
    bosmaYoq.current = true;   // keyingi «click» — surishning oxiri, bosish emas
    const ostida = (globalThis.document?.elementsFromPoint?.(e.clientX, e.clientY) || [])
      .map((n) => (ref.current && ref.current.contains(n) ? null : n?.closest?.("[data-tushadi]")))
      .find(Boolean);
    tozala();
    onTashla?.(data, ostida ? ostida.getAttribute("data-tushadi") : null);
  };
  const cancel = () => { st.current = null; tozala(); };
  const click = () => {
    if (bosmaYoq.current) { bosmaYoq.current = false; return; }
    if (!disabled) onBos?.(data);
  };
  const cls = ["oy-tugma", "oy-surilma", className, holat ? `is-${holat}` : "", ishora && !holat ? "is-ishora" : ""].filter(Boolean).join(" ");
  return (
    <button ref={ref} type="button" className={cls} aria-label={label} aria-disabled={disabled || undefined}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onClick={click}>
      {children}
    </button>
  );
}
