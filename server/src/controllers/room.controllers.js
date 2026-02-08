import Room from "../models/Room.js";
import {v4 as uuidv4} from "uuid";

export const getMyRooms = async (req, res) =>{
    const userId = req.user.userId;

    const rooms = await Room.find({
        members: userId,
    }).sort({updated: -1});

    res.json(rooms);
}


export const createRoom = async (req, res)=>{
  
    const {roomName} = req.body;
    const userId = req.user.userId;

      console.log(`${roomName} roomname`);
      console.log(`${userId} userId`);
 
    if(!roomName){
        return res.status(400).json({message:"Room name is required"});
    }

    const room = await Room.create({
        roomId: uuidv4(), 
        roomName,
        owner : userId, 
        members:[userId],
    });

    res.status(201).json(room);
};

export const joinRoom = async (req, res) =>{
    const {roomId} = req.params;
    const userId = req.user.userId;

    const room = await Room.findOne({roomId});

    if(!room){
        return res.status(404).json({message: "Room not found"});
    }

    if(room.members.includes(userId)){
        return res.json(room);
    }

    room.members.push(userId);
    await room.save();

    res.json(room);
}
