import jwt, { SignOptions } from "jsonwebtoken";


type JWTPayload = string | object | Buffer;
type JWTSettings = SignOptions | undefined;


interface VerifyTokenResult {
  data: string | jwt.JwtPayload | null;
  error: Error | null;
}

const {JWT_SECRET} = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined in environment variables");
}



export const generateToken = (
  payload: JWTPayload,
  settings: JWTSettings,
): string => {
  return jwt.sign(payload, JWT_SECRET, settings);
};





export const verifyToken = (token: string): VerifyTokenResult => {
  try {
    const data = jwt.verify(token, JWT_SECRET);
    return { data, error:null };
  } catch (error) {
    if (error instanceof Error) {
      return { data: null, error };
    }
    const resultError = new Error("Token error");
    return { data: null, error: resultError };
  }
};