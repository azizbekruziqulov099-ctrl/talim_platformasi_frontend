import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { CONTENT_LOCALES } from "./language.js";
import { gradeSpeech, speechRecognitionAvailable } from "./speakRules.js";
import "./speakPractice.css";

const PRAISE = { 3: "🌟 Zo‘r! Juda aniq aytding!", 2: "👍 Yaxshi! Yana bir marta aytsang — mukammal bo‘ladi.", 1: "🙂 Yaqin! Tinglab, yana urinib ko‘r.", 0: "🎧 Eshitmadim. Balandroq va aniqroq ayt-chi!" };

/** «🎤 Endi sen ayt!» — bola iborani aytadi, telefon/kompyuter mikrofoni tanib, yulduz beradi. */
export default function SpeakPractice({ phrase, lang, onBefore, onResult, say }) {
  const [state, setState] = useState("idle");   // idle | listening | done | error
  const [result, setResult] = useState(null);
  const rec = useRef(null);
  useEffect(() => () => { try { rec.current?.abort(); } catch { /* yopildi */ } }, []);
  useEffect(() => { setState("idle"); setResult(null); }, [phrase]);
  if (!speechRecognitionAvailable(globalThis) || !phrase) return null;

  const start = () => {
    onBefore?.();
    const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    const r = new Recognition();
    rec.current = r;
    r.lang = CONTENT_LOCALES[lang] || "en-US";
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.onresult = (event) => {
      const alts = Array.from(event.results?.[0] || []).map((a) => a.transcript);
      const graded = gradeSpeech(alts, phrase, lang);
      setResult({ ...graded, heard: alts[0] || "" });
      setState("done");
      onResult?.(graded);
      say?.(__kbUi(PRAISE[graded.stars].replace(/^\S+\s/, "")));
    };
    r.onerror = (event) => {
      setState(event?.error === "not-allowed" || event?.error === "service-not-allowed" ? "error" : "done");
      if (event?.error !== "not-allowed") setResult({ stars: 0, score: 0, heard: "" });
    };
    r.onend = () => setState((s) => (s === "listening" ? "done" : s));
    try { r.start(); setState("listening"); setResult(null); } catch { setState("error"); }
  };

  return <div className={`sp-box is-${state}`}>
    <button type="button" className="sp-mic" onClick={start} disabled={state === "listening"} aria-label={__kbUi("Mikrofon: endi sen ayt")}>
      <span aria-hidden="true">{state === "listening" ? "👂" : "🎤"}</span>
      <b>{state === "listening" ? __kbUi("Eshityapman… ayt!") : __kbUi("Endi sen ayt!")}</b>
    </button>
    {state === "error" && <p className="sp-note">{__kbUi("Mikrofonga ruxsat bering (brauzer so‘raydi) va qayta bosing.")}</p>}
    {result && state === "done" && <p className={`sp-result is-${result.stars}`} role="status">
      <span className="sp-stars" aria-label={`${result.stars} / 3`}>{"⭐".repeat(result.stars)}{"☆".repeat(3 - result.stars)}</span>
      {__kbUi(PRAISE[result.stars])}
    </p>}
  </div>;
}
