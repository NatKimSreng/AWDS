# AngkorWatDayTour — Admin Dashboard

React + Vite web dashboard for platform administrators.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Zustand (client state)
- TanStack Query (server state)
- React Router
- Axios
- Recharts (analytics)
- Lucide React (icons)

## Getting Started

```bash
cd apps/web-admin
cp .env.example .env
npm install
npm run dev
```

Default dev server runs on http://localhost:5174.

## Project Structure

```
src/
  components/   # Shared UI components
  pages/        # Route pages
  stores/       # Zustand stores
  lib/          # API client, helpers
  hooks/        # TanStack Query hooks
  App.tsx       # Root + routing
  main.tsx      # Entry
```
