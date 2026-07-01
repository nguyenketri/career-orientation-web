import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import {
  sendChatMessage,
  getChatSessions,
  getSessionMessages,
} from "../../services/mentorService";
import { getUser } from "../../utils/auth";

const MentorChatPage = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const suggestions = [
    {
      icon: "🎓",
      title: "Tìm trường top ngành IT",
      desc: "Khám phá các đại học hàng đầu với lộ trình rõ ràng.",
    },
    {
      icon: "🧠",
      title: "Trắc nghiệm tính cách",
      desc: "Hiểu rõ bản thân để chọn nghề phù hợp nhất.",
    },
    {
      icon: "💰",
      title: "So sánh học phí các trường",
      desc: "Cập nhật bảng học phí mới nhất theo ngành học.",
    },
    {
      icon: "✈️",
      title: "Tư vấn du học nước ngoài",
      desc: "Lộ trình và điều kiện du học các nước phổ biến.",
    },
  ];

  const handleNewChat = useCallback(() => {
    setSessionId(uuidv4());
    setMessages([]);
    setInput("");
    setImagePreview(null);
    setIsSidebarOpen(false);
  }, []);

  const handleSwitchSession = (id) => {
    setSessionId(id);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const fetchSessions = useCallback(async () => {
    try {
      const response = await getChatSessions();
      const data = response.data || [];
      const filtered = data.filter((conv, idx) => {
        if (conv.title && conv.title !== "New Chat") return true;
        return idx === data.findIndex((c) => !c.title || c.title === "New Chat");
      });
      setConversations(filtered);
      setSessionId((prev) => {
        if (prev) return prev;
        return data.length > 0 ? data[0].sessionId : null;
      });
      if (data.length === 0) handleNewChat();
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  }, [handleNewChat]);

  const loadMessages = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await getSessionMessages(id);
      setMessages(response.data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessionId) loadMessages(sessionId);
  }, [sessionId, loadMessages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 128) + "px";
  }, [input]);

  const compressImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = url;
    });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 15MB.");
      e.target.value = "";
      return;
    }
    const compressed = await compressImage(file);
    setImagePreview(compressed);
    e.target.value = "";
  };

  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ tính năng Voice. Hãy dùng Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      setInput((prev) => prev + e.results[0][0].transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSend = async (text = input) => {
    const msgText = typeof text === "string" ? text : input;
    if (!msgText.trim() && !imagePreview) return;
    if (!sessionId) return;

    const userText = msgText.trim();
    const imgData = imagePreview;
    setInput("");
    setImagePreview(null);

    const isFirst = messages.length === 0;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText, image: imgData || undefined },
    ]);
    setLoading(true);
    setTimeout(scrollToBottom, 100);

    try {
      const response = await sendChatMessage(sessionId, userText, imgData);
      if (response?.data) {
        const history = response.data.history;
        if (history?.length > 0) {
          const last = history[history.length - 1];
          setMessages((prev) => [
            ...prev,
            { role: "model", content: last.content },
          ]);
          setTimeout(scrollToBottom, 100);
        }
        if (isFirst) fetchSessions();
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || "";
      const isQuota =
        serverMsg.includes("Daily question limit reached") ||
        err.message?.includes("Daily question limit reached") ||
        err.response?.data?.code === "QUOTA_EXCEEDED";
      const is413 = err.response?.status === 413;
      const errorContent = isQuota
        ? "Bạn đã hết lượt chat hôm nay. Hãy đăng ký gói nâng cấp để có thêm lượt! 🚀"
        : is413
          ? "Ảnh quá lớn để gửi. Vui lòng chọn ảnh nhỏ hơn hoặc chụp màn hình rồi thử lại."
          : serverMsg
            ? serverMsg
            : "Lỗi kết nối đến máy chủ AI, vui lòng thử lại sau.";
      setMessages((prev) => [...prev, { role: "model", content: errorContent }]);
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

  const getSessionIcon = (title) => {
    if (!title) return "💬";
    const t = title.toLowerCase();
    if (t.includes("it") || t.includes("cntt") || t.includes("công nghệ") || t.includes("lập trình")) return "💻";
    if (t.includes("y dược") || t.includes("y học") || t.includes("y tế")) return "🏥";
    if (t.includes("kinh tế") || t.includes("kinh doanh") || t.includes("tài chính")) return "📊";
    if (t.includes("du học") || t.includes("nước ngoài") || t.includes("quốc tế")) return "✈️";
    if (t.includes("marketing") || t.includes("truyền thông")) return "📢";
    if (t.includes("học phí") || t.includes("học bổng") || t.includes("chi phí")) return "💰";
    if (t.includes("hồ sơ") || t.includes("tuyển sinh")) return "📄";
    return "💬";
  };

  const firstName = user?.name?.split(" ").pop() || "bạn";
  const userInitial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden mt-16">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-50 w-64 flex flex-col
          bg-[#0f172a] text-white transition-transform duration-300
          lg:relative lg:top-auto lg:bottom-auto lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center font-black text-sm">
              Z
            </div>
            <span className="font-black text-[15px] tracking-tight">caZup AI</span>
          </div>
          <p className="text-[9px] text-white/35 font-bold tracking-[0.18em] uppercase pl-9 mt-0.5">
            AI Career Mentor
          </p>
        </div>

        {/* New Chat */}
        <div className="px-4 py-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/15"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo mới đoạn chat
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2" style={{ scrollbarWidth: "none" }}>
          <p className="px-2 py-2 text-[9px] font-black text-white/30 uppercase tracking-[0.18em]">
            Lịch sử hội thoại
          </p>

          {sessionId && !conversations.some((c) => c.sessionId === sessionId) && (
            <button
              onClick={() => handleSwitchSession(sessionId)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 bg-orange-500 text-white"
            >
              <span className="shrink-0">💬</span>
              <span className="truncate">Cuộc hội thoại mới</span>
            </button>
          )}

          {conversations
            .filter((c) => c.sessionId)
            .map((conv) => (
              <button
                key={conv.sessionId}
                onClick={() => handleSwitchSession(conv.sessionId)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
                  sessionId === conv.sessionId
                    ? "bg-orange-500 text-white"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="shrink-0">{getSessionIcon(conv.title)}</span>
                <span className="truncate flex-1">
                  {conv.title || "Cuộc hội thoại mới"}
                </span>
              </button>
            ))}
        </div>

        {/* Bottom: settings + user */}
        <div className="border-t border-white/10 px-4 py-3 space-y-2">
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/55 hover:bg-white/10 hover:text-white transition-all"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.name || "Người dùng"}
              </p>
              <p className="text-[10px] text-white/40">
                Student · {user?.subscriptionPlan || "FREE"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden min-w-0">
        {/* Header */}
        <div className="h-14 shrink-0 border-b border-slate-100 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-bold text-slate-700">AI Mentor Session</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-lg transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Go Premium
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  Xin chào {firstName}!
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Tôi là caZup AI Mentor. Bạn cần hỗ trợ gì về định hướng nghề nghiệp hay tìm kiếm trường học hôm nay?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.title)}
                    className="text-left p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{s.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 mb-0.5 leading-snug">{s.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black ${
                      msg.role === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-[#0f172a] text-white"
                    }`}
                  >
                    {msg.role === "user" ? userInitial : "Z"}
                  </div>
                  <div className={`max-w-[78%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Đính kèm"
                        className="rounded-2xl max-h-56 max-w-full object-contain border border-slate-200 shadow-sm"
                      />
                    )}
                    {msg.content && (
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#1e293b] text-white rounded-tr-sm"
                            : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white text-sm font-black shrink-0">
                    Z
                  </div>
                  <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2 bg-white shrink-0 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            {/* Image preview */}
            {imagePreview && (
              <div className="relative inline-block mb-2 ml-1">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-14 w-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-700 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input box */}
            <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 focus-within:border-slate-300 focus-within:shadow-sm transition-all">
              {/* Left toolbar */}
              <div className="flex items-center gap-0.5 pb-1 shrink-0">
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Đính kèm tệp"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Gửi hình ảnh để AI phân tích"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                <button
                  onClick={handleVoice}
                  title={isListening ? "Dừng ghi âm" : "Nói để nhập"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListening
                      ? "bg-red-100 text-red-600"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {isListening ? "Đang nghe..." : "Voice"}
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi caZup AI về bất cứ điều gì..."
                className="flex-1 bg-transparent outline-none resize-none text-slate-900 text-sm placeholder-slate-400 max-h-32 py-1.5 leading-relaxed"
                rows={1}
              />

              {/* Send */}
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !imagePreview)}
                className="w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm mb-0.5"
              >
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-2">
              Tất cả dữ liệu mang tính chất tham khảo quan. Hãy cẩn nhắc kỹ trước khi quyết định.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorChatPage;
