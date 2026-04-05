import express from "express";
import { register, login, refreshAccessToken, googleAuthCallback, verifyEmail } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middleware/auth.middlewear.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";
import passport from "passport";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginRateLimiter, login);
router.post("/refresh", refreshAccessToken);

// Google OAuth routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleAuthCallback
);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

export default router;