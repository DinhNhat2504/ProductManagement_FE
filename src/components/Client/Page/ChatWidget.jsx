import React, { useState, useEffect, useContext } from 'react';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatMessages from '../../Admin/Main/ChatMessages';
import { AuthContext } from '../../../context/AuthContext';

const ChatWidget = () => {
  const { userId, role } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [connection, setConnection] = useState(null);

  // Chỉ hiển thị cho khách hàng (role !== 1)
  if (role === 1) return null;

  // Khởi tạo SignalR connection
  useEffect(() => {
    const initConnection = async () => {
      const conn = new HubConnectionBuilder()
        .withUrl('https://localhost:7278/chathub', {
          accessTokenFactory: () => localStorage.getItem('token'),
        })
        .configureLogging(LogLevel.Information)
        .build();

      try {
        await conn.start();
        setConnection(conn);
      } catch (err) {
        console.error('SignalR Connection Error:', err);
      }
    };

    initConnection();
    return () => connection?.stop();
  }, []);

  // Tạo hoặc lấy phòng chat khi mở widget
  const handleOpenChat = async () => {
    if (!isOpen && userId) {
      try {
        const response = await fetch('https://localhost:7278/Chat/get-or-create-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ customerId: userId, adminId: 5 }),
        });
        if (!response.ok) throw new Error('Failed to create/get room');
        const room = await response.json();
        setChatRoomId(room.chatRoomId);
        setIsOpen(true);
      } catch (err) {
        console.error('Error creating room:', err);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Icon chat */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-150"
        >
          <ChatBubbleLeftIcon className="h-6 w-6" />
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="w-80 h-[50vh] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="flex justify-between items-center p-3 bg-blue-500 text-white rounded-t-lg">
            <h3 className="text-sm font-semibold">Chat với hỗ trợ</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <ChatMessages
            chatRoomId={chatRoomId}
            userId={userId}
            connection={connection}
            isAdmin={false}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWidget;