import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import AmaliyDoska, { BoardText } from "./AmaliyDoska.jsx";
import { boardCues, checkAnswer, lessonDownloadUrl, sceneRange, speakableText, visibleLines } from "./darsXonasiRules.js";
import { stripSpeechTags } from "../speech/language.js";
import { contentLanguage, dropPraiseAny, kidCorrectSpeech, kidOptions, kidPraise } from "../test/kidQuizRules.js";
import { lessonAudience, audienceLabels } from "./lessonAudience.js";
import { markLessonDone } from "../curriculum/kidProgress.js";
import { faollikYoz } from "../maktab/maktabServer.js";
import { KID_PITCH, kidRate, ustozRate, kidRepeatSpeech, kidTakrorStep, kidTaskModel, ismOldin } from "./kidLessonRules.js";
import { APP_VERSION } from "../appVersion.js";
import { answerSpeed, finishLesson, kidTracker, startLesson } from "../kid/kidActivity.js";
import { SABAB_MATN } from "../parent/bogchaReja.js";
import { screenTime } from "../kid/screenTime.js";
import { LIP_STEP, loadEnvelope } from "../kid/lipSync.js";
import { ustozNutqi } from "../kid/ustozNutqi.js";
import KidStage from "../kid/KidStage.jsx";
import { USTOZLAR, XONALAR } from "../kid/ustozlar.js";
import UstozXonacha from "../kid/UstozXonacha.jsx";
import { USTOZ_ISMI } from "../kid/ustozNutqi.js";
import { maktabDarsSozlari } from "./maktabDarsSozlari.js";
import { sanaQadami, sinfJoyi, mashqMateriali, tilLugati, testOvozi } from "./maktabMashqRules.js";
import { darsYozuvi, darsniSaqla, oldingiDarslar, takrorQilindi, takrorBelgila } from "./spiralTakror.js";
const MaktabMashqlar = React.lazy(() => import("./MaktabMashqlar.jsx"));
const Repetitor = React.lazy(() => import("../maktab/Repetitor.jsx"));
const DarsOldiTakror = React.lazy(() => import("./DarsOldiTakror.jsx"));   // REV177: yangi darsdan oldin Kabu bilan spiral takror
import UstozSahna from "../kid/UstozSahna.jsx";
import { useKeepLight } from "../kid/useKeepLight.js";
import { havoTuri, quyoshVaqti, ustozFor, xonaKaliti } from "../kid/ustozRules.js";
import { darsSozlari, kirishniTozala, ochilish, qadamSozi } from "../kid/darsOchilishi.js";
// REV156: qadamning o'z so'zi (mikrofon faqat shuni so'raydi)
// REV157: bog'cha guruhi yoshi («4-5 yosh» → 4); topilmasa — 0 (izoh rejimi)
const kidYoshi = (g) => { const m = /(\d)\s*[-–]\s*\d/.exec(String(g || "")); return m ? Number(m[1]) : 0; };
const qadamMaqsadi = (st) => { const q = qadamSozi(st); return q ? [q.say] : []; };
import { darsIzohi, darsTiliIzoh, gap, izohTeg } from "../kid/izohTil.js";
import { K as DIQQAT, kutishVaqtlari } from "../kid/diqqatGaplari.js";
import { bilganSozlar, eslab, oxirgiDars } from "../kid/sozBoyligi.js";
import { suhbatSavollari } from "../kid/suhbat.js";
import { boardCards, cardSize, emojiPictures, gameTargets, lessonWords, qoshimchaOyin, isReviewQuestion, kabuMood, kabuSpeech, kidStars, kindBadge, kindCue, pictureFor, questionCard, stepActions, stepKind, stickerKeys, darsBoshi, matnRasmlari, doskaBandlari, sanoqKarta, faolRasm } from "../kid/kidStageRules.js";
import { belgiQatori, keycapNumber, kidOptionPic, kidOptionQator, qatorNaqshmi } from "../kid/optionPic.js";
import { emojiRasm, harakatTuri, matnId, sozId } from "../kid/rasmHarakat.js";
import { RASM_HAMMA } from "../kid/darsRasm.js";
import { RASMLAR } from "../kid/xonalar/rasmlar.js";
import { beep, chime, pop, soft } from "../kid/kidSounds.js";
import VoiceCheck from "./VoiceCheck.jsx";
import { voiceCheckItems } from "./voiceCheckRules.js";
import { speechRecognitionAvailable } from "../speech/speakRules.js";
import { aralashKerak, aralashOqi, reja as ovozReja } from "../speech/aralashOvoz.js";
import { aytdiMi, sozBolaklari, tingla } from "./sozAytish.js";
import "./dars-xonasi.css";
import { B, belgiSrc } from "../kid/Belgi.jsx";

