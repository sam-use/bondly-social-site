import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);

  return (
    <div className="main-layout">
      <div className="sidebar">
        <Sidebar onCreatePostClick={() => setIsPostOpen(true)} />
      </div>
      <div className="feed">
        <Outlet />
      </div>
      <div className="right-sidebar">
        <RightSidebar />
      </div>

      {/* ✅ Modal Rendered Globally */}
      {isPostOpen && <CreatePost open={isPostOpen} setOpen={setIsPostOpen} />}
    </div>
  );
};

export default MainLayout;
