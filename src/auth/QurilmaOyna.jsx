// REV486: profil boshqa qurilmada ochiq yoki qurilma ko'p almashtirilgani uchun darslar vaqtincha yopiq.
import "./qurilmaOyna.css";
import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { qurilmaKaliti, qurilmaNomi } from "./qurilma.js";

const vaqtMatn = (iso) => { try { const d = new Date(iso); return d.toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };

export default function QurilmaOyna({ apiBase, token, holat, onTayyor, onClose }) {
  const [h, setH] = useState(holat), [band, setBand] = useState(false);
  const otkaz = async () => {
    setBand(true);
    const r = await fetch(`${String(apiBase).replace(/\/+$/, "")}/api/qurilma/bogla`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, qurilma: qurilmaKaliti(), nomi: qurilmaNomi() }) }).then((x) => x.json()).catch(() => null);
    setBand(false);
    if (r?.holat === "ok") onTayyor?.(); else if (r) setH(r);
  };
  return <div className="qo-root"><div className="qo-ich">
    <div className="qo-belgi">{h.holat === "qulf" ? "⏳" : "📱"}</div>
    {h.holat === "qulf" ? <>
      <h2>{__kbUi("Darslar vaqtincha yopiq")}</h2>
      <p>{__kbUi("Profil qurilmalari juda ko‘p almashtirildi. Obunani bir necha kishi bo‘lishib ishlatmasligi uchun darslar shu vaqtgacha hech bir qurilmada ochilmaydi:")} <b>{vaqtMatn(h.gacha)}</b></p>
      <p className="qo-izoh">{__kbUi("30 kunda 2 marta almashtirish bepul; keyin 1 soat, 7 soat, 1 kun, 7 kun yopiladi.")}</p>
    </> : <>
      <h2>{__kbUi("Profil boshqa qurilmada ochiq")}</h2>
      <p>{__kbUi("Obunali profil faqat bitta qurilmada ishlaydi.")} {h.nomi ? <>{__kbUi("Hozir")}: <b>{h.nomi}</b>.</> : null} {__kbUi("Shu qurilmaga o‘tkazasizmi? Eski qurilmada darslar ochilmay qoladi.")}</p>
      <p className="qo-izoh">⚠️ {__kbUi("30 kunda 2 marta almashtirish bepul. Undan ko‘p almashtirilsa, darslar 1 soat, keyin 7 soat, 1 kun, 7 kunga yopiladi.")}</p>
      <button type="button" className="qo-btn" disabled={band} onClick={otkaz}>✅ {__kbUi("Shu qurilmaga o‘tkazish")}</button>
    </>}
    <button type="button" className="qo-ortga" onClick={onClose}>← {__kbUi("Ortga")}</button>
  </div></div>;
}
