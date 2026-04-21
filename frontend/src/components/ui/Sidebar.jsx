import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts } from "@/redux/postSlice";
import axiosInstance from "@/lib/axiosInstance";
import toast from "react-hot-toast";
import { Home, Search, PlusSquare, MessageCircle, LogOut, UserMinus, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import "./Sidebar.css";

const Sidebar = ({ onCreatePostClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.get("/user/logout");
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    try {
      const res = await axiosInstance.delete("/user/delete-account");
      if (res.data.success) {
        toast.success("Account deleted successfully.");
        dispatch(setAuthUser(null));
        dispatch(setPosts([]));
        navigate("/login");
      }
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const isActive = (path) => location.pathname === path;
  const isProfileActive = location.pathname.includes(`/user/${user?._id}/profile`);

  return (
    <div className="sidebar-container">
      <Link to="/" className="auth-logo">Bondly</Link>

      <div className="sidebar-items">
        <Link to="/" className={`sidebar-item ${isActive("/") ? "active" : ""}`}>
          <Home />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`sidebar-item ${isActive("/explore") ? "active" : ""}`}>
          <Search />
          <span>Search</span>
        </Link>
        <div className="sidebar-item" onClick={onCreatePostClick}>
          <PlusSquare />
          <span>Create</span>
        </div>
        <Link to="/chat" className={`sidebar-item ${isActive("/chat") ? "active" : ""}`}>
          <MessageCircle />
          <span>Messages</span>
        </Link>
        <Link to="/dashboard" className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}>
          <BarChart3 />
          <span>Dashboard</span>
        </Link>
        <Link to={`/user/${user?._id}/profile`} className={`sidebar-item ${isProfileActive ? "active" : ""}`}>
          <Avatar style={{ width: 24, height: 24 }}>
            <AvatarImage src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} />
            <AvatarFallback>{user?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <span>Profile</span>
        </Link>
      </div>

      <div className="sidebar-user">
        <button className="logout-btn" onClick={handleLogout}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <LogOut size={20} />
            <span className="hidden-tablet">Log out</span>
          </div>
        </button>
        <button className="delete-account-btn" onClick={deleteAccount}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <UserMinus size={20} />
            <span className="hidden-tablet">Delete Account</span>
          </div>
        </button>
      </div>
      
      {/* Tablet hidden text logic handled in CSS generally, but for these specific buttons, 
          we can hide spans with media queries in pure CSS. */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-tablet { display: none; }
          .logout-btn div, .delete-account-btn div { justify-content: center; margin: 0; padding: 0; gap: 0; }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
