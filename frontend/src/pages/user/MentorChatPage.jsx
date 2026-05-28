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
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-32 flex flex-col">
      <div className="flex-grow flex flex-col mx-auto w-full max-w-7xl p-6 h-[calc(100vh-80px)]">
        {/* Chat Box */}
        <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-blue-600 rounded-tr-sm text-white shadow-lg shadow-blue-200"
                      : "bg-white rounded-tl-sm text-slate-700 border border-slate-100 shadow-sm"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-white text-slate-400 border border-slate-100 shadow-sm flex items-center space-x-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-end shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent p-4 outline-none resize-none text-slate-900 max-h-32"
            rows="1"
            placeholder="Đặt câu hỏi cho AI Mentor..."
          ></textarea>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="m-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl p-3 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
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
  );
};

export default MentorChatPage;
