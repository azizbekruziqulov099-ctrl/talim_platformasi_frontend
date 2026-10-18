// REV149: rassom chizgan rasmlar — jonli o'yinlar, «Ayt — bo'ladi!», Kabu ustoz pozalari, qo'l va o'q belgilari.
import r_buta from "./rasm/buta.webp";
import r_fon_bayram from "./rasm/fon_bayram.webp";
import r_fon_hammom from "./rasm/fon_hammom.webp";
import r_fon_maysa from "./rasm/fon_maysa.webp";
import r_fon_osmon from "./rasm/fon_osmon.webp";
import r_fon_sahna from "./rasm/fon_sahna.webp";
import r_fon_stol from "./rasm/fon_stol.webp";
import r_fon_suv from "./rasm/fon_suv.webp";
import r_fon_xona from "./rasm/fon_xona.webp";
import r_kabu_gapiradi from "./rasm/kabu_gapiradi.webp";
import r_kabu_hurra from "./rasm/kabu_hurra.webp";
import r_kabu_korsat from "./rasm/kabu_korsat.webp";
import r_kabu_oylaydi from "./rasm/kabu_oylaydi.webp";
import r_kabu_qarsak from "./rasm/kabu_qarsak.webp";
import r_kabu_salom from "./rasm/kabu_salom.webp";
import r_kabu_tingla from "./rasm/kabu_tingla.webp";
import r_kabu_zor from "./rasm/kabu_zor.webp";
import r_konfetti from "./rasm/konfetti.webp";
import r_kopik from "./rasm/kopik.webp";
import r_loy from "./rasm/loy.webp";
import r_patnis from "./rasm/patnis.webp";
import r_pufak from "./rasm/pufak.webp";
import r_qol from "./rasm/qol.webp";
import r_quti from "./rasm/quti.webp";
import r_savat from "./rasm/savat.webp";
import r_strelka from "./rasm/strelka.webp";
import r_yulduz from "./rasm/yulduz.webp";
export const JR = {
  buta: r_buta,
  fon_bayram: r_fon_bayram,
  fon_hammom: r_fon_hammom,
  fon_maysa: r_fon_maysa,
  fon_osmon: r_fon_osmon,
  fon_sahna: r_fon_sahna,
  fon_stol: r_fon_stol,
  fon_suv: r_fon_suv,
  fon_xona: r_fon_xona,
  kabu_gapiradi: r_kabu_gapiradi,
  kabu_hurra: r_kabu_hurra,
  kabu_korsat: r_kabu_korsat,
  kabu_oylaydi: r_kabu_oylaydi,
  kabu_qarsak: r_kabu_qarsak,
  kabu_salom: r_kabu_salom,
  kabu_tingla: r_kabu_tingla,
  kabu_zor: r_kabu_zor,
  konfetti: r_konfetti,
  kopik: r_kopik,
  loy: r_loy,
  patnis: r_patnis,
  pufak: r_pufak,
  qol: r_qol,
  quti: r_quti,
  savat: r_savat,
  strelka: r_strelka,
  yulduz: r_yulduz,
};
/** Har o'yin turining sahnasi (fon). */
export const JONLI_FON = { ushla: JR.fon_osmon, yarim: JR.fon_maysa, qutiga: JR.fon_stol, pufak: JR.fon_suv, soya: JR.fon_sahna, aylantir: JR.fon_xona, tozala: JR.fon_hammom, kattalashtir: JR.fon_bayram };
/** Kabu ustoz pozasi: salom | tingla | qarsak | korsat | hurra | zor. */
export const kabuRasm = (poza) => JR[`kabu_${poza}`] || JR.kabu_salom;
