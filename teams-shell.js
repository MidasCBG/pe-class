"use strict";
function openTeams() {
  const host = document.getElementById("teams-panel");
  const section = location.hash.split("/")[0];
  if (section !== "#teams" && section !== "#fixtures") {
    host.replaceChildren();
    return;
  }
  if (host.firstChild) {
    host.firstChild.contentWindow?.dispatchEvent(new Event("team-view-change"));
    return;
  }
  const frame = document.createElement("iframe");
  frame.src = "./teams.html?v=1.4.2";
  frame.title = "팀편성 및 대진편성";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-downloads");
  host.append(frame);
}
addEventListener("hashchange", openTeams);
openTeams();
