import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import AmaliyDoska, { useBoardVoice } from "./AmaliyDoska.jsx";
import { cleanCode, codeUrl, isCodeLike } from "./kitobKodRules.js";
import "./dars-xonasi.css";

const DarsXonasi = React.lazy(() => import("./DarsXonasi.jsx"));

/** Tepadagi «Ta'lim maydoni | Yordamchi | Kabutar» qatoridagi qisqa kod maydoni.
 *  Kitobdagi kodni (XB-03-A01) yozsa — topshiriq sharti va yechimi AI doskada ochiladi. */
export default function KitobKodQidiruv({ apiBase, token, jins = "qiz" }) {
  useKbInterfaceLocale();
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: false, error: "", item: null });
  const [lesson, setLesson] = useState(false);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState({ busy: false, text: "" });
  const voice = useBoardVoice(apiBase, jins);
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const base = String(apiBase ?? "").replace(/\/+$/, "");
  const mediaUrl = useCallback((u) => (!u ? null : u.startsWith("/") ? `${base}${u}` : u), [base]);

  const search = useCallback((value) => {
    const wanted = cleanCode(value);
    setOpen(true); setLesson(false); setReply({ busy: false, text: "" }); voice.hush();
    if (!isCodeLike(wanted)) { setState({ loading: false, error: "", item: null }); setTimeout(() => inputRef.current?.focus(), 50); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ loading: true, error: "", item: null });
    fetch(codeUrl(apiBase, token, wanted), { signal: controller.signal })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.detail || "Kod topilmadi"); return d; })
      .then((item) => { if (!controller.signal.aborted) setState({ loading: false, error: "", item }); })
      .catch((e) => { if (!controller.signal.aborted) setState({ loading: false, error: e.message, item: null }); });
  }, [apiBase, token, voice]);

  const close = useCallback(() => { abortRef.current?.abort(); voice.hush(); setOpen(false); setLesson(false); }, [voice]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const ask = async (event) => {
    event.preventDefault();
    const item = state.item;
    const savol = question.trim();
    if (!item || !savol || reply.busy) return;
    setReply({ busy: true, text: "" }); voice.hush();
    try {
      const r = await fetch(`${base}/api/ai/ustoz/sorash`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fan: item.mavzu?.fan || "", topic_code: item.mavzu?.topic_code, rejim: "orgatish",
          savol: `${__kbUi("Kitobdagi")} ${item.kod} ${__kbUi("topshiriq")}: ${String(item.shart || "").slice(0, 600)}\n${__kbUi("Savolim")}: ${savol}` }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.detail || "AI ustoz javob bermadi");
      const text = (d.javob?.bloklar || []).map((b) => b.matn).filter(Boolean).join("\n\n") || __kbUi("Javob topilmadi.");
      setReply({ busy: false, text }); setQuestion(""); voice.say(text.slice(0, 900));
    } catch (e) { setReply({ busy: false, text: e.message }); }
  };

  const item = state.item;
  const modal = open && createPortal(<div className="kk-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <section className="kk-modal dx-root" role="dialog" aria-modal="true" aria-label={__kbUi("Kitob kodi bo‘yicha yechim")}>
      <header className="kk-head">
        <form className="kk-search" onSubmit={(e) => { e.preventDefault(); search(code); }}>
          <label htmlFor="kk-code-modal">{__kbUi("Kitobdagi kod")}</label>
          <input id="kk-code-modal" ref={inputRef} value={code} onChange={(e) => setCode(cleanCode(e.target.value))} placeholder="XB-03-A01" autoComplete="off" spellCheck={false} inputMode="text" />
          <button type="submit" className="dx-btn dx-primary" disabled={!isCodeLike(code) || state.loading}>{__kbUi("Ochish")}</button>
        </form>
        <button type="button" className="dx-btn kk-close" onClick={close} aria-label={__kbUi("Yopish")}>✕</button>
      </header>
      {state.loading && <p className="dx-status">{__kbUi("Qidirilmoqda…")}</p>}
      {state.error && <p className="kk-error" role="alert">{__kbUi(state.error)}</p>}
      {!item && !state.loading && !state.error && <p className="kk-hint">{__kbUi("Kitobda misol, masala, topshiriq yoki test yonidagi kodni yozing (masalan XB-03-A01) — sharti va yechimi AI doskada ko‘rsatiladi.")}</p>}
      {item && !lesson && <>
        <div className="kk-meta">
          <strong>{item.sarlavha || item.kod}</strong>
          <span>{[...new Set([item.mavzu?.nomi, item.mavzu?.fan, item.kitob].filter(Boolean))].join(" · ")}</span>
        </div>
        <div className="dx-frame">
          <div className="dx-board kk-board">
            <AmaliyDoska item={item} say={voice.say} hush={voice.hush} mediaUrl={mediaUrl} autoStart />
          </div>
          <div className="dx-ledge" aria-hidden="true" />
        </div>
        <div className="kk-foot">
          <span className={`kk-voice ${voice.speaking ? "is-on" : ""}`}><i />{voice.speaking ? __kbUi("AI o‘qituvchi gapirmoqda…") : __kbUi("AI o‘qituvchi")}</span>
          {item.mavzu?.dars_bor && <button type="button" className="dx-btn" onClick={() => { voice.hush(); setLesson(true); }}>{__kbUi("📘 Mavzu darsini ochish")}</button>}
        </div>
        <form className="dx-ask kk-ask" onSubmit={ask}>
          <label htmlFor="kk-ask">{__kbUi("Tushunmagan joyingizni so‘rang")}</label>
          <div className="dx-row"><input id="kk-ask" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={__kbUi("Masalan: nega 25% ni 24 ga ko‘paytirdik?")} disabled={reply.busy} />
            <button type="submit" className="dx-btn" disabled={reply.busy || !question.trim()}>{reply.busy ? "…" : __kbUi("So‘rash")}</button></div>
          {reply.text && <p className="dx-reply">{reply.text}</p>}
        </form>
      </>}
      {item && lesson && <>
        <button type="button" className="dx-btn" onClick={() => setLesson(false)}>{__kbUi("← Topshiriqqa qaytish")}</button>
        <React.Suspense fallback={<p className="dx-status">{__kbUi("Dars yuklanmoqda…")}</p>}>
          <DarsXonasi apiBase={apiBase} token={token} topicCode={item.mavzu.topic_code} fan={item.mavzu.fan} grade={item.mavzu.sinf} jins={jins} />
        </React.Suspense>
      </>}
    </section>
  </div>, document.body);

  return <>
    <form className="kk-top" role="search" onSubmit={(e) => { e.preventDefault(); search(code); }}>
      <input className="kk-top-input" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} placeholder={__kbUi("Kod")}
        aria-label={__kbUi("Kitobdagi kodni kiriting")} autoComplete="off" spellCheck={false} />
      <button type="submit" className="kk-top-btn" title={__kbUi("Kitobdagi kod bo‘yicha yechim")} aria-label={__kbUi("Kitob kodi bo‘yicha yechimni ochish")}>🔑<span className="kk-top-label">{__kbUi("Kod")}</span></button>
    </form>
    {modal}
  </>;
}
