import express from "express";
import {
  getEpisodeReviews,
  createEpisodeReview,
  updateEpisodeReview,
  deleteEpisodeReview
} from "../controllers/EpisodereviewController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Get all reviews for an episode
router.get("/episode/:episodeId/reviews", getEpisodeReviews);

// Create episode review (protected)
router.post("/episode/:episodeId/reviews", verifyToken, createEpisodeReview);

// Update episode review (protected)
router.put("/episode/review/:reviewId", verifyToken, updateEpisodeReview);

// Delete episode review (protected)
router.delete("/episode/review/:reviewId", verifyToken, deleteEpisodeReview);

export default router;
