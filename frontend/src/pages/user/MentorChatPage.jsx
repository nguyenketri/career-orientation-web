import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendChatMessage } from "../../services/mentorService";

const MentorChatPage = () => {
  const [sessionId] = useState(() => uuidv4());

  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Chào bạn! Mình là caZup Mentor - Chuyên gia Hướng Nghiệp AI của bạn. Mình sẵn sàng giúp bạn giải đáp mọi thắc mắc về định hướng nghề nghiệp, ngành học và lựa chọn trường. Bạn cần hỗ trợ gì hôm nay nào? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistic UI updates
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(sessionId, userMessage);

      if (response && response.data) {
        // Có thể lấy thẳng message cuối cùng từ history thay vì lặp qua
        const chatHistory = response.data.history;
        const lastMessage = chatHistory[chatHistory.length - 1];
        setMessages((prev) => [
          ...prev,
          { role: "model", content: lastMessage.content },
        ]);
      }
    } catch (error) {
      console.error(error);

      // Check if error is due to quota limit
      const isQuotaExceeded =
        error.response?.data?.message?.includes(
          "Daily question limit reached",
        ) || error.message?.includes("Daily question limit reached");

      const errorMessage = isQuotaExceeded
        ? `Bạn đã hết lượt chat hôm nay. Hãy đăng ký gói nâng cấp để có thêm lượt chat, hoặc hãy quay lại vào ngày mai! 😊`
        : "Lỗi kết nối đến máy chủ AI, vui lòng thử lại sau.";

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: errorMessage,
        },
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
    <div className="h-screen bg-slate-50 text-slate-900 pt-32 pb-6 px-6 overflow-hidden">
      <div className="mx-auto w-full max-w-5xl h-[calc(100vh-150px)] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800">caZup AI Mentor</h2>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Đang trực tuyến
              </p>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-blue-600 rounded-tr-sm text-white shadow-md"
                      : "bg-white rounded-tl-sm text-slate-700 border border-slate-200 shadow-sm"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-white text-slate-400 border border-slate-200 shadow-sm flex items-center space-x-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-end gap-2 bg-slate-100 rounded-2xl p-2 focus-within:ring-2 ring-blue-500/20 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow bg-transparent p-3 outline-none resize-none text-slate-900 max-h-32"
              rows="1"
              placeholder="Đặt câu hỏi cho AI Mentor..."
            ></textarea>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="m-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl p-3 text-white shadow-lg shadow-blue-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorChatPage;
