/* Ochiq dars tayyorlash — 3 qadam: 1) sinf/kurs (majburiy), fan va mavzu → 2) dars turi, o'quvchilar, rejim
 * (O'zim tanlayman / Tezkor / AI yozsin) → 3) reja: har bosqich metodini almashtirish, guruhlash va birlashtirish,
 * Word ishlanma va PPTX taqdimot. Metodlar bazasi va mavzu masalliqlaridan rejani server tuzadi. */
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Check, CircleAlert, Download, FileText, ImagePlus, Library, LoaderCircle, PenLine, Search, Shuffle, Sparkles, Users, Wand2, X, Zap } from 'lucide-react';
import { dvUrl, yuklabOl } from './api.js';
import { sinfNomi } from './Kutubxona.jsx';

const DARAJALAR = [['maktab', 'Maktab', 11, 'sinf'], ['bakalavr', 'Bakalavr', 4, 'kurs'], ['magistr', 'Magistratura', 2, 'kurs']];
const REJIMLAR = [['qolda', PenLine, 'O‘zim tanlayman', 'Har bosqich metodini o‘zingiz tanlaysiz; generator mavzu materiallaridan darsni yig‘adi'],
  ['tezkor', Zap, 'Tezkor', 'Generator mavzuga mos metodlarni o‘zi tanlaydi — bir zumda tayyor'],
  ['ai', Sparkles, 'AI yozsin', 'AI materiallarni o‘qib metod, guruhlar, o‘qituvchi nutqi va rasmlarni joylaydi (1–2 daqiqa)']];
const MATERIAL_NOM = { bayonotlar: 'to‘g‘ri/noto‘g‘ri bayonotlar', savollar: 'savollar', atamalar: 'atama va ta’riflar', ortiqcha: '«ortiqchasini top» qatorlari',
  qismlar: 'mavzu qismlari (guruhlarga)', matn: 'muammoli savol', tajriba: 'tajriba tartibi', keys: 'keys (vaziyat)', taqqoslash: 'taqqoslash jadvali',
  klaster: 'klaster', topishmoq: 'topishmoq', xato: 'xato yechim', vazifalar: 'A/B/C vazifalar', royxat: 'ro‘yxat', test: 'test', voqealar: 'voqealar',
  slaydlar: 'mazmun slaydlari', qadamlar: 'qadamlar', jamoaviy: 'jamoaviy masala', guruhlar: 'guruh nomlari' };
const yosh = (daraja, sinf) => {
  const n = +sinf;
  if (!n) return '';
  if (daraja === 'maktab') return n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : n <= 9 ? '7-9' : '10-11';
  if (daraja === 'bakalavr') return n <= 2 ? 'b1-2' : 'b3-4';
  return 'm';
};
// kutubxonadagi «1–4», «1–2-kurs» kabi oraliqlar tanlangan sinfni o'z ichiga oladimi
const oraliqda = (s, n) => {
  const m = /(\d+)\s*[–-]\s*(\d+)/.exec(s || '');
  if (m) return +m[1] <= n && n <= +m[2];
  const b = /\d+/.exec(s || '');
  return b ? +b[0] === n : true;
};

