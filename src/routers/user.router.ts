import { Router } from "express";
import { getUserProfile, getMyProfile } from "../controllers/user.controller.js";
import authenticate from "../middlewares/authenticate.js";


const userRouter = Router();

userRouter.get("/me", authenticate, getMyProfile);

userRouter.get("/:id", getUserProfile);

export default userRouter;