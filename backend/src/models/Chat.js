const mongoose = require('mongoose');

/**
 * Message Schema - Lưu từng tin nhắn trong cuộc hội thoại
 * 
 * Fields:
 *   - role: 'user' hoặc 'assistant'
 *   - content: Nội dung tin nhắn
 *   - created_at: Thời gian tạo
 */
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Chat Schema - Lưu phiên chat theo từng dự đoán
 * 
 * Fields:
 *   - user_id: User chủ sở hữu phiên chat
 *   - prediction_id: Dự đoán mà user đang hỏi
 *   - messages: Array các tin nhắn (user + assistant)
 *   - created_at: Thời gian tạo phiên chat
 *   - updated_at: Thời gian cập nhật lần cuối
 */
const ChatSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prediction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true,
  },
  messages: [MessageSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Index để lấy nhanh lịch sử chat
ChatSchema.index({ user_id: 1, prediction_id: 1, created_at: -1 });
ChatSchema.index({ prediction_id: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
