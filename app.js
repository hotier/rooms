const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

const { sequelize, connectDB } = require('./config/db');
const passportConfig = require('./config/passport');

// 路由文件
const usersRoutes = require('./routes/users');
const roomsRoutes = require('./routes/rooms');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();

// 连接数据库
connectDB().then(async () => {
  // 同步模型到数据库
  try {
    // 注意：在生产环境中，应该使用迁移而不是sync({ alter: true })
    await sequelize.sync({ alter: true });
    console.log('数据库模型已同步');
  } catch (error) {
    console.error('数据库模型同步失败:', error.message);
  }
});

// 中间件
app.use(cors({ credentials: true, origin: 'http://localhost:5000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 会话配置
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport 初始化
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// 注册路由
app.use('/api/users', usersRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);

// 提供前端静态文件
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器错误',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});