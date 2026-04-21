import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchAIInsights, fetchAnalytics } from "@/redux/analyticsSlice";
import "./ProfileDashboard.css";

const StatCard = ({ label, value }) => (
  <div className="dashboard-card stat-card">
    <p>{label}</p>
    <h3>{value}</h3>
  </div>
);

const SkeletonCard = () => <div className="skeleton-card" />;

const ProfileDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, growth, bestTime, topPosts, aiInsights, loading, aiLoading, error, range } =
    useSelector((state) => state.analytics);

  const [feedbackMode, setFeedbackMode] = useState("professional");
  const [selectedRange, setSelectedRange] = useState("7d");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAnalytics({ userId: user._id, range: selectedRange }));
    }
  }, [dispatch, user?._id, selectedRange]);

  useEffect(() => {
    if (stats && growth && bestTime) {
      dispatch(fetchAIInsights({ stats, growth, bestTime, feedbackMode }));
    }
  }, [dispatch, stats, growth, bestTime, feedbackMode]);

  const scoreStroke = useMemo(() => {
    const score = aiInsights?.score || 0;
    return (score / 100) * 360;
  }, [aiInsights?.score]);

  if (loading) {
    return (
      <div className="profile-dashboard">
        <div className="dashboard-header">
          <h2>Profile Dashboard</h2>
        </div>
        <div className="stats-grid">
          {Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
        <div className="chart-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <div className="dashboard-header">
        <h2>Profile Dashboard</h2>
        <p>Track growth, optimize timing, and use AI to improve performance.</p>
        <div className="range-switch">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              className={`range-btn ${selectedRange === r ? "active" : ""}`}
              onClick={() => setSelectedRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="stats-grid">
        <StatCard label="Posts" value={stats?.posts ?? 0} />
        <StatCard label="Likes" value={stats?.likes ?? 0} />
        <StatCard label="Comments" value={stats?.comments ?? 0} />
        <StatCard label="Followers" value={stats?.followers ?? 0} />
        <StatCard label="Engagement Rate" value={stats?.engagementRate ?? 0} />
      </div>

      <div className="chart-grid">
        <div className="dashboard-card chart-card">
          <h4>Followers Growth ({range})</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growth?.followersOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0095f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card chart-card">
          <h4>Likes Trend ({range})</h4>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={growth?.likesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Best Time To Post</h4>
          <div className="time-row">
            <div>
              <p className="muted">Best Hour</p>
              <h3>{bestTime?.bestHour || "--:--"}</h3>
            </div>
            <div>
              <p className="muted">Worst Hour</p>
              <h3>{bestTime?.worstHour || "--:--"}</h3>
            </div>
          </div>
        </div>

        <div className="dashboard-card ai-card">
          <div className="ai-card-header">
            <h4>AI Insights</h4>
            <select value={feedbackMode} onChange={(e) => setFeedbackMode(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="fun">Fun</option>
            </select>
          </div>
          {aiLoading ? (
            <div className="ai-loading">Generating AI recommendations...</div>
          ) : (
            <>
              <p>
                <span>Insight:</span> {aiInsights?.insights || "No insight yet."}
              </p>
              <p>
                <span>Recommendation:</span>{" "}
                {aiInsights?.recommendations || "No recommendation yet."}
              </p>
              <p>
                <span>Prediction:</span> {aiInsights?.prediction || "No prediction yet."}
              </p>
            </>
          )}
        </div>

        <div className="dashboard-card score-card">
          <h4>Profile Score</h4>
          <div
            className="score-ring"
            style={{
              background: `conic-gradient(#0095f6 ${scoreStroke}deg, #e9e9e9 0deg)`,
            }}
          >
            <div className="score-inner">{aiInsights?.score ?? 0}</div>
          </div>
          <p className="muted">Based on engagement, consistency, and audience response.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <h4>Top Performing Posts</h4>
        <div className="top-posts-grid">
          {(topPosts || []).map((post) => (
            <Link to={`/post/${post.postId}`} className="top-post-link" key={post.postId}>
              <div className="top-post-item">
              {post.image ? <img src={post.image} alt="Top post" /> : <div className="post-placeholder" />}
              <div>
                <p>Likes: {post.likes}</p>
                <p>Comments: {post.comments}</p>
              </div>
              </div>
            </Link>
          ))}
          {!topPosts?.length && <p className="muted">No posts yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
