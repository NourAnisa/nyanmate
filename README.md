# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, file inspection, and an extensible AI/coding-companion architecture.

## Current prototype — v0.25.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- autonomous idle behavior, local mood, micro-roaming, personality, and customization;
- configurable pet name, accessory, motion level, sleep timeout, and autonomous movement;
- Smart Agenda with one-time/daily/weekly/monthly recurrence, editing, snooze, reminders, Daily Brief, countdowns, and `.ics` import/export;
- Pomodoro focus timer;
- built-in PDF Teaching Mode with fullscreen presentation, semantic focus targeting, choreography, Presenter Console, presenter notes, assessments, local reports, pacing analytics, Teaching Insights, Smart Lesson Rebalancer, Teaching Templates, and Pre-Class Run Sheet;
- AI Coding Companion state normalization for OpenCode, Codex, Claude Code, Cursor, Kiro, Antigravity, Devin, Copilot CLI, and custom agents;
- **Drop-a-File Assistant** for local inspection of text, Markdown, JSON, common source-code files, and PDF hand-off guidance;
- **Local Assistant Chat** with persistent local history and explicit loaded-file context consent.

## Desktop Pet milestones

### v0.18 — AI Coding Companion
NyanMate accepts normalized coding-agent states: `idle`, `starting`, `thinking`, `coding`, `running`, `waiting`, `success`, and `error`.

### v0.19 — Living Pet Behavior
The mascot gained lightweight autonomous idle activities such as looking around, grooming, stretching, resting, and dozing.

### v0.20 — Mood + Micro-Roaming
A deterministic local mood layer adds calm, curious, playful, and sleepy states without camera, microphone, or screen surveillance.

### v0.21 — Personality + Customization
Right-click the mascot to configure pet name, personality, accessory, motion intensity, sleep timeout, and autonomous movement. Settings remain local on the device.

## Productivity milestones

### v0.22 — Smart Agenda
Smart Agenda gained its own desktop window from the NyanMate system tray, recurring schedules, configurable reminder lead time, Daily Brief, Today view, and a 14-day occurrence preview.

### v0.23 — Agenda Edit, Snooze + Calendar Exchange
Smart Agenda supports editing recurring items, 5/10/30-minute snooze controls, reminder de-duplication per occurrence, optional WebView desktop notifications, and `.ics` import/export.

## Assistant milestones

### v0.24 — Drop-a-File Assistant
A dedicated File Assistant window is available from the system tray. Users can drop or choose PDF, TXT, Markdown, JSON, CSV/log, and common source-code files. Text/code inspection runs locally and does not upload files automatically.

The lightweight scanner detects file type, code language, line/word counts, simple declarations/imports, readable previews, and local actions such as **Summarize**, **Explain**, and **Inspect code**. PDFs are recognized and routed toward the existing Teaching Companion workflow.

### v0.25 — Local Assistant Chat
The File Assistant now includes a Chat tab with persistent local conversation history. This first chat engine is intentionally deterministic and offline: it can explain NyanMate features, Smart Agenda, teaching mode, coding-agent behavior, privacy, and the currently loaded file summary.

Loaded-file context is **off by default** and must be explicitly enabled with **Use loaded file context**. v0.25 does **not** silently call a cloud model and does not pretend that general open-ended LLM reasoning is available. External AI providers are planned as opt-in adapters in a later milestone.

## Teaching Companion milestones

### v0.3–v0.8 — PDF presentation foundation
PDF.js prepares PDFs locally, extracts text-layer teaching cues, renders PDFs in NyanMate's own presentation surface, estimates safer mascot placement/focus targets, supports presenter notes and dual-monitor control, and converts pages into short teaching choreography sequences.

### v0.9–v0.17 — Lesson workflow, assessment, analytics, and templates
NyanMate adds Lesson Flow planning, Quiz/Check/Practice interactions, local class-report history, page/stage timing, Plan-vs-Actual pacing, Teaching Insights, Smart Lesson Rebalancer, built-in/custom Teaching Templates, and the Pre-Class Run Sheet.

## Architecture principles

- Lightweight and event-driven
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- No camera or screen monitoring for pet mood
- Files are not uploaded automatically
- Cloud/AI providers must be explicit opt-in integrations
- Lecturer remains in control of teaching page transitions and plan changes
- Analytics provide evidence and suggestions, not causal judgments
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — richer reactions, accessory packs, and polished movement.
2. **Smart Agenda** — calendar-provider integrations and stronger native notification support.
3. **Teaching Companion** — maintain and polish existing local teaching workflow.
4. **AI Coding Companion** — connect normalized states to real local CLI adapters.
5. **AI Assistant** — opt-in provider adapters, richer chat, and direct file-to-teaching hand-off.
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
