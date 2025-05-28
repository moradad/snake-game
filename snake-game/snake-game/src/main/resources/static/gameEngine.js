// gameEngine.js

/*
*游戏初始化 + 重生 + 食物生成 + 死亡提交页面逻辑
* 时间格式化显示 + 加速和耐力回复 + 碰撞检测
* *Game Initialization + Rebirth + Food Generation + Death Submission Page Logic
* Time Formatted Display + Acceleration & Endurance Recovery + Collision Detection
 */

class GameEngine {
    constructor({ gridSize, tileCount, scoreThreshold, initialFps, maps, mode }) {
        this.gridSize       = gridSize;
        this.tileCount      = tileCount;
        this.scoreThreshold = scoreThreshold;
        this.baseFps        = initialFps;
        this.fps            = initialFps;
        this.maps           = maps;
        this.mode           = mode; // 'level' or 'free'
        this.onGameLoop     = null;

        this.maxStamina       = 100;
        this.stamina          = this.maxStamina;
        this.staminaRegenRate = 10;
        this.staminaDrainRate = 30;
        this.accelerating     = false;

        this.paused = false;
        this.isGameOver = false;
        this.explosionParticles = [];
        this.survivalTime = 0;

        this.moveTimer    = 0;
        this.moveInterval = 1000 / this.fps;

        this.reset();
    }

    reset() {
        // 在重置之前保存当前状态
        const currentScore = this.score;
        const currentLevel = this.level;
        const currentSurvivalTime = this.survivalTime;

        this.snake     = [[Math.floor(this.tileCount/2), Math.floor(this.tileCount/2)]];
        this.direction = 'right';
        this.nextDir   = 'right';
        this.score     = 0;
        this.level     = 1;
        this.obstacles = [];
        this.stamina   = this.maxStamina;
        this.moveTimer = 0;
        this.fps       = this.baseFps;
        this.moveInterval = 1000 / this.fps;
        this.isGameOver = false;
        this.explosionParticles = [];
        this.survivalTime = 0;

        this.placeFood();
        // 找一个安全位置重生
        const [sx, sy] = this.getSafeStartPosition();
        this.snake     = [[sx, sy]];
        this.direction = 'right';
        this.nextDir   = 'right';

        this.notify();
    }

    getSafeStartPosition() {
        for (let y = 0; y < this.tileCount; y++) {
            for (let x = 0; x < this.tileCount; x++) {
                // 检查 obstacles
                if (!this.obstacles.some(o => o[0] === x && o[1] === y)) {
                    return [x, y];
                }
            }
        }
        // 如果整个地图都满障碍，就退回中心
        return [Math.floor(this.tileCount/2), Math.floor(this.tileCount/2)];
    }

