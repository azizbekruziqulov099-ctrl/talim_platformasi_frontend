// REV566: aniq geometrik chizma — server (tools/mat_bank/geo_chizma.py) HISOBLAGAN shaklni masshtabda ekranga joylash. Sof funksiyalar (brauzersiz sinaladi).
// Shakl: {nuqtalar:{ism:[x,y]}, kesmalar:[{a,b,yozuv,uzuq}], burchaklar:[{uch,a,b,tur,yozuv}], dumaloqlar:[{c,r}], korinadigan:[ism], chegara:[x0,y0,x1,y1]}.

/** Shaklni W × (balandlik) ga masshtabni BUZMASDAN joylaydi: bir xil s (px/birlik) ikkala o'qda. → { W, H, s, nuqta([x,y]) → [px,py] }. */
export function moslash(shakl, W = 340, Hmax = 300, pad = 38) {
  const [x0, y0, x1, y1] = shakl.chegara; const dx = Math.max(x1 - x0, 1e-9), dy = Math.max(y1 - y0, 1e-9);
  const s = Math.min((W - 2 * pad) / dx, (Hmax - 2 * pad) / dy); const ox = (W - dx * s) / 2;
  return { W, H: dy * s + 2 * pad, s, nuqta: (p) => [ox + (p[0] - x0) * s, pad + (y1 - p[1]) * s] };
}
const birlik = (v) => { const n = Math.hypot(v[0], v[1]); return n < 1e-12 ? [0, 0] : [v[0] / n, v[1] / n]; };

/** Ekran koordinatalarida: uchlar yorlig'i, kesma yozuvlari, burchak belgilari. */
export function belgilar(shakl, M) {
  const P = Object.fromEntries(Object.entries(shakl.nuqtalar).map(([k, v]) => [k, M.nuqta(v)]));
  const asos = (shakl.korinadigan || Object.keys(P)).filter((k) => !["O", "E", "H", "M"].includes(k)); const nom = asos.length ? asos : Object.keys(P);
  const mr = nom.reduce((a, k) => [a[0] + P[k][0] / nom.length, a[1] + P[k][1] / nom.length], [0, 0]);   // shaklning markazi
  const uchlar = (shakl.korinadigan || Object.keys(P)).map((k) => { const p = P[k]; const u = birlik([p[0] - mr[0], p[1] - mr[1]]); const ichki = ["O", "E", "H"].includes(k); return { ism: k, p, y: ichki ? [p[0] + 9, p[1] - 8] : [p[0] + u[0] * 15, p[1] + u[1] * 15 + 4] }; });
  const yozuvlar = shakl.kesmalar.filter((k) => k.yozuv).map((k) => { const a = P[k.a], b = P[k.b]; let n = birlik([-(b[1] - a[1]), b[0] - a[0]]);
    // markazdan o'tadigan kesmaning (diagonal) yozuvi o'rtada qolsa boshqasi bilan ustma-ust tushadi: uni uchi tomonga 30% siljitamiz
    const markazdan = Math.abs((mr[0] - a[0]) * n[0] + (mr[1] - a[1]) * n[1]) < 8; const t = k.uzuq && markazdan ? 0.3 : 0.5; const o = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    if ((o[0] - mr[0]) * n[0] + (o[1] - mr[1]) * n[1] < 0) n = [-n[0], -n[1]]; const kuch = k.uzuq ? 11 : 13; return { matn: k.yozuv, p: [o[0] + n[0] * kuch, o[1] + n[1] * kuch + 4], uzuq: k.uzuq }; });
  const burchaklar = shakl.burchaklar.map((b) => { const p = P[b.uch], u = birlik([P[b.a][0] - p[0], P[b.a][1] - p[1]]), v = birlik([P[b.b][0] - p[0], P[b.b][1] - p[1]]);
    if (b.tur === "togri") { const r = 10; return { tur: "togri", yol: `M${(p[0] + u[0] * r).toFixed(2)},${(p[1] + u[1] * r).toFixed(2)} L${(p[0] + (u[0] + v[0]) * r).toFixed(2)},${(p[1] + (u[1] + v[1]) * r).toFixed(2)} L${(p[0] + v[0] * r).toFixed(2)},${(p[1] + v[1] * r).toFixed(2)}`, u, v, p }; }
    const r = 22; const cross = u[0] * v[1] - u[1] * v[0]; const bis = birlik([u[0] + v[0], u[1] + v[1]]);
    return { tur: "yoy", yol: `M${(p[0] + u[0] * r).toFixed(2)},${(p[1] + u[1] * r).toFixed(2)} A${r},${r} 0 0 ${cross > 0 ? 1 : 0} ${(p[0] + v[0] * r).toFixed(2)},${(p[1] + v[1] * r).toFixed(2)}`, matn: b.yozuv, y: [p[0] + bis[0] * 38, p[1] + bis[1] * 38 + 4], u, v, p, r }; });
  return { P, uchlar, yozuvlar, burchaklar };
}
