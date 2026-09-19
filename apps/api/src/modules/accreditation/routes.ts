import type { FastifyInstance } from "fastify";
export function accreditationRoutes(app: FastifyInstance) {
  app.get("/accreditation/:did", async () => ({
    message: "Use /institutions for registry management",
    did: "",
  }));
}
