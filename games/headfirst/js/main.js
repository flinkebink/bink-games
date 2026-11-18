import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { Particle } from './Particle.js';
import { GameLoop } from './GameLoop.js';

const cv=document.getElementById('cv'),c=cv.getContext('2d'),$=id=>document.getElementById(id);
let W,H,D;function rs(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D}
addEventListener('resize',rs);rs();
const FR=['🍎','🍓','🍊','🍇','🍉','🥝','🍑','🍋'],r=40,GL=2.05,SC=.085;
const TY=[{e:'🐍',hp:1,v:1.7,s:.3},{e:'🦊',hp:2,v:1.9,s:.34},{e:'🐺',hp:3,v:2.1,s:.4},{e:'🐆',hp:4,v:2.7,s:.42},{e:'🐻',hp:7,v:1.5,s:.56},{e:'🐊',hp:9,v:1.7,s:.6},{e:'🦁',hp:12,v:2.3,s:.66}];
let st='idle',x=0,y=0,vx=0,vy=0,score=0,kills=0,lives=3,inv=0,t=0,ax=1,ay=0,cd=0,flash=0,spT=0,shake=0,ammo=3,rl=0,ang=0,aimOn=false,wasAim=false,aimDur=0,aimMax=0,MAG=3,coins=0,bank=0,gun=0,owned=Array(15).fill(0),up=[0,0,0,0,0],tab=0,loadout='g',melee=0,bomb=0,ownedM=Array(9).fill(0),ownedB=Array(5).fill(0),bombs=3,bcd=0,swT=0,fw=0,G,M,B;
let en=[],bl=[],fr=[],pt=[],po=[],rg=[],bolts=[],bm=[],sl=[];
const keys={},mouse={x:0,y:0,down:false,has:false};let jo=null,aimT=null;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key.toLowerCase()=='e'||e.key.toLowerCase()=='q')throwBomb(mouse.has);if(e.key.startsWith('Arrow')||e.key==' ')e.preventDefault()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
 if(e.pointerType=='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.has=true;if(e.button==2){throwBomb(true);return}mouse.down=true}
 else if(e.clientX<W/2&&!jo)jo={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};
 else if(!aimT)aimT={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY}});
cv.addEventListener('pointermove',e=>{
 if(e.pointerType=='mouse'){mouse.x=e.clientX;mouse.y=e.clientY;mouse.has=true}
 else{if(jo&&jo.id==e.pointerId){jo.x=e.clientX;jo.y=e.clientY}if(aimT&&aimT.id==e.pointerId){aimT.x=e.clientX;aimT.y=e.clientY}}});
const pup=e=>{if(e.pointerType=='mouse')mouse.down=false;if(jo&&jo.id==e.pointerId)jo=null;if(aimT&&aimT.id==e.pointerId)aimT=null};
addEventListener('pointerup',pup);addEventListener('pointercancel',pup);

function puff(px,py,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=r*(2+Math.random()*4);pt.push(new Particle({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5,col}))}}
function spawnEn(){const mt=Math.min(TY.length-1,kills/5|0),k=Math.random()*(mt+1)|0,T=TY[k],an=Math.random()*6.283,
 sz=Math.min(W,H)*SC/r,cs=Math.abs(Math.cos(an))+1e-6,sn=Math.abs(Math.sin(an))+1e-6,d=Math.min(W/2/sz/cs,H/2/sz/sn)+r*(1.2+Math.random()*1.5);
 en.push(new Enemy({x:x+Math.cos(an)*d,y:y+Math.sin(an)*d,s:r*T.s*2,e:T.e,hp:T.hp,mh:T.hp,k,v:r*T.v*1.1*(1-.08*up[2])*(1+Math.min(.5,kills/100)),f:0,st:0,kx:0,ky:0}))}
