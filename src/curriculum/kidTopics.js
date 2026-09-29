// REV80: bog'cha mavzulari — katta rasmli kartalar uchun emoji va ranglar (sof funksiyalar).
const KEYS = [
  [/bayram/i, '🎉'], [/takror/i, '🔁'], [/\bnol\b/i, '0️⃣'], [/qo.?shish|qo.?shamiz|\+/i, '➕'], [/ayirish|ayiramiz/i, '➖'],
  [/soat|vaqt/i, '🕐'], [/o.?lcha|uzun|qisqa/i, '📏'], [/og.?ir|yengil/i, '⚖️'], [/labirint|yo.?l top/i, '🧭'],
  [/katta|kichik/i, '🐘'], [/juft/i, '🧦'], [/naqsh/i, '🟥'], [/masala/i, '🧮'], [/pul|tanga|so.?m/i, '🪙'],
  [/oy\b|oylar|kalendar/i, '🗓️'], [/tarkib/i, '🧩'], [/qush/i, '🐦'], [/baliq/i, '🐟'], [/hasharot|\bari\b|kapalak/i, '🐝'],
  [/daraxt|gul\b|gullar/i, '🌳'], [/quyosh|oy va yulduz/i, '☀️'], [/yomg.?ir|bulut/i, '🌧️'], [/qor|qish/i, '❄️'],
  [/xavfsiz|olov|chiroq/i, '🚦'], [/magnit|ixtiro|tajriba/i, '🧲'], [/shahar|mahalla|o.?zbekiston/i, '🏙️'],
  [/yurak|a.?zo|sog.?liq/i, '❤️‍🩹'], [/axlat|asra/i, '♻️'], [/suv\b/i, '💧'],
  [/salom|xayr|hello/i, '👋'], [/ism|name/i, '🙋'], [/rang|colou?r/i, '🌈'], [/hayvon|animal/i, '🐾'],
  [/sana|son|count|raqam/i, '🔢'], [/o.?yinchoq|toy/i, '🧸'], [/oila|family|do.?st/i, '👨‍👩‍👧'], [/tana|body/i, '🙆'],
  [/meva|fruit/i, '🍎'], [/ovqat|food/i, '🍞'], [/kiyim|cloth/i, '👕'], [/uyim|\buy\b|house|home/i, '🏠'],
  [/ob-?havo|weather/i, '⛅'], [/kasb|job/i, '👩‍⚕️'], [/transport/i, '🚌'], [/maktab|school/i, '🎒'],
  [/hafta|kun|day/i, '📅'], [/do.?kon|shop/i, '🛒'], [/like|yaxshi ko/i, '❤️'], [/have|menda bor/i, '🎁'],
  [/nima|what/i, '❓'], [/can|qila olas/i, '🤸'], [/o.?zim|about me/i, '😊'], [/shakl|shape/i, '🔺'],
  [/tabiat|o.?simlik|plant/i, '🌱'], [/fasl|season/i, '🍂'], [/suv|water/i, '💧'], [/shaxmat|shashka|chess/i, '♟️'],
];
const FALLBACK = ['⭐', '🎈', '🌟', '🎨', '🪁', '🌼'];
const COLORS = ['#FFE7B3', '#D8F0FF', '#FFD9E8', '#DDF5D8', '#EBDDFF', '#FFE0CC'];

export function kidTopicEmoji(name, index = 0) {
  const text = String(name || '');
  const hit = KEYS.find(([re]) => re.test(text));
  return hit ? hit[1] : FALLBACK[index % FALLBACK.length];
}
export function kidTopicColor(index = 0) {
  return COLORS[index % COLORS.length];
}
export function capitalizeTopic(name) {
  const text = String(name || '').trim();
  return text ? text[0].toLocaleUpperCase('uz') + text.slice(1) : text;
}
