import express from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart); // GET    /api/cart/
router.post("/add", addToCart); // POST   /api/cart/add
router.post("/sync", syncCart); // POST   /api/cart/sync
router.put("/update", updateQuantity); // PUT    /api/cart/update
router.delete("/remove/:productId", removeFromCart); // DELETE /api/cart/remove/:id?size=M&color=Black
router.delete("/clear", clearCart); // DELETE /api/cart/clear

export default router;
