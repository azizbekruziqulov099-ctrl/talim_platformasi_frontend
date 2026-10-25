import React, { useEffect, useMemo, useRef, useState } from "react";
import { SINFLAR } from "./index.js";
import Rasm from "./MaktabRasm.jsx";
import KabuXonacha from "../kid/KabuXonacha.jsx";
import { ovozManbai, KABU_OVOZ } from "../kid/ovozOqi.js";
import { harfPlitkalar, harflar, harfTogri, terishMumkin } from "./maktabRules.js";
import { gapBaho } from "../til/mashqRules.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { kunRaqami } from "../kid/xonalar/xonaRules.js";
import {
  sinfSozlamasi, yozishMaqsadi, harflab, tekshir, yozishSoniyasi, lugatOl, repBelgila, yozildiQosh, sessiya, bosqichlar,
  lugatRoyxati, repYulduz, manoVariantlari, muddatiKelgan, REP_ORALIQ, YOZISH_CHEGARA, qoshimchaOl, qoshimchaSaqla,
} from "./repetitorRules.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import "./repetitor.css";

// Barcha sinflarning so'zlari (id → so'z) — o'tgan darslar so'zlari ham takrorga qaytadi
let SOZLAR = null;
const sozlarXaritasi = () => {
  if (SOZLAR) return SOZLAR;
  SOZLAR = {};
  for (const s of SINFLAR) for (const b of s.bolimlar) for (const w of b.sozlar) SOZLAR[w.id] = w;
  return SOZLAR;
};
// REV175: dastur so'zlari + fan darslaridan (AI miya) qo'shilgan so'zlar
const barchaSozlar = () => ({ ...qoshimchaOl(), ...sozlarXaritasi() });

// Ustoz aytadigan gaplar (interfeys tilida). {w} — chet tilidagi so'z, {m} — ma'nosi, {h} — harflab, {n} — son.
const GAP = {
  uz: {
    tanish: "Yangi so‘z: {w}. Ma’nosi — {m}. Men bilan birga ayting: {w}. Harflab aytaman: {h}. Doskaga qarang, mana shunday yoziladi.",
    eslash: "Esingizdami? {w} — {m}.",
    daftar: "Daftaringizni oling! {w} so‘zini {n} marta yozing. Har yozganingizda ovoz chiqarib ayting.",
    daftarOk: "Barakalla! Endi tekshiramiz.",
    eshit: "Eshiting va yozing: {w}.",
    uzdan: "{m} — qanday bo‘ladi? Ayting yoki yozing.",
    tildan: "{w} — ma’nosi nima? Tanlang.",
    togri: "To‘g‘ri! Barakalla!",
    deyarli: "Deyarli to‘g‘ri! Harflarga qarang: {h}.",
    xato: "Xato bo‘ldi. To‘g‘risi: {w}. Harflab: {h}. Daftaringizga yana {n} marta yozing.",
    harf: "Harflab: {h}.",
    tugadi: "Bugungi repetitor darsi tugadi! {n} marta yozdingiz. Barakalla!",
    bosh: "Salom! Bugun {n} ta so‘z ustida ishlaymiz.",
  },
  ru: {
    tanish: "Новое слово: {w}. Значит — {m}. Повторяйте за мной: {w}. По буквам: {h}. Посмотрите на доску, вот как оно пишется.",
    eslash: "Помните? {w} — {m}.",
    daftar: "Откройте тетрадь! Напишите слово {w} {n} раз. Каждый раз произносите вслух.",
    daftarOk: "Молодец! Теперь проверим.",
    eshit: "Послушайте и напишите: {w}.",
    uzdan: "Как будет {m}? Скажите или напишите.",
    tildan: "{w} — что это значит? Выберите.",
    togri: "Правильно! Молодец!",
    deyarli: "Почти правильно! Посмотрите на буквы: {h}.",
    xato: "Ошибка. Правильно: {w}. По буквам: {h}. Напишите в тетради ещё {n} раз.",
    harf: "По буквам: {h}.",
    tugadi: "Занятие с репетитором окончено! Вы написали {n} раз. Молодец!",
    bosh: "Привет! Сегодня работаем над {n} словами.",
  },
  en: {
    tanish: "New word: {w}. It means {m}. Say it with me: {w}. Letter by letter: {h}. Look at the board — this is how we write it.",
    eslash: "Do you remember? {w} means {m}.",
    daftar: "Take your notebook! Write the word {w} {n} times. Say it aloud each time.",
    daftarOk: "Well done! Now let's check.",
    eshit: "Listen and write: {w}.",
    uzdan: "How do you say {m}? Say it or write it.",
    tildan: "{w} — what does it mean? Choose.",
    togri: "Correct! Well done!",
    deyarli: "Almost right! Look at the letters: {h}.",
    xato: "Not quite. The right answer is {w}. Letter by letter: {h}. Write it {n} more times in your notebook.",
    harf: "Letter by letter: {h}.",
    tugadi: "Today's tutor lesson is over! You wrote {n} times. Well done!",
    bosh: "Hello! Today we will work on {n} words.",
  },
};
const BOSQICH = { tanish: ["🤖", "Tanishuv"], daftar: ["📓", "Daftarga yoz"], eshit: ["🎧", "Eshitib yoz"], uzdan: ["🔁", "Tarjima qil"], tildan: ["🔤", "Ma’nosini top"] };
const teg = (t, til) => (til === "uz" ? String(t) : `[${til}]${t}[/${til}]`);

