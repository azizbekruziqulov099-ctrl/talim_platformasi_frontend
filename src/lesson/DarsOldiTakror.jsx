import React, { useEffect, useMemo, useRef, useState } from "react";
import KabuXonacha from "../kid/KabuXonacha.jsx";
import { ovozManbai, KABU_OVOZ } from "../kid/ovozOqi.js";
import { tekshir, yordamMatni, YORDAM_MAX } from "../maktab/repetitorRules.js";
import { gapBaho } from "../til/mashqRules.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { spiralTuz, erkinTuz, erkinTekshir, takrorSoni } from "./spiralTakror.js";
import { manoTanla, buyruq } from "./takrorMano.js";
import { mashqYulduz } from "./maktabMashqRules.js";
import "./maktabMashqlar.css";

const teg = (t, l) => (t && l && l !== "uz" ? `[${l}]${t}[/${l}]` : t);
const HARF = ["A", "B", "C", "D", "E"];

/**
 * Yangi darsdan oldin robot Kabu bilan takror (REV177, REV178 tartibi):
 *  ✍️ 1) erkin eslash — o'tgan darsdagi so'zlardan esida qolganlarini HECH QANDAY YORDAMSIZ o'zi yozadi (avval eslash, keyin ko'rish);
 *  🌀 2) takror — o'tgan darsning HAMMA yangi so'zlari + eski darslardan spiral (2, 3, 5, 8, 13 dars oldin):
 *        a) Kabu ma'nosini aytadi: «uy — shu so'zni nemischa yozing» → o'quvchi YOZADI (javob ko'rinmaydi);
 *        b) to'g'ri yozilishini ko'rgach — «endi ovoz chiqarib ayting» → TALAFFUZ qiladi (mikrofon tekshiradi);
 *  🏁 3) natija → «Yangi darsni boshlash».
 * Ma'nolar va Kabu gaplari — HOZIRGI interfeys tilida (o'tgan dars boshqa izoh tilida bo'lsa ham).
 */
