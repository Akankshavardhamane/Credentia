import type { VerifiableCredential } from "@credentia/credential-core";
import type { FastifyInstance } from "fastify";
import { verifyInput } from "./schemas.js";
import type { VerificationService } from "./service.js";
export function verificationRoutes(
  app: FastifyInstance,
  service: VerificationService,
) {
  app.post("/verify", async (request) => {
    const value = verifyInput.parse(request.body);
    return "credentialId" in value
      ? service.verifyById(value.credentialId)
      : service.verify(value.credential as unknown as VerifiableCredential);
  });
}
