import { RequestHandler } from "express";
import HttpError from "../utils/HttpError.js";
import { verifyToken } from "../utils/jwt.js";
import { findUser } from "../services/auth.service.js";
import User from "../db/models/User.js";

const authenticate: RequestHandler = async (req, res, next) => {
  const authorization = req.get("Authorization");
  if (!authorization) {
    return next(HttpError(401, "Authorization header missing"));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(HttpError(401, "Invalid authorization format"));
  }

  const { data: payload, error } = verifyToken(token);

  if (error || !payload || typeof payload !== "object" || !("id" in payload)) {
    return next(HttpError(401, "Invalid or expired token"));
  }

  const user = await findUser({ _id: payload.id });
  if (!user) {
    return next(HttpError(401, "User not found"));
  }
  
// @ts-ignore
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
};

export default authenticate;