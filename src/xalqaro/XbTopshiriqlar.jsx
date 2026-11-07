// REV401: o'qituvchi sinfga topshiriq beradi: mavzu (yoki aralash), savollar soni, muddat → havola.
// Hamma o'quvchi bir xil savollarni yechadi; natijalar (eng yaxshisi, urinishlar) shu yerda ko'rinadi.
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";

const havola = (kod) => `${window.location.origin}/?xb_topshiriq=${encodeURIComponent(kod)}`;

export default function XbTopshiriqlar({ apiBase, token, sinf, mavzular = [], til }) {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ nom: "", mavzu: "", soni: 10, muddat: "" });
  const [ochiq, setOchiq] = useState(false);
  const [xabar, setXabar] = useState("");
  const [xato, setXato] = useState("");
  const [korish, setKorish] = useState(null);
  const yukla = () => xbFetch(apiBase, `/api/xalqaro/sinflar/${sinf.id}/topshiriqlar`, token, { params: { til } }).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); const t = setInterval(() => { if (document.visibilityState === "visible") yukla(); }, 20000); return () => clearInterval(t); }, [sinf.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const yarat = () => { setXato("");
    xbFetch(apiBase, `/api/xalqaro/sinflar/${sinf.id}/topshiriq`, token, { method: "POST", body: { ...f, soni: Number(f.soni), muddat: f.muddat || null, til } })
      .then((r) => { setOchiq(false); setF({ nom: "", mavzu: "", soni: 10, muddat: "" }); nusxa(r.kod); yukla(); }).catch((e) => setXato(e.message)); };
  const nusxa = async (kod) => { try { await navigator.clipboard.writeText(havola(kod)); setXabar(T("Havola nusxalandi — o‘quvchilarga yuboring.")); } catch { setXabar(havola(kod)); } };
  return <div className="xb-topshiriqlar">
    <div className="xb-sinf-bosh"><h4>📝 {T("Topshiriqlar")}</h4>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setOchiq((x) => !x)}>➕ {T("Topshiriq berish")}</button></div>
    {xabar && <p className="xb-ok" role="status">{xabar}</p>}
    {xato && <p className="xb-xato" role="alert">{T(xato)}</p>}
    {ochiq && <div className="xb-sinf-forma">
      <label>{T("Nomi")}: <input value={f.nom} maxLength={80} placeholder={T("masalan: 1-chorak nazorati")} onChange={(e) => setF({ ...f, nom: e.target.value })} /></label>
      <label>{T("Mavzu")}: <select value={f.mavzu} onChange={(e) => setF({ ...f, mavzu: e.target.value })}>
        <option value="">{T("Aralash — sinf fanining hamma mavzularidan")}</option>
        {mavzular.map((m) => <option key={m.kalit} value={m.kalit}>{m.nom}</option>)}</select></label>
      <label>{T("Savollar soni")}: <select value={f.soni} onChange={(e) => setF({ ...f, soni: e.target.value })}>{[5, 8, 10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
      <label>{T("Muddat (ixtiyoriy)")}: <input type="date" value={f.muddat} onChange={(e) => setF({ ...f, muddat: e.target.value })} /></label>
      <p className="xb-muted xb-kichik">{T("Savollar bir marta tanlanadi — hamma o‘quvchida bir xil. Osondan qiyinga tartiblanadi.")}</p>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={yarat}>✅ {T("Yaratish va havolani olish")}</button>
    </div>}
    {!d ? <p className="xb-muted">⏳</p> : !d.topshiriqlar.length ? <p className="xb-muted">{T("Hali topshiriq berilmagan.")}</p>
      : <div className="xb-tp-royxat">{d.topshiriqlar.map((t) => <div key={t.id} className="xb-tp">
        <div className="xb-tp-raqam">📝</div>
        <div className="xb-tp-matn"><b>{t.nom}</b>
          <small>{tf("{n} ta savol", { n: t.soni })}{t.muddat ? ` · ⏰ ${t.muddat}` : ""} · {tf("{a}/{b} o‘quvchi topshirdi", { a: t.topshirdi, b: t.azolar })}{t.ortacha != null ? ` · ${tf("o‘rtacha {f}%", { f: t.ortacha })}` : ""}</small>
          <span className="xb-chiziq"><i style={{ width: `${Math.round((100 * t.topshirdi) / Math.max(1, t.azolar))}%`, background: "#1f8a4c" }} /></span></div>
        <div className="xb-tp-tug">
          <button type="button" className="xb-btn" onClick={() => nusxa(t.kod)}>🔗 {T("Havola")}</button>
          <button type="button" className="xb-btn xb-btn-yengil" onClick={() => setKorish(korish === t.id ? null : t.id)}>{korish === t.id ? "▲" : `📊 ${T("Natijalar")}`}</button>
        </div>
        {korish === t.id && <div className="xb-tp-natijalar">{t.natijalar.length ? <table className="xb-jadval"><thead><tr><th>{T("O‘quvchi")}</th><th>{T("Eng yaxshi")}</th><th>%</th><th>{T("Urinish")}</th><th>{T("Oxirgi")}</th></tr></thead>
          <tbody>{t.natijalar.map((n) => <tr key={n.user_id}><td>{n.ism}</td><td>{n.eng_yaxshi}/{n.jami}</td><td><b style={{ color: n.foiz >= 70 ? "#1f8a4c" : n.foiz >= 40 ? "#1b6fd8" : "#c77d00" }}>{n.foiz}%</b></td><td>{n.urinish}</td><td>{new Date(n.vaqt).toLocaleString().slice(0, 17)}</td></tr>)}</tbody></table>
          : <p className="xb-muted">{T("Hali hech kim topshirmagan.")}</p>}</div>}
      </div>)}</div>}
  </div>;
}
