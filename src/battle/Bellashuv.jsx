import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { stripSpeechTags } from "../speech/language.js";
import { kidOptions } from "../test/kidQuizRules.js";
import { OPTION_STYLES, battleLink, medal, normalizeCode, secondsLeft, timeFraction } from "./battleRules.js";
import "./bellashuv.css";

async function call(apiBase, path, token, body) {
  const url = `${apiBase}${path}${body ? "" : `${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET", cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify({ token, ...body }) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.message || `Server xatosi (${res.status})`);
  return data;
}

function useVoice(apiBase, enabled) {
  const audio = useRef(null);
  return useCallback((text) => {
    if (!enabled || !text) return;
    try {
      audio.current?.pause();
      const a = new Audio(`${apiBase}/api/ovoz?${new URLSearchParams({ matn: String(text).slice(0, 600) })}`);
      audio.current = a;
      a.play().catch(() => {});
    } catch { /* ovoz ixtiyoriy */ }
  }, [apiBase, enabled]);
}

/** Bellashuv: kod bilan qo'shilish, xona ochish, lobbi, savollar, natija va shohsupa. */
export default function Bellashuv({ apiBase, token, kid = false, initialCode = "", createFrom = null, onClose, onPickTopic }) {
  useKbInterfaceLocale();
  const [code, setCode] = useState(normalizeCode(initialCode));
  const [input, setInput] = useState("");
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState({ savol_soni: kid ? 5 : 10, savol_vaqti: kid ? 20 : 15 });
  const [answer, setAnswer] = useState(null);
  const [tick, setTick] = useState(0);
  const offset = useRef(0);
  const spoken = useRef("");
  const say = useVoice(apiBase, true);

  // Holatni har soniyada so'raymiz (polling) — hamma bir xil vaqtda bir xil savolni ko'radi.
  useEffect(() => {
    if (!code) return undefined;
    let stop = false;
    const load = async () => {
      try {
        const sent = Date.now();
        const data = await call(apiBase, `/api/bellashuv/${code}`, token);
        if (stop) return;
        offset.current = data.server_now - Math.round((sent + Date.now()) / 2);
        setState(data); setError("");
      } catch (e) { if (!stop) setError(e.message); }
    };
    load();
    const id = setInterval(load, 1000);
    return () => { stop = true; clearInterval(id); };
  }, [apiBase, token, code]);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 200); return () => clearInterval(id); }, []);
  useEffect(() => { setAnswer(null); }, [state?.index]);
  // Havola orqali kelgan (hali ishtirokchi bo'lmagan) o'yinchi lobbida avtomatik qo'shiladi.
  const autoJoined = useRef("");
  useEffect(() => {
    if (!state || state.ishtirokchi || state.phase !== "lobby" || autoJoined.current === state.kod) return;
    autoJoined.current = state.kod;
    call(apiBase, "/api/bellashuv/qoshil", token, { kod: state.kod }).catch((e) => setError(e.message));
  }, [state, apiBase, token]);
  // Bog'cha bolasi uchun savol ovozda o'qiladi.
  useEffect(() => {
    if (!state?.savol || state.phase !== "question") return;
    const key = `${state.kod}:${state.index}`;
    if (spoken.current === key) return;
    spoken.current = key;
    if (kid) say(state.savol.matn);
  }, [state, kid, say]);

  const create = async () => {
    setBusy(true); setError("");
    try {
      const data = await call(apiBase, "/api/bellashuv/xona", token, { topic_codes: createFrom.topic_codes, nomi: createFrom.nomi || "", ...config });
      setCode(data.kod);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const join = async (value) => {
    const kod = normalizeCode(value);
    if (kod.length < 6) { setError("Kod 6 ta belgidan iborat"); return; }
    setBusy(true); setError("");
    try { await call(apiBase, "/api/bellashuv/qoshil", token, { kod }); setCode(kod); setState(null); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const start = async () => { setBusy(true); try { await call(apiBase, `/api/bellashuv/${code}/boshlash`, token, { kod: code }); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const rematch = async () => { setBusy(true); try { const d = await call(apiBase, `/api/bellashuv/${code}/yana`, token, { kod: code }); setState(null); setCode(d.kod); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const pick = async (letter) => {
    if (answer || !state || state.phase !== "question" || state.mening_javobim) return;
    setAnswer({ letter, pending: true });
    try { const d = await call(apiBase, `/api/bellashuv/${code}/javob`, token, { index: state.index, tanlangan: letter }); setAnswer({ letter, ...d }); }
    catch (e) { setAnswer(null); setError(e.message); }
  };
  const share = async () => {
    const link = battleLink(window.location.origin, code);
    try { if (navigator.share) { await navigator.share({ title: "Bellashuv", text: `Bellashuvga qo'shil! Kod: ${code}`, url: link }); return; } } catch { /* bekor qilindi */ }
    try { await navigator.clipboard.writeText(link); setError("Havola nusxalandi ✓"); } catch { setError(link); }
  };

  const now = Date.now();
  void tick;
  const left = secondsLeft(state, now, offset.current);

  // ── Xonasiz: kod kiritish yoki xona ochish ──
  if (!code) return <section className={`bs-root ${kid ? "is-kid" : ""}`}>
    {onClose && <button type="button" className="bs-back" onClick={onClose}>← {__kbUi("Orqaga")}</button>}
    <header className="bs-hero"><span aria-hidden="true">⚔️</span><div><h2>{__kbUi("Bellashuv")}</h2><p>{__kbUi("Do‘stlaring bilan bir vaqtda test yech — kim birinchi to‘g‘ri topsa, ko‘proq ochko oladi!")}</p></div></header>
    {createFrom ? <div className="bs-card">
      <h3>{__kbUi("Xona ochish")}: <b>{stripSpeechTags(createFrom.nomi || "")}</b></h3>
      <div className="bs-choices"><span>{__kbUi("Savollar")}</span>{[5, 10, 15, 20].map((n) => <button key={n} type="button" className={config.savol_soni === n ? "is-on" : ""} onClick={() => setConfig({ ...config, savol_soni: n })}>{n}</button>)}</div>
      <div className="bs-choices"><span>{__kbUi("Har savolga")}</span>{[10, 15, 20, 30].map((n) => <button key={n} type="button" className={config.savol_vaqti === n ? "is-on" : ""} onClick={() => setConfig({ ...config, savol_vaqti: n })}>{n} {__kbUi("s")}</button>)}</div>
      <button type="button" className="bs-primary" disabled={busy} onClick={create}>{busy ? "…" : __kbUi("⚔️ Xonani ochish")}</button>
    </div> : <div className="bs-card">
      <h3>{__kbUi("Xona ochish")}</h3>
      <p className="bs-muted">{__kbUi("Mavzuni tanlang — shu mavzudagi testlar bilan bellashuv xonasi ochiladi.")}</p>
      {onPickTopic && <button type="button" className="bs-primary" onClick={onPickTopic}>{__kbUi("📚 Mavzu tanlash")}</button>}
    </div>}
    <form className="bs-card" onSubmit={(e) => { e.preventDefault(); join(input); }}>
      <h3>{__kbUi("Kod bilan qo‘shilish")}</h3>
      <input value={input} onChange={(e) => setInput(normalizeCode(e.target.value))} placeholder="ABC123" maxLength={6} className="bs-code-input" aria-label={__kbUi("Bellashuv kodi")} />
      <button type="submit" className="bs-primary" disabled={busy || input.length < 6}>{__kbUi("Qo‘shilish")}</button>
    </form>
    {error && <p className="bs-note" role="status">{__kbUi(error)}</p>}
  </section>;

  if (!state) return <section className="bs-root"><p className="bs-muted" role="status">{error ? __kbUi(error) : __kbUi("Yuklanmoqda…")}</p>{onClose && <button type="button" className="bs-back" onClick={onClose}>← {__kbUi("Orqaga")}</button>}</section>;

  if (!state.ishtirokchi && state.phase !== "lobby") return <section className={`bs-root ${kid ? "is-kid" : ""}`}>
    <div className="bs-card"><h3>⏳ {__kbUi("Bu bellashuv allaqachon boshlangan")}</h3>
      <p className="bs-muted">{__kbUi("Keyingi o‘yinga qo‘shiling yoki o‘zingiz yangi xona oching.")}</p>
      {state.keyingi_kod && <button type="button" className="bs-primary" onClick={() => join(state.keyingi_kod)}>{__kbUi("🔁 Yangi o‘yinga qo‘shilish")}</button>}
      <button type="button" className="bs-secondary" onClick={() => { setCode(""); setState(null); }}>{__kbUi("Boshqa kod kiritish")}</button>
    </div></section>;

  const players = state.players || [];
  const me = state.men;
  const options = state.savol ? kidOptions(Object.fromEntries(state.savol.variantlar.map((o, i) => [`option_${"abcd"[i]}`, o]))) : [];
  const chosen = answer?.letter || state.mening_javobim?.tanlangan;
  const reveal = state.phase === "reveal" ? state.natija : null;

  return <section className={`bs-root ${kid ? "is-kid" : ""}`}>
    <header className="bs-top">
      <span className="bs-code">⚔️ {state.kod}</span>
      {state.nomi && <span className="bs-topic">{stripSpeechTags(state.nomi)}</span>}
      {me && state.phase !== "lobby" && <span className="bs-me">{medal(me.orin)} {me.ochko}</span>}
      {onClose && <button type="button" className="bs-x" onClick={onClose} aria-label={__kbUi("Chiqish")}>✕</button>}
    </header>
    {error && <p className="bs-note" role="status">{__kbUi(error)}</p>}

    {state.phase === "lobby" && <div className="bs-lobby">
      <p className="bs-muted">{__kbUi("Do‘stlaringga kodni ayt yoki havolani yubor:")}</p>
      <div className="bs-bigcode">{state.kod}</div>
      <div className="bs-row">
        <button type="button" className="bs-secondary" onClick={share}>{__kbUi("🔗 Havolani yuborish")}</button>
        <a className="bs-secondary" href={`https://t.me/share/url?${new URLSearchParams({ url: battleLink(window.location.origin, state.kod), text: `Bellashuvga qo'shil! Kod: ${state.kod}` })}`} target="_blank" rel="noreferrer">{__kbUi("✈️ Telegram")}</a>
      </div>
      <h3>{__kbUi(`O‘yinchilar: ${players.length}`)}</h3>
      <ul className="bs-players">{players.map((p) => <li key={p.user_id} className={`is-${p.jins || "x"}`}><span>{(p.ism || "?").trim().charAt(0).toUpperCase()}</span>{p.ism}</li>)}</ul>
      {state.host
        ? <button type="button" className="bs-primary bs-start" disabled={busy} onClick={start}>{__kbUi(players.length > 1 ? "🚀 Boshlash" : "🚀 Yolg‘iz boshlash")}</button>
        : <p className="bs-wait">⏳ {__kbUi("Boshlovchi boshlashini kutyapmiz…")}</p>}
    </div>}

    {state.phase === "countdown" && <div className="bs-countdown" aria-live="assertive"><span key={left}>{left || "🚀"}</span><p>{__kbUi("Tayyorlan!")}</p></div>}

    {(state.phase === "question" || state.phase === "reveal") && state.savol && <div className="bs-play">
      <div className="bs-progress"><span>{state.index + 1} / {state.total}</span>
        <div className="bs-timer"><i style={{ width: `${Math.round(timeFraction(state, now, offset.current) * 100)}%` }} /></div>
        <b>{state.phase === "question" ? `${left}s` : "✓"}</b></div>
      <h2 className="bs-question">{stripSpeechTags(state.savol.matn)}{kid && <button type="button" className="bs-listen" onClick={() => say(state.savol.matn)} aria-label={__kbUi("Qayta eshitish")}>🔊</button>}</h2>
      <div className={`bs-options bs-n${options.length}`}>
        {options.map((o, i) => {
          const st = OPTION_STYLES[i];
          const cls = reveal ? (o.letter === reveal.togri ? "is-right" : o.letter === chosen ? "is-wrong" : "is-dim") : chosen ? (o.letter === chosen ? "is-picked" : "is-dim") : "";
          return <button key={o.letter} type="button" className={`bs-option ${cls}`} style={{ "--opt": st.color }} disabled={Boolean(chosen) || state.phase !== "question"} onClick={() => pick(o.letter)}>
            <span className="bs-shape" aria-hidden="true">{st.shape}</span>
            {o.picture && <span className="bs-pic" aria-hidden="true">{o.picture}</span>}
            <span className="bs-word">{o.word || o.letter}</span>
          </button>;
        })}
      </div>
      {state.phase === "question" && <p className="bs-status">{chosen
        ? (answer && !answer.pending ? (answer.togri ? `✅ ${__kbUi("To‘g‘ri!")} +${answer.ochko}${answer.birinchi ? ` ⚡ ${__kbUi("Birinchi!")}` : ""}` : `❌ ${__kbUi("Afsus…")}`) : "…")
        : ""} <small>{__kbUi(`${state.javob_berganlar || 0} / ${players.length} javob berdi`)}</small></p>}
      {reveal && <div className="bs-reveal">
        {reveal.birinchi && <p>⚡ {__kbUi("Birinchi topdi")}: <b>{reveal.birinchi.ism}</b> ({reveal.birinchi.soniya} s)</p>}
        {reveal.izoh && <p className="bs-muted">{stripSpeechTags(reveal.izoh)}</p>}
        <ol className="bs-board">{players.slice(0, 5).map((p) => <li key={p.user_id} className={me && p.user_id === me.user_id ? "is-me" : ""}><span>{medal(p.orin)}</span><b>{p.ism}</b><i>{p.ochko}</i></li>)}</ol>
      </div>}
    </div>}

    {state.phase === "finished" && <div className="bs-final">
      <h2>🏆 {__kbUi("Bellashuv tugadi!")}</h2>
      <div className="bs-podium">{[1, 0, 2].map((i) => players[i] && <div key={players[i].user_id} className={`bs-step bs-step-${players[i].orin}`}>
        <span className="bs-medal">{medal(players[i].orin)}</span><b>{players[i].ism}</b><i>{players[i].ochko}</i><div className="bs-block" /></div>)}</div>
      <ol className="bs-board">{players.map((p) => <li key={p.user_id} className={me && p.user_id === me.user_id ? "is-me" : ""}><span>{medal(p.orin)}</span><b>{p.ism}</b><small>{__kbUi(`${p.togri} ta to‘g‘ri`)}</small><i>{p.ochko}</i></li>)}</ol>
      <div className="bs-row">
        {state.host && <button type="button" className="bs-primary" disabled={busy} onClick={rematch}>{__kbUi("🔁 Yana o‘ynaymiz")}</button>}
        {!state.host && state.keyingi_kod && <button type="button" className="bs-primary" onClick={() => join(state.keyingi_kod)}>{__kbUi("🔁 Yangi o‘yinga qo‘shilish")}</button>}
        {onClose && <button type="button" className="bs-secondary" onClick={onClose}>{__kbUi("Chiqish")}</button>}
      </div>
    </div>}
  </section>;
}
