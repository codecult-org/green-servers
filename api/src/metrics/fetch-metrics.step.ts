import type { ApiRouteConfig, Handlers } from "motia";
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
      metrics: z.array(
        z.object({
          id: z.string(),
          cpu: z.number(),
          memory: z.number(),
          disk: z.number(),
          timestamp: z.string(),
        })
      ),
    }),
  },
};

export const handler: Handlers["FetchMetricsAPI"] = async (
  req,
  { logger, state }
) => {
  const serverId  = req.pathParams.serverId;
  const authToken = (req.headers["authorization"] ??
    req.headers["Authorization"]) as string;
  const [, token] = authToken.split(" ");
  const currentUser = await state.get("user", token);

  logger.info("Current user from fetch metrics", { currentUser });
  logger.info("Fetching metrics for server", { serverId });

  return {
    status: 200,
    body: {
      metrics: {
        id: "metric1",
        cpu: 45,
        memory: 70,
        disk: 80,
        timestamp: new Date().toISOString(),
      },
    },
  };
};
