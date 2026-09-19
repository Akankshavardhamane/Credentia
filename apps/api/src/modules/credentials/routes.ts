import type { FastifyInstance } from "fastify";
export function credentialRoutes(app: FastifyInstance) {
  app.get("/credentials/:id", async (request) => ({
    id: (request.params as { id: string }).id,
    message:
      "Credential payloads are retained by the issuer or storage adapter.",
  }));
}
