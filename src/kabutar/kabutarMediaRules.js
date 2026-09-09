export function recordingClock(milliseconds) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));

  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}

export function recordingGesture(start, point) {
  if (start.y - point.y >= 65) return "lock";
  if (start.x - point.x >= 90) return "cancel";
  return "hold";
}

export function isPhotoMessage(message) {
  return (
    ["hujjat", "rasm", "image"].includes(message.fayl_turi) &&
    /\.(jpe?g|png|webp)$/i.test(String(message.fayl_nomi || ""))
  );
}

export function mediaKind(file) {
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export function recordingMime(kind, Recorder) {
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

  return options.find((type) => Recorder.isTypeSupported(type)) || "";
}

export function extensionForMime(type) {
  if (type.includes("mp4")) return "mp4";
  if (type.includes("ogg")) return "ogg";
  return "webm";
}
