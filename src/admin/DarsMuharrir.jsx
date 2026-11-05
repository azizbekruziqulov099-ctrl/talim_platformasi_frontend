// REV364: «Bog'cha darslari muharriri» (admin) — yosh va fan bo'yicha darslar; har darsning qadamlari: kim gapiradi (ustoz / o'quvchi),
// doskada nima chiqadi, qaysi o'yin (raqami va nomi), test variantlari. Har qatorni tahrirlab saqlash, o'yinni darhol sinash,
// hamma o'zgarishlarni Excel'ga eksport qilish (boshqa tillarni shu asosda tuzatish uchun).
import React, { useEffect, useMemo, useState } from "react";
import Oyin, { OYINLAR } from "../kid/oyin/index.js";
import { qadamOyini, darsElementlari, yoshGuruh } from "../lesson/oyinQadam.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { emojiRasm, matnId, sozId } from "../kid/rasmHarakat.js";
import { kabuAyt, kabuJimm } from "../kid/kabuOvoz.js";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { oyinRasmTop } from "../kid/oyin/oyinRasmTop.js";
import "./oyinSinov.css";

const FANLAR = ["Atrof-muhit", "Matematika", "Mantiq", "Ingliz tili", "Rus tili", "Arab tili", "Fransuz tili", "Ispan tili", "Koreys tili", "Nemis tili", "Turk tili", "Xitoy tili", "Yapon tili"];
const IZOH = { uz: "", ru: " (izoh: rus)", en: " (izoh: ingliz)", de: " (izoh: nemis)", es: " (izoh: ispan)" };
const TUR_BELGI = { kirish: "🎁 Kirish", tushuncha: "💡 Tushuncha", qoida: "💡 Tushuncha", topshiriq: "🎮 Topshiriq", amaliy: "🎮 Topshiriq", test: "📝 Test", xulosa: "🌟 Xulosa" };
const rasm = oyinRasmTop;   // REV368
const oyinNomi = (id) => OYINLAR.find((o) => o.id === Number(id))?.nom || "";

