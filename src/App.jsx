// SAMTM V18.59 — Shablondagi o‘qituvchi fanlari va metod kuni hisoboti.
// SAMTM V18.58 — Sinf-kun qoidasi bitta kunlik va aniq hisobotli.
// SAMTM V18.57 — Xavfsiz maktab dashboard APIlariga ulandi.
// SAMTM V18.56 — moslashuvchan parallel/aniq sinf kun bloklari.
// SAMTM V18.54 — Kalendar autosave, ommaviy o‘qituvchi sozlamalari va aqlli xodim shabloni.
// SAMTM V18.52 — Puxta aqlli jadval va to‘liq ekranli maktab workspace.
// SAMTM V18.49 — blank sahifa tuzatildi: importlar endi komment ichida qolmaydi.
// SAMTM V18.48 — Maktab ID yo‘qolib qolishi va admin preview ko‘rinmasligi tuzatildi.
// SAMTM V18.47 — Admin maktabni turli rollar sifatida READ-ONLY ko‘ra oladi.
// SAMTM V18.46 — Kundalik baho eslatmasi o‘qituvchi tomonidan YOQ/O‘CHIQ qilinadi.
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import katex from "katex";
import { HUDUDLAR, VILOYATLAR } from "./hududlar.js";
import {
  CLUB_STUDENT_LIMIT,
  SECOND_CLUB_PRICE_UZS,
  apiErrorMessage,
  formatTopicTitle,
  freeClubAvailable,
  groupTypeLabel,
  normalizedClubCapacity,
  topicName,
} from "./teacherRules.js";
import {
  ORGANIZATION_ACTIVATION_PRICE_UZS,
  ORGANIZATION_TRIAL_DAYS,
  ORGANIZATION_TYPES,
  buildAdminWalletCreditPayload,
  buildActivationPayload,
  buildTrialStartPayload,
  formatTrialEnd,
  formatUzs,
  makeOrganizationIdempotencyKey,
  organizationCanActivate,
  organizationIsReadOnly,
  organizationToLegacyMembership,
  organizationTrialErrorMessage,
  organizationTrialState,
  organizationTypeMeta,
} from "./organizationTrialRules.js";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  ChevronRight, ChevronDown, ChevronLeft, TrendingUp, BarChart3, Bell, User,
  Loader2, WifiOff, KeyRound, UserPlus, PencilLine, Users, FileSpreadsheet, Heart, BookOpen,
  Flame, Star, CalendarCheck, Trophy, Building2, Settings, Video, X, RotateCcw, Send, Mic, Trash2,
  Wallet, Folder, Calendar, Brain, GraduationCap, ClipboardList, Bot, AlertTriangle, Search, Baby,
  UserRoundPlus,
} from "lucide-react";

const lazyAnalytics = (exportName) =>
  React.lazy(() =>
    import("./Analytics.jsx").then((module) => ({
      default: module[exportName],
    })),
  );
const AdminStatisticsTab = lazyAnalytics("AdminStatisticsTab");
const StudentAnalyticsDashboard = lazyAnalytics("StudentAnalyticsDashboard");
const StudentLearningPathDashboard = lazyAnalytics("StudentLearningPathDashboard");
const TeacherAnalyticsPanel = lazyAnalytics("TeacherAnalyticsPanel");
const LazyTestTab = React.lazy(() => import("./TestTab.jsx"));
const lazyAdminTestTool = (exportName) =>
  React.lazy(() =>
    import("./AdminTestTools.jsx").then((module) => ({ default: module[exportName] })),
  );
const LazyTopikMavzularTab = lazyAdminTestTool("TopikMavzularTab");
const LazyModeratsiyaTab = lazyAdminTestTool("ModeratsiyaTab");
const LazyKitobMiyaBolimi = lazyAdminTestTool("KitobMiyaBolimi");
const LazyTestShablonBolimi = lazyAdminTestTool("TestShablonBolimi");
const LazyTopikShablonBolimi = lazyAdminTestTool("TopikShablonBolimi");
const LazyTushuntirishBolimi = lazyAdminTestTool("TushuntirishBolimi");

function OgirBolimYuklanmoqda() {
  return (
    <div className="px-5 py-12 text-center" role="status" aria-live="polite">
      <Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} />
      <p className="text-xs mt-2" style={{ color: "#8A8578" }}>Bo'lim yuklanmoqda...</p>
    </div>
  );
}

function lazyPanel(Component, props) {
  return (
    <React.Suspense fallback={<OgirBolimYuklanmoqda />}>
      <Component {...props} />
    </React.Suspense>
  );
}

function TestTab(props) { return lazyPanel(LazyTestTab, props); }
function TopikMavzularTab(props) { return lazyPanel(LazyTopikMavzularTab, props); }
function ModeratsiyaTab(props) { return lazyPanel(LazyModeratsiyaTab, props); }
function KitobMiyaBolimi(props) { return lazyPanel(LazyKitobMiyaBolimi, props); }
function TestShablonBolimi(props) { return lazyPanel(LazyTestShablonBolimi, props); }
function TopikShablonBolimi(props) { return lazyPanel(LazyTopikShablonBolimi, props); }
function TushuntirishBolimi(props) { return lazyPanel(LazyTushuntirishBolimi, props); }
const AdminInstitutionSecurity = React.lazy(() => import("./AdminInstitutionSecurity.jsx"));
const AdminSchoolWizard = React.lazy(() => import("./AdminSchoolWizard.jsx"));
const KindergartenWorkspace = React.lazy(
  () => import("./kindergarten/KindergartenWorkspace.jsx"),
);
const SchoolWorkspace = React.lazy(
  () => import("./school/SchoolWorkspace.jsx"),
);
const LearningCenterWorkspace = React.lazy(
  () => import("./center/LearningCenterWorkspace.jsx"),
);
const InstituteWorkspace = React.lazy(
  () => import("./institute/InstituteWorkspace.jsx"),
);

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://talimplatformasi-production.up.railway.app";

// ═══════════════════════════════════════════════════════════
// DIZAYN TIZIMI — rol/jins/fanga qarab shaxsiylashtirilgan rang
// ═══════════════════════════════════════════════════════════

// O'quvchi uchun — jinsiga qarab ILIQ, ZAMONAVIY palitra (ikkalasi ham
// bir xil darajada "jiddiy"/chiroyli — biri ikkinchisidan kamroq
// ko'rinmasin degan niyatda tanlangan).
const QIZ_RANGI = "#A8527A";   // iliq to'q pushti-binafsha (mavj/berry)
const OGIL_RANGI = "#2D6E8B";  // chuqur ko'k-firuza

// Ota-ona uchun — issiq, "oilaviy" tuyg'u beruvchi neytral rang.
const OTA_ONA_RANGI = "#6E8B4A"; // iliq zaytun-yashil

// O'qituvchi uchun — o'zi o'qitadigan FANGA mos rang. Fan nomidan
// barqaror (deterministik) rang hisoblanadi — shu sabab yangi fan
// qo'shilsa ham, doim BIR XIL rangni oladi, qo'lda ro'yxat yuritish
// shart emas.
const FAN_RANGLAR_KENGAYTIRILGAN = [
  "#C89B3C", "#2D8B8B", "#8B5FBF", "#B0553A", "#4A7C9E", "#7C9E4A",
  "#A8527A", "#5C7F9E", "#9E7C4A", "#4A9E8C", "#9E4A6E", "#6E9E4A", "#2D6E8B",
];
function fanRangiOl(fanNomi) {
  if (!fanNomi) return "#1B4B7A";
  let hash = 0;
  for (let i = 0; i < fanNomi.length; i++) hash = fanNomi.charCodeAt(i) + ((hash << 5) - hash);
  return FAN_RANGLAR_KENGAYTIRILGAN[Math.abs(hash) % FAN_RANGLAR_KENGAYTIRILGAN.length];
}

// Rol + jins + (o'qituvchi bo'lsa) fanga qarab YAGONA "joriy rang"ni
// hisoblaydi — Kabinet shundan foydalanib butun ilovaga shaxsiylashtirilgan
// rang beradi (pastki menyu, Bilim boshi, Profil rasmi va h.k.).
function joriyRangniHisobla(foydalanuvchi, korinishRoli) {
  if (korinishRoli === "oquvchi") {
    if (foydalanuvchi?.jins === "qiz") return QIZ_RANGI;
    if (foydalanuvchi?.jins === "ogil") return OGIL_RANGI;
    return "#1B4B7A";
  }
  if (korinishRoli === "oqituvchi") return fanRangiOl(foydalanuvchi?.oqituvchi_fani);
  if (korinishRoli === "ota-ona") return OTA_ONA_RANGI;
  return "#1B4B7A"; // admin va standart
}

// O'qituvchi profilida tanlash uchun — BARCHA maktab fanlari (mavjud
// test-kontentdan qat'i nazar, chunki o'qituvchi o'zi qaysi fanni
// o'qitishini tanlashi kerak, hali test yaratilmagan fan bo'lsa ham).
const BARCHA_MAKTAB_FANLARI = [
  "Matematika", "Algebra", "Geometriya", "Ona tili", "Adabiyot",
  "Ingliz tili", "Rus tili", "Nemis tili", "Fransuz tili",
  "Tarix", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya",
  "Biologiya", "Fizika", "Kimyo", "Informatika", "Chizmachilik",
  "Tasviriy san'at", "Musiqa", "Jismoniy tarbiya", "Astronomiya",
  "Huquq", "Iqtisodiyot asoslari", "Milliy g'oya va ma'naviyat asoslari",
  "Texnologiya", "Ona Vatan", "Atrofimizdagi olam", "O'qish savodxonligi",
];


// Haqiqiy rasm kodi ("11-04-1-01-01-03-001-1" kabi — sinf-fan-chorak-bob-
// bolim-mavzu-ketma_ket-rasm_raqami, 7-9 ta FAQAT-RAQAM bo'lak, tire bilan
// ajratilgan) bilan LaTeX ifodani ("273\div 7+8", "4{,}(4)" kabi — harflar,
// qavslar, matematik belgilar bor) ISHONCHLI ajratadi. Bu farqni bilish
// MUHIM: image_url ba'zan haqiqiy rasm o'rniga ko'rsatiladigan matematik
// ifodani saqlaydi (rasm chizib bo'lmaydigan holatlarda) — bunday holda
// uni RASM DEB SO'RAMASDAN, KaTeX bilan FORMULA sifatida chizish kerak.
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

function darajaRang(foiz) {
  if (foiz >= 85) return "#C89B3C";
  if (foiz >= 65) return "#2D8B8B";
  if (foiz >= 45) return "#B0553A";
  return "#8A8578";
}
function darajaNom(foiz) {
  if (foiz >= 85) return "Mukammal";
  if (foiz >= 65) return "Yaxshi";
  if (foiz >= 45) return "O'rtacha";
  return "E'tibor kerak";
}

function Logotip({ compact = false, light = false }) {
  return (
    <div
      className={`${compact ? "w-11 h-11 rounded-xl" : "w-14 h-14 rounded-2xl mx-auto mb-4"} grid grid-cols-2 grid-rows-2 gap-0.5 p-1.5`}
      style={{
        background: light
          ? "linear-gradient(145deg, #FFFFFF, #BFECE7)"
          : "linear-gradient(145deg, #123F61, #08283F)",
        boxShadow: light ? "0 8px 22px rgba(0,0,0,.18)" : "0 10px 28px rgba(8,40,63,.18)",
      }}
    >
      <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
    </div>
  );
}

function Qobiq({ children }) {
  return (
    <div className="premium-auth-page">
      <div className="premium-auth-glow premium-auth-glow-one" />
      <div className="premium-auth-glow premium-auth-glow-two" />
      <div className="premium-auth-card">
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 1) KIRISH — Google tugmasi, yoki telefon raqami orqali
// ═══════════════════════════════════════════════════════════
function TelefonKirish({ onOrtga, onKirdi }) {
  const [bosqich, setBosqich] = useState("telefon"); // "telefon" | "kod" | "royxat"
  const [telefon, setTelefon] = useState("");
  const [kod, setKod] = useState("");
  const [usul, setUsul] = useState(null); // "telegram" | "sms" — kod qanday yuborilgani
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [ism, setIsm] = useState("");
  const [rol, setRol] = useState("oquvchi");
  const [sinf, setSinf] = useState("");

  const kodSora = async () => {
    if (!telefon.trim()) { setXato("Telefon raqamini kiriting"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/telefon_kod_sorash`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setUsul(d.usul);
      setBosqich("kod");
    } catch (e) { setXato(e.message); } finally { setYuklanmoqda(false); }
  };

  const kodTasdiqla = async () => {
    if (!kod.trim()) { setXato("Kodni kiriting"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/telefon_kod_tasdiqla`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefon: telefon.trim(), kod: kod.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      if (d.holat === "kirdi") onKirdi(d.token);
      else setBosqich("royxat");
    } catch (e) { setXato(e.message); } finally { setYuklanmoqda(false); }
  };

  const royxatdanOt = async () => {
    if (!ism.trim()) { setXato("Ismingizni kiriting"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/telefon_royxat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefon: telefon.trim(), kod: kod.trim(), ism: ism.trim(), rol,
          sinf: rol === "oquvchi" ? sinf.trim() : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      onKirdi(d.token);
    } catch (e) { setXato(e.message); } finally { setYuklanmoqda(false); }
  };

  return (
    <Qobiq>
      <button onClick={onOrtga} className="flex items-center gap-1.5 mb-5 text-sm" style={{ color: "#8A8578" }}>
        <ChevronLeft size={16} /> Ortga
      </button>

      {bosqich === "telefon" && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>Telefon raqamingiz</h2>
          <p className="text-xs mb-4" style={{ color: "#8A8578" }}>Tasdiqlash kodi yuboramiz (Telegram orqali, bepul — yoki SMS orqali)</p>
          <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="+998 90 123 45 67"
            className="w-full px-4 py-3 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} autoFocus />
          {xato && <p className="text-xs mb-3" style={{ color: "#A32D2D" }}>{xato}</p>}
          <button onClick={kodSora} disabled={yuklanmoqda}
            className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#1B4B7A" }}>
            {yuklanmoqda ? <Loader2 size={18} className="animate-spin" /> : "Kod yuborish"}
          </button>
        </>
      )}

      {bosqich === "kod" && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>Tasdiqlash kodi</h2>
          <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
            {usul === "telegram" ? "Kod Telegram botingizga yuborildi." : "Kod SMS orqali yuborildi."} {telefon}
          </p>
          <input type="text" inputMode="numeric" value={kod} onChange={(e) => setKod(e.target.value)} placeholder="000000"
            className="w-full px-4 py-3 rounded-xl border text-center text-lg tracking-widest mb-3" style={{ borderColor: "#E5E1D8" }} autoFocus />
          {xato && <p className="text-xs mb-3" style={{ color: "#A32D2D" }}>{xato}</p>}
          <button onClick={kodTasdiqla} disabled={yuklanmoqda}
            className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#1B4B7A" }}>
            {yuklanmoqda ? <Loader2 size={18} className="animate-spin" /> : "Tasdiqlash"}
          </button>
        </>
      )}

      {bosqich === "royxat" && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>Siz haqingizda</h2>
          <p className="text-xs mb-4" style={{ color: "#8A8578" }}>Telefon tasdiqlandi — endi ismingiz va rolingizni ayting</p>
          <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)} placeholder="F.I.Sh"
            className="w-full px-4 py-3 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} autoFocus />
          <div className="flex rounded-full p-1 gap-0.5 mb-3" style={{ backgroundColor: "#F0EDE5" }}>
            {[["oquvchi", "O'quvchi"], ["ota-ona", "Ota-ona"], ["oqituvchi", "O'qituvchi"]].map(([qiymat, nomi]) => (
              <button key={qiymat} onClick={() => setRol(qiymat)} className="flex-1 py-2 rounded-full text-xs font-semibold"
                style={rol === qiymat ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
                {nomi}
              </button>
            ))}
          </div>
          {rol === "oquvchi" && (
            <input type="text" value={sinf} onChange={(e) => setSinf(e.target.value)} placeholder="Sinf (masalan: 5)"
              className="w-full px-4 py-3 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          )}
          {xato && <p className="text-xs mb-3" style={{ color: "#A32D2D" }}>{xato}</p>}
          <button onClick={royxatdanOt} disabled={yuklanmoqda}
            className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#1B4B7A" }}>
            {yuklanmoqda ? <Loader2 size={18} className="animate-spin" /> : "Yakunlash"}
          </button>
        </>
      )}
    </Qobiq>
  );
}

function LoginEkrani() {
  return (
    <div className="premium-login">
      <section className="premium-login-story">
        <div className="premium-login-brand">
          <Logotip compact light />
          <div>
            <strong>TA'LIM AI</strong>
            <span>Yagona ta'lim ekotizimi</span>
          </div>
        </div>

        <div className="premium-login-copy">
          <span className="premium-eyebrow">MAKTABDAN INDIVIDUAL RIVOJGACHA</span>
          <h1>Har bir o‘quvchining bilim yo‘li bitta joyda.</h1>
          <p>
            Maktab, o‘quv markazi, to‘garak va AI dars natijalarini
            aralashtirmasdan kuzating. O‘quvchiga mos dars, ustozga aniq
            tahlil, ota-onaga tushunarli xulosa.
          </p>
          <div className="premium-login-features">
            <div>
              <span><BarChart3 size={18} /></span>
              <p><b>Ichma-ich analitika</b><small>Tizimdan aniq o‘quvchigacha</small></p>
            </div>
            <div>
              <span><Brain size={18} /></span>
              <p><b>AI pedagog</b><small>Bilimiga qarab o‘rgatadi</small></p>
            </div>
            <div>
              <span><Users size={18} /></span>
              <p><b>Barcha rollar bog‘langan</b><small>O‘quvchi, ustoz va ota-ona</small></p>
            </div>
          </div>
        </div>

        <div className="premium-login-foot">
          <span className="premium-live-dot" />
          Xavfsiz va uzluksiz ta’lim muhiti
        </div>
      </section>

      <section className="premium-login-action">
        <div className="premium-login-card">
          <div className="premium-mobile-brand">
            <Logotip compact />
            <div><b>TA'LIM AI</b><span>Yagona ta'lim ekotizimi</span></div>
          </div>
          <span className="premium-eyebrow">SHAXSIY KABINET</span>
          <h2>Xush kelibsiz</h2>
          <p className="premium-login-note">
            Davom etish uchun Google hisobingiz orqali xavfsiz kiring.
          </p>
          <button
            onClick={() => { window.location.href = `${API_BASE}/auth/google/login`; }}
            className="premium-google-button"
          >
            <span className="premium-google-mark">G</span>
            Google orqali kirish
            <ChevronRight size={18} />
          </button>
          <div className="premium-trust-row">
            <span>✓ Bitta profil</span>
            <span>✓ Barcha ta’lim muhiti</span>
          </div>
          <p className="premium-first-time">
            Birinchi marta kirsangiz, keyingi ekranda rolingiz va ta’lim
            muassasangizni tanlaysiz.
          </p>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2) ULASH — Google email topildi, lekin bot hisobiga ULANMAGAN
// ═══════════════════════════════════════════════════════════
function UlashEkrani({ email, ism, oauthGrant, onUlandi }) {
  const [rejim, setRejim] = useState(null); // null | 'kod' | 'royxat'
  const [kod, setKod] = useState("");
  const [ismInput, setIsmInput] = useState(ism || "");
  const [rol, setRol] = useState("oquvchi");
  const [sinf, setSinf] = useState("5");
  const [viloyat, setViloyat] = useState("");
  const [tuman, setTuman] = useState("");
  const [tugilganSana, setTugilganYil] = useState("");
  const [maktabRaqami, setMaktabRaqami] = useState("");
  const [xato, setXato] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [oxshashlar, setOxshashlar] = useState([]);

  useEffect(() => {
    if (rejim !== "royxat" || ismInput.trim().length < 3) { setOxshashlar([]); return; }
    const kechiktirish = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/ism_tekshir?ism=${encodeURIComponent(ismInput.trim())}`);
        const data = await res.json();
        setOxshashlar(data.oxshash || []);
      } catch { /* jimgina o'tkazamiz - bu faqat ogohlantirish, ro'yxatdan o'tishni to'xtatmasin */ }
    }, 500);
    return () => clearTimeout(kechiktirish);
  }, [ismInput, rejim]);

  const kodBilan = async () => {
    if (!kod.trim()) return;
    setXato(""); setYuklanmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/auth/ulash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kod: kod.trim(), oauth_grant: oauthGrant }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onUlandi(data.token);
    } catch (e) {
      setXato(e.message === "Failed to fetch" ? "Serverga ulanib bo'lmadi" : e.message);
    } finally { setYuklanmoqda(false); }
  };

  const royxatBilan = async () => {
    if (!ismInput.trim()) return;
    setXato(""); setYuklanmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/auth/royxat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, ism: ismInput.trim(), rol, oauth_grant: oauthGrant,
          sinf: rol === "oquvchi" ? sinf : undefined,
          region: viloyat || undefined,
          district: tuman || undefined,
          tugilgan_sana: tugilganSana || undefined,
          maktab_raqami: rol === "oquvchi" && maktabRaqami ? maktabRaqami : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onUlandi(data.token);
    } catch (e) {
      setXato(e.message === "Failed to fetch" ? "Serverga ulanib bo'lmadi" : e.message);
    } finally { setYuklanmoqda(false); }
  };

  if (rejim === null) {
    return (
      <Qobiq>
        <div className="text-center mb-8">
          <Logotip />
          <h1 className="text-lg font-bold" style={{ color: "#2B2B2B" }}>Xush kelibsiz!</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8578" }}>{email}</p>
        </div>
        <button onClick={() => setRejim("kod")}
          className="w-full py-4 rounded-xl border flex items-center gap-3 mb-3 text-left"
          style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
          <KeyRound size={20} style={{ color: "#1B4B7A" }} />
          <div>
            <p className="font-medium text-sm" style={{ color: "#2B2B2B" }}>Bot orqali ulash kodim bor</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>Botda "🔗 Saytga ulanish kodi" bosgan bo'lsangiz</p>
          </div>
        </button>
        <button onClick={() => setRejim("royxat")}
          className="w-full py-4 rounded-xl border flex items-center gap-3 text-left"
          style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
          <UserPlus size={20} style={{ color: "#2D8B8B" }} />
          <div>
            <p className="font-medium text-sm" style={{ color: "#2B2B2B" }}>Yangi ro'yxatdan o'taman</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>Botdan foydalanmagan bo'lsangiz</p>
          </div>
        </button>
      </Qobiq>
    );
  }

  if (rejim === "kod") {
    return (
      <Qobiq>
        <button onClick={() => setRejim(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>Ulash kodini kiriting</h1>
        <p className="text-sm mb-5" style={{ color: "#8A8578" }}>Botdagi "👤 Kabinet → 🔗 Saytga ulanish kodi"</p>
        <input type="text" value={kod} onChange={(e) => setKod(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && kodBilan()}
          placeholder="masalan: UU62JX"
          className="w-full px-4 py-3 rounded-xl border text-base mb-3 tracking-widest text-center font-semibold"
          style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }} />
        {xato && <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B0553A" }}><WifiOff size={15} /> {xato}</div>}
        <button onClick={kodBilan} disabled={yuklanmoqda}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={18} className="animate-spin" /> : "Ulash"}
        </button>
      </Qobiq>
    );
  }

  return (
    <Qobiq>
      <button onClick={() => setRejim(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      <h1 className="text-lg font-bold mb-5" style={{ color: "#2B2B2B" }}>Ro'yxatdan o'tish</h1>

      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ismingiz</label>
      <input type="text" value={ismInput} onChange={(e) => setIsmInput(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border text-base mb-2"
        style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }} />

      {oxshashlar.length > 0 && (
        <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#FFF8E8", border: "1px solid #EEDFB0" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "#6B5B2E" }}>
            Botda shunga o'xshash ism topildi:
          </p>
          {oxshashlar.map((o, i) => (
            <p key={i} className="text-xs" style={{ color: "#8A7642" }}>• {o.full_name} ({o.role})</p>
          ))}
          <p className="text-xs mt-1.5" style={{ color: "#6B5B2E" }}>
            Bu sizmi? Bo'lsa, ortga qaytib "Bot kodim bor" ni tanlang — aks holda ikkita akkaunt paydo bo'ladi.
          </p>
        </div>
      )}

      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Kimsiz?</label>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["oquvchi", "O'quvchi"], ["ota-ona", "Ota-ona"], ["oqituvchi", "O'qituvchi"]].map(([v, l]) => (
          <button key={v} onClick={() => setRol(v)}
            className="py-2.5 rounded-lg border text-xs font-medium"
            style={{
              borderColor: rol === v ? "#1B4B7A" : "#E5E1D8",
              backgroundColor: rol === v ? "#1B4B7A" : "#FFFFFF",
              color: rol === v ? "#FFFFFF" : "#5A5648",
            }}>
            {l}
          </button>
        ))}
      </div>

      {rol === "oquvchi" && (
        <>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf</label>
          <select value={sinf} onChange={(e) => setSinf(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-base mb-4"
            style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
            {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}-sinf</option>
            ))}
          </select>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maktab raqami</label>
          <input type="text" value={maktabRaqami} onChange={(e) => setMaktabRaqami(e.target.value)}
            placeholder="masalan: 21"
            className="w-full px-4 py-3 rounded-xl border text-base mb-4"
            style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }} />
        </>
      )}

      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Viloyat</label>
      <select value={viloyat} onChange={(e) => { setViloyat(e.target.value); setTuman(""); }}
        className="w-full px-4 py-3 rounded-xl border text-base mb-4"
        style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
        <option value="">Tanlanmagan</option>
        {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>

      {viloyat && (
        <>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
          <select value={tuman} onChange={(e) => setTuman(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-base mb-4"
            style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
            <option value="">Tanlanmagan</option>
            {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </>
      )}

      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tug'ilgan sana</label>
      <input type="date" value={tugilganSana} onChange={(e) => setTugilganYil(e.target.value)}
        min="1950-01-01" max={new Date().toISOString().split("T")[0]}
        className="w-full px-4 py-3 rounded-xl border text-base mb-4"
        style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }} />

      {xato && <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B0553A" }}><WifiOff size={15} /> {xato}</div>}

      <button onClick={royxatBilan} disabled={yuklanmoqda}
        className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
        style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}>
        {yuklanmoqda ? <Loader2 size={18} className="animate-spin" /> : "Ro'yxatdan o'tish"}
      </button>
    </Qobiq>
  );
}

// ═══════════════════════════════════════════════════════════
// 3) KABINET — token bilan kirilgach
// ═══════════════════════════════════════════════════════════
function MavzularYoliVizual({ mavzular, rang }) {
  const [tanlangan, setTanlangan] = useState(null); // ochilgan tugma indeksi | null
  const QADAM = 78, ENI = 260, AMPLITUDA = 78, YUQORI = 46, PASTKI = 46;
  const asosiyRang = rang || "#1B4B7A";

  const nuqtalar = mavzular.map((m, i) => ({
    ...m, x: ENI / 2 + AMPLITUDA * Math.sin(i * 1.05), y: YUQORI + i * QADAM,
  }));
  const balandlik = YUQORI + Math.max(0, mavzular.length - 1) * QADAM + PASTKI;
  const yoliChizigi = nuqtalar.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x.toFixed(1)} ${n.y.toFixed(1)}`).join(" ");
  const hammasiTugagan = mavzular.length > 0 && mavzular.every((m) => m.otilgan_kichik === m.jami_kichik);

  return (
    <div className="relative mx-auto" style={{ width: ENI, height: balandlik + 60 }}>
      <svg viewBox={`0 0 ${ENI} ${balandlik + 60}`} width={ENI} height={balandlik + 60} className="absolute inset-0">
        <text x={ENI / 2} y="26" textAnchor="middle" fontSize="26">🏁</text>
        <path d={yoliChizigi ? `M ${ENI / 2} 34 ${yoliChizigi.slice(2)}` : ""} fill="none" stroke="#E5E1D8" strokeWidth="6" strokeLinecap="round" strokeDasharray="1,14" />
        <text x={ENI / 2} y={balandlik + 42} textAnchor="middle" fontSize="26" opacity={hammasiTugagan ? 1 : 0.35}>🏆</text>
      </svg>
      {nuqtalar.map((n, i) => {
        const holat = n.otilgan_kichik === 0 ? "boshlanmagan" : n.otilgan_kichik < n.jami_kichik ? "jarayonda" : "tugagan";
        const fonRang = holat === "tugagan" ? asosiyRang : holat === "jarayonda" ? "#C89B3C" : "#FFFFFF";
        const chegara = holat === "boshlanmagan" ? "#C4BFAF" : fonRang;
        const matnRang = holat === "boshlanmagan" ? "#8A8578" : "#FFFFFF";
        return (
          <div key={n.topic_code} className="absolute" style={{ left: n.x - 24, top: n.y - 24 }}>
            <button onClick={() => setTanlangan(tanlangan === i ? null : i)}
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-sm"
              style={{ backgroundColor: fonRang, border: `3px solid ${chegara}`, color: matnRang }}>
              {holat === "tugagan" ? "✓" : i + 1}
            </button>
            {tanlangan === i && (
              <div className="absolute z-10 top-14 -left-16 w-40 rounded-xl p-2.5 text-center shadow-lg bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "#2B2B2B" }}>{n.nomi}</p>
                {n.score !== null && <p className="text-xs font-bold" style={{ color: asosiyRang }}>{n.score}%</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MavzuQatori({ m, i, sinf, fan, rang }) {
  const holat = m.otilgan_kichik === 0 ? "boshlanmagan" : m.otilgan_kichik < m.jami_kichik ? "jarayonda" : "tugagan";
  const ikon = holat === "tugagan" ? "✅" : holat === "jarayonda" ? "🟡" : "⬜";
  const fonRang = holat === "tugagan" ? "#EAF3DE" : holat === "jarayonda" ? "#FDF3E0" : "#FFFFFF";
  const chegaraRang = holat === "tugagan" ? "#C9E4B0" : holat === "jarayonda" ? "#F5DFA3" : "#E5E1D8";

  const [ochiq, setOchiq] = useState(false);
  const [tushuntirish, setTushuntirish] = useState(null); // null=hali so'ralmagan, ""=topilmadi, matn=bor
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  const bosildi = () => {
    if (ochiq) { setOchiq(false); return; }
    setOchiq(true);
    if (tushuntirish !== null) return; // allaqachon yuklangan — qayta so'ramaymiz
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/mavzu_tushuntirish?sinf=${encodeURIComponent(sinf)}&fan=${encodeURIComponent(fan)}&mavzu=${encodeURIComponent(m.nomi)}`)
      .then((r) => r.json())
      .then((d) => { setTushuntirish(d.topildi ? d.tushuntirish : ""); setYuklanmoqda(false); })
      .catch(() => { setTushuntirish(""); setYuklanmoqda(false); });
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: fonRang, borderColor: chegaraRang }}>
      <button onClick={bosildi} className="w-full p-3.5 flex items-center gap-3 text-left">
        <span className="text-lg shrink-0">{ikon}</span>
        <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}>{i + 1}. {m.nomi}</span>
        {m.score !== null && <span className="text-xs font-semibold shrink-0" style={{ color: "#3B6D11" }}>{m.score}%</span>}
        <span className="text-sm shrink-0">🤖</span>
      </button>
      {ochiq && (
        <div className="px-3.5 pb-3.5">
          {yuklanmoqda ? (
            <div className="py-2"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
          ) : tushuntirish ? (
            <AralashMatn matn={tushuntirish} className="text-sm p-3 rounded-lg leading-relaxed" style={{ backgroundColor: "#FFFFFF", color: "#2B2B2B" }} />
          ) : (
            <p className="text-xs" style={{ color: "#8A8578" }}>Bu mavzu uchun hali AI tushuntirishi tayyorlanmagan.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TalimYoli({ bolaId, fan, rang, onYopish }) {
  const [malumot, setMalumot] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [korinish, setKorinish] = useState("royxat"); // "royxat" | "yol"

  useEffect(() => {
    fetch(`${API_BASE}/api/bola/${bolaId}/yol?fan=${encodeURIComponent(fan)}`)
      .then((r) => r.json())
      .then((d) => { if (d.detail) throw new Error(d.detail); setMalumot(d); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [bolaId, fan]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
      <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
        <button onClick={onYopish} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: rang || "#1B4B7A" }}>
            {fan.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>{fan}</h1>
            <p className="text-sm" style={{ color: "#8A8578" }}>Ta'lim yo'li</p>
          </div>
        </div>

        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : xato ? (
          <p className="text-sm" style={{ color: "#B0553A" }}>{xato}</p>
        ) : (
          <>
            <div className="rounded-2xl p-5 bg-white border mb-5" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: "#5A5648" }}>Yo'lning bosib o'tilgan qismi</p>
                <p className="text-sm font-bold" style={{ color: rang || "#1B4B7A" }}>{malumot.otilgan_mavzu} / {malumot.jami_mavzu}</p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: "#EFEBE1" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${malumot.yol_foizi}%`, backgroundColor: rang || "#1B4B7A" }} />
              </div>
              <p className="text-xs mb-4" style={{ color: "#8A8578" }}>{malumot.yol_foizi}% yo'l bosib o'tilgan</p>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "#5A5648" }}>Bilimlar samaradorligi</p>
                <p className="text-sm font-bold" style={{ color: "#C89B3C" }}>{malumot.samaradorlik_foizi}%</p>
              </div>
            </div>

            {malumot.choraklar && malumot.choraklar.length > 0 && (
              <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: `repeat(${malumot.choraklar.length}, minmax(0, 1fr))` }}>
                {malumot.choraklar.map((ch) => {
                  const ikon = ch.foiz === 100 ? "✅" : ch.foiz > 0 ? "🟡" : "⚪";
                  return (
                    <div key={ch.chorak} className="rounded-xl p-3 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "#5A5648" }}>{ch.chorak}-chorak</p>
                      <p className="text-lg mb-0.5">{ikon}</p>
                      <p className="text-xs font-bold" style={{ color: ch.foiz === 100 ? "#3B6D11" : ch.foiz > 0 ? "#8A5A1C" : "#8A8578" }}>{ch.foiz}%</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 mb-5">
              <button onClick={() => setKorinish("royxat")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={korinish === "royxat" ? { backgroundColor: rang || "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                📋 Ro'yxat
              </button>
              <button onClick={() => setKorinish("yol")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={korinish === "yol" ? { backgroundColor: rang || "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                🛤️ Yo'l
              </button>
            </div>

            {korinish === "yol" ? (
              <div className="py-2 overflow-x-auto"><MavzularYoliVizual mavzular={malumot.mavzular} rang={rang} /></div>
            ) : (
              <div className="space-y-2">
                {malumot.mavzular.map((m, i) => (
                  <MavzuQatori key={m.topic_code} m={m} i={i} sinf={malumot.sinf} fan={fan} rang={rang} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TogarakYoli({ bolaId, togarakId, onYopish }) {
  const [malumot, setMalumot] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [korinish, setKorinish] = useState("royxat"); // "royxat" | "yol"

  useEffect(() => {
    fetch(`${API_BASE}/api/bola/${bolaId}/togarak_yoli/${togarakId}`)
      .then((r) => r.json())
      .then((d) => { if (d.detail) throw new Error(d.detail); setMalumot(d); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [bolaId, togarakId]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
      <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
        <button onClick={onYopish} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : xato ? (
          <p className="text-sm" style={{ color: "#B0553A" }}>{xato}</p>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🔀 {malumot.togarak_nomi}</h1>
            <p className="text-sm mb-5" style={{ color: "#8A8578" }}>{malumot.fan} · To'garak yo'li</p>

            <div className="rounded-2xl p-5 bg-white border mb-5" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: "#5A5648" }}>Yo'lning bosib o'tilgan qismi</p>
                <p className="text-sm font-bold" style={{ color: "#1B4B7A" }}>{malumot.otilgan_mavzu} / {malumot.jami_mavzu}</p>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: "#EFEBE1" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${malumot.yol_foizi}%`, backgroundColor: "#1B4B7A" }} />
              </div>
              <p className="text-xs mb-4" style={{ color: "#8A8578" }}>{malumot.yol_foizi}% yo'l bosib o'tilgan</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "#5A5648" }}>Bilimlar samaradorligi</p>
                <p className="text-sm font-bold" style={{ color: "#C89B3C" }}>{malumot.samaradorlik_foizi}%</p>
              </div>
            </div>

            {malumot.choraklar && malumot.choraklar.length > 0 && (
              <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: `repeat(${malumot.choraklar.length}, minmax(0, 1fr))` }}>
                {malumot.choraklar.map((ch) => {
                  const ikon = ch.foiz === 100 ? "✅" : ch.foiz > 0 ? "🟡" : "⚪";
                  return (
                    <div key={ch.chorak} className="rounded-xl p-3 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "#5A5648" }}>{ch.chorak}-chorak</p>
                      <p className="text-lg mb-0.5">{ikon}</p>
                      <p className="text-xs font-bold" style={{ color: ch.foiz === 100 ? "#3B6D11" : ch.foiz > 0 ? "#8A5A1C" : "#8A8578" }}>{ch.foiz}%</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 mb-5">
              <button onClick={() => setKorinish("royxat")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={korinish === "royxat" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                📋 Ro'yxat
              </button>
              <button onClick={() => setKorinish("yol")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold"
                style={korinish === "yol" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                🛤️ Yo'l
              </button>
            </div>

            {korinish === "yol" ? (
              <div className="py-2 overflow-x-auto"><MavzularYoliVizual mavzular={malumot.mavzular} rang="#1B4B7A" /></div>
            ) : (
              <div className="space-y-2">
                {malumot.mavzular.map((m, i) => {
                  const holat = m.otilgan_kichik === 0 ? "boshlanmagan" : m.otilgan_kichik < m.jami_kichik ? "jarayonda" : "tugagan";
                  const ikon = holat === "tugagan" ? "✅" : holat === "jarayonda" ? "🟡" : "⬜";
                  const fonRang = holat === "tugagan" ? "#EAF3DE" : holat === "jarayonda" ? "#FDF3E0" : "#FFFFFF";
                  const chegaraRang = holat === "tugagan" ? "#C9E4B0" : holat === "jarayonda" ? "#F5DFA3" : "#E5E1D8";
                  return (
                  <div key={m.topic_code} className="rounded-xl p-3.5 flex items-center gap-3 border" style={{ backgroundColor: fonRang, borderColor: chegaraRang }}>
                    <span className="text-lg shrink-0">{ikon}</span>
                    <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}>{i + 1}. {m.nomi}</span>
                    {m.score !== null && <span className="text-xs font-semibold shrink-0" style={{ color: "#3B6D11" }}>{m.score}%</span>}
                  </div>
                );
              })}
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatKartochka({ ikon, qiymat, yorliq, rang, fon }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ backgroundColor: fon }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white">
        {React.cloneElement(ikon, { color: rang })}
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold leading-tight truncate" style={{ color: rang }}>{qiymat}</p>
        <p className="text-xs leading-tight truncate" style={{ color: "#8A8578" }}>{yorliq}</p>
      </div>
    </div>
  );
}

function FanBolimi({ fan, onBosildi }) {
  return (
    <button onClick={onBosildi}
      className="w-full rounded-2xl border bg-white p-5 flex items-center gap-4 text-left transition-transform active:scale-[0.98]"
      style={{ borderColor: "#E5E1D8" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: fan.rang }}>{fan.qisqa}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-lg" style={{ color: "#2B2B2B" }}>{fan.nom}</h3>
          <span className="text-2xl font-bold shrink-0" style={{ color: fan.rang }}>{fan.foiz}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEBE1" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${fan.foiz}%`, backgroundColor: fan.rang }} />
        </div>
      </div>
      <ChevronRight size={20} className="shrink-0" style={{ color: "#8A8578" }} />
    </button>
  );
}

function ReaksiyaOyini({ token, bolaId, onYopish }) {
  const [holat, setHolat] = useState("boshlanmagan"); // boshlanmagan | kutish | tayyor | erta | natija
  const [natija, setNatija] = useState(null); // millisekund
  const [tarix, setTarix] = useState(null);
  const boshlanishVaqtiRef = useRef(0);
  const kutishTaymerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/bola/${bolaId}/reaksiya_tarixi`)
      .then((r) => r.json())
      .then(setTarix)
      .catch(() => {});
    return () => clearTimeout(kutishTaymerRef.current);
  }, [bolaId]);

  const boshlash = () => {
    setHolat("kutish");
    setNatija(null);
    const kutish = 1000 + Math.random() * 2000; // 1-3 soniya
    kutishTaymerRef.current = setTimeout(() => {
      boshlanishVaqtiRef.current = performance.now();
      setHolat("tayyor");
    }, kutish);
  };

  const bosildi = async () => {
    if (holat === "kutish") {
      clearTimeout(kutishTaymerRef.current);
      setHolat("erta");
      return;
    }
    if (holat !== "tayyor") return;
    const ms = Math.round(performance.now() - boshlanishVaqtiRef.current);
    setNatija(ms);
    setHolat("natija");
    try {
      await fetch(`${API_BASE}/api/bola/reaksiya_natija_saqla`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, millisekund: ms }),
      });
      const yangiTarix = await fetch(`${API_BASE}/api/bola/${bolaId}/reaksiya_tarixi`).then((r) => r.json());
      setTarix(yangiTarix);
    } catch { /* natija saqlanmasa ham o'yin davom etaveradi */ }
  };

  const rangi = { boshlanmagan: "#F0EDE5", kutish: "#E24B4A", tayyor: "#3B6D11", erta: "#8A5A1C", natija: "#1B4B7A" }[holat];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6" style={{ backgroundColor: "rgba(43,43,43,0.92)" }}>
      <button onClick={onYopish} className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
        <X size={18} style={{ color: "#fff" }} />
      </button>
      <p className="text-white text-sm mb-6 text-center">🎮 Reaksiya o'yini — qiziqarli tezlik sinovi (ilmiy o'lchov emas)</p>
      <button onClick={holat === "tayyor" || holat === "kutish" ? bosildi : boshlash}
        className="w-56 h-56 rounded-full flex flex-col items-center justify-center text-center px-4 transition-colors"
        style={{ backgroundColor: rangi }}>
        {holat === "boshlanmagan" && <span className="text-white font-bold text-lg">Boshlash</span>}
        {holat === "kutish" && <span className="text-white font-semibold">Kuting...</span>}
        {holat === "tayyor" && <span className="text-white font-bold text-lg">HOZIR BOSING!</span>}
        {holat === "erta" && <span className="text-white font-semibold">Juda erta! Qayta urining</span>}
        {holat === "natija" && (
          <>
            <span className="text-white font-bold text-3xl">{natija}</span>
            <span className="text-white text-sm">millisekund</span>
          </>
        )}
      </button>
      {(holat === "erta" || holat === "natija") && (
        <button onClick={boshlash} className="mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
          Qayta urinish
        </button>
      )}
      {tarix && tarix.jami_urinish > 0 && (
        <div className="mt-8 flex gap-4">
          <div className="text-center">
            <p className="text-white text-xl font-bold">{tarix.eng_yaxshi}</p>
            <p className="text-white text-xs" style={{ opacity: 0.7 }}>eng yaxshi (ms)</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{tarix.ortacha}</p>
            <p className="text-white text-xs" style={{ opacity: 0.7 }}>o'rtacha (ms)</p>
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-bold">{tarix.jami_urinish}</p>
            <p className="text-white text-xs" style={{ opacity: 0.7 }}>jami urinish</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BilimTab({ data, bolaId, rang, token, otaOnaUchun }) {
  const heroRang = rang || "#1B4B7A";
  const [yolFani, setYolFani] = useState(null); // {fan, rang} | null
  const [togarakYoliId, setTogarakYoliId] = useState(null); // ochilgan to'garak yo'li id | null
  const [mengaTogaraklarim, setMenTogaraklarim] = useState([]);
  const [bugungiTavsiya, setBugungiTavsiya] = useState(null); // {tavsiyalar: [...]} | null (hali yuklanmagan)
  const [haftalik, setHaftalik] = useState(null); // {jami_mavzu, ortacha_ball, ...} | null (hali yuklanmagan)
  const [davomat, setDavomat] = useState(null); // {jami_kun, keldi, kelmadi, ketma_ket_kelmagan} | null
  const [qiyinlikTahlili, setQiyinlikTahlili] = useState(null); // {darajalar, javob_turlari} | null
  const [reaksiyaOyiniOchiq, setReaksiyaOyiniOchiq] = useState(false);
  const [mosSinf, setMosSinf] = useState(null); // {sinf_id, sinf_nomi, maktab_nomi, rahbar_ismi} | null
  const [qoshilishParoli, setQoshilishParoli] = useState("");
  const [qoshilinmoqda, setQoshilinmoqda] = useState(false);
  const [qoshilishXato, setQoshilishXato] = useState("");
  const radarData = data.fanlar.map((f) => ({ fan: f.qisqa, foiz: f.foiz }));

  useEffect(() => {
    if (!bolaId) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/togaraklarim`)
      .then((r) => r.json())
      .then((d) => setMenTogaraklarim(d.togaraklar || []))
      .catch(() => {});
  }, [bolaId]);

  useEffect(() => {
    if (!bolaId) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/bugungi_tavsiya`)
      .then((r) => r.json())
      .then((d) => setBugungiTavsiya(d))
      .catch(() => setBugungiTavsiya({ tavsiyalar: [] }));
  }, [bolaId]);

  useEffect(() => {
    if (!bolaId) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/haftalik_xulosa`)
      .then((r) => r.json())
      .then((d) => setHaftalik(d))
      .catch(() => {});
  }, [bolaId]);

  useEffect(() => {
    if (!bolaId || !token) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/davomat_xulosa?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setDavomat(d))
      .catch(() => {});
  }, [bolaId, token]);

  useEffect(() => {
    if (!bolaId) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/qiyinlik_tahlili`)
      .then((r) => r.json())
      .then((d) => setQiyinlikTahlili(d))
      .catch(() => {});
  }, [bolaId]);

  // FAQAT o'quvchining O'Z Bilim ekranida (token mavjud VA ota-ona
  // ko'rinishidan EMAS) — ota-ona farzandini ko'rayotganda BU banner
  // ko'rinmaydi, chunki sinfga qo'shilishni faqat o'quvchining o'zi
  // tasdiqlashi kerak. (token endi davomat uchun ota-ona ko'rinishida
  // ham uzatiladi, shu sabab bu tekshiruv otaOnaUchun bilan alohida.)
  useEffect(() => {
    if (!token || otaOnaUchun) return;
    fetch(`${API_BASE}/api/oquvchi/mos_sinf?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMosSinf(d.topildi ? d : null))
      .catch(() => {});
  }, [token, otaOnaUchun]);

  const sinfgaQoshil = async () => {
    if (!qoshilishParoli.trim()) { setQoshilishXato("Parolni kiriting"); return; }
    setQoshilinmoqda(true); setQoshilishXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oquvchi/sinfga_qoshil?token=${encodeURIComponent(token)}&sinf_id=${mosSinf.sinf_id}&parol=${encodeURIComponent(qoshilishParoli.trim())}`, {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setMosSinf(null);
      setQoshilishParoli("");
    } catch (e) {
      setQoshilishXato(e.message);
    } finally { setQoshilinmoqda(false); }
  };

  const fanRangiTop = (fanNomi) => data.fanlar.find((f) => f.nom === fanNomi)?.rang || fanRangiOl(fanNomi);

  return (
    <div>
      <div className="relative overflow-hidden px-5 pt-6 pb-8" style={{ backgroundColor: heroRang }}>
        <div className="relative">
          <h1 className="mt-1 text-2xl font-bold text-white">{data.bola?.ism || "Sizning bilimingiz"}</h1>
          <div className="mt-6 flex items-end gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">{data.umumiy_foiz}</span>
                <span className="text-xl font-bold" style={{ color: "#C89B3C" }}>%</span>
              </div>
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#B8CBDA" }}><TrendingUp size={12} /> {darajaNom(data.umumiy_foiz)}</p>
            </div>
            {data.fanlar.length > 0 && (
              <div className="flex-1 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="fan" tick={{ fill: "#B8CBDA", fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="foiz" stroke="#C89B3C" fill="#C89B3C" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {data.jami_mavzu > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium" style={{ color: "#B8CBDA" }}>🛤️ Umumiy ta'lim yo'li</p>
                <p className="text-xs font-semibold text-white">{data.otilgan_mavzu} / {data.jami_mavzu} mavzu</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((data.otilgan_mavzu / data.jami_mavzu) * 100)}%`, backgroundColor: "#C89B3C" }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 -mt-3 pb-4 space-y-3">
        <div className="rounded-2xl p-3.5 bg-white border shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <div className="grid grid-cols-2 gap-2.5">
            <StatKartochka ikon={<Flame size={18} />} rang="#C89B3C" fon="#FDF3E0"
              qiymat={haftalik ? (haftalik.ketma_ket_kun > 0 ? haftalik.ketma_ket_kun : "0") : "—"}
              yorliq="kun ketma-ket" />
            <StatKartochka ikon={<BookOpen size={18} />} rang="#1B4B7A" fon="#EAF1F7"
              qiymat={data.jami_mavzu > 0 ? `${data.otilgan_mavzu}/${data.jami_mavzu}` : "0"}
              yorliq="mavzu o'rganilgan" />
            <StatKartochka ikon={<CalendarCheck size={18} />} rang="#3B6D11" fon="#EAF3DE"
              qiymat={davomat && davomat.jami_kun > 0 ? `${Math.round((davomat.keldi / davomat.jami_kun) * 100)}%` : "—"}
              yorliq="davomat (30 kun)" />
            <StatKartochka ikon={<Users size={18} />} rang="#8B5FBF" fon="#F3EEFA"
              qiymat={mengaTogaraklarim.length}
              yorliq="faol to'garak" />
          </div>
        </div>

        {mosSinf && (
          <div className="rounded-2xl p-4 border mb-1" style={{ backgroundColor: "#EAF1F7", borderColor: "#1B4B7A" }}>
            <p className="text-sm font-bold mb-1" style={{ color: "#1B4B7A" }}>🏫 Sinfingiz topildi!</p>
            <p className="text-xs mb-3" style={{ color: "#5A5648" }}>
              {mosSinf.maktab_nomi} — {mosSinf.sinf_nomi}{mosSinf.rahbar_ismi ? ` (rahbar: ${mosSinf.rahbar_ismi})` : ""} tomonidan tuzilgan.
              Qo'shilish uchun sinf rahbaringizdan olgan 4 xonali parolni kiriting.
            </p>
            <div className="flex gap-2">
              <input type="text" value={qoshilishParoli} onChange={(e) => setQoshilishParoli(e.target.value)}
                placeholder="4 xonali parol" maxLength={4}
                className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={sinfgaQoshil} disabled={qoshilinmoqda}
                className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: qoshilinmoqda ? 0.7 : 1 }}>
                {qoshilinmoqda ? "..." : "Qo'shilish"}
              </button>
            </div>
            {qoshilishXato && <p className="text-xs mt-2" style={{ color: "#A32D2D" }}>{qoshilishXato}</p>}
          </div>
        )}

        {bugungiTavsiya && bugungiTavsiya.tavsiyalar && bugungiTavsiya.tavsiyalar.length > 0 && (
          <div className="rounded-2xl p-4 bg-white border mb-1" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-bold mb-0.5 flex items-center gap-1.5" style={{ color: "#2B2B2B" }}>📅 Bugungi tavsiya</p>
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Bu mavzular eslaringizdan chiqishi mumkin — takrorlab qo'ying.</p>
            <div className="space-y-2">
              {bugungiTavsiya.tavsiyalar.map((t, i) => {
                const bRang = fanRangiTop(t.fan);
                const daraja_ikon = t.daraja === "yuqori" ? "🔴" : "🟡";
                return (
                  <button key={i} onClick={() => setYolFani({ fan: t.fan, rang: bRang })}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left"
                    style={{ backgroundColor: "#F7F5F0" }}>
                    <span className="text-base shrink-0">{daraja_ikon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate" style={{ color: "#2B2B2B" }}>{t.nomi}</span>
                      <span className="text-xs" style={{ color: "#8A8578" }}>{t.fan} · {t.kunlar_otgan} kun oldin{t.oxirgi_ball !== null ? ` · ${t.oxirgi_ball}%` : ""}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0" style={{ color: "#8A8578" }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {haftalik && (haftalik.jami_mavzu > 0 || haftalik.ketma_ket_kun > 0) && (
          <div className="rounded-2xl p-4 bg-white border mb-1" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: "#2B2B2B" }}>📊 Haftalik xulosa</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FDF3E0" }}>
                <p className="text-lg font-bold" style={{ color: "#8A5A1C" }}>{haftalik.ketma_ket_kun > 0 ? `🔥${haftalik.ketma_ket_kun}` : "—"}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>kun ketma-ket</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#EAF1F7" }}>
                <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{haftalik.jami_mavzu}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>mavzu (hafta)</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#EAF3DE" }}>
                <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{haftalik.jami_mavzu > 0 ? `${haftalik.ortacha_ball}%` : "—"}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>o'rtacha ball</p>
              </div>
            </div>
            {haftalik.yangi_mavzular_soni > 0 && (
              <p className="text-xs mb-1.5" style={{ color: "#5A5648" }}>
                ⭐ Bu hafta {haftalik.yangi_mavzular_soni} ta yangi mavzu: <b>{haftalik.yangi_mavzular.join(", ")}</b>
              </p>
            )}
            {haftalik.zaif_mavzular.length > 0 && (
              <p className="text-xs" style={{ color: "#5A5648" }}>
                💪 Ko'proq e'tibor kerak: <b>{haftalik.zaif_mavzular.map((z) => `${z.nomi} (${z.ball}%)`).join(", ")}</b>
              </p>
            )}
          </div>
        )}

        {davomat && davomat.jami_kun > 0 && (
          <div className="rounded-2xl p-4 bg-white border mb-1" style={{ borderColor: davomat.ketma_ket_kelmagan >= 2 ? "#E8A0A0" : "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: "#2B2B2B" }}>📋 Davomat (oxirgi 30 kun)</p>
            {davomat.ketma_ket_kelmagan >= 2 && (
              <p className="text-xs font-medium mb-3" style={{ color: "#A32D2D" }}>⚠️ {davomat.ketma_ket_kelmagan} kun ketma-ket kelmagan</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#EAF3DE" }}>
                <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{davomat.keldi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>keldi</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FCEBEB" }}>
                <p className="text-lg font-bold" style={{ color: "#A32D2D" }}>{davomat.kelmadi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>kelmadi</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FDF3E0" }}>
                <p className="text-lg font-bold" style={{ color: "#8A5A1C" }}>{davomat.kechikdi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>kechikdi</p>
              </div>
            </div>
          </div>
        )}

        {qiyinlikTahlili && qiyinlikTahlili.darajalar.length > 0 && (
          <div className="rounded-2xl p-4 bg-white border mb-1" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: "#2B2B2B" }}>🎯 Qiyinlik darajasi bo'yicha natijam</p>
            <div className="space-y-2.5 mb-3">
              {qiyinlikTahlili.darajalar.map((d) => {
                const rangi = { oson: "#3B6D11", "o'rta": "#8A5A1C", qiyin: "#B0553A", murakkab: "#A32D2D" }[d.daraja] || "#8A8578";
                const fonRangi = { oson: "#EAF3DE", "o'rta": "#FDF3E0", qiyin: "#FBE4D8", murakkab: "#FCEBEB" }[d.daraja] || "#F0EDE5";
                return (
                  <div key={d.daraja}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium capitalize" style={{ color: "#5A5648" }}>{d.daraja}</span>
                      <span style={{ color: rangi }}>{d.togri}/{d.jami} ({d.foiz}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: fonRangi }}>
                      <div className="h-full rounded-full" style={{ width: `${d.foiz}%`, backgroundColor: rangi }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {qiyinlikTahlili.javob_turlari.length > 1 && (
              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "#F0EDE5" }}>
                {qiyinlikTahlili.javob_turlari.map((t) => (
                  <div key={t.turi} className="flex-1 rounded-xl p-2.5 text-center" style={{ backgroundColor: "#F7F5F0" }}>
                    <p className="text-xs font-medium mb-0.5" style={{ color: "#5A5648" }}>{t.turi === "write_answer" ? "✍️ Yozma" : "🔘 Tugmali"}</p>
                    <p className="text-sm font-bold" style={{ color: "#1B4B7A" }}>{t.foiz}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {bolaId && (
          <button onClick={() => setReaksiyaOyiniOchiq(true)}
            className="rounded-2xl p-4 bg-white border mb-1 flex items-center justify-between text-left" style={{ borderColor: "#E5E1D8" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>🎮 Reaksiya o'yini</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Tezligingizni sinab ko'ring — qiziqarli sinov</p>
            </div>
            <ChevronRight size={18} style={{ color: "#B0AA98" }} />
          </button>
        )}
        {reaksiyaOyiniOchiq && <ReaksiyaOyini token={token} bolaId={bolaId} onYopish={() => setReaksiyaOyiniOchiq(false)} />}

        {data.sinf_sozlanmagan ? (
          <div className="rounded-2xl p-6 text-center bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "#2B2B2B" }}>Sinf sozlanmagan</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>Profilda sinf tanlangach, shu sinfning fan/mavzulari shu yerda ko'rinadi.</p>
          </div>
        ) : data.fanlar.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Hali birorta ham mavzu o'rganilmagan.</p>
          </div>
        ) : (
          data.fanlar.map((fan) => (
            <FanBolimi key={fan.nom} fan={fan} onBosildi={() => setYolFani({ fan: fan.nom, rang: fan.rang })} />
          ))
        )}

        {mengaTogaraklarim.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>🔀 To'garak yo'llarim</p>
            <div className="space-y-2">
              {mengaTogaraklarim.map((t) => (
                <button key={t.id} onClick={() => setTogarakYoliId(t.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border text-left"
                  style={{ borderColor: "#E5E1D8" }}>
                  <span>
                    <span className="text-sm font-medium block" style={{ color: "#2B2B2B" }}>{t.nomi}</span>
                    <span className="text-xs" style={{ color: "#8A8578" }}>{t.fan}{t.sinf ? ` · ${t.sinf}-sinf` : ""}</span>
                  </span>
                  <ChevronRight size={18} style={{ color: "#8A8578" }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {yolFani && bolaId && <TalimYoli bolaId={bolaId} fan={yolFani.fan} rang={yolFani.rang} onYopish={() => setYolFani(null)} />}
      {togarakYoliId && bolaId && <TogarakYoli bolaId={bolaId} togarakId={togarakYoliId} onYopish={() => setTogarakYoliId(null)} />}
    </div>
  );
}

function BilimMarkazi({
  token,
  data,
  bolaId,
  rang,
  viewer = "student",
  otaOnaUchun = false,
  analyticsCompact = false,
  onOpenTest = null,
  onOpenLesson = null,
}) {
  const [ichkiTab, setIchkiTab] = useState("tahlil");
  return (
    <div>
      {data && (
        <div className="px-5 pt-3 pb-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl p-1" style={{ backgroundColor: "#EEEAE1" }}>
            <button onClick={() => setIchkiTab("tahlil")}
              className="rounded-lg py-2 text-xs font-semibold"
              style={ichkiTab === "tahlil"
                ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }
                : { color: "#6F6859" }}>
              Tahlil
            </button>
            <button onClick={() => setIchkiTab("talim_yoli")}
              className="rounded-lg py-2 text-xs font-semibold"
              style={ichkiTab === "talim_yoli"
                ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }
                : { color: "#6F6859" }}>
              Ta'lim yo'li
            </button>
          </div>
        </div>
      )}
      {ichkiTab === "talim_yoli" && data ? (
        <StudentLearningPathDashboard
          token={token}
          studentId={viewer === "student" ? null : bolaId}
          viewer={viewer}
          accent={rang}
          onOpenTest={onOpenTest}
          onOpenLesson={onOpenLesson}
        />
      ) : (
        <div className={analyticsCompact ? "px-5 pb-4" : ""}>
          <StudentAnalyticsDashboard
            token={token}
            studentId={viewer === "student" ? null : bolaId}
            viewer={viewer}
            accent={rang}
            compact={analyticsCompact}
            fallbackData={data}
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4) TEST YECHISH
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// 5) O'QITUVCHI — guruhlarim, baholash
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// 7) ADMIN — Test shablon yuklab olish / import qilish
// ═══════════════════════════════════════════════════════════
function AdminTestlarTab({ token }) {
  return <TestTab token={token} sinf={null} />;
}

function AdminTab({ token, oldindanTanlangan }) {
  // Shablonlar sahifasiga kirilganda hech qaysi ish oynasi o'z-o'zidan
  // ochilmaydi. Mavzular sahifasidan kelgan kodlar esa yo'qolmaydi: foydalanuvchi
  // keyin "Shablon"ni tanlaganda TestShablonBolimi'ga uzatiladi.
  const [bolim, setBolim] = useState(null); // null | "miya" | "test" | "topik" | ...
  const [testRejimi, setTestRejimi] = useState(null); // null | "shablon" | "import"

  const bolimniOch = (yangiBolim) => {
    setBolim(yangiBolim);
    setTestRejimi(null);
  };

  const testMenyusiniAlmashtir = () => {
    if (bolim === "test") {
      setBolim(null);
      setTestRejimi(null);
      return;
    }
    setBolim("test");
    setTestRejimi(null);
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Shablonlar</h1>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button onClick={() => bolimniOch("miya")}
          className="col-span-2 py-3 rounded-xl font-semibold text-sm"
          style={bolim === "miya"
            ? { background: "linear-gradient(135deg,#1B4B7A,#2D8B8B)", color: "#fff" }
            : { backgroundColor: "#EEF7F5", color: "#246D6D", border: "1px solid #A8D2C8" }}>
          🧠 Kitob miyasi · yangi universal import
        </button>
        <button type="button" onClick={testMenyusiniAlmashtir}
          aria-expanded={bolim === "test"} aria-controls="test-shablon-import-tanlov"
          className="col-span-2 py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "test"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🧪 Test shablon va import
        </button>
        {bolim === "test" && (
          <div id="test-shablon-import-tanlov" className="col-span-2 grid grid-cols-2 gap-2 rounded-xl p-2"
            style={{ backgroundColor: "#EAF1F7" }}>
            <button type="button" onClick={() => setTestRejimi("shablon")}
              className="py-2.5 rounded-xl font-semibold text-sm"
              style={testRejimi === "shablon"
                ? { backgroundColor: "#2D8B8B", color: "#fff" }
                : { backgroundColor: "#fff", color: "#1B4B7A", border: "1px solid #B7D3E8" }}>
              📄 Shablon
            </button>
            <button type="button" onClick={() => setTestRejimi("import")}
              className="py-2.5 rounded-xl font-semibold text-sm"
              style={testRejimi === "import"
                ? { backgroundColor: "#2D8B8B", color: "#fff" }
                : { backgroundColor: "#fff", color: "#1B4B7A", border: "1px solid #B7D3E8" }}>
              📤 Import
            </button>
          </div>
        )}
        <button onClick={() => bolimniOch("topik")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "topik"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          📋 Topik shablon
        </button>
        <button onClick={() => bolimniOch("tushuntirish")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "tushuntirish"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🤖 Tushuntirish
        </button>
        <button onClick={() => bolimniOch("sinov")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "sinov"
            ? { backgroundColor: "#C89B3C", color: "#fff" }
            : { backgroundColor: "#fff", color: "#8A5A1C", border: "1px solid #F5DFA3" }}>
          🧪 Sinov muhiti
        </button>
      </div>

      {bolim === "miya" && <KitobMiyaBolimi token={token} />}
      {bolim === "test" && testRejimi === "shablon" && (
        <TestShablonBolimi key="shablon" token={token} oldindanTanlangan={oldindanTanlangan} mode="shablon" />
      )}
      {bolim === "test" && testRejimi === "import" && (
        <TestShablonBolimi key="import" token={token} oldindanTanlangan={oldindanTanlangan} mode="import" />
      )}
      {bolim === "topik" && <TopikShablonBolimi token={token} />}
      {bolim === "tushuntirish" && <TushuntirishBolimi token={token} />}
      {bolim === "sinov" && <SinovMuhitiBolimi token={token} />}
    </div>
  );
}

function AdminMuassasalarTab({ token }) {
  const [bolim, setBolim] = useState(null);
  const [yangiOchiq, setYangiOchiq] = useState(false);
  const [yangiTuri, setYangiTuri] = useState("maktab");
  const [hamyonUserId, setHamyonUserId] = useState("");
  const [hamyonMiqdori, setHamyonMiqdori] = useState(String(ORGANIZATION_ACTIVATION_PRICE_UZS));
  const [hamyonReference, setHamyonReference] = useState("");
  const [hamyonIzoh, setHamyonIzoh] = useState("");
  const [hamyonTasdiqlandi, setHamyonTasdiqlandi] = useState(false);
  const [hamyonJarayon, setHamyonJarayon] = useState(false);
  const [hamyonXato, setHamyonXato] = useState("");
  const [hamyonNatija, setHamyonNatija] = useState(null);
  const hamyonKalitiRef = useRef("");

  const turlar = [
    { kalit: "maktab", nom: "Maktablar", ikon: "🏫", izoh: "Mavjud maktablar ro'yxati va boshqaruvi" },
    { kalit: "bogcha", nom: "Bog'chalar", ikon: "🧸", izoh: "Mavjud bog'chalar ro'yxati va boshqaruvi" },
    { kalit: "markaz", nom: "O'quv markazlari", ikon: "🎓", izoh: "Mavjud markazlar ro'yxati va boshqaruvi" },
    { kalit: "universitet", nom: "Universitetlar", ikon: "🏛️", izoh: "Mavjud oliy ta'lim muassasalari" },
  ];

  const hamyonMaydoniOzgardi = (setter) => (event) => {
    setter(event.target.value);
    hamyonKalitiRef.current = "";
    setHamyonTasdiqlandi(false);
    setHamyonXato("");
    setHamyonNatija(null);
  };

  const hamyonniToldirish = async () => {
    const userId = Number(hamyonUserId);
    const amountUzs = Number(hamyonMiqdori);
    if (!Number.isInteger(userId) || userId < 1) {
      setHamyonXato("To'g'ri user_id kiriting");
      return;
    }
    if (!Number.isInteger(amountUzs) || amountUzs < 1 || amountUzs > 100_000_000) {
      setHamyonXato("amount_uzs 1 dan 100 000 000 gacha bo'lishi kerak");
      return;
    }
    if (hamyonReference.trim().length < 3) {
      setHamyonXato("Audit uchun kamida 3 belgili reference kiriting");
      return;
    }
    if (!hamyonTasdiqlandi || hamyonJarayon) return;
    setHamyonJarayon(true);
    setHamyonXato("");
    setHamyonNatija(null);
    try {
      if (!hamyonKalitiRef.current) {
        hamyonKalitiRef.current = makeOrganizationIdempotencyKey(`admin-wallet-${userId}`);
      }
      const payload = buildAdminWalletCreditPayload({
        userId,
        amountUzs,
        reference: hamyonReference,
        note: hamyonIzoh,
        confirmed: hamyonTasdiqlandi,
        idempotencyKey: hamyonKalitiRef.current,
      });
      const data = await muassasaV17Sorov("/admin/hamyon-toldirish", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setHamyonNatija(data);
      hamyonKalitiRef.current = "";
      setHamyonTasdiqlandi(false);
      setHamyonReference("");
      setHamyonIzoh("");
    } catch (error) {
      setHamyonXato(organizationTrialErrorMessage(error.payload || error.message));
    } finally {
      setHamyonJarayon(false);
    }
  };

  if (bolim) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button type="button" onClick={() => setBolim(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}>
          <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} /></span>
          Muassasalar
        </button>
        {bolim === "maktab" && <MaktablarBolimi token={token} />}
        {bolim === "markaz" && <MarkazlarBolimi token={token} />}
        {bolim === "bogcha" && <BogchalarBolimi token={token} />}
        {bolim === "universitet" && <UniversitetlarBolimi token={token} />}
      </div>
    );
  }

  return (
    <div className="admin-organizations px-5 pt-6 pb-4">
      <div className="admin-organizations__header">
        <div>
          <span className="premium-eyebrow">ADMINISTRATOR MARKAZI</span>
          <h1>Muassasalar</h1>
          <p>Mavjud muassasalarni alohida boshqaring yoki yangi muassasa turini tanlang.</p>
        </div>
        <button type="button" onClick={() => setYangiOchiq(true)}>
          <Building2 size={17} /> Yangi muassasa
        </button>
      </div>

      <div className="admin-organizations__section-title">
        <h2>Mavjud muassasalar</h2>
        <p>Turini tanlab, muassasalarning to'liq ro'yxati va boshqaruvini oching.</p>
      </div>
      <section className="admin-organizations__list" aria-label="Mavjud muassasa turlari">
        {turlar.map((tur) => (
          <button type="button" key={tur.kalit} onClick={() => setBolim(tur.kalit)}>
            <span>{tur.ikon}</span>
            <div>
              <b>{tur.nom}</b>
              <small>{tur.izoh}</small>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>

      <section className="admin-wallet-credit" aria-labelledby="admin-wallet-title">
        <div className="admin-wallet-credit__head">
          <span><Wallet size={18} /></span>
          <div>
            <h2 id="admin-wallet-title">Tasdiqlangan hamyon to'ldirish</h2>
            <p>To'lov provayderi hozircha ulanmagan. Bu blok pul qabul qilmaydi; administrator tashqarida tasdiqlangan to'lovni audit ma'lumoti bilan qo'lda kreditlaydi.</p>
          </div>
        </div>
        <div className="admin-wallet-credit__grid">
          <label className="org-trial-field">
            <span>Foydalanuvchi ID · user_id</span>
            <input type="number" min="1" step="1" inputMode="numeric" value={hamyonUserId} onChange={hamyonMaydoniOzgardi(setHamyonUserId)} placeholder="Masalan: 1842" />
          </label>
          <label className="org-trial-field">
            <span>Miqdor · amount_uzs</span>
            <input type="number" min="1" max="100000000" step="1" inputMode="numeric" value={hamyonMiqdori} onChange={hamyonMaydoniOzgardi(setHamyonMiqdori)} />
          </label>
          <label className="org-trial-field">
            <span>To'lov reference</span>
            <input value={hamyonReference} onChange={hamyonMaydoniOzgardi(setHamyonReference)} minLength={3} maxLength={160} placeholder="Chek, o'tkazma yoki ichki hujjat raqami" />
          </label>
          <label className="org-trial-field">
            <span>Izoh · note</span>
            <input value={hamyonIzoh} onChange={hamyonMaydoniOzgardi(setHamyonIzoh)} maxLength={240} placeholder="Ixtiyoriy audit izohi" />
          </label>
        </div>
        {hamyonXato && <div className="org-trial-notice error" role="alert">{hamyonXato}</div>}
        {hamyonNatija && (
          <div className="org-trial-notice success" role="status">
            Hamyon to'ldirildi. Yangi balans: {formatUzs(hamyonNatija.wallet?.balance_uzs ?? hamyonNatija.balance_uzs)}{hamyonNatija.reused ? " · avvalgi so'rov xavfsiz qaytarildi" : ""}.
          </div>
        )}
        <label className="org-trial-checkbox charge">
          <input type="checkbox" checked={hamyonTasdiqlandi} onChange={(event) => setHamyonTasdiqlandi(event.target.checked)} />
          <span><b>{formatUzs(Number(hamyonMiqdori) || 0)}</b> summani user_id <b>{hamyonUserId || "—"}</b> hamyoniga qo'shishni aniq tasdiqlayman. Reference audit jurnalida saqlanadi.</span>
        </label>
        <button type="button" className="admin-wallet-credit__submit" disabled={!hamyonTasdiqlandi || hamyonJarayon} onClick={hamyonniToldirish}>
          {hamyonJarayon ? <><Loader2 size={17} className="animate-spin" /> Kreditlanmoqda...</> : "Tasdiqlangan mablag'ni hamyonga qo'shish"}
        </button>
      </section>

      {yangiOchiq && (
        <div className="org-trial-modal-backdrop" role="presentation" onMouseDown={() => setYangiOchiq(false)}>
          <section className="org-trial-modal" role="dialog" aria-modal="true" aria-labelledby="admin-new-organization-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="org-trial-modal__close" onClick={() => setYangiOchiq(false)} aria-label="Yopish"><X size={18} /></button>
            <span className="premium-eyebrow">YANGI MUASSASA</span>
            <h2 id="admin-new-organization-title">Qaysi turdagi muassasa?</h2>
            <p>Davlat va ommaviy muassasalar faqat administrator oqimi orqali yaratiladi.</p>
            <label className="org-trial-field">
              <span>Muassasa turi</span>
              <select value={yangiTuri} onChange={(event) => setYangiTuri(event.target.value)}>
                {turlar.map((tur) => <option key={tur.kalit} value={tur.kalit}>{tur.nom}</option>)}
              </select>
            </label>
            <div className="org-trial-modal__actions">
              <button type="button" className="secondary" onClick={() => setYangiOchiq(false)}>Bekor qilish</button>
              <button type="button" className="primary" onClick={() => { setBolim(yangiTuri); setYangiOchiq(false); }}>Davom etish</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const SINF_HARFLARI = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

const LAVOZIM_NOMLARI = {
  direktor: "Direktor",
  zam_direktor_uquv: "O'quv ishlari bo'yicha direktor o'rinbosari",
  zam_direktor_tarbiya: "Ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari",
  psixolog: "Psixolog",
  kotib: "Kotib",
  fan_oqituvchisi: "Fan o'qituvchisi",
  markaz_direktor: "Markaz direktori",
  administrator: "Administrator",
  bogcha_direktor: "Bog'cha direktori",
  bogcha_zam: "Bog'cha zam direktori",
  bogcha_opa: "Bog'cha opasi (tarbiyachi)",
};

function MaktabQidiruvi({ tanlanganMaktab, onTanla }) {
  const [nomi, setNomi] = useState("");
  const [natijalar, setNatijalar] = useState([]);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);

  useEffect(() => {
    if (nomi.trim().length < 2) { setNatijalar([]); return; }
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/maktab_qidir?nomi=${encodeURIComponent(nomi.trim())}`)
        .then((r) => r.json())
        .then((d) => { setNatijalar(d.natijalar || []); setQidirilmoqda(false); })
        .catch(() => setQidirilmoqda(false));
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [nomi]);

  if (tanlanganMaktab) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3" style={{ borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }}>
        <span className="text-sm font-medium" style={{ color: "#1B4B7A" }}>🏫 {tanlanganMaktab.nomi}</span>
        <button onClick={() => onTanla(null)} className="text-xs font-medium" style={{ color: "#8A8578" }}>✕ O'zgartirish</button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)}
        placeholder="Maktabingiz nomini yozing (ro'yxatda bo'lsa, aniqroq bo'ladi)..."
        className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
        style={{ borderColor: "#E5E1D8" }} />
      {qidirilmoqda && <p className="text-xs mt-1.5" style={{ color: "#8A8578" }}>Qidirilmoqda...</p>}
      {natijalar.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {natijalar.map((m) => (
            <button key={m.id} onClick={() => { onTanla(m); setNomi(""); setNatijalar([]); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left" style={{ backgroundColor: "#F7F5F0" }}>
              <span className="text-sm" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
              <span className="text-xs" style={{ color: "#8A8578" }}>{[m.viloyat, m.tuman].filter(Boolean).join(", ")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SinovMuhitiBolimi({ token }) {
  const [yaratilmoqda, setYaratilmoqda] = useState(false);
  const [natija, setNatija] = useState(null);
  const [xato, setXato] = useState("");
  const [kirilmoqdaId, setKirilmoqdaId] = useState(null);

  const muhitYarat = async () => {
    setYaratilmoqda(true); setXato(""); setNatija(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sinov_muhit_yarat?token=${encodeURIComponent(token)}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatija(data);
    } catch (e) {
      setXato(e.message);
    } finally { setYaratilmoqda(false); }
  };

  const shuHisobBilanKir = async (hisobUserId) => {
    setKirilmoqdaId(hisobUserId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sifatida_kirish?token=${encodeURIComponent(token)}&user_id=${hisobUserId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      window.open(`/kabinet?token=${encodeURIComponent(data.token)}`, "_blank");
    } catch (e) {
      setXato(e.message);
    } finally { setKirilmoqdaId(null); }
  };

  return (
    <div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#F5DFA3", backgroundColor: "#FFFDF7" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>🧪 Sinov muhiti</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Bitta bosishda — sinov maktabi, bog'chasi, markazi va universiteti, ularning direktori/o'qituvchisi/
          opasi/professori va o'quvchilari — HAMMASI soxta, tayyor holda yaratiladi. Google orqali kirish shart
          emas — har biriga "Bu sifatida kirish" bilan darhol kirasiz.
        </p>
        <button onClick={muhitYarat} disabled={yaratilmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#C89B3C", opacity: yaratilmoqda ? 0.7 : 1 }}>
          {yaratilmoqda ? "Yaratilmoqda..." : "🧪 Yangi sinov muhitini yaratish"}
        </button>
        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
      </div>

      {natija && (
        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>✅ Tayyor — {natija.hisoblar.length} ta sinov hisobi</p>
          <p className="text-xs mb-4" style={{ color: "#8A5A1C" }}>{natija.izoh}</p>
          <div className="space-y-2">
            {natija.hisoblar.map((h) => (
              <div key={h.user_id} className="rounded-xl p-3 flex items-center justify-between" style={{ backgroundColor: "#F7F5F0" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{h.full_name}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{h.izoh}</p>
                </div>
                <button onClick={() => shuHisobBilanKir(h.user_id)} disabled={kirilmoqdaId === h.user_id}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white shrink-0" style={{ backgroundColor: "#1B4B7A", opacity: kirilmoqdaId === h.user_id ? 0.7 : 1 }}>
                  {kirilmoqdaId === h.user_id ? "..." : "→ Shu sifatida kirish"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DirektorQidiruvi({ token, tanlanganDirektor, onTanla }) {
  const [ism, setIsm] = useState("");
  const [natijalar, setNatijalar] = useState([]);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);

  useEffect(() => {
    if (ism.trim().length < 2) { setNatijalar([]); return; }
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/admin/foydalanuvchi_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(ism.trim())}`)
        .then((r) => r.json())
        .then((d) => { setNatijalar(d.natijalar || []); setQidirilmoqda(false); })
        .catch(() => setQidirilmoqda(false));
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [ism, token]);

  if (tanlanganDirektor) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3" style={{ borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }}>
        <span className="text-sm font-medium" style={{ color: "#1B4B7A" }}>👤 {tanlanganDirektor.full_name}</span>
        <button onClick={() => onTanla(null)} className="text-xs font-medium" style={{ color: "#8A8578" }}>✕ O'zgartirish</button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)}
        placeholder="Direktor ismini yozing (ixtiyoriy)..."
        className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
        style={{ borderColor: "#E5E1D8" }} />
      {qidirilmoqda && <p className="text-xs mt-1.5" style={{ color: "#8A8578" }}>Qidirilmoqda...</p>}
      {natijalar.length > 0 && (
        <div className="mt-1.5 space-y-1">
          {natijalar.map((n) => (
            <button key={n.user_id} onClick={() => { onTanla(n); setIsm(""); setNatijalar([]); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left" style={{ backgroundColor: "#F7F5F0" }}>
              <span className="text-sm" style={{ color: "#2B2B2B" }}>{n.full_name}</span>
              <span className="text-xs" style={{ color: "#8A8578" }}>{n.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SinfGuruhBoshqaruvi({ token, sinf, fanlar = [], onSaved }) {
  const [ochiq, setOchiq] = useState(false);
  const [tizimlar, setTizimlar] = useState([]);
  const [azolar, setAzolar] = useState([]);
  const [boshqaraOladi, setBoshqaraOladi] = useState(false);
  const [yuklangan, setYuklangan] = useState(false);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [tanlanganlar, setTanlanganlar] = useState(() => new Set());
  const [guruhNomi, setGuruhNomi] = useState("");
  const [xabar, setXabar] = useState("");
  const [xato, setXato] = useState("");

  const turMalumoti = {
    gender: { nomi: "O‘g‘il / Qiz", izoh: "Jismoniy tarbiya va texnologiya uchun", rang: "#EAF4DF" },
    alphabet: { nomi: "Alifbo 1 / 2", izoh: "Til va informatika uchun", rang: "#EAF1F7" },
    manual: { nomi: "Mustaqil guruhlar", izoh: "O‘quvchilarni o‘zingiz belgilaysiz", rang: "#FFF5E2" },
  };

  const tizimlarniYukla = async (majburiy = false) => {
    if (yuklangan && !majburiy) return;
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/sinf_guruh_tizimlari?token=${encodeURIComponent(token)}&sinf_id=${sinf.id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Guruhlarni yuklab bo‘lmadi");
      setTizimlar(data.tizimlar || []);
      setAzolar(data.azolar || []);
      setBoshqaraOladi(Boolean(data.boshqara_oladi));
      setYuklangan(true);
    } catch (error) {
      setXato(error.message);
    } finally {
      setYuklanmoqda(false);
    }
  };

  const ochibYop = () => {
    const yangi = !ochiq;
    setOchiq(yangi);
    if (yangi) tizimlarniYukla();
  };

  const tizimniAlmashtir = async (turi) => {
    if (saqlanmoqda || !boshqaraOladi) return;
    const mavjud = tizimlar.find((tizim) => tizim.turi === turi);
    setSaqlanmoqda(true); setXato(""); setXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/sinf_guruh_tizimi`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sinf_id: sinf.id, turi, faol: !mavjud, fanlar: mavjud?.fanlar || [] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Guruhlash tizimini saqlab bo‘lmadi");
      setTizimlar(data.tizimlar || []);
      setTanlanganlar(new Set());
      setXabar(mavjud ? `✅ ${turMalumoti[turi].nomi} vaqtincha o‘chirildi; tarkibi saqlandi.` : `✅ ${turMalumoti[turi].nomi} qo‘shildi. Boshqa tizimlar saqlandi.`);
      onSaved?.();
      await tizimlarniYukla(true);
    } catch (error) {
      setXato(error.message);
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const fanTanlashniAlmashtir = async (tizim, fan) => {
    if (saqlanmoqda || !boshqaraOladi) return;
    const yangiFanlar = (tizim.fanlar || []).includes(fan)
      ? (tizim.fanlar || []).filter((nom) => nom !== fan)
      : [...(tizim.fanlar || []), fan];
    setSaqlanmoqda(true); setXato(""); setXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/sinf_guruh_tizimi`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sinf_id: sinf.id, turi: tizim.turi, faol: true, fanlar: yangiFanlar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Fan birikmasini saqlab bo‘lmadi");
      setTizimlar(data.tizimlar || []);
      setXabar("✅ Fan–guruh birikmasi saqlandi.");
    } catch (error) {
      setXato(error.message);
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const belgilashniAlmashtir = (userId) => setTanlanganlar((avvalgi) => {
    const yangi = new Set(avvalgi);
    if (yangi.has(userId)) yangi.delete(userId); else yangi.add(userId);
    return yangi;
  });

  const barchasiniAlmashtir = () => setTanlanganlar((avvalgi) =>
    avvalgi.size === azolar.length ? new Set() : new Set(azolar.map((azo) => azo.user_id)));

  const manualTizim = tizimlar.find((tizim) => tizim.turi === "manual");
  const genderTizim = tizimlar.find((tizim) => tizim.turi === "gender");

  const jinsniSaqla = async (amal) => {
    if (!tanlanganlar.size) { setXato("Kamida bitta o‘quvchini belgilang"); return; }
    setSaqlanmoqda(true); setXato(""); setXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/sinf_azolarini_guruhla`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sinf_id: sinf.id, user_ids: [...tanlanganlar], amal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Jins belgisini saqlab bo‘lmadi");
      setTanlanganlar(new Set());
      setXabar(`✅ ${data.yangilangan || 0} ta o‘quvchining jinsi belgilandi; O‘g‘il/Qiz guruhi qayta hisoblandi.`);
      await tizimlarniYukla(true);
      onSaved?.();
    } catch (error) {
      setXato(error.message);
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const mustaqilGuruhniSaqla = async (tozalash = false) => {
    if (!manualTizim || !tanlanganlar.size) { setXato("Kamida bitta o‘quvchini belgilang"); return; }
    if (!tozalash && guruhNomi.trim().length < 2) { setXato("Mustaqil guruh nomini yozing"); return; }
    setSaqlanmoqda(true); setXato(""); setXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/sinf_mustaqil_guruh`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sinf_id: sinf.id, tizim_id: manualTizim.id, user_ids: [...tanlanganlar], guruh_nomi: guruhNomi.trim() || null, tozalash }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Mustaqil guruhni saqlab bo‘lmadi");
      setTizimlar(data.tizimlar || []);
      setTanlanganlar(new Set());
      setXabar(tozalash ? "✅ Tanlangan o‘quvchilar mustaqil guruhdan chiqarildi." : `✅ ${data.yangilangan || 0} ta o‘quvchi “${guruhNomi.trim()}” guruhiga qo‘yildi.`);
      onSaved?.();
    } catch (error) {
      setXato(error.message);
    } finally {
      setSaqlanmoqda(false);
    }
  };

  const jinsNomi = (jins) => {
    const kalit = String(jins || "").toLocaleLowerCase("uz").replace(/[’']/g, "");
    if (["ogil", "erkak", "male", "boy"].includes(kalit)) return "O‘g‘il";
    if (["qiz", "ayol", "female", "girl"].includes(kalit)) return "Qiz";
    return "Jinsi belgilanmagan";
  };

  const azoGuruhMatni = (userId) => tizimlar.flatMap((tizim) =>
    (tizim.azolar || []).filter((azo) => Number(azo.user_id) === Number(userId)).map((azo) => `${turMalumoti[tizim.turi]?.nomi || tizim.nomi}: ${azo.guruh_nomi}`));

  return (
    <div className="mt-2 border-t pt-2" style={{ borderColor: "#E5E1D8" }}>
      <button type="button" onClick={ochibYop} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: ochiq ? "#EAF1F7" : "#fff", color: "#1B4B7A" }}>
        <span>👥 Ko‘p guruhli boshqaruv{yuklangan ? ` · ${tizimlar.length} ta faol` : ""}</span><span>{ochiq ? "⌃" : "⌄"}</span>
      </button>
      {ochiq && <div className="mt-2 rounded-xl border p-3" style={{ backgroundColor: "#fff", borderColor: "#B9CCDC", contentVisibility: "auto", containIntrinsicSize: "1px 520px" }}>
        <p className="text-[11px] mb-3" style={{ color: "#6F6859" }}>Bitta sinfda 2 ta yoki uchala usulni ham bir vaqtda belgilash mumkin. Bittasini belgilash boshqasini o‘chirmaydi; har biri alohida saqlanadi.</p>
        {yuklanmoqda ? <div className="py-6"><Loader2 size={18} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div> : <>
          <div className="grid sm:grid-cols-3 gap-2">
            {Object.entries(turMalumoti).map(([turi, malumot]) => {
              const tizim = tizimlar.find((item) => item.turi === turi);
              return <label key={turi} className="rounded-xl border p-3 text-left cursor-pointer" style={{ backgroundColor: tizim ? malumot.rang : "#fff", borderColor: tizim ? "#1B4B7A" : "#E5E1D8", opacity: boshqaraOladi ? 1 : 0.72 }}>
                <span className="flex items-start gap-2.5"><input type="checkbox" checked={Boolean(tizim)} disabled={saqlanmoqda || !boshqaraOladi} onChange={() => tizimniAlmashtir(turi)} className="mt-0.5" /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><b className="text-xs" style={{ color: "#2B2B2B" }}>{malumot.nomi}</b><span className="text-xs font-bold" style={{ color: tizim ? "#3B6D11" : "#A39D8E" }}>{tizim ? "✓ FAOL" : "BELGILASH"}</span></span><small className="block mt-1" style={{ color: "#8A8578" }}>{malumot.izoh}</small></span></span>
              </label>;
            })}
          </div>

          {tizimlar.map((tizim) => <div key={tizim.id} className="mt-3 rounded-xl border p-3" style={{ borderColor: "#E5E1D8", backgroundColor: "#FCFBF8" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <b className="text-xs" style={{ color: "#2B2B2B" }}>{turMalumoti[tizim.turi]?.nomi || tizim.nomi}</b>
              <div className="flex flex-wrap gap-1.5">{(tizim.guruhlar || []).map((guruh) => <span key={guruh.guruh_kaliti} className="px-2 py-1 rounded-full text-[10px]" style={{ backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>{guruh.guruh_nomi}: {guruh.soni}</span>)}</div>
            </div>
            {fanlar.length > 0 && <details className="mt-2">
              <summary className="text-[11px] cursor-pointer font-semibold" style={{ color: "#1B4B7A" }}>Fanlarga bog‘lash (ixtiyoriy) · {(tizim.fanlar || []).length} ta</summary>
              <div className="flex flex-wrap gap-1.5 mt-2">{fanlar.map((fan) => {
                const tanlangan = (tizim.fanlar || []).includes(fan);
                return <button key={fan} type="button" disabled={saqlanmoqda || !boshqaraOladi} onClick={() => fanTanlashniAlmashtir(tizim, fan)} className="px-2 py-1 rounded-lg text-[10px]" style={{ backgroundColor: tanlangan ? "#1B4B7A" : "#fff", color: tanlangan ? "#fff" : "#5A5648", border: "1px solid #D9D4C8" }}>{tanlangan ? "✓ " : ""}{fan}</button>;
              })}</div>
            </details>}
          </div>)}

          {(manualTizim || genderTizim) && boshqaraOladi && <div className="mt-3 rounded-xl border p-3" style={{ borderColor: "#D9D4C8" }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <button type="button" onClick={barchasiniAlmashtir} disabled={!azolar.length} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }}>{tanlanganlar.size === azolar.length && azolar.length ? "Tanlovni tozalash" : "Barchasini belgilash"}</button>
              <span className="text-[11px] font-semibold" style={{ color: "#1B4B7A" }}>{tanlanganlar.size}/{azolar.length} tanlandi</span>
            </div>
            {!azolar.length ? <p className="text-xs py-3" style={{ color: "#8A8578" }}>Bu sinfda hali o‘quvchi yo‘q.</p> : <div className="max-h-64 overflow-y-auto rounded-lg border divide-y" style={{ borderColor: "#E5E1D8" }}>
              {azolar.map((azo) => {
                const belgilar = azoGuruhMatni(azo.user_id);
                return <label key={azo.user_id} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer" style={{ backgroundColor: tanlanganlar.has(azo.user_id) ? "#F1F7FB" : "#fff", borderColor: "#F0ECE3" }}>
                  <input type="checkbox" checked={tanlanganlar.has(azo.user_id)} onChange={() => belgilashniAlmashtir(azo.user_id)} />
                  <span className="flex-1 min-w-0"><b className="block text-xs truncate" style={{ color: "#2B2B2B" }}>{azo.full_name}</b><small className="block truncate" style={{ color: "#8A8578" }}>{jinsNomi(azo.jins)}{belgilar.length ? ` · ${belgilar.join(" · ")}` : " · Guruh belgilanmagan"}</small></span>
                </label>;
              })}
            </div>}
            {genderTizim && <div className="grid grid-cols-2 gap-2 mt-3">
              <button type="button" onClick={() => jinsniSaqla("boys")} disabled={saqlanmoqda || !tanlanganlar.size} className="px-3.5 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A", opacity: saqlanmoqda || !tanlanganlar.size ? 0.55 : 1 }}>Tanlanganlar — O‘g‘il</button>
              <button type="button" onClick={() => jinsniSaqla("girls")} disabled={saqlanmoqda || !tanlanganlar.size} className="px-3.5 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: "#F7EAF1", color: "#A8527A", opacity: saqlanmoqda || !tanlanganlar.size ? 0.55 : 1 }}>Tanlanganlar — Qiz</button>
            </div>}
            {manualTizim && <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 mt-3">
              <input value={guruhNomi} onChange={(event) => setGuruhNomi(event.target.value)} placeholder="Mustaqil guruh nomi, masalan: Kuchli guruh" maxLength={50} className="px-3 py-2 rounded-lg border text-xs" style={{ borderColor: "#D9D4C8" }} />
              <button type="button" onClick={() => mustaqilGuruhniSaqla(false)} disabled={saqlanmoqda || !tanlanganlar.size} className="px-3.5 py-2 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda || !tanlanganlar.size ? 0.55 : 1 }}>Guruhga qo‘yish</button>
              <button type="button" onClick={() => mustaqilGuruhniSaqla(true)} disabled={saqlanmoqda || !tanlanganlar.size} className="px-3.5 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: "#F7F5F0", color: "#B0553A", opacity: saqlanmoqda || !tanlanganlar.size ? 0.55 : 1 }}>Guruhdan chiqarish</button>
            </div>}
          </div>}
          {!boshqaraOladi && <p className="text-[11px] mt-3 p-2.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#8A8578" }}>Ko‘rish mumkin. O‘zgartirish faqat admin yoki o‘quv ishlari zavuchiga ruxsat etilgan.</p>}
        </>}
        {xato && <p className="text-xs mt-2" style={{ color: "#B0553A" }}>{xato}</p>}
        {xabar && <p className="text-xs mt-2" style={{ color: "#3B6D11" }}>{xabar}</p>}
      </div>}
    </div>
  );
}

function MaktablarBolimi({ token }) {
  const [maktablar, setMaktablar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [tanlanganMaktab, setTanlanganMaktab] = useState(null); // maktab obyekti | null

  const maktablarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/maktablar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMaktablar(d.maktablar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };

  useEffect(maktablarniYukla, [token]);

  if (tanlanganMaktab) {
    return <MaktabTafsiloti token={token} maktab={tanlanganMaktab} onOrtga={() => { setTanlanganMaktab(null); maktablarniYukla(); }} />;
  }

  return (
    <div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>🏫 Maktablar</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {formOchiq ? "✕ Yopish" : "+ Yangi maktab"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#8A8578" }}>Bino va xonalarni ommaviy yarating, so‘ng 1–11-sinflarning parallel sonini alohida kiriting. 50–100 ta sinf bir bosishda hisoblanadi.</p>
      </div>

      {formOchiq && (
        <React.Suspense fallback={<div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <AdminSchoolWizard
            token={token}
            apiBase={API_BASE}
            regions={VILOYATLAR}
            districtsByRegion={HUDUDLAR}
            onCancel={() => setFormOchiq(false)}
            onCreated={(school) => { setFormOchiq(false); setTanlanganMaktab(school); maktablarniYukla(); }}
          />
        </React.Suspense>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : maktablar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali maktab qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {maktablar.map((m) => (
            <button key={m.id} onClick={() => setTanlanganMaktab(m)}
              className="w-full text-left rounded-xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{m.maktab_raqami ? `${m.maktab_raqami}-sonli ${m.nomi}` : m.nomi}</p>
                <ChevronRight size={16} style={{ color: "#8A8578" }} />
              </div>
              <p className="text-xs" style={{ color: "#8A8578" }}>
                {[m.viloyat, m.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"} · {m.smena_soni} smenali
              </p>
              <p className="text-xs mt-1" style={{ color: m.direktor_ismi ? "#3B6D11" : "#B0553A" }}>
                {m.direktor_ismi ? `👤 Direktor: ${m.direktor_ismi}` : "⚠️ Direktor hali belgilanmagan"}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MaktabTafsiloti({ token, maktab, onOrtga }) {
  const [boshSahifa, setBoshSahifa] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [importXabari, setImportXabari] = useState("");
  const [sinflar, setSinflar] = useState([]);
  const [sinflarYuklanmoqda, setSinflarYuklanmoqda] = useState(true);
  const [pulli, setPulli] = useState(maktab.pulli || false);
  const [oylikTolov, setOylikTolov] = useState(maktab.oylik_tolov ? String(maktab.oylik_tolov) : "");
  const [tolovSaqlanmoqda, setTolovSaqlanmoqda] = useState(false);
  const [fanKatalogi, setFanKatalogi] = useState([]);
  const [tanlanganFanlar, setTanlanganFanlar] = useState([]);
  const [saqlanganFanlar, setSaqlanganFanlar] = useState([]);
  const [fanlarYuklanmoqda, setFanlarYuklanmoqda] = useState(true);
  const [fanlarSaqlanmoqda, setFanlarSaqlanmoqda] = useState(false);
  const [fanXato, setFanXato] = useState("");
  const [fanXabar, setFanXabar] = useState("");
  const [yangiFanNomi, setYangiFanNomi] = useState("");

  const sinflarniYukla = () => {
    setSinflarYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/maktab_sinflari?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`)
      .then((r) => r.json())
      .then((d) => { setSinflar(d.sinflar || []); setSinflarYuklanmoqda(false); })
      .catch(() => setSinflarYuklanmoqda(false));
  };
  useEffect(sinflarniYukla, [token, maktab.id]);

  const fanlarniYukla = () => {
    setFanlarYuklanmoqda(true); setFanXato("");
    fetch(`${API_BASE}/api/admin/maktab_fan_sozlamalari?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || "Fanlarni yuklab bo'lmadi");
        return d;
      })
      .then((d) => {
        setFanKatalogi(d.fanlar || []);
        setTanlanganFanlar(d.tanlangan_fanlar || []);
        setSaqlanganFanlar(d.tanlangan_fanlar || []);
        setFanlarYuklanmoqda(false);
      })
      .catch((e) => { setFanXato(e.message); setFanlarYuklanmoqda(false); });
  };
  useEffect(fanlarniYukla, [token, maktab.id]);

  const fanTanlashniAlmashtir = (fanNomi) => {
    setFanXabar("");
    setTanlanganFanlar((avvalgi) => avvalgi.includes(fanNomi)
      ? avvalgi.filter((nom) => nom !== fanNomi)
      : [...avvalgi, fanNomi]);
  };

  const yangiFanQosh = () => {
    const toza = yangiFanNomi.trim().replace(/\s+/g, " ");
    if (toza.length < 2) { setFanXato("Yangi fan nomini kiriting"); return; }
    const mavjud = fanKatalogi.find((fan) => fan.nomi.toLocaleLowerCase("uz") === toza.toLocaleLowerCase("uz"));
    const nomi = mavjud?.nomi || toza;
    if (!mavjud) setFanKatalogi((avvalgi) => [...avvalgi, { nomi, manba: "Maktab qo‘shgan" }]);
    setTanlanganFanlar((avvalgi) => avvalgi.includes(nomi) ? avvalgi : [...avvalgi, nomi]);
    setYangiFanNomi(""); setFanXato(""); setFanXabar("Yangi fan tanlovga qo‘shildi. Endi saqlang.");
  };

  const fanlarniSaqla = async () => {
    if (!tanlanganFanlar.length) { setFanXato("Kamida bitta maktab fanini tanlang"); return; }
    setFanlarSaqlanmoqda(true); setFanXato(""); setFanXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/maktab_fan_sozlamalari`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, maktab_id: maktab.id, fanlar: tanlanganFanlar }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.detail || "Fanlarni saqlab bo'lmadi");
      setTanlanganFanlar(d.tanlangan_fanlar || []);
      setSaqlanganFanlar(d.tanlangan_fanlar || []);
      setFanXabar(`✅ ${d.tanlangan_fanlar?.length || 0} ta fan saqlandi. Endi aqlli shablonni olishingiz mumkin.`);
    } catch (e) {
      setFanXato(e.message);
    } finally {
      setFanlarSaqlanmoqda(false);
    }
  };

  const fanlarOzgargan = JSON.stringify([...tanlanganFanlar].sort()) !== JSON.stringify([...saqlanganFanlar].sort());
  const fanlarTayyor = saqlanganFanlar.length > 0 && !fanlarOzgargan;

  const parolniTashla = async (sinfId) => {
    await fetch(`${API_BASE}/api/admin/sinf_parolini_tashla?token=${encodeURIComponent(token)}&sinf_id=${sinfId}`, { method: "PUT" });
    sinflarniYukla();
  };

  const tolovSozlashniSaqla = async () => {
    setTolovSaqlanmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/maktab_tolov_sozlash`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, maktab_id: maktab.id, pulli, oylik_tolov: pulli ? parseInt(oylikTolov, 10) || null : null }),
      });
    } finally { setTolovSaqlanmoqda(false); }
  };

  const shablonYukla = () => {
    if (!fanlarTayyor) { setFanXato("Avval maktab fanlarini tanlab saqlang"); return; }
    window.open(`${API_BASE}/api/admin/xodim_shablon?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`, "_blank");
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    if (!fanlarTayyor) {
      setXato("Avval maktab fanlarini tanlab saqlang");
      e.target.value = "";
      return;
    }
    setImportlanmoqda(true); setXato(""); setImportXabari("");
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/xodim_import?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`, {
        method: "POST", body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Xato");
      }
      // Parollar ekranga chiqarilmaydi — to'g'ridan-to'g'ri Word hujjat qilib yuklab olinadi.
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = "xodimlar_kirish_kodlari.docx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
      setImportXabari("✅ Import yakunlandi — kirish kodlari Word fayl qilib yuklab olindi.");
      sinflarniYukla();
      setBoshSahifa(true);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  if (boshSahifa) {
    return (
      <SchoolWorkspace
        token={token}
        apiBase={API_BASE}
        initialWorkspace={{ muassasa_id: maktab.id, muassasa_nomi: maktab.nomi, lavozim: "direktor" }}
        onBack={() => setBoshSahifa(false)}
        onLegacy={() => setBoshSahifa(false)}
        adminPreview={true}
      />
    );
  }

  return (
    <div>
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Maktablar</button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{maktab.maktab_raqami ? `${maktab.maktab_raqami}-sonli ${maktab.nomi}` : maktab.nomi}</h1>
          <p className="text-xs" style={{ color: "#8A8578" }}>
            {[maktab.viloyat, maktab.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"} · {maktab.smena_soni} smenali
          </p>
        </div>
        <button onClick={() => setBoshSahifa(true)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg,#1B4B7A,#0F7C82)" }}>
          🏫 Maktab bosh sahifasi
        </button>
      </div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>💳 To'lov sozlamalari</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setPulli(false)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={!pulli ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
            Bepul (davlat)
          </button>
          <button onClick={() => setPulli(true)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={pulli ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
            Pulli (xususiy)
          </button>
        </div>
        {pulli && (
          <>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Oylik to'lov (so'm)</label>
            <input type="number" value={oylikTolov} onChange={(e) => setOylikTolov(e.target.value)}
              placeholder="masalan: 500000"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          </>
        )}
        <button onClick={tolovSozlashniSaqla} disabled={tolovSaqlanmoqda}
          className="w-full py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A", opacity: tolovSaqlanmoqda ? 0.7 : 1 }}>
          {tolovSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: fanlarTayyor ? "#BFD5AA" : "#E5E1D8" }}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>2-bosqich — Maktab fanlarini tanlash</p>
            <p className="text-xs mt-1" style={{ color: "#8A8578" }}>
              Shu maktabda o‘tiladigan barcha fanlarni belgilang. Faqat saqlangan fanlar xodim Excelidagi aqlli tanlovga tushadi.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: fanlarTayyor ? "#EAF4DF" : "#F7F5F0", color: fanlarTayyor ? "#3B6D11" : "#8A8578" }}>
            {fanlarTayyor ? `${saqlanganFanlar.length} ta saqlangan` : "Saqlanmagan"}
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-2 mt-4">
          <input value={yangiFanNomi} onChange={(e) => setYangiFanNomi(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); yangiFanQosh(); } }} placeholder="Ro‘yxatda yo‘q fan nomini yozing..." className="px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          <button type="button" onClick={yangiFanQosh} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>＋ Fan qo‘shish</button>
        </div>
        {fanlarYuklanmoqda ? (
          <div className="py-8 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : fanKatalogi.length === 0 ? (
          <p className="text-xs mt-4 p-3 rounded-xl" style={{ backgroundColor: "#FFF5E2", color: "#8A5A1C" }}>
            Tavsiya fanlari topilmadi. Yuqoridagi maydondan fanlarni qo‘lda kiriting.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mt-4 mb-3">
              <button type="button" onClick={() => { setTanlanganFanlar(fanKatalogi.map((fan) => fan.nomi)); setFanXabar(""); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                ✓ Barchasini tanlash
              </button>
              <button type="button" onClick={() => { setTanlanganFanlar([]); setFanXabar(""); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                Tanlovni tozalash
              </button>
              <span className="px-3 py-2 text-xs" style={{ color: "#8A8578" }}>
                Tanlandi: {tanlanganFanlar.length}/{fanKatalogi.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {fanKatalogi.map((fan) => {
                const tanlangan = tanlanganFanlar.includes(fan.nomi);
                return (
                  <button key={fan.nomi} type="button" onClick={() => fanTanlashniAlmashtir(fan.nomi)}
                    className="text-left rounded-xl border p-3 flex items-start gap-2.5"
                    style={tanlangan
                      ? { backgroundColor: "#EAF1F7", borderColor: "#1B4B7A", color: "#1B4B7A" }
                      : { backgroundColor: "#fff", borderColor: "#E5E1D8", color: "#5A5648" }}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ backgroundColor: tanlangan ? "#1B4B7A" : "#F7F5F0", color: tanlangan ? "#fff" : "#A39D8E" }}>
                      {tanlangan ? "✓" : ""}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{fan.nomi}</span>
                      <span className="block text-xs mt-0.5" style={{ color: "#8A8578" }}>
                        {fan.manba || "DTS tavsiyasi"} · sinfga avtomatik biriktirilmaydi
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={fanlarniSaqla}
              disabled={fanlarSaqlanmoqda || !tanlanganFanlar.length || (!fanlarOzgargan && fanlarTayyor)}
              className="w-full py-3 rounded-xl font-semibold text-sm mt-4"
              style={{
                backgroundColor: fanlarOzgargan ? "#1B4B7A" : "#D7E0E7",
                color: "#fff",
                opacity: fanlarSaqlanmoqda || !tanlanganFanlar.length ? 0.65 : 1,
              }}>
              {fanlarSaqlanmoqda ? "Saqlanmoqda..." : fanlarOzgargan ? "Tanlangan fanlarni saqlash" : "Fanlar saqlangan"}
            </button>
          </>
        )}
        {fanXato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{fanXato}</p>}
        {fanXabar && <p className="text-sm mt-3" style={{ color: "#3B6D11" }}>{fanXabar}</p>}
      </div>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>3-bosqich — Xodimlarni kiritish</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Katakni bosib lavozim, sinf, fan va toifani tayyor ro‘yxatdan tanlang.
          Bir xodim bir nechta sinf yoki fan o‘tsa, <b>DARS_BIRIKMALARI</b> varag‘ida har bir Xodim–Sinf–Fan–Guruh birikmasini alohida qatorga tanlang.
        </p>
        {!fanlarTayyor && <p className="text-xs mb-3 p-3 rounded-xl" style={{ backgroundColor: "#FFF5E2", color: "#8A5A1C" }}>Avval yuqoridagi maktab fanlarini tanlab saqlang.</p>}
        <button onClick={shablonYukla} disabled={!fanlarTayyor}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A", opacity: fanlarTayyor ? 1 : 0.5 }}>
          📥 Shablonni yuklab olish
        </button>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648", opacity: fanlarTayyor ? 1 : 0.5, cursor: fanlarTayyor ? "pointer" : "not-allowed" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 To'ldirilgan faylni yuklash"}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda || !fanlarTayyor} className="hidden" />
        </label>
        {xato && <p className="text-sm mt-3 whitespace-pre-line" style={{ color: "#B0553A" }}>{xato}</p>}
      </div>

      {importXabari && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold" style={{ color: "#3B6D11" }}>{importXabari}</p>
        </div>
      )}

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>4-bosqich — Sinflar</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Sinflar avval yaratiladi. Xodim importi yangi sinf yaratmaydi; mavjud sinfga rahbar va dars beruvchi xodimlarni bog‘laydi.
        </p>
        {sinflarYuklanmoqda ? (
          <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : sinflar.length === 0 ? (
          <p className="text-xs" style={{ color: "#8A8578" }}>Hali sinf yo‘q — avval maktab yaratish oynasida sinflarni yarating.</p>
        ) : (
          <div className="space-y-2">
            {sinflar.map((s) => (
              <div key={s.id} className="rounded-xl p-3.5" style={{ backgroundColor: "#F7F5F0" }}>
                <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <div>
                  <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{s.rahbar_ismi || "Rahbar belgilanmagan"} · {s.psixolog_ismi || "Psixolog belgilanmagan"}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{s.smena || 1}-smena{s.bino ? ` · ${s.bino}` : ""}{s.xona ? ` · ${s.xona}-xona` : ""}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "#8A5A1C" }}>🔐 {s.qoshilish_paroli}</p>
                  </div>
                  <button onClick={() => parolniTashla(s.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
                    ↻ Parolni tashlash
                  </button>
                </div>
                <SinfGuruhBoshqaruvi token={token} sinf={s} fanlar={saqlanganFanlar} onSaved={sinflarniYukla} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarkazlarBolimi({ token }) {
  const [markazlar, setMarkazlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [nomi, setNomi] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [tuman, setTuman] = useState("");
  const [direktor, setDirektor] = useState(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [tanlanganMarkaz, setTanlanganMarkaz] = useState(null);

  const markazlarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/markazlar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMarkazlar(d.markazlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(markazlarniYukla, [token]);

  const markazSaqla = async () => {
    if (!nomi.trim()) { setXato("Markaz nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/markaz_yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, nomi: nomi.trim(), viloyat: viloyat || undefined, tuman: tuman || undefined,
          direktor_user_id: direktor ? direktor.user_id : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setViloyat(""); setTuman(""); setDirektor(null); setFormOchiq(false);
      markazlarniYukla();
    } catch (e) {
      setXato(e.message);
    } finally { setSaqlanmoqda(false); }
  };

  if (tanlanganMarkaz) {
    return <MarkazTafsiloti token={token} markaz={tanlanganMarkaz} onOrtga={() => { setTanlanganMarkaz(null); markazlarniYukla(); }} />;
  }

  return (
    <div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>🎓 O'quv markazlari</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {formOchiq ? "✕ Yopish" : "+ Yangi markaz"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#8A8578" }}>Repetitorlik/o'quv markazlari uchun — guruhlar mavjud to'garak tizimi orqali ishlaydi.</p>
      </div>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Markaz nomi</label>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)}
            placeholder="masalan: Iqbol o'quv markazi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Viloyat</label>
              <select value={viloyat} onChange={(e) => { setViloyat(e.target.value); setTuman(""); }}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                <option value="">—</option>
                {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
              <select value={tuman} onChange={(e) => setTuman(e.target.value)} disabled={!viloyat}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: viloyat ? 1 : 0.5 }}>
                <option value="">—</option>
                {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Direktor (ixtiyoriy)</label>
          <DirektorQidiruvi token={token} tanlanganDirektor={direktor} onTanla={setDirektor} />

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={markazSaqla} disabled={saqlanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Markazni yaratish"}
          </button>
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : markazlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali markaz qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {markazlar.map((m) => (
            <button key={m.id} onClick={() => setTanlanganMarkaz(m)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{m.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{[m.viloyat, m.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"}</p>
                <p className="text-xs mt-1" style={{ color: m.direktor_ismi ? "#3B6D11" : "#B0553A" }}>
                  {m.direktor_ismi ? `👤 Direktor: ${m.direktor_ismi}` : "⚠️ Direktor hali belgilanmagan"}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MarkazTafsiloti({ token, markaz, onOrtga }) {
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natijalar, setNatijalar] = useState(null);

  const shablonYukla = () => {
    window.open(`${API_BASE}/api/admin/markaz_xodim_shablon?token=${encodeURIComponent(token)}`, "_blank");
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatijalar(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/markaz_xodim_import?token=${encodeURIComponent(token)}&markaz_id=${markaz.id}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatijalar(data.natijalar || []);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Markazlar</button>
      <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{markaz.nomi}</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{[markaz.viloyat, markaz.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"}</p>

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>Xodimlarni kiritish</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Shablonni yuklab, F.I.Sh / Lavozimni to'ldirib, qayta yuklang. "Fan o'qituvchisi" bo'lganlar keyin to'garak (guruh) yaratganda,
          u avtomatik shu markazga bog'lanadi — alohida ulash shart emas.
        </p>
        <button onClick={shablonYukla}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
          📥 Shablonni yuklab olish
        </button>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 To'ldirilgan faylni yuklash"}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
        </label>
        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
      </div>

      {natijalar && (
        <div className="rounded-2xl p-5 bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>✅ {natijalar.length} ta xodim qo'shildi</p>
          <p className="text-xs mb-4" style={{ color: "#B0553A" }}>
            Diqqat: bu kodlarni endi shu yerdan nusxalab, har bir xodimga yuboring — bu ekranga qayta qaytib bo'lmaydi!
          </p>
          <div className="space-y-2.5">
            {natijalar.map((n, i) => (
              <div key={i} className="rounded-xl p-3.5" style={{ backgroundColor: "#F7F5F0" }}>
                <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{n.fish}</p>
                <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>{n.lavozim}</p>
                <p className="text-xs font-mono" style={{ color: "#1B4B7A" }}>🔑 Kirish kodi: <b>{n.kirish_kodi}</b></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BogchalarBolimi({ token }) {
  const [bogchalar, setBogchalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [nomi, setNomi] = useState("");
  const [turi, setTuri] = useState("xususiy");
  const [viloyat, setViloyat] = useState("");
  const [tuman, setTuman] = useState("");
  const [direktor, setDirektor] = useState(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [tanlanganBogcha, setTanlanganBogcha] = useState(null);

  const bogchalarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/bogchalar`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      credentials: "omit",
    })
      .then((r) => r.json())
      .then((d) => { setBogchalar(d.bogchalar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(bogchalarniYukla, [token]);

  const bogchaSaqla = async () => {
    if (!nomi.trim()) { setXato("Bog'cha nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/bogcha_yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, nomi: nomi.trim(), turi, viloyat: viloyat || undefined, tuman: tuman || undefined,
          direktor_user_id: direktor ? direktor.user_id : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setTuri("xususiy"); setViloyat(""); setTuman(""); setDirektor(null); setFormOchiq(false);
      bogchalarniYukla();
    } catch (e) {
      setXato(e.message);
    } finally { setSaqlanmoqda(false); }
  };

  if (tanlanganBogcha) {
    return <BogchaTafsiloti token={token} bogcha={tanlanganBogcha} onOrtga={() => { setTanlanganBogcha(null); bogchalarniYukla(); }} />;
  }

  return (
    <div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>🧸 Bog'chalar</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {formOchiq ? "✕ Yopish" : "+ Yangi bog'cha"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#8A8578" }}>Xususiy/davlat bog'chalar — direktor, zam, opalar va guruhlar bilan.</p>
      </div>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Bog'cha nomi</label>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)}
            placeholder="masalan: Quyoshcha bog'chasi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Turi</label>
          <div className="flex gap-2 mb-3">
            {Object.entries({ xususiy: "Xususiy", davlat: "Davlat" }).map(([k, v]) => (
              <button key={k} onClick={() => setTuri(k)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                style={turi === k ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
                {v}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Viloyat</label>
              <select value={viloyat} onChange={(e) => { setViloyat(e.target.value); setTuman(""); }}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                <option value="">—</option>
                {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
              <select value={tuman} onChange={(e) => setTuman(e.target.value)} disabled={!viloyat}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: viloyat ? 1 : 0.5 }}>
                <option value="">—</option>
                {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Direktor (ixtiyoriy)</label>
          <DirektorQidiruvi token={token} tanlanganDirektor={direktor} onTanla={setDirektor} />

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={bogchaSaqla} disabled={saqlanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Bog'chani yaratish"}
          </button>
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : bogchalar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali bog'cha qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bogchalar.map((b) => (
            <button key={b.id} onClick={() => setTanlanganBogcha(b)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{b.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>
                  {b.turi === "xususiy" ? "Xususiy" : "Davlat"} · {[b.viloyat, b.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"}
                </p>
                <p className="text-xs mt-1" style={{ color: b.direktor_ismi ? "#3B6D11" : "#B0553A" }}>
                  {b.direktor_ismi ? `👤 Direktor: ${b.direktor_ismi}` : "⚠️ Direktor hali belgilanmagan"}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BogchaTafsiloti({ token, bogcha, onOrtga }) {
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natijalar, setNatijalar] = useState(null);

  const shablonYukla = async () => {
    setXato("");
    try {
      const response = await fetch(`${API_BASE}/api/admin/bogcha_xodim_shablon`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        credentials: "omit",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Shablonni yuklab bo‘lmadi");
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      const download = document.createElement("a");
      download.href = blobUrl;
      download.download = "bogcha_xodimlar_shablon.xlsx";
      download.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setXato(error.message);
    }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatijalar(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/bogcha_xodim_import?bogcha_id=${bogcha.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        cache: "no-store",
        credentials: "omit",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatijalar(data.natijalar || []);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Bog'chalar</button>
      <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{bogcha.nomi}</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
        {bogcha.turi === "xususiy" ? "Xususiy" : "Davlat"} · {[bogcha.viloyat, bogcha.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"}
      </p>

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>Xodimlarni kiritish</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Shablonni yuklab, F.I.Sh / Lavozim / Guruh rahbarligini to'ldirib, qayta yuklang.
          "Bog'cha opasi" bo'lganlar uchun guruh nomini yozsangiz, o'sha guruh avtomatik yaratiladi.
        </p>
        <button onClick={shablonYukla}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
          📥 Shablonni yuklab olish
        </button>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 To'ldirilgan faylni yuklash"}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
        </label>
        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
      </div>

      {natijalar && (
        <div className="rounded-2xl p-5 bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>✅ {natijalar.length} ta xodim qo'shildi</p>
          <p className="text-xs mb-4" style={{ color: "#B0553A" }}>
            Diqqat: bu kodlarni endi shu yerdan nusxalab, har bir xodimga yuboring — bu ekranga qayta qaytib bo'lmaydi!
          </p>
          <div className="space-y-2.5">
            {natijalar.map((n, i) => (
              <div key={i} className="rounded-xl p-3.5" style={{ backgroundColor: "#F7F5F0" }}>
                <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{n.fish}</p>
                <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>{n.lavozim}{n.guruh_nomi ? ` · ${n.guruh_nomi}` : ""}</p>
                <p className="text-xs font-mono" style={{ color: "#1B4B7A" }}>🔑 Kirish kodi: <b>{n.kirish_kodi}</b></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UniversitetlarBolimi({ token }) {
  const [holat, setHolat] = useState("universitet"); // universitet | fakultet | kafedra | guruh
  const [universitetlar, setUniversitetlar] = useState([]);
  const [fakultetlar, setFakultetlar] = useState([]);
  const [kafedralar, setKafedralar] = useState([]);
  const [guruhlar, setGuruhlar] = useState([]);
  const [tUniversitet, setTUniversitet] = useState(null);
  const [tFakultet, setTFakultet] = useState(null);
  const [tKafedra, setTKafedra] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [xato, setXato] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);

  const [nomi, setNomi] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [tuman, setTuman] = useState("");
  const [kurs, setKurs] = useState("");
  const [yonalish, setYonalish] = useState("");
  const [rahbar, setRahbar] = useState(null);

  const formniTozala = () => { setNomi(""); setViloyat(""); setTuman(""); setKurs(""); setYonalish(""); setRahbar(null); setFormOchiq(false); setXato(""); };

  const universitetlarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/universitetlar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json()).then((d) => { setUniversitetlar(d.universitetlar || []); setYuklanmoqda(false); }).catch(() => setYuklanmoqda(false));
  };
  useEffect(universitetlarniYukla, [token]);

  const fakultetlarniYukla = (universitetId) => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/fakultetlar?token=${encodeURIComponent(token)}&universitet_id=${universitetId}`)
      .then((r) => r.json()).then((d) => { setFakultetlar(d.fakultetlar || []); setYuklanmoqda(false); }).catch(() => setYuklanmoqda(false));
  };
  const kafedralarniYukla = (fakultetId) => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/kafedralar?token=${encodeURIComponent(token)}&fakultet_id=${fakultetId}`)
      .then((r) => r.json()).then((d) => { setKafedralar(d.kafedralar || []); setYuklanmoqda(false); }).catch(() => setYuklanmoqda(false));
  };
  const guruhlarniYukla = (kafedraId) => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/universitet_guruhlari?token=${encodeURIComponent(token)}&kafedra_id=${kafedraId}`)
      .then((r) => r.json()).then((d) => { setGuruhlar(d.guruhlar || []); setYuklanmoqda(false); }).catch(() => setYuklanmoqda(false));
  };

  const universitetOch = (u) => { setTUniversitet(u); setHolat("fakultet"); formniTozala(); fakultetlarniYukla(u.id); };
  const fakultetOch = (f) => { setTFakultet(f); setHolat("kafedra"); formniTozala(); kafedralarniYukla(f.id); };
  const kafedraOch = (k) => { setTKafedra(k); setHolat("guruh"); formniTozala(); guruhlarniYukla(k.id); };

  const universitetSaqla = async () => {
    if (!nomi.trim()) { setXato("Nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/universitet_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nomi: nomi.trim(), viloyat: viloyat || undefined, tuman: tuman || undefined, rektor_user_id: rahbar ? rahbar.user_id : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formniTozala(); universitetlarniYukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const fakultetSaqla = async () => {
    if (!nomi.trim()) { setXato("Nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/fakultet_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, universitet_id: tUniversitet.id, nomi: nomi.trim(), dekan_user_id: rahbar ? rahbar.user_id : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formniTozala(); fakultetlarniYukla(tUniversitet.id);
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const kafedraSaqla = async () => {
    if (!nomi.trim()) { setXato("Nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/kafedra_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fakultet_id: tFakultet.id, nomi: nomi.trim(), mudir_user_id: rahbar ? rahbar.user_id : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formniTozala(); kafedralarniYukla(tFakultet.id);
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const guruhSaqla = async () => {
    if (!nomi.trim()) { setXato("Nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/universitet_guruh_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, kafedra_id: tKafedra.id, nomi: nomi.trim(),
          kurs: kurs ? parseInt(kurs, 10) : undefined, yonalish: yonalish || undefined,
          rahbar_user_id: rahbar ? rahbar.user_id : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formniTozala(); guruhlarniYukla(tKafedra.id);
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const ortgaQaytish = () => {
    if (holat === "guruh") { setHolat("kafedra"); formniTozala(); }
    else if (holat === "kafedra") { setHolat("fakultet"); formniTozala(); }
    else if (holat === "fakultet") { setHolat("universitet"); formniTozala(); universitetlarniYukla(); }
  };

  const sarlavhalar = { universitet: "🎓 Universitetlar", fakultet: `📚 ${tUniversitet?.nomi} — Fakultetlar`, kafedra: `🏛 ${tFakultet?.nomi} — Kafedralar`, guruh: `👥 ${tKafedra?.nomi} — Guruhlar` };
  const royxat = holat === "universitet" ? universitetlar : holat === "fakultet" ? fakultetlar : holat === "kafedra" ? kafedralar : guruhlar;

  return (
    <div>
      {holat !== "universitet" && (
        <button onClick={ortgaQaytish} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      )}
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{sarlavhalar[holat]}</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {formOchiq ? "✕ Yopish" : "+ Yangi"}
          </button>
        </div>
        {holat === "universitet" && <p className="text-xs" style={{ color: "#8A8578" }}>Rektor → Dekan → Kafedra mudiri → Guruh kuratori tuzilmasi.</p>}
      </div>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Nomi</label>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)}
            placeholder={holat === "universitet" ? "masalan: Samarqand Davlat Universiteti" : holat === "fakultet" ? "masalan: Matematika fakulteti" : holat === "kafedra" ? "masalan: Algebra va geometriya kafedrasi" : "masalan: 201-guruh"}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />

          {holat === "universitet" && (
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Viloyat</label>
                <select value={viloyat} onChange={(e) => { setViloyat(e.target.value); setTuman(""); }}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                  <option value="">—</option>
                  {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
                <select value={tuman} onChange={(e) => setTuman(e.target.value)} disabled={!viloyat}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: viloyat ? 1 : 0.5 }}>
                  <option value="">—</option>
                  {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}

          {holat === "guruh" && (
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Kurs</label>
                <select value={kurs} onChange={(e) => setKurs(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, 6].map((k) => <option key={k} value={k}>{k}-kurs</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Yo'nalish</label>
                <input type="text" value={yonalish} onChange={(e) => setYonalish(e.target.value)}
                  placeholder="masalan: Matematika"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
              </div>
            </div>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
            {holat === "universitet" ? "Rektor (ixtiyoriy)" : holat === "fakultet" ? "Dekan (ixtiyoriy)" : holat === "kafedra" ? "Kafedra mudiri (ixtiyoriy)" : "Guruh kuratori (ixtiyoriy)"}
          </label>
          <DirektorQidiruvi token={token} tanlanganDirektor={rahbar} onTanla={setRahbar} />

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={holat === "universitet" ? universitetSaqla : holat === "fakultet" ? fakultetSaqla : holat === "kafedra" ? kafedraSaqla : guruhSaqla}
            disabled={saqlanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Yaratish"}
          </button>
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : royxat.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {holat === "universitet" && universitetlar.map((u) => (
            <button key={u.id} onClick={() => universitetOch(u)} className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{u.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{[u.viloyat, u.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"} · {u.fakultet_soni} fakultet</p>
                <p className="text-xs mt-1" style={{ color: u.rektor_ismi ? "#3B6D11" : "#B0553A" }}>{u.rektor_ismi ? `👤 Rektor: ${u.rektor_ismi}` : "⚠️ Rektor belgilanmagan"}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
          {holat === "fakultet" && fakultetlar.map((f) => (
            <button key={f.id} onClick={() => fakultetOch(f)} className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{f.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{f.kafedra_soni} kafedra</p>
                <p className="text-xs mt-1" style={{ color: f.dekan_ismi ? "#3B6D11" : "#B0553A" }}>{f.dekan_ismi ? `👤 Dekan: ${f.dekan_ismi}` : "⚠️ Dekan belgilanmagan"}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
          {holat === "kafedra" && kafedralar.map((k) => (
            <button key={k.id} onClick={() => kafedraOch(k)} className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{k.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{k.guruh_soni} guruh</p>
                <p className="text-xs mt-1" style={{ color: k.mudir_ismi ? "#3B6D11" : "#B0553A" }}>{k.mudir_ismi ? `👤 Mudir: ${k.mudir_ismi}` : "⚠️ Mudir belgilanmagan"}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
          {holat === "guruh" && guruhlar.map((g) => (
            <div key={g.id} className="rounded-xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{g.nomi}</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>
                {g.kurs ? `${g.kurs}-kurs` : ""}{g.yonalish ? ` · ${g.yonalish}` : ""} · {g.talaba_soni} talaba
              </p>
              <p className="text-xs mt-1" style={{ color: g.rahbar_ismi ? "#3B6D11" : "#B0553A" }}>{g.rahbar_ismi ? `👤 Kurator: ${g.rahbar_ismi}` : "⚠️ Kurator belgilanmagan"}</p>
              <p className="text-xs font-mono mt-1" style={{ color: "#8A5A1C" }}>🔐 Qo'shilish paroli: {g.qoshilish_paroli}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaktabOdamQidiruvi({ token, maktabId, tanlanganOdam, onTanla }) {
  const [ism, setIsm] = useState("");
  const [natijalar, setNatijalar] = useState([]);

  useEffect(() => {
    if (ism.trim().length < 2) { setNatijalar([]); return; }
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/maktab/odam_qidir?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&ism=${encodeURIComponent(ism.trim())}`)
        .then((r) => r.json())
        .then((d) => setNatijalar(d.natijalar || []))
        .catch(() => {});
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [ism, token, maktabId]);

  if (tanlanganOdam) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-2" style={{ backgroundColor: "#EAF1F7" }}>
        <span className="text-xs font-medium" style={{ color: "#1B4B7A" }}>👤 {tanlanganOdam.full_name}</span>
        <button onClick={() => onTanla(null)} className="text-xs font-medium" style={{ color: "#8A8578" }}>✕</button>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)}
        placeholder="Ism bo'yicha qidiring..."
        className="w-full px-3.5 py-2 rounded-lg border text-xs" style={{ borderColor: "#E5E1D8" }} />
      {natijalar.length > 0 && (
        <div className="mt-1 space-y-1">
          {natijalar.map((o) => (
            <button key={o.user_id} onClick={() => { onTanla(o); setIsm(""); setNatijalar([]); }}
              className="w-full flex items-center px-3 py-1.5 rounded-lg text-left" style={{ backgroundColor: "#F7F5F0" }}>
              <span className="text-xs" style={{ color: "#2B2B2B" }}>{o.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const HAFTA_KUNLARI_RO = [
  { raqam: 1, nomi: "Dushanba" }, { raqam: 2, nomi: "Seshanba" }, { raqam: 3, nomi: "Chorshanba" },
  { raqam: 4, nomi: "Payshanba" }, { raqam: 5, nomi: "Juma" }, { raqam: 6, nomi: "Shanba" },
];
const TADBIR_TURLARI_RO = { tadbir: "🎉 Tadbir", majlis: "👥 Majlis", tatil: "🏖 Ta'til" };

function RejalashtirishBolimi({ token, maktabId, onOrtga }) {
  const [tepaKorinish, setTepaKorinish] = useState("taqvim"); // "taqvim" | "jadval"

  const [tadbirlar, setTadbirlar] = useState([]);
  const [tadbirYuklanmoqda, setTadbirYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [turi, setTuri] = useState("tadbir");
  const [sarlavha, setSarlavha] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [boshlanishSana, setBoshlanishSana] = useState("");
  const [tugashSana, setTugashSana] = useState("");
  const [vaqt, setVaqt] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const [sinflar, setSinflar] = useState([]);
  const [sinflarYuklanmoqda, setSinflarYuklanmoqda] = useState(true);
  const [tanlanganSinf, setTanlanganSinf] = useState(null);
  const [jadval, setJadval] = useState(null);
  const [jadvalYuklanmoqda, setJadvalYuklanmoqda] = useState(false);
  const [tahrirlanayotganSlot, setTahrirlanayotganSlot] = useState(null);
  const [slotFan, setSlotFan] = useState("");
  const [slotXona, setSlotXona] = useState("");

  const tadbirlarniYukla = () => {
    setTadbirYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/tadbirlar?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { setTadbirlar(d.tadbirlar || []); setTadbirYuklanmoqda(false); })
      .catch(() => setTadbirYuklanmoqda(false));
  };
  useEffect(tadbirlarniYukla, [token, maktabId]);

  useEffect(() => {
    setSinflarYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/dashboard?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { setSinflar(d.sinflar || []); setSinflarYuklanmoqda(false); })
      .catch(() => setSinflarYuklanmoqda(false));
  }, [token, maktabId]);

  const tadbirSaqla = async () => {
    if (!sarlavha.trim()) { setXato("Sarlavhani kiriting"); return; }
    if (!boshlanishSana) { setXato("Sanani tanlang"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/tadbir_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, maktab_id: maktabId, turi, sarlavha: sarlavha.trim(), tavsif: tavsif || undefined,
          boshlanish_sana: boshlanishSana, tugash_sana: tugashSana || undefined, vaqt: vaqt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSarlavha(""); setTavsif(""); setBoshlanishSana(""); setTugashSana(""); setVaqt(""); setFormOchiq(false);
      tadbirlarniYukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const tadbirOchir = async (id) => {
    await fetch(`${API_BASE}/api/maktab/tadbir_ochir?token=${encodeURIComponent(token)}&tadbir_id=${id}`, { method: "DELETE" });
    tadbirlarniYukla();
  };

  const sinfOch = (s) => {
    setTanlanganSinf(s);
    setJadvalYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/dars_jadvali?token=${encodeURIComponent(token)}&sinf_id=${s.id}`)
      .then((r) => r.json())
      .then((d) => { setJadval(d); setJadvalYuklanmoqda(false); })
      .catch(() => setJadvalYuklanmoqda(false));
  };

  const slotniOch = (kun, darsRaqami, mavjudSlot) => {
    setTahrirlanayotganSlot({ kun, dars_raqami: darsRaqami });
    setSlotFan(mavjudSlot ? mavjudSlot.fan : "");
    setSlotXona(mavjudSlot ? mavjudSlot.xona || "" : "");
  };

  const slotSaqla = async () => {
    if (!slotFan.trim()) return;
    await fetch(`${API_BASE}/api/maktab/dars_jadvali_belgila`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token, sinf_id: tanlanganSinf.id, kun: tahrirlanayotganSlot.kun,
        dars_raqami: tahrirlanayotganSlot.dars_raqami, fan: slotFan.trim(), xona: slotXona || undefined,
      }),
    });
    setTahrirlanayotganSlot(null);
    sinfOch(tanlanganSinf);
  };

  const slotOchir = async () => {
    await fetch(`${API_BASE}/api/maktab/dars_jadvali_ochir?token=${encodeURIComponent(token)}&sinf_id=${tanlanganSinf.id}&kun=${tahrirlanayotganSlot.kun}&dars_raqami=${tahrirlanayotganSlot.dars_raqami}`, { method: "DELETE" });
    setTahrirlanayotganSlot(null);
    sinfOch(tanlanganSinf);
  };

  if (tanlanganSinf) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganSinf(null); setJadval(null); }} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Sinflar</button>
        <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>🗓 {tanlanganSinf.sinf}-{tanlanganSinf.harf} jadvali</h1>

        {tahrirlanayotganSlot && (
          <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#1B4B7A" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#1B4B7A" }}>
              {HAFTA_KUNLARI_RO.find((k) => k.raqam === tahrirlanayotganSlot.kun)?.nomi} · {tahrirlanayotganSlot.dars_raqami}-dars
            </p>
            <input type="text" value={slotFan} onChange={(e) => setSlotFan(e.target.value)} placeholder="Fan nomi"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
            <input type="text" value={slotXona} onChange={(e) => setSlotXona(e.target.value)} placeholder="Xona (ixtiyoriy)"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            <div className="flex gap-2">
              <button onClick={slotSaqla} className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A" }}>Saqlash</button>
              <button onClick={slotOchir} className="px-4 py-2.5 rounded-xl font-medium text-sm" style={{ backgroundColor: "#fff", color: "#A32D2D", border: "1px solid #E5E1D8" }}>Tozalash</button>
              <button onClick={() => setTahrirlanayotganSlot(null)} className="px-4 py-2.5 rounded-xl font-medium text-sm" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }}>Bekor</button>
            </div>
          </div>
        )}

        {jadvalYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <div className="space-y-4">
            {HAFTA_KUNLARI_RO.map((kun) => (
              <div key={kun.raqam}>
                <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>{kun.nomi}</p>
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((darsRaqami) => {
                    const slot = (jadval?.slotlar || []).find((s) => s.kun === kun.raqam && s.dars_raqami === darsRaqami);
                    return (
                      <button key={darsRaqami} onClick={() => slotniOch(kun.raqam, darsRaqami, slot)}
                        className="w-full text-left rounded-lg px-3 py-2 flex items-center gap-2"
                        style={{ backgroundColor: slot ? "#EAF1F7" : "#F7F5F0" }}>
                        <span className="text-xs font-bold w-4 shrink-0" style={{ color: "#8A8578" }}>{darsRaqami}</span>
                        <span className="text-xs" style={{ color: slot ? "#1B4B7A" : "#8A8578" }}>
                          {slot ? `${slot.fan}${slot.xona ? ` · ${slot.xona}` : ""}` : "— bo'sh —"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>📅 Rejalashtirish</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTepaKorinish("taqvim")}
          className="flex-1 py-2 rounded-lg text-xs font-semibold"
          style={tepaKorinish === "taqvim" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
          📅 Taqvim
        </button>
        <button onClick={() => setTepaKorinish("jadval")}
          className="flex-1 py-2 rounded-lg text-xs font-semibold"
          style={tepaKorinish === "jadval" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
          🗓 Dars jadvali
        </button>
      </div>

      {tepaKorinish === "taqvim" ? (
        <>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>Kelayotgan tadbirlar</p>
            <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
              {formOchiq ? "✕ Yopish" : "+ Yangi"}
            </button>
          </div>

          {formOchiq && (
            <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex gap-1.5 mb-2.5">
                {Object.entries(TADBIR_TURLARI_RO).map(([k, v]) => (
                  <button key={k} onClick={() => setTuri(k)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold"
                    style={turi === k ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                    {v}
                  </button>
                ))}
              </div>
              <input type="text" value={sarlavha} onChange={(e) => setSarlavha(e.target.value)} placeholder="Sarlavha"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
              <input type="text" value={tavsif} onChange={(e) => setTavsif(e.target.value)} placeholder="Tavsif (ixtiyoriy)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Boshlanish sanasi</label>
                  <input type="date" value={boshlanishSana} onChange={(e) => setBoshlanishSana(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Tugash sanasi (ixtiyoriy)</label>
                  <input type="date" value={tugashSana} onChange={(e) => setTugashSana(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
                </div>
              </div>
              {turi !== "tatil" && (
                <input type="text" value={vaqt} onChange={(e) => setVaqt(e.target.value)} placeholder="Vaqt (masalan 14:00, ixtiyoriy)"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              )}
              {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
              <button onClick={tadbirSaqla} disabled={saqlanmoqda}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
                {saqlanmoqda ? "Saqlanmoqda..." : "Qo'shish"}
              </button>
            </div>
          )}

          {tadbirYuklanmoqda ? (
            <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : tadbirlar.length === 0 ? (
            <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm" style={{ color: "#8A8578" }}>Kelayotgan tadbir yo'q.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tadbirlar.map((t) => (
                <div key={t.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{TADBIR_TURLARI_RO[t.turi]} · {t.sarlavha}</p>
                    <button onClick={() => tadbirOchir(t.id)} className="text-xs" style={{ color: "#A32D2D" }}>✕</button>
                  </div>
                  <p className="text-xs" style={{ color: "#8A8578" }}>
                    {t.boshlanish_sana}{t.tugash_sana ? ` — ${t.tugash_sana}` : ""}{t.vaqt ? ` · ${t.vaqt}` : ""}
                  </p>
                  {t.tavsif && <p className="text-xs mt-1" style={{ color: "#5A5648" }}>{t.tavsif}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>Sinfni tanlang</p>
          {sinflarYuklanmoqda ? (
            <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : (
            <div className="space-y-2">
              {sinflar.map((s) => (
                <button key={s.id} onClick={() => sinfOch(s)}
                  className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                  <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                  <ChevronRight size={16} style={{ color: "#8A8578" }} />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HujjatlarBolimi({ token, maktabId, onOrtga }) {
  const [hujjatlar, setHujjatlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [nomi, setNomi] = useState("");
  const [turi, setTuri] = useState("buyruq");
  const [izoh, setIzoh] = useState("");
  const [tanlanganFayl, setTanlanganFayl] = useState(null);
  const [yuklanyapti, setYuklanyapti] = useState(false);
  const [xato, setXato] = useState("");

  const TURLAR = {
    buyruq: "📋 Buyruq", hisobot: "📊 Hisobot", sertifikat: "🏅 Sertifikat",
    xodim_hujjati: "👤 Xodim hujjati", oquvchi_hujjati: "🎓 O'quvchi hujjati", boshqa: "📁 Boshqa",
  };

  const yukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/hujjatlar?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { setHujjatlar(d.hujjatlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(yukla, [token, maktabId]);

  const hujjatYukla = async () => {
    if (!nomi.trim()) { setXato("Hujjat nomini kiriting"); return; }
    if (!tanlanganFayl) { setXato("Faylni tanlang"); return; }
    setYuklanyapti(true); setXato("");
    try {
      const formData = new FormData();
      formData.append("fayl", tanlanganFayl);
      const params = new URLSearchParams({ token, maktab_id: maktabId, nomi: nomi.trim(), turi, izoh: izoh || "" });
      const res = await fetch(`${API_BASE}/api/maktab/hujjat_yukla?${params.toString()}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setIzoh(""); setTanlanganFayl(null); setFormOchiq(false);
      yukla();
    } catch (e) { setXato(e.message); } finally { setYuklanyapti(false); }
  };

  const hujjatniYukleboLish = (h) => {
    window.open(`${API_BASE}/api/maktab/hujjat_yukleb_olish?token=${encodeURIComponent(token)}&hujjat_id=${h.id}`, "_blank");
  };

  const hujjatOchir = async (id) => {
    await fetch(`${API_BASE}/api/maktab/hujjat_ochir?token=${encodeURIComponent(token)}&hujjat_id=${id}`, { method: "DELETE" });
    yukla();
  };

  const hajmFormat = (baytlar) => {
    if (!baytlar) return "";
    if (baytlar < 1024 * 1024) return `${Math.round(baytlar / 1024)} KB`;
    return `${(baytlar / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>🗂 Hujjatlar</h1>
        <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          {formOchiq ? "✕ Yopish" : "+ Yuklash"}
        </button>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{hujjatlar.length} ta hujjat.</p>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)} placeholder="Hujjat nomi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
          <select value={turi} onChange={(e) => setTuri(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }}>
            {Object.entries(TURLAR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="text" value={izoh} onChange={(e) => setIzoh(e.target.value)} placeholder="Izoh (ixtiyoriy)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          <label className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed mb-3"
            style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
            {tanlanganFayl ? `📎 ${tanlanganFayl.name}` : "📤 Fayl tanlash (10 MB gacha)"}
            <input type="file" onChange={(e) => setTanlanganFayl(e.target.files[0] || null)} className="hidden" />
          </label>
          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={hujjatYukla} disabled={yuklanyapti}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: yuklanyapti ? 0.7 : 1 }}>
            {yuklanyapti ? "Yuklanmoqda..." : "Yuklash"}
          </button>
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : hujjatlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali hujjat yuklanmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hujjatlar.map((h) => (
            <div key={h.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{TURLAR[h.turi] || h.turi} · {h.nomi}</p>
              </div>
              <p className="text-xs mb-2.5" style={{ color: "#8A8578" }}>
                {h.fayl_nomi} · {hajmFormat(h.fayl_hajmi)} · {h.yuklagan_ismi || "?"}{h.izoh ? ` · ${h.izoh}` : ""}
              </p>
              <div className="flex gap-2">
                <button onClick={() => hujjatniYukleboLish(h)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                  ⬇ Yuklab olish
                </button>
                <button onClick={() => hujjatOchir(h.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: "#fff", color: "#A32D2D", border: "1px solid #E5E1D8" }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoliyaBolimi({ token, maktabId, onOrtga }) {
  const [oy, setOy] = useState(new Date().toISOString().slice(0, 7));
  const [malumot, setMalumot] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [turi, setTuri] = useState("chiqim");
  const [kategoriya, setKategoriya] = useState("");
  const [summa, setSumma] = useState("");
  const [izoh, setIzoh] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const KATEGORIYALAR = {
    kirim: ["Homiylik", "Grant", "Boshqa kirim"],
    chiqim: ["Ish haqi", "Jihoz/inventar", "Ta'mirlash", "Kommunal", "O'quv materiallari", "Boshqa chiqim"],
  };

  const yukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/moliya?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&oy=${oy}`)
      .then((r) => r.json())
      .then((d) => { setMalumot(d); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(yukla, [token, maktabId, oy]);

  const yozuvSaqla = async () => {
    if (!kategoriya) { setXato("Kategoriyani tanlang"); return; }
    if (!summa || parseInt(summa, 10) <= 0) { setXato("Summani kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/moliya_yozuv_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, maktab_id: maktabId, turi, kategoriya, summa: parseInt(summa, 10), izoh: izoh || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setKategoriya(""); setSumma(""); setIzoh(""); setFormOchiq(false);
      yukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const yozuvOchir = async (id) => {
    await fetch(`${API_BASE}/api/maktab/moliya_yozuv_ochir?token=${encodeURIComponent(token)}&yozuv_id=${id}`, { method: "DELETE" });
    yukla();
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>💰 Moliya</h1>
        <input type="month" value={oy} onChange={(e) => setOy(e.target.value)}
          className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: "#E5E1D8" }} />
      </div>

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <>
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: malumot.balans >= 0 ? "#EAF3DE" : "#FCEBEB" }}>
            <p className="text-xs font-medium mb-1" style={{ color: malumot.balans >= 0 ? "#3B6D11" : "#A32D2D" }}>Oylik balans</p>
            <p className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>{malumot.balans.toLocaleString()} so'm</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-xs mb-1" style={{ color: "#8A8578" }}>Jami kirim</p>
              <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{malumot.jami_kirim.toLocaleString()}</p>
              <p className="text-xs mt-1" style={{ color: "#8A8578" }}>
                O'quvchi: {malumot.oquvchi_kirim.toLocaleString()} · Boshqa: {malumot.boshqa_kirim.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-xs mb-1" style={{ color: "#8A8578" }}>Chiqim</p>
              <p className="text-lg font-bold" style={{ color: "#A32D2D" }}>{malumot.chiqim.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>📝 Qo'lda kiritilgan yozuvlar</p>
            <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
              {formOchiq ? "✕ Yopish" : "+ Yozuv"}
            </button>
          </div>

          {formOchiq && (
            <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex gap-2 mb-2.5">
                <button onClick={() => { setTuri("kirim"); setKategoriya(""); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={turi === "kirim" ? { backgroundColor: "#3B6D11", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                  ➕ Kirim
                </button>
                <button onClick={() => { setTuri("chiqim"); setKategoriya(""); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={turi === "chiqim" ? { backgroundColor: "#A32D2D", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                  ➖ Chiqim
                </button>
              </div>
              <select value={kategoriya} onChange={(e) => setKategoriya(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }}>
                <option value="">Kategoriyani tanlang</option>
                {KATEGORIYALAR[turi].map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <input type="number" min="1" value={summa} onChange={(e) => setSumma(e.target.value)} placeholder="Summa (so'm)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
              <input type="text" value={izoh} onChange={(e) => setIzoh(e.target.value)} placeholder="Izoh (ixtiyoriy)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
              <button onClick={yozuvSaqla} disabled={saqlanmoqda}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
                {saqlanmoqda ? "Saqlanmoqda..." : "Qo'shish"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {malumot.yozuvlar.map((y) => (
              <div key={y.id} className="rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{y.kategoriya}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{y.sana}{y.izoh ? ` · ${y.izoh}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: y.turi === "kirim" ? "#3B6D11" : "#A32D2D" }}>
                    {y.turi === "kirim" ? "+" : "-"}{y.summa.toLocaleString()}
                  </span>
                  <button onClick={() => yozuvOchir(y.id)} className="text-xs" style={{ color: "#A32D2D" }}>✕</button>
                </div>
              </div>
            ))}
            {malumot.yozuvlar.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Bu oy uchun qo'lda kiritilgan yozuv yo'q.</p>}
          </div>
        </>
      )}
    </div>
  );
}

function KutubxonaBolimi({ token, maktabId, onOrtga }) {
  const [kitoblar, setKitoblar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [nomi, setNomi] = useState("");
  const [muallif, setMuallif] = useState("");
  const [janr, setJanr] = useState("");
  const [nusxaSoni, setNusxaSoni] = useState("1");
  const [elektronHavola, setElektronHavola] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [tanlanganKitob, setTanlanganKitob] = useState(null);
  const [tarix, setTarix] = useState(null);
  const [berishOchiq, setBerishOchiq] = useState(false);
  const [tanlanganOdam, setTanlanganOdam] = useState(null);

  const kitoblarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/maktab/kutubxona?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { setKitoblar(d.kitoblar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(kitoblarniYukla, [token, maktabId]);

  const kitobSaqla = async () => {
    if (!nomi.trim()) { setXato("Kitob nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/kitob_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, maktab_id: maktabId, nomi: nomi.trim(), muallif: muallif || undefined,
          janr: janr || undefined, nusxa_soni: parseInt(nusxaSoni, 10) || 1, elektron_havola: elektronHavola || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setMuallif(""); setJanr(""); setNusxaSoni("1"); setElektronHavola(""); setFormOchiq(false);
      kitoblarniYukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const tarixniYukla = (kitobId) => {
    fetch(`${API_BASE}/api/maktab/kitob_tarixi?token=${encodeURIComponent(token)}&kitob_id=${kitobId}`)
      .then((r) => r.json())
      .then((d) => setTarix(d.tarix || []))
      .catch(() => {});
  };

  const kitobOch = (k) => { setTanlanganKitob(k); tarixniYukla(k.id); };

  const kitobBer = async () => {
    if (!tanlanganOdam) return;
    setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/maktab/kitob_berish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kitob_id: tanlanganKitob.id, user_id: tanlanganOdam.user_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setBerishOchiq(false); setTanlanganOdam(null);
      tarixniYukla(tanlanganKitob.id); kitoblarniYukla();
    } catch (e) { setXato(e.message); }
  };

  const kitobniQaytar = async (ijaraId) => {
    await fetch(`${API_BASE}/api/maktab/kitob_qaytarish?token=${encodeURIComponent(token)}&ijara_id=${ijaraId}`, { method: "POST" });
    tarixniYukla(tanlanganKitob.id); kitoblarniYukla();
  };

  if (tanlanganKitob) {
    const bosh = tanlanganKitob.nusxa_soni - tanlanganKitob.band_soni;
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganKitob(null); setTarix(null); setBerishOchiq(false); setTanlanganOdam(null); }} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Kutubxona</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganKitob.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
          {tanlanganKitob.muallif || "Muallif noma'lum"}{tanlanganKitob.janr ? ` · ${tanlanganKitob.janr}` : ""} · {bosh}/{tanlanganKitob.nusxa_soni} nusxa bo'sh
        </p>
        {tanlanganKitob.elektron_havola && (
          <a href={tanlanganKitob.elektron_havola} target="_blank" rel="noreferrer" className="block text-xs mb-4" style={{ color: "#1B4B7A" }}>🔗 Elektron nusxa havolasi</a>
        )}

        {bosh > 0 && (
          <>
            <button onClick={() => setBerishOchiq(!berishOchiq)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
              📤 Kitob berish
            </button>
            {berishOchiq && (
              <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
                <MaktabOdamQidiruvi token={token} maktabId={maktabId} tanlanganOdam={tanlanganOdam} onTanla={setTanlanganOdam} />
                <button onClick={kitobBer} disabled={!tanlanganOdam}
                  className="w-full py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: tanlanganOdam ? 1 : 0.5 }}>
                  Berish
                </button>
                {xato && <p className="text-xs mt-2" style={{ color: "#A32D2D" }}>{xato}</p>}
              </div>
            )}
          </>
        )}

        <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>📖 Tarix</p>
        <div className="space-y-2">
          {(tarix || []).map((t) => (
            <div key={t.ijara_id} className="rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{t.full_name}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>
                  {t.olingan_sana} dan {t.qaytarilgan_sana ? ` — qaytardi: ${t.qaytarilgan_sana}` : " — hali qaytarmagan"}
                </p>
              </div>
              {!t.qaytarilgan_sana && (
                <button onClick={() => kitobniQaytar(t.ijara_id)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white shrink-0" style={{ backgroundColor: "#3B6D11" }}>
                  Qaytardi
                </button>
              )}
            </div>
          ))}
          {(tarix || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hali hech kim olmagan.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>📖 Kutubxona</h1>
        <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          {formOchiq ? "✕ Yopish" : "+ Yangi kitob"}
        </button>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{kitoblar.length} ta kitob.</p>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)} placeholder="Kitob nomi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
          <input type="text" value={muallif} onChange={(e) => setMuallif(e.target.value)} placeholder="Muallif (ixtiyoriy)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <input type="text" value={janr} onChange={(e) => setJanr(e.target.value)} placeholder="Janr"
              className="px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
            <input type="number" min="1" value={nusxaSoni} onChange={(e) => setNusxaSoni(e.target.value)} placeholder="Nusxa soni"
              className="px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          </div>
          <input type="text" value={elektronHavola} onChange={(e) => setElektronHavola(e.target.value)} placeholder="Elektron nusxa havolasi (ixtiyoriy)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={kitobSaqla} disabled={saqlanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Qo'shish"}
          </button>
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : kitoblar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali kitob qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {kitoblar.map((k) => {
            const bosh = k.nusxa_soni - k.band_soni;
            return (
              <button key={k.id} onClick={() => kitobOch(k)}
                className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{k.nomi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{k.muallif || "Muallif noma'lum"}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-2" style={{ backgroundColor: bosh > 0 ? "#EAF3DE" : "#FCEBEB", color: bosh > 0 ? "#3B6D11" : "#A32D2D" }}>
                  {bosh}/{k.nusxa_soni} bo'sh
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OquvchiProfili({ token, userId, onOrtga }) {
  const [malumot, setMalumot] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [sogliq, setSogliq] = useState(null);
  const [sogliqTahrir, setSogliqTahrir] = useState(false);
  const [allergiyalar, setAllergiyalar] = useState("");
  const [qonGuruhi, setQonGuruhi] = useState("");
  const [aloqaIsmi, setAloqaIsmi] = useState("");
  const [aloqaTelefoni, setAloqaTelefoni] = useState("");
  const [boshqaEslatma, setBoshqaEslatma] = useState("");
  const [sogliqSaqlanmoqda, setSogliqSaqlanmoqda] = useState(false);
  const [psixologYozuvlar, setPsixologYozuvlar] = useState(null);
  const [yangiKuzatuv, setYangiKuzatuv] = useState("");
  const [kuzatuvSaqlanmoqda, setKuzatuvSaqlanmoqda] = useState(false);

  useEffect(() => {
    setYuklanmoqda(true); setXato("");
    fetch(`${API_BASE}/api/oqituvchi/oquvchi_profili?token=${encodeURIComponent(token)}&user_id=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) { setXato(d.detail); setYuklanmoqda(false); return; }
        setMalumot(d);
        setYuklanmoqda(false);
        fetch(`${API_BASE}/api/bola/${userId}/favqulodda_malumot?token=${encodeURIComponent(token)}`)
          .then((r) => r.json())
          .then((sd) => {
            setSogliq(sd);
            setAllergiyalar(sd.allergiyalar || ""); setQonGuruhi(sd.qon_guruhi || "");
            setAloqaIsmi(sd.aloqa_ismi || ""); setAloqaTelefoni(sd.aloqa_telefoni || ""); setBoshqaEslatma(sd.boshqa_eslatma || "");
          })
          .catch(() => {});
        if (d.maktab_id) {
          fetch(`${API_BASE}/api/maktab/psixolog_yozuvlari?token=${encodeURIComponent(token)}&bola_user_id=${userId}&maktab_id=${d.maktab_id}`)
            .then((r) => r.json())
            .then((pd) => setPsixologYozuvlar(pd.yozuvlar || []))
            .catch(() => {});
        }
      })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token, userId]);

  const sogliqSaqla = async () => {
    setSogliqSaqlanmoqda(true);
    try {
      await fetch(`${API_BASE}/api/bola/favqulodda_malumot`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, bola_user_id: userId, allergiyalar: allergiyalar || undefined, qon_guruhi: qonGuruhi || undefined, aloqa_ismi: aloqaIsmi || undefined, aloqa_telefoni: aloqaTelefoni || undefined, boshqa_eslatma: boshqaEslatma || undefined }),
      });
      setSogliq({ allergiyalar, qon_guruhi: qonGuruhi, aloqa_ismi: aloqaIsmi, aloqa_telefoni: aloqaTelefoni, boshqa_eslatma: boshqaEslatma });
      setSogliqTahrir(false);
    } finally { setSogliqSaqlanmoqda(false); }
  };

  const kuzatuvQosh = async () => {
    if (!yangiKuzatuv.trim() || !malumot?.maktab_id) return;
    setKuzatuvSaqlanmoqda(true);
    try {
      await fetch(`${API_BASE}/api/maktab/psixolog_yozuv_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, bola_user_id: userId, maktab_id: malumot.maktab_id, matn: yangiKuzatuv.trim() }),
      });
      setYangiKuzatuv("");
      const r = await fetch(`${API_BASE}/api/maktab/psixolog_yozuvlari?token=${encodeURIComponent(token)}&bola_user_id=${userId}&maktab_id=${malumot.maktab_id}`);
      const d = await r.json();
      setPsixologYozuvlar(d.yozuvlar || []);
    } finally { setKuzatuvSaqlanmoqda(false); }
  };

  const foizRangi = (foiz) => (foiz >= 70 ? "#3B6D11" : foiz >= 40 ? "#8A5A1C" : "#A32D2D");
  const foizFoni = (foiz) => (foiz >= 70 ? "#EAF3DE" : foiz >= 40 ? "#FDF3E0" : "#FCEBEB");

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : xato ? (
        <p className="text-sm" style={{ color: "#B0553A" }}>{xato}</p>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{malumot.full_name}</h1>
          <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
            {malumot.sinf ? `${malumot.sinf}-${malumot.harf} sinf` : ""}{malumot.maktab_nomi ? ` · ${malumot.maktab_nomi}` : ""}
          </p>

          <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>📚 Bilim</p>
              {malumot.bilim.fanlar.length > 0 && (
                <span className="text-sm font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: foizFoni(malumot.bilim.umumiy_foiz), color: foizRangi(malumot.bilim.umumiy_foiz) }}>
                  Umumiy: {malumot.bilim.umumiy_foiz}%
                </span>
              )}
            </div>
            {malumot.bilim.fanlar.length === 0 ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali birorta test yechilmagan.</p>
            ) : (
              <div className="space-y-1.5">
                {malumot.bilim.fanlar.map((f) => (
                  <div key={f.qisqa} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#5A5648" }}>{f.nom}</span>
                    <span className="text-xs font-semibold" style={{ color: foizRangi(f.foiz) }}>{f.foiz}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: malumot.davomat.ketma_ket_kelmagan >= 2 ? "#E8A0A0" : "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3" style={{ color: "#2B2B2B" }}>📋 Davomat (30 kun)</p>
            {malumot.davomat.ketma_ket_kelmagan >= 2 && (
              <p className="text-xs font-medium mb-3" style={{ color: "#A32D2D" }}>⚠️ {malumot.davomat.ketma_ket_kelmagan} kun ketma-ket kelmagan</p>
            )}
            {malumot.davomat.jami_kun === 0 ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali davomat belgilanmagan.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#EAF3DE" }}>
                  <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{malumot.davomat.keldi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>keldi</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FCEBEB" }}>
                  <p className="text-lg font-bold" style={{ color: "#A32D2D" }}>{malumot.davomat.kelmadi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>kelmadi</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FDF3E0" }}>
                  <p className="text-lg font-bold" style={{ color: "#8A5A1C" }}>{malumot.davomat.kechikdi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>kechikdi</p>
                </div>
              </div>
            )}
          </div>

          {malumot.pulli && (
            <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "#2B2B2B" }}>💳 To'lov tarixi</p>
              {malumot.tolov_tarixi.length === 0 ? (
                <p className="text-xs" style={{ color: "#8A8578" }}>Hali to'lov qilinmagan.</p>
              ) : (
                <div className="space-y-1.5">
                  {malumot.tolov_tarixi.map((t) => (
                    <div key={t.oy} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#5A5648" }}>{t.oy}</span>
                      <span className="text-xs font-semibold" style={{ color: t.tolangan_summa >= malumot.oylik_tolov ? "#3B6D11" : "#A32D2D" }}>
                        {t.tolangan_summa.toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>🚑 Favqulodda ma'lumot</p>
              <button onClick={() => setSogliqTahrir(!sogliqTahrir)} className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>
                {sogliqTahrir ? "Bekor" : "✎ Tahrirlash"}
              </button>
            </div>
            {sogliqTahrir ? (
              <div>
                <input type="text" value={allergiyalar} onChange={(e) => setAllergiyalar(e.target.value)} placeholder="Allergiyalar"
                  className="w-full px-3 py-2 rounded-lg border text-xs mb-2" style={{ borderColor: "#E5E1D8" }} />
                <input type="text" value={qonGuruhi} onChange={(e) => setQonGuruhi(e.target.value)} placeholder="Qon guruhi (masalan A+)"
                  className="w-full px-3 py-2 rounded-lg border text-xs mb-2" style={{ borderColor: "#E5E1D8" }} />
                <input type="text" value={aloqaIsmi} onChange={(e) => setAloqaIsmi(e.target.value)} placeholder="Favqulodda aloqa ismi"
                  className="w-full px-3 py-2 rounded-lg border text-xs mb-2" style={{ borderColor: "#E5E1D8" }} />
                <input type="text" value={aloqaTelefoni} onChange={(e) => setAloqaTelefoni(e.target.value)} placeholder="Favqulodda aloqa telefoni"
                  className="w-full px-3 py-2 rounded-lg border text-xs mb-2" style={{ borderColor: "#E5E1D8" }} />
                <input type="text" value={boshqaEslatma} onChange={(e) => setBoshqaEslatma(e.target.value)} placeholder="Boshqa muhim eslatma"
                  className="w-full px-3 py-2 rounded-lg border text-xs mb-3" style={{ borderColor: "#E5E1D8" }} />
                <button onClick={sogliqSaqla} disabled={sogliqSaqlanmoqda} className="w-full py-2 rounded-lg font-semibold text-white text-xs" style={{ backgroundColor: "#1B4B7A" }}>
                  {sogliqSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            ) : !sogliq || (!sogliq.allergiyalar && !sogliq.qon_guruhi && !sogliq.aloqa_ismi) ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali kiritilmagan.</p>
            ) : (
              <div className="space-y-1 text-xs" style={{ color: "#5A5648" }}>
                {sogliq.allergiyalar && <p>🩹 Allergiya: {sogliq.allergiyalar}</p>}
                {sogliq.qon_guruhi && <p>🩸 Qon guruhi: {sogliq.qon_guruhi}</p>}
                {sogliq.aloqa_ismi && <p>📞 {sogliq.aloqa_ismi}{sogliq.aloqa_telefoni ? ` — ${sogliq.aloqa_telefoni}` : ""}</p>}
                {sogliq.boshqa_eslatma && <p>ℹ️ {sogliq.boshqa_eslatma}</p>}
              </div>
            )}
          </div>

          {psixologYozuvlar !== null && (
            <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#2B2B2B" }}>🧠 Psixolog kuzatuvlari</p>
              <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Faqat psixolog, sinf rahbari va rahbariyatga ko'rinadi.</p>
              <div className="flex gap-2 mb-3">
                <input type="text" value={yangiKuzatuv} onChange={(e) => setYangiKuzatuv(e.target.value)} placeholder="Yangi kuzatuv yozing..."
                  className="flex-1 px-3 py-2 rounded-lg border text-xs" style={{ borderColor: "#E5E1D8" }} />
                <button onClick={kuzatuvQosh} disabled={kuzatuvSaqlanmoqda || !yangiKuzatuv.trim()} className="px-3 py-2 rounded-lg font-semibold text-white text-xs" style={{ backgroundColor: "#5A3D9E" }}>
                  +
                </button>
              </div>
              {psixologYozuvlar.length === 0 ? (
                <p className="text-xs" style={{ color: "#8A8578" }}>Hali kuzatuv yozilmagan.</p>
              ) : (
                <div className="space-y-2">
                  {psixologYozuvlar.map((k) => (
                    <div key={k.id} className="rounded-lg p-2.5" style={{ backgroundColor: "#F3F0FF" }}>
                      <p className="text-xs" style={{ color: "#2B2B2B" }}>{k.matn}</p>
                      <p className="text-xs mt-1" style={{ color: "#8A8578" }}>{k.yozgan_ismi} · {new Date(k.yaratilgan_at).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function XodimDavomatBelgilash({ token, maktabId, onOrtga }) {
  const bugun = new Date().toISOString().slice(0, 10);
  const [sana, setSana] = useState(bugun);
  const [xodimlar, setXodimlar] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [saqlandi, setSaqlandi] = useState(false);

  const HOLATLAR = [
    { kalit: "keldi", belgi: "✅", rang: "#3B6D11", fon: "#EAF3DE" },
    { kalit: "kelmadi", belgi: "❌", rang: "#A32D2D", fon: "#FCEBEB" },
    { kalit: "kechikdi", belgi: "⏰", rang: "#8A5A1C", fon: "#FDF3E0" },
    { kalit: "sababli", belgi: "📋", rang: "#5A5648", fon: "#F7F5F0" },
  ];

  const yukla = () => {
    setYuklanmoqda(true); setSaqlandi(false);
    fetch(`${API_BASE}/api/maktab/xodim_davomat_royxati?token=${encodeURIComponent(token)}&maktab_id=${maktabId}&sana=${sana}`)
      .then((r) => r.json())
      .then((d) => { setXodimlar((d.xodimlar || []).map((x) => ({ ...x, holat: x.holat || "keldi" }))); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(yukla, [sana, maktabId, token]);

  const holatOzgartir = (userId, holat) => {
    setXodimlar((prev) => prev.map((x) => (x.user_id === userId ? { ...x, holat } : x)));
  };

  const saqla = async () => {
    setSaqlanmoqda(true); setSaqlandi(false);
    try {
      await fetch(`${API_BASE}/api/maktab/xodim_davomat_belgila`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, maktab_id: maktabId, sana,
          yozuvlar: xodimlar.map((x) => ({ user_id: x.user_id, holat: x.holat })),
        }),
      });
      setSaqlandi(true);
    } finally { setSaqlanmoqda(false); }
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>🧑‍🏫 Xodim davomati</h1>
      <input type="date" value={sana} onChange={(e) => setSana(e.target.value)} max={bugun}
        className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-4" style={{ borderColor: "#E5E1D8" }} />

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <div className="space-y-2 mb-5">
          {(xodimlar || []).map((x) => (
            <div key={x.user_id} className="rounded-xl p-3 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-medium mb-0.5" style={{ color: "#2B2B2B" }}>{x.full_name}</p>
              <p className="text-xs mb-2" style={{ color: "#8A8578" }}>{LAVOZIM_NOMLARI[x.lavozim] || x.lavozim}</p>
              <div className="flex gap-1.5">
                {HOLATLAR.map((h) => (
                  <button key={h.kalit} onClick={() => holatOzgartir(x.user_id, h.kalit)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={x.holat === h.kalit ? { backgroundColor: h.rang, color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#8A8578" }}>
                    {h.belgi}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {(xodimlar || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Xodim topilmadi.</p>}
        </div>
      )}

      {saqlandi && <p className="text-sm mb-3" style={{ color: "#3B6D11" }}>✅ Saqlandi</p>}
      <button onClick={saqla} disabled={saqlanmoqda || yuklanmoqda}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
        {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </div>
  );
}

function FanlarTahliliBolimi({ token, maktabId, onOrtga }) {
  const [fanlar, setFanlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/maktab/fanlar_tahlili?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token, maktabId]);

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📊 Fanlar tahlili</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Butun maktab kesimida, har fandan necha o'quvchi qanday natijada.</p>

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : fanlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali test yechilmagan — tahlil uchun ma'lumot yo'q.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fanlar.map((f) => {
            const jami = f.yaxshi + f.ortacha + f.past;
            return (
              <div key={f.subject_name} className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{f.subject_name}</p>
                  <span className="text-xs font-bold" style={{ color: "#1B4B7A" }}>o'rtacha {f.umumiy_ortacha}%</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
                  {f.yaxshi > 0 && <div style={{ width: `${(f.yaxshi / jami) * 100}%`, backgroundColor: "#3B6D11" }} />}
                  {f.ortacha > 0 && <div style={{ width: `${(f.ortacha / jami) * 100}%`, backgroundColor: "#C89B3C" }} />}
                  {f.past > 0 && <div style={{ width: `${(f.past / jami) * 100}%`, backgroundColor: "#A32D2D" }} />}
                </div>
                <div className="flex gap-3 text-xs" style={{ color: "#8A8578" }}>
                  <span>🟢 {f.yaxshi} yaxshi</span>
                  <span>🟡 {f.ortacha} o'rtacha</span>
                  <span>🔴 {f.past} past</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MeningKalendarim({ token, togarak, onOrtga, onMavzuOchish }) {
  const [korinishTuri, setKorinishTuri] = useState("hafta");
  const [ankor, setAnkor] = useState(() => new Date());
  const [darsKunlari, setDarsKunlari] = useState(null); // null=hali yuklanmagan, []=hali tanlanmagan
  const [rejaBormi, setRejaBormi] = useState(true);
  const [kunlarTanlovOchiq, setKunlarTanlovOchiq] = useState(false);
  const [vaqtinchaKunlar, setVaqtinchaKunlar] = useState([]);
  const [kunlarSaqlanmoqda, setKunlarSaqlanmoqda] = useState(false);
  const [toldirishXabari, setToldirishXabari] = useState("");
  const [sanalar, setSanalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/togarak_azo/mening_dars_kunlarim?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}`)
      .then((r) => r.json())
      .then((d) => { setDarsKunlari(d.kunlar || []); setRejaBormi(d.reja_bormi !== false); })
      .catch(() => setDarsKunlari([]));
  }, [token, togarak.id]);

  const { boshlanish, tugash } = useMemo(() => {
    if (korinishTuri === "hafta") {
      const b = _haftaBoshi(ankor);
      const t = new Date(b); t.setDate(t.getDate() + 6);
      return { boshlanish: b, tugash: t };
    }
    const b = new Date(ankor.getFullYear(), ankor.getMonth(), 1);
    const t = new Date(ankor.getFullYear(), ankor.getMonth() + 1, 0);
    return { boshlanish: b, tugash: t };
  }, [ankor, korinishTuri]);

  const kalendarniYukla = () => {
    setYuklanmoqda(true); setXato("");
    fetch(`${API_BASE}/api/togarak_azo/mening_kalendarim?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&boshlanish=${_sanaFmt(boshlanish)}&tugash=${_sanaFmt(tugash)}`)
      .then((r) => r.json())
      .then((d) => { if (d.detail) throw new Error(d.detail); setSanalar(d.sanalar || []); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  useEffect(() => {
    if (darsKunlari === null || darsKunlari.length === 0) return;
    kalendarniYukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darsKunlari, boshlanish.getTime(), tugash.getTime()]);

  const kunlarSaqla = async () => {
    setKunlarSaqlanmoqda(true); setToldirishXabari("");
    try {
      const res = await fetch(`${API_BASE}/api/togarak_azo/dars_kunlarimni_belgila`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarak.id, kunlar: vaqtinchaKunlar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setDarsKunlari(data.kunlar);
      setKunlarTanlovOchiq(false);
      if (data.toldirilgan_soni > 0) setToldirishXabari(`✓ ${data.toldirilgan_soni} ta darsingiz rejalashtirildi`);
    } catch (e) { setXato(e.message); } finally { setKunlarSaqlanmoqda(false); }
  };

  const davrLabel = korinishTuri === "hafta"
    ? `${boshlanish.getDate()}-${tugash.getDate()} ${OY_NOMLARI[tugash.getMonth()]}`
    : `${OY_NOMLARI[ankor.getMonth()]} ${ankor.getFullYear()}`;

  const davrniSurish = (yonalish) => {
    const yangi = new Date(ankor);
    if (korinishTuri === "hafta") yangi.setDate(yangi.getDate() + yonalish * 7);
    else yangi.setMonth(yangi.getMonth() + yonalish);
    setAnkor(yangi);
  };

  const kunBosildi = (sana) => {
    const s = sanalar.find((x) => x.sana === sana);
    if (s?.topic_code) onMavzuOchish(s.topic_code);
  };

  const kunKartasiChiqar = (haftaKuni, keng) => {
    const d = new Date(boshlanish);
    d.setDate(d.getDate() + (haftaKuni - 1));
    const sana = _sanaFmt(d);
    const darsKunimi = darsKunlari.includes(haftaKuni);
    const s = sanalar.find((x) => x.sana === sana);
    const bugunmi = sana === _sanaFmt(new Date());
    const mavzuBormi = !!s?.mavzu_nomi;

    if (!darsKunimi) {
      return (
        <div key={sana} className={`rounded-xl px-3 py-2.5 ${keng ? "flex items-center gap-2" : ""}`} style={{ backgroundColor: "#F7F5F0" }}>
          <p className="text-xs font-medium" style={{ color: "#B0AA98" }}>{keng ? HAFTA_KUN_TOLIQ[haftaKuni] : HAFTA_KUN_QISQA[haftaKuni]}, {d.getDate()}</p>
          <p className="text-[11px] italic" style={{ color: "#C4BFAF" }}>dars yo'q</p>
        </div>
      );
    }
    return (
      <button key={sana} onClick={() => mavzuBormi && kunBosildi(sana)} disabled={!mavzuBormi}
        className={`w-full rounded-xl bg-white border text-left ${keng ? "flex items-center gap-3.5 p-3.5" : "p-3"}`}
        style={{ borderColor: bugunmi ? "#1B4B7A" : "#E5E1D8", borderWidth: bugunmi ? 2 : 1, opacity: mavzuBormi ? 1 : 0.7 }}>
        <div className={`rounded-lg flex items-center justify-center shrink-0 ${keng ? "w-12 h-12 flex-col gap-0" : "w-full mb-1.5 py-1.5 gap-1.5"}`}
          style={{ backgroundColor: mavzuBormi ? "#EAF3DE" : "#EAF1F7" }}>
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: mavzuBormi ? "#3B6D11" : "#1B4B7A" }}>{HAFTA_KUN_QISQA[haftaKuni]}</span>
          <span className={`font-bold leading-tight ${keng ? "text-base" : "text-sm"}`} style={{ color: mavzuBormi ? "#3B6D11" : "#1B4B7A" }}>{d.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          {keng && <p className="text-[11px] font-medium mb-0.5" style={{ color: "#8A8578" }}>{HAFTA_KUN_TOLIQ[haftaKuni]}{bugunmi ? " · bugun" : ""}</p>}
          {mavzuBormi ? (
            <p className={`font-semibold truncate ${keng ? "text-sm" : "text-xs"}`} style={{ color: "#2B2B2B" }}>{s.mavzu_nomi}</p>
          ) : (
            <p className={`font-medium ${keng ? "text-sm" : "text-xs"}`} style={{ color: "#B0AA98" }}>hali mavzu yo'q</p>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{togarak.nomi}</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>📅 Mening kalendarim</h1>

      {darsKunlari !== null && darsKunlari.length === 0 && !kunlarTanlovOchiq && (
        <div className="rounded-2xl p-4 border mb-4" style={{ backgroundColor: "#FDF3E0", borderColor: "#C89B3C" }}>
          <p className="text-sm font-bold mb-1" style={{ color: "#8A5A1C" }}>Mustaqil o'rganish kunlaringizni tanlang</p>
          <p className="text-xs mb-3" style={{ color: "#5A5648" }}>
            {rejaBormi ? "Qaysi kunlari o'rganishni xohlaysiz? Tanlaganingizdan so'ng, darslar shu kunlaringizga avtomatik taqsimlanadi — bugundan boshlab, o'z sur'atingizda." : "Bu to'garakka hali dastur bog'lanmagan — o'qituvchingizga murojaat qiling."}
          </p>
          {rejaBormi && (
            <button onClick={() => { setVaqtinchaKunlar([]); setKunlarTanlovOchiq(true); }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#C89B3C" }}>
              Kunlarni tanlash
            </button>
          )}
        </div>
      )}

      {kunlarTanlovOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "#5A5648" }}>Qaysi kunlari mustaqil o'rganasiz?</p>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((k) => (
              <button key={k} type="button"
                onClick={() => setVaqtinchaKunlar((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])}
                className="py-2 rounded-lg border text-xs font-semibold text-center"
                style={{
                  borderColor: vaqtinchaKunlar.includes(k) ? "#1B4B7A" : "#E5E1D8",
                  backgroundColor: vaqtinchaKunlar.includes(k) ? "#1B4B7A" : "#FFFFFF",
                  color: vaqtinchaKunlar.includes(k) ? "#FFFFFF" : "#5A5648",
                }}>
                {HAFTA_KUN_QISQA[k]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {darsKunlari && darsKunlari.length > 0 && (
              <button onClick={() => setKunlarTanlovOchiq(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>Bekor</button>
            )}
            <button onClick={kunlarSaqla} disabled={kunlarSaqlanmoqda || vaqtinchaKunlar.length === 0}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: "#1B4B7A", opacity: (kunlarSaqlanmoqda || vaqtinchaKunlar.length === 0) ? 0.6 : 1 }}>
              {kunlarSaqlanmoqda ? "..." : "Saqlash va boshlash"}
            </button>
          </div>
        </div>
      )}

      {toldirishXabari && <p className="text-sm mb-3 text-center" style={{ color: "#3B6D11" }}>{toldirishXabari}</p>}

      {darsKunlari !== null && darsKunlari.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex rounded-full p-1 gap-0.5" style={{ backgroundColor: "#F0EDE5" }}>
              <button onClick={() => setKorinishTuri("hafta")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={korinishTuri === "hafta" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
                Haftalik
              </button>
              <button onClick={() => setKorinishTuri("oy")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={korinishTuri === "oy" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
                Oylik
              </button>
            </div>
            <button onClick={() => { setVaqtinchaKunlar(darsKunlari); setKunlarTanlovOchiq(true); }} className="text-xs font-medium" style={{ color: "#8A8578" }}>
              {darsKunlari.map((k) => HAFTA_KUN_QISQA[k]).join(", ")} ✏️
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button onClick={() => davrniSurish(-1)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>‹</button>
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{davrLabel}</p>
            <button onClick={() => davrniSurish(1)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>›</button>
          </div>

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

          {yuklanmoqda ? (
            <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : korinishTuri === "hafta" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">{[1, 3, 5].map((hk) => kunKartasiChiqar(hk, false))}</div>
                <div className="space-y-2">{[2, 4, 6].map((hk) => kunKartasiChiqar(hk, false))}</div>
              </div>
              {kunKartasiChiqar(7, true)}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="grid grid-cols-7 mb-2">
                {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <p key={k} className="text-[10px] text-center font-semibold uppercase tracking-wide" style={{ color: darsKunlari.includes(k) ? "#1B4B7A" : "#D8D3C7" }}>
                    {HAFTA_KUN_QISQA[k].slice(0, 2)}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {(() => {
                  const oyBoshi = new Date(ankor.getFullYear(), ankor.getMonth(), 1);
                  const boshiKun = oyBoshi.getDay() === 0 ? 7 : oyBoshi.getDay();
                  const boshlangichBosh = [];
                  for (let i = 1; i < boshiKun; i++) boshlangichBosh.push(<div key={`b${i}`} />);
                  const sanaMap = Object.fromEntries(sanalar.map((s) => [s.sana, s]));
                  const bugunKey = _sanaFmt(new Date());
                  const kunlar = [];
                  const jamiKun = new Date(ankor.getFullYear(), ankor.getMonth() + 1, 0).getDate();
                  for (let kun = 1; kun <= jamiKun; kun++) {
                    const d = new Date(ankor.getFullYear(), ankor.getMonth(), kun);
                    const key = _sanaFmt(d);
                    const s = sanaMap[key];
                    const haftaKuni = d.getDay() === 0 ? 7 : d.getDay();
                    const darsKunimi = darsKunlari.includes(haftaKuni);
                    const bugunmi = key === bugunKey;
                    const mavzuBormi = darsKunimi && s?.mavzu_nomi;
                    kunlar.push(
                      <button key={key} onClick={() => mavzuBormi && kunBosildi(key)} disabled={!mavzuBormi}
                        className="w-8 h-8 rounded-full flex items-center justify-center relative"
                        style={{
                          backgroundColor: mavzuBormi ? "#3B6D11" : "transparent",
                          border: bugunmi ? "1.5px solid #1B4B7A" : "1.5px solid transparent",
                        }}>
                        <span className="text-xs font-semibold" style={{ color: mavzuBormi ? "#FFFFFF" : darsKunimi ? "#2B2B2B" : "#D8D3C7" }}>{kun}</span>
                        {darsKunimi && !mavzuBormi && (
                          <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: "#C89B3C" }} />
                        )}
                      </button>,
                    );
                  }
                  return [...boshlangichBosh, ...kunlar];
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OquvchiKitobKorish({ token, togarak, topicCode, mavzuNomi, onOrtga, foydalanuvchi = null }) {
  const [videolar, setVideolar] = useState([]);
  const [misollar, setMisollar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [ochilganYechimlar, setOchilganYechimlar] = useState({});
  const [ochilganVideoSoniya, setOchilganVideoSoniya] = useState({});
  const [oqilayotganId, setOqilayotganId] = useState(null);
  const [joriySozIndeksi, setJoriySozIndeksi] = useState(-1);
  const ovozAsosiyTil = _ovozTiliniTuzat(foydalanuvchi?.asosiy_til || "uz");
  const tanlanganOvozJinsi = _ovozJinsiniTuzat(foydalanuvchi?.ovoz_jinsi || foydalanuvchi?.jins || "qiz");

  const [mustaqilIshlar, setMustaqilIshlar] = useState([]);
  const [javobQoralamalari, setJavobQoralamalari] = useState({}); // {ishId: matn}
  const [topshirilmoqda, setTopshirilmoqda] = useState({}); // {ishId: true}

  const ishlarniYukla = () => {
    fetch(`${API_BASE}/api/togarak_azo/mustaqil_ishlar?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&topic_code=${encodeURIComponent(topicCode)}`)
      .then((r) => r.json())
      .then((d) => setMustaqilIshlar(d.ishlar || []))
      .catch(() => {});
  };

  const javobTopshir = async (ishId) => {
    const matn = (javobQoralamalari[ishId] || "").trim();
    if (!matn) return;
    setTopshirilmoqda((p) => ({ ...p, [ishId]: true }));
    try {
      await fetch(`${API_BASE}/api/togarak_azo/mustaqil_ish_topshir`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ish_id: ishId, javob_matni: matn }),
      });
      ishlarniYukla();
    } finally { setTopshirilmoqda((p) => ({ ...p, [ishId]: false })); }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/togarak_azo/mavzu_kitobi?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&topic_code=${encodeURIComponent(topicCode)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setVideolar(d.videolar || []); setMisollar(d.misollar || []); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
    ishlarniYukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, togarak.id, topicCode]);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const youtubeIdOl = (url) => {
    const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return m ? m[1] : null;
  };

  const misolKartasiChiqar = (m, i, videoHavola) => (
    <div key={m.id} className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
      <p className="text-xs font-semibold mb-1.5" style={{ color: "#8A8578" }}>{i + 1}-misol</p>
      <AralashMatn matn={m.masala_matni} className="text-sm font-medium mb-1" style={{ color: "#2B2B2B" }} />
      <OvozliOqishTugmasi matn={m.masala_matni} kontentId={`masala-${m.id}`} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
        joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} asosiyTil={ovozAsosiyTil} ovozJinsi={tanlanganOvozJinsi} />
      {!ochilganYechimlar[m.id] ? (
        <button onClick={() => setOchilganYechimlar((p) => ({ ...p, [m.id]: true }))}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mt-3" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}>
          🤔 Tushunmadim — yechimni ko'rsat
        </button>
      ) : (
        <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: "#F7F5F0" }}>
          {m.yechim_matni ? (
            <>
              <AralashMatn matn={m.yechim_matni} className="text-sm" style={{ color: "#5A5648" }} />
              <OvozliOqishTugmasi matn={m.yechim_matni} kontentId={`yechim-${m.id}`} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
                joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} asosiyTil={ovozAsosiyTil} ovozJinsi={tanlanganOvozJinsi} />
            </>
          ) : (
            <p className="text-xs italic" style={{ color: "#8A8578" }}>Bu misol uchun tushuntirish yozilmagan.</p>
          )}
          {m.video_soniya != null && youtubeIdOl(videoHavola) && (
            !ochilganVideoSoniya[m.id] ? (
              <button onClick={() => setOchilganVideoSoniya((p) => ({ ...p, [m.id]: true }))}
                className="text-xs font-semibold mt-2" style={{ color: "#1B4B7A" }}>
                ▶️ Videoning shu qismini qayta ko'rish
              </button>
            ) : (
              <div className="rounded-lg overflow-hidden mt-2" style={{ aspectRatio: "16/9" }}>
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeIdOl(videoHavola)}?start=${m.video_soniya}${m.video_tugash_soniya != null ? `&end=${m.video_tugash_soniya}` : ""}&autoplay=1`}
                  title="tushuntirish" allowFullScreen />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  if (yuklanmoqda) {
    return (
      <div className="px-5 pt-6 pb-4">
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      </div>
    );
  }
  if (xato) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <p className="text-sm" style={{ color: "#A32D2D" }}>⚠️ {xato}</p>
      </div>
    );
  }
  if (videolar.length === 0 && misollar.length === 0) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Bu mavzu uchun hali kitob tayyorlanmagan.</p>
        </div>
      </div>
    );
  }

  const guruhlar = videolar.map((v) => ({ video: v, misollar: misollar.filter((m) => m.video_id === v.id) }));
  const boglanmaganMisollar = misollar.filter((m) => !m.video_id);

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{mavzuNomi}</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>📖 Kitob</h1>

      <div className="space-y-6">
        {guruhlar.map((g) => (
          <div key={g.video.id}>
            {g.video.sarlavha && <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>{g.video.sarlavha}</p>}
            {youtubeIdOl(g.video.video_havola) ? (
              <div className="rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeIdOl(g.video.video_havola)}`}
                  title={g.video.sarlavha || "video"} allowFullScreen />
              </div>
            ) : (
              <a href={g.video.video_havola} target="_blank" rel="noreferrer"
                className="block text-center text-xs font-semibold py-2.5 rounded-lg mb-3" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                ▶️ Videoni ochish
              </a>
            )}
            <div className="space-y-2.5">
              {g.misollar.map((m, i) => misolKartasiChiqar(m, i, g.video.video_havola))}
            </div>
          </div>
        ))}

        {boglanmaganMisollar.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>Boshqa misollar</p>
            <div className="space-y-2.5">
              {boglanmaganMisollar.map((m, i) => misolKartasiChiqar(m, i, null))}
            </div>
          </div>
        )}

        {mustaqilIshlar.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>📝 Mustaqil ishlar</p>
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Kitobni o'rgangach, shu savollarga o'z so'zlaringiz bilan javob yozing.</p>
            <div className="space-y-3">
              {mustaqilIshlar.map((ish, i) => {
                const oxirgi = ish.oxirgi_javob;
                return (
                  <div key={ish.id} className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                    <AralashMatn matn={`${i + 1}. ${ish.savol_matni}`} className="text-sm font-medium mb-3" style={{ color: "#2B2B2B" }} />
                    {oxirgi && (
                      <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: oxirgi.togrimi === true ? "#EAF3DE" : oxirgi.togrimi === false ? "#FCEBEB" : "#F7F5F0" }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: oxirgi.togrimi === true ? "#3B6D11" : oxirgi.togrimi === false ? "#A32D2D" : "#5A5648" }}>
                          {oxirgi.togrimi === true ? "✓ To'g'ri" : oxirgi.togrimi === false ? "✕ Noto'g'ri" : "Yuborilgan"}
                        </p>
                        <p className="text-xs mb-1.5" style={{ color: "#5A5648" }}>Sizning javobingiz: {oxirgi.javob_matni}</p>
                        {oxirgi.ai_izohi && <p className="text-xs" style={{ color: "#5A5648" }}>{oxirgi.ai_izohi}</p>}
                      </div>
                    )}
                    <textarea value={javobQoralamalari[ish.id] || ""} onChange={(e) => setJavobQoralamalari((p) => ({ ...p, [ish.id]: e.target.value }))}
                      rows={3} placeholder={oxirgi ? "Qayta yechib, qayta topshirish uchun yozing..." : "Javobingizni shu yerga yozing..."}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                    <button onClick={() => javobTopshir(ish.id)} disabled={topshirilmoqda[ish.id] || !(javobQoralamalari[ish.id] || "").trim()}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                      style={{ backgroundColor: "#1B4B7A", opacity: (topshirilmoqda[ish.id] || !(javobQoralamalari[ish.id] || "").trim()) ? 0.6 : 1 }}>
                      {topshirilmoqda[ish.id] ? "Tekshirilmoqda..." : oxirgi ? "Qayta topshirish" : "Topshirish"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TogarakAzoMavzulari({ token, togarak, onOrtga, onKalendar, ochiladiganTopicCode, ochilganiBildir, foydalanuvchi = null }) {
  const [mavzular, setMavzular] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [kontentlar, setKontentlar] = useState(null);
  const [kitobOchiq, setKitobOchiq] = useState(false);
  const [oqilayotganId, setOqilayotganId] = useState(null);
  const [joriySozIndeksi, setJoriySozIndeksi] = useState(-1);
  const ovozAsosiyTil = _ovozTiliniTuzat(foydalanuvchi?.asosiy_til || "uz");
  const tanlanganOvozJinsi = _ovozJinsiniTuzat(foydalanuvchi?.ovoz_jinsi || foydalanuvchi?.jins || "qiz");
  const korilganVideolar = useRef(new Set());

  useEffect(() => {
    fetch(`${API_BASE}/api/togarak_azo/mavzularim?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token, togarak.id]);

  const mavzuOch = (m) => {
    setTanlanganMavzu(m); setKontentlar(null);
    fetch(`${API_BASE}/api/togarak_azo/mavzu_kontentlari?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&topic_code=${encodeURIComponent(m.topic_code)}`)
      .then((r) => r.json())
      .then((d) => setKontentlar(d.kontentlar || []))
      .catch(() => setKontentlar([]));
  };

  // Kalendardan "shu kunning mavzusi"ni bosib kirilganda — ro'yxat
  // yuklangach, o'sha mavzuni avtomatik ochamiz.
  useEffect(() => {
    if (!ochiladiganTopicCode || mavzular.length === 0) return;
    const m = mavzular.find((x) => x.topic_code === ochiladiganTopicCode);
    if (m) mavzuOch(m);
    ochilganiBildir?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ochiladiganTopicCode, mavzular]);

  const videoKorildi = (biriktirmaId) => {
    if (korilganVideolar.current.has(biriktirmaId)) return;
    korilganVideolar.current.add(biriktirmaId);
    fetch(`${API_BASE}/api/togarak_azo/video_korildi?token=${encodeURIComponent(token)}&biriktirma_id=${biriktirmaId}`, { method: "POST" }).catch(() => {});
  };

  const youtubeIdOl = (url) => {
    const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return m ? m[1] : null;
  };

  if (tanlanganMavzu && kitobOchiq) {
    return (
      <OquvchiKitobKorish token={token} togarak={togarak} topicCode={tanlanganMavzu.topic_code} mavzuNomi={formatTopicTitle(0, tanlanganMavzu)}
        onOrtga={() => setKitobOchiq(false)} foydalanuvchi={foydalanuvchi} />
    );
  }

  if (tanlanganMavzu) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganMavzu(null); setKontentlar(null); window.speechSynthesis.cancel(); setOqilayotganId(null); }}
          className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Mavzular</button>
        <h1 className="text-xl font-bold mb-3" style={{ color: "#2B2B2B" }}>{formatTopicTitle(0, tanlanganMavzu)}</h1>
        <button onClick={() => setKitobOchiq(true)} className="w-full rounded-2xl bg-white border flex items-center gap-3 px-4 py-3.5 mb-5" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF3DE" }}>
            <BookOpen size={18} style={{ color: "#3B6D11" }} />
          </span>
          <span className="text-sm font-semibold flex-1 text-left" style={{ color: "#2B2B2B" }}>Kitobni ochish</span>
          <ChevronRight size={16} style={{ color: "#8A8578" }} />
        </button>

        {kontentlar === null ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : kontentlar.length === 0 ? (
          <p className="text-sm" style={{ color: "#8A8578" }}>Bu mavzuga hali kontent qo'shilmagan.</p>
        ) : (
          <div className="space-y-4">
            {kontentlar.map((k) => (
              <div key={k.id} className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                {k.sarlavha && <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>{k.sarlavha}</p>}

                {k.kontent_turi === "matn" && (
                  <>
                    <OqiladiganMatn matn={k.matn} joriySozIndeksi={oqilayotganId === k.id ? joriySozIndeksi : -1} />
                    <OvozliOqishTugmasi matn={k.matn} kontentId={k.id} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
                      joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} asosiyTil={ovozAsosiyTil} ovozJinsi={tanlanganOvozJinsi} />
                  </>
                )}

                {k.kontent_turi === "latex" && (
                  <>
                    <SavolFormulasi ifoda={k.matn} />
                    <OvozliOqishTugmasi matn={k.matn} kontentId={k.id} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
                      joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} asosiyTil={ovozAsosiyTil} ovozJinsi={tanlanganOvozJinsi} />
                  </>
                )}

                {k.kontent_turi === "rasm" && (
                  <img src={`${API_BASE}/api/oqituvchi/togarak_kontent_fayl?biriktirma_id=${k.id}&token=${encodeURIComponent(token)}`}
                    alt={k.sarlavha || "rasm"} className="w-full rounded-xl" />
                )}

                {k.kontent_turi === "pdf" && (
                  <a href={`${API_BASE}/api/oqituvchi/togarak_kontent_fayl?biriktirma_id=${k.id}&token=${encodeURIComponent(token)}`}
                    target="_blank" rel="noreferrer"
                    className="block text-center text-xs font-semibold py-2.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                    📄 PDF'ni ochish
                  </a>
                )}

                {k.kontent_turi === "word" && (
                  <>
                    {k.matn ? (
                      <>
                        <OqiladiganMatn matn={k.matn} joriySozIndeksi={oqilayotganId === k.id ? joriySozIndeksi : -1} />
                        <OvozliOqishTugmasi matn={k.matn} kontentId={k.id} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
                          joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} asosiyTil={ovozAsosiyTil} ovozJinsi={tanlanganOvozJinsi} />
                      </>
                    ) : (
                      <a href={`${API_BASE}/api/oqituvchi/togarak_kontent_fayl?biriktirma_id=${k.id}&token=${encodeURIComponent(token)}`}
                        target="_blank" rel="noreferrer"
                        className="block text-center text-xs font-semibold py-2.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                        📝 Word faylni ochish
                      </a>
                    )}
                  </>
                )}

                {k.kontent_turi === "video" && (
                  <div>
                    {youtubeIdOl(k.video_havola) ? (
                      <div className="rounded-xl overflow-hidden mb-2" style={{ aspectRatio: "16/9" }}>
                        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeIdOl(k.video_havola)}`}
                          title={k.sarlavha || "video"} allowFullScreen onLoad={() => videoKorildi(k.id)} />
                      </div>
                    ) : (
                      <a href={k.video_havola} target="_blank" rel="noreferrer" onClick={() => videoKorildi(k.id)}
                        className="block text-center text-xs font-semibold py-2.5 rounded-lg mb-2" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                        ▶️ Videoni ochish
                      </a>
                    )}
                    <p className="text-xs" style={{ color: "#8A8578" }}>👁 {k.korilish_soni} marta ko'rilgan</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Profil</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📚 Mavzular</h1>
      <p className="text-xs mb-3" style={{ color: "#8A8578" }}>{togarak.nomi}</p>
      {onKalendar && (
        <button onClick={onKalendar} className="w-full rounded-2xl bg-white border flex items-center gap-3 px-4 py-3.5 mb-5" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}>
            <Calendar size={18} style={{ color: "#1B4B7A" }} />
          </span>
          <span className="text-sm font-semibold flex-1 text-left" style={{ color: "#2B2B2B" }}>Mening kalendarim</span>
          <ChevronRight size={16} style={{ color: "#8A8578" }} />
        </button>
      )}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : xato ? (
        <p className="text-sm font-medium" style={{ color: "#A32D2D" }}>⚠️ {xato}</p>
      ) : mavzular.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mavzular.map((m, index) => (
            <button key={m.topic_code} onClick={() => mavzuOch({ ...m, tartib_raqami: index + 1 })}
              className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{formatTopicTitle(index, m)}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const HAFTA_KUN_QISQA = { 1: "Dush", 2: "Sesh", 3: "Chor", 4: "Pay", 5: "Juma", 6: "Shan", 7: "Yak" };
const HAFTA_KUN_TOLIQ = { 1: "Dushanba", 2: "Seshanba", 3: "Chorshanba", 4: "Payshanba", 5: "Juma", 6: "Shanba", 7: "Yakshanba" };
const OY_NOMLARI = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

function _sanaFmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function _haftaBoshi(d) {
  const n = new Date(d);
  const kun = n.getDay() === 0 ? 7 : n.getDay(); // 1=Dush...7=Yak
  n.setDate(n.getDate() - (kun - 1));
  n.setHours(0, 0, 0, 0);
  return n;
}

function TogarakKalendarReja({ token, togarakId, togarakNomi, onOrtga, onAzolar, onMavzular, onSozlamalar }) {
  const [korinishTuri, setKorinishTuri] = useState("hafta"); // "hafta" | "oy"
  const [ankor, setAnkor] = useState(() => new Date()); // hafta yoki oyni belgilaydigan sana
  const [darsKunlari, setDarsKunlari] = useState(null); // [1,3,5] | null (hali yuklanmagan)
  const [kunlarTanlovOchiq, setKunlarTanlovOchiq] = useState(false);
  const [vaqtinchaKunlar, setVaqtinchaKunlar] = useState([]);
  const [kunlarSaqlanmoqda, setKunlarSaqlanmoqda] = useState(false);
  const [sanalar, setSanalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [tanlanganSana, setTanlanganSana] = useState(null); // mavzu tanlash uchun ochilgan sana
  const [togarakMavzulari, setTogarakMavzulari] = useState(null); // to'garakning o'z mavzulari (lazy)
  const [mavzuQidiruv, setMavzuQidiruv] = useState("");
  const [biriktirilmoqda, setBiriktirilmoqda] = useState(false);
  const [avtomatikToldirilmoqda, setAvtomatikToldirilmoqda] = useState(false);
  const [avtomatikXabar, setAvtomatikXabar] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/togarak_dars_kunlari?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`)
      .then((r) => r.json())
      .then((d) => setDarsKunlari(d.kunlar || []))
      .catch(() => setDarsKunlari([]));
  }, [token, togarakId]);

  const { boshlanish, tugash } = useMemo(() => {
    if (korinishTuri === "hafta") {
      const b = _haftaBoshi(ankor);
      const t = new Date(b); t.setDate(t.getDate() + 6);
      return { boshlanish: b, tugash: t };
    }
    const b = new Date(ankor.getFullYear(), ankor.getMonth(), 1);
    const t = new Date(ankor.getFullYear(), ankor.getMonth() + 1, 0);
    return { boshlanish: b, tugash: t };
  }, [ankor, korinishTuri]);

  const kalendarniYukla = () => {
    setYuklanmoqda(true); setXato("");
    fetch(`${API_BASE}/api/oqituvchi/togarak_kalendar?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&boshlanish=${_sanaFmt(boshlanish)}&tugash=${_sanaFmt(tugash)}`)
      .then((r) => r.json())
      .then((d) => { if (d.detail) throw new Error(d.detail); setSanalar(d.sanalar || []); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  useEffect(() => {
    if (darsKunlari === null) return;
    kalendarniYukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darsKunlari, boshlanish.getTime(), tugash.getTime()]);

  const kunlarSaqla = async () => {
    setKunlarSaqlanmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_dars_kunlari_belgila`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, kunlar: vaqtinchaKunlar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setDarsKunlari(data.kunlar);
      setKunlarTanlovOchiq(false);
    } catch (e) { setXato(e.message); } finally { setKunlarSaqlanmoqda(false); }
  };

  const sanaBosildi = (sana) => {
    setTanlanganSana(sana);
    setMavzuQidiruv("");
    if (togarakMavzulari === null) {
      fetch(`${API_BASE}/api/oqituvchi/togarak_barcha_mavzular?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`)
        .then((r) => r.json())
        .then((d) => setTogarakMavzulari(d.mavzular || []))
        .catch(() => setTogarakMavzulari([]));
    }
  };

  const mavzuBiriktir = async (topicCode) => {
    setBiriktirilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/oqituvchi/togarak_dars_mavzu_biriktir`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, sana: tanlanganSana, topic_code: topicCode }),
      });
      setTanlanganSana(null);
      kalendarniYukla();
    } finally { setBiriktirilmoqda(false); }
  };

  const avtomatikToldir = async () => {
    setAvtomatikToldirilmoqda(true); setAvtomatikXabar("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_dars_avtomatik_toldir?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&boshlanish=${_sanaFmt(boshlanish)}&tugash=${_sanaFmt(tugash)}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setAvtomatikXabar(`✓ ${data.toldirilgan_soni} ta kunga mavzu joylashtirildi`);
      kalendarniYukla();
    } catch (e) { setAvtomatikXabar(e.message); } finally { setAvtomatikToldirilmoqda(false); }
  };

  const davrLabel = korinishTuri === "hafta"
    ? `${boshlanish.getDate()}-${tugash.getDate()} ${OY_NOMLARI[tugash.getMonth()]}`
    : `${OY_NOMLARI[ankor.getMonth()]} ${ankor.getFullYear()}`;

  const davrniSurish = (yonalish) => {
    const yangi = new Date(ankor);
    if (korinishTuri === "hafta") yangi.setDate(yangi.getDate() + yonalish * 7);
    else yangi.setMonth(yangi.getMonth() + yonalish);
    setAnkor(yangi);
  };

  const filtrlanganMavzular = (togarakMavzulari || []).filter((m) => {
    if (!mavzuQidiruv.trim()) return true;
    const nomi = topicName(m).toLowerCase();
    return nomi.includes(mavzuQidiruv.trim().toLowerCase());
  });

  const kunKartasiChiqar = (haftaKuni, keng) => {
    const d = new Date(boshlanish);
    d.setDate(d.getDate() + (haftaKuni - 1));
    const sana = _sanaFmt(d);
    const darsKunimi = darsKunlari.includes(haftaKuni);
    const s = sanalar.find((x) => x.sana === sana);
    const bugunmi = sana === _sanaFmt(new Date());

    if (!darsKunimi) {
      return (
        <div key={sana} className={`rounded-xl px-3 py-2.5 ${keng ? "flex items-center gap-2" : ""}`} style={{ backgroundColor: "#F7F5F0" }}>
          <p className="text-xs font-medium" style={{ color: "#B0AA98" }}>{keng ? HAFTA_KUN_TOLIQ[haftaKuni] : HAFTA_KUN_QISQA[haftaKuni]}, {d.getDate()}</p>
          <p className="text-[11px] italic" style={{ color: "#C4BFAF" }}>dars yo'q</p>
        </div>
      );
    }
    return (
      <button key={sana} onClick={() => sanaBosildi(sana)}
        className={`w-full rounded-xl bg-white border text-left ${keng ? "flex items-center gap-3.5 p-3.5" : "p-3"}`}
        style={{ borderColor: bugunmi ? "#1B4B7A" : "#E5E1D8", borderWidth: bugunmi ? 2 : 1 }}>
        <div className={`rounded-lg flex items-center justify-center shrink-0 ${keng ? "w-12 h-12 flex-col gap-0" : "w-full mb-1.5 py-1.5 gap-1.5"}`}
          style={{ backgroundColor: s?.mavzu_nomi ? "#EAF3DE" : "#EAF1F7" }}>
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: s?.mavzu_nomi ? "#3B6D11" : "#1B4B7A" }}>{HAFTA_KUN_QISQA[haftaKuni]}</span>
          <span className={`font-bold leading-tight ${keng ? "text-base" : "text-sm"}`} style={{ color: s?.mavzu_nomi ? "#3B6D11" : "#1B4B7A" }}>{d.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          {!keng && <p className="text-[10px] font-medium mb-0.5" style={{ color: "#8A8578" }}>{bugunmi ? "bugun" : "\u00A0"}</p>}
          {keng && <p className="text-[11px] font-medium mb-0.5" style={{ color: "#8A8578" }}>{HAFTA_KUN_TOLIQ[haftaKuni]}{bugunmi ? " · bugun" : ""}</p>}
          {s?.mavzu_nomi ? (
            <p className={`font-semibold truncate ${keng ? "text-sm" : "text-xs"}`} style={{ color: "#2B2B2B" }}>{topicName({ mavzu_name: s.mavzu_nomi })}</p>
          ) : (
            <p className={`font-medium ${keng ? "text-sm" : "text-xs"}`} style={{ color: "#C89B3C" }}>+ Tanlash</p>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{togarakNomi}</h1>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button onClick={onAzolar} className="rounded-2xl bg-white border flex flex-col items-center justify-center gap-1.5 py-3.5" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EAF1F7" }}>
            <Users size={18} style={{ color: "#1B4B7A" }} />
          </span>
          <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>Talabalar</span>
        </button>
        <button onClick={onMavzular} className="rounded-2xl bg-white border flex flex-col items-center justify-center gap-1.5 py-3.5" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EAF3DE" }}>
            <BookOpen size={18} style={{ color: "#3B6D11" }} />
          </span>
          <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>Mavzular</span>
        </button>
        <button onClick={onSozlamalar} className="rounded-2xl bg-white border flex flex-col items-center justify-center gap-1.5 py-3.5" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FDF3E0" }}>
            <Settings size={18} style={{ color: "#8A5A1C" }} />
          </span>
          <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>Sozlamalar</span>
        </button>
      </div>

      {darsKunlari !== null && darsKunlari.length === 0 && !kunlarTanlovOchiq && (
        <div className="rounded-2xl p-4 border mb-4" style={{ backgroundColor: "#FDF3E0", borderColor: "#C89B3C" }}>
          <p className="text-sm font-bold mb-1" style={{ color: "#8A5A1C" }}>📅 Dars kunlarini belgilang</p>
          <p className="text-xs mb-3" style={{ color: "#5A5648" }}>Qaysi kunlari dars o'tishingizni belgilasangiz, shu kunlarga mavzu tayinlab chiqishingiz mumkin.</p>
          <button onClick={() => { setVaqtinchaKunlar(darsKunlari); setKunlarTanlovOchiq(true); }}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#C89B3C" }}>
            Kunlarni tanlash
          </button>
        </div>
      )}

      {kunlarTanlovOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "#5A5648" }}>Qaysi kunlari dars bo'ladi?</p>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {[1, 2, 3, 4, 5, 6, 7].map((k) => (
              <button key={k} type="button"
                onClick={() => setVaqtinchaKunlar((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])}
                className="py-2 rounded-lg border text-xs font-semibold text-center"
                style={{
                  borderColor: vaqtinchaKunlar.includes(k) ? "#1B4B7A" : "#E5E1D8",
                  backgroundColor: vaqtinchaKunlar.includes(k) ? "#1B4B7A" : "#FFFFFF",
                  color: vaqtinchaKunlar.includes(k) ? "#FFFFFF" : "#5A5648",
                }}>
                {HAFTA_KUN_QISQA[k]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setKunlarTanlovOchiq(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>Bekor</button>
            <button onClick={kunlarSaqla} disabled={kunlarSaqlanmoqda || vaqtinchaKunlar.length === 0}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: "#1B4B7A", opacity: (kunlarSaqlanmoqda || vaqtinchaKunlar.length === 0) ? 0.6 : 1 }}>
              {kunlarSaqlanmoqda ? "..." : "Saqlash"}
            </button>
          </div>
        </div>
      )}

      {darsKunlari !== null && darsKunlari.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex rounded-full p-1 gap-0.5" style={{ backgroundColor: "#F0EDE5" }}>
              <button onClick={() => setKorinishTuri("hafta")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={korinishTuri === "hafta" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
                Haftalik
              </button>
              <button onClick={() => setKorinishTuri("oy")} className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={korinishTuri === "oy" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
                Oylik
              </button>
            </div>
            <button onClick={() => { setVaqtinchaKunlar(darsKunlari); setKunlarTanlovOchiq(true); }} className="text-xs font-medium" style={{ color: "#8A8578" }}>
              {darsKunlari.map((k) => HAFTA_KUN_QISQA[k]).join(", ")} ✏️
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button onClick={() => davrniSurish(-1)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>‹</button>
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{davrLabel}</p>
            <button onClick={() => davrniSurish(1)} className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>›</button>
          </div>

          <button onClick={avtomatikToldir} disabled={avtomatikToldirilmoqda}
            className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11", opacity: avtomatikToldirilmoqda ? 0.7 : 1 }}>
            {avtomatikToldirilmoqda ? "..." : "🪄 Rejadan avtomatik to'ldirish"}
          </button>
          {avtomatikXabar && <p className="text-xs mb-3 text-center" style={{ color: avtomatikXabar.startsWith("✓") ? "#3B6D11" : "#B0553A" }}>{avtomatikXabar}</p>}

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

          {yuklanmoqda ? (
            <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : korinishTuri === "hafta" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  {[1, 3, 5].map((hk) => kunKartasiChiqar(hk, false))}
                </div>
                <div className="space-y-2">
                  {[2, 4, 6].map((hk) => kunKartasiChiqar(hk, false))}
                </div>
              </div>
              {kunKartasiChiqar(7, true)}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="grid grid-cols-7 mb-2">
                {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <p key={k} className="text-[10px] text-center font-semibold uppercase tracking-wide" style={{ color: darsKunlari.includes(k) ? "#1B4B7A" : "#D8D3C7" }}>
                    {HAFTA_KUN_QISQA[k].slice(0, 2)}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {(() => {
                  const oyBoshi = new Date(ankor.getFullYear(), ankor.getMonth(), 1);
                  const boshiKun = oyBoshi.getDay() === 0 ? 7 : oyBoshi.getDay();
                  const boshlangichBosh = [];
                  for (let i = 1; i < boshiKun; i++) boshlangichBosh.push(<div key={`b${i}`} />);
                  const sanaMap = Object.fromEntries(sanalar.map((s) => [s.sana, s]));
                  const bugunKey = _sanaFmt(new Date());
                  const kunlar = [];
                  const jamiKun = new Date(ankor.getFullYear(), ankor.getMonth() + 1, 0).getDate();
                  for (let kun = 1; kun <= jamiKun; kun++) {
                    const d = new Date(ankor.getFullYear(), ankor.getMonth(), kun);
                    const key = _sanaFmt(d);
                    const s = sanaMap[key];
                    const haftaKuni = d.getDay() === 0 ? 7 : d.getDay();
                    const darsKunimi = darsKunlari.includes(haftaKuni);
                    const bugunmi = key === bugunKey;
                    const mavzuBormi = darsKunimi && s?.mavzu_nomi;
                    kunlar.push(
                      <button key={key} onClick={() => darsKunimi && sanaBosildi(key)} disabled={!darsKunimi}
                        className="w-8 h-8 rounded-full flex items-center justify-center relative"
                        style={{
                          backgroundColor: mavzuBormi ? "#3B6D11" : "transparent",
                          border: bugunmi ? "1.5px solid #1B4B7A" : "1.5px solid transparent",
                        }}>
                        <span className="text-xs font-semibold" style={{ color: mavzuBormi ? "#FFFFFF" : darsKunimi ? "#2B2B2B" : "#D8D3C7" }}>{kun}</span>
                        {darsKunimi && !mavzuBormi && (
                          <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ backgroundColor: "#C89B3C" }} />
                        )}
                      </button>,
                    );
                  }
                  return [...boshlangichBosh, ...kunlar];
                })()}
              </div>
              <div className="flex items-center gap-3.5 mt-3.5 pt-3 border-t" style={{ borderColor: "#F0EDE5" }}>
                <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "#8A8578" }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#3B6D11" }} /> Mavzu bor
                </span>
                <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "#8A8578" }}>
                  <span className="w-3 h-3 rounded-full inline-flex items-center justify-center" style={{ border: "1px solid #E5E1D8" }}><span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#C89B3C" }} /></span> Bo'sh dars kuni
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {tanlanganSana && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-md rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 -8px 32px rgba(43,43,43,0.18)" }}>
            <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ backgroundColor: "#E5E1D8" }} />
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold" style={{ color: "#2B2B2B" }}>{tanlanganSana} uchun mavzu</p>
              <button onClick={() => setTanlanganSana(null)} style={{ color: "#8A8578" }}>✕</button>
            </div>
            {sanalar.find((s) => s.sana === tanlanganSana)?.mavzu_nomi && (
              <button onClick={() => mavzuBiriktir(null)} disabled={biriktirilmoqda}
                className="w-full py-2.5 rounded-xl font-medium text-sm mb-3" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                Mavzuni olib tashlash
              </button>
            )}
            <input type="text" value={mavzuQidiruv} onChange={(e) => setMavzuQidiruv(e.target.value)}
              placeholder="Mavzu qidirish..." className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            {togarakMavzulari === null ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : filtrlanganMavzular.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: "#8A8578" }}>Mavzu topilmadi. Avval "Mavzular" bo'limidan to'garakka mavzu qo'shing.</p>
            ) : (
              <div className="space-y-1.5">
                {filtrlanganMavzular.map((m, index) => (
                  <button key={m.topic_code} onClick={() => mavzuBiriktir(m.topic_code)} disabled={biriktirilmoqda}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl" style={{ backgroundColor: "#F7F5F0" }}>
                    <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{formatTopicTitle(index, m)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MavzuKitobiTahrirlash({ token, togarakId, mavzu, onOrtga }) {
  const [videolar, setVideolar] = useState([]);
  const [misollar, setMisollar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  const [videoFormaOchiq, setVideoFormaOchiq] = useState(false);
  const [videoSarlavha, setVideoSarlavha] = useState("");
  const [videoHavola, setVideoHavola] = useState("");
  const [videoSaqlanmoqda, setVideoSaqlanmoqda] = useState(false);

  const [misolFormaOchiq, setMisolFormaOchiq] = useState(false);
  const [tahrirlanayotganMisolId, setTahrirlanayotganMisolId] = useState(null);
  const [misolVideoId, setMisolVideoId] = useState("");
  const [misolMasala, setMisolMasala] = useState("");
  const [misolYechim, setMisolYechim] = useState("");
  const [misolSoniya, setMisolSoniya] = useState("");
  const [misolTugashSoniya, setMisolTugashSoniya] = useState("");
  const [misolSaqlanmoqda, setMisolSaqlanmoqda] = useState(false);
  const [kengaytirilganMisolId, setKengaytirilganMisolId] = useState(null);

  const [mustaqilIshlar, setMustaqilIshlar] = useState([]);
  const [ishFormaOchiq, setIshFormaOchiq] = useState(false);
  const [ishSavol, setIshSavol] = useState("");
  const [ishMezon, setIshMezon] = useState("");
  const [ishSaqlanmoqda, setIshSaqlanmoqda] = useState(false);

  const ishlarniYukla = () => {
    fetch(`${API_BASE}/api/oqituvchi/mustaqil_ishlar?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&topic_code=${encodeURIComponent(mavzu.topic_code)}`)
      .then((r) => r.json())
      .then((d) => setMustaqilIshlar(d.ishlar || []))
      .catch(() => {});
  };

  const ishQosh = async () => {
    if (!ishSavol.trim() || !ishMezon.trim()) { setXato("Savol va to'g'ri javob mezonini kiriting"); return; }
    setIshSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/mustaqil_ish_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, topic_code: mavzu.topic_code, savol_matni: ishSavol.trim(), togri_javob_mezoni: ishMezon.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setIshSavol(""); setIshMezon(""); setIshFormaOchiq(false);
      ishlarniYukla();
    } catch (e) { setXato(e.message); } finally { setIshSaqlanmoqda(false); }
  };

  const ishOchir = async (ishId) => {
    await fetch(`${API_BASE}/api/oqituvchi/mustaqil_ish_ochir?token=${encodeURIComponent(token)}&ish_id=${ishId}`, { method: "DELETE" });
    ishlarniYukla();
  };

  const yukla = () => {
    setYuklanmoqda(true); setXato("");
    fetch(`${API_BASE}/api/oqituvchi/mavzu_kitobi?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&topic_code=${encodeURIComponent(mavzu.topic_code)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setVideolar(d.videolar || []); setMisollar(d.misollar || []); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  useEffect(() => { yukla(); ishlarniYukla(); }, [token, togarakId, mavzu.topic_code]); // eslint-disable-line react-hooks/exhaustive-deps

  const videoQosh = async () => {
    if (!videoHavola.trim()) { setXato("Video havolasini kiriting"); return; }
    setVideoSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/mavzu_video_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, topic_code: mavzu.topic_code, sarlavha: videoSarlavha.trim() || null, video_havola: videoHavola.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setVideoSarlavha(""); setVideoHavola(""); setVideoFormaOchiq(false);
      yukla();
    } catch (e) { setXato(e.message); } finally { setVideoSaqlanmoqda(false); }
  };

  const videoOchir = async (videoId) => {
    await fetch(`${API_BASE}/api/oqituvchi/mavzu_video_ochir?token=${encodeURIComponent(token)}&video_id=${videoId}`, { method: "DELETE" });
    yukla();
  };

  const misolFormaniOch = (misol) => {
    if (misol) {
      setTahrirlanayotganMisolId(misol.id);
      setMisolVideoId(misol.video_id ? String(misol.video_id) : "");
      setMisolMasala(misol.masala_matni);
      setMisolYechim(misol.yechim_matni || "");
      setMisolSoniya(misol.video_soniya != null ? String(misol.video_soniya) : "");
      setMisolTugashSoniya(misol.video_tugash_soniya != null ? String(misol.video_tugash_soniya) : "");
    } else {
      setTahrirlanayotganMisolId(null);
      setMisolVideoId(videolar.length > 0 ? String(videolar[videolar.length - 1].id) : "");
      setMisolMasala(""); setMisolYechim(""); setMisolSoniya(""); setMisolTugashSoniya("");
    }
    setMisolFormaOchiq(true);
  };

  const misolSaqla = async () => {
    if (!misolMasala.trim()) { setXato("Masala matnini kiriting"); return; }
    setMisolSaqlanmoqda(true); setXato("");
    const goVideoId = misolVideoId ? Number(misolVideoId) : null;
    const goSoniya = misolSoniya.trim() ? Number(misolSoniya) : null;
    const goTugashSoniya = misolTugashSoniya.trim() ? Number(misolTugashSoniya) : null;
    try {
      const yol = tahrirlanayotganMisolId ? "mavzu_misol_tahrirlash" : "mavzu_misol_qosh";
      const tana = tahrirlanayotganMisolId
        ? { token, misol_id: tahrirlanayotganMisolId, video_id: goVideoId, masala_matni: misolMasala.trim(), yechim_matni: misolYechim.trim() || null, video_soniya: goSoniya, video_tugash_soniya: goTugashSoniya }
        : { token, togarak_id: togarakId, topic_code: mavzu.topic_code, video_id: goVideoId, masala_matni: misolMasala.trim(), yechim_matni: misolYechim.trim() || null, video_soniya: goSoniya, video_tugash_soniya: goTugashSoniya };
      const res = await fetch(`${API_BASE}/api/oqituvchi/${yol}`, {
        method: tahrirlanayotganMisolId ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tana),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setMisolFormaOchiq(false); setTahrirlanayotganMisolId(null);
      yukla();
    } catch (e) { setXato(e.message); } finally { setMisolSaqlanmoqda(false); }
  };

  const misolOchir = async (misolId) => {
    await fetch(`${API_BASE}/api/oqituvchi/mavzu_misol_ochir?token=${encodeURIComponent(token)}&misol_id=${misolId}`, { method: "DELETE" });
    yukla();
  };

  const misolSur = async (misolId, yonalish) => {
    await fetch(`${API_BASE}/api/oqituvchi/mavzu_misol_surish`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, misol_id: misolId, yonalish }),
    });
    yukla();
  };

  const soniyaniVaqtga = (s) => {
    if (s == null) return null;
    const daq = Math.floor(s / 60); const son = s % 60;
    return `${daq}:${String(son).padStart(2, "0")}`;
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{topicName(mavzu)}</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>📖 Kitob tuzish</h1>

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>⚠️ {xato}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <>
          <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: "#5A5648" }}>🎬 Videolar</p>
              <button onClick={() => setVideoFormaOchiq(!videoFormaOchiq)} className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>
                {videoFormaOchiq ? "✕ Yopish" : "+ Video"}
              </button>
            </div>
            {videoFormaOchiq && (
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: "#F7F5F0" }}>
                <input type="text" value={videoSarlavha} onChange={(e) => setVideoSarlavha(e.target.value)} placeholder="Sarlavha (ixtiyoriy)"
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <input type="text" value={videoHavola} onChange={(e) => setVideoHavola(e.target.value)} placeholder="Video havolasi (YouTube yoki boshqa)"
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <button onClick={videoQosh} disabled={videoSaqlanmoqda}
                  className="w-full py-2 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: videoSaqlanmoqda ? 0.7 : 1 }}>
                  {videoSaqlanmoqda ? "..." : "Qo'shish"}
                </button>
              </div>
            )}
            {videolar.length === 0 ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali video qo'shilmagan.</p>
            ) : (
              <div className="space-y-1.5">
                {videolar.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "#F7F5F0" }}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "#2B2B2B" }}>{i + 1}. {v.sarlavha || "Video"}</p>
                      <p className="text-[11px] truncate" style={{ color: "#8A8578" }}>{v.video_havola}</p>
                    </div>
                    <button onClick={() => videoOchir(v.id)} className="text-xs font-semibold shrink-0" style={{ color: "#A32D2D" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: "#5A5648" }}>📚 Misollar ({misollar.length})</p>
              <button onClick={() => misolFormaniOch(null)} className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>+ Misol</button>
            </div>

            {misolFormaOchiq && (
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: "#F7F5F0" }}>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>Qaysi videoga tegishli (ixtiyoriy)</label>
                <select value={misolVideoId} onChange={(e) => setMisolVideoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }}>
                  <option value="">— Bog'lanmagan —</option>
                  {videolar.map((v, i) => <option key={v.id} value={v.id}>{i + 1}. {v.sarlavha || "Video"}</option>)}
                </select>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>Masala matni (LaTeX: $...$ ishlatishingiz mumkin)</label>
                <textarea value={misolMasala} onChange={(e) => setMisolMasala(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>Yechim / tushuntirish</label>
                <textarea value={misolYechim} onChange={(e) => setMisolYechim(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>Videoning qaysi qismi (soniyada, ixtiyoriy)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input type="number" min="0" value={misolSoniya} onChange={(e) => setMisolSoniya(e.target.value)} placeholder="boshlanishi, masalan 245"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E5E1D8" }} />
                  <span className="text-xs" style={{ color: "#8A8578" }}>—</span>
                  <input type="number" min="0" value={misolTugashSoniya} onChange={(e) => setMisolTugashSoniya(e.target.value)} placeholder="tugashi, masalan 310"
                    className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E5E1D8" }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setMisolFormaOchiq(false); setTahrirlanayotganMisolId(null); }} className="flex-1 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>Bekor</button>
                  <button onClick={misolSaqla} disabled={misolSaqlanmoqda}
                    className="flex-1 py-2 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: misolSaqlanmoqda ? 0.7 : 1 }}>
                    {misolSaqlanmoqda ? "..." : tahrirlanayotganMisolId ? "Saqlash" : "Qo'shish"}
                  </button>
                </div>
              </div>
            )}

            {misollar.length === 0 ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali misol qo'shilmagan.</p>
            ) : (
              <div className="space-y-2">
                {misollar.map((m, i) => {
                  const videoNomi = videolar.find((v) => v.id === m.video_id);
                  const ochiqmi = kengaytirilganMisolId === m.id;
                  return (
                    <div key={m.id} className="rounded-xl border overflow-hidden" style={{ borderColor: "#E5E1D8" }}>
                      <button onClick={() => setKengaytirilganMisolId(ochiqmi ? null : m.id)} className="w-full text-left px-3.5 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold shrink-0" style={{ color: "#1B4B7A" }}>{i + 1}.</span>
                          {videoNomi && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                              🎬 {soniyaniVaqtga(m.video_soniya) ? `${soniyaniVaqtga(m.video_soniya)}${m.video_tugash_soniya != null ? `–${soniyaniVaqtga(m.video_tugash_soniya)}` : ""}` : (videoNomi.sarlavha || "video")}
                            </span>
                          )}
                        </div>
                        <AralashMatn matn={m.masala_matni} className="text-sm font-medium" style={{ color: "#2B2B2B" }} />
                      </button>
                      {ochiqmi && (
                        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5" style={{ borderTop: "1px solid #F0EDE5" }}>
                          {m.yechim_matni && (
                            <div className="rounded-lg p-2.5 mt-2" style={{ backgroundColor: "#F7F5F0" }}>
                              <p className="text-[10px] font-semibold mb-1" style={{ color: "#8A8578" }}>YECHIM</p>
                              <AralashMatn matn={m.yechim_matni} className="text-sm" style={{ color: "#5A5648" }} />
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <button onClick={() => misolSur(m.id, "yuqori")} disabled={i === 0} className="w-7 h-7 rounded-full border flex items-center justify-center text-xs" style={{ borderColor: "#E5E1D8", opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                            <button onClick={() => misolSur(m.id, "pastga")} disabled={i === misollar.length - 1} className="w-7 h-7 rounded-full border flex items-center justify-center text-xs" style={{ borderColor: "#E5E1D8", opacity: i === misollar.length - 1 ? 0.3 : 1 }}>↓</button>
                            <button onClick={() => misolFormaniOch(m)} className="text-xs font-semibold ml-auto" style={{ color: "#1B4B7A" }}>Tahrirlash</button>
                            <button onClick={() => misolOchir(m.id)} className="text-xs font-semibold" style={{ color: "#A32D2D" }}>O'chirish</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: "#5A5648" }}>📝 Mustaqil ishlar ({mustaqilIshlar.length})</p>
              <button onClick={() => setIshFormaOchiq(!ishFormaOchiq)} className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>
                {ishFormaOchiq ? "✕ Yopish" : "+ Topshiriq"}
              </button>
            </div>
            <p className="text-[11px] mb-3" style={{ color: "#8A8578" }}>
              O'quvchi kitobni o'rgangach, shu savollarga ERKIN matnda javob yozadi — AI sizning yozgan mezoningiz asosida tekshiradi.
            </p>

            {ishFormaOchiq && (
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: "#F7F5F0" }}>
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>Savol matni</label>
                <textarea value={ishSavol} onChange={(e) => setIshSavol(e.target.value)} rows={2}
                  placeholder="masalan: 12 va 18 sonlarining EKUBini toping va yechim yo'lini tushuntiring"
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <label className="text-[11px] font-medium mb-1 block" style={{ color: "#5A5648" }}>To'g'ri javob mezoni (AI shunga qarab tekshiradi)</label>
                <textarea value={ishMezon} onChange={(e) => setIshMezon(e.target.value)} rows={2}
                  placeholder="masalan: To'g'ri javob 6. O'quvchi ikkala sonni tub ko'paytuvchilarga ajratib, umumiy ko'paytuvchilarni topgan bo'lishi kerak."
                  className="w-full px-3 py-2 rounded-lg border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
                <button onClick={ishQosh} disabled={ishSaqlanmoqda}
                  className="w-full py-2 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: ishSaqlanmoqda ? 0.7 : 1 }}>
                  {ishSaqlanmoqda ? "..." : "Qo'shish"}
                </button>
              </div>
            )}

            {mustaqilIshlar.length === 0 ? (
              <p className="text-xs" style={{ color: "#8A8578" }}>Hali topshiriq qo'shilmagan.</p>
            ) : (
              <div className="space-y-2">
                {mustaqilIshlar.map((ish, i) => (
                  <div key={ish.id} className="rounded-xl p-3" style={{ backgroundColor: "#F7F5F0" }}>
                    <div className="flex items-start justify-between gap-2">
                      <AralashMatn matn={`${i + 1}. ${ish.savol_matni}`} className="text-sm font-medium flex-1" style={{ color: "#2B2B2B" }} />
                      <button onClick={() => ishOchir(ish.id)} className="text-xs font-semibold shrink-0" style={{ color: "#A32D2D" }}>✕</button>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: "#8A8578" }}>Mezon: {ish.togri_javob_mezoni}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TogarakMavzularBoshqarish({ token, togarakId, onOrtga }) {
  const [mavzular, setMavzular] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [qidiruvOchiq, setQidiruvOchiq] = useState(false);
  const [qidiruv, setQidiruv] = useState("");
  const [qidiruvNatijalari, setQidiruvNatijalari] = useState(null);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);

  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [kontentlar, setKontentlar] = useState(null);
  const [kitobOchiq, setKitobOchiq] = useState(false);
  const [kontentTuriFormasi, setKontentTuriFormasi] = useState(null); // "matn" | "latex" | "video" | "fayl" | null
  const [sarlavha, setSarlavha] = useState("");
  const [matn, setMatn] = useState("");
  const [videoHavola, setVideoHavola] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const [testShablonOchiq, setTestShablonOchiq] = useState(false);
  const [testTanlanganKodlar, setTestTanlanganKodlar] = useState({}); // {topic_code: soni}
  const [testYuklanmoqda, setTestYuklanmoqda] = useState(false);
  const [testImportlanmoqda, setTestImportlanmoqda] = useState(false);
  const [testNatija, setTestNatija] = useState(null);

  const [yangiMavzuOchiq, setYangiMavzuOchiq] = useState(false);
  const [yangiMavzuNomi, setYangiMavzuNomi] = useState("");
  const [yangiMavzuBob, setYangiMavzuBob] = useState("");
  const [yangiMavzuYaratilmoqda, setYangiMavzuYaratilmoqda] = useState(false);
  const [kopMavzuRejimi, setKopMavzuRejimi] = useState(false);
  const [kopMavzuMatni, setKopMavzuMatni] = useState("");
  const [kopMavzuYaratilmoqda, setKopMavzuYaratilmoqda] = useState(false);
  const [kopMavzuProgress, setKopMavzuProgress] = useState("");

  const mavzularniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/togarak_barcha_mavzular?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setMavzular(d.mavzular || []); setXato(""); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };
  useEffect(mavzularniYukla, [token, togarakId]);

  const [qidiruvXato, setQidiruvXato] = useState("");

  useEffect(() => {
    if (!qidiruvOchiq) return;
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/oqituvchi/togarak_milliy_mavzular_qidir?token=${encodeURIComponent(token)}&togarak_id=${togarakId}${qidiruv.trim() ? `&qidiruv=${encodeURIComponent(qidiruv.trim())}` : ""}`)
        .then(async (r) => {
          const d = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
          return d;
        })
        .then((d) => { setQidiruvNatijalari(d.mavzular || []); setQidiruvXato(""); setQidirilmoqda(false); })
        .catch((e) => { setQidiruvXato(e.message || "Yuklab bo'lmadi"); setQidirilmoqda(false); });
    }, 350);
    return () => clearTimeout(kechiktirish);
  }, [qidiruv, qidiruvOchiq, token, togarakId]);

  const mavzuBiriktir = async (topicCode) => {
    await fetch(`${API_BASE}/api/oqituvchi/togarak_milliy_mavzu_biriktir`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, togarak_id: togarakId, topic_code: topicCode }),
    });
    mavzularniYukla();
  };

  const [barchasiniQoshishYuklanmoqda, setBarchasiniQoshishYuklanmoqda] = useState(false);
  const barchasiniQoshish = async () => {
    const yangilari = (qidiruvNatijalari || []).filter((m) => !mavzular.some((x) => x.topic_code === m.topic_code));
    if (yangilari.length === 0) return;
    setBarchasiniQoshishYuklanmoqda(true);
    try {
      await Promise.all(yangilari.map((m) =>
        fetch(`${API_BASE}/api/oqituvchi/togarak_milliy_mavzu_biriktir`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, togarak_id: togarakId, topic_code: m.topic_code }),
        })
      ));
      mavzularniYukla();
    } finally { setBarchasiniQoshishYuklanmoqda(false); }
  };

  const mavzuniOlibTashla = async (topicCode) => {
    await fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_biriktirmasini_ochir?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&topic_code=${encodeURIComponent(topicCode)}`, { method: "DELETE" });
    mavzularniYukla();
    if (tanlanganMavzu?.topic_code === topicCode) setTanlanganMavzu(null);
  };

  const kontentlarniYukla = (topicCode) => {
    fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_kontentlari?token=${encodeURIComponent(token)}&togarak_id=${togarakId}&topic_code=${encodeURIComponent(topicCode)}`)
      .then((r) => r.json())
      .then((d) => setKontentlar(d.kontentlar || []))
      .catch(() => setKontentlar([]));
  };

  const mavzuOch = (m) => { setTanlanganMavzu(m); setKontentlar(null); kontentlarniYukla(m.topic_code); };

  const formaniTozala = () => { setSarlavha(""); setMatn(""); setVideoHavola(""); setKontentTuriFormasi(null); setXato(""); };

  const matnKontentSaqla = async () => {
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_matn_kontent_qosh`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, togarak_id: togarakId, topic_code: tanlanganMavzu.topic_code, kontent_turi: kontentTuriFormasi,
          sarlavha: sarlavha || undefined, matn: kontentTuriFormasi !== "video" ? matn : undefined,
          video_havola: kontentTuriFormasi === "video" ? videoHavola : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formaniTozala();
      kontentlarniYukla(tanlanganMavzu.topic_code);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setSaqlanmoqda(true); setXato("");
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const q = new URLSearchParams({ token, togarak_id: togarakId, topic_code: tanlanganMavzu.topic_code, sarlavha: sarlavha || "" });
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_fayl_kontent_qosh?${q.toString()}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      formaniTozala();
      kontentlarniYukla(tanlanganMavzu.topic_code);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); e.target.value = ""; }
  };

  const kontentOchir = async (id) => {
    await fetch(`${API_BASE}/api/oqituvchi/togarak_kontent_ochir?token=${encodeURIComponent(token)}&biriktirma_id=${id}`, { method: "DELETE" });
    kontentlarniYukla(tanlanganMavzu.topic_code);
    mavzularniYukla();
  };

  const [testHammasigaSoni, setTestHammasigaSoni] = useState("");

  const testKodBelgila = (topicCode, soni) => {
    setTestTanlanganKodlar((prev) => {
      const yangi = { ...prev };
      if (soni <= 0) delete yangi[topicCode];
      else yangi[topicCode] = soni;
      return yangi;
    });
  };

  const testShablonYukla = async () => {
    const guruhlar = Object.entries(testTanlanganKodlar).map(([topic_code, soni]) => ({ topic_code, soni }));
    if (guruhlar.length === 0) { setXato("Kamida bitta mavzudan son tanlang"); return; }
    setTestYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_test_shablon`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, guruhlar }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Xato"); }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = "togarak_test_shablon.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) { setXato(e.message); } finally { setTestYuklanmoqda(false); }
  };

  const testFaylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setTestImportlanmoqda(true); setXato(""); setTestNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_test_import?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setTestNatija(data);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setTestImportlanmoqda(false); e.target.value = ""; }
  };

  const yangiMavzuYarat = async () => {
    if (!yangiMavzuNomi.trim()) { setXato("Mavzu nomini kiriting"); return; }
    setYangiMavzuYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_yangi_mavzu_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarakId, nomi: yangiMavzuNomi.trim(), bob: yangiMavzuBob.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setYangiMavzuNomi(""); setYangiMavzuBob(""); setYangiMavzuOchiq(false);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setYangiMavzuYaratilmoqda(false); }
  };

  const kopMavzuYarat = async () => {
    const nomlar = kopMavzuMatni.split("\n").map((s) => s.trim()).filter(Boolean);
    if (nomlar.length === 0) { setXato("Kamida bitta mavzu nomi yozing"); return; }
    setKopMavzuYaratilmoqda(true); setXato("");
    try {
      for (let i = 0; i < nomlar.length; i++) {
        setKopMavzuProgress(`${i + 1} / ${nomlar.length}: ${nomlar[i]}`);
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_yangi_mavzu_yarat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, togarak_id: togarakId, nomi: nomlar[i] }),
        });
        // eslint-disable-next-line no-await-in-loop
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`"${nomlar[i]}" qo'shilmadi: ${data.detail || "xato"}`);
      }
      setKopMavzuMatni(""); setKopMavzuRejimi(false); setYangiMavzuOchiq(false);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setKopMavzuYaratilmoqda(false); setKopMavzuProgress(""); }
  };

  const KONTENT_YORLIQ = { matn: "📝 Matn", latex: "🧮 LaTeX", rasm: "🖼 Rasm", pdf: "📄 PDF", word: "📃 Word", video: "🎬 Video" };

  if (tanlanganMavzu && kitobOchiq) {
    return (
      <MavzuKitobiTahrirlash token={token} togarakId={togarakId} mavzu={tanlanganMavzu}
        onOrtga={() => setKitobOchiq(false)} />
    );
  }

  if (tanlanganMavzu) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganMavzu(null); setKontentlar(null); formaniTozala(); }} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Mavzular</button>
        <h1 className="text-xl font-bold mb-3" style={{ color: "#2B2B2B" }}>{formatTopicTitle(0, tanlanganMavzu)}</h1>

        <button onClick={() => setKitobOchiq(true)} className="w-full rounded-2xl bg-white border flex items-center gap-3 px-4 py-3.5 mb-4" style={{ borderColor: "#E5E1D8" }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF3DE" }}>
            <BookOpen size={18} style={{ color: "#3B6D11" }} />
          </span>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>Kitob tuzish</p>
            <p className="text-[11px]" style={{ color: "#8A8578" }}>Video + misollar</p>
          </div>
          <ChevronRight size={16} style={{ color: "#8A8578" }} />
        </button>

        <div className="flex gap-2 flex-wrap mb-4">
          {[["matn", "📝 Matn"], ["latex", "🧮 LaTeX"], ["video", "🎬 Video"]].map(([turi, yorliq]) => (
            <button key={turi} onClick={() => { formaniTozala(); setKontentTuriFormasi(turi); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={kontentTuriFormasi === turi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              + {yorliq}
            </button>
          ))}
          <label className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }}>
            + 🖼📄📃 Fayl
            <input type="file" accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx" onChange={faylTanlandi} className="hidden" />
          </label>
        </div>

        {(kontentTuriFormasi === "matn" || kontentTuriFormasi === "latex" || kontentTuriFormasi === "video") && (
          <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
            <input type="text" value={sarlavha} onChange={(e) => setSarlavha(e.target.value)} placeholder="Sarlavha (ixtiyoriy)"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
            {kontentTuriFormasi === "video" ? (
              <input type="text" value={videoHavola} onChange={(e) => setVideoHavola(e.target.value)} placeholder="Video havolasi (YouTube yoki boshqa)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
            ) : (
              <>
                <textarea value={matn} onChange={(e) => setMatn(e.target.value)}
                  placeholder={kontentTuriFormasi === "latex" ? "LaTeX formula, masalan: \\frac{1}{2}" : "Matn"} rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5 font-mono" style={{ borderColor: "#E5E1D8" }} />
                {kontentTuriFormasi === "latex" && matn.trim() && <SavolFormulasi ifoda={matn} />}
              </>
            )}
            {xato && <p className="text-sm mb-2.5" style={{ color: "#B0553A" }}>{xato}</p>}
            <button onClick={matnKontentSaqla} disabled={saqlanmoqda}
              className="w-full py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
              {saqlanmoqda ? "Saqlanmoqda..." : "Qo'shish"}
            </button>
          </div>
        )}
        {saqlanmoqda && !kontentTuriFormasi && <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Fayl yuklanmoqda...</p>}
        {xato && !kontentTuriFormasi && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

        <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>Qo'shilgan kontentlar ({(kontentlar || []).length})</p>
        {kontentlar === null ? (
          <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <div className="space-y-2">
            {kontentlar.map((k) => (
              <div key={k.id} className="rounded-xl p-3 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>{KONTENT_YORLIQ[k.kontent_turi]} {k.sarlavha ? `— ${k.sarlavha}` : ""}</p>
                  <p className="text-xs truncate" style={{ color: "#8A8578" }}>
                    {k.kontent_turi === "video" ? `👁 ${k.korilish_soni} ko'rilgan` : (k.matn || k.fayl_nomi || "").slice(0, 60)}
                  </p>
                </div>
                <button onClick={() => kontentOchir(k.id)} className="text-xs px-2 shrink-0" style={{ color: "#A32D2D" }}>✕</button>
              </div>
            ))}
            {kontentlar.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hali kontent qo'shilmagan.</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruh</button>
      <div className="flex items-center justify-between mb-1 gap-2">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>📖 To'garak mavzulari</h1>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <button onClick={() => { setYangiMavzuOchiq(!yangiMavzuOchiq); setQidiruvOchiq(false); setTestShablonOchiq(false); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
            {yangiMavzuOchiq ? "✕ Yopish" : "✏️ Yangi mavzu"}
          </button>
          <button onClick={() => { setTestShablonOchiq(!testShablonOchiq); setQidiruvOchiq(false); setYangiMavzuOchiq(false); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
            {testShablonOchiq ? "✕ Yopish" : "🧪 Test shablon"}
          </button>
          <button onClick={() => { setQidiruvOchiq(!qidiruvOchiq); setQidiruv(""); setQidiruvNatijalari(null); setTestShablonOchiq(false); setYangiMavzuOchiq(false); }}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {qidiruvOchiq ? "✕ Yopish" : "+ Mavzu qo'shish"}
          </button>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Milliy bazadan mavzu tanlab, har biriga matn/LaTeX/rasm/PDF/Word/video biriktiring.</p>

      {yangiMavzuOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#2B2B2B" }}>Yangi mavzu qo'shish</p>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
            Milliy bazada mos mavzu topilmasa (masalan yangi maxsus guruh uchun) — shu yerda nomini yozib, o'zingiz qo'shing. Kod avtomatik yaratiladi.
          </p>
          <div className="flex gap-1.5 mb-3">
            <button type="button" onClick={() => setKopMavzuRejimi(false)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={!kopMavzuRejimi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              Bittalab
            </button>
            <button type="button" onClick={() => setKopMavzuRejimi(true)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={kopMavzuRejimi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              Bir nechtasini birdan
            </button>
          </div>

          {kopMavzuRejimi ? (
            <>
              <p className="text-xs mb-2" style={{ color: "#8A8578" }}>Har bir mavzuni YANGI qatorga yozing.</p>
              <textarea value={kopMavzuMatni} onChange={(e) => setKopMavzuMatni(e.target.value)}
                placeholder={"1-mavzu nomi\n2-mavzu nomi\n3-mavzu nomi\n..."} rows={8}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={kopMavzuYarat} disabled={kopMavzuYaratilmoqda || !kopMavzuMatni.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: (kopMavzuYaratilmoqda || !kopMavzuMatni.trim()) ? 0.6 : 1 }}>
                {kopMavzuYaratilmoqda
                  ? <><Loader2 size={16} className="animate-spin" /> {kopMavzuProgress}</>
                  : `+ Barchasini qo'shish (${kopMavzuMatni.split("\n").map((s) => s.trim()).filter(Boolean).length} ta)`}
              </button>
            </>
          ) : (
            <>
              <input type="text" value={yangiMavzuBob} onChange={(e) => setYangiMavzuBob(e.target.value)}
                placeholder="Bob nomi (ixtiyoriy)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
              <input type="text" value={yangiMavzuNomi} onChange={(e) => setYangiMavzuNomi(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && yangiMavzuYarat()}
                placeholder="Mavzu nomi"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={yangiMavzuYarat} disabled={yangiMavzuYaratilmoqda || !yangiMavzuNomi.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: (yangiMavzuYaratilmoqda || !yangiMavzuNomi.trim()) ? 0.6 : 1 }}>
                {yangiMavzuYaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : "+ Mavzu qo'shish"}
              </button>
            </>
          )}
          {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
        </div>
      )}

      {testShablonOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#2B2B2B" }}>Ko'p savolni bir martada Excel orqali qo'shish</p>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Mavzu(lar)ni tanlab, har biriga necha savol kerakligini yozing.</p>
          {mavzular.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <input type="number" min="0" value={testHammasigaSoni} onChange={(e) => setTestHammasigaSoni(e.target.value)}
                placeholder="0" className="w-16 px-2 py-1.5 rounded-lg border text-xs text-center" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={() => {
                  const soni = parseInt(testHammasigaSoni, 10) || 0;
                  setTestTanlanganKodlar(Object.fromEntries(mavzular.map((m) => [m.topic_code, soni]).filter(([, s]) => s > 0)));
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
                Hammasiga qo'llash ({mavzular.length} ta)
              </button>
            </div>
          )}
          <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
            {mavzular.map((m, index) => (
              <div key={m.topic_code} className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "#F7F5F0" }}>
                <span className="flex-1 text-xs truncate" style={{ color: "#2B2B2B" }}>{formatTopicTitle(index, m)}</span>
                <input type="number" min="0" value={testTanlanganKodlar[m.topic_code] || ""}
                  onChange={(e) => testKodBelgila(m.topic_code, parseInt(e.target.value, 10) || 0)}
                  placeholder="0" className="w-16 px-2 py-1 rounded-lg border text-xs text-center" style={{ borderColor: "#E5E1D8" }} />
              </div>
            ))}
            {mavzular.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Avval "+ Mavzu qo'shish" yoki "✏️ Yangi mavzu" orqali mavzu qo'shing.</p>}
          </div>
          <button onClick={testShablonYukla} disabled={testYuklanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
            {testYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📥 Shablon yuklab olish"}
          </button>
          <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
            style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
            {testImportlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 To'ldirilgan faylni yuklash"}
            <input type="file" accept=".xlsx" onChange={testFaylTanlandi} disabled={testImportlanmoqda} className="hidden" />
          </label>
          {testNatija && (
            <p className="text-xs mt-3" style={{ color: "#3B6D11" }}>
              ✅ {testNatija.saved} ta savol qo'shildi{testNatija.errors > 0 ? `, ${testNatija.errors} ta xato` : ""}
            </p>
          )}
          {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
        </div>
      )}

      {qidiruvOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <input type="text" value={qidiruv} onChange={(e) => setQidiruv(e.target.value)} placeholder="Mavzu nomi bo'yicha qidirish (bo'sh — o'z sinf/faningiz)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          {!qidirilmoqda && !qidiruvXato && (qidiruvNatijalari || []).some((m) => !mavzular.some((x) => x.topic_code === m.topic_code)) && (
            <button onClick={barchasiniQoshish} disabled={barchasiniQoshishYuklanmoqda}
              className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#EAF3DE", color: "#3B6D11", opacity: barchasiniQoshishYuklanmoqda ? 0.7 : 1 }}>
              {barchasiniQoshishYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> :
                `✓✓ Barchasini qo'shish (${(qidiruvNatijalari || []).filter((m) => !mavzular.some((x) => x.topic_code === m.topic_code)).length} ta)`}
            </button>
          )}
          {qidirilmoqda ? (
            <div className="py-4 text-center"><Loader2 size={18} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : qidiruvXato ? (
            <p className="text-xs font-medium" style={{ color: "#A32D2D" }}>⚠️ {qidiruvXato}</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {(qidiruvNatijalari || []).map((m) => {
                const biriktirilganmi = mavzular.some((x) => x.topic_code === m.topic_code);
                return (
                  <div key={m.topic_code} className="flex items-center justify-between gap-2 rounded-lg p-2" style={{ backgroundColor: "#F7F5F0" }}>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "#2B2B2B" }}>{topicName(m)}</p>
                      <p className="text-xs truncate" style={{ color: "#8A8578" }}>{m.subject_name} · {m.grade}-sinf {m.bob_name ? `· ${m.bob_name}` : ""}</p>
                    </div>
                    <button onClick={() => mavzuBiriktir(m.topic_code)} disabled={biriktirilganmi}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0"
                      style={biriktirilganmi ? { backgroundColor: "#EAF3DE", color: "#3B6D11" } : { backgroundColor: "#1B4B7A", color: "#fff" }}>
                      {biriktirilganmi ? "✓ Qo'shilgan" : "+ Qo'shish"}
                    </button>
                  </div>
                );
              })}
              {(qidiruvNatijalari || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hech narsa topilmadi. Boshqa nom bilan qidirib ko'ring.</p>}
            </div>
          )}
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : xato ? (
        <p className="text-sm mb-3 font-medium" style={{ color: "#A32D2D" }}>⚠️ {xato}</p>
      ) : mavzular.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mavzular.map((m, index) => (
            <div key={m.topic_code} className="rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <button onClick={() => mavzuOch({ ...m, tartib_raqami: index + 1 })} className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{formatTopicTitle(index, m)}</p>
                <p className="text-xs truncate" style={{ color: "#8A8578" }}>{m.kontent_soni} kontent</p>
              </button>
              <button onClick={() => mavzuniOlibTashla(m.topic_code)} className="text-xs px-2 shrink-0" style={{ color: "#A32D2D" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TogarakGuruhSozlamalari({ token, togarak, onOrtga, onOchirildi }) {
  const [parolKorinmoqda, setParolKorinmoqda] = useState(false);
  const [joriyParol, setJoriyParol] = useState(null);
  const [parolYuklanmoqda, setParolYuklanmoqda] = useState(false);
  const [yangiParol, setYangiParol] = useState("");
  const [parolSaqlanmoqda, setParolSaqlanmoqda] = useState(false);
  const [parolSaqlandi, setParolSaqlandi] = useState(false);

  const [ochirishBosqichida, setOchirishBosqichida] = useState(false);
  const [ochirishParoli, setOchirishParoli] = useState("");
  const [ochirilmoqda, setOchirilmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const parolniKorsat = () => {
    if (parolKorinmoqda) { setParolKorinmoqda(false); return; }
    setParolYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/togarak_parolini_kor?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}`)
      .then((r) => r.json())
      .then((d) => { setJoriyParol(d.parol); setParolKorinmoqda(true); setParolYuklanmoqda(false); })
      .catch(() => setParolYuklanmoqda(false));
  };

  const parolAlmashtir = async () => {
    if (!yangiParol.trim()) return;
    setParolSaqlanmoqda(true); setParolSaqlandi(false);
    try {
      await fetch(`${API_BASE}/api/oqituvchi/togarak_parol_almashtir`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: togarak.id, yangi_parol: yangiParol.trim() }),
      });
      setJoriyParol(yangiParol.trim()); setYangiParol(""); setParolSaqlandi(true);
    } finally { setParolSaqlanmoqda(false); }
  };

  const guruhniOchir = async () => {
    if (!ochirishParoli.trim()) { setXato("Parolni kiriting"); return; }
    setOchirilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_ochir?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&parol=${encodeURIComponent(ochirishParoli.trim())}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onOchirildi();
    } catch (e) {
      setXato(e.message);
      setOchirilmoqda(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>⚙️ Guruh sozlamalari</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{togarak.nomi}</p>

      <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>🔑 Qo'shilish paroli</p>
        <button onClick={parolniKorsat} disabled={parolYuklanmoqda}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
          {parolYuklanmoqda ? "Yuklanmoqda..." : parolKorinmoqda ? `Parol: ${joriyParol || "(belgilanmagan)"} — yashirish` : "Parolni ko'rsatish"}
        </button>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Yangi parol belgilash</label>
        <div className="flex gap-2">
          <input type="text" value={yangiParol} onChange={(e) => setYangiParol(e.target.value)} placeholder="Yangi parol"
            className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          <button onClick={parolAlmashtir} disabled={parolSaqlanmoqda || !yangiParol.trim()}
            className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: parolSaqlanmoqda || !yangiParol.trim() ? 0.5 : 1 }}>
            {parolSaqlanmoqda ? "..." : "Saqlash"}
          </button>
        </div>
        {parolSaqlandi && <p className="text-xs mt-2" style={{ color: "#3B6D11" }}>✅ Parol yangilandi</p>}
      </div>

      <div className="rounded-2xl p-4 border" style={{ backgroundColor: "#FCEBEB", borderColor: "#E8A0A0" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#A32D2D" }}>⚠️ Xavfli hudud</p>
        <p className="text-xs mb-3" style={{ color: "#8A5A5A" }}>
          Guruhni o'chirsangiz — barcha a'zolar, o'z mavzu/testlaringiz va to'lov tarixi butunlay o'chadi. Bu amalni ORQAGA QAYTARIB BO'LMAYDI.
        </p>
        {!ochirishBosqichida ? (
          <button onClick={() => setOchirishBosqichida(true)}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#A32D2D" }}>
            🗑 Guruhni o'chirish
          </button>
        ) : (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "#A32D2D" }}>
              Tasdiqlash uchun guruh parolini kiriting:
            </p>
            <input type="text" value={ochirishParoli} onChange={(e) => setOchirishParoli(e.target.value)} placeholder="Guruh paroli"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E8A0A0" }} />
            {xato && <p className="text-xs mb-2" style={{ color: "#A32D2D" }}>{xato}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setOchirishBosqichida(false); setOchirishParoli(""); setXato(""); }}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm" style={{ backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
                Bekor qilish
              </button>
              <button onClick={guruhniOchir} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? "O'chirilmoqda..." : "Ha, butunlay o'chirish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function DavomatBelgilash({ token, sinfId, onOrtga }) {
  const bugun = new Date().toISOString().slice(0, 10);
  const [sana, setSana] = useState(bugun);
  const [oquvchilar, setOquvchilar] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [saqlandi, setSaqlandi] = useState(false);

  const HOLATLAR = [
    { kalit: "keldi", belgi: "✅", nomi: "Keldi", rang: "#3B6D11", fon: "#EAF3DE" },
    { kalit: "kelmadi", belgi: "❌", nomi: "Kelmadi", rang: "#A32D2D", fon: "#FCEBEB" },
    { kalit: "kechikdi", belgi: "⏰", nomi: "Kechikdi", rang: "#8A5A1C", fon: "#FDF3E0" },
    { kalit: "sababli", belgi: "📋", nomi: "Sababli", rang: "#5A5648", fon: "#F7F5F0" },
  ];

  const yukla = () => {
    setYuklanmoqda(true); setSaqlandi(false);
    fetch(`${API_BASE}/api/oqituvchi/davomat_royxati?token=${encodeURIComponent(token)}&sinf_id=${sinfId}&sana=${sana}`)
      .then((r) => r.json())
      .then((d) => {
        setOquvchilar((d.oquvchilar || []).map((o) => ({ ...o, holat: o.holat || "keldi" })));
        setYuklanmoqda(false);
      })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(yukla, [sana, sinfId, token]);

  const holatOzgartir = (userId, holat) => {
    setOquvchilar((prev) => prev.map((o) => (o.user_id === userId ? { ...o, holat } : o)));
  };

  const barchasiniBelgila = (holat) => {
    setOquvchilar((prev) => prev.map((o) => ({ ...o, holat })));
  };

  const saqla = async () => {
    setSaqlanmoqda(true); setXato(""); setSaqlandi(false);
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/davomat_belgila`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, sinf_id: sinfId, sana,
          yozuvlar: oquvchilar.map((o) => ({ user_id: o.user_id, holat: o.holat })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSaqlandi(true);
    } catch (e) {
      setXato(e.message);
    } finally { setSaqlanmoqda(false); }
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>📋 Davomat</h1>

      <input type="date" value={sana} onChange={(e) => setSana(e.target.value)} max={bugun}
        className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />

      <div className="flex gap-1.5 mb-4">
        {HOLATLAR.map((h) => (
          <button key={h.kalit} onClick={() => barchasiniBelgila(h.kalit)}
            className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: h.fon, color: h.rang }}>
            Hammasi {h.belgi}
          </button>
        ))}
      </div>

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <div className="space-y-2 mb-5">
          {(oquvchilar || []).map((o) => (
            <div key={o.user_id} className="rounded-xl p-3 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-medium mb-2" style={{ color: "#2B2B2B" }}>{o.full_name}</p>
              <div className="flex gap-1.5">
                {HOLATLAR.map((h) => (
                  <button key={h.kalit} onClick={() => holatOzgartir(o.user_id, h.kalit)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={o.holat === h.kalit ? { backgroundColor: h.rang, color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#8A8578" }}>
                    {h.belgi}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {(oquvchilar || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Sinfda o'quvchi yo'q.</p>}
        </div>
      )}

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {saqlandi && <p className="text-sm mb-3" style={{ color: "#3B6D11" }}>✅ Saqlandi</p>}
      <button onClick={saqla} disabled={saqlanmoqda || yuklanmoqda}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
        {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </div>
  );
}

function KirishKodiFormasi({ token, onOrtga }) {
  const [kirishKodi, setKirishKodi] = useState("");
  const [kodYuborilmoqda, setKodYuborilmoqda] = useState(false);
  const [kodXato, setKodXato] = useState("");
  const [kodNatija, setKodNatija] = useState(null);

  const kodBilanQoshil = async () => {
    if (!kirishKodi.trim()) { setKodXato("Kodni kiriting"); return; }
    setKodYuborilmoqda(true); setKodXato(""); setKodNatija(null);
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/kirish_kodi_orqali_qoshil`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kirish_kodi: kirishKodi.trim() }),
        cache: "no-store",
        credentials: "omit",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setKodNatija(data);
      setKirishKodi("");
    } catch (e) {
      setKodXato(e.message);
    } finally { setKodYuborilmoqda(false); }
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Profil</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>🔑 Kirish kodi</h1>
      <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
        Maktab/markaz/bog‘cha admini sizga bergan 12 belgili bir martalik
        kodni kiriting — hisobingizga tegishli lavozim avtomatik qo‘shiladi.
      </p>
      <div className="flex gap-2">
        <input type="text" value={kirishKodi} onChange={(e) => setKirishKodi(e.target.value.toUpperCase())}
          placeholder="masalan: A1B2C3D4E5F6" maxLength={12}
          className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
        <button onClick={kodBilanQoshil} disabled={kodYuborilmoqda}
          className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: kodYuborilmoqda ? 0.7 : 1 }}>
          {kodYuborilmoqda ? "..." : "Qo'shilish"}
        </button>
      </div>
      {kodXato && <p className="text-xs mt-2" style={{ color: "#A32D2D" }}>{kodXato}</p>}
      {kodNatija && (
        <p className="text-xs mt-2" style={{ color: "#3B6D11" }}>
          ✅ "{kodNatija.joy_nomi}" — {(LAVOZIM_NOMLARI[kodNatija.lavozim] || kodNatija.lavozim)} sifatida qo'shildingiz. Sahifani yangilang.
        </p>
      )}
    </div>
  );
}

function RasmiySinflarim({ token, onOrtga }) {
  const [sinflar, setSinflar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [tanlanganSinf, setTanlanganSinf] = useState(null);
  const [oquvchilar, setOquvchilar] = useState(null);
  const [oquvchilarYuklanmoqda, setOquvchilarYuklanmoqda] = useState(false);
  const [azolar, setAzolar] = useState(null);
  const [azolarYuklanmoqda, setAzolarYuklanmoqda] = useState(false);
  const [davomatKorinishi, setDavomatKorinishi] = useState(false);
  const [tanlanganOquvchiId, setTanlanganOquvchiId] = useState(null);
  const [otaOnaOquvchi, setOtaOnaOquvchi] = useState(null);
  const [otaOnaQidiruv, setOtaOnaQidiruv] = useState("");
  const [otaOnaNatijalar, setOtaOnaNatijalar] = useState([]);
  const [otaOnaXabar, setOtaOnaXabar] = useState("");
  const joriyOy = new Date().toISOString().slice(0, 7); // "2026-07"

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/mening_sinflarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setSinflar(d.sinflar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  const azolarniYukla = (sinfId) => {
    setAzolarYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/sinf_azolari?token=${encodeURIComponent(token)}&sinf_id=${sinfId}`)
      .then((r) => r.json())
      .then((d) => { setAzolar(d.azolar || []); setAzolarYuklanmoqda(false); })
      .catch(() => setAzolarYuklanmoqda(false));
  };

  const azoniChiqar = async (azolikId, sinfId) => {
    await fetch(`${API_BASE}/api/oqituvchi/sinf_azosini_chiqar?token=${encodeURIComponent(token)}&azolik_id=${azolikId}`, { method: "DELETE" });
    azolarniYukla(sinfId);
  };

  const otaOnaQidir = async () => {
    if (!otaOnaOquvchi || otaOnaQidiruv.trim().length < 2) return;
    const res = await fetch(`${API_BASE}/api/maktab/ota_ona_qidir?token=${encodeURIComponent(token)}&sinf_id=${tanlanganSinf.id}&ism=${encodeURIComponent(otaOnaQidiruv.trim())}`);
    const data = await res.json().catch(() => ({}));
    setOtaOnaNatijalar(res.ok ? (data.natijalar || []) : []);
    setOtaOnaXabar(res.ok ? "" : (data.detail || "Ota-onani qidirib bo‘lmadi"));
  };

  const otaOnaBogla = async (otaOna) => {
    const res = await fetch(`${API_BASE}/api/maktab/oquvchiga_ota_ona_bogla`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sinf_id: tanlanganSinf.id, oquvchi_user_id: otaOnaOquvchi.user_id, ota_ona_user_id: otaOna.user_id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setOtaOnaXabar(data.detail || "Ota-onani bog‘lab bo‘lmadi"); return; }
    setOtaOnaXabar(`✅ ${otaOna.full_name} — ${otaOnaOquvchi.full_name}ga bog‘landi.`);
    setOtaOnaNatijalar([]); setOtaOnaQidiruv("");
  };

  const sinfOch = (s) => {
    setTanlanganSinf(s);
    azolarniYukla(s.id);
    if (!s.pulli) return;
    setOquvchilarYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/sinf_tolovlari?token=${encodeURIComponent(token)}&sinf_id=${s.id}&oy=${joriyOy}`)
      .then((r) => r.json())
      .then((d) => { setOquvchilar(d.oquvchilar || []); setOquvchilarYuklanmoqda(false); })
      .catch(() => setOquvchilarYuklanmoqda(false));
  };

  const tolovBelgila = async (oquvchi) => {
    await fetch(`${API_BASE}/api/oqituvchi/tolov_belgila`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token, user_id: oquvchi.user_id, maktab_id: tanlanganSinf.maktab_id || tanlanganSinf.id,
        oy: joriyOy, tolangan_summa: tanlanganSinf.oylik_tolov,
      }),
    });
    sinfOch(tanlanganSinf);
  };

  if (tanlanganOquvchiId) {
    return <OquvchiProfili token={token} userId={tanlanganOquvchiId} onOrtga={() => setTanlanganOquvchiId(null)} />;
  }

  if (tanlanganSinf && davomatKorinishi) {
    return <DavomatBelgilash token={token} sinfId={tanlanganSinf.id} onOrtga={() => setDavomatKorinishi(false)} />;
  }

  if (tanlanganSinf) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganSinf(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Sinflarim</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganSinf.sinf}-{tanlanganSinf.harf}</h1>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>{tanlanganSinf.maktab_nomi} · {tanlanganSinf.oquvchi_soni} o'quvchi</p>
        <button onClick={() => setDavomatKorinishi(true)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          📋 Davomat belgilash
        </button>

        <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#EAF1F7" }}>
          <p className="text-xs" style={{ color: "#5A5648" }}>🔐 Qo'shilish paroli: <b>{tanlanganSinf.qoshilish_paroli}</b></p>
        </div>

        {tanlanganSinf.sinf_boshqara_oladi && (
          <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
            <SinfGuruhBoshqaruvi token={token} sinf={tanlanganSinf} onSaved={() => azolarniYukla(tanlanganSinf.id)} />
          </div>
        )}

        {!tanlanganSinf.pulli ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Bu maktab bepul — to'lov kuzatuvi kerak emas.</p>
          </div>
        ) : oquvchilarYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <>
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>💳 {joriyOy} oyi to'lovlari</p>
            <div className="space-y-2">
              {(oquvchilar || []).map((o) => (
                <div key={o.user_id} className="rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: o.qarzdor ? "#FCEBEB" : "#EAF3DE" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{o.full_name}</p>
                    <p className="text-xs" style={{ color: o.qarzdor ? "#A32D2D" : "#3B6D11" }}>
                      {o.qarzdor ? `⚠️ Qarzdor (${o.tolangan_summa.toLocaleString()} / ${o.kerakli_summa.toLocaleString()} so'm)` : "✅ To'langan"}
                    </p>
                  </div>
                  {o.qarzdor && (
                    <button onClick={() => tolovBelgila(o)} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1B4B7A" }}>
                      To'landi deb belgilash
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-sm font-semibold mb-2.5 mt-5" style={{ color: "#2B2B2B" }}>👥 Sinf a'zolari</p>
        {azolarYuklanmoqda ? (
          <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : !azolar || azolar.length === 0 ? (
          <p className="text-xs" style={{ color: "#8A8578" }}>Hali hech kim qo'shilmagan — o'quvchilar parolni kiritganda shu yerda ko'rinadi.</p>
        ) : (
          <div className="space-y-2">
            {azolar.map((a) => (
              <div key={a.azolik_id} className="rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: "#F7F5F0" }}>
                <div><button onClick={() => setTanlanganOquvchiId(a.user_id)} className="text-sm font-medium text-left" style={{ color: "#2B2B2B" }}>{a.full_name}</button><p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>{[a.jins === "ogil" ? "O‘g‘il" : a.jins === "qiz" ? "Qiz" : null, a.guruh_raqami ? `${a.guruh_raqami}-guruh` : null, a.guruh_nomi].filter(Boolean).join(" · ") || "Guruh belgilanmagan"}</p></div>
                <div className="flex gap-1.5"><button onClick={() => { setOtaOnaOquvchi(a); setOtaOnaQidiruv(""); setOtaOnaNatijalar([]); setOtaOnaXabar(""); }} className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>Ota-ona bog‘lash</button><button onClick={() => azoniChiqar(a.azolik_id, tanlanganSinf.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: "#fff", color: "#A32D2D", border: "1px solid #E5E1D8" }}>✕ Chiqarish</button></div>
              </div>
            ))}
          </div>
        )}
        {otaOnaOquvchi && <div className="rounded-2xl p-4 mt-4 border" style={{ backgroundColor: "#fff", borderColor: "#B9CCDC" }}><div className="flex items-center justify-between gap-2 mb-2"><p className="text-sm font-bold">{otaOnaOquvchi.full_name} uchun ota-ona</p><button onClick={() => setOtaOnaOquvchi(null)} className="text-xs">✕</button></div><div className="flex gap-2"><input value={otaOnaQidiruv} onChange={(e) => setOtaOnaQidiruv(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") otaOnaQidir(); }} placeholder="Ota-ona F.I.Sh..." className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /><button onClick={otaOnaQidir} className="px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "#1B4B7A" }}>Qidirish</button></div>{otaOnaNatijalar.map((otaOna) => <button key={otaOna.user_id} onClick={() => otaOnaBogla(otaOna)} className="w-full text-left mt-2 px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: "#F7F5F0" }}>{otaOna.full_name}<span className="float-right text-xs" style={{ color: "#1B4B7A" }}>Bog‘lash</span></button>)}{otaOnaXabar && <p className="text-xs mt-2" style={{ color: otaOnaXabar.startsWith("✅") ? "#3B6D11" : "#B0553A" }}>{otaOnaXabar}</p>}</div>}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🏫 Maktab sinflari</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Barcha xodim sinflarni ko‘radi; faqat vakolati bor xodim sinf ichini boshqaradi.</p>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : sinflar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm mb-1" style={{ color: "#2B2B2B" }}>Maktab sinflari topilmadi</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Hisobingiz avval maktab xodimi sifatida bog‘lanishi kerak.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sinflar.map((s) => (
            <button key={s.id} onClick={() => { if (s.batafsil_ochadi) sinfOch(s); }} disabled={!s.batafsil_ochadi}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8", opacity: s.batafsil_ochadi ? 1 : 0.82 }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{s.maktab_nomi} · {s.oquvchi_soni} o'quvchi{s.pulli ? " · 💳 pulli" : ""}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>{s.smena || 1}-smena{s.xona ? ` · ${s.xona}-xona` : ""} · {s.rahbar_ismi || "rahbarsiz"}{s.dars_beradi ? " · siz dars berasiz" : ""}</p>
              </div>
              {s.batafsil_ochadi ? <ChevronRight size={16} style={{ color: "#8A8578" }} /> : <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#F7F5F0", color: "#8A8578" }}>Ko‘rish</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MaktabBoshqaruvi({ token, maktabId, onOrtga }) {
  const [malumot, setMalumot] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [tanlanganSinf, setTanlanganSinf] = useState(null);
  const [azolar, setAzolar] = useState(null);
  const [oquvchilar, setOquvchilar] = useState(null);
  const [ichkiYuklanmoqda, setIchkiYuklanmoqda] = useState(false);
  const [davomatKorinishi, setDavomatKorinishi] = useState(false);
  const [tepaKorinish, setTepaKorinish] = useState("sinflar"); // "sinflar" | "oqituvchilar" | "reyting"
  const [tanlanganOquvchiId, setTanlanganOquvchiId] = useState(null);
  const [xodimDavomatKorinishi, setXodimDavomatKorinishi] = useState(false);
  const joriyOy = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!maktabId) { setYuklanmoqda(false); return; }
    fetch(`${API_BASE}/api/maktab/dashboard?token=${encodeURIComponent(token)}&maktab_id=${maktabId}`)
      .then((r) => r.json())
      .then((d) => { if (!d.detail) setMalumot(d); else setXato(d.detail); setYuklanmoqda(false); })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token, maktabId]);

  const sinfOch = (s) => {
    setTanlanganSinf(s);
    setIchkiYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/sinf_azolari?token=${encodeURIComponent(token)}&sinf_id=${s.id}`)
      .then((r) => r.json())
      .then((d) => setAzolar(d.azolar || []))
      .catch(() => {});
    if (malumot.pulli) {
      fetch(`${API_BASE}/api/oqituvchi/sinf_tolovlari?token=${encodeURIComponent(token)}&sinf_id=${s.id}&oy=${joriyOy}`)
        .then((r) => r.json())
        .then((d) => { setOquvchilar(d.oquvchilar || []); setIchkiYuklanmoqda(false); })
        .catch(() => setIchkiYuklanmoqda(false));
    } else {
      setIchkiYuklanmoqda(false);
    }
  };

  const tolovBelgila = async (o) => {
    await fetch(`${API_BASE}/api/oqituvchi/tolov_belgila`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, user_id: o.user_id, maktab_id: maktabId, oy: joriyOy, tolangan_summa: malumot.oylik_tolov }),
    });
    sinfOch(tanlanganSinf);
  };

  if (!maktabId) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Siz hech qanday maktabga bog'lanmagansiz.</p>
        </div>
      </div>
    );
  }

  if (tanlanganOquvchiId) {
    return <OquvchiProfili token={token} userId={tanlanganOquvchiId} onOrtga={() => setTanlanganOquvchiId(null)} />;
  }

  if (xodimDavomatKorinishi) {
    return <XodimDavomatBelgilash token={token} maktabId={maktabId} onOrtga={() => setXodimDavomatKorinishi(false)} />;
  }

  if (tanlanganSinf && davomatKorinishi) {
    return <DavomatBelgilash token={token} sinfId={tanlanganSinf.id} onOrtga={() => setDavomatKorinishi(false)} />;
  }

  if (tanlanganSinf) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganSinf(null); setAzolar(null); setOquvchilar(null); }} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Sinflar</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganSinf.sinf}-{tanlanganSinf.harf}</h1>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>{tanlanganSinf.rahbar_ismi || "Rahbar belgilanmagan"} · {tanlanganSinf.oquvchi_soni} o'quvchi</p>
        <button onClick={() => setDavomatKorinishi(true)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mb-5" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          📋 Davomat belgilash
        </button>

        {ichkiYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <>
            {malumot.pulli && (
              <>
                <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>💳 {joriyOy} oyi to'lovlari</p>
                <div className="space-y-2 mb-5">
                  {(oquvchilar || []).map((o) => (
                    <div key={o.user_id} className="rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: o.qarzdor ? "#FCEBEB" : "#EAF3DE" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{o.full_name}</p>
                        <p className="text-xs" style={{ color: o.qarzdor ? "#A32D2D" : "#3B6D11" }}>
                          {o.qarzdor ? `⚠️ Qarzdor (${o.tolangan_summa.toLocaleString()} / ${o.kerakli_summa.toLocaleString()} so'm)` : "✅ To'langan"}
                        </p>
                      </div>
                      {o.qarzdor && (
                        <button onClick={() => tolovBelgila(o)} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1B4B7A" }}>
                          To'landi
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>👥 Sinf a'zolari</p>
            <div className="space-y-2">
              {(azolar || []).map((a) => (
                <button key={a.azolik_id} onClick={() => setTanlanganOquvchiId(a.user_id)}
                  className="w-full text-left rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: "#F7F5F0" }}>
                  <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{a.full_name}</p>
                  <ChevronRight size={16} style={{ color: "#8A8578" }} />
                </button>
              ))}
              {(azolar || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hali hech kim qo'shilmagan.</p>}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : xato ? (
        <p className="text-sm" style={{ color: "#B0553A" }}>{xato}</p>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🏫 {malumot.maktab_nomi}</h1>
          <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Butun maktab — bir ekranda.</p>

          {malumot.bugungi_davomat && (
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FFFDF7", border: "1px solid #F5DFA3" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#8A5A1C" }}>📋 Bugungi davomat</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#2B2B2B" }}>{malumot.bugungi_davomat.jami_oquvchi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>jami o'quvchi</p>
                </div>
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{malumot.bugungi_davomat.kelgan}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>keldi</p>
                </div>
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#A32D2D" }}>{malumot.bugungi_davomat.sinflar_belgilamagan}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>sinf hali belgilamagan</p>
                </div>
              </div>
            </div>
          )}

          {malumot.xodim_bugungi_davomat && (
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#F3F0FF", border: "1px solid #D8CCF5" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "#5A3D9E" }}>🧑‍🏫 Bugungi xodim davomati</p>
                <button onClick={() => setXodimDavomatKorinishi(true)} className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: "#5A3D9E" }}>
                  Belgilash
                </button>
              </div>
              <p className="text-sm" style={{ color: "#2B2B2B" }}>
                {malumot.xodim_bugungi_davomat.keldi} / {malumot.xodim_bugungi_davomat.jami} xodim keldi
              </p>
            </div>
          )}

          {malumot.tolov_xulosasi && (
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#EAF1F7" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#1B4B7A" }}>💳 {joriyOy} — umumiy to'lov holati</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#2B2B2B" }}>{malumot.tolov_xulosasi.jami_oquvchi}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>jami o'quvchi</p>
                </div>
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>{malumot.tolov_xulosasi.tolagan}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>to'lagan</p>
                </div>
                <div className="rounded-xl p-2.5 text-center bg-white">
                  <p className="text-lg font-bold" style={{ color: "#A32D2D" }}>{malumot.tolov_xulosasi.qarzdor}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>qarzdor</p>
                </div>
              </div>
            </div>
          )}

          {(malumot.reyting?.eng_yaxshi_sinf || malumot.reyting?.etibor_kerak_sinf) && (
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {malumot.reyting.eng_yaxshi_sinf && (
                <div className="rounded-2xl p-3.5" style={{ backgroundColor: "#EAF3DE" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#3B6D11" }}>🏆 Eng yaxshi sinf</p>
                  <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{malumot.reyting.eng_yaxshi_sinf.sinf}-{malumot.reyting.eng_yaxshi_sinf.harf}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{malumot.reyting.eng_yaxshi_sinf.ortacha_bilim}% bilim</p>
                </div>
              )}
              {malumot.reyting.etibor_kerak_sinf && (
                <div className="rounded-2xl p-3.5" style={{ backgroundColor: "#FDF3E0" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#8A5A1C" }}>💪 E'tibor kerak</p>
                  <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{malumot.reyting.etibor_kerak_sinf.sinf}-{malumot.reyting.etibor_kerak_sinf.harf}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{malumot.reyting.etibor_kerak_sinf.ortacha_bilim}% bilim</p>
                </div>
              )}
            </div>
          )}

          {malumot.muammoli_oquvchilar && malumot.muammoli_oquvchilar.length > 0 && (
            <div className="rounded-2xl p-4 mb-4 border" style={{ backgroundColor: "#FCEBEB", borderColor: "#E8A0A0" }}>
              <p className="text-sm font-bold mb-1" style={{ color: "#A32D2D" }}>⚠️ Muammoli o'quvchilar</p>
              <p className="text-xs mb-3" style={{ color: "#8A5A5A" }}>Oxirgi 7 kunda 2+ marta kelmagan</p>
              <div className="space-y-1.5">
                {malumot.muammoli_oquvchilar.map((o) => (
                  <button key={o.user_id} onClick={() => setTanlanganOquvchiId(o.user_id)}
                    className="w-full flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-sm" style={{ color: "#2B2B2B" }}>{o.full_name}</span>
                    <span className="text-xs" style={{ color: "#8A8578" }}>{o.sinf}-{o.harf} · {o.songi_hafta_kelmagan} kun</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-2.5">
            <button onClick={() => setTepaKorinish("sinflar")}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={tepaKorinish === "sinflar" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              📚 Sinflar
            </button>
            <button onClick={() => setTepaKorinish("oqituvchilar")}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={tepaKorinish === "oqituvchilar" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              👩‍🏫 O'qituvchilar
            </button>
            <button onClick={() => setTepaKorinish("reyting")}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={tepaKorinish === "reyting" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              🏆 Reyting
            </button>
          </div>

          {tepaKorinish === "reyting" && (
            <>
              <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>🏆 Sinflar reytingi (bilim bo'yicha)</p>
              <div className="space-y-2">
                {[...malumot.sinflar].filter((s) => s.ortacha_bilim !== null).sort((a, b) => b.ortacha_bilim - a.ortacha_bilim).map((s, i) => (
                  <button key={s.id} onClick={() => sinfOch(s)}
                    className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center gap-3" style={{ borderColor: "#E5E1D8" }}>
                    <span className="text-sm font-bold w-6 text-center shrink-0" style={{ color: i === 0 ? "#C89B3C" : "#8A8578" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                      <p className="text-xs" style={{ color: "#8A8578" }}>{s.rahbar_ismi || "Rahbar yo'q"} · {s.oquvchi_soni} o'quvchi</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#1B4B7A" }}>{s.ortacha_bilim}%</span>
                  </button>
                ))}
                {malumot.sinflar.filter((s) => s.ortacha_bilim !== null).length === 0 && (
                  <p className="text-xs" style={{ color: "#8A8578" }}>Hali hech bir sinfda test yechilmagan — reyting uchun ma'lumot yo'q.</p>
                )}
              </div>
            </>
          )}

          {tepaKorinish === "sinflar" ? (
            <>
              <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>📚 Sinflar ({malumot.sinflar.length})</p>
              <div className="space-y-2">
                {malumot.sinflar.map((s) => (
                  <button key={s.id} onClick={() => sinfOch(s)}
                    className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                      <p className="text-xs" style={{ color: "#8A8578" }}>
                        {s.rahbar_ismi || "Rahbar yo'q"} · {s.oquvchi_soni} o'quvchi
                        {malumot.pulli ? ` · ${s.tolagan_soni}/${s.oquvchi_soni} to'lagan` : ""}
                        {s.ortacha_bilim !== null ? ` · ${s.ortacha_bilim}% bilim` : ""}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "#8A8578" }} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>👩‍🏫 Sinf rahbarlari ({malumot.sinflar.filter((s) => s.rahbar_ismi).length})</p>
              <p className="text-xs mb-2.5" style={{ color: "#8A8578" }}>
                Davomatni oxirgi 7 kunda necha kun belgilagani — intizom ko'rsatkichi sifatida.
              </p>
              <div className="space-y-2">
                {[...malumot.sinflar].filter((s) => s.rahbar_ismi).sort((a, b) => b.davomat_kun_7 - a.davomat_kun_7).map((s) => {
                  const rang = s.davomat_kun_7 >= 5 ? "#3B6D11" : s.davomat_kun_7 >= 3 ? "#8A5A1C" : "#A32D2D";
                  const fon = s.davomat_kun_7 >= 5 ? "#EAF3DE" : s.davomat_kun_7 >= 3 ? "#FDF3E0" : "#FCEBEB";
                  return (
                    <button key={s.id} onClick={() => sinfOch(s)}
                      className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.rahbar_ismi}</p>
                        <p className="text-xs" style={{ color: "#8A8578" }}>
                          {s.sinf}-{s.harf} sinf rahbari · {s.oquvchi_soni} o'quvchi
                          {s.ortacha_bilim !== null ? ` · ${s.ortacha_bilim}% bilim` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-2" style={{ backgroundColor: fon, color: rang }}>
                        {s.davomat_kun_7}/7 kun
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function MarkazBoshqaruvi({ token, markazId, onOrtga }) {
  const [guruhlar, setGuruhlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [tanlanganGuruh, setTanlanganGuruh] = useState(null);
  const [oquvchilar, setOquvchilar] = useState(null);
  const [oquvchilarYuklanmoqda, setOquvchilarYuklanmoqda] = useState(false);
  const joriyOy = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!markazId) { setYuklanmoqda(false); return; }
    fetch(`${API_BASE}/api/markaz/dashboard?token=${encodeURIComponent(token)}&markaz_id=${markazId}`)
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d.guruhlar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token, markazId]);

  const guruhOch = (g) => {
    setTanlanganGuruh(g);
    if (!g.oylik_summa) return;
    setOquvchilarYuklanmoqda(true);
    fetch(`${API_BASE}/api/markaz/guruh_tolovlari?token=${encodeURIComponent(token)}&togarak_id=${g.id}&oy=${joriyOy}`)
      .then((r) => r.json())
      .then((d) => { setOquvchilar(d.oquvchilar || []); setOquvchilarYuklanmoqda(false); })
      .catch(() => setOquvchilarYuklanmoqda(false));
  };

  const tolovBelgila = async (o) => {
    await fetch(`${API_BASE}/api/markaz/tolov_belgila`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, user_id: o.user_id, togarak_id: tanlanganGuruh.id, oy: joriyOy, tolangan_summa: tanlanganGuruh.oylik_summa }),
    });
    guruhOch(tanlanganGuruh);
  };

  if (!markazId) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Siz hech qanday markazga bog'lanmagansiz.</p>
        </div>
      </div>
    );
  }

  if (tanlanganGuruh) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganGuruh(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruhlar</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganGuruh.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganGuruh.fan} · {tanlanganGuruh.oqituvchi_ismi} · {tanlanganGuruh.azo_soni} a'zo</p>

        {!tanlanganGuruh.oylik_summa ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Bu guruh uchun oylik to'lov summasi belgilanmagan.</p>
          </div>
        ) : oquvchilarYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <>
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>💳 {joriyOy} oyi to'lovlari</p>
            <div className="space-y-2">
              {(oquvchilar || []).map((o) => (
                <div key={o.user_id} className="rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: o.qarzdor ? "#FCEBEB" : "#EAF3DE" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{o.full_name}</p>
                    <p className="text-xs" style={{ color: o.qarzdor ? "#A32D2D" : "#3B6D11" }}>
                      {o.qarzdor ? `⚠️ Qarzdor (${o.tolangan_summa.toLocaleString()} / ${o.kerakli_summa.toLocaleString()} so'm)` : "✅ To'langan"}
                    </p>
                  </div>
                  {o.qarzdor && (
                    <button onClick={() => tolovBelgila(o)} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1B4B7A" }}>
                      To'landi deb belgilash
                    </button>
                  )}
                </div>
              ))}
              {(oquvchilar || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Bu guruhda hali tasdiqlangan a'zo yo'q.</p>}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🎓 Markaz boshqaruvi</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Markazingizga bog'langan barcha guruhlar — bitta ekranda.</p>
      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : guruhlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali markazga bog'langan guruh yo'q — fan o'qituvchilaringiz to'garak yaratganda, avtomatik shu yerga qo'shiladi.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {guruhlar.map((g) => (
            <button key={g.id} onClick={() => guruhOch(g)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{g.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>
                  {g.fan} · {g.oqituvchi_ismi || "O'qituvchi yo'q"} · {g.azo_soni} a'zo{g.oylik_summa ? ` · ${g.oylik_summa.toLocaleString()} so'm/oy` : ""}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OtaOnaQidiruvi({ token, guruhId, tanlanganOtaOna, onTanla }) {
  const [ism, setIsm] = useState("");
  const [natijalar, setNatijalar] = useState([]);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);

  useEffect(() => {
    if (ism.trim().length < 2) { setNatijalar([]); return; }
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/opa/ota_ona_qidir?ism=${encodeURIComponent(ism.trim())}&guruh_id=${guruhId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        credentials: "omit",
      })
        .then((r) => r.json())
        .then((d) => { setNatijalar(d.natijalar || []); setQidirilmoqda(false); })
        .catch(() => setQidirilmoqda(false));
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [guruhId, ism, token]);

  if (tanlanganOtaOna) {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-lg mb-2" style={{ backgroundColor: "#EAF1F7" }}>
        <span className="text-xs font-medium" style={{ color: "#1B4B7A" }}>👤 {tanlanganOtaOna.full_name}</span>
        <button onClick={() => onTanla(null)} className="text-xs font-medium" style={{ color: "#8A8578" }}>✕</button>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)}
        placeholder="Ota-onasini qidiring (ixtiyoriy)..."
        className="w-full px-3.5 py-2 rounded-lg border text-xs"
        style={{ borderColor: "#E5E1D8" }} />
      {qidirilmoqda && <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Qidirilmoqda...</p>}
      {natijalar.length > 0 && (
        <div className="mt-1 space-y-1">
          {natijalar.map((o) => (
            <button key={o.user_id} onClick={() => { onTanla(o); setIsm(""); setNatijalar([]); }}
              className="w-full flex items-center px-3 py-1.5 rounded-lg text-left" style={{ backgroundColor: "#F7F5F0" }}>
              <span className="text-xs" style={{ color: "#2B2B2B" }}>{o.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BogchaGuruhim({ token, onOrtga }) {
  const [guruhlar, setGuruhlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [tanlanganGuruh, setTanlanganGuruh] = useState(null);
  const [bolalar, setBolalar] = useState(null);
  const [bolalarYuklanmoqda, setBolalarYuklanmoqda] = useState(false);
  const [yangiBolaIsmi, setYangiBolaIsmi] = useState("");
  const [tanlanganOtaOna, setTanlanganOtaOna] = useState(null);
  const [qoshilmoqda, setQoshilmoqda] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/opa/mening_guruhlarim`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      credentials: "omit",
    })
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d.guruhlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  const bolalarniYukla = (guruhId) => {
    setBolalarYuklanmoqda(true);
    fetch(`${API_BASE}/api/opa/guruh_bolalari?guruh_id=${guruhId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      credentials: "omit",
    })
      .then((r) => r.json())
      .then((d) => { setBolalar(d.bolalar || []); setBolalarYuklanmoqda(false); })
      .catch(() => setBolalarYuklanmoqda(false));
  };

  const guruhOch = (g) => { setTanlanganGuruh(g); bolalarniYukla(g.id); };

  const bolaQosh = async () => {
    if (!yangiBolaIsmi.trim()) return;
    setQoshilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/opa/bola_qoshish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, guruh_id: tanlanganGuruh.id, bola_ismi: yangiBolaIsmi.trim(),
          ota_ona_user_id: tanlanganOtaOna ? tanlanganOtaOna.user_id : undefined,
        }),
      });
      setYangiBolaIsmi(""); setTanlanganOtaOna(null);
      bolalarniYukla(tanlanganGuruh.id);
    } finally { setQoshilmoqda(false); }
  };

  const bolaniChiqar = async (rosterId) => {
    await fetch(`${API_BASE}/api/opa/bolani_chiqar?roster_id=${rosterId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      credentials: "omit",
    });
    bolalarniYukla(tanlanganGuruh.id);
  };

  if (tanlanganGuruh) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganGuruh(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruhlarim</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganGuruh.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganGuruh.bogcha_nomi}</p>

        <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Yangi bola qo'shish</label>
          <OtaOnaQidiruvi
            token={token}
            guruhId={tanlanganGuruh.id}
            tanlanganOtaOna={tanlanganOtaOna}
            onTanla={setTanlanganOtaOna}
          />
          <div className="flex gap-2">
            <input type="text" value={yangiBolaIsmi} onChange={(e) => setYangiBolaIsmi(e.target.value)}
              placeholder="Bolaning ismi va familiyasi"
              className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
            <button onClick={bolaQosh} disabled={qoshilmoqda}
              className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: qoshilmoqda ? 0.7 : 1 }}>
              {qoshilmoqda ? "..." : "+ Qo'shish"}
            </button>
          </div>
        </div>

        {bolalarYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : !bolalar || bolalar.length === 0 ? (
          <p className="text-xs" style={{ color: "#8A8578" }}>Hali guruhda bola yo'q.</p>
        ) : (
          <>
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>👶 Guruh ro‘yxati</p>
            <div className="space-y-2">
              {bolalar.map((b) => (
                <div key={b.roster_id} className="rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: "#F7F5F0" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{b.full_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => bolaniChiqar(b.roster_id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#fff", color: "#A32D2D", border: "1px solid #E5E1D8" }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruhlarim</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>🧸 Bog'cha guruhim</h1>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : guruhlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Sizga hali guruh biriktirilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {guruhlar.map((g) => (
            <button key={g.id} onClick={() => guruhOch(g)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{g.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{g.bogcha_nomi} · {g.bola_soni} bola</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UniversitetGuruhimBilimi({ token, onOrtga }) {
  const [guruhlar, setGuruhlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [tanlanganGuruh, setTanlanganGuruh] = useState(null);
  const [bilim, setBilim] = useState(null);
  const [bilimYuklanmoqda, setBilimYuklanmoqda] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/universitet/mening_guruhlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d.guruhlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  const guruhOch = (g) => {
    setTanlanganGuruh(g);
    setBilimYuklanmoqda(true);
    fetch(`${API_BASE}/api/universitet/guruh_bilimi?token=${encodeURIComponent(token)}&guruh_id=${g.id}`)
      .then((r) => r.json())
      .then((d) => { setBilim(d); setBilimYuklanmoqda(false); })
      .catch(() => setBilimYuklanmoqda(false));
  };

  const foizRangi = (foiz) => (foiz >= 70 ? "#3B6D11" : foiz >= 40 ? "#8A5A1C" : "#A32D2D");
  const foizFoni = (foiz) => (foiz >= 70 ? "#EAF3DE" : foiz >= 40 ? "#FDF3E0" : "#FCEBEB");

  if (tanlanganGuruh) {
    // Kurslar (fan-birinchi) ma'lumotini talaba-birinchi ko'rinishga aylantiramiz —
    // har bir talaba kartochkasida BARCHA fanlari bir joyda ko'rinishi uchun.
    const talabaMap = {};
    if (bilim) {
      for (const k of bilim.kurslar) {
        for (const t of k.talabalar) {
          if (!talabaMap[t.user_id]) talabaMap[t.user_id] = { full_name: t.full_name, fanlar: [] };
          talabaMap[t.user_id].fanlar.push({ fan: k.fan, foiz: t.otilgan_foiz, ball: t.ortacha_ball });
        }
      }
    }
    const talabalarRoyxati = Object.values(talabaMap);

    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganGuruh(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruhlarim</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📊 {tanlanganGuruh.nomi} — bilim ko'rsatkichi</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Silabus mavzulari bo'yicha, har fandan alohida — GPA emas, aniq bilim darajasi.</p>

        {bilimYuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : !bilim || bilim.kurslar.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm mb-1" style={{ color: "#2B2B2B" }}>Hali bu guruhga bog'langan fan yo'q.</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>Professor to'garak (kurs) yaratganda, shu guruhni tanlashi kerak.</p>
          </div>
        ) : talabalarRoyxati.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Hali hech bir talaba fanlarga qo'shilmagan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {talabalarRoyxati.map((t, i) => {
              const ortachaFoiz = Math.round(t.fanlar.reduce((s, f) => s + f.foiz, 0) / t.fanlar.length);
              return (
                <div key={i} className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{t.full_name}</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: foizFoni(ortachaFoiz), color: foizRangi(ortachaFoiz) }}>
                      Umumiy: {ortachaFoiz}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.fanlar.map((f, j) => (
                      <span key={j} className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: foizFoni(f.foiz), color: foizRangi(f.foiz) }}>
                        {f.fan}: {f.foiz}%{f.ball !== null ? ` (o'rtacha ${f.ball} ball)` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Guruhlarim</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>🎓 Kurator bo'lgan guruhlarim</h1>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : guruhlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Sizga hali guruh biriktirilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {guruhlar.map((g) => (
            <button key={g.id} onClick={() => guruhOch(g)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{g.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{g.kurs ? `${g.kurs}-kurs` : ""}{g.yonalish ? ` · ${g.yonalish}` : ""} · {g.talaba_soni} talaba</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const AI_USTOZ_REJIMLARI = [
  { kalit: "diagnostika", nom: "Aniqlash", emoji: "🔍", boshlash: "Bu mavzu bo'yicha bilimimni aniqlang." },
  { kalit: "orgatish", nom: "O'rgatish", emoji: "💡", boshlash: "Mavzuni yoshimga mos qilib tushuntiring." },
  { kalit: "mashq", nom: "Mashq", emoji: "✍️", boshlash: "Menga mustaqil ishlash uchun bitta mashq bering." },
  { kalit: "takrorlash", nom: "Takrorlash", emoji: "🔁", boshlash: "Mavzuni xotiradan eslashim uchun savol bering." },
  { kalit: "test", nom: "Test", emoji: "✅", boshlash: "Menga bitta test savoli bering, javobni aytmang." },
  { kalit: "togarak", nom: "To'garak", emoji: "🌟", boshlash: "Menga qiziqarli va izlanishli topshiriq bering." },
];

const AI_BLOK_RANGLARI = {
  maqsad: { fon: "#EAF1F7", rang: "#1B4B7A" },
  qiziqish: { fon: "#FDF3E0", rang: "#8A5A1C" },
  tushuntirish: { fon: "#F3EEFA", rang: "#6E45A1" },
  qoida: { fon: "#EAF1F7", rang: "#1B4B7A" },
  misol: { fon: "#EAF3DE", rang: "#3B6D11" },
  savol: { fon: "#FDF3E0", rang: "#8A5A1C" },
  mashq: { fon: "#EAF3DE", rang: "#3B6D11" },
  ishora: { fon: "#FFF8D6", rang: "#7A5A00" },
  togri: { fon: "#EAF3DE", rang: "#2E6B2E" },
  xato: { fon: "#FCEBEB", rang: "#A32D2D" },
  ogohlantirish: { fon: "#FCEBEB", rang: "#A32D2D" },
  xulosa: { fon: "#EAF1F7", rang: "#1B4B7A" },
};

function AiJavobBloklari({ javob, onQuickReply }) {
  if (!javob?.bloklar?.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
          style={javob.knowledge_status === "published"
            ? { backgroundColor: "#E7F4EC", color: "#25683B" }
            : { backgroundColor: "#FFF4D8", color: "#8A5A1C" }}>
          {javob.knowledge_status === "published" ? "✓ Tasdiqlangan kitob bazasi" : "⚠ Bilim hali nashr qilinmagan"}
        </span>
        {javob.engine === "rules" && (
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
            API kalitsiz pedagogik miya
          </span>
        )}
      </div>
      {javob.bloklar.map((blok, i) => {
        const uslub = AI_BLOK_RANGLARI[blok.tur] || AI_BLOK_RANGLARI.tushuntirish;
        return (
          <div key={i} className="rounded-xl p-3.5 flex items-start gap-2.5"
            style={{ backgroundColor: uslub.fon, color: uslub.rang }}>
            <span className="text-lg shrink-0" aria-hidden="true">{blok.emoji || "💡"}</span>
            <div className="text-sm leading-relaxed min-w-0">
              <Matn matn={blok.matn} />
            </div>
          </div>
        );
      })}
      {javob.manba_kodlari?.length > 0 && (
        <p className="text-[10px] px-1" style={{ color: "#8A8578" }}>
          Baza manbasi: {javob.manba_kodlari.join(", ")}
        </p>
      )}
      {(javob.sources || []).length > 0 && (
        <div className="rounded-xl p-2.5 space-y-1" style={{ backgroundColor: "#F7F5F0" }}>
          {(javob.sources || []).slice(0, 3).map((s, i) => (
            <p key={`${s.source_code || "source"}-${s.page || i}`} className="text-[10px]" style={{ color: "#5A5648" }}>
              📚 {s.book || s.source_code || "Kitob"}{s.page ? ` · ${s.page}-bet` : ""}{s.year ? ` · ${s.year}` : ""}
            </p>
          ))}
        </div>
      )}
      {(javob.quick_replies || []).length > 0 && onQuickReply && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {javob.quick_replies.map((reply) => (
            <button key={reply} onClick={() => onQuickReply(reply)}
              className="min-w-9 px-3 py-2 rounded-xl text-xs font-bold border"
              style={{ borderColor: "#9DB8CE", backgroundColor: "#F4F8FB", color: "#1B4B7A" }}>
              {reply}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AiOquvchiUstozBolimi({ token, initialTarget = null }) {
  const [sozlama, setSozlama] = useState(null);
  const [fan, setFan] = useState("");
  const [topicCode, setTopicCode] = useState("");
  const [rejim, setRejim] = useState("orgatish");
  const [suhbatId, setSuhbatId] = useState(null);
  const [xabarlar, setXabarlar] = useState([]);
  const [matn, setMatn] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const oxiriRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams({ token });
    if (initialTarget?.grade) params.set("grade", String(initialTarget.grade));
    fetch(`${API_BASE}/api/ai/ustoz/fan_mavzular?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Fanlar yuklanmadi");
        setSozlama(d);
        if (d.fanlar?.length > 0) {
          const preferredFan = d.fanlar.find((item) => (
            String(item.fan).toLocaleUpperCase("uz") === String(initialTarget?.subject || "").toLocaleUpperCase("uz")
          )) || d.fanlar[0];
          const preferredTopic = preferredFan.mavzular?.find((item) => (
            item.topic_code === initialTarget?.topic_code || item.mavzu === initialTarget?.topic_name
          )) || preferredFan.mavzular?.[0];
          setFan(preferredFan.fan);
          setTopicCode(preferredTopic?.topic_code || "");
          setSuhbatId(null);
          setXabarlar([]);
        }
      })
      .catch((e) => setXato(e.message))
      .finally(() => setYuklanmoqda(false));
  }, [token, initialTarget?.nonce, initialTarget?.grade]);

  useEffect(() => {
    oxiriRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [xabarlar, yuborilmoqda]);

  const joriyFan = sozlama?.fanlar?.find((f) => f.fan === fan);
  const joriyMavzu = joriyFan?.mavzular?.find((m) => m.topic_code === topicCode);

  const fanOzgar = (yangiFan) => {
    const f = sozlama?.fanlar?.find((x) => x.fan === yangiFan);
    setFan(yangiFan);
    setTopicCode(f?.mavzular?.[0]?.topic_code || "");
    setSuhbatId(null);
    setXabarlar([]);
  };

  const mavzuOzgar = (kod) => {
    setTopicCode(kod);
    setSuhbatId(null);
    setXabarlar([]);
  };

  const rejimOzgar = (kalit) => {
    setRejim(kalit);
    setSuhbatId(null);
    setXabarlar([]);
  };

  const yubor = async (tayyorMatn = null) => {
    const yuboriladigan = (tayyorMatn || matn).trim();
    if (!yuboriladigan || !fan || !topicCode || yuborilmoqda) return;
    setMatn("");
    setXato("");
    setXabarlar((oldin) => [...oldin, { muallif: "oquvchi", matn: yuboriladigan }]);
    setYuborilmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/ustoz/sorash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, fan, topic_code: topicCode, grade: sozlama?.sinf || initialTarget?.grade || undefined,
          rejim, savol: yuboriladigan,
          suhbat_id: suhbatId,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "AI ustoz javob bermadi");
      setSuhbatId(d.suhbat_id);
      setXabarlar((oldin) => [...oldin, { muallif: "ai", javob: d.javob }]);
    } catch (e) {
      setXato(e.message);
      setXabarlar((oldin) => [...oldin, { muallif: "xato", matn: e.message }]);
    } finally {
      setYuborilmoqda(false);
    }
  };

  if (yuklanmoqda) {
    return <div className="py-16 text-center"><Loader2 size={26} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (sozlama?.sinf_sozlanmagan) {
    return (
      <div className="px-5 pt-6">
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="font-semibold mb-1" style={{ color: "#2B2B2B" }}>Avval sinfingizni belgilang</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>AI ustoz aynan yoshingiz va sinfingizga mos ishlashi uchun Profil bo'limida sinfni tanlang.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="rounded-2xl p-4 mb-3 text-white overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#1B4B7A,#2D6E8B)" }}>
        <div className="relative z-10">
          <p className="text-xs opacity-80">Sizning shaxsiy yordamchingiz</p>
          <h1 className="text-xl font-bold mt-0.5">🧠 AI Ustoz</h1>
          <p className="text-xs mt-1 opacity-90">
            {sozlama?.sinf}-sinf · taxminiy {sozlama?.yosh} yosh · faqat bazadagi bilimlar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <select value={fan} onChange={(e) => fanOzgar(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs bg-white" style={{ borderColor: "#E5E1D8" }}>
          {(sozlama?.fanlar || []).map((f) => <option key={f.fan} value={f.fan}>{f.fan}</option>)}
        </select>
        <select value={topicCode} onChange={(e) => mavzuOzgar(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs bg-white" style={{ borderColor: "#E5E1D8" }}>
          {(joriyFan?.mavzular || []).map((m) => <option key={m.topic_code} value={m.topic_code}>{m.mavzu}</option>)}
        </select>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
        {AI_USTOZ_REJIMLARI.map((r) => (
          <button key={r.kalit} onClick={() => rejimOzgar(r.kalit)}
            className="shrink-0 px-3 py-2 rounded-full text-xs font-semibold"
            style={rejim === r.kalit
              ? { backgroundColor: "#1B4B7A", color: "#fff" }
              : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
            {r.emoji} {r.nom}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border p-3.5 mb-3 min-h-[310px]" style={{ borderColor: "#E5E1D8" }}>
        {xabarlar.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-3" style={{ backgroundColor: "#EAF1F7" }}>🤖</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{joriyMavzu?.mavzu || "Mavzu tanlang"}</p>
            <p className="text-xs mb-4" style={{ color: "#8A8578" }}>Men javobni darhol berib qo'ymayman — o'zingiz tushunib olishingizga yordam beraman.</p>
            <button onClick={() => yubor(AI_USTOZ_REJIMLARI.find((r) => r.kalit === rejim)?.boshlash)}
              disabled={!topicCode}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
              {AI_USTOZ_REJIMLARI.find((r) => r.kalit === rejim)?.emoji} Boshlash
            </button>
          </div>
        )}

        <div className="space-y-3">
          {xabarlar.map((x, i) => (
            <div key={i}>
              {x.muallif === "oquvchi" ? (
                <div className="ml-8 rounded-2xl rounded-br-md px-3.5 py-3 text-sm text-white" style={{ backgroundColor: "#1B4B7A" }}>
                  {x.matn}
                </div>
              ) : x.muallif === "ai" ? (
                <div className="mr-4"><AiJavobBloklari javob={x.javob} onQuickReply={(reply) => yubor(reply)} /></div>
              ) : (
                <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{x.matn}</div>
              )}
            </div>
          ))}
          {yuborilmoqda && (
            <div className="flex items-center gap-2 text-xs p-3" style={{ color: "#8A8578" }}>
              <Loader2 size={15} className="animate-spin" /> Bazadagi bilimlardan javob tayyorlanmoqda…
            </div>
          )}
          <div ref={oxiriRef} />
        </div>
      </div>

      {xato && <p className="text-xs mb-2" style={{ color: "#B0553A" }}>{xato}</p>}
      <div className="flex gap-2 sticky bottom-20">
        <textarea value={matn} onChange={(e) => setMatn(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yubor(); } }}
          rows={2} placeholder="Savol yoki javobingizni yozing…"
          className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm bg-white resize-none"
          style={{ borderColor: "#E5E1D8" }} />
        <button onClick={() => yubor()} disabled={!matn.trim() || yuborilmoqda}
          className="w-12 rounded-xl text-white flex items-center justify-center"
          style={{ backgroundColor: "#1B4B7A", opacity: !matn.trim() || yuborilmoqda ? 0.5 : 1 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

const OCHIQ_DARS_METODIKALARI = [
  "Avtomatik",
  "5E (Engage–Explore–Explain–Elaborate–Evaluate)",
  "Muammoli ta'lim + I do–We do–You do",
  "PPP + kommunikativ yondashuv",
  "Loyiha asosida o'qitish",
  "Hamkorlikdagi ta'lim",
  "O'yinli va multisensor ta'lim",
];

function AiOchiqDarsKonstruktori({ token, onOrtga }) {
  const [sinf, setSinf] = useState("5");
  const [fan, setFan] = useState("Matematika");
  const [mavzu, setMavzu] = useState("");
  const [topicCode, setTopicCode] = useState("");
  const [katalog, setKatalog] = useState(null);
  const [maqsad, setMaqsad] = useState("");
  const [metodika, setMetodika] = useState("Avtomatik");
  const [jihozlar, setJihozlar] = useState("");
  const [sinfHajmi, setSinfHajmi] = useState(25);
  const [reja, setReja] = useState(null);
  const [darsId, setDarsId] = useState(null);
  const [yaratilmoqda, setYaratilmoqda] = useState(false);
  const [xato, setXato] = useState("");

  useEffect(() => {
    let bekor = false;
    fetch(`${API_BASE}/api/ai/pedagog/katalog?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(sinf)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Kitob katalogi yuklanmadi");
        if (bekor) return;
        setKatalog(d);
        if (d.fanlar?.length > 0) {
          const birinchiFan = d.fanlar[0];
          const birinchiMavzu = birinchiFan.mavzular?.[0];
          setFan(birinchiFan.fan);
          setMavzu(birinchiMavzu?.mavzu || "");
          setTopicCode(birinchiMavzu?.topic_code || "");
        } else {
          setTopicCode("");
        }
      })
      .catch(() => { if (!bekor) setKatalog({ fanlar: [] }); });
    return () => { bekor = true; };
  }, [token, sinf]);

  const joriyFan = katalog?.fanlar?.find((f) => f.fan === fan);

  const katalogFanOzgar = (yangiFan) => {
    const topilgan = katalog?.fanlar?.find((f) => f.fan === yangiFan);
    const birinchi = topilgan?.mavzular?.[0];
    setFan(yangiFan);
    setMavzu(birinchi?.mavzu || "");
    setTopicCode(birinchi?.topic_code || "");
  };

  const katalogMavzuOzgar = (kod) => {
    const topilgan = joriyFan?.mavzular?.find((m) => m.topic_code === kod);
    setTopicCode(kod);
    setMavzu(topilgan?.mavzu || "");
  };

  const yarat = async () => {
    if (!fan.trim() || !mavzu.trim() || yaratilmoqda) return;
    setYaratilmoqda(true);
    setXato("");
    setReja(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/ochiq_dars/yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, sinf, fan: fan.trim(), mavzu: mavzu.trim(),
          topic_code: topicCode || null,
          maqsad: maqsad.trim() || null,
          metodika,
          sinf_hajmi: Number(sinfHajmi) || 25,
          jihozlar: jihozlar.trim() || null,
          davomiylik_daq: 45,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Ochiq dars yaratilmadi");
      setReja(d.reja);
      setDarsId(d.dars_id);
    } catch (e) {
      setXato(e.message);
    } finally {
      setYaratilmoqda(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-5">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}>
        <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EAF1F7" }}>
          <ChevronLeft size={15} style={{ color: "#1B4B7A" }} />
        </span>
        Ortga
      </button>

      <div className="rounded-2xl p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg,#6E45A1,#8B5FBF)" }}>
        <p className="text-xs opacity-80">O'qituvchi uchun metodik konstruktor</p>
        <h1 className="text-xl font-bold mt-0.5">🪄 45 daqiqalik ochiq dars</h1>
        <p className="text-xs mt-1 opacity-90">Bazadagi bilim, misol va testlar asosida</p>
      </div>

      <div className="rounded-2xl bg-white border p-4 space-y-3 mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>Sinf</label>
            <select value={sinf} onChange={(e) => setSinf(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((s) => <option key={s} value={String(s)}>{s}-sinf</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>O'quvchi soni</label>
            <input type="number" min="1" max="60" value={sinfHajmi} onChange={(e) => setSinfHajmi(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>Fan</label>
          {katalog?.fanlar?.length > 0 ? (
            <select value={fan} onChange={(e) => katalogFanOzgar(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
              {katalog.fanlar.map((f) => <option key={f.fan} value={f.fan}>{f.fan}</option>)}
            </select>
          ) : (
            <input value={fan} onChange={(e) => setFan(e.target.value)} placeholder="Masalan: Matematika"
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          )}
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>Nashr qilingan kitob mavzusi</label>
          {joriyFan?.mavzular?.length > 0 ? (
            <select value={topicCode} onChange={(e) => katalogMavzuOzgar(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
              {joriyFan.mavzular.map((m) => <option key={m.topic_code} value={m.topic_code}>{m.mavzu}</option>)}
            </select>
          ) : (
            <>
              <input value={mavzu} onChange={(e) => setMavzu(e.target.value)} placeholder="Masalan: 9 ga bo'linish alomati"
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
              <p className="text-[10px] mt-1" style={{ color: "#A16B22" }}>
                Bu sinfda nashr qilingan Kitob miyasi topilmadi; admin avval import va nashr qilishi kerak.
              </p>
            </>
          )}
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>O'quv maqsadi</label>
          <textarea value={maqsad} onChange={(e) => setMaqsad(e.target.value)} rows={2}
            placeholder="Bo'sh qoldirilsa, AI bazadagi mavzuga qarab o'lchanadigan maqsad tuzadi."
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none" style={{ borderColor: "#E5E1D8" }} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>Metodika</label>
          <select value={metodika} onChange={(e) => setMetodika(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
            {OCHIQ_DARS_METODIKALARI.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "#5A5648" }}>Mavjud jihozlar</label>
          <input value={jihozlar} onChange={(e) => setJihozlar(e.target.value)}
            placeholder="Doska, proyektor, kartochka, laboratoriya jihozi…"
            className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
        </div>
        <button onClick={yarat} disabled={yaratilmoqda || !fan.trim() || !mavzu.trim()}
          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#8B5FBF", opacity: yaratilmoqda || !fan.trim() || !mavzu.trim() ? 0.5 : 1 }}>
          {yaratilmoqda ? <><Loader2 size={17} className="animate-spin" /> Metodik reja tuzilmoqda…</> : <>🪄 Ochiq darsni yaratish</>}
        </button>
      </div>

      {xato && (
        <div className="rounded-xl p-3.5 mb-4 text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
          {xato}
        </div>
      )}

      {reja && (
        <div id="ochiq-dars-reja" className="space-y-3">
          <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-xs mb-1" style={{ color: "#8A8578" }}>Ochiq dars #{darsId}</p>
                <h2 className="text-lg font-bold" style={{ color: "#2B2B2B" }}>{reja.sarlavha || reja.mavzu}</h2>
                <p className="text-xs mt-1" style={{ color: "#5A5648" }}>{reja.sinf}-sinf · {reja.fan} · {reja.jami_daqiqa} daqiqa</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#E7F4EC", color: "#25683B" }}>
                    ✓ Tasdiqlangan kitob bazasi
                  </span>
                  {reja.engine === "rules" && (
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                      API kalitsiz
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => window.print()} className="h-9 px-3 rounded-xl text-xs font-semibold"
                style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>🖨 Chop etish</button>
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: "#2B2B2B" }}>🎯 O'quv maqsadlari</h3>
            <ul className="space-y-1.5">
              {(reja.oquv_maqsadlari || []).map((m, i) => <li key={i} className="text-sm flex gap-2"><span>•</span><span>{m}</span></li>)}
            </ul>
            {(reja.metodikalar || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {reja.metodikalar.map((m, i) => <span key={i} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F3EEFA", color: "#6E45A1" }}>{m}</span>)}
              </div>
            )}
          </div>

          {(reja.bosqichlar || []).map((b, i) => (
            <div key={i} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "#E5E1D8" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: i % 2 === 0 ? "#EAF1F7" : "#F3EEFA" }}>
                <h3 className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{b.emoji} {b.tartib}. {b.nomi}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white" style={{ color: "#1B4B7A" }}>{b.daqiqa} daqiqa</span>
              </div>
              <div className="p-4 grid gap-3">
                <div><p className="text-[11px] font-bold mb-1" style={{ color: "#1B4B7A" }}>O'QITUVCHI HARAKATI</p><p className="text-sm whitespace-pre-line">{b.oqituvchi_harakati}</p></div>
                <div><p className="text-[11px] font-bold mb-1" style={{ color: "#3B6D11" }}>O'QUVCHI HARAKATI</p><p className="text-sm whitespace-pre-line">{b.oquvchi_harakati}</p></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: "#F7F5F0" }}><b>Metod:</b><br />{b.metod}</div>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: "#F7F5F0" }}><b>Baholash:</b><br />{b.baholash}</div>
                </div>
              </div>
            </div>
          ))}

          {reja.differensial_yondashuv && (
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <h3 className="text-sm font-bold mb-3">🧩 Differensial yondashuv</h3>
              <p className="text-sm mb-2"><b>Qo'llab-quvvatlash:</b> {reja.differensial_yondashuv.qollab_quvvatlash}</p>
              <p className="text-sm mb-2"><b>Kuchli o'quvchi:</b> {reja.differensial_yondashuv.kuchli_oquvchi}</p>
              <p className="text-sm"><b>Inklyuziv moslashuv:</b> {reja.differensial_yondashuv.inklyuziv_moslashuv}</p>
            </div>
          )}

          <div className="rounded-2xl p-4" style={{ backgroundColor: "#EAF3DE", color: "#2E5A24" }}>
            <p className="text-sm"><b>🏠 Uy vazifasi:</b> {reja.uy_vazifasi}</p>
            <p className="text-sm mt-2"><b>🏁 Refleksiya:</b> {reja.refleksiya}</p>
          </div>
          {(reja.sources || []).length > 0 && (
            <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <h3 className="text-sm font-bold mb-2">📚 Foydalanilgan manbalar</h3>
              {(reja.sources || []).map((s, i) => (
                <p key={`${s.source_code || "source"}-${s.page || i}`} className="text-xs py-1" style={{ color: "#5A5648" }}>
                  {s.book || s.source_code || "Kitob"}{s.page ? ` · ${s.page}-bet` : ""}{s.year ? ` · ${s.year}` : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AiTogarakRejaKonstruktori({ token, onOrtga }) {
  const [sinf, setSinf] = useState("5");
  const [katalog, setKatalog] = useState(null);
  const [fan, setFan] = useState("");
  const [topicCode, setTopicCode] = useState("");
  const [yonalish, setYonalish] = useState("Qiziqarli fan to'garagi");
  const [mashgulotSoni, setMashgulotSoni] = useState(12);
  const [reja, setReja] = useState(null);
  const [rejaId, setRejaId] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/ai/pedagog/katalog?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(sinf)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Katalog yuklanmadi");
        setKatalog(d);
        const f = d.fanlar?.[0];
        setFan(f?.fan || "");
        setTopicCode(f?.mavzular?.[0]?.topic_code || "");
      })
      .catch((e) => { setKatalog({ fanlar: [] }); setXato(e.message); });
  }, [token, sinf]);

  const joriyFan = katalog?.fanlar?.find((f) => f.fan === fan);
  const fanOzgar = (value) => {
    const f = katalog?.fanlar?.find((x) => x.fan === value);
    setFan(value);
    setTopicCode(f?.mavzular?.[0]?.topic_code || "");
  };

  const yarat = async () => {
    if (!fan || !topicCode || yuklanmoqda) return;
    setYuklanmoqda(true);
    setXato("");
    setReja(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/togarak/yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sinf,
          fan,
          yonalish: yonalish.trim() || "Fan to'garagi",
          topic_codes: [topicCode],
          mashgulot_soni: Number(mashgulotSoni) || 12,
          davomiylik_daq: 45,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "To'garak rejasi yaratilmadi");
      setReja(d.reja);
      setRejaId(d.reja_id);
    } catch (e) {
      setXato(e.message);
    } finally {
      setYuklanmoqda(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-5">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}>
        <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EAF1F7" }}>
          <ChevronLeft size={15} style={{ color: "#1B4B7A" }} />
        </span>
        Ortga
      </button>

      <div className="rounded-2xl p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg,#246D6D,#2D8B8B)" }}>
        <p className="text-xs opacity-80">Nashr qilingan kitob miyasi asosida</p>
        <h1 className="text-xl font-bold mt-0.5">🧭 AI To'garak konstruktori</h1>
        <p className="text-xs mt-1 opacity-90">1–48 ta 45 daqiqalik mashg'ulot rejasini API kalitsiz tuzadi</p>
      </div>

      <div className="rounded-2xl bg-white border p-4 space-y-3" style={{ borderColor: "#E5E1D8" }}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium block mb-1">Sinf</label>
            <select value={sinf} onChange={(e) => setSinf(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((s) => <option key={s} value={String(s)}>{s}-sinf</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Mashg'ulot soni</label>
            <input type="number" min="1" max="48" value={mashgulotSoni} onChange={(e) => setMashgulotSoni(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Yo'nalish nomi</label>
          <input value={yonalish} onChange={(e) => setYonalish(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Fan</label>
          <select value={fan} onChange={(e) => fanOzgar(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
            {(katalog?.fanlar || []).map((f) => <option key={f.fan} value={f.fan}>{f.fan}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Boshlang'ich mavzu</label>
          <select value={topicCode} onChange={(e) => setTopicCode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
            {(joriyFan?.mavzular || []).map((m) => <option key={m.topic_code} value={m.topic_code}>{m.mavzu}</option>)}
          </select>
          {!topicCode && <p className="text-[10px] mt-1" style={{ color: "#A16B22" }}>Bu sinfda nashr qilingan kitob mavzusi yo'q.</p>}
        </div>
        <button onClick={yarat} disabled={!topicCode || yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#2D8B8B", opacity: !topicCode || yuklanmoqda ? .5 : 1 }}>
          {yuklanmoqda ? <><Loader2 size={17} className="animate-spin" /> Reja tuzilmoqda…</> : "🧭 To'garak rejasini yaratish"}
        </button>
      </div>

      {xato && <div className="rounded-xl p-3.5 mt-3 text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{xato}</div>}

      {reja && (
        <div className="space-y-3 mt-4">
          <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-[10px]" style={{ color: "#8A8578" }}>To'garak rejasi #{rejaId}</p>
            <h2 className="font-bold mt-1">{reja.sarlavha}</h2>
            <div className="flex gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#E7F4EC", color: "#25683B" }}>✓ Tasdiqlangan baza</span>
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>API kalitsiz</span>
            </div>
          </div>
          {(reja.mashgulotlar || []).map((m) => (
            <div key={m.tartib} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "#E5E1D8" }}>
              <div className="px-4 py-3" style={{ backgroundColor: "#EEF7F5" }}>
                <p className="text-[10px] font-bold" style={{ color: "#246D6D" }}>{m.tartib}-MASHG'ULOT · {reja.davomiylik_daq} DAQIQA</p>
                <h3 className="font-bold text-sm mt-0.5">{m.mavzu}</h3>
                <p className="text-xs mt-1" style={{ color: "#5A5648" }}>{m.maqsad}</p>
              </div>
              <div className="p-4 space-y-2">
                {(m.bosqichlar || []).map((b) => (
                  <div key={b.tartib} className="flex gap-3 text-xs">
                    <span className="font-bold w-14 shrink-0" style={{ color: "#1B4B7A" }}>{b.daqiqa} daq</span>
                    <span><b>{b.nomi}:</b> {b.faoliyat}</span>
                  </div>
                ))}
                {m.mustaqil_vazifa && <p className="text-xs rounded-xl p-2.5 mt-2" style={{ backgroundColor: "#F7F5F0" }}><b>Mustaqil vazifa:</b> {m.mustaqil_vazifa}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AiYordamchiBolimi({ token, onOrtga }) {
  const [suhbat, setSuhbat] = useState([]); // [{savol, javob, xato}]
  const [savol, setSavol] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const oxiriRef = useRef(null);

  useEffect(() => {
    oxiriRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [suhbat]);

  const yubor = async () => {
    if (!savol.trim() || yuborilmoqda) return;
    const soralganSavol = savol.trim();
    setSavol("");
    setSuhbat((prev) => [...prev, { savol: soralganSavol, javob: null, xato: null }]);
    setYuborilmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/sorash`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, savol: soralganSavol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSuhbat((prev) => prev.map((s, i) => (i === prev.length - 1 ? { ...s, javob: data.javob } : s)));
    } catch (e) {
      setSuhbat((prev) => prev.map((s, i) => (i === prev.length - 1 ? { ...s, xato: e.message } : s)));
    } finally {
      setYuborilmoqda(false);
    }
  };

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col" style={{ minHeight: "80vh" }}>
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🤖 AI Yordamchi</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Masalan: "2-A sinfning bugungi davomati qanday?" yoki "Farzandim qaysi fandan orqada qolmoqda?"</p>

      <div className="flex-1 space-y-3 mb-4">
        {suhbat.length === 0 && (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Savolingizni pastdan yozing.</p>
          </div>
        )}
        {suhbat.map((s, i) => (
          <div key={i}>
            <div className="rounded-2xl rounded-br-md p-3.5 mb-2 ml-8" style={{ backgroundColor: "#1B4B7A" }}>
              <p className="text-sm text-white">{s.savol}</p>
            </div>
            <div className="rounded-2xl rounded-bl-md p-3.5 mr-8 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              {s.xato ? (
                <p className="text-sm" style={{ color: "#B0553A" }}>{s.xato}</p>
              ) : s.javob ? (
                <p className="text-sm whitespace-pre-line" style={{ color: "#2B2B2B" }}>{s.javob}</p>
              ) : (
                <Loader2 size={16} className="animate-spin" style={{ color: "#1B4B7A" }} />
              )}
            </div>
          </div>
        ))}
        <div ref={oxiriRef} />
      </div>

      <div className="flex gap-2 sticky bottom-4">
        <input type="text" value={savol} onChange={(e) => setSavol(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") yubor(); }}
          placeholder="Savolingizni yozing..."
          className="flex-1 px-3.5 py-3 rounded-xl border text-sm bg-white" style={{ borderColor: "#E5E1D8" }} />
        <button onClick={yubor} disabled={yuborilmoqda || !savol.trim()}
          className="px-5 py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: yuborilmoqda || !savol.trim() ? 0.5 : 1 }}>
          →
        </button>
      </div>
    </div>
  );
}

function PsixologQidiruv({ token, maktabId, onOrtga }) {
  const [tanlanganOquvchi, setTanlanganOquvchi] = useState(null);

  if (tanlanganOquvchi) {
    return <OquvchiProfili token={token} userId={tanlanganOquvchi.user_id} onOrtga={() => setTanlanganOquvchi(null)} />;
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🧠 Psixolog</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>O'quvchini qidirib, uning kuzatuv yozuvlarini ko'ring yoki yangi qo'shing.</p>
      <MaktabOdamQidiruvi token={token} maktabId={maktabId} tanlanganOdam={null} onTanla={setTanlanganOquvchi} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TOPIK MAVZU REJASI — o'qituvchi BIR MARTA yaratadigan, tartibli
// mavzular ketma-ketligi, keyin bir nechta to'garakda qayta
// ishlatiladigan "dastur".
// ═══════════════════════════════════════════════════════════
function RejaDetali({ token, rejaId, onOrtga }) {
  const [reja, setReja] = useState(null);
  const [qatorlar, setQatorlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  const [qidiruvOchiq, setQidiruvOchiq] = useState(false);
  const [qidiruv, setQidiruv] = useState("");
  const [qidiruvNatijalari, setQidiruvNatijalari] = useState(null);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);
  const [qidiruvXato, setQidiruvXato] = useState("");

  const [yangiMavzuOchiq, setYangiMavzuOchiq] = useState(false);
  const [yangiMavzuNomi, setYangiMavzuNomi] = useState("");
  const [yangiMavzuBob, setYangiMavzuBob] = useState("");
  const [yangiMavzuYaratilmoqda, setYangiMavzuYaratilmoqda] = useState(false);
  const [kopMavzuRejimi, setKopMavzuRejimi] = useState(false);
  const [kopMavzuMatni, setKopMavzuMatni] = useState("");
  const [kopMavzuYaratilmoqda, setKopMavzuYaratilmoqda] = useState(false);
  const [kopMavzuProgress, setKopMavzuProgress] = useState("");

  const yukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/reja_korish?token=${encodeURIComponent(token)}&reja_id=${rejaId}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setReja(d.reja); setQatorlar(d.qatorlar || []); setXato(""); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };
  useEffect(yukla, [token, rejaId]);

  useEffect(() => {
    if (!qidiruvOchiq) return;
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/oqituvchi/reja_mavzu_qidir?token=${encodeURIComponent(token)}&reja_id=${rejaId}${qidiruv.trim() ? `&qidiruv=${encodeURIComponent(qidiruv.trim())}` : ""}`)
        .then(async (r) => {
          const d = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
          return d;
        })
        .then((d) => { setQidiruvNatijalari(d.mavzular || []); setQidiruvXato(""); setQidirilmoqda(false); })
        .catch((e) => { setQidiruvXato(e.message || "Yuklab bo'lmadi"); setQidirilmoqda(false); });
    }, 350);
    return () => clearTimeout(kechiktirish);
  }, [qidiruv, qidiruvOchiq, token, rejaId]);

  const [belgilanganKodlar, setBelgilanganKodlar] = useState({}); // {topic_code: true}
  const kodBelgila = (topicCode) => {
    setBelgilanganKodlar((prev) => ({ ...prev, [topicCode]: !prev[topicCode] }));
  };

  const [tanlanganlarniQoshishYuklanmoqda, setTanlanganlarniQoshishYuklanmoqda] = useState(false);
  const tanlanganlarniQoshish = async () => {
    const kodlar = Object.keys(belgilanganKodlar).filter((k) => belgilanganKodlar[k]);
    if (kodlar.length === 0) return;
    setTanlanganlarniQoshishYuklanmoqda(true);
    try {
      for (const kod of kodlar) {
        // eslint-disable-next-line no-await-in-loop
        await fetch(`${API_BASE}/api/oqituvchi/reja_mavzu_qosh`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, reja_id: rejaId, topic_code: kod }),
        });
      }
      setBelgilanganKodlar({});
      yukla();
    } finally { setTanlanganlarniQoshishYuklanmoqda(false); }
  };

  const yangiMavzuYarat = async () => {
    if (!yangiMavzuNomi.trim()) { setXato("Mavzu nomini kiriting"); return; }
    setYangiMavzuYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/reja_yangi_mavzu_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reja_id: rejaId, nomi: yangiMavzuNomi.trim(), bob: yangiMavzuBob.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setYangiMavzuNomi(""); setYangiMavzuBob(""); setYangiMavzuOchiq(false);
      yukla();
    } catch (e) { setXato(e.message); } finally { setYangiMavzuYaratilmoqda(false); }
  };

  const kopMavzuYarat = async () => {
    const nomlar = kopMavzuMatni.split("\n").map((s) => s.trim()).filter(Boolean);
    if (nomlar.length === 0) { setXato("Kamida bitta mavzu nomi yozing"); return; }
    setKopMavzuYaratilmoqda(true); setXato("");
    try {
      for (let i = 0; i < nomlar.length; i++) {
        setKopMavzuProgress(`${i + 1} / ${nomlar.length}: ${nomlar[i]}`);
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`${API_BASE}/api/oqituvchi/reja_yangi_mavzu_yarat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, reja_id: rejaId, nomi: nomlar[i] }),
        });
        // eslint-disable-next-line no-await-in-loop
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`"${nomlar[i]}" qo'shilmadi: ${data.detail || "xato"}`);
      }
      setKopMavzuMatni(""); setKopMavzuRejimi(false); setYangiMavzuOchiq(false);
      yukla();
    } catch (e) { setXato(e.message); } finally { setKopMavzuYaratilmoqda(false); setKopMavzuProgress(""); }
  };

  const olibTashla = async (qatorId) => {
    await fetch(`${API_BASE}/api/oqituvchi/reja_mavzu_ochir?token=${encodeURIComponent(token)}&reja_id=${rejaId}&qator_id=${qatorId}`, { method: "DELETE" });
    yukla();
  };

  const surish = async (qatorId, yonalish) => {
    await fetch(`${API_BASE}/api/oqituvchi/reja_qator_surish`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, reja_id: rejaId, qator_id: qatorId, yonalish }),
    });
    yukla();
  };

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Rejalarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📋 {reja?.nomi}</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{reja?.sinf}-{reja?.fan} · {qatorlar.length} ta mavzu, tartib bilan</p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setYangiMavzuOchiq(!yangiMavzuOchiq); setQidiruvOchiq(false); }}
          className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
          {yangiMavzuOchiq ? "✕ Yopish" : "✏️ Yangi mavzu"}
        </button>
        <button onClick={() => { setQidiruvOchiq(!qidiruvOchiq); setQidiruv(""); setQidiruvNatijalari(null); setYangiMavzuOchiq(false); setBelgilanganKodlar({}); }}
          className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          {qidiruvOchiq ? "✕ Yopish" : "+ Mavzu qo'shish"}
        </button>
      </div>

      {yangiMavzuOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Milliy bazada mos mavzu topilmasa — shu yerda nomini yozib, o'zingiz qo'shing.</p>
          <div className="flex gap-1.5 mb-3">
            <button type="button" onClick={() => setKopMavzuRejimi(false)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={!kopMavzuRejimi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              Bittalab
            </button>
            <button type="button" onClick={() => setKopMavzuRejimi(true)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={kopMavzuRejimi ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              Bir nechtasini birdan
            </button>
          </div>

          {kopMavzuRejimi ? (
            <>
              <p className="text-xs mb-2" style={{ color: "#8A8578" }}>Har bir mavzuni YANGI qatorga yozing — tartib bilan qo'shiladi.</p>
              <textarea value={kopMavzuMatni} onChange={(e) => setKopMavzuMatni(e.target.value)}
                placeholder={"1-mavzu nomi\n2-mavzu nomi\n3-mavzu nomi\n..."} rows={8}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={kopMavzuYarat} disabled={kopMavzuYaratilmoqda || !kopMavzuMatni.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: (kopMavzuYaratilmoqda || !kopMavzuMatni.trim()) ? 0.6 : 1 }}>
                {kopMavzuYaratilmoqda
                  ? <><Loader2 size={16} className="animate-spin" /> {kopMavzuProgress}</>
                  : `+ Barchasini qo'shish (${kopMavzuMatni.split("\n").map((s) => s.trim()).filter(Boolean).length} ta)`}
              </button>
            </>
          ) : (
            <>
              <input type="text" value={yangiMavzuBob} onChange={(e) => setYangiMavzuBob(e.target.value)}
                placeholder="Bob nomi (ixtiyoriy)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
              <input type="text" value={yangiMavzuNomi} onChange={(e) => setYangiMavzuNomi(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && yangiMavzuYarat()}
                placeholder="Mavzu nomi"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
              <button onClick={yangiMavzuYarat} disabled={yangiMavzuYaratilmoqda || !yangiMavzuNomi.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: (yangiMavzuYaratilmoqda || !yangiMavzuNomi.trim()) ? 0.6 : 1 }}>
                {yangiMavzuYaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : "+ Ketma-ketlikka qo'shish"}
              </button>
            </>
          )}
        </div>
      )}

      {qidiruvOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <input type="text" value={qidiruv} onChange={(e) => { setQidiruv(e.target.value); setBelgilanganKodlar({}); }} placeholder="Mavzu nomi bo'yicha qidirish (bo'sh — reja sinf/fani)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          {qidirilmoqda ? (
            <div className="py-4 text-center"><Loader2 size={18} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : qidiruvXato ? (
            <p className="text-xs font-medium" style={{ color: "#A32D2D" }}>⚠️ {qidiruvXato}</p>
          ) : (
            <>
              {(qidiruvNatijalari || []).some((m) => !qatorlar.some((q) => q.topic_code === m.topic_code)) && (
                <button onClick={() => {
                    const qoshilmaganlar = (qidiruvNatijalari || []).filter((m) => !qatorlar.some((q) => q.topic_code === m.topic_code));
                    const hammasiBelgilangan = qoshilmaganlar.every((m) => belgilanganKodlar[m.topic_code]);
                    setBelgilanganKodlar(Object.fromEntries(qoshilmaganlar.map((m) => [m.topic_code, !hammasiBelgilangan])));
                  }}
                  className="text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
                  {(qidiruvNatijalari || []).filter((m) => !qatorlar.some((q) => q.topic_code === m.topic_code)).every((m) => belgilanganKodlar[m.topic_code])
                    ? "Hech birini belgilamaslik" : "Barchasini belgilash"}
                </button>
              )}
              <div className="space-y-1.5 max-h-64 overflow-y-auto mb-3">
                {(qidiruvNatijalari || []).map((m) => {
                  const qoshilganmi = qatorlar.some((q) => q.topic_code === m.topic_code);
                  return (
                    <label key={m.topic_code} className="flex items-center gap-2.5 rounded-lg p-2 cursor-pointer"
                      style={{ backgroundColor: "#F7F5F0", opacity: qoshilganmi ? 0.6 : 1 }}>
                      <input type="checkbox" checked={qoshilganmi || !!belgilanganKodlar[m.topic_code]} disabled={qoshilganmi}
                        onChange={() => kodBelgila(m.topic_code)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate" style={{ color: "#2B2B2B" }}>{topicName(m)}</p>
                        <p className="text-xs truncate" style={{ color: "#8A8578" }}>{m.subject_name} · {m.grade}-sinf {m.bob_name ? `· ${m.bob_name}` : ""}</p>
                      </div>
                      {qoshilganmi && <span className="text-xs font-semibold shrink-0" style={{ color: "#3B6D11" }}>✓ Qo'shilgan</span>}
                    </label>
                  );
                })}
              {(qidiruvNatijalari || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hech narsa topilmadi.</p>}
              </div>
              {Object.values(belgilanganKodlar).some(Boolean) && (
                <button onClick={tanlanganlarniQoshish} disabled={tanlanganlarniQoshishYuklanmoqda}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#1B4B7A", color: "#fff", opacity: tanlanganlarniQoshishYuklanmoqda ? 0.7 : 1 }}>
                  {tanlanganlarniQoshishYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> :
                    `+ Tanlanganlarni qo'shish (${Object.values(belgilanganKodlar).filter(Boolean).length} ta)`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

      {qatorlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan. Yuqoridagi tugmalardan birini bosing.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {qatorlar.map((q, i) => (
            <div key={q.qator_id} className="rounded-xl p-3 bg-white border flex items-center gap-2.5" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#2B2B2B" }}>{formatTopicTitle(i, q)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => surish(q.qator_id, "yuqori")} disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: "#F7F5F0", color: i === 0 ? "#C4BFAF" : "#1B4B7A" }}>↑</button>
                <button onClick={() => surish(q.qator_id, "pastga")} disabled={i === qatorlar.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: "#F7F5F0", color: i === qatorlar.length - 1 ? "#C4BFAF" : "#1B4B7A" }}>↓</button>
                <button onClick={() => olibTashla(q.qator_id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RejalarimBolimi({ token, onOrtga }) {
  const [rejalar, setRejalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [tanlanganRejaId, setTanlanganRejaId] = useState(null);

  const [formOchiq, setFormOchiq] = useState(false);
  const [yangiNomi, setYangiNomi] = useState("");
  const [yangiSinf, setYangiSinf] = useState("");
  const [yangiMaxsusSinf, setYangiMaxsusSinf] = useState(false);
  const [yangiSinfTuri, setYangiSinfTuri] = useState("guruh"); // "guruh" (bog'cha) | "grupa" (universitet/markaz)
  const [yangiSinfMatni, setYangiSinfMatni] = useState("");
  const [meningSinflarim, setMeningSinflarim] = useState([]); // avval o'zi yozgan maxsus sinflar — qayta yozib adashmasin
  const [yangiFanTanlash, setYangiFanTanlash] = useState(true); // true=ro'yxatdan, false=o'zi yozadi
  const [yangiFan, setYangiFan] = useState("");
  const [yangiFanMatni, setYangiFanMatni] = useState("");
  const [meningFanlarim, setMeningFanlarim] = useState([]); // avval o'zi yozgan fanlar — qayta yozib adashmasin
  const [yangiMavzular, setYangiMavzular] = useState("");
  const [yaratilmoqda, setYaratilmoqda] = useState(false);
  const [yaratishProgress, setYaratishProgress] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/mening_fanlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMeningFanlarim(d.fanlar || []))
      .catch(() => {});
    fetch(`${API_BASE}/api/oqituvchi/mening_maxsus_sinflarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMeningSinflarim(d.sinflar || []))
      .catch(() => {});
  }, [token]);

  const yukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/rejalarim?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => { setRejalar(d.rejalar || []); setXato(""); setYuklanmoqda(false); })
      .catch((e) => { setXato(e.message || "Yuklab bo'lmadi"); setYuklanmoqda(false); });
  };
  useEffect(yukla, [token]);

  const rejaYarat = async () => {
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni.trim() : yangiSinf;
    const fanQiymati = yangiFanTanlash ? yangiFan : yangiFanMatni.trim();
    if (!yangiNomi.trim()) { setXato("Reja nomini kiriting"); return; }
    if (!sinfQiymati) { setXato("Sinfni tanlang"); return; }
    if (!fanQiymati) { setXato("Fanni tanlang yoki yozing"); return; }
    if (fanQiymati.trim().split(/\s+/).length > 1) { setXato("Fan nomi bitta so'zdan oshmasligi kerak"); return; }
    const mavzuNomlari = yangiMavzular.split("\n").map((s) => s.trim()).filter(Boolean);
    setYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/reja_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nomi: yangiNomi.trim(),
          sinf: sinfQiymati,
          fan: fanQiymati.trim(),
          guruh_turi: yangiMaxsusSinf ? yangiSinfTuri : "sinf",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      const rejaId = data.reja_id;
      for (let i = 0; i < mavzuNomlari.length; i++) {
        setYaratishProgress(`Mavzular qo'shilmoqda: ${i + 1} / ${mavzuNomlari.length}`);
        // eslint-disable-next-line no-await-in-loop
        const mres = await fetch(`${API_BASE}/api/oqituvchi/reja_yangi_mavzu_yarat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, reja_id: rejaId, nomi: mavzuNomlari[i] }),
        });
        // eslint-disable-next-line no-await-in-loop
        if (!mres.ok) { const md = await mres.json().catch(() => ({})); throw new Error(`"${mavzuNomlari[i]}" qo'shilmadi: ${md.detail || "xato"}`); }
      }
      setYangiNomi(""); setYangiSinf(""); setYangiMaxsusSinf(false); setYangiSinfMatni("");
      setYangiFan(""); setYangiFanMatni(""); setYangiMavzular(""); setFormOchiq(false);
      setTanlanganRejaId(rejaId);
    } catch (e) { setXato(e.message); } finally { setYaratilmoqda(false); setYaratishProgress(""); }
  };

  if (tanlanganRejaId) {
    return <RejaDetali token={token} rejaId={tanlanganRejaId} onOrtga={() => { setTanlanganRejaId(null); yukla(); }} />;
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>To'garaklarim</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>📋 Rejalarim</h1>
        <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          {formOchiq ? "✕ Yopish" : "+ Yangi reja"}
        </button>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
        Bir marta tartibli mavzular ketma-ketligini tuzib qo'ying — keyin bir nechta to'garak guruhida qayta ishlatasiz.
      </p>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Reja nomi</label>
          <input type="text" value={yangiNomi} onChange={(e) => setYangiNomi(e.target.value)}
            placeholder="masalan: 9-sinf Algebra dasturi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf / Guruh / Grupa / Repetitor</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl p-1 gap-0.5 mb-2" style={{ backgroundColor: "#F0EDE5" }}>
            <button type="button" onClick={() => { setYangiMaxsusSinf(false); setYangiSinfMatni(""); }}
              className="flex-1 py-2 rounded-full text-xs font-semibold"
              style={!yangiMaxsusSinf ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🏫 Sinf
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("guruh"); setYangiSinf(""); }}
              className="flex-1 py-2 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "guruh") ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🧸 Guruh
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("grupa"); setYangiSinf(""); }}
              className="flex-1 py-2 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "grupa") ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🎓 Grupa
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("repetitor"); setYangiSinf(""); }}
              className="flex-1 py-2 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "repetitor") ? { backgroundColor: "#fff", color: "#28735A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🧑‍🏫 Repetitor
            </button>
          </div>
          {!yangiMaxsusSinf ? (
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {Array.from({ length: 11 }, (_, i) => String(i + 1)).map((n) => (
                <button key={n} type="button" onClick={() => setYangiSinf(n)}
                  className="py-2 rounded-lg border text-sm font-semibold text-center"
                  style={{
                    borderColor: yangiSinf === n ? "#1B4B7A" : "#E5E1D8",
                    backgroundColor: yangiSinf === n ? "#1B4B7A" : "#FFFFFF",
                    color: yangiSinf === n ? "#FFFFFF" : "#5A5648",
                  }}>
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <>
              {meningSinflarim.length > 0 && (
                <>
                  <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>Avval o'zingiz yozgan {groupTypeLabel(yangiSinfTuri).toLowerCase()}:</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {meningSinflarim.map((s) => (
                      <button key={s} type="button" onClick={() => setYangiSinfMatni(s)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                        style={{
                          borderColor: yangiSinfMatni === s ? "#1B4B7A" : "#E5E1D8",
                          backgroundColor: yangiSinfMatni === s ? "#1B4B7A" : "#FFFFFF",
                          color: yangiSinfMatni === s ? "#FFFFFF" : "#5A5648",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input type="text" value={yangiSinfMatni} onChange={(e) => setYangiSinfMatni(e.target.value)}
                placeholder={yangiSinfTuri === "grupa" ? "masalan: 205-guruh, 3-kurs" : yangiSinfTuri === "repetitor" ? "masalan: IELTS B2 kechki guruh" : "masalan: Kichik guruh, Abituriyent"}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Fan</label>
          {yangiFanTanlash ? (
            <>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {BARCHA_MAKTAB_FANLARI.map((f) => (
                  <button key={f} type="button" onClick={() => setYangiFan(f)}
                    className="px-3 py-2 rounded-lg border text-sm font-medium"
                    style={{
                      borderColor: yangiFan === f ? "#1B4B7A" : "#E5E1D8",
                      backgroundColor: yangiFan === f ? "#1B4B7A" : "#FFFFFF",
                      color: yangiFan === f ? "#FFFFFF" : "#5A5648",
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setYangiFanTanlash(false); setYangiFan(""); }}
                className="text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
                Ro'yxatda yo'q fan — o'zim yozaman →
              </button>
            </>
          ) : (
            <>
              {meningFanlarim.length > 0 && (
                <>
                  <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>Avval o'zingiz yozgan fanlar:</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {meningFanlarim.map((f) => (
                      <button key={f} type="button" onClick={() => setYangiFanMatni(f)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                        style={{
                          borderColor: yangiFanMatni === f ? "#1B4B7A" : "#E5E1D8",
                          backgroundColor: yangiFanMatni === f ? "#1B4B7A" : "#FFFFFF",
                          color: yangiFanMatni === f ? "#FFFFFF" : "#5A5648",
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input type="text" value={yangiFanMatni} onChange={(e) => setYangiFanMatni(e.target.value)}
                placeholder="Bitta so'z, masalan: Robototexnika"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
              <button type="button" onClick={() => { setYangiFanTanlash(true); setYangiFanMatni(""); }}
                className="text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
                ← Ro'yxatdan tanlashga qaytish
              </button>
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
            Mavzular (har birini yangi qatorga yozing — tartib bilan qo'shiladi, ixtiyoriy)
          </label>
          <textarea value={yangiMavzular} onChange={(e) => setYangiMavzular(e.target.value)}
            placeholder={"1-mavzu nomi\n2-mavzu nomi\n3-mavzu nomi\n..."} rows={8}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3 font-mono" style={{ borderColor: "#E5E1D8" }} />

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={rejaYarat} disabled={yaratilmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1B4B7A", opacity: yaratilmoqda ? 0.7 : 1 }}>
            {yaratilmoqda
              ? <><Loader2 size={16} className="animate-spin" /> {yaratishProgress || "Yaratilmoqda..."}</>
              : "Rejani yaratish"}
          </button>
        </div>
      )}

      {!formOchiq && xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : rejalar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali reja yaratilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {rejalar.map((r) => (
            <button key={r.id} onClick={() => setTanlanganRejaId(r.id)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{r.nomi}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{groupTypeLabel(r.guruh_turi)} · {r.sinf} · {r.fan} · {r.mavzu_soni} ta mavzu</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

async function muassasaV17Sorov(path, token, options = {}) {
  const response = await fetch(`${API_BASE}/api/muassasa-v17${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = raw ? { detail: raw } : {};
  }
  if (!response.ok) {
    const error = new Error(organizationTrialErrorMessage(data));
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function MuassasaV17ReadOnlyBanner({ organization }) {
  if (!organizationIsReadOnly(organization)) return null;
  return (
    <div className="org-trial-readonly-banner" role="status">
      <KeyRound size={19} />
      <div>
        <b>Faqat ko'rish rejimi</b>
        <p>30 kunlik sinov tugagan. Barcha ma'lumotlar saqlangan; tahrirlash bir martalik faollashtirishdan keyin ochiladi.</p>
      </div>
    </div>
  );
}

function MuassasaV17Markazi({ token, onBack, onWorkspaceOpen }) {
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [jarayon, setJarayon] = useState("");
  const [xato, setXato] = useState("");
  const [muvaffaqiyat, setMuvaffaqiyat] = useState("");
  const [tashkilotlar, setTashkilotlar] = useState([]);
  const [hamyon, setHamyon] = useState({ balance_uzs: 0 });
  const [sinovKunlari, setSinovKunlari] = useState(ORGANIZATION_TRIAL_DAYS);
  const [faollashtirishNarxi, setFaollashtirishNarxi] = useState(ORGANIZATION_ACTIVATION_PRICE_UZS);
  const [qadam, setQadam] = useState("royxat");
  const [yangiTuri, setYangiTuri] = useState("school");
  const [yangiNomi, setYangiNomi] = useState("");
  const [sinovTasdiqlandi, setSinovTasdiqlandi] = useState(false);
  const [faollashtiriladigan, setFaollashtiriladigan] = useState(null);
  const [tolovTasdiqlandi, setTolovTasdiqlandi] = useState(false);
  const [modalXato, setModalXato] = useState("");
  const yaratishKalitiRef = useRef("");
  const faollashtirishKalitlariRef = useRef(new Map());

  const yukla = async ({ sokin = false } = {}) => {
    if (!sokin) setYuklanmoqda(true);
    setXato("");
    try {
      const data = await muassasaV17Sorov("/meniki", token);
      setTashkilotlar(Array.isArray(data.organizations) ? data.organizations : []);
      setHamyon(data.wallet || { balance_uzs: 0 });
      setSinovKunlari(Number(data.trial_days) || ORGANIZATION_TRIAL_DAYS);
      setFaollashtirishNarxi(Number(data.activation_price_uzs) || ORGANIZATION_ACTIVATION_PRICE_UZS);
    } catch (error) {
      setXato(error.message);
    } finally {
      setYuklanmoqda(false);
    }
  };

  useEffect(() => {
    yukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const yangiMuassasaOch = () => {
    setQadam("malumot");
    setYangiTuri("school");
    setYangiNomi("");
    setSinovTasdiqlandi(false);
    setXato("");
    setMuvaffaqiyat("");
    yaratishKalitiRef.current = "";
  };

  const tafsilotdanTasdiqqa = () => {
    if (yangiNomi.trim().length < 2) {
      setXato("Muassasa nomini kiriting");
      return;
    }
    setXato("");
    setQadam("tasdiq");
  };

  const sinovniBoshlash = async () => {
    if (!sinovTasdiqlandi || jarayon) return;
    setJarayon("sinov");
    setXato("");
    setMuvaffaqiyat("");
    try {
      if (!yaratishKalitiRef.current) {
        yaratishKalitiRef.current = makeOrganizationIdempotencyKey("trial-start");
      }
      const payload = buildTrialStartPayload({
        organizationType: yangiTuri,
        name: yangiNomi,
        idempotencyKey: yaratishKalitiRef.current,
      });
      const organization = await muassasaV17Sorov("/sinov-boshlash", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTashkilotlar((current) => [organization, ...current.filter((item) => Number(item.id) !== Number(organization.id))]);
      yaratishKalitiRef.current = "";
      setQadam("royxat");
      setSinovTasdiqlandi(false);
      setMuvaffaqiyat(`${organization.name || yangiNomi} uchun ${sinovKunlari} kunlik bepul sinov boshlandi.`);
      await yukla({ sokin: true });
    } catch (error) {
      setXato(error.message);
    } finally {
      setJarayon("");
    }
  };

  const faollashtirishniOch = (organization) => {
    setFaollashtiriladigan(organization);
    setTolovTasdiqlandi(false);
    setModalXato("");
  };

  const faollashtirish = async () => {
    if (!faollashtiriladigan || !tolovTasdiqlandi || jarayon) return;
    setJarayon("faollashtirish");
    setModalXato("");
    try {
      const organizationId = faollashtiriladigan.id;
      if (!faollashtirishKalitlariRef.current.has(organizationId)) {
        faollashtirishKalitlariRef.current.set(
          organizationId,
          makeOrganizationIdempotencyKey(`activation-${organizationId}`),
        );
      }
      const payload = buildActivationPayload({
        confirmed: tolovTasdiqlandi,
        idempotencyKey: faollashtirishKalitlariRef.current.get(organizationId),
      });
      const data = await muassasaV17Sorov(`/${organizationId}/faollashtirish`, token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTashkilotlar((current) => current.map((item) => (
        Number(item.id) === Number(organizationId) ? data.organization : item
      )));
      if (data.wallet) setHamyon(data.wallet);
      faollashtirishKalitlariRef.current.delete(organizationId);
      setFaollashtiriladigan(null);
      setTolovTasdiqlandi(false);
      setMuvaffaqiyat(`${data.organization?.name || faollashtiriladigan.name} faollashtirildi. ${formatUzs(data.charged_uzs || faollashtirishNarxi)} bir marta yechildi.`);
      await yukla({ sokin: true });
    } catch (error) {
      setModalXato(organizationTrialErrorMessage(error.payload || error.message));
    } finally {
      setJarayon("");
    }
  };

  const ishMaydoniniOch = (organization) => {
    const membership = organizationToLegacyMembership(organization);
    if (membership) onWorkspaceOpen?.(membership, organizationTypeMeta(organization.organization_type).workspace);
  };

  const joriyNarx = Number(faollashtiriladigan?.activation_price_uzs) || faollashtirishNarxi;

  if (yuklanmoqda) {
    return (
      <div className="org-trial-shell px-5 pt-6 pb-4">
        <button type="button" onClick={onBack} className="org-trial-back"><ChevronLeft size={16} /> Ish maydoniga qaytish</button>
        <div className="org-trial-loading"><Loader2 size={25} className="animate-spin" /><p>Muassasalar yuklanmoqda...</p></div>
      </div>
    );
  }

  return (
    <div className="org-trial-shell px-5 pt-6 pb-4">
      <button type="button" onClick={qadam === "royxat" ? onBack : () => { setQadam(qadam === "tasdiq" ? "malumot" : "royxat"); setSinovTasdiqlandi(false); setXato(""); }} className="org-trial-back">
        <ChevronLeft size={16} /> {qadam === "royxat" ? "Ish maydoniga qaytish" : "Orqaga"}
      </button>

      <header className="org-trial-hero">
        <div className="org-trial-hero__icon"><Building2 size={27} /></div>
        <div>
          <span className="premium-eyebrow">XUSUSIY MUASSASA</span>
          <h1>Bitta sodda oqimda muassasa oching</h1>
          <p>{sinovKunlari} kun bepul foydalaning. Davom ettirish uchun keyin {formatUzs(faollashtirishNarxi)} bir martalik faollashtirish bor — avtomatik yechim yo'q.</p>
        </div>
        <div className="org-trial-wallet"><Wallet size={16} /><span>Hamyon</span><b>{formatUzs(hamyon.balance_uzs)}</b></div>
      </header>

      {xato && <div className="org-trial-notice error" role="alert">{xato}{qadam === "royxat" && <button type="button" onClick={() => yukla()}>Qayta urinish</button>}</div>}
      {muvaffaqiyat && <div className="org-trial-notice success" role="status">{muvaffaqiyat}</div>}

      {qadam === "malumot" && (
        <section className="org-trial-wizard" aria-labelledby="new-org-title">
          <div className="org-trial-step"><span>1</span><b>Muassasa ma'lumoti</b><small>1 / 2 bosqich</small></div>
          <h2 id="new-org-title">Yangi xususiy muassasa</h2>
          <p>Bu o'qituvchilar uchun yagona sinov oqimi. Davlat yoki ommaviy muassasa yaratish administrator orqali bajariladi.</p>
          <label className="org-trial-field">
            <span>Muassasa turi</span>
            <select value={yangiTuri} onChange={(event) => { setYangiTuri(event.target.value); setSinovTasdiqlandi(false); yaratishKalitiRef.current = ""; }}>
              {ORGANIZATION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.icon} {item.label}</option>)}
            </select>
          </label>
          <label className="org-trial-field">
            <span>Muassasa nomi</span>
            <input value={yangiNomi} onChange={(event) => { setYangiNomi(event.target.value); setSinovTasdiqlandi(false); yaratishKalitiRef.current = ""; }} placeholder="Masalan: Ziyo xususiy maktabi" maxLength={160} autoFocus />
          </label>
          <button type="button" className="org-trial-primary" onClick={tafsilotdanTasdiqqa}>Davom etish <ChevronRight size={17} /></button>
        </section>
      )}

      {qadam === "tasdiq" && (
        <section className="org-trial-wizard" aria-labelledby="trial-confirm-title">
          <div className="org-trial-step"><span>2</span><b>Sinovni tasdiqlash</b><small>2 / 2 bosqich</small></div>
          <h2 id="trial-confirm-title">{yangiNomi.trim()}</h2>
          <div className="org-trial-summary">
            <div><span>Tur</span><b>{organizationTypeMeta(yangiTuri).icon} {organizationTypeMeta(yangiTuri).label}</b></div>
            <div><span>Egalik</span><b>Xususiy</b></div>
            <div><span>Bepul muddat</span><b>{sinovKunlari} kun</b></div>
            <div><span>Keyingi faollashtirish</span><b>{formatUzs(faollashtirishNarxi)} · bir marta</b></div>
          </div>
          <div className="org-trial-terms">
            <b>Sinov hozir bepul boshlanadi</b>
            <p>Hozir hamyondan pul yechilmaydi. {sinovKunlari} kundan keyin to'lanmasa, muassasa faqat ko'rish rejimiga o'tadi; barcha ma'lumotlar saqlanadi.</p>
          </div>
          <label className="org-trial-checkbox">
            <input type="checkbox" checked={sinovTasdiqlandi} onChange={(event) => setSinovTasdiqlandi(event.target.checked)} />
            <span>{sinovKunlari} kunlik bepul sinovni boshlash va undan keyingi faqat ko'rish qoidasini tushundim.</span>
          </label>
          <button type="button" className="org-trial-primary" disabled={!sinovTasdiqlandi || jarayon === "sinov"} onClick={sinovniBoshlash}>
            {jarayon === "sinov" ? <><Loader2 size={17} className="animate-spin" /> Sinov boshlanmoqda...</> : `${sinovKunlari} kunlik bepul sinovni boshlash`}
          </button>
        </section>
      )}

      {qadam === "royxat" && (
        <>
          <div className="org-trial-list-head">
            <div><span className="premium-eyebrow">MUASSASALARIM</span><h2>Xususiy muassasalar</h2></div>
            <button type="button" onClick={yangiMuassasaOch}><Building2 size={17} /> Yangi muassasa</button>
          </div>
          {tashkilotlar.length === 0 ? (
            <section className="org-trial-empty">
              <Building2 size={28} />
              <h3>Hali xususiy muassasa ochilmagan</h3>
              <p>Bitta “Yangi muassasa” tugmasi orqali bog'cha, maktab, o'quv markazi yoki institut tanlanadi.</p>
              <button type="button" onClick={yangiMuassasaOch}>Yangi muassasa</button>
            </section>
          ) : (
            <section className="org-trial-list">
              {tashkilotlar.map((organization) => {
                const meta = organizationTypeMeta(organization.organization_type);
                const state = organizationTrialState(organization);
                return (
                  <article key={organization.id} className={`org-trial-card ${state.key}`}>
                    <div className="org-trial-card__main">
                      <span className="org-trial-card__icon">{meta.icon}</span>
                      <div>
                        <div className="org-trial-card__title"><h3>{organization.name}</h3><span className={`org-trial-badge ${state.key}`}>{state.label}</span></div>
                        <p>{meta.label} · Xususiy muassasa</p>
                      </div>
                    </div>
                    {state.key === "trial" && (
                      <div className="org-trial-card__timeline">
                        <CalendarCheck size={17} />
                        <div><b>{state.detail}</b><span>Sinov tugashi: {formatTrialEnd(organization.trial_ends_at)}</span></div>
                      </div>
                    )}
                    {state.key === "read_only" && (
                      <div className="org-trial-card__readonly"><KeyRound size={17} /><p><b>Sinov muddati tugagan — faqat ko'rish.</b> Barcha ma'lumot saqlangan va faollashtirilgach yana tahrirlanadi.</p></div>
                    )}
                    {state.key === "active" && <p className="org-trial-card__active">✓ Bir martalik faollashtirish bajarilgan</p>}
                    <div className="org-trial-card__actions">
                      <button type="button" className="secondary" onClick={() => ishMaydoniniOch(organization)}>Ish maydonini ochish</button>
                      {organizationCanActivate(organization) && <button type="button" className="primary" onClick={() => faollashtirishniOch(organization)}>Faollashtirish</button>}
                    </div>
                  </article>
                );
              })}
            </section>
          )}
          <p className="org-trial-retention"><KeyRound size={15} /> To'lanmagan muassasa o'chirilmaydi: sinovdan keyin ma'lumotlar saqlanib, faqat ko'rish rejimida qoladi.</p>
        </>
      )}

      {faollashtiriladigan && (
        <div className="org-trial-modal-backdrop" role="presentation" onMouseDown={() => jarayon !== "faollashtirish" && setFaollashtiriladigan(null)}>
          <section className="org-trial-modal" role="dialog" aria-modal="true" aria-labelledby="activation-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="org-trial-modal__close" disabled={jarayon === "faollashtirish"} onClick={() => setFaollashtiriladigan(null)} aria-label="Yopish"><X size={18} /></button>
            <span className="premium-eyebrow">BIR MARTALIK FAOLLASHTIRISH</span>
            <h2 id="activation-title">{faollashtiriladigan.name}</h2>
            <p>Bu obuna emas. Faqat quyidagi tasdiqdan keyin hamyoningizdan bir marta mablag' yechiladi.</p>
            <div className="org-trial-charge">
              <div><span>Faollashtirish narxi</span><b>{formatUzs(joriyNarx)}</b></div>
              <div><span>Hamyondagi mablag'</span><b>{formatUzs(hamyon.balance_uzs)}</b></div>
              <div><span>To'lov turi</span><b>Bir martalik</b></div>
            </div>
            {Number(hamyon.balance_uzs) < joriyNarx && <div className="org-trial-balance-warning">Hamyondagi mablag' yetarli emas. Tasdiqlashdan oldin balansni to'ldiring.</div>}
            {modalXato && <div className="org-trial-notice error" role="alert">{modalXato}</div>}
            <label className="org-trial-checkbox charge">
              <input type="checkbox" checked={tolovTasdiqlandi} onChange={(event) => setTolovTasdiqlandi(event.target.checked)} />
              <span><b>{formatUzs(joriyNarx)}</b> hamyonimdan bir marta yechilishiga aniq roziman.</span>
            </label>
            <div className="org-trial-modal__actions">
              <button type="button" className="secondary" disabled={jarayon === "faollashtirish"} onClick={() => setFaollashtiriladigan(null)}>Hozir emas</button>
              <button type="button" className="primary" disabled={!tolovTasdiqlandi || jarayon === "faollashtirish"} onClick={faollashtirish}>
                {jarayon === "faollashtirish" ? <><Loader2 size={17} className="animate-spin" /> Tasdiqlanmoqda...</> : `${formatUzs(joriyNarx)}ni bir marta yechish`}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function OqituvchiTab({ token, foydalanuvchi, boshlanishKorinishi }) {
  const [holat, setHolat] = useState("togaraklar"); // togaraklar | azolar | yaratish
  const [togaraklar, setTogaraklar] = useState([]);
  const [togarakKvota, setTogarakKvota] = useState(null);
  const [tanlangan, setTanlangan] = useState(null);
  const [azolar, setAzolar] = useState([]);
  const [kutilayotganAzolar, setKutilayotganAzolar] = useState([]);
  const [bahoQoyilayotgan, setBahoQoyilayotgan] = useState(null); // user_id | null
  const [bahoQiymati, setBahoQiymati] = useState("");
  const [bahoTopicCode, setBahoTopicCode] = useState("");
  const [bahoMavzulari, setBahoMavzulari] = useState([]);
  const [izohQiymati, setIzohQiymati] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [korinish, setKorinish] = useState("togarak"); // "togarak" | to'garak guruhlarimi yoki maxsus ekranmi
  const [muassasalar, setMuassasalar] = useState([]);
  const [muassasalarYuklanmoqda, setMuassasalarYuklanmoqda] = useState(true);
  const [aktivMuassasaIdx, setAktivMuassasaIdx] = useState(0);

  // Pastki menyudan ("Maktabim"/"Bog'cham"/"Universitetim"/"Markazim")
  // to'g'ridan-to'g'ri kelgan bo'lsa — o'sha ekranga o'tamiz. "vaqt"
  // maydoni — bir xil ekran ketma-ket ikki marta bosilsa ham qayta
  // ishga tushishi uchun (aks holda useEffect qayta chaqirilmas edi).
  useEffect(() => {
    if (boshlanishKorinishi?.korinish) setKorinish(boshlanishKorinishi.korinish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boshlanishKorinishi?.vaqt]);

  const [yangiNomi, setYangiNomi] = useState("");
  const [yangiTuri, setYangiTuri] = useState("oddiy"); // "oddiy" | "avto"
  const [yangiGuruhTuri, setYangiGuruhTuri] = useState("togarak"); // "togarak" | "repetitor"
  const [yangiFan, setYangiFan] = useState("");
  const [yangiFanOzicha, setYangiFanOzicha] = useState(false); // true bo'lsa o'qituvchi ro'yxatda yo'q fanni o'zi yozadi
  const [meningFanlarim, setMeningFanlarim] = useState([]); // avval o'zi yozgan fanlar — qayta yozib adashmasin
  const [yangiSinf, setYangiSinf] = useState("");         // "1".."11"
  const [yangiMaxsusSinf, setYangiMaxsusSinf] = useState(false); // true bo'lsa to'garak guruhi (masalan "3-4")
  const [yangiSinfTuri, setYangiSinfTuri] = useState("guruh"); // "guruh" | "grupa" | "repetitor"
  const [yangiSinfMatni, setYangiSinfMatni] = useState(""); // tanlangan to'garak sinfi (masalan "3-4")
  const [meningSinflarim, setMeningSinflarim] = useState([]); // avval o'zi yozgan maxsus sinflar — qayta yozib adashmasin
  const [togarakSinflari, setTogarakSinflari] = useState([]); // mavjud to'garak sinflari ro'yxati
  const [togarakSinflariYuklanmoqda, setTogarakSinflariYuklanmoqda] = useState(false);
  const [sinfFanlari, setSinfFanlari] = useState([]); // tanlangan sinf uchun MAVJUD fanlar ro'yxati
  const [sinfFanlariYuklanmoqda, setSinfFanlariYuklanmoqda] = useState(false);
  const [yangiMavjudRejalar, setYangiMavjudRejalar] = useState([]);
  const [yangiRejalarYuklanmoqda, setYangiRejalarYuklanmoqda] = useState(false);
  const [yangiTanlanganRejaId, setYangiTanlanganRejaId] = useState(null); // null = rejasiz (eski avtomatik usul)
  const [yangiRejaQurishOchiq, setYangiRejaQurishOchiq] = useState(null); // reja_id | null — bo'lsa RejaDetali ko'rsatiladi
  const [yangiRejaNomi, setYangiRejaNomi] = useState("");
  const [yangiRejaYaratilmoqda, setYangiRejaYaratilmoqda] = useState(false);
  const [yangiParol, setYangiParol] = useState("");
  const [yangiMaxTalaba, setYangiMaxTalaba] = useState(String(CLUB_STUDENT_LIMIT));
  const [yangiOylikSumma, setYangiOylikSumma] = useState("");
  const [uniGuruhIzlash, setUniGuruhIzlash] = useState("");
  const [uniGuruhNatijalar, setUniGuruhNatijalar] = useState([]);
  const [tanlanganUniGuruh, setTanlanganUniGuruh] = useState(null);
  const [yaratilmoqda, setYaratilmoqda] = useState(false);

  // "Aralash to'garak guruhi" yoqilganda — mavjud to'garak sinflari ro'yxatini yuklaymiz
  useEffect(() => {
    if (!yangiMaxsusSinf || togarakSinflari.length > 0) return;
    setTogarakSinflariYuklanmoqda(true);
    fetch(`${API_BASE}/api/mavzular?turi=togarak`)
      .then((r) => r.json())
      .then((d) => {
        const sinflar = new Set();
        (d.fanlar || []).forEach((f) => f.sinflar.forEach((s) => sinflar.add(s.sinf)));
        setTogarakSinflari(Array.from(sinflar).sort());
      })
      .finally(() => setTogarakSinflariYuklanmoqda(false));
  }, [yangiMaxsusSinf]);

  // Sinf (oddiy yoki to'garak) tanlangach — o'sha sinfda MAVJUD fanlar ro'yxatini yuklaymiz
  useEffect(() => {
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni : yangiSinf;
    setYangiFan("");
    setSinfFanlari([]);
    if (!sinfQiymati) return;
    setSinfFanlariYuklanmoqda(true);
    const turi = yangiMaxsusSinf ? "togarak" : "oddiy";
    fetch(`${API_BASE}/api/mavzular?sinf=${encodeURIComponent(sinfQiymati)}&turi=${turi}`)
      .then((r) => r.json())
      .then((d) => setSinfFanlari((d.fanlar || []).map((f) => f.nom)))
      .finally(() => setSinfFanlariYuklanmoqda(false));
  }, [yangiSinf, yangiSinfMatni, yangiMaxsusSinf]);

  const rejalarniQaytaYukla = () => {
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni : yangiSinf;
    if (!sinfQiymati || !yangiFan) { setYangiMavjudRejalar([]); return; }
    setYangiRejalarYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/rejalarim?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(sinfQiymati)}&fan=${encodeURIComponent(yangiFan)}`)
      .then((r) => r.json())
      .then((d) => setYangiMavjudRejalar(d.rejalar || []))
      .catch(() => setYangiMavjudRejalar([]))
      .finally(() => setYangiRejalarYuklanmoqda(false));
  };
  useEffect(() => {
    setYangiTanlanganRejaId(null);
    rejalarniQaytaYukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yangiSinf, yangiSinfMatni, yangiMaxsusSinf, yangiFan, token]);

  const yangiRejaYaratishBoshla = async () => {
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni.trim() : yangiSinf;
    if (!yangiRejaNomi.trim() || !sinfQiymati || !yangiFan) return;
    setYangiRejaYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/reja_yarat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nomi: yangiRejaNomi.trim(),
          sinf: sinfQiymati,
          fan: yangiFan,
          guruh_turi: yangiMaxsusSinf ? yangiSinfTuri : "sinf",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setYangiRejaNomi("");
      setYangiRejaQurishOchiq(data.reja_id);
    } catch (e) { setXato(e.message); } finally { setYangiRejaYaratilmoqda(false); }
  };

  useEffect(() => {
    if (uniGuruhIzlash.trim().length < 1) { setUniGuruhNatijalar([]); return; }
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/oqituvchi/universitet_guruh_qidir?token=${encodeURIComponent(token)}&nomi=${encodeURIComponent(uniGuruhIzlash.trim())}`)
        .then((r) => r.json())
        .then((d) => setUniGuruhNatijalar(d.natijalar || []))
        .catch(() => {});
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [uniGuruhIzlash, token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/togaraklar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setTogaraklar(d.togaraklar || []);
        setTogarakKvota(d.kvota || null);
        setYuklanmoqda(false);
      })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/muassasalarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMuassasalar(d.muassasalar || []))
      .catch(() => {})
      .finally(() => setMuassasalarYuklanmoqda(false));
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/mening_fanlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMeningFanlarim(d.fanlar || []))
      .catch(() => {});
    fetch(`${API_BASE}/api/oqituvchi/mening_maxsus_sinflarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMeningSinflarim(d.sinflar || []))
      .catch(() => {});
  }, [token]);

  const togarakOch = async (t) => {
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak/${t.id}/azolar?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setAzolar(data.azolar || []);
      setTanlangan(t);
      setHolat("kalendar_reja");
      fetch(`${API_BASE}/api/oqituvchi/togarak_barcha_mavzular?token=${encodeURIComponent(token)}&togarak_id=${t.id}`)
        .then((r) => r.json())
        .then((body) => setBahoMavzulari(body.mavzular || []))
        .catch(() => setBahoMavzulari([]));
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const kutilayotganAzolarniYukla = () => {
    if (!tanlangan) return;
    fetch(`${API_BASE}/api/oqituvchi/togarak/${tanlangan.id}/kutilayotgan_azolar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setKutilayotganAzolar(d.azolar || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (holat === "azolar") kutilayotganAzolarniYukla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holat, tanlangan]);

  const azolarniQaytaYukla = () => {
    if (!tanlangan) return;
    fetch(`${API_BASE}/api/oqituvchi/togarak/${tanlangan.id}/azolar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setAzolar(d.azolar || []))
      .catch(() => {});
  };

  const azoTasdiqla = async (azolikId) => {
    setXato("");
    const res = await fetch(`${API_BASE}/api/oqituvchi/azo_tasdiqla?token=${encodeURIComponent(token)}&azolik_id=${azolikId}`, { method: "PUT" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setXato(apiErrorMessage(data.detail, "O'quvchini tasdiqlab bo'lmadi"));
      return;
    }
    kutilayotganAzolarniYukla();
    azolarniQaytaYukla();
  };

  const azoRadEt = async (azolikId) => {
    await fetch(`${API_BASE}/api/oqituvchi/azo_rad_etish?token=${encodeURIComponent(token)}&azolik_id=${azolikId}`, { method: "DELETE" });
    kutilayotganAzolarniYukla();
  };

  const bahoBoshla = (azo) => {
    setBahoQoyilayotgan(azo.user_id);
    setBahoQiymati(azo.oxirgi_baho != null ? String(azo.oxirgi_baho) : "");
    setBahoTopicCode("");
    setIzohQiymati("");
  };

  const bahoSaqla = async (userId) => {
    const baho = parseInt(bahoQiymati, 10);
    if (isNaN(baho) || baho < 0 || baho > 100) {
      setXato("Baho 0-100 oralig'ida bo'lishi kerak");
      return;
    }
    if (!bahoTopicCode) {
      setXato("Baho qaysi mavzuga tegishli ekanini tanlang");
      return;
    }
    setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/baho_qoy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: tanlangan.id, user_id: userId, baho, topic_code: bahoTopicCode, izoh: izohQiymati || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setAzolar((prev) => prev.map((a) => (a.user_id === userId ? { ...a, oxirgi_baho: baho } : a)));
      setBahoQoyilayotgan(null);
    } catch (e) {
      setXato(e.message);
    }
  };

  const yaratishSaqla = async () => {
    if (!yangiNomi.trim() || !yangiFan.trim()) {
      setXato("To'garak nomi va fan kiritilishi shart");
      return;
    }
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni.trim() : yangiSinf;
    if (!sinfQiymati) {
      setXato("Sinfni tanlang (yoki to'garak guruhini kiriting)");
      return;
    }
    const sigim = Number.parseInt(yangiMaxTalaba, 10);
    if (!Number.isFinite(sigim) || sigim < 1 || sigim > CLUB_STUDENT_LIMIT) {
      setXato(`Guruh sig'imi 1–${CLUB_STUDENT_LIMIT} oralig'ida bo'lishi kerak`);
      return;
    }
    setYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nomi: yangiNomi.trim(),
          fan: yangiFan.trim(),
          sinf: sinfQiymati,
          turi: yangiTuri,
          guruh_turi: yangiGuruhTuri,
          parol: yangiParol || undefined,
          max_talaba: normalizedClubCapacity(yangiMaxTalaba),
          oylik_summa: yangiOylikSumma ? parseInt(yangiOylikSumma, 10) : undefined,
          universitet_guruh_id: tanlanganUniGuruh ? tanlanganUniGuruh.id : undefined,
          reja_id: yangiTanlanganRejaId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(apiErrorMessage(data.detail, "To'garak yaratilmadi"));
      const yangiTogarak = { id: data.togarak_id, nomi: yangiNomi.trim(), fan: yangiFan.trim(), sinf: sinfQiymati, turi: yangiTuri, guruh_turi: data.guruh_turi || yangiGuruhTuri, max_talaba: data.max_talaba || CLUB_STUDENT_LIMIT, azo_soni: 0 };
      setTogaraklar((prev) => [...prev, yangiTogarak]);
      setTogarakKvota(data.kvota || togarakKvota);
      setYangiNomi(""); setYangiTuri("oddiy"); setYangiGuruhTuri("togarak"); setYangiFan(""); setYangiFanOzicha(false); setYangiSinf(""); setYangiMaxsusSinf(false); setYangiSinfMatni("");
      setTogarakSinflari([]); setSinfFanlari([]);
      setYangiMavjudRejalar([]); setYangiTanlanganRejaId(null); setYangiRejaNomi("");
      setYangiParol(""); setYangiMaxTalaba(String(CLUB_STUDENT_LIMIT)); setYangiOylikSumma("");
      setUniGuruhIzlash(""); setUniGuruhNatijalar([]); setTanlanganUniGuruh(null);
      setTanlangan(yangiTogarak);
      setAzolar([]);
      setHolat("mavzular_boshqarish");
    } catch (e) {
      setXato(e.message);
    } finally { setYaratilmoqda(false); }
  };

  const yaratishniOch = ({ turi = "oddiy", guruhTuri = null, guruhMaqsadi = "togarak" } = {}) => {
    setXato("");
    setYangiTuri(turi);
    setYangiGuruhTuri(guruhMaqsadi);
    setYangiMaxTalaba(String(CLUB_STUDENT_LIMIT));
    if (guruhTuri) {
      setYangiMaxsusSinf(true);
      setYangiSinfTuri(guruhTuri);
      setYangiSinf("");
    }
    setHolat("yaratish");
  };

  if (korinish === "muassasa_v17") {
    return (
      <MuassasaV17Markazi
        token={token}
        onBack={() => setKorinish("togarak")}
        onWorkspaceOpen={(membership, workspace) => {
          setMuassasalar((current) => [
            membership,
            ...current.filter((item) => !(
              item.organization_v17_id === membership.organization_v17_id
              || (item.turi === membership.turi && Number(item.muassasa_id) === Number(membership.muassasa_id))
            )),
          ]);
          setAktivMuassasaIdx(0);
          setKorinish(workspace || "togarak");
        }}
      />
    );
  }

  // Fetch hali qaytmagan bo'lsa ham, profildan (foydalanuvchi) darhol
  // BITTA muassasa ko'rsatiladi — shu bilan ekran "yalang'och" ochilmaydi.
  const samariMuassasalar = muassasalar.length > 0 ? muassasalar : (
    foydalanuvchi?.maktab_id ? [{ turi: "maktab", muassasa_id: foydalanuvchi.maktab_id, muassasa_nomi: foydalanuvchi.maktab_nomi, lavozim: foydalanuvchi.lavozim }]
    : foydalanuvchi?.markaz_id ? [{ turi: "markaz", muassasa_id: foydalanuvchi.markaz_id, muassasa_nomi: null, lavozim: foydalanuvchi.lavozim }]
    : foydalanuvchi?.bogcha_id ? [{ turi: "bogcha", muassasa_id: foydalanuvchi.bogcha_id, muassasa_nomi: null, lavozim: foydalanuvchi.lavozim }]
    : foydalanuvchi?.universitet_id ? [{ turi: "universitet", muassasa_id: foydalanuvchi.universitet_id, muassasa_nomi: null, lavozim: foydalanuvchi.lavozim }]
    : []
  );
  const aktivMuassasa = samariMuassasalar[aktivMuassasaIdx] || samariMuassasalar[0] || null;
  const kvotaBloklangan = Boolean(
    !freeClubAvailable(togarakKvota) &&
    !foydalanuvchi?.is_admin &&
    aktivMuassasa?.turi !== "markaz" &&
    !tanlanganUniGuruh
  );
  const tanlanganSigim = normalizedClubCapacity(tanlangan?.max_talaba);
  const tanlanganGuruhToliq = Boolean(tanlangan && azolar.length >= tanlanganSigim);
  const MUASSASA_IKONKA = { maktab: "🏫", markaz: "🎓", bogcha: "🧸", universitet: "🎓" };
  const MUASSASA_BOSHQARUVCHI_LAVOZIM = {
    maktab: ["direktor", "zam_direktor_uquv", "zam_direktor_tarbiya"],
    markaz: ["markaz_direktor", "administrator"],
    bogcha: ["bogcha_direktor", "bogcha_zam"],
    universitet: ["rektor", "prorektor"],
  };
  const muassasagaRuxsatBor = (turi) => Boolean(
    foydalanuvchi?.is_admin || samariMuassasalar.some((m) => m.turi === turi)
  );
  const himoyalanganMuassasaKorinishi = {
    markaz: "markaz",
    markaz_workspace: "markaz",
    markaz_legacy: "markaz",
    maktab_rahbariyat: "maktab",
    maktab_workspace: "maktab",
    maktab_legacy: "maktab",
    bogcha: "bogcha",
    bogcha_workspace: "bogcha",
    bogcha_legacy: "bogcha",
    institut_workspace: "universitet",
    universitet: "universitet",
    universitet_legacy: "universitet",
  }[korinish];

  if (himoyalanganMuassasaKorinishi && muassasalarYuklanmoqda && !foydalanuvchi?.is_admin) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (himoyalanganMuassasaKorinishi && !muassasagaRuxsatBor(himoyalanganMuassasaKorinishi)) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setKorinish("togarak")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}>
          <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} /></span>
          Ish maydoniga qaytish
        </button>
        <div className="rounded-3xl border bg-white p-7 text-center" style={{ borderColor: "#E5E1D8" }}>
          <Building2 size={30} className="mx-auto mb-3" style={{ color: "#8A8578" }} />
          <h2 className="text-lg font-bold mb-2">Bu muassasaga ruxsat yo'q</h2>
          <p className="text-sm leading-relaxed" style={{ color: "#6F6859" }}>
            Oddiy o'qituvchi bog'cha, maktab, markaz yoki institut yarata olmaydi. Muassasa faqat Administrator markazida ochiladi; xodim esa taklif kodi bilan o'z ish joyiga ulanadi.
          </p>
        </div>
      </div>
    );
  }

  if (korinish === "oqituvchi_analitika") {
    return <TeacherAnalyticsPanel token={token} initialWorkplace={aktivMuassasa}
      onBack={() => setKorinish("togarak")} />;
  }

  if (korinish === "markaz" || korinish === "markaz_workspace") {
    return (
      <div className="org-v17-workspace-wrap">
        <MuassasaV17ReadOnlyBanner organization={aktivMuassasa} />
        <React.Suspense fallback={<div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <LearningCenterWorkspace
            token={token}
            apiBase={API_BASE}
            initialWorkspace={aktivMuassasa?.turi === "markaz" ? aktivMuassasa : null}
            onBack={() => setKorinish("togarak")}
            onLegacy={() => setKorinish("markaz_legacy")}
            assignedOnly={!foydalanuvchi?.is_admin}
            canCreateInstitution={Boolean(foydalanuvchi?.is_admin)}
          />
        </React.Suspense>
      </div>
    );
  }

  if (korinish === "markaz_legacy") {
    return <MarkazBoshqaruvi token={token} markazId={aktivMuassasa?.turi === "markaz" ? aktivMuassasa.muassasa_id : foydalanuvchi?.markaz_id} onOrtga={() => setKorinish("markaz_workspace")} />;
  }

  const aktivMaktabId = aktivMuassasa?.turi === "maktab" ? aktivMuassasa.muassasa_id : foydalanuvchi?.maktab_id;

  if (korinish === "maktab_rahbariyat" || korinish === "maktab_workspace") {
    return (
      <div className="org-v17-workspace-wrap">
        <MuassasaV17ReadOnlyBanner organization={aktivMuassasa} />
        <React.Suspense fallback={<div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <SchoolWorkspace
            token={token}
            apiBase={API_BASE}
            initialWorkspace={
              aktivMuassasa?.turi === "maktab"
                ? aktivMuassasa
                : aktivMaktabId
                  ? {
                      turi: "maktab",
                      muassasa_id: aktivMaktabId,
                      muassasa_nomi: foydalanuvchi?.maktab_nomi || "Maktab",
                      lavozim: foydalanuvchi?.lavozim || (foydalanuvchi?.is_admin ? "direktor" : ""),
                    }
                  : null
            }
            onBack={() => setKorinish("togarak")}
            onLegacy={() => setKorinish("maktab_legacy")}
            assignedOnly={!foydalanuvchi?.is_admin}
            canCreateInstitution={Boolean(foydalanuvchi?.is_admin)}
            adminPreview={Boolean(foydalanuvchi?.is_admin)}
          />
        </React.Suspense>
      </div>
    );
  }

  if (korinish === "maktab_legacy") {
    return <MaktabBoshqaruvi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("maktab_workspace")} />;
  }

  if (korinish === "kutubxona") {
    return <KutubxonaBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "moliya") {
    return <MoliyaBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "hujjatlar") {
    return <HujjatlarBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "rejalashtirish") {
    return <RejalashtirishBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "ai_yordamchi") {
    return <AiYordamchiBolimi token={token} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "ai_dars") {
    return <AiOchiqDarsKonstruktori token={token} onOrtga={() => setKorinish("togarak")} />;
  }
  if (korinish === "ai_togarak") {
    return <AiTogarakRejaKonstruktori token={token} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "rejalarim") {
    return <RejalarimBolimi token={token} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "fanlar_tahlili") {
    return <FanlarTahliliBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "psixolog") {
    return <PsixologQidiruv token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "bogcha" || korinish === "bogcha_workspace") {
    return (
      <div className="org-v17-workspace-wrap">
        <MuassasaV17ReadOnlyBanner organization={aktivMuassasa} />
        <React.Suspense fallback={<div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <KindergartenWorkspace
            token={token}
            apiBase={API_BASE}
            initialWorkspace={aktivMuassasa?.turi === "bogcha" ? aktivMuassasa : null}
            onBack={() => setKorinish("togarak")}
            onLegacy={() => setKorinish("bogcha_legacy")}
            assignedOnly={!foydalanuvchi?.is_admin}
            canCreateInstitution={Boolean(foydalanuvchi?.is_admin)}
          />
        </React.Suspense>
      </div>
    );
  }

  if (korinish === "bogcha_legacy") {
    return <BogchaGuruhim token={token} onOrtga={() => setKorinish("bogcha_workspace")} />;
  }

  if (korinish === "institut_workspace" || korinish === "universitet") {
    return (
      <div className="org-v17-workspace-wrap">
        <MuassasaV17ReadOnlyBanner organization={aktivMuassasa} />
        <React.Suspense fallback={<div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <InstituteWorkspace
            token={token}
            apiBase={API_BASE}
            initialWorkspace={aktivMuassasa?.turi === "universitet" ? aktivMuassasa : null}
            onBack={() => setKorinish("togarak")}
            onLegacy={() => setKorinish("universitet_legacy")}
            assignedOnly={!foydalanuvchi?.is_admin}
            canCreateInstitution={Boolean(foydalanuvchi?.is_admin)}
          />
        </React.Suspense>
      </div>
    );
  }

  if (korinish === "universitet_legacy") {
    return <UniversitetGuruhimBilimi token={token} onOrtga={() => setKorinish("institut_workspace")} />;
  }

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (holat === "yaratish" && yangiRejaQurishOchiq) {
    return <RejaDetali token={token} rejaId={yangiRejaQurishOchiq}
      onOrtga={() => { const rid = yangiRejaQurishOchiq; setYangiRejaQurishOchiq(null); rejalarniQaytaYukla(); setYangiTanlanganRejaId(rid); }} />;
  }

  if (holat === "yaratish") {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("togaraklar")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{yangiGuruhTuri === "repetitor" ? "Yangi repetitor guruhi" : "Yangi to'garak"}</h1>
        <p className="text-sm mb-4" style={{ color: "#8A8578" }}>Bot va saytda bir xil ko'rinadi · eng ko'pi {CLUB_STUDENT_LIMIT} o'quvchi</p>

        {togarakKvota && !togarakKvota.admin && (
          <div className="rounded-2xl p-4 mb-4 border" style={{ backgroundColor: kvotaBloklangan ? "#FDF3E0" : "#E7F4EE", borderColor: kvotaBloklangan ? "#E7BD73" : "#A9D8C5" }}>
            <p className="text-sm font-bold" style={{ color: kvotaBloklangan ? "#8A5A1C" : "#28735A" }}>
              {kvotaBloklangan ? "Bepul guruh ishlatilgan" : "Birinchi shaxsiy guruh bepul"}
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#5A5648" }}>
              {kvotaBloklangan
                ? `Ikkinchi to'garak yoki repetitor guruhi — ${SECOND_CLUB_PRICE_UZS.toLocaleString("uz-UZ")} so'm. To'lov oynasi keyingi bosqichda ulanadi.`
                : `Bitta shaxsiy guruhni bepul ochasiz. Har bir guruhda qat'iy ${CLUB_STUDENT_LIMIT} ta o'rin bor.`}
            </p>
          </div>
        )}

        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>To'garak turi</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <button type="button" onClick={() => { setYangiTuri("oddiy"); setYangiGuruhTuri("togarak"); }}
              className="rounded-xl p-3 text-left border-2"
              style={{ borderColor: yangiTuri === "oddiy" && yangiGuruhTuri === "togarak" ? "#1B4B7A" : "#E5E1D8", backgroundColor: yangiTuri === "oddiy" && yangiGuruhTuri === "togarak" ? "#EAF1F7" : "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#1B4B7A" }}>🎓 Oddiy</p>
              <p className="text-[11px]" style={{ color: "#5A5648" }}>Siz jonli dars o'tasiz, kalendar bilan</p>
            </button>
            <button type="button" onClick={() => { setYangiTuri("avto"); setYangiGuruhTuri("togarak"); }}
              className="rounded-xl p-3 text-left border-2"
              style={{ borderColor: yangiTuri === "avto" ? "#8B5FBF" : "#E5E1D8", backgroundColor: yangiTuri === "avto" ? "#F3EEFA" : "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#8B5FBF" }}>🤖 Avto</p>
              <p className="text-[11px]" style={{ color: "#5A5648" }}>O'quvchi mustaqil, kitob orqali o'qiydi</p>
            </button>
            <button type="button" onClick={() => { setYangiTuri("oddiy"); setYangiGuruhTuri("repetitor"); setYangiMaxsusSinf(true); setYangiSinfTuri("repetitor"); setYangiSinf(""); }}
              className="rounded-xl p-3 text-left border-2"
              style={{ borderColor: yangiGuruhTuri === "repetitor" ? "#28735A" : "#E5E1D8", backgroundColor: yangiGuruhTuri === "repetitor" ? "#E7F4EE" : "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#28735A" }}>🧑‍🏫 Repetitor</p>
              <p className="text-[11px]" style={{ color: "#5A5648" }}>Yakka ustozning dars guruhi va reja yo'li</p>
            </button>
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>To'garak nomi</label>
          <input type="text" value={yangiNomi} onChange={(e) => setYangiNomi(e.target.value)}
            placeholder="masalan: Matematik to'garak"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf / Guruh / Grupa / Repetitor</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl p-1 gap-0.5 mb-2" style={{ backgroundColor: "#F0EDE5" }}>
            <button type="button" onClick={() => { setYangiMaxsusSinf(false); setYangiSinfMatni(""); setYangiGuruhTuri("togarak"); }}
              className="flex-1 py-2.5 rounded-full text-xs font-semibold"
              style={!yangiMaxsusSinf ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🏫 Sinf
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("guruh"); setYangiGuruhTuri("togarak"); setYangiSinf(""); }}
              className="flex-1 py-2.5 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "guruh") ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🧸 Guruh
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("grupa"); setYangiGuruhTuri("togarak"); setYangiSinf(""); }}
              className="flex-1 py-2.5 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "grupa") ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🎓 Grupa
            </button>
            <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinfTuri("repetitor"); setYangiGuruhTuri("repetitor"); setYangiTuri("oddiy"); setYangiSinf(""); }}
              className="py-2.5 rounded-full text-xs font-semibold"
              style={(yangiMaxsusSinf && yangiSinfTuri === "repetitor") ? { backgroundColor: "#fff", color: "#28735A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
              🧑‍🏫 Repetitor
            </button>
          </div>
          {!yangiMaxsusSinf ? (
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {Array.from({ length: 11 }, (_, i) => String(i + 1)).map((n) => (
                <button key={n} type="button" onClick={() => setYangiSinf(n)}
                  className="py-2.5 rounded-lg border text-sm font-semibold text-center"
                  style={{
                    borderColor: yangiSinf === n ? "#1B4B7A" : "#E5E1D8",
                    backgroundColor: yangiSinf === n ? "#1B4B7A" : "#FFFFFF",
                    color: yangiSinf === n ? "#FFFFFF" : "#5A5648",
                  }}>
                  {n}
                </button>
              ))}
            </div>
          ) : (
            <>
              {togarakSinflariYuklanmoqda ? (
                <div className="py-3"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
              ) : togarakSinflari.length > 0 ? (
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {togarakSinflari.map((s) => (
                    <button key={s} type="button" onClick={() => setYangiSinfMatni(s)}
                      className="px-3 py-2 rounded-lg border text-sm font-medium"
                      style={{
                        borderColor: yangiSinfMatni === s ? "#1B4B7A" : "#E5E1D8",
                        backgroundColor: yangiSinfMatni === s ? "#1B4B7A" : "#FFFFFF",
                        color: yangiSinfMatni === s ? "#FFFFFF" : "#5A5648",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              {meningSinflarim.filter((s) => !togarakSinflari.includes(s)).length > 0 && (
                <>
                  <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>Avval o'zingiz yozgan {groupTypeLabel(yangiSinfTuri).toLowerCase()}lar:</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {meningSinflarim.filter((s) => !togarakSinflari.includes(s)).map((s) => (
                      <button key={s} type="button" onClick={() => setYangiSinfMatni(s)}
                        className="px-3 py-2 rounded-lg border text-sm font-medium"
                        style={{
                          borderColor: yangiSinfMatni === s ? "#1B4B7A" : "#E5E1D8",
                          backgroundColor: yangiSinfMatni === s ? "#1B4B7A" : "#FFFFFF",
                          color: yangiSinfMatni === s ? "#FFFFFF" : "#5A5648",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
                {(togarakSinflari.length > 0 || meningSinflarim.length > 0) ? `yoki yangi ${groupTypeLabel(yangiSinfTuri).toLowerCase()} nomini kiriting` : `${groupTypeLabel(yangiSinfTuri)} nomini kiriting`}
              </label>
              <input type="text" value={yangiSinfMatni} onChange={(e) => setYangiSinfMatni(e.target.value)}
                placeholder={yangiSinfTuri === "grupa" ? "masalan: 205-guruh, 3-kurs" : yangiSinfTuri === "repetitor" ? "masalan: IELTS B2 kechki guruh" : "masalan: Abituriyent, 3-4, IDUM tayyorlov"}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
                style={{ borderColor: "#E5E1D8" }} />
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Fan</label>
          {!(yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval sinfni tanlang</p>
          ) : yangiFanOzicha ? (
            <>
              {meningFanlarim.length > 0 && (
                <>
                  <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>Avval o'zingiz yozgan fanlar:</p>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {meningFanlarim.map((f) => (
                      <button key={f} type="button" onClick={() => setYangiFan(f)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                        style={{
                          borderColor: yangiFan === f ? "#1B4B7A" : "#E5E1D8",
                          backgroundColor: yangiFan === f ? "#1B4B7A" : "#FFFFFF",
                          color: yangiFan === f ? "#FFFFFF" : "#5A5648",
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input type="text" value={yangiFan} onChange={(e) => setYangiFan(e.target.value)}
                placeholder="Bitta so'z, masalan: Robototexnika"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
              <button type="button" onClick={() => { setYangiFanOzicha(false); setYangiFan(""); }}
                className="text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
                ← Ro'yxatdan tanlashga qaytish
              </button>
            </>
          ) : sinfFanlariYuklanmoqda ? (
            <div className="py-3 mb-2"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
          ) : (
            <>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {(sinfFanlari.length > 0 ? sinfFanlari : BARCHA_MAKTAB_FANLARI).map((f) => (
                  <button key={f} type="button" onClick={() => setYangiFan(f)}
                    className="px-3 py-2 rounded-lg border text-sm font-medium"
                    style={{
                      borderColor: yangiFan === f ? "#1B4B7A" : "#E5E1D8",
                      backgroundColor: yangiFan === f ? "#1B4B7A" : "#FFFFFF",
                      color: yangiFan === f ? "#FFFFFF" : "#5A5648",
                    }}>
                    {f}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setYangiFanOzicha(true); setYangiFan(""); }}
                className="text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
                Ro'yxatda yo'q fan — o'zim yozaman →
              </button>
            </>
          )}
          {sinfFanlari.length === 0 && (yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) && !sinfFanlariYuklanmoqda && !yangiFanOzicha && (
            <p className="text-xs -mt-2 mb-3" style={{ color: "#8A8578" }}>
              Bu guruh uchun hali mavzu/test yo'q — fan tanlansa, keyinroq shablon orqali test qo'shishingiz mumkin.
            </p>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Topik mavzu rejasi</label>
          <p className="text-xs mb-2" style={{ color: "#8A8578" }}>
            Reja — o'quvchi o'rganadigan mavzularning tartibli yo'li. Bir marta tuzib, boshqa guruhlarda ham qayta ishlatasiz.
          </p>
          {!(yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval sinfni tanlang</p>
          ) : !yangiFan ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval fanni tanlang</p>
          ) : yangiRejalarYuklanmoqda ? (
            <div className="py-3 mb-3"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
          ) : (
            <>
              {yangiMavjudRejalar.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {yangiMavjudRejalar.map((r) => (
                    <button key={r.id} type="button" onClick={() => setYangiTanlanganRejaId(r.id)}
                      className="w-full text-left rounded-xl p-3 border-2 flex items-center justify-between"
                      style={yangiTanlanganRejaId === r.id
                        ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }
                        : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
                      <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{r.nomi}</span>
                      <span className="text-xs shrink-0" style={{ color: "#8A8578" }}>{r.mavzu_soni} ta mavzu</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <input type="text" value={yangiRejaNomi} onChange={(e) => setYangiRejaNomi(e.target.value)}
                  placeholder="Yangi reja nomi, masalan: 9-sinf Algebra"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
                <button type="button" onClick={yangiRejaYaratishBoshla} disabled={yangiRejaYaratilmoqda || !yangiRejaNomi.trim()}
                  className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm shrink-0"
                  style={{ backgroundColor: "#1B4B7A", opacity: (yangiRejaYaratilmoqda || !yangiRejaNomi.trim()) ? 0.6 : 1 }}>
                  {yangiRejaYaratilmoqda ? "..." : "+ Yaratish"}
                </button>
              </div>
              {yangiMavjudRejalar.length === 0 && (
                <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Hali reja yo'q — yangi yarating, keyin mavzularni tartib bilan qo'shasiz.</p>
              )}
              {yangiTanlanganRejaId && (
                <p className="text-xs mb-3" style={{ color: "#3B6D11" }}>✓ Reja tanlandi — shu rejadagi mavzular avtomatik ulanadi.</p>
              )}
              {!yangiTanlanganRejaId && (
                <button type="button" onClick={() => setYangiTanlanganRejaId(null)} className="text-xs mb-3" style={{ color: "#8A8578" }}>
                  Hozircha rejasiz davom etaman →
                </button>
              )}
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Qo'shilish paroli (ixtiyoriy)</label>
          <input type="text" value={yangiParol} onChange={(e) => setYangiParol(e.target.value)}
            placeholder="o'quvchilar shu bilan qo'shiladi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maks. talaba</label>
              <input type="number" min="1" max={CLUB_STUDENT_LIMIT} value={yangiMaxTalaba} onChange={(e) => setYangiMaxTalaba(e.target.value)}
                placeholder={String(CLUB_STUDENT_LIMIT)}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: "#E5E1D8" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Oylik (so'm)</label>
              <input type="number" min="0" value={yangiOylikSumma} onChange={(e) => setYangiOylikSumma(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: "#E5E1D8" }} />
            </div>
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
            Universitet guruhi (ixtiyoriy — agar bu kursni ma'lum guruh uchun o'qitsangiz)
          </label>
          {tanlanganUniGuruh ? (
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3" style={{ borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }}>
              <span className="text-sm font-medium" style={{ color: "#1B4B7A" }}>
                🎓 {tanlanganUniGuruh.nomi}{tanlanganUniGuruh.kurs ? ` · ${tanlanganUniGuruh.kurs}-kurs` : ""}
              </span>
              <button onClick={() => setTanlanganUniGuruh(null)} className="text-xs font-medium" style={{ color: "#8A8578" }}>✕</button>
            </div>
          ) : (
            <div className="mb-3">
              <input type="text" value={uniGuruhIzlash} onChange={(e) => setUniGuruhIzlash(e.target.value)}
                placeholder="Guruh nomini yozing (masalan: 201-guruh)..."
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
              {uniGuruhNatijalar.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {uniGuruhNatijalar.map((g) => (
                    <button key={g.id} onClick={() => { setTanlanganUniGuruh(g); setUniGuruhIzlash(""); setUniGuruhNatijalar([]); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left" style={{ backgroundColor: "#F7F5F0" }}>
                      <span className="text-sm" style={{ color: "#2B2B2B" }}>{g.nomi}</span>
                      <span className="text-xs" style={{ color: "#8A8578" }}>{g.kafedra_nomi}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

          <button onClick={yaratishSaqla} disabled={yaratilmoqda || kvotaBloklangan}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: kvotaBloklangan ? "#B0AA98" : "#1B4B7A", opacity: yaratilmoqda ? 0.7 : 1 }}>
            {yaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : kvotaBloklangan ? `Ikkinchi guruh — ${SECOND_CLUB_PRICE_UZS.toLocaleString("uz-UZ")} so'm (tez orada)` : yangiGuruhTuri === "repetitor" ? "Repetitor guruhini yaratish" : "To'garak yaratish"}
          </button>
        </div>
      </div>
    );
  }

  if (holat === "azolar") {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("kalendar_reja")}
          className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Ortga</button>
        <h1 className="text-xl font-bold mb-3" style={{ color: "#2B2B2B" }}>{tanlangan.nomi}</h1>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setHolat("mavzular_boshqarish")} className="rounded-2xl bg-white border flex items-center gap-2.5 px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF3DE" }}>
              <BookOpen size={16} style={{ color: "#3B6D11" }} />
            </span>
            <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>Mavzular</span>
          </button>
          <button onClick={() => setHolat("sozlamalar")} className="rounded-2xl bg-white border flex items-center gap-2.5 px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FDF3E0" }}>
              <Settings size={16} style={{ color: "#8A5A1C" }} />
            </span>
            <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>Sozlamalar</span>
          </button>
        </div>
        {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

        {kutilayotganAzolar.length > 0 && (
          <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#FDF3E0", border: "1px solid #C89B3C" }}>
            <p className="text-xs font-bold mb-3" style={{ color: "#8A5A1C" }}>⏳ Kutilayotgan so'rovlar ({kutilayotganAzolar.length})</p>
            <div className="space-y-2">
              {kutilayotganAzolar.map((a) => (
                <div key={a.azolik_id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3.5 py-2.5">
                  <span className="text-sm font-medium truncate" style={{ color: "#2B2B2B" }}>{a.full_name}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => azoTasdiqla(a.azolik_id)} disabled={tanlanganGuruhToliq}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                      {tanlanganGuruhToliq ? `${tanlanganSigim}/${tanlanganSigim} — joy yo'q` : "✓ Tasdiqlash"}
                    </button>
                    <button onClick={() => azoRadEt(a.azolik_id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                      ✕ Rad etish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {azolar.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Bu to'garakda hali a'zo yo'q.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {azolar.map((a) => (
              <div key={a.user_id} className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "#E5E1D8" }}>
                <button onClick={() => (bahoQoyilayotgan === a.user_id ? setBahoQoyilayotgan(null) : bahoBoshla(a))}
                  className="w-full flex items-center justify-between px-4 py-3.5">
                  <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{a.full_name}</span>
                  <span className="text-sm font-semibold" style={{ color: a.oxirgi_baho != null ? "#2D8B8B" : "#B0AA98" }}>
                    {a.oxirgi_baho != null ? `${a.oxirgi_baho}` : "Baholanmagan"}
                  </span>
                </button>
                {bahoQoyilayotgan === a.user_id && (
                  <div className="px-4 pb-4 pt-1 space-y-2.5">
                    <select value={bahoTopicCode} onChange={(e) => setBahoTopicCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white"
                      style={{ borderColor: "#E5E1D8", color: bahoTopicCode ? "#2B2B2B" : "#8A8578" }}>
                      <option value="">Baholanayotgan mavzuni tanlang</option>
                      {bahoMavzulari.map((m, index) => (
                        <option key={m.topic_code} value={m.topic_code}>{formatTopicTitle(index, m)}</option>
                      ))}
                    </select>
                    <input type="number" min="0" max="100" value={bahoQiymati}
                      onChange={(e) => setBahoQiymati(e.target.value)}
                      placeholder="Baho (0-100)"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                      style={{ borderColor: "#E5E1D8" }} />
                    <input type="text" value={izohQiymati} onChange={(e) => setIzohQiymati(e.target.value)}
                      placeholder="Izoh (ixtiyoriy)"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                      style={{ borderColor: "#E5E1D8" }} />
                    <button onClick={() => bahoSaqla(a.user_id)}
                      className="w-full py-2.5 rounded-xl font-semibold text-white text-sm"
                      style={{ backgroundColor: "#1B4B7A" }}>
                      Saqlash
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (holat === "kalendar_reja") {
    return (
      <TogarakKalendarReja token={token} togarakId={tanlangan.id} togarakNomi={tanlangan.nomi}
        onOrtga={() => { setHolat("togaraklar"); setTanlangan(null); setBahoQoyilayotgan(null); }}
        onAzolar={() => setHolat("azolar")}
        onMavzular={() => setHolat("mavzular_boshqarish")}
        onSozlamalar={() => setHolat("sozlamalar")} />
    );
  }

  if (holat === "mavzular_boshqarish") {
    return <TogarakMavzularBoshqarish token={token} togarakId={tanlangan.id} onOrtga={() => setHolat("kalendar_reja")} />;
  }

  if (holat === "sozlamalar") {
    return <TogarakGuruhSozlamalari token={token} togarak={tanlangan} onOrtga={() => setHolat("kalendar_reja")} onOchirildi={() => window.location.reload()} />;
  }

  // holat === "togaraklar"
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Dars guruhlarim</h1>
        <button onClick={() => yaratishniOch()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: "#C89B3C" }}>
          + Yangi
        </button>
      </div>

      {samariMuassasalar.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {samariMuassasalar.map((m, idx) => (
            <button key={`${m.turi}-${m.muassasa_id}`} onClick={() => setAktivMuassasaIdx(idx)}
              className="shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap"
              style={idx === aktivMuassasaIdx ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
              {MUASSASA_IKONKA[m.turi] || "📍"} {m.muassasa_nomi || (m.turi === "maktab" ? "Maktabim" : m.turi === "markaz" ? "Markazim" : m.turi === "bogcha" ? "Bog'cham" : "Institutim")}
            </button>
          ))}
        </div>
      )}

      {(() => {
        const bandlar = [];
        const muassasaBandi = {
          maktab: { kalit: "maktab_workspace", nom: "Maktab ish maydoni", ikon: Building2, fon: "#E8F2FF", rang: "#185FA5" },
          markaz: { kalit: "markaz_workspace", nom: "Markaz ish maydoni", ikon: GraduationCap, fon: "#E7F7EE", rang: "#167D4A" },
          bogcha: { kalit: "bogcha_workspace", nom: "Bog‘cha ish maydoni", ikon: Baby, fon: "#FFF0F4", rang: "#B53B67" },
          universitet: { kalit: "institut_workspace", nom: "Institut ish maydoni", ikon: GraduationCap, fon: "#F1EEFF", rang: "#6146A5" },
        }[aktivMuassasa?.turi];
        if (muassasaBandi) bandlar.push(muassasaBandi);

        if (aktivMuassasa?.turi === "maktab" && MUASSASA_BOSHQARUVCHI_LAVOZIM.maktab.includes(aktivMuassasa.lavozim)) {
          bandlar.push(
            { kalit: "kutubxona", nom: "Kutubxona", ikon: BookOpen, fon: "#EAF3DE", rang: "#3B6D11" },
            { kalit: "moliya", nom: "Moliya", ikon: Wallet, fon: "#FDF3E0", rang: "#8A5A1C" },
            { kalit: "hujjatlar", nom: "Hujjatlar", ikon: Folder, fon: "#F3EEFA", rang: "#8B5FBF" },
            { kalit: "rejalashtirish", nom: "Rejalashtirish", ikon: Calendar, fon: "#EAF1F7", rang: "#1B4B7A" },
            { kalit: "fanlar_tahlili", nom: "Fanlar tahlili", ikon: BarChart3, fon: "#FCEBEB", rang: "#A32D2D" },
          );
        }
        if (aktivMuassasa?.turi === "maktab" && aktivMuassasa.lavozim === "psixolog") {
          bandlar.push({ kalit: "psixolog", nom: "Psixolog", ikon: Brain, fon: "#F3EEFA", rang: "#8B5FBF" });
        }
        bandlar.push(
          {
            kalit: "muassasa_v17",
            nom: "Yangi muassasa",
            ikon: Building2,
            fon: "#E7F7F4",
            rang: "#087F79",
          },
          {
            kalit: "repetitor_workspace",
            nom: "Repetitorlik ochish",
            ikon: UserRoundPlus,
            fon: "#FFF4DF",
            rang: "#A05A00",
            amal: () => yaratishniOch({ guruhTuri: "repetitor", guruhMaqsadi: "repetitor" }),
          },
          { kalit: "oqituvchi_analitika", nom: "Statistikalar", ikon: BarChart3, fon: "#EAF1F7", rang: "#1B4B7A" },
          { kalit: "rejalarim", nom: "Rejalarim", ikon: ClipboardList, fon: "#EAF3DE", rang: "#3B6D11" },
          { kalit: "ai_yordamchi", nom: "AI Yordamchi", ikon: Bot, fon: "#F3EEFA", rang: "#8B5FBF" },
          { kalit: "ai_dars", nom: "AI Ochiq dars", ikon: Brain, fon: "#F3EEFA", rang: "#8B5FBF" },
          { kalit: "ai_togarak", nom: "AI To'garak reja", ikon: GraduationCap, fon: "#EEF7F5", rang: "#246D6D" },
        );
        return (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {bandlar.map((b) => (
              <button key={b.kalit} onClick={() => (b.amal ? b.amal() : setKorinish(b.kalit))}
                className="rounded-2xl bg-white border flex items-center gap-2.5 px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: b.fon }}>
                  <b.ikon size={16} style={{ color: b.rang }} />
                </span>
                <span className="text-xs font-semibold text-left" style={{ color: "#2B2B2B" }}>{b.nom}</span>
              </button>
            ))}
          </div>
        );
      })()}
      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {togaraklar.length === 0 ? (
        <button onClick={() => yaratishniOch()}
          className="w-full rounded-2xl p-8 text-center border-2 border-dashed"
          style={{ borderColor: "#C4BFAF" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "#5A5648" }}>Hali to'garagingiz yo'q</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Bosib, birinchisini yarating</p>
        </button>
      ) : (
        <div className="space-y-2.5">
          {togaraklar.map((t) => (
            <button key={t.id} onClick={() => togarakOch(t)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-white border text-left"
              style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{t.nomi}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{groupTypeLabel(t.guruh_turi)} · {t.fan}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                {t.azo_soni || 0}/{normalizedClubCapacity(t.max_talaba)} o‘quvchi
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5.5) OTA-ONA — farzand(lar)ning bilim darajasi
// ═══════════════════════════════════════════════════════════
function OtaOnaTab({ token, foydalanuvchi, rang }) {
  const [farzandlar, setFarzandlar] = useState([]);
  const [tanlanganBola, setTanlanganBola] = useState(null);
  const [bilimData, setBilimData] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [korinish, setKorinish] = useState("bilim"); // "bilim" | "ai_yordamchi" | "sogliq"
  const [sogliq, setSogliq] = useState(null);
  const [allergiyalar, setAllergiyalar] = useState("");
  const [qonGuruhi, setQonGuruhi] = useState("");
  const [aloqaIsmi, setAloqaIsmi] = useState("");
  const [aloqaTelefoni, setAloqaTelefoni] = useState("");
  const [boshqaEslatma, setBoshqaEslatma] = useState("");
  const [sogliqSaqlanmoqda, setSogliqSaqlanmoqda] = useState(false);
  const [sogliqSaqlandi, setSogliqSaqlandi] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/ota/${foydalanuvchi.user_id}/farzandlar`)
      .then((r) => r.json())
      .then((d) => {
        const royxat = d.farzandlar || [];
        setFarzandlar(royxat);
        if (royxat.length > 0) setTanlanganBola((oldin) => oldin || royxat[0].user_id);
        setYuklanmoqda(false);
      })
      .catch(() => { setXato("Farzandlar ro'yxatini yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [foydalanuvchi.user_id]);

  useEffect(() => {
    if (!tanlanganBola) return;
    setBilimData(null);
    fetch(`${API_BASE}/api/bola/${tanlanganBola}/bilim`)
      .then((r) => r.json())
      .then((d) => setBilimData(d))
      .catch(() => setBilimData(null));
    fetch(`${API_BASE}/api/bola/${tanlanganBola}/favqulodda_malumot?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setSogliq(d);
        setAllergiyalar(d.allergiyalar || ""); setQonGuruhi(d.qon_guruhi || "");
        setAloqaIsmi(d.aloqa_ismi || ""); setAloqaTelefoni(d.aloqa_telefoni || ""); setBoshqaEslatma(d.boshqa_eslatma || "");
      })
      .catch(() => {});
  }, [tanlanganBola, token]);

  const sogliqSaqla = async () => {
    setSogliqSaqlanmoqda(true); setSogliqSaqlandi(false);
    try {
      await fetch(`${API_BASE}/api/bola/favqulodda_malumot`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, bola_user_id: tanlanganBola, allergiyalar: allergiyalar || undefined, qon_guruhi: qonGuruhi || undefined,
          aloqa_ismi: aloqaIsmi || undefined, aloqa_telefoni: aloqaTelefoni || undefined, boshqa_eslatma: boshqaEslatma || undefined,
        }),
      });
      setSogliqSaqlandi(true);
    } finally { setSogliqSaqlanmoqda(false); }
  };

  if (farzandlar.length === 0 && !yuklanmoqda) {
    return (
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Farzandim</h1>
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "#2B2B2B" }}>Hali farzand ulanmagan</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Profil bo'limidan farzandingizning kodi bilan ulang.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Farzandim</h1>
        {farzandlar.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {farzandlar.map((f) => (
              <button key={f.user_id} onClick={() => setTanlanganBola(f.user_id)}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={tanlanganBola === f.user_id
                  ? { backgroundColor: "#1B4B7A", color: "#fff" }
                  : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                {f.full_name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button onClick={() => setKorinish(korinish === "ai_yordamchi" ? "bilim" : "ai_yordamchi")}
            className="rounded-2xl bg-white border flex items-center gap-2.5 px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#F3EEFA" }}>
              {korinish === "ai_yordamchi" ? <ChevronLeft size={16} style={{ color: "#8B5FBF" }} strokeWidth={2.5} /> : <Bot size={16} style={{ color: "#8B5FBF" }} />}
            </span>
            <span className="text-xs font-semibold text-left" style={{ color: "#2B2B2B" }}>{korinish === "ai_yordamchi" ? "Orqaga" : "AI Yordamchi"}</span>
          </button>
          <button onClick={() => setKorinish(korinish === "sogliq" ? "bilim" : "sogliq")}
            className="rounded-2xl bg-white border flex items-center gap-2.5 px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FCEBEB" }}>
              {korinish === "sogliq" ? <ChevronLeft size={16} style={{ color: "#A32D2D" }} strokeWidth={2.5} /> : <AlertTriangle size={16} style={{ color: "#A32D2D" }} />}
            </span>
            <span className="text-xs font-semibold text-left" style={{ color: "#2B2B2B" }}>{korinish === "sogliq" ? "Orqaga" : "Favqulodda"}</span>
          </button>
        </div>

        {korinish !== "ai_yordamchi" && korinish !== "sogliq" && (
          <div className="rounded-xl px-4 py-3 mb-1 flex items-start gap-2.5" style={{ backgroundColor: "#EAF1F7" }}>
            <span className="text-base shrink-0">💡</span>
            <p className="text-xs" style={{ color: "#1B4B7A" }}>
              Bu yerda farzandingizning <b>bilim darajasini</b>, har fan bo'yicha <b>ta'lim yo'lini</b> (qaysi
              mavzular o'tilgan, qaysilari qolgan) va agar to'garakka a'zo bo'lsa — <b>to'garak yutuqlarini</b> ham
              kuzatib borishingiz mumkin. Yana farzand qo'shish yoki ulanishni uzish uchun — Profil bo'limiga o'ting.
            </p>
          </div>
        )}
      </div>
      {korinish === "ai_yordamchi" ? (
        <AiYordamchiBolimi token={token} onOrtga={() => setKorinish("bilim")} />
      ) : korinish === "sogliq" ? (
        <div className="px-5 pb-4">
          <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
            Bu ma'lumot favqulodda holatda maktab xodimlariga tezkor ko'rinadi (sinf rahbari, rahbariyat).
          </p>
          <div className="rounded-2xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Allergiyalar</label>
            <input type="text" value={allergiyalar} onChange={(e) => setAllergiyalar(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Qon guruhi</label>
            <input type="text" value={qonGuruhi} onChange={(e) => setQonGuruhi(e.target.value)} placeholder="masalan A+"
              className="w-full px-3 py-2.5 rounded-lg border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Favqulodda aloqa ismi</label>
            <input type="text" value={aloqaIsmi} onChange={(e) => setAloqaIsmi(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Favqulodda aloqa telefoni</label>
            <input type="text" value={aloqaTelefoni} onChange={(e) => setAloqaTelefoni(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5648" }}>Boshqa muhim eslatma</label>
            <input type="text" value={boshqaEslatma} onChange={(e) => setBoshqaEslatma(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            {sogliqSaqlandi && <p className="text-xs mb-2" style={{ color: "#3B6D11" }}>✅ Saqlandi</p>}
            <button onClick={sogliqSaqla} disabled={sogliqSaqlanmoqda}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: sogliqSaqlanmoqda ? 0.7 : 1 }}>
              {sogliqSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      ) : yuklanmoqda ? (
        <div className="px-5 pt-10 text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#1B4B7A" }} />
        </div>
      ) : xato ? (
        <p className="px-5 text-sm" style={{ color: "#B0553A" }}>{xato}</p>
      ) : tanlanganBola ? (
        <BilimMarkazi
          token={token}
          data={bilimData}
          bolaId={tanlanganBola}
          viewer="parent"
          rang={rang}
          otaOnaUchun
          analyticsCompact
        />
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6) PROFIL — tahrirlash va rol almashtirish
// ═══════════════════════════════════════════════════════════
function ProfileAccordion({ icon, title, summary, children, nested = false }) {
  const [ochiq, setOchiq] = useState(false);
  return (
    <details
      className={`${nested ? "rounded-xl" : "rounded-2xl shadow-sm"} bg-white border mb-3 overflow-visible`}
      style={{ borderColor: "#E5E1D8" }}
      onToggle={(event) => setOchiq(event.currentTarget.open)}
    >
      <summary
        className={`${nested ? "px-3.5 py-3" : "px-4 py-3.5"} flex items-center gap-3 cursor-pointer select-none [&::-webkit-details-marker]:hidden`}
        style={{ listStyle: "none" }}
      >
        <span className={`${nested ? "w-8 h-8" : "w-10 h-10"} rounded-xl flex items-center justify-center shrink-0 text-base`} style={{ backgroundColor: "#F7F5F0" }}>{icon}</span>
        <span className="flex-1 min-w-0">
          <b className="block text-sm" style={{ color: "#2B2B2B" }}>{title}</b>
          {summary && <small className="block text-[11px] mt-0.5 truncate" style={{ color: "#8A8578" }}>{summary}</small>}
        </span>
        <ChevronDown size={17} className="shrink-0 transition-transform" style={{ color: "#8A8578", transform: ochiq ? "rotate(180deg)" : "none" }} />
      </summary>
      <div className={`${nested ? "px-3.5 pb-3.5" : "px-4 pb-4"} border-t pt-3`} style={{ borderColor: "#F0ECE3" }}>
        {ochiq ? children : null}
      </div>
    </details>
  );
}

function ProfilTab({ token, foydalanuvchi, onYangilandi, adminKorinish, onKorinishOzgar, rang }) {
  const profilRangi = rang || "#1B4B7A";
  const [ism, setIsm] = useState(foydalanuvchi?.full_name || "");
  const [rasmVersiyasi, setRasmVersiyasi] = useState(0); // yuklangach rasmni qayta so'ratish uchun
  const [rasmYuklanmoqda, setRasmYuklanmoqda] = useState(false);
  const [rasmXato, setRasmXato] = useState("");
  const rasmInputRef = useRef(null);
  const otaOnaKartaRef = useRef(null);

  const rasmTanlandi = async (e) => {
    const fayl = e.target.files?.[0];
    if (!fayl) return;
    setRasmYuklanmoqda(true); setRasmXato("");
    try {
      const forma = new FormData();
      forma.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/profil_rasm_yukla?token=${encodeURIComponent(token)}`, {
        method: "POST", body: forma,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onYangilandi({ ...foydalanuvchi, rasm_bormi: true });
      setRasmVersiyasi((v) => v + 1);
    } catch (err) {
      setRasmXato(err.message);
    } finally { setRasmYuklanmoqda(false); }
  };

  const [viloyat, setViloyat] = useState(foydalanuvchi?.region || "");
  const [tuman, setTuman] = useState(foydalanuvchi?.district || "");
  const [tugilganSana, setTugilganYil] = useState(foydalanuvchi?.tugilgan_sana || "");
  const [maktabRaqami, setMaktabRaqami] = useState(foydalanuvchi?.maktab_raqami || "");
  const [royxatdagiMaktab, setRoyxatdagiMaktab] = useState(
    foydalanuvchi?.maktab_id && foydalanuvchi?.maktab_nomi ? { id: foydalanuvchi.maktab_id, nomi: foydalanuvchi.maktab_nomi } : null
  );
  const [maktabTuri, setMaktabTuri] = useState(foydalanuvchi?.maktab_turi_kaliti || "oddiy");
  const [sinfSozlamalariOchiq, setSinfSozlamalariOchiq] = useState(false);
  const [sinf, setSinf] = useState(foydalanuvchi?.class ? String(foydalanuvchi.class).replace(/-sinf$/i, "") : "");
  const [sinfHarfi, setSinfHarfi] = useState(foydalanuvchi?.class_letter || "");
  const [jins, setJins] = useState(foydalanuvchi?.jins || "");
  const [asosiyTil, setAsosiyTil] = useState(_ovozTiliniTuzat(foydalanuvchi?.asosiy_til || "uz"));
  const [ovozJinsi, setOvozJinsi] = useState(_ovozJinsiniTuzat(foydalanuvchi?.ovoz_jinsi || foydalanuvchi?.jins || "qiz"));
  const [oqituvchiFani, setOqituvchiFani] = useState(foydalanuvchi?.oqituvchi_fani || "");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [muvaffaqiyat, setMuvaffaqiyat] = useState(false);
  const [rolTanlov, setRolTanlov] = useState(null);
  const [rolOzgartirilmoqda, setRolOzgartirilmoqda] = useState(false);
  const [rolSurishNatija, setRolSurishNatija] = useState(null); // {holat, qolgan_bepul, admin_test} | "yuklanmoqda" | null
  const [kodBosqichida, setKodBosqichida] = useState(false);
  const [kodEmail, setKodEmail] = useState("");
  const [kodQiymati, setKodQiymati] = useState("");
  const [kodYuklanmoqda, setKodYuklanmoqda] = useState(false);
  const [korinish, setKorinish] = useState("profil"); // "profil" | "rasmiy_sinf" | "kirish_kodi" | "togarak_mavzular" | "mening_kalendarim"
  const [tanlanganTogarak, setTanlanganTogarak] = useState(null);
  const [ochiladiganTopicCode, setOchiladiganTopicCode] = useState(null);

  const [otaKod, setOtaKod] = useState(null); // {kod, amal_qilish_daqiqasi} | null
  const [otaKodOlinmoqda, setOtaKodOlinmoqda] = useState(false);
  const [otaKodXato, setOtaKodXato] = useState("");
  const [otaOnalarim, setOtaOnalarim] = useState([]); // allaqachon ulangan ota-onalar

  useEffect(() => {
    if (foydalanuvchi?.role !== "oquvchi") return;
    fetch(`${API_BASE}/api/oquvchi/ota_onalarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setOtaOnalarim(d.ota_onalar || []))
      .catch(() => {});
  }, [foydalanuvchi?.role, token]);

  const [farzandlar, setFarzandlar] = useState([]);
  const [farzandKodi, setFarzandKodi] = useState("");
  const [farzandQoshilmoqda, setFarzandQoshilmoqda] = useState(false);
  const [farzandXato, setFarzandXato] = useState("");
  const [farzandMuvaffaqiyat, setFarzandMuvaffaqiyat] = useState("");

  const farzandlarniYukla = () => {
    fetch(`${API_BASE}/api/ota/${foydalanuvchi.user_id}/farzandlar`)
      .then((r) => r.json())
      .then((d) => setFarzandlar(d.farzandlar || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (foydalanuvchi?.role === "ota-ona") farzandlarniYukla();
  }, [foydalanuvchi?.role, foydalanuvchi?.user_id]);

  const farzandQoshish = async () => {
    if (!farzandKodi.trim()) return;
    setFarzandQoshilmoqda(true); setFarzandXato(""); setFarzandMuvaffaqiyat("");
    try {
      const res = await fetch(`${API_BASE}/api/ota/farzand_boglash?token=${encodeURIComponent(token)}&kod=${encodeURIComponent(farzandKodi.trim())}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setFarzandMuvaffaqiyat(data.holat === "allaqachon_ulangan" ? "Bu farzand allaqachon ulangan" : `✓ ${data.farzand_ismi} ulandi`);
      setFarzandKodi("");
      farzandlarniYukla();
    } catch (e) {
      setFarzandXato(e.message);
    } finally { setFarzandQoshilmoqda(false); }
  };

  const farzandniUzish = async (bolaId) => {
    try {
      await fetch(`${API_BASE}/api/ota/farzand_uzish?token=${encodeURIComponent(token)}&farzand_id=${bolaId}`, { method: "DELETE" });
      setFarzandlar((prev) => prev.filter((f) => f.user_id !== bolaId));
    } catch { /* jim */ }
  };

  const otaKodOl = async () => {
    setOtaKodOlinmoqda(true); setOtaKodXato("");
    try {
      const res = await fetch(`${API_BASE}/api/farzand/kod_yarat?token=${encodeURIComponent(token)}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setOtaKod(data);
    } catch (e) {
      setOtaKodXato(e.message);
    } finally { setOtaKodOlinmoqda(false); }
  };

  const [togaraklarim, setTogaraklarim] = useState([]);
  const [togaraklarYuklanmoqda, setTogaraklarYuklanmoqda] = useState(true);
  const [qoshilishParol, setQoshilishParol] = useState("");
  const [qoshilinmoqda, setQoshilinmoqda] = useState(false);
  const [qoshilishXato, setQoshilishXato] = useState("");
  const [qoshilishMuvaffaqiyat, setQoshilishMuvaffaqiyat] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/mening_togaraklarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setTogaraklarim(d.togaraklar || []); setTogaraklarYuklanmoqda(false); })
      .catch(() => setTogaraklarYuklanmoqda(false));
  }, [token]);

  const togarakkaQoshil = async () => {
    if (!qoshilishParol.trim()) return;
    setQoshilinmoqda(true); setQoshilishXato(""); setQoshilishMuvaffaqiyat("");
    try {
      const res = await fetch(`${API_BASE}/api/togarakka_qoshil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, parol: qoshilishParol.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setTogaraklarim((prev) => [...prev, { id: Date.now(), nomi: data.togarak_nomi, fan: "", tasdiqlangan: false }]);
      setQoshilishMuvaffaqiyat(`"${data.togarak_nomi}" — so'rovingiz yuborildi, o'qituvchi tasdiqlashini kuting.`);
      setQoshilishParol("");
      setTimeout(() => setQoshilishMuvaffaqiyat(""), 5000);
    } catch (e) {
      setQoshilishXato(e.message);
    } finally { setQoshilinmoqda(false); }
  };

  const profilSaqla = async () => {
    setSaqlanmoqda(true); setXato(""); setMuvaffaqiyat(false);
    try {
      const res = await fetch(`${API_BASE}/api/profil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, full_name: ism, region: viloyat, district: tuman,
          tugilgan_sana: tugilganSana || undefined,
          maktab_raqami: maktabRaqami || undefined,
          maktab_turi: foydalanuvchi?.role === "oquvchi" ? maktabTuri : undefined,
          sinf: foydalanuvchi?.role === "oquvchi" && sinf ? sinf : undefined,
          sinf_harfi: foydalanuvchi?.role === "oquvchi" && sinfHarfi ? sinfHarfi : undefined,
          jins: (foydalanuvchi?.role === "oquvchi" || foydalanuvchi?.role === "oqituvchi") && jins ? jins : undefined,
          oqituvchi_fani: foydalanuvchi?.role === "oqituvchi" && oqituvchiFani ? oqituvchiFani : undefined,
          asosiy_til: asosiyTil,
          ovoz_jinsi: ovozJinsi,
          maktab_id: royxatdagiMaktab ? royxatdagiMaktab.id : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onYangilandi({
        ...foydalanuvchi, full_name: ism, region: viloyat, district: tuman,
        tugilgan_sana: tugilganSana, maktab_raqami: maktabRaqami,
        maktab_turi_kaliti: maktabTuri, class: sinf, class_letter: sinfHarfi,
        jins, oqituvchi_fani: oqituvchiFani, asosiy_til: asosiyTil, ovoz_jinsi: ovozJinsi,
        maktab_id: royxatdagiMaktab ? royxatdagiMaktab.id : foydalanuvchi?.maktab_id,
        maktab_nomi: royxatdagiMaktab ? royxatdagiMaktab.nomi : foydalanuvchi?.maktab_nomi,
      });
      setMuvaffaqiyat(true);
      setTimeout(() => setMuvaffaqiyat(false), 2500);
    } catch (e) {
      setXato(e.message);
    } finally { setSaqlanmoqda(false); }
  };

  const rolModalniYop = () => {
    setRolTanlov(null); setRolSurishNatija(null); setKodBosqichida(false);
    setKodQiymati(""); setKodEmail(""); setXato("");
  };

  // Rol tugmasi bosilganda — darhol o'zgartirmaymiz, avval holatni so'raymiz
  // (nechta bepul imkoniyat qolgani, yoki kod kerakligini bilish uchun).
  const rolTanlandi = async (v) => {
    if (v === foydalanuvchi?.role) return;
    setRolTanlov(v);
    setRolSurishNatija("yuklanmoqda");
    setKodBosqichida(false); setKodQiymati(""); setKodEmail(""); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/rol_ozgartir`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yangi_rol: v, tasdiqlayman: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setRolSurishNatija(data);
      if (data.holat === "kod_kerak") setKodBosqichida(true);
    } catch (e) {
      setXato(e.message); setRolTanlov(null); setRolSurishNatija(null);
    }
  };

  const rolTasdiqla = async () => {
    setRolOzgartirilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/rol_ozgartir`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yangi_rol: rolTanlov, tasdiqlayman: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      if (data.holat === "kod_kerak") {
        setKodBosqichida(true);
        await kodSora();
      } else {
        onYangilandi({ ...foydalanuvchi, role: rolTanlov });
        rolModalniYop();
      }
    } catch (e) {
      setXato(e.message);
    } finally { setRolOzgartirilmoqda(false); }
  };

  const kodSora = async () => {
    setKodYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/rol_kod_yubor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, yangi_rol: rolTanlov }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      if (data.holat === "smtp_sozlanmagan") setXato("Email yuborish hozircha sozlanmagan — administratorga murojaat qiling");
      else setKodEmail(data.email);
    } catch (e) {
      setXato(e.message);
    } finally { setKodYuklanmoqda(false); }
  };

  const kodTasdiqla = async () => {
    if (!kodQiymati.trim()) return;
    setRolOzgartirilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/rol_kod_tasdiqla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kod: kodQiymati.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onYangilandi({ ...foydalanuvchi, role: data.yangi_rol });
      rolModalniYop();
    } catch (e) {
      setXato(e.message);
    } finally { setRolOzgartirilmoqda(false); }
  };

  const rolNomlari = { oquvchi: "O'quvchi", "ota-ona": "Ota-ona", oqituvchi: "O'qituvchi" };

  if (korinish === "rasmiy_sinf") {
    return <RasmiySinflarim token={token} onOrtga={() => setKorinish("profil")} />;
  }
  if (korinish === "kirish_kodi") {
    return <KirishKodiFormasi token={token} onOrtga={() => setKorinish("profil")} />;
  }
  if (korinish === "mening_kalendarim") {
    return (
      <MeningKalendarim token={token} togarak={tanlanganTogarak}
        onOrtga={() => setKorinish(tanlanganTogarak?.turi === "avto" ? "profil" : "togarak_mavzular")}
        onMavzuOchish={(topicCode) => { setOchiladiganTopicCode(topicCode); setKorinish("togarak_mavzular"); }} />
    );
  }
  if (korinish === "togarak_mavzular") {
    return (
      <TogarakAzoMavzulari token={token} togarak={tanlanganTogarak} onOrtga={() => setKorinish("profil")}
        onKalendar={() => setKorinish("mening_kalendarim")}
        ochiladiganTopicCode={ochiladiganTopicCode} ochilganiBildir={() => setOchiladiganTopicCode(null)}
        foydalanuvchi={foydalanuvchi} />
    );
  }

  return (
    <div className="pb-4">
      <div className="relative px-5 pt-8 pb-12 mb-3 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${profilRangi} 0%, ${profilRangi}CC 100%)` }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div className="absolute right-10 bottom-0 w-16 h-16 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => rasmInputRef.current?.click()} disabled={rasmYuklanmoqda}
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", border: "2px solid rgba(255,255,255,0.35)" }}>
              {foydalanuvchi?.rasm_bormi ? (
                <img src={`${API_BASE}/api/profil_rasm/${foydalanuvchi.user_id}?v=${rasmVersiyasi}`} alt="" className="w-full h-full object-cover" />
              ) : (ism || "?").trim().slice(0, 1).toUpperCase()}
              <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-semibold py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.4)", color: "#fff" }}>
                {rasmYuklanmoqda ? "..." : "✏️"}
              </span>
            </button>
            <input ref={rasmInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={rasmTanlandi} className="hidden" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate" style={{ color: "#fff" }}>{ism || "Profil"}</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                {foydalanuvchi?.is_admin ? "🛠 Admin" : rolNomlari[foydalanuvchi?.role] || "Foydalanuvchi"}
                {foydalanuvchi?.role === "oquvchi" && sinf ? ` · ${sinf}${sinfHarfi ? `-${sinfHarfi}` : ""}-sinf` : ""}
              </p>
            </div>
          </div>
          {foydalanuvchi?.role === "oquvchi" && (
            <button type="button" onClick={() => otaOnaKartaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: profilRangi }}>
                {otaOnalarim[0]?.rasm_bormi ? (
                  <img src={`${API_BASE}/api/profil_rasm/${otaOnalarim[0].user_id}`} alt="" className="w-full h-full object-cover" />
                ) : otaOnalarim[0] ? otaOnalarim[0].full_name.trim().slice(0, 1).toUpperCase() : "👤"}
              </span>
              <span className="text-xs font-medium" style={{ color: "#fff" }}>{otaOnalarim[0] ? otaOnalarim[0].full_name.split(" ")[0] : "Ulash"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 -mt-8">
      {rasmXato && <p className="text-xs mb-3" style={{ color: "#B0553A" }}>{rasmXato}</p>}

      <ProfileAccordion icon="⚙️" title="Profil sozlamalari" summary="Shaxsiy ma'lumot, maktab, fan, dizayn, ovoz va til">
      <ProfileAccordion nested icon="👤" title="Shaxsiy ma'lumotlar" summary="Ism, tug'ilgan sana va hudud">
      <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "#5A5648" }}>👤 Shaxsiy ma'lumotlar</p>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ism</label>
            <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8" }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Viloyat</label>
            <select value={viloyat} onChange={(e) => { setViloyat(e.target.value); setTuman(""); }}
              className="w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8" }}>
              <option value="">—</option>
              {VILOYATLAR.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tug'ilgan sana</label>
            <input type="date" value={tugilganSana} onChange={(e) => setTugilganYil(e.target.value)}
              min="1950-01-01" max={new Date().toISOString().split("T")[0]}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8" }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
            <select value={tuman} onChange={(e) => setTuman(e.target.value)} disabled={!viloyat}
              className="w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8", opacity: viloyat ? 1 : 0.5 }}>
              <option value="">—</option>
              {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
      </ProfileAccordion>

      {foydalanuvchi?.role === "oquvchi" && (
        <ProfileAccordion nested icon="🏫" title="Maktab va sinf" summary={sinf ? `${sinf}${sinfHarfi ? `-${sinfHarfi}` : ""}-sinf` : "Sinf tanlanmagan"}>
        <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "#5A5648" }}>🏫 Maktab ma'lumotlari</p>

          <button type="button" onClick={() => setSinfSozlamalariOchiq(!sinfSozlamalariOchiq)}
            className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 mb-3" style={{ backgroundColor: "#F7F5F0" }}>
            <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>
              {[["oddiy", "🏫 Oddiy"], ["xususiy", "🏢 Xususiy"], ["ixtisoslashgan", "⭐ IDUM"], ["prezident", "🏆 Prezident"]].find(([k]) => k === maktabTuri)?.[1] || "Maktab turi"}
              {sinf ? ` · ${sinf}${sinfHarfi ? `-${sinfHarfi}` : ""}-sinf` : " · sinf tanlanmagan"}
            </span>
            <ChevronDown size={16} className="shrink-0 transition-transform" style={{ color: "#8A8578", transform: sinfSozlamalariOchiq ? "rotate(180deg)" : "none" }} />
          </button>

          {sinfSozlamalariOchiq && (
            <>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {[
                  ["oddiy", "🏫 Oddiy"], ["xususiy", "🏢 Xususiy"],
                  ["ixtisoslashgan", "⭐ IDUM"], ["prezident", "🏆 Prezident"],
                ].map(([kalit, nom]) => (
                  <button key={kalit} type="button" onClick={() => setMaktabTuri(kalit)}
                    className="py-2 rounded-lg border text-xs font-medium text-center"
                    style={{
                      borderColor: maktabTuri === kalit ? "#1B4B7A" : "#E5E1D8",
                      backgroundColor: maktabTuri === kalit ? "#1B4B7A" : "#FFFFFF",
                      color: maktabTuri === kalit ? "#FFFFFF" : "#5A5648",
                    }}>
                    {nom}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 11 }, (_, i) => String(i + 1)).map((n) => (
                      <button key={n} type="button" onClick={() => setSinf(n)}
                        className="py-2 rounded-lg border text-sm font-semibold text-center"
                        style={{
                          borderColor: sinf === n ? "#1B4B7A" : "#E5E1D8",
                          backgroundColor: sinf === n ? "#1B4B7A" : "#FFFFFF",
                          color: sinf === n ? "#FFFFFF" : "#5A5648",
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf harfi</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SINF_HARFLARI.map((h) => (
                      <button key={h} type="button" onClick={() => setSinfHarfi(sinfHarfi === h ? "" : h)}
                        className="py-2 rounded-lg border text-sm font-semibold text-center"
                        style={{
                          borderColor: sinfHarfi === h ? "#C89B3C" : "#E5E1D8",
                          backgroundColor: sinfHarfi === h ? "#C89B3C" : "#FFFFFF",
                          color: sinfHarfi === h ? "#FFFFFF" : "#5A5648",
                        }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ro'yxatdagi maktab (bo'lsa — tanlang, aniqroq bo'ladi)</label>
          <MaktabQidiruvi tanlanganMaktab={royxatdagiMaktab} onTanla={setRoyxatdagiMaktab} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maktab raqami</label>
          <input type="text" value={maktabRaqami} onChange={(e) => setMaktabRaqami(e.target.value)}
            placeholder="masalan: 21"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <label className="text-xs font-medium mb-1.5 mt-3 block" style={{ color: "#5A5648" }}>Dizayn uchun (ixtiyoriy)</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setJins(jins === "ogil" ? "" : "ogil")}
              className="py-3 rounded-xl border-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5"
              style={{
                borderColor: jins === "ogil" ? OGIL_RANGI : "#E5E1D8",
                backgroundColor: jins === "ogil" ? OGIL_RANGI : "#FFFFFF",
                color: jins === "ogil" ? "#FFFFFF" : "#5A5648",
              }}>
              👦 O'g'il
            </button>
            <button type="button" onClick={() => setJins(jins === "qiz" ? "" : "qiz")}
              className="py-3 rounded-xl border-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5"
              style={{
                borderColor: jins === "qiz" ? QIZ_RANGI : "#E5E1D8",
                backgroundColor: jins === "qiz" ? QIZ_RANGI : "#FFFFFF",
                color: jins === "qiz" ? "#FFFFFF" : "#5A5648",
              }}>
              👧 Qiz
            </button>
          </div>
        </div>
        </ProfileAccordion>
      )}

      {foydalanuvchi?.role === "oqituvchi" && (
        <ProfileAccordion nested icon="📚" title="O'qituvchi ma'lumotlari" summary={oqituvchiFani || "Fan tanlanmagan"}>
        <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "#5A5648" }}>📚 O'qituvchi ma'lumotlari</p>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Qaysi fanni o'qitasiz?</label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {BARCHA_MAKTAB_FANLARI.map((f) => {
              const bu_rang = fanRangiOl(f);
              const tanlanganmi = oqituvchiFani === f;
              return (
                <button key={f} type="button" onClick={() => setOqituvchiFani(tanlanganmi ? "" : f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border"
                  style={{
                    borderColor: tanlanganmi ? bu_rang : "#E5E1D8",
                    backgroundColor: tanlanganmi ? bu_rang : "#FFFFFF",
                    color: tanlanganmi ? "#FFFFFF" : "#5A5648",
                  }}>
                  {f}
                </button>
              );
            })}
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Dizayn uchun (ixtiyoriy)</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setJins(jins === "ogil" ? "" : "ogil")}
              className="py-3 rounded-xl border-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5"
              style={{
                borderColor: jins === "ogil" ? OGIL_RANGI : "#E5E1D8",
                backgroundColor: jins === "ogil" ? OGIL_RANGI : "#FFFFFF",
                color: jins === "ogil" ? "#FFFFFF" : "#5A5648",
              }}>
              👨 Erkak
            </button>
            <button type="button" onClick={() => setJins(jins === "qiz" ? "" : "qiz")}
              className="py-3 rounded-xl border-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5"
              style={{
                borderColor: jins === "qiz" ? QIZ_RANGI : "#E5E1D8",
                backgroundColor: jins === "qiz" ? QIZ_RANGI : "#FFFFFF",
                color: jins === "qiz" ? "#FFFFFF" : "#5A5648",
              }}>
              👩 Ayol
            </button>
          </div>
          {oqituvchiFani && (
            <p className="text-xs mt-3 text-center" style={{ color: "#8A8578" }}>
              Profilingiz "{oqituvchiFani}" rangida bezatiladi.
            </p>
          )}
        </div>
        </ProfileAccordion>
      )}

      {foydalanuvchi?.role === "oqituvchi" && (
        <ProfileAccordion nested icon="🔗" title="Maktab yoki markazga ulanish" summary="Rasmiy sinf va kirish kodi">
        <div className="rounded-2xl p-3 bg-white border mb-4 shadow-sm space-y-2" style={{ borderColor: "#E5E1D8" }}>
          <button onClick={() => setKorinish("rasmiy_sinf")} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F7F5F0" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}>
              <GraduationCap size={16} style={{ color: "#1B4B7A" }} />
            </span>
            <span className="text-xs font-semibold flex-1 text-left" style={{ color: "#2B2B2B" }}>Rasmiy maktab sinfim bormi?</span>
            <ChevronRight size={15} style={{ color: "#8A8578" }} />
          </button>
          <button onClick={() => setKorinish("kirish_kodi")} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F7F5F0" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FDF3E0" }}>
              <KeyRound size={16} style={{ color: "#8A5A1C" }} />
            </span>
            <span className="text-xs font-semibold flex-1 text-left" style={{ color: "#2B2B2B" }}>Maktab/markazdan kirish kodim bor</span>
            <ChevronRight size={15} style={{ color: "#8A8578" }} />
          </button>
        </div>
        </ProfileAccordion>
      )}

      <ProfileAccordion nested icon="🔊" title="Ovoz va til" summary={`${asosiyTil.toUpperCase()} · ${ovozJinsi === "qiz" ? "Ayol ovozi" : "Erkak ovozi"}`}>
      <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: "#5A5648" }}>🔊 Ovoz va til sozlamalari</p>
        <p className="text-[11px] mb-3 leading-relaxed" style={{ color: "#8A8578" }}>
          Tegsiz matn asosiy tilda o'qiladi. Faqat <b>[en]...[/en]</b> va <b>[ru]...[/ru]</b> ichidagi qismlar mos xorijiy ovozda o'qiladi. Noma'lum til o'zbekchaga qaytadi.
        </p>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Asosiy til</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[["uz", "O'zbekcha"], ["en", "English"], ["ru", "Русский"]].map(([kod, nom]) => (
            <button key={kod} type="button" onClick={() => setAsosiyTil(kod)}
              className="py-2.5 rounded-xl border text-xs font-semibold"
              style={{ borderColor: asosiyTil === kod ? profilRangi : "#E5E1D8", backgroundColor: asosiyTil === kod ? profilRangi : "#fff", color: asosiyTil === kod ? "#fff" : "#5A5648" }}>
              {nom}
            </button>
          ))}
        </div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ovoz</label>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => setOvozJinsi("ogil")}
            className="py-2.5 rounded-xl border text-sm font-semibold"
            style={{ borderColor: ovozJinsi === "ogil" ? OGIL_RANGI : "#E5E1D8", backgroundColor: ovozJinsi === "ogil" ? OGIL_RANGI : "#fff", color: ovozJinsi === "ogil" ? "#fff" : "#5A5648" }}>
            👨 Erkak ovozi
          </button>
          <button type="button" onClick={() => setOvozJinsi("qiz")}
            className="py-2.5 rounded-xl border text-sm font-semibold"
            style={{ borderColor: ovozJinsi === "qiz" ? QIZ_RANGI : "#E5E1D8", backgroundColor: ovozJinsi === "qiz" ? QIZ_RANGI : "#fff", color: ovozJinsi === "qiz" ? "#fff" : "#5A5648" }}>
            👩 Ayol ovozi
          </button>
        </div>
      </div>
      </ProfileAccordion>

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {muvaffaqiyat && <p className="text-sm mb-3" style={{ color: "#3B6D11" }}>✓ Saqlandi</p>}

      <button onClick={profilSaqla} disabled={saqlanmoqda}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm mb-4"
        style={{ backgroundColor: profilRangi, opacity: saqlanmoqda ? 0.7 : 1 }}>
        {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
      </button>
      </ProfileAccordion>

      {foydalanuvchi?.role === "oquvchi" && (
        <div ref={otaOnaKartaRef}>
        <ProfileAccordion icon="🔗" title="Ota-onani ulash" summary={otaOnalarim.length ? `${otaOnalarim.length} ta ota-ona ulangan` : "Kod orqali ulash"}>
        <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>🔗 Ota-onani ulash</p>
          {otaOnalarim.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 mt-2">
              {otaOnalarim.map((o) => (
                <span key={o.user_id} className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                  ✓ {o.full_name}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
            {otaOnalarim.length > 0 ? "Yana bittasini ulash uchun kod oling:" : "Kod oling va uni ota-onangizga ayting — u shu kodni o'z profilida kiritib, sizning bilim ko'rsatkichlaringizni ko'ra oladi."}
          </p>
          {otaKod ? (
            <div className="rounded-xl p-3 text-center mb-2" style={{ backgroundColor: "#EAF1F7" }}>
              <p className="text-2xl font-bold tracking-widest mb-0.5" style={{ color: "#1B4B7A" }}>{otaKod.kod}</p>
              <p className="text-xs" style={{ color: "#5A5648" }}>{otaKod.amal_qilish_daqiqasi} daqiqa amal qiladi</p>
            </div>
          ) : null}
          {otaKodXato && <p className="text-sm mb-2" style={{ color: "#B0553A" }}>{otaKodXato}</p>}
          <button onClick={otaKodOl} disabled={otaKodOlinmoqda}
            className="w-full py-2.5 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A", opacity: otaKodOlinmoqda ? 0.7 : 1 }}>
            {otaKodOlinmoqda ? "..." : otaKod ? "🔄 Yangi kod olish" : "Kod olish"}
          </button>
        </div>
        </ProfileAccordion>
        </div>
      )}

      {foydalanuvchi?.role === "ota-ona" && (
        <ProfileAccordion icon="👨‍👩‍👧" title="Farzandlarim" summary={farzandlar.length ? `${farzandlar.length} ta farzand ulangan` : "Farzand kodini kiriting"}>
        <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "#2B2B2B" }}>👨‍👩‍👧 Farzandlarim</p>

          {farzandlar.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {farzandlar.map((f) => (
                <span key={f.user_id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full" style={{ backgroundColor: "#F7F5F0" }}>
                  <span className="text-xs font-medium" style={{ color: "#5A5648" }}>{f.full_name}</span>
                  <button onClick={() => farzandniUzish(f.user_id)}
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-xs" style={{ color: "#8A8578" }} title="Uzish">✕</button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input type="text" value={farzandKodi} onChange={(e) => setFarzandKodi(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="farzand kodi (123456)" maxLength={6}
              className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8" }} />
            <button onClick={farzandQoshish} disabled={farzandQoshilmoqda || !farzandKodi.trim()}
              className="px-4 rounded-xl font-semibold text-white text-sm shrink-0"
              style={{ backgroundColor: "#1B4B7A", opacity: (farzandQoshilmoqda || !farzandKodi.trim()) ? 0.6 : 1 }}>
              {farzandQoshilmoqda ? "..." : "Qo'shish"}
            </button>
          </div>
          {farzandXato && <p className="text-sm mt-2" style={{ color: "#B0553A" }}>{farzandXato}</p>}
          {farzandMuvaffaqiyat && <p className="text-sm mt-2" style={{ color: "#3B6D11" }}>{farzandMuvaffaqiyat}</p>}
        </div>
        </ProfileAccordion>
      )}

      <ProfileAccordion icon="🎯" title="Mening to'garaklarim" summary={togaraklarim.length ? `${togaraklarim.length} ta to'garak` : "Parol bilan qo'shilish"}>
      <div className="rounded-2xl p-4 bg-white border mb-3 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "#5A5648" }}>Mening to'garaklarim</p>

        {togaraklarYuklanmoqda ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "#1B4B7A" }} />
        ) : togaraklarim.length === 0 ? (
          <p className="text-sm mb-4" style={{ color: "#8A8578" }}>Hali hech qaysi to'garakka qo'shilmagansiz.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {togaraklarim.map((t) => (
              t.tasdiqlangan === false ? (
                <span key={t.id} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}>
                  ⏳ {t.nomi} — kutilmoqda
                </span>
              ) : (
                <button key={t.id} onClick={() => { setTanlanganTogarak(t); setKorinish(t.turi === "avto" ? "mening_kalendarim" : "togarak_mavzular"); }}
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={t.turi === "avto" ? { backgroundColor: "#F3EEFA", color: "#8B5FBF" } : { backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                  {t.turi === "avto" ? "🤖 " : ""}{t.nomi} →
                </button>
              )
            ))}
          </div>
        )}

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Parol bilan qo'shilish</label>
        <div className="flex gap-2">
          <input type="text" value={qoshilishParol} onChange={(e) => setQoshilishParol(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && togarakkaQoshil()}
            placeholder="to'garak paroli"
            className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm"
            style={{ borderColor: "#E5E1D8" }} />
          <button onClick={togarakkaQoshil} disabled={qoshilinmoqda}
            className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm shrink-0"
            style={{ backgroundColor: "#C89B3C", opacity: qoshilinmoqda ? 0.7 : 1 }}>
            {qoshilinmoqda ? "..." : "Qo'shilish"}
          </button>
        </div>
        {qoshilishXato && <p className="text-sm mt-2" style={{ color: "#B0553A" }}>{qoshilishXato}</p>}
        {qoshilishMuvaffaqiyat && <p className="text-sm mt-2" style={{ color: "#3B6D11" }}>✓ {qoshilishMuvaffaqiyat}</p>}
      </div>
      </ProfileAccordion>

      {foydalanuvchi?.is_admin && (
        <ProfileAccordion icon="🛡️" title="Admin xavfsizligi va arxiv" summary="Parol, faol muassasalar va arxiv">
        <React.Suspense fallback={<div className="py-6 text-center"><Loader2 size={22} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>}>
          <AdminInstitutionSecurity token={token} apiBase={API_BASE} />
        </React.Suspense>
        </ProfileAccordion>
      )}

      <ProfileAccordion icon="🎭" title={foydalanuvchi?.is_admin ? "Kabinet ko'rinishi" : "Rol sozlamalari"} summary={foydalanuvchi?.is_admin ? "Admin, o'quvchi, ota-ona yoki o'qituvchi" : `Joriy rol: ${rolNomlari[foydalanuvchi?.role] || "—"}`}>
      {foydalanuvchi?.is_admin ? (
        <div className="rounded-2xl p-4 bg-white border mb-4 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "#5A5648" }}>Rol ko‘rinishini almashtirish</p>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
            Admin, o‘quvchi, ota-ona va o‘qituvchi kabinetlarini alohida sinang. Bu administrator huquqingizni o‘chirmaydi.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[["admin", "🛠 Admin"], ["oquvchi", "O'quvchi"], ["ota-ona", "Ota-ona"], ["oqituvchi", "O'qituvchi"]].map(([v, l]) => (
              <button key={v} onClick={() => onKorinishOzgar(v)}
                className="py-2.5 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: adminKorinish === v ? "#1B4B7A" : "#E5E1D8",
                  backgroundColor: adminKorinish === v ? "#1B4B7A" : "#FFFFFF",
                  color: adminKorinish === v ? "#FFFFFF" : "#5A5648",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 bg-white border mb-4 shadow-sm" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "#5A5648" }}>Rolingiz</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(rolNomlari).map(([v, l]) => (
              <button key={v} onClick={() => rolTanlandi(v)}
                className="py-2.5 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: foydalanuvchi?.role === v ? "#1B4B7A" : "#E5E1D8",
                  backgroundColor: foydalanuvchi?.role === v ? "#1B4B7A" : "#FFFFFF",
                  color: foydalanuvchi?.role === v ? "#FFFFFF" : "#5A5648",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
      </ProfileAccordion>

      {rolTanlov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            {rolSurishNatija === "yuklanmoqda" ? (
              <div className="py-4 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : kodBosqichida ? (
              <>
                <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>📧 Tasdiqlash kodi kerak</p>
                <p className="text-sm mb-4" style={{ color: "#5A5648" }}>
                  Bepul rol almashtirish imkoniyatingiz tugagan. "{rolNomlari[rolTanlov]}"ga o'zgartirish uchun
                  Gmail hisobingizga ({kodEmail || "..."}) yuborilgan 6 xonali kodni kiriting.
                </p>
                {kodYuklanmoqda ? (
                  <div className="py-2 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
                ) : (
                  <>
                    <input type="text" value={kodQiymati} onChange={(e) => setKodQiymati(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456" maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-center text-lg tracking-widest mb-3"
                      style={{ borderColor: "#E5E1D8" }} />
                    <button onClick={kodSora} className="text-xs mb-4" style={{ color: "#1B4B7A" }}>Kodni qayta yuborish</button>
                  </>
                )}
                {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
                <div className="flex gap-2.5">
                  <button onClick={rolModalniYop}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                    Bekor qilish
                  </button>
                  <button onClick={kodTasdiqla} disabled={rolOzgartirilmoqda || !kodQiymati.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "#1B4B7A", opacity: (rolOzgartirilmoqda || !kodQiymati.trim()) ? 0.6 : 1 }}>
                    {rolOzgartirilmoqda ? "..." : "Tasdiqlash"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>⚠️ Rolni o'zgartirasizmi?</p>
                <p className="text-sm mb-3" style={{ color: "#5A5648" }}>
                  Rolingiz "{rolNomlari[rolTanlov]}"ga o'zgaradi. Bu ko'rinadigan ma'lumot va imkoniyatlaringizga
                  butunlay ta'sir qiladi — masalan o'quvchi test/bilim ma'lumotlari, o'qituvchi guruhlari.
                </p>
                {rolSurishNatija?.admin_test ? (
                  <p className="text-xs mb-5 font-medium" style={{ color: "#2D8B8B" }}>
                    ✓ Admin sifatida cheklovsiz sinab ko'rishingiz mumkin.
                  </p>
                ) : (
                  <p className="text-xs mb-5 font-semibold p-3 rounded-xl" style={{ color: "#8A5A1C", backgroundColor: "#FDF3E3" }}>
                    DIQQAT: rolni FAQAT 2 marta bepul o'zgartirish mumkin. Sizda {rolSurishNatija?.qolgan_bepul ?? "?"} ta
                    bepul imkoniyat qoldi. Shundan keyin har safar Gmail orqali tasdiqlash kodi va 30 kunlik kutish talab qilinadi.
                  </p>
                )}
                {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
                <div className="flex gap-2.5">
                  <button onClick={rolModalniYop}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                    Bekor qilish
                  </button>
                  <button onClick={rolTasdiqla} disabled={rolOzgartirilmoqda}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
                    {rolOzgartirilmoqda ? "..." : "Tasdiqlash"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function menyuBandlariniOl(rol, qoshimchaBand) {
  if (rol === "admin") {
    return [
      { kalit: "admin", nom: "Shablon", ikon: FileSpreadsheet },
      { kalit: "admin_muassasalar", nom: "Muassasalar", ikon: Building2 },
      { kalit: "admin_testlar", nom: "Testlar", ikon: PencilLine },
      { kalit: "admin_mavzular", nom: "Mavzular", ikon: BookOpen },
      { kalit: "admin_statistikalar", nom: "Statistikalar", ikon: BarChart3 },
      { kalit: "admin_moderatsiya", nom: "Moderatsiya", ikon: AlertTriangle },
      { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
      { kalit: "profil", nom: "Profil va sozlamalar", ikon: Settings },
    ];
  }
  if (rol === "oqituvchi") {
    return [
      { kalit: "oqituvchi", nom: "Ish maydoni", ikon: Users },
      { kalit: "oqituvchi_analitika", nom: "Statistikalar", ikon: BarChart3 },
      ...(qoshimchaBand ? [qoshimchaBand] : []),
      { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
      { kalit: "profil", nom: "Profil", ikon: User },
    ];
  }
  if (rol === "ota-ona") {
    return [
      { kalit: "farzand", nom: "Farzand tahlili", ikon: Heart },
      { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
      { kalit: "profil", nom: "Profil", ikon: User },
    ];
  }
  return [
    { kalit: "bilim", nom: "Mening tahlilim", ikon: BarChart3 },
    { kalit: "ai_ustoz", nom: "AI Ustoz", ikon: Bot },
    { kalit: "test", nom: "Test", ikon: PencilLine },
    { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
    { kalit: "profil", nom: "Profil", ikon: User },
  ];
}

function PastkiMenyu({
  faol,
  onTanlash,
  rol,
  rang,
  bloklangan,
  qoshimchaBand,
  foydalanuvchi,
}) {
  const aktivRang = rang || "#1B4B7A";
  const bandlar = menyuBandlariniOl(rol, qoshimchaBand);
  const profilBandi = bandlar.find((band) => band.kalit === "profil");
  const asosiyBandlar = bandlar.filter((band) => band.kalit !== "profil");
  const rolNomi = rol === "admin"
    ? "Administrator"
    : rol === "oqituvchi"
      ? "O‘qituvchi"
      : rol === "ota-ona"
        ? "Ota-ona"
        : "O‘quvchi";
  const ism = foydalanuvchi?.full_name || rolNomi;
  const boshHarf = ism.trim().split(/\s+/).slice(0, 2).map((q) => q[0]).join("").toUpperCase() || "TA";

  const bandTugmasi = ({ kalit, nom, ikon: Ikon }, desktop = false) => {
    const aktiv = faol === kalit;
    const taqiqlangan = bloklangan && !aktiv;
    return (
      <button
        key={`${desktop ? "desktop" : "mobile"}-${kalit}`}
        onClick={() => !taqiqlangan && onTanlash(kalit)}
        className={desktop
          ? `premium-side-link${aktiv ? " active" : ""}`
          : `premium-mobile-link${aktiv ? " active" : ""}`}
        style={{
          "--nav-accent": aktivRang,
          opacity: taqiqlangan ? 0.35 : 1,
          cursor: taqiqlangan ? "not-allowed" : "pointer",
        }}
        title={taqiqlangan ? "Avval testni yakunlang yoki to‘xtating" : nom}
      >
        <span className={desktop ? "premium-side-icon" : "premium-mobile-icon"}>
          <Ikon size={desktop ? 18 : 21} strokeWidth={aktiv ? 2.5 : 2} />
        </span>
        <span>{nom}</span>
      </button>
    );
  };

  return (
    <>
      <aside className="premium-sidebar">
        <div className="premium-side-brand">
          <Logotip compact light />
          <div>
            <strong>TA‘LIM AI</strong>
            <span>Ta’lim ekotizimi</span>
          </div>
        </div>
        <div className="premium-role-card">
          <span className="premium-role-avatar" style={{ background: `linear-gradient(135deg, ${aktivRang}, #0B7978)` }}>{boshHarf}</span>
          <div>
            <strong>{ism}</strong>
            <span>{rolNomi} kabineti</span>
          </div>
        </div>
        <nav className="premium-side-nav">
          <p>ASOSIY MENYU</p>
          {asosiyBandlar.map((band) => bandTugmasi(band, true))}
        </nav>
        {profilBandi && (
          <div className="premium-side-profile">
            {bandTugmasi(profilBandi, true)}
          </div>
        )}
        <div className="premium-side-status">
          <span className="premium-live-dot" />
          <div><strong>Tizim faol</strong><small>Barcha xizmatlar ishlayapti</small></div>
        </div>
      </aside>

      <nav className="premium-mobile-nav">
        <div style={{ gridTemplateColumns: `repeat(${bandlar.length}, minmax(70px, 1fr))` }}>
          {bandlar.map((band) => bandTugmasi(band, false))}
        </div>
      </nav>
    </>
  );
}

function XabarlarTab({ token }) {
  const [bildirishnomalar, setBildirishnomalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [korinish, setKorinish] = useState("bildirishnoma"); // "bildirishnoma" | "suhbatlar"
  const [tanlanganSuhbat, setTanlanganSuhbat] = useState(null); // { guruh_id } | { boshqa_user_id, boshqa_ismi }

  useEffect(() => {
    fetch(`${API_BASE}/api/bildirishnomalar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setBildirishnomalar(d.bildirishnomalar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  const vaqtniKorsat = (izo) => {
    const sana = new Date(izo);
    const kunlar = Math.floor((Date.now() - sana.getTime()) / 86400000);
    if (kunlar === 0) return "Bugun";
    if (kunlar === 1) return "Kecha";
    return `${kunlar} kun oldin`;
  };

  if (korinish === "suhbatlar" && tanlanganSuhbat) {
    return <SuhbatOynasi token={token} suhbat={tanlanganSuhbat} onOrtga={() => setTanlanganSuhbat(null)} />;
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Xabarlar</h1>
      <div className="flex rounded-full p-1 gap-0.5 mb-5" style={{ backgroundColor: "#F0EDE5" }}>
        <button onClick={() => setKorinish("bildirishnoma")} className="flex-1 py-2 rounded-full text-sm font-semibold"
          style={korinish === "bildirishnoma" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
          🔔 Bildirishnomalar
        </button>
        <button onClick={() => setKorinish("suhbatlar")} className="flex-1 py-2 rounded-full text-sm font-semibold"
          style={korinish === "suhbatlar" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
          💬 Suhbatlar
        </button>
      </div>

      {korinish === "suhbatlar" ? (
        <SuhbatlarRoyxati token={token} onSuhbatOch={setTanlanganSuhbat} />
      ) : yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : bildirishnomalar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hozircha bildirishnoma yo'q.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {bildirishnomalar.map((b) => (
            <div key={b.id} className="rounded-xl p-4 bg-white border" style={{ borderColor: b.oqildimi ? "#E5E1D8" : "#F5DFA3" }}>
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">{b.turi === "tolov" ? "💳" : "🔔"}</span>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#2B2B2B" }}>{b.matn}</p>
                  <p className="text-xs mt-1" style={{ color: "#8A8578" }}>{vaqtniKorsat(b.yaratildi)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SuhbatlarRoyxati({ token, onSuhbatOch }) {
  const [guruhlar, setGuruhlar] = useState([]);
  const [shaxsiylar, setShaxsiylar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [qidiruvOchiq, setQidiruvOchiq] = useState(false);
  const [qidiruvMatni, setQidiruvMatni] = useState("");
  const [qidiruvNatijalari, setQidiruvNatijalari] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/chat/guruhlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d.guruhlar || []); setShaxsiylar(d.shaxsiylar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  useEffect(() => {
    if (qidiruvMatni.trim().length < 2) { setQidiruvNatijalari([]); return; }
    const vaqt = setTimeout(() => {
      fetch(`${API_BASE}/api/chat/foydalanuvchi_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(qidiruvMatni.trim())}`)
        .then((r) => r.json())
        .then((d) => setQidiruvNatijalari(d.natijalar || []))
        .catch(() => {});
    }, 350);
    return () => clearTimeout(vaqt);
  }, [qidiruvMatni, token]);

  const vaqtQisqa = (izo) => {
    if (!izo) return "";
    const sana = new Date(izo);
    const bugun = new Date();
    if (sana.toDateString() === bugun.toDateString()) return sana.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    return sana.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" });
  };

  const oxirgiMatnKorsat = (matn, faylTuri) => {
    if (matn) return matn;
    if (faylTuri === "audio") return "🎤 Ovozli xabar";
    if (faylTuri === "video") return "🎬 Video";
    if (faylTuri === "video_doira") return "⭕ Video xabar";
    if (faylTuri === "hujjat") return "📎 Fayl";
    return "";
  };

  if (qidiruvOchiq) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <input type="text" autoFocus value={qidiruvMatni} onChange={(e) => setQidiruvMatni(e.target.value)}
            placeholder="Ism bo'yicha qidirish..." className="flex-1 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          <button onClick={() => { setQidiruvOchiq(false); setQidiruvMatni(""); }} className="text-sm font-medium" style={{ color: "#8A8578" }}>Bekor</button>
        </div>
        <div className="space-y-1.5">
          {qidiruvNatijalari.map((n) => (
            <button key={n.user_id} onClick={() => { setQidiruvOchiq(false); setQidiruvMatni(""); onSuhbatOch({ boshqa_user_id: n.user_id, boshqa_ismi: n.full_name }); }}
              className="w-full flex items-center gap-3 rounded-xl p-3 bg-white border text-left" style={{ borderColor: "#E5E1D8" }}>
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                {n.full_name.trim().slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-medium truncate" style={{ color: "#2B2B2B" }}>{n.full_name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setQidiruvOchiq(true)} className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
        <UserPlus size={16} style={{ color: "#8A8578" }} />
        <span className="text-sm" style={{ color: "#8A8578" }}>Yangi shaxsiy xabar...</span>
      </button>

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : guruhlar.length === 0 && shaxsiylar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hozircha suhbat yo'q.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {guruhlar.map((g) => (
            <button key={`g${g.id}`} onClick={() => onSuhbatOch({ guruh_id: g.id, guruh_nomi: g.nomi })}
              className="w-full flex items-center gap-3 rounded-xl p-3 bg-white border text-left" style={{ borderColor: "#E5E1D8" }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: "#EAF1F7" }}>
                {g.nomi.trim().slice(0, 2)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{g.nomi}</p>
                <p className="text-xs truncate" style={{ color: "#8A8578" }}>{oxirgiMatnKorsat(g.oxirgi_matn, g.oxirgi_fayl_turi) || "Hali xabar yo'q"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {g.oxirgi_vaqt && <span className="text-[11px]" style={{ color: "#B0AA98" }}>{vaqtQisqa(g.oxirgi_vaqt)}</span>}
                {g.okilmagan_soni > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: "#1B4B7A" }}>
                    {g.okilmagan_soni}
                  </span>
                )}
              </div>
            </button>
          ))}
          {shaxsiylar.map((s) => (
            <button key={`s${s.user_id}`} onClick={() => onSuhbatOch({ boshqa_user_id: s.user_id, boshqa_ismi: s.full_name })}
              className="w-full flex items-center gap-3 rounded-xl p-3 bg-white border text-left" style={{ borderColor: "#E5E1D8" }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: "#F3EEFA", color: "#8B5FBF" }}>
                {s.full_name.trim().slice(0, 1).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{s.full_name}</p>
                <p className="text-xs truncate" style={{ color: "#8A8578" }}>{oxirgiMatnKorsat(s.matn, s.fayl_turi)}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {s.yaratilgan_at && <span className="text-[11px]" style={{ color: "#B0AA98" }}>{vaqtQisqa(s.yaratilgan_at)}</span>}
                {s.okilmagan_soni > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: "#1B4B7A" }}>
                    {s.okilmagan_soni}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DoiraVideoYozish({ onYubor, onBekor }) {
  const MAX_SONIYA = 60;
  const [holat, setHolat] = useState("tayyorlanmoqda"); // tayyorlanmoqda | tayyor | yozilmoqda | korib_chiqish | xato
  const [xatoMatni, setXatoMatni] = useState("");
  const [yozilganUrl, setYozilganUrl] = useState(null);
  const [sekund, setSekund] = useState(0);
  const [qulflandi, setQulflandi] = useState(false);
  const jonliVideoRef = useRef(null);
  const koribChiqishVideoRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const boglamlarRef = useRef([]);
  const taymerRef = useRef(null);
  const boshlanishYRef = useRef(0);
  const QULF_MASOFASI = 45;

  const kameraniOch = () => {
    setHolat("tayyorlanmoqda");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 480 }, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (jonliVideoRef.current) jonliVideoRef.current.srcObject = stream;
        setHolat("tayyor");
      })
      .catch(() => { setXatoMatni("Kameraga ruxsat berilmadi — brauzer sozlamalaridan ruxsat bering."); setHolat("xato"); });
  };

  useEffect(() => {
    kameraniOch();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(taymerRef.current);
      if (yozilganUrl) URL.revokeObjectURL(yozilganUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const qulflandiRef = useRef(false);

  const yozishToxtat = () => {
    clearInterval(taymerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  const yozishBoshla = () => {
    if (!streamRef.current) return;
    boglamlarRef.current = [];
    const turi = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") ? "video/webm;codecs=vp8,opus" : "video/webm";
    const recorder = new MediaRecorder(streamRef.current, { mimeType: turi });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) boglamlarRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(boglamlarRef.current, { type: "video/webm" });
      if (qulflandiRef.current) {
        // Qulflangan — qo'lda ko'rib chiqish/yuborish uchun preview'ga o'tadi
        setYozilganUrl(URL.createObjectURL(blob));
        setHolat("korib_chiqish");
      } else {
        // Qulflanmagan — qo'yib yuborilganda DARHOL jo'natiladi (ovozli xabar kabi)
        onYubor(new File([blob], "doira_video.webm", { type: "video/webm" }));
      }
    };
    recorderRef.current = recorder;
    recorder.start();
    setSekund(0);
    setHolat("yozilmoqda");
    taymerRef.current = setInterval(() => {
      setSekund((prev) => {
        if (prev + 1 >= MAX_SONIYA) { yozishToxtat(); return prev; }
        return prev + 1;
      });
    }, 1000);
  };

  // Bosib turib yozish, qo'yib yuborsa DARHOL jo'natiladi. Yozayotganda
  // yuqoriga surilsa — qulflanadi, qo'lni olib qo'ysa ham davom etadi
  // (keyin qo'lda ko'rib chiqib yuborish/qayta yozish kerak).
  useEffect(() => {
    if (holat !== "yozilmoqda") return;
    const harakat = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      if (boshlanishYRef.current - y > QULF_MASOFASI) { qulflandiRef.current = true; setQulflandi(true); }
    };
    const qoyildi = () => {
      if (!qulflandiRef.current) yozishToxtat();
    };
    window.addEventListener("mousemove", harakat);
    window.addEventListener("touchmove", harakat, { passive: true });
    window.addEventListener("mouseup", qoyildi);
    window.addEventListener("touchend", qoyildi);
    return () => {
      window.removeEventListener("mousemove", harakat);
      window.removeEventListener("touchmove", harakat);
      window.removeEventListener("mouseup", qoyildi);
      window.removeEventListener("touchend", qoyildi);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holat]);

  const bosishBoshlandi = (e) => {
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    boshlanishYRef.current = y;
    qulflandiRef.current = false;
    setQulflandi(false);
    yozishBoshla();
  };

  const qaytaYoz = () => {
    if (yozilganUrl) URL.revokeObjectURL(yozilganUrl);
    setYozilganUrl(null);
    setSekund(0);
    kameraniOch();
  };

  const yuborish = async () => {
    const javob = await fetch(yozilganUrl);
    const blob = await javob.blob();
    onYubor(new File([blob], "doira_video.webm", { type: "video/webm" }));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6" style={{ backgroundColor: "rgba(20,20,18,0.92)" }}>
      <button onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); onBekor(); }}
        className="absolute top-6 right-5 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
        <X size={18} style={{ color: "#fff" }} />
      </button>

      {holat === "xato" ? (
        <p className="text-sm text-center px-8" style={{ color: "#fff" }}>{xatoMatni}</p>
      ) : (
        <>
          <div className="relative" style={{ width: 260, height: 260 }}>
            <div className="rounded-full overflow-hidden w-full h-full" style={{ border: holat === "yozilmoqda" ? "3px solid #E24B4A" : "3px solid rgba(255,255,255,0.3)" }}>
              {holat === "korib_chiqish" ? (
                <video ref={koribChiqishVideoRef} src={yozilganUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
              ) : (
                <video ref={jonliVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              )}
            </div>
            {holat === "yozilmoqda" && (
              <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#E24B4A", color: "#fff" }}>
                {String(Math.floor(sekund / 60)).padStart(2, "0")}:{String(sekund % 60).padStart(2, "0")}
              </span>
            )}
          </div>

          {holat === "korib_chiqish" ? (
            <div className="flex items-center gap-5">
              <button onClick={qaytaYoz} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <RotateCcw size={20} style={{ color: "#fff" }} />
              </button>
              <button onClick={yuborish} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1B4B7A" }}>
                <Send size={24} style={{ color: "#fff" }} />
              </button>
            </div>
          ) : (
            <button onMouseDown={holat === "yozilmoqda" ? undefined : bosishBoshlandi}
              onTouchStart={holat === "yozilmoqda" ? undefined : bosishBoshlandi}
              onClick={qulflandi && holat === "yozilmoqda" ? yozishToxtat : undefined}
              disabled={holat === "tayyorlanmoqda"}
              className="w-16 h-16 rounded-full flex items-center justify-center select-none" style={{ backgroundColor: holat === "yozilmoqda" ? "#fff" : "#E24B4A", opacity: holat === "tayyorlanmoqda" ? 0.5 : 1, touchAction: "none" }}>
              {holat === "yozilmoqda" ? <span className="w-5 h-5 rounded-sm" style={{ backgroundColor: "#E24B4A" }} /> : <span className="w-6 h-6 rounded-full" style={{ backgroundColor: "#fff" }} />}
            </button>
          )}
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            {holat === "korib_chiqish" ? "Ko'rib chiqing va yuboring" : holat === "yozilmoqda" ? (qulflandi ? "🔒 Qulflandi — tugatish uchun bosing" : "⬆ Qulflash uchun suring · qo'yib yuborsangiz jo'natiladi") : "Yozish uchun bosib turing"}
          </p>
        </>
      )}
    </div>
  );
}

function SuhbatOynasi({ token, suhbat, onOrtga }) {
  const [xabarlar, setXabarlar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [matn, setMatn] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [doiraVideoOchiq, setDoiraVideoOchiq] = useState(false);
  const [ovozYozilmoqda, setOvozYozilmoqda] = useState(false);
  const [ovozQulflandi, setOvozQulflandi] = useState(false);
  const [ovozSekund, setOvozSekund] = useState(0);
  const [tanlanganXabar, setTanlanganXabar] = useState(null); // uzoq bosilgan xabar obyekti | null
  const [tahrirlanayotganXabar, setTahrirlanayotganXabar] = useState(null); // xabar obyekti | null
  const [tahrirMatni, setTahrirMatni] = useState("");
  const [ochirishTasdiqi, setOchirishTasdiqi] = useState(null); // xabar obyekti | null
  const oxiriRef = useRef(null);
  const faylInputRef = useRef(null);
  const ovozRecorderRef = useRef(null);
  const ovozStreamRef = useRef(null);
  const ovozBoglamlarRef = useRef([]);
  const ovozTaymerRef = useRef(null);
  const ovozBoshlanishYRef = useRef(0);
  const joriyUserId = useMemo(() => _tokenDanUserIdOl(token), [token]);
  const [reaksiyaTanlanayotgan, setReaksiyaTanlanayotgan] = useState(null); // xabar obyekti | null
  const [forwardQilinayotgan, setForwardQilinayotgan] = useState(null); // xabar obyekti | null
  const [forwardSuhbatlar, setForwardSuhbatlar] = useState(null); // {guruhlar, shaxsiylar} | null
  const [qidiruvOchiq, setQidiruvOchiq] = useState(false);
  const [qidiruvMatni, setQidiruvMatni] = useState("");
  const [qidiruvNatijalari, setQidiruvNatijalari] = useState(null);
  const [kimYozmoqda, setKimYozmoqda] = useState([]);
  const xabarAbortRef = useRef(null);
  const qidiruvAbortRef = useRef(null);
  const qidiruvTaymerRef = useRef(null);
  const oxirgiKorildiRef = useRef(null);
  const REAKSIYA_EMOJILARI = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const reaksiyaQoy = async (xabar, emoji) => {
    setReaksiyaTanlanayotgan(null);
    const mavjud = (xabar.reaksiyalar || []).find((r) => r.meniki);
    try {
      if (mavjud && mavjud.emoji === emoji) {
        await fetch(`${API_BASE}/api/chat/reaksiya_olib_tashla?token=${encodeURIComponent(token)}&xabar_id=${xabar.id}`, { method: "DELETE" });
      } else {
        await fetch(`${API_BASE}/api/chat/reaksiya_qoy?token=${encodeURIComponent(token)}&xabar_id=${xabar.id}&emoji=${encodeURIComponent(emoji)}`, { method: "PUT" });
      }
      yukla();
    } catch {
      setXato("Reaksiya qo'yib bo'lmadi");
    }
  };

  const forwardBoshla = (x) => {
    setTanlanganXabar(null);
    setForwardQilinayotgan(x);
    fetch(`${API_BASE}/api/chat/guruhlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setForwardSuhbatlar({ guruhlar: d.guruhlar || [], shaxsiylar: d.shaxsiylar || [] }))
      .catch(() => setXato("Suhbatlar ro'yxatini yuklab bo'lmadi"));
  };

  const forwardYubor = async (maqsad) => {
    try {
      const params = new URLSearchParams({ token, xabar_id: forwardQilinayotgan.id });
      if (maqsad.guruh_id) params.append("guruh_id", maqsad.guruh_id);
      else params.append("qabul_qiluvchi_user_id", maqsad.user_id);
      const res = await fetch(`${API_BASE}/api/chat/xabar_forward?${params}`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setForwardQilinayotgan(null);
      setForwardSuhbatlar(null);
    } catch (e) {
      setXato(e.message);
    }
  };

  const qidir = (matnQiymat) => {
    setQidiruvMatni(matnQiymat);
    clearTimeout(qidiruvTaymerRef.current);
    qidiruvAbortRef.current?.abort();
    if (matnQiymat.trim().length < 2) { setQidiruvNatijalari(null); return; }
    qidiruvTaymerRef.current = setTimeout(() => {
      const controller = new AbortController();
      qidiruvAbortRef.current = controller;
      const parametr = suhbat.guruh_id ? `guruh_id=${suhbat.guruh_id}` : `boshqa_user_id=${suhbat.boshqa_user_id}`;
      fetch(`${API_BASE}/api/chat/qidir?token=${encodeURIComponent(token)}&${parametr}&matn=${encodeURIComponent(matnQiymat.trim())}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setQidiruvNatijalari(d.natijalar || []))
        .catch((e) => { if (e.name !== "AbortError") setQidiruvNatijalari([]); });
    }, 300);
  };

  const xabarTahrirlashniBoshla = (x) => {
    setTanlanganXabar(null);
    setTahrirlanayotganXabar(x);
    setTahrirMatni(x.matn || "");
  };

  const xabarTahrirlashniSaqla = async () => {
    if (!tahrirMatni.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/xabar_tahrirla`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, xabar_id: tahrirlanayotganXabar.id, yangi_matn: tahrirMatni.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setTahrirlanayotganXabar(null);
      yukla();
    } catch (e) {
      setXato(e.message);
    }
  };

  const xabarniOchir = async (x) => {
    setTanlanganXabar(null);
    try {
      const res = await fetch(`${API_BASE}/api/chat/xabar_ochir?token=${encodeURIComponent(token)}&xabar_id=${x.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setOchirishTasdiqi(null);
      yukla();
    } catch (e) {
      setXato(e.message);
    }
  };


  const [boshqaTomonKorganId, setBoshqaTomonKorganId] = useState(null);
  const [javobBerilayotgan, setJavobBerilayotgan] = useState(null); // xabar obyekti | null

  const yukla = () => {
    xabarAbortRef.current?.abort();
    const controller = new AbortController();
    xabarAbortRef.current = controller;
    const parametr = suhbat.guruh_id ? `guruh_id=${suhbat.guruh_id}` : `boshqa_user_id=${suhbat.boshqa_user_id}`;
    fetch(`${API_BASE}/api/chat/xabarlar?token=${encodeURIComponent(token)}&${parametr}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        const royxat = d.xabarlar || [];
        setXabarlar(royxat);
        setBoshqaTomonKorganId(d.boshqa_tomon_korgan_id ?? null);
        setYuklanmoqda(false);
        setTimeout(() => oxiriRef.current?.scrollIntoView(), 50);
        if (royxat.length > 0) {
          const engSonggisi = royxat[royxat.length - 1].id;
          if (oxirgiKorildiRef.current !== engSonggisi) {
            oxirgiKorildiRef.current = engSonggisi;
            const kp = suhbat.guruh_id ? `guruh_id=${suhbat.guruh_id}` : `boshqa_user_id=${suhbat.boshqa_user_id}`;
            fetch(`${API_BASE}/api/chat/korildi_belgila?token=${encodeURIComponent(token)}&oxirgi_xabar_id=${engSonggisi}&${kp}`, { method: "POST" }).catch(() => {});
          }
        }
      })
      .catch((e) => { if (e.name !== "AbortError") setYuklanmoqda(false); });
  };

  useEffect(() => {
    oxirgiKorildiRef.current = null;
    yukla();
    return () => xabarAbortRef.current?.abort();
  }, [token, suhbat.guruh_id, suhbat.boshqa_user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const parametr = suhbat.guruh_id ? `guruh_id=${suhbat.guruh_id}` : `boshqa_user_id=${suhbat.boshqa_user_id}`;
    let controller = null;
    const tekshir = () => {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      controller = new AbortController();
      fetch(`${API_BASE}/api/chat/kim_yozmoqda?token=${encodeURIComponent(token)}&${parametr}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setKimYozmoqda(d.ismlar || []))
        .catch(() => {});
    };
    const korinishOzgardi = () => {
      if (document.visibilityState === "visible") tekshir();
      else setKimYozmoqda([]);
    };
    tekshir();
    const oraliq = setInterval(tekshir, 6000);
    document.addEventListener("visibilitychange", korinishOzgardi);
    return () => {
      clearInterval(oraliq);
      controller?.abort();
      document.removeEventListener("visibilitychange", korinishOzgardi);
    };
  }, [token, suhbat.guruh_id, suhbat.boshqa_user_id]);

  useEffect(() => () => {
    clearTimeout(qidiruvTaymerRef.current);
    qidiruvAbortRef.current?.abort();
  }, []);

  const yozmoqdaRef = useRef(0);
  const yozayotganiniBildir = () => {
    const hozir = Date.now();
    if (hozir - yozmoqdaRef.current < 3000) return; // ortiqcha parallel so'rov yubormaydi
    yozmoqdaRef.current = hozir;
    const parametr = suhbat.guruh_id ? `guruh_id=${suhbat.guruh_id}` : `boshqa_user_id=${suhbat.boshqa_user_id}`;
    fetch(`${API_BASE}/api/chat/yozmoqda?token=${encodeURIComponent(token)}&${parametr}`, { method: "POST" }).catch(() => {});
  };

  const matnYubor = async () => {
    if (!matn.trim() || yuborilmoqda) return;
    setYuborilmoqda(true); setXato("");
    try {
      const forma = new FormData();
      forma.append("token", token);
      if (suhbat.guruh_id) forma.append("guruh_id", suhbat.guruh_id);
      else forma.append("qabul_qiluvchi_user_id", suhbat.boshqa_user_id);
      forma.append("matn", matn.trim());
      if (javobBerilayotgan) forma.append("javob_xabar_id", javobBerilayotgan.id);
      const res = await fetch(`${API_BASE}/api/chat/xabar_yubor`, { method: "POST", body: forma });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setMatn("");
      setJavobBerilayotgan(null);
      yukla();
    } catch (e) { setXato(e.message); } finally { setYuborilmoqda(false); }
  };

  const faylniYubor = async (fayl, faylTuri) => {
    setYuborilmoqda(true); setXato("");
    try {
      const forma = new FormData();
      forma.append("token", token);
      if (suhbat.guruh_id) forma.append("guruh_id", suhbat.guruh_id);
      else forma.append("qabul_qiluvchi_user_id", suhbat.boshqa_user_id);
      forma.append("fayl_turi", faylTuri);
      forma.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/chat/xabar_yubor`, { method: "POST", body: forma });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      yukla();
    } catch (e) { setXato(e.message); } finally { setYuborilmoqda(false); }
  };

  const faylTanlandi = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    const faylTuri = f.type.startsWith("audio/") ? "audio" : f.type.startsWith("video/") ? "video" : "hujjat";
    faylniYubor(f, faylTuri);
  };

  const doiraVideoYuborildi = (fayl) => {
    setDoiraVideoOchiq(false);
    faylniYubor(fayl, "video_doira");
  };

  useEffect(() => () => {
    ovozStreamRef.current?.getTracks().forEach((t) => t.stop());
    clearInterval(ovozTaymerRef.current);
  }, []);

  const OVOZ_QULF_MASOFASI = 45; // shuncha piksel yuqoriga surilsa — qulflanadi

  const ovozYozishBoshla = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        ovozStreamRef.current = stream;
        ovozBoglamlarRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => { if (e.data.size > 0) ovozBoglamlarRef.current.push(e.data); };
        ovozRecorderRef.current = recorder;
        recorder.start();
        setOvozSekund(0);
        setOvozYozilmoqda(true);
        ovozTaymerRef.current = setInterval(() => setOvozSekund((p) => p + 1), 1000);
      })
      .catch(() => setXato("Mikrofonga ruxsat berilmadi — brauzer sozlamalaridan ruxsat bering."));
  };

  const ovozYozishToxtat = () => {
    clearInterval(ovozTaymerRef.current);
    ovozStreamRef.current?.getTracks().forEach((t) => t.stop());
    setOvozYozilmoqda(false);
  };

  const ovozBekorQil = () => {
    if (ovozRecorderRef.current && ovozRecorderRef.current.state !== "inactive") {
      ovozRecorderRef.current.onstop = null;
      ovozRecorderRef.current.stop();
    }
    ovozYozishToxtat();
  };

  const ovozYuborish = () => {
    const recorder = ovozRecorderRef.current;
    if (!recorder || recorder.state === "inactive") { ovozYozishToxtat(); return; }
    recorder.onstop = () => {
      const blob = new Blob(ovozBoglamlarRef.current, { type: "audio/webm" });
      faylniYubor(new File([blob], "ovozli_xabar.webm", { type: "audio/webm" }), "audio");
    };
    recorder.stop();
    ovozYozishToxtat();
  };

  // Bosib turib yozish, qo'yib yuborsa yuboriladi — WhatsApp uslubi.
  // Yozayotganda biroz yuqoriga surilsa — "qulflanadi", shundan keyin
  // qo'lni olib qo'ysa ham yozish davom etadi (qo'lda yuborish/bekor
  // qilish kerak bo'ladi).
  useEffect(() => {
    if (!ovozYozilmoqda) return;
    const harakat = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      if (ovozBoshlanishYRef.current - y > OVOZ_QULF_MASOFASI) setOvozQulflandi(true);
    };
    const qoyildi = () => {
      setOvozQulflandi((qulf) => {
        if (!qulf) ovozYuborish();
        return qulf;
      });
    };
    window.addEventListener("mousemove", harakat);
    window.addEventListener("touchmove", harakat, { passive: true });
    window.addEventListener("mouseup", qoyildi);
    window.addEventListener("touchend", qoyildi);
    return () => {
      window.removeEventListener("mousemove", harakat);
      window.removeEventListener("touchmove", harakat);
      window.removeEventListener("mouseup", qoyildi);
      window.removeEventListener("touchend", qoyildi);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ovozYozilmoqda]);

  const ovozBosishBoshlandi = (e) => {
    e.preventDefault();
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    ovozBoshlanishYRef.current = y;
    setOvozQulflandi(false);
    ovozYozishBoshla();
  };

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col" style={{ minHeight: "80vh" }}>
      {doiraVideoOchiq && <DoiraVideoYozish onYubor={doiraVideoYuborildi} onBekor={() => setDoiraVideoOchiq(false)} />}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onOrtga} className="flex items-center gap-1 -ml-1.5 px-2 py-1 rounded-lg transition-colors" style={{ color: "#5A5648" }}>
          <ChevronLeft size={16} style={{ color: "#1B4B7A" }} strokeWidth={2.5} />
          {suhbat.guruh_nomi || suhbat.boshqa_ismi || "Suhbat"}
        </button>
        <button onClick={() => { setQidiruvOchiq((o) => !o); setQidiruvMatni(""); setQidiruvNatijalari(null); }}
          className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: qidiruvOchiq ? "#EAF1F7" : "transparent" }}>
          <Search size={16} style={{ color: "#1B4B7A" }} />
        </button>
      </div>

      {qidiruvOchiq && (
        <div className="mb-3">
          <input type="text" value={qidiruvMatni} onChange={(e) => qidir(e.target.value)} autoFocus
            placeholder="Suhbat ichida qidirish..." className="w-full px-3.5 py-2.5 rounded-full border text-sm mb-2" style={{ borderColor: "#E5E1D8" }} />
          {qidiruvNatijalari && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto rounded-xl border p-2" style={{ borderColor: "#E5E1D8" }}>
              {qidiruvNatijalari.length === 0 ? (
                <p className="text-xs text-center py-3" style={{ color: "#8A8578" }}>Hech narsa topilmadi</p>
              ) : (
                qidiruvNatijalari.map((n) => (
                  <div key={n.id} className="px-2.5 py-2 rounded-lg" style={{ backgroundColor: "#F7F5F0" }}>
                    {suhbat.guruh_id && <p className="text-[11px] font-semibold" style={{ color: "#1B4B7A" }}>{n.yuboruvchi_ismi}</p>}
                    <p className="text-xs" style={{ color: "#2B2B2B" }}>{n.matn}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#B0AA98" }}>{new Date(n.yaratilgan_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 space-y-2.5 mb-3 overflow-y-auto">
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : xabarlar.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: "#8A8578" }}>Hali xabar yo'q — birinchi bo'lib yozing.</p>
        ) : (
          xabarlar.map((x) => {
            const meniki = x.yuboruvchi_user_id === joriyUserId;
            if (x.ochirilgan) {
              return (
                <div key={x.id} className="rounded-2xl px-4 py-2.5 max-w-[80%]" style={{ backgroundColor: "#F1EFE8", border: "1px solid #E5E1D8" }}>
                  <p className="text-sm italic" style={{ color: "#B0AA98" }}>🚫 Xabar o'chirildi</p>
                </div>
              );
            }
            return (
              <div key={x.id} onContextMenu={(e) => { e.preventDefault(); setTanlanganXabar(x); }}
                onTouchStart={() => { const t = setTimeout(() => setTanlanganXabar(x), 500); const tozala = () => { clearTimeout(t); window.removeEventListener("touchend", tozala); }; window.addEventListener("touchend", tozala); }}
                className="rounded-2xl px-4 py-2.5 max-w-[80%] select-none" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8" }}>
                {suhbat.guruh_id && <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#1B4B7A" }}>{x.yuboruvchi_ismi}</p>}
                {x.javob_xabar_id && (
                  <div className="rounded-lg px-2 py-1 mb-1.5 border-l-2" style={{ backgroundColor: "#F7F5F0", borderColor: "#1B4B7A" }}>
                    <p className="text-[11px] font-semibold" style={{ color: "#1B4B7A" }}>{x.javob_yuboruvchi_ismi}</p>
                    <p className="text-xs truncate" style={{ color: "#5A5648" }}>{x.javob_matn_qisqa || (x.javob_fayl_turi ? "📎 Fayl" : "")}</p>
                  </div>
                )}
                {x.matn && <p className="text-sm" style={{ color: "#2B2B2B" }}>{x.matn}</p>}
                {x.fayl_turi === "audio" && (
                  <audio controls className="mt-1" style={{ height: 36 }} src={`${API_BASE}/api/chat/fayl/${x.id}?token=${encodeURIComponent(token)}`} />
                )}
                {(x.fayl_turi === "video" || x.fayl_turi === "video_doira") && (
                  <video controls className="mt-1 rounded-lg" style={{ maxWidth: 220, borderRadius: x.fayl_turi === "video_doira" ? 28 : 12 }}
                    src={`${API_BASE}/api/chat/fayl/${x.id}?token=${encodeURIComponent(token)}`} />
                )}
                {x.fayl_turi === "hujjat" && (
                  <a href={`${API_BASE}/api/chat/fayl/${x.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 mt-1 text-xs font-medium" style={{ color: "#1B4B7A" }}>
                    <FileSpreadsheet size={14} /> {x.fayl_nomi || "Fayl"}
                  </a>
                )}
                {x.reaksiyalar && x.reaksiyalar.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {x.reaksiyalar.map((r) => (
                      <button key={r.emoji} onClick={() => reaksiyaQoy(x, r.emoji)}
                        className="text-xs px-1.5 py-0.5 rounded-full border flex items-center gap-1"
                        style={{ borderColor: r.meniki ? "#1B4B7A" : "#E5E1D8", backgroundColor: r.meniki ? "#EAF1F7" : "#F7F5F0" }}>
                        {r.emoji} {r.soni > 1 && <span style={{ color: "#8A8578" }}>{r.soni}</span>}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] mt-1 text-right flex items-center justify-end gap-1" style={{ color: "#B0AA98" }}>
                  {x.tahrirlangan && "tahrirlangan · "}
                  {new Date(x.yaratilgan_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  {meniki && suhbat.boshqa_user_id && (
                    <span style={{ color: boshqaTomonKorganId && x.id <= boshqaTomonKorganId ? "#1B4B7A" : "#B0AA98" }}>
                      {boshqaTomonKorganId && x.id <= boshqaTomonKorganId ? "✓✓" : "✓"}
                    </span>
                  )}
                </p>
              </div>
            );
          })
        )}
        {kimYozmoqda.length > 0 && (
          <p className="text-xs italic px-1" style={{ color: "#8A8578" }}>{kimYozmoqda.join(", ")} yozmoqda...</p>
        )}
        <div ref={oxiriRef} />
      </div>

      {xato && <p className="text-xs mb-2" style={{ color: "#B0553A" }}>{xato}</p>}

      {javobBerilayotgan && (
        <div className="flex items-center gap-2 mb-2 rounded-xl px-3 py-2 border-l-2" style={{ backgroundColor: "#F7F5F0", borderColor: "#1B4B7A" }}>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold" style={{ color: "#1B4B7A" }}>{javobBerilayotgan.yuboruvchi_ismi}ga javob</p>
            <p className="text-xs truncate" style={{ color: "#5A5648" }}>{javobBerilayotgan.matn || (javobBerilayotgan.fayl_turi ? "📎 Fayl" : "")}</p>
          </div>
          <button onClick={() => setJavobBerilayotgan(null)} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ color: "#8A8578" }}>✕</button>
        </div>
      )}

      {ovozYozilmoqda ? (
        ovozQulflandi ? (
          <div className="flex items-center gap-2">
            <button onClick={ovozBekorQil} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FCEBEB" }}>
              <Trash2 size={16} style={{ color: "#A32D2D" }} />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-full" style={{ backgroundColor: "#FCEBEB" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#E24B4A" }} />
              <span className="text-sm font-semibold" style={{ color: "#A32D2D" }}>
                🔒 Ovoz yozilmoqda — {String(Math.floor(ovozSekund / 60)).padStart(2, "0")}:{String(ovozSekund % 60).padStart(2, "0")}
              </span>
            </div>
            <button onClick={ovozYuborish} className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#1B4B7A" }}>
              <Send size={16} style={{ color: "#fff" }} />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-full select-none" style={{ backgroundColor: "#FCEBEB" }}>
            <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: "#E24B4A" }} />
            <span className="text-sm font-semibold shrink-0" style={{ color: "#A32D2D" }}>
              {String(Math.floor(ovozSekund / 60)).padStart(2, "0")}:{String(ovozSekund % 60).padStart(2, "0")}
            </span>
            <span className="text-xs flex-1 text-right" style={{ color: "#A32D2D" }}>⬆ qulflash uchun suring · qo'yib yuborsangiz jo'natiladi</span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => faylInputRef.current?.click()} disabled={yuborilmoqda}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#F7F5F0" }}>
            📎
          </button>
          <button onClick={() => setDoiraVideoOchiq(true)} disabled={yuborilmoqda}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#F7F5F0" }}>
            <Video size={17} style={{ color: "#5A5648" }} />
          </button>
          <input ref={faylInputRef} type="file" accept="audio/*,video/*,.pdf,.doc,.docx,.xlsx" onChange={faylTanlandi} className="hidden" />
          <input type="text" value={matn} onChange={(e) => { setMatn(e.target.value); yozayotganiniBildir(); }}
            onKeyDown={(e) => { if (e.key === "Enter") matnYubor(); }}
            placeholder="Xabar yozing..." className="flex-1 px-3.5 py-2.5 rounded-full border text-sm" style={{ borderColor: "#E5E1D8" }} />
          {matn.trim() ? (
            <button onClick={matnYubor} disabled={yuborilmoqda}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-semibold text-white"
              style={{ backgroundColor: "#1B4B7A", opacity: yuborilmoqda ? 0.5 : 1 }}>
              ➤
            </button>
          ) : (
            <button onMouseDown={ovozBosishBoshlandi} onTouchStart={ovozBosishBoshlandi} disabled={yuborilmoqda}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 select-none" style={{ backgroundColor: "#F7F5F0", touchAction: "none" }}>
              <Mic size={17} style={{ color: "#5A5648" }} />
            </button>
          )}
        </div>
      )}

      {tanlanganXabar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(43,43,43,0.35)" }} onClick={() => setTanlanganXabar(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white p-2 pb-6" style={{ boxShadow: "0 -12px 32px rgba(43,43,43,0.18)" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3 mt-1" style={{ backgroundColor: "#E5E1D8" }} />
            <div className="flex justify-around py-2 mb-1">
              {REAKSIYA_EMOJILARI.map((emoji) => (
                <button key={emoji} onClick={() => reaksiyaQoy(tanlanganXabar, emoji)} className="text-2xl active:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
            <button onClick={() => { setJavobBerilayotgan(tanlanganXabar); setTanlanganXabar(null); }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5" style={{ color: "#2B2B2B" }}>
              ↩️ Javob berish
            </button>
            <button onClick={() => forwardBoshla(tanlanganXabar)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5" style={{ color: "#2B2B2B" }}>
              ↗️ Boshqa suhbatga yuborish
            </button>
            {tanlanganXabar.yuboruvchi_user_id === joriyUserId && tanlanganXabar.matn && (
              <button onClick={() => xabarTahrirlashniBoshla(tanlanganXabar)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5" style={{ color: "#2B2B2B" }}>
                <PencilLine size={16} style={{ color: "#1B4B7A" }} /> Tahrirlash
              </button>
            )}
            {tanlanganXabar.yuboruvchi_user_id === joriyUserId && (
              <button onClick={() => { setOchirishTasdiqi(tanlanganXabar); setTanlanganXabar(null); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2.5" style={{ color: "#A32D2D" }}>
                <Trash2 size={16} /> O'chirish
              </button>
            )}
          </div>
        </div>
      )}

      {tahrirlanayotganXabar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ backgroundColor: "rgba(43,43,43,0.35)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-4" style={{ boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>Xabarni tahrirlash</p>
            <textarea value={tahrirMatni} onChange={(e) => setTahrirMatni(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} autoFocus />
            <div className="flex gap-2">
              <button onClick={() => setTahrirlanayotganXabar(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#EFEBE1", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={xabarTahrirlashniSaqla}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {ochirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ backgroundColor: "rgba(43,43,43,0.35)" }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-4" style={{ boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>Xabarni o'chirasizmi?</p>
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-2">
              <button onClick={() => setOchirishTasdiqi(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#EFEBE1", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={() => xabarniOchir(ochirishTasdiqi)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D" }}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {forwardQilinayotgan && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(43,43,43,0.35)" }} onClick={() => { setForwardQilinayotgan(null); setForwardSuhbatlar(null); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white p-4 max-h-[70vh] overflow-y-auto" style={{ boxShadow: "0 -12px 32px rgba(43,43,43,0.18)" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: "#E5E1D8" }} />
            <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>Qayerga yuborilsin?</p>
            {!forwardSuhbatlar ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : (
              <div className="space-y-1.5">
                {forwardSuhbatlar.guruhlar.map((g) => (
                  <button key={`g${g.id}`} onClick={() => forwardYubor({ guruh_id: g.id })}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F7F5F0", color: "#2B2B2B" }}>
                    {g.nomi}
                  </button>
                ))}
                {forwardSuhbatlar.shaxsiylar.map((s) => (
                  <button key={`s${s.user_id}`} onClick={() => forwardYubor({ user_id: s.user_id })}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F7F5F0", color: "#2B2B2B" }}>
                    {s.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Kabinet({ token }) {
  const [holat, setHolat] = useState("yuklanmoqda");
  const [foydalanuvchi, setFoydalanuvchi] = useState(null);
  const [bilimData, setBilimData] = useState(null);
  const [tab, setTab] = useState(null); // rol aniqlangach o'rnatiladi
  const [xatoMatn, setXatoMatn] = useState("");
  const [muassasalarim, setMuassasalarim] = useState([]);
  const [oqituvchiBoshlanishKorinishi, setOqituvchiBoshlanishKorinishi] = useState(null);
  const [oyinProfil, setOyinProfil] = useState(null);
  const [kunlikMukofot, setKunlikMukofot] = useState(0);
  // Admin uchun — bazadagi haqiqiy `role`ga TEGMAYDIGAN, faqat shu qurilmada
  // ko'rinadigan "ko'rinish rejimi". Shu orqali admin har rolni (o'quvchi/
  // ota-ona/o'qituvchi/admin) BIR-BIRIGA ARALASHMASDAN, to'liq alohida
  // sinab ko'radi.
  const [adminKorinish, setAdminKorinish] = useState("admin");
  const [shablonOldindanTanlangan, setShablonOldindanTanlangan] = useState([]);
  // Test yechish jarayonida (savollar ekranida) TRUE bo'ladi — shu payt
  // pastki menyu orqali boshqa bo'limga o'tib bo'lmaydi, avval test
  // "To'xtatish" yoki "Yakunlash" bilan yakunlanishi kerak.
  const [testDavomida, setTestDavomida] = useState(false);
  const [talimYoliTestNishoni, setTalimYoliTestNishoni] = useState(null);
  const [talimYoliDarsNishoni, setTalimYoliDarsNishoni] = useState(null);

  useEffect(() => {
    async function yukla() {
      try {
        const resU = await fetch(`${API_BASE}/auth/men?token=${encodeURIComponent(token)}`);
        if (!resU.ok) throw new Error("Sessiya eskirgan");
        const u = await resU.json();
        setFoydalanuvchi(u);

        // V18.2: Tashkent sanasi bo'yicha kunlik kirish ochkosi backendda
        // faqat bir marta beriladi. 015 hali o'rnatilmagan eski serverda
        // kabinetning qolgan qismini to'xtatmaymiz.
        fetch(`${API_BASE}/api/oyin/kunlik-kirish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
          .then(async (response) => ({ ok: response.ok, data: await response.json() }))
          .then(({ ok, data }) => {
            if (ok && data.profile) setOyinProfil(data.profile);
            if (ok && data.awarded_points > 0) {
              setKunlikMukofot(data.awarded_points);
              setTimeout(() => setKunlikMukofot(0), 4500);
            }
          })
          .catch(() => {});

        fetch(`${API_BASE}/api/bola/${u.user_id}/bilim`)
          .then((r) => r.json())
          .then(setBilimData)
          .catch(() => setBilimData(null));

        if (u.role === "oqituvchi" && !u.is_admin) {
          fetch(`${API_BASE}/api/auth/muassasalarim?token=${encodeURIComponent(token)}`)
            .then((r) => r.json())
            .then((d) => setMuassasalarim(d.muassasalar || []))
            .catch(() => {});
        }

        // Har rol o'ziga mos boshlang'ich sahifadan boshlaydi
        const korinish = u.is_admin ? "admin" : u.role;
        if (korinish === "admin") setTab("admin");
        else if (korinish === "oqituvchi") setTab("oqituvchi");
        else if (korinish === "ota-ona") setTab("farzand");
        else setTab("bilim");

        setHolat("tayyor");
      } catch (e) {
        setXatoMatn(e.message);
        setHolat("xato");
      }
    }
    yukla();
  }, [token]);

  if (holat === "yuklanmoqda") {
    return <Qobiq><div className="text-center"><Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: "#1B4B7A" }} /><p className="text-sm" style={{ color: "#8A8578" }}>Yuklanmoqda...</p></div></Qobiq>;
  }
  if (holat === "xato") {
    return <Qobiq><div className="text-center"><WifiOff size={28} className="mx-auto mb-3" style={{ color: "#B0553A" }} /><p className="text-sm" style={{ color: "#B0553A" }}>{xatoMatn}</p></div></Qobiq>;
  }

  // Admin uchun — mahalliy ko'rinish rejimi; boshqalar uchun — haqiqiy rol
  const korinishRoli = foydalanuvchi?.is_admin ? adminKorinish : (foydalanuvchi?.role || "oquvchi");
  const joriyRang = joriyRangniHisobla(foydalanuvchi, korinishRoli);

  // O'qituvchining pastki menyusiga MUASSASA turiga qarab moslashuvchan
  // 1 ta qo'shimcha tugma — "Maktabim"/"Bog'cham"/"Universitetim"/
  // "Markazim" (rahbariyat bo'lsa — boshqaruv ekraniga, oddiy xodim
  // bo'lsa — o'z guruhi/sinfiga olib boradi).
  const MUASSASA_LABELLARI = {
    maktab: { nom: "Maktabim", korinish: "maktab_rahbariyat" },
    bogcha: { nom: "Bog'cham", korinish: "bogcha" },
    universitet: { nom: "Institutim", korinish: "institut_workspace" },
    markaz: { nom: "Markazim", korinish: "markaz_workspace" },
  };
  const birinchiMuassasa = muassasalarim[0];
  const muassasaBandi = birinchiMuassasa && MUASSASA_LABELLARI[birinchiMuassasa.turi]
    ? { kalit: "oqituvchi_muassasa", nom: MUASSASA_LABELLARI[birinchiMuassasa.turi].nom, ikon: Building2, korinish: MUASSASA_LABELLARI[birinchiMuassasa.turi].korinish }
    : null;

  const tabTanlandi = (yangiTab) => {
    if (yangiTab === "oqituvchi_muassasa" && muassasaBandi) {
      setOqituvchiBoshlanishKorinishi({ korinish: muassasaBandi.korinish, vaqt: Date.now() });
      setTab("oqituvchi");
    } else {
      if (yangiTab === "oqituvchi") setOqituvchiBoshlanishKorinishi({ korinish: "togarak", vaqt: Date.now() });
      setTab(yangiTab);
    }
  };

  const korinishOzgardi = (yangi) => {
    setAdminKorinish(yangi);
    setTab(yangi === "admin" ? "admin" : yangi === "oqituvchi" ? "oqituvchi" : yangi === "ota-ona" ? "farzand" : "bilim");
  };

  const tabMalumoti = {
    admin: ["Kontent boshqaruvi", "Shablon va import markazi"],
    admin_muassasalar: ["Muassasalar", "Ro'yxat, yaratish va boshqaruv markazi"],
    admin_testlar: ["Testlar", "Savollar va natijalarni boshqarish"],
    admin_mavzular: ["Mavzular", "DTS va ta’lim mazmuni"],
    admin_statistikalar: ["Statistikalar", "Tizimdan aniq o‘quvchigacha"],
    admin_moderatsiya: ["Moderatsiya", "Sifat va xavfsizlik nazorati"],
    oqituvchi: ["Ish maydoni", "Sinf, guruh va to‘garaklar"],
    oqituvchi_analitika: ["Statistikalar", "Ish joyi, guruh va o‘quvchi tahlili"],
    farzand: ["Farzand tahlili", "Bilim, faollik va keyingi qadamlar"],
    bilim: ["Mening tahlilim", "Barcha ta’lim muhitlaridagi rivojim"],
    ai_ustoz: ["AI Ustoz", "Sizga mos individual dars"],
    test: ["Test markazi", "Bilimni tekshirish va mustahkamlash"],
    xabar: ["Xabarlar", "Bildirishnoma va suhbatlar"],
    profil: ["Profil", "Shaxsiy ma’lumot va ulanishlar"],
  }[tab] || ["Ta’lim platformasi", "Yagona ta’lim ekotizimi"];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F7F5F0", backgroundImage: "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22260%22%20height%3D%22260%22%20viewBox%3D%220%200%20260%20260%22%3E%3Cg%20fill%3D%22none%22%20stroke%3D%22%23E3DECE%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cg%20transform%3D%22translate%2818%2C24%29%20rotate%28-12%29%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2230%22%20height%3D%2222%22%20rx%3D%222%22/%3E%3Cline%20x1%3D%2215%22%20y1%3D%220%22%20x2%3D%2215%22%20y2%3D%2222%22/%3E%3Cline%20x1%3D%224%22%20y1%3D%226%22%20x2%3D%2212%22%20y2%3D%226%22/%3E%3Cline%20x1%3D%224%22%20y1%3D%2211%22%20x2%3D%2212%22%20y2%3D%2211%22/%3E%3Cline%20x1%3D%2218%22%20y1%3D%226%22%20x2%3D%2226%22%20y2%3D%226%22/%3E%3Cline%20x1%3D%2218%22%20y1%3D%2211%22%20x2%3D%2226%22%20y2%3D%2211%22/%3E%3C/g%3E%3Cg%20transform%3D%22translate%28160%2C20%29%20rotate%2838%29%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%227%22%20height%3D%2232%22%20rx%3D%221.5%22/%3E%3Cpath%20d%3D%22M0%2032%20L3.5%2040%20L7%2032%20Z%22/%3E%3Cline%20x1%3D%220%22%20y1%3D%226%22%20x2%3D%227%22%20y2%3D%226%22/%3E%3C/g%3E%3Cg%20transform%3D%22translate%2870%2C110%29%20rotate%288%29%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2246%22%20height%3D%2210%22%20rx%3D%221.5%22/%3E%3Cline%20x1%3D%228%22%20y1%3D%220%22%20x2%3D%228%22%20y2%3D%225%22/%3E%3Cline%20x1%3D%2216%22%20y1%3D%220%22%20x2%3D%2216%22%20y2%3D%225%22/%3E%3Cline%20x1%3D%2224%22%20y1%3D%220%22%20x2%3D%2224%22%20y2%3D%225%22/%3E%3Cline%20x1%3D%2232%22%20y1%3D%220%22%20x2%3D%2232%22%20y2%3D%225%22/%3E%3Cline%20x1%3D%2240%22%20y1%3D%220%22%20x2%3D%2240%22%20y2%3D%225%22/%3E%3C/g%3E%3Cg%20transform%3D%22translate%28185%2C140%29%22%3E%3Crect%20x%3D%220%22%20y%3D%2210%22%20width%3D%2230%22%20height%3D%2234%22%20rx%3D%227%22/%3E%3Crect%20x%3D%227%22%20y%3D%220%22%20width%3D%2216%22%20height%3D%2214%22%20rx%3D%223%22/%3E%3Cline%20x1%3D%2215%22%20y1%3D%2220%22%20x2%3D%2215%22%20y2%3D%2234%22/%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2227%22%20r%3D%221.5%22%20fill%3D%22%23E3DECE%22%20stroke%3D%22none%22/%3E%3C/g%3E%3Cg%20transform%3D%22translate%2830%2C175%29%20rotate%28-25%29%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%226%22%20height%3D%2228%22%20rx%3D%222%22/%3E%3Cpath%20d%3D%22M0%2028%20L3%2035%20L6%2028%20Z%22/%3E%3Crect%20x%3D%220%22%20y%3D%22-4%22%20width%3D%226%22%20height%3D%225%22/%3E%3C/g%3E%3Cg%20transform%3D%22translate%28120%2C200%29%20rotate%28-10%29%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%2210%22/%3E%3Cline%20x1%3D%2210%22%20y1%3D%224%22%20x2%3D%2210%22%20y2%3D%2210%22/%3E%3Cline%20x1%3D%2210%22%20y1%3D%2210%22%20x2%3D%2214%22%20y2%3D%2213%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", backgroundRepeat: "repeat", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {kunlikMukofot > 0 && (
        <div className="fixed z-[100] top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-xl" style={{ backgroundColor: "#7A5412" }} role="status">
          🔥 +{kunlikMukofot} kunlik ochko
        </div>
      )}
      <style>{`
        button:not(:disabled) { transition: transform 0.12s ease, opacity 0.12s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease; }
        button:not(:disabled):active { transform: scale(0.97); }
        button:disabled { cursor: not-allowed; }
        input, textarea, select {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        input:focus-visible, textarea:focus-visible, select:focus-visible,
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #1B4B7A !important;
          box-shadow: 0 0 0 3px rgba(27,75,122,0.14);
          background-color: #FFFFFF;
        }
        /* Barcha chegarali kirish maydonlari — bir xil, nozik iliq fon
           (oq kartochkadan bir oz ajralib turadi), hover'da chegara
           bir oz to'qroq bo'ladi */
        input.border, textarea.border, select.border {
          background-color: #FAF8F2;
        }
        input.border:hover:not(:focus), textarea.border:hover:not(:focus), select.border:hover:not(:focus) {
          border-color: #C4BFAF;
        }
        input.border::placeholder, textarea.border::placeholder {
          color: #B0AA98;
        }
        button:focus-visible {
          outline: 2px solid #1B4B7A;
          outline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D8D3C7; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #C4BFAF; }
        /* Oq fonli kartochkalar — butun ilova bo'ylab bir xil, nozik
           "ko'tarilgan" ko'rinish (allaqachon shadow-sm bo'lganlarga
           ham zid kelmaydi, faqat kuchsizroq bazasini beradi) */
        .rounded-2xl.bg-white.border, .rounded-xl.bg-white.border {
          box-shadow: 0 1px 2px rgba(43,43,43,0.03), 0 2px 6px rgba(43,43,43,0.045);
        }
        /* "Bo'sh holat" kartochkalari (p-6 + text-center + oq fon) —
           barchasiga bir xil, nozik quti-ikonka, alohida-alohida
           yozib chiqmasdan */
        .rounded-2xl.p-6.text-center.bg-white.border::before {
          content: "";
          display: block;
          width: 44px;
          height: 44px;
          margin: 0 auto 12px;
          border-radius: 999px;
          background-color: #EAF1F7;
          background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%231B4B7A" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpolyline points="22 12 16 12 14 15 10 15 8 12 2 12"/%3E%3Cpath d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/%3E%3C/svg%3E');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 20px 20px;
        }
        /* Asosiy (oq matnli, qalin) tugmalar — butun ilova bo'ylab bir xil
           chuqurlik/soya, alohida-alohida yozib chiqmasdan */
        button.font-semibold.text-white:not(:disabled) {
          box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 3px 10px rgba(0,0,0,0.10);
        }
        button.font-semibold.text-white:not(:disabled):hover {
          box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 5px 16px rgba(0,0,0,0.15);
          filter: brightness(1.04);
        }
        button.font-semibold.text-white:not(:disabled):active {
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          filter: brightness(0.96);
        }
        /* Ikkinchi darajali (chegarali, oq fon) tugmalar — nozik hover */
        button.border:not(:disabled):hover {
          filter: brightness(0.98);
        }
        @media (prefers-reduced-motion: reduce) {
          button:not(:disabled) { transition: none; }
          button:not(:disabled):active { transform: none; }
        }
      `}</style>
      <div className="premium-app-shell" style={{ "--role-accent": joriyRang }}>
        <main className="premium-app-main">
          <header className="premium-topbar">
            <div>
              <p>{tabMalumoti[1]}</p>
              <h1>{tabMalumoti[0]}</h1>
            </div>
            <div className="premium-top-actions">
              <span className="premium-role-pill">{korinishRoli === "admin" ? "Administrator" : korinishRoli === "oqituvchi" ? "O‘qituvchi" : korinishRoli === "ota-ona" ? "Ota-ona" : "O‘quvchi"}</span>
              <button onClick={() => tabTanlandi("xabar")} aria-label="Xabarlar"><Bell size={18} /></button>
              <button onClick={() => tabTanlandi("profil")} className="premium-top-avatar"
                aria-label="Profil va sozlamalar" title="Profil va sozlamalar">
                {(foydalanuvchi?.full_name || "TA").trim().split(/\s+/).slice(0, 2).map((q) => q[0]).join("").toUpperCase()}
              </button>
            </div>
          </header>
          <div className="premium-page-stage">
      {korinishRoli === "admin" && tab === "admin" && <AdminTab token={token} oldindanTanlangan={shablonOldindanTanlangan} />}
      {korinishRoli === "admin" && tab === "admin_muassasalar" && <AdminMuassasalarTab token={token} />}
      {korinishRoli === "admin" && tab === "admin_testlar" && <AdminTestlarTab token={token} />}
      {korinishRoli === "admin" && tab === "admin_mavzular" && (
        <TopikMavzularTab token={token} onTestYarat={(topicCode) => { setShablonOldindanTanlangan([topicCode]); setTab("admin"); }} />
      )}
      {korinishRoli === "admin" && tab === "admin_statistikalar" && (
        <AdminStatisticsTab token={token} />
      )}
      {korinishRoli === "admin" && tab === "admin_moderatsiya" && <ModeratsiyaTab token={token} />}
      {korinishRoli === "oqituvchi" && tab === "oqituvchi" && (
        <OqituvchiTab token={token} foydalanuvchi={foydalanuvchi} boshlanishKorinishi={oqituvchiBoshlanishKorinishi} />
      )}
      {korinishRoli === "oqituvchi" && tab === "oqituvchi_analitika" && (
        <TeacherAnalyticsPanel
          token={token}
          initialWorkplace={birinchiMuassasa}
          onBack={() => setTab("oqituvchi")}
        />
      )}
      {korinishRoli === "ota-ona" && tab === "farzand" && <OtaOnaTab token={token} foydalanuvchi={foydalanuvchi} rang={joriyRang} />}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "bilim" && (
        <BilimMarkazi
          token={token}
          data={bilimData}
          bolaId={foydalanuvchi?.user_id}
          rang={joriyRang}
          onOpenTest={(topic) => {
            setTalimYoliTestNishoni({ ...topic, nonce: Date.now() });
            setTab("test");
          }}
          onOpenLesson={(topic) => {
            setTalimYoliDarsNishoni({ ...topic, nonce: Date.now() });
            setTab("ai_ustoz");
          }}
        />
      )}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "ai_ustoz" && (
        <AiOquvchiUstozBolimi token={token} initialTarget={talimYoliDarsNishoni} />
      )}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "test" && (
        <TestTab
          token={token}
          sinf={foydalanuvchi?.class}
          foydalanuvchi={foydalanuvchi}
          rang={joriyRang}
          oyinProfil={oyinProfil}
          onOyinProfilYangilandi={setOyinProfil}
          onTestFaollik={setTestDavomida}
          initialTarget={talimYoliTestNishoni}
        />
      )}
      {tab === "xabar" && <XabarlarTab token={token} />}
      {tab === "profil" && (
        <ProfilTab token={token} foydalanuvchi={foydalanuvchi} onYangilandi={setFoydalanuvchi}
          adminKorinish={adminKorinish} onKorinishOzgar={korinishOzgardi} rang={joriyRang} />
      )}
          </div>
        </main>
      <PastkiMenyu faol={tab === "oqituvchi" && muassasaBandi && oqituvchiBoshlanishKorinishi?.korinish === muassasaBandi.korinish ? "oqituvchi_muassasa" : tab}
        onTanlash={tabTanlandi} rol={korinishRoli} rang={joriyRang} bloklangan={testDavomida}
        qoshimchaBand={muassasaBandi} foydalanuvchi={foydalanuvchi} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASOSIY — URL manziliga qarab qaysi ekranni ko'rsatishni hal qiladi
// ═══════════════════════════════════════════════════════════
let _boshlangichYolKeshi = null;

function _boshlangichYolniOl() {
  // React StrictMode initializer'ni development'da ikki marta chaqiradi.
  // Birinchi chaqiriqda URL tozalangandan keyin OAuth signalini yo'qotmaslik
  // uchun bir marta o'qilgan qiymatni modul doirasida saqlaymiz.
  if (_boshlangichYolKeshi) return _boshlangichYolKeshi;
  const p = window.location.pathname;
  const q = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  _boshlangichYolKeshi = {
    p,
    token: q.get("token"),
    email: q.get("email"),
    ism: q.get("ism"),
    oauthTicket: fragment.get("oauth_ticket"),
    oauthXato: fragment.get("oauth_xato"),
  };
  // 60 soniyalik OAuth ticket fragmenti (va eski oqimdan qolishi mumkin
  // bo'lgan sezgir query'lar) birinchi render boshlanishidayoq tarixdan o'chadi.
  if (
    ["token", "email", "ism"].some((key) => q.has(key))
    || ["oauth_ticket", "oauth_xato"].some((key) => fragment.has(key))
  ) {
    window.history.replaceState({}, document.title, p);
  }
  return _boshlangichYolKeshi;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [yol] = useState(_boshlangichYolniOl);
  const [oauthYuklanmoqda, setOauthYuklanmoqda] = useState(Boolean(yol.oauthTicket));
  const [oauthProfil, setOauthProfil] = useState(null);
  const oauthAlmashinuviBoshlandi = useRef(false);

  useEffect(() => {
    if (!yol.oauthTicket || oauthAlmashinuviBoshlandi.current) return;
    oauthAlmashinuviBoshlandi.current = true;
    fetch(`${API_BASE}/auth/google/exchange`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket: yol.oauthTicket }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || "Google orqali kirib bo'lmadi");
        if (data.holat === "kirdi" && data.token) setToken(data.token);
        else if (data.holat === "ulash" && data.email && data.oauth_grant) {
          setOauthProfil({
            email: data.email,
            ism: data.ism || "",
            oauthGrant: data.oauth_grant,
          });
        } else throw new Error("Google kirish javobi noto'g'ri");
      })
      .catch(() => {
        // Avvalgi UI xulqi saqlanadi: bekor qilingan/eskirgan kirish Login'ga qaytadi.
      })
      .finally(() => setOauthYuklanmoqda(false));
  }, [yol.oauthTicket]);

  if (token) return <Kabinet token={token} />;
  if (oauthYuklanmoqda) {
    return (
      <Qobiq>
        <div className="py-10 text-center">
          <Loader2 size={26} className="animate-spin mx-auto mb-3" style={{ color: "#1B4B7A" }} />
          <p className="text-sm" style={{ color: "#5A5648" }}>Google orqali kirilmoqda…</p>
        </div>
      </Qobiq>
    );
  }
  if (oauthProfil) {
    return <UlashEkrani email={oauthProfil.email} ism={oauthProfil.ism} oauthGrant={oauthProfil.oauthGrant} onUlandi={setToken} />;
  }
  if (yol.p === "/kabinet" && yol.token) return <Kabinet token={yol.token} />;
  if (yol.p === "/ulash" && yol.email) return <UlashEkrani email={yol.email} ism={yol.ism} onUlandi={setToken} />;
  return <LoginEkrani />;
}
