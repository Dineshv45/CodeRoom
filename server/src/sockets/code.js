import * as Y from "yjs";
import File from "../models/File.js";

/**
 * Handles Yjs persistence using MongoDB for individual files.
 * Listens to document life-cycle events from y-socket.io
 * Document name (doc.name) is expected to be the fileId.
 */
export default function initYjsPersistence(ysocketio) {
  // 1. Initial Load from MongoDB
  ysocketio.on("document-loaded", async (doc) => {
    const fileId = doc.name;
    // Skip if not a valid ObjectId format (crude check)
    if (fileId.length !== 24) return;

    try {
      const dbDoc = await File.findById(fileId);
      if (dbDoc && dbDoc.binaryState) {
        // Apply the persisted binary state to the Yjs document
        Y.applyUpdate(doc, dbDoc.binaryState);
        console.log(`[Yjs] Loaded doc for file: ${fileId}`);
      }
    } catch (err) {
      console.error(`[Yjs] Error loading doc for ${fileId}:`, err);
    }
  });

  // 2. Periodic Saving to MongoDB
  ysocketio.on("document-update", async (doc, update) => {
    const fileId = doc.name;
    if (fileId.length !== 24) return;

    try {
      const binaryState = Buffer.from(Y.encodeStateAsUpdate(doc));
      const content = doc.getText("codemirror").toString();

      await File.findByIdAndUpdate(
        fileId,
        {
          binaryState,
          content,
        }
      );
    } catch (err) {
      console.error(`[Yjs] Error saving doc for ${fileId}:`, err);
    }
  });
}
