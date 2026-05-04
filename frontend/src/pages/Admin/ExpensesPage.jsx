import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [viewMode, setViewMode] = useState('season'); // 'season', 'user', 'gardens', 'expenses'
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchExpenses(), fetchGardens(), fetchSeasons(), fetchUsers()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await apiClient.get('/expenses/admin/all');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error('Không thể tải danh sách chi phí');
    }
  };

  const fetchGardens = async () => {
    try {
      const res = await apiClient.get('/gardens');
      setGardens(res.data.data || []);
    } catch (err) {
      console.error('Error fetching gardens:', err);
    }
  };

  const fetchSeasons = async () => {
    try {
      const res = await apiClient.get('/seasons/admin/all');
      setSeasons(res.data.data || []);
    } catch (err) {
      console.error('Error fetching seasons:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Calculate total expenses for season
  const getSeasonTotal = (seasonId) => {
    return expenses
      .filter((e) => e.season_id?._id === seasonId || e.season_id === seasonId)
      .reduce((sum, e) => sum + (e.so_tien || 0), 0);
  };

  // Calculate total expenses for season
  const getSeasonTotalExp = (seasonId) => {
    return expenses
      .filter((e) => e.season_id?._id === seasonId || e.season_id === seasonId)
      .reduce((sum, e) => sum + (e.so_tien || 0), 0);
  };

  // Calculate total expenses for user in selected season (all gardens)
  const getUserTotalForSeason = (userId) => {
    // Get all user's gardens
    const userGardenIds = gardens
      .filter((g) => g.user_id?._id === userId || g.user_id === userId)
      .map(g => g._id);
    
    // Sum expenses from these gardens in selected season
    return expenses
      .filter((e) => {
        const gardenId = e.garden_id?._id || e.garden_id;
        const inSeason = selectedSeason && (e.season_id?._id === selectedSeason._id || e.season_id === selectedSeason._id);
        return userGardenIds.includes(gardenId) && inSeason;
      })
      .reduce((sum, e) => sum + (e.so_tien || 0), 0);
  };

  // Get gardens for selected user in selected season
  const getGardensForUserInSeason = () => {
    if (selectedUser && selectedSeason) {
      return gardens.filter((g) => {
        const isUserGarden = g.user_id?._id === selectedUser || g.user_id === selectedUser;
        const isInSeason = g.season_id?._id === selectedSeason._id || g.season_id === selectedSeason._id;
        return isUserGarden && isInSeason;
      });
    }
    return [];
  };

  // Get expenses for selected garden in selected season
  const getExpensesForGarden = () => {
    if (!selectedGarden || !selectedSeason) return [];
    return expenses.filter(
      (e) => {
        const gardenMatch = e.garden_id?._id === selectedGarden || e.garden_id === selectedGarden;
        const seasonMatch = e.season_id?._id === selectedSeason._id || e.season_id === selectedSeason._id;
        return gardenMatch && seasonMatch;
      }
    );
  };

  // Get sorted seasons
  const getSortedSeasons = () => {
    const statusOrder = { 'Đang diễn ra': 0, 'Đã kết thúc': 1, 'Sắp diễn ra': 2 };
    return [...seasons].sort((a, b) => {
      // Sort by year DESC (newest first)
      if (a.nam !== b.nam) return b.nam - a.nam;
      // Then by status
      return (statusOrder[a.trang_thai] || 3) - (statusOrder[b.trang_thai] || 3);
    });
  };

  const handleSelectSeason = (season) => {
    setSelectedSeason(season);
    setViewMode('user');
    setSelectedUser(null);
    setSelectedGarden(null);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user._id);
    setViewMode('gardens');
  };

  const handleBackFromUser = () => {
    setViewMode('season');
    setSelectedSeason(null);
    setSelectedUser(null);
  };

  const handleSelectGarden = (garden) => {
    setSelectedGarden(garden._id);
    setViewMode('expenses');
  };

  const handleBackFromGardens = () => {
    setViewMode('user');
    setSelectedUser(null);
    setSelectedGarden(null);
  };

  const handleBackFromExpenses = () => {
    setViewMode('gardens');
    setSelectedGarden(null);
    setSelectedExpense(null);
  };

  const handleSelectExpense = (expense) => {
    setSelectedExpense(expense);
  };

  // Render SEASON LIST view
  const renderSeasonListView = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Danh sách Mùa Vụ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSortedSeasons().map((season) => {
          const total = getSeasonTotalExp(season._id);
          return (
            <div
              key={season._id}
              onClick={() => handleSelectSeason(season)}
              className="p-4 bg-white border-l-4 border-blue-500 rounded-lg hover:shadow-md cursor-pointer transform hover:scale-105 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{season.ten_mua_vu}</h3>
                  <p className="text-gray-600 text-sm">Năm: {season.nam}</p>
                </div>
                <FaChevronRight className="text-gray-400 mt-1" />
              </div>
              <div className="mt-3 pt-3 border-t">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  season.trang_thai === 'Đang diễn ra'
                    ? 'bg-green-100 text-green-700'
                    : season.trang_thai === 'Sắp diễn ra'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {season.trang_thai}
                </span>
                <p className="text-sm text-gray-600 mt-2">Tổng chi phí:</p>
                <p className="text-lg font-bold text-blue-600">{total.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render USER LIST view
  const renderUserListView = () => (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBackFromUser} className="p-2 hover:bg-gray-200 rounded-lg">
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Danh sách Người dùng - {selectedSeason?.ten_mua_vu} ({selectedSeason?.nam})</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users
          .filter((user) => user.vai_tro !== 'Admin' && user.role !== 'admin') // Exclude admin users
          .map((user) => {
          const total = getUserTotalForSeason(user._id);
          const userGardens = gardens.filter(
            (g) => g.user_id?._id === user._id || g.user_id === user._id
          );
          return (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className="p-4 bg-white border-l-4 border-green-500 rounded-lg hover:shadow-md cursor-pointer transform hover:scale-105 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{user.ten}</h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <FaChevronRight className="text-gray-400 mt-1" />
              </div>
              <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                <p className="text-gray-600">Số vườn: <span className="font-semibold">{userGardens.length}</span></p>
                <p className="text-gray-600">Tổng chi phí: <span className="font-bold text-green-600">{total.toLocaleString('vi-VN')} đ</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render GARDENS LIST view
  const renderGardensListView = () => {
    const filteredGardens = getGardensForUserInSeason();
    const userName = users.find(u => u._id === selectedUser)?.ten || users.find(u => u._id === selectedUser)?.ho_ten;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBackFromGardens} className="p-2 hover:bg-gray-200 rounded-lg">
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Danh sách Vườn - {userName}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGardens.length > 0 ? (
            filteredGardens.map((garden) => {
              let gardenExpenses = expenses.filter(
                (e) => {
                  const gardenMatch = e.garden_id?._id === garden._id || e.garden_id === garden._id;
                  const seasonMatch = e.season_id?._id === selectedSeason._id || e.season_id === selectedSeason._id;
                  return gardenMatch && seasonMatch;
                }
              );
              const total = gardenExpenses.reduce((sum, e) => sum + (e.so_tien || 0), 0);
              return (
                <div
                  key={garden._id}
                  onClick={() => handleSelectGarden(garden)}
                  className="p-4 bg-white border-l-4 border-purple-500 rounded-lg hover:shadow-md cursor-pointer transform hover:scale-105 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{garden.ten_vuon}</h3>
                      <p className="text-gray-600 text-sm">Địa điểm: {garden.dia_diem}</p>
                    </div>
                    <FaChevronRight className="text-gray-400 mt-1" />
                  </div>
                  <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                    <p className="text-gray-600">Số chi phí: <span className="font-semibold">{gardenExpenses.length}</span></p>
                    <p className="text-gray-600">Tổng chi phí: <span className="font-bold text-purple-600">{total.toLocaleString('vi-VN')} đ</span></p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Không có vườn nào
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render EXPENSES TABLE view with split layout
  const renderExpensesView = () => {
    const expensesList = getExpensesForGarden();
    const gardenName = gardens.find(g => g._id === selectedGarden)?.ten_vuon;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={handleBackFromExpenses} className="p-2 hover:bg-gray-200 rounded-lg">
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">Chi Phí - {gardenName}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Expense List */}
          <div className="overflow-x-auto">
            <h3 className="text-lg font-bold mb-3">Danh sách Chi Phí</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold border-b">Loại Chi Phí</th>
                  <th className="p-3 text-right font-semibold border-b">Tổng Tiền</th>
                  <th className="p-3 text-center font-semibold border-b">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {expensesList.length > 0 ? (
                  expensesList.map((expense) => (
                    <tr
                      key={expense._id}
                      onClick={() => handleSelectExpense(expense)}
                      className={`border-b cursor-pointer transition-all ${
                        selectedExpense?._id === expense._id
                          ? 'bg-blue-100 hover:bg-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-3">{expense.loai_chi_phi}</td>
                      <td className="p-3 text-right font-semibold">{(expense.so_tien || 0).toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-center text-sm">
                        {new Date(expense.ngay).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-6 text-center text-gray-500">
                      Không có chi phí nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* RIGHT: Item Details */}
          <div className="lg:col-span-1 flex flex-col">
            {selectedExpense ? (
              <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex justify-between items-start">
                  <h3 className="text-lg font-bold">Danh sách mặt hàng ({selectedExpense.items?.length || 0})</h3>
                  <button
                    onClick={() => setSelectedExpense(null)}
                    className="text-white hover:text-gray-200 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Items List with Scrolling */}
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedExpense.items && selectedExpense.items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedExpense.items.map((item, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                          <div className="font-semibold text-gray-900 mb-2">{item.ten_hang || item.ten_mat_hang}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Số lượng:</span>
                              <p className="text-gray-900">{item.so_luong} {item.don_vi || ''}</p>
                            </div>
                            <div>
                              <span className="font-medium">Giá tiền:</span>
                              <p className="text-gray-900">{(item.don_gia || item.gia_tien || 0).toLocaleString('vi-VN')} đ</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-600">Tổng tiền:</span>
                            <p className="text-lg font-bold text-green-600">
                              {((item.tong_tien) || (item.so_luong * (item.don_gia || item.gia_tien || 0))).toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">Không có mặt hàng</div>
                  )}
                </div>

                {/* Total Amount */}
                <div className="border-t bg-gray-50 p-4">
                  <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Tổng chi phí</div>
                    <div className="text-2xl font-bold text-green-600">
                      {(selectedExpense.so_tien || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">Chọn một chi phí để xem chi tiết mặt hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="">
        {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-900">Quản Lý Chi Phí</h1>
                </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {viewMode === 'season' && renderSeasonListView()}
          {viewMode === 'user' && renderUserListView()}
          {viewMode === 'gardens' && renderGardensListView()}
          {viewMode === 'expenses' && renderExpensesView()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ExpensesPage;
