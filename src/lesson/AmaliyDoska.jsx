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


// REV474: «limonni 3 ta xossa bilan tasvirla» kabi topshiriqlar — YOZDIRMAYMIZ: 6–7 ta variantdan to'g'rilarini tanlaydi.
// Kutilgan javob — vergul bilan ajratilgan so'zlar ro'yxati («sariq, nordon, oval») bo'lsa ishlaydi. Xato variantlar o'sha
// toifadan, lekin aniq noto'g'ri (masalan rangga — boshqa ranglar; ta'mga — boshqa ta'mlar).
const TOIFA = {
  rang: ["qizil", "ko‘k", "yashil", "sariq", "oq", "qora", "binafsha", "pushti", "jigarrang", "to‘q sariq", "kulrang"],
  tam: ["shirin", "nordon", "achchiq", "sho‘r", "mazali"],
  shakl: ["dumaloq", "oval", "kvadrat", "uchburchak", "to‘g‘ri to‘rtburchak", "uzunchoq", "yassi"],
  olcham: ["katta", "kichik", "uzun", "qisqa", "baland", "past", "yo‘g‘on", "ingichka"],
  sezgi: ["yumshoq", "qattiq", "silliq", "g‘adir-budur", "issiq", "sovuq", "og‘ir", "yengil", "ho‘l", "quruq", "tikanli"],
};
const UZOQ = { rang: { sariq: ["ko‘k", "binafsha", "qora"], qizil: ["ko‘k", "qora", "oq"], yashil: ["ko‘k", "qora", "pushti"], "to‘q sariq": ["ko‘k", "binafsha", "qora"] },
  tam: { nordon: ["shirin", "sho‘r"], shirin: ["sho‘r", "nordon"], achchiq: ["shirin"] },
  shakl: { dumaloq: ["kvadrat", "uchburchak"], oval: ["kvadrat", "uchburchak"], uzunchoq: ["dumaloq", "kvadrat"] } };
