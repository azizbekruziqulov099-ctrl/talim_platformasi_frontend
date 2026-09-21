import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import "./talaba.css";

// Talabaning O'Z haftalik jadvali — maktab o'quv rejasiga bog'lanmagan,
// to'liq o'zi boshqaradi: kun turi (dars / amaliyot / dam), har kunda
// 0..9-para, para vaqtlari sozlamadan avtomatik yoki qo'lda.

const QISQA_KUN = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];
const KUN_NOMLARI = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const KUN_TURLARI = { dars: "Dars kuni", amaliyot: "Amaliyot kuni", dam: "Dam olish" };
const PARA_TURLARI = { maruza: "Ma'ruza", amaliyot: "Amaliyot", seminar: "Seminar", laboratoriya: "Laboratoriya", mustaqil: "Mustaqil ta'lim", boshqa: "Boshqa" };
const clone = (v) => JSON.parse(JSON.stringify(v));

function daqiqaga(vaqt) { const m = /^(\d{2}):(\d{2})$/.exec(vaqt || ""); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }
function vaqtga(d) { d = ((d % 1440) + 1440) % 1440; return `${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`; }
export function paraVaqti(para, sozlamalar) {
  if (para.boshlanish && para.tugash) return `${para.boshlanish}–${para.tugash}`;
  const bosh = daqiqaga(sozlamalar?.boshlanish) ?? 8 * 60 + 30;
  const davom = Number(sozlamalar?.para_daqiqa) || 80, tanaffus = Number(sozlamalar?.tanaffus_daqiqa) || 10;
  const indeks = Math.max(0, Number(para.raqam) - 1); // 1-para = boshlanish; 0-para = bir para oldin
  const start = Number(para.raqam) === 0 ? bosh - davom - tanaffus : bosh + indeks * (davom + tanaffus);
  return `${vaqtga(start)}–${vaqtga(start + davom)}`;
}
function sanaBelgisi(iso, farq) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + farq);
  return `${String(d.getUTCDate()).padStart(2, "0")}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function TalabaHaftalikJadval({ token, apiBase, talabaProfili, readOnly = false }) {
  useKbInterfaceLocale();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tanlanganKun, setTanlanganKun] = useState(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(true);
  const [saqlanmoqda, setSaqlanmoqda] = useState(false);
  const [sozlamaOchiq, setSozlamaOchiq] = useState(false);
  const [xato, setXato] = useState("");
  const [xabar, setXabar] = useState("");
  const tirik = useRef(true);

  useEffect(() => { tirik.current = true; return () => { tirik.current = false; }; }, []);

  const yukla = async () => {
    setYuklanmoqda(true); setXato("");
    try {
      const res = await fetch(`${apiBase}/api/talaba/haftalik_jadval?token=${encodeURIComponent(token)}`, { cache: "no-store" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Server xatosi (${res.status})`);
      if (!tirik.current) return;
      setData(d);
      const korinadigan = d.sozlamalar?.kunlar_soni || 6;
      setTanlanganKun((old) => old || (d.bugun?.kun <= korinadigan ? d.bugun.kun : 1));
    } catch (e) { if (tirik.current) setXato(e.message); }
    finally { if (tirik.current) setYuklanmoqda(false); }
  };
  useEffect(() => { yukla(); }, [token, apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  const joriy = draft || data;
  const tahrir = !!draft;
  const sozlamalar = joriy?.sozlamalar || {};
  const korinadiganKunlar = useMemo(() => (joriy?.kunlar || []).slice(0, sozlamalar.kunlar_soni || 6), [joriy, sozlamalar.kunlar_soni]);
  const kun = korinadiganKunlar.find((k) => k.kun === tanlanganKun) || korinadiganKunlar[0];
  const bugunKun = data?.bugun?.kun;
  const dushanbaISO = useMemo(() => {
    if (!data?.bugun?.sana) return null;
    const d = new Date(`${data.bugun.sana}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - (data.bugun.kun - 1));
    return d.toISOString().slice(0, 10);
  }, [data]);
  const haftalikParalar = korinadiganKunlar.reduce((s, k) => s + (k.turi === "dam" ? 0 : k.paralar.length), 0);

  const kunniYangila = (kunRaqami, patch) => setDraft((old) => ({
    ...old, kunlar: old.kunlar.map((k) => (k.kun === kunRaqami ? { ...k, ...(typeof patch === "function" ? patch(k) : patch) } : k)),
  }));
  const paraQosh = () => kunniYangila(kun.kun, (k) => {
    const band = new Set(k.paralar.map((p) => p.raqam));
    let raqam = 1; while (band.has(raqam) && raqam < 9) raqam += 1;
    return { turi: k.turi === "dam" ? "dars" : k.turi, paralar: [...k.paralar, { raqam, fan: "", turi: k.turi === "amaliyot" ? "amaliyot" : "maruza", oqituvchi: "", xona: "", boshlanish: "", tugash: "", izoh: "" }] };
  });
  const paraYangila = (indeks, patch) => kunniYangila(kun.kun, (k) => ({ paralar: k.paralar.map((p, i) => (i === indeks ? { ...p, ...patch } : p)) }));
  const paraOchir = (indeks) => kunniYangila(kun.kun, (k) => ({ paralar: k.paralar.filter((_, i) => i !== indeks) }));

  const saqla = async () => {
    setSaqlanmoqda(true); setXato(""); setXabar("");
    try {
      const bosh = draft.kunlar.find((k) => k.paralar.some((p) => !p.fan.trim()));
      if (bosh) throw new Error(`${KUN_NOMLARI[bosh.kun - 1]}: fan nomi yozilmagan para bor`);
      const res = await fetch(`${apiBase}/api/talaba/haftalik_jadval`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sozlamalar: draft.sozlamalar, kunlar: draft.kunlar }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : `Server xatosi (${res.status})`);
      setData(d); setDraft(null); setSozlamaOchiq(false); setXabar("Jadval saqlandi.");
      setTimeout(() => tirik.current && setXabar(""), 3000);
    } catch (e) { setXato(e.message); } finally { setSaqlanmoqda(false); }
  };

  const sarlavhaQatori = talabaProfili
    ? `${talabaProfili.kurs}-kurs · ${talabaProfili.guruh}-guruh · ${talabaProfili.talim_shakli_nomi || talabaProfili.talim_shakli}`
    : "Talaba jadvali";

  return (
    <section className={`tj ${tahrir ? "tahrir" : ""}`} aria-label={__kbUi("Haftalik paralar jadvali")}>
      <header className="tj-bosh">
        <div>
          <span className="tj-kichik">{talabaProfili?.universitet_nomi || __kbUi("Oliy ta'lim")}</span>
          <h2>{__kbUi("Haftalik paralar")}</h2>
          <p>{sarlavhaQatori}{data ? __kbUi(` · haftada ${haftalikParalar} para`) : __kbUi("")}</p>
        </div>
        {!readOnly && data && (
          <div className="tj-amallar">
            {tahrir ? (
              <>
                <button type="button" className="tj-ikkilamchi" onClick={() => { setDraft(null); setSozlamaOchiq(false); setXato(""); }} disabled={saqlanmoqda}>{__kbUi("Bekor qilish")}</button>
                <button type="button" className="tj-asosiy" onClick={saqla} disabled={saqlanmoqda}>{saqlanmoqda ? <Loader2 size={15} className="animate-spin" /> : __kbUi("Saqlash")}</button>
              </>
            ) : (
              <button type="button" className="tj-asosiy" onClick={() => setDraft(clone(data))}>{__kbUi("Jadvalni sozlash")}</button>
            )}
          </div>
        )}
      </header>

      {yuklanmoqda && <p className="tj-holat" role="status"><Loader2 size={15} className="animate-spin" />{__kbUi(" Jadval yuklanmoqda…")}</p>}
      {xato && <p className="tj-xato" role="alert">{__kbUi(xato)}</p>}
      {xabar && <p className="tj-holat" role="status">{xabar}</p>}

      {joriy && (
        <>
          <nav className="tj-kunlar" aria-label={__kbUi("Hafta kunlari")}>
            {korinadiganKunlar.map((k) => (
              <button type="button" key={k.kun} onClick={() => setTanlanganKun(k.kun)}
                className={`tj-kun ${k.kun === kun?.kun ? "on" : ""} ${k.kun === bugunKun ? "bugun" : ""} ${k.turi}`}
                aria-current={k.kun === bugunKun ? "date" : undefined} aria-pressed={k.kun === kun?.kun}>
                <span className="tj-kun-nomi">{__kbUi(QISQA_KUN[k.kun - 1])}</span>
                <span className="tj-kun-sana">{__kbUi(sanaBelgisi(dushanbaISO, k.kun - 1))}</span>
                <span className="tj-kun-soni">{k.turi === "dam" ? __kbUi("dam") : k.turi === "amaliyot" ? __kbUi("amaliyot") : __kbUi(`${k.paralar.length} para`)}</span>
                {k.kun === bugunKun && <span className="tj-bugun-nuqta" aria-hidden="true" />}
              </button>
            ))}
          </nav>

          {kun && (
            <article className={`tj-kun-paneli ${kun.turi}`}>
              <div className="tj-kun-sarlavha">
                <h3>{__kbUi(KUN_NOMLARI[kun.kun - 1])}{kun.kun === bugunKun ? __kbUi(" — bugun") : __kbUi("")}</h3>
                {tahrir ? (
                  <div className="tj-tur-tanlash" role="group" aria-label={__kbUi("Kun turi")}>
                    {Object.entries(KUN_TURLARI).map(([k, nom]) => (
                      <button type="button" key={k} className={kun.turi === k ? "on" : ""} onClick={() => kunniYangila(kun.kun, { turi: k })}>{__kbUi(nom)}</button>
                    ))}
                  </div>
                ) : <span className={`tj-tur ${kun.turi}`}>{__kbUi(KUN_TURLARI[kun.turi])}</span>}
              </div>

              {kun.turi === "dam" && !tahrir ? (
                <p className="tj-bosh-kun">{__kbUi("Dam olish kuni. Paralar yo'q.")}</p>
              ) : kun.paralar.length === 0 && !tahrir ? (
                <p className="tj-bosh-kun">{kun.turi === "amaliyot" ? __kbUi("Amaliyot kuni — para kiritilmagan.") : __kbUi("Bu kunga para kiritilmagan.")}{!readOnly && __kbUi(" «Jadvalni sozlash» orqali qo'shing.")}</p>
              ) : (
                <ol className="tj-paralar">
                  {kun.paralar.map((p, i) => (
                    <li key={`${kun.kun}-${i}`} className="tj-para">
                      {tahrir ? (
                        <div className="tj-para-tahrir">
                          <label>{__kbUi("Para")}<select value={p.raqam} onChange={(e) => paraYangila(i, { raqam: Number(e.target.value) })}>{Array.from({ length: 10 }, (_, n) => n).filter((n) => n > 0 || sozlamalar.nol_para || p.raqam === 0).map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
                          <label className="tj-keng">{__kbUi("Fan")}<input value={p.fan} maxLength={120} onChange={(e) => paraYangila(i, { fan: e.target.value })} placeholder={__kbUi("masalan: Boshlang'ich matematika kursi nazariyasi")} /></label>
                          <label>{__kbUi("Turi")}<select value={p.turi} onChange={(e) => paraYangila(i, { turi: e.target.value })}>{Object.entries(PARA_TURLARI).map(([k, nom]) => <option key={k} value={k}>{__kbUi(nom)}</option>)}</select></label>
                          <label>{__kbUi("O'qituvchi")}<input value={p.oqituvchi} maxLength={120} onChange={(e) => paraYangila(i, { oqituvchi: e.target.value })} placeholder={__kbUi("ixtiyoriy")} /></label>
                          <label>{__kbUi("Xona")}<input value={p.xona} maxLength={40} onChange={(e) => paraYangila(i, { xona: e.target.value })} placeholder={__kbUi("masalan: 214")} /></label>
                          <label>{__kbUi("Vaqt")}<span className="tj-vaqt-juft"><input type="time" value={p.boshlanish} onChange={(e) => paraYangila(i, { boshlanish: e.target.value })} /><input type="time" value={p.tugash} onChange={(e) => paraYangila(i, { tugash: e.target.value })} /></span><small>{__kbUi("Bo'sh qolsa sozlamadan hisoblanadi")}</small></label>
                          <button type="button" className="tj-ochir" onClick={() => paraOchir(i)} aria-label={__kbUi("Parani o'chirish")}><Trash2 size={15} /></button>
                        </div>
                      ) : (
                        <>
                          <span className="tj-para-raqam" aria-label={__kbUi(`${p.raqam}-para`)}>{p.raqam}</span>
                          <div className="tj-para-matn">
                            <b>{p.fan}</b>
                            <small>{PARA_TURLARI[p.turi] || p.turi}{p.oqituvchi ? __kbUi(` · ${p.oqituvchi}`) : __kbUi("")}{p.xona ? __kbUi(` · ${p.xona}-xona`) : __kbUi("")}{p.izoh ? __kbUi(` · ${p.izoh}`) : __kbUi("")}</small>
                          </div>
                          <time className="tj-para-vaqt">{__kbUi(paraVaqti(p, sozlamalar))}</time>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {tahrir && kun.turi !== "dam" && (
                <button type="button" className="tj-qosh" onClick={paraQosh} disabled={kun.paralar.length >= 10}><Plus size={15} />{__kbUi(" Para qo'shish")}</button>
              )}
            </article>
          )}

          {tahrir && (
            <div className="tj-sozlama">
              <button type="button" className="tj-sozlama-tugma" onClick={() => setSozlamaOchiq((v) => !v)} aria-expanded={sozlamaOchiq}><Settings2 size={15} />{__kbUi(" Vaqt va hafta sozlamalari")}</button>
              {sozlamaOchiq && (
                <div className="tj-sozlama-maydonlar">
                  <label>{__kbUi("1-para boshlanishi")}<input type="time" value={sozlamalar.boshlanish || "08:30"} onChange={(e) => setDraft((old) => ({ ...old, sozlamalar: { ...old.sozlamalar, boshlanish: e.target.value } }))} /></label>
                  <label>{__kbUi("Para davomiyligi (daqiqa)")}<input type="number" min={30} max={180} value={sozlamalar.para_daqiqa ?? 80} onChange={(e) => setDraft((old) => ({ ...old, sozlamalar: { ...old.sozlamalar, para_daqiqa: Number(e.target.value) } }))} /></label>
                  <label>{__kbUi("Tanaffus (daqiqa)")}<input type="number" min={0} max={60} value={sozlamalar.tanaffus_daqiqa ?? 10} onChange={(e) => setDraft((old) => ({ ...old, sozlamalar: { ...old.sozlamalar, tanaffus_daqiqa: Number(e.target.value) } }))} /></label>
                  <label>{__kbUi("Haftada kunlar")}<select value={sozlamalar.kunlar_soni || 6} onChange={(e) => setDraft((old) => ({ ...old, sozlamalar: { ...old.sozlamalar, kunlar_soni: Number(e.target.value) } }))}><option value={5}>{__kbUi("5 kun (Du–Ju)")}</option><option value={6}>{__kbUi("6 kun (Du–Sha)")}</option><option value={7}>{__kbUi("7 kun")}</option></select></label>
                  <label className="tj-belgi"><input type="checkbox" checked={!!sozlamalar.nol_para} onChange={(e) => setDraft((old) => ({ ...old, sozlamalar: { ...old.sozlamalar, nol_para: e.target.checked } }))} />{__kbUi(" 0-para ham bor")}</label>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
