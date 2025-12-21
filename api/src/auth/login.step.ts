import type { ApiRouteConfig, Handlers } from "motia";
import { supabase } from "../lib/supabase";
import { z } from "zod";

export const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const config: ApiRouteConfig = {
  name: "LoginAPI",
  type: "api",
  path: "/login",
  method: "POST",
  description: "Login user",
  flows: ["green-server-flow"],
  emits: [],
  bodySchema: logInSchema,
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

export const handler: Handlers["LoginAPI"] = async (req, { state, logger }) => {
  const body = await req.body;
  const result = logInSchema.safeParse(body);

  if (!result.success) {
    return {
      status: 400,
      body: { error: "Invalid input" },
    };
  }

  const { email, password } = result.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error || !data.session) {
    logger.warn("Login failed", { email, error });
    return {
      status: 401,
      body: { error: "Invalid credentials" },
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(
    data.session.access_token
  );
  
  if (userError || !userData.user) {
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

  logger.info("User logged in successfully", { email: userData.user.email });

  return {
    status: 200,
    body: {
      message: "Login successful",
      token: data.session.access_token,
    },
  };
};
