# RunawayButton

RunawayButton is a playful, standalone web experience built around one stubborn idea: a large button that refuses to be clicked. It dodges, shrinks, spins, changes its story, and deploys decoys while counting every attempt.

After five attempts it acknowledges your persistence. After ten, it finally stays still and lets you win.

- **Repository:** [github.com/SUDARSHANCHAUDHARI/RunawayButton](https://github.com/SUDARSHANCHAUDHARI/RunawayButton)
- **Project type:** Dependency-free static website
- **Current status:** Production checks passing; repository kept private until public release is approved

## Table of Contents

- [How the game works](#how-the-game-works)
- [Features](#features)
- [Technology](#technology)
- [Controls](#controls)
- [Run locally](#run-locally)
- [Verification](#verification)
- [Project structure](#project-structure)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Release checklist](#release-checklist)
- [Accessibility notes](#accessibility-notes)
- [Privacy and security](#privacy-and-security)
- [Browser support](#browser-support)
- [License](#license)
- [About](#about)

## How the game works

1. The target reacts when a mouse or pen approaches, or when a touch or keyboard interaction attempts to activate it.
2. Each valid attempt triggers one tactic from a shuffled seven-tactic bag, so every behavior appears before the full set repeats.
3. The interface displays **“You are persistent.”** after five attempts.
4. The target becomes catchable after ten attempts.
5. A successful click displays **“You finally caught me.”**, plays a generated melody when sound is enabled, and starts the celebration effect.

## Features

- Seven shuffled escape tactics: movement, shrinking, rotation, random repositioning, fake disabling, label changes, and decoy buttons
- Pointer-proximity detection for mouse and pen input
- Tap-friendly interactions for touchscreens and mobile devices
- Complete keyboard support with visible focus styles
- Attempt counter with milestones at five and ten attempts
- Celebration animation and a generated Web Audio melody on completion
- Sound toggle and full game reset controls
- Viewport-aware positioning that keeps the target on screen
- Interaction locking to prevent rapid input from overlapping animations
- Responsive layout for phone, tablet, and desktop widths
- Reduced-motion support through the `prefers-reduced-motion` media query
- No frameworks, external images, analytics, backend, or paid services

## Technology

- **Structure:** Semantic HTML5
- **Presentation:** Responsive CSS with custom properties, media queries, transitions, and keyframe animation
- **Game logic:** Vanilla JavaScript with no runtime dependencies
- **Input:** Pointer Events, touch-compatible native buttons, and keyboard events
- **Audio:** Web Audio API oscillators; no downloaded audio files
- **Viewport safety:** Visual Viewport API when available, with `window` dimensions as the fallback
- **Accessibility:** Native controls, ARIA live regions, visible focus styles, and `prefers-reduced-motion`
- **Verification:** Bash, Node.js syntax checking, and a dependency-free DOM/runtime smoke test

## Controls

- **Mouse or pen:** Move toward the button. It reacts when the pointer gets close.
- **Touch:** Tap the button or one of its decoys.
- **Keyboard:** Press `Tab` until the button is focused, then press `Enter` or `Space`.
- **Sound:** Use the **Sound on/off** control. Browsers require an initial click, tap, or key press before audio can play.
- **Reset:** Use **Reset** to clear attempts, decoys, animations, and the completion state.

## Run locally

No build step or dependency installation is required.

### Prerequisites

- A modern web browser
- Git for cloning the repository
- Python 3 only if you want to use the optional local HTTP server
- Node.js only if you want to run the verification suite

### Installation

1. Clone the repository. Because it is currently private, the GitHub account performing the clone must have access.

   ```bash
   git clone https://github.com/SUDARSHANCHAUDHARI/RunawayButton.git
   cd RunawayButton
   ```

2. Open `index.html` directly in a modern browser.

For a local HTTP server, run this command from the project directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Verification

Run the repository's dependency-free production check:

```bash
./scripts/verify.sh
```

The command checks JavaScript syntax, required files, local asset references, HTML IDs and ARIA references, button semantics, reduced-motion support, escape behaviors, milestone copy, risky browser APIs, ignore coverage, and the complete ten-attempt/catch/reset lifecycle.

## Project structure

```text
RunawayButton/
├── scripts/
│   └── verify.sh        # Dependency-free production checks
├── tests/
│   └── runtime-smoke.js # DOM/runtime lifecycle smoke test
├── AGENTS.md            # Repository guidance for coding agents
├── index.html           # Semantic page structure
├── style.css            # Responsive presentation and motion
├── script.js            # Game state, interactions, audio, and celebration
├── README.md            # Project documentation
└── .gitignore           # Local, generated, and sensitive-file exclusions
```

## Deploy to GitHub Pages

1. Push the project to a GitHub repository.
2. Open the repository's **Settings**.
3. Select **Pages** in the sidebar.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the branch containing the project (usually `main`) and the `/ (root)` folder.
6. Select **Save**.

GitHub Pages will publish the site at the URL shown in the Pages settings. Because all paths are relative and the project has no build step, it works from either a user site or a repository subpath.

See GitHub's official [publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for current Pages options and troubleshooting.

## Release checklist

1. Run `./scripts/verify.sh` and resolve every failure.
2. Confirm the Git working tree contains only intentional changes.
3. Review repository visibility before enabling GitHub Pages or sharing the URL.
4. Test mouse, touch, keyboard, sound, reset, and reduced-motion behavior in target browsers.
5. Publish from the selected branch and `/ (root)` folder.

The repository should remain private until the owner deliberately approves public visibility.

## Accessibility notes

The moving target remains a native button and retains keyboard focus as it escapes. Its fake disabled state uses styling and an announcement instead of the actual `disabled` attribute, so the game never strands keyboard or assistive-technology users. Decorative trails, orbits, decoys, and confetti are hidden from accessibility APIs. With reduced motion enabled, transitions and celebration movement are effectively removed while the game mechanics remain available.

## Privacy and security

- The game runs entirely in the browser.
- It does not collect, store, transmit, or sell personal data.
- It does not use cookies, analytics, advertising, accounts, a backend, or third-party runtime services.
- It does not use `localStorage` or `sessionStorage`; resetting or reloading starts a fresh game.
- Sound is generated locally through the Web Audio API.
- Repository ignore rules exclude common environment files, credentials, signing material, caches, dependencies, and generated output.

## Browser support

RunawayButton uses modern browser APIs, including the Web Audio API, Pointer Events, and the Visual Viewport API when available. It has graceful fallbacks when the Visual Viewport or Web Audio API is unavailable.

## License

No open-source license file is currently included. Contact the author before redistributing or reusing the project outside the permissions provided by applicable law.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
