// REV459: Azizjon yuborgan 140 ta rasm bilan o'yinlar boyitildi — ketma-ketliklar (A), juftlar (C), saralash (D), teskarisi (F).
// Rasm — OYIN_RASM kaliti «o_<fayl>» (rasm_yangi papkasi). Har so'z 5 tilda.
const W = (e, uz, ru, en, fayl, qo) => ({ e, s: { uz, ru, en, de: en, es: en, ...(fayl ? { r: `o_${fayl}` } : {}) }, ...(qo || {}) });

/** A. Ketma-ketliklar: har o'yinda bir nechta xil ketma-ketlik (har raundda boshqasi). */
export const TARTIB_TOPLAM = {
  kunTartibi: [
    { nom: "ertalab", q: [W("🌅", "uyg‘onaman", "просыпаюсь", "I wake up", "uygonaman"), W("🚿", "yuvinaman", "умываюсь", "I wash my face", "yuvinaman"), W("👕", "kiyinaman", "одеваюсь", "I get dressed", "kiyinaman"), W("🥣", "nonushta qilaman", "завтракаю", "I have breakfast", "nonushta"), W("🎒", "bog‘chaga boraman", "иду в садик", "I go to kindergarten", "bogchaga_boraman")] },
    { nom: "kechqurun", q: [W("🍽", "kechki ovqat", "ужин", "dinner", "kechki_ovqat"), W("🛁", "cho‘milaman", "купаюсь", "I take a bath", "chomilaman"), W("👕", "pijama kiyaman", "надеваю пижаму", "I put on pyjamas", "pijama_kiyaman"), W("📖", "ertak tinglayman", "слушаю сказку", "I listen to a story", "ertak_tinglayman"), W("😴", "uxlayman", "сплю", "I sleep", "uxlayman")] },
    { nom: "bog‘chada", q: [W("🧸", "o‘ynaymiz", "играем", "we play", "bogchada_oyin"), W("🧼", "qo‘l yuvamiz", "моем руки", "we wash hands", "bogchada_qol_yuvish"), W("🍲", "tushlik qilamiz", "обедаем", "we have lunch", "bogchada_tushlik"), W("🛏", "tushki uyqu", "тихий час", "nap time", "bogchada_tushki_uyqu"), W("🎨", "rasm chizamiz", "рисуем", "we draw", "bogchada_rasm")] },
  ],
  qolYuvish: [
    { nom: "qo‘l yuvish", q: [W("💧", "qo‘limni ho‘llayman", "мочу руки", "I wet my hands", "qol_holash"), W("🧼", "sovun surtaman", "намыливаю", "I use soap", "sovun_surtish"), W("👐", "ishqalayman", "тру руки", "I rub", "ishqalash"), W("🚰", "chayaman", "смываю", "I rinse", "chayish"), W("🧻", "artaman", "вытираю", "I dry", "artish")] },
    { nom: "cho‘milish", q: [W("🛁", "vannaga suv to‘ldiraman", "набираю ванну", "I fill the bath", "vannaga_suv"), W("🧴", "shampun surtaman", "мою голову", "I use shampoo", "shampun"), W("🚿", "dushda chayinaman", "смываю под душем", "I rinse in the shower", "dush"), W("🧖", "sochiqqa o‘ranaman", "вытираюсь полотенцем", "I dry with a towel", "sochiq_artinish")] },
    { nom: "kiyinish", q: [W("🎽", "mayka kiyaman", "надеваю майку", "I put on a vest", "ichki_kiyim"), W("👔", "ko‘ylak kiyaman", "надеваю рубашку", "I put on a shirt", "koylak_kiyish"), W("👖", "shim kiyaman", "надеваю брюки", "I put on trousers", "shim_kiyish"), W("🧦", "paypoq kiyaman", "надеваю носки", "I put on socks", "paypoq_kiyish"), W("👟", "oyoq kiyim kiyaman", "обуваюсь", "I put on shoes", "oyoq_kiyim_kiyish")] },
  ],
  tishTozalash: [
    { nom: "tish tozalash", q: [W("🪥", "cho‘tkani olaman", "беру щётку", "I take the brush", "chotka_olish"), W("🧴", "pasta surtaman", "выдавливаю пасту", "I put on toothpaste", "pasta_surtish"), W("😁", "tishimni tozalayman", "чищу зубы", "I brush my teeth", "tish_tozalash"), W("💧", "og‘zimni chayaman", "полощу рот", "I rinse my mouth", "ogiz_chayish")] },
    { nom: "qo‘l yuvish", q: [W("💧", "qo‘limni ho‘llayman", "мочу руки", "I wet my hands", "qol_holash"), W("🧼", "sovun surtaman", "намыливаю", "I use soap", "sovun_surtish"), W("🚰", "chayaman", "смываю", "I rinse", "chayish"), W("🧻", "artaman", "вытираю", "I dry", "artish")] },
  ],
  fasllar: [
    { nom: "fasllar", q: [{ e: "🌸", s: { uz: "bahor", ru: "весна", en: "spring", de: "Frühling", es: "primavera", r: "spring" } }, { e: "☀️", s: { uz: "yoz", ru: "лето", en: "summer", de: "Sommer", es: "verano", r: "summer" } },
      { e: "🍂", s: { uz: "kuz", ru: "осень", en: "autumn", de: "Herbst", es: "otoño", r: "autumn" } }, { e: "❄️", s: { uz: "qish", ru: "зима", en: "winter", de: "Winter", es: "invierno", r: "winter" } }] },
    { nom: "kun va tun", q: [W("🌅", "tong", "утро", "dawn", "tong"), W("☀️", "kunduz", "день", "day", "kunduz"), W("🌇", "kechqurun", "вечер", "evening", "kechqurun"), W("🌙", "tun", "ночь", "night", "tun")] },
  ],
  suvSayohati: [
    { nom: "suv aylanishi", q: [W("🌊", "quyosh dengizni isitadi", "солнце греет море", "the sun warms the sea", "dengiz_quyosh"), W("☁️", "bulut", "облако", "cloud", "bulut"), W("🌧", "yomg‘ir", "дождь", "rain", "yomgir"), W("🏞", "daryo", "река", "river", "daryo")] },
  ],
  kapalak: [   // REV470: «Kapalak hayoti» — rasmli
    { nom: "kapalak", q: [W("🥚", "tuxum", "яйцо", "egg", "kapalak_tuxumi"), W("🐛", "qurtcha", "гусеница", "caterpillar", "qurtcha"), W("🫛", "g‘umbak", "куколка", "cocoon", "gumbak"), { e: "🦋", s: { uz: "kapalak", ru: "бабочка", en: "butterfly", de: "Schmetterling", es: "mariposa", r: "d_butterfly" } }] },
    { nom: "qurbaqa", q: [W("🫧", "uvildiriq", "икринки", "frog eggs", "uvildiriq"), W("🐟", "itbaliq", "головастик", "tadpole", "itbaliq"), W("🐸", "qurbaqacha", "лягушонок", "froglet", "qurbaqacha")] },
  ],
  qayerdan: [
    { nom: "non", q: [W("🌾", "bug‘doy dalasi", "пшеничное поле", "wheat field", "bugdoy_dalasi"), W("🚜", "kombayn o‘radi", "комбайн убирает", "harvester", "kombayn"), W("🏭", "tegirmonda un", "мука на мельнице", "flour mill", "tegirmon"), W("🥣", "xamir qoriladi", "замешивают тесто", "dough", "xamir"), W("🔥", "tandirga yopiladi", "печь в тандыре", "tandoor", "tandir"), W("🍞", "tayyor non", "готовый хлеб", "fresh bread", "tayyor_non")] },
    { nom: "sut", q: [W("🐄", "sigir o‘tloqda", "корова на лугу", "cow in the meadow", "sigir_oyloqda"), W("🪣", "sut sog‘iladi", "доят молоко", "milking", "sut_sogish"), W("🥛", "sut paketi", "пакет молока", "milk carton", "sut_paket"), W("🧒", "sut ichaman", "пью молоко", "I drink milk", "sut_stakanda")] },
  ],
};

