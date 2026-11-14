// REV545: ob-havo gapi FASL va HARORATGA mos. Avval ustoz faqat ob-havo turiga qarab gapirardi — sovuq noyabr kunida ham
// «Bugun quyosh ertakdagidek nur sochyapti!» deyardi. Endi: sovuq + quyosh → «Quyosh chiqdi, lekin havo sovuq…»;
// bulutli kunda ba'zan «Quyosh bulutlar orasidan mo'ralayaptimi?» (savol — shuning uchun hech qachon noto'g'ri bo'lmaydi).
// Sof funksiyalar (brauzersiz sinaladi). null qaytsa — ustozning o'z (eski) gapi ishlatiladi.

/** Harorat (°C) → daraja. Harorat noma'lum bo'lsa — fasl bo'yicha taxmin (qish: sovuq, kuz: salqin; bahor/yoz: null). */
export function haroratDarajasi(harorat, fasl = null) {
  const n = harorat === null || harorat === undefined || harorat === "" ? NaN : Number(harorat);
  if (Number.isFinite(n)) return n <= 0 ? "ayoz" : n <= 9 ? "sovuq" : n <= 17 ? "salqin" : n <= 27 ? "iliq" : "issiq";
  return fasl === 0 ? "sovuq" : fasl === 3 ? "salqin" : null;   // fasl: 0 qish, 1 bahor, 2 yoz, 3 kuz
}

// {F} — fasl quyoshi («Kuz quyoshi», «Осеннее солнце», «The autumn sun»)
const FASL_QUYOSHI = {
  uz: ["Qish quyoshi", "Bahor quyoshi", "Yoz quyoshi", "Kuz quyoshi"],
  ru: ["Зимнее солнце", "Весеннее солнце", "Летнее солнце", "Осеннее солнце"],
  en: ["The winter sun", "The spring sun", "The summer sun", "The autumn sun"],
};

export const HAVO_MOS = {
  uz: {
    quyosh: {
      ayoz: ["Quyosh chiqib turibdi, lekin tashqari juda sovuq — ayoz! {F} yoritadi-yu, isitmaydi.", "Osmon tiniq, quyosh porlayapti, ammo havo muzdek. Qalin kiyinamiz!"],
      sovuq: ["Quyosh chiqdi, lekin havo sovuq. {F} yoritadi, ammo kam isitadi.", "Bugun quyoshli, biroq sovuq kun. Issiq kiyinib olamiz!", "Quyosh bor, lekin tashqari sovuq. Quyosh nuri iliq emas, shunday emasmi?"],
      salqin: ["Bugun quyosh chiqib turibdi, havo esa salqin.", "Quyosh mayin nur sochyapti, lekin shabada salqin. Ustki kiyim kerak bo‘ladi."],
      issiq: ["Quyosh qizdiryapti — bugun juda issiq! Soyada yuramiz va ko‘p suv ichamiz.", "Bugun jazirama: quyosh tik turibdi. Bosh kiyimni unutmaymiz!"],
    },
    bulut: {
      ayoz: ["Osmon bulutli, tashqari juda sovuq. Quyosh bulutlar ortiga yashirinibdi.", "Bugun bulutli va ayoz. Quyosh bulutlar orasidan mo‘ralayaptimi? Qarab ko‘r!"],
      sovuq: ["Osmon bulutli, havo sovuq. Quyosh bulutlar orasidan mo‘ralayaptimi? Qarab ko‘r!", "Bugun bulutli va sovuq kun. Quyosh har zamonda bulutlar orasidan qarab qo‘yadi."],
      salqin: ["Bugun osmonda bulutlar ko‘p, havo salqin. Quyosh bulutlar orasidan mo‘ralayaptimi?", "Bulutli, salqin kun. Quyosh goh ko‘rinadi, goh bulut ortiga yashirinadi."],
      iliq: ["Bugun osmon bulutli, lekin havo iliq. Quyosh bulutlar orasidan mo‘ralayaptimi? Qarab ko‘r!", null],
      issiq: ["Osmon bulutli, lekin havo issiq va dim. Quyosh bulutlar ortidan ham qizdiryapti.", null],
    },
    yomgir: {
      ayoz: ["Bugun sovuq yomg‘ir yog‘yapti, yerlar muzlab qolishi mumkin. Ehtiyot bo‘lamiz!"],
      sovuq: ["Bugun sovuq yomg‘ir yog‘yapti. Soyabon va issiq kiyim kerak!", "Yomg‘ir yog‘yapti, havo sovuq. Uyda issiqqina o‘tirib o‘rganamiz."],
      salqin: ["Bugun yomg‘ir yog‘yapti, havo salqin. Soyabonni unutmaymiz!", null],
    },
    qor: { iliq: ["Qor yog‘yapti-yu, yerga tushib erib ketyapti."], salqin: ["Qor yog‘yapti, lekin tez erib ketyapti — havo unchalik sovuq emas."] },
  },
  ru: {
    quyosh: {
      ayoz: ["Солнце светит, но на улице очень холодно — мороз! {F} светит, да не греет.", "Небо ясное, солнце сияет, а воздух ледяной. Одеваемся потеплее!"],
      sovuq: ["Солнце вышло, но на улице холодно. {F} светит, но почти не греет.", "Сегодня солнечно, но холодно. Оденемся потеплее!", "Солнце есть, а на улице холодно. Лучики совсем не тёплые, правда?"],
      salqin: ["Сегодня светит солнце, но на улице прохладно.", "Солнышко светит мягко, а ветерок прохладный. Нужна куртка."],
      issiq: ["Солнце припекает — сегодня очень жарко! Идём по тени и пьём много воды.", "Сегодня жара: солнце высоко. Не забываем панамку!"],
    },
    bulut: {
      ayoz: ["Небо в облаках, на улице очень холодно. Солнце спряталось за тучи.", "Сегодня облачно и морозно. Выглядывает ли солнце из-за облаков? Посмотри!"],
      sovuq: ["Небо в облаках, на улице холодно. Выглядывает ли солнце из-за облаков? Посмотри!", "Сегодня облачно и холодно. Солнце то и дело выглядывает из-за облаков."],
      salqin: ["Сегодня на небе много облаков, прохладно. Выглядывает ли солнце из-за облаков?", "Облачный, прохладный день. Солнце то покажется, то спрячется за облако."],
      iliq: ["Сегодня облачно, но тепло. Выглядывает ли солнце из-за облаков? Посмотри!", null],
      issiq: ["Небо в облаках, но жарко и душно. Солнце греет даже из-за облаков.", null],
    },
    yomgir: {
      ayoz: ["Сегодня идёт холодный дождь, дороги могут обледенеть. Будем осторожны!"],
      sovuq: ["Сегодня идёт холодный дождь. Нужны зонт и тёплая одежда!", "Идёт дождь, на улице холодно. Посидим в тепле и позанимаемся."],
      salqin: ["Сегодня идёт дождь, прохладно. Не забываем зонт!", null],
    },
    qor: { iliq: ["Идёт снег, но он тает, едва коснувшись земли."], salqin: ["Идёт снег, но быстро тает — на улице не очень холодно."] },
  },
  en: {
    quyosh: {
      ayoz: ["The sun is out, but it is freezing outside! {F} is bright, but it does not warm us.", "The sky is clear and the sun is shining, but the air is icy. Let's dress warmly!"],
      sovuq: ["The sun is out, but it is cold. {F} is bright, but it gives little warmth.", "It is sunny but cold today. Let's put on warm clothes!", "The sun is here, but it is cold outside. Its rays are not warm, are they?"],
      salqin: ["The sun is out today, but the air is cool.", "The sun is shining gently, but the breeze is cool. We need a jacket."],
      issiq: ["The sun is blazing — it is very hot today! Let's walk in the shade and drink lots of water.", "It is scorching today: the sun is high. Don't forget your hat!"],
    },
    bulut: {
      ayoz: ["The sky is cloudy and it is freezing. The sun is hiding behind the clouds.", "It is cloudy and frosty today. Is the sun peeking through the clouds? Have a look!"],
      sovuq: ["The sky is cloudy and it is cold. Is the sun peeking through the clouds? Have a look!", "It is a cloudy, cold day. The sun peeks out from behind the clouds now and then."],
      salqin: ["There are many clouds today and it is cool. Is the sun peeking through the clouds?", "A cloudy, cool day. The sun comes out, then hides behind a cloud again."],
      iliq: ["It is cloudy but warm today. Is the sun peeking through the clouds? Have a look!", null],
      issiq: ["The sky is cloudy, but it is hot and stuffy. The sun warms us even through the clouds.", null],
    },
    yomgir: {
      ayoz: ["Cold rain is falling today and the ground may freeze. Let's be careful!"],
      sovuq: ["Cold rain is falling today. We need an umbrella and warm clothes!", "It is raining and it is cold. Let's stay warm inside and learn."],
      salqin: ["It is raining today and it is cool. Let's not forget the umbrella!", null],
    },
    qor: { iliq: ["It is snowing, but the snow melts as soon as it lands."], salqin: ["It is snowing, but it melts quickly — it is not very cold."] },
  },
};

