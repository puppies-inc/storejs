# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Product`.

The app should be intentionally simple, readable, and easy to demo.

## Product Scope

- Single domain entity: `Product`
- Single user-facing attribute: `name`
- No additional business entities

## Out of Scope

- Authentication/authorization
- Background jobs
- Caching/search
- External integrations
- Complex architecture layers

## Core Functional Requirements

### 1. Routing

- `GET /` shows product index (homepage must be product management entry point)
- Standard product CRUD routes:
  - `GET /products`
  - `GET /products/new`
  - `POST /products`
  - `GET /products/:id`
  - `GET /products/:id/edit`
  - `POST /products/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /products/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Product` fields:
- `id` (primary key)
- `name` (string)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` may be optional for demo simplicity (acceptable to persist empty/missing name).

### 3. HTML Pages

#### Index (`/` and `/products`)
- Heading: `Products`
- List all products
- For each product:
  - show `Name: <value>`
  - show link to product detail page
- Show `New product` action

#### New (`/products/new`)
- Heading: `New product`
- Form with:
  - label/input for `name`
  - submit action
- Link back to products index

#### Show (`/products/:id`)
- Display product name
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/products/:id/edit`)
- Heading: `Editing product`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves product
  - redirects to product show page
  - displays success notice
- Update:
  - updates product
  - redirects to product show page
  - displays success notice
- Delete:
  - removes product
  - redirects to products index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If a product id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases product count and redirects correctly
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases product count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete products via HTML pages.
2. `/` resolves to products index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
