import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Copy, Download, FileText, ListTree, LoaderCircle, Plus, Shuffle, Sparkles, Upload, Wand2, X } from 'lucide-react';
import SahnaPlayer from './SahnaPlayer.jsx';
import { dvSorov, yuklabOl } from './api.js';
import './dvigatel.css';

/* Kuchli taqdimot: 1) mazmun (tayyor mavzu / AI / Excel / JSON / namuna) → 2) uslub → 3) ko'rish va PPTX.
 * Dizayn, chizmalar va animatsiyani serverdagi dvigatel qiladi; bu oyna faqat boshqaradi. */

const DARAJALAR = [['maktab', 'Maktab'], ['bakalavr', 'Bakalavr'], ['magistr', 'Magistr'], ['bogcha', 'Bog‘cha']];
const TURLAR = [['dars', 'Dars'], ['ma’ruza', 'Ma’ruza'], ['amaliy', 'Amaliy'], ['seminar', 'Seminar']];
const SLAYD_SONI = [8, 10, 12, 16, 20, 25, 30, 40];
const HAJMLAR = [['qisqa', 'Qisqa'], ['orta', 'O‘rta'], ['batafsil', 'Batafsil']];
const TILLAR = [['uz', 'O‘zbek'], ['ru', 'Rus'], ['en', 'Ingliz']];
const OHANGLAR = [['', 'Avto'], ['ilmiy', 'Ilmiy'], ['oddiy', 'Oddiy'], ['oyinli', 'O‘yinli']];
const yangiUrug = () => 1 + Math.floor(Math.random() * 2147483000);

