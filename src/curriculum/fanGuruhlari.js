// REV168: fanlar guruhi va belgisi (emblema) — bog'chada ham, 1–11 sinfda ham bir xil: «Maktab fanlari», «Tillar», «Ijod va sport».
// Sof funksiyalar (DOM'siz sinaladi).

export const FAN_GURUHLARI = [
  ["maktab", "📚", "Maktab fanlari"],
  ["til", "🌍", "Tillar"],
  ["ijod", "🎨", "Ijod va sport"],
];

const izohsiz = (nom) => String(nom || "").replace(/\(\s*izoh[^)]*\)/gi, "").trim();
const ONA = /ona tili|o.?zbek tili|adabiyot|savod|nutq|alifbe|o.?qish/i;
const TIL = /ingliz|english|\brus\b|rus tili|russian|nemis|german|fransuz|french|ispan|spanish|arab|turk tili|koreys|korean|yapon|japan|xitoy|chinese|chet til|foreign/i;
const IJOD = /musiqa|music|tasviriy|rasm|jismoniy|sport|texnolog|mehnat|chizmachilik|shaxmat|xoreograf|raqs/i;

/** Fan qaysi guruhda: maktab | til | ijod. Ona tili va adabiyot — maktab fani. */
export function fanGuruhi(nom) {
  const t = izohsiz(nom);
  if (ONA.test(t)) return "maktab";
  if (TIL.test(t)) return "til";
  if (IJOD.test(t)) return "ijod";
  return "maktab";
}

const EMBLEMA = [
  [/algebra/i, "➗"], [/geometr/i, "📐"], [/matem|hisob|sanoq|math/i, "🔢"], [/fizika|physics/i, "⚛️"], [/kimyo|chemi/i, "🧪"],
  [/biolog|tabiiy fan|tabiatshunos/i, "🧬"], [/geograf/i, "🌍"], [/tarix|history/i, "🏛️"], [/informatika|kompyuter|computer|dasturlash/i, "💻"],
  [/adabiyot|literat/i, "📚"], [/ona tili|o.?zbek tili|savod|alifbe|o.?qish/i, "📖"], [/huquq|davlat|konstitutsiya/i, "⚖️"],
  [/jismoniy|sport/i, "⚽"], [/tarbiya|odobnoma|etika/i, "🤝"], [/iqtisod/i, "💰"], [/astronom/i, "🔭"], [/chizmachilik/i, "✏️"], [/texnolog|mehnat/i, "🔧"],
  [/musiqa|music/i, "🎵"], [/tasviriy|rasm/i, "🎨"], [/jismoniy|sport/i, "⚽"], [/shaxmat/i, "♟️"], [/mantiq|logic/i, "🧩"],
  [/atrof|tabiat|olam/i, "🌳"], [/ingliz|english/i, "🇬🇧"], [/\brus\b|rus tili|russian/i, "🇷🇺"], [/arab/i, "🇸🇦"], [/turk/i, "🇹🇷"],
  [/nemis|german/i, "🇩🇪"], [/fransuz|french/i, "🇫🇷"], [/ispan|spanish/i, "🇪🇸"], [/koreys|korean/i, "🇰🇷"], [/yapon|japan/i, "🇯🇵"],
  [/xitoy|chinese/i, "🇨🇳"],
];

/** Fan belgisi (emblema). */
export function fanEmblema(nom) {
  const t = izohsiz(nom);
  return EMBLEMA.find(([re]) => re.test(t))?.[1] || "📘";
}

/** Fanlarni guruhlarga ajratadi (bo'sh guruh chiqmaydi). nomOf — fan obyektidan nom. */
export function guruhla(fanlar = [], nomOf = (f) => f.nom) {
  return FAN_GURUHLARI.map(([id, emoji, nom]) => ({ id, emoji, nom, fanlar: fanlar.filter((f) => fanGuruhi(nomOf(f)) === id) }))
    .filter((g) => g.fanlar.length);
}

/** Mavzular bob (bo'lim) bo'yicha: [{bob, mavzular:[{...mavzu, raqam}]}]; bob bo'lmasa — bitta guruh. */
export function bobBoyicha(mavzular = []) {
  const out = [];
  mavzular.forEach((m, i) => {
    const bob = String(m.bob || "").trim();
    const oxirgi = out[out.length - 1];
    if (oxirgi && oxirgi.bob === bob) oxirgi.mavzular.push({ ...m, raqam: i + 1 });
    else out.push({ bob, mavzular: [{ ...m, raqam: i + 1 }] });
  });
  return out;
}
