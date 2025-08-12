// DOM 元素
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userEmail = document.getElementById('userEmail');
const adminBtn = document.getElementById('adminBtn');
const userMenu = document.getElementById('userMenu');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const bookingModal = document.getElementById('bookingModal');
const closeBtns = document.querySelectorAll('.close-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const bookingForm = document.getElementById('bookingForm');
const roomsContainer = document.getElementById('roomsContainer');
const bookingsContainer = document.getElementById('bookingsContainer');

// 头像点击事件
userAvatar.addEventListener('click', () => {
  userMenu.classList.toggle('hidden');
});

// 点击页面其他地方关闭菜单
window.addEventListener('click', (e) => {
  if (!userProfile.contains(e.target)) {
    userMenu.classList.add('hidden');
  }
});

// 管理后台按钮点击事件
adminBtn.addEventListener('click', () => {
  window.location.href = '/admin/index.html';
  userMenu.classList.add('hidden');
});

// 显示模态框
function showModal(modal) {
  modal.style.display = 'flex';
}

// 隐藏模态框
function hideModal(modal) {
  modal.style.display = 'none';
}

// 检查用户是否已登录
function checkAuth() {
  console.log('检查用户认证状态...');
  fetch('/api/users/me', {
    credentials: 'include'
  })
    .then(res => {
      console.log('checkAuth response status:', res.status);
      if (res.status === 401) {
        throw new Error('未登录');
      }
      return res.json();
    })
    .then(data => {
      console.log('用户已登录:', data);
      // 用户已登录
      const user = data;
      userEmail.textContent = user.email;
      userProfile.classList.remove('hidden');
      loginBtn.classList.add('hidden');
      registerBtn.classList.add('hidden');
      loadBookings();
      
      // 如果是管理员，显示管理后台按钮
      if (user.role === 'admin') {
        console.log('管理员用户');
        adminBtn.classList.remove('hidden');
      } else {
        adminBtn.classList.add('hidden');
      }
    })
    .catch(err => {
      // 用户未登录
      console.log('用户未登录:', err.message);
      userProfile.classList.add('hidden');
      userMenu.classList.add('hidden');
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      bookingsContainer.innerHTML = '<p>请先登录查看预约</p>';
    });
}

// 退出登录按钮点击事件
logoutBtn.addEventListener('click', () => {
  fetch('/api/users/logout', {
    method: 'POST',
    credentials: 'include'
  })
    .then(() => {
      // 注销成功，更新UI
      userProfile.classList.add('hidden');
      userMenu.classList.add('hidden');
      loginBtn.classList.remove('hidden');
      registerBtn.classList.remove('hidden');
      bookingsContainer.innerHTML = '<p>请先登录查看预约</p>';
      alert('注销成功');
    })
    .catch(err => {
      console.error('注销失败:', err);
      alert('注销失败，请重试');
    });
  userMenu.classList.add('hidden');
});

// 页面加载完成后检查登录状态
window.addEventListener('load', () => {
  console.log('页面加载完成，检查登录状态...');
  checkAuth();
  loadRooms();
})

// 加载会议室列表
function loadRooms() {
  fetch('/api/rooms')
    .then(res => res.json())
    .then(data => {
      const rooms = data;
      let html = '';

      rooms.forEach(room => {
        html += `
          <div class="room-card">
            <div class="room-card-header">
              ${room.name}
            </div>
            <div class="room-card-body">
              <p><i class="fas fa-chair"></i> 容量: ${room.capacity}人</p>
              <p><i class="fas fa-map-marker-alt"></i> 位置: ${room.location}</p>
              <p><i class="fas fa-wifi"></i> WiFi: ${room.wifi ? '有' : '无'}</p>
              <p><i class="fas fa-tv"></i> 投影仪: ${room.projector ? '有' : '无'}</p>
            </div>
            <div class="room-card-footer">
              <button class="btn btn-primary" onclick="bookRoom('${room.id}', '${room.name}')">预约</button>
            </div>
          </div>
        `;
      });

      roomsContainer.innerHTML = html;
    })
    .catch(err => {
      console.error('加载会议室失败', err);
      roomsContainer.innerHTML = '<p>加载会议室失败，请稍后重试</p>';
    });
}

// 加载我的预约
function loadBookings() {
  fetch('/api/bookings')
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('请先登录');
        }
        throw new Error('加载预约失败: ' + res.statusText);
      }
      return res.json();
    })
    .then(data => {
      const bookings = data;
      let html = '';

      // 确保bookings是数组
      if (!Array.isArray(bookings)) {
        html = '<p>加载预约数据格式错误</p>';
      } else if (bookings.length === 0) {
        html = '<p>暂无预约记录</p>';
      } else {
        html = `
          <table class="booking-table">
            <thead>
              <tr>
                <th>会议主题</th>
                <th>会议室</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
        `;

        bookings.forEach(booking => {
          const startTime = new Date(booking.start_time).toLocaleString();
          const endTime = new Date(booking.end_time).toLocaleString();

          html += `
            <tr>
              <td>${booking.title}</td>
              <td>${booking.room.name}</td>
              <td>${startTime}</td>
              <td>${endTime}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking.id}')">取消</button>
              </td>
            </tr>
          `;
        });

        html += `
            </tbody>
          </table>
        `;
      }

      bookingsContainer.innerHTML = html;
    })
    .catch(err => {
      console.error('加载预约失败', err);
      // 显示具体的错误信息
      bookingsContainer.innerHTML = `<p>错误: ${err.message || '加载预约失败，请稍后重试'}</p>`;
    });
}

