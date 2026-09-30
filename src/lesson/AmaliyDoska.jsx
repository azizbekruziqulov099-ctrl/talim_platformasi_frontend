import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { splitCourseMath } from "../courses/CourseText.jsx";
import { checkAnswer, speakableText } from "./darsXonasiRules.js";
import { stripSpeechTags } from "../speech/language.js";
import { conditionLines, nextShown, optionState } from "./kitobKodRules.js";

// Doskadagi matn: oddiy matn React orqali, formulalar faqat KaTeX (trust:false).
export function BoardText({ text }) {
  const parts = useMemo(() => splitCourseMath(text).map((part) => {
    if (!part.math || part.math.length > 3000) return part;
    try {
      return { ...part, html: katex.renderToString(part.math, { displayMode: false, throwOnError: true, trust: false, strict: "ignore", maxExpand: 200, maxSize: 20, output: "html" }) };
    } catch { return part; }
  }), [text]);
  return <>{parts.map((part, i) => part.html
    ? <span key={i} className="dx-math" dangerouslySetInnerHTML={{ __html: part.html }} />
    : <React.Fragment key={i}>{part.text ?? part.source}</React.Fragment>)}</>;
}

// Kod oynasi uchun sodda o'qituvchi ovozi (/api/ovoz). Ovoz ishlamasa matn o'qish vaqtiga qarab davom etadi.
export function useBoardVoice(apiBase, jins = "qiz") {
  const audioRef = useRef(null);
  const runRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const hush = useCallback(() => {
    runRef.current += 1;
    const audio = audioRef.current; audioRef.current = null;
    if (audio) { try { audio.pause(); audio.src = ""; } catch { /* released */ } }
    setSpeaking(false);
  }, []);
  const say = useCallback((text, done) => {
    hush();
    const my = runRef.current;
    const clean = speakableText(text);
    if (!clean) { done?.(); return; }
    setSpeaking(true);
    const finish = () => { if (my !== runRef.current) return; setSpeaking(false); audioRef.current = null; done?.(); };
    const fallback = () => { setTimeout(finish, Math.min(9000, 700 + clean.length * 45)); };
    try {
      const audio = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?${new URLSearchParams({ matn: clean.slice(0, 1500), jins })}`);
      audioRef.current = audio;
      let failed = false;
      audio.onended = finish;
      audio.onerror = () => { if (!failed && my === runRef.current) { failed = true; fallback(); } };
      audio.play().catch(() => { if (!failed && my === runRef.current) { failed = true; fallback(); } });
    } catch { fallback(); }
  }, [apiBase, hush, jins]);
  useEffect(() => hush, [hush]);
  return useMemo(() => ({ say, hush, speaking }), [say, hush, speaking]);
}

/** Amaliy topshiriq doskasi: sharti ko'rinadi, yechimi «Yechimni ko'rsatish» bosilganda
 *  o'qituvchi ovozi bilan qadamma-qadam yoziladi. Dars xonasi va kitob kodi oynasi bir xil ishlatadi. */
export default function AmaliyDoska({ item, say, hush, mediaUrl = (u) => u, autoStart = false, onSolved, kid = false }) {
  useKbInterfaceLocale();
  const steps = item?.yechim || [];
  const options = item?.variantlar || [];
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const runRef = useRef(0);

  const stop = useCallback(() => { runRef.current += 1; setRunning(false); hush?.(); }, [hush]);
  // REV93: yangi topshiriq ochilganda o'qituvchi ovozini O'CHIRMAYMIZ (dars xonasi shu payt shartni o'qiyapti) —
  // faqat o'zimizning yechim ko'rsatishni to'xtatamiz. Oldin bu ovozni kesib, dars shu qadamda to'xtab qolardi.
  useEffect(() => { runRef.current += 1; setRunning(false); setShown(0); setPicked(null); setAnswer(""); setFeedback(null); }, [item?.kod, item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { runRef.current += 1; }, []);

  const reveal = useCallback((from = 0) => {
    if (!steps.length) return;
    const my = ++runRef.current;
    setRunning(true);
    const step = (i) => {
      if (my !== runRef.current) return;
      if (i >= steps.length) { setRunning(false); onSolved?.(); return; }
      setShown(nextShown(i, steps.length));
      const s = steps[i];
      say(i === 0 && from === 0 ? `${__kbUi("Yechimni ko‘ramiz.")} ${s.ovoz || s.doska}` : (s.ovoz || s.doska), () => {
        setTimeout(() => step(i + 1), 450);
      });
    };
    step(from);
  }, [steps, say, onSolved]);

  useEffect(() => {
    if (!autoStart || !steps.length) return undefined;
    const timer = setTimeout(() => reveal(0), 500);
    return () => clearTimeout(timer);
  }, [autoStart, item?.kod]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (k) => {
    if (picked !== null) return;
    setPicked(k);
    if (item.togri === null || item.togri === undefined) return;
    if (k === item.togri) say(__kbUi("To‘g‘ri! Barakalla."));
    else say(__kbUi("Javob noto‘g‘ri. Yechimni ko‘rib chiqamiz."), () => reveal(0));
  };
  const submit = (event) => {
    event.preventDefault();
    if (checkAnswer(answer, item.javob)) { setFeedback({ ok: true, text: __kbUi("To‘g‘ri!") }); say(__kbUi("Barakalla, to‘g‘ri!")); }
    else { setFeedback({ ok: false, text: __kbUi("Yana bir bor urinib ko‘ring yoki yechimni oching.") }); say(__kbUi("Deyarli! Yana bir bor o‘ylab ko‘ring.")); }
  };

  if (!item) return null;
  const lines = conditionLines(stripSpeechTags(item.shart));
  return <div className="dx-amaliy">
    <div className="dx-amaliy-head">
      <span className="dx-kind">{__kbUi(item.turi_nomi || "Topshiriq")}</span>
      {item.kod && !kid && <span className="dx-code" title={__kbUi("Kitobdagi kod")}>{item.kod}</span>}
    </div>
    <div className="dx-task" tabIndex={0} aria-label={__kbUi("Topshiriq sharti")}>
      {lines.map((line, i) => <p key={i}><BoardText text={line} /></p>)}
    </div>
    {item.rasm && <img className="dx-pic" src={mediaUrl(item.rasm)} alt="" loading="lazy" />}
    {options.length > 0 && <div className="dx-opts">{options.map((o, k) => {
      const state = optionState(k, picked, item.togri);
      return <button key={k} type="button" onClick={() => pick(k)} className={state === "ok" ? "is-ok" : state === "no" ? "is-no" : state === "picked" ? "is-picked" : ""}>
        {"ABCDE"[k]}) <BoardText text={o} /></button>;
    })}</div>}
    {!options.length && item.javob && <form className="dx-answer" onSubmit={submit}>
      <input value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label={__kbUi("Javobingiz")} placeholder={__kbUi("Javob")} autoComplete="off" />
      <button type="submit" className="dx-btn dx-primary">{__kbUi("Tekshirish")}</button>
      {feedback && <span className={feedback.ok ? "dx-ok" : "dx-no"}>{feedback.text}</span>}
    </form>}
    {shown > 0 && <div className="dx-solution" aria-live="polite">
      <h4>{__kbUi("Yechim")}</h4>
      {steps.slice(0, shown).map((s, i) => <div key={i} className={`dx-line ${i === shown - 1 && running ? "is-new" : ""}`}><BoardText text={s.doska} /></div>)}
    </div>}
    {/* REV93: bog'chada tugmalar yo'q — dars o'zi o'qiydi, kutadi, maqtaydi va davom etadi */}
    {!kid && <div className="dx-row dx-amaliy-actions">
      {steps.length > 0 && !running && shown < steps.length && <button type="button" className="dx-btn dx-primary" onClick={() => reveal(shown)}>{shown ? __kbUi("▶ Davom ettirish") : __kbUi("▶ Yechimni ko‘rsatish")}</button>}
      {running && <button type="button" className="dx-btn" onClick={stop}>{__kbUi("❚❚ To‘xtatish")}</button>}
      {steps.length > 1 && shown < steps.length && <button type="button" className="dx-btn" onClick={() => { stop(); setShown(steps.length); }}>{__kbUi("Hammasini ko‘rsatish")}</button>}
      {shown > 0 && !running && <button type="button" className="dx-btn" onClick={() => { stop(); setShown(0); setPicked(null); setFeedback(null); }}>{__kbUi("↺ Yechimni yashirish")}</button>}
      {!steps.length && <span className="dx-note">{__kbUi("Bu topshiriq uchun yechim kiritilmagan.")}</span>}
    </div>}
  </div>;
}
