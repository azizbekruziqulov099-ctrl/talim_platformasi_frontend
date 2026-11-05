// REV361: «Kabu imtihoni» — yakshanba kuni haftaning darslari bo'yicha aralash o'yinlar; oxirida yulduzlar va xulosa.
import React, { useEffect, useMemo, useRef, useState } from "react";
import Oyin from "../oyin/index.js";
import { RASM_HAMMA } from "../darsRasm.js";
import { emojiRasm, matnId, sozId } from "../rasmHarakat.js";
import { albomOl } from "../stikerAlbom.js";
import { haftaDarslari, imtihonRejasi, imtihonXulosa } from "./imtihonRules.js";
import { oyinNatijaYoz } from "../kidActivity.js";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import "./imtihon.css";

const rasm = (el) => { if (!el) return ""; const mt = matnId(el.uz || ""); if (mt && RASM_HAMMA[mt]) return RASM_HAMMA[mt];
  const id = sozId({ soz: el.uz || "", emoji: el.emoji || "" }); if (id && RASM_HAMMA[id]) return RASM_HAMMA[id];
  return emojiRasm(el.emoji || "", RASM_HAMMA, el.uz || el.say || "")?.src || ""; };
const GAP = {
  bosh: { uz: "Bugun yakshanba — Kabu imtihoni! Hafta davomida o‘rganganlaringni o‘yin bilan tekshiramiz.", ru: "Сегодня воскресенье — экзамен Кабу! Проверим в играх, чему ты научился за неделю.",
    en: "Today is Sunday — Kabu's exam! Let's check in games what you learned this week.", de: "Heute ist Sonntag — Kabus Prüfung! Wir prüfen spielerisch, was du diese Woche gelernt hast.",
    es: "¡Hoy es domingo: el examen de Kabu! Comprobamos jugando lo que aprendiste esta semana." },
  yoq: { uz: "Bu hafta hali dars o‘tilmagan. Darslarni o‘tgach, yakshanba kuni imtihon bo‘ladi.", ru: "На этой неделе ещё не было уроков. Экзамен будет в воскресенье после уроков.",
    en: "No lessons yet this week. The exam comes on Sunday after your lessons.", de: "Diese Woche gab es noch keine Lektionen. Die Prüfung ist am Sonntag nach den Lektionen.",
    es: "Esta semana aún no hubo clases. El examen será el domingo después de las clases." },
  oxir: { uz: "Imtihon tugadi! Barakalla!", ru: "Экзамен окончен! Молодец!", en: "The exam is over! Well done!", de: "Die Prüfung ist vorbei! Gut gemacht!", es: "¡El examen terminó! ¡Muy bien!" },
};
const g = (k, iz) => GAP[k][iz] || GAP[k].uz;

export default function KabuImtihoni({ apiBase = "", token = "", yosh = "4-5", izoh = "uz", til = "uz", onSay, onClose, sinov = false, darslar: tayyorDarslar = null }) {
  const [reja, setReja] = useState(null);
  const [i, setI] = useState(0);
  const [natijalar, setNatijalar] = useState([]);
  const urug = useRef(Math.floor(Math.random() * 1e6));
  const say = (t, d) => { try { onSay?.(t, d); } catch { d?.(); } };
  useEffect(() => {
    let stop = false;
    if (tayyorDarslar) { setReja(imtihonRejasi(tayyorDarslar, { yosh, urug: urug.current })); return undefined; }   // sinov xonasi uchun
    const kodlar = haftaDarslari(albomOl("bola"), new Date()).slice(-8);
    if (!kodlar.length) { setReja([]); return undefined; }
    const base = String(apiBase || "").replace(/\/+$/, "");
    Promise.all(kodlar.map((k) => fetch(`${base}/api/dars_xonasi/${encodeURIComponent(k)}?${new URLSearchParams({ token, til: izoh })}`)
      .then((r) => (r.ok ? r.json() : null)).catch(() => null)))
      .then((ls) => { if (stop) return; const darslar = ls.map((l, j) => l && { kod: kodlar[j], mavzu: l.topic?.mavzu || "", fan: l.topic?.fan || "", steps: l.steps || [] }).filter(Boolean);
        setReja(imtihonRejasi(darslar, { yosh, urug: urug.current })); });
    return () => { stop = true; };
  }, [apiBase, token, yosh, izoh, tayyorDarslar]);
  useEffect(() => { if (reja && reja.length && i === 0) say(g("bosh", izoh)); }, [reja]); // eslint-disable-line react-hooks/exhaustive-deps
  const xulosa = useMemo(() => imtihonXulosa(natijalar), [natijalar]);
  const tugadi = reja && reja.length > 0 && i >= reja.length;
  useEffect(() => { if (tugadi) say(g("oxir", izoh)); }, [tugadi]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!reja) return <div className="im-root"><p role="status">{__kbUi("Yuklanmoqda…")}</p></div>;
  if (!reja.length) return <div className="im-root"><div className="im-bosh">🏆</div><p className="im-matn">{g("yoq", izoh)}</p>{onClose && <button type="button" className="im-tugma" onClick={onClose}>✕</button>}</div>;
  if (tugadi) return <div className="im-root">
    <div className="im-bosh">🏆</div>
    <div className="im-yulduz" aria-label={`${xulosa.yulduz} ⭐`}>{"⭐".repeat(xulosa.yulduz)}{"☆".repeat(3 - xulosa.yulduz)}</div>
    <p className="im-matn">{g("oxir", izoh)} · {xulosa.foiz}%</p>
    <ul className="im-xulosa">{xulosa.ruyxat.map((m) => <li key={m.mavzu} className={m.foiz >= 60 ? "is-ok" : "is-takror"}>{m.foiz >= 60 ? "💪" : "🔁"} {m.mavzu} — {m.foiz}%</li>)}</ul>
    {onClose && <button type="button" className="im-tugma" onClick={onClose}>✓</button>}
  </div>;
  const o = reja[i];
  return <div className="im-root">
    <div className="im-yol" aria-label={`${i + 1}/${reja.length}`}>{reja.map((_, j) => <i key={j} className={j < i ? "is-bitdi" : j === i ? "is-joriy" : ""} />)}</div>
    <div className="im-oyin">
      <Oyin key={`${i}-${o.id}`} id={o.id} elementlar={o.elementlar} sonlar={o.sonlar} yosh={yosh} til={til} izoh={izoh} rasm={rasm} urug={urug.current + i}
        kirishDaraja="yoq" mavzu={o.mavzu?.replace(/^\s*\d+[.)]\s*/, "")} onSay={(t, d) => say(t, d)}
        onNatija={(togri, xatolar, info) => {
          const xato = Array.isArray(xatolar) ? xatolar.length : Number(xatolar) || 0;
          if (!sinov) oyinNatijaYoz(apiBase, token, { darsKod: o.kod, oyinId: o.id, togri, xato, soniya: info?.soniya });
          setNatijalar((n) => [...n, { kod: o.kod, mavzu: o.mavzu, togri, xato }]);
          setTimeout(() => setI((x) => x + 1), 1200);
        }} />
    </div>
  </div>;
}
