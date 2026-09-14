/** Shared 1280 × 720 geometry. No browser or React dependency.
 * Boxes use x/y/w/h in slide pixels. Export converts px / 96 to inches.
 * bodies/bodySlots and images/imageSlots are aliases. Formula/example are optional;
 * Nonempty content always gets a slot, including work imported into another layout.
 * sections accepts strings or {label,firstIndex}; firstIndex is an actual slide index.
 */
const template = (id, label, description, defaults, sequence, previewLayouts) => Object.freeze({
  id, label, description, defaults: Object.freeze(defaults),
  sequence: Object.freeze(sequence), previewLayouts: Object.freeze(previewLayouts),
});
export const LEGACY_TEMPLATES = Object.freeze([
  template('glass', 'Aurora', 'Yorug‘ shisha panellar va sokin bo‘limlar.', { background: 'aurora', overlay: 25, panel: 'glass', accent: 'cyan', text: 'auto' }, ['cover', 'text', 'two_columns', 'image', 'formula'], ['text', 'image', 'three_cards']),
  template('ribbon', 'Rangli bo‘limlar', 'Tepada tutash bo‘limlar, rangli katta panel.', { background: 'midnight', overlay: 0, panel: 'solid', accent: 'blue', text: 'light' }, ['cover', 'image', 'two_columns', 'three_cards', 'text'], ['image', 'two_columns', 'three_cards']),
  template('split', 'Tahririy', 'Vertikal aksent va keng, tartibli ustunlar.', { background: 'paper', overlay: 0, panel: 'none', accent: 'violet', text: 'dark' }, ['cover', 'two_columns', 'text', 'image', 'formula'], ['text', 'two_columns', 'image']),
  template('gallery', 'Galereya', 'Yirik rasmlar va ixcham izohlar.', { background: 'paper', overlay: 0, panel: 'solid', accent: 'blue', text: 'dark' }, ['cover', 'image', 'two_images', 'two_columns', 'text'], ['image', 'two_images', 'cover']),
  template('steps', 'Bosqichlar', 'Raqamlangan qadamlar va o‘quv bosqichlari.', { background: 'midnight', overlay: 10, panel: 'glass', accent: 'green', text: 'light' }, ['cover', 'steps', 'three_cards', 'two_columns', 'text'], ['steps', 'three_cards', 'image']),
]);
export const TEMPLATES = Object.freeze([
  template('glass', 'Klassik', 'Aurora, rangli bo‘limlar, tahririy, galereya va bosqichlar — bir oila.', LEGACY_TEMPLATES[0].defaults, LEGACY_TEMPLATES[0].sequence, ['text', 'image', 'three_cards']),
  template('pencil', 'Qalam', 'Qalam atrofida navbatma-navbat joylashgan fikrlar.', { background: 'paper', overlay: 0, panel: 'none', accent: 'green', text: 'dark' }, ['cover', 'three_cards', 'formula', 'two_columns', 'image'], ['three_cards', 'formula', 'image']),
  template('arc', 'Egri lentalar', 'Har bir fikr o‘z egri lentasi ichida.', { background: 'paper', overlay: 0, panel: 'none', accent: 'green', text: 'dark' }, ['cover', 'three_cards', 'two_columns', 'text', 'image'], ['three_cards', 'text', 'image']),
  template('spiral', 'Gorizontal spiral', 'Gorizontal o‘q atrofidagi buramalar va izchil fikrlar.', { background: 'paper', overlay: 0, panel: 'none', accent: 'amber', text: 'dark' }, ['cover', 'steps', 'two_columns', 'text', 'image'], ['steps', 'text', 'image']),
  template('bands', 'O‘ralgan tasmalar', 'Ustma-ust o‘ralgan tasmalar ichidagi tartibli mazmun.', { background: 'paper', overlay: 0, panel: 'none', accent: 'violet', text: 'dark' }, ['cover', 'three_cards', 'steps', 'two_columns', 'image'], ['three_cards', 'text', 'image']),
]);
export const FAMILIES = TEMPLATES;
const layout = (id, label, textCount, imageCount, extra = {}) => Object.freeze({
  id, label, textCount, imageCount,
  fields: Object.freeze(['body', ...(textCount > 1 ? ['body2'] : []), ...(textCount > 2 ? ['body3'] : []), ...(imageCount ? ['image'] : []), ...(imageCount > 1 ? ['image2'] : [])]),
  ...extra,
});
export const LAYOUTS = Object.freeze([
  layout('text', 'Bitta matn', 1, 0), layout('formula', 'Matn va formula', 1, 0, { formula: true }),
  layout('image', 'Matn va rasm', 1, 1), layout('cover', 'Muqova', 1, 1, { optionalImage: true }),
  layout('two_columns', 'Ikki matn', 2, 0), layout('two_images', 'Ikki matn va ikki rasm', 2, 2),
  layout('three_cards', 'Uchta matn', 3, 0), layout('steps', 'Uchta bosqich', 3, 0),
]);
export const getTemplate = (id) => LEGACY_TEMPLATES.find(item => item.id === id) || TEMPLATES.find(item => item.id === id) || TEMPLATES[0];
export const getFamily = (id) => TEMPLATES.find(item => item.id === (LEGACY_TEMPLATES.some(legacy => legacy.id === id) || id === 'classic' ? 'glass' : id)) || TEMPLATES[0];
export const suggestFamily = (fields = {}) => ({ lecture: 'arc', practice: 'pencil', seminar: 'spiral', lab: 'bands', project: 'bands' }[fields.lesson_type] || 'glass');
export const getLayout = (id) => LAYOUTS.find(item => item.id === id) || LAYOUTS[0];
const nonempty = value => typeof value === 'string' && !!value.trim();
/** Choose slots from actual content without deleting fields or changing slide identity. */
export function autoLayoutForSlide(slide = {}) {
  if (slide.image2 || nonempty(slide.image2_prompt)) return 'two_images';
  if (slide.image || nonempty(slide.image_prompt)) return 'image';
  if (nonempty(slide.body3)) return slide.layout === 'steps' ? 'steps' : 'three_cards';
  if (nonempty(slide.body2)) return 'two_columns';
  if (nonempty(slide.formula)) return 'formula';
  return slide.layout === 'cover' ? 'cover' : 'text';
}
export const autoArrangeSlide = (slide = {}) => ({ ...slide, layout: autoLayoutForSlide(slide), placements: {} });
export const SECTION_COLORS = Object.freeze(['#176b59', '#275fa5', '#7850a0', '#a64b3c', '#765b22']);
const box = (x, y, w, h, more = {}) => ({ x, y, w, h, ...more });
const NEW_FAMILIES = new Set(['pencil', 'arc', 'spiral', 'bands']);
const MOTIF_COLORS = ['#98b879', '#63a99d', '#d9b36c', '#9b8fb8'];
/** Native vector protocol: polygon points are local [x,y] pairs in its x/y/w/h box.
 * Fill is a CSS hex color, 'accent' or 'sectionColor'; opacity is in [0,1].
 * Rect/circle keep the original decoration protocol, including optional text.
 */
function polygon(points, fill, opacity = 1) {
  const x = Math.min(...points.map(point => point[0])), y = Math.min(...points.map(point => point[1]));
  const w = Math.max(...points.map(point => point[0])) - x, h = Math.max(...points.map(point => point[1])) - y;
  return box(x, y, w, h, { kind: 'polygon', points: points.map(([px, py]) => [Number((px - x).toFixed(3)), Number((py - y).toFixed(3))]), fill, opacity });
}
function familyDecorations(id) {
  const shapes = [];
  const rect = (x, y, w, h, fill, radius = 0, opacity = 1) => shapes.push(box(x, y, w, h, { kind: 'rect', fill, radius, opacity }));
  const poly = (points, fill, opacity) => shapes.push(polygon(points, fill, opacity));
  if (id === 'pencil') {
    rect(64, 122, 176, 506, '#dfe8da', 32, 0.36);
    rect(116, 164, 70, 50, '#a28ca9', 15);
    rect(116, 202, 70, 20, '#c4cccf');
    rect(116, 222, 70, 322, '#90ad66');
    rect(127, 222, 13, 322, '#bed59c');
    rect(173, 222, 13, 322, '#66884f');
    poly([[116, 544], [186, 544], [151, 622]], '#d9bea1');
    poly([[140, 598], [162, 598], [151, 622]], '#344b50');
    MOTIF_COLORS.forEach((color, at) => {
      const y = 250 + at * 66;
      poly([[151, y], [219, y], [231, y + 10], [231, y + 35], [151, y + 35]], color);
      poly([[219, y], [231, y + 10], [219, y + 10]], '#314c46', 0.25);
      rect(151, y + 7, 55, 2, '#ffffff', 0, 0.5);
    });
  } else if (id === 'arc') {
    // Four nested quarter-circle ribbons with straight, folded top ends.
    [248, 204, 160, 116].forEach((radius, at) => {
      const cx = 284, cy = 594, thickness = 34;
      const outer = [], inner = [];
      for (let step = 0; step <= 24; step++) {
        const angle = Math.PI + step / 24 * Math.PI / 2;
        outer.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
      }
      for (let step = 24; step >= 0; step--) {
        const angle = Math.PI + step / 24 * Math.PI / 2;
        inner.push([cx + (radius - thickness) * Math.cos(angle), cy + (radius - thickness) * Math.sin(angle)]);
      }
      poly([...outer, [320, cy - radius], [320, cy - radius + thickness], ...inner], MOTIF_COLORS[at]);
      rect(286, cy - radius + 7, 25, 3, '#ffffff', 1, 0.55);
      poly([[320, cy - radius], [328, cy - radius + 8], [320, cy - radius + 16]], '#314c46', 0.22);
    });
    rect(82, 181, 98, 6, '#98b879', 3);
    rect(82, 202, 148, 3, '#b5c6b6', 1, 0.75);
    rect(82, 218, 116, 3, '#b5c6b6', 1, 0.55);
  } else if (id === 'spiral') {
    rect(84, 568, 1112, 12, '#a8b1b3', 6);
    rect(84, 568, 1112, 4, '#dbe0df', 2);
    // A continuous horizontal ribbon alternates rear/front half turns around the axle.
    for (let turn = 0; turn < 5; turn++) {
      const x = 108 + turn * 216;
      for (const half of [0, 1]) {
        const upper = [], lower = [];
        for (let step = 0; step <= 18; step++) {
          const t = half / 2 + step / 36;
          const px = x + t * 216, py = 574 - 51 * Math.sin(t * Math.PI * 2);
          upper.push([px, py - 14]); lower.unshift([px, py + 14]);
        }
        poly([...upper, ...lower], half ? '#ac684c' : '#ce9672');
      }
      rect(x + 80, 550, 46, 3, '#f4d6b4', 1, 0.8);
    }
  } else if (id === 'bands') {
    rect(980, 170, 192, 448, '#dfe4e2', 26);
    rect(993, 176, 170, 435, '#f6f7f3', 18);
    ['#9d86b7', '#d28f7e', '#93b77b', '#75a8af'].forEach((color, at) => {
      const y = 218 + at * 90;
      rect(954, y - 11, 26, 72, color, 7);
      poly([[954, y - 11], [982, y + 2], [982, y + 58], [954, y + 48]], '#314c46', 0.24);
      rect(976, y, 212, 66, color, 5);
      rect(990, y + 8, 182, 3, '#ffffff', 1, 0.38);
      poly([[1188, y], [1207, y + 15], [1207, y + 77], [1188, y + 66]], color);
      poly([[1188, y], [1207, y + 15], [1188, y + 15]], '#314c46', 0.3);
      rect(1003, y + 25, 38, 4, '#ffffff', 2, 0.72);
      rect(1003, y + 39, 132, 3, '#ffffff', 1, 0.45);
    });
  }
  return shapes;
}

