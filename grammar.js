/* Mobile JLPT grammar quiz. Original mock problems from practice.html plus authored N2/N3 exercises.
 * Every choice is explained; data, notes and reports stay in this browser. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const ORIGINAL=Array.isArray(window.JLPT_GRAMMAR_BANK)?window.JLPT_GRAMMAR_BANK:[];
const EXTRA=typeof window.buildJLPTGrammarBank==='function'?window.buildJLPTGrammarBank():[];
const BANK=ORIGINAL.concat(EXTRA);
const BANK_COUNT=EXTRA.length;
const BYID=new Map(BANK.map(q=>[q.id,q])),STORE='jlptGrammarPracticeV1',LEGACY='jlptPracticeV2State';
const defaults={favorites:{},wrong:{},answers:{},notes:{},reports:{},words:{},prefs:{level:'N2',furigana:true,autoExplain:true,autoSound:false},session:null};
function load(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(!x||typeof x!=='object'||Array.isArray(x))return structuredFallback();return {...defaults,...x, favorites:x.favorites||{},wrong:x.wrong||{},answers:x.answers||{},notes:x.notes||{},reports:x.reports||{},words:x.words||{},prefs:{...defaults.prefs,...(x.prefs||{})}}}catch(e){return structuredFallback()}}
function structuredFallback(){return {favorites:{},wrong:{},answers:{},notes:{},reports:{},words:{},prefs:{...defaults.prefs},session:null}}
let state=load(),activeSheet=false,expanded=false,sheetTab='explain',activeModal=null,noticeTimer=null;
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));return true}catch(e){toast('保存失败：浏览器可能禁用了存储');return false}}
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function strip(s){return String(s??'').replace(/\[([^\]|]+)\|([^\]]+)\]/g,'$1')}
function furigana(s,decorate=false){
 let x=safe(s).replace(/\[([^|\]]+)\|([^\]]+)\]/g,(_,word,kana)=>'<ruby'+(decorate?' class="keyterm"':'')+'>'+word+'<rt>'+kana+'</rt></ruby>');
 return x;
}
function typedVocab(q){
 // Vocabulary contains *real lexical words from the sentence*, never the four grammar choices.
 const source=window.JLPT_GRAMMAR_WORD_CARDS||{};
 const rows=q.generated?source.bySentence?.[q.ex]:source.byQuestion?.[q.id];
 if(!Array.isArray(rows))return [];
 const context=strip((q.q||'')+' '+(q.ex||''));
 const result=[],seen=new Set();
 for(const item of rows){
  if(!Array.isArray(item)||item.length<4)continue;
  const [word,kana,zh,en]=item.map(x=>String(x||'').trim());
  if(!word||!kana||!context.includes(word)||!zh&&!en||seen.has(word))continue;
  if(!/^[ぁ-ゖァ-ヺー]+$/.test(kana))continue;
  if(!/^[ぁ-ゖァ-ヺ一-龯々ヶ]+$/.test(word))continue;
  seen.add(word);result.push({word,kana,zh,en});
  if(result.length>=7)break;
 }
 return result;
}

/* Highlight only verified lexical words from this question's vocabulary metadata.
 * Preserve original [kanji|kana] ruby marks even when a term is not clickable. */
