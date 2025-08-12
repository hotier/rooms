const express = require('express');
const router = express.Router();
const { User, Room, Booking } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// 获取用户数量
router.get('/users/count', [auth, admin], async (req, res) => {
  try {
    const count = await User.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取会议室数量
router.get('/rooms/count', [auth, admin], async (req, res) => {
  try {
    const count = await Room.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取预约数量
router.get('/bookings/count', [auth, admin], async (req, res) => {
  try {
    const count = await Booking.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取今日预约数量
router.get('/bookings/today/count', [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Booking.count({
      where: {
        start_time: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有用户
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个用户
router.get('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建用户
router.post('/users', [auth, admin], async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }

    // 创建用户 - 密码会在模型的beforeCreate钩子中自动加密
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户
router.put('/users/:id', [auth, admin], async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查用户名或邮箱是否已被其他用户使用
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ],
        id: { [Op.ne]: req.params.id }
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被使用' });
    }

    // 更新用户信息
    user.username = username;
    user.email = email;
    if (role) {
      user.role = role;
    }

    // 如果提供了密码，则更新密码
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      message: '用户更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除用户
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 不允许删除自己
    if (user.id === req.user.id) {
      return res.status(400).json({ message: '不允许删除自己的账号' });
    }

    await user.destroy();

    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户角色
router.put('/users/:id/role', [auth, admin], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ message: '角色必须是user或admin' });
    }

    user.role = role;
    await user.save();

    res.json({ message: '用户角色更新成功', user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }});
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有会议室
router.get('/rooms', [auth, admin], async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [['name', 'ASC']]
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个会议室
router.get('/rooms/:id', [auth, admin], async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: '会议室不存在' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 创建会议室
router.post('/rooms', [auth, admin, [
  check('name').notEmpty().withMessage('会议室名称不能为空'),
  check('capacity').isInt({ min: 1 }).withMessage('容量必须是正整数'),
  check('location').notEmpty().withMessage('位置不能为空')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, capacity, location, wifi, projector } = req.body;

    const room = await Room.create({
      name,
      capacity,
      location,
      wifi: wifi || false,
      projector: projector || false
    });

    res.status(201).json({ message: '会议室创建成功', room });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新会议室
router.put('/rooms/:id', [auth, admin, [
  check('name').notEmpty().withMessage('会议室名称不能为空'),
  check('capacity').isInt({ min: 1 }).withMessage('容量必须是正整数'),
  check('location').notEmpty().withMessage('位置不能为空')
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, capacity, location, wifi, projector } = req.body;
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: '会议室不存在' });
    }

    room.name = name;
    room.capacity = capacity;
    room.location = location;
    room.wifi = wifi;
    room.projector = projector;

    await room.save();

    res.json({ message: '会议室更新成功', room });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除会议室
router.delete('/rooms/:id', [auth, admin], async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: '会议室不存在' });
    }

    await room.destroy();

    res.json({ message: '会议室删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有预约
router.get('/bookings', [auth, admin], async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: ['user', 'room'],
      order: [['start_time', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取最近预约
router.get('/bookings/recent', [auth, admin], async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['start_time', 'DESC']],
      limit: 10
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;