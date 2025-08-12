const { sequelize } = require('./config/db');
const User = require('./models/User');

async function checkAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const adminUser = await User.findOne({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      console.log('管理员用户存在:');
      console.log('用户名:', adminUser.username);
      console.log('邮箱:', adminUser.email);
      console.log('密码哈希:', adminUser.password);
      console.log('角色:', adminUser.role);
    } else {
      console.log('管理员用户不存在');
    }
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdminUser();