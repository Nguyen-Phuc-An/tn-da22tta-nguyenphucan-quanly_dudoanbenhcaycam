const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { readSiteState, writeSiteState } = require('../utils/siteState');

const getAuthToken = (req) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.query.token) {
    token = req.query.token;
  }

  return token;
};

const getUserFromToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.userId);

    if (!user) return null;

    return {
      userId: user._id.toString(),
      role: user.vai_tro,
    };
  } catch (error) {
    return null;
  }
};

const getMaintenanceStatus = async (req, res) => {
  try {
    const state = readSiteState();

    res.json({
      success: true,
      data: {
        maintenanceMode: state.maintenanceMode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleMaintenanceMode = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser || currentUser.vai_tro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin only',
      });
    }

    const state = readSiteState();
    const nextMaintenanceMode = typeof req.body?.maintenanceMode === 'boolean'
      ? req.body.maintenanceMode
      : !state.maintenanceMode;

    const updatedState = writeSiteState({ maintenanceMode: nextMaintenanceMode });

    res.json({
      success: true,
      message: updatedState.maintenanceMode
        ? 'Đã bật chế độ bảo trì'
        : 'Đã tắt chế độ bảo trì',
      data: {
        maintenanceMode: updatedState.maintenanceMode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMaintenanceBypassUser = async (req) => {
  const token = getAuthToken(req);
  return getUserFromToken(token);
};

module.exports = {
  getMaintenanceStatus,
  toggleMaintenanceMode,
  getMaintenanceBypassUser,
};