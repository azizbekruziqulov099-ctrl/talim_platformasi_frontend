// REV255: 11 tilning Kabusi — saytdagi Kabu (SVG) asosida: rang, quloq, antenna, qanot, ko'krakda bayroq, naqsh tasmasi
import { KIYIM, BOSH } from './kabuKiyim.js';
import { KABU_MARKUP } from './robotKabuMarkup.js';
const BASE = { teal1: '#45E1D1', teal2: '#159C8F', teal3: '#2EC4B6', teal4: '#11897D', y1: '#FFB703', y2: '#E39A00', y3: '#FFD166', y4: '#F59E0B', eye: '#6FF7EA', wing2: '#C6E4FF', wingS: '#B3CFEA' };
const flagSvg = (t) => {   // ko'krak doirasi (160,262 r=23) ichida
  const x = 136, y = 246, w = 48, h = 32, R = (X, Y, W, Hh, f) => `<rect x="${X}" y="${Y}" width="${W}" height="${Hh}" fill="${f}"/>`;
  const st = (cx, cy, r, f, n = 5) => { let p = []; for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * .42 : r, a = (-90 + i * 180 / n) * Math.PI / 180; p.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(' ')}" fill="${f}"/>`; };
  const F = {
    uz: R(x, y, w, h / 3, '#1EB5E5') + R(x, y + h / 3, w, h / 3, '#fff') + R(x, y + 2 * h / 3, w, h / 3, '#1EB53A') + R(x, y + h / 3 - 1, w, 1.4, '#CE1126') + R(x, y + 2 * h / 3 - .4, w, 1.4, '#CE1126') + `<circle cx="${x + 7}" cy="${y + 5.3}" r="3.6" fill="#fff"/><circle cx="${x + 8.4}" cy="${y + 5.3}" r="3.2" fill="#1EB5E5"/>` + [0, 1, 2, 3].map((k) => `<circle cx="${x + 16 + k * 3.4}" cy="${y + 4}" r=".9" fill="#fff"/><circle cx="${x + 17.6 + k * 3.4}" cy="${y + 7}" r=".9" fill="#fff"/>`).join(''),
    ru: R(x, y, w, h / 3, '#fff') + R(x, y + h / 3, w, h / 3, '#0039A6') + R(x, y + 2 * h / 3, w, h / 3, '#D52B1E'),
    de: R(x, y, w, h / 3, '#000') + R(x, y + h / 3, w, h / 3, '#DD0000') + R(x, y + 2 * h / 3, w, h / 3, '#FFCE00'),
    fr: R(x, y, w / 3, h, '#0055A4') + R(x + w / 3, y, w / 3, h, '#fff') + R(x + 2 * w / 3, y, w / 3, h, '#EF4135'),
    es: R(x, y, w, h, '#AA151B') + R(x, y + h / 4, w, h / 2, '#F1BF00'),
    en: R(x, y, w, h, '#012169') + `<path d="M${x},${y} L${x + w},${y + h} M${x + w},${y} L${x},${y + h}" stroke="#fff" stroke-width="6"/><path d="M${x},${y} L${x + w},${y + h} M${x + w},${y} L${x},${y + h}" stroke="#C8102E" stroke-width="2"/>` + R(x + w / 2 - 4, y, 8, h, '#fff') + R(x, y + h / 2 - 4, w, 8, '#fff') + R(x + w / 2 - 2, y, 4, h, '#C8102E') + R(x, y + h / 2 - 2, w, 4, '#C8102E'),
    tr: R(x, y, w, h, '#E30A17') + `<circle cx="${x + 18}" cy="${y + 16}" r="8" fill="#fff"/><circle cx="${x + 20.5}" cy="${y + 16}" r="6.4" fill="#E30A17"/>` + st(x + 29, y + 16, 4.4, '#fff'),
    zh: R(x, y, w, h, '#DE2910') + st(x + 9, y + 9, 5.5, '#FFDE00') + st(x + 18, y + 4, 1.8, '#FFDE00') + st(x + 21, y + 8, 1.8, '#FFDE00') + st(x + 21, y + 13, 1.8, '#FFDE00') + st(x + 18, y + 17, 1.8, '#FFDE00'),
    ja: R(x, y, w, h, '#fff') + `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="9.5" fill="#BC002D"/>`,
    ko: R(x, y, w, h, '#fff') + `<path d="M${x + 15},${y + 16} a9,9 0 0 1 18,0 z" fill="#CD2E3A"/><path d="M${x + 15},${y + 16} a9,9 0 0 0 18,0 z" fill="#0047A0"/>` + [0, 1, 2].map((k) => R(x + 4, y + 9 + k * 3, 6, 1.6, '#000') + R(x + 38, y + 9 + k * 3, 6, 1.6, '#000')).join(''),
    ar: R(x, y, w, h, '#007A3D') + `<g fill="#fff" transform="translate(${x + w / 2},${y + h / 2})"><rect x="-7" y="-7" width="14" height="14"/><rect x="-7" y="-7" width="14" height="14" transform="rotate(45)"/></g><circle cx="${x + w / 2}" cy="${y + h / 2}" r="3.2" fill="#007A3D"/>`,
  };
  return `<defs><clipPath id="kFlagC-${t}"><circle cx="160" cy="262" r="23"/></clipPath></defs><g clip-path="url(#kFlagC-${t})">${F[t]}</g>`;
};
// naqsh tasmasi (tana pastida), tana yo'li bilan qirqiladi
const BODY_PATH = 'M112,204 H208 Q228,204 229,224 L231,258 Q233,298 202,313 Q183,322 160,322 Q137,322 118,313 Q87,298 89,258 L91,224 Q92,204 112,204 Z';
const band = (t, a, b) => {
  const y = 292, items = [];
  for (let k = 0; k < 12; k++) {
    const x = 92 + k * 12;
    items.push({
      uz: `<path d="M${x},${y + 6} L${x + 6},${y} L${x + 12},${y + 6} L${x + 6},${y + 12} Z" fill="${['#E8A33D', '#C0392B', '#fff'][k % 3]}"/>`,
      ru: `<circle cx="${x + 6}" cy="${y + 6}" r="3.6" fill="#fff"/><circle cx="${x + 6}" cy="${y + 6}" r="1.6" fill="${a}"/>`,
      en: k % 2 ? `<rect x="${x}" y="${y}" width="6" height="6" fill="${b}"/><rect x="${x + 6}" y="${y + 6}" width="6" height="6" fill="${b}"/>` : `<rect x="${x + 6}" y="${y}" width="6" height="6" fill="#fff"/><rect x="${x}" y="${y + 6}" width="6" height="6" fill="#fff"/>`,
      de: `<rect x="${x}" y="${y + 4}" width="12" height="4" fill="${b}"/>`,
      fr: `<rect x="${x + 4}" y="${y}" width="4" height="12" fill="#fff"/>`,
      es: `<circle cx="${x + 6}" cy="${y + 6}" r="3" fill="${b}"/>`,
      ar: `<g transform="translate(${x + 6},${y + 6})" fill="${b}"><rect x="-3.4" y="-3.4" width="6.8" height="6.8"/><rect x="-3.4" y="-3.4" width="6.8" height="6.8" transform="rotate(45)"/></g>`,
      tr: `<circle cx="${x + 6}" cy="${y + 6}" r="4.6" fill="#1E6FB8"/><circle cx="${x + 6}" cy="${y + 6}" r="2.6" fill="#fff"/><circle cx="${x + 6}" cy="${y + 6}" r="1.2" fill="#123"/>`,
      zh: `<path d="M${x},${y + 10} q3,-8 6,0 q3,-8 6,0" fill="none" stroke="${b}" stroke-width="1.8"/>`,
      ja: `<path d="M${x},${y + 9} q6,-9 12,0" fill="none" stroke="#fff" stroke-width="1.8"/>`,
      ko: `<rect x="${x}" y="${y}" width="12" height="12" fill="${['#0B7A75', '#CD2E3A', '#F2C14E', '#0047A0'][k % 4]}"/>`,
    }[t]);
  }
  return `<defs><clipPath id="kBandC-${t}"><path d="${BODY_PATH}"/></clipPath></defs><g clip-path="url(#kBandC-${t})"><rect x="88" y="${y}" width="146" height="12" fill="${a}"/>${items.join('')}</g>`;
};
// quloqlar (66,126 va 254,126)
const ear = (t, cx, a, b, side) => {
  const cy = 126;
  const petals = (n, r, rr, f, c2) => Array.from({ length: n }, (_, k) => { const an = (k * 360 / n - 90) * Math.PI / 180; return `<circle cx="${(cx + Math.cos(an) * r).toFixed(1)}" cy="${(cy + Math.sin(an) * r).toFixed(1)}" r="${rr}" fill="${f}"/>`; }).join('') + `<circle cx="${cx}" cy="${cy}" r="${rr * .8}" fill="${c2}"/>`;
  return {
    uz: `<circle cx="${cx}" cy="${cy}" r="22" fill="${a}" stroke="#0F6E56" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="12" fill="${b}"/><path d="M${cx - 8},${cy} L${cx},${cy - 8} L${cx + 8},${cy} L${cx},${cy + 8} Z" fill="#fff"/>`,
    ru: petals(6, 13, 10, a, '#fff'),
    en: `<rect x="${cx - 18}" y="${cy - 22}" width="36" height="44" rx="10" fill="${a}" stroke="#14284A" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="8" fill="${b}"/>`,
    de: `<polygon points="${Array.from({ length: 6 }, (_, k) => { const an = (k * 60) * Math.PI / 180; return `${(cx + Math.cos(an) * 22).toFixed(1)},${(cy + Math.sin(an) * 22).toFixed(1)}`; }).join(' ')}" fill="${a}" stroke="${b}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="7" fill="${b}"/>`,
    fr: `<circle cx="${cx}" cy="${cy}" r="22" fill="#fff" stroke="${a}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="13" fill="${a}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${b}"/>`,
    es: `<path d="M${cx},${cy + 16} L${cx + side * -2},${cy - 26} A26,26 0 0 ${side > 0 ? 1 : 0} ${cx + side * 24},${cy + 4} Z" fill="${b}" stroke="${a}" stroke-width="3"/>`,
    ar: `<g transform="translate(${cx},${cy})"><rect x="-17" y="-17" width="34" height="34" fill="${b}"/><rect x="-17" y="-17" width="34" height="34" fill="${b}" transform="rotate(45)"/><circle r="10" fill="${a}"/></g>`,
    tr: `<path d="M${cx - 15},${cy + 16} L${cx - 18},${cy - 14} L${cx - 6},${cy - 4} L${cx},${cy - 22} L${cx + 6},${cy - 4} L${cx + 18},${cy - 14} L${cx + 15},${cy + 16} Z" fill="${a}" stroke="#9A0710" stroke-width="2"/>`,
    zh: `<circle cx="${cx - 8}" cy="${cy + 5}" r="13" fill="${b}" stroke="${a}" stroke-width="3"/><circle cx="${cx + 8}" cy="${cy + 5}" r="13" fill="${b}" stroke="${a}" stroke-width="3"/><circle cx="${cx}" cy="${cy - 8}" r="14" fill="${b}" stroke="${a}" stroke-width="3"/>`,
    ja: petals(5, 12, 10, '#FFB7C5', b),
    ko: `<circle cx="${cx}" cy="${cy}" r="22" fill="#fff" stroke="#0047A0" stroke-width="3"/><path d="M${cx - 13},${cy} a13,13 0 0 1 26,0 z" fill="#CD2E3A"/><path d="M${cx - 13},${cy} a13,13 0 0 0 26,0 z" fill="#0047A0"/>`,
  }[t];
};
// antenna uchi (160,22)
const top = (t, a, b) => ({
  uz: `<circle cx="160" cy="22" r="10" fill="${b}" stroke="#B7791F" stroke-width="2"/><circle cx="156.5" cy="18.5" r="3" fill="#fff" opacity=".85"/>`,
  ru: `<path d="M148,26 Q148,8 160,4 Q172,8 172,26 Z" fill="${a}"/><path d="M160,4 L160,-6" stroke="#E8A33D" stroke-width="3"/><circle cx="160" cy="-7" r="3" fill="#E8A33D"/>`,
  en: `<rect x="149" y="12" width="22" height="20" rx="4" fill="${b}"/><circle cx="160" cy="22" r="5" fill="#fff"/>`,
  de: `<rect x="145" y="16" width="30" height="10" rx="5" fill="${b}"/>`,
  fr: `<path d="M160,32 C146,22 147,10 155,10 C158,10 160,13 160,15 C160,13 162,10 165,10 C173,10 174,22 160,32 Z" fill="${b}"/>`,
  es: Array.from({ length: 8 }, (_, k) => { const an = k * 45 * Math.PI / 180; return `<line x1="160" y1="22" x2="${(160 + Math.cos(an) * 15).toFixed(1)}" y2="${(22 + Math.sin(an) * 15).toFixed(1)}" stroke="${b}" stroke-width="4" stroke-linecap="round"/>`; }).join('') + `<circle cx="160" cy="22" r="8" fill="${b}"/>`,
  ar: `<path d="M160,8 A14,14 0 1 0 172,30 A11,11 0 1 1 160,8 Z" fill="${b}"/>`,
  tr: `<path d="M160,8 A14,14 0 1 0 172,30 A11,11 0 1 1 160,8 Z" fill="#fff" stroke="${a}" stroke-width="2"/>`,
  zh: `<rect x="149" y="8" width="22" height="26" rx="10" fill="#E63946" stroke="${b}" stroke-width="2"/><line x1="149" y1="21" x2="171" y2="21" stroke="${b}" stroke-width="2"/><line x1="160" y1="34" x2="160" y2="40" stroke="${b}" stroke-width="2"/>`,
  ja: Array.from({ length: 5 }, (_, k) => { const an = (k * 72 - 90) * Math.PI / 180; return `<circle cx="${(160 + Math.cos(an) * 8).toFixed(1)}" cy="${(22 + Math.sin(an) * 8).toFixed(1)}" r="7" fill="#FFB7C5"/>`; }).join('') + `<circle cx="160" cy="22" r="4" fill="${b}"/>`,
  ko: `<circle cx="160" cy="22" r="11" fill="#fff"/><path d="M149,22 a11,11 0 0 1 22,0 z" fill="#CD2E3A"/><path d="M149,22 a11,11 0 0 0 22,0 z" fill="#0047A0"/>`,
}[t]);
// quloq-qanotchalar — bayroq ranglarida (uchta pat: yuqori, o'rta, past)
const BAYROQ_RANG = { uz: ['#1EB5E5', '#FFFFFF', '#1EB53A'], ru: ['#FFFFFF', '#0039A6', '#D52B1E'], en: ['#012169', '#FFFFFF', '#C8102E'],
  de: ['#1B1B1B', '#DD0000', '#FFCE00'], fr: ['#0055A4', '#FFFFFF', '#EF4135'], es: ['#AA151B', '#F1BF00', '#AA151B'], ar: ['#007A3D', '#FFFFFF', '#1B1B1B'],
  tr: ['#E30A17', '#FFFFFF', '#E30A17'], zh: ['#DE2910', '#FFDE00', '#DE2910'], ja: ['#FFFFFF', '#BC002D', '#FFFFFF'], ko: ['#CD2E3A', '#FFFFFF', '#0047A0'] };
