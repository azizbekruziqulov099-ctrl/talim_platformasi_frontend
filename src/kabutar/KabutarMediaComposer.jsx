import { useInterface } from "../interface/InterfacePreferences.jsx";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Paperclip, Mic, Video } from "lucide-react";
import { recordingClock, recordingGesture, mediaKind, recordingMime, extensionForMime } from "./kabutarMediaRules.js";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";
import "./kabutar-media.css";

// One microphone/camera owner even when more than one Kabutar panel is mounted.
let recorderOwner = null;
let composerSequence = 0;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const SEND_CANCELLED = "Yuborish to‘xtatildi. Qayta yuborishdan oldin suhbatni tekshiring.";

function useObjectURL(file) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (!file) { setValue(null); return undefined; }
    const url = URL.createObjectURL(file);
    setValue({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return value?.file === file ? value.url : "";
}

function Preview({ draft, caption, setCaption, busy, onSend, onClose, onCancelUpload, conversationLabel }) {
  const { t } = useInterface();
  const url = useObjectURL(draft.file);
  const box = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault(); event.stopPropagation();
      if (busy) onCancelUpload(); else onClose();
    }
    if (event.key === "Tab") {
      const controls = [...(box.current?.querySelectorAll('button:not(:disabled),textarea:not(:disabled),video[controls],audio[controls],[tabindex="0"]') || [])];
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === box.current)) { event.preventDefault(); first.focus(); }
    }
  }
  return createPortal(
    <div className="kb-media-overlay" onKeyDown={onKeyDown}>
      <div ref={box} tabIndex={-1} className="kb-media-preview" role="dialog" aria-modal="true" aria-label={t("Yuborishdan oldin ko‘rish")} aria-busy={busy}>
        <header><strong>{draft.kind === "photo" ? t("Rasm yuborish") : draft.kind === "audio" ? t("Ovozni eshitib ko‘ring") : draft.kind.startsWith("video") ? t("Videoni ko‘rib oling") : t("Fayl yuborish")}</strong><button type="button" disabled={busy} onClick={onClose} aria-label={t("Bekor qilish")}>✕</button></header>
        {conversationLabel && <p className="kb-media-recipient">{t("Kimga:")}<strong>{conversationLabel}</strong></p>}
        {draft.kind === "photo" ? <img src={url || undefined} alt={t("Yuboriladigan rasm")} /> : draft.kind === "audio" ? <audio src={url || undefined} controls /> : draft.kind.startsWith("video") ? <video src={url || undefined} controls playsInline className={draft.kind === "video_doira" ? "kb-round-video" : ""} /> : <div className="kb-document-preview">📄 {draft.file.name}</div>}
        <small>{draft.file.name} · {(draft.file.size / 1024 / 1024).toFixed(1)} MB</small>
        <textarea disabled={busy} maxLength={4000} value={caption} onChange={e => setCaption(e.target.value)} placeholder={t("Tagiga izoh yozing…")} aria-label={t("Media izohi")} />
        {draft.error && <p role="alert">{draft.error}</p>}
        <footer><button type="button" onClick={busy ? onCancelUpload : onClose}>{busy ? t("Yuborishni to‘xtatish") : t("Bekor qilish")}</button><button type="button" disabled={busy} className="kb-media-send" onClick={onSend}>{busy ? t("Yuborilmoqda…") : t("Yuborish ➤")}</button></footer>
      </div>
    </div>, document.body
  );
}

/**
 * Key this component by conversationKey. onSend receives a captured key and an
 * AbortSignal and must never retarget that payload to a subsequently opened chat.
 * Resolves true only after the server confirms acceptance; false retains draft.
 */
