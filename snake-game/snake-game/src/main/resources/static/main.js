/*
* 游戏开始 + 相关数据的传递获取
* The start of the game + the transfer of relevant data is obtained
* */


let engine, renderer, lastTime=0, loopId;

function startGame(mode) {
    const skin = document.getElementById('skinSelector').value;
    document.getElementById('start-screen').style.display='none';
    document.getElementById('game-container').style.display='block';
    if(loopId) cancelAnimationFrame(loopId);

    engine=new GameEngine({
        gridSize:20, tileCount:20,
        scoreThreshold:15, initialFps:8,
        maps:maps, mode:mode
    });
    renderer=new Renderer('gameCanvas', skin);
    new InputHandler(engine);

    engine.onGameLoop=data=>drawFrame(data);
    lastTime=performance.now();
    loopId=requestAnimationFrame(gameLoop);
}



function gameLoop(ts){
    const delta=ts-lastTime; lastTime=ts;
    engine.update(delta);
    loopId=requestAnimationFrame(gameLoop);
}

function drawFrame(data){
    const { snake,food,obstacles,score,level,gridSize,tileCount,stamina,maxStamina,paused,isGameOver,explosionParticles,survivalTime } = data;
    document.getElementById('score').textContent=score;
    document.getElementById('level').textContent=level;
    document.getElementById('survival-time').textContent=survivalTime;
    renderer.resize(gridSize,tileCount);
    renderer.clear();
    renderer.drawObstacles(obstacles,gridSize);
    renderer.drawSnake(snake,gridSize);
    renderer.drawFood(food,gridSize);
    renderer.drawScore(score);
    renderer.drawLevel(level);
    renderer.drawStamina(stamina,maxStamina);
    if(paused) renderer.drawPaused();
    if(isGameOver){
        renderer.drawExplosion(explosionParticles,gridSize);
        renderer.drawGameOver();
    }
}



window.onload = () => {
    document.getElementById('start-screen').style.display='flex';
    document.getElementById('game-container').style.display='none';
};