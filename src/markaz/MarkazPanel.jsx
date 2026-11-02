// REV270: O'quv markazi — ikki yo'l: «Sertifikat» va «Erkin til». Yozilish (yo'l → til/imtihon → maqsad → jadval) va
// shaxsiy panel: holat xabari (eslatma / motivatsiya / tanbeh — raqamlar bilan), imtihongacha kunlar, ochiq bo'limlar.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./markaz.css";

const TILLAR = { en: "🇬🇧 Ingliz tili", ru: "🇷🇺 Rus tili", de: "🇩🇪 Nemis tili", fr: "🇫🇷 Fransuz tili", es: "🇪🇸 Ispan tili", ar: "🇸🇦 Arab tili",
  tr: "🇹🇷 Turk tili", ko: "🇰🇷 Koreys tili", ja: "🇯🇵 Yapon tili", zh: "🇨🇳 Xitoy tili" };
const HAFTA = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const RANG = { yaxshi: "is-yaxshi", eslatma: "is-eslatma", motivatsiya: "is-motiv", tanbeh: "is-tanbeh" };

export function jadvalMatni(j = {}) {
  if (j.turi === "kunlar") return `${__kbUi("Har hafta")}: ${(j.kunlar || []).map((k) => HAFTA[k]).join(", ")}`;
  if (j.turi === "haftada") return `${__kbUi("Haftasiga")} ${j.soni || 2} ${__kbUi("kun")}`;
  return __kbUi("Istalgan vaqtda");
}

