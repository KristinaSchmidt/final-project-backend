import { Types } from "mongoose";

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      email?: string;
      username?: string;
      fullname?: string;
      avatar?: string;
      following?: Types.ObjectId[];
    }

    interface Request {
      user?: User;
    }
  }
}

export {};