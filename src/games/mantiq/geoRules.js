// REV531: tabiat va geografiya o'yinlari — O'zbekiston viloyatlari (sxematik xarita), poytaxt va bayroqlar, tabiat zonalari.
import { tasodif } from "./mantiqRules.js";
const but = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const aralash = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const dar = (d) => Math.max(0, Math.min(2, d));

// [kalit, nom, markaz, sxematik ko'pburchak (viewBox 0 0 300 200), yozuv o'rni [x, y], mashhur joyi]
export const VILOYATLAR = [
  ["qq", "Qoraqalpog‘iston", "Nukus", "10,20 95,8 120,30 118,75 100,95 78,100 60,82 40,95 12,70", [62, 48], "Orol dengizi"],
  ["xo", "Xorazm", "Urganch", "60,82 78,100 70,112 52,104", [65, 100], "Ichan qal’a (Xiva)"],
  ["na", "Navoiy", "Navoiy", "120,30 150,34 172,60 176,92 160,108 140,100 118,104 100,95 118,75", [142, 70], "Muruntov oltin koni"],
  ["bu", "Buxoro", "Buxoro", "78,100 100,95 118,104 140,100 146,122 128,140 100,138 84,120 70,112", [108, 119], "Ark qal’asi"],
  ["sa", "Samarqand", "Samarqand", "160,108 176,92 196,100 202,118 186,128 166,126 146,122 140,100", [172, 113], "Registon maydoni"],
  ["qa", "Qashqadaryo", "Qarshi", "128,140 146,122 166,126 186,128 196,146 180,162 152,160 136,152", [160, 144], "Shahrisabz (Oqsaroy)"],
  ["su", "Surxondaryo", "Termiz", "196,146 186,128 202,118 214,134 216,162 204,182 190,172 180,162", [201, 152], "Boysun tog‘lari"],
  ["ji", "Jizzax", "Jizzax", "172,60 198,62 214,78 220,96 202,118 196,100 176,92", [197, 86], "Zomin milliy bog‘i"],
  ["si", "Sirdaryo", "Guliston", "214,78 226,70 234,84 228,98 220,96", [225, 86], "Mirzacho‘l paxtazorlari"],
  ["tv", "Toshkent viloyati", "Nurafshon", "198,62 214,44 240,30 258,44 250,62 262,74 248,84 234,84 226,70 214,78", [233, 46], "Chorvoq suv ombori"],
  ["nm", "Namangan", "Namangan", "250,62 262,56 284,60 286,72 268,76 262,74", [270, 66], "Chust pichoqlari"],
  ["an", "Andijon", "Andijon", "286,72 298,76 296,90 280,86 276,78", [288, 82], "Bobur bog‘i"],
  ["fa", "Farg‘ona", "Farg‘ona", "262,74 268,76 276,78 280,86 272,94 256,92 248,84", [265, 86], "Qo‘qon xonlari saroyi"],
];
/** d0: xaritadan viloyatni top; d1: viloyat markazi (variantli) va markazdan viloyatni top; d2: + mashhur joy qaysi viloyatda. 8 ta savol. */
export function viloyatYasa(urug = 1, d = 0, soni = 8) {
  const r = tasodif(urug * 97 + dar(d) * 2003); const tartib = aralash([...VILOYATLAR.keys()], r).slice(0, soni);
  return tartib.map((i) => { const [k, nom, markaz, , , joy] = VILOYATLAR[i]; const tur = d === 0 ? "xarita" : ["xarita", "markaz", "markazdan", ...(d === 2 ? ["joy", "joy"] : [])][but(r, 0, d === 2 ? 4 : 2)];
    if (tur === "xarita") return { tur, matn: nom, javob: k, izoh: `${nom} — markazi ${markaz}` };
    if (tur === "markazdan") return { tur: "xarita", matn: `Markazi ${markaz} bo‘lgan hudud`, javob: k, izoh: `${markaz} — ${nom} markazi` };
    if (tur === "joy") return { tur: "xarita", matn: `${joy} joylashgan hudud`, javob: k, izoh: `${joy} — ${nom}` };
    const boshqa = aralash(VILOYATLAR.filter((_, x) => x !== i).map((v) => v[2]).filter((m) => m !== markaz), r).slice(0, 3); const v = aralash([markaz, ...boshqa], r);
    return { tur: "markaz", matn: nom, javob: k, variantlar: v, togri: v.indexOf(markaz), izoh: `${nom} — markazi ${markaz}` }; });
}

