const express = require('express');
const router = express.Router();
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const User = require('../models/User');

// @route   POST /users/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  check('username', '用户名至少需要4个字符').isLength({ min: 4 }),
  check('email', '请输入有效的邮箱地址').isEmail(),
  check('password', '密码至少需要6个字符').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (user) {
      return res.status(400).json({ message: '用户已存在' });
    }

    user = await User.create({
      username,
      email,
      password
    });

    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '服务器错误' });
      }
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        message: '注册成功'
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST /users/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || '认证失败' });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        message: '登录成功'
      });
    });
  })(req, res, next);
});

// @route   GET /users/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: '退出登录失败' });
    }
    res.status(200).json({ message: '退出登录成功' });
  });
});

// @route   GET /users/me
// @desc    Get current user
// @access  Private
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '未认证' });
  }
  res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
});

module.exports = router;