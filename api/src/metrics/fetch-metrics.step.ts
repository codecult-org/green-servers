import type { ApiRouteConfig, Handlers } from "motia";
import { supabase } from "../lib/supabase";
import { auth } from "../middlewares/auth.middleware";
import { z } from "zod";

export const config: ApiRouteConfig = {
  name: "FetchMetricsAPI",
  type: "api",
  path: "/fetch_metrics/:serverId",
  method: "GET",
  middleware: [auth({ required: true })],
  description: "Fetch current metrics",
  emits: [],
  responseSchema: {
    200: z.object({
      metrics: z.object({
        cpu: z.number(),
        memory: z.number(),
        disk: z.number(),
        timestamp: z.string(),
      }),
    }),
    404: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers["FetchMetricsAPI"] = async (
  req,
  { logger, state }
) => {
  const serverId = req.pathParams.serverId;
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

  const { data: validServerId, error: idError } = await supabase
    .from("servers")
    .select("id")
    .eq("userId", currentUser.userId)
    .eq("id", serverId) // id refers to serverId in db
    .maybeSingle();

  if (idError || !validServerId) {
    logger.error("Server not found for user", {
      userId: currentUser.userId,
      serverId,
    });
    return {
      status: 400,
      body: { error: "Server not found" },
    };
  }

  const { data: latestMetrics, error: metricsError } = await supabase
    .from("server_metrics")
    .select("*")
    .eq("serverId", serverId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (metricsError || !latestMetrics) {
    logger.error("Metrics not found for server", { serverId });
    return {
      status: 404,
      body: { error: "Metrics not found" },
    };
  }

  return {
    status: 200,
    body: {
      metrics: {
        cpu: latestMetrics.cpu,
        memory: latestMetrics.memory,
        disk: latestMetrics.disk,
        timestamp: latestMetrics.created_at,
      },
    },
  };
};
