// REV98: jonli rasmlar (SVG ichida animatsiya, JavaScript kerak emas). Excel'da rasm bo'lmasa — so'zga qarab shu rasmlar chiqadi.
import hello from "./stickers/en34-u1-hello.svg";
import red from "./stickers/en34-u3-red.svg";
import cat from "./stickers/en34-u4-cat.svg";
import big from "./stickers/en34-u5-big.svg";
import small from "./stickers/en34-u5-small.svg";
import three from "./stickers/en34-u5-three.svg";
import apple from "./stickers/en34-u8-apple.svg";
import jump from "./stickers/en56-u8-can-jump.svg";

export const STICKERS = { hello, red, cat, big, small, three, apple, jump };
export const stickerUrl = (key) => STICKERS[key] || null;
