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
  { pick: document.querySelector("#pick-ultimate"), panel: document.querySelector("#ultimate-panel") }
];

function selectSport() {
  const fragment = location.hash.slice(1);
  const selected = fragment.split("/")[0] === "ultimate" ? 1 : 0;
  sportNavigation.forEach(({ pick, panel }, index) => {
    panel.hidden = selected !== index;
    if (selected === index) pick.setAttribute("aria-current", "true");
    else pick.removeAttribute("aria-current");
  });
}

addEventListener("hashchange", selectSport);
selectSport();
