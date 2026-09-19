# API

`GET /health` returns `{ "status": "ok" }`.

`POST /institutions` registers a pending institution:

```json
{"legalName":"Demo University","country":"IN","did":"did:web:demo.university.edu","issuerAddress":"0x0000000000000000000000000000000000000001"}
```

`PATCH /institutions/:did/status` accepts `{ "status": "approved" }` or `{ "status": "revoked" }`. `GET /institutions` lists the registry view.

`POST /verify` accepts `{ "credential": <W3C VC JSON> }` and returns independent evidence for integrity, issuer accreditation, and lifecycle status.
