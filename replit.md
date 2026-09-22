# Tidyline File Organizer

Tidyline scans a server-side folder, sorts files into type and name-pattern folders, finds hash-identical duplicates, and can run the cleanup on a daily or weekly schedule.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `cd artifacts/file-organizer/backend && uv run uvicorn main:app --host 0.0.0.0 --port 8000` — run the Python organizer API
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `PORT=23611 BASE_PATH=/ pnpm --filter @workspace/file-organizer run build` — build the web dashboard
- The organizer API uses a server-side folder path; it does not upload browser files.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/file-organizer/src/` — React dashboard and visual theme
- `artifacts/file-organizer/backend/main.py` — FastAPI organizer service, file classification, SHA-256 duplicate detection, moving, deletion, and scheduler
- `artifacts/file-organizer/.replit-artifact/artifact.toml` — web and Python API service routing
- `artifacts/file-organizer/backend/organizer_state.json` — persisted schedule settings created at runtime

## Architecture decisions

- The browser calls a separate FastAPI service at `/organizer-api`, so file operations stay server-side and the service can be moved to AWS later.
- Duplicate groups are detected by SHA-256 after grouping files by byte size; the first deterministic path is kept and extra copies are deleted only during an explicit organize run or enabled scheduled run.
- Filename patterns take precedence over extension categories, so screenshots, invoices, resumes, contracts, and meeting notes get dedicated folders.
- Scheduled runs default to recursive scanning and delete duplicates automatically when enabled.

## Product

Users can browse server-visible folders, preview a scan, see file-type totals and duplicate groups, organize files, remove exact duplicates, and configure a daily or weekly automatic run.

## User preferences

The organizer keeps destructive actions visible and understandable before they happen.

## Gotchas

- The chosen folder path is resolved by the Python service host. For AWS, mount the target storage into the service and point the UI at that mounted path.
- Generated destination folders are skipped during recursive scans to avoid re-processing files Tidyline already organized.
- The in-process scheduler is intended for a single running service instance; use an AWS-managed scheduler or persistent job runner when deploying multiple instances.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
