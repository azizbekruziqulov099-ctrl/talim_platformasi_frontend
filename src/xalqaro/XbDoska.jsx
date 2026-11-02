import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import ChalkText from "../lesson/ChalkText.jsx";
import { lineProgress } from "../lesson/chalkRules.js";
import { boardCues } from "../lesson/darsXonasiRules.js";
import { USTOZLAR } from "../kid/ustozlar.js";

/** Kichik ustoz rasmi (gapirayotganda qimirlaydi). */
export function XbUstoz({ ustoz = "sardor", speaking = false, mood = "" }) {
  const src = USTOZLAR?.[ustoz]?.[speaking ? 2 : mood === "happy" ? 5 : 1]?.src || USTOZLAR?.[ustoz]?.[1]?.src;
  return <div className={`xb-ustoz ${speaking ? "is-gap" : ""}`} aria-hidden="true">{src ? <img src={src} alt="" /> : <span>🧑‍🏫</span>}</div>;
}

/**
 * Yechim doskasi: har qadam — doskaga yoziladigan satr va ustoz gapi. Ustoz gapirayotganda shu satr harfma-harf
 * yoziladi (ovoz qancha aytilgan bo'lsa, shuncha). Qadam tugagach keyingisi. «Sekinroq» / «Qayta» / «To'xtat».
 */
export default function XbDoska({ qadamlar = [], ovoz, ustoz = "sardor", avto = true, sarlavha = "", onTugadi }) {
  const [i, setI] = useState(-1);
  const [ishlayapti, setIshlayapti] = useState(false);
  const runRef = useRef(0);
  const steps = qadamlar.filter((q) => q && (q.doska || q.ovoz));

  const boshla = useCallback((from = 0) => {
    const my = ++runRef.current;
    setIshlayapti(true);
    const yur = (k) => {
      if (my !== runRef.current) return;
      if (k >= steps.length) { setIshlayapti(false); setI(steps.length); onTugadi?.(); return; }
      setI(k);
      ovoz.say(steps[k].ovoz || steps[k].doska, () => { if (my === runRef.current) setTimeout(() => yur(k + 1), 350); });
    };
    yur(from);
  }, [steps, ovoz, onTugadi]);
  const toxtat = useCallback(() => { runRef.current += 1; ovoz.hush(); setIshlayapti(false); }, [ovoz]);

  useEffect(() => { if (avto && steps.length) boshla(0); return () => { runRef.current += 1; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const korinadi = i < 0 ? 0 : Math.min(steps.length, i + 1);
  return <div className="xb-doska-wrap">
    <XbUstoz ustoz={ustoz} speaking={ovoz.speaking} />
    <div className="xb-doska" role="region" aria-label={T("Doska")}>
      {sarlavha && <h4 className="xb-doska-sar"><BoardText text={sarlavha} /></h4>}
      {steps.slice(0, korinadi).map((s, k) => {
        const cue = boardCues(s.doska, s.ovoz || s.doska);
        const jami = cue.spoken.split(/\s+/).filter(Boolean).length;
        const word = Math.floor((ovoz.progress || 0) * jami);
        const hozir = k === i && ishlayapti;
        return <div key={k} className={`xb-doska-qator ${/^javob/i.test(s.doska) ? "is-javob" : ""}`}>
          <span className="xb-doska-n">{k + 1}</span>
          <div>{cue.lines.map((line, n) => {
            const p = hozir ? lineProgress(cue.cues, n, word, jami) : null;
            if (hozir && p === 0) return null;
            return <div key={n}>{hozir ? <ChalkText text={line} progress={ovoz.speaking ? p : null} /> : <BoardText text={line} />}</div>;
          })}</div>
        </div>;
      })}
      {!steps.length && <p className="xb-muted">{T("Yechim hali yozilmagan.")}</p>}
    </div>
    <div className="xb-doska-tug">
      {ishlayapti
        ? <button type="button" className="xb-btn" onClick={toxtat}>⏸ {T("To‘xtatish")}</button>
        : <button type="button" className="xb-btn" onClick={() => boshla(i >= 0 && i < steps.length ? i : 0)}>▶ {i >= steps.length ? T("Qaytadan tushuntir") : i >= 0 ? T("Davom etish") : T("Yechimni tushuntir")}</button>}
      {i > 0 && !ishlayapti && <button type="button" className="xb-btn xb-btn-yengil" onClick={() => boshla(0)}>↺ {T("Boshidan")}</button>}
    </div>
  </div>;
}
