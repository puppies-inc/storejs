# storejs

Minimal Node.js CRUD demo for `Item` using Express + EJS.

## Local run

```bash
npm install
npm test
npm start
```

App runs on `http://localhost:3000` by default.

## Render deploy

This repo includes `render.yaml` for Blueprint deploys.

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Render will use:
   - Build command: `npm install`
   - Start command: `npm start`

The app listens on `process.env.PORT`, so it is compatible with Render web services.

## Notes

- Data storage is in-memory for simplicity and demo friendliness.
- Data resets when the process restarts or redeploys.
