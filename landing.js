"use strict";

function scrollToHome() {
  if (location.hash.split("/")[0] === "#home") window.scrollTo(0, 0);
}

addEventListener("hashchange", scrollToHome);
document.querySelector("#pick-home").addEventListener("click", scrollToHome);
