# API

`GET /health` returns `{ "status": "ok" }`.

`POST /institutions` registers a pending institution:

```json
{"legalName":"Demo University","country":"IN","did":"did:web:demo.university.edu","issuerAddress":"0x0000000000000000000000000000000000000001"}
```

`PATCH /institutions/:did/status` accepts `{ "status": "approved" }` or `{ "status": "revoked" }`. `GET /institutions` lists the registry view.

## Credentials

`POST /credentials` accepts structured issuer and academic subject data, creates a W3C Verifiable Credential, signs it with the server-side Ed25519 key, and returns the stored record.

```json
{"issuer":"did:web:demo.university.edu","subject":{"id":"student-reference-001","degree":"Bachelor of Computer Science","graduationDate":"2026-05-01"}}
```

`GET /credentials/:id` returns the machine-readable VC. `GET /credentials/:id/presentation` returns a display-safe certificate model with a verification URL and QR data URL; it is not cryptographic evidence. `POST /credentials/:id/status` updates lifecycle state. `POST /credentials/:id/supersede` creates a versioned replacement, and `GET /credentials/:id/versions` returns historic versions.

## Verification

`POST /verify` accepts either `{ "credential": <W3C VC JSON> }` or `{ "credentialId": "urn:..." }`. It returns a `trusted` flag and five independent evidence records: `integrity` (structure and Ed25519 proof), `issuer` (identity trust), `accreditation` (valid authorization), `status` (active lifecycle), and `provenance` (academic type, status-list reference, version).

The QR only encodes the Credentia verification page URL. It is a locator, never proof of authenticity.

When `DATABASE_URL` is set, the API uses the Drizzle/PostgreSQL credential store. Credential documents, lifecycle changes, versions, status history, and verification evidence are persisted. Run `pnpm --filter @credentia/db migrate` against a fresh database before starting the API.
