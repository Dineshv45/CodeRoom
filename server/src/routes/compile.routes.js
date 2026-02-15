import express from "express";
import { compileCode } from "../controllers/compile.controller.js";
import {authMiddleware} from "../middleware/auth.middlewear.js";

const router = express.Router();

router.post("/", authMiddleware, compileCode);

export default router;
