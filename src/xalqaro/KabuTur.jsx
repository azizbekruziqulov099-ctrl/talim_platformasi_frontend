// Kabu tanishtiruvi: Kabu (robot) sayt bo'ylab uchadi, kerakli joylarni chiziq bilan ko'rsatadi, gapiradi,
// oxirida burchakda yig'ilib turadi. Bosilsa — qayta boshlaydi.
// Saytni qotirmaydi: butun qatlam pointer-events:none (faqat Kabu va tugmalar bosiladi), sahifa faqat qadam almashganda
// BIR marta aylantiriladi (skroll hodisalari qayta aylantirmaydi), joylashuv rAF bilan cheklangan, xato bo'lsa sahifa buzilmaydi.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { UstozFigura } from "../kid/UstozSahna.jsx";   // testlarda chiqadigan jonli ustoz (Kabu)
import { KABU_QADAMLAR } from "./kattaRules.js";
import "./katta-kirish.css";

export const TUR_KALIT = "kabutar:xb:tur_korildi";
const ENI = 300;

class Himoya extends React.Component {   // Kabu ishlamay qolsa ham sayt ishlayveradi
  constructor(p) { super(p); this.state = { xato: false }; }
  static getDerivedStateFromError() { return { xato: true }; }
  componentDidCatch() { try { localStorage.setItem(TUR_KALIT, "1"); } catch { /* */ } }
  render() { return this.state.xato ? null : this.props.children; }
}

function Tur({ ovoz, ustoz = "sardor" }) {
  const [qadam, setQadam] = useState(-1);
  const [qismlar, setQismlar] = useState([]);
  const [poz, setPoz] = useState({ x: 16, y: 80, chap: false });
  const [nishon, setNishon] = useState(null);
  const [korildi, setKorildi] = useState(() => { try { return Boolean(localStorage.getItem(TUR_KALIT)); } catch { return false; } });
  const taymer = useRef(0); const raf = useRef(0); const qadamRef = useRef(-1);

  const tugat = useCallback(() => {
    clearTimeout(taymer.current); cancelAnimationFrame(raf.current);
    try { ovoz?.hush?.(); } catch { /* */ }
    qadamRef.current = -1; setQadam(-1); setNishon(null); setKorildi(true);
    try { localStorage.setItem(TUR_KALIT, "1"); } catch { /* */ }
  }, [ovoz]);

  const boshla = useCallback(() => {
    const q = KABU_QADAMLAR.filter((x) => document.querySelector(x.sel));
    if (!q.length) return;
    setQismlar(q); qadamRef.current = 0; setQadam(0);
  }, []);

  useEffect(() => {
    if (korildi) return undefined;
    const t = setTimeout(boshla, 900);
    return () => clearTimeout(t);
  }, [korildi, boshla]);

  const joylash = useCallback(() => {   // faqat o'lchaydi va joylaydi — aylantirmaydi
    const q = qismlar[qadamRef.current]; if (!q) return;
    const el = document.querySelector(q.sel); if (!el) return;
    const r = el.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    const markazX = r.left + r.width / 2, markazY = r.top + Math.min(r.height / 2, 40);
    const chapda = markazX > W / 2;            // nishon o'ngda bo'lsa Kabu chapda turadi va o'ngga ko'rsatadi
    const x = Math.max(8, Math.min(W - Math.min(ENI, W - 16) - 8, chapda ? r.left - Math.min(ENI, W - 16) + 40 : r.left - 8));
    const y = Math.max(8, Math.min(H - 220, r.bottom + 12));
    setNishon({ x: markazX, y: markazY });
    setPoz({ x, y, chap: chapda });
  }, [qismlar]);
  const rafJoy = useCallback(() => { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(joylash); }, [joylash]);

  useEffect(() => {
    if (qadam < 0) return undefined;
    qadamRef.current = qadam;
    const q = qismlar[qadam]; if (!q) return undefined;
    const el = document.querySelector(q.sel);
    try { el?.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { /* */ }   // bir marta, qadam almashganda
    rafJoy();
    const t1 = setTimeout(rafJoy, 450), t2 = setTimeout(rafJoy, 900);                      // aylanish tugagach qayta joylash
    try { ovoz?.say?.(q.matn); } catch { /* */ }
    taymer.current = setTimeout(() => { if (qadam + 1 >= qismlar.length) tugat(); else setQadam(qadam + 1); }, Math.max(7000, q.matn.length * 85));
    window.addEventListener("resize", rafJoy); window.addEventListener("scroll", rafJoy, { capture: true, passive: true });
    return () => { clearTimeout(taymer.current); clearTimeout(t1); clearTimeout(t2); cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", rafJoy); window.removeEventListener("scroll", rafJoy, { capture: true }); };
  }, [qadam, qismlar]); // eslint-disable-line react-hooks/exhaustive-deps

  const keyingi = () => { clearTimeout(taymer.current); try { ovoz?.hush?.(); } catch { /* */ } if (qadam + 1 >= qismlar.length) tugat(); else setQadam(qadam + 1); };

  if (qadam < 0) return <button type="button" className="kk-tur-yigilgan" aria-label="Kabu: tanishtiruvni qayta ko‘rish" title="Kabu" onClick={boshla}>
    <span className="kk-tur-bosh" aria-hidden="true"><UstozFigura ustoz={ustoz} mood="wave" /></span></button>;
  const q = qismlar[qadam];
  const oxirgi = qadam + 1 >= qismlar.length;
  const eni = Math.min(ENI, window.innerWidth - 16);
  const kabuX = poz.chap ? poz.x + eni - 30 : poz.x + 30;
  return <div className="kk-tur" role="dialog" aria-label="Kabu tanishtiruvi">
    {nishon && <svg className="kk-tur-chiziq" width="100%" height="100%" aria-hidden="true">
      <line x1={kabuX} y1={poz.y + 30} x2={nishon.x} y2={nishon.y} /><circle cx={nishon.x} cy={nishon.y} r="8" /></svg>}
    <div className="kk-tur-kabu" style={{ transform: `translate(${poz.x}px, ${poz.y}px)`, width: eni }}>
      <div className={`xb-ustoz xb-ustoz-jonli kk-tur-ustoz ${poz.chap ? "is-chap" : ""}`} aria-hidden="true">
        <UstozFigura ustoz={ustoz} speaking={Boolean(ovoz?.speaking)} mood={oxirgi ? "happy" : "talk"} hasPics /></div>
      <div className="kk-tur-pufak">
        <p>{q.matn}</p>
        <div className="kk-tur-tugmalar">
          <small>{qadam + 1}/{qismlar.length}</small>
          <button type="button" onClick={tugat}>O‘tkazib yuborish</button>
          <button type="button" className="kk-tur-asosiy" onClick={keyingi}>{oxirgi ? "Tushundim" : "Keyingisi"}</button>
        </div>
      </div>
    </div>
  </div>;
}

export default function KabuTur(props) { return <Himoya><Tur {...props} /></Himoya>; }
