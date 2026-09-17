# Bin It

A civic-action tracker built with React + Vite. Log the small things — picked-up litter, a used dustbin, a reported dumping spot, a kind reminder — and watch a streak and an impact count build over time.

**Live app:** https://aayut1111.github.io/bin-it/

## Features

- Four loggable civic actions, each with its own point value and hand-drawn icon
- A daily streak, alive through today or a not-yet-missed day
- Seven unlockable badges with a live "just unlocked" toast
- A 14-day activity strip and a running feed of recent actions
- Everything persisted to `localStorage` — no backend, no account

## Stack

React 19, Vite, plain CSS custom properties for theming. No router, no state library — `useLocalStorage` and a handful of pure functions in `utils/streak.js` do all the work.

## Run it locally

```
npm install
npm run dev
```

## Architecture notes

Actions and badges are data, not hardcoded JSX — `src/data/actionTypes.js` and `src/data/badges.js` are the only places to touch when adding a fifth action or an eighth badge. Every screen component only ever reads `entries` and `stats` as props; `App.jsx` is the single place state changes, the same "UI as a pure listener" pattern used throughout.