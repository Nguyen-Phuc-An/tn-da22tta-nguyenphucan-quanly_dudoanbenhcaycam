const express = require('express');
const { authenticateToken } = require('../config/auth');
const { getMaintenanceStatus, toggleMaintenanceMode } = require('../controllers/system.controller');

const router = express.Router();

router.get('/maintenance', getMaintenanceStatus);
router.patch('/maintenance', authenticateToken, toggleMaintenanceMode);

module.exports = router;