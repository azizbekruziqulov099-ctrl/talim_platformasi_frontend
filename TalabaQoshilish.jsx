import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import {semesterPairLabel} from '../curriculum/catalog.js';
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, ChevronLeft, GraduationCap, KeyRound, Search } from "lucide-react";
import "./talaba.css";

// 1–11 sinfdan TASHQARI o'quvchi (talaba) — admin qo'ygan 4 belgili parol
// bilan institutga qo'shiladi. Oqim: institut → parol → yo'nalish/bosqich →
// kurs (avtomatik ro'yxat) → guruh (bir marta yoziladi) → shakl → til.
// Saqlangach backend users.class ga "2 kurs" yozadi — o'sha kurs uchun
// yaratilgan mavzu, test va AI ustoz talabaga chiqadi.

const StandaloneSetup = React.lazy(() => import("../workspace/EducationSetup.jsx"));

const TIL_BAYROQ = { uz: "🇺🇿", ru: "🇷🇺", tj: "🇹🇯", en: "🇬🇧", kk: "🏳️", kz: "🇰🇿" };
const STANDART_LUGAT = {
  bosqichlar: { bakalavr: "Bakalavr", magistr: "Magistr" },
  kurs_chegarasi: { bakalavr: 6, magistr: 2 },
  talim_shakllari: { kunduzgi: "Kunduzgi", kechki: "Kechki", sirtqi: "Sirtqi", masofaviy: "Masofaviy" },
  talim_tillari: { uz: "O'zbek", ru: "Rus", tj: "Tojik", en: "Ingliz", kk: "Qoraqalpoq", kz: "Qozoq" },
};

