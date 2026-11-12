// REV526: «🧠 Mantiq o'yinlari» (1–11-sinf): Sudoku, Son yasash, Kod ochish, Nonogramma. Har topshiriq yangi (urug'), yechimi kafolatlangan.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { sudokuYasa, sudokuXatolar, sudokuTugadi, SUDOKU_QUTI, sonYasa, sonTekshir, kodYasa, kodBaho, nonogramYasa, nonogramTogri } from "./mantiqRules.js";
import { Tarozi, KasrYigish, Koordinata, Funksiya, Sehrli } from "./MatOyin.jsx";   // REV527
import "./mantiq.css";

const OYINLAR = [
  { k: "sudoku", g: "Mantiq", b: "🔢", nom: "Sudoku", izoh: "Har qator, ustun va qutida raqamlar takrorlanmasin" },
  { k: "son", g: "Mantiq", b: "🎯", nom: "Son yasash", izoh: "Berilgan sonlardan amallar bilan nishon sonni hosil qiling" },
  { k: "kod", g: "Mantiq", b: "🔐", nom: "Kod ochish", izoh: "Maxfiy kodni mantiq bilan toping" },
  { k: "nonogram", g: "Mantiq", b: "🖼️", nom: "Nonogramma", izoh: "Sonlar bo‘yicha kataklarni bo‘yab, rasmni oching" },
  { k: "tarozi", g: "Matematika", b: "⚖️", nom: "Tarozi-tenglama", izoh: "Tarozi muvozanatda — x ni toping (qadamma-qadam yordam bilan)" },
  { k: "kasr", g: "Matematika", b: "🥧", nom: "Kasr yig‘ish", izoh: "Bo‘laklardan nishon kasrni aniq yig‘ing" },
  { k: "koordinata", g: "Matematika", b: "📍", nom: "Koordinata nishoni", izoh: "Nuqtani koordinatasi bo‘yicha toping; simmetriya va siljitish" },
  { k: "funksiya", g: "Matematika", b: "⚙️", nom: "Funksiya mashinasi", izoh: "Kirish va chiqishga qarab qoidani toping" },
  { k: "sehrli", g: "Matematika", b: "🧮", nom: "Sehrli kvadrat", izoh: "Hamma qator, ustun va diagonal yig‘indisi teng bo‘lsin" },
];
const DARAJA = ["Oson", "O‘rta", "Qiyin"];
const RANG = ["#E63946", "#FFD23F", "#3A86FF", "#2DBE60", "#FF8C1A", "#9B5DE5", "#FF70A6", "#8B5A2B"];
const xot = { ol: (k, d) => { try { return Number(localStorage.getItem(`kabutar:mantiq:${k}:${d}`)) || 0; } catch { return 0; } },
  yoz: (k, d, n) => { try { localStorage.setItem(`kabutar:mantiq:${k}:${d}`, String(n)); } catch { /* */ } } };