const ichida = (t, x) => (t || "").toLowerCase().replace(/[ʻ'`’]/g, "‘").includes(x);
export function kopTanlovYasa(item, kutilgan) {
  if (!kutilgan || (item?.variantlar || []).length) return null;
  const shart = String(item?.shart || "").toLowerCase();
  // faqat XOSSALAR bilan tasvirlash (rang, ta'm, shakl…) — ochiq misollar («narsalarni sanab ber») yozma qoladi
  if (!/xossa|xususiyat|belgisi bilan|belgi bilan|tasvirla/.test(shart.replace(/[ʻ`’]/g, "‘"))) return null;
  if (/masalan/i.test(String(kutilgan))) return null;
  const togri = String(kutilgan).replace(/^.*?:/, "").split(/[,;]| va /).map((x) => x.trim().replace(/[.!]$/, "")).filter(Boolean);
  if (togri.length < 2 || togri.length > 5 || togri.some((x) => x.split(/\s+/).length > 3 || /\d/.test(x))) return null;
  const kichik = togri.map((x) => x.toLowerCase().replace(/[ʻ'`’]/g, "‘"));
  const xato = [];
  for (const t of kichik) {
    const toifa = Object.keys(TOIFA).find((k) => TOIFA[k].includes(t));
    const nomzod = (toifa && UZOQ[toifa]?.[t]) || (toifa ? TOIFA[toifa].filter((x) => !kichik.includes(x)).slice(-3) : []);
    for (const x of nomzod) if (!kichik.includes(x) && !xato.includes(x) && xato.length < 4) xato.push(x);
  }
  for (const x of ["temir", "shaffof", "uchadi", "kvadrat", "ko‘k"]) if (xato.length < Math.max(3, 7 - togri.length) && !kichik.includes(x) && !xato.includes(x)) xato.push(x);
  const hammasi = [...togri, ...xato].map((x, i) => ({ x, k: (x.charCodeAt(0) * 7 + i * 13) % 97 })).sort((a, z) => a.k - z.k).map((o) => o.x);
  return { togri: kichik, hammasi, soni: togri.length };
}

/** Amaliy topshiriq doskasi: sharti ko'rinadi, yechimi «Yechimni ko'rsatish» bosilganda
 *  o'qituvchi ovozi bilan qadamma-qadam yoziladi. Dars xonasi va kitob kodi oynasi bir xil ishlatadi. */
/** REV476: 1-sinf — yozdirmaymiz: sonli javob 4 ta variantdan tanlanadi (to'g'ri, ±1, ±2 yoki +10 — odatiy xatolar). */
function sonliTanlov(item, kutilgan) {
  const t = String(kutilgan ?? "").replace(/\$/g, "").replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t), butun = Number.isInteger(n);
  const xato = butun ? [n + 1, n - 1, n + 2, n + 10, n - 2].filter((x) => x >= 0 && x !== n) : [n + 0.1, n - 0.1, n * 10].map((x) => Math.round(x * 100) / 100);
  const urug = String(item?.kod || item?.id || t).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const tanlangan = [...new Set(xato)].slice(0, 3);
  const hammasi = [n, ...tanlangan];
  for (let i = hammasi.length - 1; i > 0; i -= 1) { const j = (urug + i * 17) % (i + 1); [hammasi[i], hammasi[j]] = [hammasi[j], hammasi[i]]; }
  return { togri: n, hammasi };
}

export default function AmaliyDoska({ item, say, hush, mediaUrl = (u) => u, autoStart = false, onSolved, kid = false, jonli = false, soz = -1, sozSoni = 0, onNatija = null, yozmasdan = false }) {
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
  const kop = useMemo(() => kopTanlovYasa(item, kutilgan), [item, kutilgan]);   // REV474
  const sonli = useMemo(() => (yozmasdan && !options.length && !kop ? sonliTanlov(item, kutilgan) : null), [yozmasdan, options.length, kop, item, kutilgan]);   // REV476
  const [sonliTanlandi, setSonliTanlandi] = useState(null);
  const [belgilangan, setBelgilangan] = useState([]);
  useEffect(() => {   // REV474: yozma javob kutilayotgani — burchakdagi «✏️ Qoralama» tugmasi rangli bo'lib eslatib turadi
    const el = typeof document !== "undefined" ? document.querySelector(".dx-root") : null;
    const kerak = !options.length && kutilgan && !kop && !kid && !sonli;
    el?.classList.toggle("dx-yozish-kerak", Boolean(kerak));
    return () => el?.classList.remove("dx-yozish-kerak");
  }, [options.length, kutilgan, kop, kid, sonli]);
  useEffect(() => {   // klaviatura ochiq — dars oynasi pastdan joy qoldiradi (doska yopilmaydi)
    const el = typeof document !== "undefined" ? document.querySelector(".dx-root") : null;
    el?.classList.toggle("dx-klav-ochiq", klav);
    return () => el?.classList.remove("dx-klav-ochiq");
  }, [klav]);
  const runRef = useRef(0);

  const stop = useCallback(() => { runRef.current += 1; setRunning(false); hush?.(); }, [hush]);
  // REV93: yangi topshiriq ochilganda o'qituvchi ovozini O'CHIRMAYMIZ (dars xonasi shu payt shartni o'qiyapti) —
  // faqat o'zimizning yechim ko'rsatishni to'xtatamiz. Oldin bu ovozni kesib, dars shu qadamda to'xtab qolardi.
  useEffect(() => { runRef.current += 1; setRunning(false); setShown(0); setPicked(null); setAnswer(""); setFeedback(null); setMaslahatN(0); setKlav(false); setBelgilangan([]); setSonliTanlandi(null); }, [item?.kod, item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
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
    onNatija?.(k === item.togri);   // REV411: guruh mashg'ulotida — javob o'qituvchiga
    if (k === item.togri) say(__kbUi("To‘g‘ri! Barakalla."));
    else if (item.xatolar?.[String(k)]) say(item.xatolar[String(k)], () => reveal(0));   // REV269: aynan shu xatoning izohi
    else say(__kbUi("Javob noto‘g‘ri. Yechimni ko‘rib chiqamiz."), () => reveal(0));
  };
  const submit = (event) => {
    event?.preventDefault?.();
    if (!answer.trim()) return;
    if (checkAnswer(answer, kutilgan)) { setFeedback({ ok: true, text: __kbUi("✅ To‘g‘ri!") }); setKlav(false); say(__kbUi("Barakalla, to‘g‘ri!")); onNatija?.(true); }
    else { setFeedback({ ok: false, text: __kbUi("Yana bir bor urinib ko‘ring yoki yechimni oching.") }); say(__kbUi("Deyarli! Yana bir bor o‘ylab ko‘ring.")); onNatija?.(false); }
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
    {kop && <div className="dx-kop-tanlov">
      <p className="dx-kop-izoh">{__kbUi(`${kop.soni} tasini tanlang`)}</p>
      <div className="dx-kop-chiplar">{kop.hammasi.map((x) => { const on = belgilangan.includes(x.toLowerCase());
        const holat = feedback ? (kop.togri.includes(x.toLowerCase()) ? "is-ok" : on ? "is-no" : "") : on ? "is-on" : "";
        return <button key={x} type="button" className={`dx-kop-chip ${holat}`} disabled={Boolean(feedback?.ok)}
          onClick={() => { setFeedback(null); setBelgilangan((b) => b.includes(x.toLowerCase()) ? b.filter((y) => y !== x.toLowerCase()) : [...b, x.toLowerCase()]); }}>{x}</button>; })}</div>
      <div className="dx-javob-maydon"><button type="button" className="dx-btn dx-primary" disabled={belgilangan.length !== kop.soni}
        onClick={() => { const ok = belgilangan.every((b) => kop.togri.includes(b)) && belgilangan.length === kop.togri.length;
          setFeedback(ok ? { ok: true, text: __kbUi("✅ To‘g‘ri!") } : { ok: false, text: __kbUi("Yashil belgilanganlar — to‘g‘ri javoblar.") });
          say(ok ? __kbUi("Barakalla, to‘g‘ri!") : __kbUi("Deyarli! To‘g‘ri javoblarga qarang.")); onNatija?.(ok); }}>{__kbUi("Tekshirish")}</button>
        {feedback && <span className={`dx-javob-natija ${feedback.ok ? "is-ok" : "is-no"}`}>{feedback.text}</span>}</div>
    </div>}
    {sonli && <div className="dx-opts dx-sonli">{sonli.hammasi.map((x) => {
      const holat = sonliTanlandi === null ? "" : x === sonli.togri ? "is-ok" : x === sonliTanlandi ? "is-no" : "";
      return <button key={x} type="button" className={holat} disabled={sonliTanlandi !== null && sonliTanlandi === sonli.togri}
        onClick={() => { setSonliTanlandi(x); const ok = x === sonli.togri;
          setFeedback(ok ? { ok: true, text: __kbUi("✅ To‘g‘ri!") } : { ok: false, text: __kbUi("Yana bir o‘ylab ko‘r — yashili to‘g‘ri javob.") });
          say(ok ? __kbUi("Barakalla, to‘g‘ri!") : __kbUi("Deyarli! To‘g‘ri javobga qara.")); onNatija?.(ok); if (ok) onSolved?.(); }}>{String(x).replace(".", ",")}</button>; })}
      {feedback && <span className={`dx-javob-natija ${feedback.ok ? "is-ok" : "is-no"}`}>{feedback.text}</span>}</div>}
    {/* REV312: javob — doskadagi quti (telefon klaviaturasi chiqmaydi), bosilsa pastda matematik klaviatura */}
    {!options.length && kutilgan && !kid && !kop && !sonli && <div className="dx-javob-maydon">
      <button type="button" className={`dx-javob-quti ${klav ? "is-ochiq" : ""}`} onClick={() => setKlav(true)} aria-label={__kbUi("Javobingiz")}>
        <JavobKorinishi qiymat={answer} bosh="✏️ Javobni yozing" /></button>
      <button type="button" className="dx-btn dx-primary" disabled={!answer} onClick={submit}>{__kbUi("Tekshirish")}</button>
      {feedback && <span className={`dx-javob-natija ${feedback.ok ? "is-ok" : "is-no"}`}>{feedback.text}</span>}
    </div>}
    {!kid && !options.length && kutilgan && !kop && !sonli && <div className="dx-yordam-tug">
      {/* REV474: «Qoralama daftar» tugmasi olib tashlandi — doskaning burchagida «✏️ Qoralama» doim bor (yozish kerak bo'lsa rangli) */}
      {<button type="button" className={`dx-btn dx-klav-och ${klav ? "is-on" : ""}`} onClick={() => setKlav((x) => !x)}>⌨️ {__kbUi("Klaviatura: harflar va belgilar")}</button>}
    </div>}
    {daftar && <QoralamaDaftar kalit={`dars:${item.kod || ""}`} savol={<>{lines.map((line, i) => <p key={i}><BoardText text={line} /></p>)}</>}
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
