import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce'; // Đã cài: npm i lodash

const ChatMessages = ({ chatRoomId, userId, connection, isAdmin }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false); // Ngăn gửi nhiều lần
  const messagesEndRef = useRef(null);

  // Lấy tin nhắn ban đầu
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://localhost:7278/Chat/messages/${chatRoomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        const msgs = await response.json();
        setMessages(msgs);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    if (chatRoomId) fetchMessages();
  }, [chatRoomId]);

  // Join room và lắng nghe tin nhắn realtime
  useEffect(() => {
    if (connection && chatRoomId) {
      // Join room
      const joinRoom = async () => {
        try {
          await connection.invoke('JoinRoom', chatRoomId);
          console.log(`Joined room ${chatRoomId}`);
        } catch (err) {
          console.error('Error joining room:', err);
        }
      };
      joinRoom();

      // Lắng nghe tin nhắn realtime
      const handleReceiveMessage = (senderId, content, sentAt) => {
        console.log('Received message:', { senderId, content, sentAt }); // Debug
        if (chatRoomId) {
          const validSentAt = new Date(sentAt).toISOString() || new Date().toISOString();
          setMessages((prev) => {
            const isDuplicate = prev.some(
              (msg) => msg.content === content && msg.sentAt === validSentAt
            );
            if (!isDuplicate) {
              return [...prev, { senderId, content, sentAt: validSentAt, isRead: false }];
            }
            return prev;
          });
        }
      };

      connection.on('ReceiveMessage', handleReceiveMessage);

      return () => {
        connection.off('ReceiveMessage', handleReceiveMessage);
      };
    }
  }, [connection, chatRoomId]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Đánh dấu tin nhắn đã đọc
  useEffect(() => {
    const markAsRead = async () => {
      for (const msg of messages) {
        if (!msg.isRead && msg.senderId !== userId) {
          try {
            await fetch(`https://localhost:7278/Chat/read/${msg.messageId}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
          } catch (err) {
            console.error('Error marking message as read:', err);
          }
        }
      }
    };

    markAsRead();
  }, [messages, userId]);

  // Gửi tin nhắn với debounce và kiểm tra trạng thái
  const handleSendMessage = debounce(async () => {
  if (!newMessage.trim() || !connection || isSending) return;

  setIsSending(true);
  const sentAt = new Date().toISOString();
  try {
    const response = await fetch('https://localhost:7278/Chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        chatRoomId,
        senderId: userId,
        content: newMessage,
        sentAt,
        isRead: false,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    // KHÔNG tự thêm tin nhắn vào state, chỉ chờ sự kiện ReceiveMessage từ SignalR
    setNewMessage('');
  } catch (err) {
    console.error('Error sending message:', err.message, err.stack);
  } finally {
    setIsSending(false);
  }
}, 1000); // Giữ debounce 1000ms

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Khu vực tin nhắn với cuộn */}
      <div
        className="p-4 overflow-y-auto"
        style={{ maxHeight: isAdmin ? 'calc(70vh - 100px)' : 'calc(50vh - 100px)' }}
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có tin nhắn</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.messageId || msg.sentAt}
              className={`mb-4 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm font-medium">
                  {msg.senderId === userId ? 'Bạn' : 'Hỗ trợ'}
                </p>
                <p>{msg.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(msg.sentAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Form gửi tin nhắn */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending} // Ngăn double-click
            className={`ml-2 p-2 rounded-lg transition duration-150 ${
              isSending
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;