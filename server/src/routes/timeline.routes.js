import express from "express";
import {createTimeline, getTimeline, revertRecordById, revertFileFromRecord} from "../controllers/timeline.controller.js";
import { authMiddleware } from "../middleware/auth.middlewear.js";

const router = express.Router();

router.post('/create', authMiddleware, createTimeline);
router.get('/getTimeline/', authMiddleware, getTimeline);
router.post('/revert', authMiddleware, revertRecordById); 
router.get('/revert-file/:recordId/:fileId', authMiddleware, revertFileFromRecord);

export default router;