import {useEffect, useState} from "react";
import axiosInstance from "@/lib/axiosInstance";
import {useDispatch, useSelector} from "react-redux";

const useGetSuggestedUser = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user?._id) return;
      
      try {
        const response = await axiosInstance.get("/user/suggested");
        if(response.data.success) {
          setSuggestedUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, [user?._id, dispatch]);

  return suggestedUsers;
};

export default useGetSuggestedUser;
