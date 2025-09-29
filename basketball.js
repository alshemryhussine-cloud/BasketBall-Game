let canvas, ctx;
let floorHeight = 100;
let currentScreen = "menu";
let players = [];
let ball;
let keys = {};
let score = [0,0];
let shootingP1 = false, chargeP1 = 0;
let shootingP2 = false, chargeP2 = 0;
let gameLoopId;

window.addEventListener('load', ()=>{
canvas = document.getElementById("gameCanvas");
ctx = canvas.getContext("2d");

function resizeCanvas(){
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

drawMenu();
});

// ---------- Players and Ball ----------
function createPlayers(){
return [
{ x:100, y:canvas.height-floorHeight, w:40, h:80, color:"blue", hasBall:true, jump:false, vy:0, name:"Player 1" },
{ x:canvas.width-140, y:canvas.height-floorHeight, w:40, h:80, color:"red", hasBall:false, jump:false, vy:0, name:"Player 2", isAI:false, aiLevel:1 }
];
}

function createBall(){
return {
x:players[0].x + players[0].w/2,
y:players[0].y - players[0].h + 20,
r:12, vx:0, vy:0, holder:players[0], pickupCooldown:0
};
}

// ---------- Start Game ----------
function startGame(mode){
currentScreen = "game";
players = createPlayers();
ball = createBall();
score = [0,0];

if(mode !== "local"){
players[1].isAI = true;
switch(mode){
case "easy": players[1].aiLevel=1; break;
case "normal": players[1].aiLevel=2; break;
case "hard": players[1].aiLevel=3; break;
case "extreme": players[1].aiLevel=4; break;
}
}

if(gameLoopId) cancelAnimationFrame(gameLoopId);
loop();
}

// ---------- Menu ----------
function drawMenu(){
ctx.fillStyle="#d2a679";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="black";
ctx.font="40px Arial";
ctx.fillText("Basketball Game", canvas.width/2-150, 150);

let buttons = [
{ text:"Same Computer", y:250, mode:"local" },
{ text:"Easy AI", y:320, mode:"easy" },
{ text:"Normal AI", y:390, mode:"normal" },
{ text:"Hard AI", y:460, mode:"hard" },
{ text:"Extreme AI", y:530, mode:"extreme" }
];

buttons.forEach(btn=>{
ctx.fillStyle="gray";
ctx.fillRect(canvas.width/2-120, btn.y-40, 240, 50);
ctx.fillStyle="white";
ctx.fillText(btn.text, canvas.width/2-100, btn.y);
});

canvas.onclick = e=>{
let mx=e.offsetX,my=e.offsetY;
buttons.forEach(btn=>{
if(mx>=canvas.width/2-120 && mx<=canvas.width/2+120 && my>=btn.y-40 && my<=btn.y+10){
startGame(btn.mode);
}
});
};
}

// ---------- Ball Reset ----------
function resetBallAfterScore(possessor){
ball = createBall();
ball.holder = possessor;
possessor.hasBall = true;
chargeP1=chargeP2=0;
shootingP1=shootingP2=false;
}

// ---------- Shoot ----------
function shoot(p, power){
if(p.hasBall){
ball.holder = null;
p.hasBall=false;
let shotPower = Math.min(power,30);
ball.vx = (p===players[0]?5+shotPower/2:-5-shotPower/2);
ball.vy = -10 - shotPower/1.5;
ball.pickupCooldown = 30;
}
}

// ---------- Update ----------
function update(){
if(currentScreen!=="game") return;

if(keys["a"]) players[0].x-=5;
if(keys["d"]) players[0].x+=5;
if(keys["ArrowLeft"]) players[1].x-=5;
if(keys["ArrowRight"]) players[1].x+=5;

players.forEach(p=>{
if(p.jump){
p.y+=p.vy;
p.vy+=1;
if(p.y>=canvas.height-floorHeight){ p.y=canvas.height-floorHeight; p.jump=false; }
}
});

if(shootingP1) chargeP1+=0.4;
if(shootingP2) chargeP2+=0.4;

// AI
if(players[1].isAI){
let ai=players[1];
let speed=2+ai.aiLevel;
if(!ai.hasBall){
if(ball.x<ai.x) ai.x-=speed;
if(ball.x>ai.x) ai.x+=speed;
} else if(Math.random()<0.02*ai.aiLevel){
shoot(ai, 15+Math.random()*10);
}
}

// Ball physics
if(!ball.holder){
ball.x+=ball.vx;
ball.y+=ball.vy;
ball.vy+=0.5;

if(ball.y+ball.r>canvas.height-floorHeight){ ball.y=canvas.height-floorHeight-ball.r; ball.vy*=-0.6; }
if(ball.x-ball.r<0){ ball.x=ball.r; ball.vx*=-1; }
if(ball.x+ball.r>canvas.width){ ball.x=canvas.width-ball.r; ball.vx*=-1; }

if(ball.pickupCooldown>0) ball.pickupCooldown--;

players.forEach(p=>{
if(!ball.holder && ball.pickupCooldown<=0 &&
Math.abs(ball.x-(p.x+p.w/2))<30 && Math.abs(ball.y-p.y)<50){
ball.holder=p; p.hasBall=true;
}
});
} else { ball.x=ball.holder.x+ball.holder.w/2; ball.y=ball.holder.y-ball.holder.h+20; }

// Score
if(ball.holder===null){
if(ball.x<50 && ball.y<canvas.height-250){
score[1]++;
if(score[1]<10) resetBallAfterScore(players[1]); else alert("Player 2 wins!"), drawMenu();
}
if(ball.x>canvas.width-50 && ball.y<canvas.height-250){
score[0]++;
if(score[0]<10) resetBallAfterScore(players[0]); else alert("Player 1 wins!"), drawMenu();
}
}
}

// ---------- Draw ----------
function draw(){
if(currentScreen!=="game") return;

ctx.fillStyle="#d2a679";
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle="#654321";
ctx.fillRect(0,canvas.height-floorHeight,canvas.width,floorHeight);

// Midline
ctx.strokeStyle="white";
ctx.beginPath();
ctx.moveTo(canvas.width/2,0);
ctx.lineTo(canvas.width/2,canvas.height);
ctx.stroke();

// Hoops
ctx.fillStyle="grey"; ctx.fillRect(50, canvas.height-300, 20, 150);
ctx.beginPath(); ctx.arc(60+10, canvas.height-300, 30, 0, Math.PI*2);
ctx.strokeStyle="orange"; ctx.lineWidth=6; ctx.stroke();

ctx.fillStyle="grey"; ctx.fillRect(canvas.width-70, canvas.height-300, 20, 150);
ctx.beginPath(); ctx.arc(canvas.width-60, canvas.height-300, 30, 0, Math.PI*2);
ctx.strokeStyle="orange"; ctx.lineWidth=6; ctx.stroke();

// Players
players.forEach(p=>{ ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y-p.h,p.w,p.h); });

// Ball
ctx.beginPath();
ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
ctx.fillStyle="orange";
ctx.fill();

// Power bars
if(shootingP1){ ctx.fillStyle="blue"; ctx.fillRect(players[0].x, players[0].y-20, chargeP1*3, 8); }
if(shootingP2){ ctx.fillStyle="red"; ctx.fillRect(players[1].x, players[1].y-20, chargeP2*3, 8); }

// Score
ctx.fillStyle="black";
ctx.font="20px Arial";
ctx.fillText(`${players[0].name}: ${score[0]} - ${players[1].name}: ${score[1]}`, 300,50);
}

// ---------- Loop ----------
function loop(){
update();
draw();
gameLoopId = requestAnimationFrame(loop);
}

// ---------- Keys ----------
document.addEventListener("keydown", e=>{
keys[e.key]=true;
if(e.key==="Escape") drawMenu();
if(e.key==="Shift"){ let p=players[0]; if(!p.jump){ p.jump=true; p.vy=-15; } }
if(e.key==="Enter"){ let p=players[1]; if(!p.jump){ p.jump=true; p.vy=-15; shootingP2=true; } }
if(e.key===" ") shootingP1=true;
});
document.addEventListener("keyup", e=>{
keys[e.key]=false;
if(e.key===" ") { shoot(players[0], chargeP1); shootingP1=false; chargeP1=0; }
if(e.key==="Enter") { shoot(players[1], chargeP2); shootingP2=false; chargeP2=0; }
});
