import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { splitCourseMath } from "../courses/CourseText.jsx";
import { checkAnswer, javobYechimdan, speakableText } from "./darsXonasiRules.js";
import MatKlaviatura, { JavobKorinishi } from "./MatKlaviatura.jsx";
import QoralamaDaftar from "./QoralamaDaftar.jsx";   // REV385: misol yechish uchun oq varaq
import { stripSpeechTags } from "../speech/language.js";
import { conditionLines, nextShown, optionState } from "./kitobKodRules.js";
import { MatQator } from "./MatDoska.jsx";   // REV269: matematika — yechim qatorlari jonli yoziladi
import { buyruq, ovozMatni } from "./matDoska.js";

// Doskadagi matn: oddiy matn React orqali, formulalar faqat KaTeX (trust:false).
export function BoardText({ text }) {
  // REV182: miyadagi doska/sarlavha teglari ([de]…[/de]) ekranda ko'rinmaydi — ular faqat ovoz va «kim gapiryapti» uchun
  const parts = useMemo(() => splitCourseMath(stripSpeechTags(text)).map((part) => {
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
      const audio = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?k=133&${new URLSearchParams({ matn: clean.slice(0, 1500), jins })}`);
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
export default function AmaliyDoska({ item, say, hush, mediaUrl = (u) => u, autoStart = false, onSolved, kid = false, jonli = false, soz = -1, sozSoni = 0 }) {
  useKbInterfaceLocale();
  const steps = item?.yechim || [];
  const options = item?.variantlar || [];
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [maslahatN, setMaslahatN] = useState(0);   // REV269: nechta maslahat ochilgan
  const [klav, setKlav] = useState(false);   // REV312: matematik klaviatura ochiqmi
  const [daftar, setDaftar] = useState(false);   // REV385: qoralama daftar ochiqmi
  const kutilgan = item?.javob || javobYechimdan(steps);
  useEffect(() => {   // klaviatura ochiq — dars oynasi pastdan joy qoldiradi (doska yopilmaydi)
    const el = typeof document !== "undefined" ? document.querySelector(".dx-root") : null;
    el?.classList.toggle("dx-klav-ochiq", klav);
    return () => el?.classList.remove("dx-klav-ochiq");
  }, [klav]);
  const runRef = useRef(0);

  const stop = useCallback(() => { runRef.current += 1; setRunning(false); hush?.(); }, [hush]);
  // REV93: yangi topshiriq ochilganda o'qituvchi ovozini O'CHIRMAYMIZ (dars xonasi shu payt shartni o'qiyapti) —
  // faqat o'zimizning yechim ko'rsatishni to'xtatamiz. Oldin bu ovozni kesib, dars shu qadamda to'xtab qolardi.
  useEffect(() => { runRef.current += 1; setRunning(false); setShown(0); setPicked(null); setAnswer(""); setFeedback(null); setMaslahatN(0); setKlav(false); }, [item?.kod, item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
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
      const gap = s.ovoz || (jonli ? ovozMatni(s.doska) : s.doska);
      say(i === 0 && from === 0 && !jonli ? `${__kbUi("Yechimni ko‘ramiz.")} ${gap}` : gap, () => {
        setTimeout(() => step(i + 1), 450);
      });
    };
    step(from);
  }, [steps, say, onSolved, jonli]);

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
    else if (item.xatolar?.[String(k)]) say(item.xatolar[String(k)], () => reveal(0));   // REV269: aynan shu xatoning izohi
    else say(__kbUi("Javob noto‘g‘ri. Yechimni ko‘rib chiqamiz."), () => reveal(0));
  };
  const submit = (event) => {
    event?.preventDefault?.();
    if (!answer.trim()) return;
    if (checkAnswer(answer, kutilgan)) { setFeedback({ ok: true, text: __kbUi("✅ To‘g‘ri!") }); setKlav(false); say(__kbUi("Barakalla, to‘g‘ri!")); }
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
      {lines.map((line, i) => <p key={i}>{jonli ? <MatQator qator={buyruq(line)} /> : <BoardText text={line} />}</p>)}
    </div>
    {item.rasm && <img className="dx-pic" src={mediaUrl(item.rasm)} alt="" loading="lazy" />}
    {options.length > 0 && <div className="dx-opts">{options.map((o, k) => {
      const state = optionState(k, picked, item.togri);
      return <button key={k} type="button" onClick={() => pick(k)} className={state === "ok" ? "is-ok" : state === "no" ? "is-no" : state === "picked" ? "is-picked" : ""}>
        {"ABCDE"[k]}) <BoardText text={o} /></button>;
    })}</div>}
    {/* REV312: javob — doskadagi quti (telefon klaviaturasi chiqmaydi), bosilsa pastda matematik klaviatura */}
    {!options.length && kutilgan && !kid && <div className="dx-javob-maydon">
      <button type="button" className={`dx-javob-quti ${klav ? "is-ochiq" : ""}`} onClick={() => setKlav(true)} aria-label={__kbUi("Javobingiz")}>
        <JavobKorinishi qiymat={answer} bosh="✏️ Javobni yozing" /></button>
      <button type="button" className="dx-btn dx-primary" disabled={!answer} onClick={submit}>{__kbUi("Tekshirish")}</button>
      {feedback && <span className={`dx-javob-natija ${feedback.ok ? "is-ok" : "is-no"}`}>{feedback.text}</span>}
    </div>}
    {!kid && <button type="button" className="dx-btn dx-daftar-och" onClick={() => { setKlav(false); setDaftar(true); }}>📝 {__kbUi("Qoralama daftarda yechish")}</button>}
    {daftar && <QoralamaDaftar savol={<>{lines.map((line, i) => <p key={i}><BoardText text={line} /></p>)}</>}
      chizma={item.rasm ? <img className="qd-rasm" src={mediaUrl(item.rasm)} alt="" /> : null}
      onJavob={!options.length && kutilgan ? () => { setDaftar(false); setKlav(true); } : null} onYop={() => setDaftar(false)} />}
    {klav && <MatKlaviatura kutilgan={kutilgan} qiymat={answer} onChange={(v) => { setAnswer(v); setFeedback(null); }} onTekshir={submit} onYop={() => setKlav(false)} />}
    {picked !== null && picked !== item.togri && item.xatolar?.[String(picked)] && <p className="mdx-xato">⚠ <BoardText text={stripSpeechTags(item.xatolar[String(picked)])} /></p>}
    {maslahatN > 0 && <div className="mdx-maslahatlar">{(item.maslahat || []).slice(0, maslahatN).map((m, i) => <p key={i}>💡 <BoardText text={m} /></p>)}</div>}
    {shown > 0 && <div className="dx-solution" aria-live="polite">
      <h4>{__kbUi("Yechim")}</h4>
      {steps.slice(0, shown).map((s, i) => {
        // REV269: jonli doska — oxirgi qadam ovoz bilan birga yoziladi (soz — aytilayotgan so'z tartibi)
        const p = i === shown - 1 && running && sozSoni > 0 ? Math.min(1, Math.max(0.02, (soz + 1) / sozSoni)) : 1;
        return <div key={i} className={`dx-line ${jonli ? "mdx-line" : i === shown - 1 && running ? "is-new" : ""}`}>{jonli ? <MatQator qator={buyruq(s.doska)} progress={p} /> : <BoardText text={s.doska} />}</div>;
      })}
    </div>}
    {/* REV93: bog'chada tugmalar yo'q — dars o'zi o'qiydi, kutadi, maqtaydi va davom etadi */}
    {!kid && <div className="dx-row dx-amaliy-actions">
      {(item.maslahat || []).length > maslahatN && shown === 0 && !running && <button type="button" className="dx-btn mdx-maslahat-btn" onClick={() => { const m = item.maslahat[maslahatN]; setMaslahatN(maslahatN + 1); say(m); }}>
        💡 {__kbUi("Maslahat")} {maslahatN + 1}/{item.maslahat.length}</button>}
      {steps.length > 0 && !running && shown < steps.length && <button type="button" className="dx-btn dx-primary" onClick={() => reveal(shown)}>{shown ? __kbUi("▶ Davom ettirish") : __kbUi("▶ Yechimni ko‘rsatish")}</button>}
      {running && <button type="button" className="dx-btn" onClick={stop}>{__kbUi("❚❚ To‘xtatish")}</button>}
      {steps.length > 1 && shown < steps.length && <button type="button" className="dx-btn" onClick={() => { stop(); setShown(steps.length); }}>{__kbUi("Hammasini ko‘rsatish")}</button>}
      {shown > 0 && !running && <button type="button" className="dx-btn" onClick={() => { stop(); setShown(0); setPicked(null); setFeedback(null); }}>{__kbUi("↺ Yechimni yashirish")}</button>}
      {!steps.length && <span className="dx-note">{__kbUi("Bu topshiriq uchun yechim kiritilmagan.")}</span>}
    </div>}
  </div>;
}
