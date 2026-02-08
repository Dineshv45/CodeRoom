import express from "express";
import {register, login, refreshAccessToken} from "../controllers/auth.controllers.js";
import {authMiddleware} from "../middleware/auth.middlewear.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post('refresh', refreshAccessToken)

router.get("/me", authMiddleware,(req, res)=>{
    res.json({
        message:"You are authenticated",
        user: req.user,
    });
});

export default router;