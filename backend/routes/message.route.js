
import express from "express";

import isAuthenticated from "../middlewares/isAuthentication.js";
import upload from "../middlewares/multer.js";
import { sendMessage, getMessage } from "../controllers/message.controller.js";

const router = express.Router();
router.route('/send/:id').post(isAuthenticated,sendMessage)
router.route('/get/:id').get(isAuthenticated,getMessage); // Assuming you want to use the same controller for getting messages



export default router;



