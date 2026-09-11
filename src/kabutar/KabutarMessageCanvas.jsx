import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CornerDownRight, MessageSquare, Sparkles } from "lucide-react";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import { canvasDays, canvasGeometry, canvasMessageDay, canvasMessages, canvasMessageText, canvasPage } from "./kabutarCanvasRules.js";
import "./kabutarMessageCanvas.css";

function displayDay(day, locale, t, short = false) {
  if (day === "unknown") return t("Sana ko‘rsatilmagan");
  const today = canvasMessageDay({ yaratilgan_at: new Date() });
  if (day === today) return t("Bugun");
  const [year, month, date] = String(day).split("-").map(Number);
  const value = new Date(year, month - 1, date, 12);
  if (Number.isNaN(value.getTime())) return t("Sana tanlang");
  try { return value.toLocaleDateString(locale || "uz-UZ", { day: "numeric", month: short ? "short" : "long" }); }
  catch { return value.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }); }
}

function messageTime(message, locale) {
  const value = new Date(message?.yaratilgan_at ?? message?.created_at ?? message?.sana ?? "");
  if (Number.isNaN(value.getTime())) return "";
  try { return value.toLocaleTimeString(locale || "uz-UZ", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export default function KabutarMessageCanvas({ messages = [], selectedId, onSelect, layout = "keyboard", height = 30, showPreviews = true }) {
  const { t, locale } = useInterface();
  const rows = useMemo(() => canvasMessages(messages), [messages]);
  const days = useMemo(() => canvasDays(rows), [rows]);
  const [day, setDay] = useState(() => canvasMessageDay(messages.find(message => String(message.id) === String(selectedId)) || messages[messages.length - 1] || { yaratilgan_at: new Date() }));
  const [anchorId, setAnchorId] = useState(() => messages.some(message => String(message.id) === String(selectedId)) ? selectedId : null);
  const [previewId, setPreviewId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [shortViewport, setShortViewport] = useState(() => typeof window !== "undefined" && (window.visualViewport?.height || window.innerHeight) < 500);
  const [containerBudget, setContainerBudget] = useState(null);
  const [size, setSize] = useState({ width: 680, height: 144 });
  const canvas = useRef(null);
  const stage = useRef(null);
  const buttons = useRef(new Map());
  const lastSelected = useRef(selectedId);
  const initialDayLoaded = useRef(rows.length > 0);
  const uniqueId = useId();
  const previewLabel = `${uniqueId}-preview`;
  const headingId = `${uniqueId}-heading`;
  const contentId = `${uniqueId}-content`;
  const constrained = shortViewport || (containerBudget != null && containerBudget < 150);
  const isCollapsed = collapsed || constrained;
  const compactCanvas = !isCollapsed && containerBudget != null && containerBudget < 214;
  const geometry = useMemo(() => canvasGeometry(size.width, size.height, layout), [size, layout]);
  const dayMessages = useMemo(() => rows.filter(message => canvasMessageDay(message) === day), [rows, day]);
  const page = useMemo(() => canvasPage(dayMessages, anchorId, geometry.capacity), [dayMessages, anchorId, geometry.capacity]);
  const preview = showPreviews ? page.items.find(message => String(message.id) === String(previewId)) : null;
  const recentDays = useMemo(() => {
    const result = days.slice(-4);
    if (day && !result.includes(day)) result.unshift(day);
    return result;
  }, [days, day]);

  useEffect(() => {
    const check = () => setShortViewport((window.visualViewport?.height || window.innerHeight) < 500);
    check();
    window.addEventListener("resize", check);
    window.visualViewport?.addEventListener("resize", check);
    return () => { window.removeEventListener("resize", check); window.visualViewport?.removeEventListener("resize", check); };
  }, []);

  useEffect(() => {
    const node = canvas.current;
    const conversation = node?.closest?.(".kb-chat-conversation");
    if (!conversation) return undefined;
    let resize;
    const fixedChildren = () => Array.from(conversation.children || []).filter(child => child !== node && !child.matches?.(".kb-chat-messages"));
    const outerHeight = element => {
      const style = typeof window.getComputedStyle === "function" ? window.getComputedStyle(element) : null;
      return Number(element.getBoundingClientRect?.().height || element.offsetHeight || element.clientHeight || 0)
        + (Number.parseFloat(style?.marginTop) || 0) + (Number.parseFloat(style?.marginBottom) || 0);
    };
    const measure = () => {
      const available = Number(conversation.clientHeight);
      if (!available) return; // A hidden conversation is measured when shown again.
      const used = fixedChildren().reduce((sum, child) => sum + outerHeight(child), 0);
      const style = typeof window.getComputedStyle === "function" ? window.getComputedStyle(node) : null;
      const margins = style ? (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0) : 18;
      // A 768px laptop still gets a compact, paged tile row. Reserve real
      // reading space and fold only when even that row can no longer fit.
      const readerReserve = available < 640 ? 128 : 160;
      const next = Math.max(0, Math.floor(available - used - margins - readerReserve));
      setContainerBudget(old => old === next ? old : next);
    };
    const observe = () => {
      resize?.disconnect();
      if (resize) { resize.observe(conversation); fixedChildren().forEach(child => resize.observe(child)); }
      measure();
    };
    if (typeof ResizeObserver !== "undefined") resize = new ResizeObserver(measure);
    observe();
    // A discussion bar or reply banner may be inserted without resizing its parent.
    const mutation = typeof MutationObserver !== "undefined" ? new MutationObserver(observe) : null;
    mutation?.observe(conversation, { childList: true });
    window.addEventListener("resize", measure);
    return () => { resize?.disconnect(); mutation?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    if (initialDayLoaded.current || !rows.length) return;
    initialDayLoaded.current = true;
    const initiallySelected = rows.find(message => String(message.id) === String(selectedId));
    const initialMessage = initiallySelected || rows[rows.length - 1];
    setDay(canvasMessageDay(initialMessage));
    setAnchorId(initiallySelected?.id ?? null);
  }, [rows, selectedId]);

  useEffect(() => {
    const node = stage.current;
    if (!node) return undefined;
    const measure = () => {
      const next = { width: Math.round(node.clientWidth), height: Math.round(node.clientHeight) };
      if (next.width && next.height) setSize(old => old.width === next.width && old.height === next.height ? old : next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isCollapsed]);

  useEffect(() => {
    // Freeze the first visible message once loaded. Polling may append new messages,
    // but cannot unexpectedly move the page somebody is reading.
    if (anchorId == null && page.items[0]) setAnchorId(page.items[0].id);
  }, [anchorId, page.items]);

  useEffect(() => {
    if (String(lastSelected.current) === String(selectedId)) return;
    const selected = rows.find(message => String(message.id) === String(selectedId));
    if (!selected) return;
    lastSelected.current = selectedId;
    const nextDay = canvasMessageDay(selected);
    if (nextDay !== day) { setDay(nextDay); setAnchorId(selected.id); }
    else if (!page.items.some(message => String(message.id) === String(selectedId))) setAnchorId(selected.id);
    setPreviewId(null);
  }, [selectedId, rows, day, page.items]);

  useEffect(() => {
    if (previewId != null && !page.items.some(message => String(message.id) === String(previewId))) setPreviewId(null);
  }, [page.items, previewId]);

  const chooseDay = nextDay => { setDay(nextDay); setAnchorId(null); setPreviewId(null); };
  const chooseMessage = message => { setPreviewId(null); onSelect?.(message); };
  const messageSummary = message => message.earlierThread ? t("Oldingi muhokama") : showPreviews ? (message.matn ? canvasMessageText(message) : t(canvasMessageText(message))) : t("Xabarni ochish");
  const changePage = id => { setAnchorId(id); setPreviewId(null); };
  const showLatest = () => {
    const latestDay = days[days.length - 1];
    if (latestDay) chooseDay(latestDay);
  };
  const moveFocus = (event, index) => {
    const positions = geometry.cells;
    const current = positions[index];
    let next = index;
    if (event.key === "ArrowRight") next += 1;
    else if (event.key === "ArrowLeft") next -= 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = page.items.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const candidates = positions.slice(0, page.items.length).map((cell, i) => ({ ...cell, i }))
        .filter(cell => (cell.row - current.row) * direction > 0)
        .sort((a, b) => Math.abs(a.row - current.row) - Math.abs(b.row - current.row) || Math.abs(a.column - current.column) - Math.abs(b.column - current.column));
      next = candidates[0]?.i ?? index;
    } else if (event.key === "Escape") { setPreviewId(null); return; }
    else return;
    event.preventDefault();
    const target = page.items[Math.max(0, Math.min(page.items.length - 1, next))];
    buttons.current.get(String(target?.id))?.focus();
  };

  return <section ref={canvas} className={`kb-canvas${isCollapsed ? " kb-canvas--collapsed" : ""}${compactCanvas ? " kb-canvas--compact" : ""}`} aria-labelledby={headingId} style={{ "--kb-canvas-vh": [20, 30, 40].includes(Number(height)) ? Number(height) : 30, "--kb-canvas-maxheight": containerBudget == null ? "430px" : `${Math.max(150, containerBudget)}px` }}>
    <header className="kb-canvas-header">
      <div className="kb-canvas-heading"><span className="kb-canvas-mark"><Sparkles size={16}/></span><div><h3 id={headingId}>{t("Xabarlar maydoni")}</h3><p>{t(constrained ? "Kichik ekranda o‘qish uchun joy saqlandi" : "Xabarni tanlang — pastda to‘liq ochiladi")}</p></div></div>
      <div className="kb-canvas-header-actions">{isCollapsed && <select className="kb-canvas-compact-select" aria-label={t("Xabarni tanlang")} value={rows.some(message => String(message.id) === String(selectedId)) ? String(selectedId) : ""} onChange={event => { const message = rows.find(row => String(row.id) === event.target.value); if (message) chooseMessage(message); }}><option value="" disabled>{t("Xabarni tanlang")} · {rows.length}</option>{[...rows].reverse().map(message => <option key={message.id} value={String(message.id)}>{displayDay(canvasMessageDay(message), locale, t, true)} · {message.earlierThread ? t("Oldingi muhokama") : `${message.yuboruvchi_ismi || (message.meniki ? t("Siz") : t("Xabar"))} · ${messageSummary(message).slice(0, 65)}`}</option>)}</select>}{!isCollapsed && <button type="button" className="kb-canvas-latest" onClick={showLatest} disabled={!rows.length}>{t("Eng yangi")}<CornerDownRight size={14}/></button>}{!constrained && <button type="button" className="kb-canvas-collapse" aria-expanded={!isCollapsed} aria-controls={contentId} aria-label={t(isCollapsed ? "Xabarlar maydonini ochish" : "Xabarlar maydonini yig‘ish")} onClick={() => { setCollapsed(value => !value); setPreviewId(null); }}>{isCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button>}</div>
    </header>
    <div id={contentId} className="kb-canvas-content" hidden={isCollapsed}>
    <div className="kb-canvas-days">
      <div className="kb-canvas-date-tabs" aria-label={t("Xabarlar sanasi")}>
        {recentDays.map(value => <button type="button" key={value} aria-pressed={value === day} onClick={() => chooseDay(value)}>{displayDay(value, locale, t, true)}</button>)}
      </div>
      <label className="kb-canvas-date-picker"><CalendarDays size={15}/><span className="kb-canvas-sr">{t("Sana tanlang")}</span><input aria-label={t("Sana tanlang")} type="date" value={day === "unknown" ? "" : day} onChange={event => { if (event.target.value) chooseDay(event.target.value); }}/></label>
    </div>
    <div className={`kb-canvas-stage kb-canvas-stage--${geometry.mode}`} ref={stage} onMouseLeave={() => setPreviewId(null)}>
      {page.items.length ? <div className="kb-canvas-grid" style={{ "--kb-canvas-columns": geometry.columns, "--kb-canvas-rows": geometry.rows }}>
        {page.items.map((message, index) => {
          const position = geometry.cells[index];
          const sender = message.earlierThread ? t("Oldingi muhokama") : message.yuboruvchi_ismi || (message.meniki ? t("Siz") : t("Xabar"));
          const summary = message.earlierThread ? t("Ochish") : messageSummary(message);
          const count = Math.max(0, Math.floor(Number(message.reply_count) || 0));
          return <button type="button" key={message.id} className={`kb-canvas-tile${message.meniki && !message.earlierThread ? " kb-canvas-tile--own" : ""}`} style={{ gridRow: position.row, gridColumn: position.column }}
            ref={node => { if (node) buttons.current.set(String(message.id), node); else buttons.current.delete(String(message.id)); }}
            aria-pressed={String(message.id) === String(selectedId)} aria-label={`${sender}: ${summary.slice(0, 180)}`} aria-describedby={String(previewId) === String(message.id) && preview ? previewLabel : undefined}
            onFocus={() => setPreviewId(message.id)} onBlur={() => setPreviewId(null)} onMouseEnter={() => setPreviewId(message.id)} onClick={() => chooseMessage(message)} onKeyDown={event => moveFocus(event, index)}>
            <span className="kb-canvas-tile-author"><span className="kb-canvas-dot"/>{sender}</span><span className="kb-canvas-tile-text">{summary}</span>
            {count > 0 && <span className="kb-canvas-tile-replies" aria-label={`${count} ${t("javob")}`}><MessageSquare size={10}/>{count > 99 ? "99+" : count}</span>}
          </button>;
        })}
      </div> : <div className="kb-canvas-empty"><MessageSquare size={23}/><strong>{t("Bu kunda yuklangan xabar yo‘q")}</strong><span>{t("Boshqa sanani tanlang yoki eski xabarlarni yuklang")}</span></div>}
      {preview && <div className="kb-canvas-preview" id={previewLabel} role="tooltip" onMouseEnter={() => setPreviewId(preview.id)}>
        <div><strong>{preview.earlierThread ? t("Oldingi muhokama") : preview.yuboruvchi_ismi || (preview.meniki ? t("Siz") : t("Xabar"))}</strong>{!preview.earlierThread && <span>{messageTime(preview, locale)}</span>}</div>
        <p>{preview.earlierThread ? t("Oldingi muhokamani ochish") : preview.matn ? String(preview.matn).slice(0, 1000) : t(canvasMessageText(preview))}</p><small>{t("To‘liq o‘qish uchun xabarni bosing")}</small>
      </div>}
    </div>
    <footer className="kb-canvas-footer">
      <span aria-live="polite">{page.items.length ? `${page.start + 1}–${page.end} / ${dayMessages.length}` : `0 / ${dayMessages.length}`} <span className="kb-canvas-footer-label">{t("xabar")}</span>{geometry.adapted && <span className="kb-canvas-adapted"> · {t("Ixcham shakl")}</span>}</span>
      <span className="kb-canvas-page-actions"><button type="button" disabled={!page.before} onClick={() => changePage(page.previousId)} aria-label={t("Oldingi xabarlar")}><ChevronLeft size={16}/></button><button type="button" disabled={!page.after} onClick={() => changePage(page.nextId)} aria-label={t("Keyingi xabarlar")}><ChevronRight size={16}/>{page.after > 0 && <span>{page.after}</span>}</button></span>
    </footer>
    </div>
  </section>;
}
