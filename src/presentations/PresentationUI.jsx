import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, MonitorPlay, X } from 'lucide-react';
import { DEFAULT_DESIGN, makeProject } from './model.js';
import { LAYOUTS, TEMPLATES, getFamily, getLayout } from './layouts.js';
import SlidePreview from './SlidePreview.jsx';

const focusable = root => Array.from(root?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]') || []).filter(node => node.getClientRects().length && window.getComputedStyle(node).visibility !== 'hidden' && window.getComputedStyle(node).opacity !== '0');

/** Body portal escapes the host app's sticky header and all ancestor stacking contexts. */
export function OverlayPortal({ children, onClose, onKeyDown, className = '', panelRef, label, labelledBy, backdrop = false }) {
  useKbInterfaceLocale();
  const ownRef = useRef(null);
  const handlers = useRef({ onClose, onKeyDown });
  handlers.current = { onClose, onKeyDown };
  useEffect(() => {
    const root = ownRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children).filter(node => node !== root).map(node => [node, node.inert]);
    siblings.forEach(([node]) => { node.inert = true; });
    document.body.style.overflow = 'hidden';
    (root?.querySelector('[data-overlay-close]') || focusable(root)[0] || root)?.focus();
    const keys = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); handlers.current.onClose?.(); return; }
      if (event.key === 'Tab') {
        const items = focusable(root);
        if (!items.length) { event.preventDefault(); root?.focus(); return; }
        const index = items.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
        else if (!event.shiftKey && (index < 0 || index === items.length - 1)) { event.preventDefault(); items[0].focus(); }
      } else handlers.current.onKeyDown?.(event);
    };
    document.addEventListener('keydown', keys, true);
    return () => {
      document.removeEventListener('keydown', keys, true);
      document.body.style.overflow = previousOverflow;
      siblings.forEach(([node, wasInert]) => { node.inert = wasInert; });
      if (document.fullscreenElement === root) document.exitFullscreen?.().catch(() => {});
      if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
    };
  }, []);
  return createPortal(<div ref={node => { ownRef.current = node; if (panelRef) panelRef.current = node; }} className={`ps49-studio ps50-portal ${className}`} role="dialog" aria-modal="true" aria-label={__kbUi(label)} aria-labelledby={labelledBy} tabIndex={-1} onMouseDown={event => { if (backdrop && event.target === event.currentTarget) onClose?.(); }}>{children}</div>, document.body);
}

