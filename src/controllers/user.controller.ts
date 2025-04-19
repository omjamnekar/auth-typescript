import { Request, Response } from "express";
import { User } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
};