function interactiveSentence(q,source){
 const raw=String(source||''),marks=[],pattern=/\[([^|\]]+)\|([^\]]+)\]/g;
 let plain='',prev=0,m;
 while((m=pattern.exec(raw))){
  plain+=raw.slice(prev,m.index);const start=plain.length;
  plain+=m[1];marks.push({start,end:plain.length,kana:m[2]});prev=pattern.lastIndex;
 }
 plain+=raw.slice(prev);
 const words=typedVocab(q),candidate=[];
 words.forEach((w,index)=>{
  let pos=plain.indexOf(w.word);
  while(pos!==-1){candidate.push({start:pos,end:pos+w.word.length,index,length:w.word.length});pos=plain.indexOf(w.word,pos+1)}
 });
 candidate.sort((a,b)=>b.length-a.length||a.start-b.start);
 const selected=[];
 for(const v of candidate)if(!selected.some(x=>v.start<x.end&&v.end>x.start))selected.push(v);
 selected.sort((a,b)=>a.start-b.start);
 // Render the untouched part while retaining its original kanji ruby annotations.
 function rest(start,end){
  let html='',at=start;
  for(const mark of marks){
   if(mark.start<at||mark.start<start||mark.end>end)continue;
   html+=safe(plain.slice(at,mark.start));
   html+='<ruby>'+safe(plain.slice(mark.start,mark.end))+'<rt>'+safe(mark.kana)+'</rt></ruby>';
   at=mark.end;
  }
  return html+safe(plain.slice(at,end));
 }
 let rendered='',at=0;
 for(const term of selected){
  if(term.start<at)continue;
  rendered+=rest(at,term.start);
  const word=words[term.index];
  rendered+='<button type="button" class="inline-word" data-wordindex="'+term.index+'" aria-label="查看单词 '+safe(word.word)+' 的解释"><ruby>'+safe(word.word)+'<rt>'+safe(word.kana)+'</rt></ruby></button>';
  at=term.end;
 }
 return rendered+rest(at,plain.length);
}
function bindInlineWords(container,q){
 const words=typedVocab(q);
 container.querySelectorAll('[data-wordindex]').forEach(button=>{
  button.onclick=()=>{const term=words[Number(button.dataset.wordindex)];if(term)openWordQuick(term,q,button)};
 });
}
const quickWord={word:null,question:null,focusTarget:null,details:false};
function closeWordQuick(){
 if(!quickWord.word)return;
 quickWord.word=null;quickWord.question=null;quickWord.details=false;
 $('wordQuick').classList.remove('open');$('wordQuick').setAttribute('aria-hidden','true');
 $('wordQuickBackdrop').hidden=true;
 const parent=$('sheetContent'),scroll=parent.scrollTop;
 if(activeSheet&&sheetTab==='vocab'){showSheetContent();parent.scrollTop=scroll}
 const focus=quickWord.focusTarget;quickWord.focusTarget=null;
 if(focus&&focus.isConnected&&typeof focus.focus==='function')focus.focus();
}
function updateQuickFavorite(){
 const item=quickWord.word;if(!item)return;
 const starred=!!state.words[item.word],button=$('wordQuickFavorite');
 button.textContent=starred?'★':'☆';button.classList.toggle('active',starred);
 button.setAttribute('aria-pressed',String(starred));
 button.setAttribute('aria-label',(starred?'取消收藏 ':'收藏 ')+item.word);
}
function openWordQuick(item,q,trigger){
 if(!item||!q||!typedVocab(q).some(x=>x.word===item.word&&x.kana===item.kana))return;
 if(quickWord.word)closeWordQuick();
 quickWord.word=item;quickWord.question=q;quickWord.details=false;
 quickWord.focusTarget=trigger||document.activeElement;
 $('wordQuickTitle').textContent=item.word;
 $('wordQuickKana').textContent='「'+item.kana+'」';
 $('wordQuickTag').textContent=q.l+' · 单词速查';
 $('wordQuickMeaning').innerHTML=item.zh?'<small>中文释义</small>'+safe(item.zh):'<small>英文原词义 · 中文待补充</small>'+safe(item.en);
 $('wordQuickExtra').hidden=true;$('wordQuickExtra').innerHTML='';
 $('wordQuickDetails').classList.remove('active');$('wordQuickDetails').textContent='▣ 详情';
 $('wordQuickDictionary').href='https://jisho.org/search/'+encodeURIComponent(item.word);
 updateQuickFavorite();
 $('wordQuickBackdrop').hidden=false;$('wordQuick').classList.add('open');
 $('wordQuick').setAttribute('aria-hidden','false');
 $('closeWordQuick').focus();
}
function toggleQuickDetails(){
 if(!quickWord.word)return;
 quickWord.details=!quickWord.details;
 const extra=$('wordQuickExtra'),item=quickWord.word,q=quickWord.question;
 extra.hidden=!quickWord.details;
 $('wordQuickDetails').classList.toggle('active',quickWord.details);
 $('wordQuickDetails').textContent=quickWord.details?'▣ 收起详情':'▣ 详情';
 if(!quickWord.details)return;
 const example=strip(q.ex||''),prompt=strip(q.q||''),inExample=example.includes(item.word);
 const sentence=inExample?example:prompt;
 const comparison=inExample&&q.exzh?'<p class="word-quick-context">'+safe(q.exzh)+'</p>':'';
 extra.innerHTML='<h3>本题中的用法</h3><p lang="ja">'+safe(sentence)+'</p>'+comparison+
 '<h3>读音与学习记录</h3><p>'+safe(item.word)+' ／ '+safe(item.kana)+'</p>'+
 '<p style="color:#b1b1b9;font-size:12px">卡片词义来自站内词汇资料；更多词性、常见搭配和例句请通过下方词典查询核对。</p>';
}
$('wordQuickBackdrop').onclick=closeWordQuick;
$('closeWordQuick').onclick=closeWordQuick;
$('wordQuickFavorite').onclick=()=>{
 const item=quickWord.word;if(!item)return;
 if(state.words[item.word])delete state.words[item.word];else state.words[item.word]=true;
 persist();updateQuickFavorite();
};
$('wordQuickPlay').onclick=()=>{const item=quickWord.word;if(item)speak(item.kana)};
$('wordQuickDetails').onclick=toggleQuickDetails;

