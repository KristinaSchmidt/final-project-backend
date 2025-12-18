import type { Request, Response, NextFunction } from "express";
import HttpError from "../utils/HttpError.js";
import {
  createPostByUserId,
  getPostByIdForViewer,
  toggleLike,
  getExplorePosts,
} from "../services/post.service.js";
import Post from "../db/models/Post.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const getAuthUserId = (req: any) =>
  req.user?.id || req.user?._id?.toString?.() || req.userId || null;

const withLikeMeta = (post: any, userId?: string | null) => {
  if (!post) return post;

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const likedByMe = userId
    ? likes.some((id: any) => id?.toString?.() === userId.toString())
    : false;

  return {
    ...post,
    likesCount: likes.length,
    likedByMe,
  };
};


export const createPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myUserId = (req as any).user?._id;
    if (!myUserId) throw HttpError(401, "Not authorized");
    if (!(req as any).file) throw HttpError(400, "Image is required");

    const text = String((req as any).body?.text ?? "");
    const imageUrl = `${BASE_URL}/images/${(req as any).file.filename}`;

    const post = await createPostByUserId(String(myUserId), {
      imageUrl,
      text,
    });

    res.status(201).json({ post: withLikeMeta(post, String(myUserId)) });
  } catch (error) {
    next(error);
  }
};


export const getPostByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const viewerId = getAuthUserId(req);
    const { postId } = req.params;
    const result: any = await getPostByIdForViewer(postId, viewerId || undefined);

    if (result?.post) {
      result.post = withLikeMeta(result.post, viewerId);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const toggleLikeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) throw HttpError(401, "Not authorized");

    const { postId } = req.params;
    const result = await toggleLike(postId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: any = (req as any).user;
    if (!user) throw HttpError(401, "Not authorized");

    const userId = getAuthUserId(req);

    const authors =
      user.following && user.following.length > 0
        ? [...user.following, user._id]
        : [user._id];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      author: { $in: authors },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullname avatar profile.avatar avatarUrl")
      .lean();


    const mapped = posts.map((p: any) => withLikeMeta(p, userId));

    res.status(200).json({ posts: mapped });
  } catch (error) {
    next(error);
  }
};




export const updatePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text } = (req as any).body;

    const post = await Post.findByIdAndUpdate(id, { text }, { new: true }).lean();
    if (!post) throw HttpError(404, "Post not found");

    const userId = getAuthUserId(req);
    res.status(200).json({ post: withLikeMeta(post, userId) });
  } catch (error) {
    next(error);
  }
};




export const deletePostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);
    if (!post) throw HttpError(404, "Post not found");

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};




export const getExploreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) throw HttpError(401, "Not authorized");

    const result: any = await getExplorePosts(String(userId));
    if (Array.isArray(result?.posts)) {
      result.posts = result.posts.map((p: any) => withLikeMeta(p, userId));
    } else if (Array.isArray(result)) {
      const mapped = result.map((p: any) => withLikeMeta(p, userId));
      return res.status(200).json(mapped);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getPostsByUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const posts = await Post.find({ author: userId }) 
    .sort({ createdAt: -1 })
    .select("_id imageUrl text createdAt likesCount commentsCount")
    .lean();

  res.status(200).json(posts);
};