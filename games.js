// NevelTops Arcade — 4 mini games on one canvas: Dungeon, Open World, Shooter, RPG
(()=>{
const cv=document.getElementById('gcv'),ctx=cv.getContext('2d'),W0=640,H0=400;
const keys={};let cur=null,curName='',focused=false,visible=false,last=performance.now(),time=0;
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function txt(s,x,y,size=18,col='#fff',al='center'){ctx.font=`${size}px "Space Grotesk",sans-serif`;ctx.textAlign=al;ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y)}
function bar(x,y,w,h,v,col){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x,y,w,h);ctx.fillStyle=col;ctx.fillRect(x,y,w*clamp(v,0,1),h);ctx.strokeStyle='rgba(255,255,255,.3)';ctx.strokeRect(x,y,w,h)}
const DIRS={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};

/* ============ 1. DUNGEON CRAWLER ============ */
const dungeon={
 help:'🏰 Dungeon: Arrow keys / WASD to move. Bump monsters to fight. Grab 🧪 potions & 💰 gold. Find 🪜 to descend deeper!',
 init(){this.floor=1;this.hp=24;this.max=24;this.gold=0;this.atk=0;this.log='You enter the dungeon...';this.dead=false;this.shake=0;this.gen()},
 gen(){
  const W=this.W=48,H=this.H=32,m=this.m=Array.from({length:H},()=>Array(W).fill(1));
  this.seen=Array.from({length:H},()=>Array(W).fill(false));
  const rooms=[];
  for(let i=0;i<80&&rooms.length<9;i++){
   const w=ri(5,10),h=ri(4,7),x=ri(1,W-w-2),y=ri(1,H-h-2);
   if(rooms.some(r=>x<r.x+r.w+1&&x+w+1>r.x&&y<r.y+r.h+1&&y+h+1>r.y))continue;
   for(let j=y;j<y+h;j++)for(let k=x;k<x+w;k++)m[j][k]=0;
   const c={x,y,w,h,cx:Math.floor(x+w/2),cy:Math.floor(y+h/2)};
   if(rooms.length){const p=rooms[rooms.length-1];let a=p.cx,b=p.cy;
    while(a!==c.cx){a+=Math.sign(c.cx-a);m[b][a]=0}
    while(b!==c.cy){b+=Math.sign(c.cy-b);m[b][a]=0}}
   rooms.push(c);
  }
  this.px=rooms[0].cx;this.py=rooms[0].cy;
  const L=rooms[rooms.length-1];this.sx=L.cx;this.sy=L.cy;
  this.en=[];this.items=[];
  const E=['👹','🦇','🕷️','💀','🐍','👻'];
  rooms.slice(1).forEach(r=>{
   const n=ri(1,2)+(this.floor>2?1:0);
   for(let i=0;i<n;i++)this.en.push({x:ri(r.x,r.x+r.w-1),y:ri(r.y,r.y+r.h-1),hp:3+this.floor*2,e:E[ri(0,E.length-1)]});
   if(Math.random()<.75)this.items.push({x:ri(r.x,r.x+r.w-1),y:ri(r.y,r.y+r.h-1),t:Math.random()<.5?'🧪':'💰'});
  });
  this.reveal();
 },
 reveal(){for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const a=this.px+x,b=this.py+y;if(x*x+y*y<=36&&this.m[b]&&this.m[b][a]!==undefined)this.seen[b][a]=true}},
 vis(x,y){return (x-this.px)**2+(y-this.py)**2<=36},
 key(k){
  if(this.dead){if(k==='r'||k==='enter')this.init();return}
  const d=DIRS[k];if(d)this.step(d[0],d[1]);
 },
 step(dx,dy){
  const nx=this.px+dx,ny=this.py+dy,e=this.en.find(o=>o.x===nx&&o.y===ny);
  if(e){const d=ri(2,4)+this.atk;e.hp-=d;this.log=`You hit ${e.e} for ${d}`;
   if(e.hp<=0){this.en.splice(this.en.indexOf(e),1);const g=ri(3,8);this.gold+=g;this.log=`Slain ${e.e}! +${g} gold`}}
  else if(this.m[ny]&&this.m[ny][nx]===0){
   this.px=nx;this.py=ny;
   const i=this.items.findIndex(o=>o.x===nx&&o.y===ny);
   if(i>=0){const it=this.items.splice(i,1)[0];
    if(it.t==='🧪'){this.hp=Math.min(this.max,this.hp+8);this.log='Potion! +8 HP'}else{const g=ri(5,15);this.gold+=g;this.log=`Found ${g} gold!`}}
   if(nx===this.sx&&ny===this.sy){this.floor++;this.hp=Math.min(this.max,this.hp+4);this.atk=Math.floor(this.floor/3);this.log=`⬇ Floor ${this.floor}`;this.gen();return}
  }else return;
  this.en.forEach(o=>{
   const dx=this.px-o.x,dy=this.py-o.y,d=Math.abs(dx)+Math.abs(dy);
   if(d===1){const dm=ri(1,2)+Math.floor(this.floor/2);this.hp-=dm;this.log=`${o.e} hits you for ${dm}!`;this.shake=8}
   else if(d<9){
    const t=Math.abs(dx)>Math.abs(dy)?[[Math.sign(dx),0],[0,Math.sign(dy)]]:[[0,Math.sign(dy)],[Math.sign(dx),0]];
    for(const[a,b]of t){if(!a&&!b)continue;const x=o.x+a,y=o.y+b;
     if(this.m[y][x]===0&&!(x===this.px&&y===this.py)&&!this.en.some(q=>q.x===x&&q.y===y)){o.x=x;o.y=y;break}}}
  });
  if(this.hp<=0){this.hp=0;this.dead=true;this.log='💀 You died. Press R / Enter to retry.'}
  this.reveal();
 },
 update(dt){this.shake=Math.max(0,this.shake-dt*30)},
 draw(){
  const T=32,cx=clamp(this.px*T-W0/2+16,0,this.W*T-W0),cy=clamp(this.py*T-H0/2+16,0,this.H*T-H0);
  ctx.fillStyle='#05040c';ctx.fillRect(0,0,W0,H0);
  ctx.save();if(this.shake)ctx.translate(rnd(-3,3),rnd(-3,3));
  for(let y=Math.floor(cy/T);y<=Math.floor((cy+H0)/T);y++)for(let x=Math.floor(cx/T);x<=Math.floor((cx+W0)/T);x++){
   if(!this.m[y]||!this.seen[y][x])continue;
   const v=this.vis(x,y),px=x*T-cx,py=y*T-cy;
   ctx.fillStyle=this.m[y][x]?(v?'#4a3b8c':'#241d46'):(v?((x+y)%2?'#231d48':'#1e1940'):'#120f26');
   ctx.fillRect(px,py,T,T);
   if(this.m[y][x]&&v){ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(px,py,T,3)}
   if(x===this.sx&&y===this.sy)txt('🪜',px+16,py+17,24);
  }
  this.items.forEach(o=>{if(this.vis(o.x,o.y))txt(o.t,o.x*T-cx+16,o.y*T-cy+17+Math.sin(time*4+o.x)*2,22)});
  this.en.forEach(o=>{if(this.vis(o.x,o.y)){txt(o.e,o.x*T-cx+16,o.y*T-cy+17,26);bar(o.x*T-cx+3,o.y*T-cy-2,26,3,o.hp/(3+this.floor*2),'#ff3d8b')}});
  txt('🧙',this.px*T-cx+16,this.py*T-cy+17,28);
  ctx.restore();
  const g=ctx.createRadialGradient(W0/2,H0/2,120,W0/2,H0/2,380);g.addColorStop(0,'transparent');g.addColorStop(1,'rgba(0,0,0,.7)');ctx.fillStyle=g;ctx.fillRect(0,0,W0,H0);
  bar(10,10,150,12,this.hp/this.max,'#ff3d8b');txt(`❤ ${this.hp}/${this.max}`,16,16,11,'#fff','left');
  txt(`Floor ${this.floor}   💰 ${this.gold}   ⚔ +${this.atk}`,10,34,13,'#00e5ff','left');
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,H0-26,W0,26);txt(this.log,W0/2,H0-13,14);
 }
};

