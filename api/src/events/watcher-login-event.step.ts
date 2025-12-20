import { EventConfig, Handler } from "motia";
import { z } from "zod";

export const watcherLoginEventSchema = z.object({
  email: z.string().email(),
  hostname: z.string().min(3),
  success: z.boolean(),
  timestamp: z.string().optional(),
});

export const config: EventConfig = {
  name: "WatcherLoginAttemptEvent",
  type: "event",
  subscribes: ["watcher.login.attempt"],
  description: "Emitted when a watcher login attempt occurs",
  input: watcherLoginEventSchema,
  flows: ["green-server-flow"],
  emits: [],
};

export const handler: Handler = async (event, { logger }) => {
  //   const result = watcherLoginEventSchema.safeParse(event);

  //   if (!result.success) {
  //     logger.error('Invalid watcher login event data', { event });
  //     return;
  //   }

  //   const { email, hostname, success, timestamp } = result.data;
  logger.info("Watcher login attempt event received");
  //   logger.info('Watcher login attempt', {
  //     email,
  //     hostname,
  //     success,
  //     timestamp: timestamp || new Date().toISOString(),
  //   });
};
