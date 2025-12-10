import { Router } from "express";
import { registerController, loginController, logoutController, getCurrentController, refreshController } from "../controllers/auth.controller.js";
import authenticate from "../middlewares/authenticate.js";



const authRouter= Router();

authRouter.post("/register", registerController);

authRouter.post("/login", loginController);

authRouter.get("/current", authenticate, getCurrentController);

authRouter.post("/refresh", refreshController);

authRouter.post("/logout", authenticate, logoutController);

export default authRouter;