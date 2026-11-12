// ARTEMIS — núcleo científico: DEM sintético, horizonte (ray marching), visibilidade, janelas. Sem DOM.
const R=1737.4, N=128, SIZE=40, DX=SIZE/(N-1), SYN=29.530589, HOBS=0.002;
function mkRng(sd){return()=>(sd=(sd*16807)%2147483647)/2147483647;}
const _P=(()=>{const r=mkRng(5),p=new Float32Array(1024);for(let i=0;i<1024;i++)p[i]=r();return p;})();
function vn2(x,y){const sm=q=>q*q*(3-2*q),xi=Math.floor(x),yi=Math.floor(y),u=sm(x-xi),v=sm(y-yi),g=(a,b)=>_P[((b&31)<<5)|(a&31)],a=g(xi,yi),b=g(xi+1,yi),c=g(xi,yi+1),d=g(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fb2(x,y,n){n=n||3;let t=0,a=.5,q=0;for(let o=0;o<n;o++){t+=a*vn2(x,y);q+=a;x*=2;y*=2;a*=.5;}return t/q;}
// Cratera = bacia + borda + ejecta; cada nova cratera substitui o que há dentro dela (sem círculos empilhados). Unidades em km.
function stamp(a,n,x0,ps,c,al){const cx=c[0],cy=c[1],r=c[2],old=c[3],young=c[4],dep=(.28-.1*Math.min(1,r/3))*r*old,R=r*3,
  i0=Math.max(0,Math.floor((cx-R-x0)/ps)),i1=Math.min(n-1,Math.ceil((cx+R-x0)/ps)),j0=Math.max(0,Math.floor((cy-R-x0)/ps)),j1=Math.min(n-1,Math.ceil((cy+R-x0)/ps)),
  ci=Math.max(0,Math.min(n-1,Math.round((cx-x0)/ps))),cj=Math.max(0,Math.min(n-1,Math.round((cy-x0)/ps))),hc=a[cj*n+ci];
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const dx=x0+i*ps-cx,dy=x0+j*ps-cy,ang=Math.atan2(dy,dx),t=Math.hypot(dx,dy)/r/(1+.03*Math.sin(3*ang+cx*5)+.02*Math.sin(5*ang+cy*3)),k=j*n+i;if(t>3)continue;
    if(t<1){const w=t<.88?1:(1-t)/.12,fl=-dep*Math.min(1,(1-t*t)*1.5),pk=r>1.5?dep*.45*Math.exp(-(t*t)/.012):0;a[k]+=((hc+fl+pk)-a[k])*w;}
    if(t>.8)a[k]+=dep*.3*Math.exp(-((t-1)/.13)*((t-1)/.13))+(t>1?dep*.16*Math.pow(t,-3):0);
    if(al){if(t<1)al[k]-=.05*(1-t*t);if(young&&t>.9)al[k]=Math.min(1,al[k]+.32*Math.exp(-(t-1)*1.3)*(t<1?.6:1));}}}
const MED=(()=>{const r=mkRng(23),L=[[-6,5,9,1,0],[9,-8,4,1,0],[5,9,3,1,0]];for(let i=0;i<24;i++)L.push([(r()-.5)*36,(r()-.5)*36,Math.min(3,.9/Math.sqrt(r()+.05)),.5+.5*r(),0]);return L.sort((a,b)=>b[2]-a[2]);})();
const H=new Float32Array(N*N);
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-SIZE/2+i*DX,y=-SIZE/2+j*DX;H[j*N+i]=.12*(fb2(x/6+3,y/6)-.5)+2.2*Math.exp(-(((x-12)**2+(y+5)**2)/32));}
for(const c of MED)stamp(H,N,-SIZE/2,DX,c);
function heightAt(x,y){const fx=(x+SIZE/2)/DX,fy=(y+SIZE/2)/DX;
  const i=Math.max(0,Math.min(N-2,Math.floor(fx))),j=Math.max(0,Math.min(N-2,Math.floor(fy)));
  const u=fx-i,v=fy-j,a=H[j*N+i],b=H[j*N+i+1],c=H[(j+1)*N+i],d=H[(j+1)*N+i+1];
  return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v;}
function horizonAt(x,y,az,hObs,maxKm,stp){maxKm=maxKm||40;stp=stp||DX*.5;
  const a=az*Math.PI/180,sx=Math.sin(a),sy=Math.cos(a),Ro=R+heightAt(x,y)+hObs;
  let best=-Math.acos((Ro-hObs)/Ro); // limite de esfera lisa pelo ponto do observador (além da cobertura do DEM); válido também abaixo da esfera de referência
  for(let d=stp;d<=maxKm;d+=stp){const px=x+sx*d,py=y+sy*d;
    if(Math.abs(px)>SIZE/2||Math.abs(py)>SIZE/2)break;
    const Rt=R+heightAt(px,py),t=d/R,e=Math.atan2(Rt*Math.cos(t)-Ro,Rt*Math.sin(t));
    if(e>best)best=e;}
  return best*180/Math.PI;}
function profile(x,y){const p=new Float32Array(360);for(let a=0;a<360;a++)p[a]=horizonAt(x,y,a,HOBS);return p;}
function interp(p,az){az=((az%360)+360)%360;const i=Math.floor(az),f=az-i;return p[i]*(1-f)+p[(i+1)%360]*f;}
// Modelo cinemático SIMULADO (não é efeméride)
function sunSim(t){return{az:((360*t/SYN)%360+360)%360,el:1.54*Math.sin(2*Math.PI*t/346.62+1.0)};}
function earthSim(t){return{az:((180+40*Math.sin(2*Math.PI*t/27.32))%360+360)%360,el:6*Math.sin(2*Math.PI*t/27.32+1.0)};}
const SEMI_SUN=.27,SEMI_EARTH=.95;
function state(el,hor,s){if(el-s>=hor)return 2;if(el+s<=hor)return 0;return 1;}
function series(p){const n=Math.ceil(SYN*24),S=new Uint8Array(n),E=new Uint8Array(n);
  for(let k=0;k<n;k++){const t=k/24,s=sunSim(t),e=earthSim(t);
    S[k]=state(s.el,interp(p,s.az),SEMI_SUN);E[k]=state(e.el,interp(p,e.az),SEMI_EARTH);}return{S,E};}
function metrics(S){let on=0,best=0,run=0,tr=0;for(let k=0;k<S.length;k++){const v=S[k]>0;if(v){on++;run++;best=Math.max(best,run);}else run=0;
  if(k>0&&(S[k]>0)!==(S[k-1]>0))tr++;}return{pct:100*on/S.length,longestH:best,transitions:tr};}

if(typeof module!=='undefined')module.exports={R,N,SIZE,DX,H,heightAt,horizonAt,profile,interp,sunSim,earthSim,state,series,metrics,SYN};
