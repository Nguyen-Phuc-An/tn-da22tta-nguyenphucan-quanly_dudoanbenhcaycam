const express = require('express');
const {
  getSeasons,
  getAllSeasonsByAdmin,
  getSeasonById,
  createSeason,
  updateSeason,
  deleteSeason,
} = require('../controllers/season.controller');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Lấy tất cả mùa vụ (public)
router.get('/', getSeasons);

// Lấy chi tiết mùa vụ (public)
router.get('/:id', getSeasonById);

// Routes phía dưới cần authentication
router.use(authenticateToken);

// Admin: Lấy tất cả mùa vụ (với permission check)
router.get('/admin/all', getAllSeasonsByAdmin);

// Tạo mùa vụ mới (admin)
router.post('/', createSeason);

// Cập nhật mùa vụ (admin)
router.put('/:id', updateSeason);

// Xóa mùa vụ (admin)
router.delete('/:id', deleteSeason);

module.exports = router;
