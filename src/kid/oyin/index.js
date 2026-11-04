// REV324: O'YIN DVIGATELI — tashqariga faqat shu fayl orqali eksport qilinadi.
//   import Oyin, { oyinTanla, oyinYasa, tekshir, OYINLAR } from "./kid/oyin/index.js";
//   <Oyin id={116} elementlar={[{ say: "cat", uz: "mushuk", emoji: "🐱" }]} yosh="4-5" til="en" izoh="uz"
//         onSay={(text) => ayt(text)} onNatija={(togri, xatolar, info) => …} />
export { default, default as Oyin } from "./Oyin.jsx";
export {
  OYINLAR, YOSHLAR, HARAKATLAR, TAKRORLANMASLIK_KUN, DAVOMIYLIK,
  oyinOl, oyinNomi, oyinMosmi, oyinTanla, oyinYasa, tekshir, maslahat, osonlashtir, qiyinlikMoslash, variantSoni,
  sonOraligi, elementlarTayyor, aytishBaho, raundGapi, javobGapi, yulduzlar, taxminiySoniya, yoshNorm,
} from "./oyinRules.js";
export { OYIN_MATN, UMUMIY_MATN, IZOH_TILLARI, oyinMatn } from "./oyinMatn.js";
export { OYIN_KOMPONENTLAR } from "./oyinlar/index.js";
export { mikBor } from "./mik.js";
