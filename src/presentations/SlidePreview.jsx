import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import aurora from './assets/aurora.png';
import { getLayoutSpec } from './layouts';

export const ACCENTS = { cyan: '#06b6d4', blue: '#3b82f6', violet: '#8b5cf6', green: '#10b981', amber: '#f59e0b' };
export function designTokens(design) {
  let light = true;
  if (design.background === 'paper') light = Number(design.overlay) >= 45;
  if (design.background === 'solid') {
    const rgb = [1, 3, 5].map(start => parseInt(design.color.slice(start, start + 2), 16) / 255);
    light = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) * (1 - design.overlay / 100) < 0.5;
  }
  if (design.text !== 'auto') light = design.text === 'light';
  return {
    light, color: light ? '#f8fafc' : '#14243b', muted: light ? '#cbd5e1' : '#475569', accent: ACCENTS[design.accent] || ACCENTS.cyan,
    background: ({ aurora: '#091b35', paper: '#f4f2eb', midnight: '#111a35', solid: design.color, image: '#091b35' })[design.background],
    image: design.background === 'aurora' ? aurora : design.background === 'image' ? design.image : null,
    panel: design.panel === 'none' ? 'transparent' : design.panel === 'solid' ? light ? '#14243b' : '#ffffff' : light ? 'rgba(20,36,59,.70)' : 'rgba(255,255,255,.78)',
    border: design.panel === 'none' ? 'transparent' : light ? 'rgba(255,255,255,.18)' : 'rgba(20,36,59,.14)',
  };
}

export function formulaResult(source) {
  if (!source?.trim()) return { html: '', error: '' };
  try { return { html: katex.renderToString(source, { displayMode: true, throwOnError: true, trust: false, strict: 'warn', maxExpand: 1000, maxSize: 12 }), error: '' }; }
  catch (error) { return { html: '', error: `Formula yozilishini tekshiring: ${String(error.message || '').replace(/^KaTeX parse error:\s*/, '').slice(0, 180)}` }; }
}

export function Formula({ source, className = '' }) {
  const result = useMemo(() => formulaResult(source), [source]);
  if (result.error) return <div className={`ps49-formula-error ${className}`} role="alert">{result.error}</div>;
  return <div className={`ps49-formula ${className}`} aria-label={`Formula: ${source}`} dangerouslySetInnerHTML={{ __html: result.html }} />;
}

function box(rect, extra = {}) {
  return { position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxSizing: 'border-box', ...extra };
}
function FitText({ rect, text, label, fontSize, style = {}, className = '' }) {
  if (!rect || !text) return null;
  return <div data-fit-label={label} className={className} style={box(rect, { fontSize: rect.fontSize || fontSize, lineHeight: rect.lineHeight || 1.28, whiteSpace: 'pre-wrap', overflowWrap: 'break-word', overflow: 'hidden', ...style })}><div className="ps50-fit-inner">{text}</div></div>;
}

