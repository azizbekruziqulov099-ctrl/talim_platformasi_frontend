import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HarakatSahna from "../harakat/HarakatSahna.jsx";
import { RASMLAR } from "../xonalar/rasmlar.js";
import { teg, gap } from "../xonalar/xonaRules.js";
import { izohTeg } from "../izohTil.js";
import { tingla } from "../../lesson/sozAytish.js";
import { GAPIR_RAUND, gapirDaraja, gapirBaho, gapirIzohMatn, gapirYulduz, iboraEmoji, iboraManosi, iboraMatn } from "./gapirRules.js";
import { chime, soft } from "../kidSounds.js";
import { uiText as T } from "../../interface/interfaceRuntime.js";
import { Tamom } from "./JonliOyin.jsx";
import { JR, kabuRasm } from "./jonliRasm.js";
import "./jonli.css";
import { B } from "../Belgi.jsx";
import { SAHNA_RASM } from "./sahnaHarakatRasm.js";

/** REV154: rassom chizgan «oldin → keyin» sahna: to'g'ri aytilsa sahna o'zgaradi, so'ng keyingi ibora. */
function SahnaFoto({ rasm, bajar, onDemo }) {
  const r = SAHNA_RASM[rasm];
  useEffect(() => { if (!bajar) return undefined; const t = setTimeout(() => onDemo?.(), 2200); return () => clearTimeout(t); }, [bajar]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return null;
  return <div className={`ga-foto ${bajar ? "is-keyin" : ""}`}>
    <img className="ga-foto-oldin" src={r.oldin} alt="" draggable="false" />
    <img className="ga-foto-keyin" src={r.keyin} alt="" draggable="false" />
  </div>;
}

const IZOH = ["uz", "ru", "en"];
/** Iboraning chizilgan rasmi: narsa — o'zi, sinf/tana buyrug'i — rassom chizgan harakat yoki a'zo rasmi (emoji emas). */
const rasmId = (ib) => (ib?.tur === "narsa" ? ib.id : ib?.tur === "buyruq" ? String(ib.id).replace(/^men_/, "") : null);
// ustoz gapi davomiyligi (taxminiy) — ovoz tugaganini bildirmasa ham mikrofon ustoz gapi ustiga ochilmasin
const gapVaqti = (s) => Math.min(11000, 1600 + String(s || "").replace(/\[\/?\w+\]/g, "").length * 75);
let mikYoqXotira = false;   // bu sahifada mikrofon yo'qligi bir marta aniqlansa — qayta so'ralmaydi

/**
 * REV148: «Ayt — bo'ladi!» bosqichi. Ustoz izoh tilida tushuntiradi va o'rganilayotgan tilda iborani aytadi, bola
 * takrorlaydi (mikrofon). To'g'ri bo'lsa — sahnada o'sha narsa bo'ladi (eshik yopiladi, chiroq yonadi, olma jonlanadi).
 * 2 urinish; ikkalasi ham chiqmasa ustoz to'g'risini aytadi va ko'rsatadi (xato hisoblanadi). Mikrofon bo'lmasa —
 * «Aytdim» tugmasi (ota-ona yonida tasdiqlaydi). onYakun(yulduz) — bosqich tugaganda.
 */
export default function GapirOyin({ n, til = "en", izoh = "uz", ayt, onYakun, onChiq }) {
  const d = useMemo(() => gapirDaraja(n, (id) => Boolean(RASMLAR[id])), [n]);
  const lang = IZOH.includes(izoh) ? izoh : "uz";
  const [raund, setRaund] = useState(0);
  const [faza, setFaza] = useState("ustoz");   // ustoz | gapir | aytdim | bajar | tamom
  const [urinish, setUrinish] = useState(0);
  const [xato, setXato] = useState(0);
  const [eshitildi, setEshitildi] = useState("");
  const [mikYoq, setMikYoq] = useState(mikYoqXotira);
  const [yigildi, setYigildi] = useState([]);
  const [tamom, setTamom] = useState(null);
  const alive = useRef(true);
  const token = useRef(0);
  const mik = useRef(null);
  const xatoRef = useRef(0);
  const mikYoqRef = useRef(mikYoqXotira);
  const holat = useRef({ raund: 0, urinish: 0 });
  holat.current = { raund, urinish };
  const ib = d.iboralar[raund];
  const matn = iboraMatn(ib, til);
  const manosi = iboraManosi(ib, lang);

  const say = useCallback((text, done) => (ayt ? ayt(text, done) : done?.()), [ayt]);
  const mikTox = () => { try { mik.current?.stop(); } catch { /* */ } mik.current = null; };
  useEffect(() => { alive.current = true; return () => { alive.current = false; token.current += 1; mikTox(); }; }, []);
  /** Ovoz tugagach (yoki zaxira vaqtdan keyin) — bir marta. Eski raund/urinishdan kelgan chaqiriq e'tiborsiz. */
  const keyin = (text, fn, ms = gapVaqti(text)) => {
    const t = token.current;
    let bir = false;
    const ishla = () => { if (bir || !alive.current || t !== token.current) return; bir = true; fn(); };
    say(text, ishla);
    setTimeout(ishla, ms);
  };
  const izohda = (s) => izohTeg(s, lang);
  const tegli = (s) => teg(s, til);
  /** Ustoz gapi: izoh tilidagi matn + o'rganilayotgan tildagi ibora (o'z ovozida). */
  const ustozGapi = (key, x = ib) => {
    const t = iboraMatn(x, til), i = iboraManosi(x, lang);
    const tpl = gapirIzohMatn(key, lang, { i, t: "\u0000" });
    if (lang === til && key !== "mana") return `${tegli(t)} ${tegli(gap("ayt", til))}`;
    const [old, yangi = ""] = tpl.split("\u0000");
    return `${old ? izohda(old) : ""}${tegli(t)}${yangi ? izohda(yangi) : ""}`;
  };

  const keyingi = () => {
    const r = holat.current.raund;
    token.current += 1;
    if (r + 1 >= GAPIR_RAUND) {
      const y = gapirYulduz(xatoRef.current);
      setTamom(y); setFaza("tamom"); onYakun?.(y);
      return;
    }
    setUrinish(0); setEshitildi(""); setRaund(r + 1); setFaza("ustoz");
  };
  const bajar = (togri) => {
    mikTox();
    token.current += 1;
    if (togri) { chime(); say(`${tegli(gap("barakalla", til))}`); }
    setYigildi((y) => [...y, { ...ib, togri }]);
    setFaza("bajar");
    if (ib?.tur !== "harakat") { const t = token.current; setTimeout(() => { if (alive.current && t === token.current) keyingi(); }, 2700); }
  };

  const tinglash = () => {
    mikTox();
    if (mikYoqRef.current) { setFaza("aytdim"); return; }
    token.current += 1;
    const t = token.current;
    setFaza("gapir"); setEshitildi("");
    const m = tingla(til, { kutish: 6500 });
    mik.current = m;
    m.promise.then((res) => {
      if (!alive.current || t !== token.current || res.toxtatildi) return;
      mik.current = null;
      if (res.xato === "ruxsat" || res.xato === "yoq") {
        mikYoqRef.current = true; mikYoqXotira = true; setMikYoq(true); setFaza("aytdim");
        say(izohda(gapirIzohMatn("mikYoq", lang)));
        return;
      }
      const u = holat.current.urinish;
      const b = gapirBaho(res.alts, ib, til, u);
      setEshitildi(res.alts?.[0] || "");
      if (b.ok) { bajar(true); return; }
      soft();
      if (u < 1) { setUrinish(1); setFaza("ustoz"); keyin(ustozGapi("yana"), tinglash); return; }
      xatoRef.current += 1; setXato(xatoRef.current);
      setFaza("ustoz");
      keyin(ustozGapi("mana"), () => bajar(false));
    });
  };

  // har raund boshida: ustoz tushuntiradi → mikrofon ochiladi
  useEffect(() => {
    if (tamom) return undefined;
    const kirish = raund === 0 ? `${izohda(gapirIzohMatn("intro", lang))} ` : "";
    keyin(`${kirish}${ustozGapi(ib?.tur === "harakat" ? "harakat" : ib?.tur === "narsa" ? "narsa" : "buyruq")}`, tinglash,
      gapVaqti(kirish) + gapVaqti(matn) + 1800);
    return () => { token.current += 1; mikTox(); };
  }, [raund]); // eslint-disable-line react-hooks/exhaustive-deps

  const qaytaEshit = () => { mikTox(); token.current += 1; setFaza("ustoz"); keyin(ustozGapi(ib?.tur === "harakat" ? "harakat" : ib?.tur === "narsa" ? "narsa" : "buyruq"), tinglash); };

  // Kabu ustoz: gapirganda qo'l cho'zadi, bola gapirganda tinglaydi, to'g'ri bo'lsa qarsak chaladi, xato bo'lsa ko'rsatadi
  const oxirgi = yigildi[yigildi.length - 1];
  const kabuPoza = faza === "gapir" || faza === "aytdim" ? "tingla" : faza === "bajar" ? (oxirgi?.togri ? "qarsak" : "korsat") : urinish ? "korsat" : "salom";
  return <div className={`jo-oyin ga-oyin ga-oyin--${ib?.tur || "tamom"}`}>
    <div className="jo-bar">
      <button type="button" className="jo-back" onClick={() => { mikTox(); onChiq?.(); }} aria-label={T("Orqaga")}><B e="⬅️" /></button>
      <b><span aria-hidden="true"><B e="🎤" /></span> {T("Ayt — bo‘ladi!")} · {d.n + 1}</b>
      <span className="jo-hisob">{Math.min(raund + 1, GAPIR_RAUND)}/{GAPIR_RAUND}{xato ? <> · {Array.from({ length: Math.min(3, xato) }, (_, i) => <B key={i} e="❌" />)}</> : ""}</span>
    </div>
    {tamom ? <Tamom yulduz={tamom} /> : <>
      <div className={`ga-sahna is-${faza}`} style={ib?.tur === "harakat" ? undefined : { backgroundImage: `url(${ib?.tur === "narsa" ? JR.fon_stol : JR.fon_sahna})` }}>
        {ib?.tur === "harakat"
          ? (String(ib.id).startsWith("sahna_")
            ? <SahnaFoto key={`${d.n}-${raund}`} rasm={String(ib.id).slice(6)} bajar={faza === "bajar"} onDemo={() => { if (alive.current) keyingi(); }} />
            : <HarakatSahna key={`${d.n}-${raund}`} id={ib.id} demo={faza === "bajar"} faol={false} qolsiz onDemo={() => setTimeout(() => { if (alive.current) keyingi(); }, 500)} />)
          : <div className={`ga-jonlan ga-jonlan--${ib?.tur} ${faza === "bajar" ? "is-jonli" : ""}`} key={`${d.n}-${raund}`}>
            {RASMLAR[rasmId(ib)]
              ? <img className="ga-rasm" src={RASMLAR[rasmId(ib)]} alt="" draggable="false" />
              : <span className="ga-emoji" aria-hidden="true">{iboraEmoji(ib)}</span>}
            {faza !== "bajar" && <span className="ga-zzz" aria-hidden="true">💤</span>}
            {faza === "bajar" && yigildi[yigildi.length - 1]?.togri && <img className="ga-uchqun" src={JR.konfetti} alt="" draggable="false" aria-hidden="true" />}
          </div>}
        <div className="ga-javon" aria-hidden="true">{yigildi.map((y, i) => <Belgi key={i} ib={y} />)}</div>
      </div>
      <div className="ga-karta">
        <img className="ga-kabu" src={kabuRasm(kabuPoza)} alt="" draggable="false" aria-hidden="true" />
        <button type="button" className="ga-eshit" onClick={qaytaEshit} aria-label={T("Qayta eshitish")}><B e="🔊" /></button>
        <div className="ga-matn">
          <b dir="auto">{matn}</b>
          {lang !== til && <small dir="auto">{manosi}</small>}
          {eshitildi && faza !== "bajar" && <i dir="auto">🗣️ «{eshitildi}»</i>}
        </div>
        {faza === "aytdim" || mikYoq
          ? <button type="button" className="ga-mik is-aytdim" disabled={faza === "bajar" || faza === "ustoz"} onClick={() => bajar(true)}><B e="✅" /> {T("Aytdim")}</button>
          : <button type="button" className={`ga-mik ${faza === "gapir" ? "is-tingla" : ""}`} disabled={faza === "bajar"}
            onClick={tinglash} aria-label={T("Gapir")}><span aria-hidden="true"><B e="🎤" /></span>{faza === "gapir" ? T("Gapir!") : urinish ? T("Yana") : T("Gapir")}</button>}
      </div>
    </>}
  </div>;
}

function Belgi({ ib }) {
  if (RASMLAR[rasmId(ib)]) return <img className={`ga-belgi ${ib.togri ? "" : "is-xato"}`} src={RASMLAR[rasmId(ib)]} alt="" draggable="false" />;
  return <span className={`ga-belgi ${ib?.togri ? "" : "is-xato"}`}>{ib?.tur === "harakat" ? <B n="tur_harakat" e="🎬" /> : iboraEmoji(ib)}</span>;
}
