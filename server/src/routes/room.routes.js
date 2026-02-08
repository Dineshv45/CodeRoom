import express from "express";
import {
  getMyRooms,
  createRoom,
  joinRoom,
} from "../controllers/room.controllers.js";
import { authMiddleware } from "../middleware/auth.middlewear.js";

const router = express.Router();

/* All routes are protected */
router.get("/my", authMiddleware, getMyRooms);
router.post("/", authMiddleware, createRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);

export default router;
