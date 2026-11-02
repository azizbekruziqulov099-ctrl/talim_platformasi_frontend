import React, { useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import { splitCourseMath } from "../courses/CourseText.jsx";
import { stripSpeechTags } from "../speech/language.js";
import { chalkUnits, chalkSlice } from "./chalkRules.js";

/**
 * REV260: doskaga harfma-harf yozish. Ustoz qaysi so'zni aytayotgan bo'lsa, doskadagi qator ham shu joygacha yoziladi:
 * `progress` (0–1) — ovozning shu qatorga tegishli qismidan qanchasi aytildi. Yozuv silliq quvib yetadi (bo'r bilan yozgandek).
 * Formulalar (KaTeX) chapdan o'ngga ochiladi. progress=null — qator to'liq ko'rinadi (yozib bo'lingan).
 */
export default function ChalkText({ text, progress = null, speed = 38 }) {
  const parts = useMemo(() => splitCourseMath(stripSpeechTags(text)).map((part) => {
    if (!part.math || part.math.length > 3000) return part;
    try {
      return { ...part, html: katex.renderToString(part.math, { displayMode: false, throwOnError: true, trust: false, strict: "ignore", maxExpand: 200, maxSize: 20, output: "html" }) };
    } catch { return part; }
  }), [text]);
  const units = useMemo(() => chalkUnits(parts), [parts]);
  const target = progress === null ? units.total : Math.max(0, Math.min(units.total, progress * units.total));
  const [shown, setShown] = useState(progress === null ? units.total : 0);
  const shownRef = useRef(shown);
  const reduce = useMemo(() => { try { return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches; } catch { return false; } }, []);

  useEffect(() => { if (progress === null || reduce) { shownRef.current = units.total; setShown(units.total); } }, [progress === null, units.total, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { shownRef.current = 0; setShown(progress === null ? units.total : 0); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (progress === null || reduce) return undefined;
    let raf = 0, last = 0;
    const tick = (t) => {
      const dt = last ? Math.min(80, t - last) : 16;
      last = t;
      const cur = shownRef.current;
      if (cur < target) {
        // orqada qolsa tezlashadi — ovozdan uzoq qolib ketmaydi
        const gap = target - cur;
        const step = Math.max(speed * dt / 1000, gap * dt / 260);
        shownRef.current = Math.min(target, cur + step);
        setShown(shownRef.current);
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, progress === null, reduce, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const pieces = chalkSlice(parts, units, shown);
  const writing = progress !== null && shown < units.total - 0.01;
  return <span className={`dx-chalk ${writing ? "is-writing" : ""}`}>
    {pieces.map((p, i) => p.html
      ? <span key={i} className="dx-math dx-chalk-math" style={p.frac < 1 ? { clipPath: `inset(0 ${Math.round((1 - p.frac) * 100)}% 0 0)` } : undefined}
        dangerouslySetInnerHTML={{ __html: p.html }} />
      : <React.Fragment key={i}>{p.text}</React.Fragment>)}
    {writing && <span className="dx-chalk-bor" aria-hidden="true" />}
    {/* ekran o'quvchilari uchun to'liq matn */}
    {writing && <span className="dx-sr">{stripSpeechTags(text)}</span>}
  </span>;
}
