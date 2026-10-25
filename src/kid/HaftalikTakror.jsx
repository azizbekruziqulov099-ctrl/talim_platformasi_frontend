import React, { useEffect, useMemo, useRef, useState } from "react";
import UstozXonacha from "./UstozXonacha.jsx";
import { Rasm } from "./BolalarKundaligi.jsx";
import { KURS } from "../parent/bogchaReja.js";
import { USTOZLAR } from "./ustozlar.js";
import { ovozManbai, jinsOf } from "./ovozOqi.js";
import { takrorSozlari, topSavollari, takrorYulduz } from "./haftalikTakror.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import "./haftalikTakror.css";

const GAP = {
  uz: { bosh: "Bugun yakshanba — takrorlash kuni! Bu hafta o‘rgangan so‘zlarimizni eslaymiz.", ayt: "Bu nima? {w}. Men bilan birga ayting: {w}!",
    top: "Qani, {w} qayerda? Bosing!", togri: "Barakalla!", xato: "Bu emas. Mana, {w}!", tugadi: "Ajoyib! Takrorlash tugadi. Sen zo‘rsan!", oyin: "Endi o‘yin! Men aytaman, siz rasmini topasiz." },
  ru: { bosh: "Сегодня воскресенье — день повторения! Вспомним слова этой недели.", ayt: "Что это? {w}. Скажи вместе со мной: {w}!",
    top: "Где {w}? Нажми!", togri: "Молодец!", xato: "Не это. Вот {w}!", tugadi: "Отлично! Повторение окончено. Ты молодец!", oyin: "А теперь игра! Я говорю, ты находишь картинку." },
  en: { bosh: "Today is Sunday — review day! Let's remember this week's words.", ayt: "What is it? {w}. Say it with me: {w}!",
    top: "Where is {w}? Tap it!", togri: "Well done!", xato: "Not this one. Here is {w}!", tugadi: "Great! Review is over. You are a star!", oyin: "Now a game! I say a word, you find the picture." },
};
const teg = (t, til) => (!til || til === "uz" ? String(t) : `[${til}]${t}[/${til}]`);
const USTOZ = "nilufar";

/** REV172: Yakshanba takrori (bog'cha) — o'tgan hafta va shu haftaning so'zlari barcha fanlardan, ovoz bilan:
 *  1) ustoz rasmni ko'rsatib so'zni aytadi, bola takrorlaydi («Aytdim»); 2) o'yin: ustoz aytadi — bola 3 ta rasmdan topadi. */
