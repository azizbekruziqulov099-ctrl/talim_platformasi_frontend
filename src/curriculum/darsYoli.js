// REV173: Bog'cha — darslar «o'yin yo'li» kabi: dars → dars → dars → 🎮 mashq (shu bosqich mavzularidan o'yin) → … → 🏆 katta imtihon.
// Sof funksiyalar (brauzersiz sinaladi).

export const BOSQICH_DARS = 3;   // har 3 ta yangi darsdan keyin — mashq

/**
 * mavzular — guruh mavzulari; holat(i) → { done, locked } (i — mavzuning ro'yxatdagi o'rni).
 * isReview(topic) — takrorlash mavzusimi (bosqichdagi yangi darslar soniga kirmaydi).
 * → { tugunlar: [{tur: "dars", i, topic} | {tur: "mashq"|"imtihon", bosqich, mavzular:[topic], ochiq, bajarildi}], bosqich, jami, otildi, bosqichlar }
 */
export function darsYoli(mavzular = [], holat = () => ({}), isReview = () => false) {
  const tugunlar = [];
  let parcha = [];        // joriy bosqich mavzulari (indekslar)
  let yangi = 0;
  let bosqich = 1;
  const mashqQosh = () => {
    const testli = parcha.filter((i) => mavzular[i]?.savol_soni > 0);
    const darslar = parcha.filter((i) => mavzular[i]?.dars_bor);
    if (testli.length) {
      tugunlar.push({ tur: "mashq", bosqich, mavzular: testli.map((i) => mavzular[i]), ochiq: darslar.every((i) => holat(i).done) });
    }
    parcha = []; yangi = 0; bosqich += 1;
  };
  mavzular.forEach((t, i) => {
    tugunlar.push({ tur: "dars", i, topic: t, bosqich });
    parcha.push(i);
    if (t.dars_bor && !isReview(t)) yangi += 1;
    if (yangi >= BOSQICH_DARS && i < mavzular.length - 1) mashqQosh();
  });
  const darsIdx = mavzular.map((t, i) => (t.dars_bor ? i : -1)).filter((i) => i >= 0);
  const otildi = darsIdx.filter((i) => holat(i).done).length;
  const testli = mavzular.filter((t) => t.savol_soni > 0);
  if (testli.length) tugunlar.push({ tur: "imtihon", bosqich, mavzular: testli, ochiq: darsIdx.length > 0 && otildi === darsIdx.length });
  // bolaning hozirgi bosqichi — navbatdagi o'tilmagan dars turgan bosqich
  const navbat = tugunlar.find((n) => n.tur === "dars" && n.topic.dars_bor && !holat(n.i).done);
  const bosqichlar = Math.max(1, ...tugunlar.filter((n) => n.tur === "dars").map((n) => n.bosqich));
  return { tugunlar, bosqich: navbat ? navbat.bosqich : bosqichlar, bosqichlar, jami: darsIdx.length, otildi };
}

/**
 * REV174: maktab o'quv yo'li — darslar tartib bilan: dars faqat oldingi barcha darslar o'tilgach «ochiq» (tavsiya);
 * darsi yo'q mavzu (AI ustoz bilan) yo'lni to'smaydi. → { ochiq: [bool], navbat: indeks | -1, otildi, jami }
 */
export function ketmaKet(mavzular = [], done = () => false) {
  let hammasi = true;
  let navbat = -1;
  const ochiq = mavzular.map((t, i) => {
    const och = hammasi;
    if (t.dars_bor) {
      const d = done(i);
      if (!d && navbat < 0) navbat = i;
      if (!d) hammasi = false;
    }
    return och || !t.dars_bor;
  });
  const darslar = mavzular.map((t, i) => i).filter((i) => mavzular[i].dars_bor);
  return { ochiq, navbat, otildi: darslar.filter((i) => done(i)).length, jami: darslar.length };
}
