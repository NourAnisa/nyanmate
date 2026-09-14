# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, and an extensible AI coding-companion architecture.

## Current prototype — v0.20.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- autonomous idle behavior with looking around, grooming, stretching, resting, and dozing;
- local mood model with calm, curious, playful, and sleepy states;
- lightweight micro-roaming inside the companion window;
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
- built-in and custom reusable Teaching Templates;
- Pre-Class Run Sheet;
- AI Coding Companion state adapter for OpenCode, Codex, Claude Code, Cursor, Kiro, Antigravity, Devin, Copilot CLI, and custom agents.

## Desktop Pet milestones

### v0.18 — AI Coding Companion
NyanMate accepts a normalized coding-agent state contract: `idle`, `starting`, `thinking`, `coding`, `running`, `waiting`, `success`, and `error`. Those states map to mascot reactions without requiring heavy background AI.

### v0.19 — Living Pet Behavior
The mascot gained lightweight autonomous idle activities such as looking around, grooming, stretching, resting, and dozing. The behavior remains local and event-driven.

### v0.20 — Mood + Micro-Roaming
NyanMate now has a deterministic local mood layer with **calm, curious, playful, and sleepy** states. Mood is derived from recent local interaction and inactivity rather than camera, microphone, or screen surveillance.

Repeated petting can make NyanMate more playful, inactivity lowers energy, and extended inactivity makes the mascot sleepy. A small bounded roaming pattern lets the mascot shift position naturally inside its desktop companion area without constantly moving the operating-system window.

The mascot tooltip exposes lightweight Energy and Affection values for debugging/feedback. Autonomous movement stops while NyanMate is in active coding, teaching, success, error, or other externally controlled states. Animations also respect `prefers-reduced-motion`.

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
Historical pacing can generate conservative duration suggestions. Suggestions remain lecturer-controlled.

### v0.16 — Teaching Templates
Built-in templates allocate a chosen class duration across reusable teaching patterns such as Kuliah Teori, Praktikum, Diskusi Kelompok, and Presentasi Seminar.

### v0.17 — Custom Templates + Pre-Class Run Sheet
Edited Lesson Flows can be saved as reusable personal templates. The Pre-Class Run Sheet summarizes planned duration, stage totals, assessment pages, discussion pages, checkpoints, and long pages.

## Architecture principles

- Lightweight and event-driven
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- No camera or screen monitoring for pet mood
- Lecturer remains in control of teaching page transitions and plan changes
- Analytics provide evidence and suggestions, not causal judgments
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — richer movement, reactions, customization, accessories, and pet personality.
2. **Smart Agenda** — recurring reminders, daily brief, and calendar integrations.
3. **Teaching Companion** — maintain and polish existing local teaching workflow.
4. **AI Coding Companion** — connect normalized states to real local CLI adapters.
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
