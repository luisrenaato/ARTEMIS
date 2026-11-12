// ARTEMIS — geração procedural da Lua (globo) e da textura local do terreno. Não são dados reais.
//MOON_START
function moonMaps(W,Hh){ // Lua procedural: relevo -> mapa normal; albedo com mares e halos. Ruído 3D sobre a esfera (sem riscos no polo). Não é dado real.
  const N2=W*Hh,h=new Float32Array(N2),al=new Float32Array(N2),mask=new Float32Array(N2),TAU=6.283185307;let sd=11;
  const rn=()=>(sd=(sd*16807)%2147483647)/2147483647,P=new Float32Array(4096);for(let i=0;i<4096;i++)P[i]=rn();const sm=q=>q*q*(3-2*q);
  const G=(a,b,c)=>P[((a&15)<<8)|((b&15)<<4)|(c&15)];
  const vn3=(x,y,z)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),u=sm(x-xi),v=sm(y-yi),w=sm(z-zi);
    const a=G(xi,yi,zi)+(G(xi+1,yi,zi)-G(xi,yi,zi))*u,b=G(xi,yi+1,zi)+(G(xi+1,yi+1,zi)-G(xi,yi+1,zi))*u,c=G(xi,yi,zi+1)+(G(xi+1,yi,zi+1)-G(xi,yi,zi+1))*u,d=G(xi,yi+1,zi+1)+(G(xi+1,yi+1,zi+1)-G(xi,yi+1,zi+1))*u;
    const e=a+(b-a)*v,f=c+(d-c)*v;return e+(f-e)*w;};
  const fb3=(x,y,z,f,n)=>{n=n||3;let t=0,a=.5,q=0;for(let o=0;o<n;o++){t+=a*vn3(x*f,y*f,z*f);q+=a;f*=2;a*=.5;}return t/q;};
  const sinP=new Float32Array(Hh),cosP=new Float32Array(Hh),sinL=new Float32Array(W),cosL=new Float32Array(W);
  for(let y=0;y<Hh;y++){const la=(.5-(y+.5)/Hh)*Math.PI;sinP[y]=Math.sin(la);cosP[y]=Math.cos(la);}
  for(let x=0;x<W;x++){const lo=(x+.5)/W*TAU-Math.PI;sinL[x]=Math.sin(lo);cosL[x]=Math.cos(lo);}
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=y*W+x,dx=cosP[y]*cosL[x],dy=sinP[y],dz=cosP[y]*sinL[x];
    al[i]=.58+.34*(fb3(dx,dy,dz,3)-.5)+.14*(vn3(dx*14,dy*14,dz*14)-.5)+.07*(vn3(dx*170,dy*170,dz*170)-.5);
    h[i]=.002*(fb3(dx,dy,dz,2.5)-.5)+.0009*(vn3(dx*20,dy*20,dz*20)-.5);}
  for(let m=0;m<5;m++){const lon0=(rn()*2-1)*Math.PI,lat0=-.1+rn()*1.0,R0=.13+.14*rn();
    for(let l=0;l<4;l++){const lon=lon0+(l?(rn()-.5)*R0*2.2:0),lat=Math.max(-.6,Math.min(1.2,lat0+(l?(rn()-.5)*R0*1.6:0))),rho=l?R0*(.45+.35*rn()):R0,sP=Math.sin(lat),cP=Math.cos(lat),cl=Math.cos(lon),sl=Math.sin(lon),cr=Math.cos(rho*1.5);
      const y0=Math.max(0,Math.floor((.5-(lat+rho*1.5)/Math.PI)*Hh)),y1=Math.min(Hh-1,Math.ceil((.5-(lat-rho*1.5)/Math.PI)*Hh));
      for(let y=y0;y<=y1;y++){const base=sP*sinP[y],cc=cP*cosP[y];for(let x=0;x<W;x++){const dot=base+cc*(cl*cosL[x]+sl*sinL[x]);if(dot<cr)continue;
        const nz=fb3(cosP[y]*cosL[x],sinP[y],cosP[y]*sinL[x],7),t=Math.acos(Math.min(1,dot))/rho+(nz-.5)*.8,mk=t>=1?0:t<.8?1:(1-t)/.2;if(mk>mask[y*W+x])mask[y*W+x]=mk;}}}}
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=y*W+x,mk=mask[i];if(!mk)continue;const dx=cosP[y]*cosL[x],dy=sinP[y],dz=cosP[y]*sinL[x];
    al[i]*=1-.5*mk*(.8+.4*fb3(dx,dy,dz,9));h[i]+=(-.0045-h[i])*mk*.8+mk*.0004*(fb3(dx,dy,dz,30)-.5);}
  const C=[];for(let i=0;i<9000;i++)C.push(Math.min(.14,.0035/Math.sqrt(rn()+1e-4)));C.sort((a,b)=>b-a); // grandes primeiro; os menores apagam o que está dentro deles
  for(const rho of C){const lon=(rn()*2-1)*Math.PI,lat=Math.asin(rn()*2-1),cxp=Math.min(W-1,Math.floor((lon+Math.PI)/TAU*W)),cyp=Math.min(Hh-1,Math.floor((.5-lat/Math.PI)*Hh)),ci=cyp*W+cxp;
    if(mask[ci]>.5&&rn()<.6)continue;
    const young=rho>.008&&rn()<.06,old=young?1:1-.6*rn()*(.3+.7*Math.min(1,rho/.07)),dep=(.32-.14*Math.min(1,rho/.1))*rho*old,hc=h[ci],sP=Math.sin(lat),cP=Math.cos(lat),cl=Math.cos(lon),sl=Math.sin(lon),R=rho*3.2,cosR=Math.cos(R),f=2.5/rho,ox=rn()*50,oy=rn()*50,oz=rn()*50;
    const y0=Math.max(0,Math.floor((.5-(lat+R)/Math.PI)*Hh)),y1=Math.min(Hh-1,Math.ceil((.5-(lat-R)/Math.PI)*Hh)),cm=Math.max(.03,Math.cos(Math.min(1.5707,Math.abs(lat)+R))),hx=Math.min(W>>1,Math.ceil(R/cm*W/TAU));
    for(let y=y0;y<=y1;y++){const base=sP*sinP[y],cc=cP*cosP[y];for(let dxp=-hx;dxp<=hx;dxp++){const x=((cxp+dxp)%W+W)%W,dot=base+cc*(cl*cosL[x]+sl*sinL[x]);if(dot<cosR)continue;
      const wob=1+.16*(vn3(cosP[y]*cosL[x]*f+ox,sinP[y]*f+oy,cosP[y]*sinL[x]*f+oz)-.5),t=Math.acos(Math.min(1,dot))/rho*wob,i=y*W+x;
      if(t<1){const w=t<.88?1:(1-t)/.12,fl=-dep*Math.min(1,(1-t*t)*1.5),pk=rho>.05?dep*.45*Math.exp(-(t*t)/.012):0;h[i]+=((hc+fl+pk)-h[i])*w;}
      if(t>.8)h[i]+=dep*.3*Math.exp(-((t-1)/.13)*((t-1)/.13))+(t>1?dep*.16*Math.pow(t,-3):0);
      if(young&&t>.9)al[i]=Math.min(1,al[i]+.34*Math.exp(-(t-1)*1.2)*(t<1?.6:1));}}}
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const i=y*W+x,dx=cosP[y]*cosL[x],dy=sinP[y],dz=cosP[y]*sinL[x];h[i]+=.0005*(vn3(dx*230,dy*230,dz*230)-.5);al[i]=Math.max(0,Math.min(1,al[i]));}
  const nrm=new Uint8ClampedArray(N2*4),S=1.5;
  for(let y=0;y<Hh;y++){const cp=Math.max(.15,cosP[y]),yu=Math.max(0,y-1),yd=Math.min(Hh-1,y+1);
    for(let x=0;x<W;x++){const xl=(x+W-1)%W,xr=(x+1)%W,gx=(h[y*W+xr]-h[y*W+xl])/(2*cp*TAU/W),gy=(h[yu*W+x]-h[yd*W+x])/((yd-yu)*Math.PI/Hh),nx=-gx*S,ny=-gy*S,inv=1/Math.hypot(nx,ny,1),o=4*(y*W+x);
      nrm[o]=(nx*inv*.5+.5)*255;nrm[o+1]=(ny*inv*.5+.5)*255;nrm[o+2]=(inv*.5+.5)*255;nrm[o+3]=255;}}
  return{W,Hh,h,al,nrm};}
