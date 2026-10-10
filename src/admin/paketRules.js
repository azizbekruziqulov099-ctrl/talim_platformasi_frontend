// REV121: ommaviy paket — navbat tartibi va hisob (sof funksiyalar, brauzersiz sinaladi).
const IZOH = { ru: "izoh rus", en: "izoh ingliz" };
const TARTIB = { mavzu: 0, miya: 1, royxat: 8, nomalum: 9 };

/** Fayl nomidan taxminiy tur (server baribir ichidan aniqlaydi). */
export function paketTuri(nomi = "") {
  const n = String(nomi).toLowerCase();
  if (/rasmlar_royxati|rasmlar royxati/.test(n)) return "royxat";
  if (/mavzu/.test(n)) return "mavzu";
  if (/miya|\.zip$/.test(n)) return "miya";
  return "nomalum";
}

/** «ingliz_tili_izoh_ru_4-5_yosh_2_ai_miya.xlsx» → «Ingliz tili · izoh rus · 4-5 yosh · miya». */
export function paketBelgi(nomi = "") {
  const stem = String(nomi).split("/").pop().replace(/\.[^.]+$/, "");
  const m = /^(.+?)(?:_izoh_([a-z]{2}))?_(\d-\d)_yosh_(?:\d_)?(mavzular|ai_miya)$/.exec(stem);
  if (!m) return stem.replace(/_/g, " ");
  const fan = m[1].replace(/_/g, " ");
  return [fan[0].toUpperCase() + fan.slice(1), m[2] && (IZOH[m[2]] || `izoh ${m[2]}`), `${m[3]} yosh`, m[4] === "mavzular" ? "mavzular" : "miya"]
    .filter(Boolean).join(" · ");
}

/** Navbat: avval mavzular, keyin miyalar (miya mavzusini bazadan topishi uchun); ro'yxatlar o'tkazib yuboriladi. */
export function paketNavbati(items = []) {
  return items.map((it) => {
    const turi = it.turi || paketTuri(it.nomi);
    const holat = it.holat || "kutmoqda";
    return { ...it, turi, belgi: it.belgi || paketBelgi(it.nomi),
      holat: (turi === "royxat" || turi === "nomalum") && holat === "kutmoqda" && !it.id ? "otkazildi" : holat };
  }).sort((a, b) => (TARTIB[a.turi] ?? 9) - (TARTIB[b.turi] ?? 9) || String(a.yol || "").localeCompare(String(b.yol || "")) || String(a.nomi).localeCompare(String(b.nomi)));
}

export function paketXulosa(list = []) {
  const n = (h) => list.filter((x) => x.holat === h).length;
  const tayyor = n("tayyor"), xato = n("xato"), otkazildi = n("otkazildi");
  const jami = list.length;
  const qoldi = jami - tayyor - xato - otkazildi;
  return { jami, tayyor, xato, otkazildi, qoldi, foiz: jami ? Math.round(((jami - qoldi) / jami) * 100) : 0,
    mavzu: list.filter((x) => x.turi === "mavzu").length, miya: list.filter((x) => x.turi === "miya").length };
}
