import express from "express";
import isAuthenticated from "../middlewares/isAuthentication.js";
import upload from "../middlewares/multer.js";
import { generateCaption, generateChatReply } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate-caption", isAuthenticated, upload.single("image"), generateCaption);
router.post("/chat-reply", isAuthenticated, generateChatReply);

export default router;
