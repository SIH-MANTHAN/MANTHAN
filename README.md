# MANTHAN

Agentic AI-powered Marine Intelligence Platform (SIH 2026 frontend).

## Run

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_GOOGLE_MAPS_API_KEY
npm run dev
```

Open http://127.0.0.1:5173

## Google Maps API key (required for the map)

1. Copy `.env.example` to `.env`
2. Create a key in [Google Cloud Console](https://console.cloud.google.com/)
3. Enable **Maps JavaScript API** and **Directions API**
4. Paste the key:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

5. Restart the dev server (`npm run dev`)

Without a key, the app still runs but the map panel shows setup instructions.

## Architecture

- `src/types` — domain models (swap-ready for real APIs)
- `src/data/mock` — centralized placeholder marine data
- `src/services` — data + chat access layer
- `src/config/maps.ts` — Google Maps env wiring
- `src/components` — onboarding, dashboard, map, chat, PFZ, safety, marine life, geofencing, routes
- Day / night themes via `data-theme`

Replace mock implementations in `src/services` and `src/data/mock` without rewriting UI.
