# Lift

Lift is a full-stack carpooling app structured as an industry-style JavaScript monorepo.

## Project Structure

```text
lift/
  backend/              # Node.js + Express API
    src/
      data/             # Mock persistence layer, ready to swap for a real DB
      middleware/       # Shared Express middleware
      routes/           # Feature route modules
      app.js            # Express app factory
      server.js         # API process entrypoint
  frontend/             # React + Vite client
    src/
      assets/
      components/
      App.tsx
      main.tsx
  package.json          # Workspace scripts
  .env.example          # Shared environment template
```

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

```bash
npm install
copy .env.example .env
npm run dev
```

The frontend runs on `VITE_FRONTEND_PORT` and proxies `/api` requests to `VITE_API_URL`. Keep `CLIENT_URL` aligned with the frontend URL for CORS.

## Useful Scripts

```bash
npm run dev           # Run frontend and backend together
npm run dev:frontend  # Run only React/Vite
npm run dev:backend   # Run only Node/Express API
npm run build         # Build the frontend
npm run start         # Start the backend
npm run lint          # Type-check the frontend
```

## Backend API

- `GET /api/health`
- `GET /api/rides`
- `GET /api/rides/:id`
- `POST /api/rides`
- `GET /api/rides/:id/messages`
- `POST /api/rides/:id/messages`
- `GET /api/carbon-stats`

The backend currently uses an in-memory mock database in `backend/src/data/mockDb.js`, which keeps the API easy to replace with MongoDB, PostgreSQL, or another production data store later.
