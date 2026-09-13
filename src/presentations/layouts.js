/** Shared 1280 × 720 geometry. No browser or React dependency.
 * Boxes use x/y/w/h in slide pixels. Export converts px / 96 to inches.
 * bodies/bodySlots and images/imageSlots are aliases. Formula/example are optional;
 * hidden content fields are deliberately not consulted when selecting layout slots.
 * sections accepts strings or {label,firstIndex}; firstIndex is an actual slide index.
 */
const template = (id, label, description, defaults, sequence, previewLayouts) => Object.freeze({
  id, label, description, defaults: Object.freeze(defaults),
  sequence: Object.freeze(sequence), previewLayouts: Object.freeze(previewLayouts),
});
export const TEMPLATES = Object.freeze([
  template('glass', 'Aurora', 'Yorug‘ shisha panellar va sokin bo‘limlar.', { background: 'aurora', overlay: 25, panel: 'glass', accent: 'cyan', text: 'auto' }, ['cover', 'text', 'two_columns', 'image', 'formula'], ['text', 'image', 'three_cards']),
  template('ribbon', 'Rangli bo‘limlar', 'Tepada tutash bo‘limlar, rangli katta panel.', { background: 'midnight', overlay: 0, panel: 'solid', accent: 'blue', text: 'light' }, ['cover', 'image', 'two_columns', 'three_cards', 'text'], ['image', 'two_columns', 'three_cards']),
  template('split', 'Tahririy', 'Vertikal aksent va keng, tartibli ustunlar.', { background: 'paper', overlay: 0, panel: 'none', accent: 'violet', text: 'dark' }, ['cover', 'two_columns', 'text', 'image', 'formula'], ['text', 'two_columns', 'image']),
  template('gallery', 'Galereya', 'Yirik rasmlar va ixcham izohlar.', { background: 'paper', overlay: 0, panel: 'solid', accent: 'blue', text: 'dark' }, ['cover', 'image', 'two_images', 'two_columns', 'text'], ['image', 'two_images', 'cover']),
  template('steps', 'Bosqichlar', 'Raqamlangan qadamlar va o‘quv bosqichlari.', { background: 'midnight', overlay: 10, panel: 'glass', accent: 'green', text: 'light' }, ['cover', 'steps', 'three_cards', 'two_columns', 'text'], ['steps', 'three_cards', 'image']),
]);
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
export const getTemplate = (id) => TEMPLATES.find(item => item.id === id) || TEMPLATES[0];
export const getLayout = (id) => LAYOUTS.find(item => item.id === id) || LAYOUTS[0];
export const SECTION_COLORS = Object.freeze(['#176b59', '#275fa5', '#7850a0', '#a64b3c', '#765b22']);
const box = (x, y, w, h, more = {}) => ({ x, y, w, h, ...more });

export function getLayoutSpec(slide = {}, design = {}, index = 0, sections = []) {
  const templateId = getTemplate(design.template).id;
  const layoutId = getLayout(slide.layout).id;
  const meta = getLayout(layoutId);
  const large = design.size === 'large';
  const fontSizes = { title: large ? 48 : 42, body: large ? 28 : 24, formula: large ? 60 : 52, example: large ? 23 : 20, caption: 16, nav: 16 };
  const list = sections.length ? sections.map((item, at) => typeof item === 'string' ? { label: item, firstIndex: at } : { label: item.label ?? item.section ?? 'Taqdimot', firstIndex: item.firstIndex ?? at }) : [{ label: slide.section || 'Taqdimot', firstIndex: 0 }];
  const sectionAt = Math.max(0, list.findIndex(item => item.label === (slide.section || 'Taqdimot')));
  const sectionColor = SECTION_COLORS[sectionAt % SECTION_COLORS.length];
  const shown = list.slice(Math.floor(sectionAt / 5) * 5, Math.floor(sectionAt / 5) * 5 + 5);
  const tabGeometry = templateId === 'ribbon' ? [64, 28, 1152, 84] : templateId === 'split' ? [112, 34, 1104, 42] : templateId === 'gallery' ? [64, 32, 1152, 46] : [64, 30, 1152, 62];
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
    // Image layouts reserve the formula/example beneath the text column only.
    if ((layoutId === 'image' || layoutId === 'cover') && hasImage) {
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
      spec.example = box(main.x, bottom - 62, main.w, 62, { fontSize: fontSizes.example, label: box(main.x, bottom - 88, main.w, 20, { fontSize: 14 }) });
      bottom -= 104;
    }
    if (slide.formula) {
      const height = layoutId === 'formula' ? 132 : 96;
      spec.formula = box(main.x + 8, bottom - height, main.w - 16, height, { fontSize: fontSizes.formula });
      bottom -= height + 16;
    }
    main.h = Math.max(48, bottom - main.y);
    if (layoutId === 'two_images') {
      const gap = 32, column = (main.w - gap) / 2;
      const imageHeight = Math.max(64, Math.round(main.h * 0.57));
      ['body', 'body2'].forEach((field, at) => {
        const x = main.x + at * (column + gap);
        addImage(at ? 'image2' : 'image', box(x, main.y, column, imageHeight));
        addBody(field, box(x, main.y + imageHeight + 16, column, Math.max(40, main.h - imageHeight - 16)), { fontSize: large ? 26 : 22 });
      });
    } else if (meta.textCount > 1) {
      const gap = meta.textCount === 3 ? 28 : 36;
      const column = (main.w - gap * (meta.textCount - 1)) / meta.textCount;
      Array.from({ length: meta.textCount }, (_, at) => {
        const x = main.x + at * (column + gap);
        const numbered = layoutId === 'steps' || templateId === 'steps';
        const inset = meta.textCount === 3 || numbered ? 20 : 0;
        if (meta.textCount === 3 || numbered) spec.decorations.push(box(x, main.y, column, main.h, { kind: 'rect', fill: 'accent', opacity: 0.08, radius: design.radius === 'square' ? 0 : 16 }));
        if (numbered) spec.decorations.push(box(x + 20, main.y + 14, 36, 36, { kind: 'circle', fill: 'accent', opacity: 1, radius: 18, text: String(at + 1), fontSize: 20 }));
        addBody(at ? `body${at + 1}` : 'body', box(x + inset, main.y + (numbered ? 68 : inset), column - inset * 2, Math.max(32, main.h - (numbered ? 84 : inset * 2))), { fontSize: meta.textCount === 3 ? (large ? 26 : 22) : fontSizes.body });
      });
    } else {
      if (layoutId === 'cover' && !hasImage) {
        spec.title = box(main.x, 168, main.w, 126, { fontSize: large ? 60 : 54 });
        main.y = 320;
        main.h = Math.max(48, bottom - main.y);
      }
      addBody('body', main);
    }
  }
  spec.bodies = spec.bodySlots;
  spec.images = spec.imageSlots;
  return spec;
}
