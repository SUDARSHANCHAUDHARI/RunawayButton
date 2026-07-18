"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

class ClassList {
  constructor(initial = "") {
    this.values = new Set(initial.split(/\s+/).filter(Boolean));
  }

  add(...names) {
    names.forEach((name) => this.values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : Boolean(force);
    enabled ? this.add(name) : this.remove(name);
    return enabled;
  }

  toString() {
    return [...this.values].join(" ");
  }
}

class MockElement {
  constructor(id = "", classes = "") {
    this.id = id;
    this.listeners = new Map();
    this.attributes = new Map();
    this.children = [];
    this.hidden = false;
    this.textContent = "";
    this.offsetWidth = id === "runawayButton" ? 220 : 150;
    this.offsetHeight = id === "runawayButton" ? 90 : 60;
    this.style = this.createStyle();
    this.classList = new ClassList(classes);
  }

  createStyle() {
    return {
      setProperty(name, value) {
        this[name] = value;
      },
    };
  }

  set className(value) {
    this.classList = new ClassList(value);
  }

  get className() {
    return this.classList.toString();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "style") {
      this.style = this.createStyle();
    }
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  dispatch(type, event = {}) {
    event.preventDefault ||= () => {
      event.defaultPrevented = true;
    };

    for (const callback of this.listeners.get(type) || []) {
      callback(event);
    }
  }

  append(child) {
    this.children.push(child);
    child.parent = this;
  }

  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  getBoundingClientRect() {
    const left = Number.parseFloat(this.style.left) || 260;
    const top = Number.parseFloat(this.style.top) || 240;
    return {
      left,
      top,
      right: left + this.offsetWidth,
      bottom: top + this.offsetHeight,
      width: this.offsetWidth,
      height: this.offsetHeight,
    };
  }
}

const elementIds = [
  "runawayButton",
  "buttonLabel",
  "attemptCount",
  "statusMessage",
  "tauntMessage",
  "soundControl",
  "soundLabel",
  "resetControl",
  "celebrationPanel",
];

const elements = Object.fromEntries(
  elementIds.map((id) => [id, new MockElement(id, id === "runawayButton" ? "target-button" : "")]),
);
elements.celebrationPanel.hidden = true;

const meter = Array.from({ length: 10 }, () => new MockElement());
const body = new MockElement("body");
const timers = new Map();
let nextTimerId = 0;

const documentMock = {
  body,
  querySelector(selector) {
    return elements[selector.replace("#", "")] || null;
  },
  querySelectorAll(selector) {
    if (selector === "#attemptMeter li") {
      return meter;
    }
    if (selector === ".fake-button") {
      return body.children.filter((node) => node.classList.contains("fake-button"));
    }
    if (selector === ".escape-trail, .confetti") {
      return body.children.filter(
        (node) => node.classList.contains("escape-trail") || node.classList.contains("confetti"),
      );
    }
    return [];
  },
  createElement() {
    return new MockElement();
  },
  addEventListener() {},
};

const windowMock = {
  innerWidth: 1200,
  innerHeight: 800,
  visualViewport: null,
  matchMedia() {
    return { matches: true };
  },
  addEventListener() {},
  setTimeout(callback) {
    const timerId = ++nextTimerId;
    timers.set(timerId, callback);
    return timerId;
  },
  clearTimeout(timerId) {
    timers.delete(timerId);
  },
};

function flushTimers() {
  let passes = 0;
  while (timers.size > 0 && passes < 20) {
    const pending = [...timers.values()];
    timers.clear();
    pending.forEach((callback) => callback());
    passes += 1;
  }
  assert.equal(timers.size, 0, "Timer queue should settle");
}

const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  Math,
});

vm.runInContext(fs.readFileSync("script.js", "utf8"), context, { filename: "script.js" });

for (let attempt = 1; attempt <= 10; attempt += 1) {
  elements.runawayButton.dispatch("keydown", { key: "Enter" });

  if (attempt === 5) {
    assert.equal(elements.statusMessage.textContent, "You are persistent.");
  }

  flushTimers();
}

assert.equal(elements.attemptCount.textContent, "10");
assert.equal(elements.runawayButton.classList.contains("is-catchable"), true);

elements.runawayButton.dispatch("click");
assert.equal(elements.statusMessage.textContent, "You finally caught me.");
assert.equal(elements.celebrationPanel.hidden, false);

elements.resetControl.dispatch("click");
flushTimers();
assert.equal(elements.attemptCount.textContent, "0");
assert.equal(elements.celebrationPanel.hidden, true);
assert.equal(elements.runawayButton.className, "target-button");

process.stdout.write("Runtime passed: milestone, unlock, catch, celebration, and reset.\n");
