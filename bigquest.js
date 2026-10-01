// REALM OF IDEAS — a long-form action RPG by NevelTops (8 zones, 80 stages, loot, skills, ascension, autosave)
(()=>{
'use strict';
const KEY='neveltops_bq_v1',W=960,H=540,MAXS=79;
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[ri(0,a.length-1)];
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n){n=Math.max(0,n);if(n<1000)return String(Math.floor(n));let i=0;while(n>=1000&&i<SUF.length-1){n/=1000;i++}return (n<10?n.toFixed(2):n<100?n.toFixed(1):Math.floor(n))+SUF[i]}
const TT=s=>Math.pow(1.135,s),hs=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s)};
const need=L=>240*Math.pow(1.12,L),reqKills=S=>60+8*S;

const ZONES=[
 {n:'Meadow Grove',ic:'🌿',c1:'#2f6b3a',c2:'#357a42',deco:['🌸','🌼','🍄','🌳'],mons:['🐛','🐗','🐺','🕷️'],boss:'🐻',bn:'Elder Bear'},
 {n:'Sunscorch Desert',ic:'🏜️',c1:'#c9a24b',c2:'#d4ae58',deco:['🌵','🪨','🦴','🌾'],mons:['🦂','🐍','🦎','🐪'],boss:'🧟',bn:'Sand Pharaoh'},
 {n:'Frostpeak',ic:'🏔️',c1:'#8fb6d9',c2:'#a2c4e2',deco:['❄️','⛄','🌲','🧊'],mons:['🐧','🐺','🦌','👹'],boss:'🦣',bn:'Mammoth King'},
 {n:'Haunted Marsh',ic:'🐸',c1:'#33463a',c2:'#3a5042',deco:['🍄','🕸️','🪦','🌫️'],mons:['🐸','🦟','👻','🧟'],boss:'🧌',bn:'Bog Troll'},
 {n:'Crystal Caverns',ic:'💎',c1:'#34295e',c2:'#3d3070',deco:['💎','🔮','🪨','✨'],mons:['🦇','🕷️','🗿','👾'],boss:'🐉',bn:'Gem Drake'},
 {n:'Volcano Forge',ic:'🌋',c1:'#5e2418',c2:'#6d2b1c',deco:['🔥','🪨','🌋','💥'],mons:['🔥','👹','🦖','😈'],boss:'🐲',bn:'Magma Dragon'},
 {n:'Sky Citadel',ic:'☁️',c1:'#4a6fb0',c2:'#547cc0',deco:['☁️','⭐','🪽','✨'],mons:['🦅','🤖','👼','🛸'],boss:'🦄',bn:'Storm Sovereign'},
 {n:'The Void',ic:'🌌',c1:'#120826',c2:'#1a0c36',deco:['⭐','🌑','✨','☄️'],mons:['👾','👁️','🕳️','💀'],boss:'😈',bn:'Void Overlord'}
];
const CLS={
 warrior:{n:'Warrior',hero:'⚔️',d:'Tough melee cleaver. Spin, shield up, go berserk.',w:['Sword','Axe','Greatblade','Claymore'],sk:['Whirlwind','Iron Skin','Berserk'],ic:['🌀','🛡️','💢']},
 mage:{n:'Mage',hero:'🧙',d:'Homing bolts, nova blasts, blink and meteor storms.',w:['Staff','Wand','Orb','Scepter'],sk:['Arcane Nova','Blink','Meteor Storm'],ic:['💫','✨','☄️']},
 ranger:{n:'Ranger',hero:'🧝',d:'Fast piercing arrows, volleys, rolls and rapid fire.',w:['Bow','Longbow','Crossbow','Warbow'],sk:['Volley','Roll','Rapid Fire'],ic:['🏹','💨','🔥']}
};
const SLOTS=['w','a','c'],SN={w:'Weapon',a:'Armor',c:'Charm'};
const RAR=[{n:'Common',c:'#b8b8c8',m:1,a:0,w:60},{n:'Uncommon',c:'#4be37a',m:1.25,a:1,w:25},{n:'Rare',c:'#4aa8ff',m:1.6,a:2,w:11},{n:'Epic',c:'#c25bff',m:2.1,a:3,w:3.5},{n:'Legendary',c:'#ffb02e',m:3,a:3,w:.5},{n:'Mythic',c:'#ff3d8b',m:4.5,a:4,w:0}];
const ABASE=['Tunic','Mail','Plate','Robe','Aegis'],CBASE=['Charm','Amulet','Ring','Talisman','Totem'];
const ADJ=[['Worn','Rusty','Plain'],['Sturdy','Fine','Keen'],['Gleaming','Runed','Blessed'],['Arcane','Savage','Royal'],['Ancient','Dragonforged','Celestial'],["Godslayer's",'Eternal','Neveltops']];
const AFF={crit:[.02,.06,'Crit chance'],aspd:[.04,.12,'Attack speed'],ms:[.03,.08,'Move speed'],ls:[.01,.03,'Lifesteal'],gold:[.1,.3,'Gold find']};
const UPG={pow:['⚔️ Power','+5% damage',40,200],vit:['❤️ Vitality','+5% max HP',40,200],haste:['⚡ Haste','+3% attack speed',60,60],gold:['💰 Fortune','+8% gold & better drops',60,200],regen:['💚 Regeneration','+0.3% HP per second',80,40]};
const SPT={pow:['💪 Might','+3% damage'],vit:['🫀 Endurance','+3% max HP'],crit:['🎯 Precision','+0.5% crit, +2% crit damage'],haste:['🌪️ Agility','+1.5% attack speed'],q:['','Skill Q power +12%'],e:['','Skill E power +12%'],r:['','Ultimate R power +12%']};
const ACH=[
 ['First Blood',p=>p.kills>=1],['Slayer (1,000 kills)',p=>p.kills>=1000],['Exterminator (25,000)',p=>p.kills>=25000],
 ['Boss Hunter',p=>p.best>=1],['Desert Walker',p=>p.best>=10],['Frost Giant',p=>p.best>=20],['Cave Delver',p=>p.best>=40],['Forge Master',p=>p.best>=50],['Void Walker',p=>p.best>=70],['Champion of Ideas',p=>p.cleared],
 ['Level 25',p=>p.L>=25],['Level 50',p=>p.L>=50],['Level 100',p=>p.L>=100],
 ['Legendary Find',p=>p.found[4]>0],['Mythic Find',p=>p.found[5]>0],['Reborn',p=>p.asc>0],['Dedicated (5h)',p=>p.time>=18000]
];

let armed='',P=null,ST=null,dirty=true,mode='title',paused=false,tab='',pl,en=[],ps=[],es=[],fx=[],tx=[],mets=[],toasts=[],kills=0,boss=null,spawnT=0,deadT=0,shake=0,saveT=0,achT=0,tick=0,ban=null,touch=null,touchUI=false;
const keys={};let cv,ctx,root,panel;

