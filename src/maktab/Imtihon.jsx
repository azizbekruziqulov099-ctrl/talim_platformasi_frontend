import React, { useEffect, useMemo, useRef, useState } from "react";
import Rasm from "./MaktabRasm.jsx";
import UstozXonacha from "../kid/UstozXonacha.jsx";
import { USTOZLAR } from "../kid/ustozlar.js";
import { TIL_USTOZ } from "../kid/ustozRules.js";
import { ovozManbai, jinsOf } from "../kid/ovozOqi.js";
import { tekshir } from "./repetitorRules.js";
import { gapBaho } from "../til/mashqRules.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { CEFR } from "./darajaRules.js";
import { KONIKMALAR, imtihonTuz, joylashtirishTuz, natijaHisob, joyDarajasi, JOY_CHEGARA } from "./imtihonRules.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import "./imtihon.css";

const NOM = { haftalik: "Haftalik imtihon", oylik: "Oylik takror imtihoni", joylashtirish: "Darajani aniqlash testi" };
const KORSATMA = {
  rasm: "Tinglang va mos javobni tanlang.", gap: "Gapni o‘qing va ma’nosini tanlang.", soz: "So‘zni o‘qing va ma’nosini tanlang.",
  yoz: "Rasm va ma’nosiga qarab so‘zni o‘sha tilda yozing.", ayt: "Rasm va ma’nosiga qarab so‘zni o‘sha tilda ayting.",
};
const teg = (t, til) => `[${til}]${t}[/${til}]`;

/**
 * REV176: imtihon — 4 ko'nikma (tinglash, o'qish, yozish, gapirish). Har ko'nikma bo'yicha foiz, umumiy foiz va baho;
 * joylashtirish testida — CEFR darajasi va qaysi sinf dasturidan boshlash tavsiyasi. Javobdan keyin to'g'risi ko'rsatiladi.
 */
