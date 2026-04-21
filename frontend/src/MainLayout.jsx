import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import { Home, Search, PlusSquare, MessageCircle, User, BarChart3 } from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isFullWidthRoute = () => {
    // Return true if you want certain routes (like messaging) to hide sidebars
    if (location.pathname.startsWith('/chat')) return true;
    return false;
  };

  return (
    <div className="main-layout">
      {/* Mobile Top Navigation */}
      {!isFullWidthRoute() && (
        <div className="mobile-top-nav">
          <h1 className="mobile-app-title">Bondly</h1>
        </div>
      )}

      {/* Desktop Navigation Sidebar */}
      {!isFullWidthRoute() && (
        <div className="sidebar">
          <Sidebar onCreatePostClick={() => setIsPostOpen(true)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className={isFullWidthRoute() ? "feed-full-width" : "feed"}>
        <Outlet />
      </div>

      {/* Desktop Suggestions Sidebar */}
      {!isFullWidthRoute() && (
        <div className="right-sidebar">
          <RightSidebar />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!isFullWidthRoute() && (
        <nav className="mobile-nav">
          <div className="mobile-nav-items">
            <div 
              className={`mobile-nav-item ${isActiveRoute('/') ? 'active' : ''}`}
              onClick={() => navigate('/')}
            >
              <Home className="mobile-nav-icon" />
              <span>Home</span>
            </div>
            
            <div 
              className={`mobile-nav-item ${isActiveRoute('/explore') ? 'active' : ''}`}
              onClick={() => navigate('/explore')}
            >
              <Search className="mobile-nav-icon" />
              <span>Search</span>
            </div>
            
            <div 
              className="mobile-nav-item"
              onClick={() => setIsPostOpen(true)}
            >
              <PlusSquare className="mobile-nav-icon" />
              <span>Post</span>
            </div>
            
            <div 
              className={`mobile-nav-item ${isActiveRoute('/chat') ? 'active' : ''}`}
              onClick={() => navigate('/chat')}
            >
              <MessageCircle className="mobile-nav-icon" />
              <span>Chat</span>
            </div>

            <div
              className={`mobile-nav-item ${isActiveRoute('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="mobile-nav-icon" />
              <span>Insights</span>
            </div>
            
            <div 
              className={`mobile-nav-item ${location.pathname.includes('/user/') && location.pathname.includes('/profile') ? 'active' : ''}`}
              onClick={() => navigate(`/user/${user._id}/profile`)}
            >
              <User className="mobile-nav-icon" />
              <span>Profile</span>
            </div>
          </div>
        </nav>
      )}

      {isPostOpen && <CreatePost open={isPostOpen} setOpen={setIsPostOpen} />}
    </div>
  );
};

export default MainLayout;
