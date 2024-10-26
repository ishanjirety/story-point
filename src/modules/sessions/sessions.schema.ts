import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const joinSessionBodySchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }),
  browserId: z.string({
    required_error: "Browser id is required",
  }),
});

export const joinSessionParamSchema = z.object({
  sessionId: z.string({
    required_error: "Session id is required",
  }),
});

export type TJoinSession = z.infer<typeof joinSessionBodySchema>;

export type TJoinSessionParam = z.infer<typeof joinSessionParamSchema>;

export const joinSessionBodySchemaToJson = {
  query: zodToJsonSchema(joinSessionBodySchema),
  params: zodToJsonSchema(joinSessionParamSchema),
};

export const addPointSessionSchema = z.object({
  point: z.number({
    required_error: "Point is required",
  }),
  browserId: z.string({
    required_error: "Browser id is required",
  }),
});

export const addPointSessionParamSchema = z.object({
  sessionId: z.string({
    required_error: "Session id is required",
  }),
});

export type TAddPointSession = z.infer<typeof addPointSessionSchema>;

export type TAddPointSessionParam = z.infer<typeof joinSessionParamSchema>;

export const addPointSessionSchemaToJson = {
  body: zodToJsonSchema(addPointSessionSchema),
  params: zodToJsonSchema(addPointSessionParamSchema),
};
