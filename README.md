# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, and an extensible AI coding-companion architecture.

## Current prototype — v0.23.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- autonomous idle behavior, local mood, micro-roaming, personality, and customization;
- configurable pet name, accessory, motion level, sleep timeout, and autonomous movement;
- **Smart Agenda** with one-time, daily, weekly, and monthly recurrence;
- reminder lead time, editing, snooze, countdowns, daily brief, and 14-day preview;
- `.ics` agenda import/export;
- optional WebView desktop notifications with in-app reminder fallback;
- Pomodoro focus timer;
- built-in PDF Teaching Mode with fullscreen presentation;
- semantic PDF focus targeting, teaching choreography, Presenter Console, and presenter notes;
- Lesson Flow Editor, assessments, local class reports, pacing analytics, Teaching Insights, Smart Lesson Rebalancer, Teaching Templates, and Pre-Class Run Sheet;
- AI Coding Companion state adapter for OpenCode, Codex, Claude Code, Cursor, Kiro, Antigravity, Devin, Copilot CLI, and custom agents.

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
Smart Agenda now supports editing existing recurring items, 5/10/30-minute snooze controls, reminder de-duplication per occurrence, and optional desktop notifications when the host WebView grants notification permission. In-app reminder cards remain the fallback when desktop notification is unavailable.

Agenda can also be exported as a standard `.ics` calendar file and imported from compatible `.ics` files. Imported events support one-time, daily, weekly, and monthly recurrence. Existing local agenda data remains compatible.

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
- Lecturer remains in control of teaching page transitions and plan changes
- Analytics provide evidence and suggestions, not causal judgments
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — richer reactions, accessory packs, and polished movement.
2. **Smart Agenda** — calendar-provider integrations and stronger native notification support.
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
