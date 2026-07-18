# RunawayButton

RunawayButton is a playful, standalone web experience built around one stubborn idea: a large button that refuses to be clicked. It dodges, shrinks, spins, changes its story, and deploys decoys while counting every attempt.

After five attempts it acknowledges your persistence. After ten, it finally stays still and lets you win.

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

## Controls

- **Mouse or pen:** Move toward the button. It reacts when the pointer gets close.
- **Touch:** Tap the button or one of its decoys.
- **Keyboard:** Press `Tab` until the button is focused, then press `Enter` or `Space`.
- **Sound:** Use the **Sound on/off** control. Browsers require an initial click, tap, or key press before audio can play.
- **Reset:** Use **Reset** to clear attempts, decoys, animations, and the completion state.

## Run locally

No build step or dependency installation is required.

1. Clone or download the repository.
2. Open `index.html` directly in a modern browser.

For a local HTTP server, run one of these commands from the project directory:

```bash
python3 -m http.server 8000
```

or:

```bash
npx serve .
```

Then open `http://localhost:8000` (or the address printed by `serve`).

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

## Browser support

RunawayButton uses modern browser APIs, including the Web Audio API, Pointer Events, and the Visual Viewport API when available. It has graceful fallbacks when the Visual Viewport or Web Audio API is unavailable.
