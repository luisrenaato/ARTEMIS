const c=require('../js/core.js');let ok=0,bad=0;
function T(n,cond,info){console.log((cond?'PASS ':'FAIL ')+n+(info?'  '+info:''));cond?ok++:bad++;}
// 1. curvatura: ponto longe de qualquer relevo (canto plano?) -> horizonte >= dip liso; compara em um azimute que sai do DEM quase imediatamente
const zc=c.heightAt(c.SIZE/2-1e-6,c.SIZE/2-1e-6);const dip=-Math.acos((c.R+zc)/(c.R+zc+0.002))*180/Math.PI;
// ponto no canto NE olhando para NE: sai do DEM no 1o passo
const e=c.horizonAt(c.SIZE/2-1e-6,c.SIZE/2-1e-6,45,0.002);
T('dip analítico (sem terreno) = -acos(R/(R+h))',Math.abs(e-dip)<1e-3,`got ${e.toFixed(5)} esperado ${dip.toFixed(5)}`);
// 2. convenção de azimute: a massa (pico em x=12,y=-5) vista de (3,-5) está a LESTE (az 90) -> horizonte em 90 > em 270
const p=c.profile(3,-5);T('azimute 90° = Leste (pico a leste)',p[90]>p[270]+1,`h90=${p[90].toFixed(2)} h270=${p[270].toFixed(2)}`);
// 3. norte: crateras em (-6,5): de (-6,-5) olhando N (az 0) deve ver borda; compara N vs S
const q=c.profile(-6,-5);T('azimute 0° = Norte',q[0]>q[180],`h0=${q[0].toFixed(2)} h180=${q[180].toFixed(2)}`);
// 4. geometria analítica: obstáculo conhecido. DEM sintético: pico gaussiano 2.2 km; verifica atan(Δh/d) em pequena distância ~ coerência
const x0=3,y0=-5,d=9,zt=c.heightAt(12,-5),zo=c.heightAt(x0,y0)+0.002;
const ang=Math.atan2((c.R+zt)*Math.cos(d/c.R)-(c.R+zo),(c.R+zt)*Math.sin(d/c.R))*180/Math.PI;
const simple=Math.atan((zt-zo)/d)*180/Math.PI;
const curv=d/(2*c.R)*180/Math.PI;T('atan2 esférico = plano − d/(2R) a 9 km (±0.02°; 2ª ordem: raio do alvo)',Math.abs((simple-ang)-curv)<0.02,`esf=${ang.toFixed(3)} plano=${simple.toFixed(3)} curvatura esperada=${curv.toFixed(3)}`);
T('horizonte >= ângulo do pico isolado',p[90]>=ang-0.2,`h90=${p[90].toFixed(3)} pico=${ang.toFixed(3)}`);
// 5. interpolação periódica
T('interp 359.5 entre p[359] e p[0]',Math.abs(c.interp(p,359.5)-(p[359]+p[0])/2)<1e-6);
// 6. estados
T('estado: ON/PARCIAL/OFF',c.state(5,0,.27)===2&&c.state(0.1,0,.27)===1&&c.state(-1,0,.27)===0);
// 7. periodicidade do Sol simulado
const s0=c.sunSim(0),s1=c.sunSim(c.SYN);T('azimute solar periódico em 29,530589 d',Math.abs(((s1.az-s0.az+540)%360)-180)<1e-6);
// 8. resultado dos sítios
const S=[[-6,5],[12,-5],[3,5]].map(([x,y])=>{const pr=c.profile(x,y),r=c.series(pr),m=c.metrics(r.S),me=c.metrics(r.E);return{x,y,max:Math.max(...pr).toFixed(2),min:Math.min(...pr).toFixed(2),sun:m.pct.toFixed(1),longest:m.longestH,tr:m.transitions,earth:me.pct.toFixed(1)}});
console.table(S);
T('piso da cratera: menos Sol que o pico',+S[0].sun<+S[1].sun);
T('piso da cratera: horizonte mínimo > 1.54° (Sol sintético nunca visível)',+S[0].min>1.54&&+S[0].sun==0,`min=${S[0].min} sun=${S[0].sun}%`);T('sem NaN nos perfis',S.every(r=>r.max!=='NaN'));
// 9. performance
let t0=Date.now();for(let i=0;i<2;i++)for(let j=0;j<c.N;j++)for(let k=0;k<c.N;k++)c.horizonAt(-20+k*c.DX,-20+j*c.DX,100,0);
console.log('2 atualizações de sombra (96x96):',Date.now()-t0,'ms');
console.log(`${ok} ok, ${bad} falhas`);process.exit(bad?1:0);
