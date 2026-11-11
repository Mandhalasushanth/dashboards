# Finsolz Frontend

React + TypeScript (Vite) frontend for Finsolz, built as an advanced modular monolith. This release covers the
shared **Secure Access** sign-in for all five roles, session management, role-based routing, the Admin console and the
CA Manager, CA Agent, Loan Manager and Loan Agent workspaces built on one application workflow.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (VITE_DEV_SERVER_PORT)
npm test           # unit tests (Vitest)
npm run build      # typecheck + 490-line check + production build
```

Node 22.6+ is required (the line-check script uses native TypeScript stripping).

## Configuration

All runtime values come from `VITE_*` variables. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API base path. Keep it relative (`/api/v1`) behind a proxy so session cookies stay same-origin. |
| `VITE_API_PROXY_TARGET` | Dev server only: backend origin that Vite proxies `VITE_API_BASE_URL` to. |
| `VITE_API_TIMEOUT_MS` | Request timeout. |
| `VITE_SESSION_IDLE_TIMEOUT_MINUTES` | Client-side idle sign-out (the server session timeout still applies). |
| `VITE_APP_NAME` | Brand name shown in the UI. |
| `VITE_ENABLE_DEMO_AUTH` | Development only: use in-browser demo accounts instead of the backend. |

## Development demo accounts

The backend is not built yet, so `.env.development` sets `VITE_ENABLE_DEMO_AUTH=true` and these accounts sign in:

| Email | Password | Role | Lands on |
| --- | --- | --- | --- |
| `admin@gmail.com` | `admin123` | ADMIN | `/admin/dashboard` |

There are no other built-in logins. The admin creates every manager and agent (with their password) in
Admin → Managers / Agents, and each agent is placed under one manager. Every manager sees all applications
of their team and can assign them to any agent of that team; an agent sees only what was assigned to them.

The demo gateway stores only salted SHA-256 hashes and mirrors the backend contract: invalid credentials, inactive
account, and a lockout after 5 failures. It is loaded through a dynamic import guarded by `import.meta.env.DEV`, so
`vite build` never bundles it. Its emails and hashes are absent from `dist/`.

## Validation

Every field's rules and error messages are listed in [docs/validation-rules.md](docs/validation-rules.md).

## Backend contract (to implement)

Cookie-based session (HttpOnly session cookie) with Spring-style CSRF (`XSRF-TOKEN` cookie echoed as `X-XSRF-TOKEN`).
Responses use the envelope `{ success, message, data }`. Errors use `{ errorCode, message }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/identity/csrf` | Issues the `XSRF-TOKEN` cookie. |
| POST | `/identity/login` | Body `{ username, password }` returns `SessionUser`. |
| GET | `/identity/session` | Returns `SessionUser`, or `data: null` when signed out. |
| POST | `/identity/logout` | Ends the session. |
| GET | `/admin/navigation/counters` | `{ applications, communication, notifications }` badge counts (ADMIN). |
| GET | `/admin/settings` | Saved settings, grouped by section (ADMIN). |
| PUT | `/admin/settings` | Saves all sections and returns what was stored (ADMIN). |
| GET | `/admin/notifications` | List (or `{ items }`) of `{ id, category, title, message, createdAt, read, link }` (ADMIN). |
| PATCH | `/admin/notifications/{id}` | Body `{ read }`: mark one read or unread. |
| POST | `/admin/notifications/read-all` | Mark every notification read. |
| DELETE | `/admin/notifications/{id}` | Dismiss one notification. |
| GET | `/admin/communication/contacts` | Staff the admin can message: `{ id, name, role, email, unreadCount, lastMessage }` (ADMIN). |
| GET | `/admin/communication/contacts/{id}/messages` | Conversation, as `{ id, body, sentAt, fromAdmin, read }` messages. |
| POST | `/admin/communication/contacts/{id}/messages` | Body `{ body }` (1–1000 characters); returns the stored message. |
| POST | `/admin/communication/contacts/{id}/read` | Mark that staff member's messages read. |
| GET / POST | `/staff/communication/contacts` · `/{id}/messages` · `/{id}/read` | Same contract for managers and agents, with `fromMe` instead of `fromAdmin`. The server scopes contacts by role: managers see the admin, their own agents and fellow managers of their team; agents see their team's managers and the admin. |
| GET | `/admin/customers` | Customers grouped by PAN: `{ id, name, pan, email, mobile, city, entityType, applications[], openCount, completedCount, firstSeenAt, lastActivityAt }` (ADMIN). |
| GET | `/admin/service-catalog` | Services: `{ kind, name, description, feeModel, feeValue, gstRate, slaDays, active, updatedAt }` (ADMIN). |
| PUT | `/admin/service-catalog/{kind}` | Update one service; re-validated and audited by the server. |
| GET | `/workflow/cases` | Paged cases scoped to the session's role: `statuses`, `services`, `priority`, `unassignedOnly`, `overdueOnly`, `search`, `sort`, `page`, `pageSize`. Each case carries `access` (allowed actions). |
| POST | `/workflow/cases` | Submit an application; the server routes it to the owning team (status `SUBMITTED`). |
| GET | `/workflow/cases/{id}` | One case with documents, checklist, notes, client requests and history. |
| GET | `/workflow/cases/summary` | KPI counts for the session's scope (same records as the list). |
| POST | `/workflow/cases/{id}/assignment` | `{ expectedVersion, agentId, instructions, dueDate }`. |
| POST | `/workflow/cases/{id}/transitions` | `{ expectedVersion, action, note, reference?, targetStatus? }`; rejects invalid transitions. |
| PATCH | `/workflow/cases/{id}/details` · `/checklist/{itemId}` | Save draft / tick a task (assigned agent only). |
| POST | `/workflow/cases/{id}/notes` · `/documents/{docId}` (multipart) · `/documents/{docId}/review` | Internal note, upload, verify/reject. |
| GET | `/workflow/agents` · `/workflow/agents/workload` | Eligible agents and their load (managers, admin). |
| GET | `/workflow/audit-events` | Read-only audit trail (managers: team; admin: all). |
| GET / PATCH / POST | `/workflow/notifications` · `/{id}/read` · `/read-all` | In-app notifications for the session user. |

Every workflow write carries `expectedVersion`; a stale version returns 409. The server must enforce role, team,
assignment, status transition, required documents and evidence for verified milestones; the frontend rules in
`src/modules/workflow/services/transitionRules.ts` mirror them for display only.

Settings are grouped as `{ organization, billing, regional, security, workflow, notifications }`. Each field is a string,
number or boolean, keyed as in `src/modules/admin/components/settings/config/`. The backend must re-validate every
field (PAN, GSTIN, IFSC and so on), and apply the security values (password rules, lockout, session timeout) when
signing users in.

`SessionUser`: `{ id, username, displayName, role, permissions[], lastLoginAt }`. `role` must be one of `ADMIN`,
`CA_MANAGER`, `CA_AGENT`, `LOAN_MANAGER`, `LOAN_AGENT`; unknown roles are rejected. Area access requires the
`ADMIN_DASHBOARD_VIEW` or `STAFF_DASHBOARD_VIEW` permission.

Error codes the UI handles: `INVALID_CREDENTIALS` (401), `ACCOUNT_INACTIVE` (403), `TOO_MANY_ATTEMPTS` (429), and
`UNAUTHENTICATED` (401, which ends the session on any API call).

Frontend guards only shape navigation. The backend must hash passwords (BCrypt/Argon2) and enforce RBAC on every
endpoint.

## Structure

```
src/
  app/        bootstrap, routing (public/admin/staff), guards, WorkspaceLayout, status pages
  core/       api client + errors, environment, route paths, logger, utils
  modules/
    authentication/   sign-in, session lifecycle, roles and permissions, demo gateway (dev/)
    workflow/         application lifecycle shared by every role: statuses, transition rules, services,
                      queue/case/review screens, notifications, audit log, demo backend (dev/)
    admin/            dashboard (overview), one folder per menu section, sidebar and header
    ca-manager/       GST, ITR and Incorporation: intake queue, assignment, review, filing milestones
    ca-agent/         assigned CA cases: tasks, client requests, corrections, submission
    loan-manager/     Loans and Insurance: intake queue, assignment, review, lender/insurer milestones
    loan-agent/       assigned loan and insurance cases
  shared/     reusable components (Button, TextField, InlineAlert, Topbar, …), hooks, validation
  store/      auth store (in-memory; the session lives in the cookie)
  styles/     tokens (Finsolz palette), reset, globals, accessibility
public/assets/  brand logo, local SVG icons, geometric background
```

Every module uses the same layout:

```
<module>/
  api/          backend calls (and the sidebar counter API)
  components/   one folder per sidebar entry (overview, each queue, notifications, profile, …) plus shared/ (sidebar, header shortcuts)
  dashboard/    the module's landing page
  dev/          development-only demo data, never bundled in production
  hooks/        React hooks
  pages/        lazy page loaders, one per menu section
  shared/       module-wide config, navigation, types and queue settings
  validation/   input, URL-parameter and response validation
  index.ts      the only file other modules may import
```

Folders that have nothing in them yet hold a `.gitkeep` so the structure is ready to build in.

Modules communicate through their `index.ts`. Every component has its own `.css` file, and every source file stays
under 490 lines (`npm run check:lines`).
