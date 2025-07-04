import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    suggestedUsers: [],
    userProfile: null,
   selectedUser:null
  },
  reducers: {
    setAuthUser: (state, action) => {
      if (action.payload === null) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.suggestedUsers = [];
      } else {
        let user = action.payload.user || null;
        if (user && user.avatar && !user.profilePicture) {
          user.profilePicture = user.avatar;
        }
        state.user = user;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        if (user && user.following) {
          state.user.following = user.following;
        }
      }
    },

    // ✅ New reducer to set suggested users
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload || [];
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || null; // ✅ New reducer to set user profile
  },
  setSelectedUser:(state,action)=>{
    state.selectedUser = action.payload;
  }
},
});

export const { setAuthUser, setSuggestedUsers, setUserProfile,setSelectedUser } = authSlice.actions;
export default authSlice.reducer;
