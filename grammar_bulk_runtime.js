/* JLPT grammar questions synthesized from jkindrix/japanese-language-data (CC BY-SA 4.0).
 * 1000 ADDITIONAL drills: 837 sentence-specific grammar recognition exercises
 * and 163 distinct concept-to-grammar matching exercises, grouped 500 N2 / 500 N3.
 * Source is draft and not native-speaker-reviewed. These are NOT official JLPT questions.
 * Data license and attribution: grammar-bulk-SOURCES.md */
(function(){
'use strict';
const input={N2:window.JLPT_GRAMMAR_SOURCE_N2||[],N3:window.JLPT_GRAMMAR_SOURCE_N3||[]};
const overrides={
'sue-ni-after':'末（すえ）に','sai-ni':'際（さい）に','no-nominalizer':'の（名词化）',
'causative-passive':'使役受身（しえきうけみ）','ge-looking':'げ（样态）',
'ba-koso-precisely-because':'ば～こそ','koso-precisely':'こそ（强调）','te-koso-only-by':'てこそ',
'you-to-mai-to':'～ようと～まいと','mai-not-likely':'～まい','ta-bakari':'～たばかり','bakari-only':'～ばかり'
};
const excluded=new Set(['名詞','普通形','動詞','形容詞','体言','活用','場合','ます','して','ない','した','ある','いる','なる','ため']);
function terms(p){return [...new Set((String(p).match(/[一-龯々ぁ-ゖァ-ヺー]{2,}/g)||[]).filter(x=>!excluded.has(x)))].sort((a,b)=>b.length-a.length)}
function visible(r){
 if(overrides[r[0]])return overrides[r[0]];
 let t=terms(r[1]);if(!t.length)return r[1].replace(/^(Plain form|Verb|Noun)\s*(\+|\/)\s*/,'');
 return t.slice(0,2).join('／');
}
function translateFormation(s){
 return String(s||'').replace(/\btransitive verb\b/gi,'他动词').replace(/\bnoun\b/gi,'名词').replace(/\bverb\b/gi,'动词').replace(/\bV\b/g,'动词')
 .replace(/\bi-adj\b/gi,'い形容词').replace(/\bna-adj\b/gi,'な形容词').replace(/\bplain form\b/gi,'普通形')
 .replace(/\bplain\b/gi,'普通形').replace(/\bnon-past\b/gi,'非过去形').replace(/\bstem\b/gi,'词干')
 .replace(/\bdict-form\b/gi,'辞书形').replace(/\bvolitional\b/gi,'意志形').replace(/\bnegative\b/gi,'否定形')
 .replace(/\bform\b/gi,'形').replace(/\bpolite\b/gi,'礼貌形').replace(/\bpast\b/gi,'过去形');
}
function hash(s){let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0}
function shuffled(arr,seed){
 const out=arr.slice(),r=(n)=>hash(seed+'-'+n);
 for(let i=out.length-1;i>0;i--){const j=r(i)%(i+1),t=out[i];out[i]=out[j];out[j]=t}return out;
}
function distractors(rows,answer,seed,example){
 const chosen=[answer],used=new Set([visible(answer)]),glosses=new Set([answer[2]]),target=terms(answer[1]);
 const choices=shuffled(rows.filter(x=>x!==answer),seed);
 // Avoid synonyms and structures already present in the sentence whenever possible.
 const accepted=c=>c!==answer&&!used.has(visible(c))&&!glosses.has(c[2])&&
  !(String(example||'').includes(visible(c))&&visible(c).length>=2)&&
  ((c[2].length>=4&&answer[2].length>=4)?c[2].slice(0,4)!==answer[2].slice(0,4):true);
 for(const c of choices){if(accepted(c)){chosen.push(c);used.add(visible(c));glosses.add(c[2]);if(chosen.length===4)break}}
 if(chosen.length<4)for(const c of choices){if(!used.has(visible(c))){chosen.push(c);used.add(visible(c));if(chosen.length===4)break}}
 if(chosen.length!==4)throw Error('Could not select four unique options for '+answer[0]);
 return shuffled(chosen,seed+'options');
}
function asQ(r,level,idx,mode,all){
 const example=r[5][idx%3],ja=example[0],en=example[1]||'',label=visible(r);
 const matched=terms(r[1]).find(t=>t.length>=2&&ja.includes(t));
 const options=distractors(all,r,r[0]+':'+idx+':'+mode,mode==='example'?ja:'');
 let query,identifier;
 if(mode==='example'){
  query=matched?
   '例句中【】标出的部分，对应哪一个语法点？\n'+ja.replace(matched,'【'+matched+'】'):
   '下面的例句主要体现哪一个语法结构？\n'+ja;
  identifier='bulk-grammar-'+level.toLowerCase()+'-ex-'+r[0]+'-'+(idx+1);
 }else{
  query='下面哪一个日语语法点，最符合中文含义「'+r[2]+'」？';
  identifier='bulk-grammar-'+level.toLowerCase()+'-sem-'+r[0];
 }
 const answerIndex=options.findIndex(x=>x[0]===r[0]);
 if(answerIndex<0||answerIndex>3)throw Error('Invalid answer index for '+identifier);
 const opt=options.map(row=>{
  const right=row[0]===r[0],prefix='「'+visible(row)+'」的主要意思是「'+row[2]+'」。';
  const why=right?
   prefix+'与本题的例句或所问语义相符。':
   prefix+'而目标语法「'+label+'」主要表示「'+r[2]+'」，二者的表达重点不同。';
  return [visible(row),row[2],why];
 });
 const source='例句原数据的英文参考：'+en;
 return {
  id:identifier,l:level,t:'grammar',
  q:query,zh:'本题目标语法为「'+label+'」，中文核心意思是「'+r[2]+'」。'+(mode==='example'?source:''),
  o:opt,a:answerIndex,
  pattern:label+'；接续参考：'+translateFormation(r[4]),
  tip:'重点语法「'+label+'」表示「'+r[2]+'」。请结合例句和接续理解。'+(mode==='meaning'?'题型：语法含义辨析。':'题型：例句语法辨认。'),
  mix:'易混：'+opt.filter((_,i)=>i!==answerIndex).slice(0,3).map(x=>'「'+x[0]+'」表示「'+x[1]+'」').join('；')+'。',
  ex:ja,exzh:'英文译文（原开源数据）：'+en,
  vocab:options.map(x=>[visible(x),'语法含义：'+x[2]]),
  source:'jkindrix-japanese-language-data',
  generated:true,mode,sourceId:r[0]
 };
}
function produce(rows,level){
 if(!Array.isArray(rows)||!rows.length)throw Error('Missing grammar source for '+level);
 const result=[];
 for(const r of rows)for(let j=0;j<3;j++)result.push(asQ(r,level,j,'example',rows));
 const remaining=500-result.length;
 if(remaining<0||remaining>rows.length)throw Error('Unbalanced grammar source for '+level+': '+remaining);
 const indices=shuffled(rows,level+'-supplements-20261016').slice(0,remaining);
 for(const r of indices)result.push(asQ(r,level,0,'meaning',rows));
 if(result.length!==500)throw Error('Expected 500 items, got '+result.length);
 return result;
}
window.buildJLPTGrammarBank=function(){
 const n2=produce(input.N2,'N2'),n3=produce(input.N3,'N3');
 return n2.concat(n3);
};
window.JLPT_GRAMMAR_GENERATED_INFO={n2Patterns:input.N2.length,n3Patterns:input.N3.length,
 n2SentenceDrills:input.N2.length*3,n3SentenceDrills:input.N3.length*3,
 n2MeaningDrills:500-input.N2.length*3,n3MeaningDrills:500-input.N3.length*3};
})();