function Sudoku({ daraja, urug, onYutdi }) {
  const n = [4, 6, 9][daraja];
  const t = useMemo(() => sudokuYasa(n, urug, daraja === 2 ? 1 : 0), [n, urug, daraja]);
  const [g, setG] = useState(() => t.bosh.map((q) => [...q])), [tanlov, setTanlov] = useState(null), [yutdi, setYutdi] = useState(false);
  useEffect(() => { setG(t.bosh.map((q) => [...q])); setTanlov(null); setYutdi(false); }, [t]);
  const xato = useMemo(() => new Set(sudokuXatolar(g, n).map(([i, j]) => `${i}:${j}`)), [g, n]);
  const qoy = (v) => { if (!tanlov || yutdi) return; const [i, j] = tanlov; if (t.bosh[i][j]) return;
    const y = g.map((q) => [...q]); y[i][j] = v; setG(y); if (sudokuTugadi(y, n)) { setYutdi(true); onYutdi(); } };
  const [bq, bu] = SUDOKU_QUTI[n];
  return <div className="mq-oyin">
    <div className="mq-sudoku" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, maxWidth: n === 9 ? 460 : n === 6 ? 380 : 300 }}>
      {g.map((q, i) => q.map((v, j) => <button key={`${i}:${j}`} type="button" onClick={() => setTanlov([i, j])}
        className={`${t.bosh[i][j] ? "is-berilgan" : ""} ${tanlov && tanlov[0] === i && tanlov[1] === j ? "is-tanlov" : ""} ${xato.has(`${i}:${j}`) ? "is-xato" : ""} ${tanlov && v && g[tanlov[0]][tanlov[1]] === v ? "is-bir" : ""}`}
        style={{ borderRightWidth: (j + 1) % bu === 0 && j + 1 < n ? 3 : 1, borderBottomWidth: (i + 1) % bq === 0 && i + 1 < n ? 3 : 1 }}>{v || ""}</button>))}
    </div>
    <div className="mq-raqamlar">{Array.from({ length: n }, (_, k) => <button key={k} type="button" onClick={() => qoy(k + 1)}>{k + 1}</button>)}
      <button type="button" onClick={() => qoy(0)} aria-label={__kbUi("O‘chirish")}>⌫</button></div>
    {yutdi && <p className="mq-yutdi">🎉 {__kbUi("Barakalla! Sudoku yechildi")}</p>}
  </div>;
}

