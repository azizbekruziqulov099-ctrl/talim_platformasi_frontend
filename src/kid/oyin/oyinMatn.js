// REV324: o'yin dvigateli — ustoz (izoh tilida) aytadigan gaplar. {t} — o'rganilayotgan tildagi so'z (ovozga teglangan),
// {n}, {a}, {b} — sonlar, {q} — qator (ketma-ketlik yoki sonlar qatori). Izoh tillari: uz, ru, en, de, es.
// Sof ma'lumot: brauzersiz sinaladi. Gaplarda emoji yo'q (ovoz emoji o'qimasin).

export const IZOH_TILLARI = ["uz", "ru", "en", "de", "es"];
export const izohNorm = (izoh) => (IZOH_TILLARI.includes(izoh) ? izoh : "uz");

export const UMUMIY_MATN = {
  maqtov: {
    uz: ["Barakalla!", "Zo‘r!", "Ofarin!", "Juda yaxshi!", "Qoyil!"],
    ru: ["Молодец!", "Отлично!", "Здорово!", "Умница!", "Супер!"],
    en: ["Well done!", "Great!", "Awesome!", "Good job!", "Super!"],
    de: ["Gut gemacht!", "Toll!", "Super!", "Prima!", "Klasse!"],
    es: ["¡Muy bien!", "¡Genial!", "¡Estupendo!", "¡Bravo!", "¡Súper!"],
  },
  dalda: {
    uz: ["Yana urinib ko‘r!", "Qani, yana bir bor!", "Deyarli topding!"],
    ru: ["Попробуй ещё!", "Давай ещё разок!", "Почти получилось!"],
    en: ["Try again!", "One more time!", "Almost!"],
    de: ["Versuch es noch einmal!", "Noch einmal!", "Fast!"],
    es: ["¡Inténtalo otra vez!", "¡Otra vez!", "¡Casi!"],
  },
  yakun: {
    uz: "O‘yin tugadi! Sen zo‘rsan!",
    ru: "Игра окончена! Ты молодец!",
    en: "The game is over! You are great!",
    de: "Das Spiel ist aus! Du bist toll!",
    es: "¡Se acabó el juego! ¡Eres genial!",
  },
  mana: { uz: "Mana bu — {t}.", ru: "Вот это — {t}.", en: "This is {t}.", de: "Das ist {t}.", es: "Esto es {t}." },
  nechta: { uz: "Nechta?", ru: "Сколько?", en: "How many?", de: "Wie viele?", es: "¿Cuántos?" },
};

