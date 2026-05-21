import express from "express";
import { registerUser, loginUser, loginAdmin, getCurrentUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

// Protected routes
router.get("/me", verifyToken, getCurrentUser);

export default router;