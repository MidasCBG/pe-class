"use strict";

const captionGuide = '<span class="caption-guide"><strong>한국어 자막</strong> 영상 톱니바퀴(⚙) → 자막 → 자동 번역 → 아래로 내려 ‘한국어’ 선택 <small>· 자막이 있는 영상에서 가능</small></span>';

const audioButton = document.querySelector("#app-sound");
const whistle = document.querySelector("#dodgeball-whistle");
const sampleNames = ["shuttle-hit", "shuttle-land", "ball-land", "ball-contact", "disc-land", "disc-catch", "release"];
const lessonSamples = new Map(sampleNames.map(name => {
  const player = new Audio(`./sfx-${name}.wav?v=landing-balance-2`);
  player.preload = "auto";
  return [name, player];
}));
const whistleScale = .6;
let testPlayer;

function stopLessonSounds() {
  whistle.pause();
  for (const player of lessonSamples.values()) player.pause();
}

function updateLessonVolume() {
  const volume = preferences.volume / 100;
  whistle.volume = volume * whistleScale;
  for (const player of lessonSamples.values()) player.volume = volume;
  if (!preferences.sound || !volume) stopLessonSounds();
}

function renderSoundButton() {
  const symbol = preferences.sound
    ? '<path d="M16 9a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"/>'
    : '<path d="m16 10 5 5m0-5-5 5"/>';
  audioButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/>' + symbol + '</svg>';
  audioButton.setAttribute("aria-pressed", String(preferences.sound));
  audioButton.title = preferences.sound ? "전체 효과음 끄기" : "전체 효과음 켜기";
}

function playSample(player, volume) {
  if (!player || !volume) return;
  player.volume = volume;
  player.currentTime = 0;
  player.play().catch(() => {});
}

const lessonSound = {
  get enabled() { return preferences.sound; },
  play(cue) {
    if (!this.enabled) return;
    const volume = preferences.volume / 100;
    if (cue === "whistle") playSample(whistle, volume * whistleScale);
    else playSample(lessonSamples.get(cue), volume);
  }
};

function testWhistleSound(volume) {
  stopSoundTest();
  testPlayer = new Audio(whistle.src);
  playSample(testPlayer, volume / 100 * whistleScale);
}

function stopSoundTest() {
  testPlayer?.pause();
  testPlayer = undefined;
}

audioButton.addEventListener("click", () => savePreferences({ sound: !preferences.sound }));
document.addEventListener("preferenceschange", () => {
  renderSoundButton();
  updateLessonVolume();
});
addEventListener("hashchange", stopLessonSounds);
renderSoundButton();

function renderNotes(container, notes, selected) {
  container.replaceChildren(...notes.map(([label, text], index) => {
    const note = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = label;
    note.append(title, text);
    if (index !== selected) {
      note.className = "note-space";
      note.setAttribute("aria-hidden", "true");
    }
    return note;
  }));
}

const sportNavigation = [
  { pick: document.querySelector("#pick-home"), panel: document.querySelector("#home-panel") },
  { pick: document.querySelector("#pick-badminton"), panel: document.querySelector("#badminton-panel") },
  { pick: document.querySelector("#pick-ultimate"), panel: document.querySelector("#ultimate-panel") },
  { pick: document.querySelector("#pick-dodgeball"), panel: document.querySelector("#dodgeball-panel") },
  { pick: document.querySelector("#pick-teams"), panel: document.querySelector("#teams-panel"),
    alternatePick: document.querySelector("#pick-fixtures") }
];

function selectSport() {
  const fragment = location.hash.slice(1);
  const section = fragment.split("/")[0];
  const selected = !section || section === "home" ? 0 :
    section === "teams" || section === "fixtures" ? 4 : section === "dodgeball" ? 3 : section === "ultimate" ? 2 : 1;
  sportNavigation.forEach(({ pick, panel, alternatePick }, index) => {
    panel.hidden = selected !== index;
    const activePick = section === "fixtures" && alternatePick ? alternatePick : pick;
    for (const link of [pick, alternatePick]) {
      if (!link) continue;
      if (selected === index && link === activePick) link.setAttribute("aria-current", index === 0 ? "page" : "true");
      else link.removeAttribute("aria-current");
    }
  });
}

addEventListener("hashchange", selectSport);
selectSport();

