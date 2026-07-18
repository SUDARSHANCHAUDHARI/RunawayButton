(() => {
  "use strict";

  const MAX_ATTEMPTS = 10;
  const PERSISTENCE_MILESTONE = 5;
  const INTERACTION_COOLDOWN = 620;
  const VIEWPORT_PADDING = 18;
  const CONTROL_CLEARANCE = 96;

  const button = document.querySelector("#runawayButton");
  const buttonLabel = document.querySelector("#buttonLabel");
  const attemptCount = document.querySelector("#attemptCount");
  const attemptMeter = Array.from(document.querySelectorAll("#attemptMeter li"));
  const statusMessage = document.querySelector("#statusMessage");
  const tauntMessage = document.querySelector("#tauntMessage");
  const soundControl = document.querySelector("#soundControl");
  const soundLabel = document.querySelector("#soundLabel");
  const resetControl = document.querySelector("#resetControl");
  const celebrationPanel = document.querySelector("#celebrationPanel");

  if (
    !button ||
    !buttonLabel ||
    !attemptCount ||
    !statusMessage ||
    !tauntMessage ||
    !soundControl ||
    !soundLabel ||
    !resetControl ||
    !celebrationPanel
  ) {
    return;
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  const state = {
    attempts: 0,
    caught: false,
    catchable: false,
    locked: false,
    pointerArmed: true,
    soundEnabled: true,
    audioContext: null,
    behaviorBag: [],
    timers: new Set(),
  };

  const behaviorNames = [
    "moveAway",
    "shrink",
    "rotate",
    "changePosition",
    "pretendDisabled",
    "changeLabel",
    "split",
  ];

  const alternateLabels = [
    "Too slow!",
    "Not this one",
    "Almost!",
    "Nice try",
    "Catch me",
    "Missed me",
  ];

  const taunts = {
    moveAway: "It read your approach and changed course.",
    shrink: "Small target. Big attitude.",
    rotate: "A tactical spin. Very advanced.",
    changePosition: "Now you see it. Now it is over there.",
    pretendDisabled: "It is pretending to be unavailable.",
    changeLabel: "A new label will surely fool you.",
    split: "Decoys deployed. Trust no button.",
  };

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function shuffle(items) {
    const result = [...items];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }

    return result;
  }

  function schedule(callback, delay) {
    const timerId = window.setTimeout(() => {
      state.timers.delete(timerId);
      callback();
    }, delay);

    state.timers.add(timerId);
    return timerId;
  }

  function clearTimers() {
    state.timers.forEach((timerId) => window.clearTimeout(timerId));
    state.timers.clear();
  }

  function getViewportBounds() {
    const viewport = window.visualViewport;
    const left = viewport ? viewport.offsetLeft : 0;
    const top = viewport ? viewport.offsetTop : 0;
    const width = viewport ? viewport.width : window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;
    const topClearance = Math.min(CONTROL_CLEARANCE, height * 0.18);

    return {
      left: left + VIEWPORT_PADDING,
      top: top + Math.max(VIEWPORT_PADDING, topClearance),
      right: left + width - VIEWPORT_PADDING,
      bottom: top + height - VIEWPORT_PADDING,
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function ensurePositioned() {
    if (button.classList.contains("is-positioned")) {
      return;
    }

    const rect = button.getBoundingClientRect();
    button.classList.add("is-positioned");
    button.style.left = `${rect.left}px`;
    button.style.top = `${rect.top}px`;
    button.getBoundingClientRect();
  }

  function placeButton(x, y, options = {}) {
    ensurePositioned();

    const bounds = getViewportBounds();
    const width = button.offsetWidth;
    const height = button.offsetHeight;
    const scale = options.scale ?? 1;
    const rotation = options.rotation ?? 0;
    const angle = (Math.abs(rotation) * Math.PI) / 180;
    const visualWidth = (width * Math.cos(angle) + height * Math.sin(angle)) * scale;
    const visualHeight = (height * Math.cos(angle) + width * Math.sin(angle)) * scale;
    const visualOffsetX = (width - visualWidth) / 2;
    const visualOffsetY = (height - visualHeight) / 2;
    const safeX = clamp(
      x,
      bounds.left - visualOffsetX,
      bounds.right - visualOffsetX - visualWidth,
    );
    const safeY = clamp(
      y,
      bounds.top - visualOffsetY,
      bounds.bottom - visualOffsetY - visualHeight,
    );

    button.style.setProperty("--button-scale", String(scale));
    button.style.setProperty("--button-rotate", `${rotation}deg`);
    button.style.left = `${safeX}px`;
    button.style.top = `${safeY}px`;
  }

  function createTrail(rect) {
    if (reducedMotionQuery.matches) {
      return;
    }

    const trail = document.createElement("span");
    trail.className = "escape-trail";
    trail.setAttribute("aria-hidden", "true");
    trail.textContent = buttonLabel.textContent;
    trail.style.left = `${rect.left}px`;
    trail.style.top = `${rect.top + rect.height / 2}px`;
    document.body.append(trail);
    schedule(() => trail.remove(), 520);
  }

  function directionAwayFrom(pointer, rect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let deltaX = centerX - pointer.x;
    let deltaY = centerY - pointer.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < 1) {
      const angle = randomBetween(0, Math.PI * 2);
      deltaX = Math.cos(angle);
      deltaY = Math.sin(angle);
    } else {
      deltaX /= distance;
      deltaY /= distance;
    }

    return { x: deltaX, y: deltaY };
  }

  function randomSafePosition(avoidPoint) {
    const bounds = getViewportBounds();
    const maxX = Math.max(bounds.left, bounds.right - button.offsetWidth);
    const maxY = Math.max(bounds.top, bounds.bottom - button.offsetHeight);
    let candidate = { x: bounds.left, y: bounds.top };

    for (let attempt = 0; attempt < 8; attempt += 1) {
      candidate = {
        x: randomBetween(bounds.left, maxX),
        y: randomBetween(bounds.top, maxY),
      };

      const candidateCenterX = candidate.x + button.offsetWidth / 2;
      const candidateCenterY = candidate.y + button.offsetHeight / 2;

      if (
        !avoidPoint ||
        Math.hypot(candidateCenterX - avoidPoint.x, candidateCenterY - avoidPoint.y) > 150
      ) {
        break;
      }
    }

    return candidate;
  }

  function moveAway(pointer, distance = randomBetween(150, 240)) {
    const rect = button.getBoundingClientRect();
    const direction = directionAwayFrom(pointer, rect);
    const jitterX = randomBetween(-40, 40);
    const jitterY = randomBetween(-35, 35);
    createTrail(rect);
    placeButton(
      rect.left + direction.x * distance + jitterX,
      rect.top + direction.y * distance + jitterY,
      { rotation: randomBetween(-6, 6) },
    );
  }

  function shrink(pointer) {
    const rect = button.getBoundingClientRect();
    const direction = directionAwayFrom(pointer, rect);
    createTrail(rect);
    placeButton(rect.left + direction.x * 72, rect.top + direction.y * 72, {
      scale: 0.64,
      rotation: randomBetween(-4, 4),
    });
  }

  function rotate(pointer) {
    const rect = button.getBoundingClientRect();
    const direction = directionAwayFrom(pointer, rect);
    createTrail(rect);
    placeButton(rect.left + direction.x * 98, rect.top + direction.y * 98, {
      rotation: Math.random() > 0.5 ? randomBetween(18, 28) : randomBetween(-28, -18),
    });
  }

  function changePosition(pointer) {
    const rect = button.getBoundingClientRect();
    const position = randomSafePosition(pointer);
    createTrail(rect);
    placeButton(position.x, position.y, { rotation: randomBetween(-7, 7) });
  }

  function pretendDisabled() {
    button.classList.add("is-fake-disabled");
    button.setAttribute("aria-disabled", "true");
    buttonLabel.textContent = "Unavailable";
  }

  function changeLabel(pointer) {
    buttonLabel.textContent = alternateLabels[Math.floor(Math.random() * alternateLabels.length)];
    moveAway(pointer, randomBetween(100, 160));
  }

  function removeFakes() {
    document.querySelectorAll(".fake-button").forEach((fake) => fake.remove());
  }

  function split(pointer) {
    removeFakes();
    const labels = ["Definitely me", "Click this one", "The real button"];
    const colors = ["#ff6b6b", "#5b8cff", "#76e6c4"];

    labels.forEach((label, index) => {
      const fake = document.createElement("button");
      const position = randomSafePosition(pointer);
      fake.className = "target-button fake-button is-positioned";
      fake.type = "button";
      fake.tabIndex = -1;
      fake.setAttribute("aria-hidden", "true");
      fake.textContent = label;
      fake.style.left = `${position.x}px`;
      fake.style.top = `${position.y}px`;
      fake.style.borderColor = colors[index];

      fake.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        fake.remove();
        registerAttempt("decoy", { x: event.clientX, y: event.clientY });
      });

      document.body.append(fake);
    });

    buttonLabel.textContent = "Which one?";
    changePosition(pointer);
    schedule(removeFakes, 2200);
  }

  const behaviors = {
    moveAway,
    shrink,
    rotate,
    changePosition,
    pretendDisabled,
    changeLabel,
    split,
  };

  function nextBehavior() {
    if (state.behaviorBag.length === 0) {
      state.behaviorBag = shuffle(behaviorNames);
    }

    return state.behaviorBag.pop();
  }

  function clearTransientState() {
    if (state.catchable || state.caught) {
      return;
    }

    button.classList.remove("is-fake-disabled");
    button.removeAttribute("aria-disabled");
    button.style.setProperty("--button-scale", "1");
    button.style.setProperty("--button-rotate", "0deg");
    buttonLabel.textContent = "Click me";
  }

  function lockInteraction() {
    state.locked = true;
    schedule(() => {
      state.locked = false;
      clearTransientState();
    }, INTERACTION_COOLDOWN);
  }

  function updateScore() {
    attemptCount.textContent = String(state.attempts);

    attemptMeter.forEach((segment, index) => {
      const filled = index < state.attempts;
      segment.classList.toggle("is-filled", filled);
      segment.classList.toggle(
        "is-persistent",
        filled && index >= PERSISTENCE_MILESTONE - 1 && index < MAX_ATTEMPTS - 1,
      );
      segment.classList.toggle("is-final", filled && index === MAX_ATTEMPTS - 1);
    });

    if (state.attempts >= MAX_ATTEMPTS) {
      statusMessage.textContent = "10 attempts. It has stopped running.";
    } else if (state.attempts >= PERSISTENCE_MILESTONE) {
      statusMessage.textContent = "You are persistent.";
    } else if (state.attempts === 0) {
      statusMessage.textContent = "0 attempts. The button is feeling confident.";
    } else {
      const remaining = MAX_ATTEMPTS - state.attempts;
      statusMessage.textContent = `${state.attempts} ${state.attempts === 1 ? "attempt" : "attempts"}. ${remaining} ${remaining === 1 ? "escape" : "escapes"} left.`;
    }
  }

  function ensureAudio() {
    if (!state.soundEnabled || !AudioContextClass) {
      return null;
    }

    if (!state.audioContext) {
      try {
        state.audioContext = new AudioContextClass();
      } catch (_error) {
        return null;
      }
    }

    if (state.audioContext.state === "suspended") {
      state.audioContext.resume().catch(() => {});
    }

    return state.audioContext;
  }

  function playTone(frequency, duration = 0.09, type = "sine", delay = 0) {
    const audioContext = state.audioContext;

    if (!state.soundEnabled || !audioContext || audioContext.state === "closed") {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startAt = audioContext.currentTime + delay;
    const endAt = startAt + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.82), endAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.075, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }

  function playEscapeSound() {
    playTone(randomBetween(360, 520), 0.075, "square");
  }

  function playCelebrationSound() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      playTone(frequency, 0.2, "triangle", index * 0.11);
    });
  }

  function primeAudio() {
    ensureAudio();
  }

  function makeCatchable() {
    state.catchable = true;
    state.locked = false;
    clearTransientState();
    removeFakes();
    button.classList.remove("is-fake-disabled");
    button.classList.add("is-catchable");
    button.removeAttribute("aria-disabled");
    button.style.setProperty("--button-scale", "1");
    button.style.setProperty("--button-rotate", "0deg");
    buttonLabel.textContent = "Okay, click me";
    button.setAttribute("aria-label", "Okay, click me. I will not run away now.");
    tauntMessage.textContent = "Fine. One honest click. You earned it.";
    playTone(720, 0.13, "triangle");
  }

  function registerAttempt(source, pointer) {
    if (state.caught || state.catchable || state.locked) {
      return;
    }

    if (source !== "proximity") {
      primeAudio();
    }
    state.attempts = Math.min(MAX_ATTEMPTS, state.attempts + 1);
    updateScore();

    if (state.attempts >= MAX_ATTEMPTS) {
      makeCatchable();
      return;
    }

    lockInteraction();
    const behaviorName = nextBehavior();
    const fallbackPointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const behavior = behaviors[behaviorName];

    behavior(pointer || fallbackPointer);
    tauntMessage.textContent = source === "decoy" ? "That was a decoy. The real one is delighted." : taunts[behaviorName];
    playEscapeSound();
  }

  function createConfetti() {
    if (reducedMotionQuery.matches) {
      return;
    }

    const colors = ["#5b8cff", "#ff6b6b", "#ffd166", "#76e6c4", "#f7f3e8"];

    for (let index = 0; index < 56; index += 1) {
      const piece = document.createElement("i");
      piece.className = "confetti";
      piece.setAttribute("aria-hidden", "true");
      piece.style.left = `${randomBetween(2, 98)}vw`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--confetti-x", `${randomBetween(-110, 110)}px`);
      piece.style.setProperty("--confetti-rotate", `${randomBetween(260, 900)}deg`);
      piece.style.setProperty("--confetti-duration", `${randomBetween(1500, 2600)}ms`);
      piece.style.setProperty("--confetti-delay", `${randomBetween(0, 420)}ms`);
      document.body.append(piece);
      schedule(() => piece.remove(), 3200);
    }
  }

  function celebrate() {
    if (state.caught || !state.catchable) {
      return;
    }

    state.caught = true;
    state.catchable = false;
    state.locked = true;
    removeFakes();
    button.classList.remove("is-catchable", "is-fake-disabled");
    button.classList.add("is-caught");
    buttonLabel.textContent = "Caught!";
    button.setAttribute("aria-label", "Caught. Challenge complete.");
    statusMessage.textContent = "You finally caught me.";
    tauntMessage.textContent = "Persistence: undefeated.";
    celebrationPanel.hidden = false;
    playCelebrationSound();
    createConfetti();
  }

  function distanceFromButton(x, y) {
    const rect = button.getBoundingClientRect();
    const deltaX = Math.max(rect.left - x, 0, x - rect.right);
    const deltaY = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(deltaX, deltaY);
  }

  function proximityThreshold() {
    return clamp(button.offsetWidth * 0.62, 88, 142);
  }

  function handlePointerMove(event) {
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
      return;
    }

    if (state.caught || state.catchable) {
      return;
    }

    const pointer = { x: event.clientX, y: event.clientY };
    const distance = distanceFromButton(pointer.x, pointer.y);
    const threshold = proximityThreshold();

    if (distance > threshold * 1.3) {
      state.pointerArmed = true;
    }

    if (state.pointerArmed && distance < threshold) {
      state.pointerArmed = false;
      registerAttempt("proximity", pointer);
    }
  }

  function handleButtonPointerDown(event) {
    if (state.catchable || state.caught) {
      return;
    }

    state.pointerArmed = false;
    registerAttempt("press", { x: event.clientX, y: event.clientY });
  }

  function handleButtonKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    primeAudio();

    if (state.catchable || state.caught) {
      return;
    }

    event.preventDefault();
    const rect = button.getBoundingClientRect();
    registerAttempt("keyboard", {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  }

  function handleButtonClick(event) {
    if (state.catchable) {
      celebrate();
      return;
    }

    if (!state.caught) {
      event.preventDefault();
      const rect = button.getBoundingClientRect();
      registerAttempt("click", {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }

  function keepButtonVisible() {
    if (!button.classList.contains("is-positioned")) {
      return;
    }

    const rect = button.getBoundingClientRect();
    placeButton(rect.left, rect.top);
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    soundControl.setAttribute("aria-pressed", String(state.soundEnabled));
    soundLabel.textContent = state.soundEnabled ? "Sound on" : "Sound off";
    tauntMessage.textContent = state.soundEnabled ? "Sound on. Tiny beeps are standing by." : "Sound off. Stealth mode activated.";

    if (state.soundEnabled) {
      primeAudio();
      playTone(620, 0.1, "sine");
    }
  }

  function resetGame() {
    clearTimers();
    removeFakes();
    document.querySelectorAll(".escape-trail, .confetti").forEach((element) => element.remove());

    state.attempts = 0;
    state.caught = false;
    state.catchable = false;
    state.locked = false;
    state.pointerArmed = true;
    state.behaviorBag = [];

    button.className = "target-button";
    button.removeAttribute("style");
    button.removeAttribute("aria-disabled");
    button.setAttribute("aria-label", "Click me, if you can");
    buttonLabel.textContent = "Click me";
    celebrationPanel.hidden = true;
    tauntMessage.textContent = "Go on. It looks easy.";
    updateScore();
    primeAudio();
    playTone(330, 0.08, "sine");
  }

  button.addEventListener("pointerdown", handleButtonPointerDown);
  button.addEventListener("keydown", handleButtonKeyDown);
  button.addEventListener("click", handleButtonClick);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("resize", keepButtonVisible, { passive: true });
  window.visualViewport?.addEventListener("resize", keepButtonVisible, { passive: true });
  window.visualViewport?.addEventListener("scroll", keepButtonVisible, { passive: true });
  soundControl.addEventListener("click", toggleSound);
  resetControl.addEventListener("click", resetGame);
  document.addEventListener("pointerdown", primeAudio, { once: true, capture: true });
  document.addEventListener("keydown", primeAudio, { once: true, capture: true });

  updateScore();
})();
