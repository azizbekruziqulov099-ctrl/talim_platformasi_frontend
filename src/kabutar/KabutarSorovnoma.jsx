// REV416: so'rovnoma — Telegram kabi: savol, variantlar, foizlar; bir yoki bir nechta tanlov; anonim yoki kim ovoz bergani ko'rinadi.
import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const post = (apiBase, yol, maydon) => { const f = new FormData(); Object.entries(maydon).forEach(([k, v]) => f.append(k, typeof v === "string" ? v : JSON.stringify(v)));
  return fetch(`${String(apiBase || "").replace(/\/+$/, "")}${yol}`, { method: "POST", body: f }).then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Xato"); return d; }); };

export function SorovnomaKarta({ s, apiBase, token, onYangi }) {
  const [tanl, setTanl] = useState(s.meniki || []);
  const [xato, setXato] = useState("");
  const berdim = (s.meniki || []).length > 0;
  const korsat = berdim || s.yopiq || s.meniki_yaratgan;
  const yubor = (t) => post(apiBase, `/api/chat/sorovnoma/${s.id}/ovoz`, { token, tanlov: t }).then((d) => { setXato(""); onYangi?.(d.sorovnoma); setTanl(d.sorovnoma.meniki); }).catch((e) => setXato(e.message));
  const max = Math.max(1, ...(s.soni || [0]));
  return <div className="kb-poll" onClick={(e) => e.stopPropagation()}>
    <b className="kb-poll-savol">📊 {s.savol}</b>
    <small className="kb-poll-tur">{s.yopiq ? __kbUi("Yopilgan so‘rovnoma") : s.anonim ? __kbUi("Anonim so‘rovnoma") : __kbUi("Ochiq so‘rovnoma")}{s.kop_tanlov ? ` · ${__kbUi("bir nechta javob")}` : ""}</small>
    {s.variantlar.map((v, k) => { const n = s.soni?.[k] || 0; const f = s.jami ? Math.round((100 * n) / s.jami) : 0; const on = s.kop_tanlov ? tanl.includes(k) : (s.meniki || []).includes(k);
      return <button key={k} type="button" className={`kb-poll-v ${on ? "is-on" : ""} ${korsat ? "is-natija" : ""}`} disabled={s.yopiq}
        onClick={() => { if (s.kop_tanlov) setTanl((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k])); else yubor([k]); }}>
        {korsat && <span className="kb-poll-chiziq" style={{ width: `${f}%` }} />}
        <span className="kb-poll-belgi">{s.kop_tanlov ? (on ? "☑" : "☐") : on ? "◉" : "○"}</span>
        <span className="kb-poll-matn">{v}{korsat && !s.anonim && s.kimlar?.[k]?.length ? <small> · {s.kimlar[k].join(", ")}</small> : null}</span>
        {korsat && <b className="kb-poll-foiz">{f}%</b>}
      </button>; })}
    {s.kop_tanlov && !s.yopiq && <button type="button" className="kb-poll-yubor" disabled={!tanl.length} onClick={() => yubor(tanl)}>✅ {__kbUi("Ovoz berish")}</button>}
    <div className="kb-poll-past"><small>{s.jami} {__kbUi("kishi ovoz berdi")}</small>
      {berdim && !s.yopiq && <button type="button" onClick={() => yubor([])}>{__kbUi("Ovozni qaytarish")}</button>}
      {s.meniki_yaratgan && !s.yopiq && <button type="button" onClick={() => post(apiBase, `/api/chat/sorovnoma/${s.id}/yop`, { token }).then((d) => onYangi?.(d.sorovnoma)).catch((e) => setXato(e.message))}>🔒 {__kbUi("Yopish")}</button>}</div>
    {xato && <small className="kb-poll-xato">{xato}</small>}
  </div>;
}

export function SorovnomaForma({ apiBase, token, peer, onYopish, onYaratildi }) {
  const [savol, setSavol] = useState("");
  const [vlar, setVlar] = useState(["", ""]);
  const [kop, setKop] = useState(false);
  const [anonim, setAnonim] = useState(true);
  const [xato, setXato] = useState("");
  const [band, setBand] = useState(false);
  const toza = vlar.map((x) => x.trim()).filter(Boolean);
  const yarat = async () => {
    setBand(true); setXato("");
    try {
      const f = new FormData(); f.append("token", token);
      if (peer.guruh_id) f.append("guruh_id", String(peer.guruh_id)); else f.append("qabul_qiluvchi_user_id", String(peer.user_id));
      if (peer.kabutar_id && !peer.guruh_id) f.append("kabutar_id", peer.kabutar_id);
      f.append("matn", `📊 ${savol.trim()}`);
      const r = await fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/chat/xabar_yubor`, { method: "POST", body: f }); const d = await r.json();
      if (!r.ok || !d.id) throw new Error(d.detail || "Yuborilmadi");
      await post(apiBase, "/api/chat/sorovnoma", { token, xabar_id: String(d.id), savol: savol.trim(), variantlar: toza, kop_tanlov: kop ? "true" : "false", anonim: anonim ? "true" : "false" });
      onYaratildi?.(); onYopish?.();
    } catch (e) { setXato(e.message); } finally { setBand(false); }
  };
  return <div className="kb-poll-forma" role="dialog" aria-label={__kbUi("So‘rovnoma")}>
    <div className="kb-poll-forma-bosh"><b>📊 {__kbUi("Yangi so‘rovnoma")}</b><button type="button" onClick={onYopish} aria-label={__kbUi("Yopish")}>✕</button></div>
    <input value={savol} maxLength={300} onChange={(e) => setSavol(e.target.value)} placeholder={__kbUi("Savol: masalan, ota-onalar majlisi qachon qulay?")} autoFocus />
    {vlar.map((v, k) => <div key={k} className="kb-poll-forma-v"><input value={v} maxLength={200} onChange={(e) => setVlar(vlar.map((x, j) => (j === k ? e.target.value : x)))} placeholder={__kbUi(`${k + 1}-variant`)} />
      {vlar.length > 2 && <button type="button" onClick={() => setVlar(vlar.filter((_, j) => j !== k))} aria-label={__kbUi("O‘chirish")}>✕</button>}</div>)}
    {vlar.length < 10 && <button type="button" className="kb-poll-qosh" onClick={() => setVlar([...vlar, ""])}>➕ {__kbUi("Variant qo‘shish")}</button>}
    <label><input type="checkbox" checked={anonim} onChange={(e) => setAnonim(e.target.checked)} /> {__kbUi("Anonim (kim nimaga ovoz bergani ko‘rinmaydi)")}</label>
    <label><input type="checkbox" checked={kop} onChange={(e) => setKop(e.target.checked)} /> {__kbUi("Bir nechta javob tanlash mumkin")}</label>
    {xato && <small className="kb-poll-xato">{xato}</small>}
    <button type="button" className="kb-poll-yubor" disabled={band || !savol.trim() || toza.length < 2} onClick={yarat}>📤 {__kbUi("Yuborish")}</button>
  </div>;
}
