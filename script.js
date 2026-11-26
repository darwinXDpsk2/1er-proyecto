const cv=document.getElementById('sky'),ctx=cv.getContext('2d');
const panel=document.getElementById('panel');
let W,H,sc,tilt,mx=0,my=0,mouse={x:-9,y:-9};

// id = sección del panel que abre
const P=[
 {id:'sobre',n:'Sobre mí',orbit:.2,r:7,sp:.9,ph:.5,c:['#e6e0d6','#5d574f']},
 {id:'formacion',n:'Formación',orbit:.31,r:11,sp:.65,ph:2.2,c:['#ffe0b0','#a35f30']},
 {id:'skills',n:'Habilidades',orbit:.43,r:12,sp:.5,ph:4,c:['#8fd8ff','#14409a'],moon:1},
 {id:'intereses',n:'Intereses',orbit:.55,r:9,sp:.4,ph:1,c:['#ffa877','#7e2616']},
 {id:'proyectos',n:'Mis proyectos',orbit:.75,r:27,sp:.2,ph:3.4,c:['#f4d9ae','#9c5a30'],bands:1,star:1},
 {id:'contacto',n:'Contacto',orbit:.93,r:19,sp:.14,ph:5.5,c:['#f7e8b8','#917236'],ring:1}
];
const belt=Array.from({length:260},()=>({a:Math.random()*6.28,o:.6+Math.random()*.08,s:Math.random()*1.4+.4}));
const stars=Array.from({length:300},()=>({x:Math.random(),y:Math.random(),z:Math.random()*.8+.2,t:Math.random()*6}));
let shoot=null;

function size(){
 const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
 cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
 const portrait=W<H;sc=Math.max(.55,Math.min(1.3,Math.min(W,H*1.4)/760));
 tilt=portrait?.62:.36;
}
size();addEventListener('resize',size);
addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mx=e.clientX/W-.5;my=e.clientY/H-.5});

const cam={x:0,y:0,z:1,ox:0,oy:0};
let focus=null,tt=0,last=performance.now(),spd=1,hover=null;
const RX=()=>Math.min(W*.47,H*1.05);

function pos(p){
 const a=p.ph+tt*p.sp,rx=RX()*p.orbit,ry=rx*tilt;
 p.x=Math.cos(a)*rx;p.y=Math.sin(a)*ry;
 p.rr=p.r*sc*(1+Math.sin(a)*.14);p.depth=Math.sin(a);
}

function drawStars(t){
 const g1=ctx.createRadialGradient(W*.2,H*.3,0,W*.2,H*.3,W*.6);
 g1.addColorStop(0,'rgba(90,50,190,.22)');g1.addColorStop(1,'transparent');
 ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
 const g2=ctx.createRadialGradient(W*.85,H*.8,0,W*.85,H*.8,W*.5);
 g2.addColorStop(0,'rgba(0,160,200,.15)');g2.addColorStop(1,'transparent');
 ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);
 for(const s of stars){
  const x=((s.x*W-mx*40*s.z-cam.x*.03*s.z)%W+W)%W,y=((s.y*H-my*40*s.z)%H+H)%H;
  ctx.globalAlpha=.35+.65*Math.abs(Math.sin(t*.001*s.z+s.t));
  ctx.fillStyle=s.z>.8?'#cfe8ff':'#fff';
  ctx.fillRect(x,y,s.z*1.7,s.z*1.7);
 }
 ctx.globalAlpha=1;
 if(!shoot&&Math.random()<.004)shoot={x:Math.random()*W,y:Math.random()*H*.5,l:0};
 if(shoot){
  shoot.l+=14;const x=shoot.x+shoot.l,y=shoot.y+shoot.l*.45;
  const g=ctx.createLinearGradient(x,y,x-90,y-40);g.addColorStop(0,'#fff');g.addColorStop(1,'transparent');
  ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-90,y-40);ctx.stroke();
  if(shoot.l>600)shoot=null;
 }
}