export default function DarsOldiTakror({ apiBase = "", sinf = 5, darslar = [], onTugadi, onOtkaz }) {
  const uiL = useInterface()?.locale;
  const L = ["uz", "ru", "en"].includes(uiL) ? uiL : "uz";
  const soni = takrorSoni(sinf);
  const savollar = useMemo(() => spiralTuz(darslar, { soni: soni.spiral, oxirgi: soni.oxirgi }), [darslar, soni.spiral, soni.oxirgi]);
  const erkin = useMemo(() => erkinTuz(darslar[0], soni.erkin), [darslar, soni.erkin]);
  const bosqichlar = useMemo(() => [...(erkin ? ["erkin"] : []), ...(savollar.length ? ["spiral"] : []), "yakun"], [savollar, erkin]);
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  const [b, setB] = useState(0);
  const [i, setI] = useState(0);
  const [faza, setFaza] = useState("yoz");          // so'z savolida: yoz → ayt
  const [javob, setJavob] = useState(null);
  const [kiritish, setKiritish] = useState("");
  const [mik, setMik] = useState("");
  const [gapir, setGapir] = useState(false);
  const [quvon, setQuvon] = useState(0);
  const [ball, setBall] = useState({ togri: 0, jami: 0 });
  const [erkinNatija, setErkinNatija] = useState(null);
  const [ishora, setIshora] = useState(0);
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  const alive = useRef(true);
  const rec = useRef(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; ovoz.stop(); try { rec.current?.abort(); } catch { /* */ } }; }, [ovoz]);

  const bosqich = bosqichlar[b];
  const q = bosqich === "spiral" ? savollar[i] : null;
  const mn = q?.tur === "soz" ? manoTanla(q, L) : null;   // {mano, til}
  const ayt = (m, sekin = false, done) => { setGapir(true); ovoz.oqi(m, { ...KABU_OVOZ, sekin, tezlik: sinf <= 4 ? "-15%" : "-5%", done: () => { if (alive.current) { setGapir(false); done?.(); } } }); };
  const izt = (m) => teg(T(m), L);
  const hisob = (ok) => { if (ok) setQuvon((x) => x + 1); setBall((x) => ({ togri: x.togri + (ok ? 1 : 0), jami: x.jami + 1 })); };
  const yozBuyruq = q?.tur === "soz" ? buyruq("yoz", { L, til: q.til, m: mn.mano, mTil: mn.til }) : null;
  const aytBuyruq = q?.tur === "soz" ? buyruq("ayt", { L, til: q.til, w: q.soz }) : null;
  const erkinBuyruq = erkin?.til ? buyruq("erkin", { L, til: erkin.til }) : null;

  // har topshiriqda Kabu o'zi so'raydi
  useEffect(() => {
    const boshi = b === bosqichlar.indexOf("spiral") && i === 0 && faza === "yoz" ? `${buyruq("bosh", { L }).ovoz} ` : "";
    if (bosqich === "spiral" && q) {
      if (q.tur === "soz") ayt(`${boshi}${faza === "yoz" ? yozBuyruq.ovoz : aytBuyruq.ovoz}`);
      else ayt(`${boshi}${teg(q.savol, L)} ${q.variantlar.map((v, k) => `${teg(`${HARF[k]})`, L)} ${v}`).join(". ")}`);
    } else if (bosqich === "erkin" && erkin) {
      ayt(erkinBuyruq ? erkinBuyruq.ovoz : `${izt("Endi o‘tgan darsni o‘zingiz eslang.")} «${erkin.mavzu}». ${izt("Esingizda qolganlarini yozing:")} ${erkin.maqsad}`);
    } else if (bosqich === "yakun") {
      ayt(izt(ball.jami && ball.togri / ball.jami >= 0.7 ? "Barakalla! Takror zo‘r o‘tdi. Endi yangi darsni boshlaymiz!" : "Yaxshi! Takrorlaganingiz yodda qoladi. Endi yangi darsni boshlaymiz!"));
    }
  }, [b, i, faza]); // eslint-disable-line react-hooks/exhaustive-deps

  const keyingi = () => {
    try { rec.current?.abort(); } catch { /* */ }
    setJavob(null); setKiritish(""); setMik(""); setIshora(0);
    // yozgandan keyin — talaffuz (mikrofon bo'lsa)
    if (bosqich === "spiral" && q?.tur === "soz" && faza === "yoz" && mikBor) { setFaza("ayt"); return; }
    setFaza("yoz");
    if (bosqich === "spiral" && i + 1 < savollar.length) { setI(i + 1); return; }
    setI(0); setB((x) => x + 1);
  };

  const tingla = () => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!R || !q) { setMik("yoq"); return; }
    ovoz.stop(); setGapir(false);
    let done = false;
    const r = new R(); rec.current = r;
    r.lang = CONTENT_LOCALES[q.til] || "en-US"; r.interimResults = false; r.maxAlternatives = 5;
    const keldi = (alts) => {
      if (done) return; done = true; rec.current = null;
      if (!alive.current) return;
      setMik("");
      if (!alts.some((a) => String(a || "").trim())) { setMik("qayta"); return; }   // eshitilmadi — baholanmaydi, qayta aytadi
      const g = gapBaho(alts, q.soz, q.til);
      setJavob({ holat: g.togri ? "togri" : "xato", matn: alts[0] });
      hisob(g.togri);
      ayt(g.togri ? izt("Ajoyib talaffuz!") : `${izt("Yana bir bor tinglang va takrorlang")} ${teg(q.soz, q.til)}`);
    };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("yoq"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("yoq"); }
  };
  const yozTekshir = () => {
    if (!kiritish.trim() || javob) return;
    const r = tekshir(kiritish, q.soz, q.til);
    const holat = ishora >= YORDAM_MAX ? "xato" : ishora && r.holat === "togri" ? "deyarli" : r.holat;
    setJavob({ holat, farq: r.oxshash >= 0.5 && q.til !== "ar" ? r.farq : null, matn: kiritish });
    hisob(holat === "togri");
    ayt(holat === "togri" ? `${izt("To‘g‘ri yozdingiz!")} ${teg(q.soz, q.til)}` : `${izt("To‘g‘risi")} ${teg(q.soz, q.til)}`);
  };
  const tanla = (k) => {
    if (javob) return;
    const ok = k === q.togri;
    setJavob({ holat: ok ? "togri" : "xato", tanlov: k });
    hisob(ok);
    ayt(ok ? izt("To‘g‘ri!") : `${izt("To‘g‘ri javob")}: ${q.variantlar[q.togri]}`);
  };
  const erkinTekshirish = () => {
    if (!kiritish.trim() || erkinNatija) return;
    const r = erkinTekshir(kiritish, erkin.kutilgan);
    setErkinNatija(r);
    const ok = r.topildi.length >= erkin.maqsad;
    setBall((x) => ({ togri: x.togri + Math.min(erkin.maqsad, r.topildi.length), jami: x.jami + erkin.maqsad }));
    if (ok) setQuvon((x) => x + 1);
    const qolgan = r.qolgan.slice(0, 6).map((k) => teg(k.matn, erkin.til || L)).join(", ");
    ayt(`${izt(ok ? "Zo‘r! Ko‘p narsani eslab qoldingiz." : "Yaxshi urinish!")} ${qolgan ? `${izt("Yana bular bor edi:")} ${qolgan}` : ""}`);
  };

  const yulduz = mashqYulduz(ball.togri, ball.jami);
  const sozKorin = q?.tur === "soz" && (faza === "ayt" || javob);   // yozishdan oldin javob ko'rsatilmaydi
  const doska = bosqich === "yakun" ? "⭐".repeat(yulduz) || "💪"
    : bosqich === "erkin" ? `✍️ ${erkin?.mavzu || ""}`.slice(0, 60)
    : q?.tur === "soz" ? (sozKorin ? q.soz : `${q.emoji || ""} ${mn.mano}`.trim()) : (q?.savol || "").slice(0, 70);
  const manoBelgi = mn && mn.til !== L ? ` (${mn.til.toUpperCase()})` : "";

  return <div className="mm-root dot-root">
    <div className="mm-bar">
      <div className="mm-head"><b>🌀 {T("Darsdan oldin takror")}</b><small>🤖 Kabu</small></div>
      {bosqich !== "yakun" && <button type="button" className="mm-link" onClick={() => { ovoz.stop(); onOtkaz?.(); }}>{T("O‘tkazib, darsni boshlash")} ›</button>}
    </div>
    <ol className="mm-steps">{bosqichlar.map((x, k) => <li key={x} className={`${k < b ? "is-done" : ""} ${k === b ? "is-on" : ""}`}>
      <span aria-hidden="true">{k < b ? "✅" : x === "spiral" ? "🌀" : x === "erkin" ? "✍️" : "🏁"}</span>
      <small>{T(x === "spiral" ? "Spiral takror" : x === "erkin" ? "Erkin eslash" : "Natija")}</small></li>)}</ol>
    <div className="mm-ustoz"><KabuXonacha doska={doska} gapir={gapir} celebrate={quvon} mood={javob?.holat === "togri" ? "happy" : javob ? "enc" : "wave"} /></div>

    {bosqich === "spiral" && q && <div className="mm-card">
      <span className="mm-qadam">{i + 1} / {savollar.length}{q.oldin ? ` · ${q.oldin} ${T("dars oldin")}` : ""}{q.mavzu ? ` · ${q.mavzu}` : ""}</span>
      {q.tur === "soz" ? <>
        {faza === "yoz" ? <>
          <p className="mm-izoh">{yozBuyruq.matn}</p>
          <p className="mm-matn" dir="auto">{q.emoji} {mn.mano}{manoBelgi && <small>{manoBelgi}</small>}</p>
          <input className="mm-input" dir="auto" lang={q.til} value={kiritish} disabled={Boolean(javob)} autoCapitalize="off" autoComplete="off" spellCheck={false} enterKeyHint="done"
            placeholder={T("So‘zni yozing…")} onChange={(e) => setKiritish(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") yozTekshir(); }} />
          {!javob && <button type="button" className="mm-btn is-main" disabled={!kiritish.trim()} onClick={yozTekshir}>✔ {T("Tekshirish")}</button>}
          {!javob && ishora > 0 && <b className="dot-ishora" dir="ltr" lang={q.til}>{yordamMatni(q.soz, ishora)}</b>}
          {!javob && ishora < YORDAM_MAX && <button type="button" className="mm-link" onClick={() => { const n = ishora + 1; setIshora(n); if (n >= YORDAM_MAX) ayt(teg(q.soz, q.til)); }}>💡 {T("Ishora")} ({ishora + 1}/{YORDAM_MAX})</button>}
        </> : <>
          <p className="mm-izoh">{aytBuyruq.matn}</p>
          <p className="mm-matn" dir="auto" lang={q.til}>{q.soz}<small>{q.emoji} {mn.mano}</small></p>
        </>}
        <div className="mm-row">
          <button type="button" className="mm-btn" onClick={() => ayt(faza === "yoz" && !javob ? yozBuyruq.ovoz : teg(q.soz, q.til))}>🔊 {T("Yana ayt")}</button>
          {(javob || faza === "ayt") && <button type="button" className="mm-btn" onClick={() => ayt(teg(q.soz, q.til), true)}>🐢 {T("Sekin")}</button>}
          {faza === "ayt" && !javob && mikBor && mik !== "yoq" && <button type="button" className={`mm-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} disabled={mik === "tinglayapti"} onClick={tingla}>
            🎤 {mik === "tinglayapti" ? T("Gapiring…") : T("Aytaman")}</button>}
        </div>
        {mik === "qayta" && !javob && <small className="mm-ogoh" role="status">🎤 {T("Ovoz eshitilmadi — yana bosib, balandroq ayting.")}</small>}
        {faza === "ayt" && mik === "yoq" && !javob && <small className="mm-ogoh">{T("Mikrofon ishlamayapti — ovoz chiqarib ayting va «Keyingisi»ni bosing (baholanmaydi).")}</small>}
      </> : <>
        <p className="mm-matn" dir="auto">{q.savol}</p>
        <div className="dot-variantlar">{q.variantlar.map((v, k) => <button key={k} type="button" dir="auto"
          className={`mm-btn ${javob ? (k === q.togri ? "is-togri" : k === javob.tanlov ? "is-xato" : "") : ""}`} disabled={Boolean(javob)} onClick={() => tanla(k)}>
          <b>{HARF[k]})</b> {v}</button>)}</div>
        <div className="mm-row"><button type="button" className="mm-btn" onClick={() => ayt(`${teg(q.savol, L)} ${q.variantlar.map((v, k) => `${teg(`${HARF[k]})`, L)} ${v}`).join(". ")}`)}>🔊 {T("Yana o‘qib ber")}</button></div>
      </>}
      {javob && q.tur === "soz" && <div className={`mm-javob is-${javob.holat}`} role="status">
        <b>{javob.holat === "togri" ? `✅ ${T("To‘g‘ri!")}` : javob.holat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri")}` : `❌ ${T("To‘g‘risi")}: `}</b>
        {javob.farq && javob.holat !== "togri" && <span className="mm-farq" dir="auto" lang={q.til}>{javob.farq.map((f, k) => <span key={k} className={`is-${f.h}`}>{f.c}</span>)}</span>}
        {faza === "yoz" && <span className="mm-togrisi" dir="auto" lang={q.til}>{q.soz}</span>}
        {javob.matn && faza === "ayt" && <small>🎤 «{javob.matn}»</small>}
      </div>}
      {javob && q.tur === "soz" && faza === "ayt" && javob.holat !== "togri" && <button type="button" className="mm-btn" onClick={() => { setJavob(null); setMik(""); }}>🔁 {T("Yana aytaman")}</button>}
      {(javob || (faza === "ayt" && (!mikBor || mik === "yoq"))) && <button type="button" className="mm-btn is-main mm-keyingi" onClick={keyingi}>➡ {T("Keyingisi")}</button>}
      {!javob && faza === "ayt" && mikBor && mik !== "yoq" && <button type="button" className="mm-link" onClick={keyingi}>{T("O‘tkazib yuborish")}</button>}
    </div>}

    {bosqich === "erkin" && erkin && <div className="mm-card">
      <p className="mm-izoh">{erkinBuyruq ? erkinBuyruq.matn : T("O‘tgan darsdan esingizda qolgan so‘z va tushunchalarni yozing — har birini yangi qatorga yoki vergul bilan.")} {T("Maqsad")}: <b>{erkin.maqsad}</b></p>
      <textarea className="mm-input dot-erkin" dir="auto" lang={erkin.til || undefined} rows={4} value={kiritish} disabled={Boolean(erkinNatija)} autoCapitalize="off" spellCheck={false}
        placeholder={erkin.til ? "1) …\n2) …" : T("Esingizda qolganlarini yozing…")} onChange={(e) => setKiritish(e.target.value)} />
      {!erkinNatija && <button type="button" className="mm-btn is-main" disabled={!kiritish.trim()} onClick={erkinTekshirish}>✔ {T("Tekshirish")}</button>}
      {erkinNatija && <div className={`mm-javob ${erkinNatija.topildi.length >= erkin.maqsad ? "is-togri" : "is-deyarli"}`} role="status">
        <b>{erkinNatija.topildi.length >= erkin.maqsad ? "✅" : "🟡"} {T("Esladingiz")}: {erkinNatija.topildi.length} / {erkin.maqsad}</b>
        {erkinNatija.topildi.length > 0 && <span className="dot-sozlar is-ok" dir="auto">{erkinNatija.topildi.map((k) => k.matn).join(" · ")}</span>}
        {erkinNatija.qolgan.length > 0 && <span className="dot-sozlar" dir="auto">{T("Yana bular bor edi:")} {erkinNatija.qolgan.map((k) => k.matn).join(" · ")}</span>}
      </div>}
      {erkinNatija ? <button type="button" className="mm-btn is-main mm-keyingi" onClick={() => { setErkinNatija(null); keyingi(); }}>➡ {T("Keyingisi")}</button>
        : <button type="button" className="mm-link" onClick={keyingi}>{T("Eslay olmayapman — so‘zlarni ko‘rsat")}</button>}
    </div>}

    {bosqich === "yakun" && <div className="mm-card mm-yakun" role="status">
      <span className="mm-katta" aria-hidden="true">{yulduz === 3 ? "🏆" : "🌀"}</span>
      <b>{"⭐".repeat(yulduz) || "☆"}</b>
      <p>{T("Takror")}: {ball.togri} / {ball.jami}</p>
      <div className="mm-row"><button type="button" className="mm-btn is-main" onClick={() => { ovoz.stop(); onTugadi?.(ball); }}>▶ {T("Yangi darsni boshlash")}</button></div>
    </div>}
  </div>;
}
