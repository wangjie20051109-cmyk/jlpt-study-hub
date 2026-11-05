/* Personal study dashboard. Does not access any account: reads local browser records only. */
(function(){
'use strict';
const H=window.JLPT_SITE,WK='jlptWordsModuleV1',PK='jlptPracticeV2State',GK='jlptGrammarPracticeV1',$=id=>document.getElementById(id);
let w=H.read(WK,{items:{},days:{}}),q=H.read(PK,{answers:{},wrong:{},star:{}});
function validObj(x){return x&&typeof x==='object'&&!Array.isArray(x)}
if(!validObj(w))w={items:{},days:{}};if(!validObj(q))q={answers:{},wrong:{},star:{}};
const items=validObj(w.items)?w.items:{},answers=validObj(q.answers)?q.answers:{},wrong=validObj(q.wrong)?q.wrong:{},star=validObj(q.star)?q.star:{};
const vocab=H.vocab(),groups={N2:vocab.filter(x=>x.level==='N2'),N3:vocab.filter(x=>x.level==='N3')};
const grammar=H.read(GK,{answers:{},wrong:{},favorites:{},notes:{}});const grammarAnswers=Object.values(grammar.answers||{});document.getElementById('grammarDone').textContent=grammarAnswers.length;document.getElementById('grammarAccuracy').textContent=grammarAnswers.length?Math.round(grammarAnswers.filter(x=>x.correct).length/grammarAnswers.length*100)+'%':'—';document.getElementById('grammarWrong').textContent=Object.values(grammar.wrong||{}).filter(Boolean).length;
function wordStat(level){
 const x=groups[level],seen=x.filter(v=>(items[v.id]||{}).seen).length,mastered=x.filter(v=>(items[v.id]||{}).mastered).length;
 $(level.toLowerCase()+'stat').textContent='已学 '+seen+' · 掌握 '+mastered+' / '+x.length;
 $(level.toLowerCase()+'bar').style.width=(x.length?mastered/x.length*100:0)+'%';
 return seen;
}
const seenN2=wordStat('N2'),seenN3=wordStat('N3'),res=Object.values(answers);
$('allLearned').textContent=seenN2+seenN3;
$('allDone').textContent=res.length;
$('allAccuracy').textContent=res.length?Math.round(res.filter(x=>x&&x.correct).length/res.length*100)+'%':'—';
const wrongIds=Object.keys(wrong).filter(x=>wrong[x]),starIds=Object.keys(star).filter(x=>star[x]);
$('wrongCount').textContent=wrongIds.length;
$('quizStarCount').textContent=starIds.length;
$('wordStarCount').textContent=Object.values(items).filter(x=>x&&x.starred).length;
function describe(id){
 const m=id.match(/^bulk-(n2|n3)-(\d+)$/);
 if(m){const arr=window['JLPT_BULK_'+m[1].toUpperCase()],n=Number(m[2])-1;
 if(Array.isArray(arr)&&arr[n]){const v=arr[n];return {label:m[1].toUpperCase()+' · '+(v[3]?'汉字书写':'汉字读音'),title:v[0]+'（'+v[1]+'）',detail:v[2]}}}
 const k=id.match(/^n(2|3)-(\d+)/);
 return {label:k?'N'+k[1]+' · 模拟练习':'已收录错题',title:k?'原有练习题 '+Number(k[2]):'练习题',detail:'点开继续复习并查看完整解析'};
}
$('wrongPreview').innerHTML=wrongIds.length?wrongIds.slice(0,8).map(id=>{
 const info=describe(id);
 return '<a class="listrow" href="./practice.html?mode=wrong&focus='+encodeURIComponent(id)+'"><div style="flex:1;min-width:0"><div class="name">'+H.safe(info.title)+'</div><div class="desc">'+H.safe(info.label)+' · '+H.safe(info.detail)+'</div></div><span aria-hidden="true">›</span></a>'
}).join(''):'<div class="empty">目前没有错题记录，去考试模块练几道吧！</div>';
const backupKeys = {
 words: WK, practice: PK, wordNotes: 'jlptWordNotesV1', grammar: GK,
 studyLoop: 'jlptStudyLoopV1', furigana: 'jlptStudyFuriganaV1', youth: 'jlptYouthV1',
 listeningSeen: 'jlptListeningExamSeenV1', listeningWrong: 'jlptListeningExamWrongV1',
 listeningDeep: 'jlptListeningDeepV1', listeningShadow: 'jlptListeningShadowV1',
 listeningWords: 'jlptListening1000V1'
};
const backupDefaults = { words: {items:{},days:{}}, practice: {answers:{},wrong:{},star:{}} };
$('backup').onclick=()=>{
 const data={type:'JLPTStudyHubLearningBackup',version:2,exportedAt:new Date().toISOString()};
 for (const [field,key] of Object.entries(backupKeys)) {
   const value=H.read(key,backupDefaults[field]);
   if (value!==undefined) data[field]=value;
 }
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='JLPT学习备份-'+H.day()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('restore').onchange=async e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const changed=[];
 try{
   if(file.size>5000000)throw Error('备份文件过大（最大5MB）');
   const data=JSON.parse(await file.text());
   if(data.type!=='JLPTStudyHubLearningBackup'||![1,2].includes(data.version)||!validObj(data.words)||!validObj(data.practice)||!validObj(data.words.items)||!validObj(data.practice.answers)||!validObj(data.practice.wrong)||!validObj(data.practice.star))throw Error('不是有效的JLPT Study Hub备份文件');
   const fields=Object.entries(backupKeys).filter(([field])=>Object.hasOwn(data,field));
   for(const [field] of fields){
     const value=data[field];
     const valid=field==='furigana'?typeof value==='boolean':
       ['listeningSeen','listeningWrong'].includes(field)?Array.isArray(value)&&value.every(id=>typeof id==='string'):validObj(value);
     if(!valid)throw Error('备份数据格式有误：'+field);
   }
   if(!confirm('导入会覆盖此浏览器中与备份对应的学习记录。确定继续吗？'))return;
   for(const [field,key] of fields){
     const previous=localStorage.getItem(key);
     if(!H.write(key,data[field]))throw Error('当前浏览器无法保存学习记录');
     changed.push([key,previous]);
   }
   alert('恢复成功！页面将刷新。');location.reload();
 }catch(err){
   for(const [key,previous] of changed.reverse()){
     if(previous===null)localStorage.removeItem(key);else localStorage.setItem(key,previous);
   }
   alert('导入失败：'+err.message);
 }finally{e.target.value=''}
};
})();
