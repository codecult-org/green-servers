import type { ApiRouteConfig, Handlers } from "motia";
import { supabase } from "../lib/supabase";
import { z } from "zod";

export const watcherLogInSchema = z.object({
  email: z.string().email(),
  hostname: z.string().min(3),
  password: z.string().min(6),
});

export const config: ApiRouteConfig = {
  name: "WatcherLoginAPI",
  type: "api",
  path: "/watcher-login",
  method: "POST",
  description: "Login watcher user",
  flows: ["green-server-flow"],
  emits: ["watcher.login.attempt"],
  bodySchema: watcherLogInSchema,
  responseSchema: {
    200: z.object({
      message: z.string(),
      token: z.string(),
    }),
    401: z.object({
      error: z.string(),
    }),
    400: z.object({
      error: z.string(),
    }),
  },
};

export const handler: Handlers["WatcherLoginAPI"] = async (
  req,
  { state, logger, emit }
) => {
  const body = await req.body;
  const result = watcherLogInSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: "Invalid input" },
    };
  }

  const { email, hostname, password } = result.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error || !data.session) {
    logger.warn("Watcher login failed", { email, error });
    return {
      status: 401,
      body: { error: "Invalid credentials" },
    };
  }

  const { data: userData, error: fetchUserError } = await supabase.auth.getUser(
    data.session.access_token
  );

  if (fetchUserError || !userData.user) {
    logger.error("Bearer token invalid", { fetchUserError });
    return {
      status: 401,
      body: { error: "User not found" },
    };
  }

  await state.set("user", data.session.access_token, {
    userId: userData.user.id,
    email: userData.user.email,
    user_metadata: userData.user.user_metadata,
  });

  await emit({
    topic: "watcher.login.attempt",
    data: {
      id: userData.user.id,
      hostname: hostname,
      success: true,
      timestamp: new Date().toISOString(),
    },
  });

  logger.info("Watcher login successful", { email });
  return {
    status: 200,
    body: {
      message: "Login successful",
      token: data.session.access_token,
    },
  };
};
