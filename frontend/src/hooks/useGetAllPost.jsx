import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "@/lib/axiosInstance";
import { setPosts } from "@/redux/postSlice";

const useGetAllPosts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await axiosInstance.get("/posts");
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchAllPosts();
  }, [dispatch]);
};

export default useGetAllPosts;
