import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://bondly-social-site.onrender.com/api/v1",
  withCredentials: true,
});

export default axiosInstance;