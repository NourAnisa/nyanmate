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
The PDF analyzer now builds normalized text boxes from the PDF text layer and classifies each page into teaching-oriented content types. It searches for the most relevant text/caption region for that type, rather than simply targeting the largest text item.

Current semantic target categories include **title, text/key points, diagram/table, visual/image, formula/metric, code, question, and summary**. Image-heavy pages are detected through PDF.js drawing operators when the text layer is sparse. Each page receives a focus label, normalized target region, confidence score, safe mascot side, pointer target, and presenter note that references the intended focus area.

The PDF preparation panel exposes the detected focus label, focus kind, confidence, and mascot side so the lecturer can inspect the analysis before presenting. The projected focus marker continues to use the computed target point.

This is still a lightweight heuristic system: PDF text and drawing operators do not provide full semantic understanding of every embedded chart or image. Precise object segmentation and computer-vision-based recognition are future opt-in features so the default application remains lightweight and local-first.

Controls:

- `→`, `PageDown`, or `Space`: next page
- `←` or `PageUp`: previous page
- `Q`: question prompt
- `D`: discussion prompt
- `N`: toggle same-screen presenter notes when dual-monitor mode is unavailable/off
- `Esc`: end presentation

Monitor routing depends on the operating system and connected display topology. Users should verify the selected projector display before class. External Adobe Reader/browser page tracking is not implemented yet; the reliable path is the built-in NyanMate presentation surface.

## Planned modules

1. **Living Desktop Pet** — idle, walk, sleep, petting, keyboard/mouse reactions, customization.
2. **Smart Agenda** — daily brief, recurring reminders, countdowns, calendar integration.
3. **Teaching Companion** — PDF/PPT/Slides presentation mode, semantic pointer targeting, quiz/discussion timers, dual-display presenter console.
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

**v0.7.x prototype** includes the mascot, pet interaction, agenda reminders, Pomodoro, system tray, local PDF preparation, fullscreen PDF presentation, synchronized navigation, safe-side placement, presenter notes, display routing, dual-monitor Presenter Console, semantic content classification, PDF image-operator detection, target-region selection, confidence scoring, and improved pointer targeting.

The next teaching milestone is an optional richer visual-analysis layer for embedded diagrams/images, plus slide-level teaching choreography such as timed emphasis, automatic question pauses, and end-of-class summaries.

## Design principles

- Lightweight by design
- Event-driven instead of constant polling
- Local-first and privacy-conscious
- Heavy AI/vision modules run only when requested
- Original visuals and behavior; NyanMate is not a copy of any third-party character assets

## License

To be decided before public release.
