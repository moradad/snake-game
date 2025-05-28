
// 修改 inputHandler.js：
/*
*键盘输入监听
*方向键 + tab键
* Keyboard input listening
*Arrow keys + tab keys
*/
class InputHandler {
    constructor(engine) {
        this.engine = engine;
        window.addEventListener('keydown',  this.downHandler.bind(this));
        window.addEventListener('keyup',    this.upHandler.bind(this));
    }
    downHandler(e) {
        const kb = JSON.parse(localStorage.getItem('keyBindings')||'{}');

        // 处理Tab键
        if (e.key === 'Tab') {
            e.preventDefault(); // 阻止默认的Tab行为
            const settingsOverlay = document.getElementById('settings-overlay');

            if (settingsOverlay.style.display === 'flex') {
                settingsOverlay.style.display = 'none';
                this.engine.togglePause(); // 取消暂停
            } else {
                settingsOverlay.style.display = 'flex';
                this.engine.togglePause(); // 暂停游戏
            }
            return;
        }

        switch (e.key) {
            case kb.up:        this.engine.changeDirection('up');    break;
            case kb.down:      this.engine.changeDirection('down');  break;
            case kb.left:      this.engine.changeDirection('left');  break;
            case kb.right:     this.engine.changeDirection('right'); break;
            case kb.accelerate:this.engine.accelerating = true;      break;
            case kb.pause:     this.engine.togglePause();            break;
        }
    }
    upHandler(e) {
        const kb = JSON.parse(localStorage.getItem('keyBindings')||'{}');
        if (e.key === kb.accelerate) {
            this.engine.accelerating = false;
        }
    }
}
window.InputHandler = InputHandler;