import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import AmaliyDoska, { BoardText } from "./AmaliyDoska.jsx";
import { boardCues, checkAnswer, lessonDownloadUrl, sceneRange, speakableText, visibleLines } from "./darsXonasiRules.js";
import { stripSpeechTags } from "../speech/language.js";
import { contentLanguage, kidCorrectSpeech, kidOptions } from "../test/kidQuizRules.js";
import { lessonAudience, audienceLabels } from "./lessonAudience.js";
import { markLessonDone } from "../curriculum/kidProgress.js";
import { KID_PITCH, kidRate, kidRepeatSpeech, kidTakrorStep, kidTaskModel } from "./kidLessonRules.js";
import { APP_VERSION } from "../appVersion.js";
import { answerSpeed, finishLesson, kidTracker, startLesson } from "../kid/kidActivity.js";
import { screenTime } from "../kid/screenTime.js";
import KidStage from "../kid/KidStage.jsx";
import { emojiPictures, isReviewQuestion, kabuMood, kabuSpeech, kindBadge, kindCue, pictureFor, stepActions, stepKind, stickerKeys } from "../kid/kidStageRules.js";
import { stickerUrl } from "../kid/stickers.js";
import { beep, chime, pop, soft } from "../kid/kidSounds.js";
import VoiceCheck from "./VoiceCheck.jsx";
import { voiceCheckItems } from "./voiceCheckRules.js";
import { speechRecognitionAvailable } from "../speech/speakRules.js";
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

