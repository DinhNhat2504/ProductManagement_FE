import React from 'react';

const ChatRoomList = ({ chatRooms, onSelectRoom }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Phòng Chat</h2>
      {chatRooms.length === 0 ? (
        <p className="text-gray-500">Không có phòng chat nào</p>
      ) : (
        chatRooms.map((room) => (
          <div
            key={room.chatRoomId}
            onClick={() => onSelectRoom(room.chatRoomId)}
            className="p-3 mb-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition duration-150"
          >
            <p className="font-medium text-gray-800">{room.userName}</p>
            <p className="text-sm text-gray-500">
              Tạo lúc: {new Date(room.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatRoomList;