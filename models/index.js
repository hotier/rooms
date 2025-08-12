const User = require('./User');
const Room = require('./Room');
const Booking = require('./Booking');

// 定义关联关系
Room.hasMany(Booking);
Booking.belongsTo(Room);

User.hasMany(Booking);
Booking.belongsTo(User);

module.exports = {
  User,
  Room,
  Booking
};