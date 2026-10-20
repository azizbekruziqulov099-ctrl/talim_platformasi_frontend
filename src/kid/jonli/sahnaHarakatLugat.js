// REV154: «Ayt — bo'ladi!» — rassom chizgan «oldin / keyin» sahnalar (15 ta). Bola to'g'ri aytsa, sahna o'zgaradi:
// deraza ochiladi, televizor yonadi, gul ochiladi, shamlar o'chadi… Sof ma'lumot (brauzersiz sinaladi).
// Har ibora 11 tilda: uz | ru | en | de | fr | es | ar | tr | zh | ja | ko.
import { TILLAR } from "../xonalar/xonaLugat.js";

const row = (s) => Object.fromEntries(s.split("|").map((x, i) => [TILLAR[i], x.trim()]));
const H = (id, s) => { const w = row(s); return { id: `sahna_${id}`, rasm: id, s: w, g: w }; };

export const SAHNA_HARAKAT = [
  H("deraza", "Derazani och! | Открой окно! | Open the window! | Mach das Fenster auf! | Ouvre la fenêtre ! | ¡Abre la ventana! | افتح النافذة! | Pencereyi aç! | 打开窗户！ | まどをあけて！ | 창문을 열어!"),
  H("televizor", "Televizorni yoq! | Включи телевизор! | Turn on the TV! | Mach den Fernseher an! | Allume la télé ! | ¡Enciende la tele! | شغّل التلفاز! | Televizyonu aç! | 打开电视！ | テレビをつけて！ | 텔레비전을 켜!"),
  H("jomrak", "Jo‘mrakni och! | Открой кран! | Turn on the tap! | Dreh den Wasserhahn auf! | Ouvre le robinet ! | ¡Abre el grifo! | افتح الصنبور! | Musluğu aç! | 打开水龙头！ | じゃぐちをひねって！ | 수도꼭지를 틀어!"),
  H("kitob", "Kitobni och! | Открой книгу! | Open the book! | Mach das Buch auf! | Ouvre le livre ! | ¡Abre el libro! | افتح الكتاب! | Kitabı aç! | 打开书！ | ほんをひらいて！ | 책을 펴!"),
  H("gul", "Gulga suv quy! | Полей цветок! | Water the flower! | Gieß die Blume! | Arrose la fleur ! | ¡Riega la flor! | اسقِ الزهرة! | Çiçeği sula! | 给花浇水！ | はなにみずをあげて！ | 꽃에 물을 줘!"),
  H("it", "Kuchukni uyg‘ot! | Разбуди собаку! | Wake up the dog! | Weck den Hund! | Réveille le chien ! | ¡Despierta al perro! | أيقظ الكلب! | Köpeği uyandır! | 叫醒小狗！ | いぬをおこして！ | 강아지를 깨워!"),
  H("parda", "Pardani och! | Открой шторы! | Open the curtains! | Mach die Vorhänge auf! | Ouvre les rideaux ! | ¡Abre las cortinas! | افتح الستائر! | Perdeleri aç! | 拉开窗帘！ | カーテンをあけて！ | 커튼을 열어!"),
  H("quti_sovga", "Sovg‘ani och! | Открой подарок! | Open the present! | Mach das Geschenk auf! | Ouvre le cadeau ! | ¡Abre el regalo! | افتح الهدية! | Hediyeyi aç! | 打开礼物！ | プレゼントをあけて！ | 선물을 열어!"),
  H("shamchiroq", "Shamlarni puflab o‘chir! | Задуй свечи! | Blow out the candles! | Blas die Kerzen aus! | Souffle les bougies ! | ¡Sopla las velas! | اطفئ الشموع! | Mumları üfle! | 吹蜡烛！ | ろうそくをふきけして！ | 촛불을 불어!"),
  H("qongiroq", "Qo‘ng‘iroqni chal! | Позвони в колокольчик! | Ring the bell! | Läute die Glocke! | Sonne la cloche ! | ¡Toca la campana! | اقرع الجرس! | Zili çal! | 摇铃！ | ベルをならして！ | 종을 울려!"),
  H("telefon", "Oyimga qo‘ng‘iroq qil! | Позвони маме! | Call mum! | Ruf Mama an! | Appelle maman ! | ¡Llama a mamá! | اتصل بماما! | Annemi ara! | 给妈妈打电话！ | ママにでんわして！ | 엄마에게 전화해!"),
  H("muzlatkich", "Muzlatkichni och! | Открой холодильник! | Open the fridge! | Mach den Kühlschrank auf! | Ouvre le frigo ! | ¡Abre la nevera! | افتح الثلاجة! | Buzdolabını aç! | 打开冰箱！ | れいぞうこをあけて！ | 냉장고를 열어!"),
  H("mushuk", "Tur, mushukcha! | Вставай, котик! | Get up, kitty! | Steh auf, Kätzchen! | Lève-toi, minou ! | ¡Levántate, gatito! | قم يا قطتي! | Kalk, kedicik! | 小猫，起来！ | ねこちゃん、おきて！ | 고양이야, 일어나!"),
  H("bayroq", "Bayroqni ko‘tar! | Подними флаг! | Raise the flag! | Zieh die Fahne hoch! | Lève le drapeau ! | ¡Sube la bandera! | ارفع العلم! | Bayrağı kaldır! | 升旗！ | はたをあげて！ | 깃발을 올려!"),
  H("eshik_qongiroq", "Eshik qo‘ng‘irog‘ini bos! | Позвони в дверь! | Ring the doorbell! | Klingel an der Tür! | Sonne à la porte ! | ¡Toca el timbre! | اضغط الجرس! | Kapı zilini çal! | 按门铃！ | チャイムをならして！ | 초인종을 눌러!"),
];

/** Imo-ishorali harakatlar va rasmli sahnalar navbatma-navbat (bola ikkala turni ham erta ko'radi). */
export function aralashHarakatlar(imoli = []) {
  const out = [];
  const n = Math.max(imoli.length, SAHNA_HARAKAT.length);
  for (let i = 0; i < n; i += 1) { if (imoli[i]) out.push(imoli[i]); if (SAHNA_HARAKAT[i]) out.push(SAHNA_HARAKAT[i]); }
  return out;
}
