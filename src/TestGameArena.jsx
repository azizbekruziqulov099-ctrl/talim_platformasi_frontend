import React, { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import "./testGames.css";
import {
  AGE_BANDS,
  GAME_AUTO_READ_MAX_WAIT_MS,
  GAME_FEEDBACK_HOLD_MS,
  GAME_MODES,
  GAME_TIMEOUT_ANSWER,
  GAME_TIMER_READY_DELAY_MS,
  formatGameTimerSeconds,
  gameFeedbackCountdownSeconds,
  gameErrorMessage,
  gameLivesRemaining,
  gameQuestionTimerConfig,
  isGameTerminalResponse,
  modeForId,
  modeNameForBand,
  resolveGameGradeBand,
  profileLevelLabel,
  shouldAutoReadGameQuestion,
} from "./testGameRules.js";


function GameText({ value }) {
  const text = String(value || "").replace(/\[\/?(?:lat|ru|en|uz)\]/gi, "");
  const parts = text.split(/(\$[^$]+\$|\\(?:tfrac|dfrac|cfrac|frac)\{[^{}]*\}\{[^{}]*\}|\\sqrt\{[^{}]*\}|\\(?:times|div|cdot|pm|leq|geq|neq|infty|approx))/g);
  return parts.map((part, index) => {
    const looksMath = /^\$[^$]+\$$/.test(part) || /^\\/.test(part);
    if (!looksMath) return <React.Fragment key={index}>{part}</React.Fragment>;
    const expression = part.startsWith("$") ? part.slice(1, -1) : part;
    try {
      const html = katex.renderToString(expression, { throwOnError: false, output: "html" });
      return <span key={index} className="game-math" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }
  });
}


function GameImage({ value, apiBase }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [value]);
  if (!value || failed) return null;
  const raw = String(value);
  const imageLike = raw.startsWith("/api/") || /^https?:\/\//i.test(raw) || /^\d+(-\d+){5,9}$/.test(raw);
  if (!imageLike) {
    try {
      const html = katex.renderToString(raw, { throwOnError: false, output: "html", displayMode: true });
      return <div className="game-formula" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return null;
    }
  }
  const src = raw.startsWith("/api/") ? `${apiBase}${raw}` : /^https?:\/\//i.test(raw) ? raw : `${apiBase}/api/rasm/${raw}`;
  return <img className="game-question-image" src={src} alt="Savol rasmi" onError={() => setFailed(true)} />;
}


export function GameProfileStrip({ profile, accent = "#1B4B7A", compact = false }) {
  if (!profile) return null;
  const progress = Math.min(100, Math.max(0, ((profile.level_progress || 0) / (profile.level_target || 250)) * 100));
  return (
    <div className={`game-profile-strip ${compact ? "is-compact" : ""}`} style={{ "--game-accent": accent }}>
      <div className="game-profile-main">
        <span className="game-profile-medal">★</span>
        <div>
          <strong>{Number(profile.total_points || 0).toLocaleString("uz-UZ")} ochko</strong>
          <small>{profileLevelLabel(profile)}</small>
        </div>
      </div>
      <div className="game-level-track" role="progressbar" aria-label="Keyingi daraja" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="game-profile-stats">
        <span>🔥 {profile.current_streak || 0} kun</span>
        <span>🏁 {profile.games_completed || 0} o'yin</span>
      </div>
    </div>
  );
}


