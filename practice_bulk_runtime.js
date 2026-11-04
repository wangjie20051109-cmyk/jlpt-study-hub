/* Convert MIT-licensed N2/N3 vocabulary records to 1000 original four-choice review items.
 * See practice-bank-NOTICE.md. These are NOT official past exam questions. */
window.addJLPTBulkQuiz=function(BANK){
const ZH={
'相互':'相互、彼此','相違':'差异、不同','送別':'送别、饯行','葬式':'葬礼','手首':'手腕','初歩':'初步、入门基础','絵の具':'绘画颜料','紙幣':'纸币','梯子':'梯子','比較的':'比较地、相对地','水平':'水平','洒落':'玩笑、俏皮话','体積':'体积','捕える':'捕捉、抓住','這う':'爬行','開会':'开会','お待たせしました':'让您久等了','付近':'附近','速力':'速度','真っ青':'深蓝色；脸色惨白','摩擦':'摩擦','鉄砲':'枪、火枪','日の入り':'日落','総理大臣':'首相','一旦':'暂时、一旦','休養':'休养','電流':'电流','零点':'零分','筆者':'作者','全力':'全力','素人':'外行、新手','お邪魔します':'打扰了','点々':'零星地、点点','更ける':'夜深','下書き':'草稿','剃る':'剃、刮','当てはめる':'套用、应用','彫る':'雕刻','牧畜':'畜牧','基礎':'基础','縮小':'缩小','引算':'减法','句読点':'标点符号','売り切れる':'售罄','湯飲み':'茶杯','曲線':'曲线','日時':'日期和时间'};
function chinese(word){return ZH[word]||'中文释义待校对';}

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
     const note='词条 '+other[0]+'（'+other[1]+'）；中文：'+chinese(other[0]);
     const reason=yes
       ? '正确：「'+word+'」读作「'+kana+'」。中文：'+chinese(word)+'。'
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
      zh:'「'+word+'」读作「'+kana+'」。中文：'+chinese(word)+'。',
      o:options,a:correct,
      pattern:'词条：'+word+'（'+kana+'）',
      tip:writing?'从平假名判断正确的汉字写法，注意容易混淆的读音。':'从汉字选择正确的平假名读法，特别留意长音、促音和同音词。',
      mix:'易混词条：'+hint+'。请一起记忆汉字写法和对应读音。',
      ex:'['+word+'|'+kana+']',
      exzh:'中文释义：'+chinese(word),
      source:'MIT-vocab'
   });count++;
 }
 return count;
}
return {n2:load('N2'),n3:load('N3')};
};
