// REV110: jonli ustozlar — pozalar, yuz kadrlari (gapirish, pirpiratish) va xonalar. Avtomatik yasalgan (tools: ustoz_assets).
// Rasmlar Vite orqali xeshlangan nom bilan chiqadi — CDN va brauzer ularni uzoq saqlaydi.
// REV120: Vite rasmlarni faqat statik ko'rinishda yig'adi — import.meta.glob bilan hammasi build'ga kiradi
// (oldingi new URL(p, import.meta.url) yordamchi funksiya ichida bo'lgani uchun production'da rasm chiqmasdi).
let RASM = {};
try { RASM = import.meta.glob("./ustoz/**/*.webp", { eager: true, query: "?url", import: "default" }); } catch { RASM = {}; }
const u = (p) => RASM[p] || p;

export const USTOZLAR = {
  sardor: {
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 193, h: 497, yuz: { x: 36.269, y: 10.865, w: 40.933, h: 11.871, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 220, h: 496, yuz: { x: 40.455, y: 11.089, w: 35.909, h: 11.895, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 351, h: 499 },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 188, h: 491 },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 289, h: 495 },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 262, h: 484 },
  },
  nilufar: {
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 220, h: 522, yuz: { x: 33.636, y: 2.682, w: 30.0, h: 14.176, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 235, h: 520, yuz: { x: 34.043, y: 2.885, w: 28.511, h: 14.423, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 307, h: 521, yuz: { x: 22.15, y: 2.687, w: 21.498, h: 14.203, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 207, h: 510 },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 235, h: 512 },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 253, h: 506, yuz: { x: 57.312, y: 3.162, w: 26.482, h: 14.822, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] } },
  },
  malika: {
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 201, h: 510, yuz: { x: 30.348, y: 6.667, w: 38.806, h: 15.686, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 245, h: 510 },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 300, h: 508 },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 229, h: 504 },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 303, h: 501 },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 244, h: 499, yuz: { x: 19.672, y: 6.814, w: 32.377, h: 16.232, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] } },
  },
};

// REV110: xona joylari (foizda): doska, deraza (ob-havo), devordagi ramka, javon, pol — mavzuga qarab to'ladi.
export const XONALAR = {
  matematika: { src: u("./ustoz/xona/matematika_960.webp"), src2x: u("./ustoz/xona/matematika_1600.webp"), doska: { l: 40.9, t: 19.4, w: 42.4, h: 37.1 }, deraza: { l: 0, t: 0, w: 6.2, h: 48 },
    // REV121: derazaning shisha bo'laklari (rom va gullar ustiga osmon chizilmaydi), shiftdagi chiroq
    oyna: [[[0, 0], [4.6, 0], [5.3, 2], [5.3, 12.3], [0, 9]], [[0, 11.7], [5.3, 15], [5.3, 29], [0, 27.2]], [[0, 30], [5.3, 31.8], [5.3, 41], [0, 41]]],
    chiroq: { x: 25 }, devor: { l: 27.4, t: 14.5, w: 8.2, h: 22 }, javon: null, pol: { l: 77, t: 80, w: 18, h: 17 } },
  onatili: { src: u("./ustoz/xona/onatili_960.webp"), src2x: u("./ustoz/xona/onatili_1600.webp"), doska: { l: 25.5, t: 11, w: 43, h: 45, panel: true }, deraza: { l: 69.5, t: 4, w: 17.5, h: 35 },
    // REV121: mol'bert juda kichik edi (rasmlar mayda) — devorda katta oq doska; deraza bo'laklari bayroqcha va mol'bertsiz
    oyna: [[[69.6, 11], [73.4, 11], [73.4, 32.5], [69.6, 32.5]], [[75.4, 9.5], [83.6, 9.5], [83.6, 21.8], [82.4, 21.8], [79.7, 38.5], [75.4, 38.5]]],
    chiroq: { x: 47 }, devor: { l: 80, t: 28.5, w: 14.5, h: 30 }, javon: null, pol: { l: 36, t: 64, w: 13, h: 14 } },   // ramka — mol'bertdagi qog'oz
  atrofolam: { src: u("./ustoz/xona/atrofolam_960.webp"), src2x: u("./ustoz/xona/atrofolam_1600.webp"), doska: { l: 50.8, t: 7.9, w: 30.6, h: 33 }, deraza: { l: 88, t: 0, w: 12, h: 42 },
    oyna: [[[89.3, 1.5], [92.4, 1.5], [92.4, 14.5], [89.3, 14.5]], [[93.4, 0], [100, 0], [100, 9.7], [93.4, 12.5]],
      [[89.3, 15.5], [92.4, 15.5], [92.4, 23.5], [89.3, 23.5]], [[93.4, 14.6], [100, 11.8], [100, 28], [93.4, 29.5]],
      [[93.4, 31.3], [100, 30.2], [100, 41], [93.4, 41]]],
    chiroq: { x: 33 }, devor: { l: 39.8, t: 5.5, w: 6.8, h: 16.5 }, javon: null, pol: { l: 50, t: 80, w: 20, h: 16 } },
};
