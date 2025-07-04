import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Give Redux a moment to load the user state
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user) {
        navigate('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Don't render anything while redirecting
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