/* ---------- save / data ---------- */
function newSave(cls,name){return{v:1,cls,name:name||'Hero',L:1,xp:0,gold:0,pts:0,sp:{pow:0,vit:0,crit:0,haste:0,q:0,e:0,r:0},up:{pow:0,vit:0,haste:0,gold:0,regen:0},inv:[],eq:null,best:0,cur:0,shards:0,asc:0,kills:0,time:0,ach:{},found:[0,0,0,0,0,0],autoEq:true,autoSell:0,autoAdv:true,cleared:false,last:Date.now()}}
function startGear(){P.eq={w:makeItem('w',0,{rar:0}),a:makeItem('a',0,{rar:0}),c:makeItem('c',0,{rar:0})}}
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(!d||!d.cls)return null;const b=newSave(d.cls,d.name),o=Object.assign(b,d);o.sp=Object.assign(b.sp,d.sp);o.up=Object.assign(newSave().up,d.up);return o}catch(e){return null}}
function save(){if(!P)return;try{P.last=Date.now();localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}}

/* ---------- items ---------- */
function rollRar(boost,myth){const ws=RAR.map((r,i)=>i===5?myth*100:i>=2?r.w*boost:r.w),t=ws.reduce((a,b)=>a+b,0);let x=Math.random()*t;for(let i=0;i<ws.length;i++){x-=ws[i];if(x<=0)return i}return 0}
function makeItem(slot,ilvl,o={}){
 let rr=o.rar!==undefined?o.rar:rollRar(o.boost||1,o.myth||0);if(o.minR&&rr<o.minR)rr=o.minR;
 const r=RAR[rr],base=slot==='w'?pick(CLS[P.cls].w):slot==='a'?pick(ABASE):pick(CBASE),keys=Object.keys(AFF),aff={};
 for(let i=0;i<r.a;i++){const k=keys.splice(ri(0,keys.length-1),1)[0],[lo,hi]=AFF[k];aff[k]=+(rnd(lo,hi)*(1+rr*.15)).toFixed(3)}
 return{slot,rar:rr,ilvl,p:Math.max(1,Math.round(6*TT(ilvl)*r.m*(slot==='c'?.8:1)*rnd(.9,1.12))),name:`${pick(ADJ[rr])} ${base}`,aff};
}
const score=it=>it.p*(1+Object.values(it.aff).reduce((a,b)=>a+b,0)),value=it=>Math.ceil(it.p*1.2*(1+it.rar));
function addItem(it){
 P.found[it.rar]++;
 toast(`${it.rar>=3?'✨ ':''}${it.name} (${RAR[it.rar].n})`,RAR[it.rar].c);
 const cur=P.eq[it.slot];
 if(P.autoEq&&(!cur||score(it)>score(cur))){P.eq[it.slot]=it;dirty=true;it=cur}
 if(!it)return;
 if(it.rar<=P.autoSell){P.gold+=value(it);return}
 P.inv.push(it);
 if(P.inv.length>40){P.inv.sort((a,b)=>score(a)-score(b));P.gold+=value(P.inv.shift())}
}

/* ---------- stats ---------- */
function calcStats(){
 const L=P.L,s=P.sp,u=P.up,e=P.eq,A={crit:0,aspd:0,ms:0,ls:0,gold:0};
 SLOTS.forEach(k=>{const it=e[k];if(it)for(const a in it.aff)A[a]+=it.aff[a]});
 const sh=P.shards;
 ST={dmg:(6+e.w.p)*(1+.03*L)*(1+.03*s.pow)*(1+.05*u.pow)*(1+.1*sh),
  hp:(50+6*L+e.a.p*5+e.c.p*2)*(1+.03*s.vit)*(1+.05*u.vit)*(1+.05*sh),
  aspd:Math.min(6,1.4*(1+.015*s.haste)*(1+.03*u.haste)*(1+A.aspd)),crit:Math.min(.8,.05+.005*s.crit+A.crit),cd:1.8+.02*s.crit,
  ms:Math.min(320,190*(1+A.ms)),ls:Math.min(.15,A.ls),regen:.003*u.regen+.002,gold:(1+.08*u.gold+A.gold)*(1+.1*sh),drop:1+.02*u.gold};
 dirty=false;
}

/* ---------- run state ---------- */
function toast(s,c='#fff'){toasts.push({s,c,t:4});if(toasts.length>6)toasts.shift()}
function resetStage(){en=[];ps=[];es=[];mets=[];kills=0;boss=null;spawnT=1;const S=P.cur,z=ZONES[S/10|0];ban={t:3.2,s:`${z.ic} ${z.n} — Stage ${S%10+1}`}}
function startRun(){
 calcStats();pl={x:0,y:0,hp:ST.hp,sh:0,shT:0,inv:2,atk:0,cd:[0,0,0],cdm:[8,8,45],buff:null,met:0,metT:0,fx:1,fy:0,flash:0,r:14,moving:false};
 fx=[];tx=[];mode='play';resetStage();
 for(const k in keys)keys[k]=false;
}
function die(){mode='dead';deadT=3;kills=0;toast('You were defeated... stage progress reset','#ff3d8b');shake=14}
function respawn(){pl.hp=ST.hp;pl.sh=0;pl.inv=3;pl.x=0;pl.y=0;pl.buff=null;resetStage();mode='play'}
function addXp(x){
 if(P.L>=100)return;P.xp+=x;
 while(P.L<100&&P.xp>=need(P.L)){P.xp-=need(P.L);P.L++;P.pts++;calcStats();pl.hp=ST.hp;toast(`⭐ LEVEL UP! Level ${P.L} (+1 skill point)`,'#ffd75e');burst(pl.x,pl.y,'#ffd75e',30);txt(pl.x,pl.y-40,'LEVEL UP!','#ffd75e',22)}
 if(P.L>=100)P.xp=0;
}

