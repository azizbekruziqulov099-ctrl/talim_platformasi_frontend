import TranslatedContent from './interface/TranslatedContent.jsx';
import {uiText as __kbUi, interfaceLocaleTag as __kbLocaleTag} from './interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from './interface/InterfacePreferences.jsx';
import {semesterPairLabel,semesterPair,templateTopicCodes} from './curriculum/catalog.js';
import {gradeLabel, institutionLabel, lessonLabel} from './curriculum/catalog.js';
import { useCurriculum } from "./curriculum/CurriculumScope.jsx";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, Loader2 } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://talimplatformasi-production.up.railway.app";

function fanRangiOl(name) {
  const colors=['#C89B3C','#2D8B8B','#8B5FBF','#B0553A','#4A7C9E','#7C9E4A','#A8527A'];
  let hash=0;for(const char of String(name||''))hash=char.charCodeAt(0)+((hash<<5)-hash);
  return colors[Math.abs(hash)%colors.length];
}
function haqiqiyRasmKodimi(value) {
  const text=String(value||'').trim();
  return text.startsWith('/api/')||/^https?:\/\//i.test(text)||/^\d+(-\d+){5,9}$/.test(text);
}
function SavolRasmi({rasmId}) {
  useKbInterfaceLocale();
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[rasmId]);
  if(failed)return <p className="text-xs text-amber-800">{__kbUi("Rasm yuklanmadi.")}</p>;
  const src=String(rasmId).startsWith('/api/')?`${API_BASE}${rasmId}`:/^https?:\/\//i.test(String(rasmId))?rasmId:`${API_BASE}/api/rasm/${encodeURIComponent(rasmId)}`;
  return <img src={src} alt={__kbUi("Savol rasmi")} className="max-h-64 w-full rounded-xl object-contain" onError={()=>setFailed(true)}/>;
}

