# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**.

The goal is to combine a living desktop pet with productivity tools, teaching/presentation support, agenda reminders, and AI coding-agent status monitoring.

## MVP scope

- Transparent always-on-top desktop pet
- Drag the pet/window around the desktop
- Eye/cursor reaction and animated pet states
- Agenda + reminders stored locally
- Pomodoro timer
- Teaching mode for presentations/PDF sessions
- Speech bubbles and status reactions
- Extensible AI-agent state model (OpenCode, Codex, Claude Code, Cursor, Kiro, etc.)
- Local-first architecture; heavier AI features are intended to be opt-in and loaded on demand

## Mascot identity

The official default NyanMate mascot is an original **gray-and-white chibi kitten with a burgundy scarf and gold star badge**. Activity-specific accessories appear only when needed: blue headphones + laptop for coding, and glasses + graduation cap + pointer for teaching. See `docs/MASCOT.md` for the design guide.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PowerPoint/PDF/Slides presentation mode, pointer gestures, quiz/discussion timers, presenter notes.
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

**v0.2.x prototype** now includes the official mascot direction, cursor-following eyes, pet/drag interaction, agenda reminders, Pomodoro, system-tray support, activity states, and an interactive Teaching Mode scaffold. The next milestone is real PDF ingestion/rendering and page-aware teaching choreography.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI modules run only when requested
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
