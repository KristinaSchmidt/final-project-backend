import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import User, { type UserDocument } from "../db/models/User.js";
import HttpError from "../utils/HttpError.js";
import type { RegisterPayload, LoginPayload } from "../schemas/auth.schemas.js";
import { Types } from "mongoose";



export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    fullname: string;
    username: string;
  };
}


interface FindUserQuery {
  _id?: string;
  email?: string;
  username?: string;
}

export const findUser = (query: FindUserQuery): Promise<UserDocument | null> => {
  return User.findOne(query).exec();
};


export const createTokens = (id: Types.ObjectId | string) => {
  const userId = typeof id === "string" ? id : id.toString();

  const accessToken: string = generateToken(
    { id: userId },
    { expiresIn: "15m" },
  );
  const refreshToken: string = generateToken(
    { id: userId },
    { expiresIn: "7d" },
  );

  return {
    accessToken,
    refreshToken,
  };
};



export const register = async (
  payload: RegisterPayload
): Promise<UserDocument> => {
  const { email, password } = payload;

  const existingUser = await findUser({ email });
  if (existingUser) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  return User.create({
    ...payload,
    password: hashPassword,
  });
};




export const login = async ({
  email,
  password,
}: LoginPayload): Promise<LoginResult> => {
  const user = await findUser({ email });

  if (!user) throw HttpError(401, "Email or password invalid");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw HttpError(401, "Email or password invalid");

  const { accessToken, refreshToken } = createTokens(user._id);

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      fullname: user.fullname,
      username: user.username,
    },
  };
};

export const refresh = async (token: string) => {
  const user = await User.findOne({ refreshToken: token });
  if (!user) throw HttpError(401, "Invalid refresh token");

  const tokens = createTokens(user._id.toString());

  user.accessToken = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};



export const logout = async (userId: string) => {
  await User.findByIdAndUpdate(userId, {
    accessToken: null,
    refreshToken: null,
  });
};