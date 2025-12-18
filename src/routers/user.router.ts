import express from "express";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

import {
  getMyProfileController,
  getUserProfileController,
  updateMyProfileController,
  searchUsersController,
  toggleFollowController,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/", authenticate, searchUsersController);

userRouter.get("/me", authenticate, getMyProfileController);

userRouter.patch("/me", authenticate, upload.single("avatar"), updateMyProfileController);


userRouter.post("/:id/follow", authenticate, toggleFollowController);

userRouter.get("/:id", authenticate, getUserProfileController);

export default userRouter;