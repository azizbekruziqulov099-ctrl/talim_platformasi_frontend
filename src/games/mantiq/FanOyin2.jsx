// REV530: tabiiy fan o'yinlari — ozuqa zanjiri, elektr zanjiri, kimyoviy tenglama, davriy jadval. Chizmalar SVG (ilmiy uslubda).
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { ozuqaYasa, ozuqaTogri, elektrYasa, zanjirTok, kimyoYasa, tenglamaTekshir, tomonAtom, davriyYasa, ELEMENTLAR } from "./fanRules.js";

const K = "#13314f";

export function Ozuqa({ daraja, urug, onYutdi }) {
  const t = useMemo(() => ozuqaYasa(urug, daraja), [urug, daraja]);
  const [tan, setTan] = useState([]), [hol, setHol] = useState("");
  useEffect(() => { setTan([]); setHol(""); }, [t]);
  const bos = (i) => { if (hol === "ok" || tan.includes(i)) return; const y = [...tan, i]; setTan(y); setHol("");
    if (y.length === t.zanjir.length) { if (ozuqaTogri(y, t.zanjir)) { setHol("ok"); onYutdi(); } else setHol("xato"); } };
  return <div className="mq-oyin">
    <p className="mq-izoh">🌍 {__kbUi("Muhit")}: <b>{__kbUi(t.muhit)}</b>. {__kbUi("Ozuqa zanjirini tuzing: o‘simlikdan boshlab, kim kimni yeyishi tartibida.")}</p>
    <div className="mq-zanjir" style={{ minHeight: 64 }}>{tan.length ? tan.map((k, n) => <React.Fragment key={k}>{n > 0 && <i>→</i>}<span style={{ textAlign: "center" }}><b style={{ fontSize: 26 }}>{t.zanjir[k][0]}</b><br /><small>{__kbUi(t.zanjir[k][1])}</small></span></React.Fragment>)
      : <small style={{ color: "#8a94a3" }}>{__kbUi("Birinchi — quyosh nuridan ozuqa hosil qiladigan o‘simlik")}</small>}</div>
    <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{t.tartib.map((i) => <button key={i} type="button" onClick={() => bos(i)} disabled={tan.includes(i)}
      style={{ height: 76, minWidth: 84, opacity: tan.includes(i) ? 0.3 : 1, fontSize: 14, lineHeight: 1.2 }}><span style={{ fontSize: 28 }}>{t.zanjir[i][0]}</span><br />{__kbUi(t.zanjir[i][1])}</button>)}</div>
    <div className="mq-amallar"><button type="button" onClick={() => { setHol(""); setTan(tan.slice(0, -1)); }}>⌫</button><button type="button" onClick={() => { setHol(""); setTan([]); }}>↺</button></div>
    {hol === "ok" && <p className="mq-yutdi">🎉 {__kbUi("Zanjir to‘g‘ri! Energiya o‘simlikdan yirtqichga o‘tadi.")}</p>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Tartib noto‘g‘ri. Eslatma: har bir jonzot o‘zidan oldingisi bilan oziqlanadi.")}</p>}
  </div>;
}

// Ketma-ket/parallel tarmoqni chizish
const KW = 62, KH = 34, ORA = 10, RAIL = 16;
function olcham(d) { if (d.t === "k") return [KW, KH]; const q = d.q.map(olcham);
  return d.t === "s" ? [q.reduce((a, x) => a + x[0], 0), Math.max(...q.map((x) => x[1]))] : [Math.max(...q.map((x) => x[0])) + 2 * RAIL, q.reduce((a, x) => a + x[1], 0) + ORA * (q.length - 1)]; }
function Tarmoq({ d, x, y, yopiq, bos }) {
  const [w, h] = olcham(d), my = y + h / 2;
  if (d.t === "k") { const on = yopiq.has(d.id);
    return <g onClick={() => bos(d.id)} style={{ cursor: "pointer" }}><rect x={x} y={y} width={w} height={h} fill="transparent" />
      <line x1={x} y1={my} x2={x + 18} y2={my} stroke={K} strokeWidth="3" /><line x1={x + w - 18} y1={my} x2={x + w} y2={my} stroke={K} strokeWidth="3" />
      <circle cx={x + 18} cy={my} r="4" fill={K} /><circle cx={x + w - 18} cy={my} r="4" fill={K} />
      <line x1={x + 18} y1={my} x2={x + w - 18} y2={on ? my : my - 15} stroke={on ? "#2e9e5b" : "#d9534f"} strokeWidth="4" strokeLinecap="round" />
      <text x={x + w / 2} y={my + 16} fontSize="10" textAnchor="middle" fill="#5b6573" fontWeight="700">K{d.id}</text></g>; }
  if (d.t === "s") { let cx = x; return <g>{d.q.map((c, i) => { const [cw, ch] = olcham(c); const el = <Tarmoq key={i} d={c} x={cx} y={my - ch / 2} yopiq={yopiq} bos={bos} />; cx += cw; return el; })}</g>; }
  let cy = y; const ich = w - 2 * RAIL; const mids = [];
  const bolalar = d.q.map((c, i) => { const [cw, ch] = olcham(c); const bx = x + RAIL + (ich - cw) / 2, cm = cy + ch / 2; mids.push(cm);
    const el = <g key={i}><line x1={x} y1={cm} x2={bx} y2={cm} stroke={K} strokeWidth="3" /><line x1={bx + cw} y1={cm} x2={x + w} y2={cm} stroke={K} strokeWidth="3" /><Tarmoq d={c} x={bx} y={cy} yopiq={yopiq} bos={bos} /></g>; cy += ch + ORA; return el; });
  return <g>{bolalar}<line x1={x} y1={Math.min(...mids)} x2={x} y2={Math.max(...mids)} stroke={K} strokeWidth="3" /><line x1={x + w} y1={Math.min(...mids)} x2={x + w} y2={Math.max(...mids)} stroke={K} strokeWidth="3" />
    <circle cx={x} cy={my} r="3.5" fill={K} /><circle cx={x + w} cy={my} r="3.5" fill={K} /></g>;
}
export function Elektr({ daraja, urug, onYutdi }) {
  const t = useMemo(() => elektrYasa(urug, daraja), [urug, daraja]);
  const [yopiq, setYopiq] = useState(() => new Set()), [yutdi, setYutdi] = useState(false);
  useEffect(() => { setYopiq(new Set()); setYutdi(false); }, [t]);
  const tok = zanjirTok(t.daraxt, yopiq);
  const bos = (id) => { if (yutdi) return; const y = new Set(yopiq); if (y.has(id)) y.delete(id); else y.add(id); setYopiq(y);
    if (zanjirTok(t.daraxt, y) && y.size === t.engKam) { setYutdi(true); onYutdi(); } };
  const [w, h] = olcham(t.daraxt), W = w + 150, H = h + 84, my = 20 + h / 2;
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Kalitlarni bosib ulang. Vazifa: lampani ENG KAM kalit bilan yoqing")} — <b>{t.engKam}</b> {__kbUi("ta kalit yetadi.")}</p>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: Math.min(560, W * 1.5) }}>
      <polyline points={`40,${my} 26,${my} 26,${H - 16} ${W - 26},${H - 16} ${W - 26},${my} ${W - 40},${my}`} fill="none" stroke={K} strokeWidth="3" />
      <line x1="40" y1={my} x2="60" y2={my} stroke={K} strokeWidth="3" /><line x1={60 + w} y1={my} x2={W - 66} y2={my} stroke={K} strokeWidth="3" />
      {/* batareya */}<g><rect x="14" y={H - 44} width="24" height="20" fill="#fff" /><line x1="16" y1={H - 40} x2="36" y2={H - 40} stroke={K} strokeWidth="4" /><line x1="21" y1={H - 30} x2="31" y2={H - 30} stroke={K} strokeWidth="3" />
        <text x="44" y={H - 36} fontSize="11" fill={K} fontWeight="700">+</text><text x="44" y={H - 24} fontSize="11" fill={K} fontWeight="700">−</text></g>
      <Tarmoq d={t.daraxt} x={60} y={20} yopiq={yopiq} bos={bos} />
      {/* lampa */}<g>{tok && <circle cx={W - 53} cy={my} r="24" fill="#fff3a0" opacity="0.8" />}<circle cx={W - 53} cy={my} r="13" fill={tok ? "#ffd23f" : "#fff"} stroke={K} strokeWidth="3" />
        <path d={`M${W - 61},${my - 8} L${W - 45},${my + 8} M${W - 45},${my - 8} L${W - 61},${my + 8}`} stroke={K} strokeWidth="2" /></g>
    </svg>
    <p className="mq-izoh">{__kbUi("Ulangan kalitlar")}: <b>{yopiq.size}</b> · {tok ? `💡 ${__kbUi("lampa yonmoqda")}` : __kbUi("lampa o‘chiq")}</p>
    {tok && !yutdi && <p className="mq-xato">{__kbUi("Lampa yondi, lekin ortiqcha kalit ulangan — kamrog‘i bilan ham bo‘ladi.")}</p>}
    {yutdi && <p className="mq-yutdi">🎉 {__kbUi("Tok eng qisqa yo‘ldan o‘tdi!")}</p>}
    <p className="mq-izoh" style={{ fontSize: 13 }}>{__kbUi("Ketma-ket ulangan kalitlarning hammasi ulanishi kerak; parallel tarmoqda bittasi yetarli.")}</p>
  </div>;
}

const Formula = ({ f }) => <span>{f.split(/(\d+)/).map((p, i) => (/^\d+$/.test(p) ? <sub key={i}>{p}</sub> : <React.Fragment key={i}>{p}</React.Fragment>))}</span>;
export function Kimyo({ daraja, urug, onYutdi }) {
  const t = useMemo(() => kimyoYasa(urug, daraja), [urug, daraja]);
  const hamma = [...t.chap, ...t.ong];
  const [k, setK] = useState(() => hamma.map(() => 1)), [hol, setHol] = useState("");
  useEffect(() => { setK([...t.chap, ...t.ong].map(() => 1)); setHol(""); }, [t]);
  const a = tomonAtom(t.chap, k.slice(0, t.chap.length)), b = tomonAtom(t.ong, k.slice(t.chap.length)); const el = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const ozg = (i, d) => { if (hol === "ok") return; setHol(""); setK((e) => e.map((v, n) => (n === i ? Math.max(1, Math.min(12, v + d)) : v))); };
  const tekshir = () => { const r = tenglamaTekshir(t.chap, t.ong, k); setHol(r); if (r === "ok") onYutdi(); };
  const Modda = ({ i }) => <div className="mq-modda"><button type="button" onClick={() => ozg(i, 1)}>▲</button><b>{k[i] > 1 ? k[i] : ""}<Formula f={hamma[i]} /></b><button type="button" onClick={() => ozg(i, -1)}>▼</button></div>;
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Koeffitsientlarni tanlang: har element atomlari ikki tomonda teng bo‘lsin.")}</p>
    <div className="mq-tenglama">{t.chap.map((_, i) => <React.Fragment key={i}>{i > 0 && <i>+</i>}<Modda i={i} /></React.Fragment>)}<i>→</i>
      {t.ong.map((_, j) => <React.Fragment key={j}>{j > 0 && <i>+</i>}<Modda i={t.chap.length + j} /></React.Fragment>)}</div>
    <table className="mq-atom"><thead><tr><th>{__kbUi("Element")}</th><th>{__kbUi("Chapda")}</th><th>{__kbUi("O‘ngda")}</th></tr></thead>
      <tbody>{el.map((e) => <tr key={e} className={(a[e] || 0) === (b[e] || 0) ? "is-teng" : "is-farq"}><th>{e}</th><td>{a[e] || 0}</td><td>{b[e] || 0}</td></tr>)}</tbody></table>
    <button type="button" className="mq-asosiy" onClick={tekshir} disabled={hol === "ok"}>{__kbUi("Tekshirish")}</button>
    {hol === "ok" && <p className="mq-yutdi">🎉 {__kbUi("Tenglama tenglashdi!")}</p>}
    {hol === "qisqartir" && <p className="mq-xato">{__kbUi("Atomlar teng, lekin koeffitsientlarni qisqartirish mumkin — eng kichik butun sonlarni qo‘ying.")}</p>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Hali teng emas — jadvaldagi qizil qatorlarga qarang.")}</p>}
  </div>;
}

export function Davriy({ daraja, urug, onYutdi }) {
  const t = useMemo(() => davriyYasa(urug, daraja, 8), [urug, daraja]);
  const [i, setI] = useState(0), [tan, setTan] = useState(null), [togri, setTogri] = useState(0);
  useEffect(() => { setI(0); setTan(null); setTogri(0); }, [t]);
  if (i >= t.length) return <div className="mq-oyin"><p className={togri >= 6 ? "mq-yutdi" : "mq-xato"}>{togri >= 6 ? "🎉 " : ""}{togri} / {t.length} {__kbUi("to‘g‘ri")}</p>
    {togri < 6 && <p className="mq-izoh">{__kbUi("Yulduz uchun kamida 6 ta to‘g‘ri javob kerak. «Boshqa topshiriq»ni bosib qayta urinib ko‘ring.")}</p>}</div>;
  const q = t[i]; const N = [10, 20, 36][Math.max(0, Math.min(2, daraja))];
  const bos = (k) => { if (tan !== null) return; setTan(k); if (k === q.togri) setTogri(togri + 1); };
  return <div className="mq-oyin">
    <p className="mq-izoh">{i + 1} / {t.length} · {q.savol.tur === "belgi" ? __kbUi("Bu belgi qaysi elementniki?") : q.savol.tur === "nom" ? __kbUi("Bu elementning belgisi qaysi?") : __kbUi("Tartib raqami shu bo‘lgan element belgisi?")}</p>
    <div className="mq-nishon"><b>{q.savol.tur === "raqam" ? `№ ${q.savol.matn}` : q.savol.tur === "nom" ? __kbUi(q.savol.matn) : q.savol.matn}</b></div>
    <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{q.variantlar.map((v, k) => <button key={v} type="button" disabled={tan !== null} onClick={() => bos(k)}
      style={{ minWidth: 120, fontSize: 18, background: tan === null ? "#fff3c4" : k === q.togri ? "#bfe6cd" : k === tan ? "#fdecea" : "#f4f6f9" }}>{q.savol.tur === "belgi" ? __kbUi(v) : v}</button>)}</div>
    {tan !== null && <><div className="mq-davriy">{ELEMENTLAR.slice(0, N).map(([bel, , davr, guruh], z) => <span key={bel} className={z + 1 === q.z ? "is-shu" : ""} style={{ gridRow: davr, gridColumn: guruh }}>{bel}</span>)}</div>
      <p className={tan === q.togri ? "mq-yutdi" : "mq-xato"} style={{ fontSize: 15 }}>{tan === q.togri ? "✅ " : "❌ "}{q.z}. {ELEMENTLAR[q.z - 1][0]} — {__kbUi(ELEMENTLAR[q.z - 1][1])} · {__kbUi("davr")} {ELEMENTLAR[q.z - 1][2]}, {__kbUi("guruh")} {ELEMENTLAR[q.z - 1][3]}</p>
      <button type="button" className="mq-asosiy" onClick={() => { if (i + 1 >= t.length && togri >= 6) onYutdi(); setI(i + 1); setTan(null); }}>{__kbUi("Keyingi")} ▶</button></>}
  </div>;
}
