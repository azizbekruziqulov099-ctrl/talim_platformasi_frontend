// Milliy bosh kiyim, kiyim va uchish usuli (olovsiz): parrak (dron) yoki magnit maydon
const BODY = 'M112,204 H208 Q228,204 229,224 L231,258 Q233,298 202,313 Q183,322 160,322 Q137,322 118,313 Q87,298 89,258 L91,224 Q92,204 112,204 Z';
const clip = (t, inner) => `<defs><clipPath id="kKiyim-${t}"><path d="${BODY}"/></clipPath></defs><g clip-path="url(#kKiyim-${t})">${inner}</g>`;
const atlas = (x0, y0, w, h) => { let s = ''; const ranglar = ['#E63946', '#F4A261', '#2A9D8F', '#6A4C93', '#FFD166', '#118AB2']; for (let k = 0; k * 10 < w; k++) { s += `<rect x="${x0 + k * 10}" y="${y0}" width="10" height="${h}" fill="${ranglar[k % 6]}"/>`; for (let j = 0; j * 14 < h; j++) s += `<path d="M${x0 + k * 10 + 5},${y0 + j * 14} l5,7 l-5,7 l-5,-7 z" fill="${ranglar[(k + 3) % 6]}" opacity=".85"/>`; } return s; };
// kiyim (tana ustida; ko'krak doirasi — bayroq — ochiq qoladi)
export const KIYIM = {
  uz: (t) => clip(t, `${atlas(86, 204, 150, 120)}<path d="M126,204 L160,258 L194,204" fill="none" stroke="#4A2C0F" stroke-width="9"/><path d="M126,204 L160,258 L194,204" fill="none" stroke="#E8A33D" stroke-width="3"/><rect x="86" y="284" width="150" height="12" fill="#1D9E75"/><path d="M86,290 H236" stroke="#FFD166" stroke-width="2" stroke-dasharray="5 4"/><rect x="86" y="316" width="150" height="10" fill="#4A2C0F"/>`),   // atlas to'n, jiyak, belbog'
  ru: (t) => clip(t, `<rect x="86" y="204" width="150" height="40" fill="#FFFFFF"/><path d="M86,236 Q160,228 236,236 V330 H86 Z" fill="#C62828"/><path d="M110,236 V330 M210,236 V330" stroke="#FFD54A" stroke-width="3"/>${[248, 268, 288].map((y) => `<circle cx="110" cy="${y}" r="3" fill="#2E5AAC"/><circle cx="210" cy="${y}" r="3" fill="#2E5AAC"/>`).join('')}<path d="M86,300 H236" stroke="#2E5AAC" stroke-width="5"/><path d="M86,300 H236" stroke="#FFD54A" stroke-width="2" stroke-dasharray="3 5"/>`),   // sarafan, naqshli bezak
  en: (t) => clip(t, `<rect x="86" y="204" width="150" height="120" fill="#C8102E"/><rect x="155" y="204" width="10" height="120" fill="#8E0B20"/>${[222, 292, 308].map((y) => `<circle cx="150" cy="${y}" r="3.5" fill="#FFD54A"/><circle cx="170" cy="${y}" r="3.5" fill="#FFD54A"/>`).join('')}<rect x="86" y="300" width="150" height="6" fill="#1B2733"/>`),   // gvardiya mundiri
  de: (t) => clip(t, `<rect x="86" y="270" width="150" height="60" fill="#6B4423"/><path d="M118,204 L128,272 M202,204 L192,272" stroke="#6B4423" stroke-width="9"/><path d="M122,240 H198" stroke="#6B4423" stroke-width="7"/><circle cx="160" cy="300" r="5" fill="#C9A227"/>`),   // charm shim, qayish
  fr: (t) => clip(t, Array.from({ length: 10 }, (_, k) => `<rect x="86" y="${206 + k * 12}" width="150" height="6" fill="#0055A4"/>`).join('') + `<path d="M138,204 Q160,226 182,204" fill="#EF4135"/><path d="M152,214 L160,232 L168,214" fill="#C62828"/>`),   // marinière, qizil sharfcha
  es: (t) => clip(t, `<path d="M86,204 H130 L138,300 H86 Z M234,204 H190 L182,300 H234 Z" fill="#1B2733"/><path d="M130,204 L138,300 M190,204 L182,300" stroke="#F1BF00" stroke-width="3"/><rect x="86" y="296" width="150" height="10" fill="#AA151B"/>`),   // bolero
  ar: (t) => clip(t, `<rect x="86" y="204" width="150" height="120" fill="#FAFAFA"/><path d="M86,204 H118 L124,330 H86 Z M236,204 H202 L196,330 H236 Z" fill="#6D4C2F"/><path d="M118,204 L124,330 M202,204 L196,330" stroke="#D4AF37" stroke-width="3"/><path d="M160,206 V244" stroke="#D4AF37" stroke-width="2"/>`),   // oq to'n va bisht (jigarrang chopon, tilla jiyak)
  tr: (t) => clip(t, `<path d="M86,204 H136 L142,320 H86 Z M234,204 H184 L178,320 H234 Z" fill="#8B1E2D"/><path d="M100,220 q8,8 0,16 q-8,8 0,16 M220,220 q-8,8 0,16 q8,8 0,16" fill="none" stroke="#FFD54A" stroke-width="2.5"/>`),   // kashtali nimcha
  zh: (t) => clip(t, `<rect x="86" y="204" width="150" height="120" fill="#B71C1C"/>${[226, 290, 306].map((y) => `<path d="M150,${y} h20" stroke="#FFD54A" stroke-width="3"/><circle cx="148" cy="${y}" r="2.6" fill="#FFD54A"/><circle cx="172" cy="${y}" r="2.6" fill="#FFD54A"/>`).join('')}<path d="M86,320 Q160,300 236,320" fill="none" stroke="#FFD54A" stroke-width="3"/>`),   // tang kostyumi
  ja: (t) => clip(t, `<rect x="86" y="204" width="150" height="120" fill="#2B4C7E"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${88 + k * 26},${250 + (k % 2) * 30} q8,-10 16,0" fill="none" stroke="#A9C6F0" stroke-width="2"/>`).join('')}<path d="M118,204 L178,320 M202,204 L150,300" stroke="#F4F4F4" stroke-width="10"/><rect x="86" y="290" width="150" height="16" fill="#BC002D"/><rect x="150" y="288" width="20" height="20" rx="3" fill="#FFD166"/>`),   // kimono, to'lqin naqsh, obi
  ko: (t) => clip(t, `<rect x="86" y="204" width="150" height="74" fill="#FFF3D6"/><path d="M86,204 H120 V278 H86 Z M236,204 H200 V278 H236 Z" fill="#7FB3E6"/><path d="M128,204 L160,236 L192,204" fill="none" stroke="#fff" stroke-width="6"/><rect x="86" y="274" width="150" height="60" fill="#E05A8A"/><path d="M160,240 q-12,26 -6,44 M160,240 q12,26 6,44" stroke="#CD2E3A" stroke-width="6" fill="none" stroke-linecap="round"/>`),   // hanbok: rangli yeng, goreum
};
// milliy bosh kiyim (bosh: rect x=66..254, y=56..196; markaz 160)
export const BOSH = {
  uz: `<path d="M100,64 L104,34 Q132,24 160,18 Q188,24 216,34 L220,64 Z" fill="#111"/>
