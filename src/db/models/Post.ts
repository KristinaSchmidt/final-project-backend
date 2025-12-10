import {Schema, model, Document, Types} from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

interface Post {
  author: Types.ObjectId;
  image: string;
  caption: string;
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
}

export type PostDocument = Post & Document;

const postSchema = new Schema<PostDocument>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "user",
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "comment",
  }]
}, {versionKey: false, timestamps: true});

postSchema.post("save", handleSaveError);

postSchema.pre("findOneAndUpdate" as any, setUpdateSettings);

postSchema.post("findOneAndUpdate", handleSaveError);

const Post = model<PostDocument>("post", postSchema);

export default Post;