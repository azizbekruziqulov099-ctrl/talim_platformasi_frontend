import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { workspaceRequest } from "../workspace/kabutarWorkspaceClient.js";
import "./teacherSubjects.css";

/** REV106: o'qituvchi o'z fanlarini tanlaydi — faqat shu fanlar mavzulari, AI darslari va testlari ko'rinadi. */
export default function TeacherSubjects({ apiBase, token, required = false, onSaved, onClose }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let off = false;
    workspaceRequest(apiBase, "/api/oqituvchi/fanlarim", token)
      .then((d) => { if (!off) { setData(d); setPicked(d.tanlangan || []); } })
      .catch((e) => { if (!off) setError(e.status === 404 ? "Server hali yangilanmagan: fan tanlash bo‘limi yo‘q." : e.message); });
    return () => { off = true; };
  }, [apiBase, token]);

  const toggle = (name) => setPicked((list) => list.includes(name) ? list.filter((x) => x !== name)
    : list.length >= (data?.max || 12) ? list : [...list, name]);

  const save = async () => {
    if (!picked.length) { setError("Kamida bitta fanni tanlang."); return; }
    setBusy(true); setError("");
    try {
      const d = await workspaceRequest(apiBase, "/api/oqituvchi/fanlarim", token, { method: "POST", body: { fanlar: picked } });
      onSaved?.(d.tanlangan || picked);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const list = (data?.mavjud || []).filter((s) => !query.trim() || s.nom.toLowerCase().includes(query.trim().toLowerCase()));

  return <section className="ts-root" aria-labelledby="ts-title">
    <div className="ts-head">
      <h1 id="ts-title">{__kbUi("Qaysi fanlardan dars berasiz?")}</h1>
      <p>{__kbUi("Faqat tanlagan fanlaringizning mavzulari, AI darslari va testlari ko‘rinadi. Keyin «Fanlarim» tugmasi orqali o‘zgartirasiz.")}</p>
    </div>
    {error && <p className="ts-error" role="alert">{__kbUi(error)}</p>}
    {!data && !error && <p className="ts-muted" role="status">{__kbUi("Fanlar yuklanmoqda…")}</p>}
    {data && data.mavjud.length > 8 && <input className="ts-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={__kbUi("Fan nomini qidiring")} aria-label={__kbUi("Fan qidirish")} />}
    {data && data.mavjud.length === 0 && <p className="ts-muted">{__kbUi("Sizga ochiq fanlar hali kiritilmagan. Administrator mavzular yuklagach shu yerda chiqadi.")}</p>}
    {data && <div className="ts-grid" role="group" aria-label={__kbUi("Fanlar")}>
      {list.map((s) => {
        const on = picked.includes(s.nom);
        return <button key={s.nom} type="button" className={on ? "on" : ""} aria-pressed={on} onClick={() => toggle(s.nom)}>
          <span className="ts-check" aria-hidden="true">{on ? "✓" : ""}</span>
          <b>{s.nom}</b><small>{__kbUi(`${s.mavzu_soni} ta mavzu`)}</small>
        </button>;
      })}
    </div>}
    <div className="ts-actions">
      {!required && onClose && <button type="button" className="ts-ghost" onClick={onClose}>{__kbUi("Bekor qilish")}</button>}
      <button type="button" className="ts-primary" disabled={busy || !picked.length} onClick={save}>
        {__kbUi(busy ? "Saqlanmoqda…" : picked.length ? `Saqlash (${picked.length} ta fan)` : "Fanni tanlang")}
      </button>
    </div>
  </section>;
}
