// Leaderboard.js
/*
* 排行榜
* 表单逻辑 + 排序逻辑 +前三名特殊样式 + 获取相关死亡的数据
* list
* Form Logic + Sorting Logic + Top 3 Special Styles + Get Data on Related Deaths
* */
window.addEventListener('DOMContentLoaded', () => {
    const lbBtn     = document.getElementById('view-leaderboard');
    const lbModal   = document.getElementById('leaderboard-modal');
    const lbClose   = document.getElementById('lb-close');
    const scopeSel  = document.getElementById('lb-scope');
    const periodSel = document.getElementById('lb-period');
    const tabBtns   = Array.from(document.querySelectorAll('.lb-tab'));
    const listEl    = document.getElementById('lb-list');
    const TOP_N     = 20;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        #lb-list {
            counter-reset: rank;
            list-style: none;
            padding: 0;
            margin: 0;
            max-height: 400px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.2) transparent;
        }
        #lb-list::-webkit-scrollbar {
            width: 8px;
        }
        #lb-list::-webkit-scrollbar-track {
            background: transparent;
        }
        #lb-list::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.2);
            border-radius: 4px;
        }
        #lb-list li {
            counter-increment: rank;
            padding: 12px 20px;
            margin: 8px 0;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        }
        #lb-list li[data-mode="free"] {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        #lb-list li[data-mode="level"] {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        #lb-list li:hover {
            background: rgba(255,255,255,0.1);
            transform: translateX(4px);
            border-color: rgba(0,242,255,0.3);
        }
        #lb-list li::before {
            content: counter(rank);
            font-weight: bold;
            color: #00f2ff;
            font-size: 1.2em;
            text-shadow: 0 0 10px rgba(0,242,255,0.5);
        }
        /* 前三名特殊样式 */
        #lb-list li.first {
            background: linear-gradient(135deg, 
                rgba(255,215,0,0.3), 
                rgba(255,215,0,0.1)
            );
            border: 2px solid rgba(255,215,0,0.5);
            box-shadow: 0 0 20px rgba(255,215,0,0.2);
            position: relative;
        }
        #lb-list li.first::before {
            content: counter(rank);
            font-weight: bold;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255,215,0,0.5);
            font-size: 1.3em;
        }
        #lb-list li.first::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(255,215,0,0.1) 50%, 
                transparent 100%
            );
            pointer-events: none;
        }

        #lb-list li.second {
            background: linear-gradient(135deg, 
                rgba(192,192,192,0.3), 
                rgba(192,192,192,0.1)
            );
            border: 2px solid rgba(192,192,192,0.5);
            box-shadow: 0 0 20px rgba(192,192,192,0.2);
            position: relative;
        }
        #lb-list li.second::before {
            content: counter(rank);
            font-weight: bold;
            color: #c0c0c0;
            text-shadow: 0 0 10px rgba(192,192,192,0.5);
            font-size: 1.3em;
        }
        #lb-list li.second::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(192,192,192,0.1) 50%, 
                transparent 100%
            );
            pointer-events: none;
        }

        #lb-list li.third {
            background: linear-gradient(135deg, 
                rgba(205,127,50,0.3), 
                rgba(205,127,50,0.1)
            );
            border: 2px solid rgba(205,127,50,0.5);
            box-shadow: 0 0 20px rgba(205,127,50,0.2);
            position: relative;
        }
        #lb-list li.third::before {
            content: counter(rank);
            font-weight: bold;
            color: #cd7f32;
            text-shadow: 0 0 10px rgba(205,127,50,0.5);
            font-size: 1.3em;
        }
        #lb-list li.third::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, 
                transparent 0%, 
                rgba(205,127,50,0.1) 50%, 
                transparent 100%
            );
            pointer-events: none;
        }

        /* 普通列表项样式调整 */
        #lb-list li:not(.first):not(.second):not(.third) {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* 前三名悬停效果增强 */
        #lb-list li.first:hover {
            background: linear-gradient(135deg, 
                rgba(255,215,0,0.4), 
                rgba(255,215,0,0.2)
            );
            border-color: rgba(255,215,0,0.7);
        }
        #lb-list li.second:hover {
            background: linear-gradient(135deg, 
                rgba(192,192,192,0.4), 
                rgba(192,192,192,0.2)
            );
            border-color: rgba(192,192,192,0.7);
        }
        #lb-list li.third:hover {
            background: linear-gradient(135deg, 
                rgba(205,127,50,0.4), 
                rgba(205,127,50,0.2)
            );
            border-color: rgba(205,127,50,0.7);
        }

        /* 前三名文字颜色调整 */
        #lb-list li.first .player-name,
        #lb-list li.first .score {
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255,215,0,0.3);
        }
        #lb-list li.second .player-name,
        #lb-list li.second .score {
            color: #c0c0c0;
            text-shadow: 0 0 10px rgba(192,192,192,0.3);
        }
        #lb-list li.third .player-name,
        #lb-list li.third .score {
            color: #cd7f32;
            text-shadow: 0 0 10px rgba(205,127,50,0.3);
        }
        .player-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.1em;
            min-width: 150px;
        }
        .crown {
            font-size: 1.3em;
            animation: crown-float 2s ease-in-out infinite;
        }
        @keyframes crown-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .score {
            color: #00f2ff;
            font-weight: bold;
            font-size: 1.2em;
            text-shadow: 0 0 10px rgba(0,242,255,0.3);
            text-align: center;
            min-width: 80px;
        }
        .level {
            color: #ffd700;
            font-weight: 500;
            background: rgba(255,215,0,0.1);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 1.1em;
            text-align: center;
            min-width: 80px;
        }
        .time {
            color: #888;
            font-size: 0.95em;
            white-space: nowrap;
            text-align: right;
            min-width: 100px;
        }
        .survival-time {
            color: #4CAF50;
            font-size: 0.95em;
            white-space: nowrap;
            background: rgba(76,175,80,0.1);
            padding: 6px 12px;
            border-radius: 6px;
            text-align: center;
            min-width: 100px;
        }
        .empty {
            color: #666;
            text-align: center;
            grid-column: 1 / -1;
            padding: 40px;
            font-style: italic;
            font-size: 1.1em;
        }
        .lb-tabs {
            display: flex;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 1rem;
            position: relative;
            width: 100%;
        }
        .lb-tab {
            flex: 1;
            padding: 8px 16px;
            border: none;
            background: transparent;
            color: #fff;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            position: relative;
            z-index: 1;
        }
        .lb-tab.active {
            color: #fff;
            background: rgba(0,255,255,0.2);
            box-shadow: 0 2px 8px rgba(0,255,255,0.2);
        }
        .lb-tab:hover:not(.active) {
            background: rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);

    // 确保模式切换按钮正确初始化
    function initializeTabs() {
        const tabsContainer = document.querySelector('.lb-tabs');
        if (!tabsContainer) return;

        // 添加指示条
        let indicator = document.getElementById('leaderboard-tab-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'leaderboard-tab-indicator';
            tabsContainer.appendChild(indicator);
        }

        // 设置初始状态
        const activeTab = document.querySelector('.lb-tab.active');
        if (!activeTab) {
            tabBtns[0].classList.add('active');
            indicator.style.transform = 'translateX(0)';
        } else {
            const index = tabBtns.indexOf(activeTab);
            indicator.style.transform = `translateX(${index * 100}%)`;
        }
    }

    lbBtn.addEventListener('click', () => {
        lbModal.style.display = 'flex';
        initializeTabs();
        renderLeaderboard();
    });
    lbClose.addEventListener('click', () => lbModal.style.display = 'none');

    scopeSel.addEventListener('change', renderLeaderboard);
    periodSel.addEventListener('change', renderLeaderboard);
    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // 更新标签状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 移动指示条
            const indicator = document.getElementById('leaderboard-tab-indicator');
            if (indicator) {
                indicator.style.transform = `translateX(${index * 100}%)`;
            }

            renderLeaderboard();
        });
    });

    async function loadLeaderboard({ scope, mode, period }) {
        let list = [];
        if (scope === 'local') {
            const raw = localStorage.getItem('snakeLeaderboard_local') || '[]';
            list = JSON.parse(raw)
                .filter(e => e.mode === mode)
                .filter(e => {
                    if (period === 'alltime') return true;
                    const span = { daily:1, weekly:7, monthly:30 }[period] * 24*3600e3;
                    return e.timestamp >= Date.now() - span;
                });

            console.log('加载的本地数据:', list); // 添加调试日志
        } else {
            const res = await fetch(`/api/leaderboard?mode=${mode}&period=${period}`);
            if (res.ok) list = await res.json();
        }

        // 确保数据按分数、关卡和生存时间排序
        list.sort((a,b) =>
            ((b.level || 0) - (a.level || 0)) ||
            (b.score - a.score) ||
            ((b.survivalTime||0) - (a.survivalTime||0)) ||
            (a.timestamp - b.timestamp)
        );

        return list.slice(0, TOP_N);
    }

    async function renderLeaderboard() {
        const scope  = scopeSel.value;
        const period = periodSel.value;
        const activeTab = document.querySelector('.lb-tab.active');
        if (!activeTab) return;

        const mode = activeTab.dataset.mode;
        const data = await loadLeaderboard({ scope, mode, period });

        console.log('渲染的数据:', data);

        const items = [];
        for (let i = 0; i < TOP_N; i++) {
            const e = data[i];
            if (e) {
                const date = new Date(e.timestamp);
                const timeStr = date.toLocaleDateString();
                const survivalTime = e.survivalTime ? formatTime(e.survivalTime) : '';

                // 添加前三名的特殊类名
                const rankClass = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : '';
                const crownEmoji = i === 0 ? '<span class="crown">👑</span>' : '';

                if (mode === 'level') {
                    items.push(
                        `<li class="${rankClass}" data-mode="level">
                            <span class="player-name">${crownEmoji}${e.name}</span>
                            <span class="score">${e.score}分</span>
                            <span class="level">关卡 ${e.level}</span>
                            <span class="survival-time">${survivalTime}</span>
                            <span class="time">${timeStr}</span>
                        </li>`
                    );
                } else {
                    items.push(
                        `<li class="${rankClass}" data-mode="free">
                            <span class="player-name">${crownEmoji}${e.name}</span>
                            <span class="score">${e.score}分</span>
                            <span class="survival-time">${survivalTime}</span>
                            <span class="time">${timeStr}</span>
                        </li>`
                    );
                }
            } else {
                items.push(`<li class="empty">暂无数据</li>`);
            }
        }
        listEl.innerHTML = items.join('');
    }

    // 添加时间格式化函数
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}时${minutes}分`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    }

    // 初始化
    initializeTabs();

    // 删除重复的指示条移动逻辑
    const lbTabBtns = Array.from(document.querySelectorAll('.lb-tab'));
    lbTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            lbTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLeaderboard();
        });
    });
});