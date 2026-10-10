import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import AmaliyDoska, { BoardText } from "./AmaliyDoska.jsx";
import { boardCues, checkAnswer, lessonDownloadUrl, sceneRange, speakableText, visibleLines } from "./darsXonasiRules.js";
import { stripSpeechTags } from "../speech/language.js";
import { kidOptions } from "../test/kidQuizRules.js";
import ListenText from "../speech/ListenText.jsx";
import SpeakPractice from "../speech/SpeakPractice.jsx";
import { practiceTarget } from "../speech/speakRules.js";
import { lessonAudience, audienceLabels } from "./lessonAudience.js";
import { markLessonDone } from "../curriculum/kidProgress.js";
import { finishLesson, kidTracker, startLesson } from "../kid/kidActivity.js";
import "./dars-xonasi.css";

/** REV90: bog'cha boshqaruv tugmasi — katta belgi, ostida kichik yozuv (o'qiy olmaydigan bola belgidan taniydi). */
function KidIcon({ icon, label }) {
  return <><span className="dx-kid-ico" aria-hidden="true">{icon}</span><small className="dx-kid-cap">{__kbUi(label)}</small></>;
}

function TeacherAvatar() {
  return <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
    <rect width="64" height="64" fill="#E6ECE9" />
    <path d="M12 64c2-12 10-18 20-18s18 6 20 18z" fill="#2F5F7A" />
    <path d="M27 44h10v6H27z" fill="#E7B894" />
    <ellipse cx="32" cy="30" rx="12" ry="14" fill="#F0C6A2" />
    <path d="M19 27c0-10 6-15 13-15s13 5 13 15c-3-5-8-7-13-7s-10 2-13 7z" fill="#3B2A22" />
    <circle cx="27.5" cy="30" r="1.6" fill="#1C2926" /><circle cx="36.5" cy="30" r="1.6" fill="#1C2926" />
    <rect x="23.5" y="27.5" width="8" height="5.5" rx="2" fill="none" stroke="#1C2926" strokeWidth=".9" />
    <rect x="32.5" y="27.5" width="8" height="5.5" rx="2" fill="none" stroke="#1C2926" strokeWidth=".9" />
    <ellipse className="dx-mouth" cx="32" cy="38" rx="3.4" ry="1.8" fill="#9C4A3F" />
  </svg>;
}