/* ============ 2. OPEN WORLD ============ */
const world={
 help:'🌍 Open World: WASD / arrows to explore, hold Shift to sprint. Collect all 30 💎 across the land. Watch the day turn to night!',
 init(){
  const N=this.N=160,T=this.T=24,seed=Math.random()*1000;
  const hash=(x,y)=>{const s=Math.sin(x*127.1+y*311.7+seed)*43758.5453;return s-Math.floor(s)};
  const sm=t=>t*t*(3-2*t);
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=sm(x-ix),fy=sm(y-iy);
   const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy};
  const fbm=(x,y)=>(vn(x/28,y/28)*.55+vn(x/12,y/12)*.3+vn(x/5,y/5)*.15);
  this.map=[];const mini=document.createElement('canvas');mini.width=mini.height=N;const mc=mini.getContext('2d');
  const COL=['#123a7a','#2a6fd1','#e3cf8e','#3f9e45','#2e7d36','#7b7f8c','#f2f6ff'];
  for(let y=0;y<N;y++){this.map[y]=[];for(let x=0;x<N;x++){
   const dc=Math.hypot(x-N/2,y-N/2)/(N/2),h=fbm(x,y)-dc*.25+.1;let t;
   if(h<.3)t=0;else if(h<.37)t=1;else if(h<.42)t=2;else if(h<.72)t=(vn(x/3,y/3)>.62?4:3);else if(h<.8)t=5;else t=6;
   this.map[y][x]=t;mc.fillStyle=COL[t];mc.fillRect(x,y,1,1)}}
  this.mini=mini;this.COL=COL;
  let sx=N/2,sy=N/2;outer:for(let r=0;r<60;r++)for(let a=0;a<360;a+=15){const x=Math.floor(N/2+Math.cos(a)*r),y=Math.floor(N/2+Math.sin(a)*r);if(this.map[y]&&this.map[y][x]===3){sx=x;sy=y;break outer}}
  this.x=sx*T+T/2;this.y=sy*T+T/2;this.gems=[];this.an=[];this.got=0;this.moving=false;this.clock=60;
  const walk=(x,y)=>this.map[y]&&[1,2,3,6].includes(this.map[y][x]);
  while(this.gems.length<30){const x=ri(2,N-3),y=ri(2,N-3);if(walk(x,y)&&this.map[y][x]!==1)this.gems.push({x:x*T+T/2,y:y*T+T/2})}
  const A=['🐑','🦌','🐇','🐗'];
  while(this.an.length<35){const x=ri(2,N-3),y=ri(2,N-3);if(this.map[y][x]===3)this.an.push({x:x*T+T/2,y:y*T+T/2,e:A[ri(0,3)],vx:0,vy:0,t:0})}
 },
 free(px,py){const t=this.map[Math.floor(py/this.T)];if(!t)return false;const v=t[Math.floor(px/this.T)];return v===1||v===2||v===3||v===6},
 ok(x,y){const r=8;return this.free(x-r,y-r)&&this.free(x+r,y-r)&&this.free(x-r,y+r)&&this.free(x+r,y+r)},
 update(dt){
  this.clock+=dt;let dx=0,dy=0;
  for(const k in DIRS)if(keys[k]){dx+=DIRS[k][0];dy+=DIRS[k][1]}
  this.moving=!!(dx||dy);
  if(this.moving){const l=Math.hypot(dx,dy),sp=(keys.shift?240:140)*dt,tile=this.map[Math.floor(this.y/this.T)][Math.floor(this.x/this.T)],f=tile===1?.55:1;
   const nx=this.x+dx/l*sp*f,ny=this.y+dy/l*sp*f;if(this.ok(nx,this.y))this.x=nx;if(this.ok(this.x,ny))this.y=ny}
  this.gems=this.gems.filter(g=>{if(Math.hypot(g.x-this.x,g.y-this.y)<16){this.got++;return false}return true});
  this.an.forEach(a=>{a.t-=dt;if(a.t<=0){a.t=rnd(1,3);const m=Math.random()<.5;a.vx=m?rnd(-1,1)*30:0;a.vy=m?rnd(-1,1)*30:0}
   const nx=a.x+a.vx*dt,ny=a.y+a.vy*dt;if(this.map[Math.floor(ny/this.T)][Math.floor(nx/this.T)]===3){a.x=nx;a.y=ny}})
 },
 draw(){
  const T=this.T,cx=this.x-W0/2,cy=this.y-H0/2;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W0,H0);
  for(let y=Math.max(0,Math.floor(cy/T));y<=Math.min(this.N-1,Math.floor((cy+H0)/T));y++)for(let x=Math.max(0,Math.floor(cx/T));x<=Math.min(this.N-1,Math.floor((cx+W0)/T));x++){
   const t=this.map[y][x],px=x*T-cx,py=y*T-cy;
   ctx.fillStyle=t<2?`hsl(${t?210:222},70%,${(t?42:26)+4*Math.sin(time*2+x*.7+y*.5)}%)`:this.COL[t===4?3:t];
   ctx.fillRect(px,py,T+1,T+1);
   if(t===4)txt('🌲',px+12,py+13,22);else if(t===5)txt('⛰️',px+12,py+13,24);
  }
  this.gems.forEach(g=>txt('💎',g.x-cx,g.y-cy+Math.sin(time*4+g.x)*3,16+Math.sin(time*6+g.y)*2));
  this.an.forEach(a=>txt(a.e,a.x-cx,a.y-cy,18));
  txt('🧝',this.x-cx,this.y-cy+(this.moving?Math.sin(time*18)*2:0),24);
  const day=(Math.sin(this.clock/12)+1)/2,dark=clamp(.7-day*1.1,0,.65);
  ctx.fillStyle=`rgba(5,8,40,${dark})`;ctx.fillRect(0,0,W0,H0);
  const hr=Math.floor(((this.clock/12)%(Math.PI*2))/(Math.PI*2)*24);
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(8,8,170,46);
  txt(`💎 ${this.got}/30`,16,22,16,'#00e5ff','left');txt(`${dark>.25?'🌙':'☀️'} ${String(hr).padStart(2,'0')}:00`,16,42,13,'#fff','left');
  ctx.drawImage(this.mini,W0-92,8,84,84);ctx.strokeStyle='rgba(255,255,255,.5)';ctx.strokeRect(W0-92,8,84,84);
  ctx.fillStyle='#ff3d8b';ctx.fillRect(W0-92+this.x/T/this.N*84-2,8+this.y/T/this.N*84-2,4,4);
  if(!this.got&&this.clock<66)txt('Explore! Gems sparkle across the land ✨',W0/2,H0-20,14);
  if(this.got>=30)txt('🏆 You found every gem — Master Explorer!',W0/2,H0-20,18,'#ffd75e');
 }
};

