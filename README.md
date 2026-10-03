# ChurchConnect

[Live Pages preview](https://piyush-chopra.github.io/churchconnect/) · [Source repository](https://github.com/piyush-chopra/churchconnect)

A React + TypeScript frontend, Django backend, and installable progressive web app for ministry careers. Built from the ChurchConnect reference with Impeccable, Taste and Emil’s design engineering guidance.

## Start locally

Requires Python 3.12+ and Node 24 LTS.

```bash
cd churchconnect
./run.sh
```

Open http://127.0.0.1:8000. This installs dependencies, builds React, migrates SQLite, seeds nine fictional opportunities, and starts Django. Existing accounts and applications are preserved. The seed command is idempotent.

For later starts without rebuilding:

```bash
.venv/bin/python backend/manage.py runserver 127.0.0.1:8000
```

Create a candidate or employer account through the Sign in → Create an account flow. No accounts are seeded on a fresh database. `sample-resume.txt` is fictional sample content for testing uploads. Local databases and uploaded files are excluded from Git.

## Included workflows

- Register, sign in, and sign out using Django session cookies and CSRF protection.
- Browse jobs and filter by keywords, location, ministry area, work arrangement and employment type.
- Sort by recency, salary or résumé skill overlap; save opportunities.
- Upload PDF, DOCX or UTF-8 TXT résumés up to 5 MB. Text PDFs only, at most 30 pages. Legacy DOC is not accepted.
- Extract skill keywords locally; show transparent skill overlap with each role. No third-party AI calls or invented suitability scores.
- Apply with an optional introduction; prevent duplicate applications; track status.
- Employer accounts publish and close positions, view their applicants, download the submitted résumés, and update application status.
- Résumés have randomized storage filenames and are served only through authenticated, permission-checked downloads. Applying shares that résumé version with that employer; replacing a résumé preserves past application snapshots.
- Responsive desktop/mobile layouts, native focus-managed dialogs, visible error and empty states, reduced-motion support.
- PWA manifest, app icons and versioned service worker. Only static app assets are cached; private API responses never are.
- Django admin available at `/admin/` after `.venv/bin/python backend/manage.py createsuperuser`.

## Frontend development

Run Django on port 8000, then in another terminal:

```bash
cd frontend
npm run dev
```

Vite serves port 5173 and proxies `/api/` and `/admin/` to Django. Use port 8000 after `npm run build` to test the installable production app. Service workers are disabled in Vite development mode.

## Checks

```bash
.venv/bin/python backend/manage.py test jobs
.venv/bin/python backend/manage.py check
cd frontend && npm run build
```

Backend tests cover registration, login, CSRF, upload validation, DOCX extraction, matching, private downloads, role and ownership permissions, application snapshots, duplicate prevention, employer posting/closing, and saved-job idempotency.

## Mobile installation

Installation requires HTTPS in a deployed environment (localhost is accepted for development). On Android/desktop Chrome, choose Install app from the browser or use “Get the mobile app.” On iPhone/iPad Safari, use Share → Add to Home Screen. This is an installable web app, not an App Store or Play Store binary. Static UI can load offline; jobs, uploads and applications require a connection.

## Structure

- `frontend/src/`: React interface, typed API client and shared design tokens.
- `frontend/public/`: PWA manifest and app icons.
- `frontend/scripts/build-sw.mjs`: production static-asset precache generator.
- `backend/jobs/`: models, API endpoints, résumé extraction, permission checks and tests.
- `backend/config/`: Django settings and same-origin React serving.
- `PRODUCT.md`, `DESIGN.md`: product scope and design decisions.

## Deployment boundaries

The full Django service is a functional local MVP. GitHub Pages is a separate static preview, described below; it does not host Python or the database. Use a fresh database, production secret, correct allowed hosts/CSRF origins and HTTPS. `backend/.env.example` lists settings; export them into the process environment (Django does not automatically load that file). With debug disabled, the app enforces secure cookies and HTTPS redirects. If using a reverse proxy, configure trusted proxy HTTPS headers in Django and at the proxy deliberately.

Build React, run migrations and `collectstatic`, then serve from the backend directory with `gunicorn config.wsgi:application`. WhiteNoise serves the built frontend and Django static assets on the same origin. Persist and back up the database and private upload directory outside disposable containers. SQLite is for local/small deployments; choose PostgreSQL and a shared cache when scaling. The current authentication throttle is in-process, so use a shared limiter at production scale.

Before a public launch, add email verification/password recovery, upload malware scanning, moderation of employer accounts and listings, operational monitoring, backups, and approved privacy/retention policies. There is no email delivery, interview scheduling, billing, or external AI provider integration. Sample listings and employer-created listings can be distinguished through the `is_demo` field; sample notices are visible in listing details.


## GitHub Pages preview

The `Deploy GitHub Pages preview` workflow builds and publishes on pushes to `main`. In the repository’s Settings → Pages, select **GitHub Actions** as the source. The workflow derives the `/repository-name/` base path automatically.

This preview includes nine explicitly fictional roles with working search, filters, sorting, job details, themes, and installable static assets. It has no login server and does not collect credentials, résumés, or applications. Account actions explain that the full service is unavailable. The normal Django build retains the complete account and hiring flows.

To test the Pages build locally:

```bash
cd frontend
node --test tests/preview.test.mjs
VITE_BASE_PATH=/churchconnect/ VITE_STATIC_PREVIEW=true npm run build
VITE_BASE_PATH=/churchconnect/ npm run preview
```

Open `http://127.0.0.1:4173/churchconnect/`. The build scopes the manifest, icons, assets and service-worker cache to this path. Only fixtures in `frontend/src/preview-jobs.json` are included; data is never exported from the local database.

For the complete service, run `npm run build` without those environment variables, and deploy React and Django together to a Python-capable host following the deployment boundaries above.
