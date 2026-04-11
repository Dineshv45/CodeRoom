import express from "express";
import {
  getMyRooms,
  createRoom,
  joinRoom,
  getFiles,
  createFile,
  deleteFile,
  getWorkspace,
  updateWorkspace,
  leaveRoom,
  deleteRoom,
  removeUser,
  sendInviteEmail,
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

/* Workspace (Tabs) */
router.get("/:roomId/workspace", authMiddleware, getWorkspace);
router.patch("/:roomId/workspace", authMiddleware, updateWorkspace);

/* Room Management */
router.post("/:roomId/leave", authMiddleware, leaveRoom);
router.delete("/:roomId", authMiddleware, deleteRoom);
router.delete("/:roomId/remove/:userId", authMiddleware, removeUser);
router.post("/:roomId/invite", authMiddleware, sendInviteEmail);

export default router;
