import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'LoginAPI',
  type: 'api',
  path: '/login',
  method: 'POST',
  description: 'Login user',
  flows: ["green-server-flow"],
  emits: [],
  responseSchema: {
    200: z.object({
      message: z.string(),
      token: z.string()
    }),
    401: z.object({
      error: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const handler: Handlers['LoginAPI'] = async (req, { state, logger }) => {
  const body = await req.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: 'Invalid input' }
    };
  }

  const { username, password } = result.data;
  
  const user: any = await state.get('users', username);
  
  if (!user || user.password !== password) {
    return {
      status: 401,
      body: { error: 'Invalid credentials' }
    };
  }

  // Generate a fake token
  const token = `token-${username}-${Date.now()}`;

  logger.info('User logged in', { username });

  return {
    status: 200,
    body: {
      message: 'Login successful',
      token
    }
  };
};