function hud(){$('sc').textContent=coins;$('lv').textContent='♥'.repeat(lives)+'♡'.repeat(Math.max(0,3-lives));$('am').textContent=st!='play'?'':loadout=='m'?'🗡️ '+M.nm:'●'.repeat(ammo)+'○'.repeat(MAG-ammo);$('bb').hidden=st!='play';$('bb').textContent='💣 '+bombs}
function start(){x=y=vx=vy=0;score=kills=0;lives=3;inv=0;applyGun();coins=0;rl=0;en=[];bl=[];fr=[];pt=[];po=[];rg=[];bolts=[];bm=[];sl=[];bombs=3+up[3]+up[4];bcd=0;swT=0;fw=0;spT=.3;st='play';$('ov').hidden=true;hud()}
const GUNS=[
{nm:'Starter Blaster',p:0,ds:'3 pellets, balanced',n:3,sp:.12,dmg:1,mag:3,rg:.9,life:.6,spd:22,z:1,kick:1.2,col:'#ffe27a',gc:'#2d3340'},
{nm:'Boomstick',p:40,ds:'5 wide pellets, short range',n:5,sp:.4,dmg:1,mag:3,rg:.9,life:.45,spd:22,z:1,kick:1.8,col:'#ffb36b',gc:'#6b3e1f'},
{nm:'Rapid Rifle',p:90,ds:'2 tight shots, 2 damage each, 4 ammo',n:2,sp:.05,dmg:2,mag:4,rg:.6,life:.7,spd:28,z:1,kick:.8,col:'#9be7ff',gc:'#1f4f66'},
{nm:'Heavy Cannon',p:160,ds:'1 huge shell, 6 damage',n:1,sp:0,dmg:6,mag:3,rg:1.1,life:.8,spd:20,z:2.2,kick:2,col:'#ff7a7a',gc:'#3a1f2a'},
{nm:'Mega Shotgun',p:300,ds:'7 pellets, 2 damage each, 4 ammo',n:7,sp:.5,dmg:2,mag:4,rg:.7,life:.5,spd:24,z:1.1,kick:2.2,col:'#d9a6ff',gc:'#3d2a66'},
{nm:'Scatter Pistol',p:380,ds:'4 spread shots, 2 damage each',n:4,sp:.2,dmg:2,mag:4,rg:.6,life:.55,spd:24,z:1,kick:1.4,col:'#ffd0a0',gc:'#5a3a24'},
{nm:'Plasma Gun',p:480,ds:'1 plasma bolt, 4 damage, 5 ammo',n:1,sp:0,dmg:4,mag:5,rg:.7,life:.8,spd:26,z:1.6,kick:1,col:'#6ff2ff',gc:'#12506a'},
{nm:'Burst Rifle',p:600,ds:'3 tight shots, 3 damage each',n:3,sp:.04,dmg:3,mag:4,rg:.6,life:.75,spd:30,z:1.1,kick:1.2,col:'#b8ff8a',gc:'#2b4a1f'},
{nm:'Flame Spitter',p:720,ds:'9 hot pellets, very short range, 5 ammo',n:9,sp:.35,dmg:1,mag:5,rg:.45,life:.35,spd:20,z:.9,kick:1.6,col:'#ff9a3c',gc:'#5a2a10'},
{nm:'Sniper',p:1000,ds:'1 long-range shot, 12 damage',n:1,sp:0,dmg:12,mag:3,rg:1,life:1.1,spd:34,z:1.8,kick:2.4,col:'#e8f0ff',gc:'#222a35'},
{nm:'Double Barrel',p:1300,ds:'10 pellets, 2 damage each',n:10,sp:.45,dmg:2,mag:3,rg:.8,life:.5,spd:24,z:1,kick:2.6,col:'#ffc2c2',gc:'#4a2a2a'},
{nm:'Gatling',p:1700,ds:'3 shots, 2 damage each, 6 ammo, fast recharge',n:3,sp:.08,dmg:2,mag:6,rg:.35,life:.6,spd:28,z:1,kick:.8,col:'#fff1a0',gc:'#3a3a3a',fx:'gatling'},
{nm:'Rocket Launcher',p:2200,ds:'1 giant rocket, 20 damage',n:1,sp:0,dmg:20,mag:3,rg:1.2,life:.9,spd:18,z:3,kick:3,col:'#ff5a2a',gc:'#4a1f10',fx:'rocket'},
{nm:'Storm Cannon',p:2800,ds:'5 heavy shots, 4 damage each, 5 ammo',n:5,sp:.25,dmg:4,mag:5,rg:.5,life:.7,spd:26,z:1.5,kick:2.2,col:'#8aa8ff',gc:'#1f2a5a',fx:'storm'},
{nm:'Legend Blaster',p:3500,ds:'9 golden shots, 4 damage each, 6 ammo, fast recharge',n:9,sp:.55,dmg:4,mag:6,rg:.35,life:.8,spd:30,z:1.4,kick:2.5,col:'#ffd166',gc:'#7a4a00',fx:'legend'}];
const MEL=[
{nm:'Knife',p:0,ds:'Fast and short, 1 damage',dmg:1,reach:2.4,arc:1.7,cd:.28,kb:3,len:.7,sh:'blade',bc:'#d9dee6',col:'#ffffff'},
{nm:'Machete',p:35,ds:'Wider swing, 2 damage',dmg:2,reach:2.8,arc:2,cd:.32,kb:4,len:1.1,sh:'blade',bc:'#c9d3c0',col:'#ffffff'},
{nm:'Axe',p:80,ds:'Heavy chop, 3 damage',dmg:3,reach:3,arc:2,cd:.45,kb:6,len:1.3,sh:'axe',bc:'#b8c0cc',col:'#ffffff'},
{nm:'Katana',p:160,ds:'Long and quick, 3 damage',dmg:3,reach:3.8,arc:1.6,cd:.24,kb:3,len:2.1,sh:'blade',bc:'#eef3ff',col:'#ffffff'},
{nm:'Spear',p:260,ds:'Very long narrow poke, 4 damage',dmg:4,reach:5,arc:.5,cd:.4,kb:7,len:3,sh:'spear',bc:'#d8d8d8',col:'#ffffff'},
{nm:'Warhammer',p:400,ds:'Slow, 8 damage and a shockwave',dmg:8,reach:3.2,arc:2.2,cd:.8,kb:10,len:1.4,sh:'hammer',bc:'#8a8f99',fx:'quake',col:'#c9b38a'},
{nm:'Flame Sword',p:700,ds:'Burning blade, 5 damage',dmg:5,reach:4,arc:2.3,cd:.33,kb:5,len:2.2,sh:'blade',bc:'#ff7a2a',fx:'fire',col:'#ff9a3c'},
{nm:'Lightning Blade',p:1000,ds:'Wide swing, 6 damage, lightning jumps',dmg:6,reach:4.2,arc:2.4,cd:.3,kb:5,len:2.4,sh:'blade',bc:'#9fb8ff',fx:'bolt',col:'#8aa8ff'},
{nm:'Titan Scythe',p:1600,ds:'Huge golden sweep, 10 damage',dmg:10,reach:5,arc:3.1,cd:.4,kb:8,len:3.1,sh:'blade',bc:'#ffd166',fx:'gold',col:'#ffd166'}];
const BOMBS=[
{nm:'Round Bomb',p:0,ds:'Medium blast, 6 damage',dmg:6,rad:3.5,col:'#ff9a3c'},
{nm:'Mega Bomb',p:200,ds:'Bigger blast, 12 damage',dmg:12,rad:5,col:'#ff5a2a'},
{nm:'Cluster Bomb',p:450,ds:'Bursts into 7 blasts, 5 damage each',dmg:5,rad:2.6,col:'#ffd166',ty:'cluster'},
{nm:'Ice Bomb',p:700,ds:'Freezes animals for 3 seconds, 4 damage',dmg:4,rad:5,col:'#7fe3ff',ty:'ice'},
{nm:'Nuke',p:1500,ds:'Giant blast, 40 damage, lights up the screen',dmg:40,rad:9,col:'#fff1a0',ty:'nuke'}];
const KEY='hf-save';
function save(){try{localStorage.setItem(KEY,JSON.stringify({bank,owned,gun,up,loadout,melee,bomb,ownedM,ownedB}))}catch(e){}}
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s){bank=s.bank|0;if(Array.isArray(s.owned))owned=GUNS.map((_,i)=>s.owned[i]?1:0);gun=owned[s.gun]?s.gun:0;if(Array.isArray(s.up))up=[0,1,2,3,4].map(i=>Math.min(5,s.up[i]|0));if(Array.isArray(s.ownedM))ownedM=MEL.map((_,i)=>s.ownedM[i]?1:0);if(Array.isArray(s.ownedB))ownedB=BOMBS.map((_,i)=>s.ownedB[i]?1:0);melee=ownedM[s.melee]?s.melee:0;bomb=ownedB[s.bomb]?s.bomb:0;loadout=s.loadout=='m'?'m':'g'}}catch(e){}
owned[0]=1;ownedM[0]=1;ownedB[0]=1;
function applyGun(){G=GUNS[gun];MAG=G.mag;ammo=MAG;M=MEL[melee];B=BOMBS[bomb]}
function renderShop(){$('bank').textContent='🪙 '+bank+' coins';const el=$('shop');el.innerHTML='';for(let q=0;q<4;q++)$('t'+q).className=tab==q?'on':'';if(tab==1){renderUp(el);return}if(tab==2){renderMel(el);return}if(tab==3){renderBomb(el);return}
 GUNS.forEach((g,i)=>{const d=document.createElement('div');d.className='g';d.innerHTML='<span><b>'+g.nm+'</b>'+g.ds+'</span>';const b=document.createElement('button');
  if(i==gun&&loadout=='g'){b.textContent='Equipped';b.disabled=true}
  else if(owned[i]){b.textContent='Equip';b.onclick=()=>{gun=i;loadout='g';save();applyGun();renderShop()}}
  else{b.textContent='🪙 '+g.p;b.disabled=bank<g.p;b.onclick=()=>{if(bank>=g.p){bank-=g.p;owned[i]=1;gun=i;loadout='g';save();applyGun();renderShop()}}}
  d.appendChild(b);el.appendChild(d)})}
