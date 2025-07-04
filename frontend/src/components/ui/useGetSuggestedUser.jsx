import {setUserProfile} from "../../redux/slices/userSlice";
import {useEffect, useState} from "react";
import axios from "axios";
import {useDispatch} from "react-redux";

const useGetSuggestedUser = () => {
  const dispatch = useDispatch();
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/user/${user._id}/profile`, );
        if(res.data.success) {
          setSuggestedUsers(response.data.suggestedUsers);
          dispatch(setUserProfile(response.data.user));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, [user._id, dispatch]);

  return suggestedUsers;
};
