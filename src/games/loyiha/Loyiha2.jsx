// REV542: Kabu loyiha — F2: yana 10 ta loyiha (simulyatsiyalar SVG).
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import * as R from "./loyihaRules2.js";

const __kbM = (x) => x;   // ma'lumot ichidagi tarjima qilinadigan matn belgisi
const K = "#13314f";
const Tanlov = ({ royxat, qiymat, onTanla }) => <div className="lo-tanlov">{royxat.map(([k, n]) => <button key={k} type="button" className={qiymat === k ? "is-on" : ""} onClick={() => onTanla(k)}>{n}</button>)}</div>;
const Sirg = ({ nom, min, max, qadam = 1, qiymat, onOzgar, birlik = "" }) => <label>{nom}: <b>{qiymat}{birlik}</b><input type="range" min={min} max={max} step={qadam} value={qiymat} onChange={(e) => onOzgar(Number(e.target.value))} /></label>;

function Filtr({ onSinov }) {
  const NOM = { shagal: __kbM("Shag‘al"), qum: __kbM("Qum"), komir: __kbM("Ko‘mir"), paxta: __kbM("Paxta") }, RANG = { shagal: "#9aa3ad", qum: "#e2c17a", komir: "#3b3b3b", paxta: "#f4f4f4" };
  const [q, setQ] = useState(["qum", "shagal", "paxta"]), [t, setT] = useState(null);
  const sina = () => { const v = R.filtrTozalik(q); setT(v); onSinov({ matn: q.map((k) => __kbUi(NOM[k])).join(" → "), qiymat: `${v}%`, maqsad: v >= R.FILTR_MAQSAD }); };
  return <div className="lo-sim">
    {[0, 1, 2].map((i) => <div key={i} className="lo-sozlama"><label>{i + 1}-{__kbUi("qatlam (yuqoridan)")}</label><Tanlov royxat={Object.keys(NOM).map((k) => [k, __kbUi(NOM[k])])} qiymat={q[i]} onTanla={(k) => { setT(null); setQ(q.map((x, j) => (j === i ? k : x))); }} /></div>)}
    <svg viewBox="0 0 300 190" className="lo-chizma"><rect width="300" height="190" fill="#eef6ff" /><path d="M110,10 L190,10 L175,130 L125,130 Z" fill="#fff" stroke={K} strokeWidth="3" />
      {q.map((k, i) => <rect key={i} x={118 + i * 2.5} y={34 + i * 30} width={64 - i * 5} height="28" fill={RANG[k]} stroke={K} />)}
      <rect x="120" y="14" width="60" height="16" fill="#8a6b3a" opacity="0.8" /><text x="196" y="26" fontSize="10" fill={K}>{__kbUi("loyqa suv")}</text>
      <rect x="110" y="140" width="80" height="42" rx="5" fill="none" stroke={K} strokeWidth="3" />{t !== null && <rect x="113" y="156" width="74" height="23" fill={t >= 80 ? "#bfe6ff" : t >= 50 ? "#cdbf8e" : "#8a6b3a"} />}
      {t !== null && <text x="150" y="172" fontSize="12" textAnchor="middle" fontWeight="800" fill={K}>{t}%</text>}</svg>
    {t !== null && <p className={t >= R.FILTR_MAQSAD ? "lo-ok" : "lo-xato"}>{t >= R.FILTR_MAQSAD ? __kbUi("Suv tiniq chiqdi!") : __kbUi("Suv hali loyqa. Maslahat: yirik zarrali qatlam yuqorida, mayda zarralisi pastda bo‘lsin; har xil qatlam ishlating.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>💧 {__kbUi("Suvni o‘tkazish")}</button></div>;
}

function Richag({ onSinov }) {
  const [yuk, setYuk] = useState(2), [mas, setMas] = useState(2), [h, setH] = useState(null); const { chapYuk, chapMasofa, toshlar } = R.RICHAG;
  const sina = () => { const v = R.richagHolat(yuk, mas); setH(v); onSinov({ matn: `${yuk} kg × ${mas}`, qiymat: `${yuk * mas} / ${chapYuk * chapMasofa}`, maqsad: v === 0 }); };
  const bur = h === null ? 0 : h * 9;
  return <div className="lo-sim">
    <div className="lo-sozlama"><label>{__kbUi("O‘ng tomondagi tosh")}</label><Tanlov royxat={toshlar.map((t) => [t, `${t} kg`])} qiymat={yuk} onTanla={(k) => { setYuk(k); setH(null); }} /><Sirg nom={__kbUi("Tayanchdan masofa")} min={1} max={6} qiymat={mas} onOzgar={(v) => { setMas(v); setH(null); }} /></div>
    <svg viewBox="0 0 300 150" className="lo-chizma"><rect width="300" height="150" fill="#eef6ff" /><polygon points="150,84 136,128 164,128" fill="#b9c6d6" stroke={K} strokeWidth="2" /><line x1="20" y1="128" x2="280" y2="128" stroke="#8B5A2B" strokeWidth="3" />
      <g transform={`rotate(${bur} 150 82)`}><line x1="24" y1="82" x2="276" y2="82" stroke={K} strokeWidth="5" strokeLinecap="round" />{[1, 2, 3, 4, 5, 6].map((i) => <g key={i}><line x1={150 - i * 20} y1="78" x2={150 - i * 20} y2="86" stroke="#fff" strokeWidth="1.5" /><line x1={150 + i * 20} y1="78" x2={150 + i * 20} y2="86" stroke="#fff" strokeWidth="1.5" /></g>)}
        <rect x={150 - chapMasofa * 20 - 15} y="50" width="30" height="30" rx="4" fill="#4b8ad6" stroke={K} strokeWidth="2" /><text x={150 - chapMasofa * 20} y="70" fontSize="12" textAnchor="middle" fill="#fff" fontWeight="800">{chapYuk}</text>
        <rect x={150 + mas * 20 - 13} y={56 - yuk * 2} width="26" height={24 + yuk * 2} rx="4" fill="#f2b72e" stroke={K} strokeWidth="2" /><text x={150 + mas * 20} y="72" fontSize="12" textAnchor="middle" fill={K} fontWeight="800">{yuk}</text></g></svg>
    <p className="lo-izoh">{__kbUi("Chapda")}: {chapYuk} kg × {chapMasofa} = <b>{chapYuk * chapMasofa}</b> · {__kbUi("O‘ngda")}: {yuk} kg × {mas} = <b>{yuk * mas}</b></p>
    {h !== null && <p className={h === 0 ? "lo-ok" : "lo-xato"}>{h === 0 ? __kbUi("Richag muvozanatda!") : h < 0 ? __kbUi("Chap tomon og‘ir keldi — toshni uzoqroq qo‘ying yoki og‘irrog‘ini oling.") : __kbUi("O‘ng tomon og‘ir keldi — toshni yaqinroq qo‘ying yoki yengilrog‘ini oling.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>⚖️ {__kbUi("Qo‘yib yuborish")}</button></div>;
}

function Parashyut({ onSinov }) {
  const [y, setY] = useState(2), [n, setN] = useState(null); const v = R.parashyutTezlik(y);
  const sina = () => { const ok = R.parashyutOtdi(y); setN(ok); onSinov({ matn: `${__kbUi("gumbaz")} ${y}`, qiymat: `${v} m/s`, maqsad: ok }); };
  return <div className="lo-sim"><div className="lo-sozlama"><Sirg nom={__kbUi("Gumbaz kattaligi (mato bo‘laklari)")} min={1} max={6} qiymat={y} onOzgar={(x) => { setY(x); setN(null); }} /></div>
    <svg viewBox="0 0 300 180" className="lo-chizma"><rect width="300" height="180" fill="#dff1ff" /><rect y="160" width="300" height="20" fill="#7fbf6a" />
      <path d={`M${150 - 18 - y * 9},70 Q150,${70 - 26 - y * 6} ${150 + 18 + y * 9},70 Z`} fill="#E63946" stroke={K} strokeWidth="2" /><line x1={150 - 18 - y * 9} y1="70" x2="143" y2="118" stroke={K} /><line x1={150 + 18 + y * 9} y1="70" x2="157" y2="118" stroke={K} />
      <ellipse cx="150" cy="128" rx="11" ry="14" fill="#fff" stroke={K} strokeWidth="2" /><text x="150" y="150" fontSize="9" textAnchor="middle" fill={K}>🥚</text>
      <text x="12" y="24" fontSize="14" fontWeight="700" fill={K}>{__kbUi("Tushish tezligi")}: {v} m/s</text><text x="12" y="42" fontSize="11" fill="#d9534f">{__kbUi("xavfsiz")}: ≤ {R.PARASHYUT.tezlik} m/s · {__kbUi("mato")}: ≤ {R.PARASHYUT.mato}</text></svg>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? __kbUi("Tuxum butun qo‘ndi va mato yetdi!") : v > R.PARASHYUT.tezlik ? __kbUi("Juda tez tushdi — tuxum sindi. Gumbazni kattalashtiring.") : __kbUi("Yumshoq qo‘ndi, lekin mato yetmaydi — kichikroq gumbaz bilan ham bo‘ladimi?")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🪂 {__kbUi("Tashlab ko‘rish")}</button></div>;
}

function Qayiq({ onSinov }) {
  const [e, setE] = useState(2), [d, setD] = useState(1), [n, setN] = useState(null); const yar = R.qayiqYaroqli(e, d), s = R.qayiqSigim(e, d);
  const sina = () => { setN(s); onSinov({ matn: `${__kbUi("eni")} ${e}, ${__kbUi("devor")} ${d}`, qiymat: yar ? `${s} ${__kbUi("tanga")}` : __kbUi("plastilin yetmadi"), maqsad: s >= R.QAYIQ.maqsad }); };
  return <div className="lo-sim"><div className="lo-sozlama"><Sirg nom={__kbUi("Qayiq eni")} min={1} max={6} qiymat={e} onOzgar={(x) => { setE(x); setN(null); }} /><Sirg nom={__kbUi("Devor balandligi")} min={1} max={3} qiymat={d} onOzgar={(x) => { setD(x); setN(null); }} /></div>
    <svg viewBox="0 0 300 150" className="lo-chizma"><rect width="300" height="150" fill="#eef6ff" /><rect y="86" width="300" height="64" fill="#7EC8F2" />
      <path d={`M${150 - e * 16},${86 - d * 12 + (n !== null && s < R.QAYIQ.maqsad ? 26 : 6)} l0,${d * 12 + 8} l${e * 32},0 l0,-${d * 12 + 8}`} fill="#c98b5b" stroke={K} strokeWidth="3" strokeLinejoin="round" fillOpacity="0.85" />
      {n !== null && Array.from({ length: Math.min(R.QAYIQ.maqsad, 10) }, (_, i) => <circle key={i} cx={150 - 36 + (i % 5) * 18} cy={(s >= R.QAYIQ.maqsad ? 80 : 100) - Math.floor(i / 5) * 9} r="7" fill="#f2b72e" stroke={K} />)}</svg>
    <p className={yar ? "lo-izoh" : "lo-xato"}>{__kbUi("Plastilin")}: {e + 2 * d} / {R.QAYIQ.plastilin} · {__kbUi("Ko‘taradi")}: <b>{s}</b> {__kbUi("tanga")} ({__kbUi("kerak")}: {R.QAYIQ.maqsad})</p>
    {n !== null && <p className={n >= R.QAYIQ.maqsad ? "lo-ok" : "lo-xato"}>{!yar ? __kbUi("Plastilin yetmadi — eni yoki devorni kamaytiring.") : n >= R.QAYIQ.maqsad ? __kbUi("Qayiq 10 ta tangani ko‘tardi!") : __kbUi("Qayiq cho‘kdi. Ko‘proq suvni siqib chiqaradigan shakl kerak: ham keng, ham devori baland.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🪙 {__kbUi("Tangalarni ortish")}</button></div>;
}

function Soya({ onSinov }) {
  const [s, setS] = useState(12); const b = R.quyoshBalandlik(s), u = R.soyaUzunlik(s), ertalab = s <= 12; const g = (b * Math.PI) / 180;
  const sina = () => onSinov({ matn: `${Math.floor(s)}:${s % 1 ? "30" : "00"}`, qiymat: `${u} m`, maqsad: R.soyaTeng(s) });
  const qx = 150 + (ertalab ? -1 : 1) * 110 * Math.cos(g), qy = 140 - 110 * Math.sin(g), sx = 150 + (ertalab ? 1 : -1) * Math.min(135, u * 46);
  return <div className="lo-sim"><div className="lo-sozlama"><Sirg nom={__kbUi("Kun vaqti (soat)")} min={7} max={17} qadam={0.5} qiymat={s} onOzgar={setS} /></div>
    <svg viewBox="0 0 300 170" className="lo-chizma"><rect width="300" height="170" fill="#dff1ff" /><rect y="140" width="300" height="30" fill="#c9d8a8" /><path d="M40,140 A110,110 0 0 1 260,140" fill="none" stroke="#b9c6d6" strokeDasharray="4 4" />
      <circle cx={qx} cy={qy} r="13" fill="#ffd23f" stroke="#f2a000" strokeWidth="2" /><line x1="150" y1="140" x2="150" y2="94" stroke={K} strokeWidth="5" strokeLinecap="round" /><line x1="150" y1="140" x2={sx} y2="140" stroke="#444" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      <text x="10" y="20" fontSize="13" fontWeight="700" fill={K}>{__kbUi("Soya")}: {u} m · {__kbUi("tayoq")}: 1 m</text><text x="10" y="36" fontSize="11" fill={K}>{__kbUi("Quyosh balandligi")}: {Math.round(b)}°</text></svg>
    <p className="lo-izoh">{__kbUi("Vazifa: soya uzunligi tayoq bo‘yiga (1 m) teng bo‘ladigan vaqtni toping.")}</p>
    <button type="button" className="lo-asosiy" onClick={sina}>📏 {__kbUi("Soyani o‘lchash")}</button></div>;
}

function Qiya({ onSinov }) {
  const [b, setB] = useState(10), [n, setN] = useState(null); const NOM = { muz: __kbM("muz"), yogoch: __kbM("yog‘och"), gilam: __kbM("gilam") };
  const sina = () => { const r = Object.keys(R.SIRT).map((k) => R.sirpanadi(b, k)); setN(r); onSinov({ matn: `${b}°`, qiymat: Object.keys(R.SIRT).map((k, i) => `${__kbUi(NOM[k])}: ${r[i] ? "↘" : "■"}`).join(" "), maqsad: R.qiyaOtdi(b) }); };
  const g = (b * Math.PI) / 180;
  return <div className="lo-sim"><div className="lo-sozlama"><Sirg nom={__kbUi("Qiyalik burchagi")} min={5} max={50} qadam={5} qiymat={b} birlik="°" onOzgar={(x) => { setB(x); setN(null); }} /></div>
    <svg viewBox="0 0 300 150" className="lo-chizma"><rect width="300" height="150" fill="#eef6ff" />{Object.keys(R.SIRT).map((k, i) => { const x0 = 12 + i * 98, L = 78, x1 = x0 + L * Math.cos(g), y1 = 128 - L * Math.sin(g), sir = n && n[i]; const t = sir ? 0.12 : 0.7;
      return <g key={k}><polygon points={`${x0},128 ${x0 + L * Math.cos(g)},128 ${x1},${y1}`} fill={["#d7f0ff", "#d9b98a", "#b56576"][i]} stroke={K} strokeWidth="2" />
        <rect x={x0 + (x1 - x0) * t - 9} y={128 - (128 - y1) * t - 20} width="18" height="18" rx="3" fill="#f2b72e" stroke={K} strokeWidth="2" transform={`rotate(${-b} ${x0 + (x1 - x0) * t} ${128 - (128 - y1) * t - 11})`} />
        <text x={x0 + 38} y="144" fontSize="11" textAnchor="middle" fill={K} fontWeight="700">{__kbUi(NOM[k])}</text></g>; })}</svg>
    <p className="lo-izoh">{__kbUi("Vazifa: quti yog‘ochda sirpansin, lekin gilamda turib qolsin — shunday burchakni toping.")}</p>
    {n && <p className={R.qiyaOtdi(b) ? "lo-ok" : "lo-xato"}>{R.qiyaOtdi(b) ? __kbUi("Topdingiz! Gilamning ishqalanishi kuchliroq — u qutini ushlab qoladi.") : n[2] ? __kbUi("Juda tik — gilamda ham sirpanib ketdi.") : __kbUi("Yetarlicha tik emas — yog‘ochda ham turibdi.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>📦 {__kbUi("Qutini qo‘yib yuborish")}</button></div>;
}

function Masshtab({ onSinov }) {
  const [i, setI] = useState(0), [e, setE] = useState(4), [b, setB] = useState(4), [n, setN] = useState(null); const t = R.MASSHTAB[i]; const NOM = [__kbM("Xona"), __kbM("Sinf"), __kbM("Hovli")];
  const sina = () => { const ok = R.masshtabTogri(t, e, b); setN(ok); onSinov({ matn: `${__kbUi(NOM[i])} 1:${t.m}`, qiymat: `${e} × ${b} sm`, maqsad: ok }); };
  return <div className="lo-sim"><Tanlov royxat={NOM.map((x, k) => [k, __kbUi(x)])} qiymat={i} onTanla={(k) => { setI(k); setN(null); }} />
    <p className="lo-matn" style={{ fontSize: 15 }}>{__kbUi(NOM[i])}: <b>{t.eni} m × {t.boyi} m</b>. {__kbUi("Masshtab")} <b>1 : {t.m}</b> ({__kbUi("chizmadagi 1 sm — haqiqatda")} {t.m} sm). {__kbUi("Chizmada o‘lchamlar necha sm bo‘ladi?")}</p>
    <div className="lo-sozlama"><Sirg nom={__kbUi("Eni")} min={1} max={12} qadam={0.5} qiymat={e} birlik=" sm" onOzgar={(x) => { setE(x); setN(null); }} /><Sirg nom={__kbUi("Bo‘yi")} min={1} max={12} qadam={0.5} qiymat={b} birlik=" sm" onOzgar={(x) => { setB(x); setN(null); }} /></div>
    <svg viewBox="0 0 300 190" className="lo-chizma"><rect width="300" height="190" fill="#fff" />{Array.from({ length: 23 }, (_, k) => <line key={k} x1={k * 13 + 8} y1="0" x2={k * 13 + 8} y2="190" stroke="#e6edf5" />)}{Array.from({ length: 15 }, (_, k) => <line key={k} x1="0" y1={k * 13 + 8} x2="300" y2={k * 13 + 8} stroke="#e6edf5" />)}
      <rect x="21" y="21" width={e * 13} height={b * 13} fill="#cfe6ff" stroke={n === false ? "#d9534f" : K} strokeWidth="2.5" /><text x={21 + e * 6.5} y="16" fontSize="11" textAnchor="middle" fill={K}>{e} sm</text>
      <text x={27 + e * 13} y={25 + b * 6.5} fontSize="11" fill={K}>{b} sm</text><text x="292" y="184" fontSize="9" textAnchor="end" fill="#8a94a3">{__kbUi("1 katak = 1 sm")}</text></svg>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? __kbUi("Chizma masshtabga to‘g‘ri keldi!") : `${__kbUi("Mos emas. Eslatma")}: ${t.eni} m = ${t.eni * 100} sm; ${t.eni * 100} : ${t.m} = ?`}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>📐 {__kbUi("Chizmani tekshirish")}</button></div>;
}

function Sorov({ onSinov }) {
  const [i, setI] = useState(0); const s = R.SOROV[i]; const [u, setU] = useState([0, 0, 0, 0]), [n, setN] = useState(null);
  useEffect(() => { setU([0, 0, 0, 0]); setN(null); }, [i]);
  const sina = () => { const ok = R.sorovTogri(s, u); setN(ok); onSinov({ matn: __kbUi(s.savol), qiymat: u.join(", "), maqsad: ok }); };
  const SAV = [__kbM("Sevimli meva"), __kbM("Maktabga qanday keladi"), __kbM("Sevimli fasl")]; const TOIFA = [__kbM("olma"), __kbM("anor"), __kbM("uzum"), __kbM("banan"), __kbM("piyoda"), __kbM("avtobus"), __kbM("mashina"), __kbM("velosiped"), __kbM("bahor"), __kbM("yoz"), __kbM("kuz"), __kbM("qish")]; void TOIFA;
  return <div className="lo-sim"><Tanlov royxat={SAV.map((x, k) => [k, `${k + 1}`])} qiymat={i} onTanla={setI} />
    <p className="lo-izoh"><b>{__kbUi(s.savol)}</b> — {__kbUi("o‘quvchilarning javoblari")}:</p><p className="lo-javoblar">{s.javob.split(",").map((x, k) => <i key={k}>{__kbUi(x)}</i>)}</p>
    <div className="lo-ustunlar">{s.toifa.map((t, k) => <div key={t}><button type="button" onClick={() => { setN(null); setU(u.map((v, j) => (j === k ? Math.min(8, v + 1) : v))); }}>+</button>
      <span><em style={{ height: `${u[k] * 12}px`, background: ["#4b8ad6", "#f2b72e", "#2e9e5b", "#d9534f"][k] }} /></span><b>{u[k]}</b><button type="button" onClick={() => { setN(null); setU(u.map((v, j) => (j === k ? Math.max(0, v - 1) : v))); }}>−</button><small>{__kbUi(t)}</small></div>)}</div>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? __kbUi("Diagramma ma’lumotga to‘g‘ri keldi!") : __kbUi("Mos emas — har javobni bittadan sanab chiqing (belgilab borish yordam beradi).")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>📊 {__kbUi("Diagrammani tekshirish")}</button></div>;
}

function Rang({ onSinov }) {
  const [mi, setMi] = useState(0), [d, setD] = useState([0, 0, 0]), [n, setN] = useState(null); const m = R.RANG_MAQSAD[mi], hosil = R.rangAralash(...d);
  const NOM = { toq_sariq: __kbM("to‘q sariq"), yashil: __kbM("yashil"), binafsha: __kbM("binafsha"), och_yashil: __kbM("och yashil"), jigarrang: __kbM("jigarrang") };
  const sina = () => { const ok = hosil === m; setN(ok); onSinov({ matn: `🔴${d[0]} 🟡${d[1]} 🔵${d[2]}`, qiymat: __kbUi(NOM[m]), maqsad: ok }); };
  return <div className="lo-sim"><Tanlov royxat={R.RANG_MAQSAD.map((x, k) => [k, `${k + 1}`])} qiymat={mi} onTanla={(k) => { setMi(k); setD([0, 0, 0]); setN(null); }} />
    <div className="lo-ranglar"><div><span style={{ background: R.RANG_HEX[m] }} /><small>{__kbUi("kerak")}: {__kbUi(NOM[m])}</small></div><div><span style={{ background: R.RANG_HEX[hosil] }} /><small>{__kbUi("hosil bo‘ldi")}</small></div></div>
    <div className="lo-tomchi">{["#E63946", "#FFD23F", "#3A86FF"].map((c, k) => <div key={c}><button type="button" onClick={() => { setN(null); setD(d.map((v, j) => (j === k ? Math.min(3, v + 1) : v))); }} style={{ background: c }}>+</button><b>{d[k]}</b>
      <button type="button" onClick={() => { setN(null); setD(d.map((v, j) => (j === k ? Math.max(0, v - 1) : v))); }}>−</button></div>)}</div>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? __kbUi("Rang aynan chiqdi!") : __kbUi("Hali boshqacha. Qaysi bo‘yoqdan ko‘p yoki kam ekaniga qarang.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🎨 {__kbUi("Solishtirish")}</button></div>;
}

function Kod2({ onSinov }) {
  const [xi, setXi] = useState(0), [kod, setKod] = useState([]), [n, setN] = useState(null); const x = R.KOD2_XARITALAR[xi]; const eng = useMemo(() => R.kod2EngKam(x), [x]); const BEL = { U: "↑", D: "↓", L: "←", R: "→" };
  const yurit = () => { const r = R.kod2Yurit(x, kod); setN(r); onSinov({ matn: kod.map(([y, c]) => `${BEL[y]}×${c}`).join(" "), qiymat: `${kod.length} ${__kbUi("buyruq")}`, maqsad: r.natija === "yetdi" && kod.length <= eng + 1 }); };
  const yol = n?.yol, joy = yol?.at(-1);
  return <div className="lo-sim"><Tanlov royxat={R.KOD2_XARITALAR.map((_, k) => [k, `${k + 1}`])} qiymat={xi} onTanla={(k) => { setXi(k); setKod([]); setN(null); }} />
    <div className="lo-panjara" style={{ gridTemplateColumns: `repeat(${x[0].length}, 1fr)`, maxWidth: 360 }}>{x.map((q, i) => [...q].map((c, j) => { const izda = yol?.some(([a, b]) => a === i && b === j); const shu = joy ? joy[0] === i && joy[1] === j : c === "K";
      return <span key={`${i}:${j}`} className={`${c === "#" ? "is-devor" : ""} ${izda ? "is-iz" : ""}`} style={{ fontSize: 18 }}>{shu ? "🤖" : c === "Y" ? "⭐" : ""}</span>; }))}</div>
    <div className="lo-kod">{kod.length ? kod.map(([y, c], k) => <i key={k} style={{ width: "auto", padding: "0 8px", cursor: "pointer" }} onClick={() => { setN(null); setKod(kod.map((b, j) => (j === k ? [b[0], b[1] >= 6 ? 1 : b[1] + 1] : b))); }}>{BEL[y]}×{c}</i>) : <small>{__kbUi("Strelka qo‘shing; buyruqni bossangiz — takrorlar soni oshadi")}</small>}</div>
    <div className="lo-tugmalar">{["U", "L", "D", "R"].map((b) => <button key={b} type="button" onClick={() => { setKod([...kod, [b, 1]].slice(0, 8)); setN(null); }}>{BEL[b]}</button>)}<button type="button" onClick={() => { setKod(kod.slice(0, -1)); setN(null); }}>⌫</button></div>
    <p className="lo-izoh">{__kbUi("Maqsad: iloji boricha KAM buyruq. «→×5» — o‘ngga 5 marta takrorlash.")} {__kbUi("Eng kami")}: {eng}</p>
    {n && <p className={n.natija === "yetdi" ? "lo-ok" : "lo-xato"}>{n.natija === "yetdi" ? (kod.length <= eng + 1 ? __kbUi("Zo‘r! Takrorlash dasturni qisqa qildi.") : __kbUi("Yetdi, lekin buyruqlar ko‘p — bir xil yo‘nalishlarni takrorlash bilan birlashtiring.")) : __kbUi("Kabu yetib bormadi — yo‘lni qadam-baqadam sanab chiqing.")}</p>}
    <button type="button" className="lo-asosiy" onClick={yurit} disabled={!kod.length}>▶ {__kbUi("Ishga tushirish")}</button></div>;
}

export const LOYIHALAR2 = [
  { k: "filtr", yon: "S", belgi: "💧", nom: __kbM("Suv filtri"), sinf: "3–8", Sim: Filtr, fanlar: __kbM("Tabiatshunoslik · Kimyo · Ekologiya"), muammo: __kbM("Sayohatda faqat loyqa suv bor. Shag‘al, qum, ko‘mir va paxtadan uch qatlamli filtr yasang — suv kamida 80% tozalansin."),
    faraz: [__kbM("Qatlamlar tartibining ahamiyati yo‘q"), __kbM("Yirik zarrali qatlam yuqorida, maydasi pastda bo‘lishi kerak"), __kbM("Bitta qalin qatlam yetarli")], togri: 1,
    savol: __kbM("Nega mayda qum shag‘alning ustiga qo‘yilsa filtr yomon ishlaydi?"), javob: [__kbM("Yirik iflosliklar qumni darhol tiqib qo‘yadi"), __kbM("Qum og‘ir"), __kbM("Shag‘al suvni yoqtirmaydi")], jt: 0 },
  { k: "richag", yon: "E", belgi: "⚖️", nom: __kbM("Richag siri"), sinf: "4–8", Sim: Richag, fanlar: __kbM("Fizika · Matematika"), muammo: __kbM("Chapda 6 kg yuk tayanchdan 2 qadam uzoqda turibdi. O‘ng tomonga boshqa tosh qo‘yib, richagni muvozanatga keltiring."),
    faraz: [__kbM("Faqat bir xil og‘irlik muvozanatlaydi"), __kbM("Yengil tosh ham muvozanatlaydi — agar tayanchdan uzoqroq qo‘yilsa"), __kbM("Masofaning ahamiyati yo‘q")], togri: 1,
    savol: __kbM("3 kg tosh 6 kg yukni muvozanatlashi uchun nima kerak?"), javob: [__kbM("Uni ikki marta uzoqroq qo‘yish: og‘irlik × masofa teng bo‘lsin"), __kbM("Uni tayanchga yaqin qo‘yish"), __kbM("Buning iloji yo‘q")], jt: 0 },
  { k: "parashyut", yon: "E", belgi: "🪂", nom: __kbM("Tuxum parashyuti"), sinf: "3–8", Sim: Parashyut, fanlar: __kbM("Fizika · Muhandislik"), muammo: __kbM("Tuxumni balanddan sindirmay tushirish kerak. Parashyut gumbazini shunday tanlangki, tuxum yumshoq qo‘nsin va mato tejab qolinsin."),
    faraz: [__kbM("Gumbaz kattaligi tezlikka ta’sir qilmaydi"), __kbM("Katta gumbaz havoga ko‘proq tayanadi — sekinroq tushadi"), __kbM("Kichik gumbaz sekinroq tushadi")], togri: 1,
    savol: __kbM("Nega eng katta gumbaz eng yaxshi yechim emas?"), javob: [__kbM("U tezroq tushadi"), __kbM("Yetarli bo‘lgan o‘lchamdan kattasi — ortiqcha mato sarfi"), __kbM("U chiroyli emas")], jt: 1 },
  { k: "qayiq", yon: "S", belgi: "⛵", nom: __kbM("Plastilin qayiq"), sinf: "3–8", Sim: Qayiq, fanlar: __kbM("Fizika · Muhandislik"), muammo: __kbM("Plastilin bo‘lagi suvda cho‘kadi. Undan 10 ta tangani ko‘taradigan qayiq yasang. Plastilin cheklangan."),
    faraz: [__kbM("Qayiq qancha og‘ir bo‘lsa, shuncha yaxshi suzadi"), __kbM("Keng va devori baland qayiq ko‘proq suvni siqib chiqaradi va ko‘p yuk ko‘taradi"), __kbM("Shaklning ahamiyati yo‘q")], togri: 1,
    savol: __kbM("Nega plastilin sharcha cho‘kadi, o‘sha plastilindan qilingan qayiq esa suzadi?"), javob: [__kbM("Qayiq yengilroq"), __kbM("Qayiq ko‘proq suvni siqib chiqaradi — suv uni kuchliroq ko‘taradi"), __kbM("Suv qayiqni yaxshi ko‘radi")], jt: 1 },
  { k: "soya", yon: "S", belgi: "🌞", nom: __kbM("Soya soati"), sinf: "3–8", Sim: Soya, fanlar: __kbM("Tabiatshunoslik · Geometriya"), muammo: __kbM("1 metrli tayoqning soyasi kun davomida o‘zgaradi. Soya uzunligi tayoq bo‘yiga aynan teng bo‘ladigan vaqtni toping."),
    faraz: [__kbM("Soya kun bo‘yi bir xil"), __kbM("Tushda soya eng qisqa, ertalab va kechqurun uzun"), __kbM("Tushda soya eng uzun")], togri: 1,
    savol: __kbM("Soya tayoq bo‘yiga teng bo‘lganda quyosh qanday balandlikda turadi?"), javob: [__kbM("Taxminan 45° da"), __kbM("Tik tepada"), __kbM("Ufqda")], jt: 0 },
  { k: "qiya", yon: "E", belgi: "📦", nom: __kbM("Qiya tekislik"), sinf: "5–8", Sim: Qiya, fanlar: __kbM("Fizika"), muammo: __kbM("Bir xil quti uch xil sirtda: muz, yog‘och va gilam. Shunday qiyalik topingki, quti yog‘ochda sirpansin, gilamda esa turib qolsin."),
    faraz: [__kbM("Hamma sirtda bir xil burchakda sirpanadi"), __kbM("G‘adir-budur sirtda ishqalanish kuchli — sirpanish uchun tikroq qiyalik kerak"), __kbM("Muzda eng qiyin sirpanadi")], togri: 1,
    savol: __kbM("Qishda yo‘lga nega qum sepiladi?"), javob: [__kbM("Ishqalanishni oshirib, sirpanishni kamaytirish uchun"), __kbM("Yo‘l chiroyli bo‘lishi uchun"), __kbM("Muzni eritish uchun")], jt: 0 },
  { k: "masshtab", yon: "M", belgi: "📐", nom: __kbM("Xona rejasi"), sinf: "5–8", Sim: Masshtab, fanlar: __kbM("Matematika · Geografiya · Chizmachilik"), muammo: __kbM("Me’mor binoni qog‘ozga kichraytirib chizadi. Berilgan masshtab bo‘yicha xona, sinf va hovlining chizmadagi o‘lchamlarini toping."),
    faraz: [__kbM("Chizmada metr santimetrga almashtiriladi, xolos"), __kbM("Haqiqiy o‘lcham santimetrga o‘tkazilib, masshtab soniga bo‘linadi"), __kbM("Masshtab faqat xaritalarda bo‘ladi")], togri: 1,
    savol: __kbM("Masshtab 1 : 100 bo‘lsa, chizmadagi 3 sm haqiqatda qancha?"), javob: [__kbM("3 metr"), __kbM("30 sm"), __kbM("100 metr")], jt: 0 },
  { k: "sorov", yon: "M", belgi: "📊", nom: __kbM("So‘rovnoma va diagramma"), sinf: "2–6", Sim: Sorov, fanlar: __kbM("Matematika · Statistika"), muammo: __kbM("Sinfda so‘rovnoma o‘tkazildi. Javoblarni sanab, ustunli diagramma yasang — shunda natija bir qarashda ko‘rinadi."),
    faraz: [__kbM("Ro‘yxatga qarab ham hammasi tushunarli"), __kbM("Diagrammada qaysi javob ko‘p ekani darhol ko‘rinadi"), __kbM("Diagramma faqat bezak")], togri: 1,
    savol: __kbM("Sanashda adashmaslik uchun eng ishonchli usul qaysi?"), javob: [__kbM("Ko‘z bilan chamalash"), __kbM("Har javobni bittadan belgilab, toifalar bo‘yicha sanash"), __kbM("Eng uzun so‘zni tanlash")], jt: 1 },
  { k: "rang", yon: "A", belgi: "🎨", nom: __kbM("Rang ustaxonasi"), sinf: "1–6", Sim: Rang, fanlar: __kbM("San’at · Tabiatshunoslik"), muammo: __kbM("Rassomda faqat uchta bo‘yoq bor: qizil, sariq va ko‘k. Ulardan kerakli ranglarni aralashtirib hosil qiling."),
    faraz: [__kbM("Uchta bo‘yoqdan faqat uchta rang chiqadi"), __kbM("Uchta asosiy rangdan juda ko‘p rang hosil qilish mumkin — miqdorga qarab tusi o‘zgaradi"), __kbM("Aralashtirilsa doim qora chiqadi")], togri: 1,
    savol: __kbM("Och yashil hosil qilish uchun nima qilinadi?"), javob: [__kbM("Sariqdan ko‘proq, ko‘kdan kamroq olinadi"), __kbM("Ko‘kdan ko‘proq olinadi"), __kbM("Qizil qo‘shiladi")], jt: 0 },
  { k: "kod2", yon: "T", belgi: "🔁", nom: __kbM("Kabu-kod: takrorlash"), sinf: "3–8", Sim: Kod2, fanlar: __kbM("Informatika · Mantiq"), muammo: __kbM("Yo‘l uzun, lekin dastur qisqa bo‘lishi kerak. Bir xil buyruqni takrorlash orqali Kabuni eng kam buyruq bilan yulduzga yetkazing."),
    faraz: [__kbM("Uzun yo‘l uchun doim uzun dastur kerak"), __kbM("Takrorlash bir xil buyruqlarni bittaga birlashtiradi — dastur qisqaradi"), __kbM("Takrorlash dasturni sekinlashtiradi")], togri: 1,
    savol: __kbM("«O‘ngga, o‘ngga, o‘ngga, o‘ngga» o‘rniga qanday yozish qulay?"), javob: [__kbM("«O‘ngga × 4» — bitta takrorlash buyrug‘i"), __kbM("To‘rtta alohida dastur"), __kbM("Hech qanday farqi yo‘q")], jt: 0 },
];
