import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ImagePlus, Move, Plus, RotateCcw, Square, Trash2, Type } from 'lucide-react';
import SlidePreview, { designTokens } from './SlidePreview.jsx';
import { clampPlacement, normalizeImage, placementBounds } from './model.js';
import { getLayoutSpec } from './layouts.js';
import './canvas.css';

const ELEMENT_LIMIT = 12;
const FIELD_LABELS = { title: 'Sarlavha', body: 'Asosiy matn', body2: 'Ikkinchi matn', body3: 'Uchinchi matn', formula: 'Formula', example: 'Misol', image: 'Birinchi rasm', image2: 'Ikkinchi rasm' };
const CUSTOM_LABELS = { text: 'Matn', image: 'Rasm', rect: 'Shakl' };
const geometry = ({ x, y, w, h }) => ({ x, y, w, h });
const positionStyle = item => ({ left: `${item.x / 12.8}%`, top: `${item.y / 7.2}%`, width: `${item.w / 12.8}%`, height: `${item.h / 7.2}%` });
const elementId = () => globalThis.crypto?.randomUUID?.() || `object-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function slideSections(slides) {
  const sections = [];
  slides.forEach((slide, firstIndex) => {
    const label = slide.section || 'Taqdimot';
    if (!sections.some(section => section.label === label)) sections.push({ label, firstIndex });
  });
  return sections;
}

function selectableObjects(slide, spec) {
  if (!slide) return [];
  const builtins = [{ field: 'title', ...spec.title }, ...spec.bodySlots, ...spec.imageSlots];
  if (slide.formula && spec.formula) builtins.push({ field: 'formula', ...spec.formula });
  if (slide.example && spec.example) builtins.push({ field: 'example', ...spec.example });
  return [
    ...builtins.map(item => ({ ...item, key: `builtin:${item.field}`, label: FIELD_LABELS[item.field], custom: false })),
    ...(slide.elements || []).map((item, at) => ({ ...item, key: `custom:${item.id}`, label: `${CUSTOM_LABELS[item.kind] || 'Obyekt'} ${at + 1}`, custom: true })),
  ];
}

/** Slide patches are committed after a gesture ends. All intermediate movement stays local. */
export default function FreeformCanvas({ document: project, slideIndex = 0, onChangeSlide, disabled = false }) {
  const slide = project.slides[slideIndex] || project.slides[0];
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState('');
  const overlay = useRef(null);
  const upload = useRef(null);
  const gesture = useRef(null);
  const alive = useRef(false);
  const uploadGeneration = useRef(0);
  const latest = useRef(null);
  latest.current = { slide, slideIndex, onChangeSlide, disabled, design: slide?.design || project.design };
  const helpId = useId();
  const design = slide?.design || project.design;
  const sections = useMemo(() => slideSections(project.slides), [project.slides]);
  const previewSlide = useMemo(() => {
    if (!slide || !draft) return slide;
    if (draft.key.startsWith('custom:')) return { ...slide, elements: (slide.elements || []).map(item => `custom:${item.id}` === draft.key ? { ...item, ...draft.rect } : item) };
    return { ...slide, placements: { ...(slide.placements || {}), [draft.key.slice(8)]: draft.rect } };
  }, [slide, draft]);
  const previewProject = useMemo(() => previewSlide === slide ? project : { ...project, slides: project.slides.map((item, index) => index === slideIndex ? previewSlide : item) }, [project, slide, previewSlide, slideIndex]);
  const spec = useMemo(() => getLayoutSpec(previewSlide, design, slideIndex, sections), [previewSlide, design, slideIndex, sections]);
  const objects = useMemo(() => selectableObjects(previewSlide, spec), [previewSlide, spec]);
  const selected = objects.find(item => item.key === selectedKey);
  const customCount = slide?.elements?.length || 0;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; uploadGeneration.current += 1; gesture.current = null; };
  }, []);
  useEffect(() => {
    gesture.current = null;
    setDraft(null);
    setSelectedKey(null);
    setError('');
    setImageBusy(false);
    uploadGeneration.current += 1;
    return () => {
      const active = gesture.current;
      gesture.current = null;
      if (active && overlay.current?.hasPointerCapture?.(active.pointerId)) overlay.current.releasePointerCapture(active.pointerId);
    };
  }, [slide?.id, slideIndex, disabled]);
  useEffect(() => {
    // Undo, import and design changes may replace this same slide during a gesture.
    const active = gesture.current;
    if (!active) return;
    gesture.current = null;
    setDraft(null);
    if (overlay.current?.hasPointerCapture?.(active.pointerId)) overlay.current.releasePointerCapture(active.pointerId);
  }, [slide, design]);

  function commitGeometry(item, rect) {
    const current = latest.current;
    if (current.disabled || !current.slide) return;
    const bounded = clampPlacement(rect, item.custom ? undefined : item.field, current.slide);
    if (item.custom) current.onChangeSlide?.({ elements: (current.slide.elements || []).map(element => element.id === item.id ? { ...element, ...bounded } : element) });
    else current.onChangeSlide?.({ placements: { ...(current.slide.placements || {}), [item.field]: bounded } });
    return bounded;
  }

  function startGesture(event, item, mode = 'move') {
    if (disabled || event.button !== 0 || event.isPrimary === false || gesture.current) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedKey(item.key);
    setError('');
    event.currentTarget.focus({ preventScroll: true });
    const width = overlay.current?.getBoundingClientRect().width || 1280;
    gesture.current = { pointerId: event.pointerId, item, mode, startX: event.clientX, startY: event.clientY, scale: width / 1280, rect: geometry(item), latest: geometry(item), moved: false, sourceSlide: slide, sourceDesign: design, slideIndex };
    overlay.current?.setPointerCapture(event.pointerId);
  }

  function moveGesture(event) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = (event.clientX - active.startX) / active.scale;
    const dy = (event.clientY - active.startY) / active.scale;
    if (Math.abs(dx) + Math.abs(dy) < 2 && !active.moved) return;
    active.moved = true;
    const next = { ...active.rect };
    if (active.mode === 'move') { next.x += dx; next.y += dy; }
    else {
      const bounds = placementBounds(active.item.custom ? undefined : active.item.field, latest.current.slide);
      if (active.mode.includes('e')) next.w = Math.min(1280 - active.rect.x, Math.max(24, active.rect.w + dx));
      if (active.mode.includes('s')) next.h = Math.min(bounds.bottom - active.rect.y, Math.max(24, active.rect.h + dy));
      if (active.mode.includes('w')) { next.w = Math.min(active.rect.x + active.rect.w, Math.max(24, active.rect.w - dx)); next.x = active.rect.x + active.rect.w - next.w; }
      if (active.mode.includes('n')) { next.h = Math.min(active.rect.y + active.rect.h - bounds.top, Math.max(24, active.rect.h - dy)); next.y = active.rect.y + active.rect.h - next.h; }
    }
    active.latest = clampPlacement(next, active.item.custom ? undefined : active.item.field, latest.current.slide);
    setDraft({ key: active.item.key, rect: active.latest });
  }

  function endGesture(event, cancel = false) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (!cancel) moveGesture(event);
    gesture.current = null;
    setDraft(null);
    if (overlay.current?.hasPointerCapture?.(event.pointerId)) overlay.current.releasePointerCapture(event.pointerId);
    if (!cancel && active.moved && active.sourceSlide === latest.current.slide && active.sourceDesign === latest.current.design && active.slideIndex === latest.current.slideIndex) commitGeometry(active.item, active.latest);
  }

  function objectKeys(event, item, resize = false) {
    if (event.key === 'Escape') { event.preventDefault(); setSelectedKey(null); return; }
    if (disabled || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 10 : 1;
    const next = geometry(item);
    const horizontal = ['ArrowLeft', 'ArrowRight'].includes(event.key);
    const amount = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -step : step;
    const key = resize ? horizontal ? 'w' : 'h' : horizontal ? 'x' : 'y';
    next[key] = resize ? Math.max(24, next[key] + amount) : next[key] + amount;
    commitGeometry(item, next);
  }

  function addElement(kind, image) {
    const current = latest.current;
    if (current.disabled || !current.slide || (current.slide.elements || []).length >= ELEMENT_LIMIT) return;
    const theme = designTokens(current.slide.design || project.design);
    const count = current.slide.elements?.length || 0;
    const offset = (count % 5) * 20;
    const item = {
      id: elementId(), kind, x: 380 + offset, y: 280 + offset,
      w: kind === 'text' ? 460 : kind === 'image' ? 360 : 240,
      h: kind === 'text' ? 104 : kind === 'image' ? 240 : 140,
      ...(kind === 'text' ? { text: 'Yangi matn', fontSize: 28, color: theme.color } : kind === 'image' ? { image } : { fill: theme.light ? '#41647a' : '#dbe9e4' }),
    };
    current.onChangeSlide?.({ elements: [...(current.slide.elements || []), item] });
    setSelectedKey(`custom:${item.id}`);
    setError('');
  }

  async function addImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const generation = ++uploadGeneration.current;
    setImageBusy(true);
    setError('');
    try {
      const image = await normalizeImage(file);
      if (alive.current && generation === uploadGeneration.current) addElement('image', image);
    } catch (caught) {
      if (alive.current && generation === uploadGeneration.current) setError(caught.message || 'Rasmni ochib bo‘lmadi.');
    } finally {
      if (alive.current && generation === uploadGeneration.current) setImageBusy(false);
    }
  }

  function updateElement(patch) {
    const current = latest.current;
    if (!selected?.custom || current.disabled) return;
    current.onChangeSlide?.({ elements: (current.slide.elements || []).map(item => item.id === selected.id ? { ...item, ...patch } : item) });
  }

  if (!slide) return null;
  const cannotAdd = disabled || imageBusy || customCount >= ELEMENT_LIMIT;
  return <section className={`ps51-freeform${disabled ? ' is-disabled' : ''}`} aria-label="Slayd muharriri">
    <div className="ps51-canvas-toolbar" role="group" aria-label="Obyekt qo‘shish">
      <div className="ps51-canvas-add">
        <button type="button" disabled={cannotAdd} onClick={() => addElement('text')}><Type size={16} /><span>Matn</span><Plus size={12} /></button>
        <button type="button" disabled={cannotAdd} onClick={() => upload.current?.click()}><ImagePlus size={16} /><span>{imageBusy ? 'Tayyorlanmoqda…' : 'Rasm'}</span></button>
        <button type="button" disabled={cannotAdd} onClick={() => addElement('rect')}><Square size={15} /><span>Shakl</span><Plus size={12} /></button>
        <input ref={upload} type="file" accept="image/png,image/jpeg" className="ps51-file-input" aria-label="Slaydga rasm yuklash" onChange={addImage} disabled={cannotAdd} tabIndex={-1} />
      </div>
      <button type="button" className="ps51-reset" disabled={disabled || !Object.keys(slide.placements || {}).length} onClick={() => { gesture.current = null; setDraft(null); onChangeSlide?.({ placements: {} }); }} title="Asosiy matn va rasmlarni maketdagi joyiga qaytarish"><RotateCcw size={15} /><span>Joylashuvni tiklash</span></button>
    </div>
    <div className="ps51-canvas-stage">
      <SlidePreview document={previewProject} index={slideIndex} transition={false} isManipulating={!!draft} />
      {!disabled && <div ref={overlay} className="ps51-canvas-overlay" onPointerDown={event => { if (event.target === event.currentTarget) setSelectedKey(null); }} onPointerMove={moveGesture} onPointerUp={event => endGesture(event)} onPointerCancel={event => endGesture(event, true)} onLostPointerCapture={event => endGesture(event, true)}>
        {objects.map(item => <div key={item.key} role="button" tabIndex={0} data-canvas-object={item.key} aria-label={`${item.label}: tanlash va ko‘chirish`} aria-pressed={selectedKey === item.key} aria-describedby={helpId} className={`ps51-canvas-object${selectedKey === item.key ? ' is-selected' : ''}`} style={positionStyle(item)} onFocus={() => setSelectedKey(item.key)} onPointerDown={event => startGesture(event, item)} onKeyDown={event => objectKeys(event, item)} />)}
        {selected && <div className="ps51-selection-frame" style={positionStyle(selected)}>
          <span className="ps51-selection-label">{selected.label}</span>
          {['nw', 'ne', 'sw', 'se'].map(corner => <button key={corner} type="button" className={`ps51-resize-handle is-${corner}`} aria-label={`${selected.label}: o‘lchamini o‘zgartirish (${corner})`} title="O‘lchamini o‘zgartirish" onPointerDown={event => startGesture(event, selected, corner)} onKeyDown={event => objectKeys(event, selected, true)} />)}
        </div>}
      </div>}
    </div>
    <div className="ps51-canvas-caption"><p id={helpId}><Move size={13} />Obyektni suring, burchagidan o‘lchamini o‘zgartiring. Strelka: 1 px · Shift: 10 px.</p><span>{customCount}/{ELEMENT_LIMIT}</span></div>
    {error && <p className="ps51-canvas-error" role="alert">{error}</p>}
    {customCount >= ELEMENT_LIMIT && <p className="ps51-canvas-note">Bu slaydga 12 ta qo‘shimcha obyekt qo‘shildi.</p>}
    {selected && !disabled ? <div className="ps51-object-inspector" aria-label={`${selected.label} sozlamalari`}>
      <div className="ps51-inspector-heading"><strong>{selected.label}</strong>{selected.custom ? <button type="button" className="ps51-delete" onClick={() => { onChangeSlide?.({ elements: (slide.elements || []).filter(item => item.id !== selected.id) }); setSelectedKey(null); }}><Trash2 size={14} />O‘chirish</button> : <span>Matnni quyidagi maydonlarda tahrirlang</span>}</div>
      {selected.custom && selected.kind === 'text' && <label className="ps51-inspector-text">Matn<textarea value={selected.text || ''} maxLength={600} rows={2} onChange={event => updateElement({ text: event.target.value })} /></label>}
      <div className="ps51-inspector-fields">
        {[['x', 'X'], ['y', 'Y'], ['w', 'Kenglik'], ['h', 'Balandlik']].map(([key, label]) => <CoordinateInput key={`${selected.key}-${key}`} label={label} value={selected[key]} min={key === 'w' || key === 'h' ? 24 : 0} max={key === 'x' || key === 'w' ? 1280 : 720} onCommit={value => commitGeometry(selected, { ...geometry(selected), [key]: value })?.[key]} />)}
        {selected.custom && selected.kind === 'text' && <CoordinateInput label="Shrift" value={selected.fontSize || 28} min={14} max={72} onCommit={fontSize => updateElement({ fontSize: Math.max(14, Math.min(72, fontSize)) })} />}
        {selected.custom && ['text', 'rect'].includes(selected.kind) && <label className="ps51-inspector-color">Rang<input type="color" value={(selected.kind === 'text' ? selected.color : selected.fill) || '#17394b'} onChange={event => updateElement({ [selected.kind === 'text' ? 'color' : 'fill']: event.target.value })} /></label>}
      </div>
    </div> : <div className="ps51-inspector-empty"><span>Slayddagi matn yoki rasmni tanlang.</span><span>1280 × 720</span></div>}
  </section>;
}

function CoordinateInput({ label, value, min, max, onCommit }) {
  const [input, setInput] = useState(String(Math.round(value)));
  useEffect(() => setInput(String(Math.round(value))), [value]);
  const commit = () => {
    if (input.trim() && Number.isFinite(Number(input))) {
      const bounded = Math.max(min, Math.min(max, Number(input)));
      if (bounded === value) { setInput(String(Math.round(value))); return; }
      const committed = onCommit(bounded);
      setInput(String(Math.round(Number.isFinite(committed) ? committed : bounded)));
    } else setInput(String(Math.round(value)));
  };
  return <label className="ps51-coordinate">{label}<input type="number" value={input} min={min} max={max} step={1} onChange={event => setInput(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>;
}
