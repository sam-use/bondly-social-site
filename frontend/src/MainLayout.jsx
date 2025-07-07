import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./components/ui/Sidebar";
import RightSidebar from "./components/ui/RightSidebar";
import CreatePost from "./components/ui/Createpost";
import { Home, Search, PlusSquare, Heart, User, Menu, X, Users } from "lucide-react";
import "./MainLayout.css";

const MainLayout = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileRightSidebarOpen, setIsMobileRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect if user is not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Close mobile sidebars when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsMobileRightSidebarOpen(false);
  }, [location.pathname]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
    setIsMobileRightSidebarOpen(false);
  };

  const toggleMobileRightSidebar = () => {
    setIsMobileRightSidebarOpen(!isMobileRightSidebarOpen);
    setIsMobileSidebarOpen(false);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const closeMobileRightSidebar = () => {
    setIsMobileRightSidebarOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Check if current route should be full-width (no sidebars)
  const isFullWidthRoute = () => {
    return false; // Revert to original layout with sidebars
  };

  return (
    <div className="main-layout">
      {/* Mobile Top Navigation */}
      <div className="mobile-top-nav">
        <button 
          className="mobile-nav-btn sidebar-btn"
          onClick={toggleMobileSidebar}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
        
        <div className="mobile-nav-center">
          <h1 className="mobile-app-title">Bondly</h1>
        </div>
        
        <button 
          className="mobile-nav-btn rightsidebar-btn"
          onClick={toggleMobileRightSidebar}
        >
          <Users size={20} />
          <span>Suggestions</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'open' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Mobile Right Sidebar Overlay */}
      <div 
        className={`mobile-rightsidebar-overlay ${isMobileRightSidebarOpen ? 'open' : ''}`}
        onClick={closeMobileRightSidebar}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Menu</h2>
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

      {/* Mobile Right Sidebar */}
      <div className={`mobile-rightsidebar ${isMobileRightSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Suggestions</h2>
            <button 
              onClick={closeMobileRightSidebar}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <RightSidebar />
      </div>

      {/* Desktop Sidebar */}
      {!isFullWidthRoute() && (
        <div className="sidebar">
          <Sidebar onCreatePostClick={() => setIsPostOpen(true)} />
        </div>
      )}

      {/* Main Feed */}
      <div className={isFullWidthRoute() ? "feed-full-width" : "feed"}>
        <Outlet />
      </div>

      {/* Desktop Right Sidebar */}
      {!isFullWidthRoute() && (
        <div className="right-sidebar">
          <RightSidebar />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
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
