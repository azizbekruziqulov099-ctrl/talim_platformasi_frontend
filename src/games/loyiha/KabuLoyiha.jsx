// REV541: «🔬 Kabu loyiha» — STEM/STEAM laboratoriyasi. Har loyiha 5 bosqich: Muammo → Faraz → Yasash va sinash → Xulosa → Natija.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { osimlikOs, osimlikHolat, OSIMLIK_MAQSAD, koprikHisob, KOPRIK_MAQSAD, KOD_XARITALAR, kodYurit, kodEngQisqa, NAQSH_NAMUNALAR, naqshXato, BYUDJET, byudjetHisob, PORTFEL_KALIT, yulduzHisob } from "./loyihaRules.js";
import { LOYIHALAR2 } from "./Loyiha2.jsx";   // REV542: F2 — yana 10 loyiha
import { LOYIHALAR3 } from "./Loyiha3.jsx";   // REV546: F5 — 9–11-sinf
import { QoldaBolim, Tasdiqlash, loyihaApi } from "./Qolda.jsx";   // REV543: F3
import { SinfTopshiriqlari, Nishonlar, UstozPanel } from "./Guruh.jsx";   // REV544: F4
import "./loyiha.css";

const __kbM = (x) => x;   // REV541: ma'lumot ichidagi tarjima qilinadigan matn belgisi (skaner shu orqali ro'yxatga oladi)
const K = "#13314f";
const portfelOl = () => { try { return JSON.parse(localStorage.getItem(PORTFEL_KALIT) || "{}"); } catch { return {}; } };
const portfelYoz = (p) => { try { localStorage.setItem(PORTFEL_KALIT, JSON.stringify(p)); } catch { /* */ } };

