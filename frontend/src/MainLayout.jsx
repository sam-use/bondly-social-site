import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect if user is not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

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
