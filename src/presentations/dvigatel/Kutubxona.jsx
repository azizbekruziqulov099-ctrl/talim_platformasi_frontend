/* Tayyor mavzular: 1–11-sinf, bakalavr va magistratura mavzulari (AI oldindan yozgan miyalar),
   dars rejasi ko'rinishi va administrator uchun «Kutubxonani to'ldirish» paneli. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, CircleAlert, ClipboardList, Copy, FileUp, LoaderCircle, Pause, Play, RefreshCw, RotateCcw, Search, Sparkles, X } from 'lucide-react';

const DARAJA_NOM = { maktab: 'Maktab', bakalavr: 'Bakalavr', magistr: 'Magistratura' };
const HOLAT_NOM = { kutmoqda: 'navbatda', yozilmoqda: 'yozilmoqda', tayyor: 'tayyor', xato: 'xato', otkazildi: 'o‘tkazilgan' };
const TARTIBLAR = [['maktab', 'Avval maktab'], ['otm', 'Avval OTM'], ['sinf', 'Sinf tartibida']];

export function sinfNomi(daraja, sinf) {
  if (!sinf) return daraja === 'maktab' ? 'Umumiy' : 'Barcha kurslar';
  return daraja === 'maktab' && !/sinf/.test(sinf) ? `${sinf}-sinf` : sinf;
}
const sinfSon = s => { const m = /\d+/.exec(s || ''); return m ? +m[0] : 99; };
const sinfSort = (a, b) => sinfSon(a) - sinfSon(b) || a.length - b.length || a.localeCompare(b);

// ---------------------------------------------------------------- foydalanuvchi: sinf → fan → mavzu
export function AiKutubxona({ so, admin, tanlanganId, onOch, xatoQoy }) {
  const [daraxt, setDaraxt] = useState(null);
  const [daraja, setDaraja] = useState('maktab');
  const [sinf, setSinf] = useState('');
  const [fan, setFan] = useState('');
  const [q, setQ] = useState('');
  const [mavzular, setMavzular] = useState(null);
  const [hammasi, setHammasi] = useState(false);
  const [band, setBand] = useState('');
  const [xabar, setXabar] = useState('');

  const daraxtYukla = () => so(`/kutubxona-ai?limit=0${admin && hammasi ? '&hammasi=1' : ''}`).then(d => setDaraxt(d.daraxt || [])).catch(e => { setDaraxt([]); xatoQoy(e.message); });
  useEffect(() => { daraxtYukla(); }, [hammasi]); // eslint-disable-line react-hooks/exhaustive-deps

  // oddiy foydalanuvchiga faqat tayyori bor guruhlar; admin «hammasi» bilan — barchasi
  const korinadi = useMemo(() => (daraxt || []).filter(g => (admin && hammasi) || g.tayyor > 0), [daraxt, admin, hammasi]);
  const darajalar = useMemo(() => Object.keys(DARAJA_NOM).map(d => [d, korinadi.filter(g => g.daraja === d)]).filter(([, g]) => g.length), [korinadi]);
  const sinflar = useMemo(() => [...new Set(korinadi.filter(g => g.daraja === daraja).map(g => g.sinf))].sort(sinfSort), [korinadi, daraja]);
  const fanlar = useMemo(() => korinadi.filter(g => g.daraja === daraja && g.sinf === sinf).sort((a, b) => a.fan.localeCompare(b.fan)), [korinadi, daraja, sinf]);
  const jamiReestr = (daraxt || []).reduce((n, g) => n + g.jami, 0);
  const jamiTayyor = (daraxt || []).reduce((n, g) => n + g.tayyor, 0);

  // tanlov o'zgarsa — keyingi pog'onaning birinchisini avtomatik tanlaymiz
  useEffect(() => { if (darajalar.length && !darajalar.some(([d]) => d === daraja)) setDaraja(darajalar[0][0]); }, [darajalar]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!sinflar.includes(sinf)) setSinf(sinflar[0] ?? ''); }, [sinflar]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!fanlar.some(f => f.fan === fan)) setFan(fanlar[0]?.fan ?? ''); }, [fanlar]); // eslint-disable-line react-hooks/exhaustive-deps

  const qidiruv = q.trim().length >= 2;
  function mavzuYukla() {
    if (!qidiruv && !fan) { setMavzular([]); return; }
    const p = new URLSearchParams(qidiruv ? { q: q.trim() } : { daraja, sinf, fan });
    if (admin && hammasi) p.set('hammasi', '1');
    setMavzular(null);
    so(`/kutubxona-ai?${p}`).then(d => setMavzular(d.mavzular || [])).catch(e => { setMavzular([]); xatoQoy(e.message); });
  }
  useEffect(() => {
    const t = setTimeout(mavzuYukla, qidiruv ? 350 : 0);
    return () => clearTimeout(t);
  }, [daraja, sinf, fan, q, hammasi]); // eslint-disable-line react-hooks/exhaustive-deps

  async function och(m) {
    setBand('och:' + m.id);
    try { await onOch(m); } finally { setBand(''); }
  }

  async function sinov(m) {
    setBand('sinov:' + m.id);
    try {
      await so('/admin/kutubxona/sinov', { method: 'POST', json: { id: m.id } });
      setXabar(`«${m.mavzu}» yozilmoqda — 2–4 daqiqadan so‘ng «Yangilash»ni bosing.`);
      setMavzular(ms => ms.map(x => x.id === m.id ? { ...x, holat: 'yozilmoqda' } : x));
    } catch (e) { xatoQoy(e.message); } finally { setBand(''); }
  }

  if (!daraxt) return <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>;

  return <div className="dv-kai">
    <div className="dv-row dv-spread">
      <p className="dv-help" style={{ margin: 0 }}><b>Sinflar va kurslar bo‘yicha mavzular</b> · {jamiTayyor.toLocaleString('uz')} ta tayyor{jamiReestr > jamiTayyor ? ` · ${(jamiReestr - jamiTayyor).toLocaleString('uz')} tasi yozilish navbatida` : ''}</p>
      <div className="dv-row" style={{ margin: 0 }}>
        {admin && <label className="dv-kai-check"><input type="checkbox" checked={hammasi} onChange={e => setHammasi(e.target.checked)} />Yozilmaganlarini ham ko‘rsat (admin)</label>}
        <button type="button" onClick={() => { daraxtYukla(); mavzuYukla(); }}><RefreshCw size={15} />Yangilash</button>
      </div>
    </div>
    {xabar && <div className="dv-xabar" role="status">{xabar}</div>}
    {!korinadi.length && <div className="dv-bosh"><p>{jamiReestr
      ? <>Mavzular ro‘yxati tayyor ({jamiReestr.toLocaleString('uz')} ta mavzu). AI ularni asta-sekin yozmoqda — tayyor bo‘lganlari shu yerda paydo bo‘ladi.</>
      : <>Hozircha tayyor mavzular yo‘q.</>}</p></div>}

    {korinadi.length > 0 && <>
      <label className="dv-kai-qidir"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Mavzu nomi bo‘yicha qidirish (barcha sinflarda)" aria-label="Mavzu qidirish" />
        {q && <button type="button" onClick={() => setQ('')} aria-label="Tozalash"><X size={15} /></button>}</label>
      {!qidiruv && <>
        <div className="dv-row dv-chips" aria-label="Ta’lim bosqichi">
          {darajalar.map(([d, g]) => <button type="button" key={d} className={daraja === d ? 'is-active' : ''} aria-pressed={daraja === d} onClick={() => setDaraja(d)}>
            {DARAJA_NOM[d]} <small>{g.reduce((n, x) => n + x.tayyor, 0)}</small></button>)}
        </div>
        <div className="dv-row dv-chips" aria-label="Sinf yoki kurs">
          {sinflar.map(s => <button type="button" key={s} className={sinf === s ? 'is-active' : ''} aria-pressed={sinf === s} onClick={() => setSinf(s)}>{sinfNomi(daraja, s)}</button>)}
        </div>
        <div className="dv-row dv-chips dv-kai-fanlar" aria-label="Fan">
          {fanlar.map(f => <button type="button" key={f.fan} className={fan === f.fan ? 'is-active' : ''} aria-pressed={fan === f.fan} onClick={() => setFan(f.fan)}>
            {f.fan} <small>{admin && hammasi ? `${f.tayyor}/${f.jami}` : f.tayyor}</small></button>)}
        </div>
      </>}

      {!mavzular && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Mavzular yuklanmoqda…</p>}
      {mavzular && !mavzular.length && <p className="dv-help">{qidiruv ? 'Bu so‘z bo‘yicha tayyor mavzu topilmadi.' : 'Bu fanda hali tayyor mavzu yo‘q.'}</p>}
      {mavzular && mavzular.length > 0 && <div className="dv-mavzular">
        {mavzular.map(m => {
          const tayyor = m.holat === 'tayyor';
          return <div key={m.id} className={`dv-mavzu${tanlanganId === m.id ? ' is-active' : ''}`}>
            <button type="button" className="dv-mavzu-btn" onClick={() => och(m)} disabled={!tayyor || band === 'och:' + m.id}>
              <span className={`dv-mavzu-kod${tayyor ? '' : ` dv-holat-${m.holat}`}`}>{m.raqam || '•'}</span>
              <span className="dv-mavzu-nom">{m.mavzu}</span>
              <span className="dv-mavzu-info">{qidiruv ? `${DARAJA_NOM[m.daraja] || m.daraja} · ${sinfNomi(m.daraja, m.sinf)} · ${m.fan}` : (m.bob || m.fan)}
                {tayyor ? ` · ${m.slaydlar} mazmun slaydi${m.dars_rejasi ? ' · dars rejasi bor' : ''}` : ` · ${HOLAT_NOM[m.holat] || m.holat}`}</span>
              {band === 'och:' + m.id && <LoaderCircle className="dv-spin" size={15} />}
            </button>
            {admin && !tayyor && m.holat !== 'yozilmoqda' && <div className="dv-row dv-mavzu-hujjat">
              <button type="button" onClick={() => sinov(m)} disabled={band === 'sinov:' + m.id}>{band === 'sinov:' + m.id ? <LoaderCircle className="dv-spin" size={15} /> : <Sparkles size={15} />}Hozir yozdirib ko‘rish</button>
            </div>}
          </div>;
        })}
      </div>}
    </>}
  </div>;
}

// ---------------------------------------------------------------- dars rejasi (ochiq dars uchun asos)
export function darsMatni(d, mavzu) {
  const q = [`DARS REJASI: ${mavzu || ''}`];
  if (d.turi || d.davomiylik) q.push(`Dars turi: ${d.turi || '—'}${d.davomiylik ? ` · ${d.davomiylik} daqiqa` : ''}`);
  const mq = d.maqsadlar || {};
  [['Ta’limiy maqsad', mq.talimiy], ['Tarbiyaviy maqsad', mq.tarbiyaviy], ['Rivojlantiruvchi maqsad', mq.rivojlantiruvchi]].forEach(([n, v]) => v && q.push(`${n}: ${v}`));
  if (d.kompetensiyalar?.length) q.push(`Kompetensiyalar: ${d.kompetensiyalar.join('; ')}`);
  if (d.natijalar?.length) q.push('Kutilgan natijalar:\n' + d.natijalar.map(x => `  – ${x}`).join('\n'));
  if (d.metodlar?.length) q.push('Metodlar:\n' + d.metodlar.map(m => `  – ${m.nom}${m.bosqich ? ` (${m.bosqich})` : ''}${m.izoh ? `: ${m.izoh}` : ''}`).join('\n'));
  if (d.jihozlar?.length) q.push(`Jihozlar: ${d.jihozlar.join(', ')}`);
  if (d.bosqichlar?.length) q.push('Dars bosqichlari:\n' + d.bosqichlar.map((b, i) => `  ${i + 1}. ${b.nom}${b.vaqt ? ` — ${b.vaqt} daq.` : ''}${b.metod ? ` [${b.metod}]` : ''}\n     O‘qituvchi: ${b.oqituvchi || '—'}\n     O‘quvchi: ${b.oquvchi || '—'}`).join('\n'));
  if (d.fanlararo?.length) q.push(`Fanlararo bog‘liqlik: ${d.fanlararo.join('; ')}`);
  if (d.baholash) q.push(`Baholash: ${d.baholash}`);
  if (d.uy_vazifasi) q.push(`Uy vazifasi: ${d.uy_vazifasi}`);
  return q.join('\n');
}

export function DarsRejasi({ dars, mavzu }) {
  const [nusxa, setNusxa] = useState(false);
  if (!dars?.bosqichlar?.length) return null;
  const mq = dars.maqsadlar || {};
  return <details className="dv-dars">
    <summary><ClipboardList size={16} /> Dars rejasi (o‘qituvchi uchun{dars.davomiylik ? ` · ${dars.davomiylik} daqiqa` : ''}) — slaydlarda chiqmaydi</summary>
    <div className="dv-dars-ich">
      <div className="dv-row"><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(darsMatni(dars, mavzu)); setNusxa(true); setTimeout(() => setNusxa(false), 2500); } catch { /* nusxa ishlamadi */ } }}>
        {nusxa ? <Check size={15} /> : <Copy size={15} />}{nusxa ? 'Nusxalandi' : 'Matnni nusxalash'}</button>
        {dars.turi && <span className="dv-help" style={{ margin: 0 }}>Dars turi: <b>{dars.turi}</b></span>}</div>
      {(mq.talimiy || mq.tarbiyaviy || mq.rivojlantiruvchi) && <ul className="dv-dars-maqsad">
        {mq.talimiy && <li><b>Ta’limiy:</b> {mq.talimiy}</li>}
        {mq.tarbiyaviy && <li><b>Tarbiyaviy:</b> {mq.tarbiyaviy}</li>}
        {mq.rivojlantiruvchi && <li><b>Rivojlantiruvchi:</b> {mq.rivojlantiruvchi}</li>}
      </ul>}
      {dars.metodlar?.length > 0 && <p><b>Metodlar:</b> {dars.metodlar.map(m => m.nom).join(', ')}</p>}
      {dars.jihozlar?.length > 0 && <p><b>Jihozlar:</b> {dars.jihozlar.join(', ')}</p>}
      <div className="dv-dars-jadval" role="table" aria-label="Dars bosqichlari">
        <div role="row" className="dv-dars-bosh"><span role="columnheader">Bosqich</span><span role="columnheader">Vaqt</span><span role="columnheader">O‘qituvchi</span><span role="columnheader">O‘quvchi</span></div>
        {dars.bosqichlar.map((b, i) => <div role="row" key={i}>
          <span role="cell"><b>{b.nom}</b>{b.metod && <small>{b.metod}</small>}</span><span role="cell">{b.vaqt ? `${b.vaqt} daq.` : '—'}</span>
          <span role="cell">{b.oqituvchi || '—'}</span><span role="cell">{b.oquvchi || '—'}</span></div>)}
      </div>
      {dars.baholash && <p><b>Baholash:</b> {dars.baholash}</p>}
      {dars.uy_vazifasi && <p><b>Uy vazifasi:</b> {dars.uy_vazifasi}</p>}
    </div>
  </details>;
}

