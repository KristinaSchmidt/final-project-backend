import Post from "../db/models/Post.js";
import Comment from "../db/models/Comment.js";
import { Notification } from "../db/models/Notification.js";
import HttpError from "../utils/HttpError.js";
import { Types } from "mongoose";
import User from "../db/models/User.js";

export const createPostByUserId = async (
  userId: string,
  data: { imageUrl: string; text?: string }
) => {
  if (!data.imageUrl) throw HttpError(400, "Image is required");

  const created = await Post.create({
    author: userId,
    imageUrl: data.imageUrl,
    text: String(data.text ?? ""),
    likes: [],
    comments: [],
  });

  return created;
};

export const getPostByIdForViewer = async (postId: string, viewerId?: string) => {
  const postDoc = await Post.findById(postId)
    .populate("author", "username fullname avatar profile.avatar avatarUrl")
    .populate({
      path: "comments",
      options: { sort: { createdAt: 1 } },
      populate: { path: "author", select: "username fullname avatar profile.avatar avatarUrl" },
    });

  if (!postDoc) throw HttpError(404, "Post not found");

  const post = postDoc.toObject();

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const likedByMe = viewerId
    ? likes.some((id: any) => String(id) === String(viewerId))
    : false;

  const postWithMeta = {
    ...post,
    likesCount: likes.length,
    likedByMe,
  };

  return { post: postWithMeta };
};

export const toggleLike = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw HttpError(404, "Post not found");

  const uid = new Types.ObjectId(userId);

  const alreadyLiked = post.likes.some((id: any) => id.toString() === uid.toString());

  if (alreadyLiked) {
    post.likes = post.likes.filter((id: any) => id.toString() !== uid.toString());
  } else {
    post.likes.push(uid);


    if (String(post.author) !== String(userId)) {
      await Notification.create({
        recipient: post.author,
        actor: userId,
        type: "like",
        post: post._id,
        isRead: false,
      });
    }
  }

  await post.save();

  return {
    likesCount: post.likes.length,
    likedByMe: !alreadyLiked,
  };
};

export const addComment = async (postId: string, userId: string, text: string) => {
  const clean = String(text ?? "").trim();
  if (!clean) throw HttpError(400, "Comment text is required");

  const post = await Post.findById(postId);
  if (!post) throw HttpError(404, "Post not found");

  const comment = await Comment.create({
    post: post._id,
    author: userId,
    text: clean,
  });

  post.comments.push(comment._id);
  await post.save();

 
  if (String(post.author) !== String(userId)) {
    await Notification.create({
      recipient: post.author,
      actor: userId,
      type: "comment",
      post: post._id,
      commentText: clean,
      isRead: false,
    });
  }

  const populated = await Comment.findById(comment._id).populate(
    "author",
    "username fullname avatar profile.avatar avatarUrl"
  );

  return { comment: populated };
};



export const getExplorePosts = async (myUserId: string) => {
  const me = await User.findById(myUserId).select("following");
  const followingIds = me?.following || [];

  const posts = await Post.find({
    author: { $ne: myUserId, $nin: followingIds },
  })
    .select("_id imageUrl")
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();

  return { posts };
};