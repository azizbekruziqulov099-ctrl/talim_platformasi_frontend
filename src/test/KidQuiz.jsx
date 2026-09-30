import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { stripSpeechTags } from "../speech/language.js";
import { kidOptions, kidPraise, kidTheme } from "./kidQuizRules.js";
import ListenText from "../speech/ListenText.jsx";
import "./kidQuiz.css";

/** REV80/REV91: bog'cha bolasi uchun test — savol ovoz bilan o'qiladi, variantlar birma-bir aytiladi (aytilayotgani
 *  qimirlaydi), keyin hammasi yengil qimirlab kutadi — bola rasmning o'zini bosadi. Javobdan keyin maqtov yoki dalda
 *  aytiladi va keyingi savol o'zi keladi: tugma bosish shart emas. Vaqt va «jon» yo'q. */
export default function KidQuiz({ savol, index, total, natija, tekshirilmoqda, correctCount, jins, onAnswer, onNext, speak, onStop }) {
  useKbInterfaceLocale();
  const [history, setHistory] = useState([]); // [{savol, tanlangan, natija}]
  const [viewing] = useState(null); // REV91: bolaga orqaga-oldinga tugmalari yo'q — doim joriy savol
  const [chosen, setChosen] = useState("");
  const lastSpoken = useRef("");
  const seq = useRef(0);
  const [hot, setHot] = useState("");
  const [waiting, setWaiting] = useState(false);
  const nextRef = useRef(onNext);
  nextRef.current = onNext;
  const theme = kidTheme(jins);
  const current = viewing === null ? { savol, tanlangan: chosen, natija } : history[viewing];
  const options = useMemo(() => kidOptions(current.savol), [current.savol]);

  useEffect(() => { setChosen(""); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* eski brauzer */ } }, [savol?.id]);
  // Yangi savol — avtomatik o'qiladi (bola o'qiy olmaydi).
  const readAll = useCallback(async (s) => {
    const my = ++seq.current;
    setHot(""); setWaiting(false);
    await speak?.(s.question);
    const audio = kidOptions(s).filter((o) => o.listen === "audio");
    for (const o of audio) {
      if (seq.current !== my) return;
      setHot(o.letter);
      await new Promise((r) => setTimeout(r, 200));
      if (seq.current !== my) return;
      await speak?.(o.speech);
    }
    if (seq.current === my) { setHot(""); setWaiting(true); }
  }, [speak]);
  useEffect(() => {
    if (!savol || viewing !== null) return;
    const key = `q:${savol.id}`;
    if (lastSpoken.current === key) return;
    lastSpoken.current = key;
    const t = setTimeout(() => readAll(savol), 350);
    return () => clearTimeout(t);
  }, [savol, viewing, readAll]);
  useEffect(() => () => { seq.current += 1; }, []);
  // Javob keldi — maqtov yoki dalda + izoh ovozda.
  useEffect(() => {
    if (!natija || !savol || viewing !== null) return;
    const key = `a:${savol.id}`;
    if (lastSpoken.current === key) return;
    lastSpoken.current = key;
    setHistory((h) => (h.some((x) => x.savol.id === savol.id) ? h : [...h, { savol, tanlangan: chosen, natija }]));
    const right = options.find((o) => o.letter === natija.togri_javob);
    const text = natija.togrimi
      ? `${kidPraise(index)} ${natija.tushuntirish || ""}`
      : `Hechqisi yo'q! To'g'ri javob — ${right ? right.speech : natija.togri_javob}. ${natija.tushuntirish || ""}`;
    const my = ++seq.current;
    setHot(""); setWaiting(false);
    // Maqtov/dalda aytib bo'lingach keyingi savol o'zi keladi.
    Promise.resolve(speak?.(text)).then(() => { if (seq.current === my) setTimeout(() => { if (seq.current === my) nextRef.current?.(); }, 900); });
  }, [natija, savol, viewing, chosen, options, index, speak]);

  if (!current?.savol) return null;
  const done = Boolean(current.natija);
  const pick = (letter, word) => {
    if (done || tekshirilmoqda || viewing !== null) return;
    seq.current += 1; setHot(""); setWaiting(false);
    setChosen(letter);
    onAnswer?.(letter, word);
  };
  const stateOf = (letter) => {
    if (!done) return current.tanlangan === letter ? "is-picked" : "";
    if (letter === current.natija.togri_javob) return "is-right";
    if (letter === current.tanlangan) return "is-wrong";
    return "is-dim";
  };
  const mood = !done ? (tekshirilmoqda ? "think" : "ask") : current.natija.togrimi ? "happy" : "cheer";
  const bubble = !done
    ? (tekshirilmoqda ? "Qani, ko'raylik…" : "Eshit va rasmni bos!")
    : current.natija.togrimi ? kidPraise(viewing ?? index) : "Hechqisi yo'q, birga o'rganamiz!";

  return <section className={`kq-root kq-${theme}`} aria-live="polite">
    <header className="kq-top">
      <div className="kq-dots" aria-label={__kbUi(`${index + 1} / ${total}`)}>
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < history.length ? (history[i]?.natija?.togrimi ? "is-star" : "is-done") : i === index ? "is-now" : ""}>{i < history.length && history[i]?.natija?.togrimi ? "★" : ""}</span>)}
      </div>
      <span className="kq-stars">⭐ {correctCount}</span>
      {onStop && <button type="button" className="kq-stop" onClick={onStop} aria-label={__kbUi("To'xtatish")}>✕</button>}
    </header>

    <div className="kq-mascot">
      <span className={`kq-bird is-${mood}`} aria-hidden="true">🕊️</span>
      <p className="kq-bubble">{__kbUi(bubble)}</p>
    </div>

    <div className="kq-question">
      <h2><ListenText text={current.savol.question} speak={speak} /></h2>
      <button type="button" className="kq-listen" onClick={() => readAll(current.savol)} aria-label={__kbUi("Savolni qayta eshitish")}>🔊</button>
    </div>

    <div className={`kq-options kq-n${options.length}`}>
      {options.map((o, i) => <div key={o.letter} className="kq-opt-wrap">
        <button type="button" style={{ "--i": i }} className={`kq-option ${stateOf(o.letter)} ${o.listen ? `is-listen-${o.listen}` : ""} ${!done && hot === o.letter ? "is-hot" : ""} ${!done && waiting ? "is-waiting" : ""}`} disabled={done || tekshirilmoqda || viewing !== null}
          onClick={() => pick(o.letter, o.word)} aria-label={o.listen && !done ? `${i + 1}` : undefined}>
          <span className="kq-pic" aria-hidden="true">{o.picture || (o.listen ? `${i + 1}` : o.letter)}</span>
          {/* Tinglash rejimida so'z javobdan keyin ko'rinadi — avval quloq bilan tanlaydi. */}
          {o.word && (!o.listen || done) && <span className="kq-word">{o.word}</span>}
          {done && o.letter === current.natija.togri_javob && <span className="kq-mark">✓</span>}
        </button>
      </div>)}
    </div>

  </section>;
}
