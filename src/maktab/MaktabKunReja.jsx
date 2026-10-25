import React, { useEffect, useMemo, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { rejaOl } from "./maktabServer.js";
import { kunRejasi, kunBajardi, kunFanlarBajardi, birlashtir, sinfRaqami, vaqtMatni, REJA_STANDART } from "./kunReja.js";
import "./kunReja.css";

const SLOT = {
  dars: ["📘", "Dars"], repetitor: ["🤖", "Repetitor: so‘z yodlash va yozish"], imtihon: ["📝", "Haftalik imtihon"], takror: ["🌀", "Yengil takror"],
};

/**
 * REV177: maktab o'quvchisining bugungi rejasi (fanlar ro'yxati tepasida): yoshga mos dars soni (1–2 sinf — 3–4 dars),
 * har darsdan oldin Kabu bilan takror, Repetitor; dam olish kuni va yakshanba (ota-ona sozlaydi).
 */
export default function MaktabKunReja({ apiBase = "", token = "", sinf: sinfQiymat = "", fanlar = [], fanNomi = (x) => x, onFan }) {
  const sinf = sinfRaqami(sinfQiymat) || 5;
  const [server, setServer] = useState(null);
  const [ochiq, setOchiq] = useState(false);
  useEffect(() => {
    let tirik = true;
    rejaOl(apiBase, token).then((d) => { if (tirik && d) setServer(d); });
    return () => { tirik = false; };
  }, [apiBase, token]);
  const r = useMemo(() => kunRejasi({ sinf, reja: server?.reja || REJA_STANDART, haftaKuni: Number.isInteger(server?.hafta_kuni) ? server.hafta_kuni : new Date().getDay(),
    bajardi: birlashtir(server?.bugun || {}, kunBajardi()), fanlar, bajardiFanlar: [...new Set([...(server?.fanlar || []), ...kunFanlarBajardi()])] }), [server, sinf, fanlar]);
  const keyingi = r.slotlar.find((s) => s.k === "dars" && !s.bajarildi && s.fan);
  const foiz = r.jami ? Math.round((r.bajarildi / r.jami) * 100) : 100;

  if (r.tur === "dam") return <section className="kr-root is-dam" aria-label={T("Bugungi reja")}>
    <span className="kr-belgi" aria-hidden="true">🌴</span>
    <div className="kr-matn"><b>{T(r.kun)} — {T("dam olish kuni")}</b>
      <small>{T("Bugun yangi dars yo‘q. Xohlasangiz, 10 daqiqa Repetitor bilan so‘z takrorlang.")}</small></div>
  </section>;

  return <section className={`kr-root ${r.tugadi ? "is-tugadi" : ""}`} aria-label={T("Bugungi reja")}>
    <button type="button" className="kr-bosh" onClick={() => setOchiq((x) => !x)} aria-expanded={ochiq}>
      <span className="kr-halqa" style={{ "--p": `${foiz}%` }} aria-hidden="true"><i>{r.tugadi ? "✅" : `${r.bajarildi}/${r.jami}`}</i></span>
      <span className="kr-matn">
        <b>📅 {T(r.kun)} · {r.tur === "takror" ? T("haftalik takror kuni") : `${r.oraliq} ${T("ta dars")}`}</b>
        <small>{r.tugadi ? T("Bugungi reja bajarildi! Qo‘shimcha dars — ixtiyoriy.")
          : r.tur === "takror" ? T("Yangi dars yo‘q: Repetitor va haftalik imtihon bilan o‘tganlarni mustahkamlaymiz.")
          : `${T("Har darsdan oldin Kabu bilan takror, oxirida Repetitor")} · ≈ ${vaqtMatni(r.jamiDaqiqa, T)}`}</small>
      </span>
      <span className="kr-ochar" aria-hidden="true">{ochiq ? "▴" : "▾"}</span>
    </button>
    {keyingi && onFan && <button type="button" className="kr-keyingi" onClick={() => onFan(keyingi.fan.kalit)}>
      ▶ {T("Keyingi dars")}: <b>{fanNomi(keyingi.fan.nom)}</b> <small>({keyingi.n}/{r.darsSoni})</small></button>}
    {ochiq && <ol className="kr-slotlar">
      {r.slotlar.map((s, i) => <li key={`${s.k}-${s.n || i}`} className={`${s.bajarildi ? "is-done" : ""} ${s.ixtiyoriy ? "is-ixt" : ""}`}>
        <span aria-hidden="true">{s.bajarildi ? "✅" : SLOT[s.k][0]}</span>
        <span>{T(SLOT[s.k][1])}{s.n ? ` ${s.n}` : ""}{s.fan ? <>: {onFan && !s.bajarildi ? <button type="button" className="kr-fan" onClick={() => onFan(s.fan.kalit)}>{fanNomi(s.fan.nom)}</button> : <b>{fanNomi(s.fan.nom)}</b>}</> : null}{s.ixtiyoriy ? ` (${T("ixtiyoriy")})` : ""}</span>
        <small>{s.k === "dars" ? `🌀 ${s.takror} + 📘 ${s.dars} ${T("daq")}` : `${s.daqiqa} ${T("daq")}`}</small>
      </li>)}
      {r.tur === "dars" && <li className="kr-izoh"><small>☕ {T("Darslar orasida")} 10 {T("daqiqa tanaffus")}{server?.reja?.ozgartirildi ? ` · ${T("Rejani ota-onangiz belgilagan")}` : ""}</small></li>}
    </ol>}
  </section>;
}
