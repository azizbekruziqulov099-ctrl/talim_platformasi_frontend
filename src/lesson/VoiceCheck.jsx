import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import KidStage from "../kid/KidStage.jsx";
import { chime, soft } from "../kid/kidSounds.js";
import { VOICE_LIMITS, gradeVoice, voicePassed, voicePrompt, voiceSummary } from "./voiceCheckRules.js";

const PRAISE_KID = ["Barakalla! Juda to‘g‘ri aytding!", "Zo‘r! Ana shunday!", "Ofarin! Sen zo‘rsan!"];
const PRAISE = ["To‘g‘ri! Aniq aytdingiz.", "Barakalla, to‘g‘ri.", "Yaxshi, to‘g‘ri takrorladingiz."];

/**
 * REV105: dars oxiridagi ovozli tekshiruv. Ustoz iborani aytadi, mikrofon o'zi yoqiladi,
 * bola/o'quvchi/talaba takrorlaydi — brauzer tanib, yulduz beradi. Har iboraga 2 urinish.
 */
export default function VoiceCheck({ items, audience = "oquvchi", say, hush, speaking = false, onDone }) {
  const kid = audience === "bogcha";
  const tries = (VOICE_LIMITS[audience] || VOICE_LIMITS.oquvchi).tries;
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState("prompt");   // prompt | listen | graded | tap | denied | done
  const [attempt, setAttempt] = useState(0);
  const [last, setLast] = useState(null);         // {stars, heard}
  const [results, setResults] = useState([]);
  const [celebrate, setCelebrate] = useState(0);
  const rec = useRef(null);
  const alive = useRef(true);
  const resultsRef = useRef([]);
  resultsRef.current = results;
  const item = items[i];

  const stopRec = () => { try { rec.current?.abort(); } catch { /* yopilgan */ } rec.current = null; };
  useEffect(() => () => { alive.current = false; stopRec(); }, []);

  const finishAll = useCallback((list) => {
    setPhase("done");
    const sum = voiceSummary(list);
    const good = sum.jami && sum.togri / sum.jami >= 0.67;
    say(kid
      ? (good ? __kbUi("Barakalla! Hammasini aytding!") : __kbUi("Yaxshi harakat! Keyingi safar yana aytamiz."))
      : __kbUi(`Ovozli tekshiruv tugadi: ${sum.togri} / ${sum.jami}.`),
      () => setTimeout(() => { if (alive.current) onDone?.(sum); }, 500));
  }, [kid, say, onDone]);

  const record = useCallback((ok, heard, stars) => {
    const list = [...resultsRef.current, { phrase: item.phrase, lang: item.lang, ok, heard, stars }];
    setResults(list);
    const next = () => {
      if (!alive.current) return;
      if (i + 1 >= items.length) { finishAll(list); return; }
      setI(i + 1); setAttempt(0); setLast(null); setPhase("prompt");
    };
    if (ok) {
      setCelebrate((c) => c + 1); chime();
      const list2 = kid ? PRAISE_KID : PRAISE;
      say(__kbUi(list2[i % list2.length]), () => setTimeout(next, 400));
    } else {
      soft();
      const p = item.lang === "uz" ? item.phrase : `[${item.lang}]${item.phrase}[/${item.lang}]`;
      say(kid ? `${__kbUi("Hechqisi yo‘q! Mana bunday:")} ${p}` : `${__kbUi("To‘g‘risi:")} ${p}`, () => setTimeout(next, 500));
    }
  }, [i, item, items.length, kid, say, finishAll]);

  const listen = useCallback(() => {
    const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!Recognition || !item) { setPhase("denied"); return; }
    hush?.();
    stopRec();
    const r = new Recognition();
    rec.current = r;
    r.lang = CONTENT_LOCALES[item.lang] || "uz-UZ";
    r.interimResults = false;
    r.maxAlternatives = 5;
    let handled = false;
    const graded = (alts) => {
      if (handled || !alive.current) return;
      handled = true;
      const g = gradeVoice(alts, item);
      const heard = alts[0] || "";
      setLast({ ...g, heard });
      setPhase("graded");
      if (voicePassed(g)) { record(true, heard, g.stars); return; }
      if (attempt + 1 < tries) {
        setAttempt(attempt + 1);
        say(voicePrompt(item, kid, attempt + 1), () => { if (alive.current) setPhase("again"); });
        return;
      }
      record(false, heard, g.stars);
    };
    r.onresult = (event) => graded(Array.from(event.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (event) => {
      if (event?.error === "not-allowed" || event?.error === "service-not-allowed") { handled = true; setPhase("denied"); return; }
      if (event?.error === "aborted") return;
      graded([]);   // no-speech / network — eshitilmadi
    };
    r.onend = () => { if (!handled && alive.current) graded([]); };
    try { r.start(); setPhase("listen"); } catch { setPhase("tap"); }
  }, [item, attempt, tries, kid, say, hush, record]);

  // Har ibora: ustoz aytadi → mikrofon o'zi yoqiladi.
  useEffect(() => {
    if (!item || phase !== "prompt") return;
    say(voicePrompt(item, kid, 0), () => { if (alive.current) listen(); });
  }, [i, phase]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (phase === "again") listen(); }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const skip = () => { stopRec(); hush?.(); record(false, "", 0); };
  const stopAll = () => {
    stopRec(); hush?.();
    const list = [...resultsRef.current];
    onDone?.(voiceSummary(list));
  };

  if (!item && phase !== "done") return null;
  const mood = phase === "listen" ? "think" : speaking ? "talk" : last && voicePassed(last) ? "happy" : "wave";
  const listening = phase === "listen";

  return <div className={`dx-voice ${kid ? "is-kid" : ""}`} aria-live="polite">
    {kid
      ? <div className="dx-voice-kid"><KidStage compact mood={mood} celebrate={celebrate} speaking={speaking} /></div>
      : <h3 className="dx-title">{__kbUi("Ovozli tekshiruv")} · {Math.min(i + 1, items.length)} / {items.length}</h3>}

    {!kid && item && phase !== "done" && <div className="dx-voice-phrase">
      <small>{__kbUi("Takrorlang:")}</small>
      <b lang={item.lang}>{item.phrase}</b>
    </div>}

    <div className="dx-voice-dots" aria-label={__kbUi(`${results.filter((r) => r.ok).length} ta to‘g‘ri`)}>
      {items.map((it, k) => <span key={k} className={k < results.length ? (results[k].ok ? "is-ok" : "is-no") : k === i ? "is-now" : ""}>{k < results.length ? (results[k].ok ? "⭐" : "•") : "🎤"}</span>)}
    </div>

    {phase !== "done" && <button type="button" className={`dx-voice-mic ${listening ? "is-on" : ""}`}
      onClick={listen} disabled={listening || speaking} aria-label={__kbUi(listening ? "Eshityapman" : "Mikrofonni yoqish")}>
      <span aria-hidden="true">{listening ? "👂" : "🎤"}</span>
      {!kid && <b>{__kbUi(listening ? "Eshityapman… ayting" : speaking ? "Tinglang…" : "Mikrofonni bosib ayting")}</b>}
    </button>}

    {phase === "denied" && <p className="dx-voice-note">{__kbUi("Mikrofonga ruxsat bering: brauzer tepasidagi 🎤 belgisini bosing va «Ruxsat»ni tanlang, keyin mikrofon tugmasini bosing.")}</p>}
    {phase === "tap" && <p className="dx-voice-note">{__kbUi("Mikrofon tugmasini bosing.")}</p>}

    {last && !kid && phase !== "listen" && <p className={`dx-voice-heard is-${last.stars}`}>
      <span aria-label={`${last.stars} / 3`}>{"⭐".repeat(last.stars)}{"☆".repeat(3 - last.stars)}</span>
      {last.heard ? <> {__kbUi("Eshitildi:")} «{last.heard}»</> : <> {__kbUi("Ovoz eshitilmadi — balandroq va aniqroq ayting.")}</>}
    </p>}
    {last && kid && phase !== "listen" && <p className="dx-voice-stars" aria-label={`${last.stars} / 3`}>{"⭐".repeat(Math.max(0, last.stars))}</p>}

    {phase !== "done" && <div className="dx-row dx-voice-actions">
      <button type="button" className="dx-btn" onClick={() => { stopRec(); say(voicePrompt(item, kid, attempt)); }} disabled={listening}>
        {kid ? "🔁" : __kbUi("↻ Yana eshitish")}
      </button>
      <button type="button" className="dx-btn" onClick={skip}>{kid ? "⏭️" : __kbUi("O‘tkazib yuborish")}</button>
      {!kid && <button type="button" className="dx-btn" onClick={stopAll}>{__kbUi("Tekshiruvni tugatish")}</button>}
    </div>}
  </div>;
}
