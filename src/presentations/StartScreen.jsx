import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useEffect, useId, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronRight, FileText, Image as ImageIcon, LoaderCircle, PenLine, Sparkles, Upload } from 'lucide-react';
import { BACKGROUND_THEMES, renderBackground, suggestTheme } from './backgrounds.js';

/* Boshlash ekrani — kompyuterni kam biladigan o'qituvchi ham 3 ta yirik
 * tugmadan birini tanlab, 4 ta maydonni to'ldirsa bo'ldi. Hamma murakkab
 * sozlamalar (maket oilasi, namuna, import) "Qo'shimcha" ostida. */

export const START_MODES = [
  { id: 'manual', icon: PenLine, title: 'O‘zim yozaman', text: 'Slaydlar tayyor bo‘ladi — matn va rasmlarni o‘zingiz qo‘yasiz.', steps: ['Mavzu va sinfni yozing', 'Slaydlarga matn yozing, rasm qo‘shing', 'PowerPoint faylini yuklab oling'] },
  { id: 'ai', icon: Sparkles, title: 'AI yozib beradi', text: 'Mavzu va sinfni yozing — matnni AI tayyorlaydi, siz tekshirib qo‘llaysiz.', steps: ['Mavzu, fan va sinfni yozing', 'AI har slaydga matn yozadi — 1–2 daqiqa', 'Natijani ko‘rib, qo‘llang va yuklab oling'] },
  { id: 'word', icon: FileText, title: 'Word shablon bilan', text: 'Word faylni yuklab, ChatGPT yoki boshqa AI’ga to‘ldirtirasiz, qaytarasiz — PPT tayyor.', steps: ['Word shablonni yuklab oling', 'Faylni istalgan AI’ga tashlab to‘ldirtiring', 'To‘ldirilgan faylni qaytarib yuklang — PPT tayyor'] },
];
export const LESSONS = { lecture: 'Ma’ruza', practice: 'Amaliy mashg‘ulot', seminar: 'Seminar', lab: 'Laboratoriya', project: 'Loyiha himoyasi' };
const COUNTS = [5, 8, 10, 12, 15, 20];

/** Auditoriya: maktab sinfi, bakalavr/magistr kursi yoki o'z matni — kanonik yozuv bilan. */
export function AudiencePicker({ value, onChange }) {
  useKbInterfaceLocale();
  const parsed = useMemo(() => {
    const text = String(value || '').trim();
    let m = /^(1[01]|[1-9])-sinf$/i.exec(text); if (m) return { group: 'maktab', number: m[1] };
    m = /^([1-4])-kurs bakalavr$/i.exec(text); if (m) return { group: 'bakalavr', number: m[1] };
    m = /^([1-2])-kurs magistr$/i.exec(text); if (m) return { group: 'magistr', number: m[1] };
    return { group: text ? 'boshqa' : 'maktab', number: null };
  }, [value]);
  const [group, setGroup] = useState(parsed.group);
  useEffect(() => { setGroup(parsed.group); }, [parsed.group]);
  const numbers = group === 'maktab' ? Array.from({ length: 11 }, (_, i) => String(i + 1)) : group === 'bakalavr' ? ['1', '2', '3', '4'] : group === 'magistr' ? ['1', '2'] : [];
  const label = number => (group === 'maktab' ? `${number}-sinf` : group === 'bakalavr' ? `${number}-kurs bakalavr` : `${number}-kurs magistr`);
  return <div className="ps60-audience">
    <div className="ps60-audience-groups" role="group" aria-label={__kbUi("Auditoriya turi")}>
      {[['maktab', '🏫 Maktab'], ['bakalavr', '📘 Bakalavr'], ['magistr', '🎓 Magistr'], ['boshqa', '✏️ Boshqa']].map(([id, name]) => <button type="button" key={id} className={group === id ? 'is-active' : ''} aria-pressed={group === id} onClick={() => { setGroup(id); if (id !== 'boshqa') onChange(''); }}>{__kbUi(name)}</button>)}
    </div>
    {group === 'boshqa' ? <input value={value || ''} onChange={event => onChange(event.target.value)} maxLength={120} placeholder={__kbUi("Masalan: ota-onalar yig‘ilishi, kollej 2-bosqich")} />
      : <div className="ps60-audience-numbers">{numbers.map(number => <button type="button" key={number} className={parsed.number === number && parsed.group === group ? 'is-active' : ''} aria-pressed={parsed.number === number && parsed.group === group} onClick={() => onChange(label(number))}>{group === 'maktab' ? number : __kbUi(`${number}-kurs`)}</button>)}</div>}
  </div>;
}

