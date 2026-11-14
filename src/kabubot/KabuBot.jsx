// REV561: Kabu-bot (chat). AI'siz: javoblar serverdagi qoidalar va pasportdagi haqiqiy ma'lumotdan (modules/kabu_bot.py).
// rol="oquvchi": natija, zaif mavzular, test, formula, eslatma. rol="oqituvchi": «22-o'quvchi qayerda?», kim zaif, kim faol emas…
// Amallar: test / mavzu — host beradi (onTest, onMavzu); pasport va formula — shu yerning o'zida ochiladi.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { matFetch } from "../matbank/matBankApi.js";
import Pasport from "../pasport/Pasport.jsx";
import { FormulaMashq } from "../formula/FormulaYozish.jsx";
import { FORMULALAR } from "../formula/formulalar.js";
import "./kabubot.css";

const FORMULA_IDLAR = FORMULALAR.map((f) => f.id);
let _id = 0; const yangiId = () => `m${(_id += 1)}`;

function Bloklar({ blocks }) {
  return <>{blocks.map((b, i) => (b.t === "royxat" ? <ul key={i}>{b.items.map((x, k) => <li key={k}>{x}</li>)}</ul> : <p key={i}>{b.s}</p>))}</>;
}

export default function KabuBot({ apiBase = "", token, rol = "oquvchi", onTest = null, onMavzu = null, onGuruhlar = null, onYop = null }) {
  const [xab, setXab] = useState([]); const [matn, setMatn] = useState(""); const [band, setBand] = useState(false); const [xato, setXato] = useState("");
  const [sinf, setSinf] = useState(null); const [pasport, setPasport] = useState(undefined); const [formula, setFormula] = useState(null);
  const oxirgi = useRef(""); const pastki = useRef(null); const roy = useRef(null); const kirish = useRef(null);
  const qosh = useCallback((m) => setXab((x) => [...x, { id: yangiId(), ...m }]), []);

  useEffect(() => {   // salom + eslatmalar
    let tirik = true;
    matFetch(apiBase, token, "/api/bot/boshlash", { params: { rol, formulalar: FORMULA_IDLAR.join(",") } })
      .then((r) => { if (tirik) qosh({ kim: "bot", blocks: r.javob, amallar: r.amallar, takliflar: r.takliflar }); })
      .catch((e) => { if (tirik) setXato(e.message); });
    return () => { tirik = false; };
  }, [apiBase, token, rol, qosh]);
  useEffect(() => {   // yangi javob — BOSHIDAN o'qiladi (uzun javobda oxiriga sakramaydi); yozmoqda/formula — pastga
    const r = roy.current; if (!r) return;
    const xs = r.querySelectorAll(".kb-xabar"); const oxirgiXabar = xs[xs.length - 1];
    if (band || formula || !oxirgiXabar || oxirgiXabar.classList.contains("is-men")) pastki.current?.scrollIntoView?.({ block: "end" });
    else r.scrollTo?.({ top: Math.max(0, oxirgiXabar.offsetTop - 6), behavior: "smooth" });
  }, [xab, band, formula]);

  const yubor = useCallback(async (t, sinfKalit) => {
    const savol = String(t ?? "").trim(); if (!savol || band) return;
    oxirgi.current = savol; setMatn(""); setXato(""); qosh({ kim: "men", matn: savol }); setBand(true);
    try {
      const r = await matFetch(apiBase, token, "/api/bot/yoz", { method: "POST", body: { matn: savol, rol, sinf: sinfKalit || sinf, formulalar: FORMULA_IDLAR } });
      if (r.sinf?.kalit) setSinf(r.sinf.kalit);
      qosh({ kim: "bot", blocks: r.javob, amallar: r.amallar, takliflar: r.takliflar, tanlov: r.tanlov });
    } catch (e) { setXato(e.message); } finally { setBand(false); kirish.current?.focus?.(); }
  }, [apiBase, token, rol, sinf, band, qosh]);

  const amalBos = (a) => {
    if (a.tur === "pasport") setPasport(a.user_id || null);
    else if (a.tur === "formula") setFormula(FORMULALAR.find((f) => f.id === a.id) || FORMULALAR[0]);
    else if (a.tur === "test") onTest?.(a.mavzu || []);
    else if (a.tur === "mavzu") onMavzu?.(a.mavzu);
    else if (a.tur === "guruhlar") onGuruhlar?.(a.sinf);
  };
  const korinadi = (a) => a.tur === "pasport" || a.tur === "formula" || (a.tur === "test" && onTest) || (a.tur === "mavzu" && onMavzu) || (a.tur === "guruhlar" && onGuruhlar);

  if (pasport !== undefined) return <Pasport apiBase={apiBase} token={token} userId={pasport} onYop={() => setPasport(undefined)} />;
  return <section className="kb-root">
    <header className="kb-bosh">{onYop && <button type="button" className="kb-btn" onClick={onYop}>← {__kbUi("Orqaga")}</button>}
      <div><h2>🕊️ {__kbUi("Kabu-bot")}</h2><small>{rol === "oqituvchi" ? __kbUi("O‘qituvchi uchun: sinfingiz haqida so‘rang") : __kbUi("Natijangiz, zaif mavzularingiz, test va formulalar")}</small></div></header>
    <div className="kb-royxat" role="log" aria-live="polite" ref={roy}>
      {xab.map((m, i) => <div key={m.id} className={`kb-xabar is-${m.kim}`}>
        {m.kim === "bot" && <span className="kb-avatar" aria-hidden="true">🕊️</span>}
        <div className="kb-pufak">{m.kim === "men" ? <p>{m.matn}</p> : <Bloklar blocks={m.blocks} />}
          {m.kim === "bot" && m.amallar?.filter(korinadi).length > 0 && <div className="kb-amallar">{m.amallar.filter(korinadi).map((a, k) => <button key={k} type="button" className="kb-btn kb-asosiy" onClick={() => amalBos(a)}>
            {a.tur === "test" ? "▶" : a.tur === "pasport" ? "📊" : a.tur === "formula" ? "✍️" : a.tur === "mavzu" ? "📖" : "👥"} {__kbUi(a.yozuv)}</button>)}</div>}
          {m.kim === "bot" && m.tanlov && <div className="kb-amallar">{m.tanlov.map((t) => <button key={t.kalit} type="button" className="kb-btn" onClick={() => yubor(oxirgi.current, t.kalit)}>🏫 {t.nom}</button>)}</div>}
          {m.kim === "bot" && i === xab.length - 1 && m.takliflar?.length > 0 && !m.tanlov && <div className="kb-takliflar">{m.takliflar.map((t) => <button key={t} type="button" className="kb-chip" disabled={band} onClick={() => yubor(t)}>{__kbUi(t)}</button>)}</div>}
        </div></div>)}
      {formula && <div className="kb-formula"><FormulaMashq formula={formula} onNatija={(r) => { matFetch(apiBase, token, "/api/bot/formula_natija", { method: "POST", body: { id: formula.id, togri: Boolean(r.togri && !r.korsatildi) } }).catch(() => {}); }} />
        <button type="button" className="kb-btn" onClick={() => setFormula(null)}>✕ {__kbUi("Yopish")}</button></div>}
      {band && <div className="kb-xabar is-bot"><span className="kb-avatar" aria-hidden="true">🕊️</span><div className="kb-pufak kb-yozmoqda" aria-label={__kbUi("Yozmoqda…")}><i /><i /><i /></div></div>}
      <div ref={pastki} />
    </div>
    {xato && <p className="kb-xato" role="alert">⚠️ {__kbUi(xato)}</p>}
    <form className="kb-forma" onSubmit={(e) => { e.preventDefault(); yubor(matn); }}>
      <input ref={kirish} value={matn} maxLength={400} onChange={(e) => setMatn(e.target.value)} placeholder={__kbUi(rol === "oqituvchi" ? "Masalan: 22-o‘quvchi qayerda?" : "Savolingizni yozing…")} aria-label={__kbUi("Savol")} enterKeyHint="send" autoComplete="off" />
      <button type="submit" className="kb-btn kb-asosiy" disabled={band || !matn.trim()}>{__kbUi("Yuborish")}</button>
    </form>
  </section>;
}
