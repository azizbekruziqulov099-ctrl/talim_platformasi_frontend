// REV112: bugungi ob-havo va kun vaqti (bog'cha olami va dars sahnasi uchun). Server 30 daqiqada bir marta oladi.
import { useEffect, useState } from "react";
import { havoTuri, kunVaqti } from "./ustozRules.js";

export function useHavo(apiBase, yoq = false) {
  const [d, setD] = useState({ havo: havoTuri(), harorat: null, kunduz: null, shamol: false });
  const [vaqt, setVaqt] = useState(() => kunVaqti());
  useEffect(() => {
    if (yoq || !apiBase) return undefined;
    const c = new AbortController();
    let shahar = "toshkent";
    try { shahar = globalThis.localStorage?.getItem("kabutar:shahar") || shahar; } catch { /* */ }
    fetch(`${String(apiBase).replace(/\/+$/, "")}/api/bogcha/havo?${new URLSearchParams({ shahar })}`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((x) => { if (x) setD({ havo: havoTuri(x.kod), harorat: x.harorat ?? null, kunduz: x.kunduz ?? null, shamol: Number(x.shamol) >= 30 }); })
      .catch(() => { /* fasl bo'yicha */ });
    return () => c.abort();
  }, [apiBase, yoq]);
  useEffect(() => {
    if (yoq) return undefined;
    const tick = () => setVaqt(kunVaqti(new Date().getHours(), d.kunduz));
    tick();
    const t = setInterval(tick, 300000);
    return () => clearInterval(t);
  }, [d.kunduz, yoq]);
  return { ...d, vaqt };
}
