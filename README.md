# 会议室预约系统 (Node.js 版本)

这是一个基于Node.js的会议室预约系统，允许用户注册、登录、查看会议室列表、预约会议室以及管理自己的预约。管理员可以管理用户、会议室和预约。

## 技术栈
- 后端: Node.js, Express, PostgreSQL, Sequelize
- 前端: HTML, CSS, JavaScript, Axios
- 认证: Passport.js
- 中间件: CORS

## 功能特点
- 用户注册和登录
- 查看会议室列表和详情
- 预约会议室
- 查看和取消自己的预约
- 检查会议室可用性
- 管理员面板
- 用户权限管理

## 环境要求
- Node.js (v14.0.0 或更高版本)
- PostgreSQL (v13.0.0 或更高版本)

## 安装和运行

1. 确保已安装PostgreSQL并启动服务

2. 创建数据库
```bash
createdb meeting_rooms
```

3. 克隆或下载此项目

4. 安装依赖
```bash
cd d:\pyprogram\rooms
npm install
```

5. 配置数据库连接
修改config/db.js文件中的数据库连接配置

6. 初始化应用
```bash
node init.js
```

5. 启动应用
```bash
npm start
```
或使用开发模式(自动重启)
```bash
npm run dev
```

6. 在浏览器中访问
打开 http://localhost:5000 即可使用应用
管理员面板: http://localhost:5000/admin

## 项目结构
```
rooms/
├── README.md
├── app.js            # 应用入口文件
├── checkUser.js      # 用户检查工具
├── config/
│   ├── db.js         # 数据库连接配置
│   └── passport.js   # Passport认证配置
├── helpers/
├── init.js           # 初始化脚本
├── middleware/
│   ├── admin.js      # 管理员权限中间件
│   └── auth.js       # 认证中间件
├── models/
│   ├── Booking.js    # 预约模型
│   ├── Room.js       # 会议室模型
│   ├── User.js       # 用户模型
│   └── index.js      # 模型索引
├── package-lock.json
├── package.json      # 项目依赖
├── public/
│   ├── admin/
│   │   ├── admin.js  # 管理员面板逻辑
│   │   ├── admin_backup.js
│   │   └── index.html # 管理员面板页面
│   ├── index.html    # 前端入口页面
│   ├── main.js       # 前端交互逻辑
│   ├── styles.css    # 样式文件
│   ├── test-admin-login.html
│   └── test.html
└── routes/
    ├── admin.js      # 管理员路由
    ├── bookings.js   # 预约路由
    ├── rooms.js      # 会议室路由
    └── users.js      # 用户路由
```

## 注意事项
1. 确保PostgreSQL服务已启动
2. 默认端口为5000，如需更改可在app.js中修改
3. 首次使用时，运行`node init.js`初始化应用
4. 管理员账号默认初始化为admin@example.com，密码为password
5. 确保已正确配置config/db.js中的数据库连接信息

## 新功能开发计划

### 近期计划
1. **通知系统** - 实现邮件或短信通知功能，用于预约确认、提醒和变更通知
2. **会议室图片上传** - 允许管理员上传会议室照片
3. **时间段优化** - 提供更灵活的预约时间段选择
4. **报表生成** - 生成会议室使用统计报表

### 中期计划
1. **日历集成** - 与Google Calendar、Outlook等第三方日历集成
2. **移动端适配** - 优化移动端使用体验
3. **多语言支持** - 添加多语言支持
4. **冲突解决** - 实现更智能的预约冲突解决机制

### 远期计划
1. **AI辅助调度** - 使用AI算法优化会议室调度
2. **视频会议集成** - 与Zoom、Teams等视频会议系统集成
3. **物联网集成** - 与智能会议室设备集成
4. **数据分析仪表盘** - 提供高级数据分析和可视化