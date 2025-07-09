import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { setSelectedUser } from "@/redux/authSlice";
import axios from "axios";
import { getSocketInstance } from "@/lib/socketInstance";
import { ArrowLeft, Send } from "lucide-react";
import "./Chatpage.css";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;

const ChatPage = () => {
  const dispatch = useDispatch();
  const { user, selectedUser } = useSelector((state) => state.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all users for chat
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get("https://bondly-social-site.onrender.com/api/v1/user/all", {
          withCredentials: true,
        });
        if (res.data.success) {
          // Filter out current user and add online status
          const filteredUsers = res.data.users
            .filter(u => u._id !== user?._id)
            .map(u => ({
              ...u,
              isOnline: Math.random() > 0.5 // Temporary random online status
            }));
          setSuggestedUsers(filteredUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users for chat", err);
      }
    };
    fetchAllUsers();
  }, [user?._id]);

  // Fetch message history when user selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(`https://bondly-social-site.onrender.com/api/v1/message/get/${selectedUser._id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setMessages(res.data.messages);
        } else {
          setMessages([]); // No conversation found, so no messages
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setMessages([]); // No conversation yet
        } else {
          console.error("Failed to fetch chat history:", err);
        }
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Real-time receive message
  useEffect(() => {
    const socket = getSocketInstance();
    if (!socket) return;
    const handleReceiveMessage = (msg) => {
      // Only add if it's for the current chat
      if (
        (msg.senderId === selectedUser?._id && msg.receiverId === user?._id) ||
        (msg.senderId === user?._id && msg.receiverId === selectedUser?._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [selectedUser, user?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const socket = getSocketInstance();
      const data = {
        senderId: user?._id,
        receiverId: selectedUser?._id,
        text: message,
      };
      socket.emit("send-message", data);
      setMessage("");
    }
  };

  // Handle user selection on mobile
  const handleUserSelect = (sUser) => {
    dispatch(setSelectedUser(sUser));
    setMessages([]); // Clear old messages before new load
    if (window.innerWidth <= 768) {
      setIsMobileChatOpen(true); // Only open mobile chat on mobile
    }
  };

  // Handle back button on mobile
  const handleBackToUsers = () => {
    setIsMobileChatOpen(false);
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="chatpage-container">
      {/* Mobile Chat View */}
      {isMobileChatOpen && selectedUser && (
        <div className="mobile-chat-view">
          {/* Mobile Header */}
          <div className="mobile-chat-header">
            <button onClick={handleBackToUsers} className="back-btn">
              <ArrowLeft size={20} />
            </button>
            <div className="mobile-chat-user-info">
              <Avatar className="avatar">
                <AvatarImage
                  src={
                    selectedUser.profilePicture?.startsWith("http")
                      ? selectedUser.profilePicture
                      : fallbackAvatar(selectedUser.username)
                  }
                  onError={(e) => (e.target.src = fallbackAvatar(selectedUser.username))}
                />
                <AvatarFallback>{selectedUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="username">{selectedUser.username}</h2>
                <p className="status">{selectedUser.isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>

          {/* Mobile Chat messages */}
          <div className="mobile-chat-messages">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.senderId === user?._id || (msg.senderId && msg.senderId._id === user?._id);
                return (
                  <div
                    key={index}
                    className={`chat-bubble ${isOwn ? "own" : "other"}`}
                  >
                    {msg.text || msg.message}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Mobile Input */}
          <div className="mobile-chat-input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="mobile-chat-input"
            />
            <button onClick={sendMessage} className="mobile-send-btn">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Users List View */}
      {!isMobileChatOpen && (
        <div className="users-list-view">
          <div className="chatpage-sidebar">
            <h2>Suggested Users</h2>
            {suggestedUsers.map((sUser) => (
              <div
                key={sUser._id}
                onClick={() => handleUserSelect(sUser)}
                className="chatpage-user"
              >
                <Avatar className="avatar">
                  <AvatarImage
                    src={
                      sUser.profilePicture?.startsWith("http")
                        ? sUser.profilePicture
                        : fallbackAvatar(sUser.username)
                    }
                    onError={(e) => (e.target.src = fallbackAvatar(sUser.username))}
                  />
                  <AvatarFallback>{sUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="username">{sUser.username}</p>
                  <p className="status">{sUser.isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Chat Section */}
          <div className="chatpage-main">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="chatpage-header">
                  <Avatar className="avatar">
                    <AvatarImage
                      src={
                        selectedUser.profilePicture?.startsWith("http")
                          ? selectedUser.profilePicture
                          : fallbackAvatar(selectedUser.username)
                      }
                      onError={(e) => (e.target.src = fallbackAvatar(selectedUser.username))}
                    />
                    <AvatarFallback>{selectedUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="username">{selectedUser.username}</h2>
                    <p className="status">{selectedUser.isOnline ? "Online" : "Offline"}</p>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="chatpage-messages">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                      return (
                        <div
                          key={index}
                          className={`chat-bubble ${isOwn ? "own" : "other"}`}
                        >
                          {msg.text || msg.message}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef}></div>
                </div>

                {/* Input */}
                <div className="chatpage-input-area">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
