// ARTEMIS — interface, cena 3D (three.js), câmera, linha do tempo.
const $=id=>document.getElementById(id), css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const f1=v=>v.toFixed(1).replace('.',','), f2=v=>v.toFixed(2).replace('.',',');
const SITES=[
 {id:'A',name:'Sítio A — piso da cratera (sintético)',x:-6,y:5,desc:'Depressão de 9 km de raio. Esperado: horizonte alto em todas as direções.'},
 {id:'B',name:'Sítio B — pico (sintético)',x:12,y:-5,desc:'Massivo isolado de ~2 km. Esperado: horizonte baixo, Sol visível por mais tempo.'},
 {id:'C',name:'Sítio C — borda da cratera (sintético)',x:3,y:5,desc:'Aresta entre a depressão e o terreno aberto: caso intermediário.'}];
SITES.forEach(s=>{s.z=heightAt(s.x,s.y);s.p=profile(s.x,s.y);const r=series(s.p);s.S=r.S;s.E=r.E;s.m=metrics(r.S);s.me=metrics(r.E);});
let sel=0,tH=0,playing=false,dirty=true,local=false,globe=true;

// ---- Cena 3D ----
const cv=$('c'),renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x04060c,.003);const cam=new THREE.PerspectiveCamera(40,1,.05,2000);
const pos=new Float32Array(N*N*3),col=new Float32Array(N*N*3).fill(1),uv=new Float32Array(N*N*2),idx=[];
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=-SIZE/2+i*DX,y=-SIZE/2+j*DX;pos[3*k]=x;pos[3*k+1]=H[k];pos[3*k+2]=-y;uv[2*k]=i/(N-1);uv[2*k+1]=j/(N-1);
  if(i<N-1&&j<N-1&&Math.hypot(-SIZE/2+(i+.5)*DX,-SIZE/2+(j+.5)*DX)<18.5){idx.push(k,k+1,k+N,k+1,k+N+1,k+N);}} // sentido anti-horário visto de cima (faces para cima)
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
const terr=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,color:0x9a9a9e,roughness:1,metalness:0}));scene.add(terr);

