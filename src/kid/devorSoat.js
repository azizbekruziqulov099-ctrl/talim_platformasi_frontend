// REV158: xonadagi devor soati — rasmdagi qotib qolgan millar o'rniga HAQIQIY vaqt (bolaning qurilmasidagi soat).
// Sof funksiya (testlanadi): soat va daqiqa → millar burchagi (gradus, 12 dan soat yo'nalishida).
export function soatBurchaklari(sana = new Date()) {
  const h = sana.getHours() % 12, m = sana.getMinutes(), s = sana.getSeconds();
  return { soat: h * 30 + m * 0.5, daqiqa: m * 6 + s * 0.1, soniya: s * 6 };
}
