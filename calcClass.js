export default class Calc {
  #MAX_INPUT_LENGTH = 18;
  #NUMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."];
  #OPS = ["+", "-", "*", "/", "Enter", "Delete", "Backspace", "Escape"];

  #display;
  #topDisplay;
  #botDisplay;
  #msgTimeout;
  #opFnMap;
  #opSymMap;
  #keyValMap;
  #cache = null;
  #lastOp = null;
  #isFloat = false;
  #isNewInput = true;

  constructor(display, topDisplay, botDisplay) {
    if (
      !(
        display instanceof HTMLElement &&
        display instanceof HTMLElement &&
        botDisplay instanceof HTMLElement
      )
    )
      throw new Error(
        "Calc instances must get three HTMLElements as displays. Main display must be an input field."
      );

    this.#display = display;
    this.#topDisplay = topDisplay;
    this.#botDisplay = botDisplay;
    this.#display.value = "0";
    this.#topDisplay.innerText = "";
    this.#botDisplay.innerText = "";
    this.#opFnMap = {
      add: (n1, n2) => n1 + n2,
      sub: (n1, n2) => n1 - n2,
      mult: (n1, n2) => n1 * n2,
      div: (n1, n2) => n1 / n2,
      sign: (n) => -n,
    };
    this.#opSymMap = {
      add: "+",
      sub: "–",
      mult: "*",
      div: "÷",
      equals: "=",
    };
    this.#keyValMap = {
      Enter: "equals",
      Delete: "del",
      Backspace: "del",
      Escape: "cancel",
      "+": "add",
      "-": "sub",
      "*": "mult",
      "/": "div",
    };
  }

  press(key) {
    const type = this.#NUMS.includes(key)
      ? "num"
      : this.#OPS.includes(key)
      ? "op"
      : undefined;
    let val;

    if (type === "num") {
      val = key;
    } else if (type === "op") {
      val = this.#keyValMap[key];
    } else return;

    if (!val || !type) return;

    try {
      if (type === "num") {
        this.#onNumPress(val);
        return;
      }
      this.#onOpPress(val);
    } catch (err) {
      switch (err.message) {
        case "DIV_BY_ZERO": {
          this.#showBotMsgDebounced(
            "Division by zero not allowed. Restarting..",
            2000
          );
          this.#setInitValues();
          break;
        }
        default: {
          this.#setError(err, "Oops, something went wrong. Restarting..");
          break;
        }
      }
    }
  }

  #onNumPress(num) {
    if (this.#isNewInput) {
      this.#display.value = num;
      this.#isNewInput = this.#isFloat = false;
    }
    if (this.#display.value.length >= this.#MAX_INPUT_LENGTH) {
      showBotMsgDebounced(
        `Max input length is ${this.#MAX_INPUT_LENGTH} digits!`,
        2000
      );
      return;
    }
    if (num === ".") {
      if (this.#isFloat) return;
      this.#isFloat = true;
      this.#display.value = this.#display.value
        ? this.#display.value.concat(num)
        : "0.";
    }
    if (this.#display.value === "0") return;
    this.#display.value = this.#display.value.concat(num);
  }

  #onOpPress(op) {
    switch (op) {
      case "cancel": {
        this.#setInitValues();
        break;
      }
      case "del": {
        this.#onDel();
        break;
      }
      case "equals": {
        if (this.#lastOp === null) {
          this.#updateTopDisplay(op);
          break;
        }
        this.#onEquals();
        break;
      }
      case "sign": {
        this.#onSign();
        break;
      }
      default: {
        this.#processOp();
        this.#updateTopDisplay(op);
        break;
      }
    }
  }

  #processOp() {}

  #calculate(n1, n2) {
    if (this.#lastOp === "div" && n2 === 0) {
      throw new Error("DIV_BY_ZERO");
    }
    let res = this.#opFnMap[this.#lastOp](n1, n2);
    res = Number(res.toFixed(8));
    if (!Number.isFinite(res) || res.toString().length >= MAX_INPUT_LENGTH) {
      this.#showBotMsgDebounced("Sorry, the result is too big/small!", 3000);
      return Number(this.#display.value);
    }
    return res;
  }

  #onEquals() {}

  #onDel() {
    const len = this.#display.value.length;

    if (this.#display.value === "0") return;
    if (len === 1) {
      this.#display.value = "0";
      return;
    }
    if (len === 2 && this.#display.value[0] === "-") {
      this.#display.value = "0";
      return;
    }

    const index = this.#display.value.indexOf("e");
    if (~index) {
      this.#display.value = this.#display.value.slice(0, index);
      return;
    }
    if (this.#display.value[len - 1] === ".") {
      this.#isFloat = false;
    }
    this.#display.value = this.#display.value.slice(0, len - 1);
  }

  #onSign() {
    if (num2 !== null) {
      this.#display.value = this.#opFnMap.sign(Number(this.#display.value));
      num1 = Number(this.#display.value);
      this.#updateTopDisplay("sign");
    } else {
      this.#display.value = this.#opFnMap.sign(Number(this.#display.value));
    }
  }

  #updateTopDisplay(operation) {
    if (operation === "sign") {
      const prevNum = -this.#cache;
      this.#topDisplay.innerText = `negate(${prevNum})`;
      return;
    }
    if (operation === "equals") {
      this.#topDisplay.innerText =
        this.#lastOp === null
          ? `${Number(this.#display.value)} =`
          : `${num1} ${this.#opSymMap[this.#lastOp]} ${num2} =`;
      return;
    }
    this.#topDisplay.innerText = `${num1} ${this.#opSymMap[this.#lastOp]}`;
  }

  #showBotMsgDebounced(msg, ms = 2500) {
    if (typeof msg !== "string") return;
    this.#botDisplay.innerText = msg;
    clearTimeout(this.#msgTimeout);
    this.#msgTimeout = setTimeout(() => {
      this.#botDisplay.innerText = "";
    }, ms);
  }

  #setInitValues() {
    this.#cache = null;
    this.#lastOp = null;
    this.#isNewInput = true;
    this.#isFloat = false;
    this.#display.value = "0";
    this.#topDisplay.innerText = "";
  }

  #setError(err, msg) {
    console.error(err);
    this.#showBotMsgDebounced(msg, 2000);
    this.#setInitValues();
  }
}
