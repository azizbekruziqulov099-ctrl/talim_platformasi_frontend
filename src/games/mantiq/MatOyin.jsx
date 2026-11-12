// REV527: matematika o'yinlari — tarozi-tenglama, kasr yig'ish, koordinata nishoni, funksiya mashinasi, sehrli kvadrat.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { tenglamaYasa, kasrYasa, kasrYigindi, kasrTeng, koordinataYasa, funksiyaYasa, sehrliYasa, sehrliTogri } from "./matRules.js";

const K = "#13314f", SAR = "#f2b72e", KOK = "#4b8ad6", QIZ = "#d9534f";

function Klaviatura({ qiymat, setQiymat, manfiy = false }) {
  return <div className="mq-raqamlar">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((r) => <button key={r} type="button" onClick={() => setQiymat((q) => (q + r).slice(0, 5))}>{r}</button>)}
    {manfiy && <button type="button" onClick={() => setQiymat((q) => (q.startsWith("-") ? q.slice(1) : `-${q}`))}>±</button>}
    <button type="button" onClick={() => setQiymat((q) => q.slice(0, -1))} aria-label={__kbUi("O‘chirish")}>⌫</button></div>;
}

function Palla({ t, x0 }) {   // tarozi pallasi: k ta «x» quti va o birlik tosh (manfiy — sharcha)
  const xs = Array.from({ length: Math.min(t.k, 6) }), n = Math.abs(t.o);
  return <g>{xs.map((_, i) => <g key={i}><rect x={x0 + 6 + i * 20} y="46" width="17" height="17" rx="3" fill={SAR} stroke={K} /><text x={x0 + 14.5 + i * 20} y="59" fontSize="11" textAnchor="middle" fontWeight="700" fill={K}>x</text></g>)}
    {n <= 12 ? Array.from({ length: n }, (_, i) => <circle key={i} cx={x0 + 12 + (i % 6) * 17} cy={76 + Math.floor(i / 6) * 15} r="6" fill={t.o > 0 ? KOK : "#fff"} stroke={t.o > 0 ? K : QIZ} strokeWidth="1.5" />)
      : <text x={x0 + 60} y="84" fontSize="20" textAnchor="middle" fontWeight="800" fill={K}>{t.o}</text>}</g>;
}
export function Tarozi({ daraja, urug, onYutdi }) {
  const t = useMemo(() => tenglamaYasa(urug, daraja), [urug, daraja]);
  const [q, setQ] = useState(""), [hol, setHol] = useState(""), [qadam, setQadam] = useState(0);
  useEffect(() => { setQ(""); setHol(""); setQadam(0); }, [t]);
  const tekshir = () => { if (q === "" || q === "-") return; if (Number(q) === t.x) { setHol("ok"); onYutdi(); } else setHol("xato"); };
  return <div className="mq-oyin">
    <svg viewBox="0 0 280 130" style={{ width: "100%", maxWidth: 420 }}><polygon points="140,34 128,122 152,122" fill="#b9c6d6" /><line x1="14" y1="40" x2="266" y2="40" stroke={K} strokeWidth="4" strokeLinecap="round" />
      <rect x="10" y="42" width="124" height="62" rx="8" fill="#eef6ff" stroke={K} /><rect x="146" y="42" width="124" height="62" rx="8" fill="#eef6ff" stroke={K} />
      <Palla t={t.chap} x0={10} /><Palla t={t.ong} x0={146} /></svg>
    <div className="mq-nishon"><b style={{ fontSize: 26 }}>{t.matn}</b></div>
    <p className="mq-izoh">{__kbUi("Tarozi muvozanatda. Sariq qutichadagi x necha?")} {t.chap.o < 0 || t.ong.o < 0 ? __kbUi("(oq sharcha — manfiy birlik)") : ""}</p>
    <div className="mq-ifoda">x = {q || "?"}</div>
    <Klaviatura qiymat={q} setQiymat={(f) => { setHol(""); setQ(f); }} manfiy={daraja === 2} />
    <div className="mq-amallar"><button type="button" className="mq-asosiy" onClick={tekshir} disabled={hol === "ok"}>{__kbUi("Tekshirish")}</button>
      {hol !== "ok" && qadam < t.qadamlar.length && <button type="button" className="mq-havola" onClick={() => setQadam(qadam + 1)}>💡 {__kbUi("Bir qadam ko‘rsat")}</button>}</div>
    {t.qadamlar.slice(0, qadam).map((s, i) => <p key={i} className="mq-izoh" style={{ textAlign: "left", width: "100%" }}>{i + 1}. {__kbUi(s)}</p>)}
    {hol === "ok" && <p className="mq-yutdi">🎉 x = {t.x}</p>}{hol === "xato" && <p className="mq-xato">{__kbUi("Tarozi og‘ib ketdi — yana o‘ylab ko‘ring")}</p>}
  </div>;
}

