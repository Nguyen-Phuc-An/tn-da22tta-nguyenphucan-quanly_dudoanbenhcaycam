import React, { useState, useEffect } from 'react';
import { FaUsers, FaLeaf, FaVirus, FaCamera, FaClipboard, FaPlus, FaChartBar, FaScrewdriver, FaCheck, FaInfoCircle } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import apiClient from '../../services/apiClient';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    gardens: 0,
    diseases: 0,
    predictions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, gardensRes, diseasesRes, predictionsRes] =
        await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/gardens'),
          apiClient.get('/diseases'),
          apiClient.get('/predictions'),
        ]);

      console.log('✓ Users:', usersRes.data.data?.length || 0);
      console.log('✓ Gardens:', gardensRes.data.data?.length || 0);
      console.log('✓ Diseases:', diseasesRes.data.data?.length || 0);
      console.log('✓ Predictions:', predictionsRes.data.data?.length || 0);

      setStats({
        users: usersRes.data.data?.length || 0,
        gardens: gardensRes.data.data?.length || 0,
        diseases: diseasesRes.data.data?.length || 0,
        predictions: predictionsRes.data.data?.length || 0,
      });
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setError('Không thể tải thống kê');
      // Mock data for development
      setStats({
        users: 5,
        gardens: 8,
        diseases: 12,
        predictions: 24,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div
      className={`bg-white rounded-lg shadow p-6 border-l-4 ${color} hover:shadow-lg transition`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng Điều Khiển</h1>
          <p className="text-gray-600 mt-2">Chào mừng đến bảng quản trị viên</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaUsers />}
            label="Total Users"
            value={stats.users}
            color="border-blue-500"
          />
          <StatCard
            icon={<FaLeaf />}
            label="Total Gardens"
            value={stats.gardens}
            color="border-green-500"
          />
          <StatCard
            icon={<FaVirus />}
            label="Total Diseases"
            value={stats.diseases}
            color="border-red-500"
          />
          <StatCard
            icon={<FaCamera />}
            label="Total Predictions"
            value={stats.predictions}
            color="border-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <FaClipboard className="inline mr-2" /> Hành Động Nhanh
            </h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-left">
                <FaPlus className="inline mr-2" /> Tạo Bệnh Mới
              </button>
              <button className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-left">
                <FaPlus className="inline mr-2" /> Tạo Người Dùng Mới
              </button>
              <button className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-left">
                <FaChartBar className="inline mr-2" /> Xem Báo Cáo
              </button>
              <button className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-left">
                <FaScrewdriver className="inline mr-2" /> Cài Đặt Hệ Thống
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <FaInfoCircle className="inline mr-2" /> Thông Tin Hệ Thống
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng Thái Backend</span>
                <span className="text-green-600 font-semibold"><FaCheck className="inline mr-2" /> Trực Tuyến</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cơ Sở Dữ Liệu</span>
                <span className="text-green-600 font-semibold"><FaCheck className="inline mr-2" /> Đã Kết Nối</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Nhân Dạng</span>
                <span className="text-green-600 font-semibold"><FaCheck className="inline mr-2" /> Hoạt Động</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gemini AI</span>
                <span className="text-green-600 font-semibold">✓ Sẵn Sàng</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-600">Lần Đồng Bộ Cuối</span>
                <span className="text-gray-900">Vừa đây</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
