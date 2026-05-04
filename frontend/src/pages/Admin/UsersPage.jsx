import React, { useState, useEffect } from 'react';
import { FaLock, FaUnlock, FaEdit, FaTrash, FaCheck, FaTimes, FaKey, FaUser } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      console.log('✓ Users loaded:', res.data.data?.length || 0);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId, currentLockStatus) => {
    try {
      const res = await apiClient.patch(`/users/${userId}/lock`, {
        is_locked: !currentLockStatus,
      });
      console.log('✓ User lock status updated:', userId);
      toast.success(res.data.message);
      
      // Cập nhật danh sách users
      setUsers(users.map((u) => 
        u._id === userId 
          ? { ...u, is_locked: !currentLockStatus }
          : u
      ));
    } catch (err) {
      console.error('❌ Error locking user:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái người dùng');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.vai_tro === 'user' &&
      (user.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải người dùng...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Không tìm thấy người dùng</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Vai Trò
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Vườn
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {user.ho_ten?.[0] || 'U'}
                        </div>
                        <span className="ml-3 text-gray-900">{user.ho_ten}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          user.vai_tro === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.vai_tro === 'admin' ? <><FaKey className="inline mr-1" /> Admin</> : <><FaUser className="inline mr-1" /> Người Dùng</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          user.is_locked
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.is_locked ? <><FaLock className="inline mr-1" /> Khóa</> : <><FaCheck className="inline mr-1" /> Hoạt Động</>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-gray-600">
                      {user.gardens?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleLockUser(user._id, user.is_locked)}
                        disabled={user.vai_tro === 'admin'}
                        className={`px-3 py-1 rounded hover:opacity-80 transition text-sm font-medium ${
                          user.is_locked
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                        } ${user.vai_tro === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {user.is_locked ? <><FaUnlock className="inline mr-1" /> Mở Khóa</> : <><FaLock className="inline mr-1" /> Khóa</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
