import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { recordingClock, recordingGesture, mediaKind, recordingMime, extensionForMime } from "./kabutarMediaRules.js";
import "./kabutar-media.css";

function useObjectURL(file) {
  const [url, setURL] = useState("");
  useEffect(() => { if (!file) { setURL(""); return; } const next = URL.createObjectURL(file); setURL(next); return () => URL.revokeObjectURL(next); }, [file]);
  return url;
}
function Preview({ draft, caption, setCaption, busy, onSend, onClose }) {
  const url = useObjectURL(draft.file);
  return createPortal(<div className="kb-media-overlay" role="dialog" aria-modal="true" aria-label="Yuborishdan oldin ko‘rish" onKeyDown={e => { if (e.key === "Escape" && !busy) onClose(); }}>
    <div className="kb-media-preview"><header><strong>{draft.kind === "photo" ? "Rasm yuborish" : draft.kind === "audio" ? "Ovozni eshitib ko‘ring" : draft.kind.startsWith("video") ? "Videoni ko‘rib oling" : "Fayl yuborish"}</strong><button type="button" disabled={busy} onClick={onClose} aria-label="Bekor qilish">✕</button></header>
      {draft.kind === "photo" ? <img src={url} alt="Yuboriladigan rasm" /> : draft.kind === "audio" ? <audio src={url} controls /> : draft.kind.startsWith("video") ? <video src={url} controls playsInline className={draft.kind === "video_doira" ? "kb-round-video" : ""} /> : <div className="kb-document-preview">📄 {draft.file.name}</div>}
      <small>{draft.file.name} · {(draft.file.size / 1024 / 1024).toFixed(1)} MB</small>
      <textarea autoFocus disabled={busy} maxLength={4000} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Tagiga izoh yozing…" aria-label="Media izohi" />
      {draft.error && <p role="alert">{draft.error}</p>}
      <footer><button type="button" disabled={busy} onClick={onClose}>Bekor qilish</button><button type="button" disabled={busy} className="kb-media-send" onClick={onSend}>{busy ? "Yuborilmoqda…" : "Yuborish ➤"}</button></footer>
    </div>
  </div>, document.body);
}

