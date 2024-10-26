import * as zennv from "zennv";
import { z } from "zod";
import "dotenv";

export const env = zennv.main({
  dotenv: true,
  schema: z.object({
    PORT: z.number().default(3000),
    HOST: z.string().default("0.0.0.0"),
  }),
});
