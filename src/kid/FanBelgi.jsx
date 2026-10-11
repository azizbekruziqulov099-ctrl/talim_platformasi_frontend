import React from "react";

import { flagCode, flagSrc } from "./flags.js";

/** Fan belgisi: bayroq — SVG rasm, boshqa emoji — matn. */
export default function FanBelgi({ emoji, className = "" }) {
  const src = flagSrc(flagCode(emoji));
  if (!src) return <span className={className} aria-hidden="true">{emoji}</span>;
  return <img className={`kb-flag ${className}`} src={src} alt="" aria-hidden="true" draggable="false"
    style={{ width: "1.25em", height: "auto", borderRadius: "0.12em", boxShadow: "0 0 0 1px rgba(0,0,0,.12)", verticalAlign: "-0.15em", display: "inline-block" }} />;
}
