import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import mongoose from "mongoose";

// ─── GET /api/wishlist ─────────────────────────────────────────────────────────
// Returns populated favorites for logged-in user
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("favorites")
      .populate("favorites", "name price salePrice images category isNewArrival");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error("GET_FAVORITES_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── POST /api/wishlist/add ────────────────────────────────────────────────────
// Add a product to favorites
export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Avoid duplicates
    const alreadyFaved = user.favorites.some(
      (id) => id.toString() === productId
    );

    if (!alreadyFaved) {
      user.favorites.push(productId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: alreadyFaved ? "Already in favorites" : "Added to favorites",
      favorites: user.favorites.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("ADD_FAVORITE_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /api/wishlist/remove/:productId ────────────────────────────────────
// Remove a product from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Valid productId is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
      favorites: user.favorites.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("REMOVE_FAVORITE_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── POST /api/wishlist/sync ───────────────────────────────────────────────────
// Sync guest localStorage favorites into MongoDB after login
export const syncFavorites = async (req, res) => {
  try {
    const { guestFavorites } = req.body; // array of productId strings

    if (!Array.isArray(guestFavorites)) {
      return res.status(400).json({ success: false, message: "guestFavorites must be an array" });
    }

    // Filter valid ObjectIds only
    const validIds = guestFavorites.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // Verify products actually exist
    const existingProducts = await Product.find(
      { _id: { $in: validIds } },
      "_id"
    ).lean();
    const validProductIds = existingProducts.map((p) => p._id.toString());

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingFavIds = user.favorites.map((id) => id.toString());

    // Merge — add only those not already in DB
    const toAdd = validProductIds.filter((id) => !existingFavIds.includes(id));
    user.favorites.push(...toAdd);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Synced ${toAdd.length} favorites`,
      favorites: user.favorites.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("SYNC_FAVORITES_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
