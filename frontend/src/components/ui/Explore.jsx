import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "@/lib/axiosInstance";
import Posts from "./Posts";
import "./Explore.css";

const Explore = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axiosInstance.get("/user/all");
        if (res.data?.success) {
          setUsers((res.data.users || []).filter((u) => u._id !== user?._id));
        }
      } catch (error) {
        console.error("Failed to fetch users for explore search", error);
      }
    };
    fetchAllUsers();
  }, [user?._id]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return users
      .filter((u) => (u.username || "").toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchTerm, users]);

  return (
    <div className="explore-bg">
      <h1 className="explore-title">Explore</h1>
      <div className="explore-search-wrap">
        <input
          type="text"
          className="explore-search-input"
          placeholder="Search users by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {!!searchTerm.trim() && (
          <div className="explore-search-results">
            {filteredUsers.length ? (
              filteredUsers.map((profile) => (
                <Link
                  key={profile._id}
                  to={`/user/${profile._id}/profile`}
                  className="explore-user-result"
                >
                  <img
                    src={
                      profile.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random`
                    }
                    alt={profile.username}
                  />
                  <span>{profile.username}</span>
                </Link>
              ))
            ) : (
              <p className="explore-no-results">No users found.</p>
            )}
          </div>
        )}
      </div>
      <div className="explore-grid">
        <Posts gridMode />
      </div>
    </div>
  );
};

export default Explore; 