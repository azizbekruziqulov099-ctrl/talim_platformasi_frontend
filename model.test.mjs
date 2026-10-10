import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  TEMPLATES, LEGACY_TEMPLATES, LAYOUTS, getTemplate, getFamily, getLayoutSpec,
  makeProject, normalizeDocument, normalizeSlide, validateDocument,
  buildTaggedTemplate, applyTaggedImport, autoLayoutForSlide, autoArrangeSlide,
  createElement, clampPlacement, LIMITS,
} from './model.js';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1S8AAAAASUVORK5CYII=';
const project = (slide = {}) => makeProject({ title: 'Sinov', count: 1, slides: [{ title: 'Sarlavha', body: 'Matn', ...slide }] });
const good = document => assert.deepEqual(validateDocument(document), []);
const bad = document => assert.ok(validateDocument(document).length > 0);
const bounds = rect => {
  assert.ok(['x', 'y', 'w', 'h'].every(key => Number.isFinite(rect[key])));
  assert.ok(rect.x >= -0.001 && rect.y >= -0.001 && rect.w >= 1 && rect.h >= 1, JSON.stringify(rect));
  assert.ok(rect.x + rect.w <= 1280.001 && rect.y + rect.h <= 720.001, JSON.stringify(rect));
};
const overlap = (a, b) => a.x < b.x + b.w - 0.001 && a.x + a.w > b.x + 0.001 && a.y < b.y + b.h - 0.001 && a.y + a.h > b.y + 0.001;

test('the five visible families group all five older templates under Klassik', () => {
  assert.deepEqual(TEMPLATES.map(item => item.id), ['glass', 'pencil', 'arc', 'spiral', 'bands']);
  assert.equal(TEMPLATES[0].label, 'Klassik');
  assert.deepEqual(LEGACY_TEMPLATES.map(item => item.id), ['glass', 'ribbon', 'split', 'gallery', 'steps']);
  for (const legacy of LEGACY_TEMPLATES) {
    assert.equal(getTemplate(legacy.id).id, legacy.id);
    assert.equal(getFamily(legacy.id).id, 'glass');
    const restored = normalizeDocument(makeProject({ design: { template: legacy.id } }));
    assert.equal(restored.design.template, legacy.id);
    good(restored);
  }
});

test('320 legacy geometry results match the original uploaded REV50 source', () => {
  const specs = [];
  for (const template of LEGACY_TEMPLATES) for (const layout of LAYOUTS) for (const size of ['normal', 'large'])
    for (const content of [{}, { formula: 'x^2' }, { example: 'Namuna' }, { formula: 'x^2', example: 'Namuna', image: 'image', image_caption: 'Izoh', image2: 'image2', image2_caption: 'Izoh2' }]) {
      const slide = { title: 'Sarlavha', section: 'Asosiy', body: 'Matn', layout: layout.id, ...content };
      const spec = getLayoutSpec(slide, { ...template.defaults, template: template.id, size, radius: 'round' }, 2, ['Kirish', 'Asosiy', 'Xulosa']);
      delete spec.elements;
      specs.push(spec);
    }
  // Captured by comparing all values with layouts.js extracted from the user's uploaded ZIP.
  assert.equal(createHash('sha256').update(JSON.stringify(specs)).digest('hex'), '0851518da5449e736a717f2394d489775fd587894494e5b4ca9978f150999cb8');
});

test('15, 20 and 25 slides survive model and tagged-content round trips for every family', () => {
  for (const template of TEMPLATES) for (const count of [15, 20, 25]) {
    const original = makeProject({ title: 'Dars mavzusi', audience: 'Universitet talabalari', count, design: { template: template.id } });
    assert.equal(original.slides.length, count);
    assert.equal(new Set(original.slides.map(slide => slide.id)).size, count);
    good(original);
    assert.deepEqual(normalizeDocument(JSON.parse(JSON.stringify(original))), original);
    const imported = applyTaggedImport(original, buildTaggedTemplate(original), { strictPlan: true });
    assert.equal(imported.slides.length, count);
    assert.deepEqual(imported, original);
  }
});

test('old documents receive empty additive fields and preserve their theme and source text', () => {
  const old = { ...project({ body: 'Old text', layout: 'text' }), schema: 1 };
  delete old.audience;
  delete old.slides[0].placements;
  delete old.slides[0].elements;
  const normalized = normalizeDocument(old);
  assert.equal(normalized.audience, '');
  assert.deepEqual(normalized.slides[0].placements, {});
  assert.deepEqual(normalized.slides[0].elements, []);
  assert.equal(normalized.slides[0].body, 'Old text');
  good(normalized);
});

