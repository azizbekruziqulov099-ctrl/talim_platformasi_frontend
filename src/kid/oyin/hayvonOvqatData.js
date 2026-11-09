// REV450: «Hayvonni boq» — har hayvonga mos ovqatlar (bir nechta to'g'ri javob bo'lishi mumkin: mushuk — sut, sichqon, baliq).
// O'yinda variantlar orasiga shu hayvonning boshqa ovqati «xato» bo'lib tushmaydi.
const W = (e, uz, ru, en) => ({ e, s: { uz, ru, en, de: en, es: en } });
export const OVQAT = {
  sut: W("🥛", "sut", "молоко", "milk"), sichqon: W("🐭", "sichqon", "мышь", "mouse"), baliq: W("🐟", "baliq", "рыба", "fish"),
  suyak: W("🦴", "suyak", "кость", "bone"), gosht: W("🍖", "go‘sht", "мясо", "meat"), non: W("🍞", "non", "хлеб", "bread"),
  sabzi: W("🥕", "sabzi", "морковь", "carrot"), karam: W("🥬", "karam", "капуста", "cabbage"), ot: W("🌿", "o‘t", "трава", "grass"),
  pichan: W("🌾", "pichan", "сено", "hay"), jozi: W("🌽", "makkajo‘xori", "кукуруза", "corn"), banan: W("🍌", "banan", "банан", "banana"),
  yongoq: W("🌰", "yong‘oq", "орех", "nut"), asal: W("🍯", "asal", "мёд", "honey"), gul: W("🌸", "gul", "цветок", "flower"),
  pishloq: W("🧀", "pishloq", "сыр", "cheese"), bambuk: W("🎋", "bambuk", "бамбук", "bamboo"), barg: W("🍃", "barg", "листья", "leaves"),
  chuvalchang: W("🪱", "chuvalchang", "червяк", "worm"), chivin: W("🦟", "chivin", "комар", "mosquito"), olma: W("🍎", "olma", "яблоко", "apple"),
  urug: W("🌻", "urug‘", "семечки", "seeds"), tikan: W("🌵", "tikan", "колючка", "thorn"),
};
export const HAYVON = [
  [W("🐈", "mushuk", "кошка", "cat"), ["sut", "sichqon", "baliq"]],
  [W("🐕", "it", "собака", "dog"), ["suyak", "gosht"]],
  [W("🐰", "quyon", "кролик", "rabbit"), ["sabzi", "karam"]],
  [W("🐄", "sigir", "корова", "cow"), ["ot", "pichan"]],
  [W("🐒", "maymun", "обезьяна", "monkey"), ["banan"]],
  [W("🐿️", "olmaxon", "белка", "squirrel"), ["yongoq"]],
  [W("🐔", "tovuq", "курица", "hen"), ["jozi", "chuvalchang"]],
  [W("🐎", "ot", "лошадь", "horse"), ["pichan", "olma"]],
  [W("🐻", "ayiq", "медведь", "bear"), ["asal", "baliq"]],
  [W("🐝", "ari", "пчела", "bee"), ["gul"]],
  [W("🐑", "qo‘y", "овца", "sheep"), ["ot", "pichan"]],
  [W("🐐", "echki", "коза", "goat"), ["barg", "karam"]],
  [W("🐭", "sichqon", "мышь", "mouse"), ["pishloq", "jozi"]],
  [W("🐼", "panda", "панда", "panda"), ["bambuk"]],
  [W("🦒", "jirafa", "жираф", "giraffe"), ["barg"]],
  [W("🐧", "pingvin", "пингвин", "penguin"), ["baliq"]],
  [W("🐸", "qurbaqa", "лягушка", "frog"), ["chivin"]],
  [W("🦋", "kapalak", "бабочка", "butterfly"), ["gul"]],
  [W("🦁", "sher", "лев", "lion"), ["gosht"]],
  [W("🐘", "fil", "слон", "elephant"), ["banan", "ot"]],
  [W("🦆", "o‘rdak", "утка", "duck"), ["non"]],
  [W("🦜", "to‘tiqush", "попугай", "parrot"), ["banan", "olma"]],
  [W("🦔", "tipratikan", "ёж", "hedgehog"), ["chuvalchang", "olma"]],
  [W("🦊", "tulki", "лиса", "fox"), ["sichqon"]],
  [W("🐫", "tuya", "верблюд", "camel"), ["tikan"]],
  [W("🐺", "bo‘ri", "волк", "wolf"), ["gosht"]],
  [W("🐋", "kit", "кит", "whale"), ["baliq"]],
  [W("🕊️", "kaptar", "голубь", "pigeon"), ["jozi", "non"]],
];
/** «Bu ham yeydi» — savolga chiqmaydi, lekin XATO variant bo'lib ham tushmaydi (bola chalg'imasin). */
const HAM = { mushuk: ["gosht", "pishloq"], it: ["non", "baliq"], quyon: ["ot", "olma", "pichan"], sigir: ["karam", "sabzi", "jozi"], maymun: ["olma", "barg", "yongoq"],
  olmaxon: ["urug", "olma", "jozi"], tovuq: ["urug", "non", "pichan"], ot: ["sabzi", "ot", "jozi"], ayiq: ["olma", "yongoq", "gosht", "chuvalchang", "banan"],
  "qo‘y": ["barg", "karam", "olma"], echki: ["ot", "pichan", "olma", "sabzi"], sichqon: ["non", "urug", "olma", "yongoq"], fil: ["barg", "olma", "pichan", "sabzi"],
  "o‘rdak": ["chuvalchang", "baliq", "urug", "jozi"], tipratikan: ["chivin", "barg"], tulki: ["gosht", "olma"], tuya: ["ot", "pichan", "barg"], kaptar: ["urug"],
  "to‘tiqush": ["yongoq", "jozi"], "bo‘ri": ["suyak"], sher: ["suyak"], jirafa: ["ot"], panda: ["barg"], kit: [], pingvin: [], qurbaqa: ["chuvalchang"], ari: [], kapalak: [] };
export const HAYVON_HAM = Object.fromEntries(HAYVON.map(([h, ov]) => [h.s.uz, [...ov, ...(HAM[h.s.uz] || [])].map((k) => OVQAT[k].s.uz)]));
/** ULASH formatidagi juftlar: [hayvon, ovqat] — har ovqat uchun alohida juft. */
export const HAYVON_OVQAT_JUFT = HAYVON.flatMap(([h, ov]) => ov.map((k) => [h, OVQAT[k]]));
