// REV557: formulani yozish va tekshirish — belgilar klaviaturasi (daraja, ildiz, kasr, sin/cos, π), jonli ko'rinish, tekshiruv.
// Telefon klaviaturasi chiqmaydi (ekranni yopmaydi); kompyuterda oddiy klaviaturadan ham yoziladi.
// Tekshiruv ma'no bo'yicha: formulaRules.formulaTeng(). Bu komponentni keyin Kabu-bot ham ishlatadi (formulani eslatish).
import React, { useEffect, useMemo, useState } from "react";
import katex from "katex";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { SABAB_MATNI, formulaBelgilari, javobTekshir, jonliLatex, klaviaturaHarflari, matnLatex } from "./formulaRules.js";
import { formulaOl } from "./formulalar.js";
import "./formula.css";

const html = (lx, display = true) => { try { return lx ? katex.renderToString(lx, { throwOnError: false, displayMode: display, output: "html", strict: "ignore" }) : ""; } catch { return ""; } };
export function FormulaKorinishi({ matn, jonli = false }) {
  const h = useMemo(() => html(jonli ? jonliLatex(matn) : matnLatex(matn)), [matn, jonli]);
  return h ? <span className="fm-formula" dangerouslySetInnerHTML={{ __html: h }} /> : null;
}

// tugma: [ko'rinadigan belgi, qo'shiladigan bo'lak, aria-yorliq]
const RAQAMLAR = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ","];
const AMALLAR = [["+", "+", "qo‘shish"], ["−", "-", "ayirish"], ["·", "*", "ko‘paytirish"], ["/", "/", "bo‘lish (kasr)"], ["=", "=", "teng"], ["(", "(", "qavs ochish"], [")", ")", "qavs yopish"]];
const DARAJALAR = [["x²", "^2", "kvadrat"], ["x³", "^3", "kub"], ["xⁿ", "^(", "daraja"], ["√", "sqrt(", "kvadrat ildiz"]];
const TRIG = [["sin", "sin(", "sinus"], ["cos", "cos(", "kosinus"], ["tg", "tg(", "tangens"], ["ctg", "ctg(", "kotangens"], ["sin²", "sin^2(", "sinus kvadrat"], ["cos²", "cos^2(", "kosinus kvadrat"], ["tg²", "tg^2(", "tangens kvadrat"]];

