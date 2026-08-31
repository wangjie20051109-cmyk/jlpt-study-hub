window.applyVocabRecognitionPatch=function(h){
  try{
    if(!h||h.includes('data-vrec="1"'))return h;
    const css=`<style data-vrec="1">
#vrecBox{margin:16px 0 6px;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(255,255,255,.035)}
#vrecBox .vrec-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px;font-size:13px;opacity:.9;flex-wrap:wrap}
#vrecBox .vrec-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#vrecBox button{min-height:52px;border:0;border-radius:16px;font-weight:800;font-size:17px;cursor:pointer}
#vrecKnown{background:#17a673;color:white}#vrecFuzzy{background:#f2b84b;color:#251b00}
#vrecBox .vrec-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
#vrecBox .vrec-tools button{min-height:34px;padding:7px 12px;font-size:13px;background:rgba(255,255,255,.08);color:inherit;border:1px solid rgba(255,255,255,.1)}
#vrecStatus{font-size:13px;opacity:.82}.vrec-pill{display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.08);margin-right:5px}
#vrecList{display:none;margin-top:10px;max-height:220px;overflow:auto;border-top:1px solid rgba(255,255,255,.1);padding-top:8px;font-size:14px}
#vrecList.show{display:block}.vrec-row{display:flex;justify-content:space-between;gap:10px;padding:7px 2px;border-bottom:1px solid rgba(255,255,255,.07)}
@media(max-width:520px){#vrecBox{margin:12px 0;padding:12px}#vrecBox .vrec-actions{gap:8px}#vrecBox button{min-height:50px;font-size:16px}}
</style>`;
    const js=`<script data-vrec="1">(()=>{
const KEY='jlpt_vocab_recognition_v1',HIS='jlpt_vocab_recognition_history_v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}};
const level=()=>{const e=document.getElementById('vlev');return e&&e.value?String(e.value):'ALL'};
function findWord(){const sec=document.getElementById('vocab');if(!sec)return '';
 const sel=['#vword','#vw','#vocab .study-word','#vocab .word-main','#vocab .word','#vocab h2','#vocab h3'];
 for(const s of sel){for(const e of document.querySelectorAll(s)){const t=(e.textContent||'').trim();if(t&&t.length<60&&/[ぁ-んァ-ヶ一-龯々]/.test(t)&&!/(单词|語彙|词汇|学习)/.test(t))return t}}
 return ''}
function keyOf(w){return level()+'|'+w}
function stats(){const d=load();let known=0,fuzzy=0;Object.values(d).forEach(x=>{if(x.state==='known')known++;if(x.state==='fuzzy')fuzzy++});return {known,fuzzy}}
function render(){const box=document.getElementById('vrecBox');if(!box)return;const w=findWord(),d=load(),s=stats(),x=w?d[keyOf(w)]:null;
 document.getElementById('vrecStatus').innerHTML='<span class="vrec-pill">认识 '+s.known+'</span><span class="vrec-pill">模糊 '+s.fuzzy+'</span>'+(x?'<span class="vrec-pill">当前：'+(x.state==='known'?'认识':'模糊')+'</span>':'');}
function next(){const sec=document.getElementById('vocab');if(!sec)return;let b=document.getElementById('vnext');if(!b){b=[...sec.querySelectorAll('button')].find(x=>/下一|下一个|下一词|next|→|›/i.test((x.textContent||'').trim()))}if(b){setTimeout(()=>b.click(),80)} }
function mark(state){const w=findWord();if(!w)return;const d=load(),k=keyOf(w),now=Date.now(),old=d[k]||{};d[k]={word:w,level:level(),state,hits:(old.hits||0)+1,updatedAt:now,nextReview:state==='fuzzy'?now+86400000:now+7*86400000};save(d);
 try{localStorage.setItem(HIS,JSON.stringify({key:k,prev:old&&old.word?old:null,at:now}))}catch(e){};render();next()}
function undo(){try{const h=JSON.parse(localStorage.getItem(HIS)||'null');if(!h)return;const d=load();if(h.prev)d[h.key]=h.prev;else delete d[h.key];save(d);localStorage.removeItem(HIS);render()}catch(e){}}
function toggleList(){const el=document.getElementById('vrecList');if(!el)return;const d=load();const arr=Object.values(d).filter(x=>x.state==='fuzzy').sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));el.innerHTML=arr.length?arr.slice(0,100).map(x=>'<div class="vrec-row"><span>'+x.word+'</span><span>'+x.level+'</span></div>').join(''):'<div style="opacity:.7">还没有模糊词</div>';el.classList.toggle('show')}
function mount(){const sec=document.getElementById('vocab');if(!sec||document.getElementById('vrecBox'))return;const box=document.createElement('div');box.id='vrecBox';box.innerHTML='<div class="vrec-head"><b>🧠 单词认识</b><span id="vrecStatus"></span></div><div class="vrec-actions"><button id="vrecFuzzy" type="button">😵‍💫 模糊</button><button id="vrecKnown" type="button">✅ 认识</button></div><div class="vrec-tools"><button id="vrecUndo" type="button">撤销上一步</button><button id="vrecShow" type="button">查看模糊词</button></div><div id="vrecList"></div>';
 const card=sec.querySelector('.card')||sec;card.appendChild(box);document.getElementById('vrecKnown').onclick=()=>mark('known');document.getElementById('vrecFuzzy').onclick=()=>mark('fuzzy');document.getElementById('vrecUndo').onclick=undo;document.getElementById('vrecShow').onclick=toggleList;render();
 const ob=new MutationObserver(()=>render());ob.observe(sec,{subtree:true,childList:true,characterData:true});const lv=document.getElementById('vlev');if(lv)lv.addEventListener('change',()=>setTimeout(render,120));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();setTimeout(mount,400);
})();<\/script>`;
    h=h.replace('</head>',css+'</head>');
    h=h.replace('</body>',js+'</body>');
    return h;
  }catch(e){return h}
};