const thumbCache = new Map();
function BackgroundTile({ theme, mode, accent, selected, onSelect }) {
  useKbInterfaceLocale();
  const [url, setUrl] = useState(thumbCache.get(`${theme.id}|${mode}|${accent}`) || '');
  useEffect(() => {
    let alive = true; const key = `${theme.id}|${mode}|${accent}`;
    if (thumbCache.has(key)) { setUrl(thumbCache.get(key)); return undefined; }
    renderBackground(theme.id, { mode, accent, width: 320, height: 180 }).then(value => { thumbCache.set(key, value); if (alive) setUrl(value); }).catch(() => {});
    return () => { alive = false; };
  }, [theme.id, mode, accent]);
  return <button type="button" className={`ps60-bg-tile${selected ? ' is-selected' : ''}`} aria-pressed={selected} onClick={onSelect} title={__kbUi(theme.tagline)}>
    <span className="ps60-bg-thumb" style={url ? { backgroundImage: `url(${url})` } : undefined}>{!url && <LoaderCircle size={16} className="ps49-spin" />}{selected && <i><Check size={14} /></i>}</span>
    <span className="ps60-bg-name">{theme.emoji} {__kbUi(theme.label)}</span>
  </button>;
}

/** Fon galereyasi — 12 mavzu × och/to'q. Tanlov design.image ga JPEG bo'lib tushadi. */
export function BackgroundGallery({ value, mode, accent = 'blue', onSelect, onMode, onUpload, ownImage, busy, compact = false, onClear }) {
  useKbInterfaceLocale();
  const fileId = useId();
  return <div className={`ps60-bg-gallery${compact ? ' is-compact' : ''}`}>
    <div className="ps60-bg-head">
      <div className="ps49-segments ps60-bg-mode" role="group" aria-label={__kbUi("Fon yorug‘ligi")}>{[['light', 'Och fon'], ['dark', 'To‘q fon']].map(([id, name]) => <button type="button" key={id} className={mode === id ? 'is-active' : ''} aria-pressed={mode === id} onClick={() => onMode(id)}>{__kbUi(name)}</button>)}</div>
      {onUpload && <><button type="button" className="ps49-button ps49-button-small" disabled={!!busy} onClick={() => document.getElementById(fileId)?.click()}><Upload size={14} />{ownImage ? __kbUi('Boshqa rasmim') : __kbUi('O‘z rasmim')}</button><input id={fileId} className="ps49-file-input" tabIndex={-1} type="file" accept="image/png,image/jpeg" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onUpload(file); }} /></>}
    </div>
    <div className="ps60-bg-grid">{BACKGROUND_THEMES.map(theme => <BackgroundTile key={theme.id} theme={theme} mode={mode} accent={accent} selected={value === theme.id} onSelect={() => onSelect(theme.id)} />)}</div>
    {onClear && <button type="button" className="ps49-text-button" onClick={onClear}>{__kbUi("Fonsiz (oddiy rang)")}</button>}
  </div>;
}

