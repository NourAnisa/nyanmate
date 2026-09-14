# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, and an extensible AI coding-companion architecture.

## Current prototype — v0.17.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- local agenda reminders and Pomodoro;
- built-in PDF Teaching Mode with fullscreen presentation;
- semantic PDF focus targeting and teaching choreography;
- dual-monitor Presenter Console and presenter notes;
- Lesson Flow Editor with Opening, Concept, Practice, Quiz, Discussion, Evaluation, and Closing stages;
- per-page Quiz / Check / Practice assessments;
- local class-report history, CSV export, and print/save-to-PDF;
- page dwell-time and stage analytics;
- rule-based Teaching Insights and post-class reflection;
- Plan-vs-Actual pacing and discussion-event history;
- Smart Lesson Rebalancer using historical timing;
- built-in Teaching Templates for theory, practicum, group discussion, and seminar classes;
- **custom reusable teaching templates** saved locally;
- **Pre-Class Run Sheet** with total planned time, stage breakdown, assessment pages, discussion pages, checkpoints, and long-duration pages.

## Teaching Companion milestones

### v0.3–v0.8 — PDF presentation foundation
PDF.js prepares PDFs locally, extracts text-layer teaching cues, renders the PDF in NyanMate's own presentation surface, estimates safer mascot placement/focus targets, supports presenter notes and dual-monitor control, and converts pages into short teaching choreography sequences.

### v0.9 — Lesson Flow Editor
Each page can store a lesson stage, target duration, discussion duration, choreography behavior, and lecturer note.

### v0.10 — Classroom assessment
Quiz, Check, and Practice interactions can be attached to PDF pages with countdown, answer choices, answer reveal, and explanation.

### v0.11–v0.14 — Reports and teaching analytics
NyanMate records local session history, page coverage, assessment results, page/stage timing, plan-vs-actual pacing, discussion events, automatic teaching insights, and post-class reflection suggestions.

### v0.15 — Smart Lesson Rebalancer
Historical pacing can generate conservative duration suggestions. Suggestions require comparable sessions and remain lecturer-controlled through **Accept** or **Accept all** actions.

### v0.16 — Teaching Templates
Built-in templates allocate a chosen class duration across reusable teaching patterns such as **Kuliah Teori**, **Praktikum**, **Diskusi Kelompok**, and **Presentasi Seminar**.

### v0.17 — Custom Templates + Pre-Class Run Sheet
An edited Lesson Flow can now be saved as a named personal template and reused on another PDF. If the new PDF has a different page count, NyanMate maps the saved page pattern proportionally while preserving the target PDF's lecturer notes.

The **Pre-Class Run Sheet** summarizes the active Lesson Flow before class: total planned duration, page count, stage totals, assessment pages, discussion pages, combined checkpoints, and unusually long pages. This gives the lecturer a compact readiness check without sending teaching data to a cloud service.

## Presentation controls

- `→`, `PageDown`, or `Space`: next PDF page
- `←` or `PageUp`: previous PDF page
- `Q`: question prompt
- `D`: start and record a discussion event
- `E`: open / close page assessment
- `1`–`4`: choose A–D while an assessment is open
- `R`: reveal assessment answer
- `N`: same-screen presenter notes when dual-monitor mode is unavailable/off
- `[` / `]`: previous / next choreography cue
- `A`: toggle choreography Auto mode
- `Esc`: close assessment first, otherwise end presentation

## Architecture principles

- Lightweight and event-driven
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Lecturer remains in control of page transitions and plan changes
- Analytics provide evidence and suggestions, not causal judgments
- Templates are explicit user actions, never silent plan changes
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — richer idle/walk/sleep interactions and customization.
2. **Smart Agenda** — recurring reminders, daily brief, and calendar integrations.
3. **Teaching Companion** — continue toward reusable class workflows and optional anonymous response collection.
4. **AI Coding Companion** — normalized adapters for OpenCode, Codex CLI, Claude Code, Cursor, Kiro, Antigravity, and others.
5. **AI Assistant** — floating chat and drop-a-file actions.
6. **Plugin Ecosystem** — pet packs, animations, integrations, and agent adapters.

## Development

Prerequisites: Node.js 20+, Rust stable, and the Tauri platform prerequisites for your OS.

```bash
npm install
npm run tauri dev
```

Frontend-only preview:

```bash
npm run dev
```

## License

To be decided before public release.
