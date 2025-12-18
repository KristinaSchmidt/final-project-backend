import { RequestHandler } from "express";
import HttpError from "../utils/HttpError.js";
import { verifyToken } from "../utils/jwt.js";
import { findUser } from "../services/auth.service.js";

const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");

    if (!authorization) {
      return next(HttpError(401, "Authorization header missing"));
    }

    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer" || !token) {
      return next(HttpError(401, "Invalid authorization header"));
    }

    const { data: payload, error } = verifyToken(token);

    if (error || !payload) {
      const message =
        error instanceof Error ? error.message : "Invalid or expired token";
      return next(HttpError(401, message));
    }

    if (typeof payload !== "object" || payload === null) {
      return next(HttpError(401, "Invalid token payload"));
    }

    const maybePayload = payload as { id?: string; _id?: string };
    const userId = maybePayload.id || maybePayload._id;

    if (!userId) {
      return next(HttpError(401, "Invalid token payload: missing id"));
    }

    const user = await findUser({ _id: userId });

    if (!user) {
      return next(HttpError(401, "User not found"));
    }

    // @ts-ignore – User an Request hängen
    req.user = {
      _id: user._id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      profile: user.profile,
      followers: user.followers,
      following: user.following,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;