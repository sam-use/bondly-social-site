import React, { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import toast from "react-hot-toast";
import "./EditProfileModal.css";

const EditProfileModal = ({ user, onClose, onProfileUpdate }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    username: user.username || "",
    bio: user.bio || "",
    password: "",
    avatar: null,
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) =>
    setForm({ ...form, avatar: e.target.files[0] });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    if (form.password) formData.append("password", form.password);
    if (form.avatar) formData.append("avatar", form.avatar);

    try {
      const res = await axiosInstance.post("/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        dispatch(setAuthUser({ user: res.data.user }));
        toast.success("Profile updated");
        if (onProfileUpdate) onProfileUpdate(); 
        onClose(); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      console.error("Edit profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={onSubmit} className="edit-form" encType="multipart/form-data">
          <div className="modal-content">
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="Username"
                required
              />
            </label>

            <label>
              Bio
              <input
                name="bio"
                value={form.bio}
                onChange={onChange}
                placeholder="Bio"
              />
            </label>

            <label>
              New Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="New Password (optional)"
              />
            </label>

            <label>
              Profile Picture
              <input
                type="file"
                onChange={onFileChange}
                accept="image/*"
              />
            </label>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