export default function OchiqDars({ so, apiBase, token, onClose }) {
  const [katalog, setKatalog] = useState(null);
  const [qadam, setQadam] = useState(1);
  const [xato, setXato] = useState('');
  const [busy, setBusy] = useState('');
  const [daraja, setDaraja] = useState('maktab');
  const [sinf, setSinf] = useState('');
  const [manbaTur, setManbaTur] = useState('tayyor');
  const [daraxt, setDaraxt] = useState(null);
  const [fan, setFan] = useState('');
  const [mavzular, setMavzular] = useState(null);
  const [q, setQ] = useState('');
  const [tanlangan, setTanlangan] = useState(null);   // kutubxona mavzusi {id, mavzu, fan}
  const [ozFan, setOzFan] = useState('');
  const [ozMavzu, setOzMavzu] = useState('');
  const [format, setFormat] = useState('ochiq');
  const [andoza, setAndoza] = useState('');
  const [oquvchilar, setOquvchilar] = useState(25);
  const [guruhlar, setGuruhlar] = useState(0);
  const [metodik, setMetodik] = useState('');
  const [rejim, setRejim] = useState('tezkor');
  const [istak, setIstak] = useState('');
  const [dars, setDars] = useState(null);
  const [aiVaqt, setAiVaqt] = useState(0);

  useEffect(() => {
    so('/ochiq-dars/katalog').then(setKatalog).catch(e => setXato(e.message));
    so('/kutubxona-ai?limit=0').then(d => setDaraxt(d.daraxt || [])).catch(() => setDaraxt([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dr = DARAJALAR.find(d => d[0] === daraja);
  const yk = yosh(daraja, sinf);
  const sinfN = +sinf;
  // tanlangan sinfga mos kutubxona guruhlari (oraliqlar ham)
  const guruhlarK = useMemo(() => (daraxt || []).filter(g => g.daraja === daraja && g.tayyor > 0 && sinfN && oraliqda(g.sinf, sinfN)), [daraxt, daraja, sinfN]);
  const fanlarK = useMemo(() => {
    const m = new Map();
    guruhlarK.forEach(g => m.set(g.fan, (m.get(g.fan) || 0) + g.tayyor));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [guruhlarK]);
  useEffect(() => { if (!fanlarK.some(([f]) => f === fan)) setFan(fanlarK[0]?.[0] || ''); }, [fanlarK]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (manbaTur !== 'tayyor' || !sinfN) return undefined;
    const qidir = q.trim().length >= 2;
    const sinflar = [...new Set(guruhlarK.filter(g => qidir || g.fan === fan).map(g => g.sinf))];
    if (!qidir && (!fan || !sinflar.length)) { setMavzular([]); return undefined; }
    let bekor = false;
    setMavzular(null);
    const t = setTimeout(async () => {
      try {
        const qism = qidir
          ? [await so(`/kutubxona-ai?${new URLSearchParams({ q: q.trim(), daraja })}`)]
          : await Promise.all(sinflar.map(s => so(`/kutubxona-ai?${new URLSearchParams({ daraja, sinf: s, fan })}`)));
        const hammasi = qism.flatMap(d => d.mavzular || []).filter(m => m.holat === 'tayyor' && (!qidir || oraliqda(m.sinf, sinfN)));
        if (!bekor) setMavzular(hammasi);
      } catch (e) { if (!bekor) { setMavzular([]); setXato(e.message); } }
    }, qidir ? 350 : 0);
    return () => { bekor = true; clearTimeout(t); };
  }, [manbaTur, guruhlarK, fan, q, daraja, sinfN]); // eslint-disable-line react-hooks/exhaustive-deps

  // qo'lda yozilgan, tekshirilgan to'liq darslar (AI'siz ham to'liq ochiq dars)
  const qoldaDarslar = useMemo(() => (katalog?.darslar || []).filter(m => m.daraja === daraja && sinfN && oraliqda(m.sinf, sinfN)), [katalog, daraja, sinfN]);
  const fanlarKat = useMemo(() => (katalog?.fanlar || []).filter(f => f.yosh.includes(yk)), [katalog, yk]);
  const andozalar = useMemo(() => {
    const f = (katalog?.fanlar || []).find(x => [x.nom, ...x.nomlar].some(n => n.toLowerCase() === (tanlangan?.fan || ozFan).trim().toLowerCase()));
    return (katalog?.andozalar || []).filter(a => a.yosh.includes(yk) && (f ? f.andozalar.includes(a.kod) : !a.fan.length));
  }, [katalog, yk, tanlangan, ozFan]);
  useEffect(() => { if (andoza && !andozalar.some(a => a.kod === andoza)) setAndoza(''); }, [andozalar]); // eslint-disable-line react-hooks/exhaustive-deps

  const mavzu = manbaTur === 'tayyor' ? tanlangan?.mavzu : ozMavzu.trim();
  const fanNom = manbaTur === 'tayyor' ? tanlangan?.fan : ozFan.trim();
  const birinchiTayyor = !!sinf && !!mavzu && mavzu.length >= 3;

  const manba = () => (manbaTur === 'tayyor' && tanlangan?.id ? { manba: { kutubxona: tanlangan.id } } : {});
  const sorov = (ust = {}) => ({
    daraja, sinf, fan: fanNom || '', mavzu: mavzu || '', format, andoza: andoza || undefined, oquvchilar: +oquvchilar || 25,
    guruhlar: +guruhlar || undefined, metodik_maqsad: metodik.trim() || undefined, ...ust,
  });

  async function tuz(ust = {}, eski = null) {
    setXato('');
    setBusy('tuz');
    try {
      const body = { sorov: sorov(ust), ...manba() };
      if (eski?.meta?.rejim === 'ai') body.masalliq = eski.masalliq;
      let d = await so('/ochiq-dars/tuz', { method: 'POST', json: body, timeout: 90000 });
      if (eski?.meta?.rejim === 'ai') d = ainiSaqla(d, eski);
      setDars(d);
      setQadam(3);
    } catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  // AI yozgan rejada metod almashtirilsa — nutq, rasm va maqsadlar saqlanib qoladi
  function ainiSaqla(d, eski) {
    const n = { ...d, maqsadlar: eski.maqsadlar, natijalar: eski.natijalar, meta: { ...d.meta, rejim: 'ai', rasm: eski.meta.rasm || d.meta.rasm, masalliq_bor: eski.meta.masalliq_bor || d.meta.masalliq_bor } };
    n.bosqichlar = d.bosqichlar.map((b, i) => ({ ...b, nutq: eski.bosqichlar[i]?.nutq || b.nutq, rasm: eski.bosqichlar[i]?.rasm || b.rasm }));
    return n;
  }

  async function aiBoshla() {
    setXato('');
    setBusy('ai');
    setAiVaqt(0);
    const t0 = Date.now();
    const soat = setInterval(() => setAiVaqt(Math.round((Date.now() - t0) / 1000)), 1000);
    try {
      const { ish } = await so('/ochiq-dars/ai', { method: 'POST', json: { sorov: sorov({ istak: istak.trim() || undefined }), ...manba() } });
      for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 2500));
        const h = await so(`/ochiq-dars/ai/${ish}`);
        if (h.holat === 'tayyor') { setDars(h.dars); setQadam(3); return; }
        if (h.holat === 'xato') throw new Error(h.xato || 'AI rejani yoza olmadi');
      }
      throw new Error('AI javobi juda uzoq kutildi — «Tezkor» rejimdan foydalaning.');
    } catch (e) { setXato(e.message); } finally { clearInterval(soat); setBusy(''); }
  }

  const boshla = () => (rejim === 'ai' ? aiBoshla() : tuz({ rejim, urug: undefined }));

  function tanlovlar(ust = {}) {
    const t = {};
    dars.bosqichlar.forEach((b, i) => { if (b.metod?.tur === 'metod') t[String(i)] = b.metod.kod; });
    return { ...t, ...ust };
  }
  const metodAlmashtir = (i, kod) => tuz({ rejim: 'qolda', urug: dars.meta.urug, andoza: dars.meta.andoza, tanlov: tanlovlar({ [String(i)]: kod }),
    guruhlash: dars.guruhlash.kod, birlashtirish: dars.birlashtirish.kod }, dars);
  const guruhAlmashtir = (k, v) => tuz({ rejim: 'qolda', urug: dars.meta.urug, andoza: dars.meta.andoza, tanlov: tanlovlar(),
    guruhlash: k === 'guruhlash' ? v : dars.guruhlash.kod, birlashtirish: k === 'birlashtirish' ? v : dars.birlashtirish.kod }, dars);
  const boshqaVariant = () => tuz({ rejim: 'tezkor', andoza: dars.meta.andoza, urug: 1 + Math.floor(Math.random() * 999999) });

  async function yukla(tur) {
    setXato('');
    setBusy(tur);
    try {
      const res = await fetch(dvUrl(apiBase, `/ochiq-dars/${tur}`), {
        method: 'POST', cache: 'no-store',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ dars, ...manba(), ...(tur === 'pptx' ? { bolim_titul: true } : {}) }),
      });
      if (!res.ok) {
        let d = null;
        try { d = await res.json(); } catch { /* bo'sh */ }
        throw new Error(typeof d?.detail === 'string' ? d.detail : `Fayl tayyorlanmadi (${res.status})`);
      }
      const nom = `Ochiq_dars_${(dars.meta.mavzu || 'dars').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60)}.${tur}`;
      yuklabOl(await res.blob(), nom);
    } catch (e) { setXato(e.message || 'Fayl tayyorlanmadi'); } finally { setBusy(''); }
  }

  if (!katalog && !xato) return <div className="dv-studio"><p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p></div>;

  return <div className="dv-studio dv-ochiq">
    <header className="dv-head">
      {onClose && <button type="button" className="dv-back" onClick={onClose}><ArrowLeft size={17} />Orqaga</button>}
      <div className="dv-head-matn"><h2><Users size={20} /> Ochiq dars tayyorlash</h2>
        <p>Sinf va mavzuni tanlang — metodlar, guruhlarga bo‘lish, o‘yinlar, ilovalar va Word ishlanma tayyor bo‘ladi.</p></div>
    </header>

    <ol className="dv-qadamlar" aria-label="Ochiq dars qadamlari">
      {[['Sinf va mavzu', 'Sinf yoki kurs majburiy'], ['Dars turi', 'Format, guruhlar, rejim'], ['Reja', 'Metodlar, Word, PPTX']].map(([nom, izoh], i) => {
        const n = i + 1;
        const ruxsat = n === 1 || (n === 2 && birinchiTayyor) || (n === 3 && !!dars);
        return <li key={nom}><button type="button" disabled={!ruxsat} aria-current={qadam === n ? 'step' : undefined}
          className={`${qadam === n ? 'is-current' : ''}${(n === 1 && birinchiTayyor) || (n === 3 && dars) ? ' is-done' : ''}`} onClick={() => setQadam(n)}>
          <span className="dv-qadam-raqam">{n}</span><span className="dv-qadam-matn"><b>{nom}</b><small>{izoh}</small></span>
        </button></li>;
      })}
    </ol>

    {xato && <div className="dv-xato" role="alert"><CircleAlert size={17} /> {xato}</div>}

    {qadam === 1 && <section className="dv-card">
      <h3>1-qadam. Sinf yoki kurs, fan va mavzu</h3>
      <div className="dv-row dv-chips" aria-label="Ta’lim bosqichi">
        {DARAJALAR.map(([k, nom]) => <button type="button" key={k} className={daraja === k ? 'is-active' : ''} aria-pressed={daraja === k}
          onClick={() => { setDaraja(k); setSinf(''); setTanlangan(null); }}>{nom}</button>)}
      </div>
      <p className="dv-label">{dr[3] === 'sinf' ? 'Sinf' : 'Kurs'} <em>*</em></p>
      <div className="dv-row dv-chips" aria-label="Sinf yoki kurs">
        {Array.from({ length: dr[2] }, (_, i) => String(i + 1)).map(s => <button type="button" key={s} className={sinf === s ? 'is-active' : ''} aria-pressed={sinf === s}
          onClick={() => { setSinf(s); setTanlangan(null); }}>{s}-{dr[3]}</button>)}
      </div>
      {!sinf && <p className="dv-help">Avval {dr[3] === 'sinf' ? 'sinfni' : 'kursni'} tanlang — metodlar o‘quvchilar yoshiga qarab tanlanadi.</p>}

      {sinf && <>
        <div className="dv-manbalar dv-ochiq-manba" role="tablist">
          <button type="button" role="tab" aria-selected={manbaTur === 'tayyor'} className={manbaTur === 'tayyor' ? 'is-active' : ''} onClick={() => setManbaTur('tayyor')}>
            <Library size={20} /><b>Tayyor mavzular</b><small>Kutubxonadagi mavzu — matn, rasmlar va masalliqlar bilan</small></button>
          <button type="button" role="tab" aria-selected={manbaTur === 'oz'} className={manbaTur === 'oz' ? 'is-active' : ''} onClick={() => setManbaTur('oz')}>
            <PenLine size={20} /><b>O‘z mavzuim</b><small>Fan va mavzuni o‘zingiz yozasiz</small></button>
        </div>

        {manbaTur === 'tayyor' && <div className="dv-kai">
          {qoldaDarslar.length > 0 && <>
            <p className="dv-label">To‘liq yozilgan darslar <small>(mavzu bayoni, yechimli misollar, guruh topshiriqlari — tekshirilgan)</small></p>
            <div className="dv-mavzular dv-ochiq-qolda">
              {qoldaDarslar.map(m => {
                const faol = tanlangan?.qolda && tanlangan.mavzu === m.mavzu;
                return <div key={`${m.fan}|${m.mavzu}`} className={`dv-mavzu${faol ? ' is-active' : ''}`}>
                  <button type="button" className="dv-mavzu-btn" onClick={() => setTanlangan({ id: null, mavzu: m.mavzu, fan: m.fan, qolda: true })}>
                    <span className="dv-mavzu-kod">{faol ? <Check size={14} /> : <BookOpen size={14} />}</span>
                    <span className="dv-mavzu-nom">{m.mavzu}</span>
                    <span className="dv-mavzu-info">{m.fan} · {sinfNomi(m.daraja, m.sinf)} · to‘liq dars</span>
                  </button>
                </div>;
              })}
            </div>
            {fanlarK.length > 0 && <p className="dv-label">Kutubxonadagi mavzular</p>}
          </>}
          {!daraxt && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}
          {daraxt && !fanlarK.length && !qoldaDarslar.length && <p className="dv-help">{sinfNomi(daraja, sinf)} uchun tayyor mavzular hali yo‘q — «O‘z mavzuim»ni tanlang.</p>}
          {fanlarK.length > 0 && <>
            <label className="dv-kai-qidir"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Mavzu nomi bo‘yicha qidirish" aria-label="Mavzu qidirish" />
              {q && <button type="button" onClick={() => setQ('')} aria-label="Tozalash"><X size={15} /></button>}</label>
            {q.trim().length < 2 && <div className="dv-row dv-chips dv-kai-fanlar" aria-label="Fan">
              {fanlarK.map(([f, n]) => <button type="button" key={f} className={fan === f ? 'is-active' : ''} aria-pressed={fan === f} onClick={() => setFan(f)}>{f} <small>{n}</small></button>)}
            </div>}
            {!mavzular && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Mavzular yuklanmoqda…</p>}
            {mavzular && !mavzular.length && <p className="dv-help">Mavzu topilmadi.</p>}
            {mavzular && mavzular.length > 0 && <div className="dv-mavzular">
              {mavzular.map(m => <div key={m.id} className={`dv-mavzu${tanlangan?.id === m.id ? ' is-active' : ''}`}>
                <button type="button" className="dv-mavzu-btn" onClick={() => setTanlangan({ id: m.id, mavzu: m.mavzu, fan: m.fan })}>
                  <span className="dv-mavzu-kod">{tanlangan?.id === m.id ? <Check size={14} /> : (m.raqam || '•')}</span>
                  <span className="dv-mavzu-nom">{m.mavzu}</span>
                  <span className="dv-mavzu-info">{m.bob || m.fan} · {sinfNomi(m.daraja, m.sinf)}</span>
                </button>
              </div>)}
            </div>}
          </>}
        </div>}

        {manbaTur === 'oz' && <div className="dv-form">
          <label><span>Fan <em>*</em></span>
            <input list="dv-ochiq-fanlar" value={ozFan} onChange={e => setOzFan(e.target.value)} placeholder="Masalan: Matematika" />
            <datalist id="dv-ochiq-fanlar">{fanlarKat.map(f => <option key={f.kod} value={f.nom.replace(/^OTM: /, '')} />)}</datalist></label>
          <label className="dv-wide"><span>Mavzu <em>*</em></span><input value={ozMavzu} onChange={e => setOzMavzu(e.target.value)} placeholder="Masalan: Kasrlarni qo‘shish" /></label>
        </div>}
      </>}
      <div className="dv-qadam-nav"><span />
        <button type="button" className="dv-primary" disabled={!birinchiTayyor} onClick={() => setQadam(2)}>Davom etish</button></div>
    </section>}

    {qadam === 2 && <section className="dv-card">
      <h3>2-qadam. Dars turi va tayyorlash usuli</h3>
      <p className="dv-help"><b>{mavzu}</b> · {fanNom} · {sinfNomi(daraja, sinf)}</p>
      <p className="dv-label">Format</p>
      <div className="dv-row dv-chips">
        {(katalog?.formatlar || []).map(f => <button type="button" key={f.kod} className={format === f.kod ? 'is-active' : ''} aria-pressed={format === f.kod}
          title={f.maqsad} onClick={() => setFormat(f.kod)}>{f.nom}</button>)}
      </div>
      <div className="dv-form">
        <label className="dv-wide"><span>Dars turi</span>
          <select value={andoza} onChange={e => setAndoza(e.target.value)}>
            <option value="">Avto (formatga mos)</option>
            {andozalar.map(a => <option key={a.kod} value={a.kod}>{a.nom} — {a.daqiqa} daqiqa</option>)}
          </select></label>
        <label><span>{daraja === 'maktab' ? 'O‘quvchilar' : 'Talabalar'} soni</span><input type="number" min="4" max="60" value={oquvchilar} onChange={e => setOquvchilar(e.target.value)} /></label>
        <label><span>Guruhlar</span>
          <select value={guruhlar} onChange={e => setGuruhlar(e.target.value)}>
            <option value={0}>Avto</option>{[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} guruh</option>)}
          </select></label>
        {format !== 'oddiy' && <label className="dv-wide"><span>Metodik maqsad (ixtiyoriy)</span>
          <input value={metodik} onChange={e => setMetodik(e.target.value)} placeholder="Bo‘sh qolsa — asosiy metoddan o‘zi tuziladi" /></label>}
      </div>
      <p className="dv-label">Qanday tayyorlansin?</p>
      <div className="dv-manbalar dv-ochiq-rejim" role="radiogroup">
        {REJIMLAR.map(([k, B, nom, izoh]) => <button type="button" key={k} role="radio" aria-checked={rejim === k} className={rejim === k ? 'is-active' : ''}
          disabled={k === 'ai' && katalog?.ai === false} onClick={() => setRejim(k)}><B size={20} /><b>{nom}</b><small>{izoh}</small></button>)}
      </div>
      {rejim === 'ai' && <div className="dv-form"><label className="dv-wide"><span>AI uchun istak (ixtiyoriy)</span>
        <textarea rows={2} value={istak} onChange={e => setIstak(e.target.value)} placeholder="Masalan: ko‘proq o‘yin bo‘lsin, STEAM topshirig‘i qo‘shilsin" /></label></div>}
      <div className="dv-qadam-nav">
        <button type="button" onClick={() => setQadam(1)}>Orqaga</button>
        <button type="button" className="dv-primary" disabled={!!busy} onClick={boshla}>
          {busy ? <LoaderCircle className="dv-spin" size={16} /> : <Wand2 size={16} />}
          {busy === 'ai' ? `AI yozmoqda… ${aiVaqt} s` : busy ? 'Tuzilmoqda…' : 'Darsni tuzish'}</button>
      </div>
    </section>}

    {qadam === 3 && dars && <Reja dars={dars} busy={busy} metodAlmashtir={metodAlmashtir} guruhAlmashtir={guruhAlmashtir}
      boshqaVariant={boshqaVariant} yukla={yukla} apiBase={apiBase} orqaga={() => setQadam(2)} so={so}
      titulRasm={k => setDars(d => ({ ...d, meta: { ...d.meta, rasm: k } }))}
      bosqichRasm={(i, k) => setDars(d => ({ ...d, bosqichlar: d.bosqichlar.map((b, j) => (j === i ? { ...b, rasm: k } : b)) }))} />}
  </div>;
}

