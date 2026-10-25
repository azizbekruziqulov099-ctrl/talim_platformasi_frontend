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

// mashq tugunlari bosilganini eslab qolamiz (✓ belgisi uchun)
const KEY = "kabutar:kid:mashq:v1";
const store = () => { try { return globalThis.localStorage; } catch { return null; } };
export function mashqBajarildi(kod, st = store()) { try { return Boolean(JSON.parse(st?.getItem(KEY) || "{}")[kod]); } catch { return false; } }
export function mashqBelgila(kod, st = store()) {
  try { const d = JSON.parse(st?.getItem(KEY) || "{}") || {}; d[kod] = Date.now(); st?.setItem(KEY, JSON.stringify(d)); } catch { /* ixtiyoriy */ }
}
