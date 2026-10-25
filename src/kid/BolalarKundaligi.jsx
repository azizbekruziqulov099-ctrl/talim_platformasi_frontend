import React, { useEffect, useState } from "react";
import FanBelgi from "./FanBelgi.jsx";
import UstozXonacha from "./UstozXonacha.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { kidSubjectEmoji, kidTopicEmoji } from "../curriculum/kidTopics.js";
import { KUN_QISQA, KUNLAR, KURS } from "../parent/bogchaReja.js";
import { ustozFor } from "./ustozRules.js";
import { USTOZLAR } from "./ustozlar.js";
import { BAJARISH, bajarishDarajasi, haftaHisobi, kunKataklari, kuzatuvMatni, qisqaSana, rivojlanish, tavsiya, uydaBirga, yulduzSatr } from "./kundalikRules.js";
import "./bolalarKundaligi.css";

// REV168: «Bolalar kundaligi» — bola ham, ota-ona ham bir xil tushunarli ko'rinishda: Kunlik (bugungi darslar kartasi: mavzu, rasm,
// kuzatuv, qanday bajardi, «Uyda birga»), Jadval (hafta kunlari ustunlari), Fanlar, Rivojlanish (avval → hozir).
// Rasmlar — mavjud rassom rasmlari (avval emoji tez chiqadi, rasm yuklangach almashadi; rasm yuklanmasa emoji qoladi).

const PASTEL = ["#FFF3D6", "#E3F1FF", "#FCE4EC", "#E6F4EA", "#EFE6FF", "#FFE9D9", "#E0F5F2", "#F6ECDC"];
const fanNomi = (k, fan, nomlar) => fan || nomlar?.[k] || KURS[k]?.nom || "";
const fanBelgisi = (k, fan, nomlar) => kidSubjectEmoji(fanNomi(k, fan, nomlar)) || KURS[k]?.emoji || "📚";
const tilOf = (k) => KURS[k]?.til || "";

// rasmlar moduli bir marta, kerak bo'lganda yuklanadi
let rasmModul = null;
function useRasmTop() {
  const [m, setM] = useState(() => rasmModul);
  useEffect(() => {
    if (m) return undefined;
    let stop = false;
    (rasmModul ? Promise.resolve(rasmModul) : import("./kundalikRasm.js").then((x) => { rasmModul = x; return x; }))
      .then((x) => { if (!stop) setM(x); }).catch(() => {});
    return () => { stop = true; };
  }, [m]);
  return m?.rasmTop || null;
}

/** Rasm: avval emoji (darhol), rassom rasmi yuklangach — rasm. Rasm topilmasa yoki yuklanmasa — emoji qoladi. */
function Rasm({ soz = "", emoji = "", til = "", className = "" }) {
  const rasmTop = useRasmTop();
  const src = rasmTop ? rasmTop(soz, emoji, til) : null;
  const [ok, setOk] = useState(false);
  const [xato, setXato] = useState(false);
  useEffect(() => { setOk(false); setXato(false); }, [src]);
  return <span className={`bk-rasm ${className} ${ok ? "is-ok" : ""}`}>
    {(!ok || xato) && <span className="bk-rasm-ph" aria-hidden="true">{emoji || "🖼️"}</span>}
    {src && !xato && <img src={src} alt="" loading="lazy" decoding="async" draggable="false" onLoad={() => setOk(true)} onError={() => setXato(true)} />}
  </span>;
}

function DarajaChip({ d }) {
  const [e, matn] = BAJARISH[d] || BAJARISH.yoq;
  return <span className={`bk-chip is-${d}`}><i aria-hidden="true">{e}</i>{T(matn)}</span>;
}
const HOLAT_CHIP = { bugun: ["⏳", "Bugun — hali o‘tilmagan"], otkazildi: ["↪", "Keyin ochiladi"], keladi: ["📅", "Rejada"], chala: ["⏸", "Tugatilmagan"] };

