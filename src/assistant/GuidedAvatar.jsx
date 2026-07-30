import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CornerDownRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

function speakUzbek(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
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
  window.speechSynthesis.speak(utterance);
}

export default function GuidedAvatar({
  enabled = true,
  variant = "female",
  speechEnabled = true,
  steps = [],
  activeKey,
  message,
  onNavigate,
  onAction,
  onUndo,
  onSpeechChange,
  onEnabledChange,
}) {
  const [minimized, setMinimized] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activityVersion, setActivityVersion] = useState(0);
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

  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    if (!enabled || minimized || paused) return undefined;
    const timer = window.setTimeout(() => {
      window.speechSynthesis?.cancel();
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
    speakUzbek(activeMessage);
  }, [activeMessage, enabled, minimized, paused, speechEnabled]);

  if (!enabled) {
    return (
      <button
        type="button"
        className="guided-avatar-restore"
        onClick={() => onEnabledChange?.(true)}
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

  return (
    <aside
      className="guided-avatar-panel"
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
            <small>AI yo‘lko‘rsatuvchi</small>
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
                speakUzbek(activeMessage);
              } else {
                window.speechSynthesis?.cancel();
              }
            }}
            aria-label={speechEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          >
            {speechEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
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
              window.speechSynthesis?.cancel();
              onEnabledChange?.(false);
            }}
            aria-label="Yordamchini o'chirish"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <p className="guided-avatar-message">{activeMessage}</p>
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
              if (!value) window.speechSynthesis?.cancel();
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
