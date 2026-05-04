const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksByAdmin,
} = require('../controllers/task.controller');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Tất cả route cần authentication
router.use(authenticateToken);

// GET lấy tất cả công việc
router.get('/', getTasks);

// GET chi tiết công việc
router.get('/:id', getTaskById);

// POST tạo công việc mới (admin only)
router.post('/', createTask);

// PUT cập nhật công việc (admin only)
router.put('/:id', updateTask);

// DELETE xóa công việc (admin only)
router.delete('/:id', deleteTask);

module.exports = router;