/** REV98: test variantidagi so'z jonli rasmga mos kelsa — emoji o'rniga o'sha rasm. */
function kidOptionPic(o, rasmlar, mediaUrl, rasmSozlar = null) {
  // REV99/REV102: kitobdagi jonli rasm — avval emoji + so'z bo'yicha, keyin emoji; bo'lmasa so'zga mos ichki rasm
  const own = pictureFor(o?.picture, o?.word, rasmlar, rasmSozlar);
  if (own) return mediaUrl ? mediaUrl(own) : own;
  const key = stickerKeys(o?.word || "", 1)[0];
  return key ? stickerUrl(key) : null;
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
  const [limitKind, setLimitKind] = useState("");
  const [kidResult, setKidResult] = useState(null);
  // REV105: dars oxirida ovozli tekshiruv («Takrorlang!») — natija {togri, jami} yoki null.
  const [voice, setVoice] = useState(null);
  const voiceRef = useRef(null);
  voiceRef.current = voice;
  // REV98: robot Kabu — quvonish/dalda holati va sakrash; rasmni bosganda qayta jonlanadi.
  const [kidPhase, setKidPhase] = useState("");
  const [celebrate, setCelebrate] = useState(0);
  const [picRev, setPicRev] = useState(0);
  const phaseTimer = useRef(0);
  const audioRef = useRef(null);
  const kidRef = useRef(false);
  const gradeRef = useRef("");
  const tokenRef = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const speakingRef = useRef(false);
  speakingRef.current = speaking;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const prefetched = useRef(new Set());
  // REV103: savolga javob vaqti (ota-onaga «tezlik» ko'rsatkichi): savol o'qilib, variantlar ko'rsatilgandan — bosilgunicha.
  const questionDone = useRef(0);
  const askedAt = useRef(0);
  const answerTimes = useRef([]);

  // REV80: dars maydoni tinglovchiga moslashadi — bog'cha bolasi, o'quvchi, talaba.
  const audience = lessonAudience(learnerRole, grade || lesson?.topic?.sinf);
  const kid = audience === "bogcha";
  kidRef.current = kid;
  gradeRef.current = grade || lesson?.topic?.sinf || "";
  const labels = audienceLabels(audience);
  const theme = learnerGender === "qiz" ? "girl" : learnerGender === "ogil" ? "boy" : "neutral";
  const steps = useMemo(() => lesson?.steps || [], [lesson]);
  const step = idx >= 0 ? steps[idx] : null;
  // REV102: har qadam turi — takror (o'tgan darslar) yoki yangi bilim; bolaga belgi, rang va ovoz bilan ko'rsatiladi.
  const kinds = useMemo(() => steps.reduce((out, s, i) => {
    // uzun tushuntirish bo'laklarga bo'linsa, keyingi bo'lak sarlavhasiz keladi — oldingisining turini oladi
    const prev = steps[i - 1];
    out.push(prev && !s.sarlavha && s.sahna && s.sahna === prev.sahna ? out[i - 1] : stepKind(s, lesson?.topic?.mavzu));
    return out;
  }, []), [steps, lesson]);
  // Shu darsda o'rgatiladigan yangi so'zlarning rasmlari — o'yin qadamida o'tgan darslar rasmi chiqmasin.
  const newPics = useMemo(() => {
    const out = new Set();
    steps.forEach((s, i) => {
      if (kinds[i] !== "new") return;
      if (s.rasm) out.add(s.rasm);
      emojiPictures(s.doska, lesson?.rasmlar, lesson?.rasm_sozlar).forEach((u) => out.add(u));
    });
    return out;
  }, [steps, kinds, lesson]);
  const questions = lesson?.savollar || [];
  const voiceItems = useMemo(() => (lesson ? voiceCheckItems(lesson, audience) : []), [lesson, audience]);
  const voiceReady = voiceItems.length > 0 && speechRecognitionAvailable(globalThis);
  const downloadUrl = (format) => lessonDownloadUrl(apiBase, token, topicCode, format);
  const mediaUrl = useCallback((url) => (!url ? null : url.startsWith("/") ? `${String(apiBase).replace(/\/+$/, "")}${url}` : url), [apiBase]);

  const hush = useCallback(() => {
    tokenRef.current += 1;
    const audio = audioRef.current; audioRef.current = null;
    if (audio) { try { audio.pause(); audio.src = ""; } catch { /* already released */ } }
    setSpeaking(false); setWord(-1);
  }, []);

  // O'qituvchi ovozi: serverdagi TTS (/api/ovoz). REV102: ovoz yuklanmasa bir marta qayta so'raladi
  // (server uzilgan bo'lakni qayta yaratadi); baribir bo'lmasa so'zlar jim yonadi va dars to'xtab qolmaydi.
  // takror — bog'chada so'z o'rgatish qadami: «Men bilan ayt: Green» dan keyin bolaga 1.5–3 soniya vaqt.
  const ovozUrl = useCallback((clean, takror = false, attempt = 0) => {
    const params = new URLSearchParams({ matn: clean.slice(0, 1500), jins,
      ...(kidRef.current ? { tezlik: kidRate(gradeRef.current), ohang: KID_PITCH } : {}),
      ...(takror ? { takror: "1" } : {}), ...(attempt ? { q: String(attempt) } : {}) });
    return `${String(apiBase).replace(/\/+$/, "")}/api/ovoz?${params}`;
  }, [apiBase, jins]);
  const spokenFor = useCallback((text) => speakableText(kidRef.current ? kabuSpeech(text) : text), []);
  // Keyingi qadam ovozi oldindan tayyorlanadi — server uni keshlaydi, bola kutmaydi.
  const prefetch = useCallback((text, takror = false) => {
    const clean = spokenFor(text);
    if (!clean.replace(/⏸/g, "").trim()) return;
    const url = ovozUrl(clean, takror);
    if (prefetched.current.has(url)) return;
    prefetched.current.add(url);
    try { fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => {}); } catch { /* eski brauzer */ }
  }, [ovozUrl, spokenFor]);
  const say = useCallback((text, done, opts = {}) => {
    hush();
    const my = tokenRef.current;
    if (kidRef.current) text = kabuSpeech(text);   // REV98: bog'chada ustoz — robot Kabu
    const clean = speakableText(text);
    setBubble(stripSpeechTags(text || "").replace(/\s*⏸\s*/g, " ").trim());
    if (!clean.replace(/⏸/g, "").trim()) { done?.(); return; }
    const words = String(text || "").replace(/⏸/g, " ").split(/\s+/).filter(Boolean);
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
    const play = (attempt) => {
      let audio;
      try { audio = new Audio(ovozUrl(clean, opts.takror, attempt)); } catch { fallback(); return; }
      audio.playbackRate = rateRef.current;
      audioRef.current = audio;
      let started = false, failed = false;
      const fail = (err) => {
        if (failed || my !== tokenRef.current) return;
        failed = true; clearTimeout(stall);
        if (started) { finish(); return; }   // yarmida uzildi — boshidan takrorlamaymiz, darsni davom ettiramiz
        try { audio.pause(); audio.src = ""; } catch { /* allaqachon yopilgan */ }
        if (attempt < 1 && err?.name !== "NotAllowedError") play(attempt + 1); else fallback();
      };
      const stall = setTimeout(() => { if (!started) fail(); }, 15000);
      audio.onplaying = () => { started = true; clearTimeout(stall); };
      audio.ontimeupdate = () => {
        if (my !== tokenRef.current || !audio.duration || !Number.isFinite(audio.duration)) return;
        setWord(Math.min(words.length - 1, Math.floor((audio.currentTime / audio.duration) * words.length)));
      };
      audio.onended = () => { clearTimeout(stall); finish(); };
      audio.onerror = () => fail();
      audio.play().catch((err) => fail(err));
    };
    play(0);
  }, [hush, ovozUrl]);

  // Qadamda aytiladigan gap (go() va oldindan yuklash uchun bir xil — server keshi mos tushadi).
  const stepSpeech = useCallback((s, i) => {
    const cue = boardCues(s.doska, s.ovoz || s.doska);
    if (!kid) return cue.spoken || s.doska;
    // REV95: eski yuklangan kitoblarda qolgan «yechimni keyin ochasiz» — bog'cha bolasiga aytilmaydi.
    const spoken = String(cue.spoken || s.doska).replace(/\s*Avval o['‘’]zingiz bajarib ko['‘’]ring, yechimni keyin ochasiz\.?/g, "");
    // REV102: takrordan yangiga o'tishda robot aytadi: «Avval o'tganlarni eslaymiz!» / «Endi — yangi so'z!»
    const lead = kindCue(kinds[i], i > 0 ? kinds[i - 1] : "", spoken, lesson?.topic?.mavzu);
    return kidRepeatSpeech(lead ? `${lead} ${spoken}` : spoken);   // «Qani, birga aytamiz!» dan keyin so'zlar pauza bilan
  }, [kid, kinds, lesson]);

  useEffect(() => {
    const controller = new AbortController();
    hush(); setLoading(true); setError(""); setLesson(null); setIdx(-1); setMode("idle"); setPlaying(false);
    setVariant(null); setMenu(false); setAskReply(""); setScore(0); setTestIndex(0); setPicked(null);
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/dars_xonasi/${encodeURIComponent(topicCode)}?${new URLSearchParams({ token })}`, { signal: controller.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Dars yuklanmadi"); return d; })
      .then((d) => { setLesson(d); setBubble(__kbUi(lessonAudience(learnerRole, grade || d?.topic?.sinf) === "bogcha" ? "Salom, do‘stim! Men robot Kabuman. Qani, boshladik!" : "Salom! «Darsni boshlash» tugmasini bosing — birga o‘rganamiz.")); })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); hush(); };
  }, [apiBase, token, topicCode, hush]);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate]);

  const go = useCallback((next, autoplay = playingRef.current) => {
    setMenu(false); setVariant(null); setAskReply(""); setFeedback(null); setAnswer("");
    if (next >= steps.length) {
      hush(); setPlaying(false); setStepFinished(true);
      // REV105: avval ovozli tekshiruv — ustoz aytadi, mikrofon yoqiladi, takrorlanadi; keyin odatdagi davom.
      if (voiceReady && !voiceRef.current) { setMode("ovoz"); return; }
      afterLessonRef.current();
      return;
    }
    if (next < 0) return;
    if (next === 0) { voiceRef.current = null; setVoice(null); }   // dars qaytadan — tekshiruv ham qaytadan
    setIdx(next); setMode("lesson"); setStepFinished(false);
    runStepRef.current(next, autoplay);
  }, [steps, hush, voiceReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterLesson = () => {
    {
      if (kid) {   // REV91: bog'chada tugma bosilmaydi — dars tugashi bilan o'yin o'zi boshlanadi
        answerTimes.current = [];
        if (questions.length) { say(__kbUi("Barakalla! Endi o‘ynaymiz!"), () => { setMode("test"); setTestIndex(0); setScore(0); setPicked(null); }); setMode("bridge"); }
        else setMode("result");
        return;
      }
      // Dars tugadi: o'quvchi o'zi tanlaydi — shu yerda tezkor savollar yoki Test bo'limi.
      setMode("end");
      say(questions.length || onOpenTest
        ? __kbUi("Barakalla! Dars tugadi. Endi bilimingizni tekshiring: pastdan test turini tanlang.")
        : __kbUi("Barakalla! Dars tugadi."));
    }
  };
  const afterLessonRef = useRef(afterLesson);
  afterLessonRef.current = afterLesson;
  const voiceDone = (sum) => { setVoice(sum || { togri: 0, jami: 0 }); voiceRef.current = sum || { togri: 0, jami: 0 }; afterLesson(); };

  const runStep = (next, autoplay) => {
    const s = steps[next];
    const spoken = stepSpeech(s, next);
    [next + 1, next + 2].forEach((j) => { if (steps[j]) prefetch(stepSpeech(steps[j], j), kid && kidTakrorStep(steps[j])); });
    if (kid && next > 0 && kinds[next] !== kinds[next - 1]) { if (kinds[next] === "new") chime(); else if (kinds[next] === "review") soft(); }
    say(spoken, () => {
      setStepFinished(true);
      // «birga» va «amaliy» qadamida o'quvchi o'zi ishlaydi — dars shu yerda kutadi.
      if (autoplay && kid && s.turi === "amaliy") {
        // REV93: bog'chada topshiriq (qo'shiq, harakat, o'yin) — bolaga bajarishga vaqt, keyin maqtov va davom. Tugma kerak emas.
        // Bajarganini tekshirib bo'lmaydi — shuning uchun «Barakalla» demaymiz, to'g'ri javobni birga aytamiz.
        const praise = kidTaskModel(s.ovoz || s.doska);
        setTimeout(() => { if (playingRef.current && idxRef.current === next) say(praise, () => setTimeout(() => { if (playingRef.current && idxRef.current === next) go(next + 1, true); }, 900)); }, 4000);
        return;
      }
      // So'z o'rgatiladigan qadam («Men bilan takrorla») — bola qaytarib aytishi uchun biroz ko'proq kutiladi.
      const pause = kid && /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(s.ovoz || "") ? 2600 : 1000;
      if (autoplay && s.turi !== "birga" && s.turi !== "amaliy") setTimeout(() => { if (playingRef.current && idxRef.current === next) go(next + 1, true); }, pause);
    }, { takror: kid && kidTakrorStep(s) });
  };
  const runStepRef = useRef(runStep);
  runStepRef.current = runStep;

  const startQuiz = () => {
    answerTimes.current = [];
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
    if (kid) {   // REV98: bog'cha bolasi menyuni o'qiy olmaydi — robot o'zi boshqacha (sekinroq) qayta tushuntiradi
      const first = (lesson?.variants?.[step?.id] || [])[0];
      setPlaying(false); setRate(0.85); rateRef.current = 0.85; setPicRev((r) => r + 1);
      if (first) { setVariant(first); say(first.ovoz || first.doska, () => { setVariant(null); setPlaying(true); go(idx + 1, true); }); return; }
      if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => { setStepFinished(true); setPlaying(true); go(idx + 1, true); }); }
      return;
    }
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

  // REV98: robot bir lahza quvonadi (sakraydi, yulduz sochadi) yoki dalda beradi.
  const flashPhase = useCallback((ph, ms = 1800) => {
    clearTimeout(phaseTimer.current);
    setKidPhase(ph);
    if (ph === "happy") { setCelebrate((c) => c + 1); chime(); } else if (ph === "enc") soft();
    phaseTimer.current = setTimeout(() => setKidPhase(""), ms);
  }, []);
  useEffect(() => () => clearTimeout(phaseTimer.current), []);
  const pick = (k) => {
    if (picked !== null) return;
    if (kid) {
      const q = questions[testIndex];
      const from = askedAt.current || questionDone.current;   // savol o'qilayotganda bosilgani — tezlikka kirmaydi
      if (from) answerTimes.current.push(Date.now() - from);
      askedAt.current = 0; questionDone.current = 0;
      setPicked(k);
      setHot(-1); setWaiting(false);
      const after = () => setTimeout(() => { if (modeRef.current === "test") nextQuestion(); }, 900);
      // REV102: til darsida maqtov o'sha tilda («Well done!»)
      if (k === q.togri) { setScore((x) => x + 1); flashPhase("happy"); say(kidCorrectSpeech(testIndex, contentLanguage(q.savol, q.variantlar), q.izoh) || __kbUi("Barakalla! To‘g‘ri!"), after); }
      else { flashPhase("enc"); say(__kbUi("Hechqisi yo‘q! To‘g‘ri javob yashil rasmda.") + " " + (q.izoh || ""), after); }
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
    askedAt.current = 0; questionDone.current = 0;
    const next = (i) => {
      if (i >= audio.length) { setHot(-1); setWaiting(true); askedAt.current = Date.now(); return; }
      setHot(audio[i].k);
      say(audio[i].o.speech, () => setTimeout(() => next(i + 1), 250));
    };
    say(qq.savol, () => { questionDone.current = Date.now(); setTimeout(() => next(0), 300); });
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
      const today = screenTime.current();
      const res = kidPlan ? await startLesson(apiBase, token, { darsKod: topicCode, fan: kidPlan.fan, mavzu: kidPlan.mavzu || lesson.topic?.mavzu, jamiQadam: steps.length })
        : today?.tugadi?.dars && !today.kuzatilmaydi   // REV103: reja tashqarisidan ochilgan dars ham dars vaqti tugagan bo'lsa ochilmaydi
          ? { ok: false, limit: true, vaqt: true, xabar: __kbUi("Bugungi dars vaqti tugadi. Barakalla! Endi biroz o‘ynasang bo‘ladi.") }
          : { ok: true, tracked: false };
      if (stop) return;
      if (res.limit) {
        setLimitText(res.xabar); setLimitKind(res.vaqt ? "vaqt" : "limit"); setMode("limit");
        // REV103: bugungi dars VAQTI tugagan — robot shuni aytadi (o'yin vaqti bo'lsa, o'yinlar ochiq)
        say(res.vaqt ? (res.xabar || __kbUi("Bugungi dars vaqti tugadi. Endi biroz o‘ynasang bo‘ladi."))
          : __kbUi("Bugungi yangi darslar tugadi. Ertaga yana o‘ynaymiz! Hozir o‘tilgan darslarni takrorlasang bo‘ladi."));
        return;
      }
      if (res.tracked) kidTracker.start({ apiBase, token, darsKod: topicCode, isPlaying: () => playingRef.current || speakingRef.current || modeRef.current === "test" || modeRef.current === "ovoz" });
      setTimeout(() => { if (!stop && modeRef.current === "idle") { beep(); setPlaying(true); go(0, true); } }, 700);
    })();
    return () => { stop = true; };
  }, [kid, lesson]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (kid && idx >= 0) kidTracker.step(idx + 1); }, [kid, idx]);
  // REV103: kunlik vaqt — ota-ona «nima qildi» ro'yxatida dars nomi; dars ketayotganda vaqt tugasa, tugatib olishiga imkon;
  // to'liq tugaganda (10 daqiqadan keyin) ovoz to'xtaydi.
  useEffect(() => {
    if (!kid || !lesson) return undefined;
    screenTime.setDetail(`Dars: «${lesson.topic?.mavzu || topicCode}»`);
    return () => screenTime.setDetail("");
  }, [kid, lesson, topicCode]);
  useEffect(() => { if (kid) screenTime.setBusy("dars", ["lesson", "test", "bridge", "ovoz"].includes(mode)); }, [kid, mode]);
  useEffect(() => () => screenTime.setBusy("dars", false), []);
  useEffect(() => screenTime.onBlock((view) => {
    hush(); setPlaying(false);
    // vaqt to'liq tugadi (10 daqiqalik kutishdan keyin) — dars shu yerda yopiladi, qayta ochilsa ham davom etmaydi
    if (kidRef.current && (view === "dars" || view === "jami") && ["idle", "lesson", "test", "bridge", "ovoz"].includes(modeRef.current)) {
      setLimitText(__kbUi(view === "jami" ? "Bugun vaqting tugadi. Ertaga uchrashamiz!" : "Bugungi dars vaqti tugadi. Endi biroz o‘ynasang bo‘ladi."));
      setLimitKind("vaqt"); setMode("limit");
    }
  }), [hush]);
  useEffect(() => () => { if (kidTracker.active() === topicCode) kidTracker.detach(); }, [topicCode]);
  // REV106: dars boshlangach — faqat dars: butun ekran, menyular, yon panel va yordamchilar yashiriladi.
  const focus = ["lesson", "ovoz", "test", "bridge", "end", "result", "limit"].includes(mode);
  useEffect(() => {
    document.body.classList.toggle("kb-focus-dars", focus);
    return () => document.body.classList.remove("kb-focus-dars");
  }, [focus]);
  useEffect(() => {
    if (!focus) return undefined;
    const key = (e) => { if (e.key === "Escape" && !kidRef.current) exitRef.current?.(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [focus]);
  const exitLesson = () => {
    hush(); setPlaying(false); setMenu(false); setVariant(null);
    if (kid && onClose) { onClose(); return; }
    setMode("idle"); setIdx(-1);
    setBubble(__kbUi(kid ? "Yana o‘ynaymizmi? ▶ ni bos!" : "Dars to‘xtatildi. «Darsni boshlash» bilan qaytadan boshlang."));
  };
  const exitRef = useRef(exitLesson);
  exitRef.current = exitLesson;
  useEffect(() => {
    if (!kid || mode !== "result") return;
    const local = !questions.length ? 1 : score / questions.length >= 0.7 ? 3 : score > 0 ? 2 : 1;
    markLessonDone(topicCode, local);
    setKidResult({ yulduz: local });
    const wasTracked = kidTracker.active() === topicCode;
    if (wasTracked) kidTracker.finish();
    (async () => {
      const res = wasTracked || kidPlan ? await finishLesson(apiBase, token, { darsKod: topicCode, togri: score, jami: questions.length, ortachaMs: answerSpeed(answerTimes.current), ovozTogri: voiceRef.current?.togri || 0, ovozJami: voiceRef.current?.jami || 0 }) : null;
      const out = { yulduz: res?.yulduz || local, bugunTugadi: Boolean(res?.bugun_tugadi), qoldi: res?.qoldi };
      setKidResult(out);
      onKidFinished?.(out, res?.reja || null);
    })();
    flashPhase("happy", 3200);
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
  // REV98: bog'cha sahnasi — yozuv yo'q: robot, jonli rasm va harakat belgilari.
  const kidSrc = kid && step ? `${step.ovoz || ""} ${step.doska || ""}` : "";
  const kidActs = kid && step && mode === "lesson" ? stepActions(kidSrc) : [];
  const kidKind = kid && mode === "lesson" ? kinds[idx] || "" : "";
  const kidPics = (() => {
    if (!kid || !step || mode !== "lesson") return [];
    const pic = (u, i) => ({ src: mediaUrl(u), rev: picRev, label: `rasm ${i + 1}` });
    if (variant?.rasm) return [pic(variant.rasm, 0)];
    // REV99: doskadagi emojilar (masalan «Top-chi» o'yini: 👋 🙋 🐱) → kitobdagi jonli rasmlar, bosib o'ynaladi
    const board = emojiPictures(step.doska, lesson?.rasmlar, lesson?.rasm_sozlar);
    if (kidKind === "game") {
      // REV102: yangi darsdagi o'yinda faqat shu darsda o'rgatilgan so'zlarning rasmlari (o'tgan darslar rasmi chalg'itardi)
      const mine = board.filter((u) => newPics.has(u));
      const list = (mine.length ? mine : [...newPics]).slice(0, 3);
      if (list.length) return list.map(pic);
    } else if (board.length >= 2) {
      return board.slice(0, 3).map(pic);   // bir qadamda 2–3 so'z («🟢 Green, 👏 Clap») — hammasining rasmi
    }
    if (step.rasm) return [pic(step.rasm, 0)];
    if (board.length) return board.slice(0, 3).map(pic);
    if (kidKind !== "new") return [];   // kirish, xulosa, takror, o'yin — begona stiker chiqmaydi
    return stickerKeys(kidSrc).map((key) => ({ src: stickerUrl(key), svg: true, key, label: key, rev: picRev })).filter((x) => x.src);
  })();
  const badge = kindBadge(kidKind);
  const kidMood = kidPhase || (mode === "idle" || mode === "bridge" ? "wave" : speaking ? kabuMood(step, "speaking") : mode === "lesson" ? kabuMood(step, "waiting") : mode === "result" ? "happy" : "");
  const STICKER_SAY = { hello: "Hello!", red: "Red!", three: "Three!", big: "Big!", small: "Small!", cat: "Cat!", apple: "Apple!", jump: "I can jump!" };
  const tapKid = (i) => {
    const p = kidPics[i];
    setPicRev((r) => r + 1); pop(); flashPhase("happy", 1400);
    if (speakingRef.current) return;   // ustoz gapirayotgan bo'lsa — faqat quvonadi, darsni bo'lmaydi
    const en = [...String(step?.ovoz || "").matchAll(/\[en\][\s\S]*?\[\/en\]/gi)].map((m) => m[0]).slice(0, 2).join(" ");
    say(p?.key ? `[en]${STICKER_SAY[p.key]}[/en]` : en || __kbUi("Barakalla!"));
  };

  return <section className={`dx-root dx-aud-${audience} dx-theme-${theme} ${focus ? "dx-focus" : ""}`} aria-label={__kbUi("Dars xonasi")}>
    <header className="dx-head">
      {focus && <button type="button" className="dx-exit" onClick={exitLesson} aria-label={__kbUi("Darsni yopish")} title={__kbUi("Darsni yopish")}>{kid ? "🏠" : "✕"}</button>}
      <div>
        <h2>{lesson.topic?.mavzu || topicCode}</h2>
        {!kid && <p>{[lesson.topic?.fan, lesson.topic?.sinf && (/^\d+$/.test(String(lesson.topic.sinf)) ? `${lesson.topic.sinf}-sinf` : String(lesson.topic.sinf)), lesson.topic?.daraja && `${__kbUi("Daraja")} ${lesson.topic.daraja} / 30`].filter(Boolean).join(" · ")}</p>}
      </div>
      <div className="dx-head-actions">
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("pdf")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ PDF")}</a>}
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("docx")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ Word")}</a>}
        {kid && questions.length > 0 && <span className="dx-chip dx-stars">⭐ {score}</span>}
        <span className="dx-chip">{mode === "test" ? __kbUi("Test") : mode === "ovoz" ? "🎤" : `${Math.max(1, idx + 1)} / ${steps.length}`}</span>
      </div>
    </header>
    <div className="dx-steps" role="group" aria-label={__kbUi("Dars qadamlari")}>
      {steps.map((s, i) => <button key={s.id} type="button" aria-label={`${i + 1}`} onClick={() => { setPlaying(false); go(i, false); }}
        className={`dx-step ${i < idx || ["test", "result", "end", "ovoz"].includes(mode) ? "is-done" : i === idx ? "is-now" : ""} ${kid ? `k-${kinds[i]}` : ""}`} />)}
    </div>

    <div className="dx-room">
      <div className="dx-frame">
        <div className="dx-board" aria-live="polite">
          {kid && badge && <div className={`dx-kind is-${kidKind}`} role="status"><span aria-hidden="true">{badge[0]}</span><small>{__kbUi(badge[1])}</small></div>}
          {kid && ["idle", "lesson", "bridge"].includes(mode) && <div className={`dx-kind-frame k-${kidKind || "none"}`}><KidStage mood={kidMood} celebrate={celebrate} pictures={kidPics} actions={kidActs} speaking={speaking} onTap={tapKid} /></div>}
          {!kid && mode === "idle" && <>
            <h3 className="dx-title">{__kbUi("Bugungi dars")}</h3>
            <div className="dx-line">{lesson.topic?.mavzu}</div>
            {lesson.topic?.maqsad && <div className="dx-line dx-small">{lesson.topic.maqsad}</div>}
            <div className="dx-line dx-small">{steps.length}{__kbUi(" qadam")}{questions.length ? ` · ${questions.length}${__kbUi(" ta savol")}` : ""}</div>
          </>}
          {!kid && mode === "lesson" && step && step.turi === "amaliy" && <>
            {step.sarlavha && <h3 className="dx-title"><BoardText text={step.sarlavha} /></h3>}
            <AmaliyDoska item={{ ...step, shart: step.doska, turi_nomi: step.turi_nomi }} say={say} hush={hush} mediaUrl={mediaUrl} kid={kid} />
          </>}
          {!kid && mode === "lesson" && step && step.turi !== "amaliy" && <>
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
          {mode === "ovoz" && <VoiceCheck key={topicCode} items={voiceItems} audience={audience} say={say} hush={hush} speaking={speaking} onDone={voiceDone} />}
          {mode === "test" && q && <div className="dx-test">
            {kid && isReviewQuestion(q) && <div className="dx-kind is-review" role="status"><span aria-hidden="true">🔁</span><small>{__kbUi("Takrorlash")}</small></div>}
            {kid ? <div className="dx-kid-ask"><KidStage compact mood={kidPhase || (speaking ? "talk" : "think")} celebrate={celebrate} speaking={speaking} />
              <button type="button" className="dx-listen dx-listen-big" onClick={() => readQuestion(q)} aria-label={__kbUi("Qayta eshitish")}>🔊</button></div>
              : <><h3 className="dx-title">{__kbUi("Test")} · {testIndex + 1} / {questions.length}</h3>
                <div className="dx-q"><BoardText text={stripSpeechTags(q.savol)} /></div></>}
            {kid ? <div className={`dx-kid-opts dx-n${q.variantlar.length}`}>{kidOptions(Object.fromEntries(q.variantlar.map((o, k) => [`option_${"abcd"[k]}`, o])), q.savol).map((o, k) => <div key={k} className="dx-kid-wrap"><button type="button" onClick={() => pick(k)} disabled={picked !== null}
              className={picked === null ? `${hot === k ? "is-hot" : ""} ${waiting ? "is-waiting" : ""}` : k === q.togri ? "is-ok" : k === picked ? "is-no" : "is-dim"} style={{ "--i": k }}>{kidOptionPic(o, lesson?.rasmlar, mediaUrl, lesson?.rasm_sozlar) ? <img className="dx-kid-img" src={kidOptionPic(o, lesson?.rasmlar, mediaUrl, lesson?.rasm_sozlar)} alt="" draggable="false" /> : <span className="dx-kid-pic">{o.picture || (o.listen ? k + 1 : o.letter)}</span>}</button>
</div>)}</div>
            : <div className="dx-opts">{q.variantlar.map((o, k) => <button key={k} type="button" onClick={() => pick(k)}
              className={picked === null ? "" : k === q.togri ? "is-ok" : k === picked ? "is-no" : ""}>{"ABCD"[k]}) <BoardText text={stripSpeechTags(o)} /></button>)}</div>}
            {picked !== null && !kid && picked !== q.togri && <div className="dx-why">{!kid && <p>{q.izoh}</p>}<button type="button" className="dx-btn dx-primary" onClick={nextQuestion}>{__kbUi(testIndex + 1 >= questions.length ? (kid ? "Yulduzlarni ko‘rish ⭐" : "Natija") : (kid ? "Keyingisi ➜" : "Keyingi savol"))}</button></div>}
          </div>}
          {mode === "end" && <div className="dx-test">
            <h3 className="dx-title">{__kbUi("Dars tugadi")}</h3>
            {voice?.jami > 0 && <p className="dx-voice-score">🎤 {__kbUi("Ovozli tekshiruv")}: {voice.togri} / {voice.jami}</p>}
            <p className="dx-why">{__kbUi("Bilimingizni tekshiring. Savollar shu mavzuning Test bazasidan olinadi.")}</p>
            <div className="dx-row">
              {questions.length > 0 && <button type="button" className="dx-btn dx-primary" onClick={startQuiz}>{__kbUi(`Shu yerda ${questions.length} ta savol`)}</button>}
              {onOpenTest && <button type="button" className="dx-btn" onClick={onOpenTest}>{__kbUi("Test bo‘limida to‘liq test")}</button>}
              {voiceReady && <button type="button" className="dx-btn" onClick={() => { hush(); setVoice(null); voiceRef.current = null; setMode("ovoz"); }}>🎤 {__kbUi("Ovozli tekshiruvni qayta o‘tish")}</button>}
              <button type="button" className="dx-btn" onClick={() => { setPlaying(false); go(0, false); }}>{__kbUi("Darsni qaytadan ko‘rish")}</button>
              {nextLesson && <button type="button" className="dx-btn dx-next" onClick={() => { hush(); nextLesson.open(); }}>{__kbUi("Keyingi dars")}: {nextLesson.title} ➜</button>}
            </div>
            {!questions.length && !onOpenTest && <p className="dx-why">{__kbUi("Bu mavzu uchun Test bazasida savol hali yo‘q.")}</p>}
          </div>}
          {kid && mode === "limit" && <div className="dx-kid-end">
            <span className="dx-kid-big" aria-hidden="true">{limitKind === "vaqt" ? "⏰" : "🌙"}</span>
            <h3 className="dx-title">{__kbUi(limitKind === "vaqt" ? "Bugungi dars vaqti tugadi" : "Bugungi yangi darslar tugadi")}</h3>
            <p className="dx-kid-note">{__kbUi(limitText || "Yangi dars ertaga ochiladi. O‘tilgan darslarni takrorlash va o‘yinlar ochiq.")}</p>
            {onClose && <button type="button" className="dx-kid-go" onClick={() => { hush(); onClose(); }}>🏠 {__kbUi("Darslarga qaytish")}</button>}
          </div>}
          {kid && mode === "result" && <div className="dx-kid-end">
            <KidStage compact mood={kidMood} celebrate={celebrate} speaking={speaking} />
            <div className="dx-kid-stars" aria-label={`${kidResult?.yulduz || 1} ⭐`}>{[1, 2, 3].map((n) => <span key={n} className={n <= (kidResult?.yulduz || 1) ? "is-on" : ""} style={{ "--i": n }}>⭐</span>)}</div>
            {questions.length > 0 && <p className="dx-kid-note">{score} / {questions.length} ✓</p>}
            {voice?.jami > 0 && <p className="dx-kid-note">🎤 {voice.togri} / {voice.jami}</p>}
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
            {voice?.jami > 0 && <p className="dx-voice-score">🎤 {__kbUi("Ovozli tekshiruv")}: {voice.togri} / {voice.jami}</p>}
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

      {!kid && <aside className={`dx-teacher ${speaking ? "is-speaking" : ""}`} aria-label={__kbUi("O‘qituvchi")}>
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
        {lesson.manba?.kitob && <p className="dx-source">{__kbUi("Manba: ")}{lesson.manba.kitob}{lesson.auto ? __kbUi(" · kitob asosida avtomatik yig‘ilgan dars") : ""} · {APP_VERSION}</p>}
      </aside>}
    </div>

    {kid && <p className="dx-kid-ver" aria-hidden="true">{APP_VERSION}</p>}
    {menu && <div className="dx-menu" role="group" aria-label={__kbUi("Qayta tushuntirish usuli")}>
      <p>{__kbUi("Qaysi usulda qayta tushuntiray?")}</p>
      {list.map((v) => <button key={v.id} type="button" className="dx-btn" onClick={() => openVariant(v)}>{__kbUi(v.nom)}</button>)}
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); setRate(0.85); rateRef.current = 0.85; if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => setStepFinished(true)); } }}>{__kbUi("Sekinroq qayta ayt")}</button>
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); ask(`${__kbUi("Shu qismni tushunmadim, boshqacha tushuntiring")}: ${step?.doska || ""} ${step?.ovoz || ""}`.slice(0, 900)); }}>{__kbUi("AI ustozdan so‘rash")}</button>
    </div>}

    {mode !== "ovoz" && !(kid && ["test", "result", "limit", "bridge"].includes(mode)) && <div className={`dx-controls ${kid ? "dx-kid-controls" : ""}`}>
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
