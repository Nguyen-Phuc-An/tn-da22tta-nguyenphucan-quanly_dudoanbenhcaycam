const express = require('express');
const { authenticateToken } = require('../config/auth');
const { chatWithAI, getChatByPrediction } = require('../controllers/chat.controller');

const router = express.Router();

// ✓ Tất cả route yêu cầu JWT authentication
router.use(authenticateToken);

/**
 * POST /api/chat
 * Chat với AI về bệnh đã dự đoán
 * 
 * Request:
 *   {
 *     "prediction_id": "65f1234567890abcdef",
 *     "message": "Bệnh này xảy ra do đâu?"
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "chat_id": "...",
 *       "disease_name": "Bệnh loét",
 *       "user_message": "...",
 *       "ai_reply": "...",
 *       "ngay_chat": "2026-03-30..."
 *     }
 *   }
 */
router.post('/', chatWithAI);

/**
 * GET /api/chat/:prediction_id
 * Lấy lịch sử chat của 1 dự đoán
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "_id": "...",
 *       "messages": [
 *         {
 *           "role": "user",
 *           "content": "...",
 *           "created_at": "..."
 *         },
 *         {
 *           "role": "assistant",
 *           "content": "...",
 *           "created_at": "..."
 *         }
 *       ],
 *       "created_at": "...",
 *       "updated_at": "..."
 *     }
 *   }
 */
router.get('/:prediction_id', getChatByPrediction);

module.exports = router;
