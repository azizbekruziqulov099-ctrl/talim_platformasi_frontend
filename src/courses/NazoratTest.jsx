// REV479: kurs nazorati — mini-test, oraliq nazorat, oylik minimum, maksimum imtihon. Savollar qamrab olingan darslarning
// test bazalaridan; har savolga vaqt (yoshga qarab), rangli chiziq; natijada — o'tdi/o'tmadi va qaysi darslarni takrorlash kerak.
import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BoardText } from "../lesson/AmaliyDoska.jsx";
import { konikmaYoz } from "../lesson/konikmaYoz.js";   // REV480
import RobotKabu from "../kid/RobotKabu.jsx";   // REV485: bog'cha — Kabu bilan o'yin tarzida
import { ovozManbai, KABU_OVOZ } from "../kid/ovozOqi.js";

const vaqtSinf = (g) => { const m = /(\d+)/.exec(String(g || "")); const n = m ? Number(m[1]) : 0; return !n ? 45 : n <= 2 ? 30 : n <= 4 ? 40 : n <= 6 ? 50 : 60; };

export default function NazoratTest({ base, token, kurs, item, onYop }) {
  const [d, setD] = useState(null), [xato, setXato] = useState("");
  const [i, setI] = useState(0), [tanlov, setTanlov] = useState(null), [jav, setJav] = useState([]);
  const [qoldi, setQoldi] = useState(0), [yakun, setYakun] = useState(null);
  const oyin = Boolean(item.oyin);   // REV485: bog'cha — yozma test emas, Kabu o'qib beradi, katta rasmli tugmalar, raqamsiz vaqt
  const vaqt = oyin ? 25 : vaqtSinf(item.sinf || (kurs?.sinflar || [])[0]);
  const ovoz = useRef(null);
  if (oyin && !ovoz.current) ovoz.current = ovozManbai(base);
  const [kabuHol, setKabuHol] = useState("");
  const ayt = (t) => { if (oyin) try { ovoz.current?.oqi(String(t || "").replace(/\$/g, "").replace(/\[\/?[a-z]{2,3}\]/g, ""), KABU_OVOZ); } catch { /* */ } };
  useEffect(() => () => { try { ovoz.current?.stop?.(); } catch { /* */ } }, []);
  // REV483: halollik belgilari — avtomatik jazo YO'Q, faqat o'qituvchiga «diqqat» sifatida boradi
  const hal = useRef({ yashirildi: 0, yashirin_s: 0, nusxa: 0, tez_togri: 0, kamera: "" });
  const yashirinBosh = useRef(0);
  const [boshlandi, setBoshlandi] = useState(false);   // kamerali imtihonda — rozilikdan keyin
  const video = useRef(null), oqim = useRef(null);
  useEffect(() => {
    if (!boshlandi) return undefined;
    const kor = () => { if (document.visibilityState === "hidden") { hal.current.yashirildi += 1; yashirinBosh.current = Date.now(); }
      else if (yashirinBosh.current) { hal.current.yashirin_s += Math.round((Date.now() - yashirinBosh.current) / 1000); yashirinBosh.current = 0; } };
    const nus = () => { hal.current.nusxa += 1; };
    document.addEventListener("visibilitychange", kor); document.addEventListener("copy", nus);
    return () => { document.removeEventListener("visibilitychange", kor); document.removeEventListener("copy", nus); };
  }, [boshlandi]);
  const surat = () => {   // kichik JPEG (320×240) — o'qituvchiga
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = 320; c.height = Math.round(320 * v.videoHeight / v.videoWidth);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    fetch(`${base}/api/kurslar/nazorat_rasm`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fan: kurs.fan, grade: (kurs.sinflar || [])[0] || "", kod: item.topic_code, rasm: c.toDataURL("image/jpeg", 0.6) }) }).catch(() => {});
  };
  const kameraBilanBosh = async () => {
    try {
      oqim.current = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" }, audio: false });
      hal.current.kamera = "bor";
      setBoshlandi(true);
      setTimeout(() => { if (video.current) { video.current.srcObject = oqim.current; video.current.play().catch(() => {}); } }, 50);
    } catch { hal.current.kamera = "rad"; setBoshlandi(true); }
  };
  useEffect(() => {
    if (!boshlandi || hal.current.kamera !== "bor") return undefined;
    const t0 = setTimeout(surat, 4000);
    const id = setInterval(surat, 45000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [boshlandi]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { oqim.current?.getTracks?.().forEach((t) => t.stop()); }, []);
  useEffect(() => { if (d && !d.kamera) setBoshlandi(true); }, [d]);
  useEffect(() => {
    fetch(`${base}/api/kurslar/nazorat?${new URLSearchParams({ token, fan: kurs.fan, grade: (kurs.sinflar || [])[0] || "", kod: item.topic_code })}`)
      .then(async (r) => { const x = await r.json().catch(() => ({})); if (!r.ok) throw new Error(x.detail || `Xato ${r.status}`); setD(x); })
      .catch((e) => setXato(String(e.message || e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const S = d?.savollar || [], q = S[i];
  useEffect(() => { setQoldi(vaqt); setKabuHol(""); if (oyin && q && boshlandi) ayt(q.savol); }, [i, d, boshlandi]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!q || tanlov !== null || yakun || !boshlandi) return undefined;
    const t = setInterval(() => setQoldi((x) => { if (document.visibilityState !== "visible") return x; if (x <= 0.25) { clearInterval(t); javob(-1); return 0; } return x - 0.25; }), 250);
    return () => clearInterval(t);
  }, [q, tanlov, yakun, boshlandi]); // eslint-disable-line react-hooks/exhaustive-deps
  const javob = (k) => { if (tanlov !== null || !q) return; setTanlov(k);
    if (oyin) { setKabuHol(k === q.togri ? "xursand" : "oylaydi"); ayt(k === q.togri ? "Barakalla! To‘g‘ri!" : k === -1 ? "Vaqt tugadi. Mana to‘g‘ri javob." : "Yo‘q, mana bu to‘g‘ri."); }
    if (k === q.togri && vaqt - qoldi < 2.5 && String(q.savol || "").length > 25) hal.current.tez_togri += 1;   // REV483
    setJav((o) => [...o, { ok: k === q.togri, dars: q.dars, dars_nomi: q.dars_nomi, soniya: vaqt - qoldi, savol: String(q.savol || "").slice(0, 300) }]); };
  const keyingi = async () => {
    if (i + 1 < S.length) { setI(i + 1); setTanlov(null); return; }
    const togri = jav.filter((x) => x.ok).length;
    konikmaYoz(base, token, jav.map((x) => ({ savol: x.savol, togri: x.ok, soniya: x.soniya, chegara: vaqt })));   // REV480
    const xatoD = [...new Set(jav.filter((x) => !x.ok).map((x) => x.dars))];
    const r = await fetch(`${base}/api/kurslar/nazorat_natija`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fan: kurs.fan, grade: (kurs.sinflar || [])[0] || "", kod: item.topic_code, tur: d.tur, togri, jami: S.length, xato_darslar: xatoD, halollik: hal.current }) })
      .then((x) => x.json()).catch(() => ({}));
    oqim.current?.getTracks?.().forEach((t) => t.stop());   // kamera o'chadi
    setYakun({ togri, jami: S.length, ...r, xatoD: xatoD.map((tc) => jav.find((x) => x.dars === tc)?.dars_nomi || tc) });
  };
  if (xato) return <div className="nz"><p className="kk-xato">{xato}</p><button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Ortga")}</button></div>;
  if (!d) return <div className="nz"><p className="kk-p">⏳</p></div>;
  if (!S.length) return <div className="nz"><h2>{d.nomi}</h2><p>{__kbUi("Bu darslarda hali test savollari yo‘q.")}</p><button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Ortga")}</button></div>;
  if (yakun && oyin) { const yul = yakun.togri >= yakun.jami * 0.85 ? 3 : yakun.togri >= yakun.jami * 0.6 ? 2 : yakun.togri > 0 ? 1 : 0;
    return <div className="nz nz-yakun nz-oyin"><div className="nz-kabu"><RobotKabu mood={yakun.otdi ? "happy" : "think"} celebrate={yakun.otdi ? 1 : 0} /></div>
      <div className="nz-yulduz">{"⭐".repeat(yul)}{"☆".repeat(3 - yul)}</div>
      <h2>{yakun.otdi ? __kbUi("Zo‘r! Hammasini eslab qolibsan!") : __kbUi("Yaxshi harakat! Keyingi yakshanba yana o‘ynaymiz")}</h2>
      {yakun.xatoD.length > 0 && <p>{__kbUi("Kabu bilan shu darslarni yana ko‘rib chiqamiz:")} {yakun.xatoD.join(", ")}</p>}
      <button type="button" className="nz-btn" onClick={onYop}>🏠 {__kbUi("Darslarga")}</button></div>; }
  if (yakun) return <div className="nz nz-yakun">
    <div className="nz-belgi">{yakun.otdi ? "🏆" : "📚"}</div>
    <h2>{yakun.otdi ? __kbUi("Nazoratdan o‘tdingiz!") : __kbUi("Bu safar o‘tmadi")}</h2>
    <p className="nz-foiz"><b>{yakun.togri}</b> / {yakun.jami} · {yakun.foiz ?? Math.round((100 * yakun.togri) / yakun.jami)}% <small>({__kbUi("kerak")}: {yakun.kerak ?? d.otish_foiz}%)</small></p>
    {yakun.xatoD.length > 0 && <div className="nz-takror"><b>{__kbUi("Shu darslarni qayta ko‘rib chiqing:")}</b><ul>{yakun.xatoD.map((n) => <li key={n}>{n}</li>)}</ul></div>}
    {!yakun.otdi && <p className="nz-izoh">🌙 {__kbUi("Qayta topshirish — ertaga. Bugun xato qilgan darslaringizni takrorlang.")}</p>}
    <button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Kursga qaytish")}</button></div>;
  if (d.kamera && !boshlandi) return <div className="nz nz-yakun"><div className="nz-belgi">📷</div>
    <h2>{__kbUi("Bu imtihon kamera bilan")}</h2>
    <p>{__kbUi("Imtihon davomida har 45 soniyada kichik surat olinadi. Suratlarni faqat o‘qituvchingiz ko‘radi, 30 kundan keyin o‘chiriladi. Ovoz yozilmaydi.")}</p>
    <button type="button" className="nz-btn" onClick={kameraBilanBosh}>✅ {__kbUi("Roziman — boshlash")}</button>
    <button type="button" className="kk-ortga" onClick={onYop}>← {__kbUi("Ortga")}</button></div>;
  const u = qoldi / vaqt;
  if (oyin) return <div className="nz nz-oyin">
    <div className="nz-oyin-tepa"><div className="nz-kabu"><RobotKabu mood={kabuHol === "xursand" ? "happy" : kabuHol === "oylaydi" ? "think" : "talk"} celebrate={kabuHol === "xursand" ? i + 1 : 0} /></div>
      <div className="nz-oyin-savol"><BoardText text={String(q.savol || "").replace(/\[\/?[a-z]{2,3}\]/g, "")} />
        <button type="button" className="nz-tingla" onClick={() => ayt(q.savol)}>🔊</button></div></div>
    <div className="nz-vaqt is-oyin"><i style={{ width: `${Math.max(0, u * 100)}%`, background: u > 0.5 ? "#2e9e5b" : u > 0.25 ? "#f2b72e" : "#d9534f" }} /></div>
    <div className="nz-var is-oyin">{(q.variantlar || []).map((o, k) => <button key={k} type="button" disabled={tanlov !== null} onClick={() => javob(k)}
      className={tanlov === null ? "" : k === q.togri ? "is-ok" : k === tanlov ? "is-no" : ""}><BoardText text={String(o)} /></button>)}</div>
    <div className="nz-oyin-qadam">{S.map((_, k) => <i key={k} className={k < i ? "is-otdi" : k === i ? "is-hozir" : ""} />)}</div>
    {tanlov !== null && <button type="button" className="nz-btn" onClick={keyingi}>{i + 1 < S.length ? __kbUi("Keyingisi") : __kbUi("Tamom!")} ▶</button>}
  </div>;
  return <div className="nz">
    {hal.current.kamera === "bor" && <video ref={video} className="nz-kamera" muted playsInline aria-label={__kbUi("Kamera")} />}
    {hal.current.kamera === "rad" && <p className="nz-izoh">⚠️ {__kbUi("Kamera yoqilmadi — o‘qituvchingizga shu haqda xabar boradi.")}</p>}
    <div className="nz-tepa"><button type="button" className="kk-ortga" onClick={onYop}>←</button><b>{d.nomi}</b><span>{i + 1} / {S.length}</span></div>
    <div className="nz-vaqt"><i style={{ width: `${Math.max(0, u * 100)}%`, background: u > 0.5 ? "#2e9e5b" : u > 0.25 ? "#f2b72e" : "#d9534f" }} /><b>{Math.ceil(qoldi)} s</b></div>
    <div className="nz-savol"><BoardText text={String(q.savol || "").replace(/\[\/?[a-z]{2,3}\]/g, "")} /></div>
    <div className="nz-var">{(q.variantlar || []).map((o, k) => <button key={k} type="button" disabled={tanlov !== null} onClick={() => javob(k)}
      className={tanlov === null ? "" : k === q.togri ? "is-ok" : k === tanlov ? "is-no" : ""}>{"ABCDEF"[k]}) <BoardText text={String(o)} /></button>)}</div>
    {tanlov !== null && <div className="nz-fikr">{tanlov === -1 ? __kbUi("⏰ Vaqt tugadi.") : tanlov === q.togri ? __kbUi("✅ To‘g‘ri!") : __kbUi("❌ Noto‘g‘ri.")}
      {q.izoh && tanlov !== q.togri && <div className="nz-izoh"><BoardText text={String(q.izoh)} /></div>}
      <button type="button" className="nz-btn" onClick={keyingi}>{i + 1 < S.length ? __kbUi("Keyingi") : __kbUi("Natija")} →</button></div>}
  </div>;
}
