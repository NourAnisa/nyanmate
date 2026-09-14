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
- Semantic PDF focus targeting
- Timed teaching choreography
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
NyanMate includes a dedicated **Presenter Console** window. With multiple displays, you can select the projector display, while a separate presenter window stays on the lecturer screen with synchronized page state, cues, notes, and remote presentation controls.

### v0.7 — semantic focus targeting
The PDF analyzer builds normalized text boxes from the PDF text layer and classifies each page into teaching-oriented content types. It searches for relevant title, key-point, diagram/table, visual/image, formula, code, question, or summary regions, and computes a safe mascot side, target region, pointer point, focus label, and confidence score.

### v0.8 — teaching choreography
NyanMate now has a page-level choreography state machine. Each prepared page is converted into a short sequence of teaching actions such as **enter, greet, explain, point, think, discuss, summarize, and celebrate**. The action sequence drives the mascot animation and speech bubble while keeping the semantic PDF focus target from v0.7.

Auto-play can advance through the choreography steps using each step's local timer. It deliberately does **not** auto-advance to the next PDF page, so the lecturer remains in control of presentation pacing. The projected window includes a compact choreography controller, and the private Presenter Console mirrors the active action and can move to the previous/next cue or toggle Auto mode remotely.

Presentation controls:

- `→`, `PageDown`, or `Space`: next PDF page
- `←` or `PageUp`: previous PDF page
- `Q`: question prompt
- `D`: discussion prompt
- `N`: toggle same-screen presenter notes when dual-monitor mode is unavailable/off
- `[` / `]`: previous / next choreography cue
- `A`: toggle choreography Auto mode
- `Esc`: end presentation

Monitor routing depends on the operating system and connected display topology. Users should verify the selected projector display before class. External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

The semantic targeting layer remains heuristic and local-first. PDF text and drawing operators do not provide full visual understanding of every embedded chart or image, so richer computer-vision analysis remains an optional future layer rather than a default background process.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, semantic pointer targeting, teaching choreography, quiz/discussion timers, dual-display presenter console.
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

**v0.8.x prototype** includes the mascot, pet interaction, agenda reminders, Pomodoro, system tray, local PDF preparation, fullscreen presentation, synchronized navigation, safe-side placement, presenter notes, dual-monitor Presenter Console, semantic PDF target selection, and timed page-level teaching choreography with manual and Auto controls.

The next teaching milestone is configurable lesson flow: custom pause durations, discussion countdowns, per-page choreography editing, and an optional lesson-plan layer that can group pages into opening, explanation, activity, assessment, and closing sections.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Lecturer remains in control of page transitions
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
