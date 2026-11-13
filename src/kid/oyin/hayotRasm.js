// REV534: hayotiy ketma-ketliklar rasmlari (Azizjon chizdirgan 253 ta; 640 px WebP). Kalit — fayl nomi: «h_<ketma-ketlik>_<qadam>».
// Faqat brauzer tomonida (Vite) yuklanadi — qoidalar va testlar rasmga bog'liq emas (ma'lumotda faqat kalit turadi).
const fayllar = import.meta.glob("./rasm_hayot/*.webp", { eager: true, import: "default" });
export const HAYOT_RASM = Object.fromEntries(Object.entries(fayllar).map(([yol, url]) => [yol.replace(/^.*\/|\.webp$/g, ""), url]));
