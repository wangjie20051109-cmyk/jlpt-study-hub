window.applyPodcastSelectorPatch=function(h){
try{
 if(!h||h.includes('id="podcastEpisodeHub"'))return h;
 const css=`<style>
 #podcastEpisodeHub{margin:14px 0;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.035)}
 #podcastEpisodeHub .pe-head{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
 #podcastEpisodeHub select,#podcastEpisodeHub button{min-height:42px}
 #peEpisodes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0 14px}
 #peEpisodes button{width:100%;min-width:0;padding:9px 4px}
 #peEpisodes button.active{outline:2px solid currentColor;font-weight:700}
 #peTitle{margin:8px 0 4px}
 #peMeta{font-size:13px;opacity:.72;margin-bottom:10px}
 #peJp,#peKana,#peZh{white-space:pre-wrap;line-height:1.9}
 #peKana,#peZh{display:none;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1)}
 #peStatus{font-size:13px;opacity:.85;margin:8px 0}
 #peActions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 @media(max-width:560px){#peEpisodes{grid-template-columns:repeat(4,minmax(0,1fr))}#podcastEpisodeHub{padding:12px}#peActions button{flex:1;min-width:120px}}
 </style>`;
 h=h.replace('</head>',css+'</head>');
 const js=`<script data-podcast-selector="20260828-1">
 (function(){
  function hash(s){let h=0x811c9dc5;s=String(s||'').trim();for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16).padStart(8,'0')}
  function init(){
   if(document.getElementById('podcastEpisodeHub')||!window.P)return;
   var oldPlay=document.getElementById('pp');
   if(!oldPlay)return;
   var section=oldPlay.closest('section')||oldPlay.closest('.page')||oldPlay.parentElement;
   var oldCard=oldPlay.closest('.card');
   var hub=document.createElement('div');
   hub.id='podcastEpisodeHub';
   hub.innerHTML='<div class="pe-head"><b>🎙️ 播客选集</b><select id="peLevel"></select><span id="peCount" style="opacity:.75"></span></div><div id="peEpisodes"></div><h2 id="peTitle"></h2><div id="peMeta"></div><div id="peJp"></div><div id="peActions"><button type="button" id="pePlay">▶ 播放 MP3</button><button type="button" id="peKanaBtn">あ 平假名</button><button type="button" id="peZhBtn">中文翻译</button></div><div id="peStatus">请选择一篇播客</div><div id="peKana"></div><div id="peZh"></div>';
   if(oldCard&&oldCard!==section){oldCard.parentNode.insertBefore(hub,oldCard);oldCard.style.display='none';}
   else if(section){section.insertBefore(hub,section.firstChild);}
   else document.body.appendChild(hub);
   var levels=['N5','N4','N3','N2','N1','生活'];
   var sel=document.getElementById('peLevel');levels.forEach(function(l){if(P.some(x=>x[0]===l)){var o=document.createElement('option');o.value=l;o.textContent=l;sel.appendChild(o)}});
   // 尽量沿用旧播客当前等级；找不到就优先 N3
   var initial='N3';try{var txt=(oldCard&&oldCard.textContent)||'';var f=levels.find(l=>txt.includes(l));if(f)initial=f}catch(e){}
   if([].some.call(sel.options,o=>o.value===initial))sel.value=initial;
   var current=null;
   function episodes(){return P.filter(x=>x[0]===sel.value).slice(0,8)}
   function renderTabs(active){
    var eps=episodes(),wrap=document.getElementById('peEpisodes');wrap.innerHTML='';
    document.getElementById('peCount').textContent='共 '+eps.length+' 篇';
    eps.forEach(function(ep,i){var b=document.createElement('button');b.type='button';b.textContent=String(i+1);if(i===active)b.className='active';b.onclick=function(){show(i)};wrap.appendChild(b)});
   }
   function show(i){
    var eps=episodes();if(!eps.length)return;current=eps[Math.max(0,Math.min(i,eps.length-1))];
    document.getElementById('peTitle').textContent=current[1]||('第 '+(i+1)+' 篇');
    document.getElementById('peMeta').textContent=sel.value+' · 第 '+(i+1)+' / '+eps.length+' 篇 · 真实 MP3';
    document.getElementById('peJp').textContent=current[2]||'';
    document.getElementById('peKana').textContent=current[3]||'';
    document.getElementById('peZh').textContent=current[4]||'';
    document.getElementById('peKana').style.display='none';document.getElementById('peZh').style.display='none';
    var hs=hash(current[2]),path=window.STATIC_AUDIO_MANIFEST&&window.STATIC_AUDIO_MANIFEST[hs];
    document.getElementById('peStatus').textContent=path?'✅ MP3 已就绪，可直接播放':'⏳ 这篇 MP3 正在生成/发布，不会回退成系统朗读';
    renderTabs(i);
   }
   sel.onchange=function(){show(0)};
   document.getElementById('pePlay').onclick=function(){
    if(!current)return;var hs=hash(current[2]),path=window.STATIC_AUDIO_MANIFEST&&window.STATIC_AUDIO_MANIFEST[hs];
    if(!path){document.getElementById('peStatus').textContent='⏳ MP3 还没发布完成，等生成结束后刷新即可';return;}
    document.getElementById('peStatus').textContent='▶ 正在播放本站 MP3';
    if(typeof window.playBackgroundJapanese==='function')window.playBackgroundJapanese(current[2],.86,current[1]||'JLPT 长播客');
    else if(typeof window.sp==='function')window.sp(current[2],.86);
   };
   document.getElementById('peKanaBtn').onclick=function(){var p=document.getElementById('peKana');p.style.display=getComputedStyle(p).display==='none'?'block':'none'};
   document.getElementById('peZhBtn').onclick=function(){var p=document.getElementById('peZh');p.style.display=getComputedStyle(p).display==='none'?'block':'none'};
   show(0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,100);setTimeout(init,700);
 })();
 <\/script>`;
 return h.replace('</body>',js+'</body>');
}catch(e){return h}
};
