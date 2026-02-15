import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";
import User from "../models/User.js"; // 👈 add this

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { accessSecret } = getJwtConfig();

    if (!accessSecret) {
      return res.status(500).json({ message: "JWT access secret missing" });
    }

    const decoded = jwt.verify(token, accessSecret);

    // 🔥 CRITICAL CHECK — Verify user still exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach fresh user info
    req.user = {
      userId: user._id.toString(),
      username: user.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
