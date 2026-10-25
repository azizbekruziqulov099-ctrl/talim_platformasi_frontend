import React from "react";
import TranslatedContent from "../interface/TranslatedContent.jsx";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { gradeLabel } from "./catalog.js";
import { topicTarget } from "./learnerTopicsRules.js";
import { capitalizeTopic, isReviewTopic } from "./kidTopics.js";
import { lessonDone, lessonStars } from "./kidProgress.js";
import { bobBoyicha } from "./fanGuruhlari.js";
import { darsYoli, ketmaKet } from "./darsYoli.js";

/**
 * REV174: Maktab (1–11 sinf) o'quvchisi — fan darslari bog'chadagi kabi o'quv yo'lida: dars → dars → dars → 📝 mashq → … → 🏆 bob imtihoni.
 * Darslar tartib bilan ochiladi (oldingisi o'tilmasa — ogohlantirib ochiladi: sinf boshqa mavzuda bo'lishi mumkin).
 * Har darsdan keyin — test va «Xatolar ustida ishlash» (repetitor kabi). O'tilgan dars — ✓ va yulduzlar.
 */
export default function MaktabYoli({ groups, current, type, erkin = false, openLesson, onOpenTest, onOpenAi }) {
  return groups.map((group) => {
    const done = (i) => { const t = group.mavzular[i]; return Boolean(t?.dars_bor && lessonDone(topicTarget(current, group, t, type).lesson_code)); };
    const yol = ketmaKet(group.mavzular, done);
    const navbat = yol.navbat >= 0 ? group.mavzular[yol.navbat] : null;
    const ochish = (topic, i) => {
      if (!erkin && !yol.ochiq[i] && !globalThis.confirm?.(T("Oldingi darslar hali o‘tilmagan. Tartib bilan o‘rgansangiz yaxshiroq tushunasiz. Baribir ochasizmi?"))) return;
      if (topic.dars_bor) openLesson(group, topic);
      else onOpenAi?.(topicTarget(current, group, topic, type));
    };
    const testOch = (list, ochiqMi) => {
      if (!onOpenTest || !list.length) return;
      if (!erkin && !ochiqMi && !globalThis.confirm?.(T("Avval shu bosqich darslarini o‘tish tavsiya etiladi. Baribir boshlaysizmi?"))) return;
      const first = list[0];
      onOpenTest({ ...topicTarget(current, group, first, type), topic_code: first.topic_codes[0], topic_codes: list.flatMap((t) => t.topic_codes), track: "review" });
    };
    return <div key={group.sinf} className="my-root">
      <div className="kt-yol-bosh my-bosh" role="status">
        <span className="kt-yol-xarita" aria-hidden="true">🗺️</span>
        <span className="kt-yol-matn"><b>{T(gradeLabel(type, group.sinf))}</b>
          <span className="kt-yol-chiziq" role="progressbar" aria-valuemin={0} aria-valuemax={yol.jami} aria-valuenow={yol.otildi}>
            <i style={{ width: `${yol.jami ? Math.max(3, Math.round((yol.otildi / yol.jami) * 100)) : 0}%` }} /></span>
          <small>✅ {yol.otildi} / {yol.jami} {T("dars")}</small></span>
        {navbat && <button type="button" className="my-davom" onClick={() => openLesson(group, navbat)}>
          ▶ {T("Davom etish")}: <TranslatedContent text={capitalizeTopic(navbat.nomi)} showStatus={false} /></button>}
      </div>
      {bobBoyicha(group.mavzular).map((b, bi) => {
        const asl = b.mavzular.map((m) => group.mavzular[m.raqam - 1]);
        const d = darsYoli(asl, (k) => ({ done: done(b.mavzular[k].raqam - 1) }), (t) => isReviewTopic(t.nomi));
        let tomon = 0;
        return <section key={`bob-${bi}`} className="my-bob">
          {b.bob && <h4 className="lt-bob-nom">📂 <TranslatedContent text={capitalizeTopic(b.bob)} showStatus={false} /> <small>{d.otildi}/{d.jami}</small></h4>}
          <ul className="kt-grid kt-yol is-maktab">{d.tugunlar.map((n) => {
            if (n.tur !== "dars") {
              const och = n.ochiq || erkin;
              return <li key={`${n.tur}-${n.bosqich}`} className={`kt-yol-tugun is-${n.tur} ${och ? "" : "is-locked"}`}>
                <button type="button" className="kt-yol-medal" disabled={!onOpenTest} onClick={() => testOch(n.mavzular, och)}
                  aria-label={T(n.tur === "imtihon" ? "Bob imtihoni" : "Mashq")}><span aria-hidden="true">{och ? (n.tur === "imtihon" ? "🏆" : "📝") : "🔒"}</span></button>
                <b>{n.tur === "imtihon" ? T("Bob imtihoni") : T("Mashq")}</b>
                <small>{n.mavzular.length} {T("mavzu bo‘yicha test")}</small>
              </li>;
            }
            const i = b.mavzular[n.i].raqam - 1;
            const topic = group.mavzular[i];
            const target = topicTarget(current, group, topic, type);
            const ok = done(i);
            const stars = ok ? lessonStars(target.lesson_code) : 0;
            const och = erkin || yol.ochiq[i];
            const keyingi = i === yol.navbat;
            const yon = (tomon++) % 2 ? "is-r" : "is-l";
            return <li key={`${topic.topic_codes?.[0] || topic.nomi}-${i}`} className={`kt-card my-card ${yon} ${ok ? "is-done" : ""} ${keyingi ? "is-next" : ""} ${och ? "" : "is-locked"}`}
              onClick={(e) => { if (!e.target.closest("button")) ochish(topic, i); }}>
              <span className="kt-no">{ok ? "✓" : och ? i + 1 : "🔒"}</span>
              {keyingi && <span className="kt-today">{T("Navbatdagi")}</span>}
              <p className="kt-title my-title"><TranslatedContent text={capitalizeTopic(topic.nomi)} showStatus={false} /></p>
              {isReviewTopic(topic.nomi) && <span className="kt-kind is-review">🔁 {T("Takrorlash")}</span>}
              {ok && topic.savol_soni > 0 && <span className="kt-stars" aria-label={`${stars} ⭐`}>{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</span>}
              <div className="kt-actions my-actions">
                {topic.dars_bor ? <button type="button" className="kt-learn" onClick={() => ochish(topic, i)}>{ok ? `🔁 ${T("Qayta")}` : `▶ ${T("Dars")}`}</button>
                  : onOpenAi && <button type="button" className="kt-play" onClick={() => ochish(topic, i)}>💬 {T("AI ustoz")}</button>}
                {topic.savol_soni > 0 && onOpenTest && (ok || !topic.dars_bor || erkin) && <button type="button" className="kt-play"
                  onClick={() => onOpenTest({ ...target, topic_code: topic.topic_codes[0] })}>📝 {T("Test")}</button>}
              </div>
            </li>;
          })}</ul>
        </section>;
      })}
    </div>;
  });
}
