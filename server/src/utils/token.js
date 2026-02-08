import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";

export const generateAccessToken = (user) => {
  const { accessSecret, accessExpiresIn } = getJwtConfig();

  if (!accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is undefined");
  }

  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    accessSecret,
    { expiresIn: accessExpiresIn }
  );
};

export const generateRefreshToken = (user) => {
  const { refreshSecret, refreshExpiresIn } = getJwtConfig();

  if (!refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is undefined");
  }

  return jwt.sign(
    { userId: user._id },
    refreshSecret,
    { expiresIn: refreshExpiresIn }
  );
};
