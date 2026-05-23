import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  sendChatMessage,
  getSessionMessages,
} from "../../services/mentorService";

const MentorChatPage = () => {
  const [sessionId, setSessionId] = useState(() => uuidv4());

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
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Lỗi kết nối đến máy chủ AI, vui lòng thử lại sau.",
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
    <div className="min-h-screen bg-black text-white pt-20 flex flex-col">
      <div className="flex-grow flex flex-col mx-auto w-full max-w-4xl p-6 h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="pb-6 border-b border-white/10 mb-6 flex flex-col items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r text-transparent bg-clip-text pb-1 from-purple-400 to-indigo-500">
            caZup Mentor AI
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Hỏi bất cứ điều gì về hướng nghiệp & tuyển sinh
          </p>
        </div>

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
                      ? "bg-purple-600 rounded-tr-sm text-white shadow-lg shadow-purple-500/20"
                      : "bg-white/10 rounded-tl-sm text-gray-200 border border-white/5"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-white/10 text-gray-400 border border-white/5 flex items-center space-x-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end shadow-2xl backdrop-blur-md">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent p-4 outline-none resize-none text-white max-h-32"
            rows="1"
            placeholder="Đặt câu hỏi cho AI Mentor..."
          ></textarea>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="m-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl p-3 flex-shrink-0"
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
