// REV528: mantiq o'yinlari (davomi) — ketma-ketlik, mantiqiy jadval, Xanoy minorasi, chiroqlar.
import React, { useEffect, useMemo, useState } from "react";
import { uiText as __kbUi } from "../../interface/interfaceRuntime.js";
import { ketmaYasa, jadvalYasa, jadvalTogri, xanoyBosh, xanoyYur, xanoyTugadi, xanoyEngKam, chiroqYasa, chiroqBos, chiroqTugadi } from "./mantiq2Rules.js";

export function Ketma({ daraja, urug, onYutdi }) {
  const t = useMemo(() => ketmaYasa(urug, daraja), [urug, daraja]);
  const [tan, setTan] = useState(null);
  useEffect(() => { setTan(null); }, [t]);
  const bos = (k) => { if (tan !== null) return; setTan(k); if (k === t.togri) onYutdi(); };
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Qonuniyatni toping: keyingi son qaysi?")}</p>
    <div className="mq-ketma">{t.hadlar.map((h, i) => <span key={i}>{h}</span>)}<span className="is-savol">{tan !== null ? t.javob : "?"}</span></div>
    <div className="mq-sonlar" style={{ flexWrap: "wrap", justifyContent: "center" }}>{t.variantlar.map((v, k) => <button key={k} type="button" disabled={tan !== null} onClick={() => bos(k)}
      style={{ minWidth: 70, background: tan === null ? "#fff3c4" : k === t.togri ? "#bfe6cd" : k === tan ? "#fdecea" : "#f4f6f9" }}>{v}</button>)}</div>
    {tan !== null && <p className={tan === t.togri ? "mq-yutdi" : "mq-xato"}>{tan === t.togri ? "🎉 " : ""}{__kbUi("Qoida")}: {__kbUi(t.qoida)}</p>}
  </div>;
}

export function Jadval({ daraja, urug, onYutdi }) {
  const t = useMemo(() => jadvalYasa(urug, daraja), [urug, daraja]);
  const bosh = () => t.toifa.map(() => t.odamlar.map(() => t.toifa[0].qiymat.map(() => 0)));   // [toifa][odam][qiymat]: 0 bo'sh, 1 ✓, 2 ✗
  const [g, setG] = useState(bosh), [hol, setHol] = useState(""), [chizildi, setChizildi] = useState(() => new Set());
  useEffect(() => { setG(bosh()); setHol(""); setChizildi(new Set()); }, [t]); // eslint-disable-line react-hooks/exhaustive-deps
  const bos = (k, o, v) => { if (hol === "ok") return; setHol("");
    setG((eski) => { const y = eski.map((a) => a.map((b) => [...b])); const yangi = (y[k][o][v] + 1) % 3; y[k][o][v] = yangi;
      if (yangi === 1) { for (let x = 0; x < t.n; x += 1) { if (x !== v && y[k][o][x] === 0) y[k][o][x] = 2; if (x !== o && y[k][x][v] === 0) y[k][x][v] = 2; } }   // ✓ qo'yilganda qator va ustun avtomatik ✗
      return y; }); };
  const tekshir = () => { const belgi = g.map((a) => a.map((b) => (b.filter((x) => x === 1).length === 1 ? b.indexOf(1) : null)));
    if (jadvalTogri(belgi, t.yechim)) { setHol("ok"); onYutdi(); } else setHol(belgi.flat().includes(null) ? "chala" : "xato"); };
  return <div className="mq-oyin">
    <ol className="mq-ishora">{t.ishoralar.map((m, i) => <li key={i} className={chizildi.has(i) ? "is-chiz" : ""} onClick={() => setChizildi((s) => { const y = new Set(s); if (y.has(i)) y.delete(i); else y.add(i); return y; })}>{__kbUi(m)}</li>)}</ol>
    <div className="mq-jadvallar">{t.toifa.map((tf, k) => <table key={k} className="mq-jadval"><thead><tr><th />{tf.qiymat.map((q) => <th key={q}>{__kbUi(q)}</th>)}</tr></thead>
      <tbody>{t.odamlar.map((od, o) => <tr key={od}><th>{od}</th>{tf.qiymat.map((_, v) => <td key={v}><button type="button" onClick={() => bos(k, o, v)}
        className={g[k][o][v] === 1 ? "is-ha" : g[k][o][v] === 2 ? "is-yoq" : ""}>{g[k][o][v] === 1 ? "✓" : g[k][o][v] === 2 ? "✗" : ""}</button></td>)}</tr>)}</tbody></table>)}</div>
    <p className="mq-izoh">{__kbUi("Katakni bosing: ✓ — ha, ✗ — yo‘q. Ishorani bosib, ishlatilganini belgilab qo‘yishingiz mumkin.")}</p>
    <button type="button" className="mq-asosiy" onClick={tekshir} disabled={hol === "ok"}>{__kbUi("Tekshirish")}</button>
    {hol === "ok" && <p className="mq-yutdi">🎉 {__kbUi("Hammasi to‘g‘ri!")}</p>}
    {hol === "chala" && <p className="mq-xato">{__kbUi("Har kishiga har jadvalda bittadan ✓ qo‘ying")}</p>}
    {hol === "xato" && <p className="mq-xato">{__kbUi("Qaysidir ishoraga zid — ishoralarni qayta o‘qing")}</p>}
  </div>;
}

