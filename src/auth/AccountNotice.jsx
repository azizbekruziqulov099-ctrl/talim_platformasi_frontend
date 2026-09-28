import React, { useState } from "react";
import { uiText as __kbUi } from "../interface/interfaceRuntime.js";
import { useInterface as useKbInterfaceLocale } from "../interface/InterfacePreferences.jsx";
import { ROLE_NAMES, accountRisk, accountRole, loginRole, roleMismatch } from "./loginMemory.js";
import "./kabutar-login.css";

const HIDE_KEY = "kabutar:account-notice-hidden:v1";
const hidden = () => { try { return window.sessionStorage.getItem(HIDE_KEY) || ""; } catch { return ""; } };
const hide = (value) => { try { window.sessionStorage.setItem(HIDE_KEY, value); } catch { /* optional */ } };

/** Tepadagi ingichka ogohlantirish — ishga xalaqit bermaydi, yopsa shu seansda chiqmaydi.
 *  1) Telegram ham, Gmail ham ulanmagan akkaunt yo'qolishi mumkin — ulangach o'zi yo'qoladi.
 *  2) Kirishda tanlangan rol akkaunt rolidan farq qilsa — rolni Sozlamalardan o'zgartirish mumkin. */
export default function AccountNotice({ user, onOpenSettings }) {
  useKbInterfaceLocale();
  const risk = accountRisk(user);
  const chosen = loginRole();
  const mismatch = roleMismatch(user, chosen);
  const kind = risk ? "risk" : mismatch ? `role:${chosen}` : "";
  const [closed, setClosed] = useState(hidden);
  if (!kind || closed === kind) return null;
  const text = risk
    ? __kbUi("Akkauntingiz Telegram yoki Gmail’ga ulanmagan — parol unutilsa hisob yo‘qolishi mumkin. Ulang, shunda bu ogohlantirish yo‘qoladi.")
    : __kbUi(`Siz «${ROLE_NAMES[accountRole(user)] || "—"}» sifatida ro‘yxatdasiz, kirishda «${ROLE_NAMES[chosen]}» tanlandi. Rolni Sozlamalar → Rolim bo‘limida o‘zgartirasiz.`);
  return <div className={`kb-account-notice ${risk ? "is-risk" : ""}`} role="status">
    <span aria-hidden="true">{risk ? "⚠️" : "ℹ️"}</span>
    <p>{text}</p>
    {onOpenSettings && <button type="button" className="kb-account-notice-action" onClick={onOpenSettings}>{risk ? __kbUi("Ulash") : __kbUi("Sozlamalar")}</button>}
    <button type="button" className="kb-account-notice-close" aria-label={__kbUi("Yopish")} onClick={() => { hide(kind); setClosed(kind); }}>×</button>
  </div>;
}
