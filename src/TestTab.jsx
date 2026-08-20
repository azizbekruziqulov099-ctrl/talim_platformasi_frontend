import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import katex from "katex";
import { ChevronRight, ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import {
  buildGameStartPayload,
  gameErrorMessage,
  gameQuestionOptions,
  gradeBandForClass,
} from "./testGameRules.js";

const TestGameArena = React.lazy(() => import("./TestGameArena.jsx"));
const GameModePicker = React.lazy(() =>
  import("./TestGameArena.jsx").then((module) => ({ default: module.GameModePicker })),
);
const GameProfileStrip = React.lazy(() =>
  import("./TestGameArena.jsx").then((module) => ({ default: module.GameProfileStrip })),
);

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://talimplatformasi-production.up.railway.app";

const MAVZULAR_XOTIRA_KESHI = new Map();
const MAVZULAR_KESH_MS = 5 * 60 * 1000;

// TestGameArena'ning eski versiyasi javob natijasini ko'rsatgandan keyin
// keyingi savolga o'tishni 4.5 soniya ushlab turadi. Bu modul endi faqat
// o'yin ochilganda yuklanadi; uning aniq 4500 ms kutishi qisqartiriladi.
const OYIN_ESKI_JAVOB_KUTISH_MS = 4500;
const OYIN_TEZ_JAVOB_KUTISH_MS = 1200;

function _oyinJavobKutishiniTezlashtir() {
  if (typeof window === "undefined" || window.__samTmOyinTezTaymer) return;
  const aslSetTimeout = window.setTimeout.bind(window);
  window.setTimeout = (callback, delay, ...args) => {
    const haqiqiyKutish = Number(delay) === OYIN_ESKI_JAVOB_KUTISH_MS
      ? OYIN_TEZ_JAVOB_KUTISH_MS
      : delay;
    return aslSetTimeout(callback, haqiqiyKutish, ...args);
  };
  window.__samTmOyinTezTaymer = true;

  // Arena ichidagi eski 5 soniyalik raqam yangi tez o'tishga mos emas.
  // Natija va "Keyingi savolga o'tiladi" matni ko'rinishda qoladi.
  const style = document.createElement("style");
  style.dataset.samtmOyinTezTaymer = "true";
  style.textContent = ".scene-feedback-countdown{display:none!important}";
  document.head.appendChild(style);
}

_oyinJavobKutishiniTezlashtir();


function haqiqiyRasmKodimi(qiymat) {
  if (!qiymat) return false;
  const q = String(qiymat).trim();
  if (q.startsWith("/api/")) return true; // Excel'ga joylashtirilgan rasm — to'g'ridan-to'g'ri yo'l
  if (/^https?:\/\//i.test(q)) return true; // to'liq tashqi URL
  return /^\d+(-\d+){5,9}$/.test(q);
}

// Token ICHIDAGI user_id'ni o'qish uchun — imzo TEKSHIRILMAYDI (bu
// faqat "shu xabar MENIKIMI" kabi ko'RINISH qarorlari uchun, haqiqiy
// xavfsizlik har doim backend'da, har bir so'rovda tekshiriladi).
function _tokenDanUserIdOl(token) {
  try {
    const qism = token.split(".")[1];
    const toldirilgan = qism.replace(/-/g, "+").replace(/_/g, "/").padEnd(qism.length + (4 - (qism.length % 4)) % 4, "=");
    const payload = JSON.parse(atob(toldirilgan));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

function SavolFormulasi({ ifoda }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(ifoda, { throwOnError: false, output: "html", displayMode: true });
    } catch {
      return null;
    }
  }, [ifoda]);

  if (!html) return null;
  return (
    <div className="w-full rounded-xl mb-4 flex items-center justify-center py-6 px-4"
      style={{ backgroundColor: "#F1EFE8", border: "1px solid #E5E1D8" }}>
      <span dangerouslySetInnerHTML={{ __html: html }} style={{ fontSize: "1.3rem", color: "#2B2B2B" }} />
    </div>
  );
}

// Oddiy so'z-matn ICHIDA $...$ bilan belgilangan formulalarni ham
// ko'rsatish uchun — SavolFormulasi'dan farqli, BUTUN matnni formula
// deb hisoblamaydi (aks holda oddiy so'zlar harflarga bo'linib,
// noto'g'ri chiqib qolar edi), faqat $...$ ICHIDAGI qismni formulaga
// aylantiradi, qolgani oddiy matn bo'lib qoladi.
// LaTeX qismlarni ajratish uchun UMUMIY naqsh — uch xil holatni ham
// qamrab oladi: $...$ ichida, [lat]...[/lat] ichida, YOKI hech qanday
// belgisiz XOM LaTeX buyrug'i (\tfrac{a}{b}, \sqrt{a}, \times va h.k.) —
// AI ba'zan teglarni butunlay unutib qo'yadi, shuning uchun buyruqning
// o'zini ham (belgisiz holda) tanib, chizadi.
const _LATEX_QISM_NAQSHI = "\\$[^$]+\\$|\\[lat\\][^]*?\\[\\/lat\\]|\\\\(?:tfrac|dfrac|frac)\\{[^{}]*\\}\\{[^{}]*\\}|\\\\sqrt\\{[^{}]*\\}|\\\\(?:times|div|cdot|pm|leq|geq|neq|infty|approx)(?![a-zA-Z])";
const _LATEX_BOLISH_REGEX = new RegExp(`(${_LATEX_QISM_NAQSHI})`, "g");

function _latexMatniniAjrat(qism) {
  if (qism.startsWith("$") && qism.endsWith("$") && qism.length > 2) return qism.slice(1, -1);
  if (qism.startsWith("[lat]") && qism.endsWith("[/lat]")) return qism.slice(5, -6);
  if (qism.startsWith("\\")) return qism; // xom LaTeX buyrug'i — belgisiz, to'g'ridan-to'g'ri KaTeX'ga beriladi
  return null;
}

function AralashMatn({ matn, className, style }) {
  // $...$ , [lat]...[/lat] VA belgisiz xom LaTeX buyrug'i — uchalasi ham
  // xuddi shu tarzda chiroyli (KaTeX) render qilinadi.
  const qismlar = useMemo(() => (matn || "").split(_LATEX_BOLISH_REGEX), [matn]);
  return (
    <p className={className} style={{ whiteSpace: "pre-wrap", ...style }}>
      {qismlar.map((qism, i) => {
        const latexMatni = _latexMatniniAjrat(qism);
        if (latexMatni !== null) {
          try {
            const html = katex.renderToString(latexMatni, { throwOnError: false, output: "html", displayMode: false });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{latexMatni}</span>;
          }
        }
        return <span key={i}>{qism}</span>;
      })}
    </p>
  );
}

// LaTeX ifodani OVOZLI O'QISH uchun, tabiiy o'zbekcha gapga aylantiradi.
// Eng ko'p uchraydigan naqshlarni (kasr, daraja, ildiz, asosiy amallar)
// qamrab oladi — juda murakkab/ichma-ich formulalarda mukammal
// bo'lmasligi mumkin, lekin odatiy o'quv formulalari uchun ishlaydi.
function latexniOzbekchaOqishga(latex) {
  let m = latex || "";
  m = m.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, " $1 bo'lak $2 dan ");
  m = m.replace(/\\sqrt\{([^{}]+)\}/g, " $1 dan kvadrat ildiz ");
  m = m.replace(/([a-zA-Z0-9]+)\^\{([^{}]+)\}/g, " $1 ning $2 darajasi ");
  m = m.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9])/g, " $1 ning $2 darajasi ");
  m = m.replace(/([a-zA-Z0-9]+)_\{([^{}]+)\}/g, " $1 indeks $2 ");
  m = m.replace(/\\times|\\cdot/g, " ko'paytirish ");
  m = m.replace(/\\div/g, " bo'lish ");
  m = m.replace(/\\pi/g, " pi ");
  m = m.replace(/\\pm/g, " plyus-minus ");
  m = m.replace(/\\leq/g, " kichik yoki teng ");
  m = m.replace(/\\geq/g, " katta yoki teng ");
  m = m.replace(/\+/g, " qo'shish ");
  m = m.replace(/(?<!\d)-(?!\d)/g, " minus ");
  m = m.replace(/=/g, " teng ");
  m = m.replace(/[{}\\$]/g, " ");
  return m.replace(/\s+/g, " ").trim();
}

// Matnni SO'ZMA-SO'Z, joriy o'qilayotgan so'z BELGILANGAN holda
// ko'rsatadi — Web Speech API'ning "boundary" hodisasi bilan bog'lanadi
// (tashqi, pullik TTS xizmat SHART emas — brauzerning o'zi o'qiydi).
function OqiladiganMatn({ matn, joriySozIndeksi }) {
  const sozlar = useMemo(() => matn.split(/(\s+)/), [matn]);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#2B2B2B" }}>
      {sozlar.map((soz, i) => (
        <span key={i} style={i === joriySozIndeksi
          ? { backgroundColor: "#FDE8B8", fontWeight: 700, borderRadius: 4, padding: "0 2px" }
          : {}}>
          {soz}
        </span>
      ))}
    </p>
  );
}

const OVOZ_TIL_LANG = { uz: "uz-UZ", en: "en-US", ru: "ru-RU" };

function _ovozTiliniTuzat(til) {
  const kalit = String(til || "").trim().toLowerCase().replace("_", "-").split("-", 1)[0];
  return Object.prototype.hasOwnProperty.call(OVOZ_TIL_LANG, kalit) ? kalit : "uz";
}

function _ovozJinsiniTuzat(jins) {
  return ["ogil", "o'g'il", "erkak", "male", "boy"].includes(String(jins || "").trim().toLowerCase()) ? "ogil" : "qiz";
}

function _ovozQismlargaBol(matn, asosiyTil = "uz") {
  const xom = String(matn || "");
  // Tegsiz matn hech qachon brauzer/profilning inglizcha standart ovoziga
  // tushmaydi. Asosiy til qat'iy o'zbekcha; faqat [en] va [ru] teglari
  // ichidagi bo'laklar o'z tiliga o'tadi. Parametr eski chaqiruvlar bilan
  // moslik uchun qoldirilgan.
  const standart = "uz";
  const naqsh = /\[(uz|en|ru)\]([\s\S]*?)\[\/\1\]/gi;
  const qismlar = [];
  let oxiri = 0;
  let mos;
  while ((mos = naqsh.exec(xom)) !== null) {
    const oldingi = xom.slice(oxiri, mos.index);
    if (oldingi.trim()) qismlar.push({ til: standart, matn: oldingi });
    if (mos[2].trim()) qismlar.push({ til: _ovozTiliniTuzat(mos[1]), matn: mos[2] });
    oxiri = naqsh.lastIndex;
  }
  const qolgan = xom.slice(oxiri);
  if (qolgan.trim()) qismlar.push({ til: standart, matn: qolgan });
  return qismlar.length > 0 ? qismlar : [{ til: standart, matn: xom }];
}

function _brauzerOvoziniTanla(til, jins) {
  const voices = globalThis.speechSynthesis?.getVoices?.() || [];
  const lang = OVOZ_TIL_LANG[_ovozTiliniTuzat(til)].toLowerCase();
  const mosOvozlar = voices.filter((voice) => String(voice.lang || "").toLowerCase().startsWith(lang.slice(0, 2)));
  if (mosOvozlar.length === 0) return null;
  const erkakKalitlari = ["male", "david", "guy", "dmitry", "sardor", "mark"];
  const ayolKalitlari = ["female", "zira", "samantha", "jenny", "svetlana", "madina", "anna"];
  const kalitlar = _ovozJinsiniTuzat(jins) === "ogil" ? erkakKalitlari : ayolKalitlari;
  return mosOvozlar.find((voice) => kalitlar.some((kalit) => String(voice.name || "").toLowerCase().includes(kalit))) || mosOvozlar[0];
}

