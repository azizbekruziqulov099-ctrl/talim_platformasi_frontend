import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import KursTolov, { somFmt } from "./KursTolov.jsx";
import "./kabutarKurslar.css";

const DarsXonasi = React.lazy(() => import("../lesson/DarsXonasi.jsx"));
const MarkazPanel = React.lazy(() => import("../markaz/MarkazPanel.jsx"));
const XalqaroBaholash = React.lazy(() => import("../xalqaro/XalqaroBaholash.jsx"));

export const sinfYozuv = (s) => (/^\d+$/.test(String(s)) ? `${s}-sinf` : String(s));
// Bolalar kurslari yoshga bo'linmaydi; faqat matematikada dastur yoshi yoziladi
export const kursNomi = (k) => (k.kategoriya === "bolalar" && /matem/i.test(k.nomi) ? `${k.nomi} (2–7 yosh dasturi)` : k.nomi);

/** REV301: «Kurslar» — platformadagi hamma darsli kurs bitta joyda: fan, til, erkin til, sertifikat, xalqaro, bolalar. */
export default function KabutarKurslar({ apiBase, token, user }) {
  const { locale } = useKbInterfaceLocale();
  const til = String(locale || "uz").slice(0, 2);
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [data, setData] = useState(null);
  const [xato, setXato] = useState("");
  const [kat, setKat] = useState(null);
  const [qidir, setQidir] = useState("");
  const [kurs, setKurs] = useState(null);        // ochilgan kurs (darslar ro'yxati)
  const [dars, setDars] = useState(null);        // ochilgan dars
  const [tolov, setTolov] = useState(null);      // yopiq dars bosilganda

  const yukla = () => {
    setXato("");
    fetch(`${base}/api/kurslar/katalog?${new URLSearchParams({ token, til })}`).then(async (r) => {
      const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${r.status}`); setData(d);
    }).catch((e) => setXato(e.message));
  };
  useEffect(yukla, [base, token, til]); // eslint-disable-line react-hooks/exhaustive-deps

  const kurslar = useMemo(() => (data?.kurslar || []).filter((k) => (!kat || k.kategoriya === kat)
    && (!qidir.trim() || kursNomi(k).toLowerCase().includes(qidir.trim().toLowerCase()))), [data, kat, qidir]);
  const soni = (c) => (data?.kurslar || []).filter((k) => k.kategoriya === c).length;

  const kursniOch = (k) => {
    setKurs({ ...k, darslarSoni: k.darslar, darslar: [], yuklanmoqda: true });
    fetch(`${base}/api/kurslar/kurs?${new URLSearchParams({ token, fan: k.fan, grade: k.sinflar[0] || "" })}`).then(async (r) => {
      const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${r.status}`);
      setKurs({ ...k, ...d, darslar: Array.isArray(d.darslar) ? d.darslar : [], nomi: k.nomi, yuklanmoqda: false });
    }).catch((e) => setKurs({ ...k, darslar: [], yuklanmoqda: false, xato: e.message }));
  };

  if (dars) return <div className="kk-toliq"><React.Suspense fallback={<p className="kk-p">{__kbUi("Yuklanmoqda…")}</p>}>
    <DarsXonasi apiBase={apiBase} token={token} topicCode={dars.topic_code} fan={kurs?.fan || ""} grade={String(dars.sinf || "")}
      jins={user?.jins} learnerRole={user?.role || ""} onClose={() => { setDars(null); if (kurs) kursniOch((data?.kurslar || []).find((x) => x.kalit === kurs.kalit) || kurs); }} /></React.Suspense></div>;
  if (kat === "sertifikat") return <Bolim nom="🎓 Sertifikat" onOrtga={() => setKat(null)}><React.Suspense fallback={<p className="kk-p">…</p>}><MarkazPanel apiBase={apiBase} token={token} user={user} /></React.Suspense></Bolim>;
  if (kat === "xalqaro") return <Bolim nom="🌍 Xalqaro baholash" onOrtga={() => setKat(null)}><React.Suspense fallback={<p className="kk-p">…</p>}><XalqaroBaholash apiBase={apiBase} token={token} user={user} jins={user?.jins} /></React.Suspense></Bolim>;

  if (kurs) return <section className="kk" aria-label={kursNomi(kurs)}>
    <button type="button" className="kk-ortga" onClick={() => setKurs(null)}>← {__kbUi("Kurslar")}</button>
    <header className="kk-kurs-bosh"><h2>{kursNomi(kurs)}</h2>
      <p>{kurs.yuklanmoqda ? (kurs.darslarSoni ?? "…") : kurs.darslar.length} {__kbUi("ta dars")} · {Number(kurs.narx) > 0 ? (kurs.obuna_tugaydi ? __kbUi(`✓ Ochiq · ${kurs.obuna_tugaydi} gacha`) : __kbUi(`Birinchi ${kurs.bepul} ta dars bepul · ${somFmt(kurs.narx)} / 30 kun`)) : __kbUi("Bepul kurs")}</p></header>
    {kurs.yuklanmoqda && <p className="kk-p">{__kbUi("Yuklanmoqda…")}</p>}
    {kurs.xato && <p className="kk-xato" role="alert">{kurs.xato}</p>}
    <ol className="kk-darslar">{(kurs.darslar || []).map((d, i) => <li key={d.topic_code}>
      <button type="button" className={`kk-dars ${d.ochiq ? "" : "is-qulf"}`} onClick={() => (d.ochiq ? setDars(d) : setTolov({ kalit: kurs.kalit, nomi: kursNomi(kurs), narx: kurs.narx, bepul: kurs.bepul }))}>
        <span className="kk-raqam">{i + 1}</span><span className="kk-dars-nom">{d.nomi || d.topic_code}{kurs.kategoriya === "bolalar" && (kurs.sinflar || []).length > 1 ? <small> · {__kbUi(`${(kurs.sinflar || []).indexOf(d.sinf) + 1}-qism`)}</small> : null}</span>
        <span className="kk-belgi" aria-label={d.ochiq ? (d.bepul ? __kbUi("bepul") : __kbUi("ochiq")) : __kbUi("yopiq")}>{d.ochiq ? (d.bepul && Number(kurs.narx) > 0 ? "🎁" : "▶") : "🔒"}</span></button></li>)}</ol>
    {tolov && <KursTolov apiBase={apiBase} token={token} kurs={tolov} onClose={() => setTolov(null)} />}
  </section>;

  return <section className="kk" aria-label={__kbUi("Kabutar kurslari")}>
    <div className="kk-kategoriyalar" role="tablist" aria-label={__kbUi("Yo‘nalishlar")}>
      <button type="button" role="tab" aria-selected={!kat} className={!kat ? "is-faol" : ""} onClick={() => setKat(null)}><b>✨</b><span>{__kbUi("Hammasi")}</span><small>{(data?.kurslar || []).length}</small></button>
      {(data?.kategoriyalar || []).filter((c) => c.kalit === "sertifikat" || c.kalit === "xalqaro" || soni(c.kalit)).map((c) => (
        <button key={c.kalit} type="button" role="tab" aria-selected={kat === c.kalit} className={kat === c.kalit ? "is-faol" : ""} onClick={() => setKat(c.kalit)} title={__kbUi(c.izoh)}>
          <b aria-hidden="true">{c.belgi}</b><span>{__kbUi(c.nomi)}</span><small>{c.kalit === "sertifikat" || c.kalit === "xalqaro" ? "→" : soni(c.kalit)}</small></button>))}
    </div>
    <input type="search" className="kk-qidir" value={qidir} onChange={(e) => setQidir(e.target.value)} placeholder={__kbUi("Kurs qidirish: matematika, ingliz tili…")} />
    {kat && <p className="kk-izoh">{__kbUi((data?.kategoriyalar || []).find((c) => c.kalit === kat)?.izoh || "")}</p>}
    {xato && <p className="kk-xato" role="alert">{xato} <button type="button" onClick={yukla}>{__kbUi("Qayta")}</button></p>}
    {!data && !xato && <p className="kk-p">{__kbUi("Yuklanmoqda…")}</p>}
    <div className="kk-panjara">{kurslar.map((k) => <button type="button" key={k.kalit} className="kk-karta" onClick={() => kursniOch(k)}>
      <span className="kk-kat">{(data?.kategoriyalar || []).find((c) => c.kalit === k.kategoriya)?.belgi}</span>
      <b>{kursNomi(k)}</b>
      <small>{k.darslar} {__kbUi("ta dars")}{k.kategoriya === "bolalar" && k.sinflar.length > 1 ? ` · ${k.sinflar.length} ${__kbUi("qism")}` : ""} · {k.tillar.map((t) => t.toUpperCase()).join(" / ")}</small>
      <span className={`kk-narx ${k.obuna ? "is-ochiq" : ""}`}>{k.obuna ? __kbUi("✓ Ochiq") : Number(k.narx) > 0 ? __kbUi(`${k.bepul} ta dars bepul · ${somFmt(k.narx)}`) : __kbUi("Bepul")}</span>
    </button>)}</div>
    {data && !kurslar.length && <p className="kk-p">{__kbUi("Bu yo‘nalishda hali kurs yo‘q")}</p>}
  </section>;
}

function Bolim({ nom, onOrtga, children }) {
  return <section className="kk"><button type="button" className="kk-ortga" onClick={onOrtga}>← {__kbUi("Kurslar")}</button><h2 className="kk-bolim-nom">{__kbUi(nom)}</h2>{children}</section>;
}
