# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**.

The goal is to combine a living desktop pet with productivity tools, teaching/presentation support, agenda reminders, and AI coding-agent status monitoring.

## MVP scope

- Transparent always-on-top desktop pet
- Drag the pet/window around the desktop
- Eye/cursor reaction and animated pet states
- Agenda + reminders stored locally
- Pomodoro timer
- Built-in PDF Teaching Mode
- Dual-monitor presenter console
- Speech bubbles and status reactions
- Extensible AI-agent state model (OpenCode, Codex, Claude Code, Cursor, Kiro, etc.)
- Local-first architecture; heavier AI features are intended to be opt-in and loaded on demand

## Mascot identity

The official default NyanMate mascot is an original **gray-and-white chibi kitten with a burgundy scarf and gold star badge**. Activity-specific accessories appear only when needed: blue headphones + laptop for coding, and glasses + graduation cap + pointer for teaching. See `docs/MASCOT.md` for the design guide.

## PDF Teaching Mode

### v0.3 — preparation
A PDF can be dropped into NyanMate before class. PDF.js parses it locally, reads the page count and text layer, and creates lightweight teaching cues such as opening/title, key points, chart/visual, formula/metric, code, question/discussion, summary, and general explanation.

### v0.4 — built-in presentation
NyanMate renders the prepared PDF inside its own fullscreen presentation surface and keeps the displayed page synchronized with the teaching cue and mascot animation.

### v0.5 — safe placement + presenter notes
NyanMate estimates text density on the left and right side of every PDF page, chooses a less crowded mascot position, calculates a normalized focus target, and flips the teaching pointer toward the material. Each page can also have automatic and custom presenter notes stored locally.

### v0.6 — dual-monitor presenter mode
NyanMate now includes a dedicated **Presenter Console** window. When two or more displays are detected, you can select the projector display before starting the presentation. The main NyanMate presentation window moves to that display and enters fullscreen, while the separate presenter window stays on the lecturer's primary display.

The private presenter window receives synchronized page state through Tauri events and shows the current page, progress, teaching cue, text preview, and presenter notes. It also has Previous, Next, Ask, Discuss, and End controls that remotely control the projected presentation. If only one display is available, NyanMate automatically falls back to the same-screen notes panel.

Controls:

- `→`, `PageDown`, or `Space`: next page
- `←` or `PageUp`: previous page
- `Q`: question prompt
- `D`: discussion prompt
- `N`: toggle same-screen presenter notes when dual-monitor mode is unavailable/off
- `Esc`: end presentation

Monitor routing depends on the operating system and the connected display topology. The projector selector uses the displays reported by Tauri; users should verify the selected display before class. External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, pointer gestures, quiz/discussion timers, dual-display presenter console.
4. **AI Coding Companion** — normalized state adapters for OpenCode, Codex CLI, Claude Code, Cursor, Kiro, Antigravity.
5. **AI Assistant** — floating chat, drop-a-file actions, screenshot/document assistance.
6. **Plugin Ecosystem** — pet packs, animations, integrations and agent adapters.

## Development

Prerequisites:

- Node.js 20+
- Rust stable
- Tauri platform prerequisites for your operating system

```bash
npm install
npm run tauri dev
```

Frontend-only preview:

```bash
npm run dev
```

## Current status

**v0.6.x prototype** includes the mascot, cursor-following eyes, pet/drag interaction, agenda reminders, Pomodoro, system tray, activity states, local PDF preparation, fullscreen PDF rendering, synchronized navigation, content-density safe-side placement, focus targeting, local presenter notes, display detection, projector selection, and a separate presenter console synchronized by Tauri events.

The next teaching milestone is richer diagram/image region detection and more precise pointer targeting. After that, NyanMate can expand to optional external presentation-app integration and AI-assisted lesson flow.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI modules run only when requested
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
