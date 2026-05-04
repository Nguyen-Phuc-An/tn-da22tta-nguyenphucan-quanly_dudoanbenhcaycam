const Garden = require('../models/Garden');
const Season = require('../models/Season');
const User = require('../models/User');

// Tạo vườn mới
const createGarden = async (req, res) => {
  try {
    const { ten_vuon, dien_tich, dia_chi, loai_cay, so_cay, don_vi, user_id, season_id } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!ten_vuon || !dien_tich || !dia_chi || !loai_cay) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đủ thông tin bắt buộc',
      });
    }

    // Lấy thông tin user hiện tại
    const currentUser = await User.findById(req.userId);
    let gardenUserId = req.userId;

    // Nếu admin cung cấp user_id khác, kiểm tra quyền
    if (user_id && user_id !== req.userId) {
      if (currentUser.vai_tro !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ admin mới có thể tạo garden cho user khác',
        });
      }
      // Kiểm tra user tồn tại
      const targetUser = await User.findById(user_id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User không tồn tại',
        });
      }
      gardenUserId = user_id;
    }

    // Kiểm tra season_id nếu được cung cấp
    let gardenSeasonId = null;
    if (season_id) {
      const season = await Season.findById(season_id);
      if (!season) {
        return res.status(404).json({
          success: false,
          message: 'Mùa vụ không tồn tại',
        });
      }
      // Không cho chọn mùa vụ đã kết thúc
      if (season.trang_thai === 'Đã kết thúc') {
        return res.status(400).json({
          success: false,
          message: 'Không thể gán mùa vụ đã kết thúc',
        });
      }
      gardenSeasonId = season_id;
    }

    // Tạo vườn mới
    const garden = new Garden({
      user_id: gardenUserId,
      season_id: gardenSeasonId,
      ten_vuon,
      dien_tich,
      dia_chi,
      loai_cay,
      so_cay: so_cay || 0,
      don_vi: don_vi || 'm²',
    });

    await garden.save();
    await garden.populate([
      { path: 'user_id', select: 'ho_ten email' },
      { path: 'season_id', select: 'ten_mua_vu nam trang_thai' }
    ]);
    
    console.log('✓ Tạo vườn:', ten_vuon);

    res.status(201).json({
      success: true,
      message: 'Tạo vườn thành công',
      data: garden,
    });
  } catch (error) {
    console.error('❌ Lỗi tạo vườn:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách vườn
const getGardensByUser = async (req, res) => {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = await User.findById(req.userId);
    let filter = {};

    /**
     * 🔐 RBAC ALGORITHM (Role-Based Access Control)
     * 
     * LOGIC:
     *   if (user.vai_tro === "admin")
     *     → filter = {} (không lọc, lấy TẤT CẢ vườn)
     *   else (vai_tro === "user")
     *     → filter = {user_id: currentUserId} (chỉ lấy vườn của họ)
     * 
     * VÍ DỤ:
     *   Admin: getAllGardens() ← 100 vườn từ 50 user
     *   User: getGardens(userId=123) ← 5 vườn của họ
     */
    
    // Nếu user thường -> chỉ lấy vườn của họ
    // Nếu admin -> lấy tất cả vườn
    if (currentUser.vai_tro !== 'admin') {
      filter = { user_id: req.userId };
    }

    const gardens = await Garden.find(filter)
      .populate('user_id', 'ho_ten email')
      .populate('season_id', 'ten_mua_vu nam trang_thai')
      .sort({ ngay_tao: -1 });

    console.log('✓ Lấy danh sách vườn:', gardens.length);

    res.json({
      success: true,
      count: gardens.length,
      data: gardens,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách vườn:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy chi tiết 1 vườn
const getGardenById = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id)
      .populate('user_id', 'ho_ten email')
      .populate('season_id', 'ten_mua_vu nam trang_thai');

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Vườn không tồn tại',
      });
    }

    // Kiểm tra quyền
    /**
     * 🔐 OWNERSHIP VERIFICATION
     * 
     * LOGIC:
     *   if (admin || owner)
     *     → cho phép
     *   else
     *     → 403 Forbidden
     * 
     * BẢNG QUYỀN:
     *   User A: Garden {user_id: A}
     *     ✓ User A xem → owner
     *     ✓ Admin xem → admin
     *     ✗ User B xem → 403
     * 
     * KIỂM TRA:
     *   isAdmin = currentUser.vai_tro === "admin"
     *   isOwner = garden.user_id._id.toString() === req.userId
     *   if (isAdmin || isOwner) → 200 OK
     *   else → 403 Forbidden
     */
    
    const currentUser = await User.findById(req.userId);
    if (currentUser.vai_tro !== 'admin' && garden.user_id._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem vườn này',
      });
    }

    res.json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error('❌ Lỗi lấy chi tiết vườn:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật vườn
const updateGarden = async (req, res) => {
  try {
    const { ten_vuon, dien_tich, dia_chi, loai_cay, so_cay, don_vi, season_id } = req.body;

    // Kiểm tra vườn tồn tại
    const garden = await Garden.findById(req.params.id);
    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Vườn không tồn tại',
      });
    }

    // Kiểm tra quyền
    const currentUser = await User.findById(req.userId);
    if (currentUser.vai_tro !== 'admin' && garden.user_id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật vườn này',
      });
    }

    // Kiểm tra season_id nếu được cung cấp
    if (season_id !== undefined) {
      if (season_id) {
        const season = await Season.findById(season_id);
        if (!season) {
          return res.status(404).json({
            success: false,
            message: 'Mùa vụ không tồn tại',
          });
        }
        // Không cho chọn mùa vụ đã kết thúc
        if (season.trang_thai === 'Đã kết thúc') {
          return res.status(400).json({
            success: false,
            message: 'Không thể gán mùa vụ đã kết thúc',
          });
        }
        garden.season_id = season_id;
      } else {
        garden.season_id = null;
      }
    }

    // Cập nhật dữ liệu
    if (ten_vuon) garden.ten_vuon = ten_vuon;
    if (dien_tich) garden.dien_tich = dien_tich;
    if (dia_chi) garden.dia_chi = dia_chi;
    if (loai_cay) garden.loai_cay = loai_cay;
    if (so_cay !== undefined) garden.so_cay = so_cay;
    if (don_vi) garden.don_vi = don_vi;

    garden.ngay_cap_nhat = new Date();

    await garden.save();
    await garden.populate([
      { path: 'user_id', select: 'ho_ten email' },
      { path: 'season_id', select: 'ten_mua_vu nam trang_thai' }
    ]);
    
    console.log('✓ Cập nhật vườn:', ten_vuon || garden.ten_vuon);

    res.json({
      success: true,
      message: 'Cập nhật vườn thành công',
      data: garden,
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật vườn:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Chuyển mùa vụ cho vườn
const changeSeasonForGarden = async (req, res) => {
  try {
    const { season_id } = req.body;
    const gardenId = req.params.id;

    if (!season_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mùa vụ',
      });
    }

    // Kiểm tra vườn tồn tại
    const garden = await Garden.findById(gardenId);
    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Vườn không tồn tại',
      });
    }

    // Kiểm tra quyền
    const currentUser = await User.findById(req.userId);
    if (currentUser.vai_tro !== 'admin' && garden.user_id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chuyển mùa vụ cho vườn này',
      });
    }

    // Kiểm tra mùa vụ tồn tại
    const season = await Season.findById(season_id);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Mùa vụ không tồn tại',
      });
    }

    // Không cho chọn mùa vụ đã kết thúc
    if (season.trang_thai === 'Đã kết thúc') {
      return res.status(400).json({
        success: false,
        message: 'Không thể chuyển sang mùa vụ đã kết thúc',
      });
    }

    garden.season_id = season_id;
    garden.ngay_cap_nhat = new Date();
    await garden.save();
    await garden.populate([
      { path: 'user_id', select: 'ho_ten email' },
      { path: 'season_id', select: 'ten_mua_vu nam trang_thai' }
    ]);

    console.log('✓ Chuyển mùa vụ vườn:', garden.ten_vuon);

    res.json({
      success: true,
      message: 'Chuyển mùa vụ thành công',
      data: garden,
    });
  } catch (error) {
    console.error('❌ Lỗi chuyển mùa vụ:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa vườn
const deleteGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Vườn không tồn tại',
      });
    }

    // Kiểm tra quyền
    const currentUser = await User.findById(req.userId);
    if (currentUser.vai_tro !== 'admin' && garden.user_id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa vườn này',
      });
    }

    await Garden.findByIdAndDelete(req.params.id);
    console.log('✓ Xóa vườn:', garden.ten_vuon);

    res.json({
      success: true,
      message: 'Xóa vườn thành công',
    });
  } catch (error) {
    console.error('❌ Lỗi xóa vườn:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGarden,
  getGardensByUser,
  getGardenById,
  updateGarden,
  changeSeasonForGarden,
  deleteGarden,
};
