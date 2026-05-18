import React, { useState, useEffect } from 'react';
import { FaVirus, FaComments, FaUser, FaBrain, FaTimes } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      // Fetch all predictions as proxy for chats (since chats are nested in predictions)
      const res = await apiClient.get('/api/predictions');
      const predictionsWithChats = res.data.data || [];
      setChats(predictionsWithChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      toast.error('Không thể tải danh sách chat', {
        id: 'admin-chat-list-error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const diseaseName = chat.ket_qua_benh?.toLowerCase() || '';
    const userName = chat.user_id?.ho_ten?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return diseaseName.includes(searchLower) || userName.includes(searchLower);
  });

  const handleFetchChatDetails = async (predictionId) => {
    try {
      const res = await apiClient.get(`/api/chat/${predictionId}`);
      setSelectedChat(res.data.data);
    } catch (err) {
      console.error('Error fetching chat:', err);
      toast.error('Không thể tải chi tiết chat', {
        id: 'admin-chat-detail-error',
      });
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Chat AI</h1>
          <p className="text-gray-600 mt-2">Xem và giám sát các cuộc trò chuyện AI</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo bệnh hoặc người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chats List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-600">
                  Đang tải chat...
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-gray-600">Không tìm thấy chat</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Người Dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Bệnh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Tin Nhận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredChats.map((chat) => (
                      <tr
                        key={chat._id}
                        onClick={() => handleFetchChatDetails(chat._id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900">
                            {chat.user_id?.ho_ten || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-900 font-medium">
                            <FaVirus className="inline mr-2" /> {chat.ket_qua_benh}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            <FaComments className="inline mr-2" /> Xem
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {new Date(chat.ngay_du_doan).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Chat Details Panel */}
          <div>
            {selectedChat ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  <FaComments className="inline mr-2" /> Tin Nhận Chat
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Người Dùng</p>
                    <p className="text-sm font-semibold text-gray-900">
                      <FaUser className="inline mr-2" /> {selectedChat.user_id?.ho_ten}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase">Bệnh</p>
                    <p className="text-sm font-semibold text-red-600">
                      <FaVirus className="inline mr-2" /> {selectedChat.ket_qua_benh}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 uppercase">Số Tin Nhận</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedChat.messages?.length || 0} tin nhận
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-600 uppercase mb-3 font-semibold">
                    Tin Nhận:
                  </p>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedChat.messages && selectedChat.messages.length > 0 ? (
                      selectedChat.messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-50 text-blue-900'
                              : 'bg-green-50 text-green-900'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1">
                            {msg.role === 'user' ? <><FaUser /> Người Dùng</> : <><FaBrain /> AI</>}
                          </p>
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">Chưa có tin nhận</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedChat(null)}
                  className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <FaTimes className="inline mr-2" /> Đóng
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Chọn một chat để xem tin nhận
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatPage;