    placeFood() {
        // 重新从 maps 中取当前关卡障碍
        this.obstacles = this.mode === 'level'
            ? (this.maps[this.level - 1] || [])
            : [];

        // 在可用格子列表随机放食物
        const avail = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                if (!this.snake.some(s => s[0] === x && s[1] === y)
                    && !this.obstacles.some(o => o[0] === x && o[1] === y)) {
                    avail.push([x, y]);
                }
            }
        }
        this.food = avail[Math.floor(Math.random() * avail.length)];
    }

    exportState() {
        return {
            snake: this.snake,
            direction: this.direction,
            nextDir: this.nextDir,
            score: this.score,
            level: this.level,
            obstacles: this.obstacles,
            food: this.food,
            stamina: this.stamina,
            fps: this.fps,

            invincible: this.invincible,
            invincibleTimer: this.invincibleTimer,
            moveTimer: this.moveTimer
        };
    }

    loadState(state) {
        Object.assign(this, {
            snake: state.snake,
            direction: state.direction,
            nextDir: state.nextDir,
            score: state.score,
            level: state.level,
            obstacles: state.obstacles,
            food: state.food,
            stamina: state.stamina,
            fps: state.fps,
            invincible: state.invincible,
            invincibleTimer: state.invincibleTimer,
            moveTimer: state.moveTimer
        });
        this.moveInterval = 1000 / this.fps;
        this.notify();
    }

    changeDirection(dir) {
        const opp = { up:'down', down:'up', left:'right', right:'left' };
        if (dir !== opp[this.direction]) this.nextDir = dir;
    }

    togglePause() {
        this.paused = !this.paused;
        this.notify();
    }

    _saveLocalEntry() {
        const modal = document.getElementById('death-modal');
        document.getElementById('death-message').textContent =
            `本局得分${this.score}` +
            (this.mode==='level'? `，通关第${this.level}关` : '') +
            `，生存时间${this.formatTime(this.survivalTime)}`;
        modal.style.display = 'flex';

        const input = document.getElementById('death-name');
        input.value = '';

        // 提交按钮处理
        const submitBtn = document.getElementById('death-submit');
        submitBtn.onclick = () => {
            const name = input.value.trim() || `玩家${Math.floor(Math.random()*1000)}`;
            const arr = JSON.parse(localStorage.getItem('snakeLeaderboard_local')||'[]');

            const gameData = {
                name,
                score: this.score,
                level: this.level,
                mode: this.mode,
                timestamp: Date.now(),
                survivalTime: this.survivalTime
            };

            console.log('保存游戏数据:', gameData);
            arr.push(gameData);
            localStorage.setItem('snakeLeaderboard_local', JSON.stringify(arr));
            modal.style.display = 'none';
            this.reset();
            // 返回到主界面
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        };

        // 跳过按钮处理
        const skipBtn = document.getElementById('death-skip');
        skipBtn.onclick = () => {
            modal.style.display = 'none';
            this.reset();
            // 返回到主界面
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
        };

        // 添加输入框回车提交功能
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        };
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = (seconds % 1).toFixed(2).slice(2); // 获取小数点后两位
        
        if (hours > 0) {
            return `${hours}时${minutes}分${secs}秒${millis}毫秒`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒${millis}毫秒`;
        } else {
            return `${secs}秒${millis}毫秒`;
        }
    }

    update(delta) {
        if (this.paused || this.isGameOver) {
            this.notify();
            return;
        }

        // 只在游戏未暂停时增加生存时间
        if (!this.paused) {
            this.survivalTime += delta / 1000;
        }
        // 加速与耐力
        if (this.accelerating && this.stamina > 0) {
            this.fps = this.baseFps * 1.5;
            this.stamina = Math.max(0, this.stamina - this.staminaDrainRate * delta/1000);
        } else {
            this.fps = this.baseFps;
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate * delta/1000);
        }

        this.moveInterval = 1000 / this.fps;
        this.moveTimer += delta;

        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.direction = this.nextDir;

            // 计算新头
            const head = [...this.snake[0]];
            if (this.direction==='up')    head[1]--;
            if (this.direction==='down')  head[1]++;
            if (this.direction==='left')  head[0]--;
            if (this.direction==='right') head[0]++;

            // 边界镜像
            head[0] = (head[0] + this.tileCount) % this.tileCount;
            head[1] = (head[1] + this.tileCount) % this.tileCount;

            // 碰撞检测
            if (this.isCollision(head)) {
                this.isGameOver = true;
                this.createExplosion(head[0], head[1]);
                this.playSound('die');
                this._saveLocalEntry();  // ← 在 reset 之前保存成绩
                return;
            }

            this.snake.unshift(head);

            // 吃到食物
            if (head[0] === this.food[0] && head[1] === this.food[1]) {
                this.score++;
                this.playSound('eat');

                // 升级检测
                if (this.mode==='level' && this.score >= this.scoreThreshold) {
                    this.level++;
                    this.score = 0;
                    this.baseFps++;

                    // **清空旧障碍 & 重置蛇身**
                    this.obstacles = [];
                    this.snake = [[Math.floor(this.tileCount/2), Math.floor(this.tileCount/2)]];

                    this.playSound('levelup');
                }

                // 放置下一颗食物（也会重新加载 obstacles）
                this.placeFood();
            } else {
                // 未吃到则删尾
                this.snake.pop();
            }
        }

        this.updateExplosion();
        this.notify();
    }

    isCollision([x,y]) {
        // 撞到自己或障碍
        return this.snake.slice(1).some(seg=>seg[0]===x&&seg[1]===y)
            || this.obstacles.some(o=>o[0]===x&&o[1]===y);
    }

    notify() {
        if (this.onGameLoop) {
            this.onGameLoop({
                snake: this.snake,
                food: this.food,
                obstacles: this.obstacles,
                score: this.score,
                level: this.level,
                gridSize: this.gridSize,
                tileCount: this.tileCount,
                stamina: this.stamina,
                maxStamina: this.maxStamina,
                paused: this.paused,
                fps: this.fps,
                survivalTime: this.formatTime(this.survivalTime)
            });
        }
    }

    playSound(type) {
        const audio = document.getElementById(`sound-${type}`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(()=>{/* 静默失败 */});
        }
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 2;
            this.explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30
            });
        }
    }

    updateExplosion() {
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
    }
}

window.GameEngine = GameEngine;