// Rasm almashtirish: avtomatik tanlangan rasm yoqmasa — o'qituvchi qidirib (o'zbekcha, ruscha, inglizcha) boshqasini qo'yadi.
function RasmTanla({ so, rasmUrl, joriy, sorov, fan, onTanla, onYop }) {
  const [q, setQ] = useState(sorov || '');
  const [royxat, setRoyxat] = useState(null);
  const [xato, setXato] = useState('');
  useEffect(() => {
    let bekor = false;
    const t = setTimeout(async () => {
      try {
        const r = await so(`/ochiq-dars/rasmlar?q=${encodeURIComponent(q.trim())}&fan=${encodeURIComponent(fan || '')}`);
        if (!bekor) { setRoyxat(r.rasmlar || []); setXato(''); }
      } catch (e) { if (!bekor) setXato(e.message); }
    }, 350);
    return () => { bekor = true; clearTimeout(t); };
  }, [q, fan]);   // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="dv-rasm-tanla" role="dialog" aria-label="Rasm tanlash">
    <div className="dv-rasm-tanla-bosh">
      <label className="dv-rasm-qidiruv"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Rasm qidirish: masalan, kasr, yurak, Registon" autoFocus /></label>
      {joriy && <button type="button" onClick={() => onTanla('')}>Rasmsiz</button>}
      <button type="button" aria-label="Yopish" onClick={onYop}><X size={16} /></button>
    </div>
    {xato && <p className="dv-ogoh">{xato}</p>}
    {!royxat && !xato && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Rasmlar qidirilmoqda…</p>}
    {royxat && royxat.length === 0 && <p className="dv-help">Mos rasm topilmadi — boshqa so‘z yozib ko‘ring.</p>}
    {royxat && royxat.length > 0 && <div className="dv-rasm-tur">
      {royxat.map(r => <button type="button" key={r.kalit} className={r.kalit === joriy ? 'is-active' : ''} title={r.nom} onClick={() => onTanla(r.kalit)}>
        <img src={rasmUrl(r.kalit)} alt="" loading="lazy" /><span>{r.nom}</span></button>)}
    </div>}
  </div>;
}

