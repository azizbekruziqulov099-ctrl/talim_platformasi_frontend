// REV605: butun tizim uchun bitta navigatsiya tarixi (ortga ‹ / oldinga ›). Tepadagi ramka tugmalari ham, telefonning
// o'z «orqaga» tugmasi ham shu tarixdan yuradi. Har yozuv — «bo'lim (tab) + Kurslar ichidagi holat» surati.
import { useSyncExternalStore } from "react";

const timeline = [];   // { key, tab, kurslar }
let pos = -1;
let restoring = false;
let version = 0;
const listeners = new Set();
let tabProvider = null;       // () => ({ key, snap })
let tabApplier = null;        // (snap) => void
let kurslarProvider = null;   // () => ({ key, snap }) | null
let kurslarApplier = null;    // (snap) => void
let pendingKurslar = null;    // Kurslar hali ochilmagan bo'lsa — ochilganda qo'llanadi

const notify = () => { version += 1; listeners.forEach((l) => l()); };

export function navTabUlash(provider, applier) { tabProvider = provider; tabApplier = applier; return () => { if (tabProvider === provider) { tabProvider = null; tabApplier = null; } }; }
export function navKurslarUlash(provider, applier) {
  kurslarProvider = provider; kurslarApplier = applier;
  if (pendingKurslar) { const p = pendingKurslar; pendingKurslar = null; try { applier(p); } catch { /* */ } }
  return () => { if (kurslarProvider === provider) { kurslarProvider = null; kurslarApplier = null; } };
}

/** Joriy holat suratini tarixga yozadi (bir xil bo'lsa — yozmaydi; tiklash paytida — yozmaydi). */
export function navYoz() {
  if (restoring || !tabProvider) return;
  const t = tabProvider(); if (!t || !t.key) return;
  const k = kurslarProvider ? kurslarProvider() : null;
  const key = `${t.key}#${k?.key || ""}`;
  if (timeline[pos]?.key === key) { timeline[pos] = { key, tab: t.snap, kurslar: k?.snap || null }; return; }
  timeline.length = pos + 1;   // yangi yo'l — «oldinga» tarixi o'chadi (brauzer kabi)
  timeline.push({ key, tab: t.snap, kurslar: k?.snap || null });
  if (timeline.length > 60) timeline.shift();
  pos = timeline.length - 1;
  notify();
}

function qolla(e) {
  restoring = true;
  try {
    if (e.tab && tabApplier) tabApplier(e.tab);
    if (e.kurslar) { if (kurslarApplier) kurslarApplier(e.kurslar); else pendingKurslar = e.kurslar; }
    else if (kurslarApplier) kurslarApplier(null);   // Kurslar ichida emas edi — bosh ro'yxat
  } finally {
    // React holatni yangilab bo'lguncha (effektlar ishlab bo'lguncha) yangi yozuv qo'shilmaydi
    const tugat = () => { restoring = false; notify(); };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => requestAnimationFrame(tugat)); else setTimeout(tugat, 50);
  }
}

export function navOrtga() { if (pos <= 0) return false; pos -= 1; qolla(timeline[pos]); notify(); return true; }
export function navOldinga() { if (pos >= timeline.length - 1) return false; pos += 1; qolla(timeline[pos]); notify(); return true; }
export const navOrtgaBormi = () => pos > 0;
export const navOldingaBormi = () => pos < timeline.length - 1;
export const navTiklanmoqda = () => restoring;

export function useNavHolat() {
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version, () => 0);
  return { ortga: pos > 0, oldinga: pos < timeline.length - 1 };
}
