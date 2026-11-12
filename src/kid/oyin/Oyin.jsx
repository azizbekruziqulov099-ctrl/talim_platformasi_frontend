// REV324: <Oyin id elementlar yosh onNatija onSay /> — o'yin dvigatelining umumiy qobig'i. O'yin holatini oyinRules
// (oyinYasa → tekshir) boshqaradi, ko'rinishni oyinlar/ ichidagi komponent chizadi. Ovozni o'zi chiqarmaydi: hamma gap
// props.onSay(text) orqali beriladi (o'rganilayotgan so'zlar «[en]cat[/en]» kabi teglangan). Tugaganda —
// onNatija(togriSoni, xatolar, { id, yulduz, keyingiQiyinlik, soniya }).
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  javobGapi, maslahat, nomOvoz, oyinOl, oyinYasa, qiyinlikMoslash, raundGapi, tekshir, yulduzlar,
} from "./oyinRules.js";
import { oyinMatn, umumiyGap } from "./oyinMatn.js";
import { OYIN_KOMPONENTLAR } from "./oyinlar/index.js";
import { mikBor } from "./mik.js";
import { JR, kabuRasm } from "../jonli/jonliRasm.js";
import { belgiSrc } from "../Belgi.jsx";
import "./oyin.css";

const KONFETTI_RANG = ["#ffc93c", "#2fbf71", "#3b82f6", "#ef5b5b", "#a855f7", "#f97316"];

function Yakun({ xatolar }) {
  const y = yulduzlar(xatolar);
  return (
    <div className="oy-yakun" role="status" aria-label={"⭐".repeat(y)}>
      <div className="oy-konfetti" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ "--x": `${(i * 37) % 100}%`, "--r": KONFETTI_RANG[i % KONFETTI_RANG.length], "--kech": `${(i % 8) * 120}ms` }} />
        ))}
      </div>
      <img className="oy-kabu is-katta" src={kabuRasm("hurra")} alt="" draggable="false" />
      <div className="oy-yulduzlar">
        {[0, 1, 2].map((i) => <img key={i} className={i < y ? "" : "is-bosh"} src={JR.yulduz} alt="" draggable="false" />)}
      </div>
    </div>
  );
}

import { sozRasmBelgila } from "./oyinRasmTop.js";   // REV420
/** Tashqi qobiq: o'yin ma'lumoti (id, elementlar, yosh…) o'zgarsa — ichki o'yin butunlay yangidan boshlanadi. */
export default function Oyin(props) {
  const { id, elementlar, yosh, til = "en", sonlar, qiyinlik = 0, urug } = props;
  const [tasodifUrug] = useState(() => Math.floor(Math.random() * 1e9));
  const ur = urug ?? tasodifUrug;
  // elementlar har renderda yangi massiv bo'lib kelsa ham o'yin qaytadan boshlanmasin — mazmuni bo'yicha imzo
  const imzo = JSON.stringify([id, yoshKalit(yosh), til, qiyinlik, ur, sonlar ?? null,
    (Array.isArray(elementlar) ? elementlar : []).map((e) => (e ? [e.say, e.uz, e.emoji, e.image, e.rom] : null))]);
  return <OyinIchki key={imzo} {...props} til={til} qiyinlik={qiyinlik} urug={ur} />;
}
const yoshKalit = (y) => String(y ?? "");

