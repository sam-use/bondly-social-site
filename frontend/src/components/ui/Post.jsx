// components/Post.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import "./Auth.css";
import { Link } from "react-router-dom";

const Post = ({ post, onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const posts = useSelector((store) => store.post.posts);

  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [openComments, setOpenComments] = useState(false);

  const handleLike = async () => {
    const action = liked ? "dislike" : "like";
    try {
      const res = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/${action}`, {
        withCredentials: true,
      });

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
      const res = await axios.post(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/bookmark`, {}, {
        withCredentials: true,
      });
      setBookmarked(res.data.type === "saved");
      toast.success(res.data.message);
    } catch (err) {
      console.error("Bookmark error:", err);
      toast.error("Failed to bookmark");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/comments`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    if (openComments) fetchComments();
  }, [openComments]);

  useEffect(() => {
    if (user && user.bookmarks && Array.isArray(user.bookmarks)) {
      setBookmarked(user.bookmarks.includes(post._id));
    }
  }, [user, post._id]);

  const handleComment = async () => {
    try {
      const res = await axios.post(
        `https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/addcomment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

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
      const res = await axios.delete(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/comment/${commentId}`, {
        withCredentials: true,
      });
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
    try {
      const res = await axios.delete(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/posts/${post._id}/delete`, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Post deleted");
        onDelete(post._id);
      }
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error("Error deleting post");
    }
  };

  return (
    <div className="insta-post">
      <div className="insta-post-header">
        <div className="insta-post-user">
          <Link to={`/user/${post.author?._id}/profile`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Avatar>
              <AvatarImage src={post.author?.profilePicture || "https://via.placeholder.com/150"} />
              <AvatarFallback>{post.author?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div style={{ marginLeft: 8 }}>
              <strong>{post.author?.username}</strong>
              {String(user._id) === String(post.author?._id) && <Badge>Author</Badge>}
            </div>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}>
              <MoreVertical />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {String(user._id) === String(post.author?._id) && (
              <DropdownMenuItem onClick={deletePostHandler} style={{ color: '#e53935', fontWeight: 'bold' }}>Delete</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleBookmark} style={{ color: '#2563eb', fontWeight: 'bold' }}>
              {bookmarked ? "Remove Bookmark" : "Bookmark"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <img src={post.image} alt="Post" className="insta-post-img" />
      <div>
        <div className="insta-post-actions">
          {liked ? (
            <FaHeart onClick={handleLike} style={{ color: "#f87171", fontSize: 24, cursor: "pointer" }} />
          ) : (
            <FaRegHeart onClick={handleLike} style={{ color: "#6b7280", fontSize: 24, cursor: "pointer" }} />
          )}
          <MessageCircle onClick={() => setOpenComments(!openComments)} style={{ cursor: "pointer" }} />
          <Send style={{ cursor: "pointer" }} />
          <Bookmark
            onClick={handleBookmark}
            style={{
              marginLeft: "auto",
              color: bookmarked ? "#2563eb" : "#6b7280",
              cursor: "pointer",
            }}
          />
        </div>
        <p className="insta-post-likes">{post.likes.length} likes</p>
        <p className="insta-post-caption"><strong>{post.author?.username}</strong> {post.caption}</p>
        <p
          onClick={() => setOpenComments(!openComments)}
          className="insta-post-comments-toggle"
        >
          {openComments ? "Hide comments" : "View all comments"}
        </p>
        {openComments && (
          <>
            <div className="insta-post-comments">
              {comments.map((c) => (
                <div key={c._id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span><strong>{c.author.username}:</strong> {c.text}</span>
                  {user._id === c.author._id && (
                    <button onClick={() => deleteComment(c._id)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="insta-comment-box" style={{ display: 'flex', marginTop: 8, gap: 8 }}>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
              />
              <button
                onClick={handleComment}
                disabled={!text.trim()}
                style={{ color: '#3b82f6', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', opacity: text.trim() ? 1 : 0.5 }}
              >
                Post
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
