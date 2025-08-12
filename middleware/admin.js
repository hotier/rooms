const admin = (req, res, next) => {
  try {
    // 检查用户是否已登录
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: '未授权访问' });
    }

    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足，需要管理员权限' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

module.exports = admin;