const kasrMatn = ([s, m]) => (m === 1 ? String(s) : s > m ? `${Math.floor(s / m)} ${s % m}/${m}` : `${s}/${m}`);
function Doira({ kasr, rang = KOK }) {   // yig'ilgan qism (1 dan oshsa — ikkinchi doira)
  const [s, m] = kasr; const qiymat = s / m; const R = 44;
  const bitta = (ulush, cx) => { const a = Math.min(0.9999, Math.max(0, ulush)) * 2 * Math.PI, x = cx + R * Math.sin(a), y = 52 - R * Math.cos(a);
    return <g key={cx}><circle cx={cx} cy="52" r={R} fill="#eef2f7" stroke={K} strokeWidth="2" />{ulush > 0 && <path d={`M${cx},52 L${cx},${52 - R} A${R},${R} 0 ${a > Math.PI ? 1 : 0} 1 ${x},${y} Z`} fill={rang} stroke={K} />}</g>; };
  return <svg viewBox="0 0 210 104" style={{ width: "100%", maxWidth: 260 }}>{bitta(Math.min(1, qiymat), 54)}{qiymat > 1 && bitta(qiymat - 1, 156)}</svg>;
}
export function KasrYigish({ daraja, urug, onYutdi }) {
  const t = useMemo(() => kasrYasa(urug, daraja), [urug, daraja]);
  const [tan, setTan] = useState([]), [yutdi, setYutdi] = useState(false);
  useEffect(() => { setTan([]); setYutdi(false); }, [t]);
  const yig = kasrYigindi(t.bolaklar, tan);
  const bos = (i) => { if (yutdi) return; const y = tan.includes(i) ? tan.filter((k) => k !== i) : [...tan, i]; setTan(y);
    if (kasrTeng(kasrYigindi(t.bolaklar, y), t.nishon)) { setYutdi(true); onYutdi(); } };
  const ortiq = yig[0] * t.nishon[1] > t.nishon[0] * yig[1];
  return <div className="mq-oyin">
    <div className="mq-nishon">{__kbUi("Nishon")}: <b>{kasrMatn(t.nishon)}</b></div>
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}><Doira kasr={t.nishon} rang={SAR} /><small>{__kbUi("kerak")}</small></div>
      <div style={{ textAlign: "center" }}><Doira kasr={yig} rang={ortiq ? QIZ : KOK} /><small>{__kbUi("yig‘ildi")}: {tan.length ? kasrMatn(yig) : "0"}</small></div></div>
    <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{t.bolaklar.map((b, i) => <button key={i} type="button" onClick={() => bos(i)}
      style={{ background: tan.includes(i) ? KOK : "#fff3c4", color: tan.includes(i) ? "#fff" : K }}>{b[0]}/{b[1]}</button>)}</div>
    <p className="mq-izoh">{__kbUi("Bo‘laklarni tanlab, nishon kasrni aniq yig‘ing.")}</p>
    {ortiq && !yutdi && <p className="mq-xato">{__kbUi("Ortib ketdi — biror bo‘lakni olib tashlang")}</p>}
    {yutdi && <p className="mq-yutdi">🎉 {tan.map((i) => `${t.bolaklar[i][0]}/${t.bolaklar[i][1]}`).join(" + ")} = {kasrMatn(t.nishon)}</p>}
  </div>;
}

