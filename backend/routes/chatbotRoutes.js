import express from "express";
import { chatController } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/", chatController);

export default router;