test('placed items and custom elements survive saving and planned Word/tagged imports', () => {
  const original = project({ image: PNG, image_caption: 'Izoh', example: 'Misol',
    placements: { title: { x: 140, y: 100, w: 700, h: 100 }, image: { x: 740, y: 240, w: 320, h: 220 }, example: { x: 150, y: 520, w: 480, h: 70 } },
    elements: [{ ...createElement('text'), text: 'Qo‘shimcha izoh' }, { ...createElement('image', 1), image: PNG }, createElement('rect', 2)],
  });
  good(original);
  assert.deepEqual(normalizeDocument(JSON.parse(JSON.stringify(original))), original);
  const imported = applyTaggedImport(original, buildTaggedTemplate(original).replace('[MATN1] Matn', '[MATN1] Yangilangan matn'), { strictPlan: true });
  assert.equal(imported.slides[0].body, 'Yangilangan matn');
  assert.deepEqual(imported.slides[0].placements, original.slides[0].placements);
  assert.deepEqual(imported.slides[0].elements, original.slides[0].elements);
});

test('placements override the completed layout and attached labels move with their objects', () => {
  const slide = normalizeSlide({ title: 'Title', image: PNG, image_caption: 'Caption', example: 'Example', layout: 'image',
    placements: { title: { x: 70, y: 88, w: 890, h: 88 }, image: { x: 730, y: 180, w: 410, h: 350 }, example: { x: 102, y: 480, w: 480, h: 60 } },
    elements: [createElement()],
  });
  const spec = getLayoutSpec(slide, { template: 'pencil' });
  assert.equal(spec.title.x, 70);
  assert.equal(spec.images[0].y, 180);
  assert.deepEqual([spec.images[0].caption.x, spec.images[0].caption.y, spec.images[0].caption.w], [730, 538, 410]);
  assert.deepEqual([spec.example.label.x, spec.example.label.y, spec.example.label.w], [102, 452, 480]);
  assert.deepEqual(spec.elements, slide.elements);
  assert.equal(spec.images, spec.imageSlots);
  assert.equal(spec.bodies, spec.bodySlots);
});

test('invalid geometry is retained for validation instead of silently corrected', () => {
  for (const invalid of [{ x: -1, y: 0, w: 100, h: 100 }, { x: 0, y: 0, w: 0, h: 1 }, { x: 1200, y: 0, w: 81, h: 1 }, { x: 0, y: 700, w: 1, h: 21 }, { x: NaN, y: 0, w: 1, h: 1 }, { x: 0, y: Infinity, w: 1, h: 1 }]) {
    const doc = project({ placements: { body: invalid } });
    assert.deepEqual(doc.slides[0].placements.body, invalid);
    bad(doc);
  }
  bad(project({ placements: { unknown: { x: 1, y: 1, w: 1, h: 1 } } }));
  bad(project({ placements: [] }));
  bad(project({ image: PNG, image_caption: 'Caption', placements: { image: { x: 1, y: 500, w: 100, h: 200 } } }));
  bad(project({ image: PNG, image_caption: 42, placements: { image: { x: 1, y: 500, w: 100, h: 100 } } }));
  bad(project({ example: 'Example', placements: { example: { x: 0, y: 0, w: 100, h: 100 } } }));
});

test('gesture clamping keeps objects and captions inside the canvas', () => {
  assert.deepEqual(clampPlacement({ x: NaN, y: Infinity, w: 1300, h: 900 }), { x: 0, y: 0, w: 1280, h: 720 });
  const image = clampPlacement({ x: 1200, y: 700, w: 300, h: 200 }, 'image', { image: PNG, image_caption: 'Caption' });
  assert.equal(image.y + image.h, 682);
  assert.equal(image.x + image.w, 1280);
  const example = clampPlacement({ x: 0, y: -100, w: 300, h: 100 }, 'example', { example: 'Example' });
  assert.equal(example.y, 28);
});

test('custom element limits reject duplicates, unsafe image formats, unknown kinds and invalid sizes', () => {
  good(project({ elements: Array.from({ length: LIMITS.elements }, (_, at) => createElement('rect', at)) }));
  bad(project({ elements: Array.from({ length: LIMITS.elements + 1 }, (_, at) => createElement('rect', at)) }));
  for (const patch of [{ id: '' }, { kind: 'script' }, { text: 'a'.repeat(601) }, { fontSize: 13 }, { fontSize: 73 }, { fontSize: Infinity }, { color: 'red' }, { fill: '#fff' }, { image: 'data:image/svg+xml;base64,PHN2Zz4=' }, { x: -1 }]) bad(project({ elements: [{ ...createElement(), ...patch }] }));
  bad(project({ elements: [createElement(), createElement()] }));
  bad(project({ elements: {} }));
  good(project({ elements: [{ id: 'minimal', kind: 'rect', x: 0, y: 0, w: 1, h: 1 }] }));
  bad(makeProject({ audience: 'a'.repeat(121) }));
});

