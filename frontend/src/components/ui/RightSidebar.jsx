import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { setUserProfile, setAuthUser } from "@/redux/authSlice";
import "./RightSidebar.css";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;

const RightSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchSuggestions = async () => {
      try {
        const res = await axiosInstance.get("/user/suggested");
        if (res.data.success) {
          setSuggestedUsers(res.data.users);
          const map = {};
          res.data.users.forEach(u => {
            map[u._id] = user?.following?.includes(u._id);
          });
          setFollowingMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch suggested users", err);
      }
    };

    fetchSuggestions();
  }, [user]);
 
  const handleFollow = async (userId) => {
    try {
      await axiosInstance.post(`/user/followunfollow/${userId}`);
      setFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
      if (location.pathname.includes("/profile")) {
        const profileId = location.pathname.split("/")[2];
        if (profileId) {
          const res = await axiosInstance.get(`/user/${profileId}/profile`);
          if (res.data.success) dispatch(setUserProfile(res.data.user));
        }
      }
      const meRes = await axiosInstance.get(`/user/${user._id}/profile`);
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="rightsidebar-container">
      {/* Current User Profile */}
      <Link to={`/user/${user?._id}/profile`} className="profile-link-wrapper">
        <Avatar style={{ width: 44, height: 44 }}>
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
        <div className="profile-info">
          <span className="username-link">{user?.username}</span>
          <span className="bio-text">{user?.bio || "No bio"}</span>
        </div>
      </Link>

      {/* Suggested Users */}
      <div className="suggestions">
        <div className="suggested-heading">
          <span>Suggested for you</span>
          <span style={{color: 'var(--text-main)', fontSize: 12, cursor: 'pointer'}}>See All</span>
        </div>
        
        <div className="suggested-list">
          {suggestedUsers.length === 0 ? (
            <p className="bio-text">No suggestions available</p>
          ) : (
            suggestedUsers.map((u) => (
              <div key={u._id} className="suggested-user">
                <Link to={`/user/${u._id}/profile`} className="suggested-link">
                  <Avatar style={{ width: 32, height: 32 }}>
                    <AvatarImage
                      src={
                        u.profilePicture?.startsWith("http")
                          ? u.profilePicture
                          : fallbackAvatar(u.username)
                      }
                      onError={(e) => (e.target.src = fallbackAvatar(u.username))}
                    />
                    <AvatarFallback>{u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="profile-info">
                    <span className="suggested-username">{u.username}</span>
                  </div>
                </Link>
                <button
                  className={`follow-text-btn ${followingMap[u._id] ? 'following' : ''}`}
                  onClick={() => handleFollow(u._id)}
                >
                  {followingMap[u._id] ? "Following" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
