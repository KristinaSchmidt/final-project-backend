import { Request, Response, NextFunction } from "express";
import User from "../db/models/User.js";
import Post from "../db/models/Post.js";
import HttpError from "../utils/HttpError.js";

/**
 * GET /users/:id
 * Öffentliches Profil eines anderen Users
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "-password -accessToken -refreshToken"
    );

    if (!user) {
      throw HttpError(404, "User not found");
    }

    const posts = await Post.find({ author: user._id })
      .select("_id imageUrl createdAt")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        website: user.profile?.website || "",
        about: user.profile?.about || "",
        avatar: user.profile?.avatar || "",
      },
      stats: {
        posts: posts.length,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/me
 * Profil des eingeloggten Users
 */
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // _id, weil du in authenticate folgendes setzt:
    // req.user = { _id, email, fullname }
    const userId = req.user?._id;

    if (!userId) {
      throw HttpError(401, "Not authorized");
    }

    const user = await User.findById(userId).select(
      "-password -accessToken -refreshToken"
    );

    if (!user) {
      throw HttpError(404, "User not found");
    }

    const posts = await Post.find({ author: user._id })
      .select("_id imageUrl createdAt")
      .sort({ createdAt: -1 });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        website: user.profile?.website || "",
        about: user.profile?.about || "",
        avatar: user.profile?.avatar || "",
      },
      stats: {
        posts: posts.length,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};