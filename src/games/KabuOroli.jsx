// REV686: «Kabu oroli» — o'yinlardan yig'ilgan tangaga orol quriladi. Hammasi qurilmada ishlaydi.
import React, { useEffect, useRef, useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { BINOLAR, HAMROHLAR, HAMROH_NARXI, binoDarajasi, binoNarxi, binoQur, hamrohOch, sandiqOch, sandiqTayyor, orolFoizi, yukla, saqla } from "./orolHolat.js";
import "./kabuOroli.css";

const rasm = (nom) => new URL(`../assets/kabu-olami/orol/${nom}.webp`, import.meta.url).href;
const ovoz = (nom) => new URL(`../assets/kabu-olami/ovoz/${nom}.mp3`, import.meta.url).href;
function chal(nom, balandlik = 0.7) {
  try { if (localStorage.getItem("kb_oyin_ovoz") === "0") return; } catch { /* xotira yo'q */ }
  try { const a = new Audio(ovoz(nom)); a.volume = balandlik; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch { /* ovozsiz */ }
}

export default function KabuOroli({ profil = "men", onClose }) {
  const [holat, setHolat] = useState(() => yukla(profil));
  const [tanlangan, setTanlangan] = useState(null);
  const [xabar, setXabar] = useState("");
  const [yangi, setYangi] = useState("");
  const birinchi = useRef(true);
  useEffect(() => { if (birinchi.current) { birinchi.current = false; chal("ayt_orolga_xush_kelibsiz", 0.9); return; } saqla(profil, holat); }, [holat, profil]);
  useEffect(() => { if (!xabar) return undefined; const t = setTimeout(() => setXabar(""), 2600); return () => clearTimeout(t); }, [xabar]);

  const qur = (id) => {
    const r = binoQur(holat, id);
    if (!r.ok) { chal("tugma"); setXabar(r.sabab === "tanga" ? `${__kbUi("Yana")} ${r.yetmaydi} ${__kbUi("tanga kerak. Test yechib yig'!")}` : __kbUi("Bu bino eng yuqori darajada!")); return; }
    setHolat(r.holat); setYangi(id); setTimeout(() => setYangi(""), 900);
    chal(binoDarajasi(holat, id) === 0 ? "bino_qoyildi" : "bino_daraja"); setTimeout(() => chal("ayt_yangi_bino", 0.9), 450);
  };
  const hamroh = (id) => {
    const r = hamrohOch(holat, id);
    if (!r.ok) { chal("tugma"); setXabar(`${__kbUi("Yana")} ${r.yetmaydi} ${__kbUi("tanga kerak. Test yechib yig'!")}`); return; }
    setHolat(r.holat); if (!r.tanlandi) chal("hamroh_ochildi");
  };
  const sandiq = () => {
    const r = sandiqOch(holat);
    if (!r.ok) { setXabar(__kbUi("Sandiq ertaga yana to'ladi!")); return; }
    setHolat(r.holat); chal("sandiq_ochildi"); setTimeout(() => chal("ayt_sovga", 0.9), 500);
    setXabar(`🎁 +${r.sovga} ${__kbUi("tanga")} · 🔥 ${r.olov} ${__kbUi("kun")}`);
  };
  const tayyor = sandiqTayyor(holat);
  const bino = tanlangan ? BINOLAR.find((b) => b.id === tanlangan) : null;
  const daraja = bino ? binoDarajasi(holat, bino.id) : 0;
  const narx = bino ? binoNarxi(holat, bino.id) : null;

  return (
    <div className="ko-root" role="dialog" aria-modal="true" aria-label={__kbUi("Kabu oroli")}>
      <header className="ko-bar">
        <button type="button" className="ko-yop" onClick={onClose} aria-label={__kbUi("Yopish")}>←</button>
        <b className="ko-nom">{__kbUi("Kabu oroli")} · {orolFoizi(holat)}%</b>
        <span className="ko-chip"><img src={rasm("tanga")} alt="" />{holat.tanga}</span>
        <span className="ko-chip"><img src={rasm("olov")} alt="" />{holat.olov}</span>
        <button type="button" className={`ko-sandiq ${tayyor ? "is-tayyor" : ""}`} onClick={sandiq} aria-label={__kbUi("Kunlik sandiq")}><img src={rasm(tayyor ? "sandiq_yopiq" : "sandiq_ochiq")} alt="" /></button>
      </header>
      <div className="ko-sahna">
        <div className="ko-orol" style={{ backgroundImage: `url(${rasm("orol")})` }}>
          {BINOLAR.map((b) => {
            const d = binoDarajasi(holat, b.id);
            return (
              <button key={b.id} type="button" className={`ko-bino ${d ? "" : "is-bosh"} ${tanlangan === b.id ? "is-tanlangan" : ""} ${yangi === b.id ? "is-yangi" : ""}`}
                style={{ left: `${b.x}%`, top: `${b.y}%` }} onClick={() => { setTanlangan(b.id); chal("tugma", 0.5); }} aria-label={`${__kbUi(b.nom)}, ${d}-${__kbUi("daraja")}`}>
                {d ? <img src={rasm(`bino_${b.id}_${d}`)} alt="" draggable={false} /> : <span aria-hidden="true">＋</span>}
              </button>
            );
          })}
          {holat.hamroh ? <img className="ko-hamroh-sahna" src={rasm(`hamroh_${holat.hamroh}`)} alt="" /> : null}
        </div>
      </div>
      <footer className="ko-past">
        {bino ? (
          <div className="ko-karta">
            <img src={rasm(`bino_${bino.id}_${Math.max(1, Math.min(3, daraja + (narx === null ? 0 : 1)))}`)} alt="" />
            <div><b>{__kbUi(bino.nom)}</b><small>{daraja ? `${daraja}-${__kbUi("daraja")}` : __kbUi("Hali qurilmagan")}</small></div>
            {narx === null ? <span className="ko-tola">★ {__kbUi("Eng zo'r")}</span>
              : <button type="button" className="ko-qur" disabled={holat.tanga < narx} onClick={() => qur(bino.id)}><img src={rasm("tanga")} alt="" />{narx} · {daraja ? __kbUi("Yaxshilash") : __kbUi("Qurish")}</button>}
          </div>
        ) : <p className="ko-maslahat">{__kbUi("Joyni bos va bino qur. Tanga test va o'yinlardan yig'iladi.")}</p>}
        <div className="ko-hamrohlar" aria-label={__kbUi("Hamrohlar")}>
          {HAMROHLAR.map((h) => {
            const bor = holat.hamrohlar.includes(h.id);
            return <button key={h.id} type="button" className={`${bor ? "is-bor" : ""} ${holat.hamroh === h.id ? "is-tanlangan" : ""}`} onClick={() => hamroh(h.id)} aria-label={__kbUi(h.nom)}>
              <img src={rasm(`hamroh_${h.id}`)} alt="" />{bor ? null : <small><img src={rasm("tanga")} alt="" />{HAMROH_NARXI}</small>}</button>;
          })}
        </div>
      </footer>
      {xabar ? <div className="ko-xabar" role="status">{xabar}</div> : null}
    </div>
  );
}