/* ============ 3. SPACE SHOOTER ============ */
const shooter={
 help:'🚀 Shooter: Move with mouse / touch / arrows, hold Space or click to fire. Grab ⚡ for triple-shot. Survive the waves & bosses!',
 init(){Object.assign(this,{x:W0/2,tx:W0/2,y:350,b:[],e:[],eb:[],p:[],pu:[],score:0,lives:3,wave:0,cd:0,inv:0,power:0,over:false,spawnLeft:0,spawnT:0,banner:0});
  this.stars=Array.from({length:70},()=>({x:rnd(0,W0),y:rnd(0,H0),s:rnd(20,120)}));this.nextWave()},
 nextWave(){this.wave++;this.banner=2;this.boss=this.wave%4===0;this.spawnLeft=this.boss?1:4+this.wave*2;this.spawnT=1},
 boom(x,y,c){for(let i=0;i<14;i++){const a=rnd(0,6.28),s=rnd(40,200);this.p.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rnd(.3,.7),c})}},
 key(k){if(this.over&&(k==='r'||k==='enter'))this.init()},
 update(dt){
  this.stars.forEach(s=>{s.y+=s.s*dt;if(s.y>H0){s.y=0;s.x=rnd(0,W0)}});
  if(this.over)return;
  if(keys.arrowleft||keys.a)this.tx-=400*dt;if(keys.arrowright||keys.d)this.tx+=400*dt;
  this.tx=clamp(this.tx,20,W0-20);this.x+=(this.tx-this.x)*Math.min(1,dt*14);
  this.cd-=dt;this.inv-=dt;this.power-=dt;this.banner-=dt;
  if((keys[' ']||keys.fire)&&this.cd<=0){this.cd=this.power>0?.1:.18;
   const sp=this.power>0?[-.2,0,.2]:[0];sp.forEach(a=>this.b.push({x:this.x,y:this.y-16,vx:a*520,vy:-520}))}
  this.spawnT-=dt;
  if(this.spawnLeft>0&&this.spawnT<=0){this.spawnLeft--;this.spawnT=this.boss?0:.7;
   this.e.push(this.boss?{x:W0/2,bx:W0/2,y:-40,hp:30+this.wave*8,max:30+this.wave*8,boss:1,t:0,e:'👾',r:36}:{x:0,bx:rnd(60,W0-60),y:-20,hp:1+(this.wave>4),t:rnd(0,6),e:['🛸','👽','☄️'][ri(0,2)],r:16,max:1+(this.wave>4)})}
  this.e.forEach(o=>{o.t+=dt;
   if(o.boss){o.y=Math.min(70,o.y+50*dt);o.x=W0/2+Math.sin(o.t*.9)*220;if(Math.random()<dt*3){for(let i=-1;i<=1;i++)this.eb.push({x:o.x,y:o.y+30,vx:i*80,vy:200})}}
   else{o.y+=(45+this.wave*6)*dt;o.x=o.bx+Math.sin(o.t*2)*60;if(Math.random()<dt*.25*(1+this.wave*.1))this.eb.push({x:o.x,y:o.y+14,vx:0,vy:220})}});
  this.b.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt});this.eb.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt});this.pu.forEach(o=>o.y+=90*dt);
  this.b.forEach(b=>this.e.forEach(o=>{if(b.dead||o.dead)return;if(Math.hypot(b.x-o.x,b.y-o.y)<o.r+4){b.dead=1;o.hp--;this.boom(b.x,b.y,'#ffd75e');
   if(o.hp<=0){o.dead=1;this.score+=o.boss?500:10*this.wave;this.boom(o.x,o.y,o.boss?'#ff3d8b':'#00e5ff');if(o.boss||Math.random()<.14)this.pu.push({x:o.x,y:o.y})}}}));
  if(this.inv<=0){
   this.eb.forEach(b=>{if(Math.hypot(b.x-this.x,b.y-this.y)<14){b.dead=1;this.hit()}});
   this.e.forEach(o=>{if(Math.hypot(o.x-this.x,o.y-this.y)<o.r+10&&!o.boss){o.dead=1;this.boom(o.x,o.y,'#ff3d8b');this.hit()}});
  }
  this.pu.forEach(o=>{if(Math.hypot(o.x-this.x,o.y-this.y)<22){o.dead=1;this.power=8;this.score+=50}});
  this.b=this.b.filter(o=>!o.dead&&o.y>-10);this.eb=this.eb.filter(o=>!o.dead&&o.y<H0+10&&o.x>-10&&o.x<W0+10);
  this.e=this.e.filter(o=>!o.dead&&o.y<H0+30);this.pu=this.pu.filter(o=>!o.dead&&o.y<H0+10);
  this.p.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;o.l-=dt});this.p=this.p.filter(o=>o.l>0);
  if(this.spawnLeft<=0&&!this.e.length)this.nextWave();
 },
 hit(){this.lives--;this.inv=1.6;this.boom(this.x,this.y,'#ff3d8b');if(this.lives<=0)this.over=true},
 draw(){
  ctx.fillStyle='#05030f';ctx.fillRect(0,0,W0,H0);
  this.stars.forEach(s=>{ctx.fillStyle=`rgba(255,255,255,${s.s/160})`;ctx.fillRect(s.x,s.y,1.5,1.5+s.s/60)});
  this.pu.forEach(o=>txt('⚡',o.x,o.y,22));
  this.e.forEach(o=>{txt(o.e,o.x,o.y,o.boss?72:30);if(o.boss)bar(W0/2-100,10,200,8,o.hp/o.max,'#ff3d8b')});
  ctx.fillStyle='#00e5ff';this.b.forEach(o=>ctx.fillRect(o.x-2,o.y-8,4,14));
  ctx.fillStyle='#ff3d8b';this.eb.forEach(o=>{ctx.beginPath();ctx.arc(o.x,o.y,5,0,7);ctx.fill()});
  this.p.forEach(o=>{ctx.globalAlpha=clamp(o.l*2,0,1);ctx.fillStyle=o.c;ctx.fillRect(o.x,o.y,3,3)});ctx.globalAlpha=1;
  if(!this.over&&(this.inv<=0||Math.floor(time*12)%2)){
   ctx.save();ctx.translate(this.x,this.y);ctx.shadowColor='#7c5cff';ctx.shadowBlur=18;
   ctx.fillStyle='#e8e4ff';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(14,14);ctx.lineTo(0,8);ctx.lineTo(-14,14);ctx.fill();
   ctx.fillStyle='#ff9f3d';ctx.beginPath();ctx.moveTo(-4,10);ctx.lineTo(0,18+Math.random()*8);ctx.lineTo(4,10);ctx.fill();ctx.restore()}
  txt(`Score ${this.score}`,10,16,16,'#00e5ff','left');txt(`Wave ${this.wave}`,10,36,13,'#9a97c0','left');
  txt('❤'.repeat(Math.max(0,this.lives)),W0-10,16,16,'#ff3d8b','right');if(this.power>0)txt(`⚡ ${Math.ceil(this.power)}s`,W0-10,36,13,'#ffd75e','right');
  if(this.banner>0)txt(this.boss?'⚠ BOSS INCOMING ⚠':`WAVE ${this.wave}`,W0/2,H0/2-40,34,'#fff');
  if(this.over){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W0,H0);txt('GAME OVER',W0/2,H0/2-20,44,'#ff3d8b');txt(`Score ${this.score} — press R / Enter`,W0/2,H0/2+25,18)}
 }
};

