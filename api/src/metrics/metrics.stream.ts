import { StreamConfig } from 'motia'
import { z } from 'zod'

export const metricSchema = z.object({
  id: z.string(),
  cpu: z.number(),
  memory: z.number(),
  disk: z.number(),
  timestamp: z.string()
})

export type Metric = z.infer<typeof metricSchema>

export const config: StreamConfig = {
  name: 'metrics',
  schema: metricSchema,
  baseConfig: { storageType: 'default' },
}
