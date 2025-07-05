import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import { Home, Search, PlusSquare, Heart, User, Menu, X } from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect if user is not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="main-layout">
      {/* Hamburger Menu */}
      <div className="hamburger-menu" onClick={toggleMobileSidebar}>
        <div className="hamburger-icon"></div>
        <div className="hamburger-icon"></div>
        <div className="hamburger-icon"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Instagram</h2>
            <button 
              onClick={closeMobileSidebar}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <Sidebar onCreatePostClick={() => {
          setIsPostOpen(true);
          closeMobileSidebar();
        }} />
      </div>

      {/* Desktop Sidebar */}
      <div className="sidebar">
        <Sidebar onCreatePostClick={() => setIsPostOpen(true)} />
      </div>

      {/* Main Feed */}
      <div className="feed">
        <Outlet />
      </div>

      {/* Desktop Right Sidebar */}
      <div className="right-sidebar">
        <RightSidebar />
      </div>

      {/* Mobile Navigation */}
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
            <Heart className="mobile-nav-icon" />
            <span>Chat</span>
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

      {/* Create Post Modal */}
      {isPostOpen && <CreatePost open={isPostOpen} setOpen={setIsPostOpen} />}
    </div>
  );
};

export default MainLayout;
