import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import FarzandFaollik from "./FarzandFaollik.jsx";
import {
  KUN_QISQA, KUNLAR, KURS, KURSLAR, haftalikReja, tarifRuxsati, xatoMatni, ovozMatni, qoshsaBoladimi, sinovSavollari, sum, tanlovChegarasi, tanlovXatosi,
} from "./bogchaReja.js";
import "./bolaMarkazi.css";

// REV162: ota-ona uchun bitta joy — farzandning kundaligi, haftalik rejasi, kurslar (narx, rozilik, to'lov) va «O'zingiz sinab ko'ring».
const BASE = (apiBase) => String(apiBase || "").replace(/\/+$/, "");
const PAY_HOSTS = ["my.click.uz", "checkout.paycom.uz", "checkout.test.paycom.uz"];

async function api(apiBase, token, path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE(apiBase)}${path}`, {
    method, cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data?.detail;
    const err = new Error(typeof d === "string" ? d : d?.xabar || `Server xatosi (${res.status})`);
    err.status = res.status; err.code = d?.kod || "";
    throw err;
  }
  return data;
}

const TABS = [
  ["kundalik", "📒", "Kundalik"],
  ["reja", "📅", "Reja"],
  ["kurslar", "🎓", "Kurslar"],
  ["sinov", "🧪", "Sinab ko‘ring"],
];

function QoidaMatn({ q }) {
  if (!q) return null;
  return <ul className="bm-rules">
    <li>📚 {__kbUi("Ish kunlari")}: <b>{q.kun}</b> {__kbUi("ta yangi dars")}</li>
    <li>🗓 {__kbUi("Shanba")}: <b>{q.shanba}</b> {__kbUi("ta yangi dars")}</li>
    <li>🔁 {__kbUi("Yakshanba — faqat takrorlash")}</li>
    <li>🎓 {__kbUi("Bir vaqtda")}: <b>{q.jami}</b> {__kbUi("tagacha kurs")} ({__kbUi("shundan chet tili")}: <b>{q.til}</b>)</li>
    <li>⏳ {__kbUi("Bir fan haftasiga ko‘pi bilan 3 marta, kun ora")}</li>
  </ul>;
}

function KunlarJadvali({ hafta, bugunKuni, compact = false }) {
  return <div className={`bm-week ${compact ? "is-compact" : ""}`} role="table" aria-label={__kbUi("Haftalik reja")}>
    {KUNLAR.map((kun, d) => <div key={kun} role="row" className={`bm-day ${d === bugunKuni ? "is-today" : ""} ${d === 6 ? "is-sun" : ""}`}>
      <b role="rowheader" title={__kbUi(kun)}>{__kbUi(KUN_QISQA[d])}</b>
      <div role="cell" className="bm-day-list">
        {d === 6 ? <span className="bm-chip is-review">🔁 {compact ? "" : __kbUi("Takror")}</span>
          : (hafta?.[d] || []).length ? hafta[d].map((k) => <span key={k} className={`bm-chip t-${KURS[k]?.turi}`} title={__kbUi(KURS[k]?.nom || k)}>
            {KURS[k]?.emoji}{compact ? "" : <> {__kbUi(KURS[k]?.nom || k)}</>}</span>)
            : <span className="bm-chip is-free">🎮 {compact ? "" : __kbUi("O‘yin")}</span>}
      </div>
    </div>)}
  </div>;
}

// ── Haftalik reja ─────────────────────────────────────────────
function RejaBolim({ holat, apiBase, token, onHolat, goKurslar }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [tanlov, setTanlov] = useState(() => holat.reja.tanlangan || []);
  useEffect(() => { setTanlov(holat.reja.tanlangan || []); }, [holat]);
  const r = holat.reja, q = holat.qoida, obuna = holat.obuna;
  const bepul = !holat.sozlama.obuna_majburiy;
  const save = async (fanlar) => {
    setBusy("save"); setError("");
    try { onHolat(await api(apiBase, token, "/api/bogcha/reja", { method: "PUT", body: { bola_id: holat.bola.user_id, fanlar } })); }
    catch (e) { setError(xatoMatni(e)); } finally { setBusy(""); }
  };
  const tugat = async (fan, qaytar = false) => {
    if (!qaytar && !window.confirm(__kbUi("Bu kurs tugatildimi? Uning o‘rniga navbatdagi kurs ochiladi. Keyin qaytadan ochish mumkin."))) return;
    setBusy(fan); setError("");
    try { onHolat(await api(apiBase, token, "/api/bogcha/reja/tugatildi", { method: "POST", body: { bola_id: holat.bola.user_id, fan, qaytar } })); }
    catch (e) { setError(xatoMatni(e)); } finally { setBusy(""); }
  };
  const move = (k, dir) => {
    const list = [...(r.tanlangan?.length ? r.tanlangan : r.faol.concat(r.navbat))];
    const i = list.indexOf(k), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    save(list);
  };
  const preview = useMemo(() => haftalikReja(tanlov, q), [tanlov, q]);

  if (!r.manba) {
    return <div className="bm-card">
      <h4>📅 {__kbUi("Haftalik reja hali tuzilmagan")}</h4>
      <p className="bm-muted">{__kbUi("AI ustoz farzandingiz yoshiga qarab darslarni hafta kunlariga o‘zi joylaydi: kuniga ozroq, lekin har kuni — shunda bola charchamaydi va puxta o‘rganadi.")}</p>
      <QoidaMatn q={q} />
      {bepul ? <>
        <p className="bm-label">{__kbUi("Qaysi kurslarni o‘qisin? (muhimini birinchi tanlang)")}</p>
        <KursTanlov fanlar={tanlov} setFanlar={setTanlov} tarif={{ toliq: true, kurs_soni: 0 }} qoida={q} />
        {tanlov.length > 0 && <><p className="bm-label">{__kbUi("Shu tanlov bilan hafta")}</p><KunlarJadvali hafta={preview.hafta} bugunKuni={r.bugun_kuni} /></>}
        <button type="button" className="bm-primary" disabled={!tanlov.length || busy === "save"} onClick={() => save(tanlov)}>
          {busy === "save" ? "…" : `✅ ${__kbUi("Rejani saqlash")}`}</button>
      </> : <button type="button" className="bm-primary" onClick={goKurslar}>🎓 {__kbUi("Kurs tanlash va to‘lash")}</button>}
      {error && <p className="bm-error" role="alert">{__kbUi(error)}</p>}
    </div>;
  }
  const done = (k) => Number(r.oldin?.[k] || 0) + Number(r.bugun?.[k] || 0);
  return <div className="bm-stack">
    <div className="bm-card">
      <div className="bm-card-head"><h4>📅 {__kbUi("Shu haftaning rejasi")}</h4>
        <small>{holat.bola.yosh} {__kbUi("yosh")} · {r.manba === "obuna" ? __kbUi("obuna bo‘yicha") : __kbUi("bepul reja")}</small></div>
      <KunlarJadvali hafta={r.hafta} bugunKuni={r.bugun_kuni} />
      <p className="bm-muted">💡 {__kbUi("Dars o‘tkazib yuborilsa yo‘qolmaydi: shu haftaning bo‘sh kunida o‘zi ochiladi va qolgan joyidan davom etadi.")}</p>
    </div>
    <div className="bm-card">
      <h4>🎓 {__kbUi("Hozir o‘qiyotgan kurslari")}</h4>
      <ul className="bm-courses">
        {r.faol.map((k, i) => <li key={k}>
          <span className="bm-c-emoji" aria-hidden="true">{KURS[k]?.emoji}</span>
          <span className="bm-c-main"><b>{__kbUi(KURS[k]?.nom || k)}</b>
            <small>{__kbUi("Shu hafta")}: {Math.min(done(k), r.haftalik[k] || 0)}/{r.haftalik[k] || 0} {__kbUi("dars")}{r.kvota?.[k] ? ` · ✅ ${__kbUi("bugun bor")}` : ""}</small></span>
          <span className="bm-c-act">
            <button type="button" aria-label={__kbUi("Yuqoriga")} disabled={i === 0 || Boolean(busy)} onClick={() => move(k, -1)}>↑</button>
            <button type="button" aria-label={__kbUi("Pastga")} disabled={i === r.faol.length - 1 || Boolean(busy)} onClick={() => move(k, 1)}>↓</button>
            <button type="button" className="bm-ghost" disabled={Boolean(busy)} onClick={() => tugat(k)}>{__kbUi("Tugatdi")}</button>
          </span>
        </li>)}
      </ul>
      {r.navbat.length > 0 && <>
        <p className="bm-label">⏳ {__kbUi("Navbatda")}</p>
        <p className="bm-muted">{__kbUi("Farzandingiz yoshida bir vaqtda shuncha kurs puxta o‘zlashtiriladi. Bitta kurs tugagach (yoki yoshi o‘tgach) navbatdagisi o‘zi ochiladi.")}</p>
        <div className="bm-chips">{r.navbat.map((k) => <span key={k} className="bm-chip is-wait">{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)}</span>)}</div>
      </>}
      {r.tugagan?.length > 0 && <>
        <p className="bm-label">🏁 {__kbUi("Tugatilgan")}</p>
        <div className="bm-chips">{r.tugagan.map((k) => <button key={k} type="button" className="bm-chip is-done" disabled={Boolean(busy)} onClick={() => tugat(k, true)}
          title={__kbUi("Qaytadan ochish")}>{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)} ↺</button>)}</div>
      </>}
      {obuna?.faol ? <button type="button" className="bm-link" onClick={goKurslar}>{__kbUi("Kurslarni o‘zgartirish")} →</button>
        : bepul && <details className="bm-more"><summary>{__kbUi("Kurslarni o‘zgartirish")}</summary>
          <KursTanlov fanlar={tanlov} setFanlar={setTanlov} tarif={{ toliq: true, kurs_soni: 0 }} qoida={q} />
          <button type="button" className="bm-primary" disabled={!tanlov.length || busy === "save"} onClick={() => save(tanlov)}>{__kbUi("Saqlash")}</button>
        </details>}
      {error && <p className="bm-error" role="alert">{__kbUi(error)}</p>}
    </div>
    <div className="bm-card"><h4>📏 {__kbUi("Yoshiga mos qoidalar")}</h4><QoidaMatn q={q} /></div>
  </div>;
}

// ── Kurs tanlash (chiplar) ──────────────────────────────────────
function KursTanlov({ fanlar, setFanlar, tarif, qoida }) {
  const [warn, setWarn] = useState("");
  const toggle = (k) => {
    if (fanlar.includes(k)) { setFanlar(fanlar.filter((x) => x !== k)); setWarn(""); return; }
    const c = qoshsaBoladimi(fanlar, k, tarif, qoida);
    if (!c.ok) {
 setWarn(c.sabab === "kurs" ? "Bu tarif faqat unda ko‘rsatilgan kurslar uchun." : c.sabab === "tarif" ? "Bu tarifga sig‘adigan kurslar tanlandi. Kattaroq tarifni tanlang yoki birini olib tashlang."
        : "Farzandingiz yoshida bundan ko‘p kurs bir vaqtda o‘qitilmaydi. Ko‘proq olmoqchi bo‘lsangiz, avval farzandingiz bitta tilni tugatsin.");
      return;
    }
    setWarn(""); setFanlar([...fanlar, k]);
  };
  const group = (turi, title) => <div className="bm-pick-group">
    <p className="bm-label">{__kbUi(title)}</p>
    <div className="bm-chips">{KURSLAR.filter((k) => k.turi === turi).map((k) => {
      const on = fanlar.includes(k.kalit);
      const yopiq = !tarifRuxsati(tarif, k.kalit);
      return <button key={k.kalit} type="button" aria-pressed={on} disabled={yopiq && !on} className={`bm-pick ${on ? "is-on" : ""}`} onClick={() => toggle(k.kalit)}>
        <span aria-hidden="true">{k.emoji}</span>{__kbUi(k.nom)}{on ? <i>{fanlar.indexOf(k.kalit) + 1}</i> : null}</button>;
    })}</div>
  </div>;
  const limit = tanlovChegarasi(tarif, qoida);
  return <div className="bm-pick">
    <p className="bm-count">{__kbUi("Tanlandi")}: <b>{fanlar.length}</b> / {limit} · {__kbUi("chet tili")}: <b>{fanlar.filter((k) => KURS[k]?.turi === "til").length}</b> / {qoida.til}</p>
    {group("til", "Tillar")}
    {group("fan", "Fanlar")}
    {warn && <p className="bm-warn" role="status">⚠️ {__kbUi(warn)}</p>}
  </div>;
}

// ── Kurslar: tarif, kurslar, rozilik, to'lov ───────────────────
function Qadam({ n, done, title, children, active }) {
  return <section className={`bm-step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
    <header><span className="bm-step-n" aria-hidden="true">{done ? "✓" : n}</span><b>{__kbUi(title)}</b></header>
    {children ? <div className="bm-step-body">{children}</div> : null}
  </section>;
}