const UPS=[{nm:'Speed',ds:'Run faster, +8% per level',b:50},{nm:'Quick Reload',ds:'Ammo recharges and melee swings 10% faster per level',b:60},{nm:'Slow Animals',ds:'Animals move 8% slower per level',b:70},{nm:'Extra Bomb I',ds:'+1 bomb every run',b:200,mx:1},{nm:'Extra Bomb II',ds:'+1 more bomb every run',b:500,mx:1}];
function renderUp(el){UPS.forEach((u,i)=>{const lv=up[i],d=document.createElement('div');d.className='g';
 d.innerHTML='<span><b>'+u.nm+' · Lv '+lv+'/'+(u.mx||5)+'</b>'+u.ds+'</span>';const b=document.createElement('button');
 if(lv>=(u.mx||5)){b.textContent='Maxed';b.disabled=true}
 else{const p=u.b*(lv+1);b.textContent='🪙 '+p;b.disabled=bank<p;b.onclick=()=>{if(bank>=p){bank-=p;up[i]++;save();renderShop()}}}
 d.appendChild(b);el.appendChild(d)})}
function renderMel(el){MEL.forEach((g,i)=>{const d=document.createElement('div');d.className='g';d.innerHTML='<span><b>'+g.nm+'</b>'+g.ds+'</span>';const b=document.createElement('button');
 if(i==melee&&loadout=='m'){b.textContent='Equipped';b.disabled=true}
 else if(ownedM[i]){b.textContent='Equip';b.onclick=()=>{melee=i;loadout='m';save();applyGun();renderShop()}}
 else{b.textContent='🪙 '+g.p;b.disabled=bank<g.p;b.onclick=()=>{if(bank>=g.p){bank-=g.p;ownedM[i]=1;melee=i;loadout='m';save();applyGun();renderShop()}}}
 d.appendChild(b);el.appendChild(d)})}
function renderBomb(el){BOMBS.forEach((g,i)=>{const d=document.createElement('div');d.className='g';d.innerHTML='<span><b>'+g.nm+'</b>'+g.ds+'</span>';const b=document.createElement('button');
 if(i==bomb){b.textContent='Equipped';b.disabled=true}
 else if(ownedB[i]){b.textContent='Equip';b.onclick=()=>{bomb=i;save();applyGun();renderShop()}}
 else{b.textContent='🪙 '+g.p;b.disabled=bank<g.p;b.onclick=()=>{if(bank>=g.p){bank-=g.p;ownedB[i]=1;bomb=i;save();applyGun();renderShop()}}}
 d.appendChild(b);el.appendChild(d)})}
$('t0').onclick=()=>{tab=0;renderShop()};$('t1').onclick=()=>{tab=1;renderShop()};$('t2').onclick=()=>{tab=2;renderShop()};$('t3').onclick=()=>{tab=3;renderShop()};
applyGun();renderShop();
$('go').onclick=start;

