/* Standalone vocabulary learning website powered by the existing 1000-item MIT dataset. */
(function(){
'use strict';
const H=window.JLPT_SITE,KEY='jlptWordsModuleV1',MS=86400000,all=H.vocab(),$=id=>document.getElementById(id);
let db=H.read(KEY,{items:{},days:{}}),level='N2',filter='all',shown=30,queue=[],current=null,mode='new',detail=null;
if(!db||typeof db!=='object')db={items:{},days:{}};
db.items=db.items||{};db.days=db.days||{};
const get=id=>db.items[id]||{},today=()=>H.day(),group=()=>all.filter(w=>w.level===level);
function save(){H.write(KEY,db);summary()}
function hasDue(w){const x=get(w.id);return !!x.seen&&(x.nextReview||0)<=Date.now()}
function summary(){
 const arr=group(),seen=arr.filter(x=>get(x.id).seen),master=arr.filter(x=>get(x.id).mastered),due=arr.filter(hasDue);
 $('learned').textContent=seen.length;$('mastered').textContent=master.length;$('due').textContent=due.length;$('dueCount').textContent=due.length;
 $('learnBar').style.width=(master.length/arr.length*100||0)+'%';$('bookName').textContent=level+' 核心词汇';$('bookSize').textContent=arr.length+'词 · 开源词汇训练';
 $('setN2').classList.toggle('active',level==='N2');$('setN3').classList.toggle('active',level==='N3');
 calendar();
}
function calendar(){
 const now=new Date(),labels=['日','一','二','三','四','五','六'],boxes=[];
 for(let d=6;d>=0;d--){
  let date=new Date(now.getFullYear(),now.getMonth(),now.getDate()-d),key=H.day(date),n=db.days[key]||0;
  boxes.push('<div title="'+H.safe(key)+' 已复习 '+n+' 次"><div class="tiny">'+labels[date.getDay()]+'</div><div style="width:33px;height:33px;margin:4px auto 0;border-radius:50%;display:grid;place-items:center;background:'+(n?'#fce8e5':'#f4f5f7')+';color:'+(n?'#d9281d':'#646d7c')+';font-weight:'+(n?'850':'500')+'">'+date.getDate()+'</div>'+(n?'<span style="font-size:11px;color:#e52e20">✓</span>':'<span style="font-size:11px;color:transparent">·</span>')+'</div>');
 }
 $('calendar').innerHTML=boxes.join('');
 $('weekText').textContent=(db.days[today()]||0)+'次今日学习';
}
function changeLevel(next){
 level=next;shown=30;$('searchWords').value='';closeStudy();summary();list();
}
function opts(){
 const q=$('searchWords').value.trim().toLowerCase();
 return group().filter(w=>{
 const x=get(w.id);if(filter==='new'&&x.seen)return false;
 if(filter==='review'&&!hasDue(w))return false;
 if(filter==='saved'&&!x.starred)return false;
 return !q||w.word.toLowerCase().includes(q)||w.kana.includes(q)||(w.meaning||'').toLowerCase().includes(q);
 });
}
function list(){
 const arr=opts(),part=arr.slice(0,shown);
 $('listStats').textContent=arr.length+'个词';
 $('wordList').innerHTML=part.length?part.map(w=>{
   const state=get(w.id),label=state.mastered?'已掌握':hasDue(w)?'待复习':state.seen?'已学习':'未学';
   return '<button class="listrow" type="button" data-id="'+H.safe(w.id)+'"><div style="min-width:0;flex:1"><div class="name">'+H.safe(w.word)+' <span class="muted" style="font-size:13px;font-weight:450">'+H.safe(w.kana)+'</span></div><div class="desc">'+H.safe(w.meaning)+'</div></div><span class="chip">'+(state.starred?'★ ':'')+label+'</span><span aria-hidden="true">›</span></button>'
 }).join(''):'<div class="card empty">这个筛选下还没有词汇。</div>';
 $('wordList').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openDetail(all.find(w=>w.id===b.dataset.id)));
 $('moreWords').hidden=arr.length<=shown;
}
function closeStudy(){queue=[];current=null;$('studyPanel').style.display='none'}
function start(which){
 mode=which;queue=(which==='due'?group().filter(hasDue).sort((a,b)=>(get(a.id).nextReview||0)-(get(b.id).nextReview||0)):group().filter(x=>!get(x.id).seen)).slice(0,which==='due'?100:20);
 if(!queue.length){alert(which==='due'?'目前没有到期词汇，可以开始新学。':'当前级别所有词汇都学习过啦！可以复习或切换等级。');return}
 $('studyPanel').style.display='block';$('studyTitle').textContent=which==='due'?'到期复习':'今日新学';advance();$('studyPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function advance(){
 current=queue.shift()||null;
 if(!current){closeStudy();summary();list();alert('这一组学习完成啦！🎉');return}
 $('studyWord').textContent=current.word;
 $('studyKana').textContent=current.kana;
 $('studyMeaning').textContent='英文释义：'+current.meaning;
 $('studyAnswer').style.display='none';$('rateActions').style.display='none';$('reveal').style.display='block';
 $('studyProgress').textContent='当前 '+current.level+' · 本组还剩 '+(queue.length+1)+' 词';
}
function rate(v){
 if(!current)return;const old=get(current.id),interval={again:10/1440,hard:1,good:3,easy:7}[v];
 const mature=v==='easy'||(v==='good'&&(old.goodCount||0)>=2);
 db.items[current.id]={...old,seen:true,mastered:mature,rating:v,goodCount:v==='good'?(old.goodCount||0)+1:v==='easy'?3:0,updatedAt:Date.now(),nextReview:Date.now()+interval*MS};
 db.days[today()]=(db.days[today()]||0)+1;
 save();advance();list();
}
function openDetail(word){
 if(!word)return;detail=word;const x=get(word.id);
 $('detailName').innerHTML=H.ruby(word.word,word.kana);$('detailKana').textContent=word.kana;$('detailMeaning').textContent=word.meaning;$('detailLevel').textContent=word.level+' · '+(x.mastered?'已掌握':x.seen?'已学':'新词');
 $('detailSave').textContent=x.starred?'★ 已收藏':'☆ 收藏';
 $('detailKnown').textContent=x.mastered?'✓ 已掌握':'✓ 标记掌握';
 $('detailOverlay').hidden=false;$('detailOverlay').style.display='grid';
 $('closeDetail').focus();
}
function closeDetail(){detail=null;$('detailOverlay').hidden=true;$('detailOverlay').style.display='none'}
function alterDetail(what){
 if(!detail)return;
 const x=get(detail.id),next={...x};
 if(what==='save')next.starred=!x.starred;
 if(what==='known'){next.seen=true;next.mastered=true;next.goodCount=3;next.rating='easy';next.updatedAt=Date.now();next.nextReview=Date.now()+7*MS;db.days[today()]=(db.days[today()]||0)+1;}
 db.items[detail.id]=next;save();list();openDetail(detail);
}
$('setN2').onclick=()=>changeLevel('N2');$('setN3').onclick=()=>changeLevel('N3');
$('startNew').onclick=()=>start('new');$('startReview').onclick=()=>start('due');$('exitStudy').onclick=closeStudy;
$('reveal').onclick=()=>{$('studyAnswer').style.display='block';$('rateActions').style.display='grid';$('reveal').style.display='none'};
$('rateActions').querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>rate(b.dataset.rate));
$('studySpeak').onclick=()=>current&&H.speak(current.word);$('studyMore').onclick=()=>openDetail(current);
$('searchWords').oninput=()=>{shown=30;list()};
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;shown=30;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));list()});
$('moreWords').onclick=()=>{shown+=40;list()};
$('closeDetail').onclick=closeDetail;$('detailOverlay').onclick=e=>{if(e.target===$('detailOverlay'))closeDetail()};
$('detailSpeak').onclick=()=>detail&&H.speak(detail.word);
$('detailSave').onclick=()=>alterDetail('save');$('detailKnown').onclick=()=>alterDetail('known');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&detail)closeDetail()});
summary();list();
})();