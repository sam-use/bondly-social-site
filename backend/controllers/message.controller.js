import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const sendMessage = async(req,res)=>{
    try{
        const senderId =req.id;
        const recevierId =req.params.id;
        const {message}=req.body;
        let foundConversation = await Conversation.findOne({
            participants:{$all:[senderId,recevierId]}
        });
        if(!foundConversation){
            foundConversation = await Conversation.create({
                participants:[senderId,recevierId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            recevierId,
            message
        });
        if(newMessage) foundConversation.messages.push(newMessage._id);
        await Promise.all([
            foundConversation.save(),
            newMessage.save()
        ])
//implemt socit io

return res.status(201).json({
    success:true,
    newMessage
})

    }catch(error){
        console.error("Error sending message:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

export const getMessage = async(req,res)=>{
    try{
        const senderId = req.id;
        const recevierId = req.params.id;   
        const foundConversation = await Conversation.findOne({
            participants: { $all: [senderId, recevierId] }
        }).populate('messages');
        if (!foundConversation) {
            return res.status(404).json({
                message: "Conversation not found",
                success: false
            });
        }
        return res.status(200).json({
            success: true,
            messages: foundConversation.messages
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}