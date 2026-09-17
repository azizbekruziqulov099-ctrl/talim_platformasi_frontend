/** Mavzuli slayd fonlari — brauzerda canvas'da chiziladi, JPEG data-URL bo'lib
 * design.image ga tushadi (background: 'image'). Shu sabab ko'rinish (SlidePreview)
 * ham, PowerPoint eksporti ham hech qanday o'zgarishsiz ishlaydi.
 * Chizmalar past kontrastli: matn har doim o'qiladi; qoraytirish (overlay)
 * odatdagidek ishlaydi. Tasodifiylik deterministik — bir xil fon qayta chiqadi.
 */

const W = 1600, H = 900;

const THEMES = [
  { id: 'talim', label: 'Ta’lim', emoji: '📚', tagline: 'Daftar chiziqlari, kitob va lampochka', light: ['#f7f4ec', '#ece6d6'], dark: ['#1d2a3a', '#101a26'] },
  { id: 'matematika', label: 'Matematika', emoji: '📐', tagline: 'Koordinata to‘ri, formulalar va shakllar', light: ['#f3f6fb', '#e3e9f3'], dark: ['#152238', '#0d1626'] },
  { id: 'fizika', label: 'Fizika', emoji: '⚛️', tagline: 'To‘lqinlar, orbitalar va qonunlar', light: ['#f1f7f7', '#dfeaea'], dark: ['#122a2f', '#0b1a1e'] },
  { id: 'kimyo', label: 'Kimyo', emoji: '🧪', tagline: 'Olti burchakli halqalar va molekulalar', light: ['#f4f8f2', '#e2ecdc'], dark: ['#182b1f', '#0e1a13'] },
  { id: 'biologiya', label: 'Biologiya', emoji: '🌿', tagline: 'Barglar, hujayralar va DNK', light: ['#f4f8f0', '#e0ebd6'], dark: ['#15281b', '#0c1810'] },
  { id: 'geografiya', label: 'Geografiya', emoji: '🌍', tagline: 'Globus to‘ri va relef chiziqlari', light: ['#f2f7f9', '#dfeaef'], dark: ['#122634', '#0a1722'] },
  { id: 'tarix', label: 'Tarix', emoji: '🏛️', tagline: 'Ustunlar, ravoq va vaqt chizig‘i', light: ['#f8f3ea', '#ecdfc9'], dark: ['#2b2117', '#1a140d'] },
  { id: 'tillar', label: 'Tillar va adabiyot', emoji: '💬', tagline: 'Harflar, qo‘shtirnoq va kitob varaqlari', light: ['#f8f4f2', '#eddfd9'], dark: ['#2a1d24', '#1a1116'] },
  { id: 'informatika', label: 'Informatika', emoji: '💻', tagline: 'Kod qavslari, tugunlar va bitlar', light: ['#f2f5f9', '#dde4ee'], dark: ['#0f1c2c', '#0a1220'] },
  { id: 'institut', label: 'Institut / OTM', emoji: '🎓', tagline: 'Ustunli bino, lavr va diplom', light: ['#f6f4f8', '#e6e1ee'], dark: ['#231d33', '#151022'] },
  { id: 'boshlangich', label: 'Boshlang‘ich sinf', emoji: '🎈', tagline: 'Yulduzlar, konfetti va yumaloq shakllar', light: ['#fff8ee', '#ffe9d1'], dark: ['#2a2140', '#1a1430'] },
  { id: 'minimal', label: 'Sodda', emoji: '◻️', tagline: 'Faqat yumshoq gradient va nuqtalar', light: ['#f8f8f6', '#ebebe7'], dark: ['#1f2430', '#141821'] },
];
export const BACKGROUND_THEMES = Object.freeze(THEMES.map(theme => Object.freeze({ id: theme.id, label: theme.label, emoji: theme.emoji, tagline: theme.tagline })));

const ACCENT_HEX = { cyan: '#4bb7c5', blue: '#4f7fd6', violet: '#8e6fd0', green: '#5aa870', amber: '#d6a23f' };

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hexToRgb(hex) { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); const n = m ? parseInt(m[1], 16) : 0x4f7fd6; return [n >> 16, (n >> 8) & 255, n & 255]; }
const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };

function base(ctx, colors) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Yumshoq yorug'lik dog'i — yassi tekislik bo'lmasin
  const glow = ctx.createRadialGradient(W * 0.78, H * 0.18, 40, W * 0.78, H * 0.18, 700);
  glow.addColorStop(0, 'rgba(255,255,255,0.18)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}
function dotGrid(ctx, ink, alpha, step = 48) { ctx.fillStyle = rgba(ink, alpha); for (let x = step; x < W; x += step) for (let y = step; y < H; y += step) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); } }
function lineGrid(ctx, ink, alpha, step = 60, both = true) { ctx.strokeStyle = rgba(ink, alpha); ctx.lineWidth = 1; ctx.beginPath(); for (let y = step; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); } if (both) for (let x = step; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } ctx.stroke(); }
function glyphs(ctx, r, list, count, ink, alpha, min = 34, max = 110, weight = '400') {
  for (let i = 0; i < count; i += 1) {
    const size = min + r() * (max - min);
    ctx.save(); ctx.translate(r() * W, r() * H); ctx.rotate((r() - 0.5) * 0.6);
    ctx.font = `${weight} ${size}px "Segoe UI", Inter, Arial, sans-serif`; ctx.fillStyle = rgba(ink, alpha * (0.5 + r() * 0.5)); ctx.textBaseline = 'middle';
    ctx.fillText(list[Math.floor(r() * list.length)], 0, 0); ctx.restore();
  }
}
function ring(ctx, x, y, radius, ink, alpha, width = 2) { ctx.strokeStyle = rgba(ink, alpha); ctx.lineWidth = width; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); }
function hexagon(ctx, x, y, radius, ink, alpha, width = 2) { ctx.strokeStyle = rgba(ink, alpha); ctx.lineWidth = width; ctx.beginPath(); for (let k = 0; k < 6; k += 1) { const a = Math.PI / 6 + k * Math.PI / 3; const px = x + radius * Math.cos(a), py = y + radius * Math.sin(a); if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.stroke(); }
function wave(ctx, y, amplitude, period, ink, alpha, width = 2.5, phase = 0) { ctx.strokeStyle = rgba(ink, alpha); ctx.lineWidth = width; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 6) { const yy = y + Math.sin((x / period) * Math.PI * 2 + phase) * amplitude; if (x === -20) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); } ctx.stroke(); }
function leaf(ctx, x, y, size, angle, ink, alpha) { ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = rgba(ink, alpha); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(size * 0.55, -size * 0.45, size, 0); ctx.quadraticCurveTo(size * 0.55, size * 0.45, 0, 0); ctx.fill(); ctx.strokeStyle = rgba(ink, alpha * 1.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, 0); ctx.stroke(); ctx.restore(); }
function star(ctx, x, y, radius, ink, alpha) { ctx.fillStyle = rgba(ink, alpha); ctx.beginPath(); for (let k = 0; k < 10; k += 1) { const a = -Math.PI / 2 + k * Math.PI / 5; const rr = k % 2 ? radius * 0.45 : radius; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } ctx.closePath(); ctx.fill(); }
function columnBuilding(ctx, x, y, width, height, ink, alpha) {
  ctx.strokeStyle = rgba(ink, alpha); ctx.fillStyle = rgba(ink, alpha * 0.35); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - width * 0.08, y); ctx.lineTo(x + width / 2, y - height * 0.32); ctx.lineTo(x + width * 1.08, y); ctx.closePath(); ctx.fill(); ctx.stroke(); // peshtoq
  ctx.fillRect(x - width * 0.05, y, width * 1.1, height * 0.07);
  const cols = 6, gap = width / cols;
  for (let k = 0; k < cols; k += 1) { const cx = x + gap * (k + 0.5); ctx.fillRect(cx - gap * 0.16, y + height * 0.09, gap * 0.32, height * 0.62); }
  ctx.fillRect(x - width * 0.08, y + height * 0.72, width * 1.16, height * 0.08);
  ctx.fillRect(x - width * 0.12, y + height * 0.8, width * 1.24, height * 0.08);
}
function graduationCap(ctx, x, y, size, ink, alpha) { ctx.fillStyle = rgba(ink, alpha); ctx.beginPath(); ctx.moveTo(x, y - size * 0.35); ctx.lineTo(x + size, y); ctx.lineTo(x, y + size * 0.35); ctx.lineTo(x - size, y); ctx.closePath(); ctx.fill(); ctx.fillRect(x - size * 0.45, y + size * 0.1, size * 0.9, size * 0.28); ctx.strokeStyle = rgba(ink, alpha * 1.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + size * 0.9, y + size * 0.05); ctx.lineTo(x + size * 0.95, y + size * 0.6); ctx.stroke(); }
function bubble(ctx, x, y, w, h, ink, alpha) { ctx.strokeStyle = rgba(ink, alpha); ctx.lineWidth = 2.5; const r = Math.min(w, h) * 0.3; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.lineTo(x + w * 0.3, y + h); ctx.lineTo(x + w * 0.18, y + h + h * 0.28); ctx.lineTo(x + w * 0.16, y + h); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.stroke(); }

