// REV324: o'yin dvigateli — ustoz (izoh tilida) aytadigan gaplar. {t} — o'rganilayotgan tildagi so'z (ovozga teglangan),
// {n}, {a}, {b} — sonlar, {q} — qator (ketma-ketlik yoki sonlar qatori). Izoh tillari: uz, ru, en, de, es.
// Sof ma'lumot: brauzersiz sinaladi. Gaplarda emoji yo'q (ovoz emoji o'qimasin).

export const IZOH_TILLARI = ["uz", "ru", "en", "de", "es"];
export const izohNorm = (izoh) => (IZOH_TILLARI.includes(izoh) ? izoh : "uz");

export const UMUMIY_MATN = {
  maqtov: {
    uz: ["Barakalla!", "Zo‘r!", "Ofarin!", "Juda yaxshi!", "Qoyil!", "Ana shunday!", "To‘ppa-to‘g‘ri!", "Sen aqllisan!", "Voy, qanday chaqqon!", "Kabu qarsak chalyapti!"],
    ru: ["Молодец!", "Отлично!", "Здорово!", "Умница!", "Супер!", "Вот так!", "Точно!", "Ты умница!", "Ого, как быстро!", "Кабу хлопает!"],
    en: ["Well done!", "Great!", "Awesome!", "Good job!", "Super!", "That's it!", "Exactly right!", "You're so clever!", "Wow, so quick!", "Kabu is clapping!"],
    de: ["Gut gemacht!", "Toll!", "Super!", "Prima!", "Klasse!", "Genau so!", "Ganz richtig!", "Du bist schlau!", "Wow, so schnell!", "Kabu klatscht!"],
    es: ["¡Muy bien!", "¡Genial!", "¡Estupendo!", "¡Bravo!", "¡Súper!", "¡Así es!", "¡Exacto!", "¡Qué listo eres!", "¡Uy, qué rápido!", "¡Kabu aplaude!"],
  },
  dalda: {
    uz: ["Yana urinib ko‘r!", "Qani, yana bir bor!", "Deyarli topding!", "Shoshilmay qara!", "Yaxshilab tingla!", "Hech gap emas, yana bos!", "Sen uddalaysan!"],
    ru: ["Попробуй ещё!", "Давай ещё разок!", "Почти получилось!", "Посмотри не спеша!", "Послушай внимательно!", "Ничего страшного, нажми ещё!", "У тебя получится!"],
    en: ["Try again!", "One more time!", "Almost!", "Look carefully!", "Listen closely!", "No problem, tap again!", "You can do it!"],
    de: ["Versuch es noch einmal!", "Noch einmal!", "Fast!", "Schau in Ruhe hin!", "Hör gut zu!", "Macht nichts, tipp noch mal!", "Du schaffst das!"],
    es: ["¡Inténtalo otra vez!", "¡Otra vez!", "¡Casi!", "¡Mira con calma!", "¡Escucha bien!", "No pasa nada, ¡toca otra vez!", "¡Tú puedes!"],
  },
  // REV347: o'yin oxiri — har safar boshqa gap
  yakun: {
    uz: ["O‘yin tugadi! Sen zo‘rsan!", "Hammasini topding! Qoyil!", "Ana xolos! Juda chaqqonsan!", "Kabu xursand — sen hammasini bilding!", "Bir yulduz senga! Zo‘r o‘ynading!", "Ofarin! Endi keyingi sirni ochamiz.", "Barakalla! Bu o‘yinni yutding!"],
    ru: ["Игра окончена! Ты молодец!", "Ты всё нашёл! Здорово!", "Вот и всё! Какой ты ловкий!", "Кабу радуется — ты всё знаешь!", "Тебе звёздочка! Отличная игра!", "Умница! Теперь откроем следующий секрет.", "Браво! Ты выиграл эту игру!"],
    en: ["The game is over! You are great!", "You found them all! Amazing!", "That's it! You are so quick!", "Kabu is happy — you knew everything!", "A star for you! Great playing!", "Well done! Now let's open the next secret.", "Bravo! You won this game!"],
    de: ["Das Spiel ist aus! Du bist toll!", "Du hast alles gefunden! Super!", "Fertig! Du bist so flink!", "Kabu freut sich — du wusstest alles!", "Ein Stern für dich! Toll gespielt!", "Prima! Jetzt lüften wir das nächste Geheimnis.", "Bravo! Du hast dieses Spiel gewonnen!"],
    es: ["¡Se acabó el juego! ¡Eres genial!", "¡Lo encontraste todo! ¡Increíble!", "¡Listo! ¡Qué rápido eres!", "Kabu está feliz: ¡lo sabías todo!", "¡Una estrella para ti! ¡Muy bien jugado!", "¡Muy bien! Ahora abrimos el siguiente secreto.", "¡Bravo! ¡Ganaste este juego!"],
  },
  yakunXato: {
    uz: ["O‘yin tugadi! Qiyin edi, lekin uddalading!", "Yaxshi harakat! Keyingi safar yana ham zo‘r bo‘ladi.", "Sen o‘rganyapsan — bu eng muhimi!", "Bir-ikki xato — hech gap emas. Barakalla!"],
    ru: ["Игра окончена! Было трудно, но ты справился!", "Хорошая попытка! В следующий раз будет ещё лучше.", "Ты учишься — это самое главное!", "Пара ошибок — не страшно. Молодец!"],
    en: ["The game is over! It was hard, but you did it!", "Good try! Next time it will be even better.", "You are learning — that's what matters!", "A couple of mistakes — no problem. Well done!"],
    de: ["Das Spiel ist aus! Es war schwer, aber du hast es geschafft!", "Gut versucht! Nächstes Mal wird es noch besser.", "Du lernst — das ist das Wichtigste!", "Ein paar Fehler — macht nichts. Gut gemacht!"],
    es: ["¡Se acabó el juego! Fue difícil, ¡pero lo lograste!", "¡Buen intento! La próxima vez saldrá aún mejor.", "Estás aprendiendo: ¡eso es lo más importante!", "Un par de errores, no pasa nada. ¡Muy bien!"],
  },
  // REV360: yangi o'yinni Kabu ko'rsatadi
  korsataman: { uz: ["Qara, avval men o‘ynab ko‘rsataman.", "Kuzat: birinchisini men topaman."], ru: ["Смотри, сначала покажу я.", "Следи: первое найду я."],
    en: ["Watch, I'll show you first.", "Look: I'll find the first one."], de: ["Schau, ich zeige es dir zuerst.", "Pass auf: das erste finde ich."],
    es: ["Mira, primero te lo enseño yo.", "Fíjate: el primero lo encuentro yo."] },
  endiSen: { uz: ["Ko‘rdingmi? Endi sen!", "Mana shunday! Endi navbat senda."], ru: ["Видел? Теперь ты!", "Вот так! Теперь твоя очередь."],
    en: ["See? Now it's your turn!", "Just like that! Now you try."], de: ["Gesehen? Jetzt bist du dran!", "Genau so! Jetzt du."],
    es: ["¿Lo viste? ¡Ahora tú!", "¡Así! Ahora te toca a ti."] },
  // REV349: jarayon tartibi — javobni aytib qo'ymaymiz (4–5: «avval nima?», 6–7: «hammasini joyla»)
  avvalSavol: { uz: ["Avval nima bo‘ladi?", "Eng birinchi nima?"], ru: ["Что бывает сначала?", "Что самое первое?"], en: ["What comes first?", "What happens first?"], de: ["Was kommt zuerst?", "Was passiert zuerst?"], es: ["¿Qué va primero?", "¿Qué pasa primero?"] },
  keyinSavol: { uz: ["Keyin nima?", "Undan keyin-chi?"], ru: ["А потом что?", "Что дальше?"], en: ["What comes next?", "And then?"], de: ["Was kommt dann?", "Und danach?"], es: ["¿Y después?", "¿Qué sigue?"] },
  hammasiTartib: { uz: ["Hammasini to‘g‘ri tartib bilan joyla!", "Boshidan oxirigacha tartibni tuz!"], ru: ["Разложи всё по порядку!", "Составь порядок от начала до конца!"], en: ["Put everything in the right order!", "Make the order from start to finish!"], de: ["Bring alles in die richtige Reihenfolge!", "Ordne alles von Anfang bis Ende!"], es: ["¡Ponlo todo en el orden correcto!", "¡Ordena de principio a fin!"] },
  // REV347: o'yin boshidagi ochilish gaplari (har o'yinda boshqasi)
  ochilish: {
    uz: ["Qani, o‘ynaymiz!", "Kabu yangi o‘yin topdi!", "Diqqat, o‘yin boshlanadi!", "Endi sen ustoz bo‘lasan!", "Sehrli o‘yin vaqti!", "Tayyormisan? Boshladik!", "Kabu seni o‘yinga chaqiryapti!", "Ko‘zlaringni och, quloqlaringni ding qil!"],
    ru: ["Давай играть!", "Кабу нашёл новую игру!", "Внимание, игра начинается!", "Теперь ты будешь учителем!", "Время волшебной игры!", "Готов? Начинаем!", "Кабу зовёт тебя играть!", "Открой глазки, навостри ушки!"],
    en: ["Let's play!", "Kabu found a new game!", "Attention, the game begins!", "Now you are the teacher!", "Magic game time!", "Ready? Let's go!", "Kabu invites you to play!", "Eyes open, ears ready!"],
    de: ["Lass uns spielen!", "Kabu hat ein neues Spiel gefunden!", "Achtung, das Spiel beginnt!", "Jetzt bist du der Lehrer!", "Zeit für ein Zauberspiel!", "Bereit? Los geht's!", "Kabu lädt dich zum Spielen ein!", "Augen auf, Ohren gespitzt!"],
    es: ["¡Vamos a jugar!", "¡Kabu encontró un juego nuevo!", "¡Atención, empieza el juego!", "¡Ahora tú eres el maestro!", "¡Hora del juego mágico!", "¿Listo? ¡Empezamos!", "¡Kabu te invita a jugar!", "¡Ojos abiertos, orejas atentas!"],
  },
  ochilishMavzu: {
    uz: ["Qani, «{mavzu}» bilan o‘ynaymiz!", "Kabu «{mavzu}» uchun o‘yin topdi!", "«{mavzu}» — endi o‘yinda tekshiramiz!", "Qani, «{mavzu}»ni qanchalik bilasan?", "Sehrli o‘yin: «{mavzu}»!", "Tayyormisan? «{mavzu}» o‘yini boshlandi!"],
    ru: ["Давай поиграем: «{mavzu}»!", "Кабу нашёл игру про «{mavzu}»!", "«{mavzu}» — теперь проверим в игре!", "Ну-ка, как хорошо ты знаешь «{mavzu}»?", "Волшебная игра: «{mavzu}»!", "Готов? Игра «{mavzu}» начинается!"],
    en: ["Let's play: “{mavzu}”!", "Kabu found a game about “{mavzu}”!", "“{mavzu}” — now let's check it in a game!", "How well do you know “{mavzu}”?", "Magic game: “{mavzu}”!", "Ready? The “{mavzu}” game begins!"],
    de: ["Lass uns spielen: „{mavzu}“!", "Kabu hat ein Spiel zu „{mavzu}“ gefunden!", "„{mavzu}“ — jetzt prüfen wir es im Spiel!", "Wie gut kennst du „{mavzu}“?", "Zauberspiel: „{mavzu}“!", "Bereit? Das Spiel „{mavzu}“ beginnt!"],
    es: ["¡Vamos a jugar: «{mavzu}»!", "¡Kabu encontró un juego sobre «{mavzu}»!", "«{mavzu}»: ¡ahora lo comprobamos jugando!", "¿Cuánto sabes de «{mavzu}»?", "Juego mágico: «{mavzu}»!", "¿Listo? ¡Empieza el juego «{mavzu}»!"],
  },
  // REV347: shu darsda bo'lgan o'yin — qayta tushuntirilmaydi
  tanishKirish: {
    uz: ["Yana «{nom}»! Qoidasini bilasan.", "«{nom}» qaytdi! Bu safar tezroq!", "Esingdami, «{nom}»? Davom etamiz!", "Yana bir bor «{nom}» — sen buni yaxshi o‘ynaysan!"],
    ru: ["Снова «{nom}»! Правила ты знаешь.", "«{nom}» вернулась! В этот раз быстрее!", "Помнишь «{nom}»? Продолжаем!", "Ещё раз «{nom}» — у тебя хорошо получается!"],
    en: ["“{nom}” again! You know the rules.", "“{nom}” is back! Faster this time!", "Remember “{nom}”? Let's go on!", "One more round of “{nom}” — you are good at it!"],
    de: ["Wieder „{nom}“! Du kennst die Regeln.", "„{nom}“ ist zurück! Diesmal schneller!", "Erinnerst du dich an „{nom}“? Weiter geht's!", "Noch einmal „{nom}“ — das kannst du gut!"],
    es: ["¡Otra vez «{nom}»! Ya conoces las reglas.", "¡Volvió «{nom}»! ¡Esta vez más rápido!", "¿Recuerdas «{nom}»? ¡Seguimos!", "Otra ronda de «{nom}»: ¡se te da muy bien!"],
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
  // REV536: shakl o'yinlari
  shaklTop: {
    nom: { uz: "Shaklni top", ru: "Найди фигуру", en: "Find the shape", de: "Finde die Form", es: "Encuentra la figura" },
    kirish: { uz: "Shaklni top! Men shaklni aytaman, sen bos.", ru: "Найди фигуру! Я назову фигуру, а ты нажми.", en: "Find the shape! I say a shape, you tap it.", de: "Finde die Form! Ich nenne eine Form, du tippst darauf.", es: "¡Encuentra la figura! Yo digo una figura y tú la tocas." },
    raund: { uz: "Qani, {t} qayerda? Bos!", ru: "Где {t}? Нажми!", en: "Where is the {t}? Tap it!", de: "Wo ist: {t}? Tipp darauf!", es: "¿Dónde está: {t}? ¡Tócalo!" },
  },
  shaklJoy: {
    nom: { uz: "Shakl uyasi", ru: "Домик для фигуры", en: "Shape sorter", de: "Formen-Sortierer", es: "Encaja la figura" },
    kirish: { uz: "Shakl uyasi! Har shaklning o‘z uyasi bor.", ru: "Домик для фигуры! У каждой фигуры своё место.", en: "Shape sorter! Every shape has its own hole.", de: "Formen-Sortierer! Jede Form hat ihren Platz.", es: "¡Encaja la figura! Cada figura tiene su hueco." },
    raund: { uz: "Bu shakl qaysi uyaga tushadi?", ru: "В какое окошко подходит эта фигура?", en: "Which hole does this shape fit?", de: "In welche Öffnung passt diese Form?", es: "¿En qué hueco encaja esta figura?" },
  },
  shaklNarsa: {
    nom: { uz: "Nimaga o‘xshaydi?", ru: "На что похоже?", en: "What shape is it?", de: "Welche Form hat es?", es: "¿Qué forma tiene?" },
    kirish: { uz: "Nimaga o‘xshaydi? Atrofimizdagi narsalar ham shakllarga o‘xshaydi.", ru: "На что похоже? Вещи вокруг нас тоже похожи на фигуры.", en: "What shape is it? Things around us look like shapes too.", de: "Welche Form hat es? Dinge um uns herum sehen aus wie Formen.", es: "¿Qué forma tiene? Las cosas que nos rodean también parecen figuras." },
    raund: { uz: "Bu narsa qaysi shaklga o‘xshaydi?", ru: "На какую фигуру это похоже?", en: "Which shape does this look like?", de: "Welcher Form sieht das ähnlich?", es: "¿A qué figura se parece esto?" },
  },
  naqsh: {
    nom: { uz: "Naqshni davom ettir", ru: "Продолжи узор", en: "Continue the pattern", de: "Setze das Muster fort", es: "Continúa el patrón" },
    kirish: { uz: "Naqshni davom ettir! Shakllar navbat bilan keladi.", ru: "Продолжи узор! Фигуры идут по порядку.", en: "Continue the pattern! The shapes take turns.", de: "Setze das Muster fort! Die Formen wechseln sich ab.", es: "¡Continúa el patrón! Las figuras se turnan." },
    raund: { uz: "Keyin qaysi shakl keladi?", ru: "Какая фигура будет дальше?", en: "Which shape comes next?", de: "Welche Form kommt als Nächstes?", es: "¿Qué figura viene después?" },
  },
  kattaKichik: {
    nom: { uz: "Katta va kichik", ru: "Большой и маленький", en: "Big and small", de: "Groß und klein", es: "Grande y pequeño" },
    kirish: { uz: "Katta va kichik! Diqqat bilan qara.", ru: "Большой и маленький! Смотри внимательно.", en: "Big and small! Look carefully.", de: "Groß und klein! Schau genau hin.", es: "¡Grande y pequeño! Mira con atención." },
    raund: { uz: "Eng kattasini bos!", ru: "Нажми на самый большой!", en: "Tap the biggest one!", de: "Tipp auf das Größte!", es: "¡Toca el más grande!" },
    raundKichik: { uz: "Eng kichigini bos!", ru: "Нажми на самый маленький!", en: "Tap the smallest one!", de: "Tipp auf das Kleinste!", es: "¡Toca el más pequeño!" },
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

// REV348: saralash va ulash o'yinlari gaplari (5 tilda)
Object.assign(OYIN_MATN, {
 "uyYovvoyi": {
  "nom": {
   "uz": "Uy yoki yovvoyi",
   "ru": "Домашнее или дикое",
   "en": "Farm or wild",
   "de": "Haus- oder Wildtier",
   "es": "Doméstico o salvaje"
  },
  "kirish": {
   "uz": "Uy hayvonlari odam yonida yashaydi, yovvoyilari — o‘rmon va cho‘lda. Har birini o‘z joyiga joyla!",
   "ru": "Домашние животные живут рядом с человеком, дикие — в лесу и в степи. Отправь каждого на своё место!",
   "en": "Farm animals live with people, wild animals live in forests and fields. Put each one in its place!",
   "de": "Haustiere leben bei Menschen, Wildtiere im Wald und in der Steppe. Bring jedes an seinen Platz!",
   "es": "Los animales domésticos viven con las personas; los salvajes, en el bosque y el campo. ¡Pon cada uno en su lugar!"
  },
  "raund": {
   "uz": [
    "{t}. Uy hayvonimi yoki yovvoyimi?",
    "{t} qayerda yashaydi: uyda yoki o‘rmonda?"
   ],
   "ru": [
    "{t}. Домашнее или дикое?",
    "Где живёт {t}: дома или в лесу?"
   ],
   "en": [
    "{t}. Farm animal or wild?",
    "Where does the {t} live: at a farm or in the wild?"
   ],
   "de": [
    "{t}. Haustier oder Wildtier?",
    "Wo lebt {t}: beim Menschen oder in der Wildnis?"
   ],
   "es": [
    "{t}. ¿Doméstico o salvaje?",
    "¿Dónde vive {t}: en casa o en la naturaleza?"
   ]
  }
 },
 "mevaSabzavot": {
  "nom": {
   "uz": "Meva yoki sabzavot",
   "ru": "Фрукт или овощ",
   "en": "Fruit or vegetable",
   "de": "Obst oder Gemüse",
   "es": "Fruta o verdura"
  },
  "kirish": {
   "uz": "Mevalar shirin, ko‘pincha daraxtda o‘sadi. Sabzavotdan ovqat pishiramiz. Qani, ajratamiz!",
   "ru": "Фрукты сладкие и часто растут на деревьях. Из овощей мы готовим еду. Давай разложим!",
   "en": "Fruits are sweet and often grow on trees. We cook meals with vegetables. Let's sort them!",
   "de": "Obst ist süß und wächst oft an Bäumen. Aus Gemüse kochen wir Essen. Sortieren wir!",
   "es": "Las frutas son dulces y crecen a menudo en árboles. Con las verduras cocinamos. ¡Vamos a ordenar!"
  },
  "raund": {
   "uz": [
    "{t}. Mevami yoki sabzavotmi?",
    "{t}ni qaysi savatga solamiz?"
   ],
   "ru": [
    "{t}. Фрукт или овощ?",
    "В какую корзину положим: {t}?"
   ],
   "en": [
    "{t}. Fruit or vegetable?",
    "Which basket does the {t} go in?"
   ],
   "de": [
    "{t}. Obst oder Gemüse?",
    "In welchen Korb kommt {t}?"
   ],
   "es": [
    "{t}. ¿Fruta o verdura?",
    "¿En qué cesta ponemos {t}?"
   ]
  }
 },
 "xavfli": {
  "nom": {
   "uz": "Xavfli yoki xavfsiz",
   "ru": "Опасно или безопасно",
   "en": "Safe or dangerous",
   "de": "Sicher oder gefährlich",
   "es": "Seguro o peligroso"
  },
  "kirish": {
   "uz": "Ba’zi narsalar bilan o‘ynasa bo‘ladi, ba’zilariga tegmaymiz — ular xavfli. Ajratib ber!",
   "ru": "С некоторыми вещами можно играть, а некоторые трогать нельзя — они опасные. Раздели их!",
   "en": "Some things are safe to play with, others we never touch — they are dangerous. Sort them!",
   "de": "Mit manchen Dingen darf man spielen, andere fasst man nie an — sie sind gefährlich. Sortiere sie!",
   "es": "Con algunas cosas se puede jugar; otras no se tocan, son peligrosas. ¡Sepáralas!"
  },
  "raund": {
   "uz": [
    "{t}. Xavfsizmi yoki xavflimi?",
    "{t} bilan o‘ynasa bo‘ladimi?"
   ],
   "ru": [
    "{t}. Безопасно или опасно?",
    "Можно ли играть: {t}?"
   ],
   "en": [
    "{t}. Safe or dangerous?",
    "Can we play with the {t}?"
   ],
   "de": [
    "{t}. Sicher oder gefährlich?",
    "Darf man damit spielen: {t}?"
   ],
   "es": [
    "{t}. ¿Seguro o peligroso?",
    "¿Se puede jugar con {t}?"
   ]
  }
 },
 "chiqindi": {
  "nom": {
   "uz": "Chiqindini sarala",
   "ru": "Сортируем мусор",
   "en": "Sort the rubbish",
   "de": "Müll trennen",
   "es": "Separa la basura"
  },
  "kirish": {
   "uz": "Tabiatni asraymiz! Qog‘oz, plastik va ovqat qoldiqlari alohida qutiga tashlanadi.",
   "ru": "Бережём природу! Бумагу, пластик и остатки еды выбрасываем в разные контейнеры.",
   "en": "Let's protect nature! Paper, plastic and food scraps go into different bins.",
   "de": "Wir schützen die Natur! Papier, Plastik und Essensreste kommen in verschiedene Tonnen.",
   "es": "¡Cuidemos la naturaleza! El papel, el plástico y los restos de comida van a contenedores distintos."
  },
  "raund": {
   "uz": [
    "{t}. Qaysi qutiga tashlaymiz?",
    "{t} — qog‘ozmi, plastikmi yoki ovqat qoldig‘imi?"
   ],
   "ru": [
    "{t}. В какой контейнер?",
    "{t} — это бумага, пластик или остатки еды?"
   ],
   "en": [
    "{t}. Which bin does it go in?",
    "The {t} — paper, plastic or food scraps?"
   ],
   "de": [
    "{t}. In welche Tonne?",
    "{t} — Papier, Plastik oder Essensreste?"
   ],
   "es": [
    "{t}. ¿A qué contenedor va?",
    "{t}: ¿papel, plástico o restos de comida?"
   ]
  }
 },
 "transport": {
  "nom": {
   "uz": "Transport",
   "ru": "Транспорт",
   "en": "Transport",
   "de": "Verkehrsmittel",
   "es": "Transporte"
  },
  "kirish": {
   "uz": "Transport yerda yuradi, suvda suzadi yoki osmonda uchadi. Har birini joyiga joyla!",
   "ru": "Транспорт ездит по земле, плавает по воде или летает по небу. Отправь каждый на своё место!",
   "en": "Vehicles go on land, on water or fly in the sky. Put each one in its place!",
   "de": "Fahrzeuge fahren an Land, auf dem Wasser oder fliegen am Himmel. Bring jedes an seinen Platz!",
   "es": "Los transportes van por tierra, por el agua o vuelan por el cielo. ¡Pon cada uno en su lugar!"
  },
  "raund": {
   "uz": [
    "{t}. Qayerda yuradi?",
    "{t} yerdami, suvdami yoki osmondami?"
   ],
   "ru": [
    "{t}. Где он движется?",
    "{t} — на земле, на воде или в небе?"
   ],
   "en": [
    "{t}. Where does it go?",
    "The {t} — on land, on water or in the sky?"
   ],
   "de": [
    "{t}. Wo fährt es?",
    "{t} — an Land, auf dem Wasser oder am Himmel?"
   ],
   "es": [
    "{t}. ¿Por dónde va?",
    "{t}: ¿por tierra, por el agua o por el cielo?"
   ]
  }
 },
 "harakatTuri": {
  "nom": {
   "uz": "Kim qanday harakatlanadi",
   "ru": "Кто как двигается",
   "en": "How do they move",
   "de": "Wie bewegen sie sich",
   "es": "¿Cómo se mueven?"
  },
  "kirish": {
   "uz": "Kimdir uchadi, kimdir suzadi, kimdir yuradi. Qani, kim qanday harakatlanadi?",
   "ru": "Кто-то летает, кто-то плавает, кто-то ходит. Как же двигается каждый?",
   "en": "Some fly, some swim, some walk. How does each one move?",
   "de": "Manche fliegen, manche schwimmen, manche laufen. Wie bewegt sich jedes Tier?",
   "es": "Unos vuelan, otros nadan, otros caminan. ¿Cómo se mueve cada uno?"
  },
  "raund": {
   "uz": [
    "{t}. Uchadimi, suzadimi yoki yuradimi?",
    "{t} qanday harakatlanadi?"
   ],
   "ru": [
    "{t}. Летает, плавает или ходит?",
    "Как двигается {t}?"
   ],
   "en": [
    "{t}. Does it fly, swim or walk?",
    "How does the {t} move?"
   ],
   "de": [
    "{t}. Fliegt, schwimmt oder läuft es?",
    "Wie bewegt sich {t}?"
   ],
   "es": [
    "{t}. ¿Vuela, nada o camina?",
    "¿Cómo se mueve {t}?"
   ]
  }
 },
 "yeyiladi": {
  "nom": {
   "uz": "Yeyiladimi?",
   "ru": "Можно ли съесть?",
   "en": "Can we eat it?",
   "de": "Kann man das essen?",
   "es": "¿Se puede comer?"
  },
  "kirish": {
   "uz": "Ba’zi narsalar yeyiladi, ba’zilari esa yo‘q. Og‘izga faqat ovqat solamiz!",
   "ru": "Некоторые вещи можно есть, а некоторые — нет. В рот кладём только еду!",
   "en": "Some things can be eaten, others can't. Only food goes in our mouth!",
   "de": "Manches kann man essen, anderes nicht. In den Mund kommt nur Essen!",
   "es": "Algunas cosas se comen y otras no. ¡En la boca solo ponemos comida!"
  },
  "raund": {
   "uz": [
    "{t}. Yeyiladimi?",
    "{t}ni yesa bo‘ladimi?"
   ],
   "ru": [
    "{t}. Это можно есть?",
    "Можно ли съесть: {t}?"
   ],
   "en": [
    "{t}. Can we eat it?",
    "Is the {t} something to eat?"
   ],
   "de": [
    "{t}. Kann man das essen?",
    "Ist {t} zum Essen?"
   ],
   "es": [
    "{t}. ¿Se puede comer?",
    "¿{t} es para comer?"
   ]
  }
 },
 "faslKiyim": {
  "nom": {
   "uz": "Fasl kiyimi",
   "ru": "Одежда по сезону",
   "en": "Clothes for the season",
   "de": "Kleidung für die Jahreszeit",
   "es": "Ropa para cada estación"
  },
  "kirish": {
   "uz": "Qishda issiq, yozda yengil kiyinamiz. Har bir kiyimni o‘z fasliga joyla!",
   "ru": "Зимой одеваемся тепло, летом — легко. Отправь каждую вещь в своё время года!",
   "en": "In winter we dress warmly, in summer lightly. Put each piece of clothing in its season!",
   "de": "Im Winter ziehen wir uns warm an, im Sommer leicht. Ordne jedes Kleidungsstück der Jahreszeit zu!",
   "es": "En invierno nos abrigamos y en verano vamos ligeros. ¡Pon cada prenda en su estación!"
  },
  "raund": {
   "uz": [
    "{t}. Qishdami yoki yozdami kiyamiz?",
    "{t}ni qachon kiyamiz?"
   ],
   "ru": [
    "{t}. Зимой или летом?",
    "Когда мы носим: {t}?"
   ],
   "en": [
    "{t}. Winter or summer?",
    "When do we wear the {t}?"
   ],
   "de": [
    "{t}. Winter oder Sommer?",
    "Wann tragen wir {t}?"
   ],
   "es": [
    "{t}. ¿En invierno o en verano?",
    "¿Cuándo llevamos {t}?"
   ]
  }
 },
 "faslMeva": {
  "nom": {
   "uz": "Fasl mevasi",
   "ru": "Плоды времён года",
   "en": "Fruits of the seasons",
   "de": "Früchte der Jahreszeiten",
   "es": "Frutas de cada estación"
  },
  "kirish": {
   "uz": "Har faslning o‘z mevasi bor. Qaysi meva qaysi faslda pishadi?",
   "ru": "У каждого времени года свои плоды. Что когда созревает?",
   "en": "Each season has its own fruits. When does each one ripen?",
   "de": "Jede Jahreszeit hat ihre Früchte. Wann wird was reif?",
   "es": "Cada estación tiene sus frutas. ¿Cuándo madura cada una?"
  },
  "raund": {
   "uz": [
    "{t}. Qaysi faslda pishadi?",
    "{t} qachon bo‘ladi?"
   ],
   "ru": [
    "{t}. Когда созревает?",
    "Когда бывает {t}?"
   ],
   "en": [
    "{t}. Which season is it from?",
    "When do we have the {t}?"
   ],
   "de": [
    "{t}. In welcher Jahreszeit?",
    "Wann gibt es {t}?"
   ],
   "es": [
    "{t}. ¿En qué estación madura?",
    "¿Cuándo hay {t}?"
   ]
  }
 },
 "onaBola": {
  "nom": {
   "uz": "Ona va bola",
   "ru": "Мама и малыш",
   "en": "Mother and baby",
   "de": "Mutter und Kind",
   "es": "Mamá y bebé"
  },
  "kirish": {
   "uz": "Har bir hayvonning bolasi bor. Onasiga bolasini top!",
   "ru": "У каждого животного есть малыш. Найди маме её малыша!",
   "en": "Every animal has a baby. Find each mother's baby!",
   "de": "Jedes Tier hat ein Junges. Finde zu jeder Mutter ihr Kind!",
   "es": "Cada animal tiene un bebé. ¡Encuentra el bebé de cada mamá!"
  },
  "raund": {
   "uz": [
    "{t}. Uning bolasi kim?",
    "{t}ning bolasini top!"
   ],
   "ru": [
    "{t}. Кто её малыш?",
    "Найди малыша: {t}!"
   ],
   "en": [
    "{t}. Who is its baby?",
    "Find the {t}'s baby!"
   ],
   "de": [
    "{t}. Wer ist ihr Junges?",
    "Finde das Junge: {t}!"
   ],
   "es": [
    "{t}. ¿Quién es su bebé?",
    "¡Encuentra el bebé: {t}!"
   ]
  }
 },
 "uyiQayerda": {
  "nom": {
   "uz": "Kim qayerda yashaydi",
   "ru": "Кто где живёт",
   "en": "Who lives where",
   "de": "Wer wohnt wo",
   "es": "¿Quién vive dónde?"
  },
  "kirish": {
   "uz": "Har kimning o‘z uyi bor: baliq suvda, qush inda. Qani, uyini top!",
   "ru": "У каждого свой дом: рыба — в воде, птица — в гнезде. Найди каждому дом!",
   "en": "Everyone has a home: a fish in water, a bird in a nest. Find each home!",
   "de": "Jeder hat ein Zuhause: der Fisch im Wasser, der Vogel im Nest. Finde jedes Zuhause!",
   "es": "Cada uno tiene su casa: el pez en el agua, el pájaro en el nido. ¡Encuentra cada casa!"
  },
  "raund": {
   "uz": [
    "{t} qayerda yashaydi?",
    "{t}ning uyini top!"
   ],
   "ru": [
    "Где живёт {t}?",
    "Найди дом: {t}!"
   ],
   "en": [
    "Where does the {t} live?",
    "Find the {t}'s home!"
   ],
   "de": [
    "Wo wohnt {t}?",
    "Finde das Zuhause: {t}!"
   ],
   "es": [
    "¿Dónde vive {t}?",
    "¡Encuentra la casa: {t}!"
   ]
  }
 },
 "kasbAsbob": {
  "nom": {
   "uz": "Kasb va asbob",
   "ru": "Профессия и инструмент",
   "en": "Jobs and tools",
   "de": "Berufe und Werkzeuge",
   "es": "Oficios y herramientas"
  },
  "kirish": {
   "uz": "Har bir kasb egasining o‘z asbobi bor. Kimga nima kerak?",
   "ru": "У каждой профессии свой инструмент. Кому что нужно?",
   "en": "Every job has its own tool. Who needs what?",
   "de": "Jeder Beruf hat sein Werkzeug. Wer braucht was?",
   "es": "Cada oficio tiene su herramienta. ¿Quién necesita qué?"
  },
  "raund": {
   "uz": [
    "{t}. Unga nima kerak?",
    "{t} nima bilan ishlaydi?"
   ],
   "ru": [
    "{t}. Что ему нужно?",
    "Чем работает {t}?"
   ],
   "en": [
    "{t}. What does this person need?",
    "What does the {t} work with?"
   ],
   "de": [
    "{t}. Was braucht diese Person?",
    "Womit arbeitet {t}?"
   ],
   "es": [
    "{t}. ¿Qué necesita?",
    "¿Con qué trabaja {t}?"
   ]
  }
 },
 "hayvonOvqat": {
  "nom": {
   "uz": "Hayvonni boq",
   "ru": "Накорми животное",
   "en": "Feed the animal",
   "de": "Füttere das Tier",
   "es": "Alimenta al animal"
  },
  "kirish": {
   "uz": "Hayvonlar och qoldi! Har biriga yaxshi ko‘rgan ovqatini ber.",
   "ru": "Животные проголодались! Дай каждому его любимую еду.",
   "en": "The animals are hungry! Give each one its favourite food.",
   "de": "Die Tiere haben Hunger! Gib jedem sein Lieblingsessen.",
   "es": "¡Los animales tienen hambre! Dale a cada uno su comida favorita."
  },
  "raund": {
   "uz": [
    "{t} nimani yaxshi ko‘radi?",
    "{t}ga nima beramiz?"
   ],
   "ru": [
    "Что любит {t}?",
    "Чем угостим: {t}?"
   ],
   "en": [
    "What does the {t} like to eat?",
    "What shall we give the {t}?"
   ],
   "de": [
    "Was frisst {t} gern?",
    "Was geben wir {t}?"
   ],
   "es": [
    "¿Qué le gusta comer a {t}?",
    "¿Qué le damos a {t}?"
   ]
  }
 },
 "nimaBilan": {
  "nom": {
   "uz": "Nima nima bilan",
   "ru": "Что с чем",
   "en": "What goes together",
   "de": "Was gehört zusammen",
   "es": "¿Qué va con qué?"
  },
  "kirish": {
   "uz": "Ba’zi narsalar doim birga ishlatiladi: qalam va daftar, kalit va qulf. Juftini top!",
   "ru": "Некоторые вещи всегда вместе: карандаш и тетрадь, ключ и замок. Найди пару!",
   "en": "Some things always go together: a pencil and a notebook, a key and a lock. Find the pair!",
   "de": "Manche Dinge gehören zusammen: Bleistift und Heft, Schlüssel und Schloss. Finde das Paar!",
   "es": "Algunas cosas van siempre juntas: el lápiz y el cuaderno, la llave y el candado. ¡Encuentra la pareja!"
  },
  "raund": {
   "uz": [
    "{t}. U nima bilan birga ishlatiladi?",
    "{t}ning juftini top!"
   ],
   "ru": [
    "{t}. С чем это используют?",
    "Найди пару: {t}!"
   ],
   "en": [
    "{t}. What does it go with?",
    "Find the partner of the {t}!"
   ],
   "de": [
    "{t}. Womit gehört es zusammen?",
    "Finde das Paar: {t}!"
   ],
   "es": [
    "{t}. ¿Con qué se usa?",
    "¡Encuentra la pareja: {t}!"
   ]
  }
 },
 "sezgi": {
  "nom": {
   "uz": "Besh sezgi",
   "ru": "Пять чувств",
   "en": "Five senses",
   "de": "Fünf Sinne",
   "es": "Cinco sentidos"
  },
  "kirish": {
   "uz": "Ko‘z ko‘radi, quloq eshitadi, burun hidlaydi, til ta’mini biladi, qo‘l sezadi. Qani, top!",
   "ru": "Глаза видят, уши слышат, нос чувствует запах, язык — вкус, руки трогают. Найди!",
   "en": "Eyes see, ears hear, the nose smells, the tongue tastes, hands feel. Let's find out!",
   "de": "Augen sehen, Ohren hören, die Nase riecht, die Zunge schmeckt, Hände fühlen. Finde es heraus!",
   "es": "Los ojos ven, los oídos oyen, la nariz huele, la lengua saborea y las manos tocan. ¡Descúbrelo!"
  },
  "raund": {
   "uz": [
    "{t} bilan nimani sezamiz?",
    "{t}. Unga nima mos?"
   ],
   "ru": [
    "Что мы чувствуем — {t}?",
    "{t}. Что подходит?"
   ],
   "en": [
    "What do we sense with the {t}?",
    "The {t}. What goes with it?"
   ],
   "de": [
    "Was spüren wir mit {t}?",
    "{t}. Was passt dazu?"
   ],
   "es": [
    "¿Qué sentimos con {t}?",
    "{t}. ¿Qué le corresponde?"
   ]
  }
 }
});

// REV349: tartibga qo'yish o'yinlari gaplari (avval/keyin — «Hikoya tartibi»dan)
Object.assign(OYIN_MATN, {
 "kapalak": {
  "nom": {
   "uz": "Kapalak hayoti",
   "ru": "Жизнь бабочки",
   "en": "A butterfly's life",
   "de": "Das Leben eines Schmetterlings",
   "es": "La vida de una mariposa"
  },
  "kirish": {
   "uz": "Kapalak avval tuxum bo‘ladi, keyin qurtcha, keyin chiroyli kapalak! Tartib bilan joyla.",
   "ru": "Сначала бабочка — яйцо, потом гусеница, а потом красивая бабочка! Разложи по порядку.",
   "en": "First a butterfly is an egg, then a caterpillar, then a beautiful butterfly! Put them in order.",
   "de": "Zuerst ist ein Schmetterling ein Ei, dann eine Raupe, dann ein schöner Schmetterling! Bring sie in die richtige Reihenfolge.",
   "es": "Primero la mariposa es un huevo, luego una oruga y después una mariposa preciosa. ¡Ponlos en orden!"
  }
 },
 "gulOstir": {
  "nom": {
   "uz": "Gul o‘stiramiz",
   "ru": "Выращиваем цветок",
   "en": "Let's grow a flower",
   "de": "Wir ziehen eine Blume",
   "es": "Cultivamos una flor"
  },
  "kirish": {
   "uz": "Urug‘ni ekamiz, suv beramiz — u asta-sekin gulga aylanadi. Qani, tartib bilan joyla!",
   "ru": "Сажаем семечко, поливаем — и оно понемногу становится цветком. Разложи по порядку!",
   "en": "We plant a seed and water it — little by little it becomes a flower. Put it in order!",
   "de": "Wir pflanzen einen Samen und gießen ihn — langsam wird er zur Blume. Bring es in die Reihenfolge!",
   "es": "Plantamos una semilla y la regamos: poco a poco se convierte en flor. ¡Ponlo en orden!"
  }
 },
 "qayerdan": {
  "nom": { "uz": "Qayerdan keladi?", "ru": "Откуда это?", "en": "Where does it come from?", "de": "Woher kommt das?", "es": "¿De dónde viene?" },
  "kirish": { "uz": "Non va sut dasturxonga qanday yetib keladi? Rasmlarni tartib bilan joyla!", "ru": "Как хлеб и молоко попадают к нам на стол? Разложи картинки по порядку!", "en": "How do bread and milk get to our table? Put the pictures in order!", "de": "Wie kommen Brot und Milch auf unseren Tisch? Ordne die Bilder!", "es": "¿Cómo llegan el pan y la leche a la mesa? ¡Ordena las imágenes!" }
 },
 "kunTartibi": {
  "nom": {
   "uz": "Kun tartibi",
   "ru": "Распорядок дня",
   "en": "My day",
   "de": "Mein Tag",
   "es": "Mi día"
  },
  "kirish": {
   "uz": "Kunimiz tartib bilan o‘tadi: ertalab uyg‘onamiz, kechqurun uxlaymiz. Qani, tartibni tuz!",
   "ru": "Наш день идёт по порядку: утром просыпаемся, вечером ложимся спать. Составь порядок!",
   "en": "Our day goes in order: we wake up in the morning and sleep at night. Put the day in order!",
   "de": "Unser Tag hat eine Reihenfolge: morgens wachen wir auf, abends schlafen wir. Ordne den Tag!",
   "es": "Nuestro día sigue un orden: por la mañana nos despertamos y por la noche dormimos. ¡Ordena el día!"
  }
 },
 "qolYuvish": {
  "nom": {
   "uz": "Qo‘l yuvamiz",
   "ru": "Моем руки",
   "en": "Washing hands",
   "de": "Hände waschen",
   "es": "Lavarse las manos"
  },
  "kirish": {
   "uz": "Qo‘lni to‘g‘ri yuvsak, mikroblar ketadi. Avval nima, keyin nima? Tartib bilan joyla!",
   "ru": "Если мыть руки правильно, микробы уходят. Что сначала, что потом? Разложи по порядку!",
   "en": "When we wash our hands the right way, germs go away. What comes first, what comes next?",
   "de": "Wenn wir die Hände richtig waschen, verschwinden die Keime. Was kommt zuerst, was danach?",
   "es": "Si nos lavamos bien las manos, los microbios se van. ¿Qué va primero y qué después?"
  }
 },
 "suvSayohati": {
  "nom": {
   "uz": "Suv sayohati",
   "ru": "Путешествие капельки",
   "en": "The water's journey",
   "de": "Die Reise des Wassers",
   "es": "El viaje del agua"
  },
  "kirish": {
   "uz": "Tomchi bulutdan yomg‘ir bo‘lib tushadi, daryoga oqadi, keyin dengizga boradi. Yo‘lini tuz!",
   "ru": "Капелька падает из облака дождём, течёт в реку, а потом в море. Составь её путь!",
   "en": "A drop falls from a cloud as rain, flows into a river and then to the sea. Show its journey!",
   "de": "Ein Tropfen fällt als Regen aus der Wolke, fließt in einen Fluss und dann ins Meer. Zeig seinen Weg!",
   "es": "Una gota cae de la nube como lluvia, va al río y luego al mar. ¡Muestra su viaje!"
  }
 },
 "fasllar": {
  "nom": {
   "uz": "Fasllar g‘ildiragi",
   "ru": "Круг времён года",
   "en": "The wheel of seasons",
   "de": "Das Jahreszeitenrad",
   "es": "La rueda de las estaciones"
  },
  "kirish": {
   "uz": "Fasllar navbat bilan keladi: bahordan keyin yoz, keyin kuz, keyin qish. Tartib bilan joyla!",
   "ru": "Времена года идут по кругу: за весной лето, потом осень, потом зима. Разложи по порядку!",
   "en": "The seasons come one after another: spring, then summer, then autumn, then winter. Put them in order!",
   "de": "Die Jahreszeiten kommen nacheinander: Frühling, Sommer, Herbst, Winter. Bring sie in die Reihenfolge!",
   "es": "Las estaciones llegan una tras otra: primavera, verano, otoño e invierno. ¡Ponlas en orden!"
  }
 },
 "tishTozalash": {
  "nom": {
   "uz": "Tishimni tozalayman",
   "ru": "Чищу зубы",
   "en": "Brushing teeth",
   "de": "Zähne putzen",
   "es": "Me lavo los dientes"
  },
  "kirish": {
   "uz": "Tishlar ertalab va kechqurun tozalanadi. Avval nima qilamiz? Tartib bilan joyla!",
   "ru": "Зубы чистим утром и вечером. Что делаем сначала? Разложи по порядку!",
   "en": "We brush our teeth in the morning and at night. What do we do first? Put it in order!",
   "de": "Wir putzen morgens und abends die Zähne. Was machen wir zuerst? Bring es in die Reihenfolge!",
   "es": "Nos lavamos los dientes por la mañana y por la noche. ¿Qué hacemos primero? ¡Ponlo en orden!"
  }
 },
 "osish": {
  "nom": {
   "uz": "Kim qanday o‘sadi?",
   "ru": "Кто как растёт?",
   "en": "How do things grow?",
   "de": "Wie wächst was?",
   "es": "¿Cómo crece cada uno?"
  },
  "kirish": {
   "uz": "Hamma narsa o‘sadi: odam ham, jo‘ja ham, daraxt ham. Har safar boshqasini ko‘rsataman — avval nima bo‘lganini, keyin nima bo‘lishini tartib bilan joyla!",
   "ru": "Всё растёт: и человек, и цыплёнок, и дерево. Каждый раз покажу другое — разложи по порядку, что было сначала и что потом!",
   "en": "Everything grows: people, chicks and trees. Each time I'll show something new — put what comes first and what comes next in order!",
   "de": "Alles wächst: Menschen, Küken und Bäume. Jedes Mal zeige ich etwas anderes — bring es in die richtige Reihenfolge!",
   "es": "Todo crece: personas, pollitos y árboles. Cada vez te mostraré algo distinto — ¡ponlo en orden!"
  }
 }
});

// REV351: eshitish o'yinlari gaplari
Object.assign(OYIN_MATN, {
 "hayvonOvoz": {
  "nom": {
   "uz": "Kim ovoz beryapti?",
   "ru": "Кто так говорит?",
   "en": "Who makes this sound?",
   "de": "Wer macht dieses Geräusch?",
   "es": "¿Quién hace este sonido?"
  },
  "kirish": {
   "uz": "Quloqlaringni ding qil! Men hayvonning ovozini chiqaraman, sen uni top.",
   "ru": "Навостри ушки! Я издам звук животного, а ты найди его.",
   "en": "Listen carefully! I make an animal sound, and you find the animal.",
   "de": "Hör gut zu! Ich mache ein Tiergeräusch, und du findest das Tier.",
   "es": "¡Escucha bien! Hago el sonido de un animal y tú lo encuentras."
  },
  "raund": {
   "uz": [
    "{t} Kim shunday deydi?",
    "{t} Bu kimning ovozi?"
   ],
   "ru": [
    "{t} Кто так говорит?",
    "{t} Чей это голос?"
   ],
   "en": [
    "{t} Who says that?",
    "{t} Whose sound is it?"
   ],
   "de": [
    "{t} Wer sagt das?",
    "{t} Wessen Geräusch ist das?"
   ],
   "es": [
    "{t} ¿Quién dice eso?",
    "{t} ¿De quién es este sonido?"
   ]
  }
 },
 "transportOvoz": {
  "nom": {
   "uz": "Qaysi transport?",
   "ru": "Какой транспорт?",
   "en": "Which vehicle?",
   "de": "Welches Fahrzeug?",
   "es": "¿Qué transporte?"
  },
  "kirish": {
   "uz": "Ko‘chada qanday ovozlar bor? Tingla va topib bos!",
   "ru": "Какие звуки на улице? Послушай и найди!",
   "en": "What sounds are on the street? Listen and find it!",
   "de": "Welche Geräusche hört man auf der Straße? Hör zu und finde es!",
   "es": "¿Qué sonidos hay en la calle? ¡Escucha y encuéntralo!"
  },
  "raund": {
   "uz": [
    "{t} Bu qaysi transport?",
    "{t} Kim shunday ovoz chiqaradi?"
   ],
   "ru": [
    "{t} Какой это транспорт?",
    "{t} Кто так гудит?"
   ],
   "en": [
    "{t} Which vehicle is it?",
    "{t} What makes this sound?"
   ],
   "de": [
    "{t} Welches Fahrzeug ist das?",
    "{t} Was macht dieses Geräusch?"
   ],
   "es": [
    "{t} ¿Qué transporte es?",
    "{t} ¿Qué hace este sonido?"
   ]
  }
 },
 "faslOvoz": {
  "nom": {
   "uz": "Fasl ovozlari",
   "ru": "Звуки времён года",
   "en": "Sounds of the seasons",
   "de": "Klänge der Jahreszeiten",
   "es": "Sonidos de las estaciones"
  },
  "kirish": {
   "uz": "Ko‘zingni yum va tingla. Men aytgan manzara qaysi faslda bo‘ladi?",
   "ru": "Закрой глазки и послушай. В какое время года так бывает?",
   "en": "Close your eyes and listen. Which season is it?",
   "de": "Schließ die Augen und hör zu. Welche Jahreszeit ist das?",
   "es": "Cierra los ojos y escucha. ¿Qué estación es?"
  },
  "raund": {
   "uz": [
    "{t} Bu qaysi fasl?",
    "{t} Qachon shunday bo‘ladi?"
   ],
   "ru": [
    "{t} Какое это время года?",
    "{t} Когда так бывает?"
   ],
   "en": [
    "{t} Which season is it?",
    "{t} When does this happen?"
   ],
   "de": [
    "{t} Welche Jahreszeit ist das?",
    "{t} Wann passiert das?"
   ],
   "es": [
    "{t} ¿Qué estación es?",
    "{t} ¿Cuándo pasa esto?"
   ]
  }
 },
 "birinchiHarf": {
  "nom": {
   "uz": "Birinchi harf",
   "ru": "Первая буква",
   "en": "First letter",
   "de": "Erster Buchstabe",
   "es": "Primera letra"
  },
  "kirish": {
   "uz": "Har so‘z bir harf bilan boshlanadi. Rasmlarning nomini ichingda ayt va toping!",
   "ru": "Каждое слово начинается с буквы. Назови картинки про себя и найди!",
   "en": "Every word begins with a letter. Say the picture names to yourself and find it!",
   "de": "Jedes Wort beginnt mit einem Buchstaben. Sag die Bildnamen leise und finde es!",
   "es": "Cada palabra empieza por una letra. ¡Di los nombres en voz baja y encuéntrala!"
  },
  "raund": {
   "uz": [
    "Qaysi so‘z «{h}» harfi bilan boshlanadi?",
    "«{h}» harfidan boshlanadigan rasmni top!"
   ],
   "ru": [
    "Какое слово начинается на букву «{h}»?",
    "Найди картинку на букву «{h}»!"
   ],
   "en": [
    "Which word begins with the letter “{h}”?",
    "Find the picture that starts with “{h}”!"
   ],
   "de": [
    "Welches Wort beginnt mit dem Buchstaben „{h}“?",
    "Finde das Bild mit „{h}“ am Anfang!"
   ],
   "es": [
    "¿Qué palabra empieza por la letra «{h}»?",
    "¡Encuentra el dibujo que empieza por «{h}»!"
   ]
  }
 },
 "bogin": {
  "nom": {
   "uz": "Bo‘g‘in qarsagi",
   "ru": "Хлопаем слоги",
   "en": "Clap the syllables",
   "de": "Silben klatschen",
   "es": "Palmas por sílabas"
  },
  "kirish": {
   "uz": "So‘zni bo‘lib aytamiz va har bo‘g‘inga qarsak chalamiz: mu-shuk — ikki qarsak!",
   "ru": "Говорим слово по частям и хлопаем на каждый слог: ко-шка — два хлопка!",
   "en": "We say a word in parts and clap for each one.",
   "de": "Wir sprechen das Wort in Silben und klatschen bei jeder.",
   "es": "Decimos la palabra por partes y damos una palmada por cada sílaba."
  },
  "raund": {
   "uz": [
    "{t}. Qarsak chalib sana: nechta bo‘g‘in?",
    "{t}. Bu so‘zda nechta bo‘g‘in bor?"
   ],
   "ru": [
    "{t}. Похлопай и посчитай: сколько слогов?",
    "{t}. Сколько слогов в этом слове?"
   ],
   "en": [
    "{t}. Clap and count: how many parts?",
    "{t}. How many syllables?"
   ],
   "de": [
    "{t}. Klatsch und zähl: wie viele Silben?",
    "{t}. Wie viele Silben hat das Wort?"
   ],
   "es": [
    "{t}. Da palmadas y cuenta: ¿cuántas sílabas?",
    "{t}. ¿Cuántas sílabas tiene?"
   ]
  }
 }
});

// REV370: «Ayt va och» — mazmunli hikoya: eshik ortida kimdir yashiringan, nomi bilan chaqirilsa chiqib keladi
Object.assign(OYIN_MATN.aytOch, {
  kirish: { uz: "Eshik ortida kimdir yashirinib oldi! Uni nomi bilan chaqirsang, eshikni ochib chiqib keladi.", ru: "За дверью кто-то спрятался! Позови его по имени — он откроет дверь и выйдет.",
    en: "Someone is hiding behind the door! Call them by name and they will open the door and come out.", de: "Hinter der Tür hat sich jemand versteckt! Ruf ihn beim Namen, dann öffnet er die Tür und kommt heraus.",
    es: "¡Alguien se escondió detrás de la puerta! Llámalo por su nombre y abrirá la puerta y saldrá." },
});
// REV370: «Qayerda?» — so'z aytiladi, bola mos rasmni (quti va narsa) topadi
Object.assign(OYIN_MATN.joylashuv, {
  kirish: { uz: "Qayerda? Men aytaman, sen o‘sha rasmni topasan: qutining ustida, ostida, ichida, yonida…", ru: "Где? Я скажу, а ты найди картинку: на коробке, под ней, внутри, рядом…",
    en: "Where? I'll say it and you find the picture: on, under, in or next to the box…", de: "Wo? Ich sage es, du findest das Bild: auf, unter, in oder neben der Kiste…",
    es: "¿Dónde? Yo lo digo y tú encuentras el dibujo: encima, debajo, dentro o al lado de la caja…" },
  raundJoy: { uz: ["{t} qutining {j}. Qaysi rasm?", "Qaysi rasmda {t} qutining {j}?"], ru: ["{t} — {j}. Какая картинка?", "Где {t} — {j}? Найди картинку!"],
    en: ["{t} — {j}. Which picture?", "Where is the {t} {j}? Find the picture!"], de: ["{t} — {j}. Welches Bild?", "Wo ist {t} {j}? Finde das Bild!"],
    es: ["{t} — {j}. ¿Qué dibujo?", "¿Dónde está {t} {j}? ¡Encuentra el dibujo!"] },
});
// REV370: tarozi — bola tanlaydi, tarozi to'g'riligini ko'rsatadi
if (OYIN_MATN.tarozi) Object.assign(OYIN_MATN.tarozi, {
  raund: { uz: ["Qaysi biri og‘irroq? Bos — tarozi ko‘rsatadi!", "Taroziga qo‘yamiz. Qaysi biri og‘ir deb o‘ylaysan?"], ru: ["Что тяжелее? Нажми — весы покажут!", "Положим на весы. Как думаешь, что тяжелее?"],
    en: ["Which one is heavier? Tap it — the scale will show!", "Let's put them on the scale. Which is heavier?"], de: ["Was ist schwerer? Tipp — die Waage zeigt es!", "Wir legen sie auf die Waage. Was ist schwerer?"],
    es: ["¿Cuál pesa más? ¡Tócalo y la balanza lo mostrará!", "Los ponemos en la balanza. ¿Cuál crees que pesa más?"] },
  raundYengil: { uz: ["Endi teskarisi: qaysi biri yengilroq?"], ru: ["А теперь наоборот: что легче?"], en: ["Now the opposite: which one is lighter?"], de: ["Jetzt umgekehrt: was ist leichter?"], es: ["Ahora al revés: ¿cuál pesa menos?"] },
});
// REV359: sirli quti
OYIN_MATN.sirliQuti = {
  nom: { uz: "Sirli quti", ru: "Волшебная коробка", en: "Mystery box", de: "Geheimnisvolle Kiste", es: "Caja misteriosa" },
  kirish: { uz: "Kabu sirli quti olib keldi! Ichida kim bor? Diqqat bilan qara va tingla.", ru: "Кабу принёс волшебную коробку! Кто внутри? Смотри и слушай внимательно.",
    en: "Kabu brought a mystery box! Who is inside? Look and listen carefully.", de: "Kabu hat eine geheimnisvolle Kiste mitgebracht! Wer ist drin? Schau und hör gut zu.",
    es: "¡Kabu trajo una caja misteriosa! ¿Quién está dentro? Mira y escucha con atención." },
  raundOvoz: { uz: ["Qutidan ovoz kelyapti: «{o}» Qutida kim bor?", "Tingla: «{o}» Bu kim ekan?"], ru: ["Из коробки слышно: «{o}» Кто в коробке?", "Послушай: «{o}» Кто это?"],
    en: ["A sound from the box: “{o}” Who is inside?", "Listen: “{o}” Who is it?"], de: ["Aus der Kiste kommt: „{o}“ Wer ist drin?", "Hör zu: „{o}“ Wer ist das?"],
    es: ["De la caja sale: «{o}» ¿Quién está dentro?", "Escucha: «{o}» ¿Quién es?"] },
  raundSoz: { uz: ["Qutida — {t}. Qaysi rasm?", "Qutidagi narsaning nomi — {t}. Topib bos!"], ru: ["В коробке — {t}. Какая картинка?", "В коробке {t}. Найди!"],
    en: ["In the box is {t}. Which picture?", "The box has {t} inside. Find it!"], de: ["In der Kiste ist {t}. Welches Bild?", "In der Kiste ist {t}. Finde es!"],
    es: ["En la caja hay {t}. ¿Qué dibujo es?", "Dentro está {t}. ¡Encuéntralo!"] },
  raund: { uz: ["Qutidan nimadir ko‘rinib turibdi. Bu nima?", "Qara, qutidan bir uchi chiqib turibdi. Qaysi biri?"], ru: ["Из коробки что-то выглядывает. Что это?", "Смотри, что-то торчит из коробки. Что это?"],
    en: ["Something is peeking out of the box. What is it?", "Look, something is sticking out. Which one?"], de: ["Etwas schaut aus der Kiste. Was ist das?", "Schau, da guckt etwas heraus. Welches?"],
    es: ["Algo asoma de la caja. ¿Qué es?", "Mira, algo sale de la caja. ¿Cuál es?"] },
};

// REV359: «Ayt va och» — hikoya, avval nom, keyin bola aytadi; 2 marta ayta olmasa — bosib ochadi
Object.assign(OYIN_MATN.aytOch, {
  kirish: { uz: "Bu sehrli eshik! U ichidagi narsaning nomini eshitsa, o‘zi ochiladi.", ru: "Это волшебная дверь! Она открывается, если услышит имя того, что внутри.",
    en: "This is a magic door! It opens when it hears the name of what is inside.", de: "Das ist eine Zaubertür! Sie geht auf, wenn sie den Namen von dem hört, was drin ist.",
    es: "¡Es una puerta mágica! Se abre cuando oye el nombre de lo que hay dentro." },
  bosib: { uz: "Hechqisi yo‘q! Qaysi biri {t}? Bos — eshik ochiladi.", ru: "Ничего страшного! Где {t}? Нажми — и дверь откроется.", en: "That's okay! Which one is {t}? Tap it and the door opens.",
    de: "Macht nichts! Welches ist {t}? Tipp darauf, dann geht die Tür auf.", es: "¡No pasa nada! ¿Cuál es {t}? Tócalo y la puerta se abre." },
  yana: { uz: "Eshik eshitmadi. Yana bir marta, baland ovozda: {t}", ru: "Дверь не услышала. Ещё раз, погромче: {t}", en: "The door didn't hear. Once more, loudly: {t}",
    de: "Die Tür hat es nicht gehört. Noch einmal, laut: {t}", es: "La puerta no lo oyó. Otra vez, más fuerte: {t}" },
});
OYIN_MATN.aytOch.raund = { uz: ["Bu — {t}. Qani, sen ham ayt: «{t}!»", "Qara, bu {t}! Baland ovozda takrorla: {t}!", "Bu nima? {t}! Endi sen ayt: {t}!"],   // REV418: eshiksiz
  ru: ["Это — {t}. Скажи и ты: «{t}!»", "Смотри, это {t}! Повтори громко: {t}!", "Что это? {t}! Теперь скажи ты: {t}!"],
  en: ["This is {t}. Now you say it: “{t}!”", "Look, it's {t}! Say it loudly: {t}!", "What is it? {t}! Now you say: {t}!"],
  de: ["Das ist {t}. Sag du auch: „{t}!“", "Schau, das ist {t}! Sag es laut: {t}!", "Was ist das? {t}! Jetzt sag du: {t}!"],
  es: ["Esto es {t}. Dilo tú también: «¡{t}!»", "¡Mira, es {t}! Dilo en voz alta: ¡{t}!", "¿Qué es? ¡{t}! Ahora dilo tú: ¡{t}!"] };

// REV347: asosiy o'yinlarning raund gaplari — har raundda boshqa variant (3 tadan, 5 tilda)
const RAUND_VARIANTLAR = {
 "eshitBos": {
  "uz": [
   "{t}! Qani, qayerda? Bos!",
   "Men {t} dedim. Uni top!",
   "Qani, {t} qaysi biri?"
  ],
  "ru": [
   "{t}! Где? Нажми!",
   "Я сказал {t}. Найди!",
   "Ну-ка, где {t}?"
  ],
  "en": [
   "{t}! Where is it? Tap it!",
   "I said {t}. Find it!",
   "Which one is {t}?"
  ],
  "de": [
   "{t}! Wo ist es? Tipp drauf!",
   "Ich habe {t} gesagt. Finde es!",
   "Welches ist {t}?"
  ],
  "es": [
   "{t}. ¿Dónde está? ¡Tócalo!",
   "Dije {t}. ¡Encuéntralo!",
   "¿Cuál es {t}?"
  ]
 },
 "aytOch": {
  "uz": [
   "{t}. Endi sen ayt!",
   "Eshik kalit so‘zni kutyapti: {t}. Ayt!",
   "Baland ovozda ayt: {t}!"
  ],
  "ru": [
   "{t}. Теперь скажи ты!",
   "Дверь ждёт слово: {t}. Скажи!",
   "Скажи громко: {t}!"
  ],
  "en": [
   "{t}. Now you say it!",
   "The door is waiting for the word: {t}. Say it!",
   "Say it loudly: {t}!"
  ],
  "de": [
   "{t}. Jetzt sagst du es!",
   "Die Tür wartet auf das Wort: {t}. Sag es!",
   "Sag es laut: {t}!"
  ],
  "es": [
   "{t}. ¡Ahora dilo tú!",
   "La puerta espera la palabra: {t}. ¡Dila!",
   "Dilo en voz alta: {t}!"
  ]
 },
 "oxshash": {
  "uz": [
   "{t}. Xuddi shunisini top!",
   "{t}. Egizagini top!",
   "Qani, {t} ning juftini bos!"
  ],
  "ru": [
   "{t}. Найди такую же!",
   "{t}. Найди близнеца!",
   "Ну-ка, нажми пару для {t}!"
  ],
  "en": [
   "{t}. Find the same one!",
   "{t}. Find its twin!",
   "Tap the match for {t}!"
  ],
  "de": [
   "{t}. Finde das gleiche!",
   "{t}. Finde den Zwilling!",
   "Tipp das Paar zu {t}!"
  ],
  "es": [
   "{t}. ¡Encuentra el mismo!",
   "{t}. ¡Encuentra su gemelo!",
   "¡Toca la pareja de {t}!"
  ]
 },
 "juft": {
  "uz": [
   "Kartalarni och!",
   "Ikkita karta och — bir xilmi?",
   "Qani, juftlarni eslab qol!"
  ],
  "ru": [
   "Открывай карточки!",
   "Открой две карточки — одинаковые?",
   "Ну-ка, запомни пары!"
  ],
  "en": [
   "Open the cards!",
   "Open two cards — are they the same?",
   "Remember the pairs!"
  ],
  "de": [
   "Deck die Karten auf!",
   "Deck zwei Karten auf — sind sie gleich?",
   "Merk dir die Paare!"
  ],
  "es": [
   "¡Abre las cartas!",
   "Abre dos cartas: ¿son iguales?",
   "¡Recuerda las parejas!"
  ]
 },
 "yashirin": {
  "uz": [
   "Qara va eslab qol!",
   "Hammasiga yaxshilab qara — birozdan keyin bittasi yashirinadi!",
   "Eslab qol: kimlar bor?"
  ],
  "ru": [
   "Смотри и запоминай!",
   "Посмотри на всех — скоро кто-то спрячется!",
   "Запомни: кто здесь?"
  ],
  "en": [
   "Look and remember!",
   "Look at them all — soon one will hide!",
   "Remember: who is here?"
  ],
  "de": [
   "Schau und merk es dir!",
   "Schau dir alle an — gleich versteckt sich einer!",
   "Merk dir: wer ist da?"
  ],
  "es": [
   "¡Mira y recuerda!",
   "Míralos a todos: ¡pronto uno se esconderá!",
   "Recuerda: ¿quién está aquí?"
  ]
 },
 "ortiqcha": {
  "uz": [
   "Qaysi biri boshqacha?",
   "Bittasi bu guruhga kirmaydi. Qaysi?",
   "Qaysi biri ortiqcha? Top!"
  ],
  "ru": [
   "Что здесь лишнее?",
   "Одна картинка не подходит. Какая?",
   "Что лишнее? Найди!"
  ],
  "en": [
   "Which one is different?",
   "One doesn't belong here. Which one?",
   "Which is the odd one out?"
  ],
  "de": [
   "Welches ist anders?",
   "Eines passt nicht dazu. Welches?",
   "Was passt nicht? Finde es!"
  ],
  "es": [
   "¿Cuál es diferente?",
   "Uno no encaja aquí. ¿Cuál?",
   "¿Cuál sobra? ¡Encuéntralo!"
  ]
 },
 "ketmaKet": {
  "uz": [
   "{q}… Keyingisi qaysi?",
   "{q}… Endi nima keladi?",
   "Tingla: {q}… Davom ettir!"
  ],
  "ru": [
   "{q}… Что дальше?",
   "{q}… Что будет потом?",
   "Послушай: {q}… Продолжи!"
  ],
  "en": [
   "{q}… What comes next?",
   "{q}… What is next?",
   "Listen: {q}… Keep going!"
  ],
  "de": [
   "{q}… Was kommt als Nächstes?",
   "{q}… Was folgt jetzt?",
   "Hör zu: {q}… Mach weiter!"
  ],
  "es": [
   "{q}… ¿Qué sigue?",
   "{q}… ¿Qué viene ahora?",
   "Escucha: {q}… ¡Continúa!"
  ]
 },
 "savat": {
  "uz": [
   "Savatga {t} sol. {n} ta kerak!",
   "Kabuga {n} ta {t} kerak. Savatga sol!",
   "Qani, {n} ta {t}ni savatga ter!"
  ],
  "ru": [
   "Положи в корзину {t}. Нужно {n}!",
   "Кабу нужно {n} — {t}. Клади в корзину!",
   "Ну-ка, собери {n} — {t}!"
  ],
  "en": [
   "Put {t} in the basket. We need {n}!",
   "Kabu needs {n} — {t}. Into the basket!",
   "Collect {n} — {t}!"
  ],
  "de": [
   "Leg {t} in den Korb. Wir brauchen {n}!",
   "Kabu braucht {n} — {t}. Ab in den Korb!",
   "Sammle {n} — {t}!"
  ],
  "es": [
   "Pon {t} en la cesta. ¡Necesitamos {n}!",
   "Kabu necesita {n}: {t}. ¡A la cesta!",
   "¡Recoge {n}: {t}!"
  ]
 },
 "sana": {
  "uz": [
   "{t}. Har birini bos!",
   "{t}. Birma-bir bosib sana!",
   "Qani, {t} nechta ekan? Bosib sana!"
  ],
  "ru": [
   "{t}. Нажми на каждый!",
   "{t}. Считай по одному!",
   "Ну-ка, сколько тут? Нажимай и считай!"
  ],
  "en": [
   "{t}. Tap each one!",
   "{t}. Count them one by one!",
   "How many are there? Tap and count!"
  ],
  "de": [
   "{t}. Tipp jedes an!",
   "{t}. Zähl eins nach dem anderen!",
   "Wie viele sind es? Tipp und zähl!"
  ],
  "es": [
   "{t}. ¡Toca cada uno!",
   "{t}. ¡Cuéntalos uno por uno!",
   "¿Cuántos hay? ¡Toca y cuenta!"
  ]
 },
 "qaysiKop": {
  "uz": [
   "Qayerda ko‘p?",
   "Qaysi guruh kattaroq?",
   "Ko‘zing bilan solishtir: qayerda ko‘proq?"
  ],
  "ru": [
   "Где больше?",
   "Какая группа больше?",
   "Сравни глазками: где больше?"
  ],
  "en": [
   "Where are there more?",
   "Which group is bigger?",
   "Compare with your eyes: where are more?"
  ],
  "de": [
   "Wo sind mehr?",
   "Welche Gruppe ist größer?",
   "Vergleich mit den Augen: wo sind mehr?"
  ],
  "es": [
   "¿Dónde hay más?",
   "¿Qué grupo es mayor?",
   "Compara con los ojos: ¿dónde hay más?"
  ]
 },
 "yoqolganSon": {
  "uz": [
   "{q}. Qaysi son yo‘q?",
   "{q}. Qochib ketgan sonni top!",
   "Sonlar qatori: {q}. Kim yo‘q?"
  ],
  "ru": [
   "{q}. Какого числа нет?",
   "{q}. Найди убежавшее число!",
   "Ряд чисел: {q}. Кого нет?"
  ],
  "en": [
   "{q}. Which number is missing?",
   "{q}. Find the runaway number!",
   "Number line: {q}. Who is missing?"
  ],
  "de": [
   "{q}. Welche Zahl fehlt?",
   "{q}. Finde die weggelaufene Zahl!",
   "Zahlenreihe: {q}. Wer fehlt?"
  ],
  "es": [
   "{q}. ¿Qué número falta?",
   "{q}. ¡Encuentra el número que se escapó!",
   "Fila de números: {q}. ¿Quién falta?"
  ]
 },
 "kabuXato": {
  "uz": [
   "Qaysi juft xato? Bos!",
   "Kabu qayerda adashdi? Top!",
   "Xatoni top va Kabuga yordam ber!"
  ],
  "ru": [
   "Какая пара неправильная? Нажми!",
   "Где Кабу ошибся? Найди!",
   "Найди ошибку и помоги Кабу!"
  ],
  "en": [
   "Which pair is wrong? Tap it!",
   "Where did Kabu make a mistake? Find it!",
   "Find the mistake and help Kabu!"
  ],
  "de": [
   "Welches Paar ist falsch? Tipp drauf!",
   "Wo hat sich Kabu geirrt? Finde es!",
   "Finde den Fehler und hilf Kabu!"
  ],
  "es": [
   "¿Qué pareja está mal? ¡Tócala!",
   "¿Dónde se equivocó Kabu? ¡Encuéntralo!",
   "¡Encuentra el error y ayuda a Kabu!"
  ]
 },
 "haYoq": {
  "uz": [
   "Bu — {t}. To‘g‘rimi?",
   "Kabu aytyapti: bu — {t}. Rostmi?",
   "{t}? Ha yoki yo‘q?"
  ],
  "ru": [
   "Это — {t}. Правильно?",
   "Кабу говорит: это {t}. Правда?",
   "{t}? Да или нет?"
  ],
  "en": [
   "This is {t}. Is that right?",
   "Kabu says: this is {t}. True?",
   "{t}? Yes or no?"
  ],
  "de": [
   "Das ist {t}. Stimmt das?",
   "Kabu sagt: das ist {t}. Richtig?",
   "{t}? Ja oder nein?"
  ],
  "es": [
   "Esto es {t}. ¿Es correcto?",
   "Kabu dice: esto es {t}. ¿Verdad?",
   "¿{t}? ¿Sí o no?"
  ]
 }
};
for (const [k, v] of Object.entries(RAUND_VARIANTLAR)) if (OYIN_MATN[k] && k !== "aytOch") OYIN_MATN[k].raund = v;   // REV359: aytOch o'zining yangi gaplari bilan

/** O'yin gapi izoh tilida, o'rinlari to'ldirilgan. Bo'sh {t} qolsa — gap boshidagi ortiqcha tinish belgilari olib tashlanadi. */
export function oyinMatn(kalit, gapKaliti, izoh = "uz", vars = {}, i = 0) {
  const til = izohNorm(izoh);
  const m = OYIN_MATN[kalit]?.[gapKaliti] || UMUMIY_MATN[gapKaliti];
  if (!m) return "";
  // REV347: gap bir nechta variantli bo'lishi mumkin — i bo'yicha navbat bilan (o'yin va raund almashganda boshqa gap)
  const v = m[til] ?? m.uz ?? "";
  const asl = Array.isArray(v) ? v[((Number(i) || 0) % v.length + v.length) % v.length] : v;
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
    .trim()
    // REV347: gap boshidagi kichik harf — katta (teglangan chet so'zga tegmaydi)
    .replace(/(^|[.!?]\s+)(\p{Ll})/gu, (_, a, b) => a + b.toLocaleUpperCase());
}
