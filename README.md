# 会议室预约系统 (Node.js 版本)

这是一个基于Node.js的会议室预约系统，允许用户注册、登录、查看会议室列表、预约会议室以及管理自己的预约。

## 技术栈
- 后端: Node.js, Express, MongoDB, Mongoose
- 前端: HTML, CSS, JavaScript, Axios
- 认证: Passport.js

## 功能特点
- 用户注册和登录
- 查看会议室列表和详情
- 预约会议室
- 查看和取消自己的预约
- 检查会议室可用性

## 环境要求
- Node.js (v14.0.0 或更高版本)
- MongoDB (v4.0.0 或更高版本)

## 安装和运行

1. 确保已安装MongoDB并启动服务

2. 克隆或下载此项目

3. 安装依赖
```bash
cd d:\pyprogram\rooms
npm install
```

4. 启动应用
```bash
npm start
```
或使用开发模式(自动重启)
```bash
npm run dev
```

5. 在浏览器中访问
打开 http://localhost:5000 即可使用应用

## 项目结构
```
rooms/
├── config/
│   ├── db.js         # 数据库连接配置
│   └── passport.js   # Passport认证配置
├── middleware/
│   └── auth.js       # 认证中间件
├── models/
│   ├── User.js       # 用户模型
│   ├── Room.js       # 会议室模型
│   └── Booking.js    # 预约模型
├── routes/
│   ├── users.js      # 用户路由
│   ├── rooms.js      # 会议室路由
│   └── bookings.js   # 预约路由
├── public/
│   ├── index.html    # 前端入口页面
│   ├── styles.css    # 样式文件
│   └── main.js       # 前端交互逻辑
├── app.js            # 应用入口文件
├── package.json      # 项目依赖
└── README.md         # 项目说明
```

## 注意事项
1. 确保MongoDB服务已启动
2. 默认端口为5000，如需更改可在app.js中修改
3. 首次使用时，系统会自动创建必要的数据库集合