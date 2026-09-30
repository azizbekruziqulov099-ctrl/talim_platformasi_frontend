import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import {
  FRIEND_CONTROLS, TIME_CONTROLS, clockNow, formatClock, gameLink, normalizeGameCode, ratingDeltaText, resultText, secondsUntil,
} from "./gameRules.js";
import { TournamentList, TournamentView } from "./Turnir.jsx";
import { isTournamentCode } from "./turnirRules.js";
import "./boardGame.css";
import "./turnir.css";

async function call(apiBase, path, token, body) {
  const url = `${apiBase}${path}${body ? "" : `${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET", cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify({ token, ...body }) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.[0]?.msg || `Server xatosi (${res.status})`);
  return data;
}

export const BOT_LEVELS = [
  { id: 1, nomi: "Oson", emoji: "🐣", izoh: "Endi o‘rganayotganlar uchun" },
  { id: 2, nomi: "O‘rta", emoji: "🙂", izoh: "Biroz o‘ylab o‘ynaydi" },
  { id: 3, nomi: "Qiyin", emoji: "😎", izoh: "Tuzoqlarni ko‘radi" },
  { id: 4, nomi: "Usta", emoji: "🧠", izoh: "Chuqur hisoblaydi" },
];

function Avatar({ player }) {
  const letter = player?.bot ? "🤖" : (player?.ism || "?").trim().charAt(0).toUpperCase();
  return <span className={`sh-avatar is-${player?.jins || "x"}`} aria-hidden="true">{letter}</span>;
}

function Choice({ items, value, onChange, label }) {
  return <div className="sh-colors" role="radiogroup" aria-label={__kbUi(label)}>
    {items.map((it) => <button key={it.kod} type="button" role="radio" aria-checked={value === it.kod} className={value === it.kod ? "is-on" : ""}
      onClick={() => onChange(it.kod)}>{__kbUi(it.nomi)}</button>)}
  </div>;
}

/**
 * Taxta o'yinlari uchun umumiy qobiq: menyu (bot / onlayn / do'st), raqib izlash, kutish zali,
 * o'yin (o'yinchilar, soat, durang taklifi, taslim), natija (reyting o'zgarishi, revansh) va reyting jadvali.
 * Taxtaning o'zi `renderBoard` orqali o'yinga xos komponent bilan chiziladi.
 */
export default function BoardGame({
  apiBase, token, kid = false, initialCode = "", onClose,
  game, title, subtitle, heroIcon, rules = [], renderBoard, statusText, pieceLabel = "dona", formatMove = (m) => m, menuExtra = null,
}) {
  useKbInterfaceLocale();
  // REV90: turnir kodi (T12345) bilan kelgan havola turnirni ochadi; bunday turnir bo'lmasa — o'yin kodi deb qaraladi.
  const [tour, setTour] = useState(() => (isTournamentCode(normalizeGameCode(initialCode)) ? normalizeGameCode(initialCode) : null));
  const [code, setCode] = useState(() => (isTournamentCode(normalizeGameCode(initialCode)) ? "" : normalizeGameCode(initialCode)));
  const tourFallback = useRef(null);
  const tourOpened = useRef(new Set());
  const [state, setState] = useState(null);
  const [summary, setSummary] = useState(null);
  const [board, setBoard] = useState(null);
  const [searching, setSearching] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState(kid ? 1 : 2);
  const [color, setColor] = useState("w");
  const [onlineControl, setOnlineControl] = useState("10+0");
  const [friendControl, setFriendControl] = useState("cheksiz");
  const [joinInput, setJoinInput] = useState("");
  const [confirmResign, setConfirmResign] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hint, setHint] = useState(null);
  const [, setTick] = useState(0);
  const offset = useRef(0);
  const joined = useRef("");
  const P = `/api/${game}`;

  const callP = useCallback((path, body) => call(apiBase, path, token, body), [apiBase, token]);
  const loadSummary = useCallback(() => { call(apiBase, P, token).then(setSummary).catch(() => {}); }, [apiBase, token, P]);
  useEffect(() => { if (!code) loadSummary(); }, [code, loadSummary]);

  useEffect(() => {
    if (!code) return undefined;
    let stop = false;
    const load = async () => {
      try {
        const sent = Date.now();
        const data = await call(apiBase, `${P}/${code}`, token);
        if (stop) return;
        offset.current = data.server_now - Math.round((sent + Date.now()) / 2);
        setState((old) => (old && old.kod === data.kod && old.versiya > data.versiya ? old : data));
        setError("");
      } catch (e) { if (!stop) setError(e.message); }
    };
    load();
    const id = setInterval(load, 800);
    return () => { stop = true; clearInterval(id); };
  }, [apiBase, token, code, P]);
  useEffect(() => { setConfirmResign(false); setHint(null); }, [state?.versiya, state?.kod]);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 200); return () => clearInterval(id); }, []);

  // Do'st havolasi bilan kelgan o'yinchi avtomatik qo'shiladi.
  useEffect(() => {
    if (!state || state.men || state.holat !== "kutish" || joined.current === state.kod) return;
    joined.current = state.kod;
    call(apiBase, `${P}/qoshil`, token, { kod: state.kod }).catch((e) => setError(e.message));
  }, [state, apiBase, token, P]);

  // Revansh: o'zim taklif qilgan bo'lsam va raqib rozi bo'lsa — yangi o'yin o'zi ochiladi.
  useEffect(() => {
    if (state?.holat === "tugadi" && state.keyingi_kod && state.yana_taklif === state.men) open(state.keyingi_kod);
  }, [state?.keyingi_kod]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!searching) return undefined;
    let stop = false;
    const id = setInterval(async () => {
      try {
        const d = await call(apiBase, `${P}/izla`, token);
        if (stop) return;
        if (d.kod) { setSearching(null); open(d.kod); }
        else if (!d.kutish) setSearching(null);
        else setSearching((s) => (s ? { ...s, ...d } : s));
      } catch (e) { if (!stop) setError(e.message); }
    }, 1000);
    return () => { stop = true; clearInterval(id); };
  }, [searching?.active, apiBase, token, P]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (fn) => { setBusy(true); setError(""); setNote(""); try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  function open(kod) { setState(null); setShowHistory(false); setCode(kod); }
  const toMenu = () => { setCode(""); setState(null); setBoard(null); loadSummary(); };
  const toTournament = (tkod) => { setCode(""); setState(null); setTour(tkod); };
  const startBot = () => run(async () => { const d = await call(apiBase, `${P}/bot`, token, { daraja: level, rang: color }); open(d.kod); });
  const startSearch = (control = onlineControl) => run(async () => {
    const d = await call(apiBase, `${P}/izla`, token, { nazorat: control });
    if (d.kod) open(d.kod); else { setCode(""); setState(null); setSearching({ active: Date.now(), ...d }); }
  });
  const cancelSearch = () => run(async () => { const d = await call(apiBase, `${P}/izla/bekor`, token, {}); setSearching(null); if (d.kod) open(d.kod); });
  const createFriend = () => run(async () => { const d = await call(apiBase, `${P}/dost`, token, { rang: "random", nazorat: friendControl }); open(d.kod); });
  const joinGame = (value) => run(async () => { const d = await call(apiBase, `${P}/qoshil`, token, { kod: normalizeGameCode(value) }); open(d.kod); });
  const joinFriend = (value) => {
    const kod = normalizeGameCode(value);
    if (isTournamentCode(kod)) { tourFallback.current = () => joinGame(kod); setTour(kod); return; }
    joinGame(kod);
  };
  const post = (path, body = {}) => run(async () => {
    const d = await call(apiBase, `${P}/${code}${path}`, token, body);
    if (d.rad) setNote("Raqib durangga rozi bo‘lmadi — o‘yin davom etadi.");
    if (d.pozitsiya) setState(d);
    return d;
  });
  const again = () => run(async () => {
    if (state?.turi === "onlayn" && state?.raqib_bot) { await startSearch(state.nazorat); return; }
    const d = await call(apiBase, `${P}/${code}/yana`, token, {});
    if (d.kod) open(d.kod); else setNote("Revansh taklifi yuborildi — raqib javobini kutyapmiz…");
  });
  const move = async (path) => {
    if (!state || busy) return false;
    setBusy(true);
    try {
      const d = await call(apiBase, `${P}/${code}/yur`, token, { path, versiya: state.versiya });
      setState(d); setError(""); return true;
    } catch (e) { setError(e.message); return false; } finally { setBusy(false); }
  };
  const share = async () => {
    const link = gameLink(window.location.origin, game, code);
    try { if (navigator.share) { await navigator.share({ title, text: `Keling, ${title.toLowerCase()} o'ynaymiz! Kod: ${code}`, url: link }); return; } } catch { /* bekor */ }
    try { await navigator.clipboard.writeText(link); setNote("Havola nusxalandi ✓"); } catch { setNote(link); }
  };
  // Bot bilan mashq: maslahat (kuchli bot tavsiyasi + izoh) va yurishni qaytarish.
  const askHint = () => run(async () => { const d = await call(apiBase, `${P}/${code}/maslahat`, token, {}); setHint(d); });
  const takeBack = () => run(async () => { const d = await call(apiBase, `${P}/${code}/qaytar`, token, {}); setState(d); });
  const loadBoard = () => run(async () => setBoard(await call(apiBase, `${P}/reyting`, token)));

  const clientNow = Date.now();
  const cls = `sh-root ${kid ? "is-kid" : ""}`;

  // ── Reyting jadvali ──
  if (board) return <section className={cls}>
    <button type="button" className="sh-back" onClick={() => setBoard(null)}>← {__kbUi("Orqaga")}</button>
    <h2 className="sh-section-title">🏅 {__kbUi(`${title} — reyting jadvali`)}</h2>
    {board.men && <p className="sh-muted">{__kbUi("Sizning reytingingiz")}: <b>{board.men.reyting}</b>{board.men.orin ? ` · ${board.men.orin}-${__kbUi("o‘rin")}` : ` · ${__kbUi("hali reytingli o‘yin yo‘q")}`}</p>}
    <ol className="sh-board-list">
      {board.top.map((p) => <li key={p.user_id} className={board.men && p.user_id === board.men.user_id ? "is-me" : ""}>
        <span>{p.orin <= 3 ? ["🥇", "🥈", "🥉"][p.orin - 1] : `${p.orin}.`}</span>
        <Avatar player={p} /><b>{p.ism}</b><small>{p.oyinlar} {__kbUi("o‘yin")}</small><i>{p.reyting}</i></li>)}
      {!board.top.length && <li className="sh-muted">{__kbUi("Hali hech kim reytingli o‘yin o‘ynamagan. Birinchi bo‘ling!")}</li>}
    </ol>
  </section>;

  // ── Raqib izlanmoqda ──
  if (searching) return <section className={cls}>
    <div className="sh-search" role="status">
      <div className="sh-radar" aria-hidden="true"><span>{heroIcon}</span></div>
      <h2>{__kbUi("Raqib qidirilmoqda…")}</h2>
      <p className="sh-muted">{__kbUi(TIME_CONTROLS.find((t) => t.kod === searching.nazorat)?.nomi || searching.nazorat || "")} · {__kbUi("reyting")} {searching.reyting ?? ""}</p>
      <p className="sh-muted">{searching.soniya || 0} {__kbUi("soniya")}</p>
      <button type="button" className="sh-secondary" disabled={busy} onClick={cancelSearch}>{__kbUi("Bekor qilish")}</button>
    </div>
    {error && <p className="sh-note">{__kbUi(error)}</p>}
  </section>;

  // ── Turnirlar ──
  if (!code && tour) return <section className={cls}>
    {tour === "list"
      ? <TournamentList call={callP} P={P} title={title} onOpen={(k) => { tourFallback.current = null; setTour(k); }} onBack={() => { setTour(null); loadSummary(); }} />
      : <TournamentView key={tour} call={callP} P={P} game={game} title={title} tkod={tour} onOpenGame={open} autoOpened={tourOpened} onBack={() => setTour("list")}
        onMissing={() => { const fb = tourFallback.current; tourFallback.current = null; setTour(null); if (fb) fb(); else if (isTournamentCode(normalizeGameCode(initialCode))) setCode(normalizeGameCode(initialCode)); }} />}
  </section>;

  // ── Menyu ──
  if (!code) {
    const st = summary?.statistika;
    const r = summary?.reyting;
    return <section className={cls}>
      {onClose && <button type="button" className="sh-back" onClick={onClose}>← {__kbUi("O‘yinlar")}</button>}
      <header className="sh-hero">
        <div className="sh-hero-icon" aria-hidden="true">{heroIcon}</div>
        <div><h2>{__kbUi(title)}</h2><p>{__kbUi(subtitle)}</p></div>
      </header>
      <div className="sh-stats">
        {r && <button type="button" className="sh-rating-chip" onClick={loadBoard}>🏅 {__kbUi("Reyting")}: <b>{r.reyting}</b> ›</button>}
        {st && <><span>🏆 {st.galaba}</span><span>🤝 {st.durang}</span><span>😔 {st.maglubiyat}</span></>}
      </div>
      {summary?.davom && <button type="button" className="sh-resume" onClick={() => open(summary.davom.kod)}>▶ {__kbUi("Tugallanmagan o‘yinni davom ettirish")}</button>}

      {menuExtra}
      <button type="button" className="tr-entry" onClick={() => setTour("list")}>
        <span aria-hidden="true">🏆</span><b>{__kbUi("Turnirlar va chempionatlar")}</b><small>{__kbUi("Sinf, to‘garak va maktab turnirlari — har turda yangi raqib, oxirida g‘oliblar")}</small><i aria-hidden="true">›</i>
      </button>
      <div className="sh-modes">
        <div className="sh-card">
          <h3>🤖 {__kbUi("Bot bilan")} <small className="sh-tag">{__kbUi("mashq · reytingsiz")}</small></h3>
          <div className="sh-levels" role="radiogroup" aria-label={__kbUi("Daraja")}>
            {BOT_LEVELS.map((l) => <button key={l.id} type="button" role="radio" aria-checked={level === l.id} className={level === l.id ? "is-on" : ""} onClick={() => setLevel(l.id)}>
              <span aria-hidden="true">{l.emoji}</span><b>{__kbUi(l.nomi)}</b><small>{__kbUi(l.izoh)}</small></button>)}
          </div>
          <Choice label="Rang" value={color} onChange={setColor} items={[{ kod: "w", nomi: "⚪ Oq" }, { kod: "b", nomi: "⚫ Qora" }, { kod: "random", nomi: "🎲 Tasodifiy" }]} />
          <button type="button" className="sh-primary" disabled={busy} onClick={startBot}>{__kbUi("▶ Boshlash")}</button>
        </div>
        <div className="sh-card">
          <h3>🌐 {__kbUi("Onlayn raqib")} <small className="sh-tag is-rated">{__kbUi("reytingli")}</small></h3>
          <p className="sh-muted">{__kbUi("Reytingingizga yaqin o‘yinchi bilan juftlashtiramiz. G‘alaba reytingni oshiradi.")}</p>
          <Choice label="Vaqt nazorati" value={onlineControl} onChange={setOnlineControl} items={TIME_CONTROLS} />
          <button type="button" className="sh-primary" disabled={busy} onClick={() => startSearch()}>{__kbUi("🔎 Raqib topish")}</button>
        </div>
        <div className="sh-card">
          <h3>👫 {__kbUi("Do‘st bilan")} <small className="sh-tag">{__kbUi("o‘rtoqlik o‘yini")}</small></h3>
          <Choice label="Vaqt nazorati" value={friendControl} onChange={setFriendControl} items={FRIEND_CONTROLS} />
          <button type="button" className="sh-primary" disabled={busy} onClick={createFriend}>{__kbUi("➕ Taklif kodi yaratish")}</button>
          <form className="sh-join" onSubmit={(e) => { e.preventDefault(); joinFriend(joinInput); }}>
            <input value={joinInput} onChange={(e) => setJoinInput(normalizeGameCode(e.target.value))} placeholder="ABC123" maxLength={6} aria-label={__kbUi("Do‘st kodi")} />
            <button type="submit" className="sh-secondary" disabled={busy || joinInput.length < 6}>{__kbUi("Qo‘shilish")}</button>
          </form>
        </div>
      </div>
      {rules.length > 0 && <details className="sh-rules">
        <summary>{__kbUi("📖 Qoidalar")}</summary>
        <ul>{rules.map((r2) => <li key={r2}>{__kbUi(r2)}</li>)}</ul>
      </details>}
      {(error || note) && <p className="sh-note">{__kbUi(error || note)}</p>}
    </section>;
  }

  if (!state) return <section className="sh-root"><p className="sh-muted" role="status">{error ? __kbUi(error) : __kbUi("Yuklanmoqda…")}</p>
    <button type="button" className="sh-back" onClick={toMenu}>← {__kbUi("Menyu")}</button></section>;

  // ── Do'st kutilmoqda ──
  if (state.holat === "kutish") return <section className={cls}>
    <div className="sh-wait">
      <h2>👫 {__kbUi("Do‘stingizni taklif qiling")}</h2>
      <p className="sh-muted">{__kbUi(state.nazorat_nomi || "")}</p>
      <div className="sh-bigcode">{state.kod}</div>
      <div className="sh-row">
        <button type="button" className="sh-secondary" onClick={share}>{__kbUi("🔗 Havolani yuborish")}</button>
        <a className="sh-secondary" target="_blank" rel="noreferrer" href={`https://t.me/share/url?${new URLSearchParams({ url: gameLink(window.location.origin, game, state.kod), text: `Keling, ${title.toLowerCase()} o'ynaymiz! Kod: ${state.kod}` })}`}>{__kbUi("✈️ Telegram")}</a>
      </div>
      <p className="sh-pulse">⏳ {__kbUi("Do‘stingiz qo‘shilishini kutyapmiz…")}</p>
      <button type="button" className="sh-secondary" onClick={() => run(async () => { await call(apiBase, `${P}/${code}/taslim`, token, {}); toMenu(); })}>{__kbUi("Bekor qilish")}</button>
    </div>
    {(error || note) && <p className="sh-note">{__kbUi(error || note)}</p>}
  </section>;

  // ── O'yin ──
  const me = state.men || "w";
  const opp = me === "w" ? "b" : "w";
  const mine = me === "w" ? state.oq : state.qora;
  const theirs = me === "w" ? state.qora : state.oq;
  const myTurn = state.holat === "davom" && state.navbat === me;
  const clock = clockNow(state, clientNow, offset.current);
  const firstLeft = secondsUntil(state.birinchi_yurish_tugaydi, clientNow, offset.current);
  const result = resultText(state);
  const pieces = state.donalar || {};
  const offerFromThem = state.holat === "davom" && state.durang_taklif === opp;
  const offerFromMe = state.holat === "davom" && state.durang_taklif === me;
  const rematchFromThem = state.holat === "tugadi" && state.yana_taklif === opp && !state.keyingi_kod;

  const bar = (player, side) => {
    const active = state.holat === "davom" && state.navbat === side;
    const left = clock ? clock[side] : null;
    return <div className={`sh-player ${active ? "is-active" : ""}`}>
      <Avatar player={player} />
      <div className="sh-player-name"><b>{player?.ism || __kbUi("O‘yinchi")}{player?.reyting ? <em className="sh-elo">{player.reyting}</em> : null}</b>
        <small>{side === "w" ? __kbUi("⚪ Oq") : __kbUi("⚫ Qora")}{pieces[side] !== undefined ? ` · ${pieces[side]} ${__kbUi(pieceLabel)}` : ""}</small></div>
      {left !== null && <span className={`sh-clock ${active ? "is-running" : ""} ${left <= 20000 ? "is-low" : ""}`}>{formatClock(left)}</span>}
      {left === null && active && side !== me && <span className="sh-thinking">{__kbUi("o‘ylayapti")}<i>.</i><i>.</i><i>.</i></span>}
    </div>;
  };

  return <section className={`${cls} sh-game`}>
    <header className="sh-top">
      <button type="button" className="sh-back" onClick={state.turnir_kod ? () => toTournament(state.turnir_kod) : toMenu}>← {__kbUi(state.turnir_kod ? "Turnir" : "Menyu")}</button>
      <span className="sh-mode">{state.turnir_kod ? `🏆 ${__kbUi("Turnir")} · ${state.tur}-${__kbUi("tur")}` : state.turi === "bot" ? `🤖 ${__kbUi(BOT_LEVELS[(state.bot_daraja || 2) - 1].nomi)}` : state.turi === "dost" ? `👫 ${state.kod}` : `🌐 ${__kbUi("Onlayn")}`}
        {state.nazorat !== "cheksiz" && <small> · {state.nazorat}</small>}{state.reytingli && <small> · {__kbUi("reytingli")}</small>}</span>
    </header>
    {bar(theirs, opp)}
    {renderBoard({ state, me, myTurn, busy, onMove: move, hint: hint?.yurish || null })}
    {bar(mine, me)}
    <p className="sh-status" aria-live="polite">
      {state.holat === "davom" && (firstLeft !== null && myTurn
        ? `⏳ ${__kbUi("Birinchi yurishni qiling")}: ${firstLeft} ${__kbUi("soniya")}`
        : myTurn ? (statusText?.(state) || __kbUi("Sizning navbatingiz.")) : __kbUi("Raqib yurishini kuting…"))}
    </p>
    {hint && myTurn && <p className="sh-hint" role="status">💡 {hint.yozuv ? <b>{formatMove(hint.yozuv)}</b> : null} {__kbUi(hint.izoh || "Yashil bilan belgilangan yurishni sinab ko‘ring.")}</p>}
    {offerFromThem && <div className="sh-offer" role="alert">🤝 {__kbUi("Raqib durang taklif qilyapti")}
      <div className="sh-row"><button type="button" className="sh-primary" onClick={() => post("/durang")}>{__kbUi("Qabul qilaman")}</button>
        <button type="button" className="sh-secondary" onClick={() => post("/durang/rad")}>{__kbUi("Yo‘q, o‘ynaymiz")}</button></div></div>}
    {offerFromMe && <p className="sh-muted sh-center">🤝 {__kbUi("Durang taklifi yuborildi — raqib javobini kutyapmiz")}</p>}
    {(error || note) && <p className="sh-note">{__kbUi(error || note)}</p>}
    {state.holat === "davom" && <div className="sh-row">
      {confirmResign
        ? <><button type="button" className="sh-danger" onClick={() => post("/taslim")}>{__kbUi("Ha, taslim bo‘laman")}</button><button type="button" className="sh-secondary" onClick={() => setConfirmResign(false)}>{__kbUi("Yo‘q, davom etamiz")}</button></>
        : <>
          {state.turi === "bot" && myTurn && <button type="button" className="sh-secondary" disabled={busy} onClick={askHint}>💡 {__kbUi("Maslahat")}</button>}
          {state.turi === "bot" && state.yurishlar_soni > 0 && <button type="button" className="sh-secondary" disabled={busy} onClick={takeBack}>↩️ {__kbUi("Qaytarish")}</button>}
          {!offerFromMe && !offerFromThem && state.yurishlar_soni >= 2 && <button type="button" className="sh-secondary" disabled={busy} onClick={() => post("/durang")}>🤝 {__kbUi("Durang taklifi")}</button>}
          <button type="button" className="sh-secondary" onClick={() => setConfirmResign(true)}>🏳️ {__kbUi("Taslim bo‘lish")}</button>
        </>}
    </div>}
    {state.tarix?.length > 0 && <details className="sh-history" open={showHistory} onToggle={(e) => setShowHistory(e.currentTarget.open)}>
      <summary>📜 {__kbUi("Yurishlar")} ({state.tarix.length})</summary>
      <ol>{Array.from({ length: Math.ceil(state.tarix.length / 2) }, (_, i) => <li key={i}><span>{i + 1}.</span><b>{formatMove(state.tarix[2 * i])}</b><b>{formatMove(state.tarix[2 * i + 1] || "")}</b></li>)}</ol>
    </details>}
    {result && <div className="sh-result" role="dialog" aria-label={__kbUi(result.title)}>
      <div className={`sh-result-card is-${state.sabab === "bekor" ? "bekor" : state.natija || "durang"}`}>
        <span className="sh-result-emoji" aria-hidden="true">{result.emoji}</span>
        <h2>{__kbUi(result.title)}</h2>
        {result.text && <p>{__kbUi(result.text)}</p>}
        {mine?.delta !== null && mine?.delta !== undefined && <p className={`sh-delta ${mine.delta >= 0 ? "is-up" : "is-down"}`}>🏅 {__kbUi("Reyting")}: {ratingDeltaText(mine.delta)}</p>}
        {state.turi === "onlayn" && state.raqib_bot && <p className="sh-botnote">🤖 {__kbUi("Bu safar onlayn raqib topilmadi, shuning uchun siz mashq boti bilan o‘ynadingiz. Bu o‘yin reytingga hisoblanmadi.")}</p>}
        {state.turi === "bot" && state.natija === "maglubiyat" && !["taslim", "kelishuv"].includes(state.sabab) && <button type="button" className="sh-secondary sh-undo" disabled={busy} onClick={takeBack}>↩️ {__kbUi("Xatoni tuzatib, davom etish")}</button>}
        {rematchFromThem && <p className="sh-muted">🔁 {__kbUi("Raqib yana o‘ynashni taklif qilyapti!")}</p>}
        {state.turnir_kod ? <div className="sh-row">
          <button type="button" className="sh-primary" onClick={() => toTournament(state.turnir_kod)}>🏆 {__kbUi("Turnirga qaytish")}</button>
        </div> : <div className="sh-row">
          {state.keyingi_kod
            ? <button type="button" className="sh-primary" onClick={() => open(state.keyingi_kod)}>{__kbUi("🔁 Yangi o‘yinga o‘tish")}</button>
            : state.yana_taklif === me
              ? <button type="button" className="sh-secondary" disabled>⏳ {__kbUi("Revansh taklifi yuborildi")}</button>
              : <button type="button" className="sh-primary" disabled={busy} onClick={again}>{__kbUi(state.turi === "onlayn" && state.raqib_bot ? "🔎 Yangi raqib" : rematchFromThem ? "✅ Revanshga roziman" : "🔁 Yana o‘ynash")}</button>}
          {state.turi === "onlayn" && !state.raqib_bot && <button type="button" className="sh-secondary" disabled={busy} onClick={() => startSearch(state.nazorat)}>{__kbUi("🔎 Yangi raqib")}</button>}
          <button type="button" className="sh-secondary" onClick={toMenu}>{__kbUi("Menyu")}</button>
        </div>}
      </div>
    </div>}
  </section>;
}
