import React, { useCallback, useEffect, useState } from "react";
import "./kapulAdmin.css";

// v710: admin — KAPUL narxlari, to'lov (karta + SMS uzatgich), qo'lda qo'shish, buyurtmalar va kelgan SMS'lar.
const BASE = (a) => String(a || "").replace(/\/+$/, "");
async function api(apiBase, token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE(apiBase)}${path}`, { method, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const d = data?.detail; throw new Error(typeof d === "string" ? d : d?.xabar || `Server xatosi (${res.status})`); }
  return data;
}
const so = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/ /g, " ");
const HOLAT = { kutilmoqda: "⏳ kutilmoqda", tolandi: "✅ to‘langan", muddati: "⌛ muddati o‘tdi", bekor: "✖ bekor" };
const SMS_NATIJA = { tolandi: "✅ kapul qo‘shildi", takror: "↻ takror (e’tiborsiz)", chiqim: "➖ chiqim (e’tiborsiz)", topilmadi: "❓ mos buyurtma topilmadi", bosh: "—" };

export default function KapulAdmin({ apiBase = "", token = "" }) {
  const [d, setD] = useState(null);
  const [f, setF] = useState({});
  const [xabar, setXabar] = useState("");
  const [band, setBand] = useState(false);
  const [qo, setQo] = useState({ uid: "", kapul: "" });
  const yukla = useCallback(async () => {
    try { const r = await api(apiBase, token, "/api/kapul/admin"); setD(r); setF(r.sozlama); }
    catch (e) { setXabar(e.message); }
  }, [apiBase, token]);
  useEffect(() => { yukla(); }, [yukla]);
  if (!d) return <section className="ka"><p>{xabar || "Yuklanmoqda…"}</p></section>;

  const saqla = async (kalitlar) => {
    setBand(true); setXabar("");
    try { const body = {}; kalitlar.forEach((k) => { body[k] = f[k]; });
      await api(apiBase, token, "/api/kapul/admin/sozlama", { method: "POST", body }); setXabar("✅ Saqlandi"); await yukla(); }
    catch (e) { setXabar("⚠ " + e.message); } finally { setBand(false); }
  };
  const maydon = (k, label, yordam, turi = "number") => (
    <label className="ka-m"><span>{label}</span>
      <input type={turi} min="0" value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      {yordam && <small>{yordam}</small>}</label>);
  const som = Number(f.som) || 1000;
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/api/kapul/sms`;
  const yoq = !!d.sozlama.karta_raqam;

  return <section className="ka">
    <h2>🪙 Kapul — narxlar va to‘lov</h2>
    {xabar && <div className="ka-xabar" role="status">{xabar}</div>}

    <div className="ka-jami">
      <div><b>{so(d.jami.hamyonlarda)}</b><span>kapul hamyonlarda</span></div>
      <div><b>{so(d.jami.hamyonlar)}</b><span>hamyon (akaunt)</span></div>
      <div><b>{so(d.jami.sotilgan_kapul)}</b><span>sotilgan kapul ({so(d.jami.tolovlar)} ta to‘lov)</span></div>
      <div><b>{so(d.jami.sotilgan_kapul * som)}</b><span>so‘m tushum (taxminan)</span></div>
    </div>

    <div className="ka-karta">
      <h3>1. Narxlar</h3>
      <p className="ka-tushuncha">Hamma narx <b>kapul</b>da. Bitta kapul necha so‘m ekanini pastda belgilaysiz — qolgan hamma joyda shu hisoblanadi.</p>
      <div className="ka-grid">
        {maydon("som", "1 kapul = necha so‘m", `Hozir: 1 kapul = ${so(som)} so‘m`)}
        {maydon("sovga", "Yangi akauntga sovg‘a (kapul)", `Yangi ochilgan har bir hamyonga ${f.sovga || 0} kapul (${so((f.sovga || 0) * som)} so‘m) beriladi. Faqat yangilariga ta’sir qiladi.`)}
        {maydon("ppt_10_slayd", "PPT: har 10 slayd = necha kapul", `Misol: 25 slayd → ${Math.ceil(25 / 10) * (Number(f.ppt_10_slayd) || 0)} kapul (${so(Math.ceil(25 / 10) * (Number(f.ppt_10_slayd) || 0) * som)} so‘m). Yuqoriga yaxlitlanadi.`)}
        {maydon("ochiq_dars", "Ochiq dars (AI) = necha kapul", `Bitta ochiq dars ${f.ochiq_dars || 0} kapul = ${so((f.ochiq_dars || 0) * som)} so‘m.`)}
      </div>
      <button className="ka-btn" disabled={band} onClick={() => saqla(["som", "sovga", "ppt_10_slayd", "ochiq_dars"])}>Narxlarni saqlash</button>
      <small className="ka-eslatma"> Admin hamma narsani bepul ishlatadi. AI ishlamay qolsa — kapul avtomatik qaytariladi.</small>
    </div>

    <div className="ka-karta">
      <h3>2. To‘lov qabul qilish (karta)</h3>
      <p className="ka-tushuncha">Mijoz kapul tanlaydi → unga <b>noyob summa</b> chiqadi (masalan 49 758 so‘m). U shu summani kartangizga o‘tkazadi. Telefoningizga kelgan SMS botga uzatiladi, summa mos kelsa kapul <b>o‘zi qo‘shiladi</b>.</p>
      <div className="ka-grid">
        {maydon("karta_raqam", "Karta raqami", "Masalan: 8600 1234 5678 9012. Bo‘sh bo‘lsa to‘lov o‘chiq turadi.", "text")}
        {maydon("karta_egasi", "Karta egasi (mijozga ko‘rinadi)", "Masalan: AZIZJON R.", "text")}
        {maydon("buyurtma_daqiqa", "Buyurtma necha daqiqa kutadi", "Shundan keyin summa bo‘shaydi. Kechikkan to‘lov 24 soat ichida baribir hisoblanadi.")}
      </div>
      <button className="ka-btn" disabled={band} onClick={() => saqla(["karta_raqam", "karta_egasi", "buyurtma_daqiqa"])}>To‘lov sozlamasini saqlash</button>
      <span className={`ka-holat ${yoq ? "on" : ""}`}>{yoq ? "To‘lov yoqilgan" : "To‘lov o‘chiq (karta raqami yo‘q)"}</span>
    </div>

    <div className="ka-karta">
      <h3>3. Telefondagi SMS’ni botga ulash</h3>
      <ol className="ka-qadam">
        <li>Android telefonga «SMS Forwarder» turidagi ilova o‘rnating (HTTP/webhook’ga yubora oladigani).</li>
        <li>Manzil (URL), usul <b>POST</b>: <code>{url}</code></li>
        <li>Sarlavha (header): <code>X-Kapul-Kalit: {d.sms_kalit}</code></li>
        <li>Tana (body): SMS matni. JSON bo‘lsa — <code>{"{\"text\": \"SMS matni\"}"}</code></li>
        <li>Faqat karta bankidan (Humo/Uzcard) kelgan SMS’larni uzating.</li>
      </ol>
      <button className="ka-btn ka-kichik" onClick={() => navigator.clipboard?.writeText(d.sms_kalit).then(() => setXabar("Kalit nusxalandi"))}>Kalitni nusxalash</button>
      <small className="ka-eslatma"> Kalitni hech kimga bermang. Uzatgichsiz ham ishlaydi: pastdagi «Qo‘lda qo‘shish».</small>
    </div>

    <div className="ka-karta">
      <h3>4. Qo‘lda kapul qo‘shish / ayirish</h3>
      <div className="ka-grid">
        <label className="ka-m"><span>Akaunt raqami (ID)</span><input type="number" value={qo.uid} onChange={(e) => setQo({ ...qo, uid: e.target.value })} /></label>
        <label className="ka-m"><span>Kapul (minus — ayirish)</span><input type="number" value={qo.kapul} onChange={(e) => setQo({ ...qo, kapul: e.target.value })} /></label>
      </div>
      <button className="ka-btn" disabled={band || !qo.uid || !qo.kapul}
        onClick={async () => { setBand(true); try { const r = await api(apiBase, token, "/api/kapul/admin/qosh", { method: "POST", body: { uid: Number(qo.uid), kapul: Number(qo.kapul) } });
          setXabar(`✅ Bajarildi. Yangi balans: ${r.balans} kapul`); setQo({ uid: "", kapul: "" }); await yukla(); } catch (e) { setXabar("⚠ " + e.message); } finally { setBand(false); } }}>Bajarish</button>
    </div>

    <div className="ka-karta">
      <h3>5. Oxirgi buyurtmalar</h3>
      <div className="ka-jadval"><table><thead><tr><th>Vaqt</th><th>Akaunt</th><th>Kapul</th><th>Summa</th><th>Holat</th></tr></thead><tbody>
        {d.buyurtmalar.map((o) => <tr key={o.id}><td>{new Date(o.vaqt).toLocaleString("ru-RU")}</td><td>{o.uid}</td><td>{o.kapul}</td><td>{so(o.summa)}</td><td>{HOLAT[o.holat] || o.holat}</td></tr>)}
        {!d.buyurtmalar.length && <tr><td colSpan="5">Hali buyurtma yo‘q</td></tr>}
      </tbody></table></div>
    </div>

    <div className="ka-karta">
      <h3>6. Kelgan SMS’lar</h3>
      <div className="ka-jadval"><table><thead><tr><th>Vaqt</th><th>Matn</th><th>Natija</th></tr></thead><tbody>
        {d.sms.map((s) => <tr key={s.id}><td>{new Date(s.vaqt).toLocaleString("ru-RU")}</td><td className="ka-matn">{s.matn}</td><td>{SMS_NATIJA[s.natija] || s.natija}</td></tr>)}
        {!d.sms.length && <tr><td colSpan="3">Hali SMS kelmagan</td></tr>}
      </tbody></table></div>
      <small className="ka-eslatma">«Mos buyurtma topilmadi» — mijoz boshqa summa o‘tkazgan bo‘lishi mumkin: akaunt raqamini so‘rab, 4-bo‘limdan qo‘lda qo‘shing.</small>
    </div>
  </section>;
}
