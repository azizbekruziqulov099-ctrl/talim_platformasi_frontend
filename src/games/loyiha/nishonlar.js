// REV544: Kabu loyiha nishonlari — portfeldan hisoblanadi (alohida saqlanmaydi, shuning uchun hech qachon eskirmaydi).
const __kbM = (x) => x;
/** Loyiha → yo'nalish (S tabiat, T texnologiya, E muhandislik, A san'at, M matematika). Fayllardagi ro'yxat bilan test orqali tekshiriladi. */
export const YON_OF = { osimlik: "S", filtr: "S", qayiq: "S", soya: "S", energiya: "S", koprik: "E", richag: "E", parashyut: "E", qiya: "E", shamol: "E", kod: "T", kod2: "T", tahlil: "T",
  naqsh: "A", rang: "A", fraktal: "A", byudjet: "M", masshtab: "M", sorov: "M", kredit: "M" };   // REV546: + 9–11-sinf (energiya, shamol, tahlil, fraktal, kredit)
const yonKalitlari = (yon) => Object.keys(YON_OF).filter((k) => YON_OF[k] === yon);

export const NISHONLAR = [
  { k: "birinchi", belgi: "🌟", nom: __kbM("Birinchi qadam"), izoh: __kbM("Birinchi loyihani tugatdingiz"), hisob: (c) => [c.soni, 1] },
  { k: "tadqiqotchi", belgi: "🔬", nom: __kbM("Yosh tadqiqotchi"), izoh: __kbM("Tabiat loyihalaridan 3 tasida kamida 2 ⭐"), hisob: (c) => [c.yon("S"), 3] },
  { k: "muhandis", belgi: "🏗️", nom: __kbM("Yosh muhandis"), izoh: __kbM("Muhandislik loyihalaridan 3 tasida kamida 2 ⭐"), hisob: (c) => [c.yon("E"), 3] },
  { k: "dasturchi", belgi: "💻", nom: __kbM("Yosh dasturchi"), izoh: __kbM("Texnologiya loyihalaridan 2 tasida kamida 2 ⭐"), hisob: (c) => [c.yon("T"), 2] },
  { k: "rassom", belgi: "🎨", nom: __kbM("Yosh rassom"), izoh: __kbM("San’at loyihalaridan 2 tasida kamida 2 ⭐"), hisob: (c) => [c.yon("A"), 2] },
  { k: "hisobchi", belgi: "🧮", nom: __kbM("Yosh hisobchi"), izoh: __kbM("Matematika loyihalaridan 3 tasida kamida 2 ⭐"), hisob: (c) => [c.yon("M"), 3] },
  { k: "sinovchi", belgi: "🧪", nom: __kbM("Haqiqiy olim"), izoh: __kbM("5 ta loyihada farazingiz ham, xulosangiz ham to‘g‘ri chiqdi"), hisob: (c) => [c.olim, 5] },
  { k: "oltin", belgi: "✋", nom: __kbM("Qo‘li oltin"), izoh: __kbM("3 ta qo‘lda yasagan loyihangiz tasdiqlandi"), hisob: (c) => [c.qolda, 3] },
  { k: "jamoa", belgi: "🤝", nom: __kbM("Jamoa o‘yinchisi"), izoh: __kbM("Sinf topshirig‘ini jamoada bajardingiz"), hisob: (c) => [c.jamoa, 1] },
  { k: "mukammal", belgi: "🏆", nom: __kbM("Mukammal"), izoh: __kbM("10 ta loyihada 3 ⭐"), hisob: (c) => [c.uch, 10] },
  { k: "steam", belgi: "🌈", nom: __kbM("STEAM ustasi"), izoh: __kbM("Beshala yo‘nalishning har birida kamida bitta loyihada 2 ⭐"), hisob: (c) => [c.yonlar, 5] },
];

/** portfel: { [loyiha]: {yulduz, faraz, xulosa} }; qo'shimcha: { qolda: [{holat}], jamoa: son } → [{k, belgi, nom, izoh, olingan, bor, kerak}] */
export function nishonlarHisobla(portfel = {}, { qolda = [], jamoa = 0 } = {}) {
  const kal = Object.keys(portfel).filter((k) => YON_OF[k]);
  const c = { soni: kal.filter((k) => (portfel[k].yulduz || 0) >= 1).length, qolda: qolda.filter((q) => q.holat === "tasdiqlandi").length, jamoa,
    olim: kal.filter((k) => portfel[k].faraz && portfel[k].xulosa).length, uch: kal.filter((k) => (portfel[k].yulduz || 0) >= 3).length,
    yon: (y) => yonKalitlari(y).filter((k) => (portfel[k]?.yulduz || 0) >= 2).length,
    yonlar: ["S", "T", "E", "A", "M"].filter((y) => yonKalitlari(y).some((k) => (portfel[k]?.yulduz || 0) >= 2)).length };
  return NISHONLAR.map((n) => { const [bor, kerak] = n.hisob(c); return { k: n.k, belgi: n.belgi, nom: n.nom, izoh: n.izoh, bor: Math.min(bor, kerak), kerak, olingan: bor >= kerak }; });
}

// 4K rubrikasi: har ko'nikma 4 daraja (o'qituvchi uchun tushunarli ta'riflar)
export const RUBRIKA = [
  { k: "tanqidiy", belgi: "🧠", nom: __kbM("Tanqidiy fikrlash"), d: [__kbM("Faraz qilmadi"), __kbM("Faraz qildi"), __kbM("Farazini tajribada tekshirdi"), __kbM("Xatosini topib, tuzatdi")] },
  { k: "ijodkor", belgi: "💡", nom: __kbM("Ijodkorlik"), d: [__kbM("Tayyor yechimni oldi"), __kbM("Bitta yechimni sinadi"), __kbM("Bir necha yechimni sinab ko‘rdi"), __kbM("O‘z g‘oyasini qo‘shdi")] },
  { k: "hamkor", belgi: "🤝", nom: __kbM("Hamkorlik"), d: [__kbM("Jamoada qatnashmadi"), __kbM("O‘z vazifasini bajardi"), __kbM("Boshqalarga yordam berdi"), __kbM("Jamoani birlashtirdi")] },
  { k: "muloqot", belgi: "🗣️", nom: __kbM("Muloqot"), d: [__kbM("Tushuntira olmadi"), __kbM("Natijani aytdi"), __kbM("Sababini tushuntirdi"), __kbM("Aniq va ishonarli taqdim etdi")] },
];
export const rubrikaOrtacha = (r) => { const q = Object.values(r || {}).filter((x) => x && typeof x === "object"); if (!q.length) return null;
  return Object.fromEntries(RUBRIKA.map(({ k }) => [k, Math.round((q.reduce((a, x) => a + (x[k] || 0), 0) / q.length) * 10) / 10])); };

// Jamoa rollari: har rolning vazifasi (o'quvchiga ko'rsatiladi)
export const ROLLAR = { tadqiqotchi: { belgi: "🔍", nom: __kbM("Tadqiqotchi"), vazifa: __kbM("Farazni aytadi va sinovlar jadvalini yuritadi.") }, muhandis: { belgi: "🔧", nom: __kbM("Muhandis"), vazifa: __kbM("Loyihani yasaydi va sinab ko‘radi.") },
  dizayner: { belgi: "🎨", nom: __kbM("Dizayner"), vazifa: __kbM("Eng yaxshi variantni tanlashga yordam beradi, natijani chiroyli tasvirlaydi.") }, maruzachi: { belgi: "🎤", nom: __kbM("Ma’ruzachi"), vazifa: __kbM("Xulosani sinfga tushuntirib beradi.") } };
