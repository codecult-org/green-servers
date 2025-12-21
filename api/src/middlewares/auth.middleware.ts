import { ApiMiddleware, ApiResponse } from "motia";

export const auth = ({ required }: { required: boolean }): ApiMiddleware => {
  const authMiddleware: ApiMiddleware = async (
    req,
    ctx,
    next
  ): Promise<ApiResponse<number, unknown>> => {
    ctx.logger.info("Validating bearer token middleware");

    const authToken = (req.headers["authorization"] ??
      req.headers["Authorization"]) as string;

    if (!authToken && required) {
      ctx.logger.error("No authorization header found in request");

      return {
        status: 401,
        body: { error: "Unauthorized" },
      };
    } else if (!authToken && !required) {
      ctx.logger.info(
        "No authorization header found in request, but not required"
      );
      return next();
    }

    ctx.logger.info("Authorization header found in request");

    return next();
  };
  return authMiddleware;
};
