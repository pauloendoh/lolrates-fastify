import { z } from "zod";

export const models = {
  pingId: z.object({
    id: z.number({ coerce: true }),
  }),
  getPong: z.object({
    pong: z.string(),
  }),
};
