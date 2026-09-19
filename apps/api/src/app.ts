import { generateKeyPairSync } from "node:crypto";
import { MockBlockchainAdapter } from "@credentia/blockchain";
import { createStatusList } from "@credentia/credential-core";
import Fastify from "fastify";
import { ZodError } from "zod";
import { InstitutionRepository } from "./modules/institutions/repository.js";
import { institutionRoutes } from "./modules/institutions/routes.js";
import { InstitutionService } from "./modules/institutions/service.js";
import { VerificationRepository } from "./modules/verification/repository.js";
import { verificationRoutes } from "./modules/verification/routes.js";
import { VerificationService } from "./modules/verification/service.js";
export function buildApp() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === "development"
          ? { target: "pino-pretty" }
          : undefined,
    },
  });
  const institutions = new InstitutionService(new InstitutionRepository());
  const keyPair = generateKeyPairSync("ed25519");
  const chain = new MockBlockchainAdapter([
    {
      did: "did:web:demo.university.edu",
      issuerAddress: "0x0000000000000000000000000000000000000001",
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2030-01-01"),
      revoked: false,
      metadataUri: "local://demo-university",
    },
  ]);
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError)
      return reply
        .code(400)
        .send({ error: "Invalid request", details: error.flatten() });
    app.log.error(error);
    return reply.code(500).send({ error: "Internal server error" });
  });
  app.get("/health", async () => ({ status: "ok" }));
  institutionRoutes(app, institutions);
  verificationRoutes(
    app,
    new VerificationService(
      chain,
      keyPair.publicKey,
      createStatusList(),
      new VerificationRepository(),
    ),
  );
  return app;
}
