# StoreJS

A minimal product CRUD demo app built with Node.js and Express, structured as a 3-service monorepo.

## Architecture

```
services/
  api/      — REST API backend (Express, JSON, in-memory store)
  web/      — Frontend (Express + EJS, fetches data from API)
  worker/   — Background worker (periodic product stats logging)
```

### API Service (`services/api`)
- Express.js REST API returning JSON
- Endpoints: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`
- Health check: `GET /api/health`
- Default port: 3001

### Web Service (`services/web`)
- Express.js + EJS server-rendered frontend
- Proxies all data operations to the API service
- Health check: `GET /health`
- Default port: 3000
- Configure API location with `API_URL` env var (default: `http://localhost:3001`)

### Worker Service (`services/worker`)
- Background process that periodically fetches product count from the API
- Runs every 30 seconds
- Health check: `GET /health` on port 3002
- Configure API location with `API_URL` env var (default: `http://localhost:3001`)

## Getting Started

```bash
# Install dependencies for all services
npm run install:all

# Start the API (in one terminal)
npm run start:api

# Start the web frontend (in another terminal)
npm run start:web

# Start the worker (optional, in another terminal)
npm run start:worker
```

Or run each service individually:

```bash
cd services/api && npm install && npm start
cd services/web && npm install && npm start
cd services/worker && npm install && npm start
```

## Testing

```bash
cd services/api
npm install
npm test
```

## Deployment

This repo includes a `render.yaml` Render Blueprint that deploys all 3 services. The web and worker services automatically receive the API service URL via the `API_URL` environment variable.
