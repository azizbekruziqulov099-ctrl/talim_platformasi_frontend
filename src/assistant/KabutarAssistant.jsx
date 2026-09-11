import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { BookOpen, Check, ChevronLeft, ChevronRight, Download, FileText, Maximize2, MessageCircle, Minimize2, Search, Send, Square, Volume2, X } from "lucide-react";
import { displayTextKeepingLatex, latexSegments } from "../test/latexTextRules.js";
import { assistantImageSource, assistantNextSuggestions, assistantRemainingSeconds, assistantResultSummary, assistantSpeechChunks, draftFingerprint,
  formatAssistantTime, initialAssistantDraft, questionOptions, selectTopic, topicTitle } from "./assistantRules.js";
import "./kabutarAssistant.css";

const INTRO = "Salom! Bugun nimani mashq qilamiz? Mavzu topamiz, bilimingizni test bilan tekshiramiz yoki chop etishga qulay PDF tayyorlaymiz. Oddiy yozavering — kerakli joyini birga aniqlaymiz.";
const DIFFICULTIES = { mixed: "Aralash", easy: "Oson", medium: "O‘rtacha", hard: "Qiyin", advanced: "Murakkab" };
let messageSequence = 0;
const messageItem = (role, text) => ({ id: ++messageSequence, role, text: String(text || "") });

export function KabutarRobot({ small = false }) {
  return <svg className={`ka-robot ${small ? "ka-robot-small" : ""}`} viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <path d="M28 12V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="6" r="3" fill="#ebb964" />
    <path d="M8 28H5v8h5m38-8h3v8h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="9" y="13" width="38" height="34" rx="15" fill="#e8f7f5" stroke="currentColor" strokeWidth="2" />
    <rect x="15" y="21" width="26" height="17" rx="8" fill="currentColor" />
    <path d="M21 28v3m14-3v3" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <path d="M25 34c1.5 1 4.5 1 6 0" stroke="#8bddd0" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M23 44h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".35" />
  </svg>;
}

export function KabutarAssistantButton({ open, onClick }) {
  return <button type="button" className={`ka-launch ${open ? "is-open" : ""}`} onClick={onClick}
    aria-expanded={Boolean(open)} aria-controls="kabutar-assistant-panel" aria-label={open ? "Yordamchini yopish" : "AI yordamchi bilan suhbatlashish"} title="AI yordamchi">
    <KabutarRobot small /><span>Yordamchi</span>
  </button>;
}

