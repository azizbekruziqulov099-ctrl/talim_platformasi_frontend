// REV480: ko'nikmalar xaritasi — javoblar serverga to'plab yuboriladi (server har javobni ko'nikmaga ajratadi).
export function konikmaYoz(apiBase, token, hodisalar) {
  if (!token || !hodisalar?.length) return;
  try {
    fetch(`${apiBase}/api/konikma/yoz?token=${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hodisalar: hodisalar.slice(0, 200) }), keepalive: true }).catch(() => {});
  } catch { /* */ }
}