const moon=new THREE.Mesh(new THREE.SphereGeometry(30,160,80),new THREE.MeshStandardMaterial({color:0x8a8a8e,roughness:1,metalness:0,fog:false}));scene.add(moon);
setTimeout(()=>{const [a,n]=moonTex(),m=moon.material;m.map=a;m.normalMap=n;m.normalScale=new THREE.Vector2(1,1);m.color.set(0xffffff);m.needsUpdate=true;},80); // gerada após o 1º quadro, para a tela abrir na hora
setTimeout(()=>{const [a,n]=patchTex(),m=terr.material;m.map=a;m.normalMap=n;m.normalScale=new THREE.Vector2(1,1);m.color.set(0xffffff);m.needsUpdate=true;},600);
const dl=new THREE.DirectionalLight(0xfff6e8,2.6),amb=new THREE.AmbientLight(0x8d97ab,.55);dl.position.set(70,-30,60);scene.add(dl,amb);
function skyTex(){const W=1024,Hh=512,k=document.createElement('canvas'),t=document.createElement('canvas');k.width=4096;k.height=2048;t.width=W;t.height=Hh;const g=k.getContext('2d'),tg=t.getContext('2d');
  let sd=5;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647,P=new Float32Array(4096);for(let i=0;i<4096;i++)P[i]=rn();const sm=q=>q*q*(3-2*q);
  const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),u=sm(x-xi),v=sm(y-yi),a=P[((yi&63)<<6)|(xi&63)],b=P[((yi&63)<<6)|((xi+1)&63)],c=P[(((yi+1)&63)<<6)|(xi&63)],d=P[(((yi+1)&63)<<6)|((xi+1)&63)];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  const fb=(x,y)=>{let f=0,a=.5;for(let o=0;o<4;o++){f+=a*vn(x,y);x*=2;y*=2;a*=.5;}return f/.9375;};
  const im=tg.createImageData(W,Hh),D=im.data;
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const by=256+Math.sin(x/W*6.283+.6)*95,d=(y-by)/72,core=Math.exp(-d*d),f=fb(x/W*8,y/Hh*4),col=vn(x/W*4+9,y/Hh*2+3),dust=Math.max(0,fb(x/W*16+5,y/Hh*8)-.5)*3;
    const I=core*(.25+1.1*f)*(1-.7*Math.min(1,dust*core*2)),o=4*(y*W+x);
    D[o]=Math.min(255,3+I*(70+185*col));D[o+1]=Math.min(255,5+I*(85+100*col));D[o+2]=Math.min(255,12+I*(175-55*col));D[o+3]=255;}
  tg.putImageData(im,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.fillStyle='#02030a';g.fillRect(0,0,4096,2048);g.drawImage(t,0,0,4096,2048);
  g.globalCompositeOperation='lighter';
  for(const [c,n,al] of [['190,90,170',9,.1],['70,150,220',9,.1],['255,170,90',5,.07]])for(let i=0;i<n;i++){const x=rn()*4096,y=240+rn()*1500,r=160+rn()*320,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba('+c+','+al+')');gr.addColorStop(.5,'rgba('+c+','+al*.4+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
  const SC=['255,255,255','175,205,255','255,220,160','255,190,170'];
  const star=(x,y,r,a,c)=>{const sx=1/Math.max(.25,Math.cos((y/2048-.5)*Math.PI));g.save();g.translate(x,y);g.scale(sx,1);const gr=g.createRadialGradient(0,0,0,0,0,r);gr.addColorStop(0,'rgba(255,255,255,'+a+')');gr.addColorStop(.25,'rgba('+c+','+a*.6+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,6.2832);g.fill();g.restore();};
  for(let i=0;i<9000;i++){const b=rn()**5;star(rn()*4096,rn()*2048,.9+b*3,.3+.7*b,SC[i%4]);}
  for(let i=0;i<9000;i++){const x=rn()*4096,by=1024+Math.sin(x/4096*6.283+.6)*190,y=by+(rn()+rn()+rn()-1.5)*230,b=rn()**5;star(x,y,.8+b*2.6,.25+.7*b,SC[i%4]);}
  for(let i=0;i<70;i++){const b=.5+rn()*.5;star(rn()*4096,150+rn()*1750,6+rn()*7,b*.55,SC[i%4]);}
  g.globalCompositeOperation='source-over';const tx=new THREE.CanvasTexture(k);tx.anisotropy=4;return tx;}
const sky=new THREE.Mesh(new THREE.SphereGeometry(900,64,32),new THREE.MeshBasicMaterial({map:skyTex(),side:THREE.BackSide,fog:false,depthWrite:false}));scene.add(sky);
const dotT=(()=>{const k=document.createElement('canvas');k.width=k.height=32;const g=k.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(k);})();
function starLayer(n,seed){const a=new Float32Array(n*3);let sd=seed;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<n;i++){const u=rn()*2-1,t=rn()*6.283,r=Math.sqrt(1-u*u);a[3*i]=800*r*Math.cos(t);a[3*i+1]=800*u;a[3*i+2]=800*r*Math.sin(t);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xdfe9ff,size:7,map:dotT,sizeAttenuation:false,transparent:true,depthWrite:false,fog:false}));scene.add(pts);return pts;}
const tw=[starLayer(450,3),starLayer(450,9)];
// Cometas: cabeça + cauda de sprites aditivos; puramente cenográficos
const ctex=(()=>{const k=document.createElement('canvas');k.width=k.height=64;const g=k.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(190,220,255,.5)');r.addColorStop(1,'rgba(150,190,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(k);})();
const TL=28,mkS=()=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:ctex,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true}));m.visible=false;scene.add(m);return m;};
const comets=[0,1,2].map(i=>({sp:Array.from({length:TL},mkS),p:null,v:null,h:[],t:-1-i*2.5,life:0}));
function spawn(c){const rv=()=>new THREE.Vector3(Math.random()-.5,(Math.random()-.5)*.8,Math.random()-.5);c.p=rv().normalize().multiplyScalar(700);c.v=rv().cross(c.p).normalize().multiplyScalar(90+Math.random()*60);c.h=[];c.life=0;}
function stepComets(dt){for(const c of comets){
  if(c.t<0){c.t+=dt;if(c.t>=0)spawn(c);else continue;}
  c.life+=dt;c.p.addScaledVector(c.v,dt).normalize().multiplyScalar(700);c.h.unshift(c.p.clone());if(c.h.length>TL)c.h.pop();
  const fade=Math.max(0,Math.min(1,c.life/.6,(5.5-c.life)/.8));
  c.sp.forEach((s,i)=>{const q=c.h[i];s.visible=!!q&&fade>0;if(!s.visible)return;s.position.copy(q);const f=1-i/TL;s.scale.setScalar(3+24*f*f);s.material.opacity=.85*f*fade;});
  if(c.life>5.5){c.t=-(3+Math.random()*6);c.sp.forEach(s=>s.visible=false);}}}
