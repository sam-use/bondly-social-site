// socket/socket.js
import { Server } from 'socket.io';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';

let ioInstance;
const userSocketMap = {};

export const setupSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: [
        "https://bondly-social-site-1.onrender.com",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.handshake.query.userId; // ✅ Original version

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`✅ User ${userId} connected with socket ID: ${socket.id}`);
    }

    ioInstance.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Real-time chat event
    socket.on('send-message', async ({ senderId, receiverId, text }) => {
      try {
        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] }
        });
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [senderId, receiverId]
          });
        }
        const newMessage = await Message.create({
          senderId,
          receiverId,
          message: text,
        });
        conversation.messages.push(newMessage._id);
        await Promise.all([
          conversation.save(),
          newMessage.save()
        ]);

        const messageData = {
          _id: newMessage._id,
          senderId,
          receiverId,
          message: text,
          createdAt: newMessage.createdAt,
        };

        // Emit to receiver if online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          ioInstance.to(receiverSocketId).emit('receive-message', messageData);
        }
        // Emit back to sender for confirmation (sender needs it too)
        socket.emit('message-sent', messageData);
      } catch (error) {
        console.error('Socket send-message error:', error);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        delete userSocketMap[userId];
        console.log(`❌ User ${userId} disconnected`);
      }
      ioInstance.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });
};

export const getIO = () => ioInstance;
