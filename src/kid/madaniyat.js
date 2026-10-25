// REV171: til xonalaridagi madaniy detallar — bayroq, devordagi rasm va javondagi buyum. Bosilganda rasm kabi kattalashib
// ochiladi va ustoz qisqa aytib beradi (izoh tilida, o'rganilayotgan so'z o'z tilida). Joylari hamma til xonasida bir xil.
export const DETAL_JOY = {
  bayroq: { l: 71.0, t: 5.6, w: 13.8, h: 13.8 },
  rasm: { l: 89.0, t: 9.6, w: 10.4, h: 23.8 },
  buyum: { l: 88.4, t: 36.6, w: 11.6, h: 14.6 },
};
const d = (uz, ru, en) => ({ uz, ru, en });
export const MADANIYAT = {
  emily: {
    bayroq: d("Bu — Buyuk Britaniya bayrog'i. Ingliz tili shu yerda tug'ilgan.", "Это флаг Великобритании. Английский язык родился здесь.", "This is the flag of the United Kingdom, where English comes from."),
    rasm: d("Bu — [en]London[/en]. Katta soat [en]Big Ben[/en] va qizil ikki qavatli avtobus.", "Это [en]London[/en]: часы [en]Big Ben[/en] и красный двухэтажный автобус.", "This is London: Big Ben and a red double-decker bus."),
    buyum: d("Globus va [en]ABC[/en] — ingliz alifbosining birinchi harflari.", "Глобус и [en]ABC[/en] — первые буквы английского алфавита.", "A globe and ABC — the first letters of the English alphabet."),
  },
  anna: {
    bayroq: d("Bu — Rossiya bayrog'i: oq, ko'k, qizil.", "Это флаг России: белый, синий, красный.", "This is the flag of Russia: white, blue and red."),
    rasm: d("Oq qayinlar — rus tabiatining ramzi. Ruscha — [ru]берёза[/ru].", "Белые берёзы — символ русской природы.", "White birch trees — a symbol of Russian nature."),
    buyum: d("Matryoshka — ichma-ich qo'g'irchoq. [ru]АБВ[/ru] — rus alifbosi.", "Матрёшка — куколка в куколке. АБВ — русский алфавит.", "A matryoshka — dolls inside dolls. АБВ is the Russian alphabet."),
  },
  elif: {
    bayroq: d("Bu — Turkiya bayrog'i: qizil, oy va yulduz.", "Это флаг Турции: красный, с луной и звездой.", "This is the flag of Turkey: red with a moon and a star."),
    rasm: d("Bu — [tr]İstanbul[/tr]: masjidlar va dengiz bo'yidagi ko'priklar.", "Это [tr]İstanbul[/tr]: мечети и мосты у моря.", "This is Istanbul: mosques and bridges by the sea."),
    buyum: d("Lola guli — Turkiyaning sevimli guli. Turkchada — [tr]lale[/tr].", "Тюльпан — любимый цветок Турции, по-турецки [tr]lale[/tr].", "The tulip is Turkey's favourite flower — lale in Turkish."),
  },
  yusuf: {
    bayroq: d("Bu — Saudiya Arabistoni bayrog'i. Arab tilida ko'p davlatlar gaplashadi.", "Это флаг Саудовской Аравии. На арабском говорят во многих странах.", "This is the flag of Saudi Arabia. Arabic is spoken in many countries."),
    rasm: d("Arab harflari o'ngdan chapga yoziladi: [ar]أ ب ت[/ar].", "Арабские буквы пишут справа налево: [ar]أ ب ت[/ar].", "Arabic letters are written from right to left."),
    buyum: d("Chiroyli ko'za va kitoblar — arab xattotligi va kitobxonlik qadimdan qadrlanadi.", "Красивый кувшин и книги — каллиграфию и чтение ценят с древности.", "A beautiful jug and books — calligraphy and reading are treasured."),
  },
  lukas: {
    bayroq: d("Bu — Germaniya bayrog'i: qora, qizil, sariq.", "Это флаг Германии: чёрный, красный, золотой.", "This is the flag of Germany: black, red and gold."),
    rasm: d("Bu — [de]Brandenburger Tor[/de], Berlin darvozasi.", "Это [de]Brandenburger Tor[/de] — ворота в Берлине.", "This is the Brandenburg Gate in Berlin."),
    buyum: d("Velosiped — nemis bolalari maktabga ko'pincha velosipedda boradi. [de]das Fahrrad[/de].", "Велосипед — немецкие дети часто ездят в школу на велосипеде: [de]das Fahrrad[/de].", "A bicycle — German children often ride to school."),
  },
  carlos: {
    bayroq: d("Bu — Ispaniya bayrog'i: qizil va sariq.", "Это флаг Испании: красный и жёлтый.", "This is the flag of Spain: red and yellow."),
    rasm: d("Ispaniya — quyoshli o'lka, apelsin bog'lari ko'p. [es]el sol[/es] — quyosh.", "Испания — солнечная страна апельсиновых садов. [es]el sol[/es] — солнце.", "Spain is a sunny land of orange groves. El sol means the sun."),
    buyum: d("Gitara — ispan musiqasining yuragi. [es]la guitarra[/es].", "Гитара — сердце испанской музыки: [es]la guitarra[/es].", "The guitar is the heart of Spanish music."),
  },
  jiwoo: {
    bayroq: d("Bu — Koreya bayrog'i: o'rtada qizil va ko'k doira.", "Это флаг Кореи: в центре красно-синий круг.", "This is the flag of Korea, with a red and blue circle."),
    rasm: d("Koreys harflari — [ko]가나다[/ko]. Ular hangul deyiladi.", "Корейские буквы — [ko]가나다[/ko], они называются хангыль.", "Korean letters — 가나다 — are called Hangul."),
    buyum: d("Gullar — mugunghva Koreyaning milliy guli.", "Цветы — мугунхва, национальный цветок Кореи.", "Flowers — the mugunghwa is Korea's national flower."),
  },
  camille: {
    bayroq: d("Bu — Fransiya bayrog'i: ko'k, oq, qizil.", "Это флаг Франции: синий, белый, красный.", "This is the flag of France: blue, white and red."),
    rasm: d("Bu — [fr]la tour Eiffel[/fr], Parijdagi Eyfel minorasi.", "Это [fr]la tour Eiffel[/fr] — Эйфелева башня в Париже.", "This is the Eiffel Tower in Paris."),
    buyum: d("Lavanda va kruassan — Fransiyaning mashhur guli va noni. [fr]le croissant[/fr].", "Лаванда и круассан — знаменитые цветок и выпечка Франции.", "Lavender and croissants — famous French flowers and pastry."),
  },
  mei: {
    bayroq: d("Bu — Xitoy bayrog'i: qizil, sariq yulduzlar bilan.", "Это флаг Китая: красный с жёлтыми звёздами.", "This is the flag of China: red with yellow stars."),
    rasm: d("Panda — Xitoyning sevimli hayvoni. Xitoychada — [zh]熊猫[/zh].", "Панда — любимое животное Китая: [zh]熊猫[/zh].", "The panda is China's favourite animal — 熊猫."),
    buyum: d("[zh]中文[/zh] — «xitoy tili» degani. Qizil fonarlar bayramda osiladi.", "[zh]中文[/zh] значит «китайский язык». Красные фонарики вешают на праздник.", "中文 means Chinese. Red lanterns are hung for festivals."),
  },
  kenji: {
    bayroq: d("Bu — Yaponiya bayrog'i: oq fonda qizil quyosh.", "Это флаг Японии: красное солнце на белом.", "This is the flag of Japan: a red sun on white."),
    rasm: d("Yapon harflari — [ja]あいう[/ja]. Ular xiragana deyiladi.", "Японские буквы — [ja]あいう[/ja], это хирагана.", "Japanese letters — あいう — are called hiragana."),
    buyum: d("Qog'ozdan turna — origami, sakura gullari — Yaponiya ramzi.", "Бумажный журавлик — оригами, и цветы сакуры — символ Японии.", "Paper cranes — origami — and cherry blossoms are symbols of Japan."),
  },
};

/** Xona detallari: [{ k, l, t, w, h, matn: {uz, ru, en} }] yoki []. */
export function detallar(ustoz) {
  const m = MADANIYAT[ustoz];
  return m ? Object.entries(DETAL_JOY).map(([k, joy]) => ({ k, ...joy, matn: m[k] })) : [];
}
