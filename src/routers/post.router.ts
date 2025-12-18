import express from "express";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

import {
  getFeedController,
  createPostController,
  getPostByIdController,
  toggleLikeController,
  updatePostController,
  deletePostController,
  getExploreController,
  getPostsByUserController,
} from "../controllers/post.controller.js";

import { addCommentController, getPostComments } from "../controllers/comment.controller.js";

const postRouter = express.Router();

postRouter.get("/feed", authenticate, getFeedController);
postRouter.get("/explore", authenticate, getExploreController);


postRouter.get("/user/:userId", authenticate, getPostsByUserController);

postRouter.post("/", authenticate, upload.single("image"), createPostController);


postRouter.get("/:postId", authenticate, getPostByIdController);


postRouter.post("/:postId/likes", authenticate, toggleLikeController);


postRouter.get("/:postId/comments", authenticate, getPostComments);
postRouter.post("/:postId/comments", authenticate, addCommentController);


postRouter.patch("/:id", authenticate, updatePostController);
postRouter.delete("/:id", authenticate, deletePostController);

export default postRouter;