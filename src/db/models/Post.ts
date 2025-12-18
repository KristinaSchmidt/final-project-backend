import { Schema, model, type Document, Types } from "mongoose";
import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface PostModel {
  author: Types.ObjectId;
  imageUrl: string;
  text: string;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
}

export type PostDocument = PostModel & Document;

const postSchema = new Schema<PostDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "comment",
        default: [],
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

postSchema.post("save", handleSaveError);
postSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
postSchema.post("findOneAndUpdate", handleSaveError);

const Post = model<PostDocument>("post", postSchema);
export default Post;