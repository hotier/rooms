const { Sequelize } = require('sequelize');

// 从环境变量或直接使用连接字符串
const sequelize = new Sequelize('postgresql://neondb_owner:npg_AwDLEt1qgyz6@ep-quiet-tree-a1stdmv5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // 对于某些云服务可能需要此选项
    }
  }
});

// 测试连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL连接成功');
    return sequelize;
  } catch (error) {
    console.error('PostgreSQL连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };