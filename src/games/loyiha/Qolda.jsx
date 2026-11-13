// REV543: «Qo'lda yasash», ota-ona/o'qituvchi tasdig'i va sinf hisoboti (F3).
import React, { useCallback, useEffect, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { QOLDA } from "./qoldaData.js";

const yol = (b) => String(b || "").replace(/\/+$/, "");
export async function loyihaApi(apiBase, token, path, body) {
  const url = `${yol(apiBase)}${path}${body ? "" : `${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`}`;
  const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...body }) } : undefined);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || `Xato ${r.status}`);
  return d;
}

/** Rasmni telefonda kichraytiradi: uzun tomoni 960 px, JPEG, ≤ 450 KB (server chegarasi 600 KB). */
export function rasmKichray(fayl) {
  return new Promise((ok, xato) => {
    const img = new Image(); const u = URL.createObjectURL(fayl);
    img.onload = () => { URL.revokeObjectURL(u);
      let k = Math.min(1, 960 / Math.max(img.width, img.height)); let q = 0.72, s = "";
      for (let i = 0; i < 6; i += 1) { const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); s = c.toDataURL("image/jpeg", q);
        if (s.length * 0.75 <= 450_000) return ok(s); k *= 0.85; q = Math.max(0.5, q - 0.06); }
      return xato(new Error("Rasm juda katta"));
    };
    img.onerror = () => { URL.revokeObjectURL(u); xato(new Error("Rasm o‘qilmadi")); };
    img.src = u;
  });
}
const HOLAT = { kutadi: ["⏳", "Tasdiq kutilmoqda"], tasdiqlandi: ["✅", "Tasdiqlandi"], qaytarildi: ["↩️", "Qayta urinib ko‘ring"] };
const __kbM = (x) => x; void [__kbM("Tasdiq kutilmoqda"), __kbM("Tasdiqlandi"), __kbM("Qayta urinib ko‘ring")];

export function QoldaBolim({ loyiha, apiBase, token }) {
  const d = QOLDA[loyiha]; const [royxat, setRoyxat] = useState([]), [izoh, setIzoh] = useState(""), [band, setBand] = useState(false), [xabar, setXabar] = useState("");
  const yukla = useCallback(() => { if (!token) return; loyihaApi(apiBase, token, "/api/loyiha/portfel").then((p) => setRoyxat((p.qolda || []).filter((x) => x.loyiha === loyiha))).catch(() => {}); }, [apiBase, token, loyiha]);
  useEffect(() => { yukla(); }, [yukla]);
  if (!d) return null;
  const yubor = async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; setBand(true); setXabar("");
    try { const rasm = await rasmKichray(f); await loyihaApi(apiBase, token, "/api/loyiha/qolda", { loyiha, rasm, izoh }); setIzoh(""); setXabar("✅ " + __kbUi("Rasm yuborildi. Ota-onangiz yoki o‘qituvchingiz ko‘rib, tasdiqlaydi.")); yukla(); }
    catch (er) { setXabar("⚠️ " + (er.message || __kbUi("Yuborib bo‘lmadi"))); } finally { setBand(false); } };
  return <div className="lo-qolda">
    <h4>✋ {__kbUi("Uyda qo‘lda yasab ko‘ring")} <small>({__kbUi("ixtiyoriy")} · +2 ⭐)</small></h4>
    <div className="lo-qolda-ust"><div><b>{__kbUi("Kerak bo‘ladi")}:</b><ul>{d.mat.map((m) => <li key={m}>{__kbUi(m)}</li>)}</ul></div><div><b>{__kbUi("Qadamlar")}:</b><ol>{d.qad.map((m) => <li key={m}>{__kbUi(m)}</li>)}</ol></div></div>
    <p className="lo-xavf">⚠️ {__kbUi(d.xav)}</p>
    {token ? <>
      <textarea className="lo-izoh-kiritish" maxLength={400} rows={2} placeholder={__kbUi("Nima yasadingiz va nima kuzatdingiz? (ixtiyoriy)")} value={izoh} onChange={(e) => setIzoh(e.target.value)} />
      <label className={`lo-asosiy lo-fayl ${band ? "is-band" : ""}`}>📷 {band ? __kbUi("Yuborilmoqda…") : __kbUi("Rasm olish / tanlash")}<input type="file" accept="image/*" capture="environment" hidden disabled={band} onChange={yubor} /></label>
      {xabar && <p className="lo-izoh">{xabar}</p>}
      {royxat.length > 0 && <ul className="lo-qolda-royxat">{royxat.slice(0, 6).map((r) => <li key={r.id} className={`is-${r.holat}`}><span>{HOLAT[r.holat]?.[0]}</span><b>{__kbUi(HOLAT[r.holat]?.[1] || r.holat)}</b>{r.tasdiq_izoh ? <em>«{r.tasdiq_izoh}»</em> : null}</li>)}</ul>}
    </> : <p className="lo-izoh">{__kbUi("Rasm yuborish uchun tizimga kiring.")}</p>}
  </div>;
}