/** Geometry is shared with the bounded native PPTX exporter; prompts never fetch images. */
function SlidePreview({ document, index = 0, thumbnail = false, onNavigate, transition = true, isManipulating = false }) {
  const host = useRef(null);
  const art = useRef(null);
  const priorIndex = useRef(index);
  const [width, setWidth] = useState(0);
  const [fitErrors, setFitErrors] = useState([]);
  useLayoutEffect(() => {
    const update = () => setWidth(host.current?.clientWidth || 0);
    update();
    const observer = new ResizeObserver(update);
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const slide = document.slides[index] || document.slides[0];
  const design = slide?.design || document.design;
  const sections = useMemo(() => {
    const result = [];
    document.slides.forEach((item, firstIndex) => { const label = item.section || 'Taqdimot'; if (!result.some(section => section.label === label)) result.push({ label, firstIndex }); });
    return result;
  }, [document.slides]);
  const spec = slide ? getLayoutSpec(slide, design, index, sections) : null;
  useLayoutEffect(() => {
    if (!art.current || isManipulating) return undefined;
    let cancelled = false;
    const check = () => {
      if (cancelled || !art.current || !width) return;
      const errors = [...art.current.querySelectorAll('[data-fit-label]')].filter(node => {
        const inner = node.querySelector('.katex') || node.querySelector('.ps50-fit-inner') || node;
        const scale = width / 1280;
        const bounds = inner.getBoundingClientRect();
        return inner.scrollWidth > node.clientWidth + 2 || inner.scrollHeight > node.clientHeight + 2 || bounds.height / scale > node.clientHeight + 2 || bounds.width / scale > node.clientWidth + 2;
      }).map(node => node.dataset.fitLabel);
      if (art.current.querySelector('.ps49-formula-error')) errors.push('Formula');
      setFitErrors(previous => previous.join('|') === errors.join('|') ? previous : errors);
    };
    check();
    globalThis.document?.fonts?.ready.then(check);
    return () => { cancelled = true; };
  }, [slide, design, width, isManipulating]);
  useLayoutEffect(() => {
    const changed = priorIndex.current !== index;
    priorIndex.current = index;
    if (!changed || !transition || !art.current || design?.transition === 'none' || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const type = design?.transition || 'fade';
    const frames = type === 'push' ? [{ opacity: .35, transform: 'translateX(38px)' }, { opacity: 1, transform: 'translateX(0)' }]
      : type === 'wipe' ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }]
        : [{ opacity: .12 }, { opacity: 1 }];
    const animation = art.current.animate?.(frames, { duration: 260, easing: 'ease-out' });
    return () => animation?.cancel();
  }, [index, transition, design?.transition]);
  if (!slide || !spec) return null;
  const theme = designTokens(design);
  const round = design.radius === 'round';
  const palette = (value) => value === 'accent' ? theme.accent : value === 'sectionColor' ? spec.sectionColor : value === 'panel' ? theme.panel : value || theme.accent;
  const sizes = spec.fontSizes;
  const panelStyle = (rect) => box(rect, { borderRadius: round ? (rect.radius ?? 20) : 0, border: `1px solid ${theme.border}`, background: rect.fill ? `${palette(rect.fill)}${design.panel === 'glass' ? theme.light ? 'b3' : 'c7' : ''}` : theme.panel, opacity: rect.opacity ?? 1 });
  return <div ref={host} className={`ps49-preview-host${thumbnail ? ' ps49-preview-thumb' : ''}`} style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }} aria-label={`${index + 1}-slayd: ${slide.title}`}>
    <style>{`.ps50-slide-art .katex-display{margin:0;overflow:visible}.ps50-slide-art .ps49-formula{width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:visible}.ps50-slide-art .katex{font-size:1em;display:inline-block}.ps50-slide-art button{font-family:inherit}.ps50-slide-art button:focus-visible{outline:4px solid currentColor;outline-offset:-4px}`}</style>
    <div className="ps49-slide-canvas" style={{ width: 1280, height: 720, transform: `scale(${width / 1280})`, transformOrigin: 'top left', position: 'absolute', inset: 0, color: theme.color, fontFamily: design.font === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif' }}>
      <div ref={art} className="ps50-slide-art" data-template={spec.template} data-layout={spec.layout} style={{ position: 'absolute', inset: 0, backgroundColor: theme.background, backgroundImage: theme.image ? `url("${theme.image}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${design.overlay / 100})` }} />
        {spec.navigation && design.panel !== 'none' && <div style={panelStyle(spec.navigation)} />}
        {spec.panel && design.panel !== 'none' && <div style={panelStyle(spec.panel)} />}
        {spec.decorations.map((item, at) => <React.Fragment key={`decoration-${at}`}>
          <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${item.w} ${item.h}`} preserveAspectRatio="none" style={box(item, { opacity: item.opacity ?? 1, overflow: 'visible', pointerEvents: 'none' })}>
            {item.kind === 'polygon' ? <polygon points={(item.points || []).map(point => point.join(',')).join(' ')} fill={palette(item.fill)} />
              : item.kind === 'circle' ? <ellipse cx={item.w / 2} cy={item.h / 2} rx={item.w / 2} ry={item.h / 2} fill={palette(item.fill)} />
                : <rect width={item.w} height={item.h} rx={round ? item.radius || 0 : 0} fill={palette(item.fill)} />}
          </svg>
          {item.text && <FitText rect={{ ...item, y: item.y + (item.h - (item.fontSize || 24) * 1.28) / 2, h: (item.fontSize || 24) * 1.28 + 1 }} text={item.text} label="Bosqich raqami" fontSize={item.fontSize || 24} style={{ textAlign: 'center', fontWeight: 700, color: ['cyan', 'green', 'amber'].includes(design.accent) ? '#071b24' : '#ffffff' }} />}
        </React.Fragment>)}
        {spec.tabs.map((tab) => {
          const ribbon = spec.template === 'ribbon';
          const fill = ribbon && tab.active ? spec.sectionColor : tab.active ? `${theme.accent}3b` : 'transparent';
          const textRect = tab.text || { ...tab, x: tab.x + 12, y: tab.y + 9, w: tab.w - 24, h: tab.h - 16 };
          const tabRect = ribbon ? tab : { ...tab, x: tab.x + 5, y: tab.y + 5, w: tab.w - 10, h: tab.h - 10 };
          return <React.Fragment key={tab.label}><div style={box(tabRect, { borderRadius: round ? ribbon ? '16px 16px 0 0' : 12 : 0, background: fill, border: !ribbon && tab.active ? `1px solid ${theme.accent}8c` : undefined })} />
            {onNavigate && !thumbnail ? <button type="button" aria-label={`${tab.label} bo‘limiga o‘tish`} aria-current={tab.active ? 'step' : undefined} onClick={() => onNavigate(tab.firstIndex)} style={box(tab, { padding: 0, border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer' })} /> : null}
            <FitText rect={textRect} text={tab.label} label="Bo‘lim nomi" fontSize={sizes.nav} style={{ pointerEvents: 'none', textAlign: 'center', fontWeight: tab.active ? 700 : 400, color: tab.active ? theme.color : theme.muted }} />
          </React.Fragment>;
        })}
        {spec.section && <FitText rect={spec.section} text={slide.section} label="Bo‘lim" fontSize={14} style={{ color: theme.accent, fontWeight: 700 }} />}
        <FitText rect={spec.title} text={slide.title} label="Sarlavha" fontSize={sizes.title} className="ps49-slide-title" style={{ fontWeight: 700, lineHeight: 1.12 }} />
        {spec.imageSlots.map((slot, at) => <React.Fragment key={slot.field}>
          {slide[slot.field] ? <img alt={slide[slot.captionField] || `${at + 1}-slayd rasmi`} src={slide[slot.field]} style={box(slot, { objectFit: slot.fit || 'contain', borderRadius: round ? 12 : 0 })} /> : !thumbnail && <div className="ps49-empty-image" style={box(slot, { border: `2px dashed ${theme.muted}`, color: theme.muted, fontSize: 23, display: 'grid', placeItems: 'center', textAlign: 'center', borderRadius: round ? 12 : 0 })}>{at + 1}-rasmni qo‘shing</div>}
          {slide[slot.field] && slot.caption && <FitText rect={slot.caption} text={slide[slot.captionField]} label={`${at + 1}-rasm izohi`} fontSize={sizes.caption} style={{ color: theme.muted }} />}
        </React.Fragment>)}
        {spec.bodySlots.map((slot, at) => <FitText key={slot.field} rect={slot} text={slide[slot.field]} label={`${at + 1}-matn`} fontSize={sizes.body} className="ps49-slide-body" />)}
        {slide.formula && spec.formula && <div data-fit-label="Formula" className="ps49-slide-equation" style={box(spec.formula, { fontSize: sizes.formula, color: theme.color, overflow: 'hidden' })}><Formula source={slide.formula} /></div>}
        {slide.example && spec.example && <><FitText rect={spec.example.label} text="MISOL" label="Misol belgisi" fontSize={14} style={{ color: spec.template === 'ribbon' && design.panel !== 'none' ? theme.color : theme.accent, fontWeight: 700, letterSpacing: 2 }} /><FitText rect={spec.example} text={slide.example} label="Misol" fontSize={sizes.example} className="ps49-slide-example" style={{ lineHeight: 1.25 }} /></>}
        <FitText rect={spec.footer} text={document.subject || document.title} label="Fan nomi" fontSize={14} style={{ color: theme.muted }} />
        <FitText rect={spec.page} text={`${String(index + 1).padStart(2, '0')} / ${String(document.slides.length).padStart(2, '0')}`} label="Slayd raqami" fontSize={14} style={{ color: theme.muted, textAlign: 'right' }} />
        {(spec.elements || slide.elements || []).map((item, at) => item.kind === 'text'
          ? <FitText key={item.id} rect={item} text={item.text} label={`${at + 1}-qo‘shimcha matn`} fontSize={item.fontSize || 28} style={{ color: item.color || theme.color }} />
          : item.kind === 'image' && item.image ? <img key={item.id} src={item.image} alt="Qo‘shilgan rasm" style={box(item, { objectFit: 'contain' })} />
            : item.kind === 'rect' ? <svg key={item.id} aria-hidden="true" focusable="false" viewBox={`0 0 ${item.w} ${item.h}`} preserveAspectRatio="none" style={box(item)}><rect width={item.w} height={item.h} fill={item.fill || theme.accent} /></svg> : null)}
      </div>
    </div>
    {!thumbnail && !isManipulating && fitErrors.length > 0 && <div role="alert" className="ps50-fit-warning" style={{ position: 'absolute', left: 8, right: 8, bottom: 8, border: '1px solid #a93232', borderRadius: 6, padding: '7px 9px', font: '12px/1.35 Arial,sans-serif', background: '#fff1ef', color: '#821d1d' }}>{fitErrors.join(', ')} slaydga sig‘madi. Matnni qisqartiring yoki boshqa maketni tanlang.</div>}
  </div>;
}

/** Typing on one slide must not rerender every image and formula in the slide strip. */
function samePreviewProps(previous, next) {
  const previousIndex = previous.index || 0, nextIndex = next.index || 0;
  if (previousIndex !== nextIndex || !!previous.thumbnail !== !!next.thumbnail
    || (previous.transition ?? true) !== (next.transition ?? true)
    || !!previous.isManipulating !== !!next.isManipulating
    || previous.onNavigate !== next.onNavigate) return false;
  const before = previous.document, after = next.document;
  if (before === after) return true;
  if (before.design !== after.design || before.slides.length !== after.slides.length
    || (before.subject || before.title) !== (after.subject || after.title)
    || (before.slides[previousIndex] || before.slides[0]) !== (after.slides[nextIndex] || after.slides[0])) return false;
  // Navigation depends on section order and first occurrence, not other slide content.
  return before.slides.every((slide, at) => (slide.section || 'Taqdimot') === (after.slides[at].section || 'Taqdimot'));
}

export default React.memo(SlidePreview, samePreviewProps);
