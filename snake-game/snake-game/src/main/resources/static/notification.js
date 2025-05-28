/*
* 消息栏
* 不同的样式板 + 开启，提醒和关闭
*  Message bar
* Different style boards + on, remind and off
* */

// 公告数据示例
const notifications = [
    {id: 1, title: '开发者计划 v1.0', content: '我们正在规划以下新功能：在线🌐模式、AI 🤖对战、成就系统等，敬请期待！'},
    {id: 2, title: '版本公告 · 2025‑05‑15', content: '本次更新修复了若干已知问题并优化了性能。如果您发现任何异常🐛，请随时反馈给我们，谢谢！'},
    {id: 3, title: '关于本项目', content: '本项目由 Y 团队原创开发，旨在练手与技术积累，欢迎交流与反馈。'}
];


// DOM
const bell      = document.getElementById('notification-bell');
const dot       = document.getElementById('bell-dot');
const panel     = document.getElementById('notification-panel');
const listEl    = document.getElementById('notification-list');
const titleEl   = document.getElementById('notif-title');
const contentEl = document.getElementById('notif-content');
const closeBtn  = document.getElementById('notif-close');

// 如果有未读，则显示小红点并加摇晃动画
if (notifications.length > 0) {
    dot.style.display = 'block';
    bell.classList.add('shake');
}

// 渲染列表
function renderList() {
    listEl.innerHTML = '';
    notifications.forEach((n, idx) => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.textContent = n.title;
        item.onclick = () => showDetail(idx);
        listEl.appendChild(item);
    });
}

// 显示详情（并标记为已读、移除小红点和动画）
function showDetail(i) {
    dot.style.display = 'none';
    bell.classList.remove('shake');
    Array.from(listEl.children).forEach((el, j) => {
        el.classList.toggle('active', j === i);
    });
    titleEl.textContent   = notifications[i].title;
    contentEl.textContent = notifications[i].content;
}

// 页面加载时确保面板隐藏
window.addEventListener('DOMContentLoaded', () => {
    panel.style.display = 'none';
});

// 🔔 按钮统一处理：切换面板 + 渲染内容
bell.addEventListener('click', () => {
    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
        renderList();
        showDetail(0);
    }
});

// 关闭按钮
closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
});
