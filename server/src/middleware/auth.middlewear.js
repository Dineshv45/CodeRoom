import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(authHeader);

  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { accessSecret } = getJwtConfig();

    if (!accessSecret) {
      return res.status(500).json({ message: "JWT access secret missing" });
    }

    const decoded = jwt.verify(token, accessSecret);
    req.user = decoded; // { userId, username }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
