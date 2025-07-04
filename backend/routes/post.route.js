import express from "express";
import isAuthenticated from "../middlewares/isAuthentication.js";
import upload from "../middlewares/multer.js";

import {
  addnewPost, getallPost, getUserPost, likePost,
  dislikePost, addcomment, getCommentofpost, deletePost,
  bookmarkPost, deleteComment, getSinglePost,
  getExplorePosts
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/explore", getExplorePosts);

router.post("/addpost", isAuthenticated, upload.single("image"), addnewPost);
router.get("/", isAuthenticated, getallPost);
router.get("/userpost/:id", isAuthenticated, getUserPost);
router.get("/:id", isAuthenticated, getSinglePost);

router.get("/:id/like", isAuthenticated, likePost);
router.get("/:id/dislike", isAuthenticated, dislikePost);
router.post("/:id/bookmark", isAuthenticated, bookmarkPost);

router.post("/:id/addcomment", isAuthenticated, addcomment);
router.get("/:id/comments", isAuthenticated, getCommentofpost);
router.delete("/:postId/comment/:commentId", isAuthenticated, deleteComment);

router.delete("/:id/delete", isAuthenticated, deletePost);

export default router;
