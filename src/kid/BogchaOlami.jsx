import React, { useState } from "react";
import FanBelgi from "./FanBelgi.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { useKeepLight } from "./useKeepLight.js";
import { fanTili } from "./izohTil.js";
import { fanIzohi } from "../curriculum/izohTanlov.js";
import { KUN_QISQA, KUNLAR } from "../parent/bogchaReja.js";
import { useKundalik } from "./KidKundalik.jsx";
import UstozXonacha from "./UstozXonacha.jsx";
import { guruhla } from "../curriculum/fanGuruhlari.js";
import { KundalikSkelet } from "./BolalarKundaligi.jsx";

// REV168: olinmagan til — o'yin yo'lining birinchi bosqichlari reklama sifatida ochiq
export const SINOV_BOSQICH = 4;
// REV168: «Mening kundaligim» to'liq ekrani alohida yuklanadi (bosh sahifa tez ochilsin)
const KidKundalik = React.lazy(() => import("./KidKundalik.jsx"));
import "./olam.css";

const TilXonalari = React.lazy(() => import("./xonalar/TilXonalari.jsx"));

// Har fan kartasining rangi (navbat bilan) — o'qiy olmaydigan bola fanni rang va belgidan taniydi
const RANGLAR = ["#FFE9A8", "#CDEBFF", "#FFD6E0", "#D7F5D0", "#E8DBFF", "#FFE0C2", "#D2F4F0", "#F6E1C8"];

/**
 * REV130: Bog'cha bosh ekrani — oddiy va tez: katta fan kartalari (rasmli bino, yo'lak va qavatlar olib tashlandi —
 * og'ir rasmlar sekin telefonda qotib qolardi). Kartani bosish — fan darslari ro'yxati.
 * Til fanlarida alohida «🎮 O'yin xonalari» tugmasi bor.
 * fanlar: [{ kalit, nom, asl, emoji }] · onFan(kalit) · say(matn) — nomni ovoz bilan aytish.
 */
