import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import aurora from './assets/aurora.png';

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

function box(x, y, width, height, extra = {}) { return { position: 'absolute', left: x, top: y, width, height, ...extra }; }

export default function SlidePreview({ document, index = 0, thumbnail = false }) {
  const host = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const update = () => setWidth(host.current?.clientWidth || 0);
    update();
    const observer = new ResizeObserver(update);
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const slide = document.slides[index] || document.slides[0];
  if (!slide) return null;
  const design = slide.design || document.design;
  const theme = designTokens(design);
  const large = design.size === 'large';
  const currentSection = slide.section || 'Taqdimot';
  const sections = [...new Set(document.slides.map(item => item.section || 'Taqdimot'))];
  const sectionAt = Math.max(0, sections.indexOf(currentSection));
  const shownSections = sections.slice(Math.floor(sectionAt / 5) * 5, Math.floor(sectionAt / 5) * 5 + 5);
  const isImage = slide.layout === 'image';
  const isFormula = slide.layout === 'formula';
  const bx = isImage ? 628 : 96;
  const bw = isImage ? 556 : 1088;
  const bodyHeight = isImage ? (slide.formula ? 132 : 252) : isFormula ? 92 : slide.formula ? 154 : slide.example ? 250 : 346;
  const fy = isImage ? 400 : isFormula ? 356 : 420;
  const fh = isImage ? 104 : isFormula ? 140 : 92;
  const exampleY = isImage ? 550 : isFormula ? 542 : 548;
  return <div ref={host} className={`ps49-preview-host${thumbnail ? ' ps49-preview-thumb' : ''}`} style={{ aspectRatio: '16/9' }} aria-label={`${index + 1}-slayd: ${slide.title}`}>
    <div className="ps49-slide-canvas" style={{ width: 1280, height: 720, transform: `scale(${width / 1280})`, backgroundColor: theme.background, backgroundImage: theme.image ? `url("${theme.image}")` : undefined, color: theme.color, fontFamily: design.font === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${design.overlay / 100})` }} />
      <div style={box(64, 30, 1152, 62, { borderRadius: design.radius === 'round' ? 18 : 0, border: `1px solid ${theme.border}`, background: theme.panel })}>
        {shownSections.map((section, at) => <React.Fragment key={section}>{section === currentSection && <div style={box(at * 1152 / shownSections.length + 5, 5, 1152 / shownSections.length - 10, 52, { borderRadius: design.radius === 'round' ? 12 : 0, background: `${theme.accent}3b`, border: `1px solid ${theme.accent}8c` })} />}<div style={box(at * 1152 / shownSections.length + 12, 9, 1152 / shownSections.length - 24, 46, { overflow: 'hidden', overflowWrap: 'break-word', textAlign: 'center', fontSize: 16, lineHeight: 1.2, color: section === currentSection ? theme.color : theme.muted, fontWeight: section === currentSection ? 700 : 400 })}>{section}</div></React.Fragment>)}
      </div>
      <div style={box(64, 116, 1152, 522, { borderRadius: design.radius === 'round' ? 24 : 0, border: `1px solid ${theme.border}`, background: theme.panel })} />
      <div className="ps49-slide-title" style={box(96, 146, 1088, 96, { fontSize: large ? 48 : 42, lineHeight: 1.12, fontWeight: 700 })}>{slide.title}</div>
      {isImage && slide.image && <img alt="Slayd rasmi" src={slide.image} style={box(96, 254, 496, 346, { objectFit: 'contain', borderRadius: design.radius === 'round' ? 12 : 0 })} />}
      {isImage && !slide.image && !thumbnail && <div className="ps49-empty-image" style={box(96, 254, 496, 346, { border: `2px dashed ${theme.muted}`, color: theme.muted, fontSize: 23, display: 'grid', placeItems: 'center', borderRadius: design.radius === 'round' ? 12 : 0 })}>Rasm qo‘shing</div>}
      <div className="ps49-slide-body" style={box(bx, 254, bw, bodyHeight, { fontSize: large ? 28 : 24, lineHeight: 1.28, whiteSpace: 'pre-wrap' })}>{slide.body}</div>
      {slide.formula && <div className="ps49-slide-equation" style={box(isImage ? 640 : 120, fy, isImage ? 532 : 1040, fh, { fontSize: large ? 60 : 52, color: theme.color })}><Formula source={slide.formula} /></div>}
      {slide.example && <><div style={box(bx, isImage ? 522 : isFormula ? 514 : 520, bw, 20, { color: theme.accent, fontSize: 14, fontWeight: 700, letterSpacing: 2 })}>MISOL</div><div className="ps49-slide-example" style={box(bx, exampleY, bw, isFormula ? 66 : isImage ? 58 : 60, { fontSize: large ? 23 : 20, lineHeight: 1.25, whiteSpace: 'pre-wrap' })}>{slide.example}</div></>}
      <div style={box(96, 665, 960, 24, { color: theme.muted, fontSize: 14 })}>{document.subject || document.title}</div>
      <div style={box(1110, 665, 74, 24, { color: theme.muted, fontSize: 14, textAlign: 'right' })}>{String(index + 1).padStart(2, '0')} / {String(document.slides.length).padStart(2, '0')}</div>
    </div>
  </div>;
}
