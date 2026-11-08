// REV431: haqiqiy 3D Kabu — three.js bilan shakllardan yig'ilgan (bosh, yuz ekrani, qanotchalar, do'ppi, chopon, bayroq
// nishoni, qo'llar). Yuz ekrani jonli chiziladi: ko'zlar pirpiraydi, gapirganda og'iz ochiladi, xursand bo'lsa ko'zlar «^^».
// Aylanish — haqiqiy 3D (orqasi, yonlari ko'rinadi); barmoq yoki sichqoncha bilan surib aylantirish ham mumkin.
// Ekranda ko'rinmasa chizish to'xtaydi (batareya tejaladi). WebGL bo'lmasa — null (chaqiruvchi SVG Kabuni ko'rsatadi).
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function webglBormi() {
  try { const c = document.createElement("canvas"); return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch { return false; }
}

function yuzChiz(ctx, w, h, holat, t) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#2b3a7a"); g.addColorStop(1, "#141d4a");
  ctx.fillStyle = g;
  const r = h * 0.32;
  ctx.beginPath(); ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.ellipse(w * 0.3, h * 0.2, w * 0.22, h * 0.08, -0.2, 0, Math.PI * 2); ctx.fill();
  const ex = [w * 0.31, w * 0.69], ey = h * 0.43, er = h * 0.17;
  const pirpira = (t % 4.2) > 4.05;
  ctx.lineCap = "round";
  for (const x of ex) {
    if (holat.xursand) {
      ctx.strokeStyle = "#6ff0e0"; ctx.lineWidth = h * 0.07;
      ctx.beginPath(); ctx.arc(x, ey + er * 0.35, er * 0.75, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (pirpira) {
      ctx.strokeStyle = "#6ff0e0"; ctx.lineWidth = h * 0.05;
      ctx.beginPath(); ctx.moveTo(x - er * 0.8, ey); ctx.lineTo(x + er * 0.8, ey); ctx.stroke();
    } else {
      ctx.fillStyle = "#e9fffb"; ctx.beginPath(); ctx.arc(x, ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#20c6a8"; ctx.beginPath(); ctx.arc(x + er * 0.08, ey + er * 0.05, er * 0.68, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0d2440"; ctx.beginPath(); ctx.arc(x + er * 0.12, ey + er * 0.08, er * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x - er * 0.25, ey - er * 0.3, er * 0.18, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(255,140,170,.55)";
  for (const x of [w * 0.16, w * 0.84]) { ctx.beginPath(); ctx.ellipse(x, h * 0.66, w * 0.06, h * 0.045, 0, 0, Math.PI * 2); ctx.fill(); }
  const my = h * 0.72, ochiq = holat.gapiryapti ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) : 0;
  if (ochiq > 0.3) {
    ctx.fillStyle = "#ff8fb0"; ctx.beginPath(); ctx.ellipse(w / 2, my, w * 0.07, h * 0.03 + h * 0.06 * ochiq, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = "#ff8fb0"; ctx.lineWidth = h * 0.045;
    ctx.beginPath(); ctx.arc(w / 2, my - h * 0.06, w * 0.08, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }
}

function chizilganTekstura(w, h, fn) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function choponTekstura() {
  return chizilganTekstura(512, 256, (ctx, w, h) => {
    const ranglar = ["#e94b5b", "#f6b23c", "#3fa96b", "#2f8fd6", "#8a4fbf", "#f07f2e", "#d23f8f", "#2fb5a7"];
    const qadam = w / 32;
    for (let i = 0; i < 32; i += 1) { ctx.fillStyle = ranglar[i % ranglar.length]; ctx.fillRect(i * qadam, 0, qadam + 1, h); }
    ctx.globalAlpha = 0.22; ctx.fillStyle = "#fff";
    for (let i = 0; i < 32; i += 2) for (let y = 0; y < h; y += 22) { ctx.beginPath(); ctx.moveTo(i * qadam + qadam / 2, y); ctx.lineTo(i * qadam + qadam, y + 11); ctx.lineTo(i * qadam + qadam / 2, y + 22); ctx.lineTo(i * qadam, y + 11); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.fillStyle = "#1f8a4c"; ctx.fillRect(0, h - 26, w, 14);
    ctx.fillStyle = "#f6d77a"; for (let x = 0; x < w; x += 16) ctx.fillRect(x, h - 22, 8, 6);
  });
}

function doppiTekstura() {
  return chizilganTekstura(512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f4f4f4";
    for (let i = 0; i < 8; i += 1) {
      const x = (i + 0.5) * (w / 8), y = h * 0.52;
      ctx.beginPath(); ctx.moveTo(x, y - h * 0.32); ctx.bezierCurveTo(x + 18, y - 10, x + 18, y + 10, x, y + h * 0.3); ctx.bezierCurveTo(x - 18, y + 10, x - 18, y - 10, x, y - h * 0.32); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f4f4f4";
    }
  });
}

function bayroqTekstura() {
  return chizilganTekstura(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#1eb5e6"; ctx.fillRect(0, 0, w, h / 3);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, h / 3, w, h / 3);
    ctx.fillStyle = "#1eb53a"; ctx.fillRect(0, (2 * h) / 3, w, h / 3);
    ctx.fillStyle = "#ce1126"; ctx.fillRect(0, h / 3 - 4, w, 6); ctx.fillRect(0, (2 * h) / 3 - 2, w, 6);
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(w * 0.3, h * 0.17, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1eb5e6"; ctx.beginPath(); ctx.arc(w * 0.34, h * 0.16, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#e0a93a"; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); ctx.stroke();
  });
}

function qanotGeom() {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.bezierCurveTo(0.25, 0.15, 0.55, 0.55, 0.42, 0.95); s.bezierCurveTo(0.2, 0.7, 0.05, 0.4, 0, 0);
  return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
}

export default function Kabu3D({ mood = "", celebrate = 0, aylan = 0, gapiryapti = false, className = "" }) {
  const host = useRef(null);
  const holat = useRef({ mood, gapiryapti, aylanBosh: -1, sakrashBosh: -1 });
  useEffect(() => { holat.current.mood = mood; holat.current.gapiryapti = gapiryapti || /talk/.test(mood); }, [mood, gapiryapti]);
  useEffect(() => { if (aylan) holat.current.aylanBosh = performance.now(); }, [aylan]);
  useEffect(() => { if (celebrate) holat.current.sakrashBosh = performance.now(); }, [celebrate]);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 1.25, 9.2); camera.lookAt(0, 1.05, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c9e0, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 5, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fdcff, 0.9); rim.position.set(-4, 3, -5); scene.add(rim);

    const kabu = new THREE.Group(); scene.add(kabu);
    const oq = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.02, emissive: 0x2a3340, emissiveIntensity: 0.25 });
    // bosh
    const bosh = new THREE.Group(); bosh.position.y = 2.05; kabu.add(bosh);
    const boshM = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), oq); boshM.scale.set(1.22, 0.98, 0.95); bosh.add(boshM);
    // yuz ekrani (old tomonga egilgan)
    const yuzC = document.createElement("canvas"); yuzC.width = 512; yuzC.height = 340;
    const yuzT = new THREE.CanvasTexture(yuzC); yuzT.colorSpace = THREE.SRGBColorSpace;
    const yuzG = new THREE.PlaneGeometry(1.75, 1.16, 24, 12);
    const p = yuzG.attributes.position;
    for (let i = 0; i < p.count; i += 1) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -0.32 * x * x - 0.28 * y * y); }
    yuzG.computeVertexNormals();
    const yuz = new THREE.Mesh(yuzG, new THREE.MeshStandardMaterial({ map: yuzT, roughness: 0.25, metalness: 0.1, emissive: 0x111a3a, emissiveMap: yuzT, emissiveIntensity: 0.55, transparent: true, alphaTest: 0.05 }));
    yuz.position.set(0, -0.02, 0.99); bosh.add(yuz);   // bosh sirtidan biroz oldinda (egilgan ekran)
    // qanotchalar
    const qG = qanotGeom();
    [[1, 0x2bb3d9], [-1, 0x2fae5a]].forEach(([side, rang], i) => {
      const q = new THREE.Mesh(qG, new THREE.MeshStandardMaterial({ color: rang, roughness: 0.45 }));
      q.position.set(side * 1.08, 0.15, 0); q.rotation.set(0, side > 0 ? 0 : Math.PI, side * -0.35); q.scale.setScalar(0.95); bosh.add(q);
      const q2 = new THREE.Mesh(qG, new THREE.MeshStandardMaterial({ color: i ? 0x2bb3d9 : 0x2fae5a, roughness: 0.45 }));
      q2.position.set(side * 1.12, -0.05, -0.05); q2.rotation.set(0, side > 0 ? 0 : Math.PI, side * -0.9); q2.scale.setScalar(0.75); bosh.add(q2);
    });
    // do'ppi (to'rt burchakli)
    const doppi = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.8, 0.5, 4, 1, false), [
      new THREE.MeshStandardMaterial({ map: doppiTekstura(), roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: 0x111111 })]);
    doppi.rotation.y = Math.PI / 4; doppi.position.y = 0.98; bosh.add(doppi);
    // bo'yin va tana (chopon)
    const tana = new THREE.Group(); tana.position.y = 0.55; kabu.add(tana);
    const choponM = new THREE.MeshStandardMaterial({ map: choponTekstura(), roughness: 0.75 });
    const tanaM = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.02, 1.5, 40, 1, false), choponM); tana.add(tanaM);
    const etak = new THREE.Mesh(new THREE.SphereGeometry(1.02, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), choponM); etak.position.y = -0.75; etak.scale.y = 0.35; tana.add(etak);
    const yoqa = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.09, 12, 32), new THREE.MeshStandardMaterial({ color: 0xf2a83a, roughness: 0.5 })); yoqa.rotation.x = Math.PI / 2; yoqa.position.y = 0.75; tana.add(yoqa);
    const nishon = new THREE.Mesh(new THREE.CircleGeometry(0.36, 40), new THREE.MeshStandardMaterial({ map: bayroqTekstura(), roughness: 0.4 })); nishon.position.set(0, 0.05, 0.93); nishon.rotation.x = -0.12; tana.add(nishon);
    // qo'llar
    const qollar = [1, -1].map((side) => {
      const yelka = new THREE.Group(); yelka.position.set(side * 0.92, 0.55, 0); tana.add(yelka);
      const yeng = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.85, 16), choponM); yeng.position.y = -0.4; yelka.add(yeng);
      const qol = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), oq); qol.position.y = -0.88; yelka.add(qol);
      yelka.rotation.z = side * 0.35; return yelka;
    });
    // tagidagi nur halqasi
    const halqa = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.25, 48), new THREE.MeshBasicMaterial({ color: 0x7cc7ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    halqa.rotation.x = -Math.PI / 2; halqa.position.y = -0.55; scene.add(halqa);

    // o'lcham
    const olcham = () => { const w = el.clientWidth || 200, h = el.clientHeight || 240; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    olcham();
    const ro = new ResizeObserver(olcham); ro.observe(el);
    // surib aylantirish
    let surish = null, qolBurchak = 0;
    const bos = (e) => { surish = { x: e.clientX, b: qolBurchak }; };
    const yur = (e) => { if (surish) qolBurchak = surish.b + (e.clientX - surish.x) * 0.012; };
    const qoy = () => { surish = null; };
    renderer.domElement.addEventListener("pointerdown", bos); window.addEventListener("pointermove", yur); window.addEventListener("pointerup", qoy);
    // faqat ko'rinib turganda chizamiz
    let korinadi = true;
    const io = new IntersectionObserver(([e]) => { korinadi = e.isIntersecting; }, { threshold: 0.01 }); io.observe(el);

    let id = 0;
    const t0 = performance.now();
    const silliq = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
    const kadr = (now) => {
      id = requestAnimationFrame(kadr);
      if (!korinadi || document.hidden) return;
      const t = (now - t0) / 1000, h = holat.current;
      const xursand = /happy|enc|clap/.test(h.mood) || (h.sakrashBosh > 0 && now - h.sakrashBosh < 1600);
      const ctx = yuzC.getContext("2d"); yuzChiz(ctx, yuzC.width, yuzC.height, { xursand, gapiryapti: h.gapiryapti }, t); yuzT.needsUpdate = true;
      // aylanish (1,4 s, to'liq 360°)
      let ay = 0;
      if (h.aylanBosh > 0) { const k = (now - h.aylanBosh) / 1400; if (k >= 1) { h.aylanBosh = -1; } else ay = silliq(k) * Math.PI * 2; }
      if (!surish) qolBurchak *= 0.94;
      kabu.rotation.y = Math.sin(t * 0.6) * 0.12 + ay + qolBurchak;
      // sakrash va tebranish
      let sakra = 0;
      if (h.sakrashBosh > 0) { const k = (now - h.sakrashBosh) / 900; if (k < 1) sakra = Math.sin(Math.PI * k) * 0.45; }
      kabu.position.y = Math.sin(t * 1.8) * 0.05 + sakra;
      bosh.rotation.z = Math.sin(t * 0.9) * 0.04; bosh.rotation.x = h.gapiryapti ? Math.sin(t * 6) * 0.025 : 0;
      const qolTepa = xursand || /wave/.test(h.mood);
      qollar.forEach((q, i) => { const side = i ? -1 : 1; const maqsad = qolTepa ? side * (2.4 + Math.sin(t * 9 + i) * 0.25) : side * (0.35 + Math.sin(t * 1.6 + i) * 0.05); q.rotation.z += (maqsad - q.rotation.z) * 0.15; });
      halqa.material.opacity = 0.25 + Math.sin(t * 2) * 0.08;
      renderer.render(scene, camera);
    };
    id = requestAnimationFrame(kadr);
    return () => {
      cancelAnimationFrame(id); ro.disconnect(); io.disconnect();
      renderer.domElement.removeEventListener("pointerdown", bos); window.removeEventListener("pointermove", yur); window.removeEventListener("pointerup", qoy);
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => { x.map?.dispose?.(); x.dispose?.(); }); });
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={`kabu3d ${className}`} aria-hidden="true" />;
}
