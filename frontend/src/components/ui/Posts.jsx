import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Post from "./Post";
import { fetchAllPosts, fetchExplorePosts, setPosts } from "@/redux/postSlice";
import { useNavigate } from "react-router-dom";

const Posts = ({ gridMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error } = useSelector((store) => store.post);

  useEffect(() => {
    if (gridMode) {
      dispatch(fetchExplorePosts());
    } else {
      dispatch(fetchAllPosts());
    }
  }, [dispatch, gridMode]);

  const handlePostDelete = (postId) => {
    dispatch(setPosts(posts.filter((post) => post._id !== postId)));
  };

  if (loading) return <p style={{textAlign: 'center', padding: '40px 0'}}>Loading posts...</p>;
  if (error) return <p style={{textAlign: 'center', padding: '40px 0', color: 'var(--error-color)'}}>{error}</p>;

  if (gridMode) {
    return (
      <>
        {posts.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1'}}>No posts found.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="explore-post"
              onClick={() => navigate(`/post/${post._id}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={post.image}
                alt={post.caption}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: 'block' }}
              />
            </div>
          ))
        )}
      </>
    );
  }

  return (
    <>
      {posts.length === 0 ? (
        <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No posts found.</p>
      ) : (
        posts.map((post) => (
          <Post key={post._id} post={post} onDelete={handlePostDelete} />
        ))
      )}
    </>
  );
};

export default Posts;
