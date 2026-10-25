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
export const USTOZLAR = {
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 193, h: 497, yuz: { x: 36.269, y: 10.865, w: 40.933, h: 11.871, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] }, og: { x: 53.8, y: 18.6, w: 14.45, r: -3, skin: "#f8a878" } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 220, h: 496, yuz: { x: 40.455, y: 11.089, w: 35.909, h: 11.895, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] }, og: { x: 56.4, y: 19.2, w: 12.68, r: -7, skin: "#faac7a" } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 351, h: 499, og: { x: 26.1, y: 18.45, w: 7.8, r: -13, tw: 150, skin: "#fab386" } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 188, h: 491, og: { x: 45.5, y: 19.5, w: 11, r: -11, skin: "#fbb789" } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 289, h: 495, og: { x: 51, y: 21.95, w: 11, r: -7, skin: "#f7b284" } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 262, h: 484, og: { x: 33.8, y: 19.5, w: 9.8, r: -11, tw: 160, skin: "#fbb68a" } },
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 220, h: 522, yuz: { x: 33.636, y: 2.682, w: 30.0, h: 14.176, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] }, og: { x: 53, y: 14.9, w: 10.5, r: -5, skin: "#fdc693" } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 235, h: 520, yuz: { x: 34.043, y: 2.885, w: 28.511, h: 14.423, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] }, og: { x: 52.8, y: 15.0, w: 9.96, r: -4, skin: "#fdc691" } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 307, h: 521, yuz: { x: 22.15, y: 2.687, w: 21.498, h: 14.203, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] }, og: { x: 36.6, y: 14.75, w: 7.52, r: -4, skin: "#fdc490" } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 207, h: 510, og: { x: 56, y: 13.5, w: 10, r: -12, skin: "#feba87" } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 235, h: 512, og: { x: 58.8, y: 15.8, w: 11.5, r: -8, skin: "#fdbb89" } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 253, h: 506, yuz: { x: 57.312, y: 3.162, w: 26.482, h: 14.822, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] }, og: { x: 74.5, y: 15.85, w: 9.25, r: -4, skin: "#fdc28d" } },
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 201, h: 510, yuz: { x: 30.348, y: 6.667, w: 38.806, h: 15.686, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] }, og: { x: 45, y: 20.25, w: 11.16, r: -4, skin: "#fdb577" } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 245, h: 510, og: { x: 49.5, y: 20.7, w: 10, r: 0, skin: "#ffac71" } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 300, h: 508, og: { x: 34.5, y: 20.35, w: 8.5, r: -2, skin: "#feae73" } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 229, h: 504, og: { x: 41.5, y: 16.6, w: 8.5, r: 3, skin: "#fcb074" } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 303, h: 501, og: { x: 39.7, y: 20.8, w: 11, r: 0, skin: "#fda970" } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 244, h: 499, yuz: { x: 19.672, y: 6.814, w: 32.377, h: 16.232, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] }, og: { x: 34.0, y: 20.85, w: 9.3, r: -13, skin: "#fdb87a" } },
  },
  // REV169: 10 ta til ustozi (har tilga o'z ustozi) — rassom varag'idan kesilgan; bo'yi bir xil (500 px), yuz kadrlari 6 tadan
  emily: {
    lab: "ayol",
    1: { src: u("./ustoz/emily/poza_1.webp"), w: 163, h: 500, yuz: { x: 20.612, y: 0.198, w: 62.577, h: 25.0, kadr: [u("./ustoz/emily/yuz_1_1.webp"), u("./ustoz/emily/yuz_1_2.webp"), u("./ustoz/emily/yuz_1_3.webp"), u("./ustoz/emily/yuz_1_4.webp"), u("./ustoz/emily/yuz_1_5.webp"), u("./ustoz/emily/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/emily/poza_2.webp"), w: 189, h: 500, yuz: { x: 31.37, y: 0.395, w: 53.968, h: 25.0, kadr: [u("./ustoz/emily/yuz_2_1.webp"), u("./ustoz/emily/yuz_2_2.webp"), u("./ustoz/emily/yuz_2_3.webp"), u("./ustoz/emily/yuz_2_4.webp"), u("./ustoz/emily/yuz_2_5.webp"), u("./ustoz/emily/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/emily/poza_3.webp"), w: 288, h: 500, yuz: { x: 10.979, y: 0.395, w: 35.417, h: 25.0, kadr: [u("./ustoz/emily/yuz_3_1.webp"), u("./ustoz/emily/yuz_3_2.webp"), u("./ustoz/emily/yuz_3_3.webp"), u("./ustoz/emily/yuz_3_4.webp"), u("./ustoz/emily/yuz_3_5.webp"), u("./ustoz/emily/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/emily/poza_4.webp"), w: 177, h: 500, yuz: { x: 17.306, y: 0.395, w: 57.627, h: 25.0, kadr: [u("./ustoz/emily/yuz_4_1.webp"), u("./ustoz/emily/yuz_4_2.webp"), u("./ustoz/emily/yuz_4_3.webp"), u("./ustoz/emily/yuz_4_4.webp"), u("./ustoz/emily/yuz_4_5.webp"), u("./ustoz/emily/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/emily/poza_5.webp"), w: 173, h: 500, yuz: { x: 18.064, y: 0.189, w: 58.382, h: 24.8, kadr: [u("./ustoz/emily/yuz_5_1.webp"), u("./ustoz/emily/yuz_5_2.webp"), u("./ustoz/emily/yuz_5_3.webp"), u("./ustoz/emily/yuz_5_4.webp"), u("./ustoz/emily/yuz_5_5.webp"), u("./ustoz/emily/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/emily/poza_6.webp"), w: 257, h: 500, yuz: { x: 37.68, y: 0.988, w: 39.689, h: 25.0, kadr: [u("./ustoz/emily/yuz_6_1.webp"), u("./ustoz/emily/yuz_6_2.webp"), u("./ustoz/emily/yuz_6_3.webp"), u("./ustoz/emily/yuz_6_4.webp"), u("./ustoz/emily/yuz_6_5.webp"), u("./ustoz/emily/yuz_6_6.webp")] } },
  },
  anna: {
    lab: "ayol",
    1: { src: u("./ustoz/anna/poza_1.webp"), w: 173, h: 500, yuz: { x: 19.158, y: 0.189, w: 62.428, h: 25.6, kadr: [u("./ustoz/anna/yuz_1_1.webp"), u("./ustoz/anna/yuz_1_2.webp"), u("./ustoz/anna/yuz_1_3.webp"), u("./ustoz/anna/yuz_1_4.webp"), u("./ustoz/anna/yuz_1_5.webp"), u("./ustoz/anna/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/anna/poza_2.webp"), w: 179, h: 500, yuz: { x: 23.908, y: 0.0, w: 59.777, h: 25.4, kadr: [u("./ustoz/anna/yuz_2_1.webp"), u("./ustoz/anna/yuz_2_2.webp"), u("./ustoz/anna/yuz_2_3.webp"), u("./ustoz/anna/yuz_2_4.webp"), u("./ustoz/anna/yuz_2_5.webp"), u("./ustoz/anna/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/anna/poza_3.webp"), w: 290, h: 500, yuz: { x: 6.908, y: 0.182, w: 36.897, h: 25.4, kadr: [u("./ustoz/anna/yuz_3_1.webp"), u("./ustoz/anna/yuz_3_2.webp"), u("./ustoz/anna/yuz_3_3.webp"), u("./ustoz/anna/yuz_3_4.webp"), u("./ustoz/anna/yuz_3_5.webp"), u("./ustoz/anna/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/anna/poza_4.webp"), w: 172, h: 500, yuz: { x: 15.352, y: 0.182, w: 62.209, h: 25.4, kadr: [u("./ustoz/anna/yuz_4_1.webp"), u("./ustoz/anna/yuz_4_2.webp"), u("./ustoz/anna/yuz_4_3.webp"), u("./ustoz/anna/yuz_4_4.webp"), u("./ustoz/anna/yuz_4_5.webp"), u("./ustoz/anna/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/anna/poza_5.webp"), w: 169, h: 500, yuz: { x: 17.121, y: 0.0, w: 63.905, h: 25.6, kadr: [u("./ustoz/anna/yuz_5_1.webp"), u("./ustoz/anna/yuz_5_2.webp"), u("./ustoz/anna/yuz_5_3.webp"), u("./ustoz/anna/yuz_5_4.webp"), u("./ustoz/anna/yuz_5_5.webp"), u("./ustoz/anna/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/anna/poza_6.webp"), w: 252, h: 500, yuz: { x: 35.049, y: 0.911, w: 42.46, h: 25.4, kadr: [u("./ustoz/anna/yuz_6_1.webp"), u("./ustoz/anna/yuz_6_2.webp"), u("./ustoz/anna/yuz_6_3.webp"), u("./ustoz/anna/yuz_6_4.webp"), u("./ustoz/anna/yuz_6_5.webp"), u("./ustoz/anna/yuz_6_6.webp")] } },
  },
  elif: {
    lab: "ayol",
    1: { src: u("./ustoz/elif/poza_1.webp"), w: 169, h: 500, yuz: { x: 20.482, y: 0.769, w: 62.722, h: 25.6, kadr: [u("./ustoz/elif/yuz_1_1.webp"), u("./ustoz/elif/yuz_1_2.webp"), u("./ustoz/elif/yuz_1_3.webp"), u("./ustoz/elif/yuz_1_4.webp"), u("./ustoz/elif/yuz_1_5.webp"), u("./ustoz/elif/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/elif/poza_2.webp"), w: 174, h: 500, yuz: { x: 22.882, y: 0.0, w: 60.92, h: 25.6, kadr: [u("./ustoz/elif/yuz_2_1.webp"), u("./ustoz/elif/yuz_2_2.webp"), u("./ustoz/elif/yuz_2_3.webp"), u("./ustoz/elif/yuz_2_4.webp"), u("./ustoz/elif/yuz_2_5.webp"), u("./ustoz/elif/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/elif/poza_3.webp"), w: 300, h: 498, yuz: { x: 8.333, y: 0.965, w: 35.333, h: 25.703, kadr: [u("./ustoz/elif/yuz_3_1.webp"), u("./ustoz/elif/yuz_3_2.webp"), u("./ustoz/elif/yuz_3_3.webp"), u("./ustoz/elif/yuz_3_4.webp"), u("./ustoz/elif/yuz_3_5.webp"), u("./ustoz/elif/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/elif/poza_4.webp"), w: 177, h: 500, yuz: { x: 15.694, y: 0.37, w: 59.887, h: 25.6, kadr: [u("./ustoz/elif/yuz_4_1.webp"), u("./ustoz/elif/yuz_4_2.webp"), u("./ustoz/elif/yuz_4_3.webp"), u("./ustoz/elif/yuz_4_4.webp"), u("./ustoz/elif/yuz_4_5.webp"), u("./ustoz/elif/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/elif/poza_5.webp"), w: 174, h: 500, yuz: { x: 18.625, y: 0.556, w: 60.92, h: 25.6, kadr: [u("./ustoz/elif/yuz_5_1.webp"), u("./ustoz/elif/yuz_5_2.webp"), u("./ustoz/elif/yuz_5_3.webp"), u("./ustoz/elif/yuz_5_4.webp"), u("./ustoz/elif/yuz_5_5.webp"), u("./ustoz/elif/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/elif/poza_6.webp"), w: 251, h: 500, yuz: { x: 35.414, y: 0.741, w: 42.231, h: 25.6, kadr: [u("./ustoz/elif/yuz_6_1.webp"), u("./ustoz/elif/yuz_6_2.webp"), u("./ustoz/elif/yuz_6_3.webp"), u("./ustoz/elif/yuz_6_4.webp"), u("./ustoz/elif/yuz_6_5.webp"), u("./ustoz/elif/yuz_6_6.webp")] } },
  },
  yusuf: {
    lab: "erkak",
    1: { src: u("./ustoz/yusuf/poza_1.webp"), w: 168, h: 500, yuz: { x: 21.791, y: 0.385, w: 56.548, h: 25.6, kadr: [u("./ustoz/yusuf/yuz_1_1.webp"), u("./ustoz/yusuf/yuz_1_2.webp"), u("./ustoz/yusuf/yuz_1_3.webp"), u("./ustoz/yusuf/yuz_1_4.webp"), u("./ustoz/yusuf/yuz_1_5.webp"), u("./ustoz/yusuf/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/yusuf/poza_2.webp"), w: 204, h: 498, yuz: { x: 29.28, y: 0.193, w: 46.569, h: 25.703, kadr: [u("./ustoz/yusuf/yuz_2_1.webp"), u("./ustoz/yusuf/yuz_2_2.webp"), u("./ustoz/yusuf/yuz_2_3.webp"), u("./ustoz/yusuf/yuz_2_4.webp"), u("./ustoz/yusuf/yuz_2_5.webp"), u("./ustoz/yusuf/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/yusuf/poza_3.webp"), w: 288, h: 500, yuz: { x: 11.708, y: 0.385, w: 32.986, h: 25.6, kadr: [u("./ustoz/yusuf/yuz_3_1.webp"), u("./ustoz/yusuf/yuz_3_2.webp"), u("./ustoz/yusuf/yuz_3_3.webp"), u("./ustoz/yusuf/yuz_3_4.webp"), u("./ustoz/yusuf/yuz_3_5.webp"), u("./ustoz/yusuf/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/yusuf/poza_4.webp"), w: 162, h: 500, yuz: { x: 14.317, y: 0.186, w: 59.259, h: 25.6, kadr: [u("./ustoz/yusuf/yuz_4_1.webp"), u("./ustoz/yusuf/yuz_4_2.webp"), u("./ustoz/yusuf/yuz_4_3.webp"), u("./ustoz/yusuf/yuz_4_4.webp"), u("./ustoz/yusuf/yuz_4_5.webp"), u("./ustoz/yusuf/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/yusuf/poza_5.webp"), w: 186, h: 500, yuz: { x: 18.454, y: 0.371, w: 51.613, h: 25.6, kadr: [u("./ustoz/yusuf/yuz_5_1.webp"), u("./ustoz/yusuf/yuz_5_2.webp"), u("./ustoz/yusuf/yuz_5_3.webp"), u("./ustoz/yusuf/yuz_5_4.webp"), u("./ustoz/yusuf/yuz_5_5.webp"), u("./ustoz/yusuf/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/yusuf/poza_6.webp"), w: 226, h: 500, yuz: { x: 29.966, y: 0.0, w: 42.478, h: 25.6, kadr: [u("./ustoz/yusuf/yuz_6_1.webp"), u("./ustoz/yusuf/yuz_6_2.webp"), u("./ustoz/yusuf/yuz_6_3.webp"), u("./ustoz/yusuf/yuz_6_4.webp"), u("./ustoz/yusuf/yuz_6_5.webp"), u("./ustoz/yusuf/yuz_6_6.webp")] } },
  },
  lukas: {
    lab: "erkak",
    1: { src: u("./ustoz/lukas/poza_1.webp"), w: 158, h: 500, yuz: { x: 18.118, y: 0.191, w: 65.823, h: 27.2, kadr: [u("./ustoz/lukas/yuz_1_1.webp"), u("./ustoz/lukas/yuz_1_2.webp"), u("./ustoz/lukas/yuz_1_3.webp"), u("./ustoz/lukas/yuz_1_4.webp"), u("./ustoz/lukas/yuz_1_5.webp"), u("./ustoz/lukas/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/lukas/poza_2.webp"), w: 204, h: 500, yuz: { x: 30.647, y: 0.397, w: 50.49, h: 27.4, kadr: [u("./ustoz/lukas/yuz_2_1.webp"), u("./ustoz/lukas/yuz_2_2.webp"), u("./ustoz/lukas/yuz_2_3.webp"), u("./ustoz/lukas/yuz_2_4.webp"), u("./ustoz/lukas/yuz_2_5.webp"), u("./ustoz/lukas/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/lukas/poza_3.webp"), w: 316, h: 498, yuz: { x: 14.192, y: 0.0, w: 32.911, h: 27.309, kadr: [u("./ustoz/lukas/yuz_3_1.webp"), u("./ustoz/lukas/yuz_3_2.webp"), u("./ustoz/lukas/yuz_3_3.webp"), u("./ustoz/lukas/yuz_3_4.webp"), u("./ustoz/lukas/yuz_3_5.webp"), u("./ustoz/lukas/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/lukas/poza_4.webp"), w: 155, h: 500, yuz: { x: 9.85, y: 0.0, w: 67.097, h: 27.2, kadr: [u("./ustoz/lukas/yuz_4_1.webp"), u("./ustoz/lukas/yuz_4_2.webp"), u("./ustoz/lukas/yuz_4_3.webp"), u("./ustoz/lukas/yuz_4_4.webp"), u("./ustoz/lukas/yuz_4_5.webp"), u("./ustoz/lukas/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/lukas/poza_5.webp"), w: 185, h: 500, yuz: { x: 20.631, y: 0.191, w: 56.216, h: 27.2, kadr: [u("./ustoz/lukas/yuz_5_1.webp"), u("./ustoz/lukas/yuz_5_2.webp"), u("./ustoz/lukas/yuz_5_3.webp"), u("./ustoz/lukas/yuz_5_4.webp"), u("./ustoz/lukas/yuz_5_5.webp"), u("./ustoz/lukas/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/lukas/poza_6.webp"), w: 228, h: 500, yuz: { x: 27.622, y: 0.382, w: 45.614, h: 27.2, kadr: [u("./ustoz/lukas/yuz_6_1.webp"), u("./ustoz/lukas/yuz_6_2.webp"), u("./ustoz/lukas/yuz_6_3.webp"), u("./ustoz/lukas/yuz_6_4.webp"), u("./ustoz/lukas/yuz_6_5.webp"), u("./ustoz/lukas/yuz_6_6.webp")] } },
  },
  carlos: {
    lab: "erkak",
    1: { src: u("./ustoz/carlos/poza_1.webp"), w: 177, h: 500, yuz: { x: 21.859, y: 0.595, w: 61.582, h: 27.6, kadr: [u("./ustoz/carlos/yuz_1_1.webp"), u("./ustoz/carlos/yuz_1_2.webp"), u("./ustoz/carlos/yuz_1_3.webp"), u("./ustoz/carlos/yuz_1_4.webp"), u("./ustoz/carlos/yuz_1_5.webp"), u("./ustoz/carlos/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/carlos/poza_2.webp"), w: 207, h: 500, yuz: { x: 33.069, y: 0.198, w: 52.657, h: 27.6, kadr: [u("./ustoz/carlos/yuz_2_1.webp"), u("./ustoz/carlos/yuz_2_2.webp"), u("./ustoz/carlos/yuz_2_3.webp"), u("./ustoz/carlos/yuz_2_4.webp"), u("./ustoz/carlos/yuz_2_5.webp"), u("./ustoz/carlos/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/carlos/poza_3.webp"), w: 309, h: 501, yuz: { x: 12.2, y: 0.792, w: 35.275, h: 27.545, kadr: [u("./ustoz/carlos/yuz_3_1.webp"), u("./ustoz/carlos/yuz_3_2.webp"), u("./ustoz/carlos/yuz_3_3.webp"), u("./ustoz/carlos/yuz_3_4.webp"), u("./ustoz/carlos/yuz_3_5.webp"), u("./ustoz/carlos/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/carlos/poza_4.webp"), w: 174, h: 500, yuz: { x: 14.254, y: 0.763, w: 62.644, h: 27.6, kadr: [u("./ustoz/carlos/yuz_4_1.webp"), u("./ustoz/carlos/yuz_4_2.webp"), u("./ustoz/carlos/yuz_4_3.webp"), u("./ustoz/carlos/yuz_4_4.webp"), u("./ustoz/carlos/yuz_4_5.webp"), u("./ustoz/carlos/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/carlos/poza_5.webp"), w: 188, h: 500, yuz: { x: 23.34, y: 0.382, w: 57.979, h: 27.6, kadr: [u("./ustoz/carlos/yuz_5_1.webp"), u("./ustoz/carlos/yuz_5_2.webp"), u("./ustoz/carlos/yuz_5_3.webp"), u("./ustoz/carlos/yuz_5_4.webp"), u("./ustoz/carlos/yuz_5_5.webp"), u("./ustoz/carlos/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/carlos/poza_6.webp"), w: 238, h: 500, yuz: { x: 30.862, y: 1.717, w: 45.798, h: 27.6, kadr: [u("./ustoz/carlos/yuz_6_1.webp"), u("./ustoz/carlos/yuz_6_2.webp"), u("./ustoz/carlos/yuz_6_3.webp"), u("./ustoz/carlos/yuz_6_4.webp"), u("./ustoz/carlos/yuz_6_5.webp"), u("./ustoz/carlos/yuz_6_6.webp")] } },
  },
  jiwoo: {
    lab: "ayol",
    1: { src: u("./ustoz/jiwoo/poza_1.webp"), w: 168, h: 500, yuz: { x: 19.326, y: 0.371, w: 63.095, h: 24.4, kadr: [u("./ustoz/jiwoo/yuz_1_1.webp"), u("./ustoz/jiwoo/yuz_1_2.webp"), u("./ustoz/jiwoo/yuz_1_3.webp"), u("./ustoz/jiwoo/yuz_1_4.webp"), u("./ustoz/jiwoo/yuz_1_5.webp"), u("./ustoz/jiwoo/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/jiwoo/poza_2.webp"), w: 190, h: 499, yuz: { x: 28.318, y: 0.558, w: 55.789, h: 24.449, kadr: [u("./ustoz/jiwoo/yuz_2_1.webp"), u("./ustoz/jiwoo/yuz_2_2.webp"), u("./ustoz/jiwoo/yuz_2_3.webp"), u("./ustoz/jiwoo/yuz_2_4.webp"), u("./ustoz/jiwoo/yuz_2_5.webp"), u("./ustoz/jiwoo/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/jiwoo/poza_3.webp"), w: 293, h: 500, yuz: { x: 10.131, y: 0.371, w: 36.177, h: 24.4, kadr: [u("./ustoz/jiwoo/yuz_3_1.webp"), u("./ustoz/jiwoo/yuz_3_2.webp"), u("./ustoz/jiwoo/yuz_3_3.webp"), u("./ustoz/jiwoo/yuz_3_4.webp"), u("./ustoz/jiwoo/yuz_3_5.webp"), u("./ustoz/jiwoo/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/jiwoo/poza_4.webp"), w: 159, h: 500, yuz: { x: 11.407, y: 0.0, w: 66.667, h: 24.6, kadr: [u("./ustoz/jiwoo/yuz_4_1.webp"), u("./ustoz/jiwoo/yuz_4_2.webp"), u("./ustoz/jiwoo/yuz_4_3.webp"), u("./ustoz/jiwoo/yuz_4_4.webp"), u("./ustoz/jiwoo/yuz_4_5.webp"), u("./ustoz/jiwoo/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/jiwoo/poza_5.webp"), w: 161, h: 500, yuz: { x: 16.093, y: 0.0, w: 65.839, h: 24.6, kadr: [u("./ustoz/jiwoo/yuz_5_1.webp"), u("./ustoz/jiwoo/yuz_5_2.webp"), u("./ustoz/jiwoo/yuz_5_3.webp"), u("./ustoz/jiwoo/yuz_5_4.webp"), u("./ustoz/jiwoo/yuz_5_5.webp"), u("./ustoz/jiwoo/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/jiwoo/poza_6.webp"), w: 245, h: 500, yuz: { x: 33.59, y: 0.0, w: 43.265, h: 24.6, kadr: [u("./ustoz/jiwoo/yuz_6_1.webp"), u("./ustoz/jiwoo/yuz_6_2.webp"), u("./ustoz/jiwoo/yuz_6_3.webp"), u("./ustoz/jiwoo/yuz_6_4.webp"), u("./ustoz/jiwoo/yuz_6_5.webp"), u("./ustoz/jiwoo/yuz_6_6.webp")] } },
  },
  camille: {
    lab: "ayol",
    1: { src: u("./ustoz/camille/poza_1.webp"), w: 147, h: 500, yuz: { x: 3.161, y: 0.0, w: 92.517, h: 26.4, kadr: [u("./ustoz/camille/yuz_1_1.webp"), u("./ustoz/camille/yuz_1_2.webp"), u("./ustoz/camille/yuz_1_3.webp"), u("./ustoz/camille/yuz_1_4.webp"), u("./ustoz/camille/yuz_1_5.webp"), u("./ustoz/camille/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/camille/poza_2.webp"), w: 187, h: 500, yuz: { x: 22.861, y: 0.0, w: 72.727, h: 26.4, kadr: [u("./ustoz/camille/yuz_2_1.webp"), u("./ustoz/camille/yuz_2_2.webp"), u("./ustoz/camille/yuz_2_3.webp"), u("./ustoz/camille/yuz_2_4.webp"), u("./ustoz/camille/yuz_2_5.webp"), u("./ustoz/camille/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/camille/poza_3.webp"), w: 305, h: 500, yuz: { x: 2.209, y: 0.77, w: 44.59, h: 26.4, kadr: [u("./ustoz/camille/yuz_3_1.webp"), u("./ustoz/camille/yuz_3_2.webp"), u("./ustoz/camille/yuz_3_3.webp"), u("./ustoz/camille/yuz_3_4.webp"), u("./ustoz/camille/yuz_3_5.webp"), u("./ustoz/camille/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/camille/poza_4.webp"), w: 149, h: 500, yuz: { x: 0.624, y: 0.186, w: 91.275, h: 26.4, kadr: [u("./ustoz/camille/yuz_4_1.webp"), u("./ustoz/camille/yuz_4_2.webp"), u("./ustoz/camille/yuz_4_3.webp"), u("./ustoz/camille/yuz_4_4.webp"), u("./ustoz/camille/yuz_4_5.webp"), u("./ustoz/camille/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/camille/poza_5.webp"), w: 190, h: 500, yuz: { x: 12.718, y: 0.186, w: 71.579, h: 26.4, kadr: [u("./ustoz/camille/yuz_5_1.webp"), u("./ustoz/camille/yuz_5_2.webp"), u("./ustoz/camille/yuz_5_3.webp"), u("./ustoz/camille/yuz_5_4.webp"), u("./ustoz/camille/yuz_5_5.webp"), u("./ustoz/camille/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/camille/poza_6.webp"), w: 239, h: 500, yuz: { x: 27.22, y: 1.115, w: 56.904, h: 26.4, kadr: [u("./ustoz/camille/yuz_6_1.webp"), u("./ustoz/camille/yuz_6_2.webp"), u("./ustoz/camille/yuz_6_3.webp"), u("./ustoz/camille/yuz_6_4.webp"), u("./ustoz/camille/yuz_6_5.webp"), u("./ustoz/camille/yuz_6_6.webp")] } },
  },
  mei: {
    lab: "ayol",
    1: { src: u("./ustoz/mei/poza_1.webp"), w: 166, h: 500, yuz: { x: 18.754, y: 0.566, w: 62.651, h: 25.0, kadr: [u("./ustoz/mei/yuz_1_1.webp"), u("./ustoz/mei/yuz_1_2.webp"), u("./ustoz/mei/yuz_1_3.webp"), u("./ustoz/mei/yuz_1_4.webp"), u("./ustoz/mei/yuz_1_5.webp"), u("./ustoz/mei/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/mei/poza_2.webp"), w: 185, h: 500, yuz: { x: 29.954, y: 0.363, w: 56.216, h: 25.0, kadr: [u("./ustoz/mei/yuz_2_1.webp"), u("./ustoz/mei/yuz_2_2.webp"), u("./ustoz/mei/yuz_2_3.webp"), u("./ustoz/mei/yuz_2_4.webp"), u("./ustoz/mei/yuz_2_5.webp"), u("./ustoz/mei/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/mei/poza_3.webp"), w: 279, h: 499, yuz: { x: 9.13, y: 0.567, w: 37.276, h: 25.05, kadr: [u("./ustoz/mei/yuz_3_1.webp"), u("./ustoz/mei/yuz_3_2.webp"), u("./ustoz/mei/yuz_3_3.webp"), u("./ustoz/mei/yuz_3_4.webp"), u("./ustoz/mei/yuz_3_5.webp"), u("./ustoz/mei/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/mei/poza_4.webp"), w: 155, h: 500, yuz: { x: 12.999, y: 0.0, w: 67.097, h: 25.0, kadr: [u("./ustoz/mei/yuz_4_1.webp"), u("./ustoz/mei/yuz_4_2.webp"), u("./ustoz/mei/yuz_4_3.webp"), u("./ustoz/mei/yuz_4_4.webp"), u("./ustoz/mei/yuz_4_5.webp"), u("./ustoz/mei/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/mei/poza_5.webp"), w: 166, h: 500, yuz: { x: 17.415, y: 0.0, w: 62.651, h: 25.0, kadr: [u("./ustoz/mei/yuz_5_1.webp"), u("./ustoz/mei/yuz_5_2.webp"), u("./ustoz/mei/yuz_5_3.webp"), u("./ustoz/mei/yuz_5_4.webp"), u("./ustoz/mei/yuz_5_5.webp"), u("./ustoz/mei/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/mei/poza_6.webp"), w: 241, h: 500, yuz: { x: 35.986, y: 0.0, w: 43.154, h: 25.0, kadr: [u("./ustoz/mei/yuz_6_1.webp"), u("./ustoz/mei/yuz_6_2.webp"), u("./ustoz/mei/yuz_6_3.webp"), u("./ustoz/mei/yuz_6_4.webp"), u("./ustoz/mei/yuz_6_5.webp"), u("./ustoz/mei/yuz_6_6.webp")] } },
  },
  kenji: {
    lab: "erkak",
    1: { src: u("./ustoz/kenji/poza_1.webp"), w: 160, h: 500, yuz: { x: 18.832, y: 0.188, w: 65.0, h: 24.6, kadr: [u("./ustoz/kenji/yuz_1_1.webp"), u("./ustoz/kenji/yuz_1_2.webp"), u("./ustoz/kenji/yuz_1_3.webp"), u("./ustoz/kenji/yuz_1_4.webp"), u("./ustoz/kenji/yuz_1_5.webp"), u("./ustoz/kenji/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/kenji/poza_2.webp"), w: 191, h: 498, yuz: { x: 31.552, y: 0.189, w: 54.45, h: 24.699, kadr: [u("./ustoz/kenji/yuz_2_1.webp"), u("./ustoz/kenji/yuz_2_2.webp"), u("./ustoz/kenji/yuz_2_3.webp"), u("./ustoz/kenji/yuz_2_4.webp"), u("./ustoz/kenji/yuz_2_5.webp"), u("./ustoz/kenji/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/kenji/poza_3.webp"), w: 298, h: 500, yuz: { x: 10.427, y: 0.188, w: 34.899, h: 24.6, kadr: [u("./ustoz/kenji/yuz_3_1.webp"), u("./ustoz/kenji/yuz_3_2.webp"), u("./ustoz/kenji/yuz_3_3.webp"), u("./ustoz/kenji/yuz_3_4.webp"), u("./ustoz/kenji/yuz_3_5.webp"), u("./ustoz/kenji/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/kenji/poza_4.webp"), w: 147, h: 500, yuz: { x: 10.249, y: 0.0, w: 70.748, h: 24.6, kadr: [u("./ustoz/kenji/yuz_4_1.webp"), u("./ustoz/kenji/yuz_4_2.webp"), u("./ustoz/kenji/yuz_4_3.webp"), u("./ustoz/kenji/yuz_4_4.webp"), u("./ustoz/kenji/yuz_4_5.webp"), u("./ustoz/kenji/yuz_4_6.webp")] } },
    5: { src: u("./ustoz/kenji/poza_5.webp"), w: 173, h: 500, yuz: { x: 19.944, y: 0.0, w: 60.116, h: 24.6, kadr: [u("./ustoz/kenji/yuz_5_1.webp"), u("./ustoz/kenji/yuz_5_2.webp"), u("./ustoz/kenji/yuz_5_3.webp"), u("./ustoz/kenji/yuz_5_4.webp"), u("./ustoz/kenji/yuz_5_5.webp"), u("./ustoz/kenji/yuz_5_6.webp")] } },
    6: { src: u("./ustoz/kenji/poza_6.webp"), w: 201, h: 500, yuz: { x: 23.039, y: 0.545, w: 51.741, h: 24.6, kadr: [u("./ustoz/kenji/yuz_6_1.webp"), u("./ustoz/kenji/yuz_6_2.webp"), u("./ustoz/kenji/yuz_6_3.webp"), u("./ustoz/kenji/yuz_6_4.webp"), u("./ustoz/kenji/yuz_6_5.webp"), u("./ustoz/kenji/yuz_6_6.webp")] } },
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
    osmon: u("./ustoz/xona/osmon_til_emily.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_anna: { src: u("./ustoz/xona/til_anna_960.webp"), src2x: u("./ustoz/xona/til_anna_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c8" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_anna.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_elif: { src: u("./ustoz/xona/til_elif_960.webp"), src2x: u("./ustoz/xona/til_elif_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c7" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.851, h: 32.359 },
    osmon: u("./ustoz/xona/osmon_til_elif.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_yusuf: { src: u("./ustoz/xona/til_yusuf_960.webp"), src2x: u("./ustoz/xona/til_yusuf_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f5e0c7" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_yusuf.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_lukas: { src: u("./ustoz/xona/til_lukas_960.webp"), src2x: u("./ustoz/xona/til_lukas_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c9" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_lukas.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_carlos: { src: u("./ustoz/xona/til_carlos_960.webp"), src2x: u("./ustoz/xona/til_carlos_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_carlos.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_jiwoo: { src: u("./ustoz/xona/til_jiwoo_960.webp"), src2x: u("./ustoz/xona/til_jiwoo_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f7e2c8" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_jiwoo.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_camille: { src: u("./ustoz/xona/til_camille_960.webp"), src2x: u("./ustoz/xona/til_camille_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_camille.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_mei: { src: u("./ustoz/xona/til_mei_960.webp"), src2x: u("./ustoz/xona/til_mei_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e2c9" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.258 },
    osmon: u("./ustoz/xona/osmon_til_mei.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
  til_kenji: { src: u("./ustoz/xona/til_kenji_960.webp"), src2x: u("./ustoz/xona/til_kenji_1600.webp"),
    soat: { x: 42.0, y: 15.3, w: 7.3, yuz: "#f6e0c4" }, doska: { l: 45.8, t: 23.4, w: 40.3, h: 33.3 }, deraza: { l: 7.251, t: 15.524, w: 25.788, h: 32.359 },
    osmon: u("./ustoz/xona/osmon_til_kenji.webp"), oy: { t: 18, r: 22 }, chiroq: { x: 33 }, devor: null, javon: null, pol: null },
};
