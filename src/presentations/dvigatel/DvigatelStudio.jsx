import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, CircleAlert, Copy, Download, Eye, FileSpreadsheet, FileText, Film, FolderOpen, LayoutTemplate, Library, Lightbulb, ListChecks, ListTree, LoaderCircle, Palette, Plus, RefreshCw, RotateCcw, Save, Shuffle, SlidersHorizontal, Sparkles, Trash2, Type, Upload, Users, Wand2, X } from 'lucide-react';
import SahnaPlayer from './SahnaPlayer.jsx';
import { dvSorov, yuklabOl } from './api.js';
import { AiKutubxona, DarsRejasi, KutubxonaAdmin } from './Kutubxona.jsx';
import './dvigatel.css';

const OchiqDars = React.lazy(() => import('./OchiqDars.jsx'));

/* Taqdimot tayyorlash — 4 qadam: 1) mazmun (AI / tayyor mavzu / fayl / saqlanganlar) → 2) reja (ixtiyoriy)
 * → 3) dizayn (uslub, rang, shrift, ramka, animatsiya, qismlar — jonli ko'rinish bilan) → 4) ko'rish, saqlash, PPTX.
 * Dizayn, chizmalar va animatsiyani serverdagi dvigatel qiladi; bu oyna faqat boshqaradi. */

const DARAJALAR = [['maktab', 'Maktab'], ['bakalavr', 'Bakalavr'], ['magistr', 'Magistr'], ['bogcha', 'Bog‘cha']];
const TURLAR = [['dars', 'Dars'], ['ma’ruza', 'Ma’ruza'], ['amaliy', 'Amaliy'], ['seminar', 'Seminar']];
// Yoshga mos tavsiya (server ai.YOSH_TAVSIYA bilan bir xil): 1-sinf va 11-sinf yoki magistr uchun bir xil «yupqa» taqdimot bo'lmasin
const YOSH_TAVSIYA = { bogcha: ['qisqa', 8], '1-2': ['qisqa', 10], '3-4': ['orta', 12], '5-6': ['orta', 14], '7-9': ['batafsil', 16], '10-11': ['batafsil', 18], 'b1-2': ['toliq', 20], 'b3-4': ['toliq', 22], m: ['toliq', 24] };
function yoshBand(daraja, sinf) {
  const sm = String(sinf || '').toLowerCase();
  const n = Number((sm.match(/\d+/) || [0])[0]);
  if (daraja === 'magistr' || sm.includes('magistr')) return 'm';
  if (daraja === 'bakalavr' || sm.includes('kurs')) return n >= 3 ? 'b3-4' : 'b1-2';
  if (daraja === 'bogcha' || sm.includes('bog')) return 'bogcha';
  if (!n) return '';
  return n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : n <= 9 ? '7-9' : '10-11';
}
const HAJMLAR = [['qisqa', 'Qisqa', '20–40 so‘z', '1–2 jumla yoki 3–4 punkt'], ['orta', 'O‘rta', '40–70 so‘z', '2–3 jumla yoki 4–5 punkt'],
  ['batafsil', 'Batafsil', '70–110 so‘z', '3–4 jumla, har tushunchaga misol'], ['toliq', 'To‘liq', '110–160 so‘z', 'ta’rif + izoh + misol, slayd to‘la']];
const MISOLLAR = [['kam', 'Kam'], ['orta', 'O‘rta'], ['kop', 'Ko‘p']];
const TEST_SONI = [['', 'Avto'], ['0', 'Yo‘q'], ['5', '5 ta'], ['10', '10 ta'], ['15', '15 ta'], ['20', '20 ta']];
const QADAMLAR = [['Mazmun', 'Mavzu va manba'], ['Reja', 'Bo‘lim va slaydlar (ixtiyoriy)'], ['Dizayn', 'Uslub, rang, shrift, animatsiya'], ['Tayyor', 'Ko‘rish, saqlash, yuklab olish']];
const MANBALAR = [['ai', Sparkles, 'AI yozsin', 'Mavzuni yozasiz — AI darsni o‘zi tuzadi'], ['tayyor', Library, 'Tayyor mavzular', '1–11-sinf, bakalavr va magistratura mavzulari'],
  ['fayl', FileSpreadsheet, 'Fayldan', 'Excel shablon yoki ChatGPT JSON'], ['mening', FolderOpen, 'Mening taqdimotlarim', 'Saqlanganlar va AI yozganlar'], ['namuna', Eye, 'Namuna', 'Qanday ishlashini ko‘rish']];
const GURUH_BELGI = { 'Ranglar va fon': Palette, Shrift: Type, Sahifa: LayoutTemplate, Animatsiya: Film, 'Qaysi qismlar bo‘lsin': ListChecks };
const TILLAR = [['uz', 'O‘zbek'], ['ru', 'Rus'], ['en', 'Ingliz']];
const OHANGLAR = [['', 'Avto'], ['ilmiy', 'Ilmiy'], ['oddiy', 'Oddiy'], ['oyinli', 'O‘yinli']];
const yangiUrug = () => 1 + Math.floor(Math.random() * 2147483000);
const TUR_NOM = { ai: 'AI', reja: 'Reja', saqlangan: 'Saqlangan' };
const TIL_NOMI = { uz: 'o‘zbek', ru: 'rus', en: 'ingliz' };
function sana(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso.slice(0, 16); }
}
function holatMatn(t) {
  if (t.holat === 'tayyor') return t.tur === 'reja' ? `reja · ${t.slaydlar} slayd` : `${t.slaydlar} slayd`;
  if (t.holat === 'navbatda' || t.holat === 'yozilmoqda') return 'AI yozmoqda…';
  if (t.holat === 'uzildi') return 'to‘xtab qolgan';
  return 'xato bilan tugagan';
}

