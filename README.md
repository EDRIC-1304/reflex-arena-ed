# F1 Reflex Arena

A frontend-only, F1-inspired reaction and typing challenge suite built with React and Vite. Designed with a dark motorsport race-control aesthetic, real-time performance telemetry, responsive layouts, and Web Audio feedback.

**Live Demo:** [https://reflex-arena-ed13.netlify.app](https://reflex-arena-ed13.netlify.app)

---

## Project Overview

**F1 Reflex Arena** brings motorsport race control directly to the browser with two core gameplay challenges:
1. **Reaction Test** — A start-light reaction test measuring response times down to the millisecond.
2. **Type to Race** — A high-speed typing challenge where typing precision controls an animated F1 car along a racing circuit.

The project features a sleek dark-mode UI with red motorsport accents, real-time speed/accuracy metrics, SVG curve animations, and persistent local score tracking.

---

## Main Features

- **F1 Reaction Test:** Motorsport start-light sequence (5 red lights) with randomized green light delays, false-start detection, and millisecond timing ratings.
- **Type to Race Mode:** Typing speed and accuracy drive race progression through 5 laps and 4 sectors per lap (20 target words total).
- **Animated F1 Mini-Track:** Interactive SVG Bezier curved track populated with 20 animated AI race cars on the home dashboard and live race view.
- **Dynamic Race Car Progression:** Active F1 car rendered on the circuit with real-time position and rotation calculated via cubic Bezier curve math as typing progress advances.
- **Typing Difficulty & Word System:** 5 progressive difficulty levels scaling from basic racing terms to complex motorsport and focus vocabulary.
- **DRS Boost & Combo System:** Combo multiplier system that unlocks DRS (Drag Reduction System) speed boost visuals upon hitting a 5-word typing streak.
- **Timer Modes:** Configurable race timer settings (**No Time Limit**, **30s**, **60s**, **90s**, and **120s**).
- **Miss Counter & DNF System:** Optional miss counter tracking up to 5 mistyped words, triggering a DNF (Did Not Finish) if exceeded or if the timer expires.
- **Web Audio Synthesizer:** Custom audio feedback generated using the native browser Web Audio API for light signals, start beeps, DRS boosts, and lap completions, with toggleable mute settings.
- **Responsive Mobile & Desktop Layout:** Optimized for desktop keyboard play and mobile touch controls, featuring a dedicated status bar layout for small screens.
- **Browser Local Persistence:** Saves personal best reaction times (ms), top WPM, highest score, peak accuracy, and best combo streak using `localStorage`.

---

## Game Modes

### Reaction Test
Challenge your reaction speed against an F1 start-light gantry.
- Wait for 5 red lights to illuminate sequentially.
- When the lights go out, trigger your response immediately (mouse, touch, or Space/Enter keys).
- Premature inputs trigger a **False Start** warning.
- Displays reaction time in milliseconds along with performance ratings ranging from **SUPERSONIC** (<150ms) to **NEEDS WORK** (≥400ms).

### Type to Race
Drive an F1 car around the circuit by typing target words accurately and quickly.
- Complete 5 laps across 4 sectors per lap to finish the session.
- Maintain high accuracy and speed to build combos and activate **DRS**.
- Customize your session with configurable **Timer Modes** and an optional **Miss Counter** (5 max misses before DNF).

---

## Technologies Used

- **React 19** — Component-driven UI architecture and custom hooks
- **Vite** — Fast frontend build tool and dev server
- **React Router DOM v7** — Client-side page navigation
- **Framer Motion** — UI transitions and modal animations
- **Lucide React** — Clean motorsport-style icons
- **Web Audio API** — Synthesized audio effects without external sound files
- **CSS3 / SVG** — Dark theme custom properties and Bezier path math for track rendering

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EDRIC-1304/reflex-arena-ed.git
   cd reflex-arena-ed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## Author & Repository

- **Author:** EDRIC-1304
- **GitHub:** [https://github.com/EDRIC-1304](https://github.com/EDRIC-1304)
- **Repository:** [https://github.com/EDRIC-1304/reflex-arena-ed](https://github.com/EDRIC-1304/reflex-arena-ed)
- **Live Demo:** [https://reflex-arena-ed13.netlify.app](https://reflex-arena-ed13.netlify.app)
