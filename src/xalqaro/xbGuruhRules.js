// REV556: xalqaro (PISA/TIMSS) sinfidagi guruhlar — ko'rinish uchun sof yordamchilar (server: modules/xalqaro_guruh.py).

/** O'quvchining holati: nima ko'rsatiladi. → "kirish" (test topshirmagan) | "tekshiruv" (natijasi tekshiruvda, guruhsiz) | "guruhda" */
export function oquvchiHolati(s) {
  if (s?.guruh) return "guruhda";
  return s?.kirish?.tekshiruvda ? "tekshiruv" : "kirish";
}

/** «Guruhingiz o'zgardi» xabari matni (o'zbekcha shablon; tf() bilan tarjima qilinadi). */
export function xabarShabloni(x) {
  if (!x || !x.yangi) return null;
  if (x.tur === "yuqoriga") return { belgi: "🎉", matn: "Tabriklaymiz! Barqaror natijalaringiz uchun {y}-guruhga o‘tdingiz (avval {e}-guruhda edingiz).", turi: "ok" };
  if (x.tur === "pastga") return { belgi: "💪", matn: "Siz {y}-guruhga o‘tdingiz (avval {e}-guruhda edingiz). Bu guruh hozirgi darajangizga mos — shu yerda mustahkamlab, yana ko‘tarilasiz.", turi: "ogoh" };
  return { belgi: "👋", matn: "Siz {y}-guruhga qo‘shildingiz — bu guruh reytingingizga mos.", turi: "ok" };
}

/** Foiz → yo'lak rangi (zaif / o'rta / kuchli). */
export const foizRangi = (f) => (f >= 75 ? "#1f8a4c" : f >= 50 ? "#1b6fd8" : "#c77d00");

/** O'qituvchi jadvali: o'quvchi qatoridagi belgilar. */
export function azoBelgilari(a) {
  const out = [];
  if (a?.tekshiruvda?.length) out.push({ tur: "tekshiruv", belgi: "⚠️", sabablar: a.tekshiruvda.flatMap((t) => t.sabab), ball: a.tekshiruvda[a.tekshiruvda.length - 1].ball });
  if (a?.eslatma?.length) out.push({ tur: "eslatma", belgi: "ℹ️", sabablar: a.eslatma });
  return out;
}

/** Sinf jamlamasi: nechta guruhda, nechta kutmoqda. */
export function sinfJamlamasi(d) {
  const guruhda = (d?.guruhlar || []).reduce((n, g) => n + (g.soni || 0), 0);
  const kut = d?.kutayotgan || [];
  return { jami: d?.jami || 0, guruhda, guruhlar: (d?.guruhlar || []).length,
    testsiz: kut.filter((k) => k.holat === "kirish_testi_yoq").length, tekshiruvda: kut.filter((k) => k.holat === "tekshiruvda").length };
}

export const sana = (iso) => { if (!iso) return ""; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`; };
