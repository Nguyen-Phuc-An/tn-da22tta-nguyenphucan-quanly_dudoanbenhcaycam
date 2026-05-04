const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  ho_ten: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    minlength: 3,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Vui lòng nhập email hợp lệ'],
  },
  mat_khau: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 6,
    select: false, // Không trả về mật khẩu khi query
  },
  vai_tro: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  is_locked: {
    type: Boolean,
    default: false,
  },
  ngay_tao: {
    type: Date,
    default: Date.now,
  },
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('mat_khau')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.mat_khau = await bcrypt.hash(this.mat_khau, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function (matKhauNhap) {
  return await bcrypt.compare(matKhauNhap, this.mat_khau);
};

module.exports = mongoose.model('User', userSchema);