// ── Kunlik ──
function Kunlik({ haftalar, nomlar, rejim, say, bugunSana }) {
  const shu = haftalar.find((h) => h.hafta === "shu") || haftalar[0];
  const otgan = haftalar.find((h) => h.hafta === "otgan");
  const bugunIdx = Math.max(0, shu?.kunlar.findIndex((k) => k.holat === "bugun"));
  const [tanlov, setTanlov] = useState({ hafta: shu?.hafta || "shu", kun: bugunIdx });
  const h = haftalar.find((x) => x.hafta === tanlov.hafta) || shu;
  const kun = h?.kunlar[tanlov.kun] || h?.kunlar[0];
  if (!kun) return null;
  const kataklar = kunKataklari(kun);
  const darslar = kataklar.filter((c) => c.kalit);
  const qatnashdi = darslar.some((c) => c.holat === "tugadi");
  const davomat = kun.kun === 6 && !darslar.length ? ["🔁", "Takrorlash kuni", "is-review"]
    : qatnashdi ? ["✅", "Davomat: qatnashdi", "is-ok"]
      : kun.holat === "keladi" ? ["📅", "Hali kelmadi", "is-wait"]
        : darslar.length ? (kun.holat === "bugun" ? ["⏳", "Bugun hali dars qilinmagan", "is-wait"] : ["⚠️", "Dars qilinmagan", "is-miss"]) : ["🎮", "Dars yo‘q — dam", "is-wait"];
  return <div className="bk-kunlik">
    <div className="bk-days" role="tablist" aria-label={T("Kunlar")}>
      {otgan && <button type="button" className="bk-week-btn" onClick={() => setTanlov({ hafta: tanlov.hafta === "shu" ? "otgan" : "shu", kun: tanlov.hafta === "shu" ? 0 : bugunIdx })}>
        {tanlov.hafta === "shu" ? `‹ ${T("O‘tgan hafta")}` : `${T("Shu hafta")} ›`}</button>}
      {h.kunlar.map((k, i) => <button key={k.sana} type="button" role="tab" aria-selected={i === tanlov.kun}
        className={`bk-day-btn ${i === tanlov.kun ? "is-on" : ""} ${k.holat === "bugun" ? "is-today" : ""}`} onClick={() => setTanlov({ ...tanlov, kun: i })}>
        <b>{T(KUN_QISQA[k.kun])}</b><small>{qisqaSana(k.sana)}</small>{k.yulduz ? <i>⭐{k.yulduz}</i> : null}</button>)}
    </div>
    <div className="bk-summary">
      <span><i aria-hidden="true">🌱</i><b>{darslar.length}</b> {T("ta fan")}</span>
      <span><i aria-hidden="true">📅</i><b>{T(KUNLAR[kun.kun])}</b>{kun.holat === "bugun" ? <em>{T("Bugun")}</em> : null}</span>
      <span className={`bk-davomat ${davomat[2]}`}><i aria-hidden="true">{davomat[0]}</i>{T(davomat[1])}</span>
    </div>
    {darslar.length ? <ol className="bk-cards">
      {darslar.map((c, i) => {
        const nom = fanNomi(c.kalit, c.fan, nomlar);
        const daraja = bajarishDarajasi(c);
        const sozlar = (c.sozlar || []).slice(0, 3);
        const belgi = c.mavzu ? kidTopicEmoji(c.mavzu, i) : fanBelgisi(c.kalit, c.fan, nomlar);
        return <li key={`${c.kalit}-${i}`} className={`bk-card is-${c.holat}`} style={{ "--bk": PASTEL[i % PASTEL.length] }}>
          <header><h4>{i + 1}. <FanBelgi emoji={fanBelgisi(c.kalit, c.fan, nomlar)} /> {T(nom)}</h4>
            {c.mavzu ? <p>{c.mavzu}</p> : <p className="is-muted">{T(c.holat === "tugadi" ? "Dars" : "Mavzu dars boshlanganda chiqadi")}</p>}</header>
          <div className="bk-media">
            {rejim === "bola"
              ? <UstozXonacha ustoz={ustozFor(nom)} doska={c.mavzu || T(nom)} belgi={belgi} onTap={() => say?.(`${T(nom)}${c.mavzu ? `. ${c.mavzu}` : ""}`)} />
              : sozlar.length ? <span className={`bk-strip n${sozlar.length}`}>{sozlar.map((w) => <Rasm key={w.soz} soz={w.soz} emoji={w.emoji} til={tilOf(c.kalit)} />)}</span>
                : <span className="bk-big-emoji" aria-hidden="true">{belgi}</span>}
            {rejim === "bola" && sozlar.length > 0 && <span className="bk-strip is-mini">{sozlar.map((w) => <Rasm key={w.soz} soz={w.soz} emoji={w.emoji} til={tilOf(c.kalit)} />)}</span>}
          </div>
          <p className="bk-kuzatuv">{kuzatuvMatni(c, T)}</p>
          <div className="bk-foot">
            {c.holat === "tugadi" ? <><DarajaChip d={daraja} /><span className="bk-stars" aria-label={`${c.yulduz} ⭐`}>{yulduzSatr(c.yulduz)}</span></>
              : <span className={`bk-chip is-${c.holat}`}><i aria-hidden="true">{HOLAT_CHIP[c.holat]?.[0]}</i>{T(HOLAT_CHIP[c.holat]?.[1] || "")}</span>}
          </div>
        </li>;
      })}
    </ol> : <p className="bk-empty">{T(kun.kun === 6 ? "Yakshanba — o‘tilgan darslarni takrorlash kuni." : "Bu kunga dars rejalashtirilmagan.")}</p>}
    <div className="bk-home">
      <span className="bk-home-ico" aria-hidden="true">🏡</span>
      <div><b>{T(rejim === "bola" ? "Uyda ota-onang bilan" : "Uyda birga")}</b><p>{uydaBirga(kataklar, tilOf, T)}</p></div>
    </div>
  </div>;
}

