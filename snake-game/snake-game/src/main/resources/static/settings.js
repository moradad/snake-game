/*
* 设置界面交互 + 声音调节 + 按键重绑定 +保存和读取
* * Setup interface interaction + sound adjustment + key rebinding + save and read
* */

// === 设置面板的交互逻辑 ===
window.addEventListener('DOMContentLoaded', () => {
    // === 设置面板逻辑 ===
    const overlay = document.getElementById('settings-overlay');
    const btnOpen = document.getElementById('settings-button');
    const btnClose = document.getElementById('settings-close');
    btnOpen.addEventListener('click', () => overlay.style.display = 'flex');
    btnClose.addEventListener('click', () => {
        overlay.style.display = 'none';
        if(engine) engine.togglePause(); // 关闭时取消暂停
    });

    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            let next;

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    next = last;
                } else {
                    const index = Array.from(focusable).indexOf(document.activeElement);
                    next = focusable[index - 1];
                }
            } else {
                if (document.activeElement === last) {
                    next = first;
                } else {
                    const index = Array.from(focusable).indexOf(document.activeElement);
                    next = focusable[index + 1];
                }
            }

            next?.focus();
        }
    });
    // 事件绑定
    document.getElementById('lb-scope').addEventListener('change', renderLeaderboard);
    document.getElementById('lb-period').addEventListener('change', renderLeaderboard);
    document.querySelectorAll('.lb-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lb-tab').forEach(b => b.classList.toggle('active', b === btn));
            renderLeaderboard();
        });
    });

    // 打开弹窗时初始化
    lbBtn.addEventListener('click', () => {
        lbModal.style.display = 'flex';
        renderLeaderboard();
    });

    // 切换时移动下方指示条
    const tabs = document.querySelectorAll('.tab-button');
    const settingsIndicator = document.getElementById('tab-indicator');
    tabs.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            // 切换 active
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 显示对应面板
            document.querySelectorAll('.tab-content')
                .forEach(c => c.style.display = 'none');
            document.getElementById('tab-' + btn.dataset.tab)
                .style.display = 'block';
            // 移动指示条
            settingsIndicator.style.transform = `translateX(${idx * 100}%)`;
        });
    });

// 按键重绑定
    const defaultBindings = {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        accelerate: ' ',
        pause: 't'
    };

// 初始化设置
    function initializeSettings() {
        // 加载按键绑定
        const savedBindings = localStorage.getItem('keyBindings');
        if (!savedBindings) {
            localStorage.setItem('keyBindings', JSON.stringify(defaultBindings));
        }
        updateKeyDisplay();

        // 加载音量设置
        const savedVolumes = localStorage.getItem('volumes');
        if (savedVolumes) {
            const volumes = JSON.parse(savedVolumes);
            document.getElementById('bg-volume').value = volumes.bg || 0.5;
            document.getElementById('eat-volume').value = volumes.eat || 0.5;
            updateVolumes();
        }
    }

// 更新 UI 文本
    function refreshKeyLabels() {
        Object.entries(keyBindings).forEach(([action, key]) => {
            document.getElementById(`key-${action}`).textContent = key;
        });
    }

    refreshKeyLabels();

// 点击"重绑定"按钮
    document.querySelectorAll('.rebind').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            btn.textContent = '按键...';

            // 下一个键盘按键事件
            function handler(e) {
                e.preventDefault();
                keyBindings[action] = e.key;
                localStorage.setItem('keyBindings', JSON.stringify(keyBindings));
                refreshKeyLabels();
                btn.textContent = '重绑定';
                window.removeEventListener('keydown', handler);
            }

            window.addEventListener('keydown', handler);
        });
    });


// 打开/关闭
    btnOpen.addEventListener('click', () => overlay.style.display = 'flex');
    btnClose.addEventListener('click', () => overlay.style.display = 'none');
    window.addEventListener('keydown', e => {
        if (e.key === 'W') {
            e.preventDefault();
            overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
        }
    });

// 滑块与下拉初始化
    const bgVol = document.getElementById('bg-volume');
    const eatVol = document.getElementById('eat-volume');
    const btnStyle = document.getElementById('button-style');

// 读取 localStorage
    bgVol.value = localStorage.getItem('bgVolume') ?? 0.5;
    eatVol.value = localStorage.getItem('eatVolume') ?? 1.0;
    btnStyle.value = localStorage.getItem('btnStyle') ?? 'green';

// 应用样式到按钮
    function applyButtonStyle() {
        document.querySelectorAll('.mode-button, #settings-button, #restart-button, #save-state, #load-state').forEach(b => {
            b.style.backgroundColor = {
                green: '#28a745', blue: '#007bff', red: '#dc3545'
            }[btnStyle.value];
        });
    }

    applyButtonStyle();

// 绑定滑块变化
    bgVol.addEventListener('input', () => {
        const v = bgVol.value;
        document.getElementById('bg-music').volume = v;
        localStorage.setItem('bgVolume', v);
    });
    eatVol.addEventListener('input', () => {
        const v = eatVol.value;
        document.getElementById('sound-eat').volume = v;
        document.getElementById('sound-levelup').volume = v;
        document.getElementById('sound-die').volume = v;
        localStorage.setItem('eatVolume', v);
    });
    btnStyle.addEventListener('change', () => {
        localStorage.setItem('btnStyle', btnStyle.value);
        applyButtonStyle();
    });

// 存档 / 继续
    document.getElementById('save-state').addEventListener('click', () => {
        // 假设 engine.exportState() 返回可序列化游戏状态
        localStorage.setItem('gameState', JSON.stringify(engine.exportState()));
        alert('游戏已保存！');
    });
    document.getElementById('load-state').addEventListener('click', () => {
        const s = localStorage.getItem('gameState');
        if (s) {
            engine.loadState(JSON.parse(s));
            overlay.style.display = 'none';
        } else {
            alert('未发现存档。');
        }
    });


});
// 启动，背景音乐
const bg = document.getElementById('bg-music');
bg.volume = bgVol.value;
bg.play().catch(()=>{});  // 低版本移动端可能需要用户交互