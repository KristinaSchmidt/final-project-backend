import { Request, Response, NextFunction } from "express";
import Post from "../db/models/Post.js";
import Comment from "../db/models/Comment.js";
import Notification from "../db/models/Notification.js";
import HttpError from "../utils/HttpError.js";



type AuthRequest = Request & {
  user?: {
    _id: string;
    email?: string;
    username?: string;
    fullname?: string;
  };
};


export const getPostComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("author", "username fullname avatar")
      .lean();

    res.json(comments);
  } catch (e) {
    next(e);
  }
};


export const addCommentController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;

    const text = String(req.body?.text ?? "").trim();
    if (!text) throw HttpError(400, "text is required");

    if (!req.user?._id) throw HttpError(401, "Not authorized");

    const post = await Post.findById(postId);
    if (!post) throw HttpError(404, "Post not found");

    const comment = await Comment.create({
      author: req.user._id,
      post: post._id,
      text,
    });

    post.comments.push(comment._id);
    await post.save();


    if (String(post.author) !== String(req.user._id)) {
      await Notification.create({
        type: "comment",
        sender: req.user._id,
        recipient: post.author,
        post: post._id,
        comment: comment._id,
        isRead: false,
      });
    }


    const populated = await Comment.findById(comment._id)
      .populate("author", "username fullname avatar")
      .lean();

    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
};