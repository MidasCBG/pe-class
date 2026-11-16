"use strict";

const preferenceKey = "pe-class-preferences";
const preferences = { rail: "fixed", railSide: "left", layout: "top", speed: 1, text: "normal", volume: 100, sound: false };
const demonstrationBaseDuration = 2100;

try {
  const saved = JSON.parse(localStorage.getItem(preferenceKey));
  if (["fixed", "compact", "hidden"].includes(saved?.rail)) preferences.rail = saved.rail;
  if (saved?.railSide === "right") preferences.railSide = saved.railSide;
  if (["top", "left", "right"].includes(saved?.layout)) preferences.layout = saved.layout;
  if ([0.5, 0.75, 1, 1.25].includes(saved?.speed)) preferences.speed = saved.speed;
  if (saved?.text === "large") preferences.text = saved.text;
  if (Number.isInteger(saved?.volume) && saved.volume >= 0 && saved.volume <= 100) preferences.volume = saved.volume;
  preferences.sound = saved?.sound === true;
} catch {}

function demonstrationDuration(milliseconds, speed = preferences.speed) {
  return milliseconds / speed;
}

function applyPreferences() {
  const railChanged = document.body.dataset.railMode !== preferences.rail;
  const sideChanged = document.body.dataset.railSide !== preferences.railSide;
  document.body.dataset.railMode = preferences.rail;
  document.body.dataset.railSide = preferences.railSide;
  railEdge.hidden = preferences.rail !== "hidden";
  if (railChanged || sideChanged) setRailOpen(false);
  if (railChanged) {
    for (const item of sportRail.querySelectorAll(".pe-brand, .sport-pick")) {
      if (preferences.rail === "compact") {
        item.title = item.getAttribute("aria-label") || item.querySelector("span").textContent.trim();
      } else {
        item.removeAttribute("title");
      }
    }
    const creditIcon = sportRail.querySelector(".sport-credit img");
    if (preferences.rail === "compact") {
      creditIcon.title = document.querySelector("#site-version").textContent.trim();
    } else {
      creditIcon.removeAttribute("title");
    }
  }
  document.body.dataset.controlsPosition = preferences.layout;
  document.body.dataset.lessonText = preferences.text;
}

function savePreferences(changes) {
  Object.assign(preferences, changes);
  try { localStorage.setItem(preferenceKey, JSON.stringify(preferences)); } catch {}
  applyPreferences();
  document.dispatchEvent(new Event("preferenceschange"));
}

const preferenceDialog = document.querySelector("#preferences");
const preferenceForm = document.querySelector("#preferences-form");
const preferenceOpener = document.querySelector("#open-preferences");
const preferenceTabs = [...preferenceDialog.querySelectorAll('[role="tab"]')];
const sportRail = document.querySelector("#sport-rail");
const railToggle = document.querySelector("#rail-reveal");
const railEdge = railToggle.parentElement;
const railPreview = preferenceDialog.querySelector(".rail-preview");
const railPreviewTrigger = railPreview.querySelector(".rail-preview-trigger");
const railPreviewPointer = railPreview.querySelector(".rail-preview-pointer");
let railPreviewAnimation;
const railPreviewNote = document.querySelector("#rail-preview-note");
const railNotes = {
  fixed: "선택한 위치에 종목 이름과 아이콘을 항상 표시합니다.",
  compact: "선택한 위치에 아이콘만 표시해 경기 장면을 넓힙니다.",
  hidden: "마우스를 가져가거나 핸들을 누르면 메뉴가 경기 장면 위로 열립니다."
};
let railPinned = false;
let railCloseTimer;
const layoutPreview = preferenceDialog.querySelector(".layout-preview");
const movingSample = preferenceDialog.querySelector(".speed-preview span");
const textPreview = preferenceDialog.querySelector(".text-preview");
const volumeLabel = document.querySelector("#volume-value");
let sampleAnimation;

function setRailOpen(open, focusToggle = false) {
  clearTimeout(railCloseTimer);
  if (!open) railPinned = false;
  if (focusToggle) railToggle.focus({ preventScroll: true });
  sportRail.inert = preferences.rail === "hidden" && !open;
  document.body.toggleAttribute("data-rail-open", open);
  railToggle.setAttribute("aria-expanded", String(open));
  const side = preferences.railSide === "right" ? "오른쪽" : "왼쪽";
  const label = `${side} 메뉴 ${open ? (railPinned ? "닫기" : "고정") : "열기"}`;
  railToggle.setAttribute("aria-label", label);
  railToggle.title = label;
}

for (const region of [railEdge, sportRail]) {
  region.addEventListener("pointerenter", event => {
    if (preferences.rail !== "hidden" || preferenceDialog.open || event.pointerType !== "mouse") return;
    setRailOpen(true);
  });
  region.addEventListener("pointerleave", event => {
    if (preferences.rail !== "hidden" || event.pointerType !== "mouse") return;
    clearTimeout(railCloseTimer);
    railCloseTimer = setTimeout(() => {
      if (!railPinned && !preferenceDialog.open && !sportRail.matches(":hover, :focus-within") && !railEdge.matches(":hover")) {
        setRailOpen(false);
      }
    }, 180);
  });
}

sportRail.addEventListener("focusout", event => {
  if (preferences.rail === "hidden" && !railPinned && !preferenceDialog.open &&
      !sportRail.contains(event.relatedTarget) && !sportRail.matches(":hover") && !railEdge.matches(":hover")) {
    setRailOpen(false);
  }
});

railToggle.addEventListener("click", () => {
  if (railPinned) {
    setRailOpen(false, true);
    return;
  }
  railPinned = true;
  setRailOpen(true);
  sportRail.querySelector("a").focus({ preventScroll: true });
});

