import "dotenv/config";

import express from "express";
import cors from "cors";
import passport from "./config/passportConfig.js";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import compileRoutes from "./routes/compile.routes.js";
import timelineRoutes from "./routes/timeline.routes.js";
import cookieParser from "cookie-parser";


const app = express();
app.use(passport.initialize());

export const allowedOrigins = [
  process.env.FRONT_END_URL,
  "http://localhost:5173",
  "http://192.168.100.54:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("CodeRoom Backend is running 🚀");
});
app.use("/api/users", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/timeline", timelineRoutes);

export default app;