function swing(){const dir=Math.atan2(ay,ax);cd=M.cd*(1-.1*up[1]);swT=.2;vx+=ax*r*6;vy+=ay*r*6;sl.push({x,y,a:dir,arc:M.arc,rr:r*M.reach,l:.22,col:M.col});
 for(const e of en.slice()){const dx=e.x-x,dy=e.y-y,d=Math.max(Math.hypot(dx,dy),.001);if(d>r*M.reach+e.s)continue;let da=Math.atan2(dy,dx)-dir;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)>M.arc/2+Math.atan2(e.s,d))continue;
  hurtEn(e,M.dmg);puff(e.x,e.y,M.col,6);e.kx+=dx/d*r*M.kb;e.ky+=dy/d*r*M.kb;e.st=Math.max(e.st,.25);
  if(M.fx=='bolt'){let n=0;for(const o of en.slice()){if(n>=2)break;if(o===e)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<r*4){bolts.push({x1:e.x,y1:e.y,x2:o.x,y2:o.y,l:.25});hurtEn(o,M.dmg*.5);n++}}}}
 if(M.fx=='fire')puff(x+ax*r*M.reach*.7,y+ay*r*M.reach*.7,'#ff9a3c',20);
 if(M.fx=='quake'){rg.push({x:x+ax*r*2,y:y+ay*r*2,l:.5,m:r*M.reach*1.2,col:'#c9b38a'});shake=Math.max(shake,.6)}
 if(M.fx=='gold'){rg.push({x,y,l:.5,m:r*M.reach,col:'#ffd166'});puff(x+ax*r*3,y+ay*r*3,'#fff6e0',24);shake=Math.max(shake,.3)}}
function throwBomb(um){if(st!='play'||bombs<=0||bcd>0)return;bombs--;bcd=.35;hud();const sc=Math.min(W,H)*SC/r;let tx,ty;
 if(um&&mouse.has){tx=x+(mouse.x-W/2)/sc;ty=y+(mouse.y-H/2)/sc;const d=Math.hypot(tx-x,ty-y),m=r*10;if(d>m){tx=x+(tx-x)/d*m;ty=y+(ty-y)/d*m}}else{tx=x+ax*r*7;ty=y+ay*r*7}
 bm.push({x0:x,y0:y,tx,ty,t:0,T:.7,k:B})}
function blast(px,py,rad,dmg,col,ice){for(const e of en.slice()){const d=Math.hypot(e.x-px,e.y-py);if(d<rad+e.s){hurtEn(e,dmg);if(ice)e.st=3;else{const q=d||1;e.kx+=(e.x-px)/q*r*6;e.ky+=(e.y-py)/q*r*6;e.st=Math.max(e.st,.4)}}}
 puff(px,py,col,26);rg.push({x:px,y:py,l:.5,m:rad,col});shake=Math.max(shake,Math.min(1,rad/r/6))}
function boom(b){const k=b.k;if(k.ty=='cluster'){blast(b.tx,b.ty,r*k.rad,k.dmg,k.col);for(let i=0;i<6;i++){const a=i*1.0472+.3;blast(b.tx+Math.cos(a)*r*3,b.ty+Math.sin(a)*r*3,r*k.rad,k.dmg,k.col)}}else{blast(b.tx,b.ty,r*k.rad,k.dmg,k.col,k.ty=='ice');if(k.ty=='nuke')fw=1}}
$('bb').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();throwBomb(false)});
function meleeDraw(R){const p=swT>0?1-swT/.2:.5,an=swT>0?(p-.5)*M.arc:-.25;
 c.save();c.translate(R*1.05,R*.12);c.rotate(an);if(M.fx){c.shadowColor=M.col;c.shadowBlur=14}
 const L=R*M.len;c.fillStyle='#6b4423';c.fillRect(-R*.15,-R*.07,R*.5,R*.14);
 if(M.sh=='spear'){c.fillRect(R*.3,-R*.05,L,R*.1);c.fillStyle=M.bc;c.beginPath();c.moveTo(R*.3+L,-R*.16);c.lineTo(R*.3+L+R*.5,0);c.lineTo(R*.3+L,R*.16);c.fill()}
 else if(M.sh=='axe'){c.fillRect(R*.3,-R*.06,L,R*.12);c.fillStyle=M.bc;c.beginPath();c.moveTo(R*.3+L*.6,0);c.lineTo(R*.3+L,-R*.5);c.lineTo(R*.3+L+R*.15,0);c.lineTo(R*.3+L,R*.5);c.fill()}
 else if(M.sh=='hammer'){c.fillRect(R*.3,-R*.06,L,R*.12);c.fillStyle=M.bc;c.fillRect(R*.3+L-R*.25,-R*.4,R*.6,R*.8)}
 else{c.fillStyle='#caa24a';c.fillRect(R*.3,-R*.22,R*.1,R*.44);c.fillStyle=M.bc;c.beginPath();c.moveTo(R*.4,-R*.12);c.lineTo(R*.4+L,-R*.1);c.lineTo(R*.4+L+R*.25,0);c.lineTo(R*.4+L,R*.1);c.lineTo(R*.4,R*.12);c.fill()}
 c.restore()}
function hurtEn(e,d){e.hp-=d;e.f=.1;if(e.hp<=0){const k=en.indexOf(e);if(k>=0)en.splice(k,1);kills++;score+=1+e.k;coins+=e.mh;bank+=e.mh;save();po.push({x:e.x,y:e.y-e.s,l:.9,v:e.mh});hud();puff(e.x,e.y,'#ffd166',14);if(Math.random()<.1)fr.push({x:e.x,y:e.y,e:'❤️',l:10,a:Math.random()*6})}}
function hitFx(b,e){puff(b.x,b.y,b.fx?G.col:'#fff6e0',b.fx?8:3);hurtEn(e,b.d);
 if(b.fx=='rocket'){for(const o of en.slice())if(o!==e&&Math.hypot(o.x-b.x,o.y-b.y)<r*3.2)hurtEn(o,b.d*.6);puff(b.x,b.y,'#ff9a3c',30);puff(b.x,b.y,'#fff1a0',14);rg.push({x:b.x,y:b.y,l:.5,m:r*3.2,col:'#ff9a3c'});shake=Math.max(shake,.7)}
 if(b.fx=='storm'){let from=e,n=0;const lst=en.slice().sort((p,q)=>Math.hypot(p.x-e.x,p.y-e.y)-Math.hypot(q.x-e.x,q.y-e.y));for(const o of lst){if(n>=3)break;if(o===e||Math.hypot(o.x-from.x,o.y-from.y)>r*5)continue;bolts.push({x1:from.x,y1:from.y,x2:o.x,y2:o.y,l:.25});hurtEn(o,b.d*.5);from=o;n++}}
 if(b.fx=='gatling'){puff(b.x,b.y,'#ffb347',8);if(en.includes(e)){const l=Math.hypot(b.vx,b.vy)||1;e.kx+=b.vx/l*r*3;e.ky+=b.vy/l*r*3;e.st=Math.max(e.st,.3)}}
 if(b.fx=='legend')puff(b.x,b.y,'#fff6e0',10)}
