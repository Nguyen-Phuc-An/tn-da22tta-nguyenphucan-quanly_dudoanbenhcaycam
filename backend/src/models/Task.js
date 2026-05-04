const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  ten_cong_viec: {
    type: String,
    required: [true, 'Vui lòng nhập tên công việc'],
  },
  mo_ta: {
    type: String,
    default: '',
  },
  dieu_kien_thuc_hien: {
    type: String,
    default: '',
  },
  ngay_tao: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Task', taskSchema);