export default function KabutarMediaComposer({ disabled = false, conversationKey, conversationLabel = "", onSend, onBusyChange }) {
  const { t } = useInterface();
  const [stage, setStage] = useState("idle");
  const [kind, setKind] = useState("audio");
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState(null);
  const input = useRef(null), liveVideo = useRef(null), session = useRef(null), gesture = useRef(null), alive = useRef(false), upload = useRef(null);
  const scope = useRef(conversationKey); scope.current = conversationKey;
  const draftRef = useRef(draft); draftRef.current = draft;
  const busyCallback = useRef(onBusyChange); busyCallback.current = onBusyChange;
  const instance = useRef(null);
  if (instance.current === null) instance.current = ++composerSequence;
  const active = stage === "acquiring" || stage === "recording" || stage === "stopping";
  const unavailable = disabled || conversationKey === undefined || conversationKey === null || conversationKey === "";

  function release(s) {
    if (!s) return;
    clearInterval(s.timer); clearInterval(s.meterTimer); clearTimeout(s.stopTimeout);
    if (s.frame) cancelAnimationFrame(s.frame);
    s.frame = null; s.timer = null; s.meterTimer = null; s.stopTimeout = null;
    try { s.source?.disconnect(); } catch { /* The audio graph may already be disconnected. */ } s.source = null;
    if (s.context) { try { Promise.resolve(s.context.close()).catch(() => {}); } catch { /* Already closed. */ } s.context = null; }
    s.stream?.getTracks().forEach(track => { track.onended = null; try { if (track.readyState !== "ended") track.stop(); } catch { /* Continue releasing the other tracks. */ } });
  }
  function discard() {
    const s = session.current;
    session.current = null; gesture.current = null;
    if (s) {
      s.discarded = true;
      if (recorderOwner === s) recorderOwner = null;
      try { if (s.recorder && s.recorder.state !== "inactive") s.recorder.stop(); } catch { /* Tracks are always released below. */ }
      release(s);
    }
    if (alive.current) { setStream(null); setStage("idle"); setLocked(false); setElapsed(0); setLevel(0); }
  }
  function cancelUpload() { upload.current?.controller.abort(); }
  function closeDraft() { if (!upload.current) { setDraft(null); setCaption(""); setNotice(""); } }

  useEffect(() => {
    alive.current = true;
    const leaving = () => { discard(); cancelUpload(); };
    window.addEventListener("pagehide", leaving);
    return () => {
      alive.current = false; discard(); cancelUpload();
      window.removeEventListener("pagehide", leaving);
      busyCallback.current?.(false);
    };
  }, []);
  // Also protects integrations that change the prop without providing React key.
  useEffect(() => {
    discard(); cancelUpload(); setDraft(null); setCaption(""); setError(""); setNotice("");
  }, [conversationKey]);
  useEffect(() => { busyCallback.current?.(active || Boolean(draft) || uploading); }, [active, draft, uploading]);
  useEffect(() => {
    const video = liveVideo.current;
    if (!video) return undefined;
    video.srcObject = stream;
    if (stream) video.play().catch(() => {});
    return () => { video.pause(); video.srcObject = null; };
  }, [stream, kind]);
  useEffect(() => {
    if (!active && !draft && !uploading) return undefined;
    const warn = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    const removeBack = registerPhoneBackHandler(`kabutar-media-${instance.current}`, () => {
      if (upload.current) cancelUpload();
      else if (session.current?.recorder?.state === "recording") stop();
      else if (session.current) discard();
      else closeDraft();
      return true;
    }, 500);
    return () => { window.removeEventListener("beforeunload", warn); removeBack(); };
  }, [active, draft, uploading]);

  function stop(expected = session.current) {
    const s = session.current;
    if (!s || s !== expected || !s.recorder || s.recorder.state !== "recording" || s.stopping) return;
    s.stopping = true;
    setElapsed(performance.now() - s.started); setStage("stopping");
    try { s.recorder.stop(); }
    catch { discard(); setError("Yozuvni yakunlab bo‘lmadi. Qayta yozib ko‘ring."); return; }
    // The final data event may be asynchronous. Stop capture immediately anyway.
    release(s);
    if (session.current === s) s.stopTimeout = setTimeout(() => {
      if (session.current !== s) return;
      discard(); setError("Yozuv yakunlanmadi. Mikrofon o‘chirildi; qayta yozib ko‘ring.");
    }, 8000);
  }

  async function start(nextKind) {
    if (unavailable || session.current || draftRef.current || upload.current) return;
    if (recorderOwner) { setError("Boshqa Kabutar oynasida yozuv ketmoqda. Avval uni to‘xtating."); return; }
    setError(""); setNotice("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("Bu brauzerda yozish ochilmadi. Saytni HTTPS orqali Chrome yoki Safari’da oching."); return; }
    const s = { chunks: [], size: 0, discarded: false, locked: false, key: conversationKey, limit: (nextKind === "audio" ? 15 : 40) * 1024 * 1024 };
    session.current = s; recorderOwner = s;
    setKind(nextKind); setStage("acquiring"); setLocked(false); setElapsed(0); setLevel(0);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, ...(nextKind === "video_doira" ? { video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } } } : {}) });
      s.stream = media;
      if (session.current !== s || !alive.current || scope.current !== s.key || s.discarded) { release(s); return; }
      const mime = recordingMime(nextKind, MediaRecorder);
      const recorder = new MediaRecorder(media, { ...(mime ? { mimeType: mime } : {}), ...(nextKind === "video_doira" ? { videoBitsPerSecond: 1000000 } : {}) });
      s.recorder = recorder;
      recorder.ondataavailable = event => {
        if (s.discarded || !event.data?.size) return;
        s.chunks.push(event.data); s.size += event.data.size;
        if (s.size > s.limit * 0.9 && session.current === s && recorder.state === "recording") {
          setNotice("Fayl hajmi chegarasiga yetdi. Yozuv to‘xtatildi; yuborishdan oldin tekshiring."); stop(s);
        }
      };
      recorder.onerror = () => {
        if (session.current !== s || !alive.current) { release(s); return; }
        discard(); setError("Yozuv uzildi. Mikrofon yoki kamerani qayta oching.");
      };
      recorder.onstop = () => {
        release(s);
        if (recorderOwner === s) recorderOwner = null;
        if (s.discarded || session.current !== s || !alive.current || scope.current !== s.key) return;
        session.current = null; gesture.current = null;
        setStage("idle"); setStream(null); setLocked(false); setLevel(0);
        const type = recorder.mimeType || s.chunks[0]?.type || mime;
        const blob = new Blob(s.chunks, { type }); s.chunks = [];
        if (!blob.size) { setError("Yozuv bo‘sh chiqdi. Qayta yozib ko‘ring."); return; }
        if (blob.size > s.limit) { setError("Yozuv fayli hajmi chegaradan oshdi. Qisqaroq yozib ko‘ring."); return; }
        const file = new File([blob], `${nextKind === "audio" ? "ovoz" : "video-xabar"}.${extensionForMime(type)}`, { type });
        setCaption(""); setDraft({ file, kind: nextKind, key: s.key });
      };
      s.started = performance.now(); recorder.start(250); setStream(media); setStage("recording");
      if (s.locked || !gesture.current || gesture.current.released) { s.locked = true; setLocked(true); }
      s.timer = setInterval(() => {
        if (session.current !== s || s.stopping) return;
        const duration = performance.now() - s.started; setElapsed(Math.floor(duration / 1000) * 1000);
        if (duration >= (nextKind === "audio" ? 15 : 3) * 60 * 1000) {
          setNotice("Yozuvning vaqt chegarasi tugadi. Yuborishdan oldin tekshiring."); stop(s);
        }
      }, 250);
      media.getTracks().forEach(track => { track.onended = () => { if (session.current === s) stop(s); }; });
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (Context) {
          const context = new Context(); s.context = context; context.resume().catch(() => {});
          const analyser = context.createAnalyser(); analyser.fftSize = 256;
          s.source = context.createMediaStreamSource(media); s.source.connect(analyser);
          const samples = new Uint8Array(analyser.fftSize);
          const tick = () => {
            if (session.current !== s || s.discarded || s.stopping) return;
            analyser.getByteTimeDomainData(samples); let sum = 0;
            for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
            setLevel(Math.min(1, Math.round(Math.sqrt(sum / samples.length) * 100) / 20));
          };
          s.meterTimer = setInterval(tick, 120);
        }
      } catch { /* Recording remains available when a level meter is unavailable. */ }
    } catch (failure) {
      release(s); if (recorderOwner === s) recorderOwner = null;
      if (session.current !== s || !alive.current || scope.current !== s.key) return;
      session.current = null; gesture.current = null; setStage("idle"); setStream(null);
      setError(failure.name === "NotAllowedError" ? "Mikrofon/kamera ruxsati berilmadi. Brauzer ruxsatini yoqing." : "Mikrofon/kamera ochilmadi. Boshqa ilova ishlatayotganini tekshiring.");
    }
  }
  function press(event, nextKind) {
    if (event.button !== 0 || event.isPrimary === false || unavailable || session.current || draftRef.current || upload.current) return;
    event.preventDefault();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Keyboard and older pointer implementations use stop button. */ }
    gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId, at: performance.now(), released: false };
    start(nextKind);
  }
  function move(event) {
    const g = gesture.current, s = session.current;
    if (!g || g.id !== event.pointerId || !s || s.locked || s.stopping) return;
    const action = recordingGesture(g, { x: event.clientX, y: event.clientY });
    if (action === "cancel") discard();
    if (action === "lock") { s.locked = true; setLocked(true); }
  }
  function lift(event) {
    const g = gesture.current, s = session.current;
    if (!g || g.id !== event.pointerId || !s) return;
    g.released = true;
    if (s.locked) return;
    if (!s.recorder || performance.now() - g.at < 350) { s.locked = true; setLocked(true); }
    else stop(s);
  }
  function pointerLost() { if (gesture.current && !gesture.current.released && !session.current?.locked) discard(); }
  function pick(event) {
    let file = event.target.files?.[0]; event.target.value = "";
    if (!file || unavailable || session.current || draftRef.current || upload.current) return;
    const type = mediaKind(file), limit = type === "video" ? 40 : 15;
    if (!file.size) { setError("Tanlangan fayl bo‘sh."); return; }
    if (file.size > limit * 1024 * 1024) { setError(`Fayl ${limit} MB dan katta.`); return; }
    if (type === "photo") {
      // Some Android pickers omit MIME. Preserve the real filename and set the
      // known raster MIME so backend validation and inline preview agree.
      if (!file.type) {
        const ext = file.name.split(".").pop().toLowerCase();
        const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        file = new File([file], file.name, { type: mime, lastModified: file.lastModified });
      }
      if (!PHOTO_TYPES.has(file.type.toLowerCase())) { setError("Rasmni JPG, PNG yoki WebP shaklida tanlang."); return; }
    }
    setError(""); setNotice(""); setCaption(""); setDraft({ file, kind: type, key: conversationKey });
  }
  async function submit() {
    const selected = draftRef.current;
    if (!selected || upload.current || unavailable || selected.key !== scope.current || typeof onSend !== "function") return;
    const operation = { controller: new AbortController(), key: selected.key };
    upload.current = operation; setUploading(true);
    setDraft(previous => previous === selected ? { ...previous, error: "" } : previous);
    try {
      const ok = await onSend({ file: selected.file, fileKind: ["photo", "document"].includes(selected.kind) ? "hujjat" : selected.kind, caption: caption.trim(), conversationKey: selected.key, signal: operation.controller.signal });
      if (!alive.current || scope.current !== selected.key || upload.current !== operation) return;
      if (operation.controller.signal.aborted) setDraft(previous => previous && ({ ...previous, error: SEND_CANCELLED }));
      else if (ok === true) { setDraft(null); setCaption(""); setNotice(""); }
      else setDraft(previous => previous && ({ ...previous, error: "Yuborish tasdiqlanmadi. Suhbatni tekshiring; fayl shu oynada saqlanib turibdi." }));
    } catch {
      if (alive.current && scope.current === selected.key && upload.current === operation) setDraft(previous => previous && ({ ...previous, error: operation.controller.signal.aborted ? SEND_CANCELLED : "Yuborishda xato. Qayta yuborishdan oldin suhbatni tekshiring." }));
    } finally {
      if (upload.current === operation) { upload.current = null; if (alive.current) setUploading(false); }
    }
  }

  return <div className="kb-media-tools">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,audio/*,video/*,.pdf,.docx,.xlsx" onChange={pick} hidden />
    <div className="kb-media-buttons">
      <button type="button" disabled={unavailable || active || Boolean(draft) || uploading} onClick={() => input.current?.click()} aria-label={t("Rasm yoki fayl tanlash")} title={t("Rasm yoki fayl tanlash")}><Paperclip size={21}/></button>
      {[["audio", <Mic size={21}/>, "Ovoz yozish"], ["video_doira", <Video size={21}/>, "Video yozish"]].map(([type, icon, label]) => <button key={type} type="button" className={`kb-record-button ${active && kind === type ? "is-recording" : ""}`} disabled={unavailable || Boolean(draft) || uploading || (active && kind !== type)} aria-label={label} aria-pressed={active && kind === type} title={`${label}: bir bosing — yozish; bosib ushlab tepaga torting — qulflash`} onPointerDown={event => press(event, type)} onPointerMove={move} onPointerUp={lift} onPointerCancel={pointerLost} onLostPointerCapture={pointerLost} onContextMenu={event => event.preventDefault()} onClick={event => { if (event.detail === 0 && !active) start(type); }}>{icon}</button>)}
      {!active && <span className="kb-media-hint">{t("Rasm, ovoz yoki video xabar")}</span>}
    </div>
    {active && <div className="kb-record-status">
      <div className="kb-record-heading"><span className="kb-record-dot" /><strong role="status">{stage === "acquiring" ? t("Ruxsat kutilmoqda…") : stage === "stopping" ? t("Yozuv tayyorlanmoqda…") : kind === "audio" ? t("Ovoz yozilmoqda") : t("Video yozilmoqda")}</strong><time aria-label={t("Yozuv davomiyligi")}>{recordingClock(elapsed)}</time></div>
      {kind === "video_doira" && <video ref={liveVideo} muted autoPlay playsInline className="kb-live-video" />}
      <div className="kb-volume" role="meter" aria-label={t("Mikrofon ovoz darajasi")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}><span style={{ width: `${Math.round(level * 100)}%` }} /></div>
      <p>{locked ? t("🔒 Yozuv qulflangan — qo‘lingizni olishingiz mumkin") : t("↑ Tepaga torting — qulflash · ← Chapga torting — bekor qilish")}</p>
      <small>{kind === "audio" ? t("Ovoz: 15 daqiqagacha") : t("Video: 3 daqiqagacha")}</small>
      <div className="kb-record-actions"><button type="button" onClick={discard}>{t("Bekor qilish")}</button>{!locked && stage === "recording" && <button type="button" onClick={() => { if (session.current) { session.current.locked = true; setLocked(true); } }}>{t("🔒 Qulflash")}</button>}<button type="button" disabled={stage !== "recording"} onClick={() => stop()}>{t("■ To‘xtatib ko‘rish")}</button></div>
    </div>}
    {notice && <p className="kb-media-notice" role="status">{notice}</p>}
    {error && <p className="kb-media-error" role="alert">{error}</p>}
    {draft && draft.key === conversationKey && <Preview draft={draft} caption={caption} setCaption={setCaption} busy={uploading} onSend={submit} onClose={closeDraft} onCancelUpload={cancelUpload} conversationLabel={conversationLabel} />}
  </div>;
}
