// REV453: «Kim qanday o'sadi?» — faqat HAYVONLAR (har birining o'z rivojlanishi), «Gul o'stiramiz» — faqat O'SIMLIKLAR.
// Ikki o'yin bir-birini takrorlamaydi; bir ketma-ketlik ichida bir xil rasm (emoji) ikki marta uchramaydi; «odam» olib tashlandi
// (emoji odamlar bir-biriga o'xshab, bola qaysi biri katta ekanini ajrata olmasdi).
const W = (e, uz, ru, en, r) => ({ e, s: { uz, ru, en, de: en, es: en, ...(r ? { r } : {}) } });
const Y = (nom) => `o_${nom}`;   // o‘yin rasmlari (rasm_yangi, OYIN_RASM kalitlari)
export const OSISH_TOPLAM = [
  { nom: "tovuq", q: [W("🥚", "tuxum", "яйцо", "egg"), W("🐣", "jo‘ja chiqdi", "цыплёнок вылупился", "chick hatches"), W("🐤", "jo‘ja", "цыплёнок", "chick", Y("joja")), W("🐔", "tovuq", "курица", "hen", "hen")] },
  { nom: "kapalak", q: [W("🥚", "tuxum", "яйцо", "egg"), W("🐛", "qurtcha", "гусеница", "caterpillar"), W("🫛", "g‘umbak", "куколка", "cocoon"), W("🦋", "kapalak", "бабочка", "butterfly", "d_butterfly")] },
  { nom: "qurbaqa", q: [W("🫧", "uvildiriq", "икринки", "frog eggs"), W("🐟", "itbaliq", "головастик", "tadpole"), W("🐸", "qurbaqa", "лягушка", "frog", "frog")] },
  { nom: "o‘rdak", q: [W("🥚", "tuxum", "яйцо", "egg"), W("🐥", "o‘rdakcha", "утёнок", "duckling", Y("ordakcha")), W("🦆", "o‘rdak", "утка", "duck", "duck")] },
  { nom: "ot", q: [W("🐴", "toy", "жеребёнок", "foal", Y("toy")), W("🐎", "ot", "лошадь", "horse", "horse")] },
  { nom: "tuya", q: [W("🐪", "bo‘taloq", "верблюжонок", "baby camel", Y("botaloq")), W("🐫", "tuya", "верблюд", "camel", "d_bactrian-camel")] },
  { nom: "echki", q: [W("🐐", "uloq", "козлёнок", "kid", Y("uloq")), W("🐐", "echki", "коза", "goat", "d_goat")] },
  { nom: "ayiq", q: [W("🧸", "ayiq bolasi", "медвежонок", "bear cub", Y("ayiq_bolasi")), W("🐻", "ayiq", "медведь", "bear", "d_bear")] },
  { nom: "it", q: [W("🐶", "kuchukcha", "щенок", "puppy", "d_am34-u1-kuchukcha"), W("🐕", "it", "собака", "dog", "d_am23-u1-it")] },
  { nom: "mushuk", q: [W("🐱", "mushukcha", "котёнок", "kitten", "d_m-mushukcha"), W("🐈", "mushuk", "кошка", "cat", "cat")] },
  { nom: "sigir", q: [W("🐮", "buzoq", "телёнок", "calf", "d_am34-u1-buzoq"), W("🐄", "sigir", "корова", "cow", "cow")] },
  { nom: "qo‘y", q: [W("🐑", "qo‘zichoq", "ягнёнок", "lamb", "d_am34-u1-qozichoq"), W("🐏", "qo‘y", "овца", "sheep", "sheep")] },
];
export const GUL_TOPLAM = [
  { nom: "lola", q: [W("🧅", "piyozbosh", "луковица", "bulb"), W("🌱", "nihol", "росток", "sprout"), W("🌿", "barglar chiqdi", "появились листья", "leaves"), W("🌷", "lola ochildi", "тюльпан распустился", "tulip")] },
  { nom: "kungaboqar", q: [W("🫘", "pista (urug‘)", "семечко", "seed"), W("🌱", "nihol", "росток", "sprout"), W("🎋", "baland poya", "высокий стебель", "tall stem"), W("🌻", "kungaboqar ochildi", "подсолнух расцвёл", "sunflower", "d_sunflower")] },
  { nom: "pomidor", q: [W("🌱", "ko‘chat", "рассада", "seedling"), W("🌼", "sariq gul", "жёлтый цветок", "yellow flower"), W("🟢", "yashil pomidor", "зелёный помидор", "green tomato"), W("🍅", "qizil pomidor", "красный помидор", "red tomato", "tomato")] },
  { nom: "olma", q: [W("🌸", "olma guli", "цветок яблони", "apple blossom"), W("🍏", "g‘o‘ra olma", "зелёное яблоко", "green apple"), W("🍎", "pishgan olma", "спелое яблоко", "ripe apple", "apple")] },
  { nom: "daraxt", q: [W("🌰", "yong‘oq ekildi", "посадили орех", "nut planted"), W("🌱", "nihol", "росток", "sprout"), W("🪴", "yosh daraxt", "молодое дерево", "young tree"), W("🌳", "katta daraxt", "большое дерево", "big tree", "tree")] },
  { nom: "bug‘doy", q: [W("🌱", "maysa", "всходы", "shoots"), W("🌾", "boshoq", "колос", "ear of wheat"), W("🥣", "un", "мука", "flour"), W("🍞", "non", "хлеб", "bread", "d_uzbek-flatbread-bakery")] },
  { nom: "tarvuz", q: [W("🌱", "nihol", "росток", "sprout"), W("🍃", "palak", "плеть", "vine"), W("🌼", "gul", "цветок", "flower"), W("🍉", "tarvuz", "арбуз", "watermelon", "watermelon")] },
];
