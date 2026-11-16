# QueuePulse

Background job orchestration dashboard with a Vite + React + TypeScript frontend and Vercel Serverless Functions backend.

## Development

```bash
npm install
npm run dev
```

For local API routes, use `npm run vercel-dev`.

## Deploy

Import this repository into Vercel. The project builds with `npm run build` and serves the SPA from `dist` while exposing `/api/jobs` and `/api/worker` serverless functions.
