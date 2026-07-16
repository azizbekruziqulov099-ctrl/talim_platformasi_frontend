import React, { useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  ChevronRight, ChevronDown, TrendingUp, BarChart3, Bell, User,
  Loader2, WifiOff, KeyRound, UserPlus, PencilLine,
} from "lucide-react";

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
        body: JSON.stringify({ email, ism: ismInput.trim(), rol, sinf: rol === "oquvchi" ? sinf : undefined }),
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
        </>
      )}

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
function MavzuKoshin({ mavzu }) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: darajaRang(mavzu.foiz) }} title={`${mavzu.nom}: ${mavzu.foiz}%`}>
      <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm drop-shadow">{mavzu.foiz}%</span>
    </div>
  );
}

function FanBolimi({ fan, ochiq, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden border transition-all duration-300" style={{ borderColor: ochiq ? fan.rang : "#E5E1D8", backgroundColor: "#FFFFFF" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left focus:outline-none">
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
        {ochiq ? <ChevronDown size={20} className="shrink-0" style={{ color: "#8A8578" }} /> : <ChevronRight size={20} className="shrink-0" style={{ color: "#8A8578" }} />}
      </button>
      {ochiq && (
        <div className="px-5 pb-5 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {fan.mavzular.map((m) => <MavzuKoshin key={m.nom} mavzu={m} />)}
        </div>
      )}
    </div>
  );
}

