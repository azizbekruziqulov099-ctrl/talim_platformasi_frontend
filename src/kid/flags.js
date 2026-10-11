// REV122: Windows'da bayroq emojilari («🇸🇦») harf bo'lib («SA») chiqadi. Bayroqlarni oddiy SVG bilan chizamiz —
// hamma qurilmada bir xil ko'rinadi. Boshqa emojilar o'zgarishsiz.
const R = (fill, x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const H3 = (a, b, c) => R(a, 0, 0, 30, 6.67) + R(b, 0, 6.67, 30, 6.67) + R(c, 0, 13.33, 30, 6.67);
const V3 = (a, b, c) => R(a, 0, 0, 10, 20) + R(b, 10, 0, 10, 20) + R(c, 20, 0, 10, 20);
const star = (cx, cy, r, fill) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy - rr * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${p.join(" ")}" fill="${fill}"/>`;
};
const FLAGS = {
  GB: R("#012169", 0, 0, 30, 20) + '<path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/>'
    + '<path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.6"/>'
    + R("#fff", 12, 0, 6, 20) + R("#fff", 0, 7, 30, 6) + R("#C8102E", 13.2, 0, 3.6, 20) + R("#C8102E", 0, 8.2, 30, 3.6),
  RU: H3("#fff", "#0039A6", "#D52B1E"),
  DE: H3("#000", "#DD0000", "#FFCE00"),
  FR: V3("#0055A4", "#fff", "#EF4135"),
  ES: R("#AA151B", 0, 0, 30, 20) + R("#F1BF00", 0, 5, 30, 10),
  TR: R("#E30A17", 0, 0, 30, 20) + '<circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/>' + star(17.2, 10, 2.4, "#fff"),
  JP: R("#fff", 0, 0, 30, 20) + '<circle cx="15" cy="10" r="6" fill="#BC002D"/>',
  CN: R("#DE2910", 0, 0, 30, 20) + star(6, 6, 3.6, "#FFDE00") + star(11.5, 2.6, 1.1, "#FFDE00") + star(13.4, 5.2, 1.1, "#FFDE00")
    + star(13.4, 8.6, 1.1, "#FFDE00") + star(11.5, 11, 1.1, "#FFDE00"),
  KR: R("#fff", 0, 0, 30, 20) + '<circle cx="15" cy="10" r="5" fill="#CD2E3A"/><path d="M10 10a5 5 0 0 0 10 0a2.5 2.5 0 0 0-5 0a2.5 2.5 0 0 1-5 0z" fill="#0047A0"/>'
    + '<g stroke="#000" stroke-width="1.1"><path d="M4 4.2l3 -2.4M4.8 5.2l3 -2.4M5.6 6.2l3 -2.4M21.4 13.8l3 -2.4M22.2 14.8l3 -2.4M23 15.8l3 -2.4M21.4 6.2l3 2.4M22.2 5.2l3 2.4M23 4.2l3 2.4M4 15.8l3 2.4M4.8 14.8l3 2.4M5.6 13.8l3 2.4"/></g>',
  SA: R("#006C35", 0, 0, 30, 20) + '<path d="M8 8.5h14M9 10.2h12" stroke="#fff" stroke-width="1" stroke-linecap="round"/>'
    + '<path d="M9 14h11l1.5-1" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/>',
  UZ: R("#0099B5", 0, 0, 30, 6.4) + R("#CE1126", 0, 6.4, 30, 0.6) + R("#fff", 0, 7, 30, 6) + R("#CE1126", 0, 13, 30, 0.6) + R("#1EB53A", 0, 13.6, 30, 6.4)
    + '<circle cx="5" cy="3.2" r="2.2" fill="#fff"/><circle cx="5.9" cy="3.2" r="2" fill="#0099B5"/>',
};

/** «🇸🇦» → «SA» (bayroq emojisi bo'lsa), aks holda "". */
export function flagCode(emoji) {
  const cps = [...String(emoji || "").trim()].map((c) => c.codePointAt(0));
  if (cps.length !== 2 || cps.some((c) => c < 0x1f1e6 || c > 0x1f1ff)) return "";
  return cps.map((c) => String.fromCharCode(c - 0x1f1e6 + 65)).join("");
}

export function flagSrc(code) {
  const body = FLAGS[code];
  if (!body) return "";
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20">${body}</svg>`)}`;
}

