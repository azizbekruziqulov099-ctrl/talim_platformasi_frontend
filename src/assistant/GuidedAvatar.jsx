import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CornerDownRight,
  Check,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

let activeTtsAudio = null;

function stopSpeech() {
  window.speechSynthesis?.cancel();
  if (!activeTtsAudio) return;
  activeTtsAudio.onplaying = null;
  activeTtsAudio.onended = null;
  activeTtsAudio.onerror = null;
  activeTtsAudio.pause();
  activeTtsAudio = null;
}

function browserSpeak(text, { onStart, onEnd } = {}) {
  if (!("speechSynthesis" in window) || !text) {
    onEnd?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "uz-UZ";
  utterance.rate = 0.92;
  utterance.pitch = 1.02;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("uz")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("tr")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (preferred) utterance.voice = preferred;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function speakUzbek(
  text,
  { apiBase, variant = "female", onStart, onEnd } = {},
) {
  if (!text) return;
  stopSpeech();

  const base = String(apiBase || "").replace(/\/+$/, "");
  if (!base) {
    browserSpeak(text, { onStart, onEnd });
    return;
  }

  const url = new URL(`${base}/api/ovoz`, window.location.origin);
  url.searchParams.set("matn", text.slice(0, 1500));
  url.searchParams.set("jins", variant === "male" ? "ogil" : "qiz");
  const audio = new Audio(url.toString());
  let fallbackStarted = false;
  activeTtsAudio = audio;

  const fallback = () => {
    if (fallbackStarted) return;
    fallbackStarted = true;
    if (activeTtsAudio === audio) activeTtsAudio = null;
    audio.pause();
    browserSpeak(text, { onStart, onEnd });
  };

  audio.onplaying = () => onStart?.();
  audio.onended = () => {
    if (activeTtsAudio === audio) activeTtsAudio = null;
    onEnd?.();
  };
  audio.onerror = fallback;
  audio.play().catch(fallback);
}

export default function GuidedAvatar({
  enabled = true,
  variant = "female",
  speechEnabled = true,
  apiBase,
  steps = [],
  activeKey,
  message,
  onNavigate,
  onAction,
  onUndo,
  onQuestion,
  onApplySuggestion,
  onSpeechChange,
  onEnabledChange,
}) {
  const [minimized, setMinimized] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activityVersion, setActivityVersion] = useState(0);
  const [question, setQuestion] = useState("");
  const [questionBusy, setQuestionBusy] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const lastSpoken = useRef("");
  const actionRef = useRef(onAction);
  const matchedIndex = steps.findIndex((step) => step.key === activeKey);
  const activeIndex =
    matchedIndex >= 0 ? matchedIndex : activeKey ? -1 : steps.length ? 0 : -1;
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : null;
  const activeMessage = message || activeStep?.message || "Men yordam berishga tayyorman.";

  const avatarName = useMemo(
    () => (variant === "male" ? "Temur" : variant === "neutral" ? "Hamroh" : "Ziyo"),
    [variant],
  );
  const playSpeech = useCallback(
    (text) =>
      speakUzbek(text, {
        apiBase,
        variant,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      }),
    [apiBase, variant],
  );

  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    if (!enabled || minimized || paused) return undefined;
    const timer = window.setTimeout(() => {
      stopSpeech();
      setSpeaking(false);
      setMinimized(true);
      actionRef.current?.("MINIMIZE", activeStep);
    }, 45_000);
    return () => window.clearTimeout(timer);
  }, [
    activeMessage,
    activeStep?.key,
    activityVersion,
    enabled,
    minimized,
    paused,
  ]);

  useEffect(() => {
    if (!enabled || minimized || paused || !activeStep?.anchor) return undefined;
    const target = document.querySelector(
      `[data-ai-anchor="${activeStep.anchor}"]`,
    );
    if (!target) return undefined;
    target.classList.add("ai-semantic-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    return () => target.classList.remove("ai-semantic-highlight");
  }, [activeStep?.anchor, enabled, minimized, paused]);

  useEffect(() => {
    if (
      !enabled ||
      minimized ||
      paused ||
      !speechEnabled ||
      !activeMessage ||
      lastSpoken.current === activeMessage
    ) {
      return;
    }
    lastSpoken.current = activeMessage;
    playSpeech(activeMessage);
  }, [
    activeMessage,
    enabled,
    minimized,
    paused,
    playSpeech,
    speechEnabled,
  ]);

  useEffect(() => {
    if (enabled && !minimized && !paused && speechEnabled) return;
    stopSpeech();
    setSpeaking(false);
  }, [enabled, minimized, paused, speechEnabled]);

  useEffect(
    () => () => {
      stopSpeech();
    },
    [],
  );

  if (!enabled) {
    return (
      <button
        type="button"
        className="guided-avatar-restore"
        onClick={() => {
          lastSpoken.current = "";
          onEnabledChange?.(true);
        }}
        title="AI yordamchini yoqish"
      >
        <span className={`guided-avatar-face ${variant}`} aria-hidden="true">
          <i className="hair" />
          <i className="eye left" />
          <i className="eye right" />
          <i className="mouth" />
        </span>
        AI
      </button>
    );
  }

  if (minimized) {
    return (
      <button
        type="button"
        className="guided-avatar-minimized"
        onClick={() => {
          setMinimized(false);
          lastSpoken.current = "";
          setActivityVersion((value) => value + 1);
          onAction?.("RESTORE", activeStep);
        }}
        aria-label={`${avatarName} yordamchini ochish`}
      >
        <span className={`guided-avatar-face ${variant}`} aria-hidden="true">
          <i className="hair" />
          <i className="eye left" />
          <i className="eye right" />
          <i className="mouth" />
        </span>
        <span>
          <b>{avatarName}</b>
          <small>Men shu yerdaman</small>
        </span>
      </button>
    );
  }

  const navigate = (direction) => {
    if (!steps.length) return;
    const startingIndex =
      activeIndex >= 0 ? activeIndex : direction > 0 ? -1 : 0;
    const nextIndex = Math.min(
      Math.max(startingIndex + direction, 0),
      Math.max(steps.length - 1, 0),
    );
    const next = steps[nextIndex];
    if (!next || next.key === activeStep?.key) return;
    onNavigate?.(next.key);
    onAction?.(direction > 0 ? "NEXT_STEP" : "PREVIOUS_STEP", next);
  };

  const askQuestion = async () => {
    const clean = question.trim();
    if (clean.length < 3 || clean.length > 240 || !onQuestion) {
      setQuestionError("Savol 3–240 belgi oralig‘ida bo‘lsin.");
      return;
    }
    setQuestionBusy(true);
    setQuestionError("");
    setSuggestion(null);
    try {
      const result = await onQuestion(clean, activeStep);
      const next =
        typeof result === "string" ? { message: result } : result;
      if (!next?.message) {
        throw new Error("Bu savol uchun xavfsiz taklif topilmadi.");
      }
      setSuggestion(next);
      setQuestion("");
      if (speechEnabled) playSpeech(next.message);
      onAction?.("SPEAK", activeStep);
    } catch (error) {
      setQuestionError(
        error?.message || "Savolga hozir javob berib bo‘lmadi.",
      );
    } finally {
      setQuestionBusy(false);
    }
  };

  return (
    <aside
      className={`guided-avatar-panel ${speaking ? "speaking" : ""}`}
      aria-live="polite"
      onPointerDown={() => setActivityVersion((value) => value + 1)}
      onFocusCapture={() => setActivityVersion((value) => value + 1)}
    >
      <div className="guided-avatar-head">
        <div className="guided-avatar-character">
          <span className={`guided-avatar-face ${variant}`} aria-hidden="true">
            <i className="hair" />
            <i className="eye left" />
            <i className="eye right" />
            <i className="mouth" />
          </span>
          <span>
            <b>{avatarName}</b>
            <small>Yo‘lko‘rsatuvchi yordamchi</small>
          </span>
        </div>
        <div className="guided-avatar-actions">
          <button
            type="button"
            onClick={() => {
              const next = !speechEnabled;
              onSpeechChange?.(next);
              if (next) {
                lastSpoken.current = activeMessage;
                playSpeech(activeMessage);
              } else {
                stopSpeech();
                setSpeaking(false);
              }
            }}
            aria-label={speechEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          >
            {speechEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              setSpeaking(false);
              setMinimized(true);
              onAction?.("MINIMIZE", activeStep);
            }}
            aria-label="Burchakka qaytarish"
          >
            <CornerDownRight size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              setSpeaking(false);
              onEnabledChange?.(false);
            }}
            aria-label="Yordamchini o'chirish"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <p className="guided-avatar-message">{activeMessage}</p>
      {onQuestion && (
        <div className="guided-avatar-question">
          <label htmlFor="guided-avatar-question-input">
            <MessageCircle size={13} /> Shu qadam haqida so‘rang
          </label>
          <div>
            <input
              id="guided-avatar-question-input"
              value={question}
              maxLength={240}
              placeholder="Masalan: 2 smenani tanlasam nima bo‘ladi?"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  askQuestion();
                }
              }}
            />
            <button
              type="button"
              disabled={questionBusy || question.trim().length < 3}
              onClick={askQuestion}
              aria-label="Savolni yuborish"
            >
              {questionBusy ? "…" : <Send size={14} />}
            </button>
          </div>
          {questionError && (
            <small className="guided-avatar-question-error">
              {questionError}
            </small>
          )}
          {suggestion && (
            <div className="guided-avatar-suggestion">
              <p>{suggestion.message}</p>
              {suggestion.action && onApplySuggestion && (
                <button
                  type="button"
                  onClick={() => {
                    onApplySuggestion(suggestion.action, activeStep);
                    onAction?.("SET_DRAFT_VALUE", activeStep);
                    setSuggestion(null);
                  }}
                >
                  <Check size={13} />
                  {suggestion.actionLabel || "Qoralamaga qo‘llash"}
                </button>
              )}
              <small>
                Yordamchi faqat ko‘rsatilgan qoralama o‘zgarishini qo‘llaydi;
                saqlash, e’lon qilish va tasdiqlashni o‘zi bajarmaydi.
              </small>
            </div>
          )}
        </div>
      )}
      {activeStep && (
        <div className="guided-avatar-progress">
          <span>
            {activeIndex + 1}/{steps.length}
          </span>
          <div>
            {steps.map((step, index) => (
              <i
                key={step.key}
                className={index <= activeIndex ? "active" : ""}
              />
            ))}
          </div>
        </div>
      )}

      <div className="guided-avatar-controls">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={activeIndex <= 0}
          title="Oldingi qadam"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => {
            setPaused((value) => {
              if (!value) {
                stopSpeech();
                setSpeaking(false);
              }
              if (value) lastSpoken.current = "";
              onAction?.(value ? "RESUME" : "PAUSE", activeStep);
              return !value;
            });
          }}
          className="wide"
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          {paused ? "Davom etish" : "To'xtatish"}
        </button>
        {onUndo && (
          <button
            type="button"
            onClick={() => {
              onUndo();
              onAction?.("UNDO", activeStep);
            }}
            title="Oxirgi avatar qadamini qaytarish"
          >
            <RotateCcw size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={!steps.length || activeIndex >= steps.length - 1}
          title="Keyingi qadam"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </aside>
  );
}