function KurslarBolim({ holat, apiBase, token, onHolat, reload }) {
  const obuna = holat.obuna;
  const [tarifId, setTarifId] = useState(() => obuna?.tarif_id || holat.tariflar.find((t) => t.mumkin)?.id || null);
  const [fanlar, setFanlar] = useState(() => obuna?.fanlar || holat.reja.tanlangan || []);
  const [rozi, setRozi] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [buyurtma, setBuyurtma] = useState(null);
  const tarif = holat.tariflar.find((t) => t.id === tarifId) || null;
  const q = holat.qoida;
  const ul = holat.ulanish || {};
  const googleKerak = holat.google_yoqilgan && !ul.google;
  const tgKerak = holat.sozlama.telegram_majburiy && !ul.telegram;
  const xato = tanlovXatosi(fanlar, tarif, q);
  const tolovBor = holat.tolov?.click || holat.tolov?.payme;
  const preview = useMemo(() => haftalikReja(fanlar, q), [fanlar, q]);
  useEffect(() => {   // akkaunt oynasi yopilgach — Gmail/Telegram ulandimi, qayta tekshiramiz
    const again = () => reload();
    window.addEventListener("kb:account-closed", again);
    return () => window.removeEventListener("kb:account-closed", again);
  }, [reload]);
  useEffect(() => {   // tarif torayib qolsa — ortiqcha kurslar olib tashlanadi
    if (tarif) { const lim = tanlovChegarasi(tarif, q); const ok = fanlar.filter((k) => tarifRuxsati(tarif, k));
      const next = (ok.length ? ok : (tarif.kurslar?.length === 1 ? [tarif.kurslar[0]] : [])).slice(0, lim);
      if (next.join() !== fanlar.join()) setFanlar(next); }
  }, [tarifId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {   // Click/Payme'dan qaytganda — oxirgi buyurtma holati bir marta tekshiriladi
    let saved = null;
    try { saved = JSON.parse(window.localStorage.getItem("kabutar:bogcha-buyurtma") || "null"); } catch { saved = null; }
    if (!saved?.kod || Number(saved.bola) !== Number(holat.bola.user_id)) return;
    api(apiBase, token, `/api/bogcha/obuna/holat/${encodeURIComponent(saved.kod)}`).then((d) => {
      if (d.status === "tolandi") { try { window.localStorage.removeItem("kabutar:bogcha-buyurtma"); } catch { /* */ } reload(); }
      else if (d.status !== "bekor") setBuyurtma({ kod: saved.kod, amount_uzs: d.amount_uzs });
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const openAccount = (telegram) => window.dispatchEvent(new CustomEvent("kb:open-account", { detail: { telegram } }));

  const pay = async (tizim) => {
    setBusy(tizim); setError("");
    try {
      const ret = `${window.location.origin}${window.location.pathname}`;
      const d = await api(apiBase, token, "/api/bogcha/obuna/buyurtma", { method: "POST",
        body: { bola_id: holat.bola.user_id, tarif_id: tarifId, fanlar, rozilik: rozi, return_url: ret.startsWith("https://") ? ret : "" } });
      if (d.tolandi) { onHolat(d.holat); setBuyurtma(null); return; }
      setBuyurtma(d);
      try { window.localStorage.setItem("kabutar:bogcha-buyurtma", JSON.stringify({ kod: d.kod, bola: holat.bola.user_id })); } catch { /* ixtiyoriy */ }
      const url = d.havolalar?.[tizim];
      if (url) {
        const host = (() => { try { return new URL(url).host; } catch { return ""; } })();
        if (PAY_HOSTS.includes(host)) window.location.assign(url);
      }
    } catch (e) {
      if (e.code === "google" || e.code === "telegram") reload();
      setError(xatoMatni(e));
    } finally { setBusy(""); }
  };
  const check = async () => {
    if (!buyurtma?.kod) return;
    setBusy("check");
    try {
      const d = await api(apiBase, token, `/api/bogcha/obuna/holat/${encodeURIComponent(buyurtma.kod)}`);
      if (d.status === "tolandi") { setBuyurtma(null); try { window.localStorage.removeItem("kabutar:bogcha-buyurtma"); } catch { /* */ } reload(); } else setError("To‘lov hali tasdiqlanmadi. To‘lagan bo‘lsangiz, 1–2 daqiqadan keyin qayta tekshiring.");
    } catch (e) { setError(xatoMatni(e)); } finally { setBusy(""); }
  };

  return <div className="bm-stack">
    {obuna && <div className={`bm-card bm-sub ${obuna.faol ? "is-on" : "is-off"}`}>
      <h4>{obuna.faol ? "✅" : "⌛"} {__kbUi(obuna.faol ? "Obuna faol" : "Obuna muddati tugagan")}</h4>
      <p><b>{obuna.faol ? `${obuna.tugaydi}` : obuna.tugaydi}</b> {__kbUi("gacha")}{obuna.faol ? ` · ${obuna.qoldi_kun} ${__kbUi("kun qoldi")}` : ""}</p>
      <div className="bm-chips">{obuna.fanlar.map((k) => <span key={k} className="bm-chip">{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)}</span>)}</div>
      <p className="bm-muted">🔄 {__kbUi("Uzaytirish yoki kurslarni o‘zgartirish uchun quyidagi qadamlarni bajaring.")}</p>
      {obuna.narx_qulf_gacha && <p className="bm-muted">🔒 {__kbUi("Siz uchun narx shu sanagacha o‘zgarmaydi")}: <b>{obuna.narx_qulf_gacha}</b> ({sum(obuna.narx_uzs)} / {__kbUi("oy")})</p>}
    </div>}

    <Qadam n={1} done={!googleKerak} title="Gmail akkauntini ulang">
      {googleKerak ? <>
        <p className="bm-muted">{__kbUi("Gmail — akkauntingizni yo‘qotmaslik va boshqa telefon yoki kompyuterdan kirish uchun. To‘lov shu akkauntga bog‘lanadi.")}</p>
        <button type="button" className="bm-secondary" onClick={() => openAccount(false)}>📧 {__kbUi("Gmail ulash")}</button>
      </> : <p className="bm-ok">{__kbUi(holat.google_yoqilgan ? "Gmail ulangan" : "Kerak emas")}</p>}
    </Qadam>
    <Qadam n={2} done={!tgKerak} title="Telegram’ni ulang">
      {tgKerak ? <>
        <p className="bm-muted">{__kbUi("Farzandingiz darsni boshlaganda, tugatganda va har kuni 20:00 da bugungi AI bahosi Telegram’ingizga keladi.")}</p>
        <ol className="bm-howto"><li>{__kbUi("«Telegram ulash» tugmasini bosing")}</li><li>{__kbUi("Botda «Start» ni bosing va raqamingizni yuboring")}</li><li>{__kbUi("Shu sahifaga qayting — belgi yashil bo‘ladi")}</li></ol>
        <button type="button" className="bm-secondary" onClick={() => openAccount(true)}>✈️ {__kbUi("Telegram ulash")}</button>
      </> : <p className="bm-ok">{__kbUi("Telegram ulangan — xabarlar keladi")}</p>}
    </Qadam>
    <Qadam n={3} done={Boolean(tarif)} title="Tarifni tanlang" active>
      {!holat.tariflar.length ? <p className="bm-muted">{__kbUi("Tariflar hali e’lon qilinmagan. Tez orada.")}</p> :
        <div className="bm-tarifs">{holat.tariflar.map((t) => <button key={t.id} type="button" disabled={!t.mumkin} aria-pressed={t.id === tarifId}
          className={`bm-tarif ${t.id === tarifId ? "is-on" : ""}`} onClick={() => setTarifId(t.id)}>
          <b>{__kbUi(t.nom)}</b>
          <span className="bm-price">{t.narx_uzs ? sum(t.narx_uzs) : __kbUi("Bepul")}<small>/{__kbUi("oy")}</small></span>
          <small>{t.toliq ? `${__kbUi("Yoshiga ruxsat etilgan hammasi")}: ${t.sigadi}` : `${t.sigadi} ${__kbUi("ta kurs")}`}</small>
          {t.kurslar?.length > 0 && <span className="bm-tarif-kurs">{t.kurslar.map((k) => <i key={k} title={__kbUi(KURS[k]?.nom || k)}>{KURS[k]?.emoji}</i>)}</span>}
          {t.qulf ? <em>🔒 {__kbUi("Sizga eski narx")}: {t.qulf_gacha} {__kbUi("gacha")}</em>
            : t.qulf_yil ? <em>🔒 {__kbUi("Narx")} {t.qulf_yil} {__kbUi("yilgacha o‘zgarmaydi")}</em> : null}
          {!t.mumkin && <em className="is-no">{__kbUi("Bu yoshda bir vaqtda bunchalik kurs o‘qitilmaydi")}</em>}
        </button>)}</div>}
    </Qadam>
    {tarif && <Qadam n={4} done={!xato} title="Kurslarni tanlang">
      <KursTanlov fanlar={fanlar} setFanlar={setFanlar} tarif={tarif} qoida={q} />
      {fanlar.length > 0 && <><p className="bm-label">{__kbUi("AI ustoz shunday joylaydi")}</p><KunlarJadvali hafta={preview.hafta} bugunKuni={holat.reja.bugun_kuni} compact /></>}
    </Qadam>}
    {tarif && <Qadam n={5} done={rozi} title="Shartlar bilan tanishing">
      <ul className="bm-terms">{holat.rozilik.bandlar.map((b) => <li key={b}>{__kbUi(b)}</li>)}</ul>
      <label className="bm-agree"><input type="checkbox" checked={rozi} onChange={(e) => setRozi(e.target.checked)} />
        <span>{__kbUi("Shartlar bilan tanishdim va roziman")}</span></label>
    </Qadam>}
    {tarif && <Qadam n={6} done={false} title="To‘lov">
      {xato ? <p className="bm-warn">⚠️ {__kbUi(xato)}</p>
        : googleKerak || tgKerak ? <p className="bm-warn">⚠️ {__kbUi("Avval Gmail va Telegram’ni ulang (1–2-qadam).")}</p>
        : !rozi ? <p className="bm-muted">{__kbUi("«Roziman» belgisini qo‘ying.")}</p>
        : !tarif.narx_uzs ? <button type="button" className="bm-primary" disabled={Boolean(busy)} onClick={() => pay("bepul")}>✅ {__kbUi("Bepul boshlash")}</button>
        : !tolovBor ? <p className="bm-muted">{__kbUi("Onlayn to‘lov tez orada ulanadi. Hozircha administrator bilan bog‘laning.")}</p>
        : <>
          <p className="bm-total">{__kbUi("To‘lanadi")}: <b>{sum(tarif.narx_uzs)}</b> · 30 {__kbUi("kun")}</p>
          <div className="bm-pay">
            {holat.tolov.click && <button type="button" className="bm-pay-btn is-click" disabled={Boolean(busy)} onClick={() => pay("click")}>{busy === "click" ? "…" : "Click"}</button>}
            {holat.tolov.payme && <button type="button" className="bm-pay-btn is-payme" disabled={Boolean(busy)} onClick={() => pay("payme")}>{busy === "payme" ? "…" : "Payme"}</button>}
          </div>
          <p className="bm-muted">{__kbUi("To‘lov tasdiqlangach kurslar avtomatik ochiladi — hech kimni kutish shart emas.")}</p>
        </>}
      {buyurtma && <div className="bm-order">
        <p>{__kbUi("Buyurtma raqami")}: <b>{buyurtma.kod}</b> · {sum(buyurtma.amount_uzs)}</p>
        <button type="button" className="bm-secondary" disabled={busy === "check"} onClick={check}>{__kbUi("To‘lovni tekshirish")}</button>
      </div>}
      {error && <p className="bm-error" role="alert">{__kbUi(error)}</p>}
    </Qadam>}
  </div>;
}

// ── O'zingiz sinab ko'ring ─────────────────────────────────────
// REV166: oson — 3 qadamli yo'riqnoma, «Bugun / Shu hafta / Hammasi», so'zlar ro'yxati (bosilsa to'g'ri aytilishi eshitiladi),
// «Boshlash» dan keyin savollar; oxirida yordam kerak bo'lgan so'zlar alohida chiqadi.
const DAVR = [["bugun", "Bugun"], ["hafta", "Shu hafta"], ["", "Hammasi"]];
function SinovBolim({ apiBase, token, childId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [fan, setFan] = useState("");
  const [davr, setDavr] = useState(null);
  const [seed, setSeed] = useState(() => Date.now() % 1000);
  const [boshlandi, setBoshlandi] = useState(false);
  const [i, setI] = useState(0);
  const [javob, setJavob] = useState(null);
  const [ball, setBall] = useState({ togri: 0, jami: 0 });
  const [qiyin, setQiyin] = useState([]);
  const audio = useRef(null);
  useEffect(() => {
    let stop = false;
    api(apiBase, token, `/api/ota/bola_sinov?${new URLSearchParams({ bola_id: childId })}`).then((d) => { if (!stop) setData(d); })
      .catch((e) => { if (!stop) setError(xatoMatni(e)); });
    return () => { stop = true; };
  }, [apiBase, token, childId]);
  const all = useMemo(() => data?.sozlar || [], [data]);
  // bugun so'z bo'lsa — bugungilar, bo'lmasa shu hafta, u ham bo'lmasa hammasi
  const davrFaol = davr ?? (all.some((w) => w.kim === "bugun") ? "bugun" : all.some((w) => w.kim !== "oldin") ? "hafta" : "");
  const words = useMemo(() => all.filter((w) => (!fan || w.kalit === fan)
    && (!davrFaol || (davrFaol === "bugun" ? w.kim === "bugun" : w.kim !== "oldin"))), [all, fan, davrFaol]);
  const savollar = useMemo(() => sinovSavollari(words, { soni: 6, seed }), [words, seed]);
  const fans = useMemo(() => [...new Set(all.map((w) => w.kalit).filter(Boolean))], [all]);
  const play = useCallback((w) => {
    try {
      audio.current?.pause();
      const a = new Audio(`${BASE(apiBase)}/api/ovoz?k=133&${new URLSearchParams({ matn: ovozMatni(w.soz, w.til), jins: "qiz" })}`);
      audio.current = a; a.play().catch(() => {});
    } catch { /* ovoz ixtiyoriy */ }
  }, [apiBase]);
  const restart = (start = boshlandi) => { setSeed((n) => n + 17); setI(0); setJavob(null); setBall({ togri: 0, jami: 0 }); setQiyin([]); setBoshlandi(start); };
  const mark = (ok, w) => { setJavob(ok ? "ok" : "no"); setBall((b) => ({ togri: b.togri + (ok ? 1 : 0), jami: b.jami + 1 }));
    if (!ok && w) setQiyin((q) => (q.some((x) => x.soz === w.soz) ? q : [...q, w])); };

  if (error) return <p className="bm-error">{__kbUi(error)}</p>;
  if (!data) return <p className="bm-muted" role="status">{__kbUi("Yuklanmoqda…")}</p>;
  if (all.filter((w) => w.emoji).length < 2) return <div className="bm-card"><h4>🧪 {__kbUi("O‘zingiz sinab ko‘ring")}</h4>
    <p className="bm-muted">{__kbUi("Farzandingiz bir nechta dars o‘tgach, shu yerda u o‘rgangan so‘zlardan kichik o‘yin chiqadi: rasmni topish va so‘zni aytish.")}</p></div>;
  const s = savollar[i];
  const tugadi = boshlandi && i >= savollar.length;
  const filtrlar = <>
    <div className="bm-chips" role="group" aria-label={__kbUi("Qaysi so‘zlar")}>
      {DAVR.map(([k, t]) => <button key={k || "all"} type="button" className={`bm-pick ${davrFaol === k ? "is-on" : ""}`}
        onClick={() => { setDavr(k); restart(false); }}>{__kbUi(t)}</button>)}
    </div>
    {fans.length > 1 && <div className="bm-chips">
      <button type="button" className={`bm-pick ${!fan ? "is-on" : ""}`} onClick={() => { setFan(""); restart(false); }}>{__kbUi("Hamma fanlar")}</button>
      {fans.map((k) => <button key={k} type="button" className={`bm-pick ${fan === k ? "is-on" : ""}`} onClick={() => { setFan(k); restart(false); }}>{KURS[k]?.emoji} {__kbUi(KURS[k]?.nom || k)}</button>)}
    </div>}
  </>;

  if (!boshlandi) return <div className="bm-card bm-quiz">
    <div className="bm-card-head"><h4>🧪 {__kbUi("O‘zingiz sinab ko‘ring")}</h4><small>{__kbUi("2 daqiqa")}</small></div>
    <ol className="bm-steps">
      <li><span aria-hidden="true">👧</span>{__kbUi("Farzandingizni yoningizga chaqiring.")}</li>
      <li><span aria-hidden="true">🖼</span>{__kbUi("Rasmni ko‘rsatib «Bu nima?» deb so‘rang — yoki 🔊 ni bosing, u rasmni topsin.")}</li>
      <li><span aria-hidden="true">✅</span>{__kbUi("Aytsa — «Aytdi», aytolmasa — «Yordam kerak». Telefon to‘g‘ri aytilishini o‘zi eshittiradi.")}</li>
    </ol>
    {filtrlar}
    {words.length > 0 ? <>
      <p className="bm-label">📝 {__kbUi(davrFaol === "bugun" ? "Bugun o‘rgangan so‘zlari" : "O‘rgangan so‘zlari")} · {words.length}</p>
      <div className="bm-wordlist">{words.slice(0, 24).map((w) => <button key={`${w.kalit}-${w.soz}`} type="button" className={`bm-word ${w.aytdi === false ? "is-try" : ""}`}
        onClick={() => play(w)} title={__kbUi("Bosing — to‘g‘ri aytilishini eshitasiz")}>
        <span aria-hidden="true">{w.emoji || "🔤"}</span><b>{w.soz}</b><i aria-hidden="true">🔊</i></button>)}</div>
      <p className="bm-muted">💡 {__kbUi("Sariq so‘zlarni farzandingiz darsda hali aytolmagan — avval shularni so‘rang.")}</p>
    </> : <p className="bm-muted">{__kbUi("Bu davrda so‘z yo‘q — «Shu hafta» yoki «Hammasi» ni tanlang.")}</p>}
    <button type="button" className="bm-primary bm-start" disabled={savollar.length < 2} onClick={() => restart(true)}>▶️ {__kbUi("Boshlash")} · {savollar.length} {__kbUi("savol")}</button>
  </div>;

  return <div className="bm-card bm-quiz">
    <div className="bm-card-head"><h4>🧪 {__kbUi("O‘zingiz sinab ko‘ring")}</h4><small>{Math.min(i + 1, savollar.length)}/{savollar.length}</small></div>
    <div className="bm-progress" aria-hidden="true"><i style={{ width: `${Math.round((Math.min(i, savollar.length) / savollar.length) * 100)}%` }} /></div>
    {tugadi ? <div className="bm-quiz-end">
      <span aria-hidden="true">{ball.togri >= ball.jami * 0.8 ? "🏆" : ball.togri >= ball.jami / 2 ? "👍" : "💪"}</span>
      <b>{ball.togri} / {ball.jami}</b>
      <p className="bm-muted">{__kbUi(ball.togri >= ball.jami * 0.8 ? "Zo‘r! Farzandingiz so‘zlarni yaxshi eslab qolgan." : "Yaxshi urinish! Shu so‘zlarni bugun kechqurun yana bir bor takrorlang.")}</p>
      {qiyin.length > 0 && <div className="bm-hard">
        <p className="bm-label">🔁 {__kbUi("Takrorlash kerak")}</p>
        <div className="bm-wordlist">{qiyin.map((w) => <button key={w.soz} type="button" className="bm-word is-try" onClick={() => play(w)}>
          <span aria-hidden="true">{w.emoji}</span><b>{w.soz}</b><i aria-hidden="true">🔊</i></button>)}</div>
      </div>}
      <div className="bm-row">
        <button type="button" className="bm-primary" onClick={() => restart(true)}>🔁 {__kbUi("Yangi savollar")}</button>
        <button type="button" className="bm-secondary" onClick={() => restart(false)}>{__kbUi("So‘zlar ro‘yxati")}</button>
      </div>
    </div> : <div className="bm-q">
      {s.turi === "top" ? <>
        <p className="bm-q-title">{__kbUi("🔊 ni bosing va so‘rang: qaysi rasm?")}</p>
        <button type="button" className="bm-say" onClick={() => play(s)}>🔊 {__kbUi("Eshittirish")}</button>
        <div className="bm-opts">{s.variantlar.map((v) => <button key={v.soz} type="button" disabled={javob !== null}
          className={`bm-opt ${javob !== null && v.togri ? "is-right" : ""}`} onClick={() => mark(v.togri, s)} aria-label={v.soz}>{v.emoji}</button>)}</div>
        <p className="bm-muted">{__kbUi("Rasmni farzandingiz o‘zi bossin.")}</p>
      </> : <>
        <p className="bm-q-title">{__kbUi("Rasmni ko‘rsating va so‘rang: «Bu nima?»")}{s.til && KURS[s.kalit] ? ` (${__kbUi(KURS[s.kalit].nom)})` : ""}</p>
        <div className="bm-big" aria-hidden="true">{s.emoji}</div>
        <div className="bm-row">
          {javob === null && <>
            <button type="button" className="bm-yes" onClick={() => mark(true, s)}>✅ {__kbUi("Aytdi")}</button>
            <button type="button" className="bm-no" onClick={() => { mark(false, s); play(s); }}>🔁 {__kbUi("Yordam kerak")}</button>
          </>}
          <button type="button" className="bm-secondary" onClick={() => play(s)}>🔊 {__kbUi("To‘g‘ri aytilishi")}</button>
        </div>
      </>}
      {javob !== null && <div className={`bm-feedback ${javob === "ok" ? "is-ok" : "is-no"}`}>
        <b>{javob === "ok" ? `🎉 ${__kbUi("Barakalla!")}` : `💡 ${__kbUi("To‘g‘ri javob")}: ${s.soz}`}</b>
        <button type="button" className="bm-primary" onClick={() => { setI(i + 1); setJavob(null); }}>{__kbUi("Keyingisi")} →</button>
      </div>}
    </div>}
  </div>;
}

/** Ota-ona markazi: tablar. Bog'cha bolasi bo'lmasa — faqat kundalik. */
export default function BolaMarkazi({ apiBase, token, childId, initialTab = "kundalik" }) {
  useKbInterfaceLocale();
  const [tab, setTab] = useState(initialTab);
  const [holat, setHolat] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    api(apiBase, token, `/api/bogcha/holat?${new URLSearchParams({ bola_id: childId })}`).then((d) => { setHolat(d); setError(""); })
      .catch((e) => { setHolat(null); setError(e.status === 404 ? "" : xatoMatni(e)); });
  }, [apiBase, token, childId]);
  useEffect(() => { setHolat(null); load(); }, [load]);
  const bogcha = Boolean(holat?.bola?.bogcha);
  const tabs = bogcha ? TABS : TABS.filter(([id]) => id === "kundalik");
  return <div className="bm-root">
    {tabs.length > 1 && <nav className="bm-tabs" role="tablist" aria-label={__kbUi("Farzandim")}>
      {tabs.map(([id, emoji, title]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
        <span aria-hidden="true">{emoji}</span>{__kbUi(title)}</button>)}
    </nav>}
    {tab === "kundalik" || !bogcha ? <FarzandFaollik apiBase={apiBase} token={token} childId={childId} onSinov={bogcha ? () => setTab("sinov") : undefined} />
      : tab === "reja" ? <RejaBolim holat={holat} apiBase={apiBase} token={token} onHolat={setHolat} goKurslar={() => setTab("kurslar")} />
      : tab === "kurslar" ? <KurslarBolim holat={holat} apiBase={apiBase} token={token} onHolat={setHolat} reload={load} />
      : <SinovBolim apiBase={apiBase} token={token} childId={childId} />}
    {error && tab !== "kundalik" && <p className="bm-error" role="alert">{__kbUi(error)}</p>}
  </div>;
}
