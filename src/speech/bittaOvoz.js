// REV492: «ovoz ikkita bo'lib qolmoqda» — bir vaqtda faqat BITTA nutq (/api/ovoz) yangraydi. Yangi nutq boshlansa, oldingi nutq
// (darsdagi ustoz, Kabu, ekran vaqti eslatmasi, yordamchi va h.k.) to'xtatiladi. Hayvon ovozlari, musiqa, videolar tegilmaydi.
let oxirgi = null;
export function bittaOvozniYoq() {
  if (typeof window === "undefined" || window.__kbBittaOvoz || !window.HTMLMediaElement) return;
  window.__kbBittaOvoz = true;
  const asl = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function play(...args) {
    try {
      const nutq = this instanceof HTMLAudioElement && /\/api\/ovoz\b/.test(String(this.currentSrc || this.src || ""));
      if (nutq) {
        if (oxirgi && oxirgi !== this && !oxirgi.paused) { try { oxirgi.pause(); } catch { /* */ } }
        oxirgi = this;
      }
    } catch { /* */ }
    return asl.apply(this, args);
  };
}
