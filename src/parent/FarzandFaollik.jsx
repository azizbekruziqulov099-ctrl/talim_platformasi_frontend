import React, { useEffect, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import "./farzandFaollik.css";

const LIVE = {
  darsda: { cls: "is-live", emoji: "🟢", text: (s) => `Hozir darsda — «${s.mavzu}»${s.jami_qadam ? ` (${Math.min(s.qadam, s.jami_qadam)}/${s.jami_qadam}-qadam)` : ""}` },
  toxtagan: { cls: "is-pause", emoji: "🟠", text: (s) => `Dars to‘xtab turibdi — «${s.mavzu}», ${s.daqiqa} daqiqadan beri hech narsa bosilmadi` },
  chiqib_ketgan: { cls: "is-away", emoji: "🔴", text: (s) => `Ilovadan chiqib ketgan — ${s.daqiqa} daqiqa. «${s.mavzu}» darsi yarim qoldi` },
  tugatgan: { cls: "is-done", emoji: "✅", text: (s) => `Oxirgi dars tugagan — «${s.mavzu}» (${s.daqiqa} daqiqa oldin)` },
  yoq: { cls: "is-none", emoji: "⚪", text: () => "Bugun hali dars boshlanmagan" },
};

const stars = (n) => (n ? "⭐".repeat(n) + "☆".repeat(Math.max(0, 3 - n)) : "");

/** REV91: ota-ona uchun — farzandning bugungi darslari jonli: darsdami, chiqib ketdimi, natijasi, haftalik faollik. */
export default function FarzandFaollik({ apiBase, token, childId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/ota/bola_faollik?${new URLSearchParams({ token, bola_id: childId })}`,
          { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Ma’lumot yuklanmadi");
        if (!stop) { setData(d); setError(""); }
      } catch (e) { if (!stop) setError(e.message); }
    };
    load();
    const id = setInterval(() => { if (document.visibilityState !== "hidden") load(); }, 20000);
    return () => { stop = true; clearInterval(id); };
  }, [apiBase, token, childId]);

  if (error && !data) return null;
  if (!data || (!data.bola?.bogcha && !data.bugun?.length && !data.hafta?.length)) return null;
  const live = LIVE[data.jonli?.holat] || LIVE.yoq;
  const fans = Object.entries(data.reja?.fanlar || {});
  const maxMin = Math.max(10, ...data.hafta.map((d) => d.daqiqa));
  return <section className="ff-root" aria-label={__kbUi("Farzandim bugun")}>
    <header className="ff-head">
      <h3>📡 {__kbUi("Bugun")} · {__kbUi(data.reja?.kun || "")}</h3>
      <small>{__kbUi(`Kunlik reja: har fandan ${data.reja?.limit || 2} ta yangi dars`)}{data.reja?.dam_olish ? ` · ${__kbUi("dam olish kuni")}` : ""}</small>
    </header>
    <p className={`ff-live ${live.cls}`} role="status"><span aria-hidden="true">{live.emoji}</span>{__kbUi(live.text(data.jonli))}</p>
    {fans.length > 0 && <div className="ff-plan">
      {fans.map(([fan, f]) => <span key={fan} className={f.tugadi >= data.reja.limit ? "is-full" : ""}>
        <b>{fan || __kbUi("Dars")}</b> {f.tugadi}/{data.reja.limit} {f.tugadi >= data.reja.limit ? "✅" : ""}</span>)}
    </div>}
    {data.bugun.length > 0 ? <ul className="ff-list">
      {data.bugun.map((r, i) => <li key={i} className={r.tugadi ? "is-done" : "is-open"}>
        <span className="ff-time">{r.boshlandi}{r.tugadi ? `–${r.tugadi}` : ""}</span>
        <span className="ff-main"><b>{r.mavzu}</b><small>{r.fan}{r.daqiqa ? ` · ${r.daqiqa} ${__kbUi("daqiqa")}` : ""}{r.chalgish ? ` · ${__kbUi(`${r.chalgish} marta ilovadan chiqdi`)}` : ""}</small></span>
        <span className="ff-res">{r.tugadi ? <>{r.jami ? `${r.togri}/${r.jami} ✓ ` : ""}<em>{stars(r.yulduz)}</em></> : <em className="ff-half">{__kbUi("tugallanmagan")}</em>}</span>
      </li>)}
    </ul> : <p className="ff-muted">{__kbUi("Bugun hali dars qilinmagan. Darslar har kuni ochiladi — farzandingiz bilan birga boshlang.")}</p>}
    {data.hafta.length > 0 && <div className="ff-week" aria-label={__kbUi("Oxirgi 7 kun")}>
      {data.hafta.slice().reverse().map((d) => <div key={d.sana} className="ff-day" title={`${d.sana}: ${d.tugatilgan}/${d.darslar}, ${d.daqiqa} daq`}>
        <i style={{ height: `${Math.max(6, Math.round((d.daqiqa / maxMin) * 54))}px` }} className={d.tugatilgan ? "is-on" : ""} />
        <small>{__kbUi(d.kun).slice(0, 2)}</small><b>{d.tugatilgan}</b>
      </div>)}
    </div>}
    <p className="ff-muted">🔔 {__kbUi("Dars boshlanganda, tugaganda va 5 daqiqa mashq qilinmasa xabar keladi (Telegram botga ulangan bo‘lsangiz — Telegramga ham). Ilova farzandingiz qaysi ilovaga o‘tganini ko‘ra olmaydi — faqat darsdan chiqib ketganini biladi.")}</p>
  </section>;
}