const DRAW = {
  talim(ctx, r, ink, accent) {
    lineGrid(ctx, ink, 0.09, 56, false);
    ctx.strokeStyle = rgba(accent, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(120, 0); ctx.lineTo(120, H); ctx.stroke(); // daftar chizig'i
    // ochiq kitob
    ctx.strokeStyle = rgba(ink, 0.22); ctx.fillStyle = rgba(ink, 0.05); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(1120, 660); ctx.quadraticCurveTo(1290, 610, 1440, 660); ctx.lineTo(1440, 820); ctx.quadraticCurveTo(1290, 770, 1120, 820); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1440, 660); ctx.quadraticCurveTo(1590, 610, 1760, 660); ctx.lineTo(1760, 820); ctx.quadraticCurveTo(1590, 770, 1440, 820); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let k = 1; k <= 3; k += 1) { ctx.beginPath(); ctx.moveTo(1160, 690 + k * 32); ctx.quadraticCurveTo(1290, 645 + k * 32, 1410, 690 + k * 32); ctx.stroke(); }
    // lampochka
    ring(ctx, 1380, 220, 80, accent, 0.45, 4); ctx.fillStyle = rgba(accent, 0.12); ctx.beginPath(); ctx.arc(1380, 220, 80, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.45); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1352, 300); ctx.lineTo(1408, 300); ctx.moveTo(1358, 322); ctx.lineTo(1402, 322); ctx.stroke();
    glyphs(ctx, r, ['A', 'B', '∑', '1', '2', '?', '!', 'a', 'b'], 14, ink, 0.07, 40, 120, '600');
  },
  matematika(ctx, r, ink, accent) {
    lineGrid(ctx, ink, 0.1, 64);
    ctx.strokeStyle = rgba(accent, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 640); ctx.lineTo(W, 640); ctx.moveTo(1216, 0); ctx.lineTo(1216, H); ctx.stroke();
    // parabola va sinus
    ctx.strokeStyle = rgba(accent, 0.55); ctx.lineWidth = 4; ctx.beginPath(); for (let x = 900; x <= 1540; x += 8) { const t = (x - 1216) / 180; const y = 640 - t * t * 110; if (x === 900) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
    wave(ctx, 640, 60, 320, ink, 0.18, 2.5, 1.2);
    ring(ctx, 300, 250, 120, ink, 0.18, 2.5); ctx.strokeStyle = rgba(ink, 0.18); ctx.beginPath(); ctx.moveTo(300, 250); ctx.lineTo(420, 250); ctx.lineTo(300, 130); ctx.stroke();
    glyphs(ctx, r, ['∑', '∫', 'π', '√', '∞', 'x²', '≠', '≈', 'Δ', 'θ', 'sin', 'lim', '½', '∂'], 24, ink, 0.11, 36, 120, '500');
  },
  fizika(ctx, r, ink, accent) {
    dotGrid(ctx, ink, 0.14, 44);
    for (let k = 0; k < 4; k += 1) wave(ctx, 250 + k * 150, 26 + k * 8, 260 + k * 60, k % 2 ? accent : ink, 0.2, 2.5, k);
    // atom orbitalari
    ctx.save(); ctx.translate(1290, 260);
    for (let k = 0; k < 3; k += 1) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.strokeStyle = rgba(accent, 0.45); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 180, 62, 0, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = rgba(accent, 0.8); ctx.beginPath(); ctx.arc(180, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = rgba(ink, 0.5); ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    glyphs(ctx, r, ['F=ma', 'E=mc²', 'λ', 'Ω', 'ν', 'ΔE', 'v=s/t', 'μ', 'Ф', 'W'], 16, ink, 0.11, 34, 96, '500');
  },
  kimyo(ctx, r, ink, accent) {
    dotGrid(ctx, ink, 0.1, 52);
    const pts = [];
    for (let i = 0; i < 14; i += 1) { const x = 60 + r() * (W - 120), y = 60 + r() * (H - 120); pts.push([x, y]); }
    ctx.strokeStyle = rgba(ink, 0.16); ctx.lineWidth = 2; for (let i = 0; i < pts.length; i += 1) for (let j = i + 1; j < pts.length; j += 1) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < 330) { ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[j]); ctx.stroke(); } }
    for (const [x, y] of pts) { ctx.fillStyle = rgba(accent, 0.55); ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill(); }
    for (let k = 0; k < 7; k += 1) hexagon(ctx, 1120 + (k % 3) * 150 + (Math.floor(k / 3) % 2) * 75, 520 + Math.floor(k / 3) * 130, 78, accent, 0.4, 3);
    glyphs(ctx, r, ['H₂O', 'CO₂', 'NaCl', 'pH', 'Fe', 'O₂', 'C₆H₁₂O₆', 'mol', 'H⁺'], 14, ink, 0.11, 32, 88, '500');
  },
  biologiya(ctx, r, ink, accent) {
    for (let i = 0; i < 26; i += 1) leaf(ctx, r() * W, r() * H, 60 + r() * 120, r() * Math.PI * 2, accent, 0.11);
    // DNK
    ctx.save(); ctx.translate(1300, 0);
    for (let y = 40; y < H - 40; y += 14) { const a = y / 70; const x1 = Math.sin(a) * 90, x2 = Math.sin(a + Math.PI) * 90; ctx.strokeStyle = rgba(ink, 0.22); ctx.lineWidth = 2; if (Math.round(y / 14) % 3 === 0) { ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); } ctx.fillStyle = rgba(accent, 0.6); ctx.beginPath(); ctx.arc(x1, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = rgba(ink, 0.35); ctx.beginPath(); ctx.arc(x2, y, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    for (let k = 0; k < 4; k += 1) { const x = 200 + r() * 700, y = 150 + r() * 600, rad = 60 + r() * 60; ring(ctx, x, y, rad, ink, 0.18, 2.5); ring(ctx, x + rad * 0.15, y - rad * 0.1, rad * 0.35, ink, 0.22, 2); }
  },
  geografiya(ctx, r, ink, accent) {
    // globus to'ri
    ctx.save(); ctx.translate(1240, 470); ctx.strokeStyle = rgba(accent, 0.45); ctx.lineWidth = 2.5;
    for (let k = -3; k <= 3; k += 1) { ctx.beginPath(); ctx.ellipse(0, 0, 340, Math.abs(k) * 100 + 10, 0, 0, Math.PI * 2); ctx.stroke(); }
    for (let k = 0; k < 6; k += 1) { ctx.beginPath(); ctx.ellipse(0, 0, Math.max(4, 340 - k * 62), 340, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // relef chiziqlari
    ctx.strokeStyle = rgba(ink, 0.16); ctx.lineWidth = 2;
    for (let k = 0; k < 7; k += 1) { ctx.beginPath(); for (let x = 0; x <= 760; x += 10) { const y = 660 + k * 28 + Math.sin(x / 90 + k) * 22 + Math.cos(x / 40) * 6; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
    // kompas
    ctx.save(); ctx.translate(260, 220); ring(ctx, 0, 0, 90, ink, 0.25, 3); ctx.fillStyle = rgba(accent, 0.55); ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(16, 0); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = rgba(ink, 0.35); ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(16, 0); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    glyphs(ctx, r, ['N', 'S', 'E', 'W', '°', '45°', 'km'], 10, ink, 0.1, 30, 80, '600');
  },
  tarix(ctx, r, ink, accent) {
    lineGrid(ctx, ink, 0.06, 80, false);
    columnBuilding(ctx, 1080, 430, 420, 380, ink, 0.28);
    // vaqt chizig'i
    ctx.strokeStyle = rgba(accent, 0.5); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, 180); ctx.lineTo(900, 180); ctx.stroke();
    for (let k = 0; k < 6; k += 1) { const x = 120 + k * 150; ctx.fillStyle = rgba(accent, 0.75); ctx.beginPath(); ctx.arc(x, 180, 11, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = rgba(ink, 0.2); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 200); ctx.lineTo(x, 240); ctx.stroke(); }
    glyphs(ctx, r, ['I', 'II', 'III', 'IV', 'V', 'X', 'MCM', 'VII', 'XX'], 14, ink, 0.09, 40, 120, '600');
  },
  tillar(ctx, r, ink, accent) {
    dotGrid(ctx, ink, 0.1, 60);
    bubble(ctx, 1080, 130, 320, 170, accent, 0.5); bubble(ctx, 1240, 380, 260, 140, ink, 0.25);
    ctx.font = '700 260px Georgia, "Times New Roman", serif'; ctx.fillStyle = rgba(accent, 0.18); ctx.fillText('“', 90, 360); ctx.fillText('”', 1340, 860);
    glyphs(ctx, r, ['A', 'a', 'B', 'Ё', 'Ж', 'Ñ', 'Ö', 'Ğ', 'Ş', 'Q', 'Ў', 'Ғ', 'ə', 'Я', 'W', 'th'], 30, ink, 0.1, 36, 130, '500');
  },
  informatika(ctx, r, ink, accent) {
    lineGrid(ctx, ink, 0.08, 40);
    // sxema chiziqlari
    ctx.strokeStyle = rgba(accent, 0.45); ctx.lineWidth = 3;
    for (let k = 0; k < 9; k += 1) { let x = 60 + r() * 600, y = 500 + r() * 340; ctx.beginPath(); ctx.moveTo(x, y); for (let s = 0; s < 4; s += 1) { if (r() > 0.5) x += 60 + r() * 160; else y += (r() > 0.5 ? 1 : -1) * (40 + r() * 80); ctx.lineTo(x, y); } ctx.stroke(); ctx.fillStyle = rgba(accent, 0.7); ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = '600 44px ui-monospace, Consolas, monospace'; ctx.fillStyle = rgba(ink, 0.1);
    for (let k = 0; k < 7; k += 1) { let bits = ''; for (let b = 0; b < 26; b += 1) bits += r() > 0.5 ? '1' : '0'; ctx.fillText(bits, 980 + (k % 2) * 30, 120 + k * 64); }
    glyphs(ctx, r, ['{ }', '</>', ';', '=>', 'if', 'for', '[ ]', '&&', 'def', '#'], 18, ink, 0.12, 36, 110, '600');
  },
  institut(ctx, r, ink, accent) {
    lineGrid(ctx, ink, 0.06, 72, false);
    columnBuilding(ctx, 1040, 400, 480, 420, ink, 0.3);
    graduationCap(ctx, 300, 260, 130, accent, 0.5);
    // lavr shoxchalari
    for (const side of [-1, 1]) { ctx.save(); ctx.translate(300, 470); ctx.scale(side, 1); for (let k = 0; k < 6; k += 1) { leaf(ctx, 30 + k * 34, 40 - k * 22, 46, -0.9 + k * 0.08, accent, 0.28); } ctx.restore(); }
    // diplom
    ctx.strokeStyle = rgba(ink, 0.22); ctx.lineWidth = 3; ctx.fillStyle = rgba(ink, 0.05); ctx.fillRect(560, 640, 300, 190); ctx.strokeRect(560, 640, 300, 190); for (let k = 0; k < 4; k += 1) { ctx.beginPath(); ctx.moveTo(600, 690 + k * 32); ctx.lineTo(820 - (k === 3 ? 100 : 0), 690 + k * 32); ctx.stroke(); }
    ring(ctx, 800, 800, 24, accent, 0.6, 4);
  },
  boshlangich(ctx, r, ink, accent) {
    const palette = [accent, '#f28c6a', '#f2c14e', '#6fb1e3', '#9bcf6e', '#c98bd6'];
    for (let i = 0; i < 40; i += 1) { const c = palette[Math.floor(r() * palette.length)]; const x = r() * W, y = r() * H, s = 14 + r() * 40; const kind = r(); if (kind < 0.35) star(ctx, x, y, s, c, 0.35); else if (kind < 0.7) { ctx.fillStyle = rgba(c, 0.3); ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0, Math.PI * 2); ctx.fill(); } else { ctx.save(); ctx.translate(x, y); ctx.rotate(r() * Math.PI); ctx.fillStyle = rgba(c, 0.3); ctx.fillRect(-s * 0.5, -s * 0.18, s, s * 0.36); ctx.restore(); } }
    glyphs(ctx, r, ['A', 'B', '1', '2', '3', '+', '=', '★', '♥'], 16, ink, 0.09, 50, 140, '800');
  },
  minimal(ctx, r, ink, accent) {
    dotGrid(ctx, ink, 0.12, 52);
    ctx.fillStyle = rgba(accent, 0.12); ctx.beginPath(); ctx.arc(1420, 160, 300, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(accent, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(1420, 160, 380, 0, Math.PI * 2); ctx.stroke();
  },
};

const cache = new Map();

/** @returns {Promise<string>} JPEG data URL, yoki xato — chaqiruvchi tutadi. */
export function renderBackground(themeId, { mode = 'light', accent = 'blue', width = W, height = H } = {}) {
  const theme = THEMES.find(item => item.id === themeId) || THEMES[0];
  const key = `${theme.id}|${mode}|${accent}|${width}x${height}`;
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas mavjud emas');
      ctx.save(); ctx.scale(width / W, height / H);
      const colors = mode === 'dark' ? theme.dark : theme.light;
      const ink = mode === 'dark' ? '#e8eef8' : '#1f2a37';
      base(ctx, colors);
      DRAW[theme.id](ctx, rng(theme.id.length * 977 + (mode === 'dark' ? 13 : 7)), ink, ACCENT_HEX[accent] || ACCENT_HEX.blue);
      ctx.restore();
      const url = canvas.toDataURL('image/jpeg', width >= W ? 0.86 : 0.7);
      if (!url.startsWith('data:image/jpeg;base64,')) throw new Error('Fon rasmi tayyorlanmadi');
      cache.set(key, url); resolve(url);
    } catch (error) { reject(error); }
  });
}

/** Fanning nomidan mos mavzuni taxmin qiladi — "Fan" maydoni to'ldirilganda avtomatik tavsiya. */
export function suggestTheme(subject = '', audience = '') {
  const text = `${subject} ${audience}`.toLowerCase();
  const rules = [
    [/matem|algebra|geometr|bmkn|arifmet/, 'matematika'], [/fizik/, 'fizika'], [/kimy|ximi/, 'kimyo'], [/biolog|botan|zoolog|anatom/, 'biologiya'],
    [/geograf|iqlim|xarita/, 'geografiya'], [/tarix|histor/, 'tarix'], [/informat|dastur|kompyut|it\b|axborot/, 'informatika'],
    [/til|adabiyot|ingliz|rus|english|nemis|fransuz|arab|grammat|lingv/, 'tillar'], [/kurs|magistr|bakalavr|talaba|institut|universitet|otm|pedagog/, 'institut'],
    [/1-sinf|2-sinf|3-sinf|4-sinf|boshlang|bolalar|bog‘cha|bogcha/, 'boshlangich'],
  ];
  for (const [pattern, id] of rules) if (pattern.test(text)) return id;
  return 'talim';
}