// 预约会议室
function bookRoom(roomId, roomName) {
  // 检查用户是否已登录
  fetch('/api/users/me')
    .then(res => res.json())
    .then(() => {
      // 用户已登录，显示预约模态框
      document.getElementById('roomId').value = roomId;
      document.getElementById('roomName').value = roomName;
      showModal(bookingModal);
    })
    .catch(() => {
      // 用户未登录，显示登录模态框
      alert('请先登录');
      showModal(loginModal);
    });
}

// 取消预约
function cancelBooking(bookingId) {
  if (confirm('确定要取消此预约吗？')) {
    fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      alert('预约已取消');
      loadBookings();
    })
    .catch(err => {
      console.error('取消预约失败', err);
      alert('取消预约失败，请稍后重试');
    });
  }
}

// 事件监听器
loginBtn.addEventListener('click', () => showModal(loginModal));
registerBtn.addEventListener('click', () => showModal(registerModal));
logoutBtn.addEventListener('click', () => {
  fetch('/api/users/logout')
    .then(res => res.json())
    .then(() => {
      checkAuth();
    })
    .catch(err => {
      console.error('退出登录失败', err);
    });
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    hideModal(loginModal);
    hideModal(registerModal);
    hideModal(bookingModal);
  });
});

// 点击模态框外部关闭模态框
window.addEventListener('click', (e) => {
  if (e.target === loginModal) hideModal(loginModal);
  if (e.target === registerModal) hideModal(registerModal);
  if (e.target === bookingModal) hideModal(bookingModal);
});

// 登录表单提交
// 为了测试，我们在控制台输出当前使用的凭据
  loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  console.log('尝试登录 with:', email, password);

  fetch('/api/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      console.log('Login response status:', res.status);
      if (!res.ok) {
        // 处理非 2xx 响应
        return res.text().then(text => {
          throw { status: res.status, message: text };
        });
      }
      return res.json();
    })
  .then(data => {
    hideModal(loginModal);
    checkAuth();
    alert('登录成功');
  })
  .catch(err => {
    console.error('登录失败', err);
    if (err.status === 401) {
      alert('认证失败：无效的邮箱或密码');
    } else if (err.status === 500) {
      alert('服务器错误：' + err.message);
    } else {
      alert('登录失败，请检查邮箱和密码');
    }
  });
});

// 注册表单提交
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  fetch('/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  })
  .then(res => res.json())
  .then(data => {
    hideModal(registerModal);
    checkAuth();
    alert('注册成功');
  })
  .catch(err => {
    console.error('注册失败', err);
    // 处理错误响应
    if (err instanceof TypeError) {
      // 网络错误
      alert('网络连接错误，请检查您的网络并稍后重试');
    } else {
      // 尝试解析错误响应
      try {
        // 假设响应体可以从err中获取
        if (err.response && err.response.data) {
          if (err.response.data.message) {
            alert(err.response.data.message);
          } else if (err.response.data.errors) {
            alert(err.response.data.errors[0].msg);
          } else {
            alert('注册失败，请稍后重试');
          }
        } else {
          alert('注册失败，请稍后重试');
        }
      } catch (e) {
        alert('注册失败，请稍后重试');
      }
    }
  });
});

// 预约表单提交
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const roomId = document.getElementById('roomId').value;
  const title = document.getElementById('bookingTitle').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ roomId, title, startTime, endTime })
  })
  .then(res => res.json())
  .then(data => {
    hideModal(bookingModal);
    loadBookings();
    alert('预约成功');
  })
  .catch(err => {
    console.error('预约失败', err);
    // 处理错误响应
    if (err instanceof TypeError) {
      // 网络错误
      alert('网络连接错误，请检查您的网络并稍后重试');
    } else {
      // 尝试解析错误响应
      try {
        // 假设响应体可以从err中获取
        if (err.response && err.response.data) {
          if (err.response.data.message) {
            alert(err.response.data.message);
          } else if (err.response.data.errors) {
            alert(err.response.data.errors[0].msg);
          } else {
            alert('预约失败，请稍后重试');
          }
        } else {
          alert('预约失败，请稍后重试');
        }
      } catch (e) {
        alert('预约失败，请稍后重试');
      }
    }
  });
});

// 初始化
window.onload = function() {
  checkAuth();
  loadRooms();
};

// 将函数暴露给全局窗口对象
window.bookRoom = bookRoom;
window.cancelBooking = cancelBooking;
// Axios 已替换为原生 fetch API，相关脚本标签已移除
console.log('main.js 已加载 - 版本 1.0');