/** C. Yangi juftlar (ULASH ga qo'shiladi). */
export const ULASH_QOSH = {
  onaBola: [[W("🐇", "quyon", "кролик", "rabbit"), W("🐰", "quyoncha", "крольчонок", "bunny", "quyon_bolasi")], [W("🦊", "tulki", "лиса", "fox"), W("🦊", "tulki bolasi", "лисёнок", "fox cub", "tulki_bolasi")],
    [W("🦁", "sher", "лев", "lion"), W("🦁", "sher bolasi", "львёнок", "lion cub", "sher_bolasi")], [W("🐘", "fil", "слон", "elephant"), W("🐘", "fil bolasi", "слонёнок", "baby elephant", "fil_bolasi")],
    [W("🪿", "g‘oz", "гусь", "goose"), W("🐥", "g‘ozcha", "гусёнок", "gosling", "ghoz_bolasi")], [W("🐸", "qurbaqa", "лягушка", "frog"), W("🐟", "itbaliq", "головастик", "tadpole", "baqa_bolasi")]],
  uyiQayerda: [[W("🐠", "baliqcha", "рыбка", "fish"), W("🫧", "akvarium", "аквариум", "aquarium", "akvarium")], [W("🐔", "tovuq", "курица", "hen"), W("🏠", "tovuqxona", "курятник", "henhouse", "tovuqxona")],
    [W("🐄", "sigir", "корова", "cow"), W("🏚", "molxona", "хлев", "cowshed", "molxona")], [W("🐿", "olmaxon", "белка", "squirrel"), W("🌳", "daraxt kovagi", "дупло", "tree hollow", "daraxt_kovagi")],
    [W("🦊", "tulki", "лиса", "fox"), W("🕳", "tulki ini", "нора", "fox den", "tulki_ini")], [W("🧑", "odam", "человек", "person"), W("🏡", "uy", "дом", "house", "uy")]],
  kasbAsbob: [[W("🚌", "haydovchi", "водитель", "driver", "haydovchi"), W("🛞", "rul", "руль", "steering wheel", "rul")], [W("💈", "sartarosh", "парикмахер", "barber", "sartarosh"), W("✂️", "soch olish mashinkasi", "машинка для стрижки", "hair clipper", "soch_olish_mashinkasi")],
    [W("👷", "quruvchi", "строитель", "builder", "quruvchi"), W("⛑", "kaska", "каска", "hard hat", "kaska")], [W("📮", "pochtachi", "почтальон", "postman", "pochtachi"), W("✉️", "konvert", "конверт", "envelope", "konvert")],
    [W("🧑‍✈️", "uchuvchi", "лётчик", "pilot", "uchuvchi"), W("✈️", "samolyot", "самолёт", "plane")], [W("🥖", "novvoy", "пекарь", "baker", "novvoy"), W("🍞", "non", "хлеб", "bread", "tayyor_non")],
    [W("🧵", "tikuvchi", "швея", "tailor", "tikuvchi"), W("🪡", "tikuv mashinasi", "швейная машина", "sewing machine", "tikuv_mashinasi")], [W("🧑‍🌾", "bog‘bon", "садовник", "gardener", "bogbon"), W("🚿", "gul sug‘orgich", "лейка", "watering can", "suv_sepgich")]],
  nimaBilan: [[W("🪥", "tish cho‘tkasi", "зубная щётка", "toothbrush"), W("🧴", "tish pastasi", "зубная паста", "toothpaste", "tish_pastasi")], [W("🔨", "bolg‘a", "молоток", "hammer", "bolga"), W("📍", "mix", "гвоздь", "nail", "mix")],
    [W("🪡", "igna", "игла", "needle", "igna"), W("🧵", "ip", "нитка", "thread", "igna_ip")], [W("🫖", "choynak", "чайник", "teapot"), W("🍵", "piyola", "пиала", "cup", "choynak_piyola")]],
  sezgi: [[W("👁", "ko‘z", "глаз", "eye"), W("📖", "kitob o‘qiyman", "читаю книгу", "I read a book", "kitob_oqish")], [W("👂", "quloq", "ухо", "ear"), W("🔔", "qo‘ng‘iroq ovozi", "звон колокольчика", "bell ringing", "qongiroq")],
    [W("👃", "burun", "нос", "nose"), W("🍞", "non hidi", "запах хлеба", "smell of bread", "non_hidi")], [W("👅", "til", "язык", "tongue"), W("🍋", "nordon limon", "кислый лимон", "sour lemon", "limon_nordon")],
    [W("✋", "qo‘l", "рука", "hand"), W("🌵", "tikanli kaktus", "колючий кактус", "prickly cactus", "kaktus_tegish")], [W("👅", "til", "язык", "tongue"), W("🍦", "sovuq muzqaymoq", "холодное мороженое", "cold ice cream", "muzqaymoq_sovuq")]],
};

