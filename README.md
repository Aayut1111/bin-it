# ♻️ Bin It

**Small civic actions, tracked and stacked.**

Bin It is a mobile-friendly web app that makes keeping public spaces clean feel rewarding. Log everyday actions, earn points and badges, build streaks, and see where waste problems are worst in your area.

🔗 **Live app:** https://aayut1111.github.io/bin-it/

## Features

- **Log civic actions:** picked up litter, used a dustbin, reported a dumping spot, reminded someone kindly, or recycled e-waste. Each action earns points.
- **Dashboard and badges:** streaks, stats, a "next milestone" progress bar, and shareable badge cards.
- **Hotspot map:** reported dumping spots appear as pins or a heat map, so the worst roads, rail stretches and stations stand out.
- **Photo privacy:** faces in report photos are blurred automatically. Number plates and anything private can be hidden with a finger brush before upload. Photos show places, never people.
- **E-waste drop-off finder:** find collection points near you with "Use my location" or a city search. It shows distance, what each point accepts, hours, directions and a call button.
- **Awareness content:** a "Why not the normal dustbin?" explainer for e-waste, a daily quote, tips, and a Learn tab with facts and a pledge.
- **Four languages:** English, Hindi (हिन्दी), Marathi (मराठी) and Japanese (日本語).
- **Works offline:** installable as a PWA. Actions logged without signal are saved on the phone and uploaded when the connection returns.
- **Light and dark mode.**

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, Leaflet |
| Backend | Node.js, Express |
| Database | Supabase |
| Maps and data | OpenStreetMap tiles, Overpass API (e-waste points), Nominatim (place search) |
| Face detection | MediaPipe Tasks Vision (runs in the browser) |
| Hosting | GitHub Pages (frontend), Render (backend) |

## Run it locally

```bash
# frontend
npm install
npm run dev

# backend (in a second terminal)
cd backend
npm install
node server.js
```

Create a `.env` in the backend folder with your Supabase URL and key.

## Deploy

```bash
npm run deploy   # builds and publishes