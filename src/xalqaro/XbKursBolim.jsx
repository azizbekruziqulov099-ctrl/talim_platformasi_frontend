import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";

const HB = { otilgan: "✅", ochiq: "🔓", yopiq: "🔒" };

// Kurs: bo'limlar → mavzular (dars + 30 mashq + 30 test). Mavzu 70% dan keyin keyingisini ochadi.
export default function XbKursBolim({ apiBase, token, toplam, yangila, onData, onDars, onChuqur, onKirish }) {
  const [d, setD] = useState(null);
  const [och, setOch] = useState(null);
  useEffect(() => {
    let t = true;
    xbFetch(apiBase, "/api/xalqaro/kurs", token, { params: { toplam } })
      .then((r) => { if (!t) return; setD(r); onData?.(r); const b = r.bolimlar.find((x) => x.mavzular.some((m) => m.kod === r.keyingi)); setOch((o) => o ?? (b ? b.kalit : r.bolimlar[0]?.kalit)); })
      .catch(() => { if (t) onData?.(null); });
    return () => { t = false; };
  }, [apiBase, token, toplam, yangila]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return null;
  return <div className="xb-bolimlar">
    <div className="xb-karta xb-kurs-bosh"><small>Kurs: {d.bolimlar.length} bo‘lim · {d.mavzu_soni} mavzu</small><b>{d.umumiy_foiz}%</b>
      <span className="xb-progress"><i style={{ width: `${d.umumiy_foiz}%` }} /></span>
      {d.kirish_foiz == null && <><small>Avval kirish testi: bilim darajangizga qarab yo‘l ochiladi.</small>
        <button type="button" className="xb-btn xb-btn-asosiy" onClick={onKirish}>🎯 Kirish testi</button></>}
      {d.takror?.length > 0 && <small>🔁 Takrorlash vaqti: <b>{d.takror.map((k) => d.bolimlar.flatMap((b) => b.mavzular).find((m) => m.kod === k)?.nom).filter(Boolean).join(", ")}</b></small>}
      {d.zaif?.length > 0 && <small>⚠️ 70% dan past — qayta mashq qiling: <b>{d.zaif.map((k) => d.bolimlar.flatMap((b) => b.mavzular).find((m) => m.kod === k)?.nom).filter(Boolean).join(", ")}</b></small>}
    </div>
    {d.bolimlar.map((b, bi) => <section key={b.kalit} className={`xb-karta xb-bolim is-${b.holat}`}>
      <button type="button" className="xb-mavzu-nom" onClick={() => setOch(och === b.kalit ? null : b.kalit)}>
        <span className="xb-belgi">{b.belgi}</span>
        <span><b>{bi + 1}-bo‘lim. {b.nom}</b><small>{b.izoh} · {b.mavzular.length} mavzu · {b.foiz}% {HB[b.holat]}</small></span>
      </button>
      {och === b.kalit && <ul className="xb-mavzular">{b.mavzular.map((m) => m.holat === "yopiq"
        ? <li key={m.kod} className="xb-mavzu-q is-yopiq"><span className="xb-mavzu-nom"><span className="xb-belgi">🔒</span>
            <span><b>{m.nom}</b><small>Oldingi mavzuning mashq va testidan 70% dan oshing — shunda ochiladi</small></span></span></li>
        : <li key={m.kod} className={`xb-mavzu-q is-${m.holat}`}>
            <span className="xb-mavzu-nom"><span className="xb-belgi">{m.eskirgan ? "🔁" : m.belgi || HB[m.holat]}</span>
              <span><b>{m.nom}</b><small>{m.maqsad} · Mashq {m.mashq}% · Test {m.test}%{m.eskirgan ? " · takrorlang" : ""}</small></span></span>
            <span className="xb-uch-tugma xb-uch-kichik">
              <button type="button" className="xb-btn xb-btn-asosiy xb-btn-kichik" onClick={() => (m.dars_kodi ? onDars({ dars_kodi: m.dars_kodi, kalit: m.kod }) : onChuqur(m.kod, "dars"))}>🎓 Dars</button>
              <button type="button" className="xb-btn xb-btn-kichik" onClick={() => onChuqur(m.kod, "mashq")}>✍️ 30 mashq</button>
              <button type="button" className="xb-btn xb-btn-kichik" onClick={() => onChuqur(m.kod, "test")}>📝 30 test</button></span>
          </li>)}</ul>}
    </section>)}
  </div>;
}