// [bayroq, davlat, poytaxt, daraja]
export const DAVLATLAR = [
  ["🇺🇿", "O‘zbekiston", "Toshkent", 0], ["🇰🇿", "Qozog‘iston", "Ostona", 0], ["🇰🇬", "Qirg‘iziston", "Bishkek", 0], ["🇹🇯", "Tojikiston", "Dushanbe", 0], ["🇹🇲", "Turkmaniston", "Ashxobod", 0],
  ["🇷🇺", "Rossiya", "Moskva", 0], ["🇨🇳", "Xitoy", "Pekin", 0], ["🇹🇷", "Turkiya", "Anqara", 0], ["🇺🇸", "AQSH", "Vashington", 0], ["🇬🇧", "Buyuk Britaniya", "London", 0],
  ["🇫🇷", "Fransiya", "Parij", 0], ["🇩🇪", "Germaniya", "Berlin", 0], ["🇯🇵", "Yaponiya", "Tokio", 0], ["🇮🇳", "Hindiston", "Nyu-Dehli", 0], ["🇮🇹", "Italiya", "Rim", 0], ["🇪🇬", "Misr", "Qohira", 0],
  ["🇦🇫", "Afg‘oniston", "Kobul", 1], ["🇮🇷", "Eron", "Tehron", 1], ["🇵🇰", "Pokiston", "Islomobod", 1], ["🇦🇿", "Ozarbayjon", "Boku", 1], ["🇬🇪", "Gruziya", "Tbilisi", 1], ["🇺🇦", "Ukraina", "Kiyev", 1],
  ["🇪🇸", "Ispaniya", "Madrid", 1], ["🇰🇷", "Janubiy Koreya", "Seul", 1], ["🇸🇦", "Saudiya Arabistoni", "Ar-Riyod", 1], ["🇦🇪", "BAA", "Abu-Dabi", 1], ["🇨🇦", "Kanada", "Ottava", 1], ["🇧🇷", "Braziliya", "Braziliya", 1],
  ["🇦🇺", "Avstraliya", "Kanberra", 1], ["🇵🇱", "Polsha", "Varshava", 1], ["🇬🇷", "Gretsiya", "Afina", 1], ["🇲🇳", "Mo‘g‘uliston", "Ulan-Bator", 1], ["🇮🇩", "Indoneziya", "Jakarta", 1], ["🇲🇽", "Meksika", "Mexiko", 1],
  ["🇨🇭", "Shveytsariya", "Bern", 2], ["🇳🇱", "Niderlandiya", "Amsterdam", 2], ["🇸🇪", "Shvetsiya", "Stokgolm", 2], ["🇳🇴", "Norvegiya", "Oslo", 2], ["🇫🇮", "Finlandiya", "Xelsinki", 2], ["🇵🇹", "Portugaliya", "Lissabon", 2],
  ["🇦🇹", "Avstriya", "Vena", 2], ["🇨🇿", "Chexiya", "Praga", 2], ["🇭🇺", "Vengriya", "Budapesht", 2], ["🇦🇷", "Argentina", "Buenos-Ayres", 2], ["🇿🇦", "Janubiy Afrika", "Pretoriya", 2], ["🇳🇬", "Nigeriya", "Abuja", 2],
  ["🇰🇪", "Keniya", "Nayrobi", 2], ["🇹🇭", "Tailand", "Bangkok", 2], ["🇻🇳", "Vyetnam", "Xanoy", 2], ["🇲🇾", "Malayziya", "Kuala-Lumpur", 2], ["🇳🇿", "Yangi Zelandiya", "Vellington", 2], ["🇧🇾", "Belarus", "Minsk", 2],
];
/** 8 ta savol: bayroq → davlat, davlat → poytaxt, poytaxt → davlat. */
export function davlatYasa(urug = 1, d = 0, soni = 8) {
  const r = tasodif(urug * 101 + dar(d) * 2111); const hovuz = DAVLATLAR.filter((x) => x[3] <= dar(d)); const asosiy = aralash(hovuz.filter((x) => x[3] === dar(d) || r() < 0.3), r).slice(0, soni);
  return asosiy.map((x) => { const tur = ["bayroq", "poytaxt", "davlat"][but(r, 0, 2)]; const boshqa = aralash(hovuz.filter((y) => y !== x), r).slice(0, 3);
    const ol = (y) => (tur === "poytaxt" ? y[2] : y[1]); const v = aralash([x, ...boshqa], r);
    return { tur, matn: tur === "bayroq" ? x[0] : tur === "poytaxt" ? x[1] : x[2], variantlar: v.map(ol), togri: v.indexOf(x), izoh: `${x[0]} ${x[1]} — poytaxti ${x[2]}` }; });
}

