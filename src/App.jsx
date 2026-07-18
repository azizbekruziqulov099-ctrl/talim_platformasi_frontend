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
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>SamTM Ta'lim</h1>
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

function BilimTab({ data, bolaId, rang }) {
  const heroRang = rang || "#1B4B7A";
  const [yolFani, setYolFani] = useState(null); // {fan, rang} | null
  const [togarakYoliId, setTogarakYoliId] = useState(null); // ochilgan to'garak yo'li id | null
  const [mengaTogaraklarim, setMenTogaraklarim] = useState([]);
  const radarData = data.fanlar.map((f) => ({ fan: f.qisqa, foiz: f.foiz }));

  useEffect(() => {
    if (!bolaId) return;
    fetch(`${API_BASE}/api/bola/${bolaId}/togaraklarim`)
      .then((r) => r.json())
      .then((d) => setMenTogaraklarim(d.togaraklar || []))
      .catch(() => {});
  }, [bolaId]);

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
      setJavoblar({}); setNatijalar({}); setYozibJavob({}); setHolat("savollar");
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

  const [natijalar, setNatijalar] = useState({}); // {savol_id: {togrimi, togri_javob, tushuntirish}}
  const [umumiyVaqt, setUmumiyVaqt] = useState(null); // butun test uchun UMUMIY qolgan soniya | null (vaqtsiz)
  const [toxtatishModali, setToxtatishModali] = useState(false);
  const umumiyTimerRef = useRef(null);
  const savolReflari = useRef({}); // {index: DOM element} — raqam bosilganda shu savolga aylantirish uchun

  // Savollar yuklangach — UMUMIY vaqtni hisoblaymiz (har bir savolning
  // o'z vaqti bo'lsa, hammasini QO'SHIB, BITTA umumiy hisoblagich sifatida
  // ishlatamiz — har savolga alohida vaqt emas).
  useEffect(() => {
    if (holat !== "savollar" || savollar.length === 0) return;
    const jami = savollar.reduce((sum, s) => sum + (s.time_limit || 0), 0);
    setUmumiyVaqt(jami > 0 ? jami : null);
  }, [holat, savollar]);

  const yakunlaRef = useRef(() => {});

  useEffect(() => {
    if (umumiyTimerRef.current) clearInterval(umumiyTimerRef.current);
    if (holat !== "savollar" || umumiyVaqt === null) return;
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
  }, [holat, umumiyVaqt === null]);

  const javobBer = async (savolId, harf) => {
    setJavoblar((prev) => ({ ...prev, [savolId]: harf }));
    try {
      const res = await fetch(`${API_BASE}/api/test/javob_tekshir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savol_id: savolId, tanlangan: harf }),
      });
      const data = await res.json();
      setNatijalar((prev) => ({ ...prev, [savolId]: data }));
      if (data.togrimi) setToGriSoni((v) => v + 1); else setXatoSoni((v) => v + 1);
    } catch {
      setNatijalar((prev) => ({ ...prev, [savolId]: { togrimi: false, togri_javob: "?", tushuntirish: "" } }));
      setXatoSoni((v) => v + 1);
    }
  };

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
            ? { token, topic_codes: tanlanganMavzu.kodlar, javoblar: ro_yxat }
            : { token, topic_code: tanlanganMavzu.topic_code, javoblar: ro_yxat }
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
    setNatijalar({}); setUmumiyVaqt(null); setYozibJavob({});
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

  if (holat === "savollar") {
    const jamiJavoblangan = Object.keys(javoblar).length;

    return (
      <div className="pb-28">
        {/* Yopishqoq yuqori panel — umumiy vaqt, hisob, o'tkazish/to'xtatish */}
        <div className="sticky top-0 z-20 px-5 pt-4 pb-3" style={{ backgroundColor: "#F7F5F0", borderBottom: "1px solid #E5E1D8" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                ✓ {toGriSoni}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                ✗ {xatoSoni}
              </span>
              <span className="text-xs font-medium" style={{ color: "#8A8578" }}>{jamiJavoblangan} / {savollar.length}</span>
            </div>
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
          {/* Savol raqamlari qatori — bosilgan raqam o'sha savolga sirg'alib olib boradi */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
            {savollar.map((s, i) => {
              const nat = natijalar[s.id];
              const holatRang = nat ? (nat.togrimi ? "#639922" : "#E24B4A") : javoblar[s.id] !== undefined ? "#C89B3C" : "#E5E1D8";
              const fonRang = nat ? (nat.togrimi ? "#EAF3DE" : "#FCEBEB") : "#FFFFFF";
              return (
                <button key={s.id} onClick={() => raqamgaOt(i)}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2"
                  style={{ borderColor: holatRang, backgroundColor: fonRang, color: nat ? holatRang : "#5A5648" }}>
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
            const nat = natijalar[s.id];
            const javobBerilgan = !!nat;

            const variantRangi = (harf) => {
              if (!javobBerilgan) {
                return javoblar[s.id] === harf
                  ? { borderColor: "#1B4B7A", backgroundColor: "#EAF1F7" }
                  : { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" };
              }
              if (harf === nat.togri_javob) return { borderColor: "#639922", backgroundColor: "#EAF3DE" };
              if (harf === javoblar[s.id]) return { borderColor: "#E24B4A", backgroundColor: "#FCEBEB" };
              return { borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", opacity: 0.6 };
            };

            return (
              <div key={s.id} ref={(el) => { savolReflari.current[i] = el; }}
                className="rounded-2xl p-4 bg-white border" style={{ borderColor: javobBerilgan ? (nat.togrimi ? "#C9E4B0" : "#F3D3D3") : "#E5E1D8" }}>
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
                    <input type="text" value={javobBerilgan ? (javoblar[s.id] || "") : (yozibJavob[s.id] || "")}
                      onChange={(e) => setYozibJavob((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      disabled={javobBerilgan}
                      onKeyDown={(e) => { if (e.key === "Enter" && !javobBerilgan && (yozibJavob[s.id] || "").trim()) javobBer(s.id, yozibJavob[s.id].trim()); }}
                      placeholder="Javobingizni yozing..."
                      className="w-full px-4 py-3.5 rounded-xl border text-sm mb-3"
                      style={javobBerilgan
                        ? { borderColor: nat.togrimi ? "#639922" : "#E24B4A", backgroundColor: nat.togrimi ? "#EAF3DE" : "#FCEBEB" }
                        : { borderColor: "#E5E1D8" }} />
                    {!javobBerilgan && (
                      <button onClick={() => (yozibJavob[s.id] || "").trim() && javobBer(s.id, yozibJavob[s.id].trim())}
                        disabled={!(yozibJavob[s.id] || "").trim()}
                        className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                        style={{ backgroundColor: "#1B4B7A", opacity: (yozibJavob[s.id] || "").trim() ? 1 : 0.5 }}>
                        Javobni yuborish
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {variantlar.map(([harf, matn]) => (
                      <button key={harf} onClick={() => !javobBerilgan && javobBer(s.id, harf)} disabled={javobBerilgan}
                        className="w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3"
                        style={variantRangi(harf)}>
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{
                            backgroundColor: javobBerilgan
                              ? (harf === nat.togri_javob ? "#639922" : harf === javoblar[s.id] ? "#E24B4A" : "#F1EFE8")
                              : (javoblar[s.id] === harf ? "#1B4B7A" : "#F1EFE8"),
                            color: (javobBerilgan && (harf === nat.togri_javob || harf === javoblar[s.id])) || (!javobBerilgan && javoblar[s.id] === harf)
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
                  <div className="rounded-xl p-4 mt-3" style={{ backgroundColor: nat.togrimi ? "#EAF3DE" : "#FCEBEB" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: nat.togrimi ? "#3B6D11" : "#A32D2D" }}>
                      {nat.togrimi ? "✓ To'g'ri!" : `✗ Noto'g'ri — to'g'ri javob: ${nat.togri_javob}`}
                    </p>
                    {nat.tushuntirish && (
                      <p className="text-sm" style={{ color: nat.togrimi ? "#3B6D11" : "#A32D2D" }}>{nat.tushuntirish}</p>
                    )}
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

        {/* Yopishqoq pastki tugma — istalgan vaqtda yakunlash mumkin */}
        <div className="fixed bottom-16 inset-x-0 z-20 px-5 pb-3">
          <div className="max-w-md mx-auto">
            <button onClick={yakunla}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm shadow-lg"
              style={{ backgroundColor: "#1B4B7A" }}>
              ✓ Yakunlash ({jamiJavoblangan}/{savollar.length} javob berildi)
            </button>
          </div>
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

  if (holat === "sinf") {
    return (
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Topik mavzular</h1>
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
  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={() => setHolat("fan")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Fanlar</button>
      <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganFan}</h1>
      <p className="text-xs mb-4" style={{ color: "#8A8578" }}>
        {mavzular.length} ta mavzu · {mavzular.filter((m) => m.test_bormi).length} tasida test bor
      </p>
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
                {!m.test_bormi && (
                  <button onClick={() => onTestYarat(m.topic_code)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
                    🧪 Test shablon yaratish
                  </button>
                )}
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
    </div>
  );
}

function AdminTestlarTab({ token }) {
  return <TestTab token={token} sinf={null} />;
}

function AdminTab({ token, oldindanTanlangan }) {
  const [bolim, setBolim] = useState("test"); // "test" | "topik"

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Shablonlar</h1>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setBolim("test")}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "test"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          🧪 Test shablon
        </button>
        <button onClick={() => setBolim("topik")}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
          style={bolim === "topik"
            ? { backgroundColor: "#1B4B7A", color: "#fff" }
            : { backgroundColor: "#fff", color: "#5A5648", border: "1px solid #E5E1D8" }}>
          📋 Topik shablon
        </button>
      </div>

      {bolim === "test" && <TestShablonBolimi token={token} oldindanTanlangan={oldindanTanlangan} />}
      {bolim === "topik" && <TopikShablonBolimi token={token} />}
    </div>
  );
}

const SINF_HARFLARI = ["A", "B", "D", "E", "F", "G", "H", "I", "J", "K"];

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

function OqituvchiTab({ token }) {
  const [holat, setHolat] = useState("togaraklar"); // togaraklar | azolar | yaratish
  const [togaraklar, setTogaraklar] = useState([]);
  const [tanlangan, setTanlangan] = useState(null);
  const [azolar, setAzolar] = useState([]);
  const [bahoQoyilayotgan, setBahoQoyilayotgan] = useState(null); // user_id | null
  const [bahoQiymati, setBahoQiymati] = useState("");
  const [izohQiymati, setIzohQiymati] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  const [yangiNomi, setYangiNomi] = useState("");
  const [yangiFan, setYangiFan] = useState("");
  const [yangiSinf, setYangiSinf] = useState("");         // "1".."11"
  const [yangiMaxsusSinf, setYangiMaxsusSinf] = useState(false); // true bo'lsa to'garak guruhi (masalan "3-4")
  const [yangiSinfMatni, setYangiSinfMatni] = useState(""); // tanlangan to'garak sinfi (masalan "3-4")
  const [togarakSinflari, setTogarakSinflari] = useState([]); // mavjud to'garak sinflari ro'yxati
  const [togarakSinflariYuklanmoqda, setTogarakSinflariYuklanmoqda] = useState(false);
  const [sinfFanlari, setSinfFanlari] = useState([]); // tanlangan sinf uchun MAVJUD fanlar ro'yxati
  const [sinfFanlariYuklanmoqda, setSinfFanlariYuklanmoqda] = useState(false);
  const [yangiParol, setYangiParol] = useState("");
  const [yangiMaxTalaba, setYangiMaxTalaba] = useState("");
  const [yangiOylikSumma, setYangiOylikSumma] = useState("");
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

  useEffect(() => {
    fetch(`${API_BASE}/api/oqituvchi/togaraklar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setTogaraklar(d.togaraklar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Yuklab bo'lmadi"); setYuklanmoqda(false); });
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setTogaraklar((prev) => [...prev, { id: data.togarak_id, nomi: yangiNomi.trim(), fan: yangiFan.trim(), sinf: sinfQiymati, max_talaba: yangiMaxTalaba || null, azo_soni: 0 }]);
      setYangiNomi(""); setYangiFan(""); setYangiSinf(""); setYangiMaxsusSinf(false); setYangiSinfMatni("");
      setTogarakSinflari([]); setSinfFanlari([]);
      setYangiParol(""); setYangiMaxTalaba(""); setYangiOylikSumma("");
      setHolat("togaraklar");
    } catch (e) {
      setXato(e.message);
    } finally { setYaratilmoqda(false); }
  };

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
        <h1 className="text-xl font-bold mb-5" style={{ color: "#2B2B2B" }}>{tanlangan.nomi}</h1>
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

  // holat === "togaraklar"
  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Guruhlarim</h1>
        <button onClick={() => { setXato(""); setHolat("yaratish"); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: "#C89B3C" }}>
          + Yangi
        </button>
      </div>
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
  }, [tanlanganBola]);

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

        <div className="rounded-xl px-4 py-3 mb-1 flex items-start gap-2.5" style={{ backgroundColor: "#EAF1F7" }}>
          <span className="text-base shrink-0">💡</span>
          <p className="text-xs" style={{ color: "#1B4B7A" }}>
            Bu yerda farzandingizning <b>bilim darajasini</b>, har fan bo'yicha <b>ta'lim yo'lini</b> (qaysi
            mavzular o'tilgan, qaysilari qolgan) va agar to'garakka a'zo bo'lsa — <b>to'garak yutuqlarini</b> ham
            kuzatib borishingiz mumkin. Yana farzand qo'shish yoki ulanishni uzish uchun — Profil bo'limiga o'ting.
          </p>
        </div>
      </div>
      {yuklanmoqda ? (
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      onYangilandi({
        ...foydalanuvchi, full_name: ism, region: viloyat, district: tuman,
        tugilgan_sana: tugilganSana, maktab_raqami: maktabRaqami,
        maktab_turi_kaliti: maktabTuri, class: sinf, class_letter: sinfHarfi,
        jins, oqituvchi_fani: oqituvchiFani,
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
              <span key={t.id} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                {t.nomi}
              </span>
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
      {korinishRoli === "oqituvchi" && tab === "oqituvchi" && <OqituvchiTab token={token} />}
      {korinishRoli === "ota-ona" && tab === "farzand" && <OtaOnaTab token={token} foydalanuvchi={foydalanuvchi} rang={joriyRang} />}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "bilim" && <BilimTab data={bilimData} bolaId={foydalanuvchi?.user_id} rang={joriyRang} />}
      {korinishRoli !== "admin" && korinishRoli !== "oqituvchi" && korinishRoli !== "ota-ona" && tab === "test" && (
        <TestTab token={token} sinf={foydalanuvchi?.class} onTestFaollik={setTestDavomida} />
      )}
      {tab === "xabar" && (
        <div className="px-5 pt-6"><h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Bildirishnomalar</h1>
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}><p className="text-sm" style={{ color: "#8A8578" }}>Tez orada.</p></div></div>
      )}
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
