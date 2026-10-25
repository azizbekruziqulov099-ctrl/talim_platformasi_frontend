import React, { useEffect, useMemo, useRef, useState } from "react";
import KabuXonacha from "../kid/KabuXonacha.jsx";
import { ovozManbai, KABU_OVOZ } from "../kid/ovozOqi.js";
import { tekshir } from "../maktab/repetitorRules.js";
import { gapBaho } from "../til/mashqRules.js";
import { CONTENT_LOCALES } from "../speech/language.js";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { mashqMateriali, mashqYulduz } from "./maktabMashqRules.js";
import "./maktabMashqlar.css";

const BOSQICH = {
  oqish: ["📖", "O‘qish"], gapirish: ["🗣️", "Gapirish"], diktant: ["✍️", "Diktant"], oqibBer: ["🎤", "Yozganingni o‘qi"], yakun: ["🏁", "Natija"],
};
const IZOH = {
  oqish: "Gapni o‘qing: avval Kabuni tinglang, keyin mikrofonga ovoz chiqarib o‘qing.",
  gapirish: "Kabuning savoliga o‘sha tilda javob bering (kamida 3–4 so‘z).",
  diktant: "Kabu aytadi — siz yozasiz. Kerak bo‘lsa, sekinroq tinglang.",
  oqibBer: "Endi diktantda yozganlaringizni ovoz chiqarib o‘qib bering.",
};
const teg = (t, til) => `[${til}]${t}[/${til}]`;

/**
 * REV175: maktab til darsidan keyingi mashqlar — zamonaviy darsdagidek to'liq tsikl:
 * 📖 o'qish (talaffuz tekshiriladi) → 🗣️ gapirish (savolga javob) → ✍️ diktant (harfma-harf tekshiruv) → 🎤 yozganini o'qib berish → 🏁 natija,
 * keyin test va repetitor. Jonli ustoz (o'sha tilning o'qituvchisi) aytadi va baholaydi.
 */
