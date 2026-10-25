import React, { useEffect, useMemo, useRef, useState } from "react";
import { SINFLAR } from "./index.js";
import Rasm from "./MaktabRasm.jsx";
import Repetitor from "./Repetitor.jsx";
import { lugatOl, muddatiKelgan } from "./repetitorRules.js";
import { CEFR, darajaHisob, sinfMaqsadi, bahoOf, javobBali, javobYoz, natijaOl, tezlikOf, yilYoli, bolimQadamlari, rejimOchiq, keyingiQadam, QADAMLAR } from "./darajaRules.js";
import { natijaYubor, reytingOl, faollikYoz, topshiriqlarOl, topshiriqBajardi, TIL_NOMI } from "./maktabServer.js";
import VaqtHalqa, { vaqtDarajasi } from "../kid/VaqtHalqa.jsx";
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
  kartalar: ["📇", "So‘z kartalari"], repetitor: ["👩‍🏫", "Repetitor"], rasm: ["🖼️", "Rasmini top"], mano: ["🔤", "Ma’nosini top"], harf: ["🔡", "Harflardan ter"],
  gap: ["🧱", "Gap tuz"], yoz: ["🎧", "Eshit va yoz"], ayt: ["🗣️", "Ayt"], bellashuv: ["🏆", "Bellashuv"],
};
const IZOH = {
  kartalar: { uz: "Kartani bosing — so‘zni eshitasiz va ma’nosini ko‘rasiz.", ru: "Нажмите на карточку — услышите слово и увидите перевод.", en: "Tap a card to hear the word and see its meaning." },
  repetitor: { uz: "Ustoz so‘zni aytadi va harflab ko‘rsatadi; siz daftarga yozasiz, eshitib yozasiz va tarjima qilasiz.", ru: "Учитель произносит слово и показывает по буквам; вы пишете в тетради, пишете на слух и переводите.", en: "The teacher says the word and spells it; you write it in your notebook, write from dictation and translate." },
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
const BELLASHUV_SONIYA = 15;
const teg = (t, til) => `[${til}]${t}[/${til}]`;


/** REV173: daraja kartasi — CEFR zinapoyasi, keyingi darajagacha foiz, ball, baho, tezlik va sinfdoshlar orasida o'rin. */
function DarajaKarta({ dr, nat, reyting, sinf }) {
  const baho = bahoOf(nat.togri, nat.jami);
  const tez = tezlikOf(nat);
  const maqsad = sinfMaqsadi(sinf);
  return <section className={`mk-daraja ${dr.yaqin ? "is-yaqin" : ""}`} aria-label={T("Daraja")}>
    <div className="mk-daraja-bosh">
      <span className="mk-daraja-belgi" aria-hidden="true">{dr.indeks >= 0 ? CEFR[dr.indeks].emoji : "🌰"}</span>
      <div className="mk-daraja-matn">
        <small>{T("Darajangiz")}</small>
        <b>{dr.daraja || T("Boshlang‘ich")}</b>
        <small>{T("Sinfingiz uchun maqsad")}: <b>{maqsad}</b></small>
      </div>
    </div>
    {dr.keyingi && <div className="mk-daraja-keyingi">
      <span className="mk-daraja-chiziq" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dr.foiz}><i style={{ width: `${Math.max(3, dr.foiz)}%` }} /></span>
      <small>{dr.yaqin ? T("🎯 Darajangiz {daraja} ga yaqinlashdi!").replace("{daraja}", dr.keyingi) : T("{daraja} darajasigacha: {foiz}%").replace("{daraja}", dr.keyingi).replace("{foiz}", String(dr.foiz))}</small>
    </div>}
    <ol className="mk-cefr" aria-hidden="true">
      {CEFR.map((c, i) => <li key={c.kod} className={i <= dr.indeks ? "is-on" : c.kod === dr.keyingi ? "is-keyingi" : ""}><span>{c.emoji}</span>{c.kod}</li>)}
    </ol>
    <div className="mk-chips">
      <span title={T("Ball")}>💎 {nat.bal} {T("ball")}</span>
      {baho && <span title={T("O‘rtacha baho")}>📝 {T("Baho")}: {baho}</span>}
      {tez !== null && <span title={T("Bellashuvda o‘rtacha javob vaqti")}>⚡ {tez} {T("soniya")}</span>}
      {reyting && <span className="is-rank" title={T("Sinfdoshlar orasida (ismlar ko‘rsatilmaydi)")}>🏆 {reyting.orin}-{T("o‘rin")} / {reyting.jami}</span>}
    </div>
  </section>;
}

