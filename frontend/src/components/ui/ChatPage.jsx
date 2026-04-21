import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { setSelectedUser } from "@/redux/authSlice";
import axiosInstance from "@/lib/axiosInstance";
import { getSocketInstance } from "@/lib/socketInstance";
import { ArrowLeft, Send, MessageCircle, Sparkles, X, Mic, Square } from "lucide-react";
import { useSpeechRecognition, SPEECH_LANG_OPTIONS } from "@/hooks/useSpeechRecognition";
import "./Chatpage.css";
import "./VoiceInput.css";

const fallbackAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;

const AI_MODES = [
  { key: "flirty", label: "Flirty" },
  { key: "funny", label: "Funny" },
  { key: "polite", label: "Polite" },
  { key: "continue", label: "Continue" },
  { key: "grammar", label: "Fix Grammar" },
];

const ChatPage = () => {
  const dispatch = useDispatch();
  const { user, selectedUser } = useSelector((state) => state.auth);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [selectedMode, setSelectedMode] = useState("flirty");
  const messagesEndRef = useRef(null);

  const getChatBaseText = useCallback(() => message, [message]);
  const onChatSpeechText = useCallback((text) => setMessage(text), []);

  const chatSpeech = useSpeechRecognition({
    getBaseText: getChatBaseText,
    onTextUpdate: onChatSpeechText,
    silenceMs: 3000,
  });

  // Fetch all users for chat
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axiosInstance.get("/user/all");
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
        const res = await axiosInstance.get(`/message/get/${selectedUser._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setMessages([]); 
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

  const generateAiReply = async (mode) => {
    if (!selectedUser) return;
    setIsAiLoading(true);
    setAiError("");
    setSelectedMode(mode);

    try {
      const payload = {
        mode,
        draft: message,
        recipientName: selectedUser.username,
        conversation: messages.map((msg) => ({
          isOwn: msg.senderId === user?._id || msg.senderId?._id === user?._id,
          text: msg.text || msg.message || "",
        })),
      };

      const res = await axiosInstance.post("/ai/chat-reply", payload);
      if (res.data?.success && res.data?.suggestion) {
        setAiSuggestion(res.data.suggestion);
        setIsAiPanelOpen(true);
      } else {
        setAiError("Couldn't generate AI reply. Try again.");
      }
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to generate AI reply");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUserSelect = (sUser) => {
    dispatch(setSelectedUser(sUser));
    setMessages([]);
    setAiSuggestion("");
    setAiError("");
    setIsAiPanelOpen(false);
    if (window.innerWidth <= 768) {
      setIsMobileChatOpen(true);
    }
  };

  const handleBackToUsers = () => {
    setIsMobileChatOpen(false);
    dispatch(setSelectedUser(null));
    setAiSuggestion("");
    setAiError("");
    setIsAiPanelOpen(false);
  };

  const handleUseSuggestion = () => {
    if (!aiSuggestion.trim()) return;
    setMessage(aiSuggestion);
    setIsAiPanelOpen(false);
  };

  const modeDisabled = (modeKey) => isAiLoading || (modeKey === "grammar" && !message.trim());
  const filteredSuggestedUsers = suggestedUsers.filter((u) =>
    (u.username || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="chatpage-container">
      {/* Mobile Chat View */}
      {isMobileChatOpen && selectedUser && (
        <div className="mobile-chat-view">
          <div className="mobile-chat-header">
            <button onClick={handleBackToUsers} className="back-btn">
              <ArrowLeft size={20} />
            </button>
            <div className="mobile-chat-user-info">
              <Avatar style={{width: 32, height: 32}}>
                <AvatarImage src={selectedUser.profilePicture || fallbackAvatar(selectedUser.username)} />
                <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
              </Avatar>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span className="username" style={{fontSize: 14, fontWeight: 600}}>{selectedUser.username}</span>
                <span className="status" style={{fontSize: 12, color: 'var(--text-secondary)'}}>{selectedUser.isOnline ? "Active now" : "Offline"}</span>
              </div>
            </div>
          </div>

          <div className="mobile-chat-messages">
            {messages.length === 0 ? (
              <div style={{textAlign: 'center', marginTop: 40, color: 'var(--text-secondary)'}}>
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

          <div className="mobile-chat-input-container">
            <button onClick={() => setIsAiPanelOpen((prev) => !prev)} className="ai-reply-toggle">
              <Sparkles size={14} />
              <span>AI Reply</span>
            </button>
            {isAiPanelOpen && (
              <div className="ai-panel">
                <div className="ai-panel-top">
                  <p>Choose a style</p>
                  <button className="ai-close-btn" onClick={() => setIsAiPanelOpen(false)}>
                    <X size={14} />
                  </button>
                </div>
                <div className="ai-actions">
                  {AI_MODES.map((mode) => (
                    <button
                      key={mode.key}
                      onClick={() => generateAiReply(mode.key)}
                      className={`ai-action-btn ${selectedMode === mode.key ? "active" : ""}`}
                      disabled={modeDisabled(mode.key)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                {isAiLoading && <p className="ai-loading">Generating suggestion...</p>}
                {aiSuggestion && !isAiLoading && <p className="ai-suggestion">{aiSuggestion}</p>}
                <div className="ai-panel-actions">
                  <button
                    className="ai-secondary-btn"
                    onClick={() => generateAiReply(selectedMode)}
                    disabled={modeDisabled(selectedMode)}
                  >
                    Regenerate
                  </button>
                  <button className="ai-primary-btn" onClick={handleUseSuggestion} disabled={!aiSuggestion}>
                    Use Suggestion
                  </button>
                </div>
              </div>
            )}
            {aiError && <p className="ai-error">{aiError}</p>}
            <div className="voice-input-toolbar">
              {chatSpeech.isSupported && (
                <select
                  className="voice-lang-select"
                  value={chatSpeech.lang}
                  onChange={(e) => chatSpeech.setLang(e.target.value)}
                  disabled={chatSpeech.isListening}
                  aria-label="Speech language"
                >
                  {SPEECH_LANG_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="voice-input-row">
                {chatSpeech.isSupported && (
                  <>
                    <button
                      type="button"
                      className={`voice-mic-btn ${chatSpeech.isListening ? "listening" : ""}`}
                      onClick={chatSpeech.toggle}
                      disabled={!selectedUser}
                      title={chatSpeech.isListening ? "Stop voice input" : "Start voice input"}
                      aria-label="Voice input"
                    >
                      <Mic size={20} />
                    </button>
                    <button
                      type="button"
                      className="voice-stop-btn"
                      onClick={chatSpeech.stop}
                      disabled={!chatSpeech.isListening}
                      title="Stop"
                      aria-label="Stop recording"
                    >
                      <Square size={14} fill="currentColor" />
                    </button>
                    <button
                      type="button"
                      className="voice-clear-btn"
                      onClick={() => {
                        chatSpeech.stop();
                        setMessage("");
                      }}
                      disabled={!message}
                    >
                      Clear
                    </button>
                  </>
                )}
                <input
                  type="text"
                  placeholder="Message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="mobile-chat-input voice-grow"
                />
                <button onClick={sendMessage} className="mobile-send-btn" disabled={!message.trim()}>
                  <Send size={18} />
                </button>
              </div>
              {chatSpeech.isListening && (
                <p className="voice-listening-hint">
                  <span className="voice-pulse-dot" />
                  Listening… speak now
                </p>
              )}
              {!chatSpeech.isSupported && (
                <p className="voice-unsupported-msg">
                  Voice input is not supported in this browser. Try Chrome or Edge.
                </p>
              )}
              {chatSpeech.lastError && (
                <p className="voice-error-msg">{chatSpeech.lastError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop/Tablet List View */}
      {!isMobileChatOpen && (
        <div className="users-list-view">
          <div className="chatpage-sidebar">
            <div style={{padding: '24px 24px 12px', display: 'flex', alignItems: 'center'}}>
              <h2 style={{margin: 0, padding: 0, border: 'none'}}>{user?.username}</h2>
            </div>
            <div style={{padding: '0 24px 12px', fontWeight: 600}}>Messages</div>
            <div className="chat-search-wrap">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="chat-search-input"
              />
            </div>
            <div style={{overflowY: 'auto', flex: 1}}>
              {filteredSuggestedUsers.map((sUser) => (
                <div
                  key={sUser._id}
                  onClick={() => handleUserSelect(sUser)}
                  className="chatpage-user"
                  style={{ backgroundColor: selectedUser?._id === sUser._id ? '#efefef' : 'transparent' }}
                >
                  <Avatar style={{width: 56, height: 56}}>
                    <AvatarImage src={sUser.profilePicture || fallbackAvatar(sUser.username)} />
                    <AvatarFallback>{sUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="username" style={{margin: 0}}>{sUser.username}</p>
                    <p className="status" style={{margin: 0}}>{sUser.isOnline ? "Active now" : "Offline"}</p>
                  </div>
                </div>
              ))}
              {!filteredSuggestedUsers.length && (
                <p className="chat-no-search-results">No users found.</p>
              )}
            </div>
          </div>

          <div className="chatpage-main">
            {selectedUser ? (
              <>
                <div className="chatpage-header">
                  <Avatar style={{width: 44, height: 44}}>
                    <AvatarImage src={selectedUser.profilePicture || fallbackAvatar(selectedUser.username)} />
                    <AvatarFallback>{selectedUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <span className="username">{selectedUser.username}</span>
                    <span className="status">{selectedUser.isOnline ? "Active now" : "Offline"}</span>
                  </div>
                </div>

                <div className="chatpage-messages">
                  {messages.length === 0 ? (
                    <div className="no-chat-selected" style={{marginTop: 40}}>
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

                <div className="chatpage-input-area">
                  <div className="ai-assistant-row">
                    <button onClick={() => setIsAiPanelOpen((prev) => !prev)} className="ai-reply-toggle">
                      <Sparkles size={14} />
                      <span>AI Reply</span>
                    </button>
                  </div>
                  {isAiPanelOpen && (
                    <div className="ai-panel">
                      <div className="ai-panel-top">
                        <p>Choose a style</p>
                        <button className="ai-close-btn" onClick={() => setIsAiPanelOpen(false)}>
                          <X size={14} />
                        </button>
                      </div>
                      <div className="ai-actions">
                        {AI_MODES.map((mode) => (
                          <button
                            key={mode.key}
                            onClick={() => generateAiReply(mode.key)}
                            className={`ai-action-btn ${selectedMode === mode.key ? "active" : ""}`}
                            disabled={modeDisabled(mode.key)}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      {isAiLoading && <p className="ai-loading">Generating suggestion...</p>}
                      {aiSuggestion && !isAiLoading && <p className="ai-suggestion">{aiSuggestion}</p>}
                      <div className="ai-panel-actions">
                        <button
                          className="ai-secondary-btn"
                          onClick={() => generateAiReply(selectedMode)}
                          disabled={modeDisabled(selectedMode)}
                        >
                          Regenerate
                        </button>
                        <button className="ai-primary-btn" onClick={handleUseSuggestion} disabled={!aiSuggestion}>
                          Use Suggestion
                        </button>
                      </div>
                    </div>
                  )}
                  {aiError && <p className="ai-error">{aiError}</p>}
                  <div className="voice-input-toolbar">
                    {chatSpeech.isSupported && (
                      <select
                        className="voice-lang-select"
                        value={chatSpeech.lang}
                        onChange={(e) => chatSpeech.setLang(e.target.value)}
                        disabled={chatSpeech.isListening}
                        aria-label="Speech language"
                      >
                        {SPEECH_LANG_OPTIONS.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="voice-input-row">
                      {chatSpeech.isSupported && (
                        <>
                          <button
                            type="button"
                            className={`voice-mic-btn ${chatSpeech.isListening ? "listening" : ""}`}
                            onClick={chatSpeech.toggle}
                            title={chatSpeech.isListening ? "Stop voice input" : "Start voice input"}
                            aria-label="Voice input"
                          >
                            <Mic size={20} />
                          </button>
                          <button
                            type="button"
                            className="voice-stop-btn"
                            onClick={chatSpeech.stop}
                            disabled={!chatSpeech.isListening}
                            title="Stop"
                            aria-label="Stop recording"
                          >
                            <Square size={14} fill="currentColor" />
                          </button>
                          <button
                            type="button"
                            className="voice-clear-btn"
                            onClick={() => {
                              chatSpeech.stop();
                              setMessage("");
                            }}
                            disabled={!message}
                          >
                            Clear
                          </button>
                        </>
                      )}
                      <input
                        type="text"
                        placeholder={isAiLoading ? "Generating AI reply..." : "Message..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="voice-grow"
                      />
                      <button onClick={sendMessage} disabled={!message.trim()}>
                        Send
                      </button>
                    </div>
                    {chatSpeech.isListening && (
                      <p className="voice-listening-hint">
                        <span className="voice-pulse-dot" />
                        Listening… speak now
                      </p>
                    )}
                    {!chatSpeech.isSupported && (
                      <p className="voice-unsupported-msg">
                        Voice input is not supported in this browser. Try Chrome or Edge.
                      </p>
                    )}
                    {chatSpeech.lastError && (
                      <p className="voice-error-msg">{chatSpeech.lastError}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <MessageCircle size={64} style={{fontWeight: 100, marginBottom: 16}} />
                  <h2 style={{fontSize: 20, fontWeight: 400, color: 'var(--text-main)', marginBottom: 8}}>Your Messages</h2>
                  <p>Send private photos and messages to a friend.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
