// REV529: til o'yinlari — anagramma, so'z zanjiri, imlo ovchisi, gap tuzish (o'zbek, rus, ingliz).
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { anagramYasa, anagramTogri, zanjirYasa, imloYasa, gapYasa, gapTogri } from "./tilRules.js";

function Tuzish({ bolaklar, tekshir, onYutdi, ajratgich = "", izoh, javob }) {   // plitkalarni bosib ketma-ket terish (anagramma va gap uchun umumiy)
  const [tan, setTan] = useState([]), [hol, setHol] = useState(""), [korsat, setKorsat] = useState(false);
  useEffect(() => { setTan([]); setHol(""); setKorsat(false); }, [bolaklar]);
  const bos = (i) => { if (hol === "ok" || tan.includes(i)) return; const y = [...tan, i]; setTan(y); setHol("");
    if (y.length === bolaklar.length) { if (tekshir(y.map((k) => bolaklar[k]))) { setHol("ok"); onYutdi(); } else setHol("xato"); } };
  return <div className="mq-oyin">
    <p className="mq-izoh">{izoh}</p>
    <div className="mq-ifoda" style={{ minHeight: 56, fontSize: ajratgich ? 18 : 24 }}>{tan.length ? tan.map((k) => bolaklar[k]).join(ajratgich) : <span>{__kbUi("Bo‘laklarni tartib bilan bosing")}</span>}</div>
    <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{bolaklar.map((b, i) => <button key={i} type="button" onClick={() => bos(i)} disabled={tan.includes(i)}
      style={{ minWidth: ajratgich ? 0 : 46, padding: "0 12px", opacity: tan.includes(i) ? 0.3 : 1, fontSize: ajratgich ? 16 : 22 }}>{b}</button>)}</div>
    <div className="mq-amallar"><button type="button" onClick={() => { setHol(""); setTan(tan.slice(0, -1)); }}>⌫</button>
      <button type="button" onClick={() => { setHol(""); setTan([]); }}>↺</button>
      {hol !== "ok" && <button type="button" className="mq-havola" onClick={() => setKorsat(true)}>{__kbUi("Javobni ko‘rsatish")}</button>}</div>
    {hol === "ok" && <p className="mq-yutdi">🎉 {tan.map((k) => bolaklar[k]).join(ajratgich)}</p>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Hali to‘g‘ri emas — ⌫ bilan qaytarib, qayta urinib ko‘ring")}</p>}
    {korsat && hol !== "ok" && <p className="mq-izoh">💡 {javob}</p>}
  </div>;
}

export function Anagramma({ daraja, urug, onYutdi, til }) {
  const t = useMemo(() => anagramYasa(til, urug, daraja), [til, urug, daraja]);
  return <Tuzish bolaklar={t.harflar} tekshir={(x) => anagramTogri(til, x, t.soz)} onYutdi={onYutdi} javob={t.soz}
    izoh={`${__kbUi("Harflardan so‘z tuzing")} (${t.uzun} ${__kbUi("ta harf")})`} />;
}

export function GapTuzish({ daraja, urug, onYutdi, til }) {
  const t = useMemo(() => gapYasa(til, urug, daraja), [til, urug, daraja]);
  return <Tuzish bolaklar={t.sozlar} tekshir={(x) => gapTogri(x, t.qabul)} onYutdi={onYutdi} ajratgich=" " javob={t.gap} izoh={__kbUi("So‘zlardan to‘g‘ri gap tuzing")} />;
}

export function Zanjir({ daraja, urug, onYutdi, til }) {
  const t = useMemo(() => zanjirYasa(til, urug, daraja), [til, urug, daraja]);
  const [i, setI] = useState(0), [xato, setXato] = useState(null), [xatolar, setXatolar] = useState(0);
  useEffect(() => { setI(0); setXato(null); setXatolar(0); }, [t]);
  const tugadi = i >= t.qadamlar.length, q = t.qadamlar[i];
  const zanjir = t.qadamlar.slice(0, i).map((x) => x.oldingi).concat(tugadi ? [t.qadamlar.at(-1).variantlar[t.qadamlar.at(-1).togri]] : q ? [q.oldingi] : []);
  const bos = (k) => { if (tugadi) return; if (k === q.togri) { setXato(null); if (i + 1 >= t.qadamlar.length) onYutdi(); setI(i + 1); } else { setXato(k); setXatolar(xatolar + 1); } };
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Zanjirni davom ettiring: keyingi so‘z oldingisining oxirgi harfidan boshlanadi.")}</p>
    <div className="mq-zanjir">{zanjir.map((s, k) => <React.Fragment key={k}>{k > 0 && <i>→</i>}<span className={k === zanjir.length - 1 && !tugadi ? "is-joriy" : ""}>{s}</span></React.Fragment>)}{!tugadi && <><i>→</i><span className="is-savol">{q.harf.toUpperCase()}…</span></>}</div>
    {!tugadi && <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{q.variantlar.map((v, k) => <button key={v} type="button" onClick={() => bos(k)}
      style={{ padding: "0 14px", fontSize: 17, background: xato === k ? "#fdecea" : "#fff3c4" }}>{v}</button>)}</div>}
    {xato !== null && !tugadi && <p className="mq-xato">{__kbUi("Bu so‘z boshqa harfdan boshlanadi. Kerakli harf")}: «{q.harf.toUpperCase()}»</p>}
    <p className="mq-izoh">{i} / {t.qadamlar.length} · {__kbUi("Xatolar")}: {xatolar}</p>
    {tugadi && <p className="mq-yutdi">🎉 {__kbUi("Zanjir tayyor!")}</p>}
  </div>;
}

export function Imlo({ daraja, urug, onYutdi, til }) {
  const t = useMemo(() => imloYasa(til, urug, daraja, 8), [til, urug, daraja]);
  const [i, setI] = useState(0), [tan, setTan] = useState(null), [togri, setTogri] = useState(0);
  useEffect(() => { setI(0); setTan(null); setTogri(0); }, [t]);
  const tugadi = i >= t.length, q = t[i];
  const bos = (k) => { if (tan !== null) return; setTan(k); if (k === q.togri) setTogri(togri + 1); };
  const keyingi = () => { if (i + 1 >= t.length && togri >= 6) onYutdi(); setI(i + 1); setTan(null); };
  if (tugadi) return <div className="mq-oyin"><p className={togri >= 6 ? "mq-yutdi" : "mq-xato"}>{togri >= 6 ? "🎉 " : ""}{togri} / {t.length} {__kbUi("to‘g‘ri")}</p>
    {togri < 6 && <p className="mq-izoh">{__kbUi("Yulduz uchun kamida 6 ta to‘g‘ri javob kerak. «Boshqa topshiriq»ni bosib qayta urinib ko‘ring.")}</p>}</div>;
  return <div className="mq-oyin">
    <p className="mq-izoh">{i + 1} / {t.length} · {__kbUi("Qaysi biri to‘g‘ri yozilgan?")}</p>
    <div className="mq-sonlar" style={{ flexDirection: "column", width: "100%", maxWidth: 360 }}>{q.variantlar.map((v, k) => <button key={v} type="button" disabled={tan !== null} onClick={() => bos(k)}
      style={{ height: 56, fontSize: 21, background: tan === null ? "#fff3c4" : k === q.togri ? "#bfe6cd" : k === tan ? "#fdecea" : "#f4f6f9" }}>{v}</button>)}</div>
    {tan !== null && <><p className={tan === q.togri ? "mq-yutdi" : "mq-xato"} style={{ fontSize: 15 }}>{tan === q.togri ? "✅ " : "❌ "}{q.qoida}</p>
      <button type="button" className="mq-asosiy" onClick={keyingi}>{__kbUi("Keyingi")} ▶</button></>}
  </div>;
}
