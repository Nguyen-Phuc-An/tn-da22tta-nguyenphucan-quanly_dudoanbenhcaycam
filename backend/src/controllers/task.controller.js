const Task = require('../models/Task');
const Garden = require('../models/Garden');
const User = require('../models/User');

// Lấy tất cả công việc chung
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .sort({ ngay_tao: -1 });

    console.log('✓ Lấy danh sách công việc:', tasks.length);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết 1 công việc
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Công việc không tồn tại',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo công việc mới
const createTask = async (req, res) => {
  try {
    const { ten_cong_viec, mo_ta, dieu_kien_thuc_hien } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!ten_cong_viec) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên công việc',
      });
    }

    // Chỉ admin có thể tạo công việc
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin có thể tạo công việc',
      });
    }

    const task = new Task({
      ten_cong_viec,
      mo_ta: mo_ta || '',
      dieu_kien_thuc_hien: dieu_kien_thuc_hien || '',
    });

    await task.save();
    
    console.log('✓ Tạo công việc:', ten_cong_viec);

    res.status(201).json({
      success: true,
      message: 'Tạo công việc thành công',
      data: task,
    });
  } catch (error) {
    console.error('❌ Lỗi tạo công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật công việc
const updateTask = async (req, res) => {
  try {
    const { ten_cong_viec, mo_ta, dieu_kien_thuc_hien } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Công việc không tồn tại',
      });
    }

    // Chỉ admin có thể cập nhật công việc
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin có thể cập nhật công việc',
      });
    }

    // Cập nhật dữ liệu
    if (ten_cong_viec) task.ten_cong_viec = ten_cong_viec;
    if (mo_ta !== undefined) task.mo_ta = mo_ta;
    if (dieu_kien_thuc_hien !== undefined) task.dieu_kien_thuc_hien = dieu_kien_thuc_hien;

    await task.save();
    
    console.log('✓ Cập nhật công việc:', ten_cong_viec);

    res.json({
      success: true,
      message: 'Cập nhật công việc thành công',
      data: task,
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa công việc
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Công việc không tồn tại',
      });
    }

    // Chỉ admin có thể xóa công việc
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin có thể xóa công việc',
      });
    }

    await Task.findByIdAndDelete(req.params.id);
    console.log('✓ Xóa công việc');

    res.json({
      success: true,
      message: 'Xóa công việc thành công',
    });
  } catch (error) {
    console.error('❌ Lỗi xóa công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Lấy tất cả công việc
const getAllTasksByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Kiểm tra quyền admin
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể xem tất cả công việc',
      });
    }

    // Lấy tất cả công việc và populate thông tin
    const tasks = await Task.find()
      .populate('garden_id', 'ten_vuon')
      .sort({ ngay_tao: -1 });

    console.log('✓ Admin lấy tất cả công việc:', tasks.length);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy công việc:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksByAdmin,
};
