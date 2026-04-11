import Room from "../models/Room.js";
import File from "../models/File.js";
import Workspace from "../models/Workspace.js";
import { v4 as uuidv4 } from "uuid";

/* ================= GET ALL FILES FOR ROOM ================= */
export const getFiles = async (req, res) => {
  const { roomId } = req.params;
  try {
    const files = await File.find({ roomId }).sort({ createdAt: 1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Error fetching files" });
  }
};

/* ================= CREATE NEW FILE ================= */
export const createFile = async (req, res) => {
  const { roomId } = req.params;
  const { fileName, fileType } = req.body;

  try {
    const file = await File.create({
      roomId,
      fileName,
      fileType,
    });

    // Notify room members
    req.app.get("io").to(roomId).emit("FILE_CREATED", file);

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: "Error creating file" });
  }
};

/* ================= DELETE FILE ================= */
export const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    const file = await File.findByIdAndDelete(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Notify room members
    req.app.get("io").to(file.roomId).emit("FILE_DELETED", fileId);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting file" });
  }
};



/* ================= GET MY ROOMS ================= */
export const getMyRooms = async (req, res) => {
  const userId = req.user.userId;
try{
  const rooms = await Room.find({
    members: userId,
  })
    .select("roomId roomName owner updatedAt")
    .sort({ updatedAt: -1 });

  res.json(rooms);
} catch (err) {
  res.status(500).json({ message: "Error fetching rooms" });
}
};

/* ================= CREATE ROOM ================= */
export const createRoom = async (req, res) => {
  const { roomName } = req.body;
  const userId = req.user.userId;

  if (!roomName) {
    return res.status(400).json({ message: "Room name is required" });
  }

  const roomId = uuidv4();
  const room = await Room.create({
    roomId,
    roomName,
    owner: userId,
    members: [userId],
  });

  // Create a default 'main.js' file for the room
  await File.create({
    roomId,
    fileName: "Main.java",
    fileType: "file",
  });

  res.status(201).json({
    roomId: room.roomId,
    roomName: room.roomName,
  });
};

/* ================= JOIN ROOM ================= */
export const joinRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.userId;

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const alreadyMember = room.members.some(
      (member) => member.toString() === userId
    );

    if (!alreadyMember) {
      room.members.push(userId);
      await room.save();
    }

    res.json({
      roomId: room.roomId,
      roomName: room.roomName,
      owner: room.owner,
    });
  }catch(err){
    res.status(500).json({ message: "Error joining room" });
  }
};

  /* ================= WORKSPACE (TABS) PERSISTENCE ================= */

  export const getWorkspace = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.userId;

    try {
      // 1. Get Shared Tabs from Room
      const room = await Room.findOne({ roomId }).populate({
        path: "files",
        options: { sort: { createdAt: 1 } }
      });

      if (!room) return res.status(404).json({ message: "Room not found" });

      // 2. Get Personal Focus from Workspace
      let workspace = await Workspace.findOne({ userId, roomId }).populate("activeFile");

      res.json({
        openFiles: room.files || [],
        activeFile: workspace?.activeFile || (room.files?.length > 0 ? room.files[0] : null)
      });
    } catch (err) {
      res.status(500).json({ message: "Error fetching workspace" });
    }
  };

  export const updateWorkspace = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.userId;
    const { activeFileId } = req.body;

    try {
      const workspace = await Workspace.findOneAndUpdate(
        { userId, roomId },
        { activeFile: activeFileId },
        { upsert: true, new: true }
      );

      res.json(workspace);
    } catch (err) {
      res.status(500).json({ message: "Error updating workspace" });
    }
  };