export function GameModePicker({ value, onChange, gradeBand, accent, profile }) {
  const age = AGE_BANDS[gradeBand] || AGE_BANDS.applicant;
  return (
    <div className={`game-picker-wrap game-age-${gradeBand}`} style={{ "--game-accent": accent || "#1B4B7A" }}>
      <GameProfileStrip profile={profile} accent={accent} />
      <div className="game-age-note">
        <span>{age.label}</span>
        <p>{age.helper}. Har beshinchi savol 4 variantli {age.bossName} bo'ladi va har savolda bitta urinish beriladi.</p>
      </div>
      <div className="game-mode-grid" aria-label="O'yin turini tanlang">
        {GAME_MODES.map((mode) => {
          const active = value === mode.id;
          return (
            <button
              type="button"
              key={mode.id}
              aria-pressed={active}
              className={`game-mode-card game-mode-card-${mode.id} ${active ? "is-active" : ""}`}
              style={{ "--mode-dark": mode.colors[0], "--mode-light": mode.colors[1] }}
              onClick={() => onChange(mode.id)}
            >
              <span className="game-mode-icon">{mode.icon}</span>
              <span className="game-mode-copy">
                <strong>{modeNameForBand(mode.id, gradeBand)}</strong>
                <small>{mode.short}</small>
              </span>
              <span className="game-mode-check">{active ? "✓" : "›"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function sceneStateClass(feedback) {
  if (feedback?.type === "timeout") return "is-scene-timeout";
  if (feedback?.correct === true) return "is-scene-correct";
  if (feedback?.correct === false) return "is-scene-wrong";
  return "is-scene-playing";
}


function SceneFeedbackFX({ feedback, successText = "Ajoyib!", failText = "Yana urinib ko'ring" }) {
  if (feedback?.correct !== true && feedback?.correct !== false && feedback?.type !== "timeout") return null;
  const correct = feedback?.correct === true;
  return (
    <div className={`scene-feedback-fx ${correct ? "is-success" : "is-fail"}`} aria-hidden="true">
      <span>{correct ? "✓" : "!"}</span>
      <strong>{correct ? successText : feedback?.type === "timeout" ? "VAQT TUGADI" : failText}</strong>
      <i /><i /><i /><i /><i /><i />
    </div>
  );
}


function GameAvatar({ variant = "runner", className = "" }) {
  return (
    <span className={`game-avatar avatar-${variant} ${className}`} aria-hidden="true">
      <i className="avatar-aura" />
      <i className="avatar-shadow" />
      <i className="avatar-leg avatar-leg-left" />
      <i className="avatar-leg avatar-leg-right" />
      <i className="avatar-body" />
      <i className="avatar-arm avatar-arm-left" />
      <i className="avatar-arm avatar-arm-right" />
      <i className="avatar-head"><b /><em /></i>
      <i className="avatar-face"><b /><em /><u /></i>
      <i className="avatar-hair" />
      {variant === "detective" && <i className="avatar-hat" />}
      {variant === "builder" && <i className="avatar-helmet" />}
      {variant === "astronaut" && <i className="avatar-space-helmet" />}
      {variant === "host" && <i className="avatar-microphone" />}
      {variant === "runner" && <i className="avatar-cape" />}
    </span>
  );
}


function SceneHud({ label, step, icon }) {
  return (
    <div className="scene-hud" aria-hidden="true">
      <span>{icon}</span>
      <div><small>MISSIYA</small><strong>{label}</strong></div>
      <b>{step}/5</b>
    </div>
  );
}


function GameLivesHud({ mode, livesRemaining, feedback }) {
  const modeCopy = {
    bridge: { title: "JON ARQONLARI", full: "♥", empty: "×" },
    millionaire: { title: "IMKON CHIROQLARI", full: "◆", empty: "◇" },
    space: { title: "ENERGIYA ULANISHI", full: "✦", empty: "×" },
    detective: { title: "DALIL IPLARI", full: "●", empty: "×" },
    city: { title: "XAVFSIZLIK TROSSI", full: "▣", empty: "×" },
  }[mode] || { title: "JONLAR", full: "♥", empty: "×" };
  const parsedLives = Number(livesRemaining);
  const parsedMaxLives = Number(feedback?.maxLives);
  const maxLives = Number.isFinite(parsedMaxLives)
    ? Math.max(1, Math.min(3, Math.trunc(parsedMaxLives)))
    : 3;
  const activeLives = Number.isFinite(parsedLives)
    ? Math.max(0, Math.min(maxLives, Math.trunc(parsedLives)))
    : maxLives;
  const parsedLivesBefore = Number(feedback?.livesBefore);
  const livesBefore = Number.isFinite(parsedLivesBefore)
    ? Math.max(0, Math.min(maxLives, Math.trunc(parsedLivesBefore)))
    : Math.min(maxLives, activeLives + (feedback?.livesLost ? 1 : 0));
  const lostLife = Boolean(feedback?.livesLost);
  const gainedLife = Boolean(feedback?.lifeGained);
  const lostSlotIndex = Math.max(0, livesBefore - 1);
  return (
    <div
      className={`game-lives-hud lives-${mode} ${lostLife ? "did-lose" : ""} ${gainedLife ? "did-gain" : ""}`}
      role="status"
      aria-label={`${activeLives} ta jon qoldi`}
    >
      <strong>{modeCopy.title}</strong>
      <div>
        {Array.from({ length: maxLives }, (_, index) => (
          <span
            key={index}
            className={[
              index < activeLives ? "is-intact" : "is-broken",
              lostLife && index === lostSlotIndex ? "is-new-loss" : "",
              gainedLife && index === activeLives - 1 ? "is-new-life" : "",
            ].filter(Boolean).join(" ")}
          >
            <i /><b>{index < activeLives ? modeCopy.full : modeCopy.empty}</b>
          </span>
        ))}
      </div>
      <small>{feedback?.lifeGained ? "Bosqich tugadi · jon tiklandi" : `Raunddan o'tsangiz jon ${maxLives} tagacha tiklanadi`}</small>
    </div>
  );
}


function BridgeScene({ step, feedback }) {
  const state = sceneStateClass(feedback);
  const safeStep = Math.max(1, Math.min(5, Number(step) || 1));
  const runnerIndex = feedback?.correct === true ? safeStep - 1 : Math.max(-0.35, safeStep - 1.75);
  return (
    <section className={`game-scene game-scene-bridge ${state}`} aria-label={`Oltin ko'prik, ${safeStep}-oyna`}>
      <div className="bridge-world" aria-hidden="true">
        <div className="bridge-sun" />
        <div className="bridge-cloud bridge-cloud-one" /><div className="bridge-cloud bridge-cloud-two" />
        <div className="bridge-castle"><i /><i /><i /><b /></div>
        <div className="bridge-mountains"><i /><i /><i /></div>
        <div className="bridge-water"><i /><i /><i /></div>
        <div className="bridge-coins">{[1, 2, 3, 4, 5].map((number) => <i key={number}>★</i>)}</div>
        <div className="bridge-runner-track" style={{ "--runner-index": runnerIndex }}>
          <div className="bridge-runner"><GameAvatar variant="runner" /></div>
        </div>
        <div className="bridge-tiles">
          {[1, 2, 3, 4, 5].map((number) => {
            const classes = [
              number < safeStep ? "is-done" : "",
              number === safeStep ? "is-current" : "",
              number === safeStep && feedback?.correct === true ? "is-cleared" : "",
              number === safeStep && feedback?.correct === false ? "is-cracked" : "",
            ].filter(Boolean).join(" ");
            return (
              <span key={number} className={classes}>
                <b>{number === 5 ? "BOSS" : number}</b><i /><em /><u />
              </span>
            );
          })}
        </div>
        <div className="bridge-portal"><i>★</i><b>BOSS</b></div>
      </div>
      <SceneHud icon="◆" label={safeStep === 5 ? "Boss darvozasi" : "To'g'ri oynaga sakrang"} step={safeStep} />
      <SceneFeedbackFX feedback={feedback} successText="SAKRASH BAJARILDI!" failText="OYNA DARZ KETDI" />
      <small className="scene-caption">{safeStep === 5 ? "Darvozani ochish uchun final javobni toping" : "To'g'ri javob qahramonni keyingi oynaga olib o'tadi"}</small>
    </section>
  );
}


function MillionaireScene({ step, feedback }) {
  const safeStep = Math.max(1, Math.min(5, Number(step) || 1));
  const prizes = ["1 000 000", "500 000", "250 000", "125 000", "64 000"];
  return (
    <section className={`game-scene game-scene-millionaire ${sceneStateClass(feedback)}`} aria-label={`Bilim millioneri, ${safeStep}-pog'ona`}>
      <div className="millionaire-world" aria-hidden="true">
        <div className="stage-beams"><i /><i /><i /><i /><i /></div>
        <div className="stage-rings"><i /><i /><i /></div>
        <div className="stage-audience">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
        <div className="millionaire-host"><GameAvatar variant="host" /></div>
        <div className="millionaire-chair"><i /><b /><GameAvatar variant="contestant" /></div>
        <div className="millionaire-emblem"><span>M</span><i /></div>
        <div className="millionaire-ladder">
          {prizes.map((prize, index) => {
            const level = 5 - index;
            return <span key={prize} className={level === safeStep ? "is-current" : level < safeStep ? "is-done" : ""}><i>{level}</i><b>{prize}</b></span>;
          })}
        </div>
      </div>
      <SceneHud icon="₿" label={safeStep === 5 ? "Millionlik savol" : "Navbatdagi pog'ona"} step={safeStep} />
      <SceneFeedbackFX feedback={feedback} successText="JAVOB QABUL QILINDI!" failText="NOTO'G'RI JAVOB" />
      <small className="scene-caption">Bilimingiz bilan bosh sovrin tomon ko'tariling</small>
    </section>
  );
}


function SpaceScene({ step, feedback }) {
  const safeStep = Math.max(1, Math.min(5, Number(step) || 1));
  const rocketIndex = feedback?.correct === true ? safeStep - 1 : Math.max(-0.2, safeStep - 1.55);
  return (
    <section className={`game-scene game-scene-space ${sceneStateClass(feedback)}`} aria-label={`Kosmik parvoz, ${safeStep}-orbita`}>
      <div className="space-world" aria-hidden="true">
        <div className="space-nebula" /><div className="space-nebula is-second" />
        <div className="space-starfield">{Array.from({ length: 34 }, (_, index) => <i key={index} />)}</div>
        <div className="space-planet planet-one"><i /></div>
        <div className="space-planet planet-two"><i /></div>
        <div className="space-planet planet-boss"><i /><b>BOSS</b></div>
        <div className="space-route"><i /><i /><i /><i /><i /></div>
        <div className="space-rocket-track" style={{ "--rocket-index": rocketIndex }}>
          <div className="space-rocket"><i className="rocket-flame" /><b /><span /><em /></div>
        </div>
        <div className="space-pilot"><GameAvatar variant="astronaut" /></div>
        <div className="space-cockpit"><span /><i /><b>ENERGIYA</b><em><u style={{ width: `${safeStep * 20}%` }} /></em></div>
      </div>
      <SceneHud icon="✦" label={safeStep === 5 ? "Boss sayyorasi" : "Keyingi orbitaga uching"} step={safeStep} />
      <SceneFeedbackFX feedback={feedback} successText="ORBITAGA O'TILDI!" failText="ENERGIYA KAMAYDI" />
      <small className="scene-caption">Har to'g'ri javob raketaga yangi quvvat beradi</small>
    </section>
  );
}


function DetectiveScene({ step, feedback }) {
  const safeStep = Math.max(1, Math.min(5, Number(step) || 1));
  const clueLabels = ["IZ", "KALIT", "XARITA", "KOD"];
  return (
    <section className={`game-scene game-scene-detective ${sceneStateClass(feedback)}`} aria-label={`Bilim detektivi, ${safeStep}-dalil`}>
      <div className="detective-world" aria-hidden="true">
        <div className="detective-window"><i /><i /><i /><i /></div>
        <div className="detective-lamp"><i /><b /></div>
        <div className="detective-desk"><i /><b /><em /></div>
        <div className="detective-avatar"><GameAvatar variant="detective" /><i className="detective-glass" /></div>
        <div className="detective-board">
          <div className="detective-thread"><i /><i /><i /><i /></div>
          {clueLabels.map((label, index) => {
            const number = index + 1;
            return <span key={label} className={number < safeStep ? "is-found" : number === safeStep ? "is-current" : ""}><i>{number}</i><b>{label}</b><em>{number <= safeStep ? "TOPILDI" : "?"}</em></span>;
          })}
          <b className={`detective-verdict ${safeStep === 5 ? "is-current" : ""}`}>XULOSA<i>★</i></b>
        </div>
        <div className="detective-spotlight" />
      </div>
      <SceneHud icon="⌕" label={safeStep === 5 ? "Sirni oching" : `${safeStep}-dalilni toping`} step={safeStep} />
      <SceneFeedbackFX feedback={feedback} successText="DALIL TOPILDI!" failText="IZ YO'QOLDI" />
      <small className="scene-caption">Savolni yeching va ish doskasidagi sirli bog'lanishni oching</small>
    </section>
  );
}


function CityScene({ step, feedback }) {
  const safeStep = Math.max(1, Math.min(5, Number(step) || 1));
  return (
    <section className={`game-scene game-scene-city ${sceneStateClass(feedback)}`} aria-label={`Bilim shahri, ${safeStep}-qurilish`}>
      <div className="city-world" aria-hidden="true">
        <div className="city-sun" /><div className="city-cloud is-one" /><div className="city-cloud is-two" />
        <div className="city-hills"><i /><i /></div>
        <div className="city-crane"><i /><b /><em /><u /></div>
        <div className="city-skyline">
          {[1, 2, 3, 4, 5].map((number) => (
            <span key={number} className={`${number < safeStep ? "is-built" : ""} ${number === safeStep ? "is-current" : ""} ${number === safeStep && feedback?.correct === true ? "is-built-now" : ""}`}>
              <b>{number === 5 ? "★" : ""}</b>{Array.from({ length: Math.min(8, number + 3) }, (_, index) => <i key={index} />)}
            </span>
          ))}
        </div>
        <div className="city-road"><i /><i /><i /><span /></div>
        <div className="city-builder"><GameAvatar variant="builder" /><i className="builder-plan" /></div>
        <div className="city-trees"><i /><i /><i /></div>
      </div>
      <SceneHud icon="▦" label={safeStep === 5 ? "Shahar markazi" : "Yangi bino quring"} step={safeStep} />
      <SceneFeedbackFX feedback={feedback} successText="BINO QURILDI!" failText="LOYIHA TO'XTADI" />
      <small className="scene-caption">To'g'ri javob bilan shahringizga yangi bino qo'shing</small>
    </section>
  );
}


function GameScene({ mode, question, feedback }) {
  const step = question?.round_step || 1;
  if (mode === "millionaire") return <MillionaireScene step={step} feedback={feedback} />;
  if (mode === "space") return <SpaceScene step={step} feedback={feedback} />;
  if (mode === "detective") return <DetectiveScene step={step} feedback={feedback} />;
  if (mode === "city") return <CityScene step={step} feedback={feedback} />;
  return <BridgeScene step={step} feedback={feedback} />;
}


function gameAnswerFeedbackTitle(mode, feedback) {
  const copy = {
    bridge: { correct: "To'g'ri! Oyna butun qoldi.", wrong: "Oyna sinib tushdi." },
    millionaire: { correct: "To'g'ri! Keyingi pog'ona ochildi.", wrong: "Bu javob qabul qilinmadi." },
    space: { correct: "To'g'ri! Raketa quvvat oldi.", wrong: "Portal energiyasi uzildi." },
    detective: { correct: "To'g'ri! Yangi dalil topildi.", wrong: "Bu dalil noto'g'ri chiqdi." },
    city: { correct: "To'g'ri! Yangi bino qurildi.", wrong: "Bu qurilish moduli ishlamadi." },
  }[mode] || { correct: "To'g'ri!", wrong: "Noto'g'ri javob." };
  if (feedback?.correct) return copy.correct;
  return `${copy.wrong} To'g'ri javob: ${feedback?.correctAnswer || "—"}`;
}


function gameClockNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}


function GameTimer({ timer }) {
  if (!timer || timer.phase === "inactive") return null;
  if (timer.phase === "preparing") {
    return (
      <div className="game-timer is-preparing" role="status" aria-live="polite">
        <span className="game-timer-icon" aria-hidden="true">◷</span>
        <div>
          <strong>{timer.autoReading ? "Savol ovozli o'qilmoqda" : "Vaqt tayyorlanmoqda"}</strong>
          <small>Hisob savol tayyor bo'lgach boshlanadi</small>
        </div>
      </div>
    );
  }
  if (timer.phase === "error") {
    return (
      <div className="game-timer is-error" role="alert">
        <span className="game-timer-icon" aria-hidden="true">!</span>
        <div>
          <strong>Vaqtni boshlab bo'lmadi</strong>
          <small>{timer.message || "Internetni tekshirib, qayta urinib ko'ring"}</small>
        </div>
        {timer.onRetry && <button type="button" onClick={timer.onRetry}>Qayta urinish</button>}
      </div>
    );
  }
  const remaining = Math.max(0, Number(timer.remainingSeconds) || 0);
  const limit = Math.max(1, Number(timer.limitSeconds) || remaining || 1);
  const percent = Math.max(0, Math.min(100, (remaining / limit) * 100));
  const warning = remaining <= Math.max(5, Math.ceil(limit * 0.2));
  const critical = remaining <= 3;
  return (
    <div
      className={`game-timer ${warning ? "is-warning" : ""} ${critical ? "is-critical" : ""} ${timer.phase === "expired" ? "is-expired" : ""}`}
      role="timer"
      aria-label={timer.phase === "expired" ? "Vaqt tugadi" : `${Math.ceil(remaining)} soniya qoldi`}
    >
      <span className="game-timer-icon" aria-hidden="true">⏱</span>
      <div className="game-timer-copy">
        <strong>{timer.phase === "expired" ? "Vaqt tugadi" : formatGameTimerSeconds(remaining)}</strong>
        <small>Tezlik uchun bonus yo'q · aniq javob muhim</small>
      </div>
      <div
        className="game-timer-track"
        role="progressbar"
        aria-label="Savol uchun qolgan vaqt"
        aria-valuemin="0"
        aria-valuemax={Math.ceil(limit)}
        aria-valuenow={Math.ceil(remaining)}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}


function isFailureTerminal(payload = {}) {
  const source = payload || {};
  const status = String(source.status || source.game_status || "").trim().toLowerCase();
  return ["game_over", "failed", "lost", "expired"].includes(status) || source.game_over === true;
}


function GameTerminalScreen({ terminal, mode, gradeBand, onSetup, onTopics }) {
  const meta = modeForId(mode);
  const lives = gameLivesRemaining(terminal, terminal?.result);
  const terminalResult = terminal?.result;
  const message = gameErrorMessage(
    terminal,
    String(terminal?.status || "").toLowerCase() === "failed"
      ? "Bu missiya yakunlandi. Yangi o'yinda yana urinib ko'ring."
      : "Imkonlar tugadi. Yangi o'yinda yana urinib ko'ring.",
  );
  return (
    <div className="game-result-overlay">
      <div className="game-result game-terminal-result" style={{ "--mode-dark": meta.colors[0], "--mode-light": meta.colors[1] }}>
        <div className="game-result-burst">♥</div>
        <p className="game-kicker">MISSIYA YAKUNLANDI</p>
        <h1>{modeNameForBand(mode, gradeBand)}</h1>
        <p className="game-terminal-message">{message}</p>
        {lives !== null && <p className="game-terminal-lives">♥ {lives} imkon qoldi</p>}
        {terminalResult && (
          <>
            <div className="game-result-score" style={{ color: meta.colors[0] }}>
              <strong>{terminalResult.score_1000 || 0}</strong><span>/ 1000</span>
            </div>
            <p>{terminalResult.correct_count || 0} / {terminalResult.total || 0} to'g'ri · {terminalResult.percent || 0}% bilim natijasi</p>
            <GameProfileStrip profile={terminalResult.profile} accent={meta.colors[0]} compact />
          </>
        )}
        <div className="game-result-actions">
          <button type="button" onClick={onSetup}>Qayta urinish</button>
          <button type="button" className="is-secondary" onClick={onTopics}>Boshqa mavzu</button>
        </div>
      </div>
    </div>
  );
}


function ResultScreen({ result, mode, gradeBand, onSetup, onTopics }) {
  const meta = modeForId(mode);
  const color = result.score_1000 >= 850 ? "#C58B19" : result.score_1000 >= 600 ? meta.colors[0] : "#9A3412";
  return (
    <div className="game-result-overlay">
      <div className="game-result" style={{ "--mode-dark": meta.colors[0], "--mode-light": meta.colors[1] }}>
        <div className="game-result-burst">{result.perfect ? "★" : result.completed ? "✓" : "■"}</div>
        <p className="game-kicker">{result.completed ? "MISSIYA YAKUNLANDI" : "O'YIN TO'XTATILDI"}</p>
        <h1>{modeNameForBand(mode, gradeBand)}</h1>
        <div className="game-result-score" style={{ color }}>
          <strong>{result.score_1000 || 0}</strong><span>/ 1000</span>
        </div>
        <p>{result.correct_count || 0} / {result.total || 0} to'g'ri · {result.percent || 0}% bilim natijasi</p>
        <div className="game-result-breakdown">
          <span><b>{result.regular_points || 0}</b> test</span>
          <span><b>{result.boss_points || 0}</b> Boss</span>
          <span><b>{result.completion_points || 0}</b> yakun</span>
          <span><b>{result.mastery_bonus || 0}</b> bonus</span>
        </div>
        <div className="game-earned-points">
          <span>Hisobga qo'shildi</span>
          <strong>+{result.awarded_points || 0} ochko</strong>
          {result.daily_first_test_points > 0 && <small>Shundan +{result.daily_first_test_points} — bugungi birinchi tugallangan test</small>}
          {result.awarded_points === 0 && result.completed && <small>Bu natija avvalgi rekordingizdan oshmadi; bilim foizi baribir saqlandi.</small>}
        </div>
        <GameProfileStrip profile={result.profile} accent={meta.colors[0]} compact />
        <div className="game-result-actions">
          <button type="button" onClick={onSetup}>Shu mavzuda yana</button>
          <button type="button" className="is-secondary" onClick={onTopics}>Boshqa mavzu</button>
        </div>
      </div>
    </div>
  );
}


export default function TestGameArena({
  token,
  apiBase,
  initialSession,
  accent = "#1B4B7A",
  onBackToSetup,
  onBackToTopics,
  onProfileChange,
  onRead,
  onStopRead,
  onFinished,
}) {
  const initialFailure = isFailureTerminal(initialSession) ? initialSession : null;
  const [session, setSession] = useState(initialSession);
  const [selectedOption, setSelectedOption] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingNext, setPendingNext] = useState(null);
  const [pendingRetry, setPendingRetry] = useState(null);
  const [feedbackCountdown, setFeedbackCountdown] = useState(null);
  const [error, setError] = useState("");
  const [stopConfirm, setStopConfirm] = useState(false);
  const [result, setResult] = useState(initialFailure ? null : initialSession?.result || null);
  const [pendingResult, setPendingResult] = useState(null);
  const [terminalFailure, setTerminalFailure] = useState(initialFailure);
  const [pendingTerminal, setPendingTerminal] = useState(null);
  const [timerCycle, setTimerCycle] = useState(0);
  const [readyRetry, setReadyRetry] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const [timer, setTimer] = useState({
    phase: initialSession?.result || initialFailure ? "inactive" : "preparing",
    remainingSeconds: null,
    limitSeconds: null,
    activationKey: null,
    autoReading: false,
    message: "",
  });
  const question = session?.question;
  const mode = session?.game_mode || "bridge";
  const meta = useMemo(() => modeForId(mode), [mode]);
  const gradeBand = resolveGameGradeBand(session, question);
  const age = AGE_BANDS[gradeBand];
  const questionKey = question?.question_key || "";
  const isBoss = Boolean(question?.is_boss);
  const readText = useMemo(() => {
    if (!question) return "";
    const options = (question.options || [])
      .filter((option) => !option.hidden)
      .map((option) => `${option.key}) ${option.text}`)
      .join(". ");
    return `${question.question || ""}${options ? `. ${options}` : ""}`;
  }, [question]);
  const autoRead = shouldAutoReadGameQuestion(session, question || {});
  const stopReadRef = useRef(onStopRead);
  const readRef = useRef(onRead);
  const mountedRef = useRef(false);
  const timerAnchorRef = useRef(null);
  const timerStoppedRef = useRef(true);
  const gameEndedRef = useRef(Boolean(initialSession?.result || initialFailure));
  const readyRequestsRef = useRef(new Map());
  const autoReadPromisesRef = useRef(new Map());
  const timeoutActionRef = useRef({ questionKey: "", actionId: "", sent: false, manualRequired: false });
  const transitionCommittedRef = useRef("");
  const arenaRef = useRef(null);
  const resumeReadyAfterStopRef = useRef(false);
  const readyGenerationRef = useRef(0);

  const closeStopConfirm = () => {
    setStopConfirm(false);
    if (resumeReadyAfterStopRef.current) {
      resumeReadyAfterStopRef.current = false;
      setReadyRetry((value) => value + 1);
    }
  };

  useEffect(() => { stopReadRef.current = onStopRead; }, [onStopRead]);
  useEffect(() => { readRef.current = onRead; }, [onRead]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (stopReadRef.current) stopReadRef.current();
    return () => { if (stopReadRef.current) stopReadRef.current(); };
  }, [questionKey]);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    if (typeof arena.scrollTo === "function") arena.scrollTo({ top: 0, left: 0, behavior: "auto" });
    else arena.scrollTop = 0;
  }, [questionKey]);

  useEffect(() => {
    if (!stopConfirm) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !busy) closeStopConfirm();
    };
    globalThis.addEventListener?.("keydown", closeOnEscape);
    return () => globalThis.removeEventListener?.("keydown", closeOnEscape);
  }, [stopConfirm, busy]);

  const actionId = () => (
    globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  );

  const completeTerminal = (data) => {
    if (stopReadRef.current) stopReadRef.current();
    gameEndedRef.current = true;
    timerStoppedRef.current = true;
    setTimerExpired(false);
    setPendingNext(null);
    setPendingRetry(null);
    setPendingResult(null);
    setPendingTerminal(null);
    setFeedbackCountdown(null);
    resumeReadyAfterStopRef.current = false;
    if (isFailureTerminal(data)) {
      setTerminalFailure(data || { status: "game_over" });
      if (data?.result?.profile && onProfileChange) onProfileChange(data.result.profile);
      if (onFinished) onFinished(data || { status: "game_over" });
    } else if (data?.result) {
      setResult(data.result);
      if (data.result.profile && onProfileChange) onProfileChange(data.result.profile);
      if (onFinished) onFinished(data.result);
    } else {
      setTerminalFailure(data || { status: "game_over" });
      if (onFinished) onFinished(data || { status: "game_over" });
    }
  };

  const queueTerminal = (data) => {
    gameEndedRef.current = true;
    timerStoppedRef.current = true;
    if (data?.result?.profile && onProfileChange) onProfileChange(data.result.profile);
    if (isFailureTerminal(data)) {
      setPendingTerminal(data || { status: "game_over" });
    } else if (data?.result) {
      setPendingResult(data.result);
    } else {
      setPendingTerminal(data || { status: "game_over" });
    }
  };

  const moveNext = () => {
    if (!pendingNext) return;
    if (stopReadRef.current) stopReadRef.current();
    timerStoppedRef.current = true;
    // Yangi savol va `preparing` bitta React batchida bo'yaladi. Shu bilan
    // /tayyor javobidan oldingi bitta kadrda variantlarni bosib yuborib bo'lmaydi.
    setTimer((current) => ({
      ...current,
      phase: "preparing",
      remainingSeconds: null,
      activationKey: null,
      autoReading: false,
      message: "",
    }));
    setSession(pendingNext);
    setPendingNext(null);
    setFeedbackCountdown(null);
    setFeedback(null);
    setSelectedOption("");
    setError("");
    setTimerExpired(false);
  };

  const feedbackTransition = useMemo(() => {
    if (pendingRetry) return { kind: "boss_retry", payload: pendingRetry };
    if (pendingNext) return { kind: "next", payload: pendingNext };
    if (pendingResult) return { kind: "result", payload: pendingResult };
    if (pendingTerminal) return { kind: "terminal", payload: pendingTerminal };
    return null;
  }, [pendingRetry, pendingNext, pendingResult, pendingTerminal]);
  const feedbackTransitionKey = feedbackTransition
    ? `${session?.session_id || "game"}:${questionKey}:${timerCycle}:${feedbackTransition.kind}`
    : "";

  const submitAnswer = async (selected, options = {}) => {
    const isTimeout = options.timeout === true;
    const value = isTimeout ? GAME_TIMEOUT_ANSWER : String(selected ?? "").trim();
    const timerUnavailable = timer.phase === "preparing" || timer.phase === "error";
    if ((!value && !isTimeout) || busy || stopConfirm || !question || feedback?.finalized || pendingNext || pendingRetry || pendingResult || pendingTerminal) return;
    if (!isTimeout && (timerUnavailable || timerExpired)) return;
    if (stopReadRef.current) stopReadRef.current();
    if (!isTimeout) setSelectedOption(value.toUpperCase());
    timerStoppedRef.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/oyin/${isTimeout ? "vaqt-tugadi" : "javob"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isTimeout
          ? {
              token,
              session_id: session.session_id,
              question_key: question.question_key,
              action_id: options.actionId || actionId(),
            }
          : {
              token,
              session_id: session.session_id,
              question_key: question.question_key,
              action_id: options.actionId || actionId(),
              answer: value,
            }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = data?.detail;
        if (!isTimeout && detail?.code === "QUESTION_TIME_EXPIRED") {
          timerStoppedRef.current = true;
          if (stopReadRef.current) stopReadRef.current();
          setTimer((current) => ({ ...current, phase: "expired", remainingSeconds: 0, autoReading: false }));
          setFeedback({ type: "timeout", text: "Vaqt tugadi. Natijani server tekshirmoqda." });
          setTimerExpired(true);
          return;
        }
        if (isTimeout && detail?.code === "TIMER_STILL_ACTIVE") {
          const config = gameQuestionTimerConfig(detail, session, Date.now());
          if (config.status !== "waiting" && config.enabled && Number(config.remainingSeconds) > 0) {
            const activationKey = timer.activationKey || `${session.session_id}:${question.question_key}:${timerCycle}`;
            timerAnchorRef.current = {
              activationKey,
              startedAtMs: gameClockNow(),
              initialRemaining: config.remainingSeconds,
              limitSeconds: config.limitSeconds,
            };
            timeoutActionRef.current.sent = false;
            timeoutActionRef.current.manualRequired = false;
            timerStoppedRef.current = false;
            setTimerExpired(false);
            setFeedback(null);
            setTimer({
              phase: "running",
              remainingSeconds: config.remainingSeconds,
              limitSeconds: config.limitSeconds,
              activationKey,
              autoReading: false,
              message: "",
            });
            return;
          }
        }
        throw new Error(gameErrorMessage(data));
      }
      const retry = data.status === "retry" || data.retry === true;
      const lives = gameLivesRemaining(data, data.question, session);
      const previousLives = gameLivesRemaining(question, session);
      const lifeChange = {
        livesRemaining: lives,
        livesBefore: data.lives_before ?? previousLives,
        maxLives: data.max_lives ?? data.question?.max_lives ?? question?.max_lives ?? session?.max_lives ?? 3,
        livesLost: Boolean(data.lives_lost || data.life_lost)
          || (lives !== null && previousLives !== null && lives < previousLives),
        lifeGained: Boolean(data.life_gained || data.lives_gained)
          || (lives !== null && previousLives !== null && lives > previousLives),
        levelCompleted: Boolean(data.level_completed || data.round_completed),
      };
      // Server yakuniy javobni berdi: feedback animatsiyasi vaqtida eski
      // countdown ko'rinmaydi va keyingi savol hali faollashtirilmaydi.
      setTimer((current) => ({
        ...current,
        phase: "inactive",
        remainingSeconds: null,
        autoReading: false,
      }));
      if (retry) {
        // Bossning yangi urinishini darhol ochmaymiz. 4,5 soniya davomida
        // xato/timeout animatsiyasi turadi; keyin yangi /tayyor sikli boshlanadi.
        setPendingRetry(data);
        setFeedback(isTimeout
          ? {
              type: "timeout",
              text: data.message || data.hint || "Vaqt tugadi. Server bitta imkonni hisobdan chiqardi.",
              attemptsLeft: data.attempts_left ?? data.question?.attempts_left,
              ...lifeChange,
            }
          : {
              type: "retry",
              correct: false,
              text: data.hint,
              attemptsLeft: data.attempts_left ?? data.question?.attempts_left,
              ...lifeChange,
            });
        setTimerExpired(false);
        return;
      }
      const terminal = isGameTerminalResponse(data);
      if (terminal && typeof data.correct !== "boolean") {
        if (isTimeout) {
          setFeedback({
            type: "timeout",
            text: data.message || "Vaqt tugadi. Imkonlar yakunlandi.",
            ...lifeChange,
          });
          queueTerminal(data);
        } else {
          completeTerminal(data);
        }
        return;
      }
      const finalFeedback = isTimeout
        ? {
            type: "timeout",
            finalized: true,
            correct: false,
            text: data.message || "Vaqt tugadi. Bitta imkon kamaydi.",
            correctAnswer: data.correct_answer,
            explanation: data.explanation,
            ...lifeChange,
          }
        : {
            finalized: true,
            correct: Boolean(data.correct),
            correctAnswer: data.correct_answer,
            explanation: data.explanation,
            ...lifeChange,
          };
      setFeedback(finalFeedback);
      if (terminal) {
        queueTerminal(data);
      } else {
        setPendingNext({
          ...session,
          ...data,
          status: "active",
          question: data.question,
        });
      }
    } catch (requestError) {
      setError(requestError.message || (isTimeout ? "Vaqt tugashi serverga yuborilmadi" : "Javob yuborilmadi"));
      if (isTimeout) {
        const failedRecord = timeoutActionRef.current;
        if (failedRecord.questionKey === question.question_key) {
          failedRecord.sent = false;
          failedRecord.manualRequired = true;
        }
        setFeedback((current) => ({
          type: "timeout",
          text: requestError.message || "Natijani serverdan olib bo'lmadi. Shu harakatni xavfsiz qayta yuborishingiz mumkin.",
          livesRemaining: current?.livesRemaining,
          attemptsLeft: current?.attemptsLeft,
          retryable: true,
        }));
      } else {
        timerStoppedRef.current = false;
        setSelectedOption("");
      }
    } finally {
      setBusy(false);
    }
  };

  const retryTimeout = () => {
    const record = timeoutActionRef.current;
    if (busy || stopConfirm || !timerExpired || record.questionKey !== questionKey || record.sent) return;
    record.sent = true;
    record.manualRequired = false;
    setError("");
    setFeedback((current) => ({ ...current, retryable: false, text: "Vaqt tugashi serverda tekshirilmoqda." }));
    submitAnswer(GAME_TIMEOUT_ANSWER, { timeout: true, actionId: record.actionId });
  };

  const useLifeline = async (lifeline) => {
    if (busy || stopConfirm || !question || timer.phase === "preparing" || timer.phase === "error" || timerExpired || pendingNext || pendingRetry) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/oyin/yordam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          session_id: session.session_id,
          question_key: question.question_key,
          action_id: actionId(),
          lifeline,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(gameErrorMessage(data));
      setSession((current) => ({ ...current, ...data, status: "active", question: data.question }));
      setFeedback({ type: "lifeline", text: lifeline === "fifty_fifty" ? "50/50 ishladi: ikkita xato javob olib tashlandi." : "Bitta xato javob olib tashlandi." });
    } catch (requestError) {
      setError(requestError.message || "Yordam ishlamadi");
    } finally {
      setBusy(false);
    }
  };

  const stopGame = async () => {
    if (stopReadRef.current) stopReadRef.current();
    // Tayyorlashdagi eski async closure Stop xatosidan keyin jonlanib,
    // modal ortida deadline boshlamasligi uchun ayni avlodni bekor qilamiz.
    readyGenerationRef.current += 1;
    gameEndedRef.current = true;
    setBusy(true);
    timerStoppedRef.current = true;
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/oyin/yakunlash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, session_id: session.session_id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(gameErrorMessage(data));
      completeTerminal({ ...data, status: data.status || "abandoned" });
      setStopConfirm(false);
    } catch (requestError) {
      gameEndedRef.current = false;
      if (timer.phase === "running") {
        timerStoppedRef.current = false;
      } else if (timer.phase === "preparing") {
        const activationKey = `${session?.session_id || ""}:${questionKey}:${timerCycle}`;
        const record = readyRequestsRef.current.get(activationKey);
        if (record) record.promise = null;
        autoReadPromisesRef.current.delete(activationKey);
        if (record?.sent) {
          // /tayyor tarmoqqa chiqib bo'lgan bo'lishi mumkin: modalni yopib,
          // o'sha action_id bilan serverdagi qolgan vaqtni darhol yangilaymiz.
          resumeReadyAfterStopRef.current = false;
          setStopConfirm(false);
          setReadyRetry((value) => value + 1);
        } else {
          // Server deadline hali boshlanmagan: Continue bosilgach ovoz qayta
          // o'qiladi va yangi readiness avlodi xavfsiz ishga tushadi.
          resumeReadyAfterStopRef.current = true;
        }
      }
      setError(requestError.message || "O'yin to'xtatilmadi");
    } finally {
      setBusy(false);
    }
  };

  const retryReady = () => {
    if (stopConfirm) return;
    const activationKey = `${session?.session_id || ""}:${questionKey}:${timerCycle}`;
    const record = readyRequestsRef.current.get(activationKey);
    if (record) record.promise = null;
    setReadyRetry((value) => value + 1);
  };

  // Savol ko'ringandan keyingina serverdagi vaqtni faollashtiramiz.
  // StrictMode yoki qayta renderlar bitta activationKey uchun aynan bitta
  // Promise/action_id'dan foydalanadi; shuning uchun deadline qayta yozilmaydi.
  useEffect(() => {
    if (!questionKey || result || terminalFailure) return undefined;
    let active = true;
    const activationKey = `${session.session_id}:${questionKey}:${timerCycle}`;
    const readyGeneration = readyGenerationRef.current;
    timerStoppedRef.current = true;
    timerAnchorRef.current = null;
    setTimerExpired(false);
    setTimer({
      phase: "preparing",
      remainingSeconds: null,
      limitSeconds: null,
      activationKey,
      autoReading: autoRead && Boolean(readRef.current),
      message: "",
    });
    timeoutActionRef.current = {
      questionKey,
      actionId: actionId(),
      sent: false,
      manualRequired: false,
    };

    let record = readyRequestsRef.current.get(activationKey);
    if (!record) {
      record = { actionId: actionId(), promise: null, sent: false };
      readyRequestsRef.current.set(activationKey, record);
    }
    if (!record.promise) {
      record.promise = (async () => {
        // Oldingi /tayyor tarmoqqa yuborilgan bo'lsa, retry o'sha idempotent
        // javobni darhol yangilaydi; server vaqti yurayotganda qayta ovoz kutmaydi.
        if (!record.sent && autoRead && readRef.current) {
          let voicePromise = autoReadPromisesRef.current.get(activationKey);
          if (!voicePromise) {
            try {
              voicePromise = Promise.resolve(readRef.current(readText)).catch(() => undefined);
            } catch {
              voicePromise = Promise.resolve();
            }
            // StrictMode/re-render bitta activation uchun qayta o'qimaydi;
            // Bossning yangi timerCycle urinishida esa yana bir marta o'qiydi.
            autoReadPromisesRef.current.set(activationKey, voicePromise);
          }
          const voiceOutcome = await Promise.race([
            voicePromise.then(() => "voice"),
            new Promise((resolve) => setTimeout(() => resolve("cap"), GAME_AUTO_READ_MAX_WAIT_MS)),
          ]);
          if (voiceOutcome === "cap" && stopReadRef.current) stopReadRef.current();
          await new Promise((resolve) => setTimeout(resolve, GAME_TIMER_READY_DELAY_MS));
        } else {
          await new Promise((resolve) => setTimeout(resolve, GAME_TIMER_READY_DELAY_MS));
        }
        if (!mountedRef.current || gameEndedRef.current || readyGeneration !== readyGenerationRef.current) {
          throw new Error("O'yin tayyorligi pauza qilindi");
        }
        record.sent = true;
        const response = await fetch(`${apiBase}/api/oyin/tayyor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            session_id: session.session_id,
            question_key: questionKey,
            action_id: record.actionId,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(gameErrorMessage(data, "Vaqtni boshlab bo'lmadi"));
        return data;
      })();
    }

    record.promise
      .then((data) => {
        if (!active || !mountedRef.current || readyGeneration !== readyGenerationRef.current) return;
        if (isGameTerminalResponse(data)) {
          completeTerminal(data);
          return;
        }
        const mergedQuestion = { ...question, ...(data.question || {}) };
        const mergedSession = { ...session, ...data, status: "active", question: mergedQuestion };
        setSession(mergedSession);
        const timerCarrier = { ...question, ...data, ...(data.question || {}) };
        const config = gameQuestionTimerConfig(timerCarrier, mergedSession, Date.now());
        if (config.status === "waiting") {
          timerStoppedRef.current = true;
          setTimer({
            phase: "error",
            remainingSeconds: null,
            limitSeconds: config.limitSeconds,
            activationKey,
            autoReading: false,
            message: "Server savol vaqtini hali faollashtirmadi",
          });
          return;
        }
        if (!config.enabled) {
          timerStoppedRef.current = true;
          setTimer({
            phase: "inactive",
            remainingSeconds: null,
            limitSeconds: null,
            activationKey,
            autoReading: false,
            message: "",
          });
          return;
        }
        if (config.remainingSeconds === null) {
          timerStoppedRef.current = true;
          setTimer({
            phase: "error",
            remainingSeconds: null,
            limitSeconds: config.limitSeconds,
            activationKey,
            autoReading: false,
            message: "Server qolgan vaqtni yubormadi",
          });
          return;
        }
        timerAnchorRef.current = {
          activationKey,
          // remaining_seconds server soatida hisoblangan. Uni performance.now
          // monoton anchor'iga aylantirib, qurilma soati siljishidan saqlaymiz.
          startedAtMs: gameClockNow(),
          initialRemaining: config.remainingSeconds,
          limitSeconds: config.limitSeconds,
        };
        timerStoppedRef.current = false;
        setTimer({
          phase: config.remainingSeconds <= 0 ? "expired" : "running",
          remainingSeconds: config.remainingSeconds,
          limitSeconds: config.limitSeconds,
          activationKey,
          autoReading: false,
          message: "",
        });
        if (config.remainingSeconds <= 0) setTimerExpired(true);
      })
      .catch((requestError) => {
        if (!active || !mountedRef.current || readyGeneration !== readyGenerationRef.current || requestError.message === "O'yin tayyorligi pauza qilindi") return;
        timerStoppedRef.current = true;
        setTimer({
          phase: "error",
          remainingSeconds: null,
          limitSeconds: null,
          activationKey,
          autoReading: false,
          message: requestError.message || "Vaqtni boshlab bo'lmadi",
        });
      });
    return () => { active = false; };
    // `session` timer davomida yangilanadi; activation faqat kalit/cycle/retry
    // o'zgarganda takrorlanishi kerak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey, timerCycle, readyRetry, Boolean(result), Boolean(terminalFailure)]);

  useEffect(() => {
    if (timer.phase !== "running" || !timer.activationKey) return undefined;
    const tick = () => {
      const anchor = timerAnchorRef.current;
      if (!anchor || anchor.activationKey !== timer.activationKey || timerStoppedRef.current) return;
      const elapsed = (gameClockNow() - anchor.startedAtMs) / 1000;
      const remaining = Math.max(0, Number(anchor.initialRemaining || 0) - elapsed);
      setTimer((current) => current.activationKey === anchor.activationKey
        ? { ...current, remainingSeconds: remaining, phase: remaining <= 0 ? "expired" : "running" }
        : current);
      if (remaining <= 0) {
        timerStoppedRef.current = true;
        if (stopReadRef.current) stopReadRef.current();
        setFeedback({ type: "timeout", text: "Vaqt tugadi. Natijani server tekshirmoqda." });
        setTimerExpired(true);
      }
    };
    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [timer.activationKey, timer.phase]);

  // Expiry faqat bir marta yuboriladi. Agar lifeline so'rovi ayni paytda
  // ishlayotgan bo'lsa, `busy=false` bo'lgach shu effect bitta actionni yuboradi.
  useEffect(() => {
    if (!timerExpired || busy || !questionKey || result || terminalFailure || pendingNext || pendingRetry || pendingResult || pendingTerminal) return;
    const record = timeoutActionRef.current;
    if (record.questionKey !== questionKey || record.sent || record.manualRequired) return;
    record.sent = true;
    submitAnswer(GAME_TIMEOUT_ANSWER, { timeout: true, actionId: record.actionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerExpired, busy, questionKey]);

  // Har qanday yakuniy javob bir xil 4,5 soniyalik o'yin animatsiyasidan
  // o'tadi. StrictMode, qayta render yoki tarmoq replay'i bir transitionni
  // ikki marta bajarolmaydi. Stop modali ochilsa pauza bekor qilinadi va
  // modal yopilganda to'liq feedback oralig'i qayta boshlanadi.
  useEffect(() => {
    if (!feedbackTransition || !feedbackTransitionKey) {
      setFeedbackCountdown(null);
      return undefined;
    }
    if (stopConfirm) return undefined;

    if (transitionCommittedRef.current !== feedbackTransitionKey) {
      transitionCommittedRef.current = "";
    }
    const deadline = gameClockNow() + GAME_FEEDBACK_HOLD_MS;
    setFeedbackCountdown(gameFeedbackCountdownSeconds(GAME_FEEDBACK_HOLD_MS));

    const updateCountdown = () => {
      const remaining = Math.max(0, deadline - gameClockNow());
      setFeedbackCountdown(gameFeedbackCountdownSeconds(remaining));
    };

    const commitTransition = () => {
      if (!mountedRef.current || transitionCommittedRef.current === feedbackTransitionKey) return;
      transitionCommittedRef.current = feedbackTransitionKey;
      setFeedbackCountdown(0);

      if (feedbackTransition.kind === "next") {
        moveNext();
        return;
      }
      if (feedbackTransition.kind === "boss_retry") {
        const data = feedbackTransition.payload || {};
        if (stopReadRef.current) stopReadRef.current();
        timerStoppedRef.current = true;
        setSession((current) => ({
          ...current,
          ...data,
          status: "active",
          question: {
            ...current.question,
            ...(data.question || {}),
            attempts_used: data.attempts_used ?? data.question?.attempts_used ?? current.question?.attempts_used,
            attempts_left: data.attempts_left ?? data.question?.attempts_left ?? current.question?.attempts_left,
          },
        }));
        setPendingRetry(null);
        setFeedback(null);
        setFeedbackCountdown(null);
        setSelectedOption("");
        setError("");
        setTimerExpired(false);
        setTimer((current) => ({ ...current, phase: "preparing", autoReading: false }));
        // Shu nuqtadan keyingina yangi idempotent /tayyor va yangi deadline.
        setTimerCycle((value) => value + 1);
        return;
      }
      if (feedbackTransition.kind === "result") {
        completeTerminal({ result: feedbackTransition.payload, status: "completed" });
        return;
      }
      completeTerminal(feedbackTransition.payload);
    };

    const intervalId = setInterval(updateCountdown, 100);
    const timeoutId = setTimeout(commitTransition, GAME_FEEDBACK_HOLD_MS);
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
    // Transition payloadining o'zi shu kalit yaratilgan paytdagi stabil snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackTransitionKey, stopConfirm]);

  if (result) {
    return (
      <ResultScreen
        result={result}
        mode={mode}
        gradeBand={gradeBand}
        onSetup={() => { if (stopReadRef.current) stopReadRef.current(); onBackToSetup(); }}
        onTopics={() => { if (stopReadRef.current) stopReadRef.current(); onBackToTopics(); }}
      />
    );
  }
  if (terminalFailure) {
    return (
      <GameTerminalScreen
        terminal={terminalFailure}
        mode={mode}
        gradeBand={gradeBand}
        onSetup={() => { if (stopReadRef.current) stopReadRef.current(); onBackToSetup(); }}
        onTopics={() => { if (stopReadRef.current) stopReadRef.current(); onBackToTopics(); }}
      />
    );
  }
  if (!question) return <div className="game-loading">O'yin holati yuklanmoqda...</div>;

  const overallProgress = Math.max(0, Math.min(100, ((question.position - 1) / question.total) * 100));
  const feedbackFinal = Boolean(feedback?.finalized);
  const interactionLocked = busy
    || stopConfirm
    || feedbackFinal
    || Boolean(pendingNext || pendingRetry || pendingResult || pendingTerminal)
    || timerExpired
    || timer.phase === "preparing"
    || timer.phase === "error"
    || timer.phase === "expired";
  const livesRemaining = gameLivesRemaining(feedback, question, session);

  return (
    <div
      ref={arenaRef}
      className={`test-game-arena game-${mode} game-age-${gradeBand}`}
      style={{ "--mode-dark": meta.colors[0], "--mode-light": meta.colors[1], "--game-accent": accent }}
    >
      <header className="game-topbar">
        <div>
          <small>{age.label} · {question.round}-raund</small>
          <strong>{modeNameForBand(mode, gradeBand)}</strong>
        </div>
        <div className="game-top-stats">
          <span>✓ {session.correct_count || 0}</span>
          {livesRemaining !== null && <span aria-label={`${livesRemaining} imkon qoldi`}>♥ {livesRemaining}</span>}
          <span>{question.position}/{question.total}</span>
          <button type="button" onClick={() => setStopConfirm(true)} aria-label="O'yinni to'xtatish">■</button>
        </div>
      </header>
      <div className="game-overall-track" role="progressbar" aria-label="O'yin jarayoni" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(overallProgress)}><span style={{ width: `${overallProgress}%` }} /></div>

      <div className={`game-stage game-stage-${mode} ${sceneStateClass(feedback)}`}>
        <GameScene mode={mode} question={question} feedback={feedback} />
        <GameLivesHud mode={mode} livesRemaining={livesRemaining} feedback={feedback} />

        <div className="game-stage-content">
          <GameTimer timer={{ ...timer, onRetry: stopConfirm ? null : retryReady }} />

          {mode === "millionaire" && question.can_use_lifeline && (
            <div className="game-lifelines" aria-label="Yordamlar">
              <button type="button" disabled={interactionLocked || !session.lifelines?.fifty_fifty || question.lifeline_used} onClick={() => useLifeline("fifty_fifty")}>50/50</button>
              <button type="button" disabled={interactionLocked || !session.lifelines?.remove_one || question.lifeline_used} onClick={() => useLifeline("remove_one")}>−1 xato</button>
            </div>
          )}

          <main
            key={questionKey}
            className={`game-question-card game-question-in-scene ${isBoss ? "is-boss" : ""} ${feedback?.correct === true ? "is-answer-correct" : ""} ${feedback?.correct === false || feedback?.type === "timeout" ? "is-answer-wrong" : ""} ${feedbackTransition ? "is-advancing" : ""}`}
          >
        <div className="game-question-label">
          <span>{isBoss ? `★ ${age.bossName}` : `${question.round_step}-savol`}</span>
          {isBoss && <small>4 variantdan birini tanlang</small>}
        </div>
        <GameImage value={question.rasm_id} apiBase={apiBase} />
        <div className="game-question-heading">
          <h1><GameText value={question.question} /></h1>
          {onRead && <button type="button" disabled={interactionLocked} onClick={() => onRead(readText)} aria-label="Savol va javoblarni ovoz chiqarib o'qish">🔊</button>}
        </div>

        <div className="game-options" aria-label={isBoss ? "Boss javob variantlari" : "Javob variantlari"}>
          {(question.options || []).map((option) => (
            <button
              type="button"
              key={option.key}
              disabled={interactionLocked || option.hidden}
              className={[
                option.hidden ? "is-hidden-option" : "",
                selectedOption === option.key ? "is-selected-option" : "",
                feedbackFinal && String(feedback.correctAnswer || "").toUpperCase() === String(option.key || "").toUpperCase() ? "is-correct-option" : "",
                feedbackFinal && selectedOption === option.key && feedback.correct === false ? "is-wrong-option" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => submitAnswer(option.key)}
            >
              <span>{option.key}</span>
              <b>{option.hidden ? "Xato javob olib tashlandi" : <GameText value={option.text} />}</b>
            </button>
          ))}
        </div>

        <div className="game-feedback" aria-live="polite">
          {feedback?.type === "retry" && <div className="is-retry"><strong>Yana urinib ko'ring</strong><p>{feedback.text} {feedback.attemptsLeft} imkon qoldi.</p></div>}
          {feedback?.type === "lifeline" && <div className="is-help"><strong>Yordam ishladi</strong><p>{feedback.text}</p></div>}
          {feedback?.type === "timeout" && (
            <div className="is-timeout">
              <strong>Vaqt tugadi</strong>
              <p>
                {feedback.text}
                {feedback.livesRemaining !== null && feedback.livesRemaining !== undefined ? ` ♥ ${feedback.livesRemaining} imkon qoldi.` : ""}
                {feedback.attemptsLeft !== null && feedback.attemptsLeft !== undefined ? ` ${feedback.attemptsLeft} urinish qoldi.` : ""}
              </p>
              {feedback.explanation && <p><GameText value={feedback.explanation} /></p>}
              {feedback.retryable && (
                <button type="button" className="game-timeout-retry" onClick={retryTimeout} disabled={busy || stopConfirm}>
                  Serverga qayta yuborish
                </button>
              )}
            </div>
          )}
          {feedbackFinal && feedback?.type !== "timeout" && (
            <div className={feedback.correct ? "is-correct" : "is-wrong"}>
              <strong>{gameAnswerFeedbackTitle(mode, feedback)}</strong>
              {feedback.explanation && <p><GameText value={feedback.explanation} /></p>}
            </div>
          )}
          {error && <div className="is-error">{error}</div>}
        </div>

        {feedbackTransition && (
          <div
            key={`${feedbackTransitionKey}:${stopConfirm ? "paused" : "active"}`}
            className={`game-feedback-transition is-${feedbackTransition.kind} ${stopConfirm ? "is-paused" : ""}`}
            role="status"
            aria-live="polite"
          >
            <span className="game-feedback-countdown" aria-hidden="true">
              <b>{feedbackCountdown ?? gameFeedbackCountdownSeconds(GAME_FEEDBACK_HOLD_MS)}</b>
              <i />
            </span>
            <div>
              <strong>
                {feedbackTransition.kind === "next" && (pendingNext?.question?.is_boss ? `${age.bossName} ochilmoqda` : "Keyingi savol tayyorlanmoqda")}
                {feedbackTransition.kind === "boss_retry" && "Yangi Boss urinishi tayyorlanmoqda"}
                {feedbackTransition.kind === "result" && "Natijani ko'rish uchun animatsiya yakunlanmoqda"}
                {feedbackTransition.kind === "terminal" && "Missiya natijasi tayyorlanmoqda"}
              </strong>
              <small>4,5 soniyalik o'yin animatsiyasidan keyin avtomatik o'tadi</small>
            </div>
          </div>
        )}
          </main>
        </div>
      </div>

      {stopConfirm && (
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="O'yinni to'xtatish">
          <div className="game-modal">
            <h2>O'yinni to'xtatasizmi?</h2>
            <p>Bilim natijangiz saqlanadi, ammo o'yinni tugatish bonusi va hisob ochkosi berilmaydi.</p>
            {error && <p className="game-modal-error" role="alert">{error}</p>}
            <div>
              <button type="button" autoFocus onClick={closeStopConfirm} disabled={busy}>Davom etish</button>
              <button type="button" className="is-danger" onClick={stopGame} disabled={busy}>Ha, to'xtatish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
