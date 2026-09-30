// REV80: bog'cha mavzulari — katta rasmli kartalar uchun emoji va ranglar (sof funksiyalar).
const KEYS = [
  // REV90: har dars o'z rasmiga ega bo'lsin (o'qiy olmaydigan bola kartani rasmidan taniydi)
  [/o.?tgan yil/i, '🔁'], [/xayrli tong|xayrli tun|tong|kech\b|morning|night/i, '🌅'], [/shifokor|doctor/i, '🩺'], [/avtobus|\bbus\b/i, '🚌'], [/mashina|\bcar\b/i, '🚗'],
  [/poyezd|samolyot|train|plane/i, '✈️'], [/kitob|qalam|book|pen\b/i, '📚'], [/velosiped|bike/i, '🚲'],
  [/futbol|sport/i, '⚽'], [/sabzavot|vegetable/i, '🥕'], [/bozor|market|savat|basket/i, '🧺'], [/telefon|phone/i, '📱'],
  [/nonushta|breakfast|oshxona|kitchen/i, '🍳'], [/tug.?ilgan kun|birthday/i, '🎂'], [/hayvonot bog|\bzoo\b/i, '🦁'],
  [/\bpark\b|bog.?da/i, '🌳'], [/rahmat|thank/i, '🙏'], [/\bbye\b|xayr/i, '👋'], [/yordam|help/i, '🤝'],
  [/qayerda|where/i, '📍'], [/qaychi|chizg.?ich|scissors/i, '✂️'], [/tong|kech|morning|night/i, '🌅'],
  [/qaysi kun|bugun|today/i, '📅'], [/o.?n bir|o.?n besh|yigirma|sanaymiz|nechta|how many/i, '🔢'],
  [/rejalashtir|plan/i, '📝'], [/yaxshi ko.?raman|love/i, '❤️'], [/bu - men|men haqimda|about me/i, '😊'],
  [/tingla|listen/i, '👂'], [/o.?rningdan tur|stand up|harakat/i, '🤸'], [/kim bo.?lmoqchi|qahramon|kasb/i, '👩‍🚒'],
  [/maktab|sinf|school/i, '🎒'], [/telefonda|do.?st/i, '🧑‍🤝‍🧑'], [/yashayman|\blive\b/i, '🏡'], [/ismim|yoshim|my name/i, '🙋'],
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

const SUBJECTS = [
  [/matem/i, '🔢'], [/atrof|tabiat/i, '🌳'], [/ingliz|english/i, '🇬🇧'], [/rus/i, '🇷🇺'], [/arab/i, '🇸🇦'], [/turk/i, '🇹🇷'],
  [/nemis|german/i, '🇩🇪'], [/fransuz|french/i, '🇫🇷'], [/ispan|spanish/i, '🇪🇸'], [/koreys|korean/i, '🇰🇷'], [/yapon|japan/i, '🇯🇵'],
  [/xitoy|chinese/i, '🇨🇳'], [/ona tili|o.?zbek|savod|nutq/i, '📖'], [/rasm|tasviriy/i, '🎨'], [/musiqa/i, '🎵'],
  [/jismoniy|sport/i, '⚽'], [/shaxmat/i, '♟️'], [/mantiq/i, '🧩'],
];
export function kidSubjectEmoji(name) {
  const hit = SUBJECTS.find(([re]) => re.test(String(name || '')));
  return hit ? hit[1] : '📚';
}
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
