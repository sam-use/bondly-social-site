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

  if (loading) return <p className="text-center">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (gridMode) {
    return (
      <>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
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
                className="explore-post"
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
        <p className="text-center text-gray-500">No posts found.</p>
      ) : (
        posts.map((post) => (
          <Post key={post._id} post={post} onDelete={handlePostDelete} />
        ))
      )}
    </>
  );
};

export default Posts;