/* ============ 4. TURN-BASED RPG ============ */
const FOES=[['Slime','🟢'],['Goblin','👺'],['Skeleton','💀'],['Ogre','👹'],['Wraith','👻'],['Wyvern','🐲'],['Demon','😈'],['Dragon','🐉']];
const rpg={
 help:'⚔️ RPG: Turn-based duels! Keys 1–4 or tap the buttons: Attack, Fireball (3 MP), Heal (4 MP), Defend. Level up and slay the dragon!',
 init(){this.p={hp:40,max:40,mp:8,mmax:8,lv:1,xp:0,need:20};this.kills=0;this.fx=[];this.log=[];this.def=false;this.turn='player';this.wait=0;this.pend=null;this.shk=0;this.pf=0;this.spawn();this.say('A wild '+this.foe.name+' appears!');this.btns()},
 spawn(){const[n,e]=FOES[Math.min(this.kills,FOES.length-1)],k=this.kills;this.foe={name:n,e,hp:22+k*14,max:22+k*14,atk:3+k*1.6}},
 say(s){this.log.push(s);if(this.log.length>3)this.log.shift()},
 pop(t,x,y,c){this.fx.push({t,x,y,c,l:1})},
 after(ms,f){this.wait=ms/1000;this.pend=f},
 btns(){document.querySelectorAll('#rpgbtns button').forEach(b=>b.disabled=this.turn!=='player')},
 key(k){if(this.turn==='dead'&&(k==='r'||k==='enter'))return this.init();if('1234'.includes(k)&&k.length===1)this.act(+k)},
 act(n){
  if(this.turn!=='player')return;const p=this.p,f=this.foe;
  if(n===1){const d=ri(5,9)+p.lv*2;f.hp-=d;this.say(`You slash for ${d}!`);this.pop(d,440,150,'#fff');this.shk=.3}
  else if(n===2){if(p.mp<3)return this.say('Not enough MP!');p.mp-=3;const d=ri(12,18)+p.lv*3;f.hp-=d;this.say(`🔥 Fireball hits for ${d}!`);this.pop(d,440,150,'#ff9f3d');this.shk=.4}
  else if(n===3){if(p.mp<4)return this.say('Not enough MP!');p.mp-=4;const h=ri(14,20)+p.lv*2;p.hp=Math.min(p.max,p.hp+h);this.say(`💚 You heal ${h} HP.`);this.pop('+'+h,170,190,'#5dff9a')}
  else if(n===4){this.def=true;p.mp=Math.min(p.mmax,p.mp+2);this.say('🛡 You brace yourself (+2 MP).')}
  this.turn='wait';this.btns();
  if(f.hp<=0){f.hp=0;this.after(600,()=>this.win())}else this.after(800,()=>this.foeTurn());
 },
 foeTurn(){
  const f=this.foe,p=this.p;let d=Math.floor(f.atk+ri(0,4));if(this.def){d=Math.floor(d/2);this.def=false}
  p.hp-=d;this.say(`${f.e} ${f.name} hits you for ${d}!`);this.pop(d,170,190,'#ff3d8b');this.pf=.3;
  if(p.hp<=0){p.hp=0;this.turn='dead';this.say('💀 Defeated. Press R / Enter.');this.btns()}else{this.turn='player';this.btns()}
 },
 win(){
  const p=this.p,xp=10+this.kills*4;p.xp+=xp;this.kills++;this.say(`${this.foe.name} defeated! +${xp} XP`);
  if(p.xp>=p.need){p.xp-=p.need;p.lv++;p.need=Math.floor(p.need*1.5);p.max+=10;p.mmax+=2;p.hp=p.max;p.mp=p.mmax;this.say(`⭐ LEVEL UP! You are level ${p.lv}!`);this.pop('LEVEL UP!',170,120,'#ffd75e')}
  else{p.hp=Math.min(p.max,p.hp+6);p.mp=Math.min(p.mmax,p.mp+2)}
  if(this.kills>=FOES.length+2){this.turn='dead';this.say('🏆 You conquered the realm! Press R to play again.');this.btns();return}
  this.after(1200,()=>{this.spawn();this.say('A wild '+this.foe.name+' appears!');this.turn='player';this.btns()});
 },
 update(dt){
  this.shk=Math.max(0,this.shk-dt);this.pf=Math.max(0,this.pf-dt);
  if(this.wait>0){this.wait-=dt;if(this.wait<=0&&this.pend){const f=this.pend;this.pend=null;f()}}
  this.fx.forEach(o=>{o.l-=dt;o.y-=30*dt});this.fx=this.fx.filter(o=>o.l>0);
 },
 draw(){
  const g=ctx.createLinearGradient(0,0,0,H0);g.addColorStop(0,'#1b1050');g.addColorStop(.6,'#3b1a6e');g.addColorStop(1,'#12301f');ctx.fillStyle=g;ctx.fillRect(0,0,W0,H0);
  for(let i=0;i<40;i++){ctx.fillStyle=`rgba(255,255,255,${.4+.4*Math.sin(time*2+i)})`;ctx.fillRect((i*97)%W0,(i*53)%150,2,2)}
  ctx.fillStyle='#173d28';ctx.beginPath();ctx.ellipse(440,225,100,22,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(170,285,90,20,0,0,7);ctx.fill();
  const f=this.foe,p=this.p,sh=this.shk>0?rnd(-6,6):0;
  if(f.hp>0||this.turn==='wait')txt(f.e,440+sh,170+Math.sin(time*3)*6,f.hp>0?96:70);
  txt('🧙',170+(this.pf>0?rnd(-6,6):0),230+Math.sin(time*3+1)*4,76);
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(330,20,280,52);txt(`${f.e} ${f.name}`,340,36,15,'#fff','left');bar(340,50,260,12,f.hp/f.max,'#ff3d8b');
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(20,20,250,78);txt(`🧙 Hero  Lv ${p.lv}`,30,36,15,'#fff','left');
  bar(30,50,230,10,p.hp/p.max,'#5dff9a');bar(30,64,230,8,p.mp/p.mmax,'#00a8ff');bar(30,76,230,6,p.xp/p.need,'#ffd75e');
  txt(`${p.hp}/${p.max}`,258,55,9,'#000','right');
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,H0-76,W0,76);
  this.log.forEach((l,i)=>txt(l,16,H0-62+i*22,15,i===this.log.length-1?'#fff':'#9a97c0','left'));
  this.fx.forEach(o=>{ctx.globalAlpha=clamp(o.l*1.5,0,1);txt(o.t,o.x,o.y,28,o.c);});ctx.globalAlpha=1;
  txt(`Victories: ${this.kills}`,W0-12,H0-62,13,'#ffd75e','right');
  if(this.turn==='dead'){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W0,H0-76);txt(this.kills>=FOES.length+2?'VICTORY!':'DEFEATED',W0/2,150,46,this.kills>=FOES.length+2?'#ffd75e':'#ff3d8b')}
 }
};