function drawSun(t){
 const sr=38*sc,pu=1+Math.sin(t*.002)*.05;
 let g=ctx.createRadialGradient(0,0,sr*.6,0,0,sr*5*pu);
 g.addColorStop(0,'rgba(255,170,60,.5)');g.addColorStop(.4,'rgba(255,110,30,.14)');g.addColorStop(1,'transparent');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,sr*5*pu,0,7);ctx.fill();
 ctx.save();ctx.rotate(tt*.15);ctx.strokeStyle='rgba(255,200,100,.22)';ctx.lineWidth=2*sc;
 for(let i=0;i<18;i++){const a=i/18*6.283,l=sr*(1.5+.5*Math.sin(tt*2+i*2.1));
  ctx.beginPath();ctx.moveTo(Math.cos(a)*sr,Math.sin(a)*sr);ctx.lineTo(Math.cos(a)*l*1.4,Math.sin(a)*l*1.4);ctx.stroke()}
 ctx.restore();
 g=ctx.createRadialGradient(-sr*.25,-sr*.25,sr*.1,0,0,sr);
 g.addColorStop(0,'#fffbe0');g.addColorStop(.45,'#ffc24a');g.addColorStop(1,'#ff6a00');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,sr,0,7);ctx.fill();
}

function ring(p,front){
 const {x,y,rr}=p;ctx.save();ctx.translate(x,y);ctx.rotate(-.35);
 for(const [k,w,a] of [[2.3,.34,.55],[1.75,.2,.75]]){
  ctx.strokeStyle=`rgba(232,205,150,${a})`;ctx.lineWidth=rr*w;
  ctx.beginPath();ctx.ellipse(0,0,rr*k,rr*k*.28,0,front?0:Math.PI,front?Math.PI:6.283);ctx.stroke();
 }
 ctx.restore();
}

function drawPlanet(p){
 const {x,y,rr}=p,d=Math.hypot(x,y)||1,lx=-x/d,ly=-y/d;
 if(p.ring)ring(p,false);
 ctx.save();ctx.shadowColor=p.c[0];ctx.shadowBlur=rr*.9;
 let g=ctx.createRadialGradient(x+lx*rr*.45,y+ly*rr*.45,rr*.1,x,y,rr*1.05);
 g.addColorStop(0,p.c[0]);g.addColorStop(1,p.c[1]);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rr,0,7);ctx.fill();ctx.restore();
 ctx.save();ctx.beginPath();ctx.arc(x,y,rr,0,7);ctx.clip();
 if(p.bands){
  for(let i=-3;i<=3;i++){ctx.fillStyle=i%2?'rgba(110,55,20,.3)':'rgba(255,235,200,.14)';ctx.fillRect(x-rr,y+i*rr*.27-rr*.07,rr*2,rr*.15)}
  ctx.fillStyle='rgba(190,70,40,.55)';ctx.beginPath();ctx.ellipse(x+rr*.3,y+rr*.3,rr*.22,rr*.12,0,0,7);ctx.fill();
 }
 if(p.id==='skills'){ctx.fillStyle='rgba(80,200,110,.55)';ctx.beginPath();ctx.ellipse(x-rr*.2+Math.sin(tt)*rr*.3,y,rr*.35,rr*.5,.5,0,7);ctx.fill()}
 g=ctx.createLinearGradient(x+lx*rr,y+ly*rr,x-lx*rr,y-ly*rr);
 g.addColorStop(0,'transparent');g.addColorStop(.5,'transparent');g.addColorStop(1,'rgba(0,0,12,.72)');
 ctx.fillStyle=g;ctx.fillRect(x-rr,y-rr,rr*2,rr*2);ctx.restore();
 if(p.ring)ring(p,true);
 if(p.moon){const a=tt*3.2;ctx.fillStyle='#ddd';ctx.beginPath();ctx.arc(x+Math.cos(a)*rr*2,y+Math.sin(a)*rr*.7,rr*.22,0,7);ctx.fill()}
 if(p.star&&focus!==p.id){
  const k=Math.sin(tt*6);ctx.strokeStyle='rgba(255,200,110,.8)';ctx.lineWidth=1.5/cam.z;
  ctx.setLineDash([5,6]);ctx.beginPath();ctx.arc(x,y,rr*1.55+k*3,0,7);ctx.stroke();ctx.setLineDash([]);
 }
 const on=hover===p||focus===p.id;
 ctx.font=`${(on?600:400)*1}px Outfit,sans-serif`;
 const fs=(on?15:12)/cam.z;ctx.font=`${on?600:400} ${fs}px Outfit,sans-serif`;
 ctx.textAlign='center';ctx.fillStyle=on?'#fff':'rgba(235,230,255,.6)';
 ctx.fillText((p.star?'★ ':'')+p.n,x,y+rr+fs+(p.ring?rr*.6:4));
}