export function TopikMavzularTab({ token, onTestYarat }) {
  useKbInterfaceLocale();
  const { fetch: scopedFetch, scope } = useCurriculum();
  const [holat, setHolat] = useState("sinf"); // sinf | fan | mavzular
  const [sinflar, setSinflar] = useState({ oddiy: [], talaba: [], togarak: [] });
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
  const [faqatToliq, setFaqatToliq] = useState(false); // true: faqat Bob+Bo'lim to'ldirilgan mavzularni ko'rsatadi
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
      const res = await scopedFetch(`${API_BASE}/api/admin/mavzu_bob_bolim_tahrirla?${params}`, { method: "PUT" });
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
    scopedFetch(`${API_BASE}/api/admin/mavzu_kod_moslik?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`)
      .then((r) => r.json())
      .then((d) => { setKodMoslik(d); setKodMoslikYuklanmoqda(false); })
      .catch(() => { setXato("Kod moslikni tekshirib bo'lmadi"); setKodMoslikYuklanmoqda(false); });
  };

  const umumiyKorinishniOch = () => {
    setUmumiyKorinish({ sinflar: [] });
    setUmumiyYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_umumiy_korinish?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setUmumiyKorinish(d); setUmumiyYuklanmoqda(false); })
      .catch(() => { setXato("Umumiy ko'rinishni yuklab bo'lmadi"); setUmumiyYuklanmoqda(false); });
  };

  useEffect(() => {
    scopedFetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setSinflar({ oddiy: d.oddiy || [], talaba: d.talaba || [], togarak: d.togarak || [] }); setYuklanmoqda(false); })
      .catch(() => { setXato("Sinflarni yuklab bo'lmadi"); setYuklanmoqda(false); });
  }, [token]);

  const sinfTanlandi = (sinf) => {
    setTanlanganSinf(sinf);
    setHolat("fan");
    setYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setFanlar(d.fanlar || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Fanlarni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const mavzularniQaytaYukla = () => {
    setYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const fanTanlandi = (fan) => {
    setTanlanganFan(fan);
    setHolat("mavzular");
    setSahifa(0);
    setYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`)
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
    scopedFetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(sinf)}&fan=${encodeURIComponent(fan)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setMavzular(d.mavzular || []); setYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setYuklanmoqda(false); });
  };

  const mavzuTestlariniOchir = async (mavzu) => {
    setOchirilmoqda(true);
    try {
      await scopedFetch(`${API_BASE}/api/admin/mavzu_testlarini_ochir?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`, {
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
      await scopedFetch(`${API_BASE}/api/admin/mavzu_ochir?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`, {
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
      const res = await scopedFetch(`${API_BASE}/api/admin/bosh_kodli_mavzularni_tozalash?token=${encodeURIComponent(token)}`, { method: "DELETE" });
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
      await scopedFetch(`${API_BASE}/api/admin/fan_testlarini_ochir?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`, {
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
      await scopedFetch(`${API_BASE}/api/admin/fan_mavzularini_butunlay_ochir?token=${encodeURIComponent(token)}&sinf=${encodeURIComponent(tanlanganSinf)}&fan=${encodeURIComponent(tanlanganFan)}`, {
        method: "DELETE",
      });
      setFanMavzulariniOchirishTasdiqi(false);
      setHolat("fan");
      setYuklanmoqda(true);
      scopedFetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(tanlanganSinf)}&token=${encodeURIComponent(token)}`)
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
      const res = await scopedFetch(`${API_BASE}/api/admin/mavzu_rasmlari?token=${encodeURIComponent(token)}&topic_codes=${encodeURIComponent(mavzu.topic_codes.join(","))}`);
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
          <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>{__kbUi("Topik mavzular")}</h1>
          <button onClick={umumiyKorinishniOch}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>{__kbUi("📊 Umumiy ko'rinish")}</button>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A8578" }}>{__kbUi("Kontent auditi — qaysi mavzuda test bor, qaysisida yo'q.")}</p>
        <button onClick={boshKodliMavzularniTozala} disabled={ochirilmoqda}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold mb-4 border"
          style={{ borderColor: "#F5C6C6", color: "#A32D2D", opacity: ochirilmoqda ? 0.6 : 1 }}>
          {ochirilmoqda ? <Loader2 size={14} className="animate-spin" /> : __kbUi("🧹 Bo'sh kodli (buzuq) mavzularni tozalash")}
        </button>
        {boshKodTozalashXabari && <p className="text-xs mb-4" style={{ color: "#3B6D11" }}>{boshKodTozalashXabari}</p>}
        {xato && <p className="text-sm mb-4" style={{ color: "#B0553A" }}>{__kbUi(xato)}</p>}
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold">{scope.institution_type==='maktab'?__kbUi('Sinfni tanlang'):scope.institution_type==='universitet'?__kbUi('Kurs'):__kbUi('Guruhni tanlang')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[...sinflar.oddiy,...(sinflar.talaba||[]),...sinflar.togarak].map(s=><button key={s} type="button" onClick={()=>sinfTanlandi(s)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold">{__kbUi(gradeLabel(scope.institution_type,s))}</button>)}
            </div>
            {![...sinflar.oddiy,...(sinflar.talaba||[]),...sinflar.togarak].length&&<p className="py-4 text-sm text-slate-500">{__kbUi("Bu bo‘limda hali mavzu yo‘q. “Mavzu yaratish”dan yangi mavzu qo‘shing.")}</p>}

          </>
        )}

        {umumiyKorinish && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
            <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
              <button onClick={() => setUmumiyKorinish(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{__kbUi("Yopish")}</button>
              <h1 className="text-xl font-bold mb-1" style={{ color: "#2B2B2B" }}>{__kbUi("📊 Umumiy ko'rinish")}</h1>
              <p className="text-xs mb-5" style={{ color: "#8A8578" }}>{__kbUi("Barcha sinf va fanlar — bir ekranda, alohida kirmasdan.")}</p>
              {umumiyYuklanmoqda ? (
                <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
              ) : umumiyKorinish.sinflar.length === 0 ? (
                <p className="text-sm" style={{ color: "#8A8578" }}>{__kbUi("Hozircha ma'lumot yo'q.")}</p>
              ) : (
                <div className="space-y-5">
                  {umumiyKorinish.sinflar.map((s) => (
                    <div key={s.sinf}>
                      <p className="text-sm font-bold mb-2.5" style={{ color: "#2B2B2B" }}>
                        {/^\d+$/.test(s.sinf) ? __kbUi(`${s.sinf}-sinf`) : s.sinf}
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
                                <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}{f.dars_turi ? __kbUi(` — ${f.dars_turi}`) : __kbUi("")}</span>
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
        <button onClick={() => setHolat("sinf")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{__kbUi("Sinflar")}</button>
        <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>{tanlanganSinf}{/^\d+$/.test(tanlanganSinf) ? __kbUi("-sinf") : __kbUi("")}{__kbUi(" fanlari")}</h1>
        {yuklanmoqda ? (
          <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
        ) : fanlar.length === 0 ? (
          <p className="text-sm" style={{ color: "#8A8578" }}>{__kbUi("Bu sinfda hali fan mavjud emas.")}</p>
        ) : (
          <div className="space-y-2">
            {fanlar.map((f) => (
              <button key={f.nom} onClick={() => fanTanlandi(f.nom)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-white border text-left"
                style={{ borderColor: "#E5E1D8" }}>
                <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}{f.dars_turi ? __kbUi(` — ${f.dars_turi}`) : __kbUi("")}</span>
                <span className="text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni}{__kbUi(" yozuv →")}</span>
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
      <button onClick={() => setHolat("fan")} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{__kbUi("Fanlar")}</button>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h1 className="text-xl font-bold" style={{ color: "#2B2B2B" }}>{tanlanganFan}</h1>
        {testliSoni > 0 && (
          <button onClick={() => setFanOchirishTasdiqi(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{__kbUi("🗑 Fandagi barcha testlarni o'chirish")}</button>
        )}
      </div>
      {mavzular.length > 0 && (
        <button onClick={() => setFanMavzulariniOchirishTasdiqi(true)}
          className="text-xs font-semibold mb-1" style={{ color: "#A32D2D" }}>{__kbUi("🗑 Fandagi barcha mavzularni butunlay o'chirish (")}{mavzular.length}{__kbUi(" ta)")}</button>
      )}
      <button onClick={kodMoslikniTekshir} disabled={kodMoslikYuklanmoqda}
        className="text-xs font-semibold mb-1 block" style={{ color: "#1B4B7A" }}>
        {kodMoslikYuklanmoqda ? __kbUi("Tekshirilmoqda...") : __kbUi("🔍 \"Test yo'q\" sababini tekshirish (kod moslik)")}
      </button>
      {kodMoslik && (
        <div className="rounded-xl p-3 mb-3 text-xs" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
          <p className="font-semibold mb-1.5">{__kbUi("Prefiks: ")}<span className="font-mono">{kodMoslik.prefiks}</span></p>
          {kodMoslik.yetim_testlar.length === 0 ? (
            <p>{__kbUi("✅ Barcha mavjud testlar mavzular bilan to'g'ri moslashgan — \"yetim\" test topilmadi.")}</p>
          ) : (
            <>
              <p className="font-semibold" style={{ color: "#A32D2D" }}>⚠️ {kodMoslik.yetim_testlar.length}{__kbUi(" xil kodda \"yetim\" testlar bor (Mavzular ro'yxatida topilmadi):")}</p>
              {kodMoslik.yetim_testlar.map((y) => (
                <p key={y.topic_code} className="font-mono mt-0.5" style={{ wordBreak: "break-all" }}>{y.topic_code} — {y.test_soni}{__kbUi(" ta test")}</p>
              ))}
            </>
          )}
          <p className="mt-2 font-semibold">{__kbUi("Mavzular ro'yxatidagi kodlar va ularning test soni:")}</p>
          {kodMoslik.mavzular.map((m) => (
            <p key={m.topic_code} className="font-mono mt-0.5" style={{ wordBreak: "break-all", color: m.test_soni > 0 ? "#1B4B7A" : "#8A8578" }}>
              {m.topic_code} — {m.mavzu_nomi} ({m.test_soni}{__kbUi(" ta test)")}</p>
          ))}
        </div>
      )}
      <p className="text-xs mb-2" style={{ color: "#8A8578" }}>
        {korinadiganManba.length}{__kbUi(" ta mavzu · ")}{testliSoni}{__kbUi(" tasida test bor")}{chalaSoni > 0 ? __kbUi(` · ${chalaSoni} tasi chala (Bob/Bo'lim bo'sh)`) : __kbUi("")}
      </p>
      {chalaSoni > 0 && (
        <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
          <input type="checkbox" checked={faqatToliq} onChange={(e) => { setFaqatToliq(e.target.checked); setSahifa(0); }} />
          <span className="text-xs" style={{ color: "#5A5648" }}>{__kbUi("Faqat to'liq to'ldirilganlarni ko'rsatish (chala ")}{chalaSoni}{__kbUi(" tasini yashirish)")}</span>
        </label>
      )}
      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{__kbUi(xato)}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : (
        <>
          <div className="space-y-2.5 mb-3">
            {korinadigan.map((m) => (
              <div key={m.topic_code} className="rounded-xl p-4 bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium flex-1" style={{ color: "#2B2B2B" }}><TranslatedContent text={m.nomi} showStatus={false}/>{m.semestr > 0 && <small className="block text-xs opacity-70">{m.semestr}{__kbUi("-semestr")}</small>}</p>
                  {m.test_bormi ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>{__kbUi("✅ Test bor")}</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{__kbUi("❌ Test yo'q")}</span>
                  )}
                </div>
                <p className="text-xs mb-1" style={{ color: "#8A8578" }}>
                  {m.semestr ? __kbUi(`${m.semestr}-semestr`) : m.chorak ? __kbUi(`${m.chorak}-chorak`) : __kbUi("")}{m.bob ? __kbUi(` · ${m.bob}`) : __kbUi("")}{m.bolim ? __kbUi(` · ${m.bolim}`) : __kbUi("")} · {m.kichik_soni}{__kbUi(" kichik mavzu")}</p>
                <p className="text-[11px] mb-2 font-mono" style={{ color: "#B0AA98" }}>
                  {m.barcha_kodlar && m.barcha_kodlar.length > 1 ? __kbUi(m.barcha_kodlar.join(", ")) : m.topic_code}
                </p>
                {!m.bob && !m.bolim && (
                  bobBolimTahrirlanayotgan === m.topic_code ? (
                    <div className="mb-2.5 p-2.5 rounded-lg space-y-1.5" style={{ backgroundColor: "#F7F5F0" }}>
                      <input value={bobBolimQiymat.bob} onChange={(e) => setBobBolimQiymat((q) => ({ ...q, bob: e.target.value }))}
                        placeholder={__kbUi("Bob (masalan: 1-bob. Sonlar)")} className="w-full px-2.5 py-1.5 rounded-lg text-xs border" style={{ borderColor: "#E5E1D8" }} />
                      <input value={bobBolimQiymat.bolim} onChange={(e) => setBobBolimQiymat((q) => ({ ...q, bolim: e.target.value }))}
                        placeholder={__kbUi("Bo'lim (masalan: 1-bo'lim. Narsalar)")} className="w-full px-2.5 py-1.5 rounded-lg text-xs border" style={{ borderColor: "#E5E1D8" }} />
                      <div className="flex gap-2">
                        <button onClick={() => bobBolimniSaqla(m)} disabled={bobBolimSaqlanmoqda}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>
                          {bobBolimSaqlanmoqda ? __kbUi("Saqlanmoqda...") : __kbUi("Saqlash")}
                        </button>
                        <button onClick={() => setBobBolimTahrirlanayotgan(null)} disabled={bobBolimSaqlanmoqda}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EFEBE1", color: "#5A5648" }}>{__kbUi("Bekor qilish")}</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setBobBolimTahrirlanayotgan(m.topic_code); setBobBolimQiymat({ bob: "", bolim: "" }); }}
                      className="text-xs font-semibold mb-2.5" style={{ color: "#1B4B7A" }}>{__kbUi("✏️ Bob/Bo'limni to'ldirish")}</button>
                  )
                )}
                <div className="flex gap-2 flex-wrap">
                  {!m.test_bormi ? (
                    <button onClick={() => onTestYarat(m.topic_code, scope.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>{__kbUi("🧪 Test shablon yaratish")}</button>
                  ) : (
                    <>
                      <button onClick={() => rasmlarniKor(m)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#F7F5F0", color: "#1B4B7A" }}>{__kbUi("🖼 Rasmlarni ko'rish")}</button>
                      <button onClick={() => setMavzuOchirishTasdiqi(m)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{__kbUi("🗑 Testlarni o'chirish")}</button>
                    </>
                  )}
                  <button onClick={() => setMavzuniOchirishTasdiqi(m)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ borderColor: "#F5C6C6", color: "#A32D2D" }}>{__kbUi("🗑 Mavzuni butunlay o'chirish")}</button>
                </div>
              </div>
            ))}
          </div>
          {jamiSahifa > 1 && (
            <div className="flex items-center justify-between">
              <button onClick={() => setSahifa((s) => Math.max(0, s - 1))} disabled={sahifa === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa === 0 ? "#C4BFAF" : "#5A5648" }}>{__kbUi("← Oldingi")}</button>
              <span className="text-xs" style={{ color: "#8A8578" }}>{sahifa + 1} / {jamiSahifa}</span>
              <button onClick={() => setSahifa((s) => Math.min(jamiSahifa - 1, s + 1))} disabled={sahifa >= jamiSahifa - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8", color: sahifa >= jamiSahifa - 1 ? "#C4BFAF" : "#5A5648" }}>{__kbUi("Keyingi →")}</button>
            </div>
          )}
        </>
      )}

      {mavzuOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>{__kbUi("🗑 Testlarni o'chirasizmi?")}</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{mavzuOchirishTasdiqi.nomi}{__kbUi("\" mavzusining BARCHA testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.")}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setMavzuOchirishTasdiqi(null)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>{__kbUi("Bekor qilish")}</button>
              <button onClick={() => mavzuTestlariniOchir(mavzuOchirishTasdiqi)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? __kbUi("...") : __kbUi("Ha, o'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {mavzuniOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>{__kbUi("🗑 Mavzuni butunlay o'chirasizmi?")}</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{mavzuniOchirishTasdiqi.nomi}{__kbUi("\" mavzusining O'ZI (nomi, kodi) va unga tegishli barcha testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.")}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setMavzuniOchirishTasdiqi(null)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>{__kbUi("Bekor qilish")}</button>
              <button onClick={() => mavzuniButunlayOchir(mavzuniOchirishTasdiqi)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? __kbUi("...") : __kbUi("Ha, butunlay o'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {fanOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>{__kbUi("🗑 Butun fanni o'chirasizmi?")}</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{tanlanganFan}{__kbUi("\" fanidagi BARCHA mavzularning BARCHA testlari butunlay o'chiriladi (")}{testliSoni}{__kbUi(" ta mavzu). Bu amalni ortga qaytarib bo'lmaydi.")}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setFanOchirishTasdiqi(false)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>{__kbUi("Bekor qilish")}</button>
              <button onClick={fanTestlariniOchir} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? __kbUi("...") : __kbUi("Ha, hammasini o'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {fanMavzulariniOchirishTasdiqi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 32px rgba(43,43,43,0.18)" }}>
            <p className="font-semibold mb-2" style={{ color: "#2B2B2B" }}>{__kbUi("🗑 Butun fandagi mavzularni o'chirasizmi?")}</p>
            <p className="text-sm mb-5" style={{ color: "#5A5648" }}>
              "{tanlanganFan}{__kbUi("\" fanidagi BARCHA mavzularning O'ZI (")}{mavzular.length}{__kbUi(" ta) va ularning testlari butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.")}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setFanMavzulariniOchirishTasdiqi(false)} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>{__kbUi("Bekor qilish")}</button>
              <button onClick={fanMavzulariniButunlayOchir} disabled={ochirilmoqda}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#A32D2D", opacity: ochirilmoqda ? 0.7 : 1 }}>
                {ochirilmoqda ? __kbUi("...") : __kbUi("Ha, butunlay o'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {rasmGaleriyasi && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#F7F5F0" }}>
          <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
            <button onClick={() => setRasmGaleriyasi(null)} className="flex items-center gap-2 mb-4 -ml-1" style={{ color: "#5A5648" }}><span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7" }}><ChevronLeft size={15} style={{ color: "#1B4B7A" }} strokeWidth={2.5} /></span>{__kbUi("Yopish")}</button>
            <h1 className="text-lg font-bold mb-1" style={{ color: "#2B2B2B" }}>🖼 {rasmGaleriyasi.sarlavha}</h1>
            <p className="text-xs mb-5" style={{ color: "#8A8578" }}>
              {rasmlarYuklanmoqda ? __kbUi("Yuklanmoqda...") : __kbUi(`${rasmGaleriyasi.rasmlar.length} ta rasm havolasi topildi`)}
            </p>
            {rasmlarYuklanmoqda ? (
              <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : rasmGaleriyasi.rasmlar.length === 0 ? (
              <div className="rounded-2xl p-6 text-center bg-white border" style={{ borderColor: "#E5E1D8" }}>
                <p className="text-sm" style={{ color: "#8A8578" }}>{__kbUi("Bu mavzuning savollarida rasm havolasi yo'q.")}</p>
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
                        <span className="text-xs font-medium text-center px-2" style={{ color: "#8A8578" }}>{__kbUi("LaTeX ifoda (rasm emas)")}</span>
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
  useKbInterfaceLocale();
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
      <h1 className="text-xl font-bold mb-4" style={{ color: "#2B2B2B" }}>{__kbUi("Moderatsiya")}</h1>

      <div className="flex rounded-full p-1 gap-0.5 mb-4" style={{ backgroundColor: "#F0EDE5" }}>
        <button onClick={() => setIchkiBolim("qora")} className="flex-1 py-2 rounded-full text-xs font-semibold"
          style={ichkiBolim === "qora" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>{__kbUi("🚫 Qora ro'yxat")}</button>
        <button onClick={() => setIchkiBolim("xavfli")} className="flex-1 py-2 rounded-full text-xs font-semibold"
          style={ichkiBolim === "xavfli" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>{__kbUi("⚠️ Xavfli xabarlar")}</button>
      </div>

      {xato && <p className="text-sm mb-3" style={{ color: "#B0553A" }}>{__kbUi(xato)}</p>}
      {yuklanmoqda ? (
        <div className="py-10 text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
      ) : ichkiBolim === "qora" ? (
        <div className="space-y-2">
          {qoraRoyxat.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#8A8578" }}>{__kbUi("Hozircha bo'sh")}</p>}
          {qoraRoyxat.map((q) => (
            <div key={q.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{q.full_name || __kbUi(`ID: ${q.user_id}`)}</p>
                <span className="text-[10px]" style={{ color: "#B0AA98" }}>{__kbUi(new Date(q.yaratilgan_at).toLocaleString(__kbLocaleTag()))}</span>
              </div>
              <p className="text-xs font-semibold mb-1" style={{ color: "#A32D2D" }}>{SABAB_NOMLARI[q.sabab] || q.sabab}</p>
              {q.tafsilot && <p className="text-xs" style={{ color: "#5A5648", wordBreak: "break-word" }}>{q.tafsilot}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs mb-2" style={{ color: "#8A8578" }}>{__kbUi("⚠️ Bu — kalit-so'z asosidagi ro'yxat, aniq xavf degani emas. Foydalanuvchi ogohlantirilmagan, xabari oddiy yuborilgan.")}</p>
          {xavfliRoyxat.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#8A8578" }}>{__kbUi("Hozircha bo'sh")}</p>}
          {xavfliRoyxat.map((x) => (
            <div key={x.id} className="rounded-xl p-3.5 bg-white border" style={{ borderColor: "#F5C6C6" }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>{x.full_name || __kbUi(`ID: ${x.user_id}`)}</p>
                <span className="text-[10px]" style={{ color: "#B0AA98" }}>{__kbUi(new Date(x.yaratilgan_at).toLocaleString(__kbLocaleTag()))}</span>
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
  useKbInterfaceLocale();
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
          <p className="text-xs uppercase tracking-[0.16em] opacity-75">{__kbUi("Yagona bilim manbasi")}</p>
          <h2 className="text-xl font-bold mt-1">{__kbUi("🧠 Kitob → pedagogik AI miya")}</h2>
          <p className="text-sm mt-2 leading-relaxed opacity-90">{__kbUi("Bir kitob — bir Excel. Avval tekshiriladi, keyin qoralama saqlanadi, faqat siz nashr qilgach o'quvchi, o'qituvchi va to'garakka chiqadi.")}</p>
        </div>
        <div className="grid grid-cols-3 border-t text-center text-[11px]"
          style={{ borderColor: "rgba(255,255,255,.18)", backgroundColor: "rgba(0,0,0,.08)" }}>
          {[
            ["1", "Shablon"],
            ["2", "Tekshirish"],
            ["3", "Import va nashr"],
          ].map(([n, label]) => (
            <div key={n} className="py-3 border-r last:border-r-0" style={{ borderColor: "rgba(255,255,255,.14)" }}>
              <span className="inline-flex w-5 h-5 rounded-full bg-white/15 items-center justify-center font-bold mr-1">{__kbUi(n)}</span>
              {__kbUi(label)}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: "#EAF1F7" }}>📥</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm" style={{ color: "#2B2B2B" }}>{__kbUi("1. Universal shablonni oling")}</h3>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8A8578" }}>{__kbUi("12 varaq: kitob, DTS, bilim, tushuntirish, misol, mashq, ishora, xatolar, metodika, to'garak, lug'at/media va tekshiruv.")}</p>
            <a
              href={`${API_BASE}/api/admin/ai_miya_shablon?token=${encodeURIComponent(token)}`}
              className="mt-3 inline-flex px-4 py-2.5 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: "#1B4B7A" }}
            >{__kbUi("📊 AI miya Excel shablonini yuklab olish")}</a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: "#2B2B2B" }}>{__kbUi("2. To'ldirilgan kitobni tekshiring")}</h3>
        <p className="text-xs mb-3" style={{ color: "#8A8578" }}>{__kbUi("Bu bosqich jonli bilimga hech narsa yozmaydi. Topic code, manba, sahifa, ID va bog'lanish xatolari qatorigacha ko'rsatiladi.")}</p>
        <label className="block rounded-xl border-2 border-dashed p-4 text-center cursor-pointer"
          style={{ borderColor: fayl ? "#2D8B8B" : "#D8D3C7", backgroundColor: fayl ? "#EEF7F5" : "#FAF8F2" }}>
          <input type="file" accept=".xlsx" className="hidden"
            onChange={(e) => { setFayl(e.target.files?.[0] || null); setTekshiruv(null); setXato(""); }} />
          <p className="text-sm font-semibold" style={{ color: fayl ? "#246D6D" : "#5A5648" }}>
            {fayl ? __kbUi(`✓ ${fayl.name}`) : __kbUi("Excel faylni tanlang")}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#8A8578" }}>{__kbUi("Faqat .xlsx · har safar bitta kitob")}</p>
        </label>
        <button onClick={tekshir} disabled={!fayl || !!jarayon}
          className="w-full mt-3 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#2D8B8B", opacity: !fayl || jarayon ? .5 : 1 }}>
          {jarayon === "tekshir" ? <><Loader2 size={17} className="animate-spin" />{__kbUi(" Tekshirilmoqda…")}</> : __kbUi("🔎 Faylni to'liq tekshirish")}
        </button>
      </div>

      {xato && (
        <div className="rounded-xl p-3.5 text-sm" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
          {__kbUi(xato)}
        </div>
      )}

      {tekshiruv && (
        <div className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: tekshiruv.tayyor ? "#9BCAB6" : "#E6AAAA" }}>
          <div className="p-4 flex items-start justify-between gap-3"
            style={{ backgroundColor: tekshiruv.tayyor ? "#EAF5EF" : "#FCEBEB" }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: tekshiruv.tayyor ? "#25683B" : "#A32D2D" }}>
                {tekshiruv.tayyor ? __kbUi("✓ Importga tayyor") : __kbUi("⚠️ Tuzatilishi kerak")}
              </p>
              <h3 className="font-bold mt-0.5">{__kbUi("Tekshiruv paketi #")}{tekshiruv.batch_id}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white">
              {tekshiruv.summary?.bilim_birliklari || 0}{__kbUi(" birlik")}</span>
          </div>
          <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: "#E5E1D8" }}>
            {[
              ["Kitob", tekshiruv.summary?.kitoblar || 0],
              ["Mavzu", tekshiruv.summary?.mavzular || 0],
              ["Xato", tekshiruv.summary?.xatolar || 0],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-3 text-center">
                <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{value}</p>
                <p className="text-[10px]" style={{ color: "#8A8578" }}>{__kbUi(label)}</p>
              </div>
            ))}
          </div>
          {(tekshiruv.errors || []).length > 0 && (
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {tekshiruv.errors.slice(0, 50).map((e, i) => (
                <div key={`${e.sheet}-${e.row}-${e.column}-${i}`} className="rounded-xl p-3 text-xs"
                  style={{ backgroundColor: "#FFF5F3", color: "#8C352B" }}>
                  <b>{e.sheet} · {e.row}{__kbUi("-qator · ")}{e.column || __kbUi("varaq")}</b>
                  <p className="mt-0.5">{e.message}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t" style={{ borderColor: "#E5E1D8" }}>
            {tekshiruv.status === "published" ? (
              <div className="rounded-xl p-3 text-sm font-semibold text-center"
                style={{ backgroundColor: "#E7F4EC", color: "#25683B" }}>{__kbUi("✓ Kitob bilimi AI miyaga nashr qilindi")}</div>
            ) : tekshiruv.status === "draft_imported" || tekshiruv.importNatija ? (
              <button onClick={() => nashrQil()} disabled={!!jarayon}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#C89B3C", opacity: jarayon ? .5 : 1 }}>
                {jarayon.startsWith("nashr-") ? <><Loader2 size={17} className="animate-spin" />{__kbUi(" Nashr qilinmoqda…")}</> : __kbUi("✅ Tasdiqlash va AI miyaga nashr qilish")}
              </button>
            ) : (
              <button onClick={qoralamaImport} disabled={!tekshiruv.tayyor || !!jarayon}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1B4B7A", opacity: !tekshiruv.tayyor || jarayon ? .5 : 1 }}>
                {jarayon === "import" ? <><Loader2 size={17} className="animate-spin" />{__kbUi(" Qoralama saqlanmoqda…")}</> : __kbUi("📦 Qoralama sifatida import qilish")}
              </button>
            )}
          </div>
        </div>
      )}

      {importlar.length > 0 && (
        <div className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
          <h3 className="font-bold text-sm mb-3">{__kbUi("So'nggi kitob importlari")}</h3>
          <div className="space-y-2">
            {importlar.slice(0, 8).map((item) => {
              const s = statusUslubi(item.status);
              return (
                <div key={item.id} className="rounded-xl border p-3 flex items-center justify-between gap-3"
                  style={{ borderColor: "#ECE8DF" }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{item.file_name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>
                      #{item.id} · {item.validation_summary?.mavzular || 0}{__kbUi(" mavzu · ")}{item.validation_summary?.bilim_birliklari || 0}{__kbUi(" birlik")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: s.fon, color: s.rang }}>{s.nom}</span>
                    {item.status === "draft_imported" && (
                      <button onClick={() => nashrQil(item.id)} disabled={!!jarayon}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: "#FFF4D8", color: "#8A5A1C" }}>{__kbUi("Nashr")}</button>
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
        <b>{__kbUi("Muhim:")}</b>{__kbUi(" PDF kitobni avtomatik to'ldirish keyingi alohida yordamchi jarayon. Hozir kitobni shu shablonga siz yoki men bo'lib yozamiz. Sayt esa to'ldirilgan shablonni xatosiz tekshiradi, versiyalaydi, import qiladi va barcha AI rejimlariga ulaydi.")}</div>
    </div>
  );
}


const QIYINLIK_DARAJALARI = [
  ["oson", "🟢 Oson"], ["o'rta", "🟡 O'rta"], ["qiyin", "🔴 Qiyin"], ["murakkab", "⚫ Murakkab"],
];
// Har savolga beriladigan vaqt (soniya): "avto" — qiyinlikka qarab; yoki admin o'zi yozadi
const AVTO_VAQT = { oson: 60, "o'rta": 80, qiyin: 100, murakkab: 120 };
const VAQT_VARIANTLARI = [60, 80, 100, 120];

export function TestShablonBolimi({ token, oldindanTanlangan, mode }) {
  useKbInterfaceLocale();
  const { fetch: scopedFetch, scope } = useCurriculum();
  const [tanlanganKodlar, setTanlanganKodlar] = useState(() => String(oldindanTanlangan?.scopeId)===String(scope.id) ? oldindanTanlangan.codes || [] : []); // [topic_code, ...]
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
      const res = await scopedFetch(`${API_BASE}/api/admin/rasm_diagnostika?token=${encodeURIComponent(token)}`);
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error((d && d.detail) || `Server xatosi (${res.status})`);
      if (!d) throw new Error("Serverdan javob kelmadi");
      setDiagnostika(d);
    } catch (e) {
      setDiagnostikaXato(e.message || "Noma'lum xato — internetni tekshiring");
    } finally { setDiagnostikaYuklanmoqda(false); }
  };

  // Bosqichma-bosqich tanlash: sinf_turi -> sinf -> fan -> mavzular
  const [ichkiBosqich, setIchkiBosqich] = useState("sinf");
  const [sinflarRoyxati, setSinflarRoyxati] = useState({ oddiy: [], talaba: [], togarak: [] });
  const [tanlanganSinfTuri, setTanlanganSinfTuri] = useState(null); // "oddiy" | "togarak"
  const [tanlanganSinfIchki, setTanlanganSinfIchki] = useState(null);
  const [ichkiFanlar, setIchkiFanlar] = useState([]);
  const [tanlanganFanIchki, setTanlanganFanIchki] = useState(null);
  const [ichkiMavzular, setIchkiMavzular] = useState([]);
  const [ichkiYuklanmoqda, setIchkiYuklanmoqda] = useState(false);
  const [kopFanRejimi, setKopFanRejimi] = useState(false);
  const [tanlanganFanlarKop, setTanlanganFanlarKop] = useState([]); // [fan_nomi, ...]
  const [kopFanYuklanmoqda, setKopFanYuklanmoqda] = useState(false);

  const kopFanBelgilaAlmashtir = (fanNomi, darsTuri = "") => {
    const kalit = `${fanNomi}|||${darsTuri}`;
    setTanlanganFanlarKop((prev) => prev.includes(kalit) ? prev.filter((f) => f !== kalit) : [...prev, kalit]);
  };

  const kopFanTanlashniYakunla = async () => {
    if (tanlanganFanlarKop.length === 0) return;
    setKopFanYuklanmoqda(true); setXato("");
    try {
      const barchaKodlar = [];
      for (const fanKalit of tanlanganFanlarKop) {
        const [fan, darsTuri] = fanKalit.split("|||");
        const res = await scopedFetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinfIchki)}&fan=${encodeURIComponent(fan)}&dars_turi=${encodeURIComponent(darsTuri || "")}&token=${encodeURIComponent(token)}`);
        const d = await res.json();
        for (const m of (d.mavzular || [])) {
          barchaKodlar.push(...templateTopicCodes(m));
        }
      }
      setTanlanganKodlar(Array.from(new Set(barchaKodlar)));
      setKopFanRejimi(false);
      setTanlanganFanlarKop([]);
      setIchkiBosqich("sinf"); // mavzu tanlash yopiladi, "2) qiyinlik darajasi" ko'rinadi
    } catch {
      setXato("Mavzularni yuklab bo'lmadi");
    } finally {
      setKopFanYuklanmoqda(false);
    }
  };

  useEffect(() => {
    if (mode !== "shablon") return;
    scopedFetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setSinflarRoyxati({ oddiy: d.oddiy || [], talaba: d.talaba || [], togarak: d.togarak || [] }))
      .catch(() => setXato("Sinflarni yuklab bo'lmadi"));
  }, [mode, token]);

  useEffect(() => {
    if (mode !== "import") return;
    scopedFetch(`${API_BASE}/api/admin/topik_sinflar?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setImportSinflar(Array.from(new Set([...(d.oddiy || []), ...(d.talaba || []), ...(d.togarak || [])]))))
      .catch(() => setXato("Import uchun sinflarni yuklab bo'lmadi"));
  }, [mode, token]);

  const importSinfTanlandi = (sinf) => {
    setImportSinf(sinf);
    setImportFan("");
    setImportFanlar([]);
    if (!sinf) return;
    setImportTanlovYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
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
    scopedFetch(`${API_BASE}/api/admin/topik_fanlar?sinf=${encodeURIComponent(sinf)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setIchkiFanlar(d.fanlar || []); setIchkiYuklanmoqda(false); })
      .catch(() => { setXato("Fanlarni yuklab bo'lmadi"); setIchkiYuklanmoqda(false); });
  };

  useEffect(() => {
    if (!scope.grade) return;
    if (mode === "shablon") ichkiSinfTanlandi(scope.grade);
    if (mode === "import") importSinfTanlandi(scope.grade);
  }, [mode, scope.id]);

  const ichkiFanTanlandi = (fan, darsTuri = "") => {
    setTanlanganFanIchki(fan);
    setIchkiBosqich("mavzular");
    setIchkiYuklanmoqda(true);
    scopedFetch(`${API_BASE}/api/admin/topik_royxat?sinf=${encodeURIComponent(tanlanganSinfIchki)}&fan=${encodeURIComponent(fan)}&dars_turi=${encodeURIComponent(darsTuri)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { setIchkiMavzular(d.mavzular || []); setIchkiYuklanmoqda(false); })
      .catch(() => { setXato("Mavzularni yuklab bo'lmadi"); setIchkiYuklanmoqda(false); });
  };

  const hammasiniTanlash = () => {
    const barchaKodlar = ichkiMavzular.flatMap((m) => templateTopicCodes(m));
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
    if (mode === "shablon" && String(oldindanTanlangan?.scopeId)===String(scope.id) && oldindanTanlangan?.codes?.length) {
      setTanlanganKodlar((prev) => Array.from(new Set([...prev, ...oldindanTanlangan.codes])));
    }
  }, [mode, oldindanTanlangan, scope.id]);

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
      const res = await scopedFetch(`${API_BASE}/api/admin/shablon_yukla?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_codes: tanlanganKodlar, guruhlar: guruhlar.map((g) => ({ ...g, vaqt: g.vaqt ?? null })), maqsad }),
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
      const res = await scopedFetch(`${API_BASE}/api/admin/shablon_import?${importQs.toString()}`, {
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
      <p className="mb-3 rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-950">{__kbUi(institutionLabel(scope.institution_type))}{scope.dars_turi?__kbUi(` → ${lessonLabel(scope.dars_turi)}`):__kbUi('')} · {mode==='import'?__kbUi('Test importi'):__kbUi('Test tuzish')}</p>
      {mode === "import" && (
        <div className="rounded-2xl p-4 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <button onClick={diagnostikaniKor} disabled={diagnostikaYuklanmoqda}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border"
          style={{ borderColor: "#B7D3E8", color: "#1B4B7A", backgroundColor: "#EAF1F7" }}>
          {diagnostikaYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("🔍 Bazani tekshirish (rasm diagnostikasi)")}
        </button>
        {diagnostikaXato && (
          <p className="mt-2 text-sm font-semibold rounded-lg px-3 py-2" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
            ❌ {__kbUi(diagnostikaXato)}
          </p>
        )}
        {diagnostika && (
          <div className="mt-3 text-sm space-y-1" style={{ color: "#2B2B2B" }}>
            <p>{__kbUi("Jami testlar: ")}<b>{diagnostika.jami_testlar}</b></p>
            <p>{__kbUi("Rasm ma'lumoti saqlangan: ")}<b>{diagnostika.rasm_malumotli_soni}</b></p>
            <p>{__kbUi("image_url to'ldirilgan: ")}<b>{diagnostika.image_urlli_soni}</b></p>
            <p className="font-semibold mt-2">{__kbUi("So'nggi 15 ta yozuv:")}</p>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#E5E1D8" }}>
              {diagnostika.songgi_15_yozuv.map((y) => (
                <div key={y.id} className="px-2.5 py-2 text-xs border-b" style={{ borderColor: "#F0EDE5" }}>
                  <p>#{y.id} · {y.topic_code} · {y.rasm_bormi ? __kbUi("🖼️ rasm BOR") : __kbUi("⬜ rasm yo'q")}</p>
                  <p style={{ color: "#8A8578", wordBreak: "break-all" }}>{__kbUi("image_url: ")}{y.image_url || __kbUi("(bo'sh)")}</p>
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
            style={maqsad === "oddiy" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>{__kbUi("Oddiy")}</button>
          <button type="button" onClick={() => maqsadOzgar("minimal_bilim")} className="flex-1 py-1.5 rounded-full text-xs font-semibold"
            style={maqsad === "minimal_bilim" ? { backgroundColor: "#fff", color: "#1B4B7A", boxShadow: "0 1px 3px rgba(43,43,43,0.12)" } : { backgroundColor: "transparent", color: "#8A8578" }}>{__kbUi("Minimal bilim tekshirish")}</button>
        </div>
        {maqsad === "minimal_bilim" && (
          <p className="text-[11px] mt-2" style={{ color: "#8A8578" }}>{__kbUi("Sinfni bitirish / keyingi sinfga o'tish uchun talab qilinadigan ENG KAM bilimni tekshiradi — har mavzudan avtomatik 3 ta oson, tugmali savol belgilandi (pastda o'zgartirishingiz ham mumkin).")}</p>
        )}
          </div>

          <div className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-3 block" style={{ color: "#5A5648" }}>{__kbUi("1) Mavzu(lar)ni tanlang (")}{tanlanganKodlar.length}{__kbUi(" ta tanlandi)")}</label>

        {ichkiBosqich === "sinf" && (
          <>
            <p className="mb-2 text-xs text-slate-600">{scope.institution_type==='maktab'?__kbUi('Sinfni'):scope.institution_type==='universitet'?__kbUi('Kursni'):__kbUi('Guruhni')}{__kbUi(" tanlang")}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[...sinflarRoyxati.oddiy,...sinflarRoyxati.talaba,...sinflarRoyxati.togarak].map(s=><button type="button" key={s} onClick={()=>ichkiSinfTanlandi(s)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold">{__kbUi(gradeLabel(scope.institution_type,s))}</button>)}
            </div>
            {![...sinflarRoyxati.oddiy,...sinflarRoyxati.talaba,...sinflarRoyxati.togarak].length&&<p className="py-4 text-sm text-slate-500">{__kbUi("Tanlangan bo‘limda mavzu yo‘q. Avval shu muassasa va mashg‘ulot turida mavzu yarating.")}</p>}
          </>
        )}

        {ichkiBosqich === "fan" && (
          <>
            <button onClick={() => { setIchkiBosqich("sinf"); setKopFanRejimi(false); setTanlanganFanlarKop([]); }} className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: "#8A8578" }}>
              <ChevronLeft size={14} />{__kbUi(" Ortga (")}{/kurs/i.test(String(tanlanganSinfIchki)) ? tanlanganSinfIchki : __kbUi(`${tanlanganSinfIchki}-sinf`)})
            </button>
            {!kopFanRejimi && (
              <button onClick={() => setKopFanRejimi(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold mb-2.5 border" style={{ borderColor: "#B7D3E8", color: "#1B4B7A" }}>{__kbUi("📚 Bir nechta fanni birdaniga tanlash")}</button>
            )}
            {kopFanRejimi && (
              <div className="rounded-xl px-3 py-2 mb-2.5 flex items-center justify-between" style={{ backgroundColor: "#EAF1F7" }}>
                <span className="text-xs font-medium" style={{ color: "#1B4B7A" }}>
                  {tanlanganFanlarKop.length > 0 ? __kbUi(`${tanlanganFanlarKop.length} ta fan tanlandi`) : __kbUi("Fanlarni belgilang")}
                </span>
                <button onClick={() => { setKopFanRejimi(false); setTanlanganFanlarKop([]); }} className="text-xs font-semibold" style={{ color: "#8A8578" }}>{__kbUi("Bekor qilish")}</button>
              </div>
            )}
            {ichkiYuklanmoqda ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : __kbUi((() => {
              const IQ_KALIT_SOZLAR = ["mantiq", "logika", "iq", "aql-zakovat", "fikrlash"];
              const iqMi = (nom) => IQ_KALIT_SOZLAR.some((k) => nom.toLowerCase().includes(k));
              const oddiyFanlar = ichkiFanlar.filter((f) => !iqMi(f.nom));
              const iqFanlar = ichkiFanlar.filter((f) => iqMi(f.nom));
              const FanTugmasi = (f) => { useKbInterfaceLocale(); return (kopFanRejimi ? (
                <button key={f.nom} onClick={() => kopFanBelgilaAlmashtir(f.nom, f.dars_turi || "")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border"
                  style={{ backgroundColor: tanlanganFanlarKop.includes(`${f.nom}|||${f.dars_turi || ""}`) ? "#EAF1F7" : "#F7F5F0", borderColor: tanlanganFanlarKop.includes(`${f.nom}|||${f.dars_turi || ""}`) ? "#1B4B7A" : "transparent" }}>
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: "#2B2B2B" }}>
                    <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: tanlanganFanlarKop.includes(`${f.nom}|||${f.dars_turi || ""}`) ? "#1B4B7A" : "#fff", border: "1px solid #C4BFAF" }}>
                      {tanlanganFanlarKop.includes(`${f.nom}|||${f.dars_turi || ""}`) && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </span>
                    {f.nom}
                  </span>
                  <span className="text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni}{__kbUi(" ta mavzu")}</span>
                </button>
              ) : (
                <button key={`${f.nom}-${f.dars_turi || ""}`} onClick={() => ichkiFanTanlandi(f.nom, f.dars_turi || "")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: "#F7F5F0" }}>
                  <span className="text-sm font-medium" style={{ color: "#2B2B2B" }}>{f.nom}{f.dars_turi ? __kbUi(` — ${f.dars_turi}`) : __kbUi("")}</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#8A8578" }}>{f.mavzu_soni}{__kbUi(" ta mavzu ")}<ChevronRight size={14} /></span>
                </button>
              )); };
              return (
                <div className="space-y-1.5">
                  {oddiyFanlar.map(FanTugmasi)}
                  {iqFanlar.length > 0 && (
                    <>
                      <p className="text-xs font-semibold mt-4 mb-1.5 flex items-center gap-1" style={{ color: "#8A5A1C" }}>{__kbUi("🧠 IQ / Mantiqiy fikrlash — alohida (yoshga oid, oddiy fan emas)")}</p>
                      {iqFanlar.map(FanTugmasi)}
                    </>
                  )}
                  {ichkiFanlar.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#8A8578" }}>{__kbUi("Bu sinfda mavzu yo'q")}</p>}
                </div>
              );
            })())}
            {kopFanRejimi && (
              <button onClick={kopFanTanlashniYakunla} disabled={tanlanganFanlarKop.length === 0 || kopFanYuklanmoqda}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-3 flex items-center justify-center gap-2"
                style={{ backgroundColor: tanlanganFanlarKop.length === 0 ? "#B0AA98" : "#1B4B7A" }}>
                {kopFanYuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi(`✓ Tanlangan fanlarni qo'shish (${tanlanganFanlarKop.length})`)}
              </button>
            )}
          </>
        )}

        {ichkiBosqich === "mavzular" && (
          <>
            <button onClick={() => setIchkiBosqich("fan")} className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: "#8A8578" }}>
              <ChevronLeft size={14} />{__kbUi(" Ortga (")}{tanlanganFanIchki})
            </button>
            {ichkiYuklanmoqda ? (
              <div className="py-6 text-center"><Loader2 size={20} className="animate-spin mx-auto" style={{ color: "#1B4B7A" }} /></div>
            ) : (
              <>
                <button onClick={hammasiniTanlash}
                  className="w-full py-2 rounded-lg text-xs font-semibold mb-2" style={{ backgroundColor: "#1B4B7A", color: "#fff" }}>{__kbUi("✓ Barchasini tanlash (")}{ichkiMavzular.length}{__kbUi(" ta mavzu)")}</button>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {ichkiMavzular.map((m) => {
                    const kodlar = templateTopicCodes(m);
                    return (
                      <label key={m.topic_code} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer" style={{ backgroundColor: "#F7F5F0" }}>
                        <input type="checkbox" checked={kodlar.every((k) => tanlanganKodlar.includes(k))}
                          onChange={() => kodniAlmashtir(kodlar)} />
                        <span className="text-sm flex-1" style={{ color: "#2B2B2B" }}><TranslatedContent text={m.nomi} showStatus={false}/>{m.semestr > 0 && <small className="block text-xs opacity-70">{m.semestr}{__kbUi("-semestr")}</small>}</span>
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
        <label className="text-xs font-medium mb-3 block" style={{ color: "#5A5648" }}>{__kbUi("2) Har bir qiyinlik darajasi uchun son va turini tanlang")}</label>
        <div className="space-y-4">
          {guruhlar.map((g) => {
            const nom = QIYINLIK_DARAJALARI.find(([d]) => d === g.diff)[1];
            return (
              <div key={g.diff}>
                <p className="text-sm font-medium mb-1.5" style={{ color: "#2B2B2B" }}>{__kbUi(nom)}</p>
                <div className="flex gap-1.5 mb-1.5 flex-wrap items-center">
                  {[0, 5, 10, 15, 20].map((n) => (
                    <button key={n} onClick={() => guruhniYangila(g.diff, "soni", n)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={g.soni === n
                        ? { backgroundColor: "#1B4B7A", color: "#fff" }
                        : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                      {__kbUi(n)}
                    </button>
                  ))}
                  <label className="flex items-center gap-1 text-[11px]" style={{ color: "#8A8578" }}>{__kbUi("yoki")}<input type="number" min={0} max={200} value={g.soni} aria-label={__kbUi(`${nom}: savollar soni`)}
                      onChange={(e) => guruhniYangila(g.diff, "soni", Math.max(0, Math.min(200, parseInt(e.target.value, 10) || 0)))}
                      className="w-16 px-2 py-1 rounded-lg border text-xs font-semibold text-center" style={{ borderColor: "#E5E1D8", color: "#2B2B2B" }} />{__kbUi("ta")}</label>
                </div>
                <div className="flex gap-1.5 mb-1.5 flex-wrap items-center">
                  <span className="text-[11px]" style={{ color: "#8A8578" }}>{__kbUi("⏱ Vaqt:")}</span>
                  <button onClick={() => guruhniYangila(g.diff, "vaqt", null)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                    style={g.vaqt == null ? { backgroundColor: "#8A5A1C", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>{__kbUi("Avto (")}{__kbUi(AVTO_VAQT[g.diff])}{__kbUi(" s)")}</button>
                  {VAQT_VARIANTLARI.map((v) => (
                    <button key={v} onClick={() => guruhniYangila(g.diff, "vaqt", v)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                      style={g.vaqt === v ? { backgroundColor: "#8A5A1C", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>
                      {__kbUi(v)}{__kbUi(" s")}</button>
                  ))}
                  <input type="number" min={10} max={900} step={5} placeholder={__kbUi("o'zim")} aria-label={__kbUi(`${nom}: har savolga soniya`)}
                    value={g.vaqt != null && !VAQT_VARIANTLARI.includes(g.vaqt) ? g.vaqt : ""}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); guruhniYangila(g.diff, "vaqt", Number.isFinite(v) && v >= 10 ? Math.min(900, v) : null); }}
                    className="w-16 px-2 py-1 rounded-lg border text-[11px] text-center" style={{ borderColor: "#E5E1D8" }} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => guruhniYangila(g.diff, "turi", "single_choice")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={g.turi === "single_choice"
                      ? { backgroundColor: "#2D8B8B", color: "#fff" }
                      : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>{__kbUi("🔘 Tugmali")}</button>
                  <button onClick={() => guruhniYangila(g.diff, "turi", "write_answer")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={g.turi === "write_answer"
                      ? { backgroundColor: "#2D8B8B", color: "#fff" }
                      : { backgroundColor: "#F7F5F0", color: "#5A5648" }}>{__kbUi("✍️ Yozuvli")}</button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={shablonYukla} disabled={yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mt-5"
          style={{ backgroundColor: "#1B4B7A", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi(`📥 Shablon yuklab olish (jami: ${jamiSon} ta × ${tanlanganKodlar.length} mavzu)`)}
        </button>
          </div>
        </>
      )}

      {mode === "import" && (
        <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
          <div className="mb-3">
            <h2 className="text-base font-bold" style={{ color: "#2B2B2B" }}>{__kbUi("Testlarni import qilish")}</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8A8578" }}>{__kbUi("Avval sinf va fanni tanlang. Bitta fan tanlansa, ko‘p fanli Excel ichidan faqat TESTLAR_<tanlangan fan> varag‘i olinadi. \"Barcha fanlar\" rejimida har bir TESTLAR_... varag‘i o‘z faniga va MALUMOTdagi mavzusiga qat’iy tekshiriladi.")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>{__kbUi("1) Sinf")}</label>
              <select value={importSinf} onChange={(e) => importSinfTanlandi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                <option value="">{__kbUi("Sinfni tanlang")}</option>
                {importSinflar.map((s) => <option key={s} value={s}>{s}{/^\d+$/.test(String(s)) ? __kbUi("-sinf") : __kbUi("")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>{__kbUi("2) Fan")}</label>
              <select value={importFan} onChange={(e) => setImportFan(e.target.value)} disabled={!importSinf || importTanlovYuklanmoqda}
                className="w-full px-3 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: "#E5E1D8", opacity: !importSinf || importTanlovYuklanmoqda ? 0.55 : 1 }}>
                <option value="">{importTanlovYuklanmoqda ? __kbUi("Yuklanmoqda...") : __kbUi("Fanni tanlang")}</option>
                <option value="__all__">{__kbUi("Barcha fanlar — avtomatik tekshirish")}</option>
                {importFanlar.map((f) => <option key={f.nom} value={f.nom}>{f.nom}</option>)}
              </select>
            </div>
          </div>

          {importSinf && importFan && (
            <p className="text-xs font-semibold rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
              ✓ {__kbUi(gradeLabel(scope.institution_type,importSinf))} · {importFan === "__all__" ? __kbUi("Barcha fanlar") : importFan}{__kbUi(": Excelda savoli to‘ldirilgan mavzularning testlari almashtiriladi.")}</p>
          )}

          <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
            style={{ borderColor: importSinf && importFan ? "#C4BFAF" : "#E5E1D8", color: importSinf && importFan ? "#5A5648" : "#B0AA98" }}>
            {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("3) 📤 To'ldirilgan Excel faylni tanlash")}
            <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda || !importSinf || !importFan} className="hidden" />
          </label>

          {xato && (
            <p className="text-sm mt-3 rounded-lg px-3 py-2" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
              ❌ {__kbUi(xato)}
            </p>
          )}
          {natija && (
            <div className="mt-4 text-sm space-y-3" style={{ color: "#2B2B2B" }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EAF1F7" }}>
                  <p className="text-[10px]" style={{ color: "#5A7894" }}>{__kbUi("Import qilingan varaq")}</p>
                  <p className="text-lg font-bold" style={{ color: "#1B4B7A" }}>{importQilinganVaraqSoni}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EEF7F5" }}>
                  <p className="text-[10px]" style={{ color: "#4F7E75" }}>{__kbUi("Ko'rilgan savol")}</p>
                  <p className="text-lg font-bold" style={{ color: "#246D6D" }}>{korilganSavollarSoni}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#EDF7EC" }}>
                  <p className="text-[10px]" style={{ color: "#56734E" }}>{__kbUi("Bazaga saqlandi")}</p>
                  <p className="text-lg font-bold" style={{ color: "#3D6E35" }}>{natija.saved ?? 0}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ backgroundColor: "#FDF3E0" }}>
                  <p className="text-[10px]" style={{ color: "#8A6A35" }}>{__kbUi("Duplikat")}</p>
                  <p className="text-lg font-bold" style={{ color: "#8A5A1C" }}>{natija.duplicates ?? 0}</p>
                </div>
              </div>

              {((natija.tuzatilgan_topic_code_soni ?? 0) > 0
                || (natija.almashtirishda_ochirilgan_eski_test_soni ?? 0) > 0
                || (natija.boshqa_fandan_togri_fanga_kochirilgan_test_soni ?? 0) > 0
                || (natija.ortiqcha_begona_nusxalar_tozalandi ?? 0) > 0
                || (natija.dts_fan_yozuvlari_tuzatildi ?? 0) > 0) && (
                <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
                  <p className="font-semibold">{__kbUi("✓ Fan va mavzu joylashuvi tuzatildi")}</p>
                  <p className="text-xs mt-1">{__kbUi("Eski test tozalandi: ")}<b>{natija.almashtirishda_ochirilgan_eski_test_soni ?? 0}</b>{__kbUi(" · Fan yorlig‘i tiklandi: ")}<b>{natija.dts_fan_yozuvlari_tuzatildi ?? 0}</b>{__kbUi(" · Mavzu kodi tuzatildi: ")}<b>{natija.tuzatilgan_topic_code_soni ?? 0}</b>{__kbUi(" · Boshqa fandan ko‘chirildi: ")}<b>{natija.boshqa_fandan_togri_fanga_kochirilgan_test_soni ?? 0}</b>{__kbUi(" · Ortiqcha begona nusxa tozalandi: ")}<b>{natija.ortiqcha_begona_nusxalar_tozalandi ?? 0}</b>
                  </p>
                </div>
              )}

              <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F7F5F0" }}>
                <p className="font-semibold">{__kbUi("O'qilgan test varaqlari (")}{importQilinganVaraqSoni}{__kbUi(" ta)")}</p>
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
                  <p className="text-xs mt-1" style={{ color: "#8A8578" }}>{__kbUi("Mos test varag'i topilmadi.")}</p>
                )}
                <p className="text-xs mt-2" style={{ color: "#8A8578" }}>{__kbUi("Fayldagi turli topic_code: ")}<b>{natija.fayldagi_topic_code_soni ?? 0}</b>{__kbUi(" · Xatolar: ")}<b>{natija.errors ?? 0}</b>
                </p>
              </div>

              {varaqDiagnostikasi.length > 0 && (
                <div>
                  <p className="font-semibold mb-2">{__kbUi("Har bir varaq natijasi")}</p>
                  <div className="space-y-2">
                    {varaqDiagnostikasi.map((varaq, index) => {
                      const importQilindi = varaq.holat === "import_qilindi";
                      return (
                        <div key={`${varaq.varaq || "varaq"}-${index}`} className="rounded-xl border px-3 py-2.5"
                          style={{ borderColor: importQilindi ? "#A8D2C8" : "#E8B8AE", backgroundColor: importQilindi ? "#F5FBF9" : "#FFF7F5" }}>
                          <div className="flex items-center justify-between gap-2">
                            <b className="break-all">{varaq.varaq || __kbUi(`Varaq ${index + 1}`)}</b>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                              style={{ backgroundColor: importQilindi ? "#DDEFEA" : "#FCEBEB", color: importQilindi ? "#246D6D" : "#A32D2D" }}>
                              {importQilindi ? __kbUi("IMPORT QILINDI") : __kbUi("O'TKAZIB YUBORILDI")}
                            </span>
                          </div>
                          {importQilindi ? (
                            <div className="text-xs mt-1" style={{ color: "#5A5648" }}>
                              {varaq.aniqlangan_fan && (
                                <p className="font-semibold" style={{ color: "#1B4B7A" }}>{__kbUi("Avto fan: ")}{varaq.aniqlangan_fan_kodi ? __kbUi(`${varaq.aniqlangan_fan_kodi} · `) : __kbUi("")}{varaq.aniqlangan_fan}
                                </p>
                              )}
                              <p>{__kbUi("Savol: ")}<b>{varaq.savolli_qator ?? 0}</b>{__kbUi(" · Saqlandi: ")}<b>{varaq.saved ?? 0}</b>{__kbUi(" · Duplikat: ")}<b>{varaq.duplicates ?? 0}</b>{__kbUi(" · Xato: ")}<b>{varaq.errors ?? 0}</b>
                                {Number(varaq.kod_yoq || 0) > 0 ? <>{__kbUi(" · Kodsiz: ")}<b>{varaq.kod_yoq}</b></> : null}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs mt-1" style={{ color: "#A32D2D" }}>{__kbUi("Yetishmagan ustunlar: ")}{varaq.yetishmagan_ustunlar?.length > 0 ? __kbUi(varaq.yetishmagan_ustunlar.join(", ")) : __kbUi("format mos emas")}
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
                  🚫 <b>{natija.kod_yoq}</b>{__kbUi(" ta savol o'tkazib yuborildi — ularning topic_code ustuni bo'sh edi. Topik mavzularini to'g'rilab, yangi shablon orqali qayta yuklang.")}</p>
              )}
              {natija.yetim_kodlar_soni > 0 && (
                <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}>
                  <p>⚠️ <b>{natija.yetim_kodlar_soni}</b>{__kbUi(" xil topic_code \"Mavzular\"da topilmadi — bu testlar o'quvchiga ko'rinmaydi.")}</p>
                  {natija.yetim_kodlar_namuna?.length > 0 && (
                    <p className="text-xs mt-1 font-mono" style={{ wordBreak: "break-all" }}>{__kbUi("Namuna: ")}{__kbUi(natija.yetim_kodlar_namuna.join(", "))}</p>
                  )}
                </div>
              )}
              {natija.rasm_biriktirildi > 0 && <p>{__kbUi("🖼️ Rasm biriktirildi: ")}<b>{natija.rasm_biriktirildi}</b></p>}
              {natija.rasm_diagnostika && (
                <div className="rounded-lg px-2.5 py-2 text-xs" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
                  <p className="font-semibold mb-1">{__kbUi("🔍 Rasm diagnostikasi (shu import uchun):")}</p>
                  <p>{__kbUi("Qabul qilingan fayl hajmi: ")}<b>{(Number(natija.rasm_diagnostika.qabul_qilingan_fayl_hajmi_bayt || 0) / 1024 / 1024).toFixed(2)}{__kbUi(" MB")}</b></p>
                  <p>{__kbUi("openpyxl versiyasi: ")}<b>{natija.rasm_diagnostika.openpyxl_versiyasi}</b></p>
                  <p>{__kbUi("Excel ichida topilgan rasm: ")}<b>{natija.rasm_diagnostika.excel_ichida_topilgan_rasm_soni ?? 0}</b></p>
                  <p>{__kbUi("Qatorga bog'langan rasm: ")}<b>{natija.rasm_diagnostika.qatorga_bogliy_qilingan_rasm_soni ?? 0}</b></p>
                  {natija.rasm_diagnostika.xatolar?.length > 0 && (
                    <>
                      <p className="mt-1 font-semibold">{__kbUi("Xatolar:")}</p>
                      {natija.rasm_diagnostika.xatolar.map((rasmXatosi, index) => (
                        <p key={index} className="font-mono" style={{ wordBreak: "break-all" }}>{__kbUi(rasmXatosi)}</p>
                      ))}
                    </>
                  )}
                  {natija.rasm_diagnostika.ogohlantirishlar?.length > 0 && (
                    <>
                      <p className="mt-1 font-semibold">{__kbUi("Ogohlantirishlar:")}</p>
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

// "Aqlli Sinf tanlash" — admin qo'lda "2 kurs" deb yozmaydi: bosqich → raqam,
// qiymat kanonik ("7" / "2 kurs" / "1 kurs magistr"). Maktab, talaba va
// yosh guruhi (IQ) bir-biri bilan ARALASHMAYDI. Qo'lda yozish — faqat "Boshqa".
export function SinfTanlagich({ qiymat, onChange, fan = "" }) {
  useKbInterfaceLocale();
  const talabaMos = /^\s*([1-6])\s*-?\s*kurs(?:\s+(magistr))?\s*$/i.exec(qiymat || "");
  const maktabMi = /^(?:[1-9]|1[01])$/.test((qiymat || "").trim());
  const boshlangich = talabaMos ? (talabaMos[2] ? "magistr" : "bakalavr") : maktabMi ? "maktab" : qiymat ? "boshqa" : "maktab";
  const [bosqich, setBosqich] = useState(boshlangich);
  const iqFan = ["mantiq", "logika", "iq", "aql-zakovat", "fikrlash"].some((k) => (fan || "").toLowerCase().includes(k));
  const BOSQICHLAR = [["maktab", "🏫 Maktab", "1–11 sinf"], ["bakalavr", "📘 Bakalavr", "1–4 kurs"], ["magistr", "🎓 Magistr", "1–2 kurs"], ["boshqa", "✏️ Boshqa", iqFan ? "yosh guruhi" : "qo'lda"]];
  const raqamlar = bosqich === "maktab" ? Array.from({ length: 11 }, (_, i) => String(i + 1)) : bosqich === "bakalavr" ? ["1", "2", "3", "4"] : bosqich === "magistr" ? ["1", "2"] : [];
  const kanonik = (raqam) => (bosqich === "maktab" ? raqam : bosqich === "bakalavr" ? `${raqam} kurs` : `${raqam} kurs magistr`);
  const faolRaqam = bosqich === "maktab" && maktabMi ? qiymat.trim() : talabaMos && ((bosqich === "magistr") === !!talabaMos[2]) ? talabaMos[1] : null;
  return (
    <div className="rounded-xl p-2.5 mb-1 border" style={{ borderColor: "#E5E1D8", backgroundColor: "#FAF9F6" }}>
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {BOSQICHLAR.map(([k, nom, izoh]) => (
          <button key={k} type="button" onClick={() => { setBosqich(k); if (k !== "boshqa") onChange(""); }}
            className="py-1.5 rounded-lg border text-[11px] font-semibold text-center leading-tight"
            style={{ borderColor: bosqich === k ? "#5B4B8A" : "#E5E1D8", backgroundColor: bosqich === k ? "#5B4B8A" : "#fff", color: bosqich === k ? "#fff" : "#5A5648" }}>
            {nom}<span className="block font-normal opacity-80">{izoh}</span>
          </button>
        ))}
      </div>
      {bosqich === "boshqa" ? (
        <input type="text" value={qiymat} onChange={(e) => onChange(e.target.value)}
          placeholder={iqFan ? __kbUi("masalan: 10-11 yosh") : __kbUi("masalan: Abituriyent")}
          className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#E5E1D8" }} />
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {raqamlar.map((r) => (
            <button key={r} type="button" onClick={() => onChange(kanonik(r))}
              className="px-3 py-1.5 rounded-lg border text-sm font-semibold"
              style={{ borderColor: faolRaqam === r ? "#1B4B7A" : "#E5E1D8", backgroundColor: faolRaqam === r ? "#1B4B7A" : "#fff", color: faolRaqam === r ? "#fff" : "#5A5648" }}>
              {bosqich === "maktab" ? __kbUi(`${r}-sinf`) : __kbUi(`${r}-kurs`)}
            </button>
          ))}
        </div>
      )}
      <p className="text-[11px] mt-2" style={{ color: "#8A8578" }}>{__kbUi("Bazaga yoziladigan Sinf: ")}<b className="font-mono" style={{ color: "#2B2B2B" }}>{qiymat ? qiymat : __kbUi("—")}</b>
        {talabaMos && <>{__kbUi(" · talaba profili shu qiymat bilan mos tushadi")}</>}
      </p>
    </div>
  );
}

export function TopikShablonBolimi({ token }) {
  useKbInterfaceLocale();
  const { fetch: scopedFetch, scope } = useCurriculum();
  const [sinf, setSinf] = useState(scope.grade || "");
  const [fan, setFan] = useState("");
  const darsTuri = scope.dars_turi || "";
  const [mavzular, setMavzular] = useState("");
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [toliqYaratilmoqda, setToliqYaratilmoqda] = useState(false);
  const [importlanmoqda, setImportlanmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [shablonXato, setShablonXato] = useState("");
  const [natija, setNatija] = useState(null);
  const [toliqNatija, setToliqNatija] = useState(null);

  const toliqYarat = async () => {
    if (!sinf.trim() || !fan.trim() || !mavzular.trim()) {
      setXato("Sinf, fan va mavzularni to'ldiring"); return;
    }
    setToliqYaratilmoqda(true); setXato(""); setToliqNatija(null);
    try {
      const res = await scopedFetch(`${API_BASE}/api/admin/topik_toliq_yarat?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sinf: sinf.trim(), fan: fan.trim(), dars_turi: darsTuri, mavzular }),
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
      setShablonXato("Sinf, fan va mavzularni to'ldiring"); return;
    }
    setYuklanmoqda(true); setShablonXato("");
    try {
      const res = await scopedFetch(`${API_BASE}/api/admin/topik_shablon?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sinf: sinf.trim(), fan: fan.trim(), dars_turi: darsTuri, mavzular }),
      });
      if (!res.ok) {
        // 500 holatida server JSON emas, oddiy matn qaytaradi — status kodini ko'rsatamiz
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || `Server xatosi (${res.status}) — Railway backend logini tekshiring`);
      }
      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `shablon_${sinf.trim()}sinf_${fan.trim()}.xlsx`.replace(/[\\/:*?"<>|]+/g, "_");
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(dlUrl);
    } catch (e) {
      setShablonXato(e.message);
    } finally { setYuklanmoqda(false); }
  };

  const faylTanlandi = async (e) => {
    const fayl = e.target.files[0];
    if (!fayl) return;
    setImportlanmoqda(true); setXato(""); setNatija(null);
    try {
      const formData = new FormData();
      formData.append("fayl", fayl);
      const res = await scopedFetch(`${API_BASE}/api/admin/topik_import?token=${encodeURIComponent(token)}`, {
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
        <ScopeGradeInput scope={scope} value={sinf} onChange={setSinf}/>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>{__kbUi("Fan")}</label>
        <input type="text" value={fan} onChange={(e) => setFan(e.target.value)}
          placeholder={__kbUi("masalan: Ingliz tili")}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-3"
          style={{ borderColor: "#E5E1D8" }} />

        <label className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>{__kbUi("Mavzular (har biri yangi qatorda: ")}{scope.institution_type==='maktab'?__kbUi('chorak'):scope.institution_type==='universitet'?__kbUi('semestr'):__kbUi('blok')}{__kbUi(" / mavzu)")}</label>
        <textarea value={mavzular} onChange={(e) => setMavzular(e.target.value)}
          placeholder={scope.institution_type==='universitet'?`${semesterPair(scope.kurs)[0]} / ${__kbUi("Kirish")}\n${semesterPair(scope.kurs)[1]} / ${__kbUi("Keyingi mavzu")}`:__kbUi("1 / Colours\n1 / Numbers\n2 / Animals")}
          rows={5}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-4"
          style={{ borderColor: "#E5E1D8" }} />

        <button onClick={toliqYarat} disabled={toliqYaratilmoqda}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 mb-2.5"
          style={{ backgroundColor: "#3B6D11", opacity: toliqYaratilmoqda ? 0.7 : 1 }}>
          {toliqYaratilmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("⚡ To'g'ridan-to'g'ri yaratish")}
        </button>
        <p className="text-[11px] mb-3 text-center" style={{ color: "#8A8578" }}>{__kbUi("Excel yuklab-to'ldirib-qaytarmasdan — shu zahoti bazaga qo'shadi (Bob/Bo'lim bo'sh qoladi, xohlasangiz keyin to'ldirasiz)")}</p>
        {toliqNatija && (
          <div className="rounded-xl p-3 mb-3 text-sm" style={{ backgroundColor: "#EAF3DE", color: "#2B2B2B" }}>
            <p>{__kbUi("✅ Yaratildi: ")}<b>{toliqNatija.yaratildi}</b></p>
            <p>{__kbUi("♻️ Allaqachon mavjud edi: ")}<b>{toliqNatija.mavjud}</b></p>
            {toliqNatija.xato > 0 && (
              <>
                <p style={{ color: "#A32D2D" }}>{__kbUi("❌ Xato: ")}<b>{__kbUi(toliqNatija.xato)}</b></p>
                {toliqNatija.xato_namunalari.map((x, i) => (
                  <p key={i} className="text-xs mt-1" style={{ color: "#A32D2D" }}>{x}</p>
                ))}
              </>
            )}
          </div>
        )}

        <div className="rounded-xl p-2.5 mb-2" style={{ backgroundColor: "#F7F5F0" }}>
          <p className="text-[11px]" style={{ color: "#5A5648" }}>{__kbUi("Shablonda sinf/kurs, fan, mashg‘ulot turi, chorak/semestr/blok va mavzular tayyor yoziladi. Bob va bo‘limni to‘ldirib, pastdagi “Import” orqali qayta yuklang — mavzu kodi importda yaratiladi. Muassasa va dastur ma’lumotlarini o‘zgartirmang.")}</p>
        </div>
        <button onClick={shablonYukla} disabled={yuklanmoqda}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border"
          style={{ backgroundColor: "#fff", color: "#5A5648", borderColor: "#E5E1D8", opacity: yuklanmoqda ? 0.7 : 1 }}>
          {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("📥 Bo'sh shablon yuklab olish (Bob/Bo'lim to'ldirish uchun)")}
        </button>
        {shablonXato && <p className="text-sm mt-2" style={{ color: "#B0553A" }}>❌ {__kbUi(shablonXato)}</p>}
      </div>

      <div className="rounded-2xl p-5 bg-white border" style={{ borderColor: "#E5E1D8" }}>
        <label className="text-xs font-medium mb-2 block" style={{ color: "#5A5648" }}>{__kbUi("To'ldirilgan shablonni yuklash")}</label>
        <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
          style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
          {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("📤 Fayl tanlash")}
          <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
        </label>

        {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{__kbUi(xato)}</p>}
        {natija && (
          <div className="mt-3 text-sm" style={{ color: "#2B2B2B" }}>
            <p>{__kbUi("➕ Qo'shildi: ")}<b>{natija.added}</b></p>
            {natija.updated > 0 && <p>{__kbUi("🔄 Yangilandi: ")}<b>{natija.updated}</b></p>}
            {natija.mavjud > 0 && <p>{__kbUi("✓ Oldindan mavjud: ")}<b>{natija.mavjud}</b></p>}
            <p>{__kbUi("⏭ O'tkazildi: ")}<b>{natija.skipped}</b></p>
            {natija.xato_namunalari && natija.xato_namunalari.length > 0 && (
              <div className="mt-2 rounded-lg p-2.5 space-y-1" style={{ backgroundColor: "#FCEBEB" }}>
                <p className="font-semibold" style={{ color: "#A32D2D" }}>{__kbUi("Xato tafsilotlari:")}</p>
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
  useKbInterfaceLocale();
  const { fetch: scopedFetch, scope } = useCurriculum();
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
      const res = await scopedFetch(`${API_BASE}/api/admin/tushuntirish_import?token=${encodeURIComponent(token)}`, {
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
      <p className="text-sm font-semibold mb-1" style={{ color: "#2B2B2B" }}>{__kbUi("🤖 AI tushuntirishlarni yuklash")}</p>
      <p className="text-xs mb-4" style={{ color: "#8A8578" }}>{__kbUi("Colab'da (yoki boshqa joyda) tayyorlangan Excel fayl — ustunlar: ")}<b>{__kbUi("Sinf, Fan, Mavzu, Tushuntirish")}</b>{__kbUi(". O'quvchi mavzuni ochganda shu tushuntirish ko'rsatiladi. Bir xil sinf+fan+mavzu qayta yuklansa — yangilanadi.")}</p>
      <label className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed"
        style={{ borderColor: "#C4BFAF", color: "#5A5648" }}>
        {importlanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("📤 Fayl tanlash")}
        <input type="file" accept=".xlsx" onChange={faylTanlandi} disabled={importlanmoqda} className="hidden" />
      </label>
      {xato && <p className="text-sm mt-3" style={{ color: "#B0553A" }}>{__kbUi(xato)}</p>}
      {natija && (
        <div className="mt-3 text-sm" style={{ color: "#2B2B2B" }}>
          <p>{__kbUi("✅ Saqlandi: ")}<b>{natija.saqlandi}</b></p>
          <p>{__kbUi("❌ Xato: ")}<b>{__kbUi(natija.xato)}</b></p>
        </div>
      )}
    </div>
  );
}

function ScopeGradeInput({scope,value,onChange}) {
  useKbInterfaceLocale();
  if(scope.institution_type==='universitet')return <div className="mb-4 rounded-xl bg-violet-50 p-3 text-sm font-semibold text-violet-900">{__kbUi(scope.grade)} · {__kbUi(semesterPairLabel(scope.kurs))} · {__kbUi(lessonLabel(scope.dars_turi))}</div>;
  const school=scope.institution_type==='maktab';
  return <label className="mb-4 block text-xs font-semibold text-slate-600">{school?__kbUi('Sinf'):scope.institution_type==='bogcha'?__kbUi('Yosh guruhi'):__kbUi('Kurs yoki guruh nomi')}
    {school?<select value={value} onChange={e=>onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"><option value="">{__kbUi("Sinfni tanlang")}</option>{__kbUi(Array.from({length:11},(_,i)=><option key={i+1} value={String(i+1)}>{i+1}{__kbUi("-sinf")}</option>))}</select>
    :<><input value={value} onChange={e=>onChange(e.target.value)} list={`curriculum-groups-${scope.id}`} placeholder={scope.institution_type==='bogcha'?__kbUi('Masalan: 5–6 yosh'):__kbUi('Masalan: A1 yoki Abituriyent')} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"/>
      <datalist id={`curriculum-groups-${scope.id}`}>{(scope.institution_type==='bogcha'?['3-4 yosh','4-5 yosh','5-6 yosh','6-7 yosh']:['A1','A2','B1','B2','Abituriyent']).map(g=><option key={g} value={g}/>)}</datalist></>}
  </label>;
}
