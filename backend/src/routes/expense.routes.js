const express = require('express');
const {
  createExpense,
  getExpensesByGarden,
  getExpensesBySeason,
  getAllExpensesByAdmin,
  getAllExpensesForUser,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Tất cả route cần authentication
router.use(authenticateToken);

// GET tất cả chi phí của user hiện tại
router.get('/', getAllExpensesForUser);

// Admin: Lấy tất cả chi phí
router.get('/admin/all', getAllExpensesByAdmin);

// GET chi phí theo mùa vụ
router.get('/season/:season_id', getExpensesBySeason);

// GET chi phí theo vườn
router.get('/:garden_id', getExpensesByGarden);

// POST tạo chi phí
router.post('/', createExpense);

// PUT cập nhật chi phí
router.put('/:id', updateExpense);

// DELETE xóa chi phí
router.delete('/:id', deleteExpense);

module.exports = router;