// ---------------------------------------------------------------- administrator: kutubxonani to'ldirish
export function KutubxonaAdmin({ so }) {
  const [h, setH] = useState(null);
  const [xato, setXato] = useState('');
  const [xabar, setXabar] = useState('');
  const [band, setBand] = useState('');
  const [z, setZ] = useState(null);           // tahrirlanayotgan sozlama
  const [dastur, setDastur] = useState({ daraja: 'bakalavr', sinf: '', fan: '', yonalish: '' });
  const [natija, setNatija] = useState(null);
  const faylRef = useRef(null);

  const yukla = () => so('/admin/kutubxona').then(d => { setH(d); setZ(o => o || d.sozlama); setXato(''); }).catch(e => setXato(e.message));
  useEffect(() => {
    yukla();
    const t = setInterval(() => { if (document.visibilityState === 'visible') yukla(); }, 15000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function saqla(qism) {
    setBand('soz');
    try {
      const yangi = await so('/admin/kutubxona/sozlama', { method: 'POST', json: { ...z, ...qism } });
      setZ(yangi);
      setXabar(qism && 'yoqilgan' in qism ? (yangi.yoqilgan ? 'Yozish boshlandi. Kunlik chegaraga yetganda o‘zi to‘xtaydi.' : 'Yozish to‘xtatildi.') : 'Sozlamalar saqlandi.');
      yukla();
    } catch (e) { setXato(e.message); } finally { setBand(''); }
  }

  async function amal(nom, body, matn) {
    setBand(nom);
    try { const r = await so(`/admin/kutubxona/${nom}`, { method: 'POST', json: body }); setXabar(matn(r)); yukla(); }
    catch (e) { setXato(e.message); } finally { setBand(''); }
  }

  async function dasturYukla(f) {
    if (!f) return;
    if (dastur.fan.trim().length < 2) { setXato('Avval fan nomini yozing.'); return; }
    setBand('dastur'); setNatija(null);
    try {
      const sarlavha = { 'X-Fayl-Nomi': encodeURIComponent(f.name) };
      Object.entries(dastur).forEach(([k, v]) => { sarlavha[`X-${k[0].toUpperCase()}${k.slice(1)}`] = encodeURIComponent(v.trim()); });
      const r = await so('/admin/kutubxona/dastur', { method: 'POST', raw: await f.arrayBuffer(), headers: sarlavha, timeout: 240000 });
      setNatija(r); yukla();
    } catch (e) { setXato(e.message); } finally { setBand(''); }
  }

  if (!h) return <div className="dv-kadmin">{xato ? <div className="dv-xato"><CircleAlert size={16} /> {xato}</div> : <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}</div>;
  const j = h.jami || {};
  const yoqilgan = !!h.sozlama?.yoqilgan;
  const yg = h.yigish;
  const yigilmoqda = yg?.holat === 'ishlamoqda';

  return <div className="dv-kadmin">
    <div className="dv-row dv-spread"><h4><BookOpen size={17} /> Kutubxonani to‘ldirish (administrator)</h4>
      <button type="button" onClick={yukla}><RefreshCw size={15} />Yangilash</button></div>
    <p className="dv-help">AI har bir mavzu uchun bir nechta so‘rov yuboradi — bu AI hisobidan pul sarflaydi. <b>«Boshlash»</b> bosilmaguncha hech narsa yozilmaydi; kuniga belgilangan sondan ortiq yozilmaydi.
      Har bir mavzu miyasiga dars rejasi ham yoziladi (maqsadlar, metodlar, bosqichlar) — keyin ochiq dars qismi shundan foydalanadi.</p>
    {xato && <div className="dv-xato" role="alert"><CircleAlert size={16} /> {xato}</div>}
    {xabar && <div className="dv-xabar" role="status">{xabar}</div>}
    {h.ai === false && <div className="dv-xato">AI kaliti serverda sozlanmagan — yozuvchi ishlamaydi.</div>}

    <div className="dv-kadmin-son">
      {[['kutmoqda', 'Navbatda'], ['yozilmoqda', 'Yozilmoqda'], ['tayyor', 'Tayyor'], ['xato', 'Xato'], ['otkazildi', 'O‘tkazilgan']].map(([k, n]) =>
        <div key={k} className={`dv-kadmin-karta dv-holat-${k}`}><b>{(j[k] || 0).toLocaleString('uz')}</b><span>{n}</span></div>)}
      <div className="dv-kadmin-karta"><b>{h.sarf ?? h.bugun} / {h.sozlama?.kunlik}</b><span>Oxirgi 24 soat</span></div>
      {h.dars_mazmuni && <div className="dv-kadmin-karta" title="Ochiq dars uchun darsning o‘zi: bayon, yechimli misollar, guruh topshiriqlari, loyiha, ekskursiya. Navbat bo‘shaganda tayyor mavzularga yoziladi.">
        <b>{(h.dars_mazmuni.tayyor || 0).toLocaleString('uz')} / {Object.values(h.dars_mazmuni).reduce((a, b) => a + b, 0).toLocaleString('uz')}</b><span>Dars mazmuni</span></div>}
    </div>

    <div className="dv-row">
      <button type="button" className="dv-primary" disabled={band === 'soz' || h.ai === false} onClick={() => saqla({ yoqilgan: !yoqilgan })}>
        {band === 'soz' ? <LoaderCircle className="dv-spin" size={16} /> : yoqilgan ? <Pause size={16} /> : <Play size={16} />}{yoqilgan ? 'To‘xtatish' : 'Boshlash'}</button>
      <span className="dv-help" style={{ margin: 0 }}>{yoqilgan ? 'Yozuvchi ishlayapti.' : 'Yozuvchi to‘xtagan.'}</span>
    </div>
    {h.hozir?.length > 0 && <p className="dv-help"><LoaderCircle className="dv-spin" size={14} /> Hozir: {h.hozir.map(x => `${x.mavzu} (${sinfNomi(x.daraja, x.sinf)}, ${x.fan})`).join('; ')}</p>}

    {z && <div className="dv-kadmin-soz">
      <label>Kuniga nechta mavzu<input type="number" min={0} max={5000} value={z.kunlik} onChange={e => setZ({ ...z, kunlik: e.target.value })} /></label>
      <div><span className="dv-label">Tartib</span>
        <div className="dv-row dv-chips">{TARTIBLAR.map(([k, n]) => <button type="button" key={k} className={z.tartib === k ? 'is-active' : ''} onClick={() => setZ({ ...z, tartib: k })}>{n}</button>)}</div></div>
      <div><span className="dv-label">Faqat shu bosqichlar (hech biri tanlanmasa — hammasi)</span>
        <div className="dv-row dv-chips">{Object.entries(DARAJA_NOM).map(([k, n]) => {
          const bor = (z.daraja || []).includes(k);
          return <button type="button" key={k} className={bor ? 'is-active' : ''} aria-pressed={bor} onClick={() => setZ({ ...z, daraja: bor ? z.daraja.filter(x => x !== k) : [...(z.daraja || []), k] })}>{n}</button>;
        })}</div></div>
      <button type="button" onClick={() => saqla()} disabled={band === 'soz'}><Check size={15} />Sozlamalarni saqlash</button>
    </div>}

    <fieldset className="dv-bolak"><legend>Darsliklar mundarijasi (infoedu.uz)</legend>
      <p className="dv-help">Server 1–11-sinf darsliklari sahifalarini birma-bir ochib, mavzular ro‘yxatini oladi. Aniq mundarija kelgan fanlarda taxminiy mavzular o‘rnini bosadi. Bu AI pulini sarflamaydi (faqat mundarija o‘qilmasa — qisqa so‘rov).</p>
      <div className="dv-row"><button type="button" disabled={yigilmoqda || band === 'yigish'} onClick={() => amal('yigish', {}, r => r.holat === 'ishlamoqda' ? 'Yig‘ish allaqachon ishlayapti.' : 'Yig‘ish boshlandi — har bir sahifa orasida qisqa tanaffus bilan.')}>
        {yigilmoqda || band === 'yigish' ? <LoaderCircle className="dv-spin" size={15} /> : <Play size={15} />}Mundarijalarni yig‘ish</button>
        {yg && <span className="dv-help" style={{ margin: 0 }}>{yigilmoqda ? `Ishlayapti${yg.joriy ? ` (${yg.joriy})` : ''}` : yg.holat === 'tugadi' ? 'Oxirgi yig‘ish tugagan' : 'Oxirgi yig‘ish xato bilan tugagan'}: {yg.sahifalar} sahifa, {yg.mavzular} mavzu, {yg.qoshildi} tasi yangi.</span>}</div>
      {yg?.bosh?.length > 0 && <p className="dv-help">Mavzusi topilmagan: {yg.bosh.slice(0, 12).join(', ')}{yg.bosh.length > 12 ? '…' : ''}</p>}
      {yg?.xatolar?.length > 0 && <p className="dv-help">Xatolar: {yg.xatolar.slice(0, 5).join('; ')}</p>}
    </fieldset>

    <fieldset className="dv-bolak"><legend>Fan dasturini yuklash (bakalavr, magistratura yoki maktab)</legend>
      <p className="dv-help">Fan dasturi yoki sillabus faylini (Excel, Word, PDF, matn) yuklang — mavzular ro‘yxatga qo‘shiladi va yozish navbatiga turadi.</p>
      <div className="dv-form">
        <label>Bosqich<select value={dastur.daraja} onChange={e => setDastur({ ...dastur, daraja: e.target.value })}>{Object.entries(DARAJA_NOM).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>{dastur.daraja === 'maktab' ? 'Sinf' : 'Kurs'}<input value={dastur.sinf} onChange={e => setDastur({ ...dastur, sinf: e.target.value })} placeholder={dastur.daraja === 'maktab' ? '7' : '2-kurs'} /></label>
        <label>Fan <em>*</em><input value={dastur.fan} onChange={e => setDastur({ ...dastur, fan: e.target.value })} placeholder="Boshlang‘ich matematika kursi nazariyasi" /></label>
        <label>Yo‘nalish<input value={dastur.yonalish} onChange={e => setDastur({ ...dastur, yonalish: e.target.value })} placeholder="Boshlang‘ich ta’lim" /></label>
        <button type="button" className="dv-primary" disabled={band === 'dastur'} onClick={() => faylRef.current?.click()}>
          {band === 'dastur' ? <LoaderCircle className="dv-spin" size={16} /> : <FileUp size={16} />}Fayl tanlash va yuklash</button>
        <input ref={faylRef} type="file" hidden accept=".xlsx,.docx,.pdf,.csv,.txt" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; dasturYukla(f); }} />
      </div>
      {natija && <p className="dv-ok"><Check size={15} /> {natija.topildi} ta mavzu topildi ({natija.usul === 'AI' ? 'AI ajratdi' : natija.usul === 'jadval' ? 'jadvaldan' : 'raqamli qatorlardan'}), {natija.qoshildi} tasi yangi qo‘shildi{natija.namuna?.length ? `: ${natija.namuna.slice(0, 4).join('; ')}…` : '.'}</p>}
    </fieldset>

    {h.xatolar?.length > 0 && <fieldset className="dv-bolak"><legend>Xato bilan tugaganlar ({j.xato})</legend>
      <ul className="dv-kadmin-xato">{h.xatolar.slice(0, 8).map(x => <li key={x.id}><b>{x.mavzu}</b> · {sinfNomi(x.daraja, x.sinf)}, {x.fan} — <small>{x.xato}</small></li>)}</ul>
      <button type="button" disabled={band === 'navbat'} onClick={() => amal('navbat', { amal: 'xatolarni' }, r => `${r.ozgardi} ta mavzu qayta navbatga qo‘yildi.`)}><RotateCcw size={15} />Hammasini qayta navbatga</button>
    </fieldset>}

    <details className="dv-kadmin-fanlar"><summary>Fanlar bo‘yicha holat ({h.fanlar?.length || 0} ta guruh)</summary>
      <div className="dv-kadmin-jadval" role="table">
        <div role="row" className="dv-dars-bosh"><span>Bosqich, sinf</span><span>Fan</span><span>Tayyor</span><span>Navbatda</span><span>Xato</span><span>O‘tkazilgan</span><span /></div>
        {(h.fanlar || []).map(f => {
          const k = `${f.daraja}|${f.sinf}|${f.fan}`;
          const faol = f.kutmoqda + f.xato > 0;
          return <div role="row" key={k}>
            <span>{DARAJA_NOM[f.daraja] || f.daraja}, {sinfNomi(f.daraja, f.sinf)}</span><span>{f.fan}</span><span>{f.tayyor}</span><span>{f.kutmoqda}</span><span>{f.xato}</span><span>{f.otkazildi}</span>
            <span>{faol
              ? <button type="button" disabled={band === 'navbat'} onClick={() => amal('navbat', { amal: 'otkaz', daraja: f.daraja, sinf: f.sinf, fan: f.fan }, r => `${r.ozgardi} ta mavzu o‘tkazib yuborildi.`)}>O‘tkazish</button>
              : f.otkazildi > 0 ? <button type="button" disabled={band === 'navbat'} onClick={() => amal('navbat', { amal: 'yoq', daraja: f.daraja, sinf: f.sinf, fan: f.fan }, r => `${r.ozgardi} ta mavzu navbatga qaytarildi.`)}>Qaytarish</button> : null}</span>
          </div>;
        })}
      </div>
    </details>
    {h.manbalar?.length > 0 && <p className="dv-help">Manbalar: {h.manbalar.map(m => `${m.manba} — ${m.n}`).join(' · ')}</p>}
  </div>;
}