// ── Jadval ──
function Jadval({ haftalar, nomlar }) {
  const [tanlov, setTanlov] = useState("shu");
  const h = haftalar.find((x) => x.hafta === tanlov) || haftalar[0];
  const hisob = haftaHisobi(h);
  const fanlar = [];
  return <div className="bk-jadval">
    <div className="bk-sec-head">
      <div><h3>{T("Haftalik jadval")}</h3><p>{hisob.reja || hisob.tugadi} {T("ta mashg‘ulot")} · ⭐ {hisob.yulduz}</p></div>
      <div className="bk-seg">{haftalar.map((x) => <button key={x.hafta} type="button" className={x.hafta === h.hafta ? "is-on" : ""} onClick={() => setTanlov(x.hafta)}>
        {T(x.hafta === "shu" ? "Shu hafta" : "O‘tgan hafta")}</button>)}</div>
    </div>
    <div className="bk-cols">
      {h.kunlar.map((kun) => {
        const kataklar = kunKataklari(kun);
        return <section key={kun.sana} className={`bk-col is-${kun.holat} ${kun.kun === 6 ? "is-sun" : ""}`}>
          <h4>{T(KUNLAR[kun.kun])} <small>{qisqaSana(kun.sana)}</small></h4>
          {kataklar.map((c, i) => {
            if (c.holat === "takror") return <div key="t" className="bk-tile is-review"><span className="bk-tile-ico">🔁</span><b>{T("Takrorlash")}</b></div>;
            if (c.holat === "bosh") return <div key="b" className="bk-tile is-free"><span className="bk-tile-ico">🎮</span><b>{T("Dam")}</b></div>;
            const nom = fanNomi(c.kalit, c.fan, nomlar);
            if (!fanlar.includes(c.kalit)) fanlar.push(c.kalit);
            return <div key={`${c.kalit}-${i}`} className={`bk-tile is-${c.holat}`} style={{ "--bk": PASTEL[fanlar.indexOf(c.kalit) % PASTEL.length] }} title={c.mavzu || ""}>
              <span className="bk-tile-ico"><FanBelgi emoji={fanBelgisi(c.kalit, c.fan, nomlar)} /></span>
              <b>{T(nom)}</b>
              <small>{c.holat === "tugadi" ? yulduzSatr(c.yulduz) : `${HOLAT_CHIP[c.holat]?.[0] || ""} ${T(HOLAT_CHIP[c.holat]?.[1] || "")}`}</small>
            </div>;
          })}
        </section>;
      })}
    </div>
  </div>;
}

// ── Fanlar ──
function Fanlar({ haftalar, nomlar }) {
  const yig = {};
  for (const h of haftalar) for (const k of h.kunlar) for (const c of kunKataklari(k)) {
    if (!c.kalit) continue;
    const o = yig[c.kalit] || (yig[c.kalit] = { kalit: c.kalit, fan: c.fan, reja: 0, tugadi: 0, yulduz: 0, mavzular: [] });
    o.fan = c.fan || o.fan;
    if (h.hafta === "shu" && k.rejada?.includes(c.kalit)) o.reja += 1;
    if (c.holat === "tugadi") { o.tugadi += 1; o.yulduz += c.yulduz || 0; if (c.mavzu) o.mavzular.push(c.mavzu); }
  }
  const list = Object.values(yig);
  if (!list.length) return <p className="bk-empty">{T("Hali dars yo‘q.")}</p>;
  return <ul className="bk-fanlar">{list.map((f, i) => <li key={f.kalit} style={{ "--bk": PASTEL[i % PASTEL.length] }}>
    <span className="bk-fan-ico"><FanBelgi emoji={fanBelgisi(f.kalit, f.fan, nomlar)} /></span>
    <div><b>{T(fanNomi(f.kalit, f.fan, nomlar))}</b>
      <small>{T("2 haftada")}: {f.tugadi} {T("dars")} · ⭐ {f.yulduz}{f.reja ? ` · ${T("shu hafta rejada")}: ${f.reja}` : ""}</small>
      {f.mavzular.length > 0 && <p>{f.mavzular.slice(-3).map((m) => `«${m}»`).join(", ")}</p>}</div>
  </li>)}</ul>;
}

