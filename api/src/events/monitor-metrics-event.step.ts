import { EventConfig, Handler } from "motia";
import { sendEmail } from "../lib/mailService";
import { z } from "zod";

export const monitorMetricsEventSchema = z.object({
  userId: z.string().uuid(),
  hostname: z.string().min(3),
  authToken: z.string(),
  currentCpu: z.number().min(0).max(100),
  currentMemory: z.number().min(0).max(100),
  currentDisk: z.number().min(0).max(100),
});

export const config: EventConfig = {
  name: "MonitorMetricsEvent",
  type: "event",
  subscribes: ["metric.pushed"],
  description: "Event to monitor server metrics against thresholds",
  input: monitorMetricsEventSchema,
  flows: ["green-server-flow"],
  emits: [],
};

export const handler: Handler = async (event, { logger, state }) => {
  const result = monitorMetricsEventSchema.safeParse(event);

  if (!result.success) {
    logger.error("Invalid monitor metrics event data", { event });
    return;
  }

  const {
    userId,
    authToken,
    hostname,
    currentCpu,
    currentMemory,
    currentDisk,
  } = result.data;

  const userThresholds = await state.get("thresholds", userId);
  if (!userThresholds) {
    logger.warn("No thresholds set for user", { userId });
    return;
  } else {
    logger.info("Retrieved thresholds from state", { userThresholds });
  }

  const currentUser = await state.get("user", authToken);
  if (!currentUser) {
    logger.error("User not found for monitoring metrics", { userId });
    return;
  }

  const { cpuThreshold, memoryThreshold, diskThreshold } = userThresholds;
  if (
    currentCpu > cpuThreshold ||
    currentMemory > memoryThreshold ||
    currentDisk > diskThreshold
  ) {
    await sendEmail(
      currentUser.email,
      "Monitoring Alert from Green Servers",
      "",
      {
        hostname: hostname,
        cpu: currentCpu,
        memory: currentMemory,
        disk: currentDisk,
      }
    );
  }

  logger.info("Monitoring metrics for user", {
    userId,
    cpuThreshold,
    memoryThreshold,
    diskThreshold,
  });
};
