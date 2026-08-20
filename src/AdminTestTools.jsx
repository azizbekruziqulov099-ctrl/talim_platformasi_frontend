import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, Loader2 } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://talimplatformasi-production.up.railway.app";

export function TopikMavzularTab({ token, onTestYarat }) {
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
  const [mavzuniOchirishTasdiqi, setMavzuniOchirishTasdiqi] = useState(null); // mavzu obyekti | null (BUTUN mavzuni o'chirish uchun)
  const [boshKodTozalashXabari, setBoshKodTozalashXabari] = useState("");
  const [faqatToliq, setFaqatToliq] = useState(true); // true: faqat Bob+Bo'lim to'ldirilgan mavzularni ko'rsatadi
  const [fanOchirishTasdiqi, setFanOchirishTasdiqi] = useState(false);
  const [fanMavzulariniOchirishTasdiqi, setFanMavzulariniOchirishTasdiqi] = useState(false);
  const [ochirilmoqda, setOchirilmoqda] = useState(false);
  const [rasmGaleriyasi, setRasmGaleriyasi] = useState(null); // {sarlavha, rasmlar: [id,...]} | null
  const [rasmlarYuklanmoqda, setRasmlarYuklanmoqda] = useState(false);
  const [umumiyKorinish, setUmumiyKorinish] = useState(null); // {sinflar: [...]} | null (ochilganda yuklanadi)
  const [umumiyYuklanmoqda, setUmumiyYuklanmoqda] = useState(false);
  const [kodMoslik, setKodMoslik] = useState(null);
  const [kodMoslikYuklanmoqda, setKodMoslikYuklanmoqda] = useState(false);
  const [bobBolimTahrirlanayotgan, setBobBolimTahrirlanayotgan] = useState(null); // topic_code | null
  const [bobBolimQiymat, setBobBolimQiymat] = useState({ bob: "", bolim: "" });
  const [bobBolimSaqlanmoqda, setBobBolimSaqlanmoqda] = useState(false);

  const bobBolimniSaqla = async (mavzu) => {
    setBobBolimSaqlanmoqda(true);
    try {
      const kodlar = (mavzu.barcha_kodlar && mavzu.barcha_kodlar.length > 0 ? mavzu.barcha_kodlar : [mavzu.topic_code]).join(",");
      const params = new URLSearchParams({
        token, topic_codes: kodlar, yangi_bob: bobBolimQiymat.bob, yangi_bolim: bobBolimQiymat.bolim,
      });
      const res = await fetch(`${API_BASE}/api/admin/mavzu_bob_bolim_tahrirla?${params}`, { method: "PUT" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Xato");
      setBobBolimTahrirlanayotgan(null);
      mavzularniQaytaYukla();
    } catch (e) {
      setXato(e.message);
    } finally {
      setBobBolimSaqlanmoqda(false);
    }
  };

  const kodMoslikniTekshir = () => {
    setKodMoslikYuklanmoqda(true); setKodMoslik(null);
    fetch(`${API_BASE}/api/admin/mavzu_kod_moslik?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`)
      .then((r) => r.json())
      .then((d) => { setKodMoslik(d); setKodMoslikYuklanmoqda(false); })
      .catch(() => { setXato("Kod moslikni tekshirib bo'lmadi"); setKodMoslikYuklanmoqda(false); });
  };

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

  const mavzuniButunlayOchir = async (mavzu) => {
    setOchirilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/mavzu_ochir?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`, {
        method: "DELETE",
      });
      setMavzuniOchirishTasdiqi(null);
      mavzularniQaytaYukla();
    } catch {
      setXato("O'chirib bo'lmadi");
    } finally { setOchirilmoqda(false); }
  };

  const boshKodliMavzularniTozala = async () => {
    setOchirilmoqda(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/bosh_kodli_mavzularni_tozalash?token=${encodeURIComponent(token)}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      setBoshKodTozalashXabari(`✅ ${d.tozalangan_soni || 0} ta bo'sh kodli mavzu tozalandi`);
      mavzularniQaytaYukla();
    } catch {
      setXato("Tozalab bo'lmadi");
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

  const fanMavzulariniButunlayOchir = async () => {
    setOchirilmoqda(true);
    try {
      await fetch(`${API_BASE}/api/admin/fan_mavzularini_butunlay_ochir?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`, {
        method: "DELETE",
      });
      setFanMavzulariniOchirishTasdiqi(false);
      setHolat("fan");
      setYuklanmoqda(true);
      fetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(tanlanganSinf)}&token=${encodeURIComponent(token)}`)
        .then((r) => r.json())
        .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
        .catch(() => { setXato("Fanlarni yuklab bo'lmadi"); setYuklanmoqda(false); });
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
        <button onClick={boshKodliMavzularniTozala} disabled={ochirilmoqda}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold mb-4 border"
          style={{ borderColor: "#F5C6C6", color: "#A32D2D", opacity: ochirilmoqda ? 0.6 : 1 }}>
          {ochirilmoqda ? <Loader2 size={14} className="animate-spin" /> : "🧹 Bo'sh kodli (buzuq) mavzularni tozalash"}
        </button>
        {boshKodTozalashXabari && <p className="text-xs mb-4" style={{ color: "#3B6D11" }}>{boshKodTozalashXabari}</p>}
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
              <button onClick={() => setUmumiyKorinish(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Yopish</button>
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
        <button onClick={() => setHolat("sinf")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Sinflar</button>
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
  const toliqMavzular = mavzular.filter((m) => (m.bob || "").trim() && (m.bolim || "").trim());
  const chalaSoni = mavzular.length - toliqMavzular.length;
  const korinadiganManba = faqatToliq ? toliqMavzular : mavzular;
  const korinadigan = korinadiganManba.slice(sahifa * SAHIFA_HAJMI, sahifa * SAHIFA_HAJMI + SAHIFA_HAJMI);
  const jamiSahifa = Math.ceil(korinadiganManba.length / SAHIFA_HAJMI) || 1;
  const testliSoni = mavzular.filter((m) => m.test_bormi).length;
  return (
    <div className="px-5 pt-6 pb-4">
      <button onClick={() => setHolat("fan")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Fanlar</button>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>{tanlanganFan}</h1>
        {testliSoni > 0 && (
          <button onClick={() => setFanOchirishTasdiqi(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
            🗑 Fandagi barcha testlarni o'chirish
          </button>
        )}
      </div>
      {mavzular.length > 0 && (
        <button onClick={() => setFanMavzulariniOchirishTasdiqi(true)}
          className="text-xs font-semibold mb-1" style={{ color: "#A32D2D" }}>
          🗑 Fandagi barcha mavzularni butunlay o'chirish ({mavzular.length} ta)
        </button>
      )}
      <button onClick={kodMoslikniTekshir} disabled={kodMoslikYuklanmoqda}
        className="text-xs font-semibold mb-1 block" style={{ color: "#1B4B7A" }}>
        {kodMoslikYuklanmoqda ? "Tekshirilmoqda..." : "🔍 \"Test yo'q\" sababini tekshirish (kod moslik)"}
      </button>
      {kodMoslik && (
        <div className="rounded-xl p-3 mb-3 text-xs" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
          <p className="font-semibold mb-1.5">Prefiks: <span className="font-mono">{kodMoslik.prefiks}</span></p>
          {kodMoslik.yetim_testlar.length === 0 ? (
            <p>✅ Barcha mavjud testlar mavzular bilan to'g'ri moslashgan — "yetim" test topilmadi.</p>
          ) : (
            <>
              <p className="font-semibold" style={{ color: "#A32D2D" }}>⚠️ {kodMoslik.yetim_testlar.length} xil kodda "yetim" testlar bor (Mavzular ro'yxatida topilmadi):</p>
              {kodMoslik.yetim_testlar.map((y) => (
                <p key={y.topic_code} className="font-mono mt-0.5" style={{ wordBreak: "break-all" }}>{y.topic_code} — {y.test_soni} ta test</p>
              ))}
            </>
          )}
          <p className="mt-2 font-semibold">Mavzular ro'yxatidagi kodlar va ularning test soni:</p>
          {kodMoslik.mavzular.map((m) => (
            <p key={m.topic_code} className="font-mono mt-0.5" style={{ wordBreak: "break-all", color: m.test_soni > 0 ? "#1B4B7A" : "#8A8578" }}>
              {m.topic_code} — {m.mavzu_nomi} ({m.test_soni} ta test)
            </p>
          ))}
        </div>
      )}
      <p className="text-xs mb-2" style={{ color: "#8A8578" }}>
        {korinadiganManba.length} ta mavzu · {testliSoni} tasida test bor{chalaSoni > 0 ? ` · ${chalaSoni} tasi chala (Bob/Bo'lim bo'sh)` : ""}
      </p>
      {chalaSoni > 0 && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input type="checkbox" checked={faqatToliq} onChange={(e) => { setFaqatToliq(e.target.checked); setSahifa(0); }} />
          <span className="text-xs" style={{ color: "#5A5648" }}>Faqat to'liq to'ldirilganlarni ko'rsatish (chala {chalaSoni} tasini yashirish)</span>
        </label>
      )}
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
                <p className="text-xs mb-1" style={{ color: "#8A8578" }}>
                  {m.chorak ? `${m.chorak}-chorak` : ""}{m.bob ? ` · ${m.bob}` : ""}{m.bolim ? ` · ${m.bolim}` : ""} · {m.kichik_soni} kichik mavzu
                </p>
                <p className="text-[11px] mb-2 font-mono" style={{ color: "#B0AA98" }}>
                  {m.barcha_kodlar && m.barcha_kodlar.length > 1 ? m.barcha_kodlar.join(", ") : m.topic_code}
                </p>
                {!m.bob && !m.bolim && (
                  bobBolimTahrirlanayotgan === m.topic_code ? (
                    <div className="mb-2.5 p-2.5 rounded-lg space-y-1.5" style={{ backgroundColor: "#F7F5F0" }}>
                      <input value={bobBolimQiymat.bob} onChange={(e) => setBobBolimQiymat((q) => ({ ...q, bob: e.target.value }))}
                        placeholder="Bob (masalan: 1-bob. Sonlar)" className="w-full px-2.5 py-1.5 rounded-lg text-xs border" style={{ borderColor: "#E5E1D8" }} />
                      <input value={bobBolimQiymat.bolim} onChange={(e) => setBobBolimQiymat((q) => ({ ...q, bolim: e.target.value }))}
                        placeholder="Bo'lim (masalan: 1-bo'lim. Narsalar)" className="w-full px-2.5 py-1.5 rounded-lg text-xs border" style={{ borderColor: "#E5E1D8" }} />
                      <div className="flex gap-2">
                        <button onClick={() => bobBolimniSaqla(m)} disabled={bobBolimSaqlanmoqda}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
                          {bobBolimSaqlanmoqda ? "Saqlanmoqda..." : "Saqlash"}
                        </button>
                        <button onClick={() => setBobBolimTahrirlanayotgan(null)} disabled={bobBolimSaqlanmoqda}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EFEBE1", color: "#5A5648" }}>
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setBobBolimTahrirlanayotgan(m.topic_code); setBobBolimQiymat({ bob: "", bolim: "" }); }}
                      className="text-xs font-semibold mb-2.5" style={{ color: "#1B4B7A" }}>
                      ✏️ Bob/Bo'limni to'ldirish
                    </button>
                  )
                )}
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
                  <button onClick={() => setMavzuniOchirishTasdiqi(m)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: "#F5C6C6", color: "#A32D2D" }}>
                    🗑 Mavzuni butunlay o'chirish
                  </button>
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
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
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

      {mavzuniOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>🗑 Mavzuni butunlay o'chirasizmi?</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{mavzuniOchirishTasdiqi.nomi}" mavzusining O'ZI (nomi, kodi) va unga tegishli barcha testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setMavzuniOchirishTasdiqi(null)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={() => mavzuniButunlayOchir(mavzuniOchirishTasdiqi)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? "..." : "Ha, butunlay o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fanOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
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

      {fanMavzulariniOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>🗑 Butun fandagi mavzularni o'chirasizmi?</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{tanlanganFan}" fanidagi BARCHA mavzularning O'ZI ({mavzular.length} ta) va ularning testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-2.5">
              <button onClick={() => setFanMavzulariniOchirishTasdiqi(false)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                Bekor qilish
              </button>
              <button onClick={fanMavzulariniButunlayOchir} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? "..." : "Ha, butunlay o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {rasmGaleriyasi && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
          <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
            <button onClick={() => setRasmGaleriyasi(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>Yopish</button>
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


export function ModeratsiyaTab({ token }) {
  const [ichkiBolim, setIchkiBolim] = useState("qora"); // "qora" | "xavfli"
  const [qoraRoyxat, setQoraRoyxat] = useState(null);
  const [xavfliRoyxat, setXavfliRoyxat] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [xato, setXato] = useState("");

  useEffect(() => {
    setYuklanmoqda(true);
    Promise.all([
      fetch(`${API_BASE}/api/admin/qora_royxat?token=${encodeURIComponent(token)}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/admin/xavfli_xabarlar?token=${encodeURIComponent(token)}`).then((r) => r.json()),
    ])
      .then(([q, x]) => { setQoraRoyxat(q.royxat || []); setXavfliRoyxat(x.royxat || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Ro'yxatlarni yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token]);

  const SABAB_NOMLARI = {
    notogri_fayl_turi: "❌ Noto'g'ri fayl turi",
    virus: "🦠 Virus topildi",
    nsfw_rasm: "🔞 Nomaqbul rasm",
    sokinish: "🤬 So'kinish",
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>Moderatsiya</h1>

      <div className="flex rounded-full p-1 gap-0.5 mb-4" style={{ backgroundColor: "#F0EDE5" }}>
        <button onClick={() => setIchkiBolim("qora")} className="flex-1 py-2 rounded-full text-xs font-semibold"
          style={ichkiBolim === "qora" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
          🚫 Qora ro'yxat
        </button>
        <button onClick={() => setIchkiBolim("xavfli")} className="flex-1 py-2 rounded-full text-xs font-semibold"
          style={ichkiBolim === "xavfli" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
          ⚠️ Xavfli xabarlar
        </button>
      </div>

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{xato}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : ichkiBolim === "qora" ? (
        <div className="space-y-2">
          {qoraRoyxat.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#8A8578" }}>Hozircha bo'sh</p>}
          {qoraRoyxat.map((q) => (
            <div key={q.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{q.full_name || `ID: ${q.user_id}`}</p>
                <span className="text-[10px]" style={{ color: "#B0AA98" }}>{new Date(q.yaratilgan_at).toLocaleString("uz-UZ")}</span>
              </div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#A32D2D" }}>{SABAB_NOMLARI[q.sabab] || q.sabab}</p>
              {q.tafsilot && <p className="text-xs" style={{ color: "#5A5648", wordBreak: "break-word" }}>{q.tafsilot}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs mb-2" style={{ color: "#8A8578" }}>
            ⚠️ Bu — kalit-so'z asosidagi ro'yxat, aniq xavf degani emas. Foydalanuvchi ogohlantirilmagan, xabari oddiy yuborilgan.
          </p>
          {xavfliRoyxat.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#8A8578" }}>Hozircha bo'sh</p>}
          {xavfliRoyxat.map((x) => (
            <div key={x.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#F5C6C6" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{x.full_name || `ID: ${x.user_id}`}</p>
                <span className="text-[10px]" style={{ color: "#B0AA98" }}>{new Date(x.yaratilgan_at).toLocaleString("uz-UZ")}</span>
              </div>
              <p className="text-sm" style={{ color: "#5A5648", wordBreak: "break-word" }}>{x.xabar_matni}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function KitobMiyaBolimi({ token }) {
  const [fayl, setFayl] = useState(null);
  const [tekshiruv, setTekshiruv] = useState(null);
  const [jarayon, setJarayon] = useState("");
  const [xato, setXato] = useState("");
  const [importlar, setImportlar] = useState([]);

  const tarixniYukla = () => {
    fetch(`${API_BASE}/api/admin/ai_miya_importlar?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.detail || "Import tarixi yuklanmadi");
        setImportlar(d.importlar || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    tarixniYukla();
  }, [token]);

  const tekshir = async () => {
    if (!fayl || jarayon) return;
    setJarayon("tekshir");
    setXato("");
    setTekshiruv(null);
    try {
      const form = new FormData();
      form.append("fayl", fayl);
      const res = await fetch(
        `${API_BASE}/api/admin/ai_miya_tekshir?token=${encodeURIComponent(token)}`,
        { method: "POST", body: form },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Excel tekshirilmadi");
      setTekshiruv(d);
      tarixniYukla();
    } catch (e) {
      setXato(e.message);
    } finally {
      setJarayon("");
    }
  };

  const qoralamaImport = async () => {
    if (!tekshiruv?.batch_id || !tekshiruv?.tayyor || jarayon) return;
    setJarayon("import");
    setXato("");
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/ai_miya_import/${tekshiruv.batch_id}?token=${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Qoralama import bajarilmadi");
      setTekshiruv((old) => ({ ...old, importNatija: d, status: "draft_imported" }));
      tarixniYukla();
    } catch (e) {
      setXato(e.message);
    } finally {
      setJarayon("");
    }
  };

  const nashrQil = async (batchId = tekshiruv?.batch_id) => {
    if (!batchId || jarayon) return;
    setJarayon(`nashr-${batchId}`);
    setXato("");
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/ai_miya_nashr/${batchId}?token=${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Bilimlar nashr qilinmadi");
      if (tekshiruv?.batch_id === batchId) {
        setTekshiruv((old) => ({ ...old, status: "published", nashrNatija: d }));
      }
      tarixniYukla();
    } catch (e) {
      setXato(e.message);
    } finally {
      setJarayon("");
    }
  };

  const statusUslubi = (status) => ({
    published: { fon: "#E7F4EC", rang: "#25683B", nom: "Nashr qilingan" },
    draft_imported: { fon: "#FFF4D8", rang: "#8A5A1C", nom: "Qoralama" },
    validated: { fon: "#EAF1F7", rang: "#1B4B7A", nom: "Tekshirilgan" },
    failed: { fon: "#FCEBEB", rang: "#A32D2D", nom: "Xato" },
  }[status] || { fon: "#F2F0EA", rang: "#5A5648", nom: status || "Noma'lum" });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg,#153A55 0%,#1B4B7A 58%,#2D8B8B 100%)" }}>
        <div className="p-5">
          <p className="text-xs uppercase tracking-[0.16em] opacity-75">Yagona bilim manbasi</p>
          <h2 className="text-xl font-bold mt-1">🧠 Kitob → pedagogik AI miya</h2>
          <p className="text-sm mt-2 leading-relaxed opacity-90">
            Bir kitob — bir Excel. Avval tekshiriladi, keyin qoralama saqlanadi,
            faqat siz nashr qilgach o'quvchi, o'qituvchi va to'garakka chiqadi.
          </p>
        </div>
        <div className="grid grid-cols-3 border-t text-center text-[11px]"
          style={{ borderColor: "rgba(255,255,255,.18)", backgroundColor: "rgba(0,0,0,.08)" }}>
          {[
            ["1", "Shablon"],
            ["2", "Tekshirish"],
            ["3", "Import va nashr"],
          ].map(([n, label]) => (
            <div key={n} className="py-3 border-r last:border-r-0" style={{ borderColor: "rgba(255,255,255,.14)" }}>
              <span className="inline-flex w-5 h-5 rounded-full bg-white/15 items-center justify-center font-bold mr-1">{n}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: "#EAF1F7" }}>📥</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm" style={{ color: "#2B2B2B" }}>1. Universal shablonni oling</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8A8578" }}>
              12 varaq: kitob, DTS, bilim, tushuntirish, misol, mashq, ishora,
              xatolar, metodika, to'garak, lug'at/media va tekshiruv.
            </p>
            <a
              href={`${API_BASE}/api/admin/ai_miya_shablon?token=${encodeURIComponent(token)}`}
              className="mt-3 inline-flex px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: "#1B4B7A" }}
            >
              📊 AI miya Excel shablonini yuklab olish
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: "#2B2B2B" }}>2. To'ldirilgan kitobni tekshiring</h3>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>
          Bu bosqich jonli bilimga hech narsa yozmaydi. Topic code, manba, sahifa,
          ID va bog'lanish xatolari qatorigacha ko'rsatiladi.
        </p>
        <label className="block rounded-xl border-2 border-dashed p-4 text-center cursor-pointer"
          style={{ borderColor: fayl ? "#2D8B8B" : "#D8D3C7", backgroundColor: fayl ? "#EEF7F5" : "#FAF8F2" }}>
          <input type="file" accept=".xlsx" className="hidden"
            onChange={(e) => { setFayl(e.target.files?.[0] || null); setTekshiruv(null); setXato(""); }} />
          <p className="text-sm font-semibold" style={{ color: fayl ? "#246D6D" : "#5A5648" }}>
            {fayl ? `✓ ${fayl.name}` : "Excel faylni tanlang"}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#8A8578" }}>Faqat .xlsx · har safar bitta kitob</p>
        </label>
        <button onClick={tekshir} disabled={!fayl || !!jarayon}
          className="w-full mt-3 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#2D8B8B", opacity: !fayl || jarayon ? .5 : 1 }}>
          {jarayon === "tekshir" ? <><Loader2 size={17} className="animate-spin" /> Tekshirilmoqda…</> : "🔎 Faylni to'liq tekshirish"}
        </button>
      </div>

      {xato && (
        <div className="rounded-xl p-3.5 text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
          {xato}
        </div>
      )}

      {tekshiruv && (
        <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: tekshiruv.tayyor ? "#9BCAB6" : "#E6AAAA" }}>
          <div className="p-4 flex items-start justify-between gap-3"
            style={{ backgroundColor: tekshiruv.tayyor ? "#EAF5EF" : "#FCEBEB" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: tekshiruv.tayyor ? "#25683B" : "#A32D2D" }}>
                {tekshiruv.tayyor ? "✓ Importga tayyor" : "⚠️ Tuzatilishi kerak"}
              </p>
              <h3 className="font-bold mt-0.5">Tekshiruv paketi #{tekshiruv.batch_id}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white">
              {tekshiruv.summary?.bilim_birliklari || 0} birlik
            </span>
          </div>
          <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: "#E5E1D8" }}>
            {[
              ["Kitob", tekshiruv.summary?.kitoblar || 0],
              ["Mavzu", tekshiruv.summary?.mavzular || 0],
              ["Xato", tekshiruv.summary?.xatolar || 0],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-3 text-center">
                <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{value}</p>
                <p className="text-[10px]" style={{ color: "#8A8578" }}>{label}</p>
              </div>
            ))}
          </div>
          {(tekshiruv.errors || []).length > 0 && (
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {tekshiruv.errors.slice(0, 50).map((e, i) => (
                <div key={`${e.sheet}-${e.row}-${e.column}-${i}`} className="rounded-xl p-3 text-xs"
                  style={{ backgroundColor: "#FFF5F3", color: "#8C352B" }}>
                  <b>{e.sheet} · {e.row}-qator · {e.column || "varaq"}</b>
                  <p className="mt-0.5">{e.message}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t" style={{ borderColor: "#E5E1D8" }}>
            {tekshiruv.status === "published" ? (
              <div className="rounded-xl p-3 text-sm font-semibold text-center"
                style={{ backgroundColor: "#E7F4EC", color: "#25683B" }}>
                ✓ Kitob bilimi AI miyaga nashr qilindi
              </div>
            ) : tekshiruv.status === "draft_imported" || tekshiruv.importNatija ? (
              <button onClick={() => nashrQil()} disabled={!!jarayon}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#C89B3C", opacity: jarayon ? .5 : 1 }}>
                {jarayon.startsWith("nashr-") ? <><Loader2 size={17} className="animate-spin" /> Nashr qilinmoqda…</> : "✅ Tasdiqlash va AI miyaga nashr qilish"}
              </button>
            ) : (
              <button onClick={qoralamaImport} disabled={!tekshiruv.tayyor || !!jarayon}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: !tekshiruv.tayyor || jarayon ? .5 : 1 }}>
                {jarayon === "import" ? <><Loader2 size={17} className="animate-spin" /> Qoralama saqlanmoqda…</> : "📦 Qoralama sifatida import qilish"}
              </button>
            )}
          </div>
        </div>
      )}

      {importlar.length > 0 && (
        <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
          <h3 className="font-bold text-sm mb-3">So'nggi kitob importlari</h3>
          <div className="space-y-2">
            {importlar.slice(0, 8).map((item) => {
              const s = statusUslubi(item.status);
              return (
                <div key={item.id} className="rounded-xl border p-3 flex items-center justify-between gap-3"
                  style={{ borderColor: "#ECE8DF" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{item.file_name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>
                      #{item.id} · {item.validation_summary?.mavzular || 0} mavzu · {item.validation_summary?.bilim_birliklari || 0} birlik
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: s.fon, color: s.rang }}>{s.nom}</span>
                    {item.status === "draft_imported" && (
                      <button onClick={() => nashrQil(item.id)} disabled={!!jarayon}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "#FFF4D8", color: "#8A5A1C" }}>
                        Nashr
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4 text-xs leading-relaxed"
        style={{ backgroundColor: "#F1EEE5", color: "#5A5648" }}>
        <b>Muhim:</b> PDF kitobni avtomatik to'ldirish keyingi alohida yordamchi jarayon.
        Hozir kitobni shu shablonga siz yoki men bo'lib yozamiz. Sayt esa to'ldirilgan
        shablonni xatosiz tekshiradi, versiyalaydi, import qiladi va barcha AI rejimlariga ulaydi.
      </div>
    </div>
  );
}


const QIYINLIK_DARAJALARI = [
  ["oson", "🟢 Oson"], ["o'rta", "🟡 O'rta"], ["qiyin", "🔴 Qiyin"], ["murakkab", "⚫ Murakkab"],
];

export function TestShablonBolimi({ token, oldindanTanlangan, mode }) {
  const [tanlanganKodlar, setTanlanganKodlar] = useState(oldindanTanlangan || []); // [topic_code, ...]
  const [maqsad, setMaqsad] = useState("oddiy"); // "oddiy" | "minimal_bilim"
  const [guruhlar, setGuruhlar] = useState(
    QIYINLIK_DARAJALARI.map(([diff]) => ({ diff, turi: "single_choice", soni: 0 }))
  );
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natija, setNatija] = useState(null);
  const [diagnostika, setDiagnostika] = useState(null);
  const [diagnostikaYuklanmoqda, setDiagnostikaYuklanmoqda] = useState(false);
  const [diagnostikaXato, setDiagnostikaXato] = useState("");
  const [importSinflar, setImportSinflar] = useState([]);
  const [importSinf, setImportSinf] = useState("");
  const [importFanlar, setImportFanlar] = useState([]);
  const [importFan, setImportFan] = useState("");
  const [importTanlovYuklanmoqda, setImportTanlovYuklanmoqda] = useState(false);

  const diagnostikaniKor = async () => {
    setDiagnostikaYuklanmoqda(true); setDiagnostikaXato(""); setDiagnostika(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/rasm_diagnostika?token=${encodeURIComponent(token)}`);
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error((d && d.detail) || `Server xatosi (${res.status})`);
      if (!d) throw new Error("Serverdan javob kelmadi");
      setDiagnostika(d);
    } catch (e) {
      setDiagnostikaXato(e.message || "Noma'lum xato — internetni tekshiring");
    } finally { setDiagnostikaYuklanmoqda(false); }
  };

  // Bosqichma-bosqich tanlash: sinf_turi -> sinf -> fan -> mavzular
  const [ichkiBosqich, setIchkiBosqich] = useState("sinf_turi");
  const [sinflarRoyxati, setSinflarRoyxati] = useState({ oddiy: [], togarak: [] });
  const [tanlanganSinfTuri, setTanlanganSinfTuri] = useState(null); // "oddiy" | "togarak"
  const [tanlanganSinfIchki, setTanlanganSinfIchki] = useState(null);
  const [ichkiFanlar, setIchkiFanlar] = useState([]);
  const [tanlanganFanIchki, setTanlanganFanIchki] = useState(null);
  const [ichkiMavzular, setIchkiMavzular] = useState([]);
  const [ichkiYuklanmoqda, setIchkiYuklanmoqda] = useState(false);
  const [kopFanRejimi, setKopFanRejimi] = useState(false);
  const [tanlanganFanlarKop, setTanlanganFanlarKop] = useState([]); // [fan_nomi, ...]
  const [kopFanYuklanmoqda, setKopFanYuklanmoqda] = useState(false);

  const kopFanBelgilaAlmashtir = (fanNomi) => {
    setTanlanganFanlarKop((prev) => prev.includes(fanNomi) ? prev.filter((f) => f !== fanNomi) : [...prev, fanNomi]);
  };

  const kopFanTanlashniYakunla = async () => {
    if (tanlanganFanlarKop.length === 0) return;
    setKopFanYuklanmoqda(true); setXato("");
    try {
      const barchaKodlar = [];
      for (const fan of tanlanganFanlarKop) {
        const res = await fetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinfIchki)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`);
        const d = await res.json();
        for (const m of (d.mavzular || [])) {
          barchaKodlar.push(...(m.topic_codes && m.topic_codes.length > 0 ? m.topic_codes : [m.topic_code]));
        }
      }
      setTanlanganKodlar(Array.from(new Set(barchaKodlar)));
      setKopFanRejimi(false);
      setTanlanganFanlarKop([]);
      setIchkiBosqich("sinf_turi"); // mavzu tanlash yopiladi, "2) qiyinlik darajasi" ko'rinadi
    } catch {
      setXato("Mavzularni yuklab bo'lmadi");
    } finally {
      setKopFanYuklanmoqda(false);
    }
  };

  useEffect(() => {
    if (mode !== "shablon") return;
    fetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setSinflarRoyxati(d))
      .catch(() => setXato("Sinflarni yuklab bo'lmadi"));
  }, [mode, token]);

  useEffect(() => {
    if (mode !== "import") return;
    fetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setImportSinflar(Array.from(new Set([...(d.oddiy || []), ...(d.togarak || [])]))))
      .catch(() => setXato("Import uchun sinflarni yuklab bo'lmadi"));
  }, [mode, token]);

  const importSinfTanlandi = (sinf) => {
    setImportSinf(sinf);
    setImportFan("");
    setImportFanlar([]);
    if (!sinf) return;
    setImportTanlovYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setImportFanlar(d.fanlar || []); setImportFan("__all__"); })
      .catch(() => setXato("Import uchun fanlarni yuklab bo'lmadi"))
      .finally(() => setImportTanlovYuklanmoqda(false));
  };

  const sinfTuriTanlandi = (turi) => {
    setTanlanganSinfTuri(turi);
    setIchkiBosqich("sinf");
  };

  const ichkiSinfTanlandi = (sinf) => {
    setTanlanganSinfIchki(sinf);
    setIchkiBosqich("fan");
    setIchkiYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setIchkiFanlar(d.fanlar || []); setIchkiYuklanmoqda(false); })
      .catch(() => { setXato("Fanlarni yuklab bo'lmadi"); setIchkiYuklanmoqda(false); });
  };

  const ichkiFanTanlandi = (fan) => {
    setTanlanganFanIchki(fan);
    setIchkiBosqich("mavzular");
    setIchkiYuklanmoqda(true);
    fetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinfIchki)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setIchkiMavzular(d.mavzular || []); setIchkiYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setIchkiYuklanmoqda(false); });
  };

  const hammasiniTanlash = () => {
    const barchaKodlar = ichkiMavzular.flatMap((m) => m.topic_codes || m.barcha_kodlar || [m.topic_code]);
    setTanlanganKodlar((prev) => Array.from(new Set([...prev, ...barchaKodlar])));
  };

  const maqsadOzgar = (yangiMaqsad) => {
    setMaqsad(yangiMaqsad);
    if (yangiMaqsad === "minimal_bilim") {
      // Sinfni bitirish/keyingi sinfga o'tish uchun talab qilinadigan
      // ENG KAM bilim — har mavzudan 3 ta OSON, tugmali savol yetarli.
      setGuruhlar(QIYINLIK_DARAJALARI.map(([diff]) => ({ diff, turi: "single_choice", soni: diff === "oson" ? 3 : 0 })));
    } else {
      setGuruhlar(QIYINLIK_DARAJALARI.map(([diff]) => ({ diff, turi: "single_choice", soni: 0 })));
    }
  };

  useEffect(() => {
    if (mode === "shablon" && oldindanTanlangan && oldindanTanlangan.length > 0) {
      setTanlanganKodlar((prev) => Array.from(new Set([...prev, ...oldindanTanlangan])));
    }
  }, [mode, oldindanTanlangan]);

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
        body: JSON.stringify({ topic_codes: tanlanganKodlar, guruhlar, maqsad }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Xato");
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = maqsad === "minimal_bilim" ? "minimal_bilim_shablon.xlsx" : "test_shablon.xlsx";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) {
      setXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    if (!importSinf || !importFan) {
      setXato("Avval Excel qaysi sinf va fanga tegishli ekanini tanlang");
      e.target.value = "";
      return;
    }
    setImportlanmoqda(true); setXato(""); setNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const importQs = new URLSearchParams({
        token,
        kutilgan_sinf: importSinf,
        kutilgan_fan: importFan,
      });
      const res = await fetch(`${API_BASE}/api/admin/shablon_import?${importQs.toString()}`, {
        method: "POST", body: formData,
      });
      const rawJavob = await res.text();
      let data = {};
      try {
        data = rawJavob ? JSON.parse(rawJavob) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        const detail = typeof data.detail === "string"
          ? data.detail
          : (data.detail?.message || `Server import xatosi (${res.status})`);
        throw new Error(detail);
      }
      setNatija(data);
    } catch (e) {
      setXato(
        e instanceof TypeError && e.message === "Failed to fetch"
          ? "Backend import vaqtida javob uzildi. Railway backend logini tekshirib, yangi tuzatishni deploy qiling."
          : e.message
      );
    } finally {
      setImportlanmoqda(false);
      e.target.value = "";
    }
  };

  const importQilinganVaraqlar = Array.isArray(natija?.import_qilingan_varaqlar)
    ? natija.import_qilingan_varaqlar
    : (Array.isArray(natija?.oqilgan_varaqlar) ? natija.oqilgan_varaqlar : []);
  const varaqDiagnostikasi = Array.isArray(natija?.varaq_diagnostika)
    ? natija.varaq_diagnostika
    : (Array.isArray(natija?.varaq_natijalari) ? natija.varaq_natijalari : []);
  const importQilinganVaraqSoni = natija?.import_qilingan_varaq_soni
    ?? natija?.oqilgan_varaqlar_soni
    ?? importQilinganVaraqlar.length;
  const korilganSavollarSoni = natija?.korilgan_savollar_soni
    ?? varaqDiagnostikasi.reduce((jami, varaq) => jami + Number(varaq.savolli_qator || 0), 0);

  return (
    <>
      {mode === "import" && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <button onClick={diagnostikaniKor} disabled={diagnostikaYuklanmoqda}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border"
          style={{ borderColor: "#B7D3E8", color: "#1B4B7A", backgroundColor: "#EAF1F7" }}>
          {diagnostikaYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : "🔍 Bazani tekshirish (rasm diagnostikasi)"}
        </button>
        {diagnostikaXato && (
          <p className="mt-2 text-sm font-semibold rounded-lg px-3 py-2" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
            ❌ {diagnostikaXato}
          </p>
        )}
        {diagnostika && (
          <div className="mt-3 text-sm space-y-1" style={{ color: "#2B2B2B" }}>
            <p>Jami testlar: <b>{diagnostika.jami_testlar}</b></p>
            <p>Rasm ma'lumoti saqlangan: <b>{diagnostika.rasm_malumotli_soni}</b></p>
            <p>image_url to'ldirilgan: <b>{diagnostika.image_urlli_soni}</b></p>
            <p className="font-semibold mt-2">So'nggi 15 ta yozuv:</p>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#E5E1D8" }}>
              {diagnostika.songgi_15_yozuv.map((y) => (
                <div key={y.id} className="px-2.5 py-2 text-xs border-b" style={{ borderColor: "#F0EDE5" }}>
                  <p>#{y.id} · {y.topic_code} · {y.rasm_bormi ? "🖼️ rasm BOR" : "⬜ rasm yo'q"}</p>
                  <p style={{ color: "#8A8578", wordBreak: "break-all" }}>image_url: {y.image_url || "(bo'sh)"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      )}

      {mode === "shablon" && (
        <>
          <div className="rounded-2xl p-3 bg-white border mb-3" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex rounded-full p-1 gap-0.5" style={{ backgroundColor: "#F0EDE5" }}>
          <button type="button" onClick={() => maqsadOzgar("oddiy")} className="flex-1 py-1.5 rounded-full text-xs font-semibold"
            style={maqsad === "oddiy" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
            Oddiy
          </button>
          <button type="button" onClick={() => maqsadOzgar("minimal_bilim")} className="flex-1 py-1.5 rounded-full text-xs font-semibold"
            style={maqsad === "minimal_bilim" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>
            Minimal bilim tekshirish
          </button>
        </div>
        {maqsad === "minimal_bilim" && (
          <p className="text-[11px] mt-2" style={{ color: "#8A8578" }}>
            Sinfni bitirish / keyingi sinfga o'tish uchun talab qilinadigan ENG KAM bilimni tekshiradi — har mavzudan avtomatik 3 ta oson, tugmali savol belgilandi (pastda o'zgartirishingiz ham mumkin).
          </p>
        )}
          </div>

          <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-3 block" style={{ color: "#5A5648" }}>
          1) Mavzu(lar)ni tanlang ({tanlanganKodlar.length} ta tanlandi)
        </label>

        {ichkiBosqich === "sinf_turi" && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => sinfTuriTanlandi("oddiy")}
              className="py-3 rounded-xl border text-sm font-semibold" style={{ borderColor: "#E5E1D8", color: "#2B2B2B" }}>
              🏫 1–11-sinf
            </button>
            <button onClick={() => sinfTuriTanlandi("togarak")}
              className="py-3 rounded-xl border text-sm font-semibold" style={{ borderColor: "#E5E1D8", color: "#2B2B2B" }}>
              🎯 Boshqa sinflar
            </button>
          </div>
        )}

        {ichkiBosqich === "sinf" && (
          <>
            <button onClick={() => setIchkiBosqich("sinf_turi")} className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: "#8A8578" }}>
              <ChevronLeft size={14} /> Ortga
            </button>
            <div className="grid grid-cols-6 gap-1.5">
              {(tanlanganSinfTuri === "oddiy" ? sinflarRoyxati.oddiy : sinflarRoyxati.togarak).map((s) => (
                <button key={s} onClick={() => ichkiSinfTanlandi(s)}
                  className="py-2.5 rounded-lg border text-sm font-semibold text-center"
                  style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {ichkiBosqich === "fan" && (
          <>
            <button onClick={() => { setIchkiBosqich("sinf"); setKopFanRejimi(false); setTanlanganFanlarKop([]); }} className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: "#8A8578" }}>
              <ChevronLeft size={14} /> Ortga ({tanlanganSinfIchki}-sinf)
            </button>
            {!kopFanRejimi && (
              <button onClick={() => setKopFanRejimi(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold mb-2.5 border" style={{ borderColor: "#B7D3E8", color: "#1B4B7A" }}>
                📚 Bir nechta fanni birdaniga tanlash
              </button>
            )}
            {kopFanRejimi && (
              <div className="rounded-xl px-3 py-2 mb-2.5 flex items-center justify-between" style={{ backgroundColor: "#EAF1F7" }}>
                <span className="text-xs font-medium" style={{ color: "#1B4B7A" }}>
                  {tanlanganFanlarKop.length > 0 ? `${tanlanganFanlarKop.length} ta fan tanlandi` : "Fanlarni belgilang"}
                </span>
                <button onClick={() => { setKopFanRejimi(false); setTanlanganFanlarKop([]); }} className="text-xs font-semibold" style={{ color: "#8A8578" }}>Bekor qilish</button>
              </div>
            )}
            {ichkiYuklanmoqda ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : (() => {
              const IQ_KALIT_SOZLAR = ["mantiq", "logika", "iq", "aql-zakovat", "fikrlash"];
              const iqMi = (nom) => IQ_KALIT_SOZLAR.some((k) => nom.toLowerCase().includes(k));
              const oddiyFanlar = ichkiFanlar.filter((f) => !iqMi(f.nom));
              const iqFanlar = ichkiFanlar.filter((f) => iqMi(f.nom));
              const FanTugmasi = (f) => kopFanRejimi ? (
                <button key={f.nom} onClick={() => kopFanBelgilaAlmashtir(f.nom)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border"
                  style={{ backgroundColor: tanlanganFanlarKop.includes(f.nom) ? "#EAF1F7" : "#F7F5F0", borderColor: tanlanganFanlarKop.includes(f.nom) ? "#1B4B7A" : "transparent" }}>
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: "#2B2B2B" }}>
                    <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: tanlanganFanlarKop.includes(f.nom) ? "#1B4B7A" : "#fff", border: "1px solid #C4BFAF" }}>
                      {tanlanganFanlarKop.includes(f.nom) && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </span>
                    {f.nom}
                  </span>
                  <span className="text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni} ta mavzu</span>
                </button>
              ) : (
                <button key={f.nom} onClick={() => ichkiFanTanlandi(f.nom)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#F7F5F0" }}>
                  <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni} ta mavzu <ChevronRight size={14} /></span>
                </button>
              );
              return (
                <div className="space-y-1.5">
                  {oddiyFanlar.map(FanTugmasi)}
                  {iqFanlar.length > 0 && (
                    <>
                      <p className="text-xs font-semibold mt-4 mb-1.5 flex items-center gap-1" style={{ color: "#8A5A1C" }}>
                        🧠 IQ / Mantiqiy fikrlash — alohida (yoshga oid, oddiy fan emas)
                      </p>
                      {iqFanlar.map(FanTugmasi)}
                    </>
                  )}
                  {ichkiFanlar.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#8A8578" }}>Bu sinfda mavzu yo'q</p>}
                </div>
              );
            })()}
            {kopFanRejimi && (
              <button onClick={kopFanTanlashniYakunla} disabled={tanlanganFanlarKop.length === 0 || kopFanYuklanmoqda}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-3 flex items-center justify-center gap-2"
                style={{ backgroundColor: tanlanganFanlarKop.length === 0 ? "#B0AA98" : "#1B4B7A" }}>
                {kopFanYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : `✓ Tanlangan fanlarni qo'shish (${tanlanganFanlarKop.length})`}
              </button>
            )}
          </>
        )}

        {ichkiBosqich === "mavzular" && (
          <>
            <button onClick={() => setIchkiBosqich("fan")} className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: "#8A8578" }}>
              <ChevronLeft size={14} /> Ortga ({tanlanganFanIchki})
            </button>
            {ichkiYuklanmoqda ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : (
              <>
                <button onClick={hammasiniTanlash}
                  className="w-full py-2 rounded-lg text-xs font-semibold mb-2" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
                  ✓ Barchasini tanlash ({ichkiMavzular.length} ta mavzu)
                </button>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {ichkiMavzular.map((m) => {
                    const kodlar = m.topic_codes || m.barcha_kodlar || [m.topic_code];
                    return (
                      <label key={m.topic_code} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer" style={{ backgroundColor: "#F7F5F0" }}>
                        <input type="checkbox" checked={kodlar.every((k) => tanlanganKodlar.includes(k))}
                          onChange={() => kodniAlmashtir(kodlar)} />
                        <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}>{m.nomi}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
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
        </>
      )}

      {mode === "import" && (
        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <div className="mb-3">
            <h2 className="text-base font-bold" style={{ color: "#2B2B2B" }}>Testlarni import qilish</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8A8578" }}>
              Avval sinf va fanni tanlang. Bitta fan tanlansa, ko‘p fanli Excel ichidan faqat TESTLAR_&lt;tanlangan fan&gt; varag‘i olinadi. "Barcha fanlar" rejimida har bir TESTLAR_... varag‘i o‘z faniga va MALUMOTdagi mavzusiga qat’iy tekshiriladi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>1) Sinf</label>
              <select value={importSinf} onChange={(e) => importSinfTanlandi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                <option value="">Sinfni tanlang</option>
                {importSinflar.map((s) => <option key={s} value={s}>{s}{/^\d+$/.test(String(s)) ? "-sinf" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>2) Fan</label>
              <select value={importFan} onChange={(e) => setImportFan(e.target.value)} disabled={!importSinf || importTanlovYuklanmoqda}
                className="w-full px-3 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: "#E5E1D8", opacity: !importSinf || importTanlovYuklanmoqda ? 0.55 : 1 }}>
                <option value="">{importTanlovYuklanmoqda ? "Yuklanmoqda..." : "Fanni tanlang"}</option>
                <option value="__all__">Barcha fanlar — avtomatik tekshirish</option>
                {importFanlar.map((f) => <option key={f.nom} value={f.nom}>{f.nom}</option>)}
              </select>
            </div>
          </div>

          {importSinf && importFan && (
            <p className="text-xs font-semibold rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
              ✓ {importSinf}{/^\d+$/.test(String(importSinf)) ? "-sinf" : ""} · {importFan === "__all__"
                ? "shu sinfning eski testlari tozalanib, barcha fanlar Exceldan noldan yoziladi"
                : `${importFan}ning eski testlari tozalanib, Exceldan noldan yoziladi`}
            </p>
          )}

          <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
            style={{ borderColor: importSinf && importFan ? "#C4BFAF" : "#E5E1D8", color: importSinf && importFan ? "#5A5648" : "#B0AA98" }}>
            {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : "3) 📤 To'ldirilgan Excel faylni tanlash"}
            <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda || !importSinf || !importFan} className="hidden" />
          </label>

          {xato && (
            <p className="text-sm mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
              ❌ {xato}
            </p>
          )}
          {natija && (
            <div className="mt-4 text-sm space-y-3" style={{ color: "#2B2B2B" }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EAF1F7" }}>
                  <p className="text-[10px]" style={{ color: "#5A7894" }}>Import qilingan varaq</p>
                  <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{importQilinganVaraqSoni}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EEF7F5" }}>
                  <p className="text-[10px]" style={{ color: "#4F7E75" }}>Ko'rilgan savol</p>
                  <p className="text-lg font-bold" style={{ color: "#246D6D" }}>{korilganSavollarSoni}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EDF7EC" }}>
                  <p className="text-[10px]" style={{ color: "#56734E" }}>Bazaga saqlandi</p>
                  <p className="text-lg font-bold" style={{ color: "#3D6E35" }}>{natija.saved ?? 0}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#FDF3E0" }}>
                  <p className="text-[10px]" style={{ color: "#8A6A35" }}>Duplikat</p>
                  <p className="text-lg font-bold" style={{ color: "#8A5A1C" }}>{natija.duplicates ?? 0}</p>
                </div>
              </div>

              {((natija.tuzatilgan_topic_code_soni ?? 0) > 0
                || (natija.almashtirishda_ochirilgan_eski_test_soni ?? 0) > 0
                || (natija.boshqa_fandan_togri_fanga_kochirilgan_test_soni ?? 0) > 0
                || (natija.ortiqcha_begona_nusxalar_tozalandi ?? 0) > 0
                || (natija.dts_fan_yozuvlari_tuzatildi ?? 0) > 0) && (
                <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                  <p className="font-semibold">✓ Fan va mavzu joylashuvi tuzatildi</p>
                  <p className="text-xs mt-1">
                    Eski test tozalandi: <b>{natija.almashtirishda_ochirilgan_eski_test_soni ?? 0}</b> ·
                    Fan yorlig‘i tiklandi: <b>{natija.dts_fan_yozuvlari_tuzatildi ?? 0}</b> ·
                    Mavzu kodi tuzatildi: <b>{natija.tuzatilgan_topic_code_soni ?? 0}</b> ·
                    Boshqa fandan ko‘chirildi: <b>{natija.boshqa_fandan_togri_fanga_kochirilgan_test_soni ?? 0}</b> ·
                    Ortiqcha begona nusxa tozalandi: <b>{natija.ortiqcha_begona_nusxalar_tozalandi ?? 0}</b>
                  </p>
                </div>
              )}

              <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F7F5F0" }}>
                <p className="font-semibold">O'qilgan test varaqlari ({importQilinganVaraqSoni} ta)</p>
                {importQilinganVaraqlar.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {importQilinganVaraqlar.map((varaqNomi) => (
                      <span key={varaqNomi} className="rounded-full px-2 py-1 text-xs font-semibold"
                        style={{ backgroundColor: "#fff", color: "#1B4B7A", border: "1px solid #B7D3E8" }}>
                        {varaqNomi}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Mos test varag'i topilmadi.</p>
                )}
                <p className="text-xs mt-2" style={{ color: "#8A8578" }}>
                  Fayldagi turli topic_code: <b>{natija.fayldagi_topic_code_soni ?? 0}</b> · Xatolar: <b>{natija.errors ?? 0}</b>
                </p>
              </div>

              {varaqDiagnostikasi.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">Har bir varaq natijasi</p>
                  <div className="space-y-2">
                    {varaqDiagnostikasi.map((varaq, index) => {
                      const importQilindi = varaq.holat === "import_qilindi";
                      return (
                        <div key={`${varaq.varaq || "varaq"}-${index}`} className="rounded-xl border px-3 py-2.5"
                          style={{ borderColor: importQilindi ? "#A8D2C8" : "#E8B8AE", backgroundColor: importQilindi ? "#F5FBF9" : "#FFF7F5" }}>
                          <div className="flex items-center justify-between gap-2">
                            <b className="break-all">{varaq.varaq || `Varaq ${index + 1}`}</b>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ backgroundColor: importQilindi ? "#DDEFEA" : "#FCEBEB", color: importQilindi ? "#246D6D" : "#A32D2D" }}>
                              {importQilindi ? "IMPORT QILINDI" : "O'TKAZIB YUBORILDI"}
                            </span>
                          </div>
                          {importQilindi ? (
                            <div className="text-xs mt-1" style={{ color: "#5A5648" }}>
                              {varaq.aniqlangan_fan && (
                                <p className="font-semibold" style={{ color: "#1B4B7A" }}>
                                  Avto fan: {varaq.aniqlangan_fan_kodi ? `${varaq.aniqlangan_fan_kodi} · ` : ""}{varaq.aniqlangan_fan}
                                </p>
                              )}
                              <p>
                                Savol: <b>{varaq.savolli_qator ?? 0}</b> · Saqlandi: <b>{varaq.saved ?? 0}</b> · Duplikat: <b>{varaq.duplicates ?? 0}</b> · Xato: <b>{varaq.errors ?? 0}</b>
                                {Number(varaq.kod_yoq || 0) > 0 ? <> · Kodsiz: <b>{varaq.kod_yoq}</b></> : null}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs mt-1" style={{ color: "#A32D2D" }}>
                              Yetishmagan ustunlar: {varaq.yetishmagan_ustunlar?.length > 0 ? varaq.yetishmagan_ustunlar.join(", ") : "format mos emas"}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {natija.kod_yoq > 0 && (
                <p className="rounded-lg px-2.5 py-2" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                  🚫 <b>{natija.kod_yoq}</b> ta savol o'tkazib yuborildi — ularning topic_code ustuni bo'sh edi. Topik mavzularini to'g'rilab, yangi shablon orqali qayta yuklang.
                </p>
              )}
              {natija.yetim_kodlar_soni > 0 && (
                <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}>
                  <p>⚠️ <b>{natija.yetim_kodlar_soni}</b> xil topic_code "Mavzular"da topilmadi — bu testlar o'quvchiga ko'rinmaydi.</p>
                  {natija.yetim_kodlar_namuna?.length > 0 && (
                    <p className="text-xs mt-1 font-mono" style={{ wordBreak: "break-all" }}>Namuna: {natija.yetim_kodlar_namuna.join(", ")}</p>
                  )}
                </div>
              )}
              {natija.rasm_biriktirildi > 0 && <p>🖼️ Rasm biriktirildi: <b>{natija.rasm_biriktirildi}</b></p>}
              {natija.rasm_diagnostika && (
                <div className="rounded-lg px-2.5 py-2 text-xs" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                  <p className="font-semibold mb-1">🔍 Rasm diagnostikasi (shu import uchun):</p>
                  <p>Qabul qilingan fayl hajmi: <b>{(Number(natija.rasm_diagnostika.qabul_qilingan_fayl_hajmi_bayt || 0) / 1024 / 1024).toFixed(2)} MB</b></p>
                  <p>openpyxl versiyasi: <b>{natija.rasm_diagnostika.openpyxl_versiyasi}</b></p>
                  <p>Excel ichida topilgan rasm: <b>{natija.rasm_diagnostika.excel_ichida_topilgan_rasm_soni ?? 0}</b></p>
                  <p>Qatorga bog'langan rasm: <b>{natija.rasm_diagnostika.qatorga_bogliy_qilingan_rasm_soni ?? 0}</b></p>
                  {natija.rasm_diagnostika.xatolar?.length > 0 && (
                    <>
                      <p className="mt-1 font-semibold">Xatolar:</p>
                      {natija.rasm_diagnostika.xatolar.map((rasmXatosi, index) => (
                        <p key={index} className="font-mono" style={{ wordBreak: "break-all" }}>{rasmXatosi}</p>
                      ))}
                    </>
                  )}
                  {natija.rasm_diagnostika.ogohlantirishlar?.length > 0 && (
                    <>
                      <p className="mt-1 font-semibold">Ogohlantirishlar:</p>
                      {natija.rasm_diagnostika.ogohlantirishlar.map((ogohlantirish, index) => (
                        <p key={index} style={{ wordBreak: "break-word" }}>{ogohlantirish}</p>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function TopikShablonBolimi({ token }) {
  const [sinf, setSinf] = useState("");
  const [fan, setFan] = useState("");
  const [mavzular, setMavzular] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [toliqYaratilmoqda, setToliqYaratilmoqda] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [natija, setNatija] = useState(null);
  const [toliqNatija, setToliqNatija] = useState(null);

  const toliqYarat = async () => {
    if (!sinf.trim() || !fan.trim() || !mavzular.trim()) {
      setXato("Sinf, fan va mavzularni to'ldiring"); return;
    }
    setToliqYaratilmoqda(true); setXato(""); setToliqNatija(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/topik_toliq_yarat?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sinf: sinf.trim(), fan: fan.trim(), mavzular }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.detail || "Xato");
      setToliqNatija(d);
    } catch (e) {
      setXato(e.message);
    } finally { setToliqYaratilmoqda(false); }
  };

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
          placeholder={["mantiq", "logika", "iq", "aql-zakovat", "fikrlash"].some((k) => fan.toLowerCase().includes(k)) ? "masalan: 10-11 yosh" : "masalan: 1"}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-1"
          style={{ borderColor: "#E5E1D8" }} />
        {["mantiq", "logika", "iq", "aql-zakovat", "fikrlash"].some((k) => fan.toLowerCase().includes(k)) && (
          <p className="text-[11px] mb-2" style={{ color: "#8A5A1C" }}>
            🧠 IQ/Mantiqiy fikrlash — bu yerga aniq sinf o'rniga <b>yosh guruhini</b> yozing (masalan "10-11 yosh"), oddiy fanlar bilan aralashib qolmasligi uchun.
          </p>
        )}
        <div className="mb-3" />

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

        <button onClick={toliqYarat} disabled={toliqYaratilmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mb-2.5"
          style={{ backgroundColor: "#3B6D11", opacity: toliqYaratilmoqda ? 0.7 : 1 }}>
          {toliqYaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : "⚡ To'g'ridan-to'g'ri yaratish"}
        </button>
        <p className="text-[11px] mb-3 text-center" style={{ color: "#8A8578" }}>
          Excel yuklab-to'ldirib-qaytarmasdan — shu zahoti bazaga qo'shadi (Bob/Bo'lim bo'sh qoladi, xohlasangiz keyin to'ldirasiz)
        </p>
        {toliqNatija && (
          <div className="rounded-xl p-3 mb-3 text-sm" style={{ backgroundColor: "#EAF3DE", color: "#2B2B2B" }}>
            <p>✅ Yaratildi: <b>{toliqNatija.yaratildi}</b></p>
            <p>♻️ Allaqachon mavjud edi: <b>{toliqNatija.mavjud}</b></p>
            {toliqNatija.xato > 0 && (
              <>
                <p style={{ color: "#A32D2D" }}>❌ Xato: <b>{toliqNatija.xato}</b></p>
                {toliqNatija.xato_namunalari.map((x, i) => (
                  <p key={i} className="text-xs mt-1" style={{ color: "#A32D2D" }}>{x}</p>
                ))}
              </>
            )}
          </div>
        )}

        <div className="rounded-xl p-2.5 mb-2" style={{ backgroundColor: "#F7F5F0" }}>
          <p className="text-[11px]" style={{ color: "#5A5648" }}>
            Bu — bo'sh, 7 ustunli (Sinf/Fan/Chorak/Bob/Bo'lim/Mavzu/Kichik mavzu) shablon; bazaga hech narsa yozmaydi. Bob/Bo'lim/Kichik mavzuni to'ldirib, pastdagi "Import" orqali qayta yuklang — o'sha yerda kod avtomatik hisoblanadi.
          </p>
        </div>
        <button onClick={shablonYukla} disabled={yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border"
          style={{ backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : "📥 Bo'sh shablon yuklab olish (Bob/Bo'lim to'ldirish uchun)"}
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
            {natija.updated > 0 && <p>🔄 Yangilandi: <b>{natija.updated}</b></p>}
            <p>⏭ O'tkazildi: <b>{natija.skipped}</b></p>
            {natija.xato_namunalari && natija.xato_namunalari.length > 0 && (
              <div className="mt-2 rounded-lg p-2.5 space-y-1" style={{ backgroundColor: "#FCEBEB" }}>
                <p className="font-semibold" style={{ color: "#A32D2D" }}>Xato tafsilotlari:</p>
                {natija.xato_namunalari.map((x, i) => (
                  <p key={i} className="text-xs" style={{ color: "#A32D2D" }}>{x}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function TushuntirishBolimi({ token }) {
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


