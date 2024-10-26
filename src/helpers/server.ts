import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import gaurd from "fastify-guard";

import cors from "@fastify/cors";
import { logger } from "./logger";
import { registerRoutes } from "./register-routers";
import fastifySocket from "fastify-socket.io";
import fastifyRedis from "@fastify/redis";

const app = await fastify({
  logger,
  pluginTimeout: 10000,
});
app.register(cors, {
  origin: "http://localhost:5173", // Ensure this exactly matches your client origin
  methods: ["GET", "POST"], // Allow necessary methods
  allowedHeaders: ["Content-Type"], // Minimal headers for `EventSource`
  credentials: true, // Enable cookies and credentials
});
app.register(fastifySocket);
app.register(fastifyRedis, {
  host: "127.0.0.1",
});
registerRoutes(app as unknown as FastifyInstance);

export default app;
