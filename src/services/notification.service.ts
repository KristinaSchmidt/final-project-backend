import User from "../db/models/User.js";
import Post from "../db/models/Post.js";
import { Types } from "mongoose";
import { Notification, NotificationType } from "../db/models/Notification.js";

export const listNotifications = async (recipientId: string, limit = 50) => {
  if (!Types.ObjectId.isValid(recipientId)) {
    return { notifications: [] };
  }

  const recipient = new Types.ObjectId(recipientId);

  const docs = await Notification.find({ recipient })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: "actor",
      select: "username avatarUrl avatar image photo",
      strictPopulate: false,
    })
    .populate({
      path: "post",
      select: "imageUrl image photo coverUrl",
      strictPopulate: false,
    })
    .lean();

  const notifications = docs.map((n: any) => {
    const actor = n.actor || {};
    const post = n.post || {};

    return {
      _id: n._id,
      type: n.type,
      createdAt: n.createdAt,
      isRead: n.isRead,

      actor: {
        username: actor.username || actor.name || "User",
        avatarUrl:
          actor.avatarUrl || actor.avatar || actor.image || actor.photo || "",
      },

      post: n.post
        ? {
            imageUrl:
              post.imageUrl || post.image || post.photo || post.coverUrl || "",
          }
        : undefined,

      commentText: n.commentText || "",
    };
  });

  return { notifications };
};

export const createNotification = async (args: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
  commentText?: string;
}) => {
  const { recipientId, actorId, type, postId, commentText } = args;

  if (recipientId === actorId) return null;

  if (type === "like" && postId) {
    const exists = await Notification.findOne({
      recipient: recipientId,
      actor: actorId,
      type: "like",
      post: postId,
    });

    if (exists) return exists;
  }

  const payload: any = {
    recipient: recipientId,
    actor: actorId,
    type,
  };

  if (postId) payload.post = postId;
  if (commentText) payload.commentText = commentText;

  return Notification.create(payload);
};

export const removeLikeNotification = async (args: {
  recipientId: string;
  actorId: string;
  postId: string;
}) => {
  const { recipientId, actorId, postId } = args;

  await Notification.deleteOne({
    recipient: recipientId,
    actor: actorId,
    type: "like",
    post: postId,
  });
};