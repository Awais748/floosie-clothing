import express from "express";
import {
  activateAccountController,
  createUserController,
  getUserProfile,
  resetPasswordController,
  updateUserController,
  updateUserProfile,
  userLoginController,
  placeOrder,
  getOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/userController.js";


import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", createUserController);
router.post("/login", userLoginController);
router.post("/forgot-password", updateUserController);
router.post("/reset-password", resetPasswordController);

router.get("/activate/:token", activateAccountController);

// Admin only
router.get("/all-orders", protect, adminOnly, getAllOrders);
router.put("/order-status", protect, adminOnly, updateOrderStatus);



router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post("/orders/place", protect, placeOrder);
router.get("/orders", protect, getOrders);

export default router;