function candidate(level,mode){
 return BANK.filter(q=>q.l===level&&(mode==='all'||(mode==='wrong'?!!state.wrong[q.id]:!!state.favorites[q.id])));
}
function createSession(level='N2',mode='all',firstId=null){
 const options=candidate(level,mode);
 if(!options.length){toast(mode==='wrong'?'这个等级还没有错题，可以先做一组新题。':'这个等级还没有收藏题，请先在题目页点击爱心。');return false}
 const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 // In normal mode, prioritize unseen questions to finish the 1000-question bank without repeats.
 const unseen=options.filter(x=>!state.answers[x.id]),already=options.filter(x=>!!state.answers[x.id]);
 let shuffled=mode==='all'?shuffle(unseen).concat(shuffle(already)):shuffle(options);
 if(firstId){const pos=shuffled.findIndex(x=>x.id===firstId);if(pos>0)shuffled.unshift(...shuffled.splice(pos,1))}
 state.session={level,mode,ids:shuffled.slice(0,10).map(q=>q.id),index:0,selections:{},started:Date.now()};
 state.prefs.level=level;persist();return true;
}
const params=new URLSearchParams(location.search);
const reqLevel=['N2','N3'].includes(params.get('level'))?params.get('level'):state.prefs.level;
const reqMode=['all','wrong','star'].includes(params.get('mode'))?(params.get('mode')==='star'?'star':params.get('mode')):null;
if(!state.session||!Array.isArray(state.session.ids)||!state.session.ids.length||!state.session.ids.every(id=>BYID.has(id))||state.session.level!==reqLevel||(reqMode&&state.session.mode!==reqMode)){
 if(!createSession(reqLevel,reqMode||'all'))createSession(reqLevel,'all');
}
function session(){return state.session}
function question(){const s=session();return BYID.get(s.ids[s.index])}
function selection(q){return session().selections[q.id]??null}
function done(q){return selection(q)!==null}
function toast(t){$('resultCue').textContent=t}
function speak(value){
 if(!('speechSynthesis' in window)){toast('此设备不支持日语朗读');return}
 try{speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(strip(value));utter.lang='ja-JP';utter.rate=.88;const voices=speechSynthesis.getVoices().filter(v=>v.lang?.toLowerCase().startsWith('ja'));if(voices.length)utter.voice=voices[0];speechSynthesis.speak(utter)}catch(e){toast('语音播放失败，请检查日语语音包')}
}
function syncLegacy(q,chosen,ok){
 if(!/^n[23]-\d{2}$/.test(q.id))return;
 try{
 const old=JSON.parse(localStorage.getItem(LEGACY)||'{}');
 old.answers=old.answers||{};old.wrong=old.wrong||{};old.star=old.star||{};
 old.answers[q.id]={selected:chosen,correct:ok,at:Date.now()};
 old.wrong[q.id]=!ok;
 if(state.favorites[q.id])old.star[q.id]=true;
 localStorage.setItem(LEGACY,JSON.stringify(old));
 }catch(e){}
}
function render(){
 const q=question();if(!q)return;
 const s=session(),sel=selection(q),answered=sel!==null,ok=sel===q.a;
 document.body.classList.toggle('ruby-off',!state.prefs.furigana);
 $('counter').textContent=(s.index+1)+'/'+s.ids.length;
 $('progress').setAttribute('aria-valuemax',String(s.ids.length));$('progress').setAttribute('aria-valuenow',String(s.index+1));
 $('progressFill').style.width=((s.index+1)/s.ids.length*100)+'%';
 $('levelLabel').textContent=s.level+' · 语法 · '+(s.mode==='wrong'?'错题重练':s.mode==='star'?'收藏复习':'10题一组');
 const levelBank=BANK.filter(x=>x.l===s.level),seenLevel=levelBank.filter(x=>!!state.answers[x.id]).length;
 $('statusText').title='本级语法题库 '+levelBank.length+'题，已做 '+seenLevel+'题';
 $('statusText').textContent=answered?(ok?'回答正确 · 查看解析':'回答错误 · 查看选项原因'):'本级已做 '+seenLevel+'/'+levelBank.length;
 $('prompt').innerHTML=interactiveSentence(q,q.q).replace(/（　）/g,'<span class="blank">＿＿</span>').replace(/【([^】]+)】/g,'<span class="keyterm">【$1】</span>');
 bindInlineWords($('prompt'),q);
 $('translateHint').hidden=true;$('translateHint').textContent=q.zh;
 $('hintToggle').textContent='显示题目中文';
 $('choices').innerHTML=q.o.map((opt,i)=>{
  const clazz=answered?(i===q.a?' correct':i===sel?' incorrect':''):'';
  return '<button type="button" class="option'+clazz+'" data-choice="'+i+'" '+(answered?'disabled':'')+' aria-label="选项'+(i+1)+'"><span class="number">'+(i+1)+'</span><span class="jp">'+furigana(opt[0])+'</span></button>';
 }).join('');
 $('choices').querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=()=>answer(+btn.dataset.choice));
 $('favorite').classList.toggle('active',!!state.favorites[q.id]);$('favorite').setAttribute('aria-pressed',String(!!state.favorites[q.id]));
 $('favorite').querySelector('.glyph').textContent=state.favorites[q.id]?'♥':'♡';
 $('report').classList.toggle('active',!!state.reports[q.id]);
 $('note').classList.toggle('active',!!state.notes[q.id]);
 $('resultCue').className='result-cue'+(answered&&ok?' good':'');
 $('resultCue').textContent=answered?(ok?'✓ 回答正确！点下方「解释」查看完整分析。':'✕ 答错了，绿色选项是正确答案。'):'';
 $('openExplanation').disabled=!answered;
 $('next').textContent=s.index<s.ids.length-1?'下一题 ▶':'完成本组 ▶';
 $('sheetContent').innerHTML='';if(activeSheet)showSheetContent();
}
function answer(idx){
 const q=question();if(!q||done(q))return;const yes=idx===q.a;
 session().selections[q.id]=idx;
 state.answers[q.id]={selected:idx,correct:yes,at:Date.now()};
 if(yes)delete state.wrong[q.id];else state.wrong[q.id]=true;
 syncLegacy(q,idx,yes);persist();render();
 if(state.prefs.autoExplain)openSheet('explain');
 if(state.prefs.autoSound)speak(q.o[q.a][0]);
}
function showSheetContent(){
 const q=question();if(!q||!done(q)){closeSheet();return}
 if(sheetTab==='explain'){
  $('sheetContent').innerHTML='<h2>句子与中文意思</h2><div class="explain-box"><div class="explain-jp">'+interactiveSentence(q,q.q.replace('（　）',q.o[q.a][0]))+'</div><div class="explain-cn">'+safe(q.zh)+'</div></div><h2>语法要点</h2><p><b>'+furigana(q.pattern)+'</b></p><p>'+safe(q.tip)+'</p><h3>正确答案与四个选项逐项分析</h3>'+q.o.map((o,i)=>{
  const ok=i===q.a;return '<div class="answer-reason'+(ok?' right':'')+'"><div class="reason-hd"><span class="no">'+(i+1)+'</span><b>'+furigana(o[0])+'</b></div><div class="reason-meaning">中文：'+safe(o[1])+'</div><div class="why"><span class="verdict">'+(ok?'✓ 正确选项':'✕ 不适合')+'</span><br>'+safe(o[2])+'</div></div>';
 }).join('')+'<h3>易混语法</h3><div class="explain-box">'+safe(q.mix)+'</div><h3>补充例句</h3><div class="explain-box"><div class="explain-jp">'+furigana(q.ex)+'</div><div class="explain-cn">'+safe(q.exzh)+'</div></div><button type="button" id="speakExample" class="text-btn">🔊 播放补充例句</button>';
 $('speakExample').onclick=()=>speak(q.ex);
  bindInlineWords($('sheetContent'),q);
 }else{
  const terms=typedVocab(q);
  const cards=terms.length?terms.map((v,i)=>{
   const word=safe(v.word),reading=safe(v.kana),zh=v.zh?safe(v.zh):'';
   const gloss=zh?'◆ 中文：'+zh:'◆ 英文原词义：'+safe(v.en);
   return '<div class="vocab-card"><div class="vocab-main"><button type="button" class="vocab-open" data-openword="'+i+'" aria-label="打开 '+word+' 的词典卡片"><strong>'+word+'</strong><div class="kana">「'+reading+'」</div><div class="definition">'+gloss+'</div><div class="vocab-hint">点击查看单词解释 ›</div></button></div><div class="vocab-controls"><button type="button" data-termstar="'+i+'" class="'+(state.words[v.word]?'active':'')+'" aria-label="'+(state.words[v.word]?'取消收藏':'收藏')+word+'">'+(state.words[v.word]?'★':'☆')+'</button><button type="button" data-termspeak="'+i+'" aria-label="朗读'+word+'">♬</button></div></div>';
  }).join(''):'<div class="explain-box">这一题暂时没有匹配到可核对读音和词义的独立日语单词，因此不会把语法选项当成单词显示。</div>';
  $('sheetContent').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:15px"><b>例句中的真实单词 · '+terms.length+'个</b><span class="chip">'+q.l+'</span></div><div class="vocab-list">'+cards+'</div><p style="font-size:12px;color:#859499;margin-top:16px">词汇均来自题目或例句；仅在词义来源可靠时显示读音。中文待补充的条目会明确标为英文词义。☆可收藏，♬可朗读。</p>';
  $('sheetContent').querySelectorAll('[data-openword]').forEach(b=>b.onclick=()=>{const item=terms[Number(b.dataset.openword)];if(item)openWordQuick(item,q,b)});
  $('sheetContent').querySelectorAll('[data-termstar]').forEach(b=>b.onclick=()=>{
   const item=terms[+b.dataset.termstar];if(!item)return;
   if(state.words[item.word])delete state.words[item.word];else state.words[item.word]=true;
   persist();showSheetContent();
  });
  $('sheetContent').querySelectorAll('[data-termspeak]').forEach(b=>b.onclick=()=>{
   const item=terms[+b.dataset.termspeak];if(item)speak(item.kana);
  });
 }
}
function openSheet(tab='explain'){
 if(!done(question())){toast('请先完成作答，再查看完整解析。');return}
 sheetTab=tab;activeSheet=true;expanded=false;
 $('sheet').classList.add('open');$('sheet').classList.remove('expanded');$('sheet').setAttribute('aria-hidden','false');
 $('sheetBackdrop').hidden=false;$('tabExplanation').classList.toggle('active',tab==='explain');$('tabExplanation').setAttribute('aria-selected',String(tab==='explain'));
 $('tabVocab').classList.toggle('active',tab==='vocab');$('tabVocab').setAttribute('aria-selected',String(tab==='vocab'));
 showSheetContent();$('sheetContent').scrollTop=0;
}
function closeSheet(){
 if(quickWord.word)closeWordQuick();
 activeSheet=false;$('sheet').classList.remove('open','expanded');$('sheet').setAttribute('aria-hidden','true');$('sheetBackdrop').hidden=true;
}
function switchTab(t){if(quickWord.word)closeWordQuick();if(!activeSheet)openSheet(t);else{sheetTab=t;$('tabExplanation').classList.toggle('active',t==='explain');$('tabVocab').classList.toggle('active',t==='vocab');$('tabExplanation').setAttribute('aria-selected',String(t==='explain'));$('tabVocab').setAttribute('aria-selected',String(t==='vocab'));showSheetContent();$('sheetContent').scrollTop=0}}
function toggleExpanded(){expanded=!expanded;$('sheet').classList.toggle('expanded',expanded)}
$('sheetBackdrop').onclick=closeSheet;$('closeSheet').onclick=closeSheet;
$('tabExplanation').onclick=()=>switchTab('explain');$('tabVocab').onclick=()=>switchTab('vocab');
let suppressHandleClick=false;
$('sheetHandle').onclick=()=>{if(suppressHandleClick){suppressHandleClick=false;return}toggleExpanded()};
$('sheetHandle').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleExpanded()}};
let touchStart=null;const handle=$('sheetHandle');
handle.addEventListener('touchstart',e=>{touchStart=e.touches[0].clientY},{passive:true});
handle.addEventListener('touchend',e=>{if(touchStart===null)return;const delta=e.changedTouches[0].clientY-touchStart;touchStart=null;
 if(delta< -50||delta>80){suppressHandleClick=true;setTimeout(()=>suppressHandleClick=false,550)}
 if(delta< -50){expanded=true;$('sheet').classList.add('expanded')}else if(delta>80){if(expanded){expanded=false;$('sheet').classList.remove('expanded')}else closeSheet()}
},{passive:true});
function next(){
 const s=session();if(!s)return;if(quickWord.word)closeWordQuick();closeSheet();
 if(s.index<s.ids.length-1){s.index++;persist();render();window.scrollTo({top:0,behavior:'instant'});return}
 showSummary();
}
function showModal(title,body,actions=[]){
 if(quickWord.word)closeWordQuick();
 closeSheet();activeModal=title;
 $('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalActions').innerHTML=actions.map((a,i)=>'<button type="button" data-action="'+i+'" class="'+(a.primary?'primary':'')+'">'+safe(a.text)+'</button>').join('');
 $('modalBackdrop').hidden=false;
 $('modalActions').querySelectorAll('[data-action]').forEach(b=>b.onclick=actions[+b.dataset.action].fn);
 $('closeModal').focus();
}
function closeModal(){activeModal=null;$('modalBackdrop').hidden=true}
$('closeModal').onclick=closeModal;$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))closeModal()};
function showSummary(){
 const s=session(),submitted=s.ids.filter(id=>s.selections[id]!==undefined).length;
 const correct=s.ids.filter(id=>{const q=BYID.get(id);return s.selections[id]===q.a}).length;
 const remaining=BANK.filter(q=>q.l===s.level&&!state.answers[q.id]).length;
 const wrongCount=submitted-correct,skipped=s.ids.length-submitted;
 showModal('本组练习完成 🎉','<div class="grid-numbers" style="grid-template-columns:repeat(3,1fr);text-align:center"><div><strong style="font-size:30px">'+submitted+'</strong><p class="hint">已答题</p></div><div><strong style="font-size:30px;color:#09897a">'+correct+'</strong><p class="hint">正确</p></div><div><strong style="font-size:30px;color:#cb5860">'+wrongCount+'</strong><p class="hint">错误</p></div></div><p>跳过：'+skipped+'题 · 正确率：'+(submitted?Math.round(correct/submitted*100):0)+'%</p><p class="hint">错题会保存，可以从题号总览进入错题重练。</p>',[
 {text:'查看题号',fn:()=>{closeModal();openOverview()}},
 {text:'再练10题',primary:true,fn:()=>{createSession(s.level,'all');closeModal();render()}},
 {text:'错题重练',fn:()=>{if(createSession(s.level,'wrong')){closeModal();render()}}}
 ]);
}
function openOverview(){
 const s=session();
 const content='<p class="hint">点击题号跳转，红色为本组答错，绿色为本组答对；未做题也可以随时返回。</p><div class="grid-numbers">'+s.ids.map((id,i)=>{
 const q=BYID.get(id),sel=s.selections[id];
 const cn=sel===undefined?'':sel===q.a?'done':'wrong';
 return '<button class="'+cn+(i===s.index?' active':'')+'" data-goto="'+i+'">'+(i+1)+'</button>'
 }).join('')+'</div><h3>筛选练习</h3><div class="mode-pills"><button id="modeAll" class="'+(s.mode==='all'?'active':'')+'">全部题</button><button id="modeWrong" class="'+(s.mode==='wrong'?'active':'')+'">错题重练</button><button id="modeStar" class="'+(s.mode==='star'?'active':'')+'">收藏复习</button></div><p class="hint">选择练习模式会开始新的10题分组。</p>';
 showModal('题号总览 · '+s.level,content,[{text:'关闭',fn:closeModal},{text:'新开一组',primary:true,fn:()=>{createSession(s.level,s.mode);closeModal();render()}}]);
 $('modalBody').querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{s.index=+b.dataset.goto;persist();closeModal();render();window.scrollTo({top:0})});
 for(const [name,mode] of [['modeAll','all'],['modeWrong','wrong'],['modeStar','star']])$(name).onclick=()=>{if(createSession(s.level,mode)){closeModal();render()}};
}
function toggleFavorite(){
 const q=question();if(!q)return;
 if(state.favorites[q.id])delete state.favorites[q.id];else state.favorites[q.id]=true;
 if(/^n[23]-\d{2}$/.test(q.id))try{
 const old=JSON.parse(localStorage.getItem(LEGACY)||'{}');old.star=old.star||{};old.star[q.id]=!!state.favorites[q.id];localStorage.setItem(LEGACY,JSON.stringify(old));
 }catch(e){}
 persist();render();
}
function openNote(){
 const q=question();
 showModal('✎ 本题笔记','<p class="hint">语法：'+safe(q.pattern)+' · 只保存在当前浏览器</p><textarea id="noteText" placeholder="记下N2/N3语法接续、易混点、自己的例句……">'+safe(state.notes[q.id]||'')+'</textarea>',[
  {text:'取消',fn:closeModal},
  {text:'保存笔记',primary:true,fn:()=>{state.notes[q.id]=$('noteText').value.slice(0,5000);persist();closeModal();render()}}
 ]);
}
function openReport(){
 const q=question(),data=state.reports[q.id]||{};
 showModal('⚠ 标记题目问题','<p class="hint">题号：'+safe(q.id)+'。这里的标记只会保存在本机，不会自动发送到管理员。</p><label>问题类型<select id="reportType"><option value="答案有争议">答案有争议</option><option value="假名或读音错误">假名或读音错误</option><option value="语法解析错误">语法解析错误</option><option value="题目显示异常">题目显示异常</option><option value="其他">其他</option></select></label><textarea id="reportText" placeholder="具体哪里有问题？">'+safe(data.text||'')+'</textarea><p class="hint">可复制内容，之后发给老师进一步核对。</p>',[
  {text:'取消',fn:closeModal},
  {text:'复制问题',fn:()=>{const text='题号：'+q.id+'\n问题：'+$('reportType').value+'\n详情：'+$('reportText').value;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast('问题说明已复制')).catch(()=>toast('复制失败，请手动选择文本'));}else toast('当前浏览器不支持自动复制');closeModal()}},
  {text:'保存标记',primary:true,fn:()=>{state.reports[q.id]={type:$('reportType').value,text:$('reportText').value.slice(0,2500),at:Date.now()};persist();closeModal();render()}}
 ]);
 $('reportType').value=data.type||'答案有争议';
}
function openSettings(){
 const pref=state.prefs;
 showModal('⚙ 语法练习设置','<label>JLPT等级 <select id="settingLevel"><option>N2</option><option>N3</option></select></label><label><input type="checkbox" id="settingRuby"> 显示日语汉字上的平假名</label><label><input type="checkbox" id="settingAuto"> 答题后自动打开解释抽屉</label><label><input type="checkbox" id="settingSound"> 答题后朗读正确选项</label><p class="hint">每组最多10题。切换等级会自动开始一组新题，保存的错题、收藏和笔记不会删除。</p>',[
  {text:'取消',fn:closeModal},
  {text:'保存设置',primary:true,fn:()=>{
    const old=state.prefs.level,next=$('settingLevel').value;
    state.prefs.furigana=$('settingRuby').checked;state.prefs.autoExplain=$('settingAuto').checked;state.prefs.autoSound=$('settingSound').checked;
    state.prefs.level=next;
    if(next!==old)createSession(next,'all');
    persist();closeModal();render();
  }}
 ]);
 $('settingLevel').value=pref.level;$('settingRuby').checked=!!pref.furigana;$('settingAuto').checked=!!pref.autoExplain;$('settingSound').checked=!!pref.autoSound;
}
$('next').onclick=next;$('overview').onclick=openOverview;$('favorite').onclick=toggleFavorite;$('report').onclick=openReport;$('settings').onclick=openSettings;$('note').onclick=openNote;$('openExplanation').onclick=()=>openSheet('explain');
$('hintToggle').onclick=()=>{const el=$('translateHint');el.hidden=!el.hidden;$('hintToggle').textContent=el.hidden?'显示题目中文':'隐藏题目中文'};
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(quickWord.word)closeWordQuick();else if(activeModal)closeModal();else if(activeSheet)closeSheet();return}
 if(activeModal||activeSheet||quickWord.word)return;
 if(/^[1-4]$/.test(e.key)&&!done(question()))answer(+e.key-1);
 if(e.key==='ArrowRight'&&e.target.tagName!=='TEXTAREA')next();
});
render();
})();