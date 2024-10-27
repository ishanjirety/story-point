import { FastifyReply, FastifyRequest } from "fastify";
import {
  TAddPointSession,
  TAddPointSessionParam,
  TJoinSession,
  TJoinSessionParam,
  TUpdateDescriptionSchema,
} from "./sessions.schema";
import { createNewSession } from "../../helpers/create-session";
import app from "../../helpers/server";
import { v4 } from "uuid";
import { createHash } from "crypto";

import deepDiff from "deep-diff";
import { connections } from "../../helpers/connections";

export async function joinSession(
  req: FastifyRequest<{
    Querystring: TJoinSession;
    Params: TJoinSessionParam;
  }>,
  res: FastifyReply
) {
  const { redis } = app;
  const { name, browserId } = req.query;
  const { sessionId: roomId } = req.params;

  res.raw.setHeader("Content-Type", "text/event-stream");
  res.raw.setHeader("Cache-Control", "no-cache");
  res.raw.setHeader("Connection", "keep-alive");
  res.raw.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
  res.raw.setHeader("Access-Control-Allow-Credentials", "true");

  let lastSessionData: TSession | null = null;

  const session = await redis.get(roomId);

  if (session) {
    const parsedSession = JSON.parse(session) as TSession;
    parsedSession.members = parsedSession.members.filter(
      (m) => m.id !== browserId
    );
    parsedSession.members.push({ name, id: browserId });

    await redis.set(roomId, JSON.stringify(parsedSession));
    if (connections[roomId]) {
      connections[roomId].push(res);
    }
    if (connections[roomId]) {
      connections[roomId].map((connection) => {
        connection.raw.write(`data: ${JSON.stringify(parsedSession)}\n\n`);
      });
    }
  } else {
    res.status(404).send({ message: "Session not found" });
    return;
  }

  // Send initial session data
  const initialSessionData = await redis.get(roomId);
  if (initialSessionData) {
    lastSessionData = JSON.parse(initialSessionData) as TSession;
    res.raw.write(`data: ${JSON.stringify(lastSessionData)}\n\n`);
  }

  const intervalId = setInterval(async () => {
    // const sessionData = await redis.get(roomId);
    // if (sessionData) {
    //   const parsedSessionData = JSON.parse(sessionData) as TSession;
    //   // Calculate diff
    //   const diff = deepDiff(lastSessionData, parsedSessionData);
    //   const newDiff = diff?.map((diff) => {
    //     return {
    //       ...diff,
    //     };
    //   });
    //   if (diff) {
    //     res.raw.write(`data: ${JSON.stringify({ newDiff })}\n\n`);
    //     lastSessionData = parsedSessionData;
    //   }
    // }
    // res.raw.write(`data: ping\n\n`);
  }, 1000);

  res.raw.on("close", () => {
    clearInterval(intervalId);
    res.raw.end();
  });
}

export function createSession(req: FastifyRequest, res: FastifyReply) {
  const { redis } = app;
  const newSession = createNewSession();
  redis.set(newSession.id, JSON.stringify(newSession));
  connections[newSession.id] = [];
  res.status(200).send(newSession);
}

export async function addStoryPoint(
  req: FastifyRequest<{
    Body: TAddPointSession;
    Params: TAddPointSessionParam;
  }>,
  res: FastifyReply
) {
  try {
    const { redis } = app;
    const { browserId, point } = req.body;
    const { sessionId: roomId } = req.params;
    const session = await redis.get(roomId);
    if (session) {
      const parsedSession = JSON.parse(session) as TSession;
      const member = parsedSession.members.find((m) => m.id === browserId);
      if (member) {
        if (!parsedSession.activeStory.votes[browserId]) {
          parsedSession.activeStory.votes = {
            ...parsedSession.activeStory.votes,
            [browserId]: {
              id: v4(),
              userId: browserId,
              vote: point,
            },
          };
        } else {
          parsedSession.activeStory.votes[browserId].vote = point;
        }
      }

      redis.set(roomId, JSON.stringify(parsedSession));
      if (connections[roomId]) {
        connections[roomId].map((connection) => {
          connection.raw.write(`data: ${JSON.stringify(parsedSession)}\n\n`);
        });
      }
      res.status(200).send(parsedSession);
    } else {
      res.status(404).send({ message: "Session not found" });
    }
  } catch (e) {}
}

export async function updateDescription(
  req: FastifyRequest<{
    Body: TUpdateDescriptionSchema;
    Params: TAddPointSessionParam;
  }>,
  res: FastifyReply
) {
  const { redis } = app;
  const { description } = req.body;
  const { sessionId: roomId } = req.params;
  const session = await redis.get(roomId);
  if (session) {
    const parsedSession = JSON.parse(session) as TSession;
    parsedSession.activeStory.description = description;
    redis.set(roomId, JSON.stringify(parsedSession));
    if (connections[roomId]) {
      connections[roomId].map((connection) => {
        connection.raw.write(`data: ${JSON.stringify(parsedSession)}\n\n`);
      });
    }
    res.status(200).send(parsedSession);
  } else {
    res.status(404).send({ message: "Session not found" });
  }
}
