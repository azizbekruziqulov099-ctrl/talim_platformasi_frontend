// REV456: «🧭 Matematik ekspeditsiya» — 20 bosqichli xarita, har bosqichda 15 topshiriq (spiral takrorlash, darvozalar).
// Xaritalar kod bilan chizilgan (4 uslub: vodiy, orollar, Samarqand, kosmos); Azizjonning rasmlari kelgach fon sifatida qo'yiladi.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import { ovozManbai, KABU_OVOZ } from "../kid/ovozOqi.js";   // REV462: 1–2-sinfda Kabu savolni o'qib beradi
import { integerWords } from "../speech/mathSpeech.js";
import "./ekspeditsiya.css";
import XARITA_NUQTA from "./ekspeditsiyaXarita.json";   // REV459: bekatlar xaritadagi tayyor maydonchalar ustida

// REV459: Azizjon yuborgan rasmlar (xaritalar, bekatlar, darvozalar, mukofotlar, nishonlar, sahnalar)
const RASM = import.meta.glob("./ekspeditsiya_rasm/*.webp", { eager: true, import: "default" });
const R = (nom) => RASM[`./ekspeditsiya_rasm/${nom}.webp`] || "";
const TEMA = { vodiy: "vodiy", orol: "orollar", shahar: "samarqand", kosmos: "kosmos" };
const XARITA = { vodiy: "xarita_1_4", orol: "xarita_5_6", shahar: "xarita_7_9", kosmos: "xarita_10_1" };
const SAHNA = { foiz: "dokon", chegirma: "dokon", osish: "bank", qiymat: "bozor", meyor: "bozor", massa: "bozor", harakat: "sayohat", qarama: "sayohat", quvlama: "poyezd",
  ortacha_tezlik: "sport", vaqt: "poyezd", hajm: "suv_hovuz", prizma: "qurilish", yuz: "bog", perimetr: "bog", yuzbirlik: "dala", uchburchak_yuz: "qurilish", trapyuz: "qurilish",
  unum: "zavod", ehtimol: "tanga_kub", kombinatorika: "lotereya", statistika: "maktab", ortacha: "maktab", diagramma: "maktab", masofa: "gps", vektor: "gps", fazovektor: "gps",
  koordinata: "gps", daraja: "kosmos", korxona: "kosmos", nisbat: "oshxona", qolgan: "oshxona", ulush: "oshxona", toplam: "maktab", oxshash: "arxitektura", muntazam: "arxitektura",
  burchak_chiziq: "arxitektura", parallel: "arxitektura", aylana: "arxitektura", sektor: "arxitektura", pifagor: "qurilish", silindr: "suv_hovuz", unumdorlik: "zavod" };

const TEG = { yangi: ["Yangi", "#1B4B7A"], takror: ["Takror", "#0D7A77"], uzoq: ["Eski mavzu", "#7A4FBF"], xato: ["Xatoni tuzatish", "#C2410C"], darvoza: ["Darvoza", "#B45309"] };
const KICHIK = (k) => ["mat1", "mat2"].includes(String(k));   // REV462: 1–2-sinf
/** Kichiklar uchun o'qiladigan matn: «7 + 5 = ?» → «yetti qo'shuv besh nechaga teng?» */
function kichikOvoz(matn) {
  let t = String(matn || "").replace(/\$/g, "").replace(/\\;|\\,/g, " ").replace(/\\cdot|·|×/g, " karra ").replace(/\s*=\s*\?/g, " nechaga teng?")
    .replace(/\s*[−-]\s*(?=\d)/g, " ayiruv ").replace(/\s*\+\s*/g, " qo‘shuv ").replace(/(\d)\s*:\s*(?=\d)/g, "$1 bo‘linsin ")
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "").replace(/…\?|…/g, "").replace(/\s+/g, " ");
  t = t.replace(/\d+/g, (x) => integerWords(Number(x), "uz") || x);
  return t.trim();
}
/** «4 + 3 = ?» kabi kichik sonlar — sanash uchun rasm qatori (olma: qo'shishda ikki guruh, ayirishda o'chirilganlari xira). */
function KichikRasm({ savol }) {
  const m = String(savol || "").replace(/\$/g, "").match(/(\d+)\s*([+−-])\s*(\d+)\s*=/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[3]), qosh = m[2] === "+";
  if (a > 10 || b > 10 || (!qosh && b > a)) return null;
  return <div className="ek-kichik-rasm" aria-hidden="true">
    {Array.from({ length: a }, (_, i) => <span key={`a${i}`} className={!qosh && i >= a - b ? "is-olindi" : ""}>🍎</span>)}
    {qosh && <><b>+</b>{Array.from({ length: b }, (_, i) => <span key={`b${i}`}>🍏</span>)}</>}
  </div>;
}

