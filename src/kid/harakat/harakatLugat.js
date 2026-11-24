// REV141: «Harakat o'yinlari» — bola harakat so'zlarini (och, yop, tep, bura, hayda…) avval o'rganadi, keyin
// ekranda barmog'i bilan O'ZI bajaradi: eshikni ochadi, rulni buraydi, to'pni tepadi, sharni shishiradi.
// Sof ma'lumot (brauzersiz sinaladi). Har ibora 11 tilda: uz | ru | en | de | fr | es | ar | tr | zh | ja | ko.
import { TILLAR } from "../xonalar/xonaLugat.js";

const row = (s) => Object.fromEntries(s.split("|").map((x, i) => [TILLAR[i], x.trim()]));

/**
 * Imo-ishora (gesture) turlari:
 *  bos — bir marta bosish; ikki — tez ikki marta; tez — tez-tez bosish (n marta); ushla — bosib ushlab turish (ms);
 *  sur — barmoq bilan surish (yo'nalish: up/down/side); aylantir — aylantirish (gradus); ishqala — u yoq-bu yoqqa (n marta);
 *  olib — narsani nishonga olib borish.
 */
export const IMO = {
  bos: { tur: "bos" },
  ikki: { tur: "ikki" },
  tez: { tur: "tez", n: 7 },
  ushla: { tur: "ushla", ms: 1600 },
  surUp: { tur: "sur", yon: "up" },
  surDown: { tur: "sur", yon: "down" },
  surSide: { tur: "sur", yon: "side" },
  aylantir: { tur: "aylantir", deg: 200 },
  egish: { tur: "aylantir", deg: 60, kalit: "egish" },
  ishqala: { tur: "ishqala", n: 5 },
  olib: { tur: "olib" },
};

/** Bo'limlar — har birida 4 ta harakat. Tartib — yo'ldagi tartib. */
export const BOLIMLAR = [
  { id: "uy", emoji: "🏠", nom: row("Uyda | Дома | At home | Zu Hause | À la maison | En casa | في البيت | Evde | 在家 | いえで | 집에서") },
  { id: "hovli", emoji: "⚽", nom: row("Hovlida | Во дворе | In the yard | Im Hof | Dans la cour | En el patio | في الساحة | Bahçede | 在院子里 | にわで | 마당에서") },
  { id: "yol", emoji: "🚗", nom: row("Yo‘lda | На дороге | On the road | Auf der Straße | Sur la route | En la carretera | على الطريق | Yolda | 在路上 | みちで | 길에서") },
  { id: "bayram", emoji: "🎈", nom: row("Bayramda | На празднике | At the party | Auf der Party | À la fête | En la fiesta | في الحفلة | Partide | 在派对上 | パーティーで | 파티에서") },
  { id: "oshxona", emoji: "🍞", nom: row("Oshxonada | На кухне | In the kitchen | In der Küche | À la cuisine | En la cocina | في المطبخ | Mutfakta | 在厨房 | だいどころで | 부엌에서") },
];

/**
 * Harakatlar. s — qisqa buyruq (o'rganishda), g — to'liq buyruq (o'yinda, kattalarga).
 * xona — shu bo'limdan keyin ochiladigan so'z xonasi (eski «O'yin xonalari»dan).
 */
