# TaxEdge Backend

Consolidated backend structure combining DDD rigor for complex filing domains
(GST / ITR / Loan / Insurance) with a simpler layered style for supporting
modules (customer profile, document vault, notifications).

Package base: `com.taxedge` (standardized — do not drift to `com.tax.taxedge`).

See `docs/architecture/system-architecture.md` for the full rationale and
`docs/architecture/adr/` for individual architecture decision records.

## Modules

| Module | Style | Notes |
|---|---|---|
| gst, itr, loan | Full DDD | complex domains, many statuses, external providers |
| insurance, companyregistration | Full DDD | feature-flagged, post-MVP |
| customer, document, notification | Layered | simple CRUD-ish, no DDD ceremony needed |
| catalog | Layered | pricing/service catalog — nothing else hard-codes a fee |
| lead | Layered | cross-domain leads, converts into a domain Application once qualified |
| application-tracking | Orchestration only | never owns filing logic, listens to domain events |
| audit | Event listener | write-only from other modules' side |

## Getting started

```bash
./mvnw spring-boot:run
# or
docker compose up --build
```
