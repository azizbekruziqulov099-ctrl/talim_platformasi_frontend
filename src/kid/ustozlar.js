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
    1: { src: u("./ustoz/anna/poza_1.webp"), w: 294, h: 540, yuz: { x: 41.851, y: 13.431, w: 15.145, h: 8.126, kadr: [u("./ustoz/anna/yuz_1_1.webp"), u("./ustoz/anna/yuz_1_2.webp"), u("./ustoz/anna/yuz_1_3.webp"), u("./ustoz/anna/yuz_1_4.webp"), u("./ustoz/anna/yuz_1_5.webp"), u("./ustoz/anna/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/anna/poza_2.webp"), w: 215, h: 540, yuz: { x: 27.684, y: 7.303, w: 23.446, h: 9.551, kadr: [u("./ustoz/anna/yuz_2_1.webp"), u("./ustoz/anna/yuz_2_2.webp"), u("./ustoz/anna/yuz_2_3.webp"), u("./ustoz/anna/yuz_2_4.webp"), u("./ustoz/anna/yuz_2_5.webp"), u("./ustoz/anna/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/anna/poza_3.webp"), w: 282, h: 540, yuz: { x: 17.964, y: 7.488, w: 29.526, h: 13.708, kadr: [u("./ustoz/anna/yuz_3_1.webp"), u("./ustoz/anna/yuz_3_2.webp"), u("./ustoz/anna/yuz_3_3.webp"), u("./ustoz/anna/yuz_3_4.webp"), u("./ustoz/anna/yuz_3_5.webp"), u("./ustoz/anna/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/anna/poza_4.webp"), w: 194, h: 540, yuz: { x: 22.884, y: 6.772, w: 48.589, h: 14.898, kadr: [u("./ustoz/anna/yuz_4_1.webp"), u("./ustoz/anna/yuz_4_2.webp"), u("./ustoz/anna/yuz_4_3.webp"), u("./ustoz/anna/yuz_4_4.webp"), u("./ustoz/anna/yuz_4_5.webp"), u("./ustoz/anna/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/anna/poza_5.webp"), w: 215, h: 540, yuz: { x: 21.875, y: 8.352, w: 45.17, h: 13.205, kadr: [u("./ustoz/anna/yuz_5_1.webp"), u("./ustoz/anna/yuz_5_2.webp"), u("./ustoz/anna/yuz_5_3.webp"), u("./ustoz/anna/yuz_5_4.webp"), u("./ustoz/anna/yuz_5_5.webp"), u("./ustoz/anna/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/anna/poza_6.webp"), w: 184, h: 540, yuz: { x: 24.092, y: 8.242, w: 52.805, h: 13.258, kadr: [u("./ustoz/anna/yuz_6_1.webp"), u("./ustoz/anna/yuz_6_2.webp"), u("./ustoz/anna/yuz_6_3.webp"), u("./ustoz/anna/yuz_6_4.webp"), u("./ustoz/anna/yuz_6_5.webp"), u("./ustoz/anna/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/anna/poza_7.webp"), w: 255, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  camille: {
    lab: "ayol",
    1: { src: u("./ustoz/camille/poza_1.webp"), w: 289, h: 540, yuz: { x: 34.034, y: 10.562, w: 31.723, h: 13.258, kadr: [u("./ustoz/camille/yuz_1_1.webp"), u("./ustoz/camille/yuz_1_2.webp"), u("./ustoz/camille/yuz_1_3.webp"), u("./ustoz/camille/yuz_1_4.webp"), u("./ustoz/camille/yuz_1_5.webp"), u("./ustoz/camille/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/camille/poza_2.webp"), w: 208, h: 540, yuz: { x: 46.73, y: 14.686, w: 32.639, h: 7.229, kadr: [u("./ustoz/camille/yuz_2_1.webp"), u("./ustoz/camille/yuz_2_2.webp"), u("./ustoz/camille/yuz_2_3.webp"), u("./ustoz/camille/yuz_2_4.webp"), u("./ustoz/camille/yuz_2_5.webp"), u("./ustoz/camille/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/camille/poza_3.webp"), w: 271, h: 540, yuz: { x: 14.414, y: 10.158, w: 31.757, h: 13.77, kadr: [u("./ustoz/camille/yuz_3_1.webp"), u("./ustoz/camille/yuz_3_2.webp"), u("./ustoz/camille/yuz_3_3.webp"), u("./ustoz/camille/yuz_3_4.webp"), u("./ustoz/camille/yuz_3_5.webp"), u("./ustoz/camille/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/camille/poza_4.webp"), w: 175, h: 540, yuz: { x: 43.945, y: 15.056, w: 23.875, h: 7.978, kadr: [u("./ustoz/camille/yuz_4_1.webp"), u("./ustoz/camille/yuz_4_2.webp"), u("./ustoz/camille/yuz_4_3.webp"), u("./ustoz/camille/yuz_4_4.webp"), u("./ustoz/camille/yuz_4_5.webp"), u("./ustoz/camille/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/camille/poza_5.webp"), w: 224, h: 540, yuz: { x: 25.337, y: 8.063, w: 38.814, h: 15.566, kadr: [u("./ustoz/camille/yuz_5_1.webp"), u("./ustoz/camille/yuz_5_2.webp"), u("./ustoz/camille/yuz_5_3.webp"), u("./ustoz/camille/yuz_5_4.webp"), u("./ustoz/camille/yuz_5_5.webp"), u("./ustoz/camille/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/camille/poza_6.webp"), w: 179, h: 540, yuz: { x: 32.993, y: 10.384, w: 43.197, h: 12.98, kadr: [u("./ustoz/camille/yuz_6_1.webp"), u("./ustoz/camille/yuz_6_2.webp"), u("./ustoz/camille/yuz_6_3.webp"), u("./ustoz/camille/yuz_6_4.webp"), u("./ustoz/camille/yuz_6_5.webp"), u("./ustoz/camille/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/camille/poza_7.webp"), w: 264, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  carlos: {
    lab: "erkak",
    1: { src: u("./ustoz/carlos/poza_1.webp"), w: 302, h: 540, yuz: { x: 36.6, y: 9.843, w: 24.6, h: 11.521, kadr: [u("./ustoz/carlos/yuz_1_1.webp"), u("./ustoz/carlos/yuz_1_2.webp"), u("./ustoz/carlos/yuz_1_3.webp"), u("./ustoz/carlos/yuz_1_4.webp"), u("./ustoz/carlos/yuz_1_5.webp"), u("./ustoz/carlos/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/carlos/poza_2.webp"), w: 199, h: 540, yuz: { x: 37.46, y: 9.909, w: 36.728, h: 11.617, kadr: [u("./ustoz/carlos/yuz_2_1.webp"), u("./ustoz/carlos/yuz_2_2.webp"), u("./ustoz/carlos/yuz_2_3.webp"), u("./ustoz/carlos/yuz_2_4.webp"), u("./ustoz/carlos/yuz_2_5.webp"), u("./ustoz/carlos/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/carlos/poza_3.webp"), w: 268, h: 540, yuz: { x: 26.456, y: 13.991, w: 17.213, h: 7.366, kadr: [u("./ustoz/carlos/yuz_3_1.webp"), u("./ustoz/carlos/yuz_3_2.webp"), u("./ustoz/carlos/yuz_3_3.webp"), u("./ustoz/carlos/yuz_3_4.webp"), u("./ustoz/carlos/yuz_3_5.webp"), u("./ustoz/carlos/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/carlos/poza_4.webp"), w: 193, h: 540, yuz: { x: 14.843, y: 6.488, w: 51.097, h: 14.43, kadr: [u("./ustoz/carlos/yuz_4_1.webp"), u("./ustoz/carlos/yuz_4_2.webp"), u("./ustoz/carlos/yuz_4_3.webp"), u("./ustoz/carlos/yuz_4_4.webp"), u("./ustoz/carlos/yuz_4_5.webp"), u("./ustoz/carlos/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/carlos/poza_5.webp"), w: 217, h: 540, yuz: { x: 31.389, y: 6.711, w: 44.167, h: 14.541, kadr: [u("./ustoz/carlos/yuz_5_1.webp"), u("./ustoz/carlos/yuz_5_2.webp"), u("./ustoz/carlos/yuz_5_3.webp"), u("./ustoz/carlos/yuz_5_4.webp"), u("./ustoz/carlos/yuz_5_5.webp"), u("./ustoz/carlos/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/carlos/poza_6.webp"), w: 172, h: 540, yuz: { x: 39.38, y: 12.864, w: 31.014, h: 9.048, kadr: [u("./ustoz/carlos/yuz_6_1.webp"), u("./ustoz/carlos/yuz_6_2.webp"), u("./ustoz/carlos/yuz_6_3.webp"), u("./ustoz/carlos/yuz_6_4.webp"), u("./ustoz/carlos/yuz_6_5.webp"), u("./ustoz/carlos/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/carlos/poza_7.webp"), w: 259, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  daniel: {
    lab: "erkak",
    1: { src: u("./ustoz/daniel/poza_1.webp"), w: 312, h: 540, yuz: { x: 37.864, y: 9.989, w: 21.748, h: 10.999, kadr: [u("./ustoz/daniel/yuz_1_1.webp"), u("./ustoz/daniel/yuz_1_2.webp"), u("./ustoz/daniel/yuz_1_3.webp"), u("./ustoz/daniel/yuz_1_4.webp"), u("./ustoz/daniel/yuz_1_5.webp"), u("./ustoz/daniel/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/daniel/poza_2.webp"), w: 210, h: 540, yuz: { x: 30.621, y: 8.014, w: 35.362, h: 11.512, kadr: [u("./ustoz/daniel/yuz_2_1.webp"), u("./ustoz/daniel/yuz_2_2.webp"), u("./ustoz/daniel/yuz_2_3.webp"), u("./ustoz/daniel/yuz_2_4.webp"), u("./ustoz/daniel/yuz_2_5.webp"), u("./ustoz/daniel/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/daniel/poza_3.webp"), w: 280, h: 540, yuz: { x: 17.174, y: 8.014, w: 28.478, h: 12.415, kadr: [u("./ustoz/daniel/yuz_3_1.webp"), u("./ustoz/daniel/yuz_3_2.webp"), u("./ustoz/daniel/yuz_3_3.webp"), u("./ustoz/daniel/yuz_3_4.webp"), u("./ustoz/daniel/yuz_3_5.webp"), u("./ustoz/daniel/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/daniel/poza_4.webp"), w: 199, h: 540, yuz: { x: 20.122, y: 7.865, w: 50.915, h: 14.944, kadr: [u("./ustoz/daniel/yuz_4_1.webp"), u("./ustoz/daniel/yuz_4_2.webp"), u("./ustoz/daniel/yuz_4_3.webp"), u("./ustoz/daniel/yuz_4_4.webp"), u("./ustoz/daniel/yuz_4_5.webp"), u("./ustoz/daniel/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/daniel/poza_5.webp"), w: 219, h: 540, yuz: { x: 34.349, y: 10.662, w: 30.748, h: 10.213, kadr: [u("./ustoz/daniel/yuz_5_1.webp"), u("./ustoz/daniel/yuz_5_2.webp"), u("./ustoz/daniel/yuz_5_3.webp"), u("./ustoz/daniel/yuz_5_4.webp"), u("./ustoz/daniel/yuz_5_5.webp"), u("./ustoz/daniel/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/daniel/poza_6.webp"), w: 199, h: 540, yuz: { x: 21.779, y: 7.788, w: 49.693, h: 14.786, kadr: [u("./ustoz/daniel/yuz_6_1.webp"), u("./ustoz/daniel/yuz_6_2.webp"), u("./ustoz/daniel/yuz_6_3.webp"), u("./ustoz/daniel/yuz_6_4.webp"), u("./ustoz/daniel/yuz_6_5.webp"), u("./ustoz/daniel/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/daniel/poza_7.webp"), w: 252, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  dmitriy: {
    lab: "erkak",
    1: { src: u("./ustoz/dmitriy/poza_1.webp"), w: 306, h: 540, yuz: { x: 38.089, y: 8.866, w: 22.574, h: 10.999, kadr: [u("./ustoz/dmitriy/yuz_1_1.webp"), u("./ustoz/dmitriy/yuz_1_2.webp"), u("./ustoz/dmitriy/yuz_1_3.webp"), u("./ustoz/dmitriy/yuz_1_4.webp"), u("./ustoz/dmitriy/yuz_1_5.webp"), u("./ustoz/dmitriy/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/dmitriy/poza_2.webp"), w: 205, h: 540, yuz: { x: 31.548, y: 6.554, w: 43.155, h: 14.689, kadr: [u("./ustoz/dmitriy/yuz_2_1.webp"), u("./ustoz/dmitriy/yuz_2_2.webp"), u("./ustoz/dmitriy/yuz_2_3.webp"), u("./ustoz/dmitriy/yuz_2_4.webp"), u("./ustoz/dmitriy/yuz_2_5.webp"), u("./ustoz/dmitriy/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/dmitriy/poza_3.webp"), w: 282, h: 540, yuz: { x: 19.957, y: 8.73, w: 24.295, h: 10.998, kadr: [u("./ustoz/dmitriy/yuz_3_1.webp"), u("./ustoz/dmitriy/yuz_3_2.webp"), u("./ustoz/dmitriy/yuz_3_3.webp"), u("./ustoz/dmitriy/yuz_3_4.webp"), u("./ustoz/dmitriy/yuz_3_5.webp"), u("./ustoz/dmitriy/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/dmitriy/poza_4.webp"), w: 187, h: 540, yuz: { x: 20.712, y: 7.271, w: 47.573, h: 13.423, kadr: [u("./ustoz/dmitriy/yuz_4_1.webp"), u("./ustoz/dmitriy/yuz_4_2.webp"), u("./ustoz/dmitriy/yuz_4_3.webp"), u("./ustoz/dmitriy/yuz_4_4.webp"), u("./ustoz/dmitriy/yuz_4_5.webp"), u("./ustoz/dmitriy/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/dmitriy/poza_5.webp"), w: 198, h: 540, yuz: { x: 34.969, y: 8.754, w: 34.356, h: 10.999, kadr: [u("./ustoz/dmitriy/yuz_5_1.webp"), u("./ustoz/dmitriy/yuz_5_2.webp"), u("./ustoz/dmitriy/yuz_5_3.webp"), u("./ustoz/dmitriy/yuz_5_4.webp"), u("./ustoz/dmitriy/yuz_5_5.webp"), u("./ustoz/dmitriy/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/dmitriy/poza_6.webp"), w: 184, h: 540, yuz: { x: 25.914, y: 6.893, w: 48.505, h: 13.898, kadr: [u("./ustoz/dmitriy/yuz_6_1.webp"), u("./ustoz/dmitriy/yuz_6_2.webp"), u("./ustoz/dmitriy/yuz_6_3.webp"), u("./ustoz/dmitriy/yuz_6_4.webp"), u("./ustoz/dmitriy/yuz_6_5.webp"), u("./ustoz/dmitriy/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/dmitriy/poza_7.webp"), w: 276, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  elif: {
    lab: "ayol",
    1: { src: u("./ustoz/elif/poza_1.webp"), w: 302, h: 540, yuz: { x: 47.108, y: 12.829, w: 17.892, h: 10.641, kadr: [u("./ustoz/elif/yuz_1_1.webp"), u("./ustoz/elif/yuz_1_2.webp"), u("./ustoz/elif/yuz_1_3.webp"), u("./ustoz/elif/yuz_1_4.webp"), u("./ustoz/elif/yuz_1_5.webp"), u("./ustoz/elif/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/elif/poza_2.webp"), w: 214, h: 540, yuz: { x: 38.177, y: 8.794, w: 35.043, h: 11.95, kadr: [u("./ustoz/elif/yuz_2_1.webp"), u("./ustoz/elif/yuz_2_2.webp"), u("./ustoz/elif/yuz_2_3.webp"), u("./ustoz/elif/yuz_2_4.webp"), u("./ustoz/elif/yuz_2_5.webp"), u("./ustoz/elif/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/elif/poza_3.webp"), w: 272, h: 540, yuz: { x: 23.356, y: 8.78, w: 27.664, h: 12.087, kadr: [u("./ustoz/elif/yuz_3_1.webp"), u("./ustoz/elif/yuz_3_2.webp"), u("./ustoz/elif/yuz_3_3.webp"), u("./ustoz/elif/yuz_3_4.webp"), u("./ustoz/elif/yuz_3_5.webp"), u("./ustoz/elif/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/elif/poza_4.webp"), w: 205, h: 540, yuz: { x: 31.968, y: 8.734, w: 30.91, h: 12.251, kadr: [u("./ustoz/elif/yuz_4_1.webp"), u("./ustoz/elif/yuz_4_2.webp"), u("./ustoz/elif/yuz_4_3.webp"), u("./ustoz/elif/yuz_4_4.webp"), u("./ustoz/elif/yuz_4_5.webp"), u("./ustoz/elif/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/elif/poza_5.webp"), w: 203, h: 540, yuz: { x: 29.641, y: 8.886, w: 38.323, h: 11.811, kadr: [u("./ustoz/elif/yuz_5_1.webp"), u("./ustoz/elif/yuz_5_2.webp"), u("./ustoz/elif/yuz_5_3.webp"), u("./ustoz/elif/yuz_5_4.webp"), u("./ustoz/elif/yuz_5_5.webp"), u("./ustoz/elif/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/elif/poza_6.webp"), w: 192, h: 540, yuz: { x: 37.736, y: 8.501, w: 32.075, h: 11.409, kadr: [u("./ustoz/elif/yuz_6_1.webp"), u("./ustoz/elif/yuz_6_2.webp"), u("./ustoz/elif/yuz_6_3.webp"), u("./ustoz/elif/yuz_6_4.webp"), u("./ustoz/elif/yuz_6_5.webp"), u("./ustoz/elif/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/elif/poza_7.webp"), w: 279, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  emily: {
    lab: "ayol",
    1: { src: u("./ustoz/emily/poza_1.webp"), w: 324, h: 540, yuz: { x: 37.803, y: 9.134, w: 21.974, h: 11.186, kadr: [u("./ustoz/emily/yuz_1_1.webp"), u("./ustoz/emily/yuz_1_2.webp"), u("./ustoz/emily/yuz_1_3.webp"), u("./ustoz/emily/yuz_1_4.webp"), u("./ustoz/emily/yuz_1_5.webp"), u("./ustoz/emily/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/emily/poza_2.webp"), w: 217, h: 540, yuz: { x: 46.21, y: 13.493, w: 21.826, h: 8.195, kadr: [u("./ustoz/emily/yuz_2_1.webp"), u("./ustoz/emily/yuz_2_2.webp"), u("./ustoz/emily/yuz_2_3.webp"), u("./ustoz/emily/yuz_2_4.webp"), u("./ustoz/emily/yuz_2_5.webp"), u("./ustoz/emily/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/emily/poza_3.webp"), w: 283, h: 540, yuz: { x: 15.551, y: 7.483, w: 36.501, h: 14.739, kadr: [u("./ustoz/emily/yuz_3_1.webp"), u("./ustoz/emily/yuz_3_2.webp"), u("./ustoz/emily/yuz_3_3.webp"), u("./ustoz/emily/yuz_3_4.webp"), u("./ustoz/emily/yuz_3_5.webp"), u("./ustoz/emily/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/emily/poza_4.webp"), w: 200, h: 540, yuz: { x: 24.545, y: 8.632, w: 52.121, h: 13.789, kadr: [u("./ustoz/emily/yuz_4_1.webp"), u("./ustoz/emily/yuz_4_2.webp"), u("./ustoz/emily/yuz_4_3.webp"), u("./ustoz/emily/yuz_4_4.webp"), u("./ustoz/emily/yuz_4_5.webp"), u("./ustoz/emily/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/emily/poza_5.webp"), w: 196, h: 540, yuz: { x: 25.231, y: 7.12, w: 52.308, h: 14.318, kadr: [u("./ustoz/emily/yuz_5_1.webp"), u("./ustoz/emily/yuz_5_2.webp"), u("./ustoz/emily/yuz_5_3.webp"), u("./ustoz/emily/yuz_5_4.webp"), u("./ustoz/emily/yuz_5_5.webp"), u("./ustoz/emily/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/emily/poza_6.webp"), w: 186, h: 540, yuz: { x: 24.545, y: 7.143, w: 55.776, h: 14.739, kadr: [u("./ustoz/emily/yuz_6_1.webp"), u("./ustoz/emily/yuz_6_2.webp"), u("./ustoz/emily/yuz_6_3.webp"), u("./ustoz/emily/yuz_6_4.webp"), u("./ustoz/emily/yuz_6_5.webp"), u("./ustoz/emily/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/emily/poza_7.webp"), w: 280, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  jiwoo: {
    lab: "ayol",
    1: { src: u("./ustoz/jiwoo/poza_1.webp"), w: 295, h: 540, yuz: { x: 33.678, y: 7.892, w: 31.818, h: 14.431, kadr: [u("./ustoz/jiwoo/yuz_1_1.webp"), u("./ustoz/jiwoo/yuz_1_2.webp"), u("./ustoz/jiwoo/yuz_1_3.webp"), u("./ustoz/jiwoo/yuz_1_4.webp"), u("./ustoz/jiwoo/yuz_1_5.webp"), u("./ustoz/jiwoo/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/jiwoo/poza_2.webp"), w: 209, h: 540, yuz: { x: 31.105, y: 8.959, w: 42.151, h: 13.611, kadr: [u("./ustoz/jiwoo/yuz_2_1.webp"), u("./ustoz/jiwoo/yuz_2_2.webp"), u("./ustoz/jiwoo/yuz_2_3.webp"), u("./ustoz/jiwoo/yuz_2_4.webp"), u("./ustoz/jiwoo/yuz_2_5.webp"), u("./ustoz/jiwoo/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/jiwoo/poza_3.webp"), w: 268, h: 540, yuz: { x: 15.646, y: 9.449, w: 36.961, h: 13.723, kadr: [u("./ustoz/jiwoo/yuz_3_1.webp"), u("./ustoz/jiwoo/yuz_3_2.webp"), u("./ustoz/jiwoo/yuz_3_3.webp"), u("./ustoz/jiwoo/yuz_3_4.webp"), u("./ustoz/jiwoo/yuz_3_5.webp"), u("./ustoz/jiwoo/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/jiwoo/poza_4.webp"), w: 175, h: 540, yuz: { x: 23.264, y: 7.779, w: 52.778, h: 15.107, kadr: [u("./ustoz/jiwoo/yuz_4_1.webp"), u("./ustoz/jiwoo/yuz_4_2.webp"), u("./ustoz/jiwoo/yuz_4_3.webp"), u("./ustoz/jiwoo/yuz_4_4.webp"), u("./ustoz/jiwoo/yuz_4_5.webp"), u("./ustoz/jiwoo/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/jiwoo/poza_5.webp"), w: 189, h: 540, yuz: { x: 28.065, y: 7.562, w: 53.871, h: 15.011, kadr: [u("./ustoz/jiwoo/yuz_5_1.webp"), u("./ustoz/jiwoo/yuz_5_2.webp"), u("./ustoz/jiwoo/yuz_5_3.webp"), u("./ustoz/jiwoo/yuz_5_4.webp"), u("./ustoz/jiwoo/yuz_5_5.webp"), u("./ustoz/jiwoo/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/jiwoo/poza_6.webp"), w: 171, h: 540, yuz: { x: 22.34, y: 8.804, w: 60.638, h: 14.045, kadr: [u("./ustoz/jiwoo/yuz_6_1.webp"), u("./ustoz/jiwoo/yuz_6_2.webp"), u("./ustoz/jiwoo/yuz_6_3.webp"), u("./ustoz/jiwoo/yuz_6_4.webp"), u("./ustoz/jiwoo/yuz_6_5.webp"), u("./ustoz/jiwoo/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/jiwoo/poza_7.webp"), w: 255, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  kenji: {
    lab: "erkak",
    1: { src: u("./ustoz/kenji/poza_1.webp"), w: 315, h: 540, yuz: { x: 37.255, y: 9.611, w: 21.176, h: 11.327, kadr: [u("./ustoz/kenji/yuz_1_1.webp"), u("./ustoz/kenji/yuz_1_2.webp"), u("./ustoz/kenji/yuz_1_3.webp"), u("./ustoz/kenji/yuz_1_4.webp"), u("./ustoz/kenji/yuz_1_5.webp"), u("./ustoz/kenji/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/kenji/poza_2.webp"), w: 211, h: 540, yuz: { x: 31.379, y: 10.975, w: 31.121, h: 10.863, kadr: [u("./ustoz/kenji/yuz_2_1.webp"), u("./ustoz/kenji/yuz_2_2.webp"), u("./ustoz/kenji/yuz_2_3.webp"), u("./ustoz/kenji/yuz_2_4.webp"), u("./ustoz/kenji/yuz_2_5.webp"), u("./ustoz/kenji/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/kenji/poza_3.webp"), w: 276, h: 540, yuz: { x: 16.667, y: 7.287, w: 31.14, h: 14.238, kadr: [u("./ustoz/kenji/yuz_3_1.webp"), u("./ustoz/kenji/yuz_3_2.webp"), u("./ustoz/kenji/yuz_3_3.webp"), u("./ustoz/kenji/yuz_3_4.webp"), u("./ustoz/kenji/yuz_3_5.webp"), u("./ustoz/kenji/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/kenji/poza_4.webp"), w: 193, h: 540, yuz: { x: 27.702, y: 9.866, w: 34.874, h: 11.417, kadr: [u("./ustoz/kenji/yuz_4_1.webp"), u("./ustoz/kenji/yuz_4_2.webp"), u("./ustoz/kenji/yuz_4_3.webp"), u("./ustoz/kenji/yuz_4_4.webp"), u("./ustoz/kenji/yuz_4_5.webp"), u("./ustoz/kenji/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/kenji/poza_5.webp"), w: 213, h: 540, yuz: { x: 37.536, y: 9.707, w: 32.092, h: 11.287, kadr: [u("./ustoz/kenji/yuz_5_1.webp"), u("./ustoz/kenji/yuz_5_2.webp"), u("./ustoz/kenji/yuz_5_3.webp"), u("./ustoz/kenji/yuz_5_4.webp"), u("./ustoz/kenji/yuz_5_5.webp"), u("./ustoz/kenji/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/kenji/poza_6.webp"), w: 187, h: 540, yuz: { x: 26.299, y: 7.64, w: 46.429, h: 14.045, kadr: [u("./ustoz/kenji/yuz_6_1.webp"), u("./ustoz/kenji/yuz_6_2.webp"), u("./ustoz/kenji/yuz_6_3.webp"), u("./ustoz/kenji/yuz_6_4.webp"), u("./ustoz/kenji/yuz_6_5.webp"), u("./ustoz/kenji/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/kenji/poza_7.webp"), w: 266, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  lukas: {
    lab: "erkak",
    1: { src: u("./ustoz/lukas/poza_1.webp"), w: 310, h: 540, yuz: { x: 33.268, y: 10.106, w: 23.93, h: 11.521, kadr: [u("./ustoz/lukas/yuz_1_1.webp"), u("./ustoz/lukas/yuz_1_2.webp"), u("./ustoz/lukas/yuz_1_3.webp"), u("./ustoz/lukas/yuz_1_4.webp"), u("./ustoz/lukas/yuz_1_5.webp"), u("./ustoz/lukas/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/lukas/poza_2.webp"), w: 215, h: 540, yuz: { x: 33.86, y: 8.415, w: 28.625, h: 12.857, kadr: [u("./ustoz/lukas/yuz_2_1.webp"), u("./ustoz/lukas/yuz_2_2.webp"), u("./ustoz/lukas/yuz_2_3.webp"), u("./ustoz/lukas/yuz_2_4.webp"), u("./ustoz/lukas/yuz_2_5.webp"), u("./ustoz/lukas/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/lukas/poza_3.webp"), w: 308, h: 540, yuz: { x: 15.631, y: 7.886, w: 23.046, h: 15.429, kadr: [u("./ustoz/lukas/yuz_3_1.webp"), u("./ustoz/lukas/yuz_3_2.webp"), u("./ustoz/lukas/yuz_3_3.webp"), u("./ustoz/lukas/yuz_3_4.webp"), u("./ustoz/lukas/yuz_3_5.webp"), u("./ustoz/lukas/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/lukas/poza_4.webp"), w: 199, h: 540, yuz: { x: 26.687, y: 8.951, w: 32.341, h: 11.371, kadr: [u("./ustoz/lukas/yuz_4_1.webp"), u("./ustoz/lukas/yuz_4_2.webp"), u("./ustoz/lukas/yuz_4_3.webp"), u("./ustoz/lukas/yuz_4_4.webp"), u("./ustoz/lukas/yuz_4_5.webp"), u("./ustoz/lukas/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/lukas/poza_5.webp"), w: 213, h: 540, yuz: { x: 36.463, y: 8.501, w: 31.25, h: 11.969, kadr: [u("./ustoz/lukas/yuz_5_1.webp"), u("./ustoz/lukas/yuz_5_2.webp"), u("./ustoz/lukas/yuz_5_3.webp"), u("./ustoz/lukas/yuz_5_4.webp"), u("./ustoz/lukas/yuz_5_5.webp"), u("./ustoz/lukas/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/lukas/poza_6.webp"), w: 186, h: 540, yuz: { x: 25.248, y: 7.477, w: 36.056, h: 14.174, kadr: [u("./ustoz/lukas/yuz_6_1.webp"), u("./ustoz/lukas/yuz_6_2.webp"), u("./ustoz/lukas/yuz_6_3.webp"), u("./ustoz/lukas/yuz_6_4.webp"), u("./ustoz/lukas/yuz_6_5.webp"), u("./ustoz/lukas/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/lukas/poza_7.webp"), w: 270, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 315, h: 540, yuz: { x: 28.042, y: 11.295, w: 26.351, h: 12.567, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 232, h: 540, yuz: { x: 30.079, y: 11.805, w: 39.314, h: 15.21, kadr: [u("./ustoz/malika/yuz_2_1.webp"), u("./ustoz/malika/yuz_2_2.webp"), u("./ustoz/malika/yuz_2_3.webp"), u("./ustoz/malika/yuz_2_4.webp"), u("./ustoz/malika/yuz_2_5.webp"), u("./ustoz/malika/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 283, h: 540, yuz: { x: 12.095, y: 12.571, w: 33.693, h: 13.364, kadr: [u("./ustoz/malika/yuz_3_1.webp"), u("./ustoz/malika/yuz_3_2.webp"), u("./ustoz/malika/yuz_3_3.webp"), u("./ustoz/malika/yuz_3_4.webp"), u("./ustoz/malika/yuz_3_5.webp"), u("./ustoz/malika/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 211, h: 540, yuz: { x: 10.286, y: 11.521, w: 48.286, h: 14.653, kadr: [u("./ustoz/malika/yuz_4_1.webp"), u("./ustoz/malika/yuz_4_2.webp"), u("./ustoz/malika/yuz_4_3.webp"), u("./ustoz/malika/yuz_4_4.webp"), u("./ustoz/malika/yuz_4_5.webp"), u("./ustoz/malika/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 227, h: 540, yuz: { x: 17.819, y: 11.086, w: 37.766, h: 13.326, kadr: [u("./ustoz/malika/yuz_5_1.webp"), u("./ustoz/malika/yuz_5_2.webp"), u("./ustoz/malika/yuz_5_3.webp"), u("./ustoz/malika/yuz_5_4.webp"), u("./ustoz/malika/yuz_5_5.webp"), u("./ustoz/malika/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 214, h: 540, yuz: { x: 25.501, y: 11.464, w: 33.811, h: 12.713, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/malika/poza_7.webp"), w: 312, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  mei: {
    lab: "ayol",
    1: { src: u("./ustoz/mei/poza_1.webp"), w: 298, h: 540, yuz: { x: 36.55, y: 10.532, w: 23.819, h: 12.231, kadr: [u("./ustoz/mei/yuz_1_1.webp"), u("./ustoz/mei/yuz_1_2.webp"), u("./ustoz/mei/yuz_1_3.webp"), u("./ustoz/mei/yuz_1_4.webp"), u("./ustoz/mei/yuz_1_5.webp"), u("./ustoz/mei/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/mei/poza_2.webp"), w: 207, h: 540, yuz: { x: 31.965, y: 9.775, w: 38.71, h: 12.697, kadr: [u("./ustoz/mei/yuz_2_1.webp"), u("./ustoz/mei/yuz_2_2.webp"), u("./ustoz/mei/yuz_2_3.webp"), u("./ustoz/mei/yuz_2_4.webp"), u("./ustoz/mei/yuz_2_5.webp"), u("./ustoz/mei/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/mei/poza_3.webp"), w: 284, h: 540, yuz: { x: 25.94, y: 13.396, w: 16.884, h: 8.345, kadr: [u("./ustoz/mei/yuz_3_1.webp"), u("./ustoz/mei/yuz_3_2.webp"), u("./ustoz/mei/yuz_3_3.webp"), u("./ustoz/mei/yuz_3_4.webp"), u("./ustoz/mei/yuz_3_5.webp"), u("./ustoz/mei/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/mei/poza_4.webp"), w: 190, h: 540, yuz: { x: 18.91, y: 6.982, w: 55.128, h: 15.878, kadr: [u("./ustoz/mei/yuz_4_1.webp"), u("./ustoz/mei/yuz_4_2.webp"), u("./ustoz/mei/yuz_4_3.webp"), u("./ustoz/mei/yuz_4_4.webp"), u("./ustoz/mei/yuz_4_5.webp"), u("./ustoz/mei/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/mei/poza_5.webp"), w: 188, h: 540, yuz: { x: 22.476, y: 8.173, w: 51.14, h: 14.302, kadr: [u("./ustoz/mei/yuz_5_1.webp"), u("./ustoz/mei/yuz_5_2.webp"), u("./ustoz/mei/yuz_5_3.webp"), u("./ustoz/mei/yuz_5_4.webp"), u("./ustoz/mei/yuz_5_5.webp"), u("./ustoz/mei/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/mei/poza_6.webp"), w: 181, h: 540, yuz: { x: 42.14, y: 13.917, w: 26.756, h: 8.193, kadr: [u("./ustoz/mei/yuz_6_1.webp"), u("./ustoz/mei/yuz_6_2.webp"), u("./ustoz/mei/yuz_6_3.webp"), u("./ustoz/mei/yuz_6_4.webp"), u("./ustoz/mei/yuz_6_5.webp"), u("./ustoz/mei/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/mei/poza_7.webp"), w: 265, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 307, h: 540, yuz: { x: 32.475, y: 7.892, w: 31.089, h: 13.416, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 203, h: 540, yuz: { x: 29.94, y: 6.412, w: 42.814, h: 13.161, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 292, h: 540, yuz: { x: 16.314, y: 8.315, w: 27.723, h: 12.874, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 203, h: 540, yuz: { x: 23.193, y: 8.032, w: 46.988, h: 13.801, kadr: [u("./ustoz/nilufar/yuz_4_1.webp"), u("./ustoz/nilufar/yuz_4_2.webp"), u("./ustoz/nilufar/yuz_4_3.webp"), u("./ustoz/nilufar/yuz_4_4.webp"), u("./ustoz/nilufar/yuz_4_5.webp"), u("./ustoz/nilufar/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 204, h: 540, yuz: { x: 46.866, y: 6.667, w: 28.358, h: 11.299, kadr: [u("./ustoz/nilufar/yuz_5_1.webp"), u("./ustoz/nilufar/yuz_5_2.webp"), u("./ustoz/nilufar/yuz_5_3.webp"), u("./ustoz/nilufar/yuz_5_4.webp"), u("./ustoz/nilufar/yuz_5_5.webp"), u("./ustoz/nilufar/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 192, h: 540, yuz: { x: 25.316, y: 6.299, w: 41.456, h: 13.161, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/nilufar/poza_7.webp"), w: 281, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  olga: {
    lab: "ayol",
    1: { src: u("./ustoz/olga/poza_1.webp"), w: 332, h: 540, yuz: { x: 31.127, y: 7.901, w: 31.743, h: 14.447, kadr: [u("./ustoz/olga/yuz_1_1.webp"), u("./ustoz/olga/yuz_1_2.webp"), u("./ustoz/olga/yuz_1_3.webp"), u("./ustoz/olga/yuz_1_4.webp"), u("./ustoz/olga/yuz_1_5.webp"), u("./ustoz/olga/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/olga/poza_2.webp"), w: 209, h: 540, yuz: { x: 27.405, y: 8.465, w: 51.603, h: 14.221, kadr: [u("./ustoz/olga/yuz_2_1.webp"), u("./ustoz/olga/yuz_2_2.webp"), u("./ustoz/olga/yuz_2_3.webp"), u("./ustoz/olga/yuz_2_4.webp"), u("./ustoz/olga/yuz_2_5.webp"), u("./ustoz/olga/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/olga/poza_3.webp"), w: 276, h: 540, yuz: { x: 14.537, y: 9.122, w: 33.04, h: 13.401, kadr: [u("./ustoz/olga/yuz_3_1.webp"), u("./ustoz/olga/yuz_3_2.webp"), u("./ustoz/olga/yuz_3_3.webp"), u("./ustoz/olga/yuz_3_4.webp"), u("./ustoz/olga/yuz_3_5.webp"), u("./ustoz/olga/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/olga/poza_4.webp"), w: 199, h: 540, yuz: { x: 21.581, y: 7.83, w: 50.76, h: 14.318, kadr: [u("./ustoz/olga/yuz_4_1.webp"), u("./ustoz/olga/yuz_4_2.webp"), u("./ustoz/olga/yuz_4_3.webp"), u("./ustoz/olga/yuz_4_4.webp"), u("./ustoz/olga/yuz_4_5.webp"), u("./ustoz/olga/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/olga/poza_5.webp"), w: 207, h: 540, yuz: { x: 24.007, y: 9.134, w: 43.732, h: 13.423, kadr: [u("./ustoz/olga/yuz_5_1.webp"), u("./ustoz/olga/yuz_5_2.webp"), u("./ustoz/olga/yuz_5_3.webp"), u("./ustoz/olga/yuz_5_4.webp"), u("./ustoz/olga/yuz_5_5.webp"), u("./ustoz/olga/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/olga/poza_6.webp"), w: 193, h: 540, yuz: { x: 22.397, y: 8.671, w: 49.527, h: 13.964, kadr: [u("./ustoz/olga/yuz_6_1.webp"), u("./ustoz/olga/yuz_6_2.webp"), u("./ustoz/olga/yuz_6_3.webp"), u("./ustoz/olga/yuz_6_4.webp"), u("./ustoz/olga/yuz_6_5.webp"), u("./ustoz/olga/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/olga/poza_7.webp"), w: 270, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  oliver: {
    lab: "erkak",
    1: { src: u("./ustoz/oliver/poza_1.webp"), w: 330, h: 540, yuz: { x: 36.996, y: 10.067, w: 20.147, h: 12.304, kadr: [u("./ustoz/oliver/yuz_1_1.webp"), u("./ustoz/oliver/yuz_1_2.webp"), u("./ustoz/oliver/yuz_1_3.webp"), u("./ustoz/oliver/yuz_1_4.webp"), u("./ustoz/oliver/yuz_1_5.webp"), u("./ustoz/oliver/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/oliver/poza_2.webp"), w: 211, h: 540, yuz: { x: 32.653, y: 8.044, w: 44.606, h: 15.831, kadr: [u("./ustoz/oliver/yuz_2_1.webp"), u("./ustoz/oliver/yuz_2_2.webp"), u("./ustoz/oliver/yuz_2_3.webp"), u("./ustoz/oliver/yuz_2_4.webp"), u("./ustoz/oliver/yuz_2_5.webp"), u("./ustoz/oliver/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/oliver/poza_3.webp"), w: 300, h: 540, yuz: { x: 21.483, y: 11.503, w: 23.819, h: 11.845, kadr: [u("./ustoz/oliver/yuz_3_1.webp"), u("./ustoz/oliver/yuz_3_2.webp"), u("./ustoz/oliver/yuz_3_3.webp"), u("./ustoz/oliver/yuz_3_4.webp"), u("./ustoz/oliver/yuz_3_5.webp"), u("./ustoz/oliver/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/oliver/poza_4.webp"), w: 191, h: 540, yuz: { x: 21.136, y: 8.277, w: 46.057, h: 13.535, kadr: [u("./ustoz/oliver/yuz_4_1.webp"), u("./ustoz/oliver/yuz_4_2.webp"), u("./ustoz/oliver/yuz_4_3.webp"), u("./ustoz/oliver/yuz_4_4.webp"), u("./ustoz/oliver/yuz_4_5.webp"), u("./ustoz/oliver/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/oliver/poza_5.webp"), w: 267, h: 540, yuz: { x: 32.127, y: 9.843, w: 26.244, h: 12.752, kadr: [u("./ustoz/oliver/yuz_5_1.webp"), u("./ustoz/oliver/yuz_5_2.webp"), u("./ustoz/oliver/yuz_5_3.webp"), u("./ustoz/oliver/yuz_5_4.webp"), u("./ustoz/oliver/yuz_5_5.webp"), u("./ustoz/oliver/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/oliver/poza_6.webp"), w: 196, h: 540, yuz: { x: 32.5, y: 11.023, w: 34.688, h: 12.045, kadr: [u("./ustoz/oliver/yuz_6_1.webp"), u("./ustoz/oliver/yuz_6_2.webp"), u("./ustoz/oliver/yuz_6_3.webp"), u("./ustoz/oliver/yuz_6_4.webp"), u("./ustoz/oliver/yuz_6_5.webp"), u("./ustoz/oliver/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/oliver/poza_7.webp"), w: 276, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  sarah: {
    lab: "ayol",
    1: { src: u("./ustoz/sarah/poza_1.webp"), w: 305, h: 540, yuz: { x: 43.15, y: 13.675, w: 18.233, h: 10.074, kadr: [u("./ustoz/sarah/yuz_1_1.webp"), u("./ustoz/sarah/yuz_1_2.webp"), u("./ustoz/sarah/yuz_1_3.webp"), u("./ustoz/sarah/yuz_1_4.webp"), u("./ustoz/sarah/yuz_1_5.webp"), u("./ustoz/sarah/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sarah/poza_2.webp"), w: 217, h: 540, yuz: { x: 35.249, y: 13.382, w: 33.026, h: 8.191, kadr: [u("./ustoz/sarah/yuz_2_1.webp"), u("./ustoz/sarah/yuz_2_2.webp"), u("./ustoz/sarah/yuz_2_3.webp"), u("./ustoz/sarah/yuz_2_4.webp"), u("./ustoz/sarah/yuz_2_5.webp"), u("./ustoz/sarah/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sarah/poza_3.webp"), w: 264, h: 540, yuz: { x: 14.679, y: 7.407, w: 41.972, h: 15.937, kadr: [u("./ustoz/sarah/yuz_3_1.webp"), u("./ustoz/sarah/yuz_3_2.webp"), u("./ustoz/sarah/yuz_3_3.webp"), u("./ustoz/sarah/yuz_3_4.webp"), u("./ustoz/sarah/yuz_3_5.webp"), u("./ustoz/sarah/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sarah/poza_4.webp"), w: 198, h: 540, yuz: { x: 13.427, y: 8.864, w: 44.892, h: 17.045, kadr: [u("./ustoz/sarah/yuz_4_1.webp"), u("./ustoz/sarah/yuz_4_2.webp"), u("./ustoz/sarah/yuz_4_3.webp"), u("./ustoz/sarah/yuz_4_4.webp"), u("./ustoz/sarah/yuz_4_5.webp"), u("./ustoz/sarah/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sarah/poza_5.webp"), w: 212, h: 540, yuz: { x: 28.264, y: 14.537, w: 40.805, h: 9.142, kadr: [u("./ustoz/sarah/yuz_5_1.webp"), u("./ustoz/sarah/yuz_5_2.webp"), u("./ustoz/sarah/yuz_5_3.webp"), u("./ustoz/sarah/yuz_5_4.webp"), u("./ustoz/sarah/yuz_5_5.webp"), u("./ustoz/sarah/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sarah/poza_6.webp"), w: 188, h: 540, yuz: { x: 28.71, y: 9.091, w: 44.194, h: 12.907, kadr: [u("./ustoz/sarah/yuz_6_1.webp"), u("./ustoz/sarah/yuz_6_2.webp"), u("./ustoz/sarah/yuz_6_3.webp"), u("./ustoz/sarah/yuz_6_4.webp"), u("./ustoz/sarah/yuz_6_5.webp"), u("./ustoz/sarah/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/sarah/poza_7.webp"), w: 268, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 331, h: 540, yuz: { x: 37.591, y: 7.942, w: 22.08, h: 13.199, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 207, h: 540, yuz: { x: 35.986, y: 8.173, w: 35.503, h: 12.94, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 288, h: 540, yuz: { x: 15.319, y: 9.875, w: 30.426, h: 12.486, kadr: [u("./ustoz/sardor/yuz_3_1.webp"), u("./ustoz/sardor/yuz_3_2.webp"), u("./ustoz/sardor/yuz_3_3.webp"), u("./ustoz/sardor/yuz_3_4.webp"), u("./ustoz/sardor/yuz_3_5.webp"), u("./ustoz/sardor/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 199, h: 540, yuz: { x: 22.121, y: 8.054, w: 45.758, h: 14.43, kadr: [u("./ustoz/sardor/yuz_4_1.webp"), u("./ustoz/sardor/yuz_4_2.webp"), u("./ustoz/sardor/yuz_4_3.webp"), u("./ustoz/sardor/yuz_4_4.webp"), u("./ustoz/sardor/yuz_4_5.webp"), u("./ustoz/sardor/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 214, h: 540, yuz: { x: 28.716, y: 7.878, w: 43.22, h: 14.782, kadr: [u("./ustoz/sardor/yuz_5_1.webp"), u("./ustoz/sardor/yuz_5_2.webp"), u("./ustoz/sardor/yuz_5_3.webp"), u("./ustoz/sardor/yuz_5_4.webp"), u("./ustoz/sardor/yuz_5_5.webp"), u("./ustoz/sardor/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 190, h: 540, yuz: { x: 25.08, y: 8.267, w: 45.338, h: 14.156, kadr: [u("./ustoz/sardor/yuz_6_1.webp"), u("./ustoz/sardor/yuz_6_2.webp"), u("./ustoz/sardor/yuz_6_3.webp"), u("./ustoz/sardor/yuz_6_4.webp"), u("./ustoz/sardor/yuz_6_5.webp"), u("./ustoz/sardor/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/sardor/poza_7.webp"), w: 270, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  svetlana: {
    lab: "ayol",
    1: { src: u("./ustoz/svetlana/poza_1.webp"), w: 319, h: 540, yuz: { x: 30.28, y: 6.78, w: 28.107, h: 14.463, kadr: [u("./ustoz/svetlana/yuz_1_1.webp"), u("./ustoz/svetlana/yuz_1_2.webp"), u("./ustoz/svetlana/yuz_1_3.webp"), u("./ustoz/svetlana/yuz_1_4.webp"), u("./ustoz/svetlana/yuz_1_5.webp"), u("./ustoz/svetlana/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/svetlana/poza_2.webp"), w: 209, h: 540, yuz: { x: 37.101, y: 8.09, w: 40.87, h: 12.809, kadr: [u("./ustoz/svetlana/yuz_2_1.webp"), u("./ustoz/svetlana/yuz_2_2.webp"), u("./ustoz/svetlana/yuz_2_3.webp"), u("./ustoz/svetlana/yuz_2_4.webp"), u("./ustoz/svetlana/yuz_2_5.webp"), u("./ustoz/svetlana/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/svetlana/poza_3.webp"), w: 294, h: 540, yuz: { x: 16.844, y: 6.942, w: 29.607, h: 14.752, kadr: [u("./ustoz/svetlana/yuz_3_1.webp"), u("./ustoz/svetlana/yuz_3_2.webp"), u("./ustoz/svetlana/yuz_3_3.webp"), u("./ustoz/svetlana/yuz_3_4.webp"), u("./ustoz/svetlana/yuz_3_5.webp"), u("./ustoz/svetlana/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/svetlana/poza_4.webp"), w: 176, h: 540, yuz: { x: 21.923, y: 7.432, w: 56.747, h: 15.09, kadr: [u("./ustoz/svetlana/yuz_4_1.webp"), u("./ustoz/svetlana/yuz_4_2.webp"), u("./ustoz/svetlana/yuz_4_3.webp"), u("./ustoz/svetlana/yuz_4_4.webp"), u("./ustoz/svetlana/yuz_4_5.webp"), u("./ustoz/svetlana/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/svetlana/poza_5.webp"), w: 201, h: 540, yuz: { x: 25.665, y: 8.523, w: 45.773, h: 10.412, kadr: [u("./ustoz/svetlana/yuz_5_1.webp"), u("./ustoz/svetlana/yuz_5_2.webp"), u("./ustoz/svetlana/yuz_5_3.webp"), u("./ustoz/svetlana/yuz_5_4.webp"), u("./ustoz/svetlana/yuz_5_5.webp"), u("./ustoz/svetlana/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/svetlana/poza_6.webp"), w: 195, h: 540, yuz: { x: 37.299, y: 8.559, w: 33.75, h: 11.261, kadr: [u("./ustoz/svetlana/yuz_6_1.webp"), u("./ustoz/svetlana/yuz_6_2.webp"), u("./ustoz/svetlana/yuz_6_3.webp"), u("./ustoz/svetlana/yuz_6_4.webp"), u("./ustoz/svetlana/yuz_6_5.webp"), u("./ustoz/svetlana/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/svetlana/poza_7.webp"), w: 254, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  yusuf: {
    lab: "erkak",
    1: { src: u("./ustoz/yusuf/poza_1.webp"), w: 362, h: 540, yuz: { x: 34.622, y: 6.644, w: 24.874, h: 13.514, kadr: [u("./ustoz/yusuf/yuz_1_1.webp"), u("./ustoz/yusuf/yuz_1_2.webp"), u("./ustoz/yusuf/yuz_1_3.webp"), u("./ustoz/yusuf/yuz_1_4.webp"), u("./ustoz/yusuf/yuz_1_5.webp"), u("./ustoz/yusuf/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/yusuf/poza_2.webp"), w: 209, h: 540, yuz: { x: 43.605, y: 8.559, w: 35.174, h: 11.374, kadr: [u("./ustoz/yusuf/yuz_2_1.webp"), u("./ustoz/yusuf/yuz_2_2.webp"), u("./ustoz/yusuf/yuz_2_3.webp"), u("./ustoz/yusuf/yuz_2_4.webp"), u("./ustoz/yusuf/yuz_2_5.webp"), u("./ustoz/yusuf/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/yusuf/poza_3.webp"), w: 240, h: 540, yuz: { x: 26.098, y: 9.326, w: 26.515, h: 9.213, kadr: [u("./ustoz/yusuf/yuz_3_1.webp"), u("./ustoz/yusuf/yuz_3_2.webp"), u("./ustoz/yusuf/yuz_3_3.webp"), u("./ustoz/yusuf/yuz_3_4.webp"), u("./ustoz/yusuf/yuz_3_5.webp"), u("./ustoz/yusuf/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/yusuf/poza_4.webp"), w: 188, h: 540, yuz: { x: 33.117, y: 8.947, w: 34.091, h: 10.532, kadr: [u("./ustoz/yusuf/yuz_4_1.webp"), u("./ustoz/yusuf/yuz_4_2.webp"), u("./ustoz/yusuf/yuz_4_3.webp"), u("./ustoz/yusuf/yuz_4_4.webp"), u("./ustoz/yusuf/yuz_4_5.webp"), u("./ustoz/yusuf/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/yusuf/poza_5.webp"), w: 215, h: 540, yuz: { x: 36.648, y: 8.927, w: 30.114, h: 10.508, kadr: [u("./ustoz/yusuf/yuz_5_1.webp"), u("./ustoz/yusuf/yuz_5_2.webp"), u("./ustoz/yusuf/yuz_5_3.webp"), u("./ustoz/yusuf/yuz_5_4.webp"), u("./ustoz/yusuf/yuz_5_5.webp"), u("./ustoz/yusuf/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/yusuf/poza_6.webp"), w: 185, h: 540, yuz: { x: 36.508, y: 9.315, w: 35.082, h: 9.764, kadr: [u("./ustoz/yusuf/yuz_6_1.webp"), u("./ustoz/yusuf/yuz_6_2.webp"), u("./ustoz/yusuf/yuz_6_3.webp"), u("./ustoz/yusuf/yuz_6_4.webp"), u("./ustoz/yusuf/yuz_6_5.webp"), u("./ustoz/yusuf/yuz_6_6.webp")] } },
    7: { src: u("./ustoz/yusuf/poza_7.webp"), w: 235, h: 540 },   // REV392: doskaga qarab yozadi (AI, rassom uslubida)
  },
  // REV503: matematika ustozlari — bosqich bo'yicha (Azizjon chizdirgan 56 rasm). Og'iz kadrlari keyin qo'shiladi.
  m_bogcha_ayol: {
    lab: "ayol",
    1: { src: u("./ustoz/m_bogcha_ayol/poza_1.webp"), w: 351, h: 540, og: { x: 48.72, y: 15.00, w: 10.37, skin: "#fdbc84" } },
    2: { src: u("./ustoz/m_bogcha_ayol/poza_2.webp"), w: 283, h: 540, og: { x: 38.53, y: 15.19, w: 12.86, skin: "#fdb985" } },
    3: { src: u("./ustoz/m_bogcha_ayol/poza_3.webp"), w: 211, h: 540, og: { x: 46.36, y: 15.00, w: 17.25, skin: "#feb983" } },
    4: { src: u("./ustoz/m_bogcha_ayol/poza_4.webp"), w: 211, h: 540, og: { x: 51.55, y: 15.00, w: 17.25, skin: "#fdb881" } },
    5: { src: u("./ustoz/m_bogcha_ayol/poza_5.webp"), w: 221, h: 540, og: { x: 49.33, y: 15.00, w: 16.47, skin: "#fec187" } },
    6: { src: u("./ustoz/m_bogcha_ayol/poza_6.webp"), w: 211, h: 540, og: { x: 51.63, y: 15.00, w: 17.25, skin: "#febe86" } },
    7: { src: u("./ustoz/m_bogcha_ayol/poza_7.webp"), w: 230, h: 540, og: { x: 43.38, y: 14.81, w: 15.83, skin: "#fec183" } },
  },
  m_bogcha_erkak: {
    lab: "erkak",
    1: { src: u("./ustoz/m_bogcha_erkak/poza_1.webp"), w: 345, h: 540, og: { x: 49.57, y: 14.81, w: 10.55, skin: "#fdb67d" } },
    2: { src: u("./ustoz/m_bogcha_erkak/poza_2.webp"), w: 239, h: 540, og: { x: 38.08, y: 15.00, w: 15.23, skin: "#fdb980" } },
    3: { src: u("./ustoz/m_bogcha_erkak/poza_3.webp"), w: 153, h: 540, og: { x: 51.63, y: 14.81, w: 23.79, skin: "#fdb277" } },
    4: { src: u("./ustoz/m_bogcha_erkak/poza_4.webp"), w: 156, h: 540, og: { x: 49.36, y: 15.65, w: 23.33, skin: "#fdb47b" } },
    5: { src: u("./ustoz/m_bogcha_erkak/poza_5.webp"), w: 238, h: 540, og: { x: 39.08, y: 14.91, w: 15.29, skin: "#fdb97f" } },
    6: { src: u("./ustoz/m_bogcha_erkak/poza_6.webp"), w: 179, h: 540, og: { x: 50.28, y: 14.81, w: 20.34, skin: "#fdb57b" } },
  },
  m_sinf57_ayol: {
    lab: "ayol",
    1: { src: u("./ustoz/m_sinf57_ayol/poza_1.webp"), w: 311, h: 540, og: { x: 50.80, y: 14.07, w: 10.45, skin: "#fdc188" } },
    2: { src: u("./ustoz/m_sinf57_ayol/poza_2.webp"), w: 242, h: 540, og: { x: 42.56, y: 14.07, w: 13.43, skin: "#fec288" } },
    3: { src: u("./ustoz/m_sinf57_ayol/poza_3.webp"), w: 195, h: 540, og: { x: 53.33, y: 13.89, w: 16.67, skin: "#fdc48f" } },
    4: { src: u("./ustoz/m_sinf57_ayol/poza_4.webp"), w: 195, h: 540, og: { x: 53.16, y: 14.07, w: 16.67, skin: "#febd84" } },
    5: { src: u("./ustoz/m_sinf57_ayol/poza_5.webp"), w: 230, h: 540, og: { x: 45.00, y: 13.98, w: 14.13, skin: "#fdc287" } },
    6: { src: u("./ustoz/m_sinf57_ayol/poza_6.webp"), w: 195, h: 540, og: { x: 52.31, y: 14.07, w: 16.67, skin: "#fdc188" } },
    7: { src: u("./ustoz/m_sinf57_ayol/poza_7.webp"), w: 217, h: 540, og: { x: 40.55, y: 14.07, w: 14.98, skin: "#fec38e" } },
  },
  m_sinf57_erkak: {
    lab: "erkak",
    1: { src: u("./ustoz/m_sinf57_erkak/poza_1.webp"), w: 344, h: 540, og: { x: 47.97, y: 15.00, w: 10.58, skin: "#f8b17c" } },
    2: { src: u("./ustoz/m_sinf57_erkak/poza_2.webp"), w: 184, h: 540, og: { x: 47.83, y: 14.81, w: 19.78, skin: "#f8b281" } },
    3: { src: u("./ustoz/m_sinf57_erkak/poza_3.webp"), w: 178, h: 540, og: { x: 49.92, y: 15.00, w: 20.45, skin: "#fbad76" } },
    4: { src: u("./ustoz/m_sinf57_erkak/poza_4.webp"), w: 178, h: 540, og: { x: 49.44, y: 16.30, w: 20.45, skin: "#f8b27b" } },
    5: { src: u("./ustoz/m_sinf57_erkak/poza_5.webp"), w: 246, h: 540, og: { x: 38.21, y: 15.00, w: 14.80, skin: "#f8b17d" } },
    6: { src: u("./ustoz/m_sinf57_erkak/poza_6.webp"), w: 194, h: 540, og: { x: 50.00, y: 15.09, w: 18.76, skin: "#f9b27e" } },
    7: { src: u("./ustoz/m_sinf57_erkak/poza_7.webp"), w: 207, h: 540, og: { x: 30.43, y: 15.37, w: 17.58, skin: "#f8ae76" } },
  },
  m_sinf811_ayol: {
    lab: "ayol",
    1: { src: u("./ustoz/m_sinf811_ayol/poza_1.webp"), w: 322, h: 540, og: { x: 50.93, y: 15.37, w: 11.71, skin: "#f9b37e" } },
    2: { src: u("./ustoz/m_sinf811_ayol/poza_2.webp"), w: 248, h: 540, og: { x: 41.13, y: 15.19, w: 15.20, skin: "#fab47d" } },
    3: { src: u("./ustoz/m_sinf811_ayol/poza_3.webp"), w: 186, h: 540, og: { x: 53.49, y: 15.65, w: 20.27, skin: "#fab27e" } },
    4: { src: u("./ustoz/m_sinf811_ayol/poza_4.webp"), w: 186, h: 540, og: { x: 54.10, y: 15.37, w: 20.27, skin: "#fdac75" } },
    5: { src: u("./ustoz/m_sinf811_ayol/poza_5.webp"), w: 238, h: 540, og: { x: 42.44, y: 15.19, w: 15.84, skin: "#f8b17b" } },
    6: { src: u("./ustoz/m_sinf811_ayol/poza_6.webp"), w: 185, h: 540, og: { x: 54.05, y: 15.19, w: 20.38, skin: "#f9b077" } },
    7: { src: u("./ustoz/m_sinf811_ayol/poza_7.webp"), w: 215, h: 540, og: { x: 42.55, y: 15.37, w: 17.53, skin: "#fbb07b" } },
  },
  m_sinf811_erkak: {
    lab: "erkak",
    1: { src: u("./ustoz/m_sinf811_erkak/poza_1.webp"), w: 343, h: 540, og: { x: 49.85, y: 13.15, w: 8.72, skin: "#fdb881" } },
    2: { src: u("./ustoz/m_sinf811_erkak/poza_2.webp"), w: 232, h: 540, og: { x: 36.21, y: 13.52, w: 12.89, skin: "#fdb67f" } },
    3: { src: u("./ustoz/m_sinf811_erkak/poza_3.webp"), w: 170, h: 540, og: { x: 50.00, y: 13.33, w: 17.59, skin: "#fdb781" } },
    4: { src: u("./ustoz/m_sinf811_erkak/poza_4.webp"), w: 165, h: 540, og: { x: 51.52, y: 14.26, w: 18.12, skin: "#fcb67e" } },
    5: { src: u("./ustoz/m_sinf811_erkak/poza_5.webp"), w: 243, h: 540, og: { x: 40.33, y: 13.33, w: 12.30, skin: "#fdb781" } },
    6: { src: u("./ustoz/m_sinf811_erkak/poza_6.webp"), w: 183, h: 540, og: { x: 50.82, y: 13.33, w: 16.34, skin: "#fdbb85" } },
    7: { src: u("./ustoz/m_sinf811_erkak/poza_7.webp"), w: 184, h: 540, og: { x: 32.61, y: 12.22, w: 16.25, skin: "#fab480" } },
  },
  m_talaba_ayol: {
    lab: "ayol",
    1: { src: u("./ustoz/m_talaba_ayol/poza_1.webp"), w: 333, h: 540, og: { x: 49.85, y: 14.26, w: 10.15, skin: "#fbb987" } },
    2: { src: u("./ustoz/m_talaba_ayol/poza_2.webp"), w: 250, h: 540, og: { x: 37.60, y: 14.63, w: 13.52, skin: "#fbb784" } },
    3: { src: u("./ustoz/m_talaba_ayol/poza_3.webp"), w: 180, h: 540, og: { x: 52.22, y: 14.26, w: 18.78, skin: "#fab683" } },
    4: { src: u("./ustoz/m_talaba_ayol/poza_4.webp"), w: 179, h: 540, og: { x: 51.40, y: 15.00, w: 18.88, skin: "#fab482" } },
    5: { src: u("./ustoz/m_talaba_ayol/poza_5.webp"), w: 226, h: 540, og: { x: 41.15, y: 14.63, w: 14.96, skin: "#fbb885" } },
    6: { src: u("./ustoz/m_talaba_ayol/poza_6.webp"), w: 179, h: 540, og: { x: 52.51, y: 14.63, w: 18.88, skin: "#fab986" } },
    7: { src: u("./ustoz/m_talaba_ayol/poza_7.webp"), w: 209, h: 540, og: { x: 40.19, y: 16.11, w: 16.17, skin: "#fbbb89" } },
  },
  m_talaba_erkak: {
    lab: "erkak",
    1: { src: u("./ustoz/m_talaba_erkak/poza_1.webp"), w: 343, h: 540, og: { x: 48.70, y: 13.70, w: 13.27, skin: "#f6a874" } },
    2: { src: u("./ustoz/m_talaba_erkak/poza_2.webp"), w: 167, h: 540, og: { x: 46.47, y: 13.70, w: 27.25, skin: "#f8a674" } },
    3: { src: u("./ustoz/m_talaba_erkak/poza_3.webp"), w: 175, h: 540, og: { x: 46.93, y: 13.70, w: 26.00, skin: "#f6a372" } },
    4: { src: u("./ustoz/m_talaba_erkak/poza_4.webp"), w: 168, h: 540, og: { x: 47.02, y: 13.70, w: 27.08, skin: "#f5a06c" } },
    5: { src: u("./ustoz/m_talaba_erkak/poza_5.webp"), w: 234, h: 540, og: { x: 41.00, y: 13.70, w: 19.44, skin: "#f7a471" } },
    6: { src: u("./ustoz/m_talaba_erkak/poza_6.webp"), w: 189, h: 540, og: { x: 50.56, y: 13.70, w: 24.07, skin: "#f6a36f" } },
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
