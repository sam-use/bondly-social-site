// components/Post.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bookmark, MessageCircle, Send, MoreVertical } from "lucide-react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axiosInstance";
import { Link } from "react-router-dom";

import "./Post.css";

const Post = ({ post, onDelete }) => {
// ... preserving logic ...
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const posts = useSelector((store) => store.post.posts);

  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    const action = liked ? "dislike" : "like";
    try {
      const res = await axiosInstance.get(`/posts/${post._id}/${action}`);

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPosts));
        setLiked(!liked);
        toast.success(res.data.message);
      }
    } catch (err) {
      console.error("Like/Dislike error:", err);
      toast.error("Failed to like post");
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await axiosInstance.post(`/posts/${post._id}/bookmark`);
      setBookmarked(res.data.type === "saved");
      toast.success(res.data.message);
    } catch (err) {
      console.error("Bookmark error:", err);
      toast.error("Failed to bookmark");
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/posts/${post._id}/comments`);
        if (res.data.success) {
          setComments(res.data.comments);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    if (openComments) fetchComments();
  }, [openComments, post._id]);

  useEffect(() => {
    if (user && user.bookmarks && Array.isArray(user.bookmarks)) {
      setBookmarked(user.bookmarks.includes(post._id));
    }
  }, [user, post._id]);

  const handleComment = async () => {
    try {
      const res = await axiosInstance.post(`/posts/${post._id}/addcomment`, { text });

      if (res.data.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setText("");
        toast.success("Comment added");
      }
    } catch (err) {
      console.error("Failed to add comment", err);
      toast.error("Error posting comment");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await axiosInstance.delete(`/posts/${post._id}/comment/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted");
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
      toast.error("Error deleting comment");
    }
  };

  const deletePostHandler = async () => {
    setDeleting(true);
    try {
      const res = await axiosInstance.delete(`/posts/${post._id}/delete`);

      if (res.data.success) {
        toast.success("Post deleted");
        onDelete(post._id);
      }
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error("Error deleting post");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="insta-post">
      <div className="insta-post-header">
        <Link to={`/user/${post.author?._id}/profile`} className="insta-post-user" style={{ textDecoration: 'none' }}>
          <Avatar style={{ width: 32, height: 32 }}>
            <AvatarImage src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.username}&background=random`} />
            <AvatarFallback>{post.author?.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <strong>{post.author?.username}</strong>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: 'var(--text-main)' }}>
              <MoreVertical size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {String(user._id) === String(post.author?._id) && (
              <DropdownMenuItem onClick={deleting ? undefined : deletePostHandler} style={{ color: 'var(--error-color)', fontWeight: 'bold' }} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete Post"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleBookmark} style={{ fontWeight: '500' }}>
              {bookmarked ? "Remove Bookmark" : "Add to Bookmarks"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <img src={post.image} alt="Post" className="insta-post-img" />

      <div>
        <div className="insta-post-actions">
          {liked ? (
            <FaHeart onClick={handleLike} style={{ color: "#ed4956", fontSize: "28px", cursor: "pointer" }} />
          ) : (
            <FaRegHeart onClick={handleLike} style={{ color: "var(--text-main)", fontSize: "28px", cursor: "pointer" }} />
          )}
          <MessageCircle onClick={() => setOpenComments(!openComments)} size={28} style={{ cursor: "pointer" }} />
          <Send size={28} style={{ cursor: "pointer" }} />
          <Bookmark
            onClick={handleBookmark}
            size={28}
            style={{
              marginLeft: "auto",
              color: bookmarked ? "var(--text-main)" : "var(--text-main)",
              fill: bookmarked ? "var(--text-main)" : "none",
              cursor: "pointer"
            }}
          />
        </div>

        <div className="insta-post-likes">{post.likes.length} likes</div>

        <div className="insta-post-caption">
          <strong>{post.author?.username}</strong> {post.caption}
        </div>

        {comments.length > 0 && !openComments && (
          <div
            onClick={() => setOpenComments(true)}
            className="insta-post-comments-toggle"
          >
            View all {comments.length} comments
          </div>
        )}

        {openComments && (
          <div className="insta-post-comments">
            {comments.map((c) => (
              <div key={c._id} className="comment-row">
                <span className="comment-row-text"><strong>{c.author.username}</strong> {c.text}</span>
                {user._id === c.author._id && (
                  <button onClick={() => deleteComment(c._id)} className="comment-row-delete">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {openComments && (
          <div className="insta-comment-box">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button
              onClick={handleComment}
              disabled={!text.trim()}
            >
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
