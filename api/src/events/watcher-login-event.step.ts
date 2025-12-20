import { EventConfig, Handler } from "motia";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const watcherLoginEventSchema = z.object({
  id: z.string().uuid(),
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
  const result = watcherLoginEventSchema.safeParse(event);

  if (!result.success) {
    logger.error("Invalid watcher login event data", { event });
    return;
  }

  const { id, hostname, success, timestamp } = result.data;

  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const { data: existingData, error } = await supabase
    .from("servers")
    .select("*")
    .eq("userId", id)
    .eq("server_name", hostname)
    .maybeSingle();

  if (existingData) {
    logger.info("Server name already exists", {
      id,
      hostname,
    });
    return;
  }

  const { data: insertedData, error: insertError } = await supabase
    .from("servers")
    .insert([
      {
        userId: id,
        server_name: hostname,
      },
    ]);
  if (insertError) {
    logger.error("Error inserting watcher login event", { insertError });
    return;
  }

  logger.info("Watcher login attempt", {
    id,
    hostname,
    success,
    timestamp: timestamp || new Date().toISOString(),
  });
};
