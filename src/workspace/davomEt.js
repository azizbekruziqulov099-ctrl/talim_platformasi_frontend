// REV692: «Davom et» — foydalanuvchi oxirgi marta qaysi bo'limda bo'lgani (qurilmada, hisob va rol bo'yicha).
// «Bugun» ekranida karta bo'lib chiqadi: bir bosishda o'sha joyga qaytadi.
export const DAVOM_TABLARI = {
  test: ["📝", "Testlar"], oyinlar: ["🎮", "O‘yinlar"], ekspeditsiya: ["🧭", "Matematik ekspeditsiya"], xalqaro: ["🌍", "Xalqaro baholash"],
  ai_ustoz: ["🤖", "AI ustoz"], bilim: ["📊", "Bilimlarim"], mavzular: ["📖", "Mavzular"], mat_bank: ["📘", "Matematika banki"],
  fan_oyinlari: ["🔬", "Fan o‘yinlari"], mantiq_oyinlari: ["🧠", "Fan va mantiq o‘yinlari"], mantiq: ["🧩", "Rivojlantiruvchi o‘yinlar"],
  kabu_loyiha: ["🔬", "Kabu loyiha"], til_xonalari: ["🏠", "Til o‘yin xonalari"], til_maktab: ["📚", "Til o‘yinlari"], til_mashqi: ["🗣️", "Gapirish mashqi"],
  shaxmat_maktab: ["🎓", "Shaxmat maktabi"], farzand: ["👧", "Farzandim"], oqituvchi: ["🧑‍🏫", "To‘garak va repetitorlik"], oqituvchi_analitika: ["📊", "Statistikalar"],
  taqdimotlar: ["🖥️", "Taqdimotlar"], ochiq_dars: ["🎬", "Ochiq darslar"],
};
const MUDDAT_MS = 30 * 24 * 3600 * 1000;
const kalit = (id, rol) => `kb_davom_v1_${id || "men"}_${rol || ""}`;

export function davomSaqla(id, rol, tab, hozir = Date.now(), xotira = globalThis.localStorage) {
  if (!DAVOM_TABLARI[tab]) return false;
  try { xotira.setItem(kalit(id, rol), JSON.stringify({ tab, vaqt: hozir })); return true; } catch { return false; }
}

export function davomOl(id, rol, hozir = Date.now(), xotira = globalThis.localStorage) {
  try {
    const x = JSON.parse(xotira.getItem(kalit(id, rol)) || "null");
    if (!x || !DAVOM_TABLARI[x.tab] || hozir - Number(x.vaqt) > MUDDAT_MS) return null;
    const [ikon, nom] = DAVOM_TABLARI[x.tab];
    return { tab: x.tab, ikon, nom, vaqt: Number(x.vaqt) };
  } catch { return null; }
}

export function qachon(vaqt, hozir = Date.now()) {
  const daq = Math.max(0, Math.round((hozir - vaqt) / 60000));
  if (daq < 60) return "bugun";
  const kun = Math.floor(daq / 1440);
  return kun < 1 ? "bugun" : kun === 1 ? "kecha" : `${kun} kun oldin`;
}
