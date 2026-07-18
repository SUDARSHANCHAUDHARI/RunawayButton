#!/usr/bin/env bash

set -euo pipefail

readonly RUNAWAY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RUNAWAY_ROOT"

printf 'Checking JavaScript syntax...\n'
node --check script.js

printf 'Checking project integrity and security invariants...\n'
node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredFiles = [
  ".gitignore",
  "AGENTS.md",
  "README.md",
  "index.html",
  "scripts/verify.sh",
  "script.js",
  "style.css",
  "tests/runtime-smoke.js",
];

requiredFiles.forEach((file) => {
  assert(fs.existsSync(file), `Missing required file: ${file}`);
});

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");
const script = fs.readFileSync("script.js", "utf8");
const readme = fs.readFileSync("README.md", "utf8");
const gitignore = fs.readFileSync(".gitignore", "utf8");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert(new Set(ids).size === ids.length, "HTML contains duplicate ids");

for (const match of html.matchAll(/\b(?:aria-describedby|aria-labelledby)="([^"]+)"/g)) {
  for (const reference of match[1].split(/\s+/)) {
    assert(ids.includes(reference), `Missing ARIA reference: ${reference}`);
  }
}

for (const match of html.matchAll(/<(?:link|script)[^>]+(?:href|src)="([^"]+)"/g)) {
  const asset = match[1];
  assert(!/^https?:/i.test(asset), `Runtime asset must be local: ${asset}`);
  assert(fs.existsSync(path.resolve(asset)), `Missing runtime asset: ${asset}`);
}

const buttons = [...html.matchAll(/<button\b([^>]*)>/g)];
assert(buttons.length >= 3, "Expected target, sound, and reset buttons");
assert(buttons.every((match) => /\btype="button"/.test(match[1])), "Every button must declare type=button");

const behaviors = [
  "moveAway",
  "shrink",
  "rotate",
  "changePosition",
  "pretendDisabled",
  "changeLabel",
  "split",
];
behaviors.forEach((behavior) => {
  assert(script.includes(`\"${behavior}\"`), `Missing escape behavior: ${behavior}`);
});

[
  "You are persistent.",
  "You finally caught me.",
  "AudioContext",
  "INTERACTION_COOLDOWN",
  "CONTROL_CLEARANCE",
].forEach((token) => {
  assert(script.includes(token), `Missing required implementation token: ${token}`);
});

assert(css.includes("prefers-reduced-motion: reduce"), "Reduced-motion support is missing");
assert(!/console\.|fetch\(|XMLHttpRequest|WebSocket|innerHTML|outerHTML|eval\(|new Function/.test(script), "Risky logging, network, or injection API found");
assert(!/<img\b|\b(?:src|href)="https?:/i.test(html), "External runtime content found in HTML");

const cssBraceBalance = [...css].reduce((balance, character) => {
  if (character === "{") return balance + 1;
  if (character === "}") return balance - 1;
  return balance;
}, 0);
assert(cssBraceBalance === 0, "CSS braces are unbalanced");

["## Controls", "## Run locally", "## Verification", "## Deploy to GitHub Pages", "## Release checklist"].forEach((heading) => {
  assert(readme.includes(heading), `README is missing: ${heading}`);
});

[".env", "node_modules/", "dist/", "*.pem", "*.key", "*.p12", "*.jks", "local.properties"].forEach((entry) => {
  assert(gitignore.includes(entry), `.gitignore is missing: ${entry}`);
});

process.stdout.write(`Integrity passed: ${ids.length} unique ids, ${buttons.length} typed buttons, ${behaviors.length} tactics.\n`);
NODE

printf 'Running interaction lifecycle smoke test...\n'
node tests/runtime-smoke.js

printf 'RunawayButton verification passed.\n'
