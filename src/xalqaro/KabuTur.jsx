// Kabu tanishtiruvi: kichkina Kabu sayt bo'ylab uchadi, kerakli joylarni chiziq bilan ko'rsatadi, gapiradi,
// oxirida bir joyda (burchakda) yig'ilib turadi. Bosilsa — qayta boshlaydi.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./katta-kirish.css";

export const TUR_KALIT = "kabutar:xb:tur_korildi";

const QADAMLAR = [
  { sel: ".kb-account-notice", matn: "Avval muhim narsa: tepadagi eslatmada Telegram yoki Gmail’ni ulang. Ulamasangiz, boshqa qurilmadan kira olmaysiz va natijalaringiz yo‘qolib ketishi mumkin." },
  { sel: ".xb-menyu-karta.is-kurs", matn: "Bu yerda darslar. Har mavzuda men doskada tushuntiraman, keyin mashq qilasiz. Kerakli maktab darslari ham shu yerda ochiq." },
  { sel: ".xb-menyu-karta.is-imtihon", matn: "Bu yerda testlar va imtihonlar: haftalik, oylik, choraklik va yillik. Har birini o‘z vaqtida topshirasiz." },
  { sel: ".xb-menyu-karta.is-reyting", matn: "Bu yerda reytingingiz. Natijangizga qarab guruhingiz belgilanadi. Imtihondan keyin yaxshi o‘qisangiz, yuqori guruhga o‘tasiz." },
  { sel: ".xb-menyu-karta.is-sinfim", matn: "Bu yerda sinfingiz va guruhingiz. O‘qituvchingiz guruhlarni tuzgach, shu yerda ko‘rasiz." },
];

function markaz(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 40), r }; }

export default function KabuTur({ ovoz, ishga = true }) {
  const [qadam, setQadam] = useState(-1);          // -1: ko'rsatilmayapti / yig'ilgan
  const [qismlar, setQismlar] = useState([]);       // mavjud elementli qadamlar
  const [poz, setPoz] = useState({ x: 24, y: 80 });
  const [nishon, setNishon] = useState(null);
  const [korildi, setKorildi] = useState(() => { try { return Boolean(localStorage.getItem(TUR_KALIT)); } catch { return false; } });
  const taymer = useRef(null);

  const boshla = useCallback(() => {
    const q = QADAMLAR.filter((x) => document.querySelector(x.sel));
    if (!q.length) return;
    setQismlar(q); setQadam(0);
  }, []);

  useEffect(() => { if (ishga && !korildi) { const t = setTimeout(boshla, 900); return () => clearTimeout(t); } return undefined; }, [ishga, korildi, boshla]);

  const tugat = useCallback(() => {
    clearTimeout(taymer.current); ovoz?.hush?.();
    setQadam(-1); setNishon(null); setKorildi(true);
    try { localStorage.setItem(TUR_KALIT, "1"); } catch { /* */ }
  }, [ovoz]);

  const joylash = useCallback(() => {
    if (qadam < 0 || !qismlar[qadam]) return;
    const el = document.querySelector(qismlar[qadam].sel);
    if (!el) return;
    const m = markaz(el);
    const ichkarida = m.r.top >= 0 && m.r.bottom <= window.innerHeight;
    if (!ichkarida) el.scrollIntoView({ block: "center", behavior: "smooth" });
    const kenglik = window.innerWidth;
    setNishon({ x: m.x, y: m.y });
    setPoz({ x: Math.max(8, Math.min(kenglik - 64, m.r.left - 20)), y: Math.max(8, Math.min(window.innerHeight - 200, m.r.bottom + 14)) });
  }, [qadam, qismlar]);

  useLayoutEffect(() => { joylash(); }, [joylash]);
  useEffect(() => {
    if (qadam < 0) return undefined;
    const q = qismlar[qadam];
    ovoz?.say?.(q.matn);
    // gap tugagach (yoki ovoz o'chiq bo'lsa ~ matn uzunligiga qarab) o'zi keyingisiga o'tadi; o'quvchi tugma bilan ham o'tishi mumkin
    taymer.current = setTimeout(() => keyingi(), Math.max(7000, q.matn.length * 85));
    const qayta = () => joylash();
    window.addEventListener("resize", qayta); window.addEventListener("scroll", qayta, true);
    return () => { clearTimeout(taymer.current); window.removeEventListener("resize", qayta); window.removeEventListener("scroll", qayta, true); };
  }, [qadam]); // eslint-disable-line react-hooks/exhaustive-deps

  const keyingi = () => { clearTimeout(taymer.current); ovoz?.hush?.(); setQadam((i) => (i + 1 >= qismlar.length ? (tugat(), -1) : i + 1)); };

  if (qadam < 0) return <button type="button" className="kk-tur-yigilgan" aria-label="Kabu: tanishtiruvni qayta ko‘rish" title="Kabu" onClick={boshla}>🕊️</button>;
  const q = qismlar[qadam];
  const kabuX = poz.x + 20, kabuY = poz.y + 20;
  return <div className="kk-tur" role="dialog" aria-label="Kabu tanishtiruvi">
    {nishon && <svg className="kk-tur-chiziq" width="100%" height="100%" aria-hidden="true">
      <line x1={kabuX} y1={kabuY} x2={nishon.x} y2={nishon.y} />
      <circle cx={nishon.x} cy={nishon.y} r="7" />
    </svg>}
    <div className="kk-tur-kabu" style={{ transform: `translate(${poz.x}px, ${poz.y}px)` }}>
      <span className="kk-tur-qush" aria-hidden="true">🕊️</span>
      <div className="kk-tur-pufak">
        <p>{q.matn}</p>
        <div className="kk-tur-tugmalar">
          <small>{qadam + 1}/{qismlar.length}</small>
          <button type="button" onClick={tugat}>O‘tkazib yuborish</button>
          <button type="button" className="kk-tur-asosiy" onClick={keyingi}>{qadam + 1 >= qismlar.length ? "Tushundim" : "Keyingisi"}</button>
        </div>
      </div>
    </div>
  </div>;
}
