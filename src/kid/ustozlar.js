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
// REV240: 19 ustoz — rassom chizgan yangi rasmlar (har pozada 6 yuz kadri, yuz qatlami pozaga aniq joylangan).
export const USTOZLAR = {
  anna: {
    lab: "ayol",
    1: { src: u("./ustoz/anna/poza_1.webp"), w: 294, h: 540, yuz: { x: 29.876, y: 4.74, w: 32.158, h: 17.381, kadr: [u("./ustoz/anna/yuz_1_1.webp"), u("./ustoz/anna/yuz_1_2.webp"), u("./ustoz/anna/yuz_1_3.webp"), u("./ustoz/anna/yuz_1_4.webp"), u("./ustoz/anna/yuz_1_5.webp"), u("./ustoz/anna/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/anna/poza_2.webp"), w: 215, h: 540, yuz: { x: 28.531, y: 4.944, w: 44.633, h: 17.079, kadr: [u("./ustoz/anna/yuz_2_1.webp"), u("./ustoz/anna/yuz_2_2.webp"), u("./ustoz/anna/yuz_2_3.webp"), u("./ustoz/anna/yuz_2_4.webp"), u("./ustoz/anna/yuz_2_5.webp"), u("./ustoz/anna/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/anna/poza_3.webp"), w: 282, h: 540, yuz: { x: 19.181, y: 5.393, w: 32.112, h: 16.067, kadr: [u("./ustoz/anna/yuz_3_1.webp"), u("./ustoz/anna/yuz_3_2.webp"), u("./ustoz/anna/yuz_3_3.webp"), u("./ustoz/anna/yuz_3_4.webp"), u("./ustoz/anna/yuz_3_5.webp"), u("./ustoz/anna/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/anna/poza_4.webp"), w: 194, h: 540, yuz: { x: 24.138, y: 5.079, w: 46.082, h: 16.479, kadr: [u("./ustoz/anna/yuz_4_1.webp"), u("./ustoz/anna/yuz_4_2.webp"), u("./ustoz/anna/yuz_4_3.webp"), u("./ustoz/anna/yuz_4_4.webp"), u("./ustoz/anna/yuz_4_5.webp"), u("./ustoz/anna/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/anna/poza_5.webp"), w: 215, h: 540, yuz: { x: 21.875, y: 4.966, w: 44.034, h: 17.043, kadr: [u("./ustoz/anna/yuz_5_1.webp"), u("./ustoz/anna/yuz_5_2.webp"), u("./ustoz/anna/yuz_5_3.webp"), u("./ustoz/anna/yuz_5_4.webp"), u("./ustoz/anna/yuz_5_5.webp"), u("./ustoz/anna/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/anna/poza_6.webp"), w: 184, h: 540, yuz: { x: 23.762, y: 4.944, w: 52.475, h: 17.079, kadr: [u("./ustoz/anna/yuz_6_1.webp"), u("./ustoz/anna/yuz_6_2.webp"), u("./ustoz/anna/yuz_6_3.webp"), u("./ustoz/anna/yuz_6_4.webp"), u("./ustoz/anna/yuz_6_5.webp"), u("./ustoz/anna/yuz_6_6.webp")] } },
  },
  camille: {
    lab: "ayol",
    1: { src: u("./ustoz/camille/poza_1.webp"), w: 289, h: 540, yuz: { x: 32.773, y: 6.292, w: 36.345, h: 17.191, kadr: [u("./ustoz/camille/yuz_1_1.webp"), u("./ustoz/camille/yuz_1_2.webp"), u("./ustoz/camille/yuz_1_3.webp"), u("./ustoz/camille/yuz_1_4.webp"), u("./ustoz/camille/yuz_1_5.webp"), u("./ustoz/camille/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/camille/poza_2.webp"), w: 208, h: 540, yuz: { x: 34.897, y: 6.659, w: 48.094, h: 16.366, kadr: [u("./ustoz/camille/yuz_2_1.webp"), u("./ustoz/camille/yuz_2_2.webp"), u("./ustoz/camille/yuz_2_3.webp"), u("./ustoz/camille/yuz_2_4.webp"), u("./ustoz/camille/yuz_2_5.webp"), u("./ustoz/camille/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/camille/poza_3.webp"), w: 271, h: 540, yuz: { x: 11.036, y: 6.208, w: 38.964, h: 17.381, kadr: [u("./ustoz/camille/yuz_3_1.webp"), u("./ustoz/camille/yuz_3_2.webp"), u("./ustoz/camille/yuz_3_3.webp"), u("./ustoz/camille/yuz_3_4.webp"), u("./ustoz/camille/yuz_3_5.webp"), u("./ustoz/camille/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/camille/poza_4.webp"), w: 175, h: 540, yuz: { x: 23.529, y: 6.517, w: 60.9, h: 17.528, kadr: [u("./ustoz/camille/yuz_4_1.webp"), u("./ustoz/camille/yuz_4_2.webp"), u("./ustoz/camille/yuz_4_3.webp"), u("./ustoz/camille/yuz_4_4.webp"), u("./ustoz/camille/yuz_4_5.webp"), u("./ustoz/camille/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/camille/poza_5.webp"), w: 224, h: 540, yuz: { x: 22.911, y: 6.495, w: 45.822, h: 16.909, kadr: [u("./ustoz/camille/yuz_5_1.webp"), u("./ustoz/camille/yuz_5_2.webp"), u("./ustoz/camille/yuz_5_3.webp"), u("./ustoz/camille/yuz_5_4.webp"), u("./ustoz/camille/yuz_5_5.webp"), u("./ustoz/camille/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/camille/poza_6.webp"), w: 179, h: 540, yuz: { x: 28.912, y: 6.659, w: 55.102, h: 16.253, kadr: [u("./ustoz/camille/yuz_6_1.webp"), u("./ustoz/camille/yuz_6_2.webp"), u("./ustoz/camille/yuz_6_3.webp"), u("./ustoz/camille/yuz_6_4.webp"), u("./ustoz/camille/yuz_6_5.webp"), u("./ustoz/camille/yuz_6_6.webp")] } },
  },
  carlos: {
    lab: "erkak",
    1: { src: u("./ustoz/carlos/poza_1.webp"), w: 302, h: 540, yuz: { x: 31.8, y: 5.705, w: 30.2, h: 15.772, kadr: [u("./ustoz/carlos/yuz_1_1.webp"), u("./ustoz/carlos/yuz_1_2.webp"), u("./ustoz/carlos/yuz_1_3.webp"), u("./ustoz/carlos/yuz_1_4.webp"), u("./ustoz/carlos/yuz_1_5.webp"), u("./ustoz/carlos/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/carlos/poza_2.webp"), w: 199, h: 540, yuz: { x: 30.556, y: 5.809, w: 46.605, h: 15.831, kadr: [u("./ustoz/carlos/yuz_2_1.webp"), u("./ustoz/carlos/yuz_2_2.webp"), u("./ustoz/carlos/yuz_2_3.webp"), u("./ustoz/carlos/yuz_2_4.webp"), u("./ustoz/carlos/yuz_2_5.webp"), u("./ustoz/carlos/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/carlos/poza_3.webp"), w: 268, h: 540, yuz: { x: 15.596, y: 5.815, w: 34.633, h: 15.964, kadr: [u("./ustoz/carlos/yuz_3_1.webp"), u("./ustoz/carlos/yuz_3_2.webp"), u("./ustoz/carlos/yuz_3_3.webp"), u("./ustoz/carlos/yuz_3_4.webp"), u("./ustoz/carlos/yuz_3_5.webp"), u("./ustoz/carlos/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/carlos/poza_4.webp"), w: 193, h: 540, yuz: { x: 16.614, y: 4.698, w: 47.649, h: 15.996, kadr: [u("./ustoz/carlos/yuz_4_1.webp"), u("./ustoz/carlos/yuz_4_2.webp"), u("./ustoz/carlos/yuz_4_3.webp"), u("./ustoz/carlos/yuz_4_4.webp"), u("./ustoz/carlos/yuz_4_5.webp"), u("./ustoz/carlos/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/carlos/poza_5.webp"), w: 217, h: 540, yuz: { x: 30.278, y: 4.698, w: 43.889, h: 16.331, kadr: [u("./ustoz/carlos/yuz_5_1.webp"), u("./ustoz/carlos/yuz_5_2.webp"), u("./ustoz/carlos/yuz_5_3.webp"), u("./ustoz/carlos/yuz_5_4.webp"), u("./ustoz/carlos/yuz_5_5.webp"), u("./ustoz/carlos/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/carlos/poza_6.webp"), w: 172, h: 540, yuz: { x: 23.488, y: 5.556, w: 55.16, h: 16.44, kadr: [u("./ustoz/carlos/yuz_6_1.webp"), u("./ustoz/carlos/yuz_6_2.webp"), u("./ustoz/carlos/yuz_6_3.webp"), u("./ustoz/carlos/yuz_6_4.webp"), u("./ustoz/carlos/yuz_6_5.webp"), u("./ustoz/carlos/yuz_6_6.webp")] } },
  },
  daniel: {
    lab: "erkak",
    1: { src: u("./ustoz/daniel/poza_1.webp"), w: 312, h: 540, yuz: { x: 32.816, y: 6.285, w: 29.515, h: 16.049, kadr: [u("./ustoz/daniel/yuz_1_1.webp"), u("./ustoz/daniel/yuz_1_2.webp"), u("./ustoz/daniel/yuz_1_3.webp"), u("./ustoz/daniel/yuz_1_4.webp"), u("./ustoz/daniel/yuz_1_5.webp"), u("./ustoz/daniel/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/daniel/poza_2.webp"), w: 210, h: 540, yuz: { x: 26.667, y: 6.208, w: 45.217, h: 16.027, kadr: [u("./ustoz/daniel/yuz_2_1.webp"), u("./ustoz/daniel/yuz_2_2.webp"), u("./ustoz/daniel/yuz_2_3.webp"), u("./ustoz/daniel/yuz_2_4.webp"), u("./ustoz/daniel/yuz_2_5.webp"), u("./ustoz/daniel/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/daniel/poza_3.webp"), w: 280, h: 540, yuz: { x: 16.087, y: 6.208, w: 33.696, h: 15.914, kadr: [u("./ustoz/daniel/yuz_3_1.webp"), u("./ustoz/daniel/yuz_3_2.webp"), u("./ustoz/daniel/yuz_3_3.webp"), u("./ustoz/daniel/yuz_3_4.webp"), u("./ustoz/daniel/yuz_3_5.webp"), u("./ustoz/daniel/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/daniel/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.341, y: 6.517, w: 48.476, h: 15.955, kadr: [u("./ustoz/daniel/yuz_4_1.webp"), u("./ustoz/daniel/yuz_4_2.webp"), u("./ustoz/daniel/yuz_4_3.webp"), u("./ustoz/daniel/yuz_4_4.webp"), u("./ustoz/daniel/yuz_4_5.webp"), u("./ustoz/daniel/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/daniel/poza_5.webp"), w: 219, h: 540, yuz: { x: 27.424, y: 6.622, w: 43.767, h: 15.713, kadr: [u("./ustoz/daniel/yuz_5_1.webp"), u("./ustoz/daniel/yuz_5_2.webp"), u("./ustoz/daniel/yuz_5_3.webp"), u("./ustoz/daniel/yuz_5_4.webp"), u("./ustoz/daniel/yuz_5_5.webp"), u("./ustoz/daniel/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/daniel/poza_6.webp"), w: 199, h: 540, yuz: { x: 21.166, y: 5.982, w: 48.466, h: 16.479, kadr: [u("./ustoz/daniel/yuz_6_1.webp"), u("./ustoz/daniel/yuz_6_2.webp"), u("./ustoz/daniel/yuz_6_3.webp"), u("./ustoz/daniel/yuz_6_4.webp"), u("./ustoz/daniel/yuz_6_5.webp"), u("./ustoz/daniel/yuz_6_6.webp")] } },
  },
  dmitriy: {
    lab: "erkak",
    1: { src: u("./ustoz/dmitriy/poza_1.webp"), w: 306, h: 540, yuz: { x: 34.653, y: 5.499, w: 27.525, h: 15.039, kadr: [u("./ustoz/dmitriy/yuz_1_1.webp"), u("./ustoz/dmitriy/yuz_1_2.webp"), u("./ustoz/dmitriy/yuz_1_3.webp"), u("./ustoz/dmitriy/yuz_1_4.webp"), u("./ustoz/dmitriy/yuz_1_5.webp"), u("./ustoz/dmitriy/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/dmitriy/poza_2.webp"), w: 205, h: 540, yuz: { x: 30.952, y: 5.085, w: 42.56, h: 16.045, kadr: [u("./ustoz/dmitriy/yuz_2_1.webp"), u("./ustoz/dmitriy/yuz_2_2.webp"), u("./ustoz/dmitriy/yuz_2_3.webp"), u("./ustoz/dmitriy/yuz_2_4.webp"), u("./ustoz/dmitriy/yuz_2_5.webp"), u("./ustoz/dmitriy/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/dmitriy/poza_3.webp"), w: 282, h: 540, yuz: { x: 16.052, y: 5.442, w: 30.152, h: 14.853, kadr: [u("./ustoz/dmitriy/yuz_3_1.webp"), u("./ustoz/dmitriy/yuz_3_2.webp"), u("./ustoz/dmitriy/yuz_3_3.webp"), u("./ustoz/dmitriy/yuz_3_4.webp"), u("./ustoz/dmitriy/yuz_3_5.webp"), u("./ustoz/dmitriy/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/dmitriy/poza_4.webp"), w: 187, h: 540, yuz: { x: 21.036, y: 5.034, w: 46.278, h: 15.436, kadr: [u("./ustoz/dmitriy/yuz_4_1.webp"), u("./ustoz/dmitriy/yuz_4_2.webp"), u("./ustoz/dmitriy/yuz_4_3.webp"), u("./ustoz/dmitriy/yuz_4_4.webp"), u("./ustoz/dmitriy/yuz_4_5.webp"), u("./ustoz/dmitriy/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/dmitriy/poza_5.webp"), w: 198, h: 540, yuz: { x: 29.141, y: 5.612, w: 42.331, h: 14.815, kadr: [u("./ustoz/dmitriy/yuz_5_1.webp"), u("./ustoz/dmitriy/yuz_5_2.webp"), u("./ustoz/dmitriy/yuz_5_3.webp"), u("./ustoz/dmitriy/yuz_5_4.webp"), u("./ustoz/dmitriy/yuz_5_5.webp"), u("./ustoz/dmitriy/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/dmitriy/poza_6.webp"), w: 184, h: 540, yuz: { x: 25.914, y: 5.311, w: 47.841, h: 15.367, kadr: [u("./ustoz/dmitriy/yuz_6_1.webp"), u("./ustoz/dmitriy/yuz_6_2.webp"), u("./ustoz/dmitriy/yuz_6_3.webp"), u("./ustoz/dmitriy/yuz_6_4.webp"), u("./ustoz/dmitriy/yuz_6_5.webp"), u("./ustoz/dmitriy/yuz_6_6.webp")] } },
  },
  elif: {
    lab: "ayol",
    1: { src: u("./ustoz/elif/poza_1.webp"), w: 302, h: 540, yuz: { x: 28.313, y: 3.262, w: 41.165, h: 20.585, kadr: [u("./ustoz/elif/yuz_1_1.webp"), u("./ustoz/elif/yuz_1_2.webp"), u("./ustoz/elif/yuz_1_3.webp"), u("./ustoz/elif/yuz_1_4.webp"), u("./ustoz/elif/yuz_1_5.webp"), u("./ustoz/elif/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/elif/poza_2.webp"), w: 214, h: 540, yuz: { x: 37.607, y: 5.524, w: 39.031, h: 14.769, kadr: [u("./ustoz/elif/yuz_2_1.webp"), u("./ustoz/elif/yuz_2_2.webp"), u("./ustoz/elif/yuz_2_3.webp"), u("./ustoz/elif/yuz_2_4.webp"), u("./ustoz/elif/yuz_2_5.webp"), u("./ustoz/elif/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/elif/poza_3.webp"), w: 272, h: 540, yuz: { x: 22.676, y: 5.701, w: 31.293, h: 14.823, kadr: [u("./ustoz/elif/yuz_3_1.webp"), u("./ustoz/elif/yuz_3_2.webp"), u("./ustoz/elif/yuz_3_3.webp"), u("./ustoz/elif/yuz_3_4.webp"), u("./ustoz/elif/yuz_3_5.webp"), u("./ustoz/elif/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/elif/poza_4.webp"), w: 205, h: 540, yuz: { x: 18.209, y: 3.507, w: 60.0, h: 20.136, kadr: [u("./ustoz/elif/yuz_4_1.webp"), u("./ustoz/elif/yuz_4_2.webp"), u("./ustoz/elif/yuz_4_3.webp"), u("./ustoz/elif/yuz_4_4.webp"), u("./ustoz/elif/yuz_4_5.webp"), u("./ustoz/elif/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/elif/poza_5.webp"), w: 203, h: 540, yuz: { x: 29.341, y: 5.624, w: 41.018, h: 14.398, kadr: [u("./ustoz/elif/yuz_5_1.webp"), u("./ustoz/elif/yuz_5_2.webp"), u("./ustoz/elif/yuz_5_3.webp"), u("./ustoz/elif/yuz_5_4.webp"), u("./ustoz/elif/yuz_5_5.webp"), u("./ustoz/elif/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/elif/poza_6.webp"), w: 192, h: 540, yuz: { x: 24.843, y: 4.251, w: 51.572, h: 18.121, kadr: [u("./ustoz/elif/yuz_6_1.webp"), u("./ustoz/elif/yuz_6_2.webp"), u("./ustoz/elif/yuz_6_3.webp"), u("./ustoz/elif/yuz_6_4.webp"), u("./ustoz/elif/yuz_6_5.webp"), u("./ustoz/elif/yuz_6_6.webp")] } },
  },
  emily: {
    lab: "ayol",
    1: { src: u("./ustoz/emily/poza_1.webp"), w: 324, h: 540, yuz: { x: 32.775, y: 5.257, w: 31.099, h: 16.667, kadr: [u("./ustoz/emily/yuz_1_1.webp"), u("./ustoz/emily/yuz_1_2.webp"), u("./ustoz/emily/yuz_1_3.webp"), u("./ustoz/emily/yuz_1_4.webp"), u("./ustoz/emily/yuz_1_5.webp"), u("./ustoz/emily/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/emily/poza_2.webp"), w: 217, h: 540, yuz: { x: 31.18, y: 5.317, w: 47.472, h: 16.855, kadr: [u("./ustoz/emily/yuz_2_1.webp"), u("./ustoz/emily/yuz_2_2.webp"), u("./ustoz/emily/yuz_2_3.webp"), u("./ustoz/emily/yuz_2_4.webp"), u("./ustoz/emily/yuz_2_5.webp"), u("./ustoz/emily/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/emily/poza_3.webp"), w: 283, h: 540, yuz: { x: 15.983, y: 5.556, w: 35.421, h: 16.44, kadr: [u("./ustoz/emily/yuz_3_1.webp"), u("./ustoz/emily/yuz_3_2.webp"), u("./ustoz/emily/yuz_3_3.webp"), u("./ustoz/emily/yuz_3_4.webp"), u("./ustoz/emily/yuz_3_5.webp"), u("./ustoz/emily/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/emily/poza_4.webp"), w: 200, h: 540, yuz: { x: 24.848, y: 5.381, w: 51.212, h: 16.816, kadr: [u("./ustoz/emily/yuz_4_1.webp"), u("./ustoz/emily/yuz_4_2.webp"), u("./ustoz/emily/yuz_4_3.webp"), u("./ustoz/emily/yuz_4_4.webp"), u("./ustoz/emily/yuz_4_5.webp"), u("./ustoz/emily/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/emily/poza_5.webp"), w: 196, h: 540, yuz: { x: 26.462, y: 5.257, w: 50.154, h: 16.219, kadr: [u("./ustoz/emily/yuz_5_1.webp"), u("./ustoz/emily/yuz_5_2.webp"), u("./ustoz/emily/yuz_5_3.webp"), u("./ustoz/emily/yuz_5_4.webp"), u("./ustoz/emily/yuz_5_5.webp"), u("./ustoz/emily/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/emily/poza_6.webp"), w: 186, h: 540, yuz: { x: 25.743, y: 5.329, w: 53.795, h: 16.44, kadr: [u("./ustoz/emily/yuz_6_1.webp"), u("./ustoz/emily/yuz_6_2.webp"), u("./ustoz/emily/yuz_6_3.webp"), u("./ustoz/emily/yuz_6_4.webp"), u("./ustoz/emily/yuz_6_5.webp"), u("./ustoz/emily/yuz_6_6.webp")] } },
  },
  jiwoo: {
    lab: "ayol",
    1: { src: u("./ustoz/jiwoo/poza_1.webp"), w: 295, h: 540, yuz: { x: 31.818, y: 5.862, w: 34.917, h: 16.911, kadr: [u("./ustoz/jiwoo/yuz_1_1.webp"), u("./ustoz/jiwoo/yuz_1_2.webp"), u("./ustoz/jiwoo/yuz_1_3.webp"), u("./ustoz/jiwoo/yuz_1_4.webp"), u("./ustoz/jiwoo/yuz_1_5.webp"), u("./ustoz/jiwoo/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/jiwoo/poza_2.webp"), w: 209, h: 540, yuz: { x: 27.326, y: 5.399, w: 51.453, h: 17.548, kadr: [u("./ustoz/jiwoo/yuz_2_1.webp"), u("./ustoz/jiwoo/yuz_2_2.webp"), u("./ustoz/jiwoo/yuz_2_3.webp"), u("./ustoz/jiwoo/yuz_2_4.webp"), u("./ustoz/jiwoo/yuz_2_5.webp"), u("./ustoz/jiwoo/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/jiwoo/poza_3.webp"), w: 268, h: 540, yuz: { x: 14.286, y: 5.624, w: 38.322, h: 17.21, kadr: [u("./ustoz/jiwoo/yuz_3_1.webp"), u("./ustoz/jiwoo/yuz_3_2.webp"), u("./ustoz/jiwoo/yuz_3_3.webp"), u("./ustoz/jiwoo/yuz_3_4.webp"), u("./ustoz/jiwoo/yuz_3_5.webp"), u("./ustoz/jiwoo/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/jiwoo/poza_4.webp"), w: 175, h: 540, yuz: { x: 18.056, y: 5.75, w: 60.417, h: 17.475, kadr: [u("./ustoz/jiwoo/yuz_4_1.webp"), u("./ustoz/jiwoo/yuz_4_2.webp"), u("./ustoz/jiwoo/yuz_4_3.webp"), u("./ustoz/jiwoo/yuz_4_4.webp"), u("./ustoz/jiwoo/yuz_4_5.webp"), u("./ustoz/jiwoo/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/jiwoo/poza_5.webp"), w: 189, h: 540, yuz: { x: 25.484, y: 5.53, w: 56.129, h: 17.381, kadr: [u("./ustoz/jiwoo/yuz_5_1.webp"), u("./ustoz/jiwoo/yuz_5_2.webp"), u("./ustoz/jiwoo/yuz_5_3.webp"), u("./ustoz/jiwoo/yuz_5_4.webp"), u("./ustoz/jiwoo/yuz_5_5.webp"), u("./ustoz/jiwoo/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/jiwoo/poza_6.webp"), w: 171, h: 540, yuz: { x: 20.213, y: 5.506, w: 62.766, h: 17.528, kadr: [u("./ustoz/jiwoo/yuz_6_1.webp"), u("./ustoz/jiwoo/yuz_6_2.webp"), u("./ustoz/jiwoo/yuz_6_3.webp"), u("./ustoz/jiwoo/yuz_6_4.webp"), u("./ustoz/jiwoo/yuz_6_5.webp"), u("./ustoz/jiwoo/yuz_6_6.webp")] } },
  },
  kenji: {
    lab: "erkak",
    1: { src: u("./ustoz/kenji/poza_1.webp"), w: 315, h: 540, yuz: { x: 31.373, y: 5.606, w: 31.765, h: 16.819, kadr: [u("./ustoz/kenji/yuz_1_1.webp"), u("./ustoz/kenji/yuz_1_2.webp"), u("./ustoz/kenji/yuz_1_3.webp"), u("./ustoz/kenji/yuz_1_4.webp"), u("./ustoz/kenji/yuz_1_5.webp"), u("./ustoz/kenji/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/kenji/poza_2.webp"), w: 211, h: 540, yuz: { x: 29.598, y: 5.493, w: 46.839, h: 16.592, kadr: [u("./ustoz/kenji/yuz_2_1.webp"), u("./ustoz/kenji/yuz_2_2.webp"), u("./ustoz/kenji/yuz_2_3.webp"), u("./ustoz/kenji/yuz_2_4.webp"), u("./ustoz/kenji/yuz_2_5.webp"), u("./ustoz/kenji/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/kenji/poza_3.webp"), w: 276, h: 540, yuz: { x: 12.719, y: 5.269, w: 37.719, h: 17.04, kadr: [u("./ustoz/kenji/yuz_3_1.webp"), u("./ustoz/kenji/yuz_3_2.webp"), u("./ustoz/kenji/yuz_3_3.webp"), u("./ustoz/kenji/yuz_3_4.webp"), u("./ustoz/kenji/yuz_3_5.webp"), u("./ustoz/kenji/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/kenji/poza_4.webp"), w: 193, h: 540, yuz: { x: 15.823, y: 5.442, w: 56.329, h: 17.8, kadr: [u("./ustoz/kenji/yuz_4_1.webp"), u("./ustoz/kenji/yuz_4_2.webp"), u("./ustoz/kenji/yuz_4_3.webp"), u("./ustoz/kenji/yuz_4_4.webp"), u("./ustoz/kenji/yuz_4_5.webp"), u("./ustoz/kenji/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/kenji/poza_5.webp"), w: 213, h: 540, yuz: { x: 28.653, y: 5.418, w: 47.564, h: 17.156, kadr: [u("./ustoz/kenji/yuz_5_1.webp"), u("./ustoz/kenji/yuz_5_2.webp"), u("./ustoz/kenji/yuz_5_3.webp"), u("./ustoz/kenji/yuz_5_4.webp"), u("./ustoz/kenji/yuz_5_5.webp"), u("./ustoz/kenji/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/kenji/poza_6.webp"), w: 187, h: 540, yuz: { x: 21.429, y: 5.73, w: 52.273, h: 16.067, kadr: [u("./ustoz/kenji/yuz_6_1.webp"), u("./ustoz/kenji/yuz_6_2.webp"), u("./ustoz/kenji/yuz_6_3.webp"), u("./ustoz/kenji/yuz_6_4.webp"), u("./ustoz/kenji/yuz_6_5.webp"), u("./ustoz/kenji/yuz_6_6.webp")] } },
  },
  lukas: {
    lab: "erkak",
    1: { src: u("./ustoz/lukas/poza_1.webp"), w: 310, h: 540, yuz: { x: 32.685, y: 3.691, w: 30.545, h: 17.45, kadr: [u("./ustoz/lukas/yuz_1_1.webp"), u("./ustoz/lukas/yuz_1_2.webp"), u("./ustoz/lukas/yuz_1_3.webp"), u("./ustoz/lukas/yuz_1_4.webp"), u("./ustoz/lukas/yuz_1_5.webp"), u("./ustoz/lukas/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/lukas/poza_2.webp"), w: 215, h: 540, yuz: { x: 30.086, y: 5.371, w: 46.705, h: 18.057, kadr: [u("./ustoz/lukas/yuz_2_1.webp"), u("./ustoz/lukas/yuz_2_2.webp"), u("./ustoz/lukas/yuz_2_3.webp"), u("./ustoz/lukas/yuz_2_4.webp"), u("./ustoz/lukas/yuz_2_5.webp"), u("./ustoz/lukas/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/lukas/poza_3.webp"), w: 308, h: 540, yuz: { x: 15.23, y: 5.029, w: 35.471, h: 18.286, kadr: [u("./ustoz/lukas/yuz_3_1.webp"), u("./ustoz/lukas/yuz_3_2.webp"), u("./ustoz/lukas/yuz_3_3.webp"), u("./ustoz/lukas/yuz_3_4.webp"), u("./ustoz/lukas/yuz_3_5.webp"), u("./ustoz/lukas/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/lukas/poza_4.webp"), w: 199, h: 540, yuz: { x: 16.109, y: 5.034, w: 50.456, h: 17.45, kadr: [u("./ustoz/lukas/yuz_4_1.webp"), u("./ustoz/lukas/yuz_4_2.webp"), u("./ustoz/lukas/yuz_4_3.webp"), u("./ustoz/lukas/yuz_4_4.webp"), u("./ustoz/lukas/yuz_4_5.webp"), u("./ustoz/lukas/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/lukas/poza_5.webp"), w: 213, h: 540, yuz: { x: 27.273, y: 4.586, w: 45.739, h: 17.673, kadr: [u("./ustoz/lukas/yuz_5_1.webp"), u("./ustoz/lukas/yuz_5_2.webp"), u("./ustoz/lukas/yuz_5_3.webp"), u("./ustoz/lukas/yuz_5_4.webp"), u("./ustoz/lukas/yuz_5_5.webp"), u("./ustoz/lukas/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/lukas/poza_6.webp"), w: 186, h: 540, yuz: { x: 22.442, y: 5.011, w: 53.465, h: 18.223, kadr: [u("./ustoz/lukas/yuz_6_1.webp"), u("./ustoz/lukas/yuz_6_2.webp"), u("./ustoz/lukas/yuz_6_3.webp"), u("./ustoz/lukas/yuz_6_4.webp"), u("./ustoz/lukas/yuz_6_5.webp"), u("./ustoz/lukas/yuz_6_6.webp")] } },
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 315, h: 540, yuz: { x: 27.778, y: 9.396, w: 29.693, h: 15.324, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 232, h: 540, yuz: { x: 20.844, y: 9.535, w: 47.493, h: 18.048, kadr: [u("./ustoz/malika/yuz_2_1.webp"), u("./ustoz/malika/yuz_2_2.webp"), u("./ustoz/malika/yuz_2_3.webp"), u("./ustoz/malika/yuz_2_4.webp"), u("./ustoz/malika/yuz_2_5.webp"), u("./ustoz/malika/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 283, h: 540, yuz: { x: 11.015, y: 10.646, w: 33.477, h: 15.515, kadr: [u("./ustoz/malika/yuz_3_1.webp"), u("./ustoz/malika/yuz_3_2.webp"), u("./ustoz/malika/yuz_3_3.webp"), u("./ustoz/malika/yuz_3_4.webp"), u("./ustoz/malika/yuz_3_5.webp"), u("./ustoz/malika/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 211, h: 540, yuz: { x: 10.857, y: 9.955, w: 45.714, h: 15.884, kadr: [u("./ustoz/malika/yuz_4_1.webp"), u("./ustoz/malika/yuz_4_2.webp"), u("./ustoz/malika/yuz_4_3.webp"), u("./ustoz/malika/yuz_4_4.webp"), u("./ustoz/malika/yuz_4_5.webp"), u("./ustoz/malika/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 227, h: 540, yuz: { x: 17.287, y: 8.959, w: 45.745, h: 17.021, kadr: [u("./ustoz/malika/yuz_5_1.webp"), u("./ustoz/malika/yuz_5_2.webp"), u("./ustoz/malika/yuz_5_3.webp"), u("./ustoz/malika/yuz_5_4.webp"), u("./ustoz/malika/yuz_5_5.webp"), u("./ustoz/malika/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 214, h: 540, yuz: { x: 13.754, y: 9.194, w: 51.289, h: 18.048, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] } },
  },
  mei: {
    lab: "ayol",
    1: { src: u("./ustoz/mei/poza_1.webp"), w: 298, h: 540, yuz: { x: 30.185, y: 5.096, w: 36.345, h: 18.233, kadr: [u("./ustoz/mei/yuz_1_1.webp"), u("./ustoz/mei/yuz_1_2.webp"), u("./ustoz/mei/yuz_1_3.webp"), u("./ustoz/mei/yuz_1_4.webp"), u("./ustoz/mei/yuz_1_5.webp"), u("./ustoz/mei/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/mei/poza_2.webp"), w: 207, h: 540, yuz: { x: 22.874, y: 4.831, w: 52.199, h: 18.539, kadr: [u("./ustoz/mei/yuz_2_1.webp"), u("./ustoz/mei/yuz_2_2.webp"), u("./ustoz/mei/yuz_2_3.webp"), u("./ustoz/mei/yuz_2_4.webp"), u("./ustoz/mei/yuz_2_5.webp"), u("./ustoz/mei/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/mei/poza_3.webp"), w: 284, h: 540, yuz: { x: 12.848, y: 4.617, w: 37.901, h: 18.919, kadr: [u("./ustoz/mei/yuz_3_1.webp"), u("./ustoz/mei/yuz_3_2.webp"), u("./ustoz/mei/yuz_3_3.webp"), u("./ustoz/mei/yuz_3_4.webp"), u("./ustoz/mei/yuz_3_5.webp"), u("./ustoz/mei/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/mei/poza_4.webp"), w: 190, h: 540, yuz: { x: 20.513, y: 5.293, w: 55.449, h: 17.342, kadr: [u("./ustoz/mei/yuz_4_1.webp"), u("./ustoz/mei/yuz_4_2.webp"), u("./ustoz/mei/yuz_4_3.webp"), u("./ustoz/mei/yuz_4_4.webp"), u("./ustoz/mei/yuz_4_5.webp"), u("./ustoz/mei/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/mei/poza_5.webp"), w: 188, h: 540, yuz: { x: 20.847, y: 5.221, w: 57.655, h: 17.934, kadr: [u("./ustoz/mei/yuz_5_1.webp"), u("./ustoz/mei/yuz_5_2.webp"), u("./ustoz/mei/yuz_5_3.webp"), u("./ustoz/mei/yuz_5_4.webp"), u("./ustoz/mei/yuz_5_5.webp"), u("./ustoz/mei/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/mei/poza_6.webp"), w: 181, h: 540, yuz: { x: 21.739, y: 5.163, w: 58.528, h: 18.182, kadr: [u("./ustoz/mei/yuz_6_1.webp"), u("./ustoz/mei/yuz_6_2.webp"), u("./ustoz/mei/yuz_6_3.webp"), u("./ustoz/mei/yuz_6_4.webp"), u("./ustoz/mei/yuz_6_5.webp"), u("./ustoz/mei/yuz_6_6.webp")] } },
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 307, h: 540, yuz: { x: 33.267, y: 4.735, w: 30.297, h: 16.234, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 203, h: 540, yuz: { x: 32.036, y: 5.399, w: 41.317, h: 13.723, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 292, h: 540, yuz: { x: 15.593, y: 5.062, w: 31.393, h: 15.298, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 203, h: 540, yuz: { x: 23.494, y: 4.412, w: 48.795, h: 16.855, kadr: [u("./ustoz/nilufar/yuz_4_1.webp"), u("./ustoz/nilufar/yuz_4_2.webp"), u("./ustoz/nilufar/yuz_4_3.webp"), u("./ustoz/nilufar/yuz_4_4.webp"), u("./ustoz/nilufar/yuz_4_5.webp"), u("./ustoz/nilufar/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 204, h: 540, yuz: { x: 28.657, y: 4.746, w: 45.373, h: 16.271, kadr: [u("./ustoz/nilufar/yuz_5_1.webp"), u("./ustoz/nilufar/yuz_5_2.webp"), u("./ustoz/nilufar/yuz_5_3.webp"), u("./ustoz/nilufar/yuz_5_4.webp"), u("./ustoz/nilufar/yuz_5_5.webp"), u("./ustoz/nilufar/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 192, h: 540, yuz: { x: 27.215, y: 4.837, w: 48.734, h: 15.861, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] } },
  },
  olga: {
    lab: "ayol",
    1: { src: u("./ustoz/olga/poza_1.webp"), w: 332, h: 540, yuz: { x: 31.193, y: 5.756, w: 31.376, h: 17.156, kadr: [u("./ustoz/olga/yuz_1_1.webp"), u("./ustoz/olga/yuz_1_2.webp"), u("./ustoz/olga/yuz_1_3.webp"), u("./ustoz/olga/yuz_1_4.webp"), u("./ustoz/olga/yuz_1_5.webp"), u("./ustoz/olga/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/olga/poza_2.webp"), w: 209, h: 540, yuz: { x: 27.405, y: 5.418, w: 51.895, h: 17.833, kadr: [u("./ustoz/olga/yuz_2_1.webp"), u("./ustoz/olga/yuz_2_2.webp"), u("./ustoz/olga/yuz_2_3.webp"), u("./ustoz/olga/yuz_2_4.webp"), u("./ustoz/olga/yuz_2_5.webp"), u("./ustoz/olga/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/olga/poza_3.webp"), w: 276, h: 540, yuz: { x: 14.537, y: 5.743, w: 37.445, h: 17.455, kadr: [u("./ustoz/olga/yuz_3_1.webp"), u("./ustoz/olga/yuz_3_2.webp"), u("./ustoz/olga/yuz_3_3.webp"), u("./ustoz/olga/yuz_3_4.webp"), u("./ustoz/olga/yuz_3_5.webp"), u("./ustoz/olga/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/olga/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.884, y: 5.817, w: 51.976, h: 17.002, kadr: [u("./ustoz/olga/yuz_4_1.webp"), u("./ustoz/olga/yuz_4_2.webp"), u("./ustoz/olga/yuz_4_3.webp"), u("./ustoz/olga/yuz_4_4.webp"), u("./ustoz/olga/yuz_4_5.webp"), u("./ustoz/olga/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/olga/poza_5.webp"), w: 207, h: 540, yuz: { x: 24.781, y: 5.705, w: 50.729, h: 17.226, kadr: [u("./ustoz/olga/yuz_5_1.webp"), u("./ustoz/olga/yuz_5_2.webp"), u("./ustoz/olga/yuz_5_3.webp"), u("./ustoz/olga/yuz_5_4.webp"), u("./ustoz/olga/yuz_5_5.webp"), u("./ustoz/olga/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/olga/poza_6.webp"), w: 193, h: 540, yuz: { x: 22.082, y: 5.518, w: 55.521, h: 17.905, kadr: [u("./ustoz/olga/yuz_6_1.webp"), u("./ustoz/olga/yuz_6_2.webp"), u("./ustoz/olga/yuz_6_3.webp"), u("./ustoz/olga/yuz_6_4.webp"), u("./ustoz/olga/yuz_6_5.webp"), u("./ustoz/olga/yuz_6_6.webp")] } },
  },
  oliver: {
    lab: "erkak",
    1: { src: u("./ustoz/oliver/poza_1.webp"), w: 330, h: 540, yuz: { x: 31.868, y: 6.264, w: 27.656, h: 16.331, kadr: [u("./ustoz/oliver/yuz_1_1.webp"), u("./ustoz/oliver/yuz_1_2.webp"), u("./ustoz/oliver/yuz_1_3.webp"), u("./ustoz/oliver/yuz_1_4.webp"), u("./ustoz/oliver/yuz_1_5.webp"), u("./ustoz/oliver/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/oliver/poza_2.webp"), w: 211, h: 540, yuz: { x: 32.362, y: 6.606, w: 48.688, h: 16.856, kadr: [u("./ustoz/oliver/yuz_2_1.webp"), u("./ustoz/oliver/yuz_2_2.webp"), u("./ustoz/oliver/yuz_2_3.webp"), u("./ustoz/oliver/yuz_2_4.webp"), u("./ustoz/oliver/yuz_2_5.webp"), u("./ustoz/oliver/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/oliver/poza_3.webp"), w: 300, h: 540, yuz: { x: 16.016, y: 6.834, w: 30.801, h: 16.515, kadr: [u("./ustoz/oliver/yuz_3_1.webp"), u("./ustoz/oliver/yuz_3_2.webp"), u("./ustoz/oliver/yuz_3_3.webp"), u("./ustoz/oliver/yuz_3_4.webp"), u("./ustoz/oliver/yuz_3_5.webp"), u("./ustoz/oliver/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/oliver/poza_4.webp"), w: 191, h: 540, yuz: { x: 22.713, y: 7.271, w: 43.218, h: 13.982, kadr: [u("./ustoz/oliver/yuz_4_1.webp"), u("./ustoz/oliver/yuz_4_2.webp"), u("./ustoz/oliver/yuz_4_3.webp"), u("./ustoz/oliver/yuz_4_4.webp"), u("./ustoz/oliver/yuz_4_5.webp"), u("./ustoz/oliver/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/oliver/poza_5.webp"), w: 267, h: 540, yuz: { x: 25.792, y: 5.928, w: 36.425, h: 17.002, kadr: [u("./ustoz/oliver/yuz_5_1.webp"), u("./ustoz/oliver/yuz_5_2.webp"), u("./ustoz/oliver/yuz_5_3.webp"), u("./ustoz/oliver/yuz_5_4.webp"), u("./ustoz/oliver/yuz_5_5.webp"), u("./ustoz/oliver/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/oliver/poza_6.webp"), w: 196, h: 540, yuz: { x: 24.375, y: 6.932, w: 49.688, h: 16.364, kadr: [u("./ustoz/oliver/yuz_6_1.webp"), u("./ustoz/oliver/yuz_6_2.webp"), u("./ustoz/oliver/yuz_6_3.webp"), u("./ustoz/oliver/yuz_6_4.webp"), u("./ustoz/oliver/yuz_6_5.webp"), u("./ustoz/oliver/yuz_6_6.webp")] } },
  },
  sarah: {
    lab: "ayol",
    1: { src: u("./ustoz/sarah/poza_1.webp"), w: 305, h: 540, yuz: { x: 29.94, y: 4.966, w: 36.727, h: 18.397, kadr: [u("./ustoz/sarah/yuz_1_1.webp"), u("./ustoz/sarah/yuz_1_2.webp"), u("./ustoz/sarah/yuz_1_3.webp"), u("./ustoz/sarah/yuz_1_4.webp"), u("./ustoz/sarah/yuz_1_5.webp"), u("./ustoz/sarah/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sarah/poza_2.webp"), w: 217, h: 540, yuz: { x: 21.569, y: 3.708, w: 58.824, h: 21.798, kadr: [u("./ustoz/sarah/yuz_2_1.webp"), u("./ustoz/sarah/yuz_2_2.webp"), u("./ustoz/sarah/yuz_2_3.webp"), u("./ustoz/sarah/yuz_2_4.webp"), u("./ustoz/sarah/yuz_2_5.webp"), u("./ustoz/sarah/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sarah/poza_3.webp"), w: 264, h: 540, yuz: { x: 15.138, y: 5.163, w: 42.431, h: 18.294, kadr: [u("./ustoz/sarah/yuz_3_1.webp"), u("./ustoz/sarah/yuz_3_2.webp"), u("./ustoz/sarah/yuz_3_3.webp"), u("./ustoz/sarah/yuz_3_4.webp"), u("./ustoz/sarah/yuz_3_5.webp"), u("./ustoz/sarah/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sarah/poza_4.webp"), w: 198, h: 540, yuz: { x: 12.384, y: 3.295, w: 69.659, h: 22.614, kadr: [u("./ustoz/sarah/yuz_4_1.webp"), u("./ustoz/sarah/yuz_4_2.webp"), u("./ustoz/sarah/yuz_4_3.webp"), u("./ustoz/sarah/yuz_4_4.webp"), u("./ustoz/sarah/yuz_4_5.webp"), u("./ustoz/sarah/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sarah/poza_5.webp"), w: 212, h: 540, yuz: { x: 14.655, y: 3.499, w: 62.644, h: 22.009, kadr: [u("./ustoz/sarah/yuz_5_1.webp"), u("./ustoz/sarah/yuz_5_2.webp"), u("./ustoz/sarah/yuz_5_3.webp"), u("./ustoz/sarah/yuz_5_4.webp"), u("./ustoz/sarah/yuz_5_5.webp"), u("./ustoz/sarah/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sarah/poza_6.webp"), w: 188, h: 540, yuz: { x: 29.355, y: 6.397, w: 49.355, h: 15.152, kadr: [u("./ustoz/sarah/yuz_6_1.webp"), u("./ustoz/sarah/yuz_6_2.webp"), u("./ustoz/sarah/yuz_6_3.webp"), u("./ustoz/sarah/yuz_6_4.webp"), u("./ustoz/sarah/yuz_6_5.webp"), u("./ustoz/sarah/yuz_6_6.webp")] } },
  },
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 331, h: 540, yuz: { x: 33.577, y: 5.593, w: 29.015, h: 16.443, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 207, h: 540, yuz: { x: 28.402, y: 5.448, w: 47.041, h: 17.026, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 288, h: 540, yuz: { x: 15.319, y: 5.789, w: 34.468, h: 16.572, kadr: [u("./ustoz/sardor/yuz_3_1.webp"), u("./ustoz/sardor/yuz_3_2.webp"), u("./ustoz/sardor/yuz_3_3.webp"), u("./ustoz/sardor/yuz_3_4.webp"), u("./ustoz/sardor/yuz_3_5.webp"), u("./ustoz/sardor/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 199, h: 540, yuz: { x: 20.303, y: 5.145, w: 50.0, h: 17.226, kadr: [u("./ustoz/sardor/yuz_4_1.webp"), u("./ustoz/sardor/yuz_4_2.webp"), u("./ustoz/sardor/yuz_4_3.webp"), u("./ustoz/sardor/yuz_4_4.webp"), u("./ustoz/sardor/yuz_4_5.webp"), u("./ustoz/sardor/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 214, h: 540, yuz: { x: 28.249, y: 5.375, w: 45.48, h: 17.469, kadr: [u("./ustoz/sardor/yuz_5_1.webp"), u("./ustoz/sardor/yuz_5_2.webp"), u("./ustoz/sardor/yuz_5_3.webp"), u("./ustoz/sardor/yuz_5_4.webp"), u("./ustoz/sardor/yuz_5_5.webp"), u("./ustoz/sardor/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 190, h: 540, yuz: { x: 22.83, y: 5.776, w: 51.768, h: 16.535, kadr: [u("./ustoz/sardor/yuz_6_1.webp"), u("./ustoz/sardor/yuz_6_2.webp"), u("./ustoz/sardor/yuz_6_3.webp"), u("./ustoz/sardor/yuz_6_4.webp"), u("./ustoz/sardor/yuz_6_5.webp"), u("./ustoz/sardor/yuz_6_6.webp")] } },
  },
  svetlana: {
    lab: "ayol",
    1: { src: u("./ustoz/svetlana/poza_1.webp"), w: 319, h: 540, yuz: { x: 30.784, y: 4.746, w: 30.784, h: 17.627, kadr: [u("./ustoz/svetlana/yuz_1_1.webp"), u("./ustoz/svetlana/yuz_1_2.webp"), u("./ustoz/svetlana/yuz_1_3.webp"), u("./ustoz/svetlana/yuz_1_4.webp"), u("./ustoz/svetlana/yuz_1_5.webp"), u("./ustoz/svetlana/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/svetlana/poza_2.webp"), w: 209, h: 540, yuz: { x: 37.681, y: 6.067, w: 40.58, h: 14.494, kadr: [u("./ustoz/svetlana/yuz_2_1.webp"), u("./ustoz/svetlana/yuz_2_2.webp"), u("./ustoz/svetlana/yuz_2_3.webp"), u("./ustoz/svetlana/yuz_2_4.webp"), u("./ustoz/svetlana/yuz_2_5.webp"), u("./ustoz/svetlana/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/svetlana/poza_3.webp"), w: 294, h: 540, yuz: { x: 16.356, y: 4.392, w: 33.333, h: 18.018, kadr: [u("./ustoz/svetlana/yuz_3_1.webp"), u("./ustoz/svetlana/yuz_3_2.webp"), u("./ustoz/svetlana/yuz_3_3.webp"), u("./ustoz/svetlana/yuz_3_4.webp"), u("./ustoz/svetlana/yuz_3_5.webp"), u("./ustoz/svetlana/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/svetlana/poza_4.webp"), w: 176, h: 540, yuz: { x: 22.837, y: 4.505, w: 62.63, h: 18.243, kadr: [u("./ustoz/svetlana/yuz_4_1.webp"), u("./ustoz/svetlana/yuz_4_2.webp"), u("./ustoz/svetlana/yuz_4_3.webp"), u("./ustoz/svetlana/yuz_4_4.webp"), u("./ustoz/svetlana/yuz_4_5.webp"), u("./ustoz/svetlana/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/svetlana/poza_5.webp"), w: 201, h: 540, yuz: { x: 24.848, y: 4.52, w: 51.515, h: 18.418, kadr: [u("./ustoz/svetlana/yuz_5_1.webp"), u("./ustoz/svetlana/yuz_5_2.webp"), u("./ustoz/svetlana/yuz_5_3.webp"), u("./ustoz/svetlana/yuz_5_4.webp"), u("./ustoz/svetlana/yuz_5_5.webp"), u("./ustoz/svetlana/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/svetlana/poza_6.webp"), w: 195, h: 540, yuz: { x: 25.625, y: 4.279, w: 51.562, h: 18.694, kadr: [u("./ustoz/svetlana/yuz_6_1.webp"), u("./ustoz/svetlana/yuz_6_2.webp"), u("./ustoz/svetlana/yuz_6_3.webp"), u("./ustoz/svetlana/yuz_6_4.webp"), u("./ustoz/svetlana/yuz_6_5.webp"), u("./ustoz/svetlana/yuz_6_6.webp")] } },
  },
  yusuf: {
    lab: "erkak",
    1: { src: u("./ustoz/yusuf/poza_1.webp"), w: 362, h: 540, yuz: { x: 35.63, y: 5.405, w: 23.025, h: 14.414, kadr: [u("./ustoz/yusuf/yuz_1_1.webp"), u("./ustoz/yusuf/yuz_1_2.webp"), u("./ustoz/yusuf/yuz_1_3.webp"), u("./ustoz/yusuf/yuz_1_4.webp"), u("./ustoz/yusuf/yuz_1_5.webp"), u("./ustoz/yusuf/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/yusuf/poza_2.webp"), w: 209, h: 540, yuz: { x: 38.372, y: 5.518, w: 40.988, h: 14.077, kadr: [u("./ustoz/yusuf/yuz_2_1.webp"), u("./ustoz/yusuf/yuz_2_2.webp"), u("./ustoz/yusuf/yuz_2_3.webp"), u("./ustoz/yusuf/yuz_2_4.webp"), u("./ustoz/yusuf/yuz_2_5.webp"), u("./ustoz/yusuf/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/yusuf/poza_3.webp"), w: 240, h: 540, yuz: { x: 21.465, y: 5.506, w: 35.606, h: 14.27, kadr: [u("./ustoz/yusuf/yuz_3_1.webp"), u("./ustoz/yusuf/yuz_3_2.webp"), u("./ustoz/yusuf/yuz_3_3.webp"), u("./ustoz/yusuf/yuz_3_4.webp"), u("./ustoz/yusuf/yuz_3_5.webp"), u("./ustoz/yusuf/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/yusuf/poza_4.webp"), w: 188, h: 540, yuz: { x: 26.299, y: 5.323, w: 47.078, h: 14.609, kadr: [u("./ustoz/yusuf/yuz_4_1.webp"), u("./ustoz/yusuf/yuz_4_2.webp"), u("./ustoz/yusuf/yuz_4_3.webp"), u("./ustoz/yusuf/yuz_4_4.webp"), u("./ustoz/yusuf/yuz_4_5.webp"), u("./ustoz/yusuf/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/yusuf/poza_5.webp"), w: 215, h: 540, yuz: { x: 30.966, y: 5.311, w: 40.909, h: 14.463, kadr: [u("./ustoz/yusuf/yuz_5_1.webp"), u("./ustoz/yusuf/yuz_5_2.webp"), u("./ustoz/yusuf/yuz_5_3.webp"), u("./ustoz/yusuf/yuz_5_4.webp"), u("./ustoz/yusuf/yuz_5_5.webp"), u("./ustoz/yusuf/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/yusuf/poza_6.webp"), w: 185, h: 540, yuz: { x: 30.492, y: 5.499, w: 47.541, h: 14.478, kadr: [u("./ustoz/yusuf/yuz_6_1.webp"), u("./ustoz/yusuf/yuz_6_2.webp"), u("./ustoz/yusuf/yuz_6_3.webp"), u("./ustoz/yusuf/yuz_6_4.webp"), u("./ustoz/yusuf/yuz_6_5.webp"), u("./ustoz/yusuf/yuz_6_6.webp")] } },
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