const KORINISH = { xato_top: "🔎 Xatoni top", chamalash: "≈ Chamalash", togri_notogri: "⚖️ To‘g‘rimi?", naqsh: "🧩 Naqsh" };   // REV457
const USLUB = (k) => { if (String(k) === "xalqaro") return "kosmos";   // REV463: Xalqaro ekspeditsiya — Yer va sayyoralar
  const g = Number(String(k).replace(/\D/g, "")); return g <= 4 ? "vodiy" : g <= 6 ? "orol" : g <= 9 ? "shahar" : "kosmos"; };

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

function nuqtalarTik(W, H) {   // telefon: 7 qator, ilonsimon (3 tadan)
  return Array.from({ length: 20 }, (_, i) => {
    const q = Math.floor(i / 3), j = i % 3, ong = q % 2 === 0;
    const x = 170 + (ong ? j : 2 - j) * ((W - 340) / 2), y = H - 130 - q * ((H - 260) / 6);
    return [x, y];
  });
}

function Xarita({ kurs, d, avatar, onAvatar, onReyting, onBosqich, onOrqaga, onNishonlar }) {
  const [tik, setTik] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => { const f = () => setTik(window.innerWidth < 640); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const uslub = USLUB(kurs), tema = TEMA[uslub];
  const fon = R(`${XARITA[uslub]}_${tik ? "vertikal" : "gorizontal"}`);
  const W = fon ? (tik ? 941 : 1672) : (tik ? 900 : 1600), H = fon ? (tik ? 1672 : 941) : (tik ? 1600 : 900);
  const P = useMemo(() => (fon && XARITA_NUQTA[tik ? "vertikal" : "gorizontal"]?.[tema]) || (tik ? nuqtalarTik(W, H) : nuqtalar(W, H)), [tik, fon, tema]); // eslint-disable-line react-hooks/exhaustive-deps
  const yol = P.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const olindi = (d.nishonlar || []).filter((x) => x.olindi).length;
  return <div className="ek-xarita">
    <div className="ek-tepa"><button type="button" className="ek-t" onClick={onOrqaga}>←</button><b>{d.nom}</b>
      <span className="ek-chip"><img src={R("olov_streak")} alt="" className="ek-ik" /> {d.streak || 0}</span>
      <span className="ek-chip">✅ {d.jami || 0}</span>
      {d.xato_navbat > 0 && <span className="ek-chip" title={__kbUi("Qayta yechiladigan mavzular")}>🔁 {d.xato_navbat}</span>}
      <button type="button" className="ek-chip ek-chip-btn" onClick={onNishonlar}><img src={R("kubok")} alt="" className="ek-ik" /> {olindi}/{(d.nishonlar || []).length}</button>
      <button type="button" className="ek-chip ek-chip-btn" onClick={onReyting}>🏅 {__kbUi("Reyting")}</button>
      <button type="button" className="ek-avatar-tepa" onClick={onAvatar} title={__kbUi("Avatarni tanlash")}>{avatar ? <img src={R(avatar)} alt="" /> : "👤"}</button></div>
    <svg viewBox={`0 0 ${W} ${H}`} className="ek-svg" role="img" aria-label={d.nom}>
      {fon ? <image href={fon} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" /> : <XaritaFon uslub={uslub} W={W} H={H} />}
      {!fon && <path d={yol} stroke="#ffffffaa" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 22" />}
      {d.bosqichlar.map((b, i) => { const [x, y] = P[i];
        const holat = b.holat === "otdi" ? "otilgan" : b.holat;
        const rasm = b.darvoza ? R(`darvoza_${b.n / 5}_${tema}`) : R(`bekat_${holat}_${tema}`);
        const S = b.darvoza ? 150 : 96;
        return <g key={b.n} className={`ek-bekat is-${b.holat}`} onClick={() => b.holat !== "yopiq" && onBosqich(b.n)} style={{ cursor: b.holat === "yopiq" ? "default" : "pointer" }}>
          {b.holat === "ochiq" && <circle cx={x} cy={y} r={S / 2 + 4} fill="none" stroke="#fff" strokeWidth="5" className="ek-puls" />}
          {rasm ? <image href={rasm} x={x - S / 2} y={y - S / 2} width={S} height={S} className={b.darvoza && b.holat === "yopiq" ? "ek-kulrang" : ""} />
            : <circle cx={x} cy={y} r={S / 3} fill="#1B4B7A" />}
          {b.darvoza && b.holat === "yopiq" && R("bekat_yopiq_" + tema) && <image href={R("bekat_yopiq_" + tema)} x={x - 32} y={y - 10} width="64" height="64" />}
          <g transform={`translate(${x + S / 2 - 8},${y - S / 2 + 6})`}>
            <circle r="17" fill="#ffffff" stroke="#1d2b3a22" strokeWidth="2" />
            <text x="0" y="7" textAnchor="middle" fontSize="19" fontWeight="800" fill="#1d2b3a" fontFamily="system-ui">{b.n}</text>
          </g>
          {b.holat !== "yopiq" && b.yulduz > 0 && [0, 1, 2].map((k) => <image key={k} href={R(k < b.yulduz ? "yulduz_tola" : "yulduz_bosh")} x={x - 39 + k * 26} y={y + S / 2 - 14} width="26" height="26" />)}
        </g>; })}
    </svg>
    <p className="ek-izoh">{__kbUi("Har bosqichda 15 ta topshiriq: yangi mavzu, yaqinda o‘tilgan va eski mavzular aralash keladi. Xato qilgan turingiz keyinroq yana qaytadi. Har 5-bosqich — sinov darvozasi (15 tadan 12 tasi to‘g‘ri bo‘lishi kerak).")}</p>
  </div>;
}

function Nishonlar({ d, onYop }) {
  return <div className="ek-modal" onClick={onYop}><div className="ek-modal-ich" onClick={(e) => e.stopPropagation()}>
    <div className="ek-tepa"><b>🏅 {__kbUi("Nishonlar")}</b><button type="button" className="ek-t" style={{ marginLeft: "auto" }} onClick={onYop}>✕</button></div>
    <div className="ek-nishonlar">{(d.nishonlar || []).map((x) => <div key={x.kalit} className={`ek-nishon ${x.olindi ? "is-bor" : ""}`}>
      <img src={R(`nishon_${x.kalit}`)} alt="" /><b>{__kbUi(x.nom)}</b><small>{x.olindi || "🔒"}</small></div>)}</div>
  </div></div>;
}

function Oyin({ api, apiBase, kurs, n, onTugadi, onOrqaga }) {
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  useEffect(() => () => ovoz.stop(), [ovoz]);
  const [dat, setDat] = useState(null);
  const [i, setI] = useState(0);
  const [tanlov, setTanlov] = useState(null);
  const [natija, setNatija] = useState([]);
  const [yakun, setYakun] = useState(null);
  const [xato, setXato] = useState("");
  const [boshlandi] = useState(() => Date.now());
  useEffect(() => { api(`/api/ekspeditsiya/${kurs}/${n}/boshlash`, { method: "POST" }).then(setDat).catch((e) => setXato(String(e.message || e))); }, [kurs, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const oqi = (tt) => { if (tt) ovoz.oqi(kichikOvoz(tt.savol), { ...KABU_OVOZ, sekin: true }); };
  useEffect(() => { if (KICHIK(kurs) && dat?.topshiriqlar?.[i] && tanlov === null) oqi(dat.topshiriqlar[i]); }, [dat, i]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <div className="ek-oyin"><p>{xato}</p><button type="button" className="ek-btn" onClick={onOrqaga}>←</button></div>;
  if (!dat) return <div className="ek-oyin"><p>⏳</p></div>;
  const T = dat.topshiriqlar, t = T[i];
  const javob = (k) => { if (tanlov !== null) return; setTanlov(k); setNatija((o) => [...o, { tur: t.tur, ok: k === t.togri, korinish: t.korinish }]); };
  const keyingi = async () => {
    if (i + 1 < T.length) { setI(i + 1); setTanlov(null); return; }
    const togri = natija.filter((x) => x.ok).length;
    const r = await api(`/api/ekspeditsiya/${kurs}/${n}/natija`, { method: "POST", body: JSON.stringify({ togri, togri_turlar: natija.filter((x) => x.ok).map((x) => x.tur), xato_turlar: natija.filter((x) => !x.ok).map((x) => x.tur),
      vaqt: Math.round((Date.now() - boshlandi) / 1000), korinish_togri: natija.filter((x) => x.ok && x.korinish !== "oddiy").reduce((o, x) => ({ ...o, [x.korinish]: (o[x.korinish] || 0) + 1 }), {}) }) });
    setYakun({ ...r, togri });
  };
  if (yakun) return <div className="ek-oyin ek-yakun">
    <div className={`ek-sandiq ${yakun.otdi ? "is-ochiq" : ""}`} aria-hidden="true"><img src={R(yakun.otdi ? "sandiq_ochiq" : "sandiq_yopiq")} alt="" /></div>
    <h2>{yakun.otdi ? (dat.darvoza ? __kbUi("Darvoza ochildi!") : __kbUi("Bosqich o‘tildi!")) : __kbUi("Yana bir urinib ko‘ring")}</h2>
    <div className="ek-yulduzlar">{[1, 2, 3].map((s) => <img key={s} src={R(s <= yakun.yulduz ? "yulduz_tola" : "yulduz_bosh")} alt="" className={s <= yakun.yulduz ? "is-on" : ""} style={{ animationDelay: `${s * 0.25}s` }} />)}</div>
    {(yakun.yangi_nishonlar || []).length > 0 && <div className="ek-yangi-nishon">{yakun.yangi_nishonlar.map((x) => <div key={x.kalit}><img src={R(`nishon_${x.kalit}`)} alt="" /><b>{__kbUi("Yangi nishon")}: {__kbUi(x.nom)}</b></div>)}</div>}
    <p><b>{yakun.togri}</b> / {T.length} {__kbUi("to‘g‘ri")} · 🔥 {yakun.streak} · {yakun.xato_navbat ? `🔁 ${yakun.xato_navbat} ${__kbUi("mavzu keyinroq qaytadi")}` : __kbUi("hamma mavzu joyida")}</p>
    <div className="ek-qator"><button type="button" className="ek-btn is-ikkinchi" onClick={() => onTugadi(false)}>🗺 {__kbUi("Xarita")}</button>
      {yakun.otdi && n < 20 ? <button type="button" className="ek-btn" onClick={() => onTugadi(n + 1)}>{__kbUi("Keyingi bosqich")} →</button> : <button type="button" className="ek-btn" onClick={() => onTugadi(n)}>↻ {__kbUi("Qayta")}</button>}</div>
  </div>;
  const [nom, rang] = TEG[t.tag] || TEG.yangi;
  return <div className={`ek-oyin ${KICHIK(kurs) ? "is-kichik" : ""}`}>
    <div className="ek-tepa"><button type="button" className="ek-t" onClick={onOrqaga}>←</button><b>{dat.darvoza ? `🏛 ${__kbUi("Darvoza")}` : `${__kbUi("Bosqich")} ${n}`}</b>
      <div className="ek-nuqtalar">{T.map((_, k) => <i key={k} className={k < natija.length ? (natija[k].ok ? "is-ok" : "is-xato") : k === i ? "is-joriy" : ""} />)}</div></div>
    <div className="ek-karta">
      <div className="ek-teglar"><span className="ek-teg" style={{ background: rang }}>{__kbUi(nom)}</span>
        {KORINISH[t.korinish] && <span className="ek-teg is-korinish">{__kbUi(KORINISH[t.korinish])}</span>}</div>
      {t.sahna && R(t.sahna) ? <img className="ek-sahna" src={R(t.sahna)} alt="" />
        : SAHNA[t.tur] && R(`sahna_${SAHNA[t.tur]}`) && <img className="ek-sahna" src={R(`sahna_${SAHNA[t.tur]}`)} alt="" />}
      {KICHIK(kurs) && <button type="button" className="ek-tingla" onClick={() => oqi(t)} aria-label={__kbUi("Qayta eshitish")}>🔊 {__kbUi("Eshitish")}</button>}
      {KICHIK(kurs) && <KichikRasm savol={t.savol} />}
      <div className="ek-savol">{String(t.savol).split("\n").map((q, k) => <div key={k}><BoardText text={q} /></div>)}</div>
      <div className={`ek-variantlar ${t.variantlar.length === 2 ? "is-ikki" : ""}`}>{t.variantlar.map((v, k) => <button key={k} type="button" disabled={tanlov !== null}
        className={`ek-v ${tanlov !== null && k === t.togri ? "is-togri" : ""} ${tanlov === k && k !== t.togri ? "is-xato" : ""}`} onClick={() => javob(k)}><BoardText text={/[\\^_]/.test(v) ? `$${v}$` : v} /></button>)}</div>
      {tanlov !== null && <div className={`ek-fikr ${tanlov === t.togri ? "is-ok" : "is-xato"}`}>
        <b>{tanlov === t.togri ? __kbUi("To‘g‘ri!") : __kbUi("Xato — mana yechimi:")}</b>
        {String(t.yechim || "").split("\n").map((q, k) => <div key={k}><BoardText text={q} /></div>)}
        <button type="button" className="ek-btn" onClick={keyingi}>{i + 1 < T.length ? __kbUi("Keyingi") : __kbUi("Natija")} →</button></div>}
    </div>
  </div>;
}

/** REV458: o'qituvchi hisoboti — guruh va ekspeditsiya tanlanadi: kim qaysi bosqichda, aniqligi, zaif mavzulari va sinfning zaif mavzulari. */
function Hisobot({ api, kurslar, guruhlar, onOrqaga }) {
  const [g, setG] = useState(guruhlar[0]?.id || "");
  const [k, setK] = useState(() => { const gr = guruhlar[0]; const s = String(gr?.grade || "").replace(/\D/g, ""); return kurslar.find((x) => x.kalit.replace(/\D/g, "") === s)?.kalit || kurslar[0]?.kalit || ""; });
  const [h, setH] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => { if (g && k) { setH(null); setXato(""); api(`/api/ekspeditsiya/oqituvchi/hisobot?guruh=${g}&kurs=${k}`).then(setH).catch((e) => setXato(String(e.message || e))); } }, [g, k]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="ek-hisobot">
    <div className="ek-tepa"><button type="button" className="ek-t" onClick={onOrqaga}>←</button><b>👩‍🏫 {__kbUi("O‘qituvchi hisoboti")}</b></div>
    <div className="ek-qator" style={{ justifyContent: "flex-start" }}>
      <select value={g} onChange={(e) => setG(e.target.value)}>{guruhlar.map((x) => <option key={x.id} value={x.id}>{x.nom} ({x.soni})</option>)}</select>
      <select value={k} onChange={(e) => setK(e.target.value)}>{kurslar.map((x) => <option key={x.kalit} value={x.kalit}>{x.nom}</option>)}</select>
    </div>
    {xato && <p className="ek-izoh">{xato}</p>}
    {!h && !xato && <p className="ek-izoh">⏳</p>}
    {h && <>
      <h3>{__kbUi("Sinfning zaif mavzulari")}</h3>
      {h.sinf_zaif.length ? <div className="ek-zaif">{h.sinf_zaif.map((z) => <div key={z.tur} className="ek-zaif-q">
        <span>{__kbUi(z.nom)}</span><div className="ek-bar"><i style={{ width: `${z.aniqlik}%`, background: z.aniqlik < 60 ? "#d9534f" : z.aniqlik < 80 ? "#f2b72e" : "#2e9e5b" }} /></div>
        <b>{z.aniqlik}%</b><small>{z.qiynalganlar ? `${z.ulush}% ${__kbUi("o‘quvchi qiynalmoqda")}` : ""}</small></div>)}</div>
        : <p className="ek-izoh">{__kbUi("Hali yetarli ma’lumot yo‘q — o‘quvchilar bir necha bosqich o‘ynagach ko‘rinadi.")}</p>}
      <h3>{__kbUi("O‘quvchilar")} {h.boshlamagan ? <small className="ek-izoh">· {h.boshlamagan} {__kbUi("ta hali boshlamagan")}</small> : null}</h3>
      <div className="ek-jadval-q"><table><thead><tr><th>{__kbUi("O‘quvchi")}</th><th>{__kbUi("Bosqich")}</th><th>★</th><th>{__kbUi("Aniqlik")}</th><th>🔥</th><th>{__kbUi("Zaif mavzular")}</th></tr></thead>
        <tbody>{h.oquvchilar.map((q, i) => <tr key={i}><td><span className="ek-hisobot-ism">{q.avatar ? <img src={R(q.avatar)} alt="" /> : <i>👤</i>}{q.ism}</span></td>
          <td><div className="ek-bar kichik"><i style={{ width: `${(q.bosqich / 20) * 100}%` }} /></div>{q.bosqich}/20</td>
          <td>{q.yulduz}</td><td>{q.aniqlik == null ? "—" : `${q.aniqlik}%`}</td><td>{q.streak || 0}</td>
          <td>{q.zaif.map((z) => <span key={z.tur} className="ek-chip kichik">{__kbUi(z.nom)} {z.foiz}%</span>)}</td></tr>)}</tbody></table></div>
    </>}
  </div>;
}

/** REV464: avatar tanlash (12 ta) */
function AvatarTanlov({ joriy, onTanla, onYop }) {
  return <div className="ek-modal" onClick={onYop}><div className="ek-modal-ich" onClick={(e) => e.stopPropagation()}>
    <div className="ek-tepa"><b>👤 {__kbUi("Avataringizni tanlang")}</b><button type="button" className="ek-t" style={{ marginLeft: "auto" }} onClick={onYop}>✕</button></div>
    <div className="ek-avatarlar">{Array.from({ length: 12 }, (_, i) => `avatar_${String(i + 1).padStart(2, "0")}`).map((a) =>
      <button key={a} type="button" className={`ek-avatar-b ${a === joriy ? "is-tanlangan" : ""}`} onClick={() => onTanla(a)}><img src={R(a)} alt="" /></button>)}</div>
  </div></div>;
}

/** REV464: guruhdoshlar reytingi */
function Reyting({ api, kurs, onYop }) {
  const [r, setR] = useState(null);
  useEffect(() => { api(`/api/ekspeditsiya/${kurs}/reyting`).then(setR).catch(() => setR({ reyting: [], guruhsiz: true })); }, [kurs]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="ek-modal" onClick={onYop}><div className="ek-modal-ich" onClick={(e) => e.stopPropagation()}>
    <div className="ek-tepa"><b>🏅 {__kbUi("Guruh reytingi")}</b><button type="button" className="ek-t" style={{ marginLeft: "auto" }} onClick={onYop}>✕</button></div>
    {!r ? <p className="ek-izoh">⏳</p> : r.guruhsiz ? <p className="ek-izoh">{__kbUi("Reyting o‘qituvchingiz ochgan guruhda ko‘rinadi. Guruhga qo‘shilish uchun o‘qituvchingiz yuborgan havolani oching.")}</p>
      : <ol className="ek-reyting">{r.reyting.map((x) => <li key={`${x.orin}-${x.ism}`} className={x.men ? "is-men" : ""}>
        <span className="ek-orin">{x.orin <= 3 ? ["🥇", "🥈", "🥉"][x.orin - 1] : x.orin}</span>
        {x.avatar ? <img src={R(x.avatar)} alt="" /> : <span className="ek-avatar-bosh">👤</span>}
        <b>{x.ism}{x.men ? ` (${__kbUi("siz")})` : ""}</b><span>★ {x.yulduz}</span><small>{x.bosqich}/20</small></li>)}</ol>}
  </div></div>;
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
  const [guruhlar, setGuruhlar] = useState([]);
  const [hisobotda, setHisobotda] = useState(false);
  const [nishonda, setNishonda] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarda, setAvatarda] = useState(false);
  const [reytingda, setReytingda] = useState(false);
  const yangila = () => kurs && api(`/api/ekspeditsiya/${kurs}`).then(setD).catch(() => setD(null));
  useEffect(() => { api("/api/ekspeditsiya/kurslar").then((r) => setKurslar(r.kurslar || [])).catch(() => {});
    api("/api/ekspeditsiya/oqituvchi/guruhlar").then((r) => setGuruhlar(r.guruhlar || [])).catch(() => {});
    api("/api/ekspeditsiya/profil").then((r) => setAvatar(r.avatar || "")).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setD(null); if (kurs) { try { localStorage.setItem("kb_eksp_kurs", kurs); } catch { /* */ } yangila(); } }, [kurs]); // eslint-disable-line react-hooks/exhaustive-deps
  if (bosqich) return <div className="ek-root"><Oyin key={`${kurs}-${bosqich}`} api={api} apiBase={apiBase} kurs={kurs} n={bosqich}
    onOrqaga={() => { setBosqich(0); yangila(); }} onTugadi={(keyin) => { yangila(); setBosqich(0); if (keyin) setTimeout(() => setBosqich(keyin), 0); }} /></div>;
  if (hisobotda && guruhlar.length) return <div className="ek-root"><Hisobot api={api} kurslar={kurslar} guruhlar={guruhlar} onOrqaga={() => setHisobotda(false)} /></div>;
  const avatarTanla = (a) => { setAvatar(a); setAvatarda(false); api("/api/ekspeditsiya/profil", { method: "POST", body: JSON.stringify({ avatar: a }) }).catch(() => {}); };
  const avatarModal = avatarda && <AvatarTanlov joriy={avatar} onTanla={avatarTanla} onYop={() => setAvatarda(false)} />;
  if (kurs && d) return <div className="ek-root"><Xarita kurs={kurs} d={d} avatar={avatar} onAvatar={() => setAvatarda(true)} onReyting={() => setReytingda(true)}
    onBosqich={setBosqich} onOrqaga={() => setKurs("")} onNishonlar={() => setNishonda(true)} />
    {nishonda && <Nishonlar d={d} onYop={() => setNishonda(false)} />}{avatarModal}
    {reytingda && <Reyting api={api} kurs={kurs} onYop={() => setReytingda(false)} />}</div>;
  return <div className="ek-root ek-tanlov">
    <div className="ek-tepa">{onClose && <button type="button" className="ek-t" onClick={onClose}>←</button>}<b>🧭 {__kbUi("Matematik ekspeditsiya")}</b>
      <button type="button" className="ek-avatar-tepa" onClick={() => setAvatarda(true)} title={__kbUi("Avatarni tanlash")}>{avatar ? <img src={R(avatar)} alt="" /> : "👤"}</button></div>
    {avatarModal}
    {guruhlar.length > 0 && <button type="button" className="ek-btn" style={{ alignSelf: "flex-start", marginBottom: 10 }} onClick={() => setHisobotda(true)}>👩‍🏫 {__kbUi("O‘qituvchi hisoboti")}</button>}
    <p className="ek-izoh">{__kbUi("Sinfingizni tanlang. 20 bosqich, har birida 15 ta topshiriq — o‘tgan mavzular ham vaqti-vaqti bilan qaytib keladi.")}</p>
    <div className="ek-kurslar">{kurslar.map((k) => <button key={k.kalit} type="button" className={`ek-kurs is-${USLUB(k.kalit)}`} onClick={() => setKurs(k.kalit)}>
      <span>{USLUB(k.kalit) === "vodiy" ? "🌳" : USLUB(k.kalit) === "orol" ? "🏝" : USLUB(k.kalit) === "shahar" ? "🕌" : "🚀"}</span><b>{k.nom}</b></button>)}</div>
  </div>;
}
