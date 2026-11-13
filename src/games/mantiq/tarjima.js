// REV533: fan o'yinlari matnlarini 5 tilga o'tkazish — shablon + o'rinbosarlar. Shablon ({v0}, {v1}… — interfeys tarjimasi shu ko'rinishni asraydi) interfeys tarjimasidan o'tadi,
// o'rinbosarlar joyiga qo'yiladi: { tr: "mushuk" } — tarjima qilinadigan so'z; oddiy satr/son (ism, raqam) — o'zgarishsiz.
import { uiText } from "../../interface/interfaceRuntime.js";

/** Sof qism (testlanadi): tarjima funksiyasi tashqaridan beriladi. Tarjimada o'rinbosar yo'qolgan bo'lsa — asl shablon ishlatiladi. */
export function shablonToldir(m, a = [], tarjima = (x) => x) {
  const t = String(tarjima(m) ?? m); const butun = a.every((_, i) => t.includes(`{v${i}}`));
  return (butun ? t : m).replace(/\{v(\d+)\}/g, (_, i) => { const v = a[Number(i)]; return v && typeof v === "object" ? String(tarjima(v.tr) ?? v.tr) : String(v ?? ""); });
}
export const fmt = (x) => (x && typeof x === "object" && x.m ? shablonToldir(x.m, x.a || [], uiText) : uiText(String(x ?? "")));
