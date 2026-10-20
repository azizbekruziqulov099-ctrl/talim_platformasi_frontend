// REV154: rassom chizgan ekran belgilari (tugmalar, o'yin turlari, xona kartalari, Bog'cha olami, ob-havo, rag'bat).
// Emoji o'rniga — chizilgan rasm. <B e="🎤" /> — belgi bo'lsa rasm, bo'lmasa emojining o'zi.
import React from "react";
import b_belgi_kitoblar from "./belgi/belgi_kitoblar.webp";
import b_belgi_medal from "./belgi/belgi_medal.webp";
import b_belgi_oyin from "./belgi/belgi_oyin.webp";
import b_belgi_yangi from "./belgi/belgi_yangi.webp";
import { JR } from "./jonli/jonliRasm.js";
import b_belgi_kaft from "./belgi/belgi_kaft.webp";
import b_belgi_kalendar from "./belgi/belgi_kalendar.webp";
import b_belgi_karnay from "./belgi/belgi_karnay.webp";
import b_belgi_keyingi from "./belgi/belgi_keyingi.webp";
import b_belgi_kitob from "./belgi/belgi_kitob.webp";
import b_belgi_koz from "./belgi/belgi_koz.webp";
import b_belgi_kubok from "./belgi/belgi_kubok.webp";
import b_belgi_lupa from "./belgi/belgi_lupa.webp";
import b_belgi_marra from "./belgi/belgi_marra.webp";
import b_belgi_mikrofon from "./belgi/belgi_mikrofon.webp";
import b_belgi_orqaga from "./belgi/belgi_orqaga.webp";
import b_belgi_oy from "./belgi/belgi_oy.webp";
import b_belgi_pauza from "./belgi/belgi_pauza.webp";
import b_belgi_qayta from "./belgi/belgi_qayta.webp";
import b_belgi_qulf from "./belgi/belgi_qulf.webp";
import b_belgi_quloq from "./belgi/belgi_quloq.webp";
import b_belgi_qum_soat from "./belgi/belgi_qum_soat.webp";
import b_belgi_togri from "./belgi/belgi_togri.webp";
import b_belgi_uy from "./belgi/belgi_uy.webp";
import b_belgi_xarita from "./belgi/belgi_xarita.webp";
import b_belgi_xato from "./belgi/belgi_xato.webp";
import b_belgi_yurak from "./belgi/belgi_yurak.webp";
import b_belgi_yurak_bosh from "./belgi/belgi_yurak_bosh.webp";
import b_chiroq_ochiq from "./belgi/chiroq_ochiq.webp";
import b_chiroq_yoniq from "./belgi/chiroq_yoniq.webp";
import b_havo_bulut from "./belgi/havo_bulut.webp";
import b_havo_kech from "./belgi/havo_kech.webp";
import b_havo_qor from "./belgi/havo_qor.webp";
import b_havo_quyosh from "./belgi/havo_quyosh.webp";
import b_havo_tong from "./belgi/havo_tong.webp";
import b_havo_tun from "./belgi/havo_tun.webp";
import b_havo_yomgir from "./belgi/havo_yomgir.webp";
import b_rag_kaptar from "./belgi/rag_kaptar.webp";
import b_rag_nishon from "./belgi/rag_nishon.webp";
import b_rag_qarsak from "./belgi/rag_qarsak.webp";
import b_rag_yurak from "./belgi/rag_yurak.webp";
import b_rejim_ayt from "./belgi/rejim_ayt.webp";
import b_rejim_buyruq from "./belgi/rejim_buyruq.webp";
import b_rejim_kashf from "./belgi/rejim_kashf.webp";
import b_rejim_ortiqcha from "./belgi/rejim_ortiqcha.webp";
import b_rejim_tartib from "./belgi/rejim_tartib.webp";
import b_rejim_top from "./belgi/rejim_top.webp";
import b_rejim_xotira from "./belgi/rejim_xotira.webp";
import b_rejim_yoqoldi from "./belgi/rejim_yoqoldi.webp";
import b_rejim_yordam from "./belgi/rejim_yordam.webp";
import b_tur_aralash from "./belgi/tur_aralash.webp";
import b_tur_aylantir from "./belgi/tur_aylantir.webp";
import b_tur_buyruq from "./belgi/tur_buyruq.webp";
import b_tur_gap from "./belgi/tur_gap.webp";
import b_tur_harakat from "./belgi/tur_harakat.webp";
import b_tur_kattalashtir from "./belgi/tur_kattalashtir.webp";
import b_tur_narsa from "./belgi/tur_narsa.webp";
import b_tur_pufak from "./belgi/tur_pufak.webp";
import b_tur_qutiga from "./belgi/tur_qutiga.webp";
import b_tur_soya from "./belgi/tur_soya.webp";
import b_tur_tozala from "./belgi/tur_tozala.webp";
import b_tur_ushla from "./belgi/tur_ushla.webp";
import b_tur_yarim from "./belgi/tur_yarim.webp";
import b_xona_bolalar from "./belgi/xona_bolalar.webp";
import b_xona_havo from "./belgi/xona_havo.webp";
import b_xona_hovli from "./belgi/xona_hovli.webp";
import b_xona_men from "./belgi/xona_men.webp";
import b_xona_oshxona from "./belgi/xona_oshxona.webp";
import b_xona_shahar from "./belgi/xona_shahar.webp";
import b_xona_sinf from "./belgi/xona_sinf.webp";