function Reja({ dars, busy, metodAlmashtir, guruhAlmashtir, boshqaVariant, yukla, apiBase, orqaga, so, titulRasm, bosqichRasm }) {
  const mt = dars.meta;
  const rasmUrl = k => dvUrl(apiBase, `/rasm/${encodeURIComponent(k)}`);
  const [tanlov, setTanlov] = useState(null);   // 'titul' | bosqich indeksi | null
  return <section className="dv-card dv-ochiq-reja">
    <div className="dv-ochiq-bosh">
      <div className="dv-ochiq-titul-rasm">
        {mt.rasm && <img src={rasmUrl(mt.rasm)} alt="" />}
        <button type="button" className="dv-rasm-tugma" onClick={() => setTanlov(tanlov === 'titul' ? null : 'titul')}>
          <ImagePlus size={14} />{mt.rasm ? 'Almashtirish' : 'Titul rasmi'}</button>
      </div>
      <div>
        <h3>«{mt.mavzu}»</h3>
        <p className="dv-help">{mt.fan} · {mt.yosh_nom} · {mt.format_nom} · {mt.andoza_nom} · {mt.daqiqa} daqiqa · {mt.oquvchilar} nafar, {dars.guruhlash.guruhlar.length} guruh
          {' · '}{mt.rejim === 'ai' ? 'AI yozgan' : mt.rejim === 'qolda' ? 'o‘zingiz tanlagan' : 'tezkor'}</p>
        {mt.ogohlantirish && <p className="dv-ogoh">{mt.ogohlantirish}</p>}
        {mt.mazmun_manbasi === 'qolda' && <p className="dv-help"><Check size={14} /> Dars mazmuni qo‘lda yozilgan va tekshirilgan manbadan.</p>}
        {!mt.masalliq_bor && <p className="dv-help">Mavzu uchun tayyor masalliq yo‘q — materiallar mavzu matnidan olindi. To‘liqroq bo‘lishi uchun «AI yozsin» rejimini sinab ko‘ring.</p>}
      </div>
    </div>
    {tanlov === 'titul' && <RasmTanla so={so} rasmUrl={rasmUrl} joriy={mt.rasm} sorov={mt.mavzu} fan={mt.fan}
      onTanla={k => { titulRasm(k); setTanlov(null); }} onYop={() => setTanlov(null)} />}
    <div className="dv-row">
      <button type="button" className="dv-primary" disabled={!!busy} onClick={() => yukla('docx')}>{busy === 'docx' ? <LoaderCircle className="dv-spin" size={16} /> : <FileText size={16} />}Word ishlanma</button>
      <button type="button" className="dv-primary" disabled={!!busy} onClick={() => yukla('pptx')}>{busy === 'pptx' ? <LoaderCircle className="dv-spin" size={16} /> : <Download size={16} />}Taqdimot (PPTX)</button>
      <button type="button" disabled={!!busy} onClick={boshqaVariant}>{busy === 'tuz' ? <LoaderCircle className="dv-spin" size={16} /> : <Shuffle size={16} />}Boshqa variant</button>
      <button type="button" onClick={orqaga}>Sozlamalarga qaytish</button>
    </div>

    {dars.metodik_maqsad && <p><b>Metodik maqsad:</b> {dars.metodik_maqsad}</p>}
    <div className="dv-ochiq-maqsad">
      <p><b>Ta’limiy:</b> {dars.maqsadlar.talimiy}</p>
      <p><b>Tarbiyaviy:</b> {dars.maqsadlar.tarbiyaviy}</p>
      <p><b>Rivojlantiruvchi:</b> {dars.maqsadlar.rivojlantiruvchi}</p>
    </div>

    <div className="dv-form">
      <label><span>Guruhlarga bo‘lish</span>
        <select value={dars.guruhlash.kod || ''} disabled={!!busy} onChange={e => guruhAlmashtir('guruhlash', e.target.value)}>
          {dars.guruhlash.nomzodlar.map(n => <option key={n.kod} value={n.kod}>{n.nom}</option>)}</select></label>
      <label><span>Guruhlarni birlashtirish</span>
        <select value={dars.birlashtirish.kod || ''} disabled={!!busy} onChange={e => guruhAlmashtir('birlashtirish', e.target.value)}>
          {dars.birlashtirish.nomzodlar.map(n => <option key={n.kod} value={n.kod}>{n.nom}</option>)}</select></label>
      <div className="dv-wide dv-ochiq-guruhlar">{dars.guruhlash.guruhlar.map(g => <span key={g.nom}>{g.rasm && <img src={rasmUrl(g.rasm)} alt="" />}{g.nom}</span>)}</div>
    </div>

    <ol className="dv-ochiq-bosqichlar">
      {dars.bosqichlar.map((b, i) => <li key={i}>
        <div className="dv-ochiq-bosqich-bosh"><b>{i + 1}. {b.nom}</b><span>{b.daq} daq.</span></div>
        {b.metod?.tur === 'metod' && b.nomzodlar.length > 0
          ? <label className="dv-ochiq-metod"><span>Metod</span>
            <select value={b.metod.kod} disabled={!!busy} onChange={e => metodAlmashtir(i, e.target.value)}>
              {b.nomzodlar.map(n => <option key={n.kod} value={n.kod}>{n.nom} · {n.vaqt[0]}–{n.vaqt[1]} daq.</option>)}</select></label>
          : b.metod && <p className="dv-help"><b>{b.metod.nom}</b></p>}
        {b.metod?.qadamlar?.length > 0 && <p className="dv-help">{b.metod.qadamlar.join('; ')}</p>}
        {b.nutq && <p className="dv-ochiq-nutq">«{b.nutq}»</p>}
        <p className="dv-help">{b.oquvchi}{b.material?.tur && b.material.tur !== 'yoq' ? ` · material: ${MATERIAL_NOM[b.material.tur] || b.material.tur}` : ''}
          {b.ilova_raqam?.length ? ` · ${b.ilova_raqam.map(n => `${n}-ilova`).join(', ')}` : ''}</p>
        <div className="dv-ochiq-bosqich-rasm">
          {b.rasm && <img className="dv-ochiq-rasm" src={rasmUrl(b.rasm)} alt="" />}
          <button type="button" className="dv-rasm-tugma" onClick={() => setTanlov(tanlov === i ? null : i)}>
            <ImagePlus size={14} />{b.rasm ? 'Rasmni almashtirish' : 'Rasm qo‘shish'}</button>
        </div>
        {tanlov === i && <RasmTanla so={so} rasmUrl={rasmUrl} joriy={b.rasm} sorov={mt.mavzu} fan={mt.fan}
          onTanla={k => { bosqichRasm(i, k); setTanlov(null); }} onYop={() => setTanlov(null)} />}
      </li>)}
    </ol>

    <h4><BookOpen size={16} /> Ilovalar (Word ishlanmada)</h4>
    <ul className="dv-ochiq-ilovalar">{dars.ilovalar.map(il => <li key={il.raqam}>{il.raqam}-ilova. {il.nom}</li>)}</ul>
  </section>;
}