function moonTex(){const W=2048,Hh=1024,M=moonMaps(W,Hh),mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=Hh;return c;},ca=mk(),cn=mk(),ga=ca.getContext('2d'),gn=cn.getContext('2d'),ia=ga.createImageData(W,Hh),inn=gn.createImageData(W,Hh);
  for(let i=0;i<W*Hh;i++){const v=M.al[i]*255;ia.data[4*i]=v;ia.data[4*i+1]=v*.985;ia.data[4*i+2]=v*.96;ia.data[4*i+3]=255;}
  ga.putImageData(ia,0,0);inn.data.set(M.nrm);gn.putImageData(inn,0,0);
  const ta=new THREE.CanvasTexture(ca),tn=new THREE.CanvasTexture(cn);ta.anisotropy=8;tn.anisotropy=8;return[ta,tn];}
//MOON_END
//PATCH_START
function patchMaps(Nt){ // textura local do terreno (40 km): crateras pequenas + regolito. Procedural, não é dado real.
  const ps=SIZE/Nt,x0=-SIZE/2+ps/2,hf=new Float32Array(Nt*Nt),al=new Float32Array(Nt*Nt),r=mkRng(77);
  for(let j=0;j<Nt;j++)for(let i=0;i<Nt;i++){const x=x0+i*ps,y=x0+j*ps,k=j*Nt+i;al[k]=.6+.2*(fb2(x/5+11,y/5)-.5)+.1*(fb2(x*1.2,y*1.2)-.5)+.06*(vn2(x*9,y*9)-.5);hf[k]=.0016*(fb2(x*3,y*3)-.5);}
  const L=[];for(let i=0;i<3400;i++)L.push([(r()-.5)*SIZE,(r()-.5)*SIZE,Math.min(.9,.045/Math.sqrt(r()+1e-4)),.55+.45*r(),r()<.05?1:0]);L.sort((a,b)=>b[2]-a[2]);
  for(const c of L)stamp(hf,Nt,x0,ps,c,al);
  const nrm=new Uint8ClampedArray(Nt*Nt*4),alb=new Uint8ClampedArray(Nt*Nt*4),S=1.2;
  for(let j=0;j<Nt;j++){const jd=Math.min(Nt-1,j+1),ju=Math.max(0,j-1);for(let i=0;i<Nt;i++){const il=Math.max(0,i-1),ir=Math.min(Nt-1,i+1),
    gx=(hf[j*Nt+ir]-hf[j*Nt+il])/((ir-il)*ps),gy=(hf[jd*Nt+i]-hf[ju*Nt+i])/((jd-ju)*ps),nx=-gx*S,ny=-gy*S,inv=1/Math.hypot(nx,ny,1),o=4*((Nt-1-j)*Nt+i),v=Math.max(0,Math.min(1,al[j*Nt+i]))*255;
    nrm[o]=(nx*inv*.5+.5)*255;nrm[o+1]=(ny*inv*.5+.5)*255;nrm[o+2]=(inv*.5+.5)*255;nrm[o+3]=255;alb[o]=v;alb[o+1]=v*.985;alb[o+2]=v*.96;alb[o+3]=255;}}
  return{Nt,hf,al,nrm,alb};}
function patchTex(){const Nt=1536,M=patchMaps(Nt),mk=()=>{const c=document.createElement('canvas');c.width=c.height=Nt;return c;},ca=mk(),cn=mk(),ga=ca.getContext('2d'),gn=cn.getContext('2d'),ia=ga.createImageData(Nt,Nt),inn=gn.createImageData(Nt,Nt);
  ia.data.set(M.alb);inn.data.set(M.nrm);ga.putImageData(ia,0,0);gn.putImageData(inn,0,0);const ta=new THREE.CanvasTexture(ca),tn=new THREE.CanvasTexture(cn);ta.anisotropy=8;tn.anisotropy=8;return[ta,tn];}
//PATCH_END
