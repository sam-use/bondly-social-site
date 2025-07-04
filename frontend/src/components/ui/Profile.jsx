import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "@/lib/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import EditProfileModal from "@/components/ui/EditProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./Profile.css";
import { setUserProfile, setAuthUser } from "@/redux/authSlice";

const Profile = () => {
  const { id: userId } = useParams();
  const { userProfile, refetchProfile } = useGetUserProfile(userId); // ✅ updated
  const { user: authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [followersModal, setFollowersModal] = useState(false);
  const [followingModal, setFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followersMap, setFollowersMap] = useState({});
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    if (authUser && userProfile) {
      setIsFollowing(authUser.following?.includes(userProfile._id));
    }
  }, [authUser, userProfile]);

  // Update maps when lists change
  useEffect(() => {
    const map = {};
    followersList.forEach(u => { map[u._id] = authUser.following?.includes(u._id); });
    setFollowersMap(map);
  }, [followersList, authUser]);
  useEffect(() => {
    const map = {};
    followingList.forEach(u => { map[u._id] = authUser.following?.includes(u._id); });
    setFollowingMap(map);
  }, [followingList, authUser]);

  const handleFollowModal = async (userId, mapSetter) => {
    try {
      await axios.post(`/user/followunfollow/${userId}`, {}, { withCredentials: true });
      mapSetter(prev => ({ ...prev, [userId]: !prev[userId] }));
      // Always refetch the logged-in user to update following list in Redux
      const meRes = await axios.get(`http://localhost:3000/api/v1/user/${authUser._id}/profile`, { withCredentials: true });
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
      // Refetch the viewed profile to update followers/following counts
      refetchProfile();
    } catch (err) {}
  };

  const followHandler = async () => {
    try {
      const res = await axios.post(`/user/followunfollow/${userId}`, {}, { withCredentials: true });
      setIsFollowing(res.data.following);
      // Always refetch the logged-in user to update following list in Redux
      const meRes = await axios.get(`http://localhost:3000/api/v1/user/${authUser._id}/profile`, { withCredentials: true });
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
      // Refetch the viewed profile to update followers/following counts
      refetchProfile();
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  // Fetch full user objects for followers/following
  const fetchUserList = async (userIds, setList) => {
    try {
      if (!userIds || userIds.length === 0) return setList([]);
      const res = await axios.post("/user/list", { ids: userIds }, { withCredentials: true });
      if (res.data.success) setList(res.data.users);
    } catch (err) {
      setList([]);
    }
  };

  const openFollowersModal = () => {
    fetchUserList(userProfile.followers, setFollowersList);
    setFollowersModal(true);
  };
  const openFollowingModal = () => {
    fetchUserList(userProfile.following, setFollowingList);
    setFollowingModal(true);
  };

  if (!userProfile) return <p className="profile-loading">Loading profile...</p>;

  const isOwnProfile = authUser?._id === userProfile._id;
  const posts = userProfile.posts || [];
  const savedPosts = userProfile.bookmarks || [];
  const displayedPosts = activeTab === "posts" ? posts : savedPosts;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <Avatar className="profile-avatar">
          <AvatarImage src={userProfile.profilePicture} />
          <AvatarFallback>{userProfile.username[0]}</AvatarFallback>
        </Avatar>
        <div className="profile-details">
          <div className="profile-top-row">
            <h2 className="username">{userProfile.username}</h2>
            {isOwnProfile ? (
              <button onClick={() => setEditModal(true)} className="edit-btn">
                Edit Profile
              </button>
            ) : (
              <>
                <button onClick={followHandler} className="follow-btn">
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
                {isFollowing && <button className="msg-btn">Message</button>}
              </>
            )}
          </div>
          <div className="stats-row">
            <span><strong>{posts.length}</strong> posts</span>
            <span className="clickable" onClick={openFollowersModal}><strong>{userProfile.followers?.length || 0}</strong> followers</span>
            <span className="clickable" onClick={openFollowingModal}><strong>{userProfile.following?.length || 0}</strong> following</span>
          </div>
          <p className="bio">{userProfile.bio || "No bio provided."}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={activeTab === "posts" ? "tab active" : "tab"}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "saved" ? "tab active" : "tab"}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>
      </div>

      {/* Posts or Saved */}
      <div className="posts-grid">
        {displayedPosts.length === 0 ? (
          <p className="no-posts">No {activeTab === "posts" ? "posts" : "saved posts"} to show.</p>
        ) : (
          displayedPosts.map((post) => (
            <Link key={post._id} to={`/post/${post._id}`}>
              <img
                src={post.image || "https://via.placeholder.com/300"}
                alt="post"
                className="post-item"
              />
            </Link>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editModal && isOwnProfile && (
        <EditProfileModal
          user={userProfile}
          onClose={() => setEditModal(false)}
          onProfileUpdate={refetchProfile} // ✅ trigger refresh
        />
      )}

      {/* Followers Modal */}
      {followersModal && (
        <div className="modal-overlay" onClick={() => setFollowersModal(false)}>
          <div className="modal user-list-modal" onClick={e => e.stopPropagation()}>
            <h2>Followers</h2>
            <button className="modal-close-btn" onClick={() => setFollowersModal(false)}>Close</button>
            <div className="user-list">
              {followersList.length === 0 ? <p>No followers yet.</p> : followersList.map(u => (
                <div key={u._id} className="user-row">
                  <Avatar className="avatar"><AvatarImage src={u.profilePicture} /><AvatarFallback>{u.username[0]}</AvatarFallback></Avatar>
                  <span className="username">{u.username}</span>
                  {u._id !== authUser._id && (
                    <button
                      className="follow-btn"
                      style={{ marginLeft: 8, padding: '4px 12px', fontSize: '0.95rem' }}
                      onClick={() => handleFollowModal(u._id, setFollowersMap)}
                    >
                      {followersMap[u._id] ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Following Modal */}
      {followingModal && (
        <div className="modal-overlay" onClick={() => setFollowingModal(false)}>
          <div className="modal user-list-modal" onClick={e => e.stopPropagation()}>
            <h2>Following</h2>
            <button className="modal-close-btn" onClick={() => setFollowingModal(false)}>Close</button>
            <div className="user-list">
              {followingList.length === 0 ? <p>Not following anyone yet.</p> : followingList.map(u => (
                <div key={u._id} className="user-row">
                  <Avatar className="avatar"><AvatarImage src={u.profilePicture} /><AvatarFallback>{u.username[0]}</AvatarFallback></Avatar>
                  <span className="username">{u.username}</span>
                  {u._id !== authUser._id && (
                    <button
                      className="follow-btn"
                      style={{ marginLeft: 8, padding: '4px 12px', fontSize: '0.95rem' }}
                      onClick={() => handleFollowModal(u._id, setFollowingMap)}
                    >
                      {followingMap[u._id] ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