// ── Rivojlanish ──
function Rivojlanish({ haftalar, nomlar, children }) {
  const riv = rivojlanish(haftalar);
  const tarbiyachi = USTOZLAR.nilufar?.[1];
  return <div className="bk-riv">
    <h3>{T("Bolaning rivojlanishi")} 🌱</h3>
    {riv.length ? <ul className="bk-riv-cards">{riv.map((r, i) => <li key={r.kalit} style={{ "--bk": PASTEL[i % PASTEL.length] }}>
      <h4><FanBelgi emoji={fanBelgisi(r.kalit, r.fan, nomlar)} /> {T(fanNomi(r.kalit, r.fan, nomlar))}</h4>
      <div className="bk-riv-media">{r.sozlar?.length ? <span className={`bk-strip n${Math.min(3, r.sozlar.length)}`}>{r.sozlar.slice(0, 3).map((w) => <Rasm key={w.soz} soz={w.soz} emoji={w.emoji} til={tilOf(r.kalit)} />)}</span>
        : <span className="bk-big-emoji" aria-hidden="true">{r.mavzu ? kidTopicEmoji(r.mavzu, i) : fanBelgisi(r.kalit, r.fan, nomlar)}</span>}</div>
      {r.mavzu && <p className="bk-riv-topic">«{r.mavzu}»</p>}
      <p className={`bk-riv-row is-${r.avval}`}><i aria-hidden="true">{BAJARISH[r.avval][0]}</i>{T("Avval")}: <b>{T(BAJARISH[r.avval][1])}</b></p>
      <p className={`bk-riv-row is-${r.hozir} is-now`}><i aria-hidden="true">{BAJARISH[r.hozir][0]}</i>{T("Hozir")}: <b>{T(BAJARISH[r.hozir][1])}</b></p>
    </li>)}</ul> : null}
    <p className="bk-legend">{["birga", "eslatma", "mustaqil", "yoq"].map((d) => <span key={d} className={`is-${d}`}><i aria-hidden="true">{BAJARISH[d][0]}</i>{T(BAJARISH[d][1])}</span>)}</p>
    <div className="bk-tavsiya">
      {tarbiyachi && <img src={tarbiyachi.src} alt="" loading="lazy" decoding="async" draggable="false" />}
      <div><small>{T("Ustoz tavsiyasi")}</small><b>{tavsiya(riv, (k, f) => fanNomi(k, f, nomlar), T)}</b></div>
    </div>
    {children}
  </div>;
}

const TABLAR = [["kunlik", "🏠", "Kunlik"], ["jadval", "🗓️", "Jadval"], ["fanlar", "📚", "Fanlar"], ["rivojlanish", "🌱", "Rivojlanish"]];

/** rejim — bola | ota. children — «Rivojlanish» ichiga qo'shimcha (masalan, bolaning kuchlari). */
export default function BolalarKundaligi({ haftalar, nomlar, rejim = "ota", say, children, boshTab = "kunlik" }) {
  const [tab, setTab] = useState(boshTab);
  if (!haftalar?.length) return <KundalikSkelet />;
  return <div className={`bk-root is-${rejim}`}>
    <nav className="bk-tabs" role="tablist" aria-label={T("Kundalik")}>
      {TABLAR.map(([id, e, nom]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""}
        onClick={() => { setTab(id); if (rejim === "bola") say?.(T(nom)); }}><i aria-hidden="true">{e}</i>{T(nom)}</button>)}
    </nav>
    {tab === "kunlik" ? <Kunlik haftalar={haftalar} nomlar={nomlar} rejim={rejim} say={say} />
      : tab === "jadval" ? <Jadval haftalar={haftalar} nomlar={nomlar} />
        : tab === "fanlar" ? <Fanlar haftalar={haftalar} nomlar={nomlar} />
          : <Rivojlanish haftalar={haftalar} nomlar={nomlar}>{children}</Rivojlanish>}
  </div>;
}

/** Yuklanayotganda — tez chiqadigan, tushunarli «skelet» (qotib qolgandek bo'sh oyna emas). */
export function KundalikSkelet() {
  return <div className="bk-root bk-skelet" role="status" aria-label={T("Yuklanmoqda…")}>
    <div className="bk-tabs">{TABLAR.map(([id, e, nom]) => <span key={id}><i aria-hidden="true">{e}</i>{T(nom)}</span>)}</div>
    <div className="bk-summary"><span className="bk-sk" /><span className="bk-sk" /><span className="bk-sk" /></div>
    <div className="bk-cards">{[0, 1].map((i) => <div key={i} className="bk-card"><span className="bk-sk is-title" /><span className="bk-sk is-media" /><span className="bk-sk" /></div>)}</div>
    <p className="bk-empty">📒 {T("Kundalik yuklanmoqda…")}</p>
  </div>;
}