/** D. Saralash: [o'yin, guruh indeksi, narsalar] (yangi guruh — {guruh: W(...)}). */
export const SARALASH_QOSH = [
  ["xavfli", 1, [W("🧺", "issiq dazmol", "горячий утюг", "hot iron", "dazmol"), W("🔥", "gugurt", "спички", "matches", "gugurt"), W("🪡", "igna", "игла", "needle", "igna"), W("🫖", "issiq choynak", "горячий чайник", "hot kettle", "issiq_choynak"),
    W("🔌", "yalang‘och sim", "оголённый провод", "damaged wire", "elektr_simi"), W("🪟", "ochiq deraza", "открытое окно", "open window", "ochiq_deraza"), W("🚗", "katta yo‘l", "дорога", "busy road", "yol"), W("🧊", "muz ustida sirpanish", "скользкий лёд", "slippery ice", "muz_ustida")]],
  ["xavfli", 0, [W("🛏", "yostiq", "подушка", "pillow", "yostiq"), W("🧱", "kubiklar", "кубики", "blocks", "kubiklar"), W("📄", "qog‘oz varaq", "лист бумаги", "sheet of paper", "qogoz_varaq"), W("🦆", "rezina o‘rdak", "резиновая уточка", "rubber duck", "rezina_ordak")]],
  ["chiqindi", 0, [W("📕", "eski kitob", "старая книга", "old book", "eski_kitob")]],
  ["chiqindi", 1, [W("🧸", "singan plastik o‘yinchoq", "сломанная пластиковая игрушка", "broken plastic toy", "plastik_oyinchoq")]],
  ["chiqindi", 2, [W("🥔", "kartoshka po‘sti", "картофельные очистки", "potato peel", "kartoshka_posti"), W("🍞", "non ushoqlari", "крошки хлеба", "bread crumbs", "non_ushoqlari")]],
  ["chiqindi", { guruh: W("🟩", "shisha", "стекло", "glass", "shisha_guruh") }, [W("🫙", "shisha banka", "стеклянная банка", "glass jar", "shisha_banka"), W("🍾", "shisha butilka", "стеклянная бутылка", "glass bottle", "shisha_butilka")]],
  ["faslKiyim", 1, [W("🧢", "yozgi kepka", "летняя кепка", "summer cap", "yozgi_kepka"), W("👗", "sarafan", "сарафан", "sundress", "sarafan"), W("👡", "sandal", "сандалии", "sandals", "sandal")]],
  ["faslKiyim", 0, [W("🪖", "mo‘ynali telpak", "меховая шапка", "fur hat", "telpak")]],
  ["faslKiyim", 2, [W("🧥", "yengil kurtka", "лёгкая куртка", "light jacket", "yengil_kurtka", { ham: [3] }), W("🧥", "yomg‘irpo‘sh", "плащ", "raincoat", "plash", { ham: [3] })]],
  ["transport", 1, [W("🛳", "paroxod", "пароход", "steamship", "paroxod"), W("🤿", "suv osti kemasi", "подводная лодка", "submarine", "suv_osti_kemasi"), W("🚤", "kater", "катер", "motorboat", "kater")]],
  ["transport", 2, [W("🎈", "dirijabl", "дирижабль", "airship", "dirijabl"), W("🪂", "paraplan", "параплан", "paraglider", "paraplan"), W("🚀", "kosmik kema", "космический корабль", "spaceship", "kosmik_kema")]],
  ["harakatTuri", { guruh: W("🐍", "sudraladi", "ползает", "crawls", "sudraladi_guruh") }, [W("🐍", "ilon", "змея", "snake", "ilon_sudralish")]],
  ["harakatTuri", { guruh: W("🦘", "sakraydi", "прыгает", "jumps", "sakraydi_guruh") }, [W("🦘", "kenguru", "кенгуру", "kangaroo", "kenguru")]],
];

/** F. Teskarisi: rasmli juftlar. */
export const TESKARI_QOSH = [
  [W("☕", "issiq", "горячий", "hot", "issiq_choy"), W("🧊", "sovuq", "холодный", "cold", "sovuq_muz")],
  [W("🐘", "katta", "большой", "big", "katta_fil"), W("🐭", "kichik", "маленький", "small")],
  [W("🌳", "baland", "высокий", "tall", "baland_daraxt"), W("🌿", "past", "низкий", "short", "past_buta")],
  [W("🙌", "toza", "чистый", "clean", "toza_qol"), W("🤲", "iflos", "грязный", "dirty", "iflos_qol")],
  [W("🚪", "ochiq", "открыто", "open", "ochiq_eshik"), W("🚪", "yopiq", "закрыто", "closed", "yopiq_eshik")],
  [W("🥛", "to‘la", "полный", "full", "toliq_stakan"), W("🥛", "bo‘sh", "пустой", "empty", "bosh_stakan")],
  [W("🐇", "tez", "быстро", "fast", "tez_quyon"), W("🐢", "sekin", "медленно", "slow", "sekin_toshbaqa")],
  [W("☀️", "kun", "день", "day", "kun"), W("🌙", "tun", "ночь", "night", "tun")],
];
