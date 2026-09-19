# Domain model

`Institution` is the legal organization. An `IssuerIdentity` belongs to an institution and holds authorization for credential types. An `IssuerKey` is independently registered, rotated, retired, or revoked; historical verification resolves the key at the proof creation time. `Accreditation` establishes trust in the institution. A `Credential` has a lifecycle and version links; superseded credentials remain historically verifiable.

The shared types and repository contracts live in `@credentia/domain`. API and web must consume API schemas or these types rather than redefine contracts.
