const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const Room = require('../models/Room');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// @route   GET /rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.findAll({
      order: [['name', 'ASC']]
    });
    res.json(rooms);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET /rooms/:id
// @desc    Get room by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ message: '未找到会议室' });
    }

    res.json(room);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET /rooms/:id/availability
// @desc    Check room availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: '请提供开始和结束时间' });
    }

    // 验证时间格式
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ message: '时间格式无效' });
    }

    // 检查会议室是否存在
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: '未找到会议室' });
    }

    // 检查是否有冲突的预约
    const conflictingBookings = await Booking.findAll({
      where: {
        roomId: req.params.id,
        [Op.or]: [
          {
            [Op.and]: [
              { start_time: { [Op.lt]: endTime } },
              { end_time: { [Op.gt]: startTime } }
            ]
          }
        ]
      }
    });

    res.json({
      available: conflictingBookings.length === 0,
      conflictingBookings: conflictingBookings
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST /rooms
// @desc    Create a room
// @access  Private
router.post('/', auth, [
  check('name', '会议室名称不能为空').not().isEmpty(),
  check('capacity', '容量必须是正整数').isInt({ min: 1 }),
  check('location', '位置不能为空').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, capacity, location, equipment, description } = req.body;

  try {
    // 检查会议室是否已存在
    let room = await Room.findOne({
      where: { name }
    });

    if (room) {
      return res.status(400).json({ message: '会议室已存在' });
    }

    // 创建新会议室
    room = await Room.create({
      name,
      capacity,
      location,
      equipment: equipment || [],
      description
    });

    res.status(201).json(room);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;