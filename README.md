# TradeStream Engine — Web UI

React + Vite frontend for the TradeStream Engine platform. Talks to the Spring Boot backend (`tradestream-engine-api`) over REST.

## Stack

- React 18, TypeScript, Vite
- Tailwind CSS v4
- Radix UI primitives + custom components
- React Query (server state), Zustand (client state)
- React Router v7
- Recharts for the dashboard

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend on `http://localhost:8080`. To point at a different backend, set `VITE_API_BASE_URL` before running.

```bash
VITE_API_BASE_URL=https://api.example.com npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project layout

```
src/
├── app/              # App shell, layout, shared UI components
├── pages/            # Route-level pages (Dashboard, Upload, Files, ...)
├── routes/           # Router config + ProtectedRoute
├── services/         # Axios instance + API clients
├── hooks/            # React Query hooks (useDashboard, useFileRecords, ...)
├── store/            # Zustand stores (auth)
├── types/            # Shared TypeScript types
├── styles/           # Tailwind + theme
└── utils/            # Small helpers
```

## Notes

- Authentication uses JWT in `localStorage` plus Google OAuth2 (handled by the backend; the UI receives the token via the `OAuth2RedirectHandler` page).
- Exports require TOTP verification — the OTP dialog in `DownloadPage.tsx` calls `/auth/totp/verify` to mint a short-lived export token sent as `X-Export-Token`.
- The dashboard polls every 2 seconds while a file is in `PENDING` / `STARTED` / `PROCESSING` so progress updates feel live without WebSockets.
