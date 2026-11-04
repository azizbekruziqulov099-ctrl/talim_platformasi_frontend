// REV328: shu darsni boshqa tilda o'tish — bir fan bir necha izoh tilida o'rnatilgan («Matematika», «Matematika (izoh: rus)» …).
// Sof funksiyalar: mavzu tartib raqami va yosh guruhi bo'yicha boshqa tildagi o'sha darsni topadi.
import { DARS_TILLARI, fanIzohi, fanNomi, ozTilidami } from './izohTanlov.js';
import { filterTopics } from './learnerTopicsRules.js';

const asos = (nom) => fanNomi(nom).toLowerCase();

/** Shu fanning boshqa tildagi variantlari: [{ til, belgi, nomi, sub }] (o'zi va «o'z tilida izohli» variant kirmaydi). */
export function tilVariantlari(fanlar = [], nom = '') {
  const a = asos(nom), bu = fanIzohi(nom);
  const kor = new Set([bu]);
  const out = [];
  for (const f of fanlar || []) {
    if (!f?.nom || asos(f.nom) !== a || f.nom === nom || ozTilidami(f.nom)) continue;
    const til = fanIzohi(f.nom);
    if (kor.has(til) || !DARS_TILLARI[til]) continue;
    kor.add(til);
    out.push({ til, belgi: DARS_TILLARI[til][0], nomi: DARS_TILLARI[til][1], sub: f });
  }
  return out;
}

const sinfTeng = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

/** Variant fanidan aynan shu darsni topadi: shu yosh guruhi, darsli mavzular ichida shu tartib raqami. */
export function moslar(variantSub, group, topic) {
  const list = (group?.mavzular || []).filter((t) => t.dars_bor);
  const i = list.indexOf(topic);
  if (i < 0 || !variantSub) return null;
  const vg = filterTopics(variantSub, '', 'all').find((g) => sinfTeng(g.sinf, group.sinf));
  const vt = vg ? (vg.mavzular || []).filter((t) => t.dars_bor)[i] : null;
  return vt ? { group: vg, topic: vt } : null;
}
