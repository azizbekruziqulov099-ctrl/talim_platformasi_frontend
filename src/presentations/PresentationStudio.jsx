import {uiText as __kbUi, interfaceLocaleTag as __kbLocaleTag} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
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
const when = value => value ? new Date(value).toLocaleString(__kbLocaleTag(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const SlideThumbnail = React.memo(function SlideThumbnail({ document, index }) {
  return <SlidePreview document={document} index={index} thumbnail />;
}, (previous, next) => previous.index === next.index && previous.sectionsKey === next.sectionsKey && previous.document.title === next.document.title && previous.document.subject === next.document.subject && previous.document.design === next.document.design && previous.document.slides.length === next.document.slides.length && previous.document.slides[previous.index] === next.document.slides[next.index]);

function Field({ label, hint, value, onChange, maxLength, multiline = false, rows = 3, ...props }) {
  useKbInterfaceLocale();
  const id = useId();
  return <div className="ps49-field"><div className="ps49-field-heading"><label htmlFor={id}>{__kbUi(label)}</label>{maxLength && <span>{value?.length || 0}/{maxLength}</span>}</div>{multiline ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} rows={rows} {...props} /> : <input id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength} {...props} />}{hint && <p className="ps49-help">{__kbUi(hint)}</p>}</div>;
}

function SelectField({ label, value, onChange, children }) {
  useKbInterfaceLocale();
  const id = useId();
  return <div className="ps49-field"><label htmlFor={id}>{__kbUi(label)}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}>{children}</select></div>;
}

function Segments({ label, value, options, onChange }) {
  useKbInterfaceLocale();
  return <div className="ps49-field"><span className="ps49-label">{__kbUi(label)}</span><div className="ps49-segments" role="group" aria-label={__kbUi(label)}>{options.map(option => <button type="button" key={option.value} className={value === option.value ? 'is-active' : ''} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{__kbUi(option.label)}</button>)}</div></div>;
}

function DesignControls({ draft, selected, scope, setScope, changeDesign, resetSlide, uploadBackground, busy, applyTheme, bgMode, setBgMode, themeValue }) {
  useKbInterfaceLocale();
  const slide = draft.slides[selected];
  const design = scope === 'slide' ? slide.design || draft.design : draft.design;
  const fileId = useId();
  const family = getFamily(design.template);
  return <section className="ps49-card ps49-design-controls" aria-label={__kbUi("Dizayn sozlamalari")}>
    <div className="ps49-card-title"><Palette size={19} /><h3>{__kbUi("Dizayn")}</h3></div>
    <SelectField label={__kbUi("Maket oilasi")} value={family.id} onChange={id => { const template = TEMPLATES.find(item => item.id === id); if (template) changeDesign({ ...template.defaults, template: template.id }); }}>{TEMPLATES.map(template => <option key={template.id} value={template.id}>{__kbUi(template.label)}</option>)}</SelectField>
    <div className="ps49-field"><span className="ps49-label">{__kbUi("Urg‘u rangi")}</span><div className="ps49-swatches" role="group" aria-label={__kbUi("Urg‘u rangi")}>{Object.entries(ACCENTS).map(([value, color], i) => <button type="button" key={value} style={{ background: color }} aria-label={__kbUi(['Moviy', 'Ko‘k', 'Binafsha', 'Yashil', 'Sariq'][i])} aria-pressed={design.accent === value} className={design.accent === value ? 'is-active' : ''} onClick={() => changeDesign({ accent: value })}>{design.accent === value && <Check size={18} />}</button>)}</div></div>
    <div className="ps49-field"><span className="ps49-label">{__kbUi("Orqa fon rasmi · ta’lim, fan va institut mavzulari")}</span>
      <BackgroundGallery compact value={design.background === 'image' && design.image ? themeValue : null} mode={bgMode} accent={design.accent} onMode={setBgMode} onSelect={id => applyTheme(id, bgMode)} onUpload={uploadBackground} ownImage={!!design.image} busy={busy} onClear={() => changeDesign({ image: null, background: 'paper', overlay: 0, text: 'auto' })} />
    </div>
    <SelectField label={__kbUi("Fon turi")} value={design.background} onChange={background => changeDesign({ background, overlay: background === 'paper' || background === 'solid' ? 0 : design.overlay })}><option value="paper">{__kbUi("Och fon")}</option><option value="midnight">{__kbUi("To‘q fon")}</option><option value="aurora">{__kbUi("Yumshoq ranglar")}</option><option value="solid">{__kbUi("Rang tanlash")}</option><option value="image">{__kbUi("Rasm (yuqoridan tanlangan yoki o‘zimniki)")}</option></SelectField>
    {design.background === 'solid' && <Field label={__kbUi("Fon rangi")} value={design.color} type="color" onChange={color => changeDesign({ color })} />}
    {design.background === 'image' && !design.image && <p className="ps49-help">{__kbUi("Yuqoridagi galereyadan mavzu tanlang yoki «O‘z rasmim» bilan PNG/JPG yuklang (2 MB gacha moslashtiriladi).")}</p>}
    <p className="ps49-help">{scope === 'all' ? __kbUi('Barcha slaydlarga qo‘llanadi.') : __kbUi(`${selected + 1}-slaydga qo‘llanadi.`)}</p>
    <details className="ps50-extra-fields"><summary>{__kbUi("Qo‘shimcha dizayn sozlamalari")}</summary>
      <Segments label={__kbUi("Qayerga qo‘llanadi?")} value={scope} onChange={setScope} options={[{ value: 'all', label: 'Barcha slaydlar' }, { value: 'slide', label: 'Faqat shu slayd' }]} />
      {scope === 'slide' && slide.design && <button type="button" className="ps49-text-button" onClick={resetSlide}><RotateCcw size={14} />{__kbUi("Umumiy dizaynga qaytarish")}</button>}
      {family.id === 'glass' && <SelectField label={__kbUi("Klassik rang va ko‘rinish varianti")} value={design.template} onChange={id => { const theme = LEGACY_TEMPLATES.find(item => item.id === id); if (theme) changeDesign({ ...theme.defaults, template: id }); }}>{LEGACY_TEMPLATES.map(theme => <option key={theme.id} value={theme.id}>{__kbUi(theme.label)}</option>)}</SelectField>}
      <Segments label={__kbUi("Ichki panel")} value={design.panel} onChange={panel => changeDesign({ panel })} options={[{ value: 'glass', label: 'Shaffof' }, { value: 'solid', label: 'Yaxlit' }, { value: 'none', label: 'Panelsiz' }]} />
      <Segments label={__kbUi("Burchaklar")} value={design.radius} onChange={radius => changeDesign({ radius })} options={[{ value: 'round', label: 'Yumaloq' }, { value: 'square', label: 'To‘g‘ri' }]} />
      <SelectField label={__kbUi("Matn rangi")} value={design.text} onChange={text => changeDesign({ text })}><option value="auto">{__kbUi("Avtomatik")}</option><option value="light">{__kbUi("Oq")}</option><option value="dark">{__kbUi("To‘q")}</option></SelectField>
      <Segments label={__kbUi("Shrift")} value={design.font} onChange={font => changeDesign({ font })} options={[{ value: 'sans', label: 'Sodda' }, { value: 'serif', label: 'Akademik' }]} />
      <Segments label={__kbUi("Matn kattaligi")} value={design.size} onChange={size => changeDesign({ size })} options={[{ value: 'normal', label: 'Odatdagi' }, { value: 'large', label: 'Yirik' }]} />
      <div className="ps49-field"><label htmlFor={`${fileId}-overlay`}>{__kbUi("Fonni qoraytirish · ")}{design.overlay}%</label><input id={`${fileId}-overlay`} type="range" min="0" max="90" step="5" value={design.overlay} onChange={event => changeDesign({ overlay: Number(event.target.value) })} /></div>
      <SelectField label={__kbUi("Slayd almashishi")} value={design.transition} onChange={transition => changeDesign({ transition })}><option value="none">{__kbUi("Oddiy")}</option><option value="fade">{__kbUi("Yumshoq")}</option><option value="push">{__kbUi("Surilish")}</option><option value="wipe">{__kbUi("Ochilib borish")}</option></SelectField>
      <button type="button" className="ps49-text-button" onClick={() => changeDesign(clone(DEFAULT_DESIGN))}><RotateCcw size={14} />{__kbUi("Boshlang‘ich dizayn")}</button>
    </details>
  </section>;
}