/* ---------- combat helpers ---------- */
function txt(x,y,s,c='#fff',sz=16){tx.push({x,y,s,c,sz,l:.9});if(tx.length>70)tx.shift()}
function burst(x,y,c,n=10){for(let i=0;i<n;i++){const a=rnd(0,6.283),v=rnd(40,220);fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.3,.8),c,s:rnd(2,4)})}if(fx.length>400)fx.splice(0,100)}
function ring(x,y,r,c){fx.push({ring:1,x,y,r:10,max:r,l:.4,c})}
function dmgNow(){return ST.dmg*(pl.buff?pl.buff.dm:1)}
function hit(e,d,noCrit){
 let c=false;if(!noCrit&&Math.random()<ST.crit){d*=ST.cd;c=true}
 e.hp-=d;e.flash=.1;txt(e.x+rnd(-8,8),e.y-e.r,fmt(d),c?'#ffd75e':'#fff',c?20:15);
 if(ST.ls>0)pl.hp=Math.min(ST.hp,pl.hp+d*ST.ls*.2);
 if(e.hp<=0)kill(e);
}
function aoe(x,y,r,d,col,knock){for(const e of en.slice()){const dx=e.x-x,dy=e.y-y,dd=Math.hypot(dx,dy);if(dd<r+e.r){hit(e,d);if(knock&&!e.boss&&dd>0){e.x+=dx/dd*30;e.y+=dy/dd*30}}}ring(x,y,r,col);burst(x,y,col,14)}
function kill(e){
 const i=en.indexOf(e);if(i<0)return;en.splice(i,1);burst(e.x,e.y,e.boss?'#ff3d8b':e.elite?'#ffd75e':'#ddd',e.boss?50:10);
 const S=P.cur,t=TT(S);
 if(e.boss)return bossDown(e);
 const g=Math.ceil(2.5*t*ST.gold*(e.elite?3:1));P.gold+=g;if(e.elite)txt(e.x,e.y-20,'+'+fmt(g),'#ffd75e',14);
 addXp(6*t*(1+.02*P.shards)*(e.elite?3:1));
 if(Math.random()<(e.elite?.35:.04)*ST.drop)addItem(makeItem(pick(SLOTS),S+(e.elite?1:0),{boost:e.elite?2:1}));
 if(e.count){kills++;P.kills++}
}
function bossDown(e){
 const S=P.cur,fin=S%10===9,t=TT(S);shake=16;
 P.gold+=Math.ceil(80*t*ST.gold*(fin?3:1));addXp(60*t*(fin?3:1));
 for(let i=0;i<(fin?3:2);i++)addItem(makeItem(pick(SLOTS),S+1,{boost:4,minR:1,myth:fin?.15:.04}));
 P.pts+=fin?2:0;if(fin)toast('👑 Zone conquered! +2 skill points','#ffd75e');
 toast(`🏆 Stage ${S+1} cleared!`,'#5dff9a');
 if(S===P.best&&P.best<MAXS)P.best++;
 if(S===MAXS&&!P.cleared){P.cleared=true;toast('🎉 You beat the Void Overlord! The realm is saved!','#ffd75e')}
 if(P.autoAdv&&P.cur<MAXS&&P.cur+1<=P.best)P.cur++;
 boss=null;kills=0;save();setTimeout(()=>{if(mode==='play')resetStage()},1800);spawnT=99;
}
function spawnEnemy(o={}){
 const S=P.cur,z=ZONES[S/10|0],a=rnd(0,6.283),d=o.near?rnd(60,120):rnd(520,640);
 const e={x:(o.x??pl.x)+Math.cos(a)*d,y:(o.y??pl.y)+Math.sin(a)*d,flash:0,atk:rnd(0,1),shot:rnd(1,3),count:true};
 if(o.boss){const fin=S%10===9;Object.assign(e,{boss:true,count:false,e:z.boss,max:18*TT(S)*(fin?32:14),r:fin?46:34,dmg:2.6*TT(S),spd:75,bcd:2,scd:6,name:(fin?'👑 ':'')+z.bn});e.hp=e.max}
 else{const ei=ri(0,3),el=Math.random()<.05&&!o.add;Object.assign(e,{e:z.mons[ei],ranged:ei>=2&&Math.random()<.6,elite:el,r:el?24:16,max:18*TT(S)*(el?4:1)*(ei===3?1.3:1),dmg:2*TT(S)*(el?1.4:1),spd:(60+rnd(0,28)+(S/10|0)*4)*(el?.85:1),count:!o.add});e.hp=e.max}
 en.push(e);return e;
}
function hurt(d){
 if(pl.inv>0||mode!=='play')return;
 if(pl.sh>0){const a=Math.min(pl.sh,d);pl.sh-=a;d-=a}
 pl.inv=.25;pl.flash=.15;if(d>0){pl.hp-=d;txt(pl.x,pl.y-26,'-'+fmt(d),'#ff3d8b',16);shake=Math.max(shake,5)}
 if(pl.hp<=0){pl.hp=0;die()}
}
function shoot(a,o){ps.push(Object.assign({x:pl.x,y:pl.y,vx:Math.cos(a)*o.spd,vy:Math.sin(a)*o.spd,h:[]},o))}
function nearest(range){let t=null,b=range*range;for(const e of en){const d=(e.x-pl.x)**2+(e.y-pl.y)**2;if(d<b){b=d;t=e}}return t}
function attack(){
 const c=P.cls,t=nearest(c==='warrior'?125:c==='mage'?430:480);if(!t)return false;
 const a=Math.atan2(t.y-pl.y,t.x-pl.x),d=dmgNow();
 if(c==='warrior'){
  for(const e of en.slice()){const dx=e.x-pl.x,dy=e.y-pl.y,dd=Math.hypot(dx,dy);if(dd<115+e.r){let da=Math.abs(Math.atan2(dy,dx)-a);if(da>Math.PI)da=6.283-da;if(da<1.3)hit(e,d)}}
  fx.push({arc:1,x:pl.x,y:pl.y,a,l:.18,c:'#fff'});
 }else if(c==='mage')shoot(a,{dmg:d,spd:540,life:1.3,r:11,pierce:0,col:'#9f8bff',splash:55,tg:t});
 else{const n=1+(P.L>=25)+(P.L>=60);for(let i=0;i<n;i++)shoot(a+(i-(n-1)/2)*.16,{dmg:d*1.3*(n>1?.8:1),spd:760,life:.8,r:8,pierce:2,col:'#fff'})}
 return true;
}
function cast(i){
 if(mode!=='play'||paused||pl.cd[i]>0)return;
 const c=P.cls,lv=[P.sp.q,P.sp.e,P.sp.r][i],m=1+.12*lv,d=ST.dmg;
 if(i===0){
  if(c==='warrior'){aoe(pl.x,pl.y,150+lv*2,d*3*m,'#ffb02e',true);pl.cdm[0]=8}
  else if(c==='mage'){aoe(pl.x,pl.y,230+lv*2,d*4*m,'#7c5cff',true);pl.cdm[0]=9}
  else{for(let k=0;k<12;k++)shoot(k/12*6.283,{dmg:d*2*m,spd:620,life:.9,r:9,pierce:3,col:'#fff'});pl.cdm[0]=8}
 }else if(i===1){
  if(c==='warrior'){pl.sh=ST.hp*(.35+.02*lv);pl.shT=6;pl.cdm[1]=14;ring(pl.x,pl.y,60,'#4aa8ff')}
  else{const dist=c==='mage'?210:180;ring(pl.x,pl.y,40,'#00e5ff');pl.x+=pl.fx*dist;pl.y+=pl.fy*dist;pl.inv=Math.max(pl.inv,.6);pl.cdm[1]=c==='mage'?5:4.5;burst(pl.x,pl.y,'#00e5ff',16)}
 }else{
  if(c==='mage'){pl.met=5;pl.metT=0;pl.cdm[2]=50}
  else{pl.buff={t:8+.2*lv,dm:c==='warrior'?1.8:1,am:c==='warrior'?1.4:2.5};pl.cdm[2]=c==='warrior'?45:40}
  ring(pl.x,pl.y,100,'#ff3d8b');
 }
 pl.cd[i]=pl.cdm[i];
}

