import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'FetchMetricsAPI',
  type: 'api',
  path: '/fetch_metrics',
  method: 'GET',
  description: 'Fetch current metrics',
  emits: [],
  responseSchema: {
    200: z.object({
      metrics: z.array(z.object({
        id: z.string(),
        cpu: z.number(),
        memory: z.number(),
        disk: z.number(),
        timestamp: z.string()
      }))
    })
  }
};

export const handler: Handlers['FetchMetricsAPI'] = async (req, { streams, logger }) => {
  const metricsStream = streams.metrics;
  const groupId = 'server-1'; // consistent with push
  
  const metrics = await metricsStream.getGroup(groupId);
  
  // Sort by timestamp desc
  const sortedMetrics = metrics.sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));

  return {
    status: 200,
    body: {
      metrics: sortedMetrics
    }
  };
};
