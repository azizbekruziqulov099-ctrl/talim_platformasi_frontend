import React, { useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { useCurriculum } from "../curriculum/CurriculumScope.jsx";
import { programLabel } from "../curriculum/catalog.js";
import { paketNavbati, paketXulosa } from "./paketRules.js";

const API_BASE = import.meta.env.VITE_API_BASE || "https://talimplatformasi-production.up.railway.app";

const HOLAT = {
  kutmoqda: ["⏳", "#5A5648", "#F2F0EA"],
  ishlanmoqda: ["⚙️", "#1B4B7A", "#EAF1F7"],
  tayyor: ["✅", "#25683B", "#E7F4EC"],
  xato: ["❌", "#A32D2D", "#FCEBEB"],
  otkazildi: ["➖", "#8A8578", "#F7F5EF"],
};
const TUR = { mavzu: "📋 Mavzular", miya: "🧠 Miya", lugat: "📖 Lug'at", royxat: "🖼️ Ro'yxat", nomalum: "❔ Noma'lum" };
const kut = (ms) => new Promise((r) => setTimeout(r, ms));
// REV186: server bir lahzaga qayta ishga tushsa («Failed to fetch», 502/503) — qolgan fayllar «xato» bo'lib ketmaydi:
// server qaytguncha kutiladi (3 daqiqagacha) va o'sha fayl qayta yuboriladi (3 martagacha).
const tarmoqXatomi = (e) => e instanceof TypeError || /fetch|network|502|503|504/i.test(String(e?.message || ""));
async function serverniKut(stop) {
  for (let i = 0; i < 36 && !stop.current; i += 1) {
    try { const r = await fetch(`${API_BASE}/health/ready`, { cache: "no-store" }); if (r.ok) return true; } catch { /* hali qaytmadi */ }
    await kut(5000);
  }
  return false;
}

/**
 * REV121: «Paketni birdan o'rnatish» — bitta ZIP (papkalari bilan) yoki ko'p Excel tanlanadi.
 * Server har faylni ichidan taniydi (mavzular / miya), avval mavzular, keyin miyalar o'rnatiladi:
 * tekshirish → import → nashr. Har fayl alohida so'rov — katta paket uzilmaydi, xatosini qayta bosish mumkin.
 */
export default function PaketYuklash({ token, onDone }) {
  useKbInterfaceLocale();
  const { fetch: scopedFetch, scope } = useCurriculum();
  const [navbat, setNavbat] = useState([]);
  const [ish, setIsh] = useState("");          // "" | ochilmoqda | ornatilmoqda
  const [xato, setXato] = useState("");
  const stop = useRef(false);
  const input = useRef(null);

  const url = (path) => `${API_BASE}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
  const yangila = (key, patch) => setNavbat((list) => list.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  async function yuklaFayl(file) {
    const form = new FormData();
    form.append("fayl", file);
    const res = await scopedFetch(url("/api/admin/paket/yukla"), { method: "POST", body: form });
    return res.json();
  }

  async function ornat(list) {
    setIsh("ornatilmoqda");
    stop.current = false;
    for (const item of list) {
      if (stop.current) break;
      if (!["kutmoqda", "xato"].includes(item.holat)) continue;
      yangila(item.key, { holat: "ishlanmoqda", xabar: "" });
      for (let urinish = 1; urinish <= 3; urinish += 1) {
        try {
          let natija;
          if (item.id) {
            const res = await scopedFetch(url(`/api/admin/paket/fayl/${item.id}`), { method: "POST" });
            if ([502, 503, 504].includes(res.status)) throw new Error(String(res.status));
            natija = await res.json();
          } else {
            natija = (await yuklaFayl(item.file)).fayllar?.[0] || {};
          }
          yangila(item.key, { holat: natija.holat || (natija.ok ? "tayyor" : "xato"), xabar: natija.xabar || "",
            xatolar: natija.xatolar || [], turi: natija.turi || item.turi, belgi: natija.belgi || item.belgi });
          break;
        } catch (e) {
          if (!tarmoqXatomi(e) || urinish === 3 || stop.current) {
            yangila(item.key, { holat: "xato", xabar: tarmoqXatomi(e) ? __kbUi("Server javob bermadi — «Qayta urinish»ni bosing") : e.message });
            break;
          }
          yangila(item.key, { holat: "ishlanmoqda", xabar: __kbUi(`Server qayta ishga tushmoqda — kutilyapti (${urinish}/3)…`) });
          await serverniKut(stop);
        }
      }
      await kut(300);   // server nafas olsin — ketma-ket og'ir fayllar xotirani to'ldirmasin
    }
    setIsh("");
    onDone?.();
  }

  async function tanlandi(e) {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length || ish) return;
    setXato("");
    setIsh("ochilmoqda");
    try {
      const items = [];
      for (const file of files) {
        if (/\.zip$/i.test(file.name)) {
          // ZIP — serverda ochiladi; ichidagi Excellar tartib bilan qaytadi (eski usuldagi bitta miya ZIP — darhol o'rnatiladi)
          const d = await yuklaFayl(file);
          if (d.paket) d.fayllar.forEach((f) => items.push({ ...f, key: `p${f.id}` }));
          else (d.fayllar || []).forEach((f, i) => items.push({ ...f, key: `${file.name}-${i}` }));
        } else {
          items.push({ key: `${file.name}-${file.size}-${file.lastModified}`, file, nomi: file.name, holat: "kutmoqda" });
        }
      }
      const list = paketNavbati(items);
      setNavbat(list);
      await ornat(list);
      // REV207: yuklangan darslar o'quvchilarga ko'rinishi uchun — katalogga ulash (mavzusi o'chirilgan yoki yo'q bo'lsa ham)
      try { await scopedFetch(url("/api/admin/miya_katalog_tuzat"), { method: "POST" }); } catch { /* keyin qo'lda bosish mumkin */ }
    } catch (err) {
      setXato(err.message);
      setIsh("");
    }
  }

  const x = paketXulosa(navbat);
  return <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: "#B7D3E8" }}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: "#EAF1F7" }}>⚡</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm" style={{ color: "#1B4B7A" }}>{__kbUi("Paketni birdan o‘rnatish (mavzular + miyalar)")}</h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "#5A5648" }}>
          {__kbUi("Bitta ZIP tanlang (papkalari bilan) yoki bir nechta Excel. Har fayl ichidan taniladi: avval mavzular, keyin miyalar o‘rnatiladi — tekshiriladi, import va nashr qilinadi. Rasmlar ro‘yxati o‘tkazib yuboriladi.")}
        </p>
        <p className="text-[11px] mt-1" style={{ color: "#8A8578" }}>
          {__kbUi("Mavzular shu dasturga yoziladi:")} <b>{scope?.id ? __kbUi(programLabel(scope)) : __kbUi("dastur tanlanmagan")}</b>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={Boolean(ish)} onClick={() => input.current?.click()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "#1B4B7A" }}>
            {ish === "ochilmoqda" ? __kbUi("ZIP ochilmoqda…") : ish ? __kbUi("O‘rnatilmoqda…") : __kbUi("📦 ZIP yoki Excellarni tanlash")}
          </button>
          <input ref={input} type="file" multiple accept=".zip,.xlsx" className="hidden" onChange={tanlandi} />
          {ish === "ornatilmoqda" && <button type="button" onClick={() => { stop.current = true; }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>{__kbUi("⏹ To‘xtatish")}</button>}
          {!ish && x.xato > 0 && <button type="button" onClick={() => ornat(navbat)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#FFF4D8", color: "#8A5A1C" }}>{__kbUi(`🔁 Xatolarni qayta urinish (${x.xato})`)}</button>}
        </div>
        {xato && <p className="mt-2 text-xs" style={{ color: "#A32D2D" }}>{xato}</p>}
      </div>
    </div>
    {navbat.length > 0 && <>
      <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EEF2F6" }} aria-hidden="true">
        <div className="h-full" style={{ width: `${x.foiz}%`, backgroundColor: x.xato ? "#D9A23B" : "#2D8B8B", transition: "width .3s" }} />
      </div>
      <p className="mt-2 text-xs font-semibold" style={{ color: "#2B2B2B" }}>
        {__kbUi(`Jami ${x.jami}: ✅ ${x.tayyor} · ❌ ${x.xato} · ⏳ ${x.qoldi} · ➖ ${x.otkazildi}`)} · 📋 {x.mavzu} · 🧠 {x.miya}
      </p>
      <ul className="mt-2 space-y-1.5 max-h-[420px] overflow-auto pr-1">
        {navbat.map((it) => {
          const [ikon, rang, fon] = HOLAT[it.holat] || HOLAT.kutmoqda;
          return <li key={it.key} className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: fon }}>
            <div className="flex items-center gap-2">
              <span aria-hidden="true">{ikon}</span>
              <span className="shrink-0 font-semibold" style={{ color: "#5A5648" }}>{__kbUi(TUR[it.turi] || TUR.nomalum)}</span>
              <span className="flex-1 min-w-0 truncate font-semibold" style={{ color: rang }} title={it.nomi}>{it.belgi || it.nomi}</span>
            </div>
            {it.xabar && <p className="mt-1" style={{ color: rang }}>{it.xabar}</p>}
            {it.xatolar?.length > 0 && <ul className="mt-1 list-disc pl-5" style={{ color: "#A32D2D" }}>{it.xatolar.map((e) => <li key={e}>{e}</li>)}</ul>}
          </li>;
        })}
      </ul>
    </>}
  </div>;
}
