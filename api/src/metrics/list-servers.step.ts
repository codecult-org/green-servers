import type { ApiRouteConfig, Handlers } from 'motia';
import { auth } from '../middlewares/auth.middleware';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'ListServersAPI',
  type: 'api',
  path: '/list-servers',
  method: 'GET',
  middleware: [auth({ required: true })],
  description: 'List all servers for the authenticated user',
  emits: [],
  flows: ['green-server-flow'],
  responseSchema: {
    200: z.object({
      servers: z.array(
        z.object({
          id: z.string(),
          server_name: z.string(),
        })
      ),
    }),
    401: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers['ListServersAPI'] = async (req, { logger, state }) => {
  const authToken = (req.headers['authorization'] ??
    req.headers['Authorization']) as string;
  const [, token] = authToken.split(' ');
  const currentUser = await state.get('user', token);

  if (!currentUser) {
    return {
      status: 401,
      body: { error: 'Unauthorized' },
    };
  }

  const { data: servers, error } = await supabase
    .from('servers')
    .select('id, server_name')
    .eq('userId', currentUser.userId);

  if (error) {
    logger.error('Error fetching servers for user', {
      userId: currentUser.userId,
      error,
    });
    return {
      status: 500,
      body: { error: 'Failed to fetch servers' },
    };
  }

  return {
    status: 200,
    body: { servers: servers || [] },
  };
};
