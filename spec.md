# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for a single entity: `Puppy`.

The app should be intentionally simple, readable, and easy to demo.

## Product Scope

- Single domain entity: `Puppy`
- User-facing attributes: `name` and `breed`
- No additional business entities

## Out of Scope

- Authentication/authorization
- Background jobs
- Caching/search
- External integrations
- Complex architecture layers

## Core Functional Requirements

### 1. Routing

- `GET /` shows puppy index (homepage must be puppy management entry point)
- Standard puppy CRUD routes:
  - `GET /puppies`
  - `GET /puppies/new`
  - `POST /puppies`
  - `GET /puppies/:id`
  - `GET /puppies/:id/edit`
  - `POST /puppies/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /puppies/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Puppy` fields:
- `id` (primary key)
- `name` (string)
- `breed` (string, optional)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` and `breed` may be optional for demo simplicity (acceptable to persist empty/missing values).

### 3. HTML Pages

#### Index (`/` and `/puppies`)
- Heading: `Puppies`
- List all puppies
- For each puppy:
  - show `Name: <value>` and `Breed: <value>`
  - show link to puppy detail page
- Show `New puppy` action

#### New (`/puppies/new`)
- Heading: `New puppy`
- Form with:
  - label/input for `name`
  - label/input for `breed`
  - submit action
- Link back to puppies index

#### Show (`/puppies/:id`)
- Display puppy name and breed
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/puppies/:id/edit`)
- Heading: `Editing puppy`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves puppy
  - redirects to puppy show page
  - displays success notice
- Update:
  - updates puppy
  - redirects to puppy show page
  - displays success notice
- Delete:
  - removes puppy
  - redirects to puppies index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If a puppy id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases puppy count and redirects correctly
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases puppy count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete puppies via HTML pages.
2. `/` resolves to puppies index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
