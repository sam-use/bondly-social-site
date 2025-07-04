import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Unauthorized: No token", success: false });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded?.id) return res.status(401).json({ message: "Unauthorized: Invalid token", success: false });

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized: User not found", success: false });

    req.user = user;
    req.id = user._id;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export default isAuthenticated;
