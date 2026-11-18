import { World } from './World.js';
const LEVELS = [
  { name:'LEVEL 1: BACKROOMS', floor:['#c9b24e','#cfb953'], wall:'#e9d46c', stripe:'#d2bb54', edge:'#9a8228', vignette:'8,5,0' },
  { name:'LEVEL 2: POOLROOMS', floor:['#6fd0e4','#80dcec'], wall:'#f4fbfd', stripe:'#cfe9f0', edge:'#8fbfcc', vignette:'0,22,36', pool:true },
  { name:'LEVEL 3: LEVEL RUN', floor:['#3a2f2f','#413636'], wall:'#7d6c6c', stripe:'#625252', edge:'#3d3030', vignette:'30,0,0', red:true }
];
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = 0; this.height = 0; this.dpr = 1; this.scale = 1;
    this.resize = () => { this.dpr = Math.min(devicePixelRatio || 1, 2); this.width = canvas.clientWidth; this.height = canvas.clientHeight; canvas.width = this.width*this.dpr; canvas.height = this.height*this.dpr; this.scale = Math.min(this.width,this.height)/600; };
    addEventListener('resize', this.resize); this.resize();
  }
  text(s,x,y,size,color,align='center') {
    const g=this.ctx; g.font='400 '+size+'px Impact,"Arial Black",sans-serif'; g.textAlign=align; g.lineWidth=size/4; g.strokeStyle='#1a1200'; g.lineJoin='round'; g.strokeText(s,x,y); g.fillStyle=color; g.fillText(s,x,y);
  }
  circle(x,y,r,color,line=4) { const g=this.ctx; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fillStyle=color; g.fill(); if(line){g.lineWidth=line;g.strokeStyle='#1a1200';g.stroke();} }
  rounded(x,y,w,h,r,color) { const g=this.ctx; g.beginPath(); g.roundRect(x,y,w,h,r); g.fillStyle=color; g.fill(); g.lineWidth=4; g.strokeStyle='#1a1200'; g.stroke(); }
  shadow(x,y,w,h) { const g=this.ctx; g.beginPath(); g.ellipse(x,y,w,h,0,0,Math.PI*2); g.fillStyle='rgba(30,20,0,.35)'; g.fill(); }
  bar(x,y,w,f,color,label) {
    this.rounded(x-w/2,y,w,12,6,'#3a3322');
    if(f>0){const g=this.ctx;g.beginPath();g.roundRect(x-w/2+2,y+2,(w-4)*Math.max(0,f),8,4);g.fillStyle=color;g.fill();}
    this.text(label,x,y+11,13,'#fff');
  }
  drawHuman(h) {
    const g=this.ctx, bob=Math.sin(h.time*12)*(h.moving?2.5:.6), flash=h.flash>0;
    this.shadow(h.x,h.y+20,17,6); g.save();g.translate(h.x,h.y);
    this.rounded(-10,8,8,12+bob,3,'#2b2b3a');this.rounded(2,8,8,12-bob,3,'#2b2b3a');
    this.rounded(-13,-8,26,22,8,flash?'#fff':h.color);this.circle(0,-16+bob*.5,13,flash?'#fff':h.skin);
    if(h.kind==='s'){g.beginPath();g.arc(0,-19+bob*.5,13,Math.PI,0);g.fillStyle='#ffcc1a';g.fill();g.lineWidth=4;g.strokeStyle='#1a1200';g.stroke();}
    const ey=-15+bob*.5;
    if(h.scared){this.circle(-5,ey,4,'#fff',2);this.circle(5,ey,4,'#fff',2);this.circle(-5,ey,1.6,'#000',0);this.circle(5,ey,1.6,'#000',0);this.circle(0,ey+8,3,'#1a1200',0);}
    else{this.circle(-5,ey,1.8,'#1a1200',0);this.circle(5,ey,1.8,'#1a1200',0);}
    g.restore();this.bar(h.x,h.y-48,44,h.hp/h.maxHp,'#ff4a3d',h.hp|0);this.text(h.name,h.x,h.y-54,13,'#fff');
  }
  drawPlayer(p) {
    const g=this.ctx,a=p.angle,moving=p.moving?.35:.05;this.shadow(p.x,p.y+26,34,10);g.save();g.translate(p.x,p.y);
    if(p.invulnerable>0&&((p.time*30|0)%2))g.globalAlpha=.5;
    const leg=(q,l1,l2,bend,w)=>{const kx=Math.cos(q)*l1,ky=Math.sin(q)*l1,ex=kx+Math.cos(q+bend)*l2,ey=ky+Math.sin(q+bend)*l2;g.beginPath();g.moveTo(Math.cos(q)*6,Math.sin(q)*6);g.lineTo(kx,ky);g.lineTo(ex,ey);g.lineJoin='round';g.lineCap='round';g.lineWidth=w+4;g.strokeStyle='#050202';g.stroke();g.lineWidth=w;g.strokeStyle=p.hurt>0?'#fff':'#2b1410';g.stroke();this.circle(ex,ey,w*.8,p.hurt>0?'#fff':'#1a0c0a',2);};
    [a+1.5,a+2.3,a-2.3,a-1.5].forEach((q,i)=>leg(q+Math.sin(p.time*11+i*1.7)*moving,34,28,i%2?.7:-.7,4));
    for(const side of [-1,1])leg(a+side*.95+Math.sin(p.time*11+side)*moving*.5,44,40,-side*.45,5);
    this.circle(0,-2,14,p.hurt>0?'#fff':'#140a0a');for(let i=0;i<7;i++){const q=i*.9+p.time*.4;this.circle(Math.cos(q)*11,Math.sin(q)*11-2,4.5,p.hurt>0?'#fff':'#1c0e0e',3);}
    this.circle(0,-2,9,p.hurt>0?'#fff':'#0a0505',0);g.restore();this.text('YOU',p.x,p.y-52,14,'#ffd21f');
  }
  draw(game) {
    const g=this.ctx,W=this.width,H=this.height,S=this.scale,T=World.TILE,N=World.SIZE,level=LEVELS[game.level];
    g.setTransform(this.dpr,0,0,this.dpr,0,0);g.fillStyle='#0e0c04';g.fillRect(0,0,W,H);
    const vw=W/S,vh=H/S,cx=Math.max(0,Math.min(N*T-vw,game.player.x-vw/2)),cy=Math.max(0,Math.min(N*T-vh,game.player.y-vh/2));
    g.save();g.scale(S,S);g.translate(-cx,-cy);
    const x0=Math.max(0,cx/T|0),x1=Math.min(N-1,(cx+vw)/T+1|0),y0=Math.max(0,cy/T|0),y1=Math.min(N-1,(cy+vh)/T+2|0);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(!game.world.tiles[y][x]){g.fillStyle=(x+y)&1?level.floor[0]:level.floor[1];g.fillRect(x*T,y*T,T,T);if(level.pool){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.arc(x*T+T/2+Math.sin(game.time*2+x*1.7)*6,y*T+T/2+Math.cos(game.time*2+y*1.3)*6,8+((game.time*8+x+y)%6),0,Math.PI);g.stroke();}}
    const entities=[game.player,...game.humans].sort((a,b)=>a.y-b.y);
    let i=0;
    for(let y=y0;y<=y1;y++){
      for(let x=x0;x<=x1;x++)if(game.world.tiles[y][x]){
        const px=x*T,py=y*T;
        if(!game.world.tiles[y+1]?.[x]){g.fillStyle=level.edge;g.fillRect(px,py+T-20,T,20);g.lineWidth=3;g.strokeStyle='#1a1200';g.strokeRect(px,py+T-20,T,20);}
        g.fillStyle=level.wall;g.fillRect(px,py-20,T,T);g.fillStyle=level.stripe;for(let k=7;k<T;k+=14)g.fillRect(px+k,py-20,5,T);g.lineWidth=3;g.strokeStyle='#1a1200';g.strokeRect(px,py-20,T,T);
      }
      while(i<entities.length&&Math.max(y0,Math.min(y1,entities[i].y/T|0))<=y){entities[i]===game.player?this.drawPlayer(entities[i]):this.drawHuman(entities[i]);i++;}
    }
    for(const particle of game.particles){g.globalAlpha=particle.life/particle.maxLife;this.circle(particle.x,particle.y,particle.size*particle.life/particle.maxLife+2,particle.color,0);g.globalAlpha=1;}
    g.restore();
    const gradient=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.72);gradient.addColorStop(0,'rgba(20,14,0,0)');gradient.addColorStop(1,'rgba('+level.vignette+',.5)');g.fillStyle=gradient;g.fillRect(0,0,W,H);
    if(level.red){g.fillStyle='rgba(255,0,0,'+(.06+.06*Math.sin(game.time*6))+')';g.fillRect(0,0,W,H);}
    if(game.state!=='menu'){this.text(level.name,14,30,22,'#fff','left');this.text('WAVE '+game.wave+'/4',14,56,20,'#ffd21f','left');this.text('CAUGHT '+game.score,14,80,16,'#fff','left');}
    if(game.input.joystick){const j=game.input.joystick;g.beginPath();g.arc(j.ox,j.oy,52,0,Math.PI*2);g.lineWidth=5;g.strokeStyle='rgba(255,255,255,.45)';g.stroke();this.circle(j.ox+j.dx*52,j.oy+j.dy*52,24,'rgba(255,255,255,.55)',0);}
  }
  destroy(){removeEventListener('resize',this.resize);}
}
