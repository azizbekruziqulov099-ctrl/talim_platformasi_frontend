// REV168: kundalik kartalaridagi rasmlar — rassom chizgan dars rasmlari (alohida yuklanadi: avval emoji, keyin rasm).
import { RASM_HAMMA } from "./darsRasm.js";
import { emojiRasm, matnId, sozId } from "./rasmHarakat.js";

export function rasmTop(soz = "", emoji = "", til = "") {
  try {
    const mt = matnId(soz);
    if (mt && RASM_HAMMA[mt]) return RASM_HAMMA[mt];
    const id = sozId({ soz: til === "en" ? soz : "", emoji });
    if (id && RASM_HAMMA[id]) return RASM_HAMMA[id];
    return emojiRasm(emoji, RASM_HAMMA, soz)?.src || null;
  } catch { return null; }
}
