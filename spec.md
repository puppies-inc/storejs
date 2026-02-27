# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Sheep`.

The app should be intentionally simple, readable, and easy to demo.

## Sheep Scope

- Single domain entity: `Sheep`
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

- `GET /` shows sheep index (homepage must be sheep management entry point)
- Standard sheep CRUD routes:
  - `GET /sheep`
  - `GET /sheep/new`
  - `POST /sheep`
  - `GET /sheep/:id`
  - `GET /sheep/:id/edit`
  - `POST /sheep/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /sheep/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Sheep` fields:
- `id` (primary key)
- `name` (string)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` may be optional for demo simplicity (acceptable to persist empty/missing name).

### 3. HTML Pages

#### Index (`/` and `/sheep`)
- Heading: `Sheep`
- List all sheep
- For each sheep:
  - show `Name: <value>`
  - show link to sheep detail page
- Show `New sheep` action

#### New (`/sheep/new`)
- Heading: `New sheep`
- Form with:
  - label/input for `name`
  - submit action
- Link back to sheep index

#### Show (`/sheep/:id`)
- Display sheep name
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/sheep/:id/edit`)
- Heading: `Editing sheep`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves sheep
  - redirects to sheep show page
  - displays success notice
- Update:
  - updates sheep
  - redirects to sheep show page
  - displays success notice
- Delete:
  - removes sheep
  - redirects to sheep index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If a sheep id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases sheep count and redirects correctly
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases sheep count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete sheep via HTML pages.
2. `/` resolves to sheep index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
