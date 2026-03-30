import Code from "../models/Code.js";

const roomQueues = new Map(); // store the operations to be done on rooms
const roomProcessing = new Map(); //store true or false for rooms
const roomOpHistory = new Map();

//  Delta Rebasing (Transforming)
function transformIncomingOps(historyOps, newOps) {
  return newOps.map((op) => {
    let newFrom = op.from;
    let newTo = op.to;

    historyOps.forEach((prev) => {
      const insertLen = prev.text.length;
      const deleteLen = prev.to - prev.from;

      // insert before

      if (prev.from < newFrom) {
        newFrom += insertLen - deleteLen;
        newTo += insertLen - deleteLen;
      }

      // insert at same index shift right
      else if (prev.from === op.from && insertLen > 0) {
        newFrom += insertLen;
        newTo += insertLen;
      }
    });

    return {
      ...op,
      from: newFrom,
      to: newTo,
    };
  });
}

export default function codeSocket(io, socket) {
  socket.on("CODE_SYNC", async ({ roomId }) => {
    let doc = await Code.findOne({ roomId });

    if (!doc) {
      doc = await Code.create({
        roomId,
        content: "",
      });
    }

    socket.emit("CODE_SYNC", {
      code: doc.content,
      version: doc.version,
    });
  });

  socket.on("CODE_CHANGE", ({ roomId, ops }) => {
    if (!roomQueues.has(roomId)) {
      roomQueues.set(roomId, []);
    }

    roomQueues.get(roomId).push({
      socket,
      ops,
    });

    processQueue(roomId);

    // const doc = await Code.findOne({ roomId });
    // if (!doc) return;

    // //  version mismatch → force resync
    // if (version !== doc.version) {
    //   socket.emit("RESYNC_REQUIRED");
    //   return;
    // }

    // let content = doc.content;

    // ops.forEach(op => {
    //   content =
    //     content.slice(0, op.from) +
    //     op.text +
    //     content.slice(op.to);
    // });

    // doc.content = content;
    // doc.version += 1;

    // await doc.save();

    // socket.to(roomId).emit("CODE_CHANGE", {
    //   ops,
    //   version: doc.version,
    // });

    // queue for edits
  });
}

async function processQueue(roomId) {
  if (roomProcessing.get(roomId)) return;

  roomProcessing.set(roomId, true);

  const queue = roomQueues.get(roomId);

  if (!roomOpHistory.has(roomId)) {
    roomOpHistory.set(roomId, []);
  }

  const history = roomOpHistory.get(roomId);

  while (queue.length > 0) {
    const { socket, ops } = queue.shift();

    const doc = await Code.findOne({ roomId });
    if (!doc) continue;

    let content = doc.content;

    const transformed = transformIncomingOps(history, ops);

    transformed.forEach((op) => {
      content = content.slice(0, op.from) + op.text + content.slice(op.to);
    });

    doc.content = content;
    doc.version += 1;

    await doc.save();

    history.push(...transformed); // ⭐ persistent history

    socket.to(roomId).emit("CODE_CHANGE", {
      ops: transformed,
      version: doc.version,
    });
  }

  roomProcessing.set(roomId, false);
}