export default function DarsXonasi({ apiBase, token, topicCode, fan = "", grade = "", jins = "qiz", learnerGender = "", learnerRole = "", nextLesson = null, onOpenTest, onOpenTopic, onChat, kidPlan = null, onKidFinished, onClose }) {
  useKbInterfaceLocale();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(-1);
  const [mode, setMode] = useState("idle"); // idle | lesson | test | result
  const [playing, setPlaying] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [bubble, setBubble] = useState("");
  const [word, setWord] = useState(-1);
  const [stepFinished, setStepFinished] = useState(true);
  const [rate, setRate] = useState(1);
  const [menu, setMenu] = useState(false);
  const [variant, setVariant] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askReply, setAskReply] = useState("");
  const [testIndex, setTestIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  // REV91: bog'cha — savol variantlari birma-bir aytiladi (aytilayotgani qimirlaydi), keyin hammasi kutadi.
  const [hot, setHot] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const [limitText, setLimitText] = useState("");
  const [kidResult, setKidResult] = useState(null);
  const audioRef = useRef(null);
  const tokenRef = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const speakingRef = useRef(false);
  speakingRef.current = speaking;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const rateRef = useRef(rate);
  rateRef.current = rate;

  // REV80: dars maydoni tinglovchiga moslashadi — bog'cha bolasi, o'quvchi, talaba.
  const audience = lessonAudience(learnerRole, grade || lesson?.topic?.sinf);
  const kid = audience === "bogcha";
  const labels = audienceLabels(audience);
  const theme = learnerGender === "qiz" ? "girl" : learnerGender === "ogil" ? "boy" : "neutral";
  const steps = lesson?.steps || [];
  const step = idx >= 0 ? steps[idx] : null;
  const questions = lesson?.savollar || [];
  const downloadUrl = (format) => lessonDownloadUrl(apiBase, token, topicCode, format);
  const mediaUrl = useCallback((url) => (!url ? null : url.startsWith("/") ? `${String(apiBase).replace(/\/+$/, "")}${url}` : url), [apiBase]);

  const hush = useCallback(() => {
    tokenRef.current += 1;
    const audio = audioRef.current; audioRef.current = null;
    if (audio) { try { audio.pause(); audio.src = ""; } catch { /* already released */ } }
    setSpeaking(false); setWord(-1);
  }, []);

  // O'qituvchi ovozi: serverdagi o'zbekcha TTS (/api/ovoz). Ovoz ishlamasa ham
  // so'zlar ketma-ket yonadi va dars to'xtab qolmaydi.
  const say = useCallback((text, done) => {
    hush();
    const my = tokenRef.current;
    const clean = speakableText(text);
    setBubble(stripSpeechTags(text || ""));
    if (!clean) { done?.(); return; }
    const words = String(text || "").split(/\s+/).filter(Boolean);
    setSpeaking(true);
    const finish = () => { if (my !== tokenRef.current) return; setSpeaking(false); setWord(-1); audioRef.current = null; done?.(); };
    const fallback = () => {
      let i = 0;
      const tick = () => {
        if (my !== tokenRef.current) return;
        setWord(i);
        if (++i > words.length) { finish(); return; }
        setTimeout(tick, (260 + (words[i - 1] || "").length * 28) / rateRef.current);
      };
      tick();
    };
    try {
      const params = new URLSearchParams({ matn: clean.slice(0, 1500), jins });
      const audio = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?${params}`);
      audio.playbackRate = rateRef.current;
      audioRef.current = audio;
      audio.ontimeupdate = () => {
        if (my !== tokenRef.current || !audio.duration || !Number.isFinite(audio.duration)) return;
        setWord(Math.min(words.length - 1, Math.floor((audio.currentTime / audio.duration) * words.length)));
      };
      audio.onended = finish;
      let failed = false;
      audio.onerror = () => { if (!failed && my === tokenRef.current) { failed = true; fallback(); } };
      audio.play().catch(() => { if (!failed && my === tokenRef.current) { failed = true; fallback(); } });
    } catch { fallback(); }
  }, [apiBase, hush, jins]);

  useEffect(() => {
    const controller = new AbortController();
    hush(); setLoading(true); setError(""); setLesson(null); setIdx(-1); setMode("idle"); setPlaying(false);
    setVariant(null); setMenu(false); setAskReply(""); setScore(0); setTestIndex(0); setPicked(null);
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/dars_xonasi/${encodeURIComponent(topicCode)}?${new URLSearchParams({ token })}`, { signal: controller.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Dars yuklanmadi"); return d; })
      .then((d) => { setLesson(d); setBubble(__kbUi(lessonAudience(learnerRole, grade || d?.topic?.sinf) === "bogcha" ? "Salom, do‘stim! Men Kabutar qushchaman. Qani, boshladik!" : "Salom! «Darsni boshlash» tugmasini bosing — birga o‘rganamiz.")); })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); hush(); };
  }, [apiBase, token, topicCode, hush]);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate]);

  const go = useCallback((next, autoplay = playingRef.current) => {
    setMenu(false); setVariant(null); setAskReply(""); setFeedback(null); setAnswer("");
    if (next >= steps.length) {
      hush(); setPlaying(false); setStepFinished(true);
      if (kid) {   // REV91: bog'chada tugma bosilmaydi — dars tugashi bilan o'yin o'zi boshlanadi
        if (questions.length) { say(__kbUi("Barakalla! Endi o‘ynaymiz!"), () => { setMode("test"); setTestIndex(0); setScore(0); setPicked(null); }); setMode("bridge"); }
        else setMode("result");
        return;
      }
      // Dars tugadi: o'quvchi o'zi tanlaydi — shu yerda tezkor savollar yoki Test bo'limi.
      setMode("end");
      say(questions.length || onOpenTest
        ? __kbUi("Barakalla! Dars tugadi. Endi bilimingizni tekshiring: pastdan test turini tanlang.")
        : __kbUi("Barakalla! Dars tugadi."));
      return;
    }
    if (next < 0) return;
    setIdx(next); setMode("lesson"); setStepFinished(false);
    const s = steps[next];
    const cue = boardCues(s.doska, s.ovoz || s.doska);
    say(cue.spoken || s.doska, () => {
      setStepFinished(true);
      // «birga» va «amaliy» qadamida o'quvchi o'zi ishlaydi — dars shu yerda kutadi.
      if (autoplay && s.turi !== "birga" && s.turi !== "amaliy") setTimeout(() => { if (playingRef.current) go(next + 1, true); }, 1000);
    });
  }, [steps, questions.length, say, hush, onOpenTest, kid]);

  const startQuiz = () => {
    setMode("test"); setTestIndex(0); setScore(0); setPicked(null);
    say(__kbUi("Savolni o‘qing va javobni tanlang."));
  };
  const togglePlay = () => {
    if (mode === "result" || mode === "end") { setScore(0); setPlaying(true); go(0, true); return; }
    if (playing) { setPlaying(false); hush(); setStepFinished(true); return; }
    setPlaying(true);
    if (mode !== "lesson") go(0, true); else if (!variant) go(idx, true);
  };

  const openVariant = (v) => {
    setMenu(false); setVariant(v); say(v.ovoz || v.doska);
  };
  const dunno = () => {
    setPlaying(false); hush(); setMenu(true);
    const list = lesson?.variants?.[step?.id] || [];
    say(list.length ? __kbUi("Hechqisi yo‘q! Qaysi usulda qayta tushuntiray?") : __kbUi("Hechqisi yo‘q. Sekinroq qayta aytaman yoki AI ustozdan so‘raymiz."));
  };

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!step) return;
    if (checkAnswer(answer, step.javob)) {
      setFeedback({ ok: true, text: step.javob_izohi || __kbUi("To‘g‘ri!") });
      say(__kbUi("Barakalla, to‘g‘ri!") + " " + (step.javob_izohi || ""), () => { if (playingRef.current) setTimeout(() => go(idx + 1, true), 800); });
    } else {
      setFeedback({ ok: false, text: __kbUi("Yana bir bor urinib ko‘ring.") });
      say(__kbUi("Deyarli! Yana bir bor o‘ylab ko‘ring.") + (step.javob_izohi ? " " + __kbUi("Yordam: ") + step.javob_izohi : ""));
    }
  };

  const ask = async (text) => {
    const savol = (text ?? question).trim();
    if (!savol || asking) return;
    setAsking(true); setPlaying(false); hush(); setAskReply("");
    try {
      const r = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/ai/ustoz/sorash`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fan: fan || lesson?.topic?.fan || "", topic_code: topicCode, grade: grade || lesson?.topic?.sinf || undefined, rejim: "orgatish", savol }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "AI ustoz javob bermadi");
      const reply = (d.javob?.bloklar || []).map((b) => b.matn).filter(Boolean).join("\n\n") || __kbUi("Javob topilmadi.");
      setAskReply(reply); setQuestion(""); say(reply.slice(0, 900));
    } catch (e) { setAskReply(e.message); }
    finally { setAsking(false); }
  };

  const pick = (k) => {
    if (picked !== null) return;
    if (kid) {
      const q = questions[testIndex];
      setPicked(k);
      setHot(-1); setWaiting(false);
      const after = () => setTimeout(() => { if (modeRef.current === "test") nextQuestion(); }, 900);
      if (k === q.togri) { setScore((x) => x + 1); say(__kbUi("Barakalla! To‘g‘ri!") + " " + (q.izoh || ""), after); }
      else say(__kbUi("Hechqisi yo‘q! To‘g‘ri javob yashil rasmda.") + " " + (q.izoh || ""), after);
      return;
    }
    const q = questions[testIndex];
    setPicked(k);
    if (k === q.togri) { setScore((x) => x + 1); say(__kbUi("To‘g‘ri!"), () => setTimeout(() => nextQuestion(), 700)); }
    else say(q.izoh || __kbUi("Javob noto‘g‘ri. To‘g‘ri variant yashil bilan belgilandi."));
  };
  const nextQuestion = () => {
    setPicked(null);
    setTestIndex((i) => {
      if (i + 1 >= questions.length) { setMode("result"); return i; }
      return i + 1;
    });
  };
  const readQuestion = useCallback((qq) => {
    if (!qq) return;
    const opts = kidOptions(Object.fromEntries(qq.variantlar.map((o, k) => [`option_${"abcd"[k]}`, o])), qq.savol);
    const audio = opts.map((o, k) => ({ k, o })).filter(({ o }) => o.listen === "audio");
    setHot(-1); setWaiting(false);
    const next = (i) => {
      if (i >= audio.length) { setHot(-1); setWaiting(true); return; }
      setHot(audio[i].k);
      say(audio[i].o.speech, () => setTimeout(() => next(i + 1), 250));
    };
    say(qq.savol, () => setTimeout(() => next(0), 300));
  }, [say]);
  useEffect(() => {
    if (!kid || mode !== "test" || !questions[testIndex]) return;
    const t = setTimeout(() => readQuestion(questions[testIndex]), 300);
    return () => clearTimeout(t);
  }, [kid, mode, testIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  // REV91: bog'cha — dars o'zi boshlanadi; kunlik reja tugagan bo'lsa aytiladi. Faollik ota-onaga boradi.
  useEffect(() => {
    if (!kid || !lesson || mode !== "idle") return undefined;
    let stop = false;
    (async () => {
      const res = kidPlan ? await startLesson(apiBase, token, { darsKod: topicCode, fan: kidPlan.fan, mavzu: kidPlan.mavzu || lesson.topic?.mavzu, jamiQadam: steps.length })
        : { ok: true, tracked: false };
      if (stop) return;
      if (res.limit) { setLimitText(res.xabar); setMode("limit"); say(__kbUi("Bugungi yangi darslar tugadi. Ertaga yana o‘ynaymiz! Hozir o‘tilgan darslarni takrorlasang bo‘ladi.")); return; }
      if (res.tracked) kidTracker.start({ apiBase, token, darsKod: topicCode, isPlaying: () => playingRef.current || speakingRef.current || modeRef.current === "test" });
      setTimeout(() => { if (!stop && modeRef.current === "idle") { setPlaying(true); go(0, true); } }, 700);
    })();
    return () => { stop = true; };
  }, [kid, lesson]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (kid && idx >= 0) kidTracker.step(idx + 1); }, [kid, idx]);
  useEffect(() => () => { if (kidTracker.active() === topicCode) kidTracker.detach(); }, [topicCode]);
  useEffect(() => {
    if (!kid || mode !== "result") return;
    const local = !questions.length ? 1 : score / questions.length >= 0.7 ? 3 : score > 0 ? 2 : 1;
    markLessonDone(topicCode, local);
    setKidResult({ yulduz: local });
    const wasTracked = kidTracker.active() === topicCode;
    if (wasTracked) kidTracker.finish();
    (async () => {
      const res = wasTracked || kidPlan ? await finishLesson(apiBase, token, { darsKod: topicCode, togri: score, jami: questions.length }) : null;
      const out = { yulduz: res?.yulduz || local, bugunTugadi: Boolean(res?.bugun_tugadi), qoldi: res?.qoldi };
      setKidResult(out);
      onKidFinished?.(out, res?.reja || null);
    })();
    say(local === 3 ? __kbUi("Barakalla! Uchta yulduz! Sen zo‘rsan!") : __kbUi("Yaxshi harakat! Yana o‘ynasak, yulduzlar ko‘payadi!"));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (kid || mode !== "result" || !questions.length) return;
    const pass = score / questions.length >= 0.7;
    say(pass ? __kbUi("Barakalla! Siz mavzuni o‘zlashtirdingiz.") : __kbUi("Yaxshi harakat! Keling, asosiy qismni yana bir bor ko‘rib chiqamiz."));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="dx-status">{__kbUi("Dars yuklanmoqda…")}</div>;
  if (error) return <div className="dx-empty"><p>{__kbUi(error)}</p>{onChat && <button type="button" className="dx-btn dx-primary" onClick={onChat}>{__kbUi("AI ustoz bilan suhbatda o‘rganish")}</button>}</div>;

  const range = step ? sceneRange(steps, idx) : [];
  const list = lesson?.variants?.[step?.id] || [];
  const words = bubble.split(/\s+/).filter(Boolean);
  const q = mode === "test" ? questions[testIndex] : null;
  const pass = questions.length ? score / questions.length >= 0.7 : true;

  return <section className={`dx-root dx-aud-${audience} dx-theme-${theme}`} aria-label={__kbUi("Dars xonasi")}>
    <header className="dx-head">
      <div>
        <h2>{lesson.topic?.mavzu || topicCode}</h2>
        {!kid && <p>{[lesson.topic?.fan, lesson.topic?.sinf && (/^\d+$/.test(String(lesson.topic.sinf)) ? `${lesson.topic.sinf}-sinf` : String(lesson.topic.sinf)), lesson.topic?.daraja && `${__kbUi("Daraja")} ${lesson.topic.daraja} / 30`].filter(Boolean).join(" · ")}</p>}
      </div>
      <div className="dx-head-actions">
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("pdf")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ PDF")}</a>}
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("docx")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ Word")}</a>}
        {kid && questions.length > 0 && <span className="dx-chip dx-stars">⭐ {score}</span>}
        <span className="dx-chip">{mode === "test" ? __kbUi("Test") : `${Math.max(1, idx + 1)} / ${steps.length}`}</span>
      </div>
    </header>
    <div className="dx-steps" role="group" aria-label={__kbUi("Dars qadamlari")}>
      {steps.map((s, i) => <button key={s.id} type="button" aria-label={`${i + 1}`} onClick={() => { setPlaying(false); go(i, false); }}
        className={`dx-step ${i < idx || ["test", "result", "end"].includes(mode) ? "is-done" : i === idx ? "is-now" : ""}`} />)}
    </div>

    <div className="dx-room">
      <div className="dx-frame">
        <div className="dx-board" aria-live="polite">
          {mode === "idle" && <>
            <h3 className="dx-title">{__kbUi("Bugungi dars")}</h3>
            <div className="dx-line">{lesson.topic?.mavzu}</div>
            {lesson.topic?.maqsad && <div className="dx-line dx-small">{lesson.topic.maqsad}</div>}
            <div className="dx-line dx-small">{steps.length}{__kbUi(" qadam")}{questions.length ? ` · ${questions.length}${__kbUi(" ta savol")}` : ""}</div>
          </>}
          {mode === "lesson" && step && step.turi === "amaliy" && <>
            {step.sarlavha && <h3 className="dx-title"><BoardText text={step.sarlavha} /></h3>}
            <AmaliyDoska item={{ ...step, shart: step.doska, turi_nomi: step.turi_nomi }} say={say} hush={hush} mediaUrl={mediaUrl} />
          </>}
          {mode === "lesson" && step && step.turi !== "amaliy" && <>
            {steps[range[0]]?.sarlavha && <h3 className="dx-title"><BoardText text={steps[range[0]].sarlavha} /></h3>}
            <div className="dx-lines">
              {range.flatMap((i) => {
                const cue = boardCues(steps[i].doska, steps[i].ovoz || steps[i].doska);
                const shown = i === idx ? visibleLines(cue.cues, word, stepFinished || !speaking) : cue.lines.length;
                return cue.lines.slice(0, shown).map((line, n) => <div key={`${steps[i].id}-${n}`}
                  className={`dx-line ${i === idx ? "is-new" : ""} ${["qoida", "xulosa"].includes(steps[i].turi) ? "dx-rule" : ""}`}><BoardText text={line} /></div>);
              })}
            </div>
            {range.filter((i) => steps[i].rasm).map((i) => <img key={`img-${steps[i].id}`} className="dx-pic" src={mediaUrl(steps[i].rasm)} alt="" loading="lazy" />)}
            {/* REV89: til darsida bola iborani o'zi aytadi — mikrofon tanib, yulduz beradi */}
            {kid && practiceTarget(step) && <SpeakPractice phrase={practiceTarget(step).phrase} lang={practiceTarget(step).lang}
              onBefore={() => { setPlaying(false); hush(); }} say={say} />}
            {step.turi === "birga" && step.javob && <form className="dx-answer" onSubmit={submitAnswer}>
              <input value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label={__kbUi("Javobingiz")} placeholder={step.savol || __kbUi("Javob")} autoComplete="off" />
              <button type="submit" className="dx-btn dx-primary">{__kbUi("Tekshirish")}</button>
              {feedback && <span className={feedback.ok ? "dx-ok" : "dx-no"}>{feedback.text}</span>}
            </form>}
            {variant && <div className="dx-variant">
              <span className="dx-tag">{variant.nom}</span>
              {variant.doska && <div className="dx-variant-board"><BoardText text={variant.doska} /></div>}
              {variant.rasm && <img className="dx-pic" src={mediaUrl(variant.rasm)} alt="" loading="lazy" />}
              <p>{variant.ovoz}</p>
              <div className="dx-row">
                {variant.takrorlash_topic_code && onOpenTopic && <button type="button" className="dx-btn" onClick={() => onOpenTopic(variant.takrorlash_topic_code)}>{__kbUi("Mavzuni ochish")}{variant.takrorlash_nomi ? `: ${variant.takrorlash_nomi}` : ""}</button>}
                <button type="button" className="dx-btn dx-primary" onClick={() => { setVariant(null); setPlaying(true); go(idx + 1, true); }}>{__kbUi("Tushundim, davom etamiz")}</button>
                <button type="button" className="dx-btn" onClick={dunno}>{__kbUi("Boshqa usul")}</button>
              </div>
            </div>}
          </>}
          {mode === "test" && q && <div className="dx-test">
            <h3 className="dx-title">{__kbUi("Test")} · {testIndex + 1} / {questions.length}</h3>
            <div className="dx-q">{kid ? <span className="dx-listen-q"><ListenText text={q.savol} speak={say} /></span> : <BoardText text={stripSpeechTags(q.savol)} />}{kid && <button type="button" className="dx-listen" onClick={() => readQuestion(q)} aria-label={__kbUi("Qayta eshitish")}>🔊</button>}</div>
            {kid ? <div className={`dx-kid-opts dx-n${q.variantlar.length}`}>{kidOptions(Object.fromEntries(q.variantlar.map((o, k) => [`option_${"abcd"[k]}`, o])), q.savol).map((o, k) => <div key={k} className="dx-kid-wrap"><button type="button" onClick={() => pick(k)} disabled={picked !== null}
              className={picked === null ? `${hot === k ? "is-hot" : ""} ${waiting ? "is-waiting" : ""}` : k === q.togri ? "is-ok" : k === picked ? "is-no" : "is-dim"} style={{ "--i": k }}><span className="dx-kid-pic">{o.picture || (o.listen ? k + 1 : o.letter)}</span>{o.word && (!o.listen || picked !== null) && <span className="dx-kid-word">{o.word}</span>}</button>
</div>)}</div>
            : <div className="dx-opts">{q.variantlar.map((o, k) => <button key={k} type="button" onClick={() => pick(k)}
              className={picked === null ? "" : k === q.togri ? "is-ok" : k === picked ? "is-no" : ""}>{"ABCD"[k]}) <BoardText text={stripSpeechTags(o)} /></button>)}</div>}
            {picked !== null && !kid && picked !== q.togri && <div className="dx-why">{!kid && <p>{q.izoh}</p>}<button type="button" className="dx-btn dx-primary" onClick={nextQuestion}>{__kbUi(testIndex + 1 >= questions.length ? (kid ? "Yulduzlarni ko‘rish ⭐" : "Natija") : (kid ? "Keyingisi ➜" : "Keyingi savol"))}</button></div>}
          </div>}
          {mode === "end" && <div className="dx-test">
            <h3 className="dx-title">{__kbUi("Dars tugadi")}</h3>
            <p className="dx-why">{__kbUi("Bilimingizni tekshiring. Savollar shu mavzuning Test bazasidan olinadi.")}</p>
            <div className="dx-row">
              {questions.length > 0 && <button type="button" className="dx-btn dx-primary" onClick={startQuiz}>{__kbUi(`Shu yerda ${questions.length} ta savol`)}</button>}
              {onOpenTest && <button type="button" className="dx-btn" onClick={onOpenTest}>{__kbUi("Test bo‘limida to‘liq test")}</button>}
              <button type="button" className="dx-btn" onClick={() => { setPlaying(false); go(0, false); }}>{__kbUi("Darsni qaytadan ko‘rish")}</button>
              {nextLesson && <button type="button" className="dx-btn dx-next" onClick={() => { hush(); nextLesson.open(); }}>{__kbUi("Keyingi dars")}: {nextLesson.title} ➜</button>}
            </div>
            {!questions.length && !onOpenTest && <p className="dx-why">{__kbUi("Bu mavzu uchun Test bazasida savol hali yo‘q.")}</p>}
          </div>}
          {kid && mode === "bridge" && <div className="dx-kid-end"><span className="dx-kid-big" aria-hidden="true">🎮</span><h3 className="dx-title">{__kbUi("Endi o‘ynaymiz!")}</h3></div>}
          {kid && mode === "limit" && <div className="dx-kid-end">
            <span className="dx-kid-big" aria-hidden="true">🌙</span>
            <h3 className="dx-title">{__kbUi("Bugungi yangi darslar tugadi")}</h3>
            <p className="dx-kid-note">{__kbUi(limitText || "Yangi dars ertaga ochiladi. O‘tilgan darslarni takrorlash va o‘yinlar ochiq.")}</p>
            {onClose && <button type="button" className="dx-kid-go" onClick={() => { hush(); onClose(); }}>🏠 {__kbUi("Darslarga qaytish")}</button>}
          </div>}
          {kid && mode === "result" && <div className="dx-kid-end">
            <div className="dx-kid-stars" aria-label={`${kidResult?.yulduz || 1} ⭐`}>{[1, 2, 3].map((n) => <span key={n} className={n <= (kidResult?.yulduz || 1) ? "is-on" : ""} style={{ "--i": n }}>⭐</span>)}</div>
            {questions.length > 0 && <p className="dx-kid-note">{score} / {questions.length} ✓</p>}
            {nextLesson && !kidResult?.bugunTugadi
              ? <button type="button" className="dx-kid-go" onClick={() => { hush(); nextLesson.open(); }}>▶ {__kbUi("Keyingi dars")}</button>
              : <p className="dx-kid-note">🌙 {__kbUi("Bugungi darslar tugadi. Ertaga yangi dars ochiladi!")}</p>}
            <div className="dx-row">
              <button type="button" className="dx-btn" onClick={() => { setScore(0); setKidResult(null); setPlaying(true); go(0, true); }}>🔁 {__kbUi("Yana bir bor")}</button>
              {onClose && <button type="button" className="dx-btn" onClick={() => { hush(); onClose(); }}>🏠 {__kbUi("Darslar")}</button>}
            </div>
          </div>}
          {!kid && mode === "result" && <div className="dx-test">
            <h3 className="dx-title">{__kbUi("Natija")}</h3>
            {questions.length > 0 && <div className="dx-score">{score} / {questions.length}</div>}
            <p className="dx-why">{pass ? __kbUi("Zo‘r! Mavzu o‘zlashtirildi.") : __kbUi("Asosiy qismni yana bir bor ko‘rib chiqamiz.")}</p>
            <div className="dx-row">
              {!pass && <button type="button" className="dx-btn dx-primary" onClick={() => { setPlaying(false); go(Math.max(0, steps.findIndex((s) => s.turi === "qoida")), false); }}>{__kbUi("Qoidani qayta ko‘rish")}</button>}
              {onOpenTest && <button type="button" className="dx-btn" onClick={onOpenTest}>{__kbUi("To‘liq testni ishlash")}</button>}
              {nextLesson && <button type="button" className="dx-btn dx-next" onClick={() => { hush(); nextLesson.open(); }}>{__kbUi("Keyingi dars")}: {nextLesson.title} ➜</button>}
            </div>
          </div>}
        </div>
        <div className="dx-ledge" aria-hidden="true" />
      </div>

      <aside className={`dx-teacher ${speaking ? "is-speaking" : ""}`} aria-label={__kbUi("O‘qituvchi")}>
        <div className="dx-teacher-head">
          <div className="dx-avatar">{kid ? <span className="dx-bird" aria-hidden="true">🕊️</span> : <TeacherAvatar />}</div>
          <div><strong>{__kbUi(labels.teacher)}</strong><span className="dx-state"><i />{speaking ? __kbUi("Gapirmoqda…") : playing ? __kbUi("Tinglayapti") : __kbUi("Pauza")}</span></div>
        </div>
        <div className="dx-bubble">{words.map((w, i) => <span key={i} className={i === word ? "is-on" : ""}>{w} </span>)}</div>
        {!kid && <form className="dx-ask" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <label htmlFor={`dx-ask-${topicCode}`}>{__kbUi("O‘qituvchiga savol")}</label>
          <div className="dx-row"><input id={`dx-ask-${topicCode}`} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={__kbUi("Masalan: nega maxraj o‘zgarmaydi?")} disabled={asking} />
            <button type="submit" className="dx-btn" disabled={asking || !question.trim()}>{asking ? "…" : __kbUi("So‘rash")}</button></div>
          {askReply && <p className="dx-reply">{askReply}</p>}
        </form>}
        {lesson.manba?.kitob && <p className="dx-source">{__kbUi("Manba: ")}{lesson.manba.kitob}{lesson.auto ? __kbUi(" · kitob asosida avtomatik yig‘ilgan dars") : ""}</p>}
      </aside>
    </div>

    {menu && <div className="dx-menu" role="group" aria-label={__kbUi("Qayta tushuntirish usuli")}>
      <p>{__kbUi("Qaysi usulda qayta tushuntiray?")}</p>
      {list.map((v) => <button key={v.id} type="button" className="dx-btn" onClick={() => openVariant(v)}>{__kbUi(v.nom)}</button>)}
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); setRate(0.85); rateRef.current = 0.85; if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => setStepFinished(true)); } }}>{__kbUi("Sekinroq qayta ayt")}</button>
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); ask(`${__kbUi("Shu qismni tushunmadim, boshqacha tushuntiring")}: ${step?.doska || ""} ${step?.ovoz || ""}`.slice(0, 900)); }}>{__kbUi("AI ustozdan so‘rash")}</button>
    </div>}

    {!(kid && ["test", "result", "limit", "bridge"].includes(mode)) && <div className={`dx-controls ${kid ? "dx-kid-controls" : ""}`}>
      <button type="button" className="dx-btn dx-primary" disabled={mode === "test"} onClick={togglePlay}>{kid
        ? <KidIcon icon={playing ? "⏸️" : "▶️"} label={playing ? "Pauza" : "Davom"} />
        : playing ? __kbUi("❚❚ Pauza") : mode === "idle" ? __kbUi(labels.start) : mode === "result" || mode === "end" ? __kbUi("↺ Qaytadan") : __kbUi("▶ Davom etish")}</button>
      {!kid && <button type="button" className="dx-btn" disabled={idx <= 0 || mode !== "lesson"} onClick={() => { setPlaying(false); go(idx - 1, false); }}>{__kbUi("‹ Oldingi")}</button>}
      {!kid && <button type="button" className="dx-btn" disabled={mode !== "lesson"} onClick={() => go(idx + 1)}>{__kbUi("Keyingi ›")}</button>}
      <button type="button" className="dx-btn" disabled={!step && !variant} onClick={() => { if (variant) { say(variant.ovoz); return; } if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => setStepFinished(true)); } }}>{kid ? <KidIcon icon="🔁" label="Yana ayt" /> : __kbUi("↻ Qayta ayt")}</button>
      <button type="button" className="dx-btn dx-help" disabled={mode !== "lesson"} onClick={dunno}>{kid ? <KidIcon icon="🙋" label="Tushuntir" /> : __kbUi("Tushunmadim")}</button>
      <span className="dx-spacer" />
      {!kid && <label className="dx-speed">{__kbUi("Tezlik")}
        <select value={rate} onChange={(e) => setRate(Number(e.target.value))}>
          <option value={0.85}>{__kbUi("Sekin")}</option><option value={1}>{__kbUi("O‘rtacha")}</option><option value={1.2}>{__kbUi("Tez")}</option>
        </select>
      </label>}
    </div>}
  </section>;
}
