import { useInterface } from "../interface/InterfacePreferences.jsx";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerPhoneBackHandler } from "../pwa/samtmPwa.js";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, X, Volume2 } from "lucide-react";
import "./kabutarCalls.css";

const label = {
  checking: "Aloqa tekshirilmoqda…", calling: "Javob kutilmoqda…",
  incoming: "Sizga qo‘ng‘iroq qilmoqda", connecting: "Ulanmoqda…",
  connected: "Aloqa o‘rnatildi", ended: "Qo‘ng‘iroq tugadi", error: "Ulanib bo‘lmadi",
};
const key = () => globalThis.crypto?.randomUUID?.() || `call_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const stopStream = (stream) => stream?.getTracks?.().forEach((track) => track.stop());
const elapsedLabel = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// One dialog owns one connection. Incoming notifications belong to the foreground
// Kabutar panel; no background socket, polling loop or media engine is duplicated.
export default function KabutarCallDialog({ apiBase, token, peer, mode = "audio", callId = null, onClose }) {
  const { t } = useInterface();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [name, setName] = useState(peer?.name || "Suhbatdosh");
  const [kind, setKind] = useState(mode);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [needsPlay, setNeedsPlay] = useState(false);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const actions = useRef({});
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const peerId = Number(peer?.id || 0);

  useEffect(() => {
    const s = { alive: true, id: callId, pc: null, local: null, remote: null,
      controllers: new Set(), timers: new Set(), queued: [], remoteQueue: [],
      cursor: 0, sending: false, signalReady: false, answered: false, accepting: false,
      remoteApplied: false, row: null, config: null, closed: false, connectedAt: 0,
      connectingAt: 0, startedAt: Date.now(), count: 0, failures: 0 };
    setStatus("checking"); setMessage(""); setName(peer?.name || "Suhbatdosh"); setKind(mode);
    setMuted(false); setCameraOff(false); setSeconds(0); setNeedsPlay(false);
    const base = String(apiBase || "").replace(/\/$/, "");
    const later = (callback, delay) => {
      const timer = setTimeout(() => { s.timers.delete(timer); if (s.alive && !s.closed) callback(); }, delay);
      s.timers.add(timer); return timer;
    };
    const request = async (path, body) => {
      if (!s.alive || s.closed) throw new Error("Qo‘ng‘iroq yopilgan");
      const controller = new AbortController(); s.controllers.add(controller);
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`${base}/api/kabutar/calls${path}`, {
          method: body ? "POST" : "GET", signal: controller.signal, cache: "no-store",
          headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        let value; try { value = await response.json(); } catch { value = {}; }
        if (!response.ok) {
          const error = new Error(typeof value.detail === "string" ? value.detail : `Aloqa xatosi (${response.status})`);
          error.status = response.status; throw error;
        }
        if (!s.alive || s.closed) throw new Error("Qo‘ng‘iroq yopilgan");
        return value;
      } finally { clearTimeout(timeout); s.controllers.delete(controller); }
    };
    const notifyEnd = (action = "hangup") => {
      if (!s.id || !token) return;
      // Best effort after tab dismissal. Server also expires stale sessions.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      fetch(`${base}/api/kabutar/calls/${encodeURIComponent(s.id)}/signal`, {
        method: "POST", keepalive: true, cache: "no-store", signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }).catch(() => {}).finally(() => clearTimeout(timeout));
    };
    const shutdown = () => {
      s.closed = true;
      s.timers.forEach(clearTimeout); s.timers.clear();
      s.controllers.forEach((controller) => controller.abort()); s.controllers.clear();
      if (s.pc) { s.pc.onicecandidate = null; s.pc.ontrack = null; s.pc.onconnectionstatechange = null; s.pc.close(); }
      stopStream(s.local); stopStream(s.remote);
      s.queued.length = 0; s.remoteQueue.length = 0;
      if (localRef.current) localRef.current.srcObject = null;
      if (remoteRef.current) remoteRef.current.srcObject = null;
    };
    const failure = (error) => {
      if (!s.alive || s.closed) return;
      notifyEnd(); shutdown(); setStatus("error");
      const permission = ["NotAllowedError", "PermissionDeniedError"].includes(error?.name);
      setMessage(permission ? "Mikrofon yoki kameraga ruxsat berilmadi. Brauzer ruxsatlarini tekshirib, qayta qo‘ng‘iroq qiling."
        : error?.name === "NotFoundError" ? "Mikrofon yoki kamera topilmadi. Qurilmani tekshiring."
          : error?.name === "AbortError" ? "Server vaqtida javob bermadi. Qayta qo‘ng‘iroq qilib ko‘ring."
            : error?.message || "Aloqa uzildi. Internetni tekshirib, qayta urinib ko‘ring.");
    };
    const playRemote = async () => {
      try { await remoteRef.current?.play(); if (s.alive) setNeedsPlay(false); }
      catch { if (s.alive) setNeedsPlay(true); }
    };
    const flush = async () => {
      if (s.sending || !s.signalReady || !s.id || s.closed) return;
      s.sending = true;
      try {
        while (s.queued.length && s.alive && !s.closed) {
          await request(`/${s.id}/signal`, { action: "ice", ...s.queued[0] });
          s.queued.shift();
        }
      } catch (error) { failure(error); }
      finally { s.sending = false; }
    };
    const drainRemote = async () => {
      if (!s.pc || !s.remoteApplied || s.closed) return;
      while (s.remoteQueue.length && s.alive && !s.closed) {
        await s.pc.addIceCandidate(s.remoteQueue.shift());
      }
    };
    const setupPeer = async (callMode) => {
      if (!globalThis.isSecureContext || !navigator.mediaDevices?.getUserMedia || !globalThis.RTCPeerConnection) {
        throw new Error("Qo‘ng‘iroq uchun HTTPS va mikrofonni qo‘llaydigan yangilangan brauzer kerak.");
      }
      const pc = new RTCPeerConnection({ iceServers: s.config.iceServers, iceTransportPolicy: "relay" });
      s.pc = pc;
      let acquisitionExpired = false;
      const acquire = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true },
        video: callMode === "video" ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 20, max: 24 } } : false });
      const timeout = new Promise((_, reject) => later(() => { acquisitionExpired = true; reject(new Error("Mikrofon/kamera ruxsati kutish vaqti tugadi. Qayta urinib ko‘ring.")); }, 20000));
      // getUserMedia cannot be aborted; stop any late stream immediately.
      acquire.then((stream) => { if (!s.alive || s.closed || acquisitionExpired) stopStream(stream); }).catch(() => {});
      const stream = await Promise.race([acquire, timeout]);
      if (!s.alive || s.closed) { stopStream(stream); return; }
      s.local = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      if (localRef.current) { localRef.current.srcObject = stream; localRef.current.play().catch(() => {}); }
      pc.onicecandidate = (event) => {
        if (!event.candidate || s.closed || !s.alive) return;
        if (++s.count > 64) { failure(new Error("Aloqa manzillari chegarasiga yetildi; qayta qo‘ng‘iroq qiling.")); return; }
        s.queued.push({ candidate: event.candidate.toJSON(), request_id: key() }); flush();
      };
      pc.ontrack = (event) => {
        if (s.closed || !s.alive) return;
        s.remote ||= new MediaStream();
        if (!s.remote.getTracks().some((track) => track.id === event.track.id)) s.remote.addTrack(event.track);
        if (remoteRef.current) { remoteRef.current.srcObject = s.remote; playRemote(); }
      };
      pc.onconnectionstatechange = () => {
        if (s.closed || !s.alive) return;
        if (pc.connectionState === "connected") {
          s.connectedAt ||= Date.now(); setStatus("connected"); setMessage("");
        } else if (pc.connectionState === "failed") {
          failure(new Error("Aloqa o‘rnatilmadi. Internet yoki qo‘ng‘iroq serverini tekshiring."));
        } else if (pc.connectionState === "disconnected") {
          setMessage("Aloqa uzildi, qayta ulanish kutilmoqda…");
          later(() => { if (pc.connectionState === "disconnected") failure(new Error("Internet aloqasi uzildi. Qayta qo‘ng‘iroq qiling.")); }, 15000);
        }
      };
    };
    const tick = () => {
      if (s.connectedAt) setSeconds(Math.floor((Date.now()-s.connectedAt)/1000));
      if (s.connectedAt && Date.now()-s.connectedAt >= 3600000) return failure(new Error("Bir soatlik qo‘ng‘iroq yakunlandi. Davom etish uchun qayta qo‘ng‘iroq qiling."));
      if (!s.connectedAt && s.connectingAt && Date.now()-s.connectingAt > 35000) return failure(new Error("Ulanish vaqti tugadi. Internetni tekshirib, qayta urinib ko‘ring."));
      if (!s.connectedAt && !s.connectingAt && Date.now()-s.startedAt > 95000) return failure(new Error("Qo‘ng‘iroqqa javob bo‘lmadi."));
      later(tick, 1000);
    };
    const apply = async (row) => {
      s.row = row;
      setName(row.peer_name || peer?.name || "Suhbatdosh"); setKind(row.mode || mode);
      if (row.state === "ended") {
        shutdown(); setStatus("ended");
        setMessage(row.reason === "declined" ? "Suhbatdoshingiz qo‘ng‘iroqni rad etdi." : row.reason === "timeout" ? "Qo‘ng‘iroq vaqti tugadi yoki aloqa uzildi." : "");
        return;
      }
      if (row.state === "active" && !s.connectingAt) { s.connectingAt = Date.now(); if (!s.connectedAt) setStatus("connecting"); }
      if (!callId && row.answer && s.pc && !s.remoteApplied) {
        await s.pc.setRemoteDescription(row.answer); s.remoteApplied = true;
      }
      for (const event of row.candidates || []) {
        if (event.seq > s.cursor) { s.remoteQueue.push(event.candidate); s.cursor = event.seq; }
      }
      if (s.remoteQueue.length > 128) throw new Error("Aloqa ma’lumotlari chegarasiga yetildi.");
      await drainRemote();
    };
    const poll = async () => {
      try {
        await apply(await request(`/${s.id}?after=${s.cursor}`)); s.failures = 0;
      } catch (error) {
        if (error.status === 401 || error.status === 403 || error.status === 404 || error.status === 410 || ++s.failures >= 3) return failure(error);
        if (s.alive && !s.closed) setMessage("Aloqa tekshirilmoqda…");
      }
      if (s.alive && !s.closed) later(poll, s.connectedAt ? 5000 : 2500);
    };
    const accept = async () => {
      if (s.accepting || s.answered || s.closed) return;
      s.accepting = true; setStatus("connecting"); s.connectingAt = Date.now();
      try {
        await setupPeer(s.row.mode);
        if (!s.alive || s.closed) return;
        await s.pc.setRemoteDescription(s.row.offer); s.remoteApplied = true;
        const answer = await s.pc.createAnswer(); await s.pc.setLocalDescription(answer);
        await request(`/${s.id}/signal`, { action: "answer", answer: { type: answer.type, sdp: answer.sdp } });
        s.answered = true; s.signalReady = true; await drainRemote(); flush();
      } catch (error) { failure(error); }
    };
    const dismiss = () => { if (!s.closed) notifyEnd(callId && !s.answered ? "decline" : "hangup"); shutdown(); onCloseRef.current?.(); };
    actions.current = {
      dismiss, accept, play: playRemote,
      mute: () => { if (!s.local) return; const tracks = s.local.getAudioTracks(); const enabled = !tracks[0]?.enabled; tracks.forEach((track) => { track.enabled = enabled; }); setMuted(!enabled); },
      camera: () => { if (!s.local) return; const tracks = s.local.getVideoTracks(); const enabled = !tracks[0]?.enabled; tracks.forEach((track) => { track.enabled = enabled; }); setCameraOff(!enabled); },
    };
    const init = async () => {
      try {
        s.config = await request("/config");
        if (!s.config.available) throw new Error(s.config.reason || "Qo‘ng‘iroq serveri sozlanmagan.");
        if (callId) {
          const row = await request(`/${callId}`);
          if (!row.incoming || row.state !== "ringing" || !row.offer) throw new Error("Bu qo‘ng‘iroq tugagan yoki boshqa qurilmada ochilgan.");
          await apply(row); setStatus("incoming");
        } else {
          if (!Number.isSafeInteger(peerId) || peerId <= 0) throw new Error("Suhbatdosh tanlanmagan.");
          await setupPeer(mode);
          if (!s.alive || s.closed) return;
          const offer = await s.pc.createOffer(); await s.pc.setLocalDescription(offer);
          const row = await request("", { peer_id: peerId, mode, request_id: key(), offer: { type: offer.type, sdp: offer.sdp } });
          s.id = row.id; s.signalReady = true; s.startedAt = Date.now(); await apply(row);
          setStatus("calling"); flush();
        }
        later(poll, 1000); later(tick, 1000);
      } catch (error) { failure(error); }
    };
    init();
    const onPageHide = () => { if (!s.closed) notifyEnd(); shutdown(); };
    const onKey = event => { if (event.key === "Escape") { event.preventDefault(); dismiss(); } };
    const removeBack = registerPhoneBackHandler("kabutar-call-dialog", () => { dismiss(); return true; }, 680);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pagehide", onPageHide);
    return () => { s.alive = false; if (!s.closed) notifyEnd(); shutdown(); window.removeEventListener("pagehide", onPageHide); window.removeEventListener("keydown", onKey); removeBack(); actions.current = {}; };
  }, [apiBase, token, callId, peerId, mode]);

  const incoming = status === "incoming";
  const done = status === "error" || status === "ended";
  return createPortal(
    <div className="kb-call-overlay" role="presentation">
      <section className="kb-call-dialog" role="dialog" aria-modal="true" aria-label={kind === "video" ? t("Videoqo‘ng‘iroq") : t("Ovozli qo‘ng‘iroq")}>
        <header><span>{kind === "video" ? t("Videoqo‘ng‘iroq") : t("Ovozli qo‘ng‘iroq")}</span><button type="button" autoFocus onClick={() => actions.current.dismiss?.()} aria-label={t("Qo‘ng‘iroqni yopish")}><X size={22} /></button></header>
        <div className={`kb-call-stage ${kind === "audio" ? "kb-call-audio" : ""}`}>
          {kind === "video" ? <video ref={remoteRef} autoPlay playsInline className="kb-call-remote" /> : <audio ref={remoteRef} autoPlay playsInline />}
          {(kind === "audio" || status !== "connected") && <div className="kb-call-person"><div className="kb-call-avatar">{name.trim().slice(0, 1).toUpperCase()}</div><h2>{name}</h2></div>}
          {kind === "video" && <video ref={localRef} autoPlay playsInline muted className="kb-call-local" aria-label={t("Sizning kamerangiz")} />}
        </div>
        <div className="kb-call-status" aria-live="polite"><strong>{t(label[status])}</strong>{status === "connected" && <span aria-label={t("Qo‘ng‘iroq davomiyligi")}>{elapsedLabel(seconds)}</span>}{message && <p>{message}</p>}</div>
        {needsPlay && !done && <button className="kb-call-play" type="button" onClick={() => actions.current.play?.()}><Volume2 size={18} />{t("Ovozini eshitish")}</button>}
        <div className="kb-call-controls">
          {!incoming && !done && <><button type="button" onClick={() => actions.current.mute?.()} disabled={status === "checking"} aria-pressed={muted} aria-label={muted ? t("Mikrofonni yoqish") : t("Mikrofonni o‘chirish")}>{muted ? <MicOff /> : <Mic />}</button>{kind === "video" && <button type="button" onClick={() => actions.current.camera?.()} disabled={status === "checking"} aria-pressed={cameraOff} aria-label={cameraOff ? t("Kamerani yoqish") : t("Kamerani o‘chirish")}>{cameraOff ? <VideoOff /> : <Video />}</button>}</>}
          {incoming && <button className="kb-call-accept" type="button" onClick={() => actions.current.accept?.()}><Phone size={22} /><span>{t("Javob berish")}</span></button>}
          <button className="kb-call-end" type="button" onClick={() => actions.current.dismiss?.()}><PhoneOff size={22} /><span>{done ? t("Yopish") : incoming ? t("Rad etish") : t("Tugatish")}</span></button>
        </div>
        {incoming && <p className="kb-call-hint">{t(kind === "video" ? "Javob berganingizdan keyin mikrofon va kamera ruxsati so‘raladi." : "Javob berganingizdan keyin mikrofon ruxsati so‘raladi.")}</p>}
      </section>
    </div>, document.body);
}
