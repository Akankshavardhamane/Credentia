# Credentia

Credentia is a trust and verification platform for academic credentials. An accreditation authority authorizes an institution; the institution issues a W3C Verifiable Credential; anyone can independently verify its proof, issuer authorization, and lifecycle status.

## Architecture

The monorepo separates credential cryptography from API, UI, database, contract, and optional external-service adapters. It stores no student data on-chain. The local MVP uses mock/local adapters so it works without Pinata, Biconomy, or an RPC endpoint.

## Repository

`apps/web` React verifier UI · `apps/api` Fastify service · `packages/credential-core` W3C VC / Ed25519 / Merkle logic · `packages/db` Drizzle schema · `packages/storage`, `blockchain`, and `gasless` replaceable adapters · `contracts` Foundry registry.

## Local setup

```sh
pnpm install
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
pnpm dev
```

Web: `http://localhost:5173`; API: `http://localhost:3001/health`.

## Commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
cd contracts && forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std && forge test
```

## Environment

`DATABASE_URL` enables Postgres/Drizzle development. `PINATA_JWT`, `RPC_URL`, `REGISTRY_ADDRESS`, and `BICONOMY_API_KEY` enable their adapters; none is needed for the local MVP.

## Security

Private keys stay server-side. Credential content and student PII are never committed or stored on-chain. Verification recomputes evidence and never trusts a frontend result.

## Collaboration

Use `develop` as integration branch and create `feature/*`, `fix/*`, `chore/*`, or `docs/*` branches. Use conventional commits such as `feat: add issuer approval`.
