import React from 'react';
import {
  Heart,
  MessageCircle,
  Search,
  Home,
  Flame,
  LogOut,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import './Sidebar.css'; // <-- make sure this file exists
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

const fallbackAvatar = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

const Sidebar = ({ onCreatePostClick, onBack }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  console.log("Sidebar user:", user);

  if (!user) return <div style={{color: 'red', padding: 16}}>User not loaded (Sidebar)</div>;

  const logoutHandler = async () => {
    try {
      const { data } = await axiosInstance.get('/user/logout', {
        withCredentials: true,
      });

      if (data.success) {
        dispatch(setAuthUser(null));
        toast.success("Logged out successfully");
        navigate('/login');
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Something went wrong during logout");
    }
  };

  const deleteAccountHandler = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      const { data } = await axios.delete("https://bondly-social-site.onrender.com/api/v1/user/delete", {
        withCredentials: true,
      });
      if (data.success) {
        dispatch(setAuthUser(null));
        toast.success("Account deleted successfully");
        navigate('/signup');
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error.response?.data?.message || "Something went wrong during account deletion");
    }
  };

  const sidebarHandler = (text) => {
    switch (text) {
      case 'Home':
        navigate('/');
        break;
      case 'Messages':
        navigate('/chat');
        break;
      case 'Search':
        toast(`${text} coming soon`);
        break;
      case 'Explore':
        navigate('/explore');
        break;
      case 'Notifications':
        toast(`${text} coming soon`);
        break;
      case 'Create Post':
        onCreatePostClick(); // trigger modal from parent
        break;
      case 'Logout':
        logoutHandler();
        break;
      default:
        toast(`${text} clicked`);
    }
  };

  const sidebarItems = [
    { icon: <Home size={20} />, text: 'Home' },
    { icon: <Search size={20} />, text: 'Search' },
    { icon: <Flame size={20} />, text: 'Explore' },
    { icon: <MessageCircle size={20} />, text: 'Messages' },
    { icon: <Heart size={20} />, text: 'Notifications' },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round"
             className="lucide lucide-plus-circle">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      text: 'Create Post',
    },
    { icon: <LogOut size={20} />, text: 'Logout' },
  ];

  return (
    <div className="sidebar-container sidebar bondly-card" style={{background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Back Button for Mobile */}
      <button
        className="sidebar-back-btn"
        onClick={onBack}
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="sidebar-title auth-logo">Bondly</h1>
      <div className="sidebar-items" style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className="sidebar-item"
            onClick={() => sidebarHandler(item.text)}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      {/* Delete Account Button - Mobile First */}
      {user && (
        <button className="delete-account-btn" onClick={deleteAccountHandler}>
          Delete Account
        </button>
      )}
      
      {user && (
        <div className="sidebar-user" style={{flexShrink: 0}}>
          <div
            className="sidebar-user-profile"
            onClick={() => navigate(`/user/${user._id}/profile`)}
          >
            <Avatar className="user-avatar">
              <AvatarImage
                src={
                  user?.profilePicture?.startsWith("http")
                    ? user.profilePicture
                    : fallbackAvatar(user?.username)
                }
                onError={(e) => (e.target.src = fallbackAvatar(user?.username))}
              />
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="user-name">{user.username}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          {user.bio && <p className="user-bio">Bio: {user.bio}</p>}
          <div className="user-follow">
            Followers: {user.followers?.length || 0} | Following: {user.following?.length || 0}
          </div>
          <div className="user-id">ID: {user._id}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
