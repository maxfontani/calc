import Calc from "./calcClass";

const calc = new Calc(display, topDisplay, botDisplay);
const panel = document.querySelector(".calcButtonsInner");
const display = document.getElementById("calc-display");
const topDisplay = document.getElementById("calc-display-top");
const botDisplay = document.getElementById("calc-display-bot");
const autoFocus = document.getElementById("auto-focus");

panel.addEventListener("click", onPanelClick);
document.addEventListener("keyup", onKeyUp);

function onPanelClick(evt) {
  autoFocus.focus();
  calc.press(evt.target.value);
}

function onKeyUp(evt) {
  calc.press(evt.key);
}