export function Koordinata({ daraja, urug, onYutdi }) {
  const t = useMemo(() => koordinataYasa(urug, daraja, 6), [urug, daraja]);
  const [i, setI] = useState(0), [topildi, setTopildi] = useState([]), [xato, setXato] = useState(null), [xatolar, setXatolar] = useState(0);
  useEffect(() => { setI(0); setTopildi([]); setXato(null); setXatolar(0); }, [t]);
  const n = t.max - t.min, W = 300, P = 22, q = (W - 2 * P) / n, sx = (x) => P + (x - t.min) * q, sy = (y) => W - P - (y - t.min) * q;
  const tugadi = i >= t.topshiriqlar.length, j = t.topshiriqlar[i];
  const bos = (x, y) => { if (tugadi) return;
    if (x === j.x && y === j.y) { setTopildi([...topildi, j]); setXato(null); if (i + 1 >= t.topshiriqlar.length) onYutdi(); setI(i + 1); } else { setXato([x, y]); setXatolar(xatolar + 1); } };
  return <div className="mq-oyin">
    <div className="mq-nishon" style={{ fontSize: 17, textAlign: "center" }}>{tugadi ? `🎉 ${__kbUi("Hamma nishon topildi!")}` : <><small>{i + 1} / {t.topshiriqlar.length}</small><br /><b style={{ fontSize: 20 }}>{__kbUi(j.matn)}</b></>}</div>
    <svg viewBox={`0 0 ${W} ${W}`} style={{ width: "100%", maxWidth: 380, touchAction: "manipulation" }}>
      {Array.from({ length: n + 1 }, (_, k) => t.min + k).map((v) => <g key={v}><line x1={sx(v)} y1={sy(t.min)} x2={sx(v)} y2={sy(t.max)} stroke={v === 0 ? K : "#dbe3ec"} strokeWidth={v === 0 ? 2 : 1} />
        <line x1={sx(t.min)} y1={sy(v)} x2={sx(t.max)} y2={sy(v)} stroke={v === 0 ? K : "#dbe3ec"} strokeWidth={v === 0 ? 2 : 1} />
        <text x={sx(v)} y={sy(t.min > 0 ? t.min : Math.max(t.min, 0)) + 13} fontSize="9" textAnchor="middle" fill="#5b6573">{v}</text>
        {v !== 0 && <text x={sx(Math.max(t.min, 0)) - 6} y={sy(v) + 3} fontSize="9" textAnchor="end" fill="#5b6573">{v}</text>}</g>)}
      {Array.from({ length: (n + 1) * (n + 1) }, (_, k) => { const x = t.min + (k % (n + 1)), y = t.min + Math.floor(k / (n + 1));
        return <circle key={k} cx={sx(x)} cy={sy(y)} r={q * 0.42} fill="transparent" style={{ cursor: "pointer" }} onClick={() => bos(x, y)} />; })}
      {topildi.map((p, k) => <g key={k}><circle cx={sx(p.x)} cy={sy(p.y)} r="7" fill="#2e9e5b" /><text x={sx(p.x)} y={sy(p.y) + 3.5} fontSize="9" textAnchor="middle" fill="#fff" fontWeight="700">{k + 1}</text></g>)}
      {xato && <g><line x1={sx(xato[0]) - 6} y1={sy(xato[1]) - 6} x2={sx(xato[0]) + 6} y2={sy(xato[1]) + 6} stroke={QIZ} strokeWidth="3" /><line x1={sx(xato[0]) + 6} y1={sy(xato[1]) - 6} x2={sx(xato[0]) - 6} y2={sy(xato[1]) + 6} stroke={QIZ} strokeWidth="3" /></g>}
    </svg>
    {xato && !tugadi && <p className="mq-xato">{__kbUi("Bu nuqta")} ({xato[0]}; {xato[1]}). {__kbUi("Birinchi son — o‘ngga yoki chapga (x), ikkinchisi — yuqoriga yoki pastga (y).")}</p>}
    <p className="mq-izoh">{__kbUi("Xatolar")}: {xatolar}</p>
  </div>;
}

