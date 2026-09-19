import type { FastifyInstance } from "fastify";
import { institutionInput } from "./schemas.js";
import type { InstitutionService } from "./service.js";
export function institutionRoutes(
  app: FastifyInstance,
  service: InstitutionService,
) {
  app.get("/institutions", async () => service.list());
  app.post("/institutions", async (request, reply) => {
    const value = institutionInput.parse(request.body);
    return reply.code(201).send(
      service.register({
        ...value,
        accreditationValidUntil: value.validUntil,
      }),
    );
  });
  app.patch<{
    Params: { did: string };
    Body: { status: "approved" | "revoked" };
  }>("/institutions/:did/status", async (request) =>
    service.setStatus(
      decodeURIComponent(request.params.did),
      request.body.status,
    ),
  );
}
