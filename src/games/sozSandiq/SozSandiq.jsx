// REV695: «So'z sandig'i» — rasmli so'z bazasidan til o'yini (10 til). Hammasi qurilmada; serverdan faqat rasm va ovoz olinadi.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { ORGANISH_TILLARI, oyinYasa, saralash, soz, ovozMatni, tangaHisobi, xotiraOl, xotiraYoz } from "./sozRules.js";
import { joriyProfil, yukla as orolYukla, saqla as orolSaqla, tangaQosh } from "../orolHolat.js";
import "./sozSandiq.css";

const API = String(import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app").replace(/\/+$/, "");
const rasmUrl = (f) => `${API}/api/rasm_kutubxona/fayl/${encodeURIComponent(f)}`;
const TOPLAMLAR = [["bolalar", "🧸", "Bolalar so‘zlari", "2–7 yosh va boshlang‘ich"], ["maktab", "🎒", "Maktab so‘zlari", "1–11-sinf"]];
const DARAJALAR = { bolalar: [[1, "Oson"], [2, "O‘rta"], [3, "Hammasi"]], maktab: [[1, "1–4-sinf"], [2, "5–8-sinf"], [3, "9–11-sinf"]] };
const yuklaToplam = (nom) => (nom === "maktab" ? import("./data/maktab.json") : import("./data/bolalar.json")).then((m) => m.default || m);

function useOvoz() {
  const a = useRef(null);
  useEffect(() => () => { try { a.current?.pause(); } catch { /* */ } }, []);
  return useCallback((matn, til) => {
    try {
      if (localStorage.getItem("kb_oyin_ovoz") === "0") return;
      a.current?.pause();
      const x = new Audio(`${API}/api/ovoz?k=133&${new URLSearchParams({ matn: ovozMatni(matn, til), jins: "qiz" })}`);
      a.current = x; const p = x.play(); if (p && p.catch) p.catch(() => {});
    } catch { /* ovozsiz */ }
  }, []);
}

function Rasm({ x, className = "" }) {
  const [xato, setXato] = useState(false);
  return xato ? <span className={`ss-rasm ss-rasm-yoq ${className}`}>{soz(x, "uz")}</span>
    : <img className={`ss-rasm ${className}`} src={rasmUrl(x.f)} alt="" loading="eager" draggable={false} onError={() => setXato(true)} />;
}

function Juft({ r, til, onTugadi, ayt }) {
  const [tanlangan, setTanlangan] = useState(null);
  const [topildi, setTopildi] = useState([]);
  const [xato, setXato] = useState(null);
  const xatoBor = useRef(false);
  const rasmBos = (x) => {
    if (!tanlangan || topildi.includes(x.k)) return;
    if (x.k === tanlangan) {
      const yangi = [...topildi, x.k]; setTopildi(yangi); setTanlangan(null);
      if (yangi.length === r.juftlar.length) setTimeout(() => onTugadi(!xatoBor.current), 500);
    } else { xatoBor.current = true; setXato(x.k); setTimeout(() => setXato(null), 500); }
  };
  return <div className="ss-juft">
    <div className="ss-juft-soz">{r.juftlar.map((x) => <button key={x.k} type="button" disabled={topildi.includes(x.k)} className={`${tanlangan === x.k ? "is-tanlangan" : ""} ${topildi.includes(x.k) ? "is-topildi" : ""}`}
      onClick={() => { setTanlangan(x.k); ayt(soz(x, til), til); }}>{soz(x, til)}</button>)}</div>
    <div className="ss-juft-rasm">{r.rasmlar.map((x) => <button key={x.k} type="button" disabled={topildi.includes(x.k)} className={`${topildi.includes(x.k) ? "is-topildi" : ""} ${xato === x.k ? "is-xato" : ""}`} onClick={() => rasmBos(x)}><Rasm x={x} /></button>)}</div>
  </div>;
}

export default function SozSandiq({ onClose }) {
  const [til, setTil] = useState(() => { try { return localStorage.getItem("kb_soz_til") || "en"; } catch { return "en"; } });
  const [toplam, setToplam] = useState("bolalar");
  const [daraja, setDaraja] = useState(3);
  const [pool, setPool] = useState(null);
  const [raundlar, setRaundlar] = useState(null);
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);          // { k, togri }
  const [natijalar, setNatijalar] = useState([]);
  const [yakun, setYakun] = useState(null);
  const ayt = useOvoz();

  useEffect(() => { let bekor = false; setPool(null); yuklaToplam(toplam).then((d) => { if (!bekor) setPool(d); }).catch(() => { if (!bekor) setPool([]); }); return () => { bekor = true; }; }, [toplam]);
  const tayyor = useMemo(() => (pool ? saralash(pool, { daraja: daraja === 3 && toplam === "bolalar" ? 0 : daraja }) : []), [pool, daraja, toplam]);
  const xotira = useMemo(() => xotiraOl(til), [til, yakun]);

  const boshla = () => {
    try { localStorage.setItem("kb_soz_til", til); } catch { /* */ }
    const h = xotiraOl(til);
    setRaundlar(oyinYasa(tayyor, { til, izoh: "uz", korilgan: h.korilgan, xatolar: h.xatolar })); setI(0); setJavob(null); setNatijalar([]); setYakun(null);
  };
  const r = raundlar?.[i];
  useEffect(() => { if (r && (r.tur === "eshit" || r.tur === "rasm")) { const t = setTimeout(() => ayt(soz(r.nishon, til), til), 350); return () => clearTimeout(t); } return undefined; }, [r, til, ayt]);

  const keyingi = (togri) => {
    const yangi = [...natijalar, togri];
    setNatijalar(yangi); setJavob(null);
    if (i + 1 < raundlar.length) { setI(i + 1); return; }
    const kalit = raundlar.map((x) => x.nishon.k);
    xotiraYoz(til, { korildi: kalit, xato: kalit.filter((_, n) => !yangi[n]), togri: kalit.filter((_, n) => yangi[n]) });
    const tanga = tangaHisobi(yangi); const profil = joriyProfil();
    const q = tangaQosh(orolYukla(profil), `soz-${til}-${Date.now()}`, tanga); if (q.qoshildi) orolSaqla(profil, q.holat);
    setYakun({ togri: yangi.filter(Boolean).length, jami: yangi.length, tanga });
  };
  const tanla = (x) => {
    if (javob) return;
    const togri = x.k === r.nishon.k;
    setJavob({ k: x.k, togri });
    if (r.tur === "soz" || togri) ayt(soz(r.nishon, til), til);
    setTimeout(() => keyingi(togri), togri ? 900 : 1900);
  };

  const bosh = <header className="ss-bosh"><button type="button" className="ss-yop" onClick={raundlar && !yakun ? () => setRaundlar(null) : onClose} aria-label={__kbUi("Orqaga")}>←</button>
    <b>🧰 {__kbUi("So‘z sandig‘i")}</b>{raundlar && !yakun ? <span className="ss-hisob">{i + 1}/{raundlar.length}</span> : <span className="ss-hisob">⭐ {xotira.jami}</span>}</header>;

  if (yakun) return <div className="ss-root" role="dialog" aria-modal="true">{bosh}<div className="ss-yakun">
    <div className="ss-yakun-son">{yakun.togri}/{yakun.jami}</div>
    <p>{yakun.togri === yakun.jami ? __kbUi("Zo‘r! Hammasi to‘g‘ri!") : __kbUi("Yaxshi! Xato qilgan so‘zlaring keyingi o‘yinda qaytadi.")}</p>
    <div className="ss-tanga">🪙 +{yakun.tanga} {__kbUi("tanga — Kabu oroliga")}</div>
    <button type="button" className="ss-asosiy" onClick={boshla}>{__kbUi("Yana o‘ynash — yangi so‘zlar")}</button>
    <button type="button" className="ss-ikkinchi" onClick={() => { setRaundlar(null); setYakun(null); }}>{__kbUi("Tilni almashtirish")}</button>
  </div></div>;

  if (!raundlar) return <div className="ss-root" role="dialog" aria-modal="true">{bosh}<div className="ss-sozlama">
    <h3>{__kbUi("Qaysi tilni o‘rganamiz?")}</h3>
    <div className="ss-tillar">{ORGANISH_TILLARI.map(([k, bayroq, nom]) => <button key={k} type="button" className={til === k ? "is-on" : ""} aria-pressed={til === k} onClick={() => setTil(k)}><span aria-hidden="true">{bayroq}</span>{__kbUi(nom)}</button>)}</div>
    <h3>{__kbUi("So‘zlar")}</h3>
    <div className="ss-toplamlar">{TOPLAMLAR.map(([k, e, nom, izoh]) => <button key={k} type="button" className={toplam === k ? "is-on" : ""} aria-pressed={toplam === k} onClick={() => { setToplam(k); setDaraja(k === "maktab" ? 1 : 3); }}>
      <span aria-hidden="true">{e}</span><b>{__kbUi(nom)}</b><small>{__kbUi(izoh)}</small></button>)}</div>
    <div className="ss-darajalar">{DARAJALAR[toplam].map(([d, nom]) => <button key={d} type="button" className={daraja === d ? "is-on" : ""} aria-pressed={daraja === d} onClick={() => setDaraja(d)}>{__kbUi(nom)}</button>)}</div>
    <p className="ss-izoh">{pool ? `${tayyor.length} ${__kbUi("ta so‘z")} · ${__kbUi("bugun ko‘rilgan")}: ${xotira.korilgan.length}` : __kbUi("Yuklanmoqda…")}</p>
    <button type="button" className="ss-asosiy" disabled={tayyor.length < 8} onClick={boshla}>▶ {__kbUi("Boshlash")}</button>
    <p className="ss-sinov">{__kbUi("Sinov bosqichi: tarjimalar tekshirilmoqda. Xato ko‘rsangiz, ustozga ayting.")}</p>
  </div></div>;

  return <div className="ss-root" role="dialog" aria-modal="true">{bosh}
    <div className="ss-yol"><i style={{ width: `${(i / raundlar.length) * 100}%` }} /></div>
    <div className="ss-oyin" key={i}>
      {r.tur === "juft" ? <><p className="ss-savol">{__kbUi("So‘zni bos, keyin rasmini top")}</p><Juft r={r} til={til} ayt={ayt} onTugadi={keyingi} /></>
        : <>
          {r.tur === "soz" ? <div className="ss-nishon-rasm"><Rasm x={r.nishon} /></div>
            : <button type="button" className={`ss-nishon-soz ${r.tur === "eshit" ? "is-eshit" : ""}`} onClick={() => ayt(soz(r.nishon, til), til)} aria-label={__kbUi("Yana eshitish")}>
              <span aria-hidden="true">🔊</span>{r.tur === "eshit" && !javob ? null : <b dir="auto">{soz(r.nishon, til)}</b>}</button>}
          <div className={`ss-variantlar ${r.tur === "soz" ? "is-soz" : "is-rasm"}`}>
            {r.variantlar.map((x) => { const holat = javob ? (x.k === r.nishon.k ? "is-togri" : x.k === javob.k ? "is-xato" : "is-ochiq") : "";
              return <button key={x.k} type="button" disabled={Boolean(javob)} className={holat} onClick={() => tanla(x)}>
                {r.tur === "soz" ? <b dir="auto">{soz(x, til)}</b> : <Rasm x={x} />}
                {javob && r.tur !== "soz" ? <small>{soz(x, "uz")}</small> : null}</button>; })}
          </div>
          {javob ? <p className={`ss-izoh-javob ${javob.togri ? "is-togri" : "is-xato"}`}><b dir="auto">{soz(r.nishon, til)}</b> — {soz(r.nishon, "uz")}</p> : null}
        </>}
    </div>
  </div>;
}