export const HARAKATLAR = [
  // — uyda —
  { id: "open", bolim: "uy", imo: IMO.surSide,
    s: row("Och! | Открой! | Open! | Mach auf! | Ouvre ! | ¡Abre! | افتح! | Aç! | 开！ | あけて！ | 열어!"),
    g: row("Eshikni och! | Открой дверь! | Open the door! | Mach die Tür auf! | Ouvre la porte ! | ¡Abre la puerta! | افتح الباب! | Kapıyı aç! | 开门！ | ドアをあけて！ | 문을 열어!") },
  { id: "close", bolim: "uy", imo: IMO.surSide,
    s: row("Yop! | Закрой! | Close! | Mach zu! | Ferme ! | ¡Cierra! | أغلق! | Kapat! | 关！ | しめて！ | 닫아!"),
    g: row("Eshikni yop! | Закрой дверь! | Close the door! | Mach die Tür zu! | Ferme la porte ! | ¡Cierra la puerta! | أغلق الباب! | Kapıyı kapat! | 关门！ | ドアをしめて！ | 문을 닫아!") },
  { id: "lighton", bolim: "uy", imo: IMO.bos,
    s: row("Yoq! | Включи! | Turn on! | Mach an! | Allume ! | ¡Enciende! | أشعل! | Yak! | 开灯！ | つけて！ | 켜!"),
    g: row("Chiroqni yoq! | Включи свет! | Turn on the light! | Mach das Licht an! | Allume la lumière ! | ¡Enciende la luz! | أشعل الضوء! | Işığı yak! | 把灯打开！ | でんきをつけて！ | 불을 켜!") },
  { id: "lightoff", bolim: "uy", imo: IMO.bos,
    s: row("O‘chir! | Выключи! | Turn off! | Mach aus! | Éteins ! | ¡Apaga! | أطفئ! | Söndür! | 关灯！ | けして！ | 꺼!"),
    g: row("Chiroqni o‘chir! | Выключи свет! | Turn off the light! | Mach das Licht aus! | Éteins la lumière ! | ¡Apaga la luz! | أطفئ الضوء! | Işığı söndür! | 把灯关掉！ | でんきをけして！ | 불을 꺼!") },
  // — hovlida —
  { id: "kick", bolim: "hovli", imo: IMO.surUp,
    s: row("Tep! | Ударь! | Kick! | Schieß! | Frappe ! | ¡Patea! | اركل! | Vur! | 踢！ | けって！ | 차!"),
    g: row("To‘pni tep! | Ударь по мячу! | Kick the ball! | Schieß den Ball! | Frappe le ballon ! | ¡Patea la pelota! | اركل الكرة! | Topa vur! | 踢球！ | ボールをけって！ | 공을 차!") },
  { id: "throw", bolim: "hovli", imo: IMO.surUp,
    s: row("Ot! | Брось! | Throw! | Wirf! | Lance ! | ¡Lanza! | ارمِ! | At! | 扔！ | なげて！ | 던져!"),
    g: row("To‘pni savatga ot! | Брось мяч в корзину! | Throw the ball! | Wirf den Ball! | Lance la balle ! | ¡Lanza la pelota! | ارمِ الكرة! | Topu at! | 扔球！ | ボールをなげて！ | 공을 던져!") },
  { id: "jump", bolim: "hovli", imo: IMO.bos,
    s: row("Sakra! | Прыгай! | Jump! | Spring! | Saute ! | ¡Salta! | اقفز! | Zıpla! | 跳！ | ジャンプ！ | 점프!"),
    g: row("Baland sakra! | Прыгай высоко! | Jump high! | Spring hoch! | Saute très haut ! | ¡Salta alto! | اقفز عاليًا! | Yükseğe zıpla! | 跳高高！ | たかくジャンプ！ | 높이 점프해!") },
  { id: "run", bolim: "hovli", imo: IMO.tez,
    s: row("Yugur! | Беги! | Run! | Lauf! | Cours ! | ¡Corre! | اركض! | Koş! | 跑！ | はしって！ | 달려!"),
    g: row("Tez yugur! | Беги быстро! | Run fast! | Lauf schnell! | Cours vite ! | ¡Corre rápido! | اركض بسرعة! | Hızlı koş! | 快跑！ | はやくはしって！ | 빨리 달려!") },
  // — yo'lda —
  { id: "drive", bolim: "yol", imo: IMO.ushla,
    s: row("Hayda! | Поехали! | Drive! | Fahr! | Conduis ! | ¡Maneja! | قُد! | Sür! | 开车！ | うんてんして！ | 운전해!"),
    g: row("Mashinani hayda! | Веди машину! | Drive the car! | Fahr das Auto! | Conduis la voiture ! | ¡Maneja el coche! | قُد السيارة! | Arabayı sür! | 开小汽车！ | くるまをうんてんして！ | 자동차를 운전해!") },
  { id: "turn", bolim: "yol", imo: IMO.aylantir,
    s: row("Bura! | Поверни! | Turn! | Dreh! | Tourne ! | ¡Gira! | أدِر! | Çevir! | 转！ | まわして！ | 돌려!"),
    g: row("Rulni bura! | Поверни руль! | Turn the wheel! | Dreh das Lenkrad! | Tourne le volant ! | ¡Gira el volante! | أدِر المقود! | Direksiyonu çevir! | 转方向盘！ | ハンドルをまわして！ | 핸들을 돌려!") },
  { id: "stop", bolim: "yol", imo: IMO.bos,
    s: row("To‘xta! | Стоп! | Stop! | Stopp! | Stop ! | ¡Para! | قف! | Dur! | 停！ | とまって！ | 멈춰!"),
    g: row("Mashinani to‘xtat! | Останови машину! | Stop the car! | Halt das Auto an! | Arrête la voiture ! | ¡Para el coche! | أوقف السيارة! | Arabayı durdur! | 把车停下！ | くるまをとめて！ | 차를 멈춰!") },
  { id: "ride", bolim: "yol", imo: IMO.tez,
    s: row("Pedalni ayla! | Крути педали! | Ride! | Fahr Rad! | Pédale ! | ¡Pedalea! | اركب! | Pedal çevir! | 骑！ | こいで！ | 타!"),
    g: row("Velosipedni hayda! | Катайся на велосипеде! | Ride the bike! | Fahr Fahrrad! | Fais du vélo ! | ¡Monta en bici! | اركب الدراجة! | Bisiklete bin! | 骑自行车！ | じてんしゃをこいで！ | 자전거를 타!") },
  // — bayramda —
  { id: "blow", bolim: "bayram", imo: IMO.ushla,
    s: row("Shishir! | Надуй! | Blow! | Puste! | Gonfle ! | ¡Infla! | انفخ! | Şişir! | 吹！ | ふくらませて！ | 불어!"),
    g: row("Sharni shishir! | Надуй шарик! | Blow up the balloon! | Blas den Ballon auf! | Gonfle le ballon ! | ¡Infla el globo! | انفخ البالون! | Balonu şişir! | 吹气球！ | ふうせんをふくらませて！ | 풍선을 불어!") },
  { id: "pop", bolim: "bayram", imo: IMO.bos,
    s: row("Yor! | Лопни! | Pop! | Platzen lassen! | Éclate ! | ¡Revienta! | افقع! | Patlat! | 扎破！ | わって！ | 터뜨려!"),
    g: row("Sharni yor! | Лопни шарик! | Pop the balloon! | Lass den Ballon platzen! | Éclate le ballon ! | ¡Revienta el globo! | افقع البالون! | Balonu patlat! | 扎破气球！ | ふうせんをわって！ | 풍선을 터뜨려!") },
  { id: "clap", bolim: "bayram", imo: IMO.ikki,
    s: row("Qarsak! | Хлопни! | Clap! | Klatsch! | Applaudis ! | ¡Aplaude! | صفّق! | Alkışla! | 拍手！ | パチパチ！ | 박수!"),
    g: row("Qarsak chal! | Хлопай в ладоши! | Clap your hands! | Klatsch in die Hände! | Tape dans tes mains ! | ¡Aplaude con las manos! | صفّق بيديك! | Ellerini çırp! | 拍拍手！ | てをたたいて！ | 박수를 쳐!") },
  { id: "dance", bolim: "bayram", imo: IMO.ishqala,
    s: row("Raqs tush! | Танцуй! | Dance! | Tanz! | Danse ! | ¡Baila! | ارقص! | Dans et! | 跳舞！ | おどって！ | 춤춰!"),
    g: row("Men bilan raqs tush! | Танцуй со мной! | Dance with me! | Tanz mit mir! | Danse avec moi ! | ¡Baila conmigo! | ارقص معي! | Benimle dans et! | 和我一起跳舞！ | いっしょにおどって！ | 나랑 춤춰!") },
  // — oshxonada —
  { id: "pour", bolim: "oshxona", imo: IMO.egish,
    s: row("Quy! | Налей! | Pour! | Gieß! | Verse ! | ¡Sirve! | اسكب! | Doldur! | 倒！ | そそいで！ | 부어!"),
    g: row("Stakanga suv quy! | Налей воды! | Pour the water! | Gieß das Wasser ein! | Verse l’eau ! | ¡Sirve el agua! | اسكب الماء! | Bardağı doldur! | 倒水！ | みずをそそいで！ | 물을 부어!") },
  { id: "wash", bolim: "oshxona", imo: IMO.ishqala,
    s: row("Yuv! | Помой! | Wash! | Wasch! | Lave ! | ¡Lava! | اغسل! | Yıka! | 洗！ | あらって！ | 씻어!"),
    g: row("Qo‘lingni yuv! | Помой руки! | Wash your hands! | Wasch deine Hände! | Lave tes mains ! | ¡Lávate las manos! | اغسل يديك! | Ellerini yıka! | 洗手！ | てをあらって！ | 손을 씻어!") },
  { id: "cut", bolim: "oshxona", imo: IMO.surDown,
    s: row("Kes! | Режь! | Cut! | Schneid! | Coupe ! | ¡Corta! | اقطع! | Kes! | 切！ | きって！ | 잘라!"),
    g: row("Nonni kes! | Порежь хлеб! | Cut the bread! | Schneid das Brot! | Coupe le pain ! | ¡Corta el pan! | اقطع الخبز! | Ekmeği kes! | 切面包！ | パンをきって！ | 빵을 잘라!") },
  { id: "eat", bolim: "oshxona", imo: IMO.olib,
    s: row("Ye! | Ешь! | Eat! | Iss! | Mange ! | ¡Come! | كُل! | Ye! | 吃！ | たべて！ | 먹어!"),
    g: row("Olmani ye! | Съешь яблоко! | Eat the apple! | Iss den Apfel! | Mange la pomme ! | ¡Cómete la manzana! | كُل التفاحة! | Elmayı ye! | 吃苹果！ | りんごをたべて！ | 사과를 먹어!") },
];

