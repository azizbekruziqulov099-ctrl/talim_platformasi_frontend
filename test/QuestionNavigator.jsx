import React, { useId, useState } from 'react';
import { uiText as t } from '../interface/interfaceRuntime.js';
import './questionNavigator.css';

export default function QuestionNavigator({ questions, answers, remaining, onJump, onStop, onFinish }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const answered = questions.filter(question => answers[question.id] !== undefined).length;
  const firstUnanswered = questions.findIndex(question => answers[question.id] === undefined);
  const jump = index => {
    setExpanded(false);
    // Scroll after the expanded panel has collapsed so it cannot cover the question.
    requestAnimationFrame(() => onJump(index));
  };
  return <nav className="test-question-nav" aria-label={t('Test savollari')}>
    <div className="test-question-status">
      <span>{answered} / {questions.length} {t('javob berildi')}</span>
      {remaining !== null && <time className={remaining <= 30 ? 'is-urgent' : ''}>⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</time>}
      <button type="button" onClick={onStop}>{t('To‘xtatish')}</button>
    </div>
    <button type="button" className="test-question-toggle" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>
      <span>{t('Savol raqamlari')} ({questions.length})</span><span>{t(expanded ? 'Yig‘ish ↑' : 'Ochish ↓')}</span>
    </button>
    <div id={id} className="test-question-grid" hidden={!expanded}>
      {questions.map((question, index) => <button type="button" key={question.id}
        className={answers[question.id] !== undefined ? 'is-answered' : ''}
        aria-label={t(`${index + 1}-savol`) + (answers[question.id] !== undefined ? ` — ${t('javob berilgan')}` : '')}
        onClick={() => jump(index)}>{index + 1}</button>)}
    </div>
    <div className="test-question-actions">
      <button type="button" onClick={() => jump(0)}>{t('↑ Birinchi savol')}</button>
      <button type="button" disabled={firstUnanswered < 0} onClick={() => jump(firstUnanswered)}>{t('Javobsiz savol')}</button>
      <button type="button" className="test-question-finish" onClick={onFinish}>{t('Yakunlash')}</button>
    </div>
  </nav>;
}
