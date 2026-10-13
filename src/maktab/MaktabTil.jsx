import React, { useEffect, useMemo, useRef, useState } from "react";
import { SINFLAR } from "./index.js";
import { MAKTAB_RASM } from "./rasmlar.js";
import { RASMLAR } from "../kid/xonalar/rasmlar.js";
import {
  rejimlar, savollar, harfTogri, harflar, belgila, srsOl, yulduzYoz, yulduzlar, yulduzHisob, bolimPuxta,
} from "./maktabRules.js";
import { yozuvniTekshir, bolakTogri, gapBaho } from "../til/mashqRules.js";
import { tik, oqi as vaqtOqi, holat as vaqtHolati, FAOL } from "../kid/xonalar/oyinVaqti.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { aralashKerak, aralashOqi } from "../speech/aralashOvoz.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import "./maktab.css";

const REJIM = {
  kartalar: ["📇", "So‘z kartalari"], rasm: ["🖼️", "Rasmini top"], mano: ["🔤", "Ma’nosini top"], harf: ["🔡", "Harflardan ter"],
  gap: ["🧱", "Gap tuz"], yoz: ["🎧", "Eshit va yoz"], ayt: ["🗣️", "Ayt"], bellashuv: ["🏆", "Bellashuv"],
};
const IZOH = {
  kartalar: { uz: "Kartani bosing — so‘zni eshitasiz va ma’nosini ko‘rasiz.", ru: "Нажмите на карточку — услышите слово и увидите перевод.", en: "Tap a card to hear the word and see its meaning." },
  rasm: { uz: "Eshiting va mos rasmni tanlang.", ru: "Послушайте и выберите картинку.", en: "Listen and choose the right picture." },
  mano: { uz: "So‘zni o‘qing va ma’nosini toping.", ru: "Прочитайте слово и найдите перевод.", en: "Read the word and find its meaning." },
  harf: { uz: "Harflarni to‘g‘ri tartibda bosib, so‘zni yozing.", ru: "Нажимайте буквы по порядку и соберите слово.", en: "Tap the letters in order to spell the word." },
  gap: { uz: "Bo‘laklardan gapni yig‘ing.", ru: "Соберите предложение из частей.", en: "Build the sentence from the pieces." },
  yoz: { uz: "Eshiting va yozing.", ru: "Послушайте и напишите.", en: "Listen and write." },
  ayt: { uz: "O‘qing, tinglang va ovoz chiqarib ayting.", ru: "Прочитайте, послушайте и скажите вслух.", en: "Read, listen and say it aloud." },
  bellashuv: { uz: "Vaqt bilan bellashuv: tez va to‘g‘ri javob bering!", ru: "Соревнование на время: отвечайте быстро и правильно!", en: "Race against time: answer fast and correctly!" },
};
const SINF_NOMI = { uz: (n) => `${n}-sinf`, ru: (n) => `${n} класс`, en: (n) => `Grade ${n}` };
const CHORAK = { uz: (n) => `${n}-chorak`, ru: (n) => `${n}-я четверть`, en: (n) => `Quarter ${n}` };
const RANGLAR = { red: "#E53935", blue: "#1E63D6", green: "#2EA44F", yellow: "#FFD21F", pink: "#FF7EB6", purple: "#8E44C9", black: "#222", white: "#FFFFFF", orangec: "#FB8C00", brown: "#8D5A33" };
const BELLASHUV_SONIYA = 15;
const teg = (t, til) => `[${til}]${t}[/${til}]`;

function Rasm({ w, className = "" }) {
  if (RANGLAR[w.id]) return <span className={`${className} mk-rang`} style={{ "--rang": RANGLAR[w.id] }} aria-hidden="true" />;
  const src = (w.rasm && MAKTAB_RASM[w.rasm]) || (w.bogcha && RASMLAR[w.id]);
  if (src) return <img className={className} src={src} alt="" draggable="false" loading="lazy" />;
  return <span className={`${className} is-emoji`} aria-hidden="true">{w.emoji || "⭐"}</span>;
}

/**
 * REV129: Maktab (1–11 sinf) uchun yozuvli til o'yinlari. Har sinfga bir o'quv yili: 8 ta bo'lim (har chorakda 2 ta),
 * har bo'limda 10 ta so'z va 3–5 ta gap. 8 xil o'yin: so'z kartalari, rasmini top, ma'nosini top, harflardan ter,
 * gap tuz, eshit va yoz, ayt (mikrofon), bellashuv (vaqt bilan). So'zlar takrorlash tizimi bilan eslab qolinadi.
 */
