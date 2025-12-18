import {Schema, model, Document, Types} from "mongoose";
import { handleSaveError, setUpdateSettings } from "../hooks.js";

export type NotificationType = "like" | "comment" | "follow";

export interface NotificationDocument {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;

  post?: Types.ObjectId;
  commentText?: string;

  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },

    post: { type: Schema.Types.ObjectId, ref: "post" },
    commentText: { type: String },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.pre("findOneAndUpdate", setUpdateSettings);
notificationSchema.post("save", handleSaveError);
notificationSchema.post("findOneAndUpdate", handleSaveError);

const Notification = model<NotificationDocument>("notification", notificationSchema);
export { Notification };
export default Notification;