export default function BogchaOlami({ fanlar = [], bugun = [], onFan, say, apiBase = "", grade = "", token = "" }) {
  const [oyin, setOyin] = useState(null);   // til fani: { til, izoh }
  const [kundalik, setKundalik] = useState(false);   // REV166: «Mening kundaligim»
  const [diary, reloadDiary] = useKundalik(apiBase, token, Boolean(token));
  useKeepLight(true);
  useInterface();   // til almashsa nomlar ham almashadi

  if (kundalik && diary?.bogcha) {
    return <div className="ol-root"><React.Suspense fallback={<KundalikSkelet />}>
      <KidKundalik data={diary} say={say} onClose={() => { setKundalik(false); reloadDiary(); }} /></React.Suspense></div>;
  }

  if (oyin) {
    return <div className="ol-root">
      <React.Suspense fallback={<p className="ol-loading">🎮 …</p>}>
        <TilXonalari apiBase={apiBase} til={oyin.til} izoh={oyin.izoh} grade={grade} sinov={oyin.sinov || 0} onClose={() => setOyin(null)} />
      </React.Suspense>
    </div>;
  }

  // REV163: haftalik reja — bugungi fanlar birinchi, har kartada «Bugun» yoki keyingi kun belgisi
  const tartib = fanlar.some((f) => f.holat) ? [...fanlar].sort((a, b) => (a.holat?.turi === "bor" ? 0 : 1) - (b.holat?.turi === "bor" ? 0 : 1)) : fanlar;
  const takror = fanlar.some((f) => f.holat?.turi === "takror");
  const rejali = fanlar.some((f) => f.holat && f.holat.turi !== "yoq" && f.holat.turi !== "obuna");
  // REV168: bosh sahifada ASOSIY — kundalik va bugungi darslar (har biri o'z ustozi bilan xonachada); boshqa fanlar pastda kichikroq
  const bugungiKalit = new Set(bugun.map((b) => b.kalit));
  const boshqa = bugun.length ? tartib.filter((f) => !bugungiKalit.has(f.kalit)) : tartib;
  return <div className="ol-root">
    {diary?.bogcha && diary.daraja && <button type="button" className="ol-diary" onClick={() => { say?.(T("Mening kundaligim")); setKundalik(true); }}>
      <span className="ol-diary-lvl" aria-hidden="true">{diary.daraja.emoji}</span>
      <span>📒 {T("Mening kundaligim")}</span>
      <b>⭐ {diary.jami_yulduz}</b>
      {diary.ketma_ket > 1 ? <small>🔥 {diary.ketma_ket}</small> : null}
    </button>}
    {bugun.length > 0 && <section className="ol-bugun" aria-label={T("Bugungi darslar")}>
      <h2 className="ol-head">⭐ {T("Bugungi darslar")}</h2>
      <div className="ol-bugun-grid">
        {bugun.map((b) => <article key={b.kalit} className="ol-xona">
          <button type="button" className="ol-xona-main" onClick={() => { say?.(`${b.nom}${b.mavzu ? `. ${b.mavzu}` : ""}`); b.open?.(); }}
            aria-label={`${b.nom}${b.mavzu ? ` — ${b.mavzu}` : ""}`}>
            <UstozXonacha ustoz={b.ustoz} doska={b.mavzu || b.nom} belgi={b.mavzuEmoji || ""} />
            <span className="ol-xona-play" aria-hidden="true">▶</span>
          </button>
          <footer>
            <span className="ol-xona-fan"><FanBelgi emoji={b.emoji} /> <b>{b.nom}</b></span>
            {b.mavzu ? <span className="ol-xona-mavzu">{b.mavzu}</span> : null}
            <button type="button" className="ol-xona-go" onClick={() => { say?.(b.nom); b.open?.(); }}>▶ {T("Boshlash")}</button>
          </footer>
        </article>)}
      </div>
    </section>}
    {takror ? <p className="ol-today" role="status">🔁 {T("Bugun yakshanba — takrorlash kuni")}</p>
      : !bugun.length && rejali ? <p className="ol-today is-rest" role="status">🎮 {T("Bugun yangi dars yo‘q — o‘tilgan darslarni takrorlash va o‘yinlar ochiq.")}</p> : null}
    <h2 className={`ol-head ${bugun.length ? "is-small" : ""}`}>{bugun.length ? <>📚 {T("Boshqa fanlar")}</> : <>🏫 {T("Qaysi fanni o‘rganamiz?")}</>}</h2>
    {/* REV168: fanlar guruhlarda — «Maktab fanlari» (matematika, mantiq, olam…) va «Tillar» */}
    {guruhla(boshqa, (f) => f.asl || f.nom).map((g) => <section key={g.id} className="ol-guruh">
      {(bugun.length > 0 || guruhla(boshqa, (f) => f.asl || f.nom).length > 1) && <h3 className="ol-guruh-nom"><span aria-hidden="true">{g.id === "maktab" ? "🧠" : g.emoji}</span> {T(g.id === "maktab" ? "Fanlar" : g.nom)}</h3>}
      <div className={`ol-grid ${bugun.length ? "is-small" : ""}`}>
      {g.fanlar.map((f) => { const i = Math.max(0, tartib.indexOf(f));
        const til = fanTili(f.asl || f.nom);
        const h = f.holat;
        return <div key={f.kalit} className={`ol-fan ${h ? `is-${h.turi}` : ""}`} style={{ "--fan": RANGLAR[i % RANGLAR.length] }}>
          {h?.turi === "bor" && <span className="ol-fan-badge is-bor">⭐ {T("Bugun")}</span>}
          {h?.turi === "keyin" && h.keyingi && <span className="ol-fan-badge">📅 {T(h.keyingi)}</span>}
          {h?.turi === "navbat" && <span className="ol-fan-badge">⏳ {T("Navbatda")}</span>}
          {h?.turi === "sinov" && <span className="ol-fan-badge is-sinov">🎁 {h.kvota} {T("ta sinov darsi")}</span>}
          <button type="button" className="ol-fan-main" onClick={() => { say?.(f.nom); onFan?.(f.kalit); }}>
            <span className="ol-fan-emoji" aria-hidden="true"><FanBelgi emoji={f.emoji} /></span>
            <b>{f.nom}</b>
          </button>
          {h?.kunlar?.length > 0 && <span className="ol-fan-days" title={h.kunlar.map((d) => T(KUNLAR[d])).join(", ")}
            aria-label={`${T("Dars kunlari")}: ${h.kunlar.map((d) => T(KUNLAR[d])).join(", ")}`}>
            {h.kunlar.map((d) => <i key={d} className={d === h.bugun ? "is-today" : ""}>{T(KUN_QISQA[d])}</i>)}
          </span>}
          {til && <button type="button" className="ol-fan-play" onClick={() => { say?.(T("O‘yin xonalari")); setOyin({ til, izoh: fanIzohi(f.asl || f.nom), sinov: h && ["yoq", "navbat", "obuna", "sinov"].includes(h.turi) ? SINOV_BOSQICH : 0 }); }}>
            🎮 {T("O‘yin xonalari")}
          </button>}
        </div>;
      })}
      </div>
    </section>)}
  </div>;
}