export default function HaftalikTakror({ apiBase = "", diary = null, onClose, onTugadi }) {
  const { locale } = useInterface();
  const iz = String(locale || "uz").slice(0, 2);
  const g = GAP[iz] || GAP.uz;
  const sozlar = useMemo(() => takrorSozlari(diary?.haftalar || [], KURS, 10), [diary]);
  const savollar = useMemo(() => topSavollari(sozlar, Math.min(6, sozlar.length)), [sozlar]);
  const [faza, setFaza] = useState("ayt");     // ayt | top | tugadi
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);
  const [togri, setTogri] = useState(0);
  const [gapir, setGapir] = useState(false);
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  const alive = useRef(true);
  const otildi = useRef(-1);   // qaysi savoldan o'tildi (ikki marta o'tmasin)
  const jins = jinsOf(USTOZ, USTOZLAR);
  const izt = (s) => teg(s, iz === "uz" ? "" : iz);
  const qur = (k, w) => g[k].split(/(\{w\})/).map((p) => (p === "{w}" ? teg(w.soz, w.til) : p.trim() ? izt(p) : p)).join("");
  const ayt = (m, done) => { setGapir(true); ovoz.oqi(m, { jins, tezlik: "-15%", done: () => { if (alive.current) { setGapir(false); done?.(); } } }); };
  useEffect(() => { alive.current = true; return () => { alive.current = false; ovoz.stop(); }; }, [ovoz]);
  useEffect(() => { if (sozlar.length) ayt(`${izt(g.bosh)} ${qur("ayt", sozlar[0])}`); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sozlar.length) {
    return <div className="ht-root"><div className="ht-card"><span className="ht-big" aria-hidden="true">📒</span>
      <b>{T("Bu hafta hali so‘z o‘rganilmagan. Darslardan keyin takrorlaymiz!")}</b>
      <button type="button" className="ht-btn is-main" onClick={onClose}>⬅️ {T("Orqaga")}</button></div></div>;
  }

  const keyingiAyt = () => {
    if (i + 1 < sozlar.length) { const n = i + 1; setI(n); ayt(qur("ayt", sozlar[n])); return; }
    if (savollar.length) { setFaza("top"); setI(0); setJavob(null); ayt(`${izt(g.oyin)} ${qur("top", savollar[0].w)}`); return; }
    setFaza("tugadi"); ayt(izt(g.tugadi)); onTugadi?.(3);
  };
  // Keyingi savolga o'tish faqat bir marta (ovoz tugashi yoki zaxira taymer — qaysi biri oldin bo'lsa); ovoz to'xtatilsa ham o'yin qotmaydi
  const tanla = (v) => {
    if (javob) return;
    const q = savollar[i];
    const ok = v === q.w;
    const jamiTogri = togri + (ok ? 1 : 0);
    setJavob({ v, ok });
    if (ok) setTogri(jamiTogri);
    const otish = () => {
      if (!alive.current || otildi.current === i) return;
      otildi.current = i;
      if (i + 1 < savollar.length) { const n = i + 1; setI(n); setJavob(null); ayt(qur("top", savollar[n].w)); }
      else { const y = takrorYulduz(jamiTogri, savollar.length); setFaza("tugadi"); ayt(izt(g.tugadi)); onTugadi?.(y); }
    };
    ayt(ok ? `${izt(g.togri)} ${teg(q.w.soz, q.w.til)}` : qur("xato", q.w), () => setTimeout(otish, 500));
    setTimeout(otish, 4500);
  };

  const ustoz = (doska, belgi = "") => <div className="ht-ustoz"><UstozXonacha ustoz={USTOZ} doska={doska} belgi={belgi} gapir={gapir} /></div>;
  const bar = <div className="ht-bar">
    <button type="button" className="ht-back" onClick={() => { ovoz.stop(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
    <b>🔁 {T("Yakshanba takrori")}</b>
    <span className="ht-dots" aria-hidden="true">{(faza === "ayt" ? sozlar : savollar).map((_, k) => <i key={k} className={k < i ? "is-done" : k === i ? "is-on" : ""} />)}</span>
  </div>;

  if (faza === "tugadi") {
    const y = takrorYulduz(togri, savollar.length || 1);
    return <div className="ht-root">{bar}{ustoz("⭐".repeat(y))}
      <div className="ht-card" role="status"><span className="ht-big" aria-hidden="true">🏆</span>{savollar.length > 0 ? <b className="ht-stars">{"⭐".repeat(y)}</b> : <b>{T("Barakalla!")}</b>}
        <small>{T("So‘zlar")}: {sozlar.length}{savollar.length ? ` · ✅ ${togri}/${savollar.length}` : ""}</small>
        <button type="button" className="ht-btn is-main" onClick={onClose}>✅ {T("Tayyor")}</button></div></div>;
  }

  if (faza === "top") {
    const q = savollar[i];
    return <div className="ht-root">{bar}{ustoz("❓")}
      <div className="ht-card">
        <button type="button" className="ht-btn" disabled={Boolean(javob)} onClick={() => ayt(qur("top", q.w))}>🔊 {T("Yana eshitish")}</button>
        <div className="ht-pics">{q.variantlar.map((v, k) => <button key={k} type="button" disabled={Boolean(javob)} onClick={() => tanla(v)}
          className={`ht-pic ${javob && v === q.w ? "is-right" : ""} ${javob && javob.v === v && !javob.ok ? "is-wrong" : ""}`} aria-label={javob ? v.soz : `${k + 1}`}>
          <Rasm soz={v.soz} emoji={v.emoji} til={v.til} />{javob && v === q.w && <small dir="auto">{v.soz}</small>}</button>)}</div>
      </div></div>;
  }

  const w = sozlar[i];
  return <div className="ht-root">{bar}{ustoz(w.soz, w.emoji)}
    <div className="ht-card">
      <button type="button" className="ht-word" onClick={() => ayt(teg(w.soz, w.til))}><Rasm soz={w.soz} emoji={w.emoji} til={w.til} className="is-big" />
        <b dir="auto">{w.soz}</b>{KURS[w.kalit]?.emoji ? <small>{KURS[w.kalit].emoji}</small> : null}</button>
      <div className="ht-row">
        <button type="button" className="ht-btn" onClick={() => ayt(teg(w.soz, w.til))}>🔊 {T("Yana eshitish")}</button>
        <button type="button" className="ht-btn is-main" onClick={keyingiAyt}>🗣 {T("Aytdim")} ➡</button>
      </div>
    </div></div>;
}
