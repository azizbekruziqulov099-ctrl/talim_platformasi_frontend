import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";


const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
const arena = readFileSync(new URL("./TestGameArena.jsx", import.meta.url), "utf8");
const arenaStyles = readFileSync(new URL("./testGames.css", import.meta.url), "utf8");
const rules = readFileSync(new URL("./testGameRules.js", import.meta.url), "utf8");


test("test setup exposes classic, exam and game launch paths", () => {
  assert.match(app, /testUslubiniTanla\("bir_bir"\)/);
  assert.match(app, /testUslubiniTanla\("hammasi"\)/);
  assert.match(app, /testUslubiniTanla\("oyin"\)/);
  assert.match(app, /<GameModePicker/);
  assert.match(app, /testniBoshlash\(n\)/);
});


test("game availability and ordinary attempts are server owned", () => {
  assert.match(app, /\/api\/oyin\/mavjudligi/);
  assert.match(app, /data\.attempt_id/);
  assert.match(app, /attempt_id: testUrinishIdRef\.current/);
  assert.match(app, /\/api\/oyin\/kunlik-kirish/);
});


test("arena handles retry-safe actions, terminal replay and final feedback", () => {
  assert.match(arena, /action_id: options\.actionId \|\| actionId\(\)/);
  assert.match(arena, /isGameTerminalResponse\(data\)/);
  assert.match(arena, /pendingResult/);
  assert.match(arena, /Natijani ko'rish/);
  assert.match(arena, /onFinished/);
  assert.match(arena, /stopReadRef/);
  assert.match(arena, /GAME_FEEDBACK_HOLD_MS/);
  assert.match(arena, /feedbackTransition/);
  assert.match(arena, /feedbackCountdown/);
});


test("server readiness owns countdown start and pending feedback has no timer", () => {
  assert.match(arena, /\/api\/oyin\/tayyor/);
  assert.match(arena, /readyRequestsRef/);
  assert.match(arena, /timerCycle/);
  assert.match(arena, /resumeReadyAfterStopRef/);
  assert.match(arena, /readyGenerationRef/);
  assert.match(arena, /autoReadPromisesRef\.current\.delete\(activationKey\)/);
  assert.match(arena, /config\.status === "waiting"/);
  assert.match(arena, /setSession\(pendingNext\)/);
  assert.match(arena, /gameQuestionTimerConfig/);
  assert.match(arena, /role="timer"/);
  assert.match(arena, /role="progressbar"/);
});


test("timeout is one idempotent server action with life and game-over handling", () => {
  assert.match(arena, /\/api\/oyin\/\$\{isTimeout \? "vaqt-tugadi" : "javob"\}/);
  assert.match(arena, /timeoutActionRef/);
  assert.match(arena, /record\.sent = true/);
  assert.match(arena, /record\.manualRequired/);
  assert.match(arena, /QUESTION_TIME_EXPIRED/);
  assert.match(arena, /TIMER_STILL_ACTIVE/);
  assert.match(arena, /Serverga qayta yuborish/);
  assert.match(arena, /livesRemaining/);
  assert.match(arena, /pendingTerminal/);
  assert.match(arena, /isFailureTerminal\(data\)/);
  assert.match(arena, /initialFailure/);
  assert.match(arena, /Vaqt tugadi/);
});


test("junior auto-read waits for voice and every manual read includes MCQ options", () => {
  assert.match(arena, /shouldAutoReadGameQuestion/);
  assert.match(arena, /autoReadPromisesRef/);
  assert.match(arena, /Promise\.resolve\(readRef\.current\(readText\)\)/);
  assert.match(arena, /GAME_AUTO_READ_MAX_WAIT_MS/);
  assert.match(arena, /question\.options/);
});


test("every regular and Boss question renders four-choice gameplay inside the scene", () => {
  assert.match(arena, /className=\{`game-stage game-stage-\$\{mode\}/);
  assert.match(arena, /<GameScene mode=\{mode\} question=\{question\} feedback=\{feedback\} \/>/);
  assert.match(arena, /<div className="game-stage-content">/);
  assert.match(arena, /<main[\s\S]*game-question-in-scene[\s\S]*<div className="game-options"/);
  assert.match(arena, /aria-label=\{isBoss \? "Boss javob variantlari" : "Javob variantlari"\}/);
  assert.doesNotMatch(arena, /className="game-written-answer"/);
  assert.doesNotMatch(arena, /if \(question\.is_boss\) return String\(question\.question/);
  assert.doesNotMatch(`${app}\n${arena}\n${rules}`, /yozma Boss|imkonli yozma|qisqa yozma javob/);
  assert.match(app, /Har 5-savol 4 variantli Boss, 3 jon/);
  assert.match(rules, /bossAttempts: 1/g);
});


test("all modes expose server-owned three-slot lives and immersive internal scrolling", () => {
  assert.match(arena, /function GameLivesHud/);
  assert.match(arena, /<GameLivesHud mode=\{mode\} livesRemaining=\{livesRemaining\} feedback=\{feedback\} \/>/);
  assert.match(arena, /gameLivesRemaining\(feedback, question, session\)/);
  assert.match(arena, /Array\.from\(\{ length: maxLives \}/);
  assert.match(arena, /lifeGained: Boolean\(data\.life_gained/);
  assert.match(arena, /livesBefore: data\.lives_before \?\? previousLives/);
  assert.match(arena, /maxLives: data\.max_lives/);
  assert.match(arena, /levelCompleted: Boolean\(data\.level_completed \|\| data\.round_completed\)/);
  assert.match(arenaStyles, /\.test-game-arena \{[\s\S]*display: flex;[\s\S]*overflow: hidden;/);
  assert.match(arenaStyles, /\.game-stage-content \{[\s\S]*overflow-y: auto;/);
  assert.match(arenaStyles, /\.game-stage-bridge \.game-options button::before/);
  assert.match(arenaStyles, /bridge-answer-fall/);
  assert.match(arenaStyles, /rope-snap-restore/);
  assert.match(arenaStyles, /@media \(min-width: 761px\)[\s\S]*\.detective-avatar,[\s\S]*\.city-builder \{ display: none; \}/);
  assert.match(arenaStyles, /\.game-stage-millionaire \.game-question-heading/);
});


test("App voice promise settles and stale audio handlers are removed", () => {
  assert.match(app, /const ovozPromiseRef = useRef\(null\)/);
  assert.match(app, /audio\.__samTmPromise = new Promise/);
  assert.match(app, /audio\.onended = null/);
  assert.match(app, /audio\.removeAttribute\("src"\)/);
  assert.match(app, /ovozPromiseRef\.current\(\{ status: "stopped" \}\)/);
});