function frame(now){
 const dt=Math.min((now-last)/1000,.05);last=now;
 spd+=((focus?.15:1)-spd)*.05;tt+=dt*spd*.6;
 ctx.clearRect(0,0,W,H);drawStars(now);
 P.forEach(pos);
 const f=P.find(p=>p.id===focus),wide=W>760;
 const tz=f?Math.max(1.8,Math.min(5,95/f.rr)):1;
 cam.z+=(tz-cam.z)*.06;
 cam.x+=((f?f.x:0)-cam.x)*.07;cam.y+=((f?f.y:0)-cam.y)*.07;
 cam.ox+=((f&&wide?-W*.22:0)-cam.ox)*.07;cam.oy+=((f&&!wide?-H*.2:0)-cam.oy)*.07;
 ctx.save();
 ctx.translate(W/2+cam.ox-mx*14,H/2+cam.oy-my*8);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);
 // órbitas
 for(const p of P){const rx=RX()*p.orbit;ctx.strokeStyle=focus===p.id?'rgba(255,255,255,.3)':'rgba(180,170,255,.13)';
  ctx.lineWidth=1/cam.z;ctx.beginPath();ctx.ellipse(0,0,rx,rx*tilt,0,0,7);ctx.stroke()}
 // cinturón de asteroides
 ctx.fillStyle='rgba(200,185,170,.7)';
 for(const b of belt){const a=b.a+tt*.3,rx=RX()*b.o;ctx.fillRect(Math.cos(a)*rx,Math.sin(a)*rx*tilt,b.s*sc,b.s*sc)}
 // detrás del sol
 const sorted=[...P].sort((a,b)=>a.y-b.y);
 sorted.filter(p=>p.y<0).forEach(drawPlanet);
 drawSun(now);
 sorted.filter(p=>p.y>=0).forEach(drawPlanet);
 // hover
 const wx=(mouse.x-W/2-cam.ox+mx*14)/cam.z+cam.x,wy=(mouse.y-H/2-cam.oy+my*8)/cam.z+cam.y;
 hover=null;let best=1e9;
 for(const p of P){const d=Math.hypot(wx-p.x,wy-p.y);if(d<p.rr+14/cam.z&&d<best){best=d;hover=p}}
 const sunHit=Math.hypot(wx,wy)<38*sc;
 cv.style.cursor=hover||(sunHit&&focus)?'pointer':'default';
 ctx.restore();
 requestAnimationFrame(frame);
}

// --- navegación ---
const secs=[...panel.querySelectorAll('section')],btns=[...document.querySelectorAll('[data-go]')];
function go(id){
 focus=id;document.body.classList.add('open');
 secs.forEach(s=>s.classList.toggle('on',s.dataset.id===id));
 btns.forEach(b=>b.classList.toggle('on',b.dataset.go===id));
 panel.scrollTop=0;history.replaceState(null,'','#'+id);
}
function home(){
 focus=null;document.body.classList.remove('open');
 btns.forEach(b=>b.classList.remove('on'));history.replaceState(null,'',location.pathname);
}
cv.addEventListener('click',()=>{
 if(hover)go(hover.id);
 else if(focus)home();
});
btns.forEach(b=>b.onclick=()=>go(b.dataset.go));
panel.querySelector('.close').onclick=home;
addEventListener('keydown',e=>{if(e.key==='Escape')home()});
const h=location.hash.slice(1);if(P.some(p=>p.id===h))go(h);
requestAnimationFrame(frame);
