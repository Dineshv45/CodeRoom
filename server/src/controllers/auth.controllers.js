import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";
import { getJwtConfig } from "../config/jwt.js";
import { validatePassword } from "../utils/passwordValidate.js";
import { sendVerificationMail } from "../utils/mail.js";
import passport from "passport";



/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (exists) {
      return res.status(409).json({
        message: "Email or username already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password:hashedPassword,
      authProvider:"email",
      isVerified:false,
      verificationToken:crypto.randomBytes(32).toString("hex"),
      verificationTokenExpiry:Date.now() + 24 * 60 * 60 * 1000,
    })

    await sendVerificationMail(email, user.verificationToken)

    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email address before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 60 * 1000, // 30 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/* ================= REFRESH TOKEN ================= */
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    const { refreshSecret } = getJwtConfig();
    jwt.verify(refreshToken, refreshSecret);

    const newAccessToken = generateAccessToken(user);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch {
    res.status(403).json({ message: "Expired refresh token" });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
/* ================= GOOGLE AUTH CALLBACK ================= */
export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONT_END_URL}/login?error=auth_failed`);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Redirect to frontend with tokens
    // Note: In production, consider using secure, http-only cookies instead
    // res.redirect(`${process.env.FRONT_END_URL}/auth-success?token=${accessToken}&refreshToken=${refreshToken}`);

    const isProduction = process.env.NODE_ENV === "production"; 
    
    res.cookie("accessToken", accessToken,{
      httpOnly:true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken,{
      httpOnly:true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONT_END_URL}/auth-success`);
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect(`${process.env.FRONT_END_URL}/login?error=server_error`);
  }
};



//     Email Verification

export const verifyEmail = async (req, res) =>{
  try {
    const {token} = req.params;

    if(!token){
      return res.status(400).json({message:"Token is required"})
    }

    const user = await User.findOne({
      verificationToken:token,
      verificationTokenExpiry:{$gt:Date.now()}
    })

    if(!user){
      return res.status(400).json({message:"Invalid or expired verification token"})
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.redirect(`${process.env.FRONT_END_URL}/verify-success`);
  } catch (error) {
    console.error("Email verification error:", error);
    res.redirect(`${process.env.FRONT_END_URL}/verify-error?message=${encodeURIComponent(error.message)}`);
  }
}