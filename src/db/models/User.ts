import { Schema, model, type Document} from "mongoose";
import { emailRegex } from "../../constants/auth.constants.js";
import { handleSaveError, setUpdateSettings } from "../Hooks.js";

export interface UserDocument extends Document {
  email: string;
  fullName: string;
  username: string;
  password: string;
  verify: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}


const userSchema= new Schema<UserDocument>({
    email: {
        type:String,
        match: emailRegex,
        unique: true,
        required:true,
    },
    fullName: {
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
}, {versionKey: false, timestamps: true});

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);


const User= model<UserDocument>("user", userSchema)
export default User;