const AssistantText = React.memo(function AssistantText({ text, className = "" }) {
  const segments = useMemo(() => latexSegments(displayTextKeepingLatex(text)), [text]);
  return <span className={`ka-rich-text ${className}`}>{segments.map((part, index) => {
    let math = null;
    if (part.startsWith("[lat]") && part.endsWith("[/lat]")) math = part.slice(5, -6);
    else if (part.startsWith("$") && part.endsWith("$")) math = part.slice(1, -1);
    else if (/^\\[([]/.test(part) && /\\[)\]]$/.test(part)) math = part.slice(2, -2);
    if (math == null) return <React.Fragment key={index}>{part}</React.Fragment>;
    try {
      const html = katex.renderToString(math, { throwOnError: false, trust: false, strict: "ignore", output: "html" });
      return <span key={index} className="ka-math" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch { return <React.Fragment key={index}>{math}</React.Fragment>; }
  })}</span>;
});

function useAssistantVoice(apiBase, enabled) {
  const runRef = useRef(null);
  const [voice, setVoice] = useState({ id: null, status: "", error: "" });
  const stop = useCallback(() => {
    const run = runRef.current;
    runRef.current = null;
    if (run) {
      clearTimeout(run.timer);
      run.audio.onplaying = run.audio.onended = run.audio.onerror = null;
      run.audio.pause();
      run.audio.removeAttribute("src");
      run.audio.load();
    }
    setVoice({ id: null, status: "", error: "" });
  }, []);
  useEffect(() => { if (!enabled) stop(); }, [enabled, stop]);
  useEffect(() => stop, [stop]);
  const speak = useCallback((id, text) => {
    if (runRef.current?.id === id) { stop(); return; }
    stop();
    const chunks = assistantSpeechChunks(text);
    if (!chunks.length) return;
    const audio = new Audio();
    const run = { id, audio, index: 0, timer: null };
    runRef.current = run;
    const current = () => runRef.current === run;
    const fail = () => {
      if (!current()) return;
      stop();
      setVoice({ id: null, status: "", error: "Ovoz hozir tayyor bo‘lmadi. Karnayni qayta bosing." });
    };
    const next = () => {
      if (!current()) return;
      if (run.index >= chunks.length) { stop(); return; }
      const params = new URLSearchParams({ matn: chunks[run.index], jins: "qiz", asosiy_til: "uz" });
      audio.src = `${apiBase}/api/ovoz?${params.toString()}`;
      setVoice({ id, status: "loading", error: "" });
      clearTimeout(run.timer);
      run.timer = setTimeout(fail, 18000);
      try { Promise.resolve(audio.play()).catch(fail); } catch { fail(); }
    };
    audio.onplaying = () => {
      if (!current()) return;
      clearTimeout(run.timer); // Loading timeout must never restart an already playing message.
      setVoice({ id, status: "playing", error: "" });
    };
    audio.onerror = fail;
    audio.onended = () => { if (current()) { run.index += 1; next(); } };
    next();
  }, [apiBase, stop]);
  return { ...voice, speak, stop };
}

function TopicChoice({ topic, checked, onChange, disabled }) {
  return <label className={`ka-topic ${checked ? "is-selected" : ""}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    <span><strong>{topicTitle(topic)}</strong><small>{topic.grade ? `${topic.grade}-sinf · ` : ""}{topic.subject_name || "Fan"}{topic.quarter ? ` · ${topic.quarter}-chorak` : ""} · {topic.question_count ?? 0} savol</small></span>
  </label>;
}

export default function KabutarAssistant({ open = false, onClose, token, apiBase = "", user, readOnly = false }) {
  const base = String(apiBase).replace(/\/+$/, "");
  const [messages, setMessages] = useState(() => [messageItem("assistant", INTRO)]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState(() => initialAssistantDraft(user));
  const [catalog, setCatalog] = useState({ topics: [], subjects: [], capabilities: {} });
  const [knownTopics, setKnownTopics] = useState({});
  const [filters, setFilters] = useState({ query: "", subject: "", quarter: "" });
  const [choices, setChoices] = useState([]);
  const [conversation, setConversation] = useState({});
  const [plan, setPlan] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState("");
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("");
  const [seconds, setSeconds] = useState(null);
  const [tab, setTab] = useState("chat");
  const [wide, setWide] = useState(false);
  const [finishConfirm, setFinishConfirm] = useState(false);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const [recoveryRetry, setRecoveryRetry] = useState(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const conversationRef = useRef(null);
  const mounted = useRef(true);
  const requests = useRef(new Set());
  const operation = useRef(null);
  const answersRef = useRef(answers);
  const attemptRef = useRef(attempt);
  const resultRef = useRef(result);
  const savingRef = useRef(null);
  const queuedSaveRef = useRef(false);
  const saveRef = useRef(null);
  const submitRef = useRef(null);
  const clockOffset = useRef(0);
  const expiredAttempt = useRef(null);
  const downloadUrls = useRef(new Set());
  const voice = useAssistantVoice(base, open && Boolean(token));
  answersRef.current = answers;
  attemptRef.current = attempt;
  resultRef.current = result;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const request = useCallback(async (path, options = {}) => {
    const controller = new AbortController();
    requests.current.add(controller);
    const requestToken = token;
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(`${base}/api/assistant${path}`, {
        ...options, cache: "no-store", signal: controller.signal,
        headers: { Authorization: `Bearer ${requestToken}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
      });
      if (!response.ok) {
        let detail;
        try { const data = await response.json(); detail = data.detail || data.message; } catch { /* non-JSON proxy error */ }
        if (response.status === 401) throw new Error("Kirish muddati tugadi. Akkauntingizga qayta kiring.");
        throw new Error(typeof detail === "string" ? detail : "So‘rov bajarilmadi. Birozdan keyin qayta urinib ko‘ring.");
      }
      const data = options.download ? await response.blob() : await response.json();
      if (!mounted.current || tokenRef.current !== requestToken) throw new DOMException("Cancelled", "AbortError");
      return data;
    } catch (err) {
      if (err.name === "AbortError" && mounted.current && tokenRef.current === requestToken) throw new Error("Javob kutilganidan uzoq keldi. Qayta urinib ko‘ring.");
      throw err;
    } finally { clearTimeout(timeout); requests.current.delete(controller); }
  }, [base, token]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requests.current.forEach((controller) => controller.abort());
      downloadUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    requests.current.forEach((controller) => controller.abort());
    operation.current = null;
    setMessages([messageItem("assistant", INTRO)]);
    setDraft(initialAssistantDraft(user)); setInput(""); setChoices([]); setPlan(null); setConversation({});
    setAttempt(null); setAnswers({}); setResult(null); setIndex(0); setError(""); setBusy("");
    setRecoveryChecked(false); queuedSaveRef.current = false; savingRef.current = null;
    setCatalog({ topics: [], subjects: [], capabilities: {} }); setKnownTopics({});
    setFilters({ query: "", subject: "", quarter: "" }); setSaveState(""); setTab("chat");
    expiredAttempt.current = null; clockOffset.current = 0; voice.stop();
    // Account/session changes must never show another account's conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape" && panelRef.current?.contains(event.target)) { event.preventDefault(); onCloseRef.current?.(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (opener?.isConnected) opener.focus?.(); };
  }, [open]);
  useEffect(() => {
    if (open && tab === "chat") conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "auto" });
  }, [messages.length, open, tab]);

  useEffect(() => {
    if (!open || !token || attempt) return undefined;
    if (!draft.grade) {
      setCatalogBusy(false);
      setCatalog((current) => current.topics.length || current.subjects.length ? { ...current, topics: [], subjects: [] } : current);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setCatalogBusy(true);
      try {
        const query = new URLSearchParams();
        if (draft.grade) query.set("grade", String(draft.grade));
        if (filters.query.trim()) query.set("query", filters.query.trim());
        if (filters.subject) query.set("subject_code", filters.subject);
        if (filters.quarter) query.set("quarter", filters.quarter);
        const data = await request(`/catalog?${query}`);
        if (!active) return;
        setCatalog({ topics: data.topics || [], subjects: data.subjects || [], capabilities: data.capabilities || {}, truncated: data.truncated });
        setKnownTopics((current) => ({ ...current, ...Object.fromEntries((data.topics || []).map((topic) => [String(topic.topic_code), topic])) }));
      } catch (err) { if (active && err.name !== "AbortError") setError(err.message); }
      finally { if (active) setCatalogBusy(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [open, token, draft.grade, filters.query, filters.subject, filters.quarter, attempt, request]);

  const editDraft = useCallback((patch) => {
    setDraft((current) => typeof patch === "function" ? patch(current) : { ...current, ...patch });
    setPlan(null); setError(""); setConversation({});
  }, []);
  const toggleTopic = useCallback((topic, checked) => {
    setKnownTopics((current) => ({ ...current, [String(topic.topic_code)]: topic }));
    editDraft((current) => selectTopic(current, topic.topic_code, checked));
  }, [editDraft]);
  const addMessage = useCallback((role, text) => setMessages((current) => [...current.slice(-79), messageItem(role, text)]), []);

  const ask = async (message = input) => {
    if (!token || operation.current || attempt || readOnly || !recoveryChecked) return;
    const text = String(message || "").trim();
    const op = { kind: "plan" }; operation.current = op; setBusy("plan"); setError(""); setPlan(null);
    if (text) { addMessage("user", text); setInput(""); }
    try {
      const data = await request("/plan", { method: "POST", body: JSON.stringify({ message: text, draft, context: conversation.context || {} }) });
      if (operation.current !== op) return;
      const nextDraft = { ...draft, ...(data.draft || {}) };
      setDraft(nextDraft); setChoices(data.choices || []);
      setConversation({ kind: data.conversation_kind, nextField: data.next_field, suggestions: data.suggestions, engine: data.engine, context: data.context });
      if (nextDraft.grade !== draft.grade) setFilters({ query: "", subject: "", quarter: nextDraft.quarter ? String(nextDraft.quarter) : "" });
      else if (nextDraft.quarter !== draft.quarter) setFilters((current) => ({ ...current, quarter: nextDraft.quarter ? String(nextDraft.quarter) : "" }));
      if (data.message) addMessage("assistant", data.message);
      const suppliedTopics = [...(data.choices || []), ...(data.summary?.topics || [])];
      setKnownTopics((current) => ({ ...current, ...Object.fromEntries(suppliedTopics.map((topic) => [String(topic.topic_code), topic])) }));
      if (data.ready && data.plan_token) {
        setPlan({ token: data.plan_token, summary: data.summary, fingerprint: draftFingerprint(nextDraft) });
        // Keep a typed conversation in view; show its confirmation directly below.
      }
    } catch (err) { if (operation.current === op && err.name !== "AbortError") setError(err.message); }
    finally { if (operation.current === op) { operation.current = null; setBusy(""); } }
  };

  const applyAttempt = (data) => {
    const serverNow = Date.parse(data.server_now || "");
    if (Number.isFinite(serverNow)) clockOffset.current = serverNow - Date.now();
    setAttempt(data); setAnswers(data.answers || {}); setResult(data.result || null);
    if (data.plan) { setDraft((current) => ({ ...current, ...data.plan })); setKnownTopics((current) => ({ ...current, ...Object.fromEntries((data.plan.topics || []).map((topic) => [String(topic.topic_code), topic])) })); }
    setSeconds(assistantRemainingSeconds(data.expires_at, clockOffset.current));
    setIndex(0); setFinishConfirm(false); setTab("attempt"); setSaveState(""); expiredAttempt.current = null;
  };
  useEffect(() => {
    if (!open || !token || recoveryChecked || readOnly) return undefined;
    let active = true;
    const op = { kind: "recover" }; operation.current = op; setBusy("recover");
    request("/attempt/latest").then((data) => {
      if (!active || operation.current !== op) return;
      if (data.capabilities) setCatalog((current) => ({ ...current, capabilities: data.capabilities }));
      if (data.attempt) { applyAttempt({ ...data.attempt, capabilities: data.capabilities || data.attempt.capabilities }); addMessage("assistant", "Tugallanmagan testingiz topildi. Saqlangan javoblar bilan davom etishingiz mumkin."); }
      setRecoveryChecked(true);
    }).catch((err) => {
      if (active && err.name !== "AbortError") setError(err.message);
    }).finally(() => {
      if (operation.current === op) { operation.current = null; setBusy(""); }
    });
    return () => { active = false; };
    // Run only once per account; a failed recovery exposes an explicit retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token, recoveryChecked, recoveryRetry, readOnly, request]);

  const start = async () => {
    if (operation.current || readOnly || !recoveryChecked || !plan || plan.fingerprint !== draftFingerprint(draft)) return;
    const op = { kind: "create" }; operation.current = op; setBusy("create"); setError("");
    try {
      const data = await request("/create", { method: "POST", body: JSON.stringify({ plan_token: plan.token, confirmed: true }) });
      if (operation.current !== op) return;
      applyAttempt(data); voice.stop();
    } catch (err) { if (operation.current === op && err.name !== "AbortError") setError(err.message); }
    finally { if (operation.current === op) { operation.current = null; setBusy(""); } }
  };

  const saveProgress = useCallback(async () => {
    if (!attemptRef.current || resultRef.current || operation.current?.kind === "submit" || readOnly) return;
    if (savingRef.current) { queuedSaveRef.current = true; return savingRef.current.promise; }
    const id = attemptRef.current.attempt_id;
    const values = { ...answersRef.current };
    setSaveState("saving");
    const saveRun = {};
    const promise = request(`/attempt/${encodeURIComponent(id)}/answers`, {
      method: "POST", body: JSON.stringify({ answers: values }),
    }).then(() => { if (attemptRef.current?.attempt_id === id && !resultRef.current) setSaveState("saved"); })
      .catch((err) => { if (err.name !== "AbortError" && attemptRef.current?.attempt_id === id && !resultRef.current) setSaveState("error"); })
      .finally(() => {
        if (savingRef.current !== saveRun) return;
        savingRef.current = null;
        if (queuedSaveRef.current) { queuedSaveRef.current = false; saveRef.current?.(); }
      });
    saveRun.promise = promise; savingRef.current = saveRun;
    return promise;
  }, [request, readOnly]);
  saveRef.current = saveProgress;
  useEffect(() => {
    if (!attempt || result || !Object.keys(answers).length) return undefined;
    setSaveState("pending");
    const timer = setTimeout(() => saveProgress(), 400);
    return () => clearTimeout(timer);
  }, [answers, attempt?.attempt_id, result, saveProgress]);

  const submit = useCallback(async () => {
    if (operation.current || !attemptRef.current || resultRef.current || readOnly) return;
    const op = { kind: "submit" }; operation.current = op; setBusy("submit"); setError("");
    const id = attemptRef.current.attempt_id;
    try {
      // Finish after an in-flight save; /submit grades the complete server-owned question set.
      if (savingRef.current) await savingRef.current.promise;
      const data = await request(`/attempt/${encodeURIComponent(id)}/submit`, { method: "POST", body: JSON.stringify({ answers: answersRef.current }) });
      if (operation.current !== op) return;
      setResult(data); resultRef.current = data; setFinishConfirm(false); setSaveState("saved"); voice.stop();
    } catch (err) { if (operation.current === op && err.name !== "AbortError") setError(err.message); }
    finally { if (operation.current === op) { operation.current = null; setBusy(""); } }
  }, [request, voice.stop, readOnly]);
  submitRef.current = submit;
  useEffect(() => {
    if (!attempt || result) return undefined;
    const tick = () => {
      const remaining = assistantRemainingSeconds(attempt.expires_at, clockOffset.current);
      setSeconds((current) => current === remaining ? current : remaining);
      if (!readOnly && remaining === 0 && attempt.mode === "exam" && !operation.current && expiredAttempt.current !== attempt.attempt_id) {
        expiredAttempt.current = attempt.attempt_id;
        submitRef.current?.();
      }
    };
    tick(); const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attempt?.attempt_id, attempt?.expires_at, attempt?.mode, result, readOnly]);

  const download = async (format, key = false) => {
    if (!attempt || operation.current) return;
    const op = { kind: "download" }; operation.current = op; setBusy(`download-${format}-${key}`); setError("");
    try {
      const blob = await request(`/attempt/${encodeURIComponent(attempt.attempt_id)}/export?format=${format}&answer_key=${key ? "true" : "false"}`, { download: true });
      if (operation.current !== op) return;
      const url = URL.createObjectURL(blob); downloadUrls.current.add(url);
      const link = document.createElement("a"); link.href = url;
      link.download = `kabutar-${key ? "javoblar-kaliti" : "test"}-${String(attempt.attempt_id).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24)}.${format}`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => { URL.revokeObjectURL(url); downloadUrls.current.delete(url); }, 10000);
    } catch (err) { if (operation.current === op && err.name !== "AbortError") setError(err.message); }
    finally { if (operation.current === op) { operation.current = null; setBusy(""); } }
  };

  const selectedTopics = (draft.topic_codes || []).map((code) => knownTopics[String(code)] || { topic_code: code, title: code });
  const selectedSubjects = [...new Map(selectedTopics.filter((topic) => topic.subject_code).map((topic) => [topic.subject_code, topic.subject_name])).entries()];
  const questions = attempt?.questions || [];
  const question = questions[index];
  const questionId = question?.id;
  const options = questionOptions(question);
  const answered = questions.filter((item) => String(answers[item.id] ?? "").trim()).length;
  const examExpired = attempt?.mode === "exam" && seconds === 0;
  const keysAllowed = catalog.capabilities?.keys_allowed === true || attempt?.capabilities?.keys_allowed === true;
  const summary = plan?.summary || {};
  const questionImage = assistantImageSource(question?.rasm_id, base);
  const close = () => onClose?.();
  const suggestions = assistantNextSuggestions(draft, conversation, catalog);
  const engine = conversation.engine || catalog.capabilities?.engine;
  const interactionDisabled = Boolean(busy) || readOnly || !recoveryChecked;
  const newConversation = () => {
    if (attempt && !result) return;
    voice.stop(); setAttempt(null); setAnswers({}); setResult(null); setPlan(null); setChoices([]);
    setConversation({}); setTab("chat"); setError(""); setSaveState("");
    addMessage("assistant", "Yana mashq qilamizmi? Shu mavzularni qoldirishingiz yoki boshqa fan va mavzuni yozishingiz mumkin.");
  };
  const confirmation = plan && <div className="ka-confirm">
    <div className="ka-section-title"><span className="ka-step"><Check size={16} /></span><div><h3>Shu reja bilan boshlaymizmi?</h3><p>Tasdiqlashdan oldin shartlarni tekshiring.</p></div></div>
    <dl><div><dt>Sinf</dt><dd>{summary.grade || draft.grade}-sinf</dd></div><div><dt>Chorak</dt><dd>{summary.quarter || draft.quarter ? `${summary.quarter || draft.quarter}-chorak` : "Barcha choraklar"}</dd></div><div><dt>Savollar</dt><dd>{summary.question_count || draft.question_count} ta</dd></div><div><dt>Qiyinlik</dt><dd>{DIFFICULTIES[summary.difficulty || draft.difficulty] || "Aralash"}</dd></div><div><dt>Vaqt</dt><dd>{summary.minutes || draft.minutes} daqiqa</dd></div><div><dt>Rejim</dt><dd>{(summary.mode || draft.mode) === "exam" ? "Imtihon" : "Mashq"}</dd></div><div><dt>Bazada mavjud</dt><dd>{summary.available_count ?? "—"} savol</dd></div></dl>
    <ul>{(summary.topics || selectedTopics).map((topic) => <li key={topic.topic_code}>{topic.subject_name ? `${topic.subject_name}: ` : ""}{topicTitle(topic)}{summary.allocation?.find((entry) => entry.topic_code === topic.topic_code)?.count != null ? ` — ${summary.allocation.find((entry) => entry.topic_code === topic.topic_code).count} savol` : ""}</li>)}</ul>
    <p className="ka-hint">{selectedSubjects.map(([code, name]) => `${name}: ${summary.subject_points?.[code] ?? draft.subject_points?.[code] ?? 1} ball`).join(" · ")}</p>
    <button type="button" className="ka-primary ka-full" disabled={interactionDisabled || plan.fingerprint !== draftFingerprint(draft)} onClick={start}>{busy === "create" ? "Test tayyorlanmoqda…" : "Tasdiqlayman — testni boshlash"}</button>
    {tab === "chat" && <button type="button" className="ka-link" onClick={() => setTab("plan")}>Shartlarni o‘zgartirish</button>}
  </div>;

  if (!open || !token) return null;
  return <section ref={panelRef} id="kabutar-assistant-panel" className={`ka-panel ${wide ? "ka-wide" : ""}`}
    role="dialog" aria-modal="false" aria-labelledby="ka-title">
    <header className="ka-header">
      <span className="ka-avatar"><KabutarRobot /></span>
      <div><h2 id="ka-title">Sizning yordamchingiz</h2><p><span className="ka-presence-dot" />{engine === "guided" ? "Bosqichma-bosqich yordam" : engine === "assisted" ? "Suhbat · mavzu · bilim" : "Birga topamiz, birga mashq qilamiz"}</p></div>
      <button type="button" className="ka-icon-button ka-expand" aria-label={wide ? "Kichraytirish" : "Kengaytirish"} onClick={() => setWide((current) => !current)}>{wide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
      <button ref={closeRef} type="button" className="ka-icon-button" onClick={close} aria-label="Yordamchini yopish; suhbat saqlanadi"><X size={21} /></button>
    </header>
    {readOnly && <p className="ka-readonly">Ko‘rish rejimi: bu profil nomidan test yaratish yoki javob saqlash o‘chirilgan.</p>}
    <nav className="ka-tabs" aria-label="Yordamchi bo‘limlari">
      <button type="button" aria-pressed={tab === "chat"} onClick={() => setTab("chat")}><MessageCircle size={15} />Suhbat</button>
      <button type="button" aria-pressed={tab === "plan"} onClick={() => setTab("plan")}><BookOpen size={15} />Test rejasi <span>{draft.topic_codes?.length || 0}</span></button>
      {attempt && <button type="button" aria-pressed={tab === "attempt"} onClick={() => setTab("attempt")}>{result ? "Natija" : "Test"}{!result && <span>{formatAssistantTime(seconds)}</span>}</button>}
    </nav>
    {!recoveryChecked && !readOnly && <div className="ka-recovery" role="status">{busy === "recover" ? "Saqlangan test tekshirilmoqda…" : <>Oldingi testni tekshirish uchun <button className="ka-link" type="button" onClick={() => { setError(""); setRecoveryRetry((current) => current + 1); }}>qayta urinib ko‘ring</button>.</>}</div>}
    {(error || voice.error) && <div className="ka-alert" role="alert"><span>{error || voice.error}</span><button type="button" className="ka-icon-button" aria-label="Xabarni yopish" onClick={() => { setError(""); voice.stop(); }}><X size={16} /></button></div>}
    {tab === "chat" && <>
      <div className="ka-chat-scroll" ref={conversationRef}>
        <div className="ka-conversation" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((message) => <article key={message.id} className={`ka-message ka-message-${message.role}`}>
            <span className="ka-message-label">{message.role === "assistant" ? "Yordamchi" : "Siz"}</span>
            <p><AssistantText text={message.text} /></p>
            {message.role === "assistant" && <button type="button" className="ka-speak" onClick={() => voice.speak(message.id, message.text)} aria-label={voice.id === message.id ? "Ovozli o‘qishni to‘xtatish" : "Xabarni ovozli o‘qish"}>
              {voice.id === message.id ? <Square size={14} /> : <Volume2 size={15} />} {voice.id === message.id ? (voice.status === "loading" ? "Ovoz tayyorlanmoqda…" : "To‘xtatish") : "O‘qib berish"}
            </button>}
          </article>)}
        </div>
        {!attempt && choices.length > 0 && <div className="ka-choices"><h3>Qaysi mavzularni nazarda tutdingiz?</h3><p>Keraklilarini belgilang, keyin rejasini tekshiring.</p>
          {choices.map((topic) => <TopicChoice key={topic.topic_code} topic={topic} checked={draft.topic_codes?.includes(String(topic.topic_code)) || false} onChange={(checked) => toggleTopic(topic, checked)} disabled={Boolean(busy) || readOnly || !recoveryChecked} />)}
          <button type="button" className="ka-primary" disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={() => ask("")}>Tanlanganlar bilan davom etish</button>
        </div>}
        {busy === "plan" && <p className="ka-status" role="status">So‘rov va bazadagi mavzular tekshirilmoqda…</p>}
        {!attempt && !plan && !choices.length && <div className="ka-suggestions" aria-label="Davom etish uchun tanlang">
          {suggestions.map((item) => <button type="button" key={item.message} disabled={interactionDisabled} onClick={() => ask(item.message)}>{item.label}<ChevronRight size={15} /></button>)}
          <button type="button" className="ka-browse" disabled={interactionDisabled} onClick={() => setTab("plan")}><Search size={15} />Mavzularni ro‘yxatdan tanlash</button>
        </div>}
        {!attempt && confirmation}
        {attempt && <div className="ka-note">{result ? "Test tugadi. Natijani ko‘rishingiz yoki yangi reja tuzishingiz mumkin." : "Testingiz davom etmoqda. Yordamchini yopish vaqtni to‘xtatmaydi."}<button type="button" className="ka-link" onClick={() => setTab("attempt")}>{result ? "Natijaga o‘tish" : "Testga qaytish"}</button>{result && <button type="button" className="ka-primary" onClick={newConversation}>Yangi suhbat va mashq</button>}</div>}
      </div>
      <form className="ka-compose" onSubmit={(event) => { event.preventDefault(); if (input.trim()) ask(); }}>
        <label className="ka-sr-only" htmlFor="ka-message-input">Yordamchiga yozing</label>
        <textarea id="ka-message-input" value={input} rows={1} maxLength={2000} disabled={Boolean(busy) || Boolean(attempt) || readOnly || !recoveryChecked}
          placeholder={attempt ? (result ? "Yangi suhbat uchun quyidagi tugmani bosing" : "Testingiz davom etmoqda") : "Yozing… Masalan: kasrlarni mashq qilmoqchiman"} onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (input.trim()) ask(); } }} />
        <button type="submit" className="ka-send" aria-label="Xabarni yuborish" disabled={!input.trim() || Boolean(busy) || Boolean(attempt) || readOnly || !recoveryChecked}><Send size={19} /></button>
        <small>{engine === "guided" ? "Hozir tayyor savollar va tanlovlar bilan yordam beraman." : "Mavzu noaniq bo‘lsa, birga aniqlashtiramiz."} Shift + Enter — yangi qator.</small>
      </form>
    </>}
    {tab === "plan" && <div className="ka-body">
      {attempt ? <div className="ka-note">Joriy testning rejasi saqlangan. {result ? "Yangi test uchun natija bo‘limidan yangi reja oching." : "Rejani o‘zgartirish uchun avval testni yakunlang."}<button type="button" className="ka-primary" onClick={() => setTab("attempt")}>{result ? "Natijani ko‘rish" : "Testga qaytish"}</button></div> : <>
        <div className="ka-section-title"><span className="ka-step">1</span><div><h3>Mavzularni topamiz</h3><p>Faqat bazada bor mavzular tanlanadi.</p></div></div>
        <div className="ka-fields ka-fields-three">
          <label>Sinf<select value={draft.grade || ""} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => { editDraft({ grade: event.target.value ? Number(event.target.value) : null, topic_codes: [], subject_points: {}, quarter: null }); setFilters({ query: "", subject: "", quarter: "" }); setChoices([]); }}>
            <option value="">Sinfni tanlang</option>{Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}-sinf</option>)}
          </select></label>
          <label>Fan<select value={filters.subject} onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}><option value="">Barcha fanlar</option>{catalog.subjects.map((subject) => <option key={subject.code} value={subject.code}>{subject.name}</option>)}</select></label>
          <label>Chorak<select value={filters.quarter} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => { const quarter = event.target.value; setFilters((current) => ({ ...current, quarter })); editDraft({ quarter: quarter ? Number(quarter) : null, topic_codes: [], subject_points: {} }); setChoices([]); }}><option value="">Barcha choraklar</option>{[1, 2, 3, 4].map((quarter) => <option key={quarter} value={quarter}>{quarter}-chorak</option>)}</select></label>
        </div>
        <label className="ka-search"><Search size={18} /><input value={filters.query} maxLength={120} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Mavzu nomidan izlang" aria-label="Mavzularni izlash" /></label>
        {selectedTopics.length > 0 && <div className="ka-selected"><strong>{selectedTopics.length} ta mavzu tanlandi</strong><div>{selectedTopics.map((topic) => <button type="button" key={topic.topic_code} disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={() => toggleTopic(topic, false)} title="Tanlovdan olib tashlash">{topicTitle(topic)}<X size={13} /></button>)}</div></div>}
        <div className="ka-topic-list" aria-busy={catalogBusy}>
          {catalogBusy ? <p className="ka-status">Mavzular qidirilmoqda…</p> : catalog.topics.length ? catalog.topics.map((topic) => <TopicChoice key={topic.topic_code} topic={topic} checked={draft.topic_codes?.includes(String(topic.topic_code)) || false} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(checked) => toggleTopic(topic, checked)} />) : <p className="ka-empty">{draft.grade ? "Bu tanlov bo‘yicha mavzu topilmadi. Sinf, fan yoki qidiruv so‘zini o‘zgartiring." : "Mavzularni ko‘rish uchun avval sinfni tanlang."}</p>}
        </div>
        {catalog.truncated && <p className="ka-hint">Dastlabki 100 ta mos mavzu ko‘rsatildi. Fan, chorak yoki mavzu nomi bilan qidiruvni aniqlashtiring.</p>}
        <div className="ka-section-title"><span className="ka-step">2</span><div><h3>Test shartlari</h3><p>Savollar soni va vaqti oldindan aniq bo‘ladi.</p></div></div>
        <div className="ka-fields">
          <label>Savollar soni<input type="number" min="10" max="100" step="1" value={draft.question_count ?? ""} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => editDraft({ question_count: event.target.value === "" ? null : Number(event.target.value) })} /></label>
          <label>Qiyinlik<select value={draft.difficulty || ""} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => editDraft({ difficulty: event.target.value })}>{Object.entries(DIFFICULTIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Umumiy vaqt, daqiqa<input type="number" min="5" max="180" step="1" value={draft.minutes ?? ""} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => editDraft({ minutes: event.target.value === "" ? null : Number(event.target.value) })} /></label>
          <label>Test turi<select value={draft.mode || "practice"} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => editDraft({ mode: event.target.value })}><option value="practice">Mashq</option><option value="exam">Imtihon</option></select></label>
        </div>
        <p className="ka-hint">Sinf yoki chorakni o‘zgartirsangiz, mavzularni qayta tanlaysiz.</p>
        <p className="ka-hint">{draft.mode === "exam" ? "Imtihon vaqti tugaganda javoblar topshiriladi. Natija yakunda ochiladi." : "Mashqda shoshilmasdan ishlaysiz. Javoblar va natija yakunda ochiladi."}</p>
        {selectedSubjects.length > 0 && <details className="ka-details"><summary>Fanlar bo‘yicha ball</summary><p>Har bir to‘g‘ri javob uchun beriladigan ball.</p><div className="ka-fields">{selectedSubjects.map(([code, name]) => <label key={code}>{name}<input type="number" min="0.1" max="10" step="0.1" value={draft.subject_points?.[code] ?? 1} disabled={Boolean(busy) || readOnly || !recoveryChecked} onChange={(event) => editDraft({ subject_points: { ...draft.subject_points, [code]: Number(event.target.value) } })} /></label>)}</div></details>}
        <button type="button" className="ka-primary ka-full" disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={() => ask("")}>{busy === "plan" ? "Tekshirilmoqda…" : "Rejani tekshirish va ko‘rish"}<ChevronRight size={18} /></button>
        {confirmation}
      </>}
    </div>}
    {tab === "attempt" && attempt && <div className="ka-body">
      {!result ? <>
        <div className="ka-attempt-heading"><div><span className="ka-eyebrow">{attempt.mode === "exam" ? "IMTIHON" : "MASHQ"}</span><h3>{answered}/{questions.length} ta javob belgilandi</h3></div><span className={`ka-clock ${seconds != null && seconds < 60 ? "is-ending" : ""}`}><span>{attempt.mode === "exam" ? "Qolgan vaqt" : "Rejalangan vaqt"}</span>{formatAssistantTime(seconds)}</span></div>
        <p className="ka-hint">Yordamchini yopish testni to‘xtatmaydi. Javoblar serverga saqlanadi.</p>
        <div className="ka-question-nav" aria-label="Savollar bo‘yicha o‘tish">{questions.map((item, number) => <button type="button" key={item.id} aria-label={`${number + 1}-savol${answers[item.id] ? ", javob berilgan" : ""}`} aria-current={index === number ? "step" : undefined} className={answers[item.id] ? "is-answered" : ""} onClick={() => setIndex(number)}>{number + 1}</button>)}</div>
        {question && <div className="ka-question-card"><span className="ka-eyebrow">{index + 1}-SAVOL · {question.points ?? 1} BALL</span><h3><AssistantText text={question.question || question.savol} /></h3>
          {questionImage && <img className="ka-question-image" src={questionImage} alt="Savolga oid rasm" loading="lazy" />}
          {question.rasm_id && !questionImage && <AssistantText text={`[lat]${question.rasm_id}[/lat]`} />}
          {options.length ? <fieldset className="ka-answers"><legend className="ka-sr-only">Javobni tanlang</legend>{options.map((option) => <label className={`ka-answer ${answers[questionId] === option.value ? "is-chosen" : ""}`} key={option.value}><input type="radio" name={`ka-answer-${questionId}`} value={option.value} checked={answers[questionId] === option.value} disabled={Boolean(busy) || examExpired || readOnly} onChange={() => setAnswers((current) => ({ ...current, [questionId]: option.value }))} /><span className="ka-option-letter">{option.value}</span><AssistantText text={option.text} /></label>)}</fieldset>
            : <label className="ka-text-answer">Javobingiz<textarea value={answers[questionId] || ""} maxLength={1000} rows={3} disabled={Boolean(busy) || examExpired || readOnly} onChange={(event) => setAnswers((current) => ({ ...current, [questionId]: event.target.value }))} /></label>}
          <div className="ka-run-navigation"><button type="button" className="ka-secondary" disabled={index === 0} onClick={() => setIndex((current) => current - 1)}><ChevronLeft size={17} />Oldingi</button><button type="button" className="ka-secondary" disabled={index >= questions.length - 1} onClick={() => setIndex((current) => current + 1)}>Keyingi<ChevronRight size={17} /></button></div>
        </div>}
        <div className={`ka-save-status ${saveState === "error" ? "is-error" : ""}`} role="status">{saveState === "error" ? <>Javoblar hali saqlanmadi. <button type="button" className="ka-link" onClick={saveProgress}>Qayta saqlash</button></> : saveState === "saving" || saveState === "pending" ? "Javoblar saqlanmoqda…" : saveState === "saved" ? "Javoblar saqlandi" : "Javobingizni belgilang"}</div>
        {examExpired && <div className="ka-note">Imtihon vaqti tugadi. {busy === "submit" ? "Natija olinmoqda…" : "Natijani olish uchun yakunlash tugmasini bosing."}</div>}
        {!finishConfirm && !examExpired ? <button type="button" className="ka-primary ka-full" disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={() => setFinishConfirm(true)}>Testni yakunlash</button> : <div className="ka-confirm"><h3>{examExpired ? "Natijani olish" : "Testni topshirasizmi?"}</h3><p>{questions.length - answered ? `${questions.length - answered} ta savol javobsiz qoldi. ` : "Barcha savollarga javob berdingiz. "}Topshirilgach javoblarni o‘zgartirib bo‘lmaydi.</p><div className="ka-actions"><button type="button" className="ka-primary" disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={submit}>{busy === "submit" ? "Tekshirilmoqda…" : "Yakunlash va natija"}</button>{!examExpired && <button type="button" className="ka-secondary" disabled={Boolean(busy) || readOnly || !recoveryChecked} onClick={() => setFinishConfirm(false)}>Davom etish</button>}</div></div>}
      </> : <>
        <div className="ka-result"><span className="ka-result-icon"><Check size={28} /></span><span className="ka-eyebrow">TEST YAKUNLANDI</span><h3>{result.score ?? 0} <small>/ {result.max_score ?? questions.length} ball</small></h3><p>{result.correct ?? 0}/{result.total ?? questions.length} ta to‘g‘ri javob</p><p className="ka-result-guidance">{assistantResultSummary(result)}</p>{result.message && <p className="ka-hint">{result.message}</p>}</div>
        {result.subjects?.length > 0 && <div className="ka-subject-results"><table><caption>Fanlar bo‘yicha natija</caption><thead><tr><th>Fan</th><th>To‘g‘ri</th><th>Ball</th></tr></thead><tbody>{result.subjects.map((subject, number) => <tr key={subject.subject_code || number}><td>{subject.subject_name}</td><td>{subject.correct}/{subject.total}</td><td>{Number(subject.score || 0).toFixed(1)} / {Number(subject.max_score || 0).toFixed(1)}</td></tr>)}</tbody></table></div>}
        <div className="ka-review">{(result.review || []).map((item, number) => {
          const original = questions.find((entry) => String(entry.id) === String(item.question_id ?? item.id));
          const given = item.given ?? item.answer ?? item.user_answer ?? answers[original?.id];
          return <details key={item.question_id ?? item.id ?? number} className="ka-details"><summary>{item.correct || item.is_correct ? "✓" : "↻"} {number + 1}-savol <span>{item.correct || item.is_correct ? "To‘g‘ri" : "Qayta ko‘rib chiqing"}</span></summary><p><AssistantText text={item.question || original?.question || ""} /></p><p>Sizning javobingiz: <strong>{String(given ?? "").trim() || "Javob berilmagan"}</strong></p>{item.correct_answer != null && <p>To‘g‘ri javob: <strong>{item.correct_answer}</strong></p>}{item.explanation && <p><AssistantText text={item.explanation} /></p>}</details>;
        })}</div>
        <button type="button" className="ka-primary ka-full" onClick={newConversation}><MessageCircle size={17} />Yangi suhbat va mashq</button>
      </>}
      <section className="ka-pdf-export" aria-label="Testni PDF ko‘rinishida yuklash">
        <div><FileText size={21} /><span><strong>Qog‘ozda ham mashq qiling</strong><small>Savollar va javob kaliti alohida PDF faylda.</small></span></div>
        <div className="ka-actions"><button type="button" className="ka-secondary" disabled={interactionDisabled} onClick={() => download("pdf")}><Download size={16} />{busy === "download-pdf-false" ? "PDF tayyorlanmoqda…" : "PDF — savollar"}</button>
          {keysAllowed && <button type="button" className="ka-secondary" disabled={interactionDisabled} onClick={() => download("pdf", true)}><Download size={16} />{busy === "download-pdf-true" ? "Kalit tayyorlanmoqda…" : "PDF — javob kaliti"}</button>}</div>
        {!keysAllowed && <p className="ka-hint">Javoblaringizni test yakunida ko‘rasiz. Alohida kalit o‘qituvchi yoki administrator uchun.</p>}
      </section>
    </div>}
    <footer className="ka-footer">{attempt && !result ? "Yopilganda ham imtihon vaqti davom etadi." : "Yopib-ochsangiz, shu seansdagi suhbat saqlanadi."}</footer>
  </section>;
}