function OyinIchki({
  id, elementlar, yosh, onNatija, onSay, til, izoh = "uz", sonlar, qiyinlik, urug, rasm, onTingla, onChiq, mavzu = "", tanish = false, fasl = "", kirishDaraja = "", raundSoni = 0, variantSoniMajbur = 0,
}) {
  // REV420: har elementga — so'zining o'z rasmi bormi (emojidan taxmin qilingan rasm emas). Nomi aytiladigan o'yinlarda
  // faqat shunday narsalar beriladi: «bo'sh» so'ziga boshini ushlagan bola, «nimadir»ga sutli kosa chiqmasin.
  const [boshlangich] = useState(() => oyinYasa(id, { elementlar: sozRasmBelgila(elementlar), yosh, sonlar, qiyinlik, urug, til, mik: mikBor(onTingla), mavzu, tanish, izoh, fasl, kirishDaraja, raundSoni, variantSoniMajbur }));
  const [holat, setHolat] = useState(boshlangich);
  const holatRef = useRef(boshlangich);
  const [fb, setFb] = useState(null);            // oxirgi javob: { j, togri, n }
  const [kadr, setKadr] = useState(null);        // tugagan raundning oxirgi ko'rinishi: { raund, joriy }
  const [tamom, setTamom] = useState(false);
  const [kabu, setKabu] = useState(null);
  const [qayta, setQayta] = useState(0);
  const qulf = useRef(false);
  const fbSon = useRef(0);
  const tirik = useRef(true);
  const taymerlar = useRef(new Set());
  const aytilganRaund = useRef(-1);
  const natijaYuborildi = useRef(false);
  const sayRef = useRef(onSay);
  const natijaRef = useRef(onNatija);
  sayRef.current = onSay;
  natijaRef.current = onNatija;

  const taymer = useCallback((fn, ms) => {
    const t = setTimeout(() => { taymerlar.current.delete(t); if (tirik.current) fn(); }, ms);
    taymerlar.current.add(t);
  }, []);
  useEffect(() => {
    tirik.current = true;
    return () => { tirik.current = false; taymerlar.current.forEach(clearTimeout); taymerlar.current.clear(); };
  }, []);

  // REV359: ustoz gapirayotgani ma'lum — mikrofon faqat gap tugagach ochiladi (ovoz kelmasa — taxminiy vaqtdan keyin)
  const [gapirmoqda, setGapirmoqda] = useState(false);
  const gapId = useRef(0);
  const say = useCallback((text) => {
    const t = String(text || "").trim();
    if (!t) return;
    const id = ++gapId.current; setGapirmoqda(true);
    const tugadi = () => { if (gapId.current === id) setGapirmoqda(false); };
    setTimeout(tugadi, Math.min(20000, 1500 + t.replace(/\[\/?\w\w\]/g, "").length * 95));   // ovoz tugaganini bildirmasa ham
    try { sayRef.current?.(t, tugadi); } catch { tugadi(); }
  }, []);

  // har raund boshida ustozning gapi (1-raundda kirish bilan) — bir marta
  useEffect(() => {
    if (!holat || holat.tugadi || kadr || aytilganRaund.current === holat.raund) return;
    aytilganRaund.current = holat.raund;
    say(raundGapi(holat, { izoh, til, birinchi: holat.raund === 0 }));
  }, [holat, kadr, izoh, til, say]);

  const yakunla = useCallback((h) => {
    setTamom(true);
    if (natijaYuborildi.current) return;
    natijaYuborildi.current = true;
    try {
      natijaRef.current?.(h.togriSoni, h.xatolar, {
        id: h.id, yulduz: yulduzlar(h.xatolar), keyingiQiyinlik: qiyinlikMoslash(qiyinlik, h.xatolar), soniya: h.soniya,
      });
    } catch { /* */ }
  }, [qiyinlik]);

  const javob = useCallback((j) => {
    const eski = holatRef.current;
    if (qulf.current || !eski || eski.tugadi) return null;
    const n = tekshir(eski, j);
    if (n.holat === eski && n.togri === null && !n.voqea) return n;      // befarq (noto'g'ri bosish emas)
    holatRef.current = n.holat;
    setHolat(n.holat);
    fbSon.current += 1;
    if (n.togri !== null) setFb({ j, togri: n.togri, n: fbSon.current });
    if (n.togri === true) setKabu("qarsak");
    else if (n.xato) setKabu("oylaydi");
    say(javobGapi(eski, n, { izoh, til }));
    if (n.raundTugadi) {
      qulf.current = true;
      setKadr({ raund: eski.raund, joriy: n.yakunJoriy });
      taymer(() => {
        qulf.current = false;
        setKadr(null); setFb(null); setKabu(null);
        if (n.tugadi) yakunla(n.holat);
      }, n.togri ? 1300 : 2000);
    } else if (n.togri !== null) {
      taymer(() => setKabu(null), 1200);
    }
    return n;
  }, [izoh, til, say, taymer, yakunla]);

  // REV360: birinchi marta ko'rgan o'yin — ustoz gapirib bo'lgach Kabu to'g'ri javobni o'zi bosadi, keyin «Endi sen!»
  const [demo, setDemo] = useState(() => (holat?.kirishDaraja === "korsat" && holat?.raundlar?.[0]?.tur === "tanlov"));
  useEffect(() => {
    if (!demo || !holat || holat.raund !== 0 || kadr || gapirmoqda) return undefined;
    const id = setTimeout(() => {
      const r0 = holatRef.current?.raundlar?.[0];
      if (!r0) return;
      setKabu("korsat");
      const n = javob(r0.togri);
      setDemo(false);
      if (n) setTimeout(() => say(umumiyGap("endiSen", izoh, holatRef.current?.xil || 0)), 900);
    }, 1800);
    return () => clearTimeout(id);
  }, [demo, holat, kadr, gapirmoqda]); // eslint-disable-line react-hooks/exhaustive-deps

  const Komponent = OYIN_KOMPONENTLAR[Number(id)];
  // REV520: o'yin har qanday ekranga TO'LIQ sig'adi (telefon tik/yotiq, kichik ekran): mazmun ekrandan chiqsa — butun o'yin
  // mutanosib kichrayadi (kesilib qolmaydi, aylantirish kerak emas). Raund almashganda va ekran burilganda qayta o'lchanadi.
  const ildizRef = useRef(null);
  useEffect(() => {
    const el = ildizRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    let band = false, t = 0;
    const olcha = () => {
      if (band) return; band = true;
      let z = 1;
      for (let k = 0; k < 5; k += 1) {   // foizli o'lchamlar kichrayganda qayta joylashadi — bir necha marta o'lchab, aniq sig'diramiz
        el.style.zoom = z < 0.985 ? String(Math.floor(z * 100) / 100) : "";
        const r = Math.min(el.clientHeight / Math.max(1, el.scrollHeight), el.clientWidth / Math.max(1, el.scrollWidth));
        if (r >= 0.995 || z <= 0.45) break;
        z = Math.max(0.45, z * r * 0.985);
      }
      requestAnimationFrame(() => { band = false; });
    };
    const rej = () => { clearTimeout(t); t = setTimeout(olcha, 60); };
    const ro = new ResizeObserver(rej); ro.observe(el.parentElement || el);
    const mo = new MutationObserver(rej); mo.observe(el, { childList: true, subtree: true });
    window.addEventListener("orientationchange", rej); rej();
    return () => { clearTimeout(t); ro.disconnect(); mo.disconnect(); window.removeEventListener("orientationchange", rej); };
  }, [holat?.id, holat?.raund]);

  if (!holat || !Komponent) return null;

  const raundIdx = kadr ? kadr.raund : holat.raund;
  const raund = holat.raundlar[raundIdx];
  const joriy = kadr ? kadr.joriy : holat.joriy;
  // REV360: Kabu ko'rsatyapti — to'g'ri javob yonadi va Kabu o'zi bosadi (1-raund, faqat bitta tugmali tanlovlarda)
  const korsatish = Boolean(demo && !kadr && holat.raund === 0 && raund?.tur === "tanlov");
  const ishora = korsatish ? raund.togri : !kadr && joriy.xato >= 2 ? maslahat(holat) : null;   // 2 xatodan keyin to'g'risi yonib-o'chadi
  const y = holat.yosh;
  const quloq = belgiSrc("👂");
  const orqa = belgiSrc("⬅️");
  const props = {
    gapirmoqda,
    holat, raund, raundIdx, joriy, kadr: Boolean(kadr), fb, ishora, qulf: Boolean(kadr) || tamom,
    yosh: y, kichik: y === "2-3", katta: y === "6-7", til, izoh, rasm, onTingla, qayta,
    javob, say, setKabu, raundMatni: raundGapi(holat, { izoh, til, birinchi: holat.raund === 0 }),
    nom: (el) => nomOvoz(el, til),
    matn: (gap, vars) => oyinMatn(holat.kalit, gap, izoh, vars),
  };
  const kabuPoza = tamom ? "hurra" : kabu || (holat.kalit === "aytOch" && holat.mik ? "tingla" : "korsat");
  const yashirKabu = ["ketmaKet", "kabuXato"].includes(holat.kalit);   // bu o'yinlarda Kabu sahnaning o'zida

  return (
    <div ref={ildizRef} className={`oy-root oy-oyin-${holat.id} is-${y === "2-3" ? "kichik" : y === "6-7" ? "katta" : "orta"}`}
      data-oyin={holat.id} aria-label={oyinOl(holat.id)?.nom}>
      <div className="oy-bar">
        {onChiq ? (
          <button type="button" className="oy-tugma is-ikon" onClick={onChiq} aria-label="⬅">
            {orqa ? <img src={orqa} alt="" draggable="false" /> : <span className="oy-emoji">⬅️</span>}
          </button>
        ) : null}
        <div className="oy-nuqtalar" aria-hidden="true">
          {holat.raundlar.map((_, i) => (
            <i key={i} className={i < holat.raund || holat.tugadi ? "is-bitdi" : i === holat.raund ? "is-joriy" : ""} />
          ))}
        </div>
        {yashirKabu ? null : <img className="oy-kabu" src={kabuRasm(kabuPoza)} alt="" draggable="false" />}
        <button type="button" className="oy-tugma is-ikon" aria-label="🔊" disabled={tamom}
          onClick={() => { say(raundGapi(holat, { izoh, til })); setQayta((q) => q + 1); }}>
          {quloq ? <img src={quloq} alt="" draggable="false" /> : <span className="oy-emoji">👂</span>}
        </button>
      </div>
      <Komponent key={raundIdx} {...props} />
      {tamom ? <Yakun xatolar={holat.xatolar} /> : null}
    </div>
  );
}
