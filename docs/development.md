# Development

Install pnpm 9 and Node 22. Run `pnpm install`, copy `.env.example`, then start Postgres with `docker compose -f infra/docker-compose.yml up -d`. `pnpm dev` starts the API and Vite app. `pnpm seed:demo --filter @credentia/api` prints safe demo fixtures: accredited/unaccredited institutions, active/tampered/revoked/superseded credentials, and a rotated issuer key. `pnpm test` runs unit/API tests; `pnpm build` compiles the workspace. Foundry is separate: install its OpenZeppelin and forge-std dependencies as in the README, then run `forge test` inside `contracts`.