document.addEventListener("pointerdown", event => {
  if (!sportRail.inert && preferences.rail === "hidden" && !preferenceDialog.open &&
      !sportRail.contains(event.target) && !railEdge.contains(event.target)) setRailOpen(false);
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || preferenceDialog.open || preferences.rail !== "hidden" || sportRail.inert) return;
  setRailOpen(false, sportRail.contains(document.activeElement));
});
sportRail.addEventListener("click", event => {
  if (preferences.rail === "hidden" && event.target.closest("a[href^='#']")) {
    setRailOpen(false, true);
  }
});

function stopPreferenceSamples() {
  stopRailPreviewDemo();
  sampleAnimation?.cancel();
  stopSoundTest();
}

function activatePreferenceTab(tab, focus = false) {
  stopPreferenceSamples();
  for (const item of preferenceTabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  }
  if (tab.id === "pref-tab-rail") playRailPreviewDemo();
  if (focus) tab.focus();
}

function readDraft() {
  const data = new FormData(preferenceForm);
  return {
    rail: data.get("rail"),
    railSide: data.get("railSide"),
    layout: data.get("layout"),
    speed: Number(data.get("speed")),
    text: data.get("text"),
    volume: Number(data.get("volume"))
  };
}

function renderPreferenceSamples() {
  const draft = readDraft();
  if (railPreview.dataset.mode !== draft.rail || railPreview.dataset.side !== draft.railSide) setRailPreviewOpen(false);
  railPreview.dataset.mode = draft.rail;
  railPreview.dataset.side = draft.railSide;
  railPreviewTrigger.hidden = draft.rail !== "hidden";
  railPreviewNote.textContent = railNotes[draft.rail];
  layoutPreview.dataset.position = draft.layout;
  textPreview.dataset.size = draft.text;
  volumeLabel.value = draft.volume + "%";
}

function setRailPreviewOpen(open) {
  railPreview.toggleAttribute("data-expanded", open);
  railPreviewTrigger.setAttribute("aria-expanded", String(open));
  railPreviewTrigger.setAttribute("aria-label", open ? "미리보기 메뉴 닫기" : "미리보기 메뉴 열기");
}

function stopRailPreviewDemo() {
  if (railPreviewAnimation) {
    railPreviewAnimation.onfinish = null;
    railPreviewAnimation.cancel();
    railPreviewAnimation = null;
  }
  railPreviewPointer.setAttribute("hidden", "");
}

function playRailPreviewDemo() {
  stopRailPreviewDemo();
  if (!preferenceDialog.open || railPreview.dataset.mode !== "hidden") return;

  setRailPreviewOpen(false);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setRailPreviewOpen(true);
    return;
  }

  const right = railPreview.dataset.side === "right";
  railPreviewPointer.removeAttribute("hidden");
  railPreviewAnimation = railPreviewPointer.animate([
    { left: right ? "38%" : "62%", top: "72%" },
    { left: right ? "calc(100% - 17px)" : "11px", top: "calc(50% - 2px)" }
  ], { duration: 780, easing: "ease-in-out", fill: "both" });
  railPreviewAnimation.onfinish = () => setRailPreviewOpen(true);
}

railPreviewTrigger.addEventListener("click", () => {
  stopRailPreviewDemo();
  setRailPreviewOpen(!railPreview.hasAttribute("data-expanded"));
});

function playSpeedSample() {
  sampleAnimation?.cancel();
  const distance = Math.max(0, movingSample.parentElement.clientWidth - movingSample.offsetWidth - 36);
  sampleAnimation = movingSample.animate(
    [{ transform: "translateX(0)" }, { transform: `translateX(${distance}px)` }],
    { duration: demonstrationDuration(demonstrationBaseDuration, readDraft().speed), fill: "forwards" }
  );
}

preferenceOpener.addEventListener("click", () => {
  for (const key of ["rail", "railSide", "layout", "speed", "text", "volume"]) {
    preferenceForm.elements[key].value = String(preferences[key]);
  }
  setRailPreviewOpen(false);
  renderPreferenceSamples();
  activatePreferenceTab(preferenceTabs[0]);
  preferenceDialog.showModal();
  playRailPreviewDemo();
  preferenceTabs[0].focus();
});
preferenceDialog.querySelector("[data-close-preferences]").addEventListener("click", () => preferenceDialog.close());
let pointerOnBackdrop;
preferenceDialog.addEventListener("pointerdown", event => {
  pointerOnBackdrop = event.target === preferenceDialog;
});
preferenceDialog.addEventListener("click", event => {
  if (pointerOnBackdrop && event.target === preferenceDialog) preferenceDialog.close();
});
document.querySelector("#preview-whistle").addEventListener("click", () => testWhistleSound(readDraft().volume));
preferenceDialog.addEventListener("close", () => {
  stopPreferenceSamples();
  const focusTarget = sportRail.inert ? railToggle : preferenceOpener;
  focusTarget.focus({ preventScroll: true });
});
preferenceForm.addEventListener("submit", event => {
  event.preventDefault();
  savePreferences(readDraft());
  preferenceDialog.close();
});
preferenceForm.addEventListener("input", event => {
  renderPreferenceSamples();
  if (event.target.name === "rail" || event.target.name === "railSide") playRailPreviewDemo();
  if (event.target.name === "speed") playSpeedSample();
});
document.querySelector("#preview-speed").addEventListener("click", playSpeedSample);

for (const tab of preferenceTabs) {
  tab.addEventListener("click", () => activatePreferenceTab(tab));
  tab.addEventListener("keydown", event => {
    const index = preferenceTabs.indexOf(tab);
    const last = preferenceTabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    activatePreferenceTab(preferenceTabs[next], true);
  });
}
applyPreferences();
