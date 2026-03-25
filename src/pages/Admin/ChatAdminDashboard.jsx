import React, { useState, useEffect, useContext } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoomList from '../../components/Admin/Main/ChatRoomList'
import ChatMessages from '../../components/Admin/Main/ChatMessages';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7278';

const ChatAdminDashboard = () => {
  const { userId, role } = useContext(AuthContext);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [connection, setConnection] = useState(null);

  // Chỉ hiển thị cho admin (role === 1)
  if (role !== 1) return null;

  // Khởi tạo SignalR connection
  useEffect(() => {
    const initConnection = async () => {
      const conn = new HubConnectionBuilder()
        .withUrl(`${baseURL}/chatHub`, {
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

  // Lấy danh sách phòng chat
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get(`/Chat/rooms/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setChatRooms(response.data);
      } catch (err) {
        console.error('Error fetching rooms:', err.response?.data || err.message);
      }
    };

    if (userId) fetchRooms();
  }, [userId]);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar phòng chat */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <ChatRoomList
          chatRooms={chatRooms}
          onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
        />
      </div>
      {/* Khu vực chat */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId ? (
          <ChatMessages
            chatRoomId={selectedRoomId}
            userId={userId}
            connection={connection}
            isAdmin={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chọn một phòng chat để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAdminDashboard;
