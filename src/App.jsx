import React, { useState, useEffect, useRef, useMemo } from "react";
import katex from "katex";
import { HUDUDLAR, VILOYATLAR } from "./hududlar.js";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  ChevronRight, ChevronDown, TrendingUp, BarChart3, Bell, User,
  Loader2, WifiOff, KeyRound, UserPlus, PencilLine, Users, FileSpreadsheet, Heart, BookOpen,
} from "lucide-react";

const API_BASE = "https://talimplatformasi-production.up.railway.app";

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
  return /^\d+(-\d+){5,9}$/.test(String(qiymat).trim());
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

function OvozliOqishTugmasi({ matn, kontentId, oqilayotganId, setOqilayotganId, joriySozIndeksi, setJoriySozIndeksi }) {
  const oqilyaptimi = oqilayotganId === kontentId;

  const boshla = () => {
    window.speechSynthesis.cancel();
    const sozlar = matn.split(/(\s+)/);
    let pozitsiya = 0;
    const sozPozitsiyalari = sozlar.map((s) => { const p = pozitsiya; pozitsiya += s.length; return p; });
    const utterance = new SpeechSynthesisUtterance(matn);
    utterance.lang = "uz-UZ";
    utterance.onboundary = (e) => {
      if (e.name && e.name !== "word") return;
      let idx = 0;
      for (let i = 0; i < sozPozitsiyalari.length; i++) {
        if (sozPozitsiyalari[i] <= e.charIndex) idx = i; else break;
      }
      setJoriySozIndeksi(idx);
    };
    utterance.onend = () => { setOqilayotganId(null); setJoriySozIndeksi(-1); };
    setOqilayotganId(kontentId);
    window.speechSynthesis.speak(utterance);
  };

  const toxtat = () => {
    window.speechSynthesis.cancel();
    setOqilayotganId(null);
    setJoriySozIndeksi(-1);
  };

  return (
    <button onClick={oqilyaptimi ? toxtat : boshla}
      className="text-xs font-semibold mt-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
      {oqilyaptimi ? "⏸ To'xtatish" : "🔊 O'qib berish"}
    </button>
  );
}