export function Funksiya({ daraja, urug, onYutdi }) {
  const t = useMemo(() => funksiyaYasa(urug, daraja), [urug, daraja]);
  const [q, setQ] = useState(""), [hol, setHol] = useState(""), [qoida, setQoida] = useState(null);
  useEffect(() => { setQ(""); setHol(""); setQoida(null); }, [t]);
  const tekshir = () => { if (q === "" || q === "-") return; setHol(Number(q) === t.javob ? "son" : "xato"); };
  return <div className="mq-oyin">
    <p className="mq-izoh">⚙️ {__kbUi("Mashina har songa bir xil qoidani qo‘llaydi. Qoidani toping!")}</p>
    <div className="mq-mashina">{t.misollar.map(([a, b], i) => <div key={i}><span>{a}</span><i>⚙️→</i><span className="is-chiq">{b}</span></div>)}
      <div><span>{t.savol}</span><i>⚙️→</i><span className="is-savol">{hol === "son" || hol === "ok" ? t.javob : q || "?"}</span></div></div>
    {hol !== "son" && hol !== "ok" && <><Klaviatura qiymat={q} setQiymat={(f) => { setHol(""); setQ(f); }} manfiy />
      <button type="button" className="mq-asosiy" onClick={tekshir}>{__kbUi("Tekshirish")}</button></>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Mos kelmadi — misollardagi kirish va chiqishni solishtiring")}</p>}
    {(hol === "son" || hol === "ok") && <><p className="mq-izoh"><b>{__kbUi("Endi qoidaning o‘zini tanlang")}:</b></p>
      <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{t.variantlar.map((v, k) => <button key={v} type="button" disabled={hol === "ok"}
        onClick={() => { setQoida(k); if (k === t.togri) { setHol("ok"); onYutdi(); } }} style={{ minWidth: 110, background: qoida === k ? (k === t.togri ? "#bfe6cd" : "#fdecea") : "#fff3c4" }}>y = {v}</button>)}</div></>}
    {hol === "ok" && <p className="mq-yutdi">🎉 y = {t.qoida}</p>}
  </div>;
}

export function Sehrli({ daraja, urug, onYutdi }) {
  const t = useMemo(() => sehrliYasa(urug, daraja), [urug, daraja]);
  const [g, setG] = useState(() => t.bosh.map((q) => q.map((v) => (v == null ? "" : String(v))))), [tan, setTan] = useState(null), [yutdi, setYutdi] = useState(false);
  useEffect(() => { setG(t.bosh.map((q) => q.map((v) => (v == null ? "" : String(v))))); setTan(null); setYutdi(false); }, [t]);
  const yoz = (f) => { if (!tan || yutdi) return; const [i, j] = tan; const y = g.map((q) => [...q]); y[i][j] = f(y[i][j]); setG(y);
    if (sehrliTogri(y.map((q) => q.map((v) => (v === "" ? null : Number(v)))), t.yigindi)) { setYutdi(true); onYutdi(); } };
  const yig = (xs) => (xs.every((v) => v !== "") ? xs.reduce((a, b) => a + Number(b), 0) : null);
  return <div className="mq-oyin">
    <div className="mq-nishon">{__kbUi("Har qator, ustun va diagonal yig‘indisi")}: <b>{t.yigindi}</b></div>
    <div className="mq-sehrli">{g.map((q, i) => <React.Fragment key={i}>{q.map((v, j) => <button key={j} type="button" onClick={() => t.bosh[i][j] == null && setTan([i, j])}
      className={`${t.bosh[i][j] != null ? "is-berilgan" : ""} ${tan && tan[0] === i && tan[1] === j ? "is-tanlov" : ""}`}>{v}</button>)}
      <span className={yig(q) == null ? "" : yig(q) === t.yigindi ? "is-ok" : "is-no"}>{yig(q) ?? "·"}</span></React.Fragment>)}
      {[0, 1, 2].map((j) => { const s = yig(g.map((q) => q[j])); return <span key={j} className={s == null ? "" : s === t.yigindi ? "is-ok" : "is-no"}>{s ?? "·"}</span>; })}<span /></div>
    <Klaviatura qiymat={tan ? g[tan[0]][tan[1]] : ""} setQiymat={(f) => yoz((eski) => (typeof f === "function" ? f(eski) : f).replace("-", "").slice(0, 2))} />
    <p className="mq-izoh">{__kbUi("Bo‘sh katakni bosing va sonni kiriting. O‘ngda va pastda — yig‘indilar.")}</p>
    {yutdi && <p className="mq-yutdi">🎉 {__kbUi("Sehrli kvadrat tayyor!")}</p>}
  </div>;
}
