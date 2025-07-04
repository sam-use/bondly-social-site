import { createSlice } from "@reduxjs/toolkit";

const socketslice = createSlice({
  name: "socketslice",
  initialState: {
    socket: null,
    onlineUsers: [],
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setSocket, setOnlineUsers } = socketslice.actions;
export default socketslice.reducer;
