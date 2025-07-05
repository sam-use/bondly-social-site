import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  senderid : {
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  resiverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message:{
type:String,
required: true,
  }
});
export const Message = mongoose.model('Message', MessageSchema);