export default function Imtihon({ apiBase = "", til = "en", izoh = "uz", turi = "haftalik", sozlar = [], gaplar = [], onNatija, onSinf, onClose }) {
  const iz = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
  const ustoz = TIL_USTOZ[til] || "emily";
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  const savollar = useMemo(() => (turi === "joylashtirish" ? joylashtirishTuz({ iz }) : imtihonTuz({ sozlar, gaplar, turi, iz, mikBor })), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);
  const [javoblar, setJavoblar] = useState([]);
  const [kiritish, setKiritish] = useState("");
  const [mik, setMik] = useState("");
  const [gapir, setGapir] = useState(false);
  const [boshlandi, setBoshlandi] = useState(false);
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  const alive = useRef(true);
  const rec = useRef(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; ovoz.stop(); try { rec.current?.abort(); } catch { /* */ } }; }, [ovoz]);
  const ayt = (m, sekin = false) => { setGapir(true); ovoz.oqi(m, { jins: jinsOf(ustoz, USTOZLAR), sekin, done: () => alive.current && setGapir(false) }); };
  const ms = (x) => x.w[iz] || x.w.uz;
  const q = savollar[i];
  const tugadi = boshlandi && i >= savollar.length;

  // REV176: ustoz har savolni o'zi o'qiydi (bog'cha va repetitordagi kabi): ko'rsatma, tinglashda — so'z, yozish/gapirishda — ma'nosi.
  // O'qish bo'limida chet tilidagi matn o'qilmaydi (o'qish ko'nikmasi tekshiriladi).
  useEffect(() => {
    if (!boshlandi || !q || javob) return;
    const izt = (m) => (iz === "uz" ? m : teg(m, iz));
    const korsatma = izt(T(KORSATMA[q.tur]));
    if (q.tur === "rasm") ayt(`${korsatma} ${teg(q.soz.w[til], til)}`);
    else if (q.tur === "yoz" || q.tur === "ayt") ayt(`${korsatma} ${izt(ms(q.soz))}`);
    else ayt(korsatma);
  }, [i, boshlandi]); // eslint-disable-line react-hooks/exhaustive-deps

  const qabul = (ball, qiymat = "") => {
    if (javob) return;
    setJavob({ ball, qiymat });
    setJavoblar((a) => [...a, { konikma: q.konikma, ball, daraja: q.daraja }]);
  };
  const keyingi = () => {
    setJavob(null); setKiritish(""); setMik("");
    let n = i + 1;
    // joylashtirish — moslashuvchan: daraja savollari tugaganda shu darajadan o'tolmasa, test shu yerda tugaydi (qiyinrog'i berilmaydi)
    if (turi === "joylashtirish" && n < savollar.length && savollar[n].daraja !== q.daraja) {
      const js = javoblar.filter((j) => j.daraja === q.daraja);
      if (js.length && js.reduce((t, j) => t + j.ball, 0) / js.length < JOY_CHEGARA) n = savollar.length;
    }
    setI(n);
    if (n >= savollar.length) {
      const hamma = javoblar;
      const r = natijaHisob(hamma);
      const jd = turi === "joylashtirish" ? joyDarajasi(hamma) : null;
      onNatija?.({ ...r, ...(jd ? { daraja: jd.daraja, tavsiyaSinf: jd.tavsiyaSinf } : {}), togri: Math.round(hamma.reduce((s, j) => s + j.ball, 0)), jami: hamma.length });
    }
  };
  const tingla = () => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!R) { setMik("yoq"); return; }
    ovoz.stop(); setGapir(false);
    let done = false;
    const r = new R(); rec.current = r;
    r.lang = CONTENT_LOCALES[til] || "en-US"; r.interimResults = false; r.maxAlternatives = 5;
    const keldi = (alts) => {
      if (done) return; done = true; rec.current = null;
      if (!alive.current) return;
      setMik("");
      if (!alts.some((a) => String(a || "").trim())) { setMik("qayta"); return; }
      const g = gapBaho(alts, q.soz.w[til], til);
      qabul(g.togri ? 1 : g.stars >= 1 ? 0.5 : 0, alts[0]);
    };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("yoq"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("yoq"); }
  };

  const bar = <div className="im-bar">
    <button type="button" className="im-back" onClick={() => { ovoz.stop(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
    <div className="im-head"><b>📝 {T(NOM[turi])}</b><small>{boshlandi && !tugadi ? `${Math.min(i + 1, savollar.length)} / ${savollar.length}` : `${savollar.length} ${T("ta savol")}`}</small></div>
  </div>;

  if (!boshlandi) {
    const bor = KONIKMALAR.filter((k) => savollar.some((s) => s.konikma === k.k));
    return <div className="im-root">{bar}
      <div className="im-ustoz"><UstozXonacha ustoz={ustoz} doska={T(NOM[turi])} gapir={gapir} /></div>
      <div className="im-card">
        <p>{turi === "joylashtirish" ? T("Osondan qiyinga: Pre-A1, A1, A2, B1 darajalaridan savollar. Javoblaringizga qarab darajangiz va qaysi sinf dasturidan boshlash kerakligi aniqlanadi.")
          : T("Imtihon to‘rt ko‘nikmani tekshiradi. Har bo‘lim uchun alohida natija va umumiy baho chiqadi.")}</p>
        <ul className="im-konikma">{bor.map((k) => <li key={k.k}><span aria-hidden="true">{k.emoji}</span> {T(k.nom)} <b>{savollar.filter((s) => s.konikma === k.k).length}</b></li>)}</ul>
        {!mikBor && turi !== "joylashtirish" && <small className="im-ogoh">🎤 {T("Mikrofon yo‘q — gapirish bo‘limi bu safar o‘tkazilmaydi.")}</small>}
        <button type="button" className="im-btn is-main is-katta" disabled={!savollar.length} onClick={() => setBoshlandi(true)}>▶ {T("Boshlash")}</button>
        {!savollar.length && <small className="im-ogoh">{T("Avval bir nechta so‘z o‘rganing — imtihon o‘rganilgan so‘zlardan tuziladi.")}</small>}
      </div>
    </div>;
  }

  if (tugadi) {
    const r = natijaHisob(javoblar);
    const jd = turi === "joylashtirish" ? joyDarajasi(javoblar) : null;
    return <div className="im-root">{bar}
      <div className="im-card im-natija" role="status">
        <span className="im-katta" aria-hidden="true">{r.baho >= 5 ? "🏆" : r.baho >= 4 ? "🎉" : "💪"}</span>
        {jd ? <>
          <b className="im-daraja">{jd.daraja ? `${CEFR[jd.indeks].emoji} ${jd.daraja}` : `🌰 ${T("Boshlang‘ich")}`}</b>
          <p>{T("Tavsiya: {n}-sinf dasturidan boshlang.").replace("{n}", jd.tavsiyaSinf)}</p>
        </> : <b className="im-baho">{T("Baho")}: {r.baho}</b>}
        <span className="im-umumiy">{r.umumiy}%</span>
        <ul className="im-bolimlar">{KONIKMALAR.filter((k) => r.foiz[k.k] !== undefined).map((k) => <li key={k.k}>
          <span>{k.emoji} {T(k.nom)}</span>
          <span className="im-chiziq"><i style={{ width: `${Math.max(3, r.foiz[k.k])}%` }} className={r.foiz[k.k] >= 75 ? "is-ok" : r.foiz[k.k] < 50 ? "is-past" : ""} /></span>
          <b>{r.foiz[k.k]}%</b></li>)}</ul>
        {(() => { const zaif = KONIKMALAR.filter((k) => r.foiz[k.k] !== undefined && r.foiz[k.k] < 60); return zaif.length ? <p className="im-maslahat">💡 {T("Ko‘proq mashq qiling")}: {zaif.map((k) => T(k.nom)).join(", ")}</p> : null; })()}
        <div className="im-row">
          {jd && onSinf && <button type="button" className="im-btn is-main" onClick={() => onSinf(jd.tavsiyaSinf)}>▶ {T("Shu sinfdan boshlash")}</button>}
          <button type="button" className="im-btn" onClick={() => { ovoz.stop(); onClose?.(); }}>✅ {T("Tayyor")}</button>
        </div>
      </div>
    </div>;
  }

  const k = KONIKMALAR.find((x) => x.k === q.konikma);
  const togriId = q.soz?.id || q.gap?.id;
  return <div className="im-root">{bar}
    <div className="im-progress">{savollar.map((s, n) => <i key={n} className={`${n < i ? "is-done" : ""} ${n === i ? "is-on" : ""}`} />)}</div>
    <div className="im-card">
      <span className="im-tag">{k.emoji} {T(k.nom)}{q.daraja !== undefined ? ` · ${CEFR[q.daraja].kod}` : ""}</span>
      <p className="im-korsatma">{T(KORSATMA[q.tur])}</p>

      {q.tur === "rasm" && <>
        <button type="button" className="im-btn" onClick={() => ayt(teg(q.soz.w[til], til))}>🔊 {T("Tinglash")}</button>
        <div className="im-variant is-rasm">{q.variantlar.map((v) => <button key={v.id} type="button" disabled={Boolean(javob)} onClick={() => qabul(v.id === togriId ? 1 : 0, v.id)}
          className={`${javob && v.id === togriId ? "is-ok" : ""} ${javob && javob.qiymat === v.id && v.id !== togriId ? "is-past" : ""}`}>
          <Rasm w={v} className="mk-pic" /><small>{ms(v)}</small></button>)}</div>
      </>}
      {(q.tur === "gap" || q.tur === "soz") && <>
        <p className="im-matn" dir="auto" lang={til}>{(q.gap || q.soz).w[til]}</p>
        <div className="im-variant">{q.variantlar.map((v) => <button key={v.id} type="button" disabled={Boolean(javob)} onClick={() => qabul(v.id === togriId ? 1 : 0, v.id)}
          className={`${javob && v.id === togriId ? "is-ok" : ""} ${javob && javob.qiymat === v.id && v.id !== togriId ? "is-past" : ""}`} dir="auto">{ms(v)}</button>)}</div>
      </>}
      {(q.tur === "yoz" || q.tur === "ayt") && <div className="im-soz"><Rasm w={q.soz} className="mk-pic" /><b dir="auto">{ms(q.soz)}</b></div>}
      {q.tur === "yoz" && <>
        <input className="im-input" dir="auto" lang={til} value={kiritish} disabled={Boolean(javob)} autoCapitalize="off" autoComplete="off" spellCheck={false}
          placeholder={T("Shu yerga yozing…")} onChange={(e) => setKiritish(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && kiritish.trim() && !javob) { const r = tekshir(kiritish, q.soz.w[til], til); qabul(r.holat === "togri" ? 1 : r.holat === "deyarli" ? 0.5 : 0, kiritish); } }} />
        {!javob && <button type="button" className="im-btn is-main" disabled={!kiritish.trim()} onClick={() => { const r = tekshir(kiritish, q.soz.w[til], til); qabul(r.holat === "togri" ? 1 : r.holat === "deyarli" ? 0.5 : 0, kiritish); }}>✔ {T("Javob")}</button>}
      </>}
      {q.tur === "ayt" && !javob && <>
        {mik !== "yoq" && <button type="button" className={`im-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} disabled={mik === "tinglayapti"} onClick={tingla}>🎤 {mik === "tinglayapti" ? T("Gapiring…") : T("Aytaman")}</button>}
        {mik === "qayta" && <small className="im-ogoh">🎤 {T("Ovoz eshitilmadi — yana bosib, balandroq ayting.")}</small>}
        <button type="button" className="im-link" onClick={() => { try { rec.current?.abort(); } catch { /* */ } qabul(0, ""); }}>{mik === "yoq" ? T("Mikrofon ishlamayapti — o‘tkazib yuborish") : T("O‘tkazib yuborish")}</button>
      </>}

      {javob && <div className={`im-javob ${javob.ball >= 1 ? "is-ok" : javob.ball > 0 ? "is-yarim" : "is-past"}`} role="status">
        <b>{javob.ball >= 1 ? `✅ ${T("To‘g‘ri!")}` : javob.ball > 0 ? `🟡 ${T("Deyarli to‘g‘ri")}` : `❌ ${T("To‘g‘ri javob")}:`}</b>
        {javob.ball < 1 && <span dir="auto" lang={til}>{(q.gap || q.soz).w[til]} — {ms(q.gap || q.soz)}</span>}
        {q.tur === "ayt" && javob.qiymat && <small>🎤 «{javob.qiymat}»</small>}
        <button type="button" className="im-btn is-main" onClick={keyingi}>➡ {i + 1 >= savollar.length ? T("Natija") : T("Keyingisi")}</button>
      </div>}
    </div>
  </div>;
}
