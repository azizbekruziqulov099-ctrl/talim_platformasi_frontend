// REV324: bog'cha o'yinlari uchun SVG rasmlar to'plami.
// Har fayl: viewBox="0 0 256 256", shaffof fon, yozuv va raqam yo'q, hajmi 6 KB dan kichik.
// Maxsus joylar: kamalak.svg — 7 ta alohida <path id="r1".."r7"> (tashqaridan ichkariga: qizil → binafsha);
// poyezd_vagon.svg — tanasi oq (<rect id="tana" fill="#F4F7FC">), kod bo'yaydi;
// termometr.svg — simob ustuni <rect id="simob">.
import sandiq_yopiq from "./sandiq_yopiq.svg";
import sandiq_ochiq from "./sandiq_ochiq.svg";
import quti_sehrli from "./quti_sehrli.svg";
import kalit_oltin from "./kalit_oltin.svg";
import qulf from "./qulf.svg";
import savat_bosh from "./savat_bosh.svg";
import savat_tola from "./savat_tola.svg";
import likopcha from "./likopcha.svg";
import karta_orqa from "./karta_orqa.svg";
import karta_old from "./karta_old.svg";
import eshik_yopiq from "./eshik_yopiq.svg";
import eshik_ochiq from "./eshik_ochiq.svg";
import yulduz_tugma from "./yulduz_tugma.svg";
import pufak_gap from "./pufak_gap.svg";
import mikrofon_katta from "./mikrofon_katta.svg";
import qolcha_belgi from "./qolcha_belgi.svg";
import belgi_tanlov_ha from "./belgi_tanlov_ha.svg";
import belgi_tanlov_yoq from "./belgi_tanlov_yoq.svg";
import shar from "./shar.svg";
import kubik_tosh from "./kubik_tosh.svg";
import poyezd_lokomotiv from "./poyezd_lokomotiv.svg";
import poyezd_vagon from "./poyezd_vagon.svg";
import taqvim_varaq from "./taqvim_varaq.svg";
import oy_kartasi_qish from "./oy_kartasi_qish.svg";
import oy_kartasi_bahor from "./oy_kartasi_bahor.svg";
import oy_kartasi_yoz from "./oy_kartasi_yoz.svg";
import oy_kartasi_kuz from "./oy_kartasi_kuz.svg";
import daraxt_qish from "./daraxt_qish.svg";
import daraxt_bahor from "./daraxt_bahor.svg";
import daraxt_yoz from "./daraxt_yoz.svg";
import daraxt_kuz from "./daraxt_kuz.svg";
import fasl_gildirak from "./fasl_gildirak.svg";
import termometr from "./termometr.svg";
import soat_bosh from "./soat_bosh.svg";
import kun_quyosh from "./kun_quyosh.svg";
import tun_oy from "./tun_oy.svg";
import kamalak from "./kamalak.svg";
import bulut_hayvon from "./bulut_hayvon.svg";
import tort_sham from "./tort_sham.svg";
import sham_ochgan from "./sham_ochgan.svg";
import tarozi_teng from "./tarozi_teng.svg";
import tarozi_chap from "./tarozi_chap.svg";
import zina from "./zina.svg";
import qurbaqa from "./qurbaqa.svg";
import kuchuk_qidir from "./kuchuk_qidir.svg";
import suyak from "./suyak.svg";
import svetofor_qizil from "./svetofor_qizil.svg";
import svetofor_yashil from "./svetofor_yashil.svg";
import domino from "./domino.svg";
import tanga from "./tanga.svg";
import dokon_peshtaxta from "./dokon_peshtaxta.svg";
import raketa from "./raketa.svg";
import raketa_uchgan from "./raketa_uchgan.svg";
import robot_yol from "./robot_yol.svg";
import bayroqcha_marra from "./bayroqcha_marra.svg";
import tayoqcha_10 from "./tayoqcha_10.svg";
import tayoqcha from "./tayoqcha.svg";
import chiqindi_qutilar from "./chiqindi_qutilar.svg";
import gul_urug from "./gul_urug.svg";
import gul_osib from "./gul_osib.svg";
import gul_ochilgan from "./gul_ochilgan.svg";
import orkestr_set from "./orkestr_set.svg";
import stiker_quyon from "./stiker_quyon.svg";
import stiker_fil from "./stiker_fil.svg";
import stiker_dinozavr from "./stiker_dinozavr.svg";
import stiker_kaptar from "./stiker_kaptar.svg";
import stiker_raketa from "./stiker_raketa.svg";
import stiker_gul from "./stiker_gul.svg";
import medal_oltin from "./medal_oltin.svg";
import kubok from "./kubok.svg";
import diplom from "./diplom.svg";
import albom from "./albom.svg";
import toj from "./toj.svg";
import konfetti_parcha from "./konfetti_parcha.svg";

export const OYIN_RASM = {
  // sandiq, quti, kalit, savat, karta, eshik, belgilar
  sandiq_yopiq,
  sandiq_ochiq,
  quti_sehrli,
  kalit_oltin,
  qulf,
  savat_bosh,
  savat_tola,
  likopcha,
  karta_orqa,
  karta_old,
  eshik_yopiq,
  eshik_ochiq,
  yulduz_tugma,
  pufak_gap,
  mikrofon_katta,
  qolcha_belgi,
  belgi_tanlov_ha,
  belgi_tanlov_yoq,
  shar,
  kubik_tosh,
  // poyezd, taqvim, fasllar, daraxt, vaqt, osmon, tort
  poyezd_lokomotiv,
  poyezd_vagon,
  taqvim_varaq,
  oy_kartasi_qish,
  oy_kartasi_bahor,
  oy_kartasi_yoz,
  oy_kartasi_kuz,
  daraxt_qish,
  daraxt_bahor,
  daraxt_yoz,
  daraxt_kuz,
  fasl_gildirak,
  termometr,
  soat_bosh,
  kun_quyosh,
  tun_oy,
  kamalak,
  bulut_hayvon,
  tort_sham,
  sham_ochgan,
  // tarozi, hayvonlar, svetofor, do'kon, raketa, robot, sanoq, gul, orkestr
  tarozi_teng,
  tarozi_chap,
  zina,
  qurbaqa,
  kuchuk_qidir,
  suyak,
  svetofor_qizil,
  svetofor_yashil,
  domino,
  tanga,
  dokon_peshtaxta,
  raketa,
  raketa_uchgan,
  robot_yol,
  bayroqcha_marra,
  tayoqcha_10,
  tayoqcha,
  chiqindi_qutilar,
  gul_urug,
  gul_osib,
  gul_ochilgan,
  orkestr_set,
  // stikerlar va mukofotlar
  stiker_quyon,
  stiker_fil,
  stiker_dinozavr,
  stiker_kaptar,
  stiker_raketa,
  stiker_gul,
  medal_oltin,
  kubok,
  diplom,
  albom,
  toj,
  konfetti_parcha,
};

export default OYIN_RASM;
