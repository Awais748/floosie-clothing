import express from "express";
import {
  createProduct,
  getAllProducts,
  getHomeProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly, adminOrManager } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // ✅ default import

const router = express.Router();

// ─── Public Routes ───────────────────────────
router.get("/home", getHomeProducts);
router.get("/getallproduct", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, adminOrManager, createProduct);
router.put("/:id", protect, adminOrManager, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post(
  "/upload",
  protect,
  adminOrManager,
  upload.array("images", 4),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }
      const urls = req.files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      );
      res.status(200).json({ success: true, urls });
    } catch (error) {
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

export default router;
