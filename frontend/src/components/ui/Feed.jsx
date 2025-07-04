import React from "react";
import Posts from "./Posts";
import "./Auth.css";

const Feed = () => {
  return (
    <div className="feed-bg">
      <div className="feed-container">
        <Posts />
      </div>
    </div>
  );
};

export default Feed;
