export const logger = {
  redact: ["DATABASE_CONNECTION"],
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
};