function SonYasash({ daraja, urug, onYutdi }) {
  const t = useMemo(() => sonYasa(urug, daraja), [urug, daraja]);
  const [ifoda, setIfoda] = useState(""), [hol, setHol] = useState(""), [yechim, setYechim] = useState(false);
  useEffect(() => { setIfoda(""); setHol(""); setYechim(false); }, [t]);
  const tekshir = () => { const r = sonTekshir(ifoda, t.sonlar, t.nishon); setHol(r); if (r === "ok") onYutdi(); };
  const qosh = (x) => { setHol(""); setIfoda((s) => s + x); };
  return <div className="mq-oyin">
    <div className="mq-nishon">{__kbUi("Nishon")}: <b>{t.nishon}</b></div>
    <div className="mq-sonlar">{t.sonlar.map((s, i) => <button key={i} type="button" onClick={() => qosh(String(s))}>{s}</button>)}</div>
    <div className="mq-ifoda" aria-live="polite">{ifoda || <span>{__kbUi("Sonlar va amallarni bosing")}</span>}</div>
    <div className="mq-amallar">{["+", "−", "×", "÷", "(", ")"].map((a) => <button key={a} type="button" onClick={() => qosh(a)}>{a}</button>)}
      <button type="button" onClick={() => { setHol(""); setIfoda((s) => s.slice(0, -1)); }}>⌫</button>
      <button type="button" className="mq-asosiy" onClick={tekshir} disabled={hol === "ok"}>= ?</button></div>
    {hol === "ok" && <p className="mq-yutdi">🎉 {__kbUi("To‘g‘ri!")} {ifoda} = {t.nishon}</p>}
    {hol === "sonlar" && <p className="mq-xato">{__kbUi("Har bir berilgan sonni aynan bir marta ishlating")}</p>}
    {hol === "qiymat" && <p className="mq-xato">{__kbUi("Natija nishonga teng emas — yana urinib ko‘ring")}</p>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Ifoda noto‘g‘ri yozilgan")}</p>}
    {hol !== "ok" && <button type="button" className="mq-havola" onClick={() => setYechim(true)}>{__kbUi("Yechimni ko‘rsatish")}</button>}
    {yechim && <p className="mq-izoh">💡 {t.yechim} = {t.nishon}</p>}
  </div>;
}

function KodOchish({ daraja, urug, onYutdi }) {
  const t = useMemo(() => kodYasa(urug, daraja), [urug, daraja]);
  const [tarix, setTarix] = useState([]), [joriy, setJoriy] = useState([]);
  useEffect(() => { setTarix([]); setJoriy([]); }, [t]);
  const yutdi = tarix.some((x) => x.b.joyida === t.uzun), tugadi = yutdi || tarix.length >= t.urinish;
  const bos = (c) => { if (tugadi || joriy.length >= t.uzun || (!t.takror && joriy.includes(c))) return; setJoriy([...joriy, c]); };
  const yubor = () => { if (joriy.length !== t.uzun) return; const b = kodBaho(joriy, t.sir); setTarix([...tarix, { t: joriy, b }]); setJoriy([]); if (b.joyida === t.uzun) onYutdi(); };
  const Dona = ({ c }) => <i className="mq-dona" style={{ background: c == null ? "#e3eaf2" : RANG[c] }} />;
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Maxfiy kod")}: {t.uzun} {__kbUi("ta rang")}{t.takror ? ` (${__kbUi("takrorlanishi mumkin")})` : ` (${__kbUi("takrorlanmaydi")})`}. ⚫ — {__kbUi("rang va o‘rni to‘g‘ri")}, ⚪ — {__kbUi("rang bor, o‘rni boshqa")}.</p>
    <div className="mq-kod-tarix">{tarix.map((x, i) => <div key={i} className="mq-kod-qator"><small>{i + 1}</small>{x.t.map((c, k) => <Dona key={k} c={c} />)}
      <span className="mq-baho">{"⚫".repeat(x.b.joyida)}{"⚪".repeat(x.b.bor)}{x.b.joyida + x.b.bor === 0 ? "—" : ""}</span></div>)}
      {!tugadi && <div className="mq-kod-qator is-joriy"><small>{tarix.length + 1}</small>{Array.from({ length: t.uzun }, (_, k) => <Dona key={k} c={joriy[k]} />)}</div>}</div>
    {!tugadi && <><div className="mq-palitra">{Array.from({ length: t.belgi }, (_, c) => <button key={c} type="button" onClick={() => bos(c)} style={{ background: RANG[c] }} aria-label={`${c + 1}`} />)}</div>
      <div className="mq-amallar"><button type="button" onClick={() => setJoriy(joriy.slice(0, -1))}>⌫</button>
        <button type="button" className="mq-asosiy" onClick={yubor} disabled={joriy.length !== t.uzun}>{__kbUi("Tekshirish")}</button>
        <small>{__kbUi("Qoldi")}: {t.urinish - tarix.length}</small></div></>}
    {yutdi && <p className="mq-yutdi">🎉 {__kbUi("Kod ochildi!")} ({tarix.length} {__kbUi("urinishda")})</p>}
    {tugadi && !yutdi && <div className="mq-xato">{__kbUi("Urinishlar tugadi. Kod")}: <span className="mq-kod-qator" style={{ display: "inline-flex" }}>{t.sir.map((c, k) => <Dona key={k} c={c} />)}</span></div>}
  </div>;
}

function Nonogram({ daraja, urug, onYutdi }) {
  const t = useMemo(() => nonogramYasa(urug, daraja), [urug, daraja]);
  const [g, setG] = useState(() => t.rasm.map((q) => q.map(() => 0))), [rejim, setRejim] = useState(1), [yutdi, setYutdi] = useState(false);
  useEffect(() => { setG(t.rasm.map((q) => q.map(() => 0))); setYutdi(false); }, [t]);
  const bos = (i, j) => { if (yutdi) return; const y = g.map((q) => [...q]); y[i][j] = y[i][j] === rejim ? 0 : rejim; setG(y);
    if (nonogramTogri(y, t.qator, t.ustun)) { setYutdi(true); onYutdi(); } };
  const eng = Math.max(...t.ustun.map((u) => u.length));
  return <div className="mq-oyin">
    <div className="mq-nono" style={{ "--n": t.n }}>
      <div className="mq-nono-burchak" />
      {t.ustun.map((u, j) => <div key={`u${j}`} className="mq-nono-ust" style={{ minHeight: eng * 18 }}>{u.map((v, k) => <span key={k}>{v}</span>)}</div>)}
      {g.map((q, i) => <React.Fragment key={i}><div className="mq-nono-qat">{t.qator[i].map((v, k) => <span key={k}>{v}</span>)}</div>
        {q.map((v, j) => <button key={j} type="button" onClick={() => bos(i, j)} className={v === 1 ? "is-boyoq" : v === 2 ? "is-yoq" : ""}>{v === 2 ? "×" : ""}</button>)}</React.Fragment>)}
    </div>
    <div className="mq-amallar"><button type="button" className={rejim === 1 ? "mq-asosiy" : ""} onClick={() => setRejim(1)}>■ {__kbUi("Bo‘yash")}</button>
      <button type="button" className={rejim === 2 ? "mq-asosiy" : ""} onClick={() => setRejim(2)}>× {__kbUi("Bo‘sh deb belgilash")}</button></div>
    <p className="mq-izoh">{__kbUi("Sonlar — shu qator yoki ustunda ketma-ket nechta katak bo‘yalganini bildiradi.")}</p>
    {yutdi && <p className="mq-yutdi">🎉 {__kbUi("Rasm ochildi!")}</p>}
  </div>;
}

const KOMP = { sudoku: Sudoku, son: SonYasash, kod: KodOchish, nonogram: Nonogram, tarozi: Tarozi, kasr: KasrYigish, koordinata: Koordinata, funksiya: Funksiya, sehrli: Sehrli };

export default function MantiqOyinlari({ sinf = "", onClose }) {
  const s = Number((/\d{1,2}/.exec(String(sinf)) || [0])[0]);
  const [oyin, setOyin] = useState(null), [daraja, setDaraja] = useState(s >= 9 ? 2 : s >= 5 ? 1 : 0), [soni, setSoni] = useState(0), [yutildi, setYutildi] = useState(false);
  useEffect(() => { if (oyin) { setSoni(xot.ol(oyin.k, daraja)); setYutildi(false); } }, [oyin, daraja]);
  if (oyin) { const K = KOMP[oyin.k];
    return <div className="mq-sahifa">
      <div className="mq-bosh"><button type="button" className="mq-ortga" onClick={() => setOyin(null)}>← {__kbUi("Mantiq o‘yinlari")}</button>
        <b>{oyin.b} {__kbUi(oyin.nom)}</b><span className="mq-yulduz">⭐ {soni}</span></div>
      <div className="mq-daraja">{DARAJA.map((d, i) => <button key={d} type="button" className={i === daraja ? "is-on" : ""} onClick={() => setDaraja(i)}>{__kbUi(d)}</button>)}</div>
      <K key={`${oyin.k}-${daraja}-${soni}`} daraja={daraja} urug={soni + 1} onYutdi={() => { xot.yoz(oyin.k, daraja, soni + 1); setYutildi(true); }} />
      <div className="mq-pastki">{yutildi ? <button type="button" className="mq-asosiy" onClick={() => { setSoni(soni + 1); setYutildi(false); }}>{__kbUi("Keyingi topshiriq")} ▶</button>
        : <button type="button" className="mq-havola" onClick={() => setSoni(soni + 1)}>{__kbUi("Boshqa topshiriq")} ↻</button>}</div>
    </div>; }
  return <div className="mq-sahifa">
    <div className="mq-bosh"><div><h2>🧠 {__kbUi("Mantiq va matematika o‘yinlari")}</h2><small>{__kbUi("Har topshiriq yangi, yechimi bor. Darajani o‘zingiz tanlaysiz.")}</small></div>
      {onClose && <button type="button" className="mq-ortga" onClick={onClose}>← {__kbUi("O‘yinlar")}</button>}</div>
    {["Mantiq", "Matematika"].map((gr) => <React.Fragment key={gr}><h3 className="mq-guruh">{__kbUi(gr)}</h3>
      <div className="mq-kartalar">{OYINLAR.filter((o) => o.g === gr).map((o) => <button key={o.k} type="button" className="mq-karta" onClick={() => setOyin(o)}>
        <span aria-hidden="true">{o.b}</span><div><b>{__kbUi(o.nom)}</b><small>{__kbUi(o.izoh)}</small>
          <em>⭐ {[0, 1, 2].reduce((a, d) => a + xot.ol(o.k, d), 0)}</em></div></button>)}</div></React.Fragment>)}
  </div>;
}
