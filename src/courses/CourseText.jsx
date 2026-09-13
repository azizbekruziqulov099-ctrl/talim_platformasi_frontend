import React, { useMemo } from "react";
import katex from "katex";

// Author text is React-escaped. Only KaTeX's untrusted, bounded output is HTML.
export function splitCourseMath(value) {
  const text = String(value ?? "").slice(0, 100000);
  const pattern = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g;
  const parts = []; let start = 0, count = 0;
  for (const match of text.matchAll(pattern)) {
    if (++count > 100) break;
    if (match.index > start) parts.push({ text: text.slice(start, match.index) });
    const source = match[0];
    const display = source.startsWith("$$") || source.startsWith("\\[");
    const size = source.startsWith("$") && !display ? 1 : 2;
    parts.push({ math: source.slice(size, -size), source, display });
    start = match.index + source.length;
  }
  if (start < text.length) parts.push({ text: text.slice(start) });
  return parts;
}
export default function CourseText({ text, className = "" }) {
  const parts = useMemo(() => splitCourseMath(text).map(part => {
    if (!part.math || part.math.length > 6000) return part;
    try { return { ...part, html: katex.renderToString(part.math, { displayMode: part.display, throwOnError: true, trust: false, strict: "error", maxExpand: 250, maxSize: 20, output: "htmlAndMathml" }) }; }
    catch { return part; }
  }), [text]);
  return <div className={`academy-text ${className}`} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.75 }}>
    {parts.map((part, index) => part.html ? <span key={index} style={part.display ? { display: "block", overflowX: "auto", maxWidth: "100%" } : undefined} dangerouslySetInnerHTML={{ __html: part.html }} /> : <React.Fragment key={index}>{part.text ?? part.source}</React.Fragment>)}
  </div>;
}
