# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Cat`.

The app should be intentionally simple, readable, and easy to demo.

## Product Scope

- Single domain entity: `Cat`
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

- `GET /` shows cat index (homepage must be cat management entry point)
- Standard cat CRUD routes:
  - `GET /cats`
  - `GET /cats/new`
  - `POST /cats`
  - `GET /cats/:id`
  - `GET /cats/:id/edit`
  - `POST /cats/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /cats/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Cat` fields:
- `id` (primary key)
- `name` (string)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` may be optional for demo simplicity (acceptable to persist empty/missing name).

### 3. HTML Pages

#### Index (`/` and `/cats`)
- Heading: `Cats`
- List all cats
- For each cat:
  - show `Name: <value>`
  - show link to cat detail page
- Show `New cat` action

#### New (`/cats/new`)
- Heading: `New cat`
- Form with:
  - label/input for `name`
  - submit action
- Link back to cats index

#### Show (`/cats/:id`)
- Display cat name
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/cats/:id/edit`)
- Heading: `Editing cat`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves cat
  - redirects to cat show page
  - displays success notice
- Update:
  - updates cat
  - redirects to cat show page
  - displays success notice
- Delete:
  - removes cat
  - redirects to cats index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If a cat id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases cat count and redirects correctly
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases cat count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete cats via HTML pages.
2. `/` resolves to cats index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