/**
 * REV172: Repetitor — 1–11 sinf uchun shaxsiy ustoz. Bog'chadagi kabi: ustoz so'zni aytadi, harflab aytadi, doskada
 * ko'rsatadi; «Daftaringizni oling!» — bola so'zni ko'p marta yozadi; keyin eshitib yozadi (harfma-harf tekshiruv),
 * o'zbekchadan chet tiliga (ovoz yoki yozuv) va chet tilidan o'zbekchaga tarjima qiladi. Har so'z shaxsiy lug'atga
 * tushadi va oraliqli takrorlash bilan qaytadi. rejim: "dars" (bo'lim + takror) | "takror" (faqat muddati kelganlar) | "lugat".
 */
export default function Repetitor({ apiBase = "", til = "en", izoh = "uz", sinf = 1, bolim = null, rejim: boshRejim = "dars", topshiriq = null, darsSozlari = null, sarlavha = "", onNatija, onYakun, onClose }) {
  const iz = ["uz", "ru", "en"].includes(izoh) ? izoh : "uz";
  // REV177: so'z yodlatish, aytdirish, yozdirishni robot Kabu o'tkazadi — doim bitta Kabu ovozida
  const sozlam = sinfSozlamasi(sinf);
  // REV175: fan darsidan kelgan so'zlar — avval saqlanadi (lug'atda ko'rinsin), keyin umumiy xaritaga qo'shiladi
  const sozlar = useMemo(() => { if (darsSozlari?.length) qoshimchaSaqla(darsSozlari); return barchaSozlar(); }, [darsSozlari]);
  const [lugat, setLugat] = useState(() => lugatOl(til));
  const [rejim, setRejim] = useState(boshRejim);
  const [dars, setDars] = useState(null);   // {list, i, b, yozdi, maqsad, kiritish, plitka, tanlangan, javob, urinish, xatoBor, jamiYozdi, xatoSoz}
  const [gapir, setGapir] = useState(false);
  const [mik, setMik] = useState("");
  const [avto, setAvto] = useState(false);   // REV175: «Ustoz bilan yozamiz» — ustoz har safar aytadi, bola yozadi
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  const alive = useRef(true);
  const rec = useRef(null);
  const darsRef = useRef(dars);
  darsRef.current = dars;
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  useEffect(() => { alive.current = true; return () => { alive.current = false; ovoz.stop(); try { rec.current?.abort(); } catch { /* */ } }; }, [ovoz]);

  // REV175: ustoz bilan yozish — so'z uzunligiga mos sur'atda (qisqa 1.5 s, o'rta 2.5 s, uzun 3.5 s): har yozishda ustoz so'zni aytadi
  useEffect(() => {
    if (!avto) return undefined;
    const d0 = darsRef.current;
    if (!d0 || d0.bs?.[d0.b] !== "daftar" || d0.yozdi >= d0.maqsad) { setAvto(false); return undefined; }
    const soz0 = d0.list[d0.i].soz;
    const ms = yozishSoniyasi(soz0.w[til]) * 1000;
    ayt(teg(soz0.w[til], til));
    const id = setInterval(() => {
      const x = darsRef.current;
      if (!alive.current || !x || x.bs?.[x.b] !== "daftar" || x.list[x.i].soz.id !== soz0.id) { clearInterval(id); setAvto(false); return; }
      const yozdi = Math.min(x.maqsad, x.yozdi + 1);
      const y = { ...x, yozdi }; setDars(y); darsRef.current = y;
      if (yozdi >= x.maqsad) { clearInterval(id); setAvto(false); ayt(qur("daftarOk", soz0)); }
      else ayt(teg(soz0.w[til], til));
    }, ms);
    return () => clearInterval(id);
  }, [avto]); // eslint-disable-line react-hooks/exhaustive-deps

  const ayt = (matn, { sekin = false } = {}, done) => {
    setGapir(true);
    ovoz.oqi(matn, { ...KABU_OVOZ, sekin, tezlik: sinf <= 4 ? "-15%" : "-5%", done: () => { if (!alive.current) return; setGapir(false); done?.(); } });
  };
  const mano = (w, l = iz) => w.w[l] || w.w.uz;
  const qur = (kalit, w, n = "") => {
    const tpl = (GAP[iz] || GAP.uz)[kalit];
    const vars = { w: w ? teg(w.w[til], til) : "", m: w ? teg(mano(w), iz) : "", h: w ? teg(harflab(w.w[til]), til) : "", n: teg(String(n), iz) };
    return tpl.split(/(\{[wmhn]\})/).map((p) => { const m = /^\{([wmhn])\}$/.exec(p); return m ? vars[m[1]] : p.trim() ? teg(p, iz) : p; }).join("");
  };

  // ———— sessiya ————
  const boshla = (faqatTakror = false) => {
    const lg = lugatOl(til);
    setLugat(lg);
    // REV174: ota-ona bergan topshiriq — aynan o'sha so'zlar
    const list = darsSozlari?.length && !faqatTakror ? darsSozlari.map((w) => ({ soz: w, yangi: !lg[w.id] }))
      : topshiriq ? (topshiriq.sozlar || []).map((id) => sozlar[id]).filter(Boolean).map((w) => ({ soz: w, yangi: !lg[w.id] }))
      : sessiya({ bolim: faqatTakror ? null : bolim, sinf, lugat: lg, sozlar, faqatTakror });
    if (!list.length) { setDars({ list: [], i: 0, bosh: true }); setRejim("dars"); return; }
    setRejim("dars");
    sozgaOt({ list, i: 0, jamiYozdi: 0, xatoSoz: 0, boshVaqt: Date.now(), takror: faqatTakror }, 0, lg, true);
  };
  const sozgaOt = (d, i, lg = lugat, birinchi = false) => {
    const item = d.list[i];
    const maqsad = topshiriq ? Math.max(0, Math.min(100, Number(topshiriq.yozish) || 0)) : yozishMaqsadi(sinf, lg[item.soz.id]);
    const bs = bosqichlar(sinf, item.yangi).filter((b) => b !== "daftar" || maqsad > 0);
    const yangi = { ...d, i, bs, b: 0, yozdi: 0, maqsad, kiritish: "", tanlangan: [], javob: null, urinish: 0, xatoBor: false,
      plitka: sozlam.terish && terishMumkin(item.soz.w[til]) ? harfPlitkalar(item.soz.w[til], d.list.map((x) => x.soz.w[til]).filter((x) => x !== item.soz.w[til])) : null,
      variant: manoVariantlari(item.soz, d.list.map((x) => x.soz).concat(Object.values(sozlar).filter((x) => x.id.startsWith(`s${sinf}_`)).slice(0, 30)), Math.random, 3, (x) => mano(x)) };
    setDars(yangi);
    darsRef.current = yangi;
    const kirish = birinchi ? `${qur("bosh", null, d.list.length)} ` : "";
    bosqichniAyt(yangi, kirish);
  };
  const bosqichniAyt = (d, oldin = "") => {
    const w = d.list[d.i].soz;
    const b = d.bs[d.b];
    const matn = b === "tanish" ? qur("tanish", w) : b === "daftar" ? `${d.list[d.i].yangi ? "" : `${qur("eslash", w)} `}${qur("daftar", w, d.maqsad)}`
      : b === "eshit" ? qur("eshit", w) : b === "uzdan" ? qur("uzdan", w) : qur("tildan", w);
    ayt(`${oldin}${matn}`, { sekin: b === "eshit" && sinf <= 2 });
  };
  const keyingiBosqich = () => {
    const d = darsRef.current;
    if (!d) return;
    if (d.bs[d.b] === "daftar" && d.yozdi > 0) setLugat(yozildiQosh(til, d.list[d.i].soz.id, d.yozdi, { bolim: bolim?.id || "", sinf }) && lugatOl(til));
    if (d.b + 1 < d.bs.length) {
      const yangi = { ...d, b: d.b + 1, kiritish: "", tanlangan: [], javob: null, urinish: 0 };
      setMik((m) => (m === "tugma" ? m : ""));
      setDars(yangi); darsRef.current = yangi; bosqichniAyt(yangi);
      return;
    }
    // so'z tugadi — lug'atga yozamiz
    const w = d.list[d.i].soz;
    repBelgila(til, w.id, !d.xatoBor, { bolim: bolim?.id || "", sinf });
    const lg = lugatOl(til); setLugat(lg);
    const jami = { ...d, jamiYozdi: d.jamiYozdi + d.yozdi, xatoSoz: d.xatoSoz + (d.xatoBor ? 1 : 0) };
    if (d.i + 1 < d.list.length) { sozgaOt(jami, d.i + 1, lg); return; }
    const natija = { ...jami, natija: { yulduz: repYulduz(jami.xatoSoz, jami.list.length) } };
    setDars(natija); darsRef.current = natija;
    if (!topshiriq && !d.list.every((x) => !x.yangi)) onNatija?.(natija.natija.yulduz);
    onYakun?.({ sozlar: d.list.map((x) => x.soz.id), jami: d.list.length, togri: d.list.length - jami.xatoSoz, yozdi: jami.jamiYozdi,
      soniya: Math.round((Date.now() - (d.boshVaqt || Date.now())) / 1000), yulduz: natija.natija.yulduz, takror: Boolean(d.takror) });
    ayt(qur("tugadi", null, natija.jamiYozdi));
  };
  const javobBer = (holat, farq = null, qiymat = "") => {
    const d = darsRef.current;
    if (!d || d.javob) return;
    const w = d.list[d.i].soz;
    const ok = holat !== "xato";
    const yangi = { ...d, javob: { holat, farq, qiymat }, urinish: d.urinish + 1, xatoBor: d.xatoBor || !ok };
    setDars(yangi); darsRef.current = yangi;
    if (holat === "togri") ayt(`${qur("togri", w)} ${teg(w.w[til], til)}`);
    else if (holat === "deyarli") ayt(qur("deyarli", w));
    else ayt(qur("xato", w, sozlam.qadam < 5 ? 3 : sozlam.qadam));
  };
  const qaytaUrin = () => {
    const d = darsRef.current;
    const qosh = sozlam.qadam < 5 ? 3 : sozlam.qadam;
    const yangi = { ...d, javob: null, kiritish: "", tanlangan: [], yozdi: d.yozdi + qosh, jamiYozdi: d.jamiYozdi };
    yozildiQosh(til, d.list[d.i].soz.id, qosh, { bolim: bolim?.id || "", sinf });
    setDars(yangi); darsRef.current = yangi; bosqichniAyt(yangi);
  };

  const tingla = () => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    const d = darsRef.current;
    if (!R || !d) { setMik("tugma"); return; }
    const matn = d.list[d.i].soz.w[til];
    ovoz.stop(); setGapir(false);
    let done = false;
    const r = new R(); rec.current = r;
    r.lang = CONTENT_LOCALES[til] || "en-US"; r.interimResults = false; r.maxAlternatives = 5;
    const keldi = (alts) => {
      if (done) return; done = true; rec.current = null;
      if (!alive.current) return;
      setMik("");
      const b = gapBaho(alts, matn, til);
      // REV174: hech narsa eshitilmasa (jim, mikrofon uzildi) — baholanmaydi, yana urinib ko'radi
      if (!alts.length || !alts.some((a) => String(a || "").trim())) { setMik("qayta"); return; }
      javobBer(b.togri ? "togri" : "xato", null, alts[0] || "");
    };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("tugma"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("tugma"); }
  };

  const tarjimaTugmalari = (w) => <div className="rp-tarjima" role="group" aria-label={T("Tarjimani eshit")}>
    <span>🔈 {T("Tarjimani eshit")}:</span>
    {["uz", "ru", "en"].filter((l) => l !== til && w.w[l]).map((l) => <button key={l} type="button" className="rp-chip" onClick={() => ayt(teg(w.w[l], l))}>{l.toUpperCase()}</button>)}
  </div>;

  const ustozBlok = (doska) => <div className="rp-ustoz">
    <KabuXonacha doska={doska} gapir={gapir} onTap={() => dars && !dars.natija && dars.list?.length && bosqichniAyt(dars)} />
  </div>;

  // ———— lug'at ————
  if (rejim === "lugat") {
    const bugun = kunRaqami();
    const royxat = lugatRoyxati(lugat, sozlar, bugun);
    const kelgan = muddatiKelgan(lugat, bugun).filter((id) => sozlar[id]).length;
    return <div className="rp-root">
      <div className="mk-bar">
        <button type="button" className="mk-back" onClick={() => { ovoz.stop(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
        <div className="mk-head"><b className="mk-title">📒 {T("Mening lug‘atim")}</b><small>{royxat.length} {T("ta so‘z")} · {royxat.filter((x) => x.puxta).length} {T("ta puxta")}</small></div>
      </div>
      <button type="button" className="mk-btn is-main rp-big" disabled={!kelgan} onClick={() => boshla(true)}>
        🔁 {T("Bugungi takror")} {kelgan ? `(${kelgan})` : `— ${T("hammasi takrorlangan")} ✅`}
      </button>
      {!royxat.length && <p className="mk-hint">{T("Lug‘at hali bo‘sh. Bo‘limni oching va «Repetitor» bilan so‘zlarni o‘rganing — ular shu yerga tushadi.")}</p>}
      <ul className="rp-lugat">
        {royxat.map(({ soz: w, h, muddat, puxta, qoldi }) => <li key={w.id} className={`${muddat ? "is-due" : ""} ${puxta ? "is-puxta" : ""}`}>
          <Rasm w={w} className="mk-pic is-small" />
          <span className="rp-l-txt"><b dir="auto">{w.w[til]}</b><small dir="auto">{mano(w)}</small></span>
          <span className="rp-l-meta">
            <span className="rp-quti" aria-label={`${T("Daraja")} ${h.quti}/${REP_ORALIQ.length - 1}`}>{REP_ORALIQ.slice(1).map((_, k) => <i key={k} className={k < h.quti ? "is-on" : ""} />)}</span>
            <small>✍ {Math.min(h.yozildi || 0, YOZISH_CHEGARA)}/{YOZISH_CHEGARA} · {muddat ? T("Bugun takror") : `${qoldi} ${T("kundan keyin")}`}</small>
          </span>
          <button type="button" className="mk-say" onClick={() => ayt(teg(w.w[til], til))} aria-label={T("Tinglash")}>🔊</button>
        </li>)}
      </ul>
    </div>;
  }

  // ———— dars ————
  const bar = <div className="mk-bar">
    <button type="button" className="mk-back" onClick={() => { ovoz.stop(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
    <div className="mk-head"><b className="mk-title">{darsSozlari?.length ? `🤖 ${T("Repetitor")}${sarlavha ? ` · ${sarlavha}` : ""}` : topshiriq ? `📬 ${T("Ota-onangizdan topshiriq")}` : <>🤖 {T("Repetitor")}{bolim && boshRejim === "dars" ? ` · ${bolim.emoji} ${bolim.nom[iz]}` : ""}</>}</b>
      <small>🤖 Kabu</small></div>
    {/* dars davomida lug'atga o'tilsa dars yo'qolardi — faqat dars boshlanmaganda yoki tugaganda */}
    {(!dars || dars.natija || dars.bosh) && !topshiriq && <button type="button" className="mk-btn" onClick={() => { ovoz.stop(); setRejim("lugat"); setLugat(lugatOl(til)); }}>📒 {T("Lug‘atim")}</button>}
  </div>;

  if (!dars && darsSozlari?.length) {
    return <div className="rp-root">{bar}
      {ustozBlok(darsSozlari[0].w[til])}
      <div className="rp-card rp-start">
        <p>{T("Darsdagi yangi so‘zlarni Kabu bilan mustahkamlaymiz: harflab aytamiz, daftarga ko‘p marta yozamiz, eshitib yozamiz va tarjima qilamiz.")}</p>
        <div className="rp-sozlar" dir="auto">{darsSozlari.map((w) => <span key={w.id}>{w.emoji} {w.w[til]} — {mano(w)}</span>)}</div>
        <button type="button" className="mk-btn is-main rp-big" onClick={() => boshla(false)}>▶ {T("Repetitorni boshlash")}</button>
      </div>
    </div>;
  }

  if (!dars && topshiriq) {
    const ws = (topshiriq.sozlar || []).map((id) => sozlar[id]).filter(Boolean);
    return <div className="rp-root">{bar}
      {ustozBlok("📬")}
      <div className="rp-card rp-start">
        {topshiriq.izoh && <p className="rp-izoh">💬 «{topshiriq.izoh}»</p>}
        <ul className="rp-plan">
          <li>📚 {T("So‘zlar")}: <b>{ws.length}</b></li>
          {topshiriq.yozish > 0 && <li>📓 {T("Har birini daftarga")} <b>{topshiriq.yozish}</b> {T("marta yozing")}</li>}
          {topshiriq.muddat && <li>📅 {T("Muddat")}: <b>{topshiriq.muddat.split("-").reverse().join(".")}</b></li>}
        </ul>
        <div className="rp-sozlar" dir="auto">{ws.map((w) => <span key={w.id}>{w.w[til]}</span>)}</div>
        <button type="button" className="mk-btn is-main rp-big" disabled={!ws.length} onClick={() => boshla(false)}>▶ {T("Topshiriqni boshlash")}</button>
      </div>
    </div>;
  }

  if (!dars) {
    const kelgan = muddatiKelgan(lugat).filter((id) => sozlar[id]).length;
    return <div className="rp-root">{bar}
      {ustozBlok(bolim ? bolim.sozlar[0]?.w[til] || "" : "📒")}
      <div className="rp-card rp-start">
        <p>{T("Kabu so‘zni aytadi, harflab aytadi va doskada ko‘rsatadi. Keyin daftaringizga ko‘p marta yozasiz, eshitib yozasiz va tarjima qilasiz.")}</p>
        <ul className="rp-plan">
          <li>📓 {T("Daftarga yozish")}: <b>{sozlam.yozish}</b> {T("marta (takrorlarda jami 100 tagacha)")}</li>
          <li>🆕 {T("Yangi so‘zlar")}: <b>{bolim ? Math.min(sozlam.yangi, bolim.sozlar.filter((w) => !lugat[w.id]).length) : 0}</b> · 🔁 {T("Takror")}: <b>{Math.min(kelgan, sozlam.takror)}</b></li>
        </ul>
        <div className="mk-row">
          {bolim && boshRejim === "dars" && <button type="button" className="mk-btn is-main rp-big" onClick={() => boshla(false)}>▶ {T("Darsni boshlash")}</button>}
          <button type="button" className="mk-btn rp-big" disabled={!kelgan} onClick={() => boshla(true)}>🔁 {T("Bugungi takror")}{kelgan ? ` (${kelgan})` : ""}</button>
        </div>
      </div>
    </div>;
  }

  if (dars.bosh) {
    return <div className="rp-root">{bar}<div className="rp-card rp-done" role="status"><span aria-hidden="true">✅</span>
      <b>{T("Bugun takrorlanadigan so‘z qolmadi!")}</b>
      <button type="button" className="mk-btn is-main" onClick={() => setRejim("lugat")}>📒 {T("Lug‘atim")}</button></div></div>;
  }

  if (dars.natija) {
    const y = dars.natija.yulduz;
    return <div className="rp-root">{bar}
      {ustozBlok("⭐".repeat(y) || "💪")}
      <div className="rp-card rp-done" role="status">
        <span aria-hidden="true">{y === 3 ? "🏆" : y ? "🎉" : "💪"}</span>
        <b>{"⭐".repeat(y) || "☆"}</b>
        <small>{T("So‘zlar")}: {dars.list.length} · ✍ {T("Daftarga yozildi")}: {dars.jamiYozdi} · ❌ {dars.xatoSoz}</small>
        <div className="mk-row">
          <button type="button" className="mk-btn is-main" onClick={() => setRejim("lugat")}>📒 {T("Lug‘atim")}</button>
          {topshiriq ? <button type="button" className="mk-btn" onClick={() => { ovoz.stop(); onClose?.(); }}>✅ {T("Tayyor")}</button>
            : <button type="button" className="mk-btn" onClick={() => setDars(null)}>🔁 {T("Yana")}</button>}
        </div>
      </div>
    </div>;
  }

  const item = dars.list[dars.i];
  const w = item.soz;
  const soz = w.w[til];
  const b = dars.bs[dars.b];
  const j = dars.javob;
  // juda boshqacha yozilgan bo'lsa — harfma-harf farq chalkashtiradi, faqat to'g'ri javob ko'rsatiladi
  // arab yozuvida harflar bir-biriga ulanadi — harfma-harf farq ko'rsatilmaydi (alohida harflar noto'g'ri shaklda chiqadi)
  const tekshirYoz = (matn) => { if (!alive.current) return; const r = tekshir(matn, soz, til); javobBer(r.holat, r.oxshash >= 0.5 && til !== "ar" ? r.farq : null, matn); };
  // plitkalar faqat harflardan iborat (bo'shliq, chiziqcha yo'q) — to'g'ri terilgan so'z harflar bo'yicha tekshiriladi
  const tekshirPlitka = (chars) => {
    if (!alive.current) return;
    if (harfTogri(chars, soz)) { javobBer("togri", null, chars.join("")); return; }
    const r = tekshir(chars.join(""), harflar(soz).join(""), til);
    javobBer(r.holat === "togri" ? "deyarli" : r.holat, r.oxshash >= 0.5 && til !== "ar" ? r.farq : null, chars.join(""));
  };
  const plitkaBos = (t) => {
    const d = darsRef.current;
    if (!d || d.javob || d.tanlangan.some((x) => x.k === t.k)) return;
    const tanlangan = [...d.tanlangan, t];
    const yangi = { ...d, tanlangan };
    setDars(yangi); darsRef.current = yangi;
    if (tanlangan.length >= harflar(soz).length) setTimeout(() => tekshirPlitka(tanlangan.map((x) => x.c)), 150);
  };
  const yozuvMaydoni = () => (sozlam.terish && dars.plitka ? <>
    <div className="mk-slots" dir="auto">{dars.tanlangan.length ? dars.tanlangan.map((t, k) => <button key={k} type="button" className="mk-tile is-in" disabled={Boolean(j)}
      onClick={() => setDars((o) => ({ ...o, tanlangan: o.tanlangan.filter((_, z) => z !== k) }))}>{t.c}</button>) : <span className="mk-ph">{T("Harflarni tartib bilan bosing")}</span>}</div>
    {!j && <div className="mk-tiles" dir="auto">{dars.plitka.map((t) => <button key={t.k} type="button" className="mk-tile" disabled={dars.tanlangan.some((x) => x.k === t.k)} onClick={() => plitkaBos(t)}>{t.c}</button>)}
      <button type="button" className="mk-tile is-clear" onClick={() => setDars((o) => ({ ...o, tanlangan: [] }))} aria-label={T("Tozalash")}>⌫</button></div>}
  </> : <>
    <input className="mk-input rp-input" dir="auto" lang={til} value={dars.kiritish} disabled={Boolean(j)} autoCapitalize="off" autoComplete="off" spellCheck={false}
      placeholder={T("Shu yerga yozing…")} onChange={(e) => setDars((o) => ({ ...o, kiritish: e.target.value }))}
      onKeyDown={(e) => { if (e.key === "Enter" && dars.kiritish.trim() && !j) tekshirYoz(dars.kiritish); }} />
    {!j && <button type="button" className="mk-btn is-main" disabled={!dars.kiritish.trim()} onClick={() => tekshirYoz(dars.kiritish)}>✔ {T("Tekshirish")}</button>}
  </>);

  return <div className="rp-root">{bar}
    <div className="rp-progress" aria-label={`${dars.i + 1}/${dars.list.length}`}>
      {dars.list.map((x, k) => <i key={x.soz.id} className={`${k < dars.i ? "is-done" : ""} ${k === dars.i ? "is-on" : ""} ${x.yangi ? "" : "is-takror"}`} />)}
    </div>
    <div className="rp-steps" role="list">{dars.bs.map((s, k) => <span key={s} role="listitem" className={`rp-step ${k < dars.b ? "is-done" : ""} ${k === dars.b ? "is-on" : ""}`}>
      <i aria-hidden="true">{BOSQICH[s][0]}</i><span>{T(BOSQICH[s][1])}</span></span>)}</div>
    {ustozBlok(b === "uzdan" || b === "eshit" ? "❓" : soz)}

    <div className="rp-card">
      {!item.yangi && <span className="rp-tag">🔁 {T("Takror")}</span>}

      {b === "tanish" && <>
        <div className="rp-word"><Rasm w={w} className="mk-pic" /><b dir="auto" lang={til}>{soz}</b><small dir="auto">{mano(w)}</small></div>
        <div className={`rp-letters ${til === "ar" ? "is-butun" : ""}`} dir="auto" lang={til} aria-label={harflab(soz)}>{til === "ar" ? <span>{soz}</span> : [...String(soz)].filter((c) => /[\p{L}\p{N}\s]/u.test(c)).map((c, k) => (/\s/.test(c) ? <i key={k} className="rp-gap" /> : <span key={k} style={{ animationDelay: `${0.2 * k}s` }}>{c}</span>))}</div>
        <div className="mk-row">
          <button type="button" className="mk-btn" onClick={() => ayt(teg(soz, til))}>🔊 {T("Tinglash")}</button>
          <button type="button" className="mk-btn" onClick={() => ayt(teg(soz, til), { sekin: true })}>🐢 {T("Sekin")}</button>
          <button type="button" className="mk-btn" onClick={() => ayt(qur("harf", w))}>🔤 {T("Harflab")}</button>
        </div>
        {tarjimaTugmalari(w)}
        <button type="button" className="mk-btn is-main rp-big" onClick={keyingiBosqich}>➡ {T("Daftarga yozamiz")}</button>
      </>}

      {b === "daftar" && <>
        <p className="rp-say">📓 {T("Daftaringizni oling!")} <b>{dars.maqsad}</b> {T("marta yozing va har safar ovoz chiqarib ayting.")}</p>
        <div className="rp-daftar" aria-hidden="true">
          <div className="rp-namuna" dir="auto" lang={til}>{soz}</div>
          <div className="rp-qatorlar">{Array.from({ length: Math.min(10, Math.ceil(dars.maqsad / Math.max(1, sozlam.qadam))) }, (_, k) =>
            <span key={k} className={(k + 1) * sozlam.qadam <= dars.yozdi ? "is-on" : ""} dir="auto" lang={til}>{(k + 1) * sozlam.qadam <= dars.yozdi ? soz : ""}</span>)}</div>
        </div>
        <div className="rp-hisob"><i style={{ "--p": `${Math.min(100, (dars.yozdi / Math.max(1, dars.maqsad)) * 100)}%` }} /><b>✍ {dars.yozdi} / {dars.maqsad}</b></div>
        <div className="mk-row">
          <button type="button" className="mk-btn" onClick={() => ayt(teg(soz, til))}>🔊 {T("Tinglash")}</button>
          {dars.yozdi < dars.maqsad && <button type="button" className={`mk-btn rp-big ${avto ? "" : "is-main"}`} onClick={() => setAvto((a) => !a)}>
            {avto ? `⏸ ${T("To‘xtatish")}` : `▶ ${T("Kabu bilan yozamiz")} (${yozishSoniyasi(soz)} ${T("soniyadan")})`}</button>}
          {dars.yozdi < dars.maqsad
            ? !avto && <button type="button" className="mk-btn rp-big" onClick={() => {
              const d = darsRef.current; const yozdi = Math.min(d.maqsad, d.yozdi + sozlam.qadam);
              const yangi = { ...d, yozdi }; setDars(yangi); darsRef.current = yangi;
              if (yozdi >= d.maqsad) ayt(qur("daftarOk", w)); else if (yozdi % (sozlam.qadam * 2) === 0 || sozlam.qadam === 1) ayt(teg(soz, til));
            }}>✍ {T("Yozdim")} +{sozlam.qadam}</button>
            : <button type="button" className="mk-btn is-main rp-big" onClick={keyingiBosqich}>➡ {T("Tekshiramiz")}</button>}
        </div>
        {tarjimaTugmalari(w)}
      </>}

      {b === "eshit" && <>
        <p className="rp-say">🎧 {T("Eshiting va yozing")}</p>
        <div className="mk-row">
          <button type="button" className="mk-btn" onClick={() => ayt(teg(soz, til))}>🔊 {T("Yana eshitish")}</button>
          <button type="button" className="mk-btn" onClick={() => ayt(teg(soz, til), { sekin: true })}>🐢 {T("Sekin")}</button>
        </div>
        {yozuvMaydoni()}
      </>}

      {b === "uzdan" && <>
        <div className="rp-word"><Rasm w={w} className="mk-pic is-small" /><b dir="auto">{mano(w)}</b><small>{T("Chet tilida qanday bo‘ladi?")}</small></div>
        <div className="mk-row">
          <button type="button" className="mk-btn" onClick={() => ayt(teg(mano(w), iz))}>🔊 {T("Tinglash")}</button>
          {!j && mikBor && mik !== "tugma" && <button type="button" className={`mk-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} onClick={tingla} disabled={mik === "tinglayapti"}>
            🎤 {mik === "tinglayapti" ? T("Gapiring…") : T("Aytaman")}</button>}
        </div>
        {mik === "qayta" && !j && <small className="rp-mik-qayta" role="status">🎤 {T("Ovoz eshitilmadi — yana bosib, balandroq ayting yoki yozing.")}</small>}
        {yozuvMaydoni()}
      </>}

      {b === "tildan" && <>
        <div className="rp-word"><b dir="auto" lang={til}>{soz}</b><button type="button" className="mk-say" onClick={() => ayt(teg(soz, til))}>🔊</button></div>
        <div className="mk-options">{dars.variant.map((x) => <button key={x.id} type="button" disabled={Boolean(j)} dir="auto"
          className={`mk-opt is-text ${j && x.id === w.id ? "is-right" : ""} ${j && j.qiymat === x.id && x.id !== w.id ? "is-wrong" : ""}`}
          onClick={() => javobBer(x.id === w.id ? "togri" : "xato", null, x.id)}>{mano(x)}</button>)}</div>
      </>}

      {j && <div className={`mk-result ${j.holat !== "xato" ? "is-right" : "is-wrong"}`} role="status">
        <b>{j.holat === "togri" ? `✅ ${T("To‘g‘ri!")}` : j.holat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri — belgilarni tekshiring")}` : `❌ ${T("To‘g‘ri javob")}:`}</b>
        {j.farq && j.holat !== "togri" && <span className="rp-farq" dir="auto" lang={til} aria-label={soz}>{j.farq.map((f, k) => <span key={k} className={`is-${f.h}`}>{f.c}</span>)}</span>}
        <span className="mk-answer" dir="auto">{soz}<small dir="auto">{mano(w)}</small></span>
        {j.qiymat && b === "uzdan" && !j.farq && <small>🎤 {j.qiymat}</small>}
        <div className="mk-row">
          {j.holat === "xato" && dars.urinish < 2 && b !== "tildan" && <button type="button" className="mk-btn" onClick={qaytaUrin}>
            ✍ {T("Daftarga yana yozdim — qayta urinaman")} (+{sozlam.qadam < 5 ? 3 : sozlam.qadam})</button>}
          <button type="button" className="mk-btn is-main" onClick={keyingiBosqich}>➡ {T("Keyingisi")}</button>
        </div>
      </div>}
    </div>
  </div>;
}
