// REV684: «Yuguruvchi» — Kabu olami o'yini. Rasm va ovozlar src/assets/kabu-olami/ ichida.
// Hammasi qurilmada ishlaydi (CSS transform + <audio>), serverga faqat javob ketadi.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const ovoz = (nom) => new URL(`../assets/kabu-olami/ovoz/${nom}.mp3`, import.meta.url).href;
const OVOZ = {
  togri: [ovoz("darvoza_togri"), ovoz("togri_1"), ovoz("togri_3")],
  tanga: [ovoz("tanga_1"), ovoz("tanga_2")],
  xato: [ovoz("darvoza_xato")],
  toqinish: [ovoz("toqinish")],
  maqtov: [ovoz("ayt_barakalla"), ovoz("ayt_azamat"), ovoz("ayt_juda_yaxshi")],
  yana: [ovoz("ayt_yana_urinib_kor")],
  kuy: ovoz("yugurish_loop"),
  bossKuy: ovoz("arena_loop"),
  sharKuy: ovoz("sharlar_loop"),
  stadionKuy: ovoz("stadion_loop"), arqon: [ovoz("arqon_tortildi_1"), ovoz("arqon_tortildi_2")], hushtak: [ovoz("hushtak")],
  raqibYiqildi: [ovoz("raqib_yiqildi")], tomoshabin: [ovoz("tomoshabinlar")], arqonAyt: [ovoz("ayt_arqonni_tort")],
  minoraKuy: ovoz("qurilish_loop"), blokTushdi: [ovoz("blok_tushdi")], blokQiyshaydi: [ovoz("blok_qiyshaydi")], ilgak: [ovoz("kran_ilgagi")],
  sharYoril: [ovoz("shar_yorildi_1"), ovoz("shar_yorildi_2"), ovoz("shar_yorildi_3")], konfetti: [ovoz("konfetti")],
  sharAyt: [ovoz("ayt_sharni_tanla")],
  bossKeldi: [ovoz("boss_keldi")], bossAyt: [ovoz("ayt_boss_keldi")],
  yulduz: [ovoz("yulduz_uchdi")],
  bossZarba: [[ovoz("robot_zarba")], [ovoz("bulut_zarba")], [ovoz("ajdar_zarba")], [ovoz("soat_zarba")]],
  bossDost: [ovoz("boss_dost")], galaba: [ovoz("ayt_galaba")],
};
export const YG_BOSSLAR = ["Chalkash robot", "Unutuvchi bulut", "Xato ajdar", "Vaqt o'g'risi"];
// REV690: raundda ikki boss (3- va 5-savol) — har boss galma-gal chiqadi: robot, bulut, ajdar, vaqt o'g'risi.
export function ygBoss(round = 1, step = 5) { return (((Math.max(1, Number(round) || 1) - 1) * 2 + (Number(step) >= 5 ? 1 : 0)) % 4) + 1; }
export const YG_MAVZULAR = ["ormon", "shahar", "koinot", "sahro"];
const KALIT = "kb_oyin_ovoz";

function ovozYoqiqmi() { try { return localStorage.getItem(KALIT) !== "0"; } catch { return true; } }
function chal(royxat, balandlik = 0.7) {
  try {
    const a = new Audio(royxat[Math.floor(Math.random() * royxat.length)]);
    a.volume = balandlik;
    const p = a.play(); if (p && p.catch) p.catch(() => {});
  } catch { /* ovozsiz qurilma */ }
}