<path d="M160,18 L160,62" stroke="#3A3A3A" stroke-width="1.5"/>
<path d="M104,34 Q132,24 160,18 Q188,24 216,34" fill="none" stroke="#F2F2F2" stroke-width="2.4"/>
<path d="M160,22 C150,30 146,42 152,52 C156,58 164,58 168,52 C174,42 170,30 160,22 Z" fill="#F7F7F7"/>
<path d="M160,22 C166,16 174,18 172,26" fill="none" stroke="#F7F7F7" stroke-width="3" stroke-linecap="round"/>
<path d="M156,36 C158,44 162,44 164,36" fill="none" stroke="#111" stroke-width="1.6"/>
<path d="M114,40 C108,46 108,54 116,58 C122,54 122,46 114,40 Z" fill="#F7F7F7"/>
<path d="M206,40 C212,46 212,54 204,58 C198,54 198,46 206,40 Z" fill="#F7F7F7"/>
<rect x="100" y="58" width="120" height="8" fill="#111"/>
<path d="M102,62 L108,58 L114,62 L120,58 L126,62 L132,58 L138,62 L144,58 L150,62 L156,58 L162,62 L168,58 L174,62 L180,58 L186,62 L192,58 L198,62 L204,58 L210,62 L216,58" fill="none" stroke="#F2F2F2" stroke-width="1.6"/>`,   // chust do'ppisi
  ru: `<path d="M100,66 Q98,22 160,16 Q222,22 220,66 Z" fill="#4E4E56"/>