export default function KabutarMediaComposer({ disabled = false, onSend, onBusyChange }) {
  const [stage, setStage] = useState("idle");
  const [kind, setKind] = useState("audio");
  const [locked, setLocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState(null);
  const input = useRef(null), liveVideo = useRef(null), session = useRef(null), gesture = useRef(null), alive = useRef(true), uploadGate = useRef(false);
  const busyCallback = useRef(onBusyChange); busyCallback.current = onBusyChange;
  const active = stage === "acquiring" || stage === "recording" || stage === "stopping";

  function release(s) {
    clearInterval(s?.timer); cancelAnimationFrame(s?.frame || 0);
    s?.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    s?.context?.close().catch(() => {});
  }
  function discard() {
    const s = session.current; session.current = null; gesture.current = null;
    if (s) { s.discarded = true; try { if (s.recorder?.state !== "inactive") s.recorder?.stop(); } catch {} release(s); }
    if (alive.current) { setStream(null); setStage("idle"); setLocked(false); setElapsed(0); setLevel(0); }
  }
  useEffect(() => { alive.current = true; return () => { alive.current = false; discard(); busyCallback.current?.(false); }; }, []);
  useEffect(() => { busyCallback.current?.(active || Boolean(draft) || uploading); }, [active, draft, uploading]);
  useEffect(() => { if (liveVideo.current) { liveVideo.current.srcObject = stream; liveVideo.current.play().catch(() => {}); } }, [stream, kind]);
  useEffect(() => {
    if (!active) return;
    const warn = e => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  function stop() {
    const s = session.current; if (!s?.recorder || s.recorder.state !== "recording") return;
    setStage("stopping"); s.recorder.stop();
  }
  async function start(nextKind) {
    if (disabled || session.current || draft || uploadGate.current) return;
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("Bu brauzerda yozish ochilmadi. HTTPS orqali Chrome yoki Safari’da oching."); return; }
    const s = { chunks: [], size: 0, discarded: false, locked: false }; session.current = s;
    setKind(nextKind); setStage("acquiring"); setLocked(false); setElapsed(0);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, ...(nextKind === "video_doira" ? { video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } } } : {}) });
      s.stream = media;
      if (session.current !== s || !alive.current) { release(s); return; }
      const mime = recordingMime(nextKind, MediaRecorder);
      const recorder = new MediaRecorder(media, mime ? { mimeType: mime } : undefined); s.recorder = recorder;
      s.started = performance.now();
      recorder.ondataavailable = e => { if (s.discarded || !e.data.size) return; s.chunks.push(e.data); s.size += e.data.size; if (s.size > (nextKind === "audio" ? 14 : 38) * 1024 * 1024 && recorder.state === "recording") stop(); };
      recorder.onerror = () => { if (session.current === s) { discard(); setError("Yozuv uzildi. Mikrofon yoki kamerani qayta oching."); } };
      recorder.onstop = () => {
        release(s);
        if (s.discarded || session.current !== s || !alive.current) return;
        session.current = null; gesture.current = null; setStage("idle"); setStream(null); setLocked(false); setLevel(0);
        const type = recorder.mimeType || s.chunks[0]?.type || mime;
        const blob = new Blob(s.chunks, { type });
        if (!blob.size) { setError("Yozuv bo‘sh chiqdi. Qayta yozib ko‘ring."); return; }
        const file = new File([blob], `${nextKind === "audio" ? "ovoz" : "video-xabar"}.${extensionForMime(type)}`, { type });
        setCaption(""); setDraft({ file, kind: nextKind });
      };
      recorder.start(200); setStream(media); setStage("recording");
      if (!gesture.current || gesture.current.released) { s.locked = true; setLocked(true); }
      s.timer = setInterval(() => { if (session.current === s) setElapsed(performance.now() - s.started); }, 100);
      media.getTracks().forEach(track => { track.onended = () => { if (session.current === s) stop(); }; });
      // The meter reflects microphone amplitude, not a decorative animation.
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (Context) {
          const context = new Context(); s.context = context; context.resume().catch(() => {});
          const analyser = context.createAnalyser(); analyser.fftSize = 256;
          context.createMediaStreamSource(media).connect(analyser);
          const samples = new Uint8Array(analyser.fftSize);
          const tick = () => {
            if (session.current !== s || s.discarded) return;
            analyser.getByteTimeDomainData(samples); let sum = 0;
            for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
            setLevel(Math.min(1, Math.sqrt(sum / samples.length) * 5)); s.frame = requestAnimationFrame(tick);
          }; tick();
        }
      } catch { /* Recording still works if a volume meter is unavailable. */ }
    } catch (e) {
      release(s); if (session.current !== s || !alive.current) return;
      session.current = null; gesture.current = null; setStage("idle"); setStream(null);
      setError(e.name === "NotAllowedError" ? "Mikrofon/kamera ruxsati berilmadi. Brauzer ruxsatini yoqing." : "Mikrofon/kamera ochilmadi. Boshqa ilova ishlatayotganini tekshiring.");
    }
  }
  function press(e, nextKind) {
    if (e.button !== 0 || disabled || session.current || draft) return;
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { x: e.clientX, y: e.clientY, id: e.pointerId, at: performance.now(), released: false };
    start(nextKind);
  }
  function move(e) {
    const g = gesture.current, s = session.current; if (!g || g.id !== e.pointerId || !s || s.locked) return;
    const action = recordingGesture(g, { x: e.clientX, y: e.clientY });
    if (action === "cancel") discard();
    if (action === "lock") { s.locked = true; setLocked(true); }
  }
  function lift(e) {
    const g = gesture.current, s = session.current; if (!g || g.id !== e.pointerId || !s) return;
    g.released = true;
    if (s.locked) return;
    if (!s.recorder || performance.now() - g.at < 350) { s.locked = true; setLocked(true); }
    else stop();
  }
  function pick(e) {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    const type = mediaKind(file); const limit = type === "video" ? 40 : 15;
    if (file.size > limit * 1024 * 1024) { setError(`Fayl ${limit} MB dan katta.`); return; }
    if (type === "photo" && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Rasmni JPG, PNG yoki WebP shaklida tanlang."); return; }
    setError(""); setCaption(""); setDraft({ file, kind: type });
  }
  async function submit() {
    if (!draft || uploadGate.current) return;
    uploadGate.current = true; setUploading(true);
    try {
      const ok = await onSend({ file: draft.file, fileKind: ["photo", "document"].includes(draft.kind) ? "hujjat" : draft.kind, caption });
      if (!alive.current) return;
      if (ok) { setDraft(null); setCaption(""); }
      else setDraft(old => old && ({ ...old, error: "Yuborilmadi. Xato sababini suhbatda tekshiring; fayl shu oynada saqlanib turibdi." }));
    } catch { if (alive.current) setDraft(old => old && ({ ...old, error: "Yuborishda xato. Qayta urinishingiz mumkin." })); }
    finally { uploadGate.current = false; if (alive.current) setUploading(false); }
  }
  return <div className="kb-media-tools">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,audio/*,video/*,.pdf,.docx,.xlsx" onChange={pick} hidden />
    <div className="kb-media-buttons">
      <button type="button" disabled={disabled || active || Boolean(draft)} onClick={() => input.current?.click()} aria-label="Rasm yoki fayl tanlash">📎</button>
      {[['audio','🎙','Ovoz yozish'],['video_doira','◉','Video yozish']].map(([type,icon,label]) => <button key={type} type="button" className={`kb-record-button ${active && kind === type ? 'is-recording' : ''}`} disabled={disabled || Boolean(draft) || (active && kind !== type)} aria-label={label} aria-pressed={active && kind === type} title="Bosib yozing; tepaga torting — qulflash" onPointerDown={e => press(e,type)} onPointerMove={move} onPointerUp={lift} onPointerCancel={() => { if (!session.current?.locked) discard(); }} onContextMenu={e => e.preventDefault()} onClick={e => { if (e.detail === 0 && !active) start(type); }}>{icon}</button>)}
    </div>
    {active && <div className="kb-record-status">
      <div className="kb-record-heading"><span className="kb-record-dot" /><strong>{stage === "acquiring" ? "Ruxsat kutilmoqda…" : stage === "stopping" ? "Yozuv tayyorlanmoqda…" : kind === "audio" ? "Ovoz yozilmoqda" : "Video yozilmoqda"}</strong><time>{recordingClock(elapsed)}</time></div>
      {kind === "video_doira" && <video ref={liveVideo} muted autoPlay playsInline className="kb-live-video" />}
      <div className="kb-volume" aria-label="Mikrofon ovoz darajasi"><span style={{ width: `${Math.round(level * 100)}%` }} /></div>
      <p>{locked ? "🔒 Yozuv qulflangan — qo‘lingizni olishingiz mumkin" : "↑ Tepaga torting — qulflash · ← Chapga torting — bekor qilish"}</p>
      <div className="kb-record-actions"><button type="button" onClick={discard}>Bekor qilish</button>{!locked && stage === "recording" && <button type="button" onClick={() => { session.current.locked = true; setLocked(true); }}>🔒 Qulflash</button>}<button type="button" disabled={stage !== "recording"} onClick={stop}>■ To‘xtatib ko‘rish</button></div>
    </div>}
    {error && <p className="kb-media-error" role="alert">{error}</p>}
    {draft && <Preview draft={draft} caption={caption} setCaption={setCaption} busy={uploading} onSend={submit} onClose={() => { setDraft(null); setCaption(""); }} />}
  </div>;
}