// Tabiat zonalari: [zona, [belgi, tavsif]…]
export const ZONALAR = [
  ["tundra", [["🦌", "shimol bug‘usi"], ["🧊", "yer yil bo‘yi muzlagan"], ["🌱", "yo‘sin va lishaynik"], ["🦊", "qutb tulkisi"]]],
  ["tayga", [["🌲", "ignabargli qalin o‘rmon"], ["🐻", "qo‘ng‘ir ayiq"], ["🐿️", "olmaxon va qarag‘ay yong‘og‘i"], ["🦉", "ukki"]]],
  ["dasht", [["🌾", "keng o‘tloq, daraxt kam"], ["🐎", "yovvoyi otlar uyuri"], ["🦅", "dasht burguti"], ["🌻", "unumdor qora tuproq"]]],
  ["cho‘l", [["🐪", "tuya"], ["🌵", "saksovul va yantoq"], ["🦎", "echkemar"], ["☀️", "yozda juda issiq, yog‘in juda kam"]]],
  ["savanna", [["🦒", "jirafa"], ["🦁", "sher"], ["🦓", "zebra"], ["🌳", "baobab va akatsiya; quruq va yomg‘irli mavsum"]]],
  ["nam tropik o‘rmon", [["🦜", "to‘tiqush"], ["🐒", "maymunlar"], ["🌴", "yil bo‘yi issiq va sernam"], ["🐍", "anakonda"]]],
  ["tog‘", [["🐐", "tog‘ echkisi"], ["🏔️", "cho‘qqida doimiy qor"], ["🐆", "qor qoploni"], ["🌼", "balandlikka qarab o‘simlik o‘zgaradi"]]],
  ["qutb muzliklari", [["🐧", "pingvin"], ["🐻‍❄️", "oq ayiq"], ["❄️", "yil bo‘yi qor va muz"], ["🦭", "tyulen"]]],
];
export function zonaYasa(urug = 1, d = 0, soni = 8) {
  const r = tasodif(urug * 103 + dar(d) * 2203); const zonalar = ZONALAR.slice(0, [5, 7, 8][dar(d)] + (dar(d) === 0 ? 0 : 0));
  const hamma = aralash(zonalar.flatMap(([z, xs], zi) => xs.map((x) => ({ zi, z, x }))), r).slice(0, soni);
  return hamma.map(({ zi, z, x }) => { const boshqa = aralash(zonalar.map((q) => q[0]).filter((_, k) => k !== zi), r).slice(0, d === 0 ? 2 : 3); const v = aralash([z, ...boshqa], r);
    return { belgi: x[0], matn: x[1], variantlar: v, togri: v.indexOf(z), izoh: `${x[0]} ${x[1]} — ${z}` }; });
}
