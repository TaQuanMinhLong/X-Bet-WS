import { z } from "zod";

const ENV = z.object({
  CLIENT_ORIGIN: z.string(),
  REDIS_URL: z.string(),
});

ENV.parse(process.env);

declare global {
  var self: Worker;
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof ENV> {}
  }
}
