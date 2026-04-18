import * as Y from "yjs";
import File from "../models/File.js";

// 1. Storage for pending saves
let saveTimeouts = new Map();
let lastSavedAt = new Map();

/**
 * Handles Yjs persistence using MongoDB for individual files.
 * Listens to document life-cycle events from y-socket.io
 * Document name (doc.name) is expected to be the fileId.
 */
export default function initYjsPersistence(ysocketio) {
  // 1. Initial Load from MongoDB
  ysocketio.on("document-loaded", async (doc) => {
    const fileId = doc.name;
    if (fileId.length !== 24) return;

    try {
      const dbDoc = await File.findById(fileId).lean();
      const rawBuffer = dbDoc?.binaryState?.buffer || dbDoc?.binaryState;
      const byteLength = rawBuffer?.length || 0;

      if (byteLength > 2) {
        try {
          // IMPORTANT: Buffer (Node) to Uint8Array (Yjs) conversion
          const uint8 = new Uint8Array(rawBuffer);
          Y.applyUpdate(doc, uint8);
          console.log(`[Yjs] Initial Load: Success for ${fileId} (${uint8.length} bytes)`);
        } catch (updateErr) {
          console.error(`[Yjs] CRITICAL: Corrupted binary data for ${fileId}. Skipping load to prevent crash.`, updateErr);
          // If corrupted, we don't apply the update, effectively starting fresh or letting clients sync
        }
      } else {
        console.log(`[Yjs] Initial Load: No valid data found for ${fileId}`);
      }
    } catch (err) {
      console.error(`[Yjs] Error loading doc for ${fileId}:`, err);
    }
  });




  // 2. Immediate Saving to MongoDB (Testing logic)
  ysocketio.on("document-update", async (doc, update) => {
    const fileId = doc.name;
    if (fileId.length !== 24) return;

    const now = Date.now();
    const lastSaved = lastSavedAt.get(fileId) || 0;
    
    if( now - lastSaved >= 1000) {
      try {
        const binaryState = Buffer.from(Y.encodeStateAsUpdate(doc));
        const content = doc.getText("codemirror").toString();
  
        await File.findByIdAndUpdate(fileId, {
          binaryState,
          content,
          modified: true,
        });
  
        console.log(`[Yjs] Immediate Save Completed: ${fileId} (Content Length: ${content.length})`);
      } catch (err) {
        console.error(`[Yjs] Error during immediate save for ${fileId}:`, err);
      }
    }


    if(saveTimeouts.has(fileId)){
      clearTimeout(saveTimeouts.get(fileId));
    }

    const timeout = setTimeout(async () => {
      try{
          const binaryState = Buffer.from(Y.encodeStateAsUpdate(doc));
          const content = doc.getText("codemirror").toString();

          await File.findByIdAndUpdate(fileId, {
            binaryState, 
            content,
            modified: true,
          });

          console.log(`[Yjs] Debounced Save Completed: ${fileId}`);
        }catch(err){
          console.error(`[Yjs] Error during debounced save for ${fileId}:`, err);
        }
    }, 3000);

    saveTimeouts.set(fileId, timeout);
    lastSavedAt.set(fileId, now);

  });
}
