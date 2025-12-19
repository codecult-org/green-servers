import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'PushMetricsAPI',
  type: 'api',
  path: '/push_metrics',
  method: 'POST',
  description: 'Push server metrics',
  emits: [],
  responseSchema: {
    200: z.object({
      message: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

const pushMetricsSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
  disk: z.number()
});

export const handler: Handlers['PushMetricsAPI'] = async (req, { streams, logger }) => {
  const body = await req.json();
  const result = pushMetricsSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: 'Invalid input' }
    };
  }

  const { cpu, memory, disk } = result.data;
  const timestamp = new Date().toISOString();
  const id = Date.now().toString();

  const metric = {
    id,
    cpu,
    memory,
    disk,
    timestamp
  };

  const metricsStream = streams.metrics;
  const groupId = 'server-1'; // Assuming single server for now

  // Add new metric
  await metricsStream.set(groupId, id, metric);

  // Maintain last 20 records
  const allMetrics = await metricsStream.getGroup(groupId);
  if (allMetrics.length > 20) {
    // Sort by timestamp
    const sortedMetrics = allMetrics.sort((a: any, b: any) => a.timestamp.localeCompare(b.timestamp));
    const toDelete = sortedMetrics.slice(0, allMetrics.length - 20);
    
    for (const item of toDelete) {
      await metricsStream.delete(groupId, item.id);
    }
  }

  logger.info('Metrics pushed', { id });

  return {
    status: 200,
    body: {
      message: 'Metrics received'
    }
  };
};
