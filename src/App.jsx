import React, { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  ChevronRight, ChevronDown, TrendingUp, Home, BarChart3, Bell, User,
  Award, AlertCircle, Loader2, WifiOff,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// HAQIQIY BACKEND — Railway'da ishlayotgan server
// ═══════════════════════════════════════════════════════════
const API_BASE = "https://talimplatformasi-production.up.railway.app";

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

function MavzuKoshin({ mavzu }) {
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden"
      style={{ backgroundColor: darajaRang(mavzu.foiz) }}
      title={`${mavzu.nom}: ${mavzu.foiz}%`}
    >
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 8px)",
      }} />
      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm drop-shadow">
        {mavzu.foiz}%
      </span>
    </div>
  );
}

function FanBolimi({ fan, ochiq, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden border transition-all duration-300"
      style={{ borderColor: ochiq ? fan.rang : "#E5E1D8", backgroundColor: "#FFFFFF" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left focus:outline-none">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ backgroundColor: fan.rang }}>
          {fan.qisqa}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold text-lg" style={{ color: "#2B2B2B" }}>{fan.nom}</h3>
            <span className="text-2xl font-bold shrink-0" style={{ color: fan.rang }}>{fan.foiz}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EFEBE1" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${fan.foiz}%`, backgroundColor: fan.rang }} />
          </div>
        </div>
        {ochiq ? <ChevronDown size={20} className="shrink-0" style={{ color: "#8A8578" }} />
               : <ChevronRight size={20} className="shrink-0" style={{ color: "#8A8578" }} />}
      </button>
      {ochiq && (
        <div className="px-5 pb-5 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {fan.mavzular.map((m) => <MavzuKoshin key={m.nom} mavzu={m} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// KIRISH EKRANI — haqiqiy backendga ulanish uchun
// (To'liq Google OAuth bu ko'rinishda ishlamaydi, shuning uchun
//  test uchun bola ID orqali to'g'ridan kiramiz)
// ═══════════════════════════════════════════════════════════
function KirishEkrani({ onKir }) {
  const [id, setId] = useState("");
  const [xato, setXato] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(false);

  const kirish = async () => {
    if (!id.trim()) return;
    setXato(""); setYuklanmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/api/bola/${id.trim()}/bilim`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Topilmadi");
      }
      const data = await res.json();
      onKir(id.trim(), data);
    } catch (e) {
      setXato(e.message === "Failed to fetch" ? "Serverga ulanib bo'lmadi" : e.message);
    } finally {
      setYuklanmoqda(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F5F0" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 grid grid-cols-2 grid-rows-2 gap-0.5 p-1.5" style={{ backgroundColor: "#1B4B7A" }}>
            <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
            <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
            <div className="rounded-sm" style={{ backgroundColor: "#2D8B8B" }} />
            <div className="rounded-sm" style={{ backgroundColor: "#C89B3C" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>SamTM Ta'lim</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8578" }}>Haqiqiy backendga ulanish (sinov)</p>
        </div>

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>
          Bola / o'quvchi user_id (botdagi)
        </label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && kirish()}
          placeholder="masalan: 401251407"
          className="w-full px-4 py-3 rounded-xl border text-base mb-3"
          style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF" }}
        />

        {xato && (
          <div className="flex items-center gap-2 text-sm mb-3 px-1" style={{ color: "#B0553A" }}>
            <WifiOff size={15} /> {xato}
          </div>
        )}

        <button
          onClick={kirish}
          disabled={yuklanmoqda}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}
        >
          {yuklanmoqda ? <><Loader2 size={18} className="animate-spin" /> Yuklanmoqda...</> : "Bilimni ko'rish"}
        </button>

        <p className="text-xs text-center mt-4" style={{ color: "#B0AA98" }}>
          Bu — Google kirish o'rniga, backendni sinash uchun vaqtinchalik ekran
        </p>
      </div>
    </div>
  );
}

function BilimTab({ maNomi, data }) {
  const [ochiqFan, setOchiqFan] = useState(data.fanlar[0]?.nom || null);
  const radarData = data.fanlar.map((f) => ({ fan: f.qisqa, foiz: f.foiz, fullMark: 100 }));

  return (
    <div>
      <div className="relative overflow-hidden px-5 pt-6 pb-8" style={{ backgroundColor: "#1B4B7A" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(135deg, #fff 25%, transparent 25%), linear-gradient(225deg, #fff 25%, transparent 25%), linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(315deg, #fff 25%, transparent 25%)",
          backgroundPosition: "20px 0, 20px 0, 0 0, 0 0", backgroundSize: "40px 40px", backgroundRepeat: "repeat",
        }} />
        <div className="relative">
          <p className="text-sm font-medium tracking-wide uppercase" style={{ color: "#7FB8B8" }}>Haqiqiy ma'lumot</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{data.bola?.ism || maNomi}</h1>
          <div className="mt-6 flex items-end gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">{data.umumiy_foiz}</span>
                <span className="text-xl font-bold" style={{ color: "#C89B3C" }}>%</span>
              </div>
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#B8CBDA" }}>
                <TrendingUp size={12} /> {darajaNom(data.umumiy_foiz)}
              </p>
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
        </div>
      </div>

      <div className="px-5 -mt-3 pb-4 space-y-3">
        {data.fanlar.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>
              Bu foydalanuvchi hali birorta ham mavzu o'rganmagan — <code>learned_topics</code> jadvalida yozuv yo'q.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: "#FFF8E8", border: "1px solid #EEDFB0" }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#C89B3C" }} />
              <p className="text-sm" style={{ color: "#6B5B2E" }}>Koshinka rangi to'q — mavzu yaxshi o'zlashtirilgan.</p>
            </div>
            {data.fanlar.map((fan) => (
              <FanBolimi key={fan.nom} fan={fan} ochiq={ochiqFan === fan.nom}
                onToggle={() => setOchiqFan(ochiqFan === fan.nom ? null : fan.nom)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function XabarlarTab() {
  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Bildirishnomalar</h1>
      <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-sm" style={{ color: "#8A8578" }}>
          Bu bo'lim hali backend'ga ulanmagan — keyingi bosqichda qo'shiladi.
        </p>
      </div>
    </div>
  );
}

function ProfilTab({ id }) {
  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Profil</h1>
      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <p className="text-xs" style={{ color: "#8A8578" }}>Ulangan user_id</p>
        <p className="text-sm font-medium mt-1" style={{ color: "#2B2B2B" }}>{id}</p>
      </div>
    </div>
  );
}

function PastkiMenyu({ faol, onTanlash }) {
  const bandlar = [
    { kalit: "bilim", nom: "Bilim", ikon: BarChart3 },
    { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
    { kalit: "profil", nom: "Profil", ikon: User },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t"
      style={{ backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#E5E1D8" }}>
      <div className="max-w-md mx-auto grid grid-cols-3">
        {bandlar.map(({ kalit, nom, ikon: Ikon }) => {
          const aktiv = faol === kalit;
          return (
            <button key={kalit} onClick={() => onTanlash(kalit)}
              className="flex flex-col items-center gap-1 py-3 transition-colors">
              <Ikon size={22} strokeWidth={aktiv ? 2.5 : 2}
                style={{ color: aktiv ? "#1B4B7A" : "#8A8578" }} />
              <span className="text-xs" style={{ color: aktiv ? "#1B4B7A" : "#8A8578", fontWeight: aktiv ? 600 : 400 }}>
                {nom}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function OtaOnaIlovaHaqiqiy() {
  const [ulangan, setUlangan] = useState(null); // { id, data }
  const [tab, setTab] = useState("bilim");

  if (!ulangan) {
    return <KirishEkrani onKir={(id, data) => setUlangan({ id, data })} />;
  }

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F7F5F0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {tab === "bilim" && <BilimTab maNomi={ulangan.id} data={ulangan.data} />}
      {tab === "xabar" && <XabarlarTab />}
      {tab === "profil" && <ProfilTab id={ulangan.id} />}
      <PastkiMenyu faol={tab} onTanlash={setTab} />
    </div>
  );
}
