import type { FastifyInstance } from "fastify";
export function statusRoutes(app: FastifyInstance) {
  app.get("/status/:index", async (request) => ({
    index: (request.params as { index: string }).index,
    status: "active",
  }));
}