const HRANG = ["#E63946", "#FF8C1A", "#FFD23F", "#2DBE60", "#3A86FF"];
export function Xanoy({ daraja, urug, onYutdi }) {
  const n = [3, 4, 5][daraja];
  const [u, setU] = useState(() => xanoyBosh(n)), [tan, setTan] = useState(null), [yurish, setYurish] = useState(0), [xato, setXato] = useState(false);
  useEffect(() => { setU(xanoyBosh(n)); setTan(null); setYurish(0); setXato(false); }, [n, urug]);
  const tugadi = xanoyTugadi(u, n);
  const bos = (i) => { if (tugadi) return; setXato(false);
    if (tan === null) { if (u[i].length) setTan(i); return; }
    if (tan === i) { setTan(null); return; }
    const y = xanoyYur(u, tan, i); if (!y) { setXato(true); setTan(null); return; }
    setU(y); setTan(null); setYurish(yurish + 1); if (xanoyTugadi(y, n)) onYutdi(); };
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Hamma halqani o‘ng ustunga ko‘chiring. Katta halqa kichigining ustiga qo‘yilmaydi.")}</p>
    <div className="mq-xanoy">{u.map((ust, i) => <button key={i} type="button" onClick={() => bos(i)} className={tan === i ? "is-tanlov" : ""} aria-label={`${i + 1}`}>
      <i className="mq-xanoy-oq" />{ust.map((h, k) => <span key={h} style={{ width: `${28 + h * 13}%`, background: HRANG[h - 1], bottom: 10 + k * 22, outline: tan === i && k === ust.length - 1 ? "3px solid #13314f" : "none" }} />)}</button>)}</div>
    <p className="mq-izoh">{__kbUi("Yurishlar")}: <b>{yurish}</b> · {__kbUi("eng kami")}: {xanoyEngKam(n)}</p>
    {xato && <p className="mq-xato">{__kbUi("Bunday yurib bo‘lmaydi — katta halqa kichigining ustiga tushmaydi")}</p>}
    {tugadi && <p className="mq-yutdi">🎉 {yurish === xanoyEngKam(n) ? __kbUi("Eng kam yurishda — mukammal!") : __kbUi("Bajarildi! Kamroq yurishda ham urinib ko‘ring")}</p>}
  </div>;
}

export function Chiroq({ daraja, urug, onYutdi }) {
  const t = useMemo(() => chiroqYasa(urug, daraja), [urug, daraja]);
  const [g, setG] = useState(t.bosh), [soni, setSoni] = useState(0), [yordam, setYordam] = useState(false);
  useEffect(() => { setG(t.bosh); setSoni(0); setYordam(false); }, [t]);
  const tugadi = chiroqTugadi(g);
  const bos = (i, j) => { if (tugadi) return; const y = chiroqBos(g, i, j); setG(y); setSoni(soni + 1); if (chiroqTugadi(y)) onYutdi(); };
  const ish = new Set(t.yechim.map(([i, j]) => `${i}:${j}`));
  return <div className="mq-oyin">
    <p className="mq-izoh">{__kbUi("Hamma chiroqni o‘chiring. Bosilgan chiroq va uning 4 qo‘shnisi holatini almashtiradi.")}</p>
    <div className="mq-chiroq" style={{ gridTemplateColumns: `repeat(${t.n}, 1fr)`, maxWidth: t.n * 66 }}>{g.map((q, i) => q.map((v, j) => <button key={`${i}:${j}`} type="button" onClick={() => bos(i, j)}
      className={`${v ? "is-yoniq" : ""} ${yordam && soni === 0 && ish.has(`${i}:${j}`) ? "is-ishora" : ""}`}>{v ? "💡" : ""}</button>))}</div>
    <p className="mq-izoh">{__kbUi("Bosishlar")}: <b>{soni}</b> · {__kbUi("yetarli")}: {t.yechim.length}</p>
    {!tugadi && <div className="mq-amallar"><button type="button" className="mq-havola" onClick={() => { setG(t.bosh); setSoni(0); }}>↺ {__kbUi("Boshidan")}</button>
      <button type="button" className="mq-havola" onClick={() => { setG(t.bosh); setSoni(0); setYordam(true); }}>💡 {__kbUi("Yechimni ko‘rsat")}</button></div>}
    {yordam && soni === 0 && !tugadi && <p className="mq-izoh">{__kbUi("Ko‘k hoshiyali kataklarni bir martadan bosing (tartibi muhim emas).")}</p>}
    {tugadi && <p className="mq-yutdi">🎉 {__kbUi("Hamma chiroq o‘chdi!")}</p>}
  </div>;
}
