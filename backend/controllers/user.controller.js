import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import { getDataUri } from "../utils/datauri.js";
import { Post } from "../models/post.model.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Some fields are missing", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ 
      message: "User registered successfully", 
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        posts: []
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
// Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.id; // Authenticated user's ID

    // Optionally: Remove user's posts, comments, etc. (cascade delete)
    await User.findByIdAndDelete(userId);

    // Optionally: Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    });

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};
// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields", success: false });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found", success: false });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials", success: false });

  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });


    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set true for HTTPS
      sameSite: "None",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        posts: [] // You can populate later
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    console.log("Logging out. Current cookies:", req.cookies);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/"
    });
    // res.cookie("token", "", {
    //   httpOnly: true,
    //   expires: new Date(0), // Clear cookie
    //   path: "/",
    // });

    res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
//edit
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { username, password, bio } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (bio !== undefined) updates.bio = bio;

  if (req.file) {
  const fileUri = getDataUri(req.file); // ✅ will now work
  const cld = await cloudinary.uploader.upload(fileUri);
  updates.profilePicture = cld.secure_url;
}

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // ⬇️ Replace your current catch block with this:
    console.error("Edit profile error:", error.message, error.stack); // ✅ Shows exact error
    return res.status(500).json({
      success: false,
      message: error.message || "Profile update failed",
    });
  }
};



// FOLLOW / UNFOLLOW
export const followUnfollow = async (req, res) => {
  try {
    const meId = req.id;
    const targetId = req.params.id;
    if (meId === targetId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    const me = await User.findById(meId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const isFollowing = me.following.includes(targetId);
    if (isFollowing) {
      me.following.pull(targetId);
      target.followers.pull(meId);
    } else {
      me.following.push(targetId);
      target.followers.push(meId);
    }

    await me.save();
    await target.save();

    return res.status(200).json({
      success: true,
      message: isFollowing ? "Unfollowed" : "Followed",
      following: !isFollowing,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Follow/unfollow failed" });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("posts")
      .populate({ path: "bookmarks", populate: { path: "author", select: "username profilePicture" } });

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
export const getSuggestUsers = async (req, res) => {
  try {
    const currentUserId = req.id; // ✅ Using req.id from middleware

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const following = currentUser.following || [];

    const suggestedUsers = await User.find({
      _id: { $ne: currentUserId, $nin: following },
    }).select("_id username profilePicture").limit(10);

    return res.status(200).json({ success: true, users: suggestedUsers });
  } catch (error) {
    console.error("Suggest Users Error:", error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No user IDs provided", users: [] });
    }
    const users = await User.find({ _id: { $in: ids } }).select("_id username profilePicture");
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, users: [] });
  }
};