<path d="M118,30 Q160,18 202,30" fill="none" stroke="#6E6E78" stroke-width="3"/>
<g fill="#8A7660"><circle cx="100" cy="52" r="10"/><circle cx="114" cy="52" r="10"/><circle cx="128" cy="52" r="10"/><circle cx="142" cy="52" r="10"/><circle cx="156" cy="52" r="10"/><circle cx="170" cy="52" r="10"/><circle cx="184" cy="52" r="10"/><circle cx="198" cy="52" r="10"/><circle cx="212" cy="52" r="10"/><circle cx="104" cy="40" r="8"/><circle cx="115" cy="40" r="8"/><circle cx="126" cy="40" r="8"/><circle cx="137" cy="40" r="8"/><circle cx="148" cy="40" r="8"/><circle cx="159" cy="40" r="8"/><circle cx="170" cy="40" r="8"/><circle cx="181" cy="40" r="8"/><circle cx="192" cy="40" r="8"/><circle cx="203" cy="40" r="8"/><circle cx="214" cy="40" r="8"/></g>
<rect x="100" y="40" width="120" height="14" fill="#8A7660"/>
<g fill="#8A7660"><circle cx="88" cy="70" r="9"/><circle cx="88" cy="80" r="9"/><circle cx="88" cy="90" r="9"/><circle cx="88" cy="100" r="9"/><circle cx="88" cy="110" r="9"/><circle cx="88" cy="120" r="9"/><circle cx="232" cy="70" r="9"/><circle cx="232" cy="80" r="9"/><circle cx="232" cy="90" r="9"/><circle cx="232" cy="100" r="9"/><circle cx="232" cy="110" r="9"/><circle cx="232" cy="120" r="9"/></g>
<path d="M88,128 V150 M232,128 V150" stroke="#5A4A3A" stroke-width="3"/>
<rect x="152" y="38" width="16" height="16" rx="3" fill="#D4AF37"/><circle cx="160" cy="46" r="4" fill="#C62828"/>`,   // qulqinli telpak
  en: `<path d="M124,56 L120,-12 Q160,-20 200,-12 L196,56 Z" fill="#141414"/><path d="M128,-8 L132,50" stroke="#fff" stroke-width="4" opacity=".18"/><rect x="100" y="50" width="120" height="12" rx="6" fill="#141414"/><rect x="122" y="38" width="76" height="9" fill="#C8102E"/><rect x="150" y="36" width="20" height="13" rx="2" fill="#FFD54A"/>`,   // baland qora qalpoq, qizil lenta, tilla to'qa
  de: `<path d="M106,62 Q110,26 160,24 Q210,26 214,62 Z" fill="#2E5E3A"/><path d="M96,64 Q160,52 224,64 Q160,74 96,64 Z" fill="#244A2E"/><path d="M200,40 Q226,6 236,-4" stroke="#8D6E63" stroke-width="3" fill="none"/><path d="M204,36 Q222,14 232,6" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>`,   // tirol shlyapasi, pat
  fr: `<path d="M98,58 Q100,30 156,24 Q226,20 236,44 Q240,58 222,62 Q170,70 112,64 Q98,64 98,58 Z" fill="#1B2733"/>
