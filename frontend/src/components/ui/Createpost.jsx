import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addPost } from "@/redux/postSlice"; // ✅ thunk
import "./CreatePost.css";

const CreatePost = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert("Image is required");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);

    setLoading(true);
    try {
      await dispatch(addPost(formData)).unwrap(); // ✅ dispatch thunk directly
      setCaption("");
      setImage(null);
      setOpen(false);
    } catch (error) {
      console.error("Error creating post", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={() => setOpen(false)} className="createpost-close-btn" style={{ color: '#000' }} aria-label="Close">&times;</button>
        <form onSubmit={handleSubmit} className="createpost-form bondly-card">
          <h2>Create Post</h2>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="createpost-img-preview" />
          )}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows="3"
            required
            disabled={loading}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>{loading ? "Posting..." : "Post"}</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
