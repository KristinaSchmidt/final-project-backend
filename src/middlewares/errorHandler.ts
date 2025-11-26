import type { ResponseError } from "../types/interfaces.js";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: ResponseError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message,
  });
};