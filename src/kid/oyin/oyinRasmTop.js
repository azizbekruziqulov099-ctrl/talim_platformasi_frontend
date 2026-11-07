// REV368: o'yin elementining rasmi — bitta joyda: 1) ma'lumotda aniq ko'rsatilgan rasm (rasmId), 2) so'zi bo'yicha,
// 3) belgisi bo'yicha. Rasmlar kutubxonasidan (Azizjonning rasmlari).
import { RASM_HAMMA } from "../darsRasm.js";
import { emojiRasm, matnId, sozId } from "../rasmHarakat.js";
export function oyinRasmTop(el) {
  if (!el) return "";
  if (el.rasmId && RASM_HAMMA[el.rasmId]) return RASM_HAMMA[el.rasmId];
  const soz = el.say || el.uz || "";
  const mt = matnId(el.soz?.uz || el.uz || "") || matnId(el.say || "");
  if (mt && RASM_HAMMA[mt]) return RASM_HAMMA[mt];
  const id = sozId({ soz: el.soz?.uz || el.uz || soz, emoji: el.emoji || "" });
  if (id && RASM_HAMMA[id]) return RASM_HAMMA[id];
  return emojiRasm(el.emoji || "", RASM_HAMMA, soz)?.src || "";
}

/** REV420: so'zining o'z rasmi bormi (aniq rasmId, so'z yoki ibora bo'yicha) — emoji orqali taxmin qilingan rasm hisobga olinmaydi. */
export function sozRasmiBor(el) {
  if (!el) return false;
  if (el.rasmId && RASM_HAMMA[el.rasmId]) return true;
  if (el.image) return true;
  const mt = matnId(el.soz?.uz || el.uz || "") || matnId(el.say || "");
  if (mt && RASM_HAMMA[mt]) return true;
  const id = sozId({ soz: el.soz?.uz || el.uz || el.say || "", emoji: "" });
  return Boolean(id && RASM_HAMMA[id]);
}
export function sozRasmBelgila(els) {
  return (Array.isArray(els) ? els : []).map((e) => (e && typeof e === "object" ? { ...e, sozRasm: sozRasmiBor(e) } : e));
}
