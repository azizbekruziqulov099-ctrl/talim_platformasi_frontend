export function displayTextKeepingLatex(value) {
  if (!value) return value;
  return String(value).replace(/\[\/?([a-zA-Z]+)\]/g, (tag, name) =>
    String(name).toLowerCase() === "lat" ? tag : ""
  );
}

export function latexSegments(value) {
  const source = String(value || "");
  const pattern = /(\[lat\][\s\S]*?\[\/lat\]|\$[^$]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;
  return source.split(pattern).filter((part) => part !== "");
}
