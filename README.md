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
- Lesson Flow Editor with per-page teaching stages and timers
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
Each prepared page is converted into a short sequence of teaching actions such as **enter, greet, explain, point, think, discuss, summarize, and celebrate**. Auto mode advances cue-by-cue using local timers, while the lecturer remains in control of PDF page transitions.

### v0.9 — Lesson Flow Editor
The lecturer can now edit the teaching plan before class on a per-page basis. Each page can be assigned a stage: **Opening, Concept, Practice, Quiz, Discussion, Evaluation, or Closing**. The editor also stores a target page duration, discussion duration, whether choreography cues should auto-play, and an optional lecturer note.

Lesson flow is saved locally per PDF. During presentation, the current stage and countdown are shown on the projected top bar and synchronized to the private Presenter Console. Choreography now adapts to the selected lesson stage: Practice pages get practice-oriented explanation, Quiz pages use think/discuss behavior, Discussion pages honor the configured discussion duration, Evaluation pages pause for understanding checks, and Closing pages summarize and celebrate.

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
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, semantic pointer targeting, choreography, Lesson Flow Editor, quiz/discussion timers, dual-display presenter console.
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

**v0.9.x prototype** includes the mascot, pet interaction, agenda reminders, Pomodoro, system tray, local PDF preparation, fullscreen presentation, synchronized navigation, safe-side placement, presenter notes, dual-monitor Presenter Console, semantic PDF target selection, timed page-level teaching choreography, and a local per-PDF Lesson Flow Editor.

The next teaching milestone is a richer assessment/activity layer: reusable quiz prompts, discussion countdown UI, activity checkpoints, and optional post-class lesson summaries.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Lecturer remains in control of page transitions
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
