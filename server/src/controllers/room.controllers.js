import Room from "../models/Room.js";
import File from "../models/File.js";
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
      fileType: fileType || "file",
    });
    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: "Error creating file" });
  }
};

/* ================= DELETE FILE ================= */
export const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    await File.findByIdAndDelete(fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting file" });
  }
};

/* ================= GET MY ROOMS ================= */
export const getMyRooms = async (req, res) => {
  const userId = req.user.userId;

  const rooms = await Room.find({
    members: userId,
  })
    .select("roomId roomName updatedAt")
    .sort({ updatedAt: -1 });

  res.json(rooms);
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
  });
};
