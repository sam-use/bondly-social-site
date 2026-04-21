import express from "express";
import isAuthenticated from "../middlewares/isAuthentication.js";
import { getAIInsights, getProfileAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/profile/:userId", isAuthenticated, getProfileAnalytics);
router.post("/ai-insights", isAuthenticated, getAIInsights);

export default router;