function _xorijiyMatnniOvozgaTayyorla(matn, til) {
  const lugat = til === "ru"
    ? { frac: (a, b) => `${a} делённое на ${b}`, sqrt: (x) => `квадратный корень из ${x}`, square: (x) => `${x} в квадрате`, cube: (x) => `${x} в кубе`, power: (x, n) => `${x} в степени ${n}`, "+": " плюс ", "-": " минус ", "×": " умножить на ", "·": " умножить на ", "*": " умножить на ", "÷": " разделить на ", "=": " равно ", "≤": " меньше или равно ", "≥": " больше или равно ", "≠": " не равно ", "<": " меньше ", ">": " больше " }
    : { frac: (a, b) => `${a} over ${b}`, sqrt: (x) => `square root of ${x}`, square: (x) => `${x} squared`, cube: (x) => `${x} cubed`, power: (x, n) => `${x} to the power of ${n}`, "+": " plus ", "-": " minus ", "×": " times ", "·": " times ", "*": " times ", "÷": " divided by ", "=": " equals ", "≤": " less than or equal to ", "≥": " greater than or equal to ", "≠": " not equal to ", "<": " less than ", ">": " greater than " };
  let t = String(matn || "");
  t = t.replace(/\[lat\]([\s\S]*?)\[\/lat\]/gi, "$1").replace(/\$([^$]+)\$/g, "$1");
  t = t.replace(/\\(?:left|right)/g, "");
  t = t.replace(/\\(?:tfrac|dfrac|cfrac|frac)\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (_, a, b) => ` ${lugat.frac(a, b)} `);
  t = t.replace(/\\sqrt\s*\{([^{}]+)\}/g, (_, x) => ` ${lugat.sqrt(x)} `);
  t = t.replace(/([0-9A-Za-zА-Яа-я]+)\s*\^\s*\{?(\d+)\}?/g, (_, x, n) => ` ${n === "2" ? lugat.square(x) : n === "3" ? lugat.cube(x) : lugat.power(x, n)} `);
  for (const [re, belgi] of [[/\\times/g, "×"], [/\\cdot/g, "·"], [/\\div/g, "÷"], [/\\leq/g, "≤"], [/\\geq/g, "≥"], [/\\neq/g, "≠"]]) t = t.replace(re, belgi);
  t = t.replace(/\\pi\b/g, " pi ");
  for (const belgi of ["≤", "≥", "≠", "+", "-", "×", "·", "*", "÷", "=", "<", ">"])
    t = t.replace(new RegExp(`\\s*${belgi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "g"), lugat[belgi]);
  t = t.replace(/\\[A-Za-z]+|[{}]/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

function _matnniOvozgaTayyorla(matn, til = "uz") {
  // LaTeX belgilangan (yoki belgisiz) kasrlarni tabiiy o'zbekcha nutqqa
  // aylantiradi — masalan \tfrac{1}{2} → "ikkidan bir", 6\tfrac{1}{2}
  // (aralash son) → "olti butun ikkidan bir". Shuningdek: o'lchov
  // birliklari (kg, sm, km...) to'liq so'zga, va matematik o'zgaruvchilar
  // (x, y, z, n — songa yopishgan bo'lsa ham, masalan "2x") o'z nomiga
  // ("iks", "igrik"...) aylantiriladi — xom holda o'qish tushunarsiz
  // eshitilgani uchun kerak.
  if (!matn) return "";
  til = _ovozTiliniTuzat(til);
  if (til !== "uz") return _xorijiyMatnniOvozgaTayyorla(matn, til);
  let t = matn;
  t = t.replace(/\[lat\]([^]*?)\[\/lat\]/g, "$1");
  t = t.replace(/\$([^$]+)\$/g, "$1");
  t = t.replace(/(\d)\s*(\\(?:tfrac|dfrac|cfrac|frac))/g, "$1 butun $2");
  t = t.replace(/\\(?:tfrac|dfrac|cfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$2 dan $1");
  t = t.replace(/\\sqrt\s*\{([^{}]*)\}/g, "$1 ning kvadrat ildizi");
  t = t.replace(/\\times/g, " marta ");
  t = t.replace(/\\cdot/g, " marta ");
  t = t.replace(/\\div/g, " bo'lib ");
  t = t.replace(/\\pm/g, " plyus-minus ");
  t = t.replace(/\\leq/g, " kichik yoki teng ");
  t = t.replace(/\\geq/g, " katta yoki teng ");
  t = t.replace(/\\neq/g, " teng emas ");
  t = t.replace(/\\infty/g, " cheksizlik ");
  t = t.replace(/\\approx/g, " taxminan teng ");
  t = t.replace(/\\pi\b/g, " pi ");
  t = t.replace(/([0-9a-zA-Z]+)\s*\^\s*\{?(\d+)\}?/g, (_, asos, daraja) => {
    if (daraja === "2") return ` ${asos} kvadrat `;
    if (daraja === "3") return ` ${asos} kub `;
    return ` ${asos} ning ${daraja}-darajasi `;
  });
  const birliklar = [
    [/\bkm\/soat\b/gi, " kilometr soatiga "],
    [/\bkg\b/gi, " kilogramm "], [/\bgr\b/gi, " gramm "],
    [/\bmm\b/gi, " millimetr "], [/\bsm\b/gi, " santimetr "], [/\bkm\b/gi, " kilometr "],
    [/\bml\b/gi, " millilitr "], [/\bl\b/gi, " litr "],
    [/\bsm2\b|\bsm²\b/gi, " kvadrat santimetr "], [/\bm2\b|\bm²\b/gi, " kvadrat metr "],
    [/\bsm3\b|\bsm³\b/gi, " kub santimetr "], [/\bm3\b|\bm³\b/gi, " kub metr "],
    [/\bm\b/g, " metr "],
  ];
  for (const [re, almashtir] of birliklar) t = t.replace(re, almashtir);
  const ozgaruvchilar = { x: "iks", y: "igrik", z: "zet", n: "en" };
  t = t.replace(/(?<![a-zA-Zʻʼ'])([xyzn])(?![a-zA-Zʻʼ'])/g, (m, harf) => ` ${ozgaruvchilar[harf]} `);
  t = t.replace(/°C/g, " daraja Selsiy ");
  t = t.replace(/%/g, " foiz ");
  t = t.replace(/≤/g, " kichik yoki teng ").replace(/≥/g, " katta yoki teng ").replace(/≠/g, " teng emas ");
  t = t.replace(/\+/g, " plyus ").replace(/−|-/g, " minus ");
  t = t.replace(/[×·*]/g, " ko'paytirilgan ").replace(/÷/g, " bo'lingan ").replace(/=/g, " teng ");
  t = t.replace(/</g, " kichik ").replace(/>/g, " katta ");
  t = t.replace(/\$/g, "");
  t = t.replace(/_{2,}/g, " bo'sh joy "); // "___" (bo'sh joy) — "pastki chiziq" deb o'qilmasin
  t = t.replace(/[_`#]+/g, "");
  return t.replace(/\s+/g, " ").trim();
}

function OvozliOqishTugmasi({
  matn,
  kontentId,
  oqilayotganId,
  setOqilayotganId,
  joriySozIndeksi,
  setJoriySozIndeksi,
  asosiyTil = "uz",
  ovozJinsi = "qiz",
}) {
  const [tezlik, setTezlik] = useState(1);
  const [pauzada, setPauzada] = useState(false);
  const audioRef = useRef(null);
  const oqilyaptimi = oqilayotganId === kontentId;

  const boshla = (boshlanishTezligi) => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPauzada(false);
    const qismlar = _ovozQismlargaBol(matn, asosiyTil)
      .map((qism) => ({ ...qism, tayyor: _matnniOvozgaTayyorla(qism.matn, qism.til) }))
      .filter((qism) => qism.tayyor);
    const brauzerOvozlari = qismlar.map((qism) => _brauzerOvoziniTanla(qism.til, ovozJinsi));
    let qismIndeksi = 0;
    const tugadi = () => {
      audioRef.current = null;
      setOqilayotganId(null);
      setJoriySozIndeksi(-1);
      setPauzada(false);
    };
    if (!brauzerOvozlari.every(Boolean)) {
      const qs = new URLSearchParams({
        matn: String(matn || ""),
        jins: _ovozJinsiniTuzat(ovozJinsi),
        asosiy_til: "uz",
      });
      const audio = new Audio(`${API_BASE}/api/ovoz?${qs.toString()}`);
      audio.playbackRate = boshlanishTezligi;
      audio.onended = tugadi;
      audio.onerror = tugadi;
      audioRef.current = audio;
      setOqilayotganId(kontentId);
      audio.play().catch(tugadi);
      return;
    }
    const keyingisiniOqi = () => {
      if (qismIndeksi >= qismlar.length) { tugadi(); return; }
      const joriyQismIndeksi = qismIndeksi++;
      const qism = qismlar[joriyQismIndeksi];
      const sozlar = qism.tayyor.split(/(\s+)/);
      let pozitsiya = 0;
      const sozPozitsiyalari = sozlar.map((s) => { const p = pozitsiya; pozitsiya += s.length; return p; });
      const utterance = new SpeechSynthesisUtterance(qism.tayyor);
      utterance.lang = OVOZ_TIL_LANG[qism.til];
      utterance.voice = brauzerOvozlari[joriyQismIndeksi];
      utterance.rate = boshlanishTezligi;
      utterance.pitch = _ovozJinsiniTuzat(ovozJinsi) === "ogil" ? 0.92 : 1.04;
      utterance.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        let idx = 0;
        for (let i = 0; i < sozPozitsiyalari.length; i++) {
          if (sozPozitsiyalari[i] <= e.charIndex) idx = i; else break;
        }
        setJoriySozIndeksi(idx);
      };
      utterance.onend = keyingisiniOqi;
      utterance.onerror = tugadi;
      window.speechSynthesis.speak(utterance);
    };
    setOqilayotganId(kontentId);
    keyingisiniOqi();
  };

  const pauzaYokiDavomEttir = () => {
    if (audioRef.current) {
      if (pauzada) audioRef.current.play();
      else audioRef.current.pause();
      setPauzada(!pauzada);
      return;
    }
    if (pauzada) { window.speechSynthesis.resume(); setPauzada(false); }
    else { window.speechSynthesis.pause(); setPauzada(true); }
  };

  const toxtat = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setOqilayotganId(null);
    setJoriySozIndeksi(-1);
    setPauzada(false);
  };

  const tezlikOzgar = (yangiTezlik) => {
    setTezlik(yangiTezlik);
    if (audioRef.current) {
      audioRef.current.playbackRate = yangiTezlik;
      return;
    }
    if (oqilyaptimi) boshla(yangiTezlik); // o'qish davomida tezlik o'zgarsa, shu joydan emas, boshidan qayta — brauzerlar tezlikni jonli o'zgartirishni qo'llamaydi
  };

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  return (
    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
      <button onClick={() => (oqilyaptimi ? toxtat() : boshla(tezlik))}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
        {oqilyaptimi ? "⏹ To'xtatish" : "🔊 O'qib berish"}
      </button>
      {oqilyaptimi && (
        <button onClick={pauzaYokiDavomEttir}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
          {pauzada ? "▶ Davom" : "⏸ Pauza"}
        </button>
      )}
      {[0.75, 1, 1.25, 1.5].map((t) => (
        <button key={t} onClick={() => tezlikOzgar(t)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          style={tezlik === t ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#8A8578" }}>
          {t}x
        </button>
      ))}
    </div>
  );
}

function SavolRasmi({ rasmId }) {
  const [holat, setHolat] = useState("yuklanmoqda"); // yuklanmoqda | tayyor | xato
  useEffect(() => { setHolat("yuklanmoqda"); }, [rasmId]);

  if (holat === "xato") {
    return null; // rasm topilmasa/yuklanmasa — hech narsa ko'rsatilmaydi, joy egallamaydi
  }
  return (
    <div className="relative mb-4">
      {holat === "yuklanmoqda" && (
        <div className="w-full rounded-xl flex items-center justify-center py-10" style={{ backgroundColor: "#F1EFE8" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "#8A8578" }} />
        </div>
      )}
      <img src={
          String(rasmId).startsWith("/api/") ? `${API_BASE}${rasmId}`
          : /^https?:\/\//i.test(String(rasmId)) ? rasmId
          : `${API_BASE}/api/rasm/${rasmId}`
        } alt=""
        className="w-full rounded-xl object-contain"
        style={{ maxHeight: "260px", backgroundColor: "#EFEBE1", display: holat === "yuklanmoqda" ? "none" : "block" }}
        onLoad={() => setHolat("tayyor")}
        onError={() => setHolat("xato")} />
    </div>
  );
}

function tegsizKorsat(matn) {
  // Ko'rsatishda [ru]so'z[/ru] kabi teglarni yashiradi (faqat ichidagi matnni qoldiradi) —
  // ovozga esa XOM matn (teg bilan) beriladi, shunda mos tilda o'qiladi.
  if (!matn) return matn;
  return matn.replace(/\[\/?[a-zA-Z]+\]/g, "");
}

function Matn({ matn, latex }) {
  // Umumiy yordamchidan foydalanadi — $...$, [lat]...[/lat] va belgisiz
  // xom LaTeX buyrug'ini ham taniydi. is_latex bayrog'iga qaramay, TEGLAR/
  // buyruq o'zi bor-yo'qligini ham tekshiradi — AI ba'zan bayroqni to'g'ri
  // qo'ymasligi yoki teglarni butunlay unutishi mumkin.
  const toza = tegsizKorsat(matn) || "";
  const bormi = toza.includes("$") || toza.includes("[lat]") || toza.includes("\\");
  if (!bormi) return <>{toza}</>;
  const qismlar = toza.split(_LATEX_BOLISH_REGEX);
  return (
    <>
      {qismlar.map((q, i) => {
        const latexMatni = _latexMatniniAjrat(q);
        if (latexMatni !== null) {
          try {
            const html = katex.renderToString(latexMatni, { throwOnError: false, output: "html" });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{latexMatni}</span>;
          }
        }
        return <span key={i}>{q}</span>;
      })}
    </>
  );
}


export default function TestTab({
  token,
  sinf: sinfXom,
  turi = "oddiy",
  onTestFaollik,
  foydalanuvchi = null,
  rang = "#1B4B7A",
  oyinProfil = null,
  onOyinProfilYangilandi,
  initialTarget = null,
}) {
  // DB'da sinf ba'zan "5", ba'zan "5-sinf" shaklida saqlangan (bot tomonidan
  // turli joyda turlicha yozilgan) — shu yerda BIR MARTA tozalab, hammasi
  // shu tozalangan qiymatdan foydalanadi, aks holda solishtirish mos kelmaydi.
  const sinf = sinfXom ? String(sinfXom).replace(/-sinf$/i, "").trim() : null;

  const [holat, setHolat] = useState("mavzular"); // mavzular | songi | savollar | natija
  const [faolTuri, setFaolTuri] = useState(turi); // "oddiy" | "togarak" — ICHKI, "Boshqa sinflar" bosilsa almashadi
  // O'quvchining profilida ALLAQACHON aniq (raqamli) sinfi bo'lsa ham, u
  // o'ziga tegishli BO'LISHI MUMKIN bo'lgan to'garak/maxsus guruhlarni
  // (masalan "Abituriyent" kabi harfli nomlangan) ko'rishi kerak — shu
  // uchun bu "vaqtincha o'z sinfini chetlab o'tish" rejimi.
  const [boshqaSinflarRejimi, setBoshqaSinflarRejimi] = useState(false);
  const [fanlar, setFanlar] = useState([]);
  const [tanlanganSinf, setTanlanganSinf] = useState(null); // admin uchun: tanlangan sinf raqami
  const [ochiqFan, setOchiqFan] = useState(null);
  const [savollar, setSavollar] = useState([]);
  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [javoblar, setJavoblar] = useState({});
  const [natija, setNatija] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [oyinRejimi, setOyinRejimi] = useState("bridge");
  const [oyinQahramonJinsi, setOyinQahramonJinsi] = useState(foydalanuvchi?.jins || "ogil");
  const [oyinSessiya, setOyinSessiya] = useState(null);
  const testUrinishIdRef = useRef(null);
  const testBoshlanganAtRef = useRef(null);
  const talimYoliNishoniRef = useRef(null);
  const testBoshlanmoqdaRef = useRef(false);
  const javobTekshirilmoqdaRef = useRef(new Set());
  const yakunlanmoqdaRef = useRef(false);
  const [javobTekshirilmoqdaId, setJavobTekshirilmoqdaId] = useState(null);

  useEffect(() => {
    if (!initialTarget?.nonce) return;
    const targetGrade = String(initialTarget.grade || "").trim();
    setHolat("mavzular");
    setFaolTuri("oddiy");
    setTanlanganSinf(targetGrade || sinf || null);
    setBoshqaSinflarRejimi(Boolean(targetGrade && targetGrade !== String(sinf || "")));
    setOchiqFan(null);
    setXato("");
    talimYoliNishoniRef.current = null;
  }, [initialTarget?.nonce, sinf]);

  useEffect(() => {
    if (foydalanuvchi?.jins) setOyinQahramonJinsi(foydalanuvchi.jins);
  }, [foydalanuvchi?.jins]);

  // Kabinetga "test hozir davom etyapti" holatini bildiramiz — shu payt
  // pastki menyu orqali boshqa bo'limga o'tib bo'lmaydi (test tugatilishi
  // yoki to'xtatilishi kerak).
  useEffect(() => {
    if (onTestFaollik) onTestFaollik(holat === "savollar" || holat === "oyin");
    return () => { if (onTestFaollik) onTestFaollik(false); };
  }, [holat, onTestFaollik]);

  useEffect(() => {
    const qs = new URLSearchParams({ turi: faolTuri });
    // boshqaSinflarRejimi paytida o'quvchining O'Z sinfi bilan CHEKLAMAYMIZ —
    // aks holda to'garak/maxsus guruhlar bo'yicha qidiruv natija bermaydi.
    if (sinf && !boshqaSinflarRejimi) qs.set("sinf", sinf);
    const url = `${API_BASE}/api/mavzular?${qs.toString()}`;
    const keshlangan = MAVZULAR_XOTIRA_KESHI.get(url);
    if (keshlangan && Date.now() - keshlangan.vaqt < MAVZULAR_KESH_MS) {
      setFanlar(keshlangan.fanlar);
      setYuklanmoqda(false);
      return undefined;
    }
    setYuklanmoqda(true);
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Mavzular yuklanmadi");
        return d;
      })
      .then((d) => {
        const yangiFanlar = d.fanlar || [];
        MAVZULAR_XOTIRA_KESHI.set(url, { fanlar: yangiFanlar, vaqt: Date.now() });
        setFanlar(yangiFanlar);
        setYuklanmoqda(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setXato("Mavzularni yuklab bo'lmadi");
          setYuklanmoqda(false);
        }
      });
    return () => controller.abort();
  }, [sinf, faolTuri, boshqaSinflarRejimi]);

  // Fan→Sinf→Mavzu ma'lumotini Sinf→Fan→Mavzu ko'rinishiga aylantiramiz —
  // har sinfga faqat O'SHA sinfning fan/mavzulari ko'rinishi uchun.
  const sinflarRoyxati = useMemo(() => {
    const bySinf = {};
    fanlar.forEach((fan) => {
      fan.sinflar.forEach((s) => {
        if (!bySinf[s.sinf]) bySinf[s.sinf] = { sinf: s.sinf, fanlar: [] };
        bySinf[s.sinf].fanlar.push({ qisqa: fan.qisqa, nom: fan.nom, mavzular: s.mavzular });
      });
    });
    return Object.values(bySinf).sort((a, b) => {
      const raqamA = /^\d+$/.test(a.sinf), raqamB = /^\d+$/.test(b.sinf);
      if (raqamA && raqamB) return parseInt(a.sinf, 10) - parseInt(b.sinf, 10);
      return String(a.sinf).localeCompare(String(b.sinf));
    });
  }, [fanlar]);

  // O'quvchi uchun sinf tashqaridan berilgan (o'z sinfi) — sinf tanlash bosqichi kerak emas.
  const faolSinf = (boshqaSinflarRejimi || !sinf) ? tanlanganSinf : sinf;
  const joriySinfMalumoti = faolSinf
    ? sinflarRoyxati.find((s) => String(s.sinf) === String(faolSinf))
    : null;

  useEffect(() => {
    if (!initialTarget?.nonce || yuklanmoqda || talimYoliNishoniRef.current === initialTarget.nonce) return;
    const targetGrade = String(initialTarget.grade || faolSinf || sinf || "");
    const classInfo = sinflarRoyxati.find((item) => String(item.sinf) === targetGrade);
    if (!classInfo) return;
    let found = null;
    for (const fanItem of classInfo.fanlar) {
      const topic = fanItem.mavzular.find((item) => (
        (item.topic_codes || []).includes(initialTarget.topic_code)
        || item.nomi === initialTarget.topic_name
      ));
      if (topic) {
        found = { fanItem, topic };
        break;
      }
    }
    if (!found) return;
    setTanlanganMavzu({
      aralash: true,
      kodlar: found.topic.topic_codes,
      nomi: found.topic.nomi,
      fanNomi: found.fanItem.nom,
      savol_soni: found.topic.savol_soni,
      sinf: classInfo.sinf,
      track: initialTarget.track || "standard",
    });
    setOchiqFan(found.fanItem.qisqa);
    setHolat("songi");
    talimYoliNishoniRef.current = initialTarget.nonce;
  }, [initialTarget, yuklanmoqda, sinflarRoyxati, faolSinf, sinf]);

  // Mavzu bosilganda — darhol savol OLMAYMIZ, avval "nechta savol" so'raymiz.
  // MUHIM: har mavzu ostida bir nechta KICHIK mavzu (topic_code) bo'lishi
  // mumkin — shu sabab yagona mavzu tanlansa ham, "aralash" mexanizmi
  // ishlatiladi, shunda barcha kichik mavzulardan random savol chiqadi.
  const mavzuBoslandi = (fan, mavzu) => {
    setTanlanganMavzu({
      aralash: true,
      kodlar: mavzu.topic_codes,
      nomi: mavzu.nomi,
      fanNomi: fan.nom,
      savol_soni: mavzu.savol_soni,
      sinf: joriySinfMalumoti?.sinf || sinf || tanlanganSinf,
    });
    setHolat("songi");
  };

  const [aralashRejim, setAralashRejim] = useState(false);
  const [tanlanganKodlar, setTanlanganKodlar] = useState([]); // [{nomi, topic_codes, savol_soni}]

  const aralashToggle = (m) => {
    setTanlanganKodlar((prev) =>
      prev.some((k) => k.nomi === m.nomi)
        ? prev.filter((k) => k.nomi !== m.nomi)
        : [...prev, m]
    );
  };

  const aralashTestBoshlandi = () => {
    if (tanlanganKodlar.length === 0) return;
    setTanlanganMavzu({
      aralash: true,
      kodlar: tanlanganKodlar.flatMap((k) => k.topic_codes),
      nomi: `Aralash test (${tanlanganKodlar.length} mavzu)`,
      fanNomi: joriySinfMalumoti ? `${joriySinfMalumoti.sinf}-sinf` : "",
      savol_soni: tanlanganKodlar.reduce((s, k) => s + (k.savol_soni || 0), 0),
      sinf: joriySinfMalumoti?.sinf || sinf || tanlanganSinf,
    });
    setHolat("songi");
  };

  const [qiyinlik, setQiyinlik] = useState(""); // "" = aralash | oson | o'rta | qiyin | murakkab
  const [rasimli, setRasimli] = useState(null); // null=aralash | true=rasimli | false=rasimsiz
  const [vaqtli, setVaqtli] = useState(null);
  const [yozuvli, setYozuvli] = useState(null);
  const [mosSoni, setMosSoni] = useState(null); // null = hali yuklanmoqda
  const [testRejimi, setTestRejimi] = useState("bir_bir"); // bir_bir | hammasi | oyin

  useEffect(() => {
    if (holat !== "songi" || !tanlanganMavzu) return;
    let bekor = false;
    const controller = new AbortController();
    setMosSoni(null);
    // Sozlamalar ketma-ket bosilganda eski so'rovlar serverga uyulib
    // ketmasin: 180 ms debounce va avvalgi fetch'ni haqiqiy bekor qilish.
    const taymer = setTimeout(() => {
      const umumiy = { signal: controller.signal };
      const so_rov = testRejimi === "oyin"
        ? fetch(`${API_BASE}/api/oyin/mavjudligi`, {
            ...umumiy,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              topic_codes: tanlanganMavzu.kodlar || [tanlanganMavzu.topic_code],
            }),
          })
        : tanlanganMavzu.aralash
        ? fetch(`${API_BASE}/api/test_aralash/soni`, {
            ...umumiy,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic_codes: tanlanganMavzu.kodlar || [], qiyinlik: qiyinlik || undefined, rasimli, vaqtli, yozuvli }),
          })
        : (() => {
            const qs = new URLSearchParams();
            if (qiyinlik) qs.set("qiyinlik", qiyinlik);
            if (rasimli !== null) qs.set("rasimli", rasimli);
            if (vaqtli !== null) qs.set("vaqtli", vaqtli);
            if (yozuvli !== null) qs.set("yozuvli", yozuvli);
            return fetch(`${API_BASE}/api/test/${tanlanganMavzu.topic_code}/soni?${qs.toString()}`, umumiy);
          })();
      so_rov
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(gameErrorMessage(data, "Savollar soni aniqlanmadi"));
          return data;
        })
        .then((d) => { if (!bekor) setMosSoni(d.available_count ?? d.soni ?? 0); })
        .catch((e) => {
          if (!bekor && e.name !== "AbortError") {
            setXato(`Savollar sonini olib bo'lmadi: ${e.message}`);
            setMosSoni(0);
          }
        });
    }, 180);
    return () => {
      bekor = true;
      clearTimeout(taymer);
      controller.abort();
    };
  }, [holat, tanlanganMavzu, qiyinlik, rasimli, vaqtli, yozuvli, testRejimi, token]);
  const [toGriSoni, setToGriSoni] = useState(0);
  const [xatoSoni, setXatoSoni] = useState(0);

  const savollarniYukla = async (soni) => {
    if (testBoshlanmoqdaRef.current) return;
    testBoshlanmoqdaRef.current = true;
    setYuklanmoqda(true); setXato("");
    try {
      let res;
      if (tanlanganMavzu.aralash) {
        res = await fetch(`${API_BASE}/api/test_aralash`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token, topic_codes: tanlanganMavzu.kodlar || [], soni, qiyinlik: qiyinlik || undefined,
            rasimli, vaqtli, yozuvli,
          }),
        });
      } else {
        const qs = new URLSearchParams({ soni, token });
        if (qiyinlik) qs.set("qiyinlik", qiyinlik);
        if (rasimli !== null) qs.set("rasimli", rasimli);
        if (vaqtli !== null) qs.set("vaqtli", vaqtli);
        if (yozuvli !== null) qs.set("yozuvli", yozuvli);
        res = await fetch(`${API_BASE}/api/test/${tanlanganMavzu.topic_code}?${qs.toString()}`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSavollar(data.savollar);
      testUrinishIdRef.current = data.attempt_id;
      if (!testUrinishIdRef.current) throw new Error("Server test urinishini yaratolmadi. 015 migratsiyasini tekshiring.");
      testBoshlanganAtRef.current = Date.now();
      setJavoblar({}); setJoriySavol(0); setJoriyNatija(null); setYozibJavob({}); setHolat("savollar");
      setToGriSoni(0); setXatoSoni(0);
    } catch (e) {
      setXato(e.message);
    } finally {
      testBoshlanmoqdaRef.current = false;
      setYuklanmoqda(false);
    }
  };

  const [yozibJavob, setYozibJavob] = useState({}); // {savol_id: xom_matn} — bir nechta savol bir vaqtda ko'rinadi
  const ovozRef = useRef(null);
  const ovozNutqRef = useRef(null);

  const [ovozHolati, setOvozHolati] = useState("bosh"); // "bosh" | "yuklanmoqda" | "oynamoqda" | "pauzada"
  const [ovozXatosi, setOvozXatosi] = useState("");
  const [ovozTezligi, setOvozTezligi] = useState(1);
  const [ovozTezlikOchiq, setOvozTezlikOchiq] = useState(false);
  const ovozMatniRef = useRef(null); // til/jins/matn kaliti — aynan shu audioni pauza/davom ettirish uchun
  const ovozKorinadiganMatnRef = useRef(null); // karnay tugmasining holatini savol matni bilan bog'laydi
  const ovozPromiseRef = useRef(null);

  const ovozniToxtat = useCallback(() => {
    const resolveCurrent = ovozPromiseRef.current;
    ovozPromiseRef.current = null;
    const audio = ovozRef.current;
    if (audio) {
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      ovozRef.current = null;
    }
    const utterance = ovozNutqRef.current;
    if (utterance) {
      utterance.onstart = null;
      utterance.onend = null;
      utterance.onerror = null;
      ovozNutqRef.current = null;
    }
    globalThis.speechSynthesis?.cancel?.();
    if (resolveCurrent) resolveCurrent({ status: "stopped" });
    ovozMatniRef.current = null;
    ovozKorinadiganMatnRef.current = null;
    setOvozXatosi("");
    setOvozHolati("bosh");
  }, []);

  const ovozniOqi = useCallback((matn, options = {}) => {
    const asosiyTil = "uz";
    const ovozJinsi = _ovozJinsiniTuzat(foydalanuvchi?.ovoz_jinsi || foydalanuvchi?.jins || "qiz");
    const xomMatn = String(matn || "").replace(/\s+/g, " ").trim();
    const ovozQismlari = _ovozQismlargaBol(xomMatn, asosiyTil)
      .map((qism) => ({ ...qism, tayyor: _matnniOvozgaTayyorla(qism.matn, qism.til) }))
      .filter((qism) => qism.tayyor);
    const tozaMatn = ovozQismlari.map((qism) => qism.tayyor).join(" ").trim();
    const ovozKaliti = `${asosiyTil}|${ovozJinsi}|${xomMatn}`;
    if (!tozaMatn) {
      setOvozXatosi("O'qiladigan matn topilmadi.");
      return Promise.resolve({ status: "empty" });
    }
    // Aynan shu matn hozir yuklangan/o'ynalayotgan bo'lsa — pauza/davom ettirish
    // (yangidan boshlab, boshidan o'qib bermaydi).
    if (ovozMatniRef.current === ovozKaliti && ovozNutqRef.current && globalThis.speechSynthesis) {
      if (globalThis.speechSynthesis.paused) {
        globalThis.speechSynthesis.resume();
        setOvozHolati("oynamoqda");
      } else {
        globalThis.speechSynthesis.pause();
        setOvozHolati("pauzada");
      }
      return ovozNutqRef.current.__samTmPromise;
    }
    if (ovozMatniRef.current === ovozKaliti && ovozRef.current) {
      if (ovozRef.current.paused) { ovozRef.current.play(); setOvozHolati("oynamoqda"); }
      else { ovozRef.current.pause(); setOvozHolati("pauzada"); }
      return ovozRef.current.__samTmPromise;
    }
    // Boshqa matn (yoki hozircha hech narsa) — avvalgisini TO'XTATIB, yangisini boshlaymiz.
    ovozniToxtat();
    setOvozXatosi("");
    setOvozHolati("yuklanmoqda");
    ovozMatniRef.current = ovozKaliti;
    ovozKorinadiganMatnRef.current = xomMatn;

    // Karnay bevosita bosilganda brauzerning o'z nutq dvigateli ishlaydi:
    // bu foydalanuvchi harakati ichida boshlanadi va autoplay blokiga tushmaydi.
    // Kichik sinflardagi avtomatik o'qishda ham mavjud bo'lsa shu xavfsiz yo'l
    // ishlatiladi; qo'llab-quvvatlanmasa server MP3 yo'liga qaytamiz.
    const SpeechUtterance = globalThis.SpeechSynthesisUtterance;
    const speech = globalThis.speechSynthesis;
    // Windows/Chrome'da o'zbek ovozi o'rnatilmagan bo'lsa, voice=null
    // brauzerning standart (ko'pincha inglizcha) ovozini tanlaydi. Shu
    // holatda Web Speech ishlatilmaydi — serverdagi uz-UZ ovoziga o'tiladi.
    const brauzerOvozlari = ovozQismlari.map((qism) => _brauzerOvoziniTanla(qism.til, ovozJinsi));
    const barchaTillarBrauzerdaBor = brauzerOvozlari.every(Boolean);
    if (SpeechUtterance && speech && barchaTillarBrauzerdaBor) {
      let qismIndeksi = 0;
      const tugatish = (status) => {
        const joriyNutq = ovozNutqRef.current;
        if (joriyNutq) {
          joriyNutq.onstart = null;
          joriyNutq.onend = null;
          joriyNutq.onerror = null;
        }
        ovozNutqRef.current = null;
        ovozMatniRef.current = null;
        ovozKorinadiganMatnRef.current = null;
        setOvozHolati("bosh");
        if (status === "error") setOvozXatosi("Brauzer ovozni o'qiy olmadi. Karnayni qayta bosing.");
        const resolveCurrent = ovozPromiseRef.current;
        ovozPromiseRef.current = null;
        if (resolveCurrent) resolveCurrent({ status });
      };
      const zanjirPromise = new Promise((resolve) => { ovozPromiseRef.current = resolve; });
      const keyingiQismniOqi = () => {
        if (qismIndeksi >= ovozQismlari.length) {
          tugatish("ended");
          return;
        }
        const joriyQismIndeksi = qismIndeksi++;
        const qism = ovozQismlari[joriyQismIndeksi];
        const utterance = new SpeechUtterance(qism.tayyor);
        utterance.lang = OVOZ_TIL_LANG[qism.til];
        utterance.voice = brauzerOvozlari[joriyQismIndeksi];
        utterance.rate = ovozTezligi;
        utterance.pitch = _ovozJinsiniTuzat(ovozJinsi) === "ogil" ? 0.92 : 1.04;
        utterance.__samTmPromise = zanjirPromise;
        ovozNutqRef.current = utterance;
        utterance.onstart = () => {
          if (ovozNutqRef.current === utterance) setOvozHolati("oynamoqda");
        };
        utterance.onend = () => {
          if (ovozNutqRef.current !== utterance) return;
          keyingiQismniOqi();
        };
        utterance.onerror = (event) => tugatish(event?.error === "canceled" ? "stopped" : "error");
        speech.speak(utterance);
      };
      speech.cancel();
      keyingiQismniOqi();
      setOvozHolati("oynamoqda");
      return zanjirPromise;
    }

    const ovozQs = new URLSearchParams({ matn: xomMatn, jins: ovozJinsi, asosiy_til: asosiyTil });
    const audio = new Audio(`${API_BASE}/api/ovoz?${ovozQs.toString()}`);
    audio.preload = "auto";
    audio.playbackRate = ovozTezligi;
    ovozRef.current = audio;
    const tugatish = (status) => {
      if (ovozRef.current !== audio) return;
      audio.onplaying = null;
      audio.onended = null;
      audio.onerror = null;
      ovozRef.current = null;
      ovozMatniRef.current = null;
      ovozKorinadiganMatnRef.current = null;
      setOvozHolati("bosh");
      if (status === "error" || status === "blocked") setOvozXatosi("Ovoz ishga tushmadi. Karnayni qayta bosing.");
      const resolveCurrent = ovozPromiseRef.current;
      ovozPromiseRef.current = null;
      if (resolveCurrent) resolveCurrent({ status, manual: Boolean(options.manual) });
    };
    audio.__samTmPromise = new Promise((resolve) => { ovozPromiseRef.current = resolve; });
    audio.onplaying = () => { if (ovozRef.current === audio) setOvozHolati("oynamoqda"); };
    audio.onended = () => tugatish("ended");
    audio.onerror = () => tugatish("error");
    audio.play().catch(() => tugatish("blocked"));
    return audio.__samTmPromise;
  }, [foydalanuvchi?.asosiy_til, foydalanuvchi?.jins, foydalanuvchi?.ovoz_jinsi, ovozTezligi, ovozniToxtat]);

  const ovozTezliginiOzgartir = (tezlik) => {
    setOvozTezligi(tezlik);
    if (ovozRef.current) ovozRef.current.playbackRate = tezlik;
  };

  const [umumiyVaqt, setUmumiyVaqt] = useState(null); // "hammasi" rejimi uchun — butun test uchun UMUMIY qolgan soniya | null (vaqtsiz)
  const [toxtatishModali, setToxtatishModali] = useState(false);
  const [yakunlashTasdiqi, setYakunlashTasdiqi] = useState(false);
  const umumiyTimerRef = useRef(null);
  const savolReflari = useRef({}); // {index: DOM element} — raqam bosilganda shu savolga aylantirish uchun

  // "bir_bir" (eski, mashq) rejimi uchun — bitta-bitta savol, darhol
  // to'g'ri/noto'g'ri ko'rsatish, avtomatik keyingisiga o'tish.
  const [joriySavol, setJoriySavol] = useState(0);
  const [joriyNatija, setJoriyNatija] = useState(null); // {togrimi, togri_javob, tushuntirish} | null
  const [qolganVaqt, setQolganVaqt] = useState(null);
  const [avtoQoldi, setAvtoQoldi] = useState(null);
  const timerRef = useRef(null);
  const avtoRef = useRef(null);

  const testUslubiniTanla = (yangiRejim) => {
    setTestRejimi(yangiRejim);
    if (yangiRejim === "oyin") {
      // V18.2 o'yin dvigateli yosh bosqichini serverdagi DTS sinfidan oladi;
      // har raund uchun barcha mos savollar bankidan 4+1 tuzilma yasaydi.
      setQiyinlik("");
      setRasimli(null);
      setVaqtli(null);
      setYozuvli(null);
    }
  };

  const oyinniBoshlash = async (soni) => {
    if (testBoshlanmoqdaRef.current) return;
    testBoshlanmoqdaRef.current = true;
    setYuklanmoqda(true);
    setXato("");
    try {
      const payload = buildGameStartPayload({
        token,
        topicCodes: tanlanganMavzu?.kodlar || [tanlanganMavzu?.topic_code],
        questionCount: soni,
        gameMode: oyinRejimi,
      });
      const res = await fetch(`${API_BASE}/api/oyin/boshlash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(gameErrorMessage(data, "O'yin boshlanmadi"));
      setOyinSessiya(data);
      if (data.profile && onOyinProfilYangilandi) onOyinProfilYangilandi(data.profile);
      testBoshlanganAtRef.current = Date.now();
      setHolat("oyin");
    } catch (e) {
      setXato(e.message || "O'yin boshlanmadi");
    } finally {
      testBoshlanmoqdaRef.current = false;
      setYuklanmoqda(false);
    }
  };

  const testniBoshlash = (soni) => (
    testRejimi === "oyin" ? oyinniBoshlash(soni) : savollarniYukla(soni)
  );

  // MUHIM: savol o'zgarganda (keyingisiga o'tilganda) — hozir o'qilayotgan
  // ovoz bo'lsa, DARHOL to'xtatiladi. Aks holda eski savolning ovozi
  // yangi savolga o'tilgandan keyin ham davom etib, ustma-ust chiqib
  // ketardi (yoki yangi ovoz umuman eshitilmasdi).
  useEffect(() => {
    ovozniToxtat();
  }, [joriySavol, ovozniToxtat]);

  // Savollar yuklangach — UMUMIY vaqtni hisoblaymiz (har bir savolning
  // o'z vaqti bo'lsa, hammasini QO'SHIB, BITTA umumiy hisoblagich sifatida
  // ishlatamiz — har savolga alohida vaqt emas). Faqat "hammasi" rejimida.
  useEffect(() => {
    if (holat !== "savollar" || savollar.length === 0 || testRejimi !== "hammasi") return;
    const jami = savollar.reduce((sum, s) => sum + (s.time_limit || 0), 0);
    setUmumiyVaqt(jami > 0 ? jami : null);
  }, [holat, savollar, testRejimi]);

  const yakunlaRef = useRef(() => {});

  useEffect(() => {
    if (umumiyTimerRef.current) clearInterval(umumiyTimerRef.current);
    if (holat !== "savollar" || testRejimi !== "hammasi" || umumiyVaqt === null) return;
    umumiyTimerRef.current = setInterval(() => {
      setUmumiyVaqt((v) => {
        if (v === null) return null;
        if (v <= 1) {
          clearInterval(umumiyTimerRef.current);
          yakunlaRef.current();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(umumiyTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holat, testRejimi, umumiyVaqt === null]);

  // "bir_bir" rejimi uchun — har savolning O'Z vaqti (agar bo'lsa).
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (holat !== "savollar" || testRejimi !== "bir_bir" || joriyNatija || !savollar[joriySavol]) return;
    const s = savollar[joriySavol];
    if (!s.time_limit) { setQolganVaqt(null); return; }
    setQolganVaqt(s.time_limit);
    timerRef.current = setInterval(() => {
      setQolganVaqt((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current);
          javobBerVaTekshir(s.id, "");
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joriySavol, holat, testRejimi]);

  // "bir_bir" (eski, mashq) rejimi uchun — javobni DARHOL tekshiradi va
  // to'g'ri/noto'g'rini shu zahoti ko'rsatadi.
  const javobBerVaTekshir = async (savolId, harf) => {
    if (javobTekshirilmoqdaRef.current.has(savolId) || joriyNatija) return;
    javobTekshirilmoqdaRef.current.add(savolId);
    setJavobTekshirilmoqdaId(savolId);
    if (timerRef.current) clearInterval(timerRef.current);
    setJavoblar((prev) => ({ ...prev, [savolId]: harf }));
    try {
      const res = await fetch(`${API_BASE}/api/test/javob_tekshir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          attempt_id: testUrinishIdRef.current,
          savol_id: savolId,
          tanlangan: harf,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Javob tekshirilmadi");
      setJoriyNatija(data);
      if (data.togrimi) setToGriSoni((v) => v + 1); else setXatoSoni((v) => v + 1);
    } catch {
      setJoriyNatija({ togrimi: false, togri_javob: "?", tushuntirish: "" });
      setXatoSoni((v) => v + 1);
    } finally {
      javobTekshirilmoqdaRef.current.delete(savolId);
      setJavobTekshirilmoqdaId((joriy) => joriy === savolId ? null : joriy);
    }
  };

  // "hammasi" (yangi, imtihon) rejimi uchun — javobni FAQAT yozib qo'yadi,
  // TEKSHIRMAYDI — to'g'ri/noto'g'ri faqat "Yakunlash"dan keyin, natija
  // ekranida ma'lum bo'ladi (haqiqiy imtihon uslubi).
  const javobYoz = (savolId, harf) => {
    setJavoblar((prev) => ({ ...prev, [savolId]: harf }));
  };

  const keyingiSavolga = () => {
    if (avtoRef.current) clearTimeout(avtoRef.current);
    setJoriyNatija(null);
    setYozibJavob({});
    if (joriySavol < savollar.length - 1) setJoriySavol(joriySavol + 1);
    else yakunla();
  };

  // Javob ko'rsatilgach (to'g'ri/noto'g'ri chiqqach), 1.2 soniyadan keyin
  // AVTOMATIK keyingi savolga o'tadi — foydalanuvchi tugma bosishi shart emas
  // (faqat "bir_bir" rejimida ishlaydi).
  useEffect(() => {
    if (!joriyNatija) { setAvtoQoldi(null); return; }
    setAvtoQoldi(1);
    avtoRef.current = setTimeout(keyingiSavolga, 1200);
    return () => clearTimeout(avtoRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joriyNatija]);

  // "O'tkazish" — javob berilmagan KEYINGI savolga sirg'alib o'tadi
  // (savol o'tkazib yuborilgani hisoblanadi, javobsiz qoladi).
  const savolniOtkazib = (joriyIndex) => {
    const keyingiIndex = savollar.findIndex((s, i) => i > joriyIndex && javoblar[s.id] === undefined);
    const nishon = keyingiIndex !== -1 ? keyingiIndex : savollar.findIndex((s) => javoblar[s.id] === undefined);
    if (nishon !== -1 && savolReflari.current[nishon]) {
      savolReflari.current[nishon].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const raqamgaOt = (index) => {
    if (savolReflari.current[index]) {
      savolReflari.current[index].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const yakunla = async () => {
    if (yakunlanmoqdaRef.current) return;
    yakunlanmoqdaRef.current = true;
    setYuklanmoqda(true);
    const ro_yxat = Object.entries(javoblar).map(([id, tanlangan]) => ({
      savol_id: parseInt(id, 10), tanlangan,
    }));
    const umumiyMaydonlar = {
      token,
      javoblar: ro_yxat,
      jami_savol_soni: savollar.length,
      track: tanlanganMavzu?.track || "standard",
      attempt_id: testUrinishIdRef.current,
      duration_seconds: testBoshlanganAtRef.current
        ? Math.max(0, Math.round((Date.now() - testBoshlanganAtRef.current) / 1000))
        : undefined,
    };
    try {
      const res = await fetch(`${API_BASE}/api/test/natija`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tanlanganMavzu.aralash
            ? { ...umumiyMaydonlar, topic_codes: tanlanganMavzu.kodlar }
            : { ...umumiyMaydonlar, topic_code: tanlanganMavzu.topic_code }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Natija saqlanmadi");
      setNatija(data);
      if (data.ochko?.profile && onOyinProfilYangilandi) {
        onOyinProfilYangilandi(data.ochko.profile);
      }
      setHolat("natija");
    } catch (e) {
      setXato(e.message || "Natijani yuborib bo'lmadi");
    } finally {
      yakunlanmoqdaRef.current = false;
      setYuklanmoqda(false);
    }
  };

  // yakunlaRef'ni HAR renderda eng so'nggi yakunla'ga tenglashtiramiz —
  // shu orqali yuqoridagi umumiy-vaqt hisoblagichi (bir marta o'rnatilgan
  // setInterval ichidan) hech qachon ESKI (bo'sh) javoblar bilan yubormaydi.
  useEffect(() => { yakunlaRef.current = yakunla; });

  const toxtatish = () => {
    setToxtatishModali(false);
    yakunla();
  };

  const qaytaBoshlash = () => {
    javobTekshirilmoqdaRef.current.clear();
    yakunlanmoqdaRef.current = false;
    testBoshlanmoqdaRef.current = false;
    setJavobTekshirilmoqdaId(null);
    setHolat("mavzular"); setTanlanganMavzu(null); setSavollar([]); setNatija(null);
    setUmumiyVaqt(null); setYozibJavob({}); setJoriySavol(0); setJoriyNatija(null);
    setOyinSessiya(null);
  };

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (holat === "oyin" && oyinSessiya) {
    return (
      <React.Suspense fallback={<div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: rang }} /></div>}>
        <TestGameArena
          token={token}
          apiBase={API_BASE}
          initialSession={oyinSessiya}
          playerProfile={{ ...foydalanuvchi, jins: oyinQahramonJinsi, class: sinf || foydalanuvchi?.class }}
          accent={rang}
          onRead={ovozniOqi}
          onStopRead={ovozniToxtat}
          readStatus={ovozHolati}
          readError={ovozXatosi}
          onFinished={() => { if (onTestFaollik) onTestFaollik(false); }}
          onProfileChange={onOyinProfilYangilandi}
          onBackToSetup={() => { setOyinSessiya(null); setHolat("songi"); }}
          onBackToTopics={qaytaBoshlash}
        />
      </React.Suspense>
    );
  }

  if (holat === "natija") {
    const rangi = natija.foiz >= 85 ? "#C89B3C" : natija.foiz >= 65 ? "#2D8B8B" : natija.foiz >= 45 ? "#B0553A" : "#8A8578";
    return (
      <div className="px-5 pt-10 pb-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${rangi}1A` }}>
            <span className="text-2xl font-bold" style={{ color: rangi }}>{natija.foiz}%</span>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
          <p className="text-sm mb-6" style={{ color: "#8A8578" }}>{natija.togri} / {natija.jami} to'g'ri</p>
        </div>

        {natija.ochko && (
          <div className="rounded-2xl p-4 bg-white border mb-5" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs" style={{ color: "#8A8578" }}>Oddiy test natijasi</p>
                <p className="text-lg font-bold" style={{ color: "#2B2B2B" }}>{natija.ochko.score_1000 || 0} / 1000</p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-sm font-bold" style={{ color: "#7A5412", backgroundColor: "#FFF3CD" }}>
                +{natija.ochko.awarded_points || 0} ochko
              </span>
            </div>
            {natija.ochko.daily_first_test_points > 0 && (
              <p className="text-xs mb-3" style={{ color: "#5A5648" }}>
                Bugungi birinchi tugallangan test uchun +{natija.ochko.daily_first_test_points} bonus.
              </p>
            )}
            <React.Suspense fallback={<div className="h-10" />}>
              <GameProfileStrip profile={natija.ochko.profile} accent={rang} compact />
            </React.Suspense>
          </div>
        )}

        {natija.xatolar && natija.xatolar.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>
              ❌ Xato javoblar ({natija.xatolar.length} ta)
            </p>
            <div className="space-y-3">
              {natija.xatolar.map((x) => (
                <div key={x.savol_id} className="rounded-xl p-4 border" style={{ borderColor: "#F3D3D3", backgroundColor: "#FCEBEB" }}>
                  <AralashMatn matn={x.savol} className="text-sm font-medium mb-2" style={{ color: "#2B2B2B" }} />
                  <AralashMatn matn={`Sizning javobingiz: ${x.sizning_javob}`} className="text-xs mb-1" style={{ color: "#A32D2D" }} />
                  <AralashMatn matn={`To'g'ri javob: ${x.togri_javob}`} className="text-xs" style={{ color: "#3B6D11" }} />
                  {x.tushuntirish && <AralashMatn matn={x.tushuntirish} className="text-xs mt-1.5" style={{ color: "#5A5648" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={qaytaBoshlash} className="w-full py-3.5 rounded-xl font-semibold text-white text-center" style={{ backgroundColor: "#1B4B7A" }}>
          Boshqa mavzu
        </button>
      </div>
    );
  }

  if (holat === "songi") {
    const jami = mosSoni ?? 0;
    const oddiyVariantlar = (tanlanganMavzu.aralash ? [10, 15, 20, 25, 30, 35, 40, 45, 50] : [5, 10, 15]).filter((n) => n < jami);
    const oyinVariantlar = gameQuestionOptions(jami);
    const variantlar = testRejimi === "oyin" ? oyinVariantlar : oddiyVariantlar;
    const oyinYoshBosqichi = gradeBandForClass(
      tanlanganMavzu?.sinf || sinf || tanlanganSinf || joriySinfMalumoti?.sinf,
    );
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("mavzular")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganMavzu.fanNomi}</p>

        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>🧭 Test uslubi</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button onClick={() => testUslubiniTanla("bir_bir")}
              className="rounded-xl p-3.5 text-left border-2"
              style={testRejimi === "bir_bir" ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" } : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#2B2B2B" }}>📖 Bittalab</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Har javobdan keyin darhol to'g'ri/noto'g'ri ko'rinadi — mashq uchun</p>
            </button>
            <button onClick={() => testUslubiniTanla("hammasi")}
              className="rounded-xl p-3.5 text-left border-2"
              style={testRejimi === "hammasi" ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" } : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#2B2B2B" }}>📜 Hammasi birga</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Natija faqat yakunlaganda ko'rinadi — imtihon uslubida</p>
            </button>
            <button onClick={() => testUslubiniTanla("oyin")}
              className="rounded-xl p-3.5 text-left border-2"
              style={testRejimi === "oyin" ? { borderColor: rang, backgroundColor: `${rang}12` } : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#2B2B2B" }}>🎮 O'yinli test</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Har 5-savol 4 variantli Boss, 3 jon, ochko va kunlik seriya</p>
            </button>
          </div>
        </div>

        {testRejimi === "oyin" ? (
          <React.Suspense fallback={<div className="py-8 text-center"><Loader2 size={22} className="animate-spin mx-auto" style={{ color: rang }} /></div>}>
            <GameModePicker
              value={oyinRejimi}
              onChange={setOyinRejimi}
              gradeBand={oyinYoshBosqichi}
              accent={rang}
              profile={oyinProfil}
              playerGender={oyinQahramonJinsi}
              onPlayerGenderChange={setOyinQahramonJinsi}
            />
          </React.Suspense>
        ) : (
          <>
            <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>🎯 Qiyinlik darajasi</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  ["", "🎲 Aralash"], ["oson", "🟢 Oson"], ["o'rta", "🟡 O'rta"],
                  ["qiyin", "🔴 Qiyin"], ["murakkab", "⚫ Murakkab"],
                ].map(([qiym, nom]) => (
                  <button key={qiym} onClick={() => setQiyinlik(qiym)}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold transition-colors"
                    style={qiyinlik === qiym
                      ? { backgroundColor: "#1B4B7A", color: "#fff" }
                      : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                    {nom}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>⚙️ Qo'shimcha sozlamalar</p>
              <UchXilTanlov nom="🖼️ Rasm" qiymat={rasimli} onOzgar={setRasimli} haNomi="Rasmli" yoqNomi="Rasmsiz" />
              <UchXilTanlov nom="⏱️ Vaqt" qiymat={vaqtli} onOzgar={setVaqtli} haNomi="Vaqtli" yoqNomi="Vaqtsiz" />
              <UchXilTanlov nom="✍️ Javob turi" qiymat={yozuvli} onOzgar={setYozuvli} haNomi="Yozuvli" yoqNomi="Tugmali" />
            </div>
          </>
        )}

        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#2B2B2B" }}>
            🔢 Nechta savol yechasiz?
            {mosSoni === null && <Loader2 size={14} className="animate-spin" style={{ color: "#8A8578" }} />}
          </p>
          {mosSoni === null ? (
            <p className="text-xs py-3 text-center" style={{ color: "#8A8578" }}>Mos savollar soni tekshirilmoqda...</p>
          ) : (testRejimi === "oyin" ? variantlar.length === 0 : mosSoni === 0) ? (
            <p className="text-xs py-3 text-center rounded-xl" style={{ color: "#B0553A", backgroundColor: "#FCEBEB" }}>
              {testRejimi === "oyin"
                ? "O'yin uchun kamida 5 ta to'liq, 4 variantli savol kerak."
                : "Bu sozlamalar bo'yicha mos savol topilmadi — boshqa sozlamani tanlang."}
            </p>
          ) : (
            <>
              <div className={`grid ${testRejimi === "oyin" ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-3"} gap-2 mb-2.5`}>
                {variantlar.map((n) => (
                  <button key={n} onClick={() => testniBoshlash(n)}
                    className="py-3.5 rounded-xl border font-semibold text-center text-sm"
                    style={{ borderColor: "#E5E1D8", backgroundColor: "#F7F5F0", color: "#2B2B2B" }}>
                    <span className="block">{n} ta</span>
                    {testRejimi === "oyin" && <span className="block text-[10px] mt-0.5 font-medium" style={{ color: "#8A8578" }}>{n / 5} Boss</span>}
                  </button>
                ))}
              </div>
              {testRejimi !== "oyin" && (
                <button onClick={() => testniBoshlash(jami)}
                  className="w-full py-3.5 rounded-xl font-semibold text-white text-center text-sm"
                  style={{ backgroundColor: "#1B4B7A" }}>
                  🚀 Hammasi ({jami} ta)
                </button>
              )}
            </>
          )}
          {xato && <p className="text-xs mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
        </div>
      </div>
    );
  }

  if (holat === "savollar" && testRejimi === "bir_bir") {
    const s = savollar[joriySavol];
    const oxirgi = joriySavol === savollar.length - 1;
    const yozuvli = s.question_type === "write_answer";
    const variantlar = [["A", s.option_a], ["B", s.option_b], ["C", s.option_c], ["D", s.option_d]];
    const javobBerilgan = !!joriyNatija;
    const javobKutilmoqda = javobTekshirilmoqdaId === s.id;

    const variantRangi = (harf) => {
      if (!javobBerilgan) {
        return javoblar[s.id] === harf
          ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }
          : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" };
      }
      if (harf === joriyNatija.togri_javob) return { borderColor: "#639922", backgroundColor: "#EAF3DE" };
      if (harf === javoblar[s.id]) return { borderColor: "#E24B4A", backgroundColor: "#FCEBEB" };
      return { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", opacity: 0.6 };
    };

    return (
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium" style={{ color: "#8A8578" }}>{joriySavol + 1} / {savollar.length}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
              ✓ {toGriSoni}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
              ✗ {xatoSoni}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {qolganVaqt !== null && !javobBerilgan && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: qolganVaqt <= 5 ? "#FCEBEB" : "#F1EFE8", color: qolganVaqt <= 5 ? "#A32D2D" : "#5A5648" }}>
                ⏱ {qolganVaqt}s
              </span>
            )}
            <button onClick={() => setToxtatishModali(true)}
              className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F1EFE8", color: "#A32D2D" }}>
              ⏹
            </button>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: "#EFEBE1" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((joriySavol + 1) / savollar.length) * 100}%`, backgroundColor: "#1B4B7A" }} />
        </div>

        {s.rasm_id && (haqiqiyRasmKodimi(s.rasm_id)
          ? <SavolRasmi rasmId={s.rasm_id} />
          : <SavolFormulasi ifoda={s.rasm_id} />)}

        <h2 className="text-lg font-semibold mb-5 flex items-start gap-2" style={{ color: "#2B2B2B" }}>
          <span className="flex-1"><Matn matn={s.question} latex={s.is_latex} /></span>
          {(() => {
            const ovozMatni = yozuvli ? s.question : `${s.question}. A) ${s.option_a}. B) ${s.option_b}. C) ${s.option_c}. D) ${s.option_d}`;
            const shuOqilmoqda = ovozKorinadiganMatnRef.current === String(ovozMatni || "").replace(/\s+/g, " ").trim();
            return (
              <div className="shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <button onClick={() => ovozniOqi(ovozMatni)}
                    aria-busy={shuOqilmoqda && ovozHolati === "yuklanmoqda"}
                    aria-label={shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "Ovoz tayyorlanmoqda" : "Ovoz chiqarib o'qish"}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "#FFF3CD" : "#EAF1F7",
                      color: shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "#8A5A1C" : "#1B4B7A",
                    }}
                    title={shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "Ovoz tayyorlanmoqda..." : "Ovoz chiqarib o'qish"}>
                    {shuOqilmoqda && ovozHolati === "yuklanmoqda" ? <Loader2 size={16} className="animate-spin" />
                      : shuOqilmoqda && ovozHolati === "oynamoqda" ? "⏸️"
                      : shuOqilmoqda && ovozHolati === "pauzada" ? "▶️"
                      : "🔊"}
                  </button>
                  {shuOqilmoqda && (ovozHolati === "oynamoqda" || ovozHolati === "pauzada") && (
                    <button onClick={() => setOvozTezlikOchiq((o) => !o)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                      {ovozTezligi}x
                    </button>
                  )}
                </div>
                {shuOqilmoqda && ovozTezlikOchiq && (ovozHolati === "oynamoqda" || ovozHolati === "pauzada") && (
                  <div className="flex gap-1 rounded-full px-1.5 py-1" style={{ backgroundColor: "#F7F5F0" }}>
                    {[0.75, 1, 1.25, 1.5, 2].map((t) => (
                      <button key={t} onClick={() => { ovozTezliginiOzgartir(t); setOvozTezlikOchiq(false); }}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={t === ovozTezligi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { color: "#5A5648" }}>
                        {t}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </h2>

        {yozuvli ? (
          <div className="mb-4">
            <input type="text" value={javobBerilgan ? (javoblar[s.id] || "") : (yozibJavob[s.id] || "")}
              onChange={(e) => setYozibJavob((prev) => ({ ...prev, [s.id]: e.target.value }))}
              disabled={javobBerilgan || javobKutilmoqda}
              onKeyDown={(e) => { if (e.key === "Enter" && !javobBerilgan && !javobKutilmoqda && (yozibJavob[s.id] || "").trim()) javobBerVaTekshir(s.id, yozibJavob[s.id].trim()); }}
              placeholder="Javobingizni yozing..."
              className="w-full px-4 py-3.5 rounded-xl border text-sm mb-3"
              style={javobBerilgan
                ? { borderColor: joriyNatija.togrimi ? "#639922" : "#E24B4A", backgroundColor: joriyNatija.togrimi ? "#EAF3DE" : "#FCEBEB" }
                : { borderColor: "#E5E1D8" }} />
            {!javobBerilgan && (
              <button onClick={() => (yozibJavob[s.id] || "").trim() && javobBerVaTekshir(s.id, yozibJavob[s.id].trim())}
                disabled={javobKutilmoqda || !(yozibJavob[s.id] || "").trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{ backgroundColor: "#1B4B7A", opacity: !javobKutilmoqda && (yozibJavob[s.id] || "").trim() ? 1 : 0.5 }}>
                {javobKutilmoqda ? "Tekshirilmoqda..." : "Javobni yuborish"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 mb-4">
            {variantlar.map(([harf, matn]) => (
              <button key={harf} onClick={() => !javobBerilgan && !javobKutilmoqda && javobBerVaTekshir(s.id, harf)} disabled={javobBerilgan || javobKutilmoqda}
                className="w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3"
                style={variantRangi(harf)}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    backgroundColor: javobBerilgan
                      ? (harf === joriyNatija.togri_javob ? "#639922" : harf === javoblar[s.id] ? "#E24B4A" : "#F1EFE8")
                      : (javoblar[s.id] === harf ? "#1B4B7A" : "#F1EFE8"),
                    color: (javobBerilgan && (harf === joriyNatija.togri_javob || harf === javoblar[s.id])) || (!javobBerilgan && javoblar[s.id] === harf)
                      ? "#FFFFFF" : "#5A5648",
                  }}>
                  {harf}
                </span>
                <span className="text-sm" style={{ color: "#2B2B2B" }}><Matn matn={matn} latex={s.is_latex} /></span>
              </button>
            ))}
          </div>
        )}

        {javobBerilgan && (
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: joriyNatija.togrimi ? "#EAF3DE" : "#FCEBEB" }}>
            {joriyNatija.togrimi ? (
              <p className="text-sm font-semibold" style={{ color: "#3B6D11" }}>✓ To'g'ri!</p>
            ) : (
              <AralashMatn matn={`✗ Noto'g'ri — to'g'ri javob: ${joriyNatija.togri_javob}`} className="text-sm font-semibold" style={{ color: "#A32D2D" }} />
            )}
            {joriyNatija.tushuntirish && (
              <AralashMatn matn={joriyNatija.tushuntirish} className="text-sm mt-1" style={{ color: joriyNatija.togrimi ? "#3B6D11" : "#A32D2D" }} />
            )}
          </div>
        )}

        {javobBerilgan ? (
          <button onClick={keyingiSavolga} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
            {(oxirgi ? "Yakunlash" : "Keyingi savol")}{avtoQoldi ? ` (${avtoQoldi})` : ""}
          </button>
        ) : (
          <p className="text-center text-xs" style={{ color: "#B0AA98" }}>
            {javobKutilmoqda ? "Javob tekshirilmoqda..." : "Javobni tanlang"}
          </p>
        )}

        {toxtatishModali && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
              <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>⏹ Testni to'xtatasizmi?</p>
              <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
                Hozirgacha javob bergan {Object.keys(javoblar).length} ta savolingiz saqlanadi, qolganlari javobsiz hisoblanadi.
              </p>
              <div className="flex gap-2.5">
                <button onClick={() => setToxtatishModali(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                  Davom etish
                </button>
                <button onClick={toxtatish}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D" }}>
                  Ha, to'xtatish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (holat === "savollar") {
    // testRejimi === "hammasi" — hammasi bitta uzun sahifada, natija
    // FAQAT yakunlaganda ma'lum bo'ladi (imtihon uslubi).
    const jamiJavoblangan = Object.keys(javoblar).length;

    return (
      <div className="pb-24">
        {/* Yopishqoq yuqori panel — umumiy vaqt, hisob, o'tkazish/to'xtatish */}
        <div className="sticky top-0 z-20 px-5 pt-4 pb-3" style={{ backgroundColor: "#F7F5F0", borderBottom: "1px solid #E5E1D8" }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium" style={{ color: "#8A8578" }}>{jamiJavoblangan} / {savollar.length} javob berildi</span>
            <div className="flex items-center gap-2">
              {umumiyVaqt !== null && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: umumiyVaqt <= 30 ? "#FCEBEB" : "#F1EFE8", color: umumiyVaqt <= 30 ? "#A32D2D" : "#5A5648" }}>
                  ⏱ {Math.floor(umumiyVaqt / 60)}:{String(umumiyVaqt % 60).padStart(2, "0")}
                </span>
              )}
              <button onClick={() => setToxtatishModali(true)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F1EFE8", color: "#A32D2D" }}>
                ⏹ To'xtatish
              </button>
            </div>
          </div>
          {/* Savol raqamlari — endi bir qatorga sig'masa, PASTGA (yangi qatorga)
              tushadi, gorizontal aylantirish shart emas, hammasi darhol ko'rinadi. */}
          <div className="flex gap-1.5 flex-wrap">
            {savollar.map((s, i) => {
              const javobBormi = javoblar[s.id] !== undefined;
              return (
                <button key={s.id} onClick={() => raqamgaOt(i)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2"
                  style={javobBormi
                    ? { borderColor: "#C89B3C", backgroundColor: "#FDF3E0", color: "#8A5A1C" }
                    : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", color: "#5A5648" }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-5 space-y-5">
          {savollar.map((s, i) => {
            const yozuvli = s.question_type === "write_answer";
            const variantlar = [["A", s.option_a], ["B", s.option_b], ["C", s.option_c], ["D", s.option_d]];
            const javobBerilgan = javoblar[s.id] !== undefined;

            return (
              <div key={s.id} ref={(el) => { savolReflari.current[i] = el; }}
                className="rounded-2xl p-4 bg-white border" style={{
                  borderColor: javobBerilgan ? "#F5DFA3" : "#E5E1D8",
                  contentVisibility: "auto",
                  containIntrinsicSize: "520px",
                }}>
                <p className="text-xs font-medium mb-3" style={{ color: "#8A8578" }}>{i + 1}-savol</p>

                {s.rasm_id && (haqiqiyRasmKodimi(s.rasm_id)
                  ? <SavolRasmi rasmId={s.rasm_id} />
                  : <SavolFormulasi ifoda={s.rasm_id} />)}

                <h2 className="text-lg font-semibold mb-4 flex items-start gap-2" style={{ color: "#2B2B2B" }}>
                  <span className="flex-1"><Matn matn={s.question} latex={s.is_latex} /></span>
                  {(() => {
                    const ovozMatni = yozuvli ? s.question : `${s.question}. A) ${s.option_a}. B) ${s.option_b}. C) ${s.option_c}. D) ${s.option_d}`;
                    const shuOqilmoqda = ovozKorinadiganMatnRef.current === String(ovozMatni || "").replace(/\s+/g, " ").trim();
                    return (
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <button onClick={() => ovozniOqi(ovozMatni)}
                            aria-busy={shuOqilmoqda && ovozHolati === "yuklanmoqda"}
                            aria-label={shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "Ovoz tayyorlanmoqda" : "Ovoz chiqarib o'qish"}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "#FFF3CD" : "#EAF1F7",
                              color: shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "#8A5A1C" : "#1B4B7A",
                            }}
                            title={shuOqilmoqda && ovozHolati === "yuklanmoqda" ? "Ovoz tayyorlanmoqda..." : "Ovoz chiqarib o'qish"}>
                            {shuOqilmoqda && ovozHolati === "yuklanmoqda" ? <Loader2 size={16} className="animate-spin" />
                              : shuOqilmoqda && ovozHolati === "oynamoqda" ? "⏸️"
                              : shuOqilmoqda && ovozHolati === "pauzada" ? "▶️"
                              : "🔊"}
                          </button>
                          {shuOqilmoqda && (ovozHolati === "oynamoqda" || ovozHolati === "pauzada") && (
                            <button onClick={() => setOvozTezlikOchiq((o) => !o)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                              {ovozTezligi}x
                            </button>
                          )}
                        </div>
                        {shuOqilmoqda && ovozTezlikOchiq && (ovozHolati === "oynamoqda" || ovozHolati === "pauzada") && (
                          <div className="flex gap-1 rounded-full px-1.5 py-1" style={{ backgroundColor: "#F7F5F0" }}>
                            {[0.75, 1, 1.25, 1.5, 2].map((t) => (
                              <button key={t} onClick={() => { ovozTezliginiOzgartir(t); setOvozTezlikOchiq(false); }}
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={t === ovozTezligi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { color: "#5A5648" }}>
                                {t}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </h2>

                {yozuvli ? (
                  <div>
                    <input type="text" value={javoblar[s.id] || (yozibJavob[s.id] || "")}
                      onChange={(e) => setYozibJavob((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      disabled={javobBerilgan}
                      onKeyDown={(e) => { if (e.key === "Enter" && !javobBerilgan && (yozibJavob[s.id] || "").trim()) javobYoz(s.id, yozibJavob[s.id].trim()); }}
                      placeholder="Javobingizni yozing..."
                      className="w-full px-4 py-3.5 rounded-xl border text-sm mb-3"
                      style={javobBerilgan ? { borderColor: "#C89B3C", backgroundColor: "#FDF3E0" } : { borderColor: "#E5E1D8" }} />
                    {!javobBerilgan && (
                      <button onClick={() => (yozibJavob[s.id] || "").trim() && javobYoz(s.id, yozibJavob[s.id].trim())}
                        disabled={!(yozibJavob[s.id] || "").trim()}
                        className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                        style={{ backgroundColor: "#1B4B7A", opacity: (yozibJavob[s.id] || "").trim() ? 1 : 0.5 }}>
                        Javobni belgilash
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {variantlar.map(([harf, matn]) => (
                      <button key={harf} onClick={() => javobYoz(s.id, harf)}
                        className="w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3"
                        style={javoblar[s.id] === harf
                          ? { borderColor: "#C89B3C", backgroundColor: "#FDF3E0" }
                          : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{
                            backgroundColor: javoblar[s.id] === harf ? "#C89B3C" : "#F1EFE8",
                            color: javoblar[s.id] === harf ? "#FFFFFF" : "#5A5648",
                          }}>
                          {harf}
                        </span>
                        <span className="text-sm" style={{ color: "#2B2B2B" }}><Matn matn={matn} latex={s.is_latex} /></span>
                      </button>
                    ))}
                  </div>
                )}

                {!javobBerilgan && (
                  <button onClick={() => savolniOtkazib(i)} className="w-full text-center text-xs font-medium mt-3" style={{ color: "#8A8578" }}>
                    O'tkazib yuborish →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Kichik, burchakdagi "Yakunlash" tugmasi — endi butun kenglikni
            egallamaydi, va bosilganda tasdiqlash so'raladi. */}
        <div className="fixed bottom-20 right-5 z-20">
          <button onClick={() => setYakunlashTasdiqi(true)}
            className="rounded-full px-5 py-3 font-semibold text-white text-sm shadow-lg flex items-center gap-1.5"
            style={{ backgroundColor: "#1B4B7A" }}>
            ✓ Yakunlash
          </button>
        </div>

        {toxtatishModali && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
              <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>⏹ Testni to'xtatasizmi?</p>
              <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
                Hozirgacha javob bergan {jamiJavoblangan} ta savolingiz saqlanadi, qolganlari javobsiz hisoblanadi.
              </p>
              <div className="flex gap-2.5">
                <button onClick={() => setToxtatishModali(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                  Davom etish
                </button>
                <button onClick={toxtatish}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D" }}>
                  Ha, to'xtatish
                </button>
              </div>
            </div>
          </div>
        )}

        {yakunlashTasdiqi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
              <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>✓ Testni yakunlaysizmi?</p>
              <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
                {jamiJavoblangan} / {savollar.length} savolga javob berdingiz.
                {jamiJavoblangan < savollar.length ? " Qolganlari javobsiz hisoblanadi." : ""}
              </p>
              <div className="flex gap-2.5">
                <button onClick={() => setYakunlashTasdiqi(false)}
                  className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                  Davom etish
                </button>
                <button onClick={() => { setYakunlashTasdiqi(false); yakunla(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
                  Ha, yakunlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // holat === "mavzular"
  // Sinf ko'rsatilmasa (admin) va hali sinf tanlanmagan bo'lsa — avval sinflar ro'yxati.
  if ((!sinf || boshqaSinflarRejimi) && !tanlanganSinf) {
    return (
      <div className="px-5 pt-6 pb-4">
        {faolTuri === "togarak" && (
          <button onClick={() => { setFaolTuri("oddiy"); setBoshqaSinflarRejimi(false); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>
            {sinf ? "← O'z sinfimga qaytish" : "← Oddiy sinflarga qaytish"}
          </button>
        )}
        <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>
          {faolTuri === "togarak" ? "Boshqa sinflar (to'garak)" : "Test yechish"}
        </h1>
        {xato && <p className="text-sm mb-4" style={{ color: "#B0553A" }}>{xato}</p>}
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : sinflarRoyxati.length === 0 && faolTuri === "togarak" ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Hozircha to'garak sinflari mavjud emas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sinflarRoyxati.map((s) => {
              const jamiMavzu = s.fanlar.reduce((sum, f) => sum + f.mavzular.length, 0);
              return (
                <button key={s.sinf} onClick={() => setTanlanganSinf(s.sinf)}
                  className="rounded-2xl p-5 text-center bg-white border"
                  style={{ borderColor: "#E5E1D8" }}>
                  <p className="text-xl font-bold mb-1" style={{ color: "#1B4B7A" }}>
                    {faolTuri === "togarak" ? s.sinf : `${s.sinf}-sinf`}
                  </p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{s.fanlar.length} fan · {jamiMavzu} mavzu</p>
                </button>
              );
            })}
            {faolTuri === "oddiy" && !sinf && (
              <button onClick={() => setFaolTuri("togarak")}
                className="rounded-2xl p-5 text-center bg-white border-2 border-dashed"
                style={{ borderColor: "#C4BFAF" }}>
                <p className="text-xl mb-1">📚</p>
                <p className="text-sm font-semibold" style={{ color: "#5A5648" }}>Boshqa sinflar</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>to'garak guruhlari</p>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Sinf tanlangan (yoki o'quvchining o'z sinfi) — endi shu sinfning fanlari va mavzulari
  const sinfMalumoti = joriySinfMalumoti;
  return (
    <div className="px-5 pt-6" style={{ paddingBottom: aralashRejim && tanlanganKodlar.length > 0 ? "84px" : "16px" }}>
      {(!sinf || boshqaSinflarRejimi) && (
        <button onClick={() => { setTanlanganSinf(null); setOchiqFan(null); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>
          ← Sinflar
        </button>
      )}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>
          {sinfMalumoti ? (faolTuri === "togarak" ? `${sinfMalumoti.sinf} testlari` : `${sinfMalumoti.sinf}-sinf testlari`) : "Test yechish"}
        </h1>
        <button onClick={() => { setAralashRejim(!aralashRejim); setTanlanganKodlar([]); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={aralashRejim
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
          {aralashRejim ? "✕ Aralash rejimi" : "🔀 Bir nechta mavzu"}
        </button>
      </div>
      {sinf && !boshqaSinflarRejimi && (
        <button onClick={() => { setBoshqaSinflarRejimi(true); setFaolTuri("togarak"); setTanlanganSinf(null); }}
          className="text-xs font-medium mb-4" style={{ color: "#1B4B7A" }}>
          📚 Boshqa (to'garak) guruhlarni ko'rish →
        </button>
      )}
      {xato && <p className="text-sm mb-4" style={{ color: "#B0553A" }}>{xato}</p>}
      {aralashRejim && (
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between" style={{ backgroundColor: "#EAF1F7" }}>
          <p className="text-xs font-medium" style={{ color: "#1B4B7A" }}>
            👆 Fanni oching va xohlagan mavzularni belgilang — bir nechta fandan ham bo'lishi mumkin.
          </p>
          <span className="text-sm font-bold shrink-0 ml-2" style={{ color: "#1B4B7A" }}>{tanlanganKodlar.length}</span>
        </div>
      )}
      {!sinfMalumoti || sinfMalumoti.fanlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Bu sinfda hozircha test mavjud emas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sinfMalumoti.fanlar.map((fan) => {
            const ochiq = ochiqFan === fan.qisqa;
            return (
              <div key={fan.qisqa} className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: "#E5E1D8" }}>
                <button onClick={() => setOchiqFan(ochiq ? null : fan.qisqa)} className="w-full flex items-center justify-between p-4">
                  <span className="font-semibold text-sm" style={{ color: "#2B2B2B" }}>{fan.nom}</span>
                  {ochiq ? <ChevronDown size={18} style={{ color: "#8A8578" }} /> : <ChevronRight size={18} style={{ color: "#8A8578" }} />}
                </button>
                {ochiq && (
                  <MavzuRoyxati fan={fan} aralashRejim={aralashRejim} tanlanganKodlar={tanlanganKodlar}
                    onToggle={aralashToggle} onTanla={mavzuBoslandi} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {aralashRejim && tanlanganKodlar.length > 0 && (
        <div className="fixed bottom-16 inset-x-0 z-20 px-5 pb-3">
          <div className="max-w-md mx-auto">
            <button onClick={aralashTestBoshlandi}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm shadow-lg"
              style={{ backgroundColor: "#1B4B7A" }}>
              🚀 Aralash test boshlash ({tanlanganKodlar.length} mavzu tanlandi)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UchXilTanlov({ nom, qiymat, onOzgar, haNomi, yoqNomi }) {
  const variantlar = [[null, "Barchasi"], [true, haNomi], [false, yoqNomi]];
  return (
    <div className="flex items-center justify-between mb-3 last:mb-0">
      <span className="text-xs font-medium" style={{ color: "#5A5648" }}>{nom}</span>
      <div className="flex gap-1 p-0.5 rounded-full" style={{ backgroundColor: "#F7F5F0" }}>
        {variantlar.map(([qiym, nomi]) => (
          <button key={String(qiym)} type="button" onClick={() => onOzgar(qiym)}
            className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={qiymat === qiym
              ? { backgroundColor: "#1B4B7A", color: "#fff" }
              : { backgroundColor: "transparent", color: "#5A5648" }}>
            {nomi}
          </button>
        ))}
      </div>
    </div>
  );
}

function MavzuRoyxati({ fan, aralashRejim, tanlanganKodlar, onToggle, onTanla }) {
  const [sahifa, setSahifa] = useState(0);
  const JAMI_SAHIFA = Math.ceil(fan.mavzular.length / 10) || 1;
  const korinadigan = fan.mavzular.slice(sahifa * 10, sahifa * 10 + 10);
  const shuFandaTanlangan = tanlanganKodlar.filter((k) => fan.mavzular.some((m) => m.nomi === k.nomi)).length;

  return (
    <div className="px-4 pb-4 space-y-2">
      {aralashRejim && shuFandaTanlangan > 0 && (
        <p className="text-xs font-semibold px-1 pb-1" style={{ color: "#1B4B7A" }}>
          ✓ Bu fandan {shuFandaTanlangan} ta mavzu tanlandi
        </p>
      )}
      {korinadigan.map((m) => {
        const tanlanganmi = tanlanganKodlar.some((k) => k.nomi === m.nomi);
        return (
          <button key={m.nomi}
            onClick={() => aralashRejim ? onToggle(m) : onTanla(fan, m)}
            className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border-2"
            style={{
              backgroundColor: aralashRejim && tanlanganmi ? "#EAF1F7" : "#F7F5F0",
              borderColor: aralashRejim && tanlanganmi ? "#1B4B7A" : "transparent",
            }}>
            <span className="flex items-center gap-2.5">
              {aralashRejim && (
                <span className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tanlanganmi ? "#1B4B7A" : "#FFFFFF", border: `1.5px solid ${tanlanganmi ? "#1B4B7A" : "#C4BFAF"}` }}>
                  {tanlanganmi && <span className="text-white text-xs">✓</span>}
                </span>
              )}
              <span className="text-sm text-left" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
            </span>
            <span className="text-xs shrink-0" style={{ color: "#8A8578" }}>{m.savol_soni} ta</span>
          </button>
        );
      })}
      {JAMI_SAHIFA > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button onClick={() => setSahifa((s) => Math.max(0, s - 1))} disabled={sahifa === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa === 0 ? "#C4BFAF" : "#5A5648" }}>
            ← Oldingi
          </button>
          <span className="text-xs" style={{ color: "#8A8578" }}>{sahifa + 1} / {JAMI_SAHIFA}</span>
          <button onClick={() => setSahifa((s) => Math.min(JAMI_SAHIFA - 1, s + 1))} disabled={sahifa >= JAMI_SAHIFA - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa >= JAMI_SAHIFA - 1 ? "#C4BFAF" : "#5A5648" }}>
            Keyingi →
          </button>
        </div>
      )}
    </div>
  );
}