export function ygMavzu(sessionId = "", round = 1) {
  let h = 0;
  for (const ch of String(sessionId)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return YG_MAVZULAR[(h + Math.max(0, Number(round) - 1)) % YG_MAVZULAR.length];
}

export function ygHisob(log = []) {
  let kombo = 0;
  for (let i = log.length - 1; i >= 0 && log[i].correct === true; i -= 1) kombo += 1;
  let tanga = 0, ketma = 0;
  for (const item of log) { if (item.correct === true) { ketma += 1; tanga += 10 + Math.min(4, ketma - 1) * 5; } else ketma = 0; }
  return { kombo, tanga };
}

export function YuguruvchiDunyo({ log = [], feedback, mavzu = "ormon", boss = 0, tur = "yugur", gender = "boy" }) {
  const [yoqiq, setYoqiq] = useState(ovozYoqiqmi);
  const kuyRef = useRef(null);
  const { kombo, tanga } = useMemo(() => ygHisob(log), [log]);
  const yakun = Boolean(feedback?.finalized);
  const togri = feedback?.correct === true;
  const oxirgi = yakun && togri ? 10 + Math.min(4, kombo - 1) * 5 : 0;

  // Fon kuyi: brauzer qoidasi bo'yicha faqat birinchi bosishdan keyin boshlanadi.
  useEffect(() => {
    if (!yoqiq) { if (kuyRef.current) kuyRef.current.pause(); return undefined; }
    const boshla = () => {
      try {
        const manba = boss ? OVOZ.bossKuy : tur === "shar" ? OVOZ.sharKuy : tur === "minora" ? OVOZ.minoraKuy : tur === "bellashuv" ? OVOZ.stadionKuy : OVOZ.kuy;
        if (kuyRef.current && kuyRef.current._manba !== manba) { kuyRef.current.pause(); kuyRef.current = null; }
        if (!kuyRef.current) { kuyRef.current = new Audio(manba); kuyRef.current._manba = manba; kuyRef.current.loop = true; kuyRef.current.volume = 0.16; }
        const p = kuyRef.current.play(); if (p && p.catch) p.catch(() => {});
      } catch { /* ovozsiz */ }
    };
    boshla();
    window.addEventListener("pointerdown", boshla, { once: true });
    return () => window.removeEventListener("pointerdown", boshla);
  }, [yoqiq, boss]);
  // Boss chiqqanda: signal va «Boss keldi!»
  useEffect(() => {
    if (!boss || !yoqiq) return;
    chal(OVOZ.bossKeldi, 0.7); setTimeout(() => chal(OVOZ.bossAyt, 0.9), 450);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss]);
  useEffect(() => () => { if (kuyRef.current) { kuyRef.current.pause(); kuyRef.current = null; } }, []);

  useEffect(() => {
    if (!yakun || !yoqiq) return;
    if (boss && togri) {
      chal(OVOZ.yulduz); setTimeout(() => chal(OVOZ.bossZarba[boss - 1], 0.8), 380);
      setTimeout(() => chal(OVOZ.bossDost, 0.7), 1100); setTimeout(() => chal(OVOZ.galaba, 0.9), 1500);
    } else if (tur === "bellashuv") {
      chal(OVOZ.arqon, 0.8);
      if (togri) { setTimeout(() => chal(OVOZ.tanga, 0.6), 350); if (bellashuvMuvozanat(log) >= 3) { setTimeout(() => chal(OVOZ.raqibYiqildi, 0.9), 500); setTimeout(() => chal(OVOZ.tomoshabin, 0.7), 800); } else if (kombo >= 3 && kombo % 2 === 1) setTimeout(() => chal(OVOZ.maqtov, 0.9), 700); }
      else setTimeout(() => chal(OVOZ.yana, 0.9), 700);
    } else if (tur === "minora") {
      if (togri) { chal(OVOZ.ilgak, 0.5); setTimeout(() => chal(OVOZ.blokTushdi, 0.9), 420); setTimeout(() => chal(OVOZ.tanga, 0.6), 700); if (kombo >= 3 && kombo % 2 === 1) setTimeout(() => chal(OVOZ.maqtov, 0.9), 950); }
      else { chal(OVOZ.blokQiyshaydi, 0.9); setTimeout(() => chal(OVOZ.yana, 0.9), 800); }
    } else if (togri && tur === "shar") {
      chal(OVOZ.sharYoril, 0.9); setTimeout(() => chal(OVOZ.konfetti, 0.6), 180); setTimeout(() => chal(OVOZ.tanga, 0.6), 420);
      if (kombo >= 3 && kombo % 2 === 1) setTimeout(() => chal(OVOZ.maqtov, 0.9), 700);
    } else if (togri) {
      chal(OVOZ.togri); setTimeout(() => chal(OVOZ.tanga, 0.6), 260);
      if (kombo >= 3 && kombo % 2 === 1) setTimeout(() => chal(OVOZ.maqtov, 0.9), 520);
    } else {
      chal(OVOZ.xato); setTimeout(() => chal(OVOZ.toqinish, 0.7), 200); setTimeout(() => chal(OVOZ.yana, 0.9), 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yakun, log.length]);

  useEffect(() => { if ((tur === "shar" || tur === "bellashuv") && yoqiq && log.length === 0) { const t = setTimeout(() => { if (tur === "bellashuv") chal(OVOZ.hushtak, 0.6); chal(tur === "shar" ? OVOZ.sharAyt : OVOZ.arqonAyt, 0.9); }, 900); return () => clearTimeout(t); } return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tur]);
  const almashtir = () => setYoqiq((v) => { const n = !v; try { localStorage.setItem(KALIT, n ? "1" : "0"); } catch { /* xotira yo'q */ } return n; });

  return (
    <>
      {boss ? (
        <div className={`yg-world yg-arena yg-boss-${boss} ${yakun ? (togri ? "is-yutdi" : "is-yutqazdi") : ""}`} aria-hidden="true">
          <div className="yg-boss"><i className="yg-boss-sog" /><i className="yg-boss-zarba" /><i className="yg-boss-yengildi" /></div>
          <i className="yg-yulduz" />
        </div>
      ) : tur === "bellashuv" ? (
        <BellashuvSahna log={log} feedback={feedback} gender={gender} />
      ) : tur === "minora" ? (
        <MinoraSahna log={log} feedback={feedback} />
      ) : tur === "shar" ? (
        <div className="yg-world yg-osmon" aria-hidden="true"><i className="yg-bulut yg-bulut-1" /><i className="yg-bulut yg-bulut-2" /><i className="yg-bulut yg-bulut-3" /></div>
      ) : (
        <div className={`yg-world yg-t-${mavzu}`} aria-hidden="true">
          <div className="yg-fon"><i /></div>
          <div className="yg-yer"><i /></div>
        </div>
      )}
      {boss ? <div className="yg-boss-nom" role="status">⚔️ {__kbUi(YG_BOSSLAR[boss - 1])}</div> : null}
      <div className="yg-hud">
        <span className="yg-coin" key={`t${tanga}`} role="status" aria-label={__kbUi(`${tanga} tanga`)}><i className="yg-coin-ic" aria-hidden="true" />{tanga}</span>
        {kombo >= 2 ? <span className="yg-combo" key={`k${kombo}`}>🔥 ×{kombo}</span> : null}
        <button type="button" className="yg-sound" onClick={almashtir} aria-pressed={yoqiq} aria-label={__kbUi(yoqiq ? "Ovozni o'chirish" : "Ovozni yoqish")}>{yoqiq ? "🔊" : "🔇"}</button>
        {oxirgi ? <b className="yg-plus" key={`p${log.length}`}>+{oxirgi}</b> : null}
      </div>
    </>
  );
}

// REV689: Bellashuv — arqon tortish. To'g'ri javob arqonni bola tomonga, xato javob raqib tomonga suradi (−3…+3).
export function bellashuvMuvozanat(log = []) {
  let m = 0;
  for (const x of log) m = Math.max(-3, Math.min(3, m + (x.correct === true ? 1 : -1)));
  return m;
}
function BellashuvSahna({ log = [], feedback, gender = "boy" }) {
  const m = bellashuvMuvozanat(log);
  const jins = gender === "girl" ? "qiz" : "ogil";
  const yakun = Boolean(feedback?.finalized);
  const yutdi = m >= 3;
  return (
    <div className="yg-world yg-maydon" aria-hidden="true">
      <div className="yg-tarozi">{[3, 2, 1, 0, -1, -2, -3].map((k) => <i key={k} className={`${k === m ? "is-joriy" : ""} ${k > 0 ? "is-men" : k < 0 ? "is-raqib" : ""}`} />)}</div>
      <div className={`yg-arqon-guruh ${yakun ? (feedback.correct ? "is-tortdi" : "is-berdi") : ""}`} style={{ "--yg-m": m }}>
        <i className={`yg-tortuvchi yg-men yg-${jins} ${yakun && feedback.correct ? "" : ""}`} />
        <i className="yg-arqon" />
        <i className={`yg-tortuvchi yg-raqib ${yutdi ? "is-yiqildi" : ""}`} />
      </div>
    </div>
  );
}

// REV688: Minora — har to'g'ri javob bitta qavat. Ekranda oxirgi 5 qavat ko'rinadi, pastdagilari «yerga kiradi».
function MinoraSahna({ log = [], feedback }) {
  const qavat = log.filter((x) => x.correct === true).length;
  const yakun = Boolean(feedback?.finalized);
  const yangi = yakun && feedback.correct === true;
  const xato = yakun && feedback.correct === false;
  const jami = qavat + 1;                       // poydevor + qavatlar
  const bosh = Math.max(0, jami - 5);
  const bloklar = [];
  for (let i = bosh; i < jami; i += 1) bloklar.push(i);
  return (
    <div className="yg-world yg-minora-fon" aria-hidden="true">
      <div className="yg-minora">
        <i className={`yg-ilgak ${yangi ? "is-tushdi" : ""}`} key={`i${qavat}`} />
        {xato ? <i className="yg-blok yg-blok-2 is-qiyshiq" key={`x${log.length}`} /> : null}
        <div className="yg-qavatlar">
          {bloklar.map((i) => <i key={i} className={`yg-blok yg-blok-${i === 0 ? 1 : 2 + ((i - 1) % 3)} ${yangi && i === jami - 1 ? "is-yangi" : ""}`} />)}
        </div>
        <b className="yg-qavat-soni">🏢 {qavat}</b>
      </div>
    </div>
  );
}

export function YuguruvchiQahramon({ gender = "boy", holat = "ready", boss = 0 }) {
  const jins = gender === "girl" ? "qiz" : "ogil";
  const poza = holat === "broken" || holat === "timeout" ? "qoqil" : boss ? (holat === "ready" ? "tur" : "zarba") : "yugur";
  return <span className={`yg-hero yg-${jins} yg-p-${poza}`} aria-hidden="true"><i /></span>;
}
