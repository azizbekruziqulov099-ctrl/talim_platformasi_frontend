// 1-sinf: birinchi so'zlar — salomlashish, ranglar, sonlar, oila, o'yinchoqlar, hayvonlar, mevalar, tana.
import { soz, bor, gap, bolim } from "./qurilish.js";

export default [
  bolim("s1-1", "Salomlashish | Приветствие | Greetings", "👋", [
    soz("hello", "👋", "Waving hand", "Salom | Привет | Hello | Hallo | Bonjour | Hola | مرحبًا | Merhaba | 你好 | こんにちは | 안녕하세요"),
    soz("goodbye", "🙋", "Raising hands", "Xayr | Пока | Goodbye | Tschüss | Au revoir | Adiós | مع السلامة | Hoşça kal | 再见 | さようなら | 안녕히 가세요"),
    soz("goodmorning", "🌅", "Sunrise", "Xayrli tong | Доброе утро | Good morning | Guten Morgen | Bonjour | Buenos días | صباح الخير | Günaydın | 早上好 | おはようございます | 좋은 아침이에요"),
    soz("thanks", "🙏", "Folded hands", "Rahmat | Спасибо | Thank you | Danke | Merci | Gracias | شكرًا | Teşekkürler | 谢谢 | ありがとう | 고마워요"),
    soz("please", "🥺", "Pleading face", "Iltimos | Пожалуйста | Please | Bitte | S’il te plaît | Por favor | من فضلك | Lütfen | 请 | おねがいします | 부탁해요"),
    soz("yes", "✅", "Check mark button", "Ha | Да | Yes | Ja | Oui | Sí | نعم | Evet | 是 | はい | 네"),
    soz("no", "❌", "Cross mark", "Yo‘q | Нет | No | Nein | Non | No | لا | Hayır | 不 | いいえ | 아니요"),
    soz("sorry", "😔", "Pensive face", "Kechirasiz | Извините | Sorry | Entschuldigung | Pardon | Perdón | آسف | Özür dilerim | 对不起 | ごめんなさい | 미안해요"),
    soz("friend", "🫂", "People hugging", "do‘st | друг | friend | der Freund | l’ami | el amigo | الصديق | arkadaş | 朋友 | ともだち | 친구"),
    bor("teacher", "Teacher"),
  ], [
    gap("Salom! Men Aliman. | Привет! Я Али. | Hello! I’m Ali. | Hallo! Ich bin Ali. | Bonjour ! Je suis Ali. | ¡Hola! Soy Ali. | مرحبًا! أنا علي. | Merhaba! Ben Ali. | 你好！我是阿里。 | こんにちは！わたしはアリです。 | 안녕하세요! 저는 알리예요."),
    gap("Ismingiz nima? | Как тебя зовут? | What’s your name? | Wie heißt du? | Comment tu t’appelles ? | ¿Cómo te llamas? | ما اسمك؟ | Adın ne? | 你叫什么名字？ | おなまえは？ | 이름이 뭐예요?"),
    gap("Tanishganimdan xursandman! | Очень приятно! | Nice to meet you! | Freut mich! | Enchanté ! | ¡Mucho gusto! | تشرفت بمعرفتك! | Memnun oldum! | 很高兴认识你！ | よろしくね！ | 만나서 반가워요!"),
  ]),
  bolim("s1-2", "Ranglar | Цвета | Colours", "🎨", [
    bor("red"), bor("blue"), bor("green"), bor("yellow"), bor("pink"), bor("purple"), bor("black"), bor("white"),
    soz("orangec", "🟠", "", "to‘q sariq | оранжевый | orange | orange | orange | naranja | برتقالي | turuncu | 橙色 | オレンジいろ | 주황색"),
    soz("brown", "🟤", "", "jigarrang | коричневый | brown | braun | marron | marrón | بني | kahverengi | 棕色 | ちゃいろ | 갈색"),
  ], [
    gap("Olma qizil. | Яблоко красное. | The apple is red. | Der Apfel ist rot. | La pomme est rouge. | La manzana es roja. | التفاحة حمراء. | Elma kırmızı. | 苹果是红色的。 | りんごはあかいです。 | 사과는 빨간색이에요."),
    gap("Osmon ko‘k. | Небо голубое. | The sky is blue. | Der Himmel ist blau. | Le ciel est bleu. | El cielo es azul. | السماء زرقاء. | Gökyüzü mavi. | 天空是蓝色的。 | そらはあおいです。 | 하늘은 파래요."),
    gap("Mening sevimli rangim — yashil. | Мой любимый цвет — зелёный. | My favourite colour is green. | Meine Lieblingsfarbe ist Grün. | Ma couleur préférée est le vert. | Mi color favorito es el verde. | لوني المفضل هو الأخضر. | En sevdiğim renk yeşil. | 我最喜欢的颜色是绿色。 | すきないろはみどりです。 | 제가 좋아하는 색은 초록색이에요."),
  ]),
  bolim("s1-3", "Sonlar 1–10 | Числа 1–10 | Numbers 1–10", "🔢", [
    soz("n1", "1️⃣", "Keycap 1", "bir | один | one | eins | un | uno | واحد | bir | 一 | いち | 하나"),
    soz("n2", "2️⃣", "Keycap 2", "ikki | два | two | zwei | deux | dos | اثنان | iki | 二 | に | 둘"),
    soz("n3", "3️⃣", "Keycap 3", "uch | три | three | drei | trois | tres | ثلاثة | üç | 三 | さん | 셋"),
    soz("n4", "4️⃣", "Keycap 4", "to‘rt | четыре | four | vier | quatre | cuatro | أربعة | dört | 四 | よん | 넷"),
    soz("n5", "5️⃣", "Keycap 5", "besh | пять | five | fünf | cinq | cinco | خمسة | beş | 五 | ご | 다섯"),
    soz("n6", "6️⃣", "Keycap 6", "olti | шесть | six | sechs | six | seis | ستة | altı | 六 | ろく | 여섯"),
    soz("n7", "7️⃣", "Keycap 7", "yetti | семь | seven | sieben | sept | siete | سبعة | yedi | 七 | なな | 일곱"),
    soz("n8", "8️⃣", "Keycap 8", "sakkiz | восемь | eight | acht | huit | ocho | ثمانية | sekiz | 八 | はち | 여덟"),
    soz("n9", "9️⃣", "Keycap 9", "to‘qqiz | девять | nine | neun | neuf | nueve | تسعة | dokuz | 九 | きゅう | 아홉"),
    soz("n10", "🔟", "Keycap 10", "o‘n | десять | ten | zehn | dix | diez | عشرة | on | 十 | じゅう | 열"),
  ], [
    gap("Men yetti yoshdaman. | Мне семь лет. | I am seven years old. | Ich bin sieben Jahre alt. | J’ai sept ans. | Tengo siete años. | عمري سبع سنوات. | Yedi yaşındayım. | 我七岁。 | わたしはななさいです。 | 저는 일곱 살이에요."),
    gap("Mening ikkita qo‘lim bor. | У меня две руки. | I have two hands. | Ich habe zwei Hände. | J’ai deux mains. | Tengo dos manos. | لدي يدان. | İki elim var. | 我有两只手。 | てがふたつあります。 | 저는 손이 두 개 있어요."),
    gap("O‘ngacha sana! | Посчитай до десяти! | Count to ten! | Zähl bis zehn! | Compte jusqu’à dix ! | ¡Cuenta hasta diez! | عُدّ حتى عشرة! | Ona kadar say! | 数到十！ | じゅうまでかぞえて！ | 열까지 세어 봐!"),
  ]),
  bolim("s1-4", "Oilam | Моя семья | My family", "👨‍👩‍👧", [
    bor("mother", "Woman"), bor("father", "Man"), bor("sister", "Girl"), bor("brother", "Boy"), bor("granny", "Old woman"), bor("grandpa", "Old man"),
    bor("baby", "Baby"), bor("aunt"), bor("uncle"),
    soz("family", "👪", "House with garden", "oila | семья | family | die Familie | la famille | la familia | العائلة | aile | 家人 | かぞく | 가족"),
  ], [
    gap("Bu mening onam. | Это моя мама. | This is my mum. | Das ist meine Mama. | C’est ma maman. | Esta es mi mamá. | هذه أمي. | Bu benim annem. | 这是我的妈妈。 | これはわたしのおかあさんです。 | 이분은 우리 엄마예요."),
    gap("Men oilamni yaxshi ko‘raman. | Я люблю свою семью. | I love my family. | Ich liebe meine Familie. | J’aime ma famille. | Quiero a mi familia. | أحب عائلتي. | Ailemi seviyorum. | 我爱我的家人。 | かぞくがだいすきです。 | 저는 우리 가족을 사랑해요."),
    gap("Ukam besh yoshda. | Моему брату пять лет. | My brother is five. | Mein Bruder ist fünf. | Mon frère a cinq ans. | Mi hermano tiene cinco años. | أخي عمره خمس سنوات. | Kardeşim beş yaşında. | 我弟弟五岁。 | おとうとはごさいです。 | 남동생은 다섯 살이에요."),
  ]),
  bolim("s1-5", "O‘yinchoqlar | Игрушки | Toys", "🧸", [
    bor("teddy", "Teddy bear"), bor("doll", "Nesting dolls"), bor("ball", "Soccer ball"), bor("blocks"), bor("kite", "Kite"), bor("car", "Automobile"),
    bor("robot", "Robot"), bor("drum", "Drum"), bor("balloon", "Balloon"),
    soz("puzzle", "🧩", "Puzzle piece", "boshqotirma | пазл | puzzle | das Puzzle | le puzzle | el rompecabezas | الأحجية | yapboz | 拼图 | パズル | 퍼즐"),
  ], [
    gap("Mening to‘pim bor. | У меня есть мяч. | I have a ball. | Ich habe einen Ball. | J’ai un ballon. | Tengo una pelota. | عندي كرة. | Benim bir topum var. | 我有一个球。 | ボールをもっています。 | 저는 공이 있어요."),
    gap("Keling, o‘ynaymiz! | Давай играть! | Let’s play! | Lass uns spielen! | On joue ! | ¡Vamos a jugar! | هيا نلعب! | Hadi oynayalım! | 我们一起玩吧！ | あそぼう！ | 같이 놀자!"),
    gap("Mening robotim katta. | Мой робот большой. | My robot is big. | Mein Roboter ist groß. | Mon robot est grand. | Mi robot es grande. | روبوتي كبير. | Robotum büyük. | 我的机器人很大。 | わたしのロボットはおおきいです。 | 제 로봇은 커요."),
  ]),
  bolim("s1-6", "Uy hayvonlari | Домашние животные | Farm animals", "🐄", [
    bor("cat", "Cat"), bor("dog", "Dog"), bor("duck", "Duck"), bor("rabbit", "Rabbit"), bor("hen", "Chicken"), bor("horse", "Horse"),
    bor("cow", "Cow"), bor("sheep", "Ewe"), bor("bird", "Bird"), bor("frog", "Frog"),
  ], [
    gap("Men kuchuklarni yaxshi ko‘raman. | Я люблю собак. | I like dogs. | Ich mag Hunde. | J’aime les chiens. | Me gustan los perros. | أحب الكلاب. | Köpekleri severim. | 我喜欢狗。 | いぬがすきです。 | 저는 강아지를 좋아해요."),
    gap("Sigir sut beradi. | Корова даёт молоко. | The cow gives milk. | Die Kuh gibt Milch. | La vache donne du lait. | La vaca da leche. | البقرة تعطي الحليب. | İnek süt verir. | 奶牛产奶。 | うしはミルクをだします。 | 소는 우유를 줘요."),
    gap("Qush ucha oladi. | Птица умеет летать. | The bird can fly. | Der Vogel kann fliegen. | L’oiseau sait voler. | El pájaro puede volar. | الطائر يستطيع أن يطير. | Kuş uçabilir. | 鸟会飞。 | とりはとべます。 | 새는 날 수 있어요."),
  ]),
  bolim("s1-7", "Meva va sabzavotlar | Фрукты и овощи | Fruit and vegetables", "🍎", [
    bor("apple", "Red apple"), bor("banana", "Banana"), bor("grapes", "Grapes"), bor("lemon", "Lemon"), bor("strawberry", "Strawberry"),
    bor("orange", "Tangerine"), bor("tomato", "Tomato"), bor("cucumber", "Cucumber"), bor("carrot", "Carrot"), bor("potato", "Potato"),
  ], [
    gap("Men olmani yaxshi ko‘raman. | Я люблю яблоки. | I like apples. | Ich mag Äpfel. | J’aime les pommes. | Me gustan las manzanas. | أحب التفاح. | Elmayı severim. | 我喜欢苹果。 | りんごがすきです。 | 저는 사과를 좋아해요."),
    gap("Banan sariq. | Банан жёлтый. | The banana is yellow. | Die Banane ist gelb. | La banane est jaune. | El plátano es amarillo. | الموزة صفراء. | Muz sarı. | 香蕉是黄色的。 | バナナはきいろです。 | 바나나는 노란색이에요."),
    gap("Sabzi foydali. | Морковь полезная. | Carrots are good for you. | Karotten sind gesund. | Les carottes sont bonnes pour la santé. | Las zanahorias son sanas. | الجزر مفيد. | Havuç sağlıklıdır. | 胡萝卜对身体好。 | にんじんはからだにいいです。 | 당근은 몸에 좋아요."),
  ]),
  bolim("s1-8", "Tanam | Моё тело | My body", "🙋", [
    bor("head"), bor("eyes", "Eyes"), bor("ears", "Ear"), bor("nose", "Nose"), bor("mouth", "Mouth"), bor("hands"), bor("feet", "Foot"),
    bor("knees"), bor("fingers"), bor("shoulders"),
  ], [
    gap("Mening ikkita ko‘zim bor. | У меня два глаза. | I have two eyes. | Ich habe zwei Augen. | J’ai deux yeux. | Tengo dos ojos. | لدي عينان. | İki gözüm var. | 我有两只眼睛。 | めがふたつあります。 | 저는 눈이 두 개 있어요."),
    gap("Burningni ushla! | Дотронься до носа! | Touch your nose! | Fass deine Nase an! | Touche ton nez ! | ¡Tócate la nariz! | المس أنفك! | Burnuna dokun! | 摸摸鼻子！ | はなをさわって！ | 코를 만져!"),
    gap("Qo‘lingni yuv. | Помой руки. | Wash your hands. | Wasch dir die Hände. | Lave-toi les mains. | Lávate las manos. | اغسل يديك. | Ellerini yıka. | 洗洗手。 | てをあらってね。 | 손을 씻어."),
  ]),
];
