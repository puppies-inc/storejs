# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Product`, structured as a 3-service monorepo.

## Architecture

The app consists of three services:

### 1. API Service (`services/api`)
- Express.js REST API (JSON responses, no views)
- In-memory data store
- Endpoints:
  - `GET /api/health` — health check
  - `GET /api/products` — list all products
  - `GET /api/products/:id` — get a single product
  - `POST /api/products` — create a product
  - `PUT /api/products/:id` — update a product
  - `DELETE /api/products/:id` — delete a product
- Default port: 3001

### 2. Web Service (`services/web`)
- Express.js + EJS server-rendered frontend
- All data operations go through the API service (no local storage)
- Configured via `API_URL` env var (default: `http://localhost:3001`)
- Routes:
  - `GET /health` — health check
  - `GET /` — redirects to `/products`
  - `GET /products` — product index
  - `GET /products/new` — new product form
  - `POST /products` — create product (proxied to API)
  - `GET /products/:id` — show product
  - `GET /products/:id/edit` — edit product form
  - `POST /products/:id` — update product (proxied to API)
  - `POST /products/:id/delete` — delete product (proxied to API)
  - `GET /about` — about page
- Default port: 3000

### 3. Worker Service (`services/worker`)
- Background Node.js process
- Periodically fetches product count from the API (every 30 seconds)
- Logs stats to stdout
- Health check HTTP server on default port 3002
- Configured via `API_URL` env var (default: `http://localhost:3001`)

## Product Scope

- Single domain entity: `Product`
- Single user-facing attribute: `name`
- No additional business entities

## Out of Scope

- Authentication/authorization
- Persistent database
- Caching/search
- Complex architecture layers

## Data Model

`Product` fields:
- `id` (primary key, auto-increment integer)
- `name` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Testing Requirements

API service tests cover:
- Health check endpoint
- List products (empty)
- Create product returns correct response
- Create increases product count
- Show product
- Update persists change
- Delete removes product
- 404 for missing product

## Deployment

Render Blueprint (`render.yaml`) defines all 3 services. Web and worker receive the API URL automatically via service linking.

## Acceptance Criteria

1. User can create, view, edit, and delete products via HTML pages (web service).
2. All data operations go through the API service.
3. Worker periodically reports product stats.
4. Each service runs independently with `npm install && npm start`.
5. API tests pass.
