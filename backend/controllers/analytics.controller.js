import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { Post } from "../models/post.model.js";

dotenv.config();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const toDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildLastNDays = (days = 7) => {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(toDateKey(d));
  }
  return labels;
};

const hourLabel = (hour24) => `${`${hour24}`.padStart(2, "0")}:00`;

export const getProfileAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const allowedRanges = [7, 30, 90];
    const requestedRange = Number(req.query.range || 7);
    const rangeDays = allowedRanges.includes(requestedRange) ? requestedRange : 7;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await User.findById(userId).select("followers following");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const posts = await Post.find({ author: userId })
      .select("image likes comment createdAt")
      .sort({ createdAt: -1 });

    const totalPosts = posts.length;
    let totalLikes = 0;
    let totalComments = 0;

    const hourBuckets = Array.from({ length: 24 }, () => ({
      posts: 0,
      engagement: 0,
    }));

    const dayLabels = buildLastNDays(rangeDays);
    const likesByDay = Object.fromEntries(dayLabels.map((d) => [d, 0]));
    const commentsByDay = Object.fromEntries(dayLabels.map((d) => [d, 0]));
    const postsByDay = Object.fromEntries(dayLabels.map((d) => [d, 0]));

    const topPosts = posts
      .map((post) => {
        const likes = post.likes?.length || 0;
        const comments = post.comment?.length || 0;
        const engagement = likes + comments;

        totalLikes += likes;
        totalComments += comments;

        const postDate = new Date(post.createdAt);
        const hour = postDate.getHours();
        hourBuckets[hour].posts += 1;
        hourBuckets[hour].engagement += engagement;

        const dayKey = toDateKey(postDate);
        if (likesByDay[dayKey] !== undefined) {
          likesByDay[dayKey] += likes;
          commentsByDay[dayKey] += comments;
          postsByDay[dayKey] += 1;
        }

        return {
          postId: post._id,
          likes,
          comments,
          image: post.image || "",
          createdAt: post.createdAt,
          engagement,
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3)
      .map(({ engagement, ...rest }) => rest);

    const avgEngagementByHour = hourBuckets.map((bucket, hour) => ({
      hour,
      avgEngagement: bucket.posts ? bucket.engagement / bucket.posts : 0,
    }));

    const bestHourObj = avgEngagementByHour.reduce(
      (acc, cur) => (cur.avgEngagement > acc.avgEngagement ? cur : acc),
      { hour: 19, avgEngagement: 0 }
    );
    const worstHourObj = avgEngagementByHour.reduce(
      (acc, cur) => (cur.avgEngagement < acc.avgEngagement ? cur : acc),
      { hour: 2, avgEngagement: Number.POSITIVE_INFINITY }
    );

    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const engagementRate = totalPosts
      ? Number(((totalLikes + totalComments) / totalPosts).toFixed(2))
      : 0;

    // Followers-over-time approximation based on current followers and recent activity intensity.
    const activitySum = dayLabels.reduce((sum, d) => sum + postsByDay[d], 0) || 1;
    let runningFollowerEstimate = Math.max(0, followersCount - activitySum);
    const followersOverTime = dayLabels.map((d) => {
      runningFollowerEstimate += postsByDay[d];
      return {
        date: d,
        value: Math.min(followersCount, runningFollowerEstimate),
      };
    });
    if (followersOverTime.length) {
      followersOverTime[followersOverTime.length - 1].value = followersCount;
    }

    const likesTrend = dayLabels.map((d) => ({ date: d, value: likesByDay[d] }));
    const commentsTrend = dayLabels.map((d) => ({ date: d, value: commentsByDay[d] }));

    const response = {
      success: true,
      stats: {
        posts: totalPosts,
        likes: totalLikes,
        comments: totalComments,
        followers: followersCount,
        following: followingCount,
        engagementRate,
        likesPerPost: totalPosts ? Number((totalLikes / totalPosts).toFixed(2)) : 0,
        commentsPerPost: totalPosts ? Number((totalComments / totalPosts).toFixed(2)) : 0,
      },
      growth: {
        followersOverTime,
        likesTrend,
        commentsTrend,
        dailyActivity: dayLabels.map((d) => ({ date: d, posts: postsByDay[d] })),
      },
      range: `${rangeDays}d`,
      bestTime: {
        bestHour: hourLabel(bestHourObj.hour),
        worstHour: hourLabel(
          Number.isFinite(worstHourObj.avgEngagement) ? worstHourObj.hour : 2
        ),
      },
      topPosts,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Profile analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile analytics",
    });
  }
};

const heuristicInsights = (stats, bestTime, feedbackMode) => {
  const style = feedbackMode === "fun" ? "fun" : "professional";
  const engagement = Number(stats?.engagementRate || 0);
  const score = Math.max(
    25,
    Math.min(
      100,
      Math.round(
        engagement * 8 +
          Math.min(20, (stats?.followers || 0) / 5) +
          Math.min(20, (stats?.posts || 0) * 2)
      )
    )
  );

  const insights =
    style === "fun"
      ? `Your profile has ${stats.posts} posts and ${stats.followers} followers. Nice momentum - your current engagement is ${engagement} per post.`
      : `Your account currently has ${stats.posts} posts, ${stats.followers} followers, and an average engagement rate of ${engagement} per post.`;

  const recommendations =
    style === "fun"
      ? `Post more around ${bestTime.bestHour} and test carousel-style captions to boost interactions.`
      : `Schedule content near ${bestTime.bestHour}, and optimize captions with clear calls-to-action to improve comment conversion.`;

  const prediction =
    style === "fun"
      ? `If this pattern continues, your next post could reach around ${Math.max(
          10,
          Math.round((stats.likesPerPost || 0) * 1.15)
        )} likes.`
      : `Based on recent trends, your next post is projected to receive approximately ${Math.max(
          10,
          Math.round((stats.likesPerPost || 0) * 1.15)
        )} likes.`;

  return { insights, recommendations, prediction, score };
};

export const getAIInsights = async (req, res) => {
  try {
    const { stats, growth, bestTime, feedbackMode = "professional" } = req.body || {};

    if (!stats || !growth || !bestTime) {
      return res.status(400).json({
        success: false,
        message: "stats, growth and bestTime are required",
      });
    }

    if (!genAI) {
      return res.status(200).json({
        success: true,
        ...heuristicInsights(stats, bestTime, feedbackMode),
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
You are an AI social media profile analyst.
Given analytics JSON, return ONLY JSON with keys:
{
  "insights": "string",
  "recommendations": "string",
  "prediction": "string",
  "score": number
}

Constraints:
- score must be integer 0 to 100.
- keep each text concise (max 2 sentences).
- tone: ${feedbackMode === "fun" ? "playful and motivating" : "professional and practical"}.

Input:
${JSON.stringify({ stats, growth, bestTime })}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const safePayload = {
      insights: parsed.insights || "Engagement is stable with room to improve consistency.",
      recommendations:
        parsed.recommendations || "Post consistently around your peak hours.",
      prediction: parsed.prediction || "Next post is likely to perform close to your average.",
      score: Math.max(0, Math.min(100, Number(parsed.score) || 60)),
    };

    return res.status(200).json({ success: true, ...safePayload });
  } catch (error) {
    console.error("AI insights error:", error);
    return res.status(200).json({
      success: true,
      ...heuristicInsights(req.body?.stats || {}, req.body?.bestTime || { bestHour: "19:00" }, req.body?.feedbackMode),
    });
  }
};
