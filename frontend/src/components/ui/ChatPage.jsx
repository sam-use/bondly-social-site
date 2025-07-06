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
        const res = await axios.get("https://instagram-clone-backend-nqcw.onrender.com/api/v1/user/all", {
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
        const res = await axios.get(`https://instagram-clone-backend-nqcw.onrender.com/api/v1/message/get/${selectedUser._id}`, {
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
    setIsMobileChatOpen(true); // Open chat on mobile
    console.log("Mobile chat opened for:", sUser.username); // Debug log
  };

  // Handle back button on mobile
  const handleBackToUsers = () => {
    setIsMobileChatOpen(false);
    dispatch(setSelectedUser(null));
    console.log("Back to users clicked"); // Debug log
  };

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="chatpage-container">
      {/* Debug info */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px', zIndex: 9999 }}>
        Mobile: {isMobile ? 'Yes' : 'No'} | Chat Open: {isMobileChatOpen ? 'Yes' : 'No'} | Selected: {selectedUser?.username || 'None'}
      </div>

      {/* Mobile Chat View */}
      {isMobile && isMobileChatOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Mobile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            borderBottom: '1px solid #e6e6e6',
            background: '#fff',
            flexShrink: 0
          }}>
            <button onClick={handleBackToUsers} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333'
            }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
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
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{selectedUser.username}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>{selectedUser.isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>

          {/* Mobile Chat messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#fff'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '32px' }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                return (
                  <div
                    key={index}
                    style={{
                      maxWidth: '70%',
                      padding: '12px 18px',
                      borderRadius: '22px',
                      fontSize: '1rem',
                      wordBreak: 'break-word',
                      marginBottom: '2px',
                      alignSelf: isOwn ? 'flex-end' : 'flex-start',
                      background: isOwn ? '#3797f0' : '#f0f0f0',
                      color: isOwn ? '#fff' : '#222',
                      borderBottomRightRadius: isOwn ? '6px' : '22px',
                      borderBottomLeftRadius: isOwn ? '22px' : '6px'
                    }}
                  >
                    {msg.text || msg.message}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Mobile Input - Using inline styles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderTop: '1px solid #e6e6e6',
            backgroundColor: '#fff',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1,
                border: '1px solid #e6e6e6',
                borderRadius: '20px',
                padding: '10px 16px',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fafafa',
                minHeight: '40px'
              }}
            />
            <button 
              onClick={sendMessage}
              style={{
                background: '#3797f0',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Users List View */}
      {(!isMobile || !isMobileChatOpen) && (
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
