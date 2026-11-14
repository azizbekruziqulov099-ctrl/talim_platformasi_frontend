// REV546: Kabu loyiha F5 — 9–11-sinf loyihalari (simulyatsiyalar SVG).
import React, { useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import * as R from "./loyihaRules3.js";

const __kbM = (x) => x;   // ma'lumot ichidagi tarjima qilinadigan matn belgisi
const K = "#13314f";
const Tanlov = ({ royxat, qiymat, onTanla }) => <div className="lo-tanlov">{royxat.map(([k, n]) => <button key={k} type="button" className={qiymat === k ? "is-on" : ""} onClick={() => onTanla(k)}>{n}</button>)}</div>;
const Sirg = ({ nom, min, max, qadam = 1, qiymat, onOzgar, birlik = "" }) => <label>{nom}: <b>{qiymat}{birlik}</b><input type="range" min={min} max={max} step={qadam} value={qiymat} onChange={(e) => onOzgar(Number(e.target.value))} /></label>;

function Energiya({ onSinov }) {
  const [u, setU] = useState({ qazilma: 70, qayta: 20, atom: 10 }), [n, setN] = useState(null); const h = R.energiyaHisob(u);
  const NOM = { qazilma: __kbM("Ko‘mir va gaz"), qayta: __kbM("Quyosh va shamol"), atom: __kbM("Atom") }, RANG = { qazilma: "#6b5b3a", qayta: "#2e9e5b", atom: "#9B5DE5" };
  const sina = () => { setN(h); onSinov({ matn: `${u.qazilma}% / ${u.qayta}% / ${u.atom}%`, qiymat: `+${h.isish} °C · ${h.narx}`, maqsad: h.otdi }); };
  return <div className="lo-sim"><div className="lo-sozlama">{Object.keys(NOM).map((k) => <Sirg key={k} nom={__kbUi(NOM[k])} min={0} max={100} qadam={10} qiymat={u[k]} birlik="%" onOzgar={(v) => { setN(null); setU({ ...u, [k]: v }); }} />)}</div>
    <div className="lo-ulush">{Object.keys(NOM).map((k) => <i key={k} style={{ width: `${u[k]}%`, background: RANG[k] }} title={__kbUi(NOM[k])} />)}</div>
    <p className={h.yigindi === 100 ? "lo-izoh" : "lo-xato"}>{__kbUi("Jami")}: <b>{h.yigindi}%</b> ({__kbUi("100% bo‘lishi kerak")}) · {__kbUi("Narx")}: <b>{h.narx}</b> / {R.ENERGIYA.byudjet}</p>
    <svg viewBox="0 0 300 120" className="lo-chizma"><rect width="300" height="120" fill="#eef6ff" /><text x="10" y="18" fontSize="11" fill={K}>{__kbUi("2100-yilga kelib isish")}</text>
      <rect x="10" y="30" width="280" height="22" rx="6" fill="#e3e8ef" /><rect x="10" y="30" width={Math.min(280, (h.isish / 4) * 280)} height="22" rx="6" fill={h.isish <= R.ENERGIYA.chegaraT ? "#2e9e5b" : h.isish <= 2.6 ? "#f2b72e" : "#d9534f"} />
      <line x1={10 + (R.ENERGIYA.chegaraT / 4) * 280} y1="24" x2={10 + (R.ENERGIYA.chegaraT / 4) * 280} y2="58" stroke={K} strokeWidth="2" strokeDasharray="4 3" /><text x={14 + (R.ENERGIYA.chegaraT / 4) * 280} y="70" fontSize="10" fill={K}>{__kbUi("chegara")} +{R.ENERGIYA.chegaraT} °C</text>
      <text x="16" y="46" fontSize="13" fontWeight="800" fill="#fff">+{h.isish} °C</text><text x="10" y="98" fontSize="11" fill={K}>CO₂: {h.ppm} ppm · {__kbUi("chiqindi")}: {h.chiqindi} Gt/{__kbUi("yil")}</text></svg>
    {n && <p className={n.otdi ? "lo-ok" : "lo-xato"}>{n.otdi ? __kbUi("Iqlim ham, byudjet ham, ishonchlilik ham joyida!") : n.yigindi !== 100 ? __kbUi("Ulushlar yig‘indisi 100% bo‘lsin.") : n.isish > R.ENERGIYA.chegaraT ? __kbUi("Isish chegaradan oshdi — qazilma yoqilg‘ini kamaytiring.") : !n.ishonchli ? __kbUi("Quyosh va shamol 60% dan oshsa, tunda va shamolsiz kunda energiya yetmaydi.") : __kbUi("Byudjetdan oshdi — atom qimmat, uni kamaytirib ko‘ring.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🌍 {__kbUi("2100-yilgacha hisoblash")}</button></div>;
}

function Tahlil({ onSinov }) {
  const [i, setI] = useState(0); const t = R.TAHLIL[i]; const xs = t.nuqtalar.map((p) => p[0]), ys = t.nuqtalar.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const e = useMemo(() => R.eknk(t.nuqtalar), [t]);
  const kMax = Math.ceil((e.k * 2) * 10) / 10, bMin = Math.floor(e.b - (y1 - y0)), bMax = Math.ceil(e.b + (y1 - y0));
  const [k, setK] = useState(0), [b, setB] = useState(Math.round((y0 + y1) / 2)), [n, setN] = useState(null);
  const tanla = (j) => { setI(j); setK(0); const q = R.TAHLIL[j].nuqtalar.map((p) => p[1]); setB(Math.round((Math.min(...q) + Math.max(...q)) / 2)); setN(null); };
  const X = (x) => 34 + ((x - x0) / (x1 - x0)) * 250, Y = (y) => 150 - ((y - (y0 - 8)) / (y1 - y0 + 16)) * 136; const xat = R.xatolik(t.nuqtalar, k, b);
  const NOM = [__kbM("Tayyorgarlik va natija"), __kbM("Harorat va muzqaymoq savdosi"), __kbM("Yosh va bo‘y (o‘g‘il bolalar)")]; void NOM;
  const chegara = useMemo(() => R.tahlilChegara(t.nuqtalar), [t]);
  const sina = () => { const ok = R.tahlilOtdi(t.nuqtalar, k, b); setN(ok); onSinov({ matn: `y = ${k}x + ${b}`, qiymat: `${__kbUi("xatolik")} ${xat}`, maqsad: ok }); };
  return <div className="lo-sim"><Tanlov royxat={R.TAHLIL.map((_, j) => [j, `${j + 1}`])} qiymat={i} onTanla={tanla} /><p className="lo-izoh"><b>{__kbUi(t.nom)}</b> ({t.x} → {t.y})</p>
    <svg viewBox="0 0 300 170" className="lo-chizma"><rect width="300" height="170" fill="#fff" /><line x1="34" y1="150" x2="290" y2="150" stroke={K} /><line x1="34" y1="10" x2="34" y2="150" stroke={K} />
      {t.nuqtalar.map(([x, y], j) => <g key={j}><line x1={X(x)} y1={Y(y)} x2={X(x)} y2={Y(k * x + b)} stroke="#d9534f" strokeWidth="1.5" opacity="0.6" /><circle cx={X(x)} cy={Y(y)} r="4.5" fill="#4b8ad6" stroke={K} /></g>)}
      <line x1={X(x0)} y1={Y(k * x0 + b)} x2={X(x1)} y2={Y(k * x1 + b)} stroke="#f2a000" strokeWidth="3" /><text x="40" y="22" fontSize="12" fontWeight="700" fill={K}>y = {k}x + {b}</text><text x="40" y="38" fontSize="11" fontWeight="700" fill={xat <= chegara ? "#1f7a4d" : "#d9534f"}>{__kbUi("o‘rtacha xatolik")}: {xat} ({__kbUi("maqsad")} ≤ {chegara})</text></svg>
    <div className="lo-sozlama"><Sirg nom={__kbUi("Qiyalik (k)")} min={0} max={kMax} qadam={0.1} qiymat={k} onOzgar={(v) => { setK(Math.round(v * 10) / 10); setN(null); }} /><Sirg nom={__kbUi("Siljish (b)")} min={bMin} max={bMax} qiymat={b} onOzgar={(v) => { setB(v); setN(null); }} /></div>
    <p className="lo-izoh">{__kbUi("Chiziqni nuqtalarga iloji boricha yaqin o‘tkazing: qizil chiziqchalar (xatolar) qisqa bo‘lsin.")}</p>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? `${__kbUi("Zo‘r! Eng yaxshi chiziq")}: y = ${Math.round(e.k * 100) / 100}x + ${Math.round(e.b * 10) / 10}` : __kbUi("Xatolik hali katta — qiyalik va siljishni birga sozlang.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>📈 {__kbUi("Chiziqni tekshirish")}</button></div>;
}

function Shamol({ onSinov }) {
  const [b, setB] = useState(30), [s, setS] = useState(2), [u, setU] = useState(2), [n, setN] = useState(null); const h = R.shamolHisob(b, s, u);
  const sina = () => { setN(h); onSinov({ matn: `${b}°, ${s} ${__kbUi("parrak")}, ${u} m`, qiymat: `${h.kVt} kVt · ${h.narx}`, maqsad: h.otdi }); };
  return <div className="lo-sim"><div className="lo-sozlama"><Sirg nom={__kbUi("Parrak burchagi")} min={0} max={45} qadam={5} qiymat={b} birlik="°" onOzgar={(v) => { setB(v); setN(null); }} /><Sirg nom={__kbUi("Parraklar soni")} min={2} max={5} qiymat={s} onOzgar={(v) => { setS(v); setN(null); }} /><Sirg nom={__kbUi("Parrak uzunligi")} min={1} max={3} qiymat={u} birlik=" m" onOzgar={(v) => { setU(v); setN(null); }} /></div>
    <svg viewBox="0 0 300 170" className="lo-chizma"><rect width="300" height="170" fill="#dff1ff" /><rect y="150" width="300" height="20" fill="#7fbf6a" /><polygon points="146,150 154,150 152,70 148,70" fill="#b9c6d6" stroke={K} />
      <g style={{ transformOrigin: "150px 70px", animation: `lo-aylan ${Math.max(0.5, 6 - h.kVt * 1.2)}s linear infinite` }}>{Array.from({ length: s }, (_, i) => <ellipse key={i} cx="150" cy={70 - u * 11} rx={4 + b / 9} ry={u * 11} fill="#fff" stroke={K} strokeWidth="1.5" transform={`rotate(${(360 / s) * i} 150 70)`} />)}</g>
      <circle cx="150" cy="70" r="5" fill={K} /><text x="10" y="20" fontSize="13" fontWeight="700" fill={K}>{h.kVt} kVt</text><text x="10" y="36" fontSize="10" fill={K}>Cp = {h.cp} · {__kbUi("shamol")} {R.SHAMOL.v} m/s</text><text x="200" y="20" fontSize="10" fill="#d9534f">{__kbUi("kerak")} ≥ {R.SHAMOL.maqsad} kVt</text></svg>
    <p className={h.narx <= R.SHAMOL.byudjet ? "lo-izoh" : "lo-xato"}>{__kbUi("Narx")}: <b>{h.narx}</b> / {R.SHAMOL.byudjet}</p>
    {n && <p className={n.otdi ? "lo-ok" : "lo-xato"}>{n.otdi ? __kbUi("Tegirmon yetarli quvvat berdi va byudjetga sig‘di!") : n.narx > R.SHAMOL.byudjet ? __kbUi("Byudjetdan oshdi — parraklar soni yoki uzunligini kamaytiring.") : __kbUi("Quvvat yetmadi. Eslatma: quvvat parrak uzunligining kvadratiga bog‘liq, burchakning esa eng qulay qiymati bor.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🌬️ {__kbUi("Shamolda sinash")}</button></div>;
}

function Daraxt({ p, rang = K, eni = 2.4 }) {
  const k = R.fraktalChiz(p); const xs = k.flatMap((q) => [q[0], q[2]]), ys = k.flatMap((q) => [q[1], q[3]]); const w = Math.max(1.2, Math.max(...xs) - Math.min(...xs)), h = Math.max(...ys);
  const m = Math.min(130 / w, 150 / h);
  return <g>{k.map(([x1, y1, x2, y2, d], i) => <line key={i} x1={75 + x1 * m} y1={160 - y1 * m} x2={75 + x2 * m} y2={160 - y2 * m} stroke={d >= p.chuqurlik - 1 ? "#2e9e5b" : rang} strokeWidth={Math.max(0.6, eni - d * 0.3)} strokeLinecap="round" />)}</g>;
}
function Fraktal({ onSinov }) {
  const [i, setI] = useState(0); const nishon = R.FRAKTAL_NISHON[i]; const [p, setP] = useState({ burchak: 10, nisbat: 0.5, chuqurlik: 3 }), [n, setN] = useState(null);
  const sina = () => { const ok = R.fraktalMos(p, nishon); setN(ok); onSinov({ matn: `${p.burchak}°, ${p.nisbat}, ${p.chuqurlik}`, qiymat: `${R.fraktalShoxlar(p.chuqurlik)} ${__kbUi("shox")}`, maqsad: ok }); };
  const o = (k, v) => { setN(null); setP({ ...p, [k]: v }); };
  return <div className="lo-sim"><Tanlov royxat={R.FRAKTAL_NISHON.map((_, j) => [j, `${j + 1}`])} qiymat={i} onTanla={(j) => { setI(j); setN(null); }} />
    <div className="lo-ikki"><div><svg viewBox="0 0 150 170" className="lo-chizma"><rect width="150" height="170" fill="#fff8e6" /><Daraxt p={nishon} rang="#8B5A2B" /></svg><small>{__kbUi("namuna")}</small></div>
      <div><svg viewBox="0 0 150 170" className="lo-chizma"><rect width="150" height="170" fill="#eef6ff" /><Daraxt p={p} /></svg><small>{__kbUi("sizniki")}: {R.fraktalShoxlar(p.chuqurlik)} {__kbUi("shox")}</small></div></div>
    <div className="lo-sozlama"><Sirg nom={__kbUi("Shoxlanish burchagi")} min={5} max={60} qadam={5} qiymat={p.burchak} birlik="°" onOzgar={(v) => o("burchak", v)} /><Sirg nom={__kbUi("Qisqarish nisbati")} min={0.4} max={0.85} qadam={0.05} qiymat={p.nisbat} onOzgar={(v) => o("nisbat", Math.round(v * 100) / 100)} /><Sirg nom={__kbUi("Chuqurlik (necha marta bo‘linadi)")} min={1} max={8} qiymat={p.chuqurlik} onOzgar={(v) => o("chuqurlik", v)} /></div>
    {n !== null && <p className={n ? "lo-ok" : "lo-xato"}>{n ? `${__kbUi("Daraxt namunaga mos! Jami shoxlar")}: 2^${p.chuqurlik + 1} − 1 = ${R.fraktalShoxlar(p.chuqurlik)}` : __kbUi("Hali farq bor: shoxlar soni (chuqurlik), kengligi (burchak) va bo‘yini (nisbat) solishtiring.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🌳 {__kbUi("Namuna bilan solishtirish")}</button></div>;
}

function Kredit({ onSinov }) {
  const [b, setB] = useState(0), [oy, setOy] = useState(36), [n, setN] = useState(null); const h = R.kreditHisob(b, oy); const C = R.KREDIT;
  const sina = () => { setN(h); onSinov({ matn: `${b} mln + ${oy} ${__kbUi("oy")}`, qiymat: `${h.oylik} · +${h.ortiqcha} mln`, maqsad: h.otdi }); };
  return <div className="lo-sim"><p className="lo-matn" style={{ fontSize: 15 }}>💻 {__kbUi("Noutbuk")}: <b>{C.narx} mln</b> · {__kbUi("oylik daromad")}: <b>{C.daromad} mln</b> · {__kbUi("jamg‘arma")}: <b>{C.jamgarma} mln</b> · {__kbUi("yillik foiz")}: <b>{C.yillik}%</b></p>
    <div className="lo-sozlama"><Sirg nom={__kbUi("Boshlang‘ich to‘lov")} min={0} max={6} qiymat={b} birlik=" mln" onOzgar={(v) => { setB(v); setN(null); }} /><label>{__kbUi("Muddat")}<Tanlov royxat={[6, 12, 18, 24, 36].map((x) => [x, `${x} ${__kbUi("oy")}`])} qiymat={oy} onTanla={(v) => { setOy(v); setN(null); }} /></label></div>
    <table className="lo-atom" style={{ alignSelf: "center" }}><tbody>
      <tr className={h.yuk <= C.tolovUlushi * 100 ? "is-teng" : "is-farq"}><th>{__kbUi("Oylik to‘lov")}</th><td>{h.oylik} mln</td><td>{h.yuk}% ({__kbUi("chegara")} {C.tolovUlushi * 100}%)</td></tr>
      <tr className={h.ortiqcha <= C.ortiqcha ? "is-teng" : "is-farq"}><th>{__kbUi("Ortiqcha to‘lov (foiz)")}</th><td>{h.ortiqcha} mln</td><td>{__kbUi("chegara")} {C.ortiqcha} mln</td></tr>
      <tr className={b <= C.jamgarma ? "is-teng" : "is-farq"}><th>{__kbUi("Boshlang‘ich to‘lov")}</th><td>{b} mln</td><td>{__kbUi("jamg‘arma")} {C.jamgarma} mln</td></tr></tbody></table>
    {n && <p className={n.otdi ? "lo-ok" : "lo-xato"}>{n.otdi ? `${__kbUi("To‘g‘ri tanlov! Jami to‘laysiz")}: ${Math.round((n.jami + b) * 100) / 100} mln` : b > C.jamgarma ? __kbUi("Jamg‘armangizdan ko‘p boshlang‘ich to‘lov qila olmaysiz.") : n.yuk > C.tolovUlushi * 100 ? __kbUi("Oylik to‘lov daromadning 30% idan oshdi — muddatni uzaytiring yoki boshlang‘ich to‘lovni oshiring.") : __kbUi("Ortiqcha to‘lov ko‘p — muddat qancha uzun bo‘lsa, bankka shuncha ko‘p foiz to‘lanadi.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🏦 {__kbUi("Shartnomani hisoblash")}</button></div>;
}

export const LOYIHALAR3 = [
  { k: "energiya", yon: "S", belgi: "🌍", nom: __kbM("Energiya va iqlim"), sinf: "9–11", Sim: Energiya, fanlar: __kbM("Fizika · Ekologiya · Iqtisodiyot"), muammo: __kbM("Mamlakat energiyasini uch manbadan yig‘ing. Shartlar: 2100-yilga kelib isish +2 °C dan oshmasin, xarajat byudjetga sig‘sin va energiya uzluksiz bo‘lsin."),
    faraz: [__kbM("Hammasini quyosh va shamolga o‘tkazish — eng yaxshi yechim"), __kbM("Hech bir manba yolg‘iz yetmaydi: toza, lekin uzluksiz va arzon aralashma kerak"), __kbM("Energiya manbai iqlimga ta’sir qilmaydi")], togri: 1,
    savol: __kbM("Nega quyosh va shamol ulushini 100% qilib bo‘lmaydi (hozirgi texnologiyada)?"), javob: [__kbM("Ular tunda va shamolsiz kunda energiya bermaydi — zaxira yoki boshqa manba kerak"), __kbM("Ular havoni ifloslaydi"), __kbM("Ular juda arzon")], jt: 0 },
  { k: "tahlil", yon: "T", belgi: "📈", nom: __kbM("Ma’lumotdan bashorat"), sinf: "9–11", Sim: Tahlil, fanlar: __kbM("Informatika · Statistika · Algebra"), muammo: __kbM("Ma’lumotlar nuqtalar bo‘lib sochilgan. Ular orqali shunday to‘g‘ri chiziq o‘tkazingki, xatolik eng kam bo‘lsin — sun’iy intellekt ham bashoratni shunday o‘rganadi."),
    faraz: [__kbM("Chiziq hamma nuqtadan aniq o‘tishi shart"), __kbM("Eng yaxshi chiziq nuqtalarga o‘rtacha eng yaqin o‘tadi — xatolar yig‘indisi eng kam"), __kbM("Istalgan chiziq bir xil yaxshi")], togri: 1,
    savol: __kbM("Topilgan chiziq nima uchun kerak?"), javob: [__kbM("Faqat chiroyli ko‘rinish uchun"), __kbM("Yangi qiymat uchun natijani oldindan taxmin qilish (bashorat) uchun"), __kbM("Nuqtalarni o‘chirish uchun")], jt: 1 },
  { k: "shamol", yon: "E", belgi: "🌬️", nom: __kbM("Shamol tegirmoni"), sinf: "9–11", Sim: Shamol, fanlar: __kbM("Fizika · Muhandislik"), muammo: __kbM("Qishloq uchun shamol generatori loyihalang: kamida 3,6 kVt quvvat bersin va byudjetdan oshmasin. Parrak burchagi, soni va uzunligini tanlang."),
    faraz: [__kbM("Parrak qancha ko‘p bo‘lsa, quvvat shuncha katta"), __kbM("Quvvat asosan parrak uzunligiga (qamragan yuzaga) bog‘liq, burchakning esa eng qulay qiymati bor"), __kbM("Burchak qancha katta bo‘lsa, shuncha yaxshi")], togri: 1,
    savol: __kbM("Parrak uzunligi 2 baravar oshsa, quvvat qanday o‘zgaradi?"), javob: [__kbM("2 baravar oshadi"), __kbM("Taxminan 4 baravar oshadi — yuza uzunlik kvadratiga bog‘liq"), __kbM("O‘zgarmaydi")], jt: 1 },
  { k: "fraktal", yon: "A", belgi: "🌳", nom: __kbM("Fraktal daraxt"), sinf: "9–11", Sim: Fraktal, fanlar: __kbM("San’at · Geometriya · Algebra"), muammo: __kbM("Tabiatdagi daraxt, paporotnik va qor parchasi bitta qoidaning takrorlanishidan hosil bo‘ladi. Uch son bilan namunadagi daraxtni aynan qaytaring."),
    faraz: [__kbM("Murakkab shakl uchun murakkab qoida kerak"), __kbM("Oddiy qoida ko‘p marta takrorlansa, murakkab va chiroyli shakl hosil bo‘ladi"), __kbM("Daraxt shakli tasodifiy")], togri: 1,
    savol: __kbM("Har shox ikkiga bo‘linsa, chuqurlik 1 ga oshganda shoxlar soni qanday o‘zgaradi?"), javob: [__kbM("Taxminan ikki baravar ko‘payadi (geometrik progressiya)"), __kbM("Ikkitaga ko‘payadi"), __kbM("O‘zgarmaydi")], jt: 0 },
  { k: "kredit", yon: "M", belgi: "🏦", nom: __kbM("Kredit va foiz"), sinf: "9–11", Sim: Kredit, fanlar: __kbM("Matematika · Moliyaviy savodxonlik"), muammo: __kbM("Noutbukni kreditga olmoqchisiz. Boshlang‘ich to‘lov va muddatni shunday tanlangki, oylik to‘lov daromadning 30% idan, ortiqcha to‘lov esa 1,3 mln so‘mdan oshmasin."),
    faraz: [__kbM("Eng uzun muddat — eng foydali, chunki oylik to‘lov kichik"), __kbM("Muddat uzaysa oylik to‘lov kamayadi, lekin bankka to‘lanadigan foiz ko‘payadi — muvozanat topish kerak"), __kbM("Muddatning ahamiyati yo‘q")], togri: 1,
    savol: __kbM("Nega 36 oylik kredit 12 oylikdan qimmatga tushadi?"), javob: [__kbM("Qarz uzoqroq turadi — foiz ko‘proq oy davomida hisoblanadi"), __kbM("Bank uzun muddatni yoqtirmaydi"), __kbM("Noutbuk eskiradi")], jt: 0 },
];
