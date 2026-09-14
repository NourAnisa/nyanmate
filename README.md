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
- Local quiz / check / practice interactions
- Post-class local session reports
- Class Report Dashboard with history, recap, CSV export, and print-to-PDF
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
The lecturer can edit the teaching plan before class on a per-page basis. Each page can be assigned a stage: **Opening, Concept, Practice, Quiz, Discussion, Evaluation, or Closing**. The editor also stores a target page duration, discussion duration, whether choreography cues should auto-play, and an optional lecturer note.

Lesson flow is saved locally per PDF. During presentation, the current stage and countdown are shown on the projected top bar and synchronized to the private Presenter Console. Choreography adapts to the selected lesson stage.

### v0.10 — assessment & classroom interaction
A local **Assessment Editor** can attach a Quiz, Check, or Practice interaction to any PDF page. Each interaction stores a question, four editable options, the correct option, countdown time, and a reveal explanation. All assessment data is stored locally per PDF.

During presentation, the lecturer can launch the assessment from the projected navigation or Presenter Console. Students see a large student-facing question overlay with countdown, answer choices, selected state, answer reveal, and explanation. The lecturer can control Start, Reveal, and Close from the private Presenter Console. Keyboard control is also available: `E` opens/closes the page assessment, `1`–`4` select A–D, and `R` reveals the answer while the assessment is open.

NyanMate records lightweight local session data when a presentation ends: start/end time, class duration, PDF pages visited, assessment attempts, selected answer, correctness when an answer was selected, and whether the answer was revealed. This is a local teaching summary, not a student identity or grading system.

### v0.11 — Class Report Dashboard
NyanMate now keeps up to 100 local session reports per PDF and maintains a material index for the report viewer. A dedicated **Class Reports** window can be opened from the system-tray menu without interrupting the desktop pet.

The dashboard shows session count, total and average teaching time, unique pages visited, assessment count, and answer accuracy for recorded attempts. A lecturer can inspect individual sessions, page coverage, and assessment results. **Export CSV** downloads the report history for the selected material, while **Print / Save PDF** uses the operating system print dialog with a print-friendly report layout.

Presentation controls:

- `→`, `PageDown`, or `Space`: next PDF page
- `←` or `PageUp`: previous PDF page
- `Q`: question prompt
- `D`: discussion prompt
- `E`: open / close configured assessment for the current page
- `1`–`4`: choose A–D while an assessment is open
- `R`: reveal assessment answer
- `N`: toggle same-screen presenter notes when dual-monitor mode is unavailable/off
- `[` / `]`: previous / next choreography cue
- `A`: toggle choreography Auto mode
- `Esc`: close assessment first, otherwise end presentation

Monitor routing depends on the operating system and connected display topology. Users should verify the selected projector display before class. External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

The semantic targeting layer remains heuristic and local-first. PDF text and drawing operators do not provide full visual understanding of every embedded chart or image, so richer computer-vision analysis remains an optional future layer rather than a default background process.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, semantic pointer targeting, choreography, Lesson Flow Editor, assessments, activity checkpoints, Class Report Dashboard, dual-display presenter console.
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

**v0.11.x prototype** includes the mascot, pet interaction, agenda reminders, Pomodoro, system tray, local PDF preparation, fullscreen presentation, synchronized navigation, safe-side placement, presenter notes, dual-monitor Presenter Console, semantic PDF target selection, timed teaching choreography, Lesson Flow Editor, per-page assessment configuration, projected quiz/check/practice interactions, answer reveal, local class-report history, a dedicated Class Reports window, CSV export, and print-to-PDF support.

The next teaching milestone can add richer analytics such as stage-by-stage timing, page dwell time, discussion timing history, comparison across repeated classes, and optional anonymous student-response collection through a local QR/session code without student accounts.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Lecturer remains in control of page transitions
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