/* ============ 5. GUESS WHO — 10,000 characters ============ */
const SYL=['ba','ke','mo','ri','tu','la','ze','do','fi','na','ko','pe','su','vi','xa','jo','hu','yu','we','qi','bo','ta'];
const HAIR={black:'#1a1a1f',brown:'#6b3f22',blonde:'#f0cf5a',red:'#c4421f',gray:'#b9b9c4',none:null};
const SKIN=['#fbe0c8','#f5d0b0','#e0ac80','#a8683a','#6b4226'],SKINN=['pale','fair','tan','brown','dark'];
const EYE={blue:'#3a8dde',green:'#3aa655',brown:'#5a3418',gray:'#8d95a3'};
const SHIRT={red:'#e0394a',blue:'#3a6fe0',green:'#2fa55a',yellow:'#f2c230',purple:'#8a4be0',white:'#eeeeee'};
const pick=a=>a[ri(0,a.length-1)];
const QLIST=[
 ['👨 A man?',c=>c.male],['👩 A woman?',c=>!c.male],['👓 Glasses?',c=>c.glasses],['🎩 A hat?',c=>c.hat],['🧔 A beard?',c=>c.beard],
 ['💍 Earrings?',c=>c.earrings],['🟠 Freckles?',c=>c.freckles],
 ...Object.keys(HAIR).map(k=>[k==='none'?'🥚 Bald?':`💇 ${k[0].toUpperCase()+k.slice(1)} hair?`,c=>c.hair===k]),
 ...SKINN.map((n,i)=>[`🖐 ${n[0].toUpperCase()+n.slice(1)} skin?`,c=>c.skin===i]),
 ...Object.keys(EYE).map(k=>[`👁 ${k[0].toUpperCase()+k.slice(1)} eyes?`,c=>c.eyes===k]),
 ...Object.keys(SHIRT).map(k=>[`👕 ${k[0].toUpperCase()+k.slice(1)} shirt?`,c=>c.shirt===k])
];
const guess={
 help:'🕵️ Guess Who — 10,000 characters! Ask yes/no questions to shrink the crowd (only matching faces stay). Scroll / use ◀ ▶ to browse who is left, then hit 🎯 Make a guess and click the culprit.',
 init(){
  const seen=new Set(),hk=Object.keys(HAIR),ek=Object.keys(EYE),sk=Object.keys(SHIRT);this.all=[];
  while(this.all.length<10000){
   const male=Math.random()<.5,o={male,hair:pick(hk),glasses:Math.random()<.35,hat:Math.random()<.3,beard:male&&Math.random()<.4,earrings:Math.random()<.25,freckles:Math.random()<.25,skin:ri(0,4),eyes:pick(ek),shirt:pick(sk)};
   const k=[male,o.hair,o.glasses,o.hat,o.beard,o.earrings,o.freckles,o.skin,o.eyes,o.shirt].join();if(seen.has(k))continue;seen.add(k);
   const n=this.all.length;o.name=(SYL[Math.floor(n/484)]+SYL[Math.floor(n/22)%22]+SYL[n%22]);o.name=o.name[0].toUpperCase()+o.name.slice(1);this.all.push(o);
  }
  this.rem=this.all.slice();this.secret=pick(this.all);this.pg=0;this.state='ask';this.asked=0;this.guessing=false;this.hover=-1;this.t=0;
  this.msg='10,000 suspects. Ask a question!';this.sync();
 },
 sync(){document.querySelectorAll('#gwbtns button').forEach(b=>{b.disabled=this.state!=='ask';if(b.dataset.q==='guess')b.classList.toggle('on',this.guessing)})},
 ask(i,label){
  if(this.state!=='ask')return;
  if(i==='guess'){this.guessing=!this.guessing;this.msg=this.guessing?'🎯 Click the person you think it is!':'Ask a question!';return this.sync()}
  const f=QLIST[i][1],ans=f(this.secret);this.asked++;this.guessing=false;this.rem=this.rem.filter(c=>f(c)===ans);this.pg=0;
  this.msg=`${label} → ${ans?'YES ✅':'NO ❌'}`+(this.rem.length===1?'  Only 1 left!':'');this.sync();
 },
 pages(){return Math.max(1,Math.ceil(this.rem.length/24))},
 go(d){this.pg=clamp(this.pg+d,0,this.pages()-1)},
 wheel(dy){this.go(Math.sign(dy))},
 cell(x,y){const col=Math.floor((x-20)/100),row=Math.floor((y-8)/84);if(col<0||col>5||row<0||row>3)return -1;const i=this.pg*24+row*6+col;return i<this.rem.length?i:-1},
 move(x,y){this.hover=this.cell(x,y)},
 click(x,y){
  if(y>H0-56){const nav=[[400,-10],[445,-1],[595,1],[628,10]];for(const[nx,d]of nav)if(Math.abs(x-nx)<20)this.go(d);return}
  if(this.state!=='ask')return;const i=this.cell(x,y);if(i<0)return;const o=this.rem[i];
  if(!this.guessing){this.msg='Press 🎯 Make a guess first, then click a face.';return}
  this.state=o===this.secret?'won':'lost';this.guessing=false;
  this.msg=this.state==='won'?`🎉 Yes! It was ${o.name}! ${this.asked} question${this.asked===1?'':'s'}.`:`❌ Nope — it was ${this.secret.name}. Press R / Enter.`;
  if(this.state==='lost'){this.rem=[this.secret];this.pg=0}this.sync();
 },
 key(k){
  if((this.state==='won'||this.state==='lost')&&(k==='r'||k==='enter'))return this.init();
  if(k==='arrowright'||k==='d')this.go(1);else if(k==='arrowleft'||k==='a')this.go(-1);else if(k==='pagedown')this.go(10);else if(k==='pageup')this.go(-10);
 },
 update(dt){this.t+=dt},
 face(x,y,o){
  const h=HAIR[o.hair];
  ctx.fillStyle=SHIRT[o.shirt];ctx.beginPath();ctx.roundRect(x-22,y+17,44,12,6);ctx.fill();
  if(h&&!o.male){ctx.fillStyle=h;ctx.beginPath();ctx.roundRect(x-24,y-22,48,46,16);ctx.fill()}
  ctx.fillStyle=SKIN[o.skin];ctx.beginPath();ctx.arc(x,y,20,0,7);ctx.fill();
  if(o.beard){ctx.fillStyle=h||'#333';ctx.beginPath();ctx.ellipse(x,y+10,17,13,0,0,Math.PI);ctx.fill()}
  if(h){ctx.fillStyle=h;ctx.beginPath();ctx.arc(x,y-3,21,Math.PI*1.05,Math.PI*1.95);ctx.fill()}
  [-7,7].forEach(dx=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+dx,y-1,3.6,0,7);ctx.fill();ctx.fillStyle=EYE[o.eyes];ctx.beginPath();ctx.arc(x+dx,y-1,2.3,0,7);ctx.fill()});
  if(o.freckles){ctx.fillStyle='rgba(120,60,20,.75)';[[-11,5],[-7,7],[-14,7],[11,5],[7,7],[14,7]].forEach(([a,b])=>ctx.fillRect(x+a,y+b-1,1.8,1.8))}
  if(o.earrings){ctx.fillStyle='#ffd75e';ctx.beginPath();ctx.arc(x-20,y+5,2.5,0,7);ctx.arc(x+20,y+5,2.5,0,7);ctx.fill()}
  if(o.glasses){ctx.strokeStyle='#111';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x-7,y-1,6,0,7);ctx.moveTo(x+13,y-1);ctx.arc(x+7,y-1,6,0,7);ctx.moveTo(x-1,y-1);ctx.lineTo(x+1,y-1);ctx.stroke()}
  ctx.strokeStyle=o.beard?'#fff':'#7a2a2a';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(x,y+6,6,.15*Math.PI,.85*Math.PI);ctx.stroke();
  if(o.hat){ctx.fillStyle='#ff3d8b';ctx.beginPath();ctx.ellipse(x,y-14,27,6,0,0,7);ctx.fill();ctx.fillStyle='#7c5cff';ctx.beginPath();ctx.arc(x,y-15,16,Math.PI,0);ctx.fill()}
 },
 draw(){
  ctx.fillStyle='#0b0820';ctx.fillRect(0,0,W0,H0);
  for(let n=0;n<24;n++){
   const i=this.pg*24+n;if(i>=this.rem.length)break;const o=this.rem[i],x=20+(n%6)*100,y=8+Math.floor(n/6)*84,rv=this.state!=='ask'&&o===this.secret;
   ctx.fillStyle=rv?'#2d5a3d':(this.guessing&&this.hover===i?'#4a2a7a':'#1b1745');ctx.beginPath();ctx.roundRect(x+3,y+3,94,78,12);ctx.fill();
   ctx.strokeStyle=this.hover===i?'#00e5ff':'rgba(255,255,255,.15)';ctx.lineWidth=this.hover===i?2:1;ctx.stroke();
   this.face(x+50,y+30,o);txt(o.name,x+50,y+70,12,'#cfcaff');
  }
  if(!this.rem.length)txt('No one left?!',W0/2,170,24);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,H0-56,W0,56);
  txt(this.msg,16,H0-36,15,this.state==='won'?'#5dff9a':this.state==='lost'?'#ff3d8b':'#fff','left');
  txt(`Questions: ${this.asked}  •  Suspects left: ${this.rem.length.toLocaleString()}`,16,H0-14,13,'#00e5ff','left');
  txt('⏪',400,H0-28,18);txt('◀',445,H0-28,18);txt(`${this.pg+1}/${this.pages()}`,520,H0-28,14,'#cfcaff');txt('▶',595,H0-28,18);txt('⏩',628,H0-28,18);
 }
};

