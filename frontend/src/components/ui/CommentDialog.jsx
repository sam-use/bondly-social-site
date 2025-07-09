import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";

const CommentDialog = ({ open, setOpen, postId }) => {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/posts/${postId}/addcomment`, { text });
      if (res.data.success) {
        alert("Comment submitted!");
        setText("");
        // Optionally: trigger a refresh of comments in parent
      } else {
        alert("Failed to submit comment");
      }
    } catch (err) {
      alert("Error submitting comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription>
            View and post your comments below
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-gray-500">All comments will appear here...</p>
          <Input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            disabled={loading}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
