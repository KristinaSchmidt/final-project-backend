import { UserDocument } from "../db/models/User.ts";

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: UserDocument;
//   }
// }

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}