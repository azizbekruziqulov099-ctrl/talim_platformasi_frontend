// REV401: o'qituvchi sinfga topshiriq beradi: mavzu (yoki aralash), savollar soni, muddat → havola.
// Hamma o'quvchi bir xil savollarni yechadi; natijalar (eng yaxshisi, urinishlar) shu yerda ko'rinadi.
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";

const HOLAT = { yechmoqda: ["🟢", "Yechmoqda"], chiqdi: ["🟠", "Ilovadan chiqdi"], tugatdi: ["✅", "Tugatdi"], boshlamagan: ["⚪", "Boshlamagan"] };
const oldinMatn = (s) => (s == null ? "—" : s < 60 ? `${s} s oldin` : s < 3600 ? `${Math.round(s / 60)} daq oldin` : `${Math.round(s / 3600)} soat oldin`);

/** REV404: topshiriqni jonli kuzatish — har 3 soniyada: kim yechmoqda, qaysi savolda, nechtasini belgiladi, ilovadan chiqdimi. */
function JonliKuzatuv({ apiBase, token, sinfId, t, til }) {
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  useEffect(() => {
    let tirik = true;
    const ol = () => xbFetch(apiBase, `/api/xalqaro/sinflar/${sinfId}/topshiriq/${t.id}/jonli`, token, { params: { til } }).then((r) => tirik && setD(r)).catch((e) => tirik && setXato(e.message));
    ol(); const tm = setInterval(() => { if (document.visibilityState === "visible") ol(); }, 3000);
    return () => { tirik = false; clearInterval(tm); };
  }, [t.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (xato) return <p className="xb-xato">{T(xato)}</p>;
  if (!d) return <p className="xb-muted">⏳</p>;
  return <div className="xb-jonli-kuz">
    <p className="xb-jonli"><span className="xb-jonli-nuqta" aria-hidden="true" /> {T("Jonli: har 3 soniyada yangilanadi")} ·
      {" "}🟢 {d.soni.yechmoqda} · 🟠 {d.soni.chiqdi} · ✅ {d.soni.tugatdi} · ⚪ {d.soni.boshlamagan}</p>
    <div className="xb-jadval-wrap"><table className="xb-jadval"><thead><tr><th>{T("O‘quvchi")}</th><th>{T("Holat")}</th><th>{T("Qaysi savolda")}</th><th>{T("Belgiladi")}</th><th>{T("To‘g‘ri")}</th><th>{T("Oxirgi faollik")}</th><th>{T("Natija")}</th></tr></thead>
      <tbody>{d.oquvchilar.map((o) => { const [b, n] = HOLAT[o.holat] || HOLAT.boshlamagan;
        return <tr key={o.user_id} className={`is-${o.holat}`}><td><b>{o.ism}</b></td><td>{b} {T(n)}</td>
          <td>{o.holat === "boshlamagan" ? "—" : <span className="xb-jonli-q">{o.joriy}/{o.jami}<span className="xb-chiziq"><i style={{ width: `${Math.round((100 * o.joriy) / Math.max(1, o.jami))}%`, background: o.holat === "chiqdi" ? "#c77d00" : "#1b6fd8" }} /></span></span>}</td>
          <td>{o.javob || "—"}</td><td>{o.holat === "boshlamagan" ? "—" : o.togri}</td>
          <td className="xb-kichik">{o.holat === "boshlamagan" ? "—" : T(oldinMatn(o.oldin))}</td>
          <td>{o.natija != null ? <b>{o.natija}/{o.jami} · {Math.round((100 * o.natija) / Math.max(1, o.jami))}%</b> : "—"}</td></tr>; })}</tbody></table></div>
  </div>;
}

const havola = (kod) => `${window.location.origin}/?xb_topshiriq=${encodeURIComponent(kod)}`;

export default function XbTopshiriqlar({ apiBase, token, sinf, mavzular = [], til }) {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ nom: "", mavzu: "", soni: 10, muddat: "" });
  const [ochiq, setOchiq] = useState(false);
  const [xabar, setXabar] = useState("");
  const [xato, setXato] = useState("");
  const [korish, setKorish] = useState(null);
  const [sinflar, setSinflar] = useState([]);   // REV408: o'qituvchining hamma sinflari — topshiriq qaysi biriga
  const [manzil, setManzil] = useState(sinf.id);
  useEffect(() => { xbFetch(apiBase, "/api/xalqaro/sinflar", token).then((r) => setSinflar(r.meniki || [])).catch(() => {}); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tanlangan = sinflar.find((x) => x.id === Number(manzil)) || sinf;
  const [jonli, setJonli] = useState(null);   // REV404
  const yukla = () => xbFetch(apiBase, `/api/xalqaro/sinflar/${sinf.id}/topshiriqlar`, token, { params: { til } }).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); const t = setInterval(() => { if (document.visibilityState === "visible") yukla(); }, 20000); return () => clearInterval(t); }, [sinf.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const yarat = () => { setXato("");
    xbFetch(apiBase, `/api/xalqaro/sinflar/${Number(manzil) || sinf.id}/topshiriq`, token, { method: "POST", body: { ...f, soni: Number(f.soni), muddat: f.muddat || null, til } })
      .then((r) => { setOchiq(false); setF({ nom: "", mavzu: "", soni: 10, muddat: "" }); nusxa(r.kod);
        if (Number(manzil) !== sinf.id) setXabar(tf("Topshiriq «{n}» sinfiga berildi — havola nusxalandi. U o‘sha sinf sahifasida ko‘rinadi.", { n: tanlangan?.nom || "" })); yukla(); }).catch((e) => setXato(e.message)); };
  const nusxa = async (kod) => { try { await navigator.clipboard.writeText(havola(kod)); setXabar(T("Havola nusxalandi — o‘quvchilarga yuboring.")); } catch { setXabar(havola(kod)); } };
  return <div className="xb-topshiriqlar">
    <div className="xb-sinf-bosh"><h4>📝 {T("Topshiriqlar")} <small className="xb-muted">· {sinf.nom}</small></h4>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setOchiq((x) => !x)}>➕ {T("Topshiriq berish")}</button></div>
    {xabar && <p className="xb-ok" role="status">{xabar}</p>}
    {xato && <p className="xb-xato" role="alert">{T(xato)}</p>}
    {ochiq && <div className="xb-sinf-forma">
      <label>📌 {T("Qaysi sinf yoki guruh uchun")}: <select value={manzil} onChange={(e) => setManzil(Number(e.target.value))}>
        {(sinflar.length ? sinflar : [sinf]).map((x) => <option key={x.id} value={x.id}>{x.nom}{x.azolar != null ? ` — ${x.azolar} ${T("a’zo")}` : ""}</option>)}</select></label>
      {tanlangan?.azolar === 0 && <p className="xb-xato">⚠️ {T("Bu sinfda hali o‘quvchi yo‘q. Topshiriqni o‘quvchilar a’zo bo‘lgan sinfga bering yoki avval ularni shu sinfga qo‘shing.")}</p>}
      <label>{T("Nomi")}: <input value={f.nom} maxLength={80} placeholder={T("masalan: 1-chorak nazorati")} onChange={(e) => setF({ ...f, nom: e.target.value })} /></label>
      <label>{T("Mavzu")}: <select value={f.mavzu} onChange={(e) => setF({ ...f, mavzu: e.target.value })}>
        <option value="">{T("Aralash — sinf fanining hamma mavzularidan")}</option>
        {mavzular.map((m) => <option key={m.kalit} value={m.kalit}>{m.nom}</option>)}</select></label>
      <label>{T("Savollar soni")}: <select value={f.soni} onChange={(e) => setF({ ...f, soni: e.target.value })}>{[5, 8, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
      <label>{T("Muddat (ixtiyoriy)")}: <input type="date" value={f.muddat} onChange={(e) => setF({ ...f, muddat: e.target.value })} /></label>
      <p className="xb-muted xb-kichik">{T("Savollar bir marta tanlanadi — hamma o‘quvchida bir xil. Osondan qiyinga tartiblanadi.")}</p>
      <p className="xb-muted xb-kichik">{T("Havola bilan kelgan o‘quvchi (sinf parolsiz bo‘lsa) shu sinfga o‘zi qo‘shiladi va topshiriqni darhol ochadi.")}</p>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={yarat}>✅ {tf("«{n}» uchun yaratish va havolani olish", { n: tanlangan?.nom || sinf.nom || "" })}</button>
    </div>}
    {!d ? <p className="xb-muted">⏳</p> : !d.topshiriqlar.length ? <p className="xb-muted">{T("Hali topshiriq berilmagan.")}</p>
      : <div className="xb-tp-royxat">{d.topshiriqlar.map((t) => <div key={t.id} className="xb-tp">
        <div className="xb-tp-raqam">📝</div>
        <div className="xb-tp-matn"><b>{t.nom}</b>
          <small>{tf("{n} ta savol", { n: t.soni })}{t.muddat ? ` · ⏰ ${t.muddat}` : ""} · {tf("{a}/{b} o‘quvchi topshirdi", { a: t.topshirdi, b: t.azolar })}{t.ortacha != null ? ` · ${tf("o‘rtacha {f}%", { f: t.ortacha })}` : ""}</small>
          <span className="xb-chiziq"><i style={{ width: `${Math.round((100 * t.topshirdi) / Math.max(1, t.azolar))}%`, background: "#1f8a4c" }} /></span></div>
        <div className="xb-tp-tug">
          <button type="button" className={`xb-btn ${jonli === t.id ? "xb-btn-asosiy" : ""}`} onClick={() => setJonli(jonli === t.id ? null : t.id)}>🔴 {T("Jonli kuzatish")}</button>
          <button type="button" className="xb-btn" onClick={() => nusxa(t.kod)}>🔗 {T("Havola")}</button>
          <button type="button" className="xb-btn xb-btn-yengil" onClick={() => setKorish(korish === t.id ? null : t.id)}>{korish === t.id ? "▲" : `📊 ${T("Natijalar")}`}</button>
        </div>
        {jonli === t.id && <div className="xb-tp-natijalar"><JonliKuzatuv apiBase={apiBase} token={token} sinfId={sinf.id} t={t} til={til} /></div>}
        {korish === t.id && <div className="xb-tp-natijalar">{t.natijalar.length ? <table className="xb-jadval"><thead><tr><th>{T("O‘quvchi")}</th><th>{T("Eng yaxshi")}</th><th>%</th><th>{T("Urinish")}</th><th>{T("Oxirgi")}</th></tr></thead>
          <tbody>{t.natijalar.map((n) => <tr key={n.user_id}><td>{n.ism}</td><td>{n.eng_yaxshi}/{n.jami}</td><td><b style={{ color: n.foiz >= 70 ? "#1f8a4c" : n.foiz >= 40 ? "#1b6fd8" : "#c77d00" }}>{n.foiz}%</b></td><td>{n.urinish}</td><td>{new Date(n.vaqt).toLocaleString().slice(0, 17)}</td></tr>)}</tbody></table>
          : <p className="xb-muted">{T("Hali hech kim topshirmagan.")}</p>}</div>}
      </div>)}</div>}
  </div>;
}
