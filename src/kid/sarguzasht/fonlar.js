// REV323: sarguzasht ramkalari fonlari (12 ta, Azizjon chizdirgan). Kichik ekranda — 768 px nusxasi.

import fon_bayram_zal from "./fon/fon_bayram_zal.webp";
import fon_bayram_zal_768 from "./fon/fon_bayram_zal_768.webp";
import fon_ertak_darvoza from "./fon/fon_ertak_darvoza.webp";
import fon_ertak_darvoza_768 from "./fon/fon_ertak_darvoza_768.webp";
import fon_kosmos from "./fon/fon_kosmos.webp";
import fon_kosmos_768 from "./fon/fon_kosmos_768.webp";
import fon_ormon from "./fon/fon_ormon.webp";
import fon_ormon_768 from "./fon/fon_ormon_768.webp";
import fon_orol_bosh from "./fon/fon_orol_bosh.webp";
import fon_orol_bosh_768 from "./fon/fon_orol_bosh_768.webp";
import fon_poyga_yoli from "./fon/fon_poyga_yoli.webp";
import fon_poyga_yoli_768 from "./fon/fon_poyga_yoli_768.webp";
import fon_sehrgar_xona from "./fon/fon_sehrgar_xona.webp";
import fon_sehrgar_xona_768 from "./fon/fon_sehrgar_xona_768.webp";
import fon_xazina_xarita from "./fon/fon_xazina_xarita.webp";
import fon_xazina_xarita_768 from "./fon/fon_xazina_xarita_768.webp";
import orol_qism_daraxt from "./fon/orol_qism_daraxt.webp";
import orol_qism_kema from "./fon/orol_qism_kema.webp";
import orol_qism_mayoq from "./fon/orol_qism_mayoq.webp";
import orol_qism_uy from "./fon/orol_qism_uy.webp";

export const SARGUZASHT_FON = {
  fon_bayram_zal: { src: fon_bayram_zal, kichik: fon_bayram_zal_768 },
  fon_ertak_darvoza: { src: fon_ertak_darvoza, kichik: fon_ertak_darvoza_768 },
  fon_kosmos: { src: fon_kosmos, kichik: fon_kosmos_768 },
  fon_ormon: { src: fon_ormon, kichik: fon_ormon_768 },
  fon_orol_bosh: { src: fon_orol_bosh, kichik: fon_orol_bosh_768 },
  fon_poyga_yoli: { src: fon_poyga_yoli, kichik: fon_poyga_yoli_768 },
  fon_sehrgar_xona: { src: fon_sehrgar_xona, kichik: fon_sehrgar_xona_768 },
  fon_xazina_xarita: { src: fon_xazina_xarita, kichik: fon_xazina_xarita_768 },
  orol_qism_daraxt: { src: orol_qism_daraxt },
  orol_qism_kema: { src: orol_qism_kema },
  orol_qism_mayoq: { src: orol_qism_mayoq },
  orol_qism_uy: { src: orol_qism_uy },
};

/** Ramka (8-bo'lim, 191–200) → fon. */
export const RAMKA_FON = { 191: "fon_sehrgar_xona", 192: "fon_ormon", 193: "fon_xazina_xarita", 194: "fon_sehrgar_xona", 195: "fon_kosmos",
  196: "fon_ertak_darvoza", 197: "fon_poyga_yoli", 198: "fon_bayram_zal", 199: "fon_bayram_zal", 200: "fon_orol_bosh" };
export const OROL_QISMLARI = ["orol_qism_uy", "orol_qism_daraxt", "orol_qism_mayoq", "orol_qism_kema"];
