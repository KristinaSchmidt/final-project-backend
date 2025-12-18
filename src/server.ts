import express from "express";
import path from "node:path";
import cors from "cors";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import {errorHandler} from "./middlewares/errorHandler.js";
import authRouter from "./routers/auth.router.js";
import userRouter from "./routers/user.router.js";
import postRouter from "./routers/post.router.js";
import notificationRouter from "./routers/notification.router.js";


const startServer=(): void => {
    const app= express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
   app.use("/images", express.static(path.join(process.cwd(), "public/images")));

    app.use("/api/auth", authRouter);

    app.use("/api/users", userRouter);

    app.use("/api/posts", postRouter);

    app.use("/api/notifications", notificationRouter);

    app.use(notFoundHandler);
    app.use(errorHandler)


    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => console.log(` Server running on ${port} port`));
}

export default startServer;