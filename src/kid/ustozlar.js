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
    1: { src: u("./ustoz/anna/poza_1.webp"), w: 294, h: 540, yuz: { x: 32.988, y: 7.111, w: 25.519, h: 12.19, kadr: [u("./ustoz/anna/yuz_1_1.webp"), u("./ustoz/anna/yuz_1_2.webp"), u("./ustoz/anna/yuz_1_3.webp"), u("./ustoz/anna/yuz_1_4.webp"), u("./ustoz/anna/yuz_1_5.webp"), u("./ustoz/anna/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/anna/poza_2.webp"), w: 215, h: 540, yuz: { x: 32.203, y: 7.416, w: 34.181, h: 11.91, kadr: [u("./ustoz/anna/yuz_2_1.webp"), u("./ustoz/anna/yuz_2_2.webp"), u("./ustoz/anna/yuz_2_3.webp"), u("./ustoz/anna/yuz_2_4.webp"), u("./ustoz/anna/yuz_2_5.webp"), u("./ustoz/anna/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/anna/poza_3.webp"), w: 282, h: 540, yuz: { x: 23.06, y: 7.416, w: 23.491, h: 11.573, kadr: [u("./ustoz/anna/yuz_3_1.webp"), u("./ustoz/anna/yuz_3_2.webp"), u("./ustoz/anna/yuz_3_3.webp"), u("./ustoz/anna/yuz_3_4.webp"), u("./ustoz/anna/yuz_3_5.webp"), u("./ustoz/anna/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/anna/poza_4.webp"), w: 194, h: 540, yuz: { x: 29.781, y: 7.449, w: 35.737, h: 11.4, kadr: [u("./ustoz/anna/yuz_4_1.webp"), u("./ustoz/anna/yuz_4_2.webp"), u("./ustoz/anna/yuz_4_3.webp"), u("./ustoz/anna/yuz_4_4.webp"), u("./ustoz/anna/yuz_4_5.webp"), u("./ustoz/anna/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/anna/poza_5.webp"), w: 215, h: 540, yuz: { x: 26.136, y: 7.449, w: 34.091, h: 11.851, kadr: [u("./ustoz/anna/yuz_5_1.webp"), u("./ustoz/anna/yuz_5_2.webp"), u("./ustoz/anna/yuz_5_3.webp"), u("./ustoz/anna/yuz_5_4.webp"), u("./ustoz/anna/yuz_5_5.webp"), u("./ustoz/anna/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/anna/poza_6.webp"), w: 184, h: 540, yuz: { x: 29.043, y: 7.416, w: 38.944, h: 12.022, kadr: [u("./ustoz/anna/yuz_6_1.webp"), u("./ustoz/anna/yuz_6_2.webp"), u("./ustoz/anna/yuz_6_3.webp"), u("./ustoz/anna/yuz_6_4.webp"), u("./ustoz/anna/yuz_6_5.webp"), u("./ustoz/anna/yuz_6_6.webp")] } },
  },
  camille: {
    lab: "ayol",
    1: { src: u("./ustoz/camille/poza_1.webp"), w: 289, h: 540, yuz: { x: 39.286, y: 8.202, w: 22.059, h: 12.472, kadr: [u("./ustoz/camille/yuz_1_1.webp"), u("./ustoz/camille/yuz_1_2.webp"), u("./ustoz/camille/yuz_1_3.webp"), u("./ustoz/camille/yuz_1_4.webp"), u("./ustoz/camille/yuz_1_5.webp"), u("./ustoz/camille/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/camille/poza_2.webp"), w: 208, h: 540, yuz: { x: 42.815, y: 7.901, w: 30.499, h: 12.415, kadr: [u("./ustoz/camille/yuz_2_1.webp"), u("./ustoz/camille/yuz_2_2.webp"), u("./ustoz/camille/yuz_2_3.webp"), u("./ustoz/camille/yuz_2_4.webp"), u("./ustoz/camille/yuz_2_5.webp"), u("./ustoz/camille/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/camille/poza_3.webp"), w: 271, h: 540, yuz: { x: 17.793, y: 7.901, w: 23.874, h: 12.754, kadr: [u("./ustoz/camille/yuz_3_1.webp"), u("./ustoz/camille/yuz_3_2.webp"), u("./ustoz/camille/yuz_3_3.webp"), u("./ustoz/camille/yuz_3_4.webp"), u("./ustoz/camille/yuz_3_5.webp"), u("./ustoz/camille/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/camille/poza_4.webp"), w: 175, h: 540, yuz: { x: 33.564, y: 8.09, w: 37.716, h: 13.034, kadr: [u("./ustoz/camille/yuz_4_1.webp"), u("./ustoz/camille/yuz_4_2.webp"), u("./ustoz/camille/yuz_4_3.webp"), u("./ustoz/camille/yuz_4_4.webp"), u("./ustoz/camille/yuz_4_5.webp"), u("./ustoz/camille/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/camille/poza_5.webp"), w: 224, h: 540, yuz: { x: 30.728, y: 7.951, w: 28.571, h: 12.654, kadr: [u("./ustoz/camille/yuz_5_1.webp"), u("./ustoz/camille/yuz_5_2.webp"), u("./ustoz/camille/yuz_5_3.webp"), u("./ustoz/camille/yuz_5_4.webp"), u("./ustoz/camille/yuz_5_5.webp"), u("./ustoz/camille/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/camille/poza_6.webp"), w: 179, h: 540, yuz: { x: 37.755, y: 7.901, w: 35.374, h: 12.302, kadr: [u("./ustoz/camille/yuz_6_1.webp"), u("./ustoz/camille/yuz_6_2.webp"), u("./ustoz/camille/yuz_6_3.webp"), u("./ustoz/camille/yuz_6_4.webp"), u("./ustoz/camille/yuz_6_5.webp"), u("./ustoz/camille/yuz_6_6.webp")] } },
  },
  carlos: {
    lab: "erkak",
    1: { src: u("./ustoz/carlos/poza_1.webp"), w: 302, h: 540, yuz: { x: 37.0, y: 7.718, w: 20.8, h: 12.081, kadr: [u("./ustoz/carlos/yuz_1_1.webp"), u("./ustoz/carlos/yuz_1_2.webp"), u("./ustoz/carlos/yuz_1_3.webp"), u("./ustoz/carlos/yuz_1_4.webp"), u("./ustoz/carlos/yuz_1_5.webp"), u("./ustoz/carlos/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/carlos/poza_2.webp"), w: 199, h: 540, yuz: { x: 38.272, y: 7.403, w: 32.099, h: 12.528, kadr: [u("./ustoz/carlos/yuz_2_1.webp"), u("./ustoz/carlos/yuz_2_2.webp"), u("./ustoz/carlos/yuz_2_3.webp"), u("./ustoz/carlos/yuz_2_4.webp"), u("./ustoz/carlos/yuz_2_5.webp"), u("./ustoz/carlos/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/carlos/poza_3.webp"), w: 268, h: 540, yuz: { x: 21.56, y: 7.526, w: 23.394, h: 12.543, kadr: [u("./ustoz/carlos/yuz_3_1.webp"), u("./ustoz/carlos/yuz_3_2.webp"), u("./ustoz/carlos/yuz_3_3.webp"), u("./ustoz/carlos/yuz_3_4.webp"), u("./ustoz/carlos/yuz_3_5.webp"), u("./ustoz/carlos/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/carlos/poza_4.webp"), w: 193, h: 540, yuz: { x: 24.451, y: 6.376, w: 33.229, h: 12.528, kadr: [u("./ustoz/carlos/yuz_4_1.webp"), u("./ustoz/carlos/yuz_4_2.webp"), u("./ustoz/carlos/yuz_4_3.webp"), u("./ustoz/carlos/yuz_4_4.webp"), u("./ustoz/carlos/yuz_4_5.webp"), u("./ustoz/carlos/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/carlos/poza_5.webp"), w: 217, h: 540, yuz: { x: 38.611, y: 6.711, w: 29.444, h: 12.528, kadr: [u("./ustoz/carlos/yuz_5_1.webp"), u("./ustoz/carlos/yuz_5_2.webp"), u("./ustoz/carlos/yuz_5_3.webp"), u("./ustoz/carlos/yuz_5_4.webp"), u("./ustoz/carlos/yuz_5_5.webp"), u("./ustoz/carlos/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/carlos/poza_6.webp"), w: 172, h: 540, yuz: { x: 33.452, y: 7.596, w: 36.655, h: 12.698, kadr: [u("./ustoz/carlos/yuz_6_1.webp"), u("./ustoz/carlos/yuz_6_2.webp"), u("./ustoz/carlos/yuz_6_3.webp"), u("./ustoz/carlos/yuz_6_4.webp"), u("./ustoz/carlos/yuz_6_5.webp"), u("./ustoz/carlos/yuz_6_6.webp")] } },
  },
  daniel: {
    lab: "erkak",
    1: { src: u("./ustoz/daniel/poza_1.webp"), w: 312, h: 540, yuz: { x: 36.893, y: 7.856, w: 21.553, h: 12.795, kadr: [u("./ustoz/daniel/yuz_1_1.webp"), u("./ustoz/daniel/yuz_1_2.webp"), u("./ustoz/daniel/yuz_1_3.webp"), u("./ustoz/daniel/yuz_1_4.webp"), u("./ustoz/daniel/yuz_1_5.webp"), u("./ustoz/daniel/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/daniel/poza_2.webp"), w: 210, h: 540, yuz: { x: 33.913, y: 7.788, w: 31.304, h: 12.867, kadr: [u("./ustoz/daniel/yuz_2_1.webp"), u("./ustoz/daniel/yuz_2_2.webp"), u("./ustoz/daniel/yuz_2_3.webp"), u("./ustoz/daniel/yuz_2_4.webp"), u("./ustoz/daniel/yuz_2_5.webp"), u("./ustoz/daniel/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/daniel/poza_3.webp"), w: 280, h: 540, yuz: { x: 21.739, y: 7.788, w: 23.261, h: 12.754, kadr: [u("./ustoz/daniel/yuz_3_1.webp"), u("./ustoz/daniel/yuz_3_2.webp"), u("./ustoz/daniel/yuz_3_3.webp"), u("./ustoz/daniel/yuz_3_4.webp"), u("./ustoz/daniel/yuz_3_5.webp"), u("./ustoz/daniel/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/daniel/poza_4.webp"), w: 199, h: 540, yuz: { x: 28.354, y: 7.753, w: 34.451, h: 13.034, kadr: [u("./ustoz/daniel/yuz_4_1.webp"), u("./ustoz/daniel/yuz_4_2.webp"), u("./ustoz/daniel/yuz_4_3.webp"), u("./ustoz/daniel/yuz_4_4.webp"), u("./ustoz/daniel/yuz_4_5.webp"), u("./ustoz/daniel/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/daniel/poza_5.webp"), w: 219, h: 540, yuz: { x: 34.626, y: 7.969, w: 30.471, h: 12.795, kadr: [u("./ustoz/daniel/yuz_5_1.webp"), u("./ustoz/daniel/yuz_5_2.webp"), u("./ustoz/daniel/yuz_5_3.webp"), u("./ustoz/daniel/yuz_5_4.webp"), u("./ustoz/daniel/yuz_5_5.webp"), u("./ustoz/daniel/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/daniel/poza_6.webp"), w: 199, h: 540, yuz: { x: 29.755, y: 7.675, w: 33.129, h: 13.093, kadr: [u("./ustoz/daniel/yuz_6_1.webp"), u("./ustoz/daniel/yuz_6_2.webp"), u("./ustoz/daniel/yuz_6_3.webp"), u("./ustoz/daniel/yuz_6_4.webp"), u("./ustoz/daniel/yuz_6_5.webp"), u("./ustoz/daniel/yuz_6_6.webp")] } },
  },
  dmitriy: {
    lab: "erkak",
    1: { src: u("./ustoz/dmitriy/poza_1.webp"), w: 306, h: 540, yuz: { x: 38.416, y: 7.071, w: 20.0, h: 9.428, kadr: [u("./ustoz/dmitriy/yuz_1_1.webp"), u("./ustoz/dmitriy/yuz_1_2.webp"), u("./ustoz/dmitriy/yuz_1_3.webp"), u("./ustoz/dmitriy/yuz_1_4.webp"), u("./ustoz/dmitriy/yuz_1_5.webp"), u("./ustoz/dmitriy/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/dmitriy/poza_2.webp"), w: 205, h: 540, yuz: { x: 37.798, y: 6.554, w: 30.655, h: 10.395, kadr: [u("./ustoz/dmitriy/yuz_2_1.webp"), u("./ustoz/dmitriy/yuz_2_2.webp"), u("./ustoz/dmitriy/yuz_2_3.webp"), u("./ustoz/dmitriy/yuz_2_4.webp"), u("./ustoz/dmitriy/yuz_2_5.webp"), u("./ustoz/dmitriy/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/dmitriy/poza_3.webp"), w: 282, h: 540, yuz: { x: 20.174, y: 6.689, w: 21.475, h: 9.637, kadr: [u("./ustoz/dmitriy/yuz_3_1.webp"), u("./ustoz/dmitriy/yuz_3_2.webp"), u("./ustoz/dmitriy/yuz_3_3.webp"), u("./ustoz/dmitriy/yuz_3_4.webp"), u("./ustoz/dmitriy/yuz_3_5.webp"), u("./ustoz/dmitriy/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/dmitriy/poza_4.webp"), w: 187, h: 540, yuz: { x: 27.832, y: 6.376, w: 33.657, h: 10.067, kadr: [u("./ustoz/dmitriy/yuz_4_1.webp"), u("./ustoz/dmitriy/yuz_4_2.webp"), u("./ustoz/dmitriy/yuz_4_3.webp"), u("./ustoz/dmitriy/yuz_4_4.webp"), u("./ustoz/dmitriy/yuz_4_5.webp"), u("./ustoz/dmitriy/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/dmitriy/poza_5.webp"), w: 198, h: 540, yuz: { x: 34.969, y: 6.958, w: 30.675, h: 9.54, kadr: [u("./ustoz/dmitriy/yuz_5_1.webp"), u("./ustoz/dmitriy/yuz_5_2.webp"), u("./ustoz/dmitriy/yuz_5_3.webp"), u("./ustoz/dmitriy/yuz_5_4.webp"), u("./ustoz/dmitriy/yuz_5_5.webp"), u("./ustoz/dmitriy/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/dmitriy/poza_6.webp"), w: 184, h: 540, yuz: { x: 33.223, y: 6.78, w: 33.223, h: 9.718, kadr: [u("./ustoz/dmitriy/yuz_6_1.webp"), u("./ustoz/dmitriy/yuz_6_2.webp"), u("./ustoz/dmitriy/yuz_6_3.webp"), u("./ustoz/dmitriy/yuz_6_4.webp"), u("./ustoz/dmitriy/yuz_6_5.webp"), u("./ustoz/dmitriy/yuz_6_6.webp")] } },
  },
  elif: {
    lab: "ayol",
    1: { src: u("./ustoz/elif/poza_1.webp"), w: 302, h: 540, yuz: { x: 35.542, y: 5.624, w: 24.9, h: 13.723, kadr: [u("./ustoz/elif/yuz_1_1.webp"), u("./ustoz/elif/yuz_1_2.webp"), u("./ustoz/elif/yuz_1_3.webp"), u("./ustoz/elif/yuz_1_4.webp"), u("./ustoz/elif/yuz_1_5.webp"), u("./ustoz/elif/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/elif/poza_2.webp"), w: 214, h: 540, yuz: { x: 40.171, y: 7.103, w: 29.915, h: 10.147, kadr: [u("./ustoz/elif/yuz_2_1.webp"), u("./ustoz/elif/yuz_2_2.webp"), u("./ustoz/elif/yuz_2_3.webp"), u("./ustoz/elif/yuz_2_4.webp"), u("./ustoz/elif/yuz_2_5.webp"), u("./ustoz/elif/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/elif/poza_3.webp"), w: 272, h: 540, yuz: { x: 24.943, y: 7.184, w: 23.583, h: 10.376, kadr: [u("./ustoz/elif/yuz_3_1.webp"), u("./ustoz/elif/yuz_3_2.webp"), u("./ustoz/elif/yuz_3_3.webp"), u("./ustoz/elif/yuz_3_4.webp"), u("./ustoz/elif/yuz_3_5.webp"), u("./ustoz/elif/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/elif/poza_4.webp"), w: 205, h: 540, yuz: { x: 28.955, y: 5.995, w: 35.821, h: 13.348, kadr: [u("./ustoz/elif/yuz_4_1.webp"), u("./ustoz/elif/yuz_4_2.webp"), u("./ustoz/elif/yuz_4_3.webp"), u("./ustoz/elif/yuz_4_4.webp"), u("./ustoz/elif/yuz_4_5.webp"), u("./ustoz/elif/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/elif/poza_5.webp"), w: 203, h: 540, yuz: { x: 31.737, y: 7.424, w: 31.737, h: 10.236, kadr: [u("./ustoz/elif/yuz_5_1.webp"), u("./ustoz/elif/yuz_5_2.webp"), u("./ustoz/elif/yuz_5_3.webp"), u("./ustoz/elif/yuz_5_4.webp"), u("./ustoz/elif/yuz_5_5.webp"), u("./ustoz/elif/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/elif/poza_6.webp"), w: 192, h: 540, yuz: { x: 30.189, y: 6.264, w: 38.679, h: 12.416, kadr: [u("./ustoz/elif/yuz_6_1.webp"), u("./ustoz/elif/yuz_6_2.webp"), u("./ustoz/elif/yuz_6_3.webp"), u("./ustoz/elif/yuz_6_4.webp"), u("./ustoz/elif/yuz_6_5.webp"), u("./ustoz/elif/yuz_6_6.webp")] } },
  },
  emily: {
    lab: "ayol",
    1: { src: u("./ustoz/emily/poza_1.webp"), w: 324, h: 540, yuz: { x: 37.803, y: 7.047, w: 19.739, h: 12.081, kadr: [u("./ustoz/emily/yuz_1_1.webp"), u("./ustoz/emily/yuz_1_2.webp"), u("./ustoz/emily/yuz_1_3.webp"), u("./ustoz/emily/yuz_1_4.webp"), u("./ustoz/emily/yuz_1_5.webp"), u("./ustoz/emily/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/emily/poza_2.webp"), w: 217, h: 540, yuz: { x: 39.888, y: 7.127, w: 28.933, h: 12.217, kadr: [u("./ustoz/emily/yuz_2_1.webp"), u("./ustoz/emily/yuz_2_2.webp"), u("./ustoz/emily/yuz_2_3.webp"), u("./ustoz/emily/yuz_2_4.webp"), u("./ustoz/emily/yuz_2_5.webp"), u("./ustoz/emily/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/emily/poza_3.webp"), w: 283, h: 540, yuz: { x: 22.03, y: 7.37, w: 22.03, h: 11.905, kadr: [u("./ustoz/emily/yuz_3_1.webp"), u("./ustoz/emily/yuz_3_2.webp"), u("./ustoz/emily/yuz_3_3.webp"), u("./ustoz/emily/yuz_3_4.webp"), u("./ustoz/emily/yuz_3_5.webp"), u("./ustoz/emily/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/emily/poza_4.webp"), w: 200, h: 540, yuz: { x: 33.636, y: 7.175, w: 31.818, h: 12.108, kadr: [u("./ustoz/emily/yuz_4_1.webp"), u("./ustoz/emily/yuz_4_2.webp"), u("./ustoz/emily/yuz_4_3.webp"), u("./ustoz/emily/yuz_4_4.webp"), u("./ustoz/emily/yuz_4_5.webp"), u("./ustoz/emily/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/emily/poza_5.webp"), w: 196, h: 540, yuz: { x: 33.231, y: 6.935, w: 33.231, h: 11.745, kadr: [u("./ustoz/emily/yuz_5_1.webp"), u("./ustoz/emily/yuz_5_2.webp"), u("./ustoz/emily/yuz_5_3.webp"), u("./ustoz/emily/yuz_5_4.webp"), u("./ustoz/emily/yuz_5_5.webp"), u("./ustoz/emily/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/emily/poza_6.webp"), w: 186, h: 540, yuz: { x: 34.323, y: 7.029, w: 33.993, h: 12.018, kadr: [u("./ustoz/emily/yuz_6_1.webp"), u("./ustoz/emily/yuz_6_2.webp"), u("./ustoz/emily/yuz_6_3.webp"), u("./ustoz/emily/yuz_6_4.webp"), u("./ustoz/emily/yuz_6_5.webp"), u("./ustoz/emily/yuz_6_6.webp")] } },
  },
  jiwoo: {
    lab: "ayol",
    1: { src: u("./ustoz/jiwoo/poza_1.webp"), w: 295, h: 540, yuz: { x: 38.223, y: 7.666, w: 21.901, h: 12.063, kadr: [u("./ustoz/jiwoo/yuz_1_1.webp"), u("./ustoz/jiwoo/yuz_1_2.webp"), u("./ustoz/jiwoo/yuz_1_3.webp"), u("./ustoz/jiwoo/yuz_1_4.webp"), u("./ustoz/jiwoo/yuz_1_5.webp"), u("./ustoz/jiwoo/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/jiwoo/poza_2.webp"), w: 209, h: 540, yuz: { x: 37.791, y: 7.312, w: 31.977, h: 12.598, kadr: [u("./ustoz/jiwoo/yuz_2_1.webp"), u("./ustoz/jiwoo/yuz_2_2.webp"), u("./ustoz/jiwoo/yuz_2_3.webp"), u("./ustoz/jiwoo/yuz_2_4.webp"), u("./ustoz/jiwoo/yuz_2_5.webp"), u("./ustoz/jiwoo/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/jiwoo/poza_3.webp"), w: 268, h: 540, yuz: { x: 21.315, y: 8.324, w: 23.81, h: 11.474, kadr: [u("./ustoz/jiwoo/yuz_3_1.webp"), u("./ustoz/jiwoo/yuz_3_2.webp"), u("./ustoz/jiwoo/yuz_3_3.webp"), u("./ustoz/jiwoo/yuz_3_4.webp"), u("./ustoz/jiwoo/yuz_3_5.webp"), u("./ustoz/jiwoo/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/jiwoo/poza_4.webp"), w: 175, h: 540, yuz: { x: 30.556, y: 7.328, w: 37.5, h: 12.74, kadr: [u("./ustoz/jiwoo/yuz_4_1.webp"), u("./ustoz/jiwoo/yuz_4_2.webp"), u("./ustoz/jiwoo/yuz_4_3.webp"), u("./ustoz/jiwoo/yuz_4_4.webp"), u("./ustoz/jiwoo/yuz_4_5.webp"), u("./ustoz/jiwoo/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/jiwoo/poza_5.webp"), w: 189, h: 540, yuz: { x: 35.484, y: 8.465, w: 34.839, h: 11.287, kadr: [u("./ustoz/jiwoo/yuz_5_1.webp"), u("./ustoz/jiwoo/yuz_5_2.webp"), u("./ustoz/jiwoo/yuz_5_3.webp"), u("./ustoz/jiwoo/yuz_5_4.webp"), u("./ustoz/jiwoo/yuz_5_5.webp"), u("./ustoz/jiwoo/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/jiwoo/poza_6.webp"), w: 171, h: 540, yuz: { x: 32.27, y: 7.978, w: 37.234, h: 12.022, kadr: [u("./ustoz/jiwoo/yuz_6_1.webp"), u("./ustoz/jiwoo/yuz_6_2.webp"), u("./ustoz/jiwoo/yuz_6_3.webp"), u("./ustoz/jiwoo/yuz_6_4.webp"), u("./ustoz/jiwoo/yuz_6_5.webp"), u("./ustoz/jiwoo/yuz_6_6.webp")] } },
  },
  kenji: {
    lab: "erkak",
    1: { src: u("./ustoz/kenji/poza_1.webp"), w: 315, h: 540, yuz: { x: 38.039, y: 7.551, w: 19.608, h: 12.815, kadr: [u("./ustoz/kenji/yuz_1_1.webp"), u("./ustoz/kenji/yuz_1_2.webp"), u("./ustoz/kenji/yuz_1_3.webp"), u("./ustoz/kenji/yuz_1_4.webp"), u("./ustoz/kenji/yuz_1_5.webp"), u("./ustoz/kenji/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/kenji/poza_2.webp"), w: 211, h: 540, yuz: { x: 39.655, y: 7.399, w: 28.448, h: 12.668, kadr: [u("./ustoz/kenji/yuz_2_1.webp"), u("./ustoz/kenji/yuz_2_2.webp"), u("./ustoz/kenji/yuz_2_3.webp"), u("./ustoz/kenji/yuz_2_4.webp"), u("./ustoz/kenji/yuz_2_5.webp"), u("./ustoz/kenji/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/kenji/poza_3.webp"), w: 276, h: 540, yuz: { x: 20.395, y: 7.287, w: 22.807, h: 12.892, kadr: [u("./ustoz/kenji/yuz_3_1.webp"), u("./ustoz/kenji/yuz_3_2.webp"), u("./ustoz/kenji/yuz_3_3.webp"), u("./ustoz/kenji/yuz_3_4.webp"), u("./ustoz/kenji/yuz_3_5.webp"), u("./ustoz/kenji/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/kenji/poza_4.webp"), w: 193, h: 540, yuz: { x: 27.848, y: 7.596, w: 35.127, h: 13.492, kadr: [u("./ustoz/kenji/yuz_4_1.webp"), u("./ustoz/kenji/yuz_4_2.webp"), u("./ustoz/kenji/yuz_4_3.webp"), u("./ustoz/kenji/yuz_4_4.webp"), u("./ustoz/kenji/yuz_4_5.webp"), u("./ustoz/kenji/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/kenji/poza_5.webp"), w: 213, h: 540, yuz: { x: 38.682, y: 7.675, w: 29.226, h: 12.754, kadr: [u("./ustoz/kenji/yuz_5_1.webp"), u("./ustoz/kenji/yuz_5_2.webp"), u("./ustoz/kenji/yuz_5_3.webp"), u("./ustoz/kenji/yuz_5_4.webp"), u("./ustoz/kenji/yuz_5_5.webp"), u("./ustoz/kenji/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/kenji/poza_6.webp"), w: 187, h: 540, yuz: { x: 32.468, y: 7.64, w: 32.468, h: 12.247, kadr: [u("./ustoz/kenji/yuz_6_1.webp"), u("./ustoz/kenji/yuz_6_2.webp"), u("./ustoz/kenji/yuz_6_3.webp"), u("./ustoz/kenji/yuz_6_4.webp"), u("./ustoz/kenji/yuz_6_5.webp"), u("./ustoz/kenji/yuz_6_6.webp")] } },
  },
  lukas: {
    lab: "erkak",
    1: { src: u("./ustoz/lukas/poza_1.webp"), w: 310, h: 540, yuz: { x: 39.105, y: 9.843, w: 23.152, h: 9.732, kadr: [u("./ustoz/lukas/yuz_1_1.webp"), u("./ustoz/lukas/yuz_1_2.webp"), u("./ustoz/lukas/yuz_1_3.webp"), u("./ustoz/lukas/yuz_1_4.webp"), u("./ustoz/lukas/yuz_1_5.webp"), u("./ustoz/lukas/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/lukas/poza_2.webp"), w: 215, h: 540, yuz: { x: 34.957, y: 11.886, w: 35.244, h: 9.943, kadr: [u("./ustoz/lukas/yuz_2_1.webp"), u("./ustoz/lukas/yuz_2_2.webp"), u("./ustoz/lukas/yuz_2_3.webp"), u("./ustoz/lukas/yuz_2_4.webp"), u("./ustoz/lukas/yuz_2_5.webp"), u("./ustoz/lukas/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/lukas/poza_3.webp"), w: 308, h: 540, yuz: { x: 18.036, y: 11.543, w: 24.85, h: 10.057, kadr: [u("./ustoz/lukas/yuz_3_1.webp"), u("./ustoz/lukas/yuz_3_2.webp"), u("./ustoz/lukas/yuz_3_3.webp"), u("./ustoz/lukas/yuz_3_4.webp"), u("./ustoz/lukas/yuz_3_5.webp"), u("./ustoz/lukas/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/lukas/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.581, y: 11.186, w: 37.69, h: 9.732, kadr: [u("./ustoz/lukas/yuz_4_1.webp"), u("./ustoz/lukas/yuz_4_2.webp"), u("./ustoz/lukas/yuz_4_3.webp"), u("./ustoz/lukas/yuz_4_4.webp"), u("./ustoz/lukas/yuz_4_5.webp"), u("./ustoz/lukas/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/lukas/poza_5.webp"), w: 213, h: 540, yuz: { x: 37.216, y: 10.85, w: 29.83, h: 9.843, kadr: [u("./ustoz/lukas/yuz_5_1.webp"), u("./ustoz/lukas/yuz_5_2.webp"), u("./ustoz/lukas/yuz_5_3.webp"), u("./ustoz/lukas/yuz_5_4.webp"), u("./ustoz/lukas/yuz_5_5.webp"), u("./ustoz/lukas/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/lukas/poza_6.webp"), w: 186, h: 540, yuz: { x: 27.723, y: 11.503, w: 40.594, h: 10.137, kadr: [u("./ustoz/lukas/yuz_6_1.webp"), u("./ustoz/lukas/yuz_6_2.webp"), u("./ustoz/lukas/yuz_6_3.webp"), u("./ustoz/lukas/yuz_6_4.webp"), u("./ustoz/lukas/yuz_6_5.webp"), u("./ustoz/lukas/yuz_6_6.webp")] } },
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 315, h: 540, yuz: { x: 34.483, y: 10.85, w: 21.648, h: 11.521, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 232, h: 540, yuz: { x: 32.19, y: 11.578, w: 30.343, h: 13.053, kadr: [u("./ustoz/malika/yuz_2_1.webp"), u("./ustoz/malika/yuz_2_2.webp"), u("./ustoz/malika/yuz_2_3.webp"), u("./ustoz/malika/yuz_2_4.webp"), u("./ustoz/malika/yuz_2_5.webp"), u("./ustoz/malika/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 283, h: 540, yuz: { x: 18.359, y: 12.344, w: 24.622, h: 11.212, kadr: [u("./ustoz/malika/yuz_3_1.webp"), u("./ustoz/malika/yuz_3_2.webp"), u("./ustoz/malika/yuz_3_3.webp"), u("./ustoz/malika/yuz_3_4.webp"), u("./ustoz/malika/yuz_3_5.webp"), u("./ustoz/malika/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 211, h: 540, yuz: { x: 20.286, y: 11.745, w: 34.286, h: 11.409, kadr: [u("./ustoz/malika/yuz_4_1.webp"), u("./ustoz/malika/yuz_4_2.webp"), u("./ustoz/malika/yuz_4_3.webp"), u("./ustoz/malika/yuz_4_4.webp"), u("./ustoz/malika/yuz_4_5.webp"), u("./ustoz/malika/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 227, h: 540, yuz: { x: 27.926, y: 10.638, w: 30.319, h: 12.654, kadr: [u("./ustoz/malika/yuz_5_1.webp"), u("./ustoz/malika/yuz_5_2.webp"), u("./ustoz/malika/yuz_5_3.webp"), u("./ustoz/malika/yuz_5_4.webp"), u("./ustoz/malika/yuz_5_5.webp"), u("./ustoz/malika/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 214, h: 540, yuz: { x: 26.074, y: 11.351, w: 32.951, h: 12.826, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] } },
  },
  mei: {
    lab: "ayol",
    1: { src: u("./ustoz/mei/poza_1.webp"), w: 298, h: 540, yuz: { x: 36.961, y: 6.908, w: 22.382, h: 12.797, kadr: [u("./ustoz/mei/yuz_1_1.webp"), u("./ustoz/mei/yuz_1_2.webp"), u("./ustoz/mei/yuz_1_3.webp"), u("./ustoz/mei/yuz_1_4.webp"), u("./ustoz/mei/yuz_1_5.webp"), u("./ustoz/mei/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/mei/poza_2.webp"), w: 207, h: 540, yuz: { x: 33.431, y: 6.966, w: 31.965, h: 12.697, kadr: [u("./ustoz/mei/yuz_2_1.webp"), u("./ustoz/mei/yuz_2_2.webp"), u("./ustoz/mei/yuz_2_3.webp"), u("./ustoz/mei/yuz_2_4.webp"), u("./ustoz/mei/yuz_2_5.webp"), u("./ustoz/mei/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/mei/poza_3.webp"), w: 284, h: 540, yuz: { x: 20.343, y: 6.757, w: 23.983, h: 13.063, kadr: [u("./ustoz/mei/yuz_3_1.webp"), u("./ustoz/mei/yuz_3_2.webp"), u("./ustoz/mei/yuz_3_3.webp"), u("./ustoz/mei/yuz_3_4.webp"), u("./ustoz/mei/yuz_3_5.webp"), u("./ustoz/mei/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/mei/poza_4.webp"), w: 190, h: 540, yuz: { x: 29.808, y: 7.095, w: 35.256, h: 12.162, kadr: [u("./ustoz/mei/yuz_4_1.webp"), u("./ustoz/mei/yuz_4_2.webp"), u("./ustoz/mei/yuz_4_3.webp"), u("./ustoz/mei/yuz_4_4.webp"), u("./ustoz/mei/yuz_4_5.webp"), u("./ustoz/mei/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/mei/poza_5.webp"), w: 188, h: 540, yuz: { x: 30.945, y: 7.037, w: 35.831, h: 12.599, kadr: [u("./ustoz/mei/yuz_5_1.webp"), u("./ustoz/mei/yuz_5_2.webp"), u("./ustoz/mei/yuz_5_3.webp"), u("./ustoz/mei/yuz_5_4.webp"), u("./ustoz/mei/yuz_5_5.webp"), u("./ustoz/mei/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/mei/poza_6.webp"), w: 181, h: 540, yuz: { x: 32.776, y: 7.183, w: 36.12, h: 12.57, kadr: [u("./ustoz/mei/yuz_6_1.webp"), u("./ustoz/mei/yuz_6_2.webp"), u("./ustoz/mei/yuz_6_3.webp"), u("./ustoz/mei/yuz_6_4.webp"), u("./ustoz/mei/yuz_6_5.webp"), u("./ustoz/mei/yuz_6_6.webp")] } },
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 307, h: 540, yuz: { x: 37.822, y: 6.652, w: 20.792, h: 11.725, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 203, h: 540, yuz: { x: 34.731, y: 7.199, w: 31.138, h: 9.899, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 292, h: 540, yuz: { x: 19.751, y: 6.862, w: 21.622, h: 11.136, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 203, h: 540, yuz: { x: 31.627, y: 6.448, w: 32.53, h: 12.104, kadr: [u("./ustoz/nilufar/yuz_4_1.webp"), u("./ustoz/nilufar/yuz_4_2.webp"), u("./ustoz/nilufar/yuz_4_3.webp"), u("./ustoz/nilufar/yuz_4_4.webp"), u("./ustoz/nilufar/yuz_4_5.webp"), u("./ustoz/nilufar/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 204, h: 540, yuz: { x: 35.224, y: 7.006, w: 31.94, h: 11.412, kadr: [u("./ustoz/nilufar/yuz_5_1.webp"), u("./ustoz/nilufar/yuz_5_2.webp"), u("./ustoz/nilufar/yuz_5_3.webp"), u("./ustoz/nilufar/yuz_5_4.webp"), u("./ustoz/nilufar/yuz_5_5.webp"), u("./ustoz/nilufar/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 192, h: 540, yuz: { x: 34.81, y: 6.749, w: 32.595, h: 11.474, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] } },
  },
  olga: {
    lab: "ayol",
    1: { src: u("./ustoz/olga/poza_1.webp"), w: 332, h: 540, yuz: { x: 33.761, y: 7.223, w: 22.018, h: 12.528, kadr: [u("./ustoz/olga/yuz_1_1.webp"), u("./ustoz/olga/yuz_1_2.webp"), u("./ustoz/olga/yuz_1_3.webp"), u("./ustoz/olga/yuz_1_4.webp"), u("./ustoz/olga/yuz_1_5.webp"), u("./ustoz/olga/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/olga/poza_2.webp"), w: 209, h: 540, yuz: { x: 36.443, y: 7.223, w: 31.487, h: 12.754, kadr: [u("./ustoz/olga/yuz_2_1.webp"), u("./ustoz/olga/yuz_2_2.webp"), u("./ustoz/olga/yuz_2_3.webp"), u("./ustoz/olga/yuz_2_4.webp"), u("./ustoz/olga/yuz_2_5.webp"), u("./ustoz/olga/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/olga/poza_3.webp"), w: 276, h: 540, yuz: { x: 20.485, y: 7.32, w: 24.229, h: 12.613, kadr: [u("./ustoz/olga/yuz_3_1.webp"), u("./ustoz/olga/yuz_3_2.webp"), u("./ustoz/olga/yuz_3_3.webp"), u("./ustoz/olga/yuz_3_4.webp"), u("./ustoz/olga/yuz_3_5.webp"), u("./ustoz/olga/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/olga/poza_4.webp"), w: 199, h: 540, yuz: { x: 29.787, y: 7.494, w: 33.435, h: 12.304, kadr: [u("./ustoz/olga/yuz_4_1.webp"), u("./ustoz/olga/yuz_4_2.webp"), u("./ustoz/olga/yuz_4_3.webp"), u("./ustoz/olga/yuz_4_4.webp"), u("./ustoz/olga/yuz_4_5.webp"), u("./ustoz/olga/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/olga/poza_5.webp"), w: 207, h: 540, yuz: { x: 32.362, y: 7.383, w: 32.07, h: 12.416, kadr: [u("./ustoz/olga/yuz_5_1.webp"), u("./ustoz/olga/yuz_5_2.webp"), u("./ustoz/olga/yuz_5_3.webp"), u("./ustoz/olga/yuz_5_4.webp"), u("./ustoz/olga/yuz_5_5.webp"), u("./ustoz/olga/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/olga/poza_6.webp"), w: 193, h: 540, yuz: { x: 31.861, y: 7.32, w: 34.385, h: 12.838, kadr: [u("./ustoz/olga/yuz_6_1.webp"), u("./ustoz/olga/yuz_6_2.webp"), u("./ustoz/olga/yuz_6_3.webp"), u("./ustoz/olga/yuz_6_4.webp"), u("./ustoz/olga/yuz_6_5.webp"), u("./ustoz/olga/yuz_6_6.webp")] } },
  },
  oliver: {
    lab: "erkak",
    1: { src: u("./ustoz/oliver/poza_1.webp"), w: 330, h: 540, yuz: { x: 35.348, y: 8.277, w: 20.513, h: 11.969, kadr: [u("./ustoz/oliver/yuz_1_1.webp"), u("./ustoz/oliver/yuz_1_2.webp"), u("./ustoz/oliver/yuz_1_3.webp"), u("./ustoz/oliver/yuz_1_4.webp"), u("./ustoz/oliver/yuz_1_5.webp"), u("./ustoz/oliver/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/oliver/poza_2.webp"), w: 211, h: 540, yuz: { x: 40.525, y: 8.2, w: 31.778, h: 12.984, kadr: [u("./ustoz/oliver/yuz_2_1.webp"), u("./ustoz/oliver/yuz_2_2.webp"), u("./ustoz/oliver/yuz_2_3.webp"), u("./ustoz/oliver/yuz_2_4.webp"), u("./ustoz/oliver/yuz_2_5.webp"), u("./ustoz/oliver/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/oliver/poza_3.webp"), w: 300, h: 540, yuz: { x: 20.123, y: 8.77, w: 21.971, h: 12.301, kadr: [u("./ustoz/oliver/yuz_3_1.webp"), u("./ustoz/oliver/yuz_3_2.webp"), u("./ustoz/oliver/yuz_3_3.webp"), u("./ustoz/oliver/yuz_3_4.webp"), u("./ustoz/oliver/yuz_3_5.webp"), u("./ustoz/oliver/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/oliver/poza_4.webp"), w: 191, h: 540, yuz: { x: 23.344, y: 8.277, w: 36.278, h: 11.298, kadr: [u("./ustoz/oliver/yuz_4_1.webp"), u("./ustoz/oliver/yuz_4_2.webp"), u("./ustoz/oliver/yuz_4_3.webp"), u("./ustoz/oliver/yuz_4_4.webp"), u("./ustoz/oliver/yuz_4_5.webp"), u("./ustoz/oliver/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/oliver/poza_5.webp"), w: 267, h: 540, yuz: { x: 31.222, y: 7.718, w: 25.566, h: 12.864, kadr: [u("./ustoz/oliver/yuz_5_1.webp"), u("./ustoz/oliver/yuz_5_2.webp"), u("./ustoz/oliver/yuz_5_3.webp"), u("./ustoz/oliver/yuz_5_4.webp"), u("./ustoz/oliver/yuz_5_5.webp"), u("./ustoz/oliver/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/oliver/poza_6.webp"), w: 196, h: 540, yuz: { x: 31.562, y: 8.75, w: 33.438, h: 12.386, kadr: [u("./ustoz/oliver/yuz_6_1.webp"), u("./ustoz/oliver/yuz_6_2.webp"), u("./ustoz/oliver/yuz_6_3.webp"), u("./ustoz/oliver/yuz_6_4.webp"), u("./ustoz/oliver/yuz_6_5.webp"), u("./ustoz/oliver/yuz_6_6.webp")] } },
  },
  sarah: {
    lab: "ayol",
    1: { src: u("./ustoz/sarah/poza_1.webp"), w: 305, h: 540, yuz: { x: 36.128, y: 6.885, w: 21.956, h: 12.528, kadr: [u("./ustoz/sarah/yuz_1_1.webp"), u("./ustoz/sarah/yuz_1_2.webp"), u("./ustoz/sarah/yuz_1_3.webp"), u("./ustoz/sarah/yuz_1_4.webp"), u("./ustoz/sarah/yuz_1_5.webp"), u("./ustoz/sarah/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sarah/poza_2.webp"), w: 217, h: 540, yuz: { x: 31.933, y: 6.966, w: 35.294, h: 13.82, kadr: [u("./ustoz/sarah/yuz_2_1.webp"), u("./ustoz/sarah/yuz_2_2.webp"), u("./ustoz/sarah/yuz_2_3.webp"), u("./ustoz/sarah/yuz_2_4.webp"), u("./ustoz/sarah/yuz_2_5.webp"), u("./ustoz/sarah/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sarah/poza_3.webp"), w: 264, h: 540, yuz: { x: 22.018, y: 7.295, w: 25.229, h: 12.233, kadr: [u("./ustoz/sarah/yuz_3_1.webp"), u("./ustoz/sarah/yuz_3_2.webp"), u("./ustoz/sarah/yuz_3_3.webp"), u("./ustoz/sarah/yuz_3_4.webp"), u("./ustoz/sarah/yuz_3_5.webp"), u("./ustoz/sarah/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sarah/poza_4.webp"), w: 198, h: 540, yuz: { x: 25.387, y: 6.477, w: 39.628, h: 14.432, kadr: [u("./ustoz/sarah/yuz_4_1.webp"), u("./ustoz/sarah/yuz_4_2.webp"), u("./ustoz/sarah/yuz_4_3.webp"), u("./ustoz/sarah/yuz_4_4.webp"), u("./ustoz/sarah/yuz_4_5.webp"), u("./ustoz/sarah/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sarah/poza_5.webp"), w: 212, h: 540, yuz: { x: 25.862, y: 6.433, w: 36.782, h: 14.221, kadr: [u("./ustoz/sarah/yuz_5_1.webp"), u("./ustoz/sarah/yuz_5_2.webp"), u("./ustoz/sarah/yuz_5_3.webp"), u("./ustoz/sarah/yuz_5_4.webp"), u("./ustoz/sarah/yuz_5_5.webp"), u("./ustoz/sarah/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sarah/poza_6.webp"), w: 188, h: 540, yuz: { x: 32.258, y: 8.305, w: 35.161, h: 10.101, kadr: [u("./ustoz/sarah/yuz_6_1.webp"), u("./ustoz/sarah/yuz_6_2.webp"), u("./ustoz/sarah/yuz_6_3.webp"), u("./ustoz/sarah/yuz_6_4.webp"), u("./ustoz/sarah/yuz_6_5.webp"), u("./ustoz/sarah/yuz_6_6.webp")] } },
  },
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 331, h: 540, yuz: { x: 39.234, y: 11.409, w: 18.978, h: 9.06, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 207, h: 540, yuz: { x: 39.349, y: 11.464, w: 29.586, h: 9.308, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 288, h: 540, yuz: { x: 21.277, y: 11.464, w: 22.34, h: 9.308, kadr: [u("./ustoz/sardor/yuz_3_1.webp"), u("./ustoz/sardor/yuz_3_2.webp"), u("./ustoz/sardor/yuz_3_3.webp"), u("./ustoz/sardor/yuz_3_4.webp"), u("./ustoz/sardor/yuz_3_5.webp"), u("./ustoz/sardor/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 199, h: 540, yuz: { x: 30.909, y: 11.186, w: 32.424, h: 9.508, kadr: [u("./ustoz/sardor/yuz_4_1.webp"), u("./ustoz/sardor/yuz_4_2.webp"), u("./ustoz/sardor/yuz_4_3.webp"), u("./ustoz/sardor/yuz_4_4.webp"), u("./ustoz/sardor/yuz_4_5.webp"), u("./ustoz/sardor/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 214, h: 540, yuz: { x: 37.288, y: 11.534, w: 29.944, h: 9.63, kadr: [u("./ustoz/sardor/yuz_5_1.webp"), u("./ustoz/sardor/yuz_5_2.webp"), u("./ustoz/sardor/yuz_5_3.webp"), u("./ustoz/sardor/yuz_5_4.webp"), u("./ustoz/sardor/yuz_5_5.webp"), u("./ustoz/sardor/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 190, h: 540, yuz: { x: 33.762, y: 11.552, w: 33.119, h: 9.173, kadr: [u("./ustoz/sardor/yuz_6_1.webp"), u("./ustoz/sardor/yuz_6_2.webp"), u("./ustoz/sardor/yuz_6_3.webp"), u("./ustoz/sardor/yuz_6_4.webp"), u("./ustoz/sardor/yuz_6_5.webp"), u("./ustoz/sardor/yuz_6_6.webp")] } },
  },
  svetlana: {
    lab: "ayol",
    1: { src: u("./ustoz/svetlana/poza_1.webp"), w: 319, h: 540, yuz: { x: 35.946, y: 6.893, w: 20.65, h: 12.203, kadr: [u("./ustoz/svetlana/yuz_1_1.webp"), u("./ustoz/svetlana/yuz_1_2.webp"), u("./ustoz/svetlana/yuz_1_3.webp"), u("./ustoz/svetlana/yuz_1_4.webp"), u("./ustoz/svetlana/yuz_1_5.webp"), u("./ustoz/svetlana/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/svetlana/poza_2.webp"), w: 209, h: 540, yuz: { x: 41.159, y: 7.753, w: 29.565, h: 10.112, kadr: [u("./ustoz/svetlana/yuz_2_1.webp"), u("./ustoz/svetlana/yuz_2_2.webp"), u("./ustoz/svetlana/yuz_2_3.webp"), u("./ustoz/svetlana/yuz_2_4.webp"), u("./ustoz/svetlana/yuz_2_5.webp"), u("./ustoz/svetlana/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/svetlana/poza_3.webp"), w: 294, h: 540, yuz: { x: 22.153, y: 6.757, w: 22.567, h: 12.275, kadr: [u("./ustoz/svetlana/yuz_3_1.webp"), u("./ustoz/svetlana/yuz_3_2.webp"), u("./ustoz/svetlana/yuz_3_3.webp"), u("./ustoz/svetlana/yuz_3_4.webp"), u("./ustoz/svetlana/yuz_3_5.webp"), u("./ustoz/svetlana/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/svetlana/poza_4.webp"), w: 176, h: 540, yuz: { x: 35.986, y: 6.982, w: 35.64, h: 12.275, kadr: [u("./ustoz/svetlana/yuz_4_1.webp"), u("./ustoz/svetlana/yuz_4_2.webp"), u("./ustoz/svetlana/yuz_4_3.webp"), u("./ustoz/svetlana/yuz_4_4.webp"), u("./ustoz/svetlana/yuz_4_5.webp"), u("./ustoz/svetlana/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/svetlana/poza_5.webp"), w: 201, h: 540, yuz: { x: 34.242, y: 6.893, w: 33.333, h: 12.542, kadr: [u("./ustoz/svetlana/yuz_5_1.webp"), u("./ustoz/svetlana/yuz_5_2.webp"), u("./ustoz/svetlana/yuz_5_3.webp"), u("./ustoz/svetlana/yuz_5_4.webp"), u("./ustoz/svetlana/yuz_5_5.webp"), u("./ustoz/svetlana/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/svetlana/poza_6.webp"), w: 195, h: 540, yuz: { x: 35.625, y: 6.532, w: 34.062, h: 12.838, kadr: [u("./ustoz/svetlana/yuz_6_1.webp"), u("./ustoz/svetlana/yuz_6_2.webp"), u("./ustoz/svetlana/yuz_6_3.webp"), u("./ustoz/svetlana/yuz_6_4.webp"), u("./ustoz/svetlana/yuz_6_5.webp"), u("./ustoz/svetlana/yuz_6_6.webp")] } },
  },
  yusuf: {
    lab: "erkak",
    1: { src: u("./ustoz/yusuf/poza_1.webp"), w: 362, h: 540, yuz: { x: 38.824, y: 6.419, w: 16.639, h: 9.685, kadr: [u("./ustoz/yusuf/yuz_1_1.webp"), u("./ustoz/yusuf/yuz_1_2.webp"), u("./ustoz/yusuf/yuz_1_3.webp"), u("./ustoz/yusuf/yuz_1_4.webp"), u("./ustoz/yusuf/yuz_1_5.webp"), u("./ustoz/yusuf/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/yusuf/poza_2.webp"), w: 209, h: 540, yuz: { x: 44.477, y: 6.644, w: 27.907, h: 10.811, kadr: [u("./ustoz/yusuf/yuz_2_1.webp"), u("./ustoz/yusuf/yuz_2_2.webp"), u("./ustoz/yusuf/yuz_2_3.webp"), u("./ustoz/yusuf/yuz_2_4.webp"), u("./ustoz/yusuf/yuz_2_5.webp"), u("./ustoz/yusuf/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/yusuf/poza_3.webp"), w: 240, h: 540, yuz: { x: 26.768, y: 6.629, w: 23.99, h: 10.899, kadr: [u("./ustoz/yusuf/yuz_3_1.webp"), u("./ustoz/yusuf/yuz_3_2.webp"), u("./ustoz/yusuf/yuz_3_3.webp"), u("./ustoz/yusuf/yuz_3_4.webp"), u("./ustoz/yusuf/yuz_3_5.webp"), u("./ustoz/yusuf/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/yusuf/poza_4.webp"), w: 188, h: 540, yuz: { x: 33.117, y: 6.229, w: 32.468, h: 11.438, kadr: [u("./ustoz/yusuf/yuz_4_1.webp"), u("./ustoz/yusuf/yuz_4_2.webp"), u("./ustoz/yusuf/yuz_4_3.webp"), u("./ustoz/yusuf/yuz_4_4.webp"), u("./ustoz/yusuf/yuz_4_5.webp"), u("./ustoz/yusuf/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/yusuf/poza_5.webp"), w: 215, h: 540, yuz: { x: 36.932, y: 6.215, w: 28.125, h: 11.412, kadr: [u("./ustoz/yusuf/yuz_5_1.webp"), u("./ustoz/yusuf/yuz_5_2.webp"), u("./ustoz/yusuf/yuz_5_3.webp"), u("./ustoz/yusuf/yuz_5_4.webp"), u("./ustoz/yusuf/yuz_5_5.webp"), u("./ustoz/yusuf/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/yusuf/poza_6.webp"), w: 185, h: 540, yuz: { x: 38.033, y: 6.734, w: 31.475, h: 10.999, kadr: [u("./ustoz/yusuf/yuz_6_1.webp"), u("./ustoz/yusuf/yuz_6_2.webp"), u("./ustoz/yusuf/yuz_6_3.webp"), u("./ustoz/yusuf/yuz_6_4.webp"), u("./ustoz/yusuf/yuz_6_5.webp"), u("./ustoz/yusuf/yuz_6_6.webp")] } },
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
