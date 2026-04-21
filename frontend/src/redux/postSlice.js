import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

// Thunk to fetch all posts
export const fetchAllPosts = createAsyncThunk("posts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/posts");
    return res.data.posts;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch posts");
  }
});

// Thunk to fetch explore posts
export const fetchExplorePosts = createAsyncThunk("posts/fetchExplore", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/posts/explore");
    return res.data.posts;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch explore posts");
  }
});

// Thunk to create a new post
export const addPost = createAsyncThunk("posts/addPost", async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/posts/addpost", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.post;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create post");
  }
});

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExplorePosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // add new post at top
      });
  },
});

export const { setPosts } = postSlice.actions;
export default postSlice.reducer;
