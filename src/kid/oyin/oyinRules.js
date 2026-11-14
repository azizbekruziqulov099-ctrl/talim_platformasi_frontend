// REV324: O'YIN DVIGATELI — bog'cha darslari (2–7 yosh) uchun dars elementlari va sonlardan avtomatik o'yin.
// Element: { say, uz, emoji, image, rom } — say: o'rganilayotgan tildagi so'z, uz: ma'nosi, emoji/image: rasmi,
// rom: lotincha o'qilishi (ixtiyoriy). Bu fayl — sof funksiyalar: brauzersiz (node:test) sinaladi, React yo'q.
//
//   OYINLAR                       — katalog: { id, nom, yosh, harakat, kerak: { min_element, son? }, ... }
//   oyinTanla({ elementlar, yosh, tarix })  — keyingi o'yin id si (7 kun ichida o'ynalgani va ketma-ket bir xil harakat yo'q)
//   oyinYasa(id, { elementlar, yosh })      — o'yin holati: raundlar (savol, variantlar, to'g'ri javob)
//   tekshir(holat, javob)                   — javobni tekshiradi, yangi holat qaytaradi (2 xatoda keyingisi osonroq)
//   qiyinlikMoslash(qiyinlik, xatolar)      — keyingi o'yin qiyinligi
import { OSISH_TOPLAM, GUL_TOPLAM } from "./osishData.js";   // REV452
import { TARTIB_TOPLAM, TESKARI_QOSH } from "./rasmliData.js";   // REV459
import { HAYOT_TOPLAM } from "./hayotData.js";   // REV524
import { gradeSpeech } from "../../speech/speakRules.js";
import { OYIN_MATN, oyinMatn, umumiyGap, toza } from "./oyinMatn.js";

export const YOSHLAR = ["2-3", "4-5", "6-7"];
export const HARAKATLAR = ["bosish", "surish", "aytish", "chizish"];
// REV545: darslarda ishlatilmaydigan o'yinlar. 117 «Ayt va och» (mikrofon: «rasm nomini aytsang, eshik ochiladi») — Azizjon talabi bilan
// 2–7 yoshlilar darslaridan olib tashlandi. Miya qadamida shu raqam turgan bo'lsa — o'rniga xuddi shu rasmlar bilan 116 «Eshit va bos»
// o'ynaladi (ustoz aytadi, bola rasmni bosadi). Dvigatel o'chirilmagan: o'yin xonasida («Nutq va eshitish») o'yin hozircha qolgan.
export const DARSDA_YOQ = new Set([117]);
export const DARSDA_ALMASH = { 117: 116 };
export const KUN_MS = 24 * 60 * 60 * 1000;
export const TAKRORLANMASLIK_KUN = 7;
export const QIYINLIK_MIN = -2;
export const QIYINLIK_MAX = 0;
export const DAVOMIYLIK = { min: 40, max: 90 };   // bitta o'yin taxminan necha soniya

const HAMMA = ["2-3", "4-5", "6-7"];
const KATTA = ["4-5", "6-7"];
const BAZA_VARIANT = { "2-3": 2, "4-5": 3, "6-7": 4 };

/**
 * O'yinlar katalogi. raund — yoshga qarab raundlar soni, soniya — bitta raund taxminan necha soniya
 * (raund × soniya = 40–90 s). kerak.son — o'yin uchun sonlar oralig'i kamida shu songacha bo'lishi kerak.
 */
export const OYINLAR = [
  // REV335: fazoviy tasavvur o'yinlari
  { id: 68, kalit: "soya", nom: "Soyasini top", belgi: "🌑", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 10, "4-5": 9, "6-7": 9 } },
  { id: 76, kalit: "joylashuv", nom: "Qayerda?", belgi: "📦", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 1 },
    raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 10, "4-5": 9, "6-7": 9 } },
  // REV359: sirli quti — darsning yangi narsasi qutida: bir qismi ko'rinadi, ovozi eshitiladi; bola 2–4 rasmdan topadi
  { id: 119, kalit: "sirliQuti", nom: "Sirli quti", belgi: "🎁", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 3, "4-5": 4, "6-7": 4 }, soniya: { "2-3": 14, "4-5": 13, "6-7": 12 } },
  // REV351: eshitish o'yinlari
  { id: 121, kalit: "hayvonOvoz", nom: "Kim ovoz beryapti?", belgi: "👂", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 8, "6-7": 8 } },
  { id: 123, kalit: "transportOvoz", nom: "Qaysi transport?", belgi: "🚂", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 8, "6-7": 8 } },
  { id: 142, kalit: "faslOvoz", nom: "Fasl ovozlari", belgi: "🍂", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 11, "6-7": 10 } },
  { id: 118, kalit: "birinchiHarf", nom: "Birinchi harf", belgi: "🔤", yosh: ["6-7"], harakat: "bosish", kerak: { min_element: 0 },
    raund: { "6-7": 6 }, soniya: { "6-7": 11 } },
  // REV370: «Bo‘g‘in qarsagi» bog'chada o'chirilgan — bolalar hali bo'g'inlab sanamaydi (yosh: [])
  { id: 120, kalit: "bogin", nom: "Bo‘g‘in qarsagi", belgi: "👏", yosh: [], harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 11, "6-7": 10 } },
  // REV349: tartibga qo'yish — hayotiy jarayonlar to'g'ri ketma-ketlikda
  { id: 152, kalit: "kapalak", nom: "Kapalak hayoti", belgi: "🦋", yosh: HAMMA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 146, kalit: "gulOstir", nom: "Gul o‘stiramiz", belgi: "🌷", yosh: HAMMA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 29, kalit: "kunTartibi", nom: "Kun tartibi", belgi: "🌙", yosh: HAMMA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 157, kalit: "qolYuvish", nom: "Qo‘l yuvamiz", belgi: "🧻", yosh: HAMMA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 153, kalit: "suvSayohati", nom: "Suv sayohati", belgi: "🌊", yosh: ["6-7"], harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 15, kalit: "fasllar", nom: "Fasllar g‘ildiragi", belgi: "❄️", yosh: KATTA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 156, kalit: "tishTozalash", nom: "Tishimni tozalayman", belgi: "💧", yosh: HAMMA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  { id: 176, kalit: "qayerdan", nom: "Qayerdan keladi?", belgi: "🍞", yosh: KATTA, harakat: "surish", kerak: { min_element: 0 },   // REV459: non va sut qayerdan keladi
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 26, "4-5": 28, "6-7": 30 } },
  { id: 166, kalit: "osish", nom: "Kim qanday o‘sadi?", belgi: "🐣", yosh: KATTA, harakat: "surish", kerak: { min_element: 0 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 24, "6-7": 26 } },
  // REV348: saralash (narsani o'z guruhiga) va ulash (juftini topish) — atrof-muhit, mantiq, fasllar
  { id: 149, kalit: "uyYovvoyi", nom: "Uy yoki yovvoyi", belgi: "🏡", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 154, kalit: "mevaSabzavot", nom: "Meva yoki sabzavot", belgi: "🧺", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 161, kalit: "xavfli", nom: "Xavfli yoki xavfsiz", belgi: "⚠️", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 162, kalit: "chiqindi", nom: "Chiqindini sarala", belgi: "♻️", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 168, kalit: "transport", nom: "Transport", belgi: "🚗", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 150, kalit: "harakatTuri", nom: "Kim qanday harakatlanadi", belgi: "🪽", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 96, kalit: "yeyiladi", nom: "Yeyiladimi?", belgi: "😋", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 14, kalit: "faslKiyim", nom: "Fasl kiyimi", belgi: "🧣", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 18, kalit: "faslMeva", nom: "Fasl mevasi", belgi: "🍉", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 148, kalit: "onaBola", nom: "Ona va bola", belgi: "🐤", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 94, kalit: "uyiQayerda", nom: "Kim qayerda yashaydi", belgi: "🪺", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 158, kalit: "kasbAsbob", nom: "Kasb va asbob", belgi: "🧑‍⚕️", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 147, kalit: "hayvonOvqat", nom: "Hayvonni boq", belgi: "🥕", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 95, kalit: "nimaBilan", nom: "Nima nima bilan", belgi: "🔑", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 165, kalit: "sezgi", nom: "Besh sezgi", belgi: "👃", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  // REV338: matematika o'yinlari
  { id: 49, kalit: "dokon", nom: "Do‘kon", belgi: "🛒", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 5, "6-7": 5 }, soniya: { "4-5": 11, "6-7": 12 } },
  { id: 57, kalit: "onlik", nom: "O‘nlik bog‘lami", belgi: "🥢", yosh: ["6-7"], harakat: "bosish", kerak: { min_element: 0 },
    raund: { "6-7": 5 }, soniya: { "6-7": 12 } },
  { id: 43, kalit: "tenglash", nom: "Tenglashtir", belgi: "⚖️", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 5, "6-7": 5 }, soniya: { "4-5": 11, "6-7": 11 } },
  { id: 59, kalit: "masala", nom: "Masala ertagi", belgi: "📚", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 4, "6-7": 5 }, soniya: { "4-5": 14, "6-7": 14 } },
  // REV337: rang-tasvir o'yinlari
  { id: 61, kalit: "rangTop", nom: "Rangni top", belgi: "🎨", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 8, "6-7": 8 } },
  { id: 62, kalit: "rangUyi", nom: "Rang uyi", belgi: "🏠", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 10, "4-5": 9, "6-7": 9 } },
  { id: 63, kalit: "boya", nom: "Bo‘yab chiq", belgi: "🖌️", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 6 }, soniya: { "2-3": 10, "4-5": 9, "6-7": 9 } },
  { id: 64, kalit: "aralash", nom: "Rang aralashtir", belgi: "🧪", yosh: ["6-7"], harakat: "bosish", kerak: { min_element: 0 },
    raund: { "6-7": 5 }, soniya: { "6-7": 11 } },
  // REV536: shakl o'yinlari (chizmalar SVG — rasm kerak emas)
  { id: 201, kalit: "shaklTop", nom: "Shaklni top", belgi: "🔷", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 12, "4-5": 10, "6-7": 9 } },
  { id: 202, kalit: "shaklJoy", nom: "Shakl uyasi", belgi: "🧩", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 12, "4-5": 10, "6-7": 9 } },
  { id: 203, kalit: "shaklNarsa", nom: "Nimaga o‘xshaydi?", belgi: "⚽", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 11, "6-7": 10 } },
  { id: 204, kalit: "naqsh", nom: "Naqshni davom ettir", belgi: "🔁", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 13, "6-7": 12 } },
  { id: 205, kalit: "kattaKichik", nom: "Katta va kichik", belgi: "📏", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 12, "4-5": 10, "6-7": 9 } },
  // REV537: mantiq va sanash — yangi o'yinlar (SVG)
  { id: 206, kalit: "matritsa", nom: "Bo‘sh katak", belgi: "🔲", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 13, "6-7": 12 } },
  { id: 207, kalit: "yarmi", nom: "Yarmini top", belgi: "🌗", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 11, "6-7": 10 } },
  { id: 208, kalit: "sanaShakl", nom: "Shakllarni sana", belgi: "🔺", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 13, "6-7": 12 } },
  { id: 209, kalit: "ketmaSon", nom: "Sonlar qatori", belgi: "🔢", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 }, raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 12, "6-7": 11 } },
  { id: 93, kalit: "yollar", nom: "Chalkash yo‘llar", belgi: "🦴", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 3, "4-5": 4, "6-7": 5 }, soniya: { "2-3": 14, "4-5": 14, "6-7": 15 } },
  { id: 106, kalit: "tarozi", nom: "Tarozi", belgi: "⚖️", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 5, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 10 } },
  { id: 114, kalit: "teskari", nom: "Teskarisini top", belgi: "🔄", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 10, "6-7": 10 } },
  { id: 103, kalit: "minora", nom: "Kubiklar minorasi", belgi: "🧱", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 0 },
    raund: { "2-3": 4, "4-5": 5, "6-7": 5 }, soniya: { "2-3": 12, "4-5": 12, "6-7": 13 } },
  { id: 116, kalit: "eshitBos", nom: "Eshit va bos", belgi: "👂", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 4, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 11, "4-5": 10, "6-7": 10 } },
  { id: 117, kalit: "aytOch", nom: "Ayt-chi!", belgi: "🗣️", yosh: HAMMA, harakat: "aytish", kerak: { min_element: 2 },
    raund: { "2-3": 4, "4-5": 4, "6-7": 5 }, soniya: { "2-3": 14, "4-5": 14, "6-7": 14 } },
  { id: 83, kalit: "oxshash", nom: "O‘xshashini top", belgi: "🔍", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 5, "4-5": 6, "6-7": 7 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 89, kalit: "juft", nom: "Juft kartalar", belgi: "🃏", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 2, "4-5": 2, "6-7": 2 }, soniya: { "2-3": 22, "4-5": 30, "6-7": 40 } },
  { id: 88, kalit: "yashirin", nom: "Kim yashirindi", belgi: "🙈", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 3 },
    raund: { "2-3": 4, "4-5": 4, "6-7": 5 }, soniya: { "2-3": 12, "4-5": 12, "6-7": 12 } },
  { id: 86, kalit: "ortiqcha", nom: "Ortiqchasini top", belgi: "🧐", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 5, "4-5": 5, "6-7": 6 }, soniya: { "2-3": 9, "4-5": 9, "6-7": 9 } },
  { id: 90, kalit: "ketmaKet", nom: "Kabu ketma-ketligi", belgi: "🤖", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 4, "4-5": 5, "6-7": 5 }, soniya: { "2-3": 12, "4-5": 12, "6-7": 13 } },
  { id: 91, kalit: "tartib", nom: "Hikoya tartibi", belgi: "📖", yosh: KATTA, harakat: "surish", kerak: { min_element: 3 },
    raund: { "4-5": 3, "6-7": 2 }, soniya: { "4-5": 20, "6-7": 30 } },
  { id: 32, kalit: "savat", nom: "Savatga sol", belgi: "🧺", yosh: HAMMA, harakat: "surish", kerak: { min_element: 2, son: 2 },
    raund: { "2-3": 3, "4-5": 3, "6-7": 3 }, soniya: { "2-3": 15, "4-5": 18, "6-7": 22 } },
  { id: 31, kalit: "sana", nom: "Bosib sana", belgi: "👆", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 1, son: 2 },
    raund: { "2-3": 4, "4-5": 4, "6-7": 4 }, soniya: { "2-3": 11, "4-5": 14, "6-7": 18 } },
  { id: 35, kalit: "qaysiKop", nom: "Qaysi ko‘p", belgi: "⚖️", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 1, son: 3 },
    raund: { "2-3": 5, "4-5": 5, "6-7": 5 }, soniya: { "2-3": 9, "4-5": 10, "6-7": 11 } },
  { id: 38, kalit: "yoqolganSon", nom: "Yo‘qolgan son", belgi: "🔢", yosh: KATTA, harakat: "bosish", kerak: { min_element: 0, son: 4 },
    raund: { "4-5": 5, "6-7": 6 }, soniya: { "4-5": 10, "6-7": 10 } },
  { id: 55, kalit: "kabuXato", nom: "Kabu xato qildi", belgi: "🙊", yosh: KATTA, harakat: "bosish", kerak: { min_element: 3 },
    raund: { "4-5": 4, "6-7": 5 }, soniya: { "4-5": 12, "6-7": 12 } },
  { id: 97, kalit: "haYoq", nom: "Ha yoki yo‘q", belgi: "👍", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 2 },
    raund: { "2-3": 6, "4-5": 7, "6-7": 8 }, soniya: { "2-3": 7, "4-5": 7, "6-7": 7 } },
  { id: 33, kalit: "sehrliQuti", nom: "Sehrli quti", belgi: "🎁", yosh: HAMMA, harakat: "bosish", kerak: { min_element: 1, son: 2 },
    raund: { "2-3": 4, "4-5": 4, "6-7": 5 }, soniya: { "2-3": 12, "4-5": 13, "6-7": 14 } },
];

