// REV171: «Shu yerdamisan?» — bola javob bermasa ustoz 1–2 marta so'raydi, yordam beradi, keyin tasalli berib davom etadi.
// Bola ilovadan chiqib qaytsa — «Qaytding! Davom etamiz». Hamma izoh va o'rganiladigan tillarda.
export const K = {
  bormi: "Shu yerdamisan? Qani, javobni bos.",
  yordam: "Yordam beraman: to'g'ri javob yonib turibdi.",
  tasalli: "Hechqisi yo'q! To'g'ri javob — mana bu. Keyingisiga o'tamiz.",
  qaytdi: "Qaytding! Qani, davom etamiz.",
  oyinOt: "Hechqisi yo'q, bu — {p}. Keyingisiga o'tamiz!",
  oyinBormi: "Shu yerdamisan? Barmog'ing bilan bos: {p}",
};
const T = {
  ru: ["Ты здесь? Давай, нажми на ответ.", "Я помогу: правильный ответ светится.", "Ничего страшного! Правильный ответ — вот этот. Идём дальше.", "Ты вернулся! Давай продолжим.", "Ничего страшного, это — {p}. Идём дальше!", "Ты здесь? Нажми пальчиком: {p}"],
  en: ["Are you there? Come on, tap your answer.", "Let me help: the right answer is glowing.", "That's okay! The right answer is this one. Let's go on.", "You're back! Let's carry on.", "That's okay, this is {p}. Let's go on!", "Are you there? Tap with your finger: {p}"],
  de: ["Bist du da? Komm, tipp auf die Antwort.", "Ich helfe dir: Die richtige Antwort leuchtet.", "Macht nichts! Die richtige Antwort ist diese. Weiter geht's.", "Da bist du ja wieder! Machen wir weiter.", "Macht nichts, das ist {p}. Weiter geht's!", "Bist du da? Tipp mit dem Finger: {p}"],
  fr: ["Tu es là ? Allez, touche ta réponse.", "Je t'aide : la bonne réponse brille.", "Ce n'est pas grave ! La bonne réponse, c'est celle-ci. On continue.", "Te revoilà ! On continue.", "Ce n'est pas grave, c'est {p}. On continue !", "Tu es là ? Touche avec ton doigt : {p}"],
  es: ["¿Estás ahí? Vamos, toca tu respuesta.", "Te ayudo: la respuesta correcta brilla.", "¡No pasa nada! La respuesta correcta es esta. Seguimos.", "¡Ya volviste! Sigamos.", "No pasa nada, esto es {p}. ¡Seguimos!", "¿Estás ahí? Toca con el dedo: {p}"],
  tr: ["Orada mısın? Hadi, cevaba dokun.", "Sana yardım edeyim: doğru cevap parlıyor.", "Önemli değil! Doğru cevap bu. Devam ediyoruz.", "Geri döndün! Hadi devam edelim.", "Önemli değil, bu {p}. Devam ediyoruz!", "Orada mısın? Parmağınla dokun: {p}"],
  ar: ["هل أنت هنا؟ هيا، اضغط على الجواب.", "سأساعدك: الجواب الصحيح يلمع.", "لا بأس! الجواب الصحيح هو هذا. لنكمل.", "عدت! هيا نكمل.", "لا بأس، هذا {p}. لنكمل!", "هل أنت هنا؟ اضغط بإصبعك: {p}"],
  zh: ["你在吗？来，点一下答案。", "我来帮你：正确答案在发光。", "没关系！正确答案是这个。我们继续。", "你回来啦！我们继续吧。", "没关系，这是{p}。我们继续！", "你在吗？用手指点一下：{p}"],
  ja: ["そこに いるかな？ さあ、こたえを おしてね。", "てつだうね：ただしい こたえが ひかって いるよ。", "だいじょうぶ！ ただしい こたえは これだよ。つぎに いこう。", "おかえり！ つづけよう。", "だいじょうぶ、これは {p} だよ。つぎに いこう！", "そこに いるかな？ ゆびで おしてね：{p}"],
  ko: ["거기 있니? 자, 답을 눌러 봐.", "도와줄게: 정답이 반짝이고 있어.", "괜찮아! 정답은 이거야. 다음으로 가자.", "돌아왔구나! 계속하자.", "괜찮아, 이건 {p}이야. 다음으로 가자!", "거기 있니? 손가락으로 눌러 봐: {p}"],
};
const tartib = ["bormi", "yordam", "tasalli", "qaytdi", "oyinOt", "oyinBormi"];
/** GAPLAR[til] ga qo'shiladigan tarjimalar: { til: { "o'zbekcha shablon": "tarjima" } } */
export const DIQQAT_TARJIMA = Object.fromEntries(Object.entries(T).map(([til, arr]) => [til, Object.fromEntries(tartib.map((k, i) => [K[k], arr[i]]))]));

/** Javob kutish vaqtlari (ms): [so'rash, yordam, o'tib ketish]. Bog'cha — tezroq; maktab — sabrliroq, o'tib ketmaydi. */
export function kutishVaqtlari(kid, yosh = 5) {
  if (!kid) return [90000, 0, 0];
  return yosh <= 4 ? [12000, 24000, 36000] : [15000, 30000, 45000];
}
