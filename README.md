# CareLedger

Website maintenance notes and monthly client reports for independent studios.

## Stack

- **Frontend:** Next.js App Router, React, TypeScript, CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma models and SQL migrations
- **Authentication:** one studio user type, salted password hashes, database-backed sessions, HTTP-only cookies

## Source

```text
apps/
  web/src/
    app/          Next.js routes and layouts
    components/   Shared UI, workspace layout, report document
    features/     Login, overview, clients, maintenance, reports, settings
    providers/    Workspace state and session lifecycle
    lib/          API client and isolated demo storage
  api/
    src/
      routes/     Auth and workspace endpoints
      services/   Workspace queries
      middleware/ Session checks
      lib/        Prisma client and password hashing
    prisma/       Schema, migrations, seed
    tests/        Backend checks
packages/
  shared/         Types and input validation used by both apps
```

## Local setup

Requires Node.js 24.14+, npm, and Docker. Run these from the repository root:

```sh
npm ci
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose up -d
npm run setup
npm run dev
```

On PowerShell, use `Copy-Item` in place of `cp` if needed. The frontend opens at http://localhost:3000 and the API runs at http://localhost:4000. Sign in with the email and password in `apps/api/.env`. Change the example password before using real information. Seeding creates the user once and does not overwrite an existing password.

PostgreSQL persists in the Docker volume. Stopping the containers does not delete its records. Environment files are ignored by Git; the checked-in examples contain development values only.

## Demo

The public demo is a separate build of the same React interface. It uses fictional data stored in the visitor's browser, with no connection to the real API or PostgreSQL database.

```sh
npm run build:demo
npx serve apps/web/out
```

Demo email: `studio@careledger.demo`  
Demo password: `CareLedgerDemo2026!`

Cloudflare Pages builds with `npm ci && npm run build:demo` and publishes `apps/web/out`. Set `NODE_VERSION=24.14.0`. The demo credential screen is intentionally public; full-app credentials are never bundled into this build.

## Full app

```sh
npm run build
npm run start -w @careledger/api
npm run start -w @careledger/web
```

The full app needs a running PostgreSQL database and Node hosts for the API and Next.js app. Set `DATABASE_URL`, `WEB_ORIGIN`, and `NEXT_PUBLIC_API_URL` for those hosts. Use HTTPS and sibling hosts on the same site for the session cookie. Database secrets belong only on the API host. Apply committed migrations with `npm run db:migrate` before starting the API.

## Checks

```sh
npm run typecheck
npm test
npm run test:integration -w @careledger/api
npm run build
```

The integration test requires the configured database and seed user. Reports save snapshots so editing source notes later does not rewrite a saved report. Review a draft before using the report's **Print / save as PDF** action. Sending reports is manual.
