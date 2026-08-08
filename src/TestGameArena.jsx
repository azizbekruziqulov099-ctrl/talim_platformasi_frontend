import React, { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import "./testGames.css";
import {
  AGE_BANDS,
  GAME_AUTO_READ_MAX_WAIT_MS,
  GAME_MODES,
  GAME_TIMEOUT_ANSWER,
  GAME_TIMER_READY_DELAY_MS,
  formatGameTimerSeconds,
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
        <p>{age.helper}. Har 4 ta testdan keyin {age.bossAttempts} imkonli yozma {age.bossName} keladi.</p>
      </div>
      <div className="game-mode-grid" aria-label="O'yin turini tanlang">
        {GAME_MODES.map((mode) => {
          const active = value === mode.id;
          return (
            <button
              type="button"
              key={mode.id}
              aria-pressed={active}
              className={`game-mode-card ${active ? "is-active" : ""}`}
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


function BridgeScene({ step, feedback }) {
  return (
    <div className="game-scene game-scene-bridge" aria-label="Ko'prikdagi yurish holati">
      <div className={`bridge-runner ${feedback?.correct === true ? "did-jump" : feedback?.correct === false ? "did-shake" : ""}`} style={{ left: `${Math.min(88, 7 + (step - 1) * 20)}%` }}>●</div>
      <div className="bridge-tiles">
        {[1, 2, 3, 4, 5].map((number) => <span key={number} className={number < step ? "is-done" : number === step ? "is-current" : ""}>{number === 5 ? "★" : number}</span>)}
      </div>
      <small>{step === 5 ? "Boss darvozasi" : `${step}-oyna · to'g'ri javob yo'lni ochadi`}</small>
    </div>
  );
}


function MillionaireScene({ step }) {
  return (
    <div className="game-scene game-scene-millionaire">
      <div className="millionaire-orbit">M</div>
      <div className="millionaire-ladder">
        {[5, 4, 3, 2, 1].map((number) => (
          <span key={number} className={number === step ? "is-current" : number < step ? "is-done" : ""}>
            {number === 5 ? "JACKPOT" : `${number * 25} 000`}
          </span>
        ))}
      </div>
    </div>
  );
}


function SpaceScene({ step, feedback }) {
  return (
    <div className="game-scene game-scene-space">
      <div className="space-stars">✦ · ✧ · ✦ · ✧ · ✦</div>
      <div className={`space-rocket ${feedback?.correct ? "did-launch" : ""}`} style={{ left: `${Math.min(86, 7 + (step - 1) * 20)}%` }}>▲</div>
      <div className="space-orbits">{[1, 2, 3, 4, 5].map((number) => <span key={number} className={number <= step ? "is-lit" : ""}>{number === 5 ? "◎" : "○"}</span>)}</div>
      <small>{step === 5 ? "Qo'nish topshirig'i" : "Keyingi orbitaga tayyor"}</small>
    </div>
  );
}


function DetectiveScene({ step }) {
  return (
    <div className="game-scene game-scene-detective">
      <div className="detective-board">
        {[1, 2, 3, 4].map((number) => <span key={number} className={number < step ? "is-found" : number === step ? "is-current" : ""}>DALIL {number}</span>)}
        <b className={step === 5 ? "is-current" : ""}>XULOSA</b>
      </div>
      <small>{step === 5 ? "Topilgan dalillar bilan Boss savolni yeching" : "Muhim ishorani toping"}</small>
    </div>
  );
}


function CityScene({ step }) {
  return (
    <div className="game-scene game-scene-city">
      <div className="city-skyline">
        {[1, 2, 3, 4, 5].map((number) => <span key={number} className={number <= step ? "is-built" : ""} style={{ height: `${22 + number * 9}px` }}>{number === 5 ? "★" : ""}</span>)}
      </div>
      <small>{step === 5 ? "Shahar markazini yakunlang" : "To'g'ri javob — yangi bino"}</small>
    </div>
  );
}


function GameScene({ mode, question, feedback }) {
  const step = question?.round_step || 1;
  if (mode === "millionaire") return <MillionaireScene step={step} />;
  if (mode === "space") return <SpaceScene step={step} feedback={feedback} />;
  if (mode === "detective") return <DetectiveScene step={step} />;
  if (mode === "city") return <CityScene step={step} />;
  return <BridgeScene step={step} feedback={feedback} />;
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
  );
}


function ResultScreen({ result, mode, gradeBand, onSetup, onTopics }) {
  const meta = modeForId(mode);
  const color = result.score_1000 >= 850 ? "#C58B19" : result.score_1000 >= 600 ? meta.colors[0] : "#9A3412";
  return (
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
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingNext, setPendingNext] = useState(null);
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
    if (question.is_boss) return String(question.question || "");
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

  const actionId = () => (
    globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  );

  const completeTerminal = (data) => {
    if (stopReadRef.current) stopReadRef.current();
    gameEndedRef.current = true;
    timerStoppedRef.current = true;
    setTimerExpired(false);
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
    setSession(pendingNext);
    setPendingNext(null);
    setFeedback(null);
    setAnswer("");
    setError("");
    setTimerExpired(false);
  };

  const submitAnswer = async (selected, options = {}) => {
    const isTimeout = options.timeout === true;
    const value = isTimeout ? GAME_TIMEOUT_ANSWER : String(selected ?? answer).trim();
    const timerUnavailable = timer.phase === "preparing" || timer.phase === "error";
    if ((!value && !isTimeout) || busy || !question || feedback?.finalized || pendingNext || pendingResult || pendingTerminal) return;
    if (!isTimeout && (timerUnavailable || timerExpired)) return;
    if (stopReadRef.current) stopReadRef.current();
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
      if (retry) {
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
        setFeedback(isTimeout
          ? {
              type: "timeout",
              text: data.message || data.hint || "Vaqt tugadi. Server bitta imkonni hisobdan chiqardi.",
              attemptsLeft: data.attempts_left ?? data.question?.attempts_left,
              livesRemaining: lives,
            }
          : {
              type: "retry",
              correct: false,
              text: data.hint,
              attemptsLeft: data.attempts_left ?? data.question?.attempts_left,
              livesRemaining: lives,
            });
        setAnswer("");
        setTimerExpired(false);
        setTimer((current) => ({ ...current, phase: "preparing", autoReading: false }));
        // Xuddi shu Boss savoli qayta urinishga berildi: server yangi
        // deadline'ni faqat navbatdagi idempotent /tayyor javobida beradi.
        setTimerCycle((value) => value + 1);
        return;
      }
      const terminal = isGameTerminalResponse(data);
      if (terminal && typeof data.correct !== "boolean") {
        if (isTimeout) {
          setFeedback({
            type: "timeout",
            text: data.message || "Vaqt tugadi. Imkonlar yakunlandi.",
            livesRemaining: lives,
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
            livesRemaining: lives,
          }
        : {
            finalized: true,
            correct: Boolean(data.correct),
            correctAnswer: data.correct_answer,
            explanation: data.explanation,
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
      }
    } finally {
      setBusy(false);
    }
  };

  const retryTimeout = () => {
    const record = timeoutActionRef.current;
    if (busy || !timerExpired || record.questionKey !== questionKey || record.sent) return;
    record.sent = true;
    record.manualRequired = false;
    setError("");
    setFeedback((current) => ({ ...current, retryable: false, text: "Vaqt tugashi serverda tekshirilmoqda." }));
    submitAnswer(GAME_TIMEOUT_ANSWER, { timeout: true, actionId: record.actionId });
  };

  const useLifeline = async (lifeline) => {
    if (busy || !question || timer.phase === "preparing" || timer.phase === "error" || timerExpired || pendingNext) return;
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
      if (timer.phase === "running") timerStoppedRef.current = false;
      setError(requestError.message || "O'yin to'xtatilmadi");
    } finally {
      setBusy(false);
    }
  };

  const retryReady = () => {
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
      record = { actionId: actionId(), promise: null };
      readyRequestsRef.current.set(activationKey, record);
    }
    if (!record.promise) {
      record.promise = (async () => {
        if (autoRead && readRef.current) {
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
        if (!mountedRef.current || gameEndedRef.current) throw new Error("O'yin oynasi yopildi");
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
        if (!active || !mountedRef.current) return;
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
        if (!active || !mountedRef.current || requestError.message === "O'yin oynasi yopildi") return;
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
    if (!timerExpired || busy || !questionKey || result || terminalFailure || pendingNext || pendingResult || pendingTerminal) return;
    const record = timeoutActionRef.current;
    if (record.questionKey !== questionKey || record.sent || record.manualRequired) return;
    record.sent = true;
    submitAnswer(GAME_TIMEOUT_ANSWER, { timeout: true, actionId: record.actionId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerExpired, busy, questionKey]);

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
    || feedbackFinal
    || Boolean(pendingNext || pendingResult || pendingTerminal)
    || timerExpired
    || timer.phase === "preparing"
    || timer.phase === "error"
    || timer.phase === "expired";
  const livesRemaining = gameLivesRemaining(feedback, question, session);

  return (
    <div
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

      <GameScene mode={mode} question={question} feedback={feedback} />

      <GameTimer timer={{ ...timer, onRetry: retryReady }} />

      {mode === "millionaire" && question.can_use_lifeline && (
        <div className="game-lifelines" aria-label="Yordamlar">
          <button type="button" disabled={interactionLocked || !session.lifelines?.fifty_fifty || question.lifeline_used} onClick={() => useLifeline("fifty_fifty")}>50/50</button>
          <button type="button" disabled={interactionLocked || !session.lifelines?.remove_one || question.lifeline_used} onClick={() => useLifeline("remove_one")}>−1 xato</button>
        </div>
      )}

      <main className={`game-question-card ${isBoss ? "is-boss" : ""}`}>
        <div className="game-question-label">
          <span>{isBoss ? `★ ${age.bossName}` : `${question.round_step}-savol`}</span>
          {isBoss && <small>{question.attempts_left} imkon qoldi</small>}
        </div>
        <GameImage value={question.rasm_id} apiBase={apiBase} />
        <div className="game-question-heading">
          <h1><GameText value={question.question} /></h1>
          {onRead && <button type="button" disabled={interactionLocked} onClick={() => onRead(readText)} aria-label="Savol va javoblarni ovoz chiqarib o'qish">🔊</button>}
        </div>

        {isBoss ? (
          <form className="game-written-answer" onSubmit={(event) => { event.preventDefault(); submitAnswer(answer); }}>
            <input
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={interactionLocked}
              placeholder={gradeBand === "grade_1_4" ? "Bir so'z yoki son yozing" : "Aniq javobingizni yozing"}
              autoComplete="off"
              aria-label="Yozma javob"
            />
            <button type="submit" disabled={interactionLocked || !answer.trim()}>{busy ? "Tekshirilmoqda..." : "Javobni tekshirish"}</button>
          </form>
        ) : (
          <div className="game-options">
            {(question.options || []).map((option) => (
              <button
                type="button"
                key={option.key}
                disabled={interactionLocked || option.hidden}
                className={option.hidden ? "is-hidden-option" : ""}
                onClick={() => submitAnswer(option.key)}
              >
                <span>{option.key}</span>
                <b>{option.hidden ? "Xato javob olib tashlandi" : <GameText value={option.text} />}</b>
              </button>
            ))}
          </div>
        )}

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
                <button type="button" className="game-timeout-retry" onClick={retryTimeout} disabled={busy}>
                  Serverga qayta yuborish
                </button>
              )}
            </div>
          )}
          {feedbackFinal && feedback?.type !== "timeout" && (
            <div className={feedback.correct ? "is-correct" : "is-wrong"}>
              <strong>{feedback.correct ? "To'g'ri! Yo'l ochildi." : `To'g'ri javob: ${feedback.correctAnswer || "—"}`}</strong>
              {feedback.explanation && <p><GameText value={feedback.explanation} /></p>}
            </div>
          )}
          {error && <div className="is-error">{error}</div>}
        </div>

        {pendingNext && (
          <button type="button" className="game-next-button" onClick={moveNext}>
            {pendingNext.question?.is_boss ? `${age.bossName}ga o'tish` : "Keyingi savol"} →
          </button>
        )}
        {pendingResult && (
          <button type="button" className="game-next-button" onClick={() => completeTerminal({ result: pendingResult, status: "completed" })}>
            Natijani ko'rish →
          </button>
        )}
        {pendingTerminal && (
          <button type="button" className="game-next-button is-game-over" onClick={() => completeTerminal(pendingTerminal)}>
            Missiya natijasini ko'rish →
          </button>
        )}
      </main>

      {stopConfirm && (
        <div className="game-modal-backdrop" role="dialog" aria-modal="true" aria-label="O'yinni to'xtatish">
          <div className="game-modal">
            <h2>O'yinni to'xtatasizmi?</h2>
            <p>Bilim natijangiz saqlanadi, ammo o'yinni tugatish bonusi va hisob ochkosi berilmaydi.</p>
            {error && <p className="game-modal-error" role="alert">{error}</p>}
            <div>
              <button type="button" onClick={() => setStopConfirm(false)} disabled={busy}>Davom etish</button>
              <button type="button" className="is-danger" onClick={stopGame} disabled={busy}>Ha, to'xtatish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
