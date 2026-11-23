// REV695: «So'z sandig'i» — rasmli so'z bazasidan til o'yini (10 til). Hammasi qurilmada; serverdan faqat rasm va ovoz olinadi.
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { ORGANISH_TILLARI, oyinYasa, gapOyinYasa, gapTokenlar, gapMatn, gapTogri, saralash, soz, ovozMatni, tangaHisobi, xotiraOl, xotiraYoz, darsYasa, darsYakun, darsStat, darsOl, darsYoz, darsBirlashtir } from "./sozRules.js";
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

// REV696: «Gap tuz» — rasm va aralash so'zlar; bola so'zlarni bosib gapni teradi
// «Bo'sh joy»: gap ko'rinadi, bitta so'z o'rni bo'sh — to'g'risini tanlaydi
function GapToldir({ r, til, ayt, onTugadi }) {
  const [tanlangan, setTanlangan] = useState(null);
  const tok = gapTokenlar(r.gap, til);
  const bosh = tok.map((t, n) => (n === r.bosh ? "＿＿＿" : t));
  const tanla = (v) => { if (tanlangan !== null) return; setTanlangan(v); const togri = v === r.togri; if (togri) ayt(gapMatn(tok, til), til); setTimeout(() => onTugadi(togri), togri ? 1300 : 1900); };
  return <div className="ss-gap">
    <div className="ss-nishon-rasm ss-gap-rasm"><Rasm x={r.nishon} /></div>
    <p className="ss-gap-izoh">{gapMatn(gapTokenlar(r.gap, "uz"), "uz")}</p>
    <div className="ss-gap-qator" dir={til === "ar" ? "rtl" : "ltr"}><b dir="auto">{gapMatn(tanlangan === null ? bosh : tok, til)}</b></div>
    <div className="ss-gap-sozlar" dir={til === "ar" ? "rtl" : "ltr"}>{r.variantlar.map((v) => <button key={v} type="button" disabled={tanlangan !== null} className={tanlangan === null ? "" : v === r.togri ? "is-togri" : v === tanlangan ? "is-xato" : "is-ochiq"} onClick={() => tanla(v)}>{v}</button>)}</div>
  </div>;
}
function GapTuz({ r, til, ayt, onTugadi }) {
  const [tanlov, setTanlov] = useState([]);          // aralash ro'yxatdagi indekslar
  const [holat, setHolat] = useState("");
  const xatoBor = useRef(false);
  const togriMatn = gapMatn(gapTokenlar(r.gap, til), til);
  const tekshir = () => {
    if (holat === "togri") return;
    if (gapTogri(tanlov.map((n) => r.aralash[n]), r.gap, til)) { setHolat("togri"); ayt(togriMatn, til); setTimeout(() => onTugadi(!xatoBor.current), 1500); }
    else { xatoBor.current = true; setHolat("xato"); setTimeout(() => setHolat(""), 700); }
  };
  const korsat = () => { xatoBor.current = true; setHolat("korsat"); ayt(togriMatn, til); setTimeout(() => onTugadi(false), 2600); };
  const band = holat === "togri" || holat === "korsat";
  return <div className="ss-gap">
    <div className="ss-nishon-rasm ss-gap-rasm"><Rasm x={r.nishon} /></div>
    <p className="ss-gap-izoh">{gapMatn(gapTokenlar(r.gap, "uz"), "uz")}</p>
    <div className={`ss-gap-qator ${holat ? `is-${holat}` : ""}`} dir={til === "ar" ? "rtl" : "ltr"}>
      {holat === "korsat" ? <b>{togriMatn}</b> : tanlov.length ? tanlov.map((n) => <button key={n} type="button" disabled={band} onClick={() => setTanlov(tanlov.filter((v) => v !== n))}>{r.aralash[n]}</button>) : <i>{__kbUi("So‘zlarni tartib bilan bos")}</i>}
    </div>
    <div className="ss-gap-sozlar" dir={til === "ar" ? "rtl" : "ltr"}>{r.aralash.map((t, n) => <button key={n} type="button" disabled={band || tanlov.includes(n)} onClick={() => setTanlov([...tanlov, n])}>{t}</button>)}</div>
    <div className="ss-gap-tugma">
      <button type="button" className="ss-ikkinchi" disabled={band} onClick={korsat}>{__kbUi("Ko‘rsat")}</button>
      <button type="button" className="ss-asosiy" disabled={band || tanlov.length !== r.aralash.length} onClick={tekshir}>{__kbUi("Tekshir")}</button>
    </div>
  </div>;
}

