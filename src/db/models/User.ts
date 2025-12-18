import { Schema, model, type Document, Types} from "mongoose";
import { emailRegex } from "../../constants/auth.constants.js";
import { handleSaveError, setUpdateSettings } from "../hooks.js";


export interface UserProfile {
  website?: string;
  about?: string;
  avatar?: string;
}
export interface UserDocument extends Document {
  email: string;
  fullname: string;
  username: string;
  password: string;
  verify: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  profile: UserProfile;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const DEFAULT_AVATAR =
  process.env.DEFAULT_AVATAR_URL || `${BASE_URL}/images/default-avatar.jpg`;


const userSchema= new Schema<UserDocument>({
    email: {
        type:String,
        match: emailRegex,
        unique: true,
        required:true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password:{
        type: String,
        required:true,
    },

    profile: {
      website: {
        type: String,
        default: "",
        trim: true,
      },
      about: {
        type: String,
        default: "",
        trim: true,
      },
      avatar: {
        type: String,
        default: DEFAULT_AVATAR,
      },
    },

    accessToken: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
}, {versionKey: false, timestamps: true});

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate" as any, setUpdateSettings);

userSchema.post("findOneAndUpdate" as any, handleSaveError);


const User= model<UserDocument>("user", userSchema)
export default User;