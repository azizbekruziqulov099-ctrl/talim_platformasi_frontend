import React, { useCallback, useEffect, useRef, useState } from "react";
import { Coins, X, Copy, Check } from "lucide-react";
import "./kapulHamyon.css";

// v710: har bir akaunt (o'qituvchi, o'quvchi, ota-ona) uchun KAPUL hamyoni: balans, to'ldirish (noyob summa), tarix.
const BASE = (a) => String(a || "").replace(/\/+$/, "");
async function api(apiBase, token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE(apiBase)}${path}`, { method, cache: "no-store",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : `Xatolik (${res.status})`);
  return data;
}
export const kapulSabab = (s = "") => (s.startsWith("qaytarildi:") ? "Qaytarildi · " : "") + ({ sovga: "Sovg‘a", ppt: "PPT tayyorlash", ochiq_dars: "Ochiq dars", tolov: "To‘lov", sotish: "Qaytarib sotish", admin: "Administrator" }[s.replace("qaytarildi:", "")] || s);
const so = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/ /g, " ");
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Nusxa({ matn, label }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="kh-nusxa" aria-label={`${label} nusxalash`}
    onClick={() => { navigator.clipboard?.writeText(matn).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); }).catch(() => {}); }}>
    {ok ? <Check size={16} /> : <Copy size={16} />}</button>;
}

export default function KapulHamyon({ apiBase = "", token = "", yangila = 0, narx = 0, className = "" }) {
  const [k, setK] = useState(null);
  const [ochiq, setOchiq] = useState(false);
  const [son, setSon] = useState(20);
  const [bur, setBur] = useState(null);
  const [xato, setXato] = useState("");
  const [band, setBand] = useState(false);
  const [shart, setShart] = useState(null);   // v716: sotib olish/sotish shartlari
  const [rozi, setRozi] = useState(false);
  const [qoldi, setQoldi] = useState(0);
  const [sk, setSk] = useState({ kapul: "", karta: "", xabar: "", band: false });
  useEffect(() => { if (ochiq && !shart) api(apiBase, token, "/api/kapul/shartlar").then(setShart).catch(() => {}); }, [ochiq]); // eslint-disable-line react-hooks/exhaustive-deps
  const yukla = useCallback(() => api(apiBase, token, "/api/kapul/holat").then(setK).catch(() => {}), [apiBase, token]);
  useEffect(() => { if (token) yukla(); }, [yukla, yangila, token]);

  // buyurtma holatini 4 soniyada tekshirib turadi; soat — har soniya
  const burRef = useRef(null); burRef.current = bur;
  useEffect(() => {
    if (!bur || bur.holat !== "kutilmoqda") return undefined;
    setQoldi(bur.qoldi);
    const soat = setInterval(() => setQoldi((x) => Math.max(0, x - 1)), 1000);
    const sorov = setInterval(async () => {
      try { const r = await api(apiBase, token, `/api/kapul/buyurtma/${burRef.current.id}`); setBur(r); if (r.holat === "tolandi") yukla(); } catch { /* keyingi urinish */ }
    }, 4000);
    return () => { clearInterval(soat); clearInterval(sorov); };
  }, [bur?.id, bur?.holat]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!token || !k) return null;
  const kam = narx && k.balans < narx;
  const olish = async () => {
    setBand(true); setXato("");
    try { setBur(await api(apiBase, token, "/api/kapul/buyurtma", { method: "POST", body: { kapul: Number(son), shart: true, versiya: shart?.versiya } })); }
    catch (e) { setXato(e.message); } finally { setBand(false); }
  };
  const bekor = async () => { try { await api(apiBase, token, `/api/kapul/buyurtma/${bur.id}/bekor`, { method: "POST" }); } catch { /* */ } setBur(null); };
  const som = k.kapul_som || 1000;
  const sotuv = k.sotib_olish_narx || som;

  return <>
    <button type="button" className={`kh-belgi ${kam ? "kam" : ""} ${className}`} onClick={() => { setOchiq(true); yukla(); }}
      title={`1 kapul = ${so(som)} so‘m. Bosib hamyonni oching`}>
      <Coins size={15} /> {k.balans} kapul
    </button>
    {ochiq && <div className="kh-fon" role="dialog" aria-modal="true" aria-label="Kapul hamyoni" onClick={(e) => { if (e.target === e.currentTarget) setOchiq(false); }}>
      <div className="kh-oyna">
        <button type="button" className="kh-yop" aria-label="Yopish" onClick={() => setOchiq(false)}><X size={20} /></button>
        <h3>🪙 Kapul hamyonim</h3>
        <div className="kh-balans"><b>{k.balans}</b> kapul <span>≈ {so(k.balans * som)} so‘m</span></div>
        <p className="kh-narx">1 kapul = {so(som)} so‘m · PPT: har 10 slayd = {k.narx.ppt_10_slayd} kapul · Ochiq dars (AI) = {k.narx.ochiq_dars} kapul</p>

        {shart && !bur && <div className="kh-blok kh-shart">
          <details>
            <summary>📄 Sotib olish va sotish shartlari</summary>
            {shart.sotuvchi && <p className="kh-narx">Sotuvchi: {shart.sotuvchi}</p>}
            <ol>{shart.band.map((b, i) => <li key={i}>{b}</li>)}</ol>
          </details>
          <label className="kh-rozi"><input type="checkbox" checked={rozi} onChange={(e) => setRozi(e.target.checked)} /> Shartlarni o‘qidim va qabul qilaman</label>
        </div>}

        {!bur && (k.tolov_yoqilgan ? <div className="kh-blok">
          <h4>Kapul sotib olish</h4>
          <div className="kh-chips">{[10, 20, 50, 100].map((n) => <button key={n} type="button" className={Number(son) === n ? "on" : ""} onClick={() => setSon(n)}>{n}</button>)}</div>
          <label className="kh-m">Yoki o‘zingiz yozing
            <input type="number" min="1" max="1000" value={son} onChange={(e) => setSon(e.target.value)} /></label>
          <p className="kh-narx">1 kapul = {so(sotuv)} so‘m. Taxminan {so(Number(son || 0) * sotuv)} so‘m. Aniq summani keyingi oynada ko‘rasiz.</p>
          {xato && <p className="kh-xato" role="alert">{xato}</p>}
          <button type="button" className="kh-asosiy" disabled={band || !rozi || !(Number(son) >= 1)} onClick={olish}>{band ? "Kutib turing…" : "To‘lov summasini olish"}</button>
        </div> : <p className="kh-narx">Kapul sotib olish tez orada yoqiladi.</p>)}

        {bur && bur.holat === "kutilmoqda" && <div className="kh-blok">
          <h4>{bur.kapul} kapul uchun to‘lov</h4>
          <p className="kh-ogoh">Kartaga <b>aynan shu summani</b> o‘tkazing — bir so‘m ham ko‘p yoki kam bo‘lmasin. Kapul avtomatik tushadi.</p>
          <div className="kh-summa"><b>{so(bur.summa)}</b> so‘m <Nusxa matn={String(bur.summa)} label="Summa" /></div>
          <div className="kh-karta"><span>{bur.karta_raqam}</span> <Nusxa matn={bur.karta_raqam.replace(/\s/g, "")} label="Karta raqami" /></div>
          {bur.karta_egasi && <p className="kh-narx">Karta egasi: {bur.karta_egasi}</p>}
          <p className="kh-vaqt">{qoldi > 0 ? `Summa ${mmss(qoldi)} gacha sizga biriktirilgan` : "Vaqt tugadi. To‘lagan bo‘lsangiz ham kapul tushadi — biroz kuting."}</p>
          <p className="kh-narx">To‘lovni kutyapmiz… sahifani yopsangiz ham bo‘ladi.</p>
          <button type="button" className="kh-ikkinchi" onClick={bekor}>Bekor qilish</button>
        </div>}

        {bur && bur.holat === "tolandi" && <div className="kh-blok kh-ok"><h4>✅ To‘lov qabul qilindi</h4><p>Hisobingizga {bur.kapul} kapul qo‘shildi.</p>
          <button type="button" className="kh-asosiy" onClick={() => setBur(null)}>Yaxshi</button></div>}
        {bur && (bur.holat === "muddati" || bur.holat === "bekor") && <div className="kh-blok"><p>Buyurtma yopildi. Pul o‘tkazgan bo‘lsangiz — 24 soat ichida kapul tushadi.</p>
          <button type="button" className="kh-ikkinchi" onClick={() => setBur(null)}>Orqaga</button></div>}

        {k.sotiladigan >= (k.yechish_min || 1) && !bur && <div className="kh-blok">
          <h4>Kapulni qaytarib sotish</h4>
          <p className="kh-narx">Siz sotib olgan <b>{k.sotiladigan}</b> kapulni qaytarib sotishingiz mumkin: 1 kapul = {so(k.qaytarish_narx)} so‘m. Sovg‘a kapul sotilmaydi. Kamida {k.yechish_min} kapul.</p>
          <label className="kh-m">Necha kapul
            <input type="number" min={k.yechish_min} max={k.sotiladigan} value={sk.kapul} onChange={(e) => setSk({ ...sk, kapul: e.target.value, xabar: "" })} /></label>
          <label className="kh-m">Pul tushadigan karta (16 raqam)
            <input type="text" inputMode="numeric" placeholder="8600 0000 0000 0000" value={sk.karta} onChange={(e) => setSk({ ...sk, karta: e.target.value, xabar: "" })} /></label>
          {Number(sk.kapul) > 0 && <p className="kh-narx">Olasiz: {so(Number(sk.kapul) * k.qaytarish_narx)} so‘m</p>}
          {sk.xabar && <p className={sk.xabar.startsWith("✅") ? "kh-ok-xabar" : "kh-xato"} role="status">{sk.xabar}</p>}
          <button type="button" className="kh-ikkinchi" disabled={sk.band || !rozi || !(Number(sk.kapul) >= 1) || !sk.karta}
            onClick={async () => { setSk((x) => ({ ...x, band: true, xabar: "" }));
              try { const r = await api(apiBase, token, "/api/kapul/sotish", { method: "POST", body: { kapul: Number(sk.kapul), karta: sk.karta, shart: true, versiya: shart?.versiya } });
                setSk({ kapul: "", karta: "", band: false, xabar: `✅ So‘rov yuborildi: ${so(r.summa)} so‘m kartangizga o‘tkaziladi.` }); yukla(); }
              catch (e) { setSk((x) => ({ ...x, band: false, xabar: e.message })); } }}>{sk.band ? "Kutib turing…" : "Sotish so‘rovini yuborish"}</button>
        </div>}

        <div className="kh-blok">
          <h4>Oxirgi amallar</h4>
          {k.jurnal.length ? <ul className="kh-jurnal">{k.jurnal.slice(0, 8).map((j, i) => <li key={i}><span>{kapulSabab(j.sabab)}</span><b className={j.delta > 0 ? "p" : "m"}>{j.delta > 0 ? "+" : ""}{j.delta}</b></li>)}</ul> : <p className="kh-narx">Hali amal yo‘q.</p>}
        </div>
      </div>
    </div>}
  </>;
}
