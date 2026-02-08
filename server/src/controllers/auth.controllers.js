import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";
import { getJwtConfig } from "../config/jwt.js";
import {validatePassword} from "../utils/passwordValidate.js";



/* ================= REGISTER ================= */
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const passwordError = validatePassword(password);
  if(passwordError){
    return res.status(400).json({message : passwordError});
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

  await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(201).json({ message: "User Registered Successfully" });
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  let { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  // identifier = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
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

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Expired refresh token" });
  }
};