const BY_ID = new Map(OYINLAR.map((o) => [o.id, o]));
/** Katalogdagi o'yin (id raqam yoki satr). */
export const oyinOl = (id) => BY_ID.get(Number(id)) || null;
/** O'yin nomi izoh tilida (uz, ru, en, de, es). */
export const oyinNomi = (id, izoh = "uz") => { const o = oyinOl(id); return o ? oyinMatn(o.kalit, "nom", izoh) || o.nom : ""; };

/* ───────────────────────── yordamchilar ───────────────────────── */

/** Yosh guruhi: "2-3" | "4-5" | "6-7". Raqam (2..7) yoki «2–3» kabi yozuv ham qabul qilinadi. */
export function yoshNorm(yosh) {
  const s = String(yosh ?? "").replace(/[–—\s]/g, "-").replace(/yosh/i, "").replace(/-+$/, "");
  if (YOSHLAR.includes(s)) return s;
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) return "4-5";
  return n <= 3 ? "2-3" : n <= 5 ? "4-5" : "6-7";
}
export const qiyinlikNorm = (q) => Math.max(QIYINLIK_MIN, Math.min(QIYINLIK_MAX, Math.round(Number(q) || 0)));

/** Tanlovlar soni: 2-3 yosh — 2, 4-5 — 3, 6-7 — 4. Qiyinlik pasaysa — kamroq (kamida 2). */
export const variantSoni = (yosh, qiyinlik = 0) => Math.max(2, BAZA_VARIANT[yoshNorm(yosh)] + Math.min(0, qiyinlikNorm(qiyinlik)));

