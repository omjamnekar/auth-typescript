import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ msg: "User already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ msg: "User registered", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ msg: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ msg: "Invalid credentials" });
      return;
    }
    console.log(JWT_SECRET);

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
    return;
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ msg: "User not found" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await user.save();

  // Normally you'd email this token — return it directly for now:
  res.json({ msg: "Reset token generated", token });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({ msg: "Invalid or expired token" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ msg: "Password has been reset successfully" });
};
