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


test("arena handles retry-safe actions, terminal replay and floating scene feedback", () => {
  assert.match(arena, /action_id: options\.actionId \|\| actionId\(\)/);
  assert.match(arena, /isGameTerminalResponse\(data\)/);
  assert.match(arena, /pendingResult/);
  assert.match(arena, /Natija ochiladi/);
  assert.match(arena, /onFinished/);
  assert.match(arena, /stopReadRef/);
  assert.match(arena, /GAME_FEEDBACK_HOLD_MS/);
  assert.match(arena, /feedbackTransition/);
  assert.match(arena, /feedbackCountdown/);
  assert.match(arena, /<SceneFeedbackFX[\s\S]*feedback=\{feedback\}[\s\S]*transition=\{feedbackTransition\}/);
  assert.doesNotMatch(arena, /function gameAnswerFeedbackTitle/);
  assert.doesNotMatch(arena, /To'g'ri javob:/);
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
  assert.match(arena, /Qayta yuborish/);
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
  assert.match(arena, /onRead\(readText, \{ manual: true \}\)/);
  assert.match(arena, /readStatus === "oynamoqda"/);
});


test("every regular and Boss question renders four-choice gameplay inside the scene", () => {
  assert.match(arena, /className=\{`game-stage game-stage-\$\{mode\}/);
  assert.match(arena, /<GameScene mode=\{mode\} question=\{question\} feedback=\{feedback\} avatarProfile=\{avatarProfile\} \/>/);
  assert.match(arena, /<div className="game-stage-content">/);
  assert.match(arena, /<main[\s\S]*game-question-in-scene[\s\S]*className=\{`game-options/);
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
  assert.match(arenaStyles, /\.bridge-answer-course/);
  assert.match(arenaStyles, /bridge-real-pane-break/);
  assert.match(arenaStyles, /rope-snap-restore/);
  assert.match(arenaStyles, /@media \(min-width: 761px\)[\s\S]*\.detective-avatar,[\s\S]*\.city-builder \{ display: block; \}/);
  assert.match(arenaStyles, /\.game-stage-millionaire \.game-question-heading/);
});


test("lifelike player follows profile gender and age in every ordinary game", () => {
  for (const asset of [
    "adult_boy.webp", "adult_girl.webp", "child_boy.webp", "child_girl.webp",
    "preteen_boy.webp", "preteen_girl.webp", "teen_boy.webp", "teen_girl.webp",
  ]) assert.match(arena, new RegExp(asset.replace(".", "\\.")));
  for (const asset of [
    "adult_boy_sheet.webp", "adult_girl_sheet.webp", "child_boy_sheet.webp", "child_girl_sheet.webp",
    "preteen_boy_sheet.webp", "preteen_girl_sheet.webp", "teen_boy_sheet.webp", "teen_girl_sheet.webp",
  ]) assert.match(arena, new RegExp(asset.replace(".", "\\.")));
  assert.match(arena, /export function resolveGameAvatarProfile/);
  assert.match(arena, /profile\.tugilgan_sana/);
  assert.match(arena, /profile\.class \?\? profile\.sinf \?\? profile\.grade/);
  assert.match(arena, /avatar-render/);
  assert.match(arena, /profile=\{avatarProfile\}/g);
  assert.match(app, /playerProfile=\{\{ \.\.\.foydalanuvchi, jins: oyinQahramonJinsi/);
  assert.match(app, /onPlayerGenderChange=\{setOyinQahramonJinsi\}/);
  assert.match(arena, /spriteFrameCount: 9/);
  assert.match(arena, /data-sprite-frames=\{avatar\.spriteFrameCount\}/);
  assert.match(arenaStyles, /background-size: 900% 100%/);
  assert.match(arenaStyles, /@keyframes avatar-sprite-idle/);
  assert.match(arenaStyles, /@keyframes bridge-sprite-cross/);
  assert.match(arenaStyles, /37\.5% center[\s\S]*50% center[\s\S]*62\.5% center[\s\S]*75% center/);
  assert.match(arenaStyles, /@keyframes bridge-sprite-slip[\s\S]*87\.5% center/);
  assert.match(arenaStyles, /@keyframes avatar-natural-idle/);
  assert.match(arenaStyles, /@keyframes bridge-human-hang/);
  assert.match(arenaStyles, /\.game-stage-bridge \.game-options \{ grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(arena, /<div className="millionaire-host">/);
});


test("App voice has browser speech, visible state and safe cleanup", () => {
  assert.match(app, /const ovozPromiseRef = useRef\(null\)/);
  assert.match(app, /const ovozNutqRef = useRef\(null\)/);
  assert.match(app, /SpeechSynthesisUtterance/);
  assert.match(app, /speech\.speak\(utterance\)/);
  assert.match(app, /globalThis\.speechSynthesis\?\.cancel/);
  assert.match(app, /audio\.__samTmPromise = new Promise/);
  assert.match(app, /audio\.onended = null/);
  assert.match(app, /audio\.removeAttribute\("src"\)/);
  assert.match(app, /resolveCurrent\(\{ status: "stopped" \}\)/);
  assert.match(app, /readStatus=\{ovozHolati\}/);
  assert.match(app, /readError=\{ovozXatosi\}/);
});


test("every game question has an explicit high-contrast final color", () => {
  for (const mode of ["bridge", "millionaire", "space", "city"]) {
    assert.match(arenaStyles, new RegExp(`\\.test-game-arena \\.game-stage-${mode} \\.game-question-heading > h1`));
  }
  assert.match(arenaStyles, /color: #f8fdff !important/);
  assert.match(arenaStyles, /-webkit-text-fill-color: #f8fdff !important/);
  assert.match(arenaStyles, /\.game-stage-detective \.game-question-heading > h1[\s\S]*color: #3c2415 !important/);
});


test("golden bridge uses only the four real answers for jumping and breaking", () => {
  assert.match(arena, /bridgeOptionIndex/);
  assert.match(arena, /bridge-answer-course is-\$\{bridgeOutcome\}/);
  assert.match(arena, /--bridge-runner-left/);
  assert.match(arena, /className="bridge-choice-runner"/);
  assert.match(arena, /is-correct-option is-bridge-safe/);
  assert.match(arena, /is-wrong-option is-bridge-broken/);
  assert.doesNotMatch(arena, /className="bridge-runner-track"/);
  assert.doesNotMatch(arena, /className="bridge-tiles"/);
  assert.match(arenaStyles, /\.bridge-answer-course[\s\S]*grid-template-columns: repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(arenaStyles, /@keyframes bridge-choice-jump/);
  assert.match(arenaStyles, /@keyframes bridge-choice-hang/);
  assert.match(arenaStyles, /@keyframes bridge-glass-shards/);
  assert.match(arenaStyles, /\.bridge-answer-course\.is-jumping \.bridge-choice-runner \.avatar-render[\s\S]*bridge-sprite-cross/);
  assert.match(arenaStyles, /\.bridge-answer-course\.is-broken \.bridge-choice-runner \.avatar-render[\s\S]*bridge-sprite-slip/);
  assert.match(
    arenaStyles,
    /\.game-stage-bridge\.is-scene-wrong \.bridge-answer-course > button\.is-bridge-broken[\s\S]*animation: bridge-real-pane-break/,
  );
});


test("final answer analysis no longer grows below the game card", () => {
  assert.doesNotMatch(arena, /feedbackFinal && feedback\?\.type !== "timeout"/);
  assert.doesNotMatch(arena, /className=\{`game-feedback-transition/);
  assert.match(arenaStyles, /\.game-stage > \.scene-feedback-fx \{[\s\S]*position|\.game-stage > \.scene-feedback-fx \{[\s\S]*z-index: 90/);
  assert.match(arenaStyles, /\.game-feedback:empty \{ display: none; \}/);
  assert.match(arena, /feedback\?\.type === "timeout" && \(feedback\?\.finalized \|\| transition\)/);
});
