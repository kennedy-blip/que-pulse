# QueuePulse

QueuePulse is a background job orchestration dashboard with a Vite + React + TypeScript frontend and Vercel Serverless Functions backend.

## Features

- Live pipeline for Pending, Active, Completed, Failed, and Dead Letter Queue jobs
- Job enqueueing with priority, JSON payload, and retry-budget controls
- Worker concurrency, worker-count, and simulation error-rate tuning
- Exponential retry-backoff calculation and DLQ replay
- Payload inspection, execution logs, queue metrics, and local simulation fallback

## Development

```bash
npm install
npm run dev
```

The Vite-only development server does not run Vercel Functions. The UI detects unavailable API routes and falls back to an in-browser demo queue. To run the actual API routes locally, install the Vercel CLI and use:

```bash
npm run vercel-dev
```

## Deploy to Vercel

Import this repository into Vercel. The project uses `npm run build`, outputs the SPA to `dist`, and exposes `/api/jobs` and `/api/worker` as serverless functions. No separate backend deployment or environment variables are required for the included demo.

## Important storage note

The included queue is intentionally in-memory and pre-seeded for demonstration. Vercel Functions can run in multiple isolated instances and may restart, so this demo queue is not durable and should not be used as a production source of truth. For production workloads, replace the in-memory store with a shared durable queue/database (for example Redis or a managed queue service), and use a scheduled/continuous worker rather than relying on manual dashboard ticks.