/** Reference compositions place the content inside/around the actual diagram motif. */
function applyInfographic(spec, design) {
  const id = spec.template, large = design.size === 'large';
  spec.title = box(96, 126, 1088, 84, { fontSize: large ? 44 : 38 });
  spec.panel = box(64, 110, 1152, 530, { radius: design.radius === 'square' ? 0 : 24 });
  spec.tabs = spec.tabs.map((tab, at) => ({ ...tab, x: 96 + at * 1088 / spec.tabs.length, y: 36, w: 1088 / spec.tabs.length, h: 42 }));
  spec.decorations = [];
  spec.bodySlots = [];
  const rect = (x, y, w, h, fill, radius = 0, opacity = 1) => spec.decorations.push(box(x, y, w, h, { kind: 'rect', fill, radius, opacity }));
  const poly = (points, fill, opacity) => spec.decorations.push(polygon(points, fill, opacity));
  const body = (at, x, y, w, h) => spec.bodySlots.push(box(x, y, w, h, { field: at ? `body${at + 1}` : 'body', fontSize: large ? 24 : 22 }));
  const number = (at, x, y, color) => spec.decorations.push(box(x, y, 36, 36, { kind: 'circle', fill: color, opacity: 1, radius: 18, text: String(at + 1), fontSize: 18 }));
  if (id === 'pencil') {
    rect(608, 226, 64, 42, '#a28ca9', 13);
    rect(608, 258, 64, 17, '#c4cccf');
    rect(608, 275, 64, 286, '#90ad66');
    rect(618, 275, 12, 286, '#bed59c');
    rect(660, 275, 12, 286, '#66884f');
    poly([[608, 561], [672, 561], [640, 625]], '#d9bea1');
    poly([[630, 606], [650, 606], [640, 625]], '#344b50');
    [[96, 266, 424, 124], [760, 358, 424, 124], [96, 468, 424, 124]].forEach(([x, y, w, h], at) => {
      const color = MOTIF_COLORS[at];
      body(at, x, y + 16, w, h - 16);
      rect(x, y, w, 4, color, 2);
      const left = at !== 1, dotX = left ? 553 : 691, dotY = y + 12;
      rect(left ? x + w : 672, dotY + 17, left ? 88 : x - 672, 2, color);
      number(at, dotX, dotY, color);
    });
  } else if (id === 'arc') {
    [360, 240, 120].forEach((radius, at) => {
      const cx = 380, cy = 596, thickness = 112, outer = [], inner = [];
      for (let step = 0; step <= 32; step++) {
        const angle = Math.PI + step / 32 * Math.PI / 2;
        outer.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
      }
      for (let step = 32; step >= 0; step--) {
        const angle = Math.PI + step / 32 * Math.PI / 2;
        inner.push([cx + (radius - thickness) * Math.cos(angle), cy + (radius - thickness) * Math.sin(angle)]);
      }
      const y = cy - radius, color = ['#c7dbac', '#aed7cd', '#ead5ac'][at];
      poly([...outer, [1170, y], [1184, y + 12], [1184, y + thickness - 12], [1170, y + thickness], ...inner], color);
      rect(414, y + 4, 714, 2, '#ffffff', 1, 0.5);
      number(at, 352, y + 38, MOTIF_COLORS[at]);
      body(at, 414, y + 8, 714, 96);
    });
  } else if (id === 'spiral') {
    rect(92, 408, 1096, 12, '#a8b1b3', 6);
    rect(92, 408, 1096, 4, '#dbe0df', 2);
    for (let turn = 0; turn < 3; turn++) {
      const x = 176 + turn * 336;
      for (const half of [0, 1]) {
        const upper = [], lower = [];
        for (let step = 0; step <= 24; step++) {
          const t = half / 2 + step / 48, px = x + t * 216, py = 414 - 64 * Math.sin(t * Math.PI * 2);
          upper.push([px, py - 18]); lower.unshift([px, py + 18]);
        }
        poly([...upper, ...lower], half ? '#ac684c' : '#ce9672');
      }
      const above = turn !== 1, bx = 96 + turn * 384;
      body(turn, bx, above ? 230 : 526, 320, 96);
      rect(bx, above ? 224 : 512, 320, 4, '#ce9672', 2);
      number(turn, bx, above ? 336 : 462, '#ac684c');
    }
  } else if (id === 'bands') {
    rect(274, 216, 748, 400, '#dfe4e2', 28);
    rect(286, 224, 724, 384, '#f6f7f3', 20);
    ['#d9c9e6', '#e9c8b9', '#c7ddbb'].forEach((color, at) => {
      const y = 236 + at * 120;
      rect(244, y - 10, 40, 104, color, 6);
      poly([[244, y - 10], [294, y + 4], [294, y + 104], [244, y + 94]], '#314c46', 0.2);
      rect(282, y, 780, 112, color, 6);
      poly([[1062, y], [1100, y + 18], [1100, y + 126], [1062, y + 112]], color);
      poly([[1062, y], [1100, y + 18], [1062, y + 18]], '#314c46', 0.24);
      rect(308, y + 3, 724, 3, '#ffffff', 1, 0.44);
      number(at, 300, y + 38, ['#9d86b7', '#bd7d69', '#799e60'][at]);
      body(at, 354, y + 8, 670, 96);
    });
  }
}