/* ---------- main update ---------- */
function step(dt){
 tick+=dt;if(mode==='title'||paused)return;
 P.time+=dt;
 for(const t of toasts)t.t-=dt;toasts=toasts.filter(t=>t.t>0);if(ban){ban.t-=dt;if(ban.t<=0)ban=null}
 shake=Math.max(0,shake-dt*30);
 fx.forEach(f=>{f.l-=dt;if(!f.ring&&!f.arc){f.x+=f.vx*dt;f.y+=f.vy*dt}else if(f.ring)f.r+=(f.max-f.r)*Math.min(1,dt*10)});fx=fx.filter(f=>f.l>0);
 tx.forEach(t=>{t.l-=dt;t.y-=40*dt});tx=tx.filter(t=>t.l>0);
 if(mode==='dead'){deadT-=dt;if(deadT<=0)respawn();return}
 if(dirty){const r=pl.hp/ST.hp;calcStats();pl.hp=Math.min(ST.hp,Math.max(1,r*ST.hp))}
 saveT+=dt;if(saveT>10){saveT=0;save()}
 achT+=dt;if(achT>1){achT=0;ACH.forEach(([n,f],i)=>{if(!P.ach[i]&&f(P)){P.ach[i]=1;P.pts++;toast(`🏅 Achievement: ${n} (+1 point)`,'#ffd75e')}})}
 // movement
 let mx=0,my=0;if(keys.a||keys.arrowleft)mx--;if(keys.d||keys.arrowright)mx++;if(keys.w||keys.arrowup)my--;if(keys.s||keys.arrowdown)my++;
 if(touch&&touch.stick){mx=touch.dx;my=touch.dy}
 const ml=Math.hypot(mx,my);pl.moving=ml>.1;
 if(pl.moving){mx/=Math.max(1,ml);my/=Math.max(1,ml);pl.x+=mx*ST.ms*dt;pl.y+=my*ST.ms*dt;const l=Math.hypot(mx,my)||1;pl.fx=mx/l;pl.fy=my/l}
 pl.inv-=dt;pl.flash-=dt;for(let i=0;i<3;i++)pl.cd[i]=Math.max(0,pl.cd[i]-dt);
 if(pl.shT>0){pl.shT-=dt;if(pl.shT<=0)pl.sh=0}
 if(pl.buff){pl.buff.t-=dt;if(pl.buff.t<=0)pl.buff=null}
 pl.hp=Math.min(ST.hp,pl.hp+ST.hp*ST.regen*dt);
 pl.atk-=dt;if(pl.atk<=0&&attack())pl.atk=1/(ST.aspd*(pl.buff?pl.buff.am:1));
 if(pl.met>0){pl.met-=dt;pl.metT-=dt;if(pl.metT<=0){pl.metT=.28;const t=en.length?pick(en):null;mets.push({x:t?t.x:pl.x+rnd(-200,200),y:t?t.y:pl.y+rnd(-200,200),t:.55,d:ST.dmg*5*(1+.12*P.sp.r)})}}
 for(const m of mets)m.t-=dt;
 for(const m of mets.filter(m=>m.t<=0))aoe(m.x,m.y,95,m.d,'#ff9f3d');mets=mets.filter(m=>m.t>0);
 // spawning
 const need_=reqKills(P.cur);
 if(!boss){
  if(kills>=need_){boss=spawnEnemy({boss:true});toast('⚠ BOSS: '+boss.name,'#ff3d8b');shake=10;ban={t:2.5,s:'⚠ '+boss.name+' ⚠'}}
  else{spawnT-=dt;const cap=12+Math.min(14,(P.cur/10|0)*2+((P.cur%10)>>1));
   if(spawnT<=0&&en.filter(e=>e.count).length<cap&&kills+en.filter(e=>e.count).length<need_){spawnT=.3;spawnEnemy()}}
 }
 // enemies
 for(const e of en){
  e.flash-=dt;e.atk-=dt;const dx=pl.x-e.x,dy=pl.y-e.y,d=Math.hypot(dx,dy)||1;
  const keep=e.ranged?260:0;
  if(d>keep){e.x+=dx/d*e.spd*dt;e.y+=dy/d*e.spd*dt}else if(e.ranged&&d<keep-60){e.x-=dx/d*e.spd*.5*dt;e.y-=dy/d*e.spd*.5*dt}
  if(d>1400){e.x=pl.x-dx*.9;e.y=pl.y-dy*.9}
  if(d<e.r+pl.r&&e.atk<=0){e.atk=1;hurt(e.dmg)}
  if(e.ranged){e.shot-=dt;if(e.shot<=0&&d<400){e.shot=2.2;es.push({x:e.x,y:e.y,vx:dx/d*210,vy:dy/d*210,dmg:e.dmg*.7,r:8,l:3,c:'#ff6b6b'})}}
  if(e.boss){
   e.bcd-=dt;e.scd-=dt;const ph=e.hp<e.max*.5;
   if(e.bcd<=0){e.bcd=ph?1.6:2.6;const n=10+(P.cur/10|0)*2,o=rnd(0,6.28);for(let k=0;k<n;k++){const a=o+k/n*6.283;es.push({x:e.x,y:e.y,vx:Math.cos(a)*170,vy:Math.sin(a)*170,dmg:e.dmg*.6,r:9,l:4,c:'#ff3d8b'})}}
   if(e.scd<=0){e.scd=ph?6:9;for(let k=0;k<3;k++)spawnEnemy({add:true,near:1,x:e.x,y:e.y})}
  }
 }
 for(let i=0;i<en.length;i++)for(let j=i+1;j<en.length;j++){const a=en[i],b=en[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=(a.r+b.r)*.7;if(d>0&&d<m){const p=(m-d)/2/d;a.x-=dx*p;a.y-=dy*p;b.x+=dx*p;b.y+=dy*p}}
 // player shots
 for(const p of ps){
  if(p.tg&&en.includes(p.tg)){const a=Math.atan2(p.tg.y-p.y,p.tg.x-p.x),c=Math.atan2(p.vy,p.vx);let da=a-c;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const n=c+clamp(da,-6*dt,6*dt);p.vx=Math.cos(n)*p.spd;p.vy=Math.sin(n)*p.spd}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;
  for(const e of en){if(p.dead)break;if(p.h.includes(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+p.r){p.h.push(e);hit(e,p.dmg);
   if(p.splash){for(const o of en.slice())if(o!==e&&Math.hypot(o.x-p.x,o.y-p.y)<p.splash)hit(o,p.dmg*.5,true);ring(p.x,p.y,p.splash,p.col)}
   burst(p.x,p.y,p.col,5);if(--p.pierce<0)p.dead=true}}
 }
 ps=ps.filter(p=>p.l>0&&!p.dead);
 for(const s of es){s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt;if(Math.hypot(s.x-pl.x,s.y-pl.y)<s.r+pl.r){s.l=0;hurt(s.dmg)}}
 es=es.filter(s=>s.l>0);
}

/* ---------- drawing ---------- */
function T(s,x,y,sz=16,c='#fff',al='center',bold){ctx.font=`${bold?'700 ':''}${sz}px "Space Grotesk",sans-serif`;ctx.textAlign=al;ctx.textBaseline='middle';ctx.fillStyle=c;ctx.fillText(s,x,y)}
function bar(x,y,w,h,v,c,bg='rgba(0,0,0,.6)'){ctx.fillStyle=bg;ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,w*clamp(v,0,1),h);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.strokeRect(x,y,w,h)}
function draw(){
 if(!P||mode==='title'){ctx.fillStyle='#07060f';ctx.fillRect(0,0,W,H);return}
 const z=ZONES[P.cur/10|0],sx=shake?rnd(-shake,shake)*.4:0,sy=shake?rnd(-shake,shake)*.4:0,cx=pl.x-W/2+sx,cy=pl.y-H/2+sy,TS=96;
 for(let ty=Math.floor(cy/TS);ty<=Math.floor((cy+H)/TS);ty++)for(let tx_=Math.floor(cx/TS);tx_<=Math.floor((cx+W)/TS);tx_++){
  ctx.fillStyle=(tx_+ty)&1?z.c1:z.c2;ctx.fillRect(tx_*TS-cx,ty*TS-cy,TS+1,TS+1);
  if(hs(tx_,ty)<.08)T(z.deco[Math.floor(hs(ty,tx_)*4)],tx_*TS-cx+TS*hs(tx_+1,ty),ty*TS-cy+TS*hs(tx_,ty+1),26);
 }
 const X=x=>x-cx,Y=y=>y-cy;
 for(const m of mets){ctx.strokeStyle='rgba(255,159,61,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(m.x),Y(m.y),95*(1-m.t/.55),0,7);ctx.stroke();T('☄️',X(m.x),Y(m.y)-m.t*400,26)}
 const all=en.slice().sort((a,b)=>a.y-b.y);
 for(const e of all){
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(X(e.x),Y(e.y)+e.r*.8,e.r*.9,e.r*.35,0,0,7);ctx.fill();
  if(e.elite||e.boss){ctx.strokeStyle=e.boss?'rgba(255,61,139,.8)':'rgba(255,215,94,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(e.x),Y(e.y),e.r+4+Math.sin(tick*6)*2,0,7);ctx.stroke()}
  T(e.e,X(e.x),Y(e.y),e.r*2);
  if(e.flash>0){ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(X(e.x),Y(e.y),e.r*.8,0,7);ctx.fill()}
  if(!e.boss&&e.hp<e.max)bar(X(e.x)-e.r,Y(e.y)-e.r-8,e.r*2,4,e.hp/e.max,e.elite?'#ffd75e':'#ff3d8b');
 }
 for(const s of es){ctx.fillStyle=s.c;ctx.shadowColor=s.c;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(X(s.x),Y(s.y),s.r,0,7);ctx.fill();ctx.shadowBlur=0}
 for(const p of ps){ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(X(p.x),Y(p.y),p.r*.7,0,7);ctx.fill();ctx.shadowBlur=0}
 // player
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X(pl.x),Y(pl.y)+14,14,5,0,0,7);ctx.fill();
 if(pl.buff){ctx.strokeStyle='rgba(255,61,139,.7)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(pl.x),Y(pl.y),26+Math.sin(tick*10)*2,0,7);ctx.stroke()}
 if(pl.sh>0){ctx.strokeStyle='rgba(74,168,255,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(X(pl.x),Y(pl.y),24,0,7);ctx.stroke()}
 if(pl.inv<=0||Math.floor(tick*16)%2)T(CLS[P.cls].hero,X(pl.x),Y(pl.y)+(pl.moving?Math.sin(tick*18)*2:0),34);
 if(pl.flash>0){ctx.fillStyle='rgba(255,60,90,.5)';ctx.beginPath();ctx.arc(X(pl.x),Y(pl.y),16,0,7);ctx.fill()}
 for(const f of fx){
  if(f.ring){ctx.strokeStyle=f.c;ctx.globalAlpha=clamp(f.l*3,0,1);ctx.lineWidth=4;ctx.beginPath();ctx.arc(X(f.x),Y(f.y),f.r,0,7);ctx.stroke();ctx.globalAlpha=1}
  else if(f.arc){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(X(pl.x),Y(pl.y),70,f.a-1.1,f.a+1.1);ctx.stroke()}
  else{ctx.globalAlpha=clamp(f.l*2,0,1);ctx.fillStyle=f.c;ctx.fillRect(X(f.x),Y(f.y),f.s,f.s);ctx.globalAlpha=1}
 }
 for(const t of tx){ctx.globalAlpha=clamp(t.l*2,0,1);T(t.s,X(t.x),Y(t.y),t.sz,t.c,'center',1);ctx.globalAlpha=1}
 if(P.cur%10>=0&&mode==='play'){const dk=ctx.createRadialGradient(W/2,H/2,250,W/2,H/2,620);dk.addColorStop(0,'transparent');dk.addColorStop(1,'rgba(0,0,0,.5)');ctx.fillStyle=dk;ctx.fillRect(0,0,W,H)}
 hud();
}
function hud(){
 // top-left
 ctx.fillStyle='rgba(8,6,20,.65)';ctx.fillRect(10,10,250,64);
 T(`${CLS[P.cls].hero} ${P.name}  Lv ${P.L}`,18,24,15,'#fff','left',1);
 bar(18,38,234,9,P.L>=100?1:P.xp/need(P.L),'#ffd75e');T(`💰 ${fmt(P.gold)}`,18,60,14,'#ffd75e','left');T(`✦ ${P.pts} pts`,150,60,13,'#00e5ff','left');
 // kills / boss bar
 const S=P.cur,rk=reqKills(S);
 ctx.fillStyle='rgba(8,6,20,.65)';ctx.fillRect(W/2-190,10,380,boss?58:40);
 T(`${ZONES[S/10|0].ic} Stage ${S+1}/80`,W/2,22,14,'#fff','center',1);
 if(boss){bar(W/2-176,36,352,14,boss.hp/boss.max,'#ff3d8b');T(boss.name,W/2,43,11,'#fff','center',1)}else bar(W/2-176,32,352,8,kills/rk,'#00e5ff');
 if(!boss)T(`${kills}/${rk} kills`,W/2,50,10,'#9a97c0','center');
 // hp
 bar(10,H-34,300,22,pl.hp/ST.hp,'#e0394a');if(pl.sh>0)bar(10,H-34,300,22,pl.sh/ST.hp,'rgba(74,168,255,.8)','transparent');
 T(`❤ ${fmt(pl.hp)} / ${fmt(ST.hp)}`,160,H-23,13,'#fff','center',1);
 // skills
 for(let i=0;i<3;i++){
  const x=W/2-100+i*70,y=H-72;ctx.fillStyle='rgba(8,6,20,.75)';ctx.fillRect(x,y,60,60);ctx.strokeStyle=pl.cd[i]>0?'#555':'#00e5ff';ctx.lineWidth=2;ctx.strokeRect(x,y,60,60);
  T(CLS[P.cls].ic[i],x+30,y+27,28);T('QER'[i],x+8,y+10,12,'#9a97c0','left',1);
  if(pl.cd[i]>0){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(x,y,60,60*pl.cd[i]/pl.cdm[i]);T(pl.cd[i].toFixed(1),x+30,y+30,16,'#fff','center',1)}
 }
 // toasts
 toasts.forEach((t,i)=>{ctx.globalAlpha=clamp(t.t,0,1);T(t.s,W-14,28+i*22,14,t.c,'right',1);ctx.globalAlpha=1});
 if(ban){ctx.globalAlpha=clamp(ban.t,0,1);T(ban.s,W/2,H/2-120,34,'#fff','center',1);ctx.globalAlpha=1}
 if(mode==='dead'){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);T('DEFEATED',W/2,H/2-10,56,'#ff3d8b','center',1);T('Respawning...',W/2,H/2+40,18)}
 if(touchUI){
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(130,H-130,60,0,7);ctx.fill();
  if(touch&&touch.stick){ctx.fillStyle='rgba(0,229,255,.4)';ctx.beginPath();ctx.arc(touch.ox+touch.dx*40,touch.oy+touch.dy*40,28,0,7);ctx.fill()}
  for(let i=0;i<3;i++){ctx.fillStyle='rgba(124,92,255,.35)';ctx.beginPath();ctx.arc(W-70-i*80,H-90-(i===1?30:0),32,0,7);ctx.fill();T(CLS[P.cls].ic[2-i],W-70-i*80,H-90-(i===1?30:0),26)}
 }
}

/* ---------- UI (DOM) ---------- */
const CSS=`.bq{position:fixed;inset:0;z-index:300;background:#05040c;display:none;flex-direction:column;align-items:center;cursor:default;color:#eceaff;font-family:'Space Grotesk',sans-serif}
.bq.on{display:flex}body.bqopen{overflow:hidden;cursor:auto}body.bqopen .cur,body.bqopen .cur2{display:none}
.bqbar{width:100%;display:flex;gap:8px;align-items:center;padding:8px 12px;background:#0d0a22;border-bottom:1px solid rgba(255,255,255,.12);flex-wrap:wrap}
.bqbar b{font-family:Syne,sans-serif;margin-right:auto;font-size:1.05rem}
.bqbar button,.bqp button,.bqt button{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);color:#eceaff;border-radius:10px;padding:7px 12px;font:inherit;cursor:pointer}
.bqbar button:hover,.bqp button:hover:not(:disabled){border-color:#00e5ff}
.bqbar button.on{background:linear-gradient(120deg,#7c5cff,#ff3d8b);border-color:transparent}
.bqs{position:relative;flex:1;display:flex;align-items:center;justify-content:center;width:100%;min-height:0}
.bqw{position:relative;width:min(100vw,calc((100vh - 52px)*16/9));aspect-ratio:16/9}
#bqc{width:100%;height:100%;display:block;touch-action:none;background:#000}
.bqp,.bqt{position:absolute;inset:0;overflow:auto;background:rgba(7,5,20,.94);padding:18px 22px;font-size:clamp(11px,1.5vw,15px)}
.bqt{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;background:radial-gradient(circle at 50% 30%,#2a1a66,#05040c 70%)}
.bqt h1{font-family:Syne,sans-serif;font-size:clamp(1.6rem,6vw,4rem);background:linear-gradient(90deg,#00e5ff,#7c5cff,#ff3d8b);-webkit-background-clip:text;color:transparent;letter-spacing:-1px}
.cc{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.cc .c{width:190px;padding:14px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);cursor:pointer;transition:.2s}
.cc .c:hover,.cc .c.on{border-color:#00e5ff;transform:translateY(-4px);box-shadow:0 0 24px rgba(0,229,255,.3)}
.cc .c big{font-size:2.6rem;display:block}.cc .c small{color:#9a97c0}
.bqt input{padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);color:#fff;font:inherit;text-align:center}
.bqp h3{font-family:Syne,sans-serif;font-size:1.3em;margin-bottom:10px}.bqp h3 small{font-family:'Space Grotesk';font-weight:400;font-size:.65em;color:#9a97c0;margin-left:8px}
.zg{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.zc{padding:10px;border-radius:12px;border:1px solid var(--c);background:rgba(255,255,255,.04)}
.sg{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:8px}
.sb{padding:6px 0!important;text-align:center}.sb.on{background:linear-gradient(120deg,#7c5cff,#ff3d8b)!important}.sb:disabled{opacity:.35;cursor:not-allowed}
.ig{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:8px 0 14px}
.it{padding:8px;border-radius:10px;border:2px solid;background:rgba(255,255,255,.04);font-size:.9em;display:flex;flex-direction:column;gap:2px}
.it small{color:#9a97c0}.it .ab{display:flex;gap:4px;margin-top:4px}.it .ab button{padding:3px 8px;font-size:.85em}
.row{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:5px 0;border-radius:10px;background:rgba(255,255,255,.05)}
.row .n{flex:1}.row small{color:#9a97c0;display:block}
.sts{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px;margin-bottom:12px}
.sts div{background:rgba(255,255,255,.05);border-radius:8px;padding:6px 10px}
.ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px}.ag div{padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.04);opacity:.45}.ag div.y{opacity:1;background:rgba(255,215,94,.15)}
.tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}`;

function setTab(t){
 if(t===tab||!t){tab='';panel.style.display='none';paused=false;save()}else{tab=t;paused=mode!=='title';panel.style.display='block';renderPanel()}
 root.querySelectorAll('.bqbar [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
}
const itemHTML=(it,btns)=>{const r=RAR[it.rar],ab=Object.keys(it.aff).map(k=>`<small>+${(it.aff[k]*100).toFixed(1)}% ${AFF[k][2]}</small>`).join('');return`<div class="it" style="border-color:${r.c}"><b style="color:${r.c}">${it.name}</b><small>${r.n} · ilvl ${it.ilvl}</small><span>${SN[it.slot]} power <b>${fmt(it.p)}</b></span>${ab}${btns||''}</div>`};
function renderPanel(){
 if(!P)return;let h='';
 if(tab==='map'){
  h=`<h3>🗺️ World Map <small>Furthest stage: ${P.best+1}/80 · Now: Stage ${P.cur+1} · Replay earlier stages to farm</small></h3><div class="zg">`;
  ZONES.forEach((z,zi)=>{h+=`<div class="zc" style="--c:${z.c2}"><b>${z.ic} ${z.n}</b><div class="sg">`;for(let s=0;s<10;s++){const S=zi*10+s,lk=S>P.best;h+=`<button class="sb ${S===P.cur?'on':''}" ${lk?'disabled':''} data-a="stage" data-i="${S}">${lk?'🔒':s===9?'👑':s+1}</button>`}h+='</div></div>'});h+='</div>';
 }else if(tab==='gear'){
  h=`<h3>🎒 Gear <small>Item power scales with the stage it drops in</small></h3><div class="tools"><button data-a="autoeq">Auto-equip upgrades: ${P.autoEq?'ON':'OFF'}</button><button data-a="autosell">Auto-sell up to: ${P.autoSell<0?'nothing':RAR[P.autoSell].n}</button><button data-a="sellall">Sell all Common/Uncommon in bag</button></div><b>Equipped</b><div class="ig">`;
  SLOTS.forEach(k=>h+=itemHTML(P.eq[k]));h+=`</div><b>Bag (${P.inv.length}/40)</b><div class="ig">`;
  P.inv.sort((a,b)=>score(b)-score(a));
  P.inv.forEach((it,i)=>h+=itemHTML(it,`<div class="ab"><button data-a="equip" data-i="${i}">Equip</button><button data-a="sell" data-i="${i}">Sell 💰${fmt(value(it))}</button></div>`));
  if(!P.inv.length)h+='<small>Bag is empty. Kill monsters to find loot!</small>';h+='</div>';
 }else if(tab==='skills'){
  h=`<h3>⭐ Skills & Talents <small>Points: ${P.pts} (1 per level, +2 per zone boss, +1 per achievement)</small></h3><div class="tools"><button data-a="respec">Reset all points (free)</button></div>`;
  for(const k in SPT){const nm=k==='q'||k==='e'||k==='r'?`${CLS[P.cls].ic['qer'.indexOf(k)]} ${CLS[P.cls].sk['qer'.indexOf(k)]} (${k.toUpperCase()})`:SPT[k][0];
   h+=`<div class="row"><div class="n"><b>${nm}</b> Lv ${P.sp[k]}<small>${SPT[k][1]}</small></div><button data-a="sp" data-k="${k}" data-n="1" ${P.pts<1?'disabled':''}>+1</button><button data-a="sp" data-k="${k}" data-n="5" ${P.pts<5?'disabled':''}>+5</button></div>`}
 }else if(tab==='shop'){
  h=`<h3>🛒 Upgrade Shop <small>💰 ${fmt(P.gold)}</small></h3>`;
  for(const k in UPG){const [nm,ds,b,cap]=UPG[k],n=P.up[k],cost=Math.ceil(b*Math.pow(1.3,n));
   h+=`<div class="row"><div class="n"><b>${nm}</b> Lv ${n}/${cap}<small>${ds}</small></div><button data-a="buy" data-k="${k}" data-n="1" ${n>=cap||P.gold<cost?'disabled':''}>Buy 💰${fmt(cost)}</button><button data-a="buy" data-k="${k}" data-n="max" ${n>=cap||P.gold<cost?'disabled':''}>Max</button></div>`}
 }else if(tab==='hero'){
  const gain=Math.max(0,Math.floor((P.best-24)*.5)),m=Math.floor(P.time/60);
  h=`<h3>🦸 ${P.name} the ${CLS[P.cls].n} <small>Played ${Math.floor(m/60)}h ${m%60}m · ${P.kills.toLocaleString()} kills · Ascensions ${P.asc} · Shards ${P.shards}</small></h3><div class="sts"><div>⚔ Damage <b>${fmt(ST.dmg)}</b></div><div>❤ Health <b>${fmt(ST.hp)}</b></div><div>⚡ Attack speed <b>${ST.aspd.toFixed(2)}/s</b></div><div>🎯 Crit <b>${(ST.crit*100).toFixed(1)}% (x${ST.cd.toFixed(2)})</b></div><div>👟 Speed <b>${Math.round(ST.ms)}</b></div><div>🩸 Lifesteal <b>${(ST.ls*100).toFixed(1)}%</b></div><div>💰 Gold bonus <b>x${ST.gold.toFixed(2)}</b></div></div>
  <div class="tools"><button data-a="autoadv">Auto-advance after boss: ${P.autoAdv?'ON':'OFF'}</button><button data-a="ascend" ${gain<1?'disabled':''}>${armed==='ascend'?'⚠ Click again to ascend (resets level, gear, gold)':'🔱 Ascend (+'+gain+' shards)'}</button><button data-a="wipe">${armed==='wipe'?'⚠ Click again to delete save':'Delete save'}</button></div>
  <small>Ascension resets your hero but gives permanent shards: each is +10% damage & gold, +5% HP, +2% XP. Unlocks after stage 27.</small><h3 style="margin-top:14px">🏅 Achievements</h3><div class="ag">${ACH.map((a,i)=>`<div class="${P.ach[i]?'y':''}">${P.ach[i]?'✅':'⬜'} ${a[0]}</div>`).join('')}</div>`;
 }
 panel.innerHTML=h;panel.classList.add('bqp');
}
const armTwice=id=>{if(armed===id){armed='';return true}armed=id;setTimeout(()=>{if(armed===id){armed='';if(tab==='hero')renderPanel()}},5000);return false};
function act(d){
 const a=d.a;
 if(a==='stage'){P.cur=+d.i;setTab('');resetStage()}
 else if(a==='autoeq')P.autoEq=!P.autoEq;
 else if(a==='autosell'){P.autoSell=P.autoSell>=2?-1:P.autoSell+1}
 else if(a==='sellall'){P.inv=P.inv.filter(it=>{if(it.rar<=1){P.gold+=value(it);return false}return true})}
 else if(a==='equip'){const it=P.inv[+d.i],old=P.eq[it.slot];P.eq[it.slot]=it;P.inv.splice(+d.i,1);if(old)P.inv.push(old);dirty=true}
 else if(a==='sell'){P.gold+=value(P.inv[+d.i]);P.inv.splice(+d.i,1)}
 else if(a==='sp'){const n=Math.min(+d.n,P.pts);P.sp[d.k]+=n;P.pts-=n;dirty=true}
 else if(a==='respec'){let t=0;for(const k in P.sp){t+=P.sp[k];P.sp[k]=0}P.pts+=t;dirty=true}
 else if(a==='buy'){const [,,b,cap]=UPG[d.k];let c=1;do{const cost=Math.ceil(b*Math.pow(1.3,P.up[d.k]));if(P.up[d.k]>=cap||P.gold<cost)break;P.gold-=cost;P.up[d.k]++;dirty=true}while(d.n==='max'&&c++<500)}
 else if(a==='autoadv')P.autoAdv=!P.autoAdv;
 else if(a==='ascend'){const gain=Math.max(0,Math.floor((P.best-24)*.5));if(gain<1)return;if(!armTwice('ascend'))return renderPanel();
  const k={shards:P.shards+gain,asc:P.asc+1,kills:P.kills,time:P.time,ach:P.ach,found:P.found,autoEq:P.autoEq,autoSell:P.autoSell,autoAdv:P.autoAdv,cleared:P.cleared};
  P=Object.assign(newSave(P.cls,P.name),k);startGear();dirty=true;calcStats();save();startRun();setTab('');return}
 else if(a==='wipe'){if(!armTwice('wipe'))return renderPanel();try{localStorage.removeItem(KEY)}catch(e){}P=null;setTab('');showTitle();return}
 renderPanel();
}
function showTitle(){
 mode='title';paused=false;panel.style.display='none';tab='';
 const old=load(),box=document.getElementById('bqt');box.style.display='flex';
 const pickHTML=`<div class="cc">${Object.entries(CLS).map(([k,c])=>`<div class="c" data-cls="${k}"><big>${c.hero}</big><b>${c.n}</b><br><small>${c.d}</small></div>`).join('')}</div><input id="bqname" maxlength="14" placeholder="Hero name"><small>Pick a class to begin</small>`;
 box.innerHTML=`<h1>REALM OF IDEAS</h1><div style="color:#9a97c0;max-width:560px">An epic action RPG: 8 zones · 80 stages · endless loot · skill trees · ascension. Built for 10+ hours of play. Progress autosaves in your browser.</div>`+(old?`<button class="btn" id="bqcont" style="padding:12px 28px;font-size:1.05rem">▶ Continue — ${CLS[old.cls].hero} ${old.name} Lv ${old.L}, Stage ${old.best+1}</button><button id="bqnew">New Game</button><div id="bqpick" style="display:none">${pickHTML}</div>`:`<div id="bqpick">${pickHTML}</div>`);
 const pk=document.getElementById('bqpick');
 const go=cls=>{P=newSave(cls,(document.getElementById('bqname').value||'Hero').trim());startGear();finishStart()};
 box.querySelectorAll('[data-cls]').forEach(c=>c.onclick=()=>go(c.dataset.cls));
 const cont=document.getElementById('bqcont');if(cont){cont.onclick=()=>{P=old;
   const away=Math.min(8*3600,(Date.now()-(P.last||Date.now()))/1000);calcStats();
   if(away>120){const g=Math.floor(away*.4*2.5*TT(P.cur)*ST.gold);P.gold+=g;finishStart();toast(`Welcome back! Your hero earned 💰${fmt(g)} while away`,'#ffd75e')}else finishStart()};
  document.getElementById('bqnew').onclick=()=>{pk.style.display='block'}}
}
function finishStart(){document.getElementById('bqt').style.display='none';calcStats();startRun();paused=false}
function open(){
 if(!root)build();root.classList.add('on');document.body.classList.add('bqopen');showTitle();
}
function close(){if(P)save();root.classList.remove('on');document.body.classList.remove('bqopen');paused=true;mode=mode==='title'?'title':mode}
function build(){
 const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 root=document.createElement('div');root.className='bq';
 root.innerHTML=`<div class="bqbar"><b>⚔ REALM OF IDEAS</b><button data-tab="map">🗺 Map (M)</button><button data-tab="gear">🎒 Gear (I)</button><button data-tab="skills">⭐ Skills (K)</button><button data-tab="shop">🛒 Shop (B)</button><button data-tab="hero">🦸 Hero (H)</button><button id="bqx">✕ Exit</button></div>
 <div class="bqs"><div class="bqw"><canvas id="bqc" width="${W}" height="${H}"></canvas><div id="bqpanel" style="display:none"></div><div class="bqt" id="bqt"></div></div></div>`;
 document.body.appendChild(root);cv=root.querySelector('#bqc');ctx=cv.getContext('2d');panel=root.querySelector('#bqpanel');
 root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(mode!=='title')setTab(b.dataset.tab)});
 root.querySelector('#bqx').onclick=close;
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&!b.disabled)act(b.dataset)});
 addEventListener('keydown',e=>{
  if(!root.classList.contains('on')||mode==='title'||e.target.tagName==='INPUT')return;
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(e.repeat)return;keys[k]=true;
  const map={m:'map',i:'gear',k:'skills',b:'shop',h:'hero'};
  if(map[k])setTab(map[k]);else if(k==='escape')setTab(tab?'':'map');
  else if(!tab){if(k==='q')cast(0);else if(k==='e')cast(1);else if(k==='r')cast(2)}
 });
 addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
 const pt=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
 cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||mode!=='play')return;touchUI=true;const[x,y]=pt(e);
  if(x<W/2)touch={id:e.pointerId,stick:true,ox:x,oy:y,dx:0,dy:0};
  else for(let i=0;i<3;i++){const bx=W-70-i*80,by=H-90-(i===1?30:0);if(Math.hypot(x-bx,y-by)<42)cast(2-i)}});
 cv.addEventListener('pointermove',e=>{if(!touch||touch.id!==e.pointerId)return;const[x,y]=pt(e),dx=x-touch.ox,dy=y-touch.oy,l=Math.max(1,Math.hypot(dx,dy)/40);touch.dx=dx/40/l;touch.dy=dy/40/l});
 const up=e=>{if(touch&&touch.id===e.pointerId)touch=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 addEventListener('beforeunload',save);
 let last=performance.now();
 (function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(root.classList.contains('on')){if(P&&mode!=='title')step(dt);draw()}
  requestAnimationFrame(loop)})(last);
}
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('bqplay');if(b)b.onclick=open});
if(document.readyState!=='loading'){const b=document.getElementById('bqplay');if(b)b.onclick=open}
window.__bq={keys,open,step,draw,get P(){return P},get mode(){return mode},cast,startRun,build,get en(){return en},get pl(){return pl},get ST(){return ST},act,setTab,fmt,setP(p){P=p}};
})();
