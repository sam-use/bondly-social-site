import React, { useState } from "react";
import axios from "@/lib/axiosInstance";
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

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) =>
    setForm({ ...form, avatar: e.target.files[0] });

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    formData.append("password", form.password);
    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      const res = await axios.post("/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAuthUser({ user: res.data.user }));
        toast.success("Profile updated");
        if (onProfileUpdate) onProfileUpdate(); // ✅ trigger refetch in parent
        onClose(); // ✅ close modal
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      console.error("Edit profile error:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Profile</h2>
        <form onSubmit={onSubmit} className="edit-form" encType="multipart/form-data">
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
              placeholder="New Password"
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

          <button type="submit" className="save-btn">Save</button>
        </form>
        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EditProfileModal;
