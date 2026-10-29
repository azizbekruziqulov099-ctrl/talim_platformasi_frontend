// REV197: Admin → Kabutar TV → «🦴 Personajlar» — qatlamli PSD yuklash, bo'g'imlarni sichqoncha bilan qo'yish,
// pozalar va imo-ishoralarni darhol ko'rish. Ustoz rig'i bo'lsa, ko'rsatuvlarda u jonli (skeletli) chiqadi.
import React, { useCallback, useEffect, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";
const ISM = { nilufar: "Nilufar opa", emily: "Emily (ingliz)", lukas: "Lukas (nemis)", camille: "Camille (fransuz)", carlos: "Carlos (ispan)",
  anna: "Anna (rus)", yusuf: "Yusuf (arab)", elif: "Elif (turk)", jiwoo: "Ji-woo (koreys)", kenji: "Kenji (yapon)", mei: "Mei (xitoy)" };
const SUYAK = { tana: "Tana (bel)", boyin: "Bo‘yin asosi", bosh: "Bosh (iyak ostidagi bo‘g‘im)", yelka_chap: "Chap yelka", bilak_chap: "Chap tirsak",
  kaft_chap: "Chap bilak (kaft)", yelka_ong: "O‘ng yelka", bilak_ong: "O‘ng tirsak", kaft_ong: "O‘ng bilak (kaft)" };
const IMO = [["", "Oddiy"], ["gapir", "Gapirish"], ["salom", "Salom"], ["korsat", "Kartaga ko‘rsatish"], ["kul", "Kulish"], ["hayron", "Hayron"], ["irgash", "Bosh irg‘ash"]];
const H = 600;

export default function AdminRig({ token }) {
  const url = (p, q = {}) => `${API_BASE}/api/kabutar_tv${p}?${new URLSearchParams({ token, ...q })}`;
  const [royxat, setRoyxat] = useState([]);
  const [nom, setNom] = useState("nilufar");
  const [rig, setRig] = useState(null);
  const [tanlangan, setTanlangan] = useState("bosh");
  const [imo, setImo] = useState("");
  const [ogiz, setOgiz] = useState("X");
  const [kozYumuq, setKozYumuq] = useState(false);
  const [qara, setQara] = useState(0);
  const [gif, setGif] = useState("");
  const [yuk, setYuk] = useState(false);
  const [xabar, setXabar] = useState("");
  const [ogoh, setOgoh] = useState([]);
  const [v, setV] = useState(0);   // rasmni yangilash

  const sorov = async (p, q, opt) => {
    const r = await fetch(url(p, q), opt);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.detail || `Xato ${r.status}`);
    return j;
  };
  const yangila = useCallback(async () => {
    try { const j = await sorov("/rig", {}); setRoyxat(j.rigs || []); } catch (e) { setXabar(`⚠️ ${e.message}`); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { yangila(); }, [yangila]);
  useEffect(() => {
    setRig(null); setGif("");
    if (!royxat.find((r) => r.nom === nom && r.bor)) return;
    sorov(`/rig/${nom}`, {}).then(setRig).catch((e) => setXabar(`⚠️ ${e.message}`));
  }, [nom, royxat]); // eslint-disable-line react-hooks/exhaustive-deps

  const yukla = async (fayl) => {
    if (!fayl) return;
    setYuk(true); setXabar(T("Yuklanmoqda va qatlamlar ajratilmoqda… (katta fayl 1–2 daqiqa)")); setOgoh([]);
    try {
      const fd = new FormData(); fd.append("fayl", fayl);
      const j = await sorov("/rig/yukla", { nom }, { method: "POST", body: fd });
      setOgoh(j.ogohlantirishlar || []);
      setXabar(`✅ ${j.qatlamlar} ta qatlam o‘qildi. Endi bo‘g‘imlarni tekshiring.`);
      await yangila(); setV((x) => x + 1);
    } catch (e) { setXabar(`⚠️ ${e.message}`); } finally { setYuk(false); }
  };

  // rasmni bosish → tanlangan bo'g'im nuqtasi (kanvas koordinatasiga o'giriladi)
  const bosildi = (e) => {
    if (!rig) return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const nx = (e.clientX - rect.left) * (img.naturalWidth / rect.width);
    const ny = (e.clientY - rect.top) * (img.naturalHeight / rect.height);
    const s = H / rig.kanvas[1];
    const pad = Math.round(rig.kanvas[0] * s * 0.35);
    const x = (nx - pad) / s, y = ny / s;
    setRig({ ...rig, suyaklar: { ...rig.suyaklar, [tanlangan]: { ...rig.suyaklar[tanlangan], nuqta: [x, y] } } });
    setXabar(T("Nuqta o‘zgardi — «Saqlash»ni bosing"));
  };
  const saqla = async () => {
    try {
      await sorov(`/rig/${nom}`, {}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suyaklar: rig.suyaklar }) });
      setXabar("✅ Saqlandi"); setV((x) => x + 1);
    } catch (e) { setXabar(`⚠️ ${e.message}`); }
  };

  const bor = royxat.find((r) => r.nom === nom)?.bor;
  return <div className="rounded-2xl border bg-white p-4">
    <h3 className="text-lg font-bold">🦴 {T("Personajlar (skeletli)")}</h3>
    <p className="mt-1 text-sm text-slate-600">{T("Rassom chizgan qatlamli PSD faylni yuklang. Dastur qatlamlarni ajratadi va bo‘g‘imlarni o‘zi taxmin qiladi. Qizil nuqtalarni tekshiring: noto‘g‘ri bo‘lsa, ro‘yxatdan bo‘g‘imni tanlab, rasmda to‘g‘ri joyni bosing. Rig yuklangan ustoz ko‘rsatuvlarda o‘zi jonli chiqadi.")}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {Object.entries(ISM).map(([k, n]) => {
        const r = royxat.find((x) => x.nom === k);
        return <button key={k} type="button" onClick={() => setNom(k)}
          className={`rounded-full border px-3 py-1 text-sm ${nom === k ? "bg-sky-800 text-white" : "bg-white"}`}>{r?.bor ? "✅ " : "▫️ "}{n}</button>;
      })}
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
      <b>{ISM[nom]}:</b>
      <label className="cursor-pointer rounded-lg bg-sky-700 px-3 py-1.5 text-sm font-semibold text-white">
        📤 {bor ? T("PSD yoki zip’ni qayta yuklash") : T("PSD yoki zip yuklash")}
        <input type="file" accept=".psd,.zip" className="hidden" disabled={yuk} onChange={(e) => yukla(e.target.files?.[0])} />
      </label>
      {xabar && <span className="text-sm" role="status">{xabar}</span>}
    </div>
    {ogoh.length > 0 && <ul className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{ogoh.map((o) => <li key={o}>⚠️ {o}</li>)}</ul>}

    {rig && <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-auto rounded-xl border bg-[#eef3fa] p-2 text-center">
        <img alt="" src={url(`/rig/${nom}/rasm`, { h: H, nuqtalar: true, imo, ogiz, qara, ...(kozYumuq ? { koz: 0 } : {}), v })}
          onClick={bosildi} className="mx-auto max-h-[640px] cursor-crosshair" />
        <p className="text-xs text-slate-500">{T("Tanlangan bo‘g‘im uchun rasmda to‘g‘ri joyni bosing")}</p>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <b>{T("Bo‘g‘imlar")}</b>
          <div className="mt-1 grid gap-1">
            {Object.keys(rig.suyaklar).map((k) => <button key={k} type="button" onClick={() => setTanlangan(k)}
              className={`rounded-lg border px-2 py-1 text-left ${tanlangan === k ? "border-red-500 bg-red-50 font-semibold" : ""}`}>{T(SUYAK[k] || k)}</button>)}
          </div>
          <button type="button" onClick={saqla} className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white">💾 {T("Saqlash")}</button>
        </div>
        <div>
          <b>{T("Sinab ko‘rish")}</b>
          <label className="mt-1 block">{T("Imo-ishora")}
            <select value={imo} onChange={(e) => setImo(e.target.value)} className="ml-2 rounded border px-1">{IMO.map(([k, n]) => <option key={k} value={k}>{T(n)}</option>)}</select></label>
          <label className="mt-1 block">{T("Og‘iz")}
            <select value={ogiz} onChange={(e) => setOgiz(e.target.value)} className="ml-2 rounded border px-1">{["X", "A", "B", "C", "D", "E", "F", "G", "H"].map((k) => <option key={k}>{k}</option>)}</select></label>
          <label className="mt-1 flex items-center gap-2"><input type="checkbox" checked={kozYumuq} onChange={(e) => setKozYumuq(e.target.checked)} />{T("Ko‘z yumuq")}</label>
          <label className="mt-1 block">{T("Qarash")} <input type="range" min="-1" max="1" step="0.1" value={qara} onChange={(e) => setQara(e.target.value)} /></label>
        </div>
        <div>
          <b>{T("Jonli ko‘rish (GIF)")}</b>
          <div className="mt-1 flex flex-wrap gap-1">
            {IMO.map(([k, n]) => <button key={k || "oddiy"} type="button" className="rounded border px-2 py-0.5" onClick={() => setGif(url(`/rig/${nom}/gif`, { imo: k, v: Date.now() }))}>{T(n)}</button>)}
          </div>
          {gif && <img alt="" src={gif} className="mt-2 max-h-80 rounded-lg border" />}
        </div>
      </div>
    </div>}
  </div>;
}
