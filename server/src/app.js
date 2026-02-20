import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connection } from "./config/connect.js";

import authRoutes from "./routes/auth.routes.js";
import roomRoutes from "./routes/room.routes.js";
import compileRoutes from "./routes/compile.routes.js";


connection();

const app = express();


const allowedOrigins = [
  process.env.FRONT_END_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Request Error"));
    }
  },
  credentials: true,
}));


//Middlewares
app.use(express.json());
app.use("/api/users", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/compile",compileRoutes);

export default app;
