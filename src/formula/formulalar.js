// REV557: formulalar banki. Har formula: savol, izoh (harflar ma'nosi), qabul qilinadigan yozuv(lar)i.
// javoblar — bir necha SHAKL bo'lishi mumkin (masalan Pifagor: c²=a²+b² ham, c=√(a²+b²) ham); har shaklning turli yozilishi
// (ko'paytuvchilar tartibi, tomonlar almashishi) formulaRules.formulaTeng() orqali o'zi qabul qilinadi.
// daraja: 0 — 5–6-sinf, 1 — 7–9-sinf, 2 — 9–11-sinf. __kbM — matn tarjima ro'yxatiga tushishi uchun belgi.
const __kbM = (x) => x;

export const FORMULALAR = [
  // ── 5–6-sinf: perimetr, yuz, hajm, harakat ──
  { id: "kv_p", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("Kvadrat perimetri"), savol: __kbM("Kvadratning perimetri formulasini yozing."), izoh: __kbM("P — perimetr, a — tomon"), javoblar: ["P=4a"] },
  { id: "kv_s", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("Kvadrat yuzi"), savol: __kbM("Kvadratning yuzi formulasini yozing."), izoh: __kbM("S — yuz, a — tomon"), javoblar: ["S=a^2"] },
  { id: "tt_p", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("To‘g‘ri to‘rtburchak perimetri"), savol: __kbM("To‘g‘ri to‘rtburchakning perimetri formulasini yozing."), izoh: __kbM("P — perimetr, a va b — tomonlar"), javoblar: ["P=2(a+b)"] },
  { id: "tt_s", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("To‘g‘ri to‘rtburchak yuzi"), savol: __kbM("To‘g‘ri to‘rtburchakning yuzi formulasini yozing."), izoh: __kbM("S — yuz, a va b — tomonlar"), javoblar: ["S=ab"] },
  { id: "kub_v", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("Kub hajmi"), savol: __kbM("Kubning hajmi formulasini yozing."), izoh: __kbM("V — hajm, a — qirra"), javoblar: ["V=a^3"] },
  { id: "par_v", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("To‘g‘ri burchakli parallelepiped hajmi"), savol: __kbM("To‘g‘ri burchakli parallelepipedning hajmi formulasini yozing."), izoh: __kbM("V — hajm, a, b, c — o‘lchamlar"), javoblar: ["V=abc"] },
  { id: "yol", daraja: 0, mavzu: __kbM("Harakat"), nom: __kbM("Yo‘l formulasi"), savol: __kbM("Yo‘lni tezlik va vaqt orqali ifodalang."), izoh: __kbM("s — yo‘l, v — tezlik, t — vaqt"), javoblar: ["s=vt"] },
  { id: "tezlik", daraja: 0, mavzu: __kbM("Harakat"), nom: __kbM("Tezlik formulasi"), savol: __kbM("Tezlikni yo‘l va vaqt orqali ifodalang."), izoh: __kbM("v — tezlik, s — yo‘l, t — vaqt"), javoblar: ["v=s/t"] },
  { id: "uch_s", daraja: 0, mavzu: __kbM("Geometriya"), nom: __kbM("Uchburchak yuzi"), savol: __kbM("Uchburchakning yuzi formulasini yozing (asos va balandlik orqali)."), izoh: __kbM("S — yuz, a — asos, h — balandlik"), javoblar: ["S=ah/2"] },
  // ── 7–9-sinf: yuzlar, aylana, Pifagor, qisqa ko'paytirish, darajalar ──
  { id: "par_s", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Parallelogramm yuzi"), savol: __kbM("Parallelogrammning yuzi formulasini yozing."), izoh: __kbM("S — yuz, a — asos, h — balandlik"), javoblar: ["S=ah"] },
  { id: "trap_s", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Trapetsiya yuzi"), savol: __kbM("Trapetsiyaning yuzi formulasini yozing."), izoh: __kbM("S — yuz, a va b — asoslar, h — balandlik"), javoblar: ["S=(a+b)/2*h"] },
  { id: "ayl_c", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Aylana uzunligi"), savol: __kbM("Aylana uzunligi formulasini yozing."), izoh: __kbM("C — uzunlik, r — radius"), javoblar: ["C=2πr"] },
  { id: "doira_s", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Doira yuzi"), savol: __kbM("Doiraning yuzi formulasini yozing."), izoh: __kbM("S — yuz, r — radius"), javoblar: ["S=πr^2"] },
  { id: "pifagor", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Pifagor teoremasi"), savol: __kbM("Pifagor teoremasini yozing."), izoh: __kbM("c — gipotenuza, a va b — katetlar"), javoblar: ["c^2=a^2+b^2", "c=sqrt(a^2+b^2)"] },
  { id: "kub_s", daraja: 1, mavzu: __kbM("Geometriya"), nom: __kbM("Kub to‘la sirti"), savol: __kbM("Kubning to‘la sirti yuzi formulasini yozing."), izoh: __kbM("S — sirt yuzi, a — qirra"), javoblar: ["S=6a^2"] },
  { id: "qk_yig", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Yig‘indining kvadrati"), savol: __kbM("Yig‘indining kvadrati formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["(a+b)^2=a^2+2ab+b^2"] },
  { id: "qk_ayir", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Ayirmaning kvadrati"), savol: __kbM("Ayirmaning kvadrati formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["(a-b)^2=a^2-2ab+b^2"] },
  { id: "kv_ayirma", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Kvadratlar ayirmasi"), savol: __kbM("Kvadratlar ayirmasi formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["a^2-b^2=(a-b)(a+b)"] },
  { id: "taqsim", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Taqsimot qonuni"), savol: __kbM("Ko‘paytirishning taqsimot qonunini yozing."), izoh: __kbM("a, b, c — istalgan sonlar"), javoblar: ["a(b+c)=ab+ac"] },
  { id: "dar_kop", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Darajalarni ko‘paytirish"), savol: __kbM("Bir xil asosli darajalarni ko‘paytirish qoidasini yozing."), izoh: __kbM("a — asos, m va n — daraja ko‘rsatkichlari"), javoblar: ["a^m*a^n=a^(m+n)"] },
  { id: "dar_bol", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Darajalarni bo‘lish"), savol: __kbM("Bir xil asosli darajalarni bo‘lish qoidasini yozing."), izoh: __kbM("a — asos, m va n — daraja ko‘rsatkichlari"), javoblar: ["a^m/a^n=a^(m-n)"] },
  { id: "dar_dar", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Darajani darajaga ko‘tarish"), savol: __kbM("Darajani darajaga ko‘tarish qoidasini yozing."), izoh: __kbM("a — asos, m va n — daraja ko‘rsatkichlari"), javoblar: ["(a^m)^n=a^(mn)"] },
  { id: "diskr", daraja: 1, mavzu: __kbM("Algebra"), nom: __kbM("Diskriminant"), savol: __kbM("ax² + bx + c = 0 tenglamaning diskriminanti formulasini yozing."), izoh: __kbM("D — diskriminant; a, b, c — koeffitsiyentlar"), javoblar: ["D=b^2-4ac"] },
  // ── 9–11-sinf: kublar, jismlar hajmi, trigonometriya ──
  { id: "kub_yig", daraja: 2, mavzu: __kbM("Algebra"), nom: __kbM("Kublar yig‘indisi"), savol: __kbM("Kublar yig‘indisi formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["a^3+b^3=(a+b)(a^2-ab+b^2)"] },
  { id: "kub_ayir", daraja: 2, mavzu: __kbM("Algebra"), nom: __kbM("Kublar ayirmasi"), savol: __kbM("Kublar ayirmasi formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["a^3-b^3=(a-b)(a^2+ab+b^2)"] },
  { id: "yig_kub", daraja: 2, mavzu: __kbM("Algebra"), nom: __kbM("Yig‘indining kubi"), savol: __kbM("Yig‘indining kubi formulasini yozing."), izoh: __kbM("a va b — istalgan sonlar"), javoblar: ["(a+b)^3=a^3+3a^2b+3ab^2+b^3"] },
  { id: "sil_v", daraja: 2, mavzu: __kbM("Geometriya"), nom: __kbM("Silindr hajmi"), savol: __kbM("Silindrning hajmi formulasini yozing."), izoh: __kbM("V — hajm, r — asos radiusi, h — balandlik"), javoblar: ["V=πr^2h"] },
  { id: "kon_v", daraja: 2, mavzu: __kbM("Geometriya"), nom: __kbM("Konus hajmi"), savol: __kbM("Konusning hajmi formulasini yozing."), izoh: __kbM("V — hajm, r — asos radiusi, h — balandlik"), javoblar: ["V=πr^2h/3"] },
  { id: "shar_v", daraja: 2, mavzu: __kbM("Geometriya"), nom: __kbM("Shar hajmi"), savol: __kbM("Sharning hajmi formulasini yozing."), izoh: __kbM("V — hajm, r — radius"), javoblar: ["V=4πr^3/3"] },
  { id: "shar_s", daraja: 2, mavzu: __kbM("Geometriya"), nom: __kbM("Shar sirti"), savol: __kbM("Shar sirtining yuzi formulasini yozing."), izoh: __kbM("S — sirt yuzi, r — radius"), javoblar: ["S=4πr^2"] },
  { id: "trig_asos", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Asosiy trigonometrik ayniyat"), savol: __kbM("Asosiy trigonometrik ayniyatni yozing."), izoh: __kbM("x — burchak"), javoblar: ["sin^2(x)+cos^2(x)=1"] },
  { id: "tg", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Tangens"), savol: __kbM("Tangensni sinus va kosinus orqali ifodalang."), izoh: __kbM("x — burchak"), javoblar: ["tg(x)=sin(x)/cos(x)"] },
  { id: "ctg", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Kotangens"), savol: __kbM("Kotangensni sinus va kosinus orqali ifodalang."), izoh: __kbM("x — burchak"), javoblar: ["ctg(x)=cos(x)/sin(x)"] },
  { id: "sin2", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Ikkilangan burchak sinusi"), savol: __kbM("Ikkilangan burchak sinusi formulasini yozing."), izoh: __kbM("x — burchak"), javoblar: ["sin(2x)=2sin(x)cos(x)"] },
  { id: "cos2", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Ikkilangan burchak kosinusi"), savol: __kbM("Ikkilangan burchak kosinusi formulasini yozing (sinus va kosinus kvadratlari orqali)."), izoh: __kbM("x — burchak"), javoblar: ["cos(2x)=cos^2(x)-sin^2(x)"] },
  { id: "bir_tg", daraja: 2, mavzu: __kbM("Trigonometriya"), nom: __kbM("Tangens va kosinus bog‘lanishi"), savol: __kbM("1 + tg²x nimaga teng? Formulani yozing."), izoh: __kbM("x — burchak"), javoblar: ["1+tg^2(x)=1/cos^2(x)"] },
];

export const darajaFormulalari = (daraja) => FORMULALAR.filter((f) => f.daraja === daraja);
/** Tartib raqami bo'yicha formula (aylanib keladi). */
export const formulaOl = (daraja, urug) => { const r = darajaFormulalari(daraja); return r[((Number(urug) || 1) - 1 + r.length * 1000) % r.length]; };
