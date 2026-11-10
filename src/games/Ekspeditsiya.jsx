// REV456: «🧭 Matematik ekspeditsiya» — 20 bosqichli xarita, har bosqichda 15 topshiriq (spiral takrorlash, darvozalar).
// Xaritalar kod bilan chizilgan (4 uslub: vodiy, orollar, Samarqand, kosmos); Azizjonning rasmlari kelgach fon sifatida qo'yiladi.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import "./ekspeditsiya.css";

const TEG = { yangi: ["Yangi", "#1B4B7A"], takror: ["Takror", "#0D7A77"], uzoq: ["Eski mavzu", "#7A4FBF"], xato: ["Xatoni tuzatish", "#C2410C"], darvoza: ["Darvoza", "#B45309"] };
const USLUB = (k) => { const g = Number(String(k).replace(/\D/g, "")); return g <= 4 ? "vodiy" : g <= 6 ? "orol" : g <= 9 ? "shahar" : "kosmos"; };

function nuqtalar(W, H) {   // ilonsimon yo'l bo'ylab 20 bekat
  return Array.from({ length: 20 }, (_, i) => {
    const qator = Math.floor(i / 5), j = i % 5, ong = qator % 2 === 0;
    const x = 90 + (ong ? j : 4 - j) * ((W - 180) / 4), y = H - 90 - qator * ((H - 180) / 3);
    return [x, y + Math.sin(i * 1.3) * 14];
  });
}

