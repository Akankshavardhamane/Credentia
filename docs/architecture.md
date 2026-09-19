# Architecture

```text
Accreditation authority
        | manages issuer eligibility
        v
AccreditationRegistry <--- viem / MockBlockchainAdapter
        |                         |
University issuer --> Fastify API --> credential-core (W3C VC + Ed25519)
                         |                 |
                         v                 v
                    PostgreSQL         status list / Merkle batch
                         |
Verifier UI <-------- walletless verification evidence
```

The core package has no Fastify, React, database, or external SDK dependency. Storage and gas abstraction are adapter boundaries. BBS derived proofs are intentionally deferred: the `SelectiveDisclosureProvider` interface reserves that capability, while a Merkle inclusion proof is available for MVP batch evidence.
