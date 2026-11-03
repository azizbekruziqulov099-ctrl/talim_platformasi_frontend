import React, { useEffect, useState } from "react";
import { T, tf, xbTil } from "./xbTil.js";   // REV270: uch til
import XbSavol from "./XbSavol.jsx";
import XbDoska, { XbUstoz } from "./XbDoska.jsx";
import { useUstozOvoz, xbFetch } from "./xbOvoz.js";
import { FIKRLASH, GAP_TUR } from "./xbRules.js";

/**
 * Mavzu sahifasi: xalqaro statistika (davlatlar), o'quvchining darajasi, sinfdoshlar orasida o'rni, yechish strategiyalari,
 * tipik xatolar, namuna savollar (har fikrlash darajasidan) va bog'liq 1–11 sinf maktab darslari.
 * `oldi` — maktab darsidan oldingi qisqa ko'rinish (mavzu oldi bloki).
 */
export default function XbMavzu({ apiBase, token, jins, ustoz = "sardor", kalit, malumot = null, oldi = false, onDars, onMashq, onMaktabDarsi, onYopish, onDavom }) {
  const ovoz = useUstozOvoz(apiBase, jins);
  const [d, setD] = useState(malumot);
  const [xato, setXato] = useState("");
  const [namuna, setNamuna] = useState(null);
  useEffect(() => {
    if (malumot) { setD(malumot); return undefined; }
    let tirik = true;
    xbFetch(apiBase, `/api/xalqaro/mavzu/${encodeURIComponent(kalit)}`, token).then((r) => tirik && setD(r)).catch((e) => tirik && setXato(e.message));
    return () => { tirik = false; };
  }, [kalit, malumot]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!d) return undefined;
    const h = d.holat || {};
    const r = d.reyting;
    const gap = d.ustoz?.matn ? `${d.ustoz.matn} ` : "";
    const matn = [gap, oldi ? tf("Darsdan oldin bilib oling:") : "",
      tf(d.dastur === "PISA" ? "Xalqaro {dastur} tadqiqotida «{nom}» mavzusidagi savollarni OECD mamlakatlarida o‘quvchilarning o‘rtacha {foiz} foizi to‘g‘ri yechgan."
        : "Xalqaro {dastur} tadqiqotida «{nom}» mavzusidagi savollarni dunyo bo‘yicha o‘quvchilarning o‘rtacha {foiz} foizi to‘g‘ri yechgan.", { dastur: d.dastur || "TIMSS", nom: d.nom, foiz: d.xalqaro_foiz ?? "—" }),
      d.davlatlar?.[0] ? tf("Eng yaxshisi — {nom}, {foiz} foiz.", { nom: d.davlatlar[0][0], foiz: d.davlatlar[0][1] }) : "",
      h.urinilgan ? tf("Siz bu mavzuning {jami} ta savolidan {oz} tasini o‘zlashtirgansiz.", { jami: h.jami, oz: h.ozlashtirgan }) : tf("Siz bu mavzuni hali boshlamagansiz."),
      r?.orin ? tf("Sinfdoshlaringiz orasida {jami} kishidan {orin}-o‘rindasiz.", { jami: r.jami, orin: r.orin }) : ""].filter(Boolean).join(" ");
    const t = setTimeout(() => ovoz.say(matn), 400);
    return () => { clearTimeout(t); ovoz.hush(); };
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  if (xato) return <div className="xb-panel"><p className="xb-xato">{T(xato)}</p><button type="button" className="xb-btn" onClick={onYopish}>{T("← Orqaga")}</button></div>;
  if (!d) return <div className="xb-panel"><p className="xb-muted">⏳ {T("Yuklanmoqda…")}</p></div>;
  const h = d.holat || {};
  const gapRang = GAP_TUR[d.ustoz?.tur] || GAP_TUR.salom;
  return <div className={`xb-panel xb-mavzu ${oldi ? "is-oldi" : ""}`}>
    <div className="xb-mashq-bosh">
      {onYopish && <button type="button" className="xb-btn xb-btn-yengil" onClick={() => { ovoz.hush(); onYopish(); }}>{oldi ? "✕" : `← ${T("Orqaga")}`}</button>}
      <b>{oldi ? `🌍 ${T("Mavzu oldidan: xalqaro baholashda")}` : `🌍 ${d.nom}`}</b>
      <small>{d.toplam_nomi?.dastur} · {tf("{n}-sinf", { n: d.toplam_nomi?.sinf })} · {d.soha_nomi}</small>
    </div>
    <div className="xb-mavzu-bosh">
      <XbUstoz ustoz={ustoz} speaking={ovoz.speaking} />
      <div className="xb-pufak" style={{ borderColor: gapRang[0] }}>
        {d.ustoz?.matn && <p style={{ color: gapRang[0] }}>{gapRang[1]} {d.ustoz.matn}</p>}
        <p>{oldi && <b>{d.nom}. </b>}{T("Dunyo bo‘yicha to‘g‘ri yechganlar")}: <b>{d.xalqaro_foiz}%</b>{d.maqsad ? <> · {d.maqsad}</> : null}</p>
      </div>
    </div>
    <div className="xb-kartalar">
      <div className="xb-karta"><small>{T("Sizning o‘zlashtirishingiz")}</small><b>{h.foiz ?? 0}%</b><span className="xb-progress"><i style={{ width: `${h.foiz || 0}%` }} /></span><small>{h.ozlashtirgan || 0}/{h.jami || 0} {T("savol")}{h.aniqlik !== null && h.aniqlik !== undefined ? ` · ${T("aniqlik")} ${h.aniqlik}%` : ""}</small></div>
      <div className="xb-karta"><small>{T("Sinfdoshlar orasida")}</small><b>{d.reyting?.orin ? `${d.reyting.orin}/${d.reyting.jami}` : "—"}</b><small>{d.reyting?.orin ? `${T("eng ko‘p")}: ${d.reyting.eng_kop}` : T("reyting uchun kamida 3 o‘quvchi kerak")}</small></div>
      <div className="xb-karta"><small>{T("Fikrlash darajalari")}</small>
        {Object.entries(d.fikrlash || {}).map(([k, v]) => <small key={k}>{T(FIKRLASH[k] || k)}: <b>{v.ozlashtirgan}/{v.jami}</b></small>)}</div>
    </div>
    {d.pisa_qiyinlik && <section className="xb-blok"><h4>📏 {T("PISA qiyinligi")}</h4>
      <p>{T("Bu mavzu savollari PISA shkalasida")} <b>{d.pisa_qiyinlik.min}–{d.pisa_qiyinlik.max}</b> {T("ball oralig‘ida, o‘rtacha")} <b>{d.pisa_qiyinlik.ortacha}</b> ({d.pisa_qiyinlik.daraja}).
        {" "}{T("O‘zbekiston o‘quvchilarining PISA 2022 dagi o‘rtacha natijasi: matematika 364, o‘qish 336; tayanch daraja — taxminan 410–420 ball.")}</p></section>}
    {d.davlatlar?.length > 0 && <section className="xb-blok"><h4>🏆 {T("Davlatlar: shu mavzu savollarini to‘g‘ri yechganlar (%) — TIMSS 2011")}</h4>
      <div className="xb-ustunlar">{[...d.davlatlar, [T("Dunyo o‘rtachasi"), d.xalqaro_foiz]].map(([n, f]) => <div key={n} className="xb-ustun-q"><span>{n}</span>
        <span className="xb-progress"><i style={{ width: `${f}%` }} /></span><b>{f}%</b></div>)}</div></section>}
    {!oldi && d.strategiyalar?.length > 0 && <section className="xb-blok"><h4>🧭 {T("Xalqaro savollarni yechish yo‘llari")}</h4><ul>{d.strategiyalar.map((s) => <li key={s}>{s}</li>)}</ul></section>}
    {d.tipik_xatolar?.length > 0 && <section className="xb-blok"><h4>⚠️ {T("Ko‘p uchraydigan xatolar")}</h4><ul>{d.tipik_xatolar.slice(0, oldi ? 3 : 8).map((s) => <li key={s}>{s}</li>)}</ul></section>}
    {d.namuna?.length > 0 && <section className="xb-blok"><h4>📝 {T("Namuna savollar — har darajadan bittadan")}</h4>
      {d.namuna.map((s, k) => <div key={s.savol_id} className="xb-namuna">
        <XbSavol savol={s} javob={namuna?.[k]?.javob || ""} holat={namuna?.[k]?.holat || null} ovoz={ovoz} raqam={k + 1}
          onJavob={(j) => {
            const ok = s.turi === "tanlov" ? "ABCD".indexOf(String(j).toUpperCase()) === s.togri : String(s.javob).split("|").some((x) => x.replace(/\s/g, "").replace(",", ".") === String(j).replace(/\s/g, "").replace(",", "."));
            setNamuna((n) => ({ ...(n || {}), [k]: { javob: j, holat: s.turi === "tanlov" ? { ok, togri: s.togri } : null } }));
          }} />
        {s.turi !== "tanlov" && !namuna?.[k]?.holat && namuna?.[k]?.javob && <button type="button" className="xb-btn" onClick={() => {
          const j = namuna[k].javob;
          const ok = String(s.javob).split("|").some((x) => x.replace(/\s/g, "").replace(",", ".").toLowerCase() === String(j).replace(/\s/g, "").replace(",", ".").toLowerCase());
          setNamuna((n) => ({ ...n, [k]: { javob: j, holat: { ok, togri: null } } }));
        }}>{T("Tekshirish")}</button>}
        {namuna?.[k]?.holat && <>
          <p className={namuna[k].holat.ok ? "xb-ok" : "xb-xato"}>{namuna[k].holat.ok ? `✅ ${T("To‘g‘ri!")}` : `❌ ${T("To‘g‘ri javob")}: ${s.turi === "tanlov" ? "ABCD"[s.togri] : String(s.javob).split("|")[0]}`}</p>
          {s.usul && <p className="xb-muted">🧭 {s.usul}</p>}
          {namuna[k].doska ? <XbDoska qadamlar={s.yechim} ovoz={ovoz} ustoz={ustoz} sarlavha={T("Yechim")} />
            : <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); setNamuna((n) => ({ ...n, [k]: { ...n[k], doska: true } })); }}>🧑‍🏫 {T("Yechimni doskada ko‘rish")}</button>}
        </>}
      </div>)}</section>}
    {!oldi && d.maktab_darslari?.length > 0 && <section className="xb-blok"><h4>📚 {T("Kerakli maktab darslari (1–11 sinf) — takrorlash uchun")}</h4>
      <div className="xb-maktab">{d.maktab_darslari.map((m) => <button key={m.topic_code} type="button" className="xb-btn xb-btn-yengil" onClick={() => onMaktabDarsi?.(m)}>
        <small>{tf("{n}-sinf", { n: m.sinf })} · {m.fan}</small> {m.nom}</button>)}</div></section>}
    <div className="xb-tug-qator">
      {oldi && onDavom && <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => { ovoz.hush(); onDavom(); }}>▶ {T("Maktab darsini boshlash")}</button>}
      {d.dars_kodi && onDars && <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => { ovoz.hush(); onDars(d); }}>🧑‍🏫 {T("Xalqaro darajadagi dars")}</button>}
      {onMashq && <button type="button" className="xb-btn" onClick={() => { ovoz.hush(); onMashq(d); }}>✍️ {T("Mashq (8 savol)")}</button>}
    </div>
  </div>;
}
