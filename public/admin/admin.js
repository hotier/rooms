// 加载仪表盘数据
function loadDashboardStats() {
  Promise.all([
    fetch('/api/admin/users/count'),
    fetch('/api/admin/rooms/count'),
    fetch('/api/admin/bookings/count'),
    fetch('/api/admin/bookings/today/count')
  ])
  .then(responses => Promise.all(responses.map(res => res.json())))
  .then(data => {
    document.getElementById('totalUsers').textContent = data[0].count;
    document.getElementById('totalRooms').textContent = data[1].count;
    document.getElementById('totalBookings').textContent = data[2].count;
    document.getElementById('todayBookings').textContent = data[3].count;
    })
    .catch(error => console.error('加载仪表盘数据失败:', error));

  // 加载最近预约
  loadRecentBookings();
}

// 加载最近预约
function loadRecentBookings() {
  fetch('/api/admin/bookings/recent')
    .then(res => res.json())
    .then(bookings => {
      const tableBody = document.getElementById('recentBookingsTableBody');
      tableBody.innerHTML = '';

      bookings.forEach(booking => {
        const row = document.createElement('tr');
        const status = new Date(booking.end_time) < new Date() ? '已结束' : '进行中';
        const statusClass = status === '已结束' ? 'text-gray' : 'text-green';

        row.innerHTML = `
          <td>${booking.id}</td>
          <td>${booking.title}</td>
          <td>${booking.user.username}</td>
          <td>${booking.room.name}</td>
          <td>${new Date(booking.start_time).toLocaleString()}</td>
          <td class="${statusClass}">${status}</td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(error => console.error('加载最近预约失败:', error));
}

// 加载用户列表
function loadUsers() {
  fetch('/api/admin/users')
    .then(res => res.json())
    .then(users => {
      const tableBody = document.getElementById('usersTableBody');
      tableBody.innerHTML = '';

      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.role === 'admin' ? '管理员' : '普通用户'}</td>
          <td>${new Date(user.createdAt).toLocaleString()}</td>
          <td>
            <button class="btn btn-primary edit-user" data-id="${user.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger delete-user" data-id="${user.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // 添加编辑用户事件监听
      document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
          const userId = this.getAttribute('data-id');
          editUser(userId);
        });
      });

      // 添加删除用户事件监听
      document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
          const userId = this.getAttribute('data-id');
          if (confirm('确定要删除这个用户吗？')) {
            deleteUser(userId);
          }
        });
      });
    })
    .catch(error => console.error('加载用户列表失败:', error));
}

// 加载会议室列表
function loadRooms() {
  fetch('/api/admin/rooms')
    .then(res => res.json())
    .then(rooms => {
      const tableBody = document.getElementById('roomsTableBody');
      tableBody.innerHTML = '';

      rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${room.name}</td>
          <td>${room.capacity}</td>
          <td>${room.location}</td>
          <td>${room.wifi ? '有' : '无'}</td>
          <td>${room.projector ? '有' : '无'}</td>
          <td>
            <button class="btn btn-primary edit-room" data-id="${room.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger delete-room" data-id="${room.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // 添加编辑会议室事件监听
      document.querySelectorAll('.edit-room').forEach(btn => {
        btn.addEventListener('click', function() {
          const roomId = this.getAttribute('data-id');
          editRoom(roomId);
        });
      });

      // 添加删除会议室事件监听
      document.querySelectorAll('.delete-room').forEach(btn => {
        btn.addEventListener('click', function() {
          const roomId = this.getAttribute('data-id');
          if (confirm('确定要删除这个会议室吗？')) {
            deleteRoom(roomId);
          }
        });
      });
    })
    .catch(error => console.error('加载会议室列表失败:', error));
}

// 加载预约列表
function loadBookings() {
  fetch('/api/admin/bookings')
    .then(res => res.json())
    .then(bookings => {
      const tableBody = document.getElementById('bookingsTableBody');
      tableBody.innerHTML = '';

      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.id}</td>
          <td>${booking.title}</td>
          <td>${booking.user.username}</td>
          <td>${booking.room.name}</td>
          <td>${new Date(booking.start_time).toLocaleString()}</td>
          <td>${new Date(booking.end_time).toLocaleString()}</td>
          <td>
            <button class="btn btn-danger cancel-booking" data-id="${booking.id}"><i class="fas fa-times"></i> 取消</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // 添加取消预约事件监听
      document.querySelectorAll('.cancel-booking').forEach(btn => {
        btn.addEventListener('click', function() {
          const bookingId = this.getAttribute('data-id');
          if (confirm('确定要取消这个预约吗？')) {
            cancelBooking(bookingId);
          }
        });
      });
    })
    .catch(error => console.error('加载预约列表失败:', error));
}

// 添加用户模态框
const userModal = document.getElementById('userModal');
const userModalTitle = document.getElementById('userModalTitle');
const addUserBtn = document.getElementById('addUserBtn');
const closeUserModalBtn = userModal.querySelector('.close-btn');
const cancelUserBtn = document.getElementById('cancelUserBtn');
const userForm = document.getElementById('userForm');

// 打开添加用户模态框
addUserBtn.addEventListener('click', function() {
  userModalTitle.textContent = '添加用户';
  userForm.reset();
  document.getElementById('userId').value = '';
  userModal.style.display = 'flex';
});

// 关闭用户模态框
function closeUserModal() {
  userModal.style.display = 'none';
}

closeUserModalBtn.addEventListener('click', closeUserModal);
cancelUserBtn.addEventListener('click', closeUserModal);

// 编辑用户
function editUser(userId) {
  fetch(`/api/admin/users/${userId}`)
    .then(res => res.json())
    .then(user => {
      userModalTitle.textContent = '编辑用户';
      document.getElementById('userId').value = user.id;
      document.getElementById('userUsername').value = user.username;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userPassword').value = ''; // 不显示现有密码
      document.getElementById('userRole').value = user.role;
      userModal.style.display = 'flex';
    })
    .catch(error => console.error('获取用户信息失败:', error));
}

// 提交用户表单
userForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const userId = document.getElementById('userId').value;
  const username = document.getElementById('userUsername').value;
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;

  const userData = {
    username,
    email,
    role
  };

  // 如果密码不为空，则包含密码
  if (password) {
    userData.password = password;
  }

  const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';
  const method = userId ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(res => res.json())
  .then(data => {
    closeUserModal();
    loadUsers();
    alert('操作成功！');
  })
  .catch(error => console.error('保存用户失败:', error));
});

// 删除用户
function deleteUser(userId) {
  fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  })
  .then(() => {
    loadUsers();
    alert('用户已删除！');
  })
  .catch(error => console.error('删除用户失败:', error));
}

// 添加会议室模态框
const roomModal = document.getElementById('roomModal');
const roomModalTitle = document.getElementById('roomModalTitle');
const addRoomBtn = document.getElementById('addRoomBtn');
const closeRoomModalBtn = roomModal.querySelector('.close-btn');
const cancelRoomBtn = document.getElementById('cancelRoomBtn');
const roomForm = document.getElementById('roomForm');

// 打开添加会议室模态框
addRoomBtn.addEventListener('click', function() {
  roomModalTitle.textContent = '添加会议室';
  roomForm.reset();
  document.getElementById('roomId').value = '';
  roomModal.style.display = 'flex';
});

// 关闭会议室模态框
function closeRoomModal() {
  roomModal.style.display = 'none';
}

closeRoomModalBtn.addEventListener('click', closeRoomModal);
cancelRoomBtn.addEventListener('click', closeRoomModal);

// 编辑会议室
function editRoom(roomId) {
  fetch(`/api/admin/rooms/${roomId}`)
    .then(res => res.json())
    .then(room => {
      roomModalTitle.textContent = '编辑会议室';
      document.getElementById('roomId').value = room.id;
      document.getElementById('roomName').value = room.name;
      document.getElementById('roomCapacity').value = room.capacity;
      document.getElementById('roomLocation').value = room.location;
      document.getElementById('roomWifi').value = room.wifi.toString();
      document.getElementById('roomProjector').value = room.projector.toString();
      roomModal.style.display = 'flex';
    })
    .catch(error => console.error('获取会议室信息失败:', error));
}

// 提交会议室表单
roomForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const roomId = document.getElementById('roomId').value;
  const name = document.getElementById('roomName').value;
  const capacity = document.getElementById('roomCapacity').value;
  const location = document.getElementById('roomLocation').value;
  const wifi = document.getElementById('roomWifi').value === 'true';
  const projector = document.getElementById('roomProjector').value === 'true';

  const roomData = {
    name,
    capacity,
    location,
    wifi,
    projector
  };

  const url = roomId ? `/api/admin/rooms/${roomId}` : '/api/admin/rooms';
  const method = roomId ? 'PUT' : 'POST';

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roomData)
  })
  .then(res => res.json())
  .then(data => {
    closeRoomModal();
    loadRooms();
    alert('操作成功！');
  })
  .catch(error => console.error('保存会议室失败:', error));
});

// 删除会议室
function deleteRoom(roomId) {
  fetch(`/api/admin/rooms/${roomId}`, {
    method: 'DELETE'
  })
  .then(() => {
    loadRooms();
    alert('会议室已删除！');
  })
  .catch(error => console.error('删除会议室失败:', error));
}

// 取消预约
function cancelBooking(bookingId) {
  fetch(`/api/admin/bookings/${bookingId}`, {
    method: 'DELETE'
  })
  .then(() => {
    loadBookings();
    alert('预约已取消！');
  })
  .catch(error => console.error('取消预约失败:', error));
}

// 登出功能已移至个人资料按钮

// 初始加载仪表盘数据已在 checkAdminAuth 函数中完成
// 无需重复调用 loadDashboardStats()

// 确保DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查管理员认证状态
  checkAdminAuth();

  // 侧边栏菜单切换
  const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li[data-target]');
  const contentSections = document.querySelectorAll('.content-section');

  sidebarMenuItems.forEach(item => {
    item.addEventListener('click', function() {
      // 移除所有活动状态
      sidebarMenuItems.forEach(menuItem => menuItem.classList.remove('active'));
      contentSections.forEach(section => section.classList.remove('active'));

      // 添加当前活动状态
      this.classList.add('active');
      const target = this.getAttribute('data-target');
      document.getElementById(target).classList.add('active');

      // 如果切换到用户、会议室或预约管理页面，加载对应数据
      if (target === 'users') {
        loadUsers();
      } else if (target === 'rooms') {
        loadRooms();
      } else if (target === 'bookings') {
        loadBookings();
      } else if (target === 'dashboard') {
        loadDashboardStats();
      }
    });
  });

  // 添加用户模态框相关事件
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      userModalTitle.textContent = '添加用户';
      userForm.reset();
      document.getElementById('userId').value = '';
      userModal.style.display = 'flex';
    });
  }

  // 添加会议室模态框相关事件
  const addRoomBtn = document.getElementById('addRoomBtn');
  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', function() {
      roomModalTitle.textContent = '添加会议室';
      roomForm.reset();
      document.getElementById('roomId').value = '';
      roomModal.style.display = 'flex';
    });
  }

  // 个人资料下拉菜单功能
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutLink = document.getElementById('logoutLink');

  // 切换下拉菜单显示/隐藏
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function(event) {
      event.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function() {
      if (profileDropdown.classList.contains('show')) {
        profileDropdown.classList.remove('show');
      }
    });

    // 阻止下拉菜单内部点击事件冒泡
    profileDropdown.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }

  // 退出登录功能
  if (logoutLink) {
    logoutLink.addEventListener('click', function(event) {
      event.preventDefault();
      // 显示确认登出对话框
      if (confirm('确定要退出登录吗？')) {
        fetch('/api/users/logout')
          .then(() => {
            window.location.href = '/';
          })
          .catch(error => console.error('登出失败:', error));
      }
    });
  }

  // 侧边栏切换功能
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    // 初始设置图标
    const icon = sidebarToggle.querySelector('i');
    if (icon) {
      if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
    }

    // 点击事件
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      // 切换图标
      const icon = this.querySelector('i');
      if (icon) {
        if (sidebar.classList.contains('collapsed')) {
          icon.classList.remove('fa-chevron-left');
          icon.classList.add('fa-chevron-right');
        } else {
          icon.classList.remove('fa-chevron-right');
          icon.classList.add('fa-chevron-left');
        }
      }
    });
  }
});

function checkAdminAuth() {
  fetch('/api/users/me', { credentials: 'include' })
    .then(res => {
      if (!res.ok) {
        // 如果响应状态码不是2xx，重定向到登录页面
        window.location.href = '/';
        return Promise.reject('未登录或会话过期');
      }
      // 检查响应是否为JSON
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return res.json();
      } else {
        // 如果不是JSON，重定向到登录页面
        window.location.href = '/';
        return Promise.reject('响应不是JSON格式');
      }
    })
    .then(user => {
      if (user.role !== 'admin') {
        alert('您没有管理员权限');
        window.location.href = '/';
      } else {
        // 更新用户名显示
        document.getElementById('dropdownUsername').textContent = user.username;
        document.getElementById('dropdownEmail').textContent = user.email;
        // 更新头像
        const avatarImg = document.querySelector('.profile-avatar');
        if (avatarImg) {
          // 使用用户名生成头像
          avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=0D8ABC&color=fff`;
        }
        // 根据用户角色显示/隐藏不同的管理菜单
        showAdminMenusBasedOnRole(user.role);
      }
    })
    .catch(error => {
      console.error('检查权限失败:', error);
      // 已经在前面处理了重定向，这里不需要再次重定向
    });
}

// 根据角色显示/隐藏管理菜单
function showAdminMenusBasedOnRole(role) {
  // 获取所有菜单项
  const menuItems = document.querySelectorAll('.sidebar-menu li');

  // 对于管理员角色，显示所有菜单
  if (role === 'admin') {
    menuItems.forEach(item => {
      item.style.display = 'block';
    });
  } else {
    // 对于非管理员角色，可以根据需要隐藏某些菜单
    // 这里只是示例，实际应用中可能需要更复杂的逻辑
    menuItems.forEach(item => {
      const target = item.getAttribute('data-target');
      if (target === 'users') {
        item.style.display = 'none';
      } else {
        item.style.display = 'block';
      }
    });
  }
}

// 文件结束