/** Har o'yinning gaplari: kirish (1-raund boshida bir marta) va raund gaplari. Kalit — OYINLAR[].kalit. */
export const OYIN_MATN = {
  eshitBos: {
    nom: { uz: "Eshit va bos", ru: "Слушай и нажимай", en: "Listen and tap", de: "Hör zu und tipp", es: "Escucha y toca" },
    kirish: {
      uz: "Eshit va bos! Men aytaman, sen rasmini topib bosasan.",
      ru: "Слушай и нажимай! Я называю слово, а ты находишь картинку.",
      en: "Listen and tap! I say a word, and you find the picture.",
      de: "Hör zu und tipp! Ich sage ein Wort, und du findest das Bild.",
      es: "¡Escucha y toca! Yo digo una palabra y tú encuentras el dibujo.",
    },
    raund: { uz: "{t}! Qani, qayerda? Bos!", ru: "{t}! Где? Нажми!", en: "{t}! Where is it? Tap it!", de: "{t}! Wo ist es? Tipp drauf!", es: "{t}. ¿Dónde está? ¡Tócalo!" },
  },
  aytOch: {
    nom: { uz: "Ayt va och", ru: "Скажи и открой", en: "Say it and open", de: "Sag es und öffne", es: "Dilo y abre" },
    kirish: {
      uz: "Ayt va och! Eshikdagi rasmning nomini aytsang, eshik ochiladi.",
      ru: "Скажи и открой! Назови картинку на двери — и дверь откроется.",
      en: "Say it and open! Say the name of the picture on the door, and the door opens.",
      de: "Sag es und öffne! Sag, was auf der Tür ist, und die Tür geht auf.",
      es: "¡Dilo y abre! Di el nombre del dibujo de la puerta y la puerta se abre.",
    },
    raund: { uz: "{t}. Endi sen ayt!", ru: "{t}. Теперь скажи ты!", en: "{t}. Now you say it!", de: "{t}. Jetzt sagst du es!", es: "{t}. ¡Ahora dilo tú!" },
    raundBos: { uz: "{t}! Qaysi eshik? Bos!", ru: "{t}! Какая дверь? Нажми!", en: "{t}! Which door? Tap it!", de: "{t}! Welche Tür? Tipp drauf!", es: "{t}. ¿Qué puerta? ¡Tócala!" },
    yana: { uz: "Yana bir marta: {t}", ru: "Ещё раз: {t}", en: "Once more: {t}", de: "Noch einmal: {t}", es: "Otra vez: {t}" },
    mikYoq: {
      uz: "Mikrofon ishlamayapti. Rasmni bosib och!",
      ru: "Микрофон не работает. Открой, нажав на картинку!",
      en: "The microphone is not working. Tap the picture to open!",
      de: "Das Mikrofon geht nicht. Tipp auf das Bild, um zu öffnen!",
      es: "El micrófono no funciona. ¡Toca el dibujo para abrir!",
    },
  },
  // REV335
  soya: {
    nom: { uz: "Soyasini top", ru: "Найди тень", en: "Find the shadow", de: "Finde den Schatten", es: "Encuentra la sombra" },
    kirish: { uz: "Soyasini top! Har narsaning o‘z soyasi bor.", ru: "Найди тень! У каждой вещи своя тень.", en: "Find the shadow! Everything has its own shadow.",
      de: "Finde den Schatten! Jedes Ding hat seinen Schatten.", es: "¡Encuentra la sombra! Cada cosa tiene su sombra." },
    raund: { uz: "{t}. Uning soyasi qaysi?", ru: "{t}. Где его тень?", en: "{t}. Which is its shadow?", de: "{t}. Welcher ist sein Schatten?", es: "{t}. ¿Cuál es su sombra?" },
  },
  joylashuv: {
    nom: { uz: "Qayerda?", ru: "Где?", en: "Where is it?", de: "Wo ist es?", es: "¿Dónde está?" },
    kirish: { uz: "Qayerda? Qutiga qara va to‘g‘ri joyni top!", ru: "Где? Посмотри на коробку и найди правильное место!", en: "Where is it? Look at the box and find the right place!",
      de: "Wo ist es? Schau auf die Kiste und finde die richtige Stelle!", es: "¿Dónde está? ¡Mira la caja y encuentra el lugar correcto!" },
    raund: { uz: "{t} qayerda?", ru: "Где {t}?", en: "Where is the {t}?", de: "Wo ist {t}?", es: "¿Dónde está {t}?" },
    ustida: { uz: "ustida", ru: "сверху", en: "on top", de: "oben", es: "encima" },
    ostida: { uz: "ostida", ru: "под коробкой", en: "under", de: "unten", es: "debajo" },
    ichida: { uz: "ichida", ru: "внутри", en: "inside", de: "drinnen", es: "dentro" },
    ongda: { uz: "o‘ngda", ru: "справа", en: "on the right", de: "rechts", es: "a la derecha" },
    chapda: { uz: "chapda", ru: "слева", en: "on the left", de: "links", es: "a la izquierda" },
  },
  // REV338: matematika
  dokon: {
    nom: { uz: "Do‘kon", ru: "Магазин", en: "Shop", de: "Laden", es: "Tienda" },
    kirish: { uz: "Do‘kon o‘ynaymiz! Narxiga qara — puling yetadiganini tanla.", ru: "Играем в магазин! Смотри на цену — выбери то, на что хватит денег.",
      en: "Let's play shop! Look at the price — choose what you can afford.", de: "Wir spielen Laden! Schau auf den Preis — wähle, was du kaufen kannst.",
      es: "¡Jugamos a la tienda! Mira el precio y elige lo que puedes comprar." },
    raund: { uz: "Senda {n} ta tanga bor. Qaysi birini sotib ola olasan?", ru: "У тебя {n} монет. Что ты можешь купить?", en: "You have {n} coins. Which one can you buy?",
      de: "Du hast {n} Münzen. Was kannst du kaufen?", es: "Tienes {n} monedas. ¿Qué puedes comprar?" },
  },
  onlik: {
    nom: { uz: "O‘nlik bog‘lami", ru: "Пучки по десять", en: "Bundles of ten", de: "Zehnerbündel", es: "Paquetes de diez" },
    kirish: { uz: "Har bog‘lamda o‘nta tayoqcha bor. Bog‘lamlarni o‘nlab, qolganini birlab sana!", ru: "В каждом пучке десять палочек. Считай пучки десятками, а остальные — по одной!",
      en: "Each bundle has ten sticks. Count the bundles in tens and the rest in ones!", de: "Jedes Bündel hat zehn Stäbchen. Zähl die Bündel in Zehnern und den Rest einzeln!",
      es: "Cada paquete tiene diez palitos. ¡Cuenta los paquetes de diez en diez y el resto de uno en uno!" },
    raund: { uz: "Jami nechta tayoqcha?", ru: "Сколько всего палочек?", en: "How many sticks in total?", de: "Wie viele Stäbchen sind es insgesamt?", es: "¿Cuántos palitos hay en total?" },
  },
  tenglash: {
    nom: { uz: "Tenglashtir", ru: "Сделай поровну", en: "Make them equal", de: "Mach es gleich", es: "Hazlos iguales" },
    kirish: { uz: "Tenglashtir! Ikki likopchada bir xil bo‘lsin.", ru: "Сделай поровну! Пусть на двух тарелках будет одинаково.", en: "Make them equal! Both plates should have the same.",
      de: "Mach es gleich! Auf beiden Tellern soll gleich viel sein.", es: "¡Hazlos iguales! Que en los dos platos haya lo mismo." },
    raund: { uz: "Chapda {a} ta, o‘ngda {b} ta. Chapga nechta qo‘shsak, teng bo‘ladi?", ru: "Слева {a}, справа {b}. Сколько добавить слева, чтобы стало поровну?",
      en: "{a} on the left, {b} on the right. How many do we add on the left to make them equal?", de: "Links {a}, rechts {b}. Wie viele legen wir links dazu, damit es gleich ist?",
      es: "{a} a la izquierda, {b} a la derecha. ¿Cuántos añadimos a la izquierda para que sean iguales?" },
  },
  masala: {
    nom: { uz: "Masala ertagi", ru: "Сказка-задача", en: "Story problem", de: "Rechengeschichte", es: "Cuento-problema" },
    kirish: { uz: "Masala ertagi! Diqqat bilan tingla va hisobla.", ru: "Сказка-задача! Слушай внимательно и считай.", en: "Story problem! Listen carefully and count.",
      de: "Rechengeschichte! Hör gut zu und rechne.", es: "¡Cuento-problema! Escucha con atención y cuenta." },
    qush: { uz: "Daraxtda {a} ta qush bor edi. Yana {b} ta qush uchib keldi. Endi nechta qush bor?", ru: "На дереве сидели {a} птиц. Прилетели ещё {b}. Сколько птиц теперь?",
      en: "There were {a} birds in the tree. {b} more birds flew in. How many birds are there now?", de: "Auf dem Baum saßen {a} Vögel. {b} weitere kamen dazu. Wie viele Vögel sind es jetzt?",
      es: "En el árbol había {a} pájaros. Llegaron {b} más. ¿Cuántos pájaros hay ahora?" },
    olma: { uz: "Savatda {a} ta olma bor edi. {b} tasini yedik. Nechta olma qoldi?", ru: "В корзине было {a} яблок. Мы съели {b}. Сколько яблок осталось?",
      en: "There were {a} apples in the basket. We ate {b}. How many apples are left?", de: "Im Korb waren {a} Äpfel. Wir haben {b} gegessen. Wie viele Äpfel sind übrig?",
      es: "En la cesta había {a} manzanas. Comimos {b}. ¿Cuántas manzanas quedan?" },
    baliq: { uz: "Hovuzda {a} ta baliq suzardi. Yana {b} ta baliq keldi. Endi nechta baliq?", ru: "В пруду плавали {a} рыбок. Приплыли ещё {b}. Сколько рыбок теперь?",
      en: "{a} fish were swimming in the pond. {b} more fish came. How many fish now?", de: "Im Teich schwammen {a} Fische. {b} weitere kamen dazu. Wie viele Fische sind es jetzt?",
      es: "En el estanque nadaban {a} peces. Llegaron {b} más. ¿Cuántos peces hay ahora?" },
    shar: { uz: "Kabuda {a} ta shar bor edi. {b} tasi uchib ketdi. Nechta shar qoldi?", ru: "У Кабу было {a} шариков. {b} улетели. Сколько шариков осталось?",
      en: "Kabu had {a} balloons. {b} flew away. How many balloons are left?", de: "Kabu hatte {a} Luftballons. {b} sind weggeflogen. Wie viele sind übrig?",
      es: "Kabu tenía {a} globos. {b} se fueron volando. ¿Cuántos globos quedan?" },
    ordak: { uz: "Ko‘lda {a} ta o‘rdak bor edi. Yana {b} ta o‘rdak suzib keldi. Endi nechta o‘rdak?", ru: "На озере было {a} уток. Приплыли ещё {b}. Сколько уток теперь?",
      en: "There were {a} ducks on the lake. {b} more ducks swam over. How many ducks now?", de: "Auf dem See waren {a} Enten. {b} weitere schwammen herbei. Wie viele Enten sind es jetzt?",
      es: "En el lago había {a} patos. Llegaron nadando {b} más. ¿Cuántos patos hay ahora?" },
    pechenye: { uz: "Likopchada {a} ta pechenye bor edi. {b} tasini do‘stimga berdim. Nechta qoldi?", ru: "На тарелке было {a} печенья. {b} я отдал другу. Сколько осталось?",
      en: "There were {a} cookies on the plate. I gave {b} to my friend. How many are left?", de: "Auf dem Teller waren {a} Kekse. {b} habe ich meinem Freund gegeben. Wie viele sind übrig?",
      es: "En el plato había {a} galletas. Le di {b} a mi amigo. ¿Cuántas quedan?" },
  },
  // REV337: rang-tasvir
  rangTop: {
    nom: { uz: "Rangni top", ru: "Найди цвет", en: "Find the colour", de: "Finde die Farbe", es: "Encuentra el color" },
    kirish: { uz: "Rangni top! Men rangni aytaman, sen bos.", ru: "Найди цвет! Я назову цвет, а ты нажми.", en: "Find the colour! I say a colour, you tap it.",
      de: "Finde die Farbe! Ich sage eine Farbe, du tippst darauf.", es: "¡Encuentra el color! Yo digo un color y tú lo tocas." },
    raund: { uz: "{t} rangni bos!", ru: "Нажми на {t} цвет!", en: "Tap {t}!", de: "Tipp auf {t}!", es: "¡Toca el {t}!" },
  },
  rangUyi: {
    nom: { uz: "Rang uyi", ru: "Цветной домик", en: "Colour houses", de: "Farbhäuser", es: "Casas de colores" },
    kirish: { uz: "Rang uyi! Har narsa o‘z rangidagi uyda yashaydi.", ru: "Цветной домик! Каждая вещь живёт в домике своего цвета.", en: "Colour houses! Everything lives in the house of its colour.",
      de: "Farbhäuser! Jedes Ding wohnt im Haus seiner Farbe.", es: "¡Casas de colores! Cada cosa vive en la casa de su color." },
    raund: { uz: "Bu qaysi rangda? Uning uyini bos!", ru: "Какого это цвета? Нажми на его домик!", en: "What colour is it? Tap its house!",
      de: "Welche Farbe hat es? Tipp auf sein Haus!", es: "¿De qué color es? ¡Toca su casa!" },
  },
  boya: {
    nom: { uz: "Bo‘yab chiq", ru: "Раскрась", en: "Colour it in", de: "Mal es an", es: "Colorea" },
    kirish: { uz: "Bo‘yab chiq! Rasm rangsiz qolibdi — to‘g‘ri bo‘yoqni tanla.", ru: "Раскрась! Картинка осталась без цвета — выбери правильную краску.",
      en: "Colour it in! The picture lost its colour — pick the right paint.", de: "Mal es an! Das Bild hat keine Farbe — wähle die richtige Farbe.",
      es: "¡Colorea! El dibujo no tiene color: elige la pintura correcta." },
    raund: { uz: "Qaysi bo‘yoq kerak? Bo‘ya!", ru: "Какая краска нужна? Раскрась!", en: "Which paint do we need? Colour it!", de: "Welche Farbe brauchen wir? Mal es an!", es: "¿Qué pintura necesitamos? ¡Colorea!" },
  },
  aralash: {
    nom: { uz: "Rang aralashtir", ru: "Смешай краски", en: "Mix the colours", de: "Farben mischen", es: "Mezcla los colores" },
    kirish: { uz: "Rang aralashtir! Ikki bo‘yoq qo‘shilsa, yangi rang chiqadi.", ru: "Смешай краски! Из двух красок получается новый цвет.", en: "Mix the colours! Two paints together make a new colour.",
      de: "Farben mischen! Aus zwei Farben entsteht eine neue.", es: "¡Mezcla los colores! Dos pinturas juntas hacen un color nuevo." },
    raund: { uz: "{a} va {b} qo‘shilsa, qanday rang chiqadi?", ru: "{a} и {b} вместе — какой получится цвет?", en: "{a} and {b} together — what colour do we get?",
      de: "{a} und {b} zusammen — welche Farbe kommt heraus?", es: "{a} y {b} juntos: ¿qué color sale?" },
  },
  // REV336
  yollar: {
    nom: { uz: "Chalkash yo‘llar", ru: "Запутанные дорожки", en: "Tangled paths", de: "Verschlungene Wege", es: "Caminos enredados" },
    kirish: { uz: "Chalkash yo‘llar! Barmog‘ing bilan chiziq bo‘ylab yur.", ru: "Запутанные дорожки! Веди пальчиком по линии.", en: "Tangled paths! Follow the line with your finger.",
      de: "Verschlungene Wege! Fahr mit dem Finger die Linie entlang.", es: "¡Caminos enredados! Sigue la línea con el dedo." },
    raund: { uz: "Qaysi yo‘l suyakka olib boradi? O‘shani bos!", ru: "Какая дорожка ведёт к косточке? Нажми на неё!", en: "Which path leads to the bone? Tap it!",
      de: "Welcher Weg führt zum Knochen? Tipp darauf!", es: "¿Qué camino lleva al hueso? ¡Tócalo!" },
  },
  tarozi: {
    nom: { uz: "Tarozi", ru: "Весы", en: "Scales", de: "Waage", es: "Balanza" },
    kirish: { uz: "Tarozi! Og‘ir narsa pastga tushadi, yengili tepaga ko‘tariladi.", ru: "Весы! Тяжёлое опускается вниз, лёгкое поднимается вверх.", en: "Scales! The heavy one goes down, the light one goes up.",
      de: "Waage! Das Schwere geht nach unten, das Leichte nach oben.", es: "¡Balanza! Lo pesado baja y lo ligero sube." },
    raund: { uz: "Qaysi biri og‘irroq?", ru: "Что тяжелее?", en: "Which one is heavier?", de: "Was ist schwerer?", es: "¿Cuál pesa más?" },
    yengil: { uz: "Qaysi biri yengilroq?", ru: "Что легче?", en: "Which one is lighter?", de: "Was ist leichter?", es: "¿Cuál pesa menos?" },
  },
  teskari: {
    nom: { uz: "Teskarisini top", ru: "Найди противоположное", en: "Find the opposite", de: "Finde das Gegenteil", es: "Encuentra lo contrario" },
    kirish: { uz: "Teskarisini top! Issiqning teskarisi — sovuq.", ru: "Найди противоположное! Горячий — холодный.", en: "Find the opposite! The opposite of hot is cold.",
      de: "Finde das Gegenteil! Das Gegenteil von heiß ist kalt.", es: "¡Encuentra lo contrario! Lo contrario de caliente es frío." },
    raund: { uz: "«{t}». Uning teskarisi qaysi?", ru: "«{t}». Что противоположное?", en: "“{t}”. What is the opposite?", de: "„{t}“. Was ist das Gegenteil?", es: "«{t}». ¿Qué es lo contrario?" },
  },
  minora: {
    nom: { uz: "Kubiklar minorasi", ru: "Башня из кубиков", en: "Block tower", de: "Klötzchenturm", es: "Torre de cubos" },
    kirish: { uz: "Kubiklar minorasi! Kabu minora qurdi — xuddi shunday minorani top.", ru: "Башня из кубиков! Кабу построил башню — найди точно такую же.",
      en: "Block tower! Kabu built a tower — find one exactly like it.", de: "Klötzchenturm! Kabu hat einen Turm gebaut — finde genau den gleichen.",
      es: "¡Torre de cubos! Kabu construyó una torre: encuentra una igual." },
    raund: { uz: "Ranglariga qara: xuddi shunday minora qaysi?", ru: "Посмотри на цвета: какая башня такая же?", en: "Look at the colours: which tower is the same?",
      de: "Schau auf die Farben: welcher Turm ist gleich?", es: "Mira los colores: ¿qué torre es igual?" },
  },
  oxshash: {
    nom: { uz: "O‘xshashini top", ru: "Найди такую же", en: "Find the same", de: "Finde das Gleiche", es: "Encuentra el igual" },
    kirish: {
      uz: "O‘xshashini top! Tepadagi rasmning xuddi o‘zini bos.",
      ru: "Найди такую же! Нажми на такую же картинку, как наверху.",
      en: "Find the same! Tap the picture that matches the one on top.",
      de: "Finde das Gleiche! Tipp auf das Bild, das genauso ist wie oben.",
      es: "¡Encuentra el igual! Toca el dibujo igual al de arriba.",
    },
    raund: { uz: "{t}. Xuddi shunisini top!", ru: "{t}. Найди такую же!", en: "{t}. Find the same one!", de: "{t}. Finde das gleiche!", es: "{t}. ¡Encuentra el igual!" },
  },
  juft: {
    nom: { uz: "Juft kartalar", ru: "Парные карточки", en: "Memory pairs", de: "Memory", es: "Parejas" },
    kirish: {
      uz: "Juft kartalar! Ikkita kartani och va bir xil rasmlarni top.",
      ru: "Парные карточки! Открывай по две карточки и находи одинаковые.",
      en: "Memory pairs! Open two cards and find the same pictures.",
      de: "Memory! Dreh zwei Karten um und finde gleiche Bilder.",
      es: "¡Parejas! Da la vuelta a dos cartas y encuentra los dibujos iguales.",
    },
    raund: { uz: "Kartalarni och!", ru: "Открывай карточки!", en: "Open the cards!", de: "Dreh die Karten um!", es: "¡Da la vuelta a las cartas!" },
  },
  yashirin: {
    nom: { uz: "Kim yashirindi", ru: "Кто спрятался", en: "Who is hiding", de: "Wer hat sich versteckt", es: "Quién se escondió" },
    kirish: {
      uz: "Kim yashirindi? Rasmlarga yaxshilab qara.",
      ru: "Кто спрятался? Внимательно посмотри на картинки.",
      en: "Who is hiding? Look at the pictures carefully.",
      de: "Wer hat sich versteckt? Schau dir die Bilder gut an.",
      es: "¿Quién se escondió? Mira bien los dibujos.",
    },
    raund: { uz: "Qara va eslab qol!", ru: "Смотри и запоминай!", en: "Look and remember!", de: "Schau hin und merk es dir!", es: "¡Mira y recuerda!" },
    savol: { uz: "Kim yashirindi? Bos!", ru: "Кто спрятался? Нажми!", en: "Who is hiding? Tap it!", de: "Wer hat sich versteckt? Tipp drauf!", es: "¿Quién se escondió? ¡Tócalo!" },
  },
  ortiqcha: {
    nom: { uz: "Ortiqchasini top", ru: "Найди лишнее", en: "Odd one out", de: "Was passt nicht?", es: "El diferente" },
    kirish: {
      uz: "Ortiqchasini top! Boshqalarga o‘xshamagan rasmni bos.",
      ru: "Найди лишнее! Нажми на картинку, которая не похожа на другие.",
      en: "Find the odd one out! Tap the picture that is different.",
      de: "Was passt nicht? Tipp auf das Bild, das anders ist.",
      es: "¡Encuentra el diferente! Toca el dibujo que no es igual.",
    },
    raund: { uz: "Qaysi biri boshqacha?", ru: "Какая картинка другая?", en: "Which one is different?", de: "Welches ist anders?", es: "¿Cuál es diferente?" },
  },
  ketmaKet: {
    nom: { uz: "Kabu ketma-ketligi", ru: "Ряд Кабу", en: "Kabu's pattern", de: "Kabus Muster", es: "La serie de Kabu" },
    kirish: {
      uz: "Kabu rasmlardan qator tuzdi. Keyin qaysi rasm keladi?",
      ru: "Кабу выложил картинки в ряд. Какая будет следующей?",
      en: "Kabu made a row of pictures. What comes next?",
      de: "Kabu hat eine Reihe gelegt. Was kommt als Nächstes?",
      es: "Kabu hizo una fila de dibujos. ¿Qué viene después?",
    },
    raund: { uz: "{q}… Keyingisi qaysi?", ru: "{q}… Что дальше?", en: "{q}… What comes next?", de: "{q}… Was kommt jetzt?", es: "{q}… ¿Qué sigue?" },
  },
  tartib: {
    nom: { uz: "Hikoya tartibi", ru: "Порядок истории", en: "Story order", de: "Die Reihenfolge", es: "El orden de la historia" },
    kirish: {
      uz: "Hikoya tartibi! Rasmlarni men aytgan tartibda joyiga sur.",
      ru: "Порядок истории! Перетащи картинки по порядку, как я скажу.",
      en: "Story order! Drag the pictures into place in the order I say.",
      de: "Die richtige Reihenfolge! Zieh die Bilder so, wie ich es sage.",
      es: "¡El orden de la historia! Arrastra los dibujos en el orden que digo.",
    },
    avval: { uz: "Avval {t}.", ru: "Сначала {t}.", en: "First {t}.", de: "Zuerst {t}.", es: "Primero {t}." },
    keyin: { uz: "Keyin {t}.", ru: "Потом {t}.", en: "Then {t}.", de: "Dann {t}.", es: "Después {t}." },
  },
  savat: {
    nom: { uz: "Savatga sol", ru: "Положи в корзину", en: "Into the basket", de: "Ab in den Korb", es: "A la cesta" },
    kirish: {
      uz: "Savatga sol! Men aytgan narsani savatga sur.",
      ru: "Положи в корзину! Перетащи в корзину то, что я назову.",
      en: "Into the basket! Drag what I say into the basket.",
      de: "Ab in den Korb! Zieh das, was ich sage, in den Korb.",
      es: "¡A la cesta! Arrastra a la cesta lo que yo diga.",
    },
    raund: { uz: "Savatga {t} sol. {n} ta kerak!", ru: "Положи в корзину {t}. Нужно {n}!", en: "Put {t} in the basket. We need {n}!", de: "Leg {t} in den Korb. Wir brauchen {n}!", es: "Pon {t} en la cesta. ¡Necesitamos {n}!" },
    kam: { uz: "Hali kam! Yana sol.", ru: "Пока мало! Положи ещё.", en: "Not enough yet! Put in more.", de: "Noch zu wenig! Leg noch mehr hinein.", es: "¡Faltan! Pon más." },
    kop: { uz: "Ko‘p bo‘lib ketdi! Bittasini ol.", ru: "Слишком много! Убери одну.", en: "Too many! Take one out.", de: "Zu viele! Nimm eins heraus.", es: "¡Demasiados! Saca uno." },
  },
  sana: {
    nom: { uz: "Bosib sana", ru: "Нажимай и считай", en: "Tap and count", de: "Tippen und zählen", es: "Toca y cuenta" },
    kirish: {
      uz: "Bosib sana! Har birini bos, birga sanaymiz.",
      ru: "Нажимай и считай! Нажми на каждую, посчитаем вместе.",
      en: "Tap and count! Tap each one, and we count together.",
      de: "Tippen und zählen! Tipp auf jedes, wir zählen zusammen.",
      es: "¡Toca y cuenta! Toca cada uno y contamos juntos.",
    },
    raund: { uz: "{t}. Har birini bos!", ru: "{t}. Нажми на каждую!", en: "{t}. Tap each one!", de: "{t}. Tipp auf jedes!", es: "{t}. ¡Toca cada uno!" },
  },
  qaysiKop: {
    nom: { uz: "Qaysi ko‘p", ru: "Где больше", en: "Which has more", de: "Wo sind mehr", es: "Dónde hay más" },
    kirish: {
      uz: "Qaysi ko‘p? Rasmi ko‘proq guruhni bos.",
      ru: "Где больше? Нажми на группу, где картинок больше.",
      en: "Which has more? Tap the group with more pictures.",
      de: "Wo sind mehr? Tipp auf die Gruppe mit mehr Bildern.",
      es: "¿Dónde hay más? Toca el grupo con más dibujos.",
    },
    raund: { uz: "Qayerda ko‘p?", ru: "Где больше?", en: "Where are there more?", de: "Wo sind mehr?", es: "¿Dónde hay más?" },
  },
  yoqolganSon: {
    nom: { uz: "Yo‘qolgan son", ru: "Потерянное число", en: "The missing number", de: "Die fehlende Zahl", es: "El número perdido" },
    kirish: {
      uz: "Yo‘qolgan son! Qatordan bitta son qochib ketdi. Uni top!",
      ru: "Потерянное число! Одно число убежало из ряда. Найди его!",
      en: "The missing number! One number ran away from the row. Find it!",
      de: "Die fehlende Zahl! Eine Zahl ist weggelaufen. Finde sie!",
      es: "¡El número perdido! Un número se escapó de la fila. ¡Encuéntralo!",
    },
    raund: { uz: "{q}. Qaysi son yo‘q?", ru: "{q}. Какого числа нет?", en: "{q}. Which number is missing?", de: "{q}. Welche Zahl fehlt?", es: "{q}. ¿Qué número falta?" },
  },
  kabuXato: {
    nom: { uz: "Kabu xato qildi", ru: "Кабу ошибся", en: "Kabu's mistake", de: "Kabus Fehler", es: "Kabu se equivocó" },
    kirish: {
      uz: "Voy, Kabu shoshib xato qildi! Noto‘g‘ri juftni top.",
      ru: "Ой, Кабу поспешил и ошибся! Найди неправильную пару.",
      en: "Oops, Kabu was in a hurry and made a mistake! Find the wrong pair.",
      de: "Oje, Kabu hat sich vertan! Finde das falsche Paar.",
      es: "¡Uy, Kabu se equivocó! Encuentra la pareja que está mal.",
    },
    raund: { uz: "Qaysi juft xato? Bos!", ru: "Какая пара неправильная? Нажми!", en: "Which pair is wrong? Tap it!", de: "Welches Paar ist falsch? Tipp drauf!", es: "¿Qué pareja está mal? ¡Tócala!" },
  },
  haYoq: {
    nom: { uz: "Ha yoki yo‘q", ru: "Да или нет", en: "Yes or no", de: "Ja oder nein", es: "Sí o no" },
    kirish: {
      uz: "Ha yoki yo‘q! To‘g‘ri aytsam — yashil tugmani, xato aytsam — qizil tugmani bos.",
      ru: "Да или нет! Если я скажу правильно — нажми зелёную кнопку, если неправильно — красную.",
      en: "Yes or no! If I say it right, tap green. If I say it wrong, tap red.",
      de: "Ja oder nein! Wenn ich es richtig sage, tipp auf Grün. Wenn falsch, tipp auf Rot.",
      es: "¡Sí o no! Si lo digo bien, toca el verde. Si lo digo mal, toca el rojo.",
    },
    raund: { uz: "Bu — {t}. To‘g‘rimi?", ru: "Это — {t}. Правильно?", en: "This is {t}. Is that right?", de: "Das ist {t}. Stimmt das?", es: "Esto es {t}. ¿Es correcto?" },
  },
  sehrliQuti: {
    nom: { uz: "Sehrli quti", ru: "Волшебная коробка", en: "The magic box", de: "Die Zauberkiste", es: "La caja mágica" },
    kirish: {
      uz: "Sehrli quti! Qutiga nechta tushganini sana.",
      ru: "Волшебная коробка! Считай, сколько упало в коробку.",
      en: "The magic box! Count how many fall into the box.",
      de: "Die Zauberkiste! Zähl, wie viele in die Kiste fallen.",
      es: "¡La caja mágica! Cuenta cuántos caen en la caja.",
    },
    tushdi: { uz: "Qara, qutiga tushyapti! Nechta?", ru: "Смотри, падают в коробку! Сколько?", en: "Look, they fall into the box! How many?", de: "Schau, sie fallen in die Kiste! Wie viele?", es: "¡Mira, caen en la caja! ¿Cuántos?" },
    qosh: {
      uz: "Qutiga {a} ta tushdi, yana {b} ta tushdi. Qutida nechta?",
      ru: "В коробку упало {a}, а потом ещё {b}. Сколько в коробке?",
      en: "{a} fell into the box, then {b} more. How many are in the box?",
      de: "Erst {a}, dann noch {b} in die Kiste. Wie viele sind drin?",
      es: "En la caja: {a}, y luego {b} más. ¿Cuántos hay?",
    },
    ayir: {
      uz: "Qutida {a} ta bor edi. {b} tasi sakrab chiqdi. Nechta qoldi?",
      ru: "В коробке было {a}. Выпрыгнуло: {b}. Сколько осталось?",
      en: "There were {a} in the box. {b} jumped out. How many are left?",
      de: "In der Kiste waren {a}. Herausgesprungen: {b}. Wie viele sind noch drin?",
      es: "Había {a} en la caja. Saltaron fuera: {b}. ¿Cuántos quedan?",
    },
  },
};

