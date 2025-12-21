import type { ApiRouteConfig, Handlers } from "motia";
import { auth } from "../middlewares/auth.middleware";
import { supabase } from "../lib/supabase";
import { z } from "zod";

const setThresholdInputSchema = z.object({
  cpuThreshold: z.number().min(0).max(100),
  memoryThreshold: z.number().min(0).max(100),
  diskThreshold: z.number().min(0).max(100),
});

export const config: ApiRouteConfig = {
  name: "SetServerThresholdAPI",
  type: "api",
  path: "/set-threshold",
  method: "POST",
  description: "Set server threshold values",
  middleware: [auth({ required: true })],
  bodySchema: setThresholdInputSchema,
  flows: ["green-server-flow"],
  emits: [],
  responseSchema: {
    200: z.object({
      message: z.string(),
    }),
    400: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers["SetServerThresholdAPI"] = async (
  req,
  { state, logger }
) => {
  const body = await req.body;
  const result = setThresholdInputSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: "Invalid input" },
    };
  }

  const { cpuThreshold, memoryThreshold, diskThreshold } = result.data;
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

  const { data: existingUser, error: userError } = await supabase
    .from("alert_thresholds")
    .select("userId")
    .eq("userId", currentUser.userId)
    .maybeSingle();

  if (userError) {
    logger.error("Error checking existing thresholds for user", {
      userId: currentUser.userId,
      error: userError,
    });
    return {
      status: 500,
      body: { error: "Failed to set thresholds" },
    };
  }

  if (existingUser) {
    logger.info("Updating existing thresholds for user", {
      userId: currentUser.userId,
    });
    const { error } = await supabase
      .from("alert_thresholds")
      .update({
        cpu: cpuThreshold,
        memory: memoryThreshold,
        disk: diskThreshold,
      })
      .eq("userId", currentUser.userId);

    if (error) {
      logger.error("Error updating thresholds for user", {
        userId: currentUser.userId,
        error,
      });
      return {
        status: 500,
        body: { error: "Failed to set thresholds" },
      };
    }
  } else {
    logger.info("Inserting new thresholds for user", {
      userId: currentUser.userId,
    });
    const { error } = await supabase.from("alert_thresholds").insert({
      userId: currentUser.userId,
      cpu: cpuThreshold,
      memory: memoryThreshold,
      disk: diskThreshold,
    });

    if (error) {
      logger.error("Error inserting thresholds for user", {
        userId: currentUser.userId,
        error,
      });
      return {
        status: 500,
        body: { error: "Failed to set thresholds" },
      };
    }
  }

  //storing threshold in memory
  await state.set("thresholds", currentUser.userId, {
    cpuThreshold: cpuThreshold,
    memoryThreshold: memoryThreshold,
    diskThreshold: diskThreshold,
  });

  return {
    status: 200,
    body: { message: "Thresholds set successfully" },
  };
};
