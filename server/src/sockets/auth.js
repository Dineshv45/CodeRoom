import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";

export default function socketAuth(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("NO_TOKEN"));
    }

    try {
      const { accessSecret } = getJwtConfig();
      const decoded = jwt.verify(token, accessSecret);

      socket.user = {
        userId: decoded.userId,
        username: decoded.username,
      };

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("TOKEN_EXPIRED"));
      }
      return next(new Error("INVALID_TOKEN"));
    }
  });
}
