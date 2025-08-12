const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /bookings
// @desc    Create a booking
// @access  Private
router.post('/', [
  auth,
  check('title', '请输入会议主题').not().isEmpty(),
  check('roomId', '请选择会议室').not().isEmpty(),
  check('startTime', '请选择开始时间').not().isEmpty(),
  check('endTime', '请选择结束时间').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, roomId, startTime, endTime } = req.body;

  try {
    // 检查会议室是否存在
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: '未找到会议室' });
    }

    // 转换时间格式
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 检查时间有效性
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: '时间格式无效' });
    }

    if (start >= end) {
      return res.status(400).json({ message: '结束时间必须晚于开始时间' });
    }

    // 检查时间是否冲突
    const existingBooking = await Booking.findOne({
      where: {
        roomId,
        [Op.or]: [
          {
            [Op.and]: [
              { start_time: { [Op.lt]: end } },
              { end_time: { [Op.gt]: start } }
            ]
          }
        ]
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: '该时间段已被预约' });
    }

    // 创建新预约
    const booking = await Booking.create({
      title,
      roomId,
      userId: req.user.id,
      start_time: start,
      end_time: end
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET /bookings
// @desc    Get all bookings for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'name', 'capacity', 'location']
        }
      ],
      order: [['start_time', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE /bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: '未找到预约' });
    }

    // 检查是否是预约的创建者
    if (booking.userId !== req.user.id) {
      return res.status(401).json({ message: '无权取消此预约' });
    }

    await booking.destroy();

    res.json({ message: '预约已取消' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;