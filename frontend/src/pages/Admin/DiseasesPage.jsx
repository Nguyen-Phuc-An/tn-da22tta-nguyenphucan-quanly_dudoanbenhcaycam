import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaVirus, FaSave } from 'react-icons/fa';
import AdminLayout from '../../components/Admin/AdminLayout';
import apiClient from '../../services/apiClient';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const DiseasesPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/diseases');
      console.log('✓ Diseases loaded:', res.data.data?.length || 0);
      setDiseases(res.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching diseases:', err);
      toast.error('Không thể tải danh sách bệnh');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await apiClient.put(`/diseases/${editingId}`, data);
        console.log('✓ Disease updated:', editingId);
        toast.success('Bệnh được cập nhật thành công');
        setDiseases(
          diseases.map((d) => (d._id === editingId ? { ...d, ...data } : d))
        );
      } else {
        const res = await apiClient.post('/diseases', data);
        console.log('✓ Disease created:', res.data.data);
        toast.success('Bệnh được tạo thành công');
        setDiseases([...diseases, res.data.data]);
      }
      reset();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving disease:', err);
      toast.error(err.response?.data?.message || 'Không thể lưu bệnh');
    }
  };

  const handleEdit = (disease) => {
    setEditingId(disease._id);
    reset(disease);
    setShowForm(true);
  };

  const handleDeleteDisease = async (diseaseId) => {
    try {
      await apiClient.delete(`/diseases/${diseaseId}`);
      console.log('✓ Disease deleted:', diseaseId);
      toast.success('Bệnh được xóa thành công');
      setDiseases(diseases.filter((d) => d._id !== diseaseId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('❌ Error deleting disease:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa bệnh');
    }
  };

  const filteredDiseases = diseases.filter(
    (disease) =>
      disease.ten_benh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.ten_benh_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bệnh</h1>
          <button
            onClick={() => {
              setEditingId(null);
              reset();
              setShowForm(!showForm);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus /> Thêm Bệnh Mới
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? <><FaEdit /> Sửa Bệnh</> : <><FaPlus /> Tạo Bệnh Mới</>}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Bệnh (Tiếng Việt)
                  </label>
                  <input
                    type="text"
                    {...register('ten_benh', { required: 'Bắt buộc' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Bệnh bia lá..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Bệnh (Tiếng Anh)
                  </label>
                  <input
                    type="text"
                    {...register('ten_benh_en', { required: 'Bắt buộc' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Leaf spot..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  {...register('mo_ta')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe the disease..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nguyên Nhân
                </label>
                <textarea
                  {...register('nguyen_nhan')}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Cause of disease..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cách Xử Lý
                </label>
                <textarea
                  {...register('huong_xu_ly')}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="How to treat..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gợi Ý Phân Bón
                  </label>
                  <input
                    type="text"
                    {...register('goi_y_phan_bon')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Fertilizer types (comma separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gợi Ý Thuốc
                  </label>
                  <input
                    type="text"
                    {...register('goi_y_thuoc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Medicine types (comma separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức Độ Nguy Hiểm
                </label>
                <select
                  {...register('muc_do_nguy_hiem')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Chọn mức độ</option>
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung Bình</option>
                  <option value="High">Cao</option>
                  <option value="Critical">Rất Cao</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  {editingId ? <><FaCheck /> Cập Nhật</> : <><FaCheck /> Tạo Mới</>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                    setEditingId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center justify-center gap-2"
                >
                  <FaTimes /> Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by disease name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải bệnh...</div>
          ) : filteredDiseases.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Không tìm thấy bệnh</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Tên Bệnh (VI)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Tên Bệnh (EN)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Mức Độ Nguy Hiểm
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDiseases.map((disease) => (
                  <tr key={disease._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 font-medium">
                        <FaVirus className="inline mr-2" /> {disease.ten_benh}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {disease.ten_benh_en}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          disease.muc_do_nguy_hiem === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : disease.muc_do_nguy_hiem === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : disease.muc_do_nguy_hiem === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {disease.muc_do_nguy_hiem || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(disease)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm"
                      >
                        <FaEdit className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(disease._id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Xác Nhận Xóa
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa bệnh này không? Hành động này không thể hoàn tác.
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteDisease(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DiseasesPage;
