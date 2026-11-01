// REV110: jonli ustozlar — pozalar, yuz kadrlari (gapirish, pirpiratish) va xonalar. Avtomatik yasalgan (tools: ustoz_assets).
// Rasmlar Vite orqali xeshlangan nom bilan chiqadi — CDN va brauzer ularni uzoq saqlaydi.
// REV120: Vite rasmlarni faqat statik ko'rinishda yig'adi — import.meta.glob bilan hammasi build'ga kiradi
// (oldingi new URL(p, import.meta.url) yordamchi funksiya ichida bo'lgani uchun production'da rasm chiqmasdi).
let RASM = {};
try { RASM = import.meta.glob("./ustoz/**/*.webp", { eager: true, query: "?url", import: "default" }); } catch { RASM = {}; }
const u = (p) => RASM[p] || p;

// REV158: og'iz endi HAMMA pozada (ko'rsatish, o'ylash, quvonish, tinglash ham) — ustoz gapirganda labi doim qimirlaydi.
// REV167: tw — og'iz atrofidagi teri dog'ining eni (%, odatda 185); yuz yon tomonga burilgan pozada kichikroq — yonoq chizig'i o'chmaydi.
// REV153: og — og'iz markazi va eni (pozaga nisbatan foizda) hamda atrofidagi teri rangi (eski og'iz yashiriladi)
// REV240: 19 ustoz — rassom chizgan yangi rasmlar. REV245: yuz kadri faqat og'iz va ko'z joyi (soch, quloq ustiga chiqmaydi).
export const USTOZLAR = {
  anna: {
    lab: "ayol",
    1: { src: u("./ustoz/anna/poza_1.webp"), w: 294, h: 540, yuz: { x: 28.631, y: 6.546, w: 34.855, h: 15.801, kadr: [u("./ustoz/anna/yuz_1_1.webp"), u("./ustoz/anna/yuz_1_2.webp"), u("./ustoz/anna/yuz_1_3.webp"), u("./ustoz/anna/yuz_1_4.webp"), u("./ustoz/anna/yuz_1_5.webp"), u("./ustoz/anna/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/anna/poza_2.webp"), w: 215, h: 540, yuz: { x: 27.401, y: 6.854, w: 47.458, h: 15.281, kadr: [u("./ustoz/anna/yuz_2_1.webp"), u("./ustoz/anna/yuz_2_2.webp"), u("./ustoz/anna/yuz_2_3.webp"), u("./ustoz/anna/yuz_2_4.webp"), u("./ustoz/anna/yuz_2_5.webp"), u("./ustoz/anna/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/anna/poza_3.webp"), w: 282, h: 540, yuz: { x: 18.103, y: 7.191, w: 34.483, h: 14.494, kadr: [u("./ustoz/anna/yuz_3_1.webp"), u("./ustoz/anna/yuz_3_2.webp"), u("./ustoz/anna/yuz_3_3.webp"), u("./ustoz/anna/yuz_3_4.webp"), u("./ustoz/anna/yuz_3_5.webp"), u("./ustoz/anna/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/anna/poza_4.webp"), w: 194, h: 540, yuz: { x: 22.571, y: 6.659, w: 49.216, h: 15.35, kadr: [u("./ustoz/anna/yuz_4_1.webp"), u("./ustoz/anna/yuz_4_2.webp"), u("./ustoz/anna/yuz_4_3.webp"), u("./ustoz/anna/yuz_4_4.webp"), u("./ustoz/anna/yuz_4_5.webp"), u("./ustoz/anna/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/anna/poza_5.webp"), w: 215, h: 540, yuz: { x: 20.455, y: 6.659, w: 47.159, h: 15.576, kadr: [u("./ustoz/anna/yuz_5_1.webp"), u("./ustoz/anna/yuz_5_2.webp"), u("./ustoz/anna/yuz_5_3.webp"), u("./ustoz/anna/yuz_5_4.webp"), u("./ustoz/anna/yuz_5_5.webp"), u("./ustoz/anna/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/anna/poza_6.webp"), w: 184, h: 540, yuz: { x: 22.442, y: 6.854, w: 55.776, h: 15.281, kadr: [u("./ustoz/anna/yuz_6_1.webp"), u("./ustoz/anna/yuz_6_2.webp"), u("./ustoz/anna/yuz_6_3.webp"), u("./ustoz/anna/yuz_6_4.webp"), u("./ustoz/anna/yuz_6_5.webp"), u("./ustoz/anna/yuz_6_6.webp")] } },
  },
  camille: {
    lab: "ayol",
    1: { src: u("./ustoz/camille/poza_1.webp"), w: 289, h: 540, yuz: { x: 32.353, y: 7.64, w: 36.134, h: 16.292, kadr: [u("./ustoz/camille/yuz_1_1.webp"), u("./ustoz/camille/yuz_1_2.webp"), u("./ustoz/camille/yuz_1_3.webp"), u("./ustoz/camille/yuz_1_4.webp"), u("./ustoz/camille/yuz_1_5.webp"), u("./ustoz/camille/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/camille/poza_2.webp"), w: 208, h: 540, yuz: { x: 34.897, y: 7.901, w: 46.921, h: 15.688, kadr: [u("./ustoz/camille/yuz_2_1.webp"), u("./ustoz/camille/yuz_2_2.webp"), u("./ustoz/camille/yuz_2_3.webp"), u("./ustoz/camille/yuz_2_4.webp"), u("./ustoz/camille/yuz_2_5.webp"), u("./ustoz/camille/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/camille/poza_3.webp"), w: 271, h: 540, yuz: { x: 10.36, y: 7.562, w: 39.189, h: 16.479, kadr: [u("./ustoz/camille/yuz_3_1.webp"), u("./ustoz/camille/yuz_3_2.webp"), u("./ustoz/camille/yuz_3_3.webp"), u("./ustoz/camille/yuz_3_4.webp"), u("./ustoz/camille/yuz_3_5.webp"), u("./ustoz/camille/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/camille/poza_4.webp"), w: 175, h: 540, yuz: { x: 24.221, y: 7.978, w: 58.478, h: 16.629, kadr: [u("./ustoz/camille/yuz_4_1.webp"), u("./ustoz/camille/yuz_4_2.webp"), u("./ustoz/camille/yuz_4_3.webp"), u("./ustoz/camille/yuz_4_4.webp"), u("./ustoz/camille/yuz_4_5.webp"), u("./ustoz/camille/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/camille/poza_5.webp"), w: 224, h: 540, yuz: { x: 22.642, y: 7.951, w: 42.588, h: 15.789, kadr: [u("./ustoz/camille/yuz_5_1.webp"), u("./ustoz/camille/yuz_5_2.webp"), u("./ustoz/camille/yuz_5_3.webp"), u("./ustoz/camille/yuz_5_4.webp"), u("./ustoz/camille/yuz_5_5.webp"), u("./ustoz/camille/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/camille/poza_6.webp"), w: 179, h: 540, yuz: { x: 28.231, y: 7.901, w: 52.041, h: 15.576, kadr: [u("./ustoz/camille/yuz_6_1.webp"), u("./ustoz/camille/yuz_6_2.webp"), u("./ustoz/camille/yuz_6_3.webp"), u("./ustoz/camille/yuz_6_4.webp"), u("./ustoz/camille/yuz_6_5.webp"), u("./ustoz/camille/yuz_6_6.webp")] } },
  },
  carlos: {
    lab: "erkak",
    1: { src: u("./ustoz/carlos/poza_1.webp"), w: 302, h: 540, yuz: { x: 30.6, y: 7.271, w: 32.8, h: 14.541, kadr: [u("./ustoz/carlos/yuz_1_1.webp"), u("./ustoz/carlos/yuz_1_2.webp"), u("./ustoz/carlos/yuz_1_3.webp"), u("./ustoz/carlos/yuz_1_4.webp"), u("./ustoz/carlos/yuz_1_5.webp"), u("./ustoz/carlos/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/carlos/poza_2.webp"), w: 199, h: 540, yuz: { x: 29.321, y: 7.403, w: 49.691, h: 14.465, kadr: [u("./ustoz/carlos/yuz_2_1.webp"), u("./ustoz/carlos/yuz_2_2.webp"), u("./ustoz/carlos/yuz_2_3.webp"), u("./ustoz/carlos/yuz_2_4.webp"), u("./ustoz/carlos/yuz_2_5.webp"), u("./ustoz/carlos/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/carlos/poza_3.webp"), w: 268, h: 540, yuz: { x: 14.679, y: 7.298, w: 36.468, h: 15.051, kadr: [u("./ustoz/carlos/yuz_3_1.webp"), u("./ustoz/carlos/yuz_3_2.webp"), u("./ustoz/carlos/yuz_3_3.webp"), u("./ustoz/carlos/yuz_3_4.webp"), u("./ustoz/carlos/yuz_3_5.webp"), u("./ustoz/carlos/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/carlos/poza_4.webp"), w: 193, h: 540, yuz: { x: 15.047, y: 6.152, w: 51.724, h: 14.989, kadr: [u("./ustoz/carlos/yuz_4_1.webp"), u("./ustoz/carlos/yuz_4_2.webp"), u("./ustoz/carlos/yuz_4_3.webp"), u("./ustoz/carlos/yuz_4_4.webp"), u("./ustoz/carlos/yuz_4_5.webp"), u("./ustoz/carlos/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/carlos/poza_5.webp"), w: 217, h: 540, yuz: { x: 30.833, y: 6.376, w: 45.0, h: 13.423, kadr: [u("./ustoz/carlos/yuz_5_1.webp"), u("./ustoz/carlos/yuz_5_2.webp"), u("./ustoz/carlos/yuz_5_3.webp"), u("./ustoz/carlos/yuz_5_4.webp"), u("./ustoz/carlos/yuz_5_5.webp"), u("./ustoz/carlos/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/carlos/poza_6.webp"), w: 172, h: 540, yuz: { x: 22.064, y: 7.37, w: 57.651, h: 15.079, kadr: [u("./ustoz/carlos/yuz_6_1.webp"), u("./ustoz/carlos/yuz_6_2.webp"), u("./ustoz/carlos/yuz_6_3.webp"), u("./ustoz/carlos/yuz_6_4.webp"), u("./ustoz/carlos/yuz_6_5.webp"), u("./ustoz/carlos/yuz_6_6.webp")] } },
  },
  daniel: {
    lab: "erkak",
    1: { src: u("./ustoz/daniel/poza_1.webp"), w: 312, h: 540, yuz: { x: 31.456, y: 7.52, w: 32.233, h: 15.376, kadr: [u("./ustoz/daniel/yuz_1_1.webp"), u("./ustoz/daniel/yuz_1_2.webp"), u("./ustoz/daniel/yuz_1_3.webp"), u("./ustoz/daniel/yuz_1_4.webp"), u("./ustoz/daniel/yuz_1_5.webp"), u("./ustoz/daniel/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/daniel/poza_2.webp"), w: 210, h: 540, yuz: { x: 26.667, y: 7.788, w: 46.957, h: 12.754, kadr: [u("./ustoz/daniel/yuz_2_1.webp"), u("./ustoz/daniel/yuz_2_2.webp"), u("./ustoz/daniel/yuz_2_3.webp"), u("./ustoz/daniel/yuz_2_4.webp"), u("./ustoz/daniel/yuz_2_5.webp"), u("./ustoz/daniel/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/daniel/poza_3.webp"), w: 280, h: 540, yuz: { x: 16.087, y: 7.788, w: 35.0, h: 12.754, kadr: [u("./ustoz/daniel/yuz_3_1.webp"), u("./ustoz/daniel/yuz_3_2.webp"), u("./ustoz/daniel/yuz_3_3.webp"), u("./ustoz/daniel/yuz_3_4.webp"), u("./ustoz/daniel/yuz_3_5.webp"), u("./ustoz/daniel/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/daniel/poza_4.webp"), w: 199, h: 540, yuz: { x: 19.817, y: 7.753, w: 51.524, h: 13.034, kadr: [u("./ustoz/daniel/yuz_4_1.webp"), u("./ustoz/daniel/yuz_4_2.webp"), u("./ustoz/daniel/yuz_4_3.webp"), u("./ustoz/daniel/yuz_4_4.webp"), u("./ustoz/daniel/yuz_4_5.webp"), u("./ustoz/daniel/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/daniel/poza_5.webp"), w: 219, h: 540, yuz: { x: 27.147, y: 7.969, w: 45.429, h: 12.682, kadr: [u("./ustoz/daniel/yuz_5_1.webp"), u("./ustoz/daniel/yuz_5_2.webp"), u("./ustoz/daniel/yuz_5_3.webp"), u("./ustoz/daniel/yuz_5_4.webp"), u("./ustoz/daniel/yuz_5_5.webp"), u("./ustoz/daniel/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/daniel/poza_6.webp"), w: 199, h: 540, yuz: { x: 21.472, y: 7.675, w: 50.307, h: 15.011, kadr: [u("./ustoz/daniel/yuz_6_1.webp"), u("./ustoz/daniel/yuz_6_2.webp"), u("./ustoz/daniel/yuz_6_3.webp"), u("./ustoz/daniel/yuz_6_4.webp"), u("./ustoz/daniel/yuz_6_5.webp"), u("./ustoz/daniel/yuz_6_6.webp")] } },
  },
  dmitriy: {
    lab: "erkak",
    1: { src: u("./ustoz/dmitriy/poza_1.webp"), w: 306, h: 540, yuz: { x: 33.465, y: 6.846, w: 29.505, h: 14.029, kadr: [u("./ustoz/dmitriy/yuz_1_1.webp"), u("./ustoz/dmitriy/yuz_1_2.webp"), u("./ustoz/dmitriy/yuz_1_3.webp"), u("./ustoz/dmitriy/yuz_1_4.webp"), u("./ustoz/dmitriy/yuz_1_5.webp"), u("./ustoz/dmitriy/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/dmitriy/poza_2.webp"), w: 205, h: 540, yuz: { x: 30.357, y: 6.441, w: 44.94, h: 15.028, kadr: [u("./ustoz/dmitriy/yuz_2_1.webp"), u("./ustoz/dmitriy/yuz_2_2.webp"), u("./ustoz/dmitriy/yuz_2_3.webp"), u("./ustoz/dmitriy/yuz_2_4.webp"), u("./ustoz/dmitriy/yuz_2_5.webp"), u("./ustoz/dmitriy/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/dmitriy/poza_3.webp"), w: 282, h: 540, yuz: { x: 15.184, y: 6.689, w: 31.887, h: 13.946, kadr: [u("./ustoz/dmitriy/yuz_3_1.webp"), u("./ustoz/dmitriy/yuz_3_2.webp"), u("./ustoz/dmitriy/yuz_3_3.webp"), u("./ustoz/dmitriy/yuz_3_4.webp"), u("./ustoz/dmitriy/yuz_3_5.webp"), u("./ustoz/dmitriy/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/dmitriy/poza_4.webp"), w: 187, h: 540, yuz: { x: 19.417, y: 6.264, w: 49.515, h: 14.653, kadr: [u("./ustoz/dmitriy/yuz_4_1.webp"), u("./ustoz/dmitriy/yuz_4_2.webp"), u("./ustoz/dmitriy/yuz_4_3.webp"), u("./ustoz/dmitriy/yuz_4_4.webp"), u("./ustoz/dmitriy/yuz_4_5.webp"), u("./ustoz/dmitriy/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/dmitriy/poza_5.webp"), w: 198, h: 540, yuz: { x: 27.607, y: 6.734, w: 45.706, h: 14.029, kadr: [u("./ustoz/dmitriy/yuz_5_1.webp"), u("./ustoz/dmitriy/yuz_5_2.webp"), u("./ustoz/dmitriy/yuz_5_3.webp"), u("./ustoz/dmitriy/yuz_5_4.webp"), u("./ustoz/dmitriy/yuz_5_5.webp"), u("./ustoz/dmitriy/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/dmitriy/poza_6.webp"), w: 184, h: 540, yuz: { x: 25.581, y: 6.78, w: 49.169, h: 14.237, kadr: [u("./ustoz/dmitriy/yuz_6_1.webp"), u("./ustoz/dmitriy/yuz_6_2.webp"), u("./ustoz/dmitriy/yuz_6_3.webp"), u("./ustoz/dmitriy/yuz_6_4.webp"), u("./ustoz/dmitriy/yuz_6_5.webp"), u("./ustoz/dmitriy/yuz_6_6.webp")] } },
  },
  elif: {
    lab: "ayol",
    1: { src: u("./ustoz/elif/poza_1.webp"), w: 302, h: 540, yuz: { x: 27.912, y: 5.174, w: 36.948, h: 19.01, kadr: [u("./ustoz/elif/yuz_1_1.webp"), u("./ustoz/elif/yuz_1_2.webp"), u("./ustoz/elif/yuz_1_3.webp"), u("./ustoz/elif/yuz_1_4.webp"), u("./ustoz/elif/yuz_1_5.webp"), u("./ustoz/elif/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/elif/poza_2.webp"), w: 214, h: 540, yuz: { x: 36.467, y: 6.652, w: 41.88, h: 14.318, kadr: [u("./ustoz/elif/yuz_2_1.webp"), u("./ustoz/elif/yuz_2_2.webp"), u("./ustoz/elif/yuz_2_3.webp"), u("./ustoz/elif/yuz_2_4.webp"), u("./ustoz/elif/yuz_2_5.webp"), u("./ustoz/elif/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/elif/poza_3.webp"), w: 272, h: 540, yuz: { x: 21.542, y: 6.956, w: 32.653, h: 14.139, kadr: [u("./ustoz/elif/yuz_3_1.webp"), u("./ustoz/elif/yuz_3_2.webp"), u("./ustoz/elif/yuz_3_3.webp"), u("./ustoz/elif/yuz_3_4.webp"), u("./ustoz/elif/yuz_3_5.webp"), u("./ustoz/elif/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/elif/poza_4.webp"), w: 205, h: 540, yuz: { x: 19.104, y: 5.317, w: 51.642, h: 19.005, kadr: [u("./ustoz/elif/yuz_4_1.webp"), u("./ustoz/elif/yuz_4_2.webp"), u("./ustoz/elif/yuz_4_3.webp"), u("./ustoz/elif/yuz_4_4.webp"), u("./ustoz/elif/yuz_4_5.webp"), u("./ustoz/elif/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/elif/poza_5.webp"), w: 203, h: 540, yuz: { x: 29.042, y: 6.524, w: 42.515, h: 14.398, kadr: [u("./ustoz/elif/yuz_5_1.webp"), u("./ustoz/elif/yuz_5_2.webp"), u("./ustoz/elif/yuz_5_3.webp"), u("./ustoz/elif/yuz_5_4.webp"), u("./ustoz/elif/yuz_5_5.webp"), u("./ustoz/elif/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/elif/poza_6.webp"), w: 192, h: 540, yuz: { x: 26.415, y: 6.264, w: 50.629, h: 16.443, kadr: [u("./ustoz/elif/yuz_6_1.webp"), u("./ustoz/elif/yuz_6_2.webp"), u("./ustoz/elif/yuz_6_3.webp"), u("./ustoz/elif/yuz_6_4.webp"), u("./ustoz/elif/yuz_6_5.webp"), u("./ustoz/elif/yuz_6_6.webp")] } },
  },
  emily: {
    lab: "ayol",
    1: { src: u("./ustoz/emily/poza_1.webp"), w: 324, h: 540, yuz: { x: 32.03, y: 7.047, w: 32.588, h: 15.213, kadr: [u("./ustoz/emily/yuz_1_1.webp"), u("./ustoz/emily/yuz_1_2.webp"), u("./ustoz/emily/yuz_1_3.webp"), u("./ustoz/emily/yuz_1_4.webp"), u("./ustoz/emily/yuz_1_5.webp"), u("./ustoz/emily/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/emily/poza_2.webp"), w: 217, h: 540, yuz: { x: 30.337, y: 7.127, w: 49.438, h: 15.271, kadr: [u("./ustoz/emily/yuz_2_1.webp"), u("./ustoz/emily/yuz_2_2.webp"), u("./ustoz/emily/yuz_2_3.webp"), u("./ustoz/emily/yuz_2_4.webp"), u("./ustoz/emily/yuz_2_5.webp"), u("./ustoz/emily/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/emily/poza_3.webp"), w: 283, h: 540, yuz: { x: 15.335, y: 7.37, w: 36.933, h: 14.966, kadr: [u("./ustoz/emily/yuz_3_1.webp"), u("./ustoz/emily/yuz_3_2.webp"), u("./ustoz/emily/yuz_3_3.webp"), u("./ustoz/emily/yuz_3_4.webp"), u("./ustoz/emily/yuz_3_5.webp"), u("./ustoz/emily/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/emily/poza_4.webp"), w: 200, h: 540, yuz: { x: 23.636, y: 7.063, w: 53.636, h: 15.471, kadr: [u("./ustoz/emily/yuz_4_1.webp"), u("./ustoz/emily/yuz_4_2.webp"), u("./ustoz/emily/yuz_4_3.webp"), u("./ustoz/emily/yuz_4_4.webp"), u("./ustoz/emily/yuz_4_5.webp"), u("./ustoz/emily/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/emily/poza_5.webp"), w: 196, h: 540, yuz: { x: 24.923, y: 6.711, w: 52.923, h: 15.101, kadr: [u("./ustoz/emily/yuz_5_1.webp"), u("./ustoz/emily/yuz_5_2.webp"), u("./ustoz/emily/yuz_5_3.webp"), u("./ustoz/emily/yuz_5_4.webp"), u("./ustoz/emily/yuz_5_5.webp"), u("./ustoz/emily/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/emily/poza_6.webp"), w: 186, h: 540, yuz: { x: 24.752, y: 7.029, w: 56.436, h: 14.966, kadr: [u("./ustoz/emily/yuz_6_1.webp"), u("./ustoz/emily/yuz_6_2.webp"), u("./ustoz/emily/yuz_6_3.webp"), u("./ustoz/emily/yuz_6_4.webp"), u("./ustoz/emily/yuz_6_5.webp"), u("./ustoz/emily/yuz_6_6.webp")] } },
  },
  jiwoo: {
    lab: "ayol",
    1: { src: u("./ustoz/jiwoo/poza_1.webp"), w: 295, h: 540, yuz: { x: 32.438, y: 7.441, w: 34.917, h: 15.896, kadr: [u("./ustoz/jiwoo/yuz_1_1.webp"), u("./ustoz/jiwoo/yuz_1_2.webp"), u("./ustoz/jiwoo/yuz_1_3.webp"), u("./ustoz/jiwoo/yuz_1_4.webp"), u("./ustoz/jiwoo/yuz_1_5.webp"), u("./ustoz/jiwoo/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/jiwoo/poza_2.webp"), w: 209, h: 540, yuz: { x: 29.36, y: 7.087, w: 50.291, h: 16.31, kadr: [u("./ustoz/jiwoo/yuz_2_1.webp"), u("./ustoz/jiwoo/yuz_2_2.webp"), u("./ustoz/jiwoo/yuz_2_3.webp"), u("./ustoz/jiwoo/yuz_2_4.webp"), u("./ustoz/jiwoo/yuz_2_5.webp"), u("./ustoz/jiwoo/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/jiwoo/poza_3.webp"), w: 268, h: 540, yuz: { x: 14.966, y: 7.312, w: 38.322, h: 15.973, kadr: [u("./ustoz/jiwoo/yuz_3_1.webp"), u("./ustoz/jiwoo/yuz_3_2.webp"), u("./ustoz/jiwoo/yuz_3_3.webp"), u("./ustoz/jiwoo/yuz_3_4.webp"), u("./ustoz/jiwoo/yuz_3_5.webp"), u("./ustoz/jiwoo/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/jiwoo/poza_4.webp"), w: 175, h: 540, yuz: { x: 19.444, y: 7.215, w: 60.764, h: 16.347, kadr: [u("./ustoz/jiwoo/yuz_4_1.webp"), u("./ustoz/jiwoo/yuz_4_2.webp"), u("./ustoz/jiwoo/yuz_4_3.webp"), u("./ustoz/jiwoo/yuz_4_4.webp"), u("./ustoz/jiwoo/yuz_4_5.webp"), u("./ustoz/jiwoo/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/jiwoo/poza_5.webp"), w: 189, h: 540, yuz: { x: 27.097, y: 6.998, w: 55.484, h: 16.591, kadr: [u("./ustoz/jiwoo/yuz_5_1.webp"), u("./ustoz/jiwoo/yuz_5_2.webp"), u("./ustoz/jiwoo/yuz_5_3.webp"), u("./ustoz/jiwoo/yuz_5_4.webp"), u("./ustoz/jiwoo/yuz_5_5.webp"), u("./ustoz/jiwoo/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/jiwoo/poza_6.webp"), w: 171, h: 540, yuz: { x: 20.567, y: 7.528, w: 62.766, h: 15.618, kadr: [u("./ustoz/jiwoo/yuz_6_1.webp"), u("./ustoz/jiwoo/yuz_6_2.webp"), u("./ustoz/jiwoo/yuz_6_3.webp"), u("./ustoz/jiwoo/yuz_6_4.webp"), u("./ustoz/jiwoo/yuz_6_5.webp"), u("./ustoz/jiwoo/yuz_6_6.webp")] } },
  },
  kenji: {
    lab: "erkak",
    1: { src: u("./ustoz/kenji/poza_1.webp"), w: 315, h: 540, yuz: { x: 32.941, y: 7.208, w: 30.392, h: 15.675, kadr: [u("./ustoz/kenji/yuz_1_1.webp"), u("./ustoz/kenji/yuz_1_2.webp"), u("./ustoz/kenji/yuz_1_3.webp"), u("./ustoz/kenji/yuz_1_4.webp"), u("./ustoz/kenji/yuz_1_5.webp"), u("./ustoz/kenji/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/kenji/poza_2.webp"), w: 211, h: 540, yuz: { x: 30.747, y: 6.951, w: 45.115, h: 15.583, kadr: [u("./ustoz/kenji/yuz_2_1.webp"), u("./ustoz/kenji/yuz_2_2.webp"), u("./ustoz/kenji/yuz_2_3.webp"), u("./ustoz/kenji/yuz_2_4.webp"), u("./ustoz/kenji/yuz_2_5.webp"), u("./ustoz/kenji/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/kenji/poza_3.webp"), w: 276, h: 540, yuz: { x: 14.693, y: 6.726, w: 33.333, h: 16.143, kadr: [u("./ustoz/kenji/yuz_3_1.webp"), u("./ustoz/kenji/yuz_3_2.webp"), u("./ustoz/kenji/yuz_3_3.webp"), u("./ustoz/kenji/yuz_3_4.webp"), u("./ustoz/kenji/yuz_3_5.webp"), u("./ustoz/kenji/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/kenji/poza_4.webp"), w: 193, h: 540, yuz: { x: 17.405, y: 7.029, w: 51.582, h: 16.553, kadr: [u("./ustoz/kenji/yuz_4_1.webp"), u("./ustoz/kenji/yuz_4_2.webp"), u("./ustoz/kenji/yuz_4_3.webp"), u("./ustoz/kenji/yuz_4_4.webp"), u("./ustoz/kenji/yuz_4_5.webp"), u("./ustoz/kenji/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/kenji/poza_5.webp"), w: 213, h: 540, yuz: { x: 29.799, y: 7.223, w: 47.278, h: 15.688, kadr: [u("./ustoz/kenji/yuz_5_1.webp"), u("./ustoz/kenji/yuz_5_2.webp"), u("./ustoz/kenji/yuz_5_3.webp"), u("./ustoz/kenji/yuz_5_4.webp"), u("./ustoz/kenji/yuz_5_5.webp"), u("./ustoz/kenji/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/kenji/poza_6.webp"), w: 187, h: 540, yuz: { x: 23.701, y: 7.191, w: 49.675, h: 15.056, kadr: [u("./ustoz/kenji/yuz_6_1.webp"), u("./ustoz/kenji/yuz_6_2.webp"), u("./ustoz/kenji/yuz_6_3.webp"), u("./ustoz/kenji/yuz_6_4.webp"), u("./ustoz/kenji/yuz_6_5.webp"), u("./ustoz/kenji/yuz_6_6.webp")] } },
  },
  lukas: {
    lab: "erkak",
    1: { src: u("./ustoz/lukas/poza_1.webp"), w: 310, h: 540, yuz: { x: 33.074, y: 4.922, w: 31.518, h: 17.002, kadr: [u("./ustoz/lukas/yuz_1_1.webp"), u("./ustoz/lukas/yuz_1_2.webp"), u("./ustoz/lukas/yuz_1_3.webp"), u("./ustoz/lukas/yuz_1_4.webp"), u("./ustoz/lukas/yuz_1_5.webp"), u("./ustoz/lukas/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/lukas/poza_2.webp"), w: 215, h: 540, yuz: { x: 31.519, y: 7.2, w: 46.991, h: 16.571, kadr: [u("./ustoz/lukas/yuz_2_1.webp"), u("./ustoz/lukas/yuz_2_2.webp"), u("./ustoz/lukas/yuz_2_3.webp"), u("./ustoz/lukas/yuz_2_4.webp"), u("./ustoz/lukas/yuz_2_5.webp"), u("./ustoz/lukas/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/lukas/poza_3.webp"), w: 308, h: 540, yuz: { x: 15.431, y: 6.971, w: 32.665, h: 16.571, kadr: [u("./ustoz/lukas/yuz_3_1.webp"), u("./ustoz/lukas/yuz_3_2.webp"), u("./ustoz/lukas/yuz_3_3.webp"), u("./ustoz/lukas/yuz_3_4.webp"), u("./ustoz/lukas/yuz_3_5.webp"), u("./ustoz/lukas/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/lukas/poza_4.webp"), w: 199, h: 540, yuz: { x: 17.629, y: 6.376, w: 50.456, h: 16.779, kadr: [u("./ustoz/lukas/yuz_4_1.webp"), u("./ustoz/lukas/yuz_4_2.webp"), u("./ustoz/lukas/yuz_4_3.webp"), u("./ustoz/lukas/yuz_4_4.webp"), u("./ustoz/lukas/yuz_4_5.webp"), u("./ustoz/lukas/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/lukas/poza_5.webp"), w: 213, h: 540, yuz: { x: 28.409, y: 6.376, w: 46.591, h: 16.219, kadr: [u("./ustoz/lukas/yuz_5_1.webp"), u("./ustoz/lukas/yuz_5_2.webp"), u("./ustoz/lukas/yuz_5_3.webp"), u("./ustoz/lukas/yuz_5_4.webp"), u("./ustoz/lukas/yuz_5_5.webp"), u("./ustoz/lukas/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/lukas/poza_6.webp"), w: 186, h: 540, yuz: { x: 23.102, y: 6.948, w: 54.785, h: 16.515, kadr: [u("./ustoz/lukas/yuz_6_1.webp"), u("./ustoz/lukas/yuz_6_2.webp"), u("./ustoz/lukas/yuz_6_3.webp"), u("./ustoz/lukas/yuz_6_4.webp"), u("./ustoz/lukas/yuz_6_5.webp"), u("./ustoz/lukas/yuz_6_6.webp")] } },
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 315, h: 540, yuz: { x: 27.395, y: 10.291, w: 31.609, h: 14.989, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 232, h: 540, yuz: { x: 20.317, y: 11.578, w: 49.604, h: 16.232, kadr: [u("./ustoz/malika/yuz_2_1.webp"), u("./ustoz/malika/yuz_2_2.webp"), u("./ustoz/malika/yuz_2_3.webp"), u("./ustoz/malika/yuz_2_4.webp"), u("./ustoz/malika/yuz_2_5.webp"), u("./ustoz/malika/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 283, h: 540, yuz: { x: 12.959, y: 12.005, w: 33.045, h: 14.383, kadr: [u("./ustoz/malika/yuz_3_1.webp"), u("./ustoz/malika/yuz_3_2.webp"), u("./ustoz/malika/yuz_3_3.webp"), u("./ustoz/malika/yuz_3_4.webp"), u("./ustoz/malika/yuz_3_5.webp"), u("./ustoz/malika/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 211, h: 540, yuz: { x: 9.429, y: 11.298, w: 49.429, h: 14.989, kadr: [u("./ustoz/malika/yuz_4_1.webp"), u("./ustoz/malika/yuz_4_2.webp"), u("./ustoz/malika/yuz_4_3.webp"), u("./ustoz/malika/yuz_4_4.webp"), u("./ustoz/malika/yuz_4_5.webp"), u("./ustoz/malika/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 227, h: 540, yuz: { x: 16.755, y: 10.526, w: 48.138, h: 13.326, kadr: [u("./ustoz/malika/yuz_5_1.webp"), u("./ustoz/malika/yuz_5_2.webp"), u("./ustoz/malika/yuz_5_3.webp"), u("./ustoz/malika/yuz_5_4.webp"), u("./ustoz/malika/yuz_5_5.webp"), u("./ustoz/malika/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 214, h: 540, yuz: { x: 13.181, y: 11.124, w: 53.868, h: 16.345, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] } },
  },
  mei: {
    lab: "ayol",
    1: { src: u("./ustoz/mei/poza_1.webp"), w: 298, h: 540, yuz: { x: 28.953, y: 6.795, w: 37.372, h: 16.761, kadr: [u("./ustoz/mei/yuz_1_1.webp"), u("./ustoz/mei/yuz_1_2.webp"), u("./ustoz/mei/yuz_1_3.webp"), u("./ustoz/mei/yuz_1_4.webp"), u("./ustoz/mei/yuz_1_5.webp"), u("./ustoz/mei/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/mei/poza_2.webp"), w: 207, h: 540, yuz: { x: 22.581, y: 6.854, w: 51.613, h: 16.517, kadr: [u("./ustoz/mei/yuz_2_1.webp"), u("./ustoz/mei/yuz_2_2.webp"), u("./ustoz/mei/yuz_2_3.webp"), u("./ustoz/mei/yuz_2_4.webp"), u("./ustoz/mei/yuz_2_5.webp"), u("./ustoz/mei/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/mei/poza_3.webp"), w: 284, h: 540, yuz: { x: 12.42, y: 6.532, w: 39.186, h: 17.117, kadr: [u("./ustoz/mei/yuz_3_1.webp"), u("./ustoz/mei/yuz_3_2.webp"), u("./ustoz/mei/yuz_3_3.webp"), u("./ustoz/mei/yuz_3_4.webp"), u("./ustoz/mei/yuz_3_5.webp"), u("./ustoz/mei/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/mei/poza_4.webp"), w: 190, h: 540, yuz: { x: 18.59, y: 6.869, w: 55.769, h: 16.216, kadr: [u("./ustoz/mei/yuz_4_1.webp"), u("./ustoz/mei/yuz_4_2.webp"), u("./ustoz/mei/yuz_4_3.webp"), u("./ustoz/mei/yuz_4_4.webp"), u("./ustoz/mei/yuz_4_5.webp"), u("./ustoz/mei/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/mei/poza_5.webp"), w: 188, h: 540, yuz: { x: 18.893, y: 6.924, w: 57.98, h: 16.459, kadr: [u("./ustoz/mei/yuz_5_1.webp"), u("./ustoz/mei/yuz_5_2.webp"), u("./ustoz/mei/yuz_5_3.webp"), u("./ustoz/mei/yuz_5_4.webp"), u("./ustoz/mei/yuz_5_5.webp"), u("./ustoz/mei/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/mei/poza_6.webp"), w: 181, h: 540, yuz: { x: 20.736, y: 7.183, w: 59.532, h: 16.274, kadr: [u("./ustoz/mei/yuz_6_1.webp"), u("./ustoz/mei/yuz_6_2.webp"), u("./ustoz/mei/yuz_6_3.webp"), u("./ustoz/mei/yuz_6_4.webp"), u("./ustoz/mei/yuz_6_5.webp"), u("./ustoz/mei/yuz_6_6.webp")] } },
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 307, h: 540, yuz: { x: 31.683, y: 6.088, w: 32.673, h: 15.558, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 203, h: 540, yuz: { x: 29.641, y: 6.074, w: 43.413, h: 13.948, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 292, h: 540, yuz: { x: 14.137, y: 6.299, w: 33.056, h: 14.623, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 203, h: 540, yuz: { x: 21.386, y: 5.769, w: 50.602, h: 14.367, kadr: [u("./ustoz/nilufar/yuz_4_1.webp"), u("./ustoz/nilufar/yuz_4_2.webp"), u("./ustoz/nilufar/yuz_4_3.webp"), u("./ustoz/nilufar/yuz_4_4.webp"), u("./ustoz/nilufar/yuz_4_5.webp"), u("./ustoz/nilufar/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 204, h: 540, yuz: { x: 26.567, y: 5.989, w: 48.955, h: 15.706, kadr: [u("./ustoz/nilufar/yuz_5_1.webp"), u("./ustoz/nilufar/yuz_5_2.webp"), u("./ustoz/nilufar/yuz_5_3.webp"), u("./ustoz/nilufar/yuz_5_4.webp"), u("./ustoz/nilufar/yuz_5_5.webp"), u("./ustoz/nilufar/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 192, h: 540, yuz: { x: 25.0, y: 6.187, w: 51.582, h: 15.073, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] } },
  },
  olga: {
    lab: "ayol",
    1: { src: u("./ustoz/olga/poza_1.webp"), w: 332, h: 540, yuz: { x: 30.642, y: 7.223, w: 32.11, h: 16.14, kadr: [u("./ustoz/olga/yuz_1_1.webp"), u("./ustoz/olga/yuz_1_2.webp"), u("./ustoz/olga/yuz_1_3.webp"), u("./ustoz/olga/yuz_1_4.webp"), u("./ustoz/olga/yuz_1_5.webp"), u("./ustoz/olga/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/olga/poza_2.webp"), w: 209, h: 540, yuz: { x: 27.114, y: 7.111, w: 52.187, h: 16.479, kadr: [u("./ustoz/olga/yuz_2_1.webp"), u("./ustoz/olga/yuz_2_2.webp"), u("./ustoz/olga/yuz_2_3.webp"), u("./ustoz/olga/yuz_2_4.webp"), u("./ustoz/olga/yuz_2_5.webp"), u("./ustoz/olga/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/olga/poza_3.webp"), w: 276, h: 540, yuz: { x: 14.317, y: 7.32, w: 38.546, h: 16.216, kadr: [u("./ustoz/olga/yuz_3_1.webp"), u("./ustoz/olga/yuz_3_2.webp"), u("./ustoz/olga/yuz_3_3.webp"), u("./ustoz/olga/yuz_3_4.webp"), u("./ustoz/olga/yuz_3_5.webp"), u("./ustoz/olga/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/olga/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.277, y: 7.383, w: 51.672, h: 15.772, kadr: [u("./ustoz/olga/yuz_4_1.webp"), u("./ustoz/olga/yuz_4_2.webp"), u("./ustoz/olga/yuz_4_3.webp"), u("./ustoz/olga/yuz_4_4.webp"), u("./ustoz/olga/yuz_4_5.webp"), u("./ustoz/olga/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/olga/poza_5.webp"), w: 207, h: 540, yuz: { x: 24.198, y: 7.383, w: 51.312, h: 15.884, kadr: [u("./ustoz/olga/yuz_5_1.webp"), u("./ustoz/olga/yuz_5_2.webp"), u("./ustoz/olga/yuz_5_3.webp"), u("./ustoz/olga/yuz_5_4.webp"), u("./ustoz/olga/yuz_5_5.webp"), u("./ustoz/olga/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/olga/poza_6.webp"), w: 193, h: 540, yuz: { x: 22.082, y: 7.32, w: 56.467, h: 16.441, kadr: [u("./ustoz/olga/yuz_6_1.webp"), u("./ustoz/olga/yuz_6_2.webp"), u("./ustoz/olga/yuz_6_3.webp"), u("./ustoz/olga/yuz_6_4.webp"), u("./ustoz/olga/yuz_6_5.webp"), u("./ustoz/olga/yuz_6_6.webp")] } },
  },
  oliver: {
    lab: "erkak",
    1: { src: u("./ustoz/oliver/poza_1.webp"), w: 330, h: 540, yuz: { x: 30.952, y: 7.83, w: 29.304, h: 15.101, kadr: [u("./ustoz/oliver/yuz_1_1.webp"), u("./ustoz/oliver/yuz_1_2.webp"), u("./ustoz/oliver/yuz_1_3.webp"), u("./ustoz/oliver/yuz_1_4.webp"), u("./ustoz/oliver/yuz_1_5.webp"), u("./ustoz/oliver/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/oliver/poza_2.webp"), w: 211, h: 540, yuz: { x: 30.904, y: 7.631, w: 48.98, h: 16.743, kadr: [u("./ustoz/oliver/yuz_2_1.webp"), u("./ustoz/oliver/yuz_2_2.webp"), u("./ustoz/oliver/yuz_2_3.webp"), u("./ustoz/oliver/yuz_2_4.webp"), u("./ustoz/oliver/yuz_2_5.webp"), u("./ustoz/oliver/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/oliver/poza_3.webp"), w: 300, h: 540, yuz: { x: 14.784, y: 8.656, w: 32.238, h: 14.92, kadr: [u("./ustoz/oliver/yuz_3_1.webp"), u("./ustoz/oliver/yuz_3_2.webp"), u("./ustoz/oliver/yuz_3_3.webp"), u("./ustoz/oliver/yuz_3_4.webp"), u("./ustoz/oliver/yuz_3_5.webp"), u("./ustoz/oliver/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/oliver/poza_4.webp"), w: 191, h: 540, yuz: { x: 20.82, y: 8.166, w: 47.003, h: 13.758, kadr: [u("./ustoz/oliver/yuz_4_1.webp"), u("./ustoz/oliver/yuz_4_2.webp"), u("./ustoz/oliver/yuz_4_3.webp"), u("./ustoz/oliver/yuz_4_4.webp"), u("./ustoz/oliver/yuz_4_5.webp"), u("./ustoz/oliver/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/oliver/poza_5.webp"), w: 267, h: 540, yuz: { x: 24.661, y: 7.494, w: 38.235, h: 15.772, kadr: [u("./ustoz/oliver/yuz_5_1.webp"), u("./ustoz/oliver/yuz_5_2.webp"), u("./ustoz/oliver/yuz_5_3.webp"), u("./ustoz/oliver/yuz_5_4.webp"), u("./ustoz/oliver/yuz_5_5.webp"), u("./ustoz/oliver/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/oliver/poza_6.webp"), w: 196, h: 540, yuz: { x: 22.5, y: 8.523, w: 51.562, h: 15.114, kadr: [u("./ustoz/oliver/yuz_6_1.webp"), u("./ustoz/oliver/yuz_6_2.webp"), u("./ustoz/oliver/yuz_6_3.webp"), u("./ustoz/oliver/yuz_6_4.webp"), u("./ustoz/oliver/yuz_6_5.webp"), u("./ustoz/oliver/yuz_6_6.webp")] } },
  },
  sarah: {
    lab: "ayol",
    1: { src: u("./ustoz/sarah/poza_1.webp"), w: 305, h: 540, yuz: { x: 29.341, y: 6.772, w: 36.727, h: 16.93, kadr: [u("./ustoz/sarah/yuz_1_1.webp"), u("./ustoz/sarah/yuz_1_2.webp"), u("./ustoz/sarah/yuz_1_3.webp"), u("./ustoz/sarah/yuz_1_4.webp"), u("./ustoz/sarah/yuz_1_5.webp"), u("./ustoz/sarah/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sarah/poza_2.webp"), w: 217, h: 540, yuz: { x: 22.409, y: 6.404, w: 56.022, h: 18.876, kadr: [u("./ustoz/sarah/yuz_2_1.webp"), u("./ustoz/sarah/yuz_2_2.webp"), u("./ustoz/sarah/yuz_2_3.webp"), u("./ustoz/sarah/yuz_2_4.webp"), u("./ustoz/sarah/yuz_2_5.webp"), u("./ustoz/sarah/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sarah/poza_3.webp"), w: 264, h: 540, yuz: { x: 14.45, y: 7.295, w: 42.431, h: 16.386, kadr: [u("./ustoz/sarah/yuz_3_1.webp"), u("./ustoz/sarah/yuz_3_2.webp"), u("./ustoz/sarah/yuz_3_3.webp"), u("./ustoz/sarah/yuz_3_4.webp"), u("./ustoz/sarah/yuz_3_5.webp"), u("./ustoz/sarah/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sarah/poza_4.webp"), w: 198, h: 540, yuz: { x: 13.622, y: 5.909, w: 63.158, h: 20.114, kadr: [u("./ustoz/sarah/yuz_4_1.webp"), u("./ustoz/sarah/yuz_4_2.webp"), u("./ustoz/sarah/yuz_4_3.webp"), u("./ustoz/sarah/yuz_4_4.webp"), u("./ustoz/sarah/yuz_4_5.webp"), u("./ustoz/sarah/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sarah/poza_5.webp"), w: 212, h: 540, yuz: { x: 15.23, y: 5.869, w: 57.759, h: 19.865, kadr: [u("./ustoz/sarah/yuz_5_1.webp"), u("./ustoz/sarah/yuz_5_2.webp"), u("./ustoz/sarah/yuz_5_3.webp"), u("./ustoz/sarah/yuz_5_4.webp"), u("./ustoz/sarah/yuz_5_5.webp"), u("./ustoz/sarah/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sarah/poza_6.webp"), w: 188, h: 540, yuz: { x: 28.065, y: 7.744, w: 50.645, h: 14.366, kadr: [u("./ustoz/sarah/yuz_6_1.webp"), u("./ustoz/sarah/yuz_6_2.webp"), u("./ustoz/sarah/yuz_6_3.webp"), u("./ustoz/sarah/yuz_6_4.webp"), u("./ustoz/sarah/yuz_6_5.webp"), u("./ustoz/sarah/yuz_6_6.webp")] } },
  },
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 331, h: 540, yuz: { x: 33.394, y: 7.047, w: 30.474, h: 15.436, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 207, h: 540, yuz: { x: 29.586, y: 6.924, w: 47.929, h: 15.891, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 288, h: 540, yuz: { x: 14.468, y: 7.491, w: 35.532, h: 15.096, kadr: [u("./ustoz/sardor/yuz_3_1.webp"), u("./ustoz/sardor/yuz_3_2.webp"), u("./ustoz/sardor/yuz_3_3.webp"), u("./ustoz/sardor/yuz_3_4.webp"), u("./ustoz/sardor/yuz_3_5.webp"), u("./ustoz/sardor/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.212, y: 6.823, w: 51.212, h: 15.772, kadr: [u("./ustoz/sardor/yuz_4_1.webp"), u("./ustoz/sardor/yuz_4_2.webp"), u("./ustoz/sardor/yuz_4_3.webp"), u("./ustoz/sardor/yuz_4_4.webp"), u("./ustoz/sardor/yuz_4_5.webp"), u("./ustoz/sardor/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 214, h: 540, yuz: { x: 27.401, y: 7.279, w: 48.305, h: 15.789, kadr: [u("./ustoz/sardor/yuz_5_1.webp"), u("./ustoz/sardor/yuz_5_2.webp"), u("./ustoz/sardor/yuz_5_3.webp"), u("./ustoz/sardor/yuz_5_4.webp"), u("./ustoz/sardor/yuz_5_5.webp"), u("./ustoz/sardor/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 190, h: 540, yuz: { x: 23.473, y: 7.361, w: 53.055, h: 15.289, kadr: [u("./ustoz/sardor/yuz_6_1.webp"), u("./ustoz/sardor/yuz_6_2.webp"), u("./ustoz/sardor/yuz_6_3.webp"), u("./ustoz/sardor/yuz_6_4.webp"), u("./ustoz/sardor/yuz_6_5.webp"), u("./ustoz/sardor/yuz_6_6.webp")] } },
  },
  svetlana: {
    lab: "ayol",
    1: { src: u("./ustoz/svetlana/poza_1.webp"), w: 319, h: 540, yuz: { x: 30.402, y: 6.667, w: 31.549, h: 15.932, kadr: [u("./ustoz/svetlana/yuz_1_1.webp"), u("./ustoz/svetlana/yuz_1_2.webp"), u("./ustoz/svetlana/yuz_1_3.webp"), u("./ustoz/svetlana/yuz_1_4.webp"), u("./ustoz/svetlana/yuz_1_5.webp"), u("./ustoz/svetlana/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/svetlana/poza_2.webp"), w: 209, h: 540, yuz: { x: 36.812, y: 7.416, w: 41.449, h: 13.596, kadr: [u("./ustoz/svetlana/yuz_2_1.webp"), u("./ustoz/svetlana/yuz_2_2.webp"), u("./ustoz/svetlana/yuz_2_3.webp"), u("./ustoz/svetlana/yuz_2_4.webp"), u("./ustoz/svetlana/yuz_2_5.webp"), u("./ustoz/svetlana/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/svetlana/poza_3.webp"), w: 294, h: 540, yuz: { x: 16.563, y: 6.644, w: 33.54, h: 15.991, kadr: [u("./ustoz/svetlana/yuz_3_1.webp"), u("./ustoz/svetlana/yuz_3_2.webp"), u("./ustoz/svetlana/yuz_3_3.webp"), u("./ustoz/svetlana/yuz_3_4.webp"), u("./ustoz/svetlana/yuz_3_5.webp"), u("./ustoz/svetlana/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/svetlana/poza_4.webp"), w: 176, h: 540, yuz: { x: 22.145, y: 6.644, w: 59.516, h: 16.216, kadr: [u("./ustoz/svetlana/yuz_4_1.webp"), u("./ustoz/svetlana/yuz_4_2.webp"), u("./ustoz/svetlana/yuz_4_3.webp"), u("./ustoz/svetlana/yuz_4_4.webp"), u("./ustoz/svetlana/yuz_4_5.webp"), u("./ustoz/svetlana/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/svetlana/poza_5.webp"), w: 201, h: 540, yuz: { x: 25.152, y: 6.78, w: 50.303, h: 16.271, kadr: [u("./ustoz/svetlana/yuz_5_1.webp"), u("./ustoz/svetlana/yuz_5_2.webp"), u("./ustoz/svetlana/yuz_5_3.webp"), u("./ustoz/svetlana/yuz_5_4.webp"), u("./ustoz/svetlana/yuz_5_5.webp"), u("./ustoz/svetlana/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/svetlana/poza_6.webp"), w: 195, h: 540, yuz: { x: 25.312, y: 6.532, w: 52.5, h: 16.554, kadr: [u("./ustoz/svetlana/yuz_6_1.webp"), u("./ustoz/svetlana/yuz_6_2.webp"), u("./ustoz/svetlana/yuz_6_3.webp"), u("./ustoz/svetlana/yuz_6_4.webp"), u("./ustoz/svetlana/yuz_6_5.webp"), u("./ustoz/svetlana/yuz_6_6.webp")] } },
  },
  yusuf: {
    lab: "erkak",
    1: { src: u("./ustoz/yusuf/poza_1.webp"), w: 362, h: 540, yuz: { x: 34.286, y: 6.081, w: 25.378, h: 14.527, kadr: [u("./ustoz/yusuf/yuz_1_1.webp"), u("./ustoz/yusuf/yuz_1_2.webp"), u("./ustoz/yusuf/yuz_1_3.webp"), u("./ustoz/yusuf/yuz_1_4.webp"), u("./ustoz/yusuf/yuz_1_5.webp"), u("./ustoz/yusuf/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/yusuf/poza_2.webp"), w: 209, h: 540, yuz: { x: 36.337, y: 6.644, w: 43.023, h: 13.514, kadr: [u("./ustoz/yusuf/yuz_2_1.webp"), u("./ustoz/yusuf/yuz_2_2.webp"), u("./ustoz/yusuf/yuz_2_3.webp"), u("./ustoz/yusuf/yuz_2_4.webp"), u("./ustoz/yusuf/yuz_2_5.webp"), u("./ustoz/yusuf/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/yusuf/poza_3.webp"), w: 240, h: 540, yuz: { x: 19.949, y: 6.629, w: 36.869, h: 13.596, kadr: [u("./ustoz/yusuf/yuz_3_1.webp"), u("./ustoz/yusuf/yuz_3_2.webp"), u("./ustoz/yusuf/yuz_3_3.webp"), u("./ustoz/yusuf/yuz_3_4.webp"), u("./ustoz/yusuf/yuz_3_5.webp"), u("./ustoz/yusuf/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/yusuf/poza_4.webp"), w: 188, h: 540, yuz: { x: 25.649, y: 6.116, w: 48.052, h: 14.609, kadr: [u("./ustoz/yusuf/yuz_4_1.webp"), u("./ustoz/yusuf/yuz_4_2.webp"), u("./ustoz/yusuf/yuz_4_3.webp"), u("./ustoz/yusuf/yuz_4_4.webp"), u("./ustoz/yusuf/yuz_4_5.webp"), u("./ustoz/yusuf/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/yusuf/poza_5.webp"), w: 215, h: 540, yuz: { x: 30.398, y: 6.215, w: 41.761, h: 14.463, kadr: [u("./ustoz/yusuf/yuz_5_1.webp"), u("./ustoz/yusuf/yuz_5_2.webp"), u("./ustoz/yusuf/yuz_5_3.webp"), u("./ustoz/yusuf/yuz_5_4.webp"), u("./ustoz/yusuf/yuz_5_5.webp"), u("./ustoz/yusuf/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/yusuf/poza_6.webp"), w: 185, h: 540, yuz: { x: 29.836, y: 6.734, w: 47.869, h: 13.692, kadr: [u("./ustoz/yusuf/yuz_6_1.webp"), u("./ustoz/yusuf/yuz_6_2.webp"), u("./ustoz/yusuf/yuz_6_3.webp"), u("./ustoz/yusuf/yuz_6_4.webp"), u("./ustoz/yusuf/yuz_6_5.webp"), u("./ustoz/yusuf/yuz_6_6.webp")] } },
  },
};




// REV153: og'iz shakllari (lab varag'i, 10 ta) — ayol va erkak ustoz uchun
export const OG_RASM = {
  ayol: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => u(`./ustoz/og/og_ayol_${i}.webp`)),
  erkak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => u(`./ustoz/og/og_erkak_${i}.webp`)),
};

// REV110: xona joylari (foizda): doska, deraza (ob-havo), devordagi ramka, javon, pol — mavzuga qarab to'ladi.
export const XONALAR = {
  matematika: { src: u("./ustoz/xona/matematika_960.webp"), // REV158: devordagi soat (markaz va siferblat eni, foizda) — ustiga haqiqiy vaqtni ko'rsatuvchi soat chiziladi
    soat: { x: 93.56, y: 13.2, w: 8.75, yuz: "#d6cbcc" }, src2x: u("./ustoz/xona/matematika_1600.webp"), doska: { l: 40.9, t: 19.4, w: 42.4, h: 37.1 }, deraza: { l: 0, t: 0, w: 5.188, h: 50.549 },
    // REV140: derazaning shisha qismi — rasmdan aniq olingan niqob (rom, gul va barglar ustiga osmon chizilmaydi)
    osmon: u("./ustoz/xona/osmon_matematika.webp"), oy: { t: 12, r: 15 },
    chiroq: { x: 62 }, devor: { l: 27.4, t: 14.5, w: 8.2, h: 22 }, javon: null, pol: { l: 77, t: 80, w: 18, h: 17 } },
  onatili: { src: u("./ustoz/xona/onatili_960.webp"), // REV158: devordagi soat (markaz va siferblat eni, foizda) — ustiga haqiqiy vaqtni ko'rsatuvchi soat chiziladi
    soat: { x: 17.92, y: 8.9, w: 7.6, yuz: "#e8c3a6" }, src2x: u("./ustoz/xona/onatili_1600.webp"), doska: { l: 25.5, t: 11, w: 43, h: 45, panel: true }, deraza: { l: 69.25, t: 0.999, w: 17.5, h: 38.062 },
    // REV140: shisha niqobi — bayroqchalar, gul, parda va mol'bert oldinda qoladi
    osmon: u("./ustoz/xona/osmon_onatili.webp"), oy: { t: 20, r: 20 },
    chiroq: { x: 47 }, devor: { l: 80, t: 28.5, w: 14.5, h: 30 }, javon: null, pol: { l: 36, t: 64, w: 13, h: 14 } },   // ramka — mol'bertdagi qog'oz
  atrofolam: { src: u("./ustoz/xona/atrofolam_960.webp"), // REV158: devordagi soat (markaz va siferblat eni, foizda) — ustiga haqiqiy vaqtni ko'rsatuvchi soat chiziladi
    soat: { x: 25.17, y: 14.57, w: 7.8, yuz: "#d8c6b6" }, src2x: u("./ustoz/xona/atrofolam_1600.webp"), doska: { l: 50.8, t: 7.9, w: 30.6, h: 33 }, deraza: { l: 89.125, t: 0, w: 10.875, h: 41.858 },
    osmon: u("./ustoz/xona/osmon_atrofolam.webp"), oy: { t: 5, r: 12 },   // REV140: shisha niqobi (gul barglari oldinda)
    chiroq: { x: 33 }, devor: { l: 39.8, t: 5.5, w: 6.8, h: 16.5 }, javon: null, pol: { l: 50, t: 80, w: 20, h: 16 } },
  // REV169: til ustozlarining sinfxonalari — doska markazda, deraza chapda, soat doska ustida (hammasida bir xil joy)
  til_emily: { src: u("./ustoz/xona/til_emily_960.webp"), src2x: u("./ustoz/xona/til_emily_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f5debd" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.625, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_emily.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_anna: { src: u("./ustoz/xona/til_anna_960.webp"), src2x: u("./ustoz/xona/til_anna_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c8" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_anna.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_elif: { src: u("./ustoz/xona/til_elif_960.webp"), src2x: u("./ustoz/xona/til_elif_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c7" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.851, h: 32.359 },
    osmon: u("./ustoz/xona/osmon_til_elif.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_yusuf: { src: u("./ustoz/xona/til_yusuf_960.webp"), src2x: u("./ustoz/xona/til_yusuf_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f5e0c7" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_yusuf.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_lukas: { src: u("./ustoz/xona/til_lukas_960.webp"), src2x: u("./ustoz/xona/til_lukas_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c9" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_lukas.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_carlos: { src: u("./ustoz/xona/til_carlos_960.webp"), src2x: u("./ustoz/xona/til_carlos_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_carlos.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_jiwoo: { src: u("./ustoz/xona/til_jiwoo_960.webp"), src2x: u("./ustoz/xona/til_jiwoo_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c8" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_jiwoo.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_camille: { src: u("./ustoz/xona/til_camille_960.webp"), src2x: u("./ustoz/xona/til_camille_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_camille.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_mei: { src: u("./ustoz/xona/til_mei_960.webp"), src2x: u("./ustoz/xona/til_mei_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e2c9" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_mei.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_kenji: { src: u("./ustoz/xona/til_kenji_960.webp"), src2x: u("./ustoz/xona/til_kenji_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.359 },
    osmon: u("./ustoz/xona/osmon_til_kenji.webp"), oy: { t: 18, r: 22 }, bosh: true, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
};
