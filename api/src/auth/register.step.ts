import type { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
  name: 'RegisterAPI',
  type: 'api',
  path: '/register',
  method: 'POST',
  description: 'Register a new user',
  flows: ["green-server-flow"],
  emits: ["fetch-metrics"],
  responseSchema: {
    200: z.object({
      message: z.string(),
      userId: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  }
};

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export const handler: Handlers['RegisterAPI'] = async (req, { state, logger }) => {
  const body = await req.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: 'Invalid input' }
    };
  }

  const { username, password } = result.data;
  
  // Check if user exists
  const existingUser = await state.get('users', username);
  if (existingUser) {
    return {
      status: 400,
      body: { error: 'User already exists' }
    };
  }

  // Store user
  // In a real app, hash the password!
  await state.set('users', username, { username, password, createdAt: new Date().toISOString() });

  logger.info('User registered', { username });

  return {
    status: 200,
    body: {
      message: 'User registered successfully',
      userId: username
    }
  };
};
