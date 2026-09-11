import { useInterface } from "../interface/InterfacePreferences.jsx";
import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

// Server acceptance belongs to this account and this exact rule version.
export default function KabutarTerms({ apiBase, token, onAccepted }) {
  const { t } = useInterface();
  const [terms, setTerms] = useState(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const session = useRef(null), acceptedRef = useRef(onAccepted);
  acceptedRef.current = onAccepted;
  useEffect(() => {
    const state = { alive: true, controller: null, busy: false };
    session.current = state;
    setTerms(null); setChecked(false); setError("");
    state.load = async (acceptVersion = null) => {
      if (!state.alive || state.busy || !token) return;
      state.busy = true; setBusy(true); setError("");
      const controller = new AbortController(); state.controller = controller;
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`${String(apiBase || "").replace(/\/$/, "")}/api/kabutar/safety/terms`, {
          method: acceptVersion ? "POST" : "GET", cache: "no-store", signal: controller.signal,
          headers: { Authorization: `Bearer ${token}`, ...(acceptVersion ? { "Content-Type": "application/json" } : {}) },
          ...(acceptVersion ? { body: JSON.stringify({ version: acceptVersion, accepted: true }) } : {}),
        });
        let data; try { data = await response.json(); } catch { data = {}; }
        if (!response.ok) {
          if (acceptVersion && response.status === 422 && state.alive) { setTerms(null); setChecked(false); }
          throw new Error(typeof data.detail === "string" ? data.detail : "Qoidalarni yuklab bo‘lmadi.");
        }
        if (typeof data.version !== "string" || typeof data.accepted !== "boolean" || !Array.isArray(data.rules)
          || data.rules.length === 0 || data.rules.some(rule => typeof rule?.id !== "string" || typeof rule?.text !== "string")) {
          throw new Error("Qoidalar to‘liq kelmadi. Qayta urinib ko‘ring.");
        }
        if (!state.alive || controller.signal.aborted) return;
        setTerms(data);
        if (data.accepted) acceptedRef.current?.();
        else if (acceptVersion) { setChecked(false); setError("Qoidalar yangilandi. Ularni ko‘rib, qayta tasdiqlang."); }
      } catch (failure) {
        if (state.alive) setError(controller.signal.aborted ? "Ulanish cho‘zildi. Qayta urinib ko‘ring." : failure.message);
      } finally {
        clearTimeout(timer); state.busy = false;
        if (state.controller === controller) state.controller = null;
        if (state.alive) setBusy(false);
      }
    };
    state.load();
    return () => { state.alive = false; state.controller?.abort(); if (session.current === state) session.current = null; };
  }, [apiBase, token]);
  if (terms?.accepted) return null;
  return <section className="kb-terms" aria-label={t("Kabutar suhbat qoidalari")}>
    <div className="kb-terms-title"><ShieldCheck size={19} /><strong>{t("Kabutarda xotirjam suhbatlashamiz")}</strong></div>
    {terms ? <>
      <p>{t("Xabar yoki media yuborish va qo‘ng‘iroq qilishdan oldin suhbat qoidalari bilan tanishing.")}</p>
      <ul>{terms.rules.map(rule => <li key={rule.id}>{rule.text}</li>)}</ul>
      <label><input type="checkbox" checked={checked} disabled={busy} onChange={event => setChecked(event.target.checked)} />{t("Qoidalarni o‘qidim va ularga rioya qilaman.")}</label>
      <button type="button" disabled={!checked || busy} onClick={() => { if (checked && !busy) session.current?.load(terms.version); }}>{busy ? <Loader2 size={17} /> : <ShieldCheck size={17} />}{t("Tasdiqlash")}</button>
    </> : busy ? <p role="status">{t("Suhbat qoidalari yuklanmoqda…")}</p> : <button type="button" onClick={() => session.current?.load()}>{t("Qayta yuklash")}</button>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
