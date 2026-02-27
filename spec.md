# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Item`.

The app should be intentionally simple, readable, and easy to demo.

## Item Scope

- Single domain entity: `Item`
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

- `GET /` shows item index (homepage must be item management entry point)
- Standard item CRUD routes:
  - `GET /items`
  - `GET /items/new`
  - `POST /items`
  - `GET /items/:id`
  - `GET /items/:id/edit`
  - `POST /items/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /items/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Item` fields:
- `id` (primary key)
- `name` (string)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` may be optional for demo simplicity (acceptable to persist empty/missing name).

### 3. HTML Pages

#### Index (`/` and `/items`)
- Heading: `Items`
- List all items
- For each item:
  - show `Name: <value>`
  - show link to item detail page
- Show `New item` action

#### New (`/items/new`)
- Heading: `New item`
- Form with:
  - label/input for `name`
  - submit action
- Link back to items index

#### Show (`/items/:id`)
- Display item name
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/items/:id/edit`)
- Heading: `Editing item`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves item
  - redirects to item show page
  - displays success notice
- Update:
  - updates item
  - redirects to item show page
  - displays success notice
- Delete:
  - removes item
  - redirects to items index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If an item id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases item count and redirects correctly
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases item count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete items via HTML pages.
2. `/` resolves to items index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