export default function DarsMuharrir({ apiBase = "", token = "" }) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const [sinf, setSinf] = useState("2-3 yosh");
  const [fan, setFan] = useState("Atrof-muhit");
  const [izoh, setIzoh] = useState("uz");
  const [darslar, setDarslar] = useState(null);
  const [tanlangan, setTanlangan] = useState(null);
  const [qadamlar, setQadamlar] = useState([]);
  const [tahrir, setTahrir] = useState({});
  const [xabar, setXabar] = useState("");
  const [sinov, setSinov] = useState(null);
  const fanTo = `${fan}${IZOH[izoh]}`;
  const q = (o) => new URLSearchParams({ token, ...o });
  useEffect(() => {
    setDarslar(null); setTanlangan(null);
    fetch(`${base}/api/admin/dars_tahrir/darslar?${q({ sinf, fan: fanTo })}`).then((r) => r.json()).then((d) => setDarslar(d.darslar || [])).catch(() => setDarslar([]));
  }, [sinf, fanTo]); // eslint-disable-line react-hooks/exhaustive-deps
  const och = (d) => {
    setTanlangan(d); setTahrir({}); setXabar("");
    fetch(`${base}/api/admin/dars_tahrir/dars?${q({ topic_code: d.topic_code })}`).then((r) => r.json()).then((x) => setQadamlar(x.qadamlar || [])).catch(() => setQadamlar([]));
  };
  const ozgart = (id, k, v) => setTahrir((t) => ({ ...t, [id]: { ...(t[id] || {}), [k]: v } }));
  const saqla = async (qd) => {
    const m = tahrir[qd.id]; if (!m) return;
    const r = await fetch(`${base}/api/admin/dars_tahrir/saqla`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, unit_id: qd.id, maydonlar: m }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setXabar(`⚠️ ${d.detail || r.status}`); return; }
    setQadamlar((qs) => qs.map((x) => (x.id === qd.id ? { ...x, maydonlar: { ...x.maydonlar, ...m } } : x)));
    setTahrir((t) => { const n = { ...t }; delete n[qd.id]; return n; });
    setXabar(`✅ ${__kbUi("Saqlandi")}: ${qd.kod} (${d.ozgardi})`);
  };
  // darsdagi qadamlar o'yin dvigateli kutgan ko'rinishda (sinash uchun)
  const darsQadam = useMemo(() => qadamlar.filter((x) => x.tur === "lesson_step").map((x) => ({ turi: ["topshiriq", "amaliy"].includes(x.qadam_turi) ? "amaliy" : x.qadam_turi,
    oyin: Number({ ...x.maydonlar, ...(tahrir[x.id] || {}) }.oyin) || undefined, doska: { ...x.maydonlar, ...(tahrir[x.id] || {}) }.doska_matni,
    ovoz: { ...x.maydonlar, ...(tahrir[x.id] || {}) }.ovoz_matni, variantlar: { ...x.maydonlar, ...(tahrir[x.id] || {}) }.variantlar })), [qadamlar, tahrir]);
  const sina = (i) => {
    const st = darsQadam[i]; const y = yoshGuruh(sinf);
    const o = st?.oyin ? qadamOyini(st, { yosh: y, darsElementlari: darsElementlari(darsQadam) }) : null;
    if (!o) { setXabar(`⚠️ ${__kbUi("Bu qadamda o‘yin ochilmadi: raqam noto‘g‘ri yoki rasmli so‘z yetmaydi")}`); return; }
    setSinov({ ...o, yosh: y, k: Date.now() });
  };

  return <section className="os-root">
    <header className="os-bosh">
      <h1>📝 {__kbUi("Bog‘cha darslari muharriri")}</h1>
      <p>{__kbUi("Darsni tanlang: har qadamda kim gapiradi, doskada nima chiqadi va qaysi o‘yin o‘ynalishi ko‘rinadi. O‘zgartiring, saqlang, o‘yinni darhol sinab ko‘ring. Hamma o‘zgarishlar Excel'ga eksport qilinadi.")}</p>
      <div className="os-tanlov">
        <label>{__kbUi("Yosh")}: {["2-3 yosh", "4-5 yosh", "6-7 yosh"].map((y) => <button key={y} type="button" className={y === sinf ? "is-on" : ""} onClick={() => setSinf(y)}>{y}</button>)}</label>
        <label>{__kbUi("Izoh tili")}: {Object.keys(IZOH).map((t) => <button key={t} type="button" className={t === izoh ? "is-on" : ""} onClick={() => setIzoh(t)}>{t}</button>)}</label>
        <label>{__kbUi("Fan")}: <select value={fan} onChange={(e) => setFan(e.target.value)}>{FANLAR.map((f) => <option key={f}>{f}</option>)}</select></label>
        <a className="os-eksport" href={`${base}/api/admin/dars_tahrir/eksport?${q({ sinf, fan: fanTo })}`}>📥 {__kbUi("O‘zgarishlar (Excel)")}</a>
        <a className="os-eksport" href={`${base}/api/admin/dars_tahrir/eksport?${q({})}`}>📥 {__kbUi("Hamma o‘zgarishlar")}</a>
      </div>
    </header>
    <div className="dm-tor">
      <ul className="dm-darslar">{darslar === null ? <li>…</li> : !darslar.length ? <li>{__kbUi("Dars topilmadi")}</li> : darslar.map((d) =>
        <li key={d.topic_code}><button type="button" className={tanlangan?.topic_code === d.topic_code ? "is-on" : ""} onClick={() => och(d)}>
          {d.mavzu} <small>{d.qadamlar}{d.tahrirlar ? ` · ✏️${d.tahrirlar}` : ""}</small></button></li>)}</ul>
      <div className="dm-dars">{!tanlangan ? <p>{__kbUi("Chapdan darsni tanlang.")}</p> : <>
        <h2>{tanlangan.mavzu}</h2>
        {xabar && <p className="dm-xabar">{xabar}</p>}
        <table className="dm-jadval"><thead><tr><th>№</th><th>{__kbUi("Qadam")}</th><th>{__kbUi("Ustoz gapi / savol")}</th><th>{__kbUi("Doska / variantlar")}</th><th>{__kbUi("O‘yin")}</th><th /></tr></thead>
          <tbody>{qadamlar.map((x, i) => { const m = { ...x.maydonlar, ...(tahrir[x.id] || {}) }; const qadamMi = x.tur === "lesson_step";
            const li = qadamMi ? darsQadam.findIndex((_, j) => qadamlar.filter((y) => y.tur === "lesson_step")[j]?.id === x.id) : -1;
            return <tr key={x.id} className={tahrir[x.id] ? "is-ozgargan" : ""}>
              <td>{i + 1}</td>
              <td><b>{TUR_BELGI[x.qadam_turi] || x.qadam_turi}</b><br /><small>{x.kod}</small>{qadamMi && m.oquvchi_savoli ? <><br /><small>👧 {__kbUi("o‘quvchi aytadi")}</small></> : null}</td>
              <td><textarea value={qadamMi ? m.ovoz_matni : m.savol} onChange={(e) => ozgart(x.id, qadamMi ? "ovoz_matni" : "savol", e.target.value)} rows={3} />
                <small>{qadamMi ? `🧑‍🏫 ${__kbUi("ustoz aytadi")}` : `📝 ${__kbUi("test savoli")}`}</small></td>
              <td>{qadamMi ? <textarea value={m.doska_matni} onChange={(e) => ozgart(x.id, "doska_matni", e.target.value)} rows={3} />
                : ["variant_a", "variant_b", "variant_c", "variant_d"].map((k) => <input key={k} value={m[k] || ""} placeholder={k.slice(-1).toUpperCase()} onChange={(e) => ozgart(x.id, k, e.target.value)} />)}
                {!qadamMi && <input value={m.togri_javob || ""} placeholder={__kbUi("To‘g‘ri javob")} onChange={(e) => ozgart(x.id, "togri_javob", e.target.value)} />}</td>
              <td>{qadamMi && ["topshiriq", "amaliy"].includes(x.qadam_turi) ? <><input className="dm-raqam" value={m.oyin || ""} onChange={(e) => ozgart(x.id, "oyin", e.target.value.replace(/\D/g, ""))} />
                <small>{oyinNomi(m.oyin) || "—"}</small>{m.oyin ? <button type="button" onClick={() => sina(li)}>▶ {__kbUi("Sinash")}</button> : null}</> : null}</td>
              <td>{tahrir[x.id] && <button type="button" className="dm-saqla" onClick={() => saqla(x)}>💾</button>}</td>
            </tr>; })}</tbody></table>
      </>}</div>
    </div>
    {sinov && <div className="os-oyna" role="dialog" aria-modal="true" onClick={() => { kabuJimm(); setSinov(null); }}>
      <div className="os-sahna" onClick={(e) => e.stopPropagation()}>
        <div className="os-sahna-bosh"><b>{oyinNomi(sinov.id)}</b> · {sinov.yosh}<button type="button" onClick={() => { kabuJimm(); setSinov(null); }}>✕</button></div>
        <div className="os-oyin"><Oyin key={sinov.k} id={sinov.id} elementlar={sinov.elementlar} sonlar={sinov.sonlar} yosh={sinov.yosh} til="uz" izoh={izoh} rasm={rasm}
          onSay={(t, d) => kabuAyt(base, t, { izoh, tugadi: d })} onNatija={() => {}} /></div>
      </div>
    </div>}
  </section>;
}
