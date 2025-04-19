import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { protect, isAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/admin", protect, isAdmin, (_, res) => {
  res.json({ msg: "Welcome Admin!" });
});
router.post("/reset-password", resetPassword);

router.post("/forgot-password", forgotPassword);
router.get("/profile", protect, (req, res) => {
  res.json({ msg: "User Profile Accessed" });
});

export default router;
