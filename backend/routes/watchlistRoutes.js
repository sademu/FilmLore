import express from "express";
import {
  getUserWatchlists,
  getWatchlistItems,
  addToWatchlist,
  removeFromWatchlist,
  toggleCompleted,
  createWatchlist,
  deleteWatchlist
} from "../controllers/watchlistController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// All routes are protected (require login)

// Get all watchlists for user
router.get("/watchlists", verifyToken, getUserWatchlists);

// Get items in a specific watchlist
router.get("/watchlist/:watchlistName", verifyToken, getWatchlistItems);

// Create new watchlist
router.post("/watchlist", verifyToken, createWatchlist);

// Add item to watchlist
router.post("/watchlist/add", verifyToken, addToWatchlist);

// Remove item from watchlist
router.delete("/watchlist/item/:watchlistId", verifyToken, removeFromWatchlist);

// Toggle completed status
router.patch("/watchlist/toggle/:watchlistId", verifyToken, toggleCompleted);

// Delete entire watchlist
router.delete("/watchlist/:watchlistName", verifyToken, deleteWatchlist);

export default router;