export const BELGI = {
  belgi_kitoblar: b_belgi_kitoblar,
  belgi_medal: b_belgi_medal,
  belgi_oyin: b_belgi_oyin,
  belgi_yangi: b_belgi_yangi,
  yulduz: JR.yulduz,
  belgi_kaft: b_belgi_kaft,
  belgi_kalendar: b_belgi_kalendar,
  belgi_karnay: b_belgi_karnay,
  belgi_keyingi: b_belgi_keyingi,
  belgi_kitob: b_belgi_kitob,
  belgi_koz: b_belgi_koz,
  belgi_kubok: b_belgi_kubok,
  belgi_lupa: b_belgi_lupa,
  belgi_marra: b_belgi_marra,
  belgi_mikrofon: b_belgi_mikrofon,
  belgi_orqaga: b_belgi_orqaga,
  belgi_oy: b_belgi_oy,
  belgi_pauza: b_belgi_pauza,
  belgi_qayta: b_belgi_qayta,
  belgi_qulf: b_belgi_qulf,
  belgi_quloq: b_belgi_quloq,
  belgi_qum_soat: b_belgi_qum_soat,
  belgi_togri: b_belgi_togri,
  belgi_uy: b_belgi_uy,
  belgi_xarita: b_belgi_xarita,
  belgi_xato: b_belgi_xato,
  belgi_yurak: b_belgi_yurak,
  belgi_yurak_bosh: b_belgi_yurak_bosh,
  chiroq_ochiq: b_chiroq_ochiq,
  chiroq_yoniq: b_chiroq_yoniq,
  havo_bulut: b_havo_bulut,
  havo_kech: b_havo_kech,
  havo_qor: b_havo_qor,
  havo_quyosh: b_havo_quyosh,
  havo_tong: b_havo_tong,
  havo_tun: b_havo_tun,
  havo_yomgir: b_havo_yomgir,
  rag_kaptar: b_rag_kaptar,
  rag_nishon: b_rag_nishon,
  rag_qarsak: b_rag_qarsak,
  rag_yurak: b_rag_yurak,
  rejim_ayt: b_rejim_ayt,
  rejim_buyruq: b_rejim_buyruq,
  rejim_kashf: b_rejim_kashf,
  rejim_ortiqcha: b_rejim_ortiqcha,
  rejim_tartib: b_rejim_tartib,
  rejim_top: b_rejim_top,
  rejim_xotira: b_rejim_xotira,
  rejim_yoqoldi: b_rejim_yoqoldi,
  rejim_yordam: b_rejim_yordam,
  tur_aralash: b_tur_aralash,
  tur_aylantir: b_tur_aylantir,
  tur_buyruq: b_tur_buyruq,
  tur_gap: b_tur_gap,
  tur_harakat: b_tur_harakat,
  tur_kattalashtir: b_tur_kattalashtir,
  tur_narsa: b_tur_narsa,
  tur_pufak: b_tur_pufak,
  tur_qutiga: b_tur_qutiga,
  tur_soya: b_tur_soya,
  tur_tozala: b_tur_tozala,
  tur_ushla: b_tur_ushla,
  tur_yarim: b_tur_yarim,
  xona_bolalar: b_xona_bolalar,
  xona_havo: b_xona_havo,
  xona_hovli: b_xona_hovli,
  xona_men: b_xona_men,
  xona_oshxona: b_xona_oshxona,
  xona_shahar: b_xona_shahar,
  xona_sinf: b_xona_sinf,
};

/** Emoji → belgi nomi (tugma va yozuvlarda). */
export const EMOJI_BELGI = {  "⭐": "yulduz", "🎮": "belgi_oyin", "📚": "belgi_kitoblar", "✨": "belgi_yangi", "🏅": "belgi_medal", "🌟": "yulduz", "🎤": "belgi_mikrofon",  "🔊": "belgi_karnay",  "🔒": "belgi_qulf",  "🏠": "belgi_uy",  "🔍": "belgi_lupa",  "🔁": "belgi_qayta",  "🗺️": "belgi_xarita",  "▶": "belgi_keyingi",  "▶️": "belgi_keyingi",  "⏸️": "belgi_pauza",  "⏸": "belgi_pauza",  "🏆": "belgi_kubok",  "❤️": "belgi_yurak",  "🤍": "belgi_yurak_bosh",  "📅": "belgi_kalendar",  "🏁": "belgi_marra",  "⏳": "belgi_qum_soat",  "✅": "belgi_togri",  "❌": "belgi_xato",  "👀": "belgi_koz",  "🖐️": "belgi_kaft",  "🌙": "belgi_oy",  "📖": "belgi_kitob",  "👂": "belgi_quloq",  "⬅️": "belgi_orqaga",  "👏": "rag_qarsak",  "💛": "rag_yurak",  "🎯": "rag_nishon",  "🕊️": "rag_kaptar" };

const toza = (e) => String(e || "").replace(/\uFE0F/g, "");
const EB = Object.fromEntries(Object.entries(EMOJI_BELGI).map(([k, v]) => [toza(k), v]));
/** Belgi rasmi manzili: nom («rejim_top») yoki emoji («🎤») bo'yicha; bo'lmasa null. */
export const belgiSrc = (nomYokiEmoji) => BELGI[nomYokiEmoji] || BELGI[EB[toza(nomYokiEmoji)]] || null;

/** <B e="🎤" /> yoki <B n="rejim_top" e="👆" /> — chizilgan belgi (matn qatorida, matn balandligida). */
export function B({ n, e = "", className = "", katta = false }) {
  const src = belgiSrc(n) || belgiSrc(e);
  if (!src) return <>{e}</>;
  return <img className={`kb-belgi ${katta ? "is-katta" : ""} ${className}`} src={src} alt="" aria-hidden="true" draggable="false" />;
}
