import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {

  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if(!token && req.cookies.accessToken){
      token = req.cookies.accessToken;
    }
    
    // Check if token is missing or a placeholder string from localStorage
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "No token provided" });
    }

    const {accessSecret} = getJwtConfig();

    try {
      const decodedToken = jwt.verify(token, accessSecret);
      const user = await User.findById(decodedToken.userId);

      if(!user){
        return res.status(401).json({message:"User not found"})
      }

      req.user = {
        userId:user._id.toString(),
        username:user.username,
      };
      next();
    } catch (jwtError) {
      console.error("JWT Verification Error:", jwtError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