// Kun vaqtiga oid gaplarga («Tong otdi! Quyosh endigina chiqib kelyapti.») qo'shimcha — faqat sovuq yoki jazirama bo'lsa
export const HARORAT_QOSHIMCHA = {
  uz: { ayoz: "Tashqari juda sovuq — qalin kiyinamiz!", sovuq: "Havo sovuq — issiq kiyinamiz!", issiq: "Havo juda issiq — ko‘p suv ichamiz!" },
  ru: { ayoz: "На улице мороз — одеваемся очень тепло!", sovuq: "На улице холодно — одеваемся потеплее!", issiq: "Очень жарко — пьём много воды!" },
  en: { ayoz: "It is freezing outside — let's dress very warmly!", sovuq: "It is cold — let's dress warmly!", issiq: "It is very hot — let's drink lots of water!" },
};

/**
 * Fasl va haroratga mos ob-havo gapi. h: "quyosh" | "bulut" | "yomgir" | "qor"; fasl: 0 qish, 1 bahor, 2 yoz, 3 kuz (yoki null);
 * kun — variantni almashtirish uchun. Mos gap bo'lmasa (iliq quyoshli kun, boshqa til) — null: ustozning o'z gapi qoladi.
 */
export function havoMos({ h = "quyosh", harorat = null, fasl = null, kun = 0, izoh = "uz" } = {}) {
  const T = HAVO_MOS[izoh]; if (!T) return null;
  const d = haroratDarajasi(harorat, fasl); if (!d) return null;
  const v = T[h]?.[d]; if (!v || !v.length) return null;
  const gap = v[Math.abs(Number(kun) || 0) % v.length];
  if (!gap) return null;
  const f = fasl === null || fasl === undefined ? null : FASL_QUYOSHI[izoh]?.[fasl];
  // faslni bilmasak — «{F}» o'rniga umumiy «Quyosh»
  return gap.replace("{F}", f || { uz: "Quyosh", ru: "Солнце", en: "The sun" }[izoh]);
}

export function haroratQoshimcha({ harorat = null, fasl = null, izoh = "uz" } = {}) {
  const d = haroratDarajasi(harorat, fasl); return (d && HARORAT_QOSHIMCHA[izoh]?.[d]) || "";
}