/** Klaviatura. bolaklar — yozilgan bo'laklar ro'yxati (⌫ oxirgi BO'LAKNI o'chiradi: «sin^2(» bir bosishda). */
export function FormulaKlaviatura({ bolaklar, onChange, harflar, trig = false, pi = false, onTekshir, band = false }) {
  const qosh = (b) => { if (!band && bolaklar.join("").length < 60) onChange([...bolaklar, b]); };
  const ochir = () => { if (!band) onChange(bolaklar.slice(0, -1)); };
  useEffect(() => {   // kompyuter klaviaturasi
    const h = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || band) return;
      const k = e.key;
      if (/^[0-9A-Za-z+\-*/^()=]$/.test(k)) { e.preventDefault(); qosh(k); }
      else if (k === "," || k === ".") { e.preventDefault(); qosh(","); }
      else if (k === "Backspace") { e.preventDefault(); ochir(); }
      else if (k === "Enter") { e.preventDefault(); onTekshir?.(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });
  const T = ({ b, v, y, sinf = "" }) => <button type="button" className={`fm-t ${sinf}`} disabled={band} onClick={() => qosh(v)} aria-label={y ? __kbUi(y) : b}>{b}</button>;
  return <div className="fm-klav" role="group" aria-label={__kbUi("Formula klaviaturasi")}>
    <div className="fm-qator fm-harflar">{harflar.map((h) => <T key={h} b={h} v={h} sinf="is-harf" />)}{pi && <T b="π" v="π" y="pi soni" sinf="is-harf" />}</div>
    <div className="fm-qator">{DARAJALAR.map(([b, v, y]) => <T key={b} b={b} v={v} y={y} sinf="is-maxsus" />)}</div>
    {trig && <div className="fm-qator">{TRIG.map(([b, v, y]) => <T key={b} b={b} v={v} y={y} sinf="is-maxsus" />)}</div>}
    <div className="fm-qator">{AMALLAR.map(([b, v, y]) => <T key={b} b={b} v={v} y={y} sinf="is-amal" />)}</div>
    {/* 11 ta raqam + ⌫ = 6 × 2 to'liq to'r (⌫ yolg'iz o'zi alohida qatorga tushib qolmaydi) */}
    <div className="fm-qator fm-raqamlar">{RAQAMLAR.map((r) => <T key={r} b={r} v={r} />)}
      <button type="button" className="fm-t is-ochir" disabled={band || !bolaklar.length} onClick={ochir} aria-label={__kbUi("O‘chirish")}>⌫</button></div>
  </div>;
}

/** Bitta formula topshirig'i. onNatija({ togri, urinish, korsatildi }) — to'g'ri yozilganda yoki javob ko'rsatilganda. */
export function FormulaMashq({ formula, onNatija }) {
  const [b, setB] = useState([]); const [hol, setHol] = useState(null); const [urinish, setUrinish] = useState(0); const [korsat, setKorsat] = useState(false);
  useEffect(() => { setB([]); setHol(null); setUrinish(0); setKorsat(false); }, [formula.id]);
  const matn = b.join(""); const belgi = useMemo(() => formulaBelgilari(formula.javoblar), [formula]); const harflar = useMemo(() => klaviaturaHarflari(formula.javoblar), [formula]);
  const tugadi = hol?.togri || korsat;
  const tekshir = () => { if (tugadi || !matn) return; const r = javobTekshir(matn, formula.javoblar); const n = urinish + 1; setUrinish(n); setHol(r);
    if (r.togri) onNatija?.({ togri: true, urinish: n, korsatildi: false }); };
  const korsatish = () => { setKorsat(true); onNatija?.({ togri: false, urinish, korsatildi: true }); };
  return <div className="fm-mashq">
    <p className="fm-mavzu">{__kbUi(formula.mavzu)} · {__kbUi(formula.nom)}</p>
    <p className="mq-izoh fm-savol">{__kbUi(formula.savol)}</p>
    <p className="fm-harf-izoh">{__kbUi(formula.izoh)}</p>
    <div className={`fm-doska ${hol ? (hol.togri ? "is-ok" : "is-xato") : ""}`} aria-live="polite">
      {matn ? (jonliLatex(matn) ? <FormulaKorinishi matn={matn} jonli /> : <span className="fm-xom">{matn}</span>) : <span className="fm-bosh">{__kbUi("Formulani pastdagi tugmalar bilan yozing")}</span>}
    </div>
    {hol && !hol.togri && !korsat && <p className="mq-xato" role="alert">✗ {__kbUi(SABAB_MATNI[hol.sabab] || SABAB_MATNI.boshqa)}</p>}
    {hol?.togri && <p className="mq-yutdi" role="status">✓ {__kbUi("To‘g‘ri!")} {urinish === 1 ? __kbUi("Birinchi urinishda.") : ""}</p>}
    {korsat && <div className="fm-javob"><small>{__kbUi("To‘g‘ri yozilishi:")}</small>{formula.javoblar.map((j) => <FormulaKorinishi key={j} matn={j} />)}</div>}
    {!tugadi && <FormulaKlaviatura bolaklar={b} onChange={(x) => { setB(x); setHol(null); }} harflar={harflar} trig={belgi.trig} pi={belgi.pi} onTekshir={tekshir} />}
    {!tugadi && <div className="mq-amallar">
      <button type="button" className="mq-asosiy" disabled={!matn} onClick={tekshir}>{__kbUi("Tekshirish")}</button>
      {urinish >= 2 && <button type="button" className="mq-havola" onClick={korsatish}>{__kbUi("To‘g‘ri javobni ko‘rsatish")}</button>}
    </div>}
    <details className="fm-yordam"><summary>{__kbUi("Qanday yoziladi")}</summary><ul>
      <li>{__kbUi("Daraja: avval harf, keyin x² (yoki x³). Boshqa daraja uchun xⁿ ni bosib, darajani yozing va qavsni yoping.")}</li>
      <li>{__kbUi("Kasr: surat va maxraj bir nechta haddan iborat bo‘lsa, ularni qavsga oling. Masalan: (a+b)/2.")}</li>
      <li>{__kbUi("Ildiz: √ ni bosing, ifodani yozing va qavsni yoping.")}</li>
      <li>{__kbUi("Ko‘paytirish belgisini yozmasa ham bo‘ladi: 2ab va 2·a·b bir xil.")}</li>
      <li>{__kbUi("Katta va kichik harflar farq qiladi: S va s — boshqa-boshqa.")}</li>
    </ul></details>
  </div>;
}

/** «Fan va mantiq o'yinlari» uchun: daraja va tartib raqami bo'yicha bitta formula. */
export function FormulaOyin({ daraja = 0, urug = 1, onYutdi }) {
  const f = useMemo(() => formulaOl(daraja, urug), [daraja, urug]);
  return <div className="mq-oyin"><FormulaMashq formula={f} onNatija={(r) => { if (r.togri) onYutdi?.(); }} /></div>;
}
