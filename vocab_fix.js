window.applyVocabFix=function(h){
  try{
    const fix=`<script>(function(){
function safeVocabRender(){
 try{
  if(typeof vrender==='function'){try{vrender()}catch(e){}}
  var jp=document.getElementById('vjp');
  if(!jp||String(jp.textContent||'').trim())return;
  if(typeof V_BASE==='undefined'||!Array.isArray(V_BASE)||!V_BASE.length)return;
  var lv=(document.getElementById('vlev')&&document.getElementById('vlev').value)||'N2';
  var pool=V_BASE.filter(function(x){return x&&x[0]===lv});
  if(!pool.length)pool=V_BASE;
  window.__safeVi=(window.__safeVi||0)%pool.length;
  var x=pool[window.__safeVi];
  function set(id,t){var el=document.getElementById(id);if(el)el.textContent=t||''}
  set('vl',x[0]);set('vscene',x[1]);set('vpos',x[5]);set('vjp',x[2]);set('vkana','平假名：'+x[3]);set('vzh','中文：'+x[4]);set('vex',x[6]||x[2]);set('vexk',x[7]?'平假名：'+x[7]:'');set('vexz',x[8]?'中文：'+x[8]:'');set('vcount',String(pool.length));
 }catch(e){}
}
function bindSafeVocab(){
 var next=document.getElementById('vnext'),prev=document.getElementById('vprev'),lev=document.getElementById('vlev');
 function fallbackStep(d){
  try{if(typeof vrender==='function'){vi+=d;vrender();if(document.getElementById('vjp')&&document.getElementById('vjp').textContent.trim())return}}catch(e){}
  window.__safeVi=(window.__safeVi||0)+d;var jp=document.getElementById('vjp');if(jp)jp.textContent='';safeVocabRender();
 }
 if(next)next.addEventListener('click',function(){setTimeout(function(){if(!document.getElementById('vjp').textContent.trim())fallbackStep(1)},0)});
 if(prev)prev.addEventListener('click',function(){setTimeout(function(){if(!document.getElementById('vjp').textContent.trim())fallbackStep(-1)},0)});
 if(lev)lev.addEventListener('change',function(){window.__safeVi=0;setTimeout(safeVocabRender,80)});
}
setTimeout(function(){safeVocabRender();bindSafeVocab()},0);
setTimeout(safeVocabRender,500);
setTimeout(safeVocabRender,1800);
})();<\/script>`;
    if(!h.includes('safeVocabRender'))h=h.replace('</body>',fix+'</body>');
    return h;
  }catch(e){return h}
};
