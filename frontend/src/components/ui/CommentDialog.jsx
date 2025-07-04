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

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = React.useState("");

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
          />
          <Button
            onClick={() => {
              console.log("Comment submitted:", text);
              setText("");
            }}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