// ── S: o'simlik ──
function Osimlik({ onSinov }) {
  const [suv, setSuv] = useState(1), [nur, setNur] = useState(1), [natija, setNatija] = useState(null);
  const SUV = [__kbM("Suv yo‘q"), __kbM("Yarim stakan"), __kbM("1 stakan"), __kbM("2 stakan"), __kbM("4 stakan")], NUR = [__kbM("Qorong‘i shkaf"), __kbM("Xona burchagi"), __kbM("Yorug‘ deraza"), __kbM("Kun bo‘yi oftob")];
  const sina = () => { const q = osimlikOs(suv, nur); const h = osimlikHolat(suv, nur); setNatija({ q, h }); onSinov({ matn: `${__kbUi(SUV[suv])} · ${__kbUi(NUR[nur])}`, qiymat: `${q.at(-1)} sm`, maqsad: q.at(-1) >= OSIMLIK_MAQSAD }); };
  const b = natija ? natija.q.at(-1) : 1; const rang = !natija ? "#2e9e5b" : { qurigan: "#b08d57", chirigan: "#6b5b3a", sargaygan: "#c9b84a", soglom: "#2e9e5b", ortacha: "#6fb56f" }[natija.h];
  return <div className="lo-sim">
    <div className="lo-sozlama"><label>{__kbUi("Kuniga suv")}: <b>{__kbUi(SUV[suv])}</b><input type="range" min="0" max="4" value={suv} onChange={(e) => setSuv(Number(e.target.value))} /></label>
      <label>{__kbUi("Yorug‘lik")}: <b>{__kbUi(NUR[nur])}</b><input type="range" min="0" max="3" value={nur} onChange={(e) => setNur(Number(e.target.value))} /></label></div>
    <svg viewBox="0 0 300 190" className="lo-chizma"><rect x="0" y="0" width="300" height="190" fill={["#3a4460", "#cfd8e6", "#e8f4ff", "#fff6d6"][nur]} />
      {nur >= 2 && <circle cx="262" cy="34" r={nur === 3 ? 24 : 16} fill="#ffd23f" />}<line x1="0" y1="165" x2="300" y2="165" stroke="#8B5A2B" strokeWidth="3" />
      <path d="M118,165 L126,132 L174,132 L182,165 Z" fill="#c47a45" stroke={K} strokeWidth="2" />
      <line x1="150" y1="132" x2="150" y2={132 - b * 6.2} stroke={rang} strokeWidth="5" strokeLinecap="round" />
      {Array.from({ length: Math.max(1, Math.floor(b / 3.2)) }, (_, i) => <ellipse key={i} cx={150 + (i % 2 ? 13 : -13)} cy={126 - (i + 1) * 17} rx="13" ry="6" fill={rang} transform={`rotate(${i % 2 ? -28 : 28} ${150 + (i % 2 ? 13 : -13)} ${126 - (i + 1) * 17})`} />)}
      {natija && natija.h === "soglom" && <circle cx="150" cy={128 - b * 6.2} r="9" fill="#ff70a6" />}
      <text x="12" y="24" fontSize="14" fill={nur === 0 ? "#fff" : K} fontWeight="700">{natija ? `7-${__kbUi("kun")}: ${b} sm` : __kbUi("Sharoitni tanlang va sinab ko‘ring")}</text>
      <line x1="60" y1={132 - OSIMLIK_MAQSAD * 6.2} x2="240" y2={132 - OSIMLIK_MAQSAD * 6.2} stroke="#d9534f" strokeDasharray="5 4" /><text x="244" y={136 - OSIMLIK_MAQSAD * 6.2} fontSize="10" fill="#d9534f">{OSIMLIK_MAQSAD} sm</text></svg>
    {natija && <p className={natija.q.at(-1) >= OSIMLIK_MAQSAD ? "lo-ok" : "lo-izoh"}>{__kbUi({ qurigan: __kbM("O‘simlik qurib qoldi — suv kerak."), chirigan: __kbM("Suv juda ko‘p — ildiz chiriy boshladi."), sargaygan: __kbM("Nur yetmadi — barglar sarg‘aydi."), soglom: __kbM("O‘simlik sog‘lom, gulladi!"), ortacha: __kbM("O‘smoqda, lekin sharoit eng yaxshisi emas.") }[natija.h])}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🌱 {__kbUi("7 kun o‘stirib ko‘rish")}</button>
  </div>;
}

// ── E: ko'prik ──
function Koprik({ onSinov }) {
  const [tur, setTur] = useState("tosin"), [q, setQ] = useState(1), [sinov, setSinov] = useState(null);
  const h = koprikHisob(tur, q); const NOM = { tosin: __kbM("Tekis to‘sin"), ferma: __kbM("Uchburchakli ferma"), ark: __kbM("Ark (yoy)") };
  const sina = () => { const ok = h.yuk >= KOPRIK_MAQSAD.yuk, arzon = h.narx <= KOPRIK_MAQSAD.narx; setSinov({ ok, arzon }); onSinov({ matn: `${__kbUi(NOM[tur])}, ${__kbUi("qalinlik")} ${q}`, qiymat: `${h.yuk} kg · ${h.narx} ${__kbUi("tanga")}`, maqsad: ok && arzon }); };
  const sindi = sinov && !sinov.ok;
  return <div className="lo-sim">
    <div className="lo-tanlov">{Object.keys(NOM).map((t) => <button key={t} type="button" className={tur === t ? "is-on" : ""} onClick={() => { setTur(t); setSinov(null); }}>{__kbUi(NOM[t])}</button>)}</div>
    <div className="lo-sozlama"><label>{__kbUi("Qalinlik")}: <b>{q}</b><input type="range" min="1" max="3" value={q} onChange={(e) => { setQ(Number(e.target.value)); setSinov(null); }} /></label></div>
    <svg viewBox="0 0 300 170" className="lo-chizma"><rect width="300" height="170" fill="#e8f4ff" /><rect x="0" y="120" width="60" height="50" fill="#8B5A2B" /><rect x="240" y="120" width="60" height="50" fill="#8B5A2B" /><rect x="60" y="140" width="180" height="30" fill="#7EC8F2" />
      <g stroke={K} strokeWidth={2 + q * 2} fill="none" strokeLinecap="round" transform={sindi ? "rotate(6 150 118)" : ""}>
        <line x1="55" y1="118" x2={sindi ? 140 : 245} y2="118" />{sindi && <line x1="160" y1="124" x2="245" y2="118" />}
        {tur === "ferma" && !sindi && <polyline points="55,118 86,78 118,118 150,78 182,118 214,78 245,118" />}{tur === "ferma" && !sindi && <line x1="86" y1="78" x2="214" y2="78" />}
        {tur === "ark" && !sindi && <path d="M55,118 Q150,30 245,118" />}</g>
      <g transform={`translate(132 ${sindi ? 122 : 88})`}><rect width="36" height="28" rx="4" fill="#f2b72e" stroke={K} strokeWidth="2" /><text x="18" y="19" fontSize="12" textAnchor="middle" fontWeight="800" fill={K}>{KOPRIK_MAQSAD.yuk}kg</text></g></svg>
    <p className="lo-izoh">{__kbUi("Ko‘taradi")}: <b>{h.yuk} kg</b> · {__kbUi("Narxi")}: <b>{h.narx}</b> {__kbUi("tanga")} ({__kbUi("byudjet")}: {KOPRIK_MAQSAD.narx})</p>
    {sinov && <p className={sinov.ok && sinov.arzon ? "lo-ok" : "lo-xato"}>{sinov.ok && sinov.arzon ? __kbUi("Ko‘prik yukni ko‘tardi va byudjetga sig‘di!") : !sinov.ok ? __kbUi("Ko‘prik sindi — mustahkamroq shakl yoki qalinroq material kerak.") : __kbUi("Ko‘tardi, lekin byudjetdan oshib ketdi — arzonroq yechim toping.")}</p>}
    <button type="button" className="lo-asosiy" onClick={sina}>🏋️ {__kbUi("Yuk qo‘yib sinash")}</button>
  </div>;
}

// ── T: Kabu-kod ──
function KabuKod({ onSinov }) {
  const [xi, setXi] = useState(0), [kod, setKod] = useState([]), [natija, setNatija] = useState(null);
  const x = KOD_XARITALAR[xi]; const eng = useMemo(() => kodEngQisqa(x), [x]); const yol = natija?.yol || null; const joy = yol ? yol.at(-1) : null;
  const yurit = () => { const r = kodYurit(x, kod); setNatija(r); onSinov({ matn: `${xi + 1}-${__kbUi("xarita")}: ${kod.length} ${__kbUi("buyruq")}`, qiymat: __kbUi({ yetdi: __kbM("yetdi"), devor: __kbM("devorga urildi"), chiqdi: __kbM("maydondan chiqdi"), yetmadi: __kbM("yetmadi") }[r.natija]), maqsad: r.natija === "yetdi" }); };
  const BEL = { U: "↑", D: "↓", L: "←", R: "→" };
  return <div className="lo-sim">
    <div className="lo-tanlov">{KOD_XARITALAR.map((_, i) => <button key={i} type="button" className={xi === i ? "is-on" : ""} onClick={() => { setXi(i); setKod([]); setNatija(null); }}>{i + 1}</button>)}</div>
    <div className="lo-panjara" style={{ gridTemplateColumns: `repeat(${x[0].length}, 1fr)` }}>{x.map((q, i) => [...q].map((c, j) => { const izda = yol?.some(([a, b]) => a === i && b === j); const shu = joy ? joy[0] === i && joy[1] === j : c === "K";
      return <span key={`${i}:${j}`} className={`${c === "#" ? "is-devor" : ""} ${izda ? "is-iz" : ""}`}>{shu ? "🤖" : c === "Y" ? "⭐" : ""}</span>; }))}</div>
    <div className="lo-kod">{kod.length ? kod.map((b, i) => <i key={i} className={natija && natija.natija !== "yetdi" && i === natija.qadam ? "is-xato" : ""}>{BEL[b]}</i>) : <small>{__kbUi("Strelkalarni bosib dastur tuzing")}</small>}</div>
    <div className="lo-tugmalar">{["U", "L", "D", "R"].map((b) => <button key={b} type="button" onClick={() => { setKod([...kod, b].slice(0, 24)); setNatija(null); }}>{BEL[b]}</button>)}
      <button type="button" onClick={() => { setKod(kod.slice(0, -1)); setNatija(null); }}>⌫</button><button type="button" onClick={() => { setKod([]); setNatija(null); }}>↺</button></div>
    {natija && <p className={natija.natija === "yetdi" ? "lo-ok" : "lo-xato"}>{natija.natija === "yetdi" ? `${__kbUi("Kabu yulduzga yetdi!")} ${kod.length <= eng ? __kbUi("Eng qisqa dastur — mukammal!") : `${__kbUi("Eng qisqa dastur")}: ${eng} ${__kbUi("buyruq")}`}`
      : __kbUi({ devor: __kbM("Kabu devorga urildi — qizil buyruqni o‘zgartiring."), chiqdi: __kbM("Kabu maydondan chiqib ketdi — qizil buyruqni o‘zgartiring."), yetmadi: __kbM("Dastur tugadi, lekin yulduzga yetmadi — buyruq qo‘shing.") }[natija.natija])}</p>}
    <button type="button" className="lo-asosiy" onClick={yurit} disabled={!kod.length}>▶ {__kbUi("Dasturni ishga tushirish")}</button>
  </div>;
}

// ── A: simmetrik naqsh ──
function Naqsh({ onSinov }) {
  const [ni, setNi] = useState(0); const chap = NAQSH_NAMUNALAR[ni]; const bosh = () => chap.map(() => "000");
  const [ong, setOng] = useState(bosh), [xato, setXato] = useState(null);
  useEffect(() => { setOng(chap.map(() => "000")); setXato(null); }, [ni]); // eslint-disable-line react-hooks/exhaustive-deps
  const bos = (i, j) => { setXato(null); setOng((o) => o.map((q, a) => (a === i ? [...q].map((c, b) => (b === j ? (c === "1" ? "0" : "1") : c)).join("") : q))); };
  const tekshir = () => { const x = naqshXato(chap, ong); setXato(x); onSinov({ matn: `${ni + 1}-${__kbUi("naqsh")}`, qiymat: x.length ? `${x.length} ${__kbUi("ta xato katak")}` : __kbUi("simmetrik"), maqsad: x.length === 0 }); };
  const xs = new Set((xato || []).map(([i, j]) => `${i}:${j}`));
  return <div className="lo-sim">
    <div className="lo-tanlov">{NAQSH_NAMUNALAR.map((_, i) => <button key={i} type="button" className={ni === i ? "is-on" : ""} onClick={() => setNi(i)}>{i + 1}</button>)}</div>
    <div className="lo-naqsh">{chap.map((q, i) => <React.Fragment key={i}>{[...q].map((c, j) => <span key={`c${j}`} className={c === "1" ? "is-boyoq" : ""} />)}<em />
      {[...ong[i]].map((c, j) => <button key={`o${j}`} type="button" onClick={() => bos(i, j)} className={`${c === "1" ? "is-boyoq" : ""} ${xs.has(`${i}:${j}`) ? "is-xato" : ""}`} aria-label={`${i + 1}, ${j + 1}`} />)}</React.Fragment>)}</div>
    <p className="lo-izoh">{__kbUi("Qizil chiziq — ko‘zgu. O‘ng tomonni chap tomonning ko‘zgudagi aksi bo‘ladigan qilib bo‘yang.")}</p>
    {xato && <p className={xato.length ? "lo-xato" : "lo-ok"}>{xato.length ? `${xato.length} ${__kbUi("ta katak mos emas — ular belgilangan.")}` : __kbUi("Naqsh to‘liq simmetrik!")}</p>}
    <button type="button" className="lo-asosiy" onClick={tekshir}>🪞 {__kbUi("Ko‘zguda tekshirish")}</button>
  </div>;
}

// ── M: byudjet ──
function Byudjet({ onSinov }) {
  const [savat, setSavat] = useState({}), [tek, setTek] = useState(null); const h = byudjetHisob(savat);
  const ozg = (k, d) => { setTek(null); setSavat((s) => ({ ...s, [k]: Math.max(0, Math.min(9, (s[k] || 0) + d)) })); };
  const tekshir = () => { setTek(h); onSinov({ matn: BYUDJET.mahsulotlar.filter((m) => savat[m.k]).map((m) => `${m.belgi}×${savat[m.k]}`).join(" ") || "—", qiymat: `${h.jami.toLocaleString("ru-RU")} ${__kbUi("so‘m")}`, maqsad: h.otdi }); };
  const TUR = { ichimlik: __kbM("ichimlik"), shirinlik: __kbM("shirinlik"), meva: __kbM("meva") };
  return <div className="lo-sim">
    <p className="lo-izoh"><b>{BYUDJET.pul.toLocaleString("ru-RU")} {__kbUi("so‘m")}</b> · {BYUDJET.mehmon} {__kbUi("mehmon")} · {__kbUi("har biriga ichimlik, shirinlik va meva yetsin")}</p>
    <div className="lo-mahsulot">{BYUDJET.mahsulotlar.map((m) => <div key={m.k}><span>{m.belgi}</span><b>{__kbUi(m.nom)}</b><small>{m.narx.toLocaleString("ru-RU")} · {m.porsiya} {__kbUi("kishilik")}</small>
      <div><button type="button" onClick={() => ozg(m.k, -1)}>−</button><i>{savat[m.k] || 0}</i><button type="button" onClick={() => ozg(m.k, 1)}>+</button></div></div>)}</div>
    <p className={h.qoldi < 0 ? "lo-xato" : "lo-izoh"}>{__kbUi("Jami")}: <b>{h.jami.toLocaleString("ru-RU")}</b> · {__kbUi("Qoldi")}: <b>{h.qoldi.toLocaleString("ru-RU")}</b> {__kbUi("so‘m")}</p>
    <p className="lo-izoh">{Object.keys(TUR).map((t) => <span key={t} style={{ marginRight: 10, color: (h.porsiya[t] || 0) >= BYUDJET.mehmon ? "#1f7a4d" : "#b3261e" }}>{__kbUi(TUR[t])}: {h.porsiya[t] || 0}/{BYUDJET.mehmon}</span>)}</p>
    {tek && <p className={tek.otdi ? "lo-ok" : "lo-xato"}>{tek.otdi ? `${__kbUi("Bayram tayyor! Tejab qolingan pul")}: ${tek.qoldi.toLocaleString("ru-RU")} ${__kbUi("so‘m")}` : tek.qoldi < 0 ? __kbUi("Pul yetmadi — qimmat narsani arzonrog‘iga almashtiring.") : `${__kbUi("Yetmayapti")}: ${tek.kam.map((t) => __kbUi(TUR[t])).join(", ")}`}</p>}
    <button type="button" className="lo-asosiy" onClick={tekshir}>🧾 {__kbUi("Hisobni tekshirish")}</button>
  </div>;
}

const LOYIHALAR = [
  { k: "osimlik", yon: "S", belgi: "🌱", nom: __kbM("O‘simlik kundaligi"), sinf: "1–6", Sim: Osimlik, fanlar: __kbM("Tabiatshunoslik · Matematika"),
    muammo: __kbM("Sinf derazasiga gul ekmoqchisiz. U 7 kunda 14 sm ga yetishi kerak. O‘simlikka qancha suv va qancha yorug‘lik kerakligini aniqlang."),
    faraz: [__kbM("Qancha ko‘p suv quyilsa, shuncha tez o‘sadi"), __kbM("O‘rtacha suv va yorug‘ joy eng yaxshisi"), __kbM("Yorug‘lik muhim emas, faqat suv kerak")], togri: 1,
    savol: __kbM("Nega 4 stakan suv quyilganda o‘simlik yomon o‘sdi?"), javob: [__kbM("Suv sovuq edi"), __kbM("Ortiqcha suvda ildiz nafas ololmaydi va chiriydi"), __kbM("O‘simlik suvni yoqtirmaydi")], jt: 1 },
  { k: "koprik", yon: "E", belgi: "🌉", nom: __kbM("Ko‘prik muhandisi"), sinf: "3–8", Sim: Koprik, fanlar: __kbM("Muhandislik · Fizika · Matematika"),
    muammo: __kbM("Daryo ustidan 10 kg yukni ko‘taradigan ko‘prik quring. Byudjet — 40 tanga. Qaysi shakl va qalinlik yetarli?"),
    faraz: [__kbM("Eng qalin tekis to‘sin eng mustahkam"), __kbM("Uchburchaklardan yasalgan ferma kam material bilan ko‘p yuk ko‘taradi"), __kbM("Shaklning ahamiyati yo‘q")], togri: 1,
    savol: __kbM("Nega uchburchakli ferma tekis to‘sindan mustahkamroq?"), javob: [__kbM("Uchburchak shaklini o‘zgartirmaydi — kuch tomonlarga taqsimlanadi"), __kbM("U og‘irroq"), __kbM("U chiroyliroq")], jt: 0 },
  { k: "kod", yon: "T", belgi: "🤖", nom: __kbM("Kabu-kod"), sinf: "1–6", Sim: KabuKod, fanlar: __kbM("Informatika · Mantiq"),
    muammo: __kbM("Kabu faqat buyruqlarni bajaradi. Strelkalardan dastur tuzib, uni devorlarga urilmasdan yulduzga yetkazing. Iloji boricha qisqa dastur yozing."),
    faraz: [__kbM("Dastur birinchi urinishda to‘g‘ri chiqadi"), __kbM("Dasturni sinab, xatosini topib, tuzatish kerak bo‘ladi"), __kbM("Qancha uzun bo‘lsa, shuncha yaxshi")], togri: 1,
    savol: __kbM("Dastur xato ishlaganda dasturchi nima qiladi?"), javob: [__kbM("Hammasini o‘chirib tashlaydi"), __kbM("Xato qadamni topib, faqat o‘shani tuzatadi"), __kbM("Kompyuterni almashtiradi")], jt: 1 },
  { k: "naqsh", yon: "A", belgi: "🎨", nom: __kbM("Simmetrik naqsh"), sinf: "1–6", Sim: Naqsh, fanlar: __kbM("San’at · Geometriya"),
    muammo: __kbM("Milliy naqshlar simmetrik bo‘ladi: bir tomoni ikkinchisining ko‘zgudagi aksi. Naqshning yarmi chizilgan — ikkinchi yarmini yakunlang."),
    faraz: [__kbM("O‘ng tomon chap tomonning aynan nusxasi"), __kbM("O‘ng tomon chap tomonning ko‘zgudagi aksi — ko‘zguga yaqin katak yaqin qoladi"), __kbM("Simmetriyada qoida yo‘q")], togri: 1,
    savol: __kbM("Ko‘zgu chizig‘idan 2 katak uzoqdagi bo‘yalgan katakning aksi qayerda bo‘ladi?"), javob: [__kbM("Ko‘zguning boshqa tomonida, 2 katak uzoqda"), __kbM("Ko‘zguga yopishib"), __kbM("Eng chekkada")], jt: 0 },
  { k: "byudjet", yon: "M", belgi: "🧮", nom: __kbM("Bayram byudjeti"), sinf: "3–8", Sim: Byudjet, fanlar: __kbM("Matematika · Moliyaviy savodxonlik"),
    muammo: __kbM("Tug‘ilgan kunga 4 mehmon keladi. 60 000 so‘m bor. Har mehmonga ichimlik, shirinlik va meva yetsin. Pulni qanday taqsimlaysiz?"),
    faraz: [__kbM("Eng qimmat narsalarni olish kerak"), __kbM("Avval zarur narsalarni hisoblab, keyin qolgan pulga qo‘shimcha olish kerak"), __kbM("Hisoblamasdan ham yetadi")], togri: 1,
    savol: __kbM("Tort va sharbat olinsa, mevaga pul yetmaydi. Nima qilish to‘g‘ri?"), javob: [__kbM("Mevasiz qoldirish"), __kbM("Qimmat narsani arzonrog‘iga almashtirib, hamma zarur narsaga yetkazish"), __kbM("Qarz olish")], jt: 1 },
];
const HAMMA = [...LOYIHALAR, ...LOYIHALAR2, ...LOYIHALAR3];
const YON = { S: [__kbM("Tabiat"), "#2e9e5b"], T: [__kbM("Texnologiya"), "#3A86FF"], E: [__kbM("Muhandislik"), "#FF8C1A"], A: [__kbM("San’at"), "#9B5DE5"], M: [__kbM("Matematika"), "#E63946"] };
const BOSQICH = [__kbM("Muammo"), __kbM("Faraz"), __kbM("Yasash va sinash"), __kbM("Xulosa"), __kbM("Natija")];

function Loyiha({ l, onYop, onSaqla, apiBase, token }) {
  const [b, setB] = useState(0), [faraz, setFaraz] = useState(null), [sinovlar, setSinovlar] = useState([]), [javob, setJavob] = useState(null);
  const maqsad = sinovlar.some((s) => s.maqsad); const yulduz = yulduzHisob({ maqsad, xulosa: javob === l.jt, urinish: sinovlar.length });
  useEffect(() => { if (b === 4) onSaqla({ yulduz, urinish: sinovlar.length, faraz: faraz === l.togri, xulosa: javob === l.jt, maqsad, vaqt: Date.now() }); }, [b]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="lo-sahifa">
    <div className="lo-bosh"><button type="button" className="lo-ortga" onClick={onYop}>← {__kbUi("Loyihalar")}</button><b>{l.belgi} {__kbUi(l.nom)}</b></div>
    <ol className="lo-qadamlar">{BOSQICH.map((n, i) => <li key={n} className={i === b ? "is-on" : i < b ? "is-otdi" : ""}><span>{i + 1}</span>{__kbUi(n)}</li>)}</ol>
    <div className="lo-karta">
      {b === 0 && <><h3>🧭 {__kbUi("Muammo")}</h3><p className="lo-matn">{__kbUi(l.muammo)}</p><small className="lo-fan">{__kbUi(l.fanlar)}</small>
        <button type="button" className="lo-asosiy" onClick={() => setB(1)}>{__kbUi("Tushundim — faraz qilaman")} ▶</button></>}
      {b === 1 && <><h3>💭 {__kbUi("Faraz: siz nima deb o‘ylaysiz?")}</h3><p className="lo-izoh">{__kbUi("Hali sinamadik — o‘z taxminingizni tanlang. Xato bo‘lsa ham mayli: olimlar ham farazni tajribada tekshiradi.")}</p>
        <div className="lo-variant">{l.faraz.map((f, i) => <button key={i} type="button" className={faraz === i ? "is-on" : ""} onClick={() => setFaraz(i)}>{__kbUi(f)}</button>)}</div>
        <button type="button" className="lo-asosiy" disabled={faraz === null} onClick={() => setB(2)}>{__kbUi("Tekshirib ko‘ramiz")} ▶</button></>}
      {b === 2 && <><h3>🔧 {__kbUi("Yasash va sinash")}</h3><l.Sim onSinov={(s) => setSinovlar((x) => [...x, s].slice(-12))} />
        {sinovlar.length > 0 && <table className="lo-jadval"><thead><tr><th>№</th><th>{__kbUi("Nima sinaldi")}</th><th>{__kbUi("Natija")}</th><th /></tr></thead>
          <tbody>{sinovlar.map((s, i) => <tr key={i}><td>{i + 1}</td><td>{s.matn}</td><td>{s.qiymat}</td><td>{s.maqsad ? "✅" : "—"}</td></tr>)}</tbody></table>}
        <button type="button" className="lo-asosiy" disabled={!sinovlar.length} onClick={() => setB(3)}>{maqsad ? __kbUi("Maqsadga yetdim — xulosa") : __kbUi("Xulosaga o‘tish")} ▶</button>
        {!maqsad && sinovlar.length > 0 && <small className="lo-izoh">{__kbUi("Maqsadga hali yetilmadi — sharoitni o‘zgartirib yana sinab ko‘ring.")}</small>}</>}
      {b === 3 && <><h3>📝 {__kbUi("Xulosa")}</h3>
        <p className={faraz === l.togri ? "lo-ok" : "lo-izoh"}>{faraz === l.togri ? __kbUi("Farazingiz tajribada tasdiqlandi!") : __kbUi("Farazingiz tasdiqlanmadi — bu ham natija: endi to‘g‘risini bilasiz.")} <b>{__kbUi(l.faraz[l.togri])}.</b></p>
        <p className="lo-matn">{__kbUi(l.savol)}</p>
        <div className="lo-variant">{l.javob.map((f, i) => <button key={i} type="button" disabled={javob !== null} className={javob === null ? "" : i === l.jt ? "is-togri" : i === javob ? "is-xato" : ""} onClick={() => setJavob(i)}>{__kbUi(f)}</button>)}</div>
        <button type="button" className="lo-asosiy" disabled={javob === null} onClick={() => setB(4)}>{__kbUi("Natijani ko‘rish")} ▶</button></>}
      {b === 4 && <><h3>🏅 {__kbUi("Natija")}</h3><div className="lo-yulduz">{"⭐".repeat(yulduz)}<span>{"☆".repeat(3 - yulduz)}</span></div>
        <ul className="lo-4k"><li>{maqsad ? "✅" : "▫️"} {__kbUi("Muammoni yechdi (maqsadga yetdi)")}</li><li>{sinovlar.length >= 2 ? "✅" : "▫️"} {__kbUi("Bir necha marta sinab, yaxshiladi")} ({sinovlar.length})</li>
          <li>{faraz === l.togri ? "✅" : "▫️"} {__kbUi("Farazi tajribada tasdiqlandi")}</li><li>{javob === l.jt ? "✅" : "▫️"} {__kbUi("Sababini to‘g‘ri tushuntirdi")}</li></ul>
        <p className="lo-izoh">{__kbUi("Loyiha portfelingizga saqlandi.")}</p>
        <QoldaBolim loyiha={l.k} apiBase={apiBase} token={token} />
        <div className="lo-tugmalar"><button type="button" className="lo-asosiy" onClick={onYop}>{__kbUi("Boshqa loyiha")}</button>
          <button type="button" className="lo-ortga" onClick={() => { setB(2); setJavob(null); }}>↻ {__kbUi("Yana sinab ko‘rish")}</button></div></>}
    </div>
  </div>;
}

export default function KabuLoyiha({ onClose, apiBase = "", token = "" }) {
  const [tan, setTan] = useState(null), [portfel, setPortfel] = useState(portfelOl), [yon, setYon] = useState(""), [server, setServer] = useState(null), [bir, setBir] = useState(0);
  // REV543: server bilan sinxron — qurilma almashsa ham portfel yo'qolmaydi (eng yaxshi yulduz olinadi)
  useEffect(() => { if (!token) return; loyihaApi(apiBase, token, "/api/loyiha/portfel").then((p) => { setServer(p); setPortfel((lok) => { const y = { ...lok };
    for (const [k, v] of Object.entries(p.ekran || {})) if (!y[k] || v.yulduz > (y[k].yulduz || 0)) y[k] = { ...(y[k] || {}), yulduz: v.yulduz, urinish: v.urinish, soni: Math.max(v.soni, y[k]?.soni || 0), faraz: v.faraz, xulosa: v.xulosa, maqsad: v.maqsad };
    portfelYoz(y); return y; }); }).catch(() => {}); }, [apiBase, token, tan]);
  const saqla = (k, n) => {
    if (token) loyihaApi(apiBase, token, "/api/loyiha/natija", { loyiha: k, yulduz: n.yulduz, urinish: n.urinish, faraz: !!n.faraz, xulosa: !!n.xulosa, maqsad: !!n.maqsad }).catch(() => {}); const eski = portfel[k]; const y = { ...portfel, [k]: !eski || n.yulduz >= eski.yulduz ? { ...n, soni: (eski?.soni || 0) + 1 } : { ...eski, soni: (eski.soni || 0) + 1 } }; setPortfel(y); portfelYoz(y); };
  const royxatL = HAMMA.map((l) => ({ k: l.k, nom: l.nom, belgi: l.belgi, sinf: l.sinf }));
  if (tan) return <Loyiha key={tan.k} l={tan} onYop={() => setTan(null)} onSaqla={(n) => saqla(tan.k, n)} apiBase={apiBase} token={token} />;
  const jami = Object.values(portfel).reduce((a, x) => a + (x.yulduz || 0), 0);
  const korinadi = HAMMA.filter((l) => !yon || l.yon === yon);
  return <div className="lo-sahifa">
    <div className="lo-bosh"><div><h2>🔬 {__kbUi("Kabu loyiha")}</h2><small>{__kbUi("STEAM laboratoriyasi: muammo → faraz → yasash → sinash → xulosa")}</small></div>
      {onClose && <button type="button" className="lo-ortga" onClick={onClose}>← {__kbUi("O‘yinlar")}</button>}</div>
    <SinfTopshiriqlari apiBase={apiBase} token={token} loyihalar={royxatL} bir={bir} onBoshla={(k) => setTan(HAMMA.find((l) => l.k === k) || null)} />
    <Tasdiqlash apiBase={apiBase} token={token} /><UstozPanel apiBase={apiBase} token={token} loyihalar={royxatL} onOzgardi={() => setBir((x) => x + 1)} />
    <p className="lo-izoh">🎒 {__kbUi("Portfel")}: {Object.keys(portfel).length} / {HAMMA.length} {__kbUi("loyiha")} · ⭐ {jami}</p>
    {Object.keys(portfel).length > 0 && <Nishonlar portfel={portfel} server={server} />}
    <div className="lo-tanlov" style={{ justifyContent: "flex-start" }}><button type="button" className={!yon ? "is-on" : ""} onClick={() => setYon("")}>{__kbUi("Hammasi")}</button>
      {Object.keys(YON).map((y) => <button key={y} type="button" className={yon === y ? "is-on" : ""} onClick={() => setYon(y)} style={yon === y ? { background: YON[y][1], borderColor: YON[y][1] } : null}>{y} · {__kbUi(YON[y][0])}</button>)}</div>
    <div className="lo-royxat">{korinadi.map((l) => { const p = portfel[l.k]; return <button key={l.k} type="button" className="lo-loyiha" onClick={() => setTan(l)}>
      <span className="lo-belgi">{l.belgi}</span><div><i style={{ background: YON[l.yon][1] }}>{l.yon} · {__kbUi(YON[l.yon][0])}</i><b>{__kbUi(l.nom)}</b><small>{__kbUi(l.fanlar)} · {l.sinf}-{__kbUi("sinf")}</small>
        <em>{p ? "⭐".repeat(p.yulduz) : __kbUi("Boshlanmagan")}</em></div></button>; })}</div>
  </div>;
}