/** A selected palette recolors the principal motif while retaining the reference's secondary bands. */
function applyMotifPalette(spec, design) {
  if (!design.accent || design.accent === getTemplate(spec.template).defaults.accent) return;
  const palettes = {
    cyan: { light: '#c2e2e8', medium: '#76adb7', dark: '#3e7986' },
    blue: { light: '#c7d8ed', medium: '#799abf', dark: '#45658e' },
    violet: { light: '#dccfeb', medium: '#a68abd', dark: '#72578d' },
    green: { light: '#c9dfbf', medium: '#8db57b', dark: '#5e834f' },
    amber: { light: '#ebdab3', medium: '#c4a16d', dark: '#956f3b' },
  };
  const sources = {
    pencil: { '#90ad66': 'medium', '#bed59c': 'light', '#66884f': 'dark', '#98b879': 'medium' },
    arc: { '#98b879': 'medium', '#c7dbac': 'light' },
    spiral: { '#ce9672': 'medium', '#ac684c': 'dark' },
    bands: { '#9d86b7': 'medium', '#d9c9e6': 'light' },
  };
  const palette = palettes[design.accent], source = sources[spec.template];
  if (!palette || !source) return;
  spec.decorations = spec.decorations.map(shape => source[shape.fill] ? { ...shape, fill: palette[source[shape.fill]] } : shape);
}

