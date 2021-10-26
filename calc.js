import Calc from "./calcClass.js";

const panel = document.querySelector(".calcButtonsInner");
const display = document.getElementById("calc-display");
const topDisplay = document.getElementById("calc-display-top");
const botDisplay = document.getElementById("calc-display-bot");
const autoFocus = document.getElementById("auto-focus");
const calc = new Calc(display, topDisplay, botDisplay);

panel.addEventListener("click", onPanelClick);
document.addEventListener("keyup", onKeyUp);

function onPanelClick(evt) {
  autoFocus.focus();
  const type = evt.target.getAttribute("type");
  calc.press(null, type, evt.target.value);
}

function onKeyUp(evt) {
  calc.press(evt.key);
}