export default function MaktabMashqlar({ apiBase = "", til = "en", iz = "uz", ustoz = "emily", steps = [], sozlar = [], mavzu = "", onTest, onRepetitor, onYakun, onClose }) {
  const mat = useMemo(() => mashqMateriali(steps, sozlar), [steps, sozlar]);
  const bosqichlar = useMemo(() => ["oqish", "gapirish", "diktant", "oqibBer"].filter((b) => (b === "oqibBer" ? mat.diktant.length : mat[b]?.length)), [mat]);
  const [b, setB] = useState(0);
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);     // {holat, matn, farq}
  const [kiritish, setKiritish] = useState("");
  const [mik, setMik] = useState("");
  const [gapir, setGapir] = useState(false);
  const [ball, setBall] = useState({});           // bosqich → {togri, jami}
  const [yozganlari, setYozganlari] = useState([]);
  const ovoz = useMemo(() => ovozManbai(apiBase), [apiBase]);
  const [quvon, setQuvon] = useState(0);   // REV177: to'g'ri javobda Kabu sakraydi
  const alive = useRef(true);
  const rec = useRef(null);
  const mikBor = Boolean(globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition);
  useEffect(() => { alive.current = true; return () => { alive.current = false; ovoz.stop(); try { rec.current?.abort(); } catch { /* */ } }; }, [ovoz]);

  const izt = (m) => (iz === "uz" ? m : teg(m, iz));   // izoh (maqtov, ko'rsatma) — interfeys tilida
  const ayt = (m, sekin = false, done) => { setGapir(true); ovoz.oqi(m, { ...KABU_OVOZ, sekin, tezlik: "-5%", done: () => { if (alive.current) { setGapir(false); done?.(); } } }); };
  const bosqich = bosqichlar[b] || "yakun";
  const royxat = bosqich === "oqish" ? mat.oqish : bosqich === "gapirish" ? mat.gapirish : bosqich === "diktant" ? mat.diktant : bosqich === "oqibBer" ? mat.diktant : [];
  const joriy = royxat[i];
  const matnOf = (x) => (typeof x === "string" ? x : x?.matn || "");

  // har yangi topshiriqda ustoz o'zi aytadi (diktantda — sekinroq)
  useEffect(() => {
    if (!joriy || bosqich === "yakun") return;
    if (bosqich === "oqish" || bosqich === "gapirish") ayt(teg(matnOf(joriy), til));
    else if (bosqich === "diktant") ayt(teg(matnOf(joriy), til), true);
  }, [b, i]); // eslint-disable-line react-hooks/exhaustive-deps

  const hisob = (togri) => { if (togri) setQuvon((q) => q + 1); return setBall((x) => { const y = x[bosqich] || { togri: 0, jami: 0 }; return { ...x, [bosqich]: { togri: y.togri + (togri ? 1 : 0), jami: y.jami + 1 } }; }); };
  const keyingi = () => {
    setJavob(null); setKiritish(""); setMik("");
    if (i + 1 < royxat.length) { setI(i + 1); return; }
    setI(0);
    if (b + 1 < bosqichlar.length) { setB(b + 1); return; }
    setB(bosqichlar.length);   // yakun
    const jami = Object.values({ ...ball }).reduce((s, x) => ({ togri: s.togri + x.togri, jami: s.jami + x.jami }), { togri: 0, jami: 0 });
    onYakun?.(jami);
  };

  const tingla = () => {
    const R = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!R || !joriy) { setMik("yoq"); return; }
    const kutilgan = bosqich === "oqibBer" ? matnOf(joriy) : matnOf(joriy);
    ovoz.stop(); setGapir(false);
    let done = false;
    const r = new R(); rec.current = r;
    r.lang = CONTENT_LOCALES[til] || "en-US"; r.interimResults = false; r.maxAlternatives = 5;
    const keldi = (alts) => {
      if (done) return; done = true; rec.current = null;
      if (!alive.current) return;
      setMik("");
      if (!alts.some((a) => String(a || "").trim())) { setMik("qayta"); return; }   // eshitilmadi — baholanmaydi
      if (bosqich === "gapirish") {
        const soz = String(alts[0]).trim().split(/\s+/).length;
        const ok = soz >= 3;
        setJavob({ holat: ok ? "togri" : "qisqa", matn: alts[0] });
        hisob(ok);
        ayt(izt(ok ? T("Zo‘r javob!") : T("Yana to‘liqroq javob bering — kamida 3–4 so‘z.")));
        return;
      }
      const g = gapBaho(alts, kutilgan, til);
      setJavob({ holat: g.togri ? "togri" : "xato", matn: alts[0], yulduz: g.stars });
      hisob(g.togri);
      ayt(g.togri ? izt(T("Ajoyib talaffuz!")) : `${izt(T("Yana bir bor tinglang va takrorlang"))} ${teg(kutilgan, til)}`);
    };
    r.onresult = (e) => keldi(Array.from(e.results?.[0] || []).map((a) => a.transcript));
    r.onerror = (e) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { done = true; setMik("yoq"); } else if (e?.error !== "aborted") keldi([]); };
    r.onend = () => keldi([]);
    try { r.start(); setMik("tinglayapti"); } catch { setMik("yoq"); }
  };
  const diktantTekshir = () => {
    const r = tekshir(kiritish, matnOf(joriy), til);
    setJavob({ holat: r.holat, farq: r.oxshash >= 0.5 && til !== "ar" ? r.farq : null, matn: kiritish });
    setYozganlari((y) => [...y, { matn: matnOf(joriy), yozgan: kiritish, holat: r.holat }]);
    hisob(r.holat !== "xato");
    ayt(r.holat === "togri" ? izt(T("To‘g‘ri yozdingiz!")) : r.holat === "deyarli" ? izt(T("Deyarli to‘g‘ri — belgilarga qarang.")) : `${izt(T("To‘g‘risi"))} ${teg(matnOf(joriy), til)}`);
  };

  const jamiBall = Object.values(ball).reduce((s, x) => ({ togri: s.togri + x.togri, jami: s.jami + x.jami }), { togri: 0, jami: 0 });

  return <div className="mm-root">
    <div className="mm-bar">
      <button type="button" className="mm-back" onClick={() => { ovoz.stop(); onClose?.(); }} aria-label={T("Orqaga")}>⬅️</button>
      <div className="mm-head"><b>🏋️ {T("Dars mashqlari")}</b><small>{mavzu}</small></div>
    </div>
    <ol className="mm-steps">{[...bosqichlar, "yakun"].map((x, k) => <li key={x} className={`${k < b ? "is-done" : ""} ${k === b ? "is-on" : ""}`}>
      <span aria-hidden="true">{k < b ? "✅" : BOSQICH[x][0]}</span><small>{T(BOSQICH[x][1])}</small></li>)}</ol>
    <div className="mm-ustoz"><KabuXonacha celebrate={quvon} mood={javob?.holat === "togri" ? "happy" : javob ? "enc" : ""} doska={bosqich === "diktant" && !javob ? "✍️ …" : bosqich === "yakun" ? "🏁" : matnOf(joriy).slice(0, 60)} gapir={gapir} /></div>

    {bosqich === "yakun" ? <div className="mm-card mm-yakun" role="status">
      <span className="mm-katta" aria-hidden="true">{mashqYulduz(jamiBall.togri, jamiBall.jami) === 3 ? "🏆" : "💪"}</span>
      <b>{"⭐".repeat(mashqYulduz(jamiBall.togri, jamiBall.jami)) || "☆"}</b>
      <ul className="mm-natija">{bosqichlar.map((x) => <li key={x}><span>{BOSQICH[x][0]} {T(BOSQICH[x][1])}</span><b>{ball[x]?.togri || 0} / {ball[x]?.jami || 0}</b></li>)}</ul>
      <div className="mm-row">
        {onTest && <button type="button" className="mm-btn is-main" onClick={onTest}>📝 {T("Testni ishlash")}</button>}
        {onRepetitor && <button type="button" className="mm-btn" onClick={onRepetitor}>🤖 {T("Repetitor: yangi so‘zlar")}</button>}
        <button type="button" className="mm-btn" onClick={() => { setB(0); setI(0); setBall({}); setYozganlari([]); }}>🔁 {T("Qaytadan")}</button>
      </div>
    </div> : <div className="mm-card">
      <p className="mm-izoh">{T(IZOH[bosqich])}</p>
      <span className="mm-qadam">{i + 1} / {royxat.length}</span>

      {(bosqich === "oqish" || bosqich === "gapirish" || bosqich === "oqibBer") && <p className="mm-matn" dir="auto" lang={til}>
        {bosqich === "oqibBer" ? <>{matnOf(joriy)}{yozganlari[i] && yozganlari[i].yozgan !== matnOf(joriy) && <small>✍️ {T("Siz yozgansiz")}: {yozganlari[i].yozgan}</small>}</> : matnOf(joriy)}</p>}
      {bosqich === "diktant" && <>
        <input className="mm-input" dir="auto" lang={til} value={kiritish} disabled={Boolean(javob)} autoCapitalize="off" autoComplete="off" spellCheck={false}
          placeholder={T("Eshitganingizni yozing…")} onChange={(e) => setKiritish(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && kiritish.trim() && !javob) diktantTekshir(); }} />
        {!javob && <button type="button" className="mm-btn is-main" disabled={!kiritish.trim()} onClick={diktantTekshir}>✔ {T("Tekshirish")}</button>}
      </>}

      <div className="mm-row">
        <button type="button" className="mm-btn" onClick={() => ayt(teg(matnOf(joriy), til))}>🔊 {T("Tinglash")}</button>
        <button type="button" className="mm-btn" onClick={() => ayt(teg(matnOf(joriy), til), true)}>🐢 {T("Sekin")}</button>
        {bosqich !== "diktant" && !javob && mikBor && mik !== "yoq" && <button type="button" className={`mm-btn is-mic ${mik === "tinglayapti" ? "is-on" : ""}`} disabled={mik === "tinglayapti"} onClick={tingla}>
          🎤 {mik === "tinglayapti" ? T("Gapiring…") : bosqich === "gapirish" ? T("Javob beraman") : T("O‘qib beraman")}</button>}
      </div>
      {mik === "qayta" && !javob && <small className="mm-ogoh" role="status">🎤 {T("Ovoz eshitilmadi — yana bosib, balandroq ayting.")}</small>}
      {(!mikBor || mik === "yoq") && bosqich !== "diktant" && !javob && <small className="mm-ogoh">{T("Mikrofon ishlamayapti — ovoz chiqarib ayting va «Keyingisi»ni bosing (baholanmaydi).")}</small>}

      {javob && <div className={`mm-javob is-${javob.holat}`} role="status">
        <b>{javob.holat === "togri" ? `✅ ${T("To‘g‘ri!")}` : javob.holat === "deyarli" ? `🟡 ${T("Deyarli to‘g‘ri")}` : javob.holat === "qisqa" ? `🟡 ${T("Javob qisqa")}` : `❌ ${T("Yana urinib ko‘ring")}`}</b>
        {javob.farq && javob.holat !== "togri" && <span className="mm-farq" dir="auto" lang={til}>{javob.farq.map((f, k) => <span key={k} className={`is-${f.h}`}>{f.c}</span>)}</span>}
        {bosqich !== "gapirish" && javob.holat !== "togri" && <span className="mm-togrisi" dir="auto" lang={til}>{matnOf(joriy)}{joriy?.tarjima ? <small> — {joriy.tarjima}</small> : null}</span>}
        {javob.matn && bosqich !== "diktant" && <small>🎤 «{javob.matn}»</small>}
      </div>}
      {(javob || (bosqich !== "diktant" && (!mikBor || mik === "yoq"))) && <button type="button" className="mm-btn is-main mm-keyingi" onClick={keyingi}>➡ {T("Keyingisi")}</button>}
      {!javob && bosqich !== "diktant" && mikBor && mik !== "yoq" && <button type="button" className="mm-link" onClick={keyingi}>{T("O‘tkazib yuborish")}</button>}
    </div>}
  </div>;
}
