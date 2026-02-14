import Room from "../models/Room.js";
import { v4 as uuidv4 } from "uuid";

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

  const room = await Room.create({
    roomId: uuidv4(),
    roomName,
    owner: userId,
    members: [userId], // important
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