export function getLayoutSpec(slide = {}, design = {}, index = 0, sections = []) {
  const templateId = getTemplate(design.template).id;
  const isNewFamily = NEW_FAMILIES.has(templateId);
  const layoutId = getLayout(slide.layout).id;
  const originalMeta = getLayout(layoutId);
  const meta = isNewFamily ? { ...originalMeta,
    textCount: Math.max(originalMeta.textCount, nonempty(slide.body3) ? 3 : nonempty(slide.body2) ? 2 : 1),
    imageCount: Math.max(originalMeta.imageCount && layoutId !== 'cover' ? originalMeta.imageCount : 0,
      slide.image2 || nonempty(slide.image2_prompt) ? 2 : slide.image || nonempty(slide.image_prompt) ? 1 : 0),
  } : originalMeta;
  const large = design.size === 'large';
  const fontSizes = isNewFamily
    ? { title: large ? 44 : 38, body: large ? 26 : 22, formula: large ? 46 : 40, example: large ? 21 : 18, caption: 16, nav: 16 }
    : { title: large ? 48 : 42, body: large ? 28 : 24, formula: large ? 60 : 52, example: large ? 23 : 20, caption: 16, nav: 16 };
  const list = sections.length ? sections.map((item, at) => typeof item === 'string' ? { label: item, firstIndex: at } : { label: item.label ?? item.section ?? 'Taqdimot', firstIndex: item.firstIndex ?? at }) : [{ label: slide.section || 'Taqdimot', firstIndex: 0 }];
  const sectionAt = Math.max(0, list.findIndex(item => item.label === (slide.section || 'Taqdimot')));
  const sectionColor = SECTION_COLORS[sectionAt % SECTION_COLORS.length];
  const shown = list.slice(Math.floor(sectionAt / 5) * 5, Math.floor(sectionAt / 5) * 5 + 5);
  const familyTabs = { pencil: [280, 36, 896, 42], arc: [352, 36, 832, 42], spiral: [96, 36, 1088, 42], bands: [80, 36, 1104, 42] };
  const tabGeometry = familyTabs[templateId] || (templateId === 'ribbon' ? [64, 28, 1152, 84] : templateId === 'split' ? [112, 34, 1104, 42] : templateId === 'gallery' ? [64, 32, 1152, 46] : [64, 30, 1152, 62]);
  const [tx, ty, tw, th] = tabGeometry;
  const tabs = shown.map((item, at) => {
    const absolute = Math.floor(sectionAt / 5) * 5 + at;
    return box(tx + at * tw / shown.length, ty, tw / shown.length, th, { label: item.label, firstIndex: item.firstIndex, index: item.firstIndex, active: absolute === sectionAt, color: SECTION_COLORS[absolute % SECTION_COLORS.length], fontSize: fontSizes.nav });
  });
  const spec = {
    width: 1280, height: 720, template: templateId, layout: layoutId, sectionColor, fontSizes,
    navigation: templateId === 'glass' ? box(64, 30, 1152, 62, { radius: design.radius === 'square' ? 0 : 18 }) : null,
    panel: box(64, templateId === 'ribbon' ? 108 : 116, 1152, templateId === 'ribbon' ? 530 : 522, { radius: design.radius === 'square' ? 0 : templateId === 'ribbon' ? 16 : 24, ...(templateId === 'ribbon' ? { fill: 'sectionColor' } : {}) }),
    title: box(96, 146, 1088, 96, { fontSize: fontSizes.title }),
    section: null,
    footer: box(96, 665, 960, 24, { fontSize: 14 }),
    page: box(1110, 665, 74, 24, { fontSize: 14 }),
    bodySlots: [], imageSlots: [], formula: null, example: null, tabs, decorations: [],
  };
  let content = box(96, 254, 1088, 346);
  if (templateId === 'split') {
    spec.panel = box(112, 114, 1104, 524);
    spec.title = box(144, 144, 1016, 100, { fontSize: fontSizes.title });
    content = box(144, 264, 1016, 336);
    spec.decorations.push(box(48, 114, 28, 524, { kind: 'rect', fill: 'accent', opacity: 1, radius: 0 }));
  } else if (templateId === 'gallery') {
    spec.panel = box(48, 98, 1184, 540);
    spec.title = box(80, 118, 1120, 92, { fontSize: large ? 44 : 38 });
    content = box(80, 226, 1120, 382);
    spec.decorations.push(box(80, 211, 84, 4, { kind: 'rect', fill: 'accent', opacity: 1, radius: 0 }));
  } else if (templateId === 'steps') {
    spec.title = box(116, 145, 1068, 96, { fontSize: fontSizes.title });
    content = box(116, 272, 1068, 328);
    spec.decorations.push(box(88, 154, 8, 66, { kind: 'rect', fill: 'accent', opacity: 1, radius: 4 }));
  } else if (isNewFamily) {
    const familyContent = { pencil: [280, 246, 896, 354], arc: [352, 246, 824, 354], spiral: [96, 224, 1088, 288], bands: [80, 246, 824, 354] };
    content = box(...familyContent[templateId]);
    spec.title = box(content.x, templateId === 'spiral' ? 118 : 132, content.w, 94, { fontSize: large ? 44 : 38 });
    spec.panel = box(content.x - 24, 106, content.w + 48, templateId === 'spiral' ? 416 : 526, { radius: design.radius === 'square' ? 0 : 24 });
    spec.decorations.push(...familyDecorations(templateId));
  }
  const addBody = (field, rect, extra = {}) => spec.bodySlots.push({ ...rect, field, fontSize: fontSizes.body, ...extra });
  const addImage = (field, rect) => {
    const captionField = field === 'image' ? 'image_caption' : 'image2_caption';
    const hasCaption = !!slide[field] && !!slide[captionField]?.trim();
    const caption = hasCaption ? box(rect.x, rect.y + rect.h - 30, rect.w, 30, { fontSize: fontSizes.caption }) : null;
    spec.imageSlots.push({ ...rect, h: rect.h - (hasCaption ? 38 : 0), field, promptField: field === 'image' ? 'image_prompt' : 'image2_prompt', captionField, caption });
  };
  // Keep the original Aurora composition for its three established layouts.
  if (templateId === 'glass' && ['text', 'formula', 'image'].includes(layoutId)) {
    const isImage = layoutId === 'image';
    const isFormula = layoutId === 'formula';
    const bx = isImage ? 628 : 96, bw = isImage ? 556 : 1088;
    addBody('body', box(bx, 254, bw, isImage ? (slide.formula ? 132 : 252) : isFormula ? 92 : slide.formula ? 154 : slide.example ? 250 : 346));
    if (isImage) addImage('image', box(96, 254, 496, 346));
    if (slide.formula) spec.formula = box(isImage ? 640 : 120, isImage ? 400 : isFormula ? 356 : 420, isImage ? 532 : 1040, isImage ? 104 : isFormula ? 140 : 92, { fontSize: fontSizes.formula });
    if (slide.example) spec.example = box(bx, isImage ? 550 : isFormula ? 542 : 548, bw, isFormula ? 66 : isImage ? 58 : 60, { fontSize: fontSizes.example, label: box(bx, isImage ? 522 : isFormula ? 514 : 520, bw, 20, { fontSize: 14 }) });
  } else {
    const hasImage = meta.imageCount > 0 && (layoutId !== 'cover' || !!slide.image || !!slide.image_prompt);
    let main = { ...content };
    const imageRail = isNewFamily && meta.imageCount > 1 && !!(slide.formula || slide.example);
    if (imageRail) {
      const railWidth = Math.round(content.w * 0.35), gap = 24;
      main.w = content.w - railWidth - gap;
      const imageHeight = (content.h - 16) / 2;
      ['image', 'image2'].forEach((field, at) => addImage(field, box(content.x + main.w + gap, content.y + at * (imageHeight + 16), railWidth, imageHeight)));
    }
    // Image layouts reserve the formula/example beneath the text column only.
    if ((isNewFamily ? meta.imageCount === 1 : layoutId === 'image' || layoutId === 'cover') && hasImage) {
      const gap = 32;
      const imageWidth = Math.round(content.w * (templateId === 'gallery' ? 0.58 : 0.46));
      const imageRight = templateId === 'ribbon' || layoutId === 'cover';
      main.w = content.w - imageWidth - gap;
      if (!imageRight) main.x = content.x + imageWidth + gap;
      let imageRect = box(imageRight ? content.x + main.w + gap : content.x, content.y, imageWidth, content.h);
      if (templateId === 'ribbon') {
        spec.title.w = main.w;
        imageRect = box(imageRect.x, 146, imageRect.w, 454);
      }
      addImage('image', imageRect);
    }
    let bottom = main.y + main.h;
    if (slide.example) {
      spec.example = box(main.x, bottom - (isNewFamily ? 44 : 62), main.w, isNewFamily ? 44 : 62, { fontSize: fontSizes.example, label: box(main.x, bottom - (isNewFamily ? 72 : 88), main.w, isNewFamily ? 18 : 20, { fontSize: 14 }) });
      bottom -= isNewFamily ? 80 : 104;
    }
    if (slide.formula) {
      const height = isNewFamily ? (layoutId === 'formula' ? 112 : 104) : layoutId === 'formula' ? 132 : 96;
      spec.formula = box(main.x + 8, bottom - height, main.w - 16, height, { fontSize: fontSizes.formula });
      bottom -= height + (isNewFamily ? 12 : 16);
    }
    main.h = Math.max(48, bottom - main.y);
    if (isNewFamily ? meta.imageCount > 1 && !imageRail : layoutId === 'two_images') {
      const gap = 32, column = (main.w - gap) / 2;
      const imageHeight = Math.max(64, Math.round(main.h * 0.57));
      ['body', 'body2'].forEach((field, at) => {
        const x = main.x + at * (column + gap);
        addImage(at ? 'image2' : 'image', box(x, main.y, column, imageHeight));
        if (!isNewFamily || meta.textCount <= 2) addBody(field, box(x, main.y + imageHeight + 16, column, Math.max(40, main.h - imageHeight - 16)), { fontSize: large ? 26 : 22 });
      });
      if (isNewFamily && meta.textCount > 2) {
        const textWidth = (main.w - gap * 2) / 3;
        ['body', 'body2', 'body3'].forEach((field, at) => addBody(field, box(main.x + at * (textWidth + gap), main.y + imageHeight + 16, textWidth, Math.max(40, main.h - imageHeight - 16)), { fontSize: large ? 24 : 20 }));
      }
    } else if (meta.textCount > 1) {
      const gap = meta.textCount === 3 ? 28 : 36;
      const column = (main.w - gap * (meta.textCount - 1)) / meta.textCount;
      Array.from({ length: meta.textCount }, (_, at) => {
        const x = main.x + at * (column + gap);
        const numbered = (layoutId === 'steps' || templateId === 'steps') && (!isNewFamily || main.h >= 130);
        const inset = meta.textCount === 3 || numbered ? (isNewFamily && main.h < 130 ? 10 : 20) : 0;
        if (meta.textCount === 3 || numbered) spec.decorations.push(box(x, main.y, column, main.h, { kind: 'rect', fill: 'accent', opacity: 0.08, radius: design.radius === 'square' ? 0 : 16 }));
        if (numbered) spec.decorations.push(box(x + 20, main.y + 14, 36, 36, { kind: 'circle', fill: 'accent', opacity: 1, radius: 18, text: String(at + 1), fontSize: 20 }));
        addBody(at ? `body${at + 1}` : 'body', box(x + inset, main.y + (numbered ? 68 : inset), column - inset * 2, Math.max(32, main.h - (numbered ? 84 : inset * 2))), { fontSize: meta.textCount === 3 ? (large ? 26 : 22) : fontSizes.body });
      });
    } else {
      if (layoutId === 'cover' && !hasImage && (!isNewFamily || (!slide.formula && !slide.example))) {
        spec.title = box(main.x, isNewFamily ? 148 : 168, main.w, isNewFamily ? 108 : 126, { fontSize: large ? 60 : 54 });
        main.y = isNewFamily ? 284 : 320;
        main.h = Math.max(48, bottom - main.y);
      }
      addBody('body', main);
    }
  }
  if (isNewFamily && ['three_cards', 'steps'].includes(layoutId)
    && !['formula', 'example', 'image', 'image2', 'image_prompt', 'image2_prompt'].some(field => nonempty(slide[field]))) applyInfographic(spec, design);
  if (isNewFamily) applyMotifPalette(spec, design);
  // Placements override the completed automatic layout. Attached text follows its item.
  const placements = slide.placements && typeof slide.placements === 'object' && !Array.isArray(slide.placements) ? slide.placements : {};
  const placed = (rect, field) => rect && placements[field] ? { ...rect, ...Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, placements[field][key]])) } : rect;
  spec.title = placed(spec.title, 'title');
  spec.bodySlots = spec.bodySlots.map(rect => placed(rect, rect.field));
  spec.formula = placed(spec.formula, 'formula');
  spec.example = placed(spec.example, 'example');
  if (spec.example && placements.example && spec.example.label) spec.example.label = { ...spec.example.label, x: spec.example.x, y: spec.example.y - 28, w: spec.example.w };
  spec.imageSlots = spec.imageSlots.map(rect => {
    const moved = placed(rect, rect.field);
    return moved.caption && placements[rect.field] ? { ...moved, caption: { ...moved.caption, x: moved.x, y: moved.y + moved.h + 8, w: moved.w } } : moved;
  });
  spec.elements = Array.isArray(slide.elements) ? slide.elements : [];
  spec.bodies = spec.bodySlots;
  spec.images = spec.imageSlots;
  return spec;
}