export default function MarkazPanel({ apiBase = "", token = "" }) {
  const base = String(apiBase).replace(/\/+$/, "");
  const [katalog, setKatalog] = useState(null);
  const [kurslar, setKurslar] = useState(null);
  const [xato, setXato] = useState("");
  const [yangi, setYangi] = useState(false);
  const yukla = () => {
    fetch(`${base}/api/markaz/men?${new URLSearchParams({ token })}`).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { setKurslar(d.kurslar || []); if (!(d.kurslar || []).length) setYangi(true); })
      .catch(() => setXato(__kbUi("Ma’lumotni yuklab bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.")));
  };
  useEffect(() => {
    fetch(`${base}/api/markaz/katalog`).then((r) => r.json()).then(setKatalog).catch(() => setXato(__kbUi("Katalog yuklanmadi")));
    yukla();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (xato) return <section className="mk-root"><p className="mk-xato" role="alert">{xato}</p></section>;
  if (!katalog || !kurslar) return <section className="mk-root"><p role="status">{__kbUi("Yuklanmoqda…")}</p></section>;
  return <section className="mk-root">
    <header className="mk-bosh">
      <h2>{__kbUi("O‘quv markazi")}</h2>
      <p>{__kbUi("Sertifikatga tayyorlanish yoki tilni hayot uchun erkin o‘rganish — cheklovsiz: qancha o‘rgansangiz, shuncha ochiladi.")}</p>
      {!yangi && <button type="button" className="mk-btn" onClick={() => setYangi(true)}>＋ {__kbUi("Yangi kurs")}</button>}
    </header>
    {yangi && <Yozilish katalog={katalog} base={base} token={token} onBekor={kurslar.length ? () => setYangi(false) : null} onTayyor={() => { setYangi(false); yukla(); }} />}
    {!yangi && kurslar.map((k) => <KursKarta key={k.id} k={k} katalog={katalog} />)}
  </section>;
}

function KursKarta({ k, katalog }) {
  const im = katalog.imtihonlar[k.imtihon];
  const h = k.holat || {};
  return <article className={`mk-kurs ${RANG[h.daraja] || ""}`}>
    <div className="mk-kurs-bosh">
      <span className="mk-yol">{k.yol === "sertifikat" ? "🎓 " + __kbUi("Sertifikat") : "🌍 " + __kbUi("Erkin til")}</span>
      <h3>{TILLAR[k.til] || k.til}{im ? ` — ${im.nom}` : ""}</h3>
      {k.maqsad && <span className="mk-maqsad">{__kbUi("Maqsad")}: <b>{k.maqsad}</b></span>}
    </div>
    <p className="mk-holat" role="status">{h.gap}</p>
    <dl className="mk-raqam">
      {h.imtihongacha != null && <div><dt>{__kbUi("Imtihongacha")}</dt><dd>{h.imtihongacha} {__kbUi("kun")}</dd></div>}
      <div><dt>{__kbUi("Oxirgi dars")}</dt><dd>{h.tanaffus_kun === 0 ? __kbUi("bugun") : `${h.tanaffus_kun} ${__kbUi("kun oldin")}`}</dd></div>
      <div><dt>{__kbUi("Jadval")}</dt><dd>{jadvalMatni(k.jadval)}</dd></div>
      <div><dt>{__kbUi("Ochiq bo‘limlar")}</dt><dd>{k.ochiq_bolim}</dd></div>
      {h.yoqolayotgan_soz > 0 && <div className="mk-xavf"><dt>{__kbUi("Esdan chiqayotgan so‘zlar")}</dt><dd>{h.yoqolayotgan_soz}</dd></div>}
    </dl>
    <div className="mk-amal">
      <button type="button" className="mk-btn" disabled title={__kbUi("Kurs materiallari tayyorlanmoqda")}>▶ {__kbUi("Darsni boshlash")}</button>
      <button type="button" className="mk-btn is-ikkinchi" disabled title={__kbUi("Tez kunda")}>🧭 {__kbUi("Daraja aniqlash testi")}</button>
      <small>{__kbUi("Kurs materiallari tayyorlanmoqda — tez orada ochiladi.")}</small>
    </div>
  </article>;
}

function Yozilish({ katalog, base, token, onTayyor, onBekor }) {
  const [yol, setYol] = useState("");
  const [til, setTil] = useState("");
  const [imtihon, setImtihon] = useState("");
  const [maqsad, setMaqsad] = useState("");
  const [sana, setSana] = useState("");
  const [jTur, setJTur] = useState("kunlar");
  const [kunlar, setKunlar] = useState([0, 3]);
  const [soni, setSoni] = useState(2);
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState("");
  const imtihonlar = useMemo(() => Object.entries(katalog.imtihonlar).filter(([, v]) => !til || v.tillar.includes(til)), [katalog, til]);
  const im = katalog.imtihonlar[imtihon];
  const tayyor = yol && til && (yol === "erkin" || (imtihon && maqsad)) && (jTur !== "kunlar" || kunlar.length);
  const yubor = async () => {
    setBand(true); setXato("");
    try {
      const jadval = jTur === "kunlar" ? { turi: "kunlar", kunlar } : jTur === "haftada" ? { turi: "haftada", soni } : { turi: "erkin" };
      const r = await fetch(`${base}/api/markaz/yozil`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yol, til, imtihon: yol === "sertifikat" ? imtihon : null, maqsad: yol === "sertifikat" ? maqsad : null, imtihon_sana: sana || null, jadval }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.status);
      onTayyor?.();
    } catch (e) { setXato(`${__kbUi("Saqlanmadi")}: ${e.message}`); } finally { setBand(false); }
  };
  return <div className="mk-yozil">
    <h3>1. {__kbUi("Yo‘lni tanlang")}</h3>
    <div className="mk-tanlov">
      {[["sertifikat", "🎓", __kbUi("Sertifikat"), __kbUi("Milliy sertifikat, IELTS, TOEFL, SAT va boshqalar — imtihon formatida tayyorlov")],
        ["erkin", "🌍", __kbUi("Erkin til"), __kbUi("Hujjatsiz: o‘sha davlatda oddiy fuqarodek gapirish, tushunish, o‘qish va yozish")]].map(([k, e, n, iz]) =>
        <button key={k} type="button" className={`mk-karta ${yol === k ? "is-on" : ""}`} aria-pressed={yol === k} onClick={() => { setYol(k); setImtihon(""); setMaqsad(""); }}>
          <span className="mk-e">{e}</span><b>{n}</b><small>{iz}</small></button>)}
    </div>
    {yol && <>
      <h3>2. {__kbUi("Tilni tanlang")}</h3>
      <div className="mk-chiplar">{Object.entries(TILLAR).map(([k, n]) => <button key={k} type="button" className={`mk-chip ${til === k ? "is-on" : ""}`} aria-pressed={til === k} onClick={() => { setTil(k); setImtihon(""); setMaqsad(""); }}>{n}</button>)}</div>
    </>}
    {yol === "sertifikat" && til && <>
      <h3>3. {__kbUi("Imtihon va maqsad")}</h3>
      <div className="mk-chiplar">{imtihonlar.map(([k, v]) => <button key={k} type="button" className={`mk-chip ${imtihon === k ? "is-on" : ""}`} aria-pressed={imtihon === k} onClick={() => { setImtihon(k); setMaqsad(""); }}>{v.nom}</button>)}</div>
      {im && <div className="mk-imtihon">
        <p><b>{im.nom}</b> — {im.shkala}{im.amal && im.amal !== "—" ? ` · ${__kbUi("amal qiladi")}: ${im.amal}` : ""}</p>
        {im.bolimlar?.length > 0 && <ul>{im.bolimlar.map((b) => <li key={b.nom}>{b.nom}{b.topshiriq ? ` — ${b.topshiriq} ${__kbUi("topshiriq")}` : ""}{b.daqiqa ? `, ${b.daqiqa} ${__kbUi("daqiqa")}` : ""}</li>)}</ul>}
        <label>{__kbUi("Maqsad (daraja yoki ball)")}: <select value={maqsad} onChange={(e) => setMaqsad(e.target.value)}><option value="">—</option>{im.darajalar.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label>{__kbUi("Imtihon sanasi (ixtiyoriy)")}: <input type="date" value={sana} onChange={(e) => setSana(e.target.value)} /></label>
      </div>}
    </>}
    {yol && til && (yol === "erkin" || imtihon) && <>
      <h3>{yol === "sertifikat" ? 4 : 3}. {__kbUi("Dars jadvali")}</h3>
      <div className="mk-chiplar">
        {[["kunlar", __kbUi("Aniq kunlar")], ["haftada", __kbUi("Haftasiga N kun")], ["erkin", __kbUi("Istalgan vaqtda")]].map(([k, n]) =>
          <button key={k} type="button" className={`mk-chip ${jTur === k ? "is-on" : ""}`} aria-pressed={jTur === k} onClick={() => setJTur(k)}>{n}</button>)}
      </div>
      {jTur === "kunlar" && <div className="mk-hafta">{HAFTA.map((h, i) => <label key={h} className={kunlar.includes(i) ? "is-on" : ""}>
        <input type="checkbox" checked={kunlar.includes(i)} onChange={() => setKunlar((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i].sort()))} />{__kbUi(h)}</label>)}</div>}
      {jTur === "haftada" && <label className="mk-soni">{__kbUi("Haftasiga")} <input type="number" min="1" max="7" value={soni} onChange={(e) => setSoni(Math.max(1, Math.min(7, Number(e.target.value) || 1)))} /> {__kbUi("kun")}</label>}
      <p className="mk-izoh">{__kbUi("Jadvalga rioya qilmasangiz, avval eslatamiz, keyin motivatsiya beramiz, uzoq to‘xtasangiz — jiddiy ogohlantiramiz (natijangiz raqamlari bilan).")}</p>
    </>}
    {xato && <p className="mk-xato" role="alert">{xato}</p>}
    <div className="mk-amal">
      <button type="button" className="mk-btn" disabled={!tayyor || band} onClick={yubor}>{band ? __kbUi("Saqlanmoqda…") : __kbUi("Kursni boshlash")}</button>
      {onBekor && <button type="button" className="mk-btn is-ikkinchi" onClick={onBekor}>{__kbUi("Bekor qilish")}</button>}
    </div>
  </div>;
}
