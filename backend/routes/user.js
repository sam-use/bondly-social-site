import express from "express";
import upload from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/isAuthentication.js";
import {
  register, login, logout, getUserProfile,
  getSuggestUsers, followUnfollow, editProfile, deleteUser,
  getUsersByIds, getAllUsers
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/suggested", isAuthenticated, getSuggestUsers);
router.post("/profile/edit", isAuthenticated, upload.single("avatar"), editProfile);

router.post("/followunfollow/:id", isAuthenticated, followUnfollow);

router.get("/:id/profile", isAuthenticated, getUserProfile);

router.delete("/delete", isAuthenticated, deleteUser);

router.post("/list", isAuthenticated, getUsersByIds);
router.get("/all", isAuthenticated, getAllUsers);

export default router;
