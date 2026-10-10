import React, { useEffect, useRef } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";

const AUTO_MS = 3000;

/** REV91: bog'cha o'yini boshlanishi — tugma bosilmasa ham 3 soniyada o'zi boshlanadi (tugma ostida chiziq to'ladi). */
export default function KidStart({ title, ready, error, onStart, onBack, onBattle }) {
  const started = useRef(false);
  const start = () => { if (started.current || !ready) return; started.current = true; onStart(); };
  useEffect(() => {
    if (!ready || error) return undefined;
    const t = setTimeout(start, AUTO_MS);
    return () => clearTimeout(t);
  }, [ready, error]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="kq-root kq-start">
    <button type="button" className="kq-nav-btn is-ghost" style={{ maxWidth: 160 }} onClick={() => { started.current = true; onBack(); }}>⬅ {__kbUi("Orqaga")}</button>
    <div className="kq-mascot"><span className="kq-bird" aria-hidden="true">🕊️</span><p className="kq-bubble">{__kbUi("Tayyormisan? Hozir boshlaymiz!")}</p></div>
    <h2 className="kq-start-title">{title}</h2>
    {error && <p className="kq-bubble" role="alert">{__kbUi(error)}</p>}
    <button type="button" className={`kq-nav-btn kq-start-btn ${ready && !error ? "is-auto" : ""}`} style={{ "--kq-auto": `${AUTO_MS}ms` }} disabled={!ready} onClick={start}>
      {ready ? __kbUi("🎮 Boshladik!") : "…"}</button>
    {onBattle && <button type="button" className="kq-nav-btn is-ghost" onClick={() => { started.current = true; onBattle(); }}>{__kbUi("⚔️ Do‘stlar bilan bellashuv")}</button>}
  </div>;
}