export default function MaktabTil({ apiBase = "", til = "en", izoh = "uz", sinf: boshSinf = 1, cheklovsiz = false, onClose, sarlavha = "" }) {
  useInterface();
  const iz = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
  const [sinf, setSinf] = useState(Math.min(11, Math.max(1, Number(boshSinf) || 1)));
  const [bolimId, setBolimId] = useState(null);
  const [rejim, setRejim] = useState("kartalar");
  const [oyin, setOyin] = useState(null);             // {list, i, togri, javob, tanlangan:[], yozuv, natija}
  const [ochiq, setOchiq] = useState({});              // kartalar: ochilgan
  const [mik, setMik] = useState("");
  const [vaqt, setVaqt] = useState(() => (cheklovsiz ? { holat: "ok" } : vaqtHolati(vaqtOqi())));
  const [soniya, setSoniya] = useState(BELLASHUV_SONIYA);
  const [, setYangi] = useState(0);
  const audio = useRef(null);
  const rec = useRef(null);
  const token = useRef(0);
  const alive = useRef(true);
  const lastTap = useRef(Date.now());
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  useEffect(() => () => { alive.current = false; token.current++; try { audio.current?.pause(); } catch { /* */ } try { rec.current?.abort(); } catch { /* */ } }, []);

  // vaqt nazorati (o'yin xonalari bilan bir xil: 1 soatda tanaffus, kuniga 2 soat)
  useEffect(() => {
    if (cheklovsiz) return undefined;
    const bor = () => { lastTap.current = Date.now(); };
    globalThis.addEventListener?.("pointerdown", bor, true);
    const id = setInterval(() => {
      const korinadi = (globalThis.document?.visibilityState || "visible") === "visible";
      setVaqt(tik(korinadi && Date.now() - lastTap.current < FAOL * 1000 ? 15 : 0));
    }, 15000);
    return () => { clearInterval(id); globalThis.removeEventListener?.("pointerdown", bor, true); };
  }, [cheklovsiz]);
  const bloklangan = !cheklovsiz && vaqt.holat !== "ok";

  const ayt = (text, { sekin = false } = {}, done) => {
    try { audio.current?.pause(); } catch { /* */ }
    const my = ++token.current;
    let fin = false;
    const end = () => { if (fin) return; fin = true; if (alive.current && my === token.current) done?.(); };
    // REV139: chet tildagi so'zlarni qurilma ovozi o'qiydi, o'zbekchasi — serverdan
    if (aralashKerak(text)) {
      const tezlik = sekin ? "-30%" : sinf <= 4 ? "-15%" : "-5%";
      const ctl = aralashOqi(String(text).slice(0, 1500), (m) => `${String(apiBase).replace(/\/+$/, "")}/api/ovoz?k=133&${new URLSearchParams({ matn: m, jins: "qiz", tezlik })}`,
        { rate: sekin ? 0.65 : sinf <= 4 ? 0.85 : 0.95, onEnd: end });
      audio.current = { pause: () => ctl.stop() };
      setTimeout(end, Math.min(25000, 6000 + String(text).length * 170));
      return;
    }
    try {
      const params = new URLSearchParams({ matn: String(text).slice(0, 1500), jins: "qiz", tezlik: sekin ? "-30%" : sinf <= 4 ? "-15%" : "-5%" });
      const a = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?k=133&${params}`);
      audio.current = a; a.onended = end; a.onerror = end;
      a.play().catch(() => setTimeout(end, 1200));
      setTimeout(end, Math.min(20000, 5000 + String(text).length * 150));
    } catch { setTimeout(end, 800); }
  };
  const aytTil = (t, sekin = false, done) => ayt(teg(t, til), { sekin }, done);

  const sinfData = SINFLAR[sinf - 1];
  const bolim = sinfData?.bolimlar.find((b) => b.id === bolimId) || null;
  const srs = srsOl(til);
  const yul = yulduzlar(til);
  const savol = oyin?.list[oyin.i] || null;
  const oyinRef = useRef(oyin);
  oyinRef.current = oyin;
  const matnKor = sinf >= 3;   // 1–2 sinfda asosan ovoz va rasm; 3-sinfdan yozuv ham

  // bellashuv taymeri
  const javobBor = Boolean(oyin?.javob);
  useEffect(() => {
    if (!savol?.vaqt || javobBor || bloklangan) return undefined;
    setSoniya(BELLASHUV_SONIYA);
    let qoldi = BELLASHUV_SONIYA;
    const id = setInterval(() => {
      qoldi -= 1;
      setSoniya(Math.max(0, qoldi));
      if (qoldi <= 0) { clearInterval(id); javobBer(false, null); }   // eslint-disable-line no-use-before-define
    }, 1000);
    return () => clearInterval(id);
  }, [oyin?.i, oyin?.list, javobBor, bloklangan]); // eslint-disable-line react-hooks/exhaustive-deps

  // har yangi savolda — eshittiramiz
  useEffect(() => {
    if (!savol || oyin?.javob) return;
    if (savol.tur === "rasm" || savol.tur === "yoz") aytTil(savol.soz ? savol.soz.w[til] : savol.gap.w[til]);
    if (savol.tur === "harf" && sinf <= 4) aytTil(savol.soz.w[til], true);
  }, [oyin?.i, oyin?.list]); // eslint-disable-line react-hooks/exhaustive-deps

  const boshla = (r) => {
    if (bloklangan || !bolim) return;
    token.current++;
    setRejim(r); setOchiq({});
    if (r === "kartalar") { setOyin(null); return; }
    const list = savollar(r, bolim, sinf, { srs, til });
    setOyin({ list, i: 0, togri: 0, javob: null, tanlangan: [], yozuv: "", natija: null });
  };

  // Javob faqat bir marta qabul qilinadi (taymer, plitka va tugma bir vaqtda kelsa ham).
  const javobBer = (togriMi, qiymat = null) => {
    const o = oyinRef.current;
    if (!o || o.javob || o.natija) return;
    const q = o.list[o.i];
    const id = q?.soz?.id || q?.gap?.id;
    if (id) belgila(til, id, Boolean(togriMi));
    const yangi = { ...o, javob: { togri: Boolean(togriMi), qiymat }, togri: o.togri + (togriMi ? 1 : 0) };
    oyinRef.current = yangi;
    setOyin(yangi);
    if (togriMi && q && q.tur !== "yoz") aytTil(q.soz ? q.soz.w[til] : q.gap.w[til]);
  };
  const keyingi = () => {
    token.current++;
    setOyin((o) => {
      if (!o) return o;
      if (o.i + 1 >= o.list.length) {
        const y = yulduzHisob(o.togri, o.list.length);
        yulduzYoz(til, bolim.id, rejim, y);
        return { ...o, natija: { yulduz: y } };
      }
      return { ...o, i: o.i + 1, javob: null, tanlangan: [], yozuv: "" };
    });
    setMik("");
  };

  const tingla = () => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!R || !savol) { setMik("tugma"); return; }
    const matn = savol.soz ? savol.soz.w[til] : savol.gap.w[til];
    const my = token.current;
    let done = false;
    const r = new R(); rec.current = r;
    r.lang = CONTENT_LOCALES[til] || "en-US"; r.interimResults = false; r.maxAlternatives = 5;
    const keldi = (alts) => {
      if (done) return; done = true; rec.current = null;
      if (!alive.current || my !== token.current) return;
      setMik("");
      const b = gapBaho(alts, matn, til);
      javobBer(b.togri, alts[0] || "");
    };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("tugma"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("tugma"); }
  };

  const vaqtTosiq = bloklangan && <div className="mk-vaqt" role="alert">
    <span aria-hidden="true">{vaqt.holat === "tanaffus" ? "🧘" : "🌙"}</span>
    <b>{vaqt.holat === "tanaffus" ? T("Bir soat o‘ynadingiz. Ko‘zlar dam olsin — biroz harakat qiling!") : T("Bugungi o‘yin vaqti tugadi. Ertaga davom etamiz!")}</b>
    {vaqt.holat === "tanaffus" && <small>⏳ {vaqt.qoldi} {T("daq.")}</small>}
  </div>;

  // ———— yil xaritasi ————
  if (!bolim) {
    return <div className="mk-root">
      <div className="mk-bar">
        <button type="button" className="mk-back" onClick={() => { token.current++; onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
        <div className="mk-head"><b className="mk-title">📚 {sarlavha || T("Maktab: til o‘yinlari")}</b>
          <small>{T("Bir yillik dastur: har chorakda 2 ta bo‘lim")}</small></div>
        {!cheklovsiz && vaqt.holat === "ok" && <span className="mk-time">⏳ {vaqt.qoldi}′</span>}
      </div>
      <div className="mk-grades" role="tablist" aria-label={T("Sinf")}>
        {SINFLAR.map((s) => <button key={s.sinf} type="button" role="tab" aria-selected={sinf === s.sinf}
          className={`mk-grade ${sinf === s.sinf ? "is-on" : ""}`} onClick={() => setSinf(s.sinf)}>{s.sinf}</button>)}
        <span className="mk-grade-label">{T("sinf")}</span>
      </div>
      {vaqtTosiq}
      <div className="mk-year">
        {[0, 1, 2, 3].map((ch) => <section key={ch} className={`mk-quarter q${ch + 1}`}>
          <h3>{CHORAK[iz](ch + 1)}</h3>
          <div className="mk-units">
            {sinfData.bolimlar.slice(ch * 2, ch * 2 + 2).map((b) => {
              const p = Math.round(bolimPuxta(b, srs) * 100);
              const yz = Object.values(yul[b.id] || {}).reduce((a, v) => a + v, 0);
              return <button key={b.id} type="button" className="mk-unit" disabled={bloklangan}
                onClick={() => { setBolimId(b.id); setRejim("kartalar"); setOyin(null); setOchiq({}); }}>
                <span className="mk-unit-emoji" aria-hidden="true">{b.emoji}</span>
                <span className="mk-unit-body">
                  <b>{b.nom[iz]}</b>
                  <small dir="auto">{b.sozlar.slice(0, 3).map((w) => w.w[til]).join(" · ")}…</small>
                  <span className="mk-unit-meta">🏅 {p}% · ⭐ {yz}</span>
                </span>
                <i className="mk-progress" style={{ "--p": `${p}%` }} aria-hidden="true" />
              </button>;
            })}
          </div>
        </section>)}
      </div>
    </div>;
  }

  // ———— bo'lim ————
  const sahifa = () => {
    if (rejim === "kartalar") {
      return <div className="mk-cards">
        <button type="button" className="mk-btn is-main mk-all" onClick={() => {
          const l = bolim.sozlar; const oyna = (k) => { if (k < l.length && alive.current) aytTil(l[k].w[til], false, () => setTimeout(() => oyna(k + 1), 300)); }; oyna(0);
        }}>▶ {T("Hammasini tinglash")}</button>
        {bolim.sozlar.map((w) => <button key={w.id} type="button" className={`mk-card ${ochiq[w.id] ? "is-open" : ""}`}
          onClick={() => { setOchiq((o) => ({ ...o, [w.id]: !o[w.id] })); aytTil(w.w[til]); }}>
          <Rasm w={w} className="mk-pic" />
          <b dir="auto">{w.w[til]}</b>
          {ochiq[w.id] && <small dir="auto">{w.w[iz]}</small>}
        </button>)}
        {bolim.gaplar.length > 0 && <div className="mk-sentences">
          {bolim.gaplar.map((g) => <button key={g.id} type="button" className="mk-sentence" onClick={() => aytTil(g.w[til])}>
            <span aria-hidden="true">🔊</span><span><b dir="auto">{g.w[til]}</b><small dir="auto">{g.w[iz]}</small></span>
          </button>)}
        </div>}
      </div>;
    }
    if (!oyin) return null;
    if (oyin.natija) {
      return <div className="mk-done" role="status">
        <span aria-hidden="true">{oyin.natija.yulduz === 3 ? "🏆" : oyin.natija.yulduz ? "🎉" : "💪"}</span>
        <b>{"⭐".repeat(oyin.natija.yulduz) || "☆"}</b>
        <small>{T("To‘g‘ri javoblar")}: {oyin.togri} / {oyin.list.length}</small>
        <div className="mk-row">
          <button type="button" className="mk-btn is-main" onClick={() => boshla(rejim)}>🔁 {T("Yana o‘ynash")}</button>
          <button type="button" className="mk-btn" onClick={() => boshla("kartalar")}>📇 {T("So‘z kartalari")}</button>
        </div>
      </div>;
    }
    if (!savol) return <p className="mk-hint">{T("Bu bo‘limda bunday o‘yin uchun material yo‘q.")}</p>;
    const j = oyin.javob;
    const s = savol;
    const matn = s.soz ? s.soz.w[til] : s.gap?.w[til];
    const mano = s.soz ? s.soz.w[iz] : s.gap?.w[iz];
    return <div className="mk-q">
      <div className="mk-q-top">
        <span className="mk-step">{oyin.i + 1}/{oyin.list.length}</span>
        {s.vaqt && !j && <span className="mk-timer" style={{ "--t": `${(soniya / BELLASHUV_SONIYA) * 100}%` }}>⏱ {soniya}</span>}
        <span className="mk-score">✅ {oyin.togri}</span>
      </div>

      {s.tur === "rasm" && <>
        <div className="mk-prompt"><button type="button" className="mk-say" onClick={() => aytTil(matn)}>🔊</button>
          {matnKor && <b dir="auto">{matn}</b>}<button type="button" className="mk-say is-slow" onClick={() => aytTil(matn, true)}>🐢</button></div>
        <div className="mk-options is-pics">{s.variantlar.map((w) => <button key={w.id} type="button" disabled={Boolean(j)}
          className={`mk-opt ${j && w.id === s.soz.id ? "is-right" : ""} ${j && j.qiymat === w.id && w.id !== s.soz.id ? "is-wrong" : ""}`}
          onClick={() => javobBer(w.id === s.soz.id, w.id)}><Rasm w={w} className="mk-pic" />{j && <small dir="auto">{w.w[til]}</small>}</button>)}</div>
      </>}

      {s.tur === "mano" && <>
        <div className="mk-prompt"><button type="button" className="mk-say" onClick={() => aytTil(matn)}>🔊</button><b className="is-big" dir="auto">{matn}</b></div>
        <div className="mk-options">{s.variantlar.map((w) => <button key={w.id} type="button" disabled={Boolean(j)}
          className={`mk-opt is-text ${j && w.id === s.soz.id ? "is-right" : ""} ${j && j.qiymat === w.id && w.id !== s.soz.id ? "is-wrong" : ""}`}
          onClick={() => javobBer(w.id === s.soz.id, w.id)} dir="auto">{w.w[iz]}</button>)}</div>
      </>}

      {(s.tur === "harf" || s.tur === "gap") && <>
        <div className="mk-prompt">
          {s.soz && <Rasm w={s.soz} className="mk-pic is-small" />}
          <span className="mk-mano" dir="auto">{mano}</span>
          <button type="button" className="mk-say" onClick={() => aytTil(matn, true)}>🔊</button>
        </div>
        <div className={`mk-slots ${s.tur === "gap" ? "is-words" : ""}`} dir="auto">
          {oyin.tanlangan.length ? oyin.tanlangan.map((t, k) => <button key={k} type="button" className="mk-tile is-in" disabled={Boolean(j)}
            onClick={() => setOyin((o) => ({ ...o, tanlangan: o.tanlangan.filter((_, z) => z !== k) }))}>{t.c}</button>)
            : <span className="mk-ph">{s.tur === "gap" ? T("Bo‘laklarni tartib bilan bosing") : T("Harflarni tartib bilan bosing")}</span>}
        </div>
        {!j && <div className="mk-tiles" dir="auto">{s.plitkalar.map((t) => <button key={t.k} type="button" className="mk-tile"
          disabled={oyin.tanlangan.some((x) => x.k === t.k)}
          onClick={() => {
            const o = oyinRef.current;
            if (!o || o.javob || o.tanlangan.some((x) => x.k === t.k)) return;
            const tanlangan = [...o.tanlangan, t];
            const yangi = { ...o, tanlangan };
            oyinRef.current = yangi;
            setOyin(yangi);
            const kerakli = s.tur === "gap" ? s.plitkalar.length : harflar(matn).length;
            if (tanlangan.length >= kerakli) {
              const ok = s.tur === "gap" ? bolakTogri(tanlangan.map((x) => x.c), matn, til) : harfTogri(tanlangan.map((x) => x.c), matn);
              setTimeout(() => javobBer(ok, tanlangan.map((x) => x.c).join(s.tur === "gap" ? " " : "")), 120);
            }
          }}>{t.c}</button>)}
          <button type="button" className="mk-tile is-clear" onClick={() => setOyin((o) => ({ ...o, tanlangan: [] }))} aria-label={T("Tozalash")}>⌫</button>
        </div>}
      </>}

      {s.tur === "yoz" && <>
        <div className="mk-prompt"><button type="button" className="mk-say" onClick={() => aytTil(matn)}>🔊</button>
          <button type="button" className="mk-say is-slow" onClick={() => aytTil(matn, true)}>🐢</button>
          {sinf <= 6 && <span className="mk-mano" dir="auto">{mano}</span>}</div>
        <textarea className="mk-input" dir="auto" lang={til} rows={s.gap ? 2 : 1} value={oyin.yozuv} disabled={Boolean(j)} autoCapitalize="off" spellCheck={false}
          placeholder={T("Eshitganingizni yozing…")} onChange={(e) => setOyin((o) => ({ ...o, yozuv: e.target.value }))} />
        {!j && <button type="button" className="mk-btn is-main" disabled={!oyin.yozuv.trim()}
          onClick={() => { const r = yozuvniTekshir(oyin.yozuv, matn, til); javobBer(r.holat !== "xato", r.holat); }}>✔ {T("Tekshirish")}</button>}
      </>}

      {s.tur === "ayt" && <>
        <div className="mk-prompt">{s.soz && <Rasm w={s.soz} className="mk-pic is-small" />}<b className="is-big" dir="auto">{matn}</b></div>
        <small className="mk-mano" dir="auto">{mano}</small>
        <div className="mk-row">
          <button type="button" className="mk-btn" onClick={() => aytTil(matn)}>🔊 {T("Tinglash")}</button>
          <button type="button" className="mk-btn" onClick={() => aytTil(matn, true)}>🐢 {T("Sekin")}</button>
          {!j && mikBor && mik !== "tugma" && <button type="button" className={`mk-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} onClick={tingla} disabled={mik === "tinglayapti"}>
            🎤 {mik === "tinglayapti" ? T("Gapiring…") : T("Gapirish")}</button>}
          {!j && <button type="button" className="mk-btn" onClick={() => javobBer(true, "")}>✅ {T("Ovoz chiqarib aytdim")}</button>}
        </div>
      </>}

      {j && <div className={`mk-result ${j.togri ? "is-right" : "is-wrong"}`} role="status">
        <b>{j.togri ? (j.qiymat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri — belgilarni tekshiring")}` : `✅ ${T("To‘g‘ri!")}`) : `❌ ${T("To‘g‘ri javob")}:`}</b>
        {(!j.togri || s.tur === "yoz" || s.tur === "ayt") && <span className="mk-answer" dir="auto">{matn}<small dir="auto">{mano}</small></span>}
        {s.tur === "ayt" && j.qiymat && <small>🎤 {j.qiymat}</small>}
        <button type="button" className="mk-btn is-main" onClick={keyingi}>➡ {T("Keyingisi")}</button>
      </div>}
    </div>;
  };

  return <div className="mk-root">
    <div className="mk-bar">
      <button type="button" className="mk-back" onClick={() => { token.current++; setBolimId(null); setOyin(null); }} aria-label={T("Orqaga")}>⬅️</button>
      <div className="mk-head"><b className="mk-title">{bolim.emoji} {bolim.nom[iz]}</b><small>{SINF_NOMI[iz](sinf)}</small></div>
      {!cheklovsiz && vaqt.holat === "ok" && <span className="mk-time">⏳ {vaqt.qoldi}′</span>}
    </div>
    <div className="mk-modes" role="tablist">
      {rejimlar(sinf).map((r) => <button key={r} type="button" role="tab" aria-selected={rejim === r} disabled={bloklangan}
        className={`mk-mode ${rejim === r ? "is-on" : ""}`} onClick={() => boshla(r)}>
        <span aria-hidden="true">{REJIM[r][0]}</span> {T(REJIM[r][1])}{yul[bolim.id]?.[r] ? ` ${"⭐".repeat(yul[bolim.id][r])}` : ""}
      </button>)}
    </div>
    <p className="mk-hint">{IZOH[rejim][iz]}</p>
    {vaqtTosiq || sahifa()}
  </div>;
}
