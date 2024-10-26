// import { userBodySchemaToJson } from './user.schema'
import { FastifyInstance, FastifyRequest } from "fastify";
import {
  addStoryPoint,
  createSession,
  joinSession,
} from "./sessions.controller";
import {
  addPointSessionSchemaToJson,
  joinSessionBodySchemaToJson,
} from "./sessions.schema";

export async function sessionRoutes(app: FastifyInstance) {
  // join session
  app.get(
    "/join/:sessionId",
    {
      schema: joinSessionBodySchemaToJson,
    },
    joinSession
  );

  app.post("/create", createSession);

  app.post(
    "/add-point/:sessionId",
    {
      schema: addPointSessionSchemaToJson,
    },
    addStoryPoint
  );
}
