// REV275: gapni so'zma-so'z solishtirish (diktant va gapirish uchun) — katta-kichik harf, tinish belgilari, apostrof farqi hisobga olinmaydi
export function sozlarNorm(t = "") {
  return String(t).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);
}
function yaqin(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, f = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else { f++; if (f > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } }
  return f + (a.length - i) + (b.length - j) <= 1 && a.length > 3;   // uzun so'zda bitta harf xatosi kechiriladi
}
/** kerak (namuna) va aytilgan/yozilgan gap: har so'z topildimi (tartib bo'yicha, LCS), foiz */
export function gapSolishtir(kerak, berildi, qatiy = false) {   // qatiy — diktant: imlo aniq bo'lishi kerak
  const a = sozlarNorm(kerak), b = sozlarNorm(berildi);
  const n = a.length, m = b.length, dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = (qatiy ? a[i] === b[j] : yaqin(a[i], b[j])) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Array(n).fill(false); let i = 0, j = 0;
  while (i < n && j < m) { if (qatiy ? a[i] === b[j] : yaqin(a[i], b[j])) { ok[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  const togri = ok.filter(Boolean).length; const ortiqcha = Math.max(0, m - togri);
  const foiz = n ? Math.max(0, Math.round((100 * (togri - 0.5 * ortiqcha)) / n)) : 0;
  return { foiz: Math.min(100, foiz), sozlar: a.map((s, k) => ({ kerak: s, ok: ok[k] })) };
}
