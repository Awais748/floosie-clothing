import express from "express";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  syncFavorites,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wishlist routes are protected (logged-in users only)
router.get("/", protect, getFavorites);
router.post("/add", protect, addFavorite);
router.delete("/remove/:productId", protect, removeFavorite);
router.post("/sync", protect, syncFavorites);

export default router;
