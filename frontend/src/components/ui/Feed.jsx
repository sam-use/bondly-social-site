import React, { useEffect } from "react";
import Posts from "./Posts";
import "./Auth.css";

const Feed = () => {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);
  return (
    <div className="feed-bg">
      <div className="feed-container">
        <Posts />
      </div>
    </div>
  );
};

export default Feed;
