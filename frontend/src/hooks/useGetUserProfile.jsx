import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserProfile } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  const [userProfile, setUserProfileState] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/${userId}/profile`, {
        withCredentials: true,
      });
      if (response.data.success) {
        dispatch(setUserProfile(response.data.user));
        setUserProfileState(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userProfile, loading, refetchProfile: fetchUserProfile };
};

export default useGetUserProfile;