function SavolRasmi({ rasmId }) {
  const [holat, setHolat] = useState("yuklanmoqda"); // yuklanmoqda | tayyor | xato
  useEffect(() => { setHolat("yuklanmoqda"); }, [rasmId]);

  if (holat === "xato") {
    return (
      <div className="w-full rounded-xl mb-4 flex flex-col items-center justify-center gap-1.5 py-8"
        style={{ backgroundColor: "#F1EFE8", border: "1px dashed #C4BFAF" }}>
        <span className="text-2xl">🖼️</span>
        <span className="text-xs font-medium" style={{ color: "#8A8578" }}>Rasm topilmadi</span>
      </div>
    );
  }
  return (
    <div className="relative mb-4">
      {holat === "yuklanmoqda" && (
        <div className="w-full rounded-xl flex items-center justify-center py-10" style={{ backgroundColor: "#F1EFE8" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "#8A8578" }} />
        </div>
      )}
      <img src={`${API_BASE}/api/rasm/${rasmId}`} alt=""
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
  // is_latex=true bo'lsa — $...$ ichidagi formulalarni KaTeX bilan chizadi,
  // qolgan matnni oddiy tekst sifatida qoldiradi (matn va formula aralash bo'lishi mumkin).
  const toza = tegsizKorsat(matn) || "";
  if (!latex || !toza.includes("$")) return <>{toza}</>;
  const qismlar = toza.split(/(\$[^$]+\$)/g);
  return (
    <>
      {qismlar.map((q, i) => {
        if (q.startsWith("$") && q.endsWith("$") && q.length > 1) {
          try {
            const html = katex.renderToString(q.slice(1, -1), { throwOnError: false, output: "html" });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{q}</span>;
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

function Logotip() {
  return (
    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 grid grid-cols-2 grid-rows-2 gap-0.5 p-1.5" style={{ backgroundColor: "#1B4B7A" }}>
      <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
      <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
    </div>
  );
}

function Qobiq({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F5F0" }}>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 1) KIRISH — Google tugmasi
// ═══════════════════════════════════════════════════════════
function LoginEkrani() {
  return (
    <Qobiq>
      <div className="text-center mb-8">
        <Logotip />
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>TA'LIM PLATFORMASI</h1>
        <p className="text-sm mt-1" style={{ color: "#8A8578" }}>Farzandingiz bilimini kuzating</p>
      </div>
      <button
        onClick={() => { window.location.href = `${API_BASE}/auth/google/login`; }}
        className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
        style={{ backgroundColor: "#1B4B7A" }}
      >
        Google orqali kirish
      </button>
      <p className="text-xs text-center mt-4" style={{ color: "#B0AA98" }}>
        Birinchi marta kirsangiz, keyingi ekranda tanlov beriladi
      </p>
    </Qobiq>
  );
}

// ═══════════════════════════════════════════════════════════
// 2) ULASH — Google email topildi, lekin bot hisobiga ULANMAGAN
// ═══════════════════════════════════════════════════════════
function UlashEkrani({ email, ism, onUlandi }) {
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
        body: JSON.stringify({ email, kod: kod.trim() }),
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
          email, ism: ismInput.trim(), rol,
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
        <button onClick={() => setRejim(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
      <button onClick={() => setRejim(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
            <p className="text-sm p-3 rounded-lg leading-relaxed" style={{ backgroundColor: "#FFFFFF", color: "#2B2B2B" }}>{tushuntirish}</p>
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
        <button onClick={onYopish} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
        <button onClick={onYopish} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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

function BilimTab({ data, bolaId, rang, token }) {
  const heroRang = rang || "#1B4B7A";
  const [yolFani, setYolFani] = useState(null); // {fan, rang} | null
  const [togarakYoliId, setTogarakYoliId] = useState(null); // ochilgan to'garak yo'li id | null
  const [mengaTogaraklarim, setMenTogaraklarim] = useState([]);
  const [bugungiTavsiya, setBugungiTavsiya] = useState(null); // {tavsiyalar: [...]} | null (hali yuklanmagan)
  const [haftalik, setHaftalik] = useState(null); // {jami_mavzu, ortacha_ball, ...} | null (hali yuklanmagan)
  const [davomat, setDavomat] = useState(null); // {jami_kun, keldi, kelmadi, ketma_ket_kelmagan} | null
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

  // FAQAT o'quvchining O'Z Bilim ekranida (token mavjud bo'lganda) —
  // ota-ona farzandini ko'rayotganda BU banner ko'rinmaydi, chunki
  // sinfga qo'shilishni faqat o'quvchining o'zi tasdiqlashi kerak.
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/oquvchi/mos_sinf?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMosSinf(d.topildi ? d : null))
      .catch(() => {});
  }, [token]);

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

// ═══════════════════════════════════════════════════════════
// 4) TEST YECHISH
// ═══════════════════════════════════════════════════════════
function TestTab({ token, sinf: sinfXom, turi = "oddiy", onTestFaollik }) {
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

  // Kabinetga "test hozir davom etyapti" holatini bildiramiz — shu payt
  // pastki menyu orqali boshqa bo'limga o'tib bo'lmaydi (test tugatilishi
  // yoki to'xtatilishi kerak).
  useEffect(() => {
    if (onTestFaollik) onTestFaollik(holat === "savollar");
    return () => { if (onTestFaollik) onTestFaollik(false); };
  }, [holat, onTestFaollik]);

  useEffect(() => {
    setYuklanmoqda(true);
    const qs = new URLSearchParams({ turi: faolTuri });
    // boshqaSinflarRejimi paytida o'quvchining O'Z sinfi bilan CHEKLAMAYMIZ —
    // aks holda to'garak/maxsus guruhlar bo'yicha qidiruv natija bermaydi.
    if (sinf && !boshqaSinflarRejimi) qs.set("sinf", sinf);
    fetch(`${API_BASE}/api/mavzular?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
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
  const joriySinfMalumoti = sinf
    ? sinflarRoyxati.find((s) => String(s.sinf) === String(sinf)) || sinflarRoyxati[0]
    : sinflarRoyxati.find((s) => String(s.sinf) === String(tanlanganSinf));

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
    });
    setHolat("songi");
  };

  const [qiyinlik, setQiyinlik] = useState(""); // "" = aralash | oson | o'rta | qiyin | murakkab
  const [rasimli, setRasimli] = useState(null); // null=aralash | true=rasimli | false=rasimsiz
  const [vaqtli, setVaqtli] = useState(null);
  const [yozuvli, setYozuvli] = useState(null);
  const [mosSoni, setMosSoni] = useState(null); // null = hali yuklanmoqda

  useEffect(() => {
    if (holat !== "songi" || !tanlanganMavzu) return;
    let bekor = false;
    setMosSoni(null);
    const so_rov = tanlanganMavzu.aralash
      ? fetch(`${API_BASE}/api/test_aralash/soni`, {
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
          return fetch(`${API_BASE}/api/test/${tanlanganMavzu.topic_code}/soni?${qs.toString()}`);
        })();
    so_rov
      .then((r) => r.json())
      .then((d) => { if (!bekor) setMosSoni(d.soni ?? 0); })
      .catch((e) => { if (!bekor) { setMosSoniXatoMatni(`So'rov xatosi: ${e.message}`); setMosSoni(0); } });
    return () => { bekor = true; };
  }, [holat, tanlanganMavzu, qiyinlik, rasimli, vaqtli, yozuvli]);
  const [toGriSoni, setToGriSoni] = useState(0);
  const [xatoSoni, setXatoSoni] = useState(0);

  const savollarniYukla = async (soni) => {
    setYuklanmoqda(true); setXato("");
    try {
      let res;
      if (tanlanganMavzu.aralash) {
        res = await fetch(`${API_BASE}/api/test_aralash`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic_codes: tanlanganMavzu.kodlar || [], soni, qiyinlik: qiyinlik || undefined,
            rasimli, vaqtli, yozuvli,
          }),
        });
      } else {
        const qs = new URLSearchParams({ soni });
        if (qiyinlik) qs.set("qiyinlik", qiyinlik);
        if (rasimli !== null) qs.set("rasimli", rasimli);
        if (vaqtli !== null) qs.set("vaqtli", vaqtli);
        if (yozuvli !== null) qs.set("yozuvli", yozuvli);
        res = await fetch(`${API_BASE}/api/test/${tanlanganMavzu.topic_code}?${qs.toString()}`);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSavollar(data.savollar);
      setJavoblar({}); setJoriySavol(0); setJoriyNatija(null); setYozibJavob({}); setHolat("savollar");
      setToGriSoni(0); setXatoSoni(0);
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const [yozibJavob, setYozibJavob] = useState({}); // {savol_id: xom_matn} — bir nechta savol bir vaqtda ko'rinadi
  const [ovozOynayapti, setOvozOynayapti] = useState(false);
  const ovozRef = useRef(null);

  const ovozniOqi = (matn) => {
    if (ovozRef.current) { ovozRef.current.pause(); ovozRef.current = null; }
    setOvozOynayapti(true);
    const audio = new Audio(`${API_BASE}/api/ovoz?matn=${encodeURIComponent(matn)}`);
    ovozRef.current = audio;
    audio.onended = () => setOvozOynayapti(false);
    audio.onerror = () => setOvozOynayapti(false);
    audio.play().catch(() => setOvozOynayapti(false));
  };

  const [testRejimi, setTestRejimi] = useState("bir_bir"); // "bir_bir" (mashq, darhol javob) | "hammasi" (imtihon, oxirida bilinadi)
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
    if (timerRef.current) clearInterval(timerRef.current);
    setJavoblar((prev) => ({ ...prev, [savolId]: harf }));
    try {
      const res = await fetch(`${API_BASE}/api/test/javob_tekshir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savol_id: savolId, tanlangan: harf }),
      });
      const data = await res.json();
      setJoriyNatija(data);
      if (data.togrimi) setToGriSoni((v) => v + 1); else setXatoSoni((v) => v + 1);
    } catch {
      setJoriyNatija({ togrimi: false, togri_javob: "?", tushuntirish: "" });
      setXatoSoni((v) => v + 1);
    }
  };

  // "hammasi" (yangi, imtihon) rejimi uchun — javobni FAQAT yozib qo'yadi,
  // TEKSHIRMAYDI — to'g'ri/noto'g'ri faqat "Yakunlash"dan keyin, natija
  // ekranida ma'lum bo'ladi (haqiqiy imtihon uslubi).
  const javobYoz = (savolId, harf) => {
    setJavoblar((prev) => ({ ...prev, [savolId]: harf }));
  };

  const keyingiSavolga = () => {
    if (avtoRef.current) clearInterval(avtoRef.current);
    setJoriyNatija(null);
    setYozibJavob({});
    if (joriySavol < savollar.length - 1) setJoriySavol(joriySavol + 1);
    else yakunla();
  };

  // Javob ko'rsatilgach (to'g'ri/noto'g'ri chiqqach), 4 soniyadan keyin
  // AVTOMATIK keyingi savolga o'tadi — foydalanuvchi tugma bosishi shart emas
  // (faqat "bir_bir" rejimida ishlaydi).
  useEffect(() => {
    if (!joriyNatija) { setAvtoQoldi(null); return; }
    setAvtoQoldi(4);
    avtoRef.current = setInterval(() => {
      setAvtoQoldi((v) => {
        if (v <= 1) {
          clearInterval(avtoRef.current);
          keyingiSavolga();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(avtoRef.current);
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
    setYuklanmoqda(true);
    const ro_yxat = Object.entries(javoblar).map(([id, tanlangan]) => ({
      savol_id: parseInt(id, 10), tanlangan,
    }));
    try {
      const res = await fetch(`${API_BASE}/api/test/natija`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tanlanganMavzu.aralash
            ? { token, topic_codes: tanlanganMavzu.kodlar, javoblar: ro_yxat, jami_savol_soni: savollar.length }
            : { token, topic_code: tanlanganMavzu.topic_code, javoblar: ro_yxat, jami_savol_soni: savollar.length }
        ),
      });
      const data = await res.json();
      setNatija(data);
      setHolat("natija");
    } catch (e) {
      setXato("Natijani yuborib bo'lmadi");
    } finally { setYuklanmoqda(false); }
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
    setHolat("mavzular"); setTanlanganMavzu(null); setSavollar([]); setNatija(null);
    setUmumiyVaqt(null); setYozibJavob({}); setJoriySavol(0); setJoriyNatija(null);
  };

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
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

        {natija.xatolar && natija.xatolar.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>
              ❌ Xato javoblar ({natija.xatolar.length} ta)
            </p>
            <div className="space-y-3">
              {natija.xatolar.map((x) => (
                <div key={x.savol_id} className="rounded-xl p-4 border" style={{ borderColor: "#F3D3D3", backgroundColor: "#FCEBEB" }}>
                  <p className="text-sm font-medium mb-2" style={{ color: "#2B2B2B" }}>{x.savol}</p>
                  <p className="text-xs mb-1" style={{ color: "#A32D2D" }}>Sizning javobingiz: <b>{x.sizning_javob}</b></p>
                  <p className="text-xs" style={{ color: "#3B6D11" }}>To'g'ri javob: <b>{x.togri_javob}</b></p>
                  {x.tushuntirish && <p className="text-xs mt-1.5" style={{ color: "#5A5648" }}>{x.tushuntirish}</p>}
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
    const variantlar = (tanlanganMavzu.aralash ? [10, 15, 20, 25, 30, 35, 40, 45, 50] : [5, 10, 15]).filter((n) => n < jami);
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("mavzular")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
        <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganMavzu.fanNomi}</p>

        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>🧭 Test uslubi</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => setTestRejimi("bir_bir")}
              className="rounded-xl p-3.5 text-left border-2"
              style={testRejimi === "bir_bir" ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" } : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#2B2B2B" }}>📖 Bittalab</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Har javobdan keyin darhol to'g'ri/noto'g'ri ko'rinadi — mashq uchun</p>
            </button>
            <button onClick={() => setTestRejimi("hammasi")}
              className="rounded-xl p-3.5 text-left border-2"
              style={testRejimi === "hammasi" ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" } : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#2B2B2B" }}>📜 Hammasi birga</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>Natija faqat yakunlaganda ko'rinadi — imtihon uslubida</p>
            </button>
          </div>
        </div>

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

        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#2B2B2B" }}>
            🔢 Nechta savol yechasiz?
            {mosSoni === null && <Loader2 size={14} className="animate-spin" style={{ color: "#8A8578" }} />}
          </p>
          {mosSoni === null ? (
            <p className="text-xs py-3 text-center" style={{ color: "#8A8578" }}>Mos savollar soni tekshirilmoqda...</p>
          ) : mosSoni === 0 ? (
            <p className="text-xs py-3 text-center rounded-xl" style={{ color: "#B0553A", backgroundColor: "#FCEBEB" }}>
              Bu sozlamalar bo'yicha mos savol topilmadi — boshqa sozlamani tanlang.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {variantlar.map((n) => (
                  <button key={n} onClick={() => savollarniYukla(n)}
                    className="py-3.5 rounded-xl border font-semibold text-center text-sm"
                    style={{ borderColor: "#E5E1D8", backgroundColor: "#F7F5F0", color: "#2B2B2B" }}>
                    {n} ta
                  </button>
                ))}
              </div>
              <button onClick={() => savollarniYukla(jami)}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-center text-sm"
                style={{ backgroundColor: "#1B4B7A" }}>
                🚀 Hammasi ({jami} ta)
              </button>
            </>
          )}
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
          <button
            onClick={() => ovozniOqi(yozuvli
              ? s.question
              : `${s.question}. A) ${s.option_a}. B) ${s.option_b}. C) ${s.option_c}. D) ${s.option_d}`)}
            disabled={ovozOynayapti}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A", opacity: ovozOynayapti ? 0.6 : 1 }}
            title="Ovoz chiqarib o'qish">
            {ovozOynayapti ? <Loader2 size={16} className="animate-spin" /> : "🔊"}
          </button>
        </h2>

        {yozuvli ? (
          <div className="mb-4">
            <input type="text" value={javobBerilgan ? (javoblar[s.id] || "") : (yozibJavob[s.id] || "")}
              onChange={(e) => setYozibJavob((prev) => ({ ...prev, [s.id]: e.target.value }))}
              disabled={javobBerilgan}
              onKeyDown={(e) => { if (e.key === "Enter" && !javobBerilgan && (yozibJavob[s.id] || "").trim()) javobBerVaTekshir(s.id, yozibJavob[s.id].trim()); }}
              placeholder="Javobingizni yozing..."
              className="w-full px-4 py-3.5 rounded-xl border text-sm mb-3"
              style={javobBerilgan
                ? { borderColor: joriyNatija.togrimi ? "#639922" : "#E24B4A", backgroundColor: joriyNatija.togrimi ? "#EAF3DE" : "#FCEBEB" }
                : { borderColor: "#E5E1D8" }} />
            {!javobBerilgan && (
              <button onClick={() => (yozibJavob[s.id] || "").trim() && javobBerVaTekshir(s.id, yozibJavob[s.id].trim())}
                disabled={!(yozibJavob[s.id] || "").trim()}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                style={{ backgroundColor: "#1B4B7A", opacity: (yozibJavob[s.id] || "").trim() ? 1 : 0.5 }}>
                Javobni yuborish
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 mb-4">
            {variantlar.map(([harf, matn]) => (
              <button key={harf} onClick={() => !javobBerilgan && javobBerVaTekshir(s.id, harf)} disabled={javobBerilgan}
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
            <p className="text-sm font-semibold mb-1" style={{ color: joriyNatija.togrimi ? "#3B6D11" : "#A32D2D" }}>
              {joriyNatija.togrimi ? "✓ To'g'ri!" : `✗ Noto'g'ri — to'g'ri javob: ${joriyNatija.togri_javob}`}
            </p>
            {joriyNatija.tushuntirish && (
              <p className="text-sm" style={{ color: joriyNatija.togrimi ? "#3B6D11" : "#A32D2D" }}>{joriyNatija.tushuntirish}</p>
            )}
          </div>
        )}

        {javobBerilgan ? (
          <button onClick={keyingiSavolga} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
            {(oxirgi ? "Yakunlash" : "Keyingi savol")}{avtoQoldi ? ` (${avtoQoldi})` : ""}
          </button>
        ) : (
          <p className="text-center text-xs" style={{ color: "#B0AA98" }}>Javobni tanlang</p>
        )}

        {toxtatishModali && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
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
                className="rounded-2xl p-4 bg-white border" style={{ borderColor: javobBerilgan ? "#F5DFA3" : "#E5E1D8" }}>
                <p className="text-xs font-medium mb-3" style={{ color: "#8A8578" }}>{i + 1}-savol</p>

                {s.rasm_id && (haqiqiyRasmKodimi(s.rasm_id)
                  ? <SavolRasmi rasmId={s.rasm_id} />
                  : <SavolFormulasi ifoda={s.rasm_id} />)}

                <h2 className="text-lg font-semibold mb-4 flex items-start gap-2" style={{ color: "#2B2B2B" }}>
                  <span className="flex-1"><Matn matn={s.question} latex={s.is_latex} /></span>
                  <button
                    onClick={() => ovozniOqi(yozuvli
                      ? s.question
                      : `${s.question}. A) ${s.option_a}. B) ${s.option_b}. C) ${s.option_c}. D) ${s.option_d}`)}
                    disabled={ovozOynayapti}
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A", opacity: ovozOynayapti ? 0.6 : 1 }}
                    title="Ovoz chiqarib o'qish">
                    {ovozOynayapti ? <Loader2 size={16} className="animate-spin" /> : "🔊"}
                  </button>
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
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
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
            <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
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

// ═══════════════════════════════════════════════════════════
// 5) O'QITUVCHI — guruhlarim, baholash
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// 7) ADMIN — Test shablon yuklab olish / import qilish
// ═══════════════════════════════════════════════════════════
function TopikMavzularTab({ token, onTestYarat }) {
  const [holat, setHolat] = useState("sinf"); // sinf | fan | mavzular
  const [sinflar, setSinflar] = useState({ oddiy: [], togarak: [] });
  const [tanlanganSinf, setTanlanganSinf] = useState(null);
  const [fanlar, setFanlar] = useState([]);
  const [tanlanganFan, setTanlanganFan] = useState(null);
  const [mavzular, setMavzular] = useState([]);
  const [sahifa, setSahifa] = useState(0);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  const [mavzuOchirishTasdiqi, setMavzuOchirishTasdiqi] = useState(null); // mavzu obyekti | null
  const [fanOchirishTasdiqi, setFanOchirishTasdiqi] = useState(false);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);
  const [rasmGaleriyasi, setRasmGaleriyasi] = useState(null); // {sarlavha, rasmlar: [id,...]} | null
  const [rasmlarYuklanmoqda, setRasmlarYuklanmoqda] = useState(false);
  const [umumiyKorinish, setUmumiyKorinish] = useState(null); // {sinflar: [...]} | null (ochilganda yuklanadi)
  const [umumiyYuklanmoqda, setUmumiyYuklanmoqda] = useState(false);

  const umumiyKorinishniOch = () => {
    setUmumiyKorinish({ sinflar: [] });
    setUmumiyYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_umumiy_korinish?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setUmumiyKorinish(d); setUmumiyYuklanmoqda(false); })
      .catch(() => { setXato("Umumiy ko'rinishni yuklab bo'lmadi"); setUmumiyYuklanmoqda(false); });
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setSinflar(d); setYuklanmoqda(false); })
      .catch(() => { setXato("Sinflarni yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token]);

  const sinfTanlandi = (sinf) => {
    setTanlanganSinf(sinf);
    setHolat("fan");
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Fanlarni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const mavzularniQaytaYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const fanTanlandi = (fan) => {
    setTanlanganFan(fan);
    setHolat("mavzular");
    setSahifa(0);
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  // "Umumiy ko'rinish" dan bevosita bosilganda — sinf VA fanni BIRDANIGA,
  // aniq (state kutmasdan) tanlaydi — tanlanganSinf holati hali
  // yangilanmagan bo'lishi mumkinligi sababli fanTanlandi(fan) yolg'iz
  // yetarli emas.
  const sinfVaFanTanlandi = (sinf, fan) => {
    setUmumiyKorinish(null);
    setTanlanganSinf(sinf);
    setTanlanganFan(fan);
    setHolat("mavzular");
    setSahifa(0);
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(sinf)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const mavzuTestlariniOchir = async (mavzu) => {
    setOchirilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/mavzu_testlarini_ochir?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`, {
        method: "DELETE",
      });
      setMavzuOchirishTasdiqi(null);
      mavzularniQaytaYukla();
    } catch {
      setXato("O'chirib bo'lmadi");
    } finally { setOchirilmoqda(false); }
  };

  const fanTestlariniOchir = async () => {
    setOchirilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/fan_testlarini_ochir?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`, {
        method: "DELETE",
      });
      setFanOchirishTasdiqi(false);
      mavzularniQaytaYukla();
    } catch {
      setXato("O'chirib bo'lmadi");
    } finally { setOchirilmoqda(false); }
  };

  const rasmlarniKor = async (mavzu) => {
    setRasmlarYuklanmoqda(true);
    setRasmGaleriyasi({ sarlavha: mavzu.nomi, rasmlar: [] });
    try {
      const res = await fetch(`${API_BASE}/api/admin/mavzu_rasmlari?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`);
      const data = await res.json();
      setRasmGaleriyasi({ sarlavha: mavzu.nomi, rasmlar: data.rasmlar || [] });
    } catch {
      setXato("Rasmlarni yuklab bo'lmadi");
    } finally { setRasmlarYuklanmoqda(false); }
  };

  if (holat === "sinf") {
    return (
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Topik mavzular</h1>
          <button onClick={umumiyKorinishniOch}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            📊 Umumiy ko'rinish
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>Kontent auditi — qaysi mavzuda test bor, qaysisida yo'q.</p>
        {xato && <p className="text-sm mb-4" style={{ color: "#B0553A" }}>{xato}</p>}
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <>
            <p className="text-xs font-semibold mb-2" style={{ color: "#5A5648" }}>🏫 Oddiy sinflar</p>
            <div className="grid grid-cols-6 gap-1.5 mb-5">
              {sinflar.oddiy.map((s) => (
                <button key={s} onClick={() => sinfTanlandi(s)}
                  className="py-2.5 rounded-lg border text-sm font-semibold text-center"
                  style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", color: "#5A5648" }}>
                  {s}
                </button>
              ))}
            </div>
            {sinflar.togarak.length > 0 && (
              <>
                <p className="text-xs font-semibold mb-2" style={{ color: "#5A5648" }}>🔀 To'garak sinflari</p>
                <div className="flex gap-1.5 flex-wrap">
                  {sinflar.togarak.map((s) => (
                    <button key={s} onClick={() => sinfTanlandi(s)}
                      className="px-3 py-2 rounded-lg border text-sm font-medium"
                      style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", color: "#5A5648" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {umumiyKorinish && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
            <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
              <button onClick={() => setUmumiyKorinish(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Yopish</button>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📊 Umumiy ko'rinish</h1>
              <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Barcha sinf va fanlar — bir ekranda, alohida kirmasdan.</p>
              {umumiyYuklanmoqda ? (
                <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
              ) : umumiyKorinish.sinflar.length === 0 ? (
                <p className="text-sm" style={{ color: "#8A8578" }}>Hozircha ma'lumot yo'q.</p>
              ) : (
                <div className="space-y-5">
                  {umumiyKorinish.sinflar.map((s) => (
                    <div key={s.sinf}>
                      <p className="text-sm font-bold mb-2.5" style={{ color: "#2B2B2B" }}>
                        {/^\d+$/.test(s.sinf) ? `${s.sinf}-sinf` : s.sinf}
                      </p>
                      <div className="space-y-2">
                        {s.fanlar.map((f) => {
                          const foiz = f.jami_mavzu ? Math.round((f.testli_mavzu / f.jami_mavzu) * 100) : 0;
                          const rang = fanRangiOl(f.nom);
                          return (
                            <button key={f.nom}
                              onClick={() => sinfVaFanTanlandi(s.sinf, f.nom)}
                              className="w-full rounded-xl p-3 bg-white border text-left" style={{ borderColor: "#E5E1D8" }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}</span>
                                <span className="text-xs font-semibold shrink-0" style={{ color: rang }}>{f.testli_mavzu}/{f.jami_mavzu}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEBE1" }}>
                                <div className="h-full rounded-full" style={{ width: `${foiz}%`, backgroundColor: rang }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (holat === "fan") {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("sinf")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Sinflar</button>
        <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>{tanlanganSinf}{/^\d+$/.test(tanlanganSinf) ? "-sinf" : ""} fanlari</h1>
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : fanlar.length === 0 ? (
          <p className="text-sm" style={{ color: "#8A8578" }}>Bu sinfda hali fan mavjud emas.</p>
        ) : (
          <div className="space-y-2">
            {fanlar.map((f) => (
              <button key={f.nom} onClick={() => fanTanlandi(f.nom)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border text-left"
                style={{ borderColor: "#E5E1D8" }}>
                <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}</span>
                <span className="text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni} yozuv →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // holat === "mavzular"
  const SAHIFA_HAJMI = 10;
  const korinadigan = mavzular.slice(sahifa * SAHIFA_HAJMI, sahifa * SAHIFA_HAJMI + SAHIFA_HAJMI);
  const jamiSahifa = Math.ceil(mavzular.length / SAHIFA_HAJMI) || 1;
  const testliSoni = mavzular.filter((m) => m.test_bormi).length;
  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={() => setHolat("fan")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Fanlar</button>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>{tanlanganFan}</h1>
        {testliSoni > 0 && (
          <button onClick={() => setFanOchirishTasdiqi(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
            🗑 Fandagi barcha testlarni o'chirish
          </button>
        )}
      </div>
      <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
        {mavzular.length} ta mavzu · {testliSoni} tasida test bor
      </p>
      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <>
          <div className="space-y-2.5 mb-3">
            {korinadigan.map((m) => (
              <div key={m.topic_code} className="rounded-xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium flex-1" style={{ color: "#2B2B2B" }}>{m.nomi}</p>
                  {m.test_bormi ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>✅ Test bor</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>❌ Test yo'q</span>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: "#8A8578" }}>
                  {m.chorak ? `${m.chorak}-chorak` : ""}{m.bob ? ` · ${m.bob}` : ""}{m.bolim ? ` · ${m.bolim}` : ""} · {m.kichik_soni} kichik mavzu
                </p>
                <div className="flex gap-2 flex-wrap">
                  {!m.test_bormi ? (
                    <button onClick={() => onTestYarat(m.topic_code)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
                      🧪 Test shablon yaratish
                    </button>
                  ) : (
                    <>
                      <button onClick={() => rasmlarniKor(m)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
                        🖼 Rasmlarni ko'rish
                      </button>
                      <button onClick={() => setMavzuOchirishTasdiqi(m)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                        🗑 Testlarni o'chirish
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {jamiSahifa > 1 && (
            <div className="flex items-center justify-between">
              <button onClick={() => setSahifa((s) => Math.max(0, s - 1))} disabled={sahifa === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa === 0 ? "#C4BFAF" : "#5A5648" }}>
                ← Oldingi
              </button>
              <span className="text-xs" style={{ color: "#8A8578" }}>{sahifa + 1} / {jamiSahifa}</span>
              <button onClick={() => setSahifa((s) => Math.min(jamiSahifa - 1, s + 1))} disabled={sahifa >= jamiSahifa - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa >= jamiSahifa - 1 ? "#C4BFAF" : "#5A5648" }}>
                Keyingi →
              </button>
            </div>
          )}
        </>
      )}

      {mavzuOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>🗑 Testlarni o'chirasizmi?</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{mavzuOchirishTasdiqi.nomi}" mavzusining BARCHA testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setMavzuOchirishTasdiqi(null)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={() => mavzuTestlariniOchir(mavzuOchirishTasdiqi)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? "..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fanOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>🗑 Butun fanni o'chirasizmi?</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{tanlanganFan}" fanidagi BARCHA mavzularning BARCHA testlari butunlay o'chiriladi ({testliSoni} ta mavzu). Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setFanOchirishTasdiqi(false)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={fanTestlariniOchir} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? "..." : "Ha, hammasini o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rasmGaleriyasi && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
          <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
            <button onClick={() => setRasmGaleriyasi(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Yopish</button>
            <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>🖼 {rasmGaleriyasi.sarlavha}</h1>
            <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
              {rasmlarYuklanmoqda ? "Yuklanmoqda..." : `${rasmGaleriyasi.rasmlar.length} ta rasm havolasi topildi`}
            </p>
            {rasmlarYuklanmoqda ? (
              <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : rasmGaleriyasi.rasmlar.length === 0 ? (
              <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <p className="text-sm" style={{ color: "#8A8578" }}>Bu mavzuning savollarida rasm havolasi yo'q.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {rasmGaleriyasi.rasmlar.map((rasmId) => (
                  <div key={rasmId}>
                    {haqiqiyRasmKodimi(rasmId) ? (
                      <SavolRasmi rasmId={rasmId} />
                    ) : (
                      <div className="w-full rounded-xl mb-1 flex flex-col items-center justify-center gap-1 py-6"
                        style={{ backgroundColor: "#F1EFE8", border: "1px dashed #C4BFAF" }}>
                        <span className="text-lg">∑</span>
                        <span className="text-xs font-medium text-center px-2" style={{ color: "#8A8578" }}>LaTeX ifoda (rasm emas)</span>
                      </div>
                    )}
                    <p className="text-xs font-mono text-center" style={{ color: "#B0AA98", wordBreak: "break-all" }}>{rasmId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTestlarTab({ token }) {
  return <TestTab token={token} sinf={null} />;
}

function AdminTab({ token, oldindanTanlangan }) {
  const [bolim, setBolim] = useState("test"); // "test" | "topik" | "tushuntirish" | "maktab" | "markaz"

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Shablonlar</h1>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button onClick={() => setBolim("test")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "test"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🧪 Test shablon
        </button>
        <button onClick={() => setBolim("topik")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "topik"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          📋 Topik shablon
        </button>
        <button onClick={() => setBolim("tushuntirish")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "tushuntirish"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🤖 Tushuntirish
        </button>
        <button onClick={() => setBolim("maktab")}
          className="py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "maktab"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🏫 Maktablar
        </button>
        <button onClick={() => setBolim("markaz")}
          className="py-2.5 rounded-xl font-semibold text-sm col-span-2"
          style={bolim === "markaz"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🎓 O'quv markazlari
        </button>
        <button onClick={() => setBolim("bogcha")}
          className="py-2.5 rounded-xl font-semibold text-sm col-span-2"
          style={bolim === "bogcha"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🧸 Bog'chalar
        </button>
        <button onClick={() => setBolim("universitet")}
          className="py-2.5 rounded-xl font-semibold text-sm col-span-2"
          style={bolim === "universitet"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🎓 Universitetlar
        </button>
        <button onClick={() => setBolim("sinov")}
          className="py-2.5 rounded-xl font-semibold text-sm col-span-2"
          style={bolim === "sinov"
            ? { backgroundColor: "#C89B3C", color: "#fff" }
            : { backgroundColor: "#fff", color: "#8A5A1C", border: "1px solid #F5DFA3" }}>
          🧪 Sinov muhiti
        </button>
      </div>

      {bolim === "test" && <TestShablonBolimi token={token} oldindanTanlangan={oldindanTanlangan} />}
      {bolim === "topik" && <TopikShablonBolimi token={token} />}
      {bolim === "tushuntirish" && <TushuntirishBolimi token={token} />}
      {bolim === "maktab" && <MaktablarBolimi token={token} />}
      {bolim === "markaz" && <MarkazlarBolimi token={token} />}
      {bolim === "bogcha" && <BogchalarBolimi token={token} />}
      {bolim === "universitet" && <UniversitetlarBolimi token={token} />}
      {bolim === "sinov" && <SinovMuhitiBolimi token={token} />}
    </div>
  );
}

const SINF_HARFLARI = ["A", "B", "D", "E", "F", "G", "H", "I", "J", "K"];

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

const QIYINLIK_DARAJALARI = [
  ["oson", "🟢 Oson"], ["o'rta", "🟡 O'rta"], ["qiyin", "🔴 Qiyin"], ["murakkab", "⚫ Murakkab"],
];

function TestShablonBolimi({ token, oldindanTanlangan }) {
  const [fanlar, setFanlar] = useState([]);
  const [ochiqFan, setOchiqFan] = useState(null);
  const [tanlanganKodlar, setTanlanganKodlar] = useState(oldindanTanlangan || []); // [topic_code, ...]
  const [guruhlar, setGuruhlar] = useState(
    QIYINLIK_DARAJALARI.map(([diff]) => ({ diff, turi: "single_choice", soni: 0 }))
  );
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natija, setNatija] = useState(null);

  useEffect(() => {
    // faqat_testli=false: bu yerda ADMIN test SHABLON yaratadi — testi
    // hali yo'q mavzular ham ko'rinishi va tanlanishi kerak.
    fetch(`${API_BASE}/api/mavzular?faqat_testli=false`)
      .then((r) => r.json())
      .then((d) => setFanlar(d.fanlar || []))
      .catch(() => setXato("Mavzularni yuklab bo'lmadi"));
  }, []);

  useEffect(() => {
    if (oldindanTanlangan && oldindanTanlangan.length > 0) {
      setTanlanganKodlar((prev) => Array.from(new Set([...prev, ...oldindanTanlangan])));
    }
  }, [oldindanTanlangan]);

  const kodniAlmashtir = (kodlar) => {
    setTanlanganKodlar((prev) => {
      const barchasiBor = kodlar.every((k) => prev.includes(k));
      return barchasiBor ? prev.filter((k) => !kodlar.includes(k)) : Array.from(new Set([...prev, ...kodlar]));
    });
  };

  const guruhniYangila = (diff, maydon, qiymat) => {
    setGuruhlar((prev) => prev.map((g) => g.diff === diff ? { ...g, [maydon]: qiymat } : g));
  };

  const jamiSon = guruhlar.reduce((sum, g) => sum + g.soni, 0);

  const shablonYukla = async () => {
    if (tanlanganKodlar.length === 0) { setXato("Kamida bitta mavzu tanlang"); return; }
    if (jamiSon === 0) { setXato("Kamida bitta qiyinlik darajasidan son tanlang"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/shablon_yukla?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_codes: tanlanganKodlar, guruhlar }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Xato");
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = "test_shablon.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/shablon_import?token=${encodeURIComponent(token)}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatija(data);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-2 block" style={{ color: "#5A5648" }}>
          1) Mavzu(lar)ni tanlang ({tanlanganKodlar.length} ta tanlandi)
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto mb-1">
          {fanlar.map((fan) => {
            const ochiq = ochiqFan === fan.qisqa;
            return (
              <div key={fan.qisqa} className="rounded-xl overflow-hidden" style={{ backgroundColor: "#F7F5F0" }}>
                <button onClick={() => setOchiqFan(ochiq ? null : fan.qisqa)}
                  className="w-full flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{fan.nom}</span>
                  {ochiq ? <ChevronDown size={16} style={{ color: "#8A8578" }} /> : <ChevronRight size={16} style={{ color: "#8A8578" }} />}
                </button>
                {ochiq && (
                  <div className="px-3 pb-2.5 space-y-1">
                    {fan.sinflar.map((s) => (
                      <div key={s.sinf}>
                        <p className="text-xs font-medium py-1" style={{ color: "#8A8578" }}>{s.sinf}-sinf</p>
                        {s.mavzular.map((m) => (
                          <label key={m.nomi} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-white mb-1 cursor-pointer">
                            <input type="checkbox" checked={m.topic_codes.every((k) => tanlanganKodlar.includes(k))}
                              onChange={() => kodniAlmashtir(m.topic_codes)} />
                            <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-3 block" style={{ color: "#5A5648" }}>
          2) Har bir qiyinlik darajasi uchun son va turini tanlang
        </label>
        <div className="space-y-4">
          {guruhlar.map((g) => {
            const nom = QIYINLIK_DARAJALARI.find(([d]) => d === g.diff)[1];
            return (
              <div key={g.diff}>
                <p className="text-sm font-medium mb-1.5" style={{ color: "#2B2B2B" }}>{nom}</p>
                <div className="flex gap-1.5 mb-1.5 flex-wrap">
                  {[0, 5, 10, 15, 20].map((n) => (
                    <button key={n} onClick={() => guruhniYangila(g.diff, "soni", n)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={g.soni === n
                        ? { backgroundColor: "#1B4B7A", color: "#fff" }
                        : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => guruhniYangila(g.diff, "turi", "single_choice")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={g.turi === "single_choice"
                      ? { backgroundColor: "#2D8B8B", color: "#fff" }
                      : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                    🔘 Tugmali
                  </button>
                  <button onClick={() => guruhniYangila(g.diff, "turi", "write_answer")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={g.turi === "write_answer"
                      ? { backgroundColor: "#2D8B8B", color: "#fff" }
                      : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                    ✍️ Yozuvli
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={shablonYukla} disabled={yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mt-5"
          style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : `📥 Shablon yuklab olish (jami: ${jamiSon} ta × ${tanlanganKodlar.length} mavzu)`}
        </button>
      </div>

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-2 block" style={{ color: "#5A5648" }}>
          To'ldirilgan shablonni yuklash
        </label>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 Fayl tanlash"}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
        </label>

        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
        {natija && (
          <div className="mt-3 text-sm" style={{ color: "#2B2B2B" }}>
            <p>✅ Saqlandi: <b>{natija.saved}</b></p>
            <p>⚠️ Duplikat: <b>{natija.duplicates}</b></p>
            <p>❌ Xato: <b>{natija.errors}</b></p>
          </div>
        )}
      </div>
    </>
  );
}

function TopikShablonBolimi({ token }) {
  const [sinf, setSinf] = useState("");
  const [fan, setFan] = useState("");
  const [mavzular, setMavzular] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natija, setNatija] = useState(null);

  const shablonYukla = async () => {
    if (!sinf.trim() || !fan.trim() || !mavzular.trim()) {
      setXato("Sinf, fan va mavzularni to'ldiring"); return;
    }
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/topik_shablon?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sinf: sinf.trim(), fan: fan.trim(), mavzular }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Xato");
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = `shablon_${sinf}sinf_${fan}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/topik_import?token=${encodeURIComponent(token)}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatija(data);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf</label>
        <input type="text" value={sinf} onChange={(e) => setSinf(e.target.value)}
          placeholder="masalan: 1"
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
          style={{ borderColor: "#E5E1D8" }} />

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Fan</label>
        <input type="text" value={fan} onChange={(e) => setFan(e.target.value)}
          placeholder="masalan: Ingliz tili"
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
          style={{ borderColor: "#E5E1D8" }} />

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
          Mavzular (har biri yangi qatorda: chorak / mavzu)
        </label>
        <textarea value={mavzular} onChange={(e) => setMavzular(e.target.value)}
          placeholder={"1 / Colours\n1 / Numbers\n2 / Animals"}
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-4"
          style={{ borderColor: "#E5E1D8" }} />

        <button onClick={shablonYukla} disabled={yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📥 Shablon yuklab olish"}
        </button>
      </div>

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-2 block" style={{ color: "#5A5648" }}>
          To'ldirilgan shablonni yuklash
        </label>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 Fayl tanlash"}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
        </label>

        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
        {natija && (
          <div className="mt-3 text-sm" style={{ color: "#2B2B2B" }}>
            <p>➕ Qo'shildi: <b>{natija.added}</b></p>
            <p>⏭ O'tkazildi: <b>{natija.skipped}</b></p>
          </div>
        )}
      </div>
    </>
  );
}

function TushuntirishBolimi({ token }) {
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natija, setNatija] = useState(null);

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/tushuntirish_import?token=${encodeURIComponent(token)}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatija(data);
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>🤖 AI tushuntirishlarni yuklash</p>
      <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
        Colab'da (yoki boshqa joyda) tayyorlangan Excel fayl — ustunlar: <b>Sinf, Fan, Mavzu, Tushuntirish</b>.
        O'quvchi mavzuni ochganda shu tushuntirish ko'rsatiladi. Bir xil sinf+fan+mavzu qayta yuklansa — yangilanadi.
      </p>
      <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
        style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
        {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 Fayl tanlash"}
        <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
      </label>
      {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {natija && (
        <div className="mt-3 text-sm" style={{ color: "#2B2B2B" }}>
          <p>✅ Saqlandi: <b>{natija.saqlandi}</b></p>
          <p>❌ Xato: <b>{natija.xato}</b></p>
        </div>
      )}
    </div>
  );
}

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

function MaktablarBolimi({ token }) {
  const [maktablar, setMaktablar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [formOchiq, setFormOchiq] = useState(false);
  const [nomi, setNomi] = useState("");
  const [viloyat, setViloyat] = useState("");
  const [tuman, setTuman] = useState("");
  const [smenaSoni, setSmenaSoni] = useState(1);
  const [direktor, setDirektor] = useState(null); // {user_id, full_name} | null
  const [pulli, setPulli] = useState(false);
  const [oylikTolov, setOylikTolov] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [tanlanganMaktab, setTanlanganMaktab] = useState(null); // maktab obyekti | null

  const maktablarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/maktablar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMaktablar(d.maktablar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };

  useEffect(maktablarniYukla, [token]);

  const maktabSaqla = async () => {
    if (!nomi.trim()) { setXato("Maktab nomini kiriting"); return; }
    setSaqlanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/maktab_yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, nomi: nomi.trim(), viloyat: viloyat || undefined, tuman: tuman || undefined,
          smena_soni: smenaSoni, direktor_user_id: direktor ? direktor.user_id : undefined,
          pulli, oylik_tolov: pulli && oylikTolov ? parseInt(oylikTolov, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setViloyat(""); setTuman(""); setSmenaSoni(1); setDirektor(null); setPulli(false); setOylikTolov(""); setFormOchiq(false);
      maktablarniYukla();
    } catch (e) {
      setXato(e.message);
    } finally { setSaqlanmoqda(false); }
  };

  if (tanlanganMaktab) {
    return <MaktabTafsiloti token={token} maktab={tanlanganMaktab} onOrtga={() => { setTanlanganMaktab(null); maktablarniYukla(); }} />;
  }

  return (
    <div>
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>🏫 Maktablar</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {formOchiq ? "✕ Yopish" : "+ Yangi maktab"}
          </button>
        </div>
        <p className="text-xs" style={{ color: "#8A8578" }}>1-bosqich tayyor. Endi ro'yxatdan maktabni tanlang — xodimlarni Excel orqali kiritasiz (2-bosqich).</p>
      </div>

      {formOchiq && (
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maktab nomi</label>
          <input type="text" value={nomi} onChange={(e) => setNomi(e.target.value)}
            placeholder="masalan: 21-maktab"
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

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Smena soni</label>
          <div className="flex gap-2 mb-3">
            {[1, 2].map((n) => (
              <button key={n} onClick={() => setSmenaSoni(n)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                style={smenaSoni === n
                  ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" }
                  : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
                {n} smenali
              </button>
            ))}
          </div>

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Direktor (ixtiyoriy — keyin ham belgilash mumkin)</label>
          <DirektorQidiruvi token={token} tanlanganDirektor={direktor} onTanla={setDirektor} />

          <label className="text-xs font-medium mb-1.5 block mt-3" style={{ color: "#5A5648" }}>To'lov turi</label>
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

          {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
          <button onClick={maktabSaqla} disabled={saqlanmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ backgroundColor: "#1B4B7A", opacity: saqlanmoqda ? 0.7 : 1 }}>
            {saqlanmoqda ? "Saqlanmoqda..." : "Maktabni yaratish"}
          </button>
        </div>
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
                <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{m.nomi}</p>
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
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natijalar, setNatijalar] = useState(null); // [{fish, lavozim, kirish_kodi, sinf_rahbarligi, sinf_paroli}] | null
  const [sinflar, setSinflar] = useState([]);
  const [sinflarYuklanmoqda, setSinflarYuklanmoqda] = useState(true);
  const [pulli, setPulli] = useState(maktab.pulli || false);
  const [oylikTolov, setOylikTolov] = useState(maktab.oylik_tolov ? String(maktab.oylik_tolov) : "");
  const [tolovSaqlanmoqda, setTolovSaqlanmoqda] = useState(false);

  const sinflarniYukla = () => {
    setSinflarYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/maktab_sinflari?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`)
      .then((r) => r.json())
      .then((d) => { setSinflar(d.sinflar || []); setSinflarYuklanmoqda(false); })
      .catch(() => setSinflarYuklanmoqda(false));
  };
  useEffect(sinflarniYukla, [token, maktab.id]);

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
    window.open(`${API_BASE}/api/admin/xodim_shablon?token=${encodeURIComponent(token)}`, "_blank");
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatijalar(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/xodim_import?token=${encodeURIComponent(token)}&maktab_id=${maktab.id}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNatijalar(data.natijalar || []);
      sinflarniYukla();
    } catch (e) {
      setXato(e.message);
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Maktablar</button>
      <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{maktab.nomi}</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
        {[maktab.viloyat, maktab.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"} · {maktab.smena_soni} smenali
      </p>

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

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>2-bosqich — Xodimlarni kiritish</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Shablonni yuklab, F.I.Sh / Lavozim / Sinf rahbarligini to'ldirib, qayta yuklang.
          Har bir xodimga shaxsiy kirish kodi, sinf rahbari bo'lsa — sinf qo'shilish paroli ham avtomatik yaratiladi.
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
        <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>✅ {natijalar.length} ta xodim qo'shildi</p>
          <p className="text-xs mb-4" style={{ color: "#B0553A" }}>
            Diqqat: bu kodlarni endi shu yerdan nusxalab, har bir xodimga (masalan Telegram orqali) yuboring — bu ekranga qayta qaytib bo'lmaydi!
          </p>
          <div className="space-y-2.5">
            {natijalar.map((n, i) => (
              <div key={i} className="rounded-xl p-3.5" style={{ backgroundColor: "#F7F5F0" }}>
                <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{n.fish}</p>
                <p className="text-xs mb-1.5" style={{ color: "#8A8578" }}>{n.lavozim}{n.sinf_rahbarligi ? ` · ${n.sinf_rahbarligi} sinf rahbari` : ""}</p>
                <p className="text-xs font-mono" style={{ color: "#1B4B7A" }}>🔑 Kirish kodi: <b>{n.kirish_kodi}</b></p>
                {n.sinf_paroli && <p className="text-xs font-mono" style={{ color: "#8A5A1C" }}>🔐 Sinf paroli: <b>{n.sinf_paroli}</b></p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>3-bosqich — Sinflar</p>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
          Xodim importi orqali "Sinf rahbarligi" to'ldirilganda avtomatik yaratilgan sinflar shu yerda ko'rinadi.
        </p>
        {sinflarYuklanmoqda ? (
          <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : sinflar.length === 0 ? (
          <p className="text-xs" style={{ color: "#8A8578" }}>Hali sinf yo'q — xodim importida "Sinf rahbarligi" ustunini to'ldirib yuklang.</p>
        ) : (
          <div className="space-y-2">
            {sinflar.map((s) => (
              <div key={s.id} className="rounded-xl p-3.5 flex items-center justify-between" style={{ backgroundColor: "#F7F5F0" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                  <p className="text-xs" style={{ color: "#8A8578" }}>{s.rahbar_ismi || "Rahbar belgilanmagan"}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "#8A5A1C" }}>🔐 {s.qoshilish_paroli}</p>
                </div>
                <button onClick={() => parolniTashla(s.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
                  ↻ Parolni tashlash
                </button>
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
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Markazlar</button>
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
  const [oylikTolov, setOylikTolov] = useState("");
  const [direktor, setDirektor] = useState(null);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [tanlanganBogcha, setTanlanganBogcha] = useState(null);

  const bogchalarniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/bogchalar?token=${encodeURIComponent(token)}`)
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
          oylik_tolov: turi === "xususiy" && oylikTolov ? parseInt(oylikTolov, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setNomi(""); setTuri("xususiy"); setViloyat(""); setTuman(""); setOylikTolov(""); setDirektor(null); setFormOchiq(false);
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
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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

          {turi === "xususiy" && (
            <>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Oylik to'lov (so'm, ixtiyoriy)</label>
              <input type="number" value={oylikTolov} onChange={(e) => setOylikTolov(e.target.value)}
                placeholder="masalan: 800000"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
            </>
          )}

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
                  {b.oylik_tolov ? ` · ${b.oylik_tolov.toLocaleString()} so'm/oy` : ""}
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
  const [turi, setTuri] = useState(bogcha.turi || "xususiy");
  const [oylikTolov, setOylikTolov] = useState(bogcha.oylik_tolov ? String(bogcha.oylik_tolov) : "");
  const [tolovSaqlanmoqda, setTolovSaqlanmoqda] = useState(false);

  const tolovSozlashniSaqla = async () => {
    setTolovSaqlanmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/bogcha_tolov_sozlash`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, bogcha_id: bogcha.id, turi, oylik_tolov: oylikTolov ? parseInt(oylikTolov, 10) : undefined }),
      });
    } finally { setTolovSaqlanmoqda(false); }
  };

  const shablonYukla = () => {
    window.open(`${API_BASE}/api/admin/bogcha_xodim_shablon?token=${encodeURIComponent(token)}`, "_blank");
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatijalar(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/admin/bogcha_xodim_import?token=${encodeURIComponent(token)}&bogcha_id=${bogcha.id}`, {
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Bog'chalar</button>
      <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{bogcha.nomi}</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
        {bogcha.turi === "xususiy" ? "Xususiy" : "Davlat"} · {[bogcha.viloyat, bogcha.tuman].filter(Boolean).join(", ") || "Hudud ko'rsatilmagan"}
      </p>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>💳 To'lov sozlamalari</p>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setTuri("davlat")}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={turi === "davlat" ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
            Davlat
          </button>
          <button onClick={() => setTuri("xususiy")}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
            style={turi === "xususiy" ? { backgroundColor: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8" }}>
            Xususiy
          </button>
        </div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Oylik to'lov (so'm) — bo'sh qoldirsangiz, bepul hisoblanadi</label>
        <input type="number" value={oylikTolov} onChange={(e) => setOylikTolov(e.target.value)}
          placeholder="masalan: 800000"
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
        <button onClick={tolovSozlashniSaqla} disabled={tolovSaqlanmoqda}
          className="w-full py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A", opacity: tolovSaqlanmoqda ? 0.7 : 1 }}>
          {tolovSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

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
        <button onClick={ortgaQaytish} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
      )}
      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{sarlavhalar[holat]}</p>
          <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
        <button onClick={() => { setTanlanganSinf(null); setJadval(null); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Sinflar</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
            <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>🗂 Hujjatlar</h1>
        <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
            <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
        <button onClick={() => { setTanlanganKitob(null); setTarix(null); setBerishOchiq(false); setTanlanganOdam(null); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Kutubxona</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>📖 Kutubxona</h1>
        <button onClick={() => setFormOchiq(!formOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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

function TogarakAzoMavzulari({ token, togarak, onOrtga }) {
  const [mavzular, setMavzular] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [kontentlar, setKontentlar] = useState(null);
  const [oqilayotganId, setOqilayotganId] = useState(null);
  const [joriySozIndeksi, setJoriySozIndeksi] = useState(-1);
  const korilganVideolar = useRef(new Set());

  useEffect(() => {
    fetch(`${API_BASE}/api/togarak_azo/mavzularim?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token, togarak.id]);

  const mavzuOch = (m) => {
    setTanlanganMavzu(m); setKontentlar(null);
    fetch(`${API_BASE}/api/togarak_azo/mavzu_kontentlari?token=${encodeURIComponent(token)}&togarak_id=${togarak.id}&topic_code=${encodeURIComponent(m.topic_code)}`)
      .then((r) => r.json())
      .then((d) => setKontentlar(d.kontentlar || []))
      .catch(() => setKontentlar([]));
  };

  const videoKorildi = (biriktirmaId) => {
    if (korilganVideolar.current.has(biriktirmaId)) return;
    korilganVideolar.current.add(biriktirmaId);
    fetch(`${API_BASE}/api/togarak_azo/video_korildi?token=${encodeURIComponent(token)}&biriktirma_id=${biriktirmaId}`, { method: "POST" }).catch(() => {});
  };

  const youtubeIdOl = (url) => {
    const m = (url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return m ? m[1] : null;
  };

  if (tanlanganMavzu) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganMavzu(null); setKontentlar(null); window.speechSynthesis.cancel(); setOqilayotganId(null); }}
          className="text-sm mb-4" style={{ color: "#8A8578" }}>← Mavzular</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        {tanlanganMavzu.bob_name && <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganMavzu.bob_name}</p>}

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
                      joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} />
                  </>
                )}

                {k.kontent_turi === "latex" && (
                  <>
                    <SavolFormulasi ifoda={k.matn} />
                    <OvozliOqishTugmasi matn={latexniOzbekchaOqishga(k.matn)} kontentId={k.id} oqilayotganId={oqilayotganId} setOqilayotganId={setOqilayotganId}
                      joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} />
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
                          joriySozIndeksi={joriySozIndeksi} setJoriySozIndeksi={setJoriySozIndeksi} />
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Profil</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📚 Mavzular</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{togarak.nomi}</p>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : mavzular.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mavzular.map((m) => (
            <button key={m.topic_code} onClick={() => mavzuOch(m)}
              className="w-full text-left rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{m.nomi}</p>
                {m.bob_name && <p className="text-xs" style={{ color: "#8A8578" }}>{m.bob_name}</p>}
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
            </button>
          ))}
        </div>
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
  const [kontentTuriFormasi, setKontentTuriFormasi] = useState(null); // "matn" | "latex" | "video" | "fayl" | null
  const [sarlavha, setSarlavha] = useState("");
  const [matn, setMatn] = useState("");
  const [videoHavola, setVideoHavola] = useState("");
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const mavzularniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/togarak_barcha_mavzular?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(mavzularniYukla, [token, togarakId]);

  useEffect(() => {
    if (!qidiruvOchiq) return;
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/oqituvchi/togarak_milliy_mavzular_qidir?token=${encodeURIComponent(token)}&togarak_id=${togarakId}${qidiruv.trim() ? `&qidiruv=${encodeURIComponent(qidiruv.trim())}` : ""}`)
        .then((r) => r.json())
        .then((d) => { setQidiruvNatijalari(d.mavzular || []); setQidirilmoqda(false); })
        .catch(() => setQidirilmoqda(false));
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

  const KONTENT_YORLIQ = { matn: "📝 Matn", latex: "🧮 LaTeX", rasm: "🖼 Rasm", pdf: "📄 PDF", word: "📃 Word", video: "🎬 Video" };

  if (tanlanganMavzu) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganMavzu(null); setKontentlar(null); formaniTozala(); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Mavzular</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.mavzu_name || tanlanganMavzu.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{[tanlanganMavzu.bob_name, tanlanganMavzu.bolim_name].filter(Boolean).join(" · ")}</p>

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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruh</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>📖 To'garak mavzulari</h1>
        <button onClick={() => { setQidiruvOchiq(!qidiruvOchiq); setQidiruv(""); setQidiruvNatijalari(null); }}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          {qidiruvOchiq ? "✕ Yopish" : "+ Mavzu qo'shish"}
        </button>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Milliy bazadan mavzu tanlab, har biriga matn/LaTeX/rasm/PDF/Word/video biriktiring.</p>

      {qidiruvOchiq && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <input type="text" value={qidiruv} onChange={(e) => setQidiruv(e.target.value)} placeholder="Mavzu nomi bo'yicha qidirish (bo'sh — o'z sinf/faningiz)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          {qidirilmoqda ? (
            <div className="py-4 text-center"><Loader2 size={18} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {(qidiruvNatijalari || []).map((m) => {
                const biriktirilganmi = mavzular.some((x) => x.topic_code === m.topic_code);
                return (
                  <div key={m.topic_code} className="flex items-center justify-between gap-2 rounded-lg p-2" style={{ backgroundColor: "#F7F5F0" }}>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "#2B2B2B" }}>{m.mavzu_name || m.kichik_name}</p>
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
              {(qidiruvNatijalari || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hech narsa topilmadi.</p>}
            </div>
          )}
        </div>
      )}

      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : mavzular.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mavzular.map((m) => (
            <div key={m.topic_code} className="rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <button onClick={() => mavzuOch(m)} className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{m.mavzu_name || m.kichik_name}</p>
                <p className="text-xs truncate" style={{ color: "#8A8578" }}>{[m.bob_name, m.bolim_name].filter(Boolean).join(" · ")} · {m.kontent_soni} kontent</p>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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

function TogarakMavzularOzi({ token, togarakId, onOrtga }) {
  const [mavzular, setMavzular] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  const [mavzuYuklanmoqda, setMavzuYuklanmoqda] = useState(false);
  const [mavzuImportlanmoqda, setMavzuImportlanmoqda] = useState(false);
  const [mavzuNatija, setMavzuNatija] = useState(null);

  const [testFormOchiq, setTestFormOchiq] = useState(false);
  const [tanlanganKodlar, setTanlanganKodlar] = useState({});
  const [testYuklanmoqda, setTestYuklanmoqda] = useState(false);
  const [testImportlanmoqda, setTestImportlanmoqda] = useState(false);
  const [testNatija, setTestNatija] = useState(null);

  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [savollar, setSavollar] = useState(null);
  const [reja, setReja] = useState("");
  const [muhimMalumot, setMuhimMalumot] = useState("");
  const [videoHavola, setVideoHavola] = useState("");
  const [tahrirSaqlanmoqda, setTahrirSaqlanmoqda] = useState(false);

  const mavzularniYukla = () => {
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/oqituvchi/togarak_mavzulari_ozi?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  };
  useEffect(mavzularniYukla, [token, togarakId]);

  const mavzuShablonYukla = async () => {
    setMavzuYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_shablon?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`);
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || "Xato"); }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = "togarak_mavzu_shablon.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) { setXato(e.message); } finally { setMavzuYuklanmoqda(false); }
  };

  const mavzuFaylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setMavzuImportlanmoqda(true); setXato(""); setMavzuNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_import?token=${encodeURIComponent(token)}&togarak_id=${togarakId}`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setMavzuNatija(data);
      mavzularniYukla();
    } catch (e) { setXato(e.message); } finally { setMavzuImportlanmoqda(false); e.target.value = ""; }
  };

  const kodBelgila = (topicCode, soni) => {
    setTanlanganKodlar((prev) => {
      const yangi = { ...prev };
      if (soni <= 0) delete yangi[topicCode];
      else yangi[topicCode] = soni;
      return yangi;
    });
  };

  const testShablonYukla = async () => {
    const guruhlar = Object.entries(tanlanganKodlar).map(([topic_code, soni]) => ({ topic_code, soni }));
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

  const mavzuOchir = async (topicCode) => {
    await fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_ochir?token=${encodeURIComponent(token)}&topic_code=${encodeURIComponent(topicCode)}`, { method: "DELETE" });
    mavzularniYukla();
  };

  const mavzuOch = (m) => {
    setTanlanganMavzu(m);
    setReja(m.reja || ""); setMuhimMalumot(m.muhim_malumot || ""); setVideoHavola(m.video_havola || "");
    fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_savollari?token=${encodeURIComponent(token)}&topic_code=${encodeURIComponent(m.topic_code)}`)
      .then((r) => r.json())
      .then((d) => setSavollar(d.savollar || []))
      .catch(() => {});
  };

  const tahrirSaqla = async () => {
    setTahrirSaqlanmoqda(true);
    try {
      await fetch(`${API_BASE}/api/oqituvchi/togarak_mavzu_tahrirlash`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, topic_code: tanlanganMavzu.topic_code, reja: reja || undefined, muhim_malumot: muhimMalumot || undefined, video_havola: videoHavola || undefined }),
      });
      mavzularniYukla();
    } finally { setTahrirSaqlanmoqda(false); }
  };

  const savolOchir = async (id) => {
    await fetch(`${API_BASE}/api/oqituvchi/togarak_savol_ochir?token=${encodeURIComponent(token)}&savol_id=${id}`, { method: "DELETE" });
    mavzuOch(tanlanganMavzu);
    mavzularniYukla();
  };

  if (tanlanganMavzu) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setTanlanganMavzu(null); setSavollar(null); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Mavzular</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        {tanlanganMavzu.bob_name && <p className="text-xs mb-4" style={{ color: "#8A8578" }}>{tanlanganMavzu.bob_name}</p>}

        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>📝 Reja / video / muhim ma'lumot</p>
          <textarea value={reja} onChange={(e) => setReja(e.target.value)} placeholder="Dars rejasi" rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
          <textarea value={muhimMalumot} onChange={(e) => setMuhimMalumot(e.target.value)} placeholder="Muhim ma'lumot / mavzu matni" rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2.5" style={{ borderColor: "#E5E1D8" }} />
          <input type="text" value={videoHavola} onChange={(e) => setVideoHavola(e.target.value)} placeholder="Video-dars havolasi (YouTube)"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3" style={{ borderColor: "#E5E1D8" }} />
          <button onClick={tahrirSaqla} disabled={tahrirSaqlanmoqda}
            className="w-full py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: "#1B4B7A", opacity: tahrirSaqlanmoqda ? 0.7 : 1 }}>
            {tahrirSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

        <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>❓ Savollar ({(savollar || []).length})</p>
        <div className="space-y-2">
          {(savollar || []).map((s) => (
            <div key={s.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm" style={{ color: "#2B2B2B" }}>{s.question}</p>
                <button onClick={() => savolOchir(s.id)} className="text-xs shrink-0" style={{ color: "#A32D2D" }}>✕</button>
              </div>
              <p className="text-xs mt-1" style={{ color: "#3B6D11" }}>✓ {s.correct_answer}</p>
            </div>
          ))}
          {(savollar || []).length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Hali savol yuklanmagan — "Test shablon" orqali qo'shing.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruh</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>📚 O'z mavzu va testlarim</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>Excel shablonlar orqali — bir martada ko'p mavzu/savol qo'shing.</p>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm font-semibold mb-3" style={{ color: "#2B2B2B" }}>1-bosqich — Mavzular (Bob + Mavzu)</p>
        <button onClick={mavzuShablonYukla} disabled={mavzuYuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-sm mb-2.5 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>
          {mavzuYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📥 Shablon yuklab olish"}
        </button>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {mavzuImportlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📤 To'ldirilgan faylni yuklash"}
          <input type="file" accept=".xlsx" onChange={mavzuFaylTanlandi} disabled={mavzuImportlanmoqda} className="hidden" />
        </label>
        {mavzuNatija && <p className="text-xs mt-3" style={{ color: "#3B6D11" }}>✅ {mavzuNatija.qoshildi} ta mavzu qo'shildi</p>}
      </div>

      <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>2-bosqich — Testlar</p>
          <button onClick={() => setTestFormOchiq(!testFormOchiq)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
            {testFormOchiq ? "✕ Yopish" : "Mavzu tanlash"}
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Mavzu(lar)ni tanlab, har biriga necha savol kerakligini yozing.</p>

        {testFormOchiq && (
          <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
            {mavzular.map((m) => (
              <div key={m.topic_code} className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "#F7F5F0" }}>
                <span className="flex-1 text-xs" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                <input type="number" min="0" value={tanlanganKodlar[m.topic_code] || ""}
                  onChange={(e) => kodBelgila(m.topic_code, parseInt(e.target.value, 10) || 0)}
                  placeholder="0" className="w-16 px-2 py-1 rounded-lg border text-xs text-center" style={{ borderColor: "#E5E1D8" }} />
              </div>
            ))}
            {mavzular.length === 0 && <p className="text-xs" style={{ color: "#8A8578" }}>Avval 1-bosqichda mavzu qo'shing.</p>}
          </div>
        )}

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
      </div>

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}

      <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>📋 Mavzularim ({mavzular.length})</p>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : mavzular.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hali mavzu qo'shilmagan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mavzular.map((m) => (
            <div key={m.topic_code} className="rounded-xl p-3.5 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <button onClick={() => mavzuOch(m)} className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{m.nomi}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>
                  {m.bob_name ? `${m.bob_name} · ` : ""}{m.savol_soni} savol{m.video_havola ? " · 🎬" : ""}
                </p>
              </button>
              <button onClick={() => mavzuOchir(m.topic_code)} className="text-xs px-2 shrink-0" style={{ color: "#A32D2D" }}>✕</button>
            </div>
          ))}
        </div>
      )}
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
      const res = await fetch(`${API_BASE}/api/oqituvchi/kirish_kodi_orqali_qoshil?token=${encodeURIComponent(token)}&kirish_kodi=${encodeURIComponent(kirishKodi.trim())}`, {
        method: "POST",
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Profil</button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>🔑 Kirish kodi</h1>
      <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
        Maktab/markaz/bog'cha admini sizga bergan 6 belgili kodni kiriting — hisobingizga tegishli lavozim avtomatik qo'shiladi.
      </p>
      <div className="flex gap-2">
        <input type="text" value={kirishKodi} onChange={(e) => setKirishKodi(e.target.value.toUpperCase())}
          placeholder="masalan: A1B2C3" maxLength={6}
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
        <button onClick={() => setTanlanganSinf(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Sinflarim</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganSinf.sinf}-{tanlanganSinf.harf}</h1>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>{tanlanganSinf.maktab_nomi} · {tanlanganSinf.oquvchi_soni} o'quvchi</p>
        <button onClick={() => setDavomatKorinishi(true)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm mb-3" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
          📋 Davomat belgilash
        </button>

        <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#EAF1F7" }}>
          <p className="text-xs" style={{ color: "#5A5648" }}>🔐 Qo'shilish paroli: <b>{tanlanganSinf.qoshilish_paroli}</b></p>
        </div>

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
                <button onClick={() => setTanlanganOquvchiId(a.user_id)} className="text-sm font-medium text-left" style={{ color: "#2B2B2B" }}>
                  {a.full_name}
                </button>
                <button onClick={() => azoniChiqar(a.azolik_id, tanlanganSinf.id)}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0 ml-2" style={{ backgroundColor: "#fff", color: "#A32D2D", border: "1px solid #E5E1D8" }}>
                  ✕ Chiqarish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>🏫 Rasmiy sinflarim</h1>
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : sinflar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm mb-1" style={{ color: "#2B2B2B" }}>Sizga hali rasmiy sinf biriktirilmagan</p>
          <p className="text-xs" style={{ color: "#8A8578" }}>Maktabingiz direktori/administratori sizni sinf rahbari sifatida tayinlashi kerak.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sinflar.map((s) => (
            <button key={s.id} onClick={() => sinfOch(s)}
              className="w-full text-left rounded-xl p-4 bg-white border flex items-center justify-between" style={{ borderColor: "#E5E1D8" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{s.sinf}-{s.harf}</p>
                <p className="text-xs" style={{ color: "#8A8578" }}>{s.maktab_nomi} · {s.oquvchi_soni} o'quvchi{s.pulli ? " · 💳 pulli" : ""}</p>
              </div>
              <ChevronRight size={16} style={{ color: "#8A8578" }} />
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
        <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
        <button onClick={() => { setTanlanganSinf(null); setAzolar(null); setOquvchilar(null); }} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Sinflar</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
        <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Siz hech qanday markazga bog'lanmagansiz.</p>
        </div>
      </div>
    );
  }

  if (tanlanganGuruh) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganGuruh(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlar</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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

function OtaOnaQidiruvi({ token, tanlanganOtaOna, onTanla }) {
  const [ism, setIsm] = useState("");
  const [natijalar, setNatijalar] = useState([]);
  const [qidirilmoqda, setQidirilmoqda] = useState(false);

  useEffect(() => {
    if (ism.trim().length < 2) { setNatijalar([]); return; }
    setQidirilmoqda(true);
    const kechiktirish = setTimeout(() => {
      fetch(`${API_BASE}/api/opa/ota_ona_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(ism.trim())}`)
        .then((r) => r.json())
        .then((d) => { setNatijalar(d.natijalar || []); setQidirilmoqda(false); })
        .catch(() => setQidirilmoqda(false));
    }, 400);
    return () => clearTimeout(kechiktirish);
  }, [ism, token]);

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
    fetch(`${API_BASE}/api/opa/mening_guruhlarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setGuruhlar(d.guruhlar || []); setYuklanmoqda(false); })
      .catch(() => setYuklanmoqda(false));
  }, [token]);

  const bolalarniYukla = (guruhId) => {
    setBolalarYuklanmoqda(true);
    fetch(`${API_BASE}/api/opa/guruh_bolalari?token=${encodeURIComponent(token)}&guruh_id=${guruhId}`)
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
    await fetch(`${API_BASE}/api/opa/bolani_chiqar?token=${encodeURIComponent(token)}&roster_id=${rosterId}`, { method: "DELETE" });
    bolalarniYukla(tanlanganGuruh.id);
  };

  const tolovBelgila = async (bola) => {
    const oy = new Date().toISOString().slice(0, 7);
    await fetch(`${API_BASE}/api/opa/tolov_belgila`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, bola_user_id: bola.user_id, guruh_id: tanlanganGuruh.id, oy, tolangan_summa: tanlanganGuruh.oylik_tolov }),
    });
    bolalarniYukla(tanlanganGuruh.id);
  };

  if (tanlanganGuruh) {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setTanlanganGuruh(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganGuruh.nomi}</h1>
        <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{tanlanganGuruh.bogcha_nomi}</p>

        <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Yangi bola qo'shish</label>
          <OtaOnaQidiruvi token={token} tanlanganOtaOna={tanlanganOtaOna} onTanla={setTanlanganOtaOna} />
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
            <p className="text-sm font-semibold mb-2.5" style={{ color: "#2B2B2B" }}>
              {tanlanganGuruh.oylik_tolov ? `💳 Bu oy to'lovlari` : "👶 Guruh ro'yxati"}
            </p>
            <div className="space-y-2">
              {bolalar.map((b) => (
                <div key={b.roster_id} className="rounded-xl p-3.5 flex items-center justify-between"
                  style={{ backgroundColor: tanlanganGuruh.oylik_tolov ? (b.qarzdor ? "#FCEBEB" : "#EAF3DE") : "#F7F5F0" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{b.full_name}</p>
                    {tanlanganGuruh.oylik_tolov > 0 && (
                      <p className="text-xs" style={{ color: b.qarzdor ? "#A32D2D" : "#3B6D11" }}>
                        {b.qarzdor ? `⚠️ Qarzdor (${b.tolangan_summa.toLocaleString()} / ${b.kerakli_summa.toLocaleString()} so'm)` : "✅ To'langan"}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {tanlanganGuruh.oylik_tolov > 0 && b.qarzdor && (
                      <button onClick={() => tolovBelgila(b)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#1B4B7A" }}>
                        To'landi
                      </button>
                    )}
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
        <button onClick={() => setTanlanganGuruh(null)} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
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
      <button onClick={onOrtga} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Guruhlarim</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>🧠 Psixolog</h1>
      <p className="text-xs mb-5" style={{ color: "#8A8578" }}>O'quvchini qidirib, uning kuzatuv yozuvlarini ko'ring yoki yangi qo'shing.</p>
      <MaktabOdamQidiruvi token={token} maktabId={maktabId} tanlanganOdam={null} onTanla={setTanlanganOquvchi} />
    </div>
  );
}

function OqituvchiTab({ token, foydalanuvchi }) {
  const [holat, setHolat] = useState("togaraklar"); // togaraklar | azolar | yaratish
  const [togaraklar, setTogaraklar] = useState([]);
  const [tanlangan, setTanlangan] = useState(null);
  const [azolar, setAzolar] = useState([]);
  const [bahoQoyilayotgan, setBahoQoyilayotgan] = useState(null); // user_id | null
  const [bahoQiymati, setBahoQiymati] = useState("");
  const [izohQiymati, setIzohQiymati] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");
  const [korinish, setKorinish] = useState("togarak"); // "togarak" | to'garak guruhlarimi yoki maxsus ekranmi
  const [muassasalar, setMuassasalar] = useState([]);
  const [aktivMuassasaIdx, setAktivMuassasaIdx] = useState(0);

  const [yangiNomi, setYangiNomi] = useState("");
  const [yangiFan, setYangiFan] = useState("");
  const [yangiSinf, setYangiSinf] = useState("");         // "1".."11"
  const [yangiMaxsusSinf, setYangiMaxsusSinf] = useState(false); // true bo'lsa to'garak guruhi (masalan "3-4")
  const [yangiSinfMatni, setYangiSinfMatni] = useState(""); // tanlangan to'garak sinfi (masalan "3-4")
  const [togarakSinflari, setTogarakSinflari] = useState([]); // mavjud to'garak sinflari ro'yxati
  const [togarakSinflariYuklanmoqda, setTogarakSinflariYuklanmoqda] = useState(false);
  const [sinfFanlari, setSinfFanlari] = useState([]); // tanlangan sinf uchun MAVJUD fanlar ro'yxati
  const [sinfFanlariYuklanmoqda, setSinfFanlariYuklanmoqda] = useState(false);
  const [mavzuTanlovlari, setMavzuTanlovlari] = useState([]); // sinf+fanga mos mavzular: [{nomi, topic_codes, savol_soni}]
  const [mavzuTanlovlariYuklanmoqda, setMavzuTanlovlariYuklanmoqda] = useState(false);
  const [mavzuTanlovXato, setMavzuTanlovXato] = useState("");
  const [tanlanganMavzuNomlari, setTanlanganMavzuNomlari] = useState({}); // {nomi: true} — belgilanganlar
  const [yangiParol, setYangiParol] = useState("");
  const [yangiMaxTalaba, setYangiMaxTalaba] = useState("");
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

  // Fan HAM tanlangach — o'sha sinf+fanga tegishli mavzularni (test bor-yo'qligidan
  // qat'iy nazar — chunki mavzuga keyinroq kontent/test qo'shiladi) yuklaymiz,
  // BARCHASINI standart ravishda TANLANGAN deb belgilaymiz (avvalgi "avtomatik
  // hammasi bog'lanadi" xatti-harakati bilan bir xil natija, lekin endi
  // o'qituvchi xohlasa ayrimlarini o'chirib qo'yishi mumkin).
  useEffect(() => {
    const sinfQiymati = yangiMaxsusSinf ? yangiSinfMatni : yangiSinf;
    setMavzuTanlovlari([]);
    setTanlanganMavzuNomlari({});
    setMavzuTanlovXato("");
    if (!sinfQiymati || !yangiFan) return;
    setMavzuTanlovlariYuklanmoqda(true);
    const turi = yangiMaxsusSinf ? "togarak" : "oddiy";
    fetch(`${API_BASE}/api/oqituvchi/togarak_yaratish_mavzulari?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(sinfQiymati)}&fan=${encodeURIComponent(yangiFan)}&turi=${turi}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.detail || `Server xatosi (${r.status})`);
        return d;
      })
      .then((d) => {
        const mavzular = d.mavzular || [];
        setMavzuTanlovlari(mavzular);
        setTanlanganMavzuNomlari(Object.fromEntries(mavzular.map((m) => [m.nomi, true])));
      })
      .catch((e) => setMavzuTanlovXato(e.message || "Yuklab bo'lmadi — internet aloqasi yoki server bilan muammo"))
      .finally(() => setMavzuTanlovlariYuklanmoqda(false));
  }, [yangiSinf, yangiSinfMatni, yangiMaxsusSinf, yangiFan, token]);

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
      .then((d) => { setTogaraklar(d.togaraklar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/muassasalarim?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setMuassasalar(d.muassasalar || []))
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
      setHolat("azolar");
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const bahoBoshla = (azo) => {
    setBahoQoyilayotgan(azo.user_id);
    setBahoQiymati(azo.oxirgi_baho != null ? String(azo.oxirgi_baho) : "");
    setIzohQiymati("");
  };

  const bahoSaqla = async (userId) => {
    const baho = parseInt(bahoQiymati, 10);
    if (isNaN(baho) || baho < 0 || baho > 100) {
      setXato("Baho 0-100 oralig'ida bo'lishi kerak");
      return;
    }
    setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/baho_qoy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, togarak_id: tanlangan.id, user_id: userId, baho, izoh: izohQiymati || null }),
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
    const tanlanganKodlar = mavzuTanlovlari
      .filter((m) => tanlanganMavzuNomlari[m.nomi])
      .flatMap((m) => m.topic_codes || []);
    setYaratilmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/oqituvchi/togarak_yarat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, nomi: yangiNomi.trim(), fan: yangiFan.trim(), sinf: sinfQiymati,
          parol: yangiParol || undefined,
          max_talaba: yangiMaxTalaba ? parseInt(yangiMaxTalaba, 10) : undefined,
          oylik_summa: yangiOylikSumma ? parseInt(yangiOylikSumma, 10) : undefined,
          universitet_guruh_id: tanlanganUniGuruh ? tanlanganUniGuruh.id : undefined,
          tanlangan_topic_codes: tanlanganKodlar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      const yangiTogarak = { id: data.togarak_id, nomi: yangiNomi.trim(), fan: yangiFan.trim(), sinf: sinfQiymati, max_talaba: yangiMaxTalaba || null, azo_soni: 0 };
      setTogaraklar((prev) => [...prev, yangiTogarak]);
      setYangiNomi(""); setYangiFan(""); setYangiSinf(""); setYangiMaxsusSinf(false); setYangiSinfMatni("");
      setTogarakSinflari([]); setSinfFanlari([]); setMavzuTanlovlari([]); setTanlanganMavzuNomlari({});
      setYangiParol(""); setYangiMaxTalaba(""); setYangiOylikSumma("");
      setUniGuruhIzlash(""); setUniGuruhNatijalar([]); setTanlanganUniGuruh(null);
      setTanlangan(yangiTogarak);
      setAzolar([]);
      setHolat("mavzular_boshqarish");
    } catch (e) {
      setXato(e.message);
    } finally { setYaratilmoqda(false); }
  };

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
  const MUASSASA_IKONKA = { maktab: "🏫", markaz: "🎓", bogcha: "🧸", universitet: "🎓" };
  const MUASSASA_BOSHQARUVCHI_LAVOZIM = {
    maktab: ["direktor", "zam_direktor_uquv", "zam_direktor_tarbiya"],
    markaz: ["markaz_direktor", "administrator"],
    bogcha: ["bogcha_direktor", "bogcha_zam"],
    universitet: ["rektor", "prorektor"],
  };

  if (korinish === "markaz") {
    return <MarkazBoshqaruvi token={token} markazId={aktivMuassasa?.turi === "markaz" ? aktivMuassasa.muassasa_id : foydalanuvchi?.markaz_id} onOrtga={() => setKorinish("togarak")} />;
  }

  const aktivMaktabId = aktivMuassasa?.turi === "maktab" ? aktivMuassasa.muassasa_id : foydalanuvchi?.maktab_id;

  if (korinish === "maktab_rahbariyat") {
    return <MaktabBoshqaruvi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
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

  if (korinish === "fanlar_tahlili") {
    return <FanlarTahliliBolimi token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "psixolog") {
    return <PsixologQidiruv token={token} maktabId={aktivMaktabId} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "bogcha") {
    return <BogchaGuruhim token={token} onOrtga={() => setKorinish("togarak")} />;
  }

  if (korinish === "universitet") {
    return <UniversitetGuruhimBilimi token={token} onOrtga={() => setKorinish("togarak")} />;
  }

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (holat === "yaratish") {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("togaraklar")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>Yangi to'garak</h1>
        <p className="text-sm mb-6" style={{ color: "#8A8578" }}>Bot va saytda bir xil ko'rinadi</p>

        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>To'garak nomi</label>
          <input type="text" value={yangiNomi} onChange={(e) => setYangiNomi(e.target.value)}
            placeholder="masalan: Matematik to'garak"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sinf</label>
          {!yangiMaxsusSinf ? (
            <>
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
              <button type="button" onClick={() => { setYangiMaxsusSinf(true); setYangiSinf(""); }}
                className="w-full rounded-xl p-3.5 mb-3 flex items-center gap-3 text-left border-2 border-dashed"
                style={{ borderColor: "#C4BFAF", backgroundColor: "#FAF9F6" }}>
                <span className="text-xl shrink-0">📚</span>
                <span>
                  <span className="text-sm font-semibold block" style={{ color: "#2B2B2B" }}>Bu — oddiy sinf emas</span>
                  <span className="text-xs" style={{ color: "#8A8578" }}>Abituriyent, aralash guruh (3-4) va h.k. — bosing</span>
                </span>
              </button>
            </>
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
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
                {togarakSinflari.length > 0 ? "yoki yangi guruh nomi kiriting" : "Guruh nomini kiriting"}
              </label>
              <input type="text" value={yangiSinfMatni} onChange={(e) => setYangiSinfMatni(e.target.value)}
                placeholder="masalan: Abituriyent, 3-4, IDUM tayyorlov"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-2"
                style={{ borderColor: "#E5E1D8" }} />
              <button type="button" onClick={() => { setYangiMaxsusSinf(false); setYangiSinfMatni(""); }}
                className="text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
                ← Oddiy sinf tanlashga qaytish
              </button>
            </>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Fan</label>
          {!(yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval sinfni tanlang</p>
          ) : sinfFanlariYuklanmoqda ? (
            <div className="py-3 mb-2"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
          ) : (
            <div className="flex gap-1.5 flex-wrap mb-3">
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
          )}
          {sinfFanlari.length === 0 && (yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) && !sinfFanlariYuklanmoqda && (
            <p className="text-xs -mt-2 mb-3" style={{ color: "#8A8578" }}>
              Bu guruh uchun hali mavzu/test yo'q — fan tanlansa, keyinroq shablon orqali test qo'shishingiz mumkin.
            </p>
          )}

          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium block" style={{ color: "#5A5648" }}>
              Mavzular{yangiFan ? ` (${Object.values(tanlanganMavzuNomlari).filter(Boolean).length}/${mavzuTanlovlari.length} tanlandi)` : ""}
            </label>
            {yangiFan && mavzuTanlovlari.length > 0 && (
              <button type="button"
                onClick={() => setTanlanganMavzuNomlari(Object.fromEntries(mavzuTanlovlari.map((m) => [m.nomi, !Object.values(tanlanganMavzuNomlari).every(Boolean)])))}
                className="text-xs font-medium" style={{ color: "#1B4B7A" }}>
                {Object.values(tanlanganMavzuNomlari).every(Boolean) ? "Hech birini tanlamaslik" : "Barchasini tanlash"}
              </button>
            )}
          </div>
          {!(yangiMaxsusSinf ? yangiSinfMatni : yangiSinf) ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval sinfni tanlang</p>
          ) : !yangiFan ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>Avval fanni tanlang</p>
          ) : mavzuTanlovlariYuklanmoqda ? (
            <div className="py-3 mb-3"><Loader2 size={16} className="animate-spin" style={{ color: "#8A8578" }} /></div>
          ) : mavzuTanlovXato ? (
            <p className="text-xs mb-3 font-medium" style={{ color: "#A32D2D" }}>⚠️ {mavzuTanlovXato}</p>
          ) : mavzuTanlovlari.length === 0 ? (
            <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
              Bu sinf/fan uchun milliy bazada mavzu topilmadi — keyinroq "To'garak mavzulari"dan o'zingiz qo'shishingiz mumkin.
              <br /><span className="font-mono">[qidirilgan: sinf="{yangiMaxsusSinf ? yangiSinfMatni : yangiSinf}", fan="{yangiFan}", turi="{yangiMaxsusSinf ? "togarak" : "oddiy"}"]</span>
            </p>
          ) : (
            <div className="space-y-1.5 mb-3 max-h-56 overflow-y-auto rounded-xl p-2.5" style={{ backgroundColor: "#F7F5F0" }}>
              {mavzuTanlovlari.map((m) => (
                <label key={m.nomi} className="flex items-center gap-2.5 px-1.5 py-1 cursor-pointer">
                  <input type="checkbox" checked={!!tanlanganMavzuNomlari[m.nomi]}
                    onChange={(e) => setTanlanganMavzuNomlari((prev) => ({ ...prev, [m.nomi]: e.target.checked }))} />
                  <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                  {m.savol_soni > 0 && <span className="text-xs" style={{ color: "#8A8578" }}>{m.savol_soni} savol</span>}
                </label>
              ))}
            </div>
          )}

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Qo'shilish paroli (ixtiyoriy)</label>
          <input type="text" value={yangiParol} onChange={(e) => setYangiParol(e.target.value)}
            placeholder="o'quvchilar shu bilan qo'shiladi"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maks. talaba</label>
              <input type="number" min="1" value={yangiMaxTalaba} onChange={(e) => setYangiMaxTalaba(e.target.value)}
                placeholder="25"
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

          <button onClick={yaratishSaqla} disabled={yaratilmoqda}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1B4B7A", opacity: yaratilmoqda ? 0.7 : 1 }}>
            {yaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : "To'garak yaratish"}
          </button>
        </div>
      </div>
    );
  }

  if (holat === "azolar") {
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => { setHolat("togaraklar"); setTanlangan(null); setBahoQoyilayotgan(null); }}
          className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlangan.nomi}</h1>
        <button onClick={() => setHolat("mavzular_ozi")} className="text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          📚 O'z mavzu va testlarimni yaratish →
        </button>
        <button onClick={() => setHolat("mavzular_boshqarish")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          📖 To'garak mavzulari →
        </button>
        <button onClick={() => setHolat("sozlamalar")} className="block text-xs font-medium mb-5" style={{ color: "#1B4B7A" }}>
          ⚙️ Guruh sozlamalari →
        </button>
        {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
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

  if (holat === "mavzular_ozi") {
    return <TogarakMavzularOzi token={token} togarakId={tanlangan.id} onOrtga={() => setHolat("azolar")} />;
  }

  if (holat === "mavzular_boshqarish") {
    return <TogarakMavzularBoshqarish token={token} togarakId={tanlangan.id} onOrtga={() => setHolat("azolar")} />;
  }

  if (holat === "sozlamalar") {
    return <TogarakGuruhSozlamalari token={token} togarak={tanlangan} onOrtga={() => setHolat("azolar")} onOchirildi={() => window.location.reload()} />;
  }

  // holat === "togaraklar"
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Guruhlarim</h1>
        <button onClick={() => { setXato(""); setHolat("yaratish"); }}
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

      {aktivMuassasa?.turi === "maktab" && (MUASSASA_BOSHQARUVCHI_LAVOZIM.maktab.includes(aktivMuassasa.lavozim)) && (
        <>
          <button onClick={() => setKorinish("maktab_rahbariyat")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            🏫 Butun maktabni boshqarish →
          </button>
          <button onClick={() => setKorinish("kutubxona")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            📖 Kutubxona →
          </button>
          <button onClick={() => setKorinish("moliya")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            💰 Moliya →
          </button>
          <button onClick={() => setKorinish("hujjatlar")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            🗂 Hujjatlar →
          </button>
          <button onClick={() => setKorinish("rejalashtirish")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            📅 Rejalashtirish →
          </button>
          <button onClick={() => setKorinish("fanlar_tahlili")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            📊 Fanlar tahlili →
          </button>
        </>
      )}
      {aktivMuassasa?.turi === "maktab" && aktivMuassasa.lavozim === "psixolog" && (
        <button onClick={() => setKorinish("psixolog")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          🧠 Psixolog →
        </button>
      )}
      {aktivMuassasa?.turi === "markaz" && MUASSASA_BOSHQARUVCHI_LAVOZIM.markaz.includes(aktivMuassasa.lavozim) && (
        <button onClick={() => setKorinish("markaz")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          🎓 Markazimni boshqarish →
        </button>
      )}
      {aktivMuassasa?.turi === "bogcha" && aktivMuassasa.lavozim === "bogcha_opa" && (
        <button onClick={() => setKorinish("bogcha")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          🧸 Bog'cha guruhim →
        </button>
      )}
      {aktivMuassasa?.turi === "universitet" && (
        <button onClick={() => setKorinish("universitet")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          🎓 Kurator bo'lgan guruhlarim →
        </button>
      )}
      <button onClick={() => setKorinish("ai_yordamchi")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
        🤖 AI Yordamchi →
      </button>
      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {togaraklar.length === 0 ? (
        <button onClick={() => { setXato(""); setHolat("yaratish"); }}
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
                <p className="text-xs mt-0.5" style={{ color: "#8A8578" }}>{t.fan}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                {t.azo_soni} o'quvchi
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
        else setYuklanmoqda(false);
      })
      .catch(() => { setXato("Farzandlar ro'yxatini yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [foydalanuvchi.user_id]);

  useEffect(() => {
    if (!tanlanganBola) return;
    setYuklanmoqda(true);
    fetch(`${API_BASE}/api/bola/${tanlanganBola}/bilim`)
      .then((r) => r.json())
      .then((d) => { setBilimData(d); setYuklanmoqda(false); })
      .catch(() => { setXato("Bilim ma'lumotini yuklab bo'lmadi"); setYuklanmoqda(false); });
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

        <button onClick={() => setKorinish(korinish === "ai_yordamchi" ? "bilim" : "ai_yordamchi")}
          className="text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
          {korinish === "ai_yordamchi" ? "← Bilim ma'lumotiga qaytish" : "🤖 AI Yordamchidan so'rash →"}
        </button>
        <button onClick={() => setKorinish(korinish === "sogliq" ? "bilim" : "sogliq")}
          className="block text-xs font-medium mb-3" style={{ color: "#1B4B7A" }}>
          {korinish === "sogliq" ? "← Bilim ma'lumotiga qaytish" : "🚑 Favqulodda ma'lumot →"}
        </button>

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
        <BilimTab data={bilimData} bolaId={tanlanganBola} rang={rang} />
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 6) PROFIL — tahrirlash va rol almashtirish
// ═══════════════════════════════════════════════════════════
function ProfilTab({ token, foydalanuvchi, onYangilandi, adminKorinish, onKorinishOzgar, rang }) {
  const profilRangi = rang || "#1B4B7A";
  const [ism, setIsm] = useState(foydalanuvchi?.full_name || "");
  const [viloyat, setViloyat] = useState(foydalanuvchi?.region || "");
  const [tuman, setTuman] = useState(foydalanuvchi?.district || "");
  const [tugilganSana, setTugilganYil] = useState(foydalanuvchi?.tugilgan_sana || "");
  const [maktabRaqami, setMaktabRaqami] = useState(foydalanuvchi?.maktab_raqami || "");
  const [royxatdagiMaktab, setRoyxatdagiMaktab] = useState(
    foydalanuvchi?.maktab_id && foydalanuvchi?.maktab_nomi ? { id: foydalanuvchi.maktab_id, nomi: foydalanuvchi.maktab_nomi } : null
  );
  const [maktabTuri, setMaktabTuri] = useState(foydalanuvchi?.maktab_turi_kaliti || "oddiy");
  const [sinf, setSinf] = useState(foydalanuvchi?.class ? String(foydalanuvchi.class).replace(/-sinf$/i, "") : "");
  const [sinfHarfi, setSinfHarfi] = useState(foydalanuvchi?.class_letter || "");
  const [jins, setJins] = useState(foydalanuvchi?.jins || "");
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
  const [korinish, setKorinish] = useState("profil"); // "profil" | "rasmiy_sinf" | "kirish_kodi" | "togarak_mavzular"
  const [tanlanganTogarak, setTanlanganTogarak] = useState(null);

  const [otaKod, setOtaKod] = useState(null); // {kod, amal_qilish_daqiqasi} | null
  const [otaKodOlinmoqda, setOtaKodOlinmoqda] = useState(false);
  const [otaKodXato, setOtaKodXato] = useState("");

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
      setTogaraklarim((prev) => [...prev, { id: Date.now(), nomi: data.togarak_nomi, fan: "" }]);
      setQoshilishMuvaffaqiyat(`"${data.togarak_nomi}" ga qo'shildingiz!`);
      setQoshilishParol("");
      setTimeout(() => setQoshilishMuvaffaqiyat(""), 3000);
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
          maktab_id: royxatdagiMaktab ? royxatdagiMaktab.id : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onYangilandi({
        ...foydalanuvchi, full_name: ism, region: viloyat, district: tuman,
        tugilgan_sana: tugilganSana, maktab_raqami: maktabRaqami,
        maktab_turi_kaliti: maktabTuri, class: sinf, class_letter: sinfHarfi,
        jins, oqituvchi_fani: oqituvchiFani,
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
  if (korinish === "togarak_mavzular") {
    return <TogarakAzoMavzulari token={token} togarak={tanlanganTogarak} onOrtga={() => setKorinish("profil")} />;
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0" style={{ backgroundColor: profilRangi }}>
          {(ism || "?").trim().slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: "#2B2B2B" }}>{ism || "Profil"}</h1>
          <p className="text-xs" style={{ color: "#8A8578" }}>
            {foydalanuvchi?.is_admin ? "🛠 Admin" : rolNomlari[foydalanuvchi?.role] || "Foydalanuvchi"}
            {foydalanuvchi?.role === "oquvchi" && sinf ? ` · ${sinf}${sinfHarfi ? `-${sinfHarfi}` : ""}-sinf` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "#5A5648" }}>👤 Shaxsiy ma'lumotlar</p>

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ism</label>
        <input type="text" value={ism} onChange={(e) => setIsm(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
          style={{ borderColor: "#E5E1D8" }} />

        <div className="grid grid-cols-2 gap-2.5 mb-3">
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
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tuman</label>
            <select value={tuman} onChange={(e) => setTuman(e.target.value)} disabled={!viloyat}
              className="w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: "#E5E1D8", opacity: viloyat ? 1 : 0.5 }}>
              <option value="">—</option>
              {(HUDUDLAR[viloyat] || []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Tug'ilgan sana</label>
        <input type="date" value={tugilganSana} onChange={(e) => setTugilganYil(e.target.value)}
          min="1950-01-01" max={new Date().toISOString().split("T")[0]}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
          style={{ borderColor: "#E5E1D8" }} />
      </div>

      {foydalanuvchi?.role === "oquvchi" && (
        <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "#5A5648" }}>🏫 Maktab ma'lumotlari</p>

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

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Ro'yxatdagi maktab (bo'lsa — tanlang, aniqroq bo'ladi)</label>
          <MaktabQidiruvi tanlanganMaktab={royxatdagiMaktab} onTanla={setRoyxatdagiMaktab} />

          <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Maktab raqami</label>
          <input type="text" value={maktabRaqami} onChange={(e) => setMaktabRaqami(e.target.value)}
            placeholder="masalan: 21"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
            style={{ borderColor: "#E5E1D8" }} />

          <div className="grid grid-cols-2 gap-3">
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
      )}

      {foydalanuvchi?.role === "oqituvchi" && (
        <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
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
      )}

      {foydalanuvchi?.role === "oqituvchi" && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <button onClick={() => setKorinish("rasmiy_sinf")} className="block text-xs font-medium mb-2" style={{ color: "#1B4B7A" }}>
            🏫 Rasmiy maktab sinfim bormi? →
          </button>
          <button onClick={() => setKorinish("kirish_kodi")} className="block text-xs font-medium" style={{ color: "#1B4B7A" }}>
            🔑 Maktab/markazdan kirish kodim bor →
          </button>
        </div>
      )}

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {muvaffaqiyat && <p className="text-sm mb-3" style={{ color: "#3B6D11" }}>✓ Saqlandi</p>}

      <button onClick={profilSaqla} disabled={saqlanmoqda}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm mb-4"
        style={{ backgroundColor: profilRangi, opacity: saqlanmoqda ? 0.7 : 1 }}>
        {saqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
      </button>

      {foydalanuvchi?.role === "oquvchi" && (
        <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>🔗 Ota-onani ulash</p>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
            Kod oling va uni ota-onangizga ayting — u shu kodni o'z profilida kiritib, sizning bilim ko'rsatkichlaringizni ko'ra oladi.
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
      )}

      {foydalanuvchi?.role === "ota-ona" && (
        <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
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
      )}

      <div className="rounded-2xl p-4 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs font-medium mb-3" style={{ color: "#5A5648" }}>Mening to'garaklarim</p>

        {togaraklarYuklanmoqda ? (
          <Loader2 size={18} className="animate-spin" style={{ color: "#1B4B7A" }} />
        ) : togaraklarim.length === 0 ? (
          <p className="text-sm mb-4" style={{ color: "#8A8578" }}>Hali hech qaysi to'garakka qo'shilmagansiz.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {togaraklarim.map((t) => (
              <button key={t.id} onClick={() => { setTanlanganTogarak(t); setKorinish("togarak_mavzular"); }}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                {t.nomi} →
              </button>
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

      {foydalanuvchi?.is_admin ? (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "#5A5648" }}>Ko'rinish rejimi (faqat siz uchun)</p>
          <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
            Har rolni ALOHIDA-ALOHIDA sinab ko'rish uchun — bu haqiqiy rolingizni o'zgartirmaydi, faqat ko'rinishni almashtiradi.
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
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
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

      {rolTanlov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF" }}>
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
  );
}

function PastkiMenyu({ faol, onTanlash, rol, rang, bloklangan }) {
  const aktivRang = rang || "#1B4B7A";
  // DIQQAT: "admin" endi TO'LIQ ALOHIDA rejim — boshqa hech qanday rol
  // tugmasi bilan ARALASHMAYDI. Har rejimda faqat O'SHA rolga tegishli
  // bandlar ko'rinadi.
  const bandlar =
    rol === "admin"
      ? [
          { kalit: "admin", nom: "Shablon", ikon: FileSpreadsheet },
          { kalit: "admin_testlar", nom: "Testlar", ikon: PencilLine },
          { kalit: "admin_mavzular", nom: "Mavzular", ikon: BookOpen },
          { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
          { kalit: "profil", nom: "Profil", ikon: User },
        ]
      : rol === "oqituvchi"
      ? [{ kalit: "oqituvchi", nom: "Guruhlarim", ikon: Users }, { kalit: "xabar", nom: "Xabarlar", ikon: Bell }, { kalit: "profil", nom: "Profil", ikon: User }]
      : rol === "ota-ona"
      ? [{ kalit: "farzand", nom: "Farzandim", ikon: Heart }, { kalit: "xabar", nom: "Xabarlar", ikon: Bell }, { kalit: "profil", nom: "Profil", ikon: User }]
      : [
          { kalit: "bilim", nom: "Bilim", ikon: BarChart3 },
          { kalit: "test", nom: "Test", ikon: PencilLine },
          { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
          { kalit: "profil", nom: "Profil", ikon: User },
        ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t" style={{ backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#E5E1D8" }}>
      <div className="max-w-md mx-auto grid" style={{ gridTemplateColumns: `repeat(${bandlar.length}, minmax(0, 1fr))` }}>
        {bandlar.map(({ kalit, nom, ikon: Ikon }) => {
          const aktiv = faol === kalit;
          const taqiqlangan = bloklangan && !aktiv;
          return (
            <button key={kalit} onClick={() => !taqiqlangan && onTanlash(kalit)}
              className="flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ opacity: taqiqlangan ? 0.35 : 1, cursor: taqiqlangan ? "not-allowed" : "pointer" }}
              title={taqiqlangan ? "Avval testni yakunlang yoki to'xtating" : undefined}>
              <Ikon size={22} strokeWidth={aktiv ? 2.5 : 2} style={{ color: aktiv ? aktivRang : "#8A8578" }} />
              <span className="text-xs" style={{ color: aktiv ? aktivRang : "#8A8578", fontWeight: aktiv ? 600 : 400 }}>{nom}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function XabarlarTab({ token }) {
  const [bildirishnomalar, setBildirishnomalar] = useState([]);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);

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

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Bildirishnomalar</h1>
      {yuklanmoqda ? (
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

function Kabinet({ token }) {
  const [holat, setHolat] = useState("yuklanmoqda");
  const [foydalanuvchi, setFoydalanuvchi] = useState(null);
  const [bilimData, setBilimData] = useState(null);
  const [tab, setTab] = useState(null); // rol aniqlangach o'rnatiladi
  const [xatoMatn, setXatoMatn] = useState("");
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

  useEffect(() => {
    async function yukla() {
      try {
        const resU = await fetch(`${API_BASE}/auth/men?token=${encodeURIComponent(token)}`);
        if (!resU.ok) throw new Error("Sessiya eskirgan");
        const u = await resU.json();
        setFoydalanuvchi(u);

        const resB = await fetch(`${API_BASE}/api/bola/${u.user_id}/bilim`);
        const b = await resB.json();
        setBilimData(b);

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

  const korinishOzgardi = (yangi) => {
    setAdminKorinish(yangi);
    setTab(yangi === "admin" ? "admin" : yangi === "oqituvchi" ? "oqituvchi" : yangi === "ota-ona" ? "farzand" : "bilim");
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F7F5F0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {korinishRoli === "admin" && tab === "admin" && <AdminTab token={token} oldindanTanlangan={shablonOldindanTanlangan} />}
      {korinishRoli === "admin" && tab === "admin_testlar" && <AdminTestlarTab token={token} />}
      {korinishRoli === "admin" && tab === "admin_mavzular" && (
        <TopikMavzularTab token={token} onTestYarat={(topicCode) => { setShablonOldindanTanlangan([topicCode]); setTab("admin"); }} />
      )}
      {korinishRoli === "oqituvchi" && tab === "oqituvchi" && <OqituvchiTab token={token} foydalanuvchi={foydalanuvchi} />}
      {korinishRoli === "ota-ona" && tab === "farzand" && <OtaOnaTab token={token} foydalanuvchi={foydalanuvchi} rang={joriyRang} />}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "bilim" && <BilimTab data={bilimData} bolaId={foydalanuvchi?.user_id} rang={joriyRang} token={token} />}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "test" && (
        <TestTab token={token} sinf={foydalanuvchi?.class} onTestFaollik={setTestDavomida} />
      )}
      {tab === "xabar" && <XabarlarTab token={token} />}
      {tab === "profil" && (
        <ProfilTab token={token} foydalanuvchi={foydalanuvchi} onYangilandi={setFoydalanuvchi}
          adminKorinish={adminKorinish} onKorinishOzgar={korinishOzgardi} rang={joriyRang} />
      )}
      <PastkiMenyu faol={tab} onTanlash={setTab} rol={korinishRoli} rang={joriyRang} bloklangan={testDavomida} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ASOSIY — URL manziliga qarab qaysi ekranni ko'rsatishni hal qiladi
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [token, setToken] = useState(null);
  const [yol] = useState(() => {
    const p = window.location.pathname;
    const q = new URLSearchParams(window.location.search);
    return { p, token: q.get("token"), email: q.get("email"), ism: q.get("ism") };
  });

  if (token) return <Kabinet token={token} />;
  if (yol.p === "/kabinet" && yol.token) return <Kabinet token={yol.token} />;
  if (yol.p === "/ulash" && yol.email) return <UlashEkrani email={yol.email} ism={yol.ism} onUlandi={setToken} />;
  return <LoginEkrani />;
}
