// REV110: jonli ustozlar — pozalar, yuz kadrlari (gapirish, pirpiratish) va xonalar. Avtomatik yasalgan (tools: ustoz_assets).
// Rasmlar Vite orqali xeshlangan nom bilan chiqadi — CDN va brauzer ularni uzoq saqlaydi.
// REV120: Vite rasmlarni faqat statik ko'rinishda yig'adi — import.meta.glob bilan hammasi build'ga kiradi
// (oldingi new URL(p, import.meta.url) yordamchi funksiya ichida bo'lgani uchun production'da rasm chiqmasdi).
let RASM = {};
try { RASM = import.meta.glob("./ustoz/**/*.webp", { eager: true, query: "?url", import: "default" }); } catch { RASM = {}; }
const u = (p) => RASM[p] || p;

// REV158: og'iz endi HAMMA pozada (ko'rsatish, o'ylash, quvonish, tinglash ham) — ustoz gapirganda labi doim qimirlaydi.
// REV153: og — og'iz markazi va eni (pozaga nisbatan foizda) hamda atrofidagi teri rangi (eski og'iz yashiriladi)
export const USTOZLAR = {
  sardor: {
    lab: "erkak",
    1: { src: u("./ustoz/sardor/poza_1.webp"), w: 193, h: 497, yuz: { x: 36.269, y: 10.865, w: 40.933, h: 11.871, kadr: [u("./ustoz/sardor/yuz_1_1.webp"), u("./ustoz/sardor/yuz_1_2.webp"), u("./ustoz/sardor/yuz_1_3.webp"), u("./ustoz/sardor/yuz_1_4.webp"), u("./ustoz/sardor/yuz_1_5.webp"), u("./ustoz/sardor/yuz_1_6.webp")] }, og: { x: 54.16, y: 18.42, w: 14.45, skin: "#f8a878" } },
    2: { src: u("./ustoz/sardor/poza_2.webp"), w: 220, h: 496, yuz: { x: 40.455, y: 11.089, w: 35.909, h: 11.895, kadr: [u("./ustoz/sardor/yuz_2_1.webp"), u("./ustoz/sardor/yuz_2_2.webp"), u("./ustoz/sardor/yuz_2_3.webp"), u("./ustoz/sardor/yuz_2_4.webp"), u("./ustoz/sardor/yuz_2_5.webp"), u("./ustoz/sardor/yuz_2_6.webp")] }, og: { x: 56.15, y: 18.66, w: 12.68, skin: "#faac7a" } },
    3: { src: u("./ustoz/sardor/poza_3.webp"), w: 351, h: 499, og: { x: 27, y: 18.7, w: 10.5, skin: "#fab386" } },
    4: { src: u("./ustoz/sardor/poza_4.webp"), w: 188, h: 491, og: { x: 45, y: 19.2, w: 12, skin: "#fbb789" } },
    5: { src: u("./ustoz/sardor/poza_5.webp"), w: 289, h: 495, og: { x: 50.5, y: 21, w: 11, skin: "#f7b284" } },
    6: { src: u("./ustoz/sardor/poza_6.webp"), w: 262, h: 484, og: { x: 34, y: 19.6, w: 12, skin: "#fbb68a" } },
  },
  nilufar: {
    lab: "ayol",
    1: { src: u("./ustoz/nilufar/poza_1.webp"), w: 220, h: 522, yuz: { x: 33.636, y: 2.682, w: 30.0, h: 14.176, kadr: [u("./ustoz/nilufar/yuz_1_1.webp"), u("./ustoz/nilufar/yuz_1_2.webp"), u("./ustoz/nilufar/yuz_1_3.webp"), u("./ustoz/nilufar/yuz_1_4.webp"), u("./ustoz/nilufar/yuz_1_5.webp"), u("./ustoz/nilufar/yuz_1_6.webp")] }, og: { x: 52.5, y: 14.83, w: 10.5, skin: "#fdc693" } },
    2: { src: u("./ustoz/nilufar/poza_2.webp"), w: 235, h: 520, yuz: { x: 34.043, y: 2.885, w: 28.511, h: 14.423, kadr: [u("./ustoz/nilufar/yuz_2_1.webp"), u("./ustoz/nilufar/yuz_2_2.webp"), u("./ustoz/nilufar/yuz_2_3.webp"), u("./ustoz/nilufar/yuz_2_4.webp"), u("./ustoz/nilufar/yuz_2_5.webp"), u("./ustoz/nilufar/yuz_2_6.webp")] }, og: { x: 51.9, y: 15.22, w: 9.96, skin: "#fdc691" } },
    3: { src: u("./ustoz/nilufar/poza_3.webp"), w: 307, h: 521, yuz: { x: 22.15, y: 2.687, w: 21.498, h: 14.203, kadr: [u("./ustoz/nilufar/yuz_3_1.webp"), u("./ustoz/nilufar/yuz_3_2.webp"), u("./ustoz/nilufar/yuz_3_3.webp"), u("./ustoz/nilufar/yuz_3_4.webp"), u("./ustoz/nilufar/yuz_3_5.webp"), u("./ustoz/nilufar/yuz_3_6.webp")] }, og: { x: 35.67, y: 14.86, w: 7.52, skin: "#fdc490" } },
    4: { src: u("./ustoz/nilufar/poza_4.webp"), w: 207, h: 510, og: { x: 55, y: 13.7, w: 10, skin: "#feba87" } },
    5: { src: u("./ustoz/nilufar/poza_5.webp"), w: 235, h: 512, og: { x: 59.5, y: 15.4, w: 11.5, skin: "#fdbb89" } },
    6: { src: u("./ustoz/nilufar/poza_6.webp"), w: 253, h: 506, yuz: { x: 57.312, y: 3.162, w: 26.482, h: 14.822, kadr: [u("./ustoz/nilufar/yuz_6_1.webp"), u("./ustoz/nilufar/yuz_6_2.webp"), u("./ustoz/nilufar/yuz_6_3.webp"), u("./ustoz/nilufar/yuz_6_4.webp"), u("./ustoz/nilufar/yuz_6_5.webp"), u("./ustoz/nilufar/yuz_6_6.webp")] }, og: { x: 73.9, y: 15.84, w: 9.25, skin: "#fdc28d" } },
  },
  malika: {
    lab: "ayol",
    1: { src: u("./ustoz/malika/poza_1.webp"), w: 201, h: 510, yuz: { x: 30.348, y: 6.667, w: 38.806, h: 15.686, kadr: [u("./ustoz/malika/yuz_1_1.webp"), u("./ustoz/malika/yuz_1_2.webp"), u("./ustoz/malika/yuz_1_3.webp"), u("./ustoz/malika/yuz_1_4.webp"), u("./ustoz/malika/yuz_1_5.webp"), u("./ustoz/malika/yuz_1_6.webp")] }, og: { x: 45.45, y: 19.74, w: 11.16, skin: "#fdb577" } },
    2: { src: u("./ustoz/malika/poza_2.webp"), w: 245, h: 510, og: { x: 48.5, y: 19.8, w: 10, skin: "#ffac71" } },
    3: { src: u("./ustoz/malika/poza_3.webp"), w: 300, h: 508, og: { x: 33.5, y: 20.1, w: 8.5, skin: "#feae73" } },
    4: { src: u("./ustoz/malika/poza_4.webp"), w: 229, h: 504, og: { x: 40.5, y: 16.5, w: 8.5, skin: "#fcb074" } },
    5: { src: u("./ustoz/malika/poza_5.webp"), w: 303, h: 501, og: { x: 42.5, y: 19.9, w: 11, skin: "#fda970" } },
    6: { src: u("./ustoz/malika/poza_6.webp"), w: 244, h: 499, yuz: { x: 19.672, y: 6.814, w: 32.377, h: 16.232, kadr: [u("./ustoz/malika/yuz_6_1.webp"), u("./ustoz/malika/yuz_6_2.webp"), u("./ustoz/malika/yuz_6_3.webp"), u("./ustoz/malika/yuz_6_4.webp"), u("./ustoz/malika/yuz_6_5.webp"), u("./ustoz/malika/yuz_6_6.webp")] }, og: { x: 32.21, y: 20.3, w: 9.3, skin: "#fdb87a" } },
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
    chiroq: { x: 25 }, devor: { l: 27.4, t: 14.5, w: 8.2, h: 22 }, javon: null, pol: { l: 77, t: 80, w: 18, h: 17 } },
  onatili: { src: u("./ustoz/xona/onatili_960.webp"), // REV158: devordagi soat (markaz va siferblat eni, foizda) — ustiga haqiqiy vaqtni ko'rsatuvchi soat chiziladi
    soat: { x: 17.92, y: 8.9, w: 7.6, yuz: "#e8c3a6" }, src2x: u("./ustoz/xona/onatili_1600.webp"), doska: { l: 25.5, t: 11, w: 43, h: 45, panel: true }, deraza: { l: 69.25, t: 0.999, w: 17.5, h: 38.062 },
    // REV140: shisha niqobi — bayroqchalar, gul, parda va mol'bert oldinda qoladi
    osmon: u("./ustoz/xona/osmon_onatili.webp"), oy: { t: 20, r: 20 },
    chiroq: { x: 47 }, devor: { l: 80, t: 28.5, w: 14.5, h: 30 }, javon: null, pol: { l: 36, t: 64, w: 13, h: 14 } },   // ramka — mol'bertdagi qog'oz
  atrofolam: { src: u("./ustoz/xona/atrofolam_960.webp"), // REV158: devordagi soat (markaz va siferblat eni, foizda) — ustiga haqiqiy vaqtni ko'rsatuvchi soat chiziladi
    soat: { x: 25.17, y: 14.57, w: 7.8, yuz: "#d8c6b6" }, src2x: u("./ustoz/xona/atrofolam_1600.webp"), doska: { l: 50.8, t: 7.9, w: 30.6, h: 33 }, deraza: { l: 89.125, t: 0, w: 10.875, h: 41.858 },
    osmon: u("./ustoz/xona/osmon_atrofolam.webp"), oy: { t: 5, r: 12 },   // REV140: shisha niqobi (gul barglari oldinda)
    chiroq: { x: 33 }, devor: { l: 39.8, t: 5.5, w: 6.8, h: 16.5 }, javon: null, pol: { l: 50, t: 80, w: 20, h: 16 } },
};
