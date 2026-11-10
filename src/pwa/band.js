// REV466: «band» — o'quvchi dars, test yoki o'yin o'rtasida. Yangi versiya chiqsa, band bo'lsa sahifa yangilanmaydi
// (faqat «🔄 Yangilash» lavhasi), bo'sh bo'lsa — keyingi qulay paytda o'zi yangilanadi.
import { useEffect } from "react";

export const bandmi = () => (typeof window !== "undefined" && (window.__kbBand || 0) > 0);

export function useBand(faol) {
  useEffect(() => {
    if (!faol || typeof window === "undefined") return undefined;
    window.__kbBand = (window.__kbBand || 0) + 1;
    return () => { window.__kbBand = Math.max(0, (window.__kbBand || 1) - 1); window.dispatchEvent(new Event("kb-band-tugadi")); };
  }, [faol]);
}

/** Komponent ko'rinishida: <BandBelgi /> — ko'rinib turgan paytda «band». */
export function BandBelgi() { useBand(true); return null; }