async function sorov(apiBase, yol, tanlov = {}) {
  const res = await fetch(`${apiBase}${yol}`, tanlov);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Server xatosi (${res.status})`);
  return data;
}

export function talabaSinfMatni(profil) {
  if (!profil) return "";
  return `${profil.kurs}-kurs ${profil.talim_bosqichi === "magistr" ? "magistr" : "bakalavr"}`;
}

function Tugma({ faol, onClick, children, rang = "#5B4B8A", disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={!!faol}
      className="tq-chip" style={{ "--tq-rang": rang, "--tq-faol": faol ? 1 : 0 }}>
      {children}
    </button>
  );
}

export function TalabaProfilKartasi({ profil, onOzgartir, onChiqish, chiqilmoqda }) {
  useKbInterfaceLocale();
  if (!profil) return null;
  return (
    <div className="tq-profil-karta">
      <div className="tq-profil-bosh">
        <span className="tq-profil-ikon"><GraduationCap size={18} /></span>
        <div>
          <b>{profil.universitet_nomi}</b>
          <small>{profil.yonalish_nomi}</small>
        </div>
      </div>
      <dl className="tq-profil-jadval">
        <div><dt>{__kbUi("Bosqich")}</dt><dd>{profil.bosqich_nomi || profil.talim_bosqichi}</dd></div>
        <div><dt>{__kbUi("Kurs")}</dt><dd>{profil.kurs}{__kbUi("-kurs")}</dd></div>
        <div><dt>{__kbUi("Guruh")}</dt><dd>{profil.guruh}</dd></div>
        <div><dt>{__kbUi("Semestr")}</dt><dd>{profil.kurs ? __kbUi(semesterPairLabel(profil.kurs)) : __kbUi("Sozlash kerak")}</dd></div>
        <div><dt>{__kbUi("Shakl")}</dt><dd>{profil.talim_shakli_nomi || profil.talim_shakli}</dd></div>
        <div><dt>{__kbUi("Til")}</dt><dd>{profil.talim_tili_nomi || profil.talim_tili}</dd></div>
        <div><dt>{__kbUi("Mavzular Sinf'i")}</dt><dd className="tq-mono">{profil.sinf}</dd></div>
      </dl>
      <div className="tq-profil-amallar">
        {onOzgartir && <button type="button" onClick={onOzgartir}>{__kbUi("Ma'lumotni o'zgartirish")}</button>}
        {onChiqish && <button type="button" className="tq-xavfli" onClick={onChiqish} disabled={chiqilmoqda}>{chiqilmoqda ? __kbUi("…") : __kbUi("Muassasadan chiqish")}</button>}
      </div>
    </div>
  );
}

export default function TalabaQoshilish({ token, apiBase, onSaqlandi, onBekor, boshlangichBosqich = "muassasa", onStandalone }) {
  useKbInterfaceLocale();
  const [bosqich, setBosqich] = useState(boshlangichBosqich); // muassasa | parol | malumot
  const [muassasalar, setMuassasalar] = useState([]);
  const [lugat, setLugat] = useState(STANDART_LUGAT);
  const [qidiruv, setQidiruv] = useState("");
  const [muassasa, setMuassasa] = useState(null);
  const [parol, setParol] = useState("");
  const [tekshiruv, setTekshiruv] = useState(null); // {universitet, yonalishlar, yonalish_qolda}
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const [xato, setXato] = useState("");

  // ma'lumot bosqichi
  const [talimBosqichi, setTalimBosqichi] = useState("bakalavr");
  const [yonalish, setYonalish] = useState(null);        // tanlangan yo'nalish obyekti | null
  const [yonalishMatni, setYonalishMatni] = useState(""); // qo'lda yozilgan
  const [kurs, setKurs] = useState(1);
  const [semestr, setSemestr] = useState(1);
  const [guruh, setGuruh] = useState("");
  const [shakl, setShakl] = useState("kunduzgi");
  const [til, setTil] = useState("uz");

  useEffect(() => {
    let tirik = true;
    setYuklanmoqda(true); setXato("");
    sorov(apiBase, `/api/talaba/muassasalar?token=${encodeURIComponent(token)}`)
      .then((d) => { if (!tirik) return; setMuassasalar(d.muassasalar || []); setLugat({ ...STANDART_LUGAT, ...d }); })
      .catch((e) => tirik && setXato(e.message))
      .finally(() => tirik && setYuklanmoqda(false));
    return () => { tirik = false; };
  }, [apiBase, token]);

  const filtrlangan = useMemo(() => {
    const q = qidiruv.trim().toLowerCase();
    return q ? muassasalar.filter((m) => `${m.nomi} ${m.viloyat || ""} ${m.tuman || ""}`.toLowerCase().includes(q)) : muassasalar;
  }, [muassasalar, qidiruv]);

  const yonalishlar = tekshiruv?.yonalishlar || [];
  const bosqichYonalishlari = yonalishlar.filter((y) => y.bosqich === talimBosqichi);
  const kursChegarasi = lugat.kurs_chegarasi?.[talimBosqichi] || STANDART_LUGAT.kurs_chegarasi[talimBosqichi];
  const shakllar = yonalish?.shakllar?.length ? yonalish.shakllar : Object.keys(lugat.talim_shakllari || STANDART_LUGAT.talim_shakllari);
  const tillar = yonalish?.variantlar?.length ? [...new Set(yonalish.variantlar.filter(v => v.shakl === shakl).map(v => v.til))] : (yonalish?.tillar?.length ? yonalish.tillar : Object.keys(lugat.talim_tillari || STANDART_LUGAT.talim_tillari));

  useEffect(() => { setSemestr(2 * kurs - 1); }, [kurs]);
  useEffect(() => { if (kurs > kursChegarasi) setKurs(1); }, [kursChegarasi, kurs]);
  useEffect(() => { if (!shakllar.includes(shakl)) setShakl(shakllar[0]); }, [shakllar, shakl]);
  useEffect(() => { if (!tillar.includes(til)) setTil(tillar[0]); }, [tillar, til]);

  const parolniTekshir = async () => {
    if (parol.trim().length !== 4) { setXato("Parol 4 belgidan iborat bo'ladi"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const d = await sorov(apiBase, "/api/talaba/muassasa_tekshir", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, universitet_id: muassasa.id, parol: parol.trim().toUpperCase() }),
      });
      setTekshiruv(d);
      setLugat((old) => ({ ...old, ...d }));
      const birinchi = (d.yonalishlar || [])[0];
      if (birinchi) setTalimBosqichi(birinchi.bosqich);
      setBosqich("malumot");
    } catch (e) { setXato(e.message); } finally { setYuklanmoqda(false); }
  };

  const saqla = async () => {
    const yonalishNomi = yonalish ? yonalish.nomi : yonalishMatni.trim();
    if (yonalishNomi.length < 2) { setXato("Yo'nalishni tanlang yoki yozing"); return; }
    if (!guruh.trim()) { setXato("Guruhingizni yozing — masalan 401"); return; }
    setYuklanmoqda(true); setXato("");
    try {
      const d = await sorov(apiBase, "/api/talaba/profil_saqla", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, universitet_id: muassasa.id, parol: parol.trim().toUpperCase(),
          yonalish_id: yonalish ? yonalish.id : null, yonalish_nomi: yonalishNomi,
          talim_bosqichi: talimBosqichi, kurs, semestr, guruh: guruh.trim(), talim_shakli: shakl, talim_tili: til,
        }),
      });
      onSaqlandi?.(d);
    } catch (e) { setXato(e.message); } finally { setYuklanmoqda(false); }
  };

  const ortga = () => {
    setXato("");
    if (bosqich === "malumot") { setBosqich("parol"); setTekshiruv(null); return; }
    if (bosqich === "parol") { setBosqich("muassasa"); setParol(""); return; }
    onBekor?.();
  };

  if (bosqich === 'standalone') return <React.Suspense fallback={<p>Yuklanmoqda…</p>}><StandaloneSetup apiBase={apiBase} token={token} initialRole="talaba" onComplete={onSaqlandi} onBack={() => setBosqich('muassasa')}/></React.Suspense>;

  return (
    <section className="tq-oyna" aria-label={__kbUi("Talaba sifatida muassasaga qo'shilish")}>
      <div className="tq-bosh">
        <button type="button" className="tq-ortga" onClick={ortga}><ChevronLeft size={16} />{__kbUi(" Ortga")}</button>
        <ol className="tq-qadamlar" aria-label={__kbUi("Qadamlar")}>
          {[["muassasa", "Institut"], ["parol", "Parol"], ["malumot", "Ma'lumot"]].map(([k, nom], i) => (
            <li key={k} className={k === bosqich ? "on" : (["muassasa", "parol", "malumot"].indexOf(bosqich) > i ? "bajarildi" : "")}>{__kbUi(nom)}</li>
          ))}
        </ol>
      </div>

      {bosqich === "muassasa" && (
        <>
          <h3 className="tq-sarlavha">{__kbUi("Qayerda o'qiysiz?")}</h3>
          <p className="tq-izoh">{__kbUi("Institutingizni tanlang yoki umumiy testlar uchun institut tanlamasdan davom eting.")}</p>
          <button type="button" className="tq-asosiy" onClick={() => onStandalone ? onStandalone() : setBosqich('standalone')}>{__kbUi('Institutim ro‘yxatda yo‘q — davom etish')}</button>
          <label className="tq-qidiruv"><Search size={15} /><input value={qidiruv} onChange={(e) => setQidiruv(e.target.value)} placeholder={__kbUi("Institut nomi yoki viloyat")} /></label>
          {yuklanmoqda ? <p className="tq-holat"><Loader2 size={16} className="animate-spin" />{__kbUi(" Yuklanmoqda…")}</p>
            : filtrlangan.length === 0 ? <p className="tq-holat">{muassasalar.length ? __kbUi("Qidiruvga mos institut topilmadi.") : __kbUi("Hozircha qo'shilish ochilgan institut yo'q.")}</p>
            : <ul className="tq-royxat">{filtrlangan.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => { setMuassasa(m); setBosqich("parol"); setXato(""); }}>
                  <span className="tq-royxat-ikon">🎓</span>
                  <span><b>{m.nomi}</b><small>{[m.viloyat, m.tuman].filter(Boolean).join(", ") || __kbUi("Hudud ko'rsatilmagan")}</small></span>
                </button>
              </li>
            ))}</ul>}
        </>
      )}

      {bosqich === "parol" && muassasa && (
        <>
          <h3 className="tq-sarlavha">{muassasa.nomi}</h3>
          <p className="tq-izoh">{__kbUi("Admin bergan 4 belgili parolni kiriting — harf va raqam aralash, masalan ")}<span className="tq-mono">{__kbUi("A7K2")}</span>.</p>
          <label className="tq-parol">
            <KeyRound size={18} />
            <input value={parol} inputMode="text" autoCapitalize="characters" maxLength={4} autoFocus
              onChange={(e) => setParol(e.target.value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && parolniTekshir()} placeholder={__kbUi("••••")} aria-label={__kbUi("Muassasa paroli")} />
          </label>
          <button type="button" className="tq-asosiy" onClick={parolniTekshir} disabled={yuklanmoqda || parol.length !== 4}>
            {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("Davom etish")}
          </button>
        </>
      )}

      {bosqich === "malumot" && tekshiruv && (
        <>
          <h3 className="tq-sarlavha">{tekshiruv.universitet.nomi}</h3>
          <p className="tq-izoh">{__kbUi("Bu ma'lumotlar bo'yicha sizga mos mavzular, testlar va AI ustoz ochiladi. Guruhni bir marta yozasiz.")}</p>

          <p className="tq-yorliq">{__kbUi("Ta'lim bosqichi")}</p>
          <div className="tq-chiplar">
            {Object.entries(lugat.bosqichlar || STANDART_LUGAT.bosqichlar).map(([k, nom]) => (
              <Tugma key={k} faol={talimBosqichi === k} onClick={() => { setTalimBosqichi(k); setYonalish(null); }}>{k === "magistr" ? __kbUi("🎓") : __kbUi("📘")} {nom}</Tugma>
            ))}
          </div>

          <p className="tq-yorliq">{__kbUi("Yo'nalish")}</p>
          {bosqichYonalishlari.length > 0 ? (
            <div className="tq-yonalishlar">
              {bosqichYonalishlari.map((y) => (
                <button type="button" key={y.id} className={`tq-yonalish ${yonalish?.id === y.id ? "on" : ""}`} onClick={() => setYonalish(y)}>
                  <b>{y.nomi}</b>
                  <small>{[y.kodi, y.fakultet].filter(Boolean).join(" · ") || y.daraja}</small>
                </button>
              ))}

            </div>
          ) : null}
          {(yonalish === null && yonalishlar.length === 0) && (
            <input className="tq-kirish" value={yonalishMatni} onChange={(e) => setYonalishMatni(e.target.value)} maxLength={160}
              placeholder={talimBosqichi === "magistr" ? __kbUi("masalan: Matematika (magistratura)") : __kbUi("masalan: Boshlang'ich ta'lim")} />
          )}

          <p className="tq-yorliq">{__kbUi("Kurs")}</p>
          <div className="tq-chiplar">
            {Array.from({ length: kursChegarasi }, (_, i) => i + 1).map((k) => (
              <Tugma key={k} faol={kurs === k} onClick={() => setKurs(k)}>{k}{__kbUi("-kurs · ")}{__kbUi(semesterPairLabel(k))}</Tugma>
            ))}
          </div>

          <p className="tq-yorliq">{__kbUi("Joriy semestr")}</p><p className="text-xs">{__kbUi("Kursingizning ikkala semestridagi mavzu va testlar birga ko‘rinadi.")}</p>
          <div className="tq-chiplar">{[2 * kurs - 1, 2 * kurs].map(s => <Tugma key={s} faol={semestr === s} onClick={() => setSemestr(s)}>{s}{__kbUi("-semestr")}</Tugma>)}</div>
          <p className="tq-yorliq">{__kbUi("Guruh")}</p>
          <input className="tq-kirish tq-mono" value={guruh} onChange={(e) => setGuruh(e.target.value.toUpperCase())} maxLength={16}
            placeholder={__kbUi(`masalan: ${kurs}01`)} aria-label={__kbUi("Guruh raqami")} />

          <p className="tq-yorliq">{__kbUi("Ta'lim shakli")}</p>
          <div className="tq-chiplar">
            {shakllar.map((s) => <Tugma key={s} faol={shakl === s} onClick={() => setShakl(s)} rang="#0D7A77">{(lugat.talim_shakllari || STANDART_LUGAT.talim_shakllari)[s] || s}</Tugma>)}
          </div>

          <p className="tq-yorliq">{__kbUi("Ta'lim tili")}</p>
          <div className="tq-chiplar">
            {tillar.map((t) => <Tugma key={t} faol={til === t} onClick={() => setTil(t)} rang="#8A5A1C">{TIL_BAYROQ[t] || __kbUi("🌐")} {(lugat.talim_tillari || STANDART_LUGAT.talim_tillari)[t] || t}</Tugma>)}
          </div>

          <div className="tq-xulosa">
            {semestr}{__kbUi("-semestr · ")}{lugat.talim_shakllari?.[shakl] || shakl} ·  <span className="tq-mono">{kurs}{__kbUi(" kurs")}{talimBosqichi === "magistr" ? __kbUi(" magistr") : __kbUi("")}</span>
          </div>
          <button type="button" className="tq-asosiy" onClick={saqla} disabled={yuklanmoqda}>
            {yuklanmoqda ? <Loader2 size={16} className="animate-spin" /> : __kbUi("Muassasaga qo'shilish")}
          </button>
        </>
      )}

      {xato && <p className="tq-xato" role="alert">{__kbUi(xato)}</p>}
    </section>
  );
}
