// Katta sinf havolasi, ketma-ket kirish testlari va Kabu tanishtiruvining sof qoidalari (test qilish oson bo'lsin deb alohida).

/** Tug'ilgan sana: YYYY-MM-DD, haqiqiy sana, kelajakda emas, 1950 dan keyin. */
export function sanaOk(s, bugun = new Date().toISOString().slice(0, 10)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ""))) return false;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return false;   // 2026-02-31 kabi sanalar rad etiladi
  return s < bugun && s > "1950-01-01";
}

/** Ism-familiya: kamida ikki so'z, har biri kamida 2 harf. */
export function ismOk(ism) {
  const q = String(ism || "").trim().split(/\s+/).filter(Boolean);
  return q.length >= 2 && q.every((x) => x.length >= 2);
}

/** Navbat: {royxat:[toplam…], natijalar:[{toplam,id}]} → joriy test, tartib raqami, tugadimi. */
export function navbatHolati(n) {
  const royxat = Array.isArray(n?.royxat) ? n.royxat : [];
  const topshirilgan = Array.isArray(n?.natijalar) ? n.natijalar.length : 0;
  return { joriy: royxat[topshirilgan] || null, raqam: topshirilgan + 1, jami: royxat.length, tugadi: royxat.length > 0 && topshirilgan >= royxat.length };
}

export function navbatNatijaQosh(n, toplam, id) {
  return { ...n, natijalar: [...(n.natijalar || []), { toplam, id }] };
}

/** Katta sinf o'quvchisiga ko'rinmaydigan menyu bo'limlari. */
export const KATTADA_YASHIRIN = ["dunyo", "qollanma", "metod"];
export const menyuFiltri = (kattaRejim, kalit) => !kattaRejim || !KATTADA_YASHIRIN.includes(kalit);

/** Kabu tanishtiruvi qadamlari: qaysi elementni ko'rsatadi va nima deydi. */
export const KABU_QADAMLAR = [
  { sel: ".kb-account-notice", matn: "Avval muhim narsa: tepadagi eslatmada Telegram yoki Gmail’ni ulang. Ulamasangiz, boshqa qurilmadan kira olmaysiz va natijalaringiz yo‘qolib ketishi mumkin." },
  { sel: ".xb-menyu-karta.is-kurs", matn: "Bu yerda darslar. Har mavzuda men doskada tushuntiraman, keyin mashq qilasiz. Kerakli maktab darslari ham shu yerda ochiq." },
  { sel: ".xb-menyu-karta.is-imtihon", matn: "Bu yerda testlar va imtihonlar: haftalik, oylik, choraklik va yillik. Har birini o‘z vaqtida topshirasiz." },
  { sel: ".xb-menyu-karta.is-reyting", matn: "Bu yerda reytingingiz. Natijangizga qarab guruhingiz belgilanadi. Imtihondan keyin yaxshi o‘qisangiz, yuqori guruhga o‘tasiz." },
  { sel: ".xb-menyu-karta.is-sinfim", matn: "Bu yerda sinfingiz va guruhingiz. O‘qituvchingiz guruhlarni tuzgach, shu yerda ko‘rasiz." },
];
