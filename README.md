# Field Guide · V2 Prototype 🧪📋

**Voice-first, fatigue-aware health survey system for rural clinical research.**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://field-guide-demo.vercel.app)
[![Human in the Loop](https://img.shields.io/badge/Design-Human--in--the--Loop-00bfa6?style=flat-square)](https://lesliejohnson.io/field-guide)

Live demo → [field-guide-demo.vercel.app](https://field-guide-demo.vercel.app)  
Portfolio case study → [lesliejohnson.io/field-guide](https://lesliejohnson.io/field-guide)

---

## Stack

- React 18 (CDN, no build step)
- Babel standalone for JSX transpilation
- Vanilla CSS with design tokens
- Deployed on Vercel

---

## File structure

```
field-guide/
├── Field Guide V2.html       # Entry point
├── app.jsx                   # Root component, session state, layout
├── participant-view.jsx       # Participant-facing tablet interface
├── researcher-view.jsx        # Researcher monitoring panel + audit trail
├── ipad-frame.jsx             # Shared tablet frame component
├── tweaks-panel.jsx           # Simulation controls + agent behavior overrides
├── survey-data.js             # Survey questions with reading tier variants
├── tokens.css                 # Design tokens
└── uploads/                  # Static assets
```

---

## Running locally

No build step required. Clone the repo and open `Field Guide V2.html` directly in a browser, or serve with any static file server:

```bash
npx serve .
```

---

## Architecture

Dual-tablet layout — participant view and researcher view rendered simultaneously in a single page. Session state lives in `app.jsx` and is passed down via props.

**Participant view** manages:
- Voice playback state and reading tier (standard / easy / simple)
- Headphone detection and dark mode
- Survey progress and rest/break states
- Workflow transition screens (handoff to clinical exam)

**Researcher view** manages:
- Live fatigue signal score (0–100, derived from response pace + pattern variance)
- Timestamped audit trail of every agent decision, answer, voice change, and handoff
- Active state display (participant ID, voice persona, reading level, connection status)

**Tweaks panel** (`tweaks-panel.jsx`) exposes simulation controls:
- Trigger fatigue signal
- Signal workflow handoff
- Skip to rest mode
- Reset voice + reading tier
- Toggle low-light / dark mode

Agent decisions are deterministic in this prototype — fatigue thresholds and reading tier escalation logic live in `participant-view.jsx`.

---

*Built by [Leslie Johnson](https://lesliejohnson.io)*