function bulletFx(b,dt){
 if(Math.random()<.6){const q=Math.random()<.5,cl=b.fx=='rocket'?(q?'#ff9a3c':'#9aa0a6'):b.fx=='storm'?(q?'#8aa8ff':'#fff'):b.fx=='gatling'?(q?'#ffb347':'#fff1a0'):(q?'#ffd166':'#fff6e0');pt.push(new Particle({x:b.x,y:b.y,vx:(Math.random()-.5)*r*2,vy:(Math.random()-.5)*r*2,l:.35,col:cl}))}
 if(b.fx=='legend'){let n=null,nd=r*9;for(const o of en){const d=Math.hypot(o.x-b.x,o.y-b.y);if(d<nd){nd=d;n=o}}
  if(n){const sp=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx);let da=Math.atan2(n.y-b.y,n.x-b.x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));const na=a+Math.max(-4*dt,Math.min(4*dt,da));b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}}}
function fireShot(){cd=.25;flash=1;ammo--;hud();const a0=Math.atan2(ay,ax);
 for(let i=0;i<G.n;i++){const a=a0+(G.n==1?0:(i/(G.n-1)-.5)*2*G.sp);
  bl.push(new Projectile({x:x+ax*r*GL,y:y+ay*r*GL,vx:Math.cos(a)*r*G.spd,vy:Math.sin(a)*r*G.spd,l:G.life,d:G.dmg,z:G.z,fx:G.fx}))}
 vx-=ax*r*G.kick;vy-=ay*r*G.kick}
function update(dt){
 let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(jo){const dx=jo.x-jo.ox,dy=jo.y-jo.oy,l=Math.hypot(dx,dy);if(l>6){const m=Math.min(l/60,1);ix=dx/l*m;iy=dy/l*m}}
 const il=Math.hypot(ix,iy);if(il>1){ix/=il;iy/=il}
 if(st!='play')ix=iy=0;
 const mx=r*5*(1+.08*up[0]),k=Math.min(1,dt*6);vx+=(ix*mx-vx)*k;vy+=(iy*mx-vy)*k;x+=vx*dt;y+=vy*dt;
 inv=Math.max(0,inv-dt);swT=Math.max(0,swT-dt);shake=Math.max(0,shake-dt*3);flash=Math.max(0,flash-dt*9);cd-=dt;
 if(st=='play'){
  let aiming=false;
  if(aimT){const dx=aimT.x-aimT.ox,dy=aimT.y-aimT.oy,l=Math.hypot(dx,dy);if(l>8){ax=dx/l;ay=dy/l}aiming=true}
  else if(mouse.has&&(mouse.down||keys[' '])){const dx=mouse.x-W/2,dy=mouse.y-H/2,l=Math.hypot(dx,dy)||1;ax=dx/l;ay=dy/l;aiming=true}
  else if(il>.2){ax+=(ix/il-ax)*.25;ay+=(iy/il-ay)*.25;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l}
  aimOn=aiming;
  if(aiming){aimDur+=dt;if(aimT)aimMax=Math.max(aimMax,Math.hypot(aimT.x-aimT.ox,aimT.y-aimT.oy))}
  if(wasAim&&!aiming&&cd<=0&&(loadout=='m'||ammo>0)){
   if(aimDur<.2&&aimMax<14){let b=null,bd=loadout=='m'?r*10:r*G.spd*G.life;for(const e of en){const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;b=e}}if(b){const l=Math.max(bd,.001);ax=(b.x-x)/l;ay=(b.y-y)/l}}
   if(loadout=='m')swing();else fireShot()}
  if(!aiming){aimDur=0;aimMax=0}
  wasAim=aiming;
  if(ammo<MAG){rl+=dt;if(rl>=G.rg*(1-.1*up[1])){rl=0;ammo++;hud()}}
  spT-=dt;if(spT<=0&&en.length<5+Math.min(14,kills/3|0)){spawnEn();spT=Math.max(.5,1.6-kills*.02)}
 }
 for(let i=bl.length-1;i>=0;i--){const b=bl[i];b.update(dt);if(b.fx)bulletFx(b,dt);let gone=b.l<=0;
  for(let j=en.length-1;j>=0&&!gone;j--){const e=en[j];
   if(Math.hypot(e.x-b.x,e.y-b.y)<e.s+r*.1*b.z){gone=true;hitFx(b,e)}}
  if(gone)bl.splice(i,1)}
 for(const e of en){const dx=x-e.x,dy=y-e.y,d=Math.hypot(dx,dy)||1;
  e.f=Math.max(0,e.f-dt);e.st=Math.max(0,e.st-dt);e.x+=e.kx*dt;e.y+=e.ky*dt;const kd=Math.max(0,1-dt*5);e.kx*=kd;e.ky*=kd;
  if(e.st<=0){e.x+=dx/d*e.v*dt;e.y+=dy/d*e.v*dt}
  if(st=='play'&&inv<=0&&e.st<=0&&d<r*.8+e.s*.7){lives--;inv=1.3;shake=1;e.st=.7;e.kx=-dx/d*r*8;e.ky=-dy/d*r*8;vx+=dx/d*r*5;vy+=dy/d*r*5;hud();
   if(lives<=0){st='over';$('t').textContent='Out of lives';$('d').textContent='You took down '+kills+' predators and earned '+coins+' coins. Spend them below.';$('go').textContent='Hunt again';renderShop();$('ov').hidden=false;$('ov').scrollTop=0;hud()}}}
 for(let i=fr.length-1;i>=0;i--){const f=fr[i];f.l-=dt;
  if(f.l<=0)fr.splice(i,1);else if(st=='play'&&Math.hypot(f.x-x,f.y-y)<r*.95){fr.splice(i,1);if(lives<5)lives++;hud()}}
 for(let i=pt.length-1;i>=0;i--){const p=pt[i];p.update(dt);if(p.l<=0)pt.splice(i,1)}
 for(let i=po.length-1;i>=0;i--){po[i].y-=r*2*dt;po[i].l-=dt;if(po[i].l<=0)po.splice(i,1)}
 for(let i=rg.length-1;i>=0;i--){rg[i].l-=dt;if(rg[i].l<=0)rg.splice(i,1)}
 for(let i=sl.length-1;i>=0;i--){sl[i].l-=dt;if(sl[i].l<=0)sl.splice(i,1)}
 for(let i=bm.length-1;i>=0;i--){const b=bm[i];b.t+=dt;if(b.t>=b.T){bm.splice(i,1);boom(b)}}
 bcd=Math.max(0,bcd-dt);fw=Math.max(0,fw-dt*2);
 for(let i=bolts.length-1;i>=0;i--){bolts[i].l-=dt;if(bolts[i].l<=0)bolts.splice(i,1)}
}

