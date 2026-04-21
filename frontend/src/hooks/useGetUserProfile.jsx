import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";
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
      const response = await axiosInstance.get(`/user/${userId}/profile`);
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
