import type { Request, Response, NextFunction } from "express";
import HttpError from "../utils/HttpError.js";
import {
  getProfileDataByUserId,
  updateMyProfileByUserId,
  searchUsers,
  toggleFollowByUserIds,
} from "../services/user.service.js";

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userIdFromUrl = req.params.id;
    if (!userIdFromUrl) throw HttpError(400, "User id is required");

    const viewerId = req.user?._id ? String(req.user._id) : null;
    const profileData = await getProfileDataByUserId(userIdFromUrl, viewerId);
    res.json(profileData);
  } catch (error) {
    next(error);
  }
};

export const getMyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myUserId = req.user?._id;
    if (!myUserId) throw HttpError(401, "Not authorized");

    const profileData = await getProfileDataByUserId(String(myUserId), String(myUserId));
    res.json(profileData);
  } catch (error) {
    next(error);
  }
};

export const updateMyProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myUserId = req.user?._id;
    if (!myUserId) throw HttpError(401, "Not authorized");

    const { username, fullname, website, about } = req.body;

    const updateData: any = { username, fullname, website, about };

    if (req.file) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      updateData.avatar = `${baseUrl}/images/${req.file.filename}`;
    }

    const updatedData = await updateMyProfileByUserId(String(myUserId), updateData);
    res.json(updatedData);
  } catch (error) {
    next(error);
  }
};

export const searchUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = String(req.query.search || "").trim();
    if (!search) return res.json([]);

    const users = await searchUsers(search);
    res.json(users);
  } catch (error) {
    next(error);
  }
};




export const toggleFollowController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myUserId = req.user?._id;
    if (!myUserId) throw HttpError(401, "Not authorized");

    const targetId = req.params.id;
    if (!targetId) throw HttpError(400, "Target user id is required");

    const result = await toggleFollowByUserIds(String(myUserId), String(targetId));
    res.json(result);
  } catch (error) {
    next(error);
  }
};