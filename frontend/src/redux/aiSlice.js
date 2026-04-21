import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const generateAICaptions = createAsyncThunk(
  "ai/generateCaptions",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/ai/generate-caption", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to generate AI captions"
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    loading: false,
    captions: null,
    hashtags: [],
    error: null,
  },
  reducers: {
    clearAIResults: (state) => {
      state.captions = null;
      state.hashtags = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAICaptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateAICaptions.fulfilled, (state, action) => {
        state.loading = false;
        state.captions = action.payload.captions;
        state.hashtags = action.payload.hashtags;
      })
      .addCase(generateAICaptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAIResults } = aiSlice.actions;
export default aiSlice.reducer;
