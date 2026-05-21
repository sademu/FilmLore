import express from "express";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addComment,
  deleteComment,
  toggleReaction,
  checkUserReaction
} from "../controllers/blogController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Blog posts
router.get("/blogs", getAllBlogs);
router.get("/blog/:blogId", getBlogById);
router.post("/blog", verifyToken, createBlog);
router.put("/blog/:blogId", verifyToken, updateBlog);
router.delete("/blog/:blogId", verifyToken, deleteBlog);

// Comments
router.post("/blog/:blogId/comment", verifyToken, addComment);
router.delete("/blog/comment/:commentId", verifyToken, deleteComment);

// Reactions
router.post("/blog/:blogId/reaction", verifyToken, toggleReaction);
router.get("/blog/:blogId/reaction/check", verifyToken, checkUserReaction);

export default router;