function AdminSettings({ capabilities, request, onUpdate, onError }) {
  useKbInterfaceLocale();
  const [grades, setGrades] = useState(capabilities.settings?.grades || []);
  const [saving, setSaving] = useState(false);
  return <details className="ps49-admin"><summary>{__kbUi("Administrator: o‘quvchilar uchun ruxsat")}</summary><p>{__kbUi("O‘qituvchi va OTM foydalanuvchilaridan tashqari, qaysi sinflar taqdimot yaratishi mumkinligini belgilang.")}</p><div className="ps49-grade-options">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grade => <label key={grade}><input type="checkbox" checked={grades.includes(grade)} onChange={event => setGrades(previous => event.target.checked ? [...previous, grade].sort((a, b) => a - b) : previous.filter(value => value !== grade))} />{__kbUi(grade)}{__kbUi("-sinf")}</label>)}</div><button type="button" className="ps49-button ps49-button-small" disabled={saving} onClick={async () => { setSaving(true); try { const settings = await request('/settings', { method: 'PUT', body: { grades } }); onUpdate(settings.settings || settings); } catch (error) { if (error.name !== 'AbortError') onError(error.message); } finally { setSaving(false); } }}>{saving ? __kbUi('Saqlanmoqda…') : __kbUi('Ruxsatlarni saqlash')}</button></details>;
}