const IRIS = { uz: '#1D9E75', ru: '#2E73D6', en: '#3A6EA5', de: '#7A5230', fr: '#2E73D6', es: '#8A5A2B', ar: '#2E7D4F', tr: '#7A5230', zh: '#5A3A22', ja: '#5A3A22', ko: '#5A3A22' };
const S = {
  uz: { a: '#1D9E75', a2: '#0F6E56', b: '#E8A33D', eye: '#5DF2D6', wing: '#FFE7B0', rx: 58 },
  ru: { a: '#2E5AAC', a2: '#1F3F80', b: '#9FB9E8', eye: '#9CC9FF', wing: '#DCE6F7', rx: 64 },
  en: { a: '#1F3A68', a2: '#14284A', b: '#C0392B', eye: '#FFC266', wing: '#F7DCD8', rx: 30 },
  de: { a: '#2B2B2B', a2: '#111', b: '#FFCE00', eye: '#FF6B5B', wing: '#E6E6E6', rx: 26, jet: true },
  fr: { a: '#0055A4', a2: '#003A70', b: '#EF4135', eye: '#B9E3FF', wing: '#FFFFFF', rx: 58 },
  es: { a: '#AA151B', a2: '#7A0E13', b: '#F1BF00', eye: '#FFE08A', wing: '#FFE08A', rx: 70, fan: true },
  ar: { a: '#007A3D', a2: '#00552A', b: '#D4AF37', eye: '#A6FFD8', wing: '#F3E7C2', rx: 50, dome: true },
  tr: { a: '#E30A17', a2: '#9A0710', b: '#1E6FB8', eye: '#FFD2D2', wing: '#FFE3E3', rx: 58 },
  zh: { a: '#C8102E', a2: '#8E0B20', b: '#FFD54A', eye: '#FFE7A1', wing: '#FFE7A1', rx: 58, cloud: true },
  ja: { a: '#BC002D', a2: '#8A0021', b: '#BC002D', eye: '#FFB7C5', wing: '#FFF0F3', rx: 70 },
  ko: { a: '#0047A0', a2: '#003070', b: '#CD2E3A', eye: '#FFF1A8', wing: '#E7F0FF', rx: 58 },
};
export function variant(t) {
  const s = { ...S[t], iris: IRIS[t] }; let m = KABU_MARKUP;
  // id larni noyob qilish
  for (const id of ['kShell', 'kVisor', 'kTeal', 'kWing', 'kEyeGlow']) m = m.split(`"${id}"`).join(`"${id}-${t}"`).split(`#${id})`).join(`#${id}-${t})`);
  const rep = [[BASE.teal1, s.a], [BASE.teal2, s.a2], [BASE.teal3, s.a], [BASE.teal4, s.a2], [BASE.y1, s.b], [BASE.y2, s.a2], [BASE.y3, s.b], [BASE.y4, s.b], [BASE.eye, s.eye], [BASE.wing2, s.wing], [BASE.wingS, s.a]];
  for (const [x, y] of rep) m = m.split(x).join(y).split(x.toLowerCase()).join(y);
  m = m.split('#2B3B6B').join('#3D5596').split('#111832').join('#22305C');
  // bosh shakli
  m = m.replace('rx="58" fill="url(#kShell', `rx="${s.rx}" fill="url(#kShell`);
  if (s.dome) m = m.replace('<rect x="66" y="56"', `<path d="M86,64 Q160,-6 234,64 Z" fill="url(#kShell-${t})" stroke="${s.a}" stroke-width="3"/><rect x="66" y="56"`).replace('<line x1="160" y1="60" x2="160" y2="30"', '<line x1="160" y1="30" x2="160" y2="20"');
  // quloqlar
  const qanotcha = (cx, dir) => `<g stroke="${s.a2}" stroke-width="2">${[[0, 26, 9, 10, 2], [8, 30, 10, 32, 1], [16, 28, 9, 54, 0]].map(([dy, rx, ry, rot, ci]) => `<ellipse cx="${cx + dir * 20}" cy="${128 - dy * 1.3}" rx="${rx * .95}" ry="${ry * 1.05}" transform="rotate(${-dir * rot} ${cx + dir * 20} ${128 - dy * 1.3})" fill="${BAYROQ_RANG[t][ci]}"/>`).join('')}</g><circle cx="${cx}" cy="126" r="9" fill="${s.a}" stroke="${s.a2}" stroke-width="2"/>`;
  m = m.replace(/<circle cx="66" cy="126" r="22"[^>]*\/><circle cx="66" cy="126" r="9"[^>]*\/>/, qanotcha(66, -1));
  m = m.replace(/<circle cx="254" cy="126" r="22"[^>]*\/><circle cx="254" cy="126" r="9"[^>]*\/>/, qanotcha(254, 1));
  // antenna uchi
  m = m.replace(/<circle cx="160" cy="22" r="10"[^>]*\/><circle cx="156.5" cy="18.5" r="3"[^>]*\/>/, '');   // bosh kiyim bor — antenna yo'q
  if (s.dome) m = m.replace(/<path d="M160,8 A14/, '<path transform="translate(0,-6)" d="M160,8 A14');
  // qanotlar
  if (s.jet) {
    m = m.replace(/(<svg class="kl k-wingL"[^>]*>)<g[\s\S]*?<\/g>/, `$1<rect x="20" y="78" width="26" height="50" rx="12" fill="${s.a}" stroke="${s.b}" stroke-width="3"/><path d="M24,128 L42,128 L33,140 Z" fill="#FF8A3D"/>`);
    m = m.replace(/(<svg class="kl k-wingR"[^>]*>)<g[\s\S]*?<\/g>/, `$1<rect x="274" y="78" width="26" height="50" rx="12" fill="${s.a}" stroke="${s.b}" stroke-width="3"/><path d="M278,128 L296,128 L287,140 Z" fill="#FF8A3D"/>`);
  } else if (s.fan) {
    const fan = (cx, dir) => Array.from({ length: 5 }, (_, k) => `<path d="M${cx},126 L${cx + dir * 30 * Math.cos((-70 + k * 22) * Math.PI / 180)},${126 + 30 * Math.sin((-70 + k * 22) * Math.PI / 180) - 20} L${cx + dir * 30 * Math.cos((-56 + k * 22) * Math.PI / 180)},${126 + 30 * Math.sin((-56 + k * 22) * Math.PI / 180) - 20} Z" fill="${k % 2 ? s.b : s.a}" stroke="${s.a2}" stroke-width="1"/>`).join('');
    m = m.replace(/(<svg class="kl k-wingL"[^>]*>)<g[\s\S]*?<\/g>/, `$1${fan(56, -1)}`).replace(/(<svg class="kl k-wingR"[^>]*>)<g[\s\S]*?<\/g>/, `$1${fan(264, 1)}`);
  } else if (s.cloud) {
    const cl = (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="${s.wing}" stroke="${s.a}" stroke-width="2.5"/>`;
    m = m.replace(/(<svg class="kl k-wingL"[^>]*>)<g[\s\S]*?<\/g>/, `$1${cl(40, 118)}${cl(26, 104)}${cl(38, 90)}`).replace(/(<svg class="kl k-wingR"[^>]*>)<g[\s\S]*?<\/g>/, `$1${cl(280, 118)}${cl(294, 104)}${cl(282, 90)}`);
  }
  m = m.replace(/(<svg class="kl k-wingL"[^>]*>)[\s\S]*?(<\/svg>)/, '$1$2').replace(/(<svg class="kl k-wingR"[^>]*>)[\s\S]*?(<\/svg>)/, '$1$2');
  // yoqimli ko'zlar: oq ko'z, rangli qorachiq, ikki yaltiroq nuqta (oldin — yaltiroq to'rtburchak, qo'rqinchliroq edi)
  m = m.replace(/(<svg class="kl k-eyes"[^>]*>)[\s\S]*?(<\/svg>)/, `$1${[128, 192].map((x) => `<ellipse cx="${x}" cy="121" rx="20" ry="23" fill="#FFFFFF"/><circle cx="${x + 1}" cy="124" r="14" fill="${s.iris || s.a}"/><circle cx="${x + 1}" cy="125" r="8.5" fill="#1B2733"/><circle cx="${x + 6}" cy="117" r="5" fill="#fff"/><circle cx="${x - 4}" cy="131" r="2.4" fill="#fff" opacity=".9"/>`).join('')}$2`);
  m = m.replace(/(<svg class="kl k-smile"[^>]*>)[\s\S]*?(<\/svg>)/, `$1<path d="M148,152 Q160,161 172,152" fill="none" stroke="#FFB3C7" stroke-width="5" stroke-linecap="round"/>$2`);
  // ko'krak: milliy kiyim, naqsh tasmasi, bayroq
  m = m.replace(/(<circle cx="160" cy="262" r="27"[^>]*\/>)/, `${KIYIM[t](t)}${t === 'uz' ? '' : band(t, s.a, s.b)}$1${flagSvg(t)}`);
  // milliy bosh kiyim — antenna o'rniga
  m = m.replace(/<line x1="160" y1="\d+" x2="160" y2="\d+" stroke="#2B3452" stroke-width="5" stroke-linecap="round"\/>/, '');
  m = m.replace(/(<svg class="kl k-headbase" viewBox=")38 6 244 196(")/, '$1 38 -20 244 222$2');
  m = m.replace(/(<rect x="86" y="78" width="148" height="94")/, `$1`);
  // bosh kiyim boshning ustida: headbase oxiriga
  m = m.replace(/(<ellipse cx="216" cy="153"[^>]*\/>)(<\/svg>)/, `$1${BOSH[t]}$2`);
  // antenna uchini olib tashlaymiz (bosh kiyim bor)
  m = m.replace(/<g><\/g>/, '');
  // uchish: dron parraklari (qanot o'rnida) yoki magnit maydon (pastda)
  // REV255: hammasi magnit maydonda uchadi (dron parraklari yo'q)
  return m;
}

// ism — o'sha tildagi «kabutar» so'zidan
export const KABU_ISMI = { uz: "Kabu", ru: "Голу", en: "Pidgi", de: "Taubi", fr: "Colo", es: "Palomi", ar: "Hamu", tr: "Güvi", zh: "Gege", ja: "Hatto", ko: "Bidu" };
export function kabuTuri(til = "uz") { const t = String(til || "uz").slice(0, 2); return S[t] ? t : "uz"; }
const KESH = {};
// magnit maydon halqalari (olov o'rniga) — markup oxirida
const MAGNIT = '<div class="kabu-magnit" aria-hidden="true"><i></i><i></i><i></i></div>';
export function kabuMarkup(til = "uz") {
  const t = kabuTuri(til);
  if (!KESH[t]) KESH[t] = variant(t) + MAGNIT;
  return KESH[t];
}
