import React, { useEffect, useMemo, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import XbSavol from "./XbSavol.jsx";
import XbDoska, { XbUstoz } from "./XbDoska.jsx";
import { useUstozOvoz, xbFetch } from "./xbOvoz.js";

const MAQTOV = ["Barakalla! To‘g‘ri.", "Zo‘r! Aynan shunday.", "To‘g‘ri! Xalqaro darajadagi javob.", "Ajoyib, davom eting!"];

/**
 * Mashq / takrorlash: savol → javob (yozib yoki aytib) → server tekshiradi → ustoz izohlaydi.
 * Noto‘g‘ri bo‘lsa: nega xato (tanlangan variant bo‘yicha), ishora, keyin doskada yechim harfma-harf.
 * Ovoz bilan javob berilsa — ustoz uni yozdirib tasdiqlatadi (aytib + yozib).
 */
export default function XbMashq({ apiBase, token, jins = "qiz", ustoz = "sardor", manba, sarlavha = "Mashq", onYopish, onTugadi }) {
  const ovoz = useUstozOvoz(apiBase, jins);
  const [savollar, setSavollar] = useState(null);
  const [xato, setXato] = useState("");
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState("");
  const [usul, setUsul] = useState("yozib");
  const [holat, setHolat] = useState(null);       // {ok, togri}
  const [yechim, setYechim] = useState(false);
  const [tasdiq, setTasdiq] = useState("");        // aytilgan javobni yozib tasdiqlash
  const [hisob, setHisob] = useState({ togri: 0, jami: 0 });
  const takror = manba?.tur === "takror";

  useEffect(() => {
    let tirik = true;
    const path = takror ? "/api/xalqaro/takror" : "/api/xalqaro/mashq";
    const params = takror ? { soni: 15 } : { mavzu: manba?.mavzu || "", toplam: manba?.toplam || "", soni: manba?.soni || 8, fikrlash: manba?.fikrlash || "" };
    xbFetch(apiBase, path, token, { params }).then((d) => { if (tirik) setSavollar(d.savollar || []); }).catch((e) => tirik && setXato(e.message));
    return () => { tirik = false; ovoz.hush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = savollar?.[i];
  useEffect(() => { setJavob(""); setHolat(null); setYechim(false); setTasdiq(""); setUsul("yozib"); }, [i]);

  const tekshir = async (j = javob, u = usul) => {
    if (!s || !String(j).trim()) return;
    try {
      const r = await xbFetch(apiBase, "/api/xalqaro/javob", token, { method: "POST", body: { savol_id: s.savol_id, v: s.v, javob: String(j), usul: u, takror } });
      const togriIdx = s.turi === "tanlov" ? s.togri : null;
      setHolat({ ok: r.togri, togri: togriIdx });
      setHisob((h) => ({ togri: h.togri + (r.togri ? 1 : 0), jami: h.jami + 1 }));
      if (r.togri) ovoz.say(`${MAQTOV[(i + hisob.jami) % MAQTOV.length]} ${u === "aytib" ? "Endi shu javobni yozib qo‘ying." : ""}`);
      else {
        const idx = s.turi === "tanlov" ? "ABCD".indexOf(String(j).toUpperCase()) : -1;
        const sabab = idx >= 0 ? s.xatolar?.[String(idx)] : s.xatolar?.umumiy;
        ovoz.say(`Afsus, bu xato. ${sabab || ""} ${s.maslahat ? `Ishora: ${s.maslahat}` : ""}`);
      }
    } catch (e) { setXato(e.message); }
  };
  const javobBerildi = (j, u) => {
    setJavob(j); setUsul(u);
    if (u === "aytib" || s?.turi === "tanlov") setTimeout(() => tekshir(j, u), 0);
  };

  const keyingi = () => {
    ovoz.hush();
    if (i + 1 >= (savollar?.length || 0)) { onTugadi?.(hisob); setI(savollar.length); return; }
    setI(i + 1);
  };
  const tasdiqOk = useMemo(() => {
    if (!holat?.ok || usul !== "aytib" || s?.turi === "tanlov") return true;
    const n = (x) => String(x).replace(/\s+/g, "").replace(",", ".").toLowerCase();
    return n(tasdiq) && n(tasdiq) === n(javob);
  }, [holat, usul, s, tasdiq, javob]);

  if (xato) return <div className="xb-panel"><p className="xb-xato">{T(xato)}</p><button type="button" className="xb-btn" onClick={onYopish}>{T("← Orqaga")}</button></div>;
  if (!savollar) return <div className="xb-panel"><p className="xb-muted">⏳ {T("Savollar tayyorlanmoqda…")}</p></div>;
  if (!savollar.length) return <div className="xb-panel">
    <XbUstoz ustoz={ustoz} />
    <p>{takror ? T("Bugun takrorlanadigan savol yo‘q. Barakalla! Yangi mavzuni o‘rganing yoki imtihon topshiring.") : T("Bu bo‘limda hozircha savol yo‘q.")}</p>
    <button type="button" className="xb-btn" onClick={onYopish}>{T("← Orqaga")}</button></div>;
  if (i >= savollar.length) {
    const f = Math.round((100 * hisob.togri) / Math.max(1, hisob.jami));
    return <div className="xb-panel xb-yakun">
      <XbUstoz ustoz={ustoz} mood={f >= 70 ? "happy" : ""} />
      <h3>{f >= 80 ? "🌟" : f >= 50 ? "👍" : "💪"} {hisob.togri} / {hisob.jami} · {f}%</h3>
      <p>{f >= 80 ? T("A’lo! Bu mavzuda xalqaro darajaga yaqinsiz.") : f >= 50 ? T("Yaxshi, lekin xatolaringiz takrorlash navbatiga qo‘shildi — ertaga yana so‘rayman.") : T("Bu mavzuni yana bir bor darsdan ko‘rib chiqing. Xatolar takrorlash navbatida.")}</p>
      <button type="button" className="xb-btn" onClick={onYopish}>{T("Tayyor")}</button>
    </div>;
  }
  return <div className="xb-panel xb-mashq">
    <div className="xb-mashq-bosh">
      <button type="button" className="xb-btn xb-btn-yengil" onClick={() => { ovoz.hush(); onYopish?.(); }}>✕</button>
      <b>{T(sarlavha)}</b>
      <span className="xb-progress"><i style={{ width: `${Math.round((100 * i) / savollar.length)}%` }} /></span>
      <small>{i + 1}/{savollar.length} · ✅ {hisob.togri}</small>
    </div>
    {takror && s.quti && <p className="xb-muted">🔁 {T("Takrorlash")} · {s.quti}-{T("bosqich")} {T("(5-bosqichdan keyin savol navbatdan chiqadi)")}</p>}
    <XbSavol savol={s} javob={javob} onJavob={holat === null ? javobBerildi : null} holat={holat} ovoz={ovoz} raqam={i + 1} />
    {holat === null && s.turi !== "tanlov" && <button type="button" className="xb-btn xb-btn-asosiy" disabled={!javob.trim()} onClick={() => tekshir()}>{T("Tekshirish")}</button>}
    {holat && <div className={`xb-javob-izoh ${holat.ok ? "is-ok" : "is-no"}`} role="status">
      <b>{holat.ok ? `✅ ${T("To‘g‘ri!")}` : `❌ ${T("Noto‘g‘ri")}`}</b>
      {!holat.ok && s.turi === "tanlov" && <p>{T("To‘g‘ri javob")}: <b>{"ABCD"[s.togri]}</b>. {s.xatolar?.[String("ABCD".indexOf(String(javob).toUpperCase()))] || ""}</p>}
      {!holat.ok && s.turi !== "tanlov" && <p>{T("To‘g‘ri javob")}: <b>{String(s.javob || "").split("|")[0]}</b>. {s.xatolar?.umumiy || ""}</p>}
      {s.kunikma && <p className="xb-muted">🎯 {T("Bu savol tekshiradi")}: {s.kunikma}</p>}
      {s.usul && <p className="xb-muted">🧭 {T("Yechish yo‘li")}: {s.usul}</p>}
      {holat.ok && usul === "aytib" && s.turi !== "tanlov" && <label className="xb-tasdiq">✍️ {T("Ustoz: aytgan javobingizni endi yozib qo‘ying")}
        <input value={tasdiq} onChange={(e) => setTasdiq(e.target.value)} inputMode="decimal" maxLength={60} className={tasdiqOk ? "is-togri" : ""} /></label>}
    </div>}
    {holat && (yechim
      ? <XbDoska qadamlar={s.yechim} ovoz={ovoz} ustoz={ustoz} sarlavha={T("Yechim")} />
      : <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setYechim(true); }}>🧑‍🏫 {T("Ustoz doskada yechib bersin")}</button>)}
    {holat && <button type="button" className="xb-btn xb-btn-asosiy" disabled={!tasdiqOk} onClick={keyingi}>{i + 1 >= savollar.length ? T("Yakunlash") : T("Keyingi savol →")}</button>}
  </div>;
}
