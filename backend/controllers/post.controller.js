import sharp from 'sharp';
import cloudinary from '../utils/cloudinary.js';
import User from "../models/user.model.js";
import { Post } from '../models/post.model.js';
import { Comment } from "../models/comment.model.js";

// Add New Post
export const addnewPost = async (req, res) => { 
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({ message: "Image is required", success: false });
    }

    const optimizedImageBuffer = await sharp(image.buffer)
      .resize(800, 800, { fit: sharp.fit.cover, position: 'center' })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption: caption || "",
      image: cloudResponse.secure_url,
      author: authorId
    });

    const user = await User.findById(authorId).select('-password');
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate("author", "-password");

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post
    });

  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Get All Posts
export const getallPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Get User Posts
export const getUserPost = async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ author: userId })
      .populate("author", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User posts fetched successfully",
      success: true,
      posts
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Like Post
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    const post = await Post.findById(postId).populate("author", "-password");
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $addToSet: { likes: userId } });
    await post.save();

    return res.status(200).json({ message: 'Post liked', success: true });

  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Dislike Post
export const dislikePost = async (req, res) => {
  try {
    const userId = req.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    await post.updateOne({ $pull: { likes: userId } });
    await post.save();

    return res.status(200).json({ message: 'Post disliked', success: true });

  } catch (error) {
    console.error("Error disliking post:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Add Comment
export const addcomment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentAuthor = req.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required', success: false });
    }

    const comment = await Comment.create({
      text,
      author: commentAuthor,
      post: postId
    });

    await comment.populate({
      path: 'author',
      select: 'username profilePicture'
    });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found', success: false });
    }

    if (!Array.isArray(post.comment)) {
      post.comment = [];
    }

    post.comment.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment added",
      comment,
      success: true
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.id; // ✅ Make sure you're using req.id from your auth middleware

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own comment" });
    }

    // Delete comment from DB
    await Comment.findByIdAndDelete(commentId);

    // Ensure post.comments exists and is an array
    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    // Remove comment reference from post
    post.comments = post.comments.filter((c) => c.toString() !== commentId);
    await post.save();

    return res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




// Get Comments of a Post
export const getCommentofpost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    if (!comments.length) {
      return res.status(404).json({ message: "No comments", success: false });
    }

    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments
    });

  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
// Get Single Post by ID
export const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("author", "username profilePicture")
      .populate({
        path: "comment",
        populate: {
          path: "author",
          select: "username profilePicture"
        }
      });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post,
    });

  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found', success: false });

    if (post.author.toString() !== authorId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post', success: false });
    }

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(authorId);
    user.posts = user.posts.filter(id => id.toString() !== postId);
    await user.save();

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({ message: "Post deleted", success: true });

  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


// Bookmark Post
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found', success: false });

    const user = await User.findById(authorId);

    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmarks', success: true });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({ type: 'saved', message: 'Post added to bookmarks', success: true });
    }

  } catch (error) {
    console.error("Error bookmarking post:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Public Explore Posts
export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "-password")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Explore posts fetched successfully",
      success: true,
      posts
    });
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