export default function StartScreen({ draft, updateDraft, count, setCount, mode, setMode, aiAvailable, aiInstructions, setAiInstructions, bgTheme, setBgTheme, bgMode, setBgMode, onStart, busy, aiRunning, advanced, familyPicker }) {
  useKbInterfaceLocale();
  const [bgOpen, setBgOpen] = useState(false);
  const suggestion = useMemo(() => suggestTheme(draft.subject, draft.audience), [draft.subject, draft.audience]);
  const effectiveTheme = bgTheme === 'auto' ? suggestion : bgTheme;
  const themeMeta = BACKGROUND_THEMES.find(item => item.id === effectiveTheme);
  const active = START_MODES.find(item => item.id === mode) || START_MODES[0];
  const ready = !!draft.title.trim() && !busy && !aiRunning && (mode !== 'ai' || aiAvailable);
  const cta = mode === 'ai' ? 'Slaydlarni tayyorlash va AI’ga yozdirish' : mode === 'word' ? 'Slaydlarni tayyorlash va Word shablonni olish' : 'Slaydlarni tayyorlash';

  return <div className="ps60-start">
    <section className="ps49-card ps60-start-card">
      <h2>{__kbUi("Taqdimotni qanday tayyorlaymiz?")}</h2>
      <p className="ps49-intro">{__kbUi("Bittasini tanlang. Keyin istalgan vaqtda boshqasiga o‘tsangiz bo‘ladi.")}</p>
      <div className="ps60-modes" role="radiogroup" aria-label={__kbUi("Tayyorlash usuli")}>
        {START_MODES.map(item => { const Icon = item.icon; const disabled = item.id === 'ai' && !aiAvailable; return <button type="button" key={item.id} role="radio" aria-checked={mode === item.id} className={`ps60-mode${mode === item.id ? ' is-active' : ''}`} onClick={() => setMode(item.id)} disabled={disabled}>
          <span className="ps60-mode-icon"><Icon size={22} /></span>
          <strong>{__kbUi(item.title)}</strong>
          <small>{disabled ? __kbUi('AI xizmati hozir yoqilmagan — boshqa usulni tanlang.') : item.text}</small>
          {mode === item.id && <i className="ps60-mode-check"><Check size={14} /></i>}
        </button>; })}
      </div>

      <div className="ps60-fields">
        <label className="ps60-field"><span>{__kbUi("Taqdimot mavzusi ")}<b>*</b></span><input value={draft.title} onChange={event => updateDraft(previous => ({ ...previous, title: event.target.value }), 'topic')} maxLength={160} placeholder={__kbUi("Masalan: Kasrlarni qo‘shish va ayirish")} autoFocus /></label>
        <div className="ps60-two">
          <label className="ps60-field"><span>{__kbUi("Fan")}</span><input value={draft.subject} onChange={event => updateDraft(previous => ({ ...previous, subject: event.target.value }), 'subject')} maxLength={100} placeholder={__kbUi("Masalan: Matematika")} /></label>
          <label className="ps60-field"><span>{__kbUi("Dars turi")}</span><select value={draft.lesson_type} onChange={event => updateDraft(previous => ({ ...previous, lesson_type: event.target.value }))}>{Object.entries(LESSONS).map(([value, label]) => <option key={value} value={value}>{__kbUi(label)}</option>)}</select></label>
        </div>
        <div className="ps60-field"><span>{__kbUi("Kimga? (sinf yoki kurs)")}</span><AudiencePicker value={draft.audience || ''} onChange={audience => updateDraft(previous => ({ ...previous, audience }), 'audience')} /></div>
        <div className="ps60-field"><span>{__kbUi("Nechta slayd?")}</span>
          <div className="ps60-counts">{COUNTS.map(value => <button type="button" key={value} className={count === value ? 'is-active' : ''} aria-pressed={count === value} onClick={() => setCount(value)}>{__kbUi(value)}</button>)}<label className="ps60-count-input">{__kbUi("yoki")}<input type="number" min={3} max={40} value={count} onChange={event => { const value = parseInt(event.target.value, 10); if (Number.isFinite(value)) setCount(Math.max(3, Math.min(40, value))); }} aria-label={__kbUi("Slaydlar soni")} />{__kbUi("ta")}</label></div>
          <p className="ps49-help">{__kbUi("Kirish, asosiy qism, mustahkamlash va xulosa avtomatik taqsimlanadi. Keyin slayd qo‘shish yoki olib tashlash mumkin.")}</p>
        </div>
        {mode === 'ai' && aiAvailable && <label className="ps60-field"><span>{__kbUi("AI uchun istaklar (ixtiyoriy)")}</span><textarea value={aiInstructions} onChange={event => setAiInstructions(event.target.value)} maxLength={2000} rows={2} placeholder={__kbUi("Masalan: sodda til, kundalik hayotdan misollar, yakunda 3 ta savol.")} /></label>}
      </div>

      {familyPicker && <div className="ps60-family">
        <p className="ps60-yorliq"><strong>{__kbUi("Maket (5 xil)")}</strong>{__kbUi(" — slaydlarning ko‘rinishi. Keyin tahrirda ham almashtirish mumkin.")}</p>
        {familyPicker}
      </div>}

      <div className="ps60-bg-pick">
        <div className="ps60-bg-pick-head">
          <span className="ps60-bg-pick-thumb" style={themeMeta ? undefined : { background: '#e8eef3' }}>{themeMeta ? <BackgroundTile theme={themeMeta} mode={bgMode} accent={draft.design.accent} selected={false} onSelect={() => setBgOpen(true)} /> : <ImageIcon size={18} />}</span>
          <div>
            <strong>{__kbUi("Orqa fon: ")}{bgTheme === 'none' ? __kbUi('fonsiz') : __kbUi(`${themeMeta?.label || 'Ta’lim'}${bgTheme === 'auto' ? ' · fan bo‘yicha avtomatik' : ''}`)}</strong>
            <p className="ps49-help">{__kbUi("Fan yoki sinfni yozsangiz, fon o‘zi mos tanlanadi. Tahrirda istalgan vaqt o‘zgartirasiz.")}</p>
          </div>
          <button type="button" className="ps49-button ps49-button-small" onClick={() => setBgOpen(open => !open)} aria-expanded={bgOpen}>{bgOpen ? __kbUi('Yopish') : __kbUi('Fonni tanlash')}<ChevronDown size={14} style={{ transform: bgOpen ? 'rotate(180deg)' : 'none' }} /></button>
        </div>
        {bgOpen && <BackgroundGallery value={effectiveTheme} mode={bgMode} accent={draft.design.accent} onMode={setBgMode} onSelect={id => { setBgTheme(id); setBgOpen(false); }} onClear={() => { setBgTheme('none'); setBgOpen(false); }} />}
      </div>

      <button type="button" className="ps49-button ps49-primary ps60-cta" disabled={!ready} onClick={onStart}>{cta}<ArrowRight size={18} /></button>
      {!draft.title.trim() && <p className="ps49-help">{__kbUi("Boshlash uchun mavzuni yozing.")}</p>}
    </section>

    <aside className="ps60-side">
      <section className="ps49-card ps60-howto">
        <h3>{active.title}{__kbUi(" — qanday ishlaydi?")}</h3>
        <ol>{active.steps.map((step, index) => <li key={index}><span>{index + 1}</span>{step}</li>)}</ol>
        {mode === 'word' && <p className="ps49-help">{__kbUi("Word shablonda har slayd uchun nima yozish kerakligi, kimga (sinf/kurs), dars turi va so‘z chegaralari yozilgan bo‘ladi. AI to‘ldirgan faylni qaytarib yuklasangiz, matn o‘z joyiga tushadi.")}</p>}
        {mode === 'manual' && <p className="ps49-help">{__kbUi("Har slaydda «Rasm yuklash» tugmasi bor. Matnni yozing, kerak bo‘lsa «Slaydda tahrir» bilan joyini suring.")}</p>}
        {mode === 'ai' && <p className="ps49-help">{__kbUi("AI matnni taklif qiladi — siz ko‘rib chiqib «Qo‘llash»ni bosasiz. Rasmlarni o‘zingiz yuklaysiz.")}</p>}
      </section>
      {advanced && <details className="ps60-advanced"><summary>{__kbUi("Qo‘shimcha: tayyor matndan olish, formula namunasi ")}<ChevronRight size={15} /></summary>{advanced}</details>}
    </aside>
  </div>;
}
