import jwt from "jsonwebtoken";
import { getJwtConfig } from "../config/jwt.js";

export default function socketAuth(io) {
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;

    // Fallback to cookies if no auth token provided
    if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, curr) => {
            const [name, value] = curr.split('=').map(c => c.trim());
            acc[name] = value;
            return acc;
        }, {});
        token = cookies.accessToken;
    }

    if (!token || token === "null" || token === "undefined") {
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
