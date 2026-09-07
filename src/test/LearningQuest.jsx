import React, { useMemo } from "react";
import "./learning-quest.css";
import { QUESTS, questKey, questProgress, testResultLevel } from "./learningQuestRules.js";

export { questProgress, testResultLevel } from "./learningQuestRules.js";

/**
 * Yengil test sarguzashti: timer, canvas, video va doimiy animatsiya yo‘q.
 * TestTab faqat joriy raqamlarni beradi; akademik bahoni backend hisoblaydi.
 */
const LearningQuest = React.memo(function LearningQuest({
  grade,
  totalQuestions = 25,
  answeredCount = 0,
  correctCount = 0,
  finished = false,
}) {
  const quest = QUESTS[questKey(grade)];
  const progress = useMemo(
    () => questProgress({ totalQuestions, answeredCount, correctCount }),
    [totalQuestions, answeredCount, correctCount],
  );
  const finalPercent = finished
    ? Math.round((progress.correct / progress.total) * 100)
    : progress.percent;
  const result = testResultLevel(finalPercent);
  const ageIndex = questKey(grade) === "junior" ? 0 : questKey(grade) === "middle" ? 1 : 2;
  const outcome = result.outcomes[ageIndex];

  return (
    <section className={`learning-quest learning-quest--${questKey(grade)}`} aria-label={quest.title}>
      <header className="learning-quest__header">
        <span className="learning-quest__icon" aria-hidden="true">{quest.icon}</span>
        <div>
          <h2>{quest.title}</h2>
          <p>{quest.subtitle}</p>
        </div>
        <strong>{progress.answered}/{progress.total}</strong>
      </header>

      <div className="learning-quest__bar" aria-label={`Test ${Math.round(progress.answered / progress.total * 100)} foiz bajarildi`}>
        <span style={{ width: `${Math.round(progress.answered / progress.total * 100)}%` }} />
      </div>

      <ol className="learning-quest__stages">
        {quest.stages.map((label, index) => {
          const opened = index < progress.openedStages || finished;
          const active = !finished && index === progress.openedStages;
          return (
            <li key={label} className={opened ? "is-open" : active ? "is-active" : ""}>
              <span>{opened ? "✓" : index + 1}</span>
              <b>{label}</b>
              <small>{opened ? "Ochildi" : active ? `Yana ${progress.questionsToNext} savol` : "Navbatda"}</small>
            </li>
          );
        })}
      </ol>

      {finished && (
        <div className={`learning-quest__result is-${result.tone}`} role="status">
          <div><strong>{finalPercent}%</strong><span>{outcome} · {result.label}</span></div>
          <p>
            {finalPercent >= 70
              ? "Bosqich yakunlandi. Keyingi urinishda yangi daraja ochiladi."
              : "Xato savollar asosida qisqa qayta mustahkamlash yo‘li tayyorlanadi."}
          </p>
        </div>
      )}
    </section>
  );
});

export default LearningQuest;
