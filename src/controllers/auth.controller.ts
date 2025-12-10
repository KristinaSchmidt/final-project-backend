import { Request, Response, NextFunction, RequestHandler } from "express";
import { register, login, logout, refresh,  type LoginResult } from "../services/auth.service.js";
import validateBody from "../utils/validateBody.js";
import { registerSchema,loginSchema, type RegisterPayload, type LoginPayload, refreshSchema, RefreshPayload} from "../schemas/auth.schemas.js";
// import { AuthRequest } from "../types/interfaces.js";
import { createTokens } from "../services/auth.service.js";


export const registerController: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validData: RegisterPayload = validateBody<RegisterPayload>(
      registerSchema,
      req.body,
    );

    await register(validData);

    res.status(201).json({
      message: "Register successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const loginController: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validData: LoginPayload = validateBody<LoginPayload>(
      loginSchema,
      req.body,
    );
    const result: LoginResult = await login(validData);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};



export const getCurrentController = async (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      email: req.user.email,
      fullname: req.user.fullname,
      username: req.user.username,
    }
  });
};



export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = validateBody<RefreshPayload>(refreshSchema, req.body);
    const tokens = await refresh(refreshToken);

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};


export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await logout(req.user!._id.toString());
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};