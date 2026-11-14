// REV565: «Virtual doska» — funksiya grafigi. O'quvchi ifodani O'Z SONLARI bilan yozadi (x^2-4x+3, 2^x, sin(x)…) yoki parametrlarni (a, b, c…)
// sirpanuvchi bilan o'zgartiradi; grafik darhol chiziladi. Nollar, ekstremum va aniq integral (yuza) hisoblab ko'rsatiladi.
// Hisob: grafikRules.js (testlangan). Chizish: SVG. Surish (sichqoncha/barmoq) va yaqinlashtirish tugmalari bor.
import React, { useMemo, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { ekstremumlar, funksiya, ifodaTayyorla, integral as integralHisob, nollar, sonMatni, tiklar, yollar } from "./grafikRules.js";

const W = 340, H = 280;
const PRESET = [
  { nom: "kx + b", ifoda: "k*x+b", p: { k: 1, b: 0 } }, { nom: "ax² + bx + c", ifoda: "a*x^2+b*x+c", p: { a: 1, b: 0, c: 0 } }, { nom: "A·sin(Bx + C)", ifoda: "A*sin(B*x+C)", p: { A: 1, B: 1, C: 0 } },
  { nom: "aˣ", ifoda: "a^x", p: { a: 2 } }, { nom: "ln x", ifoda: "ln(x)", p: {} }, { nom: "|x − a|", ifoda: "abs(x-a)", p: { a: 0 } }, { nom: "√x", ifoda: "sqrt(x)", p: {} },
];
const sinf = (v) => Math.min(Math.max(v, -1e9), 1e9);

/** y oralig'ini funksiyaga moslash: qiymatlarning 3–97 foizi, 0 ni ham o'z ichiga oladi, atrofiga bo'sh joy. */
function yMosla(f, xmin, xmax) {
  const v = []; for (let i = 0; i <= 300; i += 1) { const y = f(xmin + ((xmax - xmin) * i) / 300); if (Number.isFinite(y) && Math.abs(y) < 1e6) v.push(y); }
  if (v.length < 2) return [-5, 5]; v.sort((a, b) => a - b);
  let lo = Math.min(v[Math.floor(v.length * 0.03)], 0), hi = Math.max(v[Math.ceil(v.length * 0.97) - 1], 0); if (hi - lo < 2) { lo -= 1; hi += 1; }
  const p = (hi - lo) * 0.12; return [lo - p, hi + p];
}

export default function FunksiyaDoska({ ifoda = "x^2", parametrlar = {}, xr = null, yr = null, integral: integ = null }) {
  const [matn, setMatn] = useState(ifoda); const [qiym, setQiym] = useState({ ...parametrlar });
  const boshX = xr || [-6, 6];
  const t = useMemo(() => ifodaTayyorla(matn), [matn]);
  const par = useMemo(() => Object.fromEntries((t.parametrlar || []).map((p) => [p, qiym[p] ?? parametrlar[p] ?? 1])), [t, qiym, parametrlar]);
  const f = useMemo(() => (t.daraxt ? funksiya(t.daraxt, par) : null), [t, par]);
  const [oyna, setOyna] = useState(() => { const tt = ifodaTayyorla(ifoda); const ff = tt.daraxt ? funksiya(tt.daraxt, { ...Object.fromEntries((tt.parametrlar || []).map((p) => [p, parametrlar[p] ?? 1])) }) : null;
    const y = yr || (ff ? yMosla(ff, boshX[0], boshX[1]) : [-5, 5]); return { x0: boshX[0], x1: boshX[1], y0: y[0], y1: y[1] }; });
  const [integOchiq, setIntegOchiq] = useState(Boolean(integ)); const [ia, setIa] = useState(String(integ?.a ?? 0)); const [ib, setIb] = useState(String(integ?.b ?? 1));
  const surish = useRef(null);

  const tanla = (p) => { setMatn(p.ifoda); setQiym({ ...p.p }); const ff = funksiya(ifodaTayyorla(p.ifoda).daraxt, p.p); if (!yr) { const y = yMosla(ff, oyna.x0, oyna.x1); setOyna((o) => ({ ...o, y0: y[0], y1: y[1] })); } };
  const matnOzgardi = (v) => { setMatn(v); if (!yr) { const tt = ifodaTayyorla(v); if (tt.daraxt) { const y = yMosla(funksiya(tt.daraxt, Object.fromEntries((tt.parametrlar || []).map((p) => [p, qiym[p] ?? parametrlar[p] ?? 1]))), oyna.x0, oyna.x1); setOyna((o) => ({ ...o, y0: y[0], y1: y[1] })); } } };
  const zoom = (k) => setOyna((o) => { const cx = (o.x0 + o.x1) / 2, cy = (o.y0 + o.y1) / 2, hx = ((o.x1 - o.x0) / 2) * k, hy = ((o.y1 - o.y0) / 2) * k; return { x0: cx - hx, x1: cx + hx, y0: cy - hy, y1: cy + hy }; });
  const qaytar = () => { const y = yr || (f ? yMosla(f, boshX[0], boshX[1]) : [-5, 5]); setOyna({ x0: boshX[0], x1: boshX[1], y0: y[0], y1: y[1] }); };

  const sx = (x) => ((x - oyna.x0) / (oyna.x1 - oyna.x0)) * W; const sy = (y) => H - ((y - oyna.y0) / (oyna.y1 - oyna.y0)) * H;
  const hisob = useMemo(() => {
    if (!f) return null; const bal = oyna.y1 - oyna.y0;
    return { yo: yollar(f, oyna.x0, oyna.x1, oyna.y0, oyna.y1), nol: nollar(f, oyna.x0, oyna.x1), eks: ekstremumlar(f, oyna.x0, oyna.x1), y0: f(0), bal };
  }, [f, oyna]);
  const na = Number(String(ia).replace(",", ".")), nb = Number(String(ib).replace(",", "."));
  const I = integOchiq && f && Number.isFinite(na) && Number.isFinite(nb) ? integralHisob(f, na, nb) : null;
  const soya = useMemo(() => {
    if (!integOchiq || !f || !Number.isFinite(na) || !Number.isFinite(nb) || na === nb) return "";
    const a = Math.max(Math.min(na, nb), oyna.x0), b = Math.min(Math.max(na, nb), oyna.x1); if (a >= b) return "";
    const nuq = []; for (let i = 0; i <= 240; i += 1) { const x = a + ((b - a) * i) / 240; const y = f(x); if (!Number.isFinite(y)) return ""; nuq.push(`${sx(x).toFixed(1)},${sy(sinf(Math.min(Math.max(y, oyna.y0 - 5 * (oyna.y1 - oyna.y0)), oyna.y1 + 5 * (oyna.y1 - oyna.y0)))).toFixed(1)}`); }
    return `M${sx(a).toFixed(1)},${sy(0).toFixed(1)} L${nuq.join(" L")} L${sx(b).toFixed(1)},${sy(0).toFixed(1)} Z`;
  }, [integOchiq, f, na, nb, oyna]); // eslint-disable-line react-hooks/exhaustive-deps

  const xt = tiklar(oyna.x0, oyna.x1, 7), yt = tiklar(oyna.y0, oyna.y1, 6);
  const o0x = Math.min(Math.max(sx(0), 0), W), o0y = Math.min(Math.max(sy(0), 0), H);
  const bosish = (e) => { surish.current = { x: e.clientX, y: e.clientY, o: { ...oyna }, mouse: e.pointerType === "mouse" }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const siljish = (e) => { const s = surish.current; if (!s) return; const r = e.currentTarget.getBoundingClientRect(); const dx = ((e.clientX - s.x) / r.width) * (s.o.x1 - s.o.x0); const dy = ((e.clientY - s.y) / r.height) * (s.o.y1 - s.o.y0);
    setOyna({ x0: s.o.x0 - dx, x1: s.o.x1 - dx, y0: s.mouse ? s.o.y0 + dy : s.o.y0, y1: s.mouse ? s.o.y1 + dy : s.o.y1 }); };

  return <div className="fd-root">
    <div className="fd-presetlar" role="group" aria-label={__kbUi("Funksiya turlari")}>{PRESET.map((p) => <button key={p.nom} type="button" onClick={() => tanla(p)} className={matn === p.ifoda ? "is-on" : ""}>{p.nom}</button>)}</div>
    <label className="fd-ifoda"><span>y =</span><input value={matn} onChange={(e) => matnOzgardi(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-label={__kbUi("Funksiya ifodasi")} maxLength={120} placeholder="x^2-4x+3" /></label>
    {t.xato ? <p className="fd-xato" role="alert">{__kbUi("Ifodani tushunmadim.")} {__kbUi("Masalan: x^2-4x+3, 2x+1, sin(x), 2^x, abs(x), sqrt(x), ln(x). Ko‘paytirish belgisi shart emas (2x), daraja uchun ^.")}</p> : <>
      {t.parametrlar.length > 0 && <div className="fd-par">{t.parametrlar.map((p) => <label key={p}><b>{p}</b>
        <input type="range" min="-10" max="10" step="0.1" value={Math.min(10, Math.max(-10, par[p]))} onChange={(e) => setQiym({ ...qiym, [p]: Number(e.target.value) })} aria-label={`${__kbUi("parametr")} ${p}`} />
        <input type="number" step="0.1" value={Number.isFinite(par[p]) ? par[p] : 0} onChange={(e) => setQiym({ ...qiym, [p]: Number(e.target.value) })} aria-label={`${p} ${__kbUi("qiymati")}`} /></label>)}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="fd-svg" onPointerDown={bosish} onPointerMove={siljish} onPointerUp={() => { surish.current = null; }} onPointerCancel={() => { surish.current = null; }} role="img" aria-label={__kbUi("Funksiya grafigi")}>
        <defs><clipPath id="fd-kes"><rect x="0" y="0" width={W} height={H} /></clipPath></defs>
        {xt.map((v) => <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1="0" y2={H} className={v === 0 ? "fd-o" : "fd-g"} />)}{yt.map((v) => <line key={`gy${v}`} y1={sy(v)} y2={sy(v)} x1="0" x2={W} className={v === 0 ? "fd-o" : "fd-g"} />)}
        <line x1="0" x2={W} y1={o0y} y2={o0y} className="fd-o" /><line y1="0" y2={H} x1={o0x} x2={o0x} className="fd-o" />
        {xt.filter((v) => v !== 0).map((v) => <text key={`tx${v}`} x={sx(v)} y={Math.min(Math.max(o0y + 12, 11), H - 3)} className="fd-t" textAnchor="middle">{sonMatni(v, 3)}</text>)}
        {yt.filter((v) => v !== 0).map((v) => <text key={`ty${v}`} x={Math.min(Math.max(o0x - 4, 18), W - 2)} y={sy(v) + 3} className="fd-t" textAnchor="end">{sonMatni(v, 3)}</text>)}
        <g clipPath="url(#fd-kes)">
          {soya && <path d={soya} className="fd-soya" />}
          {hisob?.yo.map((yol, i) => <path key={i} className="fd-egri" d={`M${yol.map(([x, y]) => `${sx(x).toFixed(1)},${sy(sinf(y)).toFixed(1)}`).join(" L")}`} />)}
          {hisob?.nol.map((x) => <circle key={`n${x}`} cx={sx(x)} cy={sy(0)} r="4" className="fd-nol" />)}
          {hisob?.eks.map((e) => <circle key={`e${e.x}`} cx={sx(e.x)} cy={sy(e.y)} r="4" className={e.tur === "max" ? "fd-max" : "fd-min"} />)}
        </g>
      </svg>
      <div className="fd-tugmalar"><button type="button" onClick={() => zoom(0.7)} aria-label={__kbUi("Yaqinlashtirish")}>＋</button><button type="button" onClick={() => zoom(1.4)} aria-label={__kbUi("Uzoqlashtirish")}>－</button>
        <button type="button" onClick={() => { if (f) { const y = yMosla(f, oyna.x0, oyna.x1); setOyna((o) => ({ ...o, y0: y[0], y1: y[1] })); } }}>↕ {__kbUi("Moslash")}</button><button type="button" onClick={qaytar}>↺ {__kbUi("Boshiga")}</button>
        <label className="fd-integral-tugma"><input type="checkbox" checked={integOchiq} onChange={(e) => setIntegOchiq(e.target.checked)} /> ∫ {__kbUi("yuza")}</label></div>
      {integOchiq && <div className="fd-integral"><label>a <input value={ia} onChange={(e) => setIa(e.target.value)} inputMode="decimal" aria-label={__kbUi("Quyi chegara")} /></label><label>b <input value={ib} onChange={(e) => setIb(e.target.value)} inputMode="decimal" aria-label={__kbUi("Yuqori chegara")} /></label>
        <p>∫ₐᵇ f(x) dx ≈ <b>{I === null ? "—" : sonMatni(I, 5)}</b>{I !== null && !Number.isFinite(I) && <small> · {__kbUi("funksiya shu oraliqda uzluksiz emas")}</small>}</p></div>}
      {hisob && <ul className="fd-natija">
        <li>{__kbUi("Nollari")}: {hisob.nol.length ? hisob.nol.map((x) => `x ≈ ${sonMatni(x)}`).join(", ") : __kbUi("ko‘rinib turgan oynada yo‘q")}</li>
        {hisob.eks.length > 0 && <li>{__kbUi("Ekstremum")}: {hisob.eks.map((e) => `${e.tur === "max" ? "max" : "min"} (${sonMatni(e.x)}; ${sonMatni(e.y)})`).join(", ")}</li>}
        <li>f(0) = {Number.isFinite(hisob.y0) ? sonMatni(hisob.y0) : __kbUi("aniqlanmagan")}</li></ul>}</>}
  </div>;
}
