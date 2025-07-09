import {useEffect, useState} from "react";
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";

const useGetSuggestedUser = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user?._id) return;
      
      try {
        const response = await axios.get(`https://bondly-social-site.onrender.com/api/v1/user/suggested`, {
          withCredentials: true
        });
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
