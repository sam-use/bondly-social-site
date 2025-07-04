import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://instagram-clone-backend-nqcw.onrender.com/api/v1",
  withCredentials: true,
});

export default axiosInstance;