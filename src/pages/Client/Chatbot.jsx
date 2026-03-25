import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const { userId } = useContext(AuthContext);

  // Gọi API chatbot
  const fetchChatResponse = async (userMessage) => {
    try {
      const response = await api.post('/Chatbot/chatbot',
        { message: userMessage, userId: userId || 0 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }
      );
      const data = response.data;

      // Trích xuất text từ JSON thô trong reply
      const parsedReply = JSON.parse(data.reply);
      const botMessage = parsedReply.candidates[0].content.parts[0].text;
      return botMessage;
    } catch (error) {
      console.error('Lỗi khi lấy phản hồi từ chatbot:', error);
      return 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!';
    }
  };

  // Cuộn xuống cuối chat mỗi khi có tin nhắn mới hoặc đang tải
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isOpen]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    const userMessage = { text: currentInput, sender: 'user', time: new Date().toLocaleTimeString() };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponse = await fetchChatResponse(currentInput);
    const botMessage = { text: botResponse, sender: 'bot', time: new Date().toLocaleTimeString() };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
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
        Hỗ trợ
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
                  className={`max-w-[70%] p-2 rounded-lg ${msg.sender === 'user'
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`text-white p-2 rounded-lg focus:outline-none min-w-[60px] ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
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
