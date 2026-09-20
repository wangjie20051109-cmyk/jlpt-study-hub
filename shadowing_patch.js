window.applyShadowingPatch=function(h){
try{
 if(!h||h.includes('id="shadowingHub"'))return h;
 const css=`<style>
 #shadowingHub{margin:16px 0;padding:14px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(255,255,255,.045)}
 #shadowingHub .sh-head,#shadowingHub .sh-tools,#shadowingHub .sh-actions,#shadowingHub .sh-progress{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
 #shadowingHub select,#shadowingHub button{min-height:42px}
 #shadowingHub .sh-sentence{font-size:20px;line-height:1.9;margin:14px 0;padding:14px;border-radius:14px;background:rgba(255,255,255,.05)}
 #shadowingHub .sh-kana,#shadowingHub .sh-zh{white-space:pre-wrap;line-height:1.85;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)}
 #shadowingHub .sh-hidden{filter:blur(7px);user-select:none}
 #shadowingHub .sh-actions button{flex:1;min-width:110px}
 #shadowingHub .sh-note{font-size:13px;opacity:.78;margin-top:10px}
 @media(max-width:560px){#shadowingHub{padding:12px}.sh-head select{flex:1}.sh-actions button{min-width:96px}}
 </style>`;
 h=h.replace('</head>',css+'</head>');
 const js=`<script data-shadowing="20260920-mvp">
 (function(){
  var ITEMS=[
   {l:'N3',scene:'日常',ja:'電車が遅れているので、少し遅れるかもしれません。',kana:'でんしゃが おくれているので、すこし おくれるかもしれません。',zh:'因为电车晚点了，我可能会稍微迟到。',point:'かもしれません｜可能、也许'},
   {l:'N3',scene:'学校',ja:'分からないところは、そのままにしないで先生に聞くようにしています。',kana:'わからない ところは、そのままに しないで せんせいに きくように しています。',zh:'不懂的地方，我会尽量不放着不管，而是去问老师。',point:'～ようにしています｜平时有意识地坚持'},
   {l:'N3',scene:'生活',ja:'日本に来てから、電車で移動することが多くなりました。',kana:'にほんに きてから、でんしゃで いどうすることが おおく なりました。',zh:'来到日本以后，坐电车出行的情况变多了。',point:'～ようになる／～くなる｜状态变化'},
   {l:'N3',scene:'买东西',ja:'使いやすそうなので、この黒いのにします。',kana:'つかいやすそうなので、この くろいのに します。',zh:'看起来很好用，所以我就选这个黑色的。',point:'～やすそう・～にします'},
   {l:'N3',scene:'打工',ja:'忙しい最中に電話がかかってきて、少し慌てました。',kana:'いそがしい さいちゅうに でんわが かかってきて、すこし あわてました。',zh:'正忙的时候来了电话，我有点慌。',point:'最中（さいちゅう）に｜正在……的时候'},
   {l:'N2',scene:'学校',ja:'進学するかどうかは、家族と相談した上で決めるつもりです。',kana:'しんがくするかどうかは、かぞくと そうだんした うえで きめる つもりです。',zh:'是否升学，我打算和家人商量之后再决定。',point:'～た上（うえ）で｜做完前项后再……'},
   {l:'N2',scene:'工作',ja:'新しい仕事を始めるにあたって、必要な手続きを確認しました。',kana:'あたらしい しごとを はじめるに あたって、ひつような てつづきを かくにんしました。',zh:'在开始新工作之际，我确认了必要的手续。',point:'～にあたって｜值此……之际'},
   {l:'N2',scene:'商业',ja:'市場の状況に応じて、販売方法を変える必要があります。',kana:'しじょうの じょうきょうに おうじて、はんばいほうほうを かえる ひつようが あります。',zh:'需要根据市场状况改变销售方式。',point:'～に応（おう）じて｜根据……'},
   {l:'N2',scene:'工作',ja:'失敗したからといって、すぐに諦める必要はありません。',kana:'しっぱいしたからといって、すぐに あきらめる ひつようは ありません。',zh:'不能因为失败了就马上放弃。',point:'～からといって｜不能仅因为……就……'},
   {l:'N2',scene:'生活',ja:'時間がないからこそ、優先順位を決めて行動したほうがいいと思います。',kana:'じかんが ないからこそ、ゆうせんじゅんいを きめて こうどうした ほうが いいと おもいます。',zh:'正因为没有时间，我觉得更应该确定优先顺序后行动。',point:'～からこそ｜正因为……才……'},
   {l:'N2',scene:'学校',ja:'試験を受ける以上は、最後までしっかり準備したいです。',kana:'しけんを うける いじょうは、さいごまで しっかり じゅんびしたいです。',zh:'既然要参加考试，就想认真准备到最后。',point:'～以上（いじょう）は｜既然……就……'},
   {l:'N2',scene:'日常',ja:'状況を確認しない限り、正しい判断はできません。',kana:'じょうきょうを かくにんしない かぎり、ただしい はんだんは できません。',zh:'除非确认情况，否则无法作出正确判断。',point:'～ない限（かぎ）り｜除非……否则……'}
  ];
  function init(){
   if(document.getElementById('shadowingHub'))return;
   var anchor=document.getElementById('podcastEpisodeHub');if(!anchor)return;
   var hub=document.createElement('div');hub.id='shadowingHub';
   hub.innerHTML='<div class="sh-head"><b>🎧 影子跟读 Shadowing</b><select id="shLevel"><option>N3</option><option>N2</option></select><select id="shScene"><option value="全部">全部场景</option></select></div><div class="sh-progress"><span id="shCount"></span><span id="shDone"></span></div><div id="shSentence" class="sh-sentence"></div><div id="shKana" class="sh-kana"></div><div id="shZh" class="sh-zh"></div><div id="shPoint" class="sh-note"></div><div class="sh-tools"><label>速度 <select id="shRate"><option value=".7">0.7×</option><option value=".8">0.8×</option><option value="1" selected>1.0×</option><option value="1.2">1.2×</option></select></label><label>停顿 <select id="shPause"><option value="1000">1秒</option><option value="2000" selected>2秒</option><option value="3000">3秒</option></select></label><label><input id="shHide" type="checkbox"> 隐藏原文</label><label><input id="shLoop" type="checkbox"> 自动循环</label></div><div class="sh-actions"><button id="shPrev">← 上一句</button><button id="shPlay">▶ 听原声</button><button id="shNext">下一句 →</button><button id="shMark">✓ 完成</button><button id="shKanaBtn">あ 假名</button><button id="shZhBtn">中文</button></div><div id="shStatus" class="sh-note">推荐：先只听 → 隐藏原文跟读 → 最后对照假名和中文。</div>';
   anchor.parentNode.insertBefore(hub,anchor);
   var level=document.getElementById('shLevel'),scene=document.getElementById('shScene'),idx=0,loopTimer=0;
   var done={};try{done=JSON.parse(localStorage.getItem('jlptShadowingDoneV1')||'{}')||{}}catch(e){}
   function key(x){return x.l+'|'+x.ja}
   function save(){try{localStorage.setItem('jlptShadowingDoneV1',JSON.stringify(done))}catch(e){}}
   function list(){return ITEMS.filter(function(x){return x.l===level.value&&(scene.value==='全部'||x.scene===scene.value)})}
   function scenes(){var old=scene.value;scene.innerHTML='<option value="全部">全部场景</option>';var a=[];ITEMS.filter(x=>x.l===level.value).forEach(x=>{if(!a.includes(x.scene))a.push(x.scene)});a.forEach(x=>{var o=document.createElement('option');o.value=x.scene;o.textContent=x.scene;scene.appendChild(o)});scene.value=a.includes(old)?old:'全部'}
   function current(){var a=list();if(!a.length)return null;idx=Math.max(0,Math.min(idx,a.length-1));return a[idx]}
   function render(){var x=current(),a=list();if(!x)return;document.getElementById('shSentence').textContent=x.ja;document.getElementById('shKana').textContent=x.kana;document.getElementById('shZh').textContent=x.zh;document.getElementById('shPoint').textContent='重点：'+x.point+' · '+x.scene;document.getElementById('shCount').textContent='第 '+(idx+1)+' / '+a.length+' 句';document.getElementById('shDone').textContent='已完成 '+a.filter(y=>done[key(y)]).length+' / '+a.length;document.getElementById('shMark').textContent=done[key(x)]?'↩ 取消完成':'✓ 完成';document.getElementById('shSentence').classList.toggle('sh-hidden',document.getElementById('shHide').checked)}
   function play(){var x=current();if(!x)return;clearTimeout(loopTimer);var rate=parseFloat(document.getElementById('shRate').value)||1;document.getElementById('shStatus').textContent='▶ 播放中：听完马上跟读，不要等中文翻译';if(typeof playBackgroundJapanese==='function')playBackgroundJapanese(x.ja,rate,'影子跟读 · '+x.l);else if(typeof sp==='function')sp(x.ja,rate);var aud=document.getElementById('jlptBgAudio');if(aud){aud.onended=function(){document.getElementById('shStatus').textContent='🗣️ 现在跟读！';if(document.getElementById('shLoop').checked)loopTimer=setTimeout(play,parseInt(document.getElementById('shPause').value)||2000)}}}
   level.onchange=function(){idx=0;scenes();render()};scene.onchange=function(){idx=0;render()};document.getElementById('shPrev').onclick=function(){idx=Math.max(0,idx-1);render()};document.getElementById('shNext').onclick=function(){idx=Math.min(list().length-1,idx+1);render()};document.getElementById('shPlay').onclick=play;document.getElementById('shHide').onchange=render;document.getElementById('shKanaBtn').onclick=function(){var e=document.getElementById('shKana');e.style.display=getComputedStyle(e).display==='none'?'block':'none'};document.getElementById('shZhBtn').onclick=function(){var e=document.getElementById('shZh');e.style.display=getComputedStyle(e).display==='none'?'block':'none'};document.getElementById('shMark').onclick=function(){var x=current(),k=key(x);done[k]=!done[k];if(!done[k])delete done[k];save();render()};
   scenes();document.getElementById('shKana').style.display='none';document.getElementById('shZh').style.display='none';render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();setTimeout(init,500);
 })();
 <\/script>`;
 return h.replace('</body>',js+'</body>');
}catch(e){return h}
};