/** REV90: bog'cha boshqaruv tugmasi — katta belgi, ostida kichik yozuv (o'qiy olmaydigan bola belgidan taniydi). */
function KidIcon({ icon, label }) {
  return <><span className="dx-kid-ico" aria-hidden="true"><B e={icon} /></span><small className="dx-kid-cap">{__kbUi(label)}</small></>;
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

export default function DarsXonasi({ apiBase, token, topicCode, fan = "", grade = "", jins = "qiz", learnerGender = "", learnerRole = "", nextLesson = null, oldingiKod = "", onOpenTest, onOpenTopic, onChat, kidPlan = null, onKidFinished, onClose, cheklovsiz = false }) {
  const uiLocale = useKbInterfaceLocale()?.locale || "uz";
  // REV177: interfeys gaplari (to'g'ri!, dars tugadi…) — ru / en interfeysda o'sha til talaffuzida o'qiladi (o'zbekcha ovozda emas)
  const uiT = (m) => (m && ["ru", "en"].includes(uiLocale) && !/\[[a-z]{2}\]/.test(m) ? `[${uiLocale}]${m}[/${uiLocale}]` : m);
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
  const [savolOchiq, setSavolOchiq] = useState(false);   // REV177: sinfxonada «O'qituvchiga savol» doska tagida turmaydi — tugma bilan ochiladi
  const [testIndex, setTestIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  // REV91: bog'cha — savol variantlari birma-bir aytiladi (aytilayotgani qimirlaydi), keyin hammasi kutadi.
  const [hot, setHot] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const [limitText, setLimitText] = useState("");
  const [limitKind, setLimitKind] = useState("");
  const [kidResult, setKidResult] = useState(null);
  // REV121: «Top-chi» o'yini — ustoz so'zni aytadi va bola bosishini KUTADI; to'g'ri (birinchi urinishda) — yulduz,
  // xato yoki bosmasa — yulduz yo'q. game: { stepIdx, targets, holat, kutish } · natijalar har o'yin qadami bo'yicha.
  const [game, setGame] = useState(null);
  const gameRef = useRef(null);
  const gameTimer = useRef(0);
  const gameRes = useRef({});
  const [gameScore, setGameScore] = useState(0);
  const [gameTotal, setGameTotal] = useState(0);
  // REV105: dars oxirida ovozli tekshiruv («Takrorlang!») — natija {togri, jami} yoki null.
  const [voice, setVoice] = useState(null);
  // REV110: derazadagi ob-havo (dars boshida serverdan keladi; kelguncha — fasl bo'yicha)
  const [havo, setHavo] = useState(() => havoTuri());
  const [harorat, setHarorat] = useState(null);
  const [shamol, setShamol] = useState(false);
  const [vaqt, setVaqt] = useState(() => quyoshVaqti());
  const voiceRef = useRef(null);
  voiceRef.current = voice;
  // REV98: robot Kabu — quvonish/dalda holati va sakrash; rasmni bosganda qayta jonlanadi.
  const [kidPhase, setKidPhase] = useState("");
  const [celebrate, setCelebrate] = useState(0);
  const [picRev, setPicRev] = useState(0);
  // REV145: til darsida yangi so'z o'rgatilganda bola uni mikrofonga bir marta aytadi (2 urinish)
  const [mikSoz, setMikSoz] = useState(null);   // { phrase, lang, holat: tingla | ok | yana | no }
  const mikRef = useRef(null);                  // hozirgi tinglash (stop)
  const mikYoq = useRef(false);                 // ruxsat yo'q / mikrofon yo'q / bola ikki marta jim — dars oxirigacha so'ralmaydi
  const sorilgan = useRef(new Set());           // shu darsda so'ralgan so'zlar — bir so'z bir marta
  const jimSanoq = useRef(0);
  const qadamRef = useRef(0);
  const aytganlar = useRef({});                 // so'z (kichik harf) → true (to'g'ri aytdi) | false (urindi, chiqmadi)
  const phaseTimer = useRef(0);
  const audioRef = useRef(null);
  // REV122: og'iz ovozga mos — {lv: konvert, audio} ; fallback — so'zlar jim yonganda oddiy ritm
  const lipRef = useRef(null);
  const fallbackTalk = useRef(false);
  const aralashRef = useRef(null);   // REV139: o'zbekcha — server, chet tili — brauzer ovozi
  const sozTimer = useRef(null);
  const sayWords = useRef([]);   // REV153: hozirgi gap so'zlari (word — shu ro'yxatdagi tartib)
  const kidRef = useRef(false);
  const gradeRef = useRef("");
  const tokenRef = useRef(0);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const testIndexRef = useRef(0);
  const speakingRef = useRef(false);
  speakingRef.current = speaking;
  testIndexRef.current = testIndex;
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
  // REV122: kim gapiryapti — sinfxonada (kutish, dars, ko'prik) jonli ustoz, test/ovoz ekranida robot Kabu
  const ustozRef = useRef("nilufar");
  ustozRef.current = ustozFor(fan || lesson?.topic?.fan);
  // REV175: maktabda ham haqiqiy sinfxona — ustoz o'z xonasida (deraza, ob-havo, soat), doska xona o'rtasida katta
  const sinfXona = !kid && Boolean(USTOZLAR[ustozRef.current]);
  const doskaRef = useRef(null);
  const joy = sinfXona ? sinfJoyi(XONALAR[xonaKaliti(ustozRef.current)] ? xonaKaliti(ustozRef.current) : "onatili") : null;   // REV176: doska — ustoz va deraza orasida
  // REV177: test, ovozli tekshiruv va natija — sinfxonadan chiqib, robot Kabuning o'z muhitida (ustoz yo'q, faqat Kabu)
  const kabuMuhit = sinfXona && ["test", "ovoz", "result"].includes(mode);
  useEffect(() => { if (kabuMuhit) setSavolOchiq(false); }, [kabuMuhit]);
  const KABU_JOY = { doska: { l: 29, t: 3, w: 69, h: 72 }, gap: { l: 29, t: 77, w: 69, h: 21 } };
  const foiz = (b) => (b ? { left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, height: `${b.h}%` } : undefined);
  const ustozGapiryapti = () => ["idle", "lesson", "bridge"].includes(modeRef.current);
  // REV177: maktabda ham bolalar darsidagidek — yangi mavzuni jonli ustoz tushuntiradi, test va ovozli tekshiruvni robot Kabu o'tkazadi
  const sinfXonaRef = useRef(false);
  sinfXonaRef.current = sinfXona;
  useKeepLight(kid);   // REV121: tungi rejimda ham bolalar darsi yorqin
  gradeRef.current = grade || lesson?.topic?.sinf || "";
  const labels = audienceLabels(audience);
  const theme = learnerGender === "qiz" ? "girl" : learnerGender === "ogil" ? "boy" : "neutral";
  // REV110: bog'chada dars ustozning o'z salomi, bugungi ob-havo va o'tgan darsdan savol bilan boshlanadi.
  // REV130: dars boshida faqat O'TGAN mavzu (ro'yxatdagi oldingi dars) takrorlanadi — boshqa fandan yoki eski darsdan emas.
  const boshi = useMemo(() => (kid ? darsBoshi(lesson?.steps || [], lesson?.topic?.mavzu || "") : { takror: [], qolgan: lesson?.steps || [] }), [kid, lesson]);
  const oldingi = useMemo(() => {
    if (!lesson || boshi.takror.length || !oldingiKod) return null;   // miyada o'tgan mavzu takrori bo'lsa — o'shasi yetadi
    const o = oxirgiDars(topicCode);
    return o && o.code === oldingiKod ? o : null;
  }, [lesson, topicCode, oldingiKod, boshi]);
  // REV111: miya qaysi tilda tushuntirilgan (o'zbek / rus / ingliz) va qaysi til o'rgatiladi
  const izoh = useMemo(() => darsIzohi(lesson?.steps || [], fan || lesson?.topic?.fan || ""), [lesson, fan]);
  const izohRef = useRef("uz");
  izohRef.current = izoh;
  // REV121: matematika / atrof-muhit / mantiq — til darsi emas (rus izohidagi teglar «o'rganiladigan til» emas)
  const darsTil = useMemo(() => darsTiliIzoh(lesson?.steps || [], izoh, fan || lesson?.topic?.fan || ""), [lesson, izoh, fan]);
  // REV157: 4–7 yoshli til darsida ustoz o'zi ham faqat o'rganilayotgan tilda gapiradi («Now you say it», «Find…»).
  // 2–3 va 3–4 yosh — izoh tilida (o'zbek / rus / ingliz) tushuntiriladi.
  // REV175: maktab til darsi — yangi so'zlar Repetitor uchun (harflab, daftarga, eshitib yozish, tarjima)
  const maktabSozlar = useMemo(() => (kid || !darsTil ? [] : maktabDarsSozlari(lesson?.steps || [], darsTil, ["uz", "ru", "en"].includes(izoh) ? izoh : "uz", topicCode)),
    [kid, darsTil, lesson, izoh, topicCode]);
  const [repetitor, setRepetitor] = useState(false);
  const [mashqlar, setMashqlar] = useState(false);
  const [oldiTakror, setOldiTakror] = useState(null);   // REV177: oldingi darslar ro'yxati — takror oynasi ochiq   // REV175: o'qish, gapirish, diktant, yozganini o'qish
  const immersiya = Boolean(kid && darsTil && kidYoshi(grade || lesson?.topic?.sinf) >= 4);
  const tIzoh = immersiya ? darsTil : izoh;
  const opening = useMemo(() => (kid && lesson?.steps?.length ? ochilish({
    ustoz: ustozFor(fan || lesson?.topic?.fan), til: darsTil, izoh: tIzoh, havo, harorat, oldingi, vaqt,
    grade: grade || lesson?.topic?.sinf, kun: Math.floor(Date.now() / 86400000), aslIzoh: izoh, sana: new Date(),
  }) : []), [kid, lesson, havo, harorat, oldingi, fan, grade, darsTil, tIzoh, izoh, vaqt]);
  // REV156: ustoz ochilishda salomlashgan — darsning o'z «kirish» qadamidagi salom/«Men — …» gaplari olib tashlanadi
  // va mavzu kirishi TAKRORDAN OLDIN keladi (oldin takrordan keyin yana «Salom, bolajonlar!» deyardi).
  const steps = useMemo(() => {
    // REV175: maktab darsi ham bog'chadagidek sana bilan ochiladi (til darsida — o'sha tilda: «Heute ist Montag, 26. Oktober 2026»)
    if (!opening.length) return [...(!kid && lesson?.steps?.length ? [sanaQadami({ til: darsTil || "", iz: ["uz", "ru", "en"].includes(izoh) ? izoh : "uz" })] : []), ...boshi.takror, ...boshi.qolgan];
    const qolgan = [...boshi.qolgan];
    const kirishlar = [];
    while (qolgan.length && qolgan[0]?.turi === "kirish") { const t = kirishniTozala(qolgan.shift()); if (t) kirishlar.push(t); }
    const list = [...opening, ...kirishlar, ...boshi.takror, ...qolgan];
    // REV164: bosib topiladigan o'yin yo'q darsga (matematika/mantiq takrori, uy topshirig'i darsi) — xulosadan oldin «Top-chi»
    const dars = list.slice(opening.length);
    const extra = qoshimchaOyin(dars, dars.map((x) => stepKind(x, lesson?.topic?.mavzu)),
      tIzoh && tIzoh !== "uz" ? gap(tIzoh, "Barakalla! Endi o'ynaymiz!") : "Barakalla! Endi o‘ynaymiz!");
    if (!extra) return list;
    let at = list.length;
    while (at > opening.length && list[at - 1]?.turi === "xulosa") at -= 1;
    return [...list.slice(0, at), { ...extra, sahna: list[at - 1]?.sahna }, ...list.slice(at)];
  }, [opening, boshi, lesson, tIzoh, kid, darsTil, izoh]);
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
  // REV174: maktab — «Xatolar ustida ishlash»: faqat xato qilingan savollar qayta (repetitor kabi), to'g'ri bo'lguncha
  const [xatoTartib, setXatoTartib] = useState(null);   // asl savol indekslari yoki null (to'liq test)
  const xatolar = useRef([]);
  const savollar = xatoTartib ? xatoTartib.map((i) => questions[i]).filter(Boolean) : questions;
  // REV110: bog'chada takrorlashdan keyin ustoz bilan suhbat — faqat bola bilgan so'zlardan, yoshga qarab murakkablashadi.
  const bilgan = useMemo(() => (kid && lesson && darsTil ? bilganSozlar(darsTil) : []), [kid, lesson, darsTil]);
  const voiceItems = useMemo(() => {
    if (!lesson) return [];
    if (kid && !darsTil) return [];   // REV145: oddiy fanda (til darsi emas) mikrofon bilan tekshiruv yo'q
    const base = voiceCheckItems(lesson, audience, { izoh, tilYoq: kid && !darsTil });
    // REV175: maktab til darsi — darsning yangi so'zlari («Neues Wort: …» kabi ko'rsatmalarsiz), ko'pi bilan 6 ta
    if (!kid) return maktabSozlar.length ? maktabSozlar.slice(0, 6).map((w) => ({ lang: darsTil, phrase: w.w[darsTil], emoji: w.emoji || "" })) : base;
    const til = darsTil;
    const dars = darsSozlari(steps.slice(opening.length), kinds.slice(opening.length));
    // REV122: til darsida — avval BUGUN o'rganilgan so'zlar, darsning o'z tilida (salomlashish/eski takror emas);
    // boshqa tildagi (masalan, izoh tilidagi) iboralar aralashmaydi.
    const bugun = til ? dars.filter((w) => w.til === til).map((w) => ({ lang: til, phrase: w.say, emoji: w.emoji || "" })) : [];
    // REV158: o'tgan darsning HAMMA so'zlari (takror) va bugungi HAMMA yangi so'zlar so'raladi — oldin faqat 3 tasi edi,
    // 3–4 ta so'z bo'lsa ba'zisi qolib ketardi
    const takrorSoz = [
      ...(oldingi?.sozlar || []).filter((w) => w?.say).map((w) => ({ lang: oldingi.til || til, phrase: w.say, emoji: w.emoji || "" })),
      ...darsSozlari(boshi.takror, boshi.takror.map(() => "new"), 8).filter((w) => w.til === til).map((w) => ({ lang: til, phrase: w.say, emoji: w.emoji || "" })),
    ].filter((x) => x.lang === til);
    const mos = til ? base.filter((x) => x.lang === til) : base;
    const seen = new Set();
    const asosiy = [...takrorSoz, ...bugun, ...(bugun.length ? [] : mos)].filter((x) => { const k = x.phrase.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 12);
    // REV145: oxirida Kabu bugungi so'zlarni yana aytdiradi (har biriga 2 urinish) + bitta qisqa suhbat savoli — uzun va zerikarli bo'lmasin
    const suhbat = suhbatSavollari({ til, grade: grade || lesson?.topic?.sinf, bilgan, dars, kun: Math.floor(Date.now() / 86400000), izoh: tIzoh })
      .filter((x) => !seen.has(String(x.phrase || "").toLowerCase())).slice(0, 1);
    return [...asosiy, ...suhbat];
  }, [lesson, audience, kid, steps, kinds, opening, bilgan, grade, darsTil, izoh, tIzoh, oldingi, boshi, maktabSozlar]);
  const voiceReady = voiceItems.length > 0 && speechRecognitionAvailable(globalThis);
  const downloadUrl = (format) => lessonDownloadUrl(apiBase, token, topicCode, format);
  const mediaUrl = useCallback((url) => (!url ? null : url.startsWith("/") ? `${String(apiBase).replace(/\/+$/, "")}${url}` : url), [apiBase]);

  const hush = useCallback(() => {
    tokenRef.current += 1;
    const audio = audioRef.current; audioRef.current = null;
    if (audio) { try { audio.pause(); audio.src = ""; } catch { /* already released */ } }
    try { aralashRef.current?.stop(); } catch { /* */ } aralashRef.current = null;
    try { mikRef.current?.stop(); } catch { /* */ } mikRef.current = null;
    clearTimeout(sozTimer.current);
    setSpeaking(false); setWord(-1); lipRef.current = null; fallbackTalk.current = false;
  }, []);
  // Og'iz holati: null — jim (yopiq), 0..1 — ovoz balandligi, -1 — ovoz ketyapti, lekin tahlil hali tayyor emas.
  const mouthLevel = useCallback(() => {
    if (fallbackTalk.current) return -1;
    const a = audioRef.current;
    if (!a || a.paused || a.ended || !(a.currentTime > 0) || a.readyState < 3) return null;
    const lip = lipRef.current;
    if (!lip || lip.audio !== a) return -1;
    return lip.lv[Math.floor(a.currentTime / LIP_STEP)] ?? 0;
  }, []);

  // O'qituvchi ovozi: serverdagi TTS (/api/ovoz). REV102: ovoz yuklanmasa bir marta qayta so'raladi
  // (server uzilgan bo'lakni qayta yaratadi); baribir bo'lmasa so'zlar jim yonadi va dars to'xtab qolmaydi.
  // takror — bog'chada so'z o'rgatish qadami: «Men bilan ayt: Green» dan keyin bolaga 1.5–3 soniya vaqt.
  const ovozUrl = useCallback((clean, takror = false, attempt = 0) => {
    // REV122: jonli ustoz o'z ovozida: Sardor aka — erkak, Nilufar opa va Malika opa — ayol ovozi
    // REV145: robot Kabu har doim bitta ovozda (har darsda boshqa-boshqa ovoz bolani chalg'itardi)
    // REV175: maktabda ham jonli ustoz — ovoz ustozning jinsiga mos (Lukas, Yusuf, Sardor — erkak ovozi)
    const kabuGapiradi = !kidRef.current && sinfXonaRef.current && !ustozGapiryapti() && modeRef.current !== "end";
    const ovozJinsi = kabuGapiradi ? "qiz" : kidRef.current ? (ustozGapiryapti() && USTOZLAR[ustozRef.current]?.lab === "erkak" ? "ogil" : "qiz")
      : USTOZLAR[ustozRef.current] ? (USTOZLAR[ustozRef.current].lab === "erkak" ? "ogil" : "qiz") : jins;   // REV169: erkak ustozlar (Sardor, Yusuf, Lukas, Karlos, Kenji) — erkak ovozi
    const params = new URLSearchParams({ matn: clean.slice(0, 1500), jins: ovozJinsi,
      // REV122: ustoz — tabiiy (odam) ovozi: ohang ko'tarilmaydi, tezlik biroz tabiiyroq; robot Kabu — yuqoriroq ohang
      ...(kidRef.current ? (ustozGapiryapti() ? { tezlik: ustozRate(gradeRef.current) } : { tezlik: kidRate(gradeRef.current), ohang: KID_PITCH }) : kabuGapiradi ? { ohang: KID_PITCH } : {}),
      ...(takror ? { takror: "1" } : {}), ...(attempt ? { q: String(attempt) } : {}) });
    return `${String(apiBase).replace(/\/+$/, "")}/api/ovoz?k=133&${params}`;
  }, [apiBase, jins]);
  const spokenFor = useCallback((text) => speakableText(kidRef.current ? kabuSpeech(text) : text), []);
  // Keyingi qadam ovozi oldindan tayyorlanadi — server uni keshlaydi, bola kutmaydi.
  const prefetch = useCallback((text, takror = false) => {
    const clean = spokenFor(text);
    if (!clean.replace(/⏸/g, "").trim()) return;
    // REV139: aralash gapda faqat server o'qiydigan (o'zbekcha) bo'laklar oldindan tayyorlanadi
    const urls = aralashKerak(clean) ? ovozReja(clean, { takror }).filter((q) => q.tur === "server").map((q) => ovozUrl(q.matn, takror)) : [ovozUrl(clean, takror)];
    for (const url of urls) {
      if (prefetched.current.has(url)) continue;
      prefetched.current.add(url);
      try { fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => {}); } catch { /* eski brauzer */ }
    }
  }, [ovozUrl, spokenFor]);
  const say = useCallback((text, done, opts = {}) => {
    hush();
    const my = tokenRef.current;
    // REV98: qahramon — robot Kabu; REV122: sinfxonada gapiruvchi jonli ustoz — u odamdek gapiradi (robot iboralarisiz)
    if (kidRef.current) text = ustozGapiryapti() ? ustozNutqi(kabuSpeech(text), ustozRef.current) : kabuSpeech(text);
    // REV125: bog'chada tegsiz qolgan gap (interfeys tarjimasi) — izoh tilining o'z ovozida o'qiladi, o'zbek ovozida emas
    if (kidRef.current && izohRef.current !== "uz") text = izohTeg(text, izohRef.current);
    const clean = speakableText(text);
    setBubble(stripSpeechTags(text || "").replace(/\s*⏸\s*/g, " ").trim());
    if (!clean.replace(/⏸/g, "").trim()) { done?.(); return; }
    const words = String(text || "").replace(/⏸/g, " ").split(/\s+/).filter(Boolean);
    sayWords.current = words;
    setSpeaking(true);
    const finish = () => { if (my !== tokenRef.current) return; clearTimeout(sozTimer.current); aralashRef.current = null; setSpeaking(false); setWord(-1); audioRef.current = null; lipRef.current = null; fallbackTalk.current = false; done?.(); };
    // REV139: gapda chet tildagi so'z bo'lsa — o'zbekcha bo'laklar serverdan, chet tildagilari qurilma ovozidan
    if (aralashKerak(clean)) {
      fallbackTalk.current = true;
      let w = 0;
      const sozYonsin = () => {
        if (my !== tokenRef.current || w >= words.length) return;
        setWord(w);
        sozTimer.current = setTimeout(sozYonsin, (300 + (words[w++] || "").length * 34) / rateRef.current);
      };
      sozYonsin();
      aralashRef.current = aralashOqi(clean, (m) => ovozUrl(m, opts.takror), {
        rate: (kidRef.current ? 0.85 : 0.95) * rateRef.current, playbackRate: rateRef.current, takror: Boolean(opts.takror),
        onEnd: () => { if (my === tokenRef.current) finish(); },
      });
      return;
    }
    // REV145: server ovoz bera olmasa — so'zlar navbat bilan yonadi; dars to'xtamaydi.
    // REV169: o'qituvchi gapi FAQAT server TTS'da (Azure → OpenAI → edge) — qurilmaning robot ovozi ishlatilmaydi.
    const fallback = () => {
      fallbackTalk.current = true;
      let i = 0, ovozTugadi = true, sozTugadi = false;
      const tamom = () => { if (ovozTugadi && sozTugadi) finish(); };
      const tick = () => {
        if (my !== tokenRef.current) return;
        setWord(i);
        if (++i > words.length) { sozTugadi = true; tamom(); return; }
        setTimeout(tick, (260 + (words[i - 1] || "").length * 28) / rateRef.current);
      };
      tick();
    };
    const play = (attempt) => {
      let audio;
      const src = ovozUrl(clean, opts.takror, attempt);
      try { audio = new Audio(src); } catch { fallback(); return; }
      audio.playbackRate = rateRef.current;
      audioRef.current = audio;
      let started = false, failed = false;
      const fail = (err) => {
        if (failed || my !== tokenRef.current) return;
        failed = true; clearTimeout(stall);
        if (started) { finish(); return; }   // yarmida uzildi — boshidan takrorlamaymiz, darsni davom ettiramiz
        try { audio.pause(); audio.src = ""; } catch { /* allaqachon yopilgan */ }
        if (attempt < 2 && err?.name !== "NotAllowedError") setTimeout(() => { if (my === tokenRef.current) play(attempt + 1); }, 700 * (attempt + 1)); else fallback();
      };
      const stall = setTimeout(() => { if (!started) fail(); }, 15000);
      audio.onplaying = () => {
        started = true; clearTimeout(stall);
        // og'iz uchun tahlil — ovoz boshlangach (server ovozni allaqachon tayyorlagan, ikki marta yaratilmaydi)
        if (kidRef.current && !lipRef.current) loadEnvelope(src).then((lv) => { if (lv && my === tokenRef.current && audioRef.current === audio) lipRef.current = { lv, audio }; });
      };
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
    const lead = kindCue(kinds[i], i > 0 ? kinds[i - 1] : "", spoken, lesson?.topic?.mavzu, tIzoh);
    // «Qani, birga aytamiz!» dan keyin so'zlar pauza bilan; REV140: «Endi sen ayt: X» — avval ustoz X ni ikki marta aytadi
    return ismOldin(kidRepeatSpeech(lead ? `${lead} ${spoken}` : spoken, { doska: s.doska, izoh }));
  }, [kid, kinds, lesson, izoh, tIzoh]);
  // REV145: mikrofon bilan so'z aytish rejimi — faqat bog'cha til darsida, brauzer ovozni taniy olsa va ruxsat rad etilmagan bo'lsa.
  // Oddiy fanlarda (matematika, atrof-muhit…) mikrofon so'ralmaydi.
  const micRejim = () => Boolean(kid && darsTil && !mikYoq.current && speechRecognitionAvailable(globalThis));
  // Qadam ovozi oldindan: mikrofon rejimida gap «⏸» bo'yicha bo'laklab aytiladi — shu bo'laklar tayyorlanadi.
  const prefetchQadam = (j) => {
    const s = steps[j];
    if (!s) return;
    const spoken = stepSpeech(s, j);
    if (micRejim() && j >= opening.length && spoken.includes("⏸")) sozBolaklari(spoken, darsTil, qadamMaqsadi(steps[j])).forEach((b) => prefetch(b.matn, false));
    else if (micRejim() && j >= opening.length && kinds[j] === "new" && kidTakrorStep(s)) prefetch(spoken, false);
    else prefetch(spoken, kid && kidTakrorStep(s));
  };
  const prefetchQadamRef = useRef(prefetchQadam);
  prefetchQadamRef.current = prefetchQadam;
  // REV139: dars ochilganda birinchi ikki qadam ovozi sekin-asta (1.5 soniyadan keyin) oldindan tayyorlanadi —
  // «Boshlash» bosilganda kutilmaydi; qolganlari dars davomida navbatma-navbat (keyingi 2 qadam) tayyorlanadi.
  useEffect(() => {
    if (!steps.length || mode !== "idle") return undefined;
    const t = setTimeout(() => {
      [0, 1].forEach((j) => prefetchQadamRef.current(j));
    }, 1500);
    return () => clearTimeout(t);
  }, [steps, mode]);

  useEffect(() => {
    const controller = new AbortController();
    hush(); setLoading(true); setError(""); setLesson(null); setIdx(-1); setMode("idle"); setPlaying(false);
    setVariant(null); setMenu(false); setAskReply(""); setScore(0); setTestIndex(0); setPicked(null);
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/dars_xonasi/${encodeURIComponent(topicCode)}?${new URLSearchParams({ token })}`, { signal: controller.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Dars yuklanmadi"); return d; })
      .then((d) => { setLesson(d); setBubble(lessonAudience(learnerRole, grade || d?.topic?.sinf) === "bogcha" ? ustozNutqi(__kbUi("Salom, do‘stim! Men robot Kabuman. Qani, boshladik!"), ustozFor(fan || d?.topic?.fan)) : __kbUi("Salom! «Darsni boshlash» tugmasini bosing — birga o‘rganamiz.")); })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); hush(); };
  }, [apiBase, token, topicCode, hush]);

  // REV110: bugungi ob-havo (server soatiga bir marta oladi va keshlaydi)
  useEffect(() => {
    if ((!kid && !sinfXona) || !lesson) return undefined;
    const c = new AbortController();
    let shahar = "toshkent";
    try { shahar = globalThis.localStorage?.getItem("kabutar:shahar") || shahar; } catch { /* */ }
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/bogcha/havo?${new URLSearchParams({ shahar })}`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setHavo(havoTuri(d.kod)); setHarorat(d.harorat ?? null); setShamol(Number(d.shamol) >= 30); } })
      .catch(() => { /* ob-havo bo'lmasa — fasl bo'yicha */ });
    return () => c.abort();
  }, [kid, sinfXona, lesson, apiBase]);

  // REV111 / REV140: kun vaqti (tong/kun/kech/tun) — quyoshning haqiqiy holatidan (shahar + mutlaq vaqt), har daqiqada
  useEffect(() => {
    if (!kid && !sinfXona) return undefined;   // REV177: maktab sinfxonasida ham deraza tashqarisi kun vaqtiga mos
    const tick = () => setVaqt(quyoshVaqti(new Date()));
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [kid, sinfXona]);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate]);

  const go = useCallback((next, autoplay = playingRef.current) => {
    qadamRef.current += 1; setMikSoz(null);
    setMenu(false); setVariant(null); setAskReply(""); setFeedback(null); setAnswer("");
    clearTimeout(gameTimer.current); gameRef.current = null; setGame(null);   // o'yin qadamidan chiqildi
    if (next >= steps.length) {
      hush(); setPlaying(false); setStepFinished(true);
      // REV105: avval ovozli tekshiruv — ustoz aytadi, mikrofon yoqiladi, takrorlanadi; keyin odatdagi davom.
      if (voiceReady && !voiceRef.current) { setMode("ovoz"); return; }
      afterLessonRef.current();
      return;
    }
    if (next < 0) return;
    if (next === 0) { sorilgan.current = new Set(); jimSanoq.current = 0; aytganlar.current = {}; voiceRef.current = null; setVoice(null); gameRes.current = {}; setGameScore(0); setGameTotal(0); }   // dars qaytadan — tekshiruv va o'yin hisobi ham qaytadan
    setIdx(next); setMode("lesson"); setStepFinished(false);
    runStepRef.current(next, autoplay);
  }, [steps, hush, voiceReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const afterLesson = () => {
    {
      if (kid) {   // REV91: bog'chada tugma bosilmaydi — dars tugashi bilan o'yin o'zi boshlanadi
        answerTimes.current = [];
        if (questions.length) { say(tIzoh !== "uz" ? gap(tIzoh, "Barakalla! Endi o'ynaymiz!") : __kbUi("Barakalla! Endi o‘ynaymiz!"), () => { setMode("test"); setTestIndex(0); setScore(0); setPicked(null); }); setMode("bridge"); }
        else setMode("result");
        return;
      }
      // REV177: maktab sinfxonasida dars tugashi bilan hammasi o'zi ketma-ket ochiladi (bolalar darsidagidek, tugma qidirilmaydi):
      // til darsi — 🏋️ Kabu bilan mashqlar → 📝 test → 🤖 Repetitor; boshqa fan — 📝 test (savollar bo'lsa).
      const mat = darsTil ? mashqMateriali(steps, maktabSozlar) : null;
      const mashqBor = Boolean(mat && (mat.oqish.length || mat.gapirish.length || mat.diktant.length));
      if (sinfXona && (mashqBor || questions.length) && !zanjir.current) {
        setMode("end"); modeRef.current = "end";   // ustoz o'z ovozida xayrlashadi (Kabu ovozida emas)
        zanjir.current = true;   // avtomatik zanjir bir darsda bir marta (darsni qayta ko'rganda qaytadan ochilmaydi)
        say(uiT(__kbUi(mashqBor ? "Barakalla! Dars tugadi. Endi Kabu bilan mashq qilamiz." : "Barakalla! Dars tugadi. Endi Kabu bilan bilimingizni tekshiramiz.")),
          () => setTimeout(() => { if (modeRef.current !== "end") return; if (mashqBor) setMashqlar(true); else startQuizRef.current(); }, 700));
        return;
      }
      // Dars tugadi: o'quvchi o'zi tanlaydi — shu yerda tezkor savollar yoki Test bo'limi.
      setMode("end"); modeRef.current = "end";
      say(uiT(questions.length || onOpenTest
        ? __kbUi("Barakalla! Dars tugadi. Endi bilimingizni tekshiring: pastdan test turini tanlang.")
        : __kbUi("Barakalla! Dars tugadi.")));
    }
  };
  const afterLessonRef = useRef(afterLesson);
  afterLessonRef.current = afterLesson;
  const voiceDone = (sum, list = []) => {
    // REV145: dars oxirida aytgan so'zlari ham yoziladi (darsda chiqmagan bo'lsa-yu, oxirida aytsa — «aytdi»)
    for (const r of list || []) { const k = String(r?.phrase || "").toLowerCase(); if (k) aytganlar.current[k] = Boolean(aytganlar.current[k] || r.ok); }
    setVoice(sum || { togri: 0, jami: 0 }); voiceRef.current = sum || { togri: 0, jami: 0 }; afterLesson();
  };
  // REV145: so'z rasmi — rassom chizgan rasm (inglizcha so'z yoki emoji orqali)
  const sozRasmi = (soz, emoji) => { const mt = matnId(soz); if (mt && RASM_HAMMA[mt]) return { id: mt, src: RASM_HAMMA[mt] }; const id = sozId({ soz: darsTil === "en" ? soz : "", emoji }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : emojiRasm(emoji, RASM_HAMMA); };
  // REV145: bugun o'rgangan so'zlar va bola ularni aytdimi — bola natija ekranida va ota-ona hisobotida
  const bugungiSozlar = () => (darsTil ? darsSozlari(steps.slice(opening.length), kinds.slice(opening.length)) : [])
    .map((w) => { const k = w.say.toLowerCase(); return { soz: w.say, emoji: w.emoji || "", aytdi: k in aytganlar.current ? aytganlar.current[k] : null }; });

  const MIC_MAQTOV = ["Barakalla! {p}", "Zo‘r! Ana shunday!", "Ofarin! Sen zo‘rsan!"];
  // REV145: bola so'zni mikrofonga aytadi: 1-urinish → eshitilmasa/xato bo'lsa «Yana bir bor ayt» → 2-urinish →
  // baribir bo'lmasa ustoz to'g'risini aytib, maqtab davom etadi (bola xafa bo'lmaydi, dars to'xtamaydi).
  const sozniEshit = (soz, urinish, my, keyingi) => {
    const p = `[${soz.lang}]${soz.phrase}[/${soz.lang}]`;
    setMikSoz({ ...soz, holat: "tingla", urinish });
    const t = tingla(soz.lang);
    mikRef.current = t;
    t.promise.then(({ alts, xato, toxtatildi }) => {
      if (mikRef.current === t) mikRef.current = null;
      if (toxtatildi || my !== qadamRef.current) { if (toxtatildi && my === qadamRef.current) setMikSoz(null); return; }
      if (xato) { mikYoq.current = true; setMikSoz(null); keyingi(); return; }
      sorilgan.current.add(soz.phrase.toLowerCase());
      const g = aytdiMi(alts, soz, urinish);
      const k = soz.phrase.toLowerCase();
      if (g.ok || urinish > 0) aytganlar.current[k] = aytganlar.current[k] || g.ok;
      if (g.ok) {
        jimSanoq.current = 0;
        chime(); setCelebrate((c) => c + 1);
        say(gap(tIzoh, MIC_MAQTOV[(sorilgan.current.size - 1) % MIC_MAQTOV.length], { p }), () => { if (my === qadamRef.current) { setMikSoz(null); keyingi(); } });
        setMikSoz({ ...soz, holat: "ok" });
        return;
      }
      // REV158: bola ketma-ket jim bo'lsa ham mikrofon O'CHIRILMAYDI (oldin 2 so'zdan keyin dars oxirigacha so'ralmasdi —
      // «faqat 1 ta narsani so'radi»). Jim bo'lsa — har so'z bir marta so'raladi (qayta urinishsiz), dars sekinlashmaydi.
      if (urinish === 0 && !(jimSanoq.current >= 2 && !alts.length)) {
        soft();
        say(alts.length ? gap(tIzoh, "Yana bir bor ayt: {p}", { p }) : gap(tIzoh, "Ovozing eshitilmadi. Balandroq va dadil ayt: {p}", { p }),
          () => { if (my === qadamRef.current) sozniEshit(soz, 1, my, keyingi); });
        setMikSoz({ ...soz, holat: "yana" });
        return;
      }
      // ikki urinishda ham hech narsa eshitilmadi — ikki so'z ketma-ket shunday bo'lsa, mikrofon shu darsda boshqa so'ralmaydi
      jimSanoq.current = alts.length ? 0 : jimSanoq.current + 1;
      say(gap(tIzoh, "Yaxshi harakat! Mana bunday: {p}", { p }), () => { if (my === qadamRef.current) { setMikSoz(null); keyingi(); } });
      setMikSoz({ ...soz, holat: "no" });
    });
  };
  // Gap bo'laklari navbat bilan: bo'lak aytiladi → bola shu so'zni aytadi → keyingi bo'lak.
  const bolaklabAyt = (list, k, my, done) => {
    const b = list[k];
    if (!b) { done(); return; }
    const keyingi = () => bolaklabAyt(list, k + 1, my, done);
    say(b.matn, () => {
      if (my !== qadamRef.current) return;
      const key = b.soz?.phrase.toLowerCase();
      if (b.soz && !mikYoq.current && !sorilgan.current.has(key)) { sozniEshit(b.soz, 0, my, keyingi); return; }
      // so'z allaqachon so'ralgan yoki mikrofon o'chgan — avvalgidek bolaga qaytarish uchun jimlik
      if (k < list.length - 1 && b.pauza !== false) setTimeout(() => { if (my === qadamRef.current) keyingi(); }, 2000); else keyingi();
    });
  };

  const runStep = (next, autoplay) => {
    const s = steps[next];
    const spoken = stepSpeech(s, next);
    [next + 1, next + 2].forEach((j) => prefetchQadam(j));
    if (kid && next > 0 && kinds[next] !== kinds[next - 1]) { if (kinds[next] === "new") chime(); else if (kinds[next] === "review") soft(); }
    let micBilan = false;
    const qadamTugadi = () => {
      setStepFinished(true);
      // «birga» va «amaliy» qadamida o'quvchi o'zi ishlaydi — dars shu yerda kutadi.
      // REV121: «Top-chi» o'yini — so'zlar bilan bog'langan rasmlar bo'lsa, bola bosishini kutadigan haqiqiy o'yin
      const targets = autoplay && kid && s.turi === "amaliy" && next >= opening.length ? gameTargets(s, steps, kinds) : [];
      if (targets.length) { gameApi.current.start(next, targets); return; }
      if (autoplay && kid && s.turi === "amaliy") {
        // REV93: bog'chada topshiriq (qo'shiq, harakat, o'yin) — bolaga bajarishga vaqt, keyin maqtov va davom. Tugma kerak emas.
        // Bajarganini tekshirib bo'lmaydi — shuning uchun «Barakalla» demaymiz, to'g'ri javobni birga aytamiz.
        const praise = kidTaskModel(s.ovoz || s.doska, izoh, tIzoh, immersiya ? darsSozlari(steps.slice(opening.length), kinds.slice(opening.length)).map((w) => w.say) : []);
        setTimeout(() => { if (playingRef.current && idxRef.current === next) say(praise, () => setTimeout(() => { if (playingRef.current && idxRef.current === next) go(next + 1, true); }, 900)); }, 4000);
        return;
      }
      // So'z o'rgatiladigan qadam («Men bilan takrorla») — bola qaytarib aytishi uchun biroz ko'proq kutiladi
      // (mikrofon bilan aytgan bo'lsa — allaqachon aytdi, qisqa kutish).
      const pause = kid && !micBilan && /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.test(s.ovoz || "") ? 2600 : 1000;
      if (autoplay && s.turi !== "birga" && s.turi !== "amaliy") setTimeout(() => { if (playingRef.current && idxRef.current === next) go(next + 1, true); }, pause);
    };
    // salomlashish/ob-havo suhbati (ochilish) — savol-javob, u yerda so'z aytdirilmaydi; faqat darsning o'zida
    if (micRejim() && next >= opening.length) {
      let list = spoken.includes("⏸") ? sozBolaklari(spoken, darsTil, qadamMaqsadi(s)) : [];
      // yangi so'z o'rgatilgan qadamda «⏸» bo'lmasa ham — oxirida ustoz so'raydi: «Endi sen ayt: Bye» (har so'z bir marta)
      if (!list.some((b) => b.soz) && kinds[next] === "new" && kidTakrorStep(s)) {
        const yangi = darsSozlari([s], ["new"], 6).filter((w) => w.til === darsTil && !sorilgan.current.has(w.say.toLowerCase()));
        if (yangi.length) list = [{ matn: spoken.replace(/\s*⏸\s*/g, " ").trim(), soz: null, pauza: false },
          ...yangi.map((w) => ({ matn: gap(tIzoh, "Endi sen ayt: {p}", { p: `[${darsTil}]${w.say}[/${darsTil}]` }), soz: { lang: darsTil, phrase: w.say } }))];
      }
      if (list.some((b) => b.soz && !sorilgan.current.has(b.soz.phrase.toLowerCase()))) {
        micBilan = true;
        const my = qadamRef.current;
        bolaklabAyt(list, 0, my, () => { if (my === qadamRef.current) qadamTugadi(); });
        return;
      }
    }
    say(spoken, qadamTugadi, { takror: kid && kidTakrorStep(s) });
  };
  const runStepRef = useRef(runStep);
  runStepRef.current = runStep;

  const startQuiz = () => {
    answerTimes.current = [];
    setXatoTartib(null); xatolar.current = [];
    setMode("test"); setTestIndex(0); setScore(0); setPicked(null);
  };
  const startQuizRef = useRef(startQuiz);
  startQuizRef.current = startQuiz;
  // REV177: testdan keyin — 🤖 Repetitor o'zi ochiladi (yangi so'zlar bo'lsa, bir darsda bir marta)
  const avtoRep = useRef(false);
  const zanjir = useRef(false);
  useEffect(() => { zanjir.current = false; avtoRep.current = false; }, [topicCode]);
  useEffect(() => {
    // xato javoblar bo'lsa — avval «Xatolar ustida ishlash» tavsiya etiladi, Repetitor o'zi ochilmaydi
    if (kid || !sinfXona || mode !== "result" || xatoTartib || avtoRep.current || !maktabSozlar.length || xatolar.current.length) return undefined;
    const t = setTimeout(() => { if (modeRef.current === "result" && !avtoRep.current) { avtoRep.current = true; hush(); setRepetitor(true); } }, 5000);
    return () => clearTimeout(t);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const xatoIshlash = () => {
    const list = [...xatolar.current];
    if (!list.length) return;
    xatolar.current = [];
    setXatoTartib(list); setMode("test"); setTestIndex(0); setScore(0); setPicked(null);
  };
  const togglePlay = () => {
    if (mode === "result" || mode === "end") { setScore(0); gameRes.current = {}; setGameScore(0); setGameTotal(0); setPlaying(true); go(0, true); return; }
    if (playing) { setPlaying(false); hush(); setStepFinished(true); return; }
    setPlaying(true);
    if (mode !== "lesson") go(0, true); else if (!variant) go(idx, true);
  };

  const openVariant = (v) => {
    setMenu(false); setVariant(v); say(v.ovoz || v.doska);
  };
  const dunno = () => {
    if (kid) {   // REV98: bog'cha bolasi menyuni o'qiy olmaydi — robot o'zi boshqacha (sekinroq) qayta tushuntiradi
      // REV156: faqat SHU QISM sekinroq qayta tushuntiriladi; keyingi qadamdan tezlik avvalgidek (oldin butun dars sekinlashardi)
      const first = (lesson?.variants?.[step?.id] || [])[0];
      const avvalgi = rateRef.current;
      const qaytar = () => { setRate(avvalgi); rateRef.current = avvalgi; };
      setPlaying(false); setRate(0.85); rateRef.current = 0.85; setPicRev((r) => r + 1);
      if (first) { setVariant(first); say(first.ovoz || first.doska, () => { qaytar(); setVariant(null); setPlaying(true); go(idx + 1, true); }); return; }
      if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => { qaytar(); setStepFinished(true); setPlaying(true); go(idx + 1, true); }); }
      else qaytar();
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
      say(uiT(__kbUi("Barakalla, to‘g‘ri!")) + " " + (step.javob_izohi || ""), () => { if (playingRef.current) setTimeout(() => go(idx + 1, true), 800); });
    } else {
      setFeedback({ ok: false, text: __kbUi("Yana bir bor urinib ko‘ring.") });
      say(uiT(__kbUi("Deyarli! Yana bir bor o‘ylab ko‘ring.")) + (step.javob_izohi ? " " + uiT(__kbUi("Yordam: ")) + step.javob_izohi : ""));
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

  // ── REV121: «Top-chi» o'yini ──
  // Ustoz so'zni aytadi → bola bosishini kutadi (9 s). Birinchi urinishda to'g'ri — ⭐; xato — «Yana qidir!» (bitta imkon),
  // ikkinchi xato yoki bosmasa — to'g'ri rasm ko'rsatiladi, yulduz berilmaydi. Hisob dars natijasiga qo'shiladi.
  const gTil = darsTil || (izoh !== "uz" ? izoh : "");
  const soz = (t) => (darsTil ? `[${darsTil}]${t.word}[/${darsTil}]` : izohTeg(t.word, izoh));
  const sonliGap1 = (L, tpl, n) => gap(L, tpl, { n: String(n) }).replace(new RegExp(`\\[\\/${L}\\](\\d+)\\[${L}\\]`, "g"), "$1");
  // REV158: til darsida yulduzlar soni va maqtov — O'RGANILAYOTGAN tilda (oldin o'zbekcha aytilardi);
  // 2–4 yoshda (izoh rejimi) keyin izoh tilida ham. Boshqa fanlarda — izoh tilida.
  const ikkiTil = (fn) => (darsTil && darsTil !== izoh ? (immersiya ? fn(darsTil) : `${fn(darsTil)} ${fn(izoh)}`) : fn(tIzoh));
  const sonliGap = (tpl, n) => ikkiTil((L) => sonliGap1(L, tpl, n));
  const yulduzGap = (tpl) => ikkiTil((L) => gap(L, tpl));
  const gameApi = useRef(null);
  gameApi.current = {
    alive(g) { return g && gameRef.current === g && playingRef.current && idxRef.current === g.stepIdx && modeRef.current === "lesson"; },
    paint(g, patch = {}) { setGame((p) => (p && p.stepIdx === g.stepIdx ? { ...p, ...patch } : p)); },
    wait(g, ms, fn) { clearTimeout(gameTimer.current); gameTimer.current = setTimeout(() => { if (gameApi.current.alive(g)) fn(); }, ms); },
    totals() {
      const all = Object.values(gameRes.current);
      setGameScore(all.reduce((n, r) => n + r.found, 0));
      setGameTotal(all.reduce((n, r) => n + r.total, 0));
    },
    start(stepIdx, targets) {
      const order = targets.map((_, i) => i).sort(() => Math.random() - 0.5);
      // REV158: o'yinda ham darsdagi rasmning AYNAN o'zi — avval rassom chizgan rasm, naqsh/sanoq bo'lsa rasmlar qatori;
      // kitobdagi eski (o'yinchoqqa o'xshash) rasm faqat belgisi yo'q so'zga. Oldin o'yinda boshqa, darsda boshqa rasm chiqardi.
      const withPics = targets.map((t) => {
        const ch = sozRasmi(t.word, t.emoji);
        if (ch?.src) return { ...t, src: ch.src };
        const qator = belgiQatori(t.emoji);
        if (qator) return { ...t, src: "", qator };
        const own = t.emoji ? null : pictureFor(t.emoji, t.word, lesson?.rasmlar, lesson?.rasm_sozlar);
        return { ...t, src: own ? mediaUrl(own) : "" };
      });
      const g = { stepIdx, targets: withPics, order, k: 0, tries: 0, found: 0, waiting: false, again: 0, hint: false, topilgan: [] };
      gameRef.current = g;
      gameRes.current[stepIdx] = { found: 0, total: targets.length };
      gameApi.current.totals();
      setGame({ stepIdx, targets: withPics, holat: {}, kutish: false });
      setTimeout(() => { if (gameApi.current.alive(g)) gameApi.current.round(g); }, 600);
    },
    // REV156: o'yin bola BOSGUNCHA kutadi (o'zi o'tib ketmaydi). Topilgan rasmda ✓ belgisi qoladi.
    // Bosmasa — ustoz so'zni yana aytadi; ikkinchi marta ham bosmasa yoki 2 marta adashsa — to'g'ri rasm yonib turadi,
    // lekin baribir bolaning o'zi bosishini kutadi.
    holat(g, patch = {}) {
      const h = {};
      (g.topilgan || []).forEach((i) => { h[i] = "done"; });
      return { ...h, ...patch };
    },
    round(g) {
      if (!gameApi.current.alive(g)) return;
      if (g.k >= g.order.length) { gameApi.current.end(g); return; }
      const t = g.targets[g.order[g.k]];
      g.tries = 0; g.again = 0; g.hint = false;
      g.waiting = true;
      gameApi.current.paint(g, { holat: gameApi.current.holat(g), kutish: true });
      say(gap(tIzoh, "Qani, top: {p}", { p: soz(t) }), () => {
        if (!gameApi.current.alive(g) || !g.waiting) return;
        gameApi.current.wait(g, 10000, () => gameApi.current.timeout(g));
      });
    },
    timeout(g) {
      if (!g.waiting) return;
      const i = g.order[g.k];
      const t = g.targets[i];
      g.again += 1;
      if (g.again >= 2) g.hint = true;
      // REV171: bola qotib qolmasin — 1) «Shu yerdamisan?», 2) to'g'ri rasm yonadi, 3) tasalli va keyingi so'zga o'tadi
      // (topilmagan so'z yulduz bermaydi va keyingi takrorda yana so'raladi)
      if (g.again >= 3) {
        g.waiting = false;
        g.otkazildi = [...(g.otkazildi || []), i];
        flashPhase("enc");
        gameApi.current.paint(g, { holat: gameApi.current.holat(g, { [i]: "hint" }), kutish: false });
        say(gap(tIzoh, "Hechqisi yo'q, bu — {p}. Keyingisiga o'tamiz!", { p: soz(t) }), () => gameApi.current.wait(g, 700, () => { g.k += 1; gameApi.current.round(g); }));
        return;
      }
      gameApi.current.paint(g, { holat: gameApi.current.holat(g, g.hint ? { [i]: "hint" } : {}), kutish: true });
      say(gap(tIzoh, g.again === 1 ? "Shu yerdamisan? Barmog'ing bilan bos: {p}" : "Barmog'ing bilan bos: {p}", { p: soz(t) }), () => {
        if (!gameApi.current.alive(g) || !g.waiting) return;
        gameApi.current.wait(g, 12000, () => gameApi.current.timeout(g));
      });
    },
    tap(i) {
      const g = gameRef.current;
      if (!g || !gameApi.current.alive(g)) return false;
      if ((g.topilgan || []).includes(i)) return true;   // topilgani — qayta bosilsa hech narsa
      if (!g.waiting) return true;
      const want = g.order[g.k];
      clearTimeout(gameTimer.current);
      if (i === want) {
        g.waiting = false;
        const first = g.tries === 0 && !g.hint;
        if (first) { g.found += 1; gameRes.current[g.stepIdx] = { found: g.found, total: g.targets.length }; gameApi.current.totals(); }
        g.topilgan = [...(g.topilgan || []), i];
        flashPhase("happy");
        gameApi.current.paint(g, { holat: gameApi.current.holat(g, { [i]: "ok" }), kutish: false });
        hush();
        const praise = kidPraise(g.k + g.found, gTil);
        say(first ? `${praise} ${yulduzGap("Topding! Yulduzcha seniki!")}` : praise, () => gameApi.current.wait(g, 600, () => { g.k += 1; gameApi.current.round(g); }));
        return true;
      }
      g.tries += 1;
      if (g.tries >= 2) g.hint = true;
      flashPhase("enc");
      gameApi.current.paint(g, { holat: gameApi.current.holat(g, { [i]: "no" }), kutish: true });
      setTimeout(() => { if (gameApi.current.alive(g) && g.waiting) gameApi.current.paint(g, { holat: gameApi.current.holat(g, g.hint ? { [want]: "hint" } : {}), kutish: true }); }, 650);
      hush();
      say(gap(tIzoh, "Bu emas. Yana qidir: {p}", { p: soz(g.targets[want]) }), () => {
        if (!gameApi.current.alive(g) || !g.waiting) return;
        gameApi.current.wait(g, 12000, () => gameApi.current.timeout(g));
      });
      return true;
    },
    end(g) {
      const n = g.found;
      gameApi.current.paint(g, { holat: gameApi.current.holat(g), kutish: false });
      const text = n > 0 ? sonliGap("Barakalla! O'yinda {n} ta yulduzcha yig'ding!", n) : yulduzGap("Hechqisi yo'q, keyingi safar albatta topasan!");
      if (n > 0) flashPhase("happy", 2200);
      say(text, () => gameApi.current.wait(g, 800, () => { gameRef.current = null; setGame(null); go(g.stepIdx + 1, true); }));
    },
  };
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
      // REV102: til darsida maqtov o'sha tilda («Well done!»). REV121: boshqa fanlarda — izoh tilida (izohning o'zi maqtov bilan boshlanadi)
      if (k === q.togri) {
        setScore((x) => x + 1); flashPhase("happy");
        const speech = darsTil ? kidCorrectSpeech(testIndex, contentLanguage(q.savol, q.variantlar), q.izoh)
          : (q.izoh || (tIzoh !== "uz" ? gap(tIzoh, "Barakalla! To'g'ri!") : __kbUi("Barakalla! To‘g‘ri!")));
        say(speech || __kbUi("Barakalla! To‘g‘ri!"), after);
      } else {
        // xato javobdan keyin «Barakalla» aytilmaydi — izohdan maqtov olib tashlanadi
        flashPhase("enc");
        say(`${tIzoh !== "uz" ? gap(tIzoh, "Hechqisi yo'q! To'g'ri javob yashil rasmda.") : __kbUi("Hechqisi yo‘q! To‘g‘ri javob yashil rasmda.")} ${dropPraiseAny(q.izoh || "")}`.trim(), after);
      }
      return;
    }
    const q = savollar[testIndex];
    setPicked(k);
    if (k !== q.togri) { const asl = xatoTartib ? xatoTartib[testIndex] : testIndex; if (!xatolar.current.includes(asl)) xatolar.current.push(asl); }
    if (sinfXona) flashPhase(k === q.togri ? "happy" : "enc");   // REV177: Kabu quvonadi / dalda beradi
    const izL = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
    if (k === q.togri) { setScore((x) => x + 1); say(uiT(__kbUi("To‘g‘ri!")), () => setTimeout(() => nextQuestion(), 700)); }
    else say(q.izoh ? testOvozi({ savol: q.izoh, til: darsTil || "", iz: izL, lugat: tilLugati(lesson?.steps || [], darsTil || "", maktabSozlar) }) : uiT(__kbUi("Javob noto‘g‘ri. To‘g‘ri variant yashil bilan belgilandi.")));
  };
  const nextQuestion = () => {
    setPicked(null);
    setTestIndex((i) => {
      if (i + 1 >= savollar.length) { setMode("result"); return i; }
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
  // REV176: maktabda ham ustoz savolni va variantlarni ovoz chiqarib o'qiydi (bog'cha va repetitordagi kabi), o'quvchi o'qib-tinglab tanlaydi
  useEffect(() => {
    const qq = !kid && mode === "test" ? savollar[testIndex] : null;
    if (!qq) return undefined;
    // REV177: har qism o'z talaffuzida — kirish va A) B) interfeys tilida, nemischa so'z nemischa, izoh izoh tilida
    const kirish = testIndex === 0 ? __kbUi(xatoTartib ? "Xato qilgan savollaringizni qayta ishlaymiz. Izohni diqqat bilan o‘qing." : "Savolni tinglang va javobni tanlang.") : "";
    const matn = testOvozi({ kirish, savol: qq.savol, variantlar: qq.variantlar || [], til: darsTil || "", iz: ["uz", "ru", "en"].includes(izoh) ? izoh : "uz",
      ui: uiLocale, lugat: tilLugati(lesson?.steps || [], darsTil || "", maktabSozlar) });
    const t = setTimeout(() => say(matn), 350);
    return () => clearTimeout(t);
  }, [kid, mode, testIndex, xatoTartib]); // eslint-disable-line react-hooks/exhaustive-deps
  // REV171: «Shu yerdamisan?» — test savolida bola javob bermasa: 1) so'raydi, 2) to'g'ri javobni yoritadi,
  // 3) tasalli berib keyingi savolga o'tadi (bog'chada). Maktabda faqat eslatadi. Ilova yashirin bo'lsa — soat yurmaydi.
  useEffect(() => {
    if (mode !== "test" || picked !== null || (kid && !waiting)) return undefined;
    const q = questions[testIndex];
    if (!q) return undefined;
    const m = /(\d)/.exec(String(gradeRef.current || ""));
    const [t1, t2, t3] = kutishVaqtlari(kid, m ? Number(m[1]) : 5);
    let kutildi = 0, bosqich = 0;
    const id = setInterval(() => {
      if (globalThis.document?.visibilityState === "hidden" || speakingRef.current) return;
      kutildi += 1000;
      if (bosqich === 0 && kutildi >= t1) { bosqich = 1; say(gap(tIzoh, DIQQAT.bormi)); }
      else if (bosqich === 1 && t2 && kutildi >= t2) { bosqich = 2; setHot(q.togri); say(gap(tIzoh, DIQQAT.yordam)); }
      else if (bosqich === 2 && t3 && kutildi >= t3) {
        bosqich = 3; clearInterval(id);
        setWaiting(false); setPicked(-1);   // javob berilmadi: to'g'risi yashil ko'rinadi, ball berilmaydi
        say(gap(tIzoh, DIQQAT.tasalli), () => setTimeout(() => { if (modeRef.current === "test") nextQuestion(); }, 700));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [mode, testIndex, picked, waiting, kid]); // eslint-disable-line react-hooks/exhaustive-deps

  // REV171: bola ilovadan chiqib ketsa (boshqa ilova, telefon qulfi) — dars to'xtaydi; qaytsa ustoz «Qaytding!» deb
  // to'xtagan joyidan davom ettiradi. Chiqishlar soni va qisqa «kirib-chiqish»lar ota-onaga hisobotda ko'rsatiladi.
  const diqqat = useRef({ chiqish: 0, qisqa: 0, yoqMs: 0, chiqdi: 0, qaytdi: 0, davom: false });
  useEffect(() => {
    const onVis = () => {
      const d = diqqat.current;
      const now = Date.now();
      const darsda = ["lesson", "test", "bridge"].includes(modeRef.current);
      if (globalThis.document?.visibilityState === "hidden") {
        if (!darsda) return;
        d.chiqish += 1; d.chiqdi = now;
        if (d.qaytdi && now - d.qaytdi < 20000) d.qisqa += 1;   // qaytib, darrov yana chiqib ketdi
        if (playingRef.current || speakingRef.current) { d.davom = true; hush(); setPlaying(false); }
        return;
      }
      if (!d.chiqdi) return;
      d.yoqMs += now - d.chiqdi; const yoq = now - d.chiqdi; d.chiqdi = 0; d.qaytdi = now;
      if (!d.davom) return;
      d.davom = false;
      const davomEt = () => {
        if (modeRef.current === "lesson") { setPlaying(true); go(idxRef.current, true); }
        else if (modeRef.current === "test" && kid) readQuestion(questions[testIndexRef.current]);
      };
      if (yoq >= 4000) say(gap(tIzoh, DIQQAT.qaytdi), () => setTimeout(davomEt, 300)); else davomEt();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [kid, questions, tIzoh]); // eslint-disable-line react-hooks/exhaustive-deps

  // REV91: bog'cha — dars o'zi boshlanadi; kunlik reja tugagan bo'lsa aytiladi. Faollik ota-onaga boradi.
  useEffect(() => {
    if (!kid || !lesson || mode !== "idle") return undefined;
    let stop = false;
    (async () => {
      const today = screenTime.current();
      const res = kidPlan ? await startLesson(apiBase, token, { darsKod: topicCode, fan: kidPlan.fan, mavzu: kidPlan.mavzu || lesson.topic?.mavzu, jamiQadam: steps.length })
        : !cheklovsiz && today?.tugadi?.dars && !today.kuzatilmaydi   // REV103: reja tashqarisidan ochilgan dars ham dars vaqti tugagan bo'lsa ochilmaydi
          ? { ok: false, limit: true, vaqt: true, xabar: __kbUi("Bugungi dars vaqti tugadi. Barakalla! Endi biroz o‘ynasang bo‘ladi.") }
          : { ok: true, tracked: false };
      if (stop) return;
      if (res.limit) {
        // REV162: haftalik reja sababi — interfeys tilida (uz/ru/en), kun nomi bilan
        if (res.sabab && SABAB_MATN[res.sabab]) res.xabar = __kbUi(SABAB_MATN[res.sabab]) + (res.keyingi ? ` ${__kbUi("Keyingi dars")}: ${__kbUi(res.keyingi)}.` : "");
        setLimitText(res.xabar); setLimitKind(res.vaqt ? "vaqt" : res.rejaXabar ? "reja" : "limit"); setMode("limit");
        // REV103: bugungi dars VAQTI tugagan — robot shuni aytadi (o'yin vaqti bo'lsa, o'yinlar ochiq)
        say(res.vaqt || res.rejaXabar ? (res.xabar || __kbUi("Bugungi dars vaqti tugadi. Endi biroz o‘ynasang bo‘ladi."))
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
  // REV175: tik ushlangan telefonda (avtoburish o'chiq bo'lsa ham) dars o'zi yotiq ko'rinishga buriladi —
  // doska, ustoz va tugmalar eniga sig'adi. Qurilma ruxsat bersa — haqiqiy gorizontal holat (to'liq ekran) yoqiladi.
  const tikTelefon = () => { try { return Boolean(globalThis.matchMedia?.("(orientation: portrait) and (max-width: 600px) and (pointer: coarse)").matches); } catch { return false; } };
  const [yotiq, setYotiq] = useState(tikTelefon);
  useEffect(() => {
    const yangila = () => setYotiq(tikTelefon());
    globalThis.addEventListener?.("resize", yangila);
    globalThis.addEventListener?.("orientationchange", yangila);
    return () => { globalThis.removeEventListener?.("resize", yangila); globalThis.removeEventListener?.("orientationchange", yangila); };
  }, []);
  useEffect(() => { document.body.classList.toggle("kb-dars-yotiq", yotiq); return () => document.body.classList.remove("kb-dars-yotiq"); }, [yotiq]);
  // REV177: ekran burilganda — qisqa animatsiya (telefon belgisi aylanadi, dars sekin paydo bo'ladi)
  const [burish, setBurish] = useState(false);
  useEffect(() => {
    if (!yotiq) return undefined;
    setBurish(true);
    const t = setTimeout(() => setBurish(false), 1300);
    return () => clearTimeout(t);
  }, [yotiq]);
  // REV176: sinfxonada doskaga hamma narsa sig'sin — matn va rasmlar doska o'lchamiga qarab o'zi kichrayadi (aylantirmasdan ko'rinadi)
  useLayoutEffect(() => {
    const el = doskaRef.current;
    if (!sinfXona || !el) return undefined;
    const sigdir = () => {
      let z = 1;
      el.style.setProperty("--dx-sig", "1");
      for (let k = 0; k < 24 && el.scrollHeight > el.clientHeight + 2 && z > 0.4; k++) { z = Math.round((z - 0.05) * 100) / 100; el.style.setProperty("--dx-sig", String(z)); }
    };
    sigdir();
    const t = setTimeout(sigdir, 450);   // rasmlar yuklangach qayta o'lchanadi
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sigdir) : null;
    ro?.observe(el);
    // REV177: doska ichi o'zgarsa ham (ovozli tekshiruvda keyingi so'z, test javobi, yozuv animatsiyasi) — qayta sig'diriladi;
    // doska hech qachon pastga cho'zilmaydi va aylantirish (scroll) chiqmaydi
    let kut = 0;
    const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(() => { cancelAnimationFrame(kut); kut = requestAnimationFrame(sigdir); }) : null;
    mo?.observe(el, { childList: true, subtree: true, characterData: true });
    el.querySelectorAll("img").forEach((im) => { if (!im.complete) im.addEventListener("load", sigdir, { once: true }); });
    return () => { clearTimeout(t); ro?.disconnect(); mo?.disconnect(); cancelAnimationFrame(kut); };
  }, [sinfXona, idx, mode, testIndex, picked, variant, yotiq]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.classList.toggle("kb-focus-dars", focus);
    return () => document.body.classList.remove("kb-focus-dars");
  }, [focus]);
  useEffect(() => {
    if (!focus) return undefined;
    const key = (e) => { if (e.key === "Escape" && !kidRef.current && !document.querySelector(".dx-repetitor-oyna")) exitRef.current?.(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [focus]);
  // REV168: «telefonni yotqizing» — to'liq ekran va gorizontal holat (Android'da ishlaydi; iPhone'da bola o'zi buradi)
  // REV177: brauzerning to'liq ekran rejimi ishlatilmaydi — u «chiqish uchun ekranni pastga torting» yozuvini chiqarib,
  // darsni to'sardi. Dars sahifaning o'zida buriladi (CSS) va burilish animatsiyasi ko'rsatiladi.
  const kengaytir = () => {};
  useEffect(() => {
    if (focus) return undefined;
    try { globalThis.screen?.orientation?.unlock?.(); } catch { /* */ }
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    return undefined;
  }, [focus]);
  useEffect(() => () => { try { globalThis.screen?.orientation?.unlock?.(); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); } catch { /* */ } }, []);
  const exitLesson = () => {
    hush(); setPlaying(false); setMenu(false); setVariant(null);
    // REV177: darsdan chiqilsa — ochiq mashq, Repetitor, takror oynalari ham yopiladi va avtomatik zanjir to'xtaydi
    setMashqlar(false); setRepetitor(false); setOldiTakror(null); setSavolOchiq(false); avtoRep.current = true; zanjir.current = true;
    if (kid && onClose) { onClose(); return; }
    setMode("idle"); setIdx(-1);
    setBubble(__kbUi(kid ? "Yana o‘ynaymizmi? ▶ ni bos!" : "Dars to‘xtatildi. «Darsni boshlash» bilan qaytadan boshlang."));
  };
  // REV174: maktab o'quvchisi — dars o'qildi / savollar natijasi ota-onaning «Bugun»iga yoziladi
  const darsBosh = useRef(0);
  useEffect(() => {
    if (kid || !topicCode) return;
    // maktab yo'li: dars oxirigacha o'qilsa — «o'tildi»; birinchi urinishdagi test natijasi — yulduz
    if (mode === "end") markLessonDone(topicCode, 0);
    // REV177: dars so'zlari, test savollari va tushunchalari keyingi darslardagi spiral takror uchun saqlanadi
    if (mode === "end" || (mode === "result" && !xatoTartib)) darsniSaqla(fan || lesson?.topic?.fan || "", darsYozuvi({ kod: topicCode, mavzu: lesson?.topic?.mavzu || "",
      fan: fan || lesson?.topic?.fan || "", til: darsTil || "", iz: ["uz", "ru", "en"].includes(izoh) ? izoh : "uz", steps: lesson?.steps || [], sozlar: maktabSozlar, savollar: questions }));
    if (mode === "result" && !xatoTartib && questions.length) markLessonDone(topicCode, kidStars(score, questions.length));
    if (learnerRole !== "oquvchi" || !token) return;
    if (mode === "lesson" && !darsBosh.current) darsBosh.current = Date.now();
    if ((mode !== "end" && mode !== "result") || (mode === "result" && xatoTartib)) return;
    const soniya = darsBosh.current ? (Date.now() - darsBosh.current) / 1000 : 0;
    darsBosh.current = Date.now();   // keyingi yozuvda vaqt ikki marta qo'shilmasin
    faollikYoz(apiBase, token, { turi: "dars", kod: topicCode, fan: fan || lesson?.topic?.fan || "", mavzu: lesson?.topic?.mavzu || "",
      ...(mode === "result" && questions.length ? { togri: score, jami: questions.length } : {}), soniya });
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const exitRef = useRef(exitLesson);
  exitRef.current = exitLesson;
  useEffect(() => {
    if (!kid || mode !== "result") return;
    // REV121: yulduz — test va «Top-chi» o'yinidagi to'g'ri javoblar ulushi; hech biri to'g'ri bo'lmasa — 0 yulduz
    const all = Object.values(gameRes.current);
    const togri = score + all.reduce((n, r) => n + r.found, 0);
    const jami = questions.length + all.reduce((n, r) => n + r.total, 0);
    const local = kidStars(togri, jami);
    markLessonDone(topicCode, local);
    // REV110: o'rgangan so'zlarini eslab qolamiz — keyingi dars boshida ustoz shulardan so'raydi (faqat til darsida)
    eslab({ code: topicCode, mavzu: lesson?.topic?.mavzu || "", sozlar: darsTil ? darsSozlari(steps.slice(opening.length), kinds.slice(opening.length)) : [] });
    const sozlar = bugungiSozlar();
    setKidResult({ yulduz: local, sozlar });
    const wasTracked = kidTracker.active() === topicCode;
    if (wasTracked) kidTracker.finish();
    (async () => {
      const res = wasTracked || kidPlan ? await finishLesson(apiBase, token, { darsKod: topicCode, togri, jami, ortachaMs: answerSpeed(answerTimes.current), ovozTogri: voiceRef.current?.togri || 0, ovozJami: voiceRef.current?.jami || 0, sozlar, diqqat: diqqat.current }) : null;
      const out = { yulduz: Number.isFinite(Number(res?.yulduz)) ? Number(res.yulduz) : local, bugunTugadi: Boolean(res?.bugun_tugadi), qoldi: res?.qoldi, sozlar };
      setKidResult(out);
      onKidFinished?.(out, res?.reja || null);
    })();
    if (local > 0) flashPhase("happy", 3200); else flashPhase("enc", 2400);
    const g3 = (uz, key) => (darsTil && darsTil !== izoh ? yulduzGap(key) : tIzoh !== "uz" ? gap(tIzoh, key) : __kbUi(uz));
    say(local === 3 ? g3("Barakalla! Uchta yulduz! Sen zo‘rsan!", "Barakalla! Uchta yulduz! Sen zo'rsan!")
      : local > 0 ? g3("Yaxshi harakat! Yana o‘ynasak, yulduzlar ko‘payadi!", "Yaxshi harakat! Yana o'ynasak, yulduzlar ko'payadi!")
        : g3("Bu safar yulduzcha yo‘q. Qani, yana bir bor urinib ko‘ramiz!", "Bu safar yulduzcha yo'q. Qani, yana bir bor urinib ko'ramiz!"));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (kid || mode !== "result" || !savollar.length) return;
    const pass = score / savollar.length >= 0.7;
    say(pass ? __kbUi("Barakalla! Siz mavzuni o‘zlashtirdingiz.") : __kbUi("Yaxshi harakat! Keling, asosiy qismni yana bir bor ko‘rib chiqamiz."));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // REV168: yuklanayotganda — tez chiqadigan tushunarli «sinfxona» (bo'sh oyna emas); dars kelgach chiroylisi
  if (loading) return <div className={`dx-loading ${kid ? "is-kid" : ""}`} role="status">
    <div className="dx-loading-stage" aria-hidden="true"><span className="dx-loading-board">{kid ? "✏️ 🍎 ⭐" : "📘"}</span><span className="dx-loading-teacher">{kid ? "👩‍🏫" : "🧑‍🏫"}</span></div>
    <p>{__kbUi(kid ? "Ustoz darsni tayyorlayapti…" : "Dars yuklanmoqda…")}</p>
  </div>;
  if (error) return <div className="dx-empty"><p>{__kbUi(error)}</p>{onChat && <button type="button" className="dx-btn dx-primary" onClick={onChat}>{__kbUi("AI ustoz bilan suhbatda o‘rganish")}</button>}</div>;

  const range = step ? sceneRange(steps, idx) : [];
  const list = lesson?.variants?.[step?.id] || [];
  const words = bubble.split(/\s+/).filter(Boolean);
  const q = mode === "test" ? (kid ? questions[testIndex] : savollar[testIndex]) : null;
  const pass = savollar.length ? score / savollar.length >= 0.7 : true;
  // REV98: bog'cha sahnasi — yozuv yo'q: robot, jonli rasm va harakat belgilari.
  const kidSrc = kid && step ? `${step.ovoz || ""} ${step.doska || ""}` : "";
  const kidActs = kid && step && mode === "lesson" ? stepActions(kidSrc) : [];
  const kidKind = kid && mode === "lesson" ? kinds[idx] || "" : "";
  // Rasm manzili → {belgi (emoji), soz}: kitobdagi rasm_sozlar («🍎|apple») yoki rasmlar («🍎»)
  const picWord = (u) => {
    for (const [k, v] of Object.entries(lesson?.rasm_sozlar || {})) if (v === u) { const [belgi, soz = ""] = k.split("|"); return { belgi, soz }; }
    for (const [k, v] of Object.entries(lesson?.rasmlar || {})) if (v === u) return { belgi: k, soz: "" };
    return {};
  };
  const kidPics = (() => {
    if (!kid || !step || mode !== "lesson") return [];
    // REV122: rasm qaysi so'zniki ekanini eslab qolamiz — bosilganda nomi aytiladi
    // REV144: har rasm o'z ma'nosiga mos 1–2 soniyalik harakat qiladi (anim); emoji karta — chizilgan rasm bilan
    // REV151: kitob rasmi o'rniga — shu so'zning rassom chizgan rasmi (bo'lsa)
    const pic = (u, i) => {
      const w = picWord(u); const ch = (w.soz || w.belgi) ? sozRasmi(w.soz, w.belgi) : null;
      // REV158: rassom rasmi bo'lmasa — belgi kartasi (kitobdagi o'yinchoqsimon rasm emas); belgisiz rasm — kitobniki
      if (!ch?.src && w.belgi) { const q = belgiQatori(w.belgi); return { emoji: w.belgi, src: "", qator: q || undefined, rev: picRev, label: w.soz || `rasm ${i + 1}`, ...w, anim: harakatTuri(sozId({ soz: w.soz, emoji: w.belgi })) }; }
      return { src: ch?.src || mediaUrl(u), rev: picRev, label: `rasm ${i + 1}`, ...w, anim: harakatTuri(sozId({ soz: w.soz, emoji: w.belgi })) };
    };
    const qatorSozi = (e) => { const q = String(step?.doska || "").split(/\n+/).find((l) => l.includes(e)); return q ? q.slice(q.indexOf(e) + e.length).split(/[,!?.]/)[0].trim() : ""; };
    const karta = (e, extra = {}) => { const r = emojiRasm(e, RASM_HAMMA, darsTil === "en" ? qatorSozi(e) : ""); return { emoji: e, src: r?.src || "", anim: harakatTuri(r?.id || sozId({ emoji: e })), rev: picRev, ...extra }; };
    if (variant?.rasm) return [pic(variant.rasm, 0)];
    // REV140: salomlashish va ob-havo qadamida doskaga belgi-stikerlar (👋 🙂 😊) chiqmaydi — ustoz qo'l silkitadi,
    // ob-havoda bola derazaga qaraydi (deraza nurlanadi)
    if (step._ochilish === "salom" || step._ochilish === "havo") return [];
    // REV121: o'yin — nishonlar (rasm yoki emoji karta), holati bilan: kutilmoqda / to'g'ri / xato / mana u
    if (game && game.stepIdx === idx) {
      return game.targets.map((t, i) => {
        const mt = t.src ? null : matnId(t.word);
        const r = t.src ? null : ((mt && RASM_HAMMA[mt] ? { id: mt, src: RASM_HAMMA[mt] } : null) || emojiRasm(t.emoji, RASM_HAMMA) || (() => { const id = sozId({ soz: darsTil === "en" ? t.word : "", emoji: t.emoji }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })());
        return { src: t.src || r?.src || "", emoji: t.src || r ? "" : t.emoji, qator: t.src || r ? undefined : t.qator, rev: picRev, label: t.word,
          anim: harakatTuri(sozId({ soz: t.word, emoji: t.emoji })), holat: game.holat[i] || (game.kutish ? "wait" : "") };
      });
    }
    // REV99: doskadagi emojilar (masalan «Top-chi» o'yini: 👋 🙋 🐱) → kitobdagi jonli rasmlar, bosib o'ynaladi
    const board = emojiPictures(step.doska, lesson?.rasmlar, lesson?.rasm_sozlar);
    // REV121: rasm bo'lmasa — doskadagi emoji kartalar, sanoq saqlanadi («🍎🍎🍎» — uchta olma, «🔴🔵🔴🔵» — naqsh)
    const cards = boardCards(step.doska).map((e, i) => karta(e, { label: `rasm ${i + 1}` }));
    // REV153: doska bandi → rasm: rassom chizgani (so'z yoki belgi bo'yicha) → kitob rasmi → belgi kartasi
    const nomlar = lessonWords(steps, kinds);
    const bandlar = doskaBandlari(step.doska);
    const band = (b, i) => {
      const soz = b.soz || nomlar.get(b.emoji.replace(/\uFE0F/g, "")) || "";
      const extra = { label: soz || `rasm ${i + 1}`, soz, belgi: b.emoji, rev: picRev };
      if (sanoqKarta(b.emoji)) {
        // REV153: sanoq/naqsh — har belgi o'rniga rassom chizgan rasm («🍎🍎🍎» → uchta chizilgan olma), «❓» — so'roq
        const qator = belgiQatori(b.emoji);
        if (qator) return { emoji: b.emoji, src: "", qator, ...extra };
        return { emoji: b.emoji, src: "", ...extra };
      }
      // REV153: so'z istalgan tilda yoki doskadagi tarjimasi («🔴 أَحْمَر / qizil») bo'yicha ham topiladi
      // REV158: son yoki vaqt («7:00», «2026») — so'z emas, rasm qidirilmaydi (oldin «7» sakkizoyoq rasmini topardi)
      const mid = /^[\d\s:.,/-]+$/.test(soz) ? null : matnId(soz, b.mano || []);
      const ch = (mid && RASM_HAMMA[mid] ? { id: mid, src: RASM_HAMMA[mid] } : null)
        || (darsTil === "en" && soz && (() => { const id = sozId({ soz, emoji: "" }); return id && RASM_HAMMA[id] ? { id, src: RASM_HAMMA[id] } : null; })())
        || emojiRasm(b.emoji, RASM_HAMMA, darsTil === "en" ? soz : "");
      if (ch?.src) return { src: ch.src, anim: harakatTuri(ch.id || sozId({ soz, emoji: b.emoji })), chizilgan: true, ...extra };
      // REV153: juftlik/guruh («🐰➡🥕», «🐔🥚») — har biri chizilgan bo'lsa, rasmlar qatori
      const qator = belgiQatori(b.emoji);
      if (qator) return { emoji: b.emoji, src: "", qator, chizilgan: true, ...extra };
      // REV158: kitobdagi eski rasm (o'yinchoqqa o'xshaydi) ishlatilmaydi — belgi kartasi; darsning boshida ham,
      // o'yinda ham, oxirida ham bir so'zga bitta rasm
      return { emoji: b.emoji, src: "", anim: harakatTuri(sozId({ emoji: b.emoji })), ...extra };
    };
    if (kidKind === "game") {
      // REV102: yangi darsdagi o'yinda faqat shu darsda o'rgatilgan so'zlarning rasmlari (o'tgan darslar rasmi chalg'itardi)
      const mine = board.filter((u) => newPics.has(u));
      const list = (mine.length ? mine : [...newPics]).slice(0, 6);
      if (list.length) return list.map(pic);
      if (cards.length) return cards;
    } else if (bandlar.length >= 2) {
      // REV153: bir qadamda bir nechta narsa («👋 Hello / 🙋 Hi», «🟢 Green, 👏 Clap») — HAMMASI chiqadi (6 tagacha),
      // har biri o'z so'zi bilan: ustoz qaysi birini aytsa yoki bola qaysi birini aytishi kerak bo'lsa — o'shasi kattalashadi
      return bandlar.map(band);
    } else if (board.length >= 2) {
      return board.slice(0, 6).map(pic);
    }
    // REV153: bitta narsa — rassom rasmi bo'lsa, kitobdagi (eski, o'yinchoq) rasm o'rniga o'sha
    const yakka = bandlar.length === 1 ? band(bandlar[0], 0) : null;
    if (yakka?.chizilgan || yakka?.qator) return [yakka];
    if (step.rasm) return [pic(step.rasm, 0)];
    if (bandlar.length === 1 && !sanoqKarta(bandlar[0].emoji)) return [band(bandlar[0], 0)];
    if (board.length) return board.slice(0, 6).map(pic);
    if (cards.length) return cards;
    // REV140: doska bo'sh qolmasin — ustoz aytayotgan so'zlarning kitobdagi rasmlari; kirish va xulosada — bugungi rasmlar
    const aytilgan = matnRasmlari(`${step.sarlavha || ""} ${kidSrc}`, lesson?.rasm_sozlar);
    if (aytilgan.length) return aytilgan.map(pic);
    if ((kidKind === "intro" || kidKind === "summary") && !step._ochilish && newPics.size) return [...newPics].slice(0, 6).map(pic);
    if (kidKind !== "new") return [];   // takror, o'yin — begona stiker chiqmaydi
    // REV151: kod bilan chizilgan stikerlar o'rniga — rassom rasmlari (bo'lsa)
    // REV153: kod bilan chizilgan SVG stikerlar butunlay olib tashlandi — faqat rassom rasmlari («three» — son kartasi)
    const CHIZILGAN = { hello: RASM_HAMMA.d_hello, red: RASM_HAMMA.d_red, big: RASM_HAMMA.d_big, small: RASM_HAMMA.d_small, cat: RASM_HAMMA.cat, apple: RASM_HAMMA.apple, jump: RASM_HAMMA["d_can-jump"] };
    return stickerKeys(kidSrc).map((key) => (CHIZILGAN[key] ? { src: CHIZILGAN[key], key, label: key, rev: picRev } : key === "three" ? { emoji: "3️⃣", src: "", key, label: key, rev: picRev } : null)).filter(Boolean);
  })();
  // REV153: aytilayotgan (yoki bola aytishi kerak bo'lgan) rasm kattalashadi, qolganlari bir oz xiralashadi
  const faol = kid && mode === "lesson" && !(game && game.stepIdx === idx) && !variant
    ? faolRasm(kidPics, sayWords.current, speaking ? word : -1, mikSoz && mikSoz.holat !== "no" ? mikSoz.phrase : "") : -1;
  const doskaRasmlari = faol >= 0 ? kidPics.map((p, i) => ({ ...p, faol: i === faol })) : kidPics;
  const badge = kindBadge(kidKind);
  const kidMood = kidPhase || (mode === "idle" || mode === "bridge" ? "wave" : speaking ? kabuMood(step, "speaking") : mode === "lesson" ? kabuMood(step, "waiting") : mode === "result" ? "happy" : "");
  const STICKER_SAY = { hello: "Hello!", red: "Red!", three: "Three!", big: "Big!", small: "Small!", cat: "Cat!", apple: "Apple!", jump: "I can jump!" };
  const tapKid = (i) => {
    const p = kidPics[i];
    if (!p) return;
    // REV121: o'yinda — javob sifatida tekshiriladi (to'g'ri — yulduz, xato — yulduz yo'q)
    if (game && game.stepIdx === idx) { if (!gameApi.current.tap(i)) pop(); return; }
    // O'yindan tashqarida bosish — maqtov emas: rasm silkinadi va (bilsa) nomi aytiladi
    setPicRev((r) => r + 1); pop();
    if (speakingRef.current) return;   // ustoz gapirayotgan bo'lsa — darsni bo'lmaydi
    if (p?.key) { say(`[en]${STICKER_SAY[p.key]}[/en]`); return; }
    const belgi = String(p?.emoji || p?.belgi || "").replace(/\uFE0F/g, "");
    const name = (belgi && lessonWords(steps, kinds).get(belgi)) || p?.soz || "";
    if (name) say(darsTil ? `[${darsTil}]${name}[/${darsTil}]` : izohTeg(name, izoh));
  };

  return <section className={`dx-root dx-aud-${audience} dx-theme-${theme} ${focus ? "dx-focus" : ""} ${yotiq ? "dx-yotiq" : ""} ${sinfXona ? `dx-sinf dx-ustoz-${joy.ustoz}` : ""} ${kabuMuhit ? "dx-kabu-muhit" : ""} ${savolOchiq && !kabuMuhit ? "dx-savol-ochiq" : ""} ${burish ? "dx-burilmoqda" : ""}`} aria-label={__kbUi("Dars xonasi")}>
    {burish && <div className="dx-burish" aria-hidden="true"><span className="dx-burish-tel">📱</span><b>{__kbUi("Ekran burilmoqda…")}</b></div>}
    <header className="dx-head">
      {(focus || (yotiq && onClose)) && <button type="button" className="dx-exit" onClick={focus ? exitLesson : () => { hush(); onClose?.(); }} aria-label={__kbUi("Darsni yopish")} title={__kbUi("Darsni yopish")}>{kid ? <B e="🏠" /> : "✕"}</button>}
      <div>
        <h2>{lesson.topic?.mavzu || topicCode}</h2>
        {!kid && <p>{[lesson.topic?.fan, lesson.topic?.sinf && (/^\d+$/.test(String(lesson.topic.sinf)) ? `${lesson.topic.sinf}-sinf` : String(lesson.topic.sinf)), lesson.topic?.daraja && `${__kbUi("Daraja")} ${lesson.topic.daraja} / 30`].filter(Boolean).join(" · ")}</p>}
      </div>
      <div className="dx-head-actions">
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("pdf")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ PDF")}</a>}
        {!kid && <a className="dx-btn dx-link" href={downloadUrl("docx")} download title={__kbUi("Ochiq dars ishlanmasi")}>{__kbUi("⬇ Word")}</a>}
        {kid && (questions.length > 0 || gameTotal > 0) && <span className="dx-chip dx-stars" aria-label={`${score + gameScore} ⭐`}>⭐ {score + gameScore}</span>}
        <span className="dx-chip">{mode === "test" ? __kbUi("Test") : mode === "ovoz" ? <B e="🎤" /> : `${Math.max(1, idx + 1)} / ${steps.length}`}</span>
      </div>
    </header>
    {kid && focus && <button type="button" className="dx-rotate" onClick={kengaytir}><i aria-hidden="true">📱</i>{__kbUi("Telefonni yotqizing — dars kattaroq ko‘rinadi")}</button>}
    <div className="dx-steps" role="group" aria-label={__kbUi("Dars qadamlari")}>
      {steps.map((s, i) => <button key={s.id} type="button" aria-label={`${i + 1}`} onClick={() => { setPlaying(false); go(i, false); }}
        className={`dx-step ${i < idx || ["test", "result", "end", "ovoz"].includes(mode) ? "is-done" : i === idx ? "is-now" : ""} ${kid ? `k-${kinds[i]}` : ""}`} />)}
    </div>

    <div className="dx-room">
      {sinfXona && !kabuMuhit && <div className="dx-sinf-fon" aria-hidden="true">
        <UstozSahna ustoz={ustozRef.current} mood={kidMood} pictures={[]} havo={havo} vaqt={vaqt} shamol={shamol} speaking={speaking && !["test", "ovoz", "result"].includes(mode)} mouth={mouthLevel} doskaYoq />
      </div>}
      {kabuMuhit && <div className="dx-kabu-fon" aria-hidden="true"><i className="kf-yulduz" /><i className="kf-sayyora" /><i className="kf-bulut" />
        <div className="dx-kabu-robot"><KidStage compact mood={kidMood || (speaking ? "talk" : "think")} celebrate={celebrate} speaking={speaking} /></div></div>}
      <div className="dx-frame" style={sinfXona ? foiz(kabuMuhit ? KABU_JOY.doska : joy.doska) : undefined}>
        <div className="dx-board" aria-live="polite" ref={doskaRef}>
          {kid && badge && <div className={`dx-kind is-${kidKind}`} role="status" aria-label={__kbUi(badge[1])}><span aria-hidden="true">{badge[0]}</span></div>}
          {kid && ["idle", "lesson", "bridge"].includes(mode) && <div className={`dx-kind-frame k-${kidKind || "none"}`}>{/* REV110: jonli ustoz va haqiqiy sinfxona */}<UstozSahna ustoz={ustozFor(fan || lesson?.topic?.fan)} mood={kidMood} celebrate={celebrate} pictures={doskaRasmlari} havo={havo} derazaga={mode === "lesson" && step?._ochilish === "havo"} havo2={step?._havo || ""} doskaYoq={mode === "lesson" && Boolean(step?._ochilish)} vaqt={vaqt} shamol={shamol} speaking={speaking} mouth={mouthLevel} soz={speaking && word >= 0 ? sayWords.current[word] || "" : ""} onTap={tapKid}
            onDetal={(d) => { if (speakingRef.current) return; const m = d.matn?.[tIzoh] || d.matn?.uz || ""; if (m) say(tIzoh === "uz" ? m : izohTeg(m, tIzoh)); }} />
            {mikSoz && mode === "lesson" && <div className={`dx-mic-soz is-${mikSoz.holat}`} role="status" aria-live="polite">
              <span className="dx-mic-ikon" aria-hidden="true"><B e={mikSoz.holat === "ok" ? "⭐" : mikSoz.holat === "no" ? "💛" : "🎤"} /></span>
              {/* REV156: bolaga yozuv yo'q — so'zni ustoz aytadi; ekranda faqat mikrofon holati */}
              <b className="dx-sr" lang={mikSoz.lang}>{mikSoz.phrase}</b>
            </div>}</div>}
          {/* REV145: dars boshida (salomlashish va kirish qismida) — bugun nimani o'rganadi (bola ham, yonidagi ota-ona ham aniq ko'radi) */}
          {/* REV158: doskada rasm bo'lsa (vaqt, takror) maqsad kartasi uning ustiga chiqmaydi */}
          {kid && (mode === "idle" || (mode === "lesson" && idx <= opening.length && !doskaRasmlari.length)) && (() => {
            const sozlar = darsTil ? darsSozlari(steps.slice(opening.length), kinds.slice(opening.length)).slice(0, 5) : [];
            if (!sozlar.length) return null;
            return <div className="dx-goal" aria-label={__kbUi("Bugun o‘rganamiz")}>
              {/* REV156: 2–7 yosh — ekranda gap/yozuv yo'q: faqat 🎯 va bugungi so'zlarning rasmlari */}
              <small aria-hidden="true"><B e="🎯" /></small>
              <ul>{sozlar.map((w) => { const r = sozRasmi(w.say, w.emoji); return <li key={w.say} aria-label={w.say}>
                {r ? <img src={r.src} alt="" draggable="false" /> : belgiQatori(w.emoji) ? <span className="dx-goal-qator" aria-hidden="true">{belgiQatori(w.emoji).map((x, j) => x.src ? <img key={j} src={x.src} alt="" draggable="false" /> : <b key={j}>{x.t}</b>)}</span>
                  : w.emoji ? <span aria-hidden="true">{keycapNumber(w.emoji) || w.emoji}</span> : null}</li>; })}</ul>
            </div>;
          })()}
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
          {mode === "ovoz" && <VoiceCheck key={topicCode} items={voiceItems} audience={audience} say={say} hush={hush} speaking={speaking} onDone={voiceDone} bilgan={bilgan} izoh={tIzoh} rasm={(it) => (it?.emoji || it?.phrase ? sozRasmi(it.phrase, it.emoji) : null)} />}
          {mode === "test" && q && <div className="dx-test">
            {kid && isReviewQuestion(q) && <div className="dx-kind is-review" role="status" aria-label={__kbUi("Takrorlash")}><span aria-hidden="true">🔁</span></div>}
            {kid ? <div className="dx-kid-ask"><KidStage compact mood={kidPhase || (speaking ? "talk" : "think")} celebrate={celebrate} speaking={speaking} />
              {/* REV121: savoldagi rasmlar (naqsh, sanoq, ortiqchasi) — bola ko'rib o'ylaydi */}
              {questionCard(q.savol) && <div className={`dx-kid-qcard sz-${cardSize(questionCard(q.savol))}`} aria-hidden="true">{questionCard(q.savol)}</div>}
              <button type="button" className="dx-listen dx-listen-big" onClick={() => readQuestion(q)} aria-label={__kbUi("Qayta eshitish")}><B e="🔊" /></button></div>
              : <><h3 className="dx-title">{xatoTartib ? `🔁 ${__kbUi("Xatolar ustida ishlash")}` : __kbUi("Test")} · {testIndex + 1} / {savollar.length}</h3>
                <div className="dx-q"><BoardText text={stripSpeechTags(q.savol)} /></div></>}
            {kid ? <div className={`dx-kid-opts dx-n${q.variantlar.length}`}>{kidOptions(Object.fromEntries(q.variantlar.map((o, k) => [`option_${"abcd"[k]}`, o])), q.savol).map((o, k) => <div key={k} className="dx-kid-wrap"><button type="button" onClick={() => pick(k)} disabled={picked !== null}
              className={picked === null ? `${hot === k ? "is-hot" : ""} ${waiting ? "is-waiting" : ""}` : k === q.togri ? "is-ok" : k === picked ? "is-no" : "is-dim"} style={{ "--i": k }}>{kidOptionPic(o, lesson?.rasmlar, mediaUrl, lesson?.rasm_sozlar) ? <img className="dx-kid-img" src={kidOptionPic(o, lesson?.rasmlar, mediaUrl, lesson?.rasm_sozlar)} alt="" draggable="false" /> : kidOptionQator(o.picture) ? <span className={`kb-qator ${qatorNaqshmi(kidOptionQator(o.picture)) ? "is-satr" : ""}`} aria-hidden="true">{kidOptionQator(o.picture).map((x, j) => x.src ? <img key={j} src={x.src} alt="" draggable="false" /> : <b key={j}>{x.t}</b>)}</span> : (keycapNumber(o.picture) ? <span className="dx-kid-pic kb-num">{keycapNumber(o.picture)}</span> : <span className={`dx-kid-pic sz-${cardSize(o.picture || "x")}`}>{o.picture || (o.listen ? k + 1 : o.letter)}</span>)}</button>
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
              {darsTil && !kid && <button type="button" className="dx-btn dx-primary dx-mashqlar" onClick={() => { hush(); setMashqlar(true); }}>🏋️ {__kbUi("Dars mashqlari")}: {__kbUi("o‘qish, gapirish, diktant")}</button>}
              {questions.length > 0 && <button type="button" className={`dx-btn ${darsTil ? "" : "dx-primary"}`} onClick={startQuiz}>{__kbUi(`Shu yerda ${questions.length} ta savol`)}</button>}
              {maktabSozlar.length > 0 && <button type="button" className="dx-btn dx-repetitor" onClick={() => { hush(); setRepetitor(true); }}>🤖 {__kbUi("Repetitor")}: {maktabSozlar.length} {__kbUi("ta yangi so‘z")}</button>}
              {onOpenTest && <button type="button" className="dx-btn" onClick={onOpenTest}>{__kbUi("Test bo‘limida to‘liq test")}</button>}
              {voiceReady && <button type="button" className="dx-btn" onClick={() => { hush(); setVoice(null); voiceRef.current = null; setMode("ovoz"); }}>🎤 {__kbUi("Ovozli tekshiruvni qayta o‘tish")}</button>}
              <button type="button" className="dx-btn" onClick={() => { setPlaying(false); go(0, false); }}>{__kbUi("Darsni qaytadan ko‘rish")}</button>
              {nextLesson && <button type="button" className="dx-btn dx-next" onClick={() => { hush(); nextLesson.open(); }}>{__kbUi("Keyingi dars")}: {nextLesson.title} ➜</button>}
            </div>
            {!questions.length && !onOpenTest && <p className="dx-why">{__kbUi("Bu mavzu uchun Test bazasida savol hali yo‘q.")}</p>}
          </div>}
          {kid && mode === "limit" && <div className="dx-kid-end">
            <span className="dx-kid-big" aria-hidden="true">{limitKind === "vaqt" ? "⏰" : limitKind === "reja" ? "📅" : "🌙"}</span>
            <h3 className="dx-title">{__kbUi(limitKind === "vaqt" ? "Bugungi dars vaqti tugadi" : limitKind === "reja" ? "Haftalik reja" : "Bugungi yangi darslar tugadi")}</h3>
            <p className="dx-kid-note">{__kbUi(limitText || "Yangi dars ertaga ochiladi. O‘tilgan darslarni takrorlash va o‘yinlar ochiq.")}</p>
            {onClose && <button type="button" className="dx-kid-go" onClick={() => { hush(); onClose(); }}><B e="🏠" /> {__kbUi("Darslarga qaytish")}</button>}
          </div>}
          {kid && mode === "result" && <div className="dx-kid-end">
            <KidStage compact mood={kidMood} celebrate={celebrate} speaking={speaking} />
            <div className="dx-kid-stars" aria-label={`${kidResult?.yulduz ?? 0} ⭐`}>{[1, 2, 3].map((n) => <span key={n} className={n <= (kidResult?.yulduz ?? 0) ? "is-on" : ""} style={{ "--i": n }}><B e="⭐" /></span>)}</div>
            {(questions.length > 0 || gameTotal > 0) && <p className="dx-kid-note">{score + gameScore} / {questions.length + gameTotal} ✓</p>}
            {voice?.jami > 0 && <p className="dx-kid-note"><B e="🎤" /> {voice.togri} / {voice.jami}</p>}
            {/* REV145: «Bugun o'rgandim» — har so'z rasmi bilan; aytgan so'ziga yulduz */}
            {kidResult?.sozlar?.length > 0 && <div className="dx-kid-words" aria-label={__kbUi("Bugun o‘rgandim")}>
              <small>{__kbUi("Bugun o‘rgandim")}</small>
              <ul>{kidResult.sozlar.map((w) => { const r = sozRasmi(w.soz, w.emoji); return <li key={w.soz} className={w.aytdi ? "is-ok" : ""}>
                {r ? <img src={r.src} alt="" draggable="false" /> : belgiQatori(w.emoji) ? <span className="dx-goal-qator" aria-hidden="true">{belgiQatori(w.emoji).map((x, j) => x.src ? <img key={j} src={x.src} alt="" draggable="false" /> : <b key={j}>{x.t}</b>)}</span>
                  : w.emoji ? <span aria-hidden="true">{keycapNumber(w.emoji) || w.emoji}</span> : null}
                <b lang={darsTil}>{w.soz}</b>{w.aytdi && <i aria-label={__kbUi("aytdi")}><B e="⭐" /></i>}</li>; })}</ul>
            </div>}
            {nextLesson && !kidResult?.bugunTugadi
              ? <button type="button" className="dx-kid-go" onClick={() => { hush(); nextLesson.open(); }}>▶ {__kbUi("Keyingi dars")}</button>
              : <p className="dx-kid-note">🌙 {__kbUi("Bugungi darslar tugadi. Ertaga yangi dars ochiladi!")}</p>}
            <div className="dx-row">
              <button type="button" className="dx-btn" onClick={() => { setScore(0); setKidResult(null); gameRes.current = {}; setGameScore(0); setGameTotal(0); setPlaying(true); go(0, true); }}>🔁 {__kbUi("Yana bir bor")}</button>
              {onClose && <button type="button" className="dx-btn" onClick={() => { hush(); onClose(); }}>🏠 {__kbUi("Darslar")}</button>}
            </div>
          </div>}
          {!kid && mode === "result" && <div className="dx-test">
            <h3 className="dx-title">{__kbUi("Natija")}</h3>
            {savollar.length > 0 && <div className="dx-score">{score} / {savollar.length}</div>}
            {xatolar.current.length > 0 && <p className="dx-why">{__kbUi("Repetitor maslahati: xato qilgan savollaringizni hoziroq qayta ishlang — shunda mavzu mustahkam esda qoladi.")}</p>}
            {voice?.jami > 0 && <p className="dx-voice-score">🎤 {__kbUi("Ovozli tekshiruv")}: {voice.togri} / {voice.jami}</p>}
            <p className="dx-why">{pass ? __kbUi("Zo‘r! Mavzu o‘zlashtirildi.") : __kbUi("Asosiy qismni yana bir bor ko‘rib chiqamiz.")}</p>
            <div className="dx-row">
              {maktabSozlar.length > 0 && <button type="button" className="dx-btn dx-repetitor" onClick={() => { hush(); setRepetitor(true); }}>🤖 {__kbUi("Repetitor")}: {maktabSozlar.length} {__kbUi("ta yangi so‘z")}</button>}
              {xatolar.current.length > 0 && <button type="button" className="dx-btn dx-primary" onClick={xatoIshlash}>🔁 {__kbUi("Xatolar ustida ishlash")} ({xatolar.current.length})</button>}
              {!pass && <button type="button" className={`dx-btn ${xatolar.current.length ? "" : "dx-primary"}`} onClick={() => { setPlaying(false); go(Math.max(0, steps.findIndex((s) => s.turi === "qoida")), false); }}>{__kbUi("Qoidani qayta ko‘rish")}</button>}
              {onOpenTest && <button type="button" className="dx-btn" onClick={onOpenTest}>{__kbUi("To‘liq testni ishlash")}</button>}
              {nextLesson && <button type="button" className="dx-btn dx-next" onClick={() => { hush(); nextLesson.open(); }}>{__kbUi("Keyingi dars")}: {nextLesson.title} ➜</button>}
            </div>
          </div>}
        </div>
        <div className="dx-ledge" aria-hidden="true" />
      </div>

      {!kid && <aside className={`dx-teacher ${speaking ? "is-speaking" : ""}`} aria-label={__kbUi("O‘qituvchi")} style={sinfXona ? foiz(kabuMuhit ? KABU_JOY.gap : joy.gap) : undefined}>
        {USTOZLAR[ustozRef.current] && !sinfXona && <div className="dx-jonli-ustoz">
          <UstozXonacha ustoz={ustozRef.current} doska={(step?.sarlavha || lesson?.topic?.mavzu || "").replace(/\[\/?[a-z]{2}\]/g, "").slice(0, 60)} gapir={speaking} />
        </div>}
        <div className="dx-teacher-head">
          {!USTOZLAR[ustozRef.current] && <div className="dx-avatar">{kid ? <span className="dx-bird" aria-hidden="true"><B e="🕊️" /></span> : <TeacherAvatar />}</div>}
          <div><strong>{USTOZ_ISMI[ustozRef.current]?.[["uz", "ru", "en"].includes(izoh) ? izoh : "uz"] || __kbUi(labels.teacher)}</strong><span className="dx-state"><i />{speaking ? __kbUi("Gapirmoqda…") : playing ? __kbUi("Tinglayapti") : __kbUi("Pauza")}</span></div>
        </div>
        <div className="dx-bubble">{words.map((w, i) => <span key={i} className={i === word ? "is-on" : ""}>{w} </span>)}</div>
        {!kid && <form className="dx-ask" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <label htmlFor={`dx-ask-${topicCode}`}>{__kbUi("O‘qituvchiga savol")}{sinfXona && <button type="button" className="dx-ask-yop" onClick={() => setSavolOchiq(false)} aria-label={__kbUi("Yopish")}>✕</button>}</label>
          <div className="dx-row"><input id={`dx-ask-${topicCode}`} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={__kbUi("Masalan: nega maxraj o‘zgarmaydi?")} disabled={asking} />
            <button type="submit" className="dx-btn" disabled={asking || !question.trim()}>{asking ? "…" : __kbUi("So‘rash")}</button></div>
          {askReply && <p className="dx-reply">{askReply}</p>}
        </form>}
        {lesson.manba?.kitob && <p className="dx-source">{__kbUi("Manba: ")}{lesson.manba.kitob}{lesson.auto ? __kbUi(" · kitob asosida avtomatik yig‘ilgan dars") : ""} · {APP_VERSION}</p>}
      </aside>}
    </div>
    {/* REV177: takror, mashqlar va Repetitor oynalari — xona ichida emas, butun dars ekranida (telefon buralganda ham to'liq) */}
    {oldiTakror && <div className="dx-repetitor-oyna" role="dialog" aria-modal="true" aria-label={__kbUi("Darsdan oldin takror")}>
      <React.Suspense fallback={<p className="dx-why">⏳</p>}>
        <DarsOldiTakror apiBase={apiBase} iz={["uz", "ru", "en"].includes(izoh) ? izoh : "uz"} sinf={Number(/(\d{1,2})/.exec(String(grade || lesson?.topic?.sinf || ""))?.[1]) || 5} darslar={oldiTakror}
          onTugadi={(r) => {
            takrorBelgila(topicCode); setOldiTakror(null);
            if (learnerRole === "oquvchi" && token && r?.jami) faollikYoz(apiBase, token, { turi: "takror", kod: `takror:${topicCode}`, fan: fan || lesson?.topic?.fan || "", mavzu: `Darsdan oldin takror: ${lesson?.topic?.mavzu || ""}`, togri: r.togri, jami: r.jami });
            togglePlay();
          }}
          onOtkaz={() => { takrorBelgila(topicCode); setOldiTakror(null); togglePlay(); }} />
      </React.Suspense>
    </div>}
    {mashqlar && <div className="dx-repetitor-oyna" role="dialog" aria-modal="true" aria-label={__kbUi("Dars mashqlari")}>
      <React.Suspense fallback={<p className="dx-why">⏳</p>}>
        <MaktabMashqlar apiBase={apiBase} til={darsTil} iz={["uz", "ru", "en"].includes(izoh) ? izoh : "uz"} ustoz={ustozRef.current} steps={steps} sozlar={maktabSozlar} mavzu={lesson?.topic?.mavzu || ""}
          avto
          onTest={questions.length ? () => { setMashqlar(false); startQuiz(); } : null}
          onRepetitor={maktabSozlar.length ? () => { setMashqlar(false); setRepetitor(true); } : null}
          onYakun={(r) => { if (learnerRole === "oquvchi" && token) faollikYoz(apiBase, token, { turi: "til", kod: `${darsTil}:${topicCode}:mashq`, til: darsTil, fan: fan || lesson?.topic?.fan || "", mavzu: `Dars mashqlari: ${lesson?.topic?.mavzu || ""}`, ...r }); }}
          onClose={() => setMashqlar(false)} />
      </React.Suspense>
    </div>}
    {repetitor && maktabSozlar.length > 0 && <div className="dx-repetitor-oyna" role="dialog" aria-modal="true" aria-label={__kbUi("Repetitor")}>
      <React.Suspense fallback={<p className="dx-why">⏳</p>}>
        <Repetitor apiBase={apiBase} til={darsTil} izoh={["uz", "ru", "en"].includes(izoh) ? izoh : "uz"} sinf={Number(/(\d{1,2})/.exec(String(grade || lesson?.topic?.sinf || ""))?.[1]) || 5}
          darsSozlari={maktabSozlar} sarlavha={lesson?.topic?.mavzu || ""} avtoBosh
          onYakun={(r) => { if (learnerRole === "oquvchi" && token) faollikYoz(apiBase, token, { turi: "repetitor", kod: `${darsTil}:${topicCode}`, til: darsTil, fan: fan || lesson?.topic?.fan || "", mavzu: `Repetitor: ${lesson?.topic?.mavzu || ""}`, ...r }); }}
          onClose={() => setRepetitor(false)} />
      </React.Suspense>
    </div>}

    {kid && <p className="dx-kid-ver" aria-hidden="true">{APP_VERSION}</p>}
    {menu && <div className="dx-menu" role="group" aria-label={__kbUi("Qayta tushuntirish usuli")}>
      <p>{__kbUi("Qaysi usulda qayta tushuntiray?")}</p>
      {list.map((v) => <button key={v.id} type="button" className="dx-btn" onClick={() => openVariant(v)}>{__kbUi(v.nom)}</button>)}
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); const avvalgi = rateRef.current; setRate(0.85); rateRef.current = 0.85; if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => { setRate(avvalgi); rateRef.current = avvalgi; setStepFinished(true); }); } }}>{__kbUi("Sekinroq qayta ayt")}</button>
      <button type="button" className="dx-btn" onClick={() => { setMenu(false); ask(`${__kbUi("Shu qismni tushunmadim, boshqacha tushuntiring")}: ${step?.doska || ""} ${step?.ovoz || ""}`.slice(0, 900)); }}>{__kbUi("AI ustozdan so‘rash")}</button>
    </div>}

    {mode !== "ovoz" && !(kid && ["test", "result", "limit", "bridge"].includes(mode)) && <div className={`dx-controls ${kid ? "dx-kid-controls" : ""}`}>
      <button type="button" className="dx-btn dx-primary" disabled={mode === "test"} onClick={() => {
        if (yotiq && mode === "idle") kengaytir();
        // REV177: yangi dars oldidan — oldingi darslardan spiral takror (bugun shu darsda qilinmagan bo'lsa)
        if (!kid && mode === "idle" && !playing && topicCode && !takrorQilindi(topicCode)) {
          const d = oldingiDarslar(fan || lesson?.topic?.fan || "", topicCode);
          if (d.length) { setOldiTakror(d); return; }
        }
        togglePlay();
      }}>{kid
        ? <KidIcon icon={playing ? "⏸️" : "▶️"} label={playing ? "Pauza" : "Davom"} />
        : playing ? __kbUi("❚❚ Pauza") : mode === "idle" ? __kbUi(labels.start) : mode === "result" || mode === "end" ? __kbUi("↺ Qaytadan") : __kbUi("▶ Davom etish")}</button>
      {!kid && <button type="button" className="dx-btn" disabled={idx <= 0 || mode !== "lesson"} onClick={() => { setPlaying(false); go(idx - 1, false); }}>{__kbUi("‹ Oldingi")}</button>}
      {!kid && <button type="button" className="dx-btn" disabled={mode !== "lesson"} onClick={() => go(idx + 1)}>{__kbUi("Keyingi ›")}</button>}
      <button type="button" className="dx-btn" disabled={!step && !variant} onClick={() => { if (variant) { say(variant.ovoz); return; } if (step) { setStepFinished(false); say(boardCues(step.doska, step.ovoz || step.doska).spoken || step.doska, () => setStepFinished(true)); } }}>{kid ? <KidIcon icon="🔁" label="Yana ayt" /> : __kbUi("↻ Qayta ayt")}</button>
      <button type="button" className="dx-btn dx-help" disabled={mode !== "lesson"} onClick={dunno}>{kid ? <KidIcon icon="🙋" label="Tushuntir" /> : __kbUi("Tushunmadim")}</button>
      {sinfXona && !kabuMuhit && <button type="button" className={`dx-btn dx-savol-btn ${savolOchiq ? "is-on" : ""}`} aria-pressed={savolOchiq} onClick={() => setSavolOchiq((x) => !x)}>❓ {__kbUi("Savol berish")}</button>}
      <span className="dx-spacer" />
      {!kid && <label className="dx-speed">{__kbUi("Tezlik")}
        <select value={rate} onChange={(e) => setRate(Number(e.target.value))}>
          <option value={0.85}>{__kbUi("Sekin")}</option><option value={1}>{__kbUi("O‘rtacha")}</option><option value={1.2}>{__kbUi("Tez")}</option>
        </select>
      </label>}
    </div>}
  </section>;
}
