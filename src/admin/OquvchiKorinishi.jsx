import React, { useMemo, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import LearnerTopics from "../curriculum/LearnerTopics.jsx";
import { KORINISH_TURLARI, korinishTuri, previewUser } from "./previewRules.js";
import "./oquvchiKorinishi.css";

const SAQLASH = "kabutar:admin:korinish:v1";
const oqi = () => { try { return JSON.parse(window.localStorage.getItem(SAQLASH) || "null") || {}; } catch { return {}; } };
const yoz = (v) => { try { window.localStorage.setItem(SAQLASH, JSON.stringify(v)); } catch { /* ixtiyoriy */ } };

/**
 * REV122: «O'quvchi ko'zi bilan» — admin muassasa turini (bog'cha, maktab, markaz, institut) va sinf/yoshni tanlaydi,
 * so'ng platformani xuddi shu o'quvchi ko'rgandek ko'radi: bog'cha olami, rasmli darslar, o'yinlar, testlar.
 * Ko'rish rejimida kunlik cheklov yo'q (hamma darslar ochiq) va bola kuzatuviga (kunlik reja, yulduzlar statistikasi) yozilmaydi.
 */
export default function OquvchiKorinishi({ apiBase, token, admin, Tests, jins = "qiz" }) {
  useKbInterfaceLocale();
  const [tanlov, setTanlov] = useState(() => { const s = oqi(); return { tur: korinishTuri(s.tur) ? s.tur : "", guruh: s.guruh || "" }; });
  const [oyna, setOyna] = useState("mavzular");   // mavzular | test
  const [testNishoni, setTestNishoni] = useState(null);
  const tur = korinishTuri(tanlov.tur);
  const guruh = tur?.guruhlar.some(([k]) => k === tanlov.guruh) ? tanlov.guruh : (tur?.guruhlar[0]?.[0] || "");
  const user = useMemo(() => (tur ? previewUser(admin, tur.kalit, guruh) : null), [admin, tur, guruh]);
  const preview = useMemo(() => (tur ? { type: tur.type, sinf: guruh } : null), [tur, guruh]);

  const tanla = (kalit, g = "") => {
    const v = { tur: kalit, guruh: g };
    setTanlov(v); yoz(v); setOyna("mavzular"); setTestNishoni(null);
  };

  if (!tur) return <div className="ok-root px-5 pt-6 pb-8">
    <header className="ok-hero">
      <span className="ok-hero-icon" aria-hidden="true">👁</span>
      <div>
        <h1>{__kbUi("O‘quvchi ko‘zi bilan")}</h1>
        <p>{__kbUi("Muassasa turini tanlang — platformani shu o‘quvchi qanday ko‘rsa, xuddi shunday ko‘rasiz: mavzular, darslar, o‘yinlar va testlar.")}</p>
      </div>
    </header>
    <div className="ok-turlar">
      {KORINISH_TURLARI.map((t) => <button key={t.kalit} type="button" className="ok-tur" style={{ "--ok-rang": t.rang, "--ok-fon": t.fon }}
        onClick={() => tanla(t.kalit)}>
        <span className="ok-tur-ikon" aria-hidden="true">{t.ikon}</span>
        <span className="ok-tur-nom">{__kbUi(t.nom)}</span>
        <span className="ok-tur-izoh">{__kbUi(t.izoh)}</span>
        <span className="ok-tur-btn">{__kbUi("Ko‘rish →")}</span>
      </button>)}
    </div>
    <p className="ok-eslatma">{__kbUi("Keyinchalik yangi muassasa turlari qo‘shilsa, shu ro‘yxatda chiqadi.")}</p>
  </div>;

  return <div className="ok-root">
    <div className="ok-bar" style={{ "--ok-rang": tur.rang, "--ok-fon": tur.fon }} role="region" aria-label={__kbUi("Ko‘rish rejimi")}>
      <div className="ok-bar-row">
        <span className="ok-bar-badge">👁 {__kbUi("Ko‘rish rejimi")}</span>
        <div className="ok-bar-turlar" role="tablist" aria-label={__kbUi("Muassasa turi")}>
          {KORINISH_TURLARI.map((t) => <button key={t.kalit} type="button" role="tab" aria-selected={t.kalit === tur.kalit}
            className={`ok-chip ${t.kalit === tur.kalit ? "is-on" : ""}`} onClick={() => tanla(t.kalit)}>
            <span aria-hidden="true">{t.ikon}</span> {__kbUi(t.nom)}</button>)}
        </div>
        <button type="button" className="ok-chiq" onClick={() => tanla("")}>{__kbUi("✕ Chiqish")}</button>
      </div>
      {tur.guruhlar.length > 0 && <div className="ok-bar-row ok-guruhlar" role="tablist" aria-label={__kbUi(tur.kalit === "bogcha" ? "Yosh" : "Sinf")}>
        {tur.guruhlar.map(([k, nom]) => <button key={k || "all"} type="button" role="tab" aria-selected={k === guruh}
          className={`ok-chip is-small ${k === guruh ? "is-on" : ""}`} onClick={() => tanla(tur.kalit, k)}>{__kbUi(nom)}</button>)}
      </div>}
      <p className="ok-bar-izoh">{__kbUi("Siz o‘quvchi ko‘rinishidasiz: hamma darslar ochiq, kunlik cheklov yo‘q, bola kuzatuviga yozilmaydi.")}</p>
    </div>

    {oyna === "test" && Tests ? <div className="px-3 sm:px-5 pt-3 pb-6">
      <button type="button" className="ok-orqaga" onClick={() => { setOyna("mavzular"); setTestNishoni(null); }}>{__kbUi("← Mavzularga qaytish")}</button>
      <Tests key={`${tur.kalit}-${guruh}-${testNishoni?.nonce || 0}`} token={token} foydalanuvchi={user}
        sinf={tur.kalit === "maktab" && guruh ? guruh : null} initialTarget={testNishoni} rang={tur.rang} />
    </div> : <div className="px-3 sm:px-5 pt-3 pb-6">
      <LearnerTopics key={`${tur.kalit}-${guruh}`} apiBase={apiBase} token={token} user={user} preview={preview}
        jins={jins}
        onOpenLesson={null}
        onOpenTest={Tests ? (topic) => { setTestNishoni({ ...topic, nonce: Date.now() }); setOyna("test"); } : undefined} />
    </div>}
  </div>;
}
