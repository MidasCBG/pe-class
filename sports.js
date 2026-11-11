"use strict";

const captionGuide = '<span class="caption-guide"><strong>한국어 자막</strong> 영상 톱니바퀴(⚙) → 자막 → 자동 번역 → 아래로 내려 ‘한국어’ 선택 <small>· 자막이 있는 영상에서 가능</small></span>';

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
  { pick: document.querySelector("#pick-teams"), panel: document.querySelector("#teams-panel"),
    alternatePick: document.querySelector("#pick-fixtures") }
];

function selectSport() {
  const fragment = location.hash.slice(1);
  const section = fragment.split("/")[0];
  const selected = section === "teams" || section === "fixtures" ? 2 : section === "ultimate" ? 1 : 0;
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
