// REV187: Admin → «📺 Kabutar TV» — ko'rsatuvlar holati, «Ishga tushirish», haftalik jadval, sozlamalar, ssenariyni oldindan ko'rish.
// Videolar Kabutar'da yoshga mos kanallarga o'zi tushadi; admin «📺 Kabutar TV — barcha ko'rsatuvlar (admin)» kanalida hammasini ko'radi.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
const HOLAT = {
  kutmoqda: ["⏳", "Navbatda", "#5A5648", "#F2F0EA"], tayyorlanmoqda: ["⚙️", "Tayyorlanmoqda", "#1B4B7A", "#EAF1F7"],
  joylandi: ["✅", "Kanalga joylandi", "#25683B", "#E7F4EC"], xato: ["❌", "Xato", "#A32D2D", "#FCEBEB"], arxiv: ["🗄️", "Muddati tugagan", "#8A8578", "#F7F5EF"],
};
const HAFTA = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const KIM = { T: ["Til ustozi", "#1d6fd8"], I: ["Nilufar opa", "#0f8a5f"], K1: ["Kabu", "#7c4dff"], K2: ["Kabu (UZ)", "#e87814"] };
const bugun = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);   // Toshkent

export default function AdminKabutarTv({ token }) {
  const [sana, setSana] = useState(bugun());
  const [d, setD] = useState(null);
  const [xato, setXato] = useState("");
  const [xabar, setXabar] = useState("");
  const [tanTil, setTanTil] = useState([]);
  const [tanDar, setTanDar] = useState([]);
  const [majburiy, setMajburiy] = useState(false);
  const [jadval, setJadval] = useState(null);
  const [soz, setSoz] = useState(null);
  const [video, setVideo] = useState(null);
  const [ssen, setSsen] = useState(null);
  const url = (p, q = {}) => `${API_BASE}/api/kabutar_tv${p}?${new URLSearchParams({ token, ...q })}`;
  const [tgNat, setTgNat] = useState(null);   // REV191: {ok, matn} — sinov natijasi tugma yonida
  const [botNom, setBotNom] = useState("");
  const sorov = async (p, q, opt) => {
    const r = await fetch(url(p, q), opt);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || `Xato ${r.status}`);
    return j;
  };
  useEffect(() => { (async () => { try { const r = await sorov("/bot", {}); if (r?.bot) setBotNom(r.bot); } catch { /* */ } })(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const yukla = useCallback(async () => {
    try {
      const j = await sorov("/holat", { sana });
      setD(j); setSoz((s) => s || j.sozlama); setXato("");
    } catch (e) { setXato(e.message); }
  }, [sana, token]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { yukla(); }, [yukla]);
  useEffect(() => { sorov("/jadval").then((j) => setJadval(j.jadval)).catch(() => {}); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps
  const ishlayapti = Boolean(d && (d.band || d.korsatuvlar.some((k) => ["kutmoqda", "tayyorlanmoqda"].includes(k.holat))));
  useEffect(() => { if (!ishlayapti) return undefined; const t = setInterval(yukla, 8000); return () => clearInterval(t); }, [ishlayapti, yukla]);

  const tillar = d?.mumkin_tillar || {};
  const darajalar = d?.darajalar || [];
  const korsatuv = useMemo(() => {
    const m = {};
    for (const k of d?.korsatuvlar || []) m[`${k.til}|${k.daraja}`] = k;
    return m;
  }, [d]);
  const yakshanba = new Date(`${sana}T12:00:00`).getDay() === 0;
  const kunTillari = [...new Set([...(d?.tillar || []), ...(yakshanba && soz?.haftalik !== false ? ["hf"] : []), ...(d?.korsatuvlar || []).map((k) => k.til)])];

  const ishga = async (tl = tanTil, dr = tanDar, mj = majburiy) => {
    setXabar(""); setXato("");
    try {
      await sorov("/ishga_tushir", { sana, ...(tl.length ? { tillar: tl.join(",") } : {}), ...(dr.length ? { darajalar: dr.join(",") } : {}), majburiy: String(mj) }, { method: "POST" });
      setXabar(T("Boshlandi. Har ko‘rsatuv 3–5 daqiqada tayyor bo‘ladi — sahifa o‘zi yangilanadi."));
      setTimeout(yukla, 1500);
    } catch (e) { setXato(e.message); }
  };
  const jadvalSaqla = async () => {
    try { const j = await sorov("/jadval", {}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jadval }) });
      setJadval(Object.entries(j.jadval).map(([k, v]) => ({ hafta_kuni: Number(k), kun: HAFTA[k], tillar: v }))); setXabar(T("Jadval saqlandi")); yukla();
    } catch (e) { setXato(e.message); }
  };
  const sozSaqla = async () => {
    try { setSoz(await sorov("/sozlama", {}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(soz) })); setXabar(T("Sozlamalar saqlandi")); }
    catch (e) { setXato(e.message); }
  };
  const ssenariyOch = async (til, daraja) => {
    setSsen({ til, daraja, yuk: true });
    try { setSsen({ til, daraja, s: await sorov("/ssenariy", { til, daraja, sana }) }); } catch (e) { setSsen(null); setXato(e.message); }
  };
  const tog = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return <div className="space-y-4 p-1">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-slate-800">📺 Kabutar TV</h2>
        <p className="text-sm text-slate-600">{T("Har kuni yoshga mos video ko‘rsatuv — Kabutar kanallariga o‘zi joylanadi.")}</p></div>
      <label className="flex items-center gap-2 text-sm"><span>{T("Sana")}</span>
        <input type="date" value={sana} onChange={(e) => setSana(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1" /></label>
    </div>
    {xato && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{T(xato)}</p>}
    {xabar && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{xabar}</p>}
    {d && !d.volume && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">⚠️ {T("Videolar alohida diskda (Railway Volume) emas — har yangilashda (deploy) o‘chib ketadi. Volume ulang va KABUTAR_TV_DIR=/data/kabutar_tv yozing.")}</p>}
    {soz && !soz.yoqilgan && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">⏸ {T("Tungi avtomatik tayyorlash o‘chirilgan — pastdagi Sozlamalarda yoqing.")}</p>}

    {/* Ishga tushirish */}
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-bold text-slate-800">▶ {T("Ishga tushirish")}</h3>
      <p className="mb-2 text-xs text-slate-500">{T("Til yoki sinf tanlanmasa — shu kunning jadvalidagi barcha tillar va barcha sinflar. Sinov uchun bitta til va bitta sinfni tanlang.")}</p>
      <div className="mb-2 flex flex-wrap gap-2">{Object.entries(tillar).map(([k, nom]) =>
        <button key={k} type="button" onClick={() => tog(tanTil, setTanTil, k)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold"
          style={tanTil.includes(k) ? { background: "#1B4B7A", color: "#fff", borderColor: "#1B4B7A" } : { background: "#fff" }}>{T(nom)}</button>)}</div>
      <div className="mb-2 flex flex-wrap gap-1.5">{darajalar.map((x) =>
        <button key={x} type="button" onClick={() => tog(tanDar, setTanDar, x)} className="rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={tanDar.includes(x) ? { background: "#0f8a5f", color: "#fff", borderColor: "#0f8a5f" } : { background: "#fff" }}>{x}</button>)}</div>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={majburiy} onChange={(e) => setMajburiy(e.target.checked)} />
        {T("Tayyorlarini ham qaytadan qilish (eski xabar kanaldan o‘chadi)")}</label>
      <button type="button" disabled={!d || d.band} onClick={() => ishga()} className="rounded-xl px-5 py-2.5 font-bold text-white disabled:opacity-50" style={{ background: "#1B4B7A" }}>
        {d?.band ? `⚙️ ${T("Tayyorlanmoqda…")}` : `▶ ${T("Ishga tushirish")}`}</button>
    </section>

    {/* Holat */}
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 font-bold text-slate-800">📋 {T("Ko‘rsatuvlar")} · {sana}</h3>
      <p className="mb-3 text-xs text-slate-500">{kunTillari.length ? `${T("Jadval bo‘yicha")}: ${kunTillari.map((k) => T(tillar[k] || k)).join(", ")}` : T("Bu kunga jadvalda til yo‘q (masalan, yakshanba).")}</p>
      {kunTillari.map((til) => <div key={til} className="mb-3">
        <b className="text-sm text-slate-700">{T(tillar[til] || til)}</b>
        <div className="mt-1 grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {darajalar.map((dar) => {
            const k = korsatuv[`${til}|${dar}`];
            const [em, nom, rang, fon] = HOLAT[k?.holat] || ["·", "Hali yo‘q", "#8A8578", "#F7F5EF"];
            return <div key={dar} className="rounded-xl border px-3 py-2 text-sm" style={{ background: fon, borderColor: "#E5E1D8" }}>
              <div className="flex items-center justify-between gap-2"><b>{dar}</b><span style={{ color: rang }} className="text-xs font-semibold">{em} {T(nom)}</span></div>
              {k?.mavzu && <div className="truncate text-xs text-slate-600" title={k.mavzu}>«{k.mavzu}»{k.soniya ? ` · ${Math.round(k.soniya / 60)} ${T("daq")}` : ""}</div>}
              {k?.xato && <div className="text-xs text-red-700">{k.xato}</div>}
              {k?.tg_holat && <div className={`text-xs ${k.tg_holat === "yuborildi" ? "text-emerald-700" : "text-amber-700"}`}>✈️ Telegram: {T(k.tg_holat)}</div>}
              <div className="mt-1 flex flex-wrap gap-1">
                {k?.holat === "joylandi" && <button type="button" className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold" onClick={() => setVideo({ til, dar })}>▶ {T("Ko‘rish")}</button>}
                <button type="button" className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold" onClick={() => ssenariyOch(til, dar)}>📝 {T("Ssenariy")}</button>
                <button type="button" disabled={d?.band} className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold disabled:opacity-40" onClick={() => ishga([til], [dar], true)}>🔁 {T("Qayta")}</button>
              </div>
            </div>;
          })}
        </div>
      </div>)}
      {d?.tarix?.length > 0 && <p className="mt-2 text-xs text-slate-500">🗓 {d.tarix.map((t) => `${String(t.sana).slice(5)}: ✅${t.joylandi}${t.xato ? ` ❌${t.xato}` : ""}`).join(" · ")}</p>}
    </section>

    {/* Jadval */}
    {jadval && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-bold text-slate-800">🗓 {T("Haftalik jadval")}</h3>
      <div className="overflow-x-auto"><table className="text-sm"><thead><tr><th className="pr-3 text-left">{T("Kun")}</th>
        {Object.entries(tillar).filter(([k]) => k !== "hf").map(([k, nom]) => <th key={k} className="px-2 text-xs">{T(nom).split(" ")[0]}</th>)}</tr></thead>
        <tbody>{jadval.map((row) => <tr key={row.hafta_kuni}><td className="pr-3">{T(HAFTA[row.hafta_kuni])}</td>
          {Object.keys(tillar).filter((k) => k !== "hf").map((k) => <td key={k} className="px-2 text-center"><input type="checkbox" checked={row.tillar.includes(k)} aria-label={`${HAFTA[row.hafta_kuni]} ${k}`}
            onChange={() => setJadval((j) => j.map((r) => (r.hafta_kuni === row.hafta_kuni ? { ...r, tillar: r.tillar.includes(k) ? r.tillar.filter((x) => x !== k) : [...r.tillar, k] } : r)))} /></td>)}
        </tr>)}</tbody></table></div>
      <button type="button" onClick={jadvalSaqla} className="mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "#0f8a5f" }}>💾 {T("Jadvalni saqlash")}</button>
    </section>}

    {/* Sozlamalar */}
    {soz && <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-bold text-slate-800">⚙️ {T("Sozlamalar")}</h3>
      <div className="flex flex-wrap items-end gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(soz.yoqilgan)} onChange={(e) => setSoz({ ...soz, yoqilgan: e.target.checked })} />{T("Har kecha avtomatik tayyorlash")}</label>
        <label>{T("Boshlanish soati")}<input type="number" min={0} max={23} value={soz.soat} onChange={(e) => setSoz({ ...soz, soat: e.target.value })} className="ml-2 w-16 rounded border px-2 py-1" /></label>
        <label>{T("Oxirgi soat")}<input type="number" min={1} max={24} value={soz.oxirgi_soat} onChange={(e) => setSoz({ ...soz, oxirgi_soat: e.target.value })} className="ml-2 w-16 rounded border px-2 py-1" /></label>
        <label>{T("Videolar saqlanadi (kun)")}<input type="number" min={3} max={365} value={soz.saqlash_kun} onChange={(e) => setSoz({ ...soz, saqlash_kun: e.target.value })} className="ml-2 w-20 rounded border px-2 py-1" /></label>
        <button type="button" onClick={sozSaqla} className="rounded-lg px-4 py-2 font-semibold text-white" style={{ background: "#0f8a5f" }}>💾 {T("Saqlash")}</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">{T("Toshkent vaqti. Tunda ishlaydi — kunduzi saytni sekinlashtirmaydi. 14 kunlik videolar ~3 GB joy oladi.")}</p>
      {/* REV188: Telegram — har tayyor video botdan sizga birma-bir keladi (TG guruh va Instagram uchun) */}
      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm">
        <b className="text-sky-900">✈️ {T("Telegramga yuborish")}</b>
        <p className="mt-1 text-xs text-sky-900">{T("Har bir tayyor ko‘rsatuv bot orqali sizga birma-bir keladi — uni Telegram guruhlarga va Instagram’ga qo‘yasiz. Chat ID: botga /start yozing, keyin @userinfobot’dan ID’ingizni oling.")}</p>
        {!d?.bot_bor && <p className="mt-1 text-xs font-semibold text-red-700">{T("Serverda BOT_TOKEN yo‘q — Railway’da talim_platformasi xizmatiga BOT_TOKEN qo‘shing.")}</p>}
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="flex items-center gap-2"><input type="checkbox" checked={soz.tg_yuborish !== false} onChange={(e) => setSoz({ ...soz, tg_yuborish: e.target.checked })} />{T("Yuborilsin")}</label>
          <label>{T("Chat ID")}<input value={soz.tg_chat || ""} onChange={(e) => setSoz({ ...soz, tg_chat: e.target.value })} placeholder="123456789" className="ml-2 w-40 rounded border px-2 py-1" /></label>
          <button type="button" className="rounded-lg bg-white px-3 py-1.5 font-semibold text-sky-900" onClick={async () => {
            setTgNat({ ok: null, matn: T("Yuborilmoqda…") });
            try { await sorov("/sozlama", {}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(soz) });
              const r = await sorov("/tg_sinov", {}, { method: "POST" });
              if (r?.bot) setBotNom(r.bot);
              setTgNat({ ok: true, matn: T("✅ Saqlandi va sinov xabari yuborildi — Telegram’ni tekshiring") }); } catch (e) { setTgNat({ ok: false, matn: `⚠️ ${e.message}` }); }
          }}>🔔 {T("Saqlash va sinab ko‘rish")}</button>
        </div>
        {botNom && <p className="mt-2 text-xs text-sky-900">{T("Videolar shu botdan keladi:")} <b>@{botNom}</b> — {T("Telegram’da uni ochib /start bosing (bir marta).")}</p>}
        {tgNat && <p role="status" className={`mt-2 rounded-lg p-2 text-sm ${tgNat.ok === false ? "bg-red-50 text-red-700" : tgNat.ok ? "bg-emerald-50 text-emerald-800" : "bg-white text-slate-700"}`}>{tgNat.matn}</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={soz.haftalik !== false} onChange={(e) => setSoz({ ...soz, haftalik: e.target.checked })} />{T("Yakshanba — haftalik ko‘rsatuv (hafta yakuni, reyting, kelasi hafta)")}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={soz.reyting_ism !== false} onChange={(e) => setSoz({ ...soz, reyting_ism: e.target.checked })} />{T("Reytingda ism ko‘rsatilsin (faqat ism va familiya bosh harfi)")}</label>
      </div>
    </section>}

    {/* Video */}
    {video && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setVideo(null)}>
      <div className="w-full max-w-3xl rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between"><b>{T(tillar[video.til] || video.til)} · {video.dar}</b><button type="button" onClick={() => setVideo(null)} className="font-bold">✕</button></div>
        <video controls autoPlay playsInline className="w-full rounded-xl" src={url("/video", { til: video.til, daraja: video.dar, sana })} />
      </div>
    </div>}

    {/* Ssenariy */}
    {ssen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={() => setSsen(null)}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between"><b>📝 {T(tillar[ssen.til] || ssen.til)} · {ssen.daraja} · {sana}</b><button type="button" onClick={() => setSsen(null)} className="font-bold">✕</button></div>
        {ssen.yuk ? <p>⏳</p> : <>
          <p className="mb-2 text-sm text-slate-600">{T("Mavzu")}: <b>«{ssen.s.mavzu}»</b> ({ssen.s.raqam}/{ssen.s.jami}) · {T("Immersiya")}: {Math.round(ssen.s.ulush * 100)}% · ~{Math.round(ssen.s.taxminiy_soniya / 60)} {T("daqiqa")}</p>
          {ssen.s.sahnalar.filter((sc) => sc.qatorlar.length).map((sc, i) => <div key={i} className="mb-2 rounded-xl border border-slate-200 p-2">
            <div className="mb-1 text-xs font-bold uppercase text-slate-500">{sc.nom}{sc.karta?.soz ? ` · ${sc.karta.emoji || ""} ${sc.karta.soz}` : ""}</div>
            {sc.qatorlar.map((q, j) => <p key={j} className="text-sm"><b style={{ color: KIM[q.kim][1] }}>{q.rol ? `${q.rol} · ` : ""}{T(KIM[q.kim][0])}:</b> {q.matn}{q.sanoq ? ` ⏱${q.sanoq}` : ""}</p>)}
          </div>)}
        </>}
      </div>
    </div>}
  </div>;
}
