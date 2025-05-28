/*
* 游戏运行逻辑
* Game running logic
* */

class Renderer {
    constructor(canvasId, skin='classic'){
        this.canvas=document.getElementById(canvasId);
        this.ctx=this.canvas.getContext('2d');
        this.setSkin(skin);
    }
    setSkin(s){
        this.skin=s;
        if(s==='neon'){ this.snakeColor='cyan'; this.foodColor='magenta'; this.bg='black'; }
        else if(s==='dark'){ this.snakeColor='lightgray'; this.foodColor='yellow'; this.bg='black'; }
        else { this.snakeColor='lime'; this.foodColor='red'; this.bg='black'; }
    }
    resize(gs,tc){ this.canvas.width=gs*tc;this.canvas.height=gs*tc; }
    clear(){ this.ctx.fillStyle=this.bg; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height); }
    drawObstacles(obs,gs){ this.ctx.fillStyle='gray'; obs.forEach(o=>this.ctx.fillRect(o[0]*gs+1,o[1]*gs+1,gs-2,gs-2)); }
    drawSnake(s,gs){ this.ctx.fillStyle=this.snakeColor; s.forEach(seg=>this.ctx.fillRect(seg[0]*gs+1,seg[1]*gs+1,gs-2,gs-2)); }
    drawFood(f,gs){ this.ctx.fillStyle=this.foodColor; this.ctx.fillRect(f[0]*gs+1,f[1]*gs+1,gs-2,gs-2); }
    drawScore(sc){this.ctx.fillStyle='#fff';this.ctx.font='16px Arial';this.ctx.fillText(`得分:${sc}`,5,20);}
    drawLevel(l){this.ctx.fillStyle='#fff';this.ctx.font='16px Arial';this.ctx.fillText(`关卡:${l}`,this.canvas.width-80,20);}
    drawStamina(st,ms){
        const w=this.canvas.width*0.6,h=6,x=(this.canvas.width-w)/2,y=this.canvas.height-15;
        this.ctx.strokeStyle='#fff';this.ctx.strokeRect(x,y,w,h);
        this.ctx.fillStyle='yellow';this.ctx.fillRect(x,y,w*(st/ms),h);
    }
    drawPaused(){this.ctx.fillStyle='rgba(0,0,0,0.5)';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle='#fff';this.ctx.font='32px Arial';this.ctx.textAlign='center';this.ctx.fillText('PAUSED',this.canvas.width/2,this.canvas.height/2);
        this.ctx.textAlign='left';}
    drawExplosion(ps,gs){
        ps.forEach(p=>{
            this.ctx.fillStyle='yellow';this.ctx.globalAlpha=p.life/30;
            this.ctx.beginPath();this.ctx.arc(p.x*gs,p.y*gs,5,0,2*Math.PI);this.ctx.fill();this.ctx.globalAlpha=1;
        });
    }
    drawGameOver(){this.ctx.fillStyle='red';this.ctx.font='40px Arial';
        this.ctx.fillText('游戏结束',this.canvas.width/2-100,this.canvas.height/2);}
}