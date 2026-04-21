import express from "express";
import isAuthenticated from "../middlewares/isAuthentication.js";
import upload from "../middlewares/multer.js";
import { transformImage, uploadTempImage } from "../controllers/image.controller.js";

const router = express.Router();

router.post("/upload-temp", isAuthenticated, upload.single("image"), uploadTempImage);
router.post("/transform", isAuthenticated, transformImage);

export default router;