/* ============ MANAGER ============ */
const games={dungeon,world,shooter,rpg,guess};
const helpEl=document.getElementById('ghelp'),rb=document.getElementById('rpgbtns'),gw=document.getElementById('gwbtns'),dp=document.getElementById('dpad');
function select(n){
  curName=n;cur=games[n];cur.init();helpEl.textContent=cur.help;
  rb.style.display=n==='rpg'?'flex':'none';gw.style.display=n==='guess'?'flex':'none';dp.style.display=(n==='dungeon'||n==='world')?'':'';dp.dataset.on=(n==='dungeon'||n==='world'||n==='shooter')?'1':'0';
  document.querySelectorAll('.gtab').forEach(b=>b.classList.toggle('on',b.dataset.g===n));
}
document.querySelectorAll('.gtab').forEach(b=>b.onclick=()=>{select(b.dataset.g);cv.focus()});
document.getElementById('grestart').onclick=()=>{cur.init();cv.focus()};
rb.querySelectorAll('button').forEach(b=>b.onclick=()=>{cur.act(+b.dataset.a);cv.focus()});

function press(k){keys[k]=true;if(cur.key)cur.key(k)}
addEventListener('keydown',e=>{
  if(!focused)return;const k=e.key.toLowerCase();
  if(k in DIRS||k===' '||k==='enter'||'1234r'.includes(k)&&k.length===1||k==='shift')e.preventDefault();
  if(!keys[k])press(k);else if(curName==='dungeon'&&k in DIRS&&e.repeat)cur.key(k);
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
cv.addEventListener('focus',()=>focused=true);cv.addEventListener('blur',()=>{focused=false;for(const k in keys)keys[k]=false});
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W0,(e.clientY-r.top)/r.height*H0]};
cv.addEventListener('pointermove',e=>{if(curName==='shooter')cur.tx=pos(e)[0];else if(curName==='guess')cur.move(...pos(e))});
cv.addEventListener('pointerdown',e=>{cv.focus();if(curName==='shooter'){cur.tx=pos(e)[0];keys.fire=true}else if(curName==='guess')cur.click(...pos(e))});
[...QLIST.map((q,i)=>[i,q[0]]),['guess','🎯 Make a guess']].forEach(([id,label])=>{
  const b=document.createElement('button');b.textContent=label;b.dataset.q=id;if(id==='guess')b.className='gg';
  b.onclick=()=>{guess.ask(id,label);cv.focus()};gw.appendChild(b)});
cv.addEventListener('wheel',e=>{if(curName==='guess'&&focused){e.preventDefault();cur.wheel(e.deltaY)}},{passive:false});
addEventListener('pointerup',()=>keys.fire=false);
dp.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();cv.focus();if(!keys[k])press(k);if(curName==='shooter'&&k===' ')keys[' ']=true});
  const up=()=>keys[k]=false;b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up)});

new IntersectionObserver(es=>visible=es[0].isIntersecting,{threshold:.1}).observe(cv);
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(visible){time+=dt;cur.update(dt);cur.draw();
    if(!focused){ctx.fillStyle='rgba(5,4,15,.62)';ctx.fillRect(0,0,W0,H0);txt('▶ Click to play',W0/2,H0/2-8,32,'#00e5ff');txt('then use the keys shown below',W0/2,H0/2+28,14,'#9a97c0')}}
  requestAnimationFrame(loop)
}
select('dungeon');requestAnimationFrame(loop);
})();