function hs(i,j,k){let h=(i*374761393+j*668265263+k*2246822519)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function grass(s){const gs=120,i0=Math.floor((x-W/2/s)/gs),i1=Math.floor((x+W/2/s)/gs),j0=Math.floor((y-H/2/s)/gs),j1=Math.floor((y+H/2/s)/gs);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
  c.fillStyle=(i+j)&1?'#6aa84a':'#639f44';c.fillRect(i*gs,j*gs,gs+1,gs+1);
  c.strokeStyle='#4c8434';c.lineWidth=3;c.lineCap='round';c.beginPath();
  for(let k=0;k<4;k++){const px=(i+hs(i,j,k))*gs,py=(j+hs(i,j,k+9))*gs;c.moveTo(px-6,py);c.lineTo(px-9,py-10);c.moveTo(px,py);c.lineTo(px,py-13);c.moveTo(px+6,py);c.lineTo(px+9,py-10)}c.stroke();
  if(hs(i,j,20)<.18){const px=(i+hs(i,j,21))*gs,py=(j+hs(i,j,22))*gs;c.fillStyle=hs(i,j,23)<.5?'#fff3c4':'#ffb3c7';c.beginPath();c.arc(px,py,5,0,6.283);c.fill()}
  if(hs(i,j,30)<.07){const px=(i+hs(i,j,31))*gs,py=(j+hs(i,j,32))*gs;c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(px+3,py+7,16,8,0,0,6.283);c.fill();c.fillStyle='#9aa39a';c.beginPath();c.ellipse(px,py,15,10,0,0,6.283);c.fill();c.fillStyle='#b9c2b9';c.beginPath();c.ellipse(px-3,py-3,8,4,0,0,6.283);c.fill()}}}

function head(R){
 const sp=Math.min(1,Math.hypot(vx,vy)/(r*5)),hurt=inv>0;
 let da=Math.atan2(ay,ax)-ang;da=Math.atan2(Math.sin(da),Math.cos(da));ang+=da*.4;
 if(hurt&&Math.floor(t*18)%2)c.globalAlpha=.55;
 c.save();c.translate(W/2,H/2);
 c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(R*.08,R*.14,R*1.25,R*1.1,0,0,6.283);c.fill();
 const pu=1+Math.sin(t*12)*.025*sp;c.scale(pu,pu);c.rotate(ang);
 c.fillStyle='#ff6b6b';c.beginPath();c.ellipse(-R*.35,0,R*.6,R*1.4,0,0,6.283);c.fill();
 c.fillStyle='#e8995c';c.beginPath();c.ellipse(-R*.02,-R*.97,R*.17,R*.24,0,0,6.283);c.ellipse(-R*.02,R*.97,R*.17,R*.24,0,0,6.283);c.fill();
 c.beginPath();c.ellipse(R,0,R*.13,R*.17,0,0,6.283);c.fillStyle='#ec9a60';c.fill();
 const g=c.createRadialGradient(R*.2,-R*.2,R*.1,0,0,R*1.05);g.addColorStop(0,'#ffe0b8');g.addColorStop(1,'#f4a76a');
 c.fillStyle=g;c.beginPath();c.arc(0,0,R,0,6.283);c.fill();
 c.fillStyle='#3a2418';c.beginPath();c.arc(0,0,R,.9,6.283-.9);c.quadraticCurveTo(R*.25,0,Math.cos(.9)*R,Math.sin(.9)*R);c.closePath();c.fill();
 c.strokeStyle='#5a3a26';c.lineWidth=R*.07;c.lineCap='round';c.beginPath();c.arc(-R*.15,0,R*.45,.4,6.283-.4);c.stroke();
 if(hurt){c.fillStyle='rgba(255,60,80,.4)';c.beginPath();c.arc(0,0,R,0,6.283);c.fill()}
 const rc=flash*R*.18;
 c.strokeStyle='#ff6b6b';c.lineWidth=R*.34;c.beginPath();c.moveTo(-R*.3,R*1.15);c.lineTo(R*.8-rc,R*.1);c.moveTo(-R*.3,-R*1.15);c.lineTo(R*1.5-rc,-R*.05);c.stroke();
 if(loadout=='m'){meleeDraw(R)}else{c.save();c.translate(-rc,0);
 c.fillStyle=G.gc;c.beginPath();c.roundRect(R*.55,-R*.14,R*(GL-.55),R*.28,R*.06);c.fill();
 c.fillRect(R*.6,R*.05,R*.3,R*.36);
 c.fillStyle='#5d6678';c.fillRect(R*.7,-R*.1,R*1.2,R*.07);
 c.fillStyle='#161a22';c.fillRect(R*(GL-.12),-R*.1,R*.12,R*.2);c.restore()}
 c.fillStyle='#f4a76a';c.beginPath();c.arc(R*.8-rc,R*.1,R*.17,0,6.283);c.arc(R*1.5-rc,-R*.05,R*.17,0,6.283);c.fill();
 c.restore();c.globalAlpha=1;
 if(flash>0){const mx=W/2+ax*R*(GL+.15),my=H/2+ay*R*(GL+.15);c.fillStyle='rgba(255,226,122,'+flash+')';c.beginPath();c.arc(mx,my,R*.3*flash,0,6.283);c.fill();
  c.fillStyle='rgba(255,255,255,'+flash+')';c.beginPath();c.arc(mx,my,R*.14*flash,0,6.283);c.fill()}}

