// ARTEMIS — mostrar/ocultar painéis e ajustes de layout para celular. Não altera a lógica do app.
(function(){
const mob=()=>matchMedia('(max-width:700px)').matches;
const P={L:$('left'),R:$('right'),B:$('bot')},T={L:$('tgL'),R:$('tgR'),B:$('tgB')},A=$('tgA'),root=document.documentElement.style;
const st=mob()?{L:false,R:true,B:true}:{L:true,R:true,B:true};let saved=null;
function layout(){root.setProperty('--th',$('top').offsetHeight+'px');root.setProperty('--bh',P.B.offsetHeight+'px');}
function apply(){for(const k in P){P[k].classList.toggle('hide',!st[k]);T[k].setAttribute('aria-pressed',st[k]);}
  document.body.classList.toggle('globe',globe);
  A.setAttribute('aria-pressed',!(st.L||st.R||st.B));layout();}
function toggle(k){st[k]=!st[k];if(mob()&&st[k]&&(k==='L'||k==='R'))st[k==='L'?'R':'L']=false;apply();}
for(const k in T)T[k].onclick=()=>toggle(k);
A.onclick=()=>{if(st.L||st.R||st.B){saved={...st};st.L=st.R=st.B=false;}else Object.assign(st,saved||{L:!mob(),R:true,B:true});apply();};
const _s=setMode;setMode=function(m){_s(m);apply();};
if(window.ResizeObserver){const ro=new ResizeObserver(layout);ro.observe($('top'));ro.observe(P.B);}
addEventListener('resize',layout);apply();
})();
