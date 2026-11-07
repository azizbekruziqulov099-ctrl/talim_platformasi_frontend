// REV400: «Chizma daftari» — sof funksiyalar (testlanadi): shakllarni chizish, tegishni aniqlash, surish va o'lchamini o'zgartirish.

export const SHAKLLAR_2D = [["chiziq", "／", "Chiziq"], ["strelka", "→", "Strelka"], ["tortburchak", "▭", "To‘rtburchak"], ["uchburchak", "△", "Uchburchak"],
  ["togri_uchburchak", "◺", "To‘g‘ri burchakli uchburchak"], ["aylana", "◯", "Aylana"], ["koordinata", "┼", "Koordinata o‘qlari"]];
export const SHAKLLAR_3D = [["kub", "⬛", "Kub"], ["parallelepiped", "▰", "To‘g‘ri burchakli parallelepiped"], ["silindr", "⌭", "Silindr"],
  ["konus", "△", "Konus"], ["piramida", "◭", "Piramida"], ["prizma", "⬟", "Uchburchakli prizma"], ["shar", "◍", "Shar"]];

export const norm = (s) => ({ ...s, x: Math.min(s.x, s.x + s.w), y: Math.min(s.y, s.y + s.h), w: Math.abs(s.w), h: Math.abs(s.h) });

/** Bitta shakl — chiziqlar ro'yxati: [{ t: "l", a:[x,y], b:[x,y], yash }] yoki [{ t: "e", cx, cy, rx, ry, a0, a1, yash }].
 *  yash — ko'rinmaydigan (orqadagi) qirra: uzuq chiziq bilan chiziladi. */
export function shaklQismlari(s0) {
  const s = s0.kind === "chiziq" || s0.kind === "strelka" ? s0 : norm(s0);
  const { x, y, w, h } = s;
  const L = (a, b, yash = false) => ({ t: "l", a, b, yash });
  const E = (cx, cy, rx, ry, a0 = 0, a1 = Math.PI * 2, yash = false) => ({ t: "e", cx, cy, rx, ry, a0, a1, yash });
  switch (s.kind) {
    case "chiziq": return [L([x, y], [x + w, y + h])];
    case "strelka": { const ex = x + w, ey = y + h, ang = Math.atan2(h, w), u = 12;
      return [L([x, y], [ex, ey]), L([ex, ey], [ex - u * Math.cos(ang - 0.45), ey - u * Math.sin(ang - 0.45)]), L([ex, ey], [ex - u * Math.cos(ang + 0.45), ey - u * Math.sin(ang + 0.45)])]; }
    case "tortburchak": return [L([x, y], [x + w, y]), L([x + w, y], [x + w, y + h]), L([x + w, y + h], [x, y + h]), L([x, y + h], [x, y])];
    case "uchburchak": return [L([x + w / 2, y], [x + w, y + h]), L([x + w, y + h], [x, y + h]), L([x, y + h], [x + w / 2, y])];
    case "togri_uchburchak": { const k = Math.min(14, w / 4, h / 4);
      return [L([x, y], [x, y + h]), L([x, y + h], [x + w, y + h]), L([x + w, y + h], [x, y]), L([x, y + h - k], [x + k, y + h - k]), L([x + k, y + h - k], [x + k, y + h])]; }
    case "aylana": return [E(x + w / 2, y + h / 2, w / 2, h / 2)];
    case "koordinata": { const cx = x + w / 2, cy = y + h / 2, u = 8;
      return [L([x, cy], [x + w, cy]), L([x + w, cy], [x + w - u, cy - u / 2]), L([x + w, cy], [x + w - u, cy + u / 2]),
        L([cx, y + h], [cx, y]), L([cx, y], [cx - u / 2, y + u]), L([cx, y], [cx + u / 2, y + u])]; }
    case "kub": case "parallelepiped": {
      const d = Math.min(w, h) * (s.kind === "kub" ? 0.32 : 0.26);
      const f = { x, y: y + d, w: w - d, h: h - d }, b = { x: x + d, y, w: w - d, h: h - d };
      return [L([f.x, f.y], [f.x + f.w, f.y]), L([f.x + f.w, f.y], [f.x + f.w, f.y + f.h]), L([f.x + f.w, f.y + f.h], [f.x, f.y + f.h]), L([f.x, f.y + f.h], [f.x, f.y]),
        L([b.x, b.y], [b.x + b.w, b.y]), L([b.x + b.w, b.y], [b.x + b.w, b.y + b.h]),
        L([b.x + b.w, b.y + b.h], [b.x, b.y + b.h], true), L([b.x, b.y + b.h], [b.x, b.y], true),
        L([f.x, f.y], [b.x, b.y]), L([f.x + f.w, f.y], [b.x + b.w, b.y]), L([f.x + f.w, f.y + f.h], [b.x + b.w, b.y + b.h]), L([f.x, f.y + f.h], [b.x, b.y + b.h], true)]; }
    case "silindr": { const ry = Math.min(h * 0.14, w * 0.25), cx = x + w / 2, rx = w / 2;
      return [E(cx, y + ry, rx, ry), L([x, y + ry], [x, y + h - ry]), L([x + w, y + ry], [x + w, y + h - ry]),
        E(cx, y + h - ry, rx, ry, 0, Math.PI), E(cx, y + h - ry, rx, ry, Math.PI, Math.PI * 2, true)]; }
    case "konus": { const ry = Math.min(h * 0.14, w * 0.25), cx = x + w / 2, rx = w / 2;
      return [L([cx, y], [x, y + h - ry]), L([cx, y], [x + w, y + h - ry]), E(cx, y + h - ry, rx, ry, 0, Math.PI), E(cx, y + h - ry, rx, ry, Math.PI, Math.PI * 2, true)]; }
    case "piramida": { const d = h * 0.22, ax = x + w / 2, ay = y;
      const p1 = [x, y + h], p2 = [x + w * 0.72, y + h], p3 = [x + w, y + h - d], p4 = [x + w * 0.28, y + h - d];
      return [L(p1, p2), L(p2, p3), L(p3, p4, true), L(p4, p1, true), L([ax, ay], p1), L([ax, ay], p2), L([ax, ay], p3), L([ax, ay], p4, true)]; }
    case "prizma": { const d = w * 0.3, t = [x + (w - d) / 2, y + h * 0.18];
      const a1 = [x, y + h], a2 = [x + w - d, y + h], b1 = [x + d, y + h * 0.82], b2 = [x + w, y + h * 0.82], at = t, bt = [t[0] + d, t[1] - h * 0.18];
      return [L(a1, a2), L(a2, at), L(at, a1), L(b2, bt), L(bt, b1, true), L(b1, b2, true), L(a1, b1, true), L(a2, b2), L(at, bt)]; }
    case "shar": { const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) / 2;
      return [E(cx, cy, r, r), E(cx, cy, r, r * 0.3, 0, Math.PI), E(cx, cy, r, r * 0.3, Math.PI, Math.PI * 2, true)]; }
    default: return [];
  }
}