<path d="M112,60 Q170,66 222,58" fill="none" stroke="#0E151E" stroke-width="5"/>
<path d="M120,36 Q160,26 206,30" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".13" stroke-linecap="round"/>
<path d="M164,22 q1,-9 7,-11" stroke="#1B2733" stroke-width="4" fill="none" stroke-linecap="round"/>`,   // beret
  es: `<rect x="126" y="22" width="68" height="34" rx="6" fill="#1B2733"/><ellipse cx="160" cy="58" rx="80" ry="10" fill="#1B2733"/><rect x="126" y="44" width="68" height="6" fill="#AA151B"/>`,   // kordova shlyapasi
  ar: `<path d="M86,96 Q86,34 160,30 Q234,34 234,96 L246,186 L222,190 L216,80 Q160,66 104,80 L98,190 L74,186 Z" fill="#FAFAFA" stroke="#D9D9D9" stroke-width="2"/><ellipse cx="160" cy="44" rx="62" ry="10" fill="none" stroke="#1B2733" stroke-width="7"/><path d="M104,80 Q160,66 216,80" fill="none" stroke="#C62828" stroke-width="3" stroke-dasharray="6 5"/>`,   // g'utra va iqol
  tr: `<path d="M126,60 L132,10 Q160,4 188,10 L194,60 Z" fill="#C62828"/><path d="M132,16 L136,56" stroke="#fff" stroke-width="4" opacity=".2"/><ellipse cx="160" cy="10" rx="28" ry="5" fill="#9E1B1B"/><path d="M160,10 Q180,18 188,46" stroke="#1B2733" stroke-width="3" fill="none"/><path d="M184,46 l4,14 l4,-14 z" fill="#1B2733"/>`,   // fes, popuk
  zh: `<path d="M108,60 Q108,22 160,20 Q212,22 212,60 Z" fill="#1B2733"/><rect x="108" y="54" width="104" height="8" rx="4" fill="#B71C1C"/><circle cx="160" cy="18" r="7" fill="#B71C1C"/>`,   // ipak qalpoq, tugun
  ja: `<rect x="66" y="74" width="188" height="16" rx="8" fill="#FFFFFF" stroke="#E0E0E0"/><circle cx="160" cy="82" r="6" fill="#BC002D"/><path d="M246,82 L262,70 M246,84 L262,96" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>`,   // hachimaki
  ko: `<ellipse cx="160" cy="58" rx="86" ry="12" fill="#1B2733" opacity=".92"/><path d="M128,58 L132,12 Q160,6 188,12 L192,58 Z" fill="#1B2733" opacity=".92"/><path d="M110,64 Q104,120 112,170 M210,64 Q216,120 208,170" stroke="#1B2733" stroke-width="2" fill="none"/>`,   // gat
};
// uchish: dron parraklari yoki magnit maydon (olovsiz)
export const UCHISH = Object.fromEntries(['uz','ru','en','de','fr','es','ar','tr','zh','ja','ko'].map((t) => [t, 'magnit']));
export function dron(t, a) {
  const parrak = (cx, cy) => `<g><line x1="${cx}" y1="${cy + 4}" x2="${cx}" y2="${cy + 18}" stroke="#2B3452" stroke-width="4"/><g><ellipse cx="${cx}" cy="${cy}" rx="26" ry="4" fill="${a}" opacity=".85"/><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur=".25s" repeatCount="indefinite"/></g><circle cx="${cx}" cy="${cy}" r="4" fill="#2B3452"/></g>`;
  return parrak;
}
