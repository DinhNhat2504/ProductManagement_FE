import React, { useState, useEffect, useRef,useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);
  const { userId } = useContext(AuthContext); // Giả sử lấy userId từ context hoặc hardcode, thay bằng AuthContext sau

  // Gọi API chatbot
  const fetchChatResponse = async (userMessage) => {
    try {
      const response = await fetch('https://localhost:7278/Chatbot/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          message: userMessage,
          userId: userId || 0,
        }),
      });
      if (!response.ok) throw new Error('Lỗi khi gọi API chatbot');
      const data = await response.json();
      
      // Trích xuất text từ JSON thô trong reply
      const parsedReply = JSON.parse(data.reply);
      const botMessage = parsedReply.candidates[0].content.parts[0].text;
      return botMessage;
    } catch (error) {
      console.error('Lỗi khi lấy phản hồi từ chatbot:', error);
      return 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!';
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Thêm tin nhắn người dùng
    const userMessage = { text: input, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Gọi API và thêm phản hồi bot
    const botResponse = await fetchChatResponse(input);
    const botMessage = { text: botResponse, sender: 'bot', time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, botMessage]);

    // Cuộn xuống cuối chat
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  };

  // Xử lý Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <>
      {/* Nút mở chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none flex items-center justify-center z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M12 6h.01M12 18h.01"
          />
        </svg>
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trợ lý AI</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              ×
            </button>
          </div>
          <div
            ref={chatContainerRef}
            className="h-80 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;