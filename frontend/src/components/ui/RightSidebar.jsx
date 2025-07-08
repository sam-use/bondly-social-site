import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { setUserProfile, setAuthUser } from "@/redux/authSlice";
import "./RightSidebar.css";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;

const RightSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  console.log("RightSidebar user:", user);

  if (!user) return <div style={{color: 'red', padding: 16}}>User not loaded (RightSidebar)</div>;

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get("https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/suggested", {
          withCredentials: true,
        });
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
      await axios.post(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/followunfollow/${userId}`, {}, { withCredentials: true });
      setFollowingMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
      if (location.pathname.includes("/profile")) {
        const profileId = location.pathname.split("/")[2];
        if (profileId) {
          const res = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/${profileId}/profile`, { withCredentials: true });
          if (res.data.success) dispatch(setUserProfile(res.data.user));
        }
      }
      const meRes = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/${user._id}/profile`, { withCredentials: true });
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  return (
    <div className="right-sidebar bondly-card space-y-8 p-6">
      {/* Current User Profile */}
      <div className="profile items-center gap-4 mb-8">
        <Link to={`/user/${user?._id}/profile`} className="avatar-link">
          <Avatar className="avatar">
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
        </Link>
        <div className="profile-info">
          <Link
            to={`/user/${user?._id}/profile`}
            className="username-link"
          >
            {user?.username}
          </Link>
          <p className="bio-text">{user?.bio || "No bio"}</p>
        </div>
      </div>

      {/* Suggested Users */}
      <div className="suggestions">
        <h2 className="suggested-heading">Suggested for you</h2>
        <div className="suggested-list">
          {suggestedUsers.length === 0 ? (
            <p className="no-suggestions">No suggestions available</p>
          ) : (
            suggestedUsers.map((u) => (
              <div key={u._id} className="suggested-user">
                <Link to={`/user/${u._id}/profile`} className="suggested-link">
                  <Avatar className="suggested-avatar">
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
                  <span className="suggested-username">{u.username}</span>
                </Link>
                <button
                  className="follow-btn"
                  onClick={() => handleFollow(u._id)}
                >
                  {followingMap[u._id] ? "Unfollow" : "Follow"}
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
