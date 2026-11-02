// REV260: harfma-harf yozish qoidalari (brauzersiz sinash mumkin).

/** Qism → «yozish birligi»: oddiy matnda har harf 1, formulada uzunligining yarmi (kamida 3). */
export function chalkUnits(parts) {
  const sizes = (parts || []).map((p) => (p.html || p.math ? Math.max(3, Math.round(String(p.math || p.source || "").length / 2)) : [...String(p.text ?? p.source ?? "")].length));
  return { sizes, total: Math.max(1, sizes.reduce((a, b) => a + b, 0)) };
}

/** shown birlik yozilganda qaysi qismlar qancha ko'rinadi. Matn — harf bo'yicha kesiladi, formula — ulush (frac). */
export function chalkSlice(parts, units, shown) {
  const out = [];
  let left = Math.max(0, shown);
  (parts || []).forEach((p, i) => {
    const size = units.sizes[i] || 0;
    if (left <= 0) return;
    if (p.html) {
      out.push({ html: p.html, frac: Math.min(1, left / Math.max(1, size)) });
    } else {
      const chars = [...String(p.text ?? p.source ?? "")];
      out.push({ text: chars.slice(0, Math.floor(Math.min(size, left))).join("") });
    }
    left -= size;
  });
  return out;
}

/**
 * Ovoz bo'yicha qatorning yozilish ulushi. cues — har qator boshlanadigan so'z indeksi (boardCues), word — hozir aytilayotgan so'z.
 * Qator o'z belgisidan keyingi qatorgacha bo'lgan so'zlar davomida yoziladi; yozuv ovozdan biroz oldinda yuradi (+1 so'z).
 */
export function lineProgress(cues, n, word, totalWords) {
  const start = cues?.[n] ?? 0;
  const next = cues?.[n + 1];
  const end = next !== undefined && next > start ? next : Math.max(start + 1, totalWords);
  const span = Math.max(1, end - start);
  if (word < start) return 0;
  return Math.max(0.04, Math.min(1, (word - start + 1) / span));
}
