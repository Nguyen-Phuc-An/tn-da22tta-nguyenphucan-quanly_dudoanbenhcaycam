const Season = require('../models/Season');
const Garden = require('../models/Garden');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Log = require('../models/Log');

// Helper: Auto-end season nếu hết hạn
const checkAndUpdateSeasonStatus = async (season) => {
  if (season.thang_ket_thuc && season.trang_thai === 'Đang diễn ra') {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth > season.thang_ket_thuc) {
      season.trang_thai = 'Đã kết thúc';
      await season.save();
    }
  }
  return season;
};

// Lấy tất cả mùa vụ
const getSeasons = async (req, res) => {
  try {
    let seasons = await Season.find()
      .sort({ nam: -1, thang_bat_dau: 1 });

    // Auto-check trang_thai
    for (let season of seasons) {
      await checkAndUpdateSeasonStatus(season);
    }

    // Re-fetch after updates
    seasons = await Season.find()
      .sort({ nam: -1, thang_bat_dau: 1 });

    console.log('✓ Lấy danh sách mùa vụ:', seasons.length);

    res.json({
      success: true,
      count: seasons.length,
      data: seasons,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Lấy tất cả mùa vụ (yêu cầu auth)
const getAllSeasonsByAdmin = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể xem tất cả mùa vụ',
      });
    }

    let seasons = await Season.find()
      .sort({ nam: -1, thang_bat_dau: 1 });

    // Auto-check trang_thai
    for (let season of seasons) {
      await checkAndUpdateSeasonStatus(season);
    }

    // Re-fetch after updates
    seasons = await Season.find()
      .sort({ nam: -1, thang_bat_dau: 1 });

    console.log('✓ Admin lấy danh sách mùa vụ:', seasons.length);

    res.json({
      success: true,
      count: seasons.length,
      data: seasons,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết 1 mùa vụ
const getSeasonById = async (req, res) => {
  try {
    let season = await Season.findById(req.params.id);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Mùa vụ không tồn tại',
      });
    }

    // Auto-check trang_thai
    season = await checkAndUpdateSeasonStatus(season);

    res.json({
      success: true,
      data: season,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo mùa vụ mới
const createSeason = async (req, res) => {
  try {
    const { ten_mua_vu, nam, thang_bat_dau, thang_ket_thuc, mo_ta } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!ten_mua_vu || !nam) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên mùa vụ và năm',
      });
    }

    // Kiểm tra thứ tự tháng
    if (thang_bat_dau && thang_ket_thuc && thang_bat_dau > thang_ket_thuc) {
      return res.status(400).json({
        success: false,
        message: 'Tháng bắt đầu không thể sau tháng kết thúc',
      });
    }

    // Kiểm tra quyền admin
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể tạo mùa vụ',
      });
    }

    const season = new Season({
      ten_mua_vu,
      nam,
      thang_bat_dau,
      thang_ket_thuc,
      mo_ta: mo_ta || '',
      trang_thai: 'Đang diễn ra',
    });

    await season.save();
    
    console.log('✓ Tạo mùa vụ:', ten_mua_vu);

    res.status(201).json({
      success: true,
      message: 'Tạo mùa vụ thành công',
      data: season,
    });
  } catch (error) {
    console.error('❌ Lỗi tạo mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật mùa vụ
const updateSeason = async (req, res) => {
  try {
    const { ten_mua_vu, nam, thang_bat_dau, thang_ket_thuc, mo_ta, trang_thai } = req.body;

    const season = await Season.findById(req.params.id);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Mùa vụ không tồn tại',
      });
    }

    // Kiểm tra quyền admin
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể cập nhật mùa vụ',
      });
    }

    // Kiểm tra thứ tự tháng
    const newThangBatDau = thang_bat_dau !== undefined ? thang_bat_dau : season.thang_bat_dau;
    const newThangKetThuc = thang_ket_thuc !== undefined ? thang_ket_thuc : season.thang_ket_thuc;
    
    if (newThangBatDau && newThangKetThuc && newThangBatDau > newThangKetThuc) {
      return res.status(400).json({
        success: false,
        message: 'Tháng bắt đầu không thể sau tháng kết thúc',
      });
    }

    // Cập nhật dữ liệu
    if (ten_mua_vu) season.ten_mua_vu = ten_mua_vu;
    if (nam) season.nam = nam;
    if (thang_bat_dau !== undefined) season.thang_bat_dau = thang_bat_dau;
    if (thang_ket_thuc !== undefined) season.thang_ket_thuc = thang_ket_thuc;
    if (mo_ta !== undefined) season.mo_ta = mo_ta;
    if (trang_thai) {
      if (['Đang diễn ra', 'Đã kết thúc'].includes(trang_thai)) {
        season.trang_thai = trang_thai;
      }
    }

    await season.save();
    
    console.log('✓ Cập nhật mùa vụ:', ten_mua_vu || season.ten_mua_vu);

    res.json({
      success: true,
      message: 'Cập nhật mùa vụ thành công',
      data: season,
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa mùa vụ
const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Mùa vụ không tồn tại',
      });
    }

    // Kiểm tra quyền admin
    const user = await User.findById(req.userId);
    if (!user || user.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể xóa mùa vụ',
      });
    }

    // Kiểm tra có Garden liên quan không
    const gardenCount = await Garden.countDocuments({ season_id: req.params.id });
    if (gardenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa mùa vụ này. Có ${gardenCount} vườn liên quan`,
      });
    }

    // Kiểm tra có Expense liên quan không
    const expenseCount = await Expense.countDocuments({ season_id: req.params.id });
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa mùa vụ này. Có ${expenseCount} bản ghi chi phí liên quan`,
      });
    }

    // Kiểm tra có Log liên quan không
    const logCount = await Log.countDocuments({ season_id: req.params.id });
    if (logCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa mùa vụ này. Có ${logCount} bản ghi nhật ký liên quan`,
      });
    }

    await Season.findByIdAndDelete(req.params.id);
    console.log('✓ Xóa mùa vụ');

    res.json({
      success: true,
      message: 'Xóa mùa vụ thành công',
    });
  } catch (error) {
    console.error('❌ Lỗi xóa mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSeasons,
  getAllSeasonsByAdmin,
  getSeasonById,
  createSeason,
  updateSeason,
  deleteSeason,
};