/** Takrorlanadigan tasodif (urug' — son yoki satr); urug' berilmasa Math.random. Funksiya berilsa — o'zi. */
export function tasodif(urug) {
  if (typeof urug === "function") return urug;
  if (urug === undefined || urug === null || urug === "") return Math.random;
  let a = 0;
  if (typeof urug === "number" && Number.isFinite(urug)) a = Math.floor(urug) >>> 0;
  else for (const ch of String(urug)) a = (Math.imul(a, 31) + ch.codePointAt(0)) >>> 0;
  return () => {   // mulberry32
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function aralash(arr, rnd = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const tanla = (arr, n, rnd) => aralash(arr, rnd).slice(0, Math.max(0, n));
const bitta = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
const butun = (a, b, rnd) => (b <= a ? a : a + Math.floor(rnd() * (b - a + 1)));
const str = (v) => (v === undefined || v === null ? "" : String(v).trim());

/** Ovoz uchun teg: o'rganilayotgan tildagi so'z o'z ovozida o'qiladi («[en]cat[/en]»). O'zbekcha — tegsiz. */
export const teg = (text, til) => (!text ? "" : !til || til === "uz" ? String(text) : `[${til}]${text}[/${til}]`);
/** Element nomi ovoz uchun: say (teglangan), bo'lmasa uz. */
export const nomOvoz = (el, til) => (el?.say ? teg(el.say, til) : str(el?.uz));

/**
 * Elementlarni tayyorlaydi: rasmi (emoji yoki image) bo'lmaganlari olinmaydi; so'zi yoki rasmi bir xil bo'lsa — takror
 * hisoblanadi (o'yinda ikkita bir xil ko'rinadigan variant bo'lmasin). Har biriga k (kalit) beriladi.
 */
export function elementlarTayyor(elementlar) {
  const out = [];
  const sozlar = new Set();
  const rasmlar = new Set();
  for (const e of Array.isArray(elementlar) ? elementlar : []) {
    if (!e || typeof e !== "object") continue;
    const el = { ...e, say: str(e.say), uz: str(e.uz), emoji: str(e.emoji), image: str(e.image), rom: str(e.rom) };
    if (!el.emoji && !el.image) continue;
    const soz = (el.say || el.uz).toLowerCase();
    const rasm = el.image || el.emoji;
    if ((soz && sozlar.has(soz)) || rasmlar.has(rasm)) continue;
    if (soz) sozlar.add(soz);
    rasmlar.add(rasm);
    out.push({ ...el, k: `e:${soz || rasm}` });
  }
  return out;
}

const SON_STANDART = { "2-3": [1, 3], "4-5": [1, 5], "6-7": [1, 10] };
const SON_CHEGARA = { "2-3": 5, "4-5": 10, "6-7": 20 };
/**
 * Sonlar oralig'i { min, max }. sonlar berilmasa — yoshga qarab (2-3: 1–3, 4-5: 1–5, 6-7: 1–10); berilsa — darsdagi
 * sonlar (yosh chegarasidan oshmaydi). sonlar = [] — darsda son yo'q (null). Qiyinlik pasaysa — oraliq qisqaradi.
 */
export function sonOraligi(yosh, sonlar, qiyinlik = 0) {
  const y = yoshNorm(yosh);
  let [min, max] = SON_STANDART[y];
  if (Array.isArray(sonlar)) {
    const t = sonlar.map(Number).filter((n) => Number.isInteger(n) && n >= 1);
    if (!t.length) return null;
    min = Math.min(...t);
    max = Math.min(SON_CHEGARA[y], Math.max(...t));
    if (max < min) return null;
  }
  const q = qiyinlikNorm(qiyinlik);
  if (q < 0) max = Math.max(min + 1, Math.ceil(max * (q <= -2 ? 0.5 : 0.7)));
  return { min, max };
}

/** O'yin shu yosh va shu elementlar/sonlar bilan o'ynalsa bo'ladimi. */
export function oyinMosmi(id, { elementlar, yosh, sonlar } = {}) {
  const o = typeof id === "object" && id ? id : oyinOl(id);
  if (!o) return false;
  const y = yoshNorm(yosh);
  if (!o.yosh.includes(y)) return false;
  if (elementlarTayyor(elementlar).length < (o.kerak.min_element || 0)) return false;
  if (o.kerak.son) { const s = sonOraligi(y, sonlar); if (!s || s.max < o.kerak.son) return false; }
  return true;
}

/** O'yin taxminan necha soniya (raundlar × raund vaqti). */
export function taxminiySoniya(id, yosh) {
  const o = typeof id === "object" && id ? id : oyinOl(id);
  const y = yoshNorm(yosh);
  return o && o.raund[y] ? o.raund[y] * o.soniya[y] : 0;
}

const vaqtMs = (v) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v));

/**
 * Keyingi o'yinni tanlaydi. tarix: [{ id, vaqt }] (vaqt — ms, Date yoki ISO satr). Qoidalar:
 *  1) yoshga mos va elementlar/sonlar yetarli bo'lgan o'yin;
 *  2) oxirgi 7 kun ichida o'ynalgan id qaytmaydi;
 *  3) oxirgi o'ynalgan o'yin bilan bir xil harakat turi (bosish/surish/aytish/chizish) ketma-ket kelmaydi.
 * Mos o'yin qolmasa — null. Qaytaradi: o'yin id si.
 */
export function oyinTanla({ elementlar, yosh, tarix = [], sonlar, hozir = Date.now(), urug } = {}) {
  const rnd = tasodif(urug);
  const t = vaqtMs(hozir);
  const yozuvlar = (Array.isArray(tarix) ? tarix : [])
    .filter((x) => x && x.id !== undefined && x.id !== null)
    .map((x, i) => ({ id: Number(x.id), harakat: x.harakat, vaqt: vaqtMs(x.vaqt ?? x.sana ?? x.date), i }));
  const yaqinda = new Set(yozuvlar
    .filter((x) => Number.isFinite(x.vaqt) && t - x.vaqt < TAKRORLANMASLIK_KUN * KUN_MS)
    .map((x) => x.id));
  // oxirgi o'yin: eng kech vaqtlisi (vaqti yo'q bo'lsa — ro'yxatdagi oxirgisi)
  const oxirgi = [...yozuvlar].sort((a, b) => ((Number.isFinite(a.vaqt) ? a.vaqt : -Infinity) - (Number.isFinite(b.vaqt) ? b.vaqt : -Infinity)) || a.i - b.i).pop();
  const oxirgiHarakat = oxirgi ? (oyinOl(oxirgi.id)?.harakat || oxirgi.harakat || null) : null;
  const nomzodlar = OYINLAR.filter((o) => !yaqinda.has(o.id) && !DARSDA_YOQ.has(o.id)
    && o.harakat !== oxirgiHarakat
    && oyinMosmi(o, { elementlar, yosh, sonlar }));
  if (!nomzodlar.length) return null;
  return bitta(nomzodlar, rnd).id;
}

/* ───────────────────────── raund yasovchilar ───────────────────────── */

/** count ta nishon: elementlar aralashtirilib navbat bilan, yonma-yon bir xili kelmaydi (elementlar >1 bo'lsa). */
/** REV420: nomi aytiladigan o'yinlarda — nomi bor va so'zning o'z rasmi bor narsalar (2 tadan kam bo'lsa — hammasi). */
export function aniqNarsalar(els) {
  const yaxshi = (els || []).filter((e) => nomOvoz(e, "uz").trim() && e.sozRasm !== false);
  return yaxshi.length >= 2 ? yaxshi : els;
}

function navbat(els, count, rnd) {
  const out = [];
  while (out.length < count && els.length) {
    const tur = aralash(els, rnd);
    if (out.length && tur.length > 1 && tur[0].k === out[out.length - 1].k) [tur[0], tur[1]] = [tur[1], tur[0]];
    out.push(...tur);
  }
  return out.slice(0, count);
}
const elVariant = (el) => ({ k: el.k, el });
const sonVariant = (n) => ({ k: `n:${n}`, son: n });

/** To'g'ri element + (n-1) ta boshqa element, aralash. Elementlar kam bo'lsa — boricha (kamida 2). */
function elementVariantlar(togri, els, n, rnd, avvalgilar = []) {
  const boshqa = els.filter((e) => e.k !== togri.k && !avvalgilar.some((a) => a.k === e.k));
  const qolgan = els.filter((e) => e.k !== togri.k && avvalgilar.some((a) => a.k === e.k));
  const chalgit = [...avvalgilar.filter((a) => a.k !== togri.k), ...tanla(boshqa, n, rnd), ...tanla(qolgan, n, rnd)]
    .filter((e, i, a) => a.findIndex((x) => x.k === e.k) === i)
    .slice(0, n - 1);
  return aralash([togri, ...chalgit], rnd).map(elVariant);
}

/** To'g'ri son + (n-1) ta yaqin son (1 dan kichik emas, chiqarish ro'yxatidagilar emas), aralash. */
export function sonVariantlar(javob, n, rnd, chiqarish = []) {
  const yoq = new Set([javob, ...chiqarish]);
  const yaqin = [];
  for (let d = 1; yaqin.length < (n - 1) * 3 && d < 40; d += 1) {
    for (const x of [javob - d, javob + d]) if (x >= 1 && !yoq.has(x)) yaqin.push(x);
  }
  const tanlangan = tanla(yaqin.slice(0, Math.max(n - 1, Math.min(yaqin.length, (n - 1) * 2))), n - 1, rnd);
  return aralash([javob, ...tanlangan], rnd).map(sonVariant);
}

const NAQSHLAR = { "2-3": ["AB"], "4-5": ["AB", "AAB", "ABC"], "6-7": ["ABC", "AAB", "ABB", "AABB"] };
const PASTROQ = { "2-3": "2-3", "4-5": "2-3", "6-7": "4-5" };
const SAVAT = { "2-3": { soni: [1, 2], ortiq: 0, chalgit: 1 }, "4-5": { soni: [1, 3], ortiq: 1, chalgit: 2 }, "6-7": { soni: [2, 5], ortiq: 1, chalgit: 2 } };
const SANA = { "2-3": [1, 3], "4-5": [2, 5], "6-7": [3, 10] };

const oraliqKesish = ([a, b], son) => {
  const lo = Math.max(a, son.min);
  const hi = Math.min(b, son.max);
  return lo <= hi ? [lo, hi] : [Math.min(lo, son.max), Math.min(lo, son.max)];
};
const boshqaSon = (lo, hi, oldingi, rnd) => {
  let x = butun(lo, hi, rnd);
  if (x === oldingi && hi > lo) x = x === hi ? x - 1 : x + 1;
  return x;
};

// REV335: joylashuv yo'nalishlari va kubik ranglari
export const YONALISH = { "2-3": ["ustida", "ostida"], "4-5": ["ustida", "ostida", "ichida"], "6-7": ["ustida", "ostida", "ongda", "chapda"] };
export const KUBIK_RANG = ["#E63946", "#FFB703", "#2EC4B6", "#4A8BF5", "#9B7BFF"];
const minoraBalandlik = { "2-3": 2, "4-5": 3, "6-7": 4 };
function minoraVariantlar(namuna, n, rnd) {
  const kor = new Set([namuna.join(",")]); const out = [namuna];
  for (let t = 0; out.length < n && t < 60; t += 1) {
    const v = [...namuna];
    if (t % 2 === 0 && v.length > 1) { const i = Math.floor(rnd() * (v.length - 1)); [v[i], v[i + 1]] = [v[i + 1], v[i]]; }   // ikkitasining joyi almashgan
    else v[Math.floor(rnd() * v.length)] = bitta(KUBIK_RANG, rnd);                                                         // bitta rang boshqa
    if (!kor.has(v.join(","))) { kor.add(v.join(",")); out.push(v); }
  }
  return aralash(out.map((r, i) => ({ k: i === 0 ? "t0" : `t${i}`, minora: r })), rnd);
}

import { SARALASH, FASL_MEVA, ULASH } from "./saralashData.js";   // REV348
import { TARTIB } from "./tartibData.js";   // REV349
import { HAYVON_OVOZ, TRANSPORT_OVOZ, FASL_OVOZ } from "./eshitData.js";   // REV351

// REV348: saralash/ulash elementi — so'z izoh tilida (bola tushunadigan tilda aytiladi va yoziladi)
const sozEl = (w, izoh, k) => ({ k, emoji: w.e, uz: w.s[izoh] || w.s.uz, soz: w.s, ...((w.r || w.s?.r) ? { rasmId: w.r || w.s.r } : {}), ...(w.faqatEmoji ? { faqatEmoji: true } : {}) });   // REV451: faqatEmoji — kutubxonadagi o'xshash nomli rasm emas

// REV351: eshitish o'yinlari yordamchilari
function ovozRaund(data, { n, rnd, R, izoh }) {
  return navbat(data.map((d, i) => ({ d, i })), R, rnd).map(({ d, i }) => {
    const togri = sozEl(d.w, izoh, `o${i}`);
    const boshqa = tanla(data.filter((_, j) => j !== i), n - 1, rnd).map((x) => sozEl(x.w, izoh, `o${data.indexOf(x)}`));
    return { tur: "tanlov", savol: { ovoz: d.o[izoh] || d.o.uz, el: togri, tovush: d.t || "" }, variantlar: aralash([togri, ...boshqa].map((e) => ({ k: e.k, el: e })), rnd), togri: togri.k };
  });
}
/** Saralash/ulash ma'lumotidagi hamma rasmli so'zlar (izoh tilida). */
function SOZ_HOVUZI(izoh) {
  const kor = new Set(); const out = [];
  const qosh = (w) => { const e = sozEl(w, izoh, w.e); if (!kor.has(e.uz) && !kor.has(w.e)) { kor.add(e.uz); kor.add(w.e); out.push(e); } };
  for (const d of Object.values(SARALASH)) d.narsa.flat().forEach(qosh);
  for (const d of Object.values(ULASH)) d.juft.flat().forEach(qosh);
  return out;
}
/** So'zning birinchi harfi (o'zbekchada Sh, Ch, O', G', Ng — bitta harf). */
export function birinchiHarf(soz, izoh = "uz") {
  const s = String(soz || "").trim().replace(/[ʻʼ'`’]/g, "‘");
  if (!s) return "";
  if (izoh === "uz") { const m = /^(sh|ch|o‘|g‘)/i.exec(s); if (m) return m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(); }
  const c = s[0];
  return /\p{L}/u.test(c) ? c.toLocaleUpperCase() : "";
}
/** Bo'g'inlar soni: unli harflar soni (o'zbek: a e i o u o‘; rus: а е ё и о у ы э ю я). */
export function boginSoni(soz, izoh = "uz") {
  const s = String(soz || "").toLowerCase().replace(/[ʻʼ'`’]/g, "‘");
  if (izoh === "ru") return (s.match(/[аеёиоуыэюя]/g) || []).length;
  return (s.replace(/o‘/g, "o").match(/[aeiou]/g) || []).length;
}

// REV347: tarozi uchun juftlar — birinchisi aniq og'ir (bola hayotda biladi)
export const TAROZI_JUFT = [["🐘", "🐭"], ["🍉", "🍒"], ["🚗", "⚽"], ["🐻", "🐝"], ["🎃", "🍓"], ["🪨", "🪶"], ["🐄", "🐔"], ["📚", "✏️"], ["🛏️", "🧸"], ["🍍", "🫐"], ["🐳", "🐟"], ["🧱", "🎈"]];

// REV338: matematika o'yinlari uchun narsalar va masala ertaklari
export const DOKON = ["🍎", "🍌", "🍦", "🧸", "🎈", "🍭", "📒", "⚽", "🧃", "🍪"];
export const MASALA = [
  { e: "🐦", amal: "+", kalit: "qush" }, { e: "🍎", amal: "-", kalit: "olma" }, { e: "🐟", amal: "+", kalit: "baliq" },
  { e: "🎈", amal: "-", kalit: "shar" }, { e: "🦆", amal: "+", kalit: "ordak" }, { e: "🍪", amal: "-", kalit: "pechenye" },
];

// REV337: ranglar (5 tilda) va rangi aniq narsalar
export const RANGLAR = {
  qizil: { hex: "#E63946", s: { uz: "qizil", ru: "красный", en: "red", de: "rot", es: "rojo" } },
  sariq: { hex: "#FFD23F", s: { uz: "sariq", ru: "жёлтый", en: "yellow", de: "gelb", es: "amarillo" } },
  kok: { hex: "#3A86FF", s: { uz: "ko‘k", ru: "синий", en: "blue", de: "blau", es: "azul" } },
  yashil: { hex: "#2DBE60", s: { uz: "yashil", ru: "зелёный", en: "green", de: "grün", es: "verde" } },
  toqSariq: { hex: "#FF8C1A", s: { uz: "to‘q sariq", ru: "оранжевый", en: "orange", de: "orange", es: "naranja" } },
  binafsha: { hex: "#9B5DE5", s: { uz: "binafsha", ru: "фиолетовый", en: "purple", de: "lila", es: "morado" } },
  pushti: { hex: "#FF70A6", s: { uz: "pushti", ru: "розовый", en: "pink", de: "rosa", es: "rosa" } },
  jigarrang: { hex: "#8B5A2B", s: { uz: "jigarrang", ru: "коричневый", en: "brown", de: "braun", es: "marrón" } },
  oq: { hex: "#FFFFFF", s: { uz: "oq", ru: "белый", en: "white", de: "weiß", es: "blanco" } },
  qora: { hex: "#222222", s: { uz: "qora", ru: "чёрный", en: "black", de: "schwarz", es: "negro" } },
  kulrang: { hex: "#9AA0A6", s: { uz: "kulrang", ru: "серый", en: "grey", de: "grau", es: "gris" } },
  // REV525: ranglar 2 barobar — tuslar (och/to'q) va yangi ranglar
  moviy: { hex: "#7EC8F2", s: { uz: "moviy", ru: "голубой", en: "light blue", de: "hellblau", es: "celeste" } },
  toqKok: { hex: "#1D3A8A", s: { uz: "to‘q ko‘k", ru: "тёмно-синий", en: "dark blue", de: "dunkelblau", es: "azul oscuro" } },
  ochYashil: { hex: "#A8E05F", s: { uz: "och yashil", ru: "салатовый", en: "light green", de: "hellgrün", es: "verde claro" } },
  toqYashil: { hex: "#1E7A3C", s: { uz: "to‘q yashil", ru: "тёмно-зелёный", en: "dark green", de: "dunkelgrün", es: "verde oscuro" } },
  firuza: { hex: "#1ABC9C", s: { uz: "firuza", ru: "бирюзовый", en: "turquoise", de: "türkis", es: "turquesa" } },
  tilla: { hex: "#D4AF37", s: { uz: "tilla rang", ru: "золотой", en: "gold", de: "gold", es: "dorado" } },
  kumush: { hex: "#C4CAD0", s: { uz: "kumush rang", ru: "серебряный", en: "silver", de: "silber", es: "plateado" } },
  bej: { hex: "#E8D5B0", s: { uz: "och jigarrang", ru: "бежевый", en: "beige", de: "beige", es: "beis" } },
  toqQizil: { hex: "#9B1B30", s: { uz: "to‘q qizil", ru: "бордовый", en: "dark red", de: "dunkelrot", es: "granate" } },
  zaytun: { hex: "#7A8B2A", s: { uz: "zaytun rang", ru: "оливковый", en: "olive", de: "oliv", es: "verde oliva" } },
  siyohrang: { hex: "#4B2A8A", s: { uz: "siyohrang", ru: "тёмно-фиолетовый", en: "indigo", de: "indigo", es: "añil" } },
};
const RANG_HOVUZ = { "2-3": ["qizil", "sariq", "kok", "yashil", "toqSariq", "pushti"],
  "4-5": ["qizil", "sariq", "kok", "yashil", "toqSariq", "binafsha", "pushti", "jigarrang", "oq", "qora", "kulrang", "moviy"],
  "6-7": ["qizil", "sariq", "kok", "yashil", "toqSariq", "binafsha", "pushti", "jigarrang", "oq", "qora", "kulrang", "moviy", "toqKok", "ochYashil", "toqYashil",
    "firuza", "tilla", "kumush", "bej", "toqQizil", "zaytun", "siyohrang"] };
export const RANGLI_NARSA = [
  ["🍎", "qizil"], ["🍓", "qizil"], ["🍒", "qizil"], ["🍌", "sariq"], ["🐥", "sariq"], ["🌻", "sariq"], ["🐳", "kok"], ["💧", "kok"],
  ["🥒", "yashil"], ["🐸", "yashil"], ["🍀", "yashil"], ["🍊", "toqSariq"], ["🥕", "toqSariq"], ["🎃", "toqSariq"], ["🍇", "binafsha"], ["🍆", "binafsha"],
  ["🌸", "pushti"], ["🦩", "pushti"], ["🐻", "jigarrang"], ["🍫", "jigarrang"], ["⛄", "oq"], ["🦢", "oq"], ["🐈‍⬛", "qora"], ["🎩", "qora"],
  // REV525: rangli narsalar 4 barobar (24 → 100)
  ["🍅", "qizil"], ["🌹", "qizil"], ["🚒", "qizil"], ["❤️", "qizil"], ["🌶️", "qizil"], ["🐞", "qizil"], ["🎈", "qizil"], ["🦀", "qizil"],
  ["🍋", "sariq"], ["🌽", "sariq"], ["⭐", "sariq"], ["🧀", "sariq"], ["🌕", "sariq"], ["🚕", "sariq"], ["🌼", "sariq"], ["🐤", "sariq"],
  ["🫐", "kok"], ["🚙", "kok"], ["🐬", "kok"], ["🧢", "kok"], ["👖", "kok"], ["🌊", "kok"], ["🐟", "kok"], ["📘", "kok"],
  ["🥦", "yashil"], ["🐢", "yashil"], ["🌲", "yashil"], ["🍏", "yashil"], ["🥬", "yashil"], ["🐊", "yashil"], ["🦖", "yashil"], ["🍃", "yashil"],
  ["🦊", "toqSariq"], ["🏀", "toqSariq"], ["🐅", "toqSariq"], ["🧡", "toqSariq"], ["🍑", "toqSariq"], ["🦺", "toqSariq"],
  ["🔮", "binafsha"], ["💜", "binafsha"], ["☂️", "binafsha"], ["🪻", "binafsha"], ["👾", "binafsha"],
  ["🐷", "pushti"], ["🌷", "pushti"], ["🎀", "pushti"], ["💗", "pushti"], ["🧠", "pushti"], ["🍥", "pushti"],
  ["🐴", "jigarrang"], ["🪵", "jigarrang"], ["🥥", "jigarrang"], ["🐿️", "jigarrang"], ["🍪", "jigarrang"], ["🥔", "jigarrang"], ["🐒", "jigarrang"], ["☕", "jigarrang"],
  ["🥛", "oq"], ["🐑", "oq"], ["☁️", "oq"], ["🦷", "oq"], ["🍚", "oq"], ["🐇", "oq"], ["🥚", "oq"], ["🧻", "oq"],
  ["🐜", "qora"], ["🕷️", "qora"], ["🎱", "qora"], ["🖤", "qora"], ["🕶️", "qora"], ["♟️", "qora"],
  ["🐘", "kulrang"], ["🐭", "kulrang"], ["🦏", "kulrang"], ["🪨", "kulrang"], ["🐺", "kulrang"], ["🦈", "kulrang"],
  ["🏆", "tilla"], ["👑", "tilla"], ["🔔", "tilla"], ["🥇", "tilla"], ["🥈", "kumush"], ["🥄", "kumush"], ["🔧", "kumush"],
  ["🩵", "moviy"], ["🧊", "moviy"], ["🫒", "zaytun"], ["🍷", "toqQizil"], ["🧉", "bej"],
];
export const ARALASH = [["kok", "sariq", "yashil"], ["qizil", "sariq", "toqSariq"], ["qizil", "kok", "binafsha"], ["qizil", "oq", "pushti"], ["qora", "oq", "kulrang"],
  // REV525: rang aralashtirish 5 → 13
  ["kok", "oq", "moviy"], ["qizil", "qora", "toqQizil"], ["yashil", "oq", "ochYashil"], ["yashil", "qora", "toqYashil"], ["kok", "qora", "toqKok"],
  ["kok", "yashil", "firuza"], ["qizil", "yashil", "jigarrang"], ["jigarrang", "oq", "bej"]];
const rangV = (r) => ({ k: r, rang: r });
// REV536: shakllar (5 tilda) — yoshga qarab hovuz
export const SHAKLLAR = {
  doira: { uz: "doira", ru: "круг", en: "circle", de: "Kreis", es: "círculo" }, kvadrat: { uz: "kvadrat", ru: "квадрат", en: "square", de: "Quadrat", es: "cuadrado" },
  uchburchak: { uz: "uchburchak", ru: "треугольник", en: "triangle", de: "Dreieck", es: "triángulo" }, yulduz: { uz: "yulduz", ru: "звезда", en: "star", de: "Stern", es: "estrella" },
  tortburchak: { uz: "to‘rtburchak", ru: "прямоугольник", en: "rectangle", de: "Rechteck", es: "rectángulo" }, yurak: { uz: "yurak", ru: "сердце", en: "heart", de: "Herz", es: "corazón" },
  oval: { uz: "oval", ru: "овал", en: "oval", de: "Oval", es: "óvalo" }, romb: { uz: "romb", ru: "ромб", en: "diamond", de: "Raute", es: "rombo" },
  beshburchak: { uz: "beshburchak", ru: "пятиугольник", en: "pentagon", de: "Fünfeck", es: "pentágono" }, oltiburchak: { uz: "oltiburchak", ru: "шестиугольник", en: "hexagon", de: "Sechseck", es: "hexágono" },
};
const SHAKL_HOVUZ = { "2-3": ["doira", "kvadrat", "uchburchak", "yulduz", "yurak"], "4-5": ["doira", "kvadrat", "uchburchak", "yulduz", "tortburchak", "yurak", "oval"],
  "6-7": ["doira", "kvadrat", "uchburchak", "yulduz", "tortburchak", "yurak", "oval", "romb", "beshburchak", "oltiburchak"] };
const SHAKL_RANG = ["qizil", "sariq", "kok", "yashil", "toqSariq", "binafsha"];
export const SHAKL_NARSA = [["⚽", "doira"], ["🍊", "doira"], ["🕐", "doira"], ["🍪", "doira"], ["🌕", "doira"], ["🎁", "kvadrat"], ["🧊", "kvadrat"], ["🖼️", "kvadrat"], ["🍕", "uchburchak"], ["⛺", "uchburchak"], ["🔺", "uchburchak"],
  ["📱", "tortburchak"], ["🚪", "tortburchak"], ["📕", "tortburchak"], ["📺", "tortburchak"], ["🥚", "oval"], ["🏉", "oval"], ["🥔", "oval"], ["⭐", "yulduz"], ["🌟", "yulduz"], ["❤️", "yurak"], ["💗", "yurak"], ["🪁", "romb"], ["♦️", "romb"]];
const shaklV = (sh, rang) => ({ k: `${sh}${rang ? `:${rang}` : ""}`, shakl: sh, ...(rang ? { rang } : {}) });
function shaklVariantlar(togri, hovuz, n, rnd, rang) { return aralash([togri, ...tanla(hovuz.filter((x) => x !== togri), n - 1, rnd)], rnd).map((x) => shaklV(x, rang)); }
function naqshRaund(y, n, rnd) {   // AB, AAB, ABB (4-5); + ABC, AABB (6-7) — keyingi element topiladi
  const h = SHAKL_HOVUZ[y].slice(0, 6); const q = tanla(h, 3, rnd), ra = tanla(SHAKL_RANG, 3, rnd); const el = q.map((sh, i) => shaklV(sh, ra[i]));
  const turlar = y === "6-7" ? [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2], [0, 0, 1, 1]] : [[0, 1], [0, 0, 1], [0, 1, 1]];
  const d = bitta(turlar, rnd); const uzun = d.length * 2 + butun(0, d.length - 1, rnd); const qator = Array.from({ length: uzun }, (_, i) => el[d[i % d.length]]);
  const tog = el[d[uzun % d.length]]; const ishtirok = [...new Set(d)].map((i) => el[i]);
  const boshqa = el.filter((x) => !ishtirok.includes(x)).concat(shaklV(bitta(h.filter((x) => !q.includes(x)), rnd), bitta(SHAKL_RANG.filter((c) => !ra.includes(c)), rnd)));
  const variantlar = aralash([...ishtirok, ...boshqa].slice(0, Math.max(2, Math.min(n, 4))).concat([]).filter((x, i, a) => a.findIndex((z) => z.k === x.k) === i), rnd);
  if (!variantlar.some((x) => x.k === tog.k)) variantlar[0] = tog;
  return { tur: "tanlov", savol: { qator }, variantlar, togri: tog.k };
}

function rangVariantlar(togri, hovuz, n, rnd) { return aralash([togri, ...tanla(hovuz.filter((r) => r !== togri), n - 1, rnd)], rnd).map(rangV); }
function rangliNarsa(y, rnd) { const h = RANG_HOVUZ[y]; return bitta(RANGLI_NARSA.filter(([, r]) => h.includes(r)), rnd); }

// REV336: teskari ma'noli juftlar (5 tilda)
export const TESKARI = [
  [{ emoji: "🔥", s: { uz: "issiq", ru: "горячий", en: "hot", de: "heiß", es: "caliente" } }, { emoji: "🧊", s: { uz: "sovuq", ru: "холодный", en: "cold", de: "kalt", es: "frío" } }],
  [{ emoji: "🐘", s: { uz: "katta", ru: "большой", en: "big", de: "groß", es: "grande" } }, { emoji: "🐭", s: { uz: "kichik", ru: "маленький", en: "small", de: "klein", es: "pequeño" } }],
  [{ emoji: "☀️", s: { uz: "kun", ru: "день", en: "day", de: "Tag", es: "día" } }, { emoji: "🌙", s: { uz: "tun", ru: "ночь", en: "night", de: "Nacht", es: "noche" } }],
  [{ emoji: "🐇", s: { uz: "tez", ru: "быстро", en: "fast", de: "schnell", es: "rápido" } }, { emoji: "🐢", s: { uz: "sekin", ru: "медленно", en: "slow", de: "langsam", es: "lento" } }],
  [{ emoji: "😀", s: { uz: "quvnoq", ru: "весёлый", en: "happy", de: "fröhlich", es: "alegre" } }, { emoji: "😢", s: { uz: "xafa", ru: "грустный", en: "sad", de: "traurig", es: "triste" } }],
  [{ emoji: "🔓", s: { uz: "ochiq", ru: "открыто", en: "open", de: "offen", es: "abierto" } }, { emoji: "🔒", s: { uz: "yopiq", ru: "закрыто", en: "closed", de: "zu", es: "cerrado" } }],
];
// REV459: rasmli teskari juftlar — bor juftning o'rniga (rasm bilan), yo'qlari qo'shiladi
for (const [a, b] of TESKARI_QOSH) {
  const el = (w) => ({ emoji: w.e, s: w.s });
  const k = TESKARI.findIndex((p) => p[0].s.uz === a.s.uz || p[1].s.uz === b.s.uz);
  if (k >= 0) TESKARI[k] = [el(a), el(b)]; else TESKARI.push([el(a), el(b)]);
}
// REV336: chalkash yo'llar — chapdagi narsalardan o'ngga chiziqlar; bittasi suyakka (🦴) olib boradi
function yollarRaund(els, n, rnd) {
  const tanlangan = tanla(els, Math.min(n, els.length), rnd);
  const k = tanlangan.length;
  let oxir = aralash([...Array(k).keys()], rnd);
  if (k > 1 && oxir.every((v, i) => v === i)) oxir = [...oxir.slice(1), oxir[0]];   // hech biri to'g'ri ketmasin — chalkash bo'lsin
  const maqsad = Math.floor(rnd() * k);
  const togriIdx = oxir.indexOf(maqsad);
  return { tur: "tanlov", savol: { oxir, maqsad, k }, variantlar: tanlangan.map(elVariant), togri: tanlangan[togriIdx].k };
}

const YASOVCHI = {
  // REV359: sirli quti — har raundda darsning bitta yangi narsasi; hayvon bo'lsa — ovozi ham
  sirliQuti: ({ els, n, rnd, R, izoh }) => navbat(els, Math.min(R, els.length), rnd).map((el) => {
    const o = HAYVON_OVOZ.find((h) => h.w.e === el.emoji);
    return { tur: "tanlov", savol: { el, ovoz: o ? (o.o[izoh] || o.o.uz) : "", tovush: o?.t || "" }, variantlar: elementVariantlar(el, els, n, rnd), togri: el.k };
  }),
  // REV351: eshitish — ovoz aytiladi (izoh tilida), bola egasini topadi
  hayvonOvoz: ({ n, rnd, R, izoh }) => ovozRaund(HAYVON_OVOZ, { n, rnd, R, izoh }),
  transportOvoz: ({ n, rnd, R, izoh }) => ovozRaund(TRANSPORT_OVOZ, { n, rnd, R, izoh }),
  faslOvoz: ({ y, rnd, R, izoh }) => {
    const f = ["bahor", "yoz", "kuz", "qish"]; const nomi = { bahor: ["🌸", "bahor"], yoz: ["☀️", "yoz"], kuz: ["🍂", "kuz"], qish: ["❄️", "qish"] };
    const FN = { bahor: { uz: "bahor", ru: "весна", en: "spring", de: "Frühling", es: "primavera" }, yoz: { uz: "yoz", ru: "лето", en: "summer", de: "Sommer", es: "verano" },
      kuz: { uz: "kuz", ru: "осень", en: "autumn", de: "Herbst", es: "otoño" }, qish: { uz: "qish", ru: "зима", en: "winter", de: "Winter", es: "invierno" } };
    const hovuz = f.flatMap((x) => FASL_OVOZ[x].map((g) => ({ x, g })));
    const variantlar = f.map((x) => ({ k: `f_${x}`, el: { k: `f_${x}`, emoji: nomi[x][0], uz: FN[x][izoh] || FN[x].uz } }));
    return navbat(hovuz, R, rnd).map(({ x, g }) => ({ tur: "tanlov", savol: { tasvir: g[izoh] || g.uz }, variantlar: aralash(variantlar, rnd), togri: `f_${x}` }));
  },
  // REV351: birinchi harf (6–7) — rasmlardan bittasi aytilgan harf bilan boshlanadi
  birinchiHarf: ({ n, rnd, R, izoh }) => {
    const sozlar = SOZ_HOVUZI(izoh).map((e) => ({ ...e, h: birinchiHarf(e.uz, izoh) })).filter((e) => e.h);
    const out = [];
    for (let t = 0; out.length < R && t < R * 10; t += 1) {
      const togri = bitta(sozlar, rnd);
      const boshqa = tanla(sozlar.filter((e) => e.h !== togri.h && e.emoji !== togri.emoji), n - 1, rnd);
      if (boshqa.length < n - 1 || out.some((o) => o.savol.harf === togri.h)) continue;
      out.push({ tur: "tanlov", savol: { harf: togri.h }, variantlar: aralash([togri, ...boshqa].map((e, i) => ({ k: `s${i}_${e.emoji}`, el: e, yashirin: true })), rnd), togri: "" });
      const o = out[out.length - 1]; o.togri = o.variantlar.find((v) => v.el === togri).k;
    }
    return out;
  },
  // REV351: bo'g'in qarsagi (o'zbek va rus tilida unlilar bo'yicha aniq sanaladi; boshqa tillarda o'yin chiqmaydi)
  bogin: ({ n, rnd, R, izoh }) => {
    if (!["uz", "ru"].includes(izoh)) return [];
    const sozlar = SOZ_HOVUZI(izoh).filter((e) => !/\s/.test(e.uz)).map((e) => ({ ...e, b: boginSoni(e.uz, izoh) })).filter((e) => e.b >= 1 && e.b <= 4);
    return navbat(sozlar, R, rnd).map((e) => ({ tur: "tanlov", savol: { el: e }, variantlar: sonVariantlar(e.b, Math.min(n, 4), rnd).filter((v) => v.son <= 5), togri: `n:${e.b}` }));
  },
  // REV349: tartibga qo'yish (2–3 yoshda 3 qadam, bosqichma-bosqich; 6–7 yoshda butun tartib birdan)
  ...Object.fromEntries(Object.keys(TARTIB).map((nom) => [nom, ({ y, rnd, R, izoh }) => {
    const d = TARTIB[nom];
    // REV452: «o'sish» o'yinlarida har raund — boshqa tirik narsa (odam, tovuq, daraxt, olma…); 2–3 yoshda faqat 2–3 qadamlilar
    // REV524: + hayotiy ketma-ketliklar (kunlik yumushlar, fasl ishlari, narsalar qayerdan keladi) — har o'yinda 6–13 xil, 10 raundda takrorsiz
    const TOPLAM0 = { osish: OSISH_TOPLAM, gulOstir: GUL_TOPLAM, ...TARTIB_TOPLAM }[nom];
    // o'yinning o'z asosiy ketma-ketligi (d.q) ham to'plamga kiradi — TOPLAM0 bo'lmagan o'yinlarda yo'qolib qolmasin
    const TOPLAM = (TOPLAM0 || HAYOT_TOPLAM[nom]) ? [...(TOPLAM0 || [{ nom, q: d.q }]), ...(HAYOT_TOPLAM[nom] || [])] : null;
    if (TOPLAM) {
      // 2–3 yoshda 3 qadamgacha: qisqalari bo'lsa o'shalar, bo'lmasa har ketma-ketlikning birinchi 3 qadami (REV459)
      // REV524: 2–3 yoshda ham hamma ketma-ketlik (xilma-xillik uchun) — faqat birinchi 3 qadami
      const mos = y === "2-3" ? TOPLAM.map((t) => (t.q.length <= 3 ? t : { ...t, q: t.q.slice(0, 3) })) : TOPLAM;
      return navbat(mos, R, rnd).map((t, ri) => {
        const qadam = t.q.map((w, i) => sozEl(w, izoh, `q${ri}_${i}`));
        let ar = aralash(qadam, rnd);
        for (let i = 0; i < 8 && ar.every((e, j) => e.k === qadam[j].k); i += 1) ar = aralash(qadam, rnd);
        if (ar.every((e, j) => e.k === qadam[j].k)) ar = [...ar.slice(1), ar[0]];
        return { tur: "tartib", savol: { bosqichma: y !== "6-7", nima: t.nom }, variantlar: ar.map((e) => ({ k: e.k, el: e })), togri: qadam.map((e) => e.k) };
      });
    }
    const qadam = (y === "2-3" ? d.kichik.map((i) => d.q[i]) : d.q).map((w, i) => sozEl(w, izoh, `q${i}`));
    return Array.from({ length: R }, () => {
      let ar = aralash(qadam, rnd);
      for (let i = 0; i < 8 && ar.every((e, j) => e.k === qadam[j].k); i += 1) ar = aralash(qadam, rnd);
      if (ar.every((e, j) => e.k === qadam[j].k)) ar = [...ar.slice(1), ar[0]];
      return { tur: "tartib", savol: { bosqichma: y !== "6-7" }, variantlar: ar.map((e) => ({ k: e.k, el: e })), togri: qadam.map((e) => e.k) };
    });
  }])),
  // REV348: saralash — narsa ko'rsatiladi, bola uning guruhini bosadi (2–3 yoshda 2 guruh)
  ...Object.fromEntries(Object.keys(SARALASH).map((nom) => [nom, ({ y, rnd, R, izoh, els }) => {
    const d = SARALASH[nom]; const gs = y === "2-3" ? d.guruh.slice(0, 2) : d.guruh;
    const guruhlar = gs.map((g, gi) => sozEl(g, izoh, `g${gi}`));
    const hamma = gs.flatMap((_, gi) => (d.narsa[gi] || []).map((w, j) => ({ w, gi, j })));
    const tanlov = new Set((els || []).map((e) => e.sarA).filter(Boolean));   // REV455: bosqich o'z narsalari bilan
    const hovuz = tanlov.size ? (hamma.filter(({ w }) => tanlov.has(w.s.uz)).length >= 2 ? hamma.filter(({ w }) => tanlov.has(w.s.uz)) : hamma) : hamma;
    // REV451: narsa bir nechta guruhga to'g'ri kelsa (w.ham), o'sha boshqa guruhlar shu raundda ko'rsatilmaydi — javob bitta bo'ladi
    return navbat(hovuz, R, rnd).map(({ w, gi, j }) => ({ tur: "tanlov", savol: { el: sozEl(w, izoh, `n${gi}_${j}`) },
      variantlar: guruhlar.filter((_, x) => !(w.ham || []).includes(x)).map((g) => ({ k: g.k, el: g })), togri: `g${gi}` }));
  }])),
  // REV348: fasl mevasi — joriy fasl albatta bor; 4–5 yoshda 3 ta, 6–7 yoshda 4 ta fasl
  faslMeva: ({ y, rnd, R, izoh, fasl }) => {
    const hamma = ["bahor", "yoz", "kuz", "qish"]; const joriy = hamma.includes(fasl) ? fasl : bitta(hamma, rnd);
    const tanlangan = y === "6-7" ? hamma : [joriy, ...tanla(hamma.filter((x) => x !== joriy), 2, rnd)];
    const guruhlar = tanlangan.map((f) => ({ f, el: sozEl(FASL_MEVA.guruh[f], izoh, `f_${f}`) }));
    const hovuz = tanlangan.flatMap((f) => FASL_MEVA.narsa[f].map((w, j) => ({ w, f, j })));
    return navbat(hovuz, R, rnd).map(({ w, f, j }) => ({ tur: "tanlov", savol: { el: sozEl(w, izoh, `m_${f}_${j}`), joriy },
      variantlar: aralash(guruhlar.map((g) => ({ k: g.el.k, el: g.el })), rnd), togri: `f_${f}` }));
  },
  // REV348: ulash — juftining birinchisi ko'rsatiladi, bola ikkinchisini topadi
  // REV450: bosqich o'z juftlarini oladi (els — bosqichdagi «ulashA» so'zlari), takror kam bo'ladi; bir narsaning bir nechta
  // to'g'ri jufti bo'lsa (mushuk — sut, baliq), ulardan hech biri «xato variant» bo'lib chiqmaydi.
  ...Object.fromEntries(Object.keys(ULASH).map((nom) => [nom, ({ n, rnd, R, izoh, els }) => {
    const hamma = ULASH[nom].juft;
    const tanlov = new Set((els || []).map((e) => e.ulashA).filter(Boolean));
    const j0 = tanlov.size ? hamma.filter((p) => tanlov.has(p[0].s.uz)) : hamma;
    const j = j0.length >= 2 ? j0 : hamma;
    const togrilar = (a) => new Set([...hamma.filter((p) => p[0].s.uz === a).map((p) => p[1].s.uz), ...(ULASH[nom].ham?.[a] || [])]);
    return navbat(j.map((p, i) => ({ p, i })), R, rnd).map(({ p, i }) => {
      const mos = togrilar(p[0].s.uz);
      const xatolar = [];
      for (const q of aralash(hamma, rnd)) {
        if (mos.has(q[1].s.uz) || xatolar.some((x) => x[1].s.uz === q[1].s.uz)) continue;
        xatolar.push(q);
        if (xatolar.length >= n - 1) break;
      }
      const boshqa = xatolar.map((q) => sozEl(q[1], izoh, `b${hamma.indexOf(q)}`));
      const togri = sozEl(p[1], izoh, `b${hamma.indexOf(p)}`);
      return { tur: "tanlov", savol: { el: sozEl(p[0], izoh, `a${hamma.indexOf(p)}`) }, variantlar: aralash([togri, ...boshqa].map((e) => ({ k: e.k, el: e })), rnd), togri: togri.k };
    });
  }])),

  // 49 — do'kon: hamyonda N tanga; qaysi narsani sotib olsa bo'ladi (narxi ≤ N, qolganlari qimmat)
  dokon: ({ y, n, rnd, R }) => Array.from({ length: R }, () => {
    const max = y === "6-7" ? 9 : 5; const pul = butun(2, max - 1, rnd);
    const narsalar = tanla(DOKON, n, rnd);
    const variantlar = narsalar.map((e, i) => ({ k: `d${i}`, el: { emoji: e }, narx: i === 0 ? butun(1, pul, rnd) : butun(pul + 1, max + 2, rnd) }));
    return { tur: "tanlov", savol: { pul }, variantlar: aralash(variantlar, rnd), togri: "d0" };
  }),
  // 57 — o'nlik bog'lami (6-7): bog'lamlar va yakka tayoqchalar — nechta?
  onlik: ({ n, rnd, R }) => Array.from({ length: R }, () => {
    // REV535: bog'cha yoshi — faqat 10–20 (avval 39 gacha chiqardi: «23 ni top» — bu yoshda erta)
    const yigirma = rnd() < 0.12; const onlar = yigirma ? 2 : 1, birlar = yigirma ? 0 : butun(0, 9, rnd), jami = onlar * 10 + birlar;
    return { tur: "tanlov", savol: { onlar, birlar }, variantlar: sonVariantlar(jami, n, rnd, [onlar + birlar]), togri: `n:${jami}` };
  }),
  // 43 — tenglashtir: chapda kam, o'ngda ko'p — chapga nechta qo'shsak teng bo'ladi
  tenglash: ({ y, n, rnd, R }) => Array.from({ length: R }, () => {
    const max = y === "6-7" ? 9 : 6; const ong = butun(3, max, rnd); const chap = butun(1, ong - 1, rnd); const farq = ong - chap;
    return { tur: "tanlov", savol: { chap, ong, e: bitta(["🍎", "🍐", "⭐", "🌸", "🍓"], rnd) }, variantlar: sonVariantlar(farq, n, rnd), togri: `n:${farq}` };
  }),
  // 59 — masala ertagi: qisqa hikoya va savol (4-5 — faqat qo'shish, 6-7 — qo'shish va ayirish)
  masala: ({ y, n, rnd, R }) => navbat(MASALA.filter((m) => y === "6-7" || m.amal === "+").map((m) => ({ ...m })), R, rnd).map((m) => {
    const max = y === "6-7" ? 9 : 5;
    const a = m.amal === "+" ? butun(1, max - 1, rnd) : butun(3, max, rnd);
    const b = m.amal === "+" ? butun(1, max - a, rnd) : butun(1, a - 1, rnd);
    const javob = m.amal === "+" ? a + b : a - b;
    return { tur: "tanlov", savol: { ...m, a, b }, variantlar: sonVariantlar(javob, n, rnd), togri: `n:${javob}` };
  }),
  // 61 — rangni top: rang nomi aytiladi, bola shu rangni bosadi
  rangTop: ({ y, n, rnd, R }) => navbat(RANG_HOVUZ[y].map((r) => ({ r })), R, rnd).map(({ r }) => ({ tur: "tanlov", savol: { rang: r }, variantlar: rangVariantlar(r, RANG_HOVUZ[y], n, rnd), togri: r })),
  // 62 — rang uyi: narsa qaysi rang uyida yashaydi
  rangUyi: ({ y, n, rnd, R }) => Array.from({ length: R }, () => { const [e, r] = rangliNarsa(y, rnd);
    return { tur: "tanlov", savol: { el: { emoji: e }, rang: r }, variantlar: rangVariantlar(r, RANG_HOVUZ[y], n, rnd), togri: r }; }),
  // 63 — bo'yab chiq: rangsiz rasm, bola to'g'ri bo'yoqni tanlaydi — rasm bo'yaladi
  boya: ({ y, n, rnd, R }) => Array.from({ length: R }, () => { const [e, r] = rangliNarsa(y, rnd);
    return { tur: "tanlov", savol: { el: { emoji: e }, rang: r }, variantlar: rangVariantlar(r, RANG_HOVUZ[y], n, rnd), togri: r }; }),
  // 64 — rang aralashtir (6-7): ikki bo'yoq qo'shilsa qanday rang chiqadi
  aralash: ({ n, rnd, R }) => navbat(ARALASH.map((a) => ({ a })), R, rnd).map(({ a }) => ({ tur: "tanlov", savol: { a: a[0], b: a[1], rang: a[2] },
    variantlar: rangVariantlar(a[2], ["yashil", "toqSariq", "binafsha", "pushti", "kulrang", "jigarrang"], n, rnd), togri: a[2] })),
  // REV537 — 206 bo'sh katak: 2×2 jadval (qator — shakl, ustun — rang), to'rtinchi katak topiladi
  matritsa: ({ y, n, rnd, R }) => Array.from({ length: R }, () => { const [a, b, c] = tanla(SHAKL_HOVUZ[y].slice(0, 6), 3, rnd), [r1, r2, r3] = tanla(SHAKL_RANG, 3, rnd);
    const tog = shaklV(b, r2); const boshqa = [shaklV(b, r1), shaklV(a, r2), shaklV(c, r2), shaklV(b, r3)];
    return { tur: "tanlov", savol: { katak: [shaklV(a, r1), shaklV(a, r2), shaklV(b, r1), null] }, variantlar: aralash([tog, ...tanla(boshqa, Math.max(1, Math.min(n, 4) - 1), rnd)], rnd), togri: tog.k }; }),
  // 207 yarmini top: shaklning chap yarmi ko'rsatiladi — o'ng yarmini tanlash
  yarmi: ({ y, n, rnd, R }) => navbat(SHAKL_HOVUZ[y].filter((x) => x !== "tortburchak").map((sh) => ({ sh })), R, rnd).map(({ sh }) => { const rang = bitta(SHAKL_RANG, rnd);
    return { tur: "tanlov", savol: { shakl: sh, rang }, variantlar: shaklVariantlar(sh, SHAKL_HOVUZ[y].filter((x) => x !== "tortburchak"), n, rnd, rang).map((v) => ({ ...v, yarim: "ong" })), togri: `${sh}:${rang}` }; }),
  // 208 shakllarni sana: aralash shakllar ichidan aytilganini sanash
  sanaShakl: ({ y, n, rnd, R }) => Array.from({ length: R }, () => { const max = y === "6-7" ? 7 : 4; const [t, a, b] = tanla(["doira", "kvadrat", "uchburchak", "yulduz", "yurak"], 3, rnd); const c = butun(1, max, rnd);   // to'rtburchak yo'q: kvadrat ham to'rtburchak — sanoq noaniq bo'lardi
    const narsalar = aralash([...Array.from({ length: c }, () => shaklV(t, bitta(SHAKL_RANG, rnd))), ...Array.from({ length: butun(1, 3, rnd) }, () => shaklV(a, bitta(SHAKL_RANG, rnd))), ...Array.from({ length: butun(0, 2, rnd) }, () => shaklV(b, bitta(SHAKL_RANG, rnd)))], rnd);
    return { tur: "tanlov", savol: { narsalar, shakl: t }, variantlar: sonVariantlar(c, Math.min(n, 4), rnd).filter((v) => v.son >= 1 && v.son <= max + 2), togri: `n:${c}` }; }),
  // 209 sonlar qatori: 1, 2, 3, ? — keyingi son (4-5: +1 va −1, 10 gacha; 6-7: +1, +2, −1, 20 gacha)
  ketmaSon: ({ y, n, rnd, R }) => Array.from({ length: R }, () => { const katta = y === "6-7"; const d = bitta(katta ? [1, 1, 2, -1, 2] : [1, 1, -1], rnd); const uzun = 3; const max = katta ? 20 : 10;
    const bosh = d > 0 ? butun(1, max - d * uzun, rnd) : butun(uzun + 1, max, rnd); const qator = Array.from({ length: uzun }, (_, i) => bosh + i * d); const tog = bosh + uzun * d;
    return { tur: "tanlov", savol: { qator }, variantlar: sonVariantlar(tog, Math.min(n, 4), rnd, [tog - d * 2]).filter((v) => v.son >= 0 && v.son <= max + 2), togri: `n:${tog}` }; }),
  // REV536 — 201 shaklni top: aytilgan shaklni bosish
  shaklTop: ({ y, n, rnd, R }) => navbat(SHAKL_HOVUZ[y].map((sh) => ({ sh })), R, rnd).map(({ sh }) => { const rang = bitta(SHAKL_RANG, rnd);
    return { tur: "tanlov", savol: { shakl: sh }, variantlar: shaklVariantlar(sh, SHAKL_HOVUZ[y], n, rnd, rang), togri: `${sh}:${rang}` }; }),
  // 202 shakl uyasi: rangli shakl qaysi teshikka (kontur) tushadi
  shaklJoy: ({ y, n, rnd, R }) => navbat(SHAKL_HOVUZ[y].map((sh) => ({ sh })), R, rnd).map(({ sh }) => ({ tur: "tanlov", savol: { shakl: sh, rang: bitta(SHAKL_RANG, rnd) },
    variantlar: shaklVariantlar(sh, SHAKL_HOVUZ[y], n, rnd), togri: sh })),
  // 203 nimaga o'xshaydi: narsa (to'p, pitsa, eshik) qaysi shaklda
  shaklNarsa: ({ y, n, rnd, R }) => navbat(SHAKL_NARSA.filter(([, sh]) => SHAKL_HOVUZ[y].includes(sh)).map((x) => ({ x })), R, rnd).map(({ x }) => ({ tur: "tanlov", savol: { el: { emoji: x[0], faqatEmoji: true }, shakl: x[1] },
    variantlar: shaklVariantlar(x[1], SHAKL_HOVUZ[y], n, rnd), togri: x[1] })),
  // 204 naqsh: ketma-ketlikni davom ettirish
  naqsh: ({ y, n, rnd, R }) => Array.from({ length: R }, () => naqshRaund(y, n, rnd)),
  // 205 katta-kichik: eng kattasini / eng kichigini topish
  kattaKichik: ({ y, n, rnd, R }) => Array.from({ length: R }, (_, i) => { const sh = bitta(SHAKL_HOVUZ[y], rnd), rang = bitta(SHAKL_RANG, rnd); const soni = Math.max(2, Math.min(n, y === "2-3" ? 2 : 4));
    const olcham = aralash([34, 48, 62, 78].slice(0, soni).length === soni ? tanla([34, 48, 62, 78], soni, rnd) : [34, 78], rnd); const katta = y === "2-3" ? true : i % 2 === 0;
    const variantlar = olcham.map((o, j) => ({ k: `o${j}`, shakl: sh, rang, olcham: o })); const tog = variantlar.reduce((a, b) => ((katta ? b.olcham > a.olcham : b.olcham < a.olcham) ? b : a));
    return { tur: "tanlov", savol: { shakl: sh, soralgan: katta ? "katta" : "kichik" }, variantlar, togri: tog.k }; }),
  yollar: ({ els, n, rnd, R }) => Array.from({ length: R }, () => yollarRaund(els, n, rnd)),
  // 106 — tarozi: REV347 — haqiqiy og'irligi aniq juftlar (fil > sichqon…), og'iri pastga tushadi; 6-7 yoshda «yengilini top» ham
  tarozi: ({ y, rnd, R }) => navbat(TAROZI_JUFT.map((p) => ({ p })), R, rnd).map(({ p }, i) => {
    const ogirEl = { k: `o${i}`, emoji: p[0] }, yengilEl = { k: `y${i}`, emoji: p[1] };
    const chapOgir = rnd() < 0.5;
    const [a, b] = chapOgir ? [ogirEl, yengilEl] : [yengilEl, ogirEl]; const ogir = chapOgir ? "chap" : "ong";
    const yengil = y === "6-7" && i % 2 === 1;
    const togri = (ogir === "chap") !== yengil ? a.k : b.k;
    return { tur: "tanlov", savol: { chap: a, ong: b, ogir, yengil }, variantlar: [elVariant(a), elVariant(b)], togri };
  }),
  // 114 — teskarisini top: bitta so'z ko'rsatiladi, uning teskarisi topiladi
  teskari: ({ n, rnd, R }) => navbat(TESKARI.flatMap((p, pi) => [[p[0], p[1], pi], [p[1], p[0], pi]]), R, rnd).map(([w0, t0, pi]) => {
    const w = { ...w0, ...(w0.s?.r ? { rasmId: w0.s.r } : {}) }, t = { ...t0, ...(t0.s?.r ? { rasmId: t0.s.r } : {}) };   // REV459
    const togri = { k: `t${pi}`, el: { emoji: t.emoji, soz: t.s } };
    const boshqa = tanla(TESKARI.filter((_, j) => j !== pi).map((p, j) => p[(j + pi) % 2]), n - 1, rnd).map((x, j) => ({ k: `b${j}`, el: { emoji: x.emoji, soz: x.s } }));
    return { tur: "tanlov", savol: { el: { emoji: w.emoji, soz: w.s } }, variantlar: aralash([togri, ...boshqa], rnd), togri: togri.k };
  }),
  // 68 — soyasini top: rangli narsa tepada, pastda — soyalar
  soya: ({ els, n, rnd, R }) => navbat(els, R, rnd).map((el) => ({ tur: "tanlov", savol: { el }, variantlar: elementVariantlar(el, els, n, rnd), togri: el.k })),
  // 76 — qayerda: quti va narsa; bola joylashuvni tanlaydi
  joylashuv: ({ els, y, rnd, R }) => Array.from({ length: R }, (_, i) => {
    const yon = YONALISH[y]; const joy = yon[(i + Math.floor(rnd() * yon.length)) % yon.length];
    return { tur: "tanlov", savol: { el: bitta(els, rnd), joy }, variantlar: aralash(yon.map((k) => ({ k })), rnd), togri: joy };
  }),
  // 103 — kubiklar minorasi: namunadagidek minorani top
  minora: ({ y, n, rnd, R }) => Array.from({ length: R }, () => {
    const namuna = Array.from({ length: minoraBalandlik[y] }, () => bitta(KUBIK_RANG, rnd));
    return { tur: "tanlov", savol: { minora: namuna }, variantlar: minoraVariantlar(namuna, n, rnd), togri: "t0" };
  }),
  // 116 — so'z aytiladi, bola rasmini bosadi
  eshitBos: ({ els: els0, n, rnd, R }) => { const els = aniqNarsalar(els0); return navbat(els, R, rnd).map((el) => ({
    tur: "tanlov", savol: { el }, variantlar: elementVariantlar(el, els, n, rnd), togri: el.k,
  })); },
  // 117 — bola so'zni aytadi (mikrofon); mikrofon yo'q bo'lsa — variantlardan bosadi
  // REV418: nomi yo'q narsa (faqat emoji) aytishga berilmaydi — bola nima deyishni bilmay qoladi
  aytOch: ({ els, n, rnd, R }) => navbat(aniqNarsalar(els), R, rnd).map((el) => ({
    tur: "aytish", savol: { el }, variantlar: elementVariantlar(el, els, n, rnd), togri: el.k,
  })),
  // 83 — namunaning xuddi o'zini topish (6-7 yoshda: namuna emoji, variantlar — rasm)
  oxshash: ({ els, n, rnd, R, y }) => navbat(els, R, rnd).map((el) => {
    const variantlar = elementVariantlar(el, els, n, rnd);
    const almash = y === "6-7" && variantlar.every((v) => v.el.emoji && v.el.image);
    return { tur: "tanlov", savol: { el, korinish: almash ? "emoji" : null }, variantKorinish: almash ? "rasm" : null, variantlar, togri: el.k };
  }),
  // 89 — juft kartalar: n juft (2-3: 2, 4-5: 3, 6-7: 4)
  juft: ({ els, n, rnd, R }) => {
    const p = Math.min(n, els.length);
    const navb = navbat(els, p * R, rnd);
    return Array.from({ length: R }, (_, r) => {
      const tanlangan = [];
      for (const e of [...navb.slice(r * p), ...aralash(els, rnd)]) { if (!tanlangan.some((x) => x.k === e.k)) tanlangan.push(e); if (tanlangan.length === p) break; }
      const kartalar = aralash([...tanlangan, ...tanlangan], rnd).map((el, i) => ({ k: `c${i}`, el, juft: el.k }));
      return { tur: "juft", savol: {}, variantlar: kartalar, togri: tanlangan.map((e) => e.k) };
    });
  },
  // 88 — sahnada n+1 ta narsa, bittasi yashirinadi; variantlar: yashiringan + sahnada bo'lmaganlar
  yashirin: ({ els, n, rnd, R }) => {
    const m = Math.min(n + 1, els.length);
    let oldingi = null;
    return Array.from({ length: R }, () => {
      const sahna = tanla(els, m, rnd);
      let yi = Math.floor(rnd() * m);
      if (oldingi && sahna[yi].k === oldingi && m > 1) yi = (yi + 1) % m;
      const yashirin = sahna[yi];
      oldingi = yashirin.k;
      const tashqi = els.filter((e) => !sahna.some((s) => s.k === e.k));
      const chalgit = [...tanla(tashqi, n - 1, rnd), ...tanla(sahna.filter((s) => s.k !== yashirin.k), n - 1, rnd)].slice(0, n - 1);
      return { tur: "tanlov", savol: { sahna, yashirin: yashirin.k }, variantlar: aralash([yashirin, ...chalgit], rnd).map(elVariant), togri: yashirin.k };
    });
  },
  // 86 — n+1 karta: hammasi bir xil, bittasi boshqacha
  ortiqcha: ({ els, n, rnd, R, y }) => navbat(els, R, rnd).map((a) => {
    const b = bitta(els.filter((e) => e.k !== a.k), rnd);
    const m = n + 1;
    const kartalar = aralash([...Array(m - 1).fill(a), b], rnd).map((el, i) => ({
      k: `c${i}`, el,
      bezak: y === "6-7" ? { aylan: butun(-18, 18, rnd), kattalik: 0.85 + Math.round(rnd() * 30) / 100 } : null,
    }));
    return { tur: "tanlov", savol: { kopi: a.k }, variantlar: kartalar, togri: kartalar.find((c) => c.el.k === b.k).k, minVariant: 3 };
  }),
  // 90 — naqsh (AB, AAB, ABC…): qatordan keyin qaysi rasm keladi
  ketmaKet: ({ els, n, rnd, R, y, q }) => {
    const toplam = NAQSHLAR[q < 0 ? PASTROQ[y] : y];
    let naqshlar = toplam.filter((p) => new Set(p).size <= els.length);
    if (!naqshlar.length) naqshlar = ["AB"];
    let oldingi = null;
    return Array.from({ length: R }, () => {
      let naqsh = bitta(naqshlar, rnd);
      if (naqsh === oldingi && naqshlar.length > 1) naqsh = naqshlar[(naqshlar.indexOf(naqsh) + 1) % naqshlar.length];
      oldingi = naqsh;
      const harflar = [...new Set(naqsh)];
      const tanlangan = tanla(els, harflar.length, rnd);
      const xarita = Object.fromEntries(harflar.map((h, i) => [h, tanlangan[i]]));
      const birlik = [...naqsh].map((h) => xarita[h]);
      const L = birlik.length;
      const korsat = 2 * L + butun(0, Math.min(L - 1, 1), rnd);
      const qator = Array.from({ length: korsat }, (_, i) => birlik[i % L]);
      const javob = birlik[korsat % L];
      return { tur: "tanlov", savol: { qator, naqsh }, variantlar: elementVariantlar(javob, els, n, rnd, tanlangan), togri: javob.k };
    });
  },
  // 91 — darsdagi tartibda ketma-ket n ta rasm; bola aytilgan tartibda joyiga suradi
  tartib: ({ els, n, rnd, R, y, q }) => {
    const m = Math.max(2, Math.min(n, els.length));
    const boshlar = aralash(Array.from({ length: els.length - m + 1 }, (_, i) => i), rnd);
    return Array.from({ length: R }, (_, r) => {
      const bosh = boshlar[r % boshlar.length];
      const tartib = els.slice(bosh, bosh + m);
      let ar = aralash(tartib, rnd);
      for (let i = 0; i < 8 && ar.every((e, j) => e.k === tartib[j].k); i += 1) ar = aralash(tartib, rnd);
      if (ar.every((e, j) => e.k === tartib[j].k)) ar = [...ar.slice(1), ar[0]];
      return { tur: "tartib", savol: { bosqichma: y === "4-5" || q < 0 }, variantlar: ar.map(elVariant), togri: tartib.map((e) => e.k) };
    });
  },
  // 32 — savatga aytilgan narsadan aytilgan sonicha solish (2-3 yoshda soni yetganda o'zi tugaydi)
  savat: ({ els, rnd, R, y, son, q }) => {
    const c = SAVAT[y];
    const [lo, hi] = oraliqKesish(c.soni, son);
    let oldingiSon = null;
    return navbat(els, R, rnd).map((el) => {
      const soni = boshqaSon(lo, hi, oldingiSon, rnd);
      oldingiSon = soni;
      const chalgitSoni = Math.max(y === "2-3" ? 1 : 0, c.chalgit + q);
      const chalgit = tanla(els.filter((e) => e.k !== el.k), chalgitSoni, rnd);
      const narsalar = aralash([...Array(soni + c.ortiq).fill(el), ...chalgit], rnd).map((e, i) => ({ k: `i${i}`, el: e }));
      return { tur: "savat", savol: { el, soni, avto: y === "2-3" }, variantlar: narsalar, togri: soni };
    });
  },
  // 31 — har birini bosib sanash, keyin «Nechta?»
  sana: ({ els, n, rnd, R, y, son }) => {
    const [lo, hi] = oraliqKesish(SANA[y], son);
    let oldingi = null;
    return navbat(els, R, rnd).map((el) => {
      const soni = boshqaSon(lo, hi, oldingi, rnd);
      oldingi = soni;
      return {
        tur: "sanash", savol: { el, soni, narsalar: Array.from({ length: soni }, (_, i) => `i${i}`) },
        variantlar: sonVariantlar(soni, n, rnd), togri: `n:${soni}`,
      };
    });
  },
  // 35 — n ta guruh, sonlari har xil; eng ko'p guruhni bosish
  qaysiKop: ({ els, n, rnd, R, y, son }) => {
    const qadam = y === "2-3" ? 2 : 1;
    const lo = Math.max(1, son.min);
    const hi = Math.min(10, Math.max(son.max + (y === "2-3" ? 1 : 0), lo + (n - 1) * qadam));   // 2-3: 1–4 (farq kamida 2)
    const navb = navbat(els, R, rnd);
    return navb.map((el) => {
      let sonlar = null;
      for (let i = 0; i < 60 && !sonlar; i += 1) {
        const s = tanla(Array.from({ length: hi - lo + 1 }, (_, j) => lo + j), n, rnd).sort((a, b) => a - b);
        if (s.length === n && s.every((x, j) => j === 0 || x - s[j - 1] >= qadam)) sonlar = s;
      }
      if (!sonlar) sonlar = Array.from({ length: n }, (_, j) => lo + j * qadam);
      const turli = y !== "2-3" && els.length >= n;
      const guruhEl = turli ? [el, ...tanla(els.filter((e) => e.k !== el.k), n - 1, rnd)] : Array(n).fill(el);
      const aralashSon = aralash(sonlar, rnd);
      const guruhlar = aralashSon.map((s, i) => ({ k: `g${i}`, el: guruhEl[i], son: s }));
      const max = Math.max(...sonlar);
      return { tur: "tanlov", savol: { el }, variantlar: guruhlar, togri: guruhlar.find((g) => g.son === max).k };
    });
  },
  // 38 — sonlar qatori, bittasi yo'q
  yoqolganSon: ({ els, n, rnd, R, y, son, q }) => {
    const L = Math.max(3, (y === "4-5" ? 4 : 5) + Math.min(0, q));
    const lo = Math.max(1, son.min);
    const hi = Math.max(son.max, lo + L - 1);
    const bezak = els.length ? navbat(els, R, rnd) : [];
    let oldingi = null;
    return Array.from({ length: R }, (_, r) => {
      let start = butun(lo, hi - L + 1, rnd);
      if (start === oldingi && hi - L + 1 > lo) start = start === lo ? start + 1 : start - 1;
      oldingi = start;
      const qator = Array.from({ length: L }, (_, i) => start + i);
      const idx = y === "4-5" ? butun(1, L - 1, rnd) : butun(0, L - 1, rnd);
      const javob = qator[idx];
      return {
        tur: "tanlov", savol: { qator: qator.map((x, i) => (i === idx ? null : x)), yoq: idx, el: bezak[r] || null },
        variantlar: sonVariantlar(javob, n, rnd, qator), togri: `n:${javob}`,
      };
    });
  },
  // 55 — Kabu juftlarni qo'ydi, bittasi xato (rasm↔rasm, 6-7 da rasm↔so'z, sonlarda raqam↔nuqtalar)
  kabuXato: ({ els, n, rnd, R, y, son, sonBor: darsdaSon }) => {
    const p = Math.max(2, Math.min(n, els.length));
    const sonBor = darsdaSon && son.max >= 3;
    const navb = navbat(els, p * R, rnd);
    return Array.from({ length: R }, (_, r) => {
      const rejim = sonBor && r % 2 === 1 ? "son" : y === "6-7" ? "soz" : "rasm";
      let juftlar;
      if (rejim === "son") {
        const hi = Math.min(10, Math.max(son.max, p + 1));
        const sonlar = tanla(Array.from({ length: hi }, (_, j) => j + 1), p, rnd);
        juftlar = sonlar.map((s) => ({ chap: { son: s, korinish: "raqam" }, ong: { son: s, korinish: "nuqta" } }));
        const w = Math.floor(rnd() * p);
        const s = sonlar[w];
        juftlar[w] = { ...juftlar[w], ong: { son: s < hi ? s + 1 : s - 1, korinish: "nuqta" } };
        return xatoJuftRaund(juftlar, w, rejim, rnd);
      }
      const tanlangan = [];
      for (const e of [...navb.slice(r * p), ...aralash(els, rnd)]) { if (!tanlangan.some((x) => x.k === e.k)) tanlangan.push(e); if (tanlangan.length === p) break; }
      const sozRejim = rejim === "soz" && tanlangan.every((e) => e.say) && els.filter((e) => e.say).length >= 2;
      const kor = (e, tomon) => (sozRejim
        ? (tomon === "chap" ? { el: e, korinish: "rasm" } : { el: e, korinish: "soz" })
        : e.emoji && e.image ? { el: e, korinish: tomon === "chap" ? "emoji" : "rasm" } : { el: e, korinish: null });
      juftlar = tanlangan.map((e) => ({ chap: kor(e, "chap"), ong: kor(e, "ong") }));
      const w = Math.floor(rnd() * p);
      const notogri = bitta(els.filter((e) => e.k !== tanlangan[w].k && (!sozRejim || e.say)), rnd);
      juftlar[w] = { ...juftlar[w], ong: kor(notogri, "ong") };
      return xatoJuftRaund(juftlar, w, sozRejim ? "soz" : "rasm", rnd);
    });
  },
  // 97 — rasm + aytilgan so'z: to'g'rimi? (ha / yo'q — doim 2 ta, joyi o'zgarmaydi: yashil chapda, qizil o'ngda)
  haYoq: ({ els, rnd, R }) => {
    const javoblar = aralash(Array.from({ length: R }, (_, i) => i % 2 === 0), rnd);
    return navbat(els, R, rnd).map((el, i) => {
      const ha = javoblar[i];
      const aytilgan = ha ? el : bitta(els.filter((e) => e.k !== el.k), rnd);
      return { tur: "tanlov", savol: { el, aytilgan }, variantlar: [{ k: "ha" }, { k: "yoq" }], togri: ha ? "ha" : "yoq", xatodaOtadi: true };
    });
  },
  // 33 — sehrli quti: 2-3 — nechta tushdi; 4-5 — qo'shish (≤5); 6-7 — qo'shish va ayirish (≤10)
  sehrliQuti: ({ els, n, rnd, R, y, son, q }) => {
    const hi = Math.max(2, Math.min(y === "2-3" ? 3 : y === "4-5" ? 5 : 10, son.max));
    let oldingi = null;
    return navbat(els, R, rnd).map((el, r) => {
      let rejim = y === "2-3" || q <= -2 ? "tushdi" : y === "6-7" && r % 2 === 1 && hi >= 3 ? "ayir" : "qosh";
      if (rejim === "qosh" && hi < 2) rejim = "tushdi";
      let a; let b = 0; let javob;
      if (rejim === "tushdi") { a = boshqaSon(1, Math.min(3, hi), oldingi, rnd); javob = a; }
      else if (rejim === "qosh") { javob = boshqaSon(2, hi, oldingi, rnd); a = butun(1, javob - 1, rnd); b = javob - a; }
      else { a = butun(3, hi, rnd); b = butun(1, a - 1, rnd); javob = a - b; }
      oldingi = javob;
      return { tur: "tanlov", savol: { el, rejim, a, b }, variantlar: sonVariantlar(javob, n, rnd), togri: `n:${javob}` };
    });
  },
};

function xatoJuftRaund(juftlar, w, rejim, rnd) {
  const tartib = aralash(juftlar.map((j, i) => ({ ...j, xato: i === w })), rnd);
  const variantlar = tartib.map((j, i) => ({ k: `p${i}`, chap: j.chap, ong: j.ong }));
  return { tur: "tanlov", savol: { rejim }, variantlar, togri: variantlar[tartib.findIndex((j) => j.xato)].k };
}

/** Raund boshidagi bo'sh holat (joriy raund ichidagi qadamlar). */
export function joriyBosh(r) {
  return {
    xato: 0, olingan: [], urinish: 0,
    ochilgan: [], korilgan: [],                                        // juft kartalar
    joylar: r?.tur === "tartib" ? Array(r.variantlar.length).fill(null) : [], // hikoya tartibi
    ichida: [],                                                         // savat
    sanalgan: [], sanaldi: false,                                       // bosib sana
  };
}

/**
 * O'yin holatini yasaydi. Qaytaradi: { id, kalit, yosh, qiyinlik, variantSoni, raundlar: [{ tur, savol, variantlar,
 * togri }], raund, xatolar, togriSoni, tugadi, joriy } yoki null (o'yin topilmadi / yoshga mos emas / elementlar kam).
 * urug' — takrorlanadigan tasodif uchun (sinovlarda). mik — mikrofon bormi (117 «Ayt va och» uchun).
 */
export function oyinYasa(id, { elementlar, yosh, sonlar, qiyinlik = 0, urug, til = "en", mik = true, mavzu = "", tanish = false, izoh = "uz", fasl = "", kirishDaraja = "", raundSoni = 0, variantSoniMajbur = 0 } = {}) {
  const o = oyinOl(id);
  if (!o) return null;
  const y = yoshNorm(yosh);
  if (!oyinMosmi(o, { elementlar, yosh: y, sonlar })) return null;
  const q = qiyinlikNorm(qiyinlik);
  const els = elementlarTayyor(elementlar);
  const rnd = tasodif(urug);
  const n = variantSoniMajbur ? Math.max(2, Math.min(4, variantSoniMajbur)) : variantSoni(y, q);   // REV371: o'yinlar xonasi bosqichi
  const darsSonlari = sonOraligi(y, sonlar, q);   // sonlar = [] — darsda son yo'q
  const son = darsSonlari || sonOraligi(y, undefined, q);
  const raundlar = YASOVCHI[o.kalit]({ els, y, n, rnd, son, sonBor: Boolean(darsSonlari), R: raundSoni || o.raund[y], q, izoh: ["uz", "ru", "en", "de", "es"].includes(izoh) ? izoh : "uz", fasl });
  if (!raundlar.length) return null;
  return {
    id: o.id, kalit: o.kalit, nom: o.nom, harakat: o.harakat, yosh: y, til: str(til) || "en", qiyinlik: q, variantSoni: n,
    mik: Boolean(mik), raundlar, raund: 0, xatolar: 0, togriSoni: 0, tugadi: false, joriy: joriyBosh(raundlar[0]),
    soniya: taxminiySoniya(o, y),
    // REV347: gaplar takrorlanmasin — o'yin ichidagi gaplar shu son bo'yicha har xil tanlanadi; mavzu nomi va «bu o'yin darsda bo'lgan»
    xil: Math.floor(rnd() * 997), mavzu: str(mavzu).slice(0, 60), tanish: Boolean(tanish),
    // REV360: «korsat» — Kabu 1-raundni o'zi o'ynab ko'rsatadi; «eslat» — qisqa qoida; «yoq» — tushuntirishsiz
    kirishDaraja: kirishDaraja || (tanish ? "eslat" : "korsat"),
  };
}

/* ───────────────────────── tekshirish ───────────────────────── */

const ARTIKL = /^(the|a|an|der|die|das|ein|eine|le|la|les|un|une|el|los|las|una|il|lo|gli)\s+/i;
/** Bola aytgani to'g'rimi (yumshoq): 2-3 yoshda va 2-urinishda «yaqin» ham qabul. Artiklsiz shakl ham to'g'ri. */
export function aytishBaho(alts, el, til, urinish = 0, yosh = "4-5") {
  // REV370: tillar darsi bo'lmasa (say yo'q) — bola nomni izoh tilida aytadi (el.uz); avval maqsad bo'sh qolib, eshik ochilmas edi
  const maqsad = [el?.say, el?.say && String(el.say).replace(ARTIKL, ""), el?.rom, !el?.say && el?.uz, !el?.say && el?.soz?.uz].map(str).filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i);
  let best = { score: 0, stars: 0 };
  for (const m of maqsad) { const g = gradeSpeech(alts || [], m, til); if (g.score > best.score) best = g; }
  const kerak = yoshNorm(yosh) === "2-3" || urinish > 0 ? 1 : 2;
  return { ...best, ok: best.stars >= kerak };
}

/** Keyingi raundlarni osonlashtiradi: bitta noto'g'ri variant (juft, tartib bo'lagi, chalg'ituvchi narsa) olib tashlanadi. */
export function osonlashtir(r) {
  if (!r) return r;
  if (r.tur === "tanlov" || r.tur === "aytish" || r.tur === "sanash") {
    if (r.xatodaOtadi || r.variantlar.length <= (r.minVariant || 2)) return r;
    let i = r.variantlar.length - 1;
    while (i >= 0 && r.variantlar[i].k === r.togri) i -= 1;
    return { ...r, variantlar: r.variantlar.filter((_, j) => j !== i) };
  }
  if (r.tur === "juft") {
    if (r.togri.length <= 2) return r;
    const ol = r.togri[r.togri.length - 1];
    return { ...r, togri: r.togri.slice(0, -1), variantlar: r.variantlar.filter((c) => c.juft !== ol) };
  }
  if (r.tur === "tartib") {
    if (r.togri.length <= 2) return r;
    const ol = r.togri[r.togri.length - 1];
    return { ...r, togri: r.togri.slice(0, -1), variantlar: r.variantlar.filter((v) => v.k !== ol) };
  }
  if (r.tur === "savat") {
    const i = r.variantlar.map((v) => v.el.k !== r.savol.el.k).lastIndexOf(true);
    if (i >= 0) return { ...r, variantlar: r.variantlar.filter((_, j) => j !== i) };
    const ortiq = r.variantlar.length - r.savol.soni;
    return ortiq > 0 ? { ...r, variantlar: r.variantlar.slice(0, -1) } : r;
  }
  return r;
}

const kalitOl = (j) => (j && typeof j === "object" && !Array.isArray(j) ? j.k : j);

/**
 * Javobni tekshiradi (holat o'zgarmaydi — yangisi qaytadi). javob shakllari:
 *  tanlov / aytish(bosib) — variant k si;   aytish — { alts: [...], til? } yoki { mikYoq: true };
 *  sanash — { sana: narsaK } (avval hammasi sanaladi), keyin son varianti k si;   juft — [kartaK1, kartaK2];
 *  tartib — { joy, k } yoki to'liq tartib [k...];   savat — { qoy: narsaK } | { ol: narsaK } | { tayyor: true }.
 * Qaytaradi: { togri (true/false/null — befarq qadam), xato (xato hisoblandimi), voqea, raundTugadi, tugadi,
 *   osonlashdi, yakunJoriy (tugagan raundning oxirgi holati), holat }.
 * 2 xatoda (2, 4, 6…) keyingi raundlar osonlashadi va holat.qiyinlik pasayadi.
 */
export function tekshir(holat, javob) {
  const befarq = { togri: null, xato: false, voqea: null, raundTugadi: false, tugadi: Boolean(holat?.tugadi), osonlashdi: false, holat };
  if (!holat || holat.tugadi || !holat.raundlar?.[holat.raund]) return befarq;
  const r = holat.raundlar[holat.raund];
  const j = { ...holat.joriy };
  let togri = null;
  let xatoHisob = true;
  let raundTugadi = false;
  let voqea = null;

  const tanlov = (k) => {
    if (!r.variantlar.some((v) => v.k === k) || j.olingan.includes(k)) return false;
    togri = k === r.togri;
    if (!togri) j.olingan = [...j.olingan, k];
    raundTugadi = togri || Boolean(r.xatodaOtadi);
    if (!togri && r.xatodaOtadi) voqea = { tur: "otdi" };
    return true;
  };

  switch (r.tur) {
    case "tanlov":
      if (!tanlov(kalitOl(javob))) return befarq;
      break;
    case "aytish":
      if (javob && typeof javob === "object" && javob.mikYoq) {
        return { ...befarq, voqea: { tur: "mikYoq" }, holat: { ...holat, mik: false } };
      }
      if (javob && typeof javob === "object" && Array.isArray(javob.alts)) {
        const b = aytishBaho(javob.alts, r.savol.el, javob.til || holat.til, j.urinish, holat.yosh);
        if (b.ok) { togri = true; raundTugadi = true; voqea = { tur: "aytdi", baho: b }; }
        else if (j.urinish < 1) { j.urinish += 1; togri = false; xatoHisob = false; voqea = { tur: "yana", baho: b }; }
        else { j.bosib = true; togri = false; xatoHisob = false; voqea = { tur: "bosib", baho: b }; }   // REV359: 2 marta ayta olmasa — 2 ta rasmdan bosib ochadi (uyalmasin)
        break;
      }
      if (!tanlov(kalitOl(javob))) return befarq;
      break;
    case "sanash":
      if (javob && typeof javob === "object" && javob.sana !== undefined) {
        const k = String(javob.sana);
        if (j.sanaldi || !r.savol.narsalar.includes(k) || j.sanalgan.includes(k)) return befarq;
        j.sanalgan = [...j.sanalgan, k];
        j.sanaldi = j.sanalgan.length >= r.savol.soni;
        voqea = { tur: "sanoq", son: j.sanalgan.length, oxirgi: j.sanaldi };
        return { ...befarq, voqea, holat: { ...holat, joriy: j } };
      }
      if (!j.sanaldi || !tanlov(kalitOl(javob))) return befarq;
      break;
    case "juft": {
      if (!Array.isArray(javob) || javob.length !== 2 || javob[0] === javob[1]) return befarq;
      const [a, b] = javob.map((k) => r.variantlar.find((c) => c.k === k));
      if (!a || !b || j.ochilgan.includes(a.juft) || j.ochilgan.includes(b.juft)) return befarq;
      togri = a.juft === b.juft;
      if (togri) {
        j.ochilgan = [...j.ochilgan, a.juft];
        raundTugadi = j.ochilgan.length >= r.togri.length;
        voqea = { tur: "juft", el: a.el };
      } else {
        // xato faqat bola sherigini avval ko'rgan bo'lsa (eslab qolishi kerak edi); yangi kartani ochish — xato emas
        const sherikKorilgan = r.variantlar.some((c) => c.juft === a.juft && c.k !== a.k && j.korilgan.includes(c.k));
        xatoHisob = sherikKorilgan;
      }
      j.korilgan = [...new Set([...j.korilgan, a.k, b.k])];
      break;
    }
    case "tartib": {
      if (Array.isArray(javob)) {
        togri = javob.length === r.togri.length && javob.every((k, i) => k === r.togri[i]);
        if (togri) { j.joylar = [...r.togri]; raundTugadi = true; }
        break;
      }
      const { joy, k } = javob || {};
      if (!Number.isInteger(joy) || joy < 0 || joy >= r.togri.length || j.joylar[joy] || j.joylar.includes(k)
        || !r.variantlar.some((v) => v.k === k)) return befarq;
      if (r.savol.bosqichma && joy !== j.joylar.indexOf(null)) return befarq;
      togri = r.togri[joy] === k;
      if (togri) {
        j.joylar = j.joylar.map((x, i) => (i === joy ? k : x));
        raundTugadi = j.joylar.every(Boolean);
        voqea = { tur: "joy", joy, el: r.variantlar.find((v) => v.k === k).el };
      }
      break;
    }
    case "savat": {
      const o = javob || {};
      if (o.qoy !== undefined) {
        const v = r.variantlar.find((x) => x.k === o.qoy);
        if (!v || j.ichida.includes(v.k)) return befarq;
        togri = v.el.k === r.savol.el.k;
        if (togri) {
          j.ichida = [...j.ichida, v.k];
          voqea = { tur: "savat", soni: j.ichida.length };
          if (r.savol.avto && j.ichida.length >= r.savol.soni) raundTugadi = true;
        }
        break;
      }
      if (o.ol !== undefined) {
        if (!j.ichida.includes(o.ol)) return befarq;
        j.ichida = j.ichida.filter((x) => x !== o.ol);
        return { ...befarq, voqea: { tur: "oldi", soni: j.ichida.length }, holat: { ...holat, joriy: j } };
      }
      if (o.tayyor) {
        togri = j.ichida.length === r.savol.soni;
        raundTugadi = togri;
        voqea = { tur: "tayyor", soni: j.ichida.length, kerak: r.savol.soni };
        break;
      }
      return befarq;
    }
    default:
      return befarq;
  }

  let { xatolar, raundlar, qiyinlik, togriSoni, raund } = holat;
  let osonlashdi = false;
  const xato = togri === false && xatoHisob;
  if (xato) {
    xatolar += 1;
    j.xato += 1;
    if (xatolar % 2 === 0) {
      raundlar = raundlar.map((x, i) => (i > raund ? osonlashtir(x) : x));
      qiyinlik = Math.max(QIYINLIK_MIN, qiyinlik - 1);
      osonlashdi = true;
    }
  }
  let tugadi = false;
  let joriy = j;
  if (raundTugadi) {
    if (togri) togriSoni += 1;
    if (raund + 1 >= raundlar.length) tugadi = true;
    else { raund += 1; joriy = joriyBosh(raundlar[raund]); }
  }
  const yangiHolat = { ...holat, raundlar, qiyinlik, xatolar, togriSoni, raund, tugadi, joriy };
  return { togri, xato, voqea, raundTugadi, tugadi, osonlashdi, yakunJoriy: raundTugadi ? j : null, holat: yangiHolat };
}

/** Joriy raund uchun to'g'ri navbatdagi javob (yordam/ishora va sinovlar uchun). */
export function maslahat(holat) {
  const r = holat?.raundlar?.[holat.raund];
  if (!r || holat.tugadi) return null;
  const j = holat.joriy;
  switch (r.tur) {
    case "tanlov": case "aytish": return r.togri;
    case "sanash": {
      if (!j.sanaldi) { const k = r.savol.narsalar.find((x) => !j.sanalgan.includes(x)); return k === undefined ? null : { sana: k }; }
      return r.togri;
    }
    case "juft": {
      const a = r.variantlar.find((c) => !j.ochilgan.includes(c.juft));
      const b = a && r.variantlar.find((c) => c.juft === a.juft && c.k !== a.k);
      return a && b ? [a.k, b.k] : null;
    }
    case "tartib": { const joy = j.joylar.indexOf(null); return joy < 0 ? null : { joy, k: r.togri[joy] }; }
    case "savat": {
      if (j.ichida.length < r.savol.soni) {
        const v = r.variantlar.find((x) => x.el.k === r.savol.el.k && !j.ichida.includes(x.k));
        return v ? { qoy: v.k } : null;
      }
      return { tayyor: true };
    }
    default: return null;
  }
}

/** Keyingi o'yin qiyinligi: 2 va undan ko'p xato — osonroq; xatosiz — asl darajaga qaytadi. */
export function qiyinlikMoslash(qiyinlik = 0, xatolar = 0) {
  const q = qiyinlikNorm(qiyinlik);
  if (xatolar >= 2) return Math.max(QIYINLIK_MIN, q - 1);
  if (xatolar === 0) return Math.min(QIYINLIK_MAX, q + 1);
  return q;
}

/** Yulduzlar: xatosiz — 3, 1–2 xato — 2, ko'p — 1. */
export const yulduzlar = (xatolar) => (xatolar <= 0 ? 3 : xatolar <= 2 ? 2 : 1);

/* ───────────────────────── ovoz gaplari ───────────────────────── */

const M = (kalit, gap, izoh, vars, i = 0) => oyinMatn(kalit, gap, izoh, vars, i);

/**
 * Raund boshida ustoz aytadigan gap (izoh tilida, o'rganilayotgan so'zlar teglangan). birinchi — 1-raundda kirish gapi
 * ham qo'shiladi. Bir nechta bosqichli raundlarda (hikoya tartibi, bosib sana) joriy qadamga mos gap.
 */
export function raundGapi(holat, { izoh = "uz", til, birinchi = false } = {}) {
  const r = holat?.raundlar?.[holat.raund];
  if (!r || holat.tugadi) return "";
  const t = til || holat.til;
  const k = holat.kalit;
  const j = holat.joriy || joriyBosh(r);
  const nom = (el) => nomOvoz(el, t);
  const xi = (holat.xil || 0) + holat.raund;   // REV347: raund gapining varianti
  let gap = "";
  switch (k) {
    case "eshitBos": case "oxshash": case "soya": gap = M(k, "raund", izoh, { t: nom(r.savol.el) }, xi); break;
    case "joylashuv": gap = M(k, "raundJoy", izoh, { t: nom(r.savol.el), j: M(k, r.savol.joy, izoh) }, xi); break;   // REV370: «mushuk qutining ustida» — rasmini top
    case "aytOch": gap = M(k, holat.mik && !j.bosib ? "raund" : "raundBos", izoh, { t: nom(r.savol.el) }, xi); break;
    case "ketmaKet": gap = M(k, "raund", izoh, { q: r.savol.qator.map(nom).filter(Boolean).join(", ") }, xi); break;
    case "tartib": case "kapalak": case "gulOstir": case "kunTartibi": case "qolYuvish": case "suvSayohati": case "fasllar": case "tishTozalash": case "osish": case "qayerdan": {
      const els = r.togri.map((x) => r.variantlar.find((v) => v.k === x)?.el);
      const nomi = (el) => (k === "tartib" ? nom(el) : el?.uz);   // REV349: jarayon so'zlari izoh tilida
      if (k !== "tartib" && holat.yosh !== "2-3") {   // REV349: 4–7 yoshda jarayon tartibini bola o'zi topadi — aytib qo'yilmaydi
        const joy = j.joylar.indexOf(null);
        gap = r.savol.bosqichma ? (joy < 0 ? "" : umumiyGap(joy === 0 ? "avvalSavol" : "keyinSavol", izoh, xi + joy)) : umumiyGap("hammasiTartib", izoh, xi);
        break;
      }
      if (r.savol.bosqichma) {
        const joy = j.joylar.indexOf(null);
        gap = joy < 0 ? "" : M("tartib", joy === 0 ? "avval" : "keyin", izoh, { t: nomi(els[joy]) });
      } else {
        gap = els.map((el, i) => M("tartib", i === 0 ? "avval" : "keyin", izoh, { t: nomi(el) })).join(" ");
      }
      break;
    }
    case "savat": gap = M(k, "raund", izoh, { t: nom(r.savol.el), n: r.savol.soni }, xi); break;
    case "sana": gap = j.sanaldi ? M(k, "nechta", izoh) : M(k, "raund", izoh, { t: nom(r.savol.el) }, xi); break;
    case "yoqolganSon": gap = M(k, "raund", izoh, { q: r.savol.qator.map((x) => (x === null ? "…" : String(x))).join(", ") }, xi); break;
    case "haYoq": gap = M(k, "raund", izoh, { t: nom(r.savol.aytilgan) }, xi); break;
    case "sehrliQuti": gap = M(k, r.savol.rejim, izoh, { a: r.savol.a, b: r.savol.b }); break;
    case "uyYovvoyi": case "mevaSabzavot": case "xavfli": case "chiqindi": case "transport": case "harakatTuri": case "yeyiladi": case "faslKiyim":
    case "onaBola": case "uyiQayerda": case "kasbAsbob": case "hayvonOvqat": case "nimaBilan": case "sezgi":
      gap = M(k, "raund", izoh, { t: r.savol.el.uz }, xi); break;
    case "faslMeva": gap = M(k, "raund", izoh, { t: r.savol.el.uz }, xi); break;
    case "sirliQuti": gap = r.savol.ovoz ? M(k, "raundOvoz", izoh, { o: r.savol.ovoz }, xi) : r.savol.el.say ? M(k, "raundSoz", izoh, { t: nom(r.savol.el) }, xi) : M(k, "raund", izoh, {}, xi); break;
    case "hayvonOvoz": case "transportOvoz": gap = M(k, "raund", izoh, { t: r.savol.ovoz }, xi); break;
    case "faslOvoz": gap = M(k, "raund", izoh, { t: r.savol.tasvir }, xi); break;
    case "birinchiHarf": gap = M(k, "raund", izoh, { h: r.savol.harf }, xi); break;
    case "bogin": gap = M(k, "raund", izoh, { t: r.savol.el.uz }, xi); break;
    case "tarozi": gap = M(k, r.savol.yengil ? "raundYengil" : "raund", izoh, {}, xi); break;   // REV370
    case "dokon": gap = M(k, "raund", izoh, { n: r.savol.pul }, xi); break;
    case "tenglash": gap = M(k, "raund", izoh, { a: r.savol.chap, b: r.savol.ong }, xi); break;
    case "masala": gap = M(k, `${r.savol.kalit}`, izoh, { a: r.savol.a, b: r.savol.b }); break;
    case "rangTop": gap = M(k, "raund", izoh, { t: RANGLAR[r.savol.rang].s[izoh] || RANGLAR[r.savol.rang].s.uz }, xi); break;
    case "aralash": gap = M(k, "raund", izoh, { a: RANGLAR[r.savol.a].s[izoh] || RANGLAR[r.savol.a].s.uz, b: RANGLAR[r.savol.b].s[izoh] || RANGLAR[r.savol.b].s.uz }, xi); break;
    case "teskari": gap = M(k, "raund", izoh, { t: r.savol.el.soz?.[izoh] || r.savol.el.soz?.uz }, xi); break;
    case "shaklTop": gap = M(k, "raund", izoh, { t: SHAKLLAR[r.savol.shakl][izoh] || SHAKLLAR[r.savol.shakl].uz }, xi); break;   // REV536
    case "sanaShakl": gap = M(k, "raund", izoh, { t: SHAKLLAR[r.savol.shakl][izoh] || SHAKLLAR[r.savol.shakl].uz }, xi); break;   // REV537
    case "kattaKichik": gap = M(k, r.savol.soralgan === "katta" ? "raund" : "raundKichik", izoh, {}, xi); break;
    default: gap = M(k, "raund", izoh, {}, xi); break;
  }
  // REV347: o'yin boshi — har safar boshqa «ochilish» gapi (mavzu nomi bilan); shu darsda bo'lgan o'yin — qisqa kirish
  if (!birinchi) return toza(gap);
  const v = holat.xil || 0;
  const ochilish = umumiyGap(holat.mavzu ? "ochilishMavzu" : "ochilish", izoh, v).replace("{mavzu}", holat.mavzu || "");
  const d = holat.kirishDaraja || (holat.tanish ? "eslat" : "korsat");
  if (d === "yoq") return toza(`${ochilish} ${gap}`);
  const kirish = d === "eslat" ? M("", "tanishKirish", izoh, { nom: M(k, "nom", izoh) }, v) : M(k, "kirish", izoh, {}, v);
  // REV360: birinchi marta — qoida + «Qara, avval men o'ynab ko'rsataman»
  const korsat = d === "korsat" && holat.raundlar[0]?.tur === "tanlov" ? umumiyGap("korsataman", izoh, v) : "";
  return toza(`${ochilish} ${kirish} ${korsat} ${gap}`);
}

/** Javobdan keyin aytiladigan gap (maqtov, dalda, sanoq, so'z…). natija — tekshir() qaytargani. */
export function javobGapi(eski, natija, { izoh = "uz", til } = {}) {
  if (!eski || !natija) return "";
  const t = til || eski.til;
  const r = eski.raundlar?.[eski.raund];
  if (!r) return "";
  const k = eski.kalit;
  const i = (eski.xil || 0) + eski.raund + eski.togriSoni + eski.xatolar;   // REV347: o'yindan o'yinga boshqa maqtov
  const maqtov = umumiyGap("maqtov", izoh, i);
  const dalda = umumiyGap("dalda", izoh, i);
  const v = natija.voqea;
  const raundEl = r.savol?.el && ["eshitBos", "aytOch", "oxshash", "haYoq", "sirliQuti"].includes(k) ? r.savol.el : null;
  let gap = "";
  if (v?.tur === "mikYoq") gap = `${M(k, "mikYoq", izoh)} ${raundGapi(natija.holat, { izoh, til: t })}`;
  else if (v?.tur === "sanoq") gap = `${teg(String(v.son), t)}${v.oxirgi ? `. ${M(k, "nechta", izoh)}` : ""}`;
  else if (v?.tur === "oldi") gap = teg(String(v.soni), t);
  else if (natija.raundTugadi && natija.togri) gap = `${maqtov} ${raundEl ? nomOvoz(raundEl, t) : ""}`;
  else if (natija.raundTugadi) gap = M("", "mana", izoh, { t: nomOvoz(r.savol.el, t) });   // o'tib ketdi: to'g'risini aytamiz
  else if (natija.togri) {
    if (v?.tur === "joy") gap = r.savol.bosqichma ? raundGapi(natija.holat, { izoh, til: t }) : nomOvoz(v.el, t);
    else if (v?.tur === "savat") gap = teg(String(v.soni), t);
    else if (v?.tur === "juft") gap = "";      // kartaning nomi ochilganda aytilgan
  } else if (natija.togri === false) {
    if (v?.tur === "yana") gap = M(k, "yana", izoh, { t: nomOvoz(r.savol.el, t) });
    else if (v?.tur === "bosib") gap = M(k, "bosib", izoh, { t: nomOvoz(r.savol.el, t) });   // REV359
    else if (v?.tur === "tayyor") gap = M(k, v.soni < v.kerak ? "kam" : "kop", izoh);
    else if (k === "juft") gap = "";
    else if (k === "eshitBos" || (k === "aytOch" && !eski.mik)) gap = `${dalda} ${nomOvoz(r.savol.el, t)}`;
    else gap = dalda;
  }
  if (natija.tugadi) gap = `${gap} ${umumiyGap(natija.holat?.xatolar ? "yakunXato" : "yakun", izoh, (eski.xil || 0) + eski.togriSoni)}`;
  return toza(gap);
}

/** Kalitlar ro'yxati (sinovlar uchun): har o'yinning gaplari bormi. */
export const OYIN_KALITLARI = OYINLAR.map((o) => o.kalit).filter((k) => OYIN_MATN[k]);