function XaritaFon({ uslub, W, H }) {
  if (uslub === "orol") return <g>
    <rect width={W} height={H} fill="#bfe6f5" />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${(i * 97) % W} ${(i * 61) % H} q 12 -8 24 0 q 12 8 24 0`} stroke="#9fd3ea" strokeWidth="3" fill="none" />)}
    {[[160, 520, 90], [430, 470, 70], [700, 420, 85], [300, 300, 60], [620, 200, 80], [160, 140, 55]].map(([x, y, r], i) => <g key={i}>
      <ellipse cx={x} cy={y} rx={r * 1.3} ry={r * 0.7} fill="#f3d9a4" /><ellipse cx={x} cy={y - 6} rx={r} ry={r * 0.5} fill="#8fcf7a" />
      <path d={`M${x + r * 0.3} ${y - 10} l 3 -34 M${x + r * 0.3} ${y - 44} q -16 -4 -24 6 M${x + r * 0.3} ${y - 44} q 16 -6 26 4`} stroke="#5b8c3a" strokeWidth="4" fill="none" /></g>)}
  </g>;
  if (uslub === "shahar") return <g>
    <rect width={W} height={H} fill="#f6e7c8" />
    {[[120, 540], [330, 560], [560, 545], [760, 560]].map(([x, y], i) => <g key={i} opacity=".55"><rect x={x - 40} y={y - 60} width="80" height="60" fill="#e2c48f" /><path d={`M${x - 26} ${y - 60} a 26 26 0 0 1 52 0`} fill="#2f8fa3" /><rect x={x - 8} y={y - 34} width="16" height="34" rx="8" fill="#b88a4a" /></g>)}
    <g opacity=".5"><rect x="650" y="60" width="120" height="70" fill="#e2c48f" /><path d="M680 60 a 30 30 0 0 1 60 0" fill="#2f8fa3" /><rect x="640" y="40" width="10" height="90" fill="#cfa86a" /><rect x="770" y="40" width="10" height="90" fill="#cfa86a" /></g>
    {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={(i * 137) % W} cy={(i * 89) % H} r="2.5" fill="#d9b67a" />)}
  </g>;
  if (uslub === "kosmos") return <g>
    <rect width={W} height={H} fill="#0d1b3d" />
    {Array.from({ length: 80 }, (_, i) => <circle key={i} cx={(i * 53) % W} cy={(i * 97) % H} r={i % 7 === 0 ? 2 : 1} fill="#fff" opacity={0.4 + (i % 5) / 10} />)}
    <circle cx="720" cy="120" r="56" fill="#e0884f" /><ellipse cx="720" cy="120" rx="90" ry="16" fill="none" stroke="#f4c27a" strokeWidth="4" />
    <circle cx="120" cy="480" r="40" fill="#4f8fe0" /><circle cx="108" cy="470" r="12" fill="#7fc76a" opacity=".8" />
    <circle cx="430" cy="90" r="22" fill="#c8c8d8" />
  </g>;
  return <g>   {/* vodiy */}
    <rect width={W} height={H} fill="#e7f5dc" />
    <path d={`M0 ${H * 0.28} q ${W * 0.2} -80 ${W * 0.4} -10 t ${W * 0.6} -20 V0 H0Z`} fill="#c9e7b5" />
    <path d={`M${W * 0.62} 0 L${W * 0.72} 70 L${W * 0.8} 30 L${W * 0.9} 90 L${W} 40 V0Z`} fill="#b8c7d8" />
    <path d={`M0 ${H * 0.62} C ${W * 0.3} ${H * 0.5}, ${W * 0.5} ${H * 0.78}, ${W} ${H * 0.6}`} stroke="#8ec9ea" strokeWidth="26" fill="none" opacity=".8" />
    {Array.from({ length: 18 }, (_, i) => { const x = (i * 113) % W, y = (i * 71) % H; return <g key={i}><rect x={x - 3} y={y} width="6" height="14" fill="#8a5a2b" /><circle cx={x} cy={y - 6} r="14" fill="#6fbf5a" /></g>; })}
  </g>;
}

function Xarita({ kurs, d, onBosqich, onOrqaga }) {
  const W = 860, H = 640, uslub = USLUB(kurs);
  const P = useMemo(() => nuqtalar(W, H), []);
  const yol = P.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const yorq = uslub === "kosmos";
  return <div className="ek-xarita">
    <div className="ek-tepa"><button type="button" className="ek-t" onClick={onOrqaga}>←</button><b>{d.nom}</b>
      <span className="ek-chip">🔥 {d.streak || 0}</span><span className="ek-chip">✅ {d.jami || 0}</span>{d.xato_navbat > 0 && <span className="ek-chip" title={__kbUi("Qayta yechiladigan mavzular")}>🔁 {d.xato_navbat}</span>}</div>
    <svg viewBox={`0 0 ${W} ${H}`} className="ek-svg" role="img" aria-label={d.nom}>
      <XaritaFon uslub={uslub} W={W} H={H} />
      <path d={yol} stroke={yorq ? "#ffffff55" : "#ffffffcc"} strokeWidth="18" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={yol} stroke={yorq ? "#f4c27a" : "#c79a52"} strokeWidth="4" strokeDasharray="10 10" fill="none" />
      {d.bosqichlar.map((b, i) => { const [x, y] = P[i]; const r = b.darvoza ? 30 : 23;
        const fon = b.holat === "otdi" ? "#f2b72e" : b.holat === "ochiq" ? "#1B4B7A" : "#9aa5b1";
        return <g key={b.n} className={`ek-bekat is-${b.holat}`} onClick={() => b.holat !== "yopiq" && onBosqich(b.n)} style={{ cursor: b.holat === "yopiq" ? "default" : "pointer" }}>
          {b.darvoza && <path d={`M${x - 36} ${y + 26} V${y - 18} a 36 36 0 0 1 72 0 V${y + 26}`} fill="none" stroke={b.holat === "yopiq" ? "#9aa5b1" : "#B45309"} strokeWidth="7" />}
          <circle cx={x} cy={y} r={r} fill={fon} stroke="#fff" strokeWidth="4" />
          <text x={x} y={y + 6} textAnchor="middle" fill="#fff" fontSize={b.darvoza ? 18 : 16} fontWeight="800" fontFamily="system-ui">{b.holat === "yopiq" ? "🔒" : b.n}</text>
          {b.holat !== "yopiq" && <text x={x} y={y + r + 18} textAnchor="middle" fontSize="13">{"★".repeat(b.yulduz) + "☆".repeat(3 - b.yulduz)}</text>}
          {b.holat === "ochiq" && <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#fff" strokeWidth="3" className="ek-puls" />}
        </g>; })}
    </svg>
    <p className="ek-izoh">{__kbUi("Har bosqichda 15 ta topshiriq: yangi mavzu, yaqinda o‘tilgan va eski mavzular aralash keladi. Xato qilgan turingiz keyinroq yana qaytadi. Har 5-bosqich — sinov darvozasi (15 tadan 12 tasi to‘g‘ri bo‘lishi kerak).")}</p>
  </div>;
}

function Oyin({ api, kurs, n, onTugadi, onOrqaga }) {
  const [dat, setDat] = useState(null);
  const [i, setI] = useState(0);
  const [tanlov, setTanlov] = useState(null);
  const [natija, setNatija] = useState([]);
  const [yakun, setYakun] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => { api(`/api/ekspeditsiya/${kurs}/${n}/boshlash`, { method: "POST" }).then(setDat).catch((e) => setXato(String(e.message || e))); }, [kurs, n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <div className="ek-oyin"><p>{xato}</p><button type="button" className="ek-btn" onClick={onOrqaga}>←</button></div>;
  if (!dat) return <div className="ek-oyin"><p>⏳</p></div>;
  const T = dat.topshiriqlar, t = T[i];
  const javob = (k) => { if (tanlov !== null) return; setTanlov(k); setNatija((o) => [...o, { tur: t.tur, ok: k === t.togri }]); };
  const keyingi = async () => {
    if (i + 1 < T.length) { setI(i + 1); setTanlov(null); return; }
    const togri = natija.filter((x) => x.ok).length;
    const r = await api(`/api/ekspeditsiya/${kurs}/${n}/natija`, { method: "POST", body: JSON.stringify({ togri, togri_turlar: natija.filter((x) => x.ok).map((x) => x.tur), xato_turlar: natija.filter((x) => !x.ok).map((x) => x.tur) }) });
    setYakun({ ...r, togri });
  };
  if (yakun) return <div className="ek-oyin ek-yakun">
    <div className={`ek-sandiq ${yakun.otdi ? "is-ochiq" : ""}`} aria-hidden="true">{yakun.otdi ? "🎁" : "📦"}</div>
    <h2>{yakun.otdi ? (dat.darvoza ? __kbUi("Darvoza ochildi!") : __kbUi("Bosqich o‘tildi!")) : __kbUi("Yana bir urinib ko‘ring")}</h2>
    <div className="ek-yulduzlar">{[1, 2, 3].map((s) => <span key={s} className={s <= yakun.yulduz ? "is-on" : ""} style={{ animationDelay: `${s * 0.25}s` }}>★</span>)}</div>
    <p><b>{yakun.togri}</b> / {T.length} {__kbUi("to‘g‘ri")} · 🔥 {yakun.streak} · {yakun.xato_navbat ? `🔁 ${yakun.xato_navbat} ${__kbUi("mavzu keyinroq qaytadi")}` : __kbUi("hamma mavzu joyida")}</p>
    <div className="ek-qator"><button type="button" className="ek-btn is-ikkinchi" onClick={() => onTugadi(false)}>🗺 {__kbUi("Xarita")}</button>
      {yakun.otdi && n < 20 ? <button type="button" className="ek-btn" onClick={() => onTugadi(n + 1)}>{__kbUi("Keyingi bosqich")} →</button> : <button type="button" className="ek-btn" onClick={() => onTugadi(n)}>↻ {__kbUi("Qayta")}</button>}</div>
  </div>;
  const [nom, rang] = TEG[t.tag] || TEG.yangi;
  return <div className="ek-oyin">
    <div className="ek-tepa"><button type="button" className="ek-t" onClick={onOrqaga}>←</button><b>{dat.darvoza ? `🏛 ${__kbUi("Darvoza")}` : `${__kbUi("Bosqich")} ${n}`}</b>
      <div className="ek-nuqtalar">{T.map((_, k) => <i key={k} className={k < natija.length ? (natija[k].ok ? "is-ok" : "is-xato") : k === i ? "is-joriy" : ""} />)}</div></div>
    <div className="ek-karta">
      <span className="ek-teg" style={{ background: rang }}>{__kbUi(nom)}</span>
      <div className="ek-savol"><BoardText text={t.savol} /></div>
      <div className="ek-variantlar">{t.variantlar.map((v, k) => <button key={k} type="button" disabled={tanlov !== null}
        className={`ek-v ${tanlov !== null && k === t.togri ? "is-togri" : ""} ${tanlov === k && k !== t.togri ? "is-xato" : ""}`} onClick={() => javob(k)}><BoardText text={/[\\^_]/.test(v) ? `$${v}$` : v} /></button>)}</div>
      {tanlov !== null && <div className={`ek-fikr ${tanlov === t.togri ? "is-ok" : "is-xato"}`}>
        <b>{tanlov === t.togri ? __kbUi("To‘g‘ri!") : __kbUi("Xato — mana yechimi:")}</b>
        {String(t.yechim || "").split("\n").map((q, k) => <div key={k}><BoardText text={q} /></div>)}
        <button type="button" className="ek-btn" onClick={keyingi}>{i + 1 < T.length ? __kbUi("Keyingi") : __kbUi("Natija")} →</button></div>}
    </div>
  </div>;
}

export default function Ekspeditsiya({ apiBase = "", token = "", onClose }) {
  const api = async (yol, o = {}) => {
    const r = await fetch(`${apiBase}${yol}${yol.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`, { ...o, headers: { "Content-Type": "application/json", ...(o.headers || {}) } });
    if (!r.ok) { let x = ""; try { x = (await r.json()).detail; } catch { /* */ } throw new Error(x || `Xato ${r.status}`); }
    return r.json();
  };
  const [kurslar, setKurslar] = useState([]);
  const [kurs, setKurs] = useState(() => { try { return localStorage.getItem("kb_eksp_kurs") || ""; } catch { return ""; } });
  const [d, setD] = useState(null);
  const [bosqich, setBosqich] = useState(0);
  const yangila = () => kurs && api(`/api/ekspeditsiya/${kurs}`).then(setD).catch(() => setD(null));
  useEffect(() => { api("/api/ekspeditsiya/kurslar").then((r) => setKurslar(r.kurslar || [])).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setD(null); if (kurs) { try { localStorage.setItem("kb_eksp_kurs", kurs); } catch { /* */ } yangila(); } }, [kurs]); // eslint-disable-line react-hooks/exhaustive-deps
  if (bosqich) return <div className="ek-root"><Oyin key={`${kurs}-${bosqich}`} api={api} kurs={kurs} n={bosqich}
    onOrqaga={() => { setBosqich(0); yangila(); }} onTugadi={(keyin) => { yangila(); setBosqich(0); if (keyin) setTimeout(() => setBosqich(keyin), 0); }} /></div>;
  if (kurs && d) return <div className="ek-root"><Xarita kurs={kurs} d={d} onBosqich={setBosqich} onOrqaga={() => setKurs("")} /></div>;
  return <div className="ek-root ek-tanlov">
    <div className="ek-tepa">{onClose && <button type="button" className="ek-t" onClick={onClose}>←</button>}<b>🧭 {__kbUi("Matematik ekspeditsiya")}</b></div>
    <p className="ek-izoh">{__kbUi("Sinfingizni tanlang. 20 bosqich, har birida 15 ta topshiriq — o‘tgan mavzular ham vaqti-vaqti bilan qaytib keladi.")}</p>
    <div className="ek-kurslar">{kurslar.map((k) => <button key={k.kalit} type="button" className={`ek-kurs is-${USLUB(k.kalit)}`} onClick={() => setKurs(k.kalit)}>
      <span>{USLUB(k.kalit) === "vodiy" ? "🌳" : USLUB(k.kalit) === "orol" ? "🏝" : USLUB(k.kalit) === "shahar" ? "🕌" : "🚀"}</span><b>{k.nom}</b></button>)}</div>
  </div>;
}
