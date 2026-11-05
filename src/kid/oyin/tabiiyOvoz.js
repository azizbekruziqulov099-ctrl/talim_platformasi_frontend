// REV364: tabiiy ovozlar (hayvon, qush, transport…) — /ovozlar/{nom}.mp3. Fayl bo'lmasa — jim (ustoz gapi baribir aytiladi).
import { useEffect, useRef } from "react";
const bor = new Map();   // nom → false (yo'q) — qayta urinmaslik uchun
export function tovushChal(nom) {
  if (!nom || bor.get(nom) === false || typeof Audio === "undefined") return null;
  try {
    const a = new Audio(`/ovozlar/${encodeURIComponent(nom)}.mp3`);
    a.onerror = () => bor.set(nom, false);
    a.play().catch(() => {});
    return a;
  } catch { return null; }
}
/** Raund boshida ustoz gapirib bo'lgach tabiiy ovozni bir marta chaladi. */
export function useTabiiyOvoz(nom, gapirmoqda, kalit) {
  const chalindi = useRef("");
  useEffect(() => {
    if (!nom || gapirmoqda || chalindi.current === `${kalit}|${nom}`) return;
    chalindi.current = `${kalit}|${nom}`;
    const t = setTimeout(() => tovushChal(nom), 250);
    return () => clearTimeout(t);
  }, [nom, gapirmoqda, kalit]);
}