test('automatic layout selection and tidy operations preserve every imported content field', () => {
  for (const [content, expected] of [[{ formula: 'x^2' }, 'formula'], [{ body2: 'Two' }, 'two_columns'], [{ body3: 'Three' }, 'three_cards'], [{ image: PNG }, 'image'], [{ image2_prompt: 'Diagram' }, 'two_images']]) assert.equal(autoLayoutForSlide(content), expected);
  const slide = normalizeSlide({ title: 'Title', body: 'One', body2: 'Two', body3: 'Three', image: PNG, image2: PNG, formula: 'x^2', example: 'Example', placements: { title: { x: 20, y: 20, w: 200, h: 50 } }, elements: [createElement()] });
  const tidy = autoArrangeSlide(slide);
  for (const field of ['id', 'title', 'body', 'body2', 'body3', 'image', 'image2', 'formula', 'example', 'elements']) assert.deepEqual(tidy[field], slide[field]);
  assert.deepEqual(tidy.placements, {});
  assert.equal(tidy.layout, 'two_images');
});

test('new family geometry keeps dense source content visible, positive, bounded and separate', () => {
  const cases = [{}, { formula: 'x^2', example: 'Example' }, { body2: 'Two', body3: 'Three' }, { body2: 'Two', body3: 'Three', formula: 'x^2', example: 'Example', image: PNG, image2: PNG, image_caption: 'Caption', image2_caption: 'Caption2' }];
  for (const template of TEMPLATES.slice(1)) for (const layout of LAYOUTS) for (const size of ['normal', 'large']) for (const content of cases) {
    const slide = normalizeSlide({ title: 'Title', body: 'One', layout: layout.id, ...content });
    const spec = getLayoutSpec(slide, { ...template.defaults, template: template.id, size });
    const contentBoxes = [spec.title, ...spec.bodies, ...spec.images, spec.formula, spec.example, spec.example?.label, ...spec.images.map(item => item.caption)].filter(Boolean);
    for (const rect of [...contentBoxes, ...spec.tabs, ...spec.decorations]) bounds(rect);
    for (let a = 0; a < contentBoxes.length; a++) for (let b = a + 1; b < contentBoxes.length; b++) assert.ok(!overlap(contentBoxes[a], contentBoxes[b]), `${template.id}/${layout.id}: boxes ${a}/${b} overlap`);
    for (const field of ['body', 'body2', 'body3']) if (slide[field]) assert.ok(spec.bodies.some(item => item.field === field), `${template.id}/${layout.id}: hidden ${field}`);
    for (const field of ['image', 'image2']) if (slide[field]) assert.ok(spec.images.some(item => item.field === field));
    for (const shape of spec.decorations.filter(item => item.kind === 'polygon')) for (const [x, y] of shape.points) assert.ok(x >= -0.001 && y >= -0.001 && x <= shape.w + 0.001 && y <= shape.h + 0.001);
  }
});

test('reference compositions place the content in four genuinely different diagrams', () => {
  const specs = Object.fromEntries(TEMPLATES.slice(1).map(template => [template.id, getLayoutSpec({ layout: 'three_cards', body: 'First', body2: 'Second', body3: 'Third' }, { template: template.id })]));
  assert.deepEqual(specs.pencil.bodies.map(item => item.x), [96, 760, 96]);
  assert.deepEqual(specs.arc.bodies.map(item => item.y), [244, 364, 484]);
  assert.deepEqual(specs.spiral.bodies.map(item => item.y), [230, 526, 230]);
  assert.deepEqual(specs.bands.bodies.map(item => item.y), [244, 364, 484]);
  assert.ok(specs.arc.bodies.every(item => item.w > 700));
  assert.ok(specs.bands.bodies.every(item => item.w > 600));
  assert.equal(new Set(Object.values(specs).map(spec => JSON.stringify(spec.bodySlots))).size, 4);
});

test('changing the accent recolors each new motif without moving its content', () => {
  for (const template of TEMPLATES.slice(1)) for (const layout of ['text', 'three_cards']) {
    const slide = { layout, body: 'One', body2: 'Two', body3: 'Three' };
    const original = getLayoutSpec(slide, { template: template.id, accent: template.defaults.accent });
    const changed = getLayoutSpec(slide, { template: template.id, accent: 'blue' });
    assert.deepEqual(changed.bodySlots, original.bodySlots);
    assert.notDeepEqual(changed.decorations.map(shape => shape.fill), original.decorations.map(shape => shape.fill));
  }
});
