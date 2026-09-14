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
NyanMate now estimates text density on the left and right side of every PDF page. It chooses the less crowded side as a **safe side** for the mascot, calculates a normalized focus target from the page text layout, and flips the teaching pointer so it faces toward the material.

Each page also gets an automatically generated presenter note. Press `N` during a presentation to open the notes panel and add your own page-specific notes; custom notes are stored locally in the browser/Tauri storage.

Controls:

- `→`, `PageDown`, or `Space`: next page
- `←` or `PageUp`: previous page
- `Q`: question prompt
- `D`: discussion prompt
- `N`: toggle presenter notes
- `Esc`: end presentation

The current presenter-notes panel is still part of the same presentation window. **True dual-monitor presenter mode**—private notes on the lecturer laptop while the projector shows only the PDF + NyanMate—requires a separate presenter window and explicit monitor routing and is a later milestone.

External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, pointer gestures, quiz/discussion timers, dual-display presenter notes.
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

**v0.5.x prototype** includes the mascot, cursor-following eyes, pet/drag interaction, agenda reminders, Pomodoro, system tray, activity states, local PDF preparation, fullscreen PDF rendering, synchronized navigation, content-density-based safe-side placement, focus targeting, and local presenter notes.

The next teaching milestone is true dual-monitor presenter mode, followed by richer target detection for diagrams/images and optional support for external presentation applications.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI modules run only when requested
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
