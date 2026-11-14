// REV544: Kabu loyiha F4 — sinf topshirig'i (jamoalar, rollar), o'qituvchining 4K baholashi, nishonlar.
import React, { useCallback, useEffect, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { loyihaApi } from "./Qolda.jsx";
import { NISHONLAR, nishonlarHisobla, RUBRIKA, rubrikaOrtacha, ROLLAR } from "./nishonlar.js";

/** O'quvchi: guruhiga berilgan topshiriqlar, jamoasi va roli. */
export function SinfTopshiriqlari({ apiBase, token, loyihalar, onBoshla, bir }) {
  const [royxat, setRoyxat] = useState([]);
  useEffect(() => { if (token) loyihaApi(apiBase, token, "/api/loyiha/topshiriqlar").then((d) => setRoyxat(d.royxat || [])).catch(() => {}); }, [apiBase, token, bir]);
  const mening = royxat.filter((t) => !t.ustoz && t.mening_jamoam);
  if (!mening.length) return null;
  const nomi = (k) => loyihalar.find((l) => l.k === k);
  return <div className="lo-tasdiq lo-topshiriq"><h3>📌 {__kbUi("Sinf topshirig‘i")}</h3>
    {mening.map((t) => { const l = nomi(t.loyiha); const jamoa = t.jamoalar[0]?.azolar || [];
      return <div key={t.id} className="lo-top-karta">
        <div className="lo-top-bosh"><span className="lo-belgi">{l?.belgi}</span><div><b>{l ? __kbUi(l.nom) : t.loyiha}</b><small>{t.guruh} · {__kbUi("muddat")}: {t.muddat}</small>{t.izoh ? <p>{t.izoh}</p> : null}</div></div>
        <p className="lo-izoh"><b>{__kbUi("Sizning jamoangiz")} #{t.mening_jamoam}</b> — {__kbUi("har kim o‘z rolida ishlaydi, loyihani esa har biringiz o‘zingiz bajarasiz")}:</p>
        <ul className="lo-jamoa">{jamoa.map((x) => { const r = ROLLAR[x.rol]; return <li key={x.id} className={x.bajardi ? "is-ok" : ""}><span>{r?.belgi}</span><div><b>{x.ism}</b> <em>{__kbUi(r?.nom || x.rol)}</em><small>{__kbUi(r?.vazifa || "")}</small></div><i>{x.bajardi ? `✅ ${"⭐".repeat(x.yulduz || 0)}` : "⏳"}</i></li>; })}</ul>
        <button type="button" className="lo-asosiy" onClick={() => onBoshla(t.loyiha)}>▶ {__kbUi("Loyihani boshlash")}</button></div>; })}</div>;
}

/** Nishonlar va 4K ko'nikmalari (o'quvchi, uning ota-onasi). */
export function Nishonlar({ portfel, server }) {
  const n = nishonlarHisobla(portfel, { qolda: server?.qolda || [], jamoa: server?.jamoa_bajargan || 0 });
  const olingan = n.filter((x) => x.olingan).length; const ort = rubrikaOrtacha(server?.rubrika);
  return <div className="lo-tasdiq"><h3>🏅 {__kbUi("Nishonlar")} <small>{olingan} / {n.length}</small></h3>
    <div className="lo-nishonlar">{n.map((x) => <div key={x.k} className={x.olingan ? "is-bor" : ""} title={__kbUi(x.izoh)}><span>{x.belgi}</span><b>{__kbUi(x.nom)}</b><small>{x.olingan ? "✅" : `${x.bor}/${x.kerak}`}</small></div>)}</div>
    {ort && <><h3 style={{ marginTop: 6 }}>🧭 {__kbUi("4K ko‘nikmalar (o‘qituvchi bahosi, 1–4)")}</h3>
      <div className="lo-4kbar">{RUBRIKA.map((r) => <div key={r.k}><span>{r.belgi} {__kbUi(r.nom)}</span><div className="lo-bar"><i style={{ width: `${(ort[r.k] / 4) * 100}%` }} /></div><b>{ort[r.k]}</b></div>)}</div></>}
  </div>;
}

function RubrikaForma({ o, loyihalar, apiBase, token, onYop, boshlangich }) {
  // oxirgi berilgan topshiriq loyihasidan boshlanadi
  const [loyiha, setLoyiha] = useState(loyihalar.some((l) => l.k === boshlangich) ? boshlangich : loyihalar[0]?.k || "");
 const [b, setB] = useState({ tanqidiy: 2, ijodkor: 2, hamkor: 2, muloqot: 2 }), [izoh, setIzoh] = useState(""), [hol, setHol] = useState("");
  const saqla = async () => { setHol("…"); try { await loyihaApi(apiBase, token, "/api/loyiha/rubrika", { oquvchi_id: o.id, loyiha, ...b, izoh }); setHol("✅ " + __kbUi("Saqlandi")); setTimeout(onYop, 900); } catch (e) { setHol("⚠️ " + e.message); } };
  return <div className="lo-rubrika"><label>{__kbUi("Loyiha")}: <select value={loyiha} onChange={(e) => setLoyiha(e.target.value)}>{loyihalar.map((l) => <option key={l.k} value={l.k}>{l.belgi} {__kbUi(l.nom)}</option>)}</select></label>
    {RUBRIKA.map((r) => <div key={r.k} className="lo-rub-qator"><b>{r.belgi} {__kbUi(r.nom)}</b><div>{[1, 2, 3, 4].map((d) => <button key={d} type="button" className={b[r.k] === d ? "is-on" : ""} onClick={() => setB({ ...b, [r.k]: d })} title={__kbUi(r.d[d - 1])}>{d}</button>)}</div><small>{__kbUi(r.d[b[r.k] - 1])}</small></div>)}
    <input type="text" maxLength={300} placeholder={__kbUi("Izoh (ixtiyoriy)")} value={izoh} onChange={(e) => setIzoh(e.target.value)} />
    <div className="lo-tugmalar" style={{ justifyContent: "flex-start" }}><button type="button" className="lo-asosiy" onClick={saqla}>💾 {__kbUi("Saqlash")}</button><button type="button" className="lo-ortga" onClick={onYop}>{__kbUi("Yopish")}</button>{hol && <small>{hol}</small>}</div></div>;
}

/** O'qituvchi: topshiriq berish, jamoalar holati, o'quvchilarni 4K bo'yicha baholash. Guruhi bo'lmasa — ko'rinmaydi. */
export function UstozPanel({ apiBase, token, loyihalar, onOzgardi }) {
  const [sinf, setSinf] = useState(null), [tops, setTops] = useState([]), [gid, setGid] = useState(0), [loyiha, setLoyiha] = useState(""), [kun, setKun] = useState(7), [izoh, setIzoh] = useState(""), [xabar, setXabar] = useState(""), [baho, setBaho] = useState(null);
  const yukla = useCallback(() => { if (!token) return; loyihaApi(apiBase, token, "/api/loyiha/sinf").then((d) => { setSinf(d); setGid((g) => g || d.guruhlar?.[0]?.id || 0); }).catch(() => {});
    loyihaApi(apiBase, token, "/api/loyiha/topshiriqlar").then((d) => setTops((d.royxat || []).filter((t) => t.ustoz))).catch(() => {}); }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  if (!sinf?.guruhlar?.length) return null;
  const ber = async () => { if (!gid || !loyiha) return; setXabar("…"); try { const r = await loyihaApi(apiBase, token, "/api/loyiha/topshiriq", { guruh_id: Number(gid), loyiha, kun: Number(kun), izoh }); setXabar(`✅ ${r.oquvchilar} ${__kbUi("o‘quvchi")} → ${r.jamoalar} ${__kbUi("jamoa")}`); setIzoh(""); yukla(); onOzgardi?.(); } catch (e) { setXabar("⚠️ " + e.message); } };
  const nomi = (k) => loyihalar.find((l) => l.k === k);
  return <div className="lo-tasdiq"><h3>👩‍🏫 {__kbUi("O‘qituvchi paneli — Kabu loyiha")}</h3>
    <div className="lo-ber"><b>📌 {__kbUi("Guruhga loyiha berish")}</b>
      <select value={gid} onChange={(e) => setGid(e.target.value)}>{sinf.guruhlar.map((g) => <option key={g.id} value={g.id}>{g.nom} ({g.oquvchilar.length})</option>)}</select>
      <select value={loyiha} onChange={(e) => setLoyiha(e.target.value)}><option value="">{__kbUi("Loyihani tanlang…")}</option>{loyihalar.map((l) => <option key={l.k} value={l.k}>{l.belgi} {__kbUi(l.nom)} · {l.sinf}-{__kbUi("sinf")}</option>)}</select>
      <label>{__kbUi("Muddat")}: <select value={kun} onChange={(e) => setKun(e.target.value)}>{[3, 5, 7, 10, 14].map((k) => <option key={k} value={k}>{k} {__kbUi("kun")}</option>)}</select></label>
      <input type="text" maxLength={300} placeholder={__kbUi("Topshiriq izohi (ixtiyoriy)")} value={izoh} onChange={(e) => setIzoh(e.target.value)} />
      <button type="button" className="lo-asosiy" disabled={!loyiha} onClick={ber}>🚀 {__kbUi("Topshiriq berish (jamoalar avtomatik tuziladi)")}</button>{xabar && <small>{xabar}</small>}</div>
    {tops.map((t) => <div key={t.id} className="lo-top-karta"><b>{nomi(t.loyiha)?.belgi} {nomi(t.loyiha) ? __kbUi(nomi(t.loyiha).nom) : t.loyiha} · {t.guruh}</b>
      <small>{__kbUi("muddat")}: {t.muddat} · {__kbUi("bajardi")}: <b>{t.bajarildi} / {t.jami}</b></small>
      <div className="lo-jamoalar">{t.jamoalar.map((j) => <div key={j.jamoa}><b>#{j.jamoa}</b>{j.azolar.map((x) => <span key={x.id} className={x.bajardi ? "is-ok" : ""}>{ROLLAR[x.rol]?.belgi} {x.ism} {x.bajardi ? "✅" : "⏳"}</span>)}</div>)}</div></div>)}
    {sinf.guruhlar.map((g) => <div key={g.id}><b>{g.nom}</b><table className="lo-jadval"><thead><tr><th>{__kbUi("O‘quvchi")}</th><th>{__kbUi("Loyiha")}</th><th>⭐</th><th>✋</th><th>⏳</th><th>4K</th></tr></thead>
      <tbody>{g.oquvchilar.map((o) => <React.Fragment key={o.id}><tr><td>{o.ism}</td><td>{o.loyihalar}</td><td>{o.yulduz}</td><td>{o.qolda}</td><td>{o.kutadi || "—"}</td><td><button type="button" className="lo-ortga" onClick={() => setBaho(baho === o.id ? null : o.id)}>{baho === o.id ? "▲" : `🧭 ${__kbUi("Baholash")}`}</button></td></tr>
        {baho === o.id && <tr><td colSpan={6}><RubrikaForma o={o} loyihalar={loyihalar} apiBase={apiBase} token={token} boshlangich={tops[0]?.loyiha} onYop={() => setBaho(null)} /></td></tr>}</React.Fragment>)}</tbody></table></div>)}</div>;
}
