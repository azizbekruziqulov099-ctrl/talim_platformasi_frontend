// REV417: guruh boshqaruvi — adminlar, «faqat adminlar yozadi», a'zoni admin qilish.
import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

export function guruhBoshqaruvOl(apiBase, token, gid) {
  return fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/chat/guruh/${gid}/boshqaruv?token=${encodeURIComponent(token)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
}
const post = (apiBase, yol, maydon) => { const f = new FormData(); Object.entries(maydon).forEach(([k, v]) => f.append(k, String(v)));
  return fetch(`${String(apiBase || "").replace(/\/+$/, "")}${yol}`, { method: "POST", body: f }).then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Xato"); return d; }); };

export default function GuruhBoshqaruv({ apiBase, token, gid, onYop, onYangi }) {
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  const [q, setQ] = useState("");
  const yukla = () => guruhBoshqaruvOl(apiBase, token, gid).then((r) => { setD(r); onYangi?.(r); });
  useEffect(() => { yukla(); }, [gid]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <div className="kb-gb"><p>⏳</p></div>;
  const azolar = d.azolar.filter((a) => !q || a.ism.toLocaleLowerCase("uz").includes(q.toLocaleLowerCase("uz")));
  return <div className="kb-gb" role="dialog" aria-label={__kbUi("Guruh boshqaruvi")}>
    <div className="kb-gb-bosh"><b>⚙️ {d.nomi}</b><button type="button" onClick={onYop} aria-label={__kbUi("Yopish")}>✕</button></div>
    {d.men_admin && <label className="kb-gb-kalit"><input type="checkbox" checked={d.faqat_admin}
      onChange={(e) => post(apiBase, `/api/chat/guruh/${gid}/sozlama`, { token, faqat_admin: e.target.checked }).then(yukla).catch((er) => setXato(er.message))} />
      <span><b>🔒 {__kbUi("Faqat adminlar yozadi")}</b><small>{__kbUi("Yoqilsa, a’zolar faqat o‘qiydi — e’lonlar va dars vaqti uchun qulay")}</small></span></label>}
    {!d.men_admin && <p className="kb-gb-izoh">{d.faqat_admin ? __kbUi("🔒 Bu guruhda hozir faqat adminlar yozadi.") : __kbUi("Guruh adminlari:")}</p>}
    {xato && <p className="kb-gb-xato">{xato}</p>}
    {d.men_admin && d.azolar.length > 8 && <input className="kb-gb-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={__kbUi("A’zoni qidirish")} />}
    <div className="kb-gb-royxat">{azolar.map((a) => <div key={a.user_id} className="kb-gb-qator">
      <span>{a.ism || "—"} {a.egasi ? <i className="kb-gb-belgi">{__kbUi("egasi")}</i> : a.admin ? <i className="kb-gb-belgi">{__kbUi("admin")}</i> : null}</span>
      {d.men_admin && !a.egasi && <button type="button" onClick={() => post(apiBase, `/api/chat/guruh/${gid}/admin`, { token, user_id: a.user_id, admin: !a.admin }).then(yukla).catch((er) => setXato(er.message))}>
        {a.admin ? __kbUi("Adminlikdan olish") : __kbUi("Admin qilish")}</button>}
    </div>)}</div>
  </div>;
}
