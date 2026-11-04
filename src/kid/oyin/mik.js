// REV324: mikrofon holati («Ayt va och» o'yini uchun). Bir marta ruxsat berilmasa yoki mikrofon topilmasa — shu
// sessiyaning qolgan o'yinlarida mikrofon so'ralmaydi, bola bosib o'ynaydi.
import { speechRecognitionAvailable } from "../../speech/speakRules.js";

let mikYoqXotira = false;
/** Mikrofon bilan o'ynasa bo'ladimi: tashqi tinglash funksiyasi berilgan yoki brauzerda SpeechRecognition bor. */
export const mikBor = (onTingla) => !mikYoqXotira && (typeof onTingla === "function" || speechRecognitionAvailable());
/** Mikrofon ishlamadi — endi so'ralmaydi. */
export const mikYoqDeb = () => { mikYoqXotira = true; };
