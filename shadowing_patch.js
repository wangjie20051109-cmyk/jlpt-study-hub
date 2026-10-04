window.applyShadowingPatch=function(h){
try{
 if(!h||h.includes('data-shadowing="20261004-recorder"'))return h;
 const css=`<style>
 #shadowingHub{margin:16px 0;padding:15px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(255,255,255,.05)}
 #shadowingHub .sh-head,#shadowingHub .sh-tools,#shadowingHub .sh-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
 #shadowingHub .sh-sentence{font-size:21px;line-height:1.85;margin:14px 0;padding:15px;border-radius:14px;background:rgba(255,255,255,.06)}
 #shadowingHub .sh-sub{white-space:pre-wrap;line-height:1.8;margin:8px 0}
 #shadowingHub button,#shadowingHub select{min-height:42px}
 #shadowingHub .sh-actions button{flex:1;min-width:105px}
 #shadowingHub .sh-status{font-size:13px;opacity:.82;margin-top:10px}
 #shadowingHub .sh-hidden{filter:blur(7px);user-select:none}
 #shadowingHub .sh-rec{border:1px solid rgba(255,255,255,.14);padding:10px;border-radius:13px;margin-top:10px}
 #shadowingHub audio{width:100%;margin-top:8px}
 @media(max-width:560px){#shadowingHub{padding:12px}.sh-actions button{min-width:92px}.sh-head select{flex:1}}
 </style>`;
 h=h.replace('</head>',css+'</head>');
 const js=`<script data-shadowing="20261004-recorder">
 (function(){
  var ITEMS=[
   {l:'N3',scene:'日常',ja:'電車が遅れているので、少し遅れるかもしれません。',kana:'でんしゃが おくれているので、すこし おくれるかもしれません。',zh:'因为电车晚点了，我可能会稍微迟到。'},
   {l:'N3',scene:'学校',ja:'分からないところは、そのままにしないで先生に聞くようにしています。',kana:'わからない ところは、そのままに しないで せんせいに きくように しています。',zh:'不懂的地方，我会尽量不放着不管，而是去问老师。'},
   {l:'N3',scene:'打工',ja:'分からないまま作業を続けるより、先輩に確認したほうが安全です。',kana:'わからないまま さぎょうを つづけるより、せんぱいに かくにんした ほうが あんぜんです。',zh:'与其不懂还继续操作，不如向前辈确认更安全。'},
   {l:'N2',scene:'学校',ja:'進学するかどうかは、家族と相談した上で決めるつもりです。',kana:'しんがくするかどうかは、かぞくと そうだんした うえで きめる つもりです。',zh:'是否升学，我打算和家人商量之后再决定。'},
   {l:'N2',scene:'工作',ja:'新しい仕事を始めるにあたって、必要な手続きを確認しました。',kana:'あたらしい しごとを はじめるに あたって、ひつような てつづきを かくにんしました。',zh:'在开始新工作之际，我确认了必要的手续。'},
   {l:'N2',scene:'商业',ja:'市場の状況に応じて、販売方法を変える必要があります。',kana:'しじょうの じょうきょうに おうじて、はんばいほうほうを かえる ひつようが あります。',zh:'需要根据市场状况改变销售方式。'},
   {l:'N2',scene:'新闻',ja:'人口の減少に伴って、地域の公共交通にもさまざまな影響が出ています。',kana:'じんこうの げんしょうに ともなって、ちいきの こうきょうこうつうにも さまざまな えいきょうが でています。',zh:'随着人口减少，当地公共交通也受到各种影响。'},
   {l:'N2',scene:'生活',ja:'せっかく日本にいるのだから、間違いを恐れずに話してみようと思っています。',kana:'せっかく にほんに いるのだから、まちがいを おそれずに はなしてみようと おもっています。',zh:'难得人在日本，我想试着不怕犯错地开口说。'}
  ];
  function init(){
   if(document.getElementById('shadowingHub'))return;
   var anchor=document.getElementById('podcastEpisodeHub');if(!anchor)return;
   var hub=document.createElement('div');hub.id='shadowingHub';
   hub.innerHTML='<div class="sh-head"><b>🎙️ 影子跟读训练器</b><select id="shLevel"><option>N3</option><option selected>N2</option></select><select id="shScene"><option value="全部">全部场景</option></select></div><div id="shProgress" class="sh-status"></div><div id="shSentence" class="sh-sentence"></div><div id="shKana" class="sh-sub"></div><div id="shZh" class="sh-sub"></div><div class="sh-tools"><label>速度 <select id="shRate"><option value=".7">0.7×</option><option value=".85">0.85×</option><option value="1" selected>1.0×</option><option value="1.15">1.15×</option></select></label><label>循环 <select id="shRepeats"><option>1</option><option selected>3</option><option>5</option></select></label><label><input id="shHide" type="checkbox"> 隐藏原文</label></div><div class="sh-actions"><button id="shPrev">← 上一句</button><button id="shPlay">▶ 原声×3</button><button id="shNext">下一句 →</button></div><div class="sh-actions"><button id="shRecord">🎙️ 开始录音</button><button id="shPlayback" disabled>🔁 听我的录音</button><button id="shMark">✓ 完成</button></div><div class="sh-rec"><b>训练法</b>：①听原声 ②马上跟读 ③录下自己 ④回放和原声对比。<audio id="shMyAudio" controls style="display:none"></audio></div><div id="shStatus" class="sh-status">先听，不看中文；第二遍开始模仿节奏、停顿和语调。</div>';
   anchor.parentNode.insertBefore(hub,anchor);
   var level=document.getElementById('shLevel'),scene=document.getElementById('shScene'),idx=0,rec=null,chunks=[],url=null;
   var done={};try{done=JSON.parse(localStorage.getItem('jlptShadowingDoneV1')||'{}')||{}}catch(e){}
   function key(x){return x.l+'|'+x.ja}
   function save(){try{localStorage.setItem('jlptShadowingDoneV1',JSON.stringify(done))}catch(e){}}
   function list(){return ITEMS.filter(x=>x.l===level.value&&(scene.value==='全部'||x.scene===scene.value))}
   function scenes(){var old=scene.value,a=[];scene.innerHTML='<option value="全部">全部场景</option>';ITEMS.filter(x=>x.l===level.value).forEach(x=>{if(!a.includes(x.scene))a.push(x.scene)});a.forEach(x=>{var o=document.createElement('option');o.value=x;o.textContent=x;scene.appendChild(o)});scene.value=a.includes(old)?old:'全部'}
   function current(){var a=list();if(!a.length)return null;idx=Math.max(0,Math.min(idx,a.length-1));return a[idx]}
   function render(){var x=current(),a=list();if(!x)return;document.getElementById('shSentence').textContent=x.ja;document.getElementById('shKana').textContent='假名：'+x.kana;document.getElementById('shZh').textContent='中文：'+x.zh;document.getElementById('shProgress').textContent='第 '+(idx+1)+' / '+a.length+' 句 · 已完成 '+a.filter(y=>done[key(y)]).length+'/'+a.length;document.getElementById('shMark').textContent=done[key(x)]?'↩ 取消完成':'✓ 完成';document.getElementById('shSentence').classList.toggle('sh-hidden',document.getElementById('shHide').checked);document.getElementById('shPlay').textContent='▶ 原声×'+document.getElementById('shRepeats').value}
   function speakOnce(x,rate){return new Promise(resolve=>{if('speechSynthesis'in window){speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(x.ja);u.lang='ja-JP';u.rate=rate;u.onend=resolve;u.onerror=resolve;speechSynthesis.speak(u)}else{if(typeof sp==='function')sp(x.ja,rate);setTimeout(resolve,2500)}})}
   async function play(){var x=current();if(!x)return;var n=+document.getElementById('shRepeats').value||1,rate=+document.getElementById('shRate').value||1;document.getElementById('shStatus').textContent='🎧 听原声，然后紧跟着模仿';for(var i=0;i<n;i++){await speakOnce(x,rate);if(i<n-1)await new Promise(r=>setTimeout(r,700))}document.getElementById('shStatus').textContent='🗣️ 现在立刻跟读，再点录音对比'}
   async function toggleRecord(){var b=document.getElementById('shRecord');if(rec&&rec.state==='recording'){rec.stop();b.textContent='🎙️ 开始录音';return}try{var stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(stream);rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||'audio/webm'}));var a=document.getElementById('shMyAudio');a.src=url;a.style.display='block';document.getElementById('shPlayback').disabled=false;document.getElementById('shStatus').textContent='✅ 已录好。先听自己的，再播放原声比较。'};rec.start();b.textContent='⏹ 停止录音';document.getElementById('shStatus').textContent='🔴 正在录音…跟着刚才的节奏说'}catch(e){document.getElementById('shStatus').textContent='⚠️ 需要允许麦克风权限才能录音。'}}
   level.onchange=()=>{idx=0;scenes();render()};scene.onchange=()=>{idx=0;render()};document.getElementById('shPrev').onclick=()=>{idx=Math.max(0,idx-1);render()};document.getElementById('shNext').onclick=()=>{idx=Math.min(list().length-1,idx+1);render()};document.getElementById('shPlay').onclick=play;document.getElementById('shRepeats').onchange=render;document.getElementById('shHide').onchange=render;document.getElementById('shRecord').onclick=toggleRecord;document.getElementById('shPlayback').onclick=()=>document.getElementById('shMyAudio').play();document.getElementById('shMark').onclick=()=>{var x=current(),k=key(x);done[k]=!done[k];if(!done[k])delete done[k];save();render()};
   scenes();render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,500);
 })();
 <\/script>`;
 return h.replace('</body>',js+'</body>');
}catch(e){return h}
};