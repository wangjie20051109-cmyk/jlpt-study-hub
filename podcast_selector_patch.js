window.applyPodcastSelectorPatch=function(h){
try{
 if(!h||h.includes('id="podcastEpisodeHub"'))return h;
 const css=`<style>
 #podcastEpisodeHub{margin:14px 0;padding:14px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(255,255,255,.04)}
 #podcastEpisodeHub .pe-head,#podcastEpisodeHub .pe-tools,#podcastEpisodeHub .pe-pagebar,#peActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
 #podcastEpisodeHub .pe-head{margin-bottom:10px}#podcastEpisodeHub select,#podcastEpisodeHub button{min-height:42px}
 #peEpisodes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:10px 0}
 #peEpisodes button{width:100%;min-width:0;padding:9px 3px;position:relative}
 #peEpisodes button.active{outline:2px solid currentColor;font-weight:800}
 #peEpisodes button.heard::after{content:'✓';position:absolute;right:5px;top:2px;font-size:11px}
 #peTitle{margin:12px 0 4px}#peMeta,#peStatus,#peProgress{font-size:13px;opacity:.8}
 #peJp,#peKana,#peZh{white-space:pre-wrap;line-height:1.95}
 #peKana,#peZh{display:none;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1)}
 #peActions{margin:12px 0}#peActions button{flex:1;min-width:118px}
 .pe-pagebar{justify-content:space-between;margin:8px 0 14px}.pe-pagebar button{min-width:88px}
 @media(max-width:560px){#peEpisodes{grid-template-columns:repeat(5,minmax(0,1fr))}#podcastEpisodeHub{padding:12px}#podcastEpisodeHub select{flex:1;min-width:110px}.pe-pagebar button{min-width:76px}}
 </style>`;
 h=h.replace('</head>',css+'</head>');
 const js=`<script data-podcast-selector="20260828-100">
 (function(){
  function hash(s){let h=0x811c9dc5;s=String(s||'').trim();for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)}return (h>>>0).toString(16).padStart(8,'0')}
  function init(){
   if(document.getElementById('podcastEpisodeHub')||typeof P==='undefined')return;
   var oldPlay=document.getElementById('pp');if(!oldPlay)return;
   var section=oldPlay.closest('section')||oldPlay.closest('.page')||oldPlay.parentElement;
   var oldCard=oldPlay.closest('.card');
   var hub=document.createElement('div');hub.id='podcastEpisodeHub';
   hub.innerHTML='<div class="pe-head"><b>🎙️ 播客选集</b><select id="peLevel"></select><select id="peCategory"></select></div><div class="pe-tools"><span id="peCount"></span><span id="peProgress"></span></div><div id="peEpisodes"></div><div class="pe-pagebar"><button type="button" id="pePrevPage">← 上一页</button><b id="pePageInfo"></b><button type="button" id="peNextPage">下一页 →</button></div><h2 id="peTitle"></h2><div id="peMeta"></div><div id="peJp"></div><div id="peActions"><button type="button" id="pePrev">← 上一篇</button><button type="button" id="pePlay">▶ 播放 MP3</button><button type="button" id="peNext">下一篇 →</button><button type="button" id="peKanaBtn">あ 平假名</button><button type="button" id="peZhBtn">中文翻译</button><button type="button" id="peHeard">✓ 标记已听</button></div><div id="peStatus">请选择一篇播客</div><div id="peKana"></div><div id="peZh"></div>';
   if(oldCard&&oldCard.parentNode&&oldCard!==section){oldCard.parentNode.insertBefore(hub,oldCard);oldCard.style.display='none'}
   else if(section)section.insertBefore(hub,section.firstChild);else document.body.appendChild(hub);

   var levels=['N4','N3','N2','N1','N5','生活'],levelSel=document.getElementById('peLevel'),catSel=document.getElementById('peCategory');
   levels.forEach(function(l){if(P.some(function(x){return x[0]===l})){var o=document.createElement('option');o.value=l;o.textContent=l;levelSel.appendChild(o)}});
   levelSel.value=[].some.call(levelSel.options,function(o){return o.value==='N3'})?'N3':levelSel.options[0].value;

   var page=0,current=null,currentFilteredIndex=0,playingKey='',PAGE=10;
   var heard={};try{heard=JSON.parse(localStorage.getItem('jlptPodcastHeardV2')||'{}')||{}}catch(e){}
   function saveHeard(){try{localStorage.setItem('jlptPodcastHeardV2',JSON.stringify(heard))}catch(e){}}
   function ekey(ep){return ep?(ep[7]||ep[0]+'-'+hash(ep[2])):''}
   function all(){return P.filter(function(x){return x[0]===levelSel.value})}
   function cats(){var out=['全部'];all().forEach(function(x){var c=x[6]||'综合';if(!out.includes(c))out.push(c)});return out}
   function filtered(){var c=catSel.value||'全部';return all().filter(function(x){return c==='全部'||(x[6]||'综合')===c})}
   function refreshCats(){
    var old=catSel.value;catSel.innerHTML='';cats().forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;catSel.appendChild(o)});
    catSel.value=[].some.call(catSel.options,function(o){return o.value===old})?old:'全部';
   }
   function globalNo(ep){return all().indexOf(ep)+1}
   function updateProgress(){
    var a=all(),n=a.filter(function(ep){return !!heard[ekey(ep)]}).length;
    document.getElementById('peProgress').textContent='已听 '+n+' / '+a.length;
   }
   function renderPage(){
    var f=filtered(),pages=Math.max(1,Math.ceil(f.length/PAGE));if(page>=pages)page=pages-1;if(page<0)page=0;
    var wrap=document.getElementById('peEpisodes');wrap.innerHTML='';
    var start=page*PAGE,end=Math.min(start+PAGE,f.length);
    for(let i=start;i<end;i++){(function(i){
      var ep=f[i],b=document.createElement('button');b.type='button';b.textContent=String(globalNo(ep));
      if(current===ep)b.classList.add('active');if(heard[ekey(ep)])b.classList.add('heard');
      b.onclick=function(){show(i)};wrap.appendChild(b);
    })(i)}
    document.getElementById('peCount').textContent='当前 '+f.length+' 篇 / 本等级 '+all().length+' 篇';
    document.getElementById('pePageInfo').textContent='第 '+(page+1)+' / '+pages+' 页';
    document.getElementById('pePrevPage').disabled=page<=0;document.getElementById('peNextPage').disabled=page>=pages-1;
    updateProgress();
   }
   function audioPath(ep){var hs=hash(ep&&ep[2]),path=window.STATIC_AUDIO_MANIFEST&&window.STATIC_AUDIO_MANIFEST[hs];return path||''}
   function updateHeardButton(){var b=document.getElementById('peHeard');if(!current)return;b.textContent=heard[ekey(current)]?'↩ 取消已听':'✓ 标记已听'}
   function show(i){
    var f=filtered();if(!f.length){current=null;renderPage();return}
    i=Math.max(0,Math.min(i,f.length-1));currentFilteredIndex=i;current=f[i];page=Math.floor(i/PAGE);
    var no=globalNo(current),path=audioPath(current);
    document.getElementById('peTitle').textContent=current[1]||('第 '+no+' 篇');
    document.getElementById('peMeta').textContent=levelSel.value+' · 第 '+no+' / '+all().length+' 篇 · '+(current[6]||'综合')+' · 真实 MP3';
    document.getElementById('peJp').textContent=current[2]||'';document.getElementById('peKana').textContent=current[3]||'';document.getElementById('peZh').textContent=current[4]||'';
    document.getElementById('peKana').style.display='none';document.getElementById('peZh').style.display='none';
    document.getElementById('peStatus').textContent=path?'✅ MP3 已就绪，可直接播放':'⏳ 这篇 MP3 正在生成/发布；不会退回系统朗读';
    updateHeardButton();renderPage();
   }
   function showFirst(){page=0;var f=filtered();if(f.length)show(0);else renderPage()}
   levelSel.onchange=function(){refreshCats();showFirst()};
   catSel.onchange=function(){showFirst()};
   document.getElementById('pePrevPage').onclick=function(){if(page>0){page--;show(page*PAGE)}};
   document.getElementById('peNextPage').onclick=function(){var f=filtered();if((page+1)*PAGE<f.length){page++;show(page*PAGE)}};
   document.getElementById('pePrev').onclick=function(){if(currentFilteredIndex>0)show(currentFilteredIndex-1)};
   document.getElementById('peNext').onclick=function(){var f=filtered();if(currentFilteredIndex<f.length-1)show(currentFilteredIndex+1)};
   document.getElementById('pePlay').onclick=function(){
    if(!current)return;var path=audioPath(current);
    if(!path){document.getElementById('peStatus').textContent='⏳ MP3 尚未发布完成，生成后刷新页面即可';return}
    playingKey=ekey(current);document.getElementById('peStatus').textContent='▶ 正在播放本站 MP3';
    if(typeof playBackgroundJapanese==='function')playBackgroundJapanese(current[2],.86,current[1]||'JLPT 长播客');
    else document.getElementById('peStatus').textContent='播放器尚未初始化，请刷新一次页面';
   };
   document.getElementById('peKanaBtn').onclick=function(){var p=document.getElementById('peKana');p.style.display=getComputedStyle(p).display==='none'?'block':'none'};
   document.getElementById('peZhBtn').onclick=function(){var p=document.getElementById('peZh');p.style.display=getComputedStyle(p).display==='none'?'block':'none'};
   document.getElementById('peHeard').onclick=function(){if(!current)return;var k=ekey(current);heard[k]=!heard[k];if(!heard[k])delete heard[k];saveHeard();updateHeardButton();renderPage()};

   refreshCats();showFirst();
   setTimeout(function(){
    var aud=document.getElementById('jlptBgAudio');if(aud&&!aud.dataset.peEnded){aud.dataset.peEnded='1';aud.addEventListener('ended',function(){if(playingKey){heard[playingKey]=true;saveHeard();playingKey='';updateHeardButton();renderPage()}})}
   },300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,100);setTimeout(init,700);
  try{new MutationObserver(function(){if(!document.getElementById('podcastEpisodeHub'))init()}).observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
 })();
 <\/script>`;
 return h.replace('</body>',js+'</body>');
}catch(e){return h}
};