function glow(rgb,sz){const k=document.createElement('canvas');k.width=k.height=128;const g=k.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.12,'rgba('+rgb+',1)');r.addColorStop(.32,'rgba('+rgb+',.32)');r.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=r;g.fillRect(0,0,128,128);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.scale.set(sz,sz,1);scene.add(sp);return sp;}
const sunO=glow('255,200,87',9),earO=glow('156,202,255',6);
const markers=SITES.map(s=>{const g=glow('255,255,255',2.2);g.position.set(s.x,s.z+.3,-s.y);return g;});
const pole=glow('255,200,87',4);pole.position.set(0,-30.8,0);
function updateTerrain(az,el){ // o Sol vira luz direcional; a sombra por vértice vem do ray marching do horizonte
  const a=az*Math.PI/180,e=el*Math.PI/180,sx=Math.cos(e)*Math.sin(a),sy=Math.cos(e)*Math.cos(a),sz=Math.sin(e);
  if(!globe)dl.position.set(sx*100,sz*100,-sy*100);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=-SIZE/2+i*DX,y=-SIZE/2+j*DX,lit=el>horizonAt(x,y,az,0,30,DX),fade=1-.4*Math.max(0,Math.min(1,(Math.hypot(x,y)-10)/8.5)),v=(lit?1:.3)*fade;
    col[3*k]=v;col[3*k+1]=v;col[3*k+2]=v*(lit?1:1.08);}
  geo.attributes.color.needsUpdate=true;}
function setLights(){if(globe){dl.position.set(70,-30,60);dl.intensity=2.6;amb.intensity=.55;}else{dl.intensity=3;amb.intensity=.5;}}

