const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  ten_benh: {
    type: String,
    required: [true, 'Vui lòng nhập tên bệnh'],
    unique: true,
  },
  mo_ta: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả'],
  },
  nguyen_nhan: {
    type: String,
    default: '',
  },
  trieu_chung: {
    type: String,
    default: '',
  },
  huong_xu_ly: {
    type: String,
    required: [true, 'Vui lòng nhập hướng xử lý'],
  },
  loai_cay_bi_anh_huong: {
    type: [String],
    default: [],
  },
  muc_do_nguy_hiem: {
    type: String,
    enum: ['Không', 'Thấp', 'Trung bình', 'Cao'],
    default: 'Trung bình',
  },
  goi_y_phan_bon: {
    type: [String],
    default: [],
  },
  goi_y_thuoc: {
    type: [String],
    default: [],
  },
  ten_benh_en: {
    type: String,
    required: true,
    unique: true,
  },
  ngay_tao: {
    type: Date,
    default: Date.now,
  },
});

// Index để tìm kiếm nhanh
diseaseSchema.index({ ten_benh: 1 });
diseaseSchema.index({ ten_benh_en: 1 });

module.exports = mongoose.model('Disease', diseaseSchema);
