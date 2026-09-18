import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Cloud, Copy, Download, FileText, FolderOpen, ImagePlus, LayoutTemplate, LoaderCircle, Maximize2, MonitorPlay, Palette, Plus, Presentation, RotateCcw, Save, Sparkles, Trash2, Undo2, Redo2, Upload, X } from 'lucide-react';
import { DEFAULT_DESIGN, LIMITS, makeProject, makeSlides, normalizeDocument, validateDocument, normalizeImage, parseTaggedText, applyTaggedImport, buildTaggedTemplate, sampleProject, autoArrangeSlide } from './model.js';
import { presentationRequest } from './api.js';
import SlidePreview, { ACCENTS, formulaResult } from './SlidePreview.jsx';
import { getLayout, getFamily, TEMPLATES, LEGACY_TEMPLATES } from './layouts.js';
import { LayoutPicker, OverlayPortal, StudioDialog, TemplateGallery } from './PresentationUI.jsx';
import FreeformCanvas from './FreeformCanvas.jsx';
import StartScreen, { BackgroundGallery } from './StartScreen.jsx';
import { renderBackground, suggestTheme } from './backgrounds.js';
import './presentation-studio.css';

const STEPS = ['Mavzu va mazmun', 'Maket va tahrir', 'Ko‘rish va yuklash'];
const COUNTS = [5, 10, 15, 20, 25, 30, 40];
const HISTORY_LIMIT = 35;
const recommendedFamily = lesson => ({ lecture: 'arc', practice: 'pencil', seminar: 'spiral', lab: 'bands', project: 'glass' }[lesson] || 'glass');
const LESSONS = { lecture: 'Ma’ruza', practice: 'Amaliy mashg‘ulot', seminar: 'Seminar', lab: 'Laboratoriya', project: 'Loyiha himoyasi' };
const TAG_EXAMPLE = '[SLAYD] Mavzu nomi\n[BO‘LIM] Kirish\n[MATN] Asosiy tushunchani shu yerga yozing.\n[FORMULA] v=\\frac{s}{t}\n[MISOL] 100 metr yo‘l 20 soniyada bosib o‘tildi.\n\n[SLAYD] Mustaqil topshiriq\n[BO‘LIM] Amaliyot\n[MATN] O‘quvchilar uchun savol yoki topshiriq.';
const clone = value => JSON.parse(JSON.stringify(value));
const newId = () => globalThis.crypto?.randomUUID?.() || `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const when = value => value ? new Date(value).toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const SlideThumbnail = React.memo(function SlideThumbnail({ document, index }) {
  return <SlidePreview document={document} index={index} thumbnail />;
}, (previous, next) => previous.index === next.index && previous.sectionsKey === next.sectionsKey && previous.document.title === next.document.title && previous.document.subject === next.document.subject && previous.document.design === next.document.design && previous.document.slides.length === next.document.slides.length && previous.document.slides[previous.index] === next.document.slides[next.index]);

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

function DesignControls({ draft, selected, scope, setScope, changeDesign, resetSlide, uploadBackground, busy, applyTheme, bgMode, setBgMode, themeValue }) {
  const slide = draft.slides[selected];
  const design = scope === 'slide' ? slide.design || draft.design : draft.design;
  const fileId = useId();
  const family = getFamily(design.template);
  return <section className="ps49-card ps49-design-controls" aria-label="Dizayn sozlamalari">
    <div className="ps49-card-title"><Palette size={19} /><h3>Dizayn</h3></div>
    <SelectField label="Maket oilasi" value={family.id} onChange={id => { const template = TEMPLATES.find(item => item.id === id); if (template) changeDesign({ ...template.defaults, template: template.id }); }}>{TEMPLATES.map(template => <option key={template.id} value={template.id}>{template.label}</option>)}</SelectField>
    <div className="ps49-field"><span className="ps49-label">Urg‘u rangi</span><div className="ps49-swatches" role="group" aria-label="Urg‘u rangi">{Object.entries(ACCENTS).map(([value, color], i) => <button type="button" key={value} style={{ background: color }} aria-label={['Moviy', 'Ko‘k', 'Binafsha', 'Yashil', 'Sariq'][i]} aria-pressed={design.accent === value} className={design.accent === value ? 'is-active' : ''} onClick={() => changeDesign({ accent: value })}>{design.accent === value && <Check size={18} />}</button>)}</div></div>
    <div className="ps49-field"><span className="ps49-label">Orqa fon rasmi · ta’lim, fan va institut mavzulari</span>
      <BackgroundGallery compact value={design.background === 'image' && design.image ? themeValue : null} mode={bgMode} accent={design.accent} onMode={setBgMode} onSelect={id => applyTheme(id, bgMode)} onUpload={uploadBackground} ownImage={!!design.image} busy={busy} onClear={() => changeDesign({ image: null, background: 'paper', overlay: 0, text: 'auto' })} />
    </div>
    <SelectField label="Fon turi" value={design.background} onChange={background => changeDesign({ background, overlay: background === 'paper' || background === 'solid' ? 0 : design.overlay })}><option value="paper">Och fon</option><option value="midnight">To‘q fon</option><option value="aurora">Yumshoq ranglar</option><option value="solid">Rang tanlash</option><option value="image">Rasm (yuqoridan tanlangan yoki o‘zimniki)</option></SelectField>
    {design.background === 'solid' && <Field label="Fon rangi" value={design.color} type="color" onChange={color => changeDesign({ color })} />}
    {design.background === 'image' && !design.image && <p className="ps49-help">Yuqoridagi galereyadan mavzu tanlang yoki «O‘z rasmim» bilan PNG/JPG yuklang (2 MB gacha moslashtiriladi).</p>}
    <p className="ps49-help">{scope === 'all' ? 'Barcha slaydlarga qo‘llanadi.' : `${selected + 1}-slaydga qo‘llanadi.`}</p>
    <details className="ps50-extra-fields"><summary>Qo‘shimcha dizayn sozlamalari</summary>
      <Segments label="Qayerga qo‘llanadi?" value={scope} onChange={setScope} options={[{ value: 'all', label: 'Barcha slaydlar' }, { value: 'slide', label: 'Faqat shu slayd' }]} />
      {scope === 'slide' && slide.design && <button type="button" className="ps49-text-button" onClick={resetSlide}><RotateCcw size={14} />Umumiy dizaynga qaytarish</button>}
      {family.id === 'glass' && <SelectField label="Klassik rang va ko‘rinish varianti" value={design.template} onChange={id => { const theme = LEGACY_TEMPLATES.find(item => item.id === id); if (theme) changeDesign({ ...theme.defaults, template: id }); }}>{LEGACY_TEMPLATES.map(theme => <option key={theme.id} value={theme.id}>{theme.label}</option>)}</SelectField>}
      <Segments label="Ichki panel" value={design.panel} onChange={panel => changeDesign({ panel })} options={[{ value: 'glass', label: 'Shaffof' }, { value: 'solid', label: 'Yaxlit' }, { value: 'none', label: 'Panelsiz' }]} />
      <Segments label="Burchaklar" value={design.radius} onChange={radius => changeDesign({ radius })} options={[{ value: 'round', label: 'Yumaloq' }, { value: 'square', label: 'To‘g‘ri' }]} />
      <SelectField label="Matn rangi" value={design.text} onChange={text => changeDesign({ text })}><option value="auto">Avtomatik</option><option value="light">Oq</option><option value="dark">To‘q</option></SelectField>
      <Segments label="Shrift" value={design.font} onChange={font => changeDesign({ font })} options={[{ value: 'sans', label: 'Sodda' }, { value: 'serif', label: 'Akademik' }]} />
      <Segments label="Matn kattaligi" value={design.size} onChange={size => changeDesign({ size })} options={[{ value: 'normal', label: 'Odatdagi' }, { value: 'large', label: 'Yirik' }]} />
      <div className="ps49-field"><label htmlFor={`${fileId}-overlay`}>Fonni qoraytirish · {design.overlay}%</label><input id={`${fileId}-overlay`} type="range" min="0" max="90" step="5" value={design.overlay} onChange={event => changeDesign({ overlay: Number(event.target.value) })} /></div>
      <SelectField label="Slayd almashishi" value={design.transition} onChange={transition => changeDesign({ transition })}><option value="none">Oddiy</option><option value="fade">Yumshoq</option><option value="push">Surilish</option><option value="wipe">Ochilib borish</option></SelectField>
      <button type="button" className="ps49-text-button" onClick={() => changeDesign(clone(DEFAULT_DESIGN))}><RotateCcw size={14} />Boshlang‘ich dizayn</button>
    </details>
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
  const [count, setCount] = useState(10);
  const [startMode, setStartMode] = useState('manual'); // manual | ai | word — boshlash ekranidagi 3 yirik tugma
  const [familyMode, setFamilyMode] = useState('auto');
  const [bgTheme, setBgTheme] = useState('auto');   // auto | none | <mavzu id>
  const [bgMode, setBgMode] = useState('light');    // light | dark
  const [wordFlow, setWordFlow] = useState(false);  // Word shablon yo'li tanlanganda tahrir tepasida 3 qadam ko'rinadi
  const [workspaceMode, setWorkspaceMode] = useState('form');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiElapsed, setAiElapsed] = useState(0);
  const [aiError, setAiError] = useState('');
  const [aiReview, setAiReview] = useState(null);
  const [aiReviewAt, setAiReviewAt] = useState(0);
  const aiAbort = useRef(null);
  const aiRun = useRef(0);
  const history = useRef({ past: [], future: [], group: null, at: 0 });
  const [, refreshHistory] = useState(0);
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
  const sectionsKey = useMemo(() => draft.slides.map(slide => slide.section).join('\u0000'), [draft.slides]);
  const dirty = serialized !== savedSnapshot;
  const errors = useMemo(() => [...validateDocument(draft), ...draft.slides.flatMap((slide, index) => formulaResult(slide.formula).error ? [`${index + 1}-slayd: formula yozilishini tekshiring.`] : [])], [draft]);
  const current = draft.slides[selected] || draft.slides[0];
  const aiAvailable = capabilities?.ai?.enabled === true && capabilities?.ai?.available !== false;
  const request = useCallback((path, options = {}) => presentationRequest(apiBase, token, path, { ...options, signal: options.signal || sessionAbort.current.signal }), [apiBase, token]);

  useEffect(() => {
    session.current += 1;
    aiAbort.current?.abort(); aiRun.current += 1; setAiRunning(false); setAiReview(null);
    sessionAbort.current.abort();
    sessionAbort.current = new AbortController();
    const epoch = session.current;
    setCapabilities(null); setCapError(''); setBusy(''); busyRef.current = false;
    request('/capabilities').then(value => { if (session.current === epoch) setCapabilities(value); }).catch(err => { if (session.current === epoch && err.name !== 'AbortError') setCapError(err.message); });
    return () => { session.current += 1; sessionAbort.current.abort(); aiAbort.current?.abort(); };
  }, [request, capAttempt]);

  useEffect(() => {
    const fresh = makeProject();
    generation.current += 1; outlinePrepared.current = false; draftRef.current = fresh; setDraft(fresh); setSavedSnapshot(JSON.stringify(fresh)); setProject(null); setStep(0); setCount(15); setSelected(0); setRecovery(null); setError(''); setNotice(''); setImportOpen(false); setLibraryOpen(false); setPresenting(false); importRun.current += 1;
    history.current = { past: [], future: [], group: null, at: 0 }; setStartMode('manual'); setFamilyMode('auto'); setBgTheme('auto'); setWordFlow(false); setAiInstructions(''); setAiError('');
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

  useEffect(() => { if (!active) { setPresenting(false); setImportOpen(false); setLibraryOpen(false); aiAbort.current?.abort(); aiRun.current += 1; setAiRunning(false); setAiReview(null); } }, [active]);
  useEffect(() => { if (!aiRunning) return undefined; const started = Date.now(); setAiElapsed(0); const timer = setInterval(() => setAiElapsed(Math.floor((Date.now() - started) / 1000)), 1000); return () => clearInterval(timer); }, [aiRunning]);
  const updateDraft = (update, group = null) => {
    const previous = draftRef.current;
    const next = typeof update === 'function' ? update(previous) : update;
    if (previous === next) return;
    const state = history.current;
    if (!group || state.group !== group || Date.now() - state.at > 750) state.past = [...state.past, previous].slice(-HISTORY_LIMIT);
    state.future = []; state.group = group; state.at = Date.now();
    editCounter.current += 1; draftRef.current = next; setDraft(next);
  };
  const travelHistory = direction => {
    const state = history.current; const source = direction < 0 ? state.past : state.future;
    if (!source.length) return;
    const next = source.pop();
    if (direction < 0) state.future.push(draftRef.current); else state.past.push(draftRef.current);
    state.group = null; editCounter.current += 1; draftRef.current = next; setDraft(next); setSelected(index => Math.min(index, next.slides.length - 1)); setCount(next.slides.length); refreshHistory(value => value + 1);
  };
  const patchSlide = patch => updateDraft(previous => ({ ...previous, slides: previous.slides.map((slide, index) => index === selected ? { ...slide, ...patch } : slide) }), Object.keys(patch).length === 1 && typeof Object.values(patch)[0] === 'string' ? `${current.id}:${Object.keys(patch)[0]}` : null);
  const changeDesign = patch => updateDraft(previous => scope === 'all' ? { ...previous, design: { ...previous.design, ...patch }, slides: previous.slides.map(slide => ({ ...slide, design: null })) } : { ...previous, slides: previous.slides.map((slide, index) => index === selected ? { ...slide, design: { ...(slide.design || previous.design), ...patch } } : slide) });
  const showError = message => { setError(message); setNotice(''); };
  const confirmDiscard = () => !dirty || window.confirm('Serverga saqlanmagan o‘zgarishlar bor. Ularni almashtirishni xohlaysizmi?');
  const beginBusy = label => { if (busyRef.current) return false; busyRef.current = true; setBusy(label); setError(''); return true; };
  const endBusy = epoch => { if (session.current === epoch) { busyRef.current = false; setBusy(''); } };
  const replaceDocument = (document, meta = null, saved = false) => {
    aiAbort.current?.abort(); aiRun.current += 1; setAiRunning(false); setAiReview(null); setAiError('');
    generation.current += 1; outlinePrepared.current = true; updateDraft(document); setProject(meta); setSavedSnapshot(saved ? JSON.stringify(document) : null); setSelected(0); setCount(document.slides.length); setScope('all'); setStep(1); setConflict(false); setError(''); setNotice(''); setRecovery(null);
    history.current = { past: [], future: [], group: null, at: 0 }; setFamilyMode('manual');
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
    aiAbort.current?.abort(); aiRun.current += 1; setAiRunning(false); setAiReview(null);
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
    updateDraft(previous => ({ ...previous, slides: [...previous.slides.slice(0, selected + 1), slide, ...previous.slides.slice(selected + 1)] })); setSelected(selected + 1); setCount(draftRef.current.slides.length);
  };
  const removeSlide = () => {
    if (draft.slides.length <= 1 || !window.confirm(`“${current.title || `${selected + 1}-slayd`}” slaydini o‘chirishni xohlaysizmi?`)) return;
    updateDraft(previous => ({ ...previous, slides: previous.slides.filter((_, index) => index !== selected) })); setSelected(Math.max(0, selected - 1)); setCount(draftRef.current.slides.length);
  };
  const cancelAI = () => { aiAbort.current?.abort(); aiRun.current += 1; setAiRunning(false); setNotice('AI tayyorlash to‘xtatildi. Joriy mazmun saqlandi.'); };
  const generateAI = async (slideIds, source = draftRef.current) => {
    if (!aiAvailable) { setAiError('AI xizmati hozir yoqilmagan. Mazmunni o‘zingiz to‘ldirishingiz yoki Word orqali olishingiz mumkin.'); return; }
    const invalid = validateDocument(source); if (invalid.length) { setAiError(invalid[0]); return; }
    const controller = new AbortController(); aiAbort.current?.abort(); aiAbort.current = controller;
    const run = ++aiRun.current; const epoch = session.current; const revision = generation.current;
    const document = clone(source); const snapshot = JSON.stringify(source);
    const ids = slideIds?.length ? [...slideIds] : document.slides.map(slide => slide.id);
    setAiRunning(true); setAiError(''); setAiReview(null); setNotice('');
    try {
      const result = await request('/ai/generate', { method: 'POST', body: { document, brief: { audience: document.audience || '', instructions: aiInstructions }, ...(slideIds?.length ? { slide_ids: ids } : {}) }, signal: controller.signal, timeout: 210000 });
      if (run !== aiRun.current || session.current !== epoch || generation.current !== revision || controller.signal.aborted) return;
      const proposal = normalizeDocument(result.document);
      const problems = validateDocument(proposal);
      if (problems.length) throw new Error(problems[0]);
      if (proposal.slides.length !== document.slides.length || proposal.slides.some((slide, index) => slide.id !== document.slides[index].id || slide.layout !== document.slides[index].layout)) throw new Error('AI javobidagi slaydlar rejaga mos kelmadi. Qayta urinib ko‘ring.');
      // Only content in the requested slides may be proposed; the user's structure and visuals remain authoritative.
      const fields = ['title', 'body', 'body2', 'body3', 'formula', 'example', 'image_prompt', 'image2_prompt', 'image_caption', 'image2_caption'];
      const merged = { ...document, slides: document.slides.map((slide, index) => ids.includes(slide.id) ? { ...slide, ...Object.fromEntries(fields.map(field => [field, proposal.slides[index][field]])) } : slide) };
      const formulaError = merged.slides.find(slide => formulaResult(slide.formula).error);
      if (formulaError) throw new Error('AI formulasini tekshirib bo‘lmadi. Qayta tayyorlashga urinib ko‘ring.');
      const indexes = merged.slides.map((slide, index) => ids.includes(slide.id) ? index : -1).filter(index => index >= 0);
      setAiReview({ document: merged, snapshot, ids, indexes, revision, count: indexes.length, warnings: Array.isArray(result.warnings) ? result.warnings.filter(item => typeof item === 'string').slice(0, 10) : [] });
      setAiReviewAt(indexes[0] || 0);
    } catch (err) { if (run === aiRun.current && session.current === epoch && !controller.signal.aborted) setAiError(err.message || 'AI javobi olinmadi. Qayta urinib ko‘ring.'); }
    finally { if (run === aiRun.current && session.current === epoch) { setAiRunning(false); aiAbort.current = null; } }
  };
  const applyAI = () => {
    if (!aiReview) return;
    if (generation.current !== aiReview.revision || JSON.stringify(draftRef.current) !== aiReview.snapshot) { setAiError('Tayyorlash davomida loyiha o‘zgargan. Joriy mazmun uchun AI natijasini qayta tayyorlang.'); return; }
    updateDraft(aiReview.document); setAiReview(null); setNotice(`${aiReview.count} ta slayd mazmuni qo‘llandi. Faktlar va formulalarni darsdan oldin tekshiring.`);
  };
  const goStep = value => {
    if (step === 0 && value > 0) {
      if (outlinePrepared.current && draft.slides.length !== count && !window.confirm(`Joriy slaydlar o‘rniga ${count} ta yangi slayd tayyorlansinmi?`)) return;
      const needsOutline = !outlinePrepared.current || draft.slides.length !== count;
      if (needsOutline) {
        const template = TEMPLATES.find(item => item.id === recommendedFamily(draft.lesson_type));
        generation.current += 1;
        updateDraft(previous => { const design = familyMode === 'auto' && template ? { ...previous.design, ...template.defaults, template: template.id } : previous.design; return { ...previous, design, slides: makeSlides(count, { title: previous.title.slice(0, 100), subject: previous.subject, lesson_type: previous.lesson_type, design }) }; });
      }
      outlinePrepared.current = true; setSelected(0);
      if (needsOutline && bgTheme !== 'none') applyThemeBackground(bgTheme === 'auto' ? suggestTheme(draftRef.current.subject, draftRef.current.audience) : bgTheme, bgMode);
      setWordFlow(startMode === 'word');
      if (needsOutline && startMode === 'ai' && aiAvailable) generateAI(undefined, draftRef.current);
    }
    setStep(value); rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  // Mavzuli fon: brauzerda chiziladi va oddiy "O'z rasmim" kabi design.image ga tushadi —
  // shu sabab ko'rinish ham, PowerPoint eksporti ham o'zgarishsiz ishlaydi.
  const applyThemeBackground = (themeId, mode = bgMode, scopeOverride = 'all') => {
    const accent = (draftRef.current.design || DEFAULT_DESIGN).accent || 'blue';
    setBgTheme(themeId); setBgMode(mode);
    renderBackground(themeId, { mode, accent }).then(image => {
      const patch = { background: 'image', image, overlay: mode === 'dark' ? 30 : 8, text: mode === 'dark' ? 'light' : 'dark' };
      if (scopeOverride === 'slide') { changeDesign(patch); return; } // changeDesign scope='slide' bo'lsa faqat shu slaydga
      updateDraft(previous => ({ ...previous, design: { ...previous.design, ...patch }, slides: previous.slides.map(slide => slide.design ? { ...slide, design: { ...slide.design, ...patch } } : slide) }), 'background');
    }).catch(() => showError('Fon rasmi tayyorlanmadi. Boshqa fonni tanlab ko‘ring.'));
  };
  const exit = () => { if (onClose && confirmDiscard()) onClose(); };
  const startPresenting = () => { setPresentAt(selected); setPresenting(true); };
  const fileId = useId();
  const currentLayoutMeta = getLayout(current.layout);
  const isClassicFamily = getFamily((current.design || draft.design).template).id === 'glass';
  const currentLayout = isClassicFamily ? currentLayoutMeta : {
    ...currentLayoutMeta,
    textCount: Math.max(currentLayoutMeta.textCount, current.body3 ? 3 : current.body2 ? 2 : 1),
    imageCount: Math.max(currentLayoutMeta.imageCount, current.image2 || current.image2_prompt ? 2 : current.image || current.image_prompt ? 1 : 0),
    fields: [...new Set([...currentLayoutMeta.fields, ...(current.body2 ? ['body2'] : []), ...(current.body3 ? ['body3'] : []), ...(current.image || current.image_prompt ? ['image'] : []), ...(current.image2 || current.image2_prompt ? ['image2'] : [])])],
  };
  const hiddenFields = ['body2', 'body3', 'image', 'image_prompt', 'image_caption', 'image2', 'image2_prompt', 'image2_caption'].filter(field => current[field] && !currentLayout.fields.includes(field.startsWith('image2') ? 'image2' : field.startsWith('image') ? 'image' : field));

  if (!active) return null;
  return <div className="ps49-studio" ref={rootRef}>
    <header className="ps49-header"><div className="ps49-brand"><span className="ps49-brand-icon"><Presentation size={24} /></span><div><p className="ps49-eyebrow">KABUTAR · TAQDIMOT</p><h1>Taqdimot ustaxonasi</h1></div></div><div className="ps49-header-actions">{capabilities?.allowed && <><button type="button" className="ps49-button" onClick={loadLibrary} disabled={!!busy}><FolderOpen size={17} /><span>Loyihalarim</span></button><button type="button" className="ps49-button" onClick={() => { if (confirmDiscard()) { replaceDocument(makeProject()); outlinePrepared.current = false; setCount(10); setFamilyMode('auto'); setBgTheme('auto'); setWordFlow(false); setStep(0); } }} disabled={!!busy}><Plus size={17} /><span>Yangi</span></button></>}{onClose && <button type="button" className="ps49-icon-button" aria-label="Taqdimot ustaxonasidan chiqish" onClick={exit}><X size={20} /></button>}</div></header>
    {!capabilities ? <div className="ps49-empty-state">{capError ? <><AlertCircle size={32} /><h2>Ulanishni tekshiring</h2><p role="alert">{capError}</p><button type="button" className="ps49-button" onClick={() => setCapAttempt(value => value + 1)}>Qayta urinish</button></> : <><LoaderCircle className="ps49-spin" size={30} /><p role="status">Taqdimot imkoniyatlari tekshirilmoqda…</p></>}</div> : <>
      {capabilities.admin && <AdminSettings capabilities={capabilities} request={request} onError={showError} onUpdate={settings => { setCapabilities(previous => ({ ...previous, settings })); setNotice('O‘quvchilar uchun ruxsatlar saqlandi.'); }} />}
      {!capabilities.allowed ? <div className="ps49-empty-state"><Presentation size={40} /><h2>Taqdimot yaratish uchun ruxsat kerak</h2><p>{capabilities.reason || 'Hisobingiz uchun bu bo‘lim hali yoqilmagan.'}</p><p>Ruxsat masalasida muassasa administratoriga murojaat qiling.</p></div> : <>
        <nav className="ps49-steps" aria-label="Taqdimot yaratish bosqichlari">{STEPS.map((label, index) => <button type="button" key={label} onClick={() => goStep(index)} className={step === index ? 'is-current' : step > index ? 'is-complete' : ''} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={16} /> : index + 1}</span><strong>{label}</strong>{index < 2 && <ChevronRight size={16} className="ps49-step-arrow" />}</button>)}</nav>
        <div className="ps49-save-bar"><div className={`ps49-save-status${dirty ? ' is-dirty' : ''}`}><Cloud size={17} /><span>{busy === 'save' ? 'Serverga saqlanmoqda…' : dirty ? 'Serverga saqlanmagan o‘zgarishlar' : project ? `Serverda saqlangan · ${when(project.updated_at)}` : 'Yangi loyiha · hali serverga saqlanmagan'}</span></div><button type="button" className="ps49-button ps49-primary ps49-button-small" onClick={() => save()} disabled={!!busy}><Save size={16} />{busy === 'save' ? 'Saqlanmoqda…' : 'Serverga saqlash'}</button></div>
        <p className="ps49-recovery-status">{recoveryStatus}</p>
        {recovery && <div className="ps49-banner ps49-recovery"><RotateCcw size={20} /><div><strong>Ushbu qurilmada tiklash nusxasi bor</strong><p>“{recovery.document.title}” · {when(recovery.savedAt)}. Bu serverdagi saqlash holatini tasdiqlamaydi.</p></div><button type="button" className="ps49-button ps49-button-small" onClick={() => { if (confirmDiscard()) { replaceDocument(recovery.document, recovery.project || null); setNotice('Qurilmadagi nusxa tiklandi. Serverga saqlang.'); } }}>Tiklash</button><button type="button" className="ps49-icon-button" aria-label="Tiklash taklifini yopish" onClick={() => setRecovery(null)}><X size={17} /></button></div>}
        {error && <div className="ps49-banner ps49-error" role="alert"><AlertCircle size={20} /><div><p>{error}</p>{conflict && <button type="button" className="ps49-button ps49-button-small" onClick={() => save(true)} disabled={!!busy}>Alohida nusxa sifatida saqlash</button>}</div><button type="button" className="ps49-icon-button" aria-label="Xato xabarini yopish" onClick={() => setError('')}><X size={16} /></button></div>}
        {notice && <div className="ps49-banner ps49-success" role="status"><CheckCircle2 size={18} /><p>{notice}</p><button type="button" className="ps49-icon-button" aria-label="Xabarni yopish" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {aiRunning && <div className="ps49-banner ps51-ai-progress" role="status"><LoaderCircle size={21} className="ps49-spin" /><div><strong>AI mazmunni tayyorlamoqda…</strong><p>{aiElapsed < 20 ? 'Dars mazmuni slaydlar rejasiga moslanmoqda.' : 'AI mazmunni tayyorlashda davom etmoqda. Ko‘p slaydli taqdimot biroz vaqt oladi.'} {aiElapsed > 0 && `${aiElapsed} soniya`}</p><p className="ps49-help">Tayyor natijani qo‘llashdan oldin ko‘rib chiqasiz.</p></div><button type="button" className="ps49-button ps49-button-small" onClick={cancelAI}><X size={16} />Bekor qilish</button></div>}
        {aiError && <div className="ps49-banner ps49-error" role="alert"><AlertCircle size={20} /><div><strong>AI natijasi qo‘llanmadi</strong><p>{aiError}</p><p className="ps49-help">Mavjud mazmunni tahrirlashda davom etishingiz mumkin.</p></div><button type="button" className="ps49-icon-button" aria-label="AI xabarini yopish" onClick={() => setAiError('')}><X size={16} /></button></div>}
        {step === 0 && <StartScreen draft={draft} updateDraft={updateDraft} count={count} setCount={setCount} mode={startMode} setMode={setStartMode}
          aiAvailable={aiAvailable} aiInstructions={aiInstructions} setAiInstructions={setAiInstructions}
          bgTheme={bgTheme} setBgTheme={setBgTheme} bgMode={bgMode} setBgMode={setBgMode}
          onStart={() => goStep(1)} busy={busy} aiRunning={aiRunning}
          familyPicker={<TemplateGallery value={draft.design.template} templates={TEMPLATES} onSelect={template => { setFamilyMode('manual'); updateDraft(previous => ({ ...previous, design: { ...previous.design, ...template.defaults, template: template.id }, slides: previous.slides.map(slide => slide.design ? { ...slide, design: { ...slide.design, ...template.defaults, template: template.id } } : slide) })); }} />}
          advanced={<div className="ps49-setup-side"><div className="ps49-start-options"><button type="button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><FileText size={23} /><span><strong>Word yoki tayyor matndan olish</strong><small>Avvalgi hujjat shakllari ham ishlaydi</small></span><ChevronRight size={17} /></button><button type="button" onClick={() => { if (confirmDiscard()) replaceDocument(sampleProject()); }} disabled={!!busy}><span className="ps49-option-icon">ƒ</span><span><strong>Formula namunasini ochish</strong><small>Matematika, fizika, kimyo va biologiya</small></span><ChevronRight size={17} /></button></div>
        </div>} />}
        {step === 1 && <>
          <div className="ps49-editor-heading"><div><h2>Maket va tahrir</h2><p>Slaydni tanlang, matnni yozing va kerakli joyiga suring.</p></div><button type="button" className="ps49-button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><Upload size={16} />Matn olish</button></div>
          {wordFlow && <section className="ps60-word-flow" aria-label="Word shablon bilan 3 qadam">
            <div className="ps60-word-head"><div><strong>Word shablon bilan — 3 qadam</strong><p>Shablonda har slayd uchun nima yozilishi, kimga va so‘z chegaralari ko‘rsatilgan. AI to‘ldirgan faylni qaytarib yuklasangiz, matn o‘z joyiga tushadi.</p></div><button type="button" className="ps49-icon-button" aria-label="Word qadamlarini yashirish" onClick={() => setWordFlow(false)}><X size={16} /></button></div>
            <div className="ps60-word-steps">
              <button type="button" className="ps60-word-step" onClick={downloadTemplate} disabled={!!busy || !!errors.length}><span>1</span><strong>{busy === 'template' ? 'Tayyorlanmoqda…' : 'Word shablonni yuklab olish'}</strong><small>{draft.slides.length} slayd uchun to‘ldirish shakli (.docx)</small></button>
              <button type="button" className="ps60-word-step" onClick={copyAIInstruction} disabled={!!busy}><span>2</span><strong>AI uchun yo‘riqnomani nusxalash</strong><small>ChatGPT, Gemini yoki boshqa AI’ga Word fayl bilan birga bering</small></button>
              <button type="button" className="ps60-word-step" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><span>3</span><strong>To‘ldirilgan faylni qaytarish</strong><small>.docx ni yuklang — slaydlar to‘ladi, keyin PowerPoint yuklab oling</small></button>
            </div>
          </section>}
          <div className="ps51-editor-toolbar"><div className="ps51-history" role="group" aria-label="Tahrir tarixi"><button type="button" className="ps49-button ps49-button-small" disabled={!history.current.past.length} onClick={() => travelHistory(-1)}><Undo2 size={16} />Bekor qilish</button><button type="button" className="ps49-button ps49-button-small" disabled={!history.current.future.length} onClick={() => travelHistory(1)}><Redo2 size={16} />Qaytarish</button></div><div className="ps51-editor-ai"><button type="button" className="ps49-button ps49-button-small" disabled={!!busy || aiRunning || !aiAvailable} onClick={() => generateAI([current.id])}><Sparkles size={16} />Shu slaydga AI</button><button type="button" className="ps49-button ps49-button-small" disabled={!!busy || aiRunning || !aiAvailable} onClick={() => generateAI()}><Sparkles size={16} />Barcha slaydlarga AI</button></div></div>
          {!aiAvailable && <p className="ps49-help ps51-ai-unavailable">AI xizmati hozir yoqilmagan. Mazmunni yozishingiz yoki Word orqali olishingiz mumkin.</p>}
          <details className="ps51-document-tools"><summary>Word shablon va boshqa mazmun vositalari</summary><div className="ps50-plan-tools"><div><strong>Joriy {draft.slides.length} slayd uchun Word mazmun shakli</strong><p>Maydonlarni to‘ldiring va hujjatni “Matn olish” orqali qaytaring.</p></div><div><button type="button" className="ps49-button" onClick={downloadTemplate} disabled={!!busy || !!errors.length}><Download size={17} />{busy === 'template' ? 'Tayyorlanmoqda…' : 'Word shablon'}</button><button type="button" className="ps49-button" onClick={copyAIInstruction} disabled={!!busy}><Copy size={17} />Tashqi AI uchun yo‘riqnoma</button></div></div><Field label="AI uchun qo‘shimcha istaklar" value={aiInstructions} onChange={setAiInstructions} maxLength={2000} multiline rows={2} placeholder="Uslub, misollar yoki topshiriqlar haqida…" /></details>
          <div className="ps49-slide-strip" aria-label="Slaydni tanlash">{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={`ps49-slide-tab${selected === index ? ' is-active' : ''}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="ps51-slide-thumb"><SlideThumbnail document={draft} index={index} sectionsKey={sectionsKey} /></span><span className="ps51-slide-number">{String(index + 1).padStart(2, '0')}</span><strong>{slide.title || 'Sarlavhasiz'}</strong>{slide.design && <i title="Alohida dizayn">•</i>}</button>)}<button type="button" className="ps49-add-tab" disabled={draft.slides.length >= 40 || !!busy} onClick={() => addSlide(false)} aria-label="Yangi slayd qo‘shish"><Plus size={21} /></button></div>
          <div className="ps50-editor-grid">
            <div className="ps50-editor-controls">
              <div className="ps50-editor-tabs" role="tablist" aria-label="Slaydni tahrirlash"><button type="button" id="ps50-content-tab" role="tab" aria-selected={editorPane === 'content'} aria-controls="ps50-content-pane" tabIndex={editorPane === 'content' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('design'); document.getElementById('ps50-design-tab')?.focus(); } }} onClick={() => setEditorPane('content')}><FileText size={18} />Mazmun</button><button type="button" id="ps50-design-tab" role="tab" aria-selected={editorPane === 'design'} aria-controls="ps50-design-pane" tabIndex={editorPane === 'design' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('content'); document.getElementById('ps50-content-tab')?.focus(); } }} onClick={() => setEditorPane('design')}><Palette size={18} />Dizayn</button></div>
              {editorPane === 'design' ? <div id="ps50-design-pane" role="tabpanel" aria-labelledby="ps50-design-tab"><DesignControls draft={draft} selected={selected} scope={scope} setScope={setScope} changeDesign={changeDesign} resetSlide={() => patchSlide({ design: null })} uploadBackground={file => uploadImage(file, true)} busy={busy} applyTheme={(id, mode) => applyThemeBackground(id, mode, scope)} bgMode={bgMode} setBgMode={setBgMode} themeValue={bgTheme === 'auto' ? suggestTheme(draft.subject, draft.audience) : bgTheme === 'none' ? null : bgTheme} /></div> : <section id="ps50-content-pane" role="tabpanel" aria-labelledby="ps50-content-tab" className="ps49-card ps49-content-editor">
                <div className="ps49-content-heading"><div className="ps49-card-title"><FileText size={19} /><h3>{selected + 1}-slayd mazmuni</h3></div><div className="ps49-slide-actions"><button type="button" className="ps49-icon-button" aria-label="Slaydni oldinga ko‘chirish" title="Oldinga ko‘chirish" disabled={selected === 0} onClick={() => shiftSlide(-1)}><ChevronLeft size={17} /></button><button type="button" className="ps49-icon-button" aria-label="Slaydni keyinga ko‘chirish" title="Keyinga ko‘chirish" disabled={selected === draft.slides.length - 1} onClick={() => shiftSlide(1)}><ChevronRight size={17} /></button><button type="button" className="ps49-icon-button" aria-label="Slayddan nusxa olish" title="Nusxa olish" disabled={draft.slides.length >= 40} onClick={() => addSlide(true)}><Copy size={16} /></button><button type="button" className="ps49-icon-button ps49-danger" aria-label="Slaydni o‘chirish" title="Slaydni o‘chirish" disabled={draft.slides.length <= 1} onClick={removeSlide}><Trash2 size={16} /></button></div></div>
                <div className="ps49-two-fields"><Field label="Slayd sarlavhasi" value={current.title} onChange={title => patchSlide({ title })} maxLength={LIMITS.slideTitle} /><Field label="Bo‘lim nomi" value={current.section} onChange={section => patchSlide({ section })} maxLength={LIMITS.section} hint="Bo‘limlar yo‘lagida ko‘rinadi." /></div>
                <div className="ps51-layout-summary"><span>{getLayout(current.layout).label}</span><button type="button" className="ps49-text-button" onClick={() => patchSlide(autoArrangeSlide(current))}><LayoutTemplate size={15} />Avtomatik joylash</button></div><details className="ps50-extra-fields"><summary>Joylashuvni o‘zim tanlayman</summary><LayoutPicker value={current.layout} onChange={layout => patchSlide({ layout, placements: {} })} /></details>
                {Array.from({ length: currentLayout.textCount }, (_, i) => { const field = i === 0 ? 'body' : `body${i + 1}`; return <Field key={field} label={currentLayout.textCount === 1 ? 'Asosiy matn' : `${i + 1}-matn`} value={current[field] || ''} onChange={value => patchSlide({ [field]: value })} maxLength={i === 0 ? LIMITS.body : 400} multiline rows={3} placeholder="Asosiy fikrlar, tushuntirish yoki topshiriq…" />; })}
                {Array.from({ length: currentLayout.imageCount }, (_, i) => { const field = i === 0 ? 'image' : 'image2'; const promptField = i === 0 ? 'image_prompt' : 'image2_prompt'; const captionField = i === 0 ? 'image_caption' : 'image2_caption'; return <div key={field} className="ps50-image-field"><div className="ps50-image-heading"><h4>{i + 1}-rasm{current.layout === 'cover' ? ' · ixtiyoriy' : ''}</h4>{current[field] && <img src={current[field]} alt={`${i + 1}-rasmning kichik ko‘rinishi`} />}</div><div className="ps50-image-actions"><button type="button" className="ps49-button" disabled={!!busy} onClick={() => document.getElementById(`${fileId}-${field}`)?.click()}><ImagePlus size={17} />{current[field] ? 'Rasmni almashtirish' : 'Rasm yuklash'}</button><input id={`${fileId}-${field}`} type="file" className="ps49-file-input" tabIndex={-1} accept="image/png,image/jpeg" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) uploadImage(file, false, field); }} />{current[field] && <button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm(`${i + 1}-rasmni slayddan olib tashlaysizmi?`)) patchSlide({ [field]: null }); }}>Rasmni olib tashlash</button>}</div><Field label={`${i + 1}-rasm tavsifi`} value={current[promptField] || ''} onChange={value => patchSlide({ [promptField]: value })} maxLength={240} multiline rows={2} hint="Reja uchun tavsif. Rasm avtomatik yaratilmaydi; PNG yoki JPG faylini shu yerda yuklang." /><Field label={`${i + 1}-rasm ostidagi izoh`} value={current[captionField] || ''} onChange={value => patchSlide({ [captionField]: value })} maxLength={100} hint="Rasm qo‘shilganda slaydda ko‘rinadi." /></div>; })}
                <details className="ps50-extra-fields" open={current.layout === 'formula' || !!current.formula || !!current.example}><summary>Formula va misol · ixtiyoriy</summary><div className="ps49-formula-editor"><Field label="Formula (LaTeX)" value={current.formula} onChange={formula => patchSlide({ formula })} maxLength={400} multiline rows={2} spellCheck={false} placeholder={'Masalan: v=\\frac{s}{t}'} hint="Kasr, ildiz, daraja va indekslar qo‘llanadi. $ belgisi shart emas." /><div className="ps49-formula-buttons" role="group" aria-label="Formula belgilarini qo‘shish">{[{ label: 'Kasr', value: '\\frac{a}{b}' }, { label: 'Ildiz', value: '\\sqrt{x}' }, { label: 'Daraja', value: 'x^{2}' }, { label: 'Pastki indeks', value: 'a_{1}' }].map(item => <button type="button" key={item.label} disabled={current.formula.length + item.value.length + (current.formula ? 1 : 0) > 400} onClick={() => patchSlide({ formula: `${current.formula}${current.formula ? ' ' : ''}${item.value}` })}>{item.label}</button>)}</div>{formulaResult(current.formula).error && <p className="ps49-inline-error" role="alert">{formulaResult(current.formula).error}</p>}</div><Field label="Misol yoki qisqa izoh" value={current.example} onChange={example => patchSlide({ example })} maxLength={250} multiline rows={2} hint="Matematik ifodani Formula maydoniga yozing." /></details>
                {hiddenFields.length > 0 && <details className="ps50-extra-fields"><summary>Boshqa joylashuvdan saqlangan {hiddenFields.length} ta maydon</summary><p className="ps49-help">Bu mazmun joriy slaydda ko‘rinmaydi. Tegishli joylashuvga qaytsangiz, yana ko‘rinadi.</p><button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm('Joriy joylashuvda ko‘rinmayotgan matn va rasmlar butunlay o‘chirilsinmi?')) patchSlide(Object.fromEntries(hiddenFields.map(field => [field, ['image', 'image2'].includes(field) ? null : '']))); }}>Yashirin maydonlarni tozalash</button></details>}
              </section>}
            </div>
            <aside className="ps50-preview-sidebar"><section className="ps49-live-panel"><div className="ps49-live-heading"><span><i />{selected + 1}-slayd</span><button type="button" className="ps49-text-button" onClick={startPresenting}><Maximize2 size={16} />Kattalashtirish</button></div>
              <div className="ps51-workspace-modes"><Segments label="Tahrir usuli" value={workspaceMode} onChange={setWorkspaceMode} options={[{ value: 'form', label: 'Mazmun shakli' }, { value: 'canvas', label: 'Slaydda tahrir' }]} /></div>
              {workspaceMode === 'canvas' ? <FreeformCanvas document={draft} slideIndex={selected} onChangeSlide={patchSlide} disabled={!!busy} /> : <SlidePreview document={draft} index={selected} onNavigate={setSelected} />}
              <div className="ps49-preview-foot"><span>{selected + 1} / {draft.slides.length} slayd</span><span>{current.design ? 'Alohida dizayn' : 'Umumiy dizayn'}</span></div><div className="ps50-mini-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => Math.max(0, value - 1))}><ChevronLeft size={17} />Oldingi</button><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => Math.min(draft.slides.length - 1, value + 1))}>Keyingi<ChevronRight size={17} /></button></div></section><p className="ps49-help ps50-preview-tip">{workspaceMode === 'canvas' ? 'Obyektni tanlab suring yoki burchagidan o‘lchamini o‘zgartiring. Matn mazmuni chapda tahrirlanadi.' : 'Mazmun shaklida matnni to‘ldiring. Erkin joylash uchun “Slaydda tahrir”ni tanlang.'}</p></aside>
          </div>
          <div className="ps49-bottom-actions"><button type="button" className="ps49-button" onClick={() => goStep(0)}><ChevronLeft size={17} />Mavzu</button><button type="button" className="ps49-button ps49-primary" onClick={() => goStep(2)}>Ko‘rish va yuklash<ArrowRight size={17} /></button></div>
        </>}
        {step === 2 && <div className="ps49-review"><div className="ps49-review-header"><p className="ps49-eyebrow">3-QADAM</p><h2>Taqdimotingizni ko‘rib chiqing</h2><p>{draft.title} · {draft.slides.length} slayd{draft.subject && ` · ${draft.subject}`}</p></div><div className="ps49-review-grid"><div className="ps49-review-preview"><SlidePreview document={draft} index={selected} onNavigate={setSelected} transition /><div className="ps49-review-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => value - 1)}><ChevronLeft size={17} />Oldingi</button><span>{selected + 1} / {draft.slides.length}</span><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => value + 1)}>Keyingi<ChevronRight size={17} /></button></div></div><section className="ps49-card ps49-export-card"><span className="ps49-export-icon"><Presentation size={32} /></span><h3>Darsga tayyormisiz?</h3><p>Hozirgi matn va dizayn bilan PowerPoint faylini oling yoki shu yerning o‘zida namoyish qiling.</p><button type="button" className="ps49-button ps49-primary" disabled={!!busy || !!errors.length} onClick={exportFile}>{busy === 'export' ? <LoaderCircle className="ps49-spin" size={18} /> : <Download size={18} />}{busy === 'export' ? 'Fayl tayyorlanmoqda…' : 'PowerPoint yuklab olish'}</button><button type="button" className="ps49-button" onClick={startPresenting}><MonitorPlay size={18} />Namoyish qilish</button><p className="ps49-help">.pptx · 16:9 · Yuklash uchun avval serverga saqlash shart emas.</p>{errors.length > 0 && <div className="ps49-validation" role="alert"><strong>Avval tekshiring</strong><ul>{errors.slice(0, 4).map((message, index) => <li key={index}>{message}</li>)}</ul>{errors.length > 4 && <p>Yana {errors.length - 4} ta tuzatish kerak.</p>}</div>}<button type="button" className="ps49-text-button" onClick={() => goStep(1)}><ChevronLeft size={15} />Tahrirga qaytish</button></section></div><div className="ps49-review-thumbnails">{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)} aria-label={`${index + 1}-slaydni ko‘rish: ${slide.title}`} aria-pressed={selected === index}><SlideThumbnail document={draft} index={index} sectionsKey={sectionsKey} /><span>{index + 1}. {slide.title}</span></button>)}</div></div>}
      </>}
    </>}
    {aiReview && <StudioDialog title="AI natijasini tekshiring" eyebrow="QO‘LLASHDAN OLDIN" className="ps51-ai-review" onClose={() => setAiReview(null)} actions={<button type="button" className="ps49-button ps49-primary" disabled={serialized !== aiReview.snapshot || generation.current !== aiReview.revision} onClick={applyAI}><Check size={17} />{aiReview.count === 1 ? 'Shu slaydga qo‘llash' : `${aiReview.count} slaydga qo‘llash`}</button>}>
      <p className="ps49-intro">{aiReview.count} ta slayd uchun mazmun tayyor. Matn va formulalarni tekshiring. Rasm tavsiflari rasm o‘rnini bosmaydi — kerakli fayllarni o‘zingiz yuklaysiz.</p>
      {serialized !== aiReview.snapshot && <div className="ps49-banner ps51-stale-warning" role="alert"><AlertCircle size={20} /><div><strong>Loyiha tayyorlash davomida o‘zgargan</strong><p>O‘zgarishlaringiz saqlanib turibdi. Joriy loyiha uchun natijani qayta tayyorlang.</p><button type="button" className="ps49-button ps49-button-small" onClick={() => { const ids = aiReview.ids; setAiReview(null); generateAI(ids); }}>Qayta tayyorlash</button></div></div>}
      {aiReview.warnings.length > 0 && <div className="ps51-ai-warnings">{aiReview.warnings.map((warning, index) => <p key={index}>{warning}</p>)}</div>}
      <div className="ps51-review-tabs" role="group" aria-label="AI natijasidagi slaydlar">{aiReview.indexes.map(index => <button type="button" key={aiReview.document.slides[index].id} className={aiReviewAt === index ? 'is-active' : ''} aria-pressed={aiReviewAt === index} onClick={() => setAiReviewAt(index)}>{index + 1}. {aiReview.document.slides[index].title}</button>)}</div>
      <SlidePreview document={aiReview.document} index={aiReviewAt} />
      <details className="ps50-extra-fields"><summary>Slayd matnini to‘liq o‘qish</summary><div className="ps51-review-copy">{['body', 'body2', 'body3', 'formula', 'example', 'image_prompt', 'image2_prompt'].map(field => aiReview.document.slides[aiReviewAt]?.[field] ? <p key={field}><strong>{{ body: 'Asosiy matn', body2: '2-matn', body3: '3-matn', formula: 'Formula', example: 'Misol', image_prompt: '1-rasm tavsifi', image2_prompt: '2-rasm tavsifi' }[field]}</strong>{aiReview.document.slides[aiReviewAt][field]}</p> : null)}</div></details>
      <p className="ps49-help">“Yopish” natijani qo‘llamaydi. “Qo‘llash”dan keyin “Bekor qilish” orqali avvalgi mazmunga qaytishingiz mumkin.</p>
    </StudioDialog>}
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
