import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Cloud, Copy, Download, FileText, FolderOpen, ImagePlus, Layers, LayoutTemplate, LoaderCircle, Maximize2, MonitorPlay, Palette, Plus, Presentation, RotateCcw, Save, Trash2, Type, Upload, X } from 'lucide-react';
import { DEFAULT_DESIGN, LIMITS, makeProject, makeSlides, normalizeDocument, validateDocument, normalizeImage, parseTaggedText, applyTaggedImport, buildTaggedTemplate, sampleProject } from './model.js';
import { presentationRequest } from './api.js';
import SlidePreview, { ACCENTS, designTokens, formulaResult } from './SlidePreview.jsx';
import { getLayout } from './layouts.js';
import { LayoutPicker, OverlayPortal, StudioDialog, TemplateGallery } from './PresentationUI.jsx';
import './presentation-studio.css';

const STEPS = ['Mavzu', 'Dizayn va mazmun', 'Ko‘rish va yuklash'];
const COUNTS = [4, 5, 10, 15, 20, 25, 30, 40];
const LESSONS = { lecture: 'Ma’ruza', practice: 'Amaliy mashg‘ulot', seminar: 'Seminar', lab: 'Laboratoriya', project: 'Loyiha himoyasi' };
const PRESETS = [
  { name: 'Aurora', note: 'Yorqin fon · shaffof panel', background: 'aurora', panel: 'glass', accent: 'cyan', text: 'auto', overlay: 25, font: 'sans' },
  { name: 'Akademik', note: 'Oq fon · aniq matn', background: 'paper', panel: 'solid', accent: 'blue', text: 'auto', overlay: 0, font: 'serif' },
  { name: 'Tungi dars', note: 'To‘q fon · binafsha urg‘u', background: 'midnight', panel: 'glass', accent: 'violet', text: 'auto', overlay: 10, font: 'sans' },
];
const TAG_EXAMPLE = '[SLAYD] Mavzu nomi\n[BO‘LIM] Kirish\n[MATN] Asosiy tushunchani shu yerga yozing.\n[FORMULA] v=\\frac{s}{t}\n[MISOL] 100 metr yo‘l 20 soniyada bosib o‘tildi.\n\n[SLAYD] Mustaqil topshiriq\n[BO‘LIM] Amaliyot\n[MATN] O‘quvchilar uchun savol yoki topshiriq.';
const clone = value => JSON.parse(JSON.stringify(value));
const newId = () => globalThis.crypto?.randomUUID?.() || `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const when = value => value ? new Date(value).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

function Field({ label, hint, value, onChange, maxLength, multiline = false, rows = 3, ...props }) {
  const id = useId();
  return <div className="ps49-field"><div className="ps49-field-heading"><label htmlFor={id}>{label}</label>{maxLength && <span>{value?.length || 0}/{maxLength}</span>}</div>{multiline ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} rows={rows} {...props} /> : <input id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} {...props} />}{hint && <p className="ps49-help">{hint}</p>}</div>;
}

function SelectField({ label, value, onChange, children }) {
  const id = useId();
  return <div className="ps49-field"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}>{children}</select></div>;
}

function Segments({ label, value, options, onChange }) {
  return <div className="ps49-field"><span className="ps49-label">{label}</span><div className="ps49-segments" role="group" aria-label={label}>{options.map(option => <button type="button" key={option.value} className={value === option.value ? 'is-active' : ''} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></div>;
}

function PresetCard({ preset, selected, onClick, compact = false }) {
  const design = { ...DEFAULT_DESIGN, ...preset };
  const tokens = designTokens(design);
  return <button type="button" className={`ps49-preset${selected ? ' is-selected' : ''}${compact ? ' is-compact' : ''}`} onClick={onClick} aria-pressed={selected}><span className="ps49-preset-image" style={{ backgroundColor: tokens.background, backgroundImage: tokens.image ? `url("${tokens.image}")` : undefined }}><span className="ps49-preset-nav" style={{ background: tokens.panel }}><i style={{ background: tokens.accent }} /><i /><i /></span><span className="ps49-preset-panel" style={{ background: tokens.panel, borderColor: tokens.border }}><i style={{ background: tokens.color }} /><i style={{ background: tokens.muted }} /><b style={{ color: tokens.color }}>x² + y²</b></span></span><span className="ps49-preset-name">{preset.name}{selected && <Check size={15} />}</span>{!compact && <span className="ps49-preset-note">{preset.note}</span>}</button>;
}

function DesignControls({ draft, selected, scope, setScope, changeDesign, resetSlide, uploadBackground, busy }) {
  const slide = draft.slides[selected];
  const design = scope === 'slide' ? slide.design || draft.design : draft.design;
  const fileId = useId();
  return <section className="ps49-card ps49-design-controls" aria-label="Dizayn sozlamalari">
    <div className="ps49-card-title"><Palette size={19} /><h3>Dizayn</h3></div>
    <Segments label="Qayerga qo‘llanadi?" value={scope} onChange={setScope} options={[{ value: 'all', label: 'Barcha slaydlar' }, { value: 'slide', label: `${selected + 1}-slayd` }]} />
    <p className="ps49-help">{scope === 'all' ? 'O‘zgarish barcha slaydlarga qo‘llanadi. Alohida uslublar ham yangilanadi.' : slide.design ? 'Bu slaydning o‘z dizayni bor.' : 'Bu slayd umumiy dizayndan foydalanmoqda.'}</p>
    {scope === 'slide' && slide.design && <button type="button" className="ps49-text-button" onClick={resetSlide}><RotateCcw size={14} />Umumiy dizaynga qaytarish</button>}
    <details className="ps50-template-settings"><summary>Maket oilasini tanlash</summary><TemplateGallery value={design.template} onSelect={template => changeDesign({ ...template.defaults, template: template.id })} /></details>
    <Segments label="Slayd almashishi" value={design.transition} onChange={transition => changeDesign({ transition })} options={[{ value: 'none', label: 'Oddiy' }, { value: 'fade', label: 'Yumshoq' }, { value: 'push', label: 'Surilish' }, { value: 'wipe', label: 'Ochilib borish' }]} />
    <p className="ps49-help">Namoyishda slaydlar tugma yoki klaviatura bilan almashadi.</p>
    <div className="ps49-control-section"><h4><ImagePlus size={17} />1. Orqa fon</h4><p className="ps49-help">Butun slayd ortida turadigan rang yoki rasm.</p>
      <div className="ps49-mini-presets">{PRESETS.map(preset => <PresetCard key={preset.name} preset={preset} compact selected={design.background === preset.background} onClick={() => changeDesign({ background: preset.background, overlay: preset.overlay })} />)}</div>
      <Segments label="O‘zingiz tanlang" value={design.background} onChange={value => changeDesign({ background: value })} options={[{ value: 'solid', label: 'Bir xil rang' }, { value: 'image', label: 'O‘z rasmim' }]} />
      {design.background === 'solid' && <Field label="Fon rangi" value={design.color} type="color" onChange={color => changeDesign({ color })} />}
      {design.background === 'image' && <div className="ps49-image-upload"><button type="button" className="ps49-button ps49-button-small" disabled={!!busy} onClick={() => document.getElementById(fileId)?.click()}><Upload size={15} />{design.image ? 'Rasmni almashtirish' : 'Fon rasmini tanlash'}</button><input id={fileId} className="ps49-file-input" tabIndex={-1} type="file" accept="image/png,image/jpeg" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) uploadBackground(file); }} /><p className="ps49-help">PNG yoki JPG. Rasm moslashtirilib, 2 MB gacha siqiladi.</p>{design.image && <button type="button" className="ps49-text-button" onClick={() => { if (window.confirm('Fon rasmini olib tashlaysizmi?')) changeDesign({ image: null, background: 'aurora' }); }}>Fon rasmini olib tashlash</button>}</div>}
      <div className="ps49-field"><label htmlFor={`${fileId}-overlay`}>Fonni qoraytirish <strong>{design.overlay}%</strong></label><input id={`${fileId}-overlay`} type="range" min="0" max="90" step="5" value={design.overlay} onChange={event => changeDesign({ overlay: Number(event.target.value) })} /><p className="ps49-help">0% — asl fon. Foiz oshsa, fon qorayadi; ichki panel o‘zgarmaydi.</p></div>
    </div>
    <div className="ps49-control-section"><h4><Layers size={17} />2. Slayd ichidagi ko‘rinish</h4><p className="ps49-help">Sarlavha va matn ortidagi ichki panel. Orqa fon alohida qoladi.</p>
      <div className="ps49-panel-options" role="group" aria-label="Ichki panel ko‘rinishi">{[{ value: 'glass', label: 'Shaffof', detail: 'Fon ko‘rinib turadi' }, { value: 'solid', label: 'Yaxlit rang', detail: 'Matn orti yopiladi' }, { value: 'none', label: 'Panelsiz', detail: 'Matn bevosita fonda' }].map(option => <button type="button" key={option.value} onClick={() => changeDesign({ panel: option.value })} className={design.panel === option.value ? 'is-active' : ''} aria-pressed={design.panel === option.value}><span className={`ps49-panel-demo is-${option.value}`}><i /></span><strong>{option.label}</strong><small>{option.detail}</small></button>)}</div>
      <Segments label="Burchaklar" value={design.radius} onChange={radius => changeDesign({ radius })} options={[{ value: 'round', label: 'Yumaloq' }, { value: 'square', label: 'To‘g‘ri' }]} />
      <div className="ps49-field"><span className="ps49-label">Urg‘u rangi</span><div className="ps49-swatches" role="group" aria-label="Urg‘u rangi">{Object.entries(ACCENTS).map(([value, color], i) => <button type="button" key={value} style={{ background: color }} aria-label={['Moviy', 'Ko‘k', 'Binafsha', 'Yashil', 'Sariq'][i]} aria-pressed={design.accent === value} className={design.accent === value ? 'is-active' : ''} onClick={() => changeDesign({ accent: value })}>{design.accent === value && <Check size={18} />}</button>)}</div></div>
    </div>
    <div className="ps49-control-section"><h4><Type size={17} />3. Matn</h4><SelectField label="Matn rangi" value={design.text} onChange={text => changeDesign({ text })}><option value="auto">Avtomatik — fonga mos</option><option value="light">Oq matn</option><option value="dark">To‘q matn</option></SelectField><Segments label="Shrift" value={design.font} onChange={font => changeDesign({ font })} options={[{ value: 'sans', label: 'Sodda' }, { value: 'serif', label: 'Akademik' }]} /><Segments label="Matn kattaligi" value={design.size} onChange={size => changeDesign({ size })} options={[{ value: 'normal', label: 'Odatdagi' }, { value: 'large', label: 'Yirik' }]} /></div>
    <button type="button" className="ps49-text-button" onClick={() => changeDesign(clone(DEFAULT_DESIGN))}><RotateCcw size={14} />Boshlang‘ich dizaynga qaytarish</button>
  </section>;
}

function AdminSettings({ capabilities, request, onUpdate, onError }) {
  const [grades, setGrades] = useState(capabilities.settings?.grades || []);
  const [saving, setSaving] = useState(false);
  return <details className="ps49-admin"><summary>Administrator: o‘quvchilar uchun ruxsat</summary><p>O‘qituvchi va OTM foydalanuvchilaridan tashqari, qaysi sinflar taqdimot yaratishi mumkinligini belgilang.</p><div className="ps49-grade-options">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grade => <label key={grade}><input type="checkbox" checked={grades.includes(grade)} onChange={event => setGrades(previous => event.target.checked ? [...previous, grade].sort((a, b) => a - b) : previous.filter(value => value !== grade))} />{grade}-sinf</label>)}</div><button type="button" className="ps49-button ps49-button-small" disabled={saving} onClick={async () => { setSaving(true); try { const settings = await request('/settings', { method: 'PUT', body: { grades } }); onUpdate(settings.settings || settings); } catch (error) { if (error.name !== 'AbortError') onError(error.message); } finally { setSaving(false); } }}>{saving ? 'Saqlanmoqda…' : 'Ruxsatlarni saqlash'}</button></details>;
}

export default function PresentationStudio({ apiBase = '', token, user, active = true, onClose }) {
  const initial = useRef(makeProject());
  const [draft, setDraft] = useState(initial.current);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(initial.current));
  const [project, setProject] = useState(null);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);
  const [scope, setScope] = useState('all');
  const [editorPane, setEditorPane] = useState('content');
  const [count, setCount] = useState(5);
  const [capabilities, setCapabilities] = useState(null);
  const [capError, setCapError] = useState('');
  const [capAttempt, setCapAttempt] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [conflict, setConflict] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importConfirmed, setImportConfirmed] = useState(false);
  const [recovery, setRecovery] = useState(null);
  const [recoveryStatus, setRecoveryStatus] = useState('');
  const [presenting, setPresenting] = useState(false);
  const [presentAt, setPresentAt] = useState(0);
  const presenter = useRef(null);
  const importRun = useRef(0);
  const busyRef = useRef(false);
  const generation = useRef(0);
  const editCounter = useRef(0);
  const outlinePrepared = useRef(false);
  const session = useRef(0);
  const sessionAbort = useRef(new AbortController());
  const rootRef = useRef(null);
  const userId = user?.id ?? user?.user_id ?? user?.foydalanuvchi_id ?? user?._id;
  const storageKey = userId != null ? `kabutar:presentation:recovery:v1:${encodeURIComponent(apiBase)}:${userId}` : null;
  const serialized = useMemo(() => JSON.stringify(draft), [draft]);
  const dirty = serialized !== savedSnapshot;
  const errors = useMemo(() => [...validateDocument(draft), ...draft.slides.flatMap((slide, index) => formulaResult(slide.formula).error ? [`${index + 1}-slayd: formula yozilishini tekshiring.`] : [])], [draft]);
  const current = draft.slides[selected] || draft.slides[0];
  const request = useCallback((path, options = {}) => presentationRequest(apiBase, token, path, { ...options, signal: sessionAbort.current.signal }), [apiBase, token]);

  useEffect(() => {
    session.current += 1;
    sessionAbort.current.abort();
    sessionAbort.current = new AbortController();
    const epoch = session.current;
    setCapabilities(null); setCapError(''); setBusy(''); busyRef.current = false;
    request('/capabilities').then(value => { if (session.current === epoch) setCapabilities(value); }).catch(err => { if (session.current === epoch && err.name !== 'AbortError') setCapError(err.message); });
    return () => { session.current += 1; sessionAbort.current.abort(); };
  }, [request, capAttempt]);

  useEffect(() => {
    const fresh = makeProject();
    generation.current += 1; outlinePrepared.current = false; setDraft(fresh); setSavedSnapshot(JSON.stringify(fresh)); setProject(null); setStep(0); setCount(5); setSelected(0); setRecovery(null); setError(''); setNotice(''); setImportOpen(false); setLibraryOpen(false); setPresenting(false); importRun.current += 1;
    if (!storageKey) { setRecoveryStatus('Bu hisob uchun qurilmada tiklash mavjud emas. Serverga saqlashdan foydalaning.'); return; }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw && raw.length <= 12 * 1024 * 1024) {
        const recovered = JSON.parse(raw);
        const document = normalizeDocument(recovered.document);
        if (validateDocument(document).length === 0) setRecovery({ ...recovered, document });
      }
      setRecoveryStatus('Tiklash nusxasi ushbu qurilmada avtomatik yangilanadi.');
    } catch { setRecoveryStatus('Qurilmadagi tiklash nusxasini o‘qib bo‘lmadi. Serverga saqlang.'); }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !dirty || recovery) return;
    const timer = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify({ document: draft, project, savedAt: new Date().toISOString() })); setRecoveryStatus('Tiklash nusxasi ushbu qurilmada yangilandi. Serverga saqlash alohida.'); }
      catch { setRecoveryStatus('Qurilmada joy yetarli emas yoki saqlash yopilgan. Matningiz shu oynada bor — serverga saqlang.'); }
    }, 800);
    return () => clearTimeout(timer);
  }, [draft, dirty, project, recovery, storageKey]);

  useEffect(() => {
    if (!dirty) return;
    const protect = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [dirty]);

  useEffect(() => { if (!active) { setPresenting(false); setImportOpen(false); setLibraryOpen(false); } }, [active]);
  const updateDraft = update => { editCounter.current += 1; setDraft(previous => { const next = typeof update === 'function' ? update(previous) : update; draftRef.current = next; return next; }); };
  const patchSlide = patch => updateDraft(previous => ({ ...previous, slides: previous.slides.map((slide, index) => index === selected ? { ...slide, ...patch } : slide) }));
  const changeDesign = patch => updateDraft(previous => scope === 'all' ? { ...previous, design: { ...previous.design, ...patch }, slides: previous.slides.map(slide => ({ ...slide, design: null })) } : { ...previous, slides: previous.slides.map((slide, index) => index === selected ? { ...slide, design: { ...(slide.design || previous.design), ...patch } } : slide) });
  const showError = message => { setError(message); setNotice(''); };
  const confirmDiscard = () => !dirty || window.confirm('Serverga saqlanmagan o‘zgarishlar bor. Ularni almashtirishni xohlaysizmi?');
  const beginBusy = label => { if (busyRef.current) return false; busyRef.current = true; setBusy(label); setError(''); return true; };
  const endBusy = epoch => { if (session.current === epoch) { busyRef.current = false; setBusy(''); } };
  const replaceDocument = (document, meta = null, saved = false) => {
    generation.current += 1; outlinePrepared.current = true; updateDraft(document); setProject(meta); setSavedSnapshot(saved ? JSON.stringify(document) : null); setSelected(0); setCount(document.slides.length); setScope('all'); setStep(1); setConflict(false); setError(''); setNotice(''); setRecovery(null);
    if (storageKey) { try { localStorage.removeItem(storageKey); } catch { setRecoveryStatus('Eski tiklash nusxasini o‘chirib bo‘lmadi. Hozirgi loyihani serverga saqlang.'); } }
  };
  const loadLibrary = async () => {
    setLibraryOpen(true); setLibraryLoading(true); const epoch = session.current;
    try { const result = await request('/projects'); if (session.current === epoch) setProjects(result.projects || []); }
    catch (err) { if (session.current === epoch && err.name !== 'AbortError') showError(err.message); }
    finally { if (session.current === epoch) setLibraryLoading(false); }
  };
  const save = async (asCopy = false) => {
    if (errors.length) { showError(errors[0]); return; }
    if (!beginBusy('save')) return;
    const epoch = session.current; const revision = generation.current; const document = clone(draftRef.current); const snapshot = JSON.stringify(document); const currentProject = asCopy ? null : project;
    try {
      const result = await request(currentProject ? `/projects/${encodeURIComponent(currentProject.id)}` : '/projects', { method: currentProject ? 'PUT' : 'POST', body: { document, ...(currentProject ? { version: currentProject.version } : {}) }, timeout: 45000 });
      if (session.current !== epoch || generation.current !== revision) return;
      setProject({ id: result.project.id, version: result.project.version, updated_at: result.project.updated_at }); setSavedSnapshot(snapshot); setConflict(false); setNotice(asCopy ? 'Yangi nusxa serverga saqlandi.' : 'Loyiha serverga saqlandi.');
      if (storageKey && JSON.stringify(draftRef.current) === snapshot) {
        try { localStorage.removeItem(storageKey); setRecovery(null); setRecoveryStatus('Joriy nusxa serverga saqlangan. Yangi o‘zgarishlar uchun qurilmadagi tiklash avtomatik yangilanadi.'); }
        catch { setRecoveryStatus('Serverga saqlandi, ammo qurilmadagi eski tiklash nusxasi o‘chmadi.'); }
      }
    } catch (err) { if (session.current === epoch && generation.current === revision && err.name !== 'AbortError') { showError(err.message); if (err.status === 409) setConflict(true); } }
    finally { endBusy(epoch); }
  };
  const openProject = async item => {
    if (busyRef.current || !confirmDiscard() || !beginBusy(`open:${item.id}`)) return;
    const epoch = session.current; const revision = generation.current; const edits = editCounter.current;
    try { const result = await request(`/projects/${encodeURIComponent(item.id)}`); if (session.current === epoch && generation.current === revision) { if (editCounter.current !== edits) throw new Error('Yuklanish vaqtida joriy loyiha o‘zgardi. O‘zgarishlaringiz saqlanib turibdi; kerakli loyihani qayta tanlang.'); const document = normalizeDocument(result.project.document); const invalid = validateDocument(document); if (invalid.length) throw new Error(invalid[0]); replaceDocument(document, { id: result.project.id, version: result.project.version, updated_at: result.project.updated_at }, true); setLibraryOpen(false); } }
    catch (err) { if (session.current === epoch && err.name !== 'AbortError') showError(err.message); }
    finally { endBusy(epoch); }
  };
  const deleteProject = async item => {
    if (busyRef.current || !window.confirm(`“${item.title}” loyihasini serverdan o‘chirishni xohlaysizmi?`) || !beginBusy(`delete:${item.id}`)) return;
    const epoch = session.current;
    try { await request(`/projects/${encodeURIComponent(item.id)}?version=${encodeURIComponent(item.version)}`, { method: 'DELETE' }); if (session.current === epoch) { setProjects(previous => previous.filter(value => value.id !== item.id)); if (project?.id === item.id) { setProject(null); setSavedSnapshot(null); } setNotice('Loyiha serverdan o‘chirildi.'); } }
    catch (err) { if (session.current === epoch && err.name !== 'AbortError') showError(err.message); }
    finally { endBusy(epoch); }
  };
  const uploadImage = async (file, background, field = 'image') => {
    if (!beginBusy('image')) return;
    const epoch = session.current; const revision = generation.current; const slideId = current.id; const targetScope = scope;
    try {
      const image = await normalizeImage(file);
      if (session.current !== epoch || generation.current !== revision) return;
      updateDraft(previous => background ? targetScope === 'all' ? { ...previous, design: { ...previous.design, image, background: 'image' }, slides: previous.slides.map(slide => ({ ...slide, design: null })) } : { ...previous, slides: previous.slides.map(slide => slide.id === slideId ? { ...slide, design: { ...(slide.design || previous.design), image, background: 'image' } } : slide) } : { ...previous, slides: previous.slides.map(slide => slide.id === slideId ? { ...slide, [field]: image } : slide) });
      setNotice(background ? 'Fon rasmi qo‘shildi.' : 'Slayd rasmi qo‘shildi.');
    } catch (err) { if (session.current === epoch) showError(err.message); }
    finally { endBusy(epoch); }
  };
  const exportFile = async () => {
    if (errors.length) { showError(errors[0]); return; }
    if (!beginBusy('export')) return;
    const epoch = session.current; const document = clone(draftRef.current);
    try {
      const blob = await request('/export', { method: 'POST', body: { document }, binary: true, timeout: 90000 });
      if (session.current !== epoch) return;
      const url = URL.createObjectURL(blob); const link = window.document.createElement('a'); link.href = url; link.download = `${(document.title || 'Taqdimot').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 100)}.pptx`; window.document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); setNotice('PowerPoint fayli tayyor. Yuklab olish boshlandi.');
    } catch (err) { if (session.current === epoch && err.name !== 'AbortError') showError(err.message); }
    finally { endBusy(epoch); }
  };
  const importDocx = async file => {
    if (!/\.docx$/i.test(file.name) || file.size > 2 * 1024 * 1024) { setImportError('2 MB gacha bo‘lgan .docx faylni tanlang.'); return; }
    if (!beginBusy('import')) return;
    setImportError(''); const epoch = session.current; const run = ++importRun.current; const form = new FormData(); form.append('file', file);
    try { const result = await request('/import-docx', { method: 'POST', body: form, timeout: 45000 }); if (session.current === epoch && importRun.current === run) { setImportText(result.text || ''); setImportConfirmed(false); setNotice('Hujjat matni tayyor. Slaydlarga o‘tkazishdan oldin ko‘rib chiqing.'); } }
    catch (err) { if (session.current === epoch && err.name !== 'AbortError') setImportError(err.message); }
    finally { endBusy(epoch); }
  };
  const plannedImport = /\[SLAYD\s*:\s*\d+\]/i.test(importText);
  const importSlides = useMemo(() => {
    try {
      const slides = parseTaggedText(importText);
      if (!slides.length) return { slides, document: null, error: '' };
      const document = plannedImport ? applyTaggedImport(draft, importText, { strictPlan: true }) : { ...draft, slides };
      const invalid = validateDocument(document);
      return { slides, document, error: invalid[0] || '' };
    } catch (err) { return { slides: [], document: null, error: err.message }; }
  }, [importText, draft, plannedImport]);
  useEffect(() => { setImportConfirmed(false); }, [importText, serialized]);
  const closeImport = () => { importRun.current += 1; setImportOpen(false); setImportConfirmed(false); };
  const applyImport = () => {
    if (!importConfirmed || !importSlides.document || importSlides.error) return;
    const document = importSlides.document;
    generation.current += 1; outlinePrepared.current = true; updateDraft(document); setSelected(0); setCount(document.slides.length); setStep(1); setEditorPane('content'); closeImport(); setNotice(plannedImport ? `${document.slides.length} ta slayd mazmuni yangilandi. Rasmlar, joylashuvlar va dizayn saqlandi.` : `${document.slides.length} ta yangi slayd olindi. Matn va formulalarni tekshiring.`);
  };
  const downloadTemplate = async () => {
    if (errors.length) { showError(errors[0]); return; }
    if (!beginBusy('template')) return;
    const epoch = session.current; const document = clone(draftRef.current);
    try {
      const blob = await request('/template-docx', { method: 'POST', body: { document }, binary: true, timeout: 90000 });
      if (session.current !== epoch) return;
      const url = URL.createObjectURL(blob); const link = window.document.createElement('a'); link.href = url;
      link.download = `${(document.title || 'Taqdimot').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 90)}-mazmun-shabloni.docx`;
      window.document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      setNotice(`${document.slides.length} slayd uchun Word mazmun shabloni yuklanmoqda.`);
    } catch (err) { if (session.current === epoch && err.name !== 'AbortError') showError(err.message); }
    finally { endBusy(epoch); }
  };
  const copyAIInstruction = async () => {
    let taggedPlan;
    try { taggedPlan = buildTaggedTemplate(draft); } catch (err) { showError(err.message); return; }
    const text = `Quyidagi ${draft.slides.length} slaydlik rejani “${draft.title}” mavzusida to‘ldiring. Fan: ${draft.subject || 'ko‘rsatilmagan'}.\nSlaydlar soni, tartibi, [SLAYD:n], [ID], [MAKET] va [BOLIM] qiymatlarini aynan saqlang. Har bir slaydni [/SLAYD] bilan yoping. Faqat mavjud matn, formula, misol, rasm tavsifi va izoh maydonlarini to‘ldiring. Teglarni qo‘shmang yoki takrorlamang. [RASM1] va [RASM2] — rasm tavsifi, rasmning o‘zi saytda yuklanadi. Formulalar LaTeXda yozilsin. Sarlavha 100, MATN1 600, MATN2/MATN3 400, FORMULA 400, MISOL 250, rasm tavsifi 240, rasm izohi 100 belgidan oshmasin. Matnni slaydga sig‘adigan qisqa jumlalar bilan yozing; manbasiz fakt to‘qimang. Natijada faqat to‘ldirilgan tegli bloklarni qaytaring.\n\n${taggedPlan}`;
    try { await navigator.clipboard.writeText(text); setNotice('AI uchun yo‘riqnoma va aynan shu slaydlar rejasi nusxalandi. Uni tanlagan AI suhbatiga joylang.'); }
    catch { setImportText(text); setImportOpen(true); setImportError('Avtomatik nusxalash ishlamadi. Quyidagi matnni belgilang va nusxalang.'); }
  };
  const shiftSlide = direction => {
    const next = selected + direction; if (next < 0 || next >= draft.slides.length) return;
    updateDraft(previous => { const slides = [...previous.slides]; [slides[selected], slides[next]] = [slides[next], slides[selected]]; return { ...previous, slides }; }); setSelected(next);
  };
  const addSlide = duplicate => {
    if (draft.slides.length >= LIMITS.slides) return;
    const slide = duplicate ? { ...clone(current), id: newId() } : { ...makeSlides(1, { title: 'Yangi slayd' })[0], id: newId(), section: current.section || 'Kirish' };
    updateDraft(previous => ({ ...previous, slides: [...previous.slides.slice(0, selected + 1), slide, ...previous.slides.slice(selected + 1)] })); setSelected(selected + 1);
  };
  const removeSlide = () => {
    if (draft.slides.length <= 1 || !window.confirm(`“${current.title || `${selected + 1}-slayd`}” slaydini o‘chirishni xohlaysizmi?`)) return;
    updateDraft(previous => ({ ...previous, slides: previous.slides.filter((_, index) => index !== selected) })); setSelected(Math.max(0, selected - 1));
  };
  const goStep = value => {
    if (step === 0 && value > 0) {
      if (outlinePrepared.current && draft.slides.length !== count && !window.confirm(`Joriy slaydlar o‘rniga ${count} ta yangi slayd tayyorlansinmi?`)) return;
      if (!outlinePrepared.current || draft.slides.length !== count) updateDraft(previous => ({ ...previous, slides: makeSlides(count, { title: previous.title.slice(0, 100), subject: previous.subject, lesson_type: previous.lesson_type, design: previous.design }) }));
      outlinePrepared.current = true; setSelected(0);
    }
    setStep(value); rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const exit = () => { if (onClose && confirmDiscard()) onClose(); };
  const startPresenting = () => { setPresentAt(selected); setPresenting(true); };
  const fileId = useId();
  const currentLayout = getLayout(current.layout);
  const hiddenFields = ['body2', 'body3', 'image', 'image_prompt', 'image_caption', 'image2', 'image2_prompt', 'image2_caption'].filter(field => current[field] && !currentLayout.fields.includes(field.startsWith('image2') ? 'image2' : field.startsWith('image') ? 'image' : field));

  if (!active) return null;
  return <div className="ps49-studio" ref={rootRef}>
    <header className="ps49-header"><div className="ps49-brand"><span className="ps49-brand-icon"><Presentation size={24} /></span><div><p className="ps49-eyebrow">KABUTAR · TAQDIMOT</p><h1>Taqdimot ustaxonasi</h1></div></div><div className="ps49-header-actions">{capabilities?.allowed && <><button type="button" className="ps49-button" onClick={loadLibrary} disabled={!!busy}><FolderOpen size={17} /><span>Loyihalarim</span></button><button type="button" className="ps49-button" onClick={() => { if (confirmDiscard()) { replaceDocument(makeProject()); outlinePrepared.current = false; setStep(0); } }} disabled={!!busy}><Plus size={17} /><span>Yangi</span></button></>}{onClose && <button type="button" className="ps49-icon-button" aria-label="Taqdimot ustaxonasidan chiqish" onClick={exit}><X size={20} /></button>}</div></header>
    {!capabilities ? <div className="ps49-empty-state">{capError ? <><AlertCircle size={32} /><h2>Ulanishni tekshiring</h2><p role="alert">{capError}</p><button type="button" className="ps49-button" onClick={() => setCapAttempt(value => value + 1)}>Qayta urinish</button></> : <><LoaderCircle className="ps49-spin" size={30} /><p role="status">Taqdimot imkoniyatlari tekshirilmoqda…</p></>}</div> : <>
      {capabilities.admin && <AdminSettings capabilities={capabilities} request={request} onError={showError} onUpdate={settings => { setCapabilities(previous => ({ ...previous, settings })); setNotice('O‘quvchilar uchun ruxsatlar saqlandi.'); }} />}
      {!capabilities.allowed ? <div className="ps49-empty-state"><Presentation size={40} /><h2>Taqdimot yaratish uchun ruxsat kerak</h2><p>{capabilities.reason || 'Hisobingiz uchun bu bo‘lim hali yoqilmagan.'}</p><p>Ruxsat masalasida muassasa administratoriga murojaat qiling.</p></div> : <>
        <nav className="ps49-steps" aria-label="Taqdimot yaratish bosqichlari">{STEPS.map((label, index) => <button type="button" key={label} onClick={() => goStep(index)} className={step === index ? 'is-current' : step > index ? 'is-complete' : ''} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={16} /> : index + 1}</span><strong>{label}</strong>{index < 2 && <ChevronRight size={16} className="ps49-step-arrow" />}</button>)}</nav>
        <div className="ps49-save-bar"><div className={`ps49-save-status${dirty ? ' is-dirty' : ''}`}><Cloud size={17} /><span>{busy === 'save' ? 'Serverga saqlanmoqda…' : dirty ? 'Serverga saqlanmagan o‘zgarishlar' : project ? `Serverda saqlangan · ${when(project.updated_at)}` : 'Yangi loyiha · hali serverga saqlanmagan'}</span></div><button type="button" className="ps49-button ps49-primary ps49-button-small" onClick={() => save()} disabled={!!busy}><Save size={16} />{busy === 'save' ? 'Saqlanmoqda…' : 'Serverga saqlash'}</button></div>
        <p className="ps49-recovery-status">{recoveryStatus}</p>
        {recovery && <div className="ps49-banner ps49-recovery"><RotateCcw size={20} /><div><strong>Ushbu qurilmada tiklash nusxasi bor</strong><p>“{recovery.document.title}” · {when(recovery.savedAt)}. Bu serverdagi saqlash holatini tasdiqlamaydi.</p></div><button type="button" className="ps49-button ps49-button-small" onClick={() => { if (confirmDiscard()) { replaceDocument(recovery.document, recovery.project || null); setNotice('Qurilmadagi nusxa tiklandi. Serverga saqlang.'); } }}>Tiklash</button><button type="button" className="ps49-icon-button" aria-label="Tiklash taklifini yopish" onClick={() => setRecovery(null)}><X size={17} /></button></div>}
        {error && <div className="ps49-banner ps49-error" role="alert"><AlertCircle size={20} /><div><p>{error}</p>{conflict && <button type="button" className="ps49-button ps49-button-small" onClick={() => save(true)} disabled={!!busy}>Alohida nusxa sifatida saqlash</button>}</div><button type="button" className="ps49-icon-button" aria-label="Xato xabarini yopish" onClick={() => setError('')}><X size={16} /></button></div>}
        {notice && <div className="ps49-banner ps49-success" role="status"><CheckCircle2 size={18} /><p>{notice}</p><button type="button" className="ps49-icon-button" aria-label="Xabarni yopish" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {step === 0 && <div className="ps49-setup"><section className="ps49-card ps49-setup-form"><p className="ps49-eyebrow">1-QADAM</p><h2>Darsingiz nimadan boshlanadi?</h2><p className="ps49-intro">Mavzu va ko‘rinishni tanlang. Keyin har bir slaydga o‘z matningiz, rasmingiz va formulangizni joylang.</p><Field label="Taqdimot mavzusi" value={draft.title} onChange={title => updateDraft(previous => ({ ...previous, title }))} maxLength={160} placeholder="Masalan: Bir tekis to‘g‘ri chiziqli harakat" /><div className="ps49-two-fields"><Field label="Fan yoki kurs" value={draft.subject} onChange={subject => updateDraft(previous => ({ ...previous, subject }))} maxLength={100} placeholder="Masalan: Fizika · 9-sinf" /><SelectField label="Dars turi" value={draft.lesson_type} onChange={lesson_type => updateDraft(previous => ({ ...previous, lesson_type }))}>{Object.entries(LESSONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectField></div><div className="ps49-field"><span className="ps49-label">Nechta slayd kerak?</span><div className="ps49-counts" role="group" aria-label="Slaydlar soni">{COUNTS.map(value => <button type="button" key={value} className={count === value ? 'is-active' : ''} onClick={() => setCount(value)} aria-pressed={count === value}>{value}</button>)}</div><p className="ps49-help">15, 20 yoki 25 slayd tanlang: kirishdan xulosagacha izchil reja va turli joylashuvlar tayyorlanadi. Slaydlarni keyin ham o‘zgartirishingiz mumkin.</p></div><button type="button" className="ps49-button ps49-primary ps49-continue" disabled={!!busy || !draft.title.trim()} onClick={() => goStep(1)}>Dizayn va mazmunga o‘tish<ArrowRight size={18} /></button></section>
          <section className="ps49-setup-side"><div className="ps49-section-heading"><LayoutTemplate size={19} /><h3>5 xil maketdan birini tanlang</h3></div><p className="ps49-help">Har bir maketning uchta haqiqiy joylashuvini ko‘ring. “3 ko‘rinish” tugmasi qisqa namoyishni boshlaydi.</p><TemplateGallery value={draft.design.template} onSelect={template => updateDraft(previous => ({ ...previous, design: { ...previous.design, ...template.defaults, template: template.id }, slides: previous.slides.map(slide => ({ ...slide, design: null })) }))} /><div className="ps49-start-options"><button type="button" onClick={() => { if (confirmDiscard()) replaceDocument(sampleProject()); }} disabled={!!busy}><span className="ps49-option-icon">ƒ</span><span><strong>4 fan uchun formula namunasi</strong><small>Matematika, fizika, kimyo va biologiya</small></span><ChevronRight size={17} /></button><button type="button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><FileText size={23} /><span><strong>Hujjat yoki matndan boshlash</strong><small>.docx yoki belgilangan tayyor matn</small></span><ChevronRight size={17} /></button></div></section></div>}
        {step === 1 && <>
          <div className="ps49-editor-heading"><div><h2>Dizayn va mazmun</h2><p>Slaydni tanlang. “Mazmun” va “Dizayn” orqali tahrirlang.</p></div><button type="button" className="ps49-button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><Upload size={16} />Matn olish</button></div>
          <div className="ps50-plan-tools"><div><strong>Word yoki AI orqali mazmun tayyorlash</strong><p>{draft.slides.length} slayd · joriy bo‘limlar, joylashuvlar va maydonlar bilan.</p></div><div><button type="button" className="ps49-button" onClick={downloadTemplate} disabled={!!busy || !!errors.length}><Download size={17} />{busy === 'template' ? 'Tayyorlanmoqda…' : 'Word shablon'}</button><button type="button" className="ps49-button" onClick={copyAIInstruction} disabled={!!busy}><Copy size={17} />AI yo‘riqnomasini nusxalash</button></div></div>
          <div className="ps49-slide-strip" aria-label="Slaydni tanlash">{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={`ps49-slide-tab${selected === index ? ' is-active' : ''}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{slide.title || 'Sarlavhasiz'}</strong>{slide.design && <i title="Alohida dizayn">•</i>}</button>)}<button type="button" className="ps49-add-tab" disabled={draft.slides.length >= 40 || !!busy} onClick={() => addSlide(false)} aria-label="Yangi slayd qo‘shish"><Plus size={21} /></button></div>
          <div className="ps50-editor-grid">
            <div className="ps50-editor-controls">
              <div className="ps50-editor-tabs" role="tablist" aria-label="Slaydni tahrirlash"><button type="button" id="ps50-content-tab" role="tab" aria-selected={editorPane === 'content'} aria-controls="ps50-content-pane" tabIndex={editorPane === 'content' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('design'); document.getElementById('ps50-design-tab')?.focus(); } }} onClick={() => setEditorPane('content')}><FileText size={18} />Mazmun</button><button type="button" id="ps50-design-tab" role="tab" aria-selected={editorPane === 'design'} aria-controls="ps50-design-pane" tabIndex={editorPane === 'design' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('content'); document.getElementById('ps50-content-tab')?.focus(); } }} onClick={() => setEditorPane('design')}><Palette size={18} />Dizayn</button></div>
              {editorPane === 'design' ? <div id="ps50-design-pane" role="tabpanel" aria-labelledby="ps50-design-tab"><DesignControls draft={draft} selected={selected} scope={scope} setScope={setScope} changeDesign={changeDesign} resetSlide={() => patchSlide({ design: null })} uploadBackground={file => uploadImage(file, true)} busy={busy} /></div> : <section id="ps50-content-pane" role="tabpanel" aria-labelledby="ps50-content-tab" className="ps49-card ps49-content-editor">
                <div className="ps49-content-heading"><div className="ps49-card-title"><FileText size={19} /><h3>{selected + 1}-slayd mazmuni</h3></div><div className="ps49-slide-actions"><button type="button" className="ps49-icon-button" aria-label="Slaydni oldinga ko‘chirish" title="Oldinga ko‘chirish" disabled={selected === 0} onClick={() => shiftSlide(-1)}><ChevronLeft size={17} /></button><button type="button" className="ps49-icon-button" aria-label="Slaydni keyinga ko‘chirish" title="Keyinga ko‘chirish" disabled={selected === draft.slides.length - 1} onClick={() => shiftSlide(1)}><ChevronRight size={17} /></button><button type="button" className="ps49-icon-button" aria-label="Slayddan nusxa olish" title="Nusxa olish" disabled={draft.slides.length >= 40} onClick={() => addSlide(true)}><Copy size={16} /></button><button type="button" className="ps49-icon-button ps49-danger" aria-label="Slaydni o‘chirish" title="Slaydni o‘chirish" disabled={draft.slides.length <= 1} onClick={removeSlide}><Trash2 size={16} /></button></div></div>
                <div className="ps49-two-fields"><Field label="Slayd sarlavhasi" value={current.title} onChange={title => patchSlide({ title })} maxLength={LIMITS.slideTitle} /><Field label="Bo‘lim nomi" value={current.section} onChange={section => patchSlide({ section })} maxLength={LIMITS.section} hint="Bo‘limlar yo‘lagida ko‘rinadi." /></div>
                <LayoutPicker value={current.layout} onChange={layout => patchSlide({ layout })} />
                {Array.from({ length: currentLayout.textCount }, (_, i) => { const field = i === 0 ? 'body' : `body${i + 1}`; return <Field key={field} label={currentLayout.textCount === 1 ? 'Asosiy matn' : `${i + 1}-matn`} value={current[field] || ''} onChange={value => patchSlide({ [field]: value })} maxLength={i === 0 ? LIMITS.body : 400} multiline rows={3} placeholder="Asosiy fikrlar, tushuntirish yoki topshiriq…" />; })}
                {Array.from({ length: currentLayout.imageCount }, (_, i) => { const field = i === 0 ? 'image' : 'image2'; const promptField = i === 0 ? 'image_prompt' : 'image2_prompt'; const captionField = i === 0 ? 'image_caption' : 'image2_caption'; return <div key={field} className="ps50-image-field"><div className="ps50-image-heading"><h4>{i + 1}-rasm{current.layout === 'cover' ? ' · ixtiyoriy' : ''}</h4>{current[field] && <img src={current[field]} alt={`${i + 1}-rasmning kichik ko‘rinishi`} />}</div><div className="ps50-image-actions"><button type="button" className="ps49-button" disabled={!!busy} onClick={() => document.getElementById(`${fileId}-${field}`)?.click()}><ImagePlus size={17} />{current[field] ? 'Rasmni almashtirish' : 'Rasm yuklash'}</button><input id={`${fileId}-${field}`} type="file" className="ps49-file-input" tabIndex={-1} accept="image/png,image/jpeg" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) uploadImage(file, false, field); }} />{current[field] && <button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm(`${i + 1}-rasmni slayddan olib tashlaysizmi?`)) patchSlide({ [field]: null }); }}>Rasmni olib tashlash</button>}</div><Field label={`${i + 1}-rasm tavsifi`} value={current[promptField] || ''} onChange={value => patchSlide({ [promptField]: value })} maxLength={240} multiline rows={2} hint="Reja uchun tavsif. Rasm avtomatik yaratilmaydi; PNG yoki JPG faylini shu yerda yuklang." /><Field label={`${i + 1}-rasm ostidagi izoh`} value={current[captionField] || ''} onChange={value => patchSlide({ [captionField]: value })} maxLength={100} hint="Rasm qo‘shilganda slaydda ko‘rinadi." /></div>; })}
                <details className="ps50-extra-fields" open={current.layout === 'formula' || !!current.formula || !!current.example}><summary>Formula va misol · ixtiyoriy</summary><div className="ps49-formula-editor"><Field label="Formula (LaTeX)" value={current.formula} onChange={formula => patchSlide({ formula })} maxLength={400} multiline rows={2} spellCheck={false} placeholder={'Masalan: v=\\frac{s}{t}'} hint="Kasr, ildiz, daraja va indekslar qo‘llanadi. $ belgisi shart emas." /><div className="ps49-formula-buttons" role="group" aria-label="Formula belgilarini qo‘shish">{[{ label: 'Kasr', value: '\\frac{a}{b}' }, { label: 'Ildiz', value: '\\sqrt{x}' }, { label: 'Daraja', value: 'x^{2}' }, { label: 'Pastki indeks', value: 'a_{1}' }].map(item => <button type="button" key={item.label} disabled={current.formula.length + item.value.length + (current.formula ? 1 : 0) > 400} onClick={() => patchSlide({ formula: `${current.formula}${current.formula ? ' ' : ''}${item.value}` })}>{item.label}</button>)}</div>{formulaResult(current.formula).error && <p className="ps49-inline-error" role="alert">{formulaResult(current.formula).error}</p>}</div><Field label="Misol yoki qisqa izoh" value={current.example} onChange={example => patchSlide({ example })} maxLength={250} multiline rows={2} hint="Matematik ifodani Formula maydoniga yozing." /></details>
                {hiddenFields.length > 0 && <details className="ps50-extra-fields"><summary>Boshqa joylashuvdan saqlangan {hiddenFields.length} ta maydon</summary><p className="ps49-help">Bu mazmun joriy slaydda ko‘rinmaydi. Tegishli joylashuvga qaytsangiz, yana ko‘rinadi.</p><button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm('Joriy joylashuvda ko‘rinmayotgan matn va rasmlar butunlay o‘chirilsinmi?')) patchSlide(Object.fromEntries(hiddenFields.map(field => [field, ['image', 'image2'].includes(field) ? null : '']))); }}>Yashirin maydonlarni tozalash</button></details>}
              </section>}
            </div>
            <aside className="ps50-preview-sidebar"><section className="ps49-live-panel"><div className="ps49-live-heading"><span><i />Jonli ko‘rinish</span><button type="button" className="ps49-text-button" onClick={startPresenting}><Maximize2 size={16} />Kattalashtirish</button></div><SlidePreview document={draft} index={selected} onNavigate={setSelected} /><div className="ps49-preview-foot"><span>{selected + 1} / {draft.slides.length} slayd</span><span>{current.design ? 'Alohida dizayn' : 'Umumiy dizayn'}</span></div><div className="ps50-mini-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => Math.max(0, value - 1))}><ChevronLeft size={17} />Oldingi</button><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => Math.min(draft.slides.length - 1, value + 1))}>Keyingi<ChevronRight size={17} /></button></div></section><p className="ps49-help ps50-preview-tip">Aniq o‘qish uchun kattalashtiring. Tahrir qilish maydonlari chapda.</p></aside>
          </div>
          <div className="ps49-bottom-actions"><button type="button" className="ps49-button" onClick={() => goStep(0)}><ChevronLeft size={17} />Mavzu</button><button type="button" className="ps49-button ps49-primary" onClick={() => goStep(2)}>Ko‘rish va yuklash<ArrowRight size={17} /></button></div>
        </>}
        {step === 2 && <div className="ps49-review"><div className="ps49-review-header"><p className="ps49-eyebrow">3-QADAM</p><h2>Taqdimotingizni ko‘rib chiqing</h2><p>{draft.title} · {draft.slides.length} slayd{draft.subject && ` · ${draft.subject}`}</p></div><div className="ps49-review-grid"><div className="ps49-review-preview"><SlidePreview document={draft} index={selected} onNavigate={setSelected} transition /><div className="ps49-review-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => value - 1)}><ChevronLeft size={17} />Oldingi</button><span>{selected + 1} / {draft.slides.length}</span><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => value + 1)}>Keyingi<ChevronRight size={17} /></button></div></div><section className="ps49-card ps49-export-card"><span className="ps49-export-icon"><Presentation size={32} /></span><h3>Darsga tayyormisiz?</h3><p>Hozirgi matn va dizayn bilan PowerPoint faylini oling yoki shu yerning o‘zida namoyish qiling.</p><button type="button" className="ps49-button ps49-primary" disabled={!!busy || !!errors.length} onClick={exportFile}>{busy === 'export' ? <LoaderCircle className="ps49-spin" size={18} /> : <Download size={18} />}{busy === 'export' ? 'Fayl tayyorlanmoqda…' : 'PowerPoint yuklab olish'}</button><button type="button" className="ps49-button" onClick={startPresenting}><MonitorPlay size={18} />Namoyish qilish</button><p className="ps49-help">.pptx · 16:9 · Yuklash uchun avval serverga saqlash shart emas.</p>{errors.length > 0 && <div className="ps49-validation" role="alert"><strong>Avval tekshiring</strong><ul>{errors.slice(0, 4).map((message, index) => <li key={index}>{message}</li>)}</ul>{errors.length > 4 && <p>Yana {errors.length - 4} ta tuzatish kerak.</p>}</div>}<button type="button" className="ps49-text-button" onClick={() => goStep(1)}><ChevronLeft size={15} />Tahrirga qaytish</button></section></div><div className="ps49-review-thumbnails">{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)} aria-label={`${index + 1}-slaydni ko‘rish: ${slide.title}`} aria-pressed={selected === index}><SlidePreview document={draft} index={index} thumbnail /><span>{index + 1}. {slide.title}</span></button>)}</div></div>}
      </>}
    </>}
    {libraryOpen && <StudioDialog title="Loyihalarim" eyebrow="SHAXSIY LOYIHALAR" onClose={() => setLibraryOpen(false)} actions={<button type="button" className="ps49-button" onClick={loadLibrary} disabled={libraryLoading || !!busy}><RotateCcw size={16} />Ro‘yxatni yangilash</button>}><p className="ps49-intro">Serverga saqlangan loyihalaringiz. Har bir hisobda 50 tagacha loyiha.</p>{libraryLoading ? <p role="status">Loyihalar yuklanmoqda…</p> : !projects.length ? <div className="ps49-empty-library"><FolderOpen size={35} /><h3>Hali saqlangan loyiha yo‘q</h3><p>Taqdimotni “Serverga saqlash” tugmasi bilan shu yerga qo‘shing.</p></div> : <div className="ps49-project-list">{projects.map(item => <div className="ps49-project-row" key={item.id}><span className="ps49-project-symbol"><Presentation size={23} /></span><button type="button" className="ps49-project-open" disabled={!!busy} onClick={() => openProject(item)}><strong>{item.title}</strong><small>{item.subject || 'Fan belgilanmagan'} · {item.slide_count} slayd · {when(item.updated_at)}</small></button><button type="button" className="ps49-icon-button ps49-danger" aria-label={`“${item.title}” loyihasini o‘chirish`} disabled={!!busy} onClick={() => deleteProject(item)}><Trash2 size={17} /></button></div>)}</div>}{error && <p role="alert" className="ps49-inline-error">{error}</p>}</StudioDialog>}
    {importOpen && <StudioDialog title="Hujjat yoki matnni olish" eyebrow="MAZMUNNI KO‘RIB CHIQISH" className="ps49-import-modal" onClose={closeImport} actions={<button type="button" className="ps49-button ps49-primary" onClick={applyImport} disabled={!!busy || !importConfirmed || !importSlides.document || !!importSlides.error}>Mazmunni qo‘llash<ArrowRight size={16} /></button>}>
      <p className="ps49-intro">To‘ldirilgan Word shablonni yuklang yoki tegli matnni joylang. Quyidagi natijani tekshirgach, qo‘llashni tasdiqlang.</p>
      <div className="ps49-import-tools"><button type="button" className="ps49-button" disabled={!!busy} onClick={() => document.getElementById(`${fileId}-docx`)?.click()}><Upload size={17} />{busy === 'import' ? 'Hujjat o‘qilmoqda…' : '.docx tanlash'}</button><input id={`${fileId}-docx`} type="file" className="ps49-file-input" tabIndex={-1} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) importDocx(file); }} /><button type="button" className="ps49-text-button" disabled={!!busy} onClick={() => { if (!importText || window.confirm('Kiritilgan matnni joriy slaydlar rejasiga almashtirasizmi?')) { try { setImportText(buildTaggedTemplate(draft)); setImportError(''); } catch (err) { setImportError(err.message); } } }}>Joriy reja teglarini ko‘rish</button></div>
      <p className="ps49-help">Bu Word mazmun shakli: Word bezagi va rasmlari import qilinmaydi. [RASM1] va [RASM2] tavsiflari bo‘yicha haqiqiy rasmlarni saytda yuklang. .docx hajmi: 2 MB gacha.</p>
      <Field label="Ko‘rib chiqish va tahrirlash" value={importText} onChange={value => { setImportText(value); setImportError(''); }} multiline rows={8} disabled={busy === 'import'} maxLength={120000} placeholder={TAG_EXAMPLE} spellCheck={false} />
      {(importError || importSlides.error) && <p role="alert" className="ps49-inline-error">{importError || importSlides.error}</p>}
      <div className="ps49-import-result"><strong>{importSlides.slides.length} ta slayd aniqlandi · {plannedImport ? 'joriy reja' : 'yangi slaydlar'}</strong><p>{plannedImport ? 'Joriy slaydlarning matni, formulalari va rasm tavsiflari yangilanadi. Tartib, bo‘limlar, joylashuvlar, rasmlar va har bir slayd dizayni saqlanadi.' : 'Bu matnda reja identifikatorlari yo‘q. Qo‘llasangiz, joriy slaydlar yangi slaydlar bilan almashtiriladi. Eski rasmlar va slaydlarga alohida berilgan dizaynlar olinmaydi; umumiy dizayn saqlanadi.'}</p>
        {!!importSlides.slides.length && <div className="ps50-import-table-wrap"><table className="ps50-import-table"><thead><tr><th>Slayd</th><th>Yangi sarlavha</th><th>Maydonlar</th></tr></thead><tbody>{importSlides.slides.map((slide, index) => { const layout = getLayout(slide.layout); return <tr key={slide.id || index}><td>{index + 1}</td><td>{slide.title}<small>{slide.section}</small></td><td>{layout.textCount} matn · {layout.imageCount} rasm</td></tr>; })}</tbody></table></div>}
      </div>
      <label className="ps50-import-confirm"><input type="checkbox" checked={importConfirmed} disabled={!!busy || !importSlides.document || !!importSlides.error} onChange={event => setImportConfirmed(event.target.checked)} /><span>{plannedImport ? 'Natijani tekshirdim. Joriy reja bo‘yicha mazmun yangilanishini tasdiqlayman.' : 'Natijani tekshirdim. Joriy slaydlar almashtirilishini tasdiqlayman.'}</span></label>
      <details className="ps50-extra-fields"><summary>Eski matn belgilari haqida</summary><p className="ps49-help">[SLAYD], [BO‘LIM], [MATN], [FORMULA], [MISOL] hamda eski [s1], [1qator], [lat]…[/lat] teglari ham qabul qilinadi. Joriy rejaning aniq nusxasi uchun tahrir oynasidagi “Word shablon” tugmasidan foydalaning.</p></details>
    </StudioDialog>}
    {presenting && <OverlayPortal className="ps49-presenter" panelRef={presenter} label="Taqdimot namoyishi" onClose={() => setPresenting(false)} onKeyDown={event => {
      if (event.target?.closest('input,textarea,select') || (event.key === ' ' && event.target?.closest('button'))) return;
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) { event.preventDefault(); setPresentAt(value => Math.min(draft.slides.length - 1, value + 1)); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); setPresentAt(value => Math.max(0, value - 1)); }
      if (event.key === 'Home') { event.preventDefault(); setPresentAt(0); }
      if (event.key === 'End') { event.preventDefault(); setPresentAt(draft.slides.length - 1); }
    }}><header className="ps49-presenter-top"><span>{draft.title}</span><div><button type="button" className="ps49-presenter-button" onClick={() => { if (document.fullscreenElement === presenter.current) document.exitFullscreen?.().catch(() => {}); else presenter.current?.requestFullscreen?.().catch(() => setNotice('Brauzer to‘liq ekranga ruxsat bermadi. Keng ko‘rinishda davom etishingiz mumkin.')); }}><Maximize2 size={18} /><span>To‘liq ekran</span></button><button type="button" className="ps49-presenter-button" data-overlay-close onClick={() => setPresenting(false)}><X size={20} /><span>Yopish</span></button></div></header><main className="ps50-presenter-main"><div className="ps49-presenter-slide"><SlidePreview document={draft} index={presentAt} onNavigate={setPresentAt} transition /></div></main><footer className="ps49-presenter-bottom"><button type="button" className="ps49-presenter-button" onClick={() => setPresentAt(value => Math.max(0, value - 1))} disabled={presentAt === 0}><ChevronLeft size={21} /><span>Oldingi</span></button><span aria-live="polite">{presentAt + 1} / {draft.slides.length}<small>← → slaydlar · Esc yopish</small></span><button type="button" className="ps49-presenter-button" onClick={() => setPresentAt(value => Math.min(draft.slides.length - 1, value + 1))} disabled={presentAt === draft.slides.length - 1}><span>Keyingi</span><ChevronRight size={21} /></button></footer></OverlayPortal>}
  </div>;
}
