import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  caption: String,
  image: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }
  ]
}, { timestamps: true });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);