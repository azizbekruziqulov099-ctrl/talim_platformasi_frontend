// REV129: Maktab til dasturi — 1–11 sinf, har sinfga bir o'quv yili (8 ta bo'lim, har chorakda 2 ta).
import s1 from "./sinf01.js";
import s2 from "./sinf02.js";
import s3 from "./sinf03.js";
import s4 from "./sinf04.js";
import s5 from "./sinf05.js";
import s6 from "./sinf06.js";
import s7 from "./sinf07.js";
import s8 from "./sinf08.js";
import s9 from "./sinf09.js";
import s10 from "./sinf10.js";
import s11 from "./sinf11.js";

export const SINFLAR = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11].map((bolimlar, i) => ({ sinf: i + 1, bolimlar }));
export const sinfOl = (n) => SINFLAR.find((s) => s.sinf === Number(n)) || null;
/** Barcha so'zlar (id bo'yicha). */
export const BARCHA_SOZ = Object.fromEntries(SINFLAR.flatMap((s) => s.bolimlar.flatMap((b) => b.sozlar.map((w) => [w.id, w]))));