/** Ota-ona va o'qituvchi uchun: tasdiq kutayotgan rasmlar. Hech narsa bo'lmasa — ko'rinmaydi. */
export function Tasdiqlash({ apiBase, token }) {
  const [royxat, setRoyxat] = useState([]), [rasm, setRasm] = useState({}), [izoh, setIzoh] = useState({}), [band, setBand] = useState(0);
  const yukla = useCallback(() => { if (!token) return; loyihaApi(apiBase, token, "/api/loyiha/kutayotgan").then((d) => setRoyxat(d.royxat || [])).catch(() => {}); }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  useEffect(() => { royxat.slice(0, 6).forEach((r) => { if (rasm[r.id]) return; loyihaApi(apiBase, token, `/api/loyiha/rasm/${r.id}`).then((d) => setRasm((x) => ({ ...x, [r.id]: d.url }))).catch(() => {}); }); }, [royxat]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!royxat.length) return null;
  const hal = async (r, qabul) => { setBand(r.id); try { await loyihaApi(apiBase, token, `/api/loyiha/qolda/${r.id}/tasdiq`, { qabul, izoh: izoh[r.id] || "" }); setRoyxat((x) => x.filter((y) => y.id !== r.id)); } catch { /* */ } finally { setBand(0); } };
  return <div className="lo-tasdiq"><h3>📬 {__kbUi("Tasdiq kutayotgan loyihalar")} ({royxat.length})</h3>
    {royxat.slice(0, 6).map((r) => <div key={r.id} className="lo-tasdiq-karta">{rasm[r.id] ? <img src={rasm[r.id]} alt="" loading="lazy" /> : <div className="lo-rasm-yuk">📷…</div>}
      <div><b>{r.ism}</b><small>{__kbUi(r.loyiha)}</small>{r.izoh ? <p>{r.izoh}</p> : null}
        <input type="text" maxLength={120} placeholder={__kbUi("Izoh (ixtiyoriy): masalan, «Barakalla!»")} value={izoh[r.id] || ""} onChange={(e) => setIzoh({ ...izoh, [r.id]: e.target.value })} />
        <div className="lo-tugmalar" style={{ justifyContent: "flex-start" }}><button type="button" className="lo-asosiy" disabled={band === r.id} onClick={() => hal(r, true)}>✅ {__kbUi("Tasdiqlash")}</button>
          <button type="button" className="lo-ortga" disabled={band === r.id} onClick={() => hal(r, false)}>↩️ {__kbUi("Qayta urinsin")}</button></div></div></div>)}</div>;
}

/** O'qituvchi uchun: guruhlardagi o'quvchilar loyihalari. Guruhi bo'lmasa — ko'rinmaydi. */
export function SinfHisobot({ apiBase, token }) {
  const [d, setD] = useState(null);
  useEffect(() => { if (token) loyihaApi(apiBase, token, "/api/loyiha/sinf").then(setD).catch(() => {}); }, [apiBase, token]);
  if (!d?.guruhlar?.length) return null;
  return <div className="lo-tasdiq"><h3>👩‍🏫 {__kbUi("Sinf hisoboti — Kabu loyiha")}</h3>
    {d.guruhlar.map((g) => <div key={g.id}><b>{g.nom}</b><table className="lo-jadval"><thead><tr><th>{__kbUi("O‘quvchi")}</th><th>{__kbUi("Loyiha")}</th><th>⭐</th><th>✋</th><th>⏳</th></tr></thead>
      <tbody>{g.oquvchilar.map((o) => <tr key={o.id}><td>{o.ism}</td><td>{o.loyihalar}</td><td>{o.yulduz}</td><td>{o.qolda}</td><td>{o.kutadi || "—"}</td></tr>)}</tbody></table></div>)}</div>;
}
