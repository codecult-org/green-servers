import type { ApiRouteConfig, Handlers } from "motia";
import { auth } from "../middlewares/auth.middleware";
import { supabase } from "../lib/supabase";
import { z } from "zod";

const pushMetricInputSchema = z.object({
  hostname: z.string().min(3),
  cpu: z.number(),
  memory: z.number(),
  disk: z.number(),
  uptime: z.number(),
});

export const config: ApiRouteConfig = {
  name: "PushMetricsAPI",
  type: "api",
  path: "/push_metrics",
  method: "POST",
  description: "Push server metrics",
  middleware: [auth({ required: true })],
  bodySchema: pushMetricInputSchema,
  emits: ["metric.pushed"],
  flows: ["green-server-flow"],
  responseSchema: {
    200: z.object({
      message: z.string(),
    }),
    400: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers["PushMetricsAPI"] = async (
  req,
  { state, logger , emit}
) => {
  const body = await req.body;
  const result = pushMetricInputSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: "Invalid input" },
    };
  }

  const { hostname, cpu, memory, disk, uptime } = result.data;
  const authToken = (req.headers["authorization"] ??
    req.headers["Authorization"]) as string;
  const [, token] = authToken.split(" ");
  const currentUser = await state.get("user", token);
 
  if (!currentUser) {
    return {
      status: 401,
      body: { error: "Unauthorized" },
    };
  }

  const { data: serverData, error: idError } = await supabase
    .from("servers")
    .select("*")
    .eq("userId", currentUser.userId)
    .eq("server_name", hostname)
    .maybeSingle();

  if (idError || !serverData  || !serverData.id) {
    logger.error("Server not found for user", {
      userId: currentUser.userId,
      hostname,
    });
    return {
      status: 400,
      body: { error: "Server not found" },
    };
  }

  const { data: insertData, error: insertError } = await supabase
    .from("server_metrics")
    .insert([
      {
        serverId: serverData.id,
        cpu: cpu,
        memory: memory,
        disk: disk,
        uptime: uptime,
      },
    ]);

  if (insertError) {
    logger.error("Error inserting metrics", { insertError });
    return {
      status: 500,
      body: { error: "Failed to store metrics" },
    };
  }

  logger.info("Metrics pushed", { cpu, memory, disk, uptime });
   await emit({
      topic: "metric.pushed",
      data: {
        userId: currentUser.userId,
        hostname: hostname,
        authToken: token,
        currentCpu: cpu,
        currentMemory: memory,
        currentDisk: disk,
      },
    });

  return {
    status: 200,
    body: {
      message: "Metrics received",
    },
  };
};
