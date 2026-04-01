import express from "express";
import {
  getMyRooms,
  createRoom,
  joinRoom,
  getFiles,
  createFile,
  deleteFile,
} from "../controllers/room.controllers.js";
import { authMiddleware } from "../middleware/auth.middlewear.js";

const router = express.Router();

/* All routes are protected */
router.get("/my", authMiddleware, getMyRooms);
router.post("/", authMiddleware, createRoom);
router.post("/:roomId/join", authMiddleware, joinRoom);

/* File Management */
router.get("/:roomId/files", authMiddleware, getFiles);
router.post("/:roomId/files", authMiddleware, createFile);
router.delete("/files/:fileId", authMiddleware, deleteFile);

export default router;
