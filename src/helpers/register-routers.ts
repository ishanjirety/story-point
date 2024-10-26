import { FastifyInstance } from "fastify";
import { sessionRoutes } from "../modules/sessions/sessions.route";

export function registerRoutes(fastify: FastifyInstance) {
  fastify.register(
    async (instance) => {
      instance.register(sessionRoutes, { prefix: "/session" });
    },
    { prefix: "/api/v1" }
  );

  // Health check
  fastify.register((app) =>
    app.get("/health", (req, res) => {
      res.status(200).send({
        status: "Healthy",
      });
    })
  );
}
