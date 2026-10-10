import React, { useEffect, useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { JOURNEY_THEMES, TIER_INFO, gameSizeTier, journeyColumns, journeyState, journeyThemeId } from "./gameJourneyRules.js";
import "./gameJourney.css";

// Kurs darajasi: to'g'ri javoblar yonib, ketma-ketlari chiziq bilan bog'lanadigan bilim tarmog'i.
function KnowledgeNetwork({ cells }) {
  const n = cells.length;
  const size = 220, center = size / 2;
  const points = cells.map((_, i) => {
    const turns = n > 30 ? 3 : n > 10 ? 2 : 1;
    const angle = (i / n) * Math.PI * 2 * turns - Math.PI / 2;
    const radius = 18 + (i / Math.max(1, n - 1)) * (center - 26);
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  });
  const dot = n > 60 ? 3.2 : n > 30 ? 4 : 6;
  return <svg className="gj-network" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={__kbUi("Bilim tarmog‘i")}>
    {cells.map((cell, i) => i > 0 && cell === "done" && cells[i - 1] === "done"
      ? <line key={`l${i}`} x1={points[i - 1][0]} y1={points[i - 1][1]} x2={points[i][0]} y2={points[i][1]} className="gj-link" /> : null)}
    {cells.map((cell, i) => <circle key={i} cx={points[i][0]} cy={points[i][1]} r={cell === "current" ? dot + 2 : dot} className={`gj-node is-${cell}`} />)}
  </svg>;
}

/** Butun test davomida qurilib boradigan manzara: har to'g'ri javob — yangi qism. */
export default function GameJourney({ total, log, currentPosition, band, level, grade, finished = false }) {
  useKbInterfaceLocale();
  const themeId = journeyThemeId({ band, level, grade });
  const theme = JOURNEY_THEMES[themeId];
  const tier = gameSizeTier(total);
  const state = useMemo(() => journeyState(total, log, finished ? 0 : currentPosition), [total, log, currentPosition, finished]);
  const [toast, setToast] = useState("");
  const lastStage = useRef(state.stage);
  useEffect(() => {
    if (state.stage > lastStage.current && state.stage > 0) {
      setToast(`${state.stage}-bosqich ochildi: ${theme.stages[state.stage - 1]}`);
      const timer = setTimeout(() => setToast(""), 3200);
      lastStage.current = state.stage;
      return () => clearTimeout(timer);
    }
    lastStage.current = state.stage;
    return undefined;
  }, [state.stage, theme]);
  const columns = journeyColumns(total);
  return <section className={`gj-root gj-${themeId} gj-tier-${tier}`} aria-label={__kbUi(theme.title)}>
    <header className="gj-head">
      <span className="gj-icon" aria-hidden="true">{theme.icon}</span>
      <div>
        <strong>{__kbUi(theme.title)}</strong>
        <small>{__kbUi(TIER_INFO[tier].title)} · {__kbUi(`${state.percentBuilt}% qurildi`)}{state.stage > 0 ? ` · ${__kbUi(theme.stages[state.stage - 1])}` : ""}</small>
      </div>
      <div className="gj-stats">
        {themeId === "tarmoq"
          ? <><span title={__kbUi("Bog‘lanishlar")}>🔗 {state.links}</span><span title={__kbUi("Eng uzun zanjir")}>⛓ {state.bestStreak}</span><span title={__kbUi("Tahlil chuqurligi")}>{__kbUi(`${state.depth}-daraja`)}</span></>
          : <><span title={__kbUi("Qurilgan qismlar")}>{theme.done} {state.done}</span><span title={__kbUi("Ketma-ket to‘g‘ri")}>🔥 {state.streak}</span></>}
      </div>
    </header>
    <div className="gj-stages" aria-hidden="true">
      {theme.stages.map((name, i) => <span key={name} className={i < state.stage ? "is-open" : ""} title={__kbUi(name)} />)}
    </div>
    {themeId === "tarmoq"
      ? <KnowledgeNetwork cells={state.cells} />
      : <div className="gj-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {state.cells.map((cell, i) => <span key={i} className={`gj-cell is-${cell}`} title={`${i + 1}`}>{theme[cell] || theme.empty}</span>)}
        </div>}
    {finished && state.stage >= 5 && <p className="gj-finish">🎉 {__kbUi(theme.finish)}</p>}
    {toast && <p className="gj-toast" role="status">✨ {__kbUi(toast)}</p>}
  </section>;
}
