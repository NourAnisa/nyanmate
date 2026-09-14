# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, and an extensible AI coding-companion architecture.

## Current prototype — v0.19.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- autonomous idle behavior with looking around, grooming, stretching, and local inactivity sleep;
- local agenda reminders and Pomodoro;
- normalized AI coding-agent states and a local coding-companion test panel;
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
- built-in and custom reusable Teaching Templates;
- Pre-Class Run Sheet with stage breakdown, checkpoints, assessments, and discussion pages.

## Desktop Companion milestones

### v0.18 — AI Coding Companion
NyanMate now normalizes coding-agent activity into a shared state contract: **idle, starting, thinking, coding, running, waiting, success, error**. Profiles are prepared for OpenCode, Codex, Claude Code, Cursor, Kiro, Antigravity, Devin, Copilot CLI, and custom adapters.

The mascot reacts to those normalized states, while a local test panel acts as a development harness for future real CLI adapters. Teaching Mode keeps priority so coding-agent events do not interrupt a class presentation.

### v0.19 — Living Pet Behavior
The desktop pet now has an autonomous lightweight idle-life loop. While the externally controlled state is `idle`, NyanMate can look around, groom, stretch, rest, and eventually nap after local inactivity. Keyboard/pointer activity inside the NyanMate window wakes the pet again.

This layer intentionally remains event/light-timer based and does **not** continuously inspect the screen, camera, microphone, or user files. The current inactivity detection is local to the NyanMate window; operating-system-wide activity hooks can be added later only if they are worth the platform complexity.

Animations respect `prefers-reduced-motion`.

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
An edited Lesson Flow can be saved as a named personal template and reused on another PDF. The Pre-Class Run Sheet summarizes total planned duration, stage totals, assessment pages, discussion pages, checkpoints, and unusually long pages.

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
- Teaching templates are explicit user actions, never silent plan changes
- Desktop-pet behavior avoids always-on screen/camera monitoring
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — walking/position behaviors, richer reactions, mood, and customization.
2. **AI Coding Companion** — real adapters for OpenCode first, then other supported coding agents.
3. **Smart Agenda** — recurring reminders, daily brief, and calendar integrations.
4. **AI Assistant** — floating chat and drop-a-file actions.
5. **Teaching Companion** — polish existing presentation, analytics, and reusable class workflows.
6. **Plugin Ecosystem** — pet packs, animations, integrations, and agent adapters.

Anonymous student-response / QR-session collection is intentionally **not** part of the current roadmap.

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
