import type { ZodTypeAny } from "zod";
import HttpError from "./HttpError.js";

const validateBody = <T>(schema: ZodTypeAny, body: unknown): T => {
  const result = schema.safeParse(body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message ?? "Invalid request body";

    throw HttpError(400, message);
  }

  return result.data as T;
};

export default validateBody;