export function StudioDialog({ title, eyebrow, children, onClose, actions, className = '' }) {
  useKbInterfaceLocale();
  const titleId = useId();
  return <OverlayPortal className="ps49-modal-backdrop" onClose={onClose} labelledBy={titleId} backdrop><section className={`ps49-modal ${className}`}><header className="ps49-modal-heading"><div>{eyebrow && <p className="ps49-eyebrow">{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div><button type="button" className="ps49-button" data-overlay-close onClick={onClose}><X size={18} />{__kbUi("Yopish")}</button></header><div className="ps50-modal-body">{children}</div><footer className="ps49-modal-actions"><button type="button" className="ps49-button" onClick={onClose}>{__kbUi("Yopish")}</button>{__kbUi(actions)}</footer></section></OverlayPortal>;
}

function demoImage(second = false) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 360; canvas.height = 250;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const gradient = ctx.createLinearGradient(0, 0, 360, 250);
  gradient.addColorStop(0, second ? '#ebe2fb' : '#ddf0eb');
  gradient.addColorStop(1, second ? '#a191c9' : '#63aaa0');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 360, 250);
  ctx.fillStyle = '#fff5d9'; ctx.beginPath(); ctx.arc(265, 65, 29, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = second ? '#8879af' : '#53948f'; ctx.beginPath(); ctx.moveTo(0, 205); ctx.lineTo(120, 65); ctx.lineTo(300, 250); ctx.lineTo(0, 250); ctx.fill();
  ctx.fillStyle = second ? '#514777' : '#285b66'; ctx.beginPath(); ctx.moveTo(100, 250); ctx.lineTo(245, 110); ctx.lineTo(360, 220); ctx.lineTo(360, 250); ctx.fill();
  return canvas.toDataURL('image/png');
}

function TemplateCard({ template, selected, onSelect }) {
  useKbInterfaceLocale();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timers = useRef([]);
  const doc = useMemo(() => makeProject({
    title: 'Bilimdan amaliyotga', design: { ...DEFAULT_DESIGN, ...template.defaults, template: template.id },
    slides: (template.previewLayouts || ['cover', 'two_columns', 'image']).slice(0, 3).map((layout, index) => ({
      id: `preview-${template.id}-${index}`, layout, section: ['Kirish', 'O‘rganish', 'Amaliyot'][index],
      title: ['Bilimdan amaliyotga', 'Ikki fikrni taqqoslang', 'Natijani birga yarating'][index],
      body: 'Asosiy fikrni aniq va sodda tushuntiring.', body2: getLayout(layout).textCount > 1 ? 'Misollar orqali mavzuni ochib bering.' : '', body3: getLayout(layout).textCount > 2 ? 'Bilimni amalda qo‘llab ko‘ring.' : '',
      image: getLayout(layout).imageCount > 0 ? demoImage() : null, image2: getLayout(layout).imageCount > 1 ? demoImage(true) : null,
      image_caption: getLayout(layout).imageCount > 0 ? 'Tabiatdagi shakllar' : '', image2_caption: getLayout(layout).imageCount > 1 ? 'Rang va uyg‘unlik' : '', formula: '', example: '',
    })),
  }), [template]);
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; setPlaying(false); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = (explicit = false) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { if (explicit) setFrame(value => (value + 1) % doc.slides.length); return; }
    stop(); setFrame(0); setPlaying(true);
    timers.current = [setTimeout(() => setFrame(1), 1800), setTimeout(() => setFrame(2), 3600), setTimeout(() => setPlaying(false), 5400)];
  };
  return <article className={`ps50-template-card${selected ? ' is-selected' : ''}`} onMouseEnter={() => play()} onMouseLeave={stop} onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) play(); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) stop(); }}>
    <button type="button" className="ps50-template-select" aria-label={__kbUi(`${template.label} maketini tanlash`)} aria-pressed={selected} onClick={() => onSelect(template)}><div className="ps50-template-preview"><SlidePreview document={doc} index={frame} thumbnail transition={playing} /></div><span className="ps50-template-name">{__kbUi(template.label)}{selected && <Check size={17} />}</span><span className="ps50-template-description">{template.description}</span></button>
    <div className="ps50-template-bottom"><span aria-hidden="true">{[0, 1, 2].map(index => <i key={index} className={index === frame ? 'is-active' : ''} />)}</span><button type="button" className="ps49-text-button" onClick={() => play(true)} aria-label={__kbUi(`${template.label}: 3 ko‘rinish namoyishi`)}><MonitorPlay size={15} />{playing ? __kbUi('Ko‘rsatilmoqda') : __kbUi('3 ko‘rinish')}</button></div>
  </article>;
}

export function TemplateGallery({ value, onSelect, templates = TEMPLATES }) {
  useKbInterfaceLocale();
  return <div className="ps50-template-gallery" aria-label={__kbUi("Taqdimot oilalari")}>{templates.map(template => <TemplateCard key={template.id} template={template} selected={getFamily(value).id === template.id} onSelect={onSelect} />)}</div>;
}

export function LayoutPicker({ value, onChange }) {
  useKbInterfaceLocale();
  return <div className="ps49-field"><span className="ps49-label">{__kbUi("Slayd joylashuvi va maydonlar soni")}</span><div className="ps50-layout-picker" role="group" aria-label={__kbUi("Slayd joylashuvi")}>{LAYOUTS.map(layout => <button type="button" key={layout.id} aria-pressed={value === layout.id} className={value === layout.id ? 'is-active' : ''} onClick={() => onChange(layout.id)}><span className={`ps50-layout-icon is-${layout.id}`} aria-hidden="true">{__kbUi(Array.from({ length: layout.textCount }, (_, i) => <i key={`text${i}`} />))}{__kbUi(Array.from({ length: layout.imageCount }, (_, i) => <b key={`image${i}`} />))}</span><strong>{__kbUi(layout.label)}</strong><small>{layout.textCount}{__kbUi(" matn · ")}{layout.imageCount}{__kbUi(" rasm")}{layout.id === 'cover' ? __kbUi(' (ixtiyoriy)') : __kbUi('')}</small></button>)}</div><p className="ps49-help">{__kbUi("Joylashuvni almashtirish yashirin maydonlardagi matn va rasmlarni saqlaydi.")}</p></div>;
}
