"use strict";

const captionGuide = '<span class="caption-guide"><strong>한국어 자막</strong> 영상 톱니바퀴(⚙) → 자막 → 자동 번역 → 아래로 내려 ‘한국어’ 선택 <small>· 자막이 있는 영상에서 가능</small></span>';

function renderSoundButton(button, enabled) {
  const symbol = enabled
    ? '<path d="M16 9a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"/>'
    : '<path d="m16 10 5 5m0-5-5 5"/>';
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/>' + symbol + '</svg>' +
    (enabled ? "소리 켜짐" : "소리 꺼짐");
  button.setAttribute("aria-pressed", enabled);
}

let lessonAudio;
const lessonCues = {
  throw: ["triangle", 530, 185, .12, .085],
  catch: ["sine", 440, 165, .10, .17],
  impact: ["triangle", 235, 62, .13, .25],
  point: ["sine", 520, 820, .20, .16],
  notice: ["sine", 400, 265, .14, .14]
};

function setupLessonSound(button, whistle) {
  let enabled = false;
  let output;
  renderSoundButton(button, enabled);
  button.addEventListener("click", () => {
    enabled = !enabled;
    renderSoundButton(button, enabled);
    if (enabled && window.AudioContext) {
      lessonAudio ??= new AudioContext();
      if (!output) {
        output = lessonAudio.createGain();
        output.connect(lessonAudio.destination);
      }
      lessonAudio.resume().catch(() => {});
    }
    if (output) output.gain.value = Number(enabled);
    if (!enabled && whistle) whistle.pause();
  });
  return {
    get enabled() { return enabled; },
    play(cue) {
      if (!cue || !enabled || button.closest("[hidden]")) return;
      if (cue === "whistle" && whistle) {
        whistle.currentTime = 0;
        whistle.play().catch(() => {});
        return;
      }
      if (lessonAudio?.state !== "running" || !Object.hasOwn(lessonCues, cue)) return;
      const [type, initial, final, duration, volume] = lessonCues[cue];
      const oscillator = lessonAudio.createOscillator();
      const gain = lessonAudio.createGain();
      const now = lessonAudio.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(initial, now);
      oscillator.frequency.exponentialRampToValueAtTime(final, now + duration);
      gain.gain.setValueAtTime(.001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .015);
      gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      oscillator.connect(gain).connect(output);
      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  };
}

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
  { pick: document.querySelector("#pick-badminton"), panel: document.querySelector("#badminton-panel") },
  { pick: document.querySelector("#pick-ultimate"), panel: document.querySelector("#ultimate-panel") },
  { pick: document.querySelector("#pick-dodgeball"), panel: document.querySelector("#dodgeball-panel") },
  { pick: document.querySelector("#pick-teams"), panel: document.querySelector("#teams-panel"),
    alternatePick: document.querySelector("#pick-fixtures") }
];

function selectSport() {
  const fragment = location.hash.slice(1);
  const section = fragment.split("/")[0];
  const selected = section === "teams" || section === "fixtures" ? 3 : section === "dodgeball" ? 2 : section === "ultimate" ? 1 : 0;
  sportNavigation.forEach(({ pick, panel, alternatePick }, index) => {
    panel.hidden = selected !== index;
    const activePick = section === "fixtures" && alternatePick ? alternatePick : pick;
    for (const link of [pick, alternatePick]) {
      if (!link) continue;
      if (selected === index && link === activePick) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  });
}

addEventListener("hashchange", selectSport);
selectSport();
