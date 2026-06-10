import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  sendChatMessage,
  getChatSessions,
  getSessionMessages,
} from "../../services/mentorService";

const MentorChatPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = [
    {
      icon: "🎓",
      title: "Ngành CNTT học trường nào tốt nhất?",
      desc: "Gợi ý top 5 trường đại học dẫn đầu",
    },
    {
      icon: "💵",
      title: "Học phí ngành Y năm nay thế nào?",
      desc: "Cập nhật bảng giá mới nhất 2024",
    },
    {
      icon: "💡",
      title: "Tôi hợp với ngành nào nếu giỏi Toán?",
      desc: "Phân tích xu hướng nghề nghiệp cá nhân",
    },
    {
      icon: "📄",
      title: "Cần chuẩn bị gì cho hồ sơ du học?",
      desc: "Danh sách kiểm tra và thủ tục chi tiết",
    },
  ];

  const handleNewChat = useCallback(() => {
    const newId = uuidv4();
    setSessionId(newId);
    setMessages([]);
  }, []);

  const handleSwitchSession = (id) => {
    setSessionId(id);
    setMessages([]); // Clear messages when switching
  };

  const fetchSessions = useCallback(async () => {
    try {
      const response = await getChatSessions();
      const data = response.data || [];

      // Filter out duplicate "New Chat" sessions, keeping only the most recent one
      const filteredData = data.filter((conv, index) => {
        if (conv.title && conv.title !== "New Chat") return true;
        return (
          index === data.findIndex((c) => !c.title || c.title === "New Chat")
        );
      });

      setConversations(filteredData);

      setSessionId((prevSessionId) => {
        if (prevSessionId) return prevSessionId;
        return data.length > 0 ? data[0].sessionId : null;
      });

      if (data.length === 0) {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  }, [handleNewChat]);

  const loadMessages = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await getSessionMessages(id);
      const data = response.data || [];
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    (async () => {
      await fetchSessions();
    })();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessionId) {
      (async () => {
        await loadMessages(sessionId);
      })();
    }
  }, [sessionId, loadMessages]);

  const handleSend = async (text = input) => {
    const messageText = typeof text === "string" ? text : input;
    if (!messageText.trim() || !sessionId) return;

    const userMessage = messageText.trim();
    setInput("");

    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setTimeout(scrollToBottom, 100);

    try {
      const response = await sendChatMessage(sessionId, userMessage);
      // Fix: response is already the data object from axiosClient,
      // and the controller returns { status: "success", data: { response, history } }
      if (response && response.data) {
        const chatHistory = response.data.history;
        if (chatHistory && chatHistory.length > 0) {
          const lastMessage = chatHistory[chatHistory.length - 1];
          setMessages((prev) => [
            ...prev,
            { role: "model", content: lastMessage.content },
          ]);
          setTimeout(scrollToBottom, 100);
        }

        // Refresh sessions if it was the first message to get the new title
        if (isFirstMessage) {
          fetchSessions();
        }
      }
    } catch (error) {
      console.error(error);
      const isQuotaExceeded =
        error.response?.data?.message?.includes(
          "Daily question limit reached",
        ) || error.message?.includes("Daily question limit reached");

      const errorMessage = isQuotaExceeded
        ? `Bạn đã hết lượt chat hôm nay. Hãy đăng ký gói nâng cấp để có thêm lượt chat!`
        : "Lỗi kết nối đến máy chủ AI, vui lòng thử lại sau.";

      setMessages((prev) => [
        ...prev,
        { role: "model", content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-white overflow-hidden mt-16 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#f8fafc] border-r border-slate-200 flex flex-col h-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-white text-[#0f172a] border-2 border-[#0f172a] rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 hover:bg-[#0f172a] hover:text-white transition-all shadow-sm"
          >
            <span className="text-xl">+</span> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <p className="px-3 py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            GẦN ĐÂY
          </p>
          {/* Show current session if it's a new one not yet in the list */}
          {sessionId &&
            !conversations.some((c) => c.sessionId === sessionId) && (
              <button
                onClick={() => handleSwitchSession(sessionId)}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 bg-white text-[#0f172a] shadow-md shadow-slate-200/50 border border-slate-100"
              >
                <span className="text-lg">💬</span>
                <span className="truncate flex-1">Cuộc hội thoại mới</span>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              </button>
            )}

          {conversations
            .filter((conv) => conv.sessionId)
            .map((conv) => (
              <button
                key={conv.sessionId}
                onClick={() => handleSwitchSession(conv.sessionId)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 group ${
                  sessionId === conv.sessionId
                    ? "bg-white text-[#0f172a] shadow-md shadow-slate-200/50 border border-slate-100"
                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`text-lg ${sessionId === conv.sessionId ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}
                >
                  {conv.title?.includes("FPT")
                    ? "🎓"
                    : conv.title?.includes("AI")
                      ? "🤖"
                      : conv.title?.includes("Tư vấn")
                        ? "📚"
                        : conv.title?.includes("việc")
                          ? "💼"
                          : "💬"}
                </span>
                <span className="truncate flex-1">
                  {conv.title || "Cuộc hội thoại mới"}
                </span>
                {sessionId === conv.sessionId && (
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                )}
              </button>
            ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                🎓
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  Premium Plan
                </p>
                <p className="text-[10px] text-slate-500">
                  Mở khóa cố vấn AI 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-white overflow-hidden">
        {/* Top Header */}
        <div className="h-16 shrink-0 border-b border-slate-100 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-orange-500 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white text-xs">
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Mentor</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Đang sẵn sàng hỗ trợ
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-10">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <span className="text-4xl">✨</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-3">
                  Xin chào! Tôi là AI Mentor
                </h1>
                <p className="text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Tôi có thể giúp bạn định hướng nghề nghiệp, so sánh các trường
                  đại học và tìm hiểu về các lộ trình học tập tối ưu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.title)}
                    className="text-left p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-blue-50 transition-colors">
                      {s.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#0f172a] text-white"
                    }`}
                  >
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-[#f8fafc] text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center text-white flex-shrink-0">
                    🤖
                  </div>
                  <div className="bg-[#f8fafc] p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white shrink-0">
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl shadow-slate-200/50 p-2 focus-within:border-blue-400 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi tôi bất cứ điều gì về giáo dục..."
                className="w-full bg-transparent px-4 py-3 outline-none resize-none text-slate-900 text-sm min-h-[60px] max-h-32"
                rows="1"
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Voice
                  </button>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-200 transition-all"
                >
                  <svg
                    className="w-5 h-5 rotate-90"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3">
              EduPath AI Mentor có thể đưa ra câu trả lời không chính xác. Hãy
              kiểm tra lại thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorChatPage;
