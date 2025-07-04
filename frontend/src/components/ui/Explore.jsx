import React from "react";
import Posts from "./Posts";
import "./Explore.css";

const Explore = () => {
  return (
    <div className="explore-bg">
      <h1 className="explore-title">Explore</h1>
      <div className="explore-grid">
        <Posts gridMode />
      </div>
    </div>
  );
};

export default Explore; 