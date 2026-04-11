import Timeline from "../models/Timelines.js";
import File from "../models/File.js";
import Room from "../models/Room.js";
import User from "../models/User.js"; // Import User for populate()
import mongoose from "mongoose";
import * as Y from "yjs";

export const createTimeline = async (req, res) => {
    try {
        const { roomId, label, files } = req.body;
        // 1. Ensure userId is a proper ObjectId for future population consistency
        const userId = new mongoose.Types.ObjectId(req.user.userId);

        if (!roomId || !userId || !label) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 1. Verify room exists
        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: "Room not found" });

        // 2. Capture files correctly
        let query = { roomId };
        if (files && Array.isArray(files) && files.length > 0) {
            query._id = { $in: files };
        }

        const currentFiles = await File.find(query);

        const records = currentFiles.map(file => ({
            fileId: file._id,
            fileName: file.fileName,
            fileType: file.fileType,
            content: file.binaryState || Buffer.from(file.content || "")
        }));

        // 3. Create the Timeline record
        const timeline = await Timeline.create({
            roomId,
            userId,
            label,
            records
        });

        // 4. Reset modified status for snapshotted files
        await File.updateMany(query, { modified: false });

        res.status(201).json({
            success: true,
            message: "Record created successfully",
            timeline
        });
    } catch (err) {
        console.error("Error creating timeline:", err);
        res.status(500).json({ message: "Error Creating Record", error: err.message });
    }
};


export const getTimeline = async (req, res) => {


    try {
        const { roomId } = req.query;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                message: "Room ID is required",
            });
        }

        // 1. Fetch metadata for all records (sorted by most recent first)
        const timelines = await Timeline.find({ roomId })
            .sort({ createdAt: -1 })
            .select("-records.content")
            .populate("userId", "username")
            .lean();

        // 2. Fetch full content for ONLY the latest one (to enable diffing in UI)
        if (timelines.length > 0) {
            const latestFull = await Timeline.findById(timelines[0]._id).lean();
            if (latestFull && latestFull.records) {
                // Convert Buffers to Strings for easy comparison on frontend
                latestFull.records = latestFull.records.map(record => ({
                    ...record,
                    content: record.content ? record.content.toString() : ""
                }));
                // Replace the first element with the one containing content
                timelines[0] = latestFull;
            }
        }

        res.status(200).json({
            success: true,
            count: timelines.length,
            timeline: timelines,
        });
    } catch (err) {
        console.error("Error fetching timeline:", err);
        res.status(500).json({
            success: false,
            message: "Error in Fetching timeline",
            error: err.message
        });
    }
};

export const revertRecordById = async (req, res) => {
    const ysocketio = req.app.get("ysocketio");
    try {
        const { recordId } = req.body;
        if (!recordId) {
            return res.status(400).json({ message: "Record ID is required" });
        }

        const record = await Timeline.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        const roomId = record.roomId;
        const io = req.app.get("io");
        const deleteExtraFiles = req.body.deleteExtraFiles;

        // 1. Delete files that are NOT in the record (only if user requested it)
        if (deleteExtraFiles) {
            const snapshotFileNames = record.records.map(f => f.fileName);
            await File.deleteMany({
                roomId,
                fileName: { $nin: snapshotFileNames }
            });
        }

        // 2. Process all files in the record
        for (const fileData of record.records) {
            let targetFile = await File.findOne({
                roomId,
                fileName: fileData.fileName
            });

            if (targetFile) {
                // Update existing DB file
                targetFile.content = fileData.content.toString();
                targetFile.binaryState = fileData.content;
                await targetFile.save();
            } else {
                // Recreate missing DB file
                targetFile = await File.create({
                    roomId,
                    fileName: fileData.fileName,
                    fileType: fileData.fileType,
                    content: fileData.content.toString(),
                    binaryState: fileData.content
                });
            }

            // LIVE YJS SYNC PART
            if (ysocketio?.documents?.has(targetFile._id.toString())) {
                const ydoc = ysocketio.documents.get(targetFile._id.toString());
                const ytext = ydoc.getText("codemirror");

                // 1. Load the binary snapshot into a temporary document
                const snapshotDoc = new Y.Doc();
                const uint8 = new Uint8Array(fileData.content);
                Y.applyUpdate(snapshotDoc, uint8);

                // 2. Extract the text you want to revert to
                const snapshotText = snapshotDoc.getText("codemirror").toString();

                // 3. Force the live document to match that text
                // We must DELETE the existing text first, then INSERT the snapshot text.
                // This creates a NEW operation that overrides the recent history for everyone.
                ydoc.transact(() => {
                    const currentLength = ytext.length;
                    if (currentLength > 0) {
                        ytext.delete(0, currentLength);
                    }
                    ytext.insert(0, snapshotText);
                });

                console.log(`[Yjs Sync] Successfully pushed snapshot to live doc: ${targetFile.fileName}`);
            }

        }

        // 3. Notify all users in the room to refresh
        if (io) {
            io.to(roomId).emit("ROOM_REFRESH", { message: "Room reverted to a previous state" });
        }

        res.status(200).json({
            success: true,
            message: `Room successfully reverted to "${record.label}"`
        });
    } catch (err) {
        console.error("Revert error:", err);
        res.status(500).json({ message: "Error in Reverting Record", error: err.message });
    }
};

export const revertFileFromRecord = async (req, res) => {
    try {
        const { recordId, fileId } = req.params;
        if (!recordId || !fileId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const record = await Timeline.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        const file = record.records.find(file => file._id.toString() === fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json(file);
    } catch (err) {
        res.status(500).json({ message: "Error in Reverting File" })
    }
}