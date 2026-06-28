const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  ten_mua_vu: {
    type: String,
    required: [true, 'Vui lòng nhập tên mùa vụ'],
  },
  nam: {
    type: Number,
    required: [true, 'Vui lòng nhập năm'],
  },
  thang_bat_dau: {
    type: Number,
    min: 1,
    max: 12,
  },
  thang_ket_thuc: {
    type: Number,
    min: 1,
    max: 12,
  },
  trang_thai: {
    type: String,
    enum: ['Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc'],
    default: 'Đang diễn ra',
  },
  mo_ta: {
    type: String,
    default: '',
  },
  ngay_tao: {
    type: Date,
    default: Date.now,
  },
});

// Index để tìm kiếm nhanh theo năm
seasonSchema.index({ nam: -1, trang_thai: 1 });

module.exports = mongoose.model('Season', seasonSchema);
