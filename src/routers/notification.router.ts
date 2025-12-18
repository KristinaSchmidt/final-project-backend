import { Router } from "express";
import { getNotificationsController } from "../controllers/notification.controller.js";
import  authenticate from "../middlewares/authenticate.js";
const router = Router();

router.get("/", authenticate, getNotificationsController);

export default router;