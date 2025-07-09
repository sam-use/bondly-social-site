import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MessageCircle, Send, Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import "./PostPage.css"; // You can style it or inline style like your Post.jsx

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [openComments, setOpenComments] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`https://bondly-social-site.onrender.com/api/v1/posts/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setPost(res.data.post);
        setLiked(res.data.post.likes.includes(user._id));
      }
    } catch {
      toast.error("Post not found");
      navigate("/");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`https://bondly-social-site.onrender.com/api/v1/posts/${id}/comments`, {
        withCredentials: true,
      });
      if (res.data.success) setComments(res.data.comments);
    } catch {
      toast.error("Failed to load comments");
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id, user._id, navigate]);

  useEffect(() => {
    if (openComments) fetchComments();
  }, [openComments, id]);

  const handleLike = async () => {
    const action = liked ? "dislike" : "like";
    try {
      const res = await axios.get(`https://bondly-social-site.onrender.com/api/v1/posts/${id}/${action}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setLiked(!liked);
        setPost((prev) => ({
          ...prev,
          likes: liked
            ? prev.likes.filter((uid) => uid !== user._id)
            : [...prev.likes, user._id],
        }));
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Like action failed");
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await axios.post(`https://bondly-social-site.onrender.com/api/v1/posts/${id}/bookmark`, {}, {
        withCredentials: true,
      });
      setBookmarked(res.data.type === "saved");
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to bookmark");
    }
  };

  const handleComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(`https://bondly-social-site.onrender.com/api/v1/posts/${id}/addcomment`, {
        text,
      }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        setComments((prev) => [res.data.comment, ...prev]);
        setText("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Error posting comment");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`https://bondly-social-site.onrender.com/api/v1/posts/${id}/comment/${commentId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted");
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (!post) return <p className="post-loading">Loading post...</p>;

  return (
    <div className="postpage-container">
      {/* Spacer for mobile nav bar */}
      <div className="postpage-mobile-spacer" />
      <img src={post.image} alt="Post" className="postpage-image" />

      <div className="postpage-info">
        <div className="postpage-user" style={{ cursor: "pointer" }} onClick={() => navigate(`/user/${post.author?._id}/profile`)}>
          <Avatar className="postpage-avatar">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>{post.author?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="username">{post.author?.username}</span>
        </div>

        <div className="post-actions">
          {liked ? (
            <FaHeart onClick={handleLike} style={{ color: "red", cursor: "pointer" }} />
          ) : (
            <FaRegHeart onClick={handleLike} style={{ cursor: "pointer" }} />
          )}
          <MessageCircle onClick={() => setOpenComments(!openComments)} style={{ cursor: "pointer" }} />
          <Send style={{ cursor: "pointer" }} />
          <Bookmark
            onClick={handleBookmark}
            style={{
              marginLeft: "auto",
              cursor: "pointer",
              color: bookmarked ? "#2563eb" : "#6b7280",
            }}
          />
        </div>

        <p className="likes-count"><strong>{post.likes.length}</strong> likes</p>
        <p className="caption"><strong>{post.author?.username}</strong> {post.caption}</p>

        <p
          onClick={() => setOpenComments(!openComments)}
          style={{ cursor: "pointer", color: "#3b82f6", marginTop: 8 }}
        >
          {openComments ? "Hide comments" : "View all comments"}
        </p>

        {openComments && (
          <div className="comments-section">
            {comments.length === 0 ? (
              <p>No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="comment-item">
                  <span><strong>{c.author.username}:</strong> {c.text}</span>
                  {user._id === c.author._id && (
                    <button onClick={() => deleteComment(c._id)} className="comment-delete-btn">Delete</button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="add-comment">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
          />
          <button onClick={handleComment} className="comment-post-btn">Post</button>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
