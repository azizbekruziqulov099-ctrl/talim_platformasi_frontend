import { de as _de, es as _es } from "./ozgaTillar.js";   // REV523: nemischa va ispancha tarjimalar
// REV450: «Hayvonni boq» — har hayvonga mos ovqatlar (bir nechta to'g'ri javob bo'lishi mumkin: mushuk — sut, sichqon, baliq).
// O'yinda variantlar orasiga shu hayvonning boshqa ovqati «xato» bo'lib tushmaydi.
const W = (e, uz, ru, en) => ({ e, s: { uz, ru, en, de: _de(en), es: _es(en) } });
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
const HAM = { mushuk: ["gosht", "pishloq"], it: ["non", "baliq", "sut", "pishloq"], quyon: ["ot", "olma", "pichan", "barg"], sigir: ["karam", "sabzi", "jozi", "barg", "olma"],
  maymun: ["olma", "barg", "yongoq", "jozi", "sabzi"], olmaxon: ["urug", "olma", "jozi"], tovuq: ["urug", "non", "pichan", "ot", "karam", "chivin", "barg"],
  ot: ["sabzi", "ot", "jozi", "karam", "non", "barg"], ayiq: ["olma", "yongoq", "gosht", "chuvalchang", "banan", "sichqon", "barg"],
  "qo‘y": ["barg", "karam", "olma", "sabzi", "jozi"], echki: ["ot", "pichan", "olma", "sabzi", "jozi"], sichqon: ["non", "urug", "olma", "yongoq", "sabzi", "banan"],
  fil: ["barg", "olma", "pichan", "sabzi", "karam", "jozi"], "o‘rdak": ["chuvalchang", "baliq", "urug", "jozi", "ot", "chivin"], tipratikan: ["chivin", "barg", "sichqon"],
  tulki: ["gosht", "olma", "baliq", "suyak"], tuya: ["ot", "pichan", "barg", "karam", "sabzi", "olma"], kaptar: ["urug"], "to‘tiqush": ["yongoq", "jozi", "sabzi", "non"],
  "bo‘ri": ["suyak", "sichqon", "baliq"], sher: ["suyak", "sichqon", "baliq"], jirafa: ["ot", "pichan"], panda: ["barg"], kit: [], pingvin: [], qurbaqa: ["chuvalchang"],
  ari: ["asal"], kapalak: ["asal"] };   // REV523: «bu ham yeydi» ro'yxati kengaytirildi — to'g'ri bo'lishi mumkin bo'lgan javob «xato» deb chiqmasin
export const HAYVON_HAM = Object.fromEntries(HAYVON.map(([h, ov]) => [h.s.uz, [...ov, ...(HAM[h.s.uz] || [])].map((k) => OVQAT[k].s.uz)]));
/** ULASH formatidagi juftlar: [hayvon, ovqat] — har ovqat uchun alohida juft. */
export const HAYVON_OVQAT_JUFT = HAYVON.flatMap(([h, ov]) => ov.map((k) => [h, OVQAT[k]]));