export default function PresentationStudio({ apiBase = '', token, user, active = true, onClose }) {
  useKbInterfaceLocale();
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
  const confirmDiscard = () => !dirty || window.confirm(__kbUi('Serverga saqlanmagan o‘zgarishlar bor. Ularni almashtirishni xohlaysizmi?'));
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
    if (busyRef.current || !window.confirm(__kbUi(`“${item.title}” loyihasini serverdan o‘chirishni xohlaysizmi?`)) || !beginBusy(`delete:${item.id}`)) return;
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
    if (draft.slides.length <= 1 || !window.confirm(__kbUi(`“${current.title || `${selected + 1}-slayd`}” slaydini o‘chirishni xohlaysizmi?`))) return;
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
      if (outlinePrepared.current && draft.slides.length !== count && !window.confirm(__kbUi(`Joriy slaydlar o‘rniga ${count} ta yangi slayd tayyorlansinmi?`))) return;
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
    <header className="ps49-header"><div className="ps49-brand"><span className="ps49-brand-icon"><Presentation size={24} /></span><div><p className="ps49-eyebrow">{__kbUi("KABUTAR · TAQDIMOT")}</p><h1>{__kbUi("Taqdimot ustaxonasi")}</h1></div></div><div className="ps49-header-actions">{capabilities?.allowed && <><button type="button" className="ps49-button" onClick={loadLibrary} disabled={!!busy}><FolderOpen size={17} /><span>{__kbUi("Loyihalarim")}</span></button><button type="button" className="ps49-button" onClick={() => { if (confirmDiscard()) { replaceDocument(makeProject()); outlinePrepared.current = false; setCount(10); setFamilyMode('auto'); setBgTheme('auto'); setWordFlow(false); setStep(0); } }} disabled={!!busy}><Plus size={17} /><span>{__kbUi("Yangi")}</span></button></>}{onClose && <button type="button" className="ps49-icon-button" aria-label={__kbUi("Taqdimot ustaxonasidan chiqish")} onClick={exit}><X size={20} /></button>}</div></header>
    {!capabilities ? <div className="ps49-empty-state">{capError ? <><AlertCircle size={32} /><h2>{__kbUi("Ulanishni tekshiring")}</h2><p role="alert">{__kbUi(capError)}</p><button type="button" className="ps49-button" onClick={() => setCapAttempt(value => value + 1)}>{__kbUi("Qayta urinish")}</button></> : <><LoaderCircle className="ps49-spin" size={30} /><p role="status">{__kbUi("Taqdimot imkoniyatlari tekshirilmoqda…")}</p></>}</div> : <>
      {capabilities.admin && <AdminSettings capabilities={capabilities} request={request} onError={showError} onUpdate={settings => { setCapabilities(previous => ({ ...previous, settings })); setNotice('O‘quvchilar uchun ruxsatlar saqlandi.'); }} />}
      {!capabilities.allowed ? <div className="ps49-empty-state"><Presentation size={40} /><h2>{__kbUi("Taqdimot yaratish uchun ruxsat kerak")}</h2><p>{capabilities.reason || __kbUi('Hisobingiz uchun bu bo‘lim hali yoqilmagan.')}</p><p>{__kbUi("Ruxsat masalasida muassasa administratoriga murojaat qiling.")}</p></div> : <>
        <nav className="ps49-steps" aria-label={__kbUi("Taqdimot yaratish bosqichlari")}>{STEPS.map((label, index) => <button type="button" key={label} onClick={() => goStep(index)} className={step === index ? 'is-current' : step > index ? 'is-complete' : ''} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={16} /> : index + 1}</span><strong>{__kbUi(label)}</strong>{index < 2 && <ChevronRight size={16} className="ps49-step-arrow" />}</button>)}</nav>
        <div className="ps49-save-bar"><div className={`ps49-save-status${dirty ? ' is-dirty' : ''}`}><Cloud size={17} /><span>{busy === 'save' ? __kbUi('Serverga saqlanmoqda…') : dirty ? __kbUi('Serverga saqlanmagan o‘zgarishlar') : project ? __kbUi(`Serverda saqlangan · ${when(project.updated_at)}`) : __kbUi('Yangi loyiha · hali serverga saqlanmagan')}</span></div><button type="button" className="ps49-button ps49-primary ps49-button-small" onClick={() => save()} disabled={!!busy}><Save size={16} />{busy === 'save' ? __kbUi('Saqlanmoqda…') : __kbUi('Serverga saqlash')}</button></div>
        <p className="ps49-recovery-status">{__kbUi(recoveryStatus)}</p>
        {recovery && <div className="ps49-banner ps49-recovery"><RotateCcw size={20} /><div><strong>{__kbUi("Ushbu qurilmada tiklash nusxasi bor")}</strong><p>“{recovery.document.title}” · {__kbUi(when(recovery.savedAt))}{__kbUi(". Bu serverdagi saqlash holatini tasdiqlamaydi.")}</p></div><button type="button" className="ps49-button ps49-button-small" onClick={() => { if (confirmDiscard()) { replaceDocument(recovery.document, recovery.project || null); setNotice('Qurilmadagi nusxa tiklandi. Serverga saqlang.'); } }}>{__kbUi("Tiklash")}</button><button type="button" className="ps49-icon-button" aria-label={__kbUi("Tiklash taklifini yopish")} onClick={() => setRecovery(null)}><X size={17} /></button></div>}
        {error && <div className="ps49-banner ps49-error" role="alert"><AlertCircle size={20} /><div><p>{__kbUi(error)}</p>{conflict && <button type="button" className="ps49-button ps49-button-small" onClick={() => save(true)} disabled={!!busy}>{__kbUi("Alohida nusxa sifatida saqlash")}</button>}</div><button type="button" className="ps49-icon-button" aria-label={__kbUi("Xato xabarini yopish")} onClick={() => setError('')}><X size={16} /></button></div>}
        {notice && <div className="ps49-banner ps49-success" role="status"><CheckCircle2 size={18} /><p>{__kbUi(notice)}</p><button type="button" className="ps49-icon-button" aria-label={__kbUi("Xabarni yopish")} onClick={() => setNotice('')}><X size={16} /></button></div>}
        {aiRunning && <div className="ps49-banner ps51-ai-progress" role="status"><LoaderCircle size={21} className="ps49-spin" /><div><strong>{__kbUi("AI mazmunni tayyorlamoqda…")}</strong><p>{aiElapsed < 20 ? __kbUi('Dars mazmuni slaydlar rejasiga moslanmoqda.') : __kbUi('AI mazmunni tayyorlashda davom etmoqda. Ko‘p slaydli taqdimot biroz vaqt oladi.')} {aiElapsed > 0 && __kbUi(`${aiElapsed} soniya`)}</p><p className="ps49-help">{__kbUi("Tayyor natijani qo‘llashdan oldin ko‘rib chiqasiz.")}</p></div><button type="button" className="ps49-button ps49-button-small" onClick={cancelAI}><X size={16} />{__kbUi("Bekor qilish")}</button></div>}
        {aiError && <div className="ps49-banner ps49-error" role="alert"><AlertCircle size={20} /><div><strong>{__kbUi("AI natijasi qo‘llanmadi")}</strong><p>{__kbUi(aiError)}</p><p className="ps49-help">{__kbUi("Mavjud mazmunni tahrirlashda davom etishingiz mumkin.")}</p></div><button type="button" className="ps49-icon-button" aria-label={__kbUi("AI xabarini yopish")} onClick={() => setAiError('')}><X size={16} /></button></div>}
        {step === 0 && <StartScreen draft={draft} updateDraft={updateDraft} count={count} setCount={setCount} mode={startMode} setMode={setStartMode}
          aiAvailable={aiAvailable} aiInstructions={aiInstructions} setAiInstructions={setAiInstructions}
          bgTheme={bgTheme} setBgTheme={setBgTheme} bgMode={bgMode} setBgMode={setBgMode}
          onStart={() => goStep(1)} busy={busy} aiRunning={aiRunning}
          familyPicker={<TemplateGallery value={draft.design.template} templates={TEMPLATES} onSelect={template => { setFamilyMode('manual'); updateDraft(previous => ({ ...previous, design: { ...previous.design, ...template.defaults, template: template.id }, slides: previous.slides.map(slide => slide.design ? { ...slide, design: { ...slide.design, ...template.defaults, template: template.id } } : slide) })); }} />}
          advanced={<div className="ps49-setup-side"><div className="ps49-start-options"><button type="button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><FileText size={23} /><span><strong>{__kbUi("Word yoki tayyor matndan olish")}</strong><small>{__kbUi("Avvalgi hujjat shakllari ham ishlaydi")}</small></span><ChevronRight size={17} /></button><button type="button" onClick={() => { if (confirmDiscard()) replaceDocument(sampleProject()); }} disabled={!!busy}><span className="ps49-option-icon">{__kbUi("ƒ")}</span><span><strong>{__kbUi("Formula namunasini ochish")}</strong><small>{__kbUi("Matematika, fizika, kimyo va biologiya")}</small></span><ChevronRight size={17} /></button></div>
        </div>} />}
        {step === 1 && <>
          <div className="ps49-editor-heading"><div><h2>{__kbUi("Maket va tahrir")}</h2><p>{__kbUi("Slaydni tanlang, matnni yozing va kerakli joyiga suring.")}</p></div><button type="button" className="ps49-button" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><Upload size={16} />{__kbUi("Matn olish")}</button></div>
          {wordFlow && <section className="ps60-word-flow" aria-label={__kbUi("Word shablon bilan 3 qadam")}>
            <div className="ps60-word-head"><div><strong>{__kbUi("Word shablon bilan — 3 qadam")}</strong><p>{__kbUi("Shablonda har slayd uchun nima yozilishi, kimga va so‘z chegaralari ko‘rsatilgan. AI to‘ldirgan faylni qaytarib yuklasangiz, matn o‘z joyiga tushadi.")}</p></div><button type="button" className="ps49-icon-button" aria-label={__kbUi("Word qadamlarini yashirish")} onClick={() => setWordFlow(false)}><X size={16} /></button></div>
            <div className="ps60-word-steps">
              <button type="button" className="ps60-word-step" onClick={downloadTemplate} disabled={!!busy || !!errors.length}><span>1</span><strong>{busy === 'template' ? __kbUi('Tayyorlanmoqda…') : __kbUi('Word shablonni yuklab olish')}</strong><small>{draft.slides.length}{__kbUi(" slayd uchun to‘ldirish shakli (.docx)")}</small></button>
              <button type="button" className="ps60-word-step" onClick={copyAIInstruction} disabled={!!busy}><span>2</span><strong>{__kbUi("AI uchun yo‘riqnomani nusxalash")}</strong><small>{__kbUi("ChatGPT, Gemini yoki boshqa AI’ga Word fayl bilan birga bering")}</small></button>
              <button type="button" className="ps60-word-step" onClick={() => { setImportOpen(true); setImportError(''); }} disabled={!!busy}><span>3</span><strong>{__kbUi("To‘ldirilgan faylni qaytarish")}</strong><small>{__kbUi(".docx ni yuklang — slaydlar to‘ladi, keyin PowerPoint yuklab oling")}</small></button>
            </div>
          </section>}
          <div className="ps51-editor-toolbar"><div className="ps51-history" role="group" aria-label={__kbUi("Tahrir tarixi")}><button type="button" className="ps49-button ps49-button-small" disabled={!history.current.past.length} onClick={() => travelHistory(-1)}><Undo2 size={16} />{__kbUi("Bekor qilish")}</button><button type="button" className="ps49-button ps49-button-small" disabled={!history.current.future.length} onClick={() => travelHistory(1)}><Redo2 size={16} />{__kbUi("Qaytarish")}</button></div><div className="ps51-editor-ai"><button type="button" className="ps49-button ps49-button-small" disabled={!!busy || aiRunning || !aiAvailable} onClick={() => generateAI([current.id])}><Sparkles size={16} />{__kbUi("Shu slaydga AI")}</button><button type="button" className="ps49-button ps49-button-small" disabled={!!busy || aiRunning || !aiAvailable} onClick={() => generateAI()}><Sparkles size={16} />{__kbUi("Barcha slaydlarga AI")}</button></div></div>
          {!aiAvailable && <p className="ps49-help ps51-ai-unavailable">{__kbUi("AI xizmati hozir yoqilmagan. Mazmunni yozishingiz yoki Word orqali olishingiz mumkin.")}</p>}
          <details className="ps51-document-tools"><summary>{__kbUi("Word shablon va boshqa mazmun vositalari")}</summary><div className="ps50-plan-tools"><div><strong>{__kbUi("Joriy ")}{draft.slides.length}{__kbUi(" slayd uchun Word mazmun shakli")}</strong><p>{__kbUi("Maydonlarni to‘ldiring va hujjatni “Matn olish” orqali qaytaring.")}</p></div><div><button type="button" className="ps49-button" onClick={downloadTemplate} disabled={!!busy || !!errors.length}><Download size={17} />{busy === 'template' ? __kbUi('Tayyorlanmoqda…') : __kbUi('Word shablon')}</button><button type="button" className="ps49-button" onClick={copyAIInstruction} disabled={!!busy}><Copy size={17} />{__kbUi("Tashqi AI uchun yo‘riqnoma")}</button></div></div><Field label={__kbUi("AI uchun qo‘shimcha istaklar")} value={aiInstructions} onChange={setAiInstructions} maxLength={2000} multiline rows={2} placeholder={__kbUi("Uslub, misollar yoki topshiriqlar haqida…")} /></details>
          <div className="ps49-slide-strip" aria-label={__kbUi("Slaydni tanlash")}>{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={`ps49-slide-tab${selected === index ? ' is-active' : ''}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="ps51-slide-thumb"><SlideThumbnail document={draft} index={index} sectionsKey={sectionsKey} /></span><span className="ps51-slide-number">{__kbUi(String(index + 1).padStart(2, '0'))}</span><strong>{slide.title || __kbUi('Sarlavhasiz')}</strong>{slide.design && <i title={__kbUi("Alohida dizayn")}>•</i>}</button>)}<button type="button" className="ps49-add-tab" disabled={draft.slides.length >= 40 || !!busy} onClick={() => addSlide(false)} aria-label={__kbUi("Yangi slayd qo‘shish")}><Plus size={21} /></button></div>
          <div className="ps50-editor-grid">
            <div className="ps50-editor-controls">
              <div className="ps50-editor-tabs" role="tablist" aria-label={__kbUi("Slaydni tahrirlash")}><button type="button" id="ps50-content-tab" role="tab" aria-selected={editorPane === 'content'} aria-controls="ps50-content-pane" tabIndex={editorPane === 'content' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('design'); document.getElementById('ps50-design-tab')?.focus(); } }} onClick={() => setEditorPane('content')}><FileText size={18} />{__kbUi("Mazmun")}</button><button type="button" id="ps50-design-tab" role="tab" aria-selected={editorPane === 'design'} aria-controls="ps50-design-pane" tabIndex={editorPane === 'design' ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); setEditorPane('content'); document.getElementById('ps50-content-tab')?.focus(); } }} onClick={() => setEditorPane('design')}><Palette size={18} />{__kbUi("Dizayn")}</button></div>
              {editorPane === 'design' ? <div id="ps50-design-pane" role="tabpanel" aria-labelledby="ps50-design-tab"><DesignControls draft={draft} selected={selected} scope={scope} setScope={setScope} changeDesign={changeDesign} resetSlide={() => patchSlide({ design: null })} uploadBackground={file => uploadImage(file, true)} busy={busy} applyTheme={(id, mode) => applyThemeBackground(id, mode, scope)} bgMode={bgMode} setBgMode={setBgMode} themeValue={bgTheme === 'auto' ? suggestTheme(draft.subject, draft.audience) : bgTheme === 'none' ? null : bgTheme} /></div> : <section id="ps50-content-pane" role="tabpanel" aria-labelledby="ps50-content-tab" className="ps49-card ps49-content-editor">
                <div className="ps49-content-heading"><div className="ps49-card-title"><FileText size={19} /><h3>{selected + 1}{__kbUi("-slayd mazmuni")}</h3></div><div className="ps49-slide-actions"><button type="button" className="ps49-icon-button" aria-label={__kbUi("Slaydni oldinga ko‘chirish")} title={__kbUi("Oldinga ko‘chirish")} disabled={selected === 0} onClick={() => shiftSlide(-1)}><ChevronLeft size={17} /></button><button type="button" className="ps49-icon-button" aria-label={__kbUi("Slaydni keyinga ko‘chirish")} title={__kbUi("Keyinga ko‘chirish")} disabled={selected === draft.slides.length - 1} onClick={() => shiftSlide(1)}><ChevronRight size={17} /></button><button type="button" className="ps49-icon-button" aria-label={__kbUi("Slayddan nusxa olish")} title={__kbUi("Nusxa olish")} disabled={draft.slides.length >= 40} onClick={() => addSlide(true)}><Copy size={16} /></button><button type="button" className="ps49-icon-button ps49-danger" aria-label={__kbUi("Slaydni o‘chirish")} title={__kbUi("Slaydni o‘chirish")} disabled={draft.slides.length <= 1} onClick={removeSlide}><Trash2 size={16} /></button></div></div>
                <div className="ps49-two-fields"><Field label={__kbUi("Slayd sarlavhasi")} value={current.title} onChange={title => patchSlide({ title })} maxLength={LIMITS.slideTitle} /><Field label={__kbUi("Bo‘lim nomi")} value={current.section} onChange={section => patchSlide({ section })} maxLength={LIMITS.section} hint={__kbUi("Bo‘limlar yo‘lagida ko‘rinadi.")} /></div>
                <div className="ps51-layout-summary"><span>{__kbUi(getLayout(current.layout).label)}</span><button type="button" className="ps49-text-button" onClick={() => patchSlide(autoArrangeSlide(current))}><LayoutTemplate size={15} />{__kbUi("Avtomatik joylash")}</button></div><details className="ps50-extra-fields"><summary>{__kbUi("Joylashuvni o‘zim tanlayman")}</summary><LayoutPicker value={current.layout} onChange={layout => patchSlide({ layout, placements: {} })} /></details>
                {__kbUi(Array.from({ length: currentLayout.textCount }, (_, i) => { const field = i === 0 ? 'body' : `body${i + 1}`; return <Field key={field} label={currentLayout.textCount === 1 ? __kbUi('Asosiy matn') : __kbUi(`${i + 1}-matn`)} value={current[field] || ''} onChange={value => patchSlide({ [field]: value })} maxLength={i === 0 ? LIMITS.body : 400} multiline rows={3} placeholder={__kbUi("Asosiy fikrlar, tushuntirish yoki topshiriq…")} />; }))}
                {__kbUi(Array.from({ length: currentLayout.imageCount }, (_, i) => { const field = i === 0 ? 'image' : 'image2'; const promptField = i === 0 ? 'image_prompt' : 'image2_prompt'; const captionField = i === 0 ? 'image_caption' : 'image2_caption'; return <div key={field} className="ps50-image-field"><div className="ps50-image-heading"><h4>{i + 1}{__kbUi("-rasm")}{current.layout === 'cover' ? __kbUi(' · ixtiyoriy') : __kbUi('')}</h4>{current[field] && <img src={current[field]} alt={__kbUi(`${i + 1}-rasmning kichik ko‘rinishi`)} />}</div><div className="ps50-image-actions"><button type="button" className="ps49-button" disabled={!!busy} onClick={() => document.getElementById(`${fileId}-${field}`)?.click()}><ImagePlus size={17} />{current[field] ? __kbUi('Rasmni almashtirish') : __kbUi('Rasm yuklash')}</button><input id={`${fileId}-${field}`} type="file" className="ps49-file-input" tabIndex={-1} accept="image/png,image/jpeg" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) uploadImage(file, false, field); }} />{current[field] && <button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm(__kbUi(`${i + 1}-rasmni slayddan olib tashlaysizmi?`))) patchSlide({ [field]: null }); }}>{__kbUi("Rasmni olib tashlash")}</button>}</div><Field label={__kbUi(`${i + 1}-rasm tavsifi`)} value={current[promptField] || ''} onChange={value => patchSlide({ [promptField]: value })} maxLength={240} multiline rows={2} hint={__kbUi("Reja uchun tavsif. Rasm avtomatik yaratilmaydi; PNG yoki JPG faylini shu yerda yuklang.")} /><Field label={__kbUi(`${i + 1}-rasm ostidagi izoh`)} value={current[captionField] || ''} onChange={value => patchSlide({ [captionField]: value })} maxLength={100} hint={__kbUi("Rasm qo‘shilganda slaydda ko‘rinadi.")} /></div>; }))}
                <details className="ps50-extra-fields" open={current.layout === 'formula' || !!current.formula || !!current.example}><summary>{__kbUi("Formula va misol · ixtiyoriy")}</summary><div className="ps49-formula-editor"><Field label={__kbUi("Formula (LaTeX)")} value={current.formula} onChange={formula => patchSlide({ formula })} maxLength={400} multiline rows={2} spellCheck={false} placeholder={__kbUi('Masalan: v=\\frac{s}{t}')} hint={__kbUi("Kasr, ildiz, daraja va indekslar qo‘llanadi. $ belgisi shart emas.")} /><div className="ps49-formula-buttons" role="group" aria-label={__kbUi("Formula belgilarini qo‘shish")}>{[{ label: 'Kasr', value: '\\frac{a}{b}' }, { label: 'Ildiz', value: '\\sqrt{x}' }, { label: 'Daraja', value: 'x^{2}' }, { label: 'Pastki indeks', value: 'a_{1}' }].map(item => <button type="button" key={item.label} disabled={current.formula.length + item.value.length + (current.formula ? 1 : 0) > 400} onClick={() => patchSlide({ formula: `${current.formula}${current.formula ? ' ' : ''}${item.value}` })}>{__kbUi(item.label)}</button>)}</div>{formulaResult(current.formula).error && <p className="ps49-inline-error" role="alert">{__kbUi(formulaResult(current.formula).error)}</p>}</div><Field label={__kbUi("Misol yoki qisqa izoh")} value={current.example} onChange={example => patchSlide({ example })} maxLength={250} multiline rows={2} hint={__kbUi("Matematik ifodani Formula maydoniga yozing.")} /></details>
                {hiddenFields.length > 0 && <details className="ps50-extra-fields"><summary>{__kbUi("Boshqa joylashuvdan saqlangan ")}{__kbUi(hiddenFields.length)}{__kbUi(" ta maydon")}</summary><p className="ps49-help">{__kbUi("Bu mazmun joriy slaydda ko‘rinmaydi. Tegishli joylashuvga qaytsangiz, yana ko‘rinadi.")}</p><button type="button" className="ps49-text-button ps49-danger" onClick={() => { if (window.confirm(__kbUi('Joriy joylashuvda ko‘rinmayotgan matn va rasmlar butunlay o‘chirilsinmi?'))) patchSlide(Object.fromEntries(hiddenFields.map(field => [field, ['image', 'image2'].includes(field) ? null : '']))); }}>{__kbUi("Yashirin maydonlarni tozalash")}</button></details>}
              </section>}
            </div>
            <aside className="ps50-preview-sidebar"><section className="ps49-live-panel"><div className="ps49-live-heading"><span><i />{selected + 1}{__kbUi("-slayd")}</span><button type="button" className="ps49-text-button" onClick={startPresenting}><Maximize2 size={16} />{__kbUi("Kattalashtirish")}</button></div>
              <div className="ps51-workspace-modes"><Segments label={__kbUi("Tahrir usuli")} value={workspaceMode} onChange={setWorkspaceMode} options={[{ value: 'form', label: 'Mazmun shakli' }, { value: 'canvas', label: 'Slaydda tahrir' }]} /></div>
              {workspaceMode === 'canvas' ? <FreeformCanvas document={draft} slideIndex={selected} onChangeSlide={patchSlide} disabled={!!busy} /> : <SlidePreview document={draft} index={selected} onNavigate={setSelected} />}
              <div className="ps49-preview-foot"><span>{selected + 1} / {draft.slides.length}{__kbUi(" slayd")}</span><span>{current.design ? __kbUi('Alohida dizayn') : __kbUi('Umumiy dizayn')}</span></div><div className="ps50-mini-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => Math.max(0, value - 1))}><ChevronLeft size={17} />{__kbUi("Oldingi")}</button><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => Math.min(draft.slides.length - 1, value + 1))}>{__kbUi("Keyingi")}<ChevronRight size={17} /></button></div></section><p className="ps49-help ps50-preview-tip">{workspaceMode === 'canvas' ? __kbUi('Obyektni tanlab suring yoki burchagidan o‘lchamini o‘zgartiring. Matn mazmuni chapda tahrirlanadi.') : __kbUi('Mazmun shaklida matnni to‘ldiring. Erkin joylash uchun “Slaydda tahrir”ni tanlang.')}</p></aside>
          </div>
          <div className="ps49-bottom-actions"><button type="button" className="ps49-button" onClick={() => goStep(0)}><ChevronLeft size={17} />{__kbUi("Mavzu")}</button><button type="button" className="ps49-button ps49-primary" onClick={() => goStep(2)}>{__kbUi("Ko‘rish va yuklash")}<ArrowRight size={17} /></button></div>
        </>}
        {step === 2 && <div className="ps49-review"><div className="ps49-review-header"><p className="ps49-eyebrow">{__kbUi("3-QADAM")}</p><h2>{__kbUi("Taqdimotingizni ko‘rib chiqing")}</h2><p>{draft.title} · {draft.slides.length}{__kbUi(" slayd")}{draft.subject && __kbUi(` · ${draft.subject}`)}</p></div><div className="ps49-review-grid"><div className="ps49-review-preview"><SlidePreview document={draft} index={selected} onNavigate={setSelected} transition /><div className="ps49-review-navigation"><button type="button" className="ps49-button ps49-button-small" disabled={selected === 0} onClick={() => setSelected(value => value - 1)}><ChevronLeft size={17} />{__kbUi("Oldingi")}</button><span>{selected + 1} / {draft.slides.length}</span><button type="button" className="ps49-button ps49-button-small" disabled={selected === draft.slides.length - 1} onClick={() => setSelected(value => value + 1)}>{__kbUi("Keyingi")}<ChevronRight size={17} /></button></div></div><section className="ps49-card ps49-export-card"><span className="ps49-export-icon"><Presentation size={32} /></span><h3>{__kbUi("Darsga tayyormisiz?")}</h3><p>{__kbUi("Hozirgi matn va dizayn bilan PowerPoint faylini oling yoki shu yerning o‘zida namoyish qiling.")}</p><button type="button" className="ps49-button ps49-primary" disabled={!!busy || !!errors.length} onClick={exportFile}>{busy === 'export' ? <LoaderCircle className="ps49-spin" size={18} /> : <Download size={18} />}{busy === 'export' ? __kbUi('Fayl tayyorlanmoqda…') : __kbUi('PowerPoint yuklab olish')}</button><button type="button" className="ps49-button" onClick={startPresenting}><MonitorPlay size={18} />{__kbUi("Namoyish qilish")}</button><p className="ps49-help">{__kbUi(".pptx · 16:9 · Yuklash uchun avval serverga saqlash shart emas.")}</p>{errors.length > 0 && <div className="ps49-validation" role="alert"><strong>{__kbUi("Avval tekshiring")}</strong><ul>{errors.slice(0, 4).map((message, index) => <li key={index}>{message}</li>)}</ul>{errors.length > 4 && <p>{__kbUi("Yana ")}{errors.length - 4}{__kbUi(" ta tuzatish kerak.")}</p>}</div>}<button type="button" className="ps49-text-button" onClick={() => goStep(1)}><ChevronLeft size={15} />{__kbUi("Tahrirga qaytish")}</button></section></div><div className="ps49-review-thumbnails">{draft.slides.map((slide, index) => <button type="button" key={slide.id} className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)} aria-label={__kbUi(`${index + 1}-slaydni ko‘rish: ${slide.title}`)} aria-pressed={selected === index}><SlideThumbnail document={draft} index={index} sectionsKey={sectionsKey} /><span>{index + 1}. {slide.title}</span></button>)}</div></div>}
      </>}
    </>}
    {aiReview && <StudioDialog title={__kbUi("AI natijasini tekshiring")} eyebrow={__kbUi("QO‘LLASHDAN OLDIN")} className="ps51-ai-review" onClose={() => setAiReview(null)} actions={<button type="button" className="ps49-button ps49-primary" disabled={serialized !== aiReview.snapshot || generation.current !== aiReview.revision} onClick={applyAI}><Check size={17} />{aiReview.count === 1 ? __kbUi('Shu slaydga qo‘llash') : __kbUi(`${aiReview.count} slaydga qo‘llash`)}</button>}>
      <p className="ps49-intro">{aiReview.count}{__kbUi(" ta slayd uchun mazmun tayyor. Matn va formulalarni tekshiring. Rasm tavsiflari rasm o‘rnini bosmaydi — kerakli fayllarni o‘zingiz yuklaysiz.")}</p>
      {serialized !== aiReview.snapshot && <div className="ps49-banner ps51-stale-warning" role="alert"><AlertCircle size={20} /><div><strong>{__kbUi("Loyiha tayyorlash davomida o‘zgargan")}</strong><p>{__kbUi("O‘zgarishlaringiz saqlanib turibdi. Joriy loyiha uchun natijani qayta tayyorlang.")}</p><button type="button" className="ps49-button ps49-button-small" onClick={() => { const ids = aiReview.ids; setAiReview(null); generateAI(ids); }}>{__kbUi("Qayta tayyorlash")}</button></div></div>}
      {aiReview.warnings.length > 0 && <div className="ps51-ai-warnings">{aiReview.warnings.map((warning, index) => <p key={index}>{__kbUi(warning)}</p>)}</div>}
      <div className="ps51-review-tabs" role="group" aria-label={__kbUi("AI natijasidagi slaydlar")}>{aiReview.indexes.map(index => <button type="button" key={aiReview.document.slides[index].id} className={aiReviewAt === index ? 'is-active' : ''} aria-pressed={aiReviewAt === index} onClick={() => setAiReviewAt(index)}>{index + 1}. {aiReview.document.slides[index].title}</button>)}</div>
      <SlidePreview document={aiReview.document} index={aiReviewAt} />
      <details className="ps50-extra-fields"><summary>{__kbUi("Slayd matnini to‘liq o‘qish")}</summary><div className="ps51-review-copy">{['body', 'body2', 'body3', 'formula', 'example', 'image_prompt', 'image2_prompt'].map(field => aiReview.document.slides[aiReviewAt]?.[field] ? <p key={field}><strong>{__kbUi({ body: 'Asosiy matn', body2: '2-matn', body3: '3-matn', formula: 'Formula', example: 'Misol', image_prompt: '1-rasm tavsifi', image2_prompt: '2-rasm tavsifi' }[field])}</strong>{aiReview.document.slides[aiReviewAt][field]}</p> : null)}</div></details>
      <p className="ps49-help">{__kbUi("“Yopish” natijani qo‘llamaydi. “Qo‘llash”dan keyin “Bekor qilish” orqali avvalgi mazmunga qaytishingiz mumkin.")}</p>
    </StudioDialog>}
    {libraryOpen && <StudioDialog title={__kbUi("Loyihalarim")} eyebrow={__kbUi("SHAXSIY LOYIHALAR")} onClose={() => setLibraryOpen(false)} actions={<button type="button" className="ps49-button" onClick={loadLibrary} disabled={libraryLoading || !!busy}><RotateCcw size={16} />{__kbUi("Ro‘yxatni yangilash")}</button>}><p className="ps49-intro">{__kbUi("Serverga saqlangan loyihalaringiz. Har bir hisobda 50 tagacha loyiha.")}</p>{libraryLoading ? <p role="status">{__kbUi("Loyihalar yuklanmoqda…")}</p> : !projects.length ? <div className="ps49-empty-library"><FolderOpen size={35} /><h3>{__kbUi("Hali saqlangan loyiha yo‘q")}</h3><p>{__kbUi("Taqdimotni “Serverga saqlash” tugmasi bilan shu yerga qo‘shing.")}</p></div> : <div className="ps49-project-list">{projects.map(item => <div className="ps49-project-row" key={item.id}><span className="ps49-project-symbol"><Presentation size={23} /></span><button type="button" className="ps49-project-open" disabled={!!busy} onClick={() => openProject(item)}><strong>{item.title}</strong><small>{item.subject || __kbUi('Fan belgilanmagan')} · {item.slide_count}{__kbUi(" slayd · ")}{__kbUi(when(item.updated_at))}</small></button><button type="button" className="ps49-icon-button ps49-danger" aria-label={__kbUi(`“${item.title}” loyihasini o‘chirish`)} disabled={!!busy} onClick={() => deleteProject(item)}><Trash2 size={17} /></button></div>)}</div>}{error && <p role="alert" className="ps49-inline-error">{__kbUi(error)}</p>}</StudioDialog>}
    {importOpen && <StudioDialog title={__kbUi("Hujjat yoki matnni olish")} eyebrow={__kbUi("MAZMUNNI KO‘RIB CHIQISH")} className="ps49-import-modal" onClose={closeImport} actions={<button type="button" className="ps49-button ps49-primary" onClick={applyImport} disabled={!!busy || !importConfirmed || !importSlides.document || !!importSlides.error}>{__kbUi("Mazmunni qo‘llash")}<ArrowRight size={16} /></button>}>
      <p className="ps49-intro">{__kbUi("To‘ldirilgan Word shablonni yuklang yoki tegli matnni joylang. Quyidagi natijani tekshirgach, qo‘llashni tasdiqlang.")}</p>
      <div className="ps49-import-tools"><button type="button" className="ps49-button" disabled={!!busy} onClick={() => document.getElementById(`${fileId}-docx`)?.click()}><Upload size={17} />{busy === 'import' ? __kbUi('Hujjat o‘qilmoqda…') : __kbUi('.docx tanlash')}</button><input id={`${fileId}-docx`} type="file" className="ps49-file-input" tabIndex={-1} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={!!busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) importDocx(file); }} /><button type="button" className="ps49-text-button" disabled={!!busy} onClick={() => { if (!importText || window.confirm(__kbUi('Kiritilgan matnni joriy slaydlar rejasiga almashtirasizmi?'))) { try { setImportText(buildTaggedTemplate(draft)); setImportError(''); } catch (err) { setImportError(err.message); } } }}>{__kbUi("Joriy reja teglarini ko‘rish")}</button></div>
      <p className="ps49-help">{__kbUi("Bu Word mazmun shakli: Word bezagi va rasmlari import qilinmaydi. [RASM1] va [RASM2] tavsiflari bo‘yicha haqiqiy rasmlarni saytda yuklang. .docx hajmi: 2 MB gacha.")}</p>
      <Field label={__kbUi("Ko‘rib chiqish va tahrirlash")} value={importText} onChange={value => { setImportText(value); setImportError(''); }} multiline rows={8} disabled={busy === 'import'} maxLength={120000} placeholder={__kbUi(TAG_EXAMPLE)} spellCheck={false} />
      {(importError || importSlides.error) && <p role="alert" className="ps49-inline-error">{importError || __kbUi(importSlides.error)}</p>}
      <div className="ps49-import-result"><strong>{importSlides.slides.length}{__kbUi(" ta slayd aniqlandi · ")}{plannedImport ? __kbUi('joriy reja') : __kbUi('yangi slaydlar')}</strong><p>{plannedImport ? __kbUi('Joriy slaydlarning matni, formulalari va rasm tavsiflari yangilanadi. Tartib, bo‘limlar, joylashuvlar, rasmlar va har bir slayd dizayni saqlanadi.') : __kbUi('Bu matnda reja identifikatorlari yo‘q. Qo‘llasangiz, joriy slaydlar yangi slaydlar bilan almashtiriladi. Eski rasmlar va slaydlarga alohida berilgan dizaynlar olinmaydi; umumiy dizayn saqlanadi.')}</p>
        {!!importSlides.slides.length && <div className="ps50-import-table-wrap"><table className="ps50-import-table"><thead><tr><th>{__kbUi("Slayd")}</th><th>{__kbUi("Yangi sarlavha")}</th><th>{__kbUi("Maydonlar")}</th></tr></thead><tbody>{importSlides.slides.map((slide, index) => { const layout = getLayout(slide.layout); return <tr key={slide.id || index}><td>{index + 1}</td><td>{slide.title}<small>{slide.section}</small></td><td>{layout.textCount}{__kbUi(" matn · ")}{layout.imageCount}{__kbUi(" rasm")}</td></tr>; })}</tbody></table></div>}
      </div>
      <label className="ps50-import-confirm"><input type="checkbox" checked={importConfirmed} disabled={!!busy || !importSlides.document || !!importSlides.error} onChange={event => setImportConfirmed(event.target.checked)} /><span>{plannedImport ? __kbUi('Natijani tekshirdim. Joriy reja bo‘yicha mazmun yangilanishini tasdiqlayman.') : __kbUi('Natijani tekshirdim. Joriy slaydlar almashtirilishini tasdiqlayman.')}</span></label>
      <details className="ps50-extra-fields"><summary>{__kbUi("Eski matn belgilari haqida")}</summary><p className="ps49-help">{__kbUi("[SLAYD], [BO‘LIM], [MATN], [FORMULA], [MISOL] hamda eski [s1], [1qator], [lat]…[/lat] teglari ham qabul qilinadi. Joriy rejaning aniq nusxasi uchun tahrir oynasidagi “Word shablon” tugmasidan foydalaning.")}</p></details>
    </StudioDialog>}
    {presenting && <OverlayPortal className="ps49-presenter" panelRef={presenter} label={__kbUi("Taqdimot namoyishi")} onClose={() => setPresenting(false)} onKeyDown={event => {
      if (event.target?.closest('input,textarea,select') || (event.key === ' ' && event.target?.closest('button'))) return;
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) { event.preventDefault(); setPresentAt(value => Math.min(draft.slides.length - 1, value + 1)); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); setPresentAt(value => Math.max(0, value - 1)); }
      if (event.key === 'Home') { event.preventDefault(); setPresentAt(0); }
      if (event.key === 'End') { event.preventDefault(); setPresentAt(draft.slides.length - 1); }
    }}><header className="ps49-presenter-top"><span>{draft.title}</span><div><button type="button" className="ps49-presenter-button" onClick={() => { if (document.fullscreenElement === presenter.current) document.exitFullscreen?.().catch(() => {}); else presenter.current?.requestFullscreen?.().catch(() => setNotice('Brauzer to‘liq ekranga ruxsat bermadi. Keng ko‘rinishda davom etishingiz mumkin.')); }}><Maximize2 size={18} /><span>{__kbUi("To‘liq ekran")}</span></button><button type="button" className="ps49-presenter-button" data-overlay-close onClick={() => setPresenting(false)}><X size={20} /><span>{__kbUi("Yopish")}</span></button></div></header><main className="ps50-presenter-main"><div className="ps49-presenter-slide"><SlidePreview document={draft} index={presentAt} onNavigate={setPresentAt} transition /></div></main><footer className="ps49-presenter-bottom"><button type="button" className="ps49-presenter-button" onClick={() => setPresentAt(value => Math.max(0, value - 1))} disabled={presentAt === 0}><ChevronLeft size={21} /><span>{__kbUi("Oldingi")}</span></button><span aria-live="polite">{presentAt + 1} / {draft.slides.length}<small>{__kbUi("← → slaydlar · Esc yopish")}</small></span><button type="button" className="ps49-presenter-button" onClick={() => setPresentAt(value => Math.min(draft.slides.length - 1, value + 1))} disabled={presentAt === draft.slides.length - 1}><span>{__kbUi("Keyingi")}</span><ChevronRight size={21} /></button></footer></OverlayPortal>}
  </div>;
}