/** Bo'lim tugagach ochiladigan so'z xonasi (eski o'yin xonalari — narsalar nomini o'rganish). */
export const BOLIM_XONA = { uy: "bolalar", hovli: "hovli", yol: "shahar", bayram: "men", oshxona: "oshxona" };

/** Ustozning gaplari — izoh tilida (uz, ru, en). {t} — o'rganiladigan tildagi buyruq, {i} — uning ma'nosi. */
export const IZOH_H = {
  organIntro: { uz: "Yangi harakatlarni o‘rganamiz! Men ko‘rsataman, keyin sen o‘zing bajarasan.", ru: "Учим новые действия! Я покажу, а потом ты сделаешь сам.", en: "Let’s learn new actions! I’ll show you, then you do it yourself.", de: "Wir lernen neue Bewegungen! Ich zeige sie dir, dann machst du sie selbst.", es: "¡Aprendemos acciones nuevas! Yo te las enseño y después las haces tú."},
  manosi: { uz: "{i} — {t}", ru: "{i} — {t}", en: "{i} — {t}", de: "{i} – {t}", es: "{i}: {t}"},
  qara: { uz: "Qara!", ru: "Смотри!", en: "Look!", de: "Schau!", es: "¡Mira!"},
  sen: { uz: "Endi sen!", ru: "Теперь ты!", en: "Now you!", de: "Jetzt du!", es: "¡Ahora tú!"},
  barakalla: { uz: "Barakalla!", ru: "Молодец!", en: "Well done!", de: "Super gemacht!", es: "¡Muy bien!"},
  yana: { uz: "Yana bir urinib ko‘r!", ru: "Попробуй ещё раз!", en: "Try again!", de: "Versuch es noch einmal!", es: "¡Inténtalo otra vez!"},
  oynaIntro: { uz: "Endi o‘yin! Men nima desam, shuni bajar.", ru: "А теперь игра! Делай то, что я скажу.", en: "Now let’s play! Do what I say.", de: "Jetzt spielen wir! Mach, was ich sage.", es: "¡Ahora jugamos! Haz lo que yo diga."},
  tanla: { uz: "Rasmni tanla va bajar!", ru: "Выбери картинку и сделай!", en: "Choose the picture and do it!", de: "Such das Bild aus und mach es!", es: "¡Elige el dibujo y hazlo!"},
  emas: { uz: "Bu emas. {t} — bu «{i}».", ru: "Не это. {t} — это «{i}».", en: "Not this one. {t} means “{i}”.", de: "Das ist es nicht. {t} bedeutet „{i}“.", es: "Ese no. {t} significa «{i}»."},
  takrorIntro: { uz: "Takrorlaymiz! O‘rgangan harakatlarimizni eslaymiz.", ru: "Повторяем! Вспомним, что мы уже умеем.", en: "Let’s review! Let’s remember what we know.", de: "Wir wiederholen! Erinnern wir uns, was wir schon können.", es: "¡Repasamos! Recordemos lo que ya sabemos."},
  cheksizIntro: { uz: "Cheksiz o‘yin! Har to‘g‘ri javobdan keyin o‘yin tezlashadi.", ru: "Бесконечная игра! После каждого верного ответа будет быстрее.", en: "Endless game! It gets faster after every right answer.", de: "Endlosspiel! Nach jeder richtigen Antwort wird es schneller.", es: "¡Juego sin fin! Con cada respuesta correcta va más rápido."},
  vaqtTugadi: { uz: "Vaqt tugadi! Yana o‘ynaymizmi?", ru: "Время вышло! Сыграем ещё?", en: "Time is up! Shall we play again?", de: "Die Zeit ist um! Spielen wir noch einmal?", es: "¡Se acabó el tiempo! ¿Jugamos otra vez?"},
  bolimTugadi: { uz: "Ajoyib! Bo‘lim tugadi — yangi o‘yin ochildi!", ru: "Отлично! Раздел пройден — открылась новая игра!", en: "Great! Section complete — a new game is open!", de: "Toll! Der Abschnitt ist geschafft – ein neues Spiel ist offen!", es: "¡Genial! Terminaste la sección: ¡se abrió un juego nuevo!"},
  xonaIntro: { uz: "Endi narsalarning nomini o‘rganamiz. Xonaga kiramiz!", ru: "Теперь учим названия предметов. Заходим в комнату!", en: "Now let’s learn the names of things. Let’s go into the room!", de: "Jetzt lernen wir, wie die Dinge heißen. Gehen wir ins Zimmer!", es: "Ahora aprendemos cómo se llaman las cosas. ¡Entremos en la habitación!"},
  qulf: { uz: "Avval oldingi o‘yinni tugat!", ru: "Сначала пройди предыдущую игру!", en: "Finish the previous game first!", de: "Spiel zuerst das Spiel davor zu Ende!", es: "¡Primero termina el juego anterior!"},
  ertaga: { uz: "Bugungi darslar tugadi! Yangi bosqich ertaga ochiladi. Hozir o‘rganganlaringni qayta o‘ynashing mumkin.", ru: "На сегодня уроки закончились! Новый этап откроется завтра. Сейчас можно снова поиграть в пройденное.", en: "Today’s lessons are done! The next stage opens tomorrow. You can replay what you’ve learned now.", de: "Die Stunden für heute sind geschafft! Die nächste Stufe öffnet sich morgen. Jetzt kannst du das Gelernte noch einmal spielen.", es: "¡Las lecciones de hoy terminaron! La siguiente etapa se abre mañana. Ahora puedes volver a jugar lo que aprendiste."},
  bugunDars: { uz: "Bugungi darslar", ru: "Уроки на сегодня", en: "Today’s lessons", de: "Die Stunden für heute", es: "Las lecciones de hoy"},
  ertagaQisqa: { uz: "Ertaga", ru: "Завтра", en: "Tomorrow", de: "Morgen", es: "Mañana"},
  // imo-ishora maslahatlari
  bos: { uz: "Bir marta bos!", ru: "Нажми один раз!", en: "Tap once!", de: "Tipp einmal darauf!", es: "¡Toca una vez!"},
  ikki: { uz: "Tez ikki marta bos!", ru: "Нажми быстро два раза!", en: "Tap twice, quickly!", de: "Tipp schnell zweimal darauf!", es: "¡Toca dos veces, rápido!"},
  tez: { uz: "Tez-tez bos!", ru: "Нажимай быстро-быстро!", en: "Tap fast, again and again!", de: "Tipp schnell, immer wieder!", es: "¡Toca rápido, una y otra vez!"},
  ushla: { uz: "Bosib, ushlab tur!", ru: "Нажми и держи!", en: "Press and hold!", de: "Drück und halt fest!", es: "¡Mantén el dedo apretado!"},
  sur_up: { uz: "Barmog‘ing bilan yuqoriga sur!", ru: "Проведи пальцем вверх!", en: "Swipe up with your finger!", de: "Wisch mit dem Finger nach oben!", es: "¡Desliza el dedo hacia arriba!"},
  sur_down: { uz: "Barmog‘ing bilan pastga sur!", ru: "Проведи пальцем вниз!", en: "Swipe down with your finger!", de: "Wisch mit dem Finger nach unten!", es: "¡Desliza el dedo hacia abajo!"},
  sur_side: { uz: "Barmog‘ing bilan yonga sur!", ru: "Проведи пальцем в сторону!", en: "Swipe sideways with your finger!", de: "Wisch mit dem Finger zur Seite!", es: "¡Desliza el dedo hacia un lado!"},
  aylantir: { uz: "Barmog‘ing bilan aylantir!", ru: "Крути пальцем по кругу!", en: "Turn it round with your finger!", de: "Dreh es mit dem Finger im Kreis!", es: "¡Hazlo girar con el dedo!"},
  egish: { uz: "Ko‘zani barmog‘ing bilan stakan tomonga eg!", ru: "Наклони кувшин пальцем к стакану!", en: "Tip the jug toward the glass with your finger!", de: "Kipp den Krug mit dem Finger zum Glas!", es: "¡Inclina la jarra hacia el vaso con el dedo!"},
  ishqala: { uz: "U yoqqa-bu yoqqa sur!", ru: "Води пальцем туда-сюда!", en: "Move your finger back and forth!", de: "Fahr mit dem Finger hin und her!", es: "¡Mueve el dedo de un lado a otro!"},
  olib: { uz: "Olib borib, og‘ziga ber!", ru: "Перетащи ко рту!", en: "Drag it to the mouth!", de: "Zieh es zum Mund!", es: "¡Arrástralo hasta la boca!"},
};