// ---- Câmera orbital ----
let lastInt=0;
const cs={th:.6,ph:2.45,r:95,tx:0,ty:0,tz:0,gth:.6,gph:2.45,gr:95,gtx:0,gty:0,gtz:0};
function setCam(){const s=SITES[sel];if(globe){cs.gtx=0;cs.gty=0;cs.gtz=0;cs.gr=95;cs.gph=2.45;}else if(local){cs.gtx=s.x;cs.gty=s.z;cs.gtz=-s.y;cs.gr=11;cs.gph=1.35;}else{cs.gtx=0;cs.gty=0;cs.gtz=0;cs.gr=50;cs.gph=1.2;}}
let drag=null;cv.addEventListener('pointerdown',e=>{lastInt=performance.now();drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
cv.addEventListener('pointerup',()=>{drag=null;cv.style.cursor='grab'});
cv.addEventListener('pointermove',e=>{if(!drag)return;cs.gth-=(e.clientX-drag[0])*.006;cs.gph=Math.min(globe?2.95:1.5,Math.max(.1,cs.gph-(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY];});
cv.addEventListener('wheel',e=>{e.preventDefault();lastInt=performance.now();cs.gr=Math.min(globe?150:120,Math.max(globe?36:3,cs.gr*Math.exp(e.deltaY*.001)));},{passive:false});

// ---- UI ----
const sitesEl=$('sites');SITES.forEach((s,i)=>{const b=document.createElement('button');b.className='site';b.innerHTML='<i class="bd">'+s.id+'</i><div><b>'+s.name.split(' — ')[0]+'</b><span>'+s.name.split(' — ')[1]+'</span></div><u class="dot" title="Sol neste instante"></u>';b.onclick=()=>{sel=i;if(globe)setMode('pole');else if(local)setCam();dirty=true;ui();};sitesEl.appendChild(b);});
function setMode(m){globe=m==='globe';local=m==='site';setCam();
  setLights();moon.visible=pole.visible=globe;terr.visible=!globe;markers.forEach(g=>g.visible=!globe);sunO.visible=earO.visible=!globe;
  $('pin').style.display=$('gcard').style.display=globe?'':'none';$('right').style.display=$('bot').style.display=globe?'none':'';
  const on={globe:'vm',pole:'vg',site:'vl'}[m];['vm','vg','vl'].forEach(id=>$(id).setAttribute('aria-pressed',id===on));$('vdesc').textContent={globe:'Lua inteira, com o polo sul destacado.',pole:'Terreno de demonstração ao redor do polo sul.',site:'Câmera perto do sítio escolhido.'}[m];dirty=true;}
$('vm').onclick=()=>setMode('globe');$('vg').onclick=()=>setMode('pole');$('vl').onclick=()=>setMode('site');$('go').onclick=()=>setMode('pole');$('ok').onclick=()=>{$('intro').style.display='none';};
$('pl').onclick=()=>{playing=!playing;$('pl').textContent=playing?'⏸ Pausar':'▶ Reproduzir';};
$('rg').oninput=e=>{tH=+e.target.value;dirty=true;};
const LS=['SEM SOL','PARCIAL','COM SOL'],LE=['ESCONDIDA','PARCIAL','VISÍVEL'],cls=['off','part','on'];
function put(id,s){const el=$(id);el.textContent=(id==='sunst'?LS:LE)[s];el.className='st '+cls[s];}
function drawStrip(){const c=$('st'),g=c.getContext('2d'),W=c.width,s=SITES[sel],n=s.S.length;g.clearRect(0,0,W,c.height);
  for(let k=0;k<n;k++){const x=k/n*W,w=W/n+1;
    g.globalAlpha=[.18,.55,1][s.S[k]];g.fillStyle=css('--sun');g.fillRect(x,2,w,14);
    g.globalAlpha=[.18,.55,1][s.E[k]];g.fillStyle=css('--earth');g.fillRect(x,20,w,14);}
  g.globalAlpha=1;g.fillStyle=css('--tx');g.fillRect(tH/n*W-1,0,2,c.height);}
function drawHz(sun,ea){const c=$('hz'),g=c.getContext('2d'),W=c.width,Hh=c.height,p=SITES[sel].p;
  let mx=8;for(const v of p)mx=Math.max(mx,v);mx=Math.ceil(mx)+1;const mn=-2,X=a=>a/360*W,Y=v=>Hh-(v-mn)/(mx-mn)*(Hh-14)-2;
  g.clearRect(0,0,W,Hh);g.fillStyle=css('--off');g.globalAlpha=.55;g.beginPath();g.moveTo(0,Hh);for(let a=0;a<360;a++)g.lineTo(X(a),Y(p[a]));g.lineTo(W,Hh);g.closePath();g.fill();g.globalAlpha=1;
  g.strokeStyle=css('--mut');g.setLineDash([4,4]);g.beginPath();g.moveTo(0,Y(0));g.lineTo(W,Y(0));g.stroke();g.setLineDash([]);
  g.fillStyle=css('--mut');g.font='20px sans-serif';[['N',0],['L',90],['S',180],['O',270]].forEach(([t,a])=>g.fillText(t,X(a)+4,Hh-4));g.fillText('0°',W-34,Y(0)-4);
  for(const [o,c2] of [[sun,'--sun'],[ea,'--earth']]){g.fillStyle=css(c2);g.beginPath();g.arc(X(o.az),Y(o.el),7,0,6.283);g.fill();}}
function ui(){const s=SITES[sel],t=tH/24,su=sunSim(t),ea=earthSim(t),hs=interp(s.p,su.az),he=interp(s.p,ea.az);
  [...sitesEl.children].forEach((b,i)=>{b.setAttribute('aria-pressed',i===sel);b.querySelector('.dot').className='dot s'+state(su.el,interp(SITES[i].p,su.az),SEMI_SUN);});
  $('sname').textContent=s.name;$('sdesc').textContent=s.desc+' Elevação do terreno: '+f2(s.z)+' km (sintética).';
  $('sunv').textContent=f1(su.az)+'° / '+f2(su.el)+'°';$('sunh').textContent=f2(hs)+'°';put('sunst',state(su.el,hs,SEMI_SUN));
  $('eav').textContent=f1(ea.az)+'° / '+f2(ea.el)+'°';$('eah').textContent=f2(he)+'°';put('east',state(ea.el,he,SEMI_EARTH));
  $('m1').textContent=f1(s.m.pct)+' %';$('m2').textContent=f1(s.m.longestH/24)+' d';$('m3').textContent=s.m.transitions;$('m4').textContent=f1(s.me.pct)+' %';
  $('tlab').textContent='T+ '+f1(t)+' d (instante simulado, não é data real)';drawStrip();drawHz(su,ea);
  const dir=(o,d)=>{const a=o.az*Math.PI/180,e=o.el*Math.PI/180;return [s.x+d*Math.cos(e)*Math.sin(a),s.z+d*Math.sin(e)+.5,-(s.y+d*Math.cos(e)*Math.cos(a))];};
  sunO.position.set(...dir(su,26));earO.position.set(...dir(ea,26));
  markers.forEach((g,i)=>{g.material.color.set(i===sel?0xffd36b:0x9ccaff);g.scale.set(i===sel?3.4:2.2,i===sel?3.4:2.2,1);});
  return su;}
let last=performance.now(),su0;
function frame(now){const dt=(now-last)/1000;last=now;
  if(playing){tH=(tH+(+$('sp').value)*dt)%Math.ceil(SYN*24);$('rg').value=Math.floor(tH);dirty=true;}
  if(dirty){su0=ui();updateTerrain(su0.az,su0.el);dirty=false;}
  if(globe)moon.rotation.y+=dt*.05;
  sky.rotation.y+=dt*.004;tw.forEach(q=>q.rotation.y+=dt*.004);tw[0].material.opacity=.55+.45*Math.sin(now/650);tw[1].material.opacity=.55+.45*Math.sin(now/650+2.4);stepComets(Math.min(dt,.05));
  if(globe){const v=new THREE.Vector3(0,-30.8,0).project(cam),q=$('pin').style;q.left=((v.x+1)/2*innerWidth)+'px';q.top=((1-v.y)/2*innerHeight)+'px';}
  if(!drag&&!local&&!globe&&now-lastInt>3000)cs.gth+=dt*.05;
  for(const k of['th','ph','r','tx','ty','tz'])cs[k]+=(cs['g'+k]-cs[k])*.12;
  cam.position.set(cs.tx+cs.r*Math.sin(cs.ph)*Math.sin(cs.th),cs.ty+cs.r*Math.cos(cs.ph),cs.tz+cs.r*Math.sin(cs.ph)*Math.cos(cs.th));cam.lookAt(cs.tx,cs.ty,cs.tz);
  renderer.render(scene,cam);requestAnimationFrame(frame);}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();renderer.setClearColor(0x04060c);}
addEventListener('resize',resize);resize();setMode('globe');requestAnimationFrame(frame);
