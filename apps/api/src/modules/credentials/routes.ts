import {
  issueCredentialRequestSchema,
  supersedeCredentialRequestSchema,
  updateCredentialStatusRequestSchema,
} from "@credentia/domain";
import { credentialPresentationSchema } from "@credentia/domain";
import type { FastifyInstance } from "fastify";
import type { CredentialService } from "./service.js";
export function credentialRoutes(
  app: FastifyInstance,
  service: CredentialService,
) {
  app.post("/credentials", async (request, reply) =>
    reply
      .code(201)
      .send(
        await service.issue(issueCredentialRequestSchema.parse(request.body)),
      ),
  );
  app.get<{ Params: { id: string } }>(
    "/credentials/:id",
    async (request) => await service.get(request.params.id),
  );
  app.get<{ Params: { id: string } }>(
    "/credentials/:id/presentation",
    async (request) =>
      credentialPresentationSchema.parse(
        await service.presentation(request.params.id),
      ),
  );
  app.get<{ Params: { id: string } }>(
    "/credentials/:id/status",
    async (request) => {
      const record = await service.get(request.params.id);
      return {
        credentialId: record.credential.id,
        status: record.lifecycle,
        reason: record.reason,
      };
    },
  );
  app.post<{ Params: { id: string } }>(
    "/credentials/:id/status",
    async (request) => {
      const value = updateCredentialStatusRequestSchema.parse(request.body);
      return service.updateStatus(
        request.params.id,
        value.status,
        value.reason,
      );
    },
  );
  app.post<{ Params: { id: string } }>(
    "/credentials/:id/supersede",
    async (request, reply) =>
      reply
        .code(201)
        .send(
          await service.supersede(
            request.params.id,
            supersedeCredentialRequestSchema.parse(request.body),
          ),
        ),
  );
  app.get<{ Params: { id: string } }>(
    "/credentials/:id/versions",
    async (request) => await service.versions(request.params.id),
  );
}
