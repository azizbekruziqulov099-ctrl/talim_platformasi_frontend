import React, { useCallback, useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { GLYPHS, PIECE_NAMES, chessCells, chessClick, targetsFrom } from "./chessRules.js";
import { exerciseStars, lessonStars, starText } from "./schoolRules.js";
import "./shaxmat.css";
import "./shaxmatMaktab.css";

async function call(apiBase, path, token, body) {
  const url = `${apiBase}${path}${body ? "" : `${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET", cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify({ token, ...body }) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Server xatosi (${res.status})`);
  return data;
}

function useVoice(apiBase) {
  const audio = useRef(null);
  return useCallback((text) => {
    try {
      audio.current?.pause();
      const a = new Audio(`${apiBase}/api/ovoz?${new URLSearchParams({ matn: String(text).slice(0, 600) })}`);
      audio.current = a;
      a.play().catch(() => {});
    } catch { /* ovoz ixtiyoriy */ }
  }, [apiBase]);
}

/** Bitta mashq: taxta, vazifa, yulduzlar, tekshiruv va natija. */
function Exercise({ apiBase, token, lesson, index, ex, onDone, say }) {
  const [fen, setFen] = useState(ex.fen);
  const [moves, setMoves] = useState(ex.mumkin || []);
  const [got, setGot] = useState([]);
  const [selected, setSelected] = useState(null);
  const [promotion, setPromotion] = useState(null);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState(null);
  const [last, setLast] = useState([]);
  const [shake, setShake] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null);

  const wrong = (text, square) => {
    setMistakes((n) => n + 1);
    setMsg({ ok: false, text });
    setShake(square || "board");
    setTimeout(() => setShake(""), 500);
  };
  const finish = (text, finalMistakes, finalCount) => {
    setDone(true);
    setMsg({ ok: true, text });
    const stars = exerciseStars(ex, finalMistakes, finalCount);
    setTimeout(() => onDone(stars), 1400);
  };

  const submit = async (path) => {
    setSelected(null); setPromotion(null); setBusy(true);
    try {
      const r = await call(apiBase, `/api/shaxmat/maktab/${lesson}/${index}/yur`, token, { fen, path, yigildi: got, qadam: step });
      if (!r.togri) { wrong(r.xabar); return; }
      const newCount = count + 1;
      setCount(newCount);
      setFen(r.fen);
      setMoves(r.mumkin || []);
      setGot(r.yigildi || got);
      setStep((s) => s + 1);
      setLast([path[0], path[1], ...(r.javob || [])]);
      if (r.tugadi) finish(r.xabar || "🎉 Barakalla!", mistakes, newCount);
      else setMsg(r.xabar ? { ok: true, text: r.xabar + (r.javob_yozuv ? ` (${r.javob_yozuv})` : "") } : null);
    } catch (e) { setMsg({ ok: false, text: e.message }); } finally { setBusy(false); }
  };

  const onSquare = (name) => {
    if (done || busy) return;
    if (ex.tur === "katak") {
      if (ex.javob.includes(name)) { setFound(name); finish("✅ To‘g‘ri topdingiz!", mistakes, 1); }
      else wrong(`Bu ${name} katak. Yana qidiring!`, name);
      return;
    }
    const res = chessClick(moves, selected, name);
    setSelected(res.selected);
    setPromotion(res.promotion);
    if (res.submit) submit(res.submit);
    else if (!res.selected && !res.promotion && selected) setMsg(null);
  };

  const targets = selected ? targetsFrom(moves, selected) : new Map();
  const movable = new Set(moves.map((m) => m[0]));
  const stars = new Set((ex.yulduzlar || []).filter((s) => !got.includes(s)));
  const lastSet = new Set(last);

  return <div className="sm-exercise">
    <div className="sm-task">
      <p>{__kbUi(ex.vazifa)}</p>
      <button type="button" className="sm-listen" onClick={() => say(ex.vazifa)} aria-label={__kbUi("Eshitish")}>🔊</button>
    </div>
    {ex.tur === "yulduz" && <p className="sm-counter">⭐ {got.length}/{ex.yulduzlar.length} · {__kbUi("yurish")}: {count}{ex.par ? ` · ${__kbUi("eng kami")}: ${ex.par}` : ""}</p>}
    {ex.tur === "mat" && <p className="sm-counter">🏆 {__kbUi(`Mat ${ex.n} yurishda`)}{ex.n > 1 ? ` · ${step + 1}/${ex.n}` : ""}</p>}
    <div className={`sh-board-wrap cx-frame sm-board ${shake === "board" ? "is-shake" : ""}`}>
      <div className="cx-board" role="grid" aria-label={__kbUi("Mashq taxtasi")}>
        {chessCells(fen, "w").map((cell) => {
          const isTarget = targets.has(cell.name);
          const cls = ["cx-cell", cell.dark ? "is-dark" : "is-light",
            lastSet.has(cell.name) ? "is-last" : "",
            selected === cell.name ? "is-selected" : "",
            isTarget ? (cell.piece ? "is-capture" : "is-target") : "",
            !selected && !done && movable.has(cell.name) ? "is-movable" : "",
            shake === cell.name ? "is-wrong" : "",
            found === cell.name ? "is-found" : ""].filter(Boolean).join(" ");
          const label = cell.piece ? `${cell.name} ${cell.piece.side === "w" ? "oq" : "qora"} ${PIECE_NAMES[cell.piece.type]}` : cell.name;
          return <button key={cell.index} type="button" className={cls} aria-label={label} onClick={() => onSquare(cell.name)}>
            {cell.rankLabel && <em className="cx-rank">{cell.rankLabel}</em>}
            {cell.fileLabel && <em className="cx-file">{cell.fileLabel}</em>}
            {stars.has(cell.name) && <span className={`sm-star ${cell.piece ? "is-on-piece" : ""}`} aria-hidden="true">⭐</span>}
            {cell.piece && <span className={`cx-piece is-${cell.piece.side}`}>{GLYPHS[cell.piece.type]}</span>}
          </button>;
        })}
      </div>
      {promotion && <div className="cx-promo" role="dialog" aria-label={__kbUi("Piyoda qaysi figuraga aylansin?")}>
        <p>{__kbUi("Piyoda qaysi figuraga aylansin?")}</p>
        <div>{["q", "r", "b", "n"].map((t) => <button key={t} type="button" className="cx-piece is-w" onClick={() => submit([...promotion, t])}>
          {GLYPHS[t]}<small>{__kbUi(PIECE_NAMES[t])}</small></button>)}</div>
      </div>}
    </div>
    <p className={`sm-msg ${msg ? (msg.ok ? "is-ok" : "is-bad") : ""}`} aria-live="polite">{msg ? __kbUi(msg.text) : " "}</p>
    {!done && ex.tur !== "katak" && step > 0 && <button type="button" className="sh-secondary" onClick={() => {
      setFen(ex.fen); setMoves(ex.mumkin || []); setGot([]); setStep(0); setCount(0); setLast([]); setMsg(null); setSelected(null);
    }}>↺ {__kbUi("Qaytadan boshlash")}</button>}
  </div>;
}

/** Shaxmat maktabi: darslar xaritasi → dars (tushuntirish) → mashqlar → yulduzlar. */
export default function ShaxmatMaktab({ apiBase, token, onBack, onPlay }) {
  useKbInterfaceLocale();
  const [map, setMap] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [phase, setPhase] = useState("map");   // map | intro | ex | done
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const say = useVoice(apiBase);

  const loadMap = useCallback(() => { call(apiBase, "/api/shaxmat/maktab", token).then(setMap).catch((e) => setError(e.message)); }, [apiBase, token]);
  useEffect(() => { if (phase === "map") loadMap(); }, [loadMap, phase]);

  const openLesson = async (kod) => {
    setError("");
    try {
      const d = await call(apiBase, `/api/shaxmat/maktab/${kod}`, token);
      setLesson(d); setPhase("intro"); setIndex(0); setResults([]);
    } catch (e) { setError(e.message); }
  };
  const exerciseDone = async (stars) => {
    const all = [...results, stars];
    setResults(all);
    if (index + 1 < lesson.mashqlar.length) { setIndex(index + 1); return; }
    setPhase("done");
    try { await call(apiBase, `/api/shaxmat/maktab/${lesson.kod}/natija`, token, { yulduz: lessonStars(all) }); } catch { /* keyin */ }
    loadMap();
  };

  if (phase === "intro" && lesson) return <section className="sh-root sm-root">
    <button type="button" className="sh-back" onClick={() => setPhase("map")}>← {__kbUi("Darslar")}</button>
    <div className="sm-intro">
      <span className="sm-big-emoji" aria-hidden="true">{lesson.emoji}</span>
      <h2>{__kbUi(lesson.nomi)}</h2>
      {lesson.matn.map((t) => <p key={t}>{__kbUi(t)}</p>)}
      <div className="sh-row">
        <button type="button" className="sh-secondary" onClick={() => say(lesson.matn.join(" "))}>🔊 {__kbUi("Eshitish")}</button>
        <button type="button" className="sh-primary" onClick={() => setPhase("ex")}>▶ {__kbUi("Mashqlarni boshlash")}</button>
      </div>
    </div>
  </section>;

  if (phase === "ex" && lesson) return <section className="sh-root sm-root">
    <header className="sm-head">
      <button type="button" className="sh-back" onClick={() => setPhase("intro")}>← {__kbUi(lesson.nomi)}</button>
      <div className="sm-dots">{lesson.mashqlar.map((_, i) => <i key={i} className={i < index ? "is-done" : i === index ? "is-now" : ""} />)}</div>
    </header>
    <Exercise key={`${lesson.kod}-${index}`} apiBase={apiBase} token={token} lesson={lesson.kod} index={index} ex={lesson.mashqlar[index]} onDone={exerciseDone} say={say} />
  </section>;

  if (phase === "done" && lesson) {
    const stars = lessonStars(results);
    return <section className="sh-root sm-root">
      <div className="sm-intro sm-finish">
        <span className="sm-big-emoji" aria-hidden="true">🎉</span>
        <h2>{__kbUi("Dars tugadi!")}</h2>
        <p className="sm-stars-big" aria-label={`${stars} ${__kbUi("yulduz")}`}>{starText(stars)}</p>
        <p>{__kbUi(stars === 3 ? "Mukammal! Siz haqiqiy shaxmatchisiz!" : stars === 2 ? "Juda yaxshi! Yana bir marta urinib, 3 yulduz olishingiz mumkin." : "Yaxshi boshlanish! Mashq qilsangiz, albatta o‘rganasiz.")}</p>
        <div className="sh-row">
          <button type="button" className="sh-secondary" onClick={() => openLesson(lesson.kod)}>↺ {__kbUi("Qayta o‘tish")}</button>
          {lesson.keyingi
            ? <button type="button" className="sh-primary" onClick={() => openLesson(lesson.keyingi)}>{__kbUi("Keyingi dars")} →</button>
            : onPlay && <button type="button" className="sh-primary" onClick={onPlay}>♞ {__kbUi("Endi bot bilan o‘ynang!")}</button>}
          <button type="button" className="sh-secondary" onClick={() => setPhase("map")}>🗺 {__kbUi("Darslar")}</button>
        </div>
      </div>
    </section>;
  }

  return <section className="sh-root sm-root">
    {onBack && <button type="button" className="sh-back" onClick={onBack}>← {__kbUi("Shaxmat")}</button>}
    <header className="sh-hero">
      <div className="sh-hero-icon" aria-hidden="true">🎓</div>
      <div><h2>{__kbUi("Shaxmat maktabi")}</h2><p>{__kbUi("Noldan boshlab: taxta, figuralar, shax, mat va taktika — o‘ynab o‘rganamiz!")}</p></div>
    </header>
    {map && <div className="sm-progress">
      <div className="sm-bar"><i style={{ width: `${Math.round((map.yulduzlar / Math.max(1, map.jami)) * 100)}%` }} /></div>
      <b>⭐ {map.yulduzlar}/{map.jami}</b>
    </div>}
    {error && <p className="sh-note">{__kbUi(error)}</p>}
    {!map && !error && <p className="sh-muted">{__kbUi("Yuklanmoqda…")}</p>}
    {map?.bolimlar.map((unit) => <div key={unit.nomi} className="sm-unit">
      <h3>{unit.emoji} {__kbUi(unit.nomi)}</h3>
      <div className="sm-lessons">
        {unit.darslar.map((d) => <button key={d.kod} type="button" className={`sm-lesson ${d.ochiq ? "" : "is-locked"} ${d.yulduz ? "is-done" : ""}`}
          disabled={!d.ochiq} onClick={() => openLesson(d.kod)}>
          <span className="sm-lesson-emoji" aria-hidden="true">{d.ochiq ? d.emoji : "🔒"}</span>
          <b>{__kbUi(d.nomi)}</b>
          <small>{d.yulduz ? starText(d.yulduz) : `${d.mashqlar} ${__kbUi("mashq")}`}</small>
        </button>)}
      </div>
    </div>)}
  </section>;
}
