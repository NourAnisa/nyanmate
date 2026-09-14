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
- Teaching Analytics with per-page dwell time and stage timing
- Teaching Insights with pacing, assessment, coverage, trend, and reflection rules
- Plan-vs-Actual pacing analytics and discussion-event history
- Smart Lesson Rebalancer using historical timing
- Reusable Teaching Templates with class-duration allocation
- Speech bubbles and status reactions
- Extensible AI-agent state model (OpenCode, Codex, Claude Code, Cursor, Kiro, etc.)
- Local-first architecture; heavier AI features are intended to be opt-in and loaded on demand

## Mascot identity

The official default NyanMate mascot is an original **gray-and-white chibi kitten with a burgundy scarf and gold star badge**. Activity-specific accessories appear only when needed: blue headphones + laptop for coding, and glasses + graduation cap + pointer for teaching. See `docs/MASCOT.md` for the design guide.

## PDF Teaching Mode milestones

### v0.3 — preparation
PDF.js parses PDFs locally, reads page count/text layers, and creates lightweight teaching cues.

### v0.4 — built-in presentation
Prepared PDFs render inside NyanMate's fullscreen presentation surface with synchronized page state.

### v0.5 — safe placement + presenter notes
NyanMate estimates text density, chooses a safer mascot side, computes a focus point, and supports local presenter notes.

### v0.6 — dual-monitor presenter mode
A private Presenter Console can remain on the lecturer display while the PDF is projected separately.

### v0.7 — semantic focus targeting
Local PDF heuristics classify teaching content and estimate title, key-point, formula, code, visual, question, and summary focus regions.

### v0.8 — teaching choreography
Prepared pages become short teaching-action sequences such as enter, greet, explain, point, think, discuss, summarize, and celebrate.

### v0.9 — Lesson Flow Editor
Each page can be assigned a stage: **Opening, Concept, Practice, Quiz, Discussion, Evaluation, or Closing**, plus a target duration, discussion duration, auto-choreography setting, and lecturer note.

### v0.10 — assessment & classroom interaction
Quiz, Check, and Practice activities can be attached to PDF pages. The presentation overlay supports answer choices, countdowns, reveal explanations, and presenter controls. Session data stays local.

### v0.11 — Class Report Dashboard
NyanMate keeps local session histories and provides a dedicated reports window with recap, CSV export, and print/save-to-PDF.

### v0.12 — Teaching Analytics
Actual dwell time is measured per page and aggregated by lesson stage. Revisited pages continue accumulating time instead of creating duplicate timing rows.

### v0.13 — Teaching Insights
A deterministic local rules engine surfaces pacing outliers, dominant stages, assessment patterns, session-duration trends, coverage changes, and post-class reflection suggestions.

### v0.14 — Plan vs Actual + Discussion History
Each session stores a snapshot of planned page durations and discussion events. The dashboard compares planned vs actual pacing and classifies pages as **Under**, **On target**, or **Over**.

### v0.15 — Smart Lesson Rebalancer
The Lesson Flow Editor can now use historical Plan-vs-Actual records to suggest revised page durations. Suggestions require at least two comparable sessions and a meaningful timing gap. NyanMate blends the current target with observed timing rather than blindly copying one average, rounds suggestions to five-second steps, and exposes confidence levels.

The lecturer remains in control: individual suggestions can be accepted one-by-one or all at once. No historical recommendation silently changes the lesson plan.

### v0.16 — Teaching Templates
The Lesson Flow Editor now includes reusable templates for common teaching formats:

- **Kuliah Teori** — concept-heavy flow with discussion, quiz, and closing
- **Praktikum** — short briefing followed by practice and evaluation
- **Diskusi Kelompok** — discussion-heavy session with briefing and evaluation
- **Presentasi Seminar** — compact presentation, Q&A, evaluation, and closing

Each template has a default class duration, but the lecturer can set any duration from 10–360 minutes before applying it. NyanMate maps the template stages across the PDF pages and allocates the total class time proportionally across those stages. Discussion and quiz pages receive suitable interaction-time defaults.

Applying a template updates **stage, target page time, discussion time, and auto choreography**, while preserving lecturer notes. The resulting Lesson Flow is still editable page-by-page and can later be refined again by the Smart Lesson Rebalancer after more real teaching sessions are recorded.

## Presentation controls

- `→`, `PageDown`, or `Space`: next PDF page
- `←` or `PageUp`: previous PDF page
- `Q`: question prompt
- `D`: start and record a discussion event
- `E`: open / close configured assessment for the current page
- `1`–`4`: choose A–D while an assessment is open
- `R`: reveal assessment answer
- `N`: toggle same-screen presenter notes when dual-monitor mode is unavailable/off
- `[` / `]`: previous / next choreography cue
- `A`: toggle choreography Auto mode
- `Esc`: close assessment first, otherwise end presentation

Monitor routing depends on the operating system and connected display topology. Users should verify the selected projector display before class. External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

The semantic targeting and Teaching Insights layers are intentionally lightweight. PDF heuristics do not provide full visual understanding, and analytics do not infer causation. Richer vision or AI interpretation can remain optional modules rather than background requirements.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, semantic pointer targeting, choreography, Lesson Flow Editor, assessments, Teaching Templates, Smart Rebalancer, Class Report Dashboard, Teaching Analytics, Teaching Insights, Plan-vs-Actual, dual-display presenter console.
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

**v0.16.x prototype** includes the mascot, pet interaction, agenda reminders, Pomodoro, system tray, local PDF preparation, fullscreen presentation, synchronized navigation, safe-side placement, presenter notes, dual-monitor Presenter Console, semantic PDF target selection, timed teaching choreography, Lesson Flow Editor, per-page assessments, local report history, CSV export, print-to-PDF, per-page/stage timing analytics, automatic teaching insights, post-class reflection suggestions, target-vs-actual pacing, discussion-event history, historical duration rebalancing, and reusable teaching templates.

The next teaching milestone can focus on **custom reusable templates and class-run plans**: save a lecturer's edited Lesson Flow as a named personal template, reuse it on another PDF, and provide a pre-class run sheet showing stage totals, planned breakpoints, assessments, and discussion checkpoints. A later opt-in milestone can add anonymous student-response collection through a local QR/session code without student accounts.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Lecturer remains in control of page transitions
- Analytics provide evidence and suggestions, not causal judgments
- Templates are explicit user actions, never silent plan changes
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
