// REV98: quvnoq tovush effektlari — fayl yo'q, brauzerning o'zi chiqaradi (namunadagidek).
let ctx = null;
function tone(seq, type = "sine", vol = 0.14) {
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    const t0 = ctx.currentTime + 0.02;
    for (const [freq, dur, at] of seq) {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.exponentialRampToValueAtTime(vol, t0 + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      o.connect(g); g.connect(ctx.destination); o.start(t0 + at); o.stop(t0 + at + dur + 0.05);
    }
  } catch { /* tovushsiz davom etadi */ }
}
export const beep = () => tone([[880, 0.1, 0], [1320, 0.12, 0.15]], "triangle", 0.12);
export const chime = () => tone([[1047, 0.18, 0], [1319, 0.18, 0.09], [1568, 0.32, 0.18]], "sine", 0.14);
export const soft = () => tone([[392, 0.18, 0], [330, 0.26, 0.14]], "triangle", 0.1);
export const pop = () => tone([[660, 0.08, 0]], "sine", 0.1);
