import { Player } from './Player.js';
import { Human } from './Human.js';
import { Particle } from './Particle.js';
import { World } from './World.js';
import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
export class Game {
  constructor(canvas, overlay) {
    this.canvas=canvas;this.overlay=overlay;this.input=new Input(canvas);this.renderer=new Renderer(canvas);
    this.state='menu';this.level=0;this.score=0;this.wave=1;this.time=0;this.shake=0;this.lastFrame=0;
    this.levels=3;this.frame=this.frame.bind(this);this.reset();requestAnimationFrame(this.frame);
  }
  reset() {
    this.world=new World();const center=World.SIZE*World.TILE/2;
    this.player=new Player(center,center);this.humans=[];this.particles=[];this.score=0;this.wave=1;this.level=0;this.waveDelay=2.5;this.spawnWave();
  }
  spawnWave() {
    const count=4+this.wave*2+this.level*2,chance=Math.min(.15+this.wave*.1+this.level*.1,.6);
    for(let i=0;i<count;i++)this.spawnHuman(Math.random()<chance?'s':'f');
  }
  spawnHuman(kind) {
    for(let i=0;i<80;i++){const p=this.world.randomOpenPosition();if(Math.hypot(p.x-this.player.x,p.y-this.player.y)>400){this.humans.push(new Human(p.x,p.y,kind));return;}}
  }
  start() { this.reset();this.state='play';this.overlay.style.display='none'; }
  finish(title,subtitle,button) {
    this.state='over';this.overlay.querySelector('#tt').textContent=title;
    this.overlay.querySelector('#sb').textContent=subtitle;this.overlay.querySelector('#go').textContent=button;this.overlay.style.display='flex';
  }
  burst(human) {
    for(let i=0;i<14;i++)this.particles.push(new Particle(human.x,human.y,['#ff4fd8','#5ef05a','#ffd21f'][i%3]));
  }
  update(dt) {
    this.time+=dt;this.waveDelay-=dt;this.player.update(dt,this.input,this.world);
    for(const human of this.humans){
      if(Math.hypot(human.x-this.player.x,human.y-this.player.y)<this.player.r+human.r+4){human.takeDamage(140*dt);if(human.dead){this.score++;this.shake=8;this.burst(human);}}
      human.update(dt,this.player,this.world,this.level);
    }
    this.humans=this.humans.filter(h=>!h.dead);
    for(const particle of this.particles)particle.update(dt);
    this.particles=this.particles.filter(p=>p.alive);
    if(!this.humans.length&&this.waveDelay<=0){
      if(this.wave<4){this.wave++;this.waveDelay=1.8;this.spawnWave();}
      else if(this.level<2){this.level++;this.world.generate();const c=World.SIZE*World.TILE/2;this.player.x=c;this.player.y=c;this.wave=1;this.waveDelay=2.5;this.spawnWave();}
      else this.finish('YOU WIN!','All 3 levels cleared. You caught '+this.score+' humans.','PLAY AGAIN');
    }
    if(this.player.hp<=0)this.finish('GAME OVER','You caught '+this.score+' humans. Try again!','TRY AGAIN');
  }
  frame(timestamp) {
    const dt=Math.min(.05,(timestamp-this.lastFrame)/1000||0);this.lastFrame=timestamp;
    if(this.state==='play')this.update(dt);
    this.renderer.draw(this);requestAnimationFrame(this.frame);
  }
  destroy(){this.input.destroy();this.renderer.destroy();}
}
