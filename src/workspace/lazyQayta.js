import React from "react";
import { chunkXatosimi, yangiVersiyagaOt } from "../pwa/tiklash.js";   // REV413

/** REV307: sekin yoki uzilib qoladigan internet uchun xavfsiz React.lazy.
 *  Bo'lak (chunk) yuklanmasa — 1, 2, 4 soniyadan keyin yana uriniladi; modul bo'sh kelsa (default yo'q) ham xato
 *  hisoblanadi («Cannot read properties of undefined (reading 'default')» o'rniga tushunarli xato va qayta urinish). */
export function yuklaQayta(loader, urinish = 3) {
  return new Promise((resolve, reject) => {
    const bir = (n) => {
      Promise.resolve().then(loader).then((mod) => {
        if (!mod || !mod.default) throw new Error("Sahifa bo‘lagi yuklanmadi (internet)");
        resolve(mod);
      }).catch((err) => {
        if (n >= urinish) {
          // REV413: yangi versiya chiqqan — eski bo'lak serverda yo'q: ilova o'zi yangi versiyaga o'tadi
          if (chunkXatosimi(err)) { yangiVersiyagaOt().then((ok) => { if (!ok) reject(err); }); return; }
          reject(err); return;
        }
        setTimeout(() => bir(n + 1), 1000 * 2 ** n);
      });
    };
    bir(0);
  });
}

export const lazyQayta = (loader) => React.lazy(() => yuklaQayta(loader));
