// REV411: kurs guruhi. O'qituvchi kurs sahifasida guruh ochadi, havolani yuboradi va «Bugungi mashg'ulot»ni tanlaydi;
// talaba havola bilan qo'shiladi va bitta bosishda o'sha darsga tushadi; o'qituvchi har 3 soniyada kim nechta
// masala va test yechganini, ilovada ekanini ko'radi.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

export const GURUH_KALIT = "kabutar:kurs_guruh";
const HOLAT = { yechmoqda: ["🟢", "Yechmoqda"], chiqdi: ["🟠", "Ilovadan chiqdi"], tugatdi: ["✅", "Tugatdi"], boshlamagan: ["⚪", "Boshlamagan"] };

export function kgFetch(apiBase, yol, token, { method = "GET", body, params } = {}) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  const q = new URLSearchParams({ ...(params || {}), ...(method === "GET" || method === "DELETE" ? { token } : {}) });
  return fetch(`${base}${yol}${q.toString() ? `?${q}` : ""}`, {
    method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify({ ...body, token }) : undefined,
  }).then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Xato ${r.status}`); return d; });
}

const oldinMatn = (s) => (s == null ? "—" : s < 60 ? `${s} s oldin` : s < 3600 ? `${Math.round(s / 60)} daq oldin` : `${Math.round(s / 3600)} soat oldin`);

function Jonli({ apiBase, token, g, jami }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let tirik = true;
    const ol = () => kgFetch(apiBase, `/api/kurs_guruh/${g.id}/jonli`, token, { params: { topic_code: g.bugungi, jami } }).then((r) => tirik && setD(r)).catch(() => {});
    ol(); const t = setInterval(() => { if (document.visibilityState === "visible") ol(); }, 3000);
    return () => { tirik = false; clearInterval(t); };
  }, [g.id, g.bugungi, jami]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="kk-p">⏳</p>;
  if (!d.oquvchilar.length) return <p className="kk-p">{__kbUi("Guruhda hali talaba yo‘q — havolani yuboring.")}</p>;
  return <div className="kg-jonli">
    <p className="kg-jonli-bosh"><span className="kg-nuqta" aria-hidden="true" /> {__kbUi("Jonli: har 3 soniyada yangilanadi")} · 🟢 {d.soni.yechmoqda} · 🟠 {d.soni.chiqdi} · ✅ {d.soni.tugatdi} · ⚪ {d.soni.boshlamagan}</p>
    <div className="kg-jadval-o"><table className="kg-jadval"><thead><tr><th>{__kbUi("Talaba")}</th><th>{__kbUi("Holat")}</th><th>{__kbUi("Yechgan")}</th><th>{__kbUi("To‘g‘ri")}</th><th>{__kbUi("Test")}</th><th>{__kbUi("Oxirgi faollik")}</th></tr></thead>
      <tbody>{d.oquvchilar.map((o) => { const [b, n] = HOLAT[o.holat] || HOLAT.boshlamagan; const f = o.yechgan ? Math.round((100 * o.togri) / o.yechgan) : null;
        return <tr key={o.user_id} className={`is-${o.holat}`}><td><b>{o.ism || "—"}</b></td><td>{b} {__kbUi(n)}</td>
          <td><span className="kg-q">{o.yechgan}{jami ? `/${jami}` : ""}<span className="kg-chiziq"><i style={{ width: `${jami ? Math.min(100, Math.round((100 * o.yechgan) / jami)) : 0}%` }} /></span></span></td>
          <td>{o.yechgan ? <b style={{ color: f >= 70 ? "#1f8a4c" : f >= 40 ? "#1b6fd8" : "#c77d00" }}>{o.togri} · {f}%</b> : "—"}</td>
          <td>{o.test ? `${o.test_togri}/${o.test}` : "—"}</td><td className="kg-kichik">{o.holat === "boshlamagan" ? "—" : __kbUi(oldinMatn(o.oldin))}</td></tr>; })}</tbody></table></div>
  </div>;
}

/** REV483: o'qituvchi — guruh o'quvchilarining nazorat natijalari, halollik belgilari va kamera rasmlari */
function Nazoratlar({ apiBase, token, g }) {
  const [d, setD] = useState(null);
  useEffect(() => { kgFetch(apiBase, `/api/kurs_guruh/${g.id}/nazoratlar`, token).then(setD).catch(() => setD({ natijalar: [] })); }, [g.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <p className="kk-p">⏳</p>;
  if (!d.natijalar.length) return <p className="kk-p">{__kbUi("Hali nazorat topshirilmagan.")}</p>;
  const belgi = (h) => [h.yashirildi > 0 && `↗️ ${__kbUi("boshqa oynaga")}: ${h.yashirildi}× (${h.yashirin_s || 0} s)`, h.nusxa > 0 && `📋 ${__kbUi("nusxa olish")}: ${h.nusxa}×`,
    h.tez_togri > 2 && `⚡ ${__kbUi("juda tez to‘g‘ri")}: ${h.tez_togri}`, h.kamera === "rad" && `📷 ${__kbUi("kamera rad etildi")}`].filter(Boolean);
  return <div className="kg-nz">{d.natijalar.map((r, i) => { const b = belgi(r.halollik || {}); return <div key={i} className={`kg-nz-q ${b.length ? "is-shubha" : ""}`}>
    <div><b>{r.ism}</b> · {r.kod} · {r.togri}/{r.jami} {r.otdi ? "✅" : "❌"} <small>({r.urinishlar} {__kbUi("urinish")})</small></div>
    {b.length > 0 && <div className="kg-nz-b">⚠️ {b.join(" · ")}</div>}
    {r.rasmlar?.length > 0 && <div className="kg-nz-rasm">{r.rasmlar.map((u, k) => <a key={k} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" loading="lazy" /></a>)}</div>}
  </div>; })}</div>;
}

/** REV484: o'qituvchi — guruhning yakuniy baholari (uy 30 / kurs 40 / onlayn 10 / imtihon 20) va o'z bahosini qo'yish */
function Baholar({ apiBase, token, g }) {
  const [d, setD] = useState(null), [xato, setXato] = useState("");
  const yukla = () => kgFetch(apiBase, `/api/kurs_guruh/${g.id}/yakuniy`, token).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); }, [g.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const qoy = (o, turi) => {
    const v = window.prompt(__kbUi(turi === "imtihon" ? `${o.ism}: imtihon bahosi (0–100 %)` : `${o.ism}: kurs bahosi — mashg‘ulot, uy vazifasi (0–100 %)`));
    const n = Number(String(v || "").replace(",", ".")); if (v == null || !Number.isFinite(n) || n < 0 || n > 100) return;
    kgFetch(apiBase, `/api/kurs_guruh/${g.id}/baho`, token, { method: "POST", body: { user_id: o.user_id, turi, ball: Math.round(n) } }).then(yukla).catch((e) => setXato(e.message));
  };
  if (xato) return <p className="kk-xato">{xato}</p>;
  if (!d) return <p className="kk-p">⏳</p>;
  if (!d.oquvchilar.length) return <p className="kk-p">{__kbUi("Guruhda hali o‘quvchi yo‘q.")}</p>;
  const f = (o, k) => { const q = o.qismlar.find((x) => x.kalit === k); return q?.foiz == null ? "—" : `${q.foiz}`; };
  return <div className="kg-baho"><table><thead><tr><th>{__kbUi("O‘quvchi")}</th><th>🏠 30%</th><th>👩‍🏫 40%</th><th>💻 10%</th><th>✍️ 20%</th><th>🎓</th><th /></tr></thead>
    <tbody>{d.oquvchilar.map((o) => <tr key={o.user_id}><td>{o.ism}</td><td>{f(o, "uy")}</td><td>{f(o, "kurs")}</td><td>{f(o, "onlayn")}</td><td>{f(o, "imtihon")}</td>
      <td><b>{o.foiz == null ? "—" : `${o.foiz}% · ${o.ball}`}</b></td>
      <td><button type="button" className="kg-btn" onClick={() => qoy(o, "kurs")}>+ {__kbUi("kurs")}</button> <button type="button" className="kg-btn" onClick={() => qoy(o, "imtihon")}>+ {__kbUi("imtihon")}</button></td></tr>)}</tbody></table>
    <p className="kk-p">{__kbUi("Baho: 86–100% → 5, 71–85% → 4, 56–70% → 3. Qaysidir qism bo‘lmasa, qolganlari ulushiga qarab hisoblanadi.")}</p></div>;
}

export default function KursGuruh({ apiBase, token, user, kurs, onDars }) {
  const oqituvchi = Boolean(user?.is_admin) || ["oqituvchi", "admin", "direktor"].includes(String(user?.role || ""));
  const [d, setD] = useState(null);
  const [ochiq, setOchiq] = useState(false);
  const [nom, setNom] = useState("");
  const [xabar, setXabar] = useState("");
  const [xato, setXato] = useState("");
  const [kuzat, setKuzat] = useState(null);
  const [nzOchiq, setNzOchiq] = useState(null);   // REV483
  const [bahoOchiq, setBahoOchiq] = useState(null);   // REV484
  const grade = (kurs.sinflar || [])[0] || "";
  const yukla = () => kgFetch(apiBase, "/api/kurs_guruh", token, { params: { fan: kurs.fan, grade } }).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); }, [kurs.kalit]); // eslint-disable-line react-hooks/exhaustive-deps
  const havola = (g) => `${window.location.origin}/?kurs_guruh=${encodeURIComponent(g.kod)}`;
  const nusxa = async (g) => { try { await navigator.clipboard.writeText(havola(g)); setXabar(__kbUi("Havola nusxalandi — talabalarga yuboring (Telegram guruhiga).")); } catch { setXabar(havola(g)); } };
  const yarat = () => { setXato("");
    kgFetch(apiBase, "/api/kurs_guruh", token, { method: "POST", body: { fan: kurs.fan, grade, kurs_nomi: kurs.nomi || "", nom } })
      .then((r) => { setOchiq(false); setNom(""); nusxa(r.guruh); yukla(); }).catch((e) => setXato(e.message)); };
  const bugungi = (g, tc) => { const dars = (kurs.darslar || []).find((x) => x.topic_code === tc);
    kgFetch(apiBase, `/api/kurs_guruh/${g.id}/bugungi`, token, { method: "POST", body: { topic_code: tc, nom: dars?.nomi || "" } })
      .then(() => { setXabar(tc ? __kbUi(`«${dars?.nomi || tc}» bugungi mashg‘ulot qilib belgilandi — talabalarda darhol ko‘rinadi.`) : ""); yukla(); }).catch((e) => setXato(e.message)); };
  if (!d) return null;
  const azolik = d.azolik || [];
  return <div className="kg">
    {xabar && <p className="kg-ok" role="status">{xabar}</p>}
    {xato && <p className="kk-xato" role="alert">{xato}</p>}
    {/* talaba: bugungi mashg'ulot */}
    {azolik.map((g) => <div key={g.id} className="kg-karta is-talaba">
      <div><b>👥 {g.nom}</b><small>{__kbUi("Bugungi mashg‘ulot")}: {g.bugungi ? <b>{g.bugungi_nom || g.bugungi}</b> : __kbUi("hali belgilanmagan")}</small></div>
      {g.bugungi && <button type="button" className="kg-btn is-asosiy" onClick={() => onDars?.(g.bugungi, g)}>▶ {__kbUi("Boshlash")}</button>}
    </div>)}
    {/* o'qituvchi: guruhlar */}
    {oqituvchi && <div className="kg-oqituvchi">
      <div className="kg-sar"><b>👥 {__kbUi("Shu kurs bo‘yicha guruhlarim")}</b>
        <button type="button" className="kg-btn is-asosiy" onClick={() => setOchiq((x) => !x)}>➕ {__kbUi("Guruh ochish")}</button></div>
      {ochiq && <div className="kg-forma"><label>{__kbUi("Guruh nomi")}: <input value={nom} maxLength={80} placeholder={__kbUi("masalan: 201-guruh")} onChange={(e) => setNom(e.target.value)} /></label>
        <button type="button" className="kg-btn is-asosiy" disabled={nom.trim().length < 2} onClick={yarat}>✅ {__kbUi("Ochish va havolani olish")}</button></div>}
      {!(d.meniki || []).length && !ochiq && <p className="kk-p">{__kbUi("Guruh oching — talabalarga havola yuborasiz, har mashg‘ulotda bugungi darsni tanlaysiz va natijalarni jonli ko‘rasiz.")}</p>}
      {(d.meniki || []).map((g) => <div key={g.id} className="kg-karta">
        <div><b>{g.nom}</b><small>{__kbUi("Kod")}: <code>{g.kod}</code> · 👥 {g.azolar}</small></div>
        <div className="kg-tug">
          <button type="button" className="kg-btn" onClick={() => nusxa(g)}>🔗 {__kbUi("Havola")}</button>
          <button type="button" className={`kg-btn ${kuzat === g.id ? "is-asosiy" : ""}`} disabled={!g.bugungi} onClick={() => setKuzat(kuzat === g.id ? null : g.id)}>🔴 {__kbUi("Jonli kuzatish")}</button>
          <button type="button" className={`kg-btn ${nzOchiq === g.id ? "is-asosiy" : ""}`} onClick={() => setNzOchiq(nzOchiq === g.id ? null : g.id)}>📋 {__kbUi("Nazoratlar")}</button>
          <button type="button" className={`kg-btn ${bahoOchiq === g.id ? "is-asosiy" : ""}`} onClick={() => setBahoOchiq(bahoOchiq === g.id ? null : g.id)}>🎓 {__kbUi("Baholar")}</button>
          <label className="kg-kamera" title={__kbUi("Yoqilsa — guruhning barcha nazoratlari kamera bilan (oylik va maksimum imtihonda kamera doim bor)")}>
            <input type="checkbox" checked={Boolean(g.kamera)} onChange={(e) => kgFetch(apiBase, `/api/kurs_guruh/${g.id}/kamera`, token, { method: "POST", body: { kamera: e.target.checked } }).then(yukla).catch((x) => setXato(x.message))} /> 📷 {__kbUi("Kamera")}</label>
        </div>
        {nzOchiq === g.id && <Nazoratlar apiBase={apiBase} token={token} g={g} />}
        {bahoOchiq === g.id && <Baholar apiBase={apiBase} token={token} g={g} />}
        <label className="kg-bugungi">📅 {__kbUi("Bugungi mashg‘ulot")}: <select value={g.bugungi || ""} onChange={(e) => bugungi(g, e.target.value)}>
          <option value="">— {__kbUi("tanlang")} —</option>
          {(kurs.darslar || []).map((x, i) => <option key={x.topic_code} value={x.topic_code}>{i + 1}. {x.nomi}</option>)}</select></label>
        {kuzat === g.id && g.bugungi && <Jonli apiBase={apiBase} token={token} g={g} jami={/amaliy/i.test(g.bugungi_nom) ? 20 : /ma.?ruza/i.test(g.bugungi_nom) ? 9 : 0} />}
      </div>)}
    </div>}
  </div>;
}
