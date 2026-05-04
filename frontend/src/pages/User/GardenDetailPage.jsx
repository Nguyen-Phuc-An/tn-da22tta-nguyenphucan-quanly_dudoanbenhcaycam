import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaArrowLeft, FaNotesMedical, FaCoins } from 'react-icons/fa';
import UserLayout from '../../components/User/UserLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const GardenDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [logs, setLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGardenData();
  }, [id]);

  const fetchGardenData = async () => {
    try {
      setLoading(true);
      const [gardenRes, logsRes, expensesRes] = await Promise.all([
        apiClient.get(`/gardens/${id}`),
        apiClient.get('/logs'),
        apiClient.get('/expenses'),
      ]);

      const gardenLogs = logsRes.data.data?.filter(l => l.garden_id?._id === id) || [];
      const gardenExpenses = expensesRes.data.data?.filter(e => e.garden_id?._id === id) || [];

      setGarden(gardenRes.data.data);
      setLogs(gardenLogs);
      setExpenses(gardenExpenses);

      console.log('✓ Garden data loaded');
    } catch (error) {
      console.error('❌ Lỗi tải vườn:', error);
      toast.error('Không thể tải thông tin vườn');
      navigate('/user/gardens');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !garden) {
    return (
      <UserLayout>
        <div className="text-center py-12">Đang tải...</div>
      </UserLayout>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.so_tien || 0), 0);

  return (
    <UserLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaLeaf className="text-green-600" /> {garden.ten_vuon}
            </h1>
            <p className="text-gray-600 mt-2">📍 {garden.dia_diem}</p>
          </div>
          <button
            onClick={() => navigate('/user/gardens')}
            className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>

        {/* Garden Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Diện tích</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {garden.dien_tich} {garden.don_vi}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">Loại cây</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{garden.loai_cay || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <FaNotesMedical className="text-blue-600" /> Nhật ký
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{logs.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <FaCoins className="text-orange-600" /> Chi phí
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {(totalExpenses / 1000000).toFixed(1)}M ₫
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Logs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Nhật ký gần đây</h2>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có nhật ký nào</p>
              ) : (
                logs.slice(0, 5).map(log => (
                  <div key={log._id} className="pb-3 border-b last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          {new Date(log.ngay).toLocaleDateString('vi-VN')}
                        </p>
                        {log.task_id && (
                          <p className="font-semibold text-gray-900 text-sm">
                            ✅ {log.task_id?.ten_cong_viec}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">{log.ghi_chu}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Chi phí gần đây</h2>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có chi phí nào</p>
              ) : (
                expenses.slice(0, 5).map(expense => (
                  <div key={expense._id} className="pb-3 border-b last:border-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{expense.mo_ta}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(expense.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <p className="font-bold text-orange-600 text-sm">
                      {expense.so_tien?.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(`/user/gardens/${id}/edit`)}
            className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition font-semibold"
          >
            ✏️ Chỉnh sửa vườn
          </button>
          <button
            onClick={() => {
              if (window.confirm('Xóa vườn này?')) {
                apiClient.delete(`/gardens/${id}`).then(() => {
                  toast.success('Đã xóa vườn');
                  navigate('/user/gardens');
                });
              }
            }}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            🗑️ Xóa vườn
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default GardenDetailPage;
