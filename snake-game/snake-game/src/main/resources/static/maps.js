// 每个元素是一个障碍物数组，按关卡顺序排列
/*
* 地图绘制
* 相关障碍物生成逻辑和绘制
* Mapping
* Related obstacle generation logic and drawing
* */
const maps = [
    [], // Level 1: 无障碍

    // Level 2:
    [
        [5,5], [5,14], [14,5], [14,14]
    ],

    // Level 3: 边缘围栏
    [
        ...Array.from({ length: 20 }, (_, i) => [i, 0]),
        ...Array.from({ length: 20 }, (_, i) => [i, 19]),
        ...Array.from({ length: 20 }, (_, i) => [0, i]),
        ...Array.from({ length: 20 }, (_, i) => [19, i])
    ],

    // Level 4: 随机散点
    generateRandomObstacles(20),

    // Level 5: 楼梯状
    generateStaircaseObstacles(3, 3, 10),

    // Level 6: 环形
    generateCircularObstacles(10, 10, 7),
];

function generateRandomObstacles(gridSize) {
    // 障碍数量随机 7～12
    const min = 7, max = 12;
    const count = Math.floor(Math.random() * (max - min + 1)) + min;

    const obs = new Set();
    while (obs.size < count) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        obs.add(`${x},${y}`);
    }
    return [...obs].map(s => s.split(',').map(Number));
}

function generateStaircaseObstacles(startX, startY, stepCount) {
    const arr = [];
    for (let i = 0; i < stepCount; i++) {
        arr.push([startX + i, startY + i]);
    }
    return arr;
}

function generateCircularObstacles(centerX, centerY, radius) {
    const arr = [];
    for (let angle = 0; angle < 360; angle += 30) {
        const rad = angle * Math.PI / 180;
        const x = Math.round(centerX + radius * Math.cos(rad));
        const y = Math.round(centerY + radius * Math.sin(rad));
        arr.push([x, y]);
    }
    return arr;
}

window.maps = maps;
