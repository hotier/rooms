const { sequelize, connectDB } = require('./config/db');
const Room = require('./models/Room');
const User = require('./models/User');

// 连接数据库
console.log('正在连接到PostgreSQL...');
connectDB()
  .then(async () => {
    console.log('PostgreSQL连接成功');
    await importData();
  })
  .catch(err => {
    console.error('PostgreSQL连接失败:', err.message);
    process.exit(1);
  });

// 初始会议室数据
const rooms = [
  {
    name: '会议室A',
    capacity: 10,
    location: '一楼',
    equipment: ['wifi', 'projector'],
    description: '可容纳10人的小型会议室，配备WiFi和投影仪'
  },
  {
    name: '会议室B',
    capacity: 20,
    location: '二楼',
    equipment: ['wifi', 'projector'],
    description: '可容纳20人的中型会议室，配备WiFi和投影仪'
  },
  {
    name: '会议室C',
    capacity: 5,
    location: '一楼',
    equipment: ['wifi'],
    description: '可容纳5人的小型会议室，配备WiFi'
  },
  {
    name: '会议室D',
    capacity: 15,
    location: '三楼',
    equipment: ['wifi', 'projector'],
    description: '可容纳15人的中型会议室，配备WiFi和投影仪'
  }
];

// 初始管理员用户
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

// 导入数据函数
const importData = async () => {
  try {
    // 同步模型到数据库（创建表）
    await sequelize.sync({ force: true });
    console.log('数据库表已创建');

    // 导入新数据
    await Room.bulkCreate(rooms);
    await User.create(adminUser);

    console.log('数据导入成功');
    console.log('初始会议室已创建');
    console.log('管理员用户已创建: 用户名=admin, 密码=admin123, 角色=admin');
    process.exit(0);
  } catch (error) {
    console.error('数据导入失败:', error);
    process.exit(1);
  }
};