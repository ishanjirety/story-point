import { FastifyReply, FastifyRequest } from "fastify";
import {
  TAddPointSession,
  TAddPointSessionParam,
  TJoinSession,
  TJoinSessionParam,
} from "./sessions.schema";
import { createNewSession } from "../../helpers/create-session";
import app from "../../helpers/server";
import { v4 } from "uuid";
import { createHash } from "crypto";

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
  res.raw.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // Set your client URL
  res.raw.setHeader("Access-Control-Allow-Credentials", "true");

  let lastChecksum: string | null = null;

  const session = await redis.get(roomId);

  if (session) {
    const parsedSession = JSON.parse(session) as TSession;
    parsedSession.members = parsedSession.members.filter(
      (m) => m.id !== browserId
    );
    parsedSession.members.push({ name, id: browserId });

    await redis.set(roomId, JSON.stringify(parsedSession));
  } else {
    res.status(404).send({ message: "Session not found" });
    return;
  }

  // Send initial session data
  const initialSessionData = await redis.get(roomId);
  if (initialSessionData) {
    res.raw.write(`data: ${initialSessionData}\n\n`);
    lastChecksum = createHash("md5").update(initialSessionData).digest("hex");
  }

  const intervalId = setInterval(async () => {
    const sessionData = await redis.get(roomId);
    if (sessionData) {
      const currentChecksum = createHash("md5")
        .update(sessionData)
        .digest("hex");

      if (currentChecksum !== lastChecksum) {
        res.raw.write(`data: ${sessionData}\n\n`);
        lastChecksum = currentChecksum;
      }
    }
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
  res.status(200).send(newSession);
}

export function addStoryPoint(
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
    redis.get(roomId).then((session) => {
      if (session) {
        const parsedSession = JSON.parse(session) as TSession;
        const member = parsedSession.members.find((m) => m.id === browserId);
        if (member) {
          if (
            !parsedSession.activeStory.votes.find(
              (user) => user.userId === browserId
            )
          ) {
            parsedSession.activeStory.votes = [
              ...parsedSession.activeStory.votes,
              {
                id: v4(),
                userId: browserId,
                vote: point,
              },
            ];
          } else {
            parsedSession.activeStory.votes =
              parsedSession.activeStory.votes.map((members) => {
                if (members.userId === browserId) members.vote = point;
                return members;
              });
          }
        }
        redis.set(roomId, JSON.stringify(parsedSession));
        res.status(200).send(parsedSession);
      } else {
        res.status(404).send({ message: "Session not found" });
      }
    });
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
}
