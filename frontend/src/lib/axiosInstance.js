import axios from "axios";

const baseURL = import.meta.env.MODE === "development"
  ? "http://localhost:3000/api/v1"
  : "https://bondly-social-site.onrender.com/api/v1";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;