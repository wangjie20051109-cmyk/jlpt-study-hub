/* Convert MIT-licensed N2/N3 vocabulary records to 1000 original four-choice review items.
 * See practice-bank-NOTICE.md. These are NOT official past exam questions. */
window.addJLPTBulkQuiz=function(BANK){
function load(level) {
 const arr=window['JLPT_BULK_'+level];
 if(!Array.isArray(arr))return 0;
 let count=0;
 for(let i=0;i<arr.length;i++){
   const r=arr[i],word=r[0],kana=r[1],gloss=r[2],writing=!!r[3],indices=r[4],correct=r[5];
   if(!word||!kana||!Array.isArray(indices)||indices.length!==4||indices[correct]!==i)continue;
   const alt=indices.map(index=>arr[index]);
   if(alt.some(x=>!x||!x[0]||!x[1]))continue;
   const hint=alt.filter((x,j)=>j!==correct).map(x=>x[0]+'（'+x[1]+'）').join('、');
   const options=alt.map((other,j)=>{
     const yes=j===correct;
     const choice=writing?other[0]:other[1];
     const note='词条 '+other[0]+'（'+other[1]+'）；英文释义 '+other[2];
     const reason=yes
       ? '正确：「'+word+'」读作「'+kana+'」。英文词义：'+gloss+'。'
       : (writing
           ? '不正确：「'+other[0]+'」读作「'+other[1]+'」，与题干「'+kana+'」不同。'
           : '不正确：「'+other[1]+'」对应「'+other[0]+'」，不是「'+word+'」的目标读音。')
         +' '+note+'。';
     return [choice,note,reason,'['+other[0]+'|'+other[1]+']'];
   });
   BANK.push({
      id:'bulk-'+level.toLowerCase()+'-'+String(i+1).padStart(3,'0'),
      l:level,t:writing?'writing':'reading',
      q:writing?'【汉字书写】「'+kana+'」对应的正确汉字词是哪一个？':'【汉字读音】「'+word+'」的正确读音是哪一个？',
      zh:'「'+word+'」读作「'+kana+'」。英文释义：'+gloss+'。',
      o:options,a:correct,
      pattern:'词条：'+word+'（'+kana+'）',
      tip:writing?'从平假名判断正确的汉字写法，注意容易混淆的读音。':'从汉字选择正确的平假名读法，特别留意长音、促音和同音词。',
      mix:'易混词条：'+hint+'。请一起记忆汉字写法和对应读音。',
      ex:'['+word+'|'+kana+']',
      exzh:'词汇英文释义：'+gloss,
      source:'MIT-vocab'
   });count++;
 }
 return count;
}
return {n2:load('N2'),n3:load('N3')};
};
