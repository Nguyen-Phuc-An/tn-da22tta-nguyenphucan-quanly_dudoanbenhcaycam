const express = require('express');
const { register, login, getProfile, getAllUsers, lockUser, changePassword } = require('../controllers/user.controller');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Đăng ký (không cần authentication)
router.post('/register', register);

// Đăng nhập (không cần authentication)
router.post('/login', login);

// Lấy profile (cần authentication)
router.get('/profile', authenticateToken, getProfile);

// Lấy danh sách user (cần authentication + admin role)
router.get('/', authenticateToken, getAllUsers);

// Khóa/Mở khóa user (cần authentication + admin role)
router.patch('/:userId/lock', authenticateToken, lockUser);

// Đổi mật khẩu (cần authentication)
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
