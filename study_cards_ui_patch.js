window.applyStudyCardsUiPatch=function(h){
try{
 if(!h||h.includes('data-studycards="1"'))return h;
 const css=`<style data-studycards="1">
#vocab,#grammar{--sc-bg:rgba(255,255,255,.045);--sc-line:rgba(255,255,255,.11);--sc-soft:rgba(255,255,255,.07)}
#vocab .card,#grammar .card{border-radius:24px!important;border:1px solid var(--sc-line)!important;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025))!important;box-shadow:0 18px 48px rgba(0,0,0,.18);overflow:hidden}
#vocab .study-word,#grammar .study-word,#gpat{font-size:clamp(28px,7vw,46px)!important;line-height:1.25!important;font-weight:850!important;letter-spacing:.02em;margin-top:8px!important}
#vocab .kana,#grammar .kana,#gpatk{font-size:15px!important;opacity:.72!important;letter-spacing:.04em}
#vocab .study-zh,#grammar .study-zh,#gzh{font-size:17px!important;line-height:1.65!important;margin-top:12px!important}
#vocab button,#grammar button{border-radius:14px!important;min-height:44px;touch-action:manipulation}
#vocab select,#grammar select,#vocab input,#grammar input{border-radius:12px!important;min-height:42px}
.sc-appbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:10px 12px;border:1px solid var(--sc-line);border-radius:16px;background:var(--sc-bg);backdrop-filter:blur(10px);position:sticky;top:6px;z-index:20}
.sc-appbar .sc-left{display:flex;align-items:center;gap:8px;min-width:0}.sc-appbar .sc-title{font-weight:800;white-space:nowrap}.sc-appbar .sc-sub{font-size:12px;opacity:.62;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-appbar .sc-actions{display:flex;gap:7px;flex-shrink:0}.sc-appbar button{min-height:34px!important;padding:6px 10px!important;font-size:12px!important;border:1px solid var(--sc-line)!important;background:var(--sc-soft)!important;color:inherit!important}
.sc-focus .sc-secondary{display:none!important}.sc-focus .card{max-width:720px;margin-left:auto!important;margin-right:auto!important}.sc-focus .study-word,.sc-focus #gpat{margin-top:28px!important;margin-bottom:18px!important}
.sc-hide-meaning .study-zh,.sc-hide-meaning #gzh,.sc-hide-meaning #gconn,.sc-hide-meaning #gexk,.sc-hide-meaning #gexz,.sc-hide-meaning #gtip{filter:blur(8px);opacity:.34;user-select:none}
.sc-hint{font-size:11px;opacity:.5;text-align:center;margin:8px 0 0}.sc-swipe-flash{animation:scFlash .22s ease}@keyframes scFlash{0%{transform:scale(1)}50%{transform:scale(.992)}100%{transform:scale(1)}}
@media(max-width:520px){#vocab .card,#grammar .card{border-radius:20px!important}.sc-appbar{top:4px;padding:9px 10px}.sc-appbar .sc-sub{display:none}.sc-appbar button{padding:6px 8px!important}.sc-hint{display:block}}
</style>`;
 const js=`<script data-studycards="1">(()=>{
const KEY='jlpt_study_card_ui_v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}};
function btnIn(sec,re){return [...sec.querySelectorAll('button')].find(b=>!b.closest('.sc-appbar')&&re.test((b.textContent||'').trim()))}
function addBar(id,title,sub){const sec=document.getElementById(id);if(!sec||sec.querySelector('.sc-appbar'))return;const st=load(),k=id;
 const bar=document.createElement('div');bar.className='sc-appbar';bar.innerHTML='<div class="sc-left"><span class="sc-title">'+title+'</span><span class="sc-sub">'+sub+'</span></div><div class="sc-actions"><button type="button" data-act="meaning">释义</button><button type="button" data-act="focus">专注</button></div>';
 sec.insertBefore(bar,sec.firstChild);const hint=document.createElement('div');hint.className='sc-hint';hint.textContent='手机左右滑动可切换上一条 / 下一条';const card=sec.querySelector('.card');if(card)card.appendChild(hint);
 if(st[k]&&st[k].focus)sec.classList.add('sc-focus');if(st[k]&&st[k].hideMeaning)sec.classList.add('sc-hide-meaning');
 function persist(){const all=load();all[k]={focus:sec.classList.contains('sc-focus'),hideMeaning:sec.classList.contains('sc-hide-meaning')};save(all)}
 bar.querySelector('[data-act="focus"]').onclick=()=>{sec.classList.toggle('sc-focus');persist()};
 bar.querySelector('[data-act="meaning"]').onclick=()=>{sec.classList.toggle('sc-hide-meaning');persist()};
 let sx=0,sy=0,active=false;sec.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('button,select,input,a'))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;active=true},{passive:true});
 sec.addEventListener('touchend',e=>{if(!active)return;active=false;const t=e.changedTouches&&e.changedTouches[0];if(!t)return;const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.3)return;const b=dx<0?btnIn(sec,/下一|下一个|下一词|next|→|›/i):btnIn(sec,/上一|上一个|上一词|prev|←|‹/i);if(b){try{b.click();const c=sec.querySelector('.card');if(c){c.classList.remove('sc-swipe-flash');void c.offsetWidth;c.classList.add('sc-swipe-flash')}}catch(err){}}},{passive:true});
}
function polish(){addBar('vocab','📚 单词卡片','每日随机 · 认识/模糊 · 间隔复习');addBar('grammar','🧩 语法卡片','核心精讲 · 完整语法库 · JLPT 分级')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish,{once:true});else polish();setTimeout(polish,350);setTimeout(polish,1200);
})();<\/script>`;
 h=h.replace('</head>',css+'</head>');h=h.replace('</body>',js+'</body>');return h;
}catch(e){return h}
};