export default function DvigatelStudio({ apiBase = '', token, onClose, bolim = 'taqdimot' }) {
  const [info, setInfo] = useState(null);
  const [tab, setTab] = useState('ai');
  const [royxat, setRoyxat] = useState(null);
  const [joriyIsh, setJoriyIsh] = useState(null);
  const [ochirTasdiq, setOchirTasdiq] = useState('');
  const [saqlandi, setSaqlandi] = useState(false);
  const [kutub, setKutub] = useState(null);
  const [kutubTur, setKutubTur] = useState('');
  const [tanlangan, setTanlangan] = useState(null);
  const [form, setForm] = useState({ mavzu: '', fan: '', daraja: 'maktab', sinf: '', tur: 'dars', qoshimcha: '', manba: '' });
  const hajmQolda = React.useRef(false);   // foydalanuvchi hajm yoki slayd sonini o'zi o'zgartirgan bo'lsa — tavsiya ustidan yozilmaydi
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
  const [sozlama, setSozlama] = useState({ slayd_soni: 12, hajm: 'orta', til: 'uz', ohang: '', misollar: 'orta', test_soni: '' });
  const [soz, setSoz] = useState({});            // dizayn sozlamalari (server katalogi: info.sozlamalar)
  const [sozKech, setSozKech] = useState({});    // yozib turilganda har harfda qayta chizmaslik uchun
  const [qadam, setQadam] = useState(1);
  const [ochiq, setOchiq] = useState(() => new Set(['uslub']));
  const [reja, setReja] = useState(null);
  const fileRef = useRef(null);
  const xatoRef = useRef(null);
  const [pptxXato, setPptxXato] = useState('');
  const zipRef = useRef(null);
  const ishRef = useRef(null);
  const so = (path, opts) => dvSorov(apiBase, token, path, opts);

  useEffect(() => {
    so('/uslublar').then(setInfo).catch(e => setXato(e.message));
    royxatYukla(true);
    return () => { ishRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // «Mening taqdimotlarim»
  async function royxatYukla(boshida = false) {
    try {
      const r = await so('/saqlangan');
      setRoyxat(r.taqdimotlar || []);
      if (boshida && (r.taqdimotlar || []).length) setTab(t => (t === 'ai' ? 'mening' : t));
    } catch (e) {
      setRoyxat([]);
      if (!boshida) setXato(e.message);
    }
  }
  // AI yozayotgan ish bo'lsa — ro'yxat o'zi yangilanib turadi
  useEffect(() => {
    if (tab !== 'mening' || !royxat?.some(t => t.holat === 'navbatda' || t.holat === 'yozilmoqda')) return undefined;
    const id = setInterval(() => royxatYukla(), 8000);
    return () => clearInterval(id);
  }, [tab, royxat]); // eslint-disable-line react-hooks/exhaustive-deps

  function korinishQoy(k) {
    setSeed(k?.seed || yangiUrug());
    setOila(k?.oila || '');
    setPalitra(k?.palitra || '');
    setAnim(k?.anim || '');
    setBolimTitul(k && 'bolim_titul' in k ? k.bolim_titul : null);
    setRasmAvto(k?.rasm_avto ?? true);
    setDizayn(k?.dizayn || {});
    setSoz(k?.sozlama || {});
    setSozKech(k?.sozlama || {});
  }
  const korinish = () => ({ seed, oila, palitra, anim, bolim_titul: bolimTitul, rasm_avto: rasmAvto, dizayn, sozlama: sozKech });
  function avtoga() {
    setOila(''); setPalitra(''); setAnim(''); setBolimTitul(null); setRasmAvto(true); setDizayn({}); setSoz({}); setSozKech({});
    alertMatn('Dizayn sozlamalari avtoga qaytarildi.');
  }
  // yozib turilgan matn (muallif) — 0,6 soniya to'xtagach chiziladi; tugmalar darhol
  useEffect(() => {
    const id = setTimeout(() => setSozKech(soz), 600);
    return () => clearTimeout(id);
  }, [soz]);
  const sozQoy = (kalit, qiymat) => {
    const n = { ...soz };
    if (qiymat === '' || qiymat === undefined || qiymat === null) delete n[kalit]; else n[kalit] = qiymat;
    setSoz(n);
    if (kalit !== 'muallif') setSozKech(n);
  };

  async function saqlanganOch(t) {
    setBusy('och:' + t.id);
    setXato('');
    try {
      const o = await so(`/saqlangan/${t.id}`);
      if (o.holat === 'tayyor' && o.tur === 'reja') {
        const sr = o.sorov || {};
        setForm(f => ({ ...f, ...Object.fromEntries(['mavzu', 'fan', 'daraja', 'sinf', 'tur', 'qoshimcha'].filter(k => sr[k]).map(k => [k, sr[k]])) }));
        if (sr.sozlama) {
          const { qismlar, ...qolgan } = sr.sozlama;
          setSozlama(z => ({ ...z, ...qolgan, slayd_soni: qolgan.slayd_soni || z.slayd_soni, test_soni: qolgan.test_soni === null || qolgan.test_soni === undefined ? '' : String(qolgan.test_soni) }));
          if (qismlar && Object.keys(qismlar).length) setSoz(z => ({ ...z, qismlar }));
        }
        setReja(o.reja);
        setTab('ai');
        setQadam(2);
        alertMatn('Reja ochildi — tahrirlab, «Shu reja bo‘yicha yozsin» ni bosing.');
      } else if (o.holat === 'tayyor') {
        korinishQoy(o.korinish);
        setJoriyIsh(o.id);
        setMiya(o.miya);
        setTanlangan(null);
        setQadam(4);
      } else if (t.holat === 'uzildi') {
        setXato('Bu taqdimotni yozish server qayta ishga tushganda to‘xtab qolgan. «AI yozsin» bo‘limida qayta yozdiring.');
      } else if (o.holat === 'xato') {
        setXato(o.xato || 'AI xato bilan tugagan');
      } else {
        setBusy('ai');
        await kut(o.id, Date.now(), (m) => { setMiya(m); setSeed(yangiUrug()); setJoriyIsh(o.id); setQadam(3); });
        royxatYukla();
        return;
      }
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy(b => (b === 'och:' + t.id ? '' : b));
    }
  }

  async function saqlanganOchir(t) {
    try {
      await so(`/saqlangan/${t.id}`, { method: 'DELETE' });
      if (joriyIsh === t.id) setJoriyIsh(null);
      setOchirTasdiq('');
      royxatYukla();
    } catch (e) { setXato(e.message); }
  }

  // tanlangan tildan boshqa tilda qolgan matnni AI bilan to'g'rilash (saqlangan bo'lsa — bazada ham)
  async function tilniTogrila(til) {
    if (!miya) return;
    setBusy('til');
    setXato('');
    try {
      const r = await so('/til-togrila', { method: 'POST', json: { miya, til, ...(joriyIsh ? { ish: joriyIsh } : {}) }, timeout: 180000 });
      if (r.soni) { setMiya(r.miya); alertMatn(`${r.soni} ta matn ${TIL_NOMI[til]} tiliga o‘girildi.`); }
      else alertMatn(`Hamma matn allaqachon ${TIL_NOMI[til]} tilida.`);
    } catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  async function saqla() {
    if (!miya) return;
    setBusy('saqla');
    try {
      const r = await so('/saqlangan', { method: 'POST', json: { miya, korinish: korinish() } });
      setJoriyIsh(r.id);
      setSaqlandi(true);
      alertMatn('Saqlandi — «Mening taqdimotlarim» bo‘limida turadi.');
      royxatYukla();
    } catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  // saqlangan taqdimotning dizayni (uslub, urug', titul…) o'zgarsa — o'zi saqlanadi
  useEffect(() => {
    if (!joriyIsh) return undefined;
    setSaqlandi(false);
    const id = setTimeout(() => {
      so(`/saqlangan/${joriyIsh}/korinish`, { method: 'POST', json: { korinish: korinish() } })
        .then(() => setSaqlandi(true)).catch(() => {});
    }, 1200);
    return () => clearTimeout(id);
  }, [joriyIsh, seed, oila, palitra, anim, bolimTitul, rasmAvto, dizayn, sozKech]); // eslint-disable-line react-hooks/exhaustive-deps

  // mazmun yoki uslub o'zgarsa — sahnani qayta yasaymiz (server 0,2 soniyada chizadi)
  useEffect(() => {
    if (!miya) return;
    let bekor = false;
    setBusy('yasash');
    const uslubKod = oila && palitra ? `${oila}.${palitra}.${seed % 3}` : undefined;
    so('/yasash', { method: 'POST', json: { miya, seed, ...(uslubKod ? { uslub: uslubKod } : oila ? { oila } : {}), ...(anim ? { anim } : {}), ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}), rasm_avto: rasmAvto, dizayn, sozlama: sozKech } })
      .then(s => { if (!bekor) { setSahna(s); setXato(''); } })
      .catch(e => { if (!bekor) setXato(e.message); })
      .finally(() => { if (!bekor) setBusy(''); });
    return () => { bekor = true; };
  }, [miya, seed, oila, palitra, anim, bolimTitul, rasmAvto, dizayn, sozKech]); // eslint-disable-line react-hooks/exhaustive-deps

  async function aiIsh(body, natijaUchun) {
    setXato('');
    setBusy('ai');
    setAiVaqt(0);
    const t0 = Date.now();
    try {
      const { ish } = await so('/ai', { method: 'POST', json: body });
      await kut(ish, t0, natijaUchun);
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  // AI ishini kutish (yangi yoki «Mening taqdimotlarim»dan davom ettirilgan)
  async function kut(ish, t0, natijaUchun) {
    ishRef.current = ish;
    try {
      for (;;) {
        await new Promise(r => setTimeout(r, 3000));
        if (ishRef.current !== ish) return;
        setAiVaqt(Math.round((Date.now() - t0) / 1000));
        const h = await so(`/ai/${ish}`);
        if (h.holat === 'tayyor') { natijaUchun(h.miya, ish); break; }
        if (h.holat === 'xato') throw new Error(h.xato || 'AI xato qildi');
        if (Date.now() - t0 > 300000) throw new Error('AI juda uzoq ishladi. Natija tayyor bo‘lsa, «Mening taqdimotlarim»da chiqadi.');
      }
    } catch (e) {
      setXato(e.message);
    } finally {
      setBusy('');
    }
  }

  // AI uchun mazmun sozlamalari: test soni («Avto» — AI o'zi), o'chirilgan qismlar dizayn bilan umumiy
  const aiSozlama = () => ({ ...sozlama, test_soni: sozlama.test_soni === '' ? undefined : Number(sozlama.test_soni), qismlar: soz.qismlar || {} });
  function aiYoz(rejaBilan = false) {
    return aiIsh({ ...form, sozlama: aiSozlama(), ...(rejaBilan && reja ? { reja } : {}) }, (m, ish) => { setMiya(m); setSeed(yangiUrug()); setJoriyIsh(ish); setTanlangan(null); royxatYukla(); setQadam(3); });
  }

  function aiReja() {
    return aiIsh({ ...form, sozlama: aiSozlama(), faqat_reja: true }, r => { setReja(r); setQadam(2); });
  }

  async function faylYukla(file) {
    if (!file) return;
    setXato('');
    setBusy('import');
    try {
      const buf = await file.arrayBuffer();
      const r = await so('/import', { method: 'POST', raw: buf, headers: { 'X-Fayl-Nomi': encodeURIComponent(file.name) } });
      setMiyalar(r.miyalar);
      if (r.miyalar[0]) { setMiya(r.miyalar[0]); setSeed(yangiUrug()); setJoriyIsh(null); }
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
    try { setMiya(await so(`/kutubxona/${toplam}/${encodeURIComponent(m.kod)}`)); setTanlangan({ toplam, ...m }); setSeed(yangiUrug()); setJoriyIsh(null); }
    catch (e) { setXato(e.message); } finally { setBusy(''); }
  }

  async function aiTayyorOch(m) {
    setXato('');
    try { setMiya(await so(`/kutubxona-ai/${m.id}`)); setTanlangan({ toplam: 'ai', kod: m.id, nom: m.mavzu }); setSeed(yangiUrug()); setJoriyIsh(null); }
    catch (e) { setXato(e.message); }
  }

  async function tayyorHujjat(toplam, m, tur) {
    const nomlar = { oqituvchi: 'oqituvchi_matni.md', topshiriq: 'talaba_topshirigi.md', reja: 'reja.json', javoblar: 'javoblar.json' };
    try { yuklabOl(await so(`/kutubxona/${toplam}/${encodeURIComponent(m.kod)}/${tur}`, { binary: true }), `${m.kod}_${nomlar[tur]}`); }
    catch (e) { setXato(e.message); }
  }

  async function namuna() {
    setBusy('import');
    try { setMiya(await so('/namuna')); setSeed(yangiUrug()); setJoriyIsh(null); } catch (e) { setXato(e.message); } finally { setBusy(''); }
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
      const blob = await so('/pptx', { method: 'POST', json: { miya, seed: sahna.seed, uslub: uslubKod, anim: sahna.uslub.anim, anim2: sahna.dizayn?.anim2 || '', ...(bolimTitul !== null ? { bolim_titul: bolimTitul } : {}), rasm_avto: rasmAvto, dizayn, sozlama: sozKech }, binary: true, timeout: 180000 });
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
  const katalog = info?.sozlamalar || [];
  const qismKatalog = katalog.flatMap(g => g.sozlamalar).find(s => s.tur === 'qismlar');
  const mazmunSoni = miya ? miya.bolimlar.reduce((n, b) => n + b.slaydlar.length, 0) : 0;
  const ruxsat = [true, !!reja || tab === 'ai', !!miya, !!miya && !!sahna];
  const ozgargan = Object.keys(soz).length + (oila ? 1 : 0) + (anim ? 1 : 0) + Object.keys(dizayn).length + (bolimTitul !== null ? 1 : 0) + (rasmAvto ? 0 : 1);
  const guruhSoni = g => g.sozlamalar.filter(s => soz[s.kalit] !== undefined).length;
  const tavsiya = YOSH_TAVSIYA[yoshBand(form.daraja, form.sinf)] || null;
  useEffect(() => {   // sinf/kurs tanlanganda hajm va slaydlar soni yoshga moslanadi (o'zi o'zgartirmagan bo'lsa)
    if (tavsiya && !hajmQolda.current) setSozlama(z => (z.hajm === tavsiya[0] && z.slayd_soni === tavsiya[1] ? z : { ...z, hajm: tavsiya[0], slayd_soni: tavsiya[1] }));
  }, [form.daraja, form.sinf]);   // eslint-disable-line react-hooks/exhaustive-deps
  const ochQoy = id => setOchiq(o => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const aiTayyor = info?.ai !== false;
  const aiBand = busy === 'ai';

  if (bolim === 'ochiq') {
    return <React.Suspense fallback={<p className="dv-help" role="status"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}>
      <OchiqDars so={so} apiBase={apiBase} token={token} onClose={onClose} />
    </React.Suspense>;
  }

  return <div className="dv-studio">
    <header className="dv-head">
      {onClose && <button type="button" className="dv-back" onClick={onClose}><ArrowLeft size={17} />Orqaga</button>}
      <div className="dv-head-matn"><h2><Sparkles size={20} /> Taqdimot tayyorlash</h2>
        <p>Mazmunni bering, dizaynni sozlang — chizmalar, joylashuv va animatsiyani dastur o‘zi qiladi{info ? ` · ${info.jami.toLocaleString('uz')} xil uslub` : ''}.</p></div>
      <button type="button" className="dv-back" onClick={() => { setTab('mening'); setQadam(1); royxatYukla(); }}><FolderOpen size={16} />Mening taqdimotlarim</button>
    </header>

    <ol className="dv-qadamlar" aria-label="Taqdimot tayyorlash qadamlari">
      {QADAMLAR.map(([nom, izoh], i) => {
        const n = i + 1;
        const tugadi = (n === 1 && !!miya) || (n === 2 && !!miya && !!reja) || (n === 3 && qadam === 4);
        return <li key={nom}><button type="button" disabled={!ruxsat[i]} aria-current={qadam === n ? 'step' : undefined}
          className={`${qadam === n ? 'is-current' : ''}${tugadi ? ' is-done' : ''}`} onClick={() => setQadam(n)}>
          <span className="dv-qadam-raqam">{tugadi && qadam !== n ? <Check size={15} /> : n}</span>
          <span className="dv-qadam-matn"><b>{nom}</b><small>{izoh}</small></span>
        </button></li>;
      })}
    </ol>

    {xato && <div className="dv-xato" role="alert" ref={xatoRef}><CircleAlert size={17} /> {xato}</div>}
    {xabar && <div className="dv-xabar" role="status">{xabar}</div>}

    {/* ---------------------------------------------------------------- 1. MAZMUN */}
    {qadam === 1 && <section className="dv-card">
      <h3>1-qadam. Mazmun qayerdan olinadi?</h3>
      <Yoriq>Bittasini tanlang. Eng oson yo‘l — <b>«AI yozsin»</b>: mavzuni yozasiz, slaydlar sonini va hajmini belgilaysiz. Tayyor bo‘lgach dizayn qadamiga o‘tasiz.</Yoriq>
      <div className="dv-manbalar" role="tablist">
        {MANBALAR.map(([id, B, nom, izoh]) => <button type="button" key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''}
          onClick={() => { setTab(id); if (id === 'mening') royxatYukla(); }}><B size={20} /><b>{nom}</b><small>{izoh}</small></button>)}
      </div>

      {tab === 'mening' && <div className="dv-fayl">
        <p className="dv-help">AI yozgan barcha taqdimotlar shu yerda saqlanadi — yuklab olmasangiz ham, sahifani yopsangiz ham yo‘qolmaydi. Tanlagan dizayn sozlamalari ham birga saqlanadi.</p>
        <div className="dv-row"><button type="button" onClick={() => royxatYukla()}><RefreshCw size={15} />Yangilash</button></div>
        {!royxat && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}
        {royxat && !royxat.length && <p className="dv-help">Hozircha saqlangan taqdimot yo‘q. «AI yozsin» bilan yozdiring — natija shu yerda paydo bo‘ladi.</p>}
        {royxat && royxat.length > 0 && <div className="dv-mavzular">
          {royxat.map(t => <div key={t.id} className={`dv-mavzu${joriyIsh === t.id ? ' is-active' : ''}`}>
            <button type="button" className="dv-mavzu-btn" onClick={() => saqlanganOch(t)} disabled={busy === 'och:' + t.id}>
              <span className={`dv-mavzu-kod dv-holat-${t.holat}`}>{TUR_NOM[t.tur] || 'AI'}</span>
              <span className="dv-mavzu-nom">{t.nom}</span>
              <span className="dv-mavzu-info">{holatMatn(t)} · {sana(t.yangilandi || t.yaratildi)}{t.fan ? ` · ${t.fan}` : ''}{t.sinf ? ` · ${t.sinf}` : ''}</span>
              {busy === 'och:' + t.id && <LoaderCircle className="dv-spin" size={15} />}
            </button>
            <div className="dv-row dv-mavzu-hujjat">
              {t.holat === 'tayyor' && <button type="button" onClick={() => saqlanganOch(t)}><FolderOpen size={15} />Ochish</button>}
              {ochirTasdiq === t.id
                ? <><span className="dv-help">O‘chirilsinmi?</span><button type="button" onClick={() => saqlanganOchir(t)}><Check size={15} />Ha</button><button type="button" onClick={() => setOchirTasdiq('')}><X size={15} />Yo‘q</button></>
                : <button type="button" onClick={() => setOchirTasdiq(t.id)}><Trash2 size={15} />O‘chirish</button>}
            </div>
          </div>)}
        </div>}
      </div>}

      {tab === 'tayyor' && <div className="dv-fayl">
        <AiKutubxona so={so} admin={!!info?.admin} tanlanganId={tanlangan?.toplam === 'ai' ? tanlangan.kod : null} onOch={aiTayyorOch} xatoQoy={setXato} />
        {info?.admin && <details className="dv-kadmin-wrap"><summary>Administrator: kutubxonani to‘ldirish (AI yozuvchi, darsliklar, fan dasturlari)</summary><KutubxonaAdmin so={so} /></details>}
        <h4 className="dv-kutub-sarlavha">Kafedra to‘plamlari</h4>
        {!kutub && <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Yuklanmoqda…</p>}
        {kutub && !kutub.length && <p className="dv-help">Hozircha kafedra to‘plamlari yo‘q.</p>}
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

      {tab === 'ai' && <div className="dv-ai">
        {!aiTayyor && <p className="dv-xato">AI kaliti serverda sozlanmagan. Hozircha «Fayldan» (Excel shablon yoki ChatGPT ko‘rsatmasi) orqali tayyorlang.</p>}
        <fieldset className="dv-bolak"><legend>Mavzu</legend>
          <div className="dv-form">
            <label className="dv-wide"><span>Mavzu <em>*</em></span><input value={form.mavzu} onChange={e => setForm({ ...form, mavzu: e.target.value })} placeholder="Masalan: Kasrlarni qo‘shish va ayirish" /></label>
            <label>Fan<input value={form.fan} onChange={e => setForm({ ...form, fan: e.target.value })} placeholder="Matematika" /></label>
            <label>Sinf / kurs<input value={form.sinf} onChange={e => setForm({ ...form, sinf: e.target.value })} placeholder="5-sinf yoki 2-kurs" /></label>
            <label>Daraja<select value={form.daraja} onChange={e => setForm({ ...form, daraja: e.target.value })}>{DARAJALAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
            <label>Turi<select value={form.tur} onChange={e => setForm({ ...form, tur: e.target.value })}>{TURLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
          </div>
        </fieldset>
        <fieldset className="dv-bolak"><legend>Hajm</legend>
          <div className="dv-soz">
            <div className="dv-soz-nom"><b>Slaydlar soni: {sozlama.slayd_soni} ta</b><small>Mazmun slaydlari (titul, reja, test va xulosa qo‘shimcha chiqadi). 5 dan 40 gacha.</small></div>
            <div className="dv-row dv-soni-tanla">
              <input type="range" min={5} max={40} value={sozlama.slayd_soni} onChange={e => { hajmQolda.current = true; setSozlama({ ...sozlama, slayd_soni: Number(e.target.value) }); }} aria-label="Slaydlar soni" />
              <input type="number" min={5} max={40} value={sozlama.slayd_soni} onChange={e => { hajmQolda.current = true; setSozlama({ ...sozlama, slayd_soni: Math.max(5, Math.min(40, Number(e.target.value) || 5)) }); }} aria-label="Slaydlar soni (raqam)" />
            </div>
          </div>
          <div className="dv-soz">
            <div className="dv-soz-nom"><b>Har slayddagi matn</b><small>Slaydlar bo‘sh ko‘rinmasin desangiz — «Batafsil» yoki «To‘liq».</small></div>
            <div className="dv-hajmlar">{HAJMLAR.map(([k, n, soz_, izoh]) => <button type="button" key={k} className={sozlama.hajm === k ? 'is-active' : ''} aria-pressed={sozlama.hajm === k}
              onClick={() => { hajmQolda.current = true; setSozlama({ ...sozlama, hajm: k }); }}><b>{n}</b><span>{soz_}</span><small>{izoh}</small></button>)}</div>
            {tavsiya && <p className="dv-help">Tavsiya ({form.sinf || DARAJALAR.find(d => d[0] === form.daraja)?.[1]}): {tavsiya[1]} slayd, «{HAJMLAR.find(h => h[0] === tavsiya[0])?.[1]}» hajm
              {(sozlama.hajm !== tavsiya[0] || sozlama.slayd_soni !== tavsiya[1]) && <> · <button type="button" className="dv-link" onClick={() => { hajmQolda.current = false; setSozlama(z => ({ ...z, hajm: tavsiya[0], slayd_soni: tavsiya[1] })); }}>tavsiyani qo‘llash</button></>}</p>}
          </div>
          <div className="dv-form">
            <label>Misollar<select value={sozlama.misollar} onChange={e => setSozlama({ ...sozlama, misollar: e.target.value })}>{MISOLLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
            <label>Test savollari<select value={sozlama.test_soni} onChange={e => setSozlama({ ...sozlama, test_soni: e.target.value })}>{TEST_SONI.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
            <label>Til<select value={sozlama.til} onChange={e => setSozlama({ ...sozlama, til: e.target.value })}>{TILLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
            <label>Ohang<select value={sozlama.ohang} onChange={e => setSozlama({ ...sozlama, ohang: e.target.value })}>{OHANGLAR.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
          </div>
        </fieldset>
        {qismKatalog && <fieldset className="dv-bolak"><legend>Qaysi qismlar bo‘lsin</legend>
          <p className="dv-help">Belgini olib tashlasangiz, AI o‘sha qismni yozmaydi va u slaydda chiqmaydi.</p>
          <Qismlar ai soz={soz} sozQoy={sozQoy} katalog={qismKatalog} />
        </fieldset>}
        <fieldset className="dv-bolak"><legend>Qo‘shimcha (ixtiyoriy)</legend>
          <div className="dv-form">
            <label className="dv-wide">Qo‘shimcha talab<input value={form.qoshimcha} onChange={e => setForm({ ...form, qoshimcha: e.target.value })} placeholder="Masalan: ko‘proq hayotiy misollar, 4 ta bo‘lim" /></label>
            <label className="dv-wide">Manba matn (darslikdan parcha, reja)<textarea rows={3} value={form.manba} onChange={e => setForm({ ...form, manba: e.target.value })} /></label>
          </div>
        </fieldset>
        <div className="dv-row">
          <button type="button" className="dv-primary" disabled={aiBand || form.mavzu.trim().length < 3 || !aiTayyor} onClick={aiReja}>
            {aiBand ? <><LoaderCircle className="dv-spin" size={17} />AI ishlamoqda… {aiVaqt}s</> : <><ListTree size={17} />Avval reja tuzsin (tavsiya)</>}</button>
          <button type="button" disabled={aiBand || form.mavzu.trim().length < 3 || !aiTayyor} onClick={() => aiYoz(false)}><Wand2 size={17} />Darhol to‘liq yozsin</button>
          {form.mavzu.trim().length < 3 && <span className="dv-help">Avval mavzuni yozing.</span>}
        </div>
        {aiBand && <p className="dv-help">AI yozayotganda sahifani yopsangiz ham bo‘ladi — natija «Mening taqdimotlarim»da paydo bo‘ladi.</p>}
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

      {tab === 'namuna' && <div className="dv-fayl"><p className="dv-help">«Ratsional sonlar» ma’ruzasi — dvigatel qanday ishlashini ko‘rish uchun.</p>
        <button type="button" className="dv-primary" onClick={namuna}><Sparkles size={16} />Namunani ochish</button></div>}

      {miya && <div className="dv-tayyor-bar">
        <p className="dv-ok"><Check size={16} /> Mazmun tayyor: <b>{miya.meta.mavzu}</b> · {miya.bolimlar.length} bo‘lim · {mazmunSoni} mazmun slaydi</p>
        <button type="button" className="dv-primary" onClick={() => setQadam(3)}>Keyingi: dizayn<ChevronRight size={16} /></button>
      </div>}
      {miya && <DarsRejasi dars={miya.dars} mavzu={miya.meta.mavzu} />}
    </section>}

    {/* ---------------------------------------------------------------- 2. REJA */}
    {qadam === 2 && <section className="dv-card">
      <h3>2-qadam. Reja (ixtiyoriy)</h3>
      <Yoriq>AI tuzgan rejani ko‘rib chiqing: sarlavhalarni o‘zgartiring, keraksizini o‘chiring, yangisini qo‘shing, tartibini almashtiring. So‘ng <b>«Shu reja bo‘yicha yozsin»</b> ni bosing — AI aynan shu reja bo‘yicha yozadi.</Yoriq>
      {reja ? <RejaMuharrir reja={reja} setReja={setReja} busy={aiBand} aiVaqt={aiVaqt} onYoz={() => aiYoz(true)} />
        : <div className="dv-bosh"><p>Hali reja yo‘q. 1-qadamda mavzuni yozib, <b>«Avval reja tuzsin»</b> ni bosing.</p>
          <button type="button" className="dv-primary" disabled={aiBand || form.mavzu.trim().length < 3 || !aiTayyor} onClick={aiReja}>
            {aiBand ? <><LoaderCircle className="dv-spin" size={17} />AI ishlamoqda… {aiVaqt}s</> : <><ListTree size={17} />Reja tuzsin</>}</button></div>}
      <Keyingi setQadam={setQadam} orqa={1} oldinga={miya ? 3 : null} matn="Keyingi: dizayn" />
    </section>}

    {/* ---------------------------------------------------------------- 3. DIZAYN */}
    {qadam === 3 && miya && info && <section className="dv-card">
      <div className="dv-row dv-spread"><h3>3-qadam. Dizayn {busy === 'yasash' && <LoaderCircle className="dv-spin" size={16} />}</h3>
        <button type="button" onClick={avtoga} disabled={!ozgargan}><RotateCcw size={15} />Hammasini avtoga qaytarish{ozgargan ? ` (${ozgargan})` : ''}</button></div>
      <Yoriq>Har bir sozlama o‘ngdagi ko‘rinishda darhol ko‘rinadi. Hech narsani o‘zgartirmasangiz ham bo‘ladi — «Avto» holatda dastur mavzuga mos dizaynni o‘zi tanlaydi. Pastdagi kichik slaydlarni bosib, boshqa slaydlarni ko‘ring.</Yoriq>
      {sahna?.ogohlantirish?.length > 0 && <div className="dv-ogoh" role="status">{sahna.ogohlantirish.map(t => <p key={t}><CircleAlert size={15} /> {t}</p>)}</div>}
      <div className="dv-dizayn">
        <div className="dv-sozlamalar">
          <Guruh ochiq={ochiq} ochQoy={ochQoy} id="uslub" belgi={SlidersHorizontal} nom="Uslub" soni={(oila ? 1 : 0) + (dizayn.titul !== undefined ? 1 : 0)}>
            <div className="dv-soz"><div className="dv-soz-nom"><b>Uslub oilasi</b><small>Umumiy ko‘rinish: kartalar, fon va sarlavha shakli.</small></div>
              <div className="dv-row dv-chips">
                <button type="button" className={!oila ? 'is-active' : ''} onClick={() => { setOila(''); setPalitra(''); setSeed(yangiUrug()); }}><Shuffle size={15} />Avto</button>
                {info.oilalar.map(o => <button type="button" key={o.kod} className={oila === o.kod ? 'is-active' : ''} onClick={() => { setOila(o.kod); setPalitra(o.palitralar[0].kod); }}>{o.nom}</button>)}
              </div></div>
            {oilaObj && <div className="dv-soz"><div className="dv-soz-nom"><b>Rang to‘plami</b></div>
              <div className="dv-row dv-chips">{oilaObj.palitralar.map(p => <button type="button" key={p.kod} className={palitra === p.kod ? 'is-active' : ''} onClick={() => setPalitra(p.kod)}>
                <span className="dv-dots">{p.acc.map(c => <i key={c} style={{ background: c }} />)}</span>{p.nom}</button>)}</div></div>}
            {info.dizaynlar && [['titul', 'Titul slaydi'], ['sarlavha', 'Sarlavha qatori'], ['bolim', 'Bo‘lim slaydi'], ['kart', 'Kartalar soyasi']].map(([kalit, nom]) =>
              <div className="dv-soz" key={kalit}><div className="dv-soz-nom"><b>{nom}</b></div>
                <select value={dizayn[kalit] ?? ''} aria-label={nom} onChange={e => { const v = e.target.value; setDizayn(d => { const n = { ...d }; if (v === '') delete n[kalit]; else n[kalit] = /^\d+$/.test(v) ? Number(v) : v; return n; }); }}>
                  <option value="">Avto</option>
                  {info.dizaynlar[kalit].map(v => <option key={v.kod} value={v.kod}>{v.nom}</option>)}
                </select></div>)}
            <div className="dv-soz"><div className="dv-soz-nom"><b>Bo‘lim titullari</b><small>Har bo‘lim oldidan katta raqamli slayd.</small></div>
              <Chiplar variantlar={[[null, 'Avto'], [true, 'Bor'], [false, 'Yo‘q']]} qiymat={bolimTitul} ozgar={setBolimTitul} /></div>
            <div className="dv-soz"><div className="dv-soz-nom"><b>Rasmlar</b><small>Saytdagi 6000+ rasmdan mavzuga mosini dastur o‘zi qo‘yadi.</small></div>
              <Chiplar variantlar={[[true, 'Kutubxonadan mosini qo‘ysin'], [false, 'Faqat mazmundagilar']]} qiymat={rasmAvto} ozgar={setRasmAvto} /></div>
            <button type="button" onClick={() => setSeed(yangiUrug())}><Shuffle size={15} />Boshqa variant (joylashuvlar va bezaklar)</button>
          </Guruh>
          {katalog.map(g => <Guruh ochiq={ochiq} ochQoy={ochQoy} key={g.guruh} id={g.guruh} belgi={GURUH_BELGI[g.guruh]} nom={g.guruh} soni={guruhSoni(g) + (g.guruh === 'Animatsiya' && anim ? 1 : 0)}>
            {g.guruh === 'Animatsiya' && <div className="dv-soz"><div className="dv-soz-nom"><b>Animatsiya turi</b><small>Elementlar qanday chiqadi. «Avto» — ikki xil animatsiya aralash.</small></div>
              <select value={anim} onChange={e => setAnim(e.target.value)} aria-label="Animatsiya turi">
                <option value="">Avto (aralash)</option>
                {info.animatsiyalar.map(a => <option key={a.kod} value={a.kod}>{a.nom}</option>)}
              </select></div>}
            {g.sozlamalar.map(s => <Sozlama key={s.kalit} s={s} soz={soz} sozQoy={sozQoy} qismKatalog={qismKatalog} />)}
          </Guruh>)}
        </div>
        <div className="dv-korinish">
          {sahna ? <SahnaPlayer sahna={sahna} apiBase={apiBase} joyidaQol /> : <p className="dv-help"><LoaderCircle className="dv-spin" size={15} /> Chizilmoqda…</p>}
        </div>
      </div>
      <Keyingi setQadam={setQadam} orqa={1} oldinga={sahna ? 4 : null} matn="Keyingi: ko‘rish va yuklab olish" />
    </section>}

    {/* ---------------------------------------------------------------- 4. TAYYOR */}
    {qadam === 4 && sahna && <section className="dv-card">
      <div className="dv-row dv-spread"><h3>4-qadam. Ko‘rish va yuklab olish {busy === 'yasash' && <LoaderCircle className="dv-spin" size={16} />}</h3>
        <span className="dv-help">{sahna.slaydlar.length} slayd · uslub {sahna.uslub.kod}</span></div>
      <Yoriq>Slaydni bosing yoki → / bo‘sh joy — keyingi qadam. F yoki ikki marta bosish — to‘liq ekran. <b>Saqlash</b> — «Mening taqdimotlarim»ga; <b>PowerPoint</b> — kompyuterga yuklab olish (animatsiyalar bilan).</Yoriq>
      <div className="dv-row dv-amallar">
        {joriyIsh
          ? <span className="dv-help dv-saqlandi"><Check size={15} />{saqlandi ? 'Saqlangan · «Mening taqdimotlarim»' : 'Saqlanmoqda…'}</span>
          : <button type="button" onClick={saqla} disabled={busy === 'saqla'}>{busy === 'saqla' ? <LoaderCircle className="dv-spin" size={16} /> : <Save size={16} />}Saqlash</button>}
        <button type="button" onClick={() => setQadam(3)}><Palette size={16} />Dizaynni o‘zgartirish</button>
        <button type="button" className="dv-primary" onClick={pptx} disabled={busy === 'pptx'}>{busy === 'pptx' ? <LoaderCircle className="dv-spin" size={16} /> : <Download size={16} />}{busy === 'pptx' ? 'Fayl tayyorlanmoqda…' : 'PowerPoint (.pptx) yuklab olish'}</button>
      </div>
      {pptxXato && <div className="dv-xato" role="alert">PowerPoint fayli tayyorlanmadi: {pptxXato}</div>}
      {info?.ai && <div className="dv-row dv-chips">
        <span className="dv-label">Til aralashib qolsa:</span>
        {['uz', 'ru', 'en'].map(t => <button type="button" key={t} disabled={busy === 'til'} onClick={() => tilniTogrila(t)}
          className={(miya?.meta?.til || 'uz') === t ? 'is-active' : ''}>{busy === 'til' ? <LoaderCircle className="dv-spin" size={15} /> : null}Hammasini {TIL_NOMI[t]}chaga</button>)}
      </div>}
      <SahnaPlayer sahna={sahna} apiBase={apiBase} />
      {sahna.rasm_hisobot && <RasmHisobot h={sahna.rasm_hisobot} nusxa={nusxa} setNusxa={setNusxa} />}
      <Keyingi setQadam={setQadam} orqa={3} />
    </section>}
  </div>;
}


// ---------------------------------------------------------------- sozlamalar oynasi bo'laklari (komponent tashqarida — yozganda fokus yo'qolmasin)
function Guruh({ id, belgi: B, nom, soni, ochiq, ochQoy, children }) {
  return <div className={`dv-guruh${ochiq.has(id) ? ' is-open' : ''}`}>
    <button type="button" className="dv-guruh-bosh" aria-expanded={ochiq.has(id)} onClick={() => ochQoy(id)}>
      {B && <B size={17} />}<b>{nom}</b>{soni > 0 && <span className="dv-soni">{soni} o‘zgargan</span>}<ChevronRight size={16} className="dv-guruh-ok" />
    </button>
    {ochiq.has(id) && <div className="dv-guruh-ich">{children}</div>}
  </div>;
}

function Chiplar({ variantlar, qiymat, ozgar }) {
  return <div className="dv-row dv-chips">
    {variantlar.map(([k, n]) => <button type="button" key={String(k)} className={qiymat === k ? 'is-active' : ''} aria-pressed={qiymat === k} onClick={() => ozgar(k)}>{n}</button>)}
  </div>;
}

function Qismlar({ soz, sozQoy, katalog, ai = false }) {
  return <div className="dv-qismlar">
    {(katalog?.variantlar || []).filter(([k]) => !ai || k !== 'reja').map(([k, n]) => {
      const bor = (soz.qismlar || {})[k] !== false;
      return <label key={k} className={bor ? 'is-on' : ''}><input type="checkbox" checked={bor} onChange={e => {
        const q = { ...(soz.qismlar || {}) };
        if (e.target.checked) delete q[k]; else q[k] = false;
        sozQoy('qismlar', Object.keys(q).length ? q : '');
      }} />{n}</label>;
    })}
  </div>;
}

function Sozlama({ s, soz, sozQoy, qismKatalog }) {
  const v = soz[s.kalit];
  return <div className="dv-soz">
    <div className="dv-soz-nom"><b>{s.nom}</b>{s.izoh && <small>{s.izoh}</small>}</div>
    {s.tur === 'tanlov' && (s.variantlar.length <= 5
      ? <Chiplar variantlar={s.variantlar} qiymat={v ?? ''} ozgar={x => sozQoy(s.kalit, x)} />
      : <select value={v ?? ''} onChange={e => sozQoy(s.kalit, e.target.value)} aria-label={s.nom}>{s.variantlar.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>)}
    {s.tur === 'rang' && <div className="dv-row dv-ranglar">
      <button type="button" className={!v ? 'is-active' : ''} onClick={() => sozQoy(s.kalit, '')}>Avto</button>
      {(s.tayyor || []).map(c => <button type="button" key={c} className={`dv-rang${v === c ? ' is-active' : ''}`} style={{ background: c }} title={c} aria-label={`${s.nom}: ${c}`} onClick={() => sozQoy(s.kalit, c)} />)}
      <label className="dv-rang-tanla" title="Boshqa rang"><input type="color" value={v || '#1D4E89'} onChange={e => sozQoy(s.kalit, e.target.value.toUpperCase())} aria-label={`${s.nom}: boshqa rang`} />Boshqa…</label>
    </div>}
    {s.tur === 'matn' && <input className="dv-soz-input" value={v || ''} maxLength={s.max || 80} placeholder={s.namuna || ''} onChange={e => sozQoy(s.kalit, e.target.value)} aria-label={s.nom} />}
    {s.tur === 'qismlar' && <Qismlar soz={soz} sozQoy={sozQoy} katalog={qismKatalog} />}
  </div>;
}

function Yoriq({ children }) {
  return <div className="dv-yoriq"><Lightbulb size={18} /><div>{children}</div></div>;
}

function Keyingi({ orqa, oldinga, matn, disabled, setQadam }) {
  return <div className="dv-qadam-nav">
    {orqa ? <button type="button" onClick={() => setQadam(orqa)}><ChevronLeft size={16} />Orqaga</button> : <span />}
    {oldinga && <button type="button" className="dv-primary" disabled={disabled} onClick={() => setQadam(oldinga)}>{matn}<ChevronRight size={16} /></button>}
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