/** O'yin gapi izoh tilida, o'rinlari to'ldirilgan. Bo'sh {t} qolsa — gap boshidagi ortiqcha tinish belgilari olib tashlanadi. */
export function oyinMatn(kalit, gapKaliti, izoh = "uz", vars = {}) {
  const til = izohNorm(izoh);
  const m = OYIN_MATN[kalit]?.[gapKaliti] || UMUMIY_MATN[gapKaliti];
  if (!m) return "";
  const asl = Array.isArray(m[til]) ? m[til][0] : (m[til] ?? m.uz ?? "");
  return toza(String(asl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined || vars[k] === null ? "" : String(vars[k]))));
}

/** Navbatdagi maqtov yoki dalda (i — tanlash raqami, takror bo'lmasin uchun). */
export function umumiyGap(tur, izoh = "uz", i = 0) {
  const r = UMUMIY_MATN[tur]?.[izohNorm(izoh)];
  if (!Array.isArray(r)) return r || "";
  return r[((i % r.length) + r.length) % r.length];
}

/** Bo'sh o'rinlardan qolgan izlar: «! Qani» → «Qani», «…  Keyingisi» → «Keyingisi», ortiqcha bo'shliqlar. */
export function toza(s) {
  return String(s || "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s!?.,;:…—-]+(?=[\p{L}¡¿\[])/u, "")
    .replace(/\s+([!?.,;:])/g, "$1")
    .trim();
}
