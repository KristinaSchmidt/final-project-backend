import {Schema, model, Document, Types} from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

interface Comment {
  author: Types.ObjectId;
  post: Types.ObjectId;
  text: string;
}

export type CommentDocument = Comment & Document;

const commentSchema = new Schema<CommentDocument>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "post",
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
}, {versionKey: false, timestamps: true});

commentSchema.post("save", handleSaveError);

commentSchema.pre("findOneAndUpdate", setUpdateSettings);

commentSchema.post("findOneAndUpdate", handleSaveError);

const Comment = model<CommentDocument>("comment", commentSchema);

export default Comment;