// REV121: bolalar sahifalari (bog'cha darsi, bog'cha olami, darslar ro'yxati) tungi rejimda ham yorqin qoladi —
// rasmlar, ranglar va emoji bolaga tanish ko'rinishda bo'lsin. html[data-kb-kid="1"] — interface.css qarang.
import { useEffect } from "react";

let active = 0;
export function useKeepLight(on = true) {
  useEffect(() => {
    if (!on || typeof document === "undefined") return undefined;
    active += 1;
    document.documentElement.dataset.kbKid = "1";
    return () => {
      active = Math.max(0, active - 1);
      if (!active) delete document.documentElement.dataset.kbKid;
    };
  }, [on]);
}
