# RunawayButton Repository Instructions

## Project

RunawayButton is a dependency-free static web game built with semantic HTML, CSS, and vanilla JavaScript. It deploys directly from the repository root without a build step.

## Constraints

- Keep the runtime free of frameworks, external images, backend services, analytics, and paid services.
- Preserve mouse, pen, touch, and keyboard behavior for every game-state change.
- Keep the real target button inside the visual viewport and keep sound/reset controls reachable.
- Preserve `prefers-reduced-motion` behavior and visible keyboard focus.
- Do not use unsafe HTML injection, `eval`, remote runtime assets, or secret-bearing configuration.
- Do not add GitHub Actions or change repository visibility without Sudarshan's explicit approval.

## Source map

- `index.html`: semantic structure and accessible labels
- `style.css`: responsive layout, state styling, and motion preferences
- `script.js`: state machine, escape tactics, audio, viewport bounds, and celebration
- `tests/runtime-smoke.js`: dependency-free interaction lifecycle smoke test
- `scripts/verify.sh`: main verification entry point

## Verification

Run this before committing, pushing, deploying, or declaring the project production ready:

```bash
./scripts/verify.sh
```

Manual browser review remains required before public release for visual layout, real pointer/touch behavior, audio, and assistive-technology experience.

## Git and release

- Use `SUDARSHANCHAUDHARI <sunny.sudarshan@gmail.com>` for this personal repository.
- Stage files explicitly; do not use `git add .`.
- Keep commits small and describe the behavior changed.
- Keep the GitHub repository private until Sudarshan explicitly approves public visibility.
- Deploy to GitHub Pages from the selected branch and repository root only after verification passes.
