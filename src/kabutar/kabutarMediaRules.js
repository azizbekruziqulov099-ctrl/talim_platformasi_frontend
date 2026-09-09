export function recordingClock(milliseconds) {
  const seconds = Number.isFinite(Number(milliseconds))
    ? Math.max(0, Math.floor(Number(milliseconds) / 1000))
    : 0;

  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}

export function recordingGesture(start, point) {
  if (!start || !point) return "hold";
  if (start.y - point.y >= 65) return "lock";
  if (start.x - point.x >= 90) return "cancel";
  return "hold";
}

export function isPhotoMessage(message) {
  return (
    ["hujjat", "rasm", "image", "photo"].includes(message?.fayl_turi) &&
    (/\.(jpe?g|png|webp)$/i.test(String(message?.fayl_nomi || "")) ||
      /^image\/(jpeg|png|webp)$/i.test(String(message?.fayl_mime || message?.content_type || "").split(";")[0]))
  );
}

export function mediaKind(file) {
  const type = String(file?.type || "").toLowerCase();
  if (type.startsWith("image/")) return "photo";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  if (!type && /\.(jpe?g|png|webp)$/i.test(String(file?.name || ""))) return "photo";
  return "document";
}

export function recordingMime(kind, Recorder) {
  if (typeof Recorder?.isTypeSupported !== "function") return "";
  const options =
    kind === "audio"
      ? [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/ogg;codecs=opus",
        ]
      : [
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4",
        ];

  return options.find((type) => {
    try { return Recorder.isTypeSupported(type); } catch { return false; }
  }) || "";
}

export function extensionForMime(type) {
  type = String(type || "").toLowerCase();
  if (type.includes("mp4")) return "mp4";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}
