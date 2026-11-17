import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Download, FileText, LoaderCircle, Shuffle, Sparkles, Upload, Wand2 } from 'lucide-react';
import SahnaPlayer from './SahnaPlayer.jsx';
import { dvSorov, yuklabOl } from './api.js';
import './dvigatel.css';

/* Kuchli taqdimot: 1) mazmun (AI / Excel / JSON / namuna) → 2) uslub → 3) ko'rish va PPTX.
 * Dizayn, chizmalar va animatsiyani serverdagi dvigatel qiladi; bu oyna faqat boshqaradi. */

const DARAJALAR = [['maktab', 'Maktab'], ['bakalavr', 'Bakalavr'], ['magistr', 'Magistr'], ['bogcha', 'Bog‘cha']];
const TURLAR = [['dars', 'Dars'], ['ma’ruza', 'Ma’ruza'], ['amaliy', 'Amaliy'], ['seminar', 'Seminar']];
const yangiUrug = () => 1 + Math.floor(Math.random() * 2147483000);

export default function DvigatelStudio({ apiBase = '', token, onClose }) {
  const [info, setInfo] = useState(null);
  const [tab, setTab] = useState('ai');
  const [form, setForm] = useState({ mavzu: '', fan: '', daraja: 'maktab', sinf: '', tur: 'dars', qoshimcha: '', manba: '' });
  const [miya, setMiya] = useState(null);
  const [miyalar, setMiyalar] = useState([]);
  const [oila, setOila] = useState('');
  const [palitra, setPalitra] = useState('');
  const [anim, setAnim] = useState('');
  const [bolimTitul, setBolimTitul] = useState(null);
  const [seed, setSeed] = useState(yangiUrug);
  const [sahna, setSahna] = useState(null);
  const [busy, setBusy] = useState('');
  const [xato, setXato] = useState('');
  const [aiVaqt, setAiVaqt] = useState(0);
  const fileRef = useRef(null);
  const ishRef = useRef(null);
  const so = (path, opts) => dvSorov(apiBase, token, path, opts);

  useEffect(() => {
    so('/uslublar').then(setInfo).catch(e => setXato(e.message));
    return () => { ishRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // mazmun yoki uslub o'zgarsa — sahnani qayta yasaymiz (server 0,2 soniyada chizadi)
  useEffect(() => {
    if (!miya) return;
    let bekor = false;
    setBusy('yasash');
    const uslubKod = oila && palitra ? `${oila}.${palitra}.${seed % 3}` : undefined;
    so('/yasash', { method: 'POST', json: { miya, seed, ...(uslubKod ? { uslub: uslubKod } : oila ? { oila } : {}), ...(anim ? { anim } : {}), ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}) } })
      .then(s => { if (!bekor) { setSahna(s); setXato(''); } })
      .catch(e => { if (!bekor) setXato(e.message); })
      .finally(() => { if (!bekor) setBusy(''); });
    return () => { bekor = true; };
  }, [miya, seed, oila, palitra, anim, bolimTitul]); // eslint-disable-line react-hooks/exhaustive-deps

  async function aiYoz() {
    setXato('');
    setBusy('ai');
    setAiVaqt(0);
    const t0 = Date.now();
    try {
      const { ish } = await so('/ai', { method: 'POST', json: form });
      ishRef.current = ish;
      for (;;) {
        await new Promise(r => setTimeout(r, 3000));
        if (ishRef.current !== ish) return;
        setAiVaqt(Math.round((Date.now() - t0) / 1000));
        const h = await so(`/ai/${ish}`);
        if (h.holat === 'tayyor') { setMiya(h.miya); setSeed(yangiUrug()); break; }
        if (h.holat === 'xato') throw new Error(h.xato || 'AI xato qildi');
        if (Date.now() - t0 > 240000) throw new Error('AI juda uzoq ishladi. Qayta urinib ko‘ring.');
      }
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  async function faylYukla(file) {
    if (!file) return;
    setXato('');
    setBusy('import');
    try {
      const buf = await file.arrayBuffer();
      const r = await so('/import', { method: 'POST', raw: buf, headers: { 'X-Fayl-Nomi': encodeURIComponent(file.name) } });
      setMiyalar(r.miyalar);
      if (r.miyalar[0]) { setMiya(r.miyalar[0]); setSeed(yangiUrug()); }
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  async function namuna() {
    setBusy('import');
    try { setMiya(await so('/namuna')); setSeed(yangiUrug()); } catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  async function shablon(n) {
    try { yuklabOl(await so(`/shablon.xlsx?namuna=${n ? 1 : 0}`, { binary: true }), n ? 'Taqdimot_miya_namuna.xlsx' : 'Taqdimot_miya_shablon.xlsx'); } catch (e) { setXato(e.message); }
  }

  async function korsatma() {
    try {
      const t = await so('/korsatma', { text: true });
      await navigator.clipboard.writeText(t);
      setXato('');
      alertMatn('ChatGPT ko‘rsatmasi nusxalandi. ChatGPT’ga joylab, oxiriga mavzuni yozing.');
    } catch (e) { setXato(e.message || 'Nusxalab bo‘lmadi'); }
  }
  const [xabar, setXabar] = useState('');
  function alertMatn(t) { setXabar(t); setTimeout(() => setXabar(''), 5000); }

  async function pptx() {
    if (!sahna) return;
    setBusy('pptx');
    try {
      const uslubKod = sahna.uslub.kod;
      const blob = await so('/pptx', { method: 'POST', json: { miya, seed: sahna.seed, uslub: uslubKod, anim: sahna.uslub.anim, ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}) }, binary: true, timeout: 90000 });
      const nom = (sahna.meta.qisqa || sahna.meta.mavzu || 'taqdimot').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60);
      yuklabOl(blob, `${nom}.pptx`);
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  const oilaObj = info?.oilalar.find(o => o.kod === oila);

  return <div className="dv-studio">
    <header className="dv-head">
      <button type="button" className="dv-back" onClick={onClose}><ArrowLeft size={17} />Orqaga</button>
      <div><h2><Sparkles size={20} /> Kuchli taqdimot</h2>
        <p>Mazmunni bering — dizayn, chizmalar va animatsiyani dastur o‘zi qiladi{info ? ` · ${info.jami.toLocaleString('uz')} xil uslub kombinatsiyasi` : ''}.</p></div>
    </header>

    {xato && <div className="dv-xato" role="alert">{xato}</div>}
    {xabar && <div className="dv-xabar" role="status">{xabar}</div>}

    <section className="dv-card">
      <h3>1. Mazmun (miya)</h3>
      <div className="dv-tabs" role="tablist">
        {[['ai', 'AI yozsin'], ['fayl', 'Excel / JSON yuklash'], ['namuna', 'Namuna']].map(([id, nom]) =>
          <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{nom}</button>)}
      </div>
      {tab === 'ai' && <div className="dv-form">
        {info && !info.ai && <p className="dv-help">AI kaliti serverda sozlanmagan. Hozircha Excel shablon yoki ChatGPT ko‘rsatmasi orqali tayyorlang.</p>}
        <label className="dv-wide">Mavzu<input value={form.mavzu} onChange={e => setForm({ ...form, mavzu: e.target.value })} placeholder="Masalan: Kasrlarni qo‘shish va ayirish" /></label>
        <label>Fan<input value={form.fan} onChange={e => setForm({ ...form, fan: e.target.value })} placeholder="Matematika" /></label>
        <label>Sinf / kurs<input value={form.sinf} onChange={e => setForm({ ...form, sinf: e.target.value })} placeholder="5-sinf yoki 2-kurs" /></label>
        <label>Daraja<select value={form.daraja} onChange={e => setForm({ ...form, daraja: e.target.value })}>{DARAJALAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>Turi<select value={form.tur} onChange={e => setForm({ ...form, tur: e.target.value })}>{TURLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label className="dv-wide">Qo‘shimcha talab (ixtiyoriy)<input value={form.qoshimcha} onChange={e => setForm({ ...form, qoshimcha: e.target.value })} placeholder="Masalan: ko‘proq hayotiy misollar, 4 ta bo‘lim" /></label>
        <label className="dv-wide">Manba matn (ixtiyoriy — darslikdan parcha, reja)<textarea rows={3} value={form.manba} onChange={e => setForm({ ...form, manba: e.target.value })} /></label>
        <button type="button" className="dv-primary" disabled={busy === 'ai' || form.mavzu.trim().length < 3 || (info && !info.ai)} onClick={aiYoz}>
          {busy === 'ai' ? <><LoaderCircle className="dv-spin" size={17} />AI yozmoqda… {aiVaqt}s</> : <><Wand2 size={17} />AI’ga yozdirish</>}</button>
      </div>}
      {tab === 'fayl' && <div className="dv-fayl">
        <p className="dv-help">Excel shablonni to‘ldiring yoki ChatGPT bergan JSON’ni yuklang. Bitta fayl — bitta mavzu.</p>
        <div className="dv-row">
          <button type="button" className="dv-primary" onClick={() => fileRef.current?.click()} disabled={busy === 'import'}><Upload size={16} />Fayl tanlash (.xlsx, .json)</button>
          <input ref={fileRef} type="file" accept=".xlsx,.json,application/json" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; faylYukla(f); }} />
          <button type="button" onClick={() => shablon(false)}><Download size={16} />Bo‘sh shablon</button>
          <button type="button" onClick={() => shablon(true)}><FileText size={16} />To‘ldirilgan namuna</button>
          <button type="button" onClick={korsatma}><Copy size={16} />ChatGPT ko‘rsatmasi</button>
        </div>
        {miyalar.length > 1 && <div className="dv-row">{miyalar.map((m, i) => <button type="button" key={i} onClick={() => setMiya(m)} className={miya === m ? 'is-active' : ''}>{m.meta.mavzu}</button>)}</div>}
      </div>}
      {tab === 'namuna' && <div className="dv-fayl"><p className="dv-help">«Ratsional sonlar» ma’ruzasi miyasi — dvigatel qanday ishlashini ko‘rish uchun.</p>
        <button type="button" className="dv-primary" onClick={namuna}><Sparkles size={16} />Namunani ochish</button></div>}
      {miya && <p className="dv-ok">Mazmun tayyor: <b>{miya.meta.mavzu}</b> · {miya.bolimlar.length} bo‘lim · {miya.bolimlar.reduce((n, b) => n + b.slaydlar.length, 0)} mazmun slaydi</p>}
    </section>

    {miya && info && <section className="dv-card">
      <h3>2. Uslub</h3>
      <div className="dv-row dv-chips">
        <button type="button" className={!oila ? 'is-active' : ''} onClick={() => { setOila(''); setPalitra(''); setSeed(yangiUrug()); }}><Shuffle size={15} />Tasodifiy</button>
        {info.oilalar.map(o => <button type="button" key={o.kod} className={oila === o.kod ? 'is-active' : ''} onClick={() => { setOila(o.kod); setPalitra(o.palitralar[0].kod); }}>{o.nom}</button>)}
      </div>
      {oilaObj && <div className="dv-row dv-chips">{oilaObj.palitralar.map(p => <button type="button" key={p.kod} className={palitra === p.kod ? 'is-active' : ''} onClick={() => setPalitra(p.kod)}>
        <span className="dv-dots">{p.acc.map(c => <i key={c} style={{ background: c }} />)}</span>{p.nom}</button>)}</div>}
      <div className="dv-row dv-chips">
        <span className="dv-label">Animatsiya:</span>
        <button type="button" className={!anim ? 'is-active' : ''} onClick={() => setAnim('')}>Tasodifiy</button>
        {info.animatsiyalar.map(a => <button type="button" key={a.kod} className={anim === a.kod ? 'is-active' : ''} onClick={() => setAnim(a.kod)}>{a.nom}</button>)}
      </div>
      <div className="dv-row dv-chips">
        <span className="dv-label">Bo‘lim titullari:</span>
        {[[null, 'Avto'], [true, 'Bor'], [false, 'Yo‘q']].map(([v, n]) => <button type="button" key={String(v)} className={bolimTitul === v ? 'is-active' : ''} onClick={() => setBolimTitul(v)}>{n}</button>)}
        <button type="button" onClick={() => setSeed(yangiUrug())}><Shuffle size={15} />Boshqa variant</button>
      </div>
    </section>}

    {sahna && <section className="dv-card">
      <div className="dv-row dv-spread"><h3>3. Ko‘rish {busy === 'yasash' && <LoaderCircle className="dv-spin" size={16} />}</h3>
        <span className="dv-help">{sahna.slaydlar.length} slayd · uslub {sahna.uslub.kod} · {sahna.uslub.anim} · urug‘ {sahna.seed}</span>
        <button type="button" className="dv-primary" onClick={pptx} disabled={busy === 'pptx'}>{busy === 'pptx' ? <LoaderCircle className="dv-spin" size={16} /> : <Download size={16} />}PowerPoint (.pptx) yuklab olish</button></div>
      <p className="dv-help">Slaydni bosing yoki → / bo‘sh joy — keyingi qadam. Reja kartalari, pastki nuqtalar, savol kartalari va test variantlari bosiladi. F — to‘liq ekran.</p>
      <SahnaPlayer sahna={sahna} apiBase={apiBase} />
    </section>}
  </div>;
}
