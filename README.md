# NyanMate 🐱

NyanMate is a lightweight, local-first AI desktop companion built with **Tauri 2 + Vue 3 + TypeScript + Rust**. It combines an original desktop pet with productivity tools, PDF teaching support, local analytics, reminders, file inspection, and an extensible AI/coding-companion architecture.

## Current prototype — v0.29.x

NyanMate currently includes:

- transparent always-on-top desktop pet with interaction states;
- autonomous idle behavior, local mood, micro-roaming, personality, and customization;
- **8 original cat characters** with different colors, markings, silhouettes, and animation accents;
- mouse-following eyes, petting/purring reaction, mochi-style drag stretch, fast-cursor hunting, keyboard kneading/overheat, scroll tissue reaction, wellness reminders, fixed message, owner-name reminders, and peeking mode;
- configurable pet name, owner name, accessory, motion level, sleep timeout, autonomous movement, stretch/water interval, and interactive-reaction toggles;
- Smart Agenda with one-time/daily/weekly/monthly recurrence, editing, snooze, reminders, Daily Brief, countdowns, and `.ics` import/export;
- Pomodoro focus timer;
- built-in PDF Teaching Mode with fullscreen presentation, semantic focus targeting, choreography, Presenter Console, presenter notes, assessments, local reports, pacing analytics, Teaching Insights, Smart Lesson Rebalancer, Teaching Templates, and Pre-Class Run Sheet;
- AI Coding Companion state normalization for OpenCode, Codex, Claude Code, Cursor, Kiro, Antigravity, Devin, Copilot CLI, and custom agents;
- Drop-a-File Assistant, Local Assistant Chat, and an opt-in OpenAI-compatible provider adapter;
- **Windows installer packaging** with downloadable NSIS `setup.exe` and MSI builds through GitHub Releases.

## Download & install on Windows

End users do **not** need Node.js, Rust, Git, or a terminal.

1. Open the repository **Releases** page.
2. Open the newest NyanMate release.
3. Download the file ending in **`setup.exe`** for the easiest installation.
4. Double-click it and follow the setup wizard.
5. Launch **NyanMate** from the Windows Start Menu.

An `.msi` package is also generated as an alternative. The NSIS installer is configured as a **current-user install**, so it normally does not require Administrator privileges. Current development builds are not code-signed yet, so Windows SmartScreen may show an Unknown publisher warning.

See [`INSTALL.md`](INSTALL.md) for the full installation and release-build guide.

## Desktop Pet milestones

### v0.18–v0.21 — Living pet foundation
NyanMate gained normalized coding-agent reactions, autonomous look-around/groom/stretch/rest/doze behavior, deterministic local mood, bounded micro-roaming, personality, accessories, sleep settings, and persistent local customization.

### v0.27 — Cat Collection
NyanMate adds eight original cat variants: **Momo, Kuro, Mikan, Yuki, Sora, Mocha, Sakura, and Tora**. Variants have their own fur palettes, markings, silhouette adjustments, eye accents, tail/body details, and selected animation differences rather than being simple recolors.

### v0.28 — Interactive Cat Pack
NyanMate adds original equivalents for classic desktop-pet interactions:

- **Eye Follow** — eyes track the pointer.
- **Mochi Drag** — dragging temporarily stretches the mascot before native window drag.
- **Cursor Hunting** — fast pointer movement triggers a short pounce/hunt reaction.
- **Head Pet / Purr** — clicking the head produces a visible `prrrr` reaction.
- **Keyboard Kneading** — keyboard activity alternates the front paws.
- **Overheat** — rapid key activity makes the cat blush/heat up and emits animated steam.
- **Stretch Reminder** — configurable local timer asks the user to stretch.
- **Water Reminder** — configurable hydration reminder.
- **Scroll Tissue Reaction** — wheel activity triggers a playful tissue-roll animation.
- **Fixed Message** — a short pinned message can stay above the mascot.
- **Owner Name** — reminders can address the user by name.
- **Peeking Mode** — optional screen-edge visual mode.

### v0.29 — Windows desktop distribution
NyanMate now includes a Windows release pipeline that builds normal installable desktop packages. GitHub Actions can generate both an NSIS `setup.exe` and `.msi`, publish them to a GitHub Release, and provide a much simpler download/install flow for non-developers.

## Productivity milestones

### v0.22–v0.23 — Smart Agenda
Smart Agenda has its own desktop window with recurring schedules, configurable reminder lead time, Daily Brief, Today/14-day previews, editing, snooze, reminder de-duplication, optional WebView notifications, and `.ics` import/export.

## Assistant milestones

### v0.24 — Drop-a-File Assistant
A dedicated File Assistant window accepts PDF, TXT, Markdown, JSON, CSV/log, and common source-code files. Text/code inspection runs locally and does not upload files automatically.

### v0.25 — Local Assistant Chat
The Assistant includes persistent local chat history and explicit loaded-file context consent. The default chat engine is deterministic and offline.

### v0.26 — Opt-in AI Provider Adapter
Users may optionally configure an OpenAI-compatible endpoint/model. API keys are not committed to source code and currently remain session-only. Remote loaded-file context requires a second explicit approval before it can be included in a request.

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
- Cloud/AI providers are explicit opt-in integrations
- Remote file context requires separate explicit approval
- API keys are not committed to source code
- Original visuals and behavior; NyanMate is not a copy of third-party character assets

## Planned modules

1. **Living Desktop Pet** — global input polishing, richer pet physics, audio packs, and automatic edge-peek behavior.
2. **Smart Agenda** — calendar-provider integrations and stronger native notification support.
3. **Teaching Companion** — maintain and polish existing local teaching workflow.
4. **AI Coding Companion** — connect normalized states to real local CLI adapters.
5. **AI Assistant** — native secret storage, streaming responses, provider presets, and direct file-to-teaching hand-off.
6. **Plugin Ecosystem** — pet packs, animations, integrations, and agent adapters.

## Development

Prerequisites: Node.js 20+, Rust stable, and the Tauri platform prerequisites for your OS.

```bash
npm install
npm run tauri dev
```

Build Windows installers locally on Windows:

```bash
npm install
npm run desktop:build
```

Frontend-only preview:

```bash
npm run dev
```

## License

To be decided before public release.