export default function DvigatelStudio({ apiBase = '', token, onClose }) {
  const [info, setInfo] = useState(null);
  const [tab, setTab] = useState('tayyor');
  const [kutub, setKutub] = useState(null);
  const [kutubTur, setKutubTur] = useState('');
  const [tanlangan, setTanlangan] = useState(null);
  const [form, setForm] = useState({ mavzu: '', fan: '', daraja: 'maktab', sinf: '', tur: 'dars', qoshimcha: '', manba: '' });
  const [miya, setMiya] = useState(null);
  const [miyalar, setMiyalar] = useState([]);
  const [oila, setOila] = useState('');
  const [palitra, setPalitra] = useState('');
  const [anim, setAnim] = useState('');
  const [bolimTitul, setBolimTitul] = useState(null);
  const [rasmAvto, setRasmAvto] = useState(true);
  const [dizayn, setDizayn] = useState({});
  const [nusxa, setNusxa] = useState(false);
  const [seed, setSeed] = useState(yangiUrug);
  const [sahna, setSahna] = useState(null);
  const [busy, setBusy] = useState('');
  const [xato, setXato] = useState('');
  const [aiVaqt, setAiVaqt] = useState(0);
  const [sozlama, setSozlama] = useState({ slayd_soni: 12, hajm: 'orta', til: 'uz', ohang: '' });
  const [reja, setReja] = useState(null);
  const fileRef = useRef(null);
  const xatoRef = useRef(null);
  const [pptxXato, setPptxXato] = useState('');
  const zipRef = useRef(null);
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
    so('/yasash', { method: 'POST', json: { miya, seed, ...(uslubKod ? { uslub: uslubKod } : oila ? { oila } : {}), ...(anim ? { anim } : {}), ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}), rasm_avto: rasmAvto, dizayn } })
      .then(s => { if (!bekor) { setSahna(s); setXato(''); } })
      .catch(e => { if (!bekor) setXato(e.message); })
      .finally(() => { if (!bekor) setBusy(''); });
    return () => { bekor = true; };
  }, [miya, seed, oila, palitra, anim, bolimTitul, rasmAvto, dizayn]); // eslint-disable-line react-hooks/exhaustive-deps

  async function aiIsh(body, natijaUchun) {
    setXato('');
    setBusy('ai');
    setAiVaqt(0);
    const t0 = Date.now();
    try {
      const { ish } = await so('/ai', { method: 'POST', json: body });
      ishRef.current = ish;
      for (;;) {
        await new Promise(r => setTimeout(r, 3000));
        if (ishRef.current !== ish) return;
        setAiVaqt(Math.round((Date.now() - t0) / 1000));
        const h = await so(`/ai/${ish}`);
        if (h.holat === 'tayyor') { natijaUchun(h.miya); break; }
        if (h.holat === 'xato') throw new Error(h.xato || 'AI xato qildi');
        if (Date.now() - t0 > 300000) throw new Error('AI juda uzoq ishladi. Qayta urinib ko‘ring.');
      }
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  function aiYoz(rejaBilan = false) {
    return aiIsh({ ...form, sozlama, ...(rejaBilan && reja ? { reja } : {}) }, m => { setMiya(m); setSeed(yangiUrug()); });
  }

  function aiReja() {
    return aiIsh({ ...form, sozlama, faqat_reja: true }, r => setReja(r));
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

  async function rasmZip(file) {
    if (!file) return;
    setXato('');
    setBusy('rasm');
    try {
      const zip = /\.zip$/i.test(file.name);
      const r = await so('/rasm-yuklash', { method: 'POST', raw: await file.arrayBuffer(), timeout: 600000, headers: zip ? {} : { 'X-Kalit': file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_') } });
      alertMatn(`${r.saqlandi} ta rasm saqlandi${r.xato?.length ? `, ${r.xato.length} tasi o‘qilmadi` : ''}.`);
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  useEffect(() => {
    if (tab !== 'tayyor' || kutub) return;
    so('/kutubxona').then(d => setKutub(d.toplamlar || [])).catch(e => { setKutub([]); setXato(e.message); });
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function tayyorOch(toplam, m) {
    setBusy('tayyor:' + m.kod);
    setXato('');
    try { setMiya(await so(`/kutubxona/${toplam}/${encodeURIComponent(m.kod)}`)); setTanlangan({ toplam, ...m }); setSeed(yangiUrug()); }
    catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  async function tayyorHujjat(toplam, m, tur) {
    const nomlar = { oqituvchi: 'oqituvchi_matni.md', topshiriq: 'talaba_topshirigi.md', reja: 'reja.json', javoblar: 'javoblar.json' };
    try { yuklabOl(await so(`/kutubxona/${toplam}/${encodeURIComponent(m.kod)}/${tur}`, { binary: true }), `${m.kod}_${nomlar[tur]}`); }
    catch (e) { setXato(e.message); }
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

  // xato sahifaning tepasida chiqadi — pastda ishlayotgan odam ko'rmay qolmasin
  useEffect(() => { if (xato) xatoRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }); }, [xato]);

  async function pptx() {
    if (!sahna) return;
    setBusy('pptx');
    setPptxXato('');
    try {
      const uslubKod = sahna.uslub.kod;
      // sayt ko'rinishidagidek: o'sha urug', uslub, asosiy va yordamchi animatsiya, dizayn
      const blob = await so('/pptx', { method: 'POST', json: { miya, seed: sahna.seed, uslub: uslubKod, anim: sahna.uslub.anim, anim2: sahna.dizayn?.anim2 || '', ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}), rasm_avto: rasmAvto, dizayn }, binary: true, timeout: 180000 });
      const nom = (sahna.meta.qisqa || sahna.meta.mavzu || 'taqdimot').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60);
      yuklabOl(blob, `${nom}.pptx`);
      alertMatn('PowerPoint fayli tayyor — yuklab olish boshlandi.');
    } catch (e) {
      setPptxXato(e.message || 'Fayl tayyorlanmadi');
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

    {xato && <div className="dv-xato" role="alert" ref={xatoRef}>{xato}</div>}
    {xabar && <div className="dv-xabar" role="status">{xabar}</div>}

    <section className="dv-card">
      <h3>1. Mazmun (miya)</h3>
      <div className="dv-tabs" role="tablist">
        {[['tayyor', 'Tayyor mavzular'], ['ai', 'AI yozsin'], ['fayl', 'Excel / JSON yuklash'], ['namuna', 'Namuna']].map(([id, nom]) =>
          <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{nom}</button>)}
      </div>
      {tab === 'tayyor' && <div className="dv-fayl">
        {!kutub && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}
        {kutub && !kutub.length && <p className="dv-help">Hozircha tayyor mavzular yo‘q.</p>}
        {kutub && kutub.map(t => <div key={t.kod} className="dv-kutub">
          <p className="dv-help"><b>{t.nom}</b> · {t.mavzular.length} ta mavzu</p>
          <div className="dv-row dv-chips">
            {[['', 'Hammasi'], ['maruza', 'Ma’ruza'], ['amaliy', 'Amaliy'], ['mustaqil', 'Mustaqil ta’lim']].map(([k, n]) =>
              <button type="button" key={k} className={kutubTur === k ? 'is-active' : ''} onClick={() => setKutubTur(k)}>{n} ({k ? t.mavzular.filter(m => m.tur === k).length : t.mavzular.length})</button>)}
          </div>
          <div className="dv-mavzular">
            {t.mavzular.filter(m => !kutubTur || m.tur === kutubTur).map(m => {
              const faol = tanlangan && tanlangan.toplam === t.kod && tanlangan.kod === m.kod;
              return <div key={m.kod} className={`dv-mavzu${faol ? ' is-active' : ''}`}>
                <button type="button" className="dv-mavzu-btn" onClick={() => tayyorOch(t.kod, m)} disabled={busy === 'tayyor:' + m.kod}>
                  <span className="dv-mavzu-kod">{m.kod}</span>
                  <span className="dv-mavzu-nom">{m.nom}</span>
                  <span className="dv-mavzu-info">{m.tur_nomi}{m.testlar ? ` · ${m.testlar} test` : ''}</span>
                  {busy === 'tayyor:' + m.kod && <LoaderCircle className="dv-spin" size={15} />}
                </button>
                {faol && <div className="dv-row dv-mavzu-hujjat">
                  {m.oqituvchi && <button type="button" onClick={() => tayyorHujjat(t.kod, m, 'oqituvchi')}><BookOpen size={15} />O‘qituvchi matni</button>}
                  {m.topshiriq && <button type="button" onClick={() => tayyorHujjat(t.kod, m, 'topshiriq')}><FileText size={15} />Talaba topshirig‘i</button>}
                  {m.reja && <button type="button" onClick={() => tayyorHujjat(t.kod, m, 'reja')}><FileText size={15} />Reja</button>}
                  {m.javoblar && <button type="button" onClick={() => tayyorHujjat(t.kod, m, 'javoblar')}><Download size={15} />Javoblar (admin)</button>}
                </div>}
              </div>;
            })}
          </div>
        </div>)}
      </div>}
      {tab === 'ai' && <div className="dv-form">
        {info && !info.ai && <p className="dv-help">AI kaliti serverda sozlanmagan. Hozircha Excel shablon yoki ChatGPT ko‘rsatmasi orqali tayyorlang.</p>}
        <label className="dv-wide">Mavzu<input value={form.mavzu} onChange={e => setForm({ ...form, mavzu: e.target.value })} placeholder="Masalan: Kasrlarni qo‘shish va ayirish" /></label>
        <label>Fan<input value={form.fan} onChange={e => setForm({ ...form, fan: e.target.value })} placeholder="Matematika" /></label>
        <label>Sinf / kurs<input value={form.sinf} onChange={e => setForm({ ...form, sinf: e.target.value })} placeholder="5-sinf yoki 2-kurs" /></label>
        <label>Daraja<select value={form.daraja} onChange={e => setForm({ ...form, daraja: e.target.value })}>{DARAJALAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>Turi<select value={form.tur} onChange={e => setForm({ ...form, tur: e.target.value })}>{TURLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label className="dv-wide">Qo‘shimcha talab (ixtiyoriy)<input value={form.qoshimcha} onChange={e => setForm({ ...form, qoshimcha: e.target.value })} placeholder="Masalan: ko‘proq hayotiy misollar, 4 ta bo‘lim" /></label>
        <label className="dv-wide">Manba matn (ixtiyoriy — darslikdan parcha, reja)<textarea rows={3} value={form.manba} onChange={e => setForm({ ...form, manba: e.target.value })} /></label>
        <label>Slaydlar soni<select value={sozlama.slayd_soni} onChange={e => setSozlama({ ...sozlama, slayd_soni: Number(e.target.value) })}>{SLAYD_SONI.map(n => <option key={n} value={n}>{n} ta</option>)}</select></label>
        <label>Matn hajmi<select value={sozlama.hajm} onChange={e => setSozlama({ ...sozlama, hajm: e.target.value })}>{HAJMLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>Til<select value={sozlama.til} onChange={e => setSozlama({ ...sozlama, til: e.target.value })}>{TILLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>Ohang<select value={sozlama.ohang} onChange={e => setSozlama({ ...sozlama, ohang: e.target.value })}>{OHANGLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        {!reja && <div className="dv-row dv-wide">
          <button type="button" className="dv-primary" disabled={busy === 'ai' || form.mavzu.trim().length < 3 || (info && !info.ai)} onClick={aiReja}>
            {busy === 'ai' ? <><LoaderCircle className="dv-spin" size={17} />AI ishlamoqda… {aiVaqt}s</> : <><ListTree size={17} />Avval reja (tahrirlab olasiz)</>}</button>
          <button type="button" disabled={busy === 'ai' || form.mavzu.trim().length < 3 || (info && !info.ai)} onClick={() => aiYoz(false)}><Wand2 size={17} />Darhol yozsin</button>
        </div>}
        {reja && <RejaMuharrir reja={reja} setReja={setReja} busy={busy === 'ai'} aiVaqt={aiVaqt} onYoz={() => aiYoz(true)} />}
      </div>}
      {tab === 'fayl' && <div className="dv-fayl">
        <p className="dv-help">Excel shablonni to‘ldiring yoki ChatGPT bergan JSON’ni yuklang. Bitta fayl — bitta mavzu.</p>
        <div className="dv-row">
          <button type="button" className="dv-primary" onClick={() => fileRef.current?.click()} disabled={busy === 'import'}><Upload size={16} />Fayl tanlash (.xlsx, .json)</button>
          <input ref={fileRef} type="file" accept=".xlsx,.json,application/json" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; faylYukla(f); }} />
          <button type="button" onClick={() => shablon(false)}><Download size={16} />Bo‘sh shablon</button>
          <button type="button" onClick={() => shablon(true)}><FileText size={16} />To‘ldirilgan namuna</button>
          <button type="button" onClick={korsatma}><Copy size={16} />ChatGPT ko‘rsatmasi</button>
          <button type="button" onClick={() => zipRef.current?.click()} disabled={busy === 'rasm'}>{busy === 'rasm' ? <LoaderCircle className="dv-spin" size={16} /> : <Upload size={16} />}Rasmlar ZIP (admin)</button>
          <input ref={zipRef} type="file" accept=".zip,image/png,image/webp,image/jpeg" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; rasmZip(f); }} />
        </div>
        <p className="dv-help">Rasm fayli nomi = rasm kaliti (masalan al_xorazmiy.png). Bir ZIP’da 3000 tagacha rasm, 120 MB gacha.</p>
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
      {info.dizaynlar && [['titul', 'Titul'], ['sarlavha', 'Sarlavha qatori'], ['bolim', 'Bo‘lim slaydi'], ['kart', 'Kartalar']].map(([kalit, nom]) => <div className="dv-row dv-chips" key={kalit}>
        <span className="dv-label">{nom}:</span>
        <button type="button" className={dizayn[kalit] === undefined ? 'is-active' : ''} onClick={() => setDizayn(d => { const n = { ...d }; delete n[kalit]; return n; })}>Avto</button>
        {info.dizaynlar[kalit].map(v => <button type="button" key={v.kod} className={dizayn[kalit] === v.kod ? 'is-active' : ''} onClick={() => setDizayn(d => ({ ...d, [kalit]: v.kod }))}>{v.nom}</button>)}
      </div>)}
      <div className="dv-row dv-chips">
        <span className="dv-label">Rasmlar:</span>
        {[[true, 'Kutubxonadan mosini qo‘ysin'], [false, 'Faqat miyadagilar']].map(([v, n]) => <button type="button" key={String(v)} className={rasmAvto === v ? 'is-active' : ''} onClick={() => setRasmAvto(v)}>{n}</button>)}
      </div>
    </section>}

    {sahna && <section className="dv-card">
      <div className="dv-row dv-spread"><h3>3. Ko‘rish {busy === 'yasash' && <LoaderCircle className="dv-spin" size={16} />}</h3>
        <span className="dv-help">{sahna.slaydlar.length} slayd · uslub {sahna.uslub.kod} · {sahna.uslub.anim} · urug‘ {sahna.seed}</span>
        <button type="button" className="dv-primary" onClick={pptx} disabled={busy === 'pptx'}>{busy === 'pptx' ? <LoaderCircle className="dv-spin" size={16} /> : <Download size={16} />}{busy === 'pptx' ? 'Fayl tayyorlanmoqda…' : 'PowerPoint (.pptx) yuklab olish'}</button></div>
      {pptxXato && <div className="dv-xato" role="alert">PowerPoint fayli tayyorlanmadi: {pptxXato}</div>}
      <p className="dv-help">Slaydni bosing yoki → / bo‘sh joy — keyingi qadam. Reja kartalari, pastki nuqtalar, savol kartalari va test variantlari bosiladi. F — to‘liq ekran.</p>
      <SahnaPlayer sahna={sahna} apiBase={apiBase} />
      {sahna.rasm_hisobot && <RasmHisobot h={sahna.rasm_hisobot} nusxa={nusxa} setNusxa={setNusxa} />}
    </section>}
  </div>;
}


function RasmHisobot({ h, nusxa, setNusxa }) {
  const ishlatilgan = h.ishlatilgan || [];
  const yoq = h.yoq || [];
  if (!ishlatilgan.length && !yoq.length) return null;
  const promptlar = yoq.map(r => `${r.kalit}.png — ${r.tavsif || ''}${r.prompt ? `\n${r.prompt}` : ''}`).join('\n\n');
  async function nusxala() {
    try { await navigator.clipboard.writeText(promptlar); setNusxa(true); setTimeout(() => setNusxa(false), 2000); } catch { /* brauzer ruxsat bermadi */ }
  }
  return <div className="dv-rasm-hisobot">
    <p className="dv-help"><b>Rasmlar:</b> {ishlatilgan.length} ta ishlatildi
      {h.qoshildi?.length ? ` (${h.qoshildi.length} tasini dastur kutubxonadan mos deb qo‘ydi)` : ''}
      {h.almashtirildi?.length ? ` · ${h.almashtirildi.length} ta nom kutubxonadagi yaqin rasmga almashtirildi` : ''}.</p>
    {yoq.length > 0 && <details>
      <summary>Kutubxonada yo‘q {yoq.length} ta rasm — slaydga qo‘yilmadi (chizdirish uchun ro‘yxat)</summary>
      <ul>{yoq.map(r => <li key={r.kalit}><code>{r.kalit}</code> — {r.tavsif || 'tavsif yo‘q'}{r.prompt && <div className="dv-prompt">{r.prompt}</div>}</li>)}</ul>
      <button type="button" onClick={nusxala}><Copy size={15} />{nusxa ? 'Nusxa olindi' : 'Promptlarni nusxalash'}</button>
    </details>}
  </div>;
}


function RejaMuharrir({ reja, setReja, busy, aiVaqt, onYoz }) {
  const bolimlar = reja.bolimlar || [];
  const jami = bolimlar.reduce((n, b) => n + b.slaydlar.length, 0);
  const yangila = fn => setReja(r => { const c = JSON.parse(JSON.stringify(r)); fn(c); return c; });
  const kochir = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
  return <div className="dv-reja dv-wide">
    <div className="dv-row dv-spread"><b>Reja: {reja.meta?.mavzu}</b><span className="dv-help">{bolimlar.length} bo‘lim · {jami} slayd</span></div>
    <p className="dv-help">Sarlavhalarni o‘zgartiring, keraksizini o‘chiring, yangisini qo‘shing — AI aynan shu reja bo‘yicha yozadi.</p>
    {bolimlar.map((b, bi) => <div key={bi} className="dv-reja-bolim">
      <div className="dv-row">
        <span className="dv-reja-raqam">{bi + 1}</span>
        <input className="dv-reja-nom" value={b.nom} onChange={e => yangila(c => { c.bolimlar[bi].nom = e.target.value; })} />
        <button type="button" title="Yuqoriga" onClick={() => yangila(c => kochir(c.bolimlar, bi, -1))}><ArrowUp size={14} /></button>
        <button type="button" title="Pastga" onClick={() => yangila(c => kochir(c.bolimlar, bi, 1))}><ArrowDown size={14} /></button>
        <button type="button" title="Bo‘limni o‘chirish" disabled={bolimlar.length < 2} onClick={() => yangila(c => { c.bolimlar.splice(bi, 1); })}><X size={14} /></button>
      </div>
      {b.slaydlar.map((sl, si) => <div key={si} className="dv-row dv-reja-slayd">
        <input value={sl.sarlavha} onChange={e => yangila(c => { c.bolimlar[bi].slaydlar[si].sarlavha = e.target.value; })} />
        {sl.tur && <span className="dv-reja-tur">{sl.tur}</span>}
        <button type="button" title="Yuqoriga" onClick={() => yangila(c => kochir(c.bolimlar[bi].slaydlar, si, -1))}><ArrowUp size={14} /></button>
        <button type="button" title="Pastga" onClick={() => yangila(c => kochir(c.bolimlar[bi].slaydlar, si, 1))}><ArrowDown size={14} /></button>
        <button type="button" title="O‘chirish" disabled={b.slaydlar.length < 2} onClick={() => yangila(c => { c.bolimlar[bi].slaydlar.splice(si, 1); })}><X size={14} /></button>
      </div>)}
      {b.slaydlar.length < 8 && <button type="button" className="dv-reja-qosh" onClick={() => yangila(c => { c.bolimlar[bi].slaydlar.push({ sarlavha: 'Yangi slayd', maqsad: '', tur: '' }); })}><Plus size={14} />Slayd qo‘shish</button>}
    </div>)}
    <div className="dv-row">
      {bolimlar.length < 6 && <button type="button" onClick={() => yangila(c => { c.bolimlar.push({ nom: 'Yangi bo‘lim', izoh: '', slaydlar: [{ sarlavha: 'Yangi slayd', maqsad: '', tur: '' }] }); })}><Plus size={15} />Bo‘lim qo‘shish</button>}
      <button type="button" onClick={() => setReja(null)}><X size={15} />Rejani bekor qilish</button>
      <button type="button" className="dv-primary" disabled={busy} onClick={onYoz}>
        {busy ? <><LoaderCircle className="dv-spin" size={17} />AI yozmoqda… {aiVaqt}s</> : <><Wand2 size={17} />Shu reja bo‘yicha yozsin</>}</button>
    </div>
  </div>;
}