function BilimTab({ data }) {
  const [ochiqFan, setOchiqFan] = useState(data.fanlar[0]?.nom || null);
  const radarData = data.fanlar.map((f) => ({ fan: f.qisqa, foiz: f.foiz }));

  return (
    <div>
      <div className="relative overflow-hidden px-5 pt-6 pb-8" style={{ backgroundColor: "#1B4B7A" }}>
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
        </div>
      </div>
      <div className="px-5 -mt-3 pb-4 space-y-3">
        {data.fanlar.length === 0 ? (
          <div className="rounded-2xl p-6 text-center bg-white border mt-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm" style={{ color: "#8A8578" }}>Hali birorta ham mavzu o'rganilmagan.</p>
          </div>
        ) : (
          data.fanlar.map((fan) => (
            <FanBolimi key={fan.nom} fan={fan} ochiq={ochiqFan === fan.nom} onToggle={() => setOchiqFan(ochiqFan === fan.nom ? null : fan.nom)} />
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 4) TEST YECHISH
// ═══════════════════════════════════════════════════════════
function TestTab({ token, sinf }) {
  const [holat, setHolat] = useState("mavzular"); // mavzular | songi | savollar | natija
  const [fanlar, setFanlar] = useState([]);
  const [ochiqFan, setOchiqFan] = useState(null);
  const [ochiqSinf, setOchiqSinf] = useState(null); // "fanQisqa:sinf" formatida
  const [savollar, setSavollar] = useState([]);
  const [tanlanganMavzu, setTanlanganMavzu] = useState(null);
  const [joriySavol, setJoriySavol] = useState(0);
  const [javoblar, setJavoblar] = useState({});
  const [natija, setNatija] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  useEffect(() => {
    const url = sinf ? `${API_BASE}/api/mavzular?sinf=${encodeURIComponent(sinf)}` : `${API_BASE}/api/mavzular`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [sinf]);

  // Mavzu bosilganda — darhol savol OLMAYMIZ, avval "nechta savol" so'raymiz
  const mavzuBoslandi = (fan, mavzu) => {
    setTanlanganMavzu({ ...mavzu, fanNomi: fan.nom });
    setHolat("songi");
  };

  const savollarniYukla = async (soni) => {
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${API_BASE}/api/test/${tanlanganMavzu.topic_code}?soni=${soni}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Xato");
      setSavollar(data.savollar);
      setJavoblar({}); setJoriySavol(0); setHolat("savollar");
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const [joriyNatija, setJoriyNatija] = useState(null); // {togrimi, togri_javob, tushuntirish} | null
  const [qolganVaqt, setQolganVaqt] = useState(null);
  const [avtoQoldi, setAvtoQoldi] = useState(null);
  const timerRef = useRef(null);
  const avtoRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (holat !== "savollar" || joriyNatija || !savollar[joriySavol]) return;

    const s = savollar[joriySavol];
    if (!s.time_limit) { setQolganVaqt(null); return; }
    setQolganVaqt(s.time_limit);
    timerRef.current = setInterval(() => {
      setQolganVaqt((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current);
          javobBer(s.id, "");
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joriySavol, holat]);

  const javobBer = async (savolId, harf) => {
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
    } catch {
      setJoriyNatija({ togrimi: false, togri_javob: "?", tushuntirish: "" });
    }
  };

  const keyingiSavolga = () => {
    if (avtoRef.current) clearInterval(avtoRef.current);
    setJoriyNatija(null);
    if (joriySavol < savollar.length - 1) setJoriySavol(joriySavol + 1);
    else yakunla();
  };

  // Javob ko'rsatilgach (to'g'ri/noto'g'ri chiqqach), 4 soniyadan keyin
  // AVTOMATIK keyingi savolga o'tadi — foydalanuvchi tugma bosishi shart emas
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

  const yakunla = async () => {
    setYuklanmoqda(true);
    const ro_yxat = Object.entries(javoblar).map(([id, tanlangan]) => ({
      savol_id: parseInt(id, 10), tanlangan,
    }));
    try {
      const res = await fetch(`${API_BASE}/api/test/natija`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, topic_code: tanlanganMavzu.topic_code, javoblar: ro_yxat }),
      });
      const data = await res.json();
      setNatija(data);
      setHolat("natija");
    } catch (e) {
      setXato("Natijani yuborib bo'lmadi");
    } finally { setYuklanmoqda(false); }
  };

  const qaytaBoshlash = () => {
    setHolat("mavzular"); setTanlanganMavzu(null); setSavollar([]); setNatija(null); setJoriyNatija(null);
  };

  if (yuklanmoqda) {
    return <div className="px-5 pt-16 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>;
  }

  if (holat === "natija") {
    const rangi = natija.foiz >= 85 ? "#C89B3C" : natija.foiz >= 65 ? "#2D8B8B" : natija.foiz >= 45 ? "#B0553A" : "#8A8578";
    return (
      <div className="px-5 pt-10 text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${rangi}1A` }}>
          <span className="text-2xl font-bold" style={{ color: rangi }}>{natija.foiz}%</span>
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        <p className="text-sm mb-6" style={{ color: "#8A8578" }}>{natija.togri} / {natija.jami} to'g'ri</p>
        <button onClick={qaytaBoshlash} className="px-6 py-3 rounded-xl font-semibold text-white" style={{ backgroundColor: "#1B4B7A" }}>
          Boshqa mavzu
        </button>
      </div>
    );
  }

  if (holat === "songi") {
    const jami = tanlanganMavzu.savol_soni || 0;
    const variantlar = [5, 10, 15].filter((n) => n < jami);
    return (
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => setHolat("mavzular")} className="text-sm mb-4" style={{ color: "#8A8578" }}>← Ortga</button>
        <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>{tanlanganMavzu.nomi}</h1>
        <p className="text-sm mb-6" style={{ color: "#8A8578" }}>Nechta savol yechasiz?</p>
        <div className="space-y-2.5">
          {variantlar.map((n) => (
            <button key={n} onClick={() => savollarniYukla(n)}
              className="w-full py-3.5 rounded-xl border font-medium text-center"
              style={{ borderColor: "#E5E1D8", backgroundColor: "#FFFFFF", color: "#2B2B2B" }}>
              {n} ta savol
            </button>
          ))}
          <button onClick={() => savollarniYukla(jami)}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-center"
            style={{ backgroundColor: "#1B4B7A" }}>
            Hammasi ({jami} ta)
          </button>
        </div>
      </div>
    );
  }

  if (holat === "savollar") {
    const s = savollar[joriySavol];
    const oxirgi = joriySavol === savollar.length - 1;
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
          <p className="text-xs font-medium" style={{ color: "#8A8578" }}>{joriySavol + 1} / {savollar.length}</p>
          <div className="flex items-center gap-3">
            {qolganVaqt !== null && !javobBerilgan && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: qolganVaqt <= 5 ? "#FCEBEB" : "#F1EFE8", color: qolganVaqt <= 5 ? "#A32D2D" : "#5A5648" }}>
                ⏱ {qolganVaqt}s
              </span>
            )}
            <p className="text-xs" style={{ color: "#8A8578" }}>{tanlanganMavzu.nomi}</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: "#EFEBE1" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((joriySavol + 1) / savollar.length) * 100}%`, backgroundColor: "#1B4B7A" }} />
        </div>

        {s.rasm_id && (
          <img src={`${API_BASE}/api/rasm/${s.rasm_id}`} alt=""
            className="w-full rounded-xl mb-4 object-cover"
            style={{ maxHeight: "220px", backgroundColor: "#EFEBE1" }}
            onError={(e) => { e.target.style.display = "none"; }} />
        )}

        <h2 className="text-lg font-semibold mb-5" style={{ color: "#2B2B2B" }}>{s.question}</h2>
        <div className="space-y-2.5 mb-4">
          {variantlar.map(([harf, matn]) => (
            <button key={harf} onClick={() => !javobBerilgan && javobBer(s.id, harf)} disabled={javobBerilgan}
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
              <span className="text-sm" style={{ color: "#2B2B2B" }}>{matn}</span>
            </button>
          ))}
        </div>

        {javobBerilgan && (
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: joriyNatija.togrimi ? "#EAF3DE" : "#FCEBEB" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: joriyNatija.togrimi ? "#3B6D11" : "#A32D2D" }}>
              {joriyNatija.togrimi ? "✓ To'g'ri!" : "✗ Noto'g'ri"}
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
      </div>
    );
  }

  // holat === "mavzular"
  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Test yechish</h1>
      {xato && <p className="text-sm mb-4" style={{ color: "#B0553A" }}>{xato}</p>}
      {fanlar.length === 0 ? (
        <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <p className="text-sm" style={{ color: "#8A8578" }}>Hozircha test mavjud emas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fanlar.map((fan) => {
            const ochiq = ochiqFan === fan.qisqa;
            const bittaSinf = fan.sinflar.length === 1;
            return (
              <div key={fan.qisqa} className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: "#E5E1D8" }}>
                <button onClick={() => setOchiqFan(ochiq ? null : fan.qisqa)} className="w-full flex items-center justify-between p-4">
                  <span className="font-semibold text-sm" style={{ color: "#2B2B2B" }}>{fan.nom}</span>
                  {ochiq ? <ChevronDown size={18} style={{ color: "#8A8578" }} /> : <ChevronRight size={18} style={{ color: "#8A8578" }} />}
                </button>
                {ochiq && bittaSinf && (
                  <div className="px-4 pb-4 space-y-2">
                    {fan.sinflar[0].mavzular.map((m) => (
                      <button key={m.topic_code} onClick={() => mavzuBoslandi(fan, m)}
                        className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl"
                        style={{ backgroundColor: "#F7F5F0" }}>
                        <span className="text-sm" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                        <span className="text-xs" style={{ color: "#8A8578" }}>{m.savol_soni} ta</span>
                      </button>
                    ))}
                  </div>
                )}
                {ochiq && !bittaSinf && (
                  <div className="px-4 pb-4 space-y-2">
                    {fan.sinflar.map((s) => {
                      const sKaliti = `${fan.qisqa}:${s.sinf}`;
                      const sOchiq = ochiqSinf === sKaliti;
                      return (
                        <div key={s.sinf} className="rounded-xl overflow-hidden" style={{ backgroundColor: "#F7F5F0" }}>
                          <button onClick={() => setOchiqSinf(sOchiq ? null : sKaliti)}
                            className="w-full flex items-center justify-between px-3.5 py-3">
                            <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{s.sinf}-sinf</span>
                            {sOchiq ? <ChevronDown size={16} style={{ color: "#8A8578" }} /> : <ChevronRight size={16} style={{ color: "#8A8578" }} />}
                          </button>
                          {sOchiq && (
                            <div className="px-3 pb-3 space-y-2">
                              {s.mavzular.map((m) => (
                                <button key={m.topic_code} onClick={() => mavzuBoslandi(fan, m)}
                                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-white">
                                  <span className="text-sm" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                                  <span className="text-xs" style={{ color: "#8A8578" }}>{m.savol_soni} ta</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PastkiMenyu({ faol, onTanlash }) {
  const bandlar = [
    { kalit: "bilim", nom: "Bilim", ikon: BarChart3 },
    { kalit: "test", nom: "Test", ikon: PencilLine },
    { kalit: "xabar", nom: "Xabarlar", ikon: Bell },
    { kalit: "profil", nom: "Profil", ikon: User },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t" style={{ backgroundColor: "rgba(255,255,255,0.97)", borderColor: "#E5E1D8" }}>
      <div className="max-w-md mx-auto grid grid-cols-4">
        {bandlar.map(({ kalit, nom, ikon: Ikon }) => {
          const aktiv = faol === kalit;
          return (
            <button key={kalit} onClick={() => onTanlash(kalit)} className="flex flex-col items-center gap-1 py-3 transition-colors">
              <Ikon size={22} strokeWidth={aktiv ? 2.5 : 2} style={{ color: aktiv ? "#1B4B7A" : "#8A8578" }} />
              <span className="text-xs" style={{ color: aktiv ? "#1B4B7A" : "#8A8578", fontWeight: aktiv ? 600 : 400 }}>{nom}</span>
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
  const [tab, setTab] = useState("bilim");
  const [xatoMatn, setXatoMatn] = useState("");

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

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F7F5F0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {tab === "bilim" && <BilimTab data={bilimData} />}
      {tab === "test" && <TestTab token={token} sinf={foydalanuvchi?.is_admin ? null : foydalanuvchi?.class} />}
      {tab === "xabar" && (
        <div className="px-5 pt-6"><h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Bildirishnomalar</h1>
          <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}><p className="text-sm" style={{ color: "#8A8578" }}>Tez orada.</p></div></div>
      )}
      {tab === "profil" && (
        <div className="px-5 pt-6"><h1 className="text-2xl font-bold mb-5" style={{ color: "#2B2B2B" }}>Profil</h1>
          <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-xs" style={{ color: "#8A8578" }}>Ism</p><p className="text-sm font-medium mb-3" style={{ color: "#2B2B2B" }}>{foydalanuvchi?.full_name}</p>
            <p className="text-xs" style={{ color: "#8A8578" }}>Rol</p><p className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{foydalanuvchi?.role}</p>
          </div></div>
      )}
      <PastkiMenyu faol={tab} onTanlash={setTab} />
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
