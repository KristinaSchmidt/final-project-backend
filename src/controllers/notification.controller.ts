import { Request, Response } from "express";
import { listNotifications } from "../services/notification.service.js";

const getAuthUserId = (req: any): string | null => {

  return (
    req.user?.id ||
    req.user?._id?.toString?.() ||
    req.userId ||
    null
  );
};

export const getNotificationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const limit = Number(req.query.limit) || 50;
  const data = await listNotifications(userId, limit);

  res.status(200).json(data);
};