const ikkiNuqta = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };

/** Nuqta shu obyektga tegadimi (o'chirg'ich va tanlash uchun). */
export function tegadimi(it, p, r = 9) {
  if (it.t === "yoz") { for (let i = 1; i < it.n.length; i += 1) if (ikkiNuqta(p, it.n[i - 1], it.n[i]) <= r + it.q / 2) return true; return it.n.length === 1 && Math.hypot(p[0] - it.n[0][0], p[1] - it.n[0][1]) <= r; }
  if (it.t === "matn") { return p[0] >= it.x - r && p[0] <= it.x + it.w + r && p[1] >= it.y - it.h - r && p[1] <= it.y + r; }
  for (const q of shaklQismlari(it)) {
    if (q.t === "l" && ikkiNuqta(p, q.a, q.b) <= r) return true;
    if (q.t === "e") { const dx = (p[0] - q.cx) / (q.rx || 1), dy = (p[1] - q.cy) / (q.ry || 1); if (Math.abs(Math.hypot(dx, dy) - 1) * Math.min(q.rx, q.ry) <= r) return true; }
  }
  return false;
}

/** Obyektning chegarasi (tanlash ramkasi va o'lcham tutqichi uchun). */
export function chegara(it) {
  if (it.t === "yoz") { const xs = it.n.map((p) => p[0]), ys = it.n.map((p) => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }; }
  if (it.t === "matn") return { x: it.x, y: it.y - it.h, w: it.w, h: it.h };
  const n = norm(it); return { x: n.x, y: n.y, w: n.w, h: n.h };
}

export function sur(it, dx, dy) {
  if (it.t === "yoz") return { ...it, n: it.n.map(([x, y]) => [x + dx, y + dy]) };
  return { ...it, x: it.x + dx, y: it.y + dy };
}

/** O'ng-pastki tutqich bilan o'lchamni o'zgartirish (yozuvlar mutanosib cho'ziladi). */
export function olcham(it, eski, yangiW, yangiH) {
  const w = Math.max(12, yangiW), h = Math.max(12, yangiH);
  if (it.t === "yoz") { const sx = w / Math.max(1, eski.w), sy = h / Math.max(1, eski.h); return { ...it, n: it.n.map(([x, y]) => [eski.x + (x - eski.x) * sx, eski.y + (y - eski.y) * sy]) }; }
  if (it.t === "matn") return { ...it, o: Math.max(10, Math.round(it.o * h / Math.max(1, eski.h))), w: w, h: h };
  const n = norm(it); return { ...it, x: n.x, y: n.y, w, h };
}
