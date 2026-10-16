/* JLPT listening studio. Original mock questions and shadowing from owned legacy modules.
 GitHub open examples from OpenJLPT/Tatoeba; attribution in listening-SOURCES.md.
 Device Japanese TTS is explicitly identified and NOT official JLPT/native recordings. */
(function(){
'use strict';
const $=id=>document.getElementById(id),html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const QUESTIONS=Array.isArray(window.JLPT_LISTENING_QUESTIONS)?window.JLPT_LISTENING_QUESTIONS:[];
const SHADOW=Array.isArray(window.JLPT_LISTENING_SHADOW)?window.JLPT_LISTENING_SHADOW:[];
const EXAMPLES=window.JLPT_WORD_EXAMPLES||{},MANIFEST=window.STATIC_AUDIO_MANIFEST||{};
const DATA={N2:window.JLPT_BULK_N2||[],N3:window.JLPT_BULK_N3||[]};
const AUDIOWORDKEY='jlptListening1000V1';let audioWordState=readWordState();let audioWordIndex=0,audioWordCurrent=null,audioWordAnswered=false;
function readWordState(){try{const s=JSON.parse(localStorage.getItem(AUDIOWORDKEY)||'{}');return {seen:Array.isArray(s.seen)?s.seen:[],wrong:Array.isArray(s.wrong)?s.wrong:[]}}catch(e){return {seen:[],wrong:[]}}}
const SEENKEY='jlptListeningExamSeenV1',WRONGKEY='jlptListeningExamWrongV1',DEEPKEY='jlptListeningDeepV1',SHADOWKEY='jlptListeningShadowV1';
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch(e){return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){$('audioStatus').textContent='当前浏览器无法保存数据，请检查存储权限。';return false}}
let seen=read(SEENKEY,[]),wrong=read(WRONGKEY,[]),deep=read(DEEPKEY,{}),shadowDone=read(SHADOWKEY,{});
if(!Array.isArray(seen))seen=[];if(!Array.isArray(wrong))wrong=[];if(!deep||typeof deep!=='object'||Array.isArray(deep))deep={};if(!shadowDone||typeof shadowDone!=='object'||Array.isArray(shadowDone))shadowDone={};
const unique=new Set(),sentences=[];
for(const [id,e] of Object.entries(EXAMPLES)){
 if(!/^n[23]-\d+$/.test(id)||!e?.ja)continue;
 const ja=e.ja.trim();if(!ja||unique.has(ja))continue;
 const level=id.startsWith('n2-')?'N2':'N3',num=+id.split('-')[1],record=DATA[level][num];
 if(!record)continue;
 unique.add(ja);
 sentences.push({id,level,ja,en:e.en||'',word:record[0],kana:record[1]});
}
sentences.sort((a,b)=>a.level.localeCompare(b.level)||a.id.localeCompare(b.id,undefined,{numeric:true}));
$('metricQuiz').textContent=QUESTIONS.length;$('metricShadow').textContent=SHADOW.length;$('metricSentences').textContent=sentences.length;
const explanation={
'n2-task-01':'先让部长确认内容，然后再打印资料，因此首先是把资料给部长看。',
'n2-point-01':'她强调“何より営業時間が長い”，最重要的原因是营业时间长，工作晚了也能去。',
'n2-main-01':'讲话者的重点是仅引入新工具不够，还必须重新审视工作流程。',
'n2-quick-01':'句子是在请求当天查看资料，自然的回应是表示会尽早确认。',
'n2-integrated-01':'必须同时满足上午去美术馆、车站附近午餐及16点前回酒店三项条件。',
'n3-task-01':'店员会拿来更小的尺码且颜色不变，所以接下来会试更小号的衬衫。',
'n3-point-01':'电车因为事故停运，需要换乘其他线路，因此会迟到。',
'n3-main-01':'讲话者建议先根据上下文推测，再查字典，而不是完全不用字典。',
'n3-speech-01':'向提前离开的同事打招呼，“お疲れさまでした”最自然。',
'n3-quick-01':'对方说明天可能请假，回应“这样啊，怎么了？”较自然。'
};
let currentTab='quiz',qi=0,cur=null,qAnswered=false,di=0,dc=null,dRevealed=false,si=0,sc=null;
const audio=$('nativeAudio');let playbackToken=0, utterance=null;
function audioLabel(s){$('audioStatus').textContent=s}
function rate(){return Number($('playbackRate').value)||1}
function stop(){playbackToken++;try{audio.pause();audio.currentTime=0;audio.onended=null;audio.onerror=null}catch(e){}try{speechSynthesis.cancel()}catch(e){}}
function fnv(text){let h=0x811c9dc5;const t=String(text||'').trim();for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,0x01000193)}return(h>>>0).toString(16).padStart(8,'0')}
function speak(text,times=1){
 stop();let token=playbackToken,done=0;const source=MANIFEST[fnv(text)];
 function run(){if(token!==playbackToken)return;
 if(done++>=times)return;
 if(source){audio.src=source;audio.playbackRate=rate();audio.onended=run;audio.onerror=()=>fallback();
 audioLabel('播放旧站已匹配的 MP3 素材，速度 '+rate()+'×');
 const p=audio.play();if(p&&typeof p.catch==='function')p.catch(()=>fallback());return}
 fallback();
 }
 function fallback(){
 if(token!==playbackToken)return;
 try{audio.pause();audio.onerror=null}catch(e){}
 if(!('speechSynthesis' in window)){audioLabel('没有可用的录音，且当前设备不支持日语语音合成');return}
 try{
 const u=new SpeechSynthesisUtterance(text);utterance=u;u.lang='ja-JP';u.rate=rate();u.pitch=1;
 const voices=speechSynthesis.getVoices().filter(x=>x.lang&&x.lang.toLowerCase().startsWith('ja'));if(voices.length)u.voice=voices[0];
 u.onend=()=>{if(token===playbackToken)run()};
 u.onerror=()=>{if(token===playbackToken)audioLabel('语音朗读出错，请检查浏览器日语语音包后重试')};
 audioLabel('设备日语语音合成（非真人录音、非官方真题） · '+rate()+'×');
 speechSynthesis.speak(u)
 }catch(e){audioLabel('语音朗读不可用：'+String(e?.message||e))}
 }
 run();
}
function switchTab(tab){
 if(!['quiz','dictation','shadow','sources'].includes(tab))return;stop();currentTab=tab;
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));
 for(const id of ['quiz','dictation','shadow','sources'])$('pane-'+id).classList.toggle('hidden',id!==tab);
}
document.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>switchTab(btn.dataset.tab));
function quizPool(){
 return QUESTIONS.filter(x=>x.l===$('quizLevel').value&&($('quizType').value==='all'||x.t===$('quizType').value)&&(!$('quizWrongOnly').checked||wrong.includes(x.id)));
}
function setQuizTypes(){
 const level=$('quizLevel').value,types=[...new Set(QUESTIONS.filter(x=>x.l===level).map(x=>x.t))];
 $('quizType').innerHTML='<option value="all">全部题型</option>'+types.map(x=>'<option value="'+html(x)+'">'+html(x)+'</option>').join('');
}
function renderQuiz(){
 stop();const pool=quizPool();
 if(!pool.length){cur=null;$('quizAsk').textContent='这个筛选条件下没有题目或错题，请调整筛选。';$('quizOpts').innerHTML='';$('quizProgress').textContent='暂无匹配的题目';$('quizBar').style.width='0%';$('quizAnswer').classList.add('hidden');$('quizPlay').disabled=true;$('quizNext').disabled=true;return}
 $('quizPlay').disabled=false;$('quizNext').disabled=false;
 qi=(qi%pool.length+pool.length)%pool.length;cur=pool[qi];qAnswered=false;
 const count=pool.filter(x=>seen.includes(x.id)).length;
 $('quizProgress').textContent=cur.l+' · '+cur.t+' · 题目 '+(qi+1)+' / '+pool.length+' · 历史已做 '+count+' · 待复习错题 '+wrong.length;
 $('quizBar').style.width=((qi+1)/pool.length*100)+'%';
 $('quizAsk').textContent=cur.ask;
 $('quizOpts').innerHTML=cur.opts.map((opt,i)=>'<button class="opt" data-choice="'+i+'"><span>'+(i+1)+'</span>'+html(opt)+'</button>').join('');
 $('quizOpts').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>answerQuiz(+b.dataset.choice));
 $('quizAnswer').classList.add('hidden');$('quizAnswer').innerHTML='';
}
function answerQuiz(chosen){
 if(qAnswered||!cur)return;qAnswered=true;stop();
 $('quizOpts').querySelectorAll('[data-choice]').forEach(b=>{const i=+b.dataset.choice;b.disabled=true;if(i===cur.a)b.classList.add('ok');else if(i===chosen)b.classList.add('no')});
 if(!seen.includes(cur.id))seen.push(cur.id);
 if(chosen===cur.a)wrong=wrong.filter(x=>x!==cur.id);else if(!wrong.includes(cur.id))wrong.push(cur.id);
 save(SEENKEY,seen);save(WRONGKEY,wrong);
 const full=cur.text.replace(/(女：|男：)/g,'\n$1').trim();
 const reasons=cur.opts.map((v,i)=>'<div class="annotation">'+(i===cur.a?'✓':'✕')+' '+(i+1)+'. '+html(v)+'<div class="mini">'+(i===cur.a?'符合对话中的决定或关键信息。':'不符合原文的关键时间、原因、人物或主要结论，请对照原句排除。')+'</div></div>').join('');
 $('quizAnswer').innerHTML='<h3>'+(chosen===cur.a?'✓ 回答正确':'✕ 回答错误')+'</h3><p><b>正确答案：'+(cur.a+1)+'. '+html(cur.opts[cur.a])+'</b></p><h3>完整听力原文</h3><div class="jp-script">'+html(full)+'</div><h3>中文解析</h3><div class="annotation">'+html(explanation[cur.id]||cur.why)+'</div><h3>日语解析</h3><div class="annotation">'+html(cur.why)+'</div><h3>全部选项</h3>'+reasons;
 $('quizAnswer').classList.remove('hidden');
 $('quizAnswer').scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('quizLevel').onchange=()=>{setQuizTypes();qi=0;renderQuiz()};
$('quizType').onchange=()=>{qi=0;renderQuiz()};
$('quizWrongOnly').onchange=()=>{qi=0;renderQuiz()};
$('quizPlay').onclick=()=>cur&&speak(cur.text);
$('quizReplay').onclick=()=>cur&&speak(cur.text);
$('quizStop').onclick=stop;
$('quizNext').onclick=()=>{qi++;renderQuiz()};
function dictPool(){return sentences.filter(x=>x.level===$('dictLevel').value&&(!$('dictWrong').checked||deep[x.id]?.status==='missed'))}
function renderDict(){
 stop();const pool=dictPool();
 if(!pool.length){dc=null;$('dictMeta').textContent='此等级暂无匹配短句。关闭错题筛选或换一个等级。';$('dictQuestion').textContent='目前没有待复习短句';$('dictInput').value='';$('dictPlay').disabled=true;$('dictReveal').disabled=true;$('dictAnswer').classList.add('hidden');$('dictRating').classList.add('hidden');return}
 $('dictPlay').disabled=false;$('dictReveal').disabled=false;
 di=(di%pool.length+pool.length)%pool.length;dc=pool[di];dRevealed=false;
 const count=pool.filter(x=>deep[x.id]?.status).length;
 $('dictMeta').textContent=dc.level+' · 第 '+(di+1)+' / '+pool.length+' 句 · 已自评 '+count+' 条';
 $('dictBar').style.width=((di+1)/pool.length*100)+'%';
 $('dictQuestion').textContent='先听一遍。注意短句中的语法、词尾、连读和否定表达。';
 $('dictInput').value='';$('dictAnswer').classList.add('hidden');$('dictRating').classList.add('hidden');
}
function revealDict(){
 if(!dc)return;dRevealed=true;
 const target=dc.word,txt=dc.ja;
 const n=txt.indexOf(target);
 let sentence=html(txt);
 if(n>=0)sentence=html(txt.slice(0,n))+'<ruby>'+html(target)+'<rt>'+html(dc.kana)+'</rt></ruby>'+html(txt.slice(n+target.length));
 $('dictAnswer').innerHTML='<h3>完整日语原文</h3><div class="jp-script">'+sentence+'</div><div class="annotation"><b>重点词汇：</b>'+html(dc.word)+'（'+html(dc.kana)+'）</div><p class="translation"><b>英文对照：</b>'+html(dc.en||'原始数据暂无译文')+'</p><p class="mini">这批开源材料并非所有汉字都配有完整假名。对照你写下的内容，判断是否听懂。</p>';
 $('dictAnswer').classList.remove('hidden');$('dictRating').classList.remove('hidden');
}
function markDict(status){
 if(!dc||!dRevealed)return;
 deep[dc.id]={status,updatedAt:Date.now(),typed:$('dictInput').value.slice(0,700)};
 save(DEEPKEY,deep);di++;renderDict();
}
$('dictLevel').onchange=()=>{di=0;renderDict()};
$('dictWrong').onchange=()=>{di=0;renderDict()};
$('dictPlay').onclick=()=>dc&&speak(dc.ja);
$('dictRepeat').onclick=()=>dc&&speak(dc.ja);
$('dictStop').onclick=stop;
$('dictReveal').onclick=revealDict;$('dictMissed').onclick=()=>markDict('missed');$('dictKnown').onclick=()=>markDict('known');
function shadowPool(){return SHADOW.filter(x=>x.l===$('shadowLevel').value&&($('shadowScene').value==='all'||x.scene===$('shadowScene').value))}
function shadowTypes(){
 const scenes=[...new Set(SHADOW.filter(x=>x.l===$('shadowLevel').value).map(x=>x.scene))];
 $('shadowScene').innerHTML='<option value="all">全部场景</option>'+scenes.map(x=>'<option value="'+html(x)+'">'+html(x)+'</option>').join('');
}
function renderShadow(){
 stop();const pool=shadowPool();if(!pool.length){sc=null;$('shadowScript').textContent='暂无适合的跟读材料';$('shadowPrev').disabled=true;$('shadowNext').disabled=true;return}
 si=(si%pool.length+pool.length)%pool.length;sc=pool[si];
 $('shadowScript').textContent=$('shadowHide').checked?'（已隐藏原文，听完后取消勾选查看）':sc.ja;
 $('shadowKana').textContent='平假名：'+sc.kana;
 $('shadowZh').textContent=sc.zh;
 $('shadowTip').textContent='听力／语法提醒：'+sc.tip;
 $('shadowMeta').textContent=sc.l+' · '+sc.scene+' · '+(si+1)+' / '+pool.length+' · 练习次数 '+(shadowDone[sc.id]||0);
 $('shadowPrev').disabled=si===0;$('shadowNext').disabled=si===pool.length-1;
}
$('shadowLevel').onchange=()=>{si=0;shadowTypes();renderShadow()};
$('shadowScene').onchange=()=>{si=0;renderShadow()};
$('shadowHide').onchange=()=>{if(sc)$('shadowScript').textContent=$('shadowHide').checked?'（已隐藏原文，听完后取消勾选查看）':sc.ja};
$('shadowPlay').onclick=()=>sc&&speak(sc.ja);
$('shadowLoop').onclick=()=>sc&&speak(sc.ja,3);
$('shadowStop').onclick=stop;
$('shadowPrev').onclick=()=>{si=Math.max(0,si-1);renderShadow()};
$('shadowNext').onclick=()=>{si++;renderShadow()};
$('shadowDone').onclick=()=>{if(!sc)return;shadowDone[sc.id]=(shadowDone[sc.id]||0)+1;save(SHADOWKEY,shadowDone);if(si<shadowPool().length-1)si++;renderShadow()};
$('resetListening').onclick=()=>{
 if(!confirm('只清除新精听短句的自评和输入记录吗？旧站考试错题与跟读记录不会受影响。'))return;
 deep={};save(DEEPKEY,deep);di=0;renderDict();audioLabel('已清除新精听记录。原有听力错题及其他学习进度未改动。');
};

function wordKey(level,index){return level+'-'+index}
function wordPool(){
 const level=$('wordListenLevel').value;
 return DATA[level].map((row,index)=>({level,index,row,id:wordKey(level,index)}))
 .filter(x=>!$('wordListenWrong').checked||audioWordState.wrong.includes(x.id));
}
function renderWord(){
 stop();const pool=wordPool();$('wordListenNext').disabled=!pool.length;$('wordListenPlay').disabled=!pool.length;
 if(!pool.length){audioWordCurrent=null;$('wordListenOpts').innerHTML='';$('wordListenAnswer').classList.add('hidden');$('wordListenProgress').textContent='暂无错题。关闭“只练错题”继续练习。';$('wordListenBar').style.width='0%';return}
 audioWordIndex=(audioWordIndex%pool.length+pool.length)%pool.length;audioWordCurrent=pool[audioWordIndex];audioWordAnswered=false;
 const x=audioWordCurrent,idxs=Array.isArray(x.row[4])?x.row[4]:[];
 let candidates=[x.index,...idxs.filter(i=>Number.isInteger(i)&&i>=0&&i<DATA[x.level].length&&i!==x.index)];
 candidates=[...new Set(candidates)].slice(0,4);
 for(let n=1;candidates.length<4&&n<DATA[x.level].length;n++){const i=(x.index+n*37)%DATA[x.level].length;if(!candidates.includes(i))candidates.push(i)}
 // Stable deterministic rotation prevents always presenting the answer first.
 candidates=candidates.slice(1).concat(candidates[0]);
 $('wordListenOpts').innerHTML=candidates.map((idx,i)=>'<button class="opt" data-wordchoice="'+idx+'"><span>'+(i+1)+'</span>'+html(DATA[x.level][idx][0])+'</button>').join('');
 $('wordListenOpts').querySelectorAll('[data-wordchoice]').forEach(b=>b.onclick=()=>answerWord(+b.dataset.wordchoice));
 $('wordListenAnswer').classList.add('hidden');
 $('wordListenProgress').textContent=x.level+' · '+(audioWordIndex+1)+' / '+pool.length+' · 已练 '+audioWordState.seen.length+' / 1000 · 错题 '+audioWordState.wrong.length;
 $('wordListenBar').style.width=((audioWordIndex+1)/pool.length*100)+'%';
}
function answerWord(chosen){
 if(!audioWordCurrent||audioWordAnswered)return;
 audioWordAnswered=true;stop();
 const x=audioWordCurrent,correct=chosen===x.index;
 if(!audioWordState.seen.includes(x.id))audioWordState.seen.push(x.id);
 audioWordState.wrong=audioWordState.wrong.filter(id=>id!==x.id);
 if(!correct)audioWordState.wrong.push(x.id);
 save(AUDIOWORDKEY,audioWordState);
 $('wordListenOpts').querySelectorAll('[data-wordchoice]').forEach(b=>{b.disabled=true;if(+b.dataset.wordchoice===x.index)b.classList.add('ok');else if(+b.dataset.wordchoice===chosen)b.classList.add('no')});
 $('wordListenAnswer').innerHTML='<h3>'+(correct?'✓ 听对了':'✕ 需要复习')+'</h3><div class="jp-script">'+html(x.row[0])+'（'+html(x.row[1])+'）</div><p class="translation">英文释义：'+html(x.row[2])+'</p><p class="mini">本题为听音辨词练习，发音来源与设备语音包有关。</p>';
 $('wordListenAnswer').classList.remove('hidden');
}
$('wordListenLevel').onchange=()=>{audioWordIndex=0;renderWord()};
$('wordListenWrong').onchange=()=>{audioWordIndex=0;renderWord()};
$('wordListenPlay').onclick=()=>audioWordCurrent&&speak(audioWordCurrent.row[1]||audioWordCurrent.row[0]);
$('wordListenStop').onclick=stop;
$('wordListenNext').onclick=()=>{audioWordIndex++;renderWord()};

window.addEventListener('beforeunload',stop);
setQuizTypes();renderQuiz();renderDict();shadowTypes();renderShadow();renderWord();
const page=new URLSearchParams(location.search).get('tab');
if(['quiz','dictation','shadow','sources'].includes(page))switchTab(page);
})();