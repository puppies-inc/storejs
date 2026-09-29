# Project Spec

## Goal

Build a minimal demo web app in Node.js that shows a complete CRUD flow for animals.

The app should be intentionally simple, readable, and easy to demo.

## Product Scope

- Single domain entity: `Animal`
- User-facing attributes: `name`, `species`
- Supported species: puppy, kitten, bunny, bird, hamster
- No additional business entities

## Out of Scope

- Authentication/authorization
- Background jobs
- Caching/search
- External integrations
- Complex architecture layers

## Core Functional Requirements

### 1. Routing

- `GET /` shows animal index (homepage must be animal management entry point)
- `GET /puppies` redirects to `/animals` for legacy links
- Standard animal CRUD routes:
  - `GET /animals`
  - `GET /animals/new`
  - `POST /animals`
  - `GET /animals/:id`
  - `GET /animals/:id/edit`
  - `POST /animals/:id` (or `PATCH/PUT` if framework supports method override cleanly)
  - `POST /animals/:id/delete` (or `DELETE` with method override)

### 2. Data Model

`Animal` fields:
- `id` (primary key)
- `name` (string)
- `species` (one of: puppy, kitten, bunny, bird, hamster)
- timestamps if easy (`created_at`, `updated_at`)

Validation requirement:
- Keep it lightweight.
- `name` may be optional for demo simplicity (acceptable to persist empty/missing name).
- Unknown `species` values fall back to puppy.

### 3. HTML Pages

#### Index (`/` and `/animals`)
- Heading: `Animals`
- List all animals
- For each animal:
  - show `Name: <value>`
  - show species
  - show link to animal detail page
- Show `New animal` action

#### New (`/animals/new`)
- Heading: `New animal`
- Form with:
  - label/input for `name`
  - label/select for `species`
  - submit action
- Link back to animals index

#### Show (`/animals/:id`)
- Display animal name and species
- Actions:
  - edit
  - delete
  - back to index

#### Edit (`/animals/:id/edit`)
- Heading: `Editing animal`
- Same form fields as New
- Links to show page and index

### 4. CRUD Behavior

- Create:
  - saves animal
  - redirects to animal show page
  - displays success notice
- Update:
  - updates animal
  - redirects to animal show page
  - displays success notice
- Delete:
  - removes animal
  - redirects to animals index
  - displays success notice

### 5. UI Guidelines

- Keep UI plain and functional
- No heavy custom styling
- Actions/forms must be clearly visible

### 6. Error Handling

- If an animal id does not exist, return a normal 404 page/response.
- If form submission fails (if validations are introduced), re-render form with visible errors.

## Testing Requirements

Implement basic automated tests for:
- index page loads
- new page loads
- create increases animal count and redirects correctly
- create supports multiple species
- show page loads
- edit page loads
- update persists change and redirects correctly
- delete decreases animal count and redirects correctly

Keep tests fast and simple.

## Acceptance Criteria

1. User can create, view, edit, and delete animals via HTML pages.
2. `/` resolves to animals index.
3. Success notices are shown after create/update/delete.
4. UI remains intentionally minimal.
5. Puppy, kitten, bunny, bird, and hamster are supported species.
