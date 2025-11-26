import type { ResponseError } from "../types/interfaces.js";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;

  res.status(status).json({
    message: err.message,
  });
};