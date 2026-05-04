import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaVirus, FaLeaf, FaClipboardList, FaDollarSign, FaFileAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserLayout from '../../components/User/UserLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const StatisticsPage = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    predictions: [],
    mostCommonDisease: null,
    gardens: [],
    logs: [],
    expenses: [],
    diseaseList: [],
    expensesByType: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [expensesRes, predictionsRes, gardensRes, logsRes] = await Promise.all([
        apiClient.get('/expenses'),
        apiClient.get('/predictions'),
        apiClient.get('/gardens'),
        apiClient.get('/logs'),
      ]);

      const expenses = expensesRes.data.data || [];
      const predictions = predictionsRes.data.data || [];
      const gardens = gardensRes.data.data || [];
      const logs = logsRes.data.data || [];

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.so_tien || 0), 0);

      // Tìm bệnh phổ biến nhất
      const diseaseCount = {};
      predictions.forEach(p => {
        if (p.ket_qua_benh) {
          diseaseCount[p.ket_qua_benh] = (diseaseCount[p.ket_qua_benh] || 0) + 1;
        }
      });

      const diseaseList = Object.entries(diseaseCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const mostCommon = diseaseList[0];

      // Chi phí breakdown theo loại chi phí
      const expensesByType = {};
      expenses.forEach(e => {
        const type = e.loai_chi_phi || 'Khác';
        expensesByType[type] = (expensesByType[type] || 0) + (e.so_tien || 0);
      });

      setStats({
        totalExpenses,
        predictions,
        mostCommonDisease: mostCommon || null,
        gardens,
        logs,
        expenses,
        diseaseList,
        expensesByType,
      });
    } catch (error) {
      console.error('❌ Lỗi tải thống kê:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const getConfidencePercent = (confidence) => {
    if (!confidence && confidence !== 0) return 0;
    let conf = Number(confidence) || 0;
    if (conf <= 1) return Math.round(conf * 100);
    if (conf > 100) return Math.round(conf / 100);
    return Math.round(conf);
  };

  // Get latest prediction for each garden
  const getLatestPredictionByGarden = () => {
    const predictionsByGarden = {};
    
    stats.predictions.forEach(pred => {
      const gardenId = pred.garden_id?._id || pred.garden_id;
      if (!predictionsByGarden[gardenId] || 
          new Date(pred.ngay_du_doan) > new Date(predictionsByGarden[gardenId].ngay_du_doan)) {
        predictionsByGarden[gardenId] = pred;
      }
    });

    return Object.values(predictionsByGarden).sort((a, b) => 
      new Date(b.ngay_du_doan) - new Date(a.ngay_du_doan)
    );
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="text-center py-12">Đang tải...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <FaChartBar /> Thống kê
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng chi phí</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {(stats.totalExpenses / 1000000).toFixed(1)}M ₫
                </p>
              </div>
              <div className="text-3xl text-orange-500 opacity-20"><FaDollarSign /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Dự đoán</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.predictions.length}</p>
              </div>
              <div className="text-3xl text-blue-500 opacity-20"><FaChartBar /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bệnh phổ biến</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {stats.mostCommonDisease?.name || 'N/A'}
                </p>
              </div>
              <div className="text-3xl text-red-500 opacity-20">🦠</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Số vườn</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.gardens.length}</p>
              </div>
              <div className="text-3xl text-green-500 opacity-20"><FaLeaf /></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Nhật ký</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.logs.length}</p>
              </div>
              <div className="text-3xl text-purple-500 opacity-20"><FaFileAlt /></div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disease Statistics - Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaVirus className="text-red-600" /> Bệnh phát hiện
            </h3>

            {stats.diseaseList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có dự đoán nào</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.diseaseList}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {stats.diseaseList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][index % 7]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} lần`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Expense by Type - Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaDollarSign className="text-orange-600" /> Chi phí theo loại
            </h3>

            {Object.keys(stats.expensesByType).length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có chi phí nào</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(stats.expensesByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, amount]) => ({
                      name: type,
                      amount: amount / 1000000,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Triệu ₫', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)}M ₫`} />
                  <Bar dataKey="amount" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {stats.totalExpenses > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">Tổng cộng</p>
                  <p className="font-bold text-lg text-gray-900">
                    {(stats.totalExpenses / 1000000).toFixed(2)}M ₫
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Details - Latest by Garden */}
        {stats.gardens.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" /> Bệnh dự đoán gần nhất theo vườn
            </h3>

            {stats.predictions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Chưa có dự đoán nào</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getLatestPredictionByGarden().map((prediction) => {
                  const garden = stats.gardens.find(g => g._id === prediction.garden_id?._id || g._id === prediction.garden_id);
                  return (
                    <div
                      key={prediction._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      {/* Garden Name */}
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaLeaf className="text-green-600" />
                        {garden?.ten_vuon || 'N/A'}
                      </h4>

                      {/* Prediction Details */}
                      <div className="space-y-2">
                        {/* Disease */}
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-600 w-20">Bệnh:</span>
                          <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                            {prediction.ket_qua_benh || 'N/A'}
                          </span>
                        </div>

                        {/* Confidence */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Độ tin cậy:</span>
                          <span className="font-semibold text-green-600">
                            {getConfidencePercent(prediction.do_tin_cay)}%
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Ngày:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(prediction.ngay_du_doan).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        {/* AI Advice */}
                        {prediction.tuvan_ai && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-600 mb-1">💡 Lời khuyên:</p>
                            <p className="text-xs text-gray-700 line-clamp-2">{prediction.tuvan_ai}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default StatisticsPage;
