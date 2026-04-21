import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "@/lib/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import EditProfileModal from "@/components/ui/EditProfileModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./Profile.css";
import { setAuthUser } from "@/redux/authSlice";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;

const Profile = () => {
  const { id: userId } = useParams();
  const { userProfile, refetchProfile } = useGetUserProfile(userId);
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

  const handleFollowModal = async (uId, mapSetter) => {
    try {
      await axiosInstance.post(`/user/followunfollow/${uId}`);
      mapSetter(prev => ({ ...prev, [uId]: !prev[uId] }));
      const meRes = await axiosInstance.get(`/user/${authUser._id}/profile`);
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
      refetchProfile();
    } catch {
      // ignore
    }
  };

  const followHandler = async () => {
    try {
      const res = await axiosInstance.post(`/user/followunfollow/${userId}`);
      setIsFollowing(res.data.following);
      const meRes = await axiosInstance.get(`/user/${authUser._id}/profile`);
      if (meRes.data.success) dispatch(setAuthUser({ user: meRes.data.user }));
      refetchProfile();
    } catch {
      // ignore
    }
  };

  const fetchUserList = async (userIds, setList) => {
    try {
      if (!userIds || userIds.length === 0) return setList([]);
      const res = await axiosInstance.post("/user/list", { ids: userIds });
      if (res.data.success) setList(res.data.users);
    } catch {
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

  if (!userProfile) return <div style={{padding: 40, textAlign: 'center'}}>Loading profile...</div>;

  const isOwnProfile = authUser?._id === userProfile._id;
  const posts = userProfile.posts || [];
  const savedPosts = userProfile.bookmarks || [];
  const displayedPosts = activeTab === "posts" ? posts : savedPosts;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <img 
            src={userProfile.profilePicture || fallbackAvatar(userProfile.username)} 
            alt="Profile Avatar" 
            className="profile-avatar"
            onError={(e) => { e.target.src = fallbackAvatar(userProfile.username) }}
          />
        </div>
        <div className="profile-details">
          <div className="profile-top-row">
            <h2 className="username">{userProfile.username}</h2>
            <div className="profile-actions">
              {isOwnProfile ? (
                <button onClick={() => setEditModal(true)} className="btn-secondary">
                  Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={followHandler} className={isFollowing ? "btn-secondary" : "btn-primary"}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="btn-secondary">Message</button>
                </>
              )}
            </div>
          </div>
          <div className="stats-row">
            <span><strong>{posts.length}</strong> posts</span>
            <span style={{cursor: 'pointer'}} onClick={openFollowersModal}><strong>{userProfile.followers?.length || 0}</strong> followers</span>
            <span style={{cursor: 'pointer'}} onClick={openFollowingModal}><strong>{userProfile.following?.length || 0}</strong> following</span>
          </div>
          <div className="bio-section">
            <div className="bio">{userProfile.bio || ""}</div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <div
          className={`tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
          style={{cursor: 'pointer'}}
        >
          POSTS
        </div>
        {isOwnProfile && (
          <div
            className={`tab ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
            style={{cursor: 'pointer'}}
          >
            SAVED
          </div>
        )}
      </div>

      <div className="posts-grid">
        {displayedPosts.length === 0 ? (
          <div style={{gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-secondary)'}}>
            No {activeTab} yet.
          </div>
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

      {editModal && isOwnProfile && (
        <EditProfileModal
          user={userProfile}
          onClose={() => setEditModal(false)}
          onProfileUpdate={refetchProfile}
        />
      )}

      {followersModal && (
        <div className="modal-overlay" onClick={() => setFollowersModal(false)} style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div onClick={e => e.stopPropagation()} style={{background: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
              <h2 style={{fontSize: 16, fontWeight: 600}}>Followers</h2>
              <button onClick={() => setFollowersModal(false)} style={{fontSize: 20}}>&times;</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              {followersList.length === 0 ? <p style={{textAlign:'center'}}>No followers.</p> : followersList.map(u => (
                <div key={u._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Link to={`/user/${u._id}/profile`} onClick={() => setFollowersModal(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                    <Avatar style={{width: 44, height: 44}}><AvatarImage src={u.profilePicture || fallbackAvatar(u.username)} /><AvatarFallback>{u.username[0]}</AvatarFallback></Avatar>
                    <span style={{fontWeight: 600, fontSize: 14}}>{u.username}</span>
                  </Link>
                  {u._id !== authUser._id && (
                    <button
                      className={followersMap[u._id] ? "btn-secondary" : "btn-primary"}
                      onClick={() => handleFollowModal(u._id, setFollowersMap)}
                    >
                      {followersMap[u._id] ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {followingModal && (
        <div className="modal-overlay" onClick={() => setFollowingModal(false)} style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div onClick={e => e.stopPropagation()} style={{background: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
              <h2 style={{fontSize: 16, fontWeight: 600}}>Following</h2>
              <button onClick={() => setFollowingModal(false)} style={{fontSize: 20}}>&times;</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              {followingList.length === 0 ? <p style={{textAlign:'center'}}>Not following anyone.</p> : followingList.map(u => (
                <div key={u._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Link to={`/user/${u._id}/profile`} onClick={() => setFollowingModal(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                    <Avatar style={{width: 44, height: 44}}><AvatarImage src={u.profilePicture || fallbackAvatar(u.username)} /><AvatarFallback>{u.username[0]}</AvatarFallback></Avatar>
                    <span style={{fontWeight: 600, fontSize: 14}}>{u.username}</span>
                  </Link>
                  {u._id !== authUser._id && (
                    <button
                      className={followingMap[u._id] ? "btn-secondary" : "btn-primary"}
                      onClick={() => handleFollowModal(u._id, setFollowingMap)}
                    >
                      {followingMap[u._id] ? "Following" : "Follow"}
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