function draw(){
 c.setTransform(D,0,0,D,0,0);c.fillStyle='#639f44';c.fillRect(0,0,W,H);
 const R=Math.min(W,H)*SC,s=R/r,sx=(Math.random()-.5)*shake*10,sy=(Math.random()-.5)*shake*10;
 c.save();c.translate(W/2+sx,H/2+sy);c.scale(s,s);c.translate(-x,-y);
 grass(s);
 c.textAlign='center';c.textBaseline='middle';
 for(const f of fr){if(f.l<2&&Math.floor(t*10)%2)continue;c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(f.x,f.y+r*.3,r*.3,r*.07,0,0,6.283);c.fill();
  const pl=1+Math.sin(t*6+f.a)*.12;c.fillStyle='rgba(255,90,130,.42)';c.beginPath();c.arc(f.x,f.y,r*.85*pl,0,6.283);c.fill();c.strokeStyle='#fff';c.lineWidth=3/s;c.stroke();c.shadowColor='#ff5a7a';c.shadowBlur=16;c.font=(r*1.3)+'px serif';c.fillText(f.e,f.x,f.y+Math.sin(t*3+f.a)*r*.06);c.shadowBlur=0}
 for(const e of en){
  c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(e.x,e.y+e.s*.7,e.s*.9,e.s*.3,0,0,6.283);c.fill();
  c.fillStyle='rgba(150,25,25,.35)';c.beginPath();c.arc(e.x,e.y,e.s*1.1,0,6.283);c.fill();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=3/s;c.stroke();
  c.shadowColor='#fff';c.shadowBlur=12;c.font=(e.s*2.3)+'px serif';c.fillText(e.e,e.x,e.y+Math.sin(t*10+e.hp)*e.s*.06);c.shadowBlur=0;
  if(e.f>0){c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(e.x,e.y,e.s*.95,0,6.283);c.fill()}
  if(e.hp<e.mh){const w=e.s*1.8,h=e.s*.2,bx=e.x-w/2,by=e.y-e.s*1.3;c.fillStyle='rgba(0,0,0,.5)';c.fillRect(bx-2,by-2,w+4,h+4);c.fillStyle='#ff4d4d';c.fillRect(bx,by,w*e.hp/e.mh,h)}}
 c.fillStyle=G.col;c.strokeStyle='#8a5a00';c.lineWidth=2;
 for(const b of bl){c.save();if(b.fx){c.shadowColor=G.col;c.shadowBlur=18}c.translate(b.x,b.y);c.rotate(Math.atan2(b.vy,b.vx));c.beginPath();c.roundRect(-r*.2*b.z,-r*.05*b.z,r*.4*b.z,r*.1*b.z,r*.05*b.z);c.fill();c.restore()}
 for(const b of bm){const k=Math.min(1,b.t/b.T),px=b.x0+(b.tx-b.x0)*k,py=b.y0+(b.ty-b.y0)*k,hg=Math.sin(Math.PI*k)*r*2.2;
  c.globalAlpha=.45+.25*Math.sin(t*14);c.strokeStyle=b.k.col;c.lineWidth=3/s;c.beginPath();c.arc(b.tx,b.ty,r*b.k.rad,0,6.283);c.stroke();c.fillStyle=b.k.col;c.globalAlpha=.12;c.fill();c.globalAlpha=1;
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(px,py+r*.2,r*.35,r*.12,0,0,6.283);c.fill();c.font=(r*.9)+'px serif';c.fillText('💣',px,py-hg)}
 for(const q of sl){c.globalAlpha=Math.max(0,q.l*4);c.strokeStyle=q.col;c.lineWidth=r*.35;c.lineCap='round';c.beginPath();c.arc(q.x,q.y,q.rr*.85,q.a-q.arc/2,q.a+q.arc/2);c.stroke()}c.globalAlpha=1;
 for(const q of rg){const k=1-q.l/.5;c.globalAlpha=Math.max(0,q.l*2);c.strokeStyle=q.col;c.lineWidth=r*.25*(1-k);c.beginPath();c.arc(q.x,q.y,q.m*k,0,6.283);c.stroke();c.fillStyle=q.col;c.globalAlpha=Math.max(0,q.l*.5);c.beginPath();c.arc(q.x,q.y,q.m*k*.8,0,6.283);c.fill()}
 c.globalAlpha=1;c.lineJoin='round';
 for(const q of bolts){c.globalAlpha=Math.min(1,q.l*5);for(const [w,col] of [[r*.25,'#6f8cff'],[r*.09,'#fff']]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(q.x1,q.y1);for(let i=1;i<7;i++){const u=i/7;c.lineTo(q.x1+(q.x2-q.x1)*u+(Math.random()-.5)*r*.7,q.y1+(q.y2-q.y1)*u+(Math.random()-.5)*r*.7)}c.lineTo(q.x2,q.y2);c.stroke()}}
 c.globalAlpha=1;
 for(const p of pt){c.globalAlpha=Math.max(0,p.l*2);c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,r*.1,0,6.283);c.fill()}c.globalAlpha=1;
 c.font=(r*.7)+'px Bagel Fat One, system-ui';c.lineWidth=3;c.strokeStyle='#5a3b00';c.fillStyle='#ffd166';
 for(const q of po){c.globalAlpha=Math.min(1,q.l*2);c.strokeText('+'+q.v+' 🪙',q.x,q.y);c.fillText('+'+q.v+' 🪙',q.x,q.y)}c.globalAlpha=1;
 c.restore();
 {const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.6);vg.addColorStop(0,'rgba(10,30,10,0)');vg.addColorStop(1,'rgba(10,30,10,.5)');c.fillStyle=vg;c.fillRect(0,0,W,H)}
 if(fw>0){c.fillStyle='rgba(255,255,255,'+fw*.9+')';c.fillRect(0,0,W,H)}
 for(const e of en){const dx=(e.x-x)*s,dy=(e.y-y)*s;
  if(Math.abs(dx)>W/2+e.s*s||Math.abs(dy)>H/2+e.s*s){const a=Math.atan2(dy,dx),k=Math.min((W/2-26)/(Math.abs(Math.cos(a))+1e-6),(H/2-26)/(Math.abs(Math.sin(a))+1e-6)),px=W/2+Math.cos(a)*k,py=H/2+Math.sin(a)*k;
   c.fillStyle='rgba(160,30,30,.85)';c.beginPath();c.arc(px,py,17,0,6.283);c.fill();
   c.save();c.translate(px,py);c.rotate(a);c.beginPath();c.moveTo(25,0);c.lineTo(15,-7);c.lineTo(15,7);c.closePath();c.fill();c.restore();
   c.font='18px serif';c.textAlign='center';c.textBaseline='middle';c.fillText(e.e,px,py+1)}}
 head(R);
 if(aimOn&&st=='play'&&loadout=='m'){const a=Math.atan2(ay,ax),rr=R*M.reach;c.fillStyle='rgba(255,226,122,.3)';c.beginPath();c.moveTo(W/2,H/2);c.arc(W/2,H/2,rr,a-M.arc/2,a+M.arc/2);c.closePath();c.fill()}
 if(aimOn&&st=='play'&&loadout=='g'){const a=Math.atan2(ay,ax),mx=W/2+ax*R*GL,my=H/2+ay*R*GL,L=R*G.spd*G.life,sp2=Math.max(.05,G.sp+.03);
  const g=c.createLinearGradient(mx,my,mx+ax*L,my+ay*L);g.addColorStop(0,'rgba(255,226,122,.6)');g.addColorStop(1,'rgba(255,226,122,0)');
  c.fillStyle=g;c.beginPath();c.moveTo(mx,my);c.lineTo(mx+Math.cos(a-sp2)*L,my+Math.sin(a-sp2)*L);c.lineTo(mx+Math.cos(a+sp2)*L,my+Math.sin(a+sp2)*L);c.closePath();c.fill()}
 if(aimT){c.strokeStyle='rgba(255,226,122,.7)';c.lineWidth=3;c.beginPath();c.arc(aimT.ox,aimT.oy,40,0,6.283);c.stroke();
  const dx=aimT.x-aimT.ox,dy=aimT.y-aimT.oy,l=Math.min(Math.hypot(dx,dy),60)/(Math.hypot(dx,dy)||1);
  c.fillStyle='rgba(255,226,122,.8)';c.beginPath();c.arc(aimT.ox+dx*l*.66,aimT.oy+dy*l*.66,16,0,6.283);c.fill()}
 const tx=aimT?aimT.x:mouse.has?mouse.x:null,ty=aimT?aimT.y:mouse.y;
 if(false){const dx=tx-W/2,dy=ty-H/2,d=Math.hypot(dx,dy),m=R*(GL+.2);
  if(d>m){c.strokeStyle='rgba(255,70,70,.7)';c.lineWidth=2.5;c.setLineDash([R*.12,R*.16]);c.beginPath();c.moveTo(W/2+dx/d*m,H/2+dy/d*m);c.lineTo(tx,ty);c.stroke();c.setLineDash([])}}
 if(mouse.has&&mouse.down&&!aimT&&st=='play'){const q=mouse.x,w=mouse.y;c.strokeStyle='#fff';c.lineWidth=2.5;c.beginPath();c.arc(q,w,12,0,6.283);c.moveTo(q-20,w);c.lineTo(q-6,w);c.moveTo(q+6,w);c.lineTo(q+20,w);c.moveTo(q,w-20);c.lineTo(q,w-6);c.moveTo(q,w+6);c.lineTo(q,w+20);c.stroke()}
 if(jo){c.strokeStyle='rgba(255,246,224,.6)';c.lineWidth=3;c.beginPath();c.arc(jo.ox,jo.oy,40,0,6.283);c.stroke();
  const dx=jo.x-jo.ox,dy=jo.y-jo.oy,l=Math.min(Math.hypot(dx,dy),60)/(Math.hypot(dx,dy)||1);
  c.fillStyle='rgba(255,246,224,.7)';c.beginPath();c.arc(jo.ox+dx*l*.66,jo.oy+dy*l*.66,16,0,6.283);c.fill()}
}
const gameLoop = new GameLoop((dt) => { t += dt; update(dt); draw(); });
gameLoop.start();