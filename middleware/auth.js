module.exports = function(req, res, next) {
  // 检查用户是否已登录
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '未授权，请先登录' });
};