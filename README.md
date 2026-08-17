# Reflex Arena

A frontend-only F1-inspired reflex and typing challenge built with React and Vite.

## Overview

Reflex Arena is a browser-based mini-game project inspired by motorsport race control and high-speed reaction timing. It brings together two focused challenges in a single portfolio-friendly experience: a reaction-speed test and a race-style typing game.

The experience is designed as a dark, minimal, F1-inspired interface with a red motorsport accent palette, quick gameplay loops, and responsive browser-based interactions.

## Features

- F1-inspired reaction test with start-light sequence
- False-start detection for early inputs
- Reaction-time measurement and performance feedback
- Type to Race mode with lap-based progression
- Score, combo, WPM, and accuracy tracking
- Animated mini F1 track on the home screen
- Responsive layout for desktop and mobile play
- Browser local persistence for reaction and typing best records
- Sound toggling and inline game feedback
- Help panels for both game modes
- Frontend-only architecture with no backend dependency

## Games

### Reaction Test

The Reaction Test challenges the player to wait for the lights and trigger as quickly as possible when the signal turns green. The game tracks reaction speed, rewards faster responses, and flags false starts when the player acts too early.

### Type to Race

Type to Race turns keyboard input into a race simulation. Players type words as they approach the screen, accumulate score and combo momentum, maintain accuracy, and complete lap-based progression before missing too many words.

## Tech Stack

- React
- Vite
- JavaScript
- React Router
- Framer Motion
- Lucide React

## Project Architecture

```text
src/
├── components/
│   ├── layout/
│   └── ui/
├── hooks/
├── pages/
├── utils/
├── App.jsx
├── main.jsx
├── index.css
├── assets/
public/
├── favicon.svg
├── icons.svg
index.html
package.json
package-lock.json
vite.config.js
```

The app is organized around page components, custom game hooks, supporting utility modules, and a small shared UI layer for the help overlay and track visuals.

## Getting Started

### Prerequisites

- Node.js

### Installation

```bash
git clone https://github.com/EDRIC-1304/reflex-arena-ed.git
cd reflex-arena-ed
npm install
```

### Development

```bash
npm run dev
```

Then open the local Vite server in your browser. The dev server URL is typically printed in the terminal by Vite.

## Build

```bash
npm run build
```

This creates a production build in the `dist/` folder.

### Preview

```bash
npm run preview
```

## Deployment

This project is a frontend-only React + Vite application and is suitable for deployment on services such as:

- Vercel
- Netlify
- GitHub Pages

Live deployment is not configured in this repository yet.

## Design Philosophy

Reflex Arena follows a focused motorsport aesthetic: dark surfaces, minimal interface layout, red functional accents, and a race-control style for the user experience. The design is intentionally clean so the gameplay remains the center of attention while still feeling polished and portfolio-ready.

## Project Goals

This project demonstrates:

- React component-based UI composition
- client-side game logic and state flow
- responsive frontend design
- animation-driven UI polish
- browser storage for persistent stats
- interactive game UX with keyboard and pointer input

## Future Improvements

Potential future enhancements include:

- online leaderboards
- multiplayer or competitive racing modes
- richer telemetry and race analytics
- additional game challenge variants
- expanded local persistence and profile tracking

These are future ideas only and are not currently implemented.

## License

License has not been specified yet.

## Author

- EDRIC-1304
- GitHub: https://github.com/EDRIC-1304

## Repository

- GitHub: https://github.com/EDRIC-1304/reflex-arena-ed
- Live demo: coming soon
