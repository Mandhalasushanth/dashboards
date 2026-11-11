# Finsolz staff dashboards: how the code is organised

This is the web app the staff use: the admin, CA and loan managers, and CA and loan agents. Customers use
the mobile app (`../mobile-app`). Both talk to the Spring Boot backend (`../taxedge-backend`).

## Folders

```
src/
├─ core/          app-wide basics: API client (core/api), config and .env reading, logging, date utils
├─ shared/        reusable UI (Button, KpiCard, Icon, Modal…), hooks and validation; no business rules
└─ modules/
   ├─ authentication/      sign-in for every staff role
   ├─ admin/               admin-only screens: customers, staff, settings, reports, service catalog…
   ├─ ca-manager/          CA manager screens (one folder per queue: to-verify, ready-to-assign…)
   ├─ ca-agent/            CA agent screens
   ├─ loan-manager/        loan manager screens
   ├─ loan-agent/          loan agent screens
   ├─ push-notifications/  push notifications from staff to customers' phones
   └─ workflow/            the applications themselves, shared by every role (see below)
```

Every module has the same parts: `pages` (routes), `components` (screens), `hooks`, `api` (backend
calls), `shared` (types and constants), `validation`, and `dev` (see the warning below).

## Why managers and agents import from `workflow`

An application (a "case") is one thing that every role works on, so it lives in one place:

```
customer (mobile app) submits
        │
        ▼
manager: To Verify ─► Waiting on Customer / Awaiting Payment ─► Ready to Assign ─► assigns an agent
        │
        ▼
agent: New Assignment ─► works on the portal ─► Completed
        │
        ▼
admin sees everything: all applications, customers, reports, revenue
```

`workflow/` holds what all roles share:

| Folder | What is in it |
|---|---|
| `api/workflowApi.ts` | the one entry point for application data |
| `api/backendApplications.ts` | GST registrations from the backend, and agent assignment (`PUT /ca-manager/assign`) for GST, ITR and company |
| `api/backendServiceLists.ts` | every other backend list (GST filing, compliance, amendments, ITR, TDS, revised ITR, company registration), turned into applications |
| `shared/` | types, statuses, service types, and the forms for each service (`shared/forms`) |
| `services/` | rules: which status change is allowed, and what blocks it |
| `components/` | the shared screens: case table, case detail, modals, dashboards |

The role folders contain only their own screens, which use these shared pieces. Fix a rule once in
`workflow` and it is fixed for every role.

**Rule:** outside `workflow`, import only from `@/modules/workflow` (its `index.ts`), never from files
inside it. If you need something that is not exported yet, add it to `index.ts`.

## ⚠ The `dev/` folders are not just sample data

Demo mode is switched on in `.env` (`VITE_ENABLE_DEMO_AUTH=true`). While it is on:

- **Sign-in** uses the demo accounts in `authentication/dev/demoAccounts.ts`.
- **Applications are real.** `workflow/dev/demoWorkflowStore.ts` loads them from the backend database
  (through the two `backend…` files above) and keeps them in memory. No sample applications are added.
- **Status changes, payments, notifications, settings, reports and customers** are worked out in the
  browser by the `dev/` stores, because the backend has no endpoints for them yet. Status changes are
  lost on refresh, and the applications reload from the database.

So when you change how applications load or move between statuses, look in `workflow/dev/` as well as
`workflow/api/`. Each `api/` file chooses the demo store or the real backend endpoint (in
`core/api/apiEndpoints.ts`).

## Planned

- Rename `workflow` to `applications`.
- Add the missing backend endpoints, then move the real logic out of `dev/` and turn demo mode off.

## Commands

```
npm run dev          # start on http://localhost:5173 (the backend address is VITE_API_PROXY_TARGET in .env)
npx tsc --noEmit -p .  # type check
npx vitest run       # tests (src/test)
```
