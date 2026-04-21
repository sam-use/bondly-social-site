import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async ({ userId, range = "7d" }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/analytics/profile/${userId}?range=${range}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load analytics");
    }
  }
);

export const fetchAIInsights = createAsyncThunk(
  "analytics/fetchAIInsights",
  async ({ stats, growth, bestTime, feedbackMode }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/analytics/ai-insights", {
        stats,
        growth,
        bestTime,
        feedbackMode,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load AI insights");
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    stats: null,
    growth: null,
    bestTime: null,
    topPosts: [],
    range: "7d",
    aiInsights: null,
    loading: false,
    aiLoading: false,
    error: null,
  },
  reducers: {
    clearAnalyticsState: (state) => {
      state.stats = null;
      state.growth = null;
      state.bestTime = null;
      state.topPosts = [];
      state.range = "7d";
      state.aiInsights = null;
      state.loading = false;
      state.aiLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.growth = action.payload.growth;
        state.bestTime = action.payload.bestTime;
        state.topPosts = action.payload.topPosts || [];
        state.range = action.payload.range || "7d";
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAIInsights.pending, (state) => {
        state.aiLoading = true;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiInsights = {
          insights: action.payload.insights,
          recommendations: action.payload.recommendations,
          prediction: action.payload.prediction,
          score: action.payload.score,
        };
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalyticsState } = analyticsSlice.actions;
export default analyticsSlice.reducer;