/**
 * REV129: Maktab (1–11 sinf) uchun yozuvli til o'yinlari. Har sinfga bir o'quv yili: 8 ta bo'lim (har chorakda 2 ta),
 * har bo'limda 10 ta so'z va 3–5 ta gap. 8 xil o'yin: so'z kartalari, rasmini top, ma'nosini top, harflardan ter,
 * gap tuz, eshit va yoz, ayt (mikrofon), bellashuv (vaqt bilan). So'zlar takrorlash tizimi bilan eslab qolinadi.
 */
export default function MaktabTil({ apiBase = "", token: authToken = "", til = "en", izoh = "uz", sinf: boshSinf = 1, cheklovsiz = false, onClose, sarlavha = "" }) {
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
  const [lugatOchiq, setLugatOchiq] = useState(false);   // REV172: «Mening lug‘atim» (repetitor)
  const [reyting, setReyting] = useState(null);           // REV173: sinfdoshlar orasida o'rin
  const [eslatma, setEslatma] = useState("");             // REV173: qulflangan o'yin bosilganda
  const ozSinf = Math.min(11, Math.max(1, Number(boshSinf) || 1));
  const savolBosh = useRef(Date.now());
  const korildi = useRef(new Set());   // shu bo'limda ochib ko'rilgan so'z kartalari
  const [topshiriqlar, setTopshiriqlar] = useState([]);   // REV174: ota-ona bergan mashqlar
  const [topshiriq, setTopshiriq] = useState(null);       // ochilgan topshiriq
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
  const takrorSoni = useMemo(() => muddatiKelgan(lugatOl(til)).length, [til, lugatOchiq, bolimId]); // eslint-disable-line react-hooks/exhaustive-deps
  const yul = yulduzlar(til);
  // REV173: daraja (CEFR), ball, baho, tezlik va bo'lim yo'li
  const lugat = lugatOl(til);
  const dr = darajaHisob(srs, lugat);
  const nat = natijaOl(til);
  const yol = sinfData ? yilYoli(sinfData, { yul, srs, lugat, ozSinf, erkin: cheklovsiz }) : [];
  const q = bolim ? bolimQadamlari(bolim, yul, srs, lugat) : null;
  const erkin = cheklovsiz || sinf < ozSinf;   // admin va o'tgan sinflar (takrorlash) — hammasi ochiq
  const sinxron = () => {
    const n = natijaOl(til), y2 = yulduzlar(til), d2 = darajaHisob(srsOl(til), lugatOl(til));
    return natijaYubor(apiBase, authToken, {
      til, sinf: ozSinf, bal: n.bal, togri: n.togri, jami: n.jami, daraja: d2.daraja || "", foiz: d2.foiz, keyingi: d2.keyingi || "",
      otildi: SINFLAR.reduce((k, x) => k + x.bolimlar.filter((b) => (y2[b.id]?.bellashuv || 0) >= 1).length, 0),
    }).then(() => reytingOl(apiBase, authToken, til, ozSinf)).then((r) => { if (alive.current) setReyting(r); });
  };
  // yil xaritasi ochilganda: natija serverga, o'rin olinadi; keyingi darajaga yaqin bo'lsa — ustoz kuniga bir marta aytadi
  useEffect(() => {
    if (bolimId) return;
    sinxron();
    topshiriqlarOl(apiBase, authToken, til).then((l) => { if (alive.current) setTopshiriqlar(l); });
    if (!dr.yaqin) return;
    const k = `kabutar:maktab:yaqin:${til}:${dr.keyingi}`;
    const bugun = new Date().toDateString();
    try { if (globalThis.localStorage?.getItem(k) === bugun) return; globalThis.localStorage?.setItem(k, bugun); } catch { /* */ }
    const m = { uz: `Barakalla! Darajangiz ${dr.keyingi} ga yaqinlashdi.`, ru: `Молодец! Твой уровень приближается к ${dr.keyingi}.`, en: `Well done! Your level is getting close to ${dr.keyingi}.` }[iz];
    setTimeout(() => { if (alive.current) ayt(iz === "uz" ? m : teg(m, iz)); }, 700);
  }, [til, bolimId]); // eslint-disable-line react-hooks/exhaustive-deps
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
    savolBosh.current = Date.now();
    if (savol.tur === "rasm" || savol.tur === "yoz") aytTil(savol.soz ? savol.soz.w[til] : savol.gap.w[til]);
    if (savol.tur === "harf" && sinf <= 4) aytTil(savol.soz.w[til], true);
  }, [oyin?.i, oyin?.list]); // eslint-disable-line react-hooks/exhaustive-deps

  const boshla = (r) => {
    if (bloklangan || !bolim) return;
    if (!rejimOchiq(r, bolimQadamlari(bolim, yulduzlar(til), srsOl(til), lugatOl(til)), erkin)) {
      const bq = bolimQadamlari(bolim, yulduzlar(til), srsOl(til), lugatOl(til));
      const m = r !== "bellashuv" ? T("Avval darsni o‘ting: «So‘z kartalari» yoki «Repetitor».")
        : !bq.mashq ? T("Imtihon mashqlardan keyin ochiladi: avval biror o‘yinni o‘ynang.")
        : T("Imtihon takrordan keyin ochiladi: so‘zlarni boshqa kuni yana bir bor takrorlang — xotirada mustahkam qoladi.");
      setEslatma(m); ayt(iz === "uz" ? m : teg(m, iz));
      return;
    }
    setEslatma("");
    token.current++;
    setRejim(r); setOchiq({});
    if (r === "kartalar" || r === "repetitor") { setOyin(null); return; }
    const list = savollar(r, bolim, sinf, { srs, til });
    setOyin({ list, i: 0, togri: 0, javob: null, tanlangan: [], yozuv: "", natija: null, boshVaqt: Date.now() });
  };

  // Javob faqat bir marta qabul qilinadi (taymer, plitka va tugma bir vaqtda kelsa ham).
  // oz — «Ovoz chiqarib aytdim» (o'zi aytdi, tekshirilmagan): ball, yulduz va takrorlash hisobiga kirmaydi
  const javobBer = (togriMi, qiymat = null, { oz = false } = {}) => {
    const o = oyinRef.current;
    if (!o || o.javob || o.natija) return;
    if (oz) {
      const yangi = { ...o, javob: { togri: true, qiymat: "", oz: true }, oz: (o.oz || 0) + 1 };
      oyinRef.current = yangi; setOyin(yangi);
      return;
    }
    const q = o.list[o.i];
    const id = q?.soz?.id || q?.gap?.id;
    if (id) belgila(til, id, Boolean(togriMi));
    // REV173: ball va tezlik (bellashuvda tez javob — qo'shimcha ball)
    const ms = Date.now() - savolBosh.current;
    javobYoz(til, { togri: Boolean(togriMi), bal: javobBali(Boolean(togriMi), { bellashuv: Boolean(q?.vaqt), qoldi: BELLASHUV_SONIYA - ms / 1000 }), ms: q?.vaqt ? ms : null });
    const yangi = { ...o, javob: { togri: Boolean(togriMi), qiymat }, togri: o.togri + (togriMi ? 1 : 0) };
    oyinRef.current = yangi;
    setOyin(yangi);
    if (togriMi && q && q.tur !== "yoz") aytTil(q.soz ? q.soz.w[til] : q.gap.w[til]);
  };
  // Natija va serverga yozish — holat yangilovchisidan tashqarida (yon ta'sirlar ikki marta bajarilmasin)
  const keyingi = () => {
    token.current++;
    const o = oyinRef.current;
    if (!o || o.natija) return;
    let yangi;
    if (o.i + 1 >= o.list.length) {
      const y = yulduzHisob(o.togri, o.list.length);
      yulduzYoz(til, bolim.id, rejim, y);
      setTimeout(sinxron, 0);
      // REV174: ota-ona «Bugun»da ko'radi
      faollikYoz(apiBase, authToken, { turi: "til", kod: `${til}:${bolim.id}:${rejim}`, til, fan: TIL_NOMI[til], mavzu: `${bolim.nom.uz} — ${REJIM[rejim]?.[1] || rejim}`,
        togri: o.togri, jami: o.list.length, soniya: (Date.now() - (o.boshVaqt || Date.now())) / 1000,
        sozlar: o.list.map((x) => x.soz?.id).filter(Boolean) });
      yangi = { ...o, natija: { yulduz: y } };
    } else {
      yangi = { ...o, i: o.i + 1, javob: null, tanlangan: [], yozuv: "" };
    }
    oyinRef.current = yangi;
    setOyin(yangi);
    setMik("");
  };

  // REV173: so'z kartalari ko'rildi (yarmi ochildi yoki hammasi tinglandi) — bo'limning «Dars» qadami bajarildi
  const darsOtildi = () => { if (bolim && !(yulduzlar(til)[bolim.id]?.kartalar >= 1)) { yulduzYoz(til, bolim.id, "kartalar", 1); setYangi((n) => n + 1); } };

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
      // REV174: hech narsa eshitilmasa — baholanmaydi, yana urinib ko'radi
      if (!alts.some((a) => String(a || "").trim())) { setMik("qayta"); return; }
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

  // REV172: repetitor (bo'lim darsi yoki «Mening lug'atim») — o'z ekrani, ustoz bilan
  if (!bloklangan && topshiriq) {
    return <div className="mk-root">
      <Repetitor key={`t${topshiriq.id}`} apiBase={apiBase} til={til} izoh={iz} sinf={ozSinf} topshiriq={topshiriq} rejim="dars"
        onYakun={(r) => {
          topshiriqBajardi(apiBase, authToken, topshiriq.id, r).then(() => topshiriqlarOl(apiBase, authToken, til)).then((l) => { if (alive.current) setTopshiriqlar(l); });
          faollikYoz(apiBase, authToken, { turi: "topshiriq", kod: `t:${topshiriq.id}`, til, fan: TIL_NOMI[til], mavzu: "Ota-ona topshirig‘i", ...r });
        }}
        onClose={() => { token.current++; setTopshiriq(null); }} />
    </div>;
  }
  if (!bloklangan && (lugatOchiq || (bolim && rejim === "repetitor"))) {
    return <div className="mk-root">
      <Repetitor apiBase={apiBase} til={til} izoh={iz} sinf={sinf} bolim={lugatOchiq ? null : bolim} rejim={lugatOchiq ? "lugat" : "dars"}
        onNatija={(y) => { if (bolim && !lugatOchiq) { yulduzYoz(til, bolim.id, "repetitor", y); setYangi((n) => n + 1); } }}
        onYakun={(r) => faollikYoz(apiBase, authToken, { turi: "repetitor", kod: `${til}:${r.takror || lugatOchiq || !bolim ? "takror" : bolim.id}`, til, fan: TIL_NOMI[til],
          mavzu: r.takror || lugatOchiq || !bolim ? "Repetitor: takror" : `Repetitor: ${bolim.nom.uz}`, ...r })}
        onClose={() => { token.current++; if (lugatOchiq) setLugatOchiq(false); else setRejim("kartalar"); }} />
    </div>;
  }

  // ———— yil xaritasi ————
  if (!bolim) {
    return <div className="mk-root">
      <div className="mk-bar">
        <button type="button" className="mk-back" onClick={() => { token.current++; onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
        <div className="mk-head"><b className="mk-title">📚 {sarlavha || T("Maktab: til o‘yinlari")}</b>
          <small>{T("Bir yillik dastur: har chorakda 2 ta bo‘lim")}</small></div>
        {!cheklovsiz && vaqt.holat === "ok" && <VaqtHalqa qoldi={vaqt.qoldi} jami={60} ogoh={vaqt.ogoh} daraja={vaqtDarajasi({ sinf })} />}
      </div>
      <div className="mk-grades" role="tablist" aria-label={T("Sinf")}>
        {SINFLAR.map((s) => <button key={s.sinf} type="button" role="tab" aria-selected={sinf === s.sinf}
          className={`mk-grade ${sinf === s.sinf ? "is-on" : ""}`} onClick={() => setSinf(s.sinf)}>{s.sinf}</button>)}
        <span className="mk-grade-label">{T("sinf")}</span>
      </div>
      {vaqtTosiq}
      {eslatma && <p className="mk-eslatma" role="status">🔒 {eslatma}</p>}
      {topshiriqlar.length > 0 && <section className="mk-topshiriqlar" aria-label={T("Ota-onangizdan topshiriq")}>
        {topshiriqlar.map((t) => <div key={t.id} className={`mk-topshiriq ${t.holat === "bajarildi" ? "is-done" : ""}`}>
          <span className="mk-topshiriq-belgi" aria-hidden="true">{t.holat === "bajarildi" ? "✅" : "📬"}</span>
          <span className="mk-topshiriq-matn">
            <b>{t.holat === "bajarildi" ? T("Topshiriq bajarildi") : T("Ota-onangizdan topshiriq")}</b>
            <small>{t.sozlar.length} {T("ta so‘z")}{t.yozish ? ` · ✍ ${t.yozish} ${T("martadan")}` : ""}{t.muddat && t.holat !== "bajarildi" ? ` · 📅 ${t.muddat.split("-").reverse().slice(0, 2).join(".")}` : ""}</small>
            {t.izoh && <small className="mk-topshiriq-izoh">💬 {t.izoh}</small>}
          </span>
          {t.holat !== "bajarildi" && <button type="button" className="mk-btn is-main" disabled={bloklangan} onClick={() => setTopshiriq(t)}>▶ {T("Bajarish")}</button>}
        </div>)}
      </section>}
      <button type="button" className="mk-lugat" disabled={bloklangan} onClick={() => setLugatOchiq(true)}>
        <span aria-hidden="true">📒</span><b>{T("Mening lug‘atim")}</b>
        <small>{takrorSoni ? `🔁 ${T("Bugungi takror")}: ${takrorSoni}` : `👩‍🏫 ${T("Repetitor")}`}</small>
      </button>
      <DarajaKarta dr={dr} nat={nat} reyting={reyting} sinf={ozSinf} />
      {/* REV173: yil yo'li — bo'limlar ketma-ket ochiladi (oldingi bo'lim imtihonidan keyin); har bo'limda 4 qadam */}
      <ol className="mk-yol" aria-label={T("O‘quv yo‘li")}>
        {yol.map(({ bolim: b, ochiq: och, q: bq, keyingi: kel }, i) => {
          const p = Math.round(bolimPuxta(b, srs) * 100);
          const yangiChorak = i % 2 === 0;
          return <React.Fragment key={b.id}>
            {yangiChorak && <li className={`mk-yol-chorak q${i / 2 + 1}`} aria-hidden="true"><span>{CHORAK[iz](i / 2 + 1)}</span></li>}
            <li className={`mk-yol-qadam ${i % 4 === 1 || i % 4 === 2 ? "is-o" : "is-c"} ${bq.imtihon ? "is-otdi" : ""} ${kel ? "is-keyingi" : ""} ${och ? "" : "is-qulf"}`}>
              <button type="button" className="mk-unit" disabled={bloklangan}
                onClick={() => {
                  if (!och) { const m = T("Bu bo‘lim oldingi bo‘lim imtihonidan keyin ochiladi."); setEslatma(m); ayt(iz === "uz" ? m : teg(m, iz)); return; }
                  setEslatma(""); korildi.current = new Set(); setBolimId(b.id); setRejim("kartalar"); setOyin(null); setOchiq({});
                }}>
                <span className="mk-yol-tugun" aria-hidden="true">{och ? b.emoji : "🔒"}<i>{bq.imtihon ? "✓" : i + 1}</i></span>
                <span className="mk-unit-body">
                  {kel && <span className="mk-yol-bayroq">📍 {T("Shu yerdan davom eting")}</span>}
                  <b>{b.nom[iz]}</b>
                  <small dir="auto">{b.sozlar.slice(0, 3).map((w) => w.w[til]).join(" · ")}…</small>
                  <span className="mk-qadamlar" aria-label={QADAMLAR.map((x) => `${T(x.nom)}: ${bq[x.k] ? "✓" : "—"}`).join(", ")}>
                    {QADAMLAR.map((x) => <i key={x.k} className={bq[x.k] ? "is-on" : ""} title={T(x.nom)}>{x.emoji}</i>)}
                    <em>🏅 {p}%{bq.baho ? ` · ${T("Baho")}: ${bq.baho}` : ""}</em>
                  </span>
                </span>
              </button>
            </li>
          </React.Fragment>;
        })}
      </ol>
    </div>;
  }

  // ———— bo'lim ————
  const sahifa = () => {
    if (rejim === "kartalar") {
      return <div className="mk-cards">
        <button type="button" className="mk-btn is-main mk-all" onClick={() => {
          const l = bolim.sozlar; const oyna = (k) => { if (k >= l.length) { darsOtildi(); return; } if (alive.current) aytTil(l[k].w[til], false, () => setTimeout(() => oyna(k + 1), 300)); }; oyna(0);
        }}>▶ {T("Hammasini tinglash")}</button>
        {bolim.sozlar.map((w) => <button key={w.id} type="button" className={`mk-card ${ochiq[w.id] ? "is-open" : ""}`}
          onClick={() => { setOchiq({ ...ochiq, [w.id]: !ochiq[w.id] }); korildi.current.add(w.id); if (korildi.current.size >= Math.ceil(bolim.sozlar.length / 2)) darsOtildi(); aytTil(w.w[til]); }}>
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
        {oyin.oz > 0 && <small>🗣 {T("O‘zingiz aytdingiz (tekshirilmagan)")}: {oyin.oz}</small>}
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
          {mik === "qayta" && !j && <small className="mk-mik-qayta" role="status">🎤 {T("Ovoz eshitilmadi — yana bosib, balandroq ayting.")}</small>}
          {!j && <button type="button" className="mk-btn" onClick={() => javobBer(true, "", { oz: true })}>✅ {T("Ovoz chiqarib aytdim")}</button>}
        </div>
      </>}

      {j && <div className={`mk-result ${j.togri ? "is-right" : "is-wrong"}`} role="status">
        <b>{j.oz ? `🗣 ${T("Barakalla! Mikrofon bilan aytsangiz — ball va yulduz ham olasiz.")}` : j.togri ? (j.qiymat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri — belgilarni tekshiring")}` : `✅ ${T("To‘g‘ri!")}`) : `❌ ${T("To‘g‘ri javob")}:`}</b>
        {(!j.togri || s.tur === "yoz" || s.tur === "ayt") && <span className="mk-answer" dir="auto">{matn}<small dir="auto">{mano}</small></span>}
        {s.tur === "ayt" && j.qiymat && <small>🎤 {j.qiymat}</small>}
        <button type="button" className="mk-btn is-main" onClick={keyingi}>➡ {T("Keyingisi")}</button>
      </div>}
    </div>;
  };

  return <div className="mk-root">
    <div className="mk-bar">
      <button type="button" className="mk-back" onClick={() => { token.current++; setBolimId(null); setOyin(null); setEslatma(""); }} aria-label={T("Orqaga")}>⬅️</button>
      <div className="mk-head"><b className="mk-title">{bolim.emoji} {bolim.nom[iz]}</b><small>{SINF_NOMI[iz](sinf)}</small></div>
      {!cheklovsiz && vaqt.holat === "ok" && <VaqtHalqa qoldi={vaqt.qoldi} jami={60} ogoh={vaqt.ogoh} daraja={vaqtDarajasi({ sinf })} />}
    </div>
    {/* REV173: bo'lim yo'li — dars → mashq → takror → imtihon */}
    <div className="mk-bosqich" aria-label={T("Bo‘lim yo‘li")}>
      {QADAMLAR.map((x, k) => <React.Fragment key={x.k}>
        {k > 0 && <i className="mk-bosqich-chiziq" aria-hidden="true" />}
        <span className={`mk-bosqich-q ${q[x.k] ? "is-on" : ""} ${keyingiQadam(q) === x.k ? "is-keyingi" : ""}`}>
          <span aria-hidden="true">{q[x.k] ? "✅" : x.emoji}</span><small>{T(x.nom)}</small></span>
      </React.Fragment>)}
      {keyingiQadam(q) && !oyin && rejim === "kartalar" && (keyingiQadam(q) === "takror" && !q.takrorBugun && !erkin
        ? <span className="mk-bosqich-ertaga">🌙 {T("Takror — ertaga: so‘zlar xotirada bir kun «yotishi» kerak")}</span>
        : <button type="button" className="mk-btn is-main mk-bosqich-btn" disabled={bloklangan} onClick={() => {
          const k = keyingiQadam(q);
          if (k === "dars") boshla("repetitor");
          else if (k === "mashq" || k === "takror") boshla(rejimlar(sinf)[1]);
          else boshla("bellashuv");
        }}>▶ {T("Keyingi qadam")}: {T(QADAMLAR.find((x) => x.k === keyingiQadam(q)).nom)}</button>)}
    </div>
    {eslatma && <p className="mk-eslatma" role="status">🔒 {eslatma}</p>}
    <div className="mk-modes" role="tablist">
      {[rejimlar(sinf)[0], "repetitor", ...rejimlar(sinf).slice(1)].map((r) => { const och = rejimOchiq(r, q, erkin);
        return <button key={r} type="button" role="tab" aria-selected={rejim === r} disabled={bloklangan}
        className={`mk-mode ${rejim === r ? "is-on" : ""} ${och ? "" : "is-qulf"}`} onClick={() => boshla(r)}>
        <span aria-hidden="true">{och ? REJIM[r][0] : "🔒"}</span> {T(REJIM[r][1])}{r === "bellashuv" ? ` · ${T("Imtihon")}` : ""}{r !== "kartalar" && yul[bolim.id]?.[r] ? ` ${"⭐".repeat(yul[bolim.id][r])}` : ""}
      </button>; })}
    </div>
    <p className="mk-hint">{IZOH[rejim][iz]}</p>
    {vaqtTosiq || sahifa()}
  </div>;
}