// REV702: holat serverda ham saqlanadi (faqat kalit → [quti, kun]); tarmoq bo'lmasa qurilmadagi holat ishlayveradi
const sozApi = (token, yol, body) => fetch(`${API}/api/soz/holat${yol}`, { method: body ? "POST" : "GET", cache: "no-store",
  headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));

export default function SozSandiq({ onClose, token = "" }) {
  const [til, setTil] = useState(() => { try { return localStorage.getItem("kb_soz_til") || "en"; } catch { return "en"; } });
  const [toplam, setToplam] = useState("bolalar");
  const [oyin, setOyin] = useState("dars");          // dars | soz | gap
  const [gaplar, setGaplar] = useState(null);
  useEffect(() => { if (!gaplar) import("./data/gaplar.json").then((m) => setGaplar(m.default || m)).catch(() => setGaplar([])); }, [oyin, gaplar]);
  const [daraja, setDaraja] = useState(3);
  const [sinf, setSinf] = useState(() => { try { return Math.min(11, Math.max(1, Number(localStorage.getItem("kb_soz_sinf")) || 1)); } catch { return 1; } });
  const maktabmi = toplam === "maktab";
  const [pool, setPool] = useState(null);
  const [raundlar, setRaundlar] = useState(null);
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);          // { k, togri }
  const [natijalar, setNatijalar] = useState([]);
  const [yakun, setYakun] = useState(null);
  const ayt = useOvoz();

  useEffect(() => { let bekor = false; setPool(null); yuklaToplam(toplam).then((d) => { if (!bekor) setPool(d); }).catch(() => { if (!bekor) setPool([]); }); return () => { bekor = true; }; }, [toplam]);
  const tayyor = useMemo(() => (pool ? saralash(pool, maktabmi ? (oyin === "dars" ? {} : { sinf }) : { daraja: oyin === "dars" || daraja === 3 ? 0 : daraja }) : []), [pool, daraja, toplam, oyin, sinf, maktabmi]);
  const xKalit = oyin === "gap" ? `${til}:gap` : til;
  const [sinx, setSinx] = useState(0);
  useEffect(() => {   // tilni ochganda: serverdagi holat qurilmadagisi bilan birlashadi
    if (!token) return undefined; let bekor = false;
    sozApi(token, `?${new URLSearchParams({ til })}`).then((d) => { if (bekor) return; darsYoz(til, darsBirlashtir(darsOl(til), { s: d.s || {} })); setSinx((n) => n + 1); }).catch(() => {});
    return () => { bekor = true; };
  }, [token, til]);
  const darsHovuz = useMemo(() => (maktabmi ? saralash(tayyor, { sinf, aniq: true }) : tayyor), [tayyor, sinf, maktabmi]);
  const dStat = useMemo(() => darsStat(darsHovuz, darsOl(til)), [darsHovuz, til, yakun, sinx]);
  const xotira = useMemo(() => xotiraOl(xKalit), [xKalit, yakun]);
  const gapSoni = useMemo(() => (gaplar && pool ? gaplar.filter((g) => tayyor.some((x) => x.k === g.k)).length : 0), [gaplar, pool, tayyor]);

  const boshla = () => {
    try { localStorage.setItem("kb_soz_til", til); localStorage.setItem("kb_soz_sinf", String(sinf)); } catch { /* */ }
    const h = xotiraOl(xKalit);
    setRaundlar(oyin === "dars" ? darsYasa(tayyor, darsOl(til), { til, izoh: "uz", gaplar: gaplar || [], sinf: maktabmi ? sinf : 0 }).raundlar : oyin === "gap" ? gapOyinYasa(gaplar || [], tayyor, { til, izoh: "uz", korilgan: h.korilgan, xatolar: h.xatolar })
      : oyinYasa(tayyor, { til, izoh: "uz", korilgan: h.korilgan, xatolar: h.xatolar })); setI(0); setJavob(null); setNatijalar([]); setYakun(null);
  };
  const r = raundlar?.[i];
  const nishonMatn = r ? (r.tur === "gaprasm" ? gapMatn(gapTokenlar(r.gap, til), til) : soz(r.nishon, til)) : "";
  const nishonIzoh = r ? (r.tur === "gaprasm" ? gapMatn(gapTokenlar(r.gap, "uz"), "uz") : soz(r.nishon, "uz")) : "";
  const sozVariant = r?.tur === "soz" || r?.tur === "tarjima";
  useEffect(() => { if (r && (r.tur === "eshit" || r.tur === "rasm" || r.tur === "gaprasm" || r.tur === "tanish")) { const t = setTimeout(() => ayt(nishonMatn, til), 350); return () => clearTimeout(t); } return undefined; }, [r, til, ayt, nishonMatn]);

  const keyingi = (togri) => {
    const yangi = [...natijalar, togri];
    setNatijalar(yangi); setJavob(null);
    if (i + 1 < raundlar.length) { setI(i + 1); return; }
    if (oyin === "dars") {
      const dh = darsYakun(darsOl(til), raundlar, yangi); darsYoz(til, dh);
      if (token) sozApi(token, "", { til, s: dh.s }).catch(() => {});
      const baho = yangi.filter((_, n) => raundlar[n].tur !== "tanish");
      const tangaD = tangaHisobi(baho); const profilD = joriyProfil();
      const qd = tangaQosh(orolYukla(profilD), `soz-dars-${til}-${Date.now()}`, tangaD); if (qd.qoshildi) orolSaqla(profilD, qd.holat);
      setYakun({ togri: baho.filter(Boolean).length, jami: baho.length, tanga: tangaD, dars: true });
      return;
    }
    const kalit = raundlar.map((x) => x.nishon.k);
    xotiraYoz(xKalit, { korildi: kalit, xato: kalit.filter((_, n) => !yangi[n]), togri: kalit.filter((_, n) => yangi[n]) });
    const tanga = tangaHisobi(yangi); const profil = joriyProfil();
    const q = tangaQosh(orolYukla(profil), `soz-${xKalit}-${Date.now()}`, tanga); if (q.qoshildi) orolSaqla(profil, q.holat);
    setYakun({ togri: yangi.filter(Boolean).length, jami: yangi.length, tanga });
  };
  const tanla = (x) => {
    if (javob) return;
    const togri = x.k === r.nishon.k;
    setJavob({ k: x.k, togri });
    if (sozVariant || togri) ayt(nishonMatn, til);
    setTimeout(() => keyingi(togri), togri ? 900 : 1900);
  };

  const bosh = <header className="ss-bosh"><button type="button" className="ss-yop" onClick={raundlar && !yakun ? () => setRaundlar(null) : onClose} aria-label={__kbUi("Orqaga")}>←</button>
    <b>🧰 {__kbUi("So‘z sandig‘i")}</b>{raundlar && !yakun ? <span className="ss-hisob">{i + 1}/{raundlar.length}</span> : <span className="ss-hisob">⭐ {xotira.jami}</span>}</header>;

  if (yakun) return <div className="ss-root" role="dialog" aria-modal="true">{bosh}<div className="ss-yakun">
    <div className="ss-yakun-son">{yakun.togri}/{yakun.jami}</div>
    <p>{yakun.togri === yakun.jami ? __kbUi("Zo‘r! Hammasi to‘g‘ri!") : __kbUi("Yaxshi! Xato qilgan so‘zlaring keyingi o‘yinda qaytadi.")}</p>
    <div className="ss-tanga">🪙 +{yakun.tanga} {__kbUi("tanga — Kabu oroliga")}</div>
    {yakun.dars ? <p className="ss-izoh">{__kbUi("O‘rganildi")}: {dStat.organilgan} / {dStat.jami} · {__kbUi("boshlangan")}: {dStat.boshlangan}</p> : null}
    <button type="button" className="ss-asosiy" onClick={boshla}>{yakun.dars ? __kbUi("Keyingi dars") : __kbUi("Yana o‘ynash — yangi so‘zlar")}</button>
    <button type="button" className="ss-ikkinchi" onClick={() => { setRaundlar(null); setYakun(null); }}>{__kbUi("Tilni almashtirish")}</button>
  </div></div>;

  if (!raundlar || !raundlar.length) return <div className="ss-root" role="dialog" aria-modal="true">{bosh}<div className="ss-sozlama">
    <h3>{__kbUi("Qaysi tilni o‘rganamiz?")}</h3>
    <div className="ss-tillar">{ORGANISH_TILLARI.map(([k, bayroq, nom]) => <button key={k} type="button" className={til === k ? "is-on" : ""} aria-pressed={til === k} onClick={() => setTil(k)}><span aria-hidden="true">{bayroq}</span>{__kbUi(nom)}</button>)}</div>
    <><h3>{__kbUi("Nima qilamiz?")}</h3>
    <div className="ss-darajalar ss-oyin-turi">{[["dars", "📚", "Dars"], ["soz", "🔤", "So‘z o‘yini"], ...(gaplar?.length >= 4 ? [["gap", "💬", "Gaplar"]] : [])].map(([k, e, nom]) => <button key={k} type="button" className={oyin === k ? "is-on" : ""} aria-pressed={oyin === k} onClick={() => setOyin(k)}><span aria-hidden="true">{e}</span> {__kbUi(nom)}</button>)}</div></>
    <h3>{__kbUi("So‘zlar")}</h3>
    <div className="ss-toplamlar">{TOPLAMLAR.map(([k, e, nom, izoh]) => <button key={k} type="button" className={toplam === k ? "is-on" : ""} aria-pressed={toplam === k} onClick={() => { setToplam(k); setDaraja(k === "maktab" ? 1 : 3); }}>
      <span aria-hidden="true">{e}</span><b>{__kbUi(nom)}</b><small>{__kbUi(izoh)}</small></button>)}</div>
    {maktabmi ? <div className="ss-sinflar" role="group" aria-label={__kbUi("Sinf")}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => <button key={n} type="button" className={sinf === n ? "is-on" : ""} aria-pressed={sinf === n} onClick={() => setSinf(n)}>{n}</button>)}<small>{__kbUi("sinf")}</small></div> : null}
    <div className="ss-darajalar" hidden={oyin === "dars" || maktabmi}>{DARAJALAR[toplam].map(([d, nom]) => <button key={d} type="button" className={daraja === d ? "is-on" : ""} aria-pressed={daraja === d} onClick={() => setDaraja(d)}>{__kbUi(nom)}</button>)}</div>
    {oyin === "dars" && pool ? <div className="ss-dars-stat"><b>{maktabmi ? `${sinf}-${__kbUi("sinf")} · ` : ""}{dStat.dars}-{__kbUi("dars")}</b><span>{__kbUi("O‘rganildi")}: {dStat.organilgan} / {dStat.jami}</span><span>{__kbUi("Bugun takrorga")}: {dStat.takror}</span>
      <div className="ss-yol"><i style={{ width: `${dStat.jami ? (dStat.boshlangan / dStat.jami) * 100 : 0}%` }} /></div>
      <small>{__kbUi("Har darsda 6 ta yangi so‘z va eskilarining takrori. Kuniga 1–2 dars yetarli.")}</small></div> : null}
    <p className="ss-izoh">{oyin === "dars" ? "" : !pool || (oyin === "gap" && !gaplar) ? __kbUi("Yuklanmoqda…") : oyin === "gap" ? `${gapSoni} ${__kbUi("ta gap")} · ${__kbUi("bugun ko‘rilgan")}: ${xotira.korilgan.length}` : `${tayyor.length} ${__kbUi("ta so‘z")} · ${__kbUi("bugun ko‘rilgan")}: ${xotira.korilgan.length}`}</p>
    {oyin === "gap" && gaplar && pool && gapSoni < 4 ? <p className="ss-sinov">{__kbUi("Bu to‘plam uchun gaplar hali tayyor emas — «Bolalar so‘zlari»ni tanlang.")}</p> : null}
    <button type="button" className="ss-asosiy" disabled={tayyor.length < 8 || (oyin === "gap" && gapSoni < 4)} onClick={boshla}>▶ {__kbUi("Boshlash")}</button>
    <p className="ss-sinov">{__kbUi("Sinov bosqichi: tarjimalar tekshirilmoqda. Xato ko‘rsangiz, ustozga ayting.")}</p>
  </div></div>;

  return <div className="ss-root" role="dialog" aria-modal="true">{bosh}
    <div className="ss-yol"><i style={{ width: `${(i / raundlar.length) * 100}%` }} /></div>
    <div className="ss-oyin" key={i}>
      {r.tur === "tanish" ? <div className="ss-tanish">
          <p className="ss-savol">{__kbUi("Yangi so‘z")}</p>
          {r.nishon.m ? null : <div className="ss-nishon-rasm"><Rasm x={r.nishon} /></div>}
          <button type="button" className="ss-nishon-soz" onClick={() => ayt(nishonMatn, til)} aria-label={__kbUi("Yana eshitish")}><span aria-hidden="true">🔊</span><b dir="auto">{nishonMatn}</b></button>
          <p className="ss-tanish-uz">{nishonIzoh}</p>
          <button type="button" className="ss-asosiy" onClick={() => keyingi(true)}>{__kbUi("Tushundim")} →</button>
        </div>
        : r.tur === "juft" ? <><p className="ss-savol">{__kbUi("So‘zni bos, keyin rasmini top")}</p><Juft r={r} til={til} ayt={ayt} onTugadi={keyingi} /></>
        : r.tur === "toldir" ? <><p className="ss-savol">{__kbUi("Gapni to‘ldir")}</p><GapToldir r={r} til={til} ayt={ayt} onTugadi={keyingi} /></>
        : r.tur === "tuz" ? <><p className="ss-savol">{__kbUi("Rasmga qarab gap tuz")}</p><GapTuz r={r} til={til} ayt={ayt} onTugadi={keyingi} /></>
        : <>
          {r.tur === "soz" ? <div className="ss-nishon-rasm"><Rasm x={r.nishon} /></div>
            : r.tur === "tarjima" ? <div className="ss-nishon-soz ss-tarjima"><b>{soz(r.nishon, "uz")}</b></div>
            : <button type="button" className={`ss-nishon-soz ${r.tur === "eshit" ? "is-eshit" : ""}`} onClick={() => ayt(nishonMatn, til)} aria-label={__kbUi("Yana eshitish")}>
              <span aria-hidden="true">🔊</span>{r.tur === "eshit" && !javob ? null : <b dir="auto">{nishonMatn}</b>}</button>}
          <div className={`ss-variantlar ${sozVariant ? "is-soz" : "is-rasm"}`}>
            {r.variantlar.map((x) => { const holat = javob ? (x.k === r.nishon.k ? "is-togri" : x.k === javob.k ? "is-xato" : "is-ochiq") : "";
              return <button key={x.k} type="button" disabled={Boolean(javob)} className={holat} onClick={() => tanla(x)}>
                {sozVariant ? <b dir="auto">{soz(x, til)}</b> : <Rasm x={x} />}
                {javob && !sozVariant ? <small>{soz(x, "uz")}</small> : null}</button>; })}
          </div>
          {javob ? <p className={`ss-izoh-javob ${javob.togri ? "is-togri" : "is-xato"}`}><b dir="auto">{nishonMatn}</b> — {nishonIzoh}</p> : null}
        </>}
    </div>
  </div>;
}
