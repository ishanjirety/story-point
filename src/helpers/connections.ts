import { FastifyReply } from "fastify";

export const connections: { [roomId: string]: Array<FastifyReply> } = {};
