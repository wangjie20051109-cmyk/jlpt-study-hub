window.applyVocabRecognitionPatch=function(h){
  try{
    if(!h||h.includes('data-vrec="3"'))return h;
    const css=`<style data-vrec="3">
#vrecBox{margin:16px 0 6px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(255,255,255,.035);position:relative;z-index:5}
#vrecBox .vrec-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px;font-size:13px;opacity:.9;flex-wrap:wrap}
#vrecBox .vrec-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#vrecBox button{min-height:52px;border:0;border-radius:16px;font-weight:800;font-size:17px;cursor:pointer!important;pointer-events:auto!important;opacity:1!important;filter:none!important;touch-action:manipulation;position:relative;z-index:6}
#vrecBox button:disabled{opacity:1!important;pointer-events:auto!important;cursor:pointer!important}
#vrecKnown{background:#17a673!important;color:white!important}#vrecFuzzy{background:#f2b84b!important;color:#251b00!important}
#vrecBox .vrec-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#vrecBox .vrec-tools button{min-height:34px;padding:7px 12px;font-size:13px;background:rgba(255,255,255,.08)!important;color:inherit!important;border:1px solid rgba(255,255,255,.1)}
#vrecStatus{font-size:13px;opacity:.82}.vrec-pill{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);margin-right:5px;margin-bottom:4px}
#vrecList{display:none;margin-top:10px;max-height:240px;overflow:auto;border-top:1px solid rgba(255,255,255,.1);padding-top:8px;font-size:14px}
#vrecList.show{display:block}.vrec-row{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid rgba(255,255,255,.07)}
#vrecProgress{height:7px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-top:10px}#vrecProgress>i{display:block;height:100%;background:currentColor;width:0%}
@media(max-width:520px){#vrecBox{margin:12px 0;padding:12px}#vrecBox .vrec-actions{gap:8px}#vrecBox button{min-height:50px;font-size:16px}}
</style>`;
    const js=`<script data-vrec="3">(()=>{
const KEY='jlpt_vocab_recognition_v1',HIS='jlpt_vocab_recognition_history_v1';
const DAY=86400000;
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}};
const level=()=>{const e=document.getElementById('vlev');return e&&e.value?String(e.value):'ALL'};
function findWord(){const sec=document.getElementById('vocab');if(!sec)return '';
 const sel=['#vword','#vw','#vocab .study-word','#vocab .word-main','#vocab .word','#vocab h2','#vocab h3'];
 for(const s of sel){for(const e of document.querySelectorAll(s)){const t=(e.textContent||'').trim();if(t&&t.length<60&&/[ぁ-んァ-ヶ一-龯々]/.test(t)&&!/(单词|語彙|词汇|学习)/.test(t))return t}}
 return ''}
function keyOf(w){return level()+'|'+w}
function intervalFor(state,hits){if(state==='fuzzy')return hits<=1?10*60*1000:hits===2?6*60*60*1000:DAY;const ds=[3,7,14,30,60];return ds[Math.min(Math.max(hits-1,0),ds.length-1)]*DAY}
function stats(){const d=load(),now=Date.now();let known=0,fuzzy=0,due=0;Object.values(d).forEach(x=>{if(x.state==='known')known++;if(x.state==='fuzzy')fuzzy++;if((x.nextReview||0)<=now)due++});return {known,fuzzy,due,total:known+fuzzy}}
function ensureButtons(){['vrecKnown','vrecFuzzy','vrecUndo','vrecShow','vrecDue'].forEach(id=>{const b=document.getElementById(id);if(b){b.disabled=false;b.removeAttribute('disabled');b.style.pointerEvents='auto';b.style.opacity='1';}})}
function render(){const box=document.getElementById('vrecBox');if(!box)return;ensureButtons();const w=findWord(),d=load(),s=stats(),x=w?d[keyOf(w)]:null;
 document.getElementById('vrecStatus').innerHTML='<span class="vrec-pill">认识 '+s.known+'</span><span class="vrec-pill">模糊 '+s.fuzzy+'</span><span class="vrec-pill">到期 '+s.due+'</span>'+(x?'<span class="vrec-pill">当前：'+(x.state==='known'?'认识':'模糊')+'</span>':'');
 const p=document.querySelector('#vrecProgress>i');if(p)p.style.width=(s.total?Math.round(s.known/s.total*100):0)+'%';}
function next(){const sec=document.getElementById('vocab');if(!sec)return;let b=document.getElementById('vnext');if(!b){b=[...sec.querySelectorAll('button')].find(x=>/下一|下一个|下一词|next|→|›/i.test((x.textContent||'').trim()))}if(b){setTimeout(()=>{try{b.disabled=false;b.click()}catch(e){}},80)} }
function mark(state){const w=findWord();if(!w){const st=document.getElementById('vrecStatus');if(st)st.innerHTML='<span class="vrec-pill">词库仍在加载，请稍等一下再点</span>';return}const d=load(),k=keyOf(w),now=Date.now(),old=d[k]||{},hits=(old.hits||0)+1;d[k]={word:w,level:level(),state,hits,updatedAt:now,nextReview:now+intervalFor(state,hits)};save(d);
 try{localStorage.setItem(HIS,JSON.stringify({key:k,prev:old&&old.word?old:null,at:now}))}catch(e){};render();next()}
function undo(){try{const hist=JSON.parse(localStorage.getItem(HIS)||'null');if(!hist)return;const d=load();if(hist.prev)d[hist.key]=hist.prev;else delete d[hist.key];save(d);localStorage.removeItem(HIS);render()}catch(e){}}
function showList(mode){const el=document.getElementById('vrecList');if(!el)return;const d=load(),now=Date.now();let arr=Object.values(d);if(mode==='fuzzy')arr=arr.filter(x=>x.state==='fuzzy');else arr=arr.filter(x=>(x.nextReview||0)<=now);arr.sort((a,b)=>(a.nextReview||0)-(b.nextReview||0));el.innerHTML=arr.length?arr.slice(0,120).map(x=>'<div class="vrec-row"><span>'+x.word+'</span><span>'+x.level+' · '+(x.state==='known'?'认识':'模糊')+'</span></div>').join(''):'<div style="opacity:.7">这里暂时没有单词</div>';el.classList.add('show')}
function mount(){const sec=document.getElementById('vocab');if(!sec||document.getElementById('vrecBox')){ensureButtons();return}const box=document.createElement('div');box.id='vrecBox';box.innerHTML='<div class="vrec-head"><b>🧠 单词认识</b><span id="vrecStatus"></span></div><div class="vrec-actions"><button id="vrecFuzzy" type="button">😵‍💫 模糊</button><button id="vrecKnown" type="button">✅ 认识</button></div><div id="vrecProgress"><i></i></div><div class="vrec-tools"><button id="vrecUndo" type="button">撤销上一步</button><button id="vrecShow" type="button">查看模糊词</button><button id="vrecDue" type="button">今日到期复习</button></div><div id="vrecList"></div>';
 const card=sec.querySelector('.card')||sec;card.appendChild(box);ensureButtons();document.getElementById('vrecKnown').addEventListener('click',()=>mark('known'));document.getElementById('vrecFuzzy').addEventListener('click',()=>mark('fuzzy'));document.getElementById('vrecUndo').addEventListener('click',undo);document.getElementById('vrecShow').addEventListener('click',()=>showList('fuzzy'));document.getElementById('vrecDue').addEventListener('click',()=>showList('due'));render();
 const ob=new MutationObserver(()=>{ensureButtons();render()});ob.observe(sec,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','style','class']});const lv=document.getElementById('vlev');if(lv)lv.addEventListener('change',()=>setTimeout(render,120));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();setTimeout(mount,250);setTimeout(mount,900);
})();<\/script>`;
    h=h.replace('</head>',css+'</head>');
    h=h.replace('</body>',js+'</body>');
    return h;
  }catch(e){return h}
};
