import type { ApiRouteConfig, Handlers } from 'motia';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6)
});

export const config: ApiRouteConfig = {
  name: 'RegisterAPI',
  type: 'api',
  path: '/register',
  method: 'POST',
  description: 'Register a new user',
  bodySchema: registerSchema,
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

export const handler: Handlers['RegisterAPI'] = async (req, { state, logger }) => {
  const body = await req.body;
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: 'Invalid input' }
    };
  }

  const { email, password } = result.data;
  
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (error || !data.user) {
    logger.error('User registration failed', { email, error });
    return {
      status: 400,
      body: { error: 'Registration failed' }
    };
  }

  logger.info('User registered', data);

  return {
    status: 200,
    body: {
      message: 'User registered successfully',
      userId: data.